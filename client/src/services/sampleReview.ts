import { Sample } from '../types';

export function getSampleReview(sample: Sample) {
  const extra = { ...(sample.metadata_extra || {}), ...(sample.customMetadata || {}) };
  return {
    pending: (sample.review_status ?? extra.review_status) === 'pending',
    warnings: (sample.review_warnings ?? extra.review_warnings ?? []) as string[],
    masterUrl: extra.review_master_url as string | undefined,
    diagnosticsUrl: extra.review_diagnostics_url as string | undefined,
    start: extra.review_start_seconds as number | undefined,
    end: extra.review_end_seconds as number | undefined
  };
}

export async function markSampleReviewed(id: string): Promise<Sample> {
  const response = await fetch(`/api/dataset/${encodeURIComponent(id)}/review`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'reviewed' })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not save review.');
  return data.sample;
}
