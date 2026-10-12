import React from 'react';
import { FileCode, Download, Trash2, Key } from 'lucide-react';
import { Sample, SampleRatings } from '../../../types';
import { AudioPlayer } from '../../AudioPlayer';
import { RatingWidget } from '../../RatingWidget';
import {
  getSampleLanguage,
  getLanguageLabel,
  getSampleUsedKey,
  parseSampleEmotions,
  getEmotionBadgeClass
} from '../../../hooks/useDatasetFilters';

interface DatasetTableViewProps {
  samples: Sample[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAllCurrentPage: () => void;
  onInspect: (sample: Sample) => void;
  onDelete: (id: string) => void;
  onRatingChange: (id: string, ratings: SampleRatings) => void;
}

export const DatasetTableView: React.FC<DatasetTableViewProps> = ({
  samples,
  selectedIds,
  onToggleSelect,
  onSelectAllCurrentPage,
  onInspect,
  onDelete,
  onRatingChange
}) => {
  const allCurrentSelected = samples.length > 0 && samples.every((s) => selectedIds.has(s.id));

  return (
    <div className="glass-card table-view-card">
      <div className="dataset-table-container">
        <table className="dataset-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={allCurrentSelected}
                  onChange={onSelectAllCurrentPage}
                  title="Select / Deselect all on current page"
                />
              </th>
              <th>ID</th>
              <th>Lang</th>
              <th>Text</th>
              <th>Emotions</th>
              <th>Method</th>
              <th>Voice / Model</th>
              <th>Audio Preview</th>
              <th>Rating</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((sample) => {
              const lang = getSampleLanguage(sample);
              const usedKey = getSampleUsedKey(sample);
              const emotions = parseSampleEmotions(sample);

              return (
                <tr key={sample.id}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(sample.id)}
                      onChange={() => onToggleSelect(sample.id)}
                      style={{ cursor: 'pointer', accentColor: '#ef4444', width: '15px', height: '15px' }}
                      title="Select sample"
                    />
                  </td>
                  <td>
                    <span className="sample-id-pill">#{sample.id}</span>
                  </td>
                  <td>
                    <span
                      className="badge badge-lang"
                      style={{
                        background: lang === 'en' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: lang === 'en' ? '#60a5fa' : '#34d399',
                        border: `1px solid ${lang === 'en' ? 'rgba(59, 130, 246, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                        fontWeight: 700,
                        fontSize: '0.7rem'
                      }}
                      title={`Language: ${getLanguageLabel(lang)}`}
                    >
                      {lang.toUpperCase()}
                    </span>
                  </td>
                  <td className="kurdish-table-cell" dir={lang === 'en' ? 'ltr' : 'rtl'}>
                    {sample.text}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {emotions.map((em, idx) => (
                        <span key={idx} className={`badge ${getEmotionBadgeClass(em)}`}>
                          {em}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        sample.method === 'gemini_api'
                          ? 'badge-purple'
                          : sample.method === 'elevenlabs_api'
                            ? 'badge-cyan'
                            : 'badge-emerald'
                      }`}
                    >
                      {sample.method === 'gemini_api' ? 'Gemini' : sample.method === 'elevenlabs_api' ? 'ElevenLabs' : 'Web'}
                    </span>
                    {usedKey && (
                      <div style={{ marginTop: '5px' }}>
                        <span
                          className="badge badge-key"
                          style={{
                            background: 'rgba(168, 85, 247, 0.15)',
                            color: '#c084fc',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            fontSize: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '1px 5px'
                          }}
                          title={`API Key: ${usedKey}`}
                        >
                          <Key size={10} />
                          {usedKey}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="voice-cell">
                    <div className="voice-name">{sample.voice_name || sample.voice_id || 'Voice'}</div>
                    <div className="model-name">{sample.model_id || 'v2'}</div>
                  </td>
                  <td style={{ minWidth: 260 }}>
                    <AudioPlayer
                      src={sample.audioUrl || `/api/dataset/${sample.id}/audio`}
                      sampleId={sample.id}
                      showDownload={false}
                      initialDuration={sample.duration_seconds || sample.durationSeconds}
                    />
                  </td>
                  <td>
                    <RatingWidget
                      ratings={sample.ratings}
                      onSaveRatings={(ratings) => onRatingChange(sample.id, ratings)}
                      compact={true}
                    />
                  </td>
                  <td className="date-cell">
                    {sample.created_at ? new Date(sample.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="aux-btn"
                        onClick={() => onInspect(sample)}
                        title="Inspect Metadata"
                      >
                        <FileCode size={13} />
                      </button>
                      <a
                        href={`/api/dataset/${sample.id}/download/wav`}
                        download={`${sample.id}.wav`}
                        className="aux-btn"
                        title="Download WAV"
                      >
                        <Download size={13} />
                      </a>
                      <button
                        className="aux-btn btn-danger"
                        onClick={() => onDelete(sample.id)}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
