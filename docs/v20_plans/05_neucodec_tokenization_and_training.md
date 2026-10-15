# Audar V20 Plan: NeuCodec Tokenization & Training Manifests

## 1. NeuCodec Acoustic Tokenizer Specifications

Audar V20 maintains complete compatibility with the production NeuCodec neural audio codec utilized in Audar V19.

### 1.1 Verified Codec Parameters
* **Audio Input:** 24,000 Hz, 16-bit Mono WAV.
* **Acoustic Frame Rate:** Approximately 50 frames per second (exactly 20.0 ms per frame).
* **Codebook Cardinality:** 65,536 discrete codebook tokens (16-bit acoustic token space, indices `0` through `65535`).
* **Frame Alignment:** Every second of audio corresponds to exactly 50 acoustic token vectors.

> [!CAUTION]
> **No Synthetic/Dummy Token Arrays:**
> Pipeline unit tests and verification suites must never use repeating placeholder token sequences (e.g., `[0, 1, 2, 0, 1, 2]`) to fake codec verification. Token round-trip tests must decode real audio through the neural encoder and verify audio reconstruction with STOI and PESQ metrics.

---

## 2. Frame Interval Mapping Mathematics

Time-stamped annotations from `metadata.jsonl` (in seconds) are deterministically projected onto the discrete acoustic token sequence.

### 2.1 Interval Formulas
Given audio duration $D$ (seconds) and encoder frame count $N$:
$$\text{frame\_rate} = \frac{N}{D} \approx 50.0\text{ fps}$$

For any annotation segment with interval $[t_{\text{start}}, t_{\text{end}})$:
$$\text{start\_frame} = \max\left(0, \min\left(N - 1, \left\lfloor t_{\text{start}} \times \text{frame\_rate} \right\rfloor\right)\right)$$
$$\text{end\_frame} = \max\left(\text{start\_frame} + 1, \min\left(N, \left\lceil t_{\text{end}} \times \text{frame\_rate} \right\rceil\right)\right)$$

### 2.2 Boundary Integrity Checks
* **Monotonicity:** $\text{start\_frame}_i < \text{end\_frame}_i \le \text{start\_frame}_{i+1}$
* **Full Coverage:** For contiguous tracks, $\text{end\_frame}_i == \text{start\_frame}_{i+1}$.
* **Array Bounds:** Zero out-of-bounds indices; $\text{end\_frame} \le \text{len}(\text{tokens})$.

---

## 3. Training Manifest Schema (`tokens.jsonl`)

The training manifest is deterministically generated **only** from approved (`accepted`), validated samples in `metadata.jsonl`. It is never edited by hand.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AudarV20TrainingRecord",
  "type": "object",
  "required": [
    "id",
    "text",
    "speaker",
    "language",
    "split",
    "duration",
    "tokens",
    "x_audar_conditioning"
  ],
  "properties": {
    "id": { "type": "string" },
    "text": { "type": "string" },
    "speaker": { "type": "string" },
    "language": { "type": "string", "enum": ["ckb", "ar", "en"] },
    "split": { "type": "string", "enum": ["train", "val", "test"] },
    "duration": { "type": "number" },
    "tokens": {
      "type": "array",
      "items": { "type": "integer", "minimum": 0, "maximum": 65535 }
    },
    "x_audar_conditioning": {
      "type": "object",
      "properties": {
        "legacy_v19_emotions": { "type": "string" },
        "frame_emotion_spans": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "start_frame": { "type": "integer" },
              "end_frame": { "type": "integer" },
              "components": { "type": "object" }
            }
          }
        },
        "frame_delivery_spans": { "type": "array" },
        "frame_action_spans": { "type": "array" }
      }
    }
  }
}
```

---

## 4. Controlled Training Experiments (Experiments A–E)

Once the canonical dataset has passed verification, five controlled model-training experiments will be compiled to evaluate provider mixtures and conditioning mechanisms:

```
┌────────────────────────────────────────────────────────┐
│               Audar V20 Training Suite                 │
└────────────────────────────────────────────────────────┘
                           │
       ┌───────────┬───────┴───────┬───────────┐
       ▼           ▼               ▼           ▼
  [Exp A: Gemini] [Exp B: 11Labs] [Exp C: 50/50] [Exp D: Weighted]
                                                       │
                                                       ▼
                                            [Exp E: V19 + V20 Corpus]
```

### Experiment Matrix

| Experiment | Composition | Purpose & Hypothesis |
|:---|:---|:---|
| **Experiment A: Gemini-Only** | 100% Approved Gemini Candidates | Evaluates baseline expressive dynamics and Kurdish Sorani prosody learned purely from Gemini 3.8/3.1 models. |
| **Experiment B: ElevenLabs-Only** | 100% Approved ElevenLabs Candidates | Evaluates voice stability, whisper phonation, and naturalness learned purely from ElevenLabs. |
| **Experiment C: Equal 50/50 Mixture** | 50% Gemini + 50% ElevenLabs | Tests whether equal balance creates complementary generalization or causes voice/prosody conflict. |
| **Experiment D: Quality-Weighted Mixture**| Proportional to Gate F & ASR Scores | Optimal synthetic mixture where higher-scoring provider in each emotional category receives greater weight. |
| **Experiment E: V19 Legacy Retention** | Approved V20 + Verified V19 Dataset | Confirms that new continuous and 50-emotion capabilities do not cause catastrophic forgetting of V19 baseline presets. |

### Strict Experimental Controls
Across all 5 experiments, the following parameters remain strictly identical:
* Total training audio hours ($\approx 150\text{ hours}$ per experiment).
* Language distribution (80% Sorani, 13.3% Arabic, 6.7% English).
* Optimizer hyper-parameters, learning rate schedule, and batch size.
* Neural checkpoint initialization (base Qwen2 0.55B backbone).
* Evaluation benchmark: Evaluated against the identical human-recorded Sorani test split.

