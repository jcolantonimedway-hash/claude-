"use client";

import { motion } from "framer-motion";
import { Check, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RoadmapPhase } from "@/lib/types";

export function RoadmapTimeline({ phases }: { phases: RoadmapPhase[] }) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute bottom-0 left-[19px] top-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent sm:left-[23px]" />

      <div className="space-y-8">
        {phases.map((phase, i) => (
          <motion.div
            key={phase.phase}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="relative pl-14 sm:pl-16"
          >
            {/* Node */}
            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-primary text-sm font-bold text-primary-foreground shadow-lift sm:h-12 sm:w-12">
              {phase.phase}
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-card">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold tracking-tight">
                  {phase.title}
                </h3>
                <Badge tone="navy">{phase.horizon}</Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {phase.objective}
              </p>

              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {phase.milestones.map((m) => (
                  <li key={m} className="flex items-start gap-2.5 text-sm text-foreground">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </span>
                    {m}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3.5">
                <Flag className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-sm leading-relaxed text-emerald-900">
                  <span className="font-semibold">Outcome — </span>
                  {phase.outcomes}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
