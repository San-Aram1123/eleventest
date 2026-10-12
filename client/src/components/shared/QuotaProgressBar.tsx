import React from 'react';

export interface QuotaProgressBarProps {
  used: number;
  total: number;
  label?: string;
  variant?: 'default' | 'mini';
  warnThreshold?: number;
  showDetails?: boolean;
}

export const QuotaProgressBar: React.FC<QuotaProgressBarProps> = ({
  used,
  total,
  label,
  variant = 'default',
  warnThreshold = 90,
  showDetails = true
}) => {
  const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const isWarn = percent >= warnThreshold;

  if (variant === 'mini') {
    return (
      <div className="meter-track-mini">
        <div
          className={`meter-fill ${isWarn ? 'meter-fill-warn' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  }

  return (
    <div className="quota-meter-box">
      {showDetails && (
        <div className="quota-labels">
          <span>{label || 'Quota Usage'}</span>
          <span>{percent}% ({used.toLocaleString()} / {total.toLocaleString()} used)</span>
        </div>
      )}
      <div className="meter-track">
        <div
          className={`meter-fill ${isWarn ? 'meter-fill-warn' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
