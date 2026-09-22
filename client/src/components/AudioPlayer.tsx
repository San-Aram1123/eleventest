import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Gauge } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  sampleId?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  showDownload?: boolean;
  initialDuration?: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  sampleId,
  autoPlay = false,
  onEnded,
  onTimeUpdate,
  showDownload = true,
  initialDuration = 0
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (initialDuration && initialDuration > 0 && (!duration || duration === 0)) {
      setDuration(initialDuration);
    }
  }, [initialDuration]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    // Reset state when src changes
    setIsPlaying(false);
    setCurrentTime(0);
    if (initialDuration) setDuration(initialDuration);
  }, [src, initialDuration]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Audio play error:', err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curr = audioRef.current.currentTime;
    setCurrentTime(curr);
    if (onTimeUpdate) {
      onTimeUpdate(curr);
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const cycleSpeed = () => {
    const rates = [0.75, 1.0, 1.25, 1.5];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    audioRef.current.play();
    setIsPlaying(true);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player-card">
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        autoPlay={autoPlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
      />

      {/* Main Play / Pause & Wave Scrubber */}
      <div className="audio-player-main">
        <button
          className={`player-play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
        </button>

        <div className="player-track-container">
          <div className="player-waveform-bg">
            {/* Visual audio bars effect */}
            {Array.from({ length: 32 }).map((_, i) => {
              const active = (i / 32) * 100 <= progressPercent;
              const height = 20 + Math.sin(i * 0.6) * 15 + Math.cos(i * 1.2) * 10;
              return (
                <div
                  key={i}
                  className={`waveform-bar ${active ? 'active' : ''}`}
                  style={{ height: `${Math.max(15, height)}%` }}
                />
              );
            })}
          </div>

          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="player-seek-slider"
          />
        </div>

        <div className="player-time-badge">
          <span>{formatTime(currentTime)}</span>
          <span className="time-separator">/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Auxiliary Controls */}
      <div className="audio-player-aux">
        <div className="aux-left">
          <button className="aux-btn" onClick={restartAudio} title="Replay from start">
            <RotateCcw size={14} />
          </button>
          
          <button className="aux-btn speed-badge" onClick={cycleSpeed} title="Change Speed">
            <Gauge size={13} />
            <span>{playbackRate}x</span>
          </button>

          <button className="aux-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>

        {showDownload && sampleId && (
          <a
            href={`/api/dataset/${sampleId}/download/wav`}
            download={`${sampleId}.wav`}
            className="aux-btn download-btn"
            title="Download Audio (WAV)"
          >
            <Download size={14} />
            <span>WAV</span>
          </a>
        )}
      </div>

      <style>{`
        .audio-player-card {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .audio-player-main {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .player-play-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0284C7, #0369A1);
          border: 1px solid rgba(56, 189, 248, 0.5);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
          transition: all var(--transition-fast);
        }

        .player-play-btn:hover {
          transform: scale(1.05);
          background: linear-gradient(135deg, #0EA5E9, #0284C7);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.6);
        }

        .player-play-btn.playing {
          background: linear-gradient(135deg, #10B981, #059669);
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
        }

        .player-track-container {
          flex: 1;
          position: relative;
          height: 36px;
          display: flex;
          align-items: center;
        }

        .player-waveform-bg {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2px;
          pointer-events: none;
          padding: 0 4px;
        }

        .waveform-bar {
          flex: 1;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 2px;
          transition: background 0.15s ease, height 0.15s ease;
        }

        .waveform-bar.active {
          background: linear-gradient(to top, #38BDF8, #818CF8);
        }

        .player-seek-slider {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 10;
        }

        .player-time-badge {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--text-muted);
          background: rgba(30, 41, 59, 0.6);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .time-separator {
          color: var(--text-dim);
        }

        .audio-player-aux {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-subtle);
          padding-top: 6px;
        }

        .aux-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .aux-btn {
          background: transparent;
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-family: var(--font-sans);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .aux-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-main);
          border-color: var(--border-medium);
        }

        .speed-badge {
          font-family: var(--font-mono);
          font-weight: 600;
        }

        .download-btn {
          color: #38BDF8;
          border-color: rgba(56, 189, 248, 0.3);
        }

        .download-btn:hover {
          background: rgba(56, 189, 248, 0.15);
        }
      `}</style>
    </div>
  );
};
