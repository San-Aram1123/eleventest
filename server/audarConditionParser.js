/**
 * Audar Expressive Condition Parser
 * ---------------------------------
 * Deterministically parses 81 expressive conditions into:
 * - primary emotion & exact intensity anchor (0.25, 0.60, 0.90, 0.0)
 * - x_reviewer_delivery (normal, whisper, laughing_speech)
 * - x_reviewer_emotion_components (multi-emotion strength map)
 * - x_reviewer_emotion_mode (simultaneous)
 */

export function parseExpressiveCondition(item) {
  if (!item) {
    return { isMixed: false, emotion: 'neutral', emotionIntensity: 0.0, delivery: 'normal', components: null, mode: null };
  }

  // 1. Resolve raw condition string from metadata fields, customMetadata, or extract from item.id
  let cid = String(
    item.condition_id ||
    item.expressive_condition ||
    item.customMetadata?.condition_id ||
    item.customMetadata?.expressive_condition ||
    item.metadata_extra?.condition_id ||
    item.metadata_extra?.expressive_condition ||
    ''
  ).toLowerCase().trim();

  if (!cid && item.id) {
    const match = String(item.id).match(/(mix_[a-z]+_[a-z]+_[a-z]+_[a-z]+|[a-z]{3}_[a-z]+_[a-z]+|neu_[a-z]+)/i);
    if (match) {
      cid = match[1].toLowerCase().trim();
    }
  }

  const rawIntensity = item.emotion_intensity !== undefined && item.emotion_intensity !== null
    ? Number(item.emotion_intensity)
    : (item.customMetadata?.emotion_intensity !== undefined ? Number(item.customMetadata.emotion_intensity) : null);
  const rawEmotion = String(item.emotion || 'neutral').toLowerCase();
  const levelValues = { low: 0.25, med: 0.60, high: 0.90, none: 0.0 };

  // 2. Mixed condition: mix_<emo1>_<emo2>_<lvl1>_<lvl2>
  if (cid.startsWith('mix_')) {
    const parts = cid.replace(/^mix_/, '').split('_');
    if (parts.length >= 4) {
      const emo1 = parts[0];
      const emo2 = parts[1];
      const lvl1 = parts[2];
      const lvl2 = parts[3];
      const int1 = levelValues[lvl1] ?? 0.8;
      const int2 = levelValues[lvl2] ?? 0.8;
      const components = { [emo1]: int1, [emo2]: int2 };
      const primaryEmo = int1 >= int2 ? emo1 : emo2;
      const primaryInt = Math.max(int1, int2);

      return {
        isMixed: true,
        emotion: primaryEmo,
        emotionIntensity: rawIntensity ?? primaryInt,
        delivery: 'normal',
        components,
        mode: 'simultaneous'
      };
    }
  }

  // 3. Core condition: <emo>_<delivery>_<lvl> or neu_<delivery>
  const emoMap = { ang: 'angry', hap: 'happy', sad: 'sad', neu: 'neutral', fear: 'fear' };
  const delivMap = { norm: 'normal', whisp: 'whisper', laugh: 'laughing_speech' };

  let emo = rawEmotion;
  let deliv = 'normal';
  let intensity = rawIntensity ?? (rawEmotion === 'neutral' ? 0.0 : 0.8);

  if (cid.startsWith('neu_')) {
    emo = 'neutral';
    intensity = 0.0;
    const dPart = cid.replace('neu_', '');
    deliv = delivMap[dPart] || 'normal';
    return { isMixed: false, emotion: emo, emotionIntensity: intensity, delivery: deliv, components: null, mode: null };
  }

  const parts = cid.split('_');
  if (parts.length >= 3) {
    emo = emoMap[parts[0]] || parts[0];
    deliv = delivMap[parts[1]] || 'normal';
    intensity = rawIntensity ?? (levelValues[parts[2]] ?? intensity);
    return { isMixed: false, emotion: emo, emotionIntensity: intensity, delivery: deliv, components: null, mode: null };
  }

  // Fallback for standalone legacy labels
  if (cid === 'whisper' || emo === 'whisper') {
    emo = 'neutral';
    deliv = 'whisper';
    intensity = 0.0;
  } else if (cid === 'laugh' || cid === 'cackle' || emo === 'laugh' || emo === 'cackle') {
    emo = 'happy';
    deliv = 'laughing_speech';
  }

  return { isMixed: false, emotion: emo, emotionIntensity: intensity, delivery: deliv, components: null, mode: null };
}
