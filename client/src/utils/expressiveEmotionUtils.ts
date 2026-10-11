/**
 * Universal Emotion Extraction & Filtering Utility for Expressive Datasets
 * Handles single emotions, mixed emotion pairs, acting delivery traits, and tags.
 */

export interface FilterEmotionOption {
  id: string;
  label: string;
  color: string;
}

export const EXPRESSIVE_FILTER_EMOTIONS: FilterEmotionOption[] = [
  { id: 'neutral', label: 'Neutral', color: '#94A3B8' },
  { id: 'happy', label: 'Happy', color: '#F59E0B' },
  { id: 'sad', label: 'Sad', color: '#3B82F6' },
  { id: 'angry', label: 'Angry', color: '#EF4444' },
  { id: 'fear', label: 'Fear', color: '#8B5CF6' },
  { id: 'whisper', label: 'Whisper', color: '#A855F7' },
  { id: 'laugh', label: 'Laugh', color: '#EC4899' },
  { id: 'mixed', label: 'Mixes', color: '#10B981' }
];

const KNOWN_MIX_PAIRS: Record<string, [string, string]> = {
  happy_sad: ['happy', 'sad'],
  angry_sad: ['angry', 'sad'],
  happy_angry: ['happy', 'angry'],
  fear_sad: ['fear', 'sad'],
  fear_angry: ['fear', 'angry'],
  happy_fear: ['happy', 'fear']
};

/**
 * Extracts all canonical emotion and style tags from any sample, take, or condition.
 */
export function parseUniversalEmotions(item: any): string[] {
  if (!item) return ['neutral'];
  const tags = new Set<string>();

  // 1. Direct emotion property
  if (item.emotion) {
    const raw = String(item.emotion).toLowerCase();
    for (const part of raw.split(/[,/_\s+]+/)) {
      const clean = part.trim();
      if (clean) tags.add(clean);
    }
  }

  // 2. Condition ID inspection (e.g. mix_happy_sad_low_high, ang_whisp_high)
  const condId = String(
    item.conditionId ||
    item.condition_id ||
    item.customMetadata?.condition_id ||
    item.customMetadata?.expressive_condition ||
    item.id ||
    ''
  ).toLowerCase();

  if (condId.includes('mix_') || condId.includes('mixed')) {
    tags.add('mixed');
    for (const [key, pair] of Object.entries(KNOWN_MIX_PAIRS)) {
      if (condId.includes(key)) {
        tags.add(pair[0]);
        tags.add(pair[1]);
      }
    }
  }

  if (condId.includes('whisp')) tags.add('whisper');
  if (condId.includes('laugh') || condId.includes('cackle')) {
    tags.add('laugh');
    tags.add('laughing');
  }
  if (condId.includes('hap_') || condId.startsWith('hap_')) tags.add('happy');
  if (condId.includes('sad_') || condId.startsWith('sad_')) tags.add('sad');
  if (condId.includes('ang_') || condId.startsWith('ang_')) tags.add('angry');
  if (condId.includes('neu_') || condId.startsWith('neu_')) tags.add('neutral');
  if (condId.includes('fear_')) tags.add('fear');

  // 3. Delivery attribute
  const del = String(item.delivery || item.customMetadata?.delivery || '').toLowerCase();
  if (del === 'whisper' || del === 'whispering') tags.add('whisper');
  if (del === 'laughing_speech' || del === 'laugh' || del === 'laughing') {
    tags.add('laugh');
    tags.add('laughing');
  }

  // 4. Bracketed tags or arrays (e.g. emotion_tag, [laugh])
  const rawTags = item.emotion_tag || item.emotionTag || item.customMetadata?.detected_tags;
  if (rawTags) {
    const arr = Array.isArray(rawTags) ? rawTags : String(rawTags).split(/[\s,]+/);
    for (const t of arr) {
      const clean = String(t).replace(/[\[\]]/g, '').trim().toLowerCase();
      if (clean) {
        tags.add(clean);
        if (clean === 'laugh' || clean === 'laughing' || clean === 'cackle') {
          tags.add('laugh');
          tags.add('laughing');
        }
        if (clean === 'whisper' || clean === 'whispering') {
          tags.add('whisper');
        }
      }
    }
  }

  // 5. Vocal events inspection
  const events = item.vocal_events || item.customMetadata?.vocal_events;
  if (Array.isArray(events)) {
    for (const ev of events) {
      if (String(ev).includes('laugh')) {
        tags.add('laugh');
        tags.add('laughing');
      }
    }
  }

  // Clean-up: If non-neutral emotions exist, remove stray neutral unless explicitly baseline
  if (tags.size > 1 && tags.has('neutral') && !condId.includes('neu_')) {
    tags.delete('neutral');
  }

  return tags.size > 0 ? Array.from(tags) : ['neutral'];
}

/**
 * Checks if extracted emotions match user-selected filter emotions.
 */
export function matchesEmotionFilter(
  extractedEmotions: string[],
  selectedFilters: string[],
  matchMode: 'any' | 'all' = 'any'
): boolean {
  if (!selectedFilters || selectedFilters.length === 0 || selectedFilters.includes('all')) {
    return true;
  }

  const normalizedExtracted = new Set(extractedEmotions.map(e => e.toLowerCase().trim()));

  const checkMatch = (filter: string) => {
    const f = filter.toLowerCase().trim();
    if (f === 'laugh' || f === 'laughing') {
      return normalizedExtracted.has('laugh') || normalizedExtracted.has('laughing') || normalizedExtracted.has('cackle');
    }
    if (f === 'whisper') {
      return normalizedExtracted.has('whisper') || normalizedExtracted.has('whispering');
    }
    if (f === 'mixed') {
      return normalizedExtracted.has('mixed');
    }
    return normalizedExtracted.has(f);
  };

  if (matchMode === 'all') {
    return selectedFilters.every(checkMatch);
  }

  return selectedFilters.some(checkMatch);
}

