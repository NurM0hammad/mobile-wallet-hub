import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { handleError, formatMoney, parseDollarsToCents } from "./format";
import { MoneyInput } from "./MoneyInput";

const QUICK_AMOUNTS = [50, 100, 250, 500];

export function FundsDialog({
  mode,
  open,
  onOpenChange,
  balanceCents,
}: {
  mode: "add" | "withdraw";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balanceCents: number;
}) {
  const isWithdraw = mode === "withdraw";
  const addFunds = useMutation(api.wallets.addFunds);
  const withdraw = useMutation(api.wallets.withdraw);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setAmount("");
    setIsSubmitting(false);
  };

  const submit = async () => {
    const cents = parseDollarsToCents(amount);
    if (cents === null) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (isWithdraw && cents > balanceCents) {
      toast.error("That's more than your available balance.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isWithdraw) {
        await withdraw({ amountCents: cents });
        toast.success(`Withdrew ${formatMoney(cents)} to your linked account.`);
      } else {
        await addFunds({ amountCents: cents });
        toast.success(`${formatMoney(cents)} added to your wallet.`);
      }
      reset();
      onOpenChange(false);
    } catch (e) {
      const { message } = handleError(e);
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isWithdraw ? "Withdraw money" : "Add money"}
          </DialogTitle>
          <DialogDescription>
            {isWithdraw
              ? "Move money from your Meridian wallet to your linked account."
              : "Top up your Meridian wallet. Demo funds land instantly."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((quick) => (
            <Button
              key={quick}
              type="button"
              variant="outline"
              size="sm"
              className="tabular-nums"
              onClick={() => setAmount(String(quick))}
            >
              ${quick}
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

        {isWithdraw && (
          <p className="text-xs text-muted-foreground">
            Available balance:{" "}
            <span className="font-medium tabular-nums text-foreground">
              {formatMoney(balanceCents)}
            </span>
          </p>
        )}

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
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isWithdraw ? "Withdraw" : "Add money"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
