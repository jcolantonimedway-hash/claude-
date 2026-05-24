// Vercel serverless function — scrapes RI General Assembly directly
// No API key needed. Runs server-side so there are no CORS issues.

import * as cheerio from 'cheerio';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Current and recent RI session years (most recent first)
function getSessionYears() {
  const thisYear = new Date().getFullYear();
  return [
    String(thisYear).slice(2),
    String(thisYear - 1).slice(2),
  ];
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const identifier = (req.query.identifier || '').toUpperCase().replace(/\s/g, '');

  if (!identifier || !/^[HS]\d+$/.test(identifier)) {
    return res.status(400).json({
      error: 'Enter a bill number like H5001 or S0245.',
    });
  }

  const sessionYears = getSessionYears();

  for (const yr of sessionYears) {
    try {
      const bill = await fetchBill(identifier, yr);
      if (bill) return res.status(200).json(bill);
    } catch {
      // try next year
    }
  }

  return res.status(404).json({
    error: `Could not find bill "${identifier}" on the RI General Assembly website. Make sure the bill number is correct (e.g. H5001 or S0245).`,
  });
}

async function fetchBill(identifier, yr) {
  // RI legislature bill status URL pattern
  const statusUrl = `https://webserver.rilin.state.ri.us/BillStatus${yr}/BillStatus${yr}.asp?bill=${identifier}`;

  const resp = await fetch(statusUrl, { headers: BROWSER_HEADERS });
  if (!resp.ok) return null;

  const html = await resp.text();

  // If the page says "no record" or is empty of useful data, skip
  if (/no record|not found|invalid bill/i.test(html) && !/<table/i.test(html)) return null;

  // Also try to fetch the bill text page for richer metadata
  const chamber = identifier[0]; // H or S
  const textUrl = `https://webserver.rilin.state.ri.us/BillText/BillText${yr}/${chamber}/${identifier}.htm`;
  let textHtml = '';
  try {
    const textResp = await fetch(textUrl, { headers: BROWSER_HEADERS });
    if (textResp.ok) textHtml = await textResp.text();
  } catch {}

  return parseBill(html, textHtml, identifier, yr);
}

function parseBill(statusHtml, textHtml, identifier, yr) {
  const $s = cheerio.load(statusHtml);
  const $t = textHtml ? cheerio.load(textHtml) : null;
  const fullYear = '20' + yr;

  // ── Title ──────────────────────────────────────────────────────
  let title = '';
  // Try common selectors on status page
  for (const sel of ['font[size="2"] b', 'b font', '.BillTitle', '#lblTitle', 'td b']) {
    const t = $s(sel).first().text().trim();
    if (t.length > 30 && /act|relating|amend/i.test(t)) { title = t; break; }
  }
  // Try <title> tag
  if (!title) {
    const t = $s('title').text().trim().replace(/\s+/g, ' ');
    if (t.length > 20 && !/RI Legislature|Bill Status/i.test(t)) title = t;
  }
  // Try the bill text page
  if (!title && $t) {
    for (const sel of ['title', 'h1', 'h2', 'font[size="4"]']) {
      const t = $t(sel).first().text().trim();
      if (t.length > 20) { title = t; break; }
    }
  }
  // Fallback
  if (!title) title = `Rhode Island Bill ${identifier} — ${fullYear} Session`;

  // ── Sponsor ────────────────────────────────────────────────────
  let primarySponsor = '';
  const sponsorMatch = statusHtml.match(/(?:by|sponsor(?:ed by)?|introduced by)[:\s]+((?:Rep\.|Sen\.|Representative|Senator)[^\n<]{3,60})/i);
  if (sponsorMatch) primarySponsor = sponsorMatch[1].replace(/<[^>]+>/g, '').trim();

  // Also check the text page
  if (!primarySponsor && textHtml) {
    const m = textHtml.match(/(?:by|sponsor(?:ed by)?)[:\s]+((?:Rep\.|Sen\.)[^\n<]{3,60})/i);
    if (m) primarySponsor = m[1].replace(/<[^>]+>/g, '').trim();
  }

  // ── Actions ────────────────────────────────────────────────────
  const actions = [];

  // Walk all table rows looking for date + description pairs
  $s('tr').each((_i, row) => {
    const cells = $s(row).find('td');
    if (cells.length < 2) return;

    const col0 = $s(cells[0]).text().trim();
    const col1 = $s(cells[1]).text().trim();

    // Date column: MM/DD/YY or MM/DD/YYYY or YYYY-MM-DD
    const dateMatch = col0.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/) ||
                      col0.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateMatch && col1.length > 3) {
      actions.push({
        date: normalizeDate(col0),
        description: col1.replace(/\s+/g, ' '),
        classification: guessClassification(col1),
        organization: guessOrganization(col1, identifier),
      });
    }
  });

  // Sort ascending by date
  actions.sort((a, b) => new Date(a.date) - new Date(b.date));

  // ── Committee ─────────────────────────────────────────────────
  let committee = '';
  for (const action of actions) {
    const m = action.description.match(/referred to\s+(.+)/i);
    if (m) { committee = m[1].trim().replace(/[.,]$/, ''); break; }
  }
  if (!committee) committee = `${identifier[0] === 'H' ? 'House' : 'Senate'} Committee`;

  const latest = actions[actions.length - 1];

  return {
    id: `ri-${yr}-${identifier}`,
    identifier,
    title,
    abstract: title,
    primarySponsor: primarySponsor || 'See RI General Assembly',
    cosponsors: [],
    committee,
    session: fullYear,
    chamber: identifier[0] === 'H' ? 'House' : 'Senate',
    latestActionDate: latest?.date || null,
    latestActionDescription: latest?.description || null,
    openStatesUrl: `https://openstates.org/ri/bills/${fullYear}/${identifier}/`,
    riLegUrl: `https://webserver.rilin.state.ri.us/BillText/BillText${yr}/${identifier[0]}/${identifier}.htm`,
    actions,
    _source: 'ri_legislature',
  };
}

function normalizeDate(d) {
  // MM/DD/YY or MM/DD/YYYY → YYYY-MM-DD
  const p = d.split('/');
  if (p.length === 3) {
    let y = p[2];
    if (y.length === 2) y = '20' + y;
    return `${y}-${p[0].padStart(2, '0')}-${p[1].padStart(2, '0')}`;
  }
  return d;
}

function guessClassification(desc) {
  const t = desc.toLowerCase();
  if (/introduc/.test(t)) return ['introduction'];
  if (/referred to/.test(t)) return ['referral-committee'];
  if (/reported out|reported favorably|favorable report/.test(t)) return ['committee-passage'];
  if (/held for further study|recommended for study/.test(t)) return [];
  if (/\bpassed\b/.test(t)) return ['passage'];
  if (/\bfailed\b/.test(t)) return ['failure'];
  if (/signed by governor|approved by governor/.test(t)) return ['executive-signature'];
  if (/vetoed/.test(t)) return ['executive-veto'];
  if (/second reading/.test(t)) return ['reading-2'];
  if (/committee hearing/.test(t)) return [];
  return [];
}

function guessOrganization(desc, identifier) {
  const t = desc.toLowerCase();
  if (/senate/.test(t)) return 'Senate';
  if (/house/.test(t)) return 'House';
  if (/governor/.test(t)) return 'Governor';
  return identifier[0] === 'H' ? 'House' : 'Senate';
}
