"""Mean-pool every transformer layer of a self-supervised speech model per utterance.

Caches one (layers x 768) array per file under DATA/ssl/<model>/<corpus>/ (outside git).
"""
import os
import argparse
import json
from pathlib import Path
import numpy as np
import torch
from transformers import AutoModel
from huggingface_hub import model_info
from features import load

MODELS = {'wavlm': 'microsoft/wavlm-base-plus', 'wav2vec2': 'facebook/wav2vec2-base'}


def encode(model, y):
    x = torch.tensor(y, dtype=torch.float32)
    x = (x - x.mean()) / torch.sqrt(x.var(unbiased=False) + 1e-7)
    with torch.inference_mode():
        states = model(x[None, :], output_hidden_states=True).hidden_states
    return np.stack([s[0].mean(0).numpy() for s in states]).astype(np.float32)


def files(data, corpus):
    if corpus == 'vctk':
        return sorted((data / 'vctk-align-input').glob('*/*.wav'))
    from download_arctic import SPEAKERS
    return [data / f'cmu_us_{s}_arctic/wav/arctic_a{i:04d}.wav' for s in SPEAKERS for i in range(1, 201)]


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--data', type=Path, default=Path(os.environ.get('DATA', '/home/ubuntu/accent-data')))
    p.add_argument('--model', choices=MODELS, default='wavlm')
    p.add_argument('--corpus', choices=['vctk', 'arctic'], default='vctk')
    p.add_argument('--threads', type=int, default=6)
    a = p.parse_args()
    torch.set_num_threads(a.threads)
    name = MODELS[a.model]
    model = AutoModel.from_pretrained(name).eval()
    out = a.data / 'ssl' / a.model / a.corpus
    out.mkdir(parents=True, exist_ok=True)
    todo = files(a.data, a.corpus)
    for i, path in enumerate(todo):
        key = path.stem if a.corpus == 'vctk' else f'{path.parents[1].name.split("_")[2]}_{path.stem}'
        dest = out / (key + '.npy')
        if not dest.exists():
            np.save(dest, encode(model, load(path)))
        if i % 100 == 0:
            print(i, '/', len(todo), flush=True)
    (a.data / 'ssl' / f'{a.model}.json').write_text(json.dumps(dict(model=name, revision=model_info(name).sha), indent=2))
