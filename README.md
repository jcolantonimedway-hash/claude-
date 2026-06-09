# AI Briefing 🛰️

Your daily 15-minute AI desk: a personal web app that aggregates **frontier lab announcements**, **AI policy & governance**, **tech news**, and the **best AI newsletters** into one briefing — with Claude-powered summaries at three depths.

## Features

- **Today view** — everything from the last 48 hours, grouped by lane (Labs / Policy / Newsletters / News), with unread tracking
- **Full feed** — search, filter by lane, hide read items
- **Claude summaries** *(optional, needs an API key)* — per article:
  - **Takeaway** — the one thing to know, in a sentence or two
  - **Brief** — what happened + why it matters, two paragraphs
  - **Deep dive** — background, context, jargon unpacked, what to watch next
- **Save for later** — bookmarked items persist even after they fall out of the feeds
- **Editable sources** — add/remove/toggle any RSS or Atom feed in Settings, with per-feed health indicators

## Works with or without an API key

The feed, briefing, search, and saving all work with **no key and no cost**. Adding an Anthropic API key (Settings tab has step-by-step instructions) unlocks the summary buttons. Typical personal usage runs a few dollars a month.

Two ways to provide the key:
1. **In the app** — paste it in Settings (stored in your browser's localStorage only)
2. **Server-side** — set `ANTHROPIC_API_KEY` as an environment variable in Vercel

## Default sources

| Lane | Sources |
|---|---|
| Frontier Labs | OpenAI, Anthropic*, Google DeepMind, Meta AI |
| Policy & Governance | CSET, Brookings, RAND, AI Now Institute |
| News | The Verge, TechCrunch, Ars Technica, MIT Tech Review |
| Newsletters | Import AI, Transformer, Don't Worry About the Vase (Zvi), AI Snake Oil |

\* Anthropic has no official RSS feed; the default uses an [openrss.org](https://openrss.org)-generated feed. All URLs are editable in Settings — if a feed shows a red error mark, fix or replace its URL there.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Note: the `/api/*` serverless functions need Vercel's runtime — for full local testing use `npx vercel dev` instead of `npm run dev`.

## Deploying

Deploys as-is to [Vercel](https://vercel.com): import the repo, framework preset "Vite". The two serverless functions (`api/feed.js`, `api/summarize.js`) are picked up automatically. Optionally set `ANTHROPIC_API_KEY` in Project Settings → Environment Variables so summaries work without pasting a key in the browser.

## Tech stack

- **React 18** + Vite + Tailwind CSS
- **Vercel serverless functions** — RSS fetching/parsing (CORS-free, CDN-cached 15 min) and Claude API proxy
- **Anthropic SDK** (`@anthropic-ai/sdk`) with Claude Opus for summaries
- All personal state (read/saved/sources/key) in localStorage — no database, no accounts

## Roadmap

- **v2 — Chat tutor**: ask questions about anything you're reading
- **v3 — Learning layer**: concept explainers, flashcards/retention from what you read
- **v4 — AI policy tracker**: track AI bills, regulations, and lab governance commitments
