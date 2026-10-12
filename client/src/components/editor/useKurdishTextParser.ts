import { useMemo } from 'react';

export function useKurdishTextParser(value: string) {
  return useMemo(() => {
    const cleanTranscript = (value || '')
      .replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const detectedTags = ((value || '').match(/\[([a-zA-Z0-9_\s-]+)\]/g) || []);

    const tagCounts: Record<string, number> = {};
    detectedTags.forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });

    const wordCount = cleanTranscript ? cleanTranscript.split(/\s+/).length : 0;
    const charCount = cleanTranscript.length;

    return {
      cleanTranscript,
      detectedTags,
      tagCounts,
      wordCount,
      charCount
    };
  }, [value]);
}
