import { resolveSampleGender } from './datasetGender.js';

/**
 * Checks if a sample matches given export filter criteria.
 */
export function sampleMatchesFilter(sample, filters = {}) {
  if (!sample) return false;
  if (!filters || Object.keys(filters).length === 0) return true;

  // 1. Specific sample IDs filter (comma-separated or array)
  if (filters.ids) {
    const idSet = new Set(
      Array.isArray(filters.ids)
        ? filters.ids.map(id => String(id).trim().toLowerCase())
        : String(filters.ids).split(',').map(id => id.trim().toLowerCase())
    );
    if (!idSet.has(String(sample.id).toLowerCase())) {
      return false;
    }
  }

  // 2. Gender filter
  if (filters.gender && filters.gender !== 'all') {
    const targetGender = String(filters.gender).toLowerCase().trim();
    const sampleGender = resolveSampleGender(sample);
    if (sampleGender !== targetGender) {
      return false;
    }
  }

  // 3. Voice filter
  if (filters.voice && filters.voice !== 'all') {
    const targetVoice = String(filters.voice).toLowerCase().trim();
    const sampleVoice = String(sample.voice_name || sample.voice_id || '').toLowerCase();
    if (!sampleVoice.includes(targetVoice)) {
      return false;
    }
  }

  // 4. Dialect filter
  if (filters.dialect && filters.dialect !== 'all') {
    const targetDialect = String(filters.dialect).toLowerCase().trim();
    const sampleDialect = String(sample.dialect || 'sorani').toLowerCase().trim();
    if (sampleDialect !== targetDialect) {
      return false;
    }
  }

  // 4b. Language filter (e.g. ckb, kmr, ar, en)
  if (filters.language && filters.language !== 'all') {
    const targetLang = String(filters.language).toLowerCase().trim();
    const sampleLang = String(
      sample.language || 
      sample.customMetadata?.language || 
      sample.metadata_extra?.language || 
      (sample.dialect === 'badini' ? 'kmr' : 'ckb')
    ).toLowerCase().trim();
    if (sampleLang !== targetLang) {
      return false;
    }
  }

  // 5. Emotion filter
  if (filters.emotion && filters.emotion !== 'all') {
    const targetEmotion = String(filters.emotion).toLowerCase().trim();
    const sampleEmotion = String(sample.emotion || 'neutral').toLowerCase();
    const sampleEmotionTag = String(sample.emotion_tag || '').toLowerCase();
    if (!sampleEmotion.includes(targetEmotion) && !sampleEmotionTag.includes(targetEmotion)) {
      return false;
    }
  }

  // 6. Synthesis Method filter
  if (filters.method && filters.method !== 'all') {
    const targetMethod = String(filters.method).toLowerCase().trim();
    const sampleMethod = String(sample.method || '').toLowerCase().trim();
    if (sampleMethod !== targetMethod) {
      return false;
    }
  }

  // 7. General text / search query filter
  if (filters.search && String(filters.search).trim()) {
    const query = String(filters.search).toLowerCase().trim();
    const matchId = String(sample.id || '').toLowerCase().includes(query);
    const matchText = String(sample.text || '').toLowerCase().includes(query);
    const matchClean = String(sample.cleanText || '').toLowerCase().includes(query);
    const matchVoice = String(sample.voice_name || sample.voice_id || '').toLowerCase().includes(query);
    const matchLang = String(sample.language || '').toLowerCase().includes(query);
    if (!matchId && !matchText && !matchClean && !matchVoice && !matchLang) {
      return false;
    }
  }

  return true;
}
