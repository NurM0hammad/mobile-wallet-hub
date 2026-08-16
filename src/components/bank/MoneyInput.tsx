import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MoneyInput({
  value,
  onChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-medium text-muted-foreground">
        $
      </span>
      <Input
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.00"
        className="h-12 pl-8 pr-4 text-lg font-medium tabular-nums"
        value={value}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, "");
          onChange(raw);
        }}
        {...props}
      />
    </div>
  );
}
