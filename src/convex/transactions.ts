import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { MAX_AMOUNT_CENTS } from "./wallets";

/** Recent transactions for the current user, newest first. */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const user = await getCurrentUser(ctx);
    if (user === null) {
      return [];
    }
    const take = Math.min(Math.max(limit ?? 50, 1), 200);
    return await ctx.db
      .query("transactions")
      .withIndex("by_user_time", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(take);
  },
});

/**
 * Send money from the current user's wallet to another Meridian member,
 * identified by their account email. Writes ledger entries for both sides.
 */
export const sendMoney = mutation({
  args: {
    recipientEmail: v.string(),
    amountCents: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { recipientEmail, amountCents, note }) => {
    const sender = await getCurrentUser(ctx);
    if (sender === null) {
      throw new ConvexError({ code: "unauthorized" });
    }
    if (
      !Number.isInteger(amountCents) ||
      amountCents < 1 ||
      amountCents > MAX_AMOUNT_CENTS
    ) {
      throw new ConvexError({ code: "invalid-amount" });
    }

    const email = recipientEmail.trim().toLowerCase();
    if (!email.includes("@") || !email.includes(".")) {
      throw new ConvexError({ code: "invalid-email" });
    }
    if (sender.email && email === sender.email.toLowerCase()) {
      throw new ConvexError({ code: "cannot-send-to-self" });
    }

    const recipient = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();
    if (!recipient) {
      throw new ConvexError({ code: "recipient-not-found" });
    }

    // Make sure the recipient has a wallet (e.g. a brand new user).
    let recipientWallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", recipient._id))
      .first();
    if (!recipientWallet) {
      const id = await ctx.db.insert("wallets", {
        userId: recipient._id,
        balanceCents: 0,
        currency: "USD",
        accountNumber: String(
          Math.floor(1_000_000_000 + Math.random() * 9_000_000_000),
        ),
        createdAt: Date.now(),
      });
      const created = await ctx.db.get(id);
      if (!created) {
        throw new ConvexError({ code: "no-wallet" });
      }
      recipientWallet = created;
    }

    const senderWallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", sender._id))
      .first();
    if (!senderWallet) {
      throw new ConvexError({ code: "no-wallet" });
    }
    if (senderWallet.balanceCents < amountCents) {
      throw new ConvexError({ code: "insufficient-funds" });
    }

    const now = Date.now();
    const refId = `${sender._id}_${now}`;
    const senderBalanceAfter = senderWallet.balanceCents - amountCents;
    const recipientBalanceAfter = recipientWallet.balanceCents + amountCents;
    const cleanNote = note?.trim();

    await ctx.db.patch(senderWallet._id, { balanceCents: senderBalanceAfter });
    await ctx.db.patch(recipientWallet._id, {
      balanceCents: recipientBalanceAfter,
    });

    await ctx.db.insert("transactions", {
      userId: sender._id,
      kind: "transfer_out",
      direction: "out",
      amountCents,
      balanceAfterCents: senderBalanceAfter,
      counterpartyEmail: email,
      counterpartyName: recipient.name ?? email.split("@")[0],
      note: cleanNote || undefined,
      refId,
      createdAt: now,
    });
    await ctx.db.insert("transactions", {
      userId: recipient._id,
      kind: "transfer_in",
      direction: "in",
      amountCents,
      balanceAfterCents: recipientBalanceAfter,
      counterpartyEmail: sender.email ?? undefined,
      counterpartyName: sender.name ?? "Meridian member",
      note: cleanNote || undefined,
      refId,
      createdAt: now,
    });

    return { balanceAfterCents: senderBalanceAfter };
  },
});

/**
 * Pay a bill to a merchant. Deducts from the wallet and records a
 * bill_payment ledger entry.
 */
export const payBill = mutation({
  args: {
    merchant: v.string(),
    amountCents: v.number(),
    reference: v.optional(v.string()),
  },
  handler: async (ctx, { merchant, amountCents, reference }) => {
    const user = await getCurrentUser(ctx);
    if (user === null) {
      throw new ConvexError({ code: "unauthorized" });
    }
    if (
      !Number.isInteger(amountCents) ||
      amountCents < 1 ||
      amountCents > MAX_AMOUNT_CENTS
    ) {
      throw new ConvexError({ code: "invalid-amount" });
    }
    const cleanMerchant = merchant.trim().slice(0, 60);
    if (!cleanMerchant) {
      throw new ConvexError({ code: "invalid-merchant" });
    }

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (!wallet) {
      throw new ConvexError({ code: "no-wallet" });
    }
    if (wallet.balanceCents < amountCents) {
      throw new ConvexError({ code: "insufficient-funds" });
    }

    const balanceAfter = wallet.balanceCents - amountCents;
    await ctx.db.patch(wallet._id, { balanceCents: balanceAfter });
    await ctx.db.insert("transactions", {
      userId: user._id,
      kind: "bill_payment",
      direction: "out",
      amountCents,
      balanceAfterCents: balanceAfter,
      merchant: cleanMerchant,
      note: reference?.trim() || undefined,
      createdAt: Date.now(),
    });

    return { balanceAfterCents: balanceAfter };
  },
});
