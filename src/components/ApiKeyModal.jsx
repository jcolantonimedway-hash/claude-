import React, { useState } from 'react';
import { Key, X, ExternalLink, CheckCircle } from 'lucide-react';
import { saveApiKey, clearApiKey } from '../services/billService';

export default function ApiKeyModal({ isOpen, onClose, currentKey, onSaved }) {
  const [value, setValue] = useState(currentKey || '');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveApiKey(value);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSaved(value.trim());
      onClose();
    }, 800);
  }

  function handleClear() {
    clearApiKey();
    setValue('');
    onSaved('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-ri-navy/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-ri-navy" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">OpenStates API Key</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            To search <strong>real RI bills</strong>, you need a free OpenStates API key.
            OpenStates aggregates bill data from all 50 state legislatures, including Rhode Island.
          </p>

          <a
            href="https://openstates.org/accounts/signup/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-ri-navy hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Get a free API key at openstates.org →
          </a>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Your API Key
            </label>
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Paste your OpenStates API key here"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ri-navy/30 focus:border-ri-navy font-mono"
            />
          </div>

          <p className="text-xs text-slate-400">
            Your key is stored only in your browser's localStorage and is never sent anywhere except directly to the OpenStates API.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-5 border-t border-slate-100">
          {currentKey && (
            <button
              onClick={handleClear}
              className="text-sm text-slate-500 hover:text-red-600 transition-colors"
            >
              Remove key
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!value.trim() || saved}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-ri-navy text-white rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : (
              'Save Key'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
