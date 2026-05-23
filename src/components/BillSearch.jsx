import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, Key } from 'lucide-react';

export default function BillSearch({ onSearch, loading, error, hasApiKey, onOpenApiKey }) {
  const [input, setInput] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    onSearch(val);
  }

  const placeholders = ['H5001', 'S0245', 'H7100', 'S1200'];
  const [phIdx] = useState(() => Math.floor(Math.random() * placeholders.length));

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Search a RI Bill</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Enter a bill number (e.g. <code className="bg-slate-100 px-1 rounded text-xs font-mono">H5001</code> or <code className="bg-slate-100 px-1 rounded text-xs font-mono">S0245</code>) to see its progress
          </p>
        </div>
        <button
          onClick={onOpenApiKey}
          title={hasApiKey ? 'API key configured — click to change' : 'Add OpenStates API key for real data'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
            hasApiKey
              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          {hasApiKey ? 'API Key ✓' : 'Add API Key'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder={`e.g. ${placeholders[phIdx]}`}
            disabled={loading}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ri-navy/30 focus:border-ri-navy disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-ri-navy text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 shadow"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Searching…</>
          ) : (
            <><Search className="w-4 h-4" /> Track Bill</>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            {error === 'NO_API_KEY' ? (
              <span>
                You need an OpenStates API key to search real bills.{' '}
                <button onClick={onOpenApiKey} className="underline font-semibold">Add your key →</button>
                {' '}or explore the <strong>demo bills below</strong>.
              </span>
            ) : error === 'INVALID_API_KEY' ? (
              <span>
                Your API key appears to be invalid.{' '}
                <button onClick={onOpenApiKey} className="underline font-semibold">Update it →</button>
              </span>
            ) : (
              error
            )}
          </div>
        </div>
      )}

      {!hasApiKey && !error && (
        <p className="mt-3 text-xs text-slate-400 text-center">
          No API key?{' '}
          <button onClick={onOpenApiKey} className="text-ri-navy font-semibold hover:underline">
            Add a free OpenStates key
          </button>{' '}
          or try a <span className="font-medium">demo bill below</span>.
        </p>
      )}
    </div>
  );
}
