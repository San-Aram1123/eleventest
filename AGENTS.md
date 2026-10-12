# Project Rules & Guidelines

## Strict Model Policy: Never Fallback to Gemini 2.5
Under NO circumstances should any speech generation, batch system, or service automatically downgrade or fallback to `gemini-2.5-flash-preview-tts` (or any Gemini 2.5 model) when a Gemini 3.8 model (`gemini-3.8-flash-tts`), Gemini 3.1 model (`gemini-3.1-flash-tts-preview`), or any other model hits rate limits or quota exhaustion.

- Strictly honor the exact model selected or requested by the user.
- If the user or system requests `gemini-3.8-flash-tts`, candidate models must ONLY contain `gemini-3.8-flash-tts`.
- If the user or system requests `gemini-3.1-flash-tts-preview`, candidate models must ONLY contain `gemini-3.1-flash-tts-preview`.
- Never inject `gemini-2.5-flash-preview-tts` into the candidate models array as a silent fallback.
- When a project key hits a quota or rate limit on the requested model, rotate to the next key in the multi-project pool.
- Do NOT switch to Gemini 2.5 unless the user explicitly selects it in the UI or configuration.

## Strict Slicing Policy: Never Fallback to 1:1 Individual Requests
Under NO circumstances should Paired Slicing (or any batch slicing system) automatically fallback to individual 1:1 API requests when slicing fails, master audio is too short, or boundaries cannot be safely resolved.
- If Slicing mode is chosen, it must strictly attempt slicing.
- If slicing fails safety checks or Gemini drops takes, it must report/throw an error and abort that take/family cleanly to protect API quota.
- Never silently or automatically switch to 1:1 individual requests.

## Component-Based Architecture & Shared Code Policy
- **Component-First**: All UI pages and views must be built using modular, isolated, and composable components.
- **Mandatory Shared Code Reuse**: Any shared function, utility, or component used across multiple pages must be extracted into a centralized shared folder and imported. Duplicate implementations across pages are strictly prohibited.
- **File & Component Line Limits**: Every file across the project must strictly remain under 500 lines total (with individual component files strictly `<= 300 lines`).

