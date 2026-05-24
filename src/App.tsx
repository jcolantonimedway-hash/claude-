import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { BattleMap } from './components/BattleMap';
import { Timeline } from './components/Timeline';
import { BattleDetailPanel } from './components/BattleDetailPanel';
import { SideControls } from './components/SideControls';
import { CampaignOverlay } from './components/CampaignOverlay';
import { useBattles } from './hooks/useBattles';
import { useCampaign } from './hooks/useCampaign';
import { battles as allBattles } from './data/battles';
import type { AppFilters, Battle } from './types/battle';

// ─── Default Filters ─────────────────────────────────────────────────────────
const DEFAULT_FILTERS: AppFilters = {
  search: '',
  outcome: 'All',
  year: null,
};

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [filters, setFilters] = useState<AppFilters>(DEFAULT_FILTERS);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);

  // Filtered battles shown on the map and in the list
  const filteredBattles = useBattles(filters);

  // Campaign mode
  const campaign = useCampaign(
    useCallback((b: Battle) => {
      setSelectedBattle(b);
    }, [])
  );

  // Handle battle selection from map / list / timeline
  const handleBattleSelect = useCallback(
    (battle: Battle) => {
      setSelectedBattle((prev) => (prev?.id === battle.id ? null : battle));
    },
    []
  );

  // Handle year filter from timeline
  const handleYearSelect = useCallback((year: number | null) => {
    setFilters((f) => ({ ...f, year }));
  }, []);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-navy"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* ── Header ── */}
      <Header
        battles={allBattles}
        filteredCount={filteredBattles.length}
        isCampaignPlaying={campaign.isPlaying}
        onToggleCampaign={campaign.toggle}
        onResetCampaign={campaign.reset}
      />

      {/* ── Main Area ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map */}
        <BattleMap
          battles={filteredBattles}
          selectedBattle={selectedBattle}
          campaignBattle={campaign.campaignBattle}
          onBattleSelect={handleBattleSelect}
        />

        {/* Left side controls (search/filter/list) */}
        <SideControls
          filters={filters}
          onFiltersChange={setFilters}
          filteredBattles={filteredBattles}
          onBattleSelect={handleBattleSelect}
          selectedBattle={selectedBattle}
        />

        {/* Campaign narration overlay */}
        <CampaignOverlay
          battle={campaign.campaignBattle}
          currentIndex={campaign.currentIndex}
          totalCount={campaign.totalCount}
          isPlaying={campaign.isPlaying}
          onNext={campaign.next}
          onPrev={campaign.prev}
          onStop={campaign.stop}
        />

        {/* Loading indicator for initial mount */}
        <AnimatePresence>
          {filteredBattles.length === 0 && filters.search === '' && filters.outcome === 'All' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 animate-bounce">⚔️</div>
                <p className="text-parchment-200/60 font-body text-sm italic">Loading battle data…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Timeline ── */}
      <Timeline
        battles={filteredBattles}
        selectedYear={filters.year}
        onYearSelect={handleYearSelect}
        selectedBattle={selectedBattle}
        onBattleSelect={handleBattleSelect}
      />

      {/* ── Battle Detail Panel ── */}
      <BattleDetailPanel
        battle={selectedBattle}
        onClose={() => setSelectedBattle(null)}
      />
    </div>
  );
}
