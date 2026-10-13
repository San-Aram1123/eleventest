import { useEffect, useRef, useState } from 'react';
import { Sample } from '../../types';
import {
  executeContextLabBatch, analyzeContextLabMaster, abortContextSwitchingBatchOnServer,
  saveLabClipsToDataset, DetectionEngineType, LabBatchResponse, LabAnalysisOptions
} from '../../services/contextSwitchingApi';
import { fileAsDataUrl, getLabEngineResults, LabMasterSnapshot, LabMasterSource, parseLabOptions } from '../../services/contextLabUtils';

interface UseContextLabRunnerProps {
  paragraphs: string[];
  startIdx: number;
  detectionEngine: DetectionEngineType;
  speaker1Voice: string;
  speaker2Voice: string;
  source: LabMasterSource;
  masterFile: File | null;
  reference1: File | null;
  reference2: File | null;
  options: LabAnalysisOptions;
  expectedBoundaries: string;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export function useContextLabRunner(props: UseContextLabRunnerProps) {
  const [result, setResult] = useState<LabBatchResponse | null>(null);
  const [lastMaster, setLastMaster] = useState<LabMasterSnapshot | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const resultContext = useRef<{ startIdx: number; lineCount: number }>({ startIdx: 1, lineCount: 0 });
  const runSequence = useRef(0);

  useEffect(() => () => { controller.current?.abort(); runSequence.current += 1; }, []);
  useEffect(() => {
    if (!isActive) return;
    const started = Date.now();
    const timer = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [isActive]);

  const startBatch = async () => {
    if (controller.current && !controller.current.signal.aborted) return;
    setResult(null);
    setError(null);
    const master = props.source === 'reuse' ? lastMaster : null;
    const paragraphs = master?.paragraphs || props.paragraphs;
    const speaker1Voice = master?.speaker1Voice || props.speaker1Voice;
    const speaker2Voice = master?.speaker2Voice || props.speaker2Voice;
    let options: LabAnalysisOptions;
    try {
      if (paragraphs.length < 1 || paragraphs.length > 12) throw new Error('Use 1–12 lines per master test.');
      if (speaker1Voice === speaker2Voice && paragraphs.length > 1) throw new Error('Choose two different speaker voices.');
      if (props.source === 'reuse' && !master) throw new Error('Run a test first to create a reusable master.');
      if (props.source === 'upload' && !props.masterFile) throw new Error('Choose a master WAV to analyze.');
      if (Boolean(props.reference1) !== Boolean(props.reference2)) throw new Error('Provide both speaker references, or leave both empty for automatic enrollment.');
      options = parseLabOptions(props.expectedBoundaries, props.options, paragraphs.length);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Invalid test settings.');
      return;
    }
    const runId = ++runSequence.current;
    const abort = new AbortController();
    controller.current = abort;
    setElapsedSeconds(0);
    setIsActive(true);
    resultContext.current = { startIdx: props.startIdx, lineCount: paragraphs.length };
    try {
      let response: LabBatchResponse;
      if (props.source === 'generate') {
        const [reference1Audio, reference2Audio] = await Promise.all([
          fileAsDataUrl(props.reference1), fileAsDataUrl(props.reference2)
        ]);
        if (abort.signal.aborted) throw new DOMException('Stopped', 'AbortError');
        response = await executeContextLabBatch({ paragraphs, startIdx: props.startIdx,
          speaker1Voice, speaker2Voice, detectionEngine: props.detectionEngine, options,
          reference1Audio, reference2Audio, signal: abort.signal });
      } else {
        const masterAudio = master
          ? await fetch(master.audioUrl, { signal: abort.signal }).then(res => {
              if (!res.ok) throw new Error('Could not load the last master audio.');
              return res.blob();
            })
          : props.masterFile!;
        response = await analyzeContextLabMaster({ masterAudio, paragraphs, startIdx: props.startIdx,
          speaker1Voice, speaker2Voice, detectionEngine: props.detectionEngine, options,
          reference1: props.reference1, reference2: props.reference2, signal: abort.signal });
      }
      if (runSequence.current !== runId || abort.signal.aborted) return;
      const audioUrl = response.masterAudioUrl || master?.audioUrl;
      setResult({ ...response, masterAudioUrl: audioUrl, speaker1Voice, speaker2Voice });
      if (audioUrl) setLastMaster({ audioUrl, paragraphs: [...paragraphs], speaker1Voice, speaker2Voice });
      const engines = Object.values(getLabEngineResults(response));
      const accepted = engines.filter(engine => engine.success && engine.clips.length === paragraphs.length).length;
      if (!response.success || accepted === 0) {
        setError(response.error || 'No engine accepted safe boundaries. Review diagnostics and rerun the same master.');
      } else {
        props.addToast({ type: 'success', title: 'Master analysis complete',
          message: `${accepted} method(s) accepted a complete set. Listen and review diagnostics before saving.` });
      }
    } catch (failure) {
      if (runSequence.current !== runId || abort.signal.aborted) return;
      setError(failure instanceof Error ? failure.message : 'Master analysis failed.');
    } finally {
      if (runSequence.current === runId) {
        controller.current = null;
        setIsActive(false);
      }
    }
  };

  const stopBatch = () => {
    controller.current?.abort();
    controller.current = null;
    runSequence.current += 1;
    setIsActive(false);
    setError('Test stopped. No clips were saved.');
    if (props.source === 'generate') void abortContextSwitchingBatchOnServer();
  };

  const handleSaveToDataset = async (engineKey: string) => {
    const engine = result && getLabEngineResults(result)[engineKey];
    if (!result?.success || !engine?.success || engine.clips.length !== resultContext.current.lineCount ||
        engine.clips.some(clip => !clip.audioUrl || clip.end <= clip.start || clip.duration <= 0)) {
      props.addToast({ type: 'error', title: 'Slices cannot be saved', message: 'Only a complete, accepted engine result can be saved.' });
      return;
    }
    setIsSaving(true);
    try {
      const saved = await saveLabClipsToDataset({ clips: engine.clips, startIdx: resultContext.current.startIdx });
      if (!saved.success) throw new Error('The server did not save these clips.');
      saved.samples.forEach(props.onSampleCreated);
      props.addToast({ type: 'success', title: 'Saved to dataset', message: `${saved.count} clips from ${engineKey}.` });
    } catch (failure) {
      props.addToast({ type: 'error', title: 'Save failed', message: failure instanceof Error ? failure.message : 'Unknown save error.' });
    } finally {
      setIsSaving(false);
    }
  };

  return { result, lastMaster, isActive, isSaving, elapsedSeconds, error, startBatch, stopBatch, handleSaveToDataset };
}
