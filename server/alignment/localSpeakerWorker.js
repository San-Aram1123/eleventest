import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { pythonExecutable, wavDuration, validateDetectorResult, supportedSpeakerMode, abortError } from './localSpeakerBridge.js';

const SCRIPT = fileURLToPath(new URL('../slicing/worker.py', import.meta.url));
const LIMIT = 4 * 1024 * 1024;

export function createPersistentSpeakerDetector({ executable = pythonExecutable, script = SCRIPT, timeoutMs = 180000 } = {}) {
  let child = null, pending = null, buffer = '', stderr = '', queue = Promise.resolve();
  function stop(error = new Error('Local speaker worker stopped.')) {
    const current = child; child = null;
    if (pending) { pending.reject(error); pending = null; }
    current?.kill(); buffer = ''; stderr = '';
  }
  function start() {
    if (child) return;
    const current = spawn(executable(), ['-u', '-B', script], { windowsHide: true, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
    child = current;
    current.stdout.on('data', data => {
      if (child !== current) return;
      buffer += data.toString();
      if (buffer.length > LIMIT) return stop(new Error('Local speaker worker output exceeded safety limit.'));
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
        if (!line.trim()) continue;
        try {
          const reply = JSON.parse(line);
          if (!pending || reply.id !== pending.id) throw new Error('Local speaker worker response ID mismatch.');
          const request = pending; pending = null; request.resolve(reply.result);
        } catch (error) { stop(error); return; }
      }
    });
    current.stderr.on('data', data => { if (child === current) stderr = (stderr + data.toString()).slice(-16384); });
    current.stdin.on('error', error => { if (child === current) stop(error); });
    current.on('error', error => { if (child === current) stop(error); });
    current.on('close', code => { if (child === current) stop(new Error(`Local speaker worker exited (${code}): ${stderr}`)); });
  }
  function send(payload, signal) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(abortError());
      start();
      const id = randomUUID();
      const timer = setTimeout(() => stop(new Error('Local speaker analysis timed out after 180 seconds.')), timeoutMs);
      const onAbort = () => stop(abortError());
      const finish = fn => value => { clearTimeout(timer); signal?.removeEventListener('abort', onAbort); fn(value); };
      pending = { id, resolve: finish(resolve), reject: finish(reject) };
      signal?.addEventListener('abort', onAbort, { once: true });
      child.stdin.write(JSON.stringify({ ...payload, id }) + '\n', error => { if (error) stop(error); });
    });
  }
  async function detect(audio, count, mode = 'all', options = {}, signal = null) {
    if (signal?.aborted) throw abortError();
    if (!Number.isSafeInteger(count) || count < 1 || !supportedSpeakerMode(mode)) throw new Error('Invalid local speaker mode or count.');
    const task = queue.catch(() => {}).then(async () => {
      const duration = await wavDuration(audio);
      const raw = await send({ audio, count, mode, options }, signal);
      return validateDetectorResult(raw, count, mode, options, duration);
    });
    queue = task.catch(() => {});
    return task;
  }
  return { detect, close: () => stop(), get pid() { return child?.pid || null; } };
}

export const persistentSpeakerDetector = createPersistentSpeakerDetector();
process.once('exit', () => persistentSpeakerDetector.close());
