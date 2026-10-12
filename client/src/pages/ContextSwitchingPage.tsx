import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Languages, FlaskConical, Radio } from 'lucide-react';
import { extractParagraphsArray } from '../data/contextSwitchingPresets';
import { fetchNextContextIndex } from '../services/contextSwitchingApi';
import { ContextBatchInputCard } from '../components/context_switching/ContextBatchInputCard';
import { ContextBatchProgressBar } from '../components/context_switching/ContextBatchProgressBar';
import { ContextBatchResultsView } from '../components/context_switching/ContextBatchResultsView';
import { ContextLabTab } from '../components/context_switching/ContextLabTab';
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
  const [activeSubTab, setActiveSubTab] = useState<'standard' | 'lab'>('lab');
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
    if (activeSubTab === 'standard') {
      refreshNextIndex(selectedVoice);
    }
  }, [selectedVoice, refreshNextIndex, activeSubTab]);

  const {
    batchState,
    samples,
    masterAudioUrl,
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)', color: '#fff', padding: '0.5rem', borderRadius: '10px' }}>
              <Languages size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Context Switching Studio</h1>
              <p style={{ margin: 0, color: 'var(--text-muted, #94a3b8)', fontSize: '0.875rem' }}>
                Automated 6-in-1 multilingual code-switching batch generator with rapid language transitions.
              </p>
            </div>
          </div>

          {/* Sub-Tabs Selector */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '0.3rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveSubTab('standard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '7px',
                border: 'none',
                background: activeSubTab === 'standard' ? 'var(--btn-primary, #3B82F6)' : 'transparent',
                color: activeSubTab === 'standard' ? '#fff' : '#94a3b8',
                fontWeight: activeSubTab === 'standard' ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Radio size={14} />
              <span>Standard (Single Voice)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('lab')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '7px',
                border: 'none',
                background: activeSubTab === 'lab' ? 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)' : 'transparent',
                color: activeSubTab === 'lab' ? '#fff' : '#94a3b8',
                fontWeight: activeSubTab === 'lab' ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <FlaskConical size={14} />
              <span>Speaker Slicing Lab</span>
              <span
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '4px',
                  fontWeight: 700
                }}
              >
                3 Methods
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab 1: Standard Slicing Studio */}
      {activeSubTab === 'standard' && (
        <div>
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

          <ContextBatchProgressBar
            batchState={batchState}
            onStart={startBatch}
            onTogglePause={togglePause}
            onStop={stopBatch}
            canStart={paragraphs.length > 0 && !batchState.isActive}
          />

          <ContextBatchResultsView
            samples={samples}
            selectedVoice={selectedVoice}
            masterAudioUrl={masterAudioUrl}
          />
        </div>
      )}

      {/* Sub-Tab 2: Speaker Slicing Lab (Multi-Speaker & Audio Markers) */}
      {activeSubTab === 'lab' && (
        <ContextLabTab
          onSampleCreated={onSampleCreated}
          addToast={addToast}
        />
      )}
    </div>
  );
};
