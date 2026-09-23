# Strict Model Policy: Never Fallback to Gemini 2.5

Under NO circumstances should any speech generation, batch system, or service automatically downgrade or fallback to `gemini-2.5-flash-preview-tts` (or any Gemini 2.5 model) when a Gemini 3.1 model (`gemini-3.1-flash-tts-preview`) or any other model hits rate limits or quota exhaustion.

## Mandatory Directives
1. **No Automatic Downgrade**:
   - Strictly honor the exact model selected or requested by the user.
   - If the user or system requests `gemini-3.1-flash-tts-preview`, candidate models must ONLY contain `gemini-3.1-flash-tts-preview`.
   - Never inject `gemini-2.5-flash-preview-tts` into the candidate models array as a silent fallback.
2. **Key Rotation over Model Downgrade**:
   - When a project key hits a quota or rate limit on the requested model, rotate to the next key in the multi-project pool.
   - If all keys are in cooldown, wait or report exhaustion on the requested model.
   - Do NOT switch to Gemini 2.5 unless the user explicitly selects it in the UI or configuration.
