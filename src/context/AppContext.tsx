/**
 * AppContext — global state for the Battle Map
 * Uses Context + useReducer for predictable state management
 */

import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { getBattlesSorted } from '../data/battles';
import type { Battle, FilterOutcome } from '../types/battle';

// ─── State Shape ──────────────────────────────────────────────────────────────

export interface AppFilters {
  search: string;
  outcome: FilterOutcome;
  year: number | null;
}

interface CampaignState {
  active: boolean;
  index: number;
  battle: Battle | null;
}

interface UIState {
  showIntro: boolean;
  battleListOpen: boolean;
  audioEnabled: boolean;
}

interface AppState {
  selectedBattle: Battle | null;
  hoveredBattle: Battle | null;
  filters: AppFilters;
  campaign: CampaignState;
  ui: UIState;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SELECT_BATTLE'; payload: Battle | null }
  | { type: 'HOVER_BATTLE'; payload: Battle | null }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_OUTCOME_FILTER'; payload: FilterOutcome }
  | { type: 'SET_YEAR_FILTER'; payload: number | null }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'CAMPAIGN_START' }
  | { type: 'CAMPAIGN_TOGGLE' }
  | { type: 'CAMPAIGN_NEXT' }
  | { type: 'CAMPAIGN_PREV' }
  | { type: 'CAMPAIGN_STOP' }
  | { type: 'CAMPAIGN_GOTO'; payload: number }
  | { type: 'DISMISS_INTRO' }
  | { type: 'TOGGLE_BATTLE_LIST' }
  | { type: 'TOGGLE_AUDIO' };

// ─── Initial State ────────────────────────────────────────────────────────────

const allBattles = getBattlesSorted();

const INITIAL_STATE: AppState = {
  selectedBattle: null,
  hoveredBattle: null,
  filters: { search: '', outcome: 'All', year: null },
  campaign: { active: false, index: 0, battle: null },
  // Open battle list by default on desktop (≥768px), closed on mobile
  ui: { showIntro: true, battleListOpen: typeof window !== 'undefined' && window.innerWidth >= 768, audioEnabled: false },
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SELECT_BATTLE':
      return { ...state, selectedBattle: action.payload };

    case 'HOVER_BATTLE':
      return { ...state, hoveredBattle: action.payload };

    case 'SET_SEARCH':
      return { ...state, filters: { ...state.filters, search: action.payload } };

    case 'SET_OUTCOME_FILTER':
      return { ...state, filters: { ...state.filters, outcome: action.payload } };

    case 'SET_YEAR_FILTER':
      return { ...state, filters: { ...state.filters, year: action.payload } };

    case 'CLEAR_FILTERS':
      return { ...state, filters: { search: '', outcome: 'All', year: null } };

    case 'CAMPAIGN_START': {
      const battle = allBattles[0] ?? null;
      return {
        ...state,
        campaign: { active: true, index: 0, battle },
        selectedBattle: battle,
      };
    }

    case 'CAMPAIGN_TOGGLE': {
      if (state.campaign.active) {
        return { ...state, campaign: { ...state.campaign, active: false } };
      }
      if (state.campaign.battle) {
        // Resume
        return { ...state, campaign: { ...state.campaign, active: true } };
      }
      // Start fresh
      const battle = allBattles[0] ?? null;
      return {
        ...state,
        campaign: { active: true, index: 0, battle },
        selectedBattle: battle,
      };
    }

    case 'CAMPAIGN_NEXT': {
      const next = Math.min(state.campaign.index + 1, allBattles.length - 1);
      const battle = allBattles[next] ?? null;
      return {
        ...state,
        campaign: { ...state.campaign, index: next, battle },
        selectedBattle: battle,
      };
    }

    case 'CAMPAIGN_PREV': {
      const prev = Math.max(state.campaign.index - 1, 0);
      const battle = allBattles[prev] ?? null;
      return {
        ...state,
        campaign: { ...state.campaign, index: prev, battle },
        selectedBattle: battle,
      };
    }

    case 'CAMPAIGN_STOP':
      return {
        ...state,
        campaign: { active: false, index: 0, battle: null },
        selectedBattle: null,
      };

    case 'CAMPAIGN_GOTO': {
      const idx = Math.max(0, Math.min(action.payload, allBattles.length - 1));
      const battle = allBattles[idx] ?? null;
      return {
        ...state,
        campaign: { ...state.campaign, index: idx, battle },
        selectedBattle: battle,
      };
    }

    case 'DISMISS_INTRO':
      return { ...state, ui: { ...state.ui, showIntro: false } };

    case 'TOGGLE_BATTLE_LIST':
      return {
        ...state,
        ui: { ...state.ui, battleListOpen: !state.ui.battleListOpen },
      };

    case 'TOGGLE_AUDIO':
      return { ...state, ui: { ...state.ui, audioEnabled: !state.ui.audioEnabled } };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  filteredBattles: Battle[];
  allBattles: Battle[];
  campaignTotal: number;
}

const AppContext = createContext<ContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const filteredBattles = useMemo<Battle[]>(() => {
    let result = allBattles;

    if (state.filters.search.trim()) {
      const q = state.filters.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q) ||
          b.summary.toLowerCase().includes(q) ||
          b.commanders.some((c) => c.name.toLowerCase().includes(q))
      );
    }

    if (state.filters.outcome !== 'All') {
      result = result.filter((b) => b.outcome === state.filters.outcome);
    }

    if (state.filters.year !== null) {
      result = result.filter((b) => b.year === state.filters.year);
    }

    return result;
  }, [state.filters]);

  const value = useMemo<ContextValue>(
    () => ({ state, dispatch, filteredBattles, allBattles, campaignTotal: allBattles.length }),
    [state, dispatch, filteredBattles]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
