# ⚔️ Revolutionary War Battle Map

An interactive historical map of major battles of the American Revolutionary War (1775–1783). Built with React, TypeScript, Leaflet, and Framer Motion — styled like a modern museum exhibit meets an 18th-century atlas.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Interactive Map** | Leaflet.js map with custom battle markers, zoom, pan, and flyTo animations |
| 🏆 **Battle Detail Panel** | Slide-in side panel with commanders, casualties, historical context, and quotes |
| 📅 **Timeline** | Horizontal 1775–1783 timeline — click a year to filter battles |
| 🔍 **Search & Filter** | Real-time search + filter by outcome (Patriot Win / British Win / Draw) |
| ▶️ **Campaign Mode** | Auto-plays through battles chronologically with narration overlay and map pan/zoom |
| 📊 **Stats Dashboard** | Live count of battles, victories, and years covered in the header |
| 📱 **Responsive** | Mobile-friendly with slide-in panels and touch-aware controls |
| 🎨 **Historical Aesthetic** | Deep navy + muted gold + parchment palette; Playfair Display typography |

---

## 🗡️ Battles Included

| Battle | Date | Outcome |
|---|---|---|
| Lexington & Concord | April 19, 1775 | ⭐ American Victory |
| Bunker Hill | June 17, 1775 | 👑 British Victory |
| Trenton | December 26, 1776 | ⭐ American Victory |
| Princeton | January 3, 1777 | ⭐ American Victory |
| Brandywine | September 11, 1777 | 👑 British Victory |
| Saratoga | October 17, 1777 | ⭐ American Victory |
| Monmouth | June 28, 1778 | ⚖️ Draw |
| Kings Mountain | October 7, 1780 | ⭐ American Victory |
| Cowpens | January 17, 1781 | ⭐ American Victory |
| Yorktown | October 19, 1781 | ⭐ American Victory |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd revolutionary-war-battle-map

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview  # Preview the production build locally
```

---

## 🏗️ Project Structure

```
src/
├── types/
│   └── battle.ts          # TypeScript interfaces (Battle, Commander, Casualties, etc.)
├── data/
│   └── battles.ts         # Complete battle dataset with historical data
├── hooks/
│   ├── useBattles.ts      # Filtered battles based on search/year/outcome
│   └── useCampaign.ts     # Campaign mode auto-play state machine
├── components/
│   ├── Header.tsx          # App header with title and stats
│   ├── BattleMap.tsx       # Leaflet map with custom markers
│   ├── ZoomControls.tsx    # Map zoom/reset buttons
│   ├── BattleDetailPanel.tsx # Slide-in detail panel (Framer Motion)
│   ├── Timeline.tsx        # Horizontal year + battle chips timeline
│   ├── SideControls.tsx    # Collapsible left panel with search/list
│   ├── SearchAndFilter.tsx # Search input + outcome filter buttons
│   ├── CampaignOverlay.tsx # Campaign mode narration overlay
│   ├── OutcomeBadge.tsx    # Victory/defeat/draw badge component
│   └── StatsPanel.tsx      # Quick stats in the header
├── App.tsx                 # Root component — wires everything together
├── main.tsx                # React entry point
└── index.css               # Global styles + Leaflet overrides
```

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `navy` | `#1B2A4A` | Primary background |
| `parchment` | `#F4ECD8` | Text, light surfaces |
| `gold` | `#C4A43A` | Accents, selected states |
| `forest` | `#2D5A1B` | American victory markers |
| `crimson` | `#8B1A1A` | British victory markers |

### Typography

- **Display**: Playfair Display (headings, battle names)
- **Body**: Crimson Text (descriptions, quotes)
- **UI**: Inter (labels, buttons, stats)

---

## 🗺️ Battle Data Model

```typescript
interface Battle {
  id: string;
  name: string;
  date: string;              // "April 19, 1775"
  year: number;
  month: number;
  day: number;
  coordinates: [number, number];  // [lat, lng]
  location: string;
  outcome: 'American Victory' | 'British Victory' | 'Draw' | 'Inconclusive';
  commanders: Commander[];
  casualties: Casualties;
  summary: string;
  significance: string;
  didYouKnow: string;
  whyItMattered: string;
  quote?: string;
  quoteSource?: string;
  tags: string[];
}
```

---

## 🚢 Deploy to Vercel

The project ships with a `vercel.json` config. Just connect your GitHub repo to Vercel:

```bash
# Or deploy via CLI:
npx vercel --prod
```

---

## 🛠️ Tech Stack

- **React 18** + **TypeScript** — Component framework
- **Vite 5** — Build tool
- **Tailwind CSS 3** — Utility-first styling
- **Leaflet 1.9** + **React-Leaflet 4** — Interactive mapping
- **Framer Motion** — Animations (panel slides, transitions)
- **Lucide React** — Icon system

---

## 📚 Historical Notes

All battle data is based on historical records. Key sources:
- National Park Service battle histories
- *Washington: A Life* by Ron Chernow
- *The Glorious Cause* by Robert Middlekauff
- *Almost a Miracle* by John Ferling

Casualty figures vary across sources; these reflect commonly cited estimates.

---

## 🤝 Contributing

To add more battles, edit `src/data/battles.ts` following the `Battle` interface.
The map, timeline, and detail panel will automatically pick up new entries.

---

*"These are the times that try men's souls."* — Thomas Paine, December 1776
