import { GeminiBatchItem, GeminiVoice, Sample } from '../../../types';
import { normalizeKurdishCompare } from '../../../utils/kurdishNormalize';

export function resolveEffectiveVoice(
  item: GeminiBatchItem,
  selectedVoice: string,
  batchVoiceMode: string,
  voices: GeminiVoice[]
): string {
  let effVoice = item.voiceName || selectedVoice;
  if (batchVoiceMode === 'random_female' || batchVoiceMode === 'random_male') {
    const isFem = batchVoiceMode === 'random_female';
    const pool = voices.filter(v => v.gender === (isFem ? 'Female' : 'Male'));
    if (!item.voiceName || item.voiceGender !== (isFem ? 'Female' : 'Male')) {
      effVoice = pool[Math.floor(Math.random() * pool.length)]?.id || (isFem ? 'Aoede' : 'Puck');
    }
  }
  return effVoice;
}

export function assignGenderVoices(
  items: GeminiBatchItem[],
  voices: GeminiVoice[],
  gender: 'Female' | 'Male'
): GeminiBatchItem[] {
  const target = voices.filter(v => v.gender === gender);
  if (target.length === 0) return items;
  return items.map(it =>
    it.status === 'completed'
      ? it
      : { ...it, voiceName: target[Math.floor(Math.random() * target.length)].id, voiceGender: gender }
  );
}

export function assignMixGenderVoices(
  items: GeminiBatchItem[],
  voices: GeminiVoice[]
): GeminiBatchItem[] {
  const females = voices.filter(v => v.gender === 'Female');
  const males = voices.filter(v => v.gender === 'Male');
  const pending = items.filter(it => it.status !== 'completed');
  const numF = Math.floor(pending.length / 2);
  const genders: ('Female' | 'Male')[] = [
    ...Array(numF).fill('Female'),
    ...Array(pending.length - numF).fill('Male')
  ].sort(() => Math.random() - 0.5);

  let gIdx = 0;
  return items.map(it => {
    if (it.status === 'completed') return it;
    const gen = genders[gIdx++];
    const pool = gen === 'Female' ? females : males;
    return {
      ...it,
      voiceName: pool[Math.floor(Math.random() * pool.length)]?.id || 'Puck',
      voiceGender: gen
    };
  });
}

export function matchDatasetDuplicates(
  items: GeminiBatchItem[],
  dataset: Sample[]
): { updatedItems: GeminiBatchItem[]; matchCount: number } {
  let matchCount = 0;
  const updatedItems = items.map(it => {
    if (it.status === 'completed' && it.sample) return it;
    const norm = normalizeKurdishCompare(it.cleanText || it.text);
    const match = dataset.find(s => normalizeKurdishCompare(s.cleanText || s.text) === norm);
    if (match) {
      matchCount++;
      return {
        ...it,
        status: 'completed' as const,
        sample: match,
        duration: match.durationSeconds,
        keyUsed: `Dataset #${match.id}`,
        error: undefined
      };
    }
    return it;
  });
  return { updatedItems, matchCount };
}
