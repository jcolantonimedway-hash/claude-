"use client";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { CountUp } from "@/components/ui/count-up";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

/** Serializable format tokens so server components can configure the card. */
export type KpiFormat = "int" | "compact" | "currency" | "decimal1";

const formatters: Record<KpiFormat, (n: number) => string> = {
  int: (n) => Math.round(n).toLocaleString(),
  compact: (n) => formatNumber(n),
  currency: (n) => formatCurrency(n),
  decimal1: (n) => n.toFixed(1),
};

interface KpiCardProps {
  label: string;
  value: number;
  icon: string;
  format?: KpiFormat;
  prefix?: string;
  suffix?: string;
  hint?: string;
  className?: string;
}

export function KpiCard({
  label,
  value,
  icon,
  format = "int",
  prefix,
  suffix,
  hint,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("group relative overflow-hidden p-5", className)}>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon name={icon} className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        {prefix && (
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            {prefix}
          </span>
        )}
        <CountUp
          value={value}
          format={formatters[format]}
          className="text-3xl font-semibold tracking-tight text-foreground"
        />
        {suffix && (
          <span className="text-xl font-semibold tracking-tight text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
