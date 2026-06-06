# AI for Rhode Island — Government Innovation Platform

A polished, executive-level web application that demonstrates how Artificial
Intelligence can be responsibly integrated into **Rhode Island state government**.
It is built as a strategic showcase — designed to be presented directly to the
Governor, cabinet officials, agency directors, legislative leaders, and the
public — and is grounded in the **Rhode Island AI Action Plan (2026)** and its
principles of responsible, human-centered, transparent AI adoption.

> Figures throughout are planning-grade models intended to illustrate relative
> value and sequencing — not official projections.

---

## ✨ What's inside

Eight interconnected sections, each a full route:

| Section | Route | Highlights |
| --- | --- | --- |
| **Executive Dashboard** | `/` | AI readiness gauge, six KPI cards, opportunity heat map |
| **Agency Explorer** | `/agencies` | Interactive directory; select an agency to see tailored opportunities |
| **Use Case Library** | `/use-cases` | Searchable, filterable, sortable catalog with detail modals |
| **Responsible AI Framework** | `/framework` | Eight interactive governance pillars |
| **Prioritization Matrix** | `/matrix` | Impact-vs-complexity quadrant chart with filtering & ranking |
| **Legislative & Policy Toolkit** | `/toolkit` | Realistic policymaking capabilities with example prompts |
| **ROI Simulator** | `/roi` | Live sliders → projected hours, savings, and 3-year value |
| **Implementation Roadmap** | `/roadmap` | Four-phase timeline from quick wins to enterprise scale |

---

## 🧱 Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a custom, government-grade light theme
- **Framer Motion** — subtle reveals, count-ups, and transitions
- **Recharts** — the prioritization matrix and ROI projections
- **lucide-react** — iconography
- Lightweight, hand-rolled **shadcn-style UI primitives** (no heavy runtime deps)

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:3000
# production
npm run build && npm start
```

## 🗂️ Project structure

```
src/
├── app/                      # App Router routes (one folder per section)
│   ├── layout.tsx            # Root layout: header, footer, fonts
│   ├── page.tsx              # Executive Dashboard
│   ├── agencies/page.tsx
│   ├── use-cases/page.tsx
│   ├── framework/page.tsx
│   ├── matrix/page.tsx
│   ├── toolkit/page.tsx
│   ├── roi/page.tsx
│   └── roadmap/page.tsx
├── components/
│   ├── ui/                   # Reusable primitives: card, button, badge,
│   │                         # progress/ring, count-up, icon, reveal
│   ├── layout/               # site-header, site-footer, page-hero, section-heading
│   ├── dashboard/            # kpi-card, opportunity-heatmap
│   ├── agencies/             # agency-explorer
│   ├── usecases/             # use-case-card, use-case-detail (modal), use-case-library
│   ├── framework/            # framework-grid
│   ├── matrix/               # priority-matrix (Recharts scatter)
│   └── roadmap/              # roadmap-timeline
└── lib/
    ├── types.ts              # Domain models (data layer contracts)
    ├── utils.ts              # cn(), currency/number formatters
    ├── nav.ts                # Navigation config
    └── data/                 # Mock data + derived aggregations
        ├── agencies.ts
        ├── use-cases.ts
        ├── framework.ts
        ├── roadmap.ts
        └── index.ts          # getKpiSummary(), getAgencyOpportunities()
```

### Component hierarchy (overview)

```
RootLayout
├── SiteHeader (nav, responsive)
├── <page>
│   ├── PageHero / Dashboard hero
│   ├── Section primitives (Card, Badge, Reveal, …)
│   └── Section feature component
│       ├── KpiCard / OpportunityHeatmap        (dashboard)
│       ├── AgencyExplorer → UseCaseCard → UseCaseDetail
│       ├── UseCaseLibrary → UseCaseCard → UseCaseDetail
│       ├── FrameworkGrid
│       ├── PriorityMatrix (Recharts) → UseCaseDetail
│       ├── RoiSimulator (Recharts)
│       └── RoadmapTimeline
└── SiteFooter
```

## 🧩 Data models

All domain types live in `src/lib/types.ts` and are intentionally
serializable and UI-free, so the same contracts can later be hydrated from real
state systems or an LLM provider. Core entities:

- **`Agency`** — profile, headcount, request volume, AI readiness, accent.
- **`UseCase`** — problem, expected impact, risk, complexity, cost, modeled
  annual savings + hours, **required human oversight**, and **responsible-AI
  considerations**, plus matrix coordinates (`impactScore`, `complexityScore`)
  and implementation `phase`.
- **`FrameworkPillar`**, **`RoadmapPhase`**, **`ToolkitCapability`**, **`KpiSummary`**.

Dashboard KPIs and the heat map are **derived** from the use-case library
(`getKpiSummary`, `getAgencyOpportunities`) so the numbers always stay
internally consistent.

## 🔌 Designed for future integration

The data layer is isolated behind typed accessors in `src/lib/data`. To move
from mock data to live systems:

1. Replace the static arrays with fetchers (REST, database, or a service layer)
   that return the same `types.ts` shapes — **no component changes required**.
2. Wire generative features (Constituent Assistant, Legislative Analysis,
   Toolkit) to a provider via a server route / server action:
   - **Anthropic** (Claude), **OpenAI**, or **Azure OpenAI**.
   - Keep keys server-side; deploy within the state security boundary.
3. Enforce the **Responsible AI Framework** at the integration seam: disclosure,
   citations, human-in-the-loop, logging, and monitoring.

## 🛡️ Responsible AI by design

Every use case documents the **human oversight** required and its
**responsible-AI considerations**. The platform's recurring message: *AI
informs and assists; people remain accountable for decisions that affect
residents.*

---

Built to look like a production government innovation platform — not a
prototype.
