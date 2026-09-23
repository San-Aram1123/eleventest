import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateGeminiSpeech } from './geminiService.js';
import { saveSample } from './datasetService.js';
import { REQUIRED_EMOTIONS } from './pairedEmotionConfig.js';
import { buildFamilyId, buildClipId } from './pairedBatchService.js';

const EMO_DESCS = {
  neutral: 'Natural, balanced conversational tone.',
  happy: 'Bright, warm, cheerful, smiling tone.',
  laugh: 'Fully voiced, cheerful, smiling tone with audible laughter (must be fully voiced, NOT whispered).',
  sad: 'Subdued, sorrowful, emotionally heavy tone.',
  angry: 'Sharp, forceful, irritated tone.',
  whisper: 'Soft, quiet, breathy whisper tone.'
};

export const orderEmotionsForSlicing = (emotions) => [
  ...emotions.filter(e => (e.emotion || e.id || e).toLowerCase() !== 'whisper'),
  ...emotions.filter(e => (e.emotion || e.id || e).toLowerCase() === 'whisper')
];

export function buildPairedSlicingPrompt(sentence, targetEmotions, language = 'ckb') {
  const isBadini = language === 'kmr';
  const dialectRule = isBadini
    ? 'Kurdish Badini (Kurmanji): Authentic Duhok/Badinan pronunciation and vowels (ڤ, خ، ح، غ، ۆ، ێ، ە).'
    : language === 'ar' ? 'Arabic: Clear Modern Standard Arabic pronunciation.'
    : language === 'en' ? 'English: Fluent natural native pronunciation.'
    : 'Central Kurdish (Sorani): Authentic Erbil/Sulaymaniyah pronunciation and vowels (ۆ، ێ، ە).';

  const emotionDirectives = targetEmotions.map((e, idx) => {
    const emo = (e.emotion || e).toLowerCase();
    return `  * Take ${idx + 1} [${emo}]: ${EMO_DESCS[emo] || `Expressive ${emo} tone.`}`;
  }).join('\n');

  const instruction = `You are a professional voice narrator and speech synthesizer. Read and speak aloud the provided text completely and naturally:
- Language & Pronunciation: ${dialectRule}
- Pacing & Cadence: Speak at a steady, calm, unhurried pace. Deliver every sentence fully and deliberately with natural breathing. Do NOT rush or speak quickly.
- Emotion Directives (Deliver each take distinctly; do NOT speak emotion tag labels aloud):
${emotionDirectives}
- Transitions: Pause in complete, dead silence for at least 1.5 seconds between each take. Do NOT vocalize any labels or take numbers.`;

  let promptBody = '';
  targetEmotions.forEach((e, idx) => {
    const emo = (e.emotion || e).toLowerCase();
    promptBody += (idx > 0 ? '\n\n... ...\n\n' : '') + `[${emo}] ${sentence.trim()}`;
  });

  return { prompt: promptBody.trim(), instruction: instruction.trim() };
}

function runSilenceDetect(wavPath, noiseDb, minDur) {
  return new Promise((resolve) => {
    const proc = spawn('ffmpeg', ['-i', wavPath, '-af', `silencedetect=noise=${noiseDb}dB:d=${minDur}`, '-f', 'null', '-']);
    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', () => {
      const silences = [], starts = [];
      let m;
      const startRegex = /silence_start:\s*([\d\.]+)/g;
      const endRegex = /silence_end:\s*([\d\.]+)\s*\|\s*silence_duration:\s*([\d\.]+)/g;
      while ((m = startRegex.exec(stderr)) !== null) starts.push(parseFloat(m[1]));
      let i = 0;
      while ((m = endRegex.exec(stderr)) !== null) {
        const end = parseFloat(m[1]), dur = parseFloat(m[2]);
        const start = starts[i] !== undefined ? starts[i] : Math.max(0, end - dur);
        silences.push({ start, end, duration: dur, midpoint: (start + end) / 2 });
        i++;
      }
      resolve(silences);
    });
    proc.on('error', () => resolve([]));
  });
}

export async function detectSilencesMultiPass(wavPath, expectedPauses, totalDuration = 0) {
  const getInternal = (arr) => arr.filter(s => s.midpoint >= 1.0 && (!totalDuration || s.midpoint <= totalDuration - 1.0));
  const passes = [[-34, 0.45], [-30, 0.38], [-28, 0.32], [-26, 0.28]];
  for (const [db, dur] of passes) {
    const s = await runSilenceDetect(wavPath, db, dur);
    if (getInternal(s).length >= expectedPauses) return s;
  }
  return [];
}

export function calculatePairedSplitWindows(silences, count, totalDuration) {
  if (count <= 1) return [{ chunkIndex: 0, startTime: 0, endTime: totalDuration, duration: totalDuration }];
  const requiredCuts = count - 1;
  const candidates = (silences || []).filter(s => s.midpoint >= 1.0 && s.midpoint <= totalDuration - 1.0);
  candidates.sort((a, b) => a.midpoint - b.midpoint);

  if (candidates.length < requiredCuts) {
    console.warn(`[Paired Slicing] Insufficient internal pauses: ${candidates.length} found, ${requiredCuts} required.`);
    return null;
  }

  const targetChunkLen = totalDuration / count;
  const minSafeLen = Math.max(1.5, targetChunkLen * 0.45);
  const maxSafeLen = targetChunkLen * 1.85;

  if (candidates.length === requiredCuts) {
    return buildWindowsFromCuts(candidates, count, totalDuration, minSafeLen, maxSafeLen);
  }

  let bestCombination = null, bestScore = -Infinity;

  function evaluate(chosen) {
    let score = 0;
    for (let i = 0; i < chosen.length; i++) {
      const cut = chosen[i];
      const prevCut = i > 0 ? chosen[i - 1] : null;
      const prevPad = prevCut ? Math.min(0.08, prevCut.duration * 0.25) : 0;
      const nextPad = Math.min(0.08, cut.duration * 0.25);
      const winStart = (i === 0) ? 0 : Math.max(0, prevCut.end - prevPad);
      const winEnd = Math.min(totalDuration, cut.start + nextPad);
      const winDur = winEnd - winStart;
      if (winDur < minSafeLen || winDur > maxSafeLen) return -Infinity;
      score += Math.min(1.5, cut.duration) * 4.0 - (Math.abs(winDur - targetChunkLen) / targetChunkLen * 1.5);
    }
    const lastCut = chosen[chosen.length - 1];
    const lastPad = Math.min(0.08, lastCut.duration * 0.25);
    const lastWinStart = Math.max(0, lastCut.end - lastPad);
    const lastWinDur = totalDuration - lastWinStart;
    if (lastWinDur < minSafeLen || lastWinDur > maxSafeLen) return -Infinity;
    return score - (Math.abs(lastWinDur - targetChunkLen) / targetChunkLen * 1.5);
  }

  function findBest(startIdx, chosen) {
    if (chosen.length === requiredCuts) {
      const score = evaluate(chosen);
      if (score > bestScore) { bestScore = score; bestCombination = [...chosen]; }
      return;
    }
    for (let i = startIdx; i <= candidates.length - (requiredCuts - chosen.length); i++) {
      const c = candidates[i];
      if (chosen.length > 0 && c.midpoint - chosen[chosen.length - 1].midpoint < minSafeLen) continue;
      chosen.push(c);
      findBest(i + 1, chosen);
      chosen.pop();
    }
  }

  findBest(0, []);
  return bestCombination ? buildWindowsFromCuts(bestCombination, count, totalDuration, minSafeLen, maxSafeLen) : null;
}

function buildWindowsFromCuts(cuts, count, totalDuration, minSafeLen = 1.5, maxSafeLen = 60) {
  const windows = [];
  for (let i = 0; i < count; i++) {
    const prevCut = i > 0 ? cuts[i - 1] : null;
    const nextCut = i < count - 1 ? cuts[i] : null;
    const prevPad = prevCut ? Math.min(0.08, prevCut.duration * 0.25) : 0;
    const nextPad = nextCut ? Math.min(0.08, nextCut.duration * 0.25) : 0;
    const startTime = i === 0 ? 0 : Math.max(0, prevCut.end - prevPad);
    const endTime = i === count - 1 ? totalDuration : Math.min(totalDuration, nextCut.start + nextPad);
    const duration = Math.max(0, endTime - startTime);
    if (duration < minSafeLen || duration > maxSafeLen) return null;
    windows.push({ chunkIndex: i, startTime, endTime, duration });
  }
  return windows;
}

export async function slicePairedBuffers(masterWavPath, windows) {
  const buffers = [];
  for (const win of windows) {
    const outTmp = path.resolve(os.tmpdir(), `slice_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`);
    await new Promise((resolve) => {
      const proc = spawn('ffmpeg', ['-y', '-i', masterWavPath, '-ss', String(win.startTime), '-to', String(win.endTime), '-c:a', 'pcm_s16le', outTmp]);
      proc.on('close', () => resolve());
      proc.on('error', () => resolve());
    });
    if (fs.existsSync(outTmp)) {
      buffers.push(fs.readFileSync(outTmp));
      try { fs.unlinkSync(outTmp); } catch (_) {}
    } else {
      buffers.push(Buffer.alloc(0));
    }
  }
  return buffers;
}

export async function generatePairedFamilySliced({
  speakerId = 'spk01', voiceName = 'Puck', dialect = 'sorani', language = 'ckb',
  sentence = '', sentenceIndex = 1, familyId = null, emotions = [],
  model = 'gemini-3.1-flash-tts-preview', apiKey = ''
}) {
  const fId = familyId || buildFamilyId(speakerId, sentenceIndex);
  const rawEmotions = (emotions && emotions.length > 0)
    ? emotions.map(e => typeof e === 'string' ? { emotion: e, intensity: 0.8 } : e)
    : REQUIRED_EMOTIONS.map(e => ({ emotion: e.id, intensity: e.defaultIntensity }));
  const targetEmotions = orderEmotionsForSlicing(rawEmotions);

  let tempMaster = null, fallbackReason = '';

  try {
    const { prompt, instruction } = buildPairedSlicingPrompt(sentence, targetEmotions, language);
    console.log(`[Paired Slicing] Attempting 6-in-1 generation for family ${fId} (${targetEmotions.length} emotions)...`);
    const genResult = await generateGeminiSpeech({
      text: prompt, voiceName, dialect: language === 'kmr' ? 'badini' : 'sorani',
      promptInstruction: instruction, apiKey, model
    });

    const minExpectedDuration = Math.max(targetEmotions.length * 1.5, (sentence.trim().length * 0.05) * targetEmotions.length);
    if (!genResult.durationSeconds || genResult.durationSeconds < minExpectedDuration) {
      fallbackReason = `Master audio only ${genResult.durationSeconds?.toFixed(2)}s (expected >= ${minExpectedDuration.toFixed(1)}s); Gemini dropped takes`;
    } else {
      tempMaster = path.resolve(os.tmpdir(), `paired_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`);
      fs.writeFileSync(tempMaster, genResult.audioBuffer);

      const silences = await detectSilencesMultiPass(tempMaster, targetEmotions.length - 1, genResult.durationSeconds);
      const windows = calculatePairedSplitWindows(silences, targetEmotions.length, genResult.durationSeconds);

      if (!windows || windows.length !== targetEmotions.length) {
        fallbackReason = `Silence boundaries could not be safely resolved (${silences?.length || 0} pauses found, ${targetEmotions.length - 1} required)`;
      } else {
        const slicedBuffers = await slicePairedBuffers(tempMaster, windows);
        const allValid = slicedBuffers.length === targetEmotions.length && slicedBuffers.every(b => b && b.length > 8000);
        if (!allValid) {
          fallbackReason = 'Sliced buffer validation failed (buffers too small)';
        } else {
          const savedSamples = [];
          for (let i = 0; i < targetEmotions.length; i++) {
            const emo = targetEmotions[i];
            const clipId = buildClipId(fId, emo.emotion);
            const intensity = Math.max(0.0, Math.min(1.0, parseFloat(emo.intensity) || 0.8));
            const sample = await saveSample({
              id: clipId, family_id: fId, emotion_intensity: intensity, speaker_name: speakerId,
              text: sentence.trim(), dialect: language === 'kmr' ? 'badini' : 'sorani', language,
              emotion: emo.emotion.toLowerCase(), emotionTag: `[${emo.emotion.toLowerCase()}]`,
              method: 'gemini_api', voiceId: `gemini_${voiceName}`, voiceName: `Gemini (${voiceName})`,
              modelId: genResult.modelId || model, characters: [], audioBuffer: slicedBuffers[i],
              allowDuplicateText: true,
              customMetadata: {
                family_id: fId, speaker_name: speakerId, emotion_intensity: intensity,
                duration_seconds: windows[i]?.duration || 0, language,
                generator: `Gemini Sliced (${genResult.modelId || model}) - Paired Emotion Mode`, audio_filename: `${clipId}.wav`
              }
            });
            savedSamples.push(sample);
          }
          return { success: true, familyId: fId, samples: savedSamples, usedFallback: false, quotaSavings: '83%' };
        }
      }
    }
  } catch (err) {
    fallbackReason = `Slicing pass error: ${err.message}`;
  } finally {
    if (tempMaster && fs.existsSync(tempMaster)) {
      try { fs.unlinkSync(tempMaster); } catch (_) {}
    }
  }

  // Slicing failed safety checks or Gemini dropped takes — strictly abort and NEVER fallback to 1:1
  const errMessage = fallbackReason || 'Unknown slicing boundary resolution failure';
  console.error(`[Paired Slicing] Slicing failed for ${fId}: ${errMessage}. Aborting to protect quota per policy.`);
  throw new Error(`[Paired Slicing] Slicing aborted: ${errMessage}`);
}
