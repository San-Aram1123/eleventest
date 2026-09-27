import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, CheckCircle2, Clock, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

interface BatchProgressBarProps {
  isActive: boolean;
  isPaused: boolean;
  completedClips: number;
  totalClips: number;
  currentSentenceIdx: number;
  totalSentences: number;
  currentFamilyId: string;
  currentEmotion: string;
  currentSpeaker: string;
  currentVoice: string;
  mode: 'sliced' | 'individual';
  chunkSize?: number;
  startTime: number | null;
  onTogglePause: () => void;
  onStop: () => void;
}

export const BatchProgressBar: React.FC<BatchProgressBarProps> = ({
  isActive,
  isPaused,
  completedClips,
  totalClips,
  currentSentenceIdx,
  totalSentences,
  currentFamilyId,
  currentEmotion,
  currentSpeaker,
  currentVoice,
  mode,
  chunkSize = 3,
  startTime,
  onTogglePause,
  onStop
}) => {
  const [tickerSec, setTickerSec] = useState(0);

  // Active ticking timer that updates every second while running
  useEffect(() => {
    if (!isActive || isPaused) return;
    const interval = setInterval(() => {
      setTickerSec(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  useEffect(() => {
    if (isActive) {
      setTickerSec(0);
    }
  }, [isActive, currentFamilyId, currentEmotion, completedClips]);

  if (!isActive && completedClips === 0) return null;

  const percent = totalClips > 0 ? Math.min(100, Math.round((completedClips / totalClips) * 100)) : 0;
  const elapsedSec = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const elapsedMinStr = `${Math.floor(elapsedSec / 60)}m ${elapsedSec % 60}s`;

  const isFinished = !isActive;
  const isIncomplete = isFinished && completedClips < totalClips;

  // Dynamic live action description per active take
  let liveActionText = 'Ready';
  if (isPaused) {
    liveActionText = 'Paused by user';
  } else if (isActive) {
    if (mode === 'sliced') {
      if (tickerSec < 6) {
        liveActionText = `📡 Requesting [${currentEmotion || 'batch'}] multi-sentence master take... (${tickerSec}s)`;
      } else if (tickerSec < 18) {
        liveActionText = `🎙️ Gemini synthesizing multi-sentence audio for [${currentEmotion}]... (${tickerSec}s)`;
      } else if (tickerSec < 38) {
        liveActionText = `⚡ Streaming & receiving master audio from Gemini (${tickerSec}s)...`;
      } else if (tickerSec < 55) {
        liveActionText = `✂️ Slicing & aligning sentence speech boundaries (${tickerSec}s)...`;
      } else {
        liveActionText = `⏳ High-load queue or key rotating (${tickerSec}s) — auto-recovering...`;
      }
    } else {
      if (tickerSec < 5) {
        liveActionText = `🎙️ Synthesizing [${currentEmotion || 'take'}] take... (${tickerSec}s)`;
      } else if (tickerSec < 14) {
        liveActionText = `🎙️ Processing speech with Gemini for [${currentEmotion}]... (${tickerSec}s)`;
      } else if (tickerSec < 28) {
        liveActionText = `⚡ Awaiting Gemini response (${tickerSec}s)...`;
      } else {
        liveActionText = `⏳ Gemini key rotating or rate-limit cooldown active (${tickerSec}s)...`;
      }
    }
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.25rem',
        marginBottom: '1.5rem',
        borderRadius: '12px',
        border: `1.5px solid ${isPaused ? '#f59e0b' : isActive ? '#a855f7' : isIncomplete ? '#f59e0b' : '#10b981'}`,
        background: isPaused
          ? 'rgba(245, 158, 11, 0.08)'
          : isActive
          ? 'rgba(168, 85, 247, 0.08)'
          : isIncomplete
          ? 'rgba(245, 158, 11, 0.08)'
          : 'rgba(16, 185, 129, 0.08)',
        boxShadow: isActive ? '0 4px 20px rgba(168, 85, 247, 0.15)' : 'none'
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {isActive && !isPaused ? (
            <Loader2 size={16} className="spin" color="#c084fc" />
          ) : (
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isPaused ? '#f59e0b' : isIncomplete ? '#f59e0b' : '#10b981'
              }}
            />
          )}
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
            {isPaused
              ? 'Batch Paused'
              : isActive
              ? 'Synthesizing Paired Dataset...'
              : isIncomplete
              ? 'Batch Finished (Incomplete)'
              : 'Batch Completed'}
          </span>
          <span className="badge" style={{ background: mode === 'sliced' ? '#7e22ce' : '#0284c7', color: '#fff', fontSize: '0.72rem' }}>
            {mode === 'sliced' ? (chunkSize === 6 ? 'Adaptive 6-in-1 Sliced' : `${chunkSize || 3}-in-1 Sliced`) : '1:1 Individual'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
          <span>
            Families: <strong style={{ color: '#38bdf8' }}>{currentSentenceIdx} / {totalSentences}</strong>
          </span>
          <span>
            Clips: <strong style={{ color: isIncomplete ? '#fbbf24' : '#c084fc' }}>{completedClips} / {totalClips}</strong> ({percent}%)
          </span>
          {startTime && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8' }}>
              <Clock size={13} /> {elapsedMinStr}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar with Glow */}
      <div style={{ width: '100%', height: '14px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '7px', overflow: 'hidden', position: 'relative', marginBottom: '0.6rem' }}>
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: isPaused
              ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
              : isIncomplete
              ? 'linear-gradient(90deg, #f59e0b, #ec4899)'
              : 'linear-gradient(90deg, #06b6d4 0%, #a855f7 50%, #ec4899 100%)',
            transition: 'width 0.35s ease',
            borderRadius: '7px'
          }}
        />
      </div>

      {/* Live Status Ticker */}
      {isActive && (
        <div style={{ fontSize: '0.8rem', color: tickerSec > 20 ? '#fbbf24' : '#c084fc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
          <span>{liveActionText}</span>
        </div>
      )}

      {/* Bottom Detail Row & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
          {isActive ? (
            <span>
              Target: <code style={{ color: '#38bdf8', fontWeight: 600 }}>{currentFamilyId}</code>
              {currentSpeaker && <span style={{ marginLeft: '0.5rem', color: '#cbd5e1' }}>({currentSpeaker} • {currentVoice})</span>}
              <span style={{ marginLeft: '0.5rem', color: '#c084fc' }}>[{currentEmotion}]</span>
            </span>
          ) : isIncomplete ? (
            <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={15} /> {completedClips} of {totalClips} clips synthesized ({totalClips - completedClips} failed or missing).
            </span>
          ) : (
            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={15} /> All clips synthesized and saved into dataset.
            </span>
          )}
        </div>

        {isActive && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${isPaused ? 'btn-primary' : 'btn-secondary'}`}
              onClick={onTogglePause}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={onStop}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              <Square size={14} /> Stop Batch
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
