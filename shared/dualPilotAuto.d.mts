export interface AutoCondition { key: string; name: string; defaultIntensity: number }
export interface AutoTask {
  provider: 'gemini' | 'elevenlabs'; start: number; condition: AutoCondition;
  emotionIndex: number; paragraphs?: string[]; text?: string; key: string; count: number;
}
export function automaticTasks(gemini: string[], elevenlabs: string[], emotions: AutoCondition[]): Generator<AutoTask>;
export function executeAutomaticTasks(tasks: Iterable<AutoTask> | (() => Iterable<AutoTask>), handlers: {
  run: (task: AutoTask) => Promise<any>; success: (task: AutoTask, result: any) => void;
  failure: (task: AutoTask, error: any) => void; signal: AbortSignal;
}): Promise<void>;
