import React, { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';

export default function BillSearch({ onSearch, loading, error }) {
  const [input, setInput] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    onSearch(val);
  }

  return (
    <div className="card p-5 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Search a RI Bill</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Enter a bill number from the RI General Assembly — e.g.{' '}
          <code className="bg-slate-100 px-1 rounded text-xs font-mono">H7632</code> or{' '}
          <code className="bg-slate-100 px-1 rounded text-xs font-mono">S2977</code>{' '}
          <span className="text-slate-400">(2026 session)</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="e.g. H7632"
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
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
