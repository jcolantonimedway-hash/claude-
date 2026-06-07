import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Ring } from "@/components/ui/progress";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { OpportunityHeatmap } from "@/components/dashboard/opportunity-heatmap";
import { SectionHeading } from "@/components/layout/section-heading";
import { getKpiSummary, getAgencyOpportunities } from "@/lib/data";
import { navItems } from "@/lib/nav";

export default function DashboardPage() {
  const kpi = getKpiSummary();
  const heatmap = getAgencyOpportunities();
  const sections = navItems.filter((n) => n.href !== "/");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid mask-fade-b opacity-60" />
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-ri-navy/30 to-transparent" />
        <div className="container relative py-20 sm:py-28">
          <Reveal>
            <Badge tone="navy" className="mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Rhode Island AI Action Plan · 2026
            </Badge>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Responsible AI for{" "}
              <span className="text-ri-navy">Rhode Island</span> state
              government.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
              A strategic showcase of practical, high-impact AI opportunities —
              designed to improve services and operational efficiency while
              preserving accountability, transparency, and public trust.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/use-cases">
                <Button size="lg">
                  Explore use cases
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/roadmap">
                <Button size="lg" variant="secondary">
                  View the roadmap
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* KPI grid */}
      <section className="container -mt-10 sm:-mt-12">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <KpiCard
            label="AI Readiness Score"
            value={kpi.readinessScore}
            suffix="/100"
            icon="Gauge"
            hint="Weighted across data maturity, leadership & infrastructure"
          />
          <KpiCard
            label="Est. Efficiency Gain"
            value={kpi.efficiencyGainPct}
            suffix="%"
            icon="TrendingUp"
            format="decimal1"
            hint="Modeled across the current opportunity portfolio"
          />
          <KpiCard
            label="Potential Hours Saved"
            value={kpi.annualHoursSaved}
            icon="Clock"
            format="compact"
            suffix="/yr"
            hint="Staff time returned to higher-value work"
          />
          <KpiCard
            label="Potential Taxpayer Value"
            value={kpi.annualTaxpayerValue}
            icon="Landmark"
            format="currency"
            suffix="/yr"
            hint="Modeled savings and avoided cost"
          />
          <KpiCard
            label="Agencies Represented"
            value={kpi.agenciesRepresented}
            icon="Building2"
            hint="Executive-branch departments in scope"
          />
          <KpiCard
            label="AI Use Cases"
            value={kpi.useCaseCount}
            icon="Sparkles"
            hint="Responsibly-scoped opportunities catalogued"
          />
        </div>
      </section>

      {/* Readiness + heat map */}
      <section className="container mt-16 grid gap-6 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
              <Ring value={kpi.readinessScore} sublabel="Readiness" />
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Rhode Island is well-positioned to lead
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Small scale enables fast cross-sector coordination. A strong
                  education ecosystem, defense &amp; maritime tech, and life
                  sciences give the state a genuine national edge in responsible
                  AI adoption.
                </p>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    AI Opportunity Heat Map
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Annual modeled value by agency · darker = higher
                  </p>
                </div>
                <Link
                  href="/agencies"
                  className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
                >
                  Explore agencies <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <OpportunityHeatmap data={heatmap} />
            </CardContent>
          </Card>
        </Reveal>
      </section>

      {/* Section launcher */}
      <section className="container mt-20">
        <SectionHeading
          eyebrow="Explore the platform"
          title="Everything leaders need to make the case"
          description="From a searchable use-case library to an ROI simulator and a phased implementation roadmap — built for cabinet, agency, and legislative audiences."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((item, i) => (
            <Reveal key={item.href} delay={i * 0.04}>
              <Link href={item.href}>
                <Card className="group h-full transition-all hover:-translate-y-1 hover:shadow-card">
                  <CardContent className="flex h-full flex-col p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon name={item.icon} className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 flex items-center gap-1.5 text-base font-semibold tracking-tight">
                      {item.label}
                      <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
