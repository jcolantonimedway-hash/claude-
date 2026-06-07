export interface NavItem {
  label: string;
  href: string;
  /** Lucide icon name. */
  icon: string;
  /** Short description for command/launch surfaces. */
  description: string;
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
    description: "Executive overview of readiness, value, and opportunity.",
  },
  {
    label: "Agencies",
    href: "/agencies",
    icon: "Building2",
    description: "Explore tailored AI opportunities by agency.",
  },
  {
    label: "Use Cases",
    href: "/use-cases",
    icon: "Sparkles",
    description: "Searchable library of responsible AI use cases.",
  },
  {
    label: "Framework",
    href: "/framework",
    icon: "ShieldCheck",
    description: "The responsible AI governance framework.",
  },
  {
    label: "Matrix",
    href: "/matrix",
    icon: "Grid2x2",
    description: "Prioritize opportunities by impact and complexity.",
  },
  {
    label: "Toolkit",
    href: "/toolkit",
    icon: "Scale",
    description: "Legislative and policy AI capabilities.",
  },
  {
    label: "ROI Simulator",
    href: "/roi",
    icon: "Calculator",
    description: "Model savings, hours, and productivity gains.",
  },
  {
    label: "Roadmap",
    href: "/roadmap",
    icon: "Route",
    description: "A phased path to responsible adoption.",
  },
];
