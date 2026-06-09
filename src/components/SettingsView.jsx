import React, { useState } from 'react';
import { KeyRound, Plus, Trash2, CheckCircle2, XCircle, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { LANES } from '../data/defaultSources';

function ApiKeySection({ apiKey, onSaveKey }) {
  const [draft, setDraft] = useState(apiKey);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSaveKey(draft.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 p-4">
      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1">
        <KeyRound className="w-4 h-4 text-indigo-500" />
        Claude API key
      </h3>
      <p className="text-sm text-slate-500 mb-3">
        Summaries are powered by Claude. The app works fully without a key — adding one unlocks the
        Takeaway / Brief / Deep-dive buttons. Typical personal usage costs a few dollars a month, billed
        by Anthropic for exactly what you use.
      </p>

      <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 space-y-1.5 mb-3">
        <p className="font-semibold text-slate-700">How to get a key (≈2 minutes):</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>
            Create an account at{' '}
            <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              console.anthropic.com <ExternalLink className="w-3 h-3 inline mb-0.5" />
            </a>
          </li>
          <li>Add a small amount of credit (e.g. $5) under Billing</li>
          <li>Go to API Keys → Create Key, and paste it below</li>
        </ol>
        <p className="text-xs text-slate-400 pt-1">
          The key is stored only in this browser and sent only to your own app backend.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? 'text' : 'password'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full pr-9 pl-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 font-mono"
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          {saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>
    </section>
  );
}

function SourcesSection({ sources, statuses, onUpdateSources }) {
  const [adding, setAdding] = useState(false);
  const [newSource, setNewSource] = useState({ name: '', url: '', lane: 'news' });

  function toggle(id) {
    onUpdateSources(sources.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  }

  function remove(id) {
    onUpdateSources(sources.filter((s) => s.id !== id));
  }

  function add() {
    if (!newSource.name.trim() || !/^https?:\/\//.test(newSource.url.trim())) return;
    const id = `custom-${Date.now()}`;
    onUpdateSources([
      ...sources,
      { id, name: newSource.name.trim(), url: newSource.url.trim(), lane: newSource.lane, enabled: true },
    ]);
    setNewSource({ name: '', url: '', lane: 'news' });
    setAdding(false);
  }

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-slate-800">Sources</h3>
        <button
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <Plus className="w-3.5 h-3.5" /> Add feed
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-3">
        Any RSS or Atom feed works. A red mark means the feed failed on the last refresh — check or
        replace its URL.
      </p>

      {adding && (
        <div className="bg-slate-50 rounded-lg p-3 mb-3 space-y-2">
          <input
            value={newSource.name}
            onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
            placeholder="Source name"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <input
            value={newSource.url}
            onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
            placeholder="https://example.com/feed.xml"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono"
          />
          <div className="flex gap-2">
            <select
              value={newSource.lane}
              onChange={(e) => setNewSource({ ...newSource, lane: e.target.value })}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
            >
              {Object.entries(LANES).map(([lane, { label }]) => (
                <option key={lane} value={lane}>{label}</option>
              ))}
            </select>
            <button
              onClick={add}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <ul className="divide-y divide-slate-100">
        {sources.map((source) => {
          const status = statuses[source.id];
          return (
            <li key={source.id} className="flex items-center gap-3 py-2.5">
              <input
                type="checkbox"
                checked={source.enabled}
                onChange={() => toggle(source.id)}
                className="rounded accent-indigo-600 shrink-0"
                title={source.enabled ? 'Disable' : 'Enable'}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-medium truncate ${source.enabled ? 'text-slate-700' : 'text-slate-400'}`}>
                    {source.name}
                  </span>
                  {source.enabled && status && (
                    status.ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" title={`OK — ${status.count} items`} />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" title={status.error} />
                    )
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate font-mono">{source.url}</p>
                {source.enabled && status && !status.ok && (
                  <p className="text-xs text-red-500 truncate">{status.error}</p>
                )}
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 hidden sm:block">
                {LANES[source.lane]?.label}
              </span>
              <button
                onClick={() => remove(source.id)}
                className="text-slate-300 hover:text-red-500 shrink-0 p-1"
                title="Remove source"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function SettingsView({ apiKey, onSaveKey, sources, statuses, onUpdateSources, onResetSources }) {
  return (
    <div className="space-y-4">
      <ApiKeySection apiKey={apiKey} onSaveKey={onSaveKey} />
      <SourcesSection sources={sources} statuses={statuses} onUpdateSources={onUpdateSources} />
      <div className="text-center">
        <button
          onClick={onResetSources}
          className="text-xs text-slate-400 hover:text-slate-600 underline"
        >
          Reset sources to defaults
        </button>
      </div>
    </div>
  );
}
