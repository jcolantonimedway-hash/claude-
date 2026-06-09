// Thin localStorage helpers — all app state that survives a refresh lives here.

const PREFIX = 'aib_';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — degrade silently
  }
}

const SUMMARY_CACHE_KEY = 'summaries';
const SUMMARY_CACHE_MAX = 150;

export function getCachedSummary(itemId, depth) {
  const cache = load(SUMMARY_CACHE_KEY, {});
  return cache[`${itemId}::${depth}`] || null;
}

export function cacheSummary(itemId, depth, summary) {
  const cache = load(SUMMARY_CACHE_KEY, {});
  cache[`${itemId}::${depth}`] = { summary, at: Date.now() };
  const keys = Object.keys(cache);
  if (keys.length > SUMMARY_CACHE_MAX) {
    keys
      .sort((a, b) => cache[a].at - cache[b].at)
      .slice(0, keys.length - SUMMARY_CACHE_MAX)
      .forEach((k) => delete cache[k]);
  }
  save(SUMMARY_CACHE_KEY, cache);
}
