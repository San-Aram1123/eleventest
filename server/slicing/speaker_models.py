"""Pinned CPU models from the official sherpa-onnx speaker model release."""
import os
from pathlib import Path

MODELS = {
    'speaker_embedding': ('3dspeaker_speech_campplus_sv_zh_en_16k-common_advanced.onnx',
                          'aa3cfc16963a10586a9393f5035d6d6b57e98d358b347f80c2a30bf4f00ceba2',
                          'SPEAKER_EMBEDDING_MODEL'),
    'speaker_resnet': ('wespeaker_en_voxceleb_resnet34.onnx',
                       '5ef208a9da1453335308a6b6f4e6dfbd7e183a38b604de0a57664f45d257fe94',
                       'SPEAKER_RESNET_MODEL'),
    'speaker_eres2net': ('3dspeaker_speech_eres2net_sv_en_voxceleb_16k.onnx',
                         'c59158379255ad66e161679cca6af8d52d51e389e3224ab7d7a7baae295c2db5',
                         'SPEAKER_ERES2NET_MODEL'),
}


def model_path(key):
    name, _, variable = MODELS[key]
    return Path(os.environ.get(variable) or Path.home() / '.cache' / 'eleventest' / name)


def model_url(key):
    return ('https://github.com/k2-fsa/sherpa-onnx/releases/download/'
            'speaker-recongition-models/' + MODELS[key][0])
