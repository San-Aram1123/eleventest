# Automated speaker slicing

Open **Context Switching Studio → Auto Batch**, next to the existing Speaker Slicing Lab. The Lab stays mounted when changing tabs, preserving its current master and comparison results.

Paste one paragraph per line, select two voices and the exact Gemini model, and start. The server reserves increasing dataset indices and splits the text into consecutive groups of six. The final group uses its remaining one to five paragraphs; nothing is dropped. A generation worker creates masters through the existing enabled-key pool while a separate slicing worker runs all seven methods, selects a complete result, and saves clips. Up to three completed masters wait on disk for analysis; generation waits when that backlog is full. Each stage uses one worker to avoid CPU contention and uncontrolled quota usage. Neural models stay loaded in a persistent Python process, with fresh speaker enrollment for every master.

## Selection

All new lab methods run: Timbre DP, Spectral Change, CAM++, ResNet34, ERes2Net, CAM++ strict quiet, and three-model consensus. The older optional legacy detectors remain in the Lab; they are not enabled for unattended saving.

Automatic saving prefers three-model consensus. Otherwise it selects a complete accepted neural result, preferring multiscale refinement over the strict control, then minimum identity evidence. These scores are uncalibrated; the ranking is an explicit engineering policy rather than a measured probability of correctness. Accepted neural methods disagreeing by more than 250 ms at any cut still save the best accepted neural result, with Pending review warnings on every clip in that group. Warnings include the disputed boundary, method timestamps, and spread. Clips remain exportable, and Dataset Manager ? Pending review provides warning details, source master/diagnostics, and Mark reviewed controls. Review status survives disk and database reloads. Acoustic-only results are retained for comparison and review. Methods that fail their individual safety checks are not promoted to success.

Missing speaker models or disabled/missing project keys fail preflight before generation. The requested TTS model is preserved throughout key rotation. Slicing rejection never invokes individual requests or a different TTS model.

## Progress and recovery

- Processing runs on the server, independently of browser requests. Refreshing or closing the tab does not stop a job while its server remains running.
- Pasted drafts, settings, the selected job, and pending submission IDs are restored in the browser. The same submission ID cannot create a second job for the same text. Server job history also works after browser storage is cleared.
- Job manifests, master WAVs, selection decisions, compact diagnostics, per-clip save receipts, and index reservations live under `<dataset>/.context-auto/`. No API keys are stored in job files. Back up this directory along with the dataset to preserve resumability.
- Masters are checkpointed before local analysis. Dataset filenames are reserved in advance and published without replacing existing files. Save recovery verifies job ownership, paragraph identity, and exact audio bytes, including database metadata provenance, before reusing a saved clip.
- Pause finishes currently active generation and slicing tasks and prevents new tasks from starting. Generated backlog masters remain available for resume. Resume retries unfinished local analysis or saves using the checkpointed master. Local slicing rejection retains the master and continues with later groups; retry retained masters performs local analysis only.
- Generation/key-pool errors pause the queue. After a server restart, unfinished jobs pause for explicit resume. A generation interrupted before its master was checkpointed is marked as uncertain and is never automatically resent. Resume skips such groups; their original text remains available to copy into a deliberate new job.
- Progress includes saved paragraph count, processed groups, current stage, reserved indices, per-method results, selected method, downloadable masters/diagnostics, and saved audio links.

Original pasted UTF-8 text is preserved in dataset metadata. The existing Lab prompt normalization is used for synthesis. No ASR, forced alignment, generated markers, or paid external diarization service is added. Automatic acoustic acceptance still cannot establish that Gemini spoke every word; review production samples before relying on unattended generation.

## Stable hosting and logs

`host_wifi.bat` now starts plain `node server/index.js`, without Node watch mode. Source edits no longer restart active batches or clear the CMD output. Python bytecode writes are disabled for the host and persistent slicer. The existing running watch-mode host can hand off to this stable entry point after its watcher stops.

The Auto Batch progress panel reports generation and slicing separately, generated-master count, and backlog usage. CMD events are also appended to `<dataset>/.context-auto/activity.log`; the **Persistent terminal progress log** link opens their retained tail at `/api/context-auto/activity`.

A real process crash or manual server stop can still interrupt a generation request. Recovery inspects all in-flight generation groups even when an earlier group was concurrently analyzing. Masters already checkpointed are reused; requests with no checkpointed audio remain flagged and are not resent automatically.

## Validation

```powershell
npm run test:slicing
npm run test:context-lab --prefix client
python -m unittest discover -s server/slicing -p "test_*.py"
npm run build
```

The automation tests cover grouping/remainders, exact model and key-pool reuse, idempotent submissions, reserved indices, pause/resume, retained rejected masters, interrupted generation, partial saves, existing-file collisions, concurrent workers, UTF-8 preservation, and the real HTTP job/download routes. Generation is mocked; these checks spend no API quota.

An optional free real-model integration check uses the local David/Zira short-handoff fixture, writes a temporary dataset, and verifies selection, exact PCM coverage, and replay-free restoration:

```powershell
node server/tests/autoLocalBenchmark.mjs scratch/lab-fixture
```
