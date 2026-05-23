# RI Bill Tracker 🏛️⚓

A visual web app that tracks the progress of bills through the **Rhode Island General Assembly**. See at a glance whether a bill is stuck in committee, heading to a floor vote, or on the Governor's desk.

## Features

- **Visual progress stepper** — see every stage of a bill's journey from introduction to law
- **"Held for Further Study" detection** — RI's most common bill fate is highlighted prominently
- **Action timeline** — full history of every committee hearing, vote, and action
- **Real RI bill data** via the [OpenStates API](https://openstates.org) (free API key required)
- **5 demo bills** showing different stages so you can explore immediately
- Mobile-responsive design using Rhode Island state colors

## Bill Stages Tracked

```
[Introduced] → [In Committee] → [Floor Vote] → [Passed Chamber] → [Other Chamber] → [Governor] → [Signed into Law]
```

Special states:
- ⏸️ **Held for Further Study** — bill tabled in committee (common in RI, shown in amber)
- ❌ **Failed in Committee** — committee voted against the bill
- 🚀 **Reported Out of Committee** — committee advanced the bill
- 🚫 **Vetoed** — Governor rejected the bill

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Getting Real RI Bill Data

1. Sign up for a **free** OpenStates API key at [openstates.org/accounts/signup/](https://openstates.org/accounts/signup/)
2. Click **"Add API Key"** in the app header
3. Search any RI bill by number (e.g. `H5001`, `S0245`)

The API key is stored in your browser's `localStorage` only.

## Tech Stack

- **React 18** + Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **OpenStates API v3** for live RI legislative data
- Rhode Island state colors: Navy `#002868`, Red `#BF0A30`, Gold `#F5C518`

## RI Legislature Resources

- [RI General Assembly](https://webserver.rilin.state.ri.us/) — official bill search
- [OpenStates RI](https://openstates.org/ri/) — aggregated RI bill data
