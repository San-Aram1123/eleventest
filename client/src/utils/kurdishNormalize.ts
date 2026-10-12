/**
 * Normalizes Kurdish text for robust duplicate comparison against existing dataset items.
 * Removes inline bracket tags, zero-width characters, punctuation, and extraneous spaces.
 */
export function normalizeKurdishCompare(t: string): string {
  if (!t) return '';
  return t
    .replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '') // strip [laugh], [whisper], etc.
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // strip zero-width spaces/joiners
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟،!?:"]/g, '') // strip punctuation
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
