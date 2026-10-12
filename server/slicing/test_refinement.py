"""Short-gap, phoneme-trough, widened-search and consensus regressions."""
import unittest
import numpy as np

from boundary_refinement import resolve_boundary
from consensus import consensus, NEURAL_ENGINES
from decoder import UnsafeSeparation
from engines import build_segments


def signal(gaps):
    rate = 16000
    audio = .2 * np.sin(np.arange(rate * 6) * 2 * np.pi * 160 / rate)
    for start, end in gaps:
        audio[int(start * rate):int(end * rate)] = 0
    return audio, rate


class RefinementTests(unittest.TestCase):
    def test_35ms_gap_requires_strong_bilateral_identity(self):
        audio, rate = signal([(2.9825, 3.0175)])
        cut, details = resolve_boundary(audio, rate, 3, 1, 5, 0,
                                        lambda candidates, sign: [[.8] * 4 for _ in candidates])
        self.assertTrue(details['accepted'])
        self.assertLess(details['quietRunSeconds'], .06)
        self.assertTrue(2.9825 < cut < 3.0175)
        _, weak = resolve_boundary(audio, rate, 3, 1, 5, 0,
                                   lambda candidates, sign: [[.8, .2, .8, .8] for _ in candidates])
        self.assertFalse(weak['accepted'])
        _, strict = resolve_boundary(audio, rate, 3, 1, 5, 0, strict=True)
        self.assertFalse(strict['accepted'])

    def test_same_speaker_trough_rejected_even_if_long(self):
        audio, rate = signal([(2.9, 3.1)])
        _, details = resolve_boundary(audio, rate, 3, 1, 5, 0,
                                     lambda candidates, sign: [[.8, -.8, .8, -.8] for _ in candidates])
        self.assertFalse(details['accepted'])

    def test_search_finds_handoff_beyond_old_180ms_radius(self):
        audio, rate = signal([(2.9, 3.1), (3.47, 3.53)])
        def identity(candidates, sign):
            return [[.8] * 4 if candidate['start'] > 3.3 else [.8, -.8, .8, -.8]
                    for candidate in candidates]
        cut, details = resolve_boundary(audio, rate, 3, 1, 5, 0, identity)
        self.assertTrue(details['accepted'])
        self.assertTrue(3.47 < cut < 3.53)

    def test_no_quiet_or_tiny_notch_cannot_be_rescued_by_identity(self):
        for gaps in ([], [(2.995, 3.005)]):
            audio, rate = signal(gaps)
            _, details = resolve_boundary(audio, rate, 3, 1, 5, 0,
                                          lambda candidates, sign: [[1] * 4 for _ in candidates])
            self.assertFalse(details['accepted'])

    def test_rejection_retains_every_proposal_and_no_clips(self):
        audio, rate = signal([(1.98, 2.02), (3.98, 4.02)])
        with self.assertRaises(UnsafeSeparation) as caught:
            build_segments(audio, rate, [2, 4], 3,
                           {'minSegmentSeconds': .8, 'maxSegmentSeconds': 3}, 'timbre_dp')
        self.assertEqual(caught.exception.diagnostics['rejectedBoundaries'], [1, 2])
        self.assertEqual(len(caught.exception.diagnostics['proposedBoundaries']), 2)

    def test_alternating_sign_is_passed_to_identity_validator(self):
        audio, rate = signal([(1.9, 2.1), (3.9, 4.1)])
        seen = []
        def identity(candidates, sign):
            seen.append(sign)
            return [[.8] * 4 for _ in candidates]
        build_segments(audio, rate, [2, 4], 3,
                       {'minSegmentSeconds': .8, 'maxSegmentSeconds': 3}, 'speaker_embedding', identity)
        self.assertEqual(seen, [1, -1])


class ConsensusTests(unittest.TestCase):
    def results(self):
        return {name: {'success': True, 'boundaries': [{'start': 1.95, 'end': 2.05, 'midpoint': 2}],
                       'diagnostics': {'minSegmentSeconds': .8, 'maxSegmentSeconds': 3}}
                for name in NEURAL_ENGINES}

    def test_all_models_and_common_quiet_interval_required(self):
        results = self.results()
        accepted = consensus(results, 2, 4)
        self.assertTrue(accepted['success'])
        self.assertEqual(accepted['segments'][0]['end'], accepted['segments'][1]['start'])
        results['speaker_resnet']['success'] = False
        self.assertFalse(consensus(results, 2, 4)['success'])

    def test_disjoint_quiet_intervals_reject_despite_close_cuts(self):
        results = self.results()
        results['speaker_resnet']['boundaries'][0] = {'start': 2.06, 'end': 2.1, 'midpoint': 2.08}
        self.assertFalse(consensus(results, 2, 4)['success'])


if __name__ == '__main__':
    unittest.main()
