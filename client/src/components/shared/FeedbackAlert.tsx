import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface FeedbackAlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export const FeedbackAlert: React.FC<FeedbackAlertProps> = ({
  type,
  message,
  icon,
  className = ''
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} />;
      case 'error':
        return <AlertCircle size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'info':
      default:
        return <Info size={16} />;
    }
  };

  const alertClass = type === 'success' 
    ? 'feedback-success' 
    : type === 'warning' 
      ? 'no-target-warning' 
      : 'feedback-error';

  return (
    <div className={`feedback-alert ${alertClass} ${className}`}>
      {icon || getDefaultIcon()}
      <span>{message}</span>
    </div>
  );
};
