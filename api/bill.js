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
  const numOnly = id.slice(1); // "7149" from "H7149"
  // Fallback GET attempts — try numeric-only bill number and various URL patterns
  return [
    `https://status.rilegislature.gov/BillDetail.aspx?BillNum=${numOnly}&year=${YEAR}`,
    `http://status.rilegislature.gov/BillDetail.aspx?BillNum=${numOnly}&year=${YEAR}`,
    `https://status.rilegislature.gov/Default.aspx?Year=${YEAR}&Bills=${numOnly}&BillTo=${numOnly}`,
  ];
}

// ──────────────────────────────────────────────────────────────────
// ASP.NET WebForms POST-based status fetch
// The RI status site uses ViewState — we GET the form first, then POST.
// ──────────────────────────────────────────────────────────────────

const STATUS_HOME = 'https://status.rilegislature.gov/';

// Extract ALL form fields with their default values so the POST body
// matches what a real browser would submit.
function extractFormFields(html) {
  // ── 1. All <input> tags ────────────────────────────────────────────
  const inputs = [];
  for (const m of html.matchAll(/<input([^>]+?)(?:\/>|>)/gi)) {
    const attrs = m[1];
    const nameM  = attrs.match(/name="([^"]+)"/i);
    const typeM  = attrs.match(/type="([^"]+)"/i);
    const valueM = attrs.match(/value="([^"]*)"/i);
    if (!nameM) continue;
    inputs.push({
      name:  nameM[1],
      type:  (typeM?.[1] || 'text').toLowerCase(),
      value: valueM?.[1] ?? '',
    });
  }

  // ── 2. All <select> tags with their selected (or first) option ─────
  const selects = [];
  for (const m of html.matchAll(/<select([^>]+)>([\s\S]*?)<\/select>/gi)) {
    const nameM = m[1].match(/name="([^"]+)"/i);
    if (!nameM) continue;
    const options = [];
    let defaultValue = '';
    for (const opt of m[2].matchAll(/<option([^>]*)>([\s\S]*?)<\/option>/gi)) {
      const valM = opt[1].match(/value="([^"]*)"/i);
      const isSel = /\bselected\b/i.test(opt[1]);
      const val = valM?.[1] ?? '';
      options.push({ value: val, text: opt[2].replace(/<[^>]+>/g, '').trim(), selected: isSel });
      if (isSel && !defaultValue) defaultValue = val;
    }
    if (!defaultValue && options.length > 0) defaultValue = options[0].value;
    selects.push({ name: nameM[1], options, defaultValue });
  }

  // ── 3. Build the `fields` map from EVERY hidden input + every select ─
  // This is what a real browser sends — all form fields with default values.
  const fields = {};
  for (const inp of inputs) {
    if (inp.type === 'hidden') fields[inp.name] = inp.value;
  }
  for (const sel of selects) {
    fields[sel.name] = sel.defaultValue;
  }

  const submits    = inputs.filter(i => i.type === 'submit' || i.type === 'image');
  const textInputs = inputs.filter(i =>
    !['hidden','submit','image','button','reset','file','checkbox','radio'].includes(i.type)
  );

  return { fields, inputs, selects, submits, textInputs };
}

async function fetchStatusViaPost(identifier, ms = 12000) {
  // Step 1: GET the real homepage to obtain ViewState + session cookies
  let formHtml = '';
  let formAction = STATUS_HOME;
  let sessionCookies = '';
  let getLength = 0;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    const getRes = await fetch(STATUS_HOME, {
      signal: controller.signal,
      headers: { ...BROWSER_HEADERS, Referer: STATUS_HOME },
    });
    clearTimeout(timer);
    if (!getRes.ok) return null;
    formHtml = await getRes.text();
    getLength = formHtml.length;

    // Capture session cookies so ASP.NET accepts our POST
    const setCookie = getRes.headers.get('set-cookie');
    if (setCookie) {
      sessionCookies = setCookie.split(',')
        .map(c => c.split(';')[0].trim())
        .filter(Boolean)
        .join('; ');
    }

    // Extract form action — handle './', '/', and absolute URLs
    const actionMatch = formHtml.match(/<form[^>]+action="([^"]+)"/i);
    if (actionMatch) {
      const a = actionMatch[1];
      if (a.startsWith('http')) {
        formAction = a;
      } else if (a === './' || a === '.' || a === '') {
        formAction = STATUS_HOME;           // same page
      } else {
        formAction = 'http://status.rilegislature.gov/' + a.replace(/^\//, '');
      }
    }
  } catch {
    return null;
  }

  const { fields, selects, submits, textInputs } = extractFormFields(formHtml);

  // Bill-number field: first visible text input
  const billInput = textInputs[0];
  const billFieldName = billInput?.name || 'ctl00$rilinContent$txtReport';

  // Year dropdown
  let yearFieldName  = 'ctl00$rilinContent$cbYear';
  let yearFieldValue = YEAR;
  for (const sel of selects) {
    const yearOpt = sel.options.find(o => o.value.includes(YEAR) || o.text.includes(YEAR));
    if (yearOpt) { yearFieldName = sel.name; yearFieldValue = yearOpt.value || YEAR; break; }
  }

  // Submit button — confirmed value on RI site is "Enter"
  const submitBtn   = submits[0];
  const submitName  = submitBtn?.name  || 'ctl00$rilinContent$cmdReport';
  const submitValue = submitBtn?.value || 'Enter';   // ← was 'Search'/'View' before

  // Build POST body
  const numOnly = identifier.slice(1); // "7149" from "H7149" — RI status form uses number only
  const body = new URLSearchParams(fields);   // includes __VIEWSTATE, __EVENTVALIDATION, etc.
  // Standard ASP.NET WebForms fields
  body.set('__EVENTTARGET', '');
  body.set('__EVENTARGUMENT', '');
  body.set('__LASTFOCUS', '');
  body.set(billFieldName, numOnly);                    // ← numeric only, not "H7149"
  body.set('ctl00$rilinContent$txtBillTo', numOnly);   // ← same for range end
  body.set(yearFieldName, yearFieldValue);
  body.set(submitName, submitValue);

  // Step 2: POST with session cookies
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    const postRes = await fetch(formAction, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        ...BROWSER_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': STATUS_HOME,
        'Origin': 'https://status.rilegislature.gov',
        ...(sessionCookies ? { Cookie: sessionCookies } : {}),
      },
      body: body.toString(),
    });
    clearTimeout(timer);
    if (!postRes.ok) return null;
    const postHtml = await postRes.text();
    const finalUrl = postRes.url;

    // For debug: first 2 kB (structure), middle (results table), comparison sizes
    const midA = Math.floor(postHtml.length * 0.35);
    const midB = Math.floor(postHtml.length * 0.65);

    return {
      html: postHtml,
      meta: {
        formAction, finalUrl,
        billFieldName, yearFieldName,
        submitName, submitValue,
        numOnly,  // ← confirm we're sending numeric-only bill number
        cookies: sessionCookies.slice(0, 120),
        textInputCount: textInputs.length, selectCount: selects.length,
        viewStateLen: (fields.__VIEWSTATE || '').length,
        getLength,           // GET page size (if == postLength, POST returned the form again)
        postLength: postHtml.length,
        pageContentIdx: postHtml.indexOf('BEGIN PAGE CONTENT'),
        postStart: postHtml.slice(0, 1500),  // beginning — tells us if it's results vs form
        postMidSnippet: postHtml.slice(midA, midB),
      },
    };
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

  // Cross-chamber referral ("Referred to Senate..." / "Referred to House...")
  // Do NOT tag as referral-committee — billUtils RI_DESCRIPTION_PATTERNS handles this
  if (/referred to (the )?(senate|house)\b/i.test(d)) {
    // intentionally empty — handled by description-pattern fallback in actionToStage
  } else if (/referred to/i.test(d)) {
    classes.push('referral-committee');
  }

  if (/held for further study|recommended for study/i.test(d)) classes.push('committee-failure');

  // RI phrases: "Committee recommends passage" / "Committee recommends passage in concurrence"
  if (/reported out|reported favorably|committee recommends passage/i.test(d)) classes.push('committee-passage');

  if (/placed on.*calendar|scheduled for.*floor|second reading/i.test(d)) classes.push('reading-2');

  // RI uses "House read and passed" / "Senate read and passed"
  if (/\bread and passed\b|passed (the )?(house|senate)\b/i.test(d)) classes.push('passage');

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
  const $ = cheerio.load(html, { decodeEntities: true });
  const actions = [];

  // ── Strategy A: separate <td> cells — date in col 0, description in col 1 ──
  $('table tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 2) return;

    const col0 = $(cells[0]).text().trim();
    const col1 = $(cells[1]).text().trim();
    let date = parseDateCell(col0);
    if (date && col1 && col1.length > 2) {
      const org = cells.length > 2 ? $(cells[2]).text().trim() : undefined;
      actions.push({ date, description: col1, classification: classifyDescription(col1), ...(org ? { organization: org } : {}) });
      return;
    }

    // Scan all cells for a date (GridView may have leading icon/checkbox col)
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

  if (actions.length > 0) return actions;

  // ── Strategy B: single-cell rows where date + description are on the same line ──
  // E.g. RI status page: "01/16/2026 Introduced, referred to House Municipal Government..."
  $('table td').each((_, cell) => {
    const text = $(cell).text().trim();
    const m = text.match(/^(\d{1,2}\/\d{1,2}\/\d{4})\s+(.+)/s);
    if (m) {
      const date = parseDateCell(m[1]);
      const desc = m[2].replace(/\s+/g, ' ').trim();
      if (date && desc.length > 2) {
        actions.push({ date, description: desc, classification: classifyDescription(desc) });
      }
    }
  });

  if (actions.length > 0) return actions;

  // ── Strategy C: full-page text scan — handles <pre> blocks and any other layout ──
  const fullText = $('body').text();
  const seen = new Set();
  for (const m of fullText.matchAll(/(\d{1,2}\/\d{1,2}\/\d{4})\s+([A-Za-z][^\n]{4,})/g)) {
    const date = parseDateCell(m[1]);
    // Strip trailing parenthesized scheduling date like "(03/24/2026)"
    const desc = m[2].replace(/\s+/g, ' ').replace(/\s*\(\d{1,2}\/\d{1,2}\/\d{4}\)\s*$/, '').trim();
    if (date && desc.length > 3) {
      const key = `${date}|${desc}`;
      if (!seen.has(key)) {
        seen.add(key);
        actions.push({ date, description: desc, classification: classifyDescription(desc) });
      }
    }
  }

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
      const { html: postHtml, meta } = postResult;
      statusLog.push({
        method: 'POST', url: STATUS_HOME, length: postHtml.length,
        meta,
        // Middle-of-response slice: this is where the results table should appear
        postMidSnippet: meta.postMidSnippet,
        // Beginning of content if marker found
        postContentSnippet: meta.pageContentIdx >= 0
          ? postHtml.slice(meta.pageContentIdx, meta.pageContentIdx + 3000)
          : postHtml.slice(0, 2000),  // first 2 kB (HTML head/structure)
      });
      actions = parseStatusPage(postHtml);
    } else {
      statusLog.push({ method: 'POST', url: STATUS_HOME, ok: false });
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
