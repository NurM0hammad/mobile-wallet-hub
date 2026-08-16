import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Demo starting balance: $2,450.00
export const STARTING_BALANCE_CENTS = 245_000;
export const MIN_AMOUNT_CENTS = 1;
export const MAX_AMOUNT_CENTS = 100_000_000; // $1,000,000.00

const DEMO_WELCOME_NOTE = "Welcome bonus";

function generateAccountNumber(): string {
  // 10-digit account number, demo-grade randomness is fine here
  return String(Math.floor(1_000_000_000 + Math.random() * 9_000_000_000));
}

/** Get the current user's wallet, or null if they don't have one yet. */
export const getMyWallet = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user === null) {
      return null;
    }
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    return wallet;
  },
});

/**
 * Create the user's wallet if it doesn't exist yet, seeding it with demo
 * funds and a welcome deposit entry. Safe to call repeatedly.
 */
export const ensureWallet = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user === null) {
      throw new ConvexError({ code: "unauthorized" });
    }

    const existing = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (existing) {
      return existing;
    }

    const now = Date.now();
    const walletId = await ctx.db.insert("wallets", {
      userId: user._id,
      balanceCents: STARTING_BALANCE_CENTS,
      currency: "USD",
      accountNumber: generateAccountNumber(),
      createdAt: now,
    });
    await ctx.db.insert("transactions", {
      userId: user._id,
      kind: "deposit",
      direction: "in",
      amountCents: STARTING_BALANCE_CENTS,
      balanceAfterCents: STARTING_BALANCE_CENTS,
      note: DEMO_WELCOME_NOTE,
      createdAt: now,
    });
    return await ctx.db.get(walletId);
  },
});

function assertValidAmount(amountCents: number) {
  if (
    !Number.isInteger(amountCents) ||
    amountCents < MIN_AMOUNT_CENTS ||
    amountCents > MAX_AMOUNT_CENTS
  ) {
    throw new ConvexError({ code: "invalid-amount" });
  }
}

/** Demo top-up: adds money to the wallet and records a deposit. */
export const addFunds = mutation({
  args: { amountCents: v.number() },
  handler: async (ctx, { amountCents }) => {
    const user = await getCurrentUser(ctx);
    if (user === null) {
      throw new ConvexError({ code: "unauthorized" });
    }
    assertValidAmount(amountCents);

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (!wallet) {
      throw new ConvexError({ code: "no-wallet" });
    }

    const balanceAfter = wallet.balanceCents + amountCents;
    await ctx.db.patch(wallet._id, { balanceCents: balanceAfter });
    await ctx.db.insert("transactions", {
      userId: user._id,
      kind: "deposit",
      direction: "in",
      amountCents,
      balanceAfterCents: balanceAfter,
      note: "Added funds",
      createdAt: Date.now(),
    });
    return { balanceAfterCents: balanceAfter };
  },
});

/** Demo withdrawal: removes money from the wallet and records it. */
export const withdraw = mutation({
  args: { amountCents: v.number() },
  handler: async (ctx, { amountCents }) => {
    const user = await getCurrentUser(ctx);
    if (user === null) {
      throw new ConvexError({ code: "unauthorized" });
    }
    assertValidAmount(amountCents);

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
      kind: "withdrawal",
      direction: "out",
      amountCents,
      balanceAfterCents: balanceAfter,
      note: "Withdrawal to linked account",
      createdAt: Date.now(),
    });
    return { balanceAfterCents: balanceAfter };
  },
});
