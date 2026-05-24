import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchAndFilter } from './SearchAndFilter';
import type { AppFilters, Battle } from '../types/battle';

interface Props {
  filters: AppFilters;
  onFiltersChange: (f: AppFilters) => void;
  filteredBattles: Battle[];
  onBattleSelect: (b: Battle) => void;
  selectedBattle: Battle | null;
}

const PANEL_WIDTH = 240;

export function SideControls({
  filters,
  onFiltersChange,
  filteredBattles,
  onBattleSelect,
  selectedBattle,
}: Props) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Sliding panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ x: -PANEL_WIDTH - 10 }}
            animate={{ x: 0 }}
            exit={{ x: -PANEL_WIDTH - 10 }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="
              absolute left-0 top-0 bottom-0 z-20
              flex flex-col gap-3
              bg-navy/92 backdrop-blur-sm
              border-r border-navy-400/30
              p-3 overflow-hidden
            "
            style={{ width: PANEL_WIDTH }}
          >
            <SearchAndFilter filters={filters} onFiltersChange={onFiltersChange} />

            {/* Battle list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 -mx-1 px-1">
              <p className="text-[10px] font-sans uppercase tracking-wider text-parchment-300/40 mb-2 px-1">
                {filteredBattles.length} Battle{filteredBattles.length !== 1 ? 's' : ''}
              </p>

              {filteredBattles.map((battle) => {
                const isSelected = selectedBattle?.id === battle.id;
                const dotColor =
                  battle.outcome === 'American Victory'
                    ? 'bg-forest-light'
                    : battle.outcome === 'British Victory'
                    ? 'bg-crimson-light'
                    : 'bg-gold';

                return (
                  <motion.button
                    key={battle.id}
                    layout
                    whileHover={{ x: 3 }}
                    onClick={() => onBattleSelect(battle)}
                    className={`
                      w-full text-left px-2.5 py-2 rounded-lg
                      flex items-start gap-2 group
                      border transition-all duration-150
                      ${
                        isSelected
                          ? 'bg-gold/15 border-gold/40'
                          : 'bg-navy-600/30 border-navy-400/15 hover:bg-navy-500/40 hover:border-navy-300/30'
                      }
                    `}
                  >
                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-sans font-medium leading-tight truncate ${
                          isSelected
                            ? 'text-parchment-100'
                            : 'text-parchment-200/80 group-hover:text-parchment-100'
                        }`}
                      >
                        {battle.name}
                      </p>
                      <p className="text-[10px] text-parchment-400/40 font-sans mt-0.5">
                        {battle.date}
                      </p>
                    </div>
                  </motion.button>
                );
              })}

              {filteredBattles.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-parchment-300/40 font-body italic">
                    No battles match your filters.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle tab */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={{ left: isOpen ? PANEL_WIDTH : 0 }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="
          absolute top-1/2 -translate-y-1/2 z-30
          bg-navy/90 backdrop-blur-sm
          border border-l-0 border-navy-400/30
          rounded-r-xl py-3 px-1.5
          text-parchment-300/60 hover:text-parchment-200
          transition-colors duration-150 shadow-parchment
        "
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </motion.button>
    </>
  );
}
