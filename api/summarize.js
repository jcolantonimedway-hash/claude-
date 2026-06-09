// Claude-powered article summaries at three depths.
// The API key comes from the ANTHROPIC_API_KEY env var (set in Vercel),
// or from the 'x-app-api-key' header (key the user saved in Settings).
import Anthropic from '@anthropic-ai/sdk';
import * as cheerio from 'cheerio';

const FETCH_TIMEOUT_MS = 12000;
const MAX_ARTICLE_CHARS = 24000;

const DEPTHS = {
  headline: {
    maxTokens: 300,
    instruction:
      'Give the single most important takeaway in 1-2 sentences. No preamble, no "this article discusses" — just the takeaway itself, as if briefing a colleague in the hallway.',
  },
  brief: {
    maxTokens: 800,
    instruction:
      'Write a two-paragraph brief: paragraph one covers what happened and the key facts; paragraph two covers why it matters for someone tracking AI development, policy, and governance. No preamble or headers.',
  },
  deep: {
    maxTokens: 2000,
    instruction:
      'Write a deep-dive explainer. Cover: what happened, the relevant background and context, why it matters for AI development/policy/governance, and what to watch next. Unpack any jargon or technical concepts inline in plain language the first time they appear. Use short paragraphs; a few bold key phrases are fine; no headers.',
  },
};

async function fetchArticleText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ai-briefing/1.0; personal RSS reader)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    const $ = cheerio.load(html);
    $('script, style, nav, header, footer, iframe, noscript, form, aside').remove();
    const main = $('article').text() || $('main').text() || $('body').text();
    const cleaned = main.replace(/\s+/g, ' ').trim();
    return cleaned.length > 200 ? cleaned.slice(0, MAX_ARTICLE_CHARS) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-api-key');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }

  const apiKey = req.headers['x-app-api-key'] || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(401).json({
      error: 'no_key',
      message: 'Add your Anthropic API key in Settings to unlock summaries.',
    });
    return;
  }

  const { title, url, excerpt, source, depth = 'brief' } = req.body || {};
  const depthConfig = DEPTHS[depth] || DEPTHS.brief;
  if (!title || !url) {
    res.status(400).json({ error: 'title and url are required' });
    return;
  }

  const articleText = await fetchArticleText(url);
  const content = articleText
    ? `Full article text:\n${articleText}`
    : `The full article could not be fetched. Work from this RSS excerpt (and say so if it is too thin to be confident):\n${excerpt || '(no excerpt available)'}`;

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: depthConfig.maxTokens,
      system:
        'You summarize AI news for an informed generalist who follows AI closely and is building expertise in AI policy and governance. Be accurate, concrete, and free of hype. Never invent facts not present in the provided text.',
      messages: [
        {
          role: 'user',
          content: `Article: "${title}" (from ${source || 'unknown source'}, ${url})\n\n${content}\n\n---\n${depthConfig.instruction}`,
        },
      ],
    });

    const summary = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    res.status(200).json({ summary, usedFullArticle: Boolean(articleText) });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      res.status(401).json({ error: 'bad_key', message: 'That API key was rejected. Check it in Settings.' });
    } else if (err instanceof Anthropic.RateLimitError) {
      res.status(429).json({ error: 'rate_limited', message: 'Rate limited — try again in a minute.' });
    } else if (err instanceof Anthropic.APIError) {
      res.status(502).json({ error: 'api_error', message: err.message });
    } else {
      res.status(500).json({ error: 'server_error', message: err.message });
    }
  }
}
