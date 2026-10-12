/**
 * Gemini Service Entrypoint & Re-Export Facade
 *
 * Decomposed into modular services under ./services/ strictly conforming to
 * component-based architecture line limits (each <= 320 lines):
 * - ./services/geminiConstants.js : Paths, voices, models (Gemini 2.5 purged)
 * - ./services/geminiKeyPool.js   : Multi-key rotation, pool CRUD, metrics, and cooldown calculations
 * - ./services/geminiProber.js    : Zero-quota probe, diagnostic checks, dynamic discovery
 * - ./services/geminiPrompts.js   : Multilingual analysis, BiDi normalization, prompt formatting
 * - ./services/geminiAudio.js     : Audio buffer parsing, WAV formatting, duration estimation
 * - ./services/geminiClient.js    : Core execution engine, LRU failover, strict single-model enforcement
 */

export * from './services/geminiConstants.js';
export * from './services/geminiKeyPool.js';
export * from './services/geminiProber.js';
export * from './services/geminiPrompts.js';
export * from './services/geminiAudio.js';
export * from './services/geminiClient.js';
