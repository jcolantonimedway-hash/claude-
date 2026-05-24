import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { OutcomeBadge } from './OutcomeBadge';
import type { Battle } from '../types/battle';

interface Props {
  battle: Battle | null;
  currentIndex: number;
  totalCount: number;
  isPlaying: boolean;
  onNext: () => void;
  onPrev: () => void;
  onStop: () => void;
}

export function CampaignOverlay({
  battle,
  currentIndex,
  totalCount,
  isPlaying,
  onNext,
  onPrev,
  onStop,
}: Props) {
  if (!isPlaying || !battle) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={battle.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="
          absolute bottom-32 left-1/2 -translate-x-1/2 z-30
          w-full max-w-lg px-4
        "
      >
        <div
          className="
            rounded-2xl overflow-hidden
            bg-navy/95 backdrop-blur-md
            border border-gold/20
            shadow-[0_8px_40px_rgba(0,0,0,0.6)]
          "
        >
          {/* Progress bar */}
          <div className="h-1 bg-navy-400/30">
            <motion.div
              className="h-full bg-gold"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-[10px] font-sans uppercase tracking-widest text-gold/60 mb-1">
                  Battle {currentIndex + 1} of {totalCount}
                </div>
                <h3 className="font-display font-bold text-lg text-parchment-100 leading-tight">
                  {battle.name}
                </h3>
                <p className="text-sm text-gold/70 font-body italic mt-0.5">{battle.date}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={onStop}
                  className="p-1 rounded text-parchment-300/50 hover:text-parchment-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <OutcomeBadge outcome={battle.outcome} size="sm" />
              </div>
            </div>

            {/* Narration */}
            <p className="text-sm text-parchment-200/80 font-body leading-relaxed line-clamp-3 mb-4">
              {battle.summary}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={onPrev}
                disabled={currentIndex === 0}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-xs font-sans text-parchment-300/70 hover:text-parchment-200
                  bg-navy-500/50 hover:bg-navy-400/50
                  border border-navy-400/30 hover:border-navy-300/40
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-150
                "
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              {/* Dot indicators */}
              <div className="flex gap-1.5">
                {Array.from({ length: totalCount }).map((_, i) => (
                  <div
                    key={i}
                    className={`
                      rounded-full transition-all duration-300
                      ${i === currentIndex
                        ? 'w-4 h-1.5 bg-gold'
                        : i < currentIndex
                        ? 'w-1.5 h-1.5 bg-gold/40'
                        : 'w-1.5 h-1.5 bg-navy-400/40'
                      }
                    `}
                  />
                ))}
              </div>

              <button
                onClick={onNext}
                disabled={currentIndex === totalCount - 1}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  text-xs font-sans text-parchment-100 hover:text-white
                  bg-gold/20 hover:bg-gold/30
                  border border-gold/40 hover:border-gold/60
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-150
                "
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
