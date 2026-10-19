/** Chunk first, then emotion, then each provider's independent inputs. */
export function* automaticTasks(gemini, elevenlabs, emotions) {
  const count = Math.max(gemini.length, elevenlabs.length);
  for (let start = 0; start < count; start += 6) {
    for (let emotionIndex = 0; emotionIndex < emotions.length; emotionIndex++) {
      const condition = emotions[emotionIndex];
      const paragraphs = gemini.slice(start, start + 6);
      if (paragraphs.length) yield { provider: 'gemini', start, condition, emotionIndex, paragraphs,
        key: `gemini_${start}_${condition.key}`, count: paragraphs.length };
      for (let index = start; index < Math.min(start + 6, elevenlabs.length); index++) {
        yield { provider: 'elevenlabs', start: index, condition, emotionIndex,
          text: elevenlabs[index], key: `elevenlabs_${index}_${condition.key}`, count: 1 };
      }
    }
  }
}
/** A failed task never aborts the remaining batch; cancellation does. */
export async function executeAutomaticTasks(tasks, { run, success, failure, signal }) {
  // A factory lets each lane traverse the plan lazily, without retaining a large batch.
  const source = typeof tasks === 'function' ? tasks : (() => Array.from(tasks))();
  const lane = async provider => {
    const iterable = typeof source === 'function' ? source() : source;
    for (const task of iterable) {
      if (signal.aborted) break;
      if (task.provider !== provider) continue;
      try { const result = await run(task); success(task, result); }
      catch (error) { if (signal.aborted) break; failure(task, error); }
    }
  };
  await Promise.all([lane('gemini'), lane('elevenlabs')]);
}
