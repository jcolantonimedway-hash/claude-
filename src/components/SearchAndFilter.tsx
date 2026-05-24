import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import type { AppFilters, FilterOutcome } from '../types/battle';

interface Props {
  filters: AppFilters;
  onFiltersChange: (f: AppFilters) => void;
}

const OUTCOME_OPTIONS: { value: FilterOutcome; label: string; color: string }[] = [
  { value: 'All', label: 'All Outcomes', color: 'text-parchment-200' },
  { value: 'American Victory', label: '⭐ Patriot Win', color: 'text-forest-light' },
  { value: 'British Victory', label: '👑 British Win', color: 'text-crimson-light' },
  { value: 'Draw', label: '⚖️ Draw', color: 'text-gold' },
];

export function SearchAndFilter({ filters, onFiltersChange }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    filters.search !== '' || filters.outcome !== 'All' || filters.year !== null;

  function clearAll() {
    onFiltersChange({ search: '', outcome: 'All', year: null });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="w-full"
    >
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-300/60 pointer-events-none" />
        <input
          type="text"
          placeholder="Search battles…"
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="
            w-full pl-9 pr-4 py-2.5 text-sm font-sans
            bg-navy-600/80 backdrop-blur-sm
            border border-navy-400/40 rounded-xl
            text-parchment-100 placeholder-parchment-300/40
            focus:outline-none focus:border-gold/50 focus:bg-navy-600/90
            transition-all duration-200
          "
        />
        {filters.search && (
          <button
            onClick={() => onFiltersChange({ ...filters, search: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-parchment-300/50 hover:text-parchment-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          mt-2 flex items-center gap-2 w-full px-3 py-2 rounded-lg
          bg-navy-600/50 border border-navy-400/30
          text-parchment-300/70 hover:text-parchment-200
          text-xs font-sans font-medium uppercase tracking-wider
          transition-all duration-200
        "
      >
        <Filter className="w-3.5 h-3.5" />
        <span>Filter by Outcome</span>
        {hasActiveFilters && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 ml-auto transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Filter Options */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-1">
              {OUTCOME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onFiltersChange({ ...filters, outcome: opt.value })}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm font-sans
                    border transition-all duration-150
                    ${
                      filters.outcome === opt.value
                        ? 'bg-gold/15 border-gold/40 text-gold font-semibold'
                        : 'bg-navy-600/30 border-navy-400/20 text-parchment-300/70 hover:bg-navy-500/40 hover:text-parchment-200'
                    }
                  `}
                >
                  <span className={opt.color}>{opt.label}</span>
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="mt-2 w-full text-center text-xs text-parchment-300/50 hover:text-parchment-200 transition-colors py-1 font-sans"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
