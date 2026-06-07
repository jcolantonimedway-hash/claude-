import { PageHero } from "@/components/layout/page-hero";
import { PriorityMatrix } from "@/components/matrix/priority-matrix";
import { useCases } from "@/lib/data";

export const metadata = {
  title: "Prioritization Matrix — AI for Rhode Island",
};

export default function MatrixPage() {
  return (
    <div>
      <PageHero
        eyebrow="Prioritization Matrix"
        title="Where to start: impact vs. complexity"
        description="Plot every opportunity by expected impact and implementation complexity to focus first on the quick wins — high value, low lift — and sequence the rest."
      />
      <section className="container py-10">
        <PriorityMatrix useCases={useCases} />
      </section>
    </div>
  );
}
