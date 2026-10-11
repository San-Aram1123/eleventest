import React, { useState, useEffect } from 'react';
import { Globe2, Play, RotateCw, Hash } from 'lucide-react';
import { ExpressiveLanguage, EXPRESSIVE_LANGUAGES } from './expressiveFamilyTypes';
import { PilotSpeaker, PILOT_SPEAKERS } from './expressiveConstants';
import { fetchGeminiKeyPool } from '../../services/api';
import { BatchExecutionMode } from './useExpressiveBatchRunner';
import { ExpressiveBatchWorkloadCard } from './ExpressiveBatchWorkloadCard';
import { ExpressiveBatchPipelineSelector } from './ExpressiveBatchPipelineSelector';

interface ExpressiveBatchSetupProps {
  sentencesText: string;
  onChangeSentencesText: (text: string) => void;
  language: ExpressiveLanguage;
  onChangeLanguage: (lang: ExpressiveLanguage) => void;
  selectedSpeaker: PilotSpeaker;
  onChangeSpeaker: (spk: PilotSpeaker) => void;
  autoRotateSpeakers: boolean;
  onToggleAutoRotate: (val: boolean) => void;
  startIdx: number;
  onChangeStartIdx: (idx: number) => void;
  onRefreshNextIndex?: () => void;
  isRefreshingNextIndex?: boolean;
  selectedPresetTier: 'core27' | 'hardest5' | 'mixed9' | 'mixed18' | 'mixed54' | 'all81';
  onChangePresetTier: (tier: 'core27' | 'hardest5' | 'mixed9' | 'mixed18' | 'mixed54' | 'all81') => void;
  batchMode: BatchExecutionMode;
  onChangeBatchMode: (mode: BatchExecutionMode) => void;
  chunkSize: number;
  onChangeChunkSize: (size: number) => void;
  onStartBatch: () => void;
  isBatchActive: boolean;
}

export const ExpressiveBatchSetup: React.FC<ExpressiveBatchSetupProps> = ({
  sentencesText,
  onChangeSentencesText,
  language,
  onChangeLanguage,
  selectedSpeaker,
  onChangeSpeaker,
  autoRotateSpeakers,
  onToggleAutoRotate,
  startIdx,
  onChangeStartIdx,
  onRefreshNextIndex,
  isRefreshingNextIndex,
  selectedPresetTier,
  onChangePresetTier,
  batchMode,
  onChangeBatchMode,
  chunkSize,
  onChangeChunkSize,
  onStartBatch,
  isBatchActive
}) => {
  const [activeKeysCount, setActiveKeysCount] = useState<number>(1);

  useEffect(() => {
    fetchGeminiKeyPool()
      .then(res => {
        if (res && typeof res.activeCount === 'number') {
          setActiveKeysCount(Math.max(1, res.activeCount));
        } else if (res && Array.isArray(res.pool)) {
          const ready = res.pool.filter(k => k.status === 'ready' && k.isEnabled !== false).length;
          setActiveKeysCount(Math.max(1, ready));
        }
      })
      .catch(() => {});
  }, []);

  const sentences = sentencesText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const activeLangConfig = EXPRESSIVE_LANGUAGES.find(l => l.id === language) || EXPRESSIVE_LANGUAGES[0];

  const conditionCount = { core27: 27, hardest5: 5, mixed9: 9, mixed18: 18, mixed54: 54, all81: 81 }[selectedPresetTier] || 27;
  const totalClips = sentences.length * conditionCount;
  const effectiveChunk = Math.max(1, Math.min(chunkSize, sentences.length || 1));
  const chunkCount = Math.ceil((sentences.length || 1) / effectiveChunk);
  const slicedRequests = chunkCount * conditionCount;
  const actualRequests = batchMode === 'sliced' ? slicedRequests : totalClips;
  const quotaSavingsPercent = totalClips > 0 ? Math.round(((totalClips - slicedRequests) / totalClips) * 100) : 83;
  const requestsPerKey = Math.ceil(actualRequests / Math.max(1, activeKeysCount));

  const firstFamilyPreview = `${selectedSpeaker.id}_${String(startIdx || 1).padStart(3, '0')}`;

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem', background: 'var(--card-bg, #1e2230)', border: '1px solid var(--border-color, #2d3348)', borderRadius: '12px' }}>
      {/* 1. Language Picker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe2 size={18} style={{ color: '#38BDF8' }} />
          <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#F1F5F9' }}>Target Language & Dialect</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {EXPRESSIVE_LANGUAGES.map(l => (
            <button
              key={l.id}
              disabled={isBatchActive}
              onClick={() => onChangeLanguage(l.id)}
              className={`btn btn-sm ${language === l.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Sentences Input Box */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Enter Sentences (1 per line • Creates 1 Family per sentence):</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818CF8', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              {sentences.length} {sentences.length === 1 ? 'Family' : 'Families'}
            </span>
            <button
              disabled={isBatchActive}
              onClick={() => onChangeSentencesText(activeLangConfig.sampleSentences.join('\n'))}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem', padding: '2px 8px' }}
            >
              Load {activeLangConfig.name} Samples
            </button>
          </div>
        </div>
        <textarea
          rows={3}
          disabled={isBatchActive}
          placeholder={`Enter ${activeLangConfig.name} sentences here (one sentence per line)...`}
          value={sentencesText}
          onChange={e => onChangeSentencesText(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: '#F8FAFC',
            padding: '8px 12px',
            direction: activeLangConfig.direction,
            fontFamily: activeLangConfig.direction === 'rtl' ? 'Noto Naskh Arabic, Tahoma, sans-serif' : 'inherit',
            fontSize: '0.92rem'
          }}
        />
      </div>

      {/* 3. Preset Tier, Speaker Selection & Family Index */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#C084FC', display: 'block', marginBottom: '6px' }}>Conditions Preset:</span>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {[
              { id: 'core27' as const, label: 'Core 27' },
              { id: 'mixed18' as const, label: 'Mixed 18' },
              { id: 'mixed54' as const, label: 'Mixed 54 (All)' },
              { id: 'all81' as const, label: 'All 81 (Full)' },
              { id: 'mixed9' as const, label: 'Pilot 9' },
              { id: 'hardest5' as const, label: 'Hardest 5' }
            ].map(t => (
              <button
                key={t.id}
                disabled={isBatchActive}
                onClick={() => onChangePresetTier(t.id)}
                className={`btn btn-sm ${selectedPresetTier === t.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.74rem' }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38BDF8', display: 'block', marginBottom: '6px' }}>Speaker & Rotation:</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              disabled={isBatchActive || autoRotateSpeakers}
              value={selectedSpeaker.id}
              onChange={e => {
                const spk = PILOT_SPEAKERS.find(s => s.id === e.target.value);
                if (spk) onChangeSpeaker(spk);
              }}
              style={{ padding: '4px 8px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#F8FAFC', fontSize: '0.78rem' }}
            >
              {PILOT_SPEAKERS.map(s => <option key={s.id} value={s.id}>{s.name} ({s.gender})</option>)}
            </select>
            <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input type="checkbox" disabled={isBatchActive} checked={autoRotateSpeakers} onChange={e => onToggleAutoRotate(e.target.checked)} />
              Rotate 4 Speakers
            </label>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Hash size={13} /> Starting Family Index:
            </span>
            {onRefreshNextIndex && (
              <button
                type="button"
                onClick={onRefreshNextIndex}
                disabled={isBatchActive || isRefreshingNextIndex}
                title="Fetch next available family index from server dataset"
                style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38BDF8',
                  borderRadius: '4px',
                  padding: '2px 7px',
                  cursor: isRefreshingNextIndex ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                <RotateCw size={10} style={{ animation: isRefreshingNextIndex ? 'spin 1s linear infinite' : 'none' }} />
                <span>Sync</span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              min={1}
              max={9999}
              disabled={isBatchActive}
              value={startIdx}
              onChange={e => onChangeStartIdx(Math.max(1, parseInt(e.target.value, 10) || 1))}
              style={{
                width: '80px',
                padding: '4px 8px',
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#F8FAFC',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            />
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
              First: <code style={{ color: '#38BDF8', fontWeight: 600 }}>{firstFamilyPreview}</code>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Batch Pipeline Mode (Smart Slicing vs 1:1) */}
      <ExpressiveBatchPipelineSelector
        batchMode={batchMode}
        onChangeBatchMode={onChangeBatchMode}
        chunkSize={chunkSize}
        onChangeChunkSize={onChangeChunkSize}
        isBatchActive={isBatchActive}
      />

      {/* 5. Planned Workload Calculation & Quota Card */}
      <ExpressiveBatchWorkloadCard
        totalClips={totalClips}
        sentenceCount={sentences.length}
        conditionCount={conditionCount}
        batchMode={batchMode}
        chunkCount={chunkCount}
        actualRequests={actualRequests}
        quotaSavingsPercent={quotaSavingsPercent}
        activeKeysCount={activeKeysCount}
        requestsPerKey={requestsPerKey}
      />

      {/* 6. Start Batch Execution */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
          Will send <strong style={{ color: '#38BDF8' }}>{actualRequests} API calls</strong> to produce <strong style={{ color: '#F8FAFC' }}>{totalClips} clips</strong> across <strong style={{ color: '#F8FAFC' }}>{sentences.length} families</strong>.
        </div>
        <button
          onClick={onStartBatch}
          disabled={isBatchActive || sentences.length === 0}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 22px', fontSize: '0.9rem', fontWeight: 700 }}
        >
          <Play size={16} /> Start Automated Family Batch
        </button>
      </div>
    </div>
  );
};
