import { useMemo } from 'react';
import { getBattlesSorted } from '../data/battles';
import type { AppFilters, Battle } from '../types/battle';

export function useBattles(filters: AppFilters): Battle[] {
  const sorted = useMemo(() => getBattlesSorted(), []);

  return useMemo(() => {
    let result = sorted;

    // Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q) ||
          b.summary.toLowerCase().includes(q) ||
          b.commanders.some((c) => c.name.toLowerCase().includes(q))
      );
    }

    // Outcome filter
    if (filters.outcome !== 'All') {
      result = result.filter((b) => b.outcome === filters.outcome);
    }

    // Year filter
    if (filters.year !== null) {
      result = result.filter((b) => b.year === filters.year);
    }

    return result;
  }, [sorted, filters]);
}
