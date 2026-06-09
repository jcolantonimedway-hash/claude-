import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { LANES } from '../data/defaultSources';
import ArticleCard from './ArticleCard';

const PAGE_SIZE = 25;

export default function FeedView({ items, readIds, savedIds, onRead, onToggleSave, onNeedKey }) {
  const [laneFilter, setLaneFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [hideRead, setHideRead] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const q = query.trim().toLowerCase();
  const filtered = items.filter((i) => {
    if (laneFilter !== 'all' && i.lane !== laneFilter) return false;
    if (hideRead && readIds.has(i.id)) return false;
    if (q && !`${i.title} ${i.excerpt} ${i.sourceName}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, excerpts, sources…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setLaneFilter('all')}
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              laneFilter === 'all' ? 'bg-ink text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {Object.entries(LANES).map(([lane, { label }]) => (
            <button
              key={lane}
              onClick={() => setLaneFilter(lane)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                laneFilter === lane ? 'bg-ink text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideRead}
              onChange={(e) => setHideRead(e.target.checked)}
              className="rounded accent-indigo-600"
            />
            Hide read
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.slice(0, limit).map((item) => (
          <ArticleCard
            key={item.id}
            item={item}
            isRead={readIds.has(item.id)}
            isSaved={savedIds.has(item.id)}
            onRead={onRead}
            onToggleSave={onToggleSave}
            onNeedKey={onNeedKey}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-12">No items match — try clearing filters.</p>
      )}

      {filtered.length > limit && (
        <button
          onClick={() => setLimit(limit + PAGE_SIZE)}
          className="w-full py-2.5 text-sm font-medium text-indigo-600 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50 transition-colors"
        >
          Show more ({filtered.length - limit} remaining)
        </button>
      )}
    </div>
  );
}
