import React from 'react';

interface KurdishTagPreviewBannerProps {
  detectedTags: string[];
  tagCounts: Record<string, number>;
  cleanTranscript: string;
}

export const KurdishTagPreviewBanner: React.FC<KurdishTagPreviewBannerProps> = ({
  detectedTags,
  tagCounts,
  cleanTranscript
}) => {
  if (detectedTags.length === 0) return null;

  return (
    <div className="tags-detected-banner">
      <div className="detected-chips-row">
        <span className="detected-label">Active Speech Tags:</span>
        {Object.entries(tagCounts).map(([tag, count]) => (
          <span key={tag} className="tag-count-pill">
            <code>{tag}</code>
            {count > 1 && <span className="pill-count">×{count}</span>}
          </span>
        ))}
      </div>
      <div className="clean-transcript-row" dir="rtl">
        <span className="clean-label">Saved in JSON (Clean Unicode):</span>
        <span className="kurdish-text clean-text-val">{cleanTranscript || '(Empty)'}</span>
      </div>
    </div>
  );
};
