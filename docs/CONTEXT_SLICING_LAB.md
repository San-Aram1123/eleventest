# Local speaker slicing lab

Open **Context Switching Studio → Slicing Lab**. Use **Analyze uploaded WAV** for an existing continuous dialogue, or **Generate new master** for one Gemini synthesis. Paste the original alternating lines in order. After any completed analysis, **Reuse last master** compares other settings on the same audio with zero TTS calls. Rejected analyses retain the master too.

## Modes

- **Speaker embedding:** genuine CAM++ ONNX embeddings over overlapping 1.5-second windows, compared to fixed global speaker centroids. Upload clean reference WAVs for both actual voices to anchor their identities; otherwise enrollment clusters the entire master and anchors Speaker 1 to its opening sustained speech. No window-local channel numbering or pitch-based identity.
- **Timbre DP:** NumPy spectral-envelope cepstra, integrated over sustained speech windows, with fixed full-recording centroids. This fast baseline needs no neural model.
- **Spectral change:** local spectral contrast contributes boundary evidence to the same alternating identity decoder. It is a comparison experiment; it is not statistically independent of Timbre DP.
- **WeSpeaker ResNet34:** independent 256-dimensional ONNX architecture, with model-specific amplitude scaling and feature normalization.
- **ERes2Net:** independent 192-dimensional 3D-Speaker ONNX architecture.
- **CAM++ strict quiet:** keeps the original 180 ms refinement search and mandatory 60 ms quiet interval as a control.
- **Three-model consensus:** requires all three neural architectures to accept, cuts within 200 ms, and a common quiet interval at least 6 ms wide. Missing/rejected models reject consensus; no substitutions.
- **Compare new methods:** runs all six detectors plus consensus on one master and reports each rejection independently. A successful method never stands in for a rejected method.
- **Legacy experiments:** earlier pitch, crossover, Pyannote, hybrid, and iterative modes remain available individually for comparison. Their confidence is not established by the new identity checks.

## Decoding and safety

The decoder selects exactly N alternating turns over the whole recording. Each segment must satisfy duration bounds and sustained identity confidence. Defaults adapt minimum/maximum duration to average turn length; override them for strongly unequal line lengths. Low confidence, missing voices, or an impossible path rejects the analysis rather than inventing cuts.

Speaker identity determines the rough handoff. Neural modes then enumerate up to eight quiet candidates within 750 ms, constrained by adjacent turns and duration bounds. Each candidate is checked using disjoint 0.8- and 1.2-second windows on both sides, with at least 25% voiced support. All four signed identity margins must exceed 0.15 for a gap of 60 ms or longer; shorter gaps require 0.30. The measured quiet core must be at least 20 ms. Energy windows are 8 ms with a 2 ms hop, using a relative power threshold of 1% of the local 80th percentile. These are experimental engineering thresholds, not calibrated probabilities.

Quiet candidates with the same speaker on both sides are rejected. The nearest candidate satisfying every check is selected, with a nearby low-amplitude sample for the cut. The acoustic baselines and strict control retain the original 60 ms gate. Seamless or overlapping speech with no verified quiet interval is rejected. Every boundary proposal survives rejection for playback in the uncut master; rejected results never export clips. Silence never chooses the global speaker order. Node independently checks timestamps, count, positive duration, continuity, and full-master coverage before extracting PCM slices. Clips preserve all original samples exactly once, with no post-cut breath stripping or edge trimming.

**Acceptance is an acoustic heuristic, not verification that Gemini read every word.** Without ASR there is no transcript completeness guarantee. Overlapping voices, similar timbres, very short turns, language-dependent identity drift, or omitted dialogue can remain ambiguous. Listen around each handoff before saving.

## Repeatable tests

In **Speaker references and evaluation settings**, enter N−1 increasing known boundary times (seconds). These labels are held out from detection and used only to report error. Labels outside the returned master are ignored with a warning, preserving that master for another local run. Adjust minimum/maximum turn duration and confidence threshold (0.5–1), then rerun the retained master. Diagnostics include timing, enrollment, confidence, and rejection details and can be downloaded as JSON without embedding audio.

Uploads accept mono/stereo 16-bit or 32-bit integer PCM WAV, 8–96 kHz, at most 50 MB and 10 minutes. Each UI test uses one master of 2–12 lines so scripts, clips, comparisons, and master playback stay associated. References must both be present or both absent.

## Free local setup

The NumPy frontend uses Python 3. The optional neural mode uses ONNX Runtime CPU and Kaldi-native FBANK; no Torch, ASR, hosted diarization service, Hugging Face token, or GPU is needed.

```powershell
python -m pip install -r server/slicing/requirements.txt
python server/slicing/setup_embedding.py --model all
npm run test:slicing
python -m unittest discover -s server/slicing -p "test_*.py"
npm run test:context-lab --prefix client
npm run build
```

The setup command downloads three checksum-pinned models once (about 80 MB total) into the user's cache; analysis itself never downloads models. `PYTHON` selects the Python executable. `SPEAKER_EMBEDDING_MODEL`, `SPEAKER_RESNET_MODEL`, and `SPEAKER_ERES2NET_MODEL` select compatible local models for each architecture. Each model?s metadata controls sample scaling and mean normalization; ResNet34 does not use the CAM++ normalization defaults. Missing dependencies or weights produce an explicit mode rejection.

To generate a reproducible, free Windows speech fixture (Microsoft David and Zira Desktop voices):

```powershell
python server/slicing/generate_test_fixture.py --output-dir scratch/lab-fixture
python server/slicing/detect.py scratch/lab-fixture/alternating_trimmed.wav 5 --mode=all --options-file=scratch/lab-fixture/options_trimmed.json
python server/slicing/generate_short_fixture.py scratch/lab-fixture
node server/tests/localModelBenchmark.mjs scratch/lab-fixture
node server/tests/localModelBenchmark.mjs scratch/lab-fixture --short
```

The fixture directory includes clean voice references and a metadata JSON with the original dialogue and safe handoff intervals. Its artificial internal pauses belong only to the local regression fixture, never to production synthesis prompts.

Generation honors the requested model and rotates project keys through the existing pool. Slicing failure never starts another synthesis, never falls back to individual line calls, and never changes the model to Gemini 2.5. Prompts request natural turn-taking without beeps, spoken markers, or artificial delay instructions. Stop cancels queued work and the active local subprocess.

## Research sources

- [3D-Speaker ONNX runtime and CAM++](https://github.com/modelscope/3D-Speaker/tree/main/runtime/onnxruntime): local speaker embeddings and training-compatible FBANK.
- [Sherpa ONNX speaker recognition models](https://github.com/k2-fsa/sherpa-onnx/releases/tag/speaker-recongition-models): ungated model distribution used by setup.
- [WeSpeaker](https://github.com/wenet-e2e/wespeaker): ResNet speaker verification and diarization toolkit.
- [Sherpa feature preprocessing](https://github.com/k2-fsa/sherpa-onnx/blob/master/sherpa-onnx/csrc/speaker-embedding-extractor-general-impl.h): metadata-controlled sample scaling and global-mean normalization.
- [Kaldi-native FBANK](https://github.com/csukuangfj/kaldi-native-fbank): lightweight Windows/Linux/macOS feature extraction.
- [Pyannote diarization pipeline](https://github.com/pyannote/pyannote-audio/blob/main/src/pyannote/audio/pipelines/speaker_diarization.py): full diarization combines local segmentations, speaker embeddings, and clustering; raw segmentation channels are not stable speaker identities.
- [Gemini speech generation](https://ai.google.dev/gemini-api/docs/speech-generation): two-speaker configuration and turn metadata.

The custom constrained decoder and confidence gates are engineering choices for this known alternating-speaker task. Benchmark thresholds against labeled real Kurdish/Arabic/English masters before relying on them for unattended dataset production.

## Local validation on this machine

A free Windows David/Zira five-turn fixture (39.14 seconds) includes 150 ms handoff gaps and longer internal pauses. The original CAM++ strict refinement produced 60.75 ms mean boundary error. Multiscale candidate refinement produced about 16 ms mean error across CAM++, ResNet34, and ERes2Net. Timbre DP and Spectral Change produced about 46 ms mean error. Evaluation labels did not guide decoding or refinement.

A derived 38.34-second fixture inserts 35 ms handoff gaps after trimming edge silence. CAM++, ResNet34, and ERes2Net each accepted all five turns, with about 11 ms mean error in the initial run. Consensus also accepted. The strict control and both acoustic baselines rejected the short gaps. Typical CPU times on this machine were approximately 2 seconds for CAM++, 3 seconds for ResNet34, and 4 seconds for ERes2Net, with larger variation under concurrent load. Compare-all reuses CAM++ identity extraction for its strict control; consensus reuses all three model results.

An existing 65.2-second single-Puck master, falsely declared as six alternating turns, was rejected by every new mode; the neural centroid separation ratios were 0.48?0.58, below the unchanged 1.3 gate.

The optional HTTP benchmark checks the real upload route, all models, retained master bytes, and reconstruction of the exact original PCM from every accepted clip set. Unit regressions additionally cover same-speaker troughs, insufficient quiet, weak or contradictory side evidence, widened search, alternating identity direction, consensus disagreement, and preservation of all failed proposals.

These are synthetic English and negative-control checks, not accuracy measurements on the dossier's original Kurdish/Arabic/English recording. That recording was not included with the dossier. Use uploaded-master mode and optional clean voice references to evaluate it without consuming synthesis quota.
