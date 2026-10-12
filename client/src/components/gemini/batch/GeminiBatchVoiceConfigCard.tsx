import React, { useState } from 'react';
import { Volume2, Shuffle, Mic, Dices } from 'lucide-react';
import { KurdishDialect, GeminiVoice, GeminiBatchItem } from '../../../types';

interface GeminiBatchVoiceConfigCardProps {
  dialect: KurdishDialect;
  onDialectChange: (d: KurdishDialect) => void;
  voices: GeminiVoice[];
  batchVoiceMode: 'fixed' | 'random_female' | 'random_male' | 'mix_gender';
  setBatchVoiceMode: (m: 'fixed' | 'random_female' | 'random_male' | 'mix_gender') => void;
  onRandomizeVoices: (gender: 'Female' | 'Male') => void;
  onRandomizeMixVoices: () => void;
  selectedVoice: string;
  setSelectedVoice: (v: string) => void;
  setBatchItems: React.Dispatch<React.SetStateAction<GeminiBatchItem[]>>;
  batchDelayMs: number;
  setBatchDelayMs: (ms: number) => void;
  autoResumeEnabled: boolean;
  setAutoResumeEnabled: (val: boolean) => void;
  autoResumeMinutes: number;
  setAutoResumeMinutes: (m: number) => void;
  addToast: (t: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const GeminiBatchVoiceConfigCard: React.FC<GeminiBatchVoiceConfigCardProps> = ({
  dialect,
  onDialectChange,
  voices,
  batchVoiceMode,
  setBatchVoiceMode,
  onRandomizeVoices,
  onRandomizeMixVoices,
  selectedVoice,
  setSelectedVoice,
  setBatchItems,
  batchDelayMs,
  setBatchDelayMs,
  autoResumeEnabled,
  setAutoResumeEnabled,
  autoResumeMinutes,
  setAutoResumeMinutes,
  addToast
}) => {
  const [fixedGenderFilter, setFixedGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');

  return (
    <div className="card">
      <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 size={18} className="text-cyan" />
          <span className="card-title">Batch Voice & Dialect Strategy</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className={`btn btn-xs ${dialect === 'sorani' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onDialectChange('sorani')}>Sorani</button>
          <button type="button" className={`btn btn-xs ${dialect === 'badini' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onDialectChange('badini')}>Badini</button>
        </div>
      </div>
      <div className="card-body">
        <label className="field-label" style={{ marginBottom: '6px', display: 'block' }}>Paragraph Voice Allocation Mode:</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '12px' }}>
          <button type="button" className={`btn btn-xs ${batchVoiceMode === 'random_female' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onRandomizeVoices('Female')} style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderRadius: 'var(--radius-sm)', border: batchVoiceMode === 'random_female' ? '1px solid #EC4899' : '1px solid rgba(236, 72, 153, 0.3)', background: batchVoiceMode === 'random_female' ? 'rgba(236, 72, 153, 0.22)' : 'rgba(236, 72, 153, 0.05)', color: '#F472B6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}><Shuffle size={13} /><span>♀ Random Female</span></div>
            <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>{voices.filter(v => v.gender === 'Female').length} Voices</span>
          </button>
          <button type="button" className={`btn btn-xs ${batchVoiceMode === 'random_male' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onRandomizeVoices('Male')} style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderRadius: 'var(--radius-sm)', border: batchVoiceMode === 'random_male' ? '1px solid #38BDF8' : '1px solid rgba(56, 189, 248, 0.3)', background: batchVoiceMode === 'random_male' ? 'rgba(56, 189, 248, 0.22)' : 'rgba(56, 189, 248, 0.05)', color: '#38BDF8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}><Shuffle size={13} /><span>♂ Random Male</span></div>
            <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>{voices.filter(v => v.gender === 'Male').length} Voices</span>
          </button>
          <button type="button" className={`btn btn-xs ${batchVoiceMode === 'mix_gender' ? 'btn-primary' : 'btn-ghost'}`} onClick={onRandomizeMixVoices} style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderRadius: 'var(--radius-sm)', border: batchVoiceMode === 'mix_gender' ? '1px solid #10B981' : '1px solid rgba(16, 185, 129, 0.3)', background: batchVoiceMode === 'mix_gender' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.05)', color: '#34D399' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}><Shuffle size={13} /><span>⚥ Mix (50/50)</span></div>
            <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>Balanced</span>
          </button>
          <button type="button" className={`btn btn-xs ${batchVoiceMode === 'fixed' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => {
            setBatchVoiceMode('fixed');
            setBatchItems(prev => prev.map(it => it.status === 'completed' ? it : { ...it, voiceName: selectedVoice, voiceGender: voices.find(v => v.id === selectedVoice)?.gender === 'Female' ? 'Female' : 'Male' }));
            addToast({ type: 'info', title: 'Single Voice Mode', message: `Using voice '${selectedVoice}'.` });
          }} style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', borderRadius: 'var(--radius-sm)', border: batchVoiceMode === 'fixed' ? '1px solid #A855F7' : '1px solid rgba(168, 85, 247, 0.3)', background: batchVoiceMode === 'fixed' ? 'rgba(168, 85, 247, 0.22)' : 'rgba(168, 85, 247, 0.05)', color: '#C084FC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}><Mic size={13} /><span>Fixed Voice</span></div>
            <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>{selectedVoice}</span>
          </button>
        </div>

        {/* Dynamic Mode Banners */}
        {batchVoiceMode === 'random_female' && (
          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.25)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F472B6' }}>✨ Strictly Female Voices (0% Male Mixed)</span>
              <button type="button" className="btn btn-xs" onClick={() => onRandomizeVoices('Female')} style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#F472B6', border: '1px solid rgba(236, 72, 153, 0.4)', fontSize: '0.73rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Dices size={13} /><span>Re-shuffle</span>
              </button>
            </div>
          </div>
        )}

        {batchVoiceMode === 'random_male' && (
          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38BDF8' }}>✨ Strictly Male Voices (0% Female Mixed)</span>
              <button type="button" className="btn btn-xs" onClick={() => onRandomizeVoices('Male')} style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.4)', fontSize: '0.73rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Dices size={13} /><span>Re-shuffle</span>
              </button>
            </div>
          </div>
        )}

        {batchVoiceMode === 'mix_gender' && (
          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#34D399' }}>✨ Balanced Mix Gender (50% Female / 50% Male)</span>
              <button type="button" className="btn btn-xs" onClick={onRandomizeMixVoices} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.4)', fontSize: '0.73rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Dices size={13} /><span>Re-shuffle</span>
              </button>
            </div>
          </div>
        )}

        {batchVoiceMode === 'fixed' && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Choose Fixed Voice:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button type="button" className={`btn btn-xs ${fixedGenderFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFixedGenderFilter('all')} style={{ fontSize: '0.7rem', padding: '1px 6px' }}>All</button>
                <button type="button" className={`btn btn-xs ${fixedGenderFilter === 'Male' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFixedGenderFilter('Male')} style={{ fontSize: '0.7rem', padding: '1px 6px', color: '#60A5FA' }}>♂ Male</button>
                <button type="button" className={`btn btn-xs ${fixedGenderFilter === 'Female' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFixedGenderFilter('Female')} style={{ fontSize: '0.7rem', padding: '1px 6px', color: '#F472B6' }}>♀ Female</button>
              </div>
            </div>
            <div className="voice-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
              {voices.filter(v => fixedGenderFilter === 'all' || v.gender === fixedGenderFilter).map((v) => (
                <div key={v.id} className={`voice-card ${selectedVoice === v.id ? 'voice-card-active' : ''}`} onClick={() => {
                  setSelectedVoice(v.id);
                  setBatchItems(prev => prev.map(it => it.status === 'completed' ? it : { ...it, voiceName: v.id, voiceGender: v.gender === 'Female' ? 'Female' : 'Male' }));
                }} style={{ padding: '6px 8px' }}>
                  <div className="voice-card-top" style={{ marginBottom: 0 }}>
                    <strong className="voice-name" style={{ fontSize: '0.8rem' }}>{v.name}</strong>
                    <span className={`gender-badge ${v.gender === 'Female' ? 'badge-pink' : 'badge-blue'}`} style={{ fontSize: '0.62rem', padding: '1px 4px' }}>{v.gender === 'Female' ? '♀' : '♂'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pacing & AutoResume */}
        <div className="config-sub-card" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🛡️ Delay Between Lines:</span>
          <select className="input-control" value={batchDelayMs} onChange={(e) => setBatchDelayMs(Number(e.target.value))} style={{ width: 'auto', padding: '2px 8px', fontSize: '0.78rem', height: '28px' }}>
            <option value={600}>0.6s (Fast)</option>
            <option value={1000}>1.0s (Optimal)</option>
            <option value={1500}>1.5s (Conservative)</option>
            <option value={3000}>3.0s (Safe)</option>
          </select>
        </div>

        <div className="config-sub-card" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-main)', userSelect: 'none' }}>
            <input type="checkbox" checked={autoResumeEnabled} onChange={(e) => {
              setAutoResumeEnabled(e.target.checked);
              localStorage.setItem('gemini_auto_resume_enabled', String(e.target.checked));
            }} style={{ accentColor: '#38BDF8', width: '15px', height: '15px' }} />
            <span>🔄 Auto-Resume on Rate Limit / Cooldown</span>
          </label>
          {autoResumeEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Wait:</span>
              <select className="input-control" value={autoResumeMinutes} onChange={(e) => {
                const val = Number(e.target.value);
                setAutoResumeMinutes(val);
                localStorage.setItem('gemini_auto_resume_minutes', String(val));
              }} style={{ width: 'auto', padding: '2px 8px', fontSize: '0.78rem', height: '28px' }}>
                <option value={1}>1 min</option>
                <option value={2}>2 min (Recommended)</option>
                <option value={3}>3 min</option>
                <option value={5}>5 min</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
