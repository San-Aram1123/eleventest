import React from 'react';
import { Play, Pause, CheckCircle2, AlertCircle, User, Sparkles } from 'lucide-react';
import { Sample } from '../../types';
import { REQUIRED_EMOTIONS } from './pairedConstants';

export interface FamilyGroup {
  familyId: string;
  speaker: string;
  text: string;
  dialect: string;
  clips: Record<string, Sample>;
}

interface FamilyCardProps {
  family: FamilyGroup;
  activeAudioId?: string | null;
  playingClipId?: string | null;
  recentSampleIds?: Set<string>;
  onPlay: (sample: Sample) => void;
}

export const FamilyCard: React.FC<FamilyCardProps> = ({
  family: f,
  activeAudioId,
  playingClipId,
  recentSampleIds,
  onPlay
}) => {
  const presentCount = REQUIRED_EMOTIONS.filter(e => !!f.clips[e.id]).length;
  const isComplete = presentCount === REQUIRED_EMOTIONS.length;

  // Check if any clip in this family was recently generated / added
  const hasRecentlyAddedClip = REQUIRED_EMOTIONS.some(e => {
    const clip = f.clips[e.id];
    return clip && recentSampleIds?.has(clip.id);
  });

  return (
    <div
      className={`glass-card family-card ${hasRecentlyAddedClip ? 'family-card-active-glow' : ''} ${isComplete ? 'family-complete' : ''}`}
      style={{
        padding: '1rem 1.25rem',
        borderLeft: `4px solid ${isComplete ? '#10b981' : '#f59e0b'}`,
        position: 'relative',
        transition: 'all 0.35s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <code style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>{f.familyId}</code>
          <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <User size={12} /> {f.speaker}
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
            {f.dialect === 'badini' ? 'Badini (kmr)' : 'Sorani (ckb)'}
          </span>
          {hasRecentlyAddedClip && (
            <span className="badge badge-recently-active">
              <Sparkles size={11} /> Live Update
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isComplete ? (
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <CheckCircle2 size={13} /> 6/6 Complete
            </span>
          ) : (
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <AlertCircle size={13} /> {presentCount}/6 Emotions
            </span>
          )}
        </div>
      </div>

      {/* Kurdish Spoken Text */}
      <div
        dir="rtl"
        style={{
          fontSize: '1.05rem',
          fontWeight: 500,
          color: '#f8fafc',
          fontFamily: "'Rabar', 'Vazirmatn', sans-serif",
          marginBottom: '0.85rem',
          lineHeight: 1.6
        }}
      >
        {f.text}
      </div>

      {/* 6 Required Emotion Pills with Interactive Audio Playback */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {REQUIRED_EMOTIONS.map((req) => {
          const clip = f.clips[req.id];
          const isPlaying = (activeAudioId === clip?.id) || (playingClipId === clip?.id);
          const isNew = Boolean(clip && recentSampleIds?.has(clip.id));

          if (!clip) {
            return (
              <div
                key={req.id}
                className="emotion-pill-missing"
                style={{
                  border: '1px dashed rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  color: '#64748b'
                }}
              >
                Missing: {req.name}
              </div>
            );
          }

          const intensity = clip.emotion_intensity ?? (clip as any).customMetadata?.emotion_intensity ?? req.defaultIntensity;

          return (
            <button
              key={req.id}
              type="button"
              onClick={() => onPlay(clip)}
              className={`btn btn-sm ${isNew ? 'emotion-pill-newly-added' : isPlaying ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                position: 'relative'
              }}
              title={`${clip.id}.wav (${Number(intensity).toFixed(1)})`}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span style={{ fontWeight: 600 }}>{req.name}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.75 }}>({Number(intensity).toFixed(1)})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
