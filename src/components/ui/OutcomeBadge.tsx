import React from 'react';
import type { Outcome } from '../../types/battle';

const CONFIG: Record<Outcome, { bg: string; border: string; text: string; icon: string }> = {
  'American Victory': {
    bg:     'bg-patriot/15',
    border: 'border-patriot/40',
    text:   'text-green-400',
    icon:   '⭐',
  },
  'British Victory': {
    bg:     'bg-redcoat/15',
    border: 'border-redcoat/40',
    text:   'text-red-400',
    icon:   '👑',
  },
  Draw: {
    bg:     'bg-gold-500/15',
    border: 'border-gold-500/40',
    text:   'text-gold-400',
    icon:   '⚖️',
  },
  Inconclusive: {
    bg:     'bg-gray-700/30',
    border: 'border-gray-600/30',
    text:   'text-gray-400',
    icon:   '—',
  },
};

export function OutcomeBadge({
  outcome,
  size = 'md',
}: {
  outcome: Outcome;
  size?: 'sm' | 'md' | 'lg';
}) {
  const c = CONFIG[outcome];
  const sz =
    size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' :
    size === 'lg' ? 'text-sm px-4 py-1.5 gap-2' :
                    'text-xs px-3 py-1 gap-1.5';

  return (
    <span className={`
      inline-flex items-center font-ui font-semibold rounded-full border
      ${c.bg} ${c.border} ${c.text} ${sz}
    `}>
      <span>{c.icon}</span>
      <span>{outcome}</span>
    </span>
  );
}
