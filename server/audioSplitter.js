import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { ensureWavBuffer } from './wavUtils.js';
import { extractEmotionAndCleanText } from './emotionUtils.js';
import { analyzeMultilingualContent, normalizeMultilingualBidiText } from './geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Splits raw input text into logical paragraphs/chunks.
 * If lines or newlines exist, splits by line.
 * Merges standalone tag lines (e.g. [whisper] on its own line) with following paragraph.
 * If single unbroken paragraph, splits by sentence-ending punctuation (., !, ؟).
 * @param {string} rawText 
 * @returns {string[]} array of clean paragraph strings
 */
export function splitTextIntoParagraphs(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  const trimmed = rawText.trim();
  if (!trimmed) return [];

  // Check if multiple lines are provided
  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 1) {
    const merged = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isPureTag = /^(?:\[|【|［|\()[a-zA-Z0-9_\s\u0600-\u06FF-]+(?:\]|】|］|\))$/i.test(line) ||
                        /^[a-zA-Z\u0600-\u06FF]{2,15}:$/i.test(line);
      if (isPureTag && i + 1 < lines.length) {
        merged.push(`${line} ${lines[i + 1]}`.trim());
        i++; // skip next line as it was merged
      } else {
        merged.push(line);
      }
    }
    return merged;
  }

  // Otherwise, split single continuous block by sentence punctuation
  const sentenceRegex = /([^\.\!\؟\?\n]+[\.\!\؟\?]+)/g;
  const matches = trimmed.match(sentenceRegex);

  if (matches && matches.length > 1) {
    const chunks = [];
    let current = '';

    for (const s of matches) {
      const sTrim = s.trim();
      const wordCount = (current + ' ' + sTrim).trim().split(/\s+/).length;

      // Group sentences to target around 8 to 25 words per chunk (~5 to 15 seconds of speech)
      if (current && wordCount > 25) {
        chunks.push(current.trim());
        current = sTrim;
      } else {
        current = current ? `${current} ${sTrim}` : sTrim;
      }
    }

    if (current.trim()) {
      chunks.push(current.trim());
    }

    if (chunks.length > 1) {
      return chunks;
    }
  }

  return [trimmed];
}

/**
 * Formats a list of paragraphs into a structured prompt directing Gemini
 * to synthesize each section with an explicit 1.5 to 2.0 second silence pause.
 * @param {string[]} paragraphs 
 * @param {string} dialect 
 * @param {string} customInstruction 
 * @returns {{ prompt: string, instruction: string }}
 */
export function formatPromptWithExplicitPauses(paragraphs, dialect = 'sorani', customInstruction = '') {
  const isBadini = dialect === 'badini';
  const dialectName = isBadini ? 'Kurdish Badini (Kurmanji)' : 'Central Kurdish (Sorani)';

  // Analyze multilingual makeup across all paragraphs combined
  const combinedRaw = (paragraphs || []).join(' ');
  const langAnalysis = analyzeMultilingualContent(combinedRaw);

  let instruction = '';
  if (customInstruction?.trim()) {
    instruction = customInstruction.trim();
  } else {
    const dialectRule = isBadini
      ? 'Kurdish Badini: Authentic Duhok/Badinan pronunciation and vowels (ڤ, خ، ح، غ، ۆ، ێ، ە), never Sorani intonation.'
      : 'Kurdish Sorani: Authentic Central Erbil/Sulaymaniyah pronunciation and vowels (ۆ، ێ، ە).';

    const multiRule = (langAnalysis.hasLatin || langAnalysis.isMultilingual)
      ? '\n- English & Arabic: Natural native pronunciation with seamless code-switching transitions; never omit opening words.'
      : '';

    // Extract unique emotion cues in text
    const allTags = [];
    paragraphs.forEach(p => {
      const parsed = extractEmotionAndCleanText(p);
      parsed.detectedTags.forEach(t => allTags.push(t.toLowerCase()));
    });
    const uniqueTags = [...new Set(allTags)];
    const emotionRule = uniqueTags.length > 0
      ? `\n- Emotions: Act out bracketed feelings (${uniqueTags.map(t => `[${t}]`).join(', ')}) naturally without speaking bracket words.`
      : '';

    instruction = `You are a professional voice narrator and speech synthesizer. Read and speak aloud the provided text completely and naturally:
- ${dialectRule}${multiRule}${emotionRule}
- Pacing & Cadence: Speak at a steady, calm, unhurried pace. Deliver every sentence fully and deliberately with natural breathing. Do NOT rush or speak quickly.
- Transitions: At each ellipsis (... ...), pause in complete silence for 1.5 seconds between paragraphs without vocalizing.`;
  }

  let formattedBody = '';
  paragraphs.forEach((p, idx) => {
    const cleanP = normalizeMultilingualBidiText(p.trim());
    formattedBody += (idx > 0 ? `\n\n... ...\n\n` : '') + cleanP;
  });

  return {
    prompt: formattedBody.trim(),
    instruction: instruction.trim()
  };
}

/**
 * Runs FFmpeg silencedetect on a WAV file to find all silent intervals.
 * @param {string} wavFilePath 
 * @param {number} noiseDb - default -30dB
 * @param {number} minDuration - minimum silence duration in seconds (default 0.4s)
 * @returns {Promise<Array<{ start: number, end: number, duration: number, midpoint: number }>>}
 */
export function detectSilences(wavFilePath, noiseDb = -30, minDuration = 0.4) {
  return new Promise((resolve, reject) => {
    const args = [
      '-i', wavFilePath,
      '-af', `silencedetect=noise=${noiseDb}dB:d=${minDuration}`,
      '-f', 'null',
      '-'
    ];

    const proc = spawn('ffmpeg', args);
    let stderr = '';

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      // FFmpeg returns 0 on successful inspection
      const silences = [];
      const startRegex = /silence_start:\s*([\d\.]+)/g;
      const endRegex = /silence_end:\s*([\d\.]+)\s*\|\s*silence_duration:\s*([\d\.]+)/g;

      const starts = [];
      let startMatch;
      while ((startMatch = startRegex.exec(stderr)) !== null) {
        starts.push(parseFloat(startMatch[1]));
      }

      let endMatch;
      let i = 0;
      while ((endMatch = endRegex.exec(stderr)) !== null) {
        const end = parseFloat(endMatch[1]);
        const dur = parseFloat(endMatch[2]);
        const start = starts[i] !== undefined ? starts[i] : Math.max(0, end - dur);
        silences.push({
          start,
          end,
          duration: dur,
          midpoint: (start + end) / 2
        });
        i++;
      }

      resolve(silences);
    });

    proc.on('error', (err) => {
      reject(new Error(`Failed to execute FFmpeg for silence detection: ${err.message}`));
    });
  });
}

/**
 * Calculates optimal chunk cutpoints based on detected silences and text lengths.
 * Uses cumulative character weights to find the closest silence gap to each expected section boundary.
 * @param {Array<{ start: number, end: number, duration: number, midpoint: number }>} silences 
 * @param {string[]} paragraphs 
 * @param {number} totalDuration 
 * @returns {Array<{ chunkIndex: number, text: string, startTime: number, endTime: number, duration: number }>}
 */
export function calculateOptimalSplitWindows(silences, paragraphs, totalDuration) {
  const N = paragraphs.length;
  if (N <= 1) {
    return [{
      chunkIndex: 0,
      text: paragraphs[0] || '',
      startTime: 0,
      endTime: totalDuration,
      duration: totalDuration
    }];
  }

  // Calculate cumulative character ratios
  const charCounts = paragraphs.map(p => Math.max(1, p.replace(/\s+/g, '').length));
  const totalChars = charCounts.reduce((a, b) => a + b, 0);

  // Target timestamps for N-1 boundaries
  const targetTimes = [];
  let accumChars = 0;
  for (let i = 0; i < N - 1; i++) {
    accumChars += charCounts[i];
    targetTimes.push((accumChars / totalChars) * totalDuration);
  }

  // Candidate silences sorted by duration descending (favor longer pauses >= 0.6s)
  const sortedSilences = [...silences].sort((a, b) => b.duration - a.duration);

  // For each boundary, find the silence closest to target time
  // that maintains strict chronological order
  const chosenCuts = [];
  let lastCutTime = 0.5; // at least 0.5s into audio

  for (let b = 0; b < targetTimes.length; b++) {
    const target = targetTimes[b];
    const minAllowedTime = lastCutTime + 1.0; // at least 1s after previous cut
    const maxAllowedTime = totalDuration - (targetTimes.length - b) * 1.5;

    // Filter silences within a reasonable window around target
    const candidates = silences.filter(s => 
      s.midpoint > minAllowedTime && 
      s.midpoint < Math.max(minAllowedTime + 1.0, maxAllowedTime)
    );

    if (candidates.length > 0) {
      // Pick the silence with the best balance of closeness to target and duration
      // Score = closeness * 0.7 - (duration * 2.0)
      candidates.sort((s1, s2) => {
        const dist1 = Math.abs(s1.midpoint - target);
        const dist2 = Math.abs(s2.midpoint - target);
        const score1 = dist1 - (s1.duration * 1.5);
        const score2 = dist2 - (s2.duration * 1.5);
        return score1 - score2;
      });

      const picked = candidates[0];
      chosenCuts.push({
        time: picked.midpoint,
        silenceStart: picked.start,
        silenceEnd: picked.end,
        silenceDuration: picked.duration
      });
      lastCutTime = picked.midpoint;
    } else {
      // Fallback: use target time directly if no silence found in window
      const fallbackTime = Math.min(totalDuration - 1.0, Math.max(minAllowedTime, target));
      chosenCuts.push({
        time: fallbackTime,
        silenceStart: fallbackTime - 0.2,
        silenceEnd: fallbackTime + 0.2,
        silenceDuration: 0.4
      });
      lastCutTime = fallbackTime;
    }
  }

  // Construct chunk windows with clean 0.1s speech padding
  const chunks = [];
  for (let i = 0; i < N; i++) {
    const isFirst = i === 0;
    const isLast = i === N - 1;

    let startTime = 0;
    if (!isFirst) {
      const prevBoundary = chosenCuts[i - 1];
      // Start slightly before silence ends to avoid chopping the first syllable
      startTime = Math.max(0, prevBoundary.silenceEnd - 0.1);
    }

    let endTime = totalDuration;
    if (!isLast) {
      const nextBoundary = chosenCuts[i];
      // End slightly after silence starts to preserve sentence decay
      endTime = Math.min(totalDuration, nextBoundary.silenceStart + 0.1);
    }

    // Safety check: ensure positive duration
    if (endTime <= startTime) {
      endTime = startTime + 1.0;
    }

    chunks.push({
      chunkIndex: i,
      text: paragraphs[i],
      startTime: parseFloat(startTime.toFixed(3)),
      endTime: parseFloat(endTime.toFixed(3)),
      duration: parseFloat((endTime - startTime).toFixed(3))
    });
  }

  return chunks;
}

/**
 * Slices a WAV file into multiple chunk WAV buffers using FFmpeg.
 * @param {string} masterWavPath 
 * @param {Array<{ chunkIndex: number, text: string, startTime: number, endTime: number, duration: number }>} windows 
 * @returns {Promise<Array<{ chunkIndex: number, text: string, startTime: number, endTime: number, duration: number, audioBuffer: Buffer }>>}
 */
export async function sliceWavFileToBuffers(masterWavPath, windows) {
  const results = [];

  for (const win of windows) {
    const tempOut = path.resolve(os.tmpdir(), `chunk_${Date.now()}_${win.chunkIndex}.wav`);

    await new Promise((resolve, reject) => {
      const args = [
        '-y',
        '-ss', win.startTime.toFixed(3),
        '-t', win.duration.toFixed(3),
        '-i', masterWavPath,
        '-c:a', 'pcm_s16le',
        tempOut
      ];

      const proc = spawn('ffmpeg', args);
      let errStr = '';
      proc.stderr.on('data', (d) => { errStr += d.toString(); });
      proc.on('close', (code) => {
        if (code !== 0) return reject(new Error(`FFmpeg slicing failed: ${errStr}`));
        resolve();
      });
      proc.on('error', reject);
    });

    const chunkBuffer = fs.readFileSync(tempOut);
    try { fs.unlinkSync(tempOut); } catch (_) {}

    results.push({
      ...win,
      audioBuffer: ensureWavBuffer(chunkBuffer, 24000)
    });
  }

  return results;
}
