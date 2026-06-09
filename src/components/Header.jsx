import React from 'react';
import { Satellite, Sun, Rss, Bookmark, Settings } from 'lucide-react';

const TABS = [
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'feed', label: 'Feed', icon: Rss },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Header({ view, onNavigate, savedCount }) {
  return (
    <header className="bg-ink text-white sticky top-0 z-20 shadow-lg">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5">
            <Satellite className="w-6 h-6 text-indigo-400" />
            <div>
              <h1 className="font-bold text-lg leading-tight">AI Briefing</h1>
              <p className="text-[11px] text-white/50 leading-tight hidden sm:block">
                frontier labs · policy & governance · the discourse
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === id ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
                {id === 'saved' && savedCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:static sm:ml-0.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
