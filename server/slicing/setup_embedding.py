"""Explicit one-time free model download. Detection itself never uses the network."""
import argparse
import hashlib
import json
import os
import tempfile
import urllib.request
from pathlib import Path

from embeddings import SpeakerEmbedder
from speaker_models import MODELS, model_path, model_url




def checksum(path):
    digest = hashlib.sha256()
    with open(path, 'rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def install(key):
    _, SHA256, variable = MODELS[key]
    configured = os.environ.get(variable)
    target = model_path(key)
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_file():
        actual = checksum(target)
        if not configured and actual != SHA256:
            raise ValueError('Cached model checksum mismatch. Existing file was preserved; '
                             'move it aside before downloading a fresh model.')
        embedder = SpeakerEmbedder(key)
        print(json.dumps({'success': True, 'model': str(target), 'sha256': actual,
                          'pinnedDefaultModel': actual == SHA256, 'metadata': embedder.metadata}))
        return
    if not target.exists():
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(dir=target.parent, suffix='.download', delete=False) as handle:
                temporary = Path(handle.name)
                with urllib.request.urlopen(model_url(key), timeout=60) as response:
                    while chunk := response.read(1024 * 1024):
                        handle.write(chunk)
            if checksum(temporary) != SHA256:
                raise ValueError('Downloaded model checksum mismatch; existing model was preserved.')
            temporary.replace(target)
        finally:
            if temporary and temporary.exists():
                temporary.unlink()
    embedder = SpeakerEmbedder(key)
    print(json.dumps({'success': True, 'model': str(target), 'sha256': checksum(target),
                      'metadata': embedder.metadata}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--model', choices=[*MODELS, 'all'], default='speaker_embedding')
    key = parser.parse_args().model
    for selected in MODELS if key == 'all' else [key]:
        install(selected)
