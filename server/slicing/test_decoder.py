"""Behavioral safety tests; no network, transcription, or paid speech generation."""
import unittest

import numpy as np

from decoder import UnsafeSeparation, cluster_centroids, decode_turns
from detect import validate_options
from engines import build_segments


def turn_evidence(lengths):
    values = np.concatenate([np.full(int(round(length * 10)), 0.9 if i % 2 == 0 else -0.9)
                             for i, length in enumerate(lengths)])
    return values, np.ones(len(values)), np.arange(len(values) + 1) / 10


class TurnDecoderTests(unittest.TestCase):
    def test_global_path_spans_whole_master_with_unequal_durations(self):
        evidence = turn_evidence([7, 12, 8, 14, 9])
        cuts, diagnostics = decode_turns(*evidence, 5)
        np.testing.assert_allclose(cuts, [7, 19, 27, 41], atol=0.2)
        self.assertGreater(diagnostics['minConfidence'], 0.9)
        self.assertEqual(len(diagnostics['boundaryConfidence']), 4)

    def test_short_expressive_excursions_do_not_become_turns(self):
        values, weights, edges = turn_evidence([10, 9, 11, 9, 10])
        for index in (12, 35, 75, 145, 235, 342, 470):
            values[index:index + 2] *= -1
        weights[55:62] = 0  # A long breath is unavailable evidence, not a change.
        cuts, _ = decode_turns(values, weights, edges, 5)
        np.testing.assert_allclose(cuts, [10, 19, 30, 39], atol=0.2)

    def test_first_line_cannot_absorb_master_and_leave_tiny_scraps(self):
        values = np.r_[np.ones(530), -np.ones(4), np.ones(4), -np.ones(4), np.ones(28)]
        with self.assertRaises(UnsafeSeparation):
            decode_turns(values, np.ones(len(values)), np.arange(len(values) + 1) / 10, 5)

    def test_ambiguous_identity_fails_closed(self):
        with self.assertRaises(UnsafeSeparation):
            decode_turns(np.zeros(300), np.ones(300), np.arange(301) / 10, 3)

    def test_missing_turn_does_not_force_an_invented_boundary(self):
        with self.assertRaises(UnsafeSeparation):
            decode_turns(*turn_evidence([8, 8, 8]), 5)

    def test_extra_real_turn_cannot_be_hidden_in_a_long_segment(self):
        with self.assertRaises(UnsafeSeparation):
            decode_turns(*turn_evidence([8, 8, 8, 8, 8]), 3)

    def test_duration_limits_can_reject_an_impossible_count(self):
        with self.assertRaisesRegex(UnsafeSeparation, 'duration limits'):
            decode_turns(*turn_evidence([3, 3, 3]), 3, {'minSegmentSeconds': 4})

    def test_retrospective_labels_do_not_enter_decoding(self):
        evidence = turn_evidence([7, 8, 9])
        cuts, _ = decode_turns(*evidence, 3)
        changed, _ = decode_turns(*evidence, 3, {'expectedBoundaries': [1, 23]})
        self.assertEqual(cuts, changed)

    def test_cluster_ids_remain_globally_anchored(self):
        random = np.random.default_rng(23)
        data = np.r_[random.normal(-2, 0.1, (40, 3)), random.normal(2, 0.1, (40, 3)),
                     random.normal(-2, 0.1, (40, 3))]
        centers, _ = cluster_centroids(data, np.ones(len(data)), np.arange(len(data) + 1) / 10)
        self.assertLess(np.linalg.norm(centers[0] - data[0]), np.linalg.norm(centers[1] - data[0]))

    def test_unstructured_single_identity_does_not_enroll_two_speakers(self):
        data = np.random.default_rng(3).normal(0, 1, (150, 12))
        with self.assertRaisesRegex(UnsafeSeparation, 'overlap'):
            cluster_centroids(data, np.ones(len(data)), np.arange(len(data) + 1) / 10)

    def test_option_values_match_service_limits(self):
        validate_options({'minSegmentSeconds': 0.4, 'maxSegmentSeconds': 600,
                          'confidenceThreshold': 1}, 3, 24)
        for options in ({'confidenceThreshold': float('nan')}, {'confidenceThreshold': True},
                        {'minSegmentSeconds': 61}, {'maxSegmentSeconds': 601},
                        {'expectedBoundaries': [2, 1]}):
            with self.subTest(options=options), self.assertRaises(ValueError):
                validate_options(options, 3, 24)

    def test_short_phoneme_notch_cannot_be_accepted_as_handoff(self):
        rate = 16000
        audio = np.sin(np.arange(rate * 4) * 2 * np.pi * 160 / rate).astype(np.float32) * 0.2
        audio[int(1.993 * rate):int(2.007 * rate)] = 0
        with self.assertRaisesRegex(UnsafeSeparation, '60 ms quiet'):
            build_segments(audio, rate, [2], 2,
                           {'minSegmentSeconds': 0.8, 'maxSegmentSeconds': 3}, 'timbre_dp')

    def test_genuine_150ms_quiet_handoff_can_be_refined(self):
        rate = 16000
        audio = np.sin(np.arange(rate * 4) * 2 * np.pi * 160 / rate).astype(np.float32) * 0.2
        audio[int(1.925 * rate):int(2.075 * rate)] = 0
        segments, boundaries = build_segments(audio, rate, [2], 2,
                                              {'minSegmentSeconds': 0.8, 'maxSegmentSeconds': 3}, 'timbre_dp')
        self.assertEqual(len(segments), 2)
        self.assertGreaterEqual(boundaries[0]['quietRunSeconds'], 0.06)
        self.assertGreater(segments[0]['end'], 1.925)
        self.assertLess(segments[0]['end'], 2.075)


if __name__ == '__main__':
    unittest.main()
