/**
 * Normalizes Kurdish text for robust duplicate comparison in DB checks.
 */
export function normalizeKurdishTextForComparison(t) {
  if (!t) return '';
  return String(t)
    .replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '') // remove bracketed tags like [laugh]
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width spaces/joiners
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟،!?:"]/g, '') // punctuation
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
