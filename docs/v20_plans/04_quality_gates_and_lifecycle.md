# Audar V20 Plan: Quality Gates, Verification & Lifecycle

## 1. Quality Control Philosophy

Dataset quality directly dictates model intelligence. Under Audar V20 standards, candidate counts are subordinate to acoustic and linguistic fidelity. 

> [!IMPORTANT]
> A candidate audio file is never considered valid simply because an API returned an HTTP 200 response. Every file must pass a battery of 6 automated and human quality gates before being approved for NeuCodec tokenization and model training.

---

## 2. The 6-Stage Quality Filter Pipeline

```
  Generated Candidate Audio (WAV)
                │
                ▼
  ┌───────────────────────────┐
  │ Gate A: Structural Audio  │ ──► [Fail: Corrupt/Empty] ──► [Rejected]
  └───────────────────────────┘
                │ Pass
                ▼
  ┌───────────────────────────┐
  │ Gate B: Text Corresp.     │ ──► [Fail: Hallucination/Dropped] ──► [Rejected]
  └───────────────────────────┘
                │ Pass
                ▼
  ┌───────────────────────────┐
  │ Gate C: Acoustic Defects  │ ──► [Fail: Clipping/Noise/Echo] ──► [Rejected]
  └───────────────────────────┘
                │ Pass
                ▼
  ┌───────────────────────────┐
  │ Gate D: Expressive Conf.  │ ──► [Fail: Emotion Mismatch] ──► [Needs Review / Reject]
  └───────────────────────────┘
                │ Pass
                ▼
  ┌───────────────────────────┐
  │ Gate E: Speaker Stability │ ──► [Fail: Voice Drift] ──► [Rejected]
  └───────────────────────────┘
                │ Pass
                ▼
  ┌───────────────────────────┐
  │ Gate F: Native Human Rev. │ ──► [Fail: Bad Sorani Pronunciation] ──► [Rejected]
  └───────────────────────────┘
                │ Pass
                ▼
     [Accepted for Tokenization]
```

---

## 3. Quality Gate Specifications

### Gate A: Structural Audio Validation
* **File Format:** Valid RIFF WAVE header, PCM 16-bit or 24-bit.
* **Sample Rate:** Standardized (24,000 Hz or 48,000 Hz target).
* **Channels:** Strictly mono (1 channel).
* **Duration:** > 1.5s and within declared duration bucket ($\pm 10\%$).
* **Integrity:** Zero unreadable frames or header-payload mismatches.

### Gate B: Text Correspondence & ASR Screening
* **ASR Screening:** Run local acoustic transcription (Whisper Kurdish fine-tune or Meta MMS).
* **Word Error Rate (WER) / Character Match:** 
  * Strict limit: Word match $> 88\%$ for Sorani; $100\%$ key content words present.
* **Hallucination Detection:** Detect loops, babble, or unprompted text repetition.
* **Clause Dropping:** Ensure no beginning or ending clauses are truncated.

### Gate C: Acoustic Quality & Defect Analysis
* **Clipping & True Peak:** True peak must not exceed $-0.5\text{ dBFS}$. Zero clipped samples allowed.
* **Signal-to-Noise Ratio (SNR):** Minimum background SNR $> 32\text{ dB}$.
* **Silence Trimming:** Leading silence $< 250\text{ms}$; trailing silence $< 400\text{ms}$.
* **Artifact Detection:** No robotic comb filtering, phase cancellation, or trailing codec clicks.

### Gate D: Expressive & Transition Verification
* **Acoustic Classifier:** Local audio emotion classification model checks for presence of requested primary emotion.
* **Transition Point Verification:** Continuous files (C01–C09) are checked at marked transition points for significant acoustic trajectory shifts (F0 mean, spectral tilt, energy envelope).
* **Intensity Check:** High-intensity prompts must show greater dynamic pitch excursion than medium/low baselines.

### Gate E: Speaker Identity & Stability
* **Embedding Verification:** Extract speaker verification embeddings (e.g., ECAPA-TDNN or Resemblyzer) from three 1.5s segments: beginning, middle, and end.
* **Cosine Similarity Threshold:** Intra-take speaker similarity must remain $\ge 0.85$.
* **Accent Drift:** Voice must not drift into Persian-accented or Arabic-accented phonology during Sorani takes.

### Gate F: Native Kurdish Human Listening Protocol
Native Kurdish Sorani linguists review representative and ambiguous candidates using a structured 1–5 scoring rubric:
1. **Pronunciation & Accent (1–5):** Native vowel accuracy (ێ, ۆ, ە) and consonant distinction (ڕ vs ر, ڵ vs ل).
2. **Grammar & Fluency (1–5):** Natural clitic attachment and cadence.
3. **Emotional Realism (1–5):** Convincing performance matching the target label.
4. **Transition Smoothness (1–5):** Seamless emotional transition without unnatural hesitations.

---

## 4. Candidate State Machine & Lifecycle

Every candidate item has an immutable lifecycle state tracked in the database and manifest:

```
  [planned]
      │ (Generate API Call)
      ▼
  [generated]
      │ (Gates A, B, C Automated Checks)
      ▼
  [validated]
      │ (Forced Alignment Engine)
      ▼
  [aligned]
      │ (Gate D, E & Gate F Human Sampling)
      ▼
  [reviewed]
      │ (Promoted if Score >= 4.0)
      ▼
  [accepted]
      │ (NeuCodec Acoustic Tokenization)
      ▼
  [tokenized] ──► [training_ready]
```

### Terminal Exception States
* `rejected`: Permanently excluded from training sets. Reason recorded in `rejection_reason` taxonomy (e.g., `WER_TOO_HIGH`, `CLIPPING_DETECTED`, `VOICE_DRIFT`, `BAD_PRONUNCIATION`).
* `needs_review`: Edge cases flagged for human linguist verification before acceptance or rejection.

---

## 5. Idempotent Processing & Crash Recovery

1. **Deterministic Hashing:** 
   $$\text{script\_id} = \text{SHA256}(\text{normalized\_text} + \text{intended\_tags})$$
   $$\text{audio\_sha256} = \text{SHA256}(\text{raw\_wav\_bytes})$$
2. **Safe Resumability:** Generation scripts check for existing `script_id` and existing audio files before calling provider APIs. If a batch process crashes at sample 450 of 1,000, resuming the job starts at sample 451 without re-incurring API costs or creating duplicate records.
3. **Audit Trail:** Every state change records `timestamp`, `worker_id`, `git_commit`, and `component_version`.

