/**
 * BattleDetail — Premium battle info card.
 *
 * Desktop: slides in from right as a fixed-width panel.
 * Mobile: rises as a bottom sheet with drag-to-dismiss.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, MapPin, Users, Swords, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { OutcomeBadge } from './OutcomeBadge';
import { useApp } from '../../context/AppContext';
import type { Battle } from '../../types/battle';

// ─── Casualty Bar ─────────────────────────────────────────────────────────────

function CasualtyBar({
  label,
  killed,
  wounded,
  captured,
  color,
  max,
}: {
  label: string;
  killed?: number;
  wounded?: number;
  captured?: number;
  color: string;
  max: number;
}) {
  const total = (killed ?? 0) + (wounded ?? 0) + (captured ?? 0);
  if (!total) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-ui font-semibold uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
        <span className="text-[10px] font-ui text-parchment-400/50">
          {total.toLocaleString()} total
        </span>
      </div>
      <div className="casualty-bar-track">
        <motion.div
          className="casualty-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${(total / max) * 100}%` }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: `linear-gradient(90deg, ${color}aa, ${color})` }}
        />
      </div>
      <div className="flex gap-3 mt-1">
        {killed   !== undefined && <StatPill label="†" value={killed}   />}
        {wounded  !== undefined && <StatPill label="✦" value={wounded}  />}
        {captured !== undefined && <StatPill label="🔒" value={captured} />}
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="text-[10px] font-ui text-parchment-400/40">
      {label} {value.toLocaleString()}
    </span>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-gold-500/50 flex-shrink-0">{icon}</span>
      <span className="text-[10px] font-ui font-semibold uppercase tracking-[0.15em] text-parchment-400/50">
        {title}
      </span>
      <div className="flex-1 h-px bg-gold-500/8" />
    </div>
  );
}

// ─── Panel Body ───────────────────────────────────────────────────────────────

function BattleBody({ battle }: { battle: Battle }) {
  const americanCas = battle.casualties.american;
  const britishCas  = battle.casualties.british;
  const [expanded, setExpanded] = useState(false);

  const maxCas = Math.max(
    (americanCas?.killed ?? 0) + (americanCas?.wounded ?? 0) + (americanCas?.captured ?? 0),
    (britishCas?.killed  ?? 0) + (britishCas?.wounded  ?? 0) + (britishCas?.captured  ?? 0),
    1
  );

  return (
    <div className="space-y-5">
      {/* Image placeholder */}
      <div
        className="
          w-full h-32 rounded-xl overflow-hidden relative
          border border-gold-500/8
          flex items-center justify-center
        "
        style={{
          background: 'linear-gradient(160deg, rgba(27,42,74,0.5) 0%, rgba(7,11,20,0.8) 100%)',
        }}
      >
        <div className="text-center">
          <div className="text-3xl opacity-25 mb-1">⚔️</div>
          <p className="text-[10px] font-body italic text-parchment-400/20">Illustration placeholder</p>
        </div>
        {/* Corner decorations */}
        {['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r',
          'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r'].map((cls) => (
          <div key={cls} className={`absolute w-3 h-3 border-gold-500/20 ${cls}`} />
        ))}
      </div>

      {/* Overview */}
      <section>
        <SectionHead icon={<Swords className="w-3.5 h-3.5" />} title="Overview" />
        <p className={`text-sm font-body leading-relaxed text-parchment-200/75 ${expanded ? '' : 'line-clamp-4'}`}>
          {battle.summary}
        </p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 flex items-center gap-0.5 text-[10px] font-ui text-gold-500/50 hover:text-gold-400/70 transition-colors"
        >
          {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
        </button>
      </section>

      {/* Commanders */}
      <section>
        <SectionHead icon={<Users className="w-3.5 h-3.5" />} title="Commanders" />
        <div className="grid grid-cols-2 gap-2">
          {(['American', 'British', 'Hessian'] as const).map((side) => {
            const cmds = battle.commanders.filter((c) => c.side === side);
            if (!cmds.length) return null;
            const isAmerican = side === 'American';
            return (
              <div
                key={side}
                className={`
                  rounded-xl p-2.5 border
                  ${isAmerican
                    ? 'bg-patriot/8 border-patriot/20'
                    : 'bg-redcoat/8 border-redcoat/20'}
                `}
              >
                <p className={`
                  text-[9px] font-ui font-bold uppercase tracking-widest mb-2
                  ${isAmerican ? 'text-green-400/80' : 'text-red-400/80'}
                `}>
                  {side}
                </p>
                {cmds.map((c) => (
                  <div key={c.name} className="mb-1.5 last:mb-0">
                    <p className="text-[11px] font-ui font-medium text-parchment-200/90 leading-tight">
                      {c.name}
                    </p>
                    <p className="text-[9px] font-body italic text-parchment-400/40 leading-tight">
                      {c.rank}
                    </p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      {/* Casualties */}
      {(americanCas || britishCas) && (
        <section>
          <SectionHead icon={<span className="text-xs">†</span>} title="Casualties" />
          <div className="space-y-3">
            {americanCas && (
              <CasualtyBar
                label="American Forces"
                {...americanCas}
                color="#5CB842"
                max={maxCas}
              />
            )}
            {britishCas && (
              <CasualtyBar
                label="British Forces"
                {...britishCas}
                color="#D44444"
                max={maxCas}
              />
            )}
            {battle.casualties.notes && (
              <p className="text-[10px] font-body italic text-parchment-400/35">
                * {battle.casualties.notes}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Why It Mattered */}
      <section>
        <SectionHead icon={<span className="text-xs">🎯</span>} title="Why It Mattered" />
        <p className="text-sm font-body leading-relaxed text-parchment-200/70">
          {battle.whyItMattered}
        </p>
      </section>

      {/* Did You Know */}
      <section className="rounded-xl border border-gold-500/15 bg-gold-500/5 p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="w-3.5 h-3.5 text-gold-400" />
          <span className="text-[10px] font-ui font-semibold text-gold-400 uppercase tracking-widest">
            Did You Know?
          </span>
        </div>
        <p className="text-sm font-body italic leading-relaxed text-parchment-200/70">
          {battle.didYouKnow}
        </p>
      </section>

      {/* Quote */}
      {battle.quote && (
        <section className="border-l-2 border-gold-500/30 pl-4 py-1">
          <blockquote className="text-sm font-body italic text-parchment-200/75 leading-relaxed">
            "{battle.quote}"
          </blockquote>
          {battle.quoteSource && (
            <p className="text-[10px] font-ui text-parchment-400/40 mt-1.5">
              — {battle.quoteSource}
            </p>
          )}
        </section>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 pb-2">
        {battle.tags.map((tag) => (
          <span
            key={tag}
            className="
              text-[9px] font-ui px-2 py-0.5 rounded-full uppercase tracking-wider
              bg-ink-800/80 border border-gold-500/10 text-parchment-400/40
            "
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Desktop Panel ────────────────────────────────────────────────────────────

function DesktopPanel({ battle, onClose }: { battle: Battle; onClose: () => void }) {
  return (
    <motion.aside
      key="desktop-panel"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="
        fixed right-0 z-40
        top-14 sm:top-16 bottom-[72px]
        w-80 xl:w-96
        flex flex-col
        glass border-l border-gold-500/10
        shadow-panel-lg
        overflow-hidden
      "
    >
      {/* Panel header */}
      <div
        className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-gold-500/10"
        style={{
          background: 'linear-gradient(180deg, rgba(27,42,74,0.3) 0%, transparent 100%)',
        }}
      >
        <button
          onClick={onClose}
          className="
            absolute top-3.5 right-3.5 p-1.5 rounded-full
            text-parchment-400/30 hover:text-parchment-200
            bg-ink-800/50 hover:bg-ink-700/60
            border border-gold-500/10
            transition-all
          "
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5 mb-1.5">
          <MapPin className="w-3 h-3 text-gold-500/40" />
          <span className="text-[10px] font-ui text-parchment-400/40 uppercase tracking-wider">
            {battle.location}
          </span>
        </div>
        <h2 className="font-display font-bold text-xl text-parchment-100 leading-tight pr-8 mb-1.5">
          {battle.name}
        </h2>
        <p className="text-sm font-body italic text-gold-400/65 mb-3">{battle.date}</p>
        <OutcomeBadge outcome={battle.outcome} size="sm" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5">
        <BattleBody battle={battle} />
      </div>
    </motion.aside>
  );
}

// ─── Mobile Bottom Sheet ──────────────────────────────────────────────────────

function MobileSheet({ battle, onClose }: { battle: Battle; onClose: () => void }) {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 200], [1, 0.3]);

  return (
    <motion.div
      key="mobile-sheet"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.05, bottom: 0.4 }}
      style={{ y, opacity, maxHeight: '80dvh', minHeight: '50dvh' } as React.CSSProperties}
      onDragEnd={(_, info) => {
        if (info.offset.y > 100) onClose();
      }}
      className="
        fixed inset-x-0 bottom-0 z-50
        flex flex-col
        glass border-t border-gold-500/15
        rounded-t-3xl
        shadow-[0_-8px_48px_rgba(0,0,0,0.6)]
        overflow-hidden
        touch-none
      "
    >
      {/* Handle */}
      <div className="flex-shrink-0 pt-3 pb-2 flex justify-center">
        <div className="sheet-handle" />
      </div>

      {/* Sheet header */}
      <div className="flex-shrink-0 px-5 pb-4 border-b border-gold-500/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-ui text-parchment-400/40 uppercase tracking-wider mb-1">
              {battle.location}
            </p>
            <h2 className="font-display font-bold text-lg text-parchment-100 leading-tight">
              {battle.name}
            </h2>
            <p className="text-sm font-body italic text-gold-400/65 mt-0.5">{battle.date}</p>
          </div>
          <button
            onClick={onClose}
            className="mt-1 p-1.5 rounded-full text-parchment-400/40 hover:text-parchment-200 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2">
          <OutcomeBadge outcome={battle.outcome} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 touch-auto">
        <BattleBody battle={battle} />
      </div>
    </motion.div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function BattleDetail() {
  const { state, dispatch } = useApp();
  const { selectedBattle } = state;

  const handleClose = () => dispatch({ type: 'SELECT_BATTLE', payload: null });

  return (
    <AnimatePresence mode="wait">
      {selectedBattle && (
        <>
          {/* Desktop panel — hidden on small screens */}
          <div className="hidden md:block">
            <DesktopPanel
              key={`desktop-${selectedBattle.id}`}
              battle={selectedBattle}
              onClose={handleClose}
            />
          </div>

          {/* Mobile sheet — hidden on larger screens */}
          <div className="md:hidden">
            <MobileSheet
              key={`mobile-${selectedBattle.id}`}
              battle={selectedBattle}
              onClose={handleClose}
            />
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
