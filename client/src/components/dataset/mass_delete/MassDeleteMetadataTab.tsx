import React from 'react';

export type MetaCriteriaType = 'dialect' | 'voice' | 'method' | 'rating' | 'missing_audio';

interface MassDeleteMetadataTabProps {
  metaCriteriaType: MetaCriteriaType;
  setMetaCriteriaType: (t: MetaCriteriaType) => void;
  metaDialect: 'sorani' | 'badini';
  setMetaDialect: (d: 'sorani' | 'badini') => void;
  metaVoice: string;
  setMetaVoice: (v: string) => void;
  availableVoices: { name: string; count: number }[];
  metaMethod: string;
  setMetaMethod: (m: string) => void;
  metaRatingOption: 'unrated' | 'low_quality';
  setMetaRatingOption: (r: 'unrated' | 'low_quality') => void;
}

export const MassDeleteMetadataTab: React.FC<MassDeleteMetadataTabProps> = ({
  metaCriteriaType,
  setMetaCriteriaType,
  metaDialect,
  setMetaDialect,
  metaVoice,
  setMetaVoice,
  availableVoices,
  metaMethod,
  setMetaMethod,
  metaRatingOption,
  setMetaRatingOption
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
          Select Delete Criteria Rule
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setMetaCriteriaType('dialect')}
            className={`btn btn-sm ${metaCriteriaType === 'dialect' ? 'btn-danger' : 'btn-secondary'}`}
          >
            By Dialect
          </button>
          <button
            type="button"
            onClick={() => setMetaCriteriaType('voice')}
            className={`btn btn-sm ${metaCriteriaType === 'voice' ? 'btn-danger' : 'btn-secondary'}`}
          >
            By Voice
          </button>
          <button
            type="button"
            onClick={() => setMetaCriteriaType('method')}
            className={`btn btn-sm ${metaCriteriaType === 'method' ? 'btn-danger' : 'btn-secondary'}`}
          >
            By Method
          </button>
          <button
            type="button"
            onClick={() => setMetaCriteriaType('rating')}
            className={`btn btn-sm ${metaCriteriaType === 'rating' ? 'btn-danger' : 'btn-secondary'}`}
          >
            By Rating
          </button>
          <button
            type="button"
            onClick={() => setMetaCriteriaType('missing_audio')}
            className={`btn btn-sm ${metaCriteriaType === 'missing_audio' ? 'btn-danger' : 'btn-secondary'}`}
          >
            Missing Audio
          </button>
        </div>
      </div>

      {/* Sub-selector based on criteria type */}
      <div className="glass-card" style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)' }}>
        {metaCriteriaType === 'dialect' && (
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Kurdish Dialect</label>
            <select
              className="select-control"
              value={metaDialect}
              onChange={(e) => setMetaDialect(e.target.value as any)}
              style={{ width: '100%' }}
            >
              <option value="sorani">Central Kurdish (Sorani)</option>
              <option value="badini">Northern Kurdish (Badini / Kurmanji)</option>
            </select>
          </div>
        )}

        {metaCriteriaType === 'voice' && (
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Voice Name</label>
            <select
              className="select-control"
              value={metaVoice}
              onChange={(e) => setMetaVoice(e.target.value)}
              style={{ width: '100%' }}
            >
              {availableVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.count.toLocaleString()} samples)
                </option>
              ))}
            </select>
          </div>
        )}

        {metaCriteriaType === 'method' && (
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Synthesis Method</label>
            <select
              className="select-control"
              value={metaMethod}
              onChange={(e) => setMetaMethod(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="gemini_api">Google Gemini API</option>
              <option value="elevenlabs_api">ElevenLabs API</option>
              <option value="elevenlabs_web">ElevenLabs Web / Normal Voice</option>
            </select>
          </div>
        )}

        {metaCriteriaType === 'rating' && (
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Rating Condition</label>
            <select
              className="select-control"
              value={metaRatingOption}
              onChange={(e) => setMetaRatingOption(e.target.value as any)}
              style={{ width: '100%' }}
            >
              <option value="unrated">Unrated Samples Only (No star rating)</option>
              <option value="low_quality">Low Quality (Rated 1 or 2 Stars)</option>
            </select>
          </div>
        )}

        {metaCriteriaType === 'missing_audio' && (
          <div>
            <div style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 600, marginBottom: '4px' }}>
              Corrupt or Missing Audio Files
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Deletes dataset records where the associated WAV file is missing, 0-bytes, or unreadable.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
