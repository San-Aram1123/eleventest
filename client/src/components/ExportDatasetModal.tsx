import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  Sparkles, 
  FileArchive, 
  Filter, 
  Users, 
  Volume2, 
  Check, 
  Copy, 
  Radio, 
  Layers,
  Clock,
  HardDrive
} from 'lucide-react';
import { Sample, DatasetExportFilters } from '../types';
import { getZipExportUrl, getAudarZipExportUrl } from '../services/api';

interface ExportDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: Sample[];
  currentFilteredSamples: Sample[];
  availableVoices: { name: string; count: number }[];
  addToast?: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

type PresetType = 'all' | 'male' | 'female' | 'current' | 'custom';

// All 13 Google Gemini Female HD Voices
export const GEMINI_FEMALE_VOICES = new Set([
  'aoede', 'kore', 'zephyr', 'leda', 'callirrhoe', 'autonoe', 'despina', 
  'erinome', 'laomedeia', 'achernar', 'gacrux', 'vindemiatrix', 'sulafat'
]);

// All 17 Google Gemini Male HD Voices
export const GEMINI_MALE_VOICES = new Set([
  'puck', 'charon', 'fenrir', 'orus', 'enceladus', 'iapetus', 'umbriel', 
  'algieba', 'algenib', 'rasalgethi', 'alnilam', 'schedar', 'pulcherrima', 
  'achird', 'zubenelgenubi', 'sadachbia', 'sadaltager'
]);

// Helper to determine gender of any sample
export function getSampleGender(s: any): 'male' | 'female' {
  const g = String(
    s.voice_gender ||
    s.gender ||
    s.customMetadata?.voice_gender ||
    s.metadata_extra?.voice_gender ||
    ''
  ).toLowerCase().trim();

  if (g === 'male' || g === 'm') return 'male';
  if (g === 'female' || g === 'f') return 'female';

  const v = String(s.voice_name || s.voice_id || s.voiceName || s.voiceId || '').toLowerCase();
  const clean = v.replace(/^gemini[\s_]*\(?|\)$/gi, '').trim();

  if (GEMINI_FEMALE_VOICES.has(clean)) return 'female';
  if (GEMINI_MALE_VOICES.has(clean)) return 'male';

  for (const name of GEMINI_FEMALE_VOICES) {
    if (v.includes(name)) return 'female';
  }
  for (const name of GEMINI_MALE_VOICES) {
    if (v.includes(name)) return 'male';
  }

  // Common ElevenLabs female voices fallback
  if (v.includes('rachel') || v.includes('sarah') || v.includes('charlotte') || v.includes('alice') || v.includes('lily') || v.includes('nicole') || v.includes('glinda') || v.includes('mimi') || v.includes('freya') || v.includes('dorothy') || v.includes('serena')) {
    return 'female';
  }

  return 'male';
}

export const ExportDatasetModal: React.FC<ExportDatasetModalProps> = ({
  isOpen,
  onClose,
  samples,
  currentFilteredSamples,
  availableVoices,
  addToast
}) => {
  const [preset, setPreset] = useState<PresetType>('all');
  
  // Custom filter states
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterVoice, setFilterVoice] = useState<string>('all');
  const [filterDialect, setFilterDialect] = useState<string>('all');
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState<'raw' | 'audar' | null>(null);

  // Quick statistics across full dataset
  const { maleCount, femaleCount, soraniCount, badiniCount } = useMemo(() => {
    let m = 0;
    let f = 0;
    let sCount = 0;
    let bCount = 0;
    for (const s of samples) {
      if (getSampleGender(s) === 'male') m++;
      else f++;
      const d = String(s.dialect || 'sorani').toLowerCase();
      if (d === 'badini') bCount++;
      else sCount++;
    }
    return { maleCount: m, femaleCount: f, soraniCount: sCount, badiniCount: bCount };
  }, [samples]);

  // When clicking a preset, update filters accordingly
  const handleSelectPreset = (newPreset: PresetType) => {
    setPreset(newPreset);
    if (newPreset === 'all') {
      setFilterGender('all');
      setFilterVoice('all');
      setFilterDialect('all');
      setFilterEmotion('all');
      setFilterMethod('all');
    } else if (newPreset === 'male') {
      setFilterGender('male');
      setFilterVoice('all');
      setFilterDialect('all');
      setFilterEmotion('all');
      setFilterMethod('all');
    } else if (newPreset === 'female') {
      setFilterGender('female');
      setFilterVoice('all');
      setFilterDialect('all');
      setFilterEmotion('all');
      setFilterMethod('all');
    }
  };

  // Build the effective query filter object based on active preset / custom state
  const effectiveFilters: DatasetExportFilters = useMemo(() => {
    if (preset === 'current') {
      return {
        ids: currentFilteredSamples.map(s => s.id)
      };
    }
    if (preset === 'male') {
      return { gender: 'male' };
    }
    if (preset === 'female') {
      return { gender: 'female' };
    }
    if (preset === 'all') {
      return {};
    }

    // Custom preset:
    const f: DatasetExportFilters = {};
    if (filterGender !== 'all') f.gender = filterGender;
    if (filterVoice !== 'all') f.voice = filterVoice;
    if (filterDialect !== 'all') f.dialect = filterDialect;
    if (filterEmotion !== 'all') f.emotion = filterEmotion;
    if (filterMethod !== 'all') f.method = filterMethod;
    return f;
  }, [preset, currentFilteredSamples, filterGender, filterVoice, filterDialect, filterEmotion, filterMethod]);

  // Compute matched samples on client for instantaneous real-time preview
  const matchedSamples = useMemo(() => {
    if (preset === 'current') {
      return currentFilteredSamples;
    }
    if (preset === 'all') {
      return samples;
    }
    if (preset === 'male') {
      return samples.filter(s => getSampleGender(s) === 'male');
    }
    if (preset === 'female') {
      return samples.filter(s => getSampleGender(s) === 'female');
    }

    // Custom filtering
    return samples.filter(s => {
      if (filterGender !== 'all' && getSampleGender(s) !== filterGender) return false;
      if (filterVoice !== 'all') {
        const v = String(s.voice_name || s.voice_id || '').toLowerCase();
        if (!v.includes(filterVoice.toLowerCase())) return false;
      }
      if (filterDialect !== 'all') {
        const d = String(s.dialect || 'sorani').toLowerCase();
        if (d !== filterDialect.toLowerCase()) return false;
      }
      if (filterEmotion !== 'all') {
        const em = String(s.emotion || 'neutral').toLowerCase();
        const tag = String(s.emotion_tag || '').toLowerCase();
        if (!em.includes(filterEmotion.toLowerCase()) && !tag.includes(filterEmotion.toLowerCase())) return false;
      }
      if (filterMethod !== 'all' && s.method !== filterMethod) return false;
      return true;
    });
  }, [preset, samples, currentFilteredSamples, filterGender, filterVoice, filterDialect, filterEmotion, filterMethod]);

  // Aggregate stats of the matched samples
  const matchedStats = useMemo(() => {
    let totalSec = 0;
    let totalBytes = 0;
    let m = 0;
    let f = 0;
    for (const s of matchedSamples) {
      totalSec += (s.duration_seconds || s.durationSeconds || 0);
      totalBytes += (s.audio_size || 0);
      if (getSampleGender(s) === 'male') m++;
      else f++;
    }
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = Math.round(totalSec % 60);
    const durationFormatted = hours > 0 
      ? `${hours}h ${minutes}m` 
      : `${minutes}m ${seconds}s`;

    const sizeMb = (totalBytes / (1024 * 1024)).toFixed(1);

    return {
      count: matchedSamples.length,
      maleCount: m,
      femaleCount: f,
      durationFormatted,
      sizeMb: totalBytes > 0 ? `${sizeMb} MB` : 'Estimating...'
    };
  }, [matchedSamples]);

  const rawZipUrl = useMemo(() => getZipExportUrl(effectiveFilters), [effectiveFilters]);
  const audarZipUrl = useMemo(() => getAudarZipExportUrl(effectiveFilters), [effectiveFilters]);

  const handleCopyLink = (type: 'raw' | 'audar') => {
    const relativeUrl = type === 'raw' ? rawZipUrl : audarZipUrl;
    const fullUrl = `${window.location.origin}${relativeUrl}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedLink(type);
      if (addToast) {
        addToast({
          type: 'success',
          title: 'Link Copied',
          message: `Direct download link copied to clipboard!`
        });
      }
      setTimeout(() => setCopiedLink(null), 2500);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1050 }}>
      <div 
        className="modal-container glass-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '740px', 
          width: '95%',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15)'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="modal-title-group">
            <div 
              className="modal-icon-badge" 
              style={{ 
                background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)', 
                color: '#0f172a',
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)'
              }}
            >
              <Download size={22} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Export & Download Kurdish Dataset
              </h2>
              <p className="modal-subtitle" style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Filter which voice genders, dialects, or models to include in your ZIP archive
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.25rem', maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Section 1: Quick Download Presets */}
          <div>
            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700, marginBottom: '0.6rem', display: 'block' }}>
              Select Download Preset
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.55rem' }}>
              {/* Preset 1: All */}
              <button
                type="button"
                onClick={() => handleSelectPreset('all')}
                style={{
                  padding: '0.75rem 0.6rem',
                  borderRadius: '10px',
                  border: preset === 'all' ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                  background: preset === 'all' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.03)',
                  color: preset === 'all' ? '#ffffff' : '#94a3b8',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: preset === 'all' ? '#38bdf8' : '#e2e8f0' }}>
                  All Samples
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {samples.length} items
                </div>
              </button>

              {/* Preset 2: Male Voices Only */}
              <button
                type="button"
                onClick={() => handleSelectPreset('male')}
                style={{
                  padding: '0.75rem 0.6rem',
                  borderRadius: '10px',
                  border: preset === 'male' ? '1.5px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                  background: preset === 'male' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255,255,255,0.03)',
                  color: preset === 'male' ? '#ffffff' : '#94a3b8',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: preset === 'male' ? '#60a5fa' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  👨 Male Voices
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {maleCount} items in dataset
                </div>
              </button>

              {/* Preset 3: Female Voices Only */}
              <button
                type="button"
                onClick={() => handleSelectPreset('female')}
                style={{
                  padding: '0.75rem 0.6rem',
                  borderRadius: '10px',
                  border: preset === 'female' ? '1.5px solid #ec4899' : '1px solid rgba(255,255,255,0.08)',
                  background: preset === 'female' ? 'rgba(236, 72, 153, 0.18)' : 'rgba(255,255,255,0.03)',
                  color: preset === 'female' ? '#ffffff' : '#94a3b8',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: preset === 'female' ? '#f472b6' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  👩 Female Voices
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {femaleCount} items in dataset
                </div>
              </button>

              {/* Preset 4: Current Filter / Search View */}
              <button
                type="button"
                onClick={() => handleSelectPreset('current')}
                style={{
                  padding: '0.75rem 0.6rem',
                  borderRadius: '10px',
                  border: preset === 'current' ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                  background: preset === 'current' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255,255,255,0.03)',
                  color: preset === 'current' ? '#ffffff' : '#94a3b8',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: preset === 'current' ? '#34d399' : '#e2e8f0' }}>
                  🎯 Current View
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {currentFilteredSamples.length} filtered items
                </div>
              </button>

              {/* Preset 5: Custom Filters */}
              <button
                type="button"
                onClick={() => handleSelectPreset('custom')}
                style={{
                  padding: '0.75rem 0.6rem',
                  borderRadius: '10px',
                  border: preset === 'custom' ? '1.5px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                  background: preset === 'custom' ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255,255,255,0.03)',
                  color: preset === 'custom' ? '#ffffff' : '#94a3b8',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: preset === 'custom' ? '#c084fc' : '#e2e8f0' }}>
                  ⚙️ Custom
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Detailed selectors
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Detailed Custom Selectors (Visible when preset === 'custom') */}
          {preset === 'custom' && (
            <div 
              className="glass-card" 
              style={{ 
                padding: '1rem', 
                background: 'rgba(15, 23, 42, 0.65)', 
                border: '1px solid rgba(168, 85, 247, 0.25)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.85rem' 
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={14} />
                <span>Fine-grained Filter Controls</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {/* Gender Selector */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Voice Gender
                  </label>
                  <select
                    className="select-control"
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value as any)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="all">All Genders ({samples.length})</option>
                    <option value="male">Male Voices ({maleCount})</option>
                    <option value="female">Female Voices ({femaleCount})</option>
                  </select>
                </div>

                {/* Specific Voice */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Specific Voice
                  </label>
                  <select
                    className="select-control"
                    value={filterVoice}
                    onChange={(e) => setFilterVoice(e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="all">All Voices</option>
                    {availableVoices.map(v => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dialect Selector */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Kurdish Dialect
                  </label>
                  <select
                    className="select-control"
                    value={filterDialect}
                    onChange={(e) => setFilterDialect(e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="all">All Dialects ({samples.length})</option>
                    <option value="sorani">Central Kurdish / Sorani ({soraniCount})</option>
                    <option value="badini">Northern Kurdish / Badini ({badiniCount})</option>
                  </select>
                </div>

                {/* Emotion Selector */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Emotion
                  </label>
                  <select
                    className="select-control"
                    value={filterEmotion}
                    onChange={(e) => setFilterEmotion(e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="all">All Emotions</option>
                    <option value="neutral">Neutral</option>
                    <option value="happy">Happy</option>
                    <option value="sad">Sad</option>
                    <option value="angry">Angry</option>
                    <option value="excited">Excited</option>
                    <option value="whisper">Whisper</option>
                    <option value="laughing">Laughing</option>
                  </select>
                </div>

                {/* Method Selector */}
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Synthesis Method
                  </label>
                  <select
                    className="select-control"
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <option value="all">All Methods</option>
                    <option value="gemini_api">Gemini API</option>
                    <option value="elevenlabs_api">ElevenLabs API</option>
                    <option value="elevenlabs_web">ElevenLabs Web</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Live Preview Stats Card */}
          <div 
            className="glass-card" 
            style={{ 
              padding: '1rem', 
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.25)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={15} />
                <span>Export Package Preview</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  👨 {matchedStats.maleCount} Male
                </span>
                <span style={{ fontSize: '0.72rem', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  👩 {matchedStats.femaleCount} Female
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Selected Samples</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: matchedStats.count > 0 ? '#38bdf8' : '#ef4444' }}>
                  {matchedStats.count}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  {((matchedStats.count / (samples.length || 1)) * 100).toFixed(0)}% of dataset
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Duration</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                  {matchedStats.durationFormatted}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  24kHz 16-bit audio
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Approx Size</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
                  {matchedStats.sizeMb}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  ZIP Compressed
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Dual Export Action Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
            
            {/* Action 1: Raw ZIP */}
            <div 
              className="glass-card" 
              style={{ 
                padding: '1rem', 
                border: '1px solid rgba(255,255,255,0.1)', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <FileArchive size={18} style={{ color: '#f59e0b' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>Raw Dataset ZIP</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
                  Includes exact <code>.wav</code> audio clips, <code>.json</code> metadata files, and an auto-generated <code>export_manifest.json</code>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <a
                  href={rawZipUrl}
                  download
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    pointerEvents: matchedStats.count === 0 ? 'none' : 'auto',
                    opacity: matchedStats.count === 0 ? 0.5 : 1
                  }}
                  id="btn-download-filtered-raw-zip"
                >
                  <Download size={15} />
                  <span>Download Raw ZIP</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyLink('raw')}
                  className="btn btn-secondary"
                  style={{ padding: '0 10px' }}
                  title="Copy direct download link"
                >
                  {copiedLink === 'raw' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Action 2: Audar Canonical ZIP */}
            <div 
              className="glass-card" 
              style={{ 
                padding: '1rem', 
                border: '1px solid rgba(56, 189, 248, 0.3)', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={18} style={{ color: '#38bdf8' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>Audar Canonical ZIP</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
                  Audar Speech Schema v2.0 with <code>data.jsonl</code>, <code>metadata.csv</code>, <code>whisper.jsonl</code>, and 24kHz mono WAVs.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <a
                  href={audarZipUrl}
                  download
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
                    pointerEvents: matchedStats.count === 0 ? 'none' : 'auto',
                    opacity: matchedStats.count === 0 ? 0.5 : 1
                  }}
                  id="btn-download-filtered-audar-zip"
                >
                  <Download size={15} />
                  <span>Download Audar ZIP</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyLink('audar')}
                  className="btn btn-secondary"
                  style={{ padding: '0 10px' }}
                  title="Copy direct download link"
                >
                  {copiedLink === 'audar' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Ready to export <strong>{matchedStats.count}</strong> samples ({matchedStats.durationFormatted})
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
