import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Minus,
  Plus,
  ReceiptText,
  Send,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletCard } from "@/components/bank/WalletCard";
import { FundsDialog } from "@/components/bank/FundsDialog";
import { TransactionRow } from "@/components/bank/TransactionRow";
import {
  displayName,
  formatMoney,
  type Transaction,
} from "@/components/bank/format";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function monthTotals(transactions: Transaction[]) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  let inCents = 0;
  let outCents = 0;
  for (const tx of transactions) {
    if (tx.createdAt < monthStart) continue;
    if (tx.direction === "in") inCents += tx.amountCents;
    else outCents += tx.amountCents;
  }
  return { inCents, outCents };
}

/** Simple last-7-days in/out bar chart built with divs. */
function WeeklyActivity({ transactions }: { transactions: Transaction[] }) {
  const days = useMemo(() => {
    const now = new Date();
    const out: { label: string; inCents: number; outCents: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = day.getTime();
      const end = start + 86_400_000;
      let inCents = 0;
      let outCents = 0;
      for (const tx of transactions) {
        if (tx.createdAt >= start && tx.createdAt < end) {
          if (tx.direction === "in") inCents += tx.amountCents;
          else outCents += tx.amountCents;
        }
      }
      out.push({
        label: format(day, "EEE"),
        inCents,
        outCents,
      });
    }
    return out;
  }, [transactions]);

  const max = Math.max(1, ...days.map((d) => Math.max(d.inCents, d.outCents)));

  return (
    <div className="flex h-40 items-end justify-between gap-3 sm:gap-5">
      {days.map((day) => (
        <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-28 w-full items-end justify-center gap-1">
            <div
              title={`In: ${formatMoney(day.inCents)}`}
              className="w-2.5 rounded-full bg-primary/80 transition-all sm:w-3"
              style={{ height: `${Math.max(3, (day.inCents / max) * 100)}%` }}
            />
            <div
              title={`Out: ${formatMoney(day.outCents)}`}
              className="w-2.5 rounded-full bg-muted-foreground/25 transition-all sm:w-3"
              style={{ height: `${Math.max(3, (day.outCents / max) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {day.label}
          </span>
        </div>
      ))}
    </div>
  );
}

const quickActions = [
  { key: "send", label: "Send money", icon: Send },
  { key: "bills", label: "Pay bills", icon: ReceiptText },
  { key: "add", label: "Add money", icon: Plus },
  { key: "withdraw", label: "Withdraw", icon: Minus },
] as const;

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const wallet = useQuery(api.wallets.getMyWallet);
  const transactions = useQuery(api.transactions.list, { limit: 100 });
  const [fundsMode, setFundsMode] = useState<"add" | "withdraw" | null>(null);

  const totals = useMemo(
    () => monthTotals(transactions ?? []),
    [transactions],
  );
  const recent = transactions?.slice(0, 5) ?? [];

  const handleQuickAction = (key: (typeof quickActions)[number]["key"]) => {
    if (key === "send") navigate("/dashboard/payments");
    else if (key === "bills") navigate("/dashboard/payments?tab=bills");
    else if (key === "add") setFundsMode("add");
    else setFundsMode("withdraw");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting()}, {displayName(user).split(" ")[0]}
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="hidden items-center gap-1.5 sm:inline-flex"
          onClick={() => navigate("/dashboard/transactions")}
        >
          View all transactions
          <ArrowRight className="size-3.5" />
        </Button>
      </div>

      {/* Balance + quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {wallet === undefined ? (
            <Skeleton className="h-56 w-full rounded-3xl" />
          ) : (
            <WalletCard
              balanceCents={wallet?.balanceCents ?? 0}
              accountNumber={wallet?.accountNumber}
              holder={displayName(user)}
            />
          )}

          <Card className="rounded-2xl border border-border/70 shadow-card">
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-4 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.key}
                    type="button"
                    onClick={() => handleQuickAction(action.key)}
                    className="group flex flex-col items-center gap-2 rounded-xl px-1 py-3 text-center transition-colors hover:bg-muted/60"
                  >
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <action.icon className="size-5" />
                    </span>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* This month */}
        <Card className="rounded-2xl border border-border/70 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base tracking-tight">This month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Net change
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                {formatMoney(totals.inCents - totals.outCents)}
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <ArrowDownLeft className="size-4" />
                  </span>
                  Money in
                </span>
                <span className="text-sm font-semibold tabular-nums text-primary">
                  +{formatMoney(totals.inCents)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <ArrowUpRight className="size-4" />
                  </span>
                  Money out
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  −{formatMoney(totals.outCents)}
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">
                Spending rate
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">
                {totals.inCents > 0
                  ? `${Math.round((totals.outCents / Math.max(totals.inCents, 1)) * 100)}%`
                  : "—"}{" "}
                of money in spent
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity + Recent */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border border-border/70 shadow-card lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base tracking-tight">
              Weekly activity
            </CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-primary" />
                In
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingDown className="size-3.5" />
                Out
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <WeeklyActivity transactions={transactions ?? []} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/70 shadow-card">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base tracking-tight">
              Recent activity
            </CardTitle>
            <button
              type="button"
              onClick={() => navigate("/dashboard/transactions")}
              className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              View all
            </button>
          </CardHeader>
          <CardContent className="px-3 pb-2">
            {recent.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No activity yet — try sending money or paying a bill.
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {recent.map((tx) => (
                  <TransactionRow key={tx._id} tx={tx} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment method hint */}
      <Card className="flex items-center gap-4 rounded-2xl border border-dashed border-border bg-card/60 p-5 shadow-none">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <CreditCard className="size-5" />
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Demo tip:</span> sign in
          with two accounts to see instant person-to-person transfers, or add
          funds to try bill payments.
        </p>
      </Card>

      <FundsDialog
        mode={fundsMode ?? "add"}
        open={fundsMode !== null}
        onOpenChange={(open) => !open && setFundsMode(null)}
        balanceCents={wallet?.balanceCents ?? 0}
      />
    </div>
  );
}
