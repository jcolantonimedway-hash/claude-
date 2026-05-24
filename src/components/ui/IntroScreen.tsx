/**
 * IntroScreen — Cinematic intro animation on first load
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 8,
  duration: 8 + Math.random() * 10,
  size: Math.random() * 2 + 1,
}));

const TIMELINE_EVENTS = [
  { year: 1775, event: 'The war begins' },
  { year: 1776, event: 'Declaration of Independence' },
  { year: 1777, event: 'Saratoga — the turning point' },
  { year: 1778, event: 'France enters the war' },
  { year: 1781, event: 'Yorktown — the final victory' },
  { year: 1783, event: 'Treaty of Paris signed' },
];

export function IntroScreen() {
  const { state, dispatch } = useApp();
  const [phase, setPhase] = useState<'title' | 'events' | 'fading'>('title');

  useEffect(() => {
    if (!state.ui.showIntro) return;

    const t1 = setTimeout(() => setPhase('events'), 1800);
    const t2 = setTimeout(() => setPhase('fading'), 5500);
    const t3 = setTimeout(() => dispatch({ type: 'DISMISS_INTRO' }), 6200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [state.ui.showIntro, dispatch]);

  return (
    <AnimatePresence>
      {state.ui.showIntro && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse 120% 120% at 50% 50%, #0D1520 0%, #070B14 50%, #030609 100%)',
          }}
        >
          {/* Particles */}
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              className="particle absolute"
              style={{
                left:           `${p.left}%`,
                bottom:         '-4px',
                width:          `${p.size}px`,
                height:         `${p.size}px`,
                animationDuration:  `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}

          {/* Gold radial glow behind title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute w-[600px] h-[300px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse, rgba(196,164,58,0.12) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* ─── Title Block ─────────────────────────────────────────── */}
          <div className="relative text-center px-6 z-10">
            {/* Year range */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-sm font-ui font-medium tracking-[0.5em] text-gold-400/70 uppercase mb-4"
            >
              1775 — 1783
            </motion.p>

            {/* Main title */}
            <motion.h1
              initial={{ opacity: 0, y: 32, letterSpacing: '0.4em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.05em' }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-bold text-5xl sm:text-7xl text-parchment-100 leading-none mb-3"
            >
              The American
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 32, letterSpacing: '0.4em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.05em' }}
              transition={{ delay: 0.75, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-bold italic text-5xl sm:text-7xl mb-4"
              style={{
                background: 'linear-gradient(135deg, #E8C96B 0%, #C4A43A 40%, #E8C96B 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Revolution
            </motion.h1>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="w-48 h-px mx-auto mb-4"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(196,164,58,0.6), transparent)',
              }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="text-base font-body italic text-parchment-300/60 mb-10"
            >
              An interactive battle map of America's founding conflict
            </motion.p>

            {/* Timeline events */}
            <AnimatePresence>
              {phase === 'events' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap justify-center gap-x-6 gap-y-2 max-w-lg mx-auto"
                >
                  {TIMELINE_EVENTS.map((ev, i) => (
                    <motion.div
                      key={ev.year}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.12, duration: 0.4 }}
                      className="flex items-center gap-1.5"
                    >
                      <span className="text-gold-400 font-ui font-semibold text-xs">{ev.year}</span>
                      <span className="text-parchment-400/40 text-xs font-body">{ev.event}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            onClick={() => dispatch({ type: 'DISMISS_INTRO' })}
            className="absolute bottom-8 text-xs font-ui text-parchment-400/40 hover:text-parchment-300/60 transition-colors tracking-widest uppercase"
          >
            Explore the Map →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
