# Gemini TTS Production & Integration Plan

## 1. Model Policy & Strict Requirements

Gemini TTS serves as Primary Provider A, responsible for **150,000 candidate recordings** (120,000 Kurdish Sorani, 20,000 Arabic, 10,000 English).

> [!CAUTION]
> **STRICT REPOSITORY POLICY: NEVER FALLBACK TO GEMINI 2.5**
> Under NO circumstances should any speech generation script, batch runner, or key manager automatically downgrade or fallback to `gemini-2.5-flash-preview-tts` (or any Gemini 2.5 model) when rate limits or quotas are reached.
> * Permitted Models: ONLY `gemini-3.8-flash-tts` or `gemini-3.1-flash-tts-preview`.
> * If a project key hits a quota or rate limit on the requested model, rotate to the next key in the multi-project pool.
> * If all keys are exhausted, pause and back off. Never inject Gemini 2.5 as a fallback.

---

## 2. Multi-Project Key Pool Architecture

Production relies on `server/services/geminiKeyPool.js` and `server/services/geminiClient.js`, managing an array of independent Google Cloud project API keys:

```
┌────────────────────────────────────────────────────────┐
│            Gemini Multi-Project Key Manager            │
└────────────────────────────────────────────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Project 01  │    │  Project 02  │    │  Project N   │
│ Key A (Active)│   │ Key B (Ready)│    │ Key K (Ready)│
└──────────────┘    └──────────────┘    └──────────────┘
       │
       ▼ (HTTP 429 Rate Limit Encountered)
┌────────────────────────────────────────────────────────┐
│ 1. Mark Project 01 in Cooldown (cooldown_until: +60s)  │
│ 2. Rotate to next eligible project key (Project 02)     │
│ 3. Transparently retry identical request               │
└────────────────────────────────────────────────────────┘
```

### Key Pool Rotation Rules
1. **Health Probing:** Keys are checked on initialization using minimal lightweight pings (`geminiProber.js`).
2. **Deterministic Round-Robin:** Requests are distributed evenly across healthy project keys to maximize concurrency.
3. **Exponential Cooldown:** Upon receiving HTTP 429, the offending key is quarantined for 60 seconds (doubling on repeated 429s).
4. **Zero Fallback:** The model string `gemini-3.8-flash-tts` remains immutable throughout key rotations.

---

## 3. Kurdish Sorani Prompt Engineering for Gemini

Gemini TTS responds to system prompts and conversational stage directions. Universal dataset tags must be translated into natural performance instructions that guide Gemini without corrupting Sorani phonology.

### 3.1 Prompt Framing Strategy
Gemini produces the most natural Sorani cadence when instructed with explicit linguistic context and inline expressive cues:

```
[System Directive]
You are a native Central Kurdish (Sorani) speaker from Erbil/Sulaymaniyah. 
Speak the following text with authentic Kurdish phonology, correct vowel distinctions (ێ, ۆ, ە), 
and precise consonant weights (ڕ, ڵ). Deliver the entire text in ONE SINGLE CONTINUOUS TAKE. 
Follow the emotional progression indicated in the stage directions exactly as the text unfolds.

[Performance Script]
(Stage Direction: Begin in a calm, neutral conversational tone)
من پێم وابوو هەموو شتێک باش دەبێت،
(Stage Direction: Gradually transition your voice into deep sorrow, softening phrase endings)
بەڵام هەموو شتێک گۆڕا،
(Stage Direction: Shift immediately into sudden explosive anger and vocal tension)
ئیتر بەسە!
(Stage Direction: Release the tension into a gentle, tender whisper)
ئێستا دەمەوێت بە ئارامی قسە بکەین.
```

### 3.2 Continuous Generation Rules
* **No Audio Slicing / Staged Chunks:** The entire multi-emotion script must be submitted in a single Gemini API generation call.
* **Nonverbal Actions:** Embedded cues such as `(Stage Direction: Pause for a brief natural sigh)` are embedded directly between sentence clauses to produce natural respiratory events within the audio stream.

---

## 4. Voice Selection & Persona Registry

A set of consistent voice personas will be registered to ensure speaker stability across the 150,000 Gemini takes:

| Speaker Persona ID | Base Voice Name | Gender | Target Register | Dialect Focus |
|:---|:---|:---|:---|:---|
| `gemini_ckb_m01` | Puck | Male | Conversational / Expressive | Sulaymaniyah |
| `gemini_ckb_m02` | Charon | Male | Deep / Authoritative / Narration | Erbil |
| `gemini_ckb_f01` | Aoede | Female | Warm / Empathetic / Storytelling | Sulaymaniyah |
| `gemini_ckb_f02` | Fenrir | Female | Dynamic / Dramatic / Urgent | Erbil |

---

## 5. Intake, Normalization & Quality Checks

1. **Audio Decoding:** Gemini returns PCM/raw audio streams. The adapter converts these immediately into 24 kHz 16-bit mono WAVs via `geminiAudio.js`.
2. **Structural Sanity Check:** Verify that duration matches predicted speech duration within $\pm 20\%$. (If duration $< 1.0\text{s}$, mark as truncated and retry).
3. **ASR Screening:** Automatic verification using Whisper-Kurdish to confirm Gemini did not hallucinate English or Arabic words when reading Sorani script.

