import React, { useState } from 'react';
import { Bookmark, BookmarkCheck, ExternalLink, Sparkles, ChevronUp } from 'lucide-react';
import { LANES } from '../data/defaultSources';
import { timeAgo } from '../utils/time';
import SummaryPanel from './SummaryPanel';

const LANE_BADGE = {
  labs: 'bg-violet-100 text-violet-700',
  policy: 'bg-emerald-100 text-emerald-700',
  news: 'bg-sky-100 text-sky-700',
  newsletters: 'bg-amber-100 text-amber-700',
};

export default function ArticleCard({ item, isRead, isSaved, onRead, onToggleSave, onNeedKey }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className={`bg-white rounded-xl border border-slate-200/80 p-4 transition-opacity ${
        isRead && !expanded ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${LANE_BADGE[item.lane] || 'bg-slate-100 text-slate-600'}`}>
              {LANES[item.lane]?.label || item.lane}
            </span>
            <span className="text-xs text-slate-500 font-medium">{item.sourceName}</span>
            <span className="text-xs text-slate-400">{timeAgo(item.publishedAt)}</span>
          </div>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRead(item.id)}
            className="font-semibold text-slate-800 hover:text-indigo-700 leading-snug block"
          >
            {item.title}
            <ExternalLink className="w-3 h-3 inline ml-1 mb-0.5 text-slate-300" />
          </a>
          {item.excerpt && !expanded && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.excerpt}</p>
          )}
        </div>
        <button
          onClick={() => onToggleSave(item)}
          title={isSaved ? 'Remove from saved' : 'Save for later'}
          className={`shrink-0 p-1.5 rounded-lg transition-colors ${
            isSaved ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'
          }`}
        >
          {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>

      <div className="mt-2">
        <button
          onClick={() => {
            setExpanded(!expanded);
            if (!expanded) onRead(item.id);
          }}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          {expanded ? 'Hide summary' : 'Summarize'}
        </button>
      </div>

      {expanded && <SummaryPanel item={item} onNeedKey={onNeedKey} />}
    </article>
  );
}
