import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  FileCode, 
  Volume2, 
  FileArchive, 
  Star, 
  Play, 
  Pause,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';
import { MetadataModal } from '../components/MetadataModal';
import { RatingWidget } from '../components/RatingWidget';
import { Sample, EmotionType, SampleRatings } from '../types';
import { deleteSample, updateSample, getZipExportUrl } from '../services/api';

interface DatasetManagerProps {
  samples: Sample[];
  onSampleUpdated: (sample: Sample) => void;
  onSampleDeleted: (id: string) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const DatasetManagerPage: React.FC<DatasetManagerProps> = ({
  samples,
  onSampleUpdated,
  onSampleDeleted,
  addToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [activeAudioSampleId, setActiveAudioSampleId] = useState<string | null>(null);
  const [inspectingSample, setInspectingSample] = useState<Sample | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter & Search Logic
  const filteredSamples = samples.filter((s) => {
    // Text or ID match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = s.id.toLowerCase().includes(q);
      const matchText = s.text.toLowerCase().includes(q);
      const matchVoice = (s.voice_name || s.voice_id || '').toLowerCase().includes(q);
      if (!matchId && !matchText && !matchVoice) return false;
    }

    // Emotion match
    if (filterEmotion !== 'all' && s.emotion !== filterEmotion) {
      return false;
    }

    // Method match
    if (filterMethod !== 'all' && s.method !== filterMethod) {
      return false;
    }

    return true;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete sample "${id}" and its WAV/JSON files?`)) {
      return;
    }

    try {
      await deleteSample(id);
      onSampleDeleted(id);
      addToast({ type: 'info', title: 'Sample Deleted', message: `Sample ${id} removed from dataset.` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  };

  const handleRatingChange = async (sampleId: string, ratings: SampleRatings) => {
    try {
      const updated = await updateSample(sampleId, { ratings });
      onSampleUpdated(updated);
      addToast({ type: 'success', title: 'Rating Saved', message: `Ratings updated for ${sampleId}` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Rating Failed', message: err.message });
    }
  };

  return (
    <div className="dataset-page-root">
      {/* Header & ZIP Download */}
      <div className="dataset-page-header">
        <div>
          <h1 className="page-title">
            <Database size={24} className="text-cyan inline-icon" />
            <span>Kurdish Speech Dataset Manager</span>
          </h1>
          <p className="page-description">
            Authoritative repository of all generated Kurdish WAV audio files and strictly preserved Unicode JSON metadata.
          </p>
        </div>

        <div className="header-actions">
          <a
            href={getZipExportUrl()}
            download="kurdish_tts_dataset.zip"
            className="btn btn-accent btn-md"
            id="btn-download-dataset-zip"
          >
            <FileArchive size={18} />
            <span>Download Dataset (ZIP)</span>
          </a>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card filter-card">
        <div className="filter-grid">
          {/* Search Box */}
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input-control search-input"
              placeholder="Search by Kurdish text, ID (e.g. 001), or voice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Emotion Filter */}
          <div className="filter-select-group">
            <Filter size={15} className="text-muted" />
            <select
              className="select-control filter-select"
              value={filterEmotion}
              onChange={(e) => setFilterEmotion(e.target.value)}
            >
              <option value="all">All Emotions</option>
              <option value="neutral">Neutral</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="angry">Angry</option>
              <option value="excited">Excited</option>
              <option value="whisper">Whisper</option>
              <option value="laughing">Laughing</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Method Filter */}
          <div className="filter-select-group">
            <select
              className="select-control filter-select"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="elevenlabs_api">ElevenLabs API</option>
              <option value="elevenlabs_web">Normal Web Workflow</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              Cards
            </button>
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
          </div>
        </div>

        <div className="filter-stats-bar">
          <span className="stats-count">
            Showing <strong>{filteredSamples.length}</strong> of <strong>{samples.length}</strong> total samples
          </span>
        </div>
      </div>

      {/* Dataset List / Grid */}
      {filteredSamples.length === 0 ? (
        <div className="glass-card empty-dataset-state">
          <Database size={40} className="text-dim" />
          <div className="empty-title">No Samples Found</div>
          <p className="empty-sub">
            {samples.length === 0
              ? 'No audio samples have been generated yet. Use the API Generation or Normal Web Workflow tab to create your first Kurdish TTS sample!'
              : 'No samples matched your search or filter criteria.'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="samples-card-grid">
          {filteredSamples.map((sample) => (
            <div key={sample.id} className="glass-card sample-item-card">
              <div className="sample-card-header">
                <div className="sample-id-badge-group">
                  <span className="sample-id-pill">{sample.id}</span>
                  <span className={`badge emotion-badge-${sample.emotion}`}>
                    {sample.emotion.toUpperCase()}
                  </span>
                  <span className={`badge ${sample.method === 'elevenlabs_api' ? 'badge-cyan' : 'badge-emerald'}`}>
                    {sample.method === 'elevenlabs_api' ? 'API' : 'Web'}
                  </span>
                </div>

                <div className="sample-card-actions">
                  <button
                    className="aux-btn"
                    onClick={() => setInspectingSample(sample)}
                    title="Inspect & Edit Metadata JSON"
                  >
                    <FileCode size={13} />
                    <span>JSON</span>
                  </button>
                  <button
                    className="aux-btn btn-danger"
                    onClick={() => handleDelete(sample.id)}
                    title="Delete Sample"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Kurdish Text Box */}
              <div className="sample-kurdish-box">
                <div className="kurdish-text sample-kurdish-text" dir="rtl">
                  {sample.text}
                </div>
              </div>

              {/* Meta details */}
              <div className="sample-details-row">
                <div className="detail-item">
                  <span className="detail-label">Voice:</span>
                  <span className="detail-val">{sample.voice_name || sample.voice_id || 'ElevenLabs Voice'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Model:</span>
                  <span className="detail-val">{sample.model_id || 'Multilingual'}</span>
                </div>
              </div>

              {/* Audio Player */}
              <div className="sample-audio-wrap">
                <AudioPlayer
                  src={sample.audioUrl || `/api/dataset/${sample.id}/audio`}
                  sampleId={sample.id}
                  showDownload={true}
                />
              </div>

              {/* Ratings */}
              <div className="sample-rating-wrap">
                <RatingWidget
                  ratings={sample.ratings}
                  onSaveRatings={(ratings) => handleRatingChange(sample.id, ratings)}
                  compact={true}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card table-view-card">
          <div className="dataset-table-container">
            <table className="dataset-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kurdish Transcript (RTL)</th>
                  <th>Emotion</th>
                  <th>Method</th>
                  <th>Voice / Model</th>
                  <th>Audio Playback</th>
                  <th>Rating</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSamples.map((sample) => (
                  <tr key={sample.id}>
                    <td>
                      <span className="sample-id-pill">{sample.id}</span>
                    </td>
                    <td className="kurdish-table-cell" dir="rtl">
                      {sample.text}
                    </td>
                    <td>
                      <span className={`badge emotion-badge-${sample.emotion}`}>
                        {sample.emotion}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${sample.method === 'elevenlabs_api' ? 'badge-cyan' : 'badge-emerald'}`}>
                        {sample.method === 'elevenlabs_api' ? 'API' : 'Web'}
                      </span>
                    </td>
                    <td className="voice-cell">
                      <div className="voice-name">{sample.voice_name || 'ElevenLabs'}</div>
                      <div className="model-name">{sample.model_id || 'v2'}</div>
                    </td>
                    <td style={{ minWidth: 260 }}>
                      <AudioPlayer
                        src={sample.audioUrl || `/api/dataset/${sample.id}/audio`}
                        sampleId={sample.id}
                        showDownload={false}
                      />
                    </td>
                    <td>
                      <RatingWidget
                        ratings={sample.ratings}
                        onSaveRatings={(ratings) => handleRatingChange(sample.id, ratings)}
                        compact={true}
                      />
                    </td>
                    <td className="date-cell">
                      {new Date(sample.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="aux-btn"
                          onClick={() => setInspectingSample(sample)}
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
                          onClick={() => handleDelete(sample.id)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Metadata Inspection Modal */}
      {inspectingSample && (
        <MetadataModal
          sample={inspectingSample}
          onClose={() => setInspectingSample(null)}
          onSampleUpdated={(updated) => {
            setInspectingSample(updated);
            onSampleUpdated(updated);
          }}
        />
      )}

      <style>{`
        .dataset-page-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dataset-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .filter-card {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filter-grid {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          min-width: 260px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }

        .search-input {
          padding-left: 36px;
        }

        .filter-select-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-select {
          min-width: 150px;
        }

        .view-mode-toggle {
          display: flex;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 2px;
        }

        .view-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
        }

        .view-btn.active {
          background: #0284C7;
          color: #fff;
        }

        .filter-stats-bar {
          font-size: 0.78rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-subtle);
          padding-top: 8px;
        }

        .samples-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 20px;
        }

        .sample-item-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sample-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sample-id-badge-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .sample-id-pill {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.85rem;
          color: #38BDF8;
          background: rgba(56, 189, 248, 0.15);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(56, 189, 248, 0.3);
        }

        .sample-card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sample-kurdish-box {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          min-height: 70px;
          display: flex;
          align-items: center;
        }

        .sample-kurdish-text {
          font-size: 1.15rem;
          color: #FFFFFF;
          line-height: 1.7;
          width: 100%;
        }

        .sample-details-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.76rem;
          color: var(--text-dim);
          border-top: 1px solid var(--border-subtle);
          padding-top: 8px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .detail-val {
          color: var(--text-main);
          font-weight: 500;
        }

        .empty-dataset-state {
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .dataset-table-container {
          overflow-x: auto;
        }

        .dataset-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          text-align: left;
        }

        .dataset-table th {
          padding: 12px 14px;
          color: var(--text-muted);
          font-weight: 600;
          border-bottom: 1px solid var(--border-medium);
          background: rgba(15, 23, 42, 0.6);
        }

        .dataset-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-main);
        }

        .dataset-table tr:hover td {
          background: rgba(56, 189, 248, 0.05);
        }

        .kurdish-table-cell {
          font-family: var(--font-kurdish);
          font-size: 1.1rem;
          max-width: 280px;
          line-height: 1.6;
        }

        .voice-name {
          font-weight: 600;
        }

        .model-name {
          font-size: 0.72rem;
          color: var(--text-dim);
          font-family: var(--font-mono);
        }

        .date-cell {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .table-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
    </div>
  );
};
