import type { KpiSummary } from "@/lib/types";
import { agencies } from "./agencies";
import { useCases } from "./use-cases";

export { agencies, getAgency } from "./agencies";
export { useCases, getUseCase, useCasesByAgency } from "./use-cases";
export { frameworkPillars } from "./framework";
export { roadmapPhases, toolkitCapabilities } from "./roadmap";

/**
 * Derive the executive KPI summary from the underlying data so the dashboard
 * always reflects the use-case library rather than hard-coded figures.
 */
export function getKpiSummary(): KpiSummary {
  const annualTaxpayerValue = useCases.reduce((sum, u) => sum + u.annualSavings, 0);
  const annualHoursSaved = useCases.reduce((sum, u) => sum + u.annualHoursSaved, 0);
  const readinessScore = Math.round(
    agencies.reduce((sum, a) => sum + a.readiness, 0) / agencies.length,
  );
  // Modeled efficiency gain weighted toward lower-complexity, higher-impact work.
  const efficiencyGainPct =
    Math.round(
      (useCases.reduce((sum, u) => sum + u.impactScore, 0) / useCases.length / 100) *
        38 *
        10,
    ) / 10;

  return {
    readinessScore,
    efficiencyGainPct,
    annualHoursSaved,
    annualTaxpayerValue,
    agenciesRepresented: agencies.length,
    useCaseCount: useCases.length,
  };
}

/**
 * Per-agency opportunity rollup used by the dashboard heat map and the agency
 * explorer.
 */
export function getAgencyOpportunities() {
  return agencies
    .map((agency) => {
      const cases = useCases.filter((u) => u.agencyId === agency.id);
      return {
        ...agency,
        opportunityCount: cases.length,
        totalValue: cases.reduce((s, u) => s + u.annualSavings, 0),
        totalHours: cases.reduce((s, u) => s + u.annualHoursSaved, 0),
        avgImpact:
          cases.length === 0
            ? 0
            : Math.round(cases.reduce((s, u) => s + u.impactScore, 0) / cases.length),
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue);
}
