import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BillSearch from './components/BillSearch';
import BillProgress from './components/BillProgress';
import BillDetails from './components/BillDetails';
import ActionTimeline from './components/ActionTimeline';
import DemoSelector from './components/DemoSelector';
import ApiKeyModal from './components/ApiKeyModal';
import { searchBillByIdentifier } from './services/billService';
import { Github, Anchor } from 'lucide-react';

function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
        <Anchor className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-400 mb-2">
        No bill selected
      </h3>
      <p className="text-sm text-slate-400 max-w-sm mx-auto">
        Search for a bill by number above, or click one of the demo bills below to see the visual tracker in action.
      </p>
    </div>
  );
}

export default function App() {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openstates_api_key') || '');
  const [showApiModal, setShowApiModal] = useState(false);
  const [activeDemoId, setActiveDemoId] = useState(null);

  async function handleSearch(identifier) {
    setLoading(true);
    setError(null);
    setActiveDemoId(null);
    setBill(null);
    try {
      const result = await searchBillByIdentifier(identifier);
      setBill(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDemoSelect(demoBill) {
    setActiveDemoId(demoBill.id);
    setError(null);
    setBill(demoBill);
    // Smooth scroll to tracker
    setTimeout(() => {
      document.getElementById('bill-tracker')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function handleApiKeySaved(newKey) {
    setApiKey(newKey);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Search */}
        <BillSearch
          onSearch={handleSearch}
          loading={loading}
          error={error}
          hasApiKey={!!apiKey}
          onOpenApiKey={() => setShowApiModal(true)}
        />

        {/* Bill tracker (shown when a bill is selected) */}
        {bill && (
          <div id="bill-tracker" className="scroll-mt-4">
            {activeDemoId && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-medium">
                <span>🧪</span>
                <span>You're viewing a <strong>demo bill</strong> with realistic sample data.</span>
              </div>
            )}
            <BillProgress bill={bill} />
            <BillDetails bill={bill} />
            <ActionTimeline bill={bill} />
          </div>
        )}

        {/* Empty state */}
        {!bill && !loading && (
          <EmptyState />
        )}

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-50 px-4 text-xs text-slate-400 font-medium uppercase tracking-wider">
              Demo Bills
            </span>
          </div>
        </div>

        {/* Demo bill selector */}
        <DemoSelector onSelect={handleDemoSelect} activeDemoId={activeDemoId} />

        {/* Info box */}
        <div className="card p-5 bg-ri-navy/5 border-ri-navy/20 mb-8">
          <h3 className="font-bold text-ri-navy mb-2">ℹ️ About This App</h3>
          <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
            <p>
              This tracker visualizes the journey of bills through the{' '}
              <strong>Rhode Island General Assembly</strong>. Bills move from introduction through
              committee review, floor votes in both chambers, and finally to the Governor.
            </p>
            <p>
              <strong>Held for Further Study</strong> is a common RI legislature action — it means
              the committee has tabled a bill, and it likely won't advance in the current session.
            </p>
            <p>
              Live data is powered by{' '}
              <a href="https://openstates.org" target="_blank" rel="noopener noreferrer" className="text-ri-navy font-semibold underline">
                OpenStates
              </a>
              , which aggregates legislative data from all 50 states.
              A free API key lets you search real RI bills.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-ri-navy text-white/60 text-xs py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <span>Rhode Island Bill Tracker • Powered by OpenStates API</span>
          <div className="flex items-center gap-4">
            <a
              href="https://webserver.rilin.state.ri.us/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              RI General Assembly →
            </a>
            <a
              href="https://openstates.org/ri/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              OpenStates RI →
            </a>
          </div>
        </div>
      </footer>

      {/* API key modal */}
      <ApiKeyModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        currentKey={apiKey}
        onSaved={handleApiKeySaved}
      />
    </div>
  );
}
