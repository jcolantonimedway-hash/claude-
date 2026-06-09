import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import Header from './components/Header';
import TodayView from './components/TodayView';
import FeedView from './components/FeedView';
import SavedView from './components/SavedView';
import SettingsView from './components/SettingsView';
import { DEFAULT_SOURCES } from './data/defaultSources';
import { fetchAllFeeds } from './services/feedService';
import { load, save } from './utils/storage';

const MAX_READ_IDS = 2000;

export default function App() {
  const [view, setView] = useState('today');
  const [sources, setSources] = useState(() => load('sources', DEFAULT_SOURCES));
  const [items, setItems] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState(() => new Set(load('readIds', [])));
  const [savedItems, setSavedItems] = useState(() => load('savedItems', []));
  const [apiKey, setApiKey] = useState(() => load('apiKey', ''));

  const savedIds = useMemo(() => new Set(savedItems.map((i) => i.id)), [savedItems]);

  const refresh = useCallback(async (sourceList) => {
    setLoading(true);
    const { items: fetched, statuses: feedStatuses } = await fetchAllFeeds(sourceList);
    setItems(fetched);
    setStatuses(feedStatuses);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh(sources);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateSources(next) {
    setSources(next);
    save('sources', next);
    refresh(next);
  }

  function resetSources() {
    updateSources(DEFAULT_SOURCES);
  }

  function markRead(id) {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      save('readIds', [...next].slice(-MAX_READ_IDS));
      return next;
    });
  }

  function toggleSave(item) {
    setSavedItems((prev) => {
      const next = prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [item, ...prev];
      save('savedItems', next);
      return next;
    });
  }

  function saveKey(key) {
    setApiKey(key);
    save('apiKey', key);
  }

  const goToSettings = () => setView('settings');

  const shared = {
    readIds,
    savedIds,
    onRead: markRead,
    onToggleSave: toggleSave,
    onNeedKey: goToSettings,
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Header view={view} onNavigate={setView} savedCount={savedItems.length} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {loading && items.length === 0 && view !== 'settings' ? (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p className="text-sm">Pulling the latest from your sources…</p>
          </div>
        ) : (
          <>
            {view === 'today' && (
              <TodayView items={items} {...shared} onBrowseAll={() => setView('feed')} />
            )}
            {view === 'feed' && <FeedView items={items} {...shared} />}
            {view === 'saved' && <SavedView savedItems={savedItems} {...shared} />}
            {view === 'settings' && (
              <SettingsView
                apiKey={apiKey}
                onSaveKey={saveKey}
                sources={sources}
                statuses={statuses}
                onUpdateSources={updateSources}
                onResetSources={resetSources}
              />
            )}
          </>
        )}
      </main>

      <footer className="bg-ink text-white/50 text-xs py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <span>AI Briefing — your daily AI desk</span>
          <button
            onClick={() => refresh(sources)}
            disabled={loading}
            className="flex items-center gap-1.5 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh feeds
          </button>
        </div>
      </footer>
    </div>
  );
}
