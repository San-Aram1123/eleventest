# Audar-TTS-V20 Master Dataset Plan

## Executive Overview

**Project:** Audar-TTS-V20 Expressive Speech Dataset System  
**Primary Language:** Kurdish Sorani (`ckb`) — 80% of production  
**Secondary Languages:** Arabic (`ar`) — 13.33%, English (`en`) — 6.67%  
**Production Target:** Up to 300,000 synthetic candidate recordings  
**Primary Providers:** Gemini TTS & ElevenLabs (150,000 candidates each)  
**Core Goal:** Deliver an enterprise-grade training corpus for a TTS model capable of natural Kurdish Sorani speech featuring intra-utterance continuous emotion switching, simultaneous emotional blending, delivery shifts, and nonverbal vocal actions.

---

## Non-Negotiable Core Rules (P0 Priorities)

1. **P0 — Linguistic Integrity:** Correct Kurdish Sorani pronunciation, grammar, and naturalness. Never sacrifice pronunciation for exaggerated emotion.
2. **P0 — Genuine Continuous Performance:** Continuous multi-emotion speech must be generated as a **single uninterrupted performance**. Concatenating independently generated audio files and calling them continuous is strictly forbidden.
3. **P0 — Intended vs. Verified Separation:** Prompt compliance does not imply acoustic realization. Requested/intended labels must be stored separately from acoustically verified and human-reviewed labels.
4. **P0 — Strict Model Policy:** Strictly adhere to the requested Gemini models (`gemini-3.8-flash-tts` or `gemini-3.1-flash-tts-preview`). Never silently downgrade to Gemini 2.5 or any unapproved fallback.
5. **P0 — Pilot First:** Mass generation (300,000 candidates) is blocked until the Phase 3 Controlled Pilot (1,000 Kurdish Sorani recordings) passes native human and acoustic review.

---

## Production & Allocation Matrix

| Category | Gemini TTS | ElevenLabs | Combined Total | Target % |
|:---|---:|---:|---:|---:|
| **Continuous Multi-Emotion Speech** | 60,000 | 60,000 | 120,000 | 40.0% |
| **Individual Emotions (50 Taxonomy)** | 40,000 | 40,000 | 80,000 | 26.7% |
| **Speaking & Delivery Styles** | 20,000 | 20,000 | 40,000 | 13.3% |
| **Long-Form Expressive Narration (20–90s)** | 20,000 | 20,000 | 40,000 | 13.3% |
| **Nonverbal Vocal Actions** | 10,000 | 10,000 | 20,000 | 6.7% |
| **TOTAL CANDIDATES** | **150,000** | **150,000** | **300,000** | **100.0%** |

### Language Breakdown
* **Kurdish Sorani (`ckb`):** 240,000 recordings (120k Gemini / 120k ElevenLabs)
* **Arabic (`ar`):** 40,000 recordings (20k Gemini / 20k ElevenLabs)
* **English (`en`):** 20,000 recordings (10k Gemini / 10k ElevenLabs)

---

## Two-Manifest Dataset Architecture

The canonical dataset maintains two distinct manifest layers:

```
[Audio Intake & QC Pipeline]
            │
            ▼
┌──────────────────────────────────────────────┐
│  metadata.jsonl (Canonical Corpus Manifest)   │
│  - Raw audio WAV paths & checksums           │
│  - Normalized transcripts & character spans  │
│  - Independent annotation tracks:             │
│      * Emotion track (intended vs verified)  │
│      * Delivery track (mode/style/rate)      │
│      * Vocal action track                    │
│      * Word & phoneme alignments             │
│  - Full provenance & licensing tags          │
│  - Quality gate statuses (Gate A - Gate F)   │
└──────────────────────────────────────────────┘
            │
            │ (Deterministic Tokenization: approved samples only)
            ▼
┌──────────────────────────────────────────────┐
│  tokens.jsonl (Acoustic Training Manifest)    │
│  - Sample ID, Speaker, Language, Split       │
│  - NeuCodec tokens (24 kHz, ~50 fps)         │
│  - Frame-indexed intervals [start, end)      │
│  - Backward-compatible V19 emotion tags      │
│  - Conditioning reference metadata           │
└──────────────────────────────────────────────┘
```

---

## Phased Implementation Roadmap

* **Phase 0 — Repository Audit:** Inspect existing V18/V19 pipelines, alignment modules, and provider services in `server/`.
* **Phase 1 — Catalogs & Contracts:** Implement formal data contracts for the 50 emotions, 30 styles, 16 actions, and manifest schemas.
* **Phase 2 — Provider Adapters:** Construct unified provider adapters for Gemini TTS and ElevenLabs with key pools, retry logic, and provenance capture.
* **Phase 3 — Controlled Sorani Pilot:** Generate and evaluate the 1,000 Kurdish Sorani benchmark corpus (500 Gemini / 500 ElevenLabs).
* **Phase 4 — Quality & Verification Pipeline:** Deploy automated Gates A–E and Gate F native Kurdish listening review.
* **Phase 5 — Initial Controlled Scale:** Ramp production to 10,000–25,000 candidates with continuous monitoring.
* **Phase 6 — Model Integration & Conditioning:** Verify NeuCodec tokenization alignment and sequence length compatibility with the model engineering workstream.
* **Phase 7 — Full Production Scaling:** Execute scheduled daily generation batches up to 300,000 candidates.
* **Phase 8 — Dataset Release & Freeze:** Generate immutable, versioned training splits (`tokens.jsonl`) with complete provenance documentation.

---

## Document Index & Plan Breakdown

This master specification is decomposed into focused, modular sub-plans:

### Modular Sub-Plans (`docs/v20_plans/`)
1. [Taxonomy, Catalogs & Manifest Schemas](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/v20_plans/01_taxonomy_and_schemas.md) — 50 emotions, 30 delivery styles, 16 vocal actions, and JSON schemas.
2. [Kurdish Sorani Linguistic Pipeline](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/v20_plans/02_sorani_linguistic_pipeline.md) — Sorani grammar, Unicode normalization, script validator, and script generation.
3. [Continuous Speech & Multi-Track Annotations](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/v20_plans/03_continuous_speech_and_annotation.md) — Single-take continuous generation rules, C01–C09 patterns, and annotation tracks.
4. [Quality Gates, Verification & Lifecycle](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/v20_plans/04_quality_gates_and_lifecycle.md) — Gates A through F, state machine, and native human review protocol.
5. [NeuCodec Tokenization & Training Manifests](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/v20_plans/05_neucodec_tokenization_and_training.md) — NeuCodec 50 fps frame mapping, token generation, and training experiments A–E.
6. [Deduplication, Splitting & Quality Dashboard](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/v20_plans/06_deduplication_splitting_and_metrics.md) — Script hashing, group-aware 80/10/10 splitting, leakage control, and real-time metrics.

### Unified Provider Strategy (`docs/gemini_elevenlabs/`)
* [Provider Strategy & Dual-Source Architecture](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/gemini_elevenlabs/README.md) — Strategy overview, rights, licensing, and provider-neutral model.
* [Unified Provider Adapter Architecture](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/gemini_elevenlabs/01_provider_adapter_architecture.md) — Interface contract, rate-limiting, error classification, and usage tracking.
* [Gemini TTS Production Plan](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/gemini_elevenlabs/02_gemini_tts_plan.md) — Gemini 3.8/3.1 configuration, key rotation, continuous prompt translation, and Sorani nuances.
* [ElevenLabs Production Plan](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/gemini_elevenlabs/03_elevenlabs_plan.md) — Eleven Multilingual v2 / Turbo v2.5 settings, voice matching, script delivery, and stability control.
* [Comparative Pilot & Benchmarking Plan](file:///c:/Users/PC/Desktop/AntiGravity/eleventest/docs/gemini_elevenlabs/04_comparative_pilot_and_benchmarking.md) — 1,000-recording pilot protocol, matched vs. unique script testing, and quality weighting.

