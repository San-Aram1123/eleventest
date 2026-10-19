import React, { useState } from 'react';
import { AlignmentData } from '../types';
import { Clock, Eye, Layers } from 'lucide-react';

interface AlignmentTimelineProps {
  alignment?: AlignmentData | null;
  currentTime?: number;
  onSeekTime?: (time: number) => void;
}

export const AlignmentTimeline: React.FC<AlignmentTimelineProps> = ({
  alignment,
  currentTime = 0,
  onSeekTime
}) => {
  const [viewMode, setViewMode] = useState<'chars' | 'table'>('chars');

  if (!alignment || !alignment.characters || alignment.characters.length === 0) {
    return (
      <div className="alignment-empty-state">
        <Clock size={16} className="text-dim" />
        <span>No timing/alignment metadata returned for this generation.</span>
      </div>
    );
  }

  const chars = alignment.characters;
  const startTimes = alignment.character_start_times_seconds || [];
  const endTimes = alignment.character_end_times_seconds || [];

  return (
    <div className="alignment-root">
      <div className="alignment-header">
        <div className="alignment-title">
          <Clock size={15} className="text-cyan" />
          <span>ElevenLabs Character Alignment ({chars.length} characters)</span>
        </div>

        <div className="alignment-toggle">
          <button
            className={`toggle-pill ${viewMode === 'chars' ? 'active' : ''}`}
            onClick={() => setViewMode('chars')}
          >
            <Eye size={12} />
            <span>Interactive</span>
          </button>
          <button
            className={`toggle-pill ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <Layers size={12} />
            <span>Data</span>
          </button>
        </div>
      </div>

      {viewMode === 'chars' ? (
        <div className="alignment-chars-stream" dir="rtl">
          {chars.map((char, index) => {
            const start = startTimes[index] ?? 0;
            const end = endTimes[index] ?? (start + 0.05);
            const isActive = currentTime >= start && currentTime <= end;
            const isPassed = currentTime > end;

            return (
              <span
                key={index}
                className={`align-char-chip ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                onClick={() => onSeekTime && onSeekTime(start)}
                title={`${char} (${start.toFixed(2)}s - ${end.toFixed(2)}s)`}
              >
                {char === ' ' ? '\u00A0' : char}
                <span className="char-timestamp">{start.toFixed(2)}s</span>
              </span>
            );
          })}
        </div>
      ) : (
        <div className="alignment-table-wrapper">
          <table className="alignment-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Char</th>
                <th>Start (s)</th>
                <th>End (s)</th>
                <th>Duration (ms)</th>
              </tr>
            </thead>
            <tbody>
              {chars.map((char, i) => {
                const start = startTimes[i] ?? 0;
                const end = endTimes[i] ?? 0;
                const dur = Math.round((end - start) * 1000);
                return (
                  <tr key={i} onClick={() => onSeekTime && onSeekTime(start)} style={{ cursor: 'pointer' }}>
                    <td>{i + 1}</td>
                    <td className="kurdish-cell">{char}</td>
                    <td>{start.toFixed(3)}</td>
                    <td>{end.toFixed(3)}</td>
                    <td>{dur}ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .alignment-root {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .alignment-empty-state {
          padding: 12px;
          background: var(--bg-box);
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alignment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .alignment-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .text-cyan {
          color: #38BDF8;
        }

        .alignment-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--bg-box);
          padding: 2px;
          border-radius: var(--radius-sm);
        }

        .toggle-pill {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        .toggle-pill.active {
          background: #0284C7;
          color: #fff;
        }

        .alignment-chars-stream {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          max-height: 180px;
          overflow-y: auto;
          padding: 8px;
          background: var(--bg-box-subtle);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .align-char-chip {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: var(--font-kurdish);
          font-size: 1.15rem;
          min-width: 26px;
          height: 42px;
          padding: 2px 4px;
          border-radius: var(--radius-sm);
          background: var(--bg-box);
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
          cursor: pointer;
          transition: all 0.1s ease;
          position: relative;
        }

        .align-char-chip:hover {
          background: rgba(56, 189, 248, 0.25);
          border-color: #38BDF8;
        }

        .align-char-chip.active {
          background: #0284C7;
          border-color: #38BDF8;
          color: #fff;
          transform: scale(1.12);
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.8);
          z-index: 5;
        }

        .align-char-chip.passed {
          opacity: 0.6;
        }

        .char-timestamp {
          font-family: var(--font-mono);
          font-size: 0.58rem;
          color: var(--text-dim);
          line-height: 1;
        }

        .align-char-chip.active .char-timestamp {
          color: #BAE6FD;
        }

        .alignment-table-wrapper {
          max-height: 180px;
          overflow-y: auto;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .alignment-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.78rem;
          font-family: var(--font-mono);
          text-align: left;
        }

        .alignment-table th {
          background: var(--bg-box);
          padding: 6px 10px;
          color: var(--text-muted);
          position: sticky;
          top: 0;
        }

        .alignment-table td {
          padding: 5px 10px;
          border-top: 1px solid var(--border-subtle);
          color: var(--text-main);
        }

        .alignment-table tr:hover td {
          background: rgba(56, 189, 248, 0.1);
        }

        .kurdish-cell {
          font-family: var(--font-kurdish);
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};
