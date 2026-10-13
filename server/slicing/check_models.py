"""Read-only model/dependency preflight; never downloads or synthesizes audio."""
import json
from embeddings import SpeakerEmbedder
from speaker_models import MODELS

if __name__ == '__main__':
    try:
        models = [SpeakerEmbedder(key).filename for key in MODELS]
        print(json.dumps({'success': True, 'models': models}))
    except Exception as error:
        print(json.dumps({'success': False, 'error': str(error)}))
