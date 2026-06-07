import type { RoadmapPhase, ToolkitCapability } from "@/lib/types";

/** Phased implementation roadmap, from low-risk quick wins to enterprise scale. */
export const roadmapPhases: RoadmapPhase[] = [
  {
    phase: 1,
    title: "Quick Wins",
    horizon: "0–6 months",
    objective:
      "Build momentum and trust with low-risk, high-visibility tools while establishing governance foundations.",
    milestones: [
      "Stand up the statewide AI governance body and policy",
      "Launch the staff productivity copilot inside the security boundary",
      "Pilot the multilingual constituent assistant in one agency",
      "Publish the responsible-AI framework and acceptable-use policy",
      "Complete a baseline data and AI-system inventory",
    ],
    outcomes:
      "Early, demonstrable wins; staff trained and confident; guardrails in place before scaling.",
  },
  {
    phase: 2,
    title: "Agency Pilots",
    horizon: "6–18 months",
    objective:
      "Run measured pilots in high-impact agencies, each with defined metrics and human oversight.",
    milestones: [
      "Deploy procurement and public-records assistants in DOA",
      "Pilot benefits navigation and eligibility support in DHS",
      "Launch workforce matching at DLT career centers",
      "Introduce legislative and policy analysis for leadership",
      "Establish shared evaluation metrics across pilots",
    ],
    outcomes:
      "Validated value in real operations; reusable patterns and a growing internal talent base.",
  },
  {
    phase: 3,
    title: "Enterprise Adoption",
    horizon: "18–36 months",
    objective:
      "Scale proven solutions statewide on shared infrastructure and launch the AI-RI innovation hub.",
    milestones: [
      "Stand up AI-RI as the statewide advisory and compute hub",
      "Deploy shared, reusable AI services across agencies",
      "Scale predictive analytics for infrastructure and public health",
      "Formalize cross-agency data-sharing standards",
      "Expand workforce upskilling and AI literacy programs",
    ],
    outcomes:
      "Enterprise-grade capability, lower per-agency cost, and Rhode Island recognized as a responsible-AI leader.",
  },
  {
    phase: 4,
    title: "Continuous Improvement",
    horizon: "Ongoing",
    objective:
      "Institutionalize monitoring, learning, and reinvestment so capabilities improve and stay trustworthy.",
    milestones: [
      "Continuous model monitoring and independent audits",
      "Annual public transparency and impact reporting",
      "Reinvest savings into the next wave of use cases",
      "Regional partnerships and shared regulatory alignment",
      "Sustained training and an internal AI talent pipeline",
    ],
    outcomes:
      "A durable, self-improving capability that compounds value while preserving public trust.",
  },
];

/** Capabilities highlighted in the Legislative & Policy Toolkit section. */
export const toolkitCapabilities: ToolkitCapability[] = [
  {
    id: "legislative-analysis",
    title: "Legislative Analysis",
    icon: "ScrollText",
    description:
      "Neutral plain-language summaries of bills with affected agencies, statutes, and stakeholders identified.",
    example:
      "\"Summarize H-7149, list which agencies it affects, and compare it to last session's version.\"",
  },
  {
    id: "fiscal-notes",
    title: "Fiscal Note Review",
    icon: "Calculator",
    description:
      "Surfaces cost drivers and assumptions in fiscal notes and checks them against historical program data.",
    example:
      "\"Flag the assumptions in this fiscal note that differ from actual FY25 program spending.\"",
  },
  {
    id: "regulatory-review",
    title: "Regulatory Review",
    icon: "BookOpenCheck",
    description:
      "Compares proposed rules against existing regulations to flag conflicts, overlaps, and gaps.",
    example:
      "\"Does this proposed DEM rule conflict with any existing wetlands regulations?\"",
  },
  {
    id: "public-comment",
    title: "Public Comment Analysis",
    icon: "MessagesSquare",
    description:
      "Clusters thousands of comments by theme while preserving and surfacing minority viewpoints.",
    example:
      "\"Theme the 3,200 comments on this rule and show the strongest opposing arguments.\"",
  },
  {
    id: "policy-research",
    title: "Policy Research",
    icon: "Library",
    description:
      "Synthesizes how peer states approached a policy question, with citations to source material.",
    example:
      "\"How have Massachusetts and Connecticut structured similar workforce tax credits?\"",
  },
  {
    id: "program-evaluation",
    title: "Program Evaluation",
    icon: "ClipboardCheck",
    description:
      "Assembles outcome data and evidence to draft balanced evaluations that inform budget decisions.",
    example:
      "\"Summarize outcomes for this workforce program against its stated goals and budget.\"",
  },
];
