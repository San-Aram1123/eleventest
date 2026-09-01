import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  Copy, 
  ExternalLink, 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Trash2, 
  Sparkles, 
  FileAudio,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { KurdishEditor } from '../components/KurdishEditor';
import { AudioPlayer } from '../components/AudioPlayer';
import { RatingWidget } from '../components/RatingWidget';
import { MetadataModal } from '../components/MetadataModal';
import { 
  Sample, 
  PendingSample, 
  EmotionType, 
  SampleRatings 
} from '../types';
import { 
  prepareNormalSample, 
  fetchNormalPending, 
  deleteNormalPending, 
  uploadNormalWav, 
  updateSample 
} from '../services/api';

interface NormalWorkflowProps {
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

const EMOTIONS: { value: EmotionType; label: string; tag: string; color: string }[] = [
  { value: 'neutral', label: 'Neutral', tag: '', color: 'neutral' },
  { value: 'laughing', label: 'Laughing', tag: '[laugh]', color: 'laughing' },
  { value: 'happy', label: 'Happy', tag: '[happy]', color: 'happy' },
  { value: 'whisper', label: 'Whisper', tag: '[whisper]', color: 'whisper' },
  { value: 'angry', label: 'Angry', tag: '[angry]', color: 'angry' },
  { value: 'sad', label: 'Sad', tag: '[sad]', color: 'sad' },
  { value: 'excited', label: 'Excited', tag: '[excited]', color: 'excited' },
  { value: 'custom', label: 'Custom', tag: '[laugh]', color: 'custom' }
];

export const NormalWorkflowPage: React.FC<NormalWorkflowProps> = ({
  onSampleCreated,
  addToast
}) => {
  // Input State
  const [kurdishText, setKurdishText] = useState('سڵاو! چۆنی؟ ئەمڕۆ زۆر دڵخۆشم، چونکە شتێکی زۆر خۆش ڕوویدا.');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('happy');
  const [copyWithTag, setCopyWithTag] = useState(false);
  const [voiceName, setVoiceName] = useState('');
  const [notes, setNotes] = useState('');

  // Queue State
  const [pendingList, setPendingList] = useState<PendingSample[]>([]);
  const [activePendingId, setActivePendingId] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  // Upload & Drag Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Result State
  const [lastPairedSample, setLastPairedSample] = useState<Sample | null>(null);
  const [inspectingSample, setInspectingSample] = useState<Sample | null>(null);

  useEffect(() => {
    loadPendingQueue();
  }, []);

  const loadPendingQueue = async () => {
    try {
      const list = await fetchNormalPending();
      setPendingList(list);
      if (list.length > 0 && !activePendingId) {
        setActivePendingId(list[0].pendingId);
      }
    } catch (err) {
      console.warn('Error loading pending queue:', err);
    }
  };

  const activeEmotionObj = EMOTIONS.find(e => e.value === selectedEmotion);
  const tagString = activeEmotionObj?.tag || '';

  const handlePrepareAndCopy = async () => {
    if (!kurdishText.trim()) {
      addToast({ type: 'error', title: 'Empty Input', message: 'Please enter Kurdish text before preparing.' });
      return;
    }

    setIsPreparing(true);
    try {
      // Determine what text to copy to clipboard
      let textToCopy = kurdishText.trim();
      if (copyWithTag && tagString) {
        textToCopy = `${tagString} ${textToCopy}`;
      }

      // Copy to user's system clipboard
      await navigator.clipboard.writeText(textToCopy);

      // Register with backend pending queue
      const res = await prepareNormalSample({
        text: kurdishText.trim(),
        emotion: selectedEmotion,
        emotionTag: tagString,
        voiceName: voiceName.trim() || undefined,
        notes: notes.trim() || undefined
      });

      setPendingList(res.allPending);
      setActivePendingId(res.pendingItem.pendingId);

      addToast({
        type: 'success',
        title: 'Text Copied & Sample Prepared!',
        message: 'Kurdish text is in your clipboard. Now generate in ElevenLabs and drop the WAV here!'
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Preparation Failed', message: err.message });
    } finally {
      setIsPreparing(false);
    }
  };

  const handleFileDrop = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.wav') && !file.name.toLowerCase().endsWith('.mp3')) {
      addToast({ type: 'error', title: 'Invalid File', message: 'Please upload a WAV audio file downloaded from ElevenLabs.' });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      if (activePendingId) {
        formData.append('pendingId', activePendingId);
      } else {
        formData.append('text', kurdishText.trim());
        formData.append('emotion', selectedEmotion);
      }
      if (voiceName) formData.append('voiceName', voiceName);
      if (notes) formData.append('notes', notes);

      const res = await uploadNormalWav(formData);
      const newSample = res.sample;
      setLastPairedSample(newSample);
      onSampleCreated(newSample);
      const remaining = res.remainingPending || [];
      setPendingList(remaining);
      if (remaining.length > 0) {
        setActivePendingId(remaining[0].pendingId);
      } else {
        setActivePendingId(null);
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      addToast({
        type: 'success',
        title: 'Audio Paired Automatically!',
        message: `Saved as ${newSample.id}.wav & ${newSample.id}.json with zero transcript retyping!`
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload Failed', message: err.message || 'Could not pair audio.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePending = async (pendingId: string) => {
    try {
      await deleteNormalPending(pendingId);
      setPendingList(prev => prev.filter(p => p.pendingId !== pendingId));
      if (activePendingId === pendingId) {
        setActivePendingId(null);
      }
      addToast({ type: 'info', title: 'Item Removed', message: 'Pending sample removed from queue.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    }
  };

  const handleSaveRatings = async (ratings: SampleRatings) => {
    if (!lastPairedSample) return;
    try {
      const updated = await updateSample(lastPairedSample.id, { ratings });
      setLastPairedSample(updated);
      onSampleCreated(updated);
      addToast({ type: 'success', title: 'Ratings Saved', message: 'Evaluation saved to metadata JSON.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    }
  };

  return (
    <div className="normal-page-root">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Layers size={24} className="text-emerald inline-icon" />
            <span>Normal ElevenLabs Website Workflow</span>
          </h1>
          <p className="page-description">
            Generate speech using ElevenLabs' official web interface and download the WAV. The application preserves your exact Kurdish transcript and automatically pairs it with your dropped WAV file — <strong>never retype transcripts</strong>.
          </p>
        </div>
      </div>

      {/* Workflow Step Guide */}
      <div className="workflow-steps-banner">
        <div className="step-card">
          <div className="step-number">1</div>
          <div className="step-content">
            <div className="step-title">Enter Kurdish Text</div>
            <div className="step-sub">Type or paste text once into this app</div>
          </div>
        </div>

        <ArrowRight size={18} className="step-arrow" />

        <div className="step-card">
          <div className="step-number">2</div>
          <div className="step-content">
            <div className="step-title">Copy & Prepare</div>
            <div className="step-sub">Saves Unicode text & puts it in clipboard</div>
          </div>
        </div>

        <ArrowRight size={18} className="step-arrow" />

        <div className="step-card">
          <div className="step-number">3</div>
          <div className="step-content">
            <div className="step-title">Generate in Web UI</div>
            <div className="step-sub">Paste into ElevenLabs & download WAV</div>
          </div>
        </div>

        <ArrowRight size={18} className="step-arrow" />

        <div className="step-card">
          <div className="step-number">4</div>
          <div className="step-content">
            <div className="step-title">Drop WAV Here</div>
            <div className="step-sub">Auto-pairs as <code>normal_001.wav/json</code></div>
          </div>
        </div>
      </div>

      <div className="normal-grid-layout">
        {/* Left Column: Kurdish Entry & Copy */}
        <div className="glass-card prepare-card">
          <div className="card-section-title">
            <span className="step-badge">Step 1 & 2</span>
            <span>Prepare Kurdish Sample</span>
          </div>

          <div className="form-group">
            <KurdishEditor
              value={kurdishText}
              onChange={setKurdishText}
              label="Kurdish Transcript with Inline Tags"
              onSelectPreset={(text) => {
                setKurdishText(text);
              }}
              showInlineTagToolbar={true}
            />
          </div>

          {/* Optional Metadata */}
          <div className="grid-2 form-row-compact">
            <div className="form-group">
              <label className="form-label">Voice Used (Optional)</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Adam, Rachel, Nicole"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. ElevenLabs website v3 model test"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="prepare-actions">
            <button
              type="button"
              className="btn btn-accent btn-lg pulse-glow"
              onClick={handlePrepareAndCopy}
              disabled={isPreparing || !kurdishText.trim()}
              id="btn-copy-prepare"
              style={{ width: '100%' }}
            >
              <Copy size={18} />
              <span>Copy Text & Prepare Sample</span>
            </button>

            <a
              href="https://elevenlabs.io/app/speech-synthesis/text-to-speech"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-md"
              style={{ width: '100%' }}
            >
              <span>Open ElevenLabs Text to Speech</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>

        {/* Right Column: Drag & Drop Dropzone + Active Pairing */}
        <div className="dropzone-column">
          {/* Dropzone Card */}
          <div className="glass-card dropzone-card">
            <div className="card-section-title">
              <span className="step-badge">Step 3 & 4</span>
              <span>Drop ElevenLabs Audio (WAV)</span>
            </div>

            {/* Active Pending Target Indicator */}
            {activePendingId ? (
              <div className="active-pairing-target">
                <div className="target-label">
                  <Clock size={14} className="text-cyan" />
                  <span>Matching to Prepared Sample:</span>
                </div>
                <div className="kurdish-text target-kurdish-preview" dir="rtl">
                  {pendingList.find(p => p.pendingId === activePendingId)?.text}
                </div>
                <div className="target-meta">
                  <span className="badge badge-emerald">
                    {pendingList.find(p => p.pendingId === activePendingId)?.emotion.toUpperCase()}
                  </span>
                  <span className="badge badge-dim">
                    Ready for WAV drop
                  </span>
                </div>
              </div>
            ) : (
              <div className="no-target-warning">
                <AlertTriangle size={15} className="text-amber" />
                <span>No active sample prepared yet. Click "Copy Text & Prepare Sample" first!</span>
              </div>
            )}

            {/* Drag & Drop Zone */}
            <div
              className={`drop-area ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFileDrop(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".wav,audio/wav,audio/x-wav,.mp3,audio/mpeg"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileDrop(e.target.files[0]);
                  }
                }}
              />

              <div className="drop-icon-wrap">
                <Upload size={32} className="text-cyan" />
              </div>
              <div className="drop-text-main">
                {isUploading ? 'Saving & Associating Audio...' : 'Drag & Drop Downloaded WAV Here'}
              </div>
              <div className="drop-text-sub">
                or click to browse from your computer
              </div>
              <div className="drop-badge">
                <FileAudio size={12} />
                <span>Accepts .wav / .mp3 from ElevenLabs</span>
              </div>
            </div>

            {/* Note on Kurdish font rendering in ElevenLabs Share Video */}
            <div className="kurdish-safe-banner">
              <div className="safe-banner-title">✨ Kurdish Unicode Protection Guarantee</div>
              <div className="safe-banner-text">
                ElevenLabs' website video sharing may show <code>□□□□</code> boxes due to web font issues. This tool completely bypasses that problem by taking the exact Unicode transcript stored in Step 2 and pairing it directly with your clean audio!
              </div>
            </div>
          </div>

          {/* Pending Prepared Queue */}
          {pendingList.length > 0 && (
            <div className="glass-card pending-queue-card">
              <div className="card-section-title">
                <Clock size={16} className="text-cyan" />
                <span>Pending Prepared Samples ({pendingList.length})</span>
              </div>
              <div className="pending-items-list">
                {pendingList.map((item) => (
                  <div
                    key={item.pendingId}
                    className={`pending-item ${activePendingId === item.pendingId ? 'active-item' : ''}`}
                    onClick={() => setActivePendingId(item.pendingId)}
                  >
                    <div className="pending-item-content">
                      <div className="kurdish-text pending-item-text" dir="rtl">
                        {item.text}
                      </div>
                      <div className="pending-item-meta">
                        <span className={`badge emotion-badge-${item.emotion}`}>{item.emotion}</span>
                        <span className="pending-time">{new Date(item.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-ghost btn-icon btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePending(item.pendingId);
                      }}
                      title="Remove from queue"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Paired Sample Preview */}
          {lastPairedSample && (
            <div className="glass-card glass-card-glow paired-sample-card">
              <div className="output-card-header">
                <div className="output-badge-group">
                  <span className="badge badge-emerald">Successfully Created</span>
                  <span className="badge badge-cyan">ID: {lastPairedSample.id}</span>
                  <span className={`badge emotion-badge-${lastPairedSample.emotion}`}>
                    {lastPairedSample.emotion.toUpperCase()}
                  </span>
                </div>
                <button
                  className="aux-btn"
                  onClick={() => setInspectingSample(lastPairedSample)}
                >
                  Inspect JSON
                </button>
              </div>

              <div className="output-kurdish-box">
                <div className="kurdish-text output-kurdish-text" dir="rtl">
                  {lastPairedSample.text}
                </div>
              </div>

              <AudioPlayer
                src={lastPairedSample.audioUrl || `/api/dataset/${lastPairedSample.id}/audio`}
                sampleId={lastPairedSample.id}
                autoPlay={true}
              />

              <RatingWidget
                ratings={lastPairedSample.ratings}
                onSaveRatings={handleSaveRatings}
              />
            </div>
          )}
        </div>
      </div>

      {/* Inspect Metadata Modal */}
      {inspectingSample && (
        <MetadataModal
          sample={inspectingSample}
          onClose={() => setInspectingSample(null)}
          onSampleUpdated={(updated) => {
            setInspectingSample(updated);
            if (lastPairedSample?.id === updated.id) {
              setLastPairedSample(updated);
            }
          }}
        />
      )}

      <style>{`
        .normal-page-root {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .workflow-steps-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 16px 24px;
          gap: 12px;
          overflow-x: auto;
        }

        .step-card {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 180px;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981, #059669);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          flex-shrink: 0;
        }

        .step-title {
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--text-main);
        }

        .step-sub {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .step-arrow {
          color: var(--text-dim);
          flex-shrink: 0;
        }

        .normal-grid-layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1100px) {
          .normal-grid-layout {
            grid-template-columns: 1fr;
          }
        }

        .card-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 16px;
        }

        .step-badge {
          background: rgba(16, 185, 129, 0.15);
          color: #34D399;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }

        .prepare-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
        }

        .dropzone-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .active-pairing-target {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          margin-bottom: 16px;
        }

        .target-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .target-kurdish-preview {
          font-size: 1.15rem;
          color: #FFFFFF;
          margin-bottom: 8px;
        }

        .target-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .no-target-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          font-size: 0.8rem;
          color: #FBBF24;
          margin-bottom: 16px;
        }

        .drop-area {
          border: 2px dashed rgba(56, 189, 248, 0.35);
          border-radius: var(--radius-lg);
          background: rgba(15, 23, 42, 0.5);
          padding: 36px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .drop-area:hover, .drop-area.dragging {
          border-color: #38BDF8;
          background: rgba(56, 189, 248, 0.08);
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(56, 189, 248, 0.2);
        }

        .drop-icon-wrap {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(56, 189, 248, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .drop-text-main {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .drop-text-sub {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .drop-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          color: #38BDF8;
          background: rgba(56, 189, 248, 0.1);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          margin-top: 14px;
        }

        .kurdish-safe-banner {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          margin-top: 16px;
        }

        .safe-banner-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #34D399;
          margin-bottom: 4px;
        }

        .safe-banner-text {
          font-size: 0.76rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .pending-items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 220px;
          overflow-y: auto;
        }

        .pending-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid var(--border-subtle);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .pending-item:hover {
          border-color: rgba(56, 189, 248, 0.4);
          background: rgba(30, 41, 59, 0.8);
        }

        .pending-item.active-item {
          border-color: #38BDF8;
          background: rgba(56, 189, 248, 0.1);
        }

        .pending-item-content {
          flex: 1;
        }

        .pending-item-text {
          font-size: 0.95rem;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 320px;
        }

        .pending-item-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .pending-time {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-dim);
        }

        .paired-sample-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
      `}</style>
    </div>
  );
};
