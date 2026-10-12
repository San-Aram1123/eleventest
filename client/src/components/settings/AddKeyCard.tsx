import React from 'react';
import { Plus } from 'lucide-react';
import { FeedbackAlert } from '../shared/FeedbackAlert';

export interface AddKeyCardProps {
  newApiKey: string;
  onApiKeyChange: (val: string) => void;
  addingKey: boolean;
  feedback: { success: boolean; message: string } | null;
  onAddKey: (e: React.FormEvent) => void;
}

export const AddKeyCard: React.FC<AddKeyCardProps> = ({
  newApiKey,
  onApiKeyChange,
  addingKey,
  feedback,
  onAddKey
}) => {
  return (
    <div className="add-key-card">
      <div className="add-key-header">
        <Plus size={16} className="text-cyan" />
        <span className="add-key-title">Add Another ElevenLabs API Key to Pool</span>
      </div>

      <form onSubmit={onAddKey} className="add-key-form-inner">
        <div className="key-form-row">
          <input
            type="password"
            className="input-control key-input-field"
            placeholder="Paste ElevenLabs xi-api-key here (e.g. sk_...)"
            value={newApiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            id="add-api-key-input"
            disabled={addingKey}
          />
          <button
            type="submit"
            className="btn btn-primary add-key-submit-btn"
            disabled={addingKey || !newApiKey.trim()}
          >
            <Plus size={16} />
            <span>{addingKey ? 'Validating...' : 'Add Key'}</span>
          </button>
        </div>

        {feedback && (
          <FeedbackAlert
            type={feedback.success ? 'success' : 'error'}
            message={feedback.message}
          />
        )}
      </form>
    </div>
  );
};
