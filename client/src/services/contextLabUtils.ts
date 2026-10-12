import { LabAnalysisOptions, LabBatchResponse, LabEngineResult } from './contextSwitchingApi';

export type LabMasterSource = 'generate' | 'upload' | 'reuse';

export interface LabMasterSnapshot {
  audioUrl: string;
  paragraphs: string[];
  speaker1Voice: string;
  speaker2Voice: string;
}

export function getLabEngineResults(result: LabBatchResponse): Record<string, LabEngineResult> {
  if (result.engineResults) return result.engineResults;
  const legacy = {
    pyannote: result.pyannoteClips, pitch_f0: result.pitchClips,
    neural_crossover: result.crossoverClips, tri_hybrid: result.triHybridClips,
    iterative_dp: result.iterativeClips
  };
  const entries: Array<[string, LabEngineResult]> = Object.entries(legacy)
    .filter(([, clips]) => Boolean(clips?.length))
    .map(([id, clips]) => [id, { success: result.success, clips: clips || [] }]);
  if (result.clips?.length && result.mode !== 'all' && !entries.some(([id]) => id === result.mode)) {
    entries.push([result.mode, { success: result.success, clips: result.clips }]);
  }
  return Object.fromEntries(entries);
}

export function parseLabOptions(boundaries: string, options: LabAnalysisOptions, lineCount: number): LabAnalysisOptions {
  const min = options.minSegmentSeconds;
  const max = options.maxSegmentSeconds;
  const threshold = options.confidenceThreshold;
  if (min !== undefined && (!Number.isFinite(min) || min < .4 || min > 60)) throw new Error('Minimum segment duration must be 0.4–60 seconds.');
  if (max !== undefined && (!Number.isFinite(max) || max < Math.max(.4, min || 0) || max > 600)) throw new Error('Maximum segment duration must be at least the minimum and no greater than 600 seconds.');
  if (threshold !== undefined && (!Number.isFinite(threshold) || threshold < .5 || threshold > 1)) {
    throw new Error('Confidence threshold must be between 0.5 and 1.0.');
  }
  if (!boundaries.trim()) return options;
  const expectedBoundaries = boundaries.trim().split(/[\s,;]+/).map(Number);
  if (expectedBoundaries.length !== lineCount - 1 || expectedBoundaries.some((value, index) =>
    !Number.isFinite(value) || value <= 0 || (index > 0 && value <= expectedBoundaries[index - 1]))) {
    throw new Error(`Enter ${lineCount - 1} strictly increasing boundary times in seconds, or leave the field empty.`);
  }
  return { ...options, expectedBoundaries };
}

export function fileAsDataUrl(file: File | null): Promise<string | undefined> {
  if (!file) return Promise.resolve(undefined);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export function downloadLabDiagnostics(result: LabBatchResponse): void {
  const clean = JSON.parse(JSON.stringify(result, (key, value) =>
    key === 'audioUrl' || key === 'masterAudioUrl' ? undefined : value));
  const url = URL.createObjectURL(new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'context-slicing-diagnostics.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
