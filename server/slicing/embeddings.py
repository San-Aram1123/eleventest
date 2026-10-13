"""Real local CAM++/WeSpeaker ONNX embeddings, with training-compatible FBANK."""
import os
from functools import lru_cache
from pathlib import Path

import numpy as np

from audio_features import load_audio, resample, timbre_frames
from decoder import UnsafeSeparation, cluster_centroids, identity_margin
from speaker_models import MODELS, model_path, model_url


MODEL_NAME = MODELS['speaker_embedding'][0]
DEFAULT_MODEL = model_path('speaker_embedding')
MODEL_URL = model_url('speaker_embedding')

class SpeakerEmbedder:
    def __init__(self, model_key='speaker_embedding'):
        try:
            import onnxruntime as ort
            import kaldi_native_fbank as knf
        except ImportError as error:
            raise UnsafeSeparation('Speaker embedding dependencies are missing. Run '
                                   'python -m pip install numpy onnxruntime kaldi-native-fbank; '
                                   'then python server/slicing/setup_embedding.py.') from error
        filename = model_path(model_key)
        if not filename.is_file():
            raise UnsafeSeparation('Local speaker embedding model is missing. Run '
                                   f'python server/slicing/setup_embedding.py --model {model_key} ')
        settings = ort.SessionOptions()
        settings.intra_op_num_threads = min(4, max(1, os.cpu_count() or 1))
        settings.inter_op_num_threads = 1
        self.session = ort.InferenceSession(str(filename), sess_options=settings,
                                            providers=['CPUExecutionProvider'])
        inputs = self.session.get_inputs()
        if len(inputs) != 1 or len(inputs[0].shape) != 3 or inputs[0].shape[2] != 80:
            raise UnsafeSeparation('Unsupported speaker model: expected float32 [batch,time,80] FBANK input.')
        self.metadata = self.session.get_modelmeta().custom_metadata_map
        if self.metadata.get('framework') not in ('3d-speaker', 'wespeaker'):
            raise UnsafeSeparation('Speaker model must declare supported 3d-speaker/wespeaker metadata.')
        if self.metadata.get('sample_rate', '16000') != '16000':
            raise UnsafeSeparation('Only speaker models trained at 16 kHz are supported.')
        if self.metadata.get('feature_normalize_type', '') not in ('', 'global-mean'):
            raise UnsafeSeparation('Unsupported speaker feature normalization; expected global-mean.')
        self.input_name = inputs[0].name
        self.fixed_batch = inputs[0].shape[0] if isinstance(inputs[0].shape[0], int) else None
        self.knf = knf
        self.filename = filename.name

    def fbank(self, audio):
        opts = self.knf.FbankOptions()
        opts.frame_opts.samp_freq = 16000
        opts.frame_opts.dither = 0
        opts.frame_opts.snip_edges = True
        opts.mel_opts.num_bins = 80
        opts.mel_opts.debug_mel = False
        computer = self.knf.OnlineFbank(opts)
        samples = audio if self.metadata.get('normalize_samples', '1') == '1' else audio * 32768
        computer.accept_waveform(16000, samples.tolist())
        computer.input_finished()
        if computer.num_frames_ready < 40:
            raise UnsafeSeparation('Speaker embedding input has fewer than 0.4 seconds of audio.')
        return np.array([computer.get_frame(i) for i in range(computer.num_frames_ready)], np.float32)

    def windows(self, audio, rate, window=1.5, step=0.2):
        data = resample(audio, rate)
        duration = len(data) / 16000
        _, voiced, _, _ = timbre_frames(data, 16000)
        features = self.fbank(data)
        edges = np.linspace(0, duration, int(np.ceil(duration / step)) + 1)
        centers = (edges[:-1] + edges[1:]) / 2
        window_frames = int(window / 0.01)
        patches, reliability = [], []
        for center in centers:
            start = int(round(center / 0.01)) - window_frames // 2
            indexes = np.clip(np.arange(start, start + window_frames), 0, len(features) - 1)
            patch = features[indexes].copy()
            patches.append(self.normalize(patch))
            voice_indices = np.clip(indexes, 0, len(voiced) - 1)
            reliability.append(min(1.0, float(voiced[voice_indices].mean()) / 0.5))
        return self.infer(patches), np.array(reliability), edges

    def normalize(self, patch):
        if self.metadata.get('feature_normalize_type') == 'global-mean':
            return patch - patch.mean(axis=0, keepdims=True)
        return patch

    def infer(self, patches):
        vectors = []
        batch_size = self.fixed_batch or 16
        for start in range(0, len(patches), batch_size):
            batch = np.array(patches[start:start + batch_size], np.float32)
            real_size = len(batch)
            if self.fixed_batch and real_size < batch_size:
                batch = np.concatenate([batch, np.repeat(batch[-1:], batch_size - real_size, axis=0)])
            output = self.session.run(None, {self.input_name: batch})[0][:real_size]
            output = output.reshape(real_size, -1)
            if not np.isfinite(output).all() or np.any(np.linalg.norm(output, axis=1) < 1e-7):
                raise UnsafeSeparation('Speaker model returned invalid or empty embeddings.')
            vectors.extend(output / np.linalg.norm(output, axis=1, keepdims=True))
        return np.array(vectors)

    def enroll(self, filename):
        audio, rate, duration = load_audio(filename)
        if duration < 2:
            raise UnsafeSeparation('Each clean single-speaker reference must contain at least 2 seconds.')
        vectors, reliability, _ = self.windows(audio, rate, step=0.75)
        vectors = vectors[reliability > 0.8]
        if len(vectors) < 2:
            raise UnsafeSeparation('Reference audio has too little sustained voiced speech.')
        centroid = np.mean(vectors, axis=0)
        centroid /= max(float(np.linalg.norm(centroid)), 1e-9)
        cohesion = float(np.median(vectors @ centroid))
        if cohesion < 0.7:
            raise UnsafeSeparation('Reference speaker identity is inconsistent; use a clean single-speaker clip.')
        return centroid, cohesion


@lru_cache(maxsize=3)
def cached_embedder(model_key):
    return SpeakerEmbedder(model_key)


def embedding_identity(audio, rate, options, model_key='speaker_embedding', with_validator=False):
    embedder = cached_embedder(model_key)
    vectors, weights, edges = embedder.windows(audio, rate)
    reference1, reference2 = options.get('reference1Path'), options.get('reference2Path')
    if bool(reference1) != bool(reference2):
        raise UnsafeSeparation('Provide both speaker reference clips, or neither for automatic global enrollment.')
    if reference1:
        c1, cohesion1 = embedder.enroll(reference1)
        c2, cohesion2 = embedder.enroll(reference2)
        similarity = float(c1 @ c2)
        if similarity > 0.9:
            raise UnsafeSeparation('Reference voices are too similar or contain the same speaker.',
                                   {'referenceCosineSimilarity': similarity})
        centroids = np.array([c1, c2])
        diagnostics = {'enrollment': 'reference', 'referenceCosineSimilarity': similarity,
                       'referenceCohesion': [cohesion1, cohesion2],
                       'centroidSeparation': float(np.sum((c1 - c2) ** 2))}
        similarities = vectors @ centroids.T
        if np.median(np.max(similarities[weights > 0.65], axis=1)) < 0.35:
            raise UnsafeSeparation('Master voices do not reliably match the supplied reference speakers.', diagnostics)
    else:
        centroids, diagnostics = cluster_centroids(vectors, weights, edges, normalized=True)
    diagnostics.update({'model': embedder.filename, 'embeddingDimensions': int(vectors.shape[1]),
                        'source': 'local_onnx_cosine_speaker_identity', 'windowSeconds': 1.5,
                        'analysisHopSeconds': float(np.mean(np.diff(edges)))})
    result = (identity_margin(vectors, centroids), weights, edges, diagnostics)
    if not with_validator:
        return result
    # Reuse one full-recording FBANK; candidate windows never straddle the cut.
    resampled = resample(audio, rate)
    features = embedder.fbank(resampled)
    _, voiced, _, _ = timbre_frames(resampled, 16000)

    def validate(candidates, sign):
        scores = [[] for _ in candidates]
        for window in (0.8, 1.2):
            patches = []
            for candidate in candidates:
                for start, end in ((candidate['start'] - window, candidate['start']),
                                   (candidate['end'], candidate['end'] + window)):
                    first, last = int(start / .01), int(end / .01)
                    if (first < 0 or last > len(features) or last - first < 40 or
                            float(np.mean(voiced[first:last])) < .25):
                        patches.append(None)
                    else:
                        patches.append(embedder.normalize(features[first:last].copy()))
            valid = [i for i, patch in enumerate(patches) if patch is not None]
            margins = np.zeros(len(patches))
            # Equal-length grouping avoids ragged batches after time rounding.
            for length in sorted({len(patches[i]) for i in valid}):
                indices = [i for i in valid if len(patches[i]) == length]
                output = embedder.infer([patches[i] for i in indices])
                margins[indices] = identity_margin(output, centroids)
            for i in range(len(candidates)):
                scores[i].extend([float(margins[i * 2] * sign),
                                  float(-margins[i * 2 + 1] * sign)])
        return scores

    return (*result, validate)
