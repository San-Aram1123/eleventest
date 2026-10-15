# Comparative Pilot & Benchmarking Plan

## 1. Executive Pilot Mission (Phase 3)

Before authorizing full-scale generation of 300,000 candidates, Audar V20 mandates a **controlled pilot of 1,000 Kurdish Sorani recordings**. 

The pilot divides tasks equally: **500 recordings generated with Gemini TTS** and **500 recordings generated with ElevenLabs**, subjected to rigorous head-to-head evaluation.

> [!IMPORTANT]
> The primary objective of the pilot is not to produce training volume, but to empirically evaluate provider capabilities, calibrate automated filters, and establish whether 50/50 is the optimal mixture for training.

---

## 2. 1,000-Recording Pilot Composition

| Test Category | Description | Gemini Takes | 11Labs Takes | Combined Total |
|:---|:---|---:|---:|---:|
| **Nine Existing Emotions** | V19 baseline emotions (`happy`, `sad`, `angry`, etc.) | 135 | 135 | 270 |
| **Six Selected New Emotions**| High-priority additions (`bitter`, `serene`, `panicked`, etc.)| 90 | 90 | 180 |
| **Two-Emotion Transitions (C01)**| Dual-state shifts (e.g., Neutral → Sad) | 100 | 100 | 200 |
| **3–5 Emotion Sequences (C02/03)**| Extended continuous narrative arcs | 60 | 60 | 120 |
| **Gradual Transitions (C05)**| Continuous rising/falling emotional curves | 40 | 40 | 80 |
| **Simultaneous Blends (C06)**| Co-occurring states (e.g., Bittersweet) | 25 | 25 | 50 |
| **Delivery Shifts (C07)** | Modal ↔ Whisper, Modal ↔ Laughing speech | 25 | 25 | 50 |
| **Nonverbal Actions (C08)** | Embedded sigh, gasp, chuckle within Sorani speech | 25 | 25 | 50 |
| **PILOT TOTAL** | | **500** | **500** | **1,000** |

---

## 3. Matched-Script vs. Unique-Script Methodology

```
┌────────────────────────────────────────────────────────┐
│               Pilot Task Allocation (1,000)            │
└────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌──────────────────┐               ┌──────────────────┐
│ Matched Scripts  │               │  Unique Scripts  │
│ 20% (200 takes)  │               │ 80% (800 takes)  │
│ 100 Identical    │               │ 400 Unique CKB   │
│ Scripts to Both  │               │ Prompts to Each  │
└──────────────────┘               └──────────────────┘
```

### 3.1 20% Matched-Script Protocol (Direct A/B Testing)
* 100 distinct Kurdish Sorani scripts are submitted to **both** Gemini TTS and ElevenLabs with identical intended emotions, intensities, and duration targets.
* Evaluated side-by-side in double-blind listening tests by native Sorani reviewers.
* Isolates provider-specific acoustic rendering from text-bias variance.

### 3.2 80% Unique-Script Protocol (Corpus Diversity)
* 400 unique scripts distributed to Gemini; 400 unique scripts to ElevenLabs.
* Prevents scenario duplication and maximizes linguistic variety across dialogue types.

---

## 4. The 8 Critical Research Questions

The pilot must definitively answer these 8 empirical questions before scaling:

1. **Sorani Pronunciation:** Does Gemini or ElevenLabs produce more authentic vowel values (ێ, ۆ, ە) and consonant weights (ڕ, ڵ)?
2. **Emotional Expressiveness:** Which engine achieves stronger dynamic range and emotional realism without falling into caricature?
3. **Transition Continuity:** When switching emotions mid-sentence, which provider maintains an uninterrupted single-take performance with zero boundary silence or acoustic resets?
4. **Delivery Nuances:** Which provider excels at whisper phonation, laughing speech, and strained vocal effort?
5. **Speaker Identity Stability:** Which system preserves vocal persona and timbre more reliably across long takes without timbre drift?
6. **Transcript Correspondence:** Which provider yields a lower Word Error Rate (WER) and fewer dropped clauses under Whisper ASR screening?
7. **Long-Form Durability:** Which engine sustains quality over 30–60 seconds without babbling or repetitive cadence?
8. **Generation Reliability:** What is the real-world HTTP 429 rate, latency, and cost per valid candidate minute for each engine?

---

## 5. Comparative Evaluation Rubric (Gate F)

Blind review by native Kurdish Sorani linguists evaluates candidates across five dimensions (scored 1.0 to 5.0):

```
Provider A/B Blind Listening Form
────────────────────────────────────────────────────────
Candidate Sample ID: ____________________________________
Target Emotion:      [Neutral ──► Sad ──► Angry]
Target Language:     Kurdish Sorani (ckb)

1. Pronunciation Accuracy:   [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
   (Vowel authenticity, consonant realism, zero foreign accent)

2. Emotional Realism:        [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
   (Audible presence and believability of intended emotion)

3. Transition Fluidity:      [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
   (Smooth intra-sentence shift, no boundary click or silence)

4. Natural Vocal Cadence:    [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
   (Authentic Central Kurdish conversational rhythm)

5. Voice Stability:          [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
   (Zero speaker timbre drift or pitch collapse)
────────────────────────────────────────────────────────
Overall Recommendation: [ ] Accept  [ ] Needs Review  [ ] Reject
```

---

## 6. Dynamic Training Weighting Strategy

> [!TIP]
> The final training mixture is **not assumed to be 50/50**. The pilot data establishes category-specific quality weights.

For example, if the pilot reveals:
* ElevenLabs achieves 4.7/5 on *Whispering & Delivery Shifts*, but 3.8/5 on *High-Anger Transitions*.
* Gemini achieves 4.6/5 on *Continuous Multi-Emotion Sequences*, but 3.9/5 on *Whispering*.

The production scheduler will adjust generation weights dynamically:
$$\text{Weight}_{\text{Gemini, Transitions}} = 0.70, \quad \text{Weight}_{\text{ElevenLabs, Transitions}} = 0.30$$
$$\text{Weight}_{\text{Gemini, Whisper}} = 0.25, \quad \text{Weight}_{\text{ElevenLabs, Whisper}} = 0.75$$

This ensures the final Audar-TTS-V20 model trains on the highest-fidelity outputs from each provider.

