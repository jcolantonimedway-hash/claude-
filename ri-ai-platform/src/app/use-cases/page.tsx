import { PageHero } from "@/components/layout/page-hero";
import { UseCaseLibrary } from "@/components/usecases/use-case-library";
import { useCases } from "@/lib/data";

export const metadata = {
  title: "AI Use Case Library — AI for Rhode Island",
};

export default function UseCasesPage() {
  return (
    <div>
      <PageHero
        eyebrow="Use Case Library"
        title="Practical AI opportunities, responsibly scoped"
        description="A searchable catalog of where AI can deliver value across Rhode Island state government — each with its problem, impact, risk, cost, and the human oversight required."
      />
      <section className="container py-10">
        <UseCaseLibrary useCases={useCases} />
      </section>
    </div>
  );
}
