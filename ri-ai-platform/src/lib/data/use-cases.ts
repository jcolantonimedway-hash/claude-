import type { UseCase } from "@/lib/types";

/**
 * The AI use-case library. Each entry is a realistic, responsibly-scoped
 * opportunity for Rhode Island state government. Financial and time estimates
 * are planning-grade models intended to illustrate relative value, not audited
 * projections.
 */
export const useCases: UseCase[] = [
  {
    id: "constituent-assistant",
    title: "Constituent Service Assistant",
    agencyId: "dhs",
    category: "Constituent Services",
    theme: "Government Leadership",
    summary:
      "A 24/7 multilingual virtual assistant that answers common questions and hands off seamlessly to staff.",
    problem:
      "Residents wait on hold during business hours, and frontline staff spend a large share of their day answering the same routine questions across English, Spanish, and Portuguese.",
    expectedImpact:
      "Deflects routine inquiries to self-service, shortens wait times, extends access to nights and weekends, and frees staff for complex casework — with every answer grounded in official state content.",
    impactScore: 88,
    complexityScore: 34,
    risk: "Low",
    complexity: "Low",
    estCost: "$120K setup · $90K/yr",
    annualSavings: 1_850_000,
    annualHoursSaved: 41_000,
    humanOversight:
      "Confidence thresholds trigger live-agent escalation; the assistant never issues eligibility determinations.",
    responsibleAI: [
      "Answers grounded in approved, citable source content",
      "Clear AI disclosure to every resident",
      "Human escalation path always one click away",
      "Multilingual parity testing before launch",
    ],
    phase: 1,
  },
  {
    id: "legislative-analysis",
    title: "Legislative Bill Analysis Assistant",
    agencyId: "governor",
    category: "Policy & Oversight",
    theme: "Government Leadership",
    summary:
      "Summarizes bills, surfaces policy and fiscal impacts, tracks amendments, and drafts briefing materials.",
    problem:
      "During session, thousands of bills move quickly. Policy teams cannot manually read, compare versions, and brief leadership at the pace the calendar demands.",
    expectedImpact:
      "Generates neutral plain-language summaries, flags affected agencies and statutes, tracks amendment changes side-by-side, and produces first-draft briefing memos for human review.",
    impactScore: 82,
    complexityScore: 45,
    risk: "Medium",
    complexity: "Medium",
    estCost: "$160K setup · $110K/yr",
    annualSavings: 940_000,
    annualHoursSaved: 12_500,
    humanOversight:
      "All summaries and recommendations are reviewed by policy staff before use; the tool informs, it does not decide.",
    responsibleAI: [
      "Outputs labeled as draft analysis, not legal advice",
      "Source citations to bill text and statute",
      "Bias review for neutral, non-partisan framing",
    ],
    phase: 2,
  },
  {
    id: "grant-review",
    title: "Grant Review Assistant",
    agencyId: "doa",
    category: "Operations & Efficiency",
    theme: "Government Leadership",
    summary:
      "Pre-screens grant applications for completeness and flags missing information before human scoring.",
    problem:
      "Reviewers spend significant time checking applications for completeness and eligibility basics before the substantive evaluation even begins.",
    expectedImpact:
      "Validates required fields and attachments, flags inconsistencies, and routes complete applications to reviewers faster — while humans retain all scoring and award decisions.",
    impactScore: 64,
    complexityScore: 38,
    risk: "Medium",
    complexity: "Low",
    estCost: "$90K setup · $60K/yr",
    annualSavings: 520_000,
    annualHoursSaved: 8_200,
    humanOversight:
      "AI never scores or ranks applicants on merit; it only checks completeness and surfaces items for reviewers.",
    responsibleAI: [
      "No automated merit scoring or funding decisions",
      "Equity review to avoid disadvantaging smaller applicants",
      "Audit log of every flag raised",
    ],
    phase: 2,
  },
  {
    id: "procurement-analysis",
    title: "Procurement Analysis Tool",
    agencyId: "doa",
    category: "Operations & Efficiency",
    theme: "Framework Development",
    summary:
      "Reviews contracts and bids, detects anomalies, and identifies consolidation and savings opportunities.",
    problem:
      "Contracts and spend data live across systems, making it hard to compare bids, catch off-contract spending, or spot savings across agencies.",
    expectedImpact:
      "Summarizes contract terms, compares bids on like-for-like terms, flags pricing anomalies, and surfaces statewide consolidation opportunities for purchasing officers.",
    impactScore: 78,
    complexityScore: 52,
    risk: "Medium",
    complexity: "Medium",
    estCost: "$180K setup · $120K/yr",
    annualSavings: 3_100_000,
    annualHoursSaved: 9_800,
    humanOversight:
      "Purchasing officers validate every flag; award and vendor decisions remain fully human and procurement-rule compliant.",
    responsibleAI: [
      "Decisions remain with certified purchasing staff",
      "Transparent, explainable anomaly criteria",
      "Vendor-neutral analysis with audit trail",
    ],
    phase: 2,
  },
  {
    id: "public-records",
    title: "Public Records (APRA) Assistant",
    agencyId: "doa",
    category: "Operations & Efficiency",
    theme: "Government Leadership",
    summary:
      "Speeds Access to Public Records Act requests by triaging, locating records, and drafting responses.",
    problem:
      "APRA requests are labor-intensive — locating responsive documents, applying redactions, and drafting responses within statutory deadlines strains small records teams.",
    expectedImpact:
      "Classifies and routes requests, searches across repositories, suggests redactions for review, and drafts response letters — helping agencies meet deadlines consistently.",
    impactScore: 70,
    complexityScore: 40,
    risk: "Medium",
    complexity: "Low",
    estCost: "$110K setup · $70K/yr",
    annualSavings: 680_000,
    annualHoursSaved: 11_300,
    humanOversight:
      "A records officer reviews and approves every redaction and response before release.",
    responsibleAI: [
      "Human approval required for all disclosures",
      "Conservative, reviewable redaction suggestions",
      "Full audit log to support accountability",
    ],
    phase: 1,
  },
  {
    id: "workforce-development",
    title: "Workforce Development Assistant",
    agencyId: "dlt",
    category: "Workforce",
    theme: "Education & Upskilling",
    summary:
      "Matches residents to training programs and job openings and identifies in-demand skill pathways.",
    problem:
      "Jobseekers struggle to navigate the landscape of training programs, apprenticeships, and openings best matched to their background and goals.",
    expectedImpact:
      "Provides personalized program and job matches, highlights skills gaps and pathways, and helps case managers reach more residents with tailored guidance.",
    impactScore: 80,
    complexityScore: 46,
    risk: "Low",
    complexity: "Medium",
    estCost: "$140K setup · $95K/yr",
    annualSavings: 1_200_000,
    annualHoursSaved: 15_600,
    humanOversight:
      "Recommendations support — not replace — career counselors; residents always choose their own path.",
    responsibleAI: [
      "Recommendations are suggestions, never gatekeeping",
      "Tested for equitable matches across demographics",
      "Transparent on why a match was suggested",
    ],
    phase: 1,
  },
  {
    id: "transportation-analytics",
    title: "Transportation Predictive Analytics",
    agencyId: "dot",
    category: "Infrastructure",
    theme: "Collaboration & Scale",
    summary:
      "Predicts asset deterioration and prioritizes bridge and road maintenance before failures occur.",
    problem:
      "Maintenance is often reactive. Inspection, sensor, and condition data are underused for forecasting which assets need attention first.",
    expectedImpact:
      "Models deterioration from inspection and sensor data to prioritize repairs, extend asset life, and target the RhodeWorks capital program for maximum public safety value.",
    impactScore: 76,
    complexityScore: 74,
    risk: "Medium",
    complexity: "High",
    estCost: "$320K setup · $180K/yr",
    annualSavings: 4_600_000,
    annualHoursSaved: 6_400,
    humanOversight:
      "Engineers validate model outputs against inspections; AI informs prioritization, engineers make the call.",
    responsibleAI: [
      "Engineering judgment governs all decisions",
      "Model performance monitored against real outcomes",
      "Documented assumptions and data lineage",
    ],
    phase: 3,
  },
  {
    id: "fraud-detection",
    title: "Benefits & Payment Fraud Detection",
    agencyId: "dlt",
    category: "Revenue & Finance",
    theme: "Framework Development",
    summary:
      "Identifies suspicious claims and payment anomalies to protect program integrity and the trust fund.",
    problem:
      "Improper and fraudulent claims drain program funds, while overly blunt rules can wrongly flag eligible residents and delay legitimate benefits.",
    expectedImpact:
      "Prioritizes a small set of higher-risk cases for human investigation, reducing losses while minimizing friction for the vast majority of legitimate claimants.",
    impactScore: 84,
    complexityScore: 60,
    risk: "High",
    complexity: "Medium",
    estCost: "$210K setup · $140K/yr",
    annualSavings: 5_400_000,
    annualHoursSaved: 7_900,
    humanOversight:
      "AI never denies a claim. Flagged cases go to trained investigators, and every claimant retains appeal rights.",
    responsibleAI: [
      "No automated denials — humans decide every case",
      "Rigorous bias and false-positive monitoring",
      "Clear notice and appeal rights for claimants",
      "Regular fairness audits of flagging patterns",
    ],
    phase: 2,
  },
  {
    id: "staff-copilot",
    title: "Staff Productivity Copilot",
    agencyId: "doa",
    category: "Operations & Efficiency",
    theme: "Education & Upskilling",
    summary:
      "A secure assistant that drafts correspondence, summarizes documents, and recaps meetings for state employees.",
    problem:
      "Staff across every agency spend hours on drafting, summarizing long documents, and writing up meetings — repetitive work that crowds out mission-focused effort.",
    expectedImpact:
      "Gives employees a vetted, secure assistant for everyday writing and synthesis, raising output quality and freeing time — deployed inside the state's security boundary.",
    impactScore: 86,
    complexityScore: 30,
    risk: "Low",
    complexity: "Low",
    estCost: "$150K setup · $200K/yr",
    annualSavings: 2_700_000,
    annualHoursSaved: 58_000,
    humanOversight:
      "Employees review and own all output; the copilot drafts, the person decides.",
    responsibleAI: [
      "Runs within the state security and data boundary",
      "No sensitive data sent to public consumer tools",
      "Staff training on appropriate use and review",
      "Clear acceptable-use policy",
    ],
    phase: 1,
  },
  {
    id: "public-health-surveillance",
    title: "Public Health Surveillance & Insights",
    agencyId: "doh",
    category: "Health & Human Services",
    theme: "Government Leadership",
    summary:
      "Analyzes health signals to detect emerging trends earlier and target resources toward health equity.",
    problem:
      "Early signals of emerging health threats are spread across syndromic, lab, and environmental data that are hard to synthesize in real time.",
    expectedImpact:
      "Surfaces emerging trends earlier, maps disparities to direct outreach where it's needed most, and gives epidemiologists a synthesized view across data sources.",
    impactScore: 79,
    complexityScore: 64,
    risk: "Medium",
    complexity: "High",
    estCost: "$240K setup · $150K/yr",
    annualSavings: 1_500_000,
    annualHoursSaved: 5_600,
    humanOversight:
      "Epidemiologists interpret and validate all signals before any public health action is taken.",
    responsibleAI: [
      "Strong de-identification and data minimization",
      "Equity-centered analysis, monitored for bias",
      "Transparent methods reviewed by public health experts",
    ],
    phase: 2,
  },
  {
    id: "dmv-assistant",
    title: "DMV Service & Wait-Time Assistant",
    agencyId: "taxation",
    category: "Constituent Services",
    theme: "Government Leadership",
    summary:
      "Guides residents through requirements, pre-checks documents, and predicts the best time to visit.",
    problem:
      "Residents arrive without the right documents or at peak times, driving long lines, repeat visits, and frustration.",
    expectedImpact:
      "Walks residents through exactly what to bring, validates documents in advance, and recommends low-wait times — cutting failed visits and in-person congestion.",
    impactScore: 83,
    complexityScore: 42,
    risk: "Low",
    complexity: "Medium",
    estCost: "$130K setup · $85K/yr",
    annualSavings: 1_100_000,
    annualHoursSaved: 22_000,
    humanOversight:
      "Staff handle all transactions and exceptions; the assistant prepares residents, it does not approve documents.",
    responsibleAI: [
      "Accessible, multilingual, mobile-first design",
      "Clear disclosure that final review is by staff",
      "No identity decisions made by AI",
    ],
    phase: 1,
  },
  {
    id: "public-comment-analysis",
    title: "Public Comment & Regulatory Analysis",
    agencyId: "dem",
    category: "Policy & Oversight",
    theme: "Government Leadership",
    summary:
      "Clusters and summarizes thousands of public comments on proposed rules to inform fair rulemaking.",
    problem:
      "Major rulemakings can draw thousands of comments. Reading, de-duplicating, and theming them by hand is slow and risks missing minority viewpoints.",
    expectedImpact:
      "Groups comments by theme, distinguishes unique substance from form-letter campaigns, and produces a balanced summary so every perspective is fairly considered.",
    impactScore: 68,
    complexityScore: 48,
    risk: "Medium",
    complexity: "Medium",
    estCost: "$120K setup · $80K/yr",
    annualSavings: 460_000,
    annualHoursSaved: 6_900,
    humanOversight:
      "Rule-writers read flagged and representative comments directly; AI organizes, humans weigh.",
    responsibleAI: [
      "Ensures minority viewpoints are surfaced, not averaged away",
      "Transparent theming methodology",
      "Original comments always remain on the record",
    ],
    phase: 2,
  },
  {
    id: "eligibility-support",
    title: "Benefits Eligibility Navigator",
    agencyId: "dhs",
    category: "Health & Human Services",
    theme: "Government Leadership",
    summary:
      "Helps residents understand programs they may qualify for and prepare complete applications.",
    problem:
      "Eligibility rules are complex and intimidating. Residents miss benefits they qualify for, and incomplete applications create churn and rework.",
    expectedImpact:
      "Explains programs in plain language, helps assemble complete applications, and clarifies notices — reducing errors and improving access for eligible residents.",
    impactScore: 81,
    complexityScore: 56,
    risk: "High",
    complexity: "Medium",
    estCost: "$190K setup · $130K/yr",
    annualSavings: 1_700_000,
    annualHoursSaved: 19_000,
    humanOversight:
      "Eligibility determinations are always made by caseworkers under program rules — never by AI.",
    responsibleAI: [
      "AI explains and assists; it never determines eligibility",
      "Equity testing to prevent disparate impact",
      "Plain-language, accessible, multilingual delivery",
      "Privacy-protective handling of sensitive data",
    ],
    phase: 2,
  },
  {
    id: "program-evaluation",
    title: "Program Evaluation Assistant",
    agencyId: "ride",
    category: "Policy & Oversight",
    theme: "Framework Development",
    summary:
      "Synthesizes outcomes data and research to evaluate program effectiveness and inform budgets.",
    problem:
      "Evaluating whether programs deliver results requires pulling together outcome data, prior studies, and spending — work that rarely keeps pace with budget cycles.",
    expectedImpact:
      "Assembles evidence, summarizes outcomes against goals, and drafts evaluation findings for analysts — strengthening evidence-based budgeting.",
    impactScore: 66,
    complexityScore: 50,
    risk: "Medium",
    complexity: "Medium",
    estCost: "$130K setup · $90K/yr",
    annualSavings: 720_000,
    annualHoursSaved: 7_100,
    humanOversight:
      "Analysts validate data, methods, and conclusions; AI accelerates synthesis, it does not certify findings.",
    responsibleAI: [
      "Transparent data sources and assumptions",
      "Findings labeled as draft pending analyst review",
      "Guards against spurious correlation claims",
    ],
    phase: 3,
  },
];

export const getUseCase = (id: string) => useCases.find((u) => u.id === id);
export const useCasesByAgency = (agencyId: string) =>
  useCases.filter((u) => u.agencyId === agencyId);
