# Copyable coworker prompt

Please prepare an additional human expressive speech dataset for Audar TTS.
Keep our existing corpus. We need supervision for emotion combined with delivery,
particularly sad whisper, angry whisper, and angry/bitter laughter. Do not make
these examples by pitch shifting, slowing, filtering, adding noise, or changing
the volume of neutral speech.

Start with a Sorani Kurdish pilot using 4–6 consenting native speakers, including
our radio-reference speaker if available. Each speaker should cover the same
conditions; do not assign one emotion to one speaker. Include different genders,
ages, and vocal ranges. Expand to Arabic and English only after the pilot passes
our listening and training evaluations, using native speakers in each language.

Record this matrix:

| Emotion | Delivery | Emotion strength |
|---|---|---|
| Neutral | Normal speech | None |
| Neutral | Whisper | None |
| Neutral | Speaking while laughing | None |
| Happy | Normal speech, whisper, speaking while laughing | Low, medium, high |
| Sad | Normal speech, whisper | Low, medium, high |
| Angry | Normal speech, whisper, speaking while laughing | Low, medium, high |

This gives 27 performances per shared sentence. As a concrete parallel core,
4 speakers × 15 sentences × 27 performances = 1,620 accepted clips. Increase
speaker count or add varied sentences to reach approximately 1,500–3,000 accepted
clips. This is a pilot budget, not a guarantee that it is enough for production.
Add context-specific sentences and natural performances so the corpus is not
entirely repeated scripts. Also record short 2–4 second neutral references for
each speaker, with exact transcripts, separately from evaluation recordings.

For anger, increasing strength must not automatically mean shouting. Angry
whisper should stay whispered at every level. For sadness, do not just slow down;
perform credible sadness through phrasing, timing, and voice quality. For angry
laughter, perform a believable bitter or restrained laugh, not happy laughter
with louder volume. Separate intelligible speech through laughter from a standalone
nonverbal laugh event; collect standalone events separately as an optional subset.
If a particular combination cannot be performed naturally, flag it rather than
fabricating convincing labels. Do not substitute happy laughter for neutral
laughter without reviewer agreement.

Technical recording requirements:

- Deliver mono, lossless WAV at 24,000 Hz, preferably recorded at 24 kHz or higher.
  Keep the original masters separately if recording at a higher rate.
- Most utterances should last 3–12 seconds; accepted range is 1–15 seconds.
- Use a consistent microphone, distance, and quiet room. Prevent clipping.
- Preserve breaths, quiet phonation, meaningful pauses, and emotional dynamics.
  No noise gates, aggressive denoising, loudness flattening, speed edits, or EQ
  intended to create emotion. Do not count natural whisper turbulence as noise.
- Transcribe exactly what was spoken in the native script. Keep tags out of the
  transcript; labels belong in metadata. Avoid background music and overlapping voices.
- Confirm consent covers model training and the intended use of the resulting voice.

Keep our existing emotion-export schema: deliver `data.jsonl`, not a replacement
record layout. I checked the existing `Kurdihs-arabic-englihs-empthon/data.jsonl`
and `family-emotison` export. Preserve these field names and meanings:

```text
id                  unique ASCII recording ID
audioUrl            relative WAV path such as audio/CLIP_001.wav
transcript          exact spoken transcript, one line, no pipes or control tags
normalized_text     normalized transcript; retain the raw transcript separately
originalDraft       original transcription draft
draftSource         actual transcription source
speakerId           stable globally unique identity, e.g. expressive_pilot__ACTOR_001
speakerName         display name; do not use it instead of speakerId
speakerGender       actual speaker annotation
language            ckb / ar / en; do not guess from text
datasetSplit        null for reviewed source; builder assigns the experiment split
source              actual source/corpus name; preserve provenance
duration            actual measured audio duration in seconds
status              approved only after real listening review
emotion             neutral / happy / sad / angry
emotionIntensity    0 for neutral; anchors 0.25 low, 0.60 medium, 0.90 high
metrics             preserve existing metrics structure; measured values or null

x_reviewer_delivery          normal / whisper / laughing_speech / laughter
x_reviewer_script_id         stable ID shared by identical transcripts
x_reviewer_recording_type    human (actual human performances only)
x_reviewer_consent           true only after actual consent
x_reviewer_listening_reviews three or more independent native-listener reviews
```

Intensity anchors describe perceived emotion strength, not loudness. They are
ordinal labels; do not claim they are precise acoustic percentages. Delivery
strength is not part of this first pilot. Keep full whisper/laughing delivery
while varying the emotion strength.

New fields use the existing `x_<producer>_<field>` extension convention rather
than changing the frozen canonical core schema. The importer maps these source
fields to training metadata; your coworker should not rename the original fields.
Existing single labels such as `whisper` and `cackle` remain unchanged in old data.
For NEW combined recordings, `emotion` is the emotional state and
`x_reviewer_delivery` identifies whisper or laughter independently.

Each entry in `x_reviewer_listening_reviews` must contain:

```json
{"reviewer_id":"REVIEWER_01","emotion_correct":true,"delivery_correct":true,"intensity_level":"medium","naturalness":4}
```

Use distinct reviewer IDs. Reviewers first judge the audio without seeing the
requested label, then compare against the request. Accept only when a majority
correctly recognizes emotion, delivery, and intended intensity, and median
naturalness is at least 4/5. For neutral use intensity_level `none`. Keep rejected
recordings in a separate review directory and explain the reason; do not delete
them or include them in the accepted manifest. Never fabricate review scores.

Deliver:

```text
expressive_recordings/
  data.jsonl         existing emotion-export objects plus x_reviewer_* extensions
  audio/             accepted WAV files (audioUrl resolves beneath this directory)
  manifest.json      existing summary format, with new coverage statistics
  consent_records/   actual consent records, access restricted appropriately
  recording_notes.md
  rejected/          separate from accepted metadata
```

Use `docs/TTS_EXPRESSIVE_PILOT.md` for an example export object and the validator
command. Our tooling exports the required pipe CSV `audio_file|text|speaker_name`
alongside full JSONL metadata. Do not deliver only CSV: that loses the conditioning
and review annotations.

Keep all versions of a script together. Our exporter assigns train/validation/test
by script ID across speakers. Do not select the strongest performances into training
and weak performances into evaluation. Provide a coverage summary by speaker,
language, emotion, delivery, and intensity, plus total accepted hours and rejection
reasons. Flag missing combinations explicitly.

Please first send 30–50 reviewed sample recordings covering the difficult
combinations and strength levels. We will check their naturalness and codec
reconstruction before committing to the full pilot recording budget.
