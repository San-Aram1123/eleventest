import React from 'react';
import { Filter } from 'lucide-react';

interface ExportCustomFiltersProps {
  filterGender: 'all' | 'male' | 'female';
  setFilterGender: (g: 'all' | 'male' | 'female') => void;
  filterVoice: string;
  setFilterVoice: (v: string) => void;
  availableVoices: { name: string; count: number }[];
  filterLanguage: string;
  setFilterLanguage: (l: string) => void;
  filterDialect: string;
  setFilterDialect: (d: string) => void;
  filterEmotion: string;
  setFilterEmotion: (e: string) => void;
  filterMethod: string;
  setFilterMethod: (m: string) => void;
  samplesCount: number;
  maleCount: number;
  femaleCount: number;
  ckbCount: number;
  enCount: number;
  badiniCount: number;
  soraniCount: number;
}

export const ExportCustomFilters: React.FC<ExportCustomFiltersProps> = ({
  filterGender, setFilterGender,
  filterVoice, setFilterVoice, availableVoices,
  filterLanguage, setFilterLanguage,
  filterDialect, setFilterDialect,
  filterEmotion, setFilterEmotion,
  filterMethod, setFilterMethod,
  samplesCount, maleCount, femaleCount,
  ckbCount, enCount, badiniCount, soraniCount
}) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '1rem',
        background: 'var(--bg-box)',
        border: '1px solid var(--border-subtle)',
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
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Voice Gender
          </label>
          <select
            className="select-control"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value as any)}
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <option value="all">All Genders ({samplesCount})</option>
            <option value="male">Male Voices ({maleCount})</option>
            <option value="female">Female Voices ({femaleCount})</option>
          </select>
        </div>

        {/* Specific Voice */}
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Specific Voice
          </label>
          <select
            className="select-control"
            value={filterVoice}
            onChange={(e) => setFilterVoice(e.target.value)}
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <option value="all">All Voices</option>
            {availableVoices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.count})
              </option>
            ))}
          </select>
        </div>

        {/* Language Selector */}
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Language
          </label>
          <select
            className="select-control"
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <option value="all">All Languages ({samplesCount})</option>
            <option value="ckb">Kurdish Sorani (ckb) ({ckbCount})</option>
            <option value="en">English (en) ({enCount})</option>
            <option value="kmr">Kurdish Badini (kmr) ({badiniCount})</option>
            <option value="ar">Arabic (ar)</option>
          </select>
        </div>

        {/* Dialect Selector */}
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Kurdish Dialect
          </label>
          <select
            className="select-control"
            value={filterDialect}
            onChange={(e) => setFilterDialect(e.target.value)}
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <option value="all">All Dialects ({samplesCount})</option>
            <option value="sorani">Central Kurdish / Sorani ({soraniCount})</option>
            <option value="badini">Northern Kurdish / Badini ({badiniCount})</option>
          </select>
        </div>

        {/* Emotion Selector */}
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
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
            <option value="fear">Fear</option>
            <option value="excited">Excited</option>
            <option value="whisper">Whisper</option>
          </select>
        </div>

        {/* Generation Method */}
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Synthesis Method
          </label>
          <select
            className="select-control"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <option value="all">All Methods</option>
            <option value="gemini_api">Google Gemini API</option>
            <option value="elevenlabs_api">ElevenLabs API</option>
            <option value="elevenlabs_web">ElevenLabs Normal Web</option>
          </select>
        </div>
      </div>
    </div>
  );
};
