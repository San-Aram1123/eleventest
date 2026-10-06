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

  // If timestamp already has UTC 'Z' or timezone offset, parse directly
  if (str.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  // Database DATETIME strings are UTC stored without timezone ("YYYY-MM-DD HH:mm:ss").
  // Treat as UTC by appending 'Z' so browser converts to local time (e.g. GMT+3).
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

  // Check if any clip in this family was recently generated / added
  const hasRecentlyAddedClip = REQUIRED_EMOTIONS.some(e => {
    const clip = getClip(e.id);
    return clip && recentSampleIds?.has(clip.id);
  });

  const friendlyTime = formatFriendlyTime(f.latestCreatedAt, timeZone);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <code style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>{f.familyId}</code>
          <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <User size={12} /> {f.speaker}
          </span>
          {f.gender && (
            <span className="badge" style={{
              background: f.gender === 'female' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: f.gender === 'female' ? '#f472b6' : '#60a5fa',
              border: f.gender === 'female' ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              {f.gender === 'female' ? '♀ Female' : '♂ Male'}
            </span>
          )}
          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
            {f.language === 'en'
              ? 'English (en)'
              : f.language === 'ar'
                ? 'Arabic (ar)'
                : f.language === 'kmr' || f.dialect === 'badini'
                  ? 'Badini (kmr)'
                  : 'Sorani (ckb)'}
          </span>
          {hasRecentlyAddedClip && (
            <span className="badge badge-recently-active">
              <Sparkles size={11} /> Live Update
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {friendlyTime && (
            <span
              className="badge"
              style={{
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#7dd3fc',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                padding: '2px 7px'
              }}
              title={`Latest generation: ${formatFullDateTime(f.latestCreatedAt, timeZone)}`}
            >
              <Clock size={11} />
              <span>{friendlyTime}</span>
            </span>
          )}
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

      {/* Spoken Text */}
      <div
        dir={f.language === 'en' ? 'ltr' : 'rtl'}
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
          const clip = getClip(req.id);
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
              title={`${clip.id}.wav (${Number(intensity).toFixed(1)})${clip.created_at ? ` • ${formatFullDateTime(clip.created_at, timeZone)}` : ''}`}
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
