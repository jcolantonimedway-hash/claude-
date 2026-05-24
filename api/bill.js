/**
 * Vercel serverless function — RI bill scraper
 * Fetches bill text + action history from the RI General Assembly website.
 * No API key required.
 */

import * as cheerio from 'cheerio';

const YEAR = '2026';
const YEAR_SHORT = '26';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Referer': 'https://www.rilegislature.gov/',
};

// ──────────────────────────────────────────────────────────────────
// Fetch helper with timeout
// ──────────────────────────────────────────────────────────────────

async function fetchWithTimeout(url, ms = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, headers: BROWSER_HEADERS });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchTextWithTimeout(url, ms = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: { ...BROWSER_HEADERS, Accept: 'text/plain,text/html,*/*' },
    });
    return r.ok ? { ok: true, text: await r.text(), url } : { ok: false };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

// ──────────────────────────────────────────────────────────────────
// Build all candidate URLs for bill text
// ──────────────────────────────────────────────────────────────────

function getBillTextUrls(id) {
  const isHouse = id.startsWith('H');
  const chamberFolder = isHouse ? 'HouseText' : 'SenateText';
  const numOnly = id.slice(1); // e.g. "7149"

  return [
    // Plain-text .txt files (most reliable, no HTML to parse)
    `https://webserver.rilegislature.gov/BillText${YEAR_SHORT}/${chamberFolder}${YEAR_SHORT}/${id}.txt`,
    `https://webserver.rilin.state.ri.us/BillText/BillText${YEAR_SHORT}/${chamberFolder}${YEAR_SHORT}/${id}.txt`,
    // .htm versions — new and old domains
    `https://webserver.rilegislature.gov/BillText${YEAR_SHORT}/${chamberFolder}${YEAR_SHORT}/${id}.htm`,
    `https://webserver.rilin.state.ri.us/BillText/BillText${YEAR_SHORT}/${chamberFolder}${YEAR_SHORT}/${id}.htm`,
    `https://webserver.rilin.state.ri.us/BillText${YEAR_SHORT}/${chamberFolder}${YEAR_SHORT}/${id}.htm`,
  ];
}

function getStatusUrls(id) {
  // These are now only used as fallback GET attempts
  return [
    `http://status.rilegislature.gov/BillDetail.aspx?BillNum=${id}&year=${YEAR}`,
    `https://status.rilegislature.gov/BillDetail.aspx?BillNum=${id}&year=${YEAR}`,
  ];
}

// ──────────────────────────────────────────────────────────────────
// ASP.NET WebForms POST-based status fetch
// The RI status site uses ViewState — we GET the form first, then POST.
// ──────────────────────────────────────────────────────────────────

const STATUS_BASE = 'http://status.rilegislature.gov/BillDetail.aspx';

async function fetchStatusViaPost(identifier, ms = 10000) {
  // Step 1: GET the search form to harvest ViewState + field names
  let formHtml;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    const getRes = await fetch(STATUS_BASE, {
      signal: controller.signal,
      headers: { ...BROWSER_HEADERS, Referer: 'http://status.rilegislature.gov/' },
    });
    clearTimeout(timer);
    if (!getRes.ok) return null;
    formHtml = await getRes.text();
  } catch {
    return null;
  }

  const $form = cheerio.load(formHtml);

  // Extract ASP.NET hidden fields
  const viewState       = $form('input[name="__VIEWSTATE"]').val() || '';
  const eventValidation = $form('input[name="__EVENTVALIDATION"]').val() || '';
  const viewStateGen    = $form('input[name="__VIEWSTATEGENERATOR"]').val() || '';

  // Find bill-number input field (text inputs, excluding hidden)
  let billFieldName = '';
  $form('input[type="text"], input[type="Text"]').each((_, el) => {
    const name = $form(el).attr('name') || '';
    if (/bill|num/i.test(name)) { billFieldName = name; return false; }
  });
  if (!billFieldName) {
    // Fallback: pick first non-hidden text input
    $form('input').each((_, el) => {
      const type = ($form(el).attr('type') || '').toLowerCase();
      const name = $form(el).attr('name') || '';
      if ((type === 'text' || type === '') && name && !name.startsWith('__')) {
        billFieldName = name;
        return false;
      }
    });
  }

  // Find year/session dropdown
  let yearFieldName = '';
  let yearFieldValue = YEAR;
  $form('select').each((_, el) => {
    const name = $form(el).attr('name') || '';
    if (/year|session/i.test(name)) {
      yearFieldName = name;
      // Find the option matching our year
      $form(el).find('option').each((__, opt) => {
        const val = $form(opt).attr('value') || '';
        if (val.includes(YEAR)) { yearFieldValue = val; return false; }
      });
      return false;
    }
  });

  // Find submit button
  let submitName = '', submitValue = '';
  $form('input[type="submit"], input[type="Submit"]').first().each((_, el) => {
    submitName  = $form(el).attr('name')  || '';
    submitValue = $form(el).attr('value') || 'Search';
  });

  // Build form body
  const body = new URLSearchParams();
  if (viewState)       body.set('__VIEWSTATE',          viewState);
  if (eventValidation) body.set('__EVENTVALIDATION',    eventValidation);
  if (viewStateGen)    body.set('__VIEWSTATEGENERATOR', viewStateGen);
  if (billFieldName)   body.set(billFieldName, identifier);
  if (yearFieldName)   body.set(yearFieldName, yearFieldValue);
  if (submitName)      body.set(submitName, submitValue);

  // Step 2: POST
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    const postRes = await fetch(STATUS_BASE, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        ...BROWSER_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': STATUS_BASE,
      },
      body: body.toString(),
    });
    clearTimeout(timer);
    if (!postRes.ok) return null;
    return { html: await postRes.text(), formFieldNames: { billFieldName, yearFieldName, submitName } };
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────────────────────────
// Extract bill text from whatever content the RI server returned
// Handles: plain text, <pre>-wrapped HTML, frameset, full-page HTML
// ──────────────────────────────────────────────────────────────────

function extractBillText(rawContent, contentType = '') {
  const isPlainText = contentType.includes('text/plain') || !rawContent.trim().startsWith('<');

  // Plain text — use directly
  if (isPlainText) return rawContent;

  const $ = cheerio.load(rawContent);

  // Detect frameset — if the page is just a frame container, there's no bill text here
  // (frameset means content is in a sub-frame we can't follow easily)
  if ($('frameset').length > 0 || $('frame').length > 0) {
    // Try to find a frame src that might point to the real content
    const frameSrc = $('frame').first().attr('src');
    return `__FRAMESET__:${frameSrc || ''}`;
  }

  // Look for the longest <pre> tag — bill text is typically there
  let longestPre = '';
  $('pre').each((_, el) => {
    const t = $(el).text();
    if (t.length > longestPre.length) longestPre = t;
  });
  if (longestPre.trim().length > 80) return longestPre;

  // Search for "AN ACT" anywhere in body text
  const bodyText = $('body').text();
  const actIdx = bodyText.search(/AN ACT/i);
  if (actIdx !== -1) return bodyText.slice(actIdx);

  // Last resort: return all body text
  return bodyText;
}

// ──────────────────────────────────────────────────────────────────
// Bill text parser — handles the RI HTML format
//
// Key quirks observed in the wild:
//  • "AN ACT" is rendered with letter-spacing as "A N    A C T" — don't match it directly
//  • All header fields are on ONE long line separated by 4–8 spaces (no newlines)
//  • Fields: "Introduced By: ... [spaces] Date Introduced: ... [spaces] Referred To: ..."
// ──────────────────────────────────────────────────────────────────

function parseBillText(rawText) {
  let title = '';
  let primarySponsor = '';
  let cosponsors = [];
  let dateIntroduced = '';
  let committee = '';

  const text = rawText.replace(/\r\n?/g, '\n');

  // ── Title ──────────────────────────────────────────────────────
  // "AN ACT" has letter-spacing artifacts ("A N    A C T"), so match "RELATING TO" instead.
  // Capture everything from "RELATING TO" up to the 4+ spaces before "Introduced By:".
  const titleMatch = text.match(/RELATING TO\s+(.*?)(?=\s{4,}Introduced By:|Introduced By:)/is);
  if (titleMatch) {
    title = ('AN ACT RELATING TO ' + titleMatch[1].replace(/\s+/g, ' ')).trim();
  }

  // ── Sponsor: from "Introduced By:" to "Date Introduced:" ──────
  const sponsorMatch = text.match(/Introduced By:\s*(.*?)(?=\s{3,}Date Introduced:|Date Introduced:)/is);
  if (sponsorMatch) {
    const raw = sponsorMatch[1].trim();
    // Strip leading title word ("Representatives", "Senators", etc.)
    const sponsorText = raw.replace(/^(Representatives?|Senators?)\s+/i, '');
    const parts = sponsorText.replace(/\s+and\s+/gi, ',').split(',').map(s => s.trim()).filter(Boolean);
    primarySponsor = parts[0] || '';
    cosponsors = parts.slice(1);
  }

  // ── Date: just the month/day/year — stop before next field ────
  const dateMatch = text.match(/Date Introduced:\s*([A-Z][a-z]+ \d{1,2},\s*\d{4})/i);
  if (dateMatch) {
    dateIntroduced = dateMatch[1].trim();
  } else {
    // Fallback: capture to next spaces
    const dateFallback = text.match(/Date Introduced:\s*(.*?)(?=\s{3,}|$)/i);
    if (dateFallback) {
      dateIntroduced = dateFallback[1].trim();
      const dateMatch2 = text.match(/Date Introduced:\s*([^\n]+)/i);
      if (dateMatch2) {
        dateIntroduced = dateMatch2[1].trim().replace(/\s{3,}.+$/i, '').trim();
      }
    }
  }

  // ── Committee: from "Referred To:" to "It is enacted" ─────────
  const committeeMatch = text.match(/Referred To:\s*(.*?)(?=\s{4,}It is enacted|\s{4,}Be it enacted|It is enacted|Be it enacted)/is);
  if (committeeMatch) {
    committee = committeeMatch[1].replace(/\s+/g, ' ').trim();
  } else {
    // Fallback: up to next 3+ spaces
    const committeeFallback = text.match(/Referred To:\s*(.+?)(?=\s{3,}|$)/i);
    if (committeeFallback) {
      committee = committeeFallback[1].replace(/\s+/g, ' ').trim();
    }
  }

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
  return classes;
}

// ──────────────────────────────────────────────────────────────────
// Status page parser — multiple strategies for RI's ASP.NET GridView
// ──────────────────────────────────────────────────────────────────

function parseDateCell(text) {
  // Accepts: 1/16/2026, 01/16/2026, 1-16-2026, January 16 2026, etc.
  const t = text.trim();
  const slash = t.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slash) {
    return `${slash[3]}-${slash[1].padStart(2, '0')}-${slash[2].padStart(2, '0')}`;
  }
  const natural = new Date(t);
  if (!isNaN(natural.getTime()) && t.length > 4) {
    return natural.toISOString().split('T')[0];
  }
  return null;
}

function parseStatusPage(html) {
  // ISO-8859-1 page — cheerio handles charset automatically
  const $ = cheerio.load(html, { decodeEntities: true });
  const actions = [];

  $('table tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 2) return;

    // Strategy A: first cell is date, second is description
    const col0 = $(cells[0]).text().trim();
    const col1 = $(cells[1]).text().trim();
    let date = parseDateCell(col0);
    if (date && col1 && col1.length > 2) {
      const org = cells.length > 2 ? $(cells[2]).text().trim() : undefined;
      actions.push({ date, description: col1, classification: classifyDescription(col1), ...(org ? { organization: org } : {}) });
      return;
    }

    // Strategy B: scan all cells for a date (GridView may have leading checkbox/icon col)
    for (let i = 0; i < cells.length - 1; i++) {
      const cellText = $(cells[i]).text().trim();
      date = parseDateCell(cellText);
      if (date) {
        const desc = $(cells[i + 1]).text().trim();
        if (desc && desc.length > 2) {
          const org = cells.length > i + 2 ? $(cells[i + 2]).text().trim() : undefined;
          actions.push({ date, description: desc, classification: classifyDescription(desc), ...(org ? { organization: org } : {}) });
        }
        break;
      }
    }
  });

  return actions;
}

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

  // ── 1. Try each bill text URL until one works ─────────────────
  const urls = getBillTextUrls(identifier);
  let billText = '';
  let billTextUrl = '';
  let fetchLog = [];

  for (const url of urls) {
    try {
      const r = await fetchTextWithTimeout(url);
      if (!r.ok) { fetchLog.push({ url, ok: false }); continue; }
      const raw = r.text;
      fetchLog.push({ url, ok: true, length: raw.length });

      const extracted = extractBillText(raw, '');

      // Frameset — skip to next URL (we can't follow frame src easily)
      if (extracted.startsWith('__FRAMESET__')) {
        fetchLog.push({ url, note: 'frameset', frameSrc: extracted.split(':')[1] });
        continue;
      }

      if (extracted.trim().length > 80) {
        billText = extracted;
        billTextUrl = url;
        break;
      }
    } catch (err) {
      fetchLog.push({ url, error: err.message });
    }
  }

  if (!billText) {
    return res.status(404).json({
      error: `Bill ${identifier} not found. Check the bill number or try again — the RI legislature website may be temporarily unavailable.`,
    });
  }

  // ── 2. Parse bill text ───────────────────────────────────────
  const { title, primarySponsor, cosponsors, dateIntroduced, committee } = parseBillText(billText);

  // ── 3. Fetch action history (POST-based WebForms, then GET fallback) ──
  let actions = [];
  let statusLog = [];

  // Primary: ASP.NET POST approach
  try {
    const postResult = await fetchStatusViaPost(identifier);
    if (postResult) {
      const { html: postHtml, formFieldNames } = postResult;
      statusLog.push({
        method: 'POST', url: STATUS_BASE, length: postHtml.length,
        formFieldNames,
        snippet2000: postHtml.slice(2000, 5000),
      });
      actions = parseStatusPage(postHtml);
    } else {
      statusLog.push({ method: 'POST', url: STATUS_BASE, ok: false });
    }
  } catch (err) {
    statusLog.push({ method: 'POST', error: err.message });
  }

  // Fallback: GET attempts
  if (actions.length === 0) {
    for (const statusUrl of getStatusUrls(identifier)) {
      try {
        const r = await fetchTextWithTimeout(statusUrl);
        statusLog.push({ method: 'GET', url: statusUrl, ok: r.ok, length: r.ok ? r.text.length : 0 });
        if (r.ok && r.text.length > 200) {
          actions = parseStatusPage(r.text);
          if (actions.length > 0) break;
        }
      } catch (err) {
        statusLog.push({ method: 'GET', url: statusUrl, error: err.message });
      }
    }
  }

  // Debug mode — return full diagnostics including status site results
  if (debug) {
    return res.status(200).json({
      debug: true, identifier, fetchLog, billTextSnippet: billText.slice(0, 400),
      parsed: { title, primarySponsor, cosponsors, dateIntroduced, committee },
      statusLog, actionsFound: actions.length, actions,
    });
  }

  // ── 4. Fallback actions from bill text ───────────────────────
  if (actions.length === 0) {
    const isoDate = toISODate(dateIntroduced) || `${YEAR}-01-01`;
    actions.push({
      date: isoDate,
      description: committee ? `Introduced, referred to ${committee}` : 'Introduced',
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
    riLegUrl: billTextUrl || urls[2],
    openStatesUrl: null,
    actions,
  });
}
