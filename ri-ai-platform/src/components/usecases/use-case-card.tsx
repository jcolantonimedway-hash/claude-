"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, RiskBadge, PhaseBadge } from "@/components/ui/badge";
import { getAgency } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import type { UseCase } from "@/lib/types";

interface UseCaseCardProps {
  useCase: UseCase;
  onSelect: (useCase: UseCase) => void;
  index?: number;
}

export function UseCaseCard({ useCase, onSelect, index = 0 }: UseCaseCardProps) {
  const agency = getAgency(useCase.agencyId);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      onClick={() => onSelect(useCase)}
      className="group text-left focus:outline-none"
    >
      <Card className="flex h-full flex-col p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-card group-focus-visible:ring-2 group-focus-visible:ring-primary">
        <div className="flex items-start justify-between gap-3">
          <Badge tone="navy">{agency?.abbr}</Badge>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
        <h3 className="mt-3 text-base font-semibold leading-snug tracking-tight">
          {useCase.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {useCase.summary}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <RiskBadge level={useCase.risk} />
          <PhaseBadge phase={useCase.phase} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div>
            <p className="text-xs text-muted-foreground">Est. annual value</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(useCase.annualSavings)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Hours saved</p>
            <p className="text-sm font-semibold text-foreground">
              {useCase.annualHoursSaved.toLocaleString()}/yr
            </p>
          </div>
        </div>
      </Card>
    </motion.button>
  );
}
