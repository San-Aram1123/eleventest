import React, { useState } from 'react';
import { Play, Pause, Download, Trash2, Code, ShieldCheck, User } from 'lucide-react';
import { ExpressiveTake, buildAudarRecord } from './expressiveConstants';

interface ExpressiveAudioCardProps {
  take: ExpressiveTake;
  isPlaying: boolean;
  onTogglePlay: (take: ExpressiveTake) => void;
  onDelete: (id: string) => void;
}

export const ExpressiveAudioCard: React.FC<ExpressiveAudioCardProps> = ({
  take,
  isPlaying,
  onTogglePlay,
  onDelete
}) => {
  const [showJson, setShowJson] = useState(false);

  const downloadWav = () => {
    if (take.audioBlobUrl) {
      const a = document.createElement('a');
      a.href = take.audioBlobUrl;
      a.download = `${take.id}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    if (!take.audioBase64) return;
    const byteCharacters = atob(take.audioBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${take.id}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const audarJson = JSON.stringify(buildAudarRecord(take), null, 2);

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid var(--border-medium)',
        borderTop: '1px solid var(--border-specular)',
        borderRadius: '14px',
        padding: '1rem',
        marginBottom: '0.75rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        transition: 'border-color 150ms ease, box-shadow 150ms ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.65rem' }}>
        {/* Play & Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => onTogglePlay(take)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: isPlaying ? 'linear-gradient(145deg, #FF453A, #D62B20)' : 'linear-gradient(145deg, #0A84FF, #0066CC)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderTop: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isPlaying ? '0 4px 14px rgba(255, 69, 58, 0.35)' : '0 4px 14px rgba(10, 132, 255, 0.35)',
              transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            title={isPlaying ? 'Pause' : 'Play Take'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
                {take.id}
              </span>
              <span style={{ fontSize: '0.7rem', background: 'rgba(10, 132, 255, 0.12)', color: '#0A84FF', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600, border: '1px solid rgba(10, 132, 255, 0.25)' }}>
                {take.scriptId}
              </span>
              <span style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '9999px', fontFamily: 'var(--font-mono)' }}>
                {take.duration.toFixed(2)}s
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <User size={13} /> {take.speakerName} ({take.speakerGender})
              </span>
              <span>•</span>
              <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)', fontWeight: 600 }}>
                {take.emotion} ({take.intensityLabel})
              </span>
              <span>•</span>
              <span style={{ color: '#0A84FF', fontWeight: 600 }}>
                {take.delivery === 'laughing_speech' ? 'Laughing' : take.delivery}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={() => setShowJson(!showJson)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '5px 11px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)' }}
            title="Inspect Audar JSONL record"
          >
            <Code size={13} />
            {showJson ? 'Hide JSON' : 'Audar JSON'}
          </button>

          <button
            onClick={downloadWav}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '5px 10px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)' }}
            title="Download 24kHz Mono WAV"
          >
            <Download size={13} />
          </button>

          <button
            onClick={() => onDelete(take.id)}
            className="btn btn-danger btn-sm"
            style={{ fontSize: '0.74rem', padding: '5px 10px', borderRadius: '9999px' }}
            title="Remove take"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Transcript Text */}
      <div style={{
        marginTop: '0.75rem',
        padding: '0.65rem 0.95rem',
        background: 'var(--bg-box)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        fontSize: '0.92rem',
        direction: 'rtl',
        fontFamily: 'Noto Naskh Arabic, Tahoma, sans-serif',
        color: 'var(--text-primary)',
        lineHeight: 1.6
      }}>
        {take.transcript}
      </div>

      {/* Audar Verification Tag & Review Rubric */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.65rem',
        fontSize: '0.74rem',
        color: 'var(--text-tertiary)',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ShieldCheck size={14} style={{ color: '#30D158' }} />
          <span>Audar Review:</span>
          <span style={{ color: '#30D158', fontWeight: 600 }}>
            Emotion ✓ | Delivery ✓ | Int: {take.review.intensity_level} | Naturalness: {take.review.naturalness}/5
          </span>
        </div>
        <div style={{ color: 'var(--text-tertiary)' }}>
          Format: 24kHz Lossless WAV (ckb)
        </div>
      </div>

      {/* JSON Schema Inspection View */}
      {showJson && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#BF5AF2', fontWeight: 600, marginBottom: '4px' }}>
            Audar Canonical data.jsonl Record:
          </div>
          <pre style={{
            background: 'var(--bg-box-subtle)',
            color: 'var(--text-main)',
            padding: '0.85rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.72rem',
            overflowX: 'auto',
            maxHeight: '220px',
            margin: 0,
            fontFamily: 'var(--font-mono)'
          }}>
            {audarJson}
          </pre>
        </div>
      )}
    </div>
  );
};
