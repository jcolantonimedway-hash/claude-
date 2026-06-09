// Default feed list — fully editable in Settings. Lanes group the feed UI.
// Note: Anthropic has no official RSS feed; openrss.org generates one from
// their news page. If a feed breaks, fix or replace its URL in Settings.

export const LANES = {
  labs: { label: 'Frontier Labs', color: 'violet' },
  policy: { label: 'Policy & Governance', color: 'emerald' },
  news: { label: 'News', color: 'sky' },
  newsletters: { label: 'Newsletters', color: 'amber' },
};

export const DEFAULT_SOURCES = [
  // Frontier labs
  { id: 'openai', name: 'OpenAI News', url: 'https://openai.com/news/rss.xml', lane: 'labs', enabled: true },
  { id: 'anthropic', name: 'Anthropic News', url: 'https://openrss.org/www.anthropic.com/news', lane: 'labs', enabled: true },
  { id: 'deepmind', name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml', lane: 'labs', enabled: true },
  { id: 'meta-ai', name: 'Meta AI', url: 'https://ai.meta.com/blog/rss/', lane: 'labs', enabled: true },

  // Policy & governance
  { id: 'cset', name: 'CSET (Georgetown)', url: 'https://cset.georgetown.edu/feed/', lane: 'policy', enabled: true },
  { id: 'brookings-ai', name: 'Brookings — AI', url: 'https://www.brookings.edu/topic/artificial-intelligence/feed/', lane: 'policy', enabled: true },
  { id: 'rand-ai', name: 'RAND — AI', url: 'https://www.rand.org/topics/artificial-intelligence.xml', lane: 'policy', enabled: true },
  { id: 'ainow', name: 'AI Now Institute', url: 'https://ainowinstitute.org/feed', lane: 'policy', enabled: true },

  // News
  { id: 'verge-ai', name: 'The Verge — AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', lane: 'news', enabled: true },
  { id: 'techcrunch-ai', name: 'TechCrunch — AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', lane: 'news', enabled: true },
  { id: 'ars-ai', name: 'Ars Technica — AI', url: 'https://arstechnica.com/ai/feed/', lane: 'news', enabled: true },
  { id: 'mittr-ai', name: 'MIT Tech Review — AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', lane: 'news', enabled: true },

  // Newsletters (these also cover most of what AI-Twitter is discussing)
  { id: 'importai', name: 'Import AI (Jack Clark)', url: 'https://importai.substack.com/feed', lane: 'newsletters', enabled: true },
  { id: 'transformer', name: 'Transformer (Shakeel Hashim)', url: 'https://www.transformernews.ai/rss/', lane: 'newsletters', enabled: true },
  { id: 'zvi', name: "Don't Worry About the Vase (Zvi)", url: 'https://thezvi.substack.com/feed', lane: 'newsletters', enabled: true },
  { id: 'aisnakeoil', name: 'AI Snake Oil', url: 'https://www.aisnakeoil.com/feed', lane: 'newsletters', enabled: true },
];
