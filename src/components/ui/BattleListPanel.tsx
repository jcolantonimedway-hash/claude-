/**
 * BattleListPanel — Collapsible battle list with search and filters.
 * Desktop: fixed left panel.
 * Mobile: full-screen slide-over drawer.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { FilterOutcome } from '../../types/battle';

const OUTCOMES: { value: FilterOutcome; label: string; color: string }[] = [
  { value: 'All',              label: 'All',         color: 'text-parchment-300' },
  { value: 'American Victory', label: '⭐ Patriot',  color: 'text-green-400' },
  { value: 'British Victory',  label: '👑 British',  color: 'text-red-400' },
  { value: 'Draw',             label: '⚖️ Draw',     color: 'text-gold-400' },
];

const DOT_COLOR: Record<string, string> = {
  'American Victory': 'bg-patriot',
  'British Victory':  'bg-redcoat',
  'Draw':             'bg-gold-500',
};

export function BattleListPanel() {
  const { state, dispatch, filteredBattles } = useApp();
  const { filters, selectedBattle, ui } = state;
  const [showFilters, setShowFilters] = useState(false);

  const isOpen = ui.battleListOpen;

  // On desktop this is always open; on mobile it's a drawer
  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: 'TOGGLE_BATTLE_LIST' })}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 280 }}
        className="
          fixed left-0 z-40 flex flex-col
          top-14 sm:top-16
          bottom-0 md:bottom-[72px]
          w-72 sm:w-80 md:w-64
          glass border-r border-gold-500/10
          shadow-[4px_0_32px_rgba(0,0,0,0.5)]
          overflow-hidden
        "
      >
        {/* Panel Header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gold-500/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm text-parchment-200">
              Battles
              <span className="ml-2 text-xs font-ui text-gold-500/60 font-normal">
                {filteredBattles.length}
              </span>
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  p-1.5 rounded-lg transition-colors
                  ${showFilters
                    ? 'bg-gold-500/20 text-gold-400'
                    : 'text-parchment-400/40 hover:text-parchment-300/70'
                  }
                `}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_BATTLE_LIST' })}
                className="p-1.5 rounded-lg text-parchment-400/40 hover:text-parchment-300/70 transition-colors md:hidden"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-parchment-400/30 pointer-events-none" />
            <input
              type="text"
              placeholder="Search battles, commanders…"
              value={filters.search}
              onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
              className="
                w-full pl-8 pr-3 py-2 text-xs font-ui
                bg-ink-800/60 border border-gold-500/10 rounded-lg
                text-parchment-200 placeholder-parchment-400/30
                focus:outline-none focus:border-gold-500/30
                transition-colors duration-200
              "
            />
            {filters.search && (
              <button
                onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-parchment-400/30 hover:text-parchment-300/60"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {OUTCOMES.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => dispatch({ type: 'SET_OUTCOME_FILTER', payload: opt.value })}
                      className={`
                        text-[10px] font-ui px-2 py-1 rounded-full border
                        transition-all duration-150
                        ${filters.outcome === opt.value
                          ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
                          : 'bg-ink-800/50 border-gold-500/10 text-parchment-400/50 hover:border-gold-500/20 hover:text-parchment-300'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {(filters.outcome !== 'All' || filters.year !== null || filters.search) && (
                  <button
                    onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
                    className="mt-1.5 text-[10px] font-ui text-parchment-400/40 hover:text-parchment-300/60 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Battle List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2">
          <AnimatePresence initial={false}>
            {filteredBattles.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <span className="text-2xl mb-2 opacity-30">⚔️</span>
                <p className="text-xs font-body italic text-parchment-400/40">
                  No battles match your filters
                </p>
              </motion.div>
            ) : (
              filteredBattles.map((battle, i) => {
                const isSelected = selectedBattle?.id === battle.id;
                return (
                  <motion.button
                    key={battle.id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    onClick={() => dispatch({ type: 'SELECT_BATTLE', payload: battle })}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-xl mb-1
                      flex items-start gap-2.5 group
                      border transition-all duration-200
                      ${isSelected
                        ? 'bg-gold-500/12 border-gold-500/30 shadow-[0_0_12px_rgba(196,164,58,0.08)]'
                        : 'border-transparent hover:bg-ink-700/60 hover:border-gold-500/10'
                      }
                    `}
                  >
                    <div className={`
                      mt-1.5 w-2 h-2 rounded-full flex-shrink-0
                      ${DOT_COLOR[battle.outcome] ?? 'bg-gold-500'}
                      ${isSelected ? 'shadow-[0_0_6px_currentColor]' : ''}
                    `} />
                    <div className="min-w-0 flex-1">
                      <p className={`
                        text-xs font-ui font-medium leading-tight truncate
                        transition-colors
                        ${isSelected ? 'text-parchment-100' : 'text-parchment-300/80 group-hover:text-parchment-200'}
                      `}>
                        {battle.name}
                      </p>
                      <p className="text-[10px] font-body text-parchment-400/35 mt-0.5">{battle.date}</p>
                    </div>
                    {isSelected && (
                      <ChevronLeft className="w-3.5 h-3.5 text-gold-500/50 flex-shrink-0 mt-0.5 rotate-180" />
                    )}
                  </motion.button>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
