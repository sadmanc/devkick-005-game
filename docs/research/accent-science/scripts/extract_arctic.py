import os
import argparse
from concurrent.futures import ProcessPoolExecutor
import json
from pathlib import Path
import numpy as np
import pandas as pd
from download_arctic import SPEAKERS
from features import load, labels, extract


def one(job):
    root, speaker, uid = job
    base = root / f'cmu_us_{speaker}_arctic'
    y = load(base / 'wav' / f'{uid}.wav')
    phones = labels(base / 'lab' / f'{uid}.lab')
    if not phones:
        raise ValueError(f'Missing labels: {base} {uid}')
    f, vowels, rhotics, pitch = extract(y, phones)
    meta = dict(corpus='ARCTIC', speaker=speaker, accent=SPEAKERS[speaker][0],
                sex=SPEAKERS[speaker][1], utterance=uid)
    return dict(**meta, **f), [dict(**meta, **r) for r in vowels], [dict(**meta, **r) for r in rhotics]


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=Path, default=Path(os.environ.get('DATA', '/home/ubuntu/accent-data')))
    parser.add_argument('--sentences', type=int, default=120)
    parser.add_argument('--workers', type=int, default=6)
    args = parser.parse_args()
    jobs = [(args.data, speaker, f'arctic_a{i:04d}') for speaker in SPEAKERS
            for i in range(1, args.sentences + 1)]
    rows, vowels, rhotics = [], [], []
    with ProcessPoolExecutor(args.workers) as pool:
        for i, (f, v, r) in enumerate(pool.map(one, jobs)):
            rows.append(f); vowels.extend(v); rhotics.extend(r)
            if i % 60 == 0:
                print(i, '/', len(jobs), flush=True)
    for name, data in [('arctic_features', rows), ('arctic_vowels', vowels), ('arctic_rhotics', rhotics)]:
        pd.DataFrame(data).to_csv(args.data / f'{name}.csv', index=False)
    print('Extracted', len(rows), 'utterances;', len(vowels), 'vowels;', len(rhotics), 'rhotics')
