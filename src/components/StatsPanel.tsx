import React from 'react';
import { motion } from 'framer-motion';
import type { Battle } from '../types/battle';

interface Props {
  battles: Battle[];
  filteredCount: number;
}

export function StatsPanel({ battles, filteredCount }: Props) {
  const americanVictories = battles.filter((b) => b.outcome === 'American Victory').length;
  const britishVictories = battles.filter((b) => b.outcome === 'British Victory').length;
  const draws = battles.filter((b) => b.outcome === 'Draw').length;

  const allYears = battles.map((b) => b.year);
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);

  const stats = [
    { label: 'Battles', value: filteredCount, total: battles.length, color: 'text-gold' },
    { label: 'Patriot Wins', value: americanVictories, total: battles.length, color: 'text-forest-light' },
    { label: 'British Wins', value: britishVictories, total: battles.length, color: 'text-crimson-light' },
    { label: 'Years of War', value: maxYear - minYear + 1, total: null, color: 'text-parchment-300' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-1 sm:gap-4"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="flex flex-col items-center px-2 sm:px-3 py-1 border-r border-navy-400/40 last:border-0"
        >
          <span className={`text-xl sm:text-2xl font-bold font-display ${stat.color} leading-none`}>
            {stat.value}
            {stat.total !== null && stat.value !== stat.total && (
              <span className="text-sm text-parchment-300/60 font-sans font-normal">/{stat.total}</span>
            )}
          </span>
          <span className="text-[10px] sm:text-xs text-parchment-200/70 font-sans uppercase tracking-wider mt-0.5">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
