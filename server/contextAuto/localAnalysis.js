import { createContextLabService } from '../contextLabService.js';
import { persistentSpeakerDetector } from '../alignment/localSpeakerWorker.js';

// The interactive Lab keeps its existing process-per-test behavior.
export const { analyzeContextLabMaster: analyzeAutoMaster } = createContextLabService({
  detectSegments: (...args) => persistentSpeakerDetector.detect(...args)
});
