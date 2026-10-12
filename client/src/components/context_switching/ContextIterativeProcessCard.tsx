import React, { useState } from 'react';
import { RotateCcw, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Cpu, Activity, Sparkles } from 'lucide-react';
import { IterativeAttemptLog } from '../../services/contextSwitchingApi';

interface ContextIterativeProcessCardProps {
  attempts: IterativeAttemptLog[];
}

export const ContextIterativeProcessCard: React.FC<ContextIterativeProcessCardProps> = ({ attempts }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!attempts || attempts.length === 0) return null;

  const successfulAttempt = attempts.find(a => a.status === 'success') || attempts[attempts.length - 1];

  return (
    <div
      className="glass-card"
      style={{
        padding: '0.9rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.04) 0%, rgba(15, 23, 42, 0.4) 100%)'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8'
            }}
          >
            <RotateCcw size={14} className={attempts.length > 1 ? 'spin-slow' : ''} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0f9ff' }}>
                Try-Try-Try Iterative Process Log
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38BDF8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontWeight: 600
                }}
              >
                {attempts.length} {attempts.length === 1 ? 'Attempt' : 'Attempts'} Evaluated
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Duration-Targeted Optimization • Converged at Attempt {successfulAttempt.attemptNumber} (Score: {successfulAttempt.score}%)
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded Attempt Timeline */}
      {isExpanded && (
        <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {attempts.map((att) => {
            const isSuccess = att.status === 'success';
            const badgeColor = isSuccess ? '#10B981' : '#F59E0B';

            return (
              <div
                key={att.attemptNumber}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  background: isSuccess ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.08rem 0.35rem',
                        borderRadius: '3px',
                        background: `${badgeColor}22`,
                        color: badgeColor,
                        border: `1px solid ${badgeColor}44`
                      }}
                    >
                      Attempt #{att.attemptNumber}
                    </span>
                    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#e2e8f0' }}>
                      {att.strategy}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', color: badgeColor, fontWeight: 700 }}>
                      Score: {att.score}%
                    </span>
                    {isSuccess ? (
                      <CheckCircle2 size={13} style={{ color: '#10B981' }} />
                    ) : (
                      <AlertCircle size={13} style={{ color: '#F59E0B' }} />
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: isSuccess ? '#a7f3d0' : '#cbd5e1', marginBottom: '0.35rem' }}>
                  {att.reason}
                </div>

                {/* Slices snapshot */}
                {att.segments && att.segments.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {att.segments.map((seg, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: '0.67rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '3px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          color: '#94a3b8'
                        }}
                      >
                        L{seg.index}: <strong style={{ color: '#e2e8f0' }}>{seg.duration.toFixed(2)}s</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

