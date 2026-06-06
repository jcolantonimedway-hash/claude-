import { PageHero } from "@/components/layout/page-hero";
import { RoiSimulator } from "@/components/roi/roi-simulator";

export const metadata = {
  title: "ROI Simulator — AI for Rhode Island",
};

export default function RoiPage() {
  return (
    <div>
      <PageHero
        eyebrow="ROI Simulator"
        title="Model the return on responsible AI"
        description="Adjust agency size, request volume, and automation rate to project the hours saved, cost savings, and productivity gains AI could deliver."
      />
      <section className="container py-10">
        <RoiSimulator />
      </section>
    </div>
  );
}
