"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { formatCurrency } from "@/lib/utils";

interface HeatCell {
  id: string;
  abbr: string;
  name: string;
  icon: string;
  opportunityCount: number;
  totalValue: number;
  avgImpact: number;
}

export function OpportunityHeatmap({ data }: { data: HeatCell[] }) {
  const max = Math.max(...data.map((d) => d.totalValue), 1);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {data.map((cell, i) => {
        // Map value to a navy intensity 0.08 → 1.0
        const intensity = 0.1 + (cell.totalValue / max) * 0.9;
        const dark = intensity > 0.55;
        return (
          <motion.div
            key={cell.id}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.03 }}
          >
            <Link
              href={`/agencies?focus=${cell.id}`}
              className="group flex h-full flex-col justify-between rounded-xl border border-border p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-card"
              style={{ backgroundColor: `rgba(0, 40, 104, ${intensity})` }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{
                    backgroundColor: dark
                      ? "rgba(255,255,255,0.16)"
                      : "rgba(0,40,104,0.10)",
                  }}
                >
                  <Icon
                    name={cell.icon}
                    className="h-4 w-4"
                    color={dark ? "#fff" : "#002868"}
                  />
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: dark ? "rgba(255,255,255,0.85)" : "#475569" }}
                >
                  {cell.opportunityCount}
                </span>
              </div>
              <div className="mt-4">
                <p
                  className="text-sm font-semibold"
                  style={{ color: dark ? "#fff" : "#0f172a" }}
                >
                  {cell.abbr}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: dark ? "rgba(255,255,255,0.8)" : "#64748b" }}
                >
                  {formatCurrency(cell.totalValue)}/yr
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
