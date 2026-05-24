/**
 * Vercel serverless function — RI bill scraper
 * Fetches bill text + action history from the RI General Assembly website.
 * No API key required.
 */

import * as cheerio from 'cheerio';

const YEAR = '2026';
const YEAR_SHORT = '26';

// ──────────────────────────────────────────────────────────────────
// URL builders — try multiple domains/paths since RI changed infra
// ──────────────────────────────────────────────────────────────────

function getBillTextUrls(id) {
  const chamberFolder = id.startsWith('H') ? 'HouseText' : 'SenateText';
  return [
    // New 2026 domain
    `https://webserver.rilegislature.gov/BillText${YEAR_SHORT}/${chamberFolder}${YEAR_SHORT}/${id}.htm`,
    // Old domain still serving 2026 text
    `https://webserver.rilin.state.ri.us/BillText/BillText${YEAR_SHORT}/${chamberFolder}${YEAR_SHORT}/${id}.htm`,
    // Old domain, old path style
    `https://webserver.rilin.state.ri.us/BillText${YEAR_SHORT}/${chamberFolder}${YEAR_SHORT}/${id}.htm`,
  ];
}

function getStatusUrls(id) {
  return [
    `http://status.rilegislature.gov/BillDetail.aspx?BillNum=${id}&year=${YEAR}`,
    `http://status.rilin.state.ri.us/BillDetail.aspx?BillNum=${id}&year=${YEAR}`,
  ];
}

// ──────────────────────────────────────────────────────────────────
// Fetch helper with timeout
// ──────────────────────────────────────────────────────────────────

async function fetchWithTimeout(url, opts = {}, ms = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.rilegislature.gov/',
        ...opts.headers,
      },
      ...opts,
    });
  } finally {
    clearTimeout(timer);
  }
}

// Try a list of URLs, returning the first successful response
async function fetchFirstOk(urls) {
  for (const url of urls) {
    try {
      const r = await fetchWithTimeout(url);
      if (r.ok) return { res: r, url };
    } catch (_) { /* try next */ }
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────
// Extract bill text from HTML — try multiple strategies
// ──────────────────────────────────────────────────────────────────

function extractBillText(html) {
  const $ = cheerio.load(html);

  // Strategy 1: standard <pre> tag
  const pre = $('pre').first().text();
  if (pre && pre.trim().length > 80) return pre;

  // Strategy 2: <pre> anywhere deeper
  let longest = '';
  $('pre').each((_, el) => {
    const t = $(el).text();
    if (t.length > longest.length) longest = t;
  });
  if (longest.trim().length > 80) return longest;

  // Strategy 3: look for "AN ACT" in the full body text
  const bodyText = $('body').text();
  const actIdx = bodyText.search(/AN ACT/i);
  if (actIdx !== -1) {
    return bodyText.slice(actIdx);
  }

  // Strategy 4: just return the body text and let parser deal with it
  if (bodyText.trim().length > 80) return bodyText;

  return '';
}

// ──────────────────────────────────────────────────────────────────
// Bill text parser
// ──────────────────────────────────────────────────────────────────

function parseBillText(rawText) {
  const lines = rawText.replace(/\r\n?/g, '\n').split('\n').map(l => l.trim());

  let title = '';
  let primarySponsor = '';
  let cosponsors = [];
  let dateIntroduced = '';
  let committee = '';

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
      if (/^(Introduced By:|SECTION\s+\d|It is enacted|Be it enacted)/i.test(line)) {
        inTitle = false;
        // fall through to process this line
      } else if (line === '' && titleLines.length > 0) {
        inTitle = false;
        continue;
      } else {
        titleLines.push(line);
        continue;
      }
    }

    if (/^Introduced By:/i.test(line)) {
      let sponsorText = line.replace(/^Introduced By:\s*/i, '').trim();
      let j = i + 1;
      while (j < lines.length && lines[j] !== '' && !/^(Date Introduced:|Referred To:)/i.test(lines[j])) {
        sponsorText += ' ' + lines[j];
        j++;
      }
      const parts = sponsorText
        .replace(/\s+and\s+/gi, ',')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      primarySponsor = parts[0] || '';
      cosponsors = parts.slice(1);
      i = j - 1;
      continue;
    }

    if (/^Date Introduced:/i.test(line)) {
      dateIntroduced = line.replace(/^Date Introduced:\s*/i, '').trim();
      continue;
    }

    if (/^Referred To:/i.test(line)) {
      committee = line.replace(/^Referred To:\s*/i, '').trim();
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
  if (/(transmitted|sent) to (the )?(house|senate)/i.test(d) && !/committee/i.test(d)) {
    classes.push('referral-committee');
  }

  return classes;
}

// ──────────────────────────────────────────────────────────────────
// Status page parser
// ──────────────────────────────────────────────────────────────────

function parseStatusPage(html) {
  const $ = cheerio.load(html);
  const actions = [];

  $('table tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 2) return;

    const col0 = $(cells[0]).text().trim();
    const col1 = $(cells[1]).text().trim();

    const dateMatch = col0.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!dateMatch || !col1) return;

    const date = `${dateMatch[3]}-${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}`;
    const org = cells.length > 2 ? $(cells[2]).text().trim() : undefined;

    actions.push({
      date,
      description: col1,
      classification: classifyDescription(col1),
      ...(org ? { organization: org } : {}),
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
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

// ──────────────────────────────────────────────────────────────────
// Main handler
// ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const identifier = (req.query.identifier || '').trim().toUpperCase().replace(/\s+/g, '');
  const debug = req.query.debug === '1';

  if (!identifier || !/^[HS]\d+$/.test(identifier)) {
    return res.status(400).json({ error: 'Invalid bill identifier. Use format like H7149 or S2977.' });
  }

  // ── 1. Fetch bill text (try multiple URLs) ───────────────────────
  const billUrls = getBillTextUrls(identifier);
  const billFetch = await fetchFirstOk(billUrls);

  if (!billFetch) {
    return res.status(404).json({
      error: `Bill ${identifier} not found. The bill number may be incorrect or not yet available for the 2026 session.`,
    });
  }

  const { res: billResponse, url: billTextUrl } = billFetch;
  const billHtml = await billResponse.text();

  // Debug mode: return raw HTML info
  if (debug) {
    const $ = cheerio.load(billHtml);
    return res.status(200).json({
      debug: true,
      url: billTextUrl,
      htmlLength: billHtml.length,
      preCount: $('pre').length,
      preLength: $('pre').first().text().length,
      bodyTextLength: $('body').text().length,
      bodyTextSnippet: $('body').text().slice(0, 500),
      titleTag: $('title').text(),
    });
  }

  // ── 2. Extract + parse bill text ────────────────────────────────
  const billText = extractBillText(billHtml);

  if (!billText || billText.trim().length < 30) {
    return res.status(422).json({
      error: `Bill ${identifier} text could not be read from the RI legislature website. Try again in a moment.`,
      _debug: { url: billTextUrl, htmlLength: billHtml.length },
    });
  }

  const { title, primarySponsor, cosponsors, dateIntroduced, committee } = parseBillText(billText);

  // ── 3. Fetch action history ──────────────────────────────────────
  let actions = [];
  const statusFetch = await fetchFirstOk(getStatusUrls(identifier));
  if (statusFetch) {
    try {
      const statusHtml = await statusFetch.res.text();
      actions = parseStatusPage(statusHtml);
    } catch (_) { /* ignore */ }
  }

  // ── 4. Fall back: synthesise from bill text ──────────────────────
  if (actions.length === 0) {
    const isoDate = toISODate(dateIntroduced) || `${YEAR}-01-01`;
    const introDesc = committee
      ? `Introduced, referred to ${committee}`
      : 'Introduced';
    actions.push({
      date: isoDate,
      description: introDesc,
      classification: ['introduction', ...(committee ? ['referral-committee'] : [])],
    });
  }

  actions.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const latestAction = actions[actions.length - 1];
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
