import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 400px;
          width: calc(100vw - 48px);
          pointer-events: none;
        }

        .toast-item {
          pointer-events: auto;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          background: rgba(18, 24, 38, 0.95);
          backdrop-filter: var(--glass-blur);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          border: 1px solid var(--border-medium);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .toast-item.toast-success {
          border-left: 4px solid var(--accent-emerald);
        }
        .toast-item.toast-error {
          border-left: 4px solid var(--accent-rose);
        }
        .toast-item.toast-info {
          border-left: 4px solid var(--primary);
        }

        .toast-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .toast-success .toast-icon { color: var(--accent-emerald); }
        .toast-error .toast-icon { color: var(--accent-rose); }
        .toast-info .toast-icon { color: var(--primary); }

        .toast-content {
          flex: 1;
        }
        .toast-title {
          font-weight: 600;
          font-size: 0.92rem;
          color: var(--text-main);
        }
        .toast-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 2px;
          line-height: 1.4;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          transition: color var(--transition-fast);
        }
        .toast-close:hover {
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className={`toast-item toast-${toast.type}`}>
      <div className="toast-icon">
        {toast.type === 'success' && <CheckCircle2 size={18} />}
        {toast.type === 'error' && <AlertCircle size={18} />}
        {toast.type === 'info' && <Info size={18} />}
      </div>
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        {toast.message && <div className="toast-desc">{toast.message}</div>}
      </div>
      <button className="toast-close" onClick={() => onDismiss(toast.id)}>
        <X size={14} />
      </button>
    </div>
  );
};
