import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { extractParagraphsArray } from '../../data/contextSwitchingPresets';
import { fetchNextContextIndex, DetectionEngineType } from '../../services/contextSwitchingApi';
import { ContextLabConfigCard } from './ContextLabConfigCard';
import { ContextLabInputCard } from './ContextLabInputCard';
import { ContextBatchProgressBar } from './ContextBatchProgressBar';
import { ContextLabResultsView } from './ContextLabResultsView';
import { useContextLabRunner } from './useContextLabRunner';
import { Sample } from '../../types';

interface ContextLabTabProps {
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const ContextLabTab: React.FC<ContextLabTabProps> = ({
  onSampleCreated,
  addToast
}) => {
  const [text, setText] = useState<string>('');
  const [detectionEngine, setDetectionEngine] = useState<DetectionEngineType>('all');
  const [speaker1Voice, setSpeaker1Voice] = useState<string>('Puck');
  const [speaker2Voice, setSpeaker2Voice] = useState<string>('Aoede');
  const [startIdx, setStartIdx] = useState<number>(1);
  const [isRefreshingIdx, setIsRefreshingIdx] = useState<boolean>(false);

  const paragraphs = useMemo(() => extractParagraphsArray(text), [text]);

  const refreshNextIndex = useCallback(async () => {
    setIsRefreshingIdx(true);
    try {
      const nextIdx = await fetchNextContextIndex('lab');
      setStartIdx(nextIdx);
    } catch (_) {
    } finally {
      setIsRefreshingIdx(false);
    }
  }, []);

  useEffect(() => {
    refreshNextIndex();
  }, [refreshNextIndex]);

  const {
    batchState,
    pyannoteClips,
    triHybridClips,
    singleClips,
    comparisonTable,
    masterAudioUrl,
    isSaving,
    handleSaveToDataset,
    startBatch,
    togglePause,
    stopBatch
  } = useContextLabRunner({
    paragraphs,
    startIdx,
    detectionEngine,
    speaker1Voice,
    speaker2Voice,
    onSampleCreated,
    addToast
  });

  return (
    <div>
      {/* Engine Controls & Configuration */}
      <ContextLabConfigCard
        detectionEngine={detectionEngine}
        onChangeDetectionEngine={setDetectionEngine}
        speaker1Voice={speaker1Voice}
        onChangeSpeaker1={setSpeaker1Voice}
        speaker2Voice={speaker2Voice}
        onChangeSpeaker2={setSpeaker2Voice}
        startIdx={startIdx}
        onChangeStartIdx={setStartIdx}
        onRefreshStartIdx={refreshNextIndex}
        isRefreshingIdx={isRefreshingIdx}
        isBatchActive={batchState.isActive}
      />

      {/* Input Card */}
      <ContextLabInputCard
        text={text}
        onChangeText={setText}
        speaker1Voice={speaker1Voice}
        speaker2Voice={speaker2Voice}
        paragraphCount={paragraphs.length}
        isBatchActive={batchState.isActive}
      />

      {/* Progress & Control Bar */}
      <ContextBatchProgressBar
        batchState={batchState}
        onStart={startBatch}
        onTogglePause={togglePause}
        onStop={stopBatch}
        canStart={paragraphs.length > 0 && !batchState.isActive}
      />

      {/* Results View */}
      <ContextLabResultsView
        detectionEngine={detectionEngine}
        masterAudioUrl={masterAudioUrl}
        speaker1Voice={speaker1Voice}
        speaker2Voice={speaker2Voice}
        pyannoteClips={pyannoteClips}
        triHybridClips={triHybridClips}
        singleClips={singleClips}
        comparisonTable={comparisonTable}
        isSaving={isSaving}
        onSaveToDataset={handleSaveToDataset}
      />
    </div>
  );
};
