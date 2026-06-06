import { PageHero } from "@/components/layout/page-hero";
import { AgencyExplorer } from "@/components/agencies/agency-explorer";
import { agencies, useCases } from "@/lib/data";

export const metadata = {
  title: "Agency Explorer — AI for Rhode Island",
};

export default function AgenciesPage({
  searchParams,
}: {
  searchParams: { focus?: string };
}) {
  return (
    <div>
      <PageHero
        eyebrow="Agency Explorer"
        title="AI opportunities, tailored to each agency"
        description="Select a department to see its profile, AI readiness, and the specific opportunities best matched to its mission and operations."
      />
      <section className="container py-10">
        <AgencyExplorer
          agencies={agencies}
          useCases={useCases}
          initialId={searchParams.focus}
        />
      </section>
    </div>
  );
}
