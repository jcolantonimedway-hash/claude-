import React, { useState } from 'react';
import Header from './components/Header';
import BillSearch from './components/BillSearch';
import BillProgress from './components/BillProgress';
import BillDetails from './components/BillDetails';
import ActionTimeline from './components/ActionTimeline';
import DemoSelector from './components/DemoSelector';
import { searchBillByIdentifier } from './services/billService';
import { Anchor } from 'lucide-react';

function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
        <Anchor className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-400 mb-2">No bill selected</h3>
      <p className="text-sm text-slate-400 max-w-sm mx-auto">
        Search for a bill by number above, or click one of the demo bills below to explore the tracker.
      </p>
    </div>
  );
}

export default function App() {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeDemoId, setActiveDemoId] = useState(null);

  async function handleSearch(identifier) {
    setLoading(true);
    setError(null);
    setActiveDemoId(null);
    setBill(null);
    try {
      const result = await searchBillByIdentifier(identifier);
      setBill(result);
      setTimeout(() => {
        document.getElementById('bill-tracker')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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
    setTimeout(() => {
      document.getElementById('bill-tracker')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <BillSearch onSearch={handleSearch} loading={loading} error={error} />

        {bill && (
          <div id="bill-tracker" className="scroll-mt-4">
            {activeDemoId && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 font-medium">
                <span>🧪</span>
                <span>You're viewing a <strong>demo bill</strong> with sample data.</span>
              </div>
            )}
            <BillProgress bill={bill} />
            <BillDetails bill={bill} />
            <ActionTimeline bill={bill} />
          </div>
        )}

        {!bill && !loading && <EmptyState />}

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

        <DemoSelector onSelect={handleDemoSelect} activeDemoId={activeDemoId} />

        <div className="card p-5 bg-ri-navy/5 border-ri-navy/20 mb-8">
          <h3 className="font-bold text-ri-navy mb-2">ℹ️ About This App</h3>
          <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
            <p>
              Track any bill through the <strong>Rhode Island General Assembly</strong> — data is pulled directly from the official RI legislature website. No account or API key needed.
            </p>
            <p>
              <strong>Held for Further Study</strong> is a common RI legislature action — it means the committee has tabled a bill and it likely won't advance this session.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-ri-navy text-white/60 text-xs py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <span>Rhode Island Bill Tracker • Data from RI General Assembly</span>
          <div className="flex items-center gap-4">
            <a
              href="https://webserver.rilegislature.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              RI General Assembly →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
