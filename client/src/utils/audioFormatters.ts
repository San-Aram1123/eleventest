import { Sample } from '../types';

/**
 * Extracts numeric audio duration in seconds from a sample.
 */
export function getSampleDuration(s: Sample | any): number {
  if (!s) return 0;
  return Number(s.duration_seconds ?? s.durationSeconds ?? s.customMetadata?.duration_seconds ?? 0);
}

/**
 * Formats duration in seconds into human-readable compact time (e.g. "1h 12m" or "4m 23s").
 */
export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${seconds}s`;
}

/**
 * Formats duration in seconds into detailed time (e.g. "1h 12m 30s" or "32s").
 */
export function formatDurationDetailed(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const remSec = s % 60;

  if (h > 0) return `${h}h ${m}m ${remSec}s`;
  if (m > 0) return `${m}m ${remSec}s`;
  return `${remSec}s`;
}

/**
 * Formats byte size into KB or MB string.
 */
export function formatAudioSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(0)} KB`;
}
