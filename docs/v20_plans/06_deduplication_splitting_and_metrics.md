# Audar V20 Plan: Deduplication, Splitting & Quality Dashboard

## 1. Deduplication and Data Leakage Prevention

Data contamination invalidates model evaluation. Because synthetic generation can inadvertently produce repeated phrasing or minor rewrites of the same story, Audar V20 implements multi-layer leakage controls.

> [!CAUTION]
> **No Script Leakage Across Splits:**
> A script, dialogue, or story variant present in the `train` split must **never** appear in `val` or `test`. Exact text hashing is insufficient on its own; near-duplicates, translated adaptations, and paraphrased variants must be grouped into shared `story_family_id` clusters.

---

## 2. Leakage Prevention Architecture

```
  Raw Generated Transcripts (Gemini + ElevenLabs)
                        │
                        ▼
  ┌──────────────────────────────────────────────┐
  │ 1. Exact Normalization Hashing (NFC + Regex) │ ──► Deterministic script_id
  └──────────────────────────────────────────────┘
                        │
                        ▼
  ┌──────────────────────────────────────────────┐
  │ 2. Near-Duplicate Fuzzy Clustering           │ ──► Levenshtein > 0.85
  │    & Semantic Embedding Similarity           │     Cosine Sim > 0.88
  └──────────────────────────────────────────────┘
                        │
                        ▼
  ┌──────────────────────────────────────────────┐
  │ 3. Story Family & Rewrite Lineage Grouping   │ ──► Assign story_family_id
  └──────────────────────────────────────────────┘
                        │
                        ▼
  ┌──────────────────────────────────────────────┐
  │ 4. Group-Aware Splitter (GroupShuffleSplit)  │
  │    - Group by: story_family_id + speaker_id  │
  └──────────────────────────────────────────────┘
         │                   │                  │
         ▼                   ▼                  ▼
  [Train Set: ~80%]   [Val Set: ~10%]    [Test Set: ~10%]
```

### 2.1 Multi-Layer Deduplication Rules
1. **Deterministic Script ID:**
   $$\text{script\_id} = \text{SHA256}(\text{normalized\_unicode\_text})$$
   When Gemini and ElevenLabs generate the same script (in matched-script experiments), both candidate rows share the exact same `script_id`.
2. **Near-Duplicate Detection:** Scripts with Levenshtein edit distance similarity $> 85\%$ or semantic embedding cosine similarity $> 0.88$ are mapped to a single `story_family_id`.
3. **Voice & Lineage Tracking:** Voice clones or synthetic speaker personas are registered with explicit parent IDs to avoid speaker leakage across evaluation boundaries.

---

## 3. Group-Aware Dataset Splitting Policy

Splitting is performed deterministically using group-aware stratified shuffling:

### 3.1 Partition Targets
* **Training Partition (`train`):** Approximately 80% of retained hours.
* **Validation Partition (`val`):** Approximately 10% of retained hours (for checkpoint selection and hyperparameter tuning).
* **Test Partition (`test`):** Approximately 10% of retained hours (held-out final evaluation benchmark).

### 3.2 Evaluation Stratifications
The evaluation split is partitioned to test distinct generalization dimensions:
* **Unseen Scripts:** Completely novel Kurdish Sorani texts.
* **Unseen Voices:** Held-out synthetic voices never heard in the training split.
* **Unseen Transitions:** Complex transition combinations (e.g. C03 4-stage transitions) reserved strictly for zero-shot testing.
* **Human-Recorded Sorani Benchmark:** A persistent, immutable test set of 200 human-recorded native Kurdish Sorani utterances used to anchor absolute acoustic naturalness and pronunciation accuracy.

---

## 4. Dataset Quality Dashboard & Telemetry

A developer-facing dashboard monitors production in real-time, pulling directly from the SQLite database and manifest logs.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      AUDAR-TTS-V20 PRODUCTION DASHBOARD                      │
├────────────────────────────┬────────────────────────────┬────────────────────┤
│ Total Candidates: 48,210   │ Accepted Audio: 39,120     │ Retention: 81.1%   │
│ Gemini: 24,105 (49.9%)     │ ElevenLabs: 24,105 (50.1%) │ Training Hrs: 108h │
├────────────────────────────┴────────────────────────────┴────────────────────┤
│ Language Distribution:   [████████████████████░░░░] CKB 80.2% | AR 13.1% | EN 6.7%│
│ Continuous Multi-Emotion:[██████████░░░░░░░░░░░░░░] 39.8% (Target: 40.0%)    │
├──────────────────────────────────────────────────────────────────────────────┤
│ Provider Comparison (Pass Rates):                                            │
│ - Gemini:     Gate A: 99.8% | Gate B: 91.2% | Gate C: 96.4% | Gate F: 4.3/5 │
│ - ElevenLabs: Gate A: 99.9% | Gate B: 89.4% | Gate C: 98.1% | Gate F: 4.1/5 │
├──────────────────────────────────────────────────────────────────────────────┤
│ Rejection Taxonomy:                                                          │
│ [████████] Dropped Clause (Gate B) 42%                                       │
│ [████]     Pronunciation Flaw (Gate F) 21%                                   │
│ [███]      Audio Clipping/Noise (Gate C) 18%                                 │
│ [██]       Speaker Drift (Gate E) 12%                                        │
│ [█]        Emotion Mismatch (Gate D) 7%                                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Dashboard Core Telemetry Metrics
1. **Production Volume:** Daily candidate generations vs daily maximum caps (5,000/day/provider).
2. **Quality Funnel:** Rejection percentage per gate (Gates A through F).
3. **Emotion & Style Matrix:** 50-emotion heatmap displaying generated vs accepted durations per cell.
4. **Duration Histogram:** Distribution across short (3–10s), medium (10–20s), extended (20–40s), long (40–60s), and experimental (60–90s) buckets.
5. **Cost & Quota Ledger:** Real-time API token consumption, dollar expenditure per accepted training hour, and key pool rotation activity.

