/**
 * CampaignPlayer — "Play the War" documentary mode.
 * Auto-advances through battles with cinematic narration cards.
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Square } from 'lucide-react';
import { OutcomeBadge } from './OutcomeBadge';
import { useApp } from '../../context/AppContext';

const CAMPAIGN_INTERVAL_MS = 6000;

export function CampaignPlayer() {
  const { state, dispatch } = useApp();
  const { campaign } = state;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance when playing
  useEffect(() => {
    if (!campaign.active) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      dispatch({ type: 'CAMPAIGN_NEXT' });
    }, CAMPAIGN_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [campaign.active, campaign.index, dispatch]);

  if (!campaign.active || !campaign.battle) return null;

  const battle   = campaign.battle;
  const progress = ((campaign.index + 1) / 10) * 100; // 10 battles total

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={battle.id}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16, scale: 0.97 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="
          fixed bottom-[84px] left-1/2 -translate-x-1/2 z-40
          w-full max-w-md px-4
          pointer-events-none
        "
      >
        <div className="
          rounded-2xl overflow-hidden
          glass border border-gold-500/20
          shadow-panel-lg campaign-active-border
          pointer-events-auto
        ">
          {/* Auto-progress bar */}
          <div className="h-0.5 bg-ink-800/80">
            <motion.div
              key={`progress-${battle.id}`}
              className="h-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: CAMPAIGN_INTERVAL_MS / 1000, ease: 'linear' }}
              style={{
                background: 'linear-gradient(90deg, rgba(196,164,58,0.5), rgba(232,201,107,0.9))',
              }}
            />
          </div>

          {/* Overall war progress */}
          <div className="h-0.5 bg-ink-900">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'rgba(196,164,58,0.25)',
              }}
            />
          </div>

          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="text-[9px] font-ui uppercase tracking-[0.2em] text-gold-400/50 mb-1">
                  Battle {campaign.index + 1} of 10
                </div>
                <h3 className="font-display font-bold text-lg text-parchment-100 leading-tight">
                  {battle.name}
                </h3>
                <p className="text-xs font-body italic text-gold-400/60 mt-0.5">{battle.date}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button
                  onClick={() => dispatch({ type: 'CAMPAIGN_STOP' })}
                  className="p-1 text-parchment-400/30 hover:text-parchment-200 transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
                <OutcomeBadge outcome={battle.outcome} size="sm" />
              </div>
            </div>

            {/* Narration */}
            <p className="text-xs font-body leading-relaxed text-parchment-200/65 line-clamp-3 mb-4">
              {battle.significance}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => dispatch({ type: 'CAMPAIGN_PREV' })}
                disabled={campaign.index === 0}
                className="
                  flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                  text-[10px] font-ui text-parchment-300/60 hover:text-parchment-200
                  bg-ink-800/50 hover:bg-ink-700/60 border border-gold-500/10
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all
                "
              >
                <ChevronLeft className="w-3 h-3" />
                Prev
              </button>

              {/* Dot indicators */}
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => dispatch({ type: 'CAMPAIGN_GOTO', payload: i })}
                    className="transition-all duration-300"
                  >
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        i === campaign.index
                          ? 'w-4 h-1.5 bg-gold-400'
                          : i < campaign.index
                            ? 'w-1.5 h-1.5 bg-gold-500/40'
                            : 'w-1.5 h-1.5 bg-ink-600/60'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={() => dispatch({ type: 'CAMPAIGN_NEXT' })}
                disabled={campaign.index === 9}
                className="
                  flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                  text-[10px] font-ui text-parchment-100 hover:text-white
                  bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all
                "
              >
                Next
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
