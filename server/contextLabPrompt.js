import { normalizeMultilingualBidiText, sanitizeVoice } from './geminiService.js';

export function cleanLabParagraphs(paragraphs) {
  if (!Array.isArray(paragraphs) || paragraphs.length < 1 || paragraphs.length > 24
    || paragraphs.some(text => typeof text !== 'string' || !text.trim())) {
    throw new Error('Provide 1–24 nonempty dialogue lines in their original order.');
  }
  if (paragraphs.join('').length > 50000) throw new Error('Dialogue text is too long.');
  return paragraphs.map(text => normalizeMultilingualBidiText(text.trim()));
}

export function buildContextLabBatchPrompt(paragraphs, options = {}) {
  const cleanParagraphs = cleanLabParagraphs(paragraphs);
  const cleanSpk1 = sanitizeVoice(options.speaker1Voice || 'Puck');
  const cleanSpk2 = sanitizeVoice(options.speaker2Voice || 'Aoede');
  if (cleanSpk1.toLowerCase() === cleanSpk2.toLowerCase() && cleanParagraphs.length > 1) {
    throw new Error('Speaker slicing requires two distinct voices.');
  }
  const dialectName = options.dialect === 'badini' ? 'Northern Kurdish (Badini)' : 'Central Kurdish (Sorani)';
  const region = options.dialect === 'badini' ? 'Duhok/Badinan' : 'Erbil/Sulaymaniyah';
  const reset = `Immediately reset to authentic native ${dialectName} phonology and ${region} intonation after Arabic phrases. Do not carry Arabic gutturals, vowel elongation, or cadence into Kurdish words.`;
  const style = `Natural fluent code-switching across Kurdish, English, and Arabic. ${reset}`;
  const speechParts = cleanParagraphs.map((text, index) => ({
    text, speech_metadata: { speaker: index % 2 ? 'Speaker2' : 'Speaker1', style }
  }));
  const instruction = `Read every dialogue line exactly once and in order. Speaker1 (${cleanSpk1}) and Speaker2 (${cleanSpk2}) alternate with natural conversational turn-taking. Preserve each speaker's distinct voice throughout. ${style}`;
  return {
    cleanParagraphs, cleanSpk1, cleanSpk2, speechParts, instruction,
    legacyPrompt: speechParts.map(part => `${part.speech_metadata.speaker}: ${part.text}`).join('\n\n'),
    multiSpeakerConfig: { speakerVoiceConfigs: [
      { speaker: 'Speaker1', voiceConfig: { prebuiltVoiceConfig: { voiceName: cleanSpk1 } } },
      { speaker: 'Speaker2', voiceConfig: { prebuiltVoiceConfig: { voiceName: cleanSpk2 } } }
    ] }
  };
}
