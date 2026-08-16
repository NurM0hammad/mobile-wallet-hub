import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { ArrowLeftRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionRow } from "@/components/bank/TransactionRow";
import {
  dayGroupLabel,
  formatMoney,
  type Transaction,
} from "@/components/bank/format";
import { cn } from "@/lib/utils";

const filters = [
  { key: "all", label: "All" },
  { key: "in", label: "Money in" },
  { key: "out", label: "Money out" },
  { key: "bills", label: "Bills & services" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

function matchesFilter(tx: Transaction, filter: FilterKey): boolean {
  switch (filter) {
    case "in":
      return tx.direction === "in";
    case "out":
      return tx.direction === "out";
    case "bills":
      return tx.kind === "bill_payment";
    default:
      return true;
  }
}

export default function Transactions() {
  const transactions = useQuery(api.transactions.list, { limit: 200 });
  const [filter, setFilter] = useState<FilterKey>("all");

  const groups = useMemo(() => {
    const filtered = (transactions ?? []).filter((tx) =>
      matchesFilter(tx, filter),
    );
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const label = dayGroupLabel(tx.createdAt);
      const list = map.get(label);
      if (list) list.push(tx);
      else map.set(label, [tx]);
    }
    return Array.from(map.entries());
  }, [transactions, filter]);

  const totalIn = useMemo(
    () =>
      (transactions ?? [])
        .filter((tx) => tx.direction === "in")
        .reduce((sum, tx) => sum + tx.amountCents, 0),
    [transactions],
  );
  const totalOut = useMemo(
    () =>
      (transactions ?? [])
        .filter((tx) => tx.direction === "out")
        .reduce((sum, tx) => sum + tx.amountCents, 0),
    [transactions],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Full ledger</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Transactions
          </h1>
        </div>
        <div className="flex items-center gap-5 text-sm tabular-nums">
          <span className="text-muted-foreground">
            In{" "}
            <span className="font-semibold text-primary">
              +{formatMoney(totalIn)}
            </span>
          </span>
          <span className="text-muted-foreground">
            Out{" "}
            <span className="font-semibold">−{formatMoney(totalOut)}</span>
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {transactions === undefined ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      ) : groups.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center shadow-none">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <ArrowLeftRight className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium">No transactions here yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Send money, pay a bill, or add funds to get started.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map(([label, items]) => (
            <section key={label}>
              <div className="mb-1 flex items-center gap-3 px-1">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </h2>
                <div className="h-px flex-1 bg-border/60" />
              </div>
              <Card className="rounded-2xl border border-border/70 shadow-card">
                <ul className="divide-y divide-border/60 px-4 py-2 sm:px-5">
                  {items.map((tx) => (
                    <TransactionRow key={tx._id} tx={tx} showBalance />
                  ))}
                </ul>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
