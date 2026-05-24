/**
 * Header — Floating top bar with title, stats, and campaign controls
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Play, Pause, Square, Volume2, VolumeX, List } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Header() {
  const { state, dispatch, filteredBattles, allBattles } = useApp();
  const { campaign, ui } = state;

  const americanWins = allBattles.filter((b) => b.outcome === 'American Victory').length;
  const britishWins  = allBattles.filter((b) => b.outcome === 'British Victory').length;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="
        fixed top-0 inset-x-0 z-50
        flex items-center justify-between
        h-14 sm:h-16 px-3 sm:px-5
        glass border-b border-gold-500/10
        shadow-[0_4px_24px_rgba(0,0,0,0.5)]
      "
    >
      {/* ── Logo + Title ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="
          w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
          bg-gold-500/10 border border-gold-500/25
          shadow-[0_0_12px_rgba(196,164,58,0.2)]
        ">
          <Swords className="w-4 h-4 text-gold-400" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display font-bold text-sm sm:text-base text-parchment-100 leading-tight truncate">
            Revolutionary War
          </h1>
          <p className="text-[10px] font-ui text-gold-500/60 uppercase tracking-[0.2em] hidden sm:block">
            Battle Map · 1775–1783
          </p>
        </div>
      </div>

      {/* ── Stats (center, desktop) ───────────────────────────────────── */}
      <div className="hidden md:flex items-center gap-5">
        <Stat
          value={filteredBattles.length}
          total={allBattles.length}
          label="Battles"
          color="text-gold-400"
        />
        <div className="w-px h-6 bg-gold-500/10" />
        <Stat
          value={americanWins}
          label="Patriot"
          color="text-green-400"
          dot="bg-patriot"
        />
        <Stat
          value={britishWins}
          label="British"
          color="text-red-400"
          dot="bg-redcoat"
        />
        {filteredBattles.length !== allBattles.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-ui text-gold-400/60 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20"
          >
            Filtered
          </motion.div>
        )}
      </div>

      {/* ── Controls ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Battle list toggle (mobile) */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_BATTLE_LIST' })}
          className={`
            md:hidden p-2 rounded-lg border transition-all duration-200
            ${ui.battleListOpen
              ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
              : 'glass-light border-gold-500/15 text-parchment-300/60 hover:text-parchment-200'
            }
          `}
        >
          <List className="w-4 h-4" />
        </button>

        {/* Audio toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_AUDIO' })}
          className="
            p-2 rounded-lg glass-light border border-gold-500/10
            text-parchment-400/40 hover:text-parchment-200
            transition-all duration-200
          "
          title="Toggle ambient audio"
        >
          {ui.audioEnabled
            ? <Volume2 className="w-4 h-4 text-gold-400" />
            : <VolumeX className="w-4 h-4" />
          }
        </button>

        {/* Campaign button */}
        {campaign.active ? (
          <div className="flex items-center gap-1.5">
            <CampaignButton
              onClick={() => dispatch({ type: 'CAMPAIGN_TOGGLE' })}
              active
              icon={<Pause className="w-4 h-4" />}
              label="Pause"
            />
            <CampaignButton
              onClick={() => dispatch({ type: 'CAMPAIGN_STOP' })}
              icon={<Square className="w-3.5 h-3.5" />}
              label=""
              compact
            />
          </div>
        ) : (
          <CampaignButton
            onClick={() => dispatch({ type: 'CAMPAIGN_START' })}
            icon={<Play className="w-4 h-4" />}
            label="Campaign"
          />
        )}
      </div>
    </motion.header>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stat({
  value,
  total,
  label,
  color,
  dot,
}: {
  value: number;
  total?: number;
  label: string;
  color: string;
  dot?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1.5">
        {dot && <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
        <span className={`text-xl font-display font-bold leading-none ${color}`}>
          {value}
        </span>
        {total !== undefined && value !== total && (
          <span className="text-xs font-ui text-parchment-400/30">/{total}</span>
        )}
      </div>
      <span className="text-[10px] font-ui text-parchment-400/40 uppercase tracking-wider mt-0.5">
        {label}
      </span>
    </div>
  );
}

function CampaignButton({
  onClick,
  icon,
  label,
  active = false,
  compact = false,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  compact?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`
        flex items-center gap-1.5 rounded-lg border
        font-ui text-xs font-semibold transition-all duration-200
        ${compact ? 'p-2' : 'px-3 py-2'}
        ${active
          ? 'bg-gold-500/20 border-gold-500/50 text-gold-400 shadow-gold-sm'
          : 'glass-light border-gold-500/20 text-parchment-200/80 hover:border-gold-500/30 hover:text-parchment-100'
        }
      `}
    >
      {icon}
      {label && !compact && <span>{label}</span>}
    </motion.button>
  );
}
