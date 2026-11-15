"""Mean-pool all wav2vec2-base transformer layers; cache arrays outside git."""
import argparse
import json
from pathlib import Path
import numpy as np
import torch
from transformers import Wav2Vec2Model
from features import load

MODEL = 'facebook/wav2vec2-base'
REVISION = '0b5b8e868dd84f03fd87d01f9c4ff0f080fec9bd'


def encode(model, y):
    x = torch.tensor(y, dtype=torch.float32)
    x = (x - x.mean()) / torch.sqrt(x.var(unbiased=False) + 1e-7)
    with torch.inference_mode():
        states = model(x[None, :], output_hidden_states=True).hidden_states
    return np.stack([s[0].mean(0).numpy() for s in states])


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--data', type=Path, default=Path('/home/ubuntu/accent-data'))
    a = p.parse_args()
    torch.set_num_threads(6)
    model = Wav2Vec2Model.from_pretrained(MODEL, revision=REVISION).eval()
    files = sorted((a.data / 'vctk-align-input').glob('*/*.wav'))
    out = a.data / 'ssl'
    out.mkdir(exist_ok=True)
    for i, path in enumerate(files):
        dest = out / (path.stem + '.npy')
        if not dest.exists():
            np.save(dest, encode(model, load(path)))
        if i % 30 == 0:
            print(i, '/', len(files), flush=True)
    (a.data / 'ssl-model.json').write_text(json.dumps(dict(model=MODEL, revision=REVISION, middle_layer=6), indent=2))
