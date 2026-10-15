/**
 * Emotion Parsing & Normalization Utilities
 * Supports inline tags in multiple formats:
 * - Square brackets: [whisper], [happy], [calm]
 * - Parentheses: (whisper), (happy)
 * - Unicode / fullwidth brackets: 【whisper】, ［whisper］, （whisper）
 * - Colon prefixes: whisper: ..., چرپە: ...
 * - Kurdish / Sorani emotion terms: [چرپە], [پێکەنین], [دڵخۆش], [ئارام], [تووڕە], etc.
 */

import { V20_EMOTION_PROFILES } from './shared/v20EmotionCatalog.js';

export const EMOTION_CANONICAL_MAP = {
  // Whispering / Soft
  'whisper': 'whisper',
  'whispering': 'whisper',
  'soft': 'whisper',
  'breathy': 'whisper',
  'quiet': 'whisper',
  'چرپە': 'whisper',
  'بە چرپە': 'whisper',
  'بەچرپە': 'whisper',

  // Cackle / Laugh / Giggle
  'cackle': 'cackle',
  'cackling': 'cackle',
  'قاقا': 'cackle',
  'بە قاقا': 'cackle',
  'بەقاقا': 'cackle',
  'laugh': 'laugh',
  'laughing': 'laugh',
  'laughter': 'laugh',
  'giggle': 'laugh',
  'chuckle': 'laugh',
  'پێکەنین': 'cackle',
  'بە پێکەنین': 'cackle',
  'بەپێکەنین': 'cackle',

  // Happy / Joy
  'happy': 'happy',
  'cheerful': 'happy',
  'joy': 'happy',
  'joyful': 'happy',
  'glad': 'happy',
  'smiling': 'happy',
  'دڵخۆش': 'happy',
  'دڵخۆشی': 'happy',
  'بە دڵخۆشی': 'happy',
  'بەدڵخۆشی': 'happy',
  'شاد': 'happy',
  'بە کەیف': 'happy',
  'کەیفخۆش': 'happy',

  // Excited / Energetic
  'excited': 'excited',
  'excitement': 'excited',
  'enthusiastic': 'excited',
  'حەماسی': 'excited',
  'بە جۆش': 'excited',

  // Calm / Peaceful / Relaxed
  'calm': 'calm',
  'peaceful': 'calm',
  'relaxed': 'calm',
  'gentle': 'calm',
  'serene': 'calm',
  'ئارام': 'calm',
  'هێمن': 'calm',
  'بە هێمنی': 'calm',
  'بەهێمنی': 'calm',
  'لە سەرەخۆ': 'calm',

  // Sad / Crying / Tearful
  'sad': 'sad',
  'sadness': 'sad',
  'crying': 'crying',
  'cry': 'crying',
  'teary': 'sad',
  'heartbroken': 'sad',
  'خەمبار': 'sad',
  'دڵتەنگ': 'sad',
  'بە خەمباری': 'sad',
  'گریان': 'crying',
  'بە گریان': 'crying',

  // Angry / Shouting / Frustrated
  'angry': 'angry',
  'anger': 'angry',
  'furious': 'angry',
  'irritated': 'angry',
  'frustrated': 'angry',
  'shout': 'shouting',
  'shouting': 'shouting',
  'scream': 'shouting',
  'تووڕە': 'angry',
  'تووڕەیی': 'angry',
  'بە تووڕەیی': 'angry',
  'بەتووڕەیی': 'angry',
  'قاڕە': 'angry',
  'هاوار': 'shouting',
  'بە هاوار': 'shouting',

  // Surprise / Shock / Astonished
  'surprise': 'surprise',
  'surprised': 'surprise',
  'shocked': 'surprise',
  'astonished': 'surprise',
  'disbelief': 'surprise',
  'سەرسام': 'surprise',
  'سەرسوڕماو': 'surprise',
  'حەپەساو': 'surprise',

  // Nervous / Anxious / Scared
  'nervous': 'nervous',
  'anxious': 'nervous',
  'worried': 'nervous',
  'fear': 'nervous',
  'scared': 'nervous',
  'shaking': 'nervous',
  'trembling': 'nervous',
  'ترساو': 'nervous',
  'شڵەژاو': 'nervous',
  'بە ترس': 'nervous',

  // Tired / Exhausted
  'tired': 'tired',
  'exhausted': 'tired',
  'weary': 'tired',
  'sleepy': 'tired',
  'ماندوو': 'tired',
  'بێتاقەت': 'tired',

  // Sigh
  'sigh': 'sigh',
  'sighing': 'sigh',
  'ئاخ': 'sigh',
  'ئاهـ': 'sigh',

  // Neutral
  'neutral': 'neutral',
  'ئاسایی': 'neutral'
};

// Register all 50 V20 emotions and Sorani descriptors into canonical map
if (V20_EMOTION_PROFILES && typeof V20_EMOTION_PROFILES === 'object') {
  for (const [id, prof] of Object.entries(V20_EMOTION_PROFILES)) {
    EMOTION_CANONICAL_MAP[id.toLowerCase()] = id;
    if (prof.name) EMOTION_CANONICAL_MAP[prof.name.toLowerCase()] = id;
    if (prof.sorani) {
      const parts = prof.sorani.split(/[/,]/).map(p => p.trim().toLowerCase()).filter(Boolean);
      for (const p of parts) {
        EMOTION_CANONICAL_MAP[p] = id;
      }
    }
  }
}

/**
 * Normalizes an emotion string or raw tag to its canonical form
 * @param {string} rawTag
 * @returns {string} canonical emotion name
 */
export function normalizeEmotionName(rawTag) {
  if (!rawTag || typeof rawTag !== 'string') return 'neutral';
  const cleaned = rawTag.toLowerCase().replace(/^[\[\(【［\s]+|[\]\)】］\s:]+$/g, '').trim();
  return EMOTION_CANONICAL_MAP[cleaned] || cleaned || 'neutral';
}

/**
 * Extracts emotion cues and clean spoken text from a text string.
 * Strips formatting tags so only authentic spoken words remain.
 * 
 * @param {string} rawText 
 * @param {string} fallbackEmotion - default emotion if no tags found
 * @returns {{ cleanText: string, emotion: string, emotionTag: string | undefined, detectedTags: string[], hasInlineTag: boolean }}
 */
export function extractEmotionAndCleanText(rawText, fallbackEmotion = 'neutral') {
  if (!rawText || typeof rawText !== 'string') {
    return {
      cleanText: '',
      emotion: fallbackEmotion || 'neutral',
      emotionTag: fallbackEmotion && fallbackEmotion !== 'neutral' ? `[${fallbackEmotion}]` : undefined,
      detectedTags: [],
      hasInlineTag: false
    };
  }

  const rawTags = [];

  // 1. Match bracketed and parenthesized tags: [whisper], (happy), 【laugh】, ［calm］
  const bracketRegex = /(?:\[|【|［|\()([a-zA-Z0-9_\s\u0600-\u06FF-]+)(?:\]|】|］|\))/g;
  let match;
  while ((match = bracketRegex.exec(rawText)) !== null) {
    const term = match[1].trim().toLowerCase();
    if (term) {
      const canonical = EMOTION_CANONICAL_MAP[term] || term;
      rawTags.push(canonical);
    }
  }

  // 2. Match colon prefix at start of paragraph: "whisper: ..." or "چرپە: ..."
  const prefixRegex = /^([a-zA-Z\u0600-\u06FF]{2,15}):\s+/;
  const prefixMatch = rawText.match(prefixRegex);
  if (prefixMatch) {
    const prefixTerm = prefixMatch[1].trim().toLowerCase();
    if (EMOTION_CANONICAL_MAP[prefixTerm]) {
      rawTags.push(EMOTION_CANONICAL_MAP[prefixTerm]);
    }
  }

  // Deduplicate tags while preserving order
  const uniqueTags = Array.from(new Set(rawTags.filter(t => t && t !== 'neutral')));

  // Strip tags from spoken text
  const clean = rawText
    .replace(/(?:\[|【|［|\()([a-zA-Z0-9_\s\u0600-\u06FF-]+)(?:\]|】|］|\))/g, '')
    .replace(/^([a-zA-Z\u0600-\u06FF]{2,15}):\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Determine final emotion & emotionTag
  let finalEmotion = fallbackEmotion || 'neutral';
  let finalEmotionTag = undefined;

  if (uniqueTags.length > 0) {
    finalEmotion = uniqueTags[0];
    finalEmotionTag = uniqueTags.map(t => `[${t}]`).join(' ');
  } else if (fallbackEmotion && fallbackEmotion !== 'neutral') {
    finalEmotion = fallbackEmotion;
    finalEmotionTag = `[${fallbackEmotion}]`;
  }

  return {
    cleanText: clean || rawText.trim(),
    emotion: finalEmotion,
    emotionTag: finalEmotionTag,
    detectedTags: uniqueTags,
    hasInlineTag: uniqueTags.length > 0
  };
}
