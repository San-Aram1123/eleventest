import React, { useState } from 'react';
import { 
  GitCompare, 
  Sparkles, 
  Layers, 
  Download, 
  FileCode, 
  Star, 
  ArrowLeftRight, 
  CheckCircle2, 
  Info,
  Check
} from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';
import { RatingWidget } from '../components/RatingWidget';
import { MetadataModal } from '../components/MetadataModal';
import { Sample, SampleRatings } from '../types';
import { updateSample } from '../services/api';

interface ComparisonPageProps {
  samples: Sample[];
  onSampleUpdated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({
  samples,
  onSampleUpdated,
  addToast
}) => {
  const [selectedIdA, setSelectedIdA] = useState<string>('');
  const [selectedIdB, setSelectedIdB] = useState<string>('');
  const [inspectingSample, setInspectingSample] = useState<Sample | null>(null);

  // Group samples by identical Kurdish text to find automatic pairs
  const textGroups = samples.reduce((acc, sample) => {
    const key = sample.text.trim();
    if (!acc[key]) acc[key] = [];
    acc[key].push(sample);
    return acc;
  }, {} as Record<string, Sample[]>);

  const matchingPairs = Object.entries(textGroups).filter(([_, list]) => list.length >= 2);

  // Resolve active samples
  const sampleA = samples.find(s => s.id === selectedIdA) || (samples.length > 0 ? samples[0] : null);
  const sampleB = samples.find(s => s.id === selectedIdB) || (samples.length > 1 ? samples[1] : null);

  const handleSelectMatchingPair = (pairSamples: Sample[]) => {
    const apiSample = pairSamples.find(s => s.method === 'elevenlabs_api') || pairSamples[0];
    const webSample = pairSamples.find(s => s.method === 'elevenlabs_web') || pairSamples[1] || pairSamples[0];

    setSelectedIdA(apiSample.id);
    setSelectedIdB(webSample.id);
  };

  const handleSaveRatingsA = async (ratings: SampleRatings) => {
    if (!sampleA) return;
    try {
      const updated = await updateSample(sampleA.id, { ratings });
      onSampleUpdated(updated);
      addToast({ type: 'success', title: 'Ratings Saved', message: `Ratings saved for Sample A (${sampleA.id})` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    }
  };

  const handleSaveRatingsB = async (ratings: SampleRatings) => {
    if (!sampleB) return;
    try {
      const updated = await updateSample(sampleB.id, { ratings });
      onSampleUpdated(updated);
      addToast({ type: 'success', title: 'Ratings Saved', message: `Ratings saved for Sample B (${sampleB.id})` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    }
  };

  if (samples.length < 2) {
    return (
      <div className="compare-page-root">
        <div className="page-header">
          <h1 className="page-title">
            <GitCompare size={24} className="text-cyan inline-icon" />
            <span>Compare API vs Normal Web Workflow</span>
          </h1>
          <p className="page-description">
            Side-by-side A/B evaluation of Kurdish speech naturalness, emotional inflection, and pronunciation.
          </p>
        </div>

        <div className="glass-card empty-compare-card">
          <GitCompare size={48} className="text-dim" />
          <div className="empty-title">Need at least 2 Samples to Compare</div>
          <p className="empty-sub">
            Generate speech using both the <strong>ElevenLabs API</strong> and <strong>Normal Web Workflow</strong> tabs to compare them side-by-side!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page-root">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <GitCompare size={24} className="text-cyan inline-icon" />
            <span>Compare API vs Normal Web Workflow</span>
          </h1>
          <p className="page-description">
            Side-by-side A/B benchmark of Kurdish speech quality, Kurdish vowel pronunciation, and emotional accuracy.
          </p>
        </div>
      </div>

      {/* Matching Text Pairs Quick-Selector */}
      {matchingPairs.length > 0 && (
        <div className="glass-card matching-pairs-card">
          <div className="pairs-title">
            <Sparkles size={15} className="text-amber" />
            <span>Found {matchingPairs.length} Matching Kurdish Text Group{matchingPairs.length > 1 ? 's' : ''}:</span>
          </div>
          <div className="pairs-list">
            {matchingPairs.map(([text, list], idx) => (
              <button
                key={idx}
                className="pair-select-btn"
                onClick={() => handleSelectMatchingPair(list)}
                title={text}
              >
                <span className="pair-count-badge">{list.length} versions</span>
                <span className="kurdish-text pair-text" dir="rtl">{text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="glass-card selector-bar">
        <div className="selector-column">
          <label className="form-label">Sample A (Left)</label>
          <select
            className="select-control"
            value={sampleA?.id || ''}
            onChange={(e) => setSelectedIdA(e.target.value)}
          >
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} • [{s.method === 'elevenlabs_api' ? 'API' : 'Web'}] {s.emotion} — {s.text.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>

        <div className="compare-icon-wrap">
          <ArrowLeftRight size={20} className="text-cyan" />
        </div>

        <div className="selector-column">
          <label className="form-label">Sample B (Right)</label>
          <select
            className="select-control"
            value={sampleB?.id || ''}
            onChange={(e) => setSelectedIdB(e.target.value)}
          >
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} • [{s.method === 'elevenlabs_api' ? 'API' : 'Web'}] {s.emotion} — {s.text.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid-2 compare-grid">
        {/* SAMPLE A */}
        {sampleA && (
          <div className="glass-card compare-card card-a">
            <div className="compare-card-header">
              <div className="compare-card-title">
                <span className="side-badge badge-a">Sample A</span>
                <span className="sample-id-pill">{sampleA.id}</span>
                <span className={`badge ${sampleA.method === 'elevenlabs_api' ? 'badge-cyan' : 'badge-emerald'}`}>
                  {sampleA.method === 'elevenlabs_api' ? 'ElevenLabs API' : 'Normal Website'}
                </span>
              </div>
              <button className="aux-btn" onClick={() => setInspectingSample(sampleA)}>
                <FileCode size={13} />
                <span>JSON</span>
              </button>
            </div>

            {/* Kurdish Text */}
            <div className="output-kurdish-box">
              <div className="output-kurdish-label">
                <span>Preserved Kurdish Transcript</span>
                <span className={`badge emotion-badge-${sampleA.emotion}`}>{sampleA.emotion}</span>
              </div>
              <div className="kurdish-text output-kurdish-text" dir="rtl">
                {sampleA.text}
              </div>
            </div>

            {/* Meta Table */}
            <div className="compare-meta-table">
              <div className="meta-row">
                <span className="meta-k">Voice:</span>
                <span className="meta-v">{sampleA.voice_name || sampleA.voice_id || 'ElevenLabs Voice'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-k">Model:</span>
                <span className="meta-v">{sampleA.model_id || 'Multilingual'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-k">Prompt Tag:</span>
                <span className="meta-v">{sampleA.emotion_tag || 'None'}</span>
              </div>
            </div>

            {/* Audio Player */}
            <AudioPlayer
              src={sampleA.audioUrl || `/api/dataset/${sampleA.id}/audio`}
              sampleId={sampleA.id}
            />

            {/* Ratings */}
            <RatingWidget
              ratings={sampleA.ratings}
              onSaveRatings={handleSaveRatingsA}
            />
          </div>
        )}

        {/* SAMPLE B */}
        {sampleB && (
          <div className="glass-card compare-card card-b">
            <div className="compare-card-header">
              <div className="compare-card-title">
                <span className="side-badge badge-b">Sample B</span>
                <span className="sample-id-pill">{sampleB.id}</span>
                <span className={`badge ${sampleB.method === 'elevenlabs_api' ? 'badge-cyan' : 'badge-emerald'}`}>
                  {sampleB.method === 'elevenlabs_api' ? 'ElevenLabs API' : 'Normal Website'}
                </span>
              </div>
              <button className="aux-btn" onClick={() => setInspectingSample(sampleB)}>
                <FileCode size={13} />
                <span>JSON</span>
              </button>
            </div>

            {/* Kurdish Text */}
            <div className="output-kurdish-box">
              <div className="output-kurdish-label">
                <span>Preserved Kurdish Transcript</span>
                <span className={`badge emotion-badge-${sampleB.emotion}`}>{sampleB.emotion}</span>
              </div>
              <div className="kurdish-text output-kurdish-text" dir="rtl">
                {sampleB.text}
              </div>
            </div>

            {/* Meta Table */}
            <div className="compare-meta-table">
              <div className="meta-row">
                <span className="meta-k">Voice:</span>
                <span className="meta-v">{sampleB.voice_name || sampleB.voice_id || 'ElevenLabs Voice'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-k">Model:</span>
                <span className="meta-v">{sampleB.model_id || 'Multilingual'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-k">Prompt Tag:</span>
                <span className="meta-v">{sampleB.emotion_tag || 'None'}</span>
              </div>
            </div>

            {/* Audio Player */}
            <AudioPlayer
              src={sampleB.audioUrl || `/api/dataset/${sampleB.id}/audio`}
              sampleId={sampleB.id}
            />

            {/* Ratings */}
            <RatingWidget
              ratings={sampleB.ratings}
              onSaveRatings={handleSaveRatingsB}
            />
          </div>
        )}
      </div>

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
        .compare-page-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .matching-pairs-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 14px 18px;
        }

        .pairs-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .pairs-list {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .pair-select-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 6px 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .pair-select-btn:hover {
          background: rgba(56, 189, 248, 0.15);
          border-color: #38BDF8;
        }

        .pair-count-badge {
          background: rgba(56, 189, 248, 0.2);
          color: #38BDF8;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-full);
        }

        .pair-text {
          font-size: 0.95rem;
          color: var(--text-main);
          max-width: 260px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .selector-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          gap: 20px;
        }

        .selector-column {
          flex: 1;
        }

        .compare-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-subtle);
          margin-top: 18px;
        }

        .compare-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card-a {
          border-top: 3px solid #38BDF8;
        }

        .card-b {
          border-top: 3px solid #10B981;
        }

        .compare-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .compare-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .side-badge {
          font-size: 0.75rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }

        .badge-a {
          background: rgba(56, 189, 248, 0.2);
          color: #38BDF8;
        }

        .badge-b {
          background: rgba(16, 185, 129, 0.2);
          color: #34D399;
        }

        .compare-meta-table {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: rgba(15, 23, 42, 0.6);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
        }

        .meta-k {
          color: var(--text-dim);
        }

        .meta-v {
          font-weight: 600;
          color: var(--text-main);
          font-family: var(--font-mono);
        }

        .empty-compare-card {
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
      `}</style>
    </div>
  );
};
