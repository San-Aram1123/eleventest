import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { writeExclusiveFile } from '../shared/exclusiveFile.js';

export function atomicJson(filename, value) {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${randomUUID()}.tmp`;
  const descriptor = fs.openSync(temporary, 'wx');
  try {
    fs.writeFileSync(descriptor, JSON.stringify(value, null, 2), 'utf8');
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
  try { fs.renameSync(temporary, filename); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}

export function atomicAudio(filename, buffer) {
  const temporary = `${filename}.${randomUUID()}.tmp`;
  const descriptor = fs.openSync(temporary, 'wx');
  try { fs.writeFileSync(descriptor, buffer); fs.fsyncSync(descriptor); }
  finally { fs.closeSync(descriptor); }
  try { fs.renameSync(temporary, filename); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}

export function readJson(filename, fallback = null) {
  try { return JSON.parse(fs.readFileSync(filename, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}

export function leaseAlive(filename) {
  const owner = readJson(filename);
  if (!owner) return false;
  try { process.kill(owner.pid, 0); return true; }
  catch (error) { return error.code !== 'ESRCH'; }
}

// Exclusive filesystem leases coordinate multiple Node servers sharing a dataset.
export function acquireLease(filename) {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const owner = { pid: process.pid, token: randomUUID() };
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      writeExclusiveFile(filename, JSON.stringify(owner));
      return () => {
        if (readJson(filename)?.token === owner.token) fs.unlinkSync(filename);
      };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (leaseAlive(filename)) return null;
      const releaseReclaim = acquireLease(`${filename}.reclaim`);
      if (!releaseReclaim) return null;
      try {
        if (leaseAlive(filename)) return null;
        try { fs.unlinkSync(filename); } catch (removeError) { if (removeError.code !== 'ENOENT') throw removeError; }
      } finally { releaseReclaim(); }
    }
  }
  return null;
}
