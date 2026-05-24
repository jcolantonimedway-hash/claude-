import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Play, Pause, RotateCcw } from 'lucide-react';
import { StatsPanel } from './StatsPanel';
import type { Battle } from '../types/battle';

interface Props {
  battles: Battle[];
  filteredCount: number;
  isCampaignPlaying: boolean;
  onToggleCampaign: () => void;
  onResetCampaign: () => void;
}

export function Header({
  battles,
  filteredCount,
  isCampaignPlaying,
  onToggleCampaign,
  onResetCampaign,
}: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="
        relative z-30 bg-navy/95 backdrop-blur-sm
        border-b border-navy-400/30
        shadow-[0_2px_20px_rgba(0,0,0,0.4)]
      "
    >
      <div className="max-w-full px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center flex-shrink-0">
            <Sword className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-parchment-100 text-sm sm:text-base lg:text-lg leading-tight truncate">
              Revolutionary War
            </h1>
            <p className="text-[10px] sm:text-xs text-gold/70 font-sans uppercase tracking-[0.15em] leading-tight hidden sm:block">
              Battle Map • 1775–1783
            </p>
          </div>
        </div>

        {/* Stats — center */}
        <div className="hidden md:flex flex-1 justify-center">
          <StatsPanel battles={battles} filteredCount={filteredCount} />
        </div>

        {/* Campaign Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleCampaign}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-sans text-xs font-semibold
              transition-all duration-200
              ${
                isCampaignPlaying
                  ? 'bg-gold/20 border-gold/50 text-gold hover:bg-gold/30'
                  : 'bg-parchment-100/10 border-parchment-200/30 text-parchment-200 hover:bg-parchment-100/20'
              }
            `}
            title={isCampaignPlaying ? 'Pause campaign' : 'Play campaign mode'}
          >
            {isCampaignPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isCampaignPlaying ? 'Pause' : 'Campaign'}</span>
          </motion.button>

          {isCampaignPlaying && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onResetCampaign}
              className="p-1.5 rounded-full border border-parchment-200/20 text-parchment-300/60 hover:text-parchment-200 transition-colors"
              title="Reset campaign"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
