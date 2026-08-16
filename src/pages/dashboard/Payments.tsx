import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  Droplets,
  Home,
  Loader2,
  Mail,
  Smartphone,
  StickyNote,
  Tv,
  Wifi,
  Zap,
} from "lucide-react";
import { useSearchParams } from "react-router";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoneyInput } from "@/components/bank/MoneyInput";
import {
  formatMoney,
  handleError,
  parseDollarsToCents,
} from "@/components/bank/format";

const merchants = [
  { name: "City Power Co.", category: "Electricity", icon: Zap, tint: "text-amber-600 bg-amber-500/10" },
  { name: "FiberNet Broadband", category: "Internet", icon: Wifi, tint: "text-sky-600 bg-sky-500/10" },
  { name: "Volt Mobile", category: "Mobile top-up", icon: Smartphone, tint: "text-violet-600 bg-violet-500/10" },
  { name: "Aqua Utilities", category: "Water", icon: Droplets, tint: "text-cyan-600 bg-cyan-500/10" },
  { name: "StreamPlus", category: "Streaming", icon: Tv, tint: "text-rose-600 bg-rose-500/10" },
  { name: "Northline Property", category: "Rent", icon: Home, tint: "text-emerald-600 bg-emerald-500/10" },
] as const;

const BILL_PRESETS = [25, 50, 100, 200];

function SendMoneyForm() {
  const sendMoney = useMutation(api.transactions.sendMoney);
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cents = useMemo(() => parseDollarsToCents(amount), [amount]);
  const canSubmit = Boolean(email.trim() && cents !== null && !isSubmitting);

  const submit = async () => {
    if (!cents) {
      toast.error("Enter a valid amount.");
      return;
    }
    setIsSubmitting(true);
    try {
      await sendMoney({ recipientEmail: email.trim(), amountCents: cents, note: note.trim() || undefined });
      toast.success(`Sent ${formatMoney(cents)} to ${email.trim()}.`);
      setEmail("");
      setAmount("");
      setNote("");
    } catch (e) {
      const { message } = handleError(e);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="rounded-2xl border border-border/70 shadow-card">
        <CardHeader>
          <CardTitle className="text-base tracking-tight">Send money</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="recipient-email"
              className="text-sm font-medium text-foreground"
            >
              Recipient&apos;s Meridian email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="recipient-email"
                type="email"
                placeholder="ava@example.com"
                className="h-12 pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="send-amount" className="text-sm font-medium text-foreground">
              Amount
            </label>
            <MoneyInput
              id="send-amount"
              value={amount}
              onChange={setAmount}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="send-note" className="text-sm font-medium text-foreground">
              Note <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <div className="relative">
              <StickyNote className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="send-note"
                placeholder="Rent split, dinner, thanks…"
                className="h-12 pl-9"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={80}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full rounded-xl"
            onClick={submit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              `Send ${cents ? formatMoney(cents) : "money"}`
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="h-fit rounded-2xl border border-border/70 bg-muted/40 shadow-none">
        <CardHeader>
          <CardTitle className="text-base tracking-tight">Transfer summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">You send</span>
            <span className="font-semibold tabular-nums">
              {cents ? formatMoney(cents) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Transfer fee</span>
            <span className="font-medium text-primary">$0.00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Recipient gets</span>
            <span className="font-semibold tabular-nums">
              {cents ? formatMoney(cents) : "—"}
            </span>
          </div>
          <p className="rounded-xl bg-card p-3 text-xs leading-relaxed text-muted-foreground">
            Transfers are instant between Meridian accounts. The recipient just
            needs an account with the same email — try a second sign-in to test.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function BillDialog({
  merchant,
  open,
  onOpenChange,
}: {
  merchant: (typeof merchants)[number] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const payBill = useMutation(api.transactions.payBill);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!merchant) return;
    const cents = parseDollarsToCents(amount);
    if (cents === null) {
      toast.error("Enter a valid amount.");
      return;
    }
    setIsSubmitting(true);
    try {
      await payBill({ merchant: merchant.name, amountCents: cents });
      toast.success(`Paid ${merchant.name} ${formatMoney(cents)}.`);
      setAmount("");
      onOpenChange(false);
    } catch (e) {
      const { message } = handleError(e);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setAmount("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay {merchant?.name}</DialogTitle>
          <DialogDescription>
            {merchant?.category} · Instant from your Meridian wallet
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {BILL_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant="outline"
              size="sm"
              className="tabular-nums"
              onClick={() => setAmount(String(preset))}
            >
              ${preset}
            </Button>
          ))}
        </div>
        <MoneyInput
          value={amount}
          onChange={setAmount}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void submit();
            }
          }}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              `Pay ${amount ? formatMoney(parseDollarsToCents(amount) ?? 0) : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Payments() {
  const wallet = useQuery(api.wallets.getMyWallet);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeBill, setActiveBill] = useState<
    (typeof merchants)[number] | null
  >(null);

  const tab = searchParams.get("tab") === "bills" ? "bills" : "send";
  const setTab = (value: string) => {
    setSearchParams(value === "bills" ? { tab: "bills" } : {}, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Move money your way</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Payments
        </h1>
      </div>

      {wallet && (
        <p className="text-sm text-muted-foreground">
          Available balance:{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {formatMoney(wallet.balanceCents)}
          </span>
        </p>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="send" className="rounded-lg">
            Send money
          </TabsTrigger>
          <TabsTrigger value="bills" className="rounded-lg">
            Pay bills
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-6">
          <SendMoneyForm />
        </TabsContent>

        <TabsContent value="bills" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {merchants.map((merchant) => (
              <button
                key={merchant.name}
                type="button"
                onClick={() => setActiveBill(merchant)}
                className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 text-left shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${merchant.tint}`}
                >
                  <merchant.icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {merchant.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {merchant.category}
                  </span>
                </span>
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  Pay
                </span>
              </button>
            ))}
          </div>
          <p className="mt-6 rounded-xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
            Bill payments are demo entries — they settle instantly against your
            wallet balance and show up in your transaction ledger.
          </p>
        </TabsContent>
      </Tabs>

      <BillDialog
        merchant={activeBill}
        open={activeBill !== null}
        onOpenChange={(open) => !open && setActiveBill(null)}
      />
    </div>
  );
}
