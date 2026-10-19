export function v20FamilyId(sample) {
  const explicit = sample.family_id || sample.metadata_extra?.family_id;
  if (/^v20_run_\d+_(gemini|elevenlabs)_family_\d+$/.test(explicit || '')) return explicit;
  return sample.id?.match(/^(v20_run_\d+_(?:gemini|elevenlabs)_family_\d+)_/)?.[1] || null;
}
export function groupV20Families(samples, emotions) {
  const groups = new Map(), allowed = new Set(emotions);
  for (const sample of samples) {
    const id = v20FamilyId(sample); if (!id) continue;
    const group = groups.get(id) || { id, runId: id.match(/^v20_run_\d+/)[0],
      provider: id.includes('_gemini_') ? 'gemini' : 'elevenlabs',
      speaker: sample.voice_name || sample.speaker_name || 'Unknown voice', language: sample.language,
      text: sample.cleanText || sample.text, takes: {}, present: 0, duplicates: 0 };
    const key = String(sample.emotion).toLowerCase();
    if (allowed.has(key)) (group.takes[key] ||= []).push(sample);
    groups.set(id, group);
  }
  for (const group of groups.values()) {
    group.present = Object.values(group.takes).filter(takes => takes.some(sample => sample.hasAudio !== false)).length;
    group.duplicates = Object.values(group.takes).reduce((sum, takes) => sum + Math.max(0, takes.length - 1), 0);
  }
  return [...groups.values()].sort((a, b) => b.id.localeCompare(a.id));
}
