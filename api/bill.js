// Vercel serverless function — scrapes RI General Assembly directly.
// Handles 2026 (webserver.rilegislature.gov) and prior sessions.
// No API key needed from the user.

import { load as cheerioLoad } from 'cheerio';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
};

function sessionYearsToTry() {
  const y = new Date().getFullYear();
  return [y, y - 1]; // e.g. [2026, 2025]
}

// URL patterns for each year's bill text + status pages
function urlsForBill(identifier, fullYear) {
  const yr = String(fullYear).slice(2);          // "26"
  const ch = identifier[0];                       // "H" or "S"
  const chamberDir = ch === 'H' ? 'HouseText' : 'SenateText';

  return {
    // 2026+ new domain
    textNew: `https://webserver.rilegislature.gov/BillText${yr}/${chamberDir}${yr}/${identifier}.htm`,
    textNewAlt: `https://webserver.rilegislature.gov/BillText/BillText${yr}/${chamberDir}${yr}/${identifier}.htm`,
    // status / history (new domain — try several parameter combos)
    statusNew1: `https://status.rilegislature.gov/bill_history_report.aspx?bills=${identifier}&year=${fullYear}`,
    statusNew2: `https://status.rilegislature.gov/bill_history.aspx?bill=${identifier}&year=${fullYear}`,
    // 2025 and older — old domain
    textOld: `https://webserver.rilin.state.ri.us/BillText/BillText${yr}/${ch}/${identifier}.htm`,
    statusOld: `https://webserver.rilin.state.ri.us/BillStatus${yr}/BillStatus${yr}.asp?bill=${identifier}`,
  };
}

// ────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const identifier = (req.query.identifier || '').toUpperCase().replace(/\s/g, '');

  if (!identifier || !/^[HS]\d+$/.test(identifier)) {
    return res.status(400).json({
      error: 'Enter a bill number like H7632 or S2977.',
    });
  }

  for (const fullYear of sessionYearsToTry()) {
    try {
      const bill = await fetchOneBill(identifier, fullYear);
      if (bill) return res.status(200).json(bill);
    } catch {
      // try next year
    }
  }

  return res.status(404).json({
    error: `"${identifier}" not found on the RI General Assembly website. Double-check the bill number — 2026 House bills start around H7000 and Senate bills around S2000.`,
  });
}

// ────────────────────────────────────────────────────────────────
async function fetchOneBill(identifier, fullYear) {
  const urls = urlsForBill(identifier, fullYear);
  const ch = identifier[0];
  const chamber = ch === 'H' ? 'House' : 'Senate';

  // 1. Fetch bill text page (for title, sponsor, committee)
  let textHtml = '';
  for (const key of ['textNew', 'textNewAlt', 'textOld']) {
    try {
      const r = await fetch(urls[key], { headers: HEADERS });
      if (r.ok) { textHtml = await r.text(); break; }
    } catch {}
  }
  if (!textHtml) return null;                    // bill doesn't exist this year

  const parsed = parseBillText(textHtml, identifier, fullYear, chamber);
  if (!parsed) return null;

  // 2. Fetch action history (status page)
  let actions = parsed.actions;
  for (const key of ['statusNew1', 'statusNew2', 'statusOld']) {
    try {
      const r = await fetch(urls[key], {
        headers: { ...HEADERS, Referer: 'https://www.rilegislature.gov/' },
      });
      if (r.ok) {
        const html = await r.text();
        const parsed = parseStatusHtml(html);
        if (parsed.length > 0) { actions = parsed; break; }
      }
    } catch {}
  }

  const latest = actions[actions.length - 1];
  const yr = String(fullYear).slice(2);
  const chamberDir = ch === 'H' ? 'HouseText' : 'SenateText';

  return {
    ...parsed,
    actions,
    latestActionDate: latest?.date || parsed.latestActionDate,
    latestActionDescription: latest?.description || parsed.latestActionDescription,
    riLegUrl: urls.textNew,
    openStatesUrl: `https://openstates.org/ri/bills/${fullYear}/${identifier}/`,
  };
}

// ────────────────────────────────────────────────────────────────
// Parse RI bill text page.
// RI stores bill text as plain text inside <pre> tags, formatted like:
//
//   2026 -- H 7632
//   ...
//   A N A C T
//   RELATING TO COMMERCIAL LAW -- GENERAL REGULATORY PROVISIONS
//   (AGE-APPROPRIATE DESIGN CODE ACT)
//
//   Introduced By: Representatives Alzate, Shallcross Smith, ...
//   Date Introduced: February 11, 2026
//   Referred To: House Innovation, Internet, & Technology
//
function parseBillText(html, identifier, fullYear, chamber) {
  // Extract plain text from <pre> (preferred) or strip all tags
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  const raw = preMatch
    ? preMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    : html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  if (!raw || raw.trim().length < 50) return null;

  // ── Title ──────────────────────────────────────────────────
  // Look for "RELATING TO" lines (may span multiple lines)
  let title = '';
  const relMatch = raw.match(/RELATING TO\s+([\s\S]{5,300}?)(?=\n\s*\n|\nIntroduced|\nDate|\nReferred)/i);
  if (relMatch) {
    title = 'An Act Relating to ' + relMatch[1].replace(/\s+/g, ' ').trim()
              .replace(/\([^)]+\)/, '')   // strip parenthetical subtitle
              .replace(/--\s*/g, '— ')
              .trim();
  }
  // Fallback: grab the HTML <title> tag
  if (!title) {
    const ht = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (ht) title = ht[1].trim();
  }
  if (!title) title = `Rhode Island Bill ${identifier} — ${fullYear} Session`;

  // ── Sponsor ────────────────────────────────────────────────
  let primarySponsor = '';
  let cosponsors = [];
  const sponsorMatch = raw.match(/Introduced By:\s*([^\n]{5,200})/i) ||
                       raw.match(/By:\s*((?:Representative|Senator)[^\n]{5,200})/i);
  if (sponsorMatch) {
    // Remove leading "Representatives" / "Senators" label
    const allStr = sponsorMatch[1]
      .replace(/^Representatives?\s*/i, '')
      .replace(/^Senators?\s*/i, '')
      .trim();
    const parts = allStr.split(/,\s*/);
    primarySponsor = (chamber === 'House' ? 'Rep. ' : 'Sen. ') + parts[0].trim();
    cosponsors = parts.slice(1)
      .map(s => (chamber === 'House' ? 'Rep. ' : 'Sen. ') + s.trim())
      .filter(Boolean);
  }

  // ── Date Introduced ────────────────────────────────────────
  let introDateStr = '';
  let introDate = '';
  const dateMatch = raw.match(/Date Introduced:\s*([A-Za-z]+ \d{1,2},?\s*\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if (dateMatch) {
    introDateStr = dateMatch[1].trim();
    try {
      introDate = new Date(introDateStr).toISOString().split('T')[0];
    } catch {}
  }

  // ── Committee ─────────────────────────────────────────────
  let committee = '';
  const committeeMatch = raw.match(/Referred To:\s*([^\n]{5,100})/i) ||
                         raw.match(/referred to\s+(?:the\s+)?([^\n]{5,80})/i);
  if (committeeMatch) committee = committeeMatch[1].trim().replace(/\s+/g, ' ');

  // ── Seed actions from what we know ────────────────────────
  const actions = [];
  if (introDate) {
    actions.push({
      date: introDate,
      description: committee
        ? `Introduced, referred to ${committee}`
        : 'Introduced',
      classification: ['introduction', ...(committee ? ['referral-committee'] : [])],
      organization: chamber,
    });
  }

  return {
    id: `ri-${String(fullYear).slice(2)}-${identifier}`,
    identifier,
    title: title.replace(/\s+/g, ' ').trim(),
    abstract: title.replace(/\s+/g, ' ').trim(),
    primarySponsor: primarySponsor || 'See RI General Assembly',
    cosponsors,
    committee: committee || `${chamber} Committee`,
    session: String(fullYear),
    chamber,
    latestActionDate: introDate || null,
    latestActionDescription: committee ? `Referred to ${committee}` : 'Introduced',
    actions,
    _source: 'ri_legislature',
  };
}

// ────────────────────────────────────────────────────────────────
// Parse bill history/status HTML — look for table rows with date + action
function parseStatusHtml(html) {
  const $ = cheerioLoad(html);
  const actions = [];

  $('tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 2) return;

    const col0 = $(cells[0]).text().trim();
    const col1 = $(cells[1]).text().trim();

    if (
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(col0) ||
      /^\d{4}-\d{2}-\d{2}$/.test(col0)
    ) {
      if (col1.length > 3) {
        actions.push({
          date: normalizeDate(col0),
          description: col1.replace(/\s+/g, ' '),
          classification: guessClassification(col1),
          organization: guessOrg(col1),
        });
      }
    }
  });

  return actions.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function normalizeDate(d) {
  const p = d.split('/');
  if (p.length === 3) {
    let y = p[2].length === 2 ? '20' + p[2] : p[2];
    return `${y}-${p[0].padStart(2, '0')}-${p[1].padStart(2, '0')}`;
  }
  return d;
}

function guessClassification(t) {
  const s = t.toLowerCase();
  if (/introduc/.test(s)) return ['introduction'];
  if (/referred to/.test(s)) return ['referral-committee'];
  if (/reported out|reported favorably|favorable report/.test(s)) return ['committee-passage'];
  if (/held for further study|recommended for study/.test(s)) return [];
  if (/\bpassed\b/.test(s)) return ['passage'];
  if (/\bfailed\b/.test(s)) return ['failure'];
  if (/signed by governor|approved by governor/.test(s)) return ['executive-signature'];
  if (/vetoed/.test(s)) return ['executive-veto'];
  if (/second reading/.test(s)) return ['reading-2'];
  return [];
}

function guessOrg(t) {
  const s = t.toLowerCase();
  if (/senate/.test(s)) return 'Senate';
  if (/house/.test(s)) return 'House';
  if (/governor/.test(s)) return 'Governor';
  return '';
}
