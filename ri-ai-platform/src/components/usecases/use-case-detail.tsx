"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Target,
  Sparkles,
  ShieldCheck,
  UserCheck,
  DollarSign,
  Clock,
  Wrench,
} from "lucide-react";
import {
  Badge,
  RiskBadge,
  ComplexityBadge,
  PhaseBadge,
} from "@/components/ui/badge";
import { getAgency } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import type { UseCase } from "@/lib/types";

interface UseCaseDetailProps {
  useCase: UseCase | null;
  onClose: () => void;
}

export function UseCaseDetail({ useCase, onClose }: UseCaseDetailProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (useCase) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [useCase, onClose]);

  const agency = useCase ? getAgency(useCase.agencyId) : null;

  return (
    <AnimatePresence>
      {useCase && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={useCase.title}
            className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-card sm:rounded-2xl"
            initial={{ y: 40, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/30 p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="navy">{agency?.abbr}</Badge>
                  <Badge>{useCase.category}</Badge>
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight">
                  {useCase.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {agency?.name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-6 overflow-y-auto p-6">
              {/* Metric strip */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Annual value"
                  value={formatCurrency(useCase.annualSavings)}
                />
                <Metric
                  icon={<Clock className="h-4 w-4" />}
                  label="Hours saved"
                  value={`${useCase.annualHoursSaved.toLocaleString()}/yr`}
                />
                <Metric
                  icon={<Wrench className="h-4 w-4" />}
                  label="Est. cost"
                  value={useCase.estCost}
                  small
                />
                <Metric
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Phase"
                  value={`Phase ${useCase.phase}`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <RiskBadge level={useCase.risk} />
                <ComplexityBadge level={useCase.complexity} />
                <PhaseBadge phase={useCase.phase} />
                <Badge tone="accent">{useCase.theme}</Badge>
              </div>

              <Block
                icon={<Target className="h-4 w-4 text-rose-500" />}
                title="The problem"
                body={useCase.problem}
              />
              <Block
                icon={<Sparkles className="h-4 w-4 text-accent" />}
                title="Expected impact"
                body={useCase.expectedImpact}
              />
              <Block
                icon={<UserCheck className="h-4 w-4 text-primary" />}
                title="Required human oversight"
                body={useCase.humanOversight}
              />

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Responsible AI considerations
                  </h3>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {useCase.responsibleAI.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground"
                    >
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Metric({
  icon,
  label,
  value,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={`mt-1 font-semibold tracking-tight text-foreground ${
          small ? "text-xs" : "text-sm"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Block({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-foreground">{body}</p>
    </div>
  );
}
