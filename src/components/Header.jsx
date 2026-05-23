import React from 'react';

export default function Header() {
  return (
    <header className="bg-ri-navy text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          {/* RI State Seal placeholder */}
          <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-ri-gold flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
            ⚓
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              RI Bill Tracker
            </h1>
            <p className="text-blue-200 text-sm sm:text-base mt-0.5">
              Rhode Island General Assembly — Bill Progress Visualizer
            </p>
          </div>
        </div>

        {/* RI state bar */}
        <div className="mt-4 h-1 rounded-full bg-gradient-to-r from-ri-gold via-white/30 to-ri-red opacity-60" />
      </div>
    </header>
  );
}
