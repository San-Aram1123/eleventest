import { getSample, updateSampleMetadata } from '../datasetService.js';

export async function setSampleReviewStatus(id, status, { get = getSample, update = updateSampleMetadata } = {}) {
  if (!['pending', 'reviewed'].includes(status)) throw new Error('Review status must be pending or reviewed.');
  const sample = await get(id);
  if (!sample) throw new Error('Sample not found.');
  const extra = { ...(sample.metadata_extra || {}), ...(sample.customMetadata || {}) };
  const review = { review_status: status, reviewed_at: status === 'reviewed' ? new Date().toISOString() : null };
  // Update both repository representations so database reads and disk exports agree.
  const metadata = { ...extra, ...review };
  return update(id, { ...review, metadata_extra: metadata, customMetadata: metadata });
}
