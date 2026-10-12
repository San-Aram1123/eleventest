import { DuplicateParagraphStats, EmotionBadgeInfo } from '../components/splitter/splitterTypes';

const EMOTION_MAP: Record<string, { color: string; bg: string }> = {
  whisper: { color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.2)' },
  whispering: { color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.2)' },
  soft: { color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.2)' },
  'چرپە': { color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.2)' },
  happy: { color: '#34D399', bg: 'rgba(52, 211, 153, 0.2)' },
  cheerful: { color: '#34D399', bg: 'rgba(52, 211, 153, 0.2)' },
  joy: { color: '#34D399', bg: 'rgba(52, 211, 153, 0.2)' },
  'دڵخۆش': { color: '#34D399', bg: 'rgba(52, 211, 153, 0.2)' },
  excited: { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.2)' },
  'حەماسی': { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.2)' },
  laugh: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' },
  giggle: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' },
  laughter: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' },
  'پێکەنین': { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' },
  angry: { color: '#F87171', bg: 'rgba(248, 113, 113, 0.2)' },
  shouting: { color: '#F87171', bg: 'rgba(248, 113, 113, 0.2)' },
  'تووڕە': { color: '#F87171', bg: 'rgba(248, 113, 113, 0.2)' },
  'هاوار': { color: '#F87171', bg: 'rgba(248, 113, 113, 0.2)' },
  sad: { color: '#818CF8', bg: 'rgba(129, 140, 248, 0.2)' },
  crying: { color: '#818CF8', bg: 'rgba(129, 140, 248, 0.2)' },
  'خەمبار': { color: '#818CF8', bg: 'rgba(129, 140, 248, 0.2)' },
  'گریان': { color: '#818CF8', bg: 'rgba(129, 140, 248, 0.2)' },
  calm: { color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.2)' },
  peaceful: { color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.2)' },
  'ئارام': { color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.2)' },
  'هێمن': { color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.2)' },
  surprise: { color: '#EC4899', bg: 'rgba(244, 114, 182, 0.2)' },
  'سەرسام': { color: '#EC4899', bg: 'rgba(244, 114, 182, 0.2)' },
  nervous: { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.2)' },
  tired: { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.2)' },
  'ترساو': { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.2)' },
  'ماندوو': { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.2)' }
};

export const mergeStandaloneTags = (items: string[]): string[] => {
  const merged: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isPureTag = /^(?:\[|【|［|\()[a-zA-Z0-9_\s\u0600-\u06FF-]+(?:\]|】|］|\))$/i.test(item) ||
                      /^[a-zA-Z\u0600-\u06FF]{2,15}:$/i.test(item);
    if (isPureTag && i + 1 < items.length) {
      merged.push(`${item} ${items[i + 1]}`.trim());
      i++;
    } else {
      merged.push(item);
    }
  }
  return merged;
};

export const parseRawTextToParagraphs = (text: string): string[] => {
  if (!text) return [];
  const cleanText = text.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D]/g, '').trim();
  if (!cleanText) return [];

  if (cleanText.includes('---')) {
    const byDelim = cleanText
      .split(/---+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    return mergeStandaloneTags(byDelim);
  }

  if (/\r?\n\s*\r?\n/.test(cleanText)) {
    const byParagraphs = cleanText
      .split(/\r?\n\s*\r?\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    return mergeStandaloneTags(byParagraphs);
  }

  const lines = cleanText
    .split(/\r?\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  return mergeStandaloneTags(lines.length > 0 ? lines : [cleanText]);
};

export const normalizeParagraph = (p: string): string => {
  return p
    .replace(/(?:\[|【|［|\()[^\]】］\)]*(?:\]|】|］|\))/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const filterUniqueParagraphs = (paragraphs: string[]): { unique: string[]; removedCount: number } => {
  const seen = new Set<string>();
  const cleaned: string[] = [];
  paragraphs.forEach(p => {
    const norm = normalizeParagraph(p);
    if (!norm) return;
    if (seen.has(norm)) return;
    seen.add(norm);
    cleaned.push(p);
  });
  return { unique: cleaned, removedCount: paragraphs.length - cleaned.length };
};

export const calculateDuplicateStats = (paragraphs: string[]): DuplicateParagraphStats => {
  const seen = new Map<string, number>();
  let duplicateCount = 0;
  paragraphs.forEach(p => {
    const norm = normalizeParagraph(p);
    if (!norm) return;
    const count = seen.get(norm) || 0;
    if (count >= 1) duplicateCount++;
    seen.set(norm, count + 1);
  });
  return { duplicateCount, uniqueCount: seen.size };
};

export const getEmotionBadgeInfo = (text: string, defaultEmotion: string = 'neutral'): EmotionBadgeInfo => {
  const bracketRegex = /(?:\[|【|［|\()([a-zA-Z0-9_\s\u0600-\u06FF-]+)(?:\]|】|］|\))/g;
  const tags: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = bracketRegex.exec(text)) !== null) {
    const t = m[1].toLowerCase().trim();
    if (t) tags.push(t);
  }
  const prefixMatch = text.match(/^([a-zA-Z\u0600-\u06FF]{2,15}):\s+/);
  if (prefixMatch) {
    tags.push(prefixMatch[1].toLowerCase().trim());
  }

  if (tags.length > 0) {
    const tag = tags[0];
    const mapped = EMOTION_MAP[tag];
    if (mapped) {
      return { tag, color: mapped.color, bg: mapped.bg, hasTag: true };
    }
    return { tag, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)', hasTag: true };
  }

  return {
    tag: defaultEmotion,
    color: defaultEmotion !== 'neutral' ? '#F59E0B' : '#64748B',
    bg: defaultEmotion !== 'neutral' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
    hasTag: false
  };
};
