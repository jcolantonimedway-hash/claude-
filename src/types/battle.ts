// ─── Battle Data Model ─────────────────────────────────────────────────────

export type Outcome = 'American Victory' | 'British Victory' | 'Draw' | 'Inconclusive';

export type Side = 'American' | 'British' | 'Hessian' | 'Loyalist';

export interface Commander {
  name: string;
  side: Side;
  rank: string;
  note?: string;
}

export interface CasualtyCount {
  killed?: number;
  wounded?: number;
  captured?: number;
}

export interface Casualties {
  american?: CasualtyCount;
  british?: CasualtyCount;
  notes?: string;
}

export interface Battle {
  id: string;
  name: string;
  date: string;           // Human-readable: "April 19, 1775"
  year: number;
  month: number;          // 1–12
  day: number;
  coordinates: [number, number]; // [latitude, longitude]
  location: string;       // e.g. "Middlesex County, Massachusetts"
  outcome: Outcome;
  commanders: Commander[];
  casualties: Casualties;
  summary: string;        // 2–3 sentence overview
  significance: string;   // Why this battle mattered strategically
  didYouKnow: string;     // Interesting fact
  whyItMattered: string;  // Longer essay on importance
  quote?: string;         // Historical quote
  quoteSource?: string;
  tags: string[];         // e.g. ["New England", "Opening Battles"]
}

export type FilterOutcome = Outcome | 'All';

export interface AppFilters {
  search: string;
  outcome: FilterOutcome;
  year: number | null;    // null = all years
}
