import React from 'react';
import { BookmarkX } from 'lucide-react';
import ArticleCard from './ArticleCard';

export default function SavedView({ savedItems, readIds, onRead, onToggleSave, onNeedKey }) {
  if (savedItems.length === 0) {
    return (
      <div className="text-center py-16">
        <BookmarkX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-500 mb-1">Nothing saved yet</h3>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          Tap the bookmark on any article to keep it here — saved items survive even after they fall out of the feeds.
        </p>
      </div>
    );
  }

  const savedIds = new Set(savedItems.map((i) => i.id));

  return (
    <div className="space-y-3">
      {savedItems.map((item) => (
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
  );
}
