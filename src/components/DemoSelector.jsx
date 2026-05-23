import React from 'react';
import { DEMO_BILLS } from '../data/demoBills';
import { FlaskConical, ChevronRight } from 'lucide-react';

const COLOR_MAP = {
  amber: 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100',
  blue: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
  purple: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100',
  green: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100',
};

const BADGE_MAP = {
  amber: 'bg-amber-200 text-amber-900',
  blue: 'bg-blue-200 text-blue-900',
  purple: 'bg-purple-200 text-purple-900',
  green: 'bg-green-200 text-green-900',
};

export default function DemoSelector({ onSelect, activeDemoId }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Demo Bills — click to explore
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DEMO_BILLS.map((bill) => {
          const isActive = activeDemoId === bill.id;
          const colorClass = COLOR_MAP[bill._demoColor] || COLOR_MAP.blue;
          const badgeClass = BADGE_MAP[bill._demoColor] || BADGE_MAP.blue;

          return (
            <button
              key={bill.id}
              onClick={() => onSelect(bill)}
              className={`text-left p-3.5 rounded-xl border-2 transition-all ${colorClass} ${
                isActive ? 'ring-2 ring-offset-1 ring-ri-navy shadow-md scale-[1.01]' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-xs font-mono font-bold">{bill.identifier}</code>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
                      {bill._demoLabel}
                    </span>
                  </div>
                  <p className="text-xs leading-snug line-clamp-2 opacity-80">
                    {bill.title.replace('An Act Relating to ', '')}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-transform ${isActive ? 'translate-x-0.5' : ''}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
