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

const PRESET_TIERS = [
  { id: 'core27' as const, label: 'Core 27' },
  { id: 'mixed18' as const, label: 'Mixed 18' },
  { id: 'mixed54' as const, label: 'Mixed 54' },
  { id: 'all81' as const, label: 'All 81' },
  { id: 'mixed9' as const, label: 'Pilot 9' },
  { id: 'hardest5' as const, label: 'Hardest 5' }
];

export const ExpressiveBatchSetup: React.FC<ExpressiveBatchSetupProps> = ({
  sentencesText, onChangeSentencesText, language, onChangeLanguage,
  selectedSpeaker, onChangeSpeaker, autoRotateSpeakers, onToggleAutoRotate,
  startIdx, onChangeStartIdx, onRefreshNextIndex, isRefreshingNextIndex,
  selectedPresetTier, onChangePresetTier, batchMode, onChangeBatchMode,
  chunkSize, onChangeChunkSize, onStartBatch, isBatchActive
}) => {
  const [activeKeysCount, setActiveKeysCount] = useState<number>(1);

  useEffect(() => {
    fetchGeminiKeyPool().then(res => {
      if (res && typeof res.activeCount === 'number') setActiveKeysCount(Math.max(1, res.activeCount));
      else if (res && Array.isArray(res.pool)) {
        setActiveKeysCount(Math.max(1, res.pool.filter(k => k.status === 'ready' && k.isEnabled !== false).length));
      }
    }).catch(() => {});
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
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-medium)', borderTop: '1px solid var(--border-specular)', backdropFilter: 'blur(20px) saturate(180%)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.28)' }}>
      {/* 1. Language Picker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe2 size={18} style={{ color: '#0A84FF' }} />
          <span style={{ fontWeight: 700, fontSize: '0.92rem', letterSpacing: '-0.015em' }}>Target Language &amp; Dialect</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {EXPRESSIVE_LANGUAGES.map(l => (
            <button key={l.id} disabled={isBatchActive} onClick={() => onChangeLanguage(l.id)} className="btn btn-sm" style={{ fontSize: '0.78rem', borderRadius: '9999px', padding: '5px 14px', fontWeight: 600, background: language === l.id ? '#0A84FF' : 'rgba(255, 255, 255, 0.06)', color: language === l.id ? '#FFFFFF' : 'var(--text-secondary)', border: language === l.id ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-subtle)' }}>
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Sentences Input Box */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Enter Sentences (1 per line • Creates 1 Family per sentence):</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', background: 'rgba(191, 90, 242, 0.12)', color: '#BF5AF2', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700, border: '1px solid rgba(191, 90, 242, 0.3)' }}>
              {sentences.length} {sentences.length === 1 ? 'Family' : 'Families'}
            </span>
            <button disabled={isBatchActive} onClick={() => onChangeSentencesText(activeLangConfig.sampleSentences.join('\n'))} className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)', fontWeight: 600 }}>
              Load {activeLangConfig.name} Samples
            </button>
          </div>
        </div>
        <textarea rows={3} disabled={isBatchActive} placeholder={`Enter ${activeLangConfig.name} sentences here (one sentence per line)...`} value={sentencesText} onChange={e => onChangeSentencesText(e.target.value)} style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: '12px', color: 'var(--text-main)', padding: '10px 14px', direction: activeLangConfig.direction, fontFamily: activeLangConfig.direction === 'rtl' ? 'Noto Naskh Arabic, Tahoma, sans-serif' : 'inherit', fontSize: '0.92rem', lineHeight: 1.6, outline: 'none' }} />
      </div>

      {/* 3. Preset Tier, Speaker Selection & Family Index */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.95rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#BF5AF2', display: 'block', marginBottom: '6px' }}>Conditions Preset:</span>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {PRESET_TIERS.map(t => (
              <button key={t.id} disabled={isBatchActive} onClick={() => onChangePresetTier(t.id)} className="btn btn-sm" style={{ fontSize: '0.74rem', borderRadius: '9999px', padding: '4px 10px', fontWeight: 600, background: selectedPresetTier === t.id ? '#0A84FF' : 'rgba(255, 255, 255, 0.06)', color: selectedPresetTier === t.id ? '#FFFFFF' : 'var(--text-secondary)', border: selectedPresetTier === t.id ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-subtle)' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A84FF', display: 'block', marginBottom: '6px' }}>Speaker &amp; Rotation:</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select disabled={isBatchActive || autoRotateSpeakers} value={selectedSpeaker.id} onChange={e => { const spk = PILOT_SPEAKERS.find(s => s.id === e.target.value); if (spk) onChangeSpeaker(spk); }} style={{ padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.78rem' }}>
              {PILOT_SPEAKERS.map(s => <option key={s.id} value={s.id}>{s.name} ({s.gender})</option>)}
            </select>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" disabled={isBatchActive} checked={autoRotateSpeakers} onChange={e => onToggleAutoRotate(e.target.checked)} style={{ accentColor: '#30D158' }} />
              Rotate 4 Speakers
            </label>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A84FF', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Hash size={13} /> Starting Family Index:
            </span>
            {onRefreshNextIndex && (
              <button type="button" onClick={onRefreshNextIndex} disabled={isBatchActive || isRefreshingNextIndex} style={{ background: 'rgba(10, 132, 255, 0.12)', border: '1px solid rgba(10, 132, 255, 0.3)', color: '#0A84FF', borderRadius: '9999px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: 600 }}>
                <RotateCw size={10} style={{ animation: isRefreshingNextIndex ? 'spin 1s linear infinite' : 'none' }} />
                <span>Sync</span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="number" min={1} max={9999} disabled={isBatchActive} value={startIdx} onChange={e => onChangeStartIdx(Math.max(1, parseInt(e.target.value, 10) || 1))} style={{ width: '80px', padding: '5px 8px', background: 'var(--bg-input)', border: '1px solid var(--border-medium)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 600 }} />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
              First: <code style={{ color: '#0A84FF', fontWeight: 600 }}>{firstFamilyPreview}</code>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Batch Pipeline Mode (Smart Slicing vs 1:1) */}
      <ExpressiveBatchPipelineSelector batchMode={batchMode} onChangeBatchMode={onChangeBatchMode} chunkSize={chunkSize} onChangeChunkSize={onChangeChunkSize} isBatchActive={isBatchActive} />

      {/* 5. Planned Workload Calculation & Quota Card */}
      <ExpressiveBatchWorkloadCard totalClips={totalClips} sentenceCount={sentences.length} conditionCount={conditionCount} batchMode={batchMode} chunkCount={chunkCount} actualRequests={actualRequests} quotaSavingsPercent={quotaSavingsPercent} activeKeysCount={activeKeysCount} requestsPerKey={requestsPerKey} />

      {/* 6. Start Batch Execution */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Will send <strong style={{ color: '#0A84FF' }}>{actualRequests} API calls</strong> to produce <strong style={{ color: 'var(--text-primary)' }}>{totalClips} clips</strong> across <strong style={{ color: 'var(--text-primary)' }}>{sentences.length} families</strong>.
        </div>
        <button onClick={onStartBatch} disabled={isBatchActive || sentences.length === 0} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: 700, borderRadius: '9999px', background: 'linear-gradient(145deg, #0A84FF, #0066CC)', boxShadow: '0 4px 18px rgba(10, 132, 255, 0.38)' }}>
          <Play size={16} /> Start Automated Family Batch
        </button>
      </div>
    </div>
  );
};
