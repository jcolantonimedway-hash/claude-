// Vercel serverless function — scrapes RI General Assembly directly.
// No API key needed from the user.

export const config = { runtime: 'nodejs18.x' };

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Upgrade-Insecure-Requests': '1',
};

function sessionYears() {
  const y = new Date().getFullYear();
  return [y, y - 1];
}

function textUrls(id, fullYear) {
  const yr = String(fullYear).slice(2);
  const ch = id[0];
  const dir = ch === 'H' ? 'HouseText' : 'SenateText';
  return [
    `https://webserver.rilegislature.gov/BillText${yr}/${dir}${yr}/${id}.htm`,
    `https://webserver.rilegislature.gov/BillText/BillText${yr}/${dir}${yr}/${id}.htm`,
    `https://webserver.rilin.state.ri.us/BillText/BillText${yr}/${ch}/${id}.htm`,
  ];
}

function statusUrls(id, fullYear) {
  const yr = String(fullYear).slice(2);
  return [
    `https://status.rilegislature.gov/bill_history_report.aspx?bills=${id}&year=${fullYear}`,
    `https://webserver.rilin.state.ri.us/BillStatus${yr}/BillStatus${yr}.asp?bill=${id}`,
  ];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = ((req.query && req.query.identifier) || '').toUpperCase().replace(/\s/g, '');
  if (!id || !/^[HS]\d+$/.test(id)) {
    return res.status(400).json({ error: 'Enter a bill number like H7149 or S2977.' });
  }

  for (const fullYear of sessionYears()) {
    try {
      const bill = await fetchBill(id, fullYear);
      if (bill) return res.status(200).json(bill);
    } catch { /* try next year */ }
  }

  return res.status(404).json({
    error: `"${id}" was not found on the RI General Assembly website. Check the number — 2026 House bills are H7000–H8500, Senate bills are S2000–S3500.`,
  });
}

async function fetchBill(id, fullYear) {
  const ch = id[0];
  const chamber = ch === 'H' ? 'House' : 'Senate';

  // 1. Get bill text (title, sponsor, committee)
  let textHtml = '';
  for (const url of textUrls(id, fullYear)) {
    try {
      const r = await fetch(url, { headers: HEADERS });
      if (r.ok) { textHtml = await r.text(); break; }
    } catch { /* try next URL */ }
  }
  if (!textHtml || textHtml.length < 100) return null;

  const parsed = parseBillText(textHtml, id, fullYear, chamber);
  if (!parsed) return null;

  // 2. Try to get full action history
  let actions = parsed.actions;
  for (const url of statusUrls(id, fullYear)) {
    try {
      const r = await fetch(url, { headers: { ...HEADERS, Referer: 'https://www.rilegislature.gov/' } });
      if (r.ok) {
        const a = parseStatusHtml(await r.text());
        if (a.length > 0) { actions = a; break; }
      }
    } catch { /* try next */ }
  }

  const yr = String(fullYear).slice(2);
  const dir = ch === 'H' ? 'HouseText' : 'SenateText';
  const latest = actions[actions.length - 1];

  return {
    ...parsed,
    actions,
    latestActionDate: latest?.date ?? parsed.latestActionDate,
    latestActionDescription: latest?.description ?? parsed.latestActionDescription,
    riLegUrl: `https://webserver.rilegislature.gov/BillText${yr}/${dir}${yr}/${id}.htm`,
    openStatesUrl: `https://openstates.org/ri/bills/${fullYear}/${id}/`,
  };
}

function parseBillText(html, id, fullYear, chamber) {
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  const raw = preMatch
    ? preMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    : html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  if (!raw || raw.trim().length < 50) return null;

  // Title
  let title = '';
  const rel = raw.match(/RELATING TO\s+([\s\S]{5,300}?)(?=\n\s*\n|\nIntroduced|\nDate|\nReferred)/i);
  if (rel) title = 'An Act Relating to ' + rel[1].replace(/\s+/g, ' ').replace(/\([^)]*\)/g, '').replace(/--\s*/g, '— ').trim();
  if (!title) { const ht = html.match(/<title[^>]*>([^<]+)<\/title>/i); if (ht) title = ht[1].trim(); }
  if (!title) title = `Rhode Island Bill ${id} — ${fullYear} Session`;

  // Sponsor
  let primarySponsor = '', cosponsors = [];
  const sl = raw.match(/Introduced By:\s*([^\n]{5,300})/i) || raw.match(/By:\s*((?:Representative|Senator)[^\n]+)/i);
  if (sl) {
    const all = sl[1].replace(/^Representatives?\s*/i, '').replace(/^Senators?\s*/i, '').trim().split(/,\s*/);
    const pfx = chamber === 'House' ? 'Rep. ' : 'Sen. ';
    primarySponsor = pfx + all[0].trim();
    cosponsors = all.slice(1).filter(Boolean).map(s => pfx + s.trim());
  }

  // Intro date
  let introDate = '';
  const dm = raw.match(/Date Introduced:\s*([A-Za-z]+ \d{1,2},?\s*\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if (dm) { try { introDate = new Date(dm[1]).toISOString().split('T')[0]; } catch {} }

  // Committee
  let committee = '';
  const cm = raw.match(/Referred To:\s*([^\n]{5,120})/i) || raw.match(/referred to\s+(?:the\s+)?([^\n]{5,80})/i);
  if (cm) committee = cm[1].trim().replace(/\s+/g, ' ');

  const actions = [];
  if (introDate) {
    actions.push({
      date: introDate,
      description: committee ? `Introduced, referred to ${committee}` : 'Introduced',
      classification: ['introduction', ...(committee ? ['referral-committee'] : [])],
      organization: chamber,
    });
  }

  return {
    id: `ri-${String(fullYear).slice(2)}-${id}`,
    identifier: id,
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

function parseStatusHtml(html) {
  const actions = [];
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    if (cells.length < 2) continue;
    const c0 = cells[0].replace(/<[^>]+>/g, '').trim();
    const c1 = cells[1].replace(/<[^>]+>/g, '').trim();
    if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(c0) && c1.length > 3) {
      actions.push({
        date: normalizeDate(c0),
        description: c1.replace(/\s+/g, ' '),
        classification: guessClass(c1),
        organization: guessOrg(c1),
      });
    }
  }
  return actions.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function normalizeDate(d) {
  const p = d.split('/');
  if (p.length === 3) { const y = p[2].length === 2 ? '20' + p[2] : p[2]; return `${y}-${p[0].padStart(2,'0')}-${p[1].padStart(2,'0')}`; }
  return d;
}

function guessClass(t) {
  const s = t.toLowerCase();
  if (/introduc/.test(s)) return ['introduction'];
  if (/referred to/.test(s)) return ['referral-committee'];
  if (/reported out|reported favorably/.test(s)) return ['committee-passage'];
  if (/held for further study|recommended for study/.test(s)) return [];
  if (/\bpassed\b/.test(s)) return ['passage'];
  if (/\bfailed\b/.test(s)) return ['failure'];
  if (/signed by governor/.test(s)) return ['executive-signature'];
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
