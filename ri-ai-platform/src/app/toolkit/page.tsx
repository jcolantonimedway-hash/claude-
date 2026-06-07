import { ShieldCheck, Quote } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { toolkitCapabilities } from "@/lib/data";

export const metadata = {
  title: "Legislative & Policy Toolkit — AI for Rhode Island",
};

export default function ToolkitPage() {
  return (
    <div>
      <PageHero
        eyebrow="Legislative & Policy Toolkit"
        title="AI that accelerates the work of policymaking"
        description="From bill analysis to fiscal notes and public comment, AI can compress weeks of synthesis into hours — so analysts and leaders spend their time on judgment, not assembly."
      />

      <section className="container py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {toolkitCapabilities.map((cap, i) => (
            <Reveal key={cap.id} delay={(i % 3) * 0.05}>
              <Card className="flex h-full flex-col p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name={cap.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight">
                  {cap.title}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {cap.description}
                </p>
                <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Quote className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-medium uppercase tracking-wide">
                      Example prompt
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm italic leading-relaxed text-foreground">
                    {cap.example}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <Card className="mt-8 border-primary/20 bg-primary/[0.03]">
            <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  Analysts decide — AI assists
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Every output is a draft for expert review, with citations to
                  source material and neutral, non-partisan framing. The toolkit
                  speeds the synthesis; the human always owns the judgment and
                  the record.
                </p>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </div>
  );
}
