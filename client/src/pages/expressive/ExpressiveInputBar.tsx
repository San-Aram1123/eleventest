import React from 'react';
import { Volume2 } from 'lucide-react';
import { PilotSpeaker, PILOT_SPEAKERS, PILOT_DEFAULT_SENTENCES } from './expressiveConstants';

interface ExpressiveInputBarProps {
  selectedSpeaker: PilotSpeaker;
  onSelectSpeaker: (speaker: PilotSpeaker) => void;
  selectedSentenceId: string;
  sentenceText: string;
  onSelectSentence: (preset: { id: string; text: string }) => void;
  onChangeSentenceText: (text: string) => void;
  onGenerateNeutralReference: () => void;
  isGenerating: boolean;
}

export const ExpressiveInputBar: React.FC<ExpressiveInputBarProps> = ({
  selectedSpeaker,
  onSelectSpeaker,
  selectedSentenceId,
  sentenceText,
  onSelectSentence,
  onChangeSentenceText,
  onGenerateNeutralReference,
  isGenerating
}) => {
  return (
    <>
      {/* 1. Pilot Speaker Selection */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          marginBottom: '1rem',
          borderRadius: '16px',
          border: '1px solid var(--border-medium)',
          borderTop: '1px solid var(--border-specular)',
          backdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.28)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.92rem', letterSpacing: '-0.015em' }}>
            1. Select Pilot Speaker (4 Diversity Profiles)
          </span>
          <button
            onClick={onGenerateNeutralReference}
            disabled={isGenerating}
            className="btn btn-secondary btn-sm"
            style={{
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '9999px',
              padding: '6px 14px',
              background: 'rgba(48, 209, 88, 0.1)',
              border: '1px solid rgba(48, 209, 88, 0.3)',
              color: '#30D158',
              fontWeight: 600
            }}
          >
            <Volume2 size={14} />
            Record 2–4s Neutral Reference ({selectedSpeaker.voiceName})
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {PILOT_SPEAKERS.map(spk => {
            const isSelected = selectedSpeaker.id === spk.id;
            return (
              <div
                key={spk.id}
                onClick={() => onSelectSpeaker(spk)}
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid #0A84FF' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(10, 132, 255, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                  transition: 'all 120ms cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected ? '0 4px 14px rgba(10, 132, 255, 0.2)' : 'none'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isSelected ? '#FFFFFF' : 'var(--text-primary)' }}>{spk.name}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{spk.vocalRange}</div>
                <div style={{ fontSize: '0.72rem', color: isSelected ? '#0A84FF' : '#BF5AF2', marginTop: '4px', fontWeight: 600 }}>
                  Voice: {spk.voiceName} ({spk.gender})
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Kurdish Pilot Sentence */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          marginBottom: '1rem',
          borderRadius: '16px',
          border: '1px solid var(--border-medium)',
          borderTop: '1px solid var(--border-specular)',
          backdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.28)'
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '0.92rem', letterSpacing: '-0.015em', marginBottom: '0.65rem' }}>
          2. Kurdish Pilot Sentence (Script ID: {selectedSentenceId})
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
          {PILOT_DEFAULT_SENTENCES.map(s => {
            const isSelected = selectedSentenceId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSentence(s)}
                className="btn btn-sm"
                style={{
                  fontSize: '0.76rem',
                  borderRadius: '9999px',
                  padding: '5px 12px',
                  fontWeight: 600,
                  background: isSelected ? '#0A84FF' : 'rgba(255, 255, 255, 0.06)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? '0 2px 10px rgba(10, 132, 255, 0.4)' : 'none'
                }}
              >
                {s.id}
              </button>
            );
          })}
        </div>

        <textarea
          rows={2}
          value={sentenceText}
          onChange={e => onChangeSentenceText(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-medium)',
            borderRadius: '12px',
            color: 'var(--text-main)',
            padding: '10px 14px',
            direction: 'rtl',
            fontFamily: 'Noto Naskh Arabic, Tahoma, sans-serif',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            outline: 'none'
          }}
        />
      </div>
    </>
  );
};
