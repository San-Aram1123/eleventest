import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Languages } from 'lucide-react';
import { extractParagraphsArray } from '../data/contextSwitchingPresets';
import { fetchNextContextIndex } from '../services/contextSwitchingApi';
import { ContextBatchInputCard } from '../components/context_switching/ContextBatchInputCard';
import { ContextBatchProgressBar } from '../components/context_switching/ContextBatchProgressBar';
import { ContextBatchResultsView } from '../components/context_switching/ContextBatchResultsView';
import { useContextBatchRunner } from '../components/context_switching/useContextBatchRunner';
import { Sample } from '../types';

interface ContextSwitchingPageProps {
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const ContextSwitchingPage: React.FC<ContextSwitchingPageProps> = ({ 
  onSampleCreated,
  addToast 
}) => {
  const [text, setText] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string>('Puck');
  const [startIdx, setStartIdx] = useState<number>(1);
  const [isRefreshingIdx, setIsRefreshingIdx] = useState<boolean>(false);

  const paragraphs = useMemo(() => extractParagraphsArray(text), [text]);

  const refreshNextIndex = useCallback(async (voice?: string) => {
    setIsRefreshingIdx(true);
    try {
      const nextIdx = await fetchNextContextIndex(voice || selectedVoice);
      setStartIdx(nextIdx);
    } catch (_) {
    } finally {
      setIsRefreshingIdx(false);
    }
  }, [selectedVoice]);

  useEffect(() => {
    refreshNextIndex(selectedVoice);
  }, [selectedVoice, refreshNextIndex]);

  const {
    batchState,
    samples,
    startBatch,
    togglePause,
    stopBatch
  } = useContextBatchRunner({
    paragraphs,
    voiceName: selectedVoice,
    startIdx,
    onSampleCreated,
    addToast
  });

  return (
    <div className="page-container" style={{ maxWidth: '1080px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)', color: '#fff', padding: '0.5rem', borderRadius: '10px' }}>
            <Languages size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Context Switching Studio</h1>
            <p style={{ margin: 0, color: 'var(--text-muted, #94a3b8)', fontSize: '0.875rem' }}>
              Automated 6-in-1 acoustic slicing batch generator. Supports 5,000+ lines via paste or .txt upload with zero inter-language pauses and auto-indexing.
            </p>
          </div>
        </div>
      </div>

      {/* Input & Setup Card */}
      <ContextBatchInputCard
        text={text}
        onChangeText={setText}
        selectedVoice={selectedVoice}
        onChangeVoice={setSelectedVoice}
        startIdx={startIdx}
        onChangeStartIdx={setStartIdx}
        onRefreshStartIdx={() => refreshNextIndex(selectedVoice)}
        isRefreshingIdx={isRefreshingIdx}
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

      {/* Results View with Pagination */}
      <ContextBatchResultsView
        samples={samples}
        selectedVoice={selectedVoice}
      />
    </div>
  );
};
