import { ShieldCheck, Scale, Eye, Users } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { FrameworkGrid } from "@/components/framework/framework-grid";
import { Card, CardContent } from "@/components/ui/card";
import { frameworkPillars } from "@/lib/data";

export const metadata = {
  title: "Responsible AI Framework — AI for Rhode Island",
};

const principles = [
  {
    icon: Scale,
    title: "Accountable",
    text: "Every system has a named owner and a clear line of responsibility.",
  },
  {
    icon: Eye,
    title: "Transparent",
    text: "Residents know when AI is in use and how decisions are reached.",
  },
  {
    icon: Users,
    title: "Equitable",
    text: "Tested for fairness so every Rhode Islander is served well.",
  },
  {
    icon: ShieldCheck,
    title: "Secure",
    text: "Deployed within the state's security boundary and monitored.",
  },
];

export default function FrameworkPage() {
  return (
    <div>
      <PageHero
        eyebrow="Responsible AI Framework"
        title="Trust is the foundation, not an afterthought"
        description="A clear governance framework so Rhode Island can adopt AI confidently — with human oversight, transparency, privacy, and security built in from the start."
      />

      <section className="container py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <Card key={p.title}>
              <CardContent className="p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-base font-semibold tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {p.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">
            The eight pillars
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a pillar to see the concrete practices behind it.
          </p>
          <div className="mt-5">
            <FrameworkGrid pillars={frameworkPillars} />
          </div>
        </div>
      </section>
    </div>
  );
}
