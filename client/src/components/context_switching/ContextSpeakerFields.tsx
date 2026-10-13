import React from 'react';
import { CONTEXT_VOICES } from '../../data/contextSwitchingPresets';

export const ContextSpeakerFields: React.FC<{
  speaker1Voice: string; speaker2Voice: string;
  onChangeSpeaker1: (value: string) => void; onChangeSpeaker2: (value: string) => void;
  disabled?: boolean;
}> = props => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.65rem', marginBottom: '1rem' }}>
  {[1, 2].map(speaker => <label key={speaker} style={{ fontSize: '.8rem', color: speaker === 1 ? '#93c5fd' : '#f472b6' }}>
    Speaker {speaker} ({speaker === 1 ? 'odd' : 'even'} lines)
    <select className="form-select" style={{ display: 'block', width: '100%', marginTop: '.35rem' }}
      value={speaker === 1 ? props.speaker1Voice : props.speaker2Voice} disabled={props.disabled}
      onChange={event => (speaker === 1 ? props.onChangeSpeaker1 : props.onChangeSpeaker2)(event.target.value)}>
      {CONTEXT_VOICES.map(voice => <option key={voice.id} value={voice.id}>{voice.name} ({voice.gender})</option>)}
    </select>
  </label>)}
</div>;
