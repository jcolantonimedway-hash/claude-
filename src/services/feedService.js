// Fetches all enabled sources through /api/feed in parallel and merges them
// into one reverse-chronological list. Per-source failures don't sink the
// rest — they're reported in `statuses` and shown in Settings.

function itemId(sourceId, link) {
  return `${sourceId}:${link}`;
}

export async function fetchAllFeeds(sources) {
  const enabled = sources.filter((s) => s.enabled);

  const results = await Promise.all(
    enabled.map(async (source) => {
      try {
        const resp = await fetch(`/api/feed?url=${encodeURIComponent(source.url)}`);
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
        return { source, items: data.items, error: null };
      } catch (err) {
        return { source, items: [], error: err.message };
      }
    })
  );

  const items = results.flatMap(({ source, items: feedItems }) =>
    feedItems.map((item) => ({
      ...item,
      id: itemId(source.id, item.link),
      sourceId: source.id,
      sourceName: source.name,
      lane: source.lane,
    }))
  );

  items.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

  const statuses = Object.fromEntries(
    results.map(({ source, error, items: feedItems }) => [
      source.id,
      error ? { ok: false, error } : { ok: true, count: feedItems.length },
    ])
  );

  return { items, statuses };
}
