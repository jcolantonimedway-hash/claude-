"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { UseCaseCard } from "./use-case-card";
import { UseCaseDetail } from "./use-case-detail";
import { cn } from "@/lib/utils";
import { getAgency } from "@/lib/data";
import type { UseCase, UseCaseCategory } from "@/lib/types";

const CATEGORIES: (UseCaseCategory | "All")[] = [
  "All",
  "Constituent Services",
  "Operations & Efficiency",
  "Health & Human Services",
  "Public Safety & Justice",
  "Infrastructure",
  "Workforce",
  "Revenue & Finance",
  "Policy & Oversight",
];

type SortKey = "value" | "impact" | "complexity";

export function UseCaseLibrary({ useCases }: { useCases: UseCase[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [sort, setSort] = useState<SortKey>("value");
  const [selected, setSelected] = useState<UseCase | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return useCases
      .filter((u) => (category === "All" ? true : u.category === category))
      .filter((u) => {
        if (!q) return true;
        const agency = getAgency(u.agencyId);
        return (
          u.title.toLowerCase().includes(q) ||
          u.summary.toLowerCase().includes(q) ||
          u.problem.toLowerCase().includes(q) ||
          (agency?.name.toLowerCase().includes(q) ?? false) ||
          (agency?.abbr.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => {
        if (sort === "value") return b.annualSavings - a.annualSavings;
        if (sort === "impact") return b.impactScore - a.impactScore;
        return a.complexityScore - b.complexityScore;
      });
  }, [useCases, query, category, sort]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search use cases, problems, or agencies…"
              className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm shadow-soft outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 rounded-lg border border-border bg-card px-3 text-sm shadow-soft outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="value">Sort: Annual value</option>
              <option value="impact">Sort: Impact</option>
              <option value="complexity">Sort: Simplicity</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                category === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
        {filtered.length === 1 ? "opportunity" : "opportunities"}
      </p>

      {/* Grid */}
      <motion.div layout className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((u, i) => (
            <UseCaseCard key={u.id} useCase={u} index={i} onSelect={setSelected} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No use cases match your filters. Try clearing the search.
          </p>
        </div>
      )}

      <UseCaseDetail useCase={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
