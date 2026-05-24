/**
 * Vercel serverless function — RI bill scraper
 * Fetches bill text + action history from the RI General Assembly website.
 * No API key required.
 */

import * as cheerio from 'cheerio';

const YEAR = '2026';
const YEAR_SHORT = '26';

// ──────────────────────────────────────────────────────────────────
// URL builders
// ──────────────────────────────────────────────────────────────────

function getBillTextUrl(id) {
  const chamber = id.startsWith('H') ? 'HouseText' : 'SenateText';
  return `https://webserver.rilegislature.gov/BillText${YEAR_SHORT}/${chamber}${YEAR_SHORT}/${id}.htm`;
}

function getStatusUrl(id) {
  // RI status site — bill detail page
  return `http://status.rilegislature.gov/BillDetail.aspx?BillNum=${id}&year=${YEAR}`;
}

// ──────────────────────────────────────────────────────────────────
// Bill text parser
// ──────────────────────────────────────────────────────────────────

function parseBillText(rawText) {
  // Normalise line endings and collapse excessive whitespace between lines
  const lines = rawText.replace(/\r\n?/g, '\n').split('\n').map(l => l.trim());

  let title = '';
  let primarySponsor = '';
  let cosponsors = [];
  let dateIntroduced = '';
  let committee = '';

  // Collect title lines starting with "AN ACT"
  const titleLines = [];
  let inTitle = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inTitle && /^AN ACT/i.test(line)) {
      inTitle = true;
      titleLines.push(line);
      continue;
    }

    if (inTitle) {
      // Title ends when we hit Introduced By / SECTION / blank line after collecting some
      if (/^(Introduced By:|SECTION\s+\d|It is enacted|Be it enacted)/i.test(line)) {
        inTitle = false;
        // Fall through to process this line normally
      } else if (line === '' && titleLines.length > 0) {
        inTitle = false;
        continue;
      } else {
        titleLines.push(line);
        continue;
      }
    }

    // Sponsor line — may continue onto next line(s) before "Date Introduced"
    if (/^Introduced By:/i.test(line)) {
      let sponsorText = line.replace(/^Introduced By:\s*/i, '').trim();
      // Peek ahead — if next line doesn't look like a key: value, it's a continuation
      let j = i + 1;
      while (j < lines.length && lines[j] !== '' && !/^(Date Introduced:|Referred To:)/i.test(lines[j])) {
        sponsorText += ' ' + lines[j];
        j++;
      }
      // Split on " and " or ","
      const parts = sponsorText
        .replace(/\s+and\s+/gi, ',')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      primarySponsor = parts[0] || '';
      cosponsors = parts.slice(1);
      i = j - 1; // advance past absorbed lines
      continue;
    }

    if (/^Date Introduced:/i.test(line)) {
      dateIntroduced = line.replace(/^Date Introduced:\s*/i, '').trim();
      continue;
    }

    if (/^Referred To:/i.test(line)) {
      committee = line.replace(/^Referred To:\s*/i, '').trim();
      // May continue onto next lines
      let j = i + 1;
      while (j < lines.length && lines[j] !== '' && !/^[A-Z][a-z]/.test(lines[j])) {
        committee += ' ' + lines[j];
        j++;
      }
      committee = committee.trim();
      i = j - 1;
      continue;
    }
  }

  title = titleLines.join(' ').replace(/\s{2,}/g, ' ').trim();

  return { title, primarySponsor, cosponsors, dateIntroduced, committee };
}

// ──────────────────────────────────────────────────────────────────
// Action classification
// ──────────────────────────────────────────────────────────────────

function classifyDescription(desc) {
  const d = desc.toLowerCase();
  const classes = [];

  if (/introduced/i.test(d)) classes.push('introduction');
  if (/referred to/i.test(d)) classes.push('referral-committee');
  if (/held for further study|recommended for study/i.test(d)) classes.push('committee-failure');
  if (/reported out|reported favorably/i.test(d)) classes.push('committee-passage');
  if (/placed on.*calendar|scheduled for.*floor|second reading/i.test(d)) classes.push('reading-2');
  if (/passed (the )?(house|senate)/i.test(d)) classes.push('passage');
  if (/failed/i.test(d) && !/referred/i.test(d)) classes.push('failure');
  if (/signed by (the )?governor/i.test(d)) classes.push('executive-signature');
  if (/vetoed/i.test(d)) classes.push('executive-veto');
  if (/(referred|transmitted|sent) to (the )?(house|senate)/i.test(d) &&
      !/(committee)/i.test(d)) classes.push('referral-committee');

  return classes;
}

// ──────────────────────────────────────────────────────────────────
// Status page parser  (status.rilegislature.gov)
// ──────────────────────────────────────────────────────────────────

function parseStatusPage(html) {
  const $ = cheerio.load(html);
  const actions = [];

  // The RI status site renders a GridView table; each row is an action
  // Look for rows with a date in the first cell
  $('table tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 2) return;

    const col0 = $(cells[0]).text().trim();
    const col1 = $(cells[1]).text().trim();

    // Date pattern: M/D/YYYY or MM/DD/YYYY
    const dateMatch = col0.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!dateMatch) return;

    const date = `${dateMatch[3]}-${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}`;
    const description = col1;
    if (!description) return;

    // Determine which chamber's action this is (col2 may have org)
    const org = cells.length > 2 ? $(cells[2]).text().trim() : '';

    actions.push({
      date,
      description,
      classification: classifyDescription(description),
      organization: org || undefined,
    });
  });

  return actions;
}

// ──────────────────────────────────────────────────────────────────
// ISO date from natural-language string ("January 16, 2026")
// ──────────────────────────────────────────────────────────────────

function toISODate(natural) {
  if (!natural) return null;
  const d = new Date(natural);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

// ──────────────────────────────────────────────────────────────────
// Fetch helper with timeout
// ──────────────────────────────────────────────────────────────────

async function fetchWithTimeout(url, opts = {}, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ──────────────────────────────────────────────────────────────────
// Main handler
// ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const identifier = (req.query.identifier || '').trim().toUpperCase().replace(/\s+/g, '');

  if (!identifier || !/^[HS]\d+$/.test(identifier)) {
    return res.status(400).json({ error: 'Invalid bill identifier. Use format like H7149 or S2977.' });
  }

  // ── 1. Fetch bill text ───────────────────────────────────────────
  const billTextUrl = getBillTextUrl(identifier);
  let billHtml;
  try {
    const r = await fetchWithTimeout(billTextUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RIBillTracker/1.0; +https://claude-beta-one.vercel.app)' },
    });
    if (!r.ok) {
      return res.status(404).json({
        error: `Bill ${identifier} not found. Check that the bill number is correct for the 2026 session.`,
      });
    }
    billHtml = await r.text();
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'RI legislature website timed out. Try again in a moment.' });
    }
    return res.status(502).json({ error: 'Could not reach the RI legislature website. Try again.' });
  }

  // ── 2. Parse bill text ───────────────────────────────────────────
  const $bill = cheerio.load(billHtml);
  const preText = $bill('pre').first().text();

  if (!preText || preText.trim().length < 50) {
    return res.status(422).json({ error: `Could not parse bill text for ${identifier}. The bill may not be available yet.` });
  }

  const { title, primarySponsor, cosponsors, dateIntroduced, committee } = parseBillText(preText);

  // ── 3. Fetch action history ──────────────────────────────────────
  let actions = [];
  try {
    const statusUrl = getStatusUrl(identifier);
    const sr = await fetchWithTimeout(statusUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RIBillTracker/1.0)' },
    }, 8000);
    if (sr.ok) {
      const statusHtml = await sr.text();
      actions = parseStatusPage(statusHtml);
    }
  } catch (_) {
    // Status fetch failed — fall back to synthesising from bill text
  }

  // ── 4. Fall back: synthesise introduction action from bill text ──
  if (actions.length === 0 && dateIntroduced) {
    const isoDate = toISODate(dateIntroduced) || YEAR + '-01-01';
    const introDesc = committee
      ? `Introduced, referred to ${committee}`
      : `Introduced`;
    actions.push({
      date: isoDate,
      description: introDesc,
      classification: ['introduction', ...(committee ? ['referral-committee'] : [])],
    });
  }

  // Sort chronologically
  actions.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const latestAction = actions.length ? actions[actions.length - 1] : null;
  const chamber = identifier.startsWith('H') ? 'House' : 'Senate';

  return res.status(200).json({
    identifier,
    title: title || identifier,
    chamber,
    session: YEAR,
    primarySponsor,
    cosponsors,
    committee,
    latestActionDate: latestAction?.date ?? null,
    latestActionDescription: latestAction?.description ?? null,
    abstract: title || null,
    riLegUrl: billTextUrl,
    openStatesUrl: null,
    actions,
  });
}
