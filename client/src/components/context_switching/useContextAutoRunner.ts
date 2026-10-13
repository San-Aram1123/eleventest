import { useEffect, useRef, useState } from 'react';
import { Sample } from '../../types';
import { parseLabOptions } from '../../services/contextLabUtils';
import { fetchSample } from '../../services/api';
import { extractParagraphsArray } from '../../data/contextSwitchingPresets';
import { AutoDraft, AutoJob, createAutoJob, controlAutoJob, getAutoJob, listAutoJobs } from '../../services/contextAutoApi';
import { clearAutoJobView, createAutoJobId, isAutoJobFinished, readAutoDraft, readAutoStorage, readPendingAutoRequest, writeAutoStorage } from '../../services/contextAutoStorage';

export function useContextAutoRunner(onSampleCreated: (sample: Sample) => void) {
  const [draft, setDraft] = useState<AutoDraft>(readAutoDraft);
  const [jobId, setJobId] = useState<string | null>(() => readAutoStorage('job-id', null));
  const [job, setJob] = useState<AutoJob | null>(null);
  const [history, setHistory] = useState<AutoJob[]>([]);
  const [pending, setPending] = useState(readPendingAutoRequest);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callback = useRef(onSampleCreated);
  const notified = useRef(new Set<string>());
  const viewVersion = useRef(0);
  callback.current = onSampleCreated;
  useEffect(() => {
    try { writeAutoStorage('draft', draft); }
    catch { setError('Browser draft storage is unavailable. Submitted job progress is still stored on the server.'); }
  }, [draft]);
  useEffect(() => { try { writeAutoStorage('job-id', jobId); } catch { /* Server history remains available. */ } }, [jobId]);

  useEffect(() => {
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const response = await listAutoJobs(abort.signal);
        if (!abort.signal.aborted) setHistory(response.jobs);
      } catch { /* The active job poll reports connection errors. */ }
      if (!abort.signal.aborted) timer = setTimeout(() => void poll(), 10000);
    }
    void poll();
    return () => { abort.abort(); clearTimeout(timer); };
  }, []);
  useEffect(() => {
    if (!jobId || busy) return;
    const version = viewVersion.current;
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const current = await getAutoJob(jobId!, abort.signal);
        if (abort.signal.aborted || version !== viewVersion.current) return;
        setJob(current); setError(null);
        if (readPendingAutoRequest()?.id === current.id) {
          try { writeAutoStorage('submission', null); } catch { /* Reconnect from server history. */ }
        }
        setPending(previous => previous?.id === current.id ? null : previous);
        const fresh = current.batches.flatMap(batch => batch.saved).filter(item => !notified.current.has(item.id));
        // A refresh reconnects to saved samples too; App deduplicates them by ID.
        for (let start = 0; start < fresh.length && !abort.signal.aborted; start += 6) {
          const chunk = fresh.slice(start, start + 6);
          await Promise.all(chunk.map(async item => {
            try {
              const sample = await fetchSample(item.id);
              if (!abort.signal.aborted && version === viewVersion.current) { callback.current(sample); notified.current.add(item.id); }
            } catch { /* Retry dataset synchronization at the next poll. */ }
          }));
        }
      } catch (failure) {
        if (!abort.signal.aborted && version === viewVersion.current) setError(`Reconnecting to saved progress: ${failure instanceof Error ? failure.message : 'server unavailable'}`);
      }
      if (!abort.signal.aborted && version === viewVersion.current) timer = setTimeout(() => void poll(), 2000);
    }
    void poll();
    return () => { abort.abort(); clearTimeout(timer); };
  }, [jobId, busy]);

  async function start() {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const { text, ...config } = draft;
      const submission = pending || { ...config, id: createAutoJobId(), paragraphs: extractParagraphsArray(text) };
      if (!submission.paragraphs.length || submission.paragraphs.length > 3000) throw new Error('Paste 1?3000 paragraphs.');
      if (submission.paragraphs.join('').length > 1000000) throw new Error('Use at most one million characters.');
      if (submission.speaker1Voice === submission.speaker2Voice) throw new Error('Choose two distinct voices.');
      parseLabOptions('', submission.options, 6);
      for (let i = 0; i < submission.paragraphs.length; i += 6) {
        if (submission.paragraphs.slice(i, i + 6).join('').length > 50000) throw new Error('Each group of six must be under 50,000 characters.');
      }
      // Persist the exact submission before POST. Retrying uses the same idempotency ID.
      writeAutoStorage('submission', submission); setPending(submission);
      writeAutoStorage('job-id', submission.id); setJobId(submission.id);
      const created = await createAutoJob(submission);
      setJob(created); writeAutoStorage('submission', null); setPending(null);
      setHistory(previous => [created, ...previous.filter(item => item.id !== created.id)]);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not start job.'); }
    finally { setBusy(false); }
  }
  async function control(command: 'pause' | 'resume' | 'retry-analysis') {
    if (!job || busy) return;
    setBusy(true); setError(null);
    try { setJob(await controlAutoJob(job.id, command)); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Control failed.'); }
    finally { setBusy(false); }
  }
  function open(id: string) {
    if (id === jobId) return;
    viewVersion.current++; setJob(null); setJobId(id); setError(null);
  }
  function newJob() {
    if (busy || (pending && !(isAutoJobFinished(job?.status) && pending.id === job?.id))) return;
    viewVersion.current++;
    try { clearAutoJobView(job?.id); } catch { /* Server history remains intact. */ }
    if (pending?.id === job?.id) setPending(null);
    setJob(null); setJobId(null); setError(null); setDraft(previous => ({ ...previous, text: '' }));
  }
  return { draft, setDraft, job, history, busy, error, pending, start, control, open, newJob };
}
