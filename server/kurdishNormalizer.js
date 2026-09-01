/**
 * Sorani Kurdish Asosoft Text Normalizer & Phonetic Analyzer for Node.js
 * ---------------------------------------------------------------------
 * Standard Asosoft Kurdish spelling, ZWNJ (U+200C / نیمبۆشایی) rules,
 * paralinguistic tag handling, and phonetic coverage analysis.
 */

export const ZWNJ = '\u200c';

export const PARALINGUISTIC_TAGS = new Set([
  '[laugh]',
  '[sigh]',
  '[whisper]',
  '[gasp]',
  '[cough]'
]);

export const DISTINCT_KURDISH_PHONEMES = {
  'ڵ': { name: 'Velarized L', category: 'consonant' },
  'ڕ': { name: 'Trilled R', category: 'consonant' },
  'ڤ': { name: 'Veh (V)', category: 'consonant' },
  'ۆ': { name: 'Kurdish O', category: 'vowel' },
  'ێ': { name: 'Kurdish E', category: 'vowel' },
  'ە': { name: 'Schwa / Ae', category: 'vowel' },
  'پ': { name: 'Peh', category: 'consonant' },
  'چ': { name: 'Tcheh', category: 'consonant' },
  'ژ': { name: 'Jeh', category: 'consonant' },
  'گ': { name: 'Gaf', category: 'consonant' }
};

/**
 * Normalizes Kurdish text adhering to Asosoft standard.
 */
export function normalizeKurdish(text, preserveParalinguistic = true) {
  if (!text || typeof text !== 'string') return '';

  // 1. NFC normalization
  let normalized = text.normalize('NFC');

  // 2. Kurdish character standardization
  normalized = normalized
    .replace(/ك/g, 'ک')
    .replace(/[يى]/g, 'ی')
    .replace(/ة/g, 'ە')
    .replace(/\u200d/g, '') // remove ZWJ
    .replace(/\ufeff/g, '') // remove BOM
    .replace(/\u00ad/g, ''); // remove Soft Hyphen

  // 3. Paralinguistic tags protection / stripping
  const preservedTokens = {};
  if (preserveParalinguistic) {
    for (const tag of PARALINGUISTIC_TAGS) {
      if (normalized.includes(tag)) {
        const placeholder = `__PARALANG_${tag.replace(/[\[\]]/g, '').toUpperCase()}__`;
        preservedTokens[placeholder] = tag;
        normalized = normalized.split(tag).join(placeholder);
      }
    }
  } else {
    for (const tag of PARALINGUISTIC_TAGS) {
      normalized = normalized.split(tag).join(' ');
    }
  }

  // Remove untracked noise brackets
  normalized = normalized.replace(/\([A-Za-z0-9_\s-]{2,}\)/g, ' ');
  normalized = normalized.replace(/\[[A-Za-z0-9_\s-]{2,}\]/g, ' ');

  // 4. Apply Kurdish ZWNJ rules
  normalized = applyZwnjRules(normalized);

  // 5. Punctuation formatting
  normalized = normalized
    .replace(/,/g, '،')
    .replace(/;/g, '؛')
    .replace(/\?/g, '؟')
    .replace(/"/g, '«')
    .replace(/««/g, '«')
    .replace(/»»/g, '»');

  // 6. Whitespace cleanup
  normalized = normalized.replace(/[ \t]+/g, ' ').trim();

  // 7. Restore protected tags
  for (const [placeholder, tag] of Object.entries(preservedTokens)) {
    normalized = normalized.split(placeholder).join(` ${tag} `);
  }

  normalized = normalized.replace(/\s+/g, ' ').trim();
  normalized = normalized.replace(/\s+([،؛؟\.\!\?])/g, '$1');
  normalized = normalized.replace(/(\[.*?\])\s+([،؛؟\.\!\?])/g, '$1$2');

  return normalized;
}

/**
 * Strips paralinguistic tags for clean ASR ground truth text.
 */
export function stripParalinguistic(text) {
  return normalizeKurdish(text, false).replace(/\s+/g, ' ').trim();
}

/**
 * Applies Asosoft ZWNJ rules.
 */
function applyZwnjRules(text) {
  const z = ZWNJ;

  // Clean isolated ZWNJ near spaces or punctuation
  text = text.replace(new RegExp(`${z}+\\s+`, 'g'), ' ');
  text = text.replace(new RegExp(`\\s+${z}+`, 'g'), ' ');
  text = text.replace(new RegExp(`${z}+([،؛؟\\.\\!\\?])`, 'g'), '$1');
  text = text.replace(new RegExp(`([،؛؟\\.\\!\\?])${z}+`, 'g'), '$1');

  // Known compounds needing ZWNJ
  const compounds = [
    ['دەستپێکردن', `دەست${z}پێکردن`],
    ['خوێندنگە', `خوێند${z}گە`],
    ['کتێبخانە', `کتێب${z}خانە`],
    ['چایخانە', `چای${z}خانە`],
    ['نەخۆشخانە', `نەخۆش${z}خانە`],
    ['کردووەتەوە', `کردووەت${z}ەوە`],
    ['خانووەکە', `خانوو${z}ەکە`],
    ['خانووەکان', `خانوو${z}ەکان`],
    ['پێداچوونەوە', `پێدا${z}چوونەوە`],
    ['پێکهاتن', `پێک${z}هاتن`],
    ['تێگەیشتن', `تێ${z}گەیشتن`],
    ['بێدەنگ', `بێ${z}دەنگ`],
    ['بێهیوا', `بێ${z}هیوا`],
    ['بێمانا', `بێ${z}مانا`]
  ];

  for (const [orig, target] of compounds) {
    const spaceVariant = orig.replace(new RegExp(z, 'g'), ' ');
    text = text.split(orig).join(target);
    text = text.split(spaceVariant).join(target);
  }

  // Verb prefixes (دە, نا, نە, بێ)
  text = text.replace(/(^|\s)(دە|نا|نە|بێ)\s+([\u0600-\u06FF]{3,})/g, `$1$2${z}$3`);

  // Compound suffixes
  text = text.replace(/([\u0600-\u06FF]{2,})\s+(ەوە|ەکان|ەکانی|مان|تان|یان|خانە|گە)(?=[\s،؛؟\.\!\?]|$)/g, `$1${z}$2`);

  // Deduplicate ZWNJs
  text = text.replace(new RegExp(`${z}{2,}`, 'g'), z);

  return text;
}

/**
 * Evaluates Kurdish phonetic coverage and suitability metrics.
 */
export function analyzePhonetics(text) {
  const clean = text.replace(/\[.*?\]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const phonemeCounts = {};
  const detectedPhonemes = [];

  for (const char of Object.keys(DISTINCT_KURDISH_PHONEMES)) {
    const count = (clean.split(char).length - 1);
    phonemeCounts[char] = count;
    if (count > 0) {
      detectedPhonemes.push(char);
    }
  }

  const coverageRatio = detectedPhonemes.length / Object.keys(DISTINCT_KURDISH_PHONEMES).length;
  const phoneticDiversityScore = Math.round(coverageRatio * 1000) / 1000;
  const estimatedDuration = Math.round(Math.max(1.5, wordCount / 2.0) * 100) / 100;

  let suitabilityScore = 80;
  if (wordCount >= 4 && wordCount <= 18) suitabilityScore += 10;
  else if (wordCount < 3 || wordCount > 25) suitabilityScore -= 30;
  else suitabilityScore -= 10;

  suitabilityScore += Math.round(coverageRatio * 10);
  if (/[،؛؟\.\!\?]/.test(text)) suitabilityScore += 5;
  suitabilityScore = Math.max(10, Math.min(100, suitabilityScore));

  return {
    wordCount,
    estimatedDuration,
    phonemeCounts,
    detectedPhonemes,
    distinctPhonemeCount: detectedPhonemes.length,
    phoneticDiversityScore,
    ttsSuitabilityScore: suitabilityScore
  };
}
