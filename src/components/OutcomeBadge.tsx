import React from 'react';
import type { Outcome } from '../types/battle';

interface Props {
  outcome: Outcome;
  size?: 'sm' | 'md' | 'lg';
}

const config: Record<Outcome, { bg: string; text: string; border: string; icon: string; label: string }> = {
  'American Victory': {
    bg: 'bg-forest-light/20',
    text: 'text-forest',
    border: 'border-forest/40',
    icon: '⭐',
    label: 'American Victory',
  },
  'British Victory': {
    bg: 'bg-crimson/10',
    text: 'text-crimson',
    border: 'border-crimson/40',
    icon: '👑',
    label: 'British Victory',
  },
  Draw: {
    bg: 'bg-gold/15',
    text: 'text-gold-dark',
    border: 'border-gold/40',
    icon: '⚖️',
    label: 'Draw',
  },
  Inconclusive: {
    bg: 'bg-navy-100/30',
    text: 'text-navy-300',
    border: 'border-navy-200/40',
    icon: '?',
    label: 'Inconclusive',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
};

export function OutcomeBadge({ outcome, size = 'md' }: Props) {
  const c = config[outcome];
  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full border font-sans
        ${c.bg} ${c.text} ${c.border} ${sizeClasses[size]}
      `}
    >
      <span>{c.icon}</span>
      <span>{c.label}</span>
    </span>
  );
}
