import { format, isSameDay } from "date-fns";
import type { Doc } from "@/convex/_generated/dataModel";

export type Transaction = Doc<"transactions">;
export type Wallet = Doc<"wallets">;

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/** Parse a dollar-amount string ("12.50", "$1,200") into integer cents. */
export function parseDollarsToCents(input: string): number | null {
  const cleaned = input.trim().replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  const cents = Math.round(value * 100);
  if (cents < 1) return null;
  return cents;
}

const errorCopy: Record<string, string> = {
  unauthorized: "Please sign in again.",
  "invalid-amount": "Enter an amount between $0.01 and $1,000,000.00.",
  "invalid-email": "Enter a valid email address.",
  "cannot-send-to-self": "You can't send money to yourself.",
  "recipient-not-found": "No Meridian account found for that email.",
  "no-wallet": "Set up your wallet first.",
  "insufficient-funds": "Insufficient balance for this transfer.",
  "invalid-merchant": "Choose a biller to pay.",
  "invalid-name": "Enter a name to save.",
};

export interface HandledError {
  code: string | null;
  message: string;
}

export function handleError(e: unknown): HandledError {
  const data = (e as { data?: unknown })?.data;
  if (data && typeof data === "object" && "code" in data) {
    const code = String((data as { code: unknown }).code);
    return { code, message: errorCopy[code] ?? code };
  }
  return {
    code: null,
    message:
      e instanceof Error ? e.message : "Something went wrong. Please try again.",
  };
}

export function transactionTitle(tx: Transaction): string {
  switch (tx.kind) {
    case "deposit":
      return tx.note === "Welcome bonus" ? "Welcome bonus" : "Added funds";
    case "withdrawal":
      return "Withdrawal";
    case "transfer_in":
      return tx.counterpartyName ? `From ${tx.counterpartyName}` : "Money received";
    case "transfer_out":
      return tx.counterpartyName ? `To ${tx.counterpartyName}` : "Money sent";
    case "bill_payment":
      return tx.merchant ?? "Bill payment";
  }
}

export function transactionSubtitle(tx: Transaction): string {
  const parts: string[] = [formatWhen(tx.createdAt)];
  if (tx.counterpartyEmail) parts.push(tx.counterpartyEmail);
  if (tx.note && tx.note !== "Welcome bonus" && tx.note !== "Added funds") {
    parts.push(tx.note);
  }
  return parts.join(" · ");
}

export function formatWhen(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  if (isSameDay(date, now)) {
    return `Today, ${format(date, "h:mm a")}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  }
  if (date.getFullYear() === now.getFullYear()) {
    return format(date, "MMM d, h:mm a");
  }
  return format(date, "MMM d, yyyy");
}

export function dayGroupLabel(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  if (isSameDay(date, now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Yesterday";
  return format(date, "EEEE, MMM d");
}

export function displayName(
  user: Pick<Doc<"users">, "name" | "email"> | null | undefined,
): string {
  if (user?.name) return user.name;
  if (user?.email) return user.email.split("@")[0];
  return "Member";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
