import Link from "next/link";
import { navItems } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/40">
      <div className="container py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ri-navy text-sm font-bold text-white">
                RI
              </span>
              <span className="text-sm font-semibold text-foreground">
                AI for Rhode Island
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A strategic showcase of responsible AI opportunities for Rhode
              Island state government — built to inform leaders, agencies, and
              the public.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Illustrative concept aligned to the Rhode Island AI Action Plan
            (2026). Figures are planning-grade models, not official projections.
          </p>
          <p>Built for responsible, transparent, human-centered AI.</p>
        </div>
      </div>
    </footer>
  );
}
