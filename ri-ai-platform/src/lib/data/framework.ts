import type { FrameworkPillar } from "@/lib/types";

/**
 * Responsible AI framework pillars, aligned to the RI AI Action Plan's emphasis
 * on governance, transparency, privacy, security, and public trust.
 */
export const frameworkPillars: FrameworkPillar[] = [
  {
    id: "governance",
    title: "Governance & Accountability",
    icon: "Scale",
    summary:
      "A central body sets standards, approves use cases, and assigns a clear owner accountable for every deployed system.",
    practices: [
      "Statewide AI policy and intake/review process",
      "Named accountable owner per system",
      "Inventory of all AI systems in use",
      "Alignment with state and federal guidance",
    ],
  },
  {
    id: "human-oversight",
    title: "Human Oversight",
    icon: "UserCheck",
    summary:
      "People remain responsible for decisions that affect residents. AI informs and assists; it does not decide.",
    practices: [
      "Human-in-the-loop for any resident-affecting decision",
      "No automated denials of benefits or rights",
      "Clear escalation paths to staff",
      "Defined override and appeal mechanisms",
    ],
  },
  {
    id: "transparency",
    title: "Transparency & Explainability",
    icon: "Eye",
    summary:
      "Residents know when they are interacting with AI, and outputs can be explained and traced to their sources.",
    practices: [
      "Clear AI disclosure to the public",
      "Source citations on generated content",
      "Plain-language explanations of how systems work",
      "Public register of significant AI uses",
    ],
  },
  {
    id: "privacy",
    title: "Privacy & Data Stewardship",
    icon: "Lock",
    summary:
      "Resident data is minimized, protected, and used only for its stated purpose under strict access controls.",
    practices: [
      "Data minimization and purpose limitation",
      "De-identification where feasible",
      "Role-based access and retention limits",
      "Compliance with state and federal privacy law",
    ],
  },
  {
    id: "fairness",
    title: "Fairness & Equity",
    icon: "Users",
    summary:
      "Systems are tested for disparate impact and designed to serve every Rhode Islander equitably.",
    practices: [
      "Bias testing before and after deployment",
      "Multilingual and accessibility parity",
      "Equity review for vulnerable populations",
      "Representative data and evaluation",
    ],
  },
  {
    id: "security",
    title: "Security & Resilience",
    icon: "ShieldCheck",
    summary:
      "AI runs inside the state's security boundary with monitoring, testing, and incident response built in.",
    practices: [
      "Deployment within secure technology stacks",
      "Adversarial and red-team testing",
      "Continuous monitoring and logging",
      "Incident response and rollback plans",
    ],
  },
  {
    id: "procurement",
    title: "Procurement Standards",
    icon: "FileCheck2",
    summary:
      "Vendor solutions must meet responsible-AI, security, and transparency requirements before adoption.",
    practices: [
      "Responsible-AI clauses in contracts",
      "Right to audit and explainability requirements",
      "Data ownership and portability terms",
      "Vendor security and compliance attestation",
    ],
  },
  {
    id: "monitoring",
    title: "Model Monitoring",
    icon: "LineChart",
    summary:
      "Performance, drift, and harm are tracked continuously, with the ability to pause systems that underperform.",
    practices: [
      "Ongoing accuracy and drift monitoring",
      "Outcome tracking against real-world results",
      "Defined thresholds to pause or retire systems",
      "Regular independent review",
    ],
  },
];
