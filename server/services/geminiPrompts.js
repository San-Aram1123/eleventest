import { GEMINI_VOICES } from './geminiConstants.js';

export function analyzeMultilingualContent(rawText) {
  if (!rawText) return { hasLatin: false, hasArabicScript: false, startsWithLatin: false, isMultilingual: false, hasArabicPhrases: false };

  const textWithoutTags = rawText.replace(/\[([a-zA-Z0-9_\s-]+)\]/g, ' ');
  const hasLatin = /[a-zA-Z]/.test(textWithoutTags);
  const hasArabicScript = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(textWithoutTags);
  const hasKurdishChars = /[ۆێەژڵڕڤگچپ]/.test(textWithoutTags);

  const arabicPhrasesRegex = /(?:الحمد\s+لله|إن\s+شاء\s+الله|ان\s+شاء\s+الله|ما\s+شاء\s+الله|سبحان\s+الله|تبارك\s+الله|جزاك\s+الله|بارك\s+الله|لا\s+حول\s+ولا\s+قوة\s+إلا\s+بالله|أستغفر\s+الله|استغفر\s+الله|في\s+أمان\s+الله|فی\s+أمان\s+الله|قدر\s+الله|واللهِ?|بإذن\s+الله|باذن\s+الله)/i;
  const hasArabicPhrases = arabicPhrasesRegex.test(textWithoutTags);

  const trimmed = textWithoutTags.trim();
  const firstLetterMatch = trimmed.match(/^[^\p{L}\p{N}]*([\p{L}\p{N}])/u);
  const firstChar = firstLetterMatch ? firstLetterMatch[1] : '';
  const startsWithLatin = /[a-zA-Z]/.test(firstChar);
  const isMultilingual = (hasLatin && hasArabicScript) || (hasKurdishChars && hasArabicPhrases);

  return { hasLatin, hasArabicScript, hasKurdishChars, hasArabicPhrases, startsWithLatin, isMultilingual, firstChar };
}

export function normalizeMultilingualBidiText(text) {
  if (!text) return '';
  let cleaned = text;
  cleaned = cleaned.replace(/([a-zA-Z0-9][.!?])([\u0600-\u06FF])/g, '$1 $2');
  cleaned = cleaned.replace(/([\u0600-\u06FF][.!?،؛؟])([a-zA-Z0-9])/g, '$1 $2');
  cleaned = cleaned.replace(/([a-zA-Z0-9]+)\s*[-\u2010\u2013\u2014\u0640]+\s*([\u0600-\u06FF]+)/g, '$1 $2');
  cleaned = cleaned.replace(/([\u0600-\u06FF]+)\s*[-\u2010\u2013\u2014\u0640]+\s*([a-zA-Z0-9]+)/g, '$1 $2');
  return cleaned.trim();
}

export function sanitizeVoice(voiceName) {
  let clean = typeof voiceName === 'string' ? voiceName.trim() : 'Puck';
  if (clean.startsWith('gemini_')) clean = clean.replace(/^gemini_/, '');
  if (clean.startsWith('Gemini (')) clean = clean.replace(/^Gemini\s*\(([^)]+)\)$/, '$1');
  const matched = GEMINI_VOICES.find(v => v.id.toLowerCase() === clean.toLowerCase());
  return matched ? matched.id : clean;
}

export function extractInlineEmotionTags(text) {
  const inlineTags = (text.match(/\[([a-zA-Z0-9_\s-]+)\]/g) || []);
  return [...new Set(inlineTags)];
}

export function buildPromptInstructions({ dialect, promptInstruction, langAnalysis, uniqueTags }) {
  let baseInstruction = promptInstruction?.trim();
  if (!baseInstruction) {
    if (langAnalysis.isMultilingual) {
      const dialectName = dialect === 'badini' ? 'Kurdish Badini (Kurmanji)' : 'Central Kurdish (Sorani)';
      const regionalIntonation = dialect === 'badini' ? 'natural Duhok/Badinan intonation for Kurdish Badini' : 'natural Erbil/Sulaymaniyah intonation for Kurdish Sorani';
      baseInstruction = `You are a professional multilingual voice actor and speech synthesizer specializing in fluent code-switching across English, ${dialectName}, and Arabic. Read and speak aloud the provided text completely, naturally, and accurately with authentic native pronunciation and ${regionalIntonation}, natural English pronunciation, and clear Arabic pronunciation. Speak with completely fluid, continuous rhythm with zero pauses, zero hesitations, and zero breathing breaks when switching between languages. CRITICAL ACCENT BOUNDARY RULE: Immediately reset to pure, authentic ${dialectName} phonology, Kurdish vowels (ۆ, ێ, ە), and regional intonation as soon as Arabic phrases finish. Under NO circumstances carry over Arabic accents, guttural consonants, or Arabic vowel elongation into the following Kurdish words.`;
    } else if (dialect === 'badini') {
      baseInstruction = 'You are a native Kurdish Badini (Kurmanji) speaker and voice narrator from the Duhok/Badinan region performing high-quality speech synthesis. Read and speak aloud the provided Kurdish text naturally and accurately with authentic Kurdish Badini pronunciation, correct Northern Kurmanji vocabulary and vowels (ڤ, خ، ح، غ، ۆ، ێ، ە), and natural Duhok intonation. Under NO circumstances should you speak Badini with Central Sorani phonetics or Erbil/Sulaymaniyah intonation.';
    } else {
      baseInstruction = 'You are a native Kurdish Sorani speaker performing high-quality speech synthesis. Read and speak aloud the provided Kurdish text naturally and accurately with authentic Central Kurdish (Sorani) pronunciation, correct Kurdish vowels (ۆ, ێ, ە), and natural Erbil/Sulaymaniyah intonation.';
    }
  }

  let codeSwitchingDirective = '';
  let emotionDirective = '';
  if (!promptInstruction) {
    if (langAnalysis.hasLatin || langAnalysis.isMultilingual) {
      codeSwitchingDirective = `\n- English & Arabic: Fluid, rapid, continuous code-switching with zero pauses, zero hesitations, and unbroken rhythm across language transitions. Immediately reset to native Kurdish phonology after Arabic phrases without letting Arabic accent bleed into Kurdish; never omit opening words.`;
    }
    if (uniqueTags.length > 0) {
      emotionDirective = `\n- Emotions: Act out bracketed feelings (${uniqueTags.map(t => `[${t}]`).join(', ')}) naturally without speaking bracket words.`;
    }
  }

  return { baseInstruction, codeSwitchingDirective, emotionDirective };
}

export function buildSpeechPayloadParts({
  normalizedText,
  speechParts,
  speechStyle,
  promptInstruction,
  langAnalysis,
  is38Model,
  baseInstruction,
  codeSwitchingDirective,
  emotionDirective
}) {
  const defaultMultilingualStyle = langAnalysis.isMultilingual
    ? 'Fluid, rapid, continuous code-switching with zero pauses, zero hesitations, and unbroken rhythm across Kurdish, English, and Arabic. Immediately reset to pure Central Kurdish phonology and natural intonation after Arabic phrases without carrying over Arabic accent or vowel intonation into Kurdish words.'
    : '';

  if (is38Model) {
    if (Array.isArray(speechParts) && speechParts.length > 0) {
      return speechParts.map(p => {
        const item = { text: String(p.text || '').trim() };
        const style = p.style || p.speech_metadata?.style || speechStyle || promptInstruction || defaultMultilingualStyle;
        if (style) item.speech_metadata = { style: String(style).trim() };
        return item;
      });
    }

    const effectiveStyle = speechStyle || promptInstruction || defaultMultilingualStyle;
    const part = { text: normalizedText };
    if (effectiveStyle) part.speech_metadata = { style: String(effectiveStyle).trim() };
    return [part];
  }

  const prompt = promptInstruction
    ? `${baseInstruction}\n\n${normalizedText}`
    : `${baseInstruction}${codeSwitchingDirective}${emotionDirective}\n\n${normalizedText}`;
  return [{ text: prompt }];
}

export function buildGeminiRequestBody({ contentParts, cleanVoice }) {
  return {
    contents: [
      {
        role: 'user',
        parts: contentParts
      }
    ],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: cleanVoice
          }
        }
      }
    }
  };
}
