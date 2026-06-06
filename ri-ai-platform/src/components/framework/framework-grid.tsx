"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { FrameworkPillar } from "@/lib/types";

export function FrameworkGrid({ pillars }: { pillars: FrameworkPillar[] }) {
  const [openId, setOpenId] = useState<string | null>(pillars[0]?.id ?? null);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {pillars.map((pillar, i) => {
        const open = openId === pillar.id;
        return (
          <motion.div
            key={pillar.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i % 2) * 0.05 }}
            className={cn(
              "rounded-xl border bg-card transition-colors",
              open ? "border-primary/40 shadow-card" : "border-border shadow-soft",
            )}
          >
            <button
              onClick={() => setOpenId(open ? null : pillar.id)}
              className="flex w-full items-center gap-4 p-5 text-left"
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors",
                  open
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary",
                )}
              >
                <Icon name={pillar.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold tracking-tight">
                  {pillar.title}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {pillar.summary}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <ul className="space-y-2 border-t border-border p-5 pt-4">
                    {pillar.practices.map((practice) => (
                      <li
                        key={practice}
                        className="flex items-start gap-2.5 text-sm text-foreground"
                      >
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                          <Check className="h-3 w-3 text-emerald-600" />
                        </span>
                        {practice}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
