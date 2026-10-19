import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, Check } from 'lucide-react';
import { Sample } from '../types';

interface DurationOutlierRowProps {
  sample: Sample;
  duration: number;
  minSeconds: number;
  maxSeconds: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  currentlyPlayingId: string | null;
  onPlayToggle: (id: string) => void;
}

export const DurationOutlierRow: React.FC<DurationOutlierRowProps> = ({
  sample,
  duration,
  minSeconds,
  maxSeconds,
  isSelected,
  onToggleSelect,
  currentlyPlayingId,
  onPlayToggle
}) => {
  const isUnder = duration <= minSeconds;
  const isPlaying = currentlyPlayingId === sample.id;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playProgress, setPlayProgress] = useState(0);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayProgress(0);
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || duration || 1;
    setPlayProgress((cur / dur) * 100);
  };

  const handleEnded = () => {
    setPlayProgress(0);
    if (isPlaying) {
      onPlayToggle(sample.id); // Stop playback
    }
  };

  const audioSrc = (sample as any).audioUrl || (sample as any).audio_url || `/api/dataset/${sample.id}/audio`;

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px 14px',
        background: isSelected ? 'rgba(30, 41, 59, 0.7)' : 'rgba(15, 23, 42, 0.4)',
        border: isSelected 
          ? (isUnder ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)')
          : '1px solid #1e293b',
        borderRadius: '8px',
        transition: 'all 0.15s ease'
      }}
    >
      <audio 
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="none"
      />

      {/* Row Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(sample.id)}
            style={{ cursor: 'pointer', width: '15px', height: '15px', flexShrink: 0 }}
          />

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => onPlayToggle(sample.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: 'none',
              background: isPlaying ? '#38bdf8' : 'rgba(56, 189, 248, 0.15)',
              color: isPlaying ? '#0f172a' : '#38bdf8',
              cursor: 'pointer',
              flexShrink: 0
            }}
            title={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
          </button>

          <span 
            style={{ 
              fontFamily: 'monospace', 
              fontSize: '0.74rem', 
              color: '#cbd5e1', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}
          >
            {sample.id}
          </span>
        </div>

        {/* Duration & Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {sample.emotion && (
            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8' }}>
              {sample.emotion}
            </span>
          )}
          <span 
            style={{
              padding: '2px 7px',
              borderRadius: '5px',
              fontWeight: 800,
              fontSize: '0.72rem',
              background: isUnder ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: isUnder ? '#f87171' : '#fbbf24',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isUnder ? 'Too Short: ' : 'Too Long: '}
            {duration.toFixed(2)}s
          </span>
        </div>
      </div>

      {/* Progress Bar (when playing) */}
      {isPlaying && (
        <div style={{ height: '3px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${playProgress}%`, background: '#38bdf8', transition: 'width 0.1s linear' }} />
        </div>
      )}

      {/* Transcript Text (RTL Kurdish) */}
      <div 
        dir="rtl"
        style={{
          fontSize: '0.86rem',
          color: 'var(--text-main)',
          lineHeight: '1.5',
          fontFamily: 'Tahoma, Arial, sans-serif',
          background: 'var(--bg-box)',
          padding: '8px 10px',
          borderRadius: '5px',
          borderRight: isUnder ? '3px solid #ef4444' : '3px solid #f59e0b'
        }}
      >
        {sample.text || '(No text available)'}
      </div>
    </div>
  );
};

