import crypto from 'crypto';

/**
 * In-memory pending queue for the Normal ElevenLabs Website Workflow.
 * Allows users to prepare one or more Kurdish samples, copy text,
 * and automatically pair with uploaded WAV files.
 */
class PendingQueue {
  constructor() {
    this.queue = [];
  }

  /**
   * Add a prepared sample to the pending queue.
   */
  add({ text, emotion = 'neutral', emotionTag = '', notes = '', voiceName = '' }) {
    const item = {
      pendingId: 'prep_' + crypto.randomUUID().slice(0, 8),
      text: String(text || '').trim(),
      emotion: String(emotion || 'neutral').toLowerCase(),
      emotionTag: emotionTag || '',
      notes: notes || '',
      voiceName: voiceName || '',
      createdAt: new Date().toISOString()
    };
    this.queue.unshift(item); // Most recent first
    return item;
  }

  /**
   * Get all currently pending samples.
   */
  getAll() {
    return [...this.queue];
  }

  /**
   * Get the most recently prepared sample, or a specific pending ID.
   */
  get(pendingId) {
    if (pendingId) {
      return this.queue.find(item => item.pendingId === pendingId) || null;
    }
    return this.queue.length > 0 ? this.queue[0] : null;
  }

  /**
   * Consume (pair and remove) a pending sample.
   */
  consume(pendingId) {
    let index = -1;
    if (pendingId) {
      index = this.queue.findIndex(item => item.pendingId === pendingId);
    } else if (this.queue.length > 0) {
      index = 0; // Default to most recent
    }

    if (index !== -1) {
      const [item] = this.queue.splice(index, 1);
      return item;
    }
    return null;
  }

  /**
   * Remove a pending sample by ID without pairing.
   */
  remove(pendingId) {
    this.queue = this.queue.filter(item => item.pendingId !== pendingId);
  }

  /**
   * Clear all pending samples.
   */
  clear() {
    this.queue = [];
  }
}

export const pendingQueue = new PendingQueue();
