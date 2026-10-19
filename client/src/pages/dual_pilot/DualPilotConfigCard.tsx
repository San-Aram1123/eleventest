import React from 'react';
import { AudioLines, ChevronDown, Globe2, Layers3, Sparkles, Database, ArrowRight } from 'lucide-react';
import './dualPilotConfig.css';
import { DualPilotConfig, DUAL_PILOT_LANGUAGES } from './dualPilotTypes';
import { FALLBACK_ELEVEN_VOICES, GeminiVoiceInfo } from './dualPilotApi';
interface Voice { voice_id: string; name: string; category?: string; labels?: { gender?: string } }
interface Props {
  config: DualPilotConfig; onChangeConfig: (update: (previous: DualPilotConfig) => DualPilotConfig) => void;
  geminiVoices: Array<string | GeminiVoiceInfo>; elevenVoices: Voice[]; disabled?: boolean;
}
export const DualPilotConfigCard: React.FC<Props> = ({ config, onChangeConfig, geminiVoices, elevenVoices, disabled }) => {
  const gemini = geminiVoices.map(voice => typeof voice === 'string' ? { id: voice, name: voice, gender: '' } : voice);
  const slots = config.elevenVoiceSlots || Array.from({ length: 6 }, (_, index) => {
    const voice = FALLBACK_ELEVEN_VOICES[index % 2 === 0 ? index / 2 : 3 + Math.floor(index / 2)];
    return { voiceId: voice.voice_id, voiceName: voice.name };
  });
  return <section className="glass-card dp-config" aria-label="Generation configuration">
    <div className="dp-config-toolbar">
      <div className="dp-config-title"><span className="dp-config-icon"><Layers3 size={19} /></span>
        <div><h3>Generation setup</h3><p>Choose your language and voice cast.</p></div>
      </div>
      <span className="dp-config-pill"><span />Automatic emotion batch</span>
    </div>
    <div className="dp-config-settings">
      <label className="dp-config-language"><span><Globe2 size={14} />Dataset language</span>
        <div className="dp-config-select-wrap"><select className="dp-config-select" disabled={disabled} value={config.language}
          onChange={event => onChangeConfig(previous => ({ ...previous, language: event.target.value as DualPilotConfig['language'] }))}>
          {DUAL_PILOT_LANGUAGES.map(language => <option key={language.id} value={language.id}>{language.name}</option>)}
        </select><ChevronDown size={15} /></div>
      </label>
      <label className="dp-config-save"><span className="dp-config-save-icon"><Database size={18} /></span>
        <span><strong>Save to dataset</strong><small>Keep generated takes in Dataset Manager</small></span>
        <input type="checkbox" className="dp-config-toggle" disabled={disabled} checked={config.saveToDataset !== false}
          onChange={event => onChangeConfig(previous => ({ ...previous, saveToDataset: event.target.checked }))} />
      </label>
    </div>
    <div className="dp-config-flow" aria-label="Batch order">
      <span><strong>6</strong> sentences</span><ArrowRight size={14}/><span><strong>50</strong> emotions</span>
      <ArrowRight size={14}/><span>Next batch</span><small>Separate text inputs for each provider</small>
    </div>
    <div className="dp-config-providers">
      <section className="dp-config-provider dp-config-gemini" aria-label="Gemini voices">
        <div className="dp-config-provider-heading"><span className="dp-config-provider-icon"><Sparkles size={19}/></span>
          <div><h4>Gemini</h4><p>One master, six sliced takes</p></div><span className="dp-config-model">3.8 Flash TTS</span>
        </div>
        <div className="dp-config-voice-grid dp-config-pair">
    {(['female', 'male'] as const).map(gender => {
      const field = gender === 'female' ? 'geminiFemaleVoice' : 'geminiMaleVoice';
      const filtered = gemini.filter(voice => voice.gender?.toLowerCase() === gender);
      const options = filtered.length ? filtered : gemini;
      return <label key={gender} className={`dp-config-voice dp-config-${gender}`}>
        <span className="dp-config-voice-label"><span className="dp-config-avatar">{gender === 'female' ? 'F' : 'M'}</span>
          <span>{gender === 'female' ? 'Female voice' : 'Male voice'}<small>Sentences {gender === 'female' ? '1, 3, 5' : '2, 4, 6'}</small></span>
        </span>
        <div className="dp-config-select-wrap"><select className="dp-config-select" disabled={disabled} value={config[field]}
          onChange={event => onChangeConfig(previous => ({ ...previous, [field]: event.target.value }))}>
          {options.map(voice => <option key={voice.id} value={voice.id}>{voice.name || voice.id}</option>)}
        </select><ChevronDown size={14}/></div>
      </label>;
    })}
        </div>
        <p className="dp-config-provider-note">The same voice pair stays assigned across all 50 emotions.</p>
        <div className="dp-config-provider-footer"><span className="dp-config-status-dot"/>Existing slicers enabled<span>6 sentences / call</span></div>
      </section>
      <section className="dp-config-provider dp-config-eleven" aria-label="ElevenLabs voices">
        <div className="dp-config-provider-heading"><span className="dp-config-provider-icon"><AudioLines size={19}/></span>
          <div><h4>ElevenLabs</h4><p>A dedicated voice for each sentence</p></div><span className="dp-config-model">v4 Turbo</span>
        </div>
        <div className="dp-config-voice-grid dp-config-six">
      {slots.map((slot, index) => {
        const gender = index % 2 === 0 ? 'female' : 'male';
        const knownIds = new Set(FALLBACK_ELEVEN_VOICES.filter(voice => voice.category === gender).map(voice => voice.voice_id));
        const filtered = elevenVoices.filter(voice => voice.labels?.gender === gender || voice.category === gender || knownIds.has(voice.voice_id));
        const options = filtered.length ? filtered : elevenVoices;
        return <label key={index} className={`dp-config-voice dp-config-${gender}`}>
          <span className="dp-config-voice-label"><span className="dp-config-avatar">{String(index + 1).padStart(2, '0')}</span>
            <span>Speaker {index + 1}<small>{gender === 'female' ? 'Female' : 'Male'}</small></span>
          </span>
          <div className="dp-config-select-wrap"><select className="dp-config-select" disabled={disabled}
          value={slot.voiceId} onChange={event => {
            const voice = elevenVoices.find(item => item.voice_id === event.target.value);
            onChangeConfig(previous => ({ ...previous, elevenVoiceSlots: slots.map((item, position) => position === index
              ? { voiceId: event.target.value, voiceName: voice?.name || event.target.value } : item) }));
          }}>
          {!options.some(voice => voice.voice_id === slot.voiceId) && <option value={slot.voiceId}>{slot.voiceName}</option>}
          {options.map(voice => <option key={voice.voice_id} value={voice.voice_id}>{voice.name}</option>)}
        </select><ChevronDown size={14}/></div></label>;
      })}
        </div>
        <div className="dp-config-provider-footer"><span className="dp-config-status-dot"/>Alternating female / male<span>1 sentence / call</span></div>
      </section>
    </div>
  </section>;
};
