import { useMemo } from 'react';
import { Sample } from '../../../types';
import { normalizeKurdishText } from '../../../utils/kurdishText';
import { DuplicateGroup } from './DuplicateGroupCard';

export function useDuplicateGroups(
  samples: Sample[],
  matchMode: 'exact' | 'normalized',
  searchQuery: string
) {
  const duplicateGroups = useMemo(() => {
    const map = new Map<string, { originalText: string; samples: Sample[] }>();

    for (const sample of samples) {
      const key = matchMode === 'exact'
        ? (sample.text || '').trim()
        : normalizeKurdishText(sample.cleanText || sample.text || '');

      if (!key) continue;

      if (!map.has(key)) {
        map.set(key, { originalText: sample.text, samples: [] });
      }
      map.get(key)!.samples.push(sample);
    }

    const groups: DuplicateGroup[] = [];
    for (const [key, val] of map.entries()) {
      if (val.samples.length > 1) {
        const sorted = [...val.samples].sort((a, b) => {
          const tA = new Date(a.created_at || 0).getTime();
          const tB = new Date(b.created_at || 0).getTime();
          return tB - tA;
        });

        groups.push({ normalizedKey: key, originalText: val.originalText, samples: sorted });
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return groups.filter(
        (g) =>
          g.originalText.toLowerCase().includes(q) ||
          g.samples.some((s) => s.id.toLowerCase().includes(q) || (s.voice_name || '').toLowerCase().includes(q))
      );
    }

    return groups;
  }, [samples, matchMode, searchQuery]);

  const totalDuplicateSamples = useMemo(() => {
    return duplicateGroups.reduce((acc, g) => acc + g.samples.length, 0);
  }, [duplicateGroups]);

  const redundantCount = useMemo(() => {
    return duplicateGroups.reduce((acc, g) => acc + (g.samples.length - 1), 0);
  }, [duplicateGroups]);

  return { duplicateGroups, totalDuplicateSamples, redundantCount };
}
