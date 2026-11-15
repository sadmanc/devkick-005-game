import argparse
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
import numpy as np
import pandas as pd
import textgrid
from features import load, extract
from download_vctk import SELECTED


def read_phones(path):
    tg = textgrid.TextGrid.fromFile(str(path))
    tier = next(t for t in tg if t.name.split()[-1] == 'phones')
    return [(r.minTime, r.maxTime, r.mark.lower().rstrip('012') or 'sil') for r in tier]


def one(job):
    data, sid, audio, accent, sex = job
    uid = audio.stem
    phones = read_phones(data / 'vctk-aligned' / sid / (uid + '.TextGrid'))
    y = load(audio)
    f, vowels, rhotics, f0 = extract(y, phones)
    meta = dict(corpus='VCTK', speaker=sid, accent=accent, sex=sex, utterance=uid)
    return dict(**meta, **f), [dict(**meta, **r) for r in vowels], [dict(**meta, **r) for r in rhotics]


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--data', type=Path, default=Path('/home/ubuntu/accent-data'))
    p.add_argument('--workers', type=int, default=6)
    a = p.parse_args()
    meta = {}
    for line in (a.data / 'vctk/speaker-info.txt').read_text().splitlines()[1:]:
        fields = line.split()
        if len(fields) > 3:
            meta[fields[0]] = (fields[3], fields[2])
    jobs = [(a.data, sid, path, *meta[sid]) for sid in SELECTED
            for path in sorted((a.data / 'vctk-align-input' / sid).glob('*.wav'))]
    rows, vowels, rhotics = [], [], []
    with ProcessPoolExecutor(a.workers) as pool:
        for i, (f, v, r) in enumerate(pool.map(one, jobs)):
            rows.append(f); vowels.extend(v); rhotics.extend(r)
            if i % 50 == 0:
                print(i, '/', len(jobs), flush=True)
    for name, records in [('vctk_features', rows), ('vctk_vowels', vowels), ('vctk_rhotics', rhotics)]:
        pd.DataFrame(records).to_csv(a.data / (name + '.csv'), index=False)
    print('Extracted', len(rows), 'utterances;', len(vowels), 'vowels;', len(rhotics), 'rhotics')
