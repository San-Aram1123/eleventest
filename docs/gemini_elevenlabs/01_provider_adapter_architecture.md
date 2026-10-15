# Provider Adapter Architecture: Unified Interface Contract

## 1. Architectural Overview

To prevent provider-specific logic from leaking into dataset pipelines, Audar V20 enforces a **Strict Adapter Pattern**. The generation scheduler interacts solely with a unified, provider-neutral abstraction (`IProviderAdapter`). Both Gemini TTS and ElevenLabs implement this exact contract.

```
┌────────────────────────────────────────────────────────┐
│                   Generation Engine                    │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             <<interface>> IProviderAdapter             │
│ + discoverCapabilities(): ProviderCapabilities        │
│ + validateLanguage(lang: string): boolean              │
│ + translateEmotionPrompt(spec: EmotionSpec): string    │
│ + generateSingleTake(req: GenerationRequest): Result   │
│ + getHealthAndQuota(): QuotaStatus                     │
└────────────────────────────────────────────────────────┘
              ▲                            ▲
              │                            │
   ┌──────────┴──────────┐      ┌──────────┴──────────┐
   │    GeminiAdapter    │      │  ElevenLabsAdapter  │
   │ - Multi-Key Pool    │      │ - Voice Settings    │
   │ - System Directives │      │ - Chunked Streaming │
   └─────────────────────┘      └─────────────────────┘
```

---

## 2. The 12 Mandatory Adapter Responsibilities

Every provider adapter must implement these twelve requirements:

1. **Model Capability Discovery:** Query and cache active model versions, supported sampling rates, and feature flags.
2. **Supported Language Validation:** Verify language code (`ckb`, `ar`, `en`) and script compatibility before dispatch.
3. **Speaker / Voice Selection:** Map canonical speaker IDs (e.g., `gemini_speaker_01`, `eleven_voice_sorani_f`) to provider voice UUIDs.
4. **Generation Request Creation:** Assemble the HTTP payload conforming to the provider's exact API schema.
5. **Emotion Instruction Translation:** Convert universal emotion/style tags (`[sad:0.8]`, `[whisper]`) into provider-native prompt formats.
6. **Continuous Performance Handling:** Ensure multi-emotion sequences are requested as a single uninterrupted generation.
7. **Audio Retrieval & Ingestion:** Retrieve raw audio streams and convert them into standardized 24 kHz mono WAV files.
8. **Retry & Rate-Limit Handling:** Intercept HTTP 429/503 errors and trigger key rotation or exponential backoff.
9. **Error Classification:** Map vendor error responses into standard Audar error enums.
10. **Cost & Usage Tracking:** Record characters synthesized, billed seconds, and token usage per call.
11. **Provenance Capture:** Collect request ID, provider timestamp, model ID, and audio SHA-256 hash.
12. **Original Audio Preservation:** Archive unmodified raw response bytes alongside normalized WAVs.

---

## 3. Interface Definition (TypeScript Reference)

```typescript
export interface GenerationRequest {
  id: string;
  scriptId: string;
  language: 'ckb' | 'ar' | 'en';
  normalizedText: string;
  voiceId: string;
  emotionTrack: Array<{
    textSpan: string;
    intendedComponents: Record<string, number>;
    deliveryStyle?: string;
  }>;
  nonverbalActions?: Array<{ action: string; position: number }>;
  targetDurationBucket: 'short' | 'medium' | 'extended' | 'long' | 'experimental';
}

export interface GenerationResult {
  success: boolean;
  audioBuffer?: Buffer;
  audioSha256?: string;
  durationSeconds?: number;
  sampleRate?: number;
  channels?: number;
  provenance: {
    provider: 'gemini' | 'elevenlabs';
    modelId: string;
    voiceId: string;
    requestId: string;
    latencyMs: number;
    costUsdEstimate: number;
    rawPayloadHash: string;
  };
  error?: {
    code: StandardErrorCode;
    message: string;
    retryable: boolean;
  };
}

export interface IProviderAdapter {
  readonly providerName: 'gemini' | 'elevenlabs';
  validateLanguage(lang: string): Promise<boolean>;
  translatePrompt(req: GenerationRequest): string | object;
  generateAudio(req: GenerationRequest): Promise<GenerationResult>;
  getQuotaStatus(): Promise<{ remainingRequests: number; resetTime: Date }>;
}
```

---

## 4. Standard Error Classification Taxonomy

All vendor-specific HTTP error codes and exception messages are mapped to this normalized taxonomy:

| Standard Error Code | Trigger Condition | Adapter Recovery Action |
|:---|:---|:---|
| `RATE_LIMIT_HIT` | HTTP 429 / Quota Exceeded | Rotate API Key in pool; if all exhausted, sleep with exponential jitter |
| `SERVER_OVERLOAD` | HTTP 500 / 503 / 504 | Retry up to 3 times with exponential backoff (1s, 2s, 4s) |
| `PROMPT_SAFETY_BLOCK`| Safety filter blocked script | Log rejection reason; flag script for review; do not retry |
| `LANGUAGE_UNSUPPORTED`| Model rejected `ckb` script | Fail immediately; route to fallback linguistic transliteration |
| `AUDIO_CORRUPTION` | Malformed WAV / 0 bytes | Retry once; if failed, mark candidate `rejected` |
| `TIMEOUT` | Request latency > 45s | Abort request; rotate key or retry |

---

## 5. Provenance Stamping Contract

Every candidate written to `metadata.jsonl` contains the immutable provenance block populated by the adapter:

```json
{
  "x_audar_provenance": {
    "provider": "gemini",
    "model_id": "gemini-3.8-flash-tts",
    "voice_id": "Puck",
    "generation_request_id": "req_gem_20261015_004812",
    "audio_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "latency_ms": 1420,
    "cost_usd_estimate": 0.0034,
    "training_use_authorization": "APPROVED_COMMERCIAL_SYNTHETIC_V20"
  }
}
```

