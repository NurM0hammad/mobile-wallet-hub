import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

// kinds of ledger entries a wallet can have
export const TRANSACTION_KINDS = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  TRANSFER_IN: "transfer_in",
  TRANSFER_OUT: "transfer_out",
  BILL_PAYMENT: "bill_payment",
} as const;

export const transactionKindValidator = v.union(
  v.literal(TRANSACTION_KINDS.DEPOSIT),
  v.literal(TRANSACTION_KINDS.WITHDRAWAL),
  v.literal(TRANSACTION_KINDS.TRANSFER_IN),
  v.literal(TRANSACTION_KINDS.TRANSFER_OUT),
  v.literal(TRANSACTION_KINDS.BILL_PAYMENT),
);
export type TransactionKind = Infer<typeof transactionKindValidator>;

// direction relative to the wallet owner
export const DIRECTION = {
  IN: "in",
  OUT: "out",
} as const;

export const directionValidator = v.union(
  v.literal(DIRECTION.IN),
  v.literal(DIRECTION.OUT),
);
export type Direction = Infer<typeof directionValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // one wallet per user, holds the current balance
    wallets: defineTable({
      userId: v.id("users"),
      balanceCents: v.number(),
      currency: v.string(),
      accountNumber: v.string(),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // ledger of every money movement, written per-participant
    transactions: defineTable({
      userId: v.id("users"),
      kind: transactionKindValidator,
      direction: directionValidator,
      amountCents: v.number(),
      balanceAfterCents: v.number(),
      counterpartyEmail: v.optional(v.string()),
      counterpartyName: v.optional(v.string()),
      note: v.optional(v.string()),
      merchant: v.optional(v.string()),
      refId: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_user_time", ["userId", "createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
