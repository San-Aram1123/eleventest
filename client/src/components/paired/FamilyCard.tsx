import React from 'react';
import { Play, Pause, CheckCircle2, AlertCircle, User, Sparkles, Clock } from 'lucide-react';
import { Sample } from '../../types';
import { REQUIRED_EMOTIONS } from './pairedConstants';

export interface FamilyGroup {
  familyId: string;
  speaker: string;
  text: string;
  dialect: string;
  language?: string;
  gender?: 'male' | 'female' | string;
  clips: Record<string, Sample>;
  latestTimestamp?: number;
  latestCreatedAt?: string | null;
}

export function parseDateSafe(dateVal?: string | number | null): Date | null {
  if (!dateVal) return null;
  if (typeof dateVal === 'number') {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d;
  }
  const str = String(dateVal).trim();
  if (!str) return null;

  if (str.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?$/.test(str)) {
    const isoUtc = str.replace(' ', 'T') + 'Z';
    const d = new Date(isoUtc);
    if (!isNaN(d.getTime())) return d;
  }

  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

export function getTimeZone(): string {
  try {
    const saved = localStorage.getItem('app_timezone');
    if (saved && saved !== 'local') return saved;
    if (saved === 'local') {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return detected || 'Asia/Baghdad';
    }
  } catch (e) {}

  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!detected || detected.toUpperCase() === 'UTC' || detected === 'ETC/UTC') {
      return 'Asia/Baghdad';
    }
    return detected;
  } catch (e) {
    return 'Asia/Baghdad';
  }
}

function getDateInTimeZone(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  } catch (e) {
    return date.toISOString().slice(0, 10);
  }
}

export function formatFriendlyTime(dateVal?: string | number | null, forcedTz?: string): string {
  const d = parseDateSafe(dateVal);
  if (!d) return '';
  const timeZone = forcedTz || getTimeZone();

  const now = new Date();
  const dateStr = getDateInTimeZone(d, timeZone);
  const todayStr = getDateInTimeZone(now, timeZone);

  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayStr = getDateInTimeZone(yesterday, timeZone);

  const isToday = dateStr === todayStr;
  const isYesterday = dateStr === yesterdayStr;

  const timeStr = d.toLocaleTimeString([], { timeZone, hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  const datePart = d.toLocaleDateString([], {
    timeZone,
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
  return `${datePart}, ${timeStr}`;
}

export function formatFullDateTime(dateVal?: string | number | null, forcedTz?: string): string {
  const d = parseDateSafe(dateVal);
  if (!d) return '';
  const timeZone = forcedTz || getTimeZone();
  return d.toLocaleString([], {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

interface FamilyCardProps {
  family: FamilyGroup;
  activeAudioId?: string | null;
  playingClipId?: string | null;
  recentSampleIds?: Set<string>;
  timeZone?: string;
  onPlay: (sample: Sample) => void;
}

export const FamilyCard: React.FC<FamilyCardProps> = ({
  family: f,
  activeAudioId,
  playingClipId,
  recentSampleIds,
  timeZone,
  onPlay
}) => {
  const getClip = (id: string) => f.clips[id] || (id === 'cackle' ? f.clips['laugh'] : null);
  const presentCount = REQUIRED_EMOTIONS.filter(e => !!getClip(e.id)).length;
  const isComplete = presentCount === REQUIRED_EMOTIONS.length;

  const hasRecentlyAddedClip = REQUIRED_EMOTIONS.some(e => {
    const clip = getClip(e.id);
    return clip && recentSampleIds?.has(clip.id);
  });

  const friendlyTime = formatFriendlyTime(f.latestCreatedAt, timeZone);

  return (
    <div
      className={`glass-card family-card ${hasRecentlyAddedClip ? 'family-card-active-glow' : ''} ${isComplete ? 'family-complete' : ''}`}
      style={{
        padding: '1.1rem 1.35rem',
        borderLeft: `4px solid ${isComplete ? '#30D158' : '#FF9F0A'}`,
        borderRadius: '16px',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.22)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem', gap: '0.6rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <code style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0A84FF', letterSpacing: '-0.01em' }}>{f.familyId}</code>
          <span className="badge" style={{ background: 'rgba(191, 90, 242, 0.12)', color: '#BF5AF2', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '9999px', padding: '3px 9px', fontSize: '0.72rem', fontWeight: 600 }}>
            <User size={12} /> {f.speaker}
          </span>
          {f.gender && (
            <span className="badge" style={{
              background: f.gender === 'female' ? 'rgba(255, 55, 95, 0.12)' : 'rgba(10, 132, 255, 0.12)',
              color: f.gender === 'female' ? '#FF375F' : '#0A84FF',
              border: f.gender === 'female' ? '1px solid rgba(255, 55, 95, 0.25)' : '1px solid rgba(10, 132, 255, 0.25)',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {f.gender === 'female' ? '♀ Female' : '♂ Male'}
            </span>
          )}
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', borderRadius: '9999px', fontSize: '0.72rem' }}>
            {f.language === 'en'
              ? 'English (en)'
              : f.language === 'ar'
                ? 'Arabic (ar)'
                : f.language === 'kmr' || f.dialect === 'badini'
                  ? 'Badini (kmr)'
                  : 'Sorani (ckb)'}
          </span>
          {hasRecentlyAddedClip && (
            <span className="badge badge-recently-active" style={{ borderRadius: '9999px', background: 'rgba(48, 209, 88, 0.15)', color: '#30D158', border: '1px solid rgba(48, 209, 88, 0.3)' }}>
              <Sparkles size={11} /> Live Update
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {friendlyTime && (
            <span
              className="badge"
              style={{
                background: 'rgba(10, 132, 255, 0.1)',
                color: '#0A84FF',
                border: '1px solid rgba(10, 132, 255, 0.25)',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.74rem',
                padding: '2px 8px'
              }}
              title={`Latest generation: ${formatFullDateTime(f.latestCreatedAt, timeZone)}`}
            >
              <Clock size={11} />
              <span>{friendlyTime}</span>
            </span>
          )}
          {isComplete ? (
            <span className="badge" style={{ background: 'rgba(48, 209, 88, 0.12)', color: '#30D158', border: '1px solid rgba(48, 209, 88, 0.25)', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: 700 }}>
              <CheckCircle2 size={13} /> 6/6 Complete
            </span>
          ) : (
            <span className="badge" style={{ background: 'rgba(255, 159, 10, 0.12)', color: '#FF9F0A', border: '1px solid rgba(255, 159, 10, 0.25)', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: 700 }}>
              <AlertCircle size={13} /> {presentCount}/6 Emotions
            </span>
          )}
        </div>
      </div>

      {/* Spoken Text */}
      <div
        dir={f.language === 'en' ? 'ltr' : 'rtl'}
        style={{
          fontSize: '1.02rem',
          fontWeight: 500,
          color: 'var(--text-primary)',
          fontFamily: "'Rabar', 'Vazirmatn', sans-serif",
          marginBottom: '0.9rem',
          lineHeight: 1.65
        }}
      >
        {f.text}
      </div>

      {/* 6 Required Emotion Pills with Interactive Audio Playback */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {REQUIRED_EMOTIONS.map((req) => {
          const clip = getClip(req.id);
          const isPlaying = (activeAudioId === clip?.id) || (playingClipId === clip?.id);
          const isNew = Boolean(clip && recentSampleIds?.has(clip.id));

          if (!clip) {
            return (
              <div
                key={req.id}
                className="emotion-pill-missing"
                style={{
                  border: '1px dashed var(--border-medium)',
                  borderRadius: '9999px',
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  color: 'var(--text-tertiary)'
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
                fontSize: '0.76rem',
                borderRadius: '9999px',
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                position: 'relative',
                background: isPlaying ? 'linear-gradient(145deg, #0A84FF, #0066CC)' : 'rgba(255, 255, 255, 0.06)',
                border: isPlaying ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-subtle)',
                color: isPlaying ? '#FFFFFF' : 'var(--text-primary)'
              }}
              title={`${clip.id}.wav (${Number(intensity).toFixed(1)})${clip.created_at ? ` • ${formatFullDateTime(clip.created_at, timeZone)}` : ''}`}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span style={{ fontWeight: 600 }}>{req.name}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.75, fontFamily: 'var(--font-mono)' }}>({Number(intensity).toFixed(1)})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
