import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { extractParagraphsArray } from '../../data/contextSwitchingPresets';
import { DetectionEngineType, fetchNextContextIndex, LabAnalysisOptions } from '../../services/contextSwitchingApi';
import { LabMasterSource } from '../../services/contextLabUtils';
import { ContextLabConfigCard } from './ContextLabConfigCard';
import { ContextLabSourceCard } from './ContextLabSourceCard';
import { ContextLabInputCard } from './ContextLabInputCard';
import { ContextLabRunControls } from './ContextLabRunControls';
import { ContextLabResultsView } from './ContextLabResultsView';
import { useContextLabRunner } from './useContextLabRunner';
import { Sample } from '../../types';

interface ContextLabTabProps {
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const ContextLabTab: React.FC<ContextLabTabProps> = ({ onSampleCreated, addToast }) => {
  const [text, setText] = useState('');
  const [detectionEngine, setDetectionEngine] = useState<DetectionEngineType>('all');
  const [speaker1Voice, setSpeaker1Voice] = useState('Puck');
  const [speaker2Voice, setSpeaker2Voice] = useState('Aoede');
  const [startIdx, setStartIdx] = useState(1);
  const [isRefreshingIdx, setIsRefreshingIdx] = useState(false);
  const [source, setSource] = useState<LabMasterSource>('upload');
  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [reference1, setReference1] = useState<File | null>(null);
  const [reference2, setReference2] = useState<File | null>(null);
  const [options, setOptions] = useState<LabAnalysisOptions>({ confidenceThreshold: .6 });
  const [expectedBoundaries, setExpectedBoundaries] = useState('');
  const paragraphs = useMemo(() => extractParagraphsArray(text), [text]);
  const refreshNextIndex = useCallback(async () => {
    setIsRefreshingIdx(true);
    try { setStartIdx(await fetchNextContextIndex('lab')); }
    finally { setIsRefreshingIdx(false); }
  }, []);
  useEffect(() => { void refreshNextIndex(); }, [refreshNextIndex]);

  const runner = useContextLabRunner({ paragraphs, startIdx, detectionEngine, speaker1Voice, speaker2Voice,
    source, masterFile, reference1, reference2, options, expectedBoundaries, onSampleCreated, addToast });
  const changeSource = (next: LabMasterSource) => {
    if (next === 'reuse' && runner.lastMaster) {
      setText(runner.lastMaster.paragraphs.join('\n\n'));
      setSpeaker1Voice(runner.lastMaster.speaker1Voice);
      setSpeaker2Voice(runner.lastMaster.speaker2Voice);
    }
    setSource(next);
  };
  const canStart = !runner.isActive && !runner.isSaving && paragraphs.length >= 2 && paragraphs.length <= 12 &&
    (source === 'generate' || (source === 'upload' && Boolean(masterFile)) || (source === 'reuse' && Boolean(runner.lastMaster)));

  return (
    <div>
      <ContextLabSourceCard source={source} onChangeSource={changeSource} masterFile={masterFile} onChangeMaster={setMasterFile}
        reference1={reference1} reference2={reference2} onChangeReference1={setReference1} onChangeReference2={setReference2}
        hasReusableMaster={Boolean(runner.lastMaster)} options={options} onChangeOptions={setOptions}
        expectedBoundaries={expectedBoundaries} onChangeExpectedBoundaries={setExpectedBoundaries} isActive={runner.isActive} />
      <ContextLabConfigCard detectionEngine={detectionEngine} onChangeDetectionEngine={setDetectionEngine}
        speaker1Voice={speaker1Voice} onChangeSpeaker1={setSpeaker1Voice} speaker2Voice={speaker2Voice} onChangeSpeaker2={setSpeaker2Voice}
        startIdx={startIdx} onChangeStartIdx={setStartIdx} onRefreshStartIdx={() => void refreshNextIndex()}
        isRefreshingIdx={isRefreshingIdx} isBatchActive={runner.isActive} voicesReadOnly={source === 'reuse'} />
      {source === 'reuse' && <p style={{ color: '#93c5fd', fontSize: '.8rem' }}>The saved master keeps its original script and speaker labels. Change the analysis method or settings, then choose Analyze master.</p>}
      <ContextLabInputCard text={text} onChangeText={setText} speaker1Voice={speaker1Voice} speaker2Voice={speaker2Voice}
        paragraphCount={paragraphs.length} isBatchActive={runner.isActive || source === 'reuse'} />
      {paragraphs.length > 12 && <p role="alert" style={{ color: '#fbbf24', fontSize: '.8rem' }}>Use at most 12 lines for one lab master. This keeps comparisons tied to the same audio.</p>}
      <ContextLabRunControls source={source} isActive={runner.isActive} canStart={canStart} elapsedSeconds={runner.elapsedSeconds}
        error={runner.error} onStart={() => void runner.startBatch()} onStop={runner.stopBatch} />
      <ContextLabResultsView result={runner.result} isSaving={runner.isSaving} isActive={runner.isActive}
        onSaveToDataset={key => void runner.handleSaveToDataset(key)} onReuseMaster={() => changeSource('reuse')} />
    </div>
  );
};
