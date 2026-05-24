/**
 * FloatingControls — Zoom controls and mobile FABs
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, LocateFixed, List } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function FloatingControls() {
  const { dispatch } = useApp();

  function zoomIn()    { (window as any).__mapRef?.zoomIn(); }
  function zoomOut()   { (window as any).__mapRef?.zoomOut(); }
  function resetView() {
    (window as any).__mapRef?.flyTo({ center: [-77, 38.8], zoom: 4.8, duration: 1000 });
  }

  return (
    <>
      {/* Zoom cluster — bottom right */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="
          fixed right-3 bottom-[84px] z-20
          flex flex-col gap-1
        "
      >
        <MapBtn onClick={zoomIn}    title="Zoom in">  <Plus         className="w-4 h-4" /></MapBtn>
        <MapBtn onClick={zoomOut}   title="Zoom out"> <Minus        className="w-4 h-4" /></MapBtn>
        <MapBtn onClick={resetView} title="Reset map"><LocateFixed  className="w-4 h-4" /></MapBtn>
      </motion.div>

      {/* Mobile battle list FAB */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => dispatch({ type: 'TOGGLE_BATTLE_LIST' })}
        className="
          fixed left-3 bottom-[84px] z-20 md:hidden
          w-10 h-10 rounded-xl
          glass border border-gold-500/20
          flex items-center justify-center
          text-parchment-200/70 hover:text-parchment-100
          shadow-panel
          transition-colors duration-150
        "
        title="Battle list"
      >
        <List className="w-4.5 h-4.5" />
      </motion.button>
    </>
  );
}

function MapBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      title={title}
      className="
        w-8 h-8 rounded-lg
        glass border border-gold-500/12
        flex items-center justify-center
        text-parchment-300/50 hover:text-parchment-200
        hover:border-gold-500/25
        shadow-[0_2px_8px_rgba(0,0,0,0.4)]
        transition-all duration-150
      "
    >
      {children}
    </motion.button>
  );
}
