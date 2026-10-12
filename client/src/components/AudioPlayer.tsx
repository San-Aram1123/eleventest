import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Gauge } from 'lucide-react';
import '../styles/audioPlayer.css';

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
    </div>
  );
};
