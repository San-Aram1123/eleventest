import React, { useState } from 'react';
import { Play, Pause, GitCompare, Save, CheckCircle2, AlertTriangle, Cpu, ShieldCheck } from 'lucide-react';
import { LabClip, BoundaryComparison, DetectionEngineType } from '../../services/contextSwitchingApi';
import { ContextMasterAudioPlayer } from './ContextMasterAudioPlayer';

interface ContextLabResultsViewProps {
  detectionEngine: DetectionEngineType;
  masterAudioUrl: string | null;
  speaker1Voice?: string;
  speaker2Voice?: string;
  pyannoteClips: LabClip[];
  triHybridClips: LabClip[];
  singleClips: LabClip[];
  comparisonTable: BoundaryComparison[];
  isSaving: boolean;
  onSaveToDataset: (engineKey: string) => void;
}

export const ContextLabResultsView: React.FC<ContextLabResultsViewProps> = ({
  detectionEngine,
  masterAudioUrl,
  speaker1Voice,
  speaker2Voice,
  pyannoteClips,
  triHybridClips,
  singleClips,
  comparisonTable,
  isSaving,
  onSaveToDataset
}) => {
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  const isAll = detectionEngine === 'all';
  const totalLines = isAll
    ? Math.max(pyannoteClips.length, triHybridClips.length)
    : singleClips.length;

  if (totalLines === 0) return null;

  const togglePlay = (key: string, audioUrl?: string) => {
    if (!audioUrl) return;
    const existing = document.getElementById(`audio_${key}`) as HTMLAudioElement;
    if (!existing) return;

    if (playingKey === key) {
      existing.pause();
      setPlayingKey(null);
    } else {
      if (playingKey) {
        const prev = document.getElementById(`audio_${playingKey}`) as HTMLAudioElement;
        if (prev) prev.pause();
      }
      existing.play();
      setPlayingKey(key);
    }
  };

  const renderClipPlayer = (clip: LabClip | undefined, label: string, color: string, icon: React.ReactNode, keyPrefix: string, idx: number) => {
    if (!clip) return null;
    const isPlaying = playingKey === `${keyPrefix}_${idx}`;

    return (
      <div
        style={{
          padding: '0.5rem 0.65rem',
          borderRadius: '6px',
          background: `${color}0c`,
          border: `1px solid ${color}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.45rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, flex: 1 }}>
          <button
            type="button"
            onClick={() => togglePlay(`${keyPrefix}_${idx}`, clip.audioUrl)}
            className="btn btn-secondary btn-sm"
            style={{
              width: '26px',
              height: '26px',
              padding: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: isPlaying ? color : 'rgba(255,255,255,0.08)'
            }}
          >
            {isPlaying ? <Pause size={11} color="#fff" /> : <Play size={11} style={{ marginLeft: '1px' }} />}
          </button>
          <audio
            id={`audio_${keyPrefix}_${idx}`}
            src={clip.audioUrl}
            onEnded={() => setPlayingKey(null)}
            style={{ display: 'none' }}
          />

          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {icon}
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color, whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
              [{clip.start.toFixed(2)}s - {clip.end.toFixed(2)}s] • <strong>{clip.duration.toFixed(2)}s</strong>
            </div>
          </div>
        </div>

        <a
          href={clip.audioUrl}
          download={`line_${idx + 1}_${keyPrefix}.wav`}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.15rem 0.4rem', fontSize: '0.66rem', flexShrink: 0 }}
        >
          WAV
        </a>
      </div>
    );
  };

  return (
    <div style={{ marginTop: '1.25rem' }}>
      {/* Header and Save Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitCompare size={18} className="text-primary" />
          <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>
            {isAll ? 'Diarization Benchmark: Pyannote vs Tri-Hybrid Fusion' : `${detectionEngine.toUpperCase()} Slices`}
          </span>
          <span className="badge" style={{ background: '#3B82F622', color: '#60A5FA', border: '1px solid #3B82F644' }}>
            {totalLines} lines generated
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {isAll ? (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onSaveToDataset('pyannote')}
                disabled={isSaving}
                style={{ fontSize: '0.74rem', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid #8B5CF666' }}
              >
                <Save size={12} style={{ color: '#A78BFA', marginRight: '4px' }} />
                Save Pyannote
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onSaveToDataset('tri_hybrid')}
                disabled={isSaving}
                style={{ fontSize: '0.74rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B98166' }}
              >
                <Save size={12} style={{ color: '#34D399', marginRight: '4px' }} />
                Save Tri-Hybrid
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onSaveToDataset(detectionEngine)}
              disabled={isSaving}
            >
              <Save size={13} style={{ marginRight: '4px' }} />
              Save Slices to Dataset
            </button>
          )}
        </div>
      </div>

      {/* Full Master Audio Player Card */}
      {masterAudioUrl && (
        <ContextMasterAudioPlayer
          masterAudioUrl={masterAudioUrl}
          speaker1Voice={speaker1Voice}
          speaker2Voice={speaker2Voice}
        />
      )}

      {/* Comparison Grid Per Line */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: totalLines }).map((_, idx) => {
          const pyClip = pyannoteClips[idx];
          const triClip = triHybridClips[idx];
          const single = singleClips[idx];
          const comp = comparisonTable[idx];

          const lineText = pyClip?.text || triClip?.text || single?.text || `Line ${idx + 1}`;
          const isSpk1 = idx % 2 === 0;
          const spkVoice = (pyClip?.speakerName || single?.speakerName || 'Voice').toUpperCase();
          const spkColor = isSpk1 ? '#3B82F6' : '#EC4899';

          return (
            <div
              key={idx}
              className="glass-card"
              style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <span
                  style={{
                    padding: '0.12rem 0.45rem',
                    borderRadius: '4px',
                    background: `${spkColor}22`,
                    color: spkColor,
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    border: `1px solid ${spkColor}44`
                  }}
                >
                  Line {idx + 1}: {spkVoice} ({isSpk1 ? 'Speaker 1' : 'Speaker 2'})
                </span>

                {comp && isAll && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.72rem',
                      padding: '0.12rem 0.45rem',
                      borderRadius: '4px',
                      background: comp.max_spread_ms < 50 ? '#10B98118' : (comp.max_spread_ms < 200 ? '#F59E0B18' : '#EF444418'),
                      color: comp.max_spread_ms < 50 ? '#34D399' : (comp.max_spread_ms < 200 ? '#FBBF24' : '#F87171'),
                      border: `1px solid ${comp.max_spread_ms < 50 ? '#10B98144' : (comp.max_spread_ms < 200 ? '#F59E0B44' : '#EF444444')}`
                    }}
                  >
                    {comp.max_spread_ms < 50 ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                    <span>Boundary {idx + 1}: Δ {comp.max_spread_ms}ms ({comp.agreement})</span>
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.83rem', color: '#cbd5e1', lineHeight: '1.45', marginBottom: '0.6rem' }} dir="auto">
                {lineText}
              </div>

              {isAll ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.5rem' }}>
                  {renderClipPlayer(pyClip, 'Pyannote 3.0 Baseline', '#A78BFA', <Cpu size={12} style={{ color: '#A78BFA' }} />, 'pyannote', idx)}
                  {renderClipPlayer(triClip, 'Tri-Hybrid Fusion', '#34D399', <ShieldCheck size={12} style={{ color: '#34D399' }} />, 'tri_hybrid', idx)}
                </div>
              ) : (
                renderClipPlayer(single, detectionEngine === 'tri_hybrid' ? 'Tri-Hybrid Fusion' : 'Pyannote Baseline', '#60A5FA', <Cpu size={12} />, detectionEngine, idx)
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
