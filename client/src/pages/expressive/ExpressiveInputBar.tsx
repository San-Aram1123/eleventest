import React from 'react';
import { Volume2, User, FileText } from 'lucide-react';
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
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem', background: 'var(--card-bg, #1e2230)', border: '1px solid var(--border-color, #2d3348)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F1F5F9' }}>
            1. Select Pilot Speaker (4 Diversity Profiles)
          </span>
          <button
            onClick={onGenerateNeutralReference}
            disabled={isGenerating}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Volume2 size={14} style={{ color: '#10B981' }} />
            Record 2–4s Neutral Reference ({selectedSpeaker.voiceName})
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {PILOT_SPEAKERS.map(spk => (
            <div
              key={spk.id}
              onClick={() => onSelectSpeaker(spk)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                border: selectedSpeaker.id === spk.id ? '2px solid #6366F1' : '1px solid rgba(255,255,255,0.08)',
                background: selectedSpeaker.id === spk.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#F8FAFC' }}>{spk.name}</div>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px' }}>{spk.vocalRange}</div>
              <div style={{ fontSize: '0.72rem', color: '#818CF8', marginTop: '4px' }}>Voice: {spk.voiceName} ({spk.gender})</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Kurdish Pilot Sentence */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem', background: 'var(--card-bg, #1e2230)', border: '1px solid var(--border-color, #2d3348)', borderRadius: '12px' }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F1F5F9', marginBottom: '0.5rem' }}>
          2. Kurdish Pilot Sentence (Script ID: {selectedSentenceId})
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {PILOT_DEFAULT_SENTENCES.map(s => (
            <button
              key={s.id}
              onClick={() => onSelectSentence(s)}
              className={`btn btn-sm ${selectedSentenceId === s.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.76rem' }}
            >
              {s.id}
            </button>
          ))}
        </div>

        <textarea
          rows={2}
          value={sentenceText}
          onChange={e => onChangeSentenceText(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: '#F8FAFC',
            padding: '8px 12px',
            direction: 'rtl',
            fontFamily: 'Noto Naskh Arabic, Tahoma, sans-serif',
            fontSize: '0.95rem'
          }}
        />
      </div>
    </>
  );
};

