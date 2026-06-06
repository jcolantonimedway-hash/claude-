import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { RoadmapTimeline } from "@/components/roadmap/roadmap-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { roadmapPhases } from "@/lib/data";

export const metadata = {
  title: "Implementation Roadmap — AI for Rhode Island",
};

export default function RoadmapPage() {
  return (
    <div>
      <PageHero
        eyebrow="Implementation Roadmap"
        title="A phased path from quick wins to enterprise scale"
        description="Build trust and momentum with low-risk wins, validate value through agency pilots, scale proven solutions statewide, then improve continuously."
      />
      <section className="container py-10">
        <RoadmapTimeline phases={roadmapPhases} />

        <Card className="mt-12 overflow-hidden border-primary/20">
          <CardContent className="flex flex-col items-start gap-5 bg-primary/[0.03] p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h3 className="text-xl font-semibold tracking-tight">
                Start with one pilot.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The fastest way to build confidence is a single, well-scoped
                quick win with clear metrics and human oversight. Explore the
                library and prioritization matrix to choose where to begin.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/use-cases">
                <Button>
                  Browse use cases
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/matrix">
                <Button variant="secondary">See quick wins</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
