import React, { useState } from 'react';
import { Sparkles, Loader2, KeyRound } from 'lucide-react';
import { summarize, NoKeyError } from '../services/summaryService';

const DEPTHS = [
  { id: 'headline', label: 'Takeaway' },
  { id: 'brief', label: 'Brief' },
  { id: 'deep', label: 'Deep dive' },
];

export default function SummaryPanel({ item, onNeedKey }) {
  const [depth, setDepth] = useState('brief');
  const [state, setState] = useState({}); // depth -> {loading, summary, error, needsKey}

  async function run(selectedDepth) {
    setDepth(selectedDepth);
    if (state[selectedDepth]?.summary || state[selectedDepth]?.loading) return;
    setState((s) => ({ ...s, [selectedDepth]: { loading: true } }));
    try {
      const summary = await summarize(item, selectedDepth);
      setState((s) => ({ ...s, [selectedDepth]: { summary } }));
    } catch (err) {
      if (err instanceof NoKeyError) {
        setState((s) => ({ ...s, [selectedDepth]: { needsKey: true } }));
      } else {
        setState((s) => ({ ...s, [selectedDepth]: { error: err.message } }));
      }
    }
  }

  const current = state[depth];

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        {DEPTHS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => run(id)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
              depth === id && (current?.summary || current?.loading)
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {current?.loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Reading the article…
        </div>
      )}

      {current?.summary && (
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-indigo-50/50 rounded-lg p-3">
          {current.summary}
        </div>
      )}

      {current?.error && (
        <p className="text-xs text-red-600 py-1">Summary failed: {current.error}</p>
      )}

      {current?.needsKey && (
        <button
          onClick={onNeedKey}
          className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 hover:bg-amber-100 transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5" />
          Summaries need an Anthropic API key — add one in Settings (takes 2 minutes)
        </button>
      )}
    </div>
  );
}
