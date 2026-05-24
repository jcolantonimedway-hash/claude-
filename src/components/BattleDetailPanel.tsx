import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Users, AlertCircle, BookOpen, Star, MapPin } from 'lucide-react';
import { OutcomeBadge } from './OutcomeBadge';
import type { Battle } from '../types/battle';

interface Props {
  battle: Battle | null;
  onClose: () => void;
}

function CasualtyRow({ label, count, color }: { label: string; count?: number; color: string }) {
  if (count === undefined) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-parchment-300/60 font-sans">{label}</span>
      <span className={`text-sm font-bold font-sans ${color}`}>{count.toLocaleString()}</span>
    </div>
  );
}

export function BattleDetailPanel({ battle, onClose }: Props) {
  return (
    <AnimatePresence>
      {battle && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="
              fixed right-0 top-0 bottom-0 z-50
              w-full sm:w-[420px] lg:w-[380px]
              flex flex-col
              bg-[#0F1E38] border-l border-navy-400/30
              shadow-[-8px_0_40px_rgba(0,0,0,0.5)]
              overflow-hidden
            "
          >
            {/* Parchment header band */}
            <div
              className="relative flex-shrink-0 px-5 pt-5 pb-4"
              style={{
                background: 'linear-gradient(135deg, #1B3A5C 0%, #0F1E38 100%)',
                borderBottom: '1px solid rgba(196,164,58,0.2)',
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="
                  absolute top-4 right-4 p-1.5 rounded-full
                  text-parchment-300/50 hover:text-parchment-200
                  bg-navy-600/40 hover:bg-navy-500/60
                  border border-navy-400/20
                  transition-all duration-150
                "
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Location */}
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin className="w-3 h-3 text-gold/60 flex-shrink-0" />
                <span className="text-[11px] text-parchment-300/60 font-sans uppercase tracking-wider">
                  {battle.location}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display font-bold text-xl text-parchment-100 leading-tight mb-1 pr-8">
                {battle.name}
              </h2>
              <p className="text-sm text-gold/70 font-body italic mb-3">{battle.date}</p>

              {/* Outcome badge */}
              <OutcomeBadge outcome={battle.outcome} size="md" />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar">

              {/* Image placeholder */}
              <div
                className="
                  w-full h-36 rounded-xl border border-navy-400/30
                  flex flex-col items-center justify-center
                  bg-navy-600/30
                  relative overflow-hidden
                "
                style={{
                  background: 'linear-gradient(160deg, rgba(27,58,92,0.6) 0%, rgba(15,30,56,0.8) 100%)',
                }}
              >
                <div className="text-4xl mb-2 opacity-40">⚔️</div>
                <p className="text-xs text-parchment-300/40 font-sans italic">Historical illustration</p>
                {/* Decorative corner elements */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-gold/20" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-gold/20" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-gold/20" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-gold/20" />
              </div>

              {/* Summary */}
              <section>
                <SectionHeader icon={<BookOpen className="w-3.5 h-3.5" />} title="Overview" />
                <p className="text-sm text-parchment-200/80 font-body leading-relaxed">
                  {battle.summary}
                </p>
              </section>

              {/* Commanders */}
              <section>
                <SectionHeader icon={<Users className="w-3.5 h-3.5" />} title="Commanders" />
                <div className="space-y-2">
                  {['American', 'British', 'Hessian'].map((side) => {
                    const cmds = battle.commanders.filter((c) => c.side === side);
                    if (cmds.length === 0) return null;
                    return (
                      <div key={side} className="rounded-lg bg-navy-600/30 p-3 border border-navy-400/20">
                        <div
                          className={`text-[10px] font-sans font-semibold uppercase tracking-widest mb-2 ${
                            side === 'American' ? 'text-forest-light' : 'text-crimson-light'
                          }`}
                        >
                          {side} Forces
                        </div>
                        {cmds.map((c) => (
                          <div key={c.name} className="flex items-start gap-2 mb-1 last:mb-0">
                            <div
                              className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                side === 'American' ? 'bg-forest-light' : 'bg-crimson-light'
                              }`}
                            />
                            <div>
                              <span className="text-sm text-parchment-100 font-sans font-medium">
                                {c.name}
                              </span>
                              <span className="text-xs text-parchment-300/50 font-sans ml-1.5">
                                {c.rank}
                              </span>
                              {c.note && (
                                <p className="text-[11px] text-parchment-300/50 font-body italic mt-0.5">
                                  {c.note}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Casualties */}
              {(battle.casualties.american || battle.casualties.british) && (
                <section>
                  <SectionHeader icon={<AlertCircle className="w-3.5 h-3.5" />} title="Casualties" />
                  <div className="grid grid-cols-2 gap-3">
                    {battle.casualties.american && (
                      <div className="rounded-lg bg-forest/10 border border-forest/20 p-3">
                        <div className="text-[10px] font-sans font-semibold text-forest-light uppercase tracking-wider mb-2">
                          American
                        </div>
                        <CasualtyRow label="Killed" count={battle.casualties.american.killed} color="text-forest-light" />
                        <CasualtyRow label="Wounded" count={battle.casualties.american.wounded} color="text-forest-light/80" />
                        <CasualtyRow label="Captured" count={battle.casualties.american.captured} color="text-gold/80" />
                      </div>
                    )}
                    {battle.casualties.british && (
                      <div className="rounded-lg bg-crimson/10 border border-crimson/20 p-3">
                        <div className="text-[10px] font-sans font-semibold text-crimson-light uppercase tracking-wider mb-2">
                          British
                        </div>
                        <CasualtyRow label="Killed" count={battle.casualties.british.killed} color="text-crimson-light" />
                        <CasualtyRow label="Wounded" count={battle.casualties.british.wounded} color="text-crimson-light/80" />
                        <CasualtyRow label="Captured" count={battle.casualties.british.captured} color="text-gold/80" />
                      </div>
                    )}
                  </div>
                  {battle.casualties.notes && (
                    <p className="text-[11px] text-parchment-300/50 font-body italic mt-2">
                      * {battle.casualties.notes}
                    </p>
                  )}
                </section>
              )}

              {/* Why It Mattered */}
              <section>
                <SectionHeader icon={<Swords className="w-3.5 h-3.5" />} title="Why It Mattered" />
                <p className="text-sm text-parchment-200/80 font-body leading-relaxed">
                  {battle.whyItMattered}
                </p>
              </section>

              {/* Did You Know */}
              <section className="rounded-xl border border-gold/25 bg-gold/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-3.5 h-3.5 text-gold" />
                  <span className="text-xs font-sans font-semibold text-gold uppercase tracking-wider">
                    Did You Know?
                  </span>
                </div>
                <p className="text-sm text-parchment-200/80 font-body italic leading-relaxed">
                  {battle.didYouKnow}
                </p>
              </section>

              {/* Historical Quote */}
              {battle.quote && (
                <section className="border-l-2 border-gold/40 pl-4">
                  <blockquote className="text-sm text-parchment-200/90 font-body italic leading-relaxed">
                    "{battle.quote}"
                  </blockquote>
                  {battle.quoteSource && (
                    <p className="text-[11px] text-parchment-300/50 font-sans mt-1.5">
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
                    className="text-[10px] px-2 py-0.5 rounded-full bg-navy-500/50 border border-navy-400/30 text-parchment-300/60 font-sans uppercase tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-gold/60">{icon}</span>
      <h3 className="text-xs font-sans font-semibold text-parchment-300/70 uppercase tracking-wider">
        {title}
      </h3>
      <div className="flex-1 h-px bg-navy-400/30" />
    </div>
  );
}
