# Dual-Provider Strategy: Gemini TTS & ElevenLabs

## 1. Executive Summary

Audar-TTS-V20 utilizes a **dual-provider synthetic speech generation architecture** combining Google Gemini TTS and ElevenLabs. This strategy leverages the unique expressive strengths of both industry-leading models while mitigating single-provider dependencies, regional voice biases, and rate-limit bottlenecks.

```
┌────────────────────────────────────────────────────────┐
│         Unified Dataset Generation Scheduler           │
└────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌──────────────────┐               ┌──────────────────┐
│  Gemini Adapter  │               │ ElevenLabs Adapt │
│ - Gemini 3.8/3.1 │               │ - Multilingual v2│
│ - Key Pool Rot.  │               │ - Voice Clone    │
│ - Continuous Pmt │               │ - Stability Ctrl │
└──────────────────┘               └──────────────────┘
         │                                   │
         └─────────────────┬─────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│             Provider-Neutral Audio Intake              │
│       Checksum, Metadata & Provenance Logging          │
└────────────────────────────────────────────────────────┘
```

---

## 2. Allocation Targets & Quotas

| Parameter | Gemini TTS | ElevenLabs | Combined Strategy |
|:---|---:|---:|---:|
| **Daily Candidate Max** | 5,000 recordings | 5,000 recordings | 10,000 recordings/day |
| **Kurdish Sorani (`ckb`)** | 120,000 (80%) | 120,000 (80%) | 240,000 candidates |
| **Arabic (`ar`)** | 20,000 (13.33%) | 20,000 (13.33%) | 40,000 candidates |
| **English (`en`)** | 10,000 (6.67%) | 10,000 (6.67%) | 20,000 candidates |
| **Total Target Candidates**| **150,000** | **150,000** | **300,000 candidates** |

---

## 3. Strict Model & Fallback Policies

### 3.1 Zero Fallback to Gemini 2.5
In strict compliance with repository safety directives:
* Models permitted for Gemini generation: `gemini-3.8-flash-tts` or `gemini-3.1-flash-tts-preview`.
* **Prohibited Fallback:** Under no circumstances will any script or key manager fall back to `gemini-2.5-flash-preview-tts` upon encountering rate limits or quota exhaustion.
* **Rotation Policy:** When a key hits a rate limit (HTTP 429), the scheduler rotates to the next API key in the multi-project key pool. If all keys are exhausted, the batch pauses with exponential backoff.

### 3.2 Single-Take Ingestion Rule
Neither provider may produce continuous speech via segmented concatenation. The continuous prompt must be fulfilled in a single, uninterrupted generation request.

---

## 4. Contractual Compliance & Training Authorization

1. **Explicit Training Rights:** All generated audio is cataloged with verifiable contractual and API tier authorization confirming permission to use synthetic outputs for training proprietary downstream speech models.
2. **Attribution & Provenance:** Every WAV artifact is stamped with `provider`, `model_id`, `voice_id`, `request_id`, and `audio_sha256`.
3. **Key Privacy:** No API keys are written to disk, committed to Git, or exposed in JSONL manifests. Keys are loaded strictly from environment secrets.

---

## 5. Folder Contents & Sub-Plans

This directory contains the detailed engineering specifications for both providers:

1. [Unified Provider Adapter Architecture](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/gemini_elevenlabs/01_provider_adapter_architecture.md) — Standardized TypeScript/Python interface, rate-limit state machines, error classification, and provenance capture.
2. [Gemini TTS Production Plan](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/gemini_elevenlabs/02_gemini_tts_plan.md) — Model selection, multi-project key pooling, continuous emotional prompt engineering, and Kurdish Sorani script handling.
3. [ElevenLabs Production Plan](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/gemini_elevenlabs/03_elevenlabs_plan.md) — Multilingual v2 / Turbo v2.5 configuration, voice stability parameters, phonetic script delivery, and whisper phonation.
4. [Comparative Pilot & Benchmarking Plan](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/gemini_elevenlabs/04_comparative_pilot_and_benchmarking.md) — The Phase 3 1,000-sample Sorani benchmark pilot, 20% matched scripts protocol, and quality weighting methodology.

