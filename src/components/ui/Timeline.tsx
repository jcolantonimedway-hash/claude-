/**
 * CinematicTimeline — Fixed bottom strip showing years 1775–1783
 * with clickable battle chips and animated year selector.
 */

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const ALL_YEARS = [1775, 1776, 1777, 1778, 1779, 1780, 1781, 1782, 1783];

const OUTCOME_DOT: Record<string, string> = {
  'American Victory': '#5CB842',
  'British Victory':  '#D44444',
  'Draw':             '#E8C96B',
  'Inconclusive':     '#9CA3AF',
};

export function Timeline() {
  const { state, dispatch, filteredBattles, allBattles } = useApp();
  const { filters, selectedBattle } = state;
  const chipsRef = useRef<HTMLDivElement>(null);

  // Sort battles chronologically for the chip row
  const sortedBattles = [...filteredBattles].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });

  function handleYearClick(year: number) {
    dispatch({ type: 'SET_YEAR_FILTER', payload: filters.year === year ? null : year });
  }

  function handleBattleClick(battleId: string) {
    const battle = allBattles.find((b) => b.id === battleId);
    if (battle) dispatch({ type: 'SELECT_BATTLE', payload: battle });
  }

  // Progress indicator: how far along the war are we?
  const activeYearIdx  = filters.year ? ALL_YEARS.indexOf(filters.year) : ALL_YEARS.length - 1;
  const progressWidth  = ((activeYearIdx + 1) / ALL_YEARS.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.7 }}
      className="
        fixed bottom-0 inset-x-0 z-30
        glass border-t border-gold-500/10
        shadow-[0_-4px_32px_rgba(0,0,0,0.5)]
      "
      style={{ height: 72 }}
    >
      {/* Progress track */}
      <div className="absolute top-0 inset-x-0 h-px">
        <div className="h-full bg-gold-500/8" />
        <motion.div
          className="absolute top-0 left-0 h-full"
          animate={{ width: `${progressWidth}%` }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'linear-gradient(90deg, rgba(196,164,58,0.15), rgba(232,201,107,0.4))',
            boxShadow: '0 0 6px rgba(196,164,58,0.3)',
          }}
        />
      </div>

      <div className="flex items-stretch h-full">
        {/* Year pills row */}
        <div className="flex items-center gap-0.5 px-3 border-r border-gold-500/8 flex-shrink-0">
          {ALL_YEARS.map((year) => {
            const yearBattles = allBattles.filter((b) => b.year === year);
            const isActive    = filters.year === year;
            const hasBattles  = yearBattles.length > 0;

            return (
              <motion.button
                key={year}
                whileHover={hasBattles ? { scale: 1.05 } : {}}
                whileTap={hasBattles ? { scale: 0.95 } : {}}
                onClick={() => hasBattles && handleYearClick(year)}
                disabled={!hasBattles}
                className={`
                  relative px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px]
                  font-ui font-semibold transition-all duration-200
                  ${isActive
                    ? 'bg-gold-500/20 text-gold-400 shadow-gold-sm border border-gold-500/40'
                    : hasBattles
                      ? 'text-parchment-300/50 hover:text-parchment-200 border border-transparent hover:border-gold-500/10'
                      : 'text-parchment-400/20 cursor-default border border-transparent'
                  }
                `}
              >
                {year}
                {hasBattles && (
                  <span
                    className={`
                      absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full
                      ${isActive ? 'bg-gold-400' : 'bg-gold-500/30'}
                    `}
                  />
                )}
              </motion.button>
            );
          })}
          {filters.year !== null && (
            <button
              onClick={() => dispatch({ type: 'SET_YEAR_FILTER', payload: null })}
              className="ml-1 text-[10px] font-ui text-parchment-400/40 hover:text-parchment-200 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Battle chips row */}
        <div
          ref={chipsRef}
          className="flex items-center gap-2 px-3 flex-1 overflow-x-auto scrollbar-thin"
          style={{ scrollbarWidth: 'none' }}
        >
          <AnimatePresence initial={false}>
            {sortedBattles.map((battle, i) => {
              const isSelected = selectedBattle?.id === battle.id;
              const dotColor   = OUTCOME_DOT[battle.outcome] ?? '#9CA3AF';

              return (
                <motion.button
                  key={battle.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBattleClick(battle.id)}
                  className={`
                    flex-shrink-0 flex items-center gap-1.5
                    px-2.5 py-1.5 rounded-lg border
                    text-[10px] sm:text-xs font-ui font-medium
                    transition-all duration-200 whitespace-nowrap
                    ${isSelected
                      ? 'bg-gold-500/15 border-gold-500/40 text-parchment-100 shadow-gold-sm'
                      : 'bg-ink-800/50 border-gold-500/8 text-parchment-300/50 hover:border-gold-500/20 hover:text-parchment-200'
                    }
                  `}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                  {battle.name}
                  <span className="text-parchment-400/30 text-[9px]">{battle.year}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>

          {sortedBattles.length === 0 && (
            <p className="text-xs font-body italic text-parchment-400/30 pl-2">
              No battles in this period
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
