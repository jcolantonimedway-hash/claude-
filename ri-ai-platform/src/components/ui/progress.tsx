"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0–100
  className?: string;
  barClassName?: string;
}

export function Progress({ value, className, barClassName }: ProgressProps) {
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn("h-full rounded-full bg-primary", barClassName)}
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </div>
  );
}

interface RingProps {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}

/** A circular readiness gauge. */
export function Ring({
  value,
  size = 132,
  stroke = 12,
  label,
  sublabel,
}: RingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight text-foreground">
          {label ?? clamped}
        </span>
        {sublabel && (
          <span className="text-xs font-medium text-muted-foreground">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
