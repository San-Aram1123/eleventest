import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { ContextBatchState } from './useContextBatchRunner';

interface ContextBatchProgressBarProps {
  batchState: ContextBatchState;
  onStart: () => void;
  onTogglePause: () => void;
  onStop: () => void;
  canStart: boolean;
}

export const ContextBatchProgressBar: React.FC<ContextBatchProgressBarProps> = ({
  batchState,
  onStart,
  onTogglePause,
  onStop,
  canStart
}) => {
  const {
    isActive,
    isPaused,
    currentChunkIdx,
    totalChunks,
    completedParagraphs,
    totalParagraphs,
    elapsedSeconds,
    errors
  } = batchState;

  const percent = totalParagraphs > 0 
    ? Math.min(100, Math.round((completedParagraphs / totalParagraphs) * 100)) 
    : 0;

  // Estimate remaining time based on average speed per chunk
  let etaText = '--';
  if (isActive && currentChunkIdx > 0 && elapsedSeconds > 0) {
    const avgSecPerChunk = elapsedSeconds / currentChunkIdx;
    const remainingChunks = Math.max(0, totalChunks - currentChunkIdx);
    const etaSec = Math.round(remainingChunks * avgSecPerChunk);
    if (etaSec > 60) {
      etaText = `~${Math.ceil(etaSec / 60)} min`;
    } else {
      etaText = `~${etaSec}s`;
    }
  }

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      {/* Top Header & Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Batch Pipeline Controls</span>
            {isActive && !isPaused && (
              <span className="badge" style={{ background: '#3B82F622', color: '#3B82F6', border: '1px solid #3B82F655', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span className="spinner-sm" style={{ width: '10px', height: '10px' }} />
                Running Batch #{currentChunkIdx} of {totalChunks}
              </span>
            )}
            {isPaused && (
              <span className="badge" style={{ background: '#F59E0B22', color: '#F59E0B', border: '1px solid #F59E0B55' }}>
                ⏸ Paused
              </span>
            )}
            {!isActive && completedParagraphs > 0 && (
              <span className="badge" style={{ background: '#10B98122', color: '#10B981', border: '1px solid #10B98155' }}>
                ✓ Completed
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Takes 6 paragraphs per Gemini TTS call with zero pauses across Kurdish, English, and Arabic.
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {!isActive ? (
            <button
              onClick={onStart}
              disabled={!canStart}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.4rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Sparkles size={16} />
              <span>Start Batch ({totalChunks} Calls)</span>
            </button>
          ) : (
            <>
              <button
                onClick={onTogglePause}
                className="btn btn-secondary"
                style={{ padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {isPaused ? <Play size={15} className="text-success" /> : <Pause size={15} className="text-warning" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                onClick={onStop}
                className="btn btn-secondary"
                style={{ padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444' }}
              >
                <Square size={15} />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar Track */}
      <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.85rem' }}>
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: isPaused 
              ? '#F59E0B' 
              : 'linear-gradient(90deg, #3B82F6 0%, #10B981 100%)',
            transition: 'width 0.3s ease',
            borderRadius: '5px'
          }}
        />
      </div>

      {/* Stats Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Paragraphs Progress</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {completedParagraphs.toLocaleString()} / {totalParagraphs.toLocaleString()} <span style={{ color: '#10B981', fontSize: '0.8rem' }}>({percent}%)</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>API Calls (6 Chunks)</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {currentChunkIdx} / {totalChunks}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={11} />
            <span>Time Elapsed</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {formatElapsed(elapsedSeconds)}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Estimated Remaining (ETA)</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: etaText !== '--' ? '#38BDF8' : 'inherit' }}>
            {etaText}
          </div>
        </div>
      </div>

      {/* Errors List */}
      {errors.length > 0 && (
        <div style={{ marginTop: '0.75rem', padding: '0.65rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#EF4444', fontSize: '0.8rem' }}>
          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
            <AlertCircle size={14} />
            <span>{errors.length} Batch Slicing Notice(s)</span>
          </div>
          <div style={{ maxHeight: '80px', overflowY: 'auto' }}>
            {errors.map((err, i) => (
              <div key={i} style={{ marginBottom: '0.2rem' }}>• {err}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

