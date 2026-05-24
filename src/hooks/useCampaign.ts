import { useState, useCallback, useRef, useEffect } from 'react';
import { getBattlesSorted } from '../data/battles';
import type { Battle } from '../types/battle';

const CAMPAIGN_INTERVAL_MS = 5000; // Auto-advance every 5 seconds

export function useCampaign(onBattleSelect: (b: Battle) => void) {
  const allBattles = getBattlesSorted();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [campaignBattle, setCampaignBattle] = useState<Battle | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBattle = useCallback(
    (index: number) => {
      const battle = allBattles[index];
      if (!battle) return;
      setCampaignBattle(battle);
      onBattleSelect(battle);
    },
    [allBattles, onBattleSelect]
  );

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;
    showBattle(currentIndex);

    timerRef.current = setTimeout(() => {
      if (currentIndex < allBattles.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        // End of campaign
        setIsPlaying(false);
        setCampaignBattle(null);
      }
    }, CAMPAIGN_INTERVAL_MS);

    return clearTimer;
  }, [isPlaying, currentIndex, showBattle, allBattles.length]);

  const start = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (campaignBattle) {
      resume();
    } else {
      start();
    }
  }, [isPlaying, campaignBattle, start, pause, resume]);

  const reset = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setCurrentIndex(0);
    setCampaignBattle(null);
  }, []);

  const next = useCallback(() => {
    clearTimer();
    setCurrentIndex((i) => Math.min(i + 1, allBattles.length - 1));
  }, [allBattles.length]);

  const prev = useCallback(() => {
    clearTimer();
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  return {
    isPlaying,
    currentIndex,
    campaignBattle,
    totalCount: allBattles.length,
    toggle,
    reset,
    next,
    prev,
    stop: reset,
  };
}
