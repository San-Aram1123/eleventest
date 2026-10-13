import fs from 'node:fs';
import path from 'node:path';

export function logAutoProgress(job, message, batch = null, root = null) {
  const group = batch ? ` Group ${batch.number + 1}/${job.batches.length}` : '';
  const line = `[Context Auto ${job.id.slice(0, 8)}]${group} ${message}`;
  console.log(line);
  if (root) {
    try { fs.appendFileSync(path.join(root, 'activity.log'), `${new Date().toISOString()} ${line}\n`, 'utf8'); }
    catch (error) { console.warn('[Context Auto] Could not persist progress log:', error.message); }
  }
}
