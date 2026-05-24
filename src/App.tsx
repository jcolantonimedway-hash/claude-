/**
 * App — Root component. Assembles all layers of the experience:
 *
 * Layer stack (back → front):
 *  1. MapView           (position: absolute, fills viewport)
 *  2. Vignette overlays (inside MapView)
 *  3. Header            (fixed top, z-50)
 *  4. BattleListPanel   (fixed left, z-40)
 *  5. FloatingControls  (fixed, z-20)
 *  6. BattleDetail      (fixed right/bottom, z-40/50)
 *  7. CampaignPlayer    (fixed bottom, z-40)
 *  8. Timeline          (fixed bottom, z-30)
 *  9. IntroScreen       (fixed, z-200)
 */

import React from 'react';
import { AppProvider } from './context/AppContext';
import { MapView } from './components/map/MapView';
import { IntroScreen } from './components/ui/IntroScreen';
import { Header } from './components/ui/Header';
import { BattleListPanel } from './components/ui/BattleListPanel';
import { BattleDetail } from './components/ui/BattleDetail';
import { Timeline } from './components/ui/Timeline';
import { CampaignPlayer } from './components/ui/CampaignPlayer';
import { FloatingControls } from './components/ui/FloatingControls';

function AppInner() {
  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: '#070B14' }}
    >
      {/* ── 1. Map fills everything ─────────────────────────────────── */}
      <div className="absolute inset-0">
        <MapView />
      </div>

      {/* ── 2. UI Layers ────────────────────────────────────────────── */}
      <Header />
      <BattleListPanel />
      <FloatingControls />
      <BattleDetail />
      <CampaignPlayer />
      <Timeline />

      {/* ── 3. Intro (highest z-index) ──────────────────────────────── */}
      <IntroScreen />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
