import * as React from "react";
import { cn } from "@/lib/utils";
import type { Complexity, RiskLevel } from "@/lib/types";

const tones = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  navy: "bg-primary/10 text-primary border-primary/15",
  accent: "bg-accent/10 text-accent border-accent/15",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof tones;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const riskTone: Record<RiskLevel, BadgeProps["tone"]> = {
  Low: "success",
  Medium: "warning",
  High: "danger",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <Badge tone={riskTone[level]}>{level} risk</Badge>;
}

export function ComplexityBadge({ level }: { level: Complexity }) {
  return <Badge tone="neutral">{level} complexity</Badge>;
}

export function PhaseBadge({ phase }: { phase: 1 | 2 | 3 | 4 }) {
  return <Badge tone="navy">Phase {phase}</Badge>;
}
