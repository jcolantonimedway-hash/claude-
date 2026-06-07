"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Clock, DollarSign, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { UseCaseCard } from "@/components/usecases/use-case-card";
import { UseCaseDetail } from "@/components/usecases/use-case-detail";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import type { Agency, UseCase } from "@/lib/types";

interface AgencyExplorerProps {
  agencies: Agency[];
  useCases: UseCase[];
  initialId?: string;
}

export function AgencyExplorer({
  agencies,
  useCases,
  initialId,
}: AgencyExplorerProps) {
  const initial =
    agencies.find((a) => a.id === initialId)?.id ?? agencies[0]?.id;
  const [activeId, setActiveId] = useState(initial);
  const [selected, setSelected] = useState<UseCase | null>(null);

  const active = agencies.find((a) => a.id === activeId)!;
  const agencyCases = useCases.filter((u) => u.agencyId === activeId);
  const totalValue = agencyCases.reduce((s, u) => s + u.annualSavings, 0);
  const totalHours = agencyCases.reduce((s, u) => s + u.annualHoursSaved, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Agency list */}
      <div className="lg:col-span-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:sticky lg:top-20 lg:grid-cols-1">
          {agencies.map((agency) => {
            const count = useCases.filter(
              (u) => u.agencyId === agency.id,
            ).length;
            const isActive = agency.id === activeId;
            return (
              <button
                key={agency.id}
                onClick={() => setActiveId(agency.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                  isActive
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border bg-card hover:border-primary/30 hover:bg-muted/50",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon name={agency.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {agency.abbr}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {count} {count === 1 ? "opportunity" : "opportunities"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      <div className="lg:col-span-8">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-muted/30 p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
                  <Icon name={active.icon} className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {active.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {active.blurb}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                  icon={<Users className="h-4 w-4" />}
                  label="Employees"
                  value={formatNumber(active.employees)}
                />
                <Stat
                  icon={<Building2 className="h-4 w-4" />}
                  label="Annual requests"
                  value={formatNumber(active.annualRequests)}
                />
                <Stat
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Modeled value"
                  value={`${formatCurrency(totalValue)}/yr`}
                />
                <Stat
                  icon={<Clock className="h-4 w-4" />}
                  label="Hours saved"
                  value={`${formatNumber(totalHours)}/yr`}
                />
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">
                    AI readiness
                  </span>
                  <span className="font-semibold text-foreground">
                    {active.readiness}/100
                  </span>
                </div>
                <Progress value={active.readiness} />
              </div>
            </div>

            <CardContent className="p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Tailored AI opportunities
              </h3>
              {agencyCases.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {agencyCases.map((u, i) => (
                    <UseCaseCard
                      key={u.id}
                      useCase={u}
                      index={i}
                      onSelect={setSelected}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Opportunities for this agency are being scoped.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <UseCaseDetail useCase={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}
