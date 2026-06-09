// Serverless RSS/Atom fetcher. The browser can't fetch feeds directly (CORS),
// so the client calls /api/feed?url=<feedUrl> and this function fetches,
// parses, and normalizes the feed into a small JSON shape.
import { XMLParser } from 'fast-xml-parser';

const FETCH_TIMEOUT_MS = 12000;
const MAX_ITEMS_PER_FEED = 30;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  // Some feeds put HTML in titles/descriptions; keep raw text
  processEntities: true,
});

function asArray(x) {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

function text(node) {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (typeof node === 'object' && '#text' in node) return String(node['#text']);
  return '';
}

function stripHtml(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function atomLink(entry) {
  const links = asArray(entry.link);
  const alternate = links.find((l) => l['@_rel'] === 'alternate' || !l['@_rel']);
  const chosen = alternate || links[0];
  return chosen ? chosen['@_href'] || text(chosen) : '';
}

function normalizeRss(channel) {
  return asArray(channel.item).map((item) => ({
    title: stripHtml(text(item.title)),
    link: text(item.link) || item.guid?.['#text'] || text(item.guid) || '',
    publishedAt: text(item.pubDate) || text(item['dc:date']) || '',
    excerpt: stripHtml(text(item.description) || text(item['content:encoded'])).slice(0, 600),
    author: stripHtml(text(item['dc:creator']) || text(item.author)),
  }));
}

function normalizeAtom(feed) {
  return asArray(feed.entry).map((entry) => ({
    title: stripHtml(text(entry.title)),
    link: atomLink(entry),
    publishedAt: text(entry.published) || text(entry.updated) || '',
    excerpt: stripHtml(text(entry.summary) || text(entry.content)).slice(0, 600),
    author: stripHtml(text(entry.author?.name)),
  }));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = req.query?.url;
  if (!url || !/^https?:\/\//i.test(url)) {
    res.status(400).json({ error: 'Pass a feed URL as ?url=https://...' });
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ai-briefing/1.0; personal RSS reader)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });

    if (!upstream.ok) {
      res.status(502).json({ error: `Feed returned HTTP ${upstream.status}` });
      return;
    }

    const xml = await upstream.text();
    const doc = parser.parse(xml);

    let items;
    if (doc.rss?.channel) {
      items = normalizeRss(doc.rss.channel);
    } else if (doc.feed) {
      items = normalizeAtom(doc.feed);
    } else if (doc['rdf:RDF']) {
      items = normalizeRss(doc['rdf:RDF']);
    } else {
      res.status(502).json({ error: 'Response was not a recognizable RSS or Atom feed' });
      return;
    }

    items = items
      .filter((i) => i.title && i.link)
      .slice(0, MAX_ITEMS_PER_FEED);

    // Let Vercel's CDN cache feeds for 15 minutes so refreshes are cheap
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    res.status(200).json({ items });
  } catch (err) {
    const message = err.name === 'AbortError' ? 'Feed timed out' : err.message;
    res.status(502).json({ error: message });
  } finally {
    clearTimeout(timer);
  }
}
