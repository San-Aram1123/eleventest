import React, { useState } from 'react';
import { Play, Pause, Download, Trash2, Code, ShieldCheck, CheckCircle2, Volume2, User } from 'lucide-react';
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
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '10px',
      padding: '1rem',
      marginBottom: '0.75rem',
      transition: 'border-color 0.2s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        {/* Play & Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => onTogglePlay(take)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: isPlaying ? '#EF4444' : '#6366F1',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)'
            }}
            title={isPlaying ? 'Pause' : 'Play Take'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#F8FAFC' }}>
                {take.id}
              </span>
              <span style={{ fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818CF8', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                {take.scriptId}
              </span>
              <span style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.08)', color: '#94A3B8', padding: '1px 6px', borderRadius: '4px' }}>
                {take.duration.toFixed(2)}s
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.78rem', color: '#94A3B8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <User size={13} /> {take.speakerName} ({take.speakerGender})
              </span>
              <span>•</span>
              <span style={{ textTransform: 'capitalize', color: '#F1F5F9', fontWeight: 500 }}>
                {take.emotion} ({take.intensityLabel})
              </span>
              <span>•</span>
              <span style={{ color: '#38BDF8', fontWeight: 500 }}>
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
            style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Inspect Audar JSONL record"
          >
            <Code size={13} />
            {showJson ? 'Hide JSON' : 'Audar JSON'}
          </button>

          <button
            onClick={downloadWav}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            title="Download 24kHz Mono WAV"
          >
            <Download size={13} />
          </button>

          <button
            onClick={() => onDelete(take.id)}
            className="btn btn-danger btn-sm"
            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            title="Remove take"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Transcript Text */}
      <div style={{
        marginTop: '0.75rem',
        padding: '0.6rem 0.85rem',
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '6px',
        fontSize: '0.92rem',
        direction: 'rtl',
        fontFamily: 'Noto Naskh Arabic, Tahoma, sans-serif',
        color: '#E2E8F0',
        lineHeight: 1.6
      }}>
        {take.transcript}
      </div>

      {/* Audar Verification Tag & Review Rubric */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.6rem',
        fontSize: '0.74rem',
        color: '#94A3B8',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ShieldCheck size={14} style={{ color: '#10B981' }} />
          <span>Audar Review:</span>
          <span style={{ color: '#10B981', fontWeight: 600 }}>
            Emotion ✓ | Delivery ✓ | Int: {take.review.intensity_level} | Naturalness: {take.review.naturalness}/5
          </span>
        </div>
        <div style={{ color: '#64748B' }}>
          Format: 24kHz Lossless WAV (ckb)
        </div>
      </div>

      {/* JSON Schema Inspection View */}
      {showJson && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#818CF8', fontWeight: 600, marginBottom: '4px' }}>
            Audar Canonical data.jsonl Record:
          </div>
          <pre style={{
            background: '#0F172A',
            color: '#38BDF8',
            padding: '0.75rem',
            borderRadius: '6px',
            fontSize: '0.72rem',
            overflowX: 'auto',
            maxHeight: '220px',
            margin: 0
          }}>
            {audarJson}
          </pre>
        </div>
      )}
    </div>
  );
};

