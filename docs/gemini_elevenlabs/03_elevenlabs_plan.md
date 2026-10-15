# ElevenLabs Production & Integration Plan

## 1. Model Selection & Engine Configurations

ElevenLabs serves as Primary Provider B, producing **150,000 candidate recordings** (120,000 Kurdish Sorani, 20,000 Arabic, 10,000 English).

### 1.1 Model Profiles
* **Primary Model:** `eleven_multilingual_v2`
  * Optimal for nuanced multilingual phonetics, subtle emotional delivery, and authentic foreign phoneme articulation.
* **Secondary / Fast Model:** `eleven_turbo_v2_5`
  * Evaluated during the pilot for low-latency generation and long-form narrative stability.

---

## 2. Voice Persona Registry & Voice Settings

ElevenLabs relies on high-resolution voice cloning and curated multilingual voices. To support Kurdish Sorani phonology while enabling emotional excursions, voice settings must be calibrated carefully:

```
┌────────────────────────────────────────────────────────┐
│             Voice Settings Calibration Matrix          │
├────────────────────┬───────────┬──────────────┬────────┤
│ Performance Mode   │ Stability │ Sim. Boost   │ Style  │
├────────────────────┼───────────┼──────────────┼────────┤
│ Neutral Narration  │ 0.65      │ 0.85         │ 0.15   │
│ Expressive Emotion │ 0.40      │ 0.75         │ 0.45   │
│ Continuous Multi-Em│ 0.35      │ 0.70         │ 0.50   │
│ Whispering/Breathy │ 0.30      │ 0.60         │ 0.40   │
└────────────────────┴───────────┴──────────────┴────────┘
```

> [!IMPORTANT]
> Setting `stability` too high ($> 0.75$) suppresses emotional transitions and causes monotone delivery. Setting it too low ($< 0.25$) risks voice crackling, sudden pitch artifacts, or speaker drift. The optimal range for continuous transitions is **$0.35 \le \text{stability} \le 0.45$**.

### Curated Sorani Voice Personas

| Persona ID | Base Voice Name | Gender | Intended Archetype | Register |
|:---|:---|:---|:---|:---|
| `eleven_ckb_m01` | Adam / Custom Clone | Male | Expressive / Conversational | Sulaymaniyah |
| `eleven_ckb_m02` | George / Custom Clone | Male | Warm Narrative / Storyteller | Erbil |
| `eleven_ckb_f01` | Rachel / Custom Clone | Female | Emotional / Dramatic / High Range| Sulaymaniyah |
| `eleven_ckb_f02` | Nicole / Custom Clone | Female | Calm / Intimate / Tender | Erbil |

---

## 3. Kurdish Sorani Script Handling in ElevenLabs

While `eleven_multilingual_v2` possesses broad phonetic support, Kurdish Sorani text requires specific formatting to ensure accurate vowel and consonant realization:

1. **Explicit Vowel Markers:** Ensure text is pre-processed with full Kurdish vowel letters (`ێ`, `ۆ`, `ە`) and diacritics where necessary to prevent Arabic-style vowel dropping.
2. **Punctuation-Driven Prosody:** ElevenLabs derives cadence heavily from punctuation. Ellipses (`...`), em-dashes (`—`), exclamation marks, and question marks are dynamically injected at emotional transition boundaries to cue pitch resets and respiratory pauses.
3. **Phonetic Transliteration Fallback:** If specific Sorani words (e.g. archaic loanwords or rare compounds) suffer pronunciation failure during Gate F, an IPA or phonetic Latin-script bridge is passed to the generation endpoint.

---

## 4. Key Pool & Rate-Limit Management

ElevenLabs operations are driven by `server/elevenlabs/keyPoolManager.js` and `server/elevenlabs/ttsClient.js`:

```
┌────────────────────────────────────────────────────────┐
│           ElevenLabs Multi-Key Pool Manager            │
└────────────────────────────────────────────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Tier 4 Key  │    │  Tier 4 Key  │    │  Creator Key │
│ Key A (Active)│   │ Key B (Ready)│    │ Key C (Ready)│
└──────────────┘    └──────────────┘    └──────────────┘
```

### Rate-Limit Protocols
* **Character Quota Tracking:** Every request decrements the remaining monthly character quota in local state before dispatching.
* **Concurrency Cap:** Maintain a maximum of 5 concurrent generation requests per API key to avoid 429 throttling.
* **HTTP 429 Backoff:** Rotate immediately to the next key in the pool. If all keys hit character limits or concurrency caps, pause execution and alert the scheduler.

---

## 5. Continuous Speech & Nonverbal Event Handling

1. **Single-Take Ingestion:** Never split continuous multi-emotion scripts into distinct calls. The complete text must be passed in a single stream.
2. **Chunked Streaming & Assembly:** ElevenLabs responses stream via WebSocket or chunked HTTP. The adapter buffers the entire incoming stream in memory, verifies total byte length, and writes the complete WAV to disk atomically.
3. **Audio Post-Processing:** Normalized via `sox` or `ffmpeg` to 24 kHz 16-bit mono WAV, stripping leading/trailing silence to conform with Gate C standards.

