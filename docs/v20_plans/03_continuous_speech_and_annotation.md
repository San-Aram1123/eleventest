# Audar V20 Plan: Continuous Speech & Multi-Track Annotations

## 1. The P0 Continuous Performance Imperative

Audar V19 suffered from global, utterance-level emotional conditioning, preventing it from producing realistic continuous speech where emotions change mid-stream. Audar V20's primary architectural achievement is **genuine continuous multi-emotion performance**.

> [!CAUTION]
> **The Single-Take Ingestion Rule:**
> Every continuous multi-emotion dataset recording must be generated as **one single, uninterrupted performance by the provider's TTS engine**.
> **Under NO circumstances may two or more independently generated audio files be stitched, cross-faded, or concatenated together and labeled as continuous audio.** Concatenation introduces unnatural room-tone shifts, speaker resets, phase issues, and boundary silence that poison downstream model training.

---

## 2. The 9 Continuous Performance Patterns (C01–C09)

```
C01: Two-Emotion Switching       [Neutral] ──────────────────────────► [Sad]
C02: Three-Emotion Switching     [Happy] ────────► [Surprised] ──────► [Fearful]
C03: 4–5 Emotion Progression     [Neutral] ──► [Curious] ──► [Surprised] ──► [Sad] ──► [Relieved]
C04: Intra-Sentence Transition   [Tender] "I wanted to trust you... [Angry] but you lied!"
C05: Gradual Emotional Arc       Neutral ───────► Uneasy ───────► Anxious ───────► Panicked
C06: Time-Varying Blends         [Happy 0.7 + Sad 0.3] ──────────────► [Relieved 0.9]
C07: Delivery Switching          Modal Speech ────► Whispering ──────► Modal Speech
C08: Embedded Vocal Actions      [Sad Speech] ────► [Natural Sigh] ──► [Tender Speech]
C09: Long-Form Narration (20–90s)Sustained multi-scene expressive storytelling
```

### Detailed Pattern Specifications

#### C01: Two-Emotion Switching
* Transitions: Neutral → Emotion, Emotion → Neutral, and Emotion A → Emotion B.
* Boundary Rule: Voice identity must remain perfectly stable; no pitch drop or pause longer than a natural respiratory comma.

#### C02 & C03: Multi-Emotion Sequences (3–5 Transitions)
* Tests sustained speaker consistency across extended narrative sentences without acoustic reset.
* Narrative progression must justify the emotional arc (e.g., discovery → shock → grief).

#### C04: Intra-Sentence Transition
* Emotion changes occurring **within a single grammatical clause or sentence**.
* Punctuation marks (periods, dashes) are **not** required at emotional shift boundaries. The transition should sound natural, driven by the meaning of the words.

#### C05: Gradual Emotional Transitions
* Continuous time-varying curve where emotional arousal or valence steadily climbs or declines across 5 to 15 seconds.
* Annotations track `onset_s`, `inflection_s`, and `peak_s`.

#### C06: Time-Varying Simultaneous Blends
* Intra-utterance progression of blended emotional states (e.g., starting with *Bittersweet* and concluding with *Grateful Relief*).

#### C07: Delivery Mode Switching
* Realizes abrupt or smooth transitions in vocal projection, such as dropping from standard modal voice into a confidential whisper and returning to modal voice, or laughter bubbling up within normal speech.

#### C08: Integrated Nonverbal Vocal Actions
* Uninterrupted performance containing an embedded physiological event (e.g., spoken sadness followed by an audible sigh, seamlessly continuing into speech).

#### C09: Long-Form Expressive Narration (20–90s)
* Monologues and multi-paragraph stories. Duration buckets:
  * Short: 3–10s
  * Medium: 10–20s
  * Extended: 20–40s
  * Long: 40–60s
  * Experimental: 60–90s

---

## 3. Simultaneous Emotion Blending Catalog

Target blends represent co-occurring emotional vectors:

| Blend Name | Component Ratios | Acoustic Interpretation |
|:---|:---|:---|
| **Bittersweet** | `happy: 0.50, sad: 0.50` | Smiling vocal tract with melancholic falling cadence |
| **Nervous Excitement** | `excited: 0.70, fearful: 0.30` | Fast tempo, breathy high pitch with subtle micro-tremor |
| **Gentle Grief** | `tender: 0.60, sad: 0.80` | Velvety quiet tone, restrained sorrow, deep warmth |
| **Defensive Panic** | `angry: 0.60, fearful: 0.60` | High volume, sharp staccato attacks, desperate pitch |
| **Bitter Sarcasm** | `sarcastic: 0.70, angry: 0.50` | Cold, elongated vowels, mocking downward inflections |
| **Tearful Gratitude** | `grateful: 0.80, sad: 0.40` | Earnest resonance, choked vocal breaks, warm relief |
| **Hopeful Sadness** | `hopeful: 0.50, sad: 0.50` | Melancholic foundation resolving into uplifting terminal pitch |
| **Joyful Affection** | `happy: 0.60, loving: 0.70` | Rich, smiling resonance, slow relaxed tempo |
| **Terrified Whisper** | `fearful: 1.00, whisper: 1.00` | Unvoiced turbulent air with rapid, panicked phrasing |
| **Mocking Laughter** | `sarcastic: 0.80, laughing_speech: 0.70`| Rhythmic chuckling overlaid on dismissive words |

---

## 4. Multi-Track Annotation Architecture

To prevent ambiguity, every audio file in `metadata.jsonl` contains four independent time-stamped annotation tracks:

```
Timeline (seconds): 0.0s ───────► 2.4s ───────► 4.1s ───────► 7.8s
Track 1 (Emotion):  [   Neutral   ] [         Sad (0.80)         ]
Track 2 (Delivery): [    Modal    ] [   Whisper   ] [    Modal   ]
Track 3 (Actions):                  [ Sigh (3.2s) ]
Track 4 (Words):    [W1] [W2] [W3]  [W4] [W5] [W6]  [W7] [W8] [W9]
```

### 4.1 Emotion Track Schema
```json
{
  "track_type": "emotion",
  "segments": [
    {
      "start_s": 0.0,
      "end_s": 2.4,
      "text_span": "من پێم وابوو هەموو شتێک باش دەبێت،",
      "intended_components": { "neutral": 1.0 },
      "verified_components": { "neutral": 0.95 },
      "transition_type": "sharp",
      "confidence": 0.94
    },
    {
      "start_s": 2.4,
      "end_s": 7.8,
      "text_span": "بەڵام هەموو شتێک گۆڕا.",
      "intended_components": { "sad": 0.8 },
      "verified_components": { "sad": 0.75 },
      "transition_type": "gradual",
      "confidence": 0.88
    }
  ]
}
```

### 4.2 Delivery & Action Track Schemas
```json
{
  "delivery_segments": [
    { "start_s": 0.0, "end_s": 4.1, "phonation": "modal", "style": "conversational", "rate": "normal" },
    { "start_s": 4.1, "end_s": 7.8, "phonation": "whisper", "style": "confidential", "rate": "slow" }
  ],
  "action_events": [
    { "start_s": 3.9, "end_s": 4.4, "action": "sigh", "embedded": true, "confidence": 0.92 }
  ]
}
```

### 4.3 Word Alignment Track
Word boundaries are extracted via forced alignment using an acoustic aligner and preserved with exact normalized text character indices:
```json
{
  "word_alignments": [
    { "word": "من", "start_s": 0.12, "end_s": 0.38, "char_start": 0, "char_end": 2 },
    { "word": "پێم", "start_s": 0.40, "end_s": 0.72, "char_start": 3, "char_end": 6 }
  ]
}
```

---

## 5. Intended vs. Verified Separation Rules

1. **Never Assume Compliance:** When an API request specifies `[angry]`, the resulting audio may sound neutral or merely loud. The dataset engine must record `intended_components` at request time and leave `verified_components` empty (`null`) until acoustic classification and human listening verify the audio.
2. **Promoting to Training Status:** Only samples where `verified_components` matches `intended_components` within acceptable tolerance ($\Delta < 0.25$) are admitted to the final training token set.

