"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  Cell,
} from "recharts";
import { UseCaseDetail } from "@/components/usecases/use-case-detail";
import { getAgency } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";
import type { UseCase } from "@/lib/types";

type QuadrantKey = "quick" | "major" | "fill" | "reconsider";

const QUADRANTS: Record<
  QuadrantKey,
  { label: string; blurb: string; color: string; tint: string }
> = {
  quick: {
    label: "Quick Wins",
    blurb: "Low complexity · High impact",
    color: "#059669",
    tint: "rgba(5,150,105,0.06)",
  },
  major: {
    label: "Major Bets",
    blurb: "High complexity · High impact",
    color: "#2563eb",
    tint: "rgba(37,99,235,0.06)",
  },
  fill: {
    label: "Fill-ins",
    blurb: "Low complexity · Lower impact",
    color: "#d97706",
    tint: "rgba(217,119,6,0.05)",
  },
  reconsider: {
    label: "Reconsider",
    blurb: "High complexity · Lower impact",
    color: "#64748b",
    tint: "rgba(100,116,139,0.05)",
  },
};

const median = (nums: number[]) => {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

export function PriorityMatrix({ useCases }: { useCases: UseCase[] }) {
  const [active, setActive] = useState<QuadrantKey | "all">("all");
  const [selected, setSelected] = useState<UseCase | null>(null);

  const { medC, medI } = useMemo(
    () => ({
      medC: median(useCases.map((u) => u.complexityScore)),
      medI: median(useCases.map((u) => u.impactScore)),
    }),
    [useCases],
  );

  const classify = (u: UseCase): QuadrantKey => {
    const highImpact = u.impactScore >= medI;
    const highComplexity = u.complexityScore >= medC;
    if (highImpact && !highComplexity) return "quick";
    if (highImpact && highComplexity) return "major";
    if (!highImpact && !highComplexity) return "fill";
    return "reconsider";
  };

  const points = useMemo(
    () =>
      useCases
        .map((u) => ({ ...u, quadrant: classify(u) }))
        .filter((u) => (active === "all" ? true : u.quadrant === active)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useCases, active, medC, medI],
  );

  const counts = useMemo(() => {
    const c: Record<QuadrantKey, number> = {
      quick: 0,
      major: 0,
      fill: 0,
      reconsider: 0,
    };
    useCases.forEach((u) => (c[classify(u)] += 1));
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCases, medC, medI]);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActive("all")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              active === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            All ({useCases.length})
          </button>
          {(Object.keys(QUADRANTS) as QuadrantKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                style={{ backgroundColor: QUADRANTS[key].color }}
              />
              {QUADRANTS[key].label} ({counts[key]})
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <div className="h-[440px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 16, bottom: 28, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                {/* Quadrant tints */}
                <ReferenceArea x1={0} x2={medC} y1={medI} y2={100} fill={QUADRANTS.quick.tint} fillOpacity={1} />
                <ReferenceArea x1={medC} x2={100} y1={medI} y2={100} fill={QUADRANTS.major.tint} fillOpacity={1} />
                <ReferenceArea x1={0} x2={medC} y1={0} y2={medI} fill={QUADRANTS.fill.tint} fillOpacity={1} />
                <ReferenceArea x1={medC} x2={100} y1={0} y2={medI} fill={QUADRANTS.reconsider.tint} fillOpacity={1} />
                <ReferenceLine x={medC} stroke="#cbd5e1" strokeDasharray="4 4" />
                <ReferenceLine y={medI} stroke="#cbd5e1" strokeDasharray="4 4" />
                <XAxis
                  type="number"
                  dataKey="complexityScore"
                  domain={[20, 85]}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  label={{
                    value: "Implementation complexity →",
                    position: "insideBottom",
                    offset: -14,
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="impactScore"
                  domain={[55, 95]}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  label={{
                    value: "Impact →",
                    angle: -90,
                    position: "insideLeft",
                    offset: 16,
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                />
                <ZAxis
                  type="number"
                  dataKey="annualSavings"
                  range={[80, 520]}
                  name="value"
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={<MatrixTooltip />}
                />
                <Scatter
                  data={points}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={(d: any) => {
                    const id = d?.id ?? d?.payload?.id;
                    const uc = useCases.find((u) => u.id === id);
                    if (uc) setSelected(uc);
                  }}
                  className="cursor-pointer"
                >
                  {points.map((p) => (
                    <Cell
                      key={p.id}
                      fill={QUADRANTS[p.quadrant].color}
                      fillOpacity={0.8}
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Bubble size reflects modeled annual value · click any point for
            details
          </p>
        </div>
      </div>

      {/* Ranked list */}
      <div className="lg:col-span-4">
        <div className="rounded-xl border border-border bg-card shadow-soft">
          <div className="border-b border-border p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {active === "all" ? "All opportunities" : QUADRANTS[active].label}
            </h3>
            {active !== "all" && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {QUADRANTS[active].blurb}
              </p>
            )}
          </div>
          <ul className="max-h-[460px] divide-y divide-border overflow-y-auto">
            {[...points]
              .sort((a, b) => b.annualSavings - a.annualSavings)
              .map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setSelected(p)}
                    className="flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-muted/50"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: QUADRANTS[p.quadrant].color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {p.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {getAgency(p.agencyId)?.abbr} ·{" "}
                        {formatCurrency(p.annualSavings)}/yr
                      </span>
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <UseCaseDetail useCase={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function MatrixTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: UseCase }>;
}) {
  if (!active || !payload || !payload.length) return null;
  const u = payload[0].payload;
  const agency = getAgency(u.agencyId);
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-card">
      <p className="text-sm font-semibold text-foreground">{u.title}</p>
      <p className="text-xs text-muted-foreground">{agency?.name}</p>
      <div className="mt-2 flex gap-4 text-xs">
        <span className="text-muted-foreground">
          Impact <span className="font-semibold text-foreground">{u.impactScore}</span>
        </span>
        <span className="text-muted-foreground">
          Complexity{" "}
          <span className="font-semibold text-foreground">{u.complexityScore}</span>
        </span>
      </div>
      <p className="mt-1 text-xs font-medium text-primary">
        {formatCurrency(u.annualSavings)}/yr
      </p>
    </div>
  );
}
