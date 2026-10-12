import React from 'react';
import { FileAudio, Bot } from 'lucide-react';
import { AudioPlayer } from '../../AudioPlayer';
import { RatingWidget } from '../../RatingWidget';
import { Sample, SampleRatings, KurdishDialect } from '../../../types';

interface GeminiSingleAudioResultProps {
  generatedSample: Sample | null;
  generatedAudioUrl: string | null;
  dialect: KurdishDialect;
  selectedVoice: string;
  duration: number;
  usedKeyMasked: string;
  detectedTags: string[];
  activeRatings: SampleRatings;
  onRatingsChange: (newRatings: SampleRatings) => void;
}

export const GeminiSingleAudioResult: React.FC<GeminiSingleAudioResultProps> = ({
  generatedSample,
  generatedAudioUrl,
  dialect,
  selectedVoice,
  duration,
  usedKeyMasked,
  detectedTags,
  activeRatings,
  onRatingsChange
}) => {
  return (
    <div className="studio-right">
      {generatedSample ? (
        <div className="card result-card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileAudio size={18} className="text-cyan" />
              <span className="card-title">Generated Audio & Evaluation</span>
            </div>
            <span className="badge badge-success">
              Sample #{generatedSample.id}
            </span>
          </div>

          <div className="card-body">
            {/* Visual Audio Player */}
            <div className="player-wrapper">
              <AudioPlayer 
                src={generatedAudioUrl || generatedSample.audioUrl || `/api/dataset/${generatedSample.id}/audio`}
                sampleId={generatedSample.id}
              />
            </div>

            {/* Metadata Pill Grid */}
            <div className="meta-grid">
              <div className="meta-item">
                <span className="meta-lbl">DIALECT</span>
                <strong className="meta-val text-cyan" style={{ textTransform: 'capitalize' }}>
                  {generatedSample.dialect || dialect}
                </strong>
              </div>
              <div className="meta-item">
                <span className="meta-lbl">VOICE</span>
                <strong className="meta-val">{selectedVoice}</strong>
              </div>
              <div className="meta-item">
                <span className="meta-lbl">DURATION</span>
                <strong className="meta-val">{duration}s</strong>
              </div>
              <div className="meta-item">
                <span className="meta-lbl">KEY POOL</span>
                <strong className="meta-val text-green">{usedKeyMasked ? `Used: ${usedKeyMasked}` : 'Auto-Failover Active'}</strong>
              </div>
            </div>

            {/* Detected Inline Emotions */}
            {detectedTags.length > 0 && (
              <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Acted Emotions:</span>
                {detectedTags.map(tag => (
                  <span key={tag} className="badge badge-purple" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Kurdish Transcript Preview */}
            <div className="transcript-box" dir="rtl">
              {generatedSample.text}
            </div>

            {/* Rating Widget */}
            <div style={{ marginTop: '20px' }}>
              <RatingWidget
                ratings={generatedSample.ratings || activeRatings}
                onSaveRatings={onRatingsChange}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="card empty-result-card">
          <div className="empty-content">
            <div className="empty-icon-circle">
              <Bot size={36} className="text-cyan" />
            </div>
            <h3 className="empty-title">Ready for Sorani & Badini Speech</h3>
            <p className="empty-desc">
              Select between <strong>Sorani (سۆرانی)</strong> and <strong>Badini (بادینی)</strong>, choose a voice (default: <strong>Puck</strong>), and press <strong>Generate Speech</strong>.
            </p>
            <div className="feature-bullets">
              <div className="bullet-item">🗣️ <strong>Dual Dialect Support</strong>: Switch between Sorani and Badini anytime.</div>
              <div className="bullet-item">🛡️ <strong>Multi-Key Failover</strong>: Auto-cascades to backup keys on quota exhaustion.</div>
              <div className="bullet-item">🎭 <strong>Inline Emotions</strong>: Perform <code>[laugh]</code>, <code>[whisper]</code>, <code>[sigh]</code> seamlessly.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
