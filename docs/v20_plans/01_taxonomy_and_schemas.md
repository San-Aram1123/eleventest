# Audar V20 Plan: Taxonomy, Catalogs & Manifest Schemas

## 1. The 50-Emotion Taxonomy

Audar V20 expands the emotional capability of the model from the 9 legacy V19 emotions to a verified 50-emotion catalog while maintaining 100% backward compatibility.

### 1.1 Backward Compatibility with Audar V19
The 9 V19 emotional components (`neutral`, `happy`, `sad`, `angry`, `excited`, `tender`, `curious`, `sarcastic`, `fearful`) retain their exact canonical keys, baseline acoustic properties, and intensity behaviors.

### 1.2 Emotion Catalog Structure
Each registered emotion requires:
* `canonical_key`: Standard identifier (e.g., `bitter`, `serene`, `panicked`).
* `display_name`: English name.
* `sorani_name`: Linguistically verified Central Kurdish equivalent.
* `emotion_family`: High-level cluster (Joy, Sorrow, Anger, Fear, Wonder, Contempt, Tenderness, Composure).
* `acoustic_guidance`: Expressive targets for pitch, tempo, articulation, and energy.
* `legacy_v19_mapping`: Nearest equivalent in V19 for backwards projection.
* `experimental`: Boolean flag for acoustically overlapping or hard-to-distinguish states.

### 1.3 Complete 50-Emotion Inventory

| ID | Tag | Canonical Key | Sorani Name | Family | Expected Delivery & Acoustic Characteristics |
|:---|:---|:---|:---|:---|:---|
| E01 | `[neutral]` | neutral | ئاسایی / بێلایەن | Composure | Natural conversational cadence, relaxed articulation, moderate pitch variation. |
| E02 | `[happy]` | happy | دڵخۆش | Joy | Warm vocal tone, smiling articulation, lively controlled prosody. |
| E03 | `[sad]` | sad | خەمبار | Sorrow | Subdued energy, melancholic phrasing, softened phrase endings. |
| E04 | `[angry]` | angry | تووڕە | Anger | Tense articulation, forceful emphasis, intentional stress on key words. |
| E05 | `[excited]` | excited | پڕ جۆش | Joy | Energetic rhythm, wide pitch excursion, heightened tempo and enthusiasm. |
| E06 | `[tender]` | tender | دڵسۆز / نەرم | Tenderness | Gentle warmth, relaxed articulation, soft emotional emphasis (distinct from whisper). |
| E07 | `[curious]` | curious | کنجکاو | Wonder | Exploratory intonation, questioning contour, heightened attentiveness. |
| E08 | `[sarcastic]` | sarcastic | تانەئامێز | Contempt | Deliberate elongation, ironic pitch contours, cynical stress patterns. |
| E09 | `[fearful]` | fearful | ترساو | Fear | Vocal tension, irregular breath support, hesitant pacing. |
| E10 | `[disgusted]` | disgusted | بێزار / قێزەوەن | Contempt | Dismissive tone, nasal/tense articulation, abrupt rejection emphasis. |
| E11 | `[surprised]` | surprised | سەرسام | Wonder | Sudden onset, abrupt pitch inflection, variable intensity. |
| E12 | `[confused]` | confused | سەری لێ شێواو | Wonder | Hesitant pauses, rising uncertain inflections, uneven rhythm. |
| E13 | `[frustrated]` | frustrated | بێتاقەت / پەست | Anger | Impatient cadence, clipped words, sustained underlying tension. |
| E14 | `[disappointed]`| disappointed | دڵشکاو | Sorrow | Dropping pitch at line ends, heavy exhalations, subdued energy. |
| E15 | `[anxious]` | anxious | دڵەڕاوکێ | Fear | Restless pacing, breath instability, uneven phrase stresses. |
| E16 | `[nervous]` | nervous | شڵەژاو | Fear | Mild disfluency, self-conscious intonation, slightly rapid/uneven pace. |
| E17 | `[relieved]` | relieved | ئاسوودە | Composure | Released vocal tension, relaxed sighs, softening terminal vowels. |
| E18 | `[hopeful]` | hopeful | بەهیوا | Joy | Measured positive uplift, gentle rising cadence, bright timbre. |
| E19 | `[proud]` | proud | شانازی | Joy | Resonant projection, deliberate and authoritative tempo, confident posture. |
| E20 | `[ashamed]` | ashamed | شەرمەزار | Sorrow | Low amplitude, restrained vocal tract, hesitant/muffled delivery. |
| E21 | `[guilty]` | guilty | هەست بە گوناهـ | Sorrow | Apologetic tone, careful hesitant phrasing, restrained breath. |
| E22 | `[jealous]` | jealous | بەحەسوودی | Anger | Guarded tension, sharp questioning stresses, bitter undertones. |
| E23 | `[envious]` | envious | چاوپێهەڵنەهاتوو | Contempt | Longing mixed with resentment, subdued longing intonation. |
| E24 | `[contemptuous]`| contemptuous | سووکڕوانین | Contempt | Scornful downward inflection, dismissive deliberate pauses. |
| E25 | `[resentful]` | resentful | بوغزدار | Anger | Cold hostile constraint, restrained explosive words. |
| E26 | `[despairing]` | despairing | بێ هیوا | Sorrow | Emotionally depleted, flat melancholic prosody, hollow timbre. |
| E27 | `[grieving]` | grieving | ماتەمبار | Sorrow | Trembling phrase endings, fragile register, audible breath breaks. |
| E28 | `[lonely]` | lonely | تەنیایی | Sorrow | Quiet subdued resonance, slow introspective pacing. |
| E29 | `[nostalgic]` | nostalgic | تامەزرۆی ڕابردوو | Tenderness | Warm bittersweet pacing, gentle reflective cadences. |
| E30 | `[affectionate]`| affectionate | خۆشەویستانە | Tenderness | Intimate friendly warmth, melodious soft inflections. |
| E31 | `[loving]` | loving | دڵدارانە | Tenderness | Deep sincerity, sustained warm vocal weight, velvety timbre. |
| E32 | `[grateful]` | grateful | سوپاسگوزار | Joy | Earnest appreciative stress, open heartfelt resonance. |
| E33 | `[admiring]` | admiring | سەرسام بە باشی | Wonder | Focused praise, enthusiastic rising inflection. |
| E34 | `[awed]` | awed | حەپەساو | Wonder | Hushed breath, low-paced reverent delivery, suspended pauses. |
| E35 | `[amazed]` | amazed | شۆکبووی چاکە | Wonder | High pitch shifts, energetic bursts of astonished stress. |
| E36 | `[joyful]` | joyful | شادیبەخش | Joy | Brightest acoustic timbre, smiling formant shifts, bouncy tempo. |
| E37 | `[amused]` | amused | بەپێکەنینەوە | Joy | Playful buoyancy, speech infused with bubbling laughter. |
| E38 | `[embarrassed]`| embarrassed | شەرم | Fear | Self-conscious hesitation, awkward rhythm, softened volume. |
| E39 | `[bored]` | bored | بێزار لە چاوەڕوانی | Composure | Flat intonation, elongated vowels, low dynamic range. |
| E40 | `[exhausted]` | exhausted | ماندوو | Composure | Breath fatigue, trailing phrase decay, slow dragging tempo. |
| E41 | `[determined]` | determined | سوور | Anger/Composure| Punchy articulation, steady forceful cadence, firm stops. |
| E42 | `[confident]` | confident | بڕوابەخۆ | Composure | Stable fundamental frequency, assertive projection, clarity. |
| E43 | `[suspicious]` | suspicious | گوماناوی | Contempt | Probing rhythm, tight guarded tone, searching pauses. |
| E44 | `[skeptical]` | skeptical | بەگومان | Contempt | Incredulous pitch excursions, restrained disbelief. |
| E45 | `[anticipating]`| anticipating | چاوەڕوانکار | Wonder | Building momentum, accelerated phrasing, heightened tension. |
| E46 | `[panicked]` | panicked | تۆقیو | Fear | Erratic fast cadence, sharp gasps, uncontrolled pitch spikes. |
| E47 | `[terrified]` | terrified | زەندەقچوو | Fear | High tension, voice tremor, choked or breathy urgency. |
| E48 | `[defiant]` | defiant | یاخی | Anger | Defiant vocal projection, unyielding emphatic stress. |
| E49 | `[bitter]` | bitter | تاڵ | Contempt | Dry, acerbic tone, harsh trailing consonants. |
| E50 | `[serene]` | serene | هێمن | Composure | Slow balanced breathing, smooth melodic contours, tranquility. |

---

## 2. Intensity Calibration Model

Discrete levels from V19 are maintained while enabling continuous float scaling:
* `none (0.0)`: Baseline emotionless neutral.
* `low (0.25)`: Subtle nuance (e.g., mild annoyance).
* `medium (0.60)`: Unambiguous, clear emotional coloring.
* `high (1.00)`: Full theatrical/expressive manifestation.

> [!IMPORTANT]
> Intensity is an acoustic parameter (prosodic pitch excursion, formant shifting, energy envelope), **never mere linear amplitude/volume gain**.

---

## 3. The 30 Delivery & Speaking Styles

Styles must **never** be modeled as a flat, mutually exclusive enum. They are decomposed into 5 orthogonal dimensions:

```
Vocal Performance
├── 1. Phonation Mode:     Modal, Whisper, Breathy, Creaky
├── 2. Speaking Style:      Storytelling, Dramatic, Robotic, Monotone, Commanding, Pleading
├── 3. Speaking Rate:       Slow, Normal, Rapid
├── 4. Vocal Effort:        Soft-spoken, Normal, Shouting, Screaming, Strained
└── 5. Disfluency Mode:     Hesitant, Stuttering, Crying Speech, Laughing Speech
```

### Complete Delivery Styles Catalog (D01–D30)

| ID | Style Tag | Dimension | Acoustic Target |
|:---|:---|:---|:---|
| D01 | `[normal]` | Phonation | Standard balanced modal phonation |
| D02 | `[whisper]` | Phonation | Unvoiced turbulent airflow, suppressed vocal fold vibration |
| D03 | `[laughing_speech]` | Disfluency | Voiced words modulated by rhythmic chuckles |
| D04 | `[laughter]` | Event | Standalone laughing episode |
| D05 | `[shouting]` | Vocal Effort | Projected acoustic energy, raised F0, wide dynamic range |
| D06 | `[screaming]` | Vocal Effort | Extreme acoustic effort at upper physical voice limit |
| D07 | `[crying]` | Disfluency | Glottal shaking, pitch breaks, sobbing modulation |
| D08 | `[sobbing]` | Event | Involuntary spasmodic respiratory vocalizations |
| D09 | `[trembling]` | Phonation | Micro-tremor in fundamental frequency and amplitude |
| D10 | `[breathless]` | Vocal Effort | High air consumption, shortened breath groups |
| D11 | `[gasping]` | Disfluency | Inhalation interruptions during sentence delivery |
| D12 | `[sighing]` | Disfluency | Audible exhalation overlaid onto phrasing |
| D13 | `[chuckling]` | Disfluency | Low-level smiling chuckles within phrase |
| D14 | `[giggling]` | Disfluency | Staccato light vocal bursts |
| D15 | `[singing]` | Phonation | Sustained musical pitches, rhythmic quantizing |
| D16 | `[humming]` | Phonation | Closed-lip nasal resonance with melodic pitch |
| D17 | `[sleepy]` | Style | Slack articulation, relaxed vocal tract, sluggish tempo |
| D18 | `[tired]` | Style | Low subglottal pressure, drooping phrase endings |
| D19 | `[strained]` | Vocal Effort | Audible constriction and vocal effort |
| D20 | `[soft_spoken]` | Vocal Effort | Low volume with intact voicing and warm intimacy |
| D21 | `[robotic]` | Style | Isochronous syllable timing, zero pitch inflection |
| D22 | `[monotone]` | Style | Very narrow F0 standard deviation |
| D23 | `[dramatic]` | Style | Theatrical pauses, exaggerated dynamic contrasts |
| D24 | `[storytelling]` | Style | Narrative cadence, character voicing shifts, engaging rhythm |
| D25 | `[commanding]` | Style | Authoritative descending phrase closures, steady energy |
| D26 | `[pleading]` | Style | Sustained rising phrase questions, imploring timbre |
| D27 | `[hesitant]` | Disfluency | Extended hesitation pauses, false starts, fillers |
| D28 | `[stuttering]` | Disfluency | Scripted syllable repetitions and prolongation |
| D29 | `[rapid]` | Speaking Rate | High syllable-per-second rate with intact intelligibility |
| D30 | `[slow]` | Speaking Rate | Deliberate elongated syllables and pauses |

---

## 4. The 16 Nonverbal Vocal Actions (A01–A16)

Nonverbal tokens represent physiological and expressive acoustic events that occur standalone, at boundaries, or embedded within speech:

| ID | Action Tag | Type | Realization Rules |
|:---|:---|:---|:---|
| A01 | `[laugh]` | Expressive | Natural standalone voiced laughter |
| A02 | `[cry]` | Expressive | Vocalized crying sound |
| A03 | `[sob]` | Expressive | Broken spasmic exhalation |
| A04 | `[sigh]` | Respiratory | Extended audible exhalation releasing tension |
| A05 | `[gasp]` | Respiratory | Sharp sudden intake of air into lungs |
| A06 | `[scream]` | High Energy | Non-lexical high-volume acoustic burst |
| A07 | `[chuckle]` | Expressive | Brief guttural laugh |
| A08 | `[giggle]` | Expressive | High-frequency short burst laugh |
| A09 | `[groan]` | Somatic | Low-pitched vocalization of discomfort/resignation |
| A10 | `[grunt]` | Somatic | Short forceful glottal sound |
| A11 | `[yawn]` | Respiratory | Stretched jaw vocalized inhalation and release |
| A12 | `[cough]` | Physiological| Explosive expulsion of air from lungs |
| A13 | `[throat_clear]`| Physiological| Short friction sound clearing larynx |
| A14 | `[sniffle]` | Nasal | Audible nasal aspiration |
| A15 | `[pant]` | Respiratory | Rapid shallow breathing cycle |
| A16 | `[hum]` | Melodic | Nonverbal nasal melodic phonation |

---

## 5. Canonical Data Contracts (`metadata.jsonl` Schema)

Each candidate recording in `metadata.jsonl` adheres to this JSON schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AudarV20CanonicalRecord",
  "type": "object",
  "required": [
    "id",
    "language",
    "speaker",
    "audio_path",
    "raw_text",
    "normalized_text",
    "x_audar_provenance",
    "x_audar_tracks",
    "x_audar_quality"
  ],
  "properties": {
    "id": { "type": "string" },
    "language": { "type": "string", "enum": ["ckb", "ar", "en"] },
    "speaker": { "type": "string" },
    "audio_path": { "type": "string" },
    "raw_text": { "type": "string" },
    "normalized_text": { "type": "string" },
    "duration_s": { "type": ["number", "null"] },
    "split": { "type": "string", "enum": ["train", "val", "test", "unassigned"] },
    "x_audar_provenance": {
      "type": "object",
      "required": ["provider", "model_id", "voice_id"],
      "properties": {
        "provider": { "type": "string", "enum": ["gemini", "elevenlabs"] },
        "model_id": { "type": "string" },
        "voice_id": { "type": "string" },
        "generation_request_id": { "type": ["string", "null"] },
        "audio_sha256": { "type": ["string", "null"] },
        "script_id": { "type": "string" },
        "created_at": { "type": "string" }
      }
    },
    "x_audar_tracks": {
      "type": "object",
      "properties": {
        "emotion": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["text_span", "intended_components"],
            "properties": {
              "text_span": { "type": "string" },
              "intended_components": { "type": "object" },
              "verified_components": { "type": ["object", "null"] },
              "start_s": { "type": ["number", "null"] },
              "end_s": { "type": ["number", "null"] },
              "confidence": { "type": ["number", "null"] }
            }
          }
        },
        "delivery": { "type": "array" },
        "action": { "type": "array" }
      }
    },
    "x_audar_quality": {
      "type": "object",
      "properties": {
        "status": { "type": "string", "enum": ["pending", "accepted", "rejected", "needs_review"] },
        "native_reviewed": { "type": "boolean" },
        "emotion_verified": { "type": "boolean" },
        "alignment_verified": { "type": "boolean" }
      }
    }
  }
}
```

