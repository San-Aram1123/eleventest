import React from 'react';
import { Users, Activity, GitCompare, Hash, RefreshCw, Cpu, Radio, ShieldCheck } from 'lucide-react';
import { CONTEXT_VOICES } from '../../data/contextSwitchingPresets';
import { DetectionEngineType } from '../../services/contextSwitchingApi';

interface ContextLabConfigCardProps {
  detectionEngine: DetectionEngineType;
  onChangeDetectionEngine: (engine: DetectionEngineType) => void;
  speaker1Voice: string;
  onChangeSpeaker1: (v: string) => void;
  speaker2Voice: string;
  onChangeSpeaker2: (v: string) => void;
  startIdx: number;
  onChangeStartIdx: (idx: number) => void;
  onRefreshStartIdx: () => void;
  isRefreshingIdx: boolean;
  isBatchActive: boolean;
}

export const ContextLabConfigCard: React.FC<ContextLabConfigCardProps> = ({
  detectionEngine,
  onChangeDetectionEngine,
  speaker1Voice,
  onChangeSpeaker1,
  speaker2Voice,
  onChangeSpeaker2,
  startIdx,
  onChangeStartIdx,
  onRefreshStartIdx,
  isRefreshingIdx,
  isBatchActive
}) => {
  const ENGINES = [
    {
      id: 'all' as DetectionEngineType,
      title: 'Compare Both Engines',
      tag: 'Pyannote vs Tri-Hybrid',
      tagColor: '#F59E0B',
      icon: <GitCompare size={15} style={{ color: '#FBBF24' }} />,
      desc: 'Runs Pyannote Baseline and Tri-Hybrid Fusion side-by-side to compare cuts & timing.'
    },
    {
      id: 'pyannote' as DetectionEngineType,
      title: 'Pyannote 3.0 Baseline',
      tag: 'Proven Diarization',
      tagColor: '#8B5CF6',
      icon: <Cpu size={15} style={{ color: '#A78BFA' }} />,
      desc: 'The proven baseline: Single-shot frame-level neural diarization (16.8ms resolution). Fast & reliable.'
    },
    {
      id: 'tri_hybrid' as DetectionEngineType,
      title: 'Tri-Hybrid Fusion Engine',
      tag: 'Diarization + Silero VAD + FFmpeg Silence',
      tagColor: '#10B981',
      icon: <ShieldCheck size={15} style={{ color: '#34D399' }} />,
      desc: 'Combines Pyannote speaker transitions, Silero VAD speech detection, and FFmpeg low-energy silence trough analysis.'
    }
  ];

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} className="text-primary" />
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Speaker Diarization & Slicing Suite</span>
          <span className="badge" style={{ background: '#8B5CF622', color: '#A78BFA', border: '1px solid #8B5CF644' }}>
            Pure Audio Separation
          </span>
        </div>

        {/* Start Index */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Start Index:</span>
          <div style={{ position: 'relative', width: '90px' }}>
            <Hash size={13} style={{ position: 'absolute', left: '0.45rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="number"
              min={1}
              value={startIdx}
              onChange={(e) => onChangeStartIdx(Math.max(1, parseInt(e.target.value, 10) || 1))}
              disabled={isBatchActive}
              className="form-control"
              style={{ width: '100%', padding: '0.35rem 0.4rem 0.35rem 1.6rem', fontSize: '0.82rem', borderRadius: '6px' }}
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onRefreshStartIdx}
            disabled={isRefreshingIdx || isBatchActive}
            title="Refresh Next Index"
            style={{ padding: '0.35rem 0.5rem' }}
          >
            <RefreshCw size={13} className={isRefreshingIdx ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Alternating Speaker Voices */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
          <Users size={16} style={{ color: '#60A5FA' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>Alternating Dialogue Voices</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Distinct Male ↔ Female voice pair</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#93c5fd', marginBottom: '0.25rem' }}>
              Speaker 1 (Lines 1, 3, 5):
            </label>
            <select
              value={speaker1Voice}
              onChange={(e) => onChangeSpeaker1(e.target.value)}
              disabled={isBatchActive}
              className="form-select"
              style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.82rem', borderRadius: '6px' }}
            >
              {CONTEXT_VOICES.map(v => (
                <option key={`spk1_${v.id}`} value={v.id}>{v.name} ({v.gender})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#f472b6', marginBottom: '0.25rem' }}>
              Speaker 2 (Lines 2, 4, 6):
            </label>
            <select
              value={speaker2Voice}
              onChange={(e) => onChangeSpeaker2(e.target.value)}
              disabled={isBatchActive}
              className="form-select"
              style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.82rem', borderRadius: '6px' }}
            >
              {CONTEXT_VOICES.map(v => (
                <option key={`spk2_${v.id}`} value={v.id}>{v.name} ({v.gender})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Engine Selection Grid */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
          Choose Diarization Engine or Compare All:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
          {ENGINES.map((eng) => {
            const isSelected = detectionEngine === eng.id;
            return (
              <div
                key={eng.id}
                onClick={() => !isBatchActive && onChangeDetectionEngine(eng.id)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${isSelected ? eng.tagColor : 'rgba(255,255,255,0.08)'}`,
                  background: isSelected ? `${eng.tagColor}15` : 'rgba(255,255,255,0.02)',
                  cursor: isBatchActive ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {eng.icon}
                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: isSelected ? '#fff' : '#e2e8f0' }}>
                      {eng.title}
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="engineSelector"
                    checked={isSelected}
                    onChange={() => onChangeDetectionEngine(eng.id)}
                    disabled={isBatchActive}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.68rem', padding: '0.08rem 0.35rem', borderRadius: '4px', background: `${eng.tagColor}22`, color: eng.tagColor, fontWeight: 600 }}>
                    {eng.tag}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: '1.35' }}>
                  {eng.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
