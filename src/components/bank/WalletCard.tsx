import { Nfc } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "./format";
import { BrandMark } from "./Brand";

export function WalletCard({
  balanceCents,
  accountNumber,
  holder,
  className,
}: {
  balanceCents: number;
  accountNumber?: string;
  holder?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-[#0c2322] p-6 text-white shadow-lift sm:p-7",
        className,
      )}
    >
      {/* layered glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 90% at 85% -10%, oklch(0.72 0.1 178 / 0.55), transparent 55%), radial-gradient(70% 70% at -10% 110%, oklch(0.55 0.12 178 / 0.35), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(60% 60% at 70% 20%, black, transparent)",
        }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2">
          <BrandMark className="size-6" />
          <span className="text-xs font-semibold tracking-[0.22em] text-white/90">
            MERIDIAN
          </span>
        </div>
        <Nfc className="size-5 text-white/60" />
      </div>

      <p className="relative mt-7 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
        Available balance
      </p>
      <p className="relative mt-1.5 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
        {formatMoney(balanceCents)}
      </p>

      <div className="relative mt-8 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
            Card holder
          </p>
          <p className="mt-0.5 text-sm font-medium text-white/95">
            {holder ?? "Meridian Member"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
            Account
          </p>
          <p className="mt-0.5 font-mono text-sm tracking-[0.14em] text-white/95">
            {accountNumber ? `•••• ${accountNumber.slice(-4)}` : "•••• ••••"}
          </p>
        </div>
      </div>
    </div>
  );
}
