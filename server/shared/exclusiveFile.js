import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

// Publish a fully written file atomically, refusing to replace an existing target.
export function writeExclusiveFile(filename, content) {
  const temporary = `${filename}.${randomUUID()}.tmp`;
  const descriptor = fs.openSync(temporary, 'wx');
  try { fs.writeFileSync(descriptor, content); fs.fsyncSync(descriptor); }
  finally { fs.closeSync(descriptor); }
  try { fs.linkSync(temporary, filename); }
  finally { fs.unlinkSync(temporary); }
}
