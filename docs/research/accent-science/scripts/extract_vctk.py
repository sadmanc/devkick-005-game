import os
import argparse
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
import numpy as np
import pandas as pd
import textgrid
from features import load, extract
from download_vctk import SELECTED


def read_tiers(path):
    tg = textgrid.TextGrid.fromFile(str(path))
    tier = next(t for t in tg if t.name.split()[-1] == 'phones')
    words = next(t for t in tg if t.name.split()[-1] == 'words')
    phones = [(r.minTime, r.maxTime, r.mark.lower().rstrip('012') or 'sil') for r in tier]
    return phones, [(r.minTime, r.maxTime, r.mark.lower()) for r in words if r.mark]


def word_at(words, t):
    return next((w for a, b, w in words if a <= t < b), '')


def one(job):
    data, sid, audio, accent, sex = job
    uid = audio.stem
    path = data / 'vctk-aligned' / sid / (uid + '.TextGrid')
    if not path.exists():
        return None
    phones, words = read_tiers(path)
    y = load(audio)
    f, vowels, rhotics, f0 = extract(y, phones)
    meta = dict(corpus='VCTK', speaker=sid, accent=accent, sex=sex, utterance=uid)
    vowels = [dict(**meta, word=word_at(words, r['start'] + .01), **r) for r in vowels]
    rhotics = [dict(**meta, word=word_at(words, r['start'] + .01), **r) for r in rhotics]
    return dict(**meta, **f), vowels, rhotics


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--data', type=Path, default=Path(os.environ.get('DATA', '/home/ubuntu/accent-data')))
    p.add_argument('--workers', type=int, default=6)
    a = p.parse_args()
    meta = {}
    for line in (a.data / 'vctk/speaker-info.txt').read_text().splitlines()[1:]:
        fields = line.split()
        if len(fields) > 3:
            meta[fields[0]] = (fields[3], fields[2])
    jobs = [(a.data, sid, path, *meta[sid]) for sid in SELECTED if sid in meta
            for path in sorted((a.data / 'vctk-align-input' / sid).glob('*.wav'))]
    rows, vowels, rhotics = [], [], []
    with ProcessPoolExecutor(a.workers) as pool:
        for i, res in enumerate(pool.map(one, jobs)):
            if res is None:
                continue
            f, v, r = res
            rows.append(f); vowels.extend(v); rhotics.extend(r)
            if i % 50 == 0:
                print(i, '/', len(jobs), flush=True)
    for name, records in [('vctk_features', rows), ('vctk_vowels', vowels), ('vctk_rhotics', rhotics)]:
        pd.DataFrame(records).to_csv(a.data / (name + '.csv'), index=False)
    print('Extracted', len(rows), 'utterances;', len(vowels), 'vowels;', len(rhotics), 'rhotics')
