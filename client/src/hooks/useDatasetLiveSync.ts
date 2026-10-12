import { useState, useRef, useEffect } from 'react';
import { Sample } from '../types';

export function useDatasetLiveSync(
  samples: Sample[],
  onSamplesRefreshed?: (samples: Sample[]) => void
) {
  const prevIdsRef = useRef<Set<string>>(new Set(samples.map((s) => s.id)));
  const samplesRef = useRef(samples);
  const onSamplesRefreshedRef = useRef(onSamplesRefreshed);
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<string>>(new Set());
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  samplesRef.current = samples;
  onSamplesRefreshedRef.current = onSamplesRefreshed;

  // Highlight live updates
  useEffect(() => {
    const currentIds = new Set(samples.map((s) => s.id));
    const newItems = samples.filter((s) => !prevIdsRef.current.has(s.id));

    if (newItems.length > 0 && prevIdsRef.current.size > 0) {
      const newIdSet = new Set(newItems.map((s) => s.id));
      setRecentlyAddedIds((curr) => new Set([...curr, ...newIdSet]));

      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = setTimeout(() => {
        setRecentlyAddedIds((curr) => {
          const next = new Set(curr);
          newIdSet.forEach((id) => next.delete(id));
          return next;
        });
      }, 6000);
    }
    prevIdsRef.current = currentIds;

    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, [samples]);

  // Real-time polling listener (decoupled from samples and callback references to prevent restart storms)
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/dataset');
        if (!res.ok) return;
        const data = await res.json();
        const freshList: Sample[] = data.samples || [];

        if (isMounted && freshList.length > 0) {
          const currentList = samplesRef.current;
          const currentIds = new Set(currentList.map((s) => s.id));
          const hasChanges = freshList.length !== currentList.length || freshList.some((s) => !currentIds.has(s.id));
          if (hasChanges) {
            onSamplesRefreshedRef.current?.(freshList);
          }
        }
      } catch {
        // silent polling catch
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { recentlyAddedIds };
}
