import React from 'react';
import { Coffee } from 'lucide-react';
import { LANES } from '../data/defaultSources';
import { isWithinHours } from '../utils/time';
import ArticleCard from './ArticleCard';

const LANE_ORDER = ['labs', 'policy', 'newsletters', 'news'];
const WINDOW_HOURS = 48;
const MAX_PER_LANE = 6;

export default function TodayView({ items, readIds, savedIds, onRead, onToggleSave, onNeedKey, onBrowseAll }) {
  const recent = items.filter((i) => isWithinHours(i.publishedAt, WINDOW_HOURS));
  const unreadCount = recent.filter((i) => !readIds.has(i.id)).length;

  const byLane = LANE_ORDER.map((lane) => ({
    lane,
    items: recent.filter((i) => i.lane === lane).slice(0, MAX_PER_LANE),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3">
        <Coffee className="w-8 h-8 text-indigo-500 shrink-0" />
        <div>
          <h2 className="font-bold text-slate-800">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <p className="text-sm text-slate-500">
            {recent.length === 0
              ? 'Nothing new in the last 48 hours — or feeds are still loading.'
              : `${recent.length} items from the last 48 hours · ${unreadCount} unread`}
          </p>
        </div>
      </div>

      {byLane.map(({ lane, items: laneItems }) => (
        <section key={lane}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            {LANES[lane].label}
          </h3>
          <div className="space-y-3">
            {laneItems.map((item) => (
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
        </section>
      ))}

      {recent.length > 0 && (
        <p className="text-center text-sm text-slate-400 pb-4">
          That's the last 48 hours.{' '}
          <button onClick={onBrowseAll} className="text-indigo-600 font-medium hover:underline">
            Browse the full feed →
          </button>
        </p>
      )}
    </div>
  );
}
