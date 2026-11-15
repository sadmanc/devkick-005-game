#!/usr/bin/env python3
"""Charts and a summary table from measurements.json:  python3 charts.py  ->  charts/*.png, summary.md"""
import json, os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'charts')
COL = {'toronto': '#d7263d', 'general_american': '#1b4f72', 'glasgow': '#2a9d8f', 'glasgow_otter': '#8fd3c8'}
NAME = {'toronto': 'Toronto (SAA)', 'general_american': 'General American (SAA)', 'glasgow': 'Glasgow (SAA)',
        'glasgow_otter': 'Glasgow otter (game TTS)'}
METRICS = [('f0_range_st_5_95', 'F0 range, semitones (5-95%)'), ('f0_sd_st', 'F0 SD, semitones'),
           ('speech_rate_syl_s', 'Speech rate, syll/s'), ('articulation_rate_syl_s', 'Articulation rate, syll/s'),
           ('pause_mean_s', 'Mean pause, s'), ('pause_rate_per_min', 'Pauses per minute'),
           ('pct_v_proxy', '%V (voicing proxy)'), ('delta_c_proxy_ms', 'deltaC, ms (voicing proxy)'),
           ('npvi_v_proxy', 'nPVI-V (voicing proxy)'), ('phrase_final_rise_pct', 'Phrase-final rises, %'),
           ('phrase_final_fall_pct', 'Phrase-final falls, %')]


def main():
    data = json.load(open(os.path.join(HERE, 'measurements.json')))['clips']
    os.makedirs(OUT, exist_ok=True)
    groups = [g for g in COL if any(c['group'] == g for c in data)]
    by = {g: [c for c in data if c['group'] == g] for g in groups}

    fig, axes = plt.subplots(3, 4, figsize=(16, 11))
    for ax, (key, label) in zip(axes.flat, METRICS):
        vals = [[c[key] for c in by[g] if c.get(key) is not None] for g in groups]
        for i, (g, v) in enumerate(zip(groups, vals)):
            ax.scatter(np.full(len(v), i) + np.random.default_rng(1).uniform(-0.12, 0.12, len(v)), v, color=COL[g], s=28)
            if v:
                ax.hlines(np.mean(v), i - 0.3, i + 0.3, color='black', lw=2)
        ax.set_xticks(range(len(groups)), [NAME[g].split(' (')[0] for g in groups], fontsize=8)
        ax.set_title(label, fontsize=10)
    axes.flat[-1].axis('off')
    fig.suptitle('Prosody and rhythm per speaker (bar = group mean). Same read passage except the otter.', fontsize=12)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, 'prosody-rhythm.png'), dpi=110)

    fig, ax = plt.subplots(figsize=(6, 5))
    for g in groups:
        pts = [(c['pct_v_proxy'], c['delta_c_proxy_ms']) for c in by[g] if c.get('pct_v_proxy')]
        if pts:
            ax.scatter(*zip(*pts), color=COL[g], label=NAME[g])
    ax.set_xlabel('%V (voicing proxy)'); ax.set_ylabel('deltaC, ms (voicing proxy)'); ax.legend(fontsize=8)
    ax.set_title('Rhythm space (Ramus et al. 1999 axes, proxy values)')
    fig.tight_layout(); fig.savefig(os.path.join(OUT, 'rhythm-space.png'), dpi=110)

    # LOT (Bob) vs THOUGHT (call): within-speaker distance as a cot-caught merger indicator
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    rows = []
    for g in groups:
        for c in by[g]:
            v = {x['word']: x for x in c['vowels']}
            if 'bob' in v and 'call' in v:
                d = float(np.hypot(v['bob']['f1'] - v['call']['f1'], v['bob']['f2'] - v['call']['f2']))
                rows.append((g, c['id'], d))
                axes[0].plot([v['bob']['f2'], v['call']['f2']], [v['bob']['f1'], v['call']['f1']], color=COL[g], alpha=0.7)
                axes[0].scatter([v['bob']['f2']], [v['bob']['f1']], color=COL[g], marker='o')
                axes[0].scatter([v['call']['f2']], [v['call']['f1']], color=COL[g], marker='s')
    axes[0].invert_xaxis(); axes[0].invert_yaxis()
    axes[0].set_xlabel('F2 (Hz)'); axes[0].set_ylabel('F1 (Hz)')
    axes[0].set_title('"Bob" (o, LOT) joined to "call" (square, THOUGHT)')
    for i, g in enumerate(groups):
        d = [r[2] for r in rows if r[0] == g]
        axes[1].scatter(np.full(len(d), i), d, color=COL[g])
        if d:
            axes[1].hlines(np.mean(d), i - 0.3, i + 0.3, color='black', lw=2)
    axes[1].set_xticks(range(len(groups)), [NAME[g].split(' (')[0] for g in groups], fontsize=8)
    axes[1].set_ylabel('LOT-THOUGHT distance (Hz)'); axes[1].set_title('Smaller = more merged (cot-caught)')
    fig.tight_layout(); fig.savefig(os.path.join(OUT, 'lot-thought.png'), dpi=110)

    # TRAP / DRESS / KIT means per group (Canadian Vowel Shift: TRAP retracted/lowered, DRESS lowered)
    fig, ax = plt.subplots(figsize=(7, 6))
    sets = ['KIT', 'DRESS', 'TRAP', 'TRAP-before-g', 'LOT', 'THOUGHT']
    mark = dict(zip(sets, 'v^osDP'))
    table = {}
    for g in groups:
        for s in sets:
            pts = [(x['f2'], x['f1']) for c in by[g] for x in c['vowels'] if x['set'] == s]
            if pts:
                m = np.mean(pts, axis=0)
                table[(g, s)] = (m, len(pts))
                ax.scatter(m[0], m[1], color=COL[g], marker=mark[s], s=70)
                ax.annotate(s, m, fontsize=7, xytext=(3, 3), textcoords='offset points')
    for g in groups:
        ax.scatter([], [], color=COL[g], label=NAME[g])
    ax.invert_xaxis(); ax.invert_yaxis(); ax.legend(fontsize=8)
    ax.set_xlabel('F2 (Hz)'); ax.set_ylabel('F1 (Hz)')
    ax.set_title('Group mean vowels (raw Hz, mixed sexes: compare shapes, not points)')
    fig.tight_layout(); fig.savefig(os.path.join(OUT, 'vowel-means.png'), dpi=110)

    lines = ['# Summary (generated by charts.py from measurements.json)', '',
             '| metric | ' + ' | '.join(NAME[g] for g in groups) + ' |', '|---|' + '---|' * len(groups)]
    for key, label in METRICS:
        cells = []
        for g in groups:
            v = [c[key] for c in by[g] if c.get(key) is not None]
            cells.append(f'{np.mean(v):.2f} (sd {np.std(v):.2f}, n={len(v)})' if v else 'n/a')
        lines.append(f'| {label} | ' + ' | '.join(cells) + ' |')
    d = {g: [r[2] for r in rows if r[0] == g] for g in groups}
    lines.append('| LOT-THOUGHT distance, Hz (Bob vs call) | ' + ' | '.join(
        f'{np.mean(d[g]):.0f} (n={len(d[g])})' if d[g] else 'n/a' for g in groups) + ' |')
    lines += ['', '## Vowel means (F1, F2 Hz; n tokens)', '', '| set | ' + ' | '.join(NAME[g] for g in groups) + ' |',
              '|---|' + '---|' * len(groups)]
    for s in sets:
        lines.append(f'| {s} | ' + ' | '.join(
            f'{table[(g, s)][0][1]:.0f}, {table[(g, s)][0][0]:.0f} ({table[(g, s)][1]})' if (g, s) in table else 'n/a'
            for g in groups) + ' |')
    open(os.path.join(HERE, 'summary.md'), 'w').write('\n'.join(lines) + '\n')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()
