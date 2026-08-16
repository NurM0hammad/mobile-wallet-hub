import { useId } from "react";
import { cn } from "@/lib/utils";

/** Geometric brand mark — three rising bars on a teal gradient tile. */
export function BrandMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f4f49" />
          <stop offset="100%" stopColor="#0ea5a0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <rect x="8" y="14" width="3.4" height="10" rx="1.7" fill="white" opacity="0.55" />
      <rect x="14.3" y="9.5" width="3.4" height="14.5" rx="1.7" fill="white" />
      <rect x="20.6" y="5.5" width="3.4" height="18.5" rx="1.7" fill="white" opacity="0.85" />
    </svg>
  );
}

export function Brand({
  className,
  markClassName,
  light = false,
}: {
  className?: string;
  markClassName?: string;
  light?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className={cn("size-8 shrink-0", markClassName)} />
      <span
        className={cn(
          "text-[17px] font-semibold tracking-tight",
          light ? "text-white" : "text-foreground",
        )}
      >
        Meridian
      </span>
    </span>
  );
}
