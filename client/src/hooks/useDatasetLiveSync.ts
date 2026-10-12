import { useState, useRef, useEffect } from 'react';
import { Sample } from '../types';

export function useDatasetLiveSync(
  samples: Sample[],
  onSamplesRefreshed?: (samples: Sample[]) => void
) {
  const prevIdsRef = useRef<Set<string>>(new Set(samples.map((s) => s.id)));
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<string>>(new Set());

  // Highlight live updates
  useEffect(() => {
    const currentIds = new Set(samples.map((s) => s.id));
    const newItems = samples.filter((s) => !prevIdsRef.current.has(s.id));

    if (newItems.length > 0 && prevIdsRef.current.size > 0) {
      const newIdSet = new Set(newItems.map((s) => s.id));
      setRecentlyAddedIds((curr) => new Set([...curr, ...newIdSet]));
      setTimeout(() => {
        setRecentlyAddedIds((curr) => {
          const next = new Set(curr);
          newIdSet.forEach((id) => next.delete(id));
          return next;
        });
      }, 6000);
    }
    prevIdsRef.current = currentIds;
  }, [samples]);

  // Real-time polling listener every 2.5s
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/dataset');
        if (!res.ok) return;
        const data = await res.json();
        const freshList: Sample[] = data.samples || [];

        if (isMounted && freshList.length > 0) {
          const currentIds = new Set(samples.map((s) => s.id));
          const hasChanges = freshList.length !== samples.length || freshList.some((s) => !currentIds.has(s.id));
          if (hasChanges) {
            onSamplesRefreshed?.(freshList);
          }
        }
      } catch {
        // silent polling catch
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [samples, onSamplesRefreshed]);

  return { recentlyAddedIds };
}
