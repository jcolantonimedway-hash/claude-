import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import type { Battle } from '../types/battle';

interface Props {
  battles: Battle[];
  selectedYear: number | null;
  onYearSelect: (year: number | null) => void;
  selectedBattle: Battle | null;
  onBattleSelect: (battle: Battle) => void;
}

const ALL_YEARS = [1775, 1776, 1777, 1778, 1779, 1780, 1781, 1782, 1783];

const outcomeColors: Record<string, string> = {
  'American Victory': '#4A8A2E',
  'British Victory': '#8B1A1A',
  Draw: '#C4A43A',
  Inconclusive: '#6B7280',
};

export function Timeline({
  battles,
  selectedYear,
  onYearSelect,
  selectedBattle,
  onBattleSelect,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const sortedBattles = [...battles].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });

  function handleYearClick(year: number) {
    onYearSelect(selectedYear === year ? null : year);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="
        relative z-20
        bg-navy/95 backdrop-blur-sm
        border-t border-navy-400/30
        shadow-[0_-4px_20px_rgba(0,0,0,0.3)]
      "
    >
      {/* Year selector row */}
      <div className="flex items-center gap-0 px-3 pt-2 pb-1 border-b border-navy-400/20 overflow-x-auto scrollbar-hide">
        <span className="text-[10px] font-sans uppercase tracking-wider text-parchment-300/40 mr-3 flex-shrink-0">
          Year
        </span>
        {ALL_YEARS.map((year) => {
          const yearBattles = battles.filter((b) => b.year === year);
          const isActive = selectedYear === year;
          const hasData = yearBattles.length > 0;

          return (
            <button
              key={year}
              onClick={() => handleYearClick(year)}
              className={`
                relative flex-shrink-0 px-2.5 sm:px-3 py-1 mx-0.5 rounded-md
                text-xs font-sans font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-gold/25 text-gold border border-gold/50'
                    : hasData
                    ? 'text-parchment-200/80 hover:bg-navy-500/50 hover:text-parchment-100 border border-transparent'
                    : 'text-parchment-400/30 cursor-default border border-transparent'
                }
              `}
              disabled={!hasData}
            >
              {year}
              {hasData && (
                <span
                  className={`
                    absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full
                    ${isActive ? 'bg-gold' : 'bg-parchment-300/40'}
                  `}
                />
              )}
            </button>
          );
        })}

        {selectedYear !== null && (
          <button
            onClick={() => onYearSelect(null)}
            className="flex-shrink-0 ml-2 text-xs text-parchment-300/50 hover:text-parchment-200 transition-colors font-sans underline"
          >
            All
          </button>
        )}
      </div>

      {/* Battle chips row */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {sortedBattles.map((battle) => {
          const isSelected = selectedBattle?.id === battle.id;
          const color = outcomeColors[battle.outcome];

          return (
            <motion.button
              key={battle.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onBattleSelect(battle)}
              className={`
                flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                border text-xs font-sans font-medium
                transition-all duration-200
                ${
                  isSelected
                    ? 'bg-navy-400/60 border-gold/60 text-parchment-100 shadow-[0_0_8px_rgba(196,164,58,0.4)]'
                    : 'bg-navy-600/40 border-navy-400/30 text-parchment-300/70 hover:border-navy-300/50 hover:text-parchment-200'
                }
              `}
            >
              {/* Color dot */}
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="whitespace-nowrap">{battle.name}</span>
              <span className="text-[10px] text-parchment-400/40 font-sans">{battle.year}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
