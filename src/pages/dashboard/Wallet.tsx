import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Check, Copy, Landmark, Plus, Minus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletCard as BankCard } from "@/components/bank/WalletCard";
import { FundsDialog } from "@/components/bank/FundsDialog";
import { TransactionRow } from "@/components/bank/TransactionRow";
import { displayName, formatMoney } from "@/components/bank/format";

function DetailRow({
  label,
  value,
  mono = false,
  onCopy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={`mt-0.5 truncate text-sm font-medium text-foreground ${
            mono ? "font-mono tabular-nums" : ""
          }`}
        >
          {value}
        </p>
      </div>
      {onCopy && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground"
          aria-label={`Copy ${label}`}
          onClick={onCopy}
        >
          <Copy className="size-4" />
        </Button>
      )}
    </div>
  );
}

export default function Wallet() {
  const { user } = useAuth();
  const wallet = useQuery(api.wallets.getMyWallet);
  const transactions = useQuery(api.transactions.list, { limit: 100 });
  const [fundsMode, setFundsMode] = useState<"add" | "withdraw" | null>(null);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const txs = transactions ?? [];
    return {
      inCents: txs
        .filter((tx) => tx.direction === "in")
        .reduce((sum, tx) => sum + tx.amountCents, 0),
      outCents: txs
        .filter((tx) => tx.direction === "out")
        .reduce((sum, tx) => sum + tx.amountCents, 0),
    };
  }, [transactions]);

  const fundMoves = useMemo(
    () =>
      (transactions ?? []).filter(
        (tx) => tx.kind === "deposit" || tx.kind === "withdrawal",
      ).slice(0, 4),
    [transactions],
  );

  const copyAccount = async () => {
    if (!wallet?.accountNumber) return;
    try {
      await navigator.clipboard.writeText(wallet.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Your money, your card</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Wallet
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {wallet === undefined ? (
            <Skeleton className="h-64 w-full rounded-3xl" />
          ) : (
            <BankCard
              balanceCents={wallet?.balanceCents ?? 0}
              accountNumber={wallet?.accountNumber}
              holder={displayName(user)}
            />
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="rounded-xl"
              onClick={() => setFundsMode("add")}
            >
              <Plus className="size-4" />
              Add money
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl"
              onClick={() => setFundsMode("withdraw")}
            >
              <Minus className="size-4" />
              Withdraw
            </Button>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-2xl border border-border/70 shadow-card">
            <CardHeader className="pb-1">
              <CardTitle className="text-base tracking-tight">
                Account details
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/60">
              <DetailRow
                label="Account number"
                value={wallet?.accountNumber ?? "—"}
                mono
                onCopy={wallet?.accountNumber ? copyAccount : undefined}
              />
              <DetailRow label="Sort code" value="04-00-19" mono />
              <DetailRow label="Currency" value="USD (United States Dollar)" />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/70 shadow-card">
            <CardHeader className="pb-1">
              <CardTitle className="text-base tracking-tight">
                Lifetime totals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-accent/60 p-3.5">
                <span className="flex items-center gap-2 text-sm font-medium text-accent-foreground">
                  <Landmark className="size-4" />
                  Deposits
                </span>
                <span className="text-sm font-semibold tabular-nums text-accent-foreground">
                  +{formatMoney(stats.inCents)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3.5">
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Landmark className="size-4" />
                  Withdrawals & spending
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  −{formatMoney(stats.outCents)}
                </span>
              </div>
            </CardContent>
          </Card>

          {copied && (
            <p className="flex items-center gap-1.5 text-sm text-primary">
              <Check className="size-4" />
              Account number copied
            </p>
          )}
        </div>
      </div>

      {fundMoves.length > 0 && (
        <Card className="rounded-2xl border border-border/70 shadow-card">
          <CardHeader className="pb-1">
            <CardTitle className="text-base tracking-tight">
              Recent add &amp; withdraw activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-2">
            <ul className="divide-y divide-border/60">
              {fundMoves.map((tx) => (
                <TransactionRow key={tx._id} tx={tx} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <FundsDialog
        mode={fundsMode ?? "add"}
        open={fundsMode !== null}
        onOpenChange={(open) => !open && setFundsMode(null)}
        balanceCents={wallet?.balanceCents ?? 0}
      />
    </div>
  );
}
