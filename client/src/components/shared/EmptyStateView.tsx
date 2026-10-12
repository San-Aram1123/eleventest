import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface EmptyStateViewProps {
  icon: React.ReactNode;
  title: string;
  description: string | React.ReactNode;
  features?: string[];
  action?: React.ReactNode;
  className?: string;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  icon,
  title,
  description,
  features,
  action,
  className = ''
}) => {
  return (
    <div className={`glass-card empty-output-card ${className}`}>
      <div className="empty-icon-wrap">
        {icon}
      </div>
      <div className="empty-title">{title}</div>
      <div className="empty-sub">{description}</div>

      {features && features.length > 0 && (
        <div className="empty-features-list">
          {features.map((feat, idx) => (
            <div key={idx} className="feature-item">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      )}

      {action && <div style={{ marginTop: '16px' }}>{action}</div>}
    </div>
  );
};
