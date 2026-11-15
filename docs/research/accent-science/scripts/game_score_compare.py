"""Does the current Sound Local accent score (pitch-DTW + loudness envelope, ported from
src/voice/pitch.js) give higher scores to same-accent pairs than to different-accent pairs?

Every pair of speakers reading the identical sentence is scored, one as "player" and one as
"reference". Writes charts/14-current-game-score.png and results/game_score_results.json.
"""
import os
import itertools
import json
import re
from collections import defaultdict
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import roc_auc_score
from features import load
from game_score import contour, compare
from download_arctic import SPEAKERS
from style import COLOR, LABEL, save

DATA = Path(os.environ.get('DATA', '/home/ubuntu/accent-data'))
HERE = Path(__file__).resolve().parent
RESULTS = HERE.parent / 'results'


def norm(text):
    return re.sub(r'[^a-z ]', '', text.lower()).split()


def vctk_items():
    meta = {}
    for line in (DATA / 'vctk/speaker-info.txt').read_text().splitlines()[1:]:
        f = line.split()
        if len(f) > 3:
            meta[f[0]] = f[3]
    by_text = defaultdict(list)
    for wav in sorted((DATA / 'vctk-align-input').glob('*/*.wav')):
        sid = wav.parent.name
        if meta.get(sid) not in COLOR:
            continue
        txt = wav.with_suffix('.txt')
        by_text[' '.join(norm(txt.read_text()))].append((sid, meta[sid], wav))
    return {k: v for k, v in by_text.items() if len(v) > 5}


def arctic_items():
    out = {}
    for i in range(1, 201):
        out[f'arctic_a{i:04d}'] = [(s, SPEAKERS[s][0], DATA / f'cmu_us_{s}_arctic/wav/arctic_a{i:04d}.wav')
                                   for s in SPEAKERS]
    return out


def pairs(items):
    rows = []
    for sentence, group in items.items():
        cache = {sid: contour(load(path).astype(np.float32)) for sid, _, path in group}
        for (s1, a1, _), (s2, a2, _) in itertools.permutations(group, 2):
            r = compare(cache[s1], cache[s2])
            if r:
                rows.append(dict(sentence=sentence, player=s1, player_accent=a1,
                                 reference=s2, reference_accent=a2, same=a1 == a2, **r))
    return rows


def auc(rows, key, sign=1):
    y = [r['same'] for r in rows]
    return float(roc_auc_score(y, [sign * r[key] for r in rows])) if len(set(y)) == 2 else None


if __name__ == '__main__':
    out = {}
    fig, axes = plt.subplots(1, 3, figsize=(16, 5.2), gridspec_kw=dict(width_ratios=[1, 1, 1.5], wspace=.45))
    for ax, (name, items) in zip(axes[:2], [('CMU ARCTIC (7 speakers, 200 sentences)', arctic_items()),
                                             ('VCTK (same sentences, %d speakers)', vctk_items())]):
        rows = pairs(items)
        if '%d' in name:
            name = name % len({r['player'] for r in rows})
            vctk_rows = rows
        same = [r['score'] for r in rows if r['same']]
        diff = [r['score'] for r in rows if not r['same']]
        res = dict(pairs=len(rows), sentences=len(items), same_mean=float(np.mean(same)),
                   different_mean=float(np.mean(diff)), auc_score=auc(rows, 'score'),
                   auc_melody_distance=auc(rows, 'distance', -1),
                   auc_envelope_distance=auc(rows, 'envelope_distance', -1))
        out[name] = res
        ax.hist([same, diff], bins=np.linspace(0, 1, 21), density=True,
                label=['same accent', 'different accent'], color=['#0072B2', '#E69F00'], alpha=.85)
        ax.set_title(f'{name}\nAUC {res["auc_score"]:.2f} (0.5 = cannot tell apart)', fontsize=10)
        ax.set_xlabel('current Sound Local accent score (0-1)')
        ax.set_ylabel('share of pairs (density)')
        ax.legend(frameon=False, fontsize=8)
    # Per reference accent (VCTK): mean score a player gets from each accent.
    accents = [a for a in COLOR if any(r['reference_accent'] == a for r in vctk_rows)]
    m = np.array([[np.mean([r['score'] for r in vctk_rows if r['reference_accent'] == ref and r['player_accent'] == pl])
                   for pl in accents] for ref in accents])
    im = axes[2].imshow(m, cmap='Blues', vmin=m.min() - .02, vmax=m.max() + .02)
    for i in range(len(accents)):
        for j in range(len(accents)):
            axes[2].text(j, i, f'{m[i, j]:.2f}', ha='center', va='center', fontsize=9)
    axes[2].set_xticks(range(len(accents)), [LABEL[a] for a in accents], rotation=25, ha='right', fontsize=8)
    axes[2].set_yticks(range(len(accents)), [LABEL[a] for a in accents], fontsize=8)
    axes[2].set_xlabel('player accent'); axes[2].set_ylabel('reference accent', labelpad=2)
    axes[2].set_title('VCTK: mean score by reference x player accent\n(a useful accent score would be darkest on the diagonal)', fontsize=10)
    out['vctk_mean_score_matrix'] = dict(accents=accents, matrix=m.round(3).tolist())
    save(fig, '14-current-game-score.png',
         'Data: CMU ARCTIC (CMU licence) and VCTK (CC BY 4.0). Score = Python port of src/voice/pitch.js, parity-checked against the JS.')
    RESULTS.mkdir(exist_ok=True)
    (RESULTS / 'game_score_results.json').write_text(json.dumps(out, indent=1))
    print(json.dumps(out, indent=1))
