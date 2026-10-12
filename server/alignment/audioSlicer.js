import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { refineWavSlice } from '../waveformBoundaryRefiner.js';

/**
 * Slices master WAV based on segments with sample-accurate boundaries.
 * Automatically runs waveform boundary refinement against the actual audio waveform.
 */
export async function sliceAudioBySegments(masterWavPath, segments, options = {}) {
  const buffers = [];
  const sliceMetrics = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const outTmp = path.resolve(os.tmpdir(), `seg_slice_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`);
    const dur = Math.max(0.1, seg.end - seg.start);

    try {
      await new Promise((resolve, reject) => {
        const proc = spawn('ffmpeg', [
          '-y',
          '-ss', String(seg.start),
          '-t', String(dur),
          '-i', masterWavPath,
          '-c:a', 'pcm_s16le',
          outTmp
        ]);
        proc.on('close', (c) => c === 0 ? resolve() : reject(new Error(`FFmpeg slice failed with code ${c}`)));
        proc.on('error', reject);
      });

      if (fs.existsSync(outTmp) && fs.statSync(outTmp).size > 4000) {
        const rawBuf = fs.readFileSync(outTmp);
        const { refinedBuffer, boundaryMetrics } = refineWavSlice(rawBuf, {
          isWhisper: Boolean(options.isWhisper),
          emotion: options.emotion,
          stripBreathing: Boolean(options.stripBreathing)
        });
        buffers.push(refinedBuffer);
        sliceMetrics.push(boundaryMetrics);
      } else {
        buffers.push(Buffer.alloc(0));
        sliceMetrics.push(null);
      }
    } finally {
      if (fs.existsSync(outTmp)) {
        try { fs.unlinkSync(outTmp); } catch (_) { }
      }
    }
  }

  buffers.sliceMetrics = sliceMetrics;
  return buffers;
}
