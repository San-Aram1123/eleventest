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
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          max-width: 520px;
          width: calc(100vw - 32px);
          pointer-events: none;
        }

        .toast-item {
          pointer-events: auto;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          border-radius: 9999px;
          background: rgba(22, 22, 26, 0.88);
          backdrop-filter: blur(28px) saturate(200%);
          -webkit-backdrop-filter: blur(28px) saturate(200%);
          box-shadow: 0 16px 44px -4px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-top: 1px solid rgba(255, 255, 255, 0.28);
          animation: dynamicIslandDrop 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        [data-theme="light"] .toast-item {
          background: rgba(255, 255, 255, 0.92);
          border-color: rgba(0, 0, 0, 0.08);
          border-top-color: rgba(255, 255, 255, 0.95);
          box-shadow: 0 16px 40px -4px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1);
        }

        @keyframes dynamicIslandDrop {
          from {
            transform: scale(0.85) translateY(-28px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        .toast-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .toast-success .toast-icon { color: var(--accent-emerald); }
        .toast-error .toast-icon { color: var(--accent-red); }
        .toast-info .toast-icon { color: var(--primary); }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .toast-title {
          font-weight: 600;
          font-size: 0.88rem;
          color: var(--text-main);
          white-space: nowrap;
        }
        .toast-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 320px;
        }

        .toast-close {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          margin-left: 4px;
        }
        .toast-close:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.18);
        }
        .toast-close:active {
          transform: scale(0.92);
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
