import { getCachedSummary, cacheSummary, load } from '../utils/storage';

export class NoKeyError extends Error {}

export async function summarize(item, depth) {
  const cached = getCachedSummary(item.id, depth);
  if (cached) return cached.summary;

  const apiKey = load('apiKey', '');
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['x-app-api-key'] = apiKey;

  const resp = await fetch('/api/summarize', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: item.title,
      url: item.link,
      excerpt: item.excerpt,
      source: item.sourceName,
      depth,
    }),
  });

  const data = await resp.json();
  if (resp.status === 401 && data.error === 'no_key') {
    throw new NoKeyError(data.message);
  }
  if (!resp.ok) {
    throw new Error(data.message || data.error || `HTTP ${resp.status}`);
  }

  cacheSummary(item.id, depth, data.summary);
  return data.summary;
}
