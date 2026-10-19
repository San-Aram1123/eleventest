import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Music, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { playExclusiveAudio } from '../../services/audioPlayback';

interface ContextMasterAudioPlayerProps {
  masterAudioUrl: string | null;
  durationSeconds?: number;
  speaker1Voice?: string;
  speaker2Voice?: string;
}

export const ContextMasterAudioPlayer: React.FC<ContextMasterAudioPlayerProps> = ({
  masterAudioUrl,
  durationSeconds,
  speaker1Voice = 'Puck',
  speaker2Voice = 'Aoede'
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(durationSeconds || 0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [masterAudioUrl]);

  if (!masterAudioUrl) return null;

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try { await playExclusiveAudio(audioRef.current); setIsPlaying(true); }
      catch { setIsPlaying(false); }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!duration && audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleRestart = async () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      try { await playExclusiveAudio(audioRef.current); setIsPlaying(true); }
      catch { setIsPlaying(false); }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '1rem 1.25rem',
        marginBottom: '1rem',
        borderRadius: '10px',
        border: '1.5px solid rgba(139, 92, 246, 0.4)',
        background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.22) 0%, rgba(30, 27, 75, 0.45) 100%)',
        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.12)'
      }}
    >
      <audio
        ref={audioRef}
        src={masterAudioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.3)',
              color: '#c084fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Music size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                Full Master Audio (Uncut)
              </span>
              <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.25)', color: '#c084fc', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                100% Uncut Master
              </span>
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.7rem' }}>
                {speaker1Voice} ↔ {speaker2Voice}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Listen to the raw uninterrupted dialogue audio before speaker diarization slicing.
            </div>
          </div>
        </div>

        <a
          href={masterAudioUrl}
          download={`master_dialogue_${speaker1Voice}_${speaker2Voice}.wav`}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', gap: '0.35rem', display: 'flex', alignItems: 'center' }}
        >
          <Download size={13} />
          <span>Download Master WAV</span>
        </a>
      </div>

      {/* Player Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'var(--bg-box)',
          padding: '0.5rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <button
          type="button"
          onClick={togglePlay}
          className="btn btn-primary btn-sm"
          style={{
            width: '32px',
            height: '32px',
            padding: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          title={isPlaying ? 'Pause Master Audio' : 'Play Master Audio'}
        >
          {isPlaying ? <Pause size={14} color="#fff" /> : <Play size={14} style={{ marginLeft: '1px' }} />}
        </button>

        <button
          type="button"
          onClick={handleRestart}
          className="btn btn-secondary btn-sm"
          style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          title="Restart from beginning"
        >
          <RotateCcw size={12} />
        </button>

        {/* Current Time / Duration */}
        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', minWidth: '78px', flexShrink: 0 }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Seek Scrubber Slider */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          style={{
            flex: 1,
            cursor: 'pointer',
            accentColor: '#A78BFA',
            height: '5px'
          }}
        />

        <button
          type="button"
          onClick={toggleMute}
          className="btn btn-secondary btn-sm"
          style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
      </div>
    </div>
  );
};

