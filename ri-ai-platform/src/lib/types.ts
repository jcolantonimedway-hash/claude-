/**
 * Domain models for the Rhode Island AI Opportunity Platform.
 *
 * These types describe the shape of the (currently mocked) data layer. They are
 * intentionally serializable and free of UI concerns so that the same models can
 * later be hydrated from real state data systems or an LLM provider
 * (OpenAI / Anthropic / Azure OpenAI) without changing the component layer.
 */

export type RiskLevel = "Low" | "Medium" | "High";
export type Complexity = "Low" | "Medium" | "High";

/** Thematic priorities drawn from the RI AI Action Plan (2026). */
export type ThemeArea =
  | "Government Leadership"
  | "Education & Upskilling"
  | "Framework Development"
  | "Collaboration & Scale";

/** Functional grouping used for filtering the use-case library. */
export type UseCaseCategory =
  | "Constituent Services"
  | "Operations & Efficiency"
  | "Health & Human Services"
  | "Public Safety & Justice"
  | "Infrastructure"
  | "Workforce"
  | "Revenue & Finance"
  | "Policy & Oversight";

export interface Agency {
  id: string;
  name: string;
  abbr: string;
  /** One-line mission framing. */
  blurb: string;
  /** Lucide icon name resolved in the UI layer. */
  icon: string;
  /** Approximate headcount — drives the ROI baseline. */
  employees: number;
  /** Approximate annual constituent interactions / processed requests. */
  annualRequests: number;
  /** AI-readiness score 0–100 (data maturity + leadership + infrastructure). */
  readiness: number;
  /** Tailwind-friendly accent hue token for charts. */
  accent: string;
}

export interface UseCase {
  id: string;
  title: string;
  agencyId: string;
  category: UseCaseCategory;
  theme: ThemeArea;
  /** Short card-level summary. */
  summary: string;
  /** The operational problem this addresses. */
  problem: string;
  /** What "good" looks like once deployed. */
  expectedImpact: string;
  /** 0–100 positioning for the prioritization matrix (y-axis). */
  impactScore: number;
  /** 0–100 positioning for the prioritization matrix (x-axis). */
  complexityScore: number;
  risk: RiskLevel;
  complexity: Complexity;
  /** Human-readable one-time + annual cost band. */
  estCost: string;
  /** Modeled annual taxpayer value (savings + avoided cost). */
  annualSavings: number;
  /** Modeled annual staff hours returned to higher-value work. */
  annualHoursSaved: number;
  /** The required human-in-the-loop posture. */
  humanOversight: string;
  /** Responsible-AI guardrails specific to this use case. */
  responsibleAI: string[];
  /** Implementation phase 1–4. */
  phase: 1 | 2 | 3 | 4;
}

export interface KpiSummary {
  readinessScore: number;
  efficiencyGainPct: number;
  annualHoursSaved: number;
  annualTaxpayerValue: number;
  agenciesRepresented: number;
  useCaseCount: number;
}

export interface FrameworkPillar {
  id: string;
  title: string;
  icon: string;
  summary: string;
  practices: string[];
}

export interface RoadmapPhase {
  phase: 1 | 2 | 3 | 4;
  title: string;
  horizon: string;
  objective: string;
  milestones: string[];
  outcomes: string;
}

export interface ToolkitCapability {
  id: string;
  title: string;
  icon: string;
  description: string;
  example: string;
}
