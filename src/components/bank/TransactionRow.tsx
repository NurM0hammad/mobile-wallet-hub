import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  ReceiptText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatMoney,
  transactionSubtitle,
  transactionTitle,
  type Transaction,
} from "./format";

function RowIcon({ tx }: { tx: Transaction }) {
  if (tx.kind === "bill_payment") {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
        <ReceiptText className="size-[18px]" />
      </span>
    );
  }
  if (tx.kind === "withdrawal") {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
        <Landmark className="size-[18px]" />
      </span>
    );
  }
  const inbound = tx.direction === "in";
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl",
        inbound
          ? "bg-accent text-accent-foreground"
          : "bg-muted text-muted-foreground",
      )}
    >
      {inbound ? (
        <ArrowDownLeft className="size-[18px]" />
      ) : (
        <ArrowUpRight className="size-[18px]" />
      )}
    </span>
  );
}

export function TransactionRow({
  tx,
  showBalance = false,
}: {
  tx: Transaction;
  showBalance?: boolean;
}) {
  const inbound = tx.direction === "in";
  return (
    <li className="flex items-center gap-3.5 px-1 py-3">
      <RowIcon tx={tx} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {transactionTitle(tx)}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {transactionSubtitle(tx)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            inbound ? "text-primary" : "text-foreground",
          )}
        >
          {inbound ? "+" : "−"}
          {formatMoney(tx.amountCents)}
        </p>
        {showBalance && (
          <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
            {formatMoney(tx.balanceAfterCents)}
          </p>
        )}
      </div>
    </li>
  );
}
