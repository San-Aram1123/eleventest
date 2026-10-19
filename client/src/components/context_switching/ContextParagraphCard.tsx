import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { Sample } from '../../types';

export interface ParagraphItem {
  id: string;
  text: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  audioUrl?: string | null;
  durationSeconds?: number;
  sample?: Sample | null;
  error?: string | null;
}

interface ContextParagraphCardProps {
  index: number;
  item: ParagraphItem;
  selectedEmotion: string;
  selectedVoice: string;
}

export const ContextParagraphCard: React.FC<ContextParagraphCardProps> = ({
  index,
  item,
  selectedEmotion,
  selectedVoice
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioEl) {
        audioEl.pause();
      }
    };
  }, [audioEl]);

  const handleTogglePlay = () => {
    if (!item.audioUrl) return;
    if (isPlaying && audioEl) {
      audioEl.pause();
      setIsPlaying(false);
    } else {
      const audio = audioEl || new Audio(item.audioUrl);
      if (!audioEl) setAudioEl(audio);
      audio.onended = () => setIsPlaying(false);
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const hasKurdish = /[\u0600-\u06FF]/.test(item.text) && /[ۆێەژڵڕڤگچپ]/.test(item.text);
  const hasEnglish = /[a-zA-Z]/.test(item.text);
  const hasArabic = /[\u0600-\u06FF]/.test(item.text);

  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: '1rem', 
        marginBottom: '0.75rem',
        border: item.status === 'generating' 
          ? '1px solid #3B82F6' 
          : item.status === 'completed' 
          ? '1px solid rgba(16, 185, 129, 0.4)' 
          : item.status === 'error'
          ? '1px solid #EF4444'
          : '1px solid var(--border-subtle)',
        background: item.status === 'generating' 
          ? 'rgba(59, 130, 246, 0.05)' 
          : item.status === 'completed'
          ? 'rgba(16, 185, 129, 0.03)'
          : 'var(--bg-box)'
      }}
    >
      {/* Top Meta Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span 
            className="badge" 
            style={{ 
              fontWeight: 700, 
              background: item.status === 'completed' ? '#10B98122' : '#3B82F622',
              color: item.status === 'completed' ? '#10B981' : '#3B82F6',
              border: item.status === 'completed' ? '1px solid #10B98155' : '1px solid #3B82F655'
            }}
          >
            Paragraph #{index + 1}
          </span>
          {hasKurdish && <span style={{ fontSize: '0.7rem', color: '#F59E0B' }}>🟡 Kurdish</span>}
          {hasEnglish && <span style={{ fontSize: '0.7rem', color: '#3B82F6' }}>🔵 English</span>}
          {hasArabic && <span style={{ fontSize: '0.7rem', color: '#10B981' }}>🟢 Arabic</span>}
        </div>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {item.status === 'idle' && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Queued</span>
          )}
          {item.status === 'generating' && (
            <span style={{ fontSize: '0.75rem', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <div className="spinner-sm" style={{ width: '12px', height: '12px' }} />
              Generating Call...
            </span>
          )}
          {item.status === 'completed' && (
            <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
              <CheckCircle2 size={13} />
              Saved to Dataset ({item.durationSeconds}s)
            </span>
          )}
          {item.status === 'error' && (
            <span style={{ fontSize: '0.75rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertCircle size={13} />
              Failed
            </span>
          )}
        </div>
      </div>

      {/* Paragraph Text Content */}
      <div 
        style={{ 
          fontSize: '0.92rem', 
          lineHeight: '1.6', 
          marginBottom: '0.75rem', 
          padding: '0.5rem 0.65rem',
          borderRadius: '6px',
          background: 'var(--bg-box-subtle)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-main)',
          wordBreak: 'break-word'
        }}
        dir="auto"
      >
        {item.text}
      </div>

      {/* Error notice if failed */}
      {item.status === 'error' && item.error && (
        <div style={{ color: '#EF4444', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
          {item.error}
        </div>
      )}

      {/* Action / Player Controls */}
      {item.status === 'completed' && item.audioUrl && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', paddingTop: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              onClick={handleTogglePlay} 
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '20px', padding: '0.3rem 0.75rem' }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <a 
              href={item.audioUrl} 
              download={`context_switch_p${index + 1}_${selectedEmotion}_${selectedVoice}.wav`} 
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
            >
              <Download size={13} />
              <span>Download WAV</span>
            </a>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {item.sample?.id ? `ID: #${item.sample.id} • ` : ''}Voice: {selectedVoice} • Emotion: {selectedEmotion}
          </div>
        </div>
      )}
    </div>
  );
};
