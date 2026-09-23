import React from 'react';
import { User, Mic, Hash, Layers, Shuffle, CheckCircle2 } from 'lucide-react';
import { SPEAKER_PRESETS, MALE_SPEAKER_PRESETS, FEMALE_SPEAKER_PRESETS } from './pairedConstants';

interface SpeakerConfigSectionProps {
  speakerId: string;
  onSpeakerIdChange: (val: string) => void;
  voiceName: string;
  onVoiceNameChange: (val: string) => void;
  startIdx: number;
  onStartIdxChange: (val: number) => void;
  randomizeVoices: boolean;
  onRandomizeVoicesChange: (val: boolean) => void;
}

export const SpeakerConfigSection: React.FC<SpeakerConfigSectionProps> = ({
  speakerId,
  onSpeakerIdChange,
  voiceName,
  onVoiceNameChange,
  startIdx,
  onStartIdxChange,
  randomizeVoices,
  onRandomizeVoicesChange
}) => {
  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = SPEAKER_PRESETS.find(p => p.id === e.target.value);
    if (selected) {
      onSpeakerIdChange(selected.id);
      onVoiceNameChange(selected.voice);
    }
  };

  const previewFamilyId = `${speakerId || 'spk01'}_${String(startIdx || 1).padStart(3, '0')}`;

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} className="text-primary" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Speaker & Voice Selection</h3>
        </div>
        <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '0.75rem' }}>
          Rule: 1 Speaker per family
        </span>
      </div>

      {/* Voice Mode Selector: Fixed vs 50/50 Balanced */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => onRandomizeVoicesChange(false)}
          className={`btn btn-sm ${!randomizeVoices ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
        >
          <User size={14} /> Fixed Single Speaker
        </button>
        <button
          type="button"
          onClick={() => onRandomizeVoicesChange(true)}
          className={`btn btn-sm ${randomizeVoices ? 'btn-primary' : 'btn-secondary'}`}
          style={{
            fontSize: '0.8rem',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            background: randomizeVoices ? 'linear-gradient(135deg, #0284c7 0%, #a855f7 100%)' : undefined
          }}
        >
          <Shuffle size={14} /> Randomize 50/50 Male & Female
        </button>
      </div>

      {randomizeVoices ? (
        <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.3)', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem' }}>
            <CheckCircle2 size={16} />
            <span>50% Male / 50% Female Voice Balancing Active</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
            Sentence families will alternate between <strong>10 Male voices</strong> (Puck, Fenrir, Orus, Enceladus, Iapetus...) and <strong>10 Female voices</strong> (Aoede, Zephyr, Leda, Kore, Callirrhoe...). Each family strictly keeps the same assigned voice across all its emotion takes!
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.72rem' }}>
            <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              Family 1: spk01 (Puck ♂)
            </span>
            <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
              Family 2: spk02 (Aoede ♀)
            </span>
            <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              Family 3: spk03 (Fenrir ♂)
            </span>
            <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
              Family 4: spk04 (Zephyr ♀)...
            </span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
              <Layers size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Speaker Preset (spk01 - spk20)
            </label>
            <select className="input-select" value={speakerId} onChange={handlePresetSelect} style={{ width: '100%' }}>
              {SPEAKER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.gender.toUpperCase()} ({p.description})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
              <User size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Speaker Name / Code
            </label>
            <input
              type="text"
              className="input-text"
              value={speakerId}
              onChange={(e) => onSpeakerIdChange(e.target.value.trim().toLowerCase())}
              placeholder="e.g. spk01"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
              <Mic size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Gemini TTS Voice
            </label>
            <input
              type="text"
              className="input-text"
              value={voiceName}
              onChange={(e) => onVoiceNameChange(e.target.value.trim())}
              placeholder="e.g. Puck, Aoede, Fenrir"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      {/* Starting Sentence Number */}
      <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
            <Hash size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Starting Sentence Index
          </label>
          <input
            type="number"
            min={1}
            max={9999}
            className="input-text"
            value={startIdx}
            onChange={(e) => onStartIdxChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
            style={{ width: '100%', maxWidth: '160px' }}
          />
        </div>

        <div style={{ flex: 2, padding: '0.5rem 0.8rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', fontSize: '0.8rem' }}>
          <span style={{ color: '#94a3b8' }}>First Family ID: </span>
          <code style={{ color: '#38bdf8', fontWeight: 600 }}>{randomizeVoices ? `spk01_${String(startIdx || 1).padStart(3, '0')}` : previewFamilyId}</code>
          <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>
            ({randomizeVoices ? '50/50 alternating' : 'fixed voice'})
          </span>
        </div>
      </div>
    </div>
  );
};
