/**
 * Normalizes Kurdish text for robust duplicate comparison.
 * Strips bracketed tags, zero-width characters, punctuation, and extra whitespace.
 */
export function normalizeKurdishText(t: string): string {
  if (!t) return '';
  return t
    .replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '') // remove inline tags like [laugh]
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width characters
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟،!?:"]/g, '') // punctuation
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Checks if a language code or sample text should be rendered RTL.
 */
export function isRtlLanguage(lang?: string): boolean {
  if (!lang) return true;
  const l = lang.trim().toLowerCase();
  if (l === 'en' || l === 'english') return false;
  return true;
}
