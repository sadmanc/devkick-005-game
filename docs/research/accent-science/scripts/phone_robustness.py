"""How much do the candidate accent features survive a phone-like channel?

Each VCTK studio recording is degraded in four ways that a phone in a real room produces:
narrowband telephone (300-3400 Hz, 8 kHz), Opus at 12 kbit/s (the WebRTC voice codec),
cafe-like babble noise at 10 dB SNR, and a small reverberant room. Features are re-measured
on the degraded audio with the SAME forced-alignment boundaries, and compared to the clean
values. Writes charts/15-phone-robustness.png and results/phone_robustness.json.
"""
import os
import json
import subprocess
import tempfile
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
import numpy as np
import pandas as pd
import soundfile as sf
import matplotlib.pyplot as plt
from scipy.signal import butter, sosfiltfilt, resample_poly, fftconvolve
from features import load, extract
from game_score import contour, compare
from extract_vctk import read_tiers
from style import save

DATA = Path(os.environ.get('DATA', '/home/ubuntu/accent-data'))
RESULTS = Path(__file__).resolve().parent.parent / 'results'
RNG = np.random.default_rng(0)
CONDITIONS = ['telephone 300-3400 Hz', 'Opus 12 kbit/s', 'babble noise 10 dB', 'room reverb']
SHORT = ['telephone\n300-3400 Hz', 'Opus\n12 kbit/s', 'babble\nnoise 10 dB', 'room\nreverb']


def telephone(y):
    sos = butter(6, [300, 3400], btype='band', fs=16000, output='sos')
    return resample_poly(resample_poly(sosfiltfilt(sos, y), 1, 2), 2, 1)


def opus(y):
    with tempfile.TemporaryDirectory() as d:
        src, enc, dst = (Path(d) / n for n in ['in.wav', 'x.ogg', 'out.wav'])
        sf.write(src, y, 16000)
        q = dict(stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        subprocess.run(['ffmpeg', '-y', '-i', src, '-c:a', 'libopus', '-b:a', '12k', '-application', 'voip', enc], **q)
        subprocess.run(['ffmpeg', '-y', '-i', enc, '-ar', '16000', '-ac', '1', dst], **q)
        out, _ = sf.read(dst)
    return np.pad(out, (0, max(0, len(y) - len(out))))[:len(y)]


def babble(y, others, snr=10):
    noise = np.zeros_like(y)
    for o in others:
        o = np.resize(o, len(y))
        noise += o / (np.std(o) + 1e-9)
    noise *= np.std(y) / (np.std(noise) + 1e-9) / 10 ** (snr / 20)
    return y + noise


def reverb(y, rt60=.5):
    t = np.arange(int(.4 * 16000)) / 16000
    rir = np.random.default_rng(1).standard_normal(len(t)) * np.exp(-6.9 * t / rt60)
    rir[0] = 1
    out = fftconvolve(y, rir)[:len(y)]
    return out * np.std(y) / np.std(out)


def summarise(f, vowels, rhotics):
    v = pd.DataFrame(vowels)
    return dict(pitch_range=f['pitch_range'], f0_median=f['f0_median'],
                **{f'mfcc_{i}': f[f'mfcc_{i}'] for i in range(13)},
                vowels=v[['start', 'f1', 'f2']].values.tolist() if len(v) else [],
                f3=[r['f3_min'] for r in rhotics], rhotic_starts=[r['start'] for r in rhotics])


def one(job):
    wav, grid, other_paths = job
    phones, _ = read_tiers(grid)
    y = load(wav)
    others = [load(p) for p in other_paths]
    versions = {'clean': y, 'telephone 300-3400 Hz': telephone(y), 'Opus 12 kbit/s': opus(y),
                'babble noise 10 dB': babble(y, others), 'room reverb': reverb(y)}
    out = {}
    clean_contour = contour(y.astype(np.float32))
    for name, audio in versions.items():
        f, vowels, rhotics, _ = extract(np.asarray(audio, dtype=np.float64), phones)
        out[name] = summarise(f, vowels, rhotics)
        score = compare(contour(np.asarray(audio, dtype=np.float32)), clean_contour)
        out[name]['self_score'] = score['score'] if score else np.nan
    return wav.stem, out


def paired(clean, noisy, key):
    a = {round(s, 3): (f1, f2) for s, f1, f2 in clean['vowels']}
    b = {round(s, 3): (f1, f2) for s, f1, f2 in noisy['vowels']}
    common = sorted(set(a) & set(b))
    idx = 0 if key == 'F1' else 1
    return [a[t][idx] for t in common], [b[t][idx] for t in common]


if __name__ == '__main__':
    wavs = sorted((DATA / 'vctk-align-input').glob('*/*_00[2-6].wav'))
    pool_paths = sorted((DATA / 'vctk-align-input').glob('*/*_01*.wav'))
    jobs = []
    for w in wavs:
        grid = DATA / 'vctk-aligned' / w.parent.name / (w.stem + '.TextGrid')
        if grid.exists():
            others = [p for p in RNG.choice(pool_paths, 8, replace=False) if p.parent != w.parent][:6]
            jobs.append((w, grid, others))
    with ProcessPoolExecutor(6) as ex:
        results = dict(ex.map(one, jobs))
    rows = {}
    for cond in CONDITIONS:
        r = {}
        for feat in ['F1', 'F2']:
            c, n = [], []
            for u in results.values():
                x, y = paired(u['clean'], u[cond], feat)
                c += x; n += y
            c, n = np.array(c), np.array(n)
            r[f'vowel {feat} (per token)'] = dict(r=float(np.corrcoef(c, n)[0, 1]),
                                                   median_abs_change_pct=float(np.median(abs(n - c) / c) * 100), n=len(c))
        c3 = [np.median(u['clean']['f3']) for u in results.values() if u['clean']['f3'] and u[cond]['f3']]
        n3 = [np.median(u[cond]['f3']) for u in results.values() if u['clean']['f3'] and u[cond]['f3']]
        r['rhoticity F3 (per utterance)'] = dict(r=float(np.corrcoef(c3, n3)[0, 1]),
                                                  median_abs_change_pct=float(np.median(abs(np.array(n3) - c3) / np.array(c3)) * 100), n=len(c3))
        for feat, label in [('f0_median', 'median pitch'), ('pitch_range', 'pitch range')]:
            c = np.array([u['clean'][feat] for u in results.values()])
            n = np.array([u[cond][feat] for u in results.values()])
            ok = np.isfinite(c) & np.isfinite(n)
            r[label] = dict(r=float(np.corrcoef(c[ok], n[ok])[0, 1]),
                            median_abs_change_pct=float(np.median(abs(n[ok] - c[ok]) / abs(c[ok])) * 100), n=int(ok.sum()))
        cm = np.array([[u['clean'][f'mfcc_{i}'] for i in range(1, 13)] for u in results.values()])
        nm = np.array([[u[cond][f'mfcc_{i}'] for i in range(1, 13)] for u in results.values()])
        r['MFCC means'] = dict(r=float(np.mean([np.corrcoef(cm[:, i], nm[:, i])[0, 1] for i in range(12)])),
                               median_abs_change_pct=float(np.median(abs(nm - cm) / (abs(cm) + 1e-9)) * 100), n=len(cm))
        s = np.array([u[cond]['self_score'] for u in results.values()])
        r['game melody+rhythm score vs own clean take'] = dict(mean_score=float(np.nanmean(s)), n=int(np.isfinite(s).sum()))
        rows[cond] = r
    feats = [k for k in rows[CONDITIONS[0]] if 'r' in rows[CONDITIONS[0]][k]]
    m = np.array([[rows[c][f]['r'] for c in CONDITIONS] for f in feats])
    fig, axes = plt.subplots(1, 2, figsize=(15, 5.6), gridspec_kw=dict(width_ratios=[1.3, 1], wspace=.55))
    axes[0].imshow(m, cmap='RdYlGn', vmin=0, vmax=1)
    for i in range(len(feats)):
        for j in range(len(CONDITIONS)):
            ch = rows[CONDITIONS[j]][feats[i]]['median_abs_change_pct']
            axes[0].text(j, i, f'r={m[i, j]:.2f}\n({ch:.0f}% shift)', ha='center', va='center', fontsize=8)
    axes[0].set_xticks(range(len(CONDITIONS)), SHORT, fontsize=8)
    axes[0].set_yticks(range(len(feats)), feats, fontsize=8)
    axes[0].set_title('Does the measurement survive the channel?\n(r = correlation with the studio value; % = median change)', fontsize=10)
    scores = [rows[c]['game melody+rhythm score vs own clean take']['mean_score'] for c in CONDITIONS]
    axes[1].barh(SHORT, scores, color='#0072B2')
    for i, s in enumerate(scores):
        axes[1].text(s + .01, i, f'{s:.2f}', va='center', fontsize=9)
    axes[1].set_xlim(0, 1.1); axes[1].invert_yaxis()
    axes[1].set_xlabel('score vs same clean take (1 = identical)')
    axes[1].set_title('Current Sound Local score:\nsame take, before vs after the channel', fontsize=10)
    save(fig, '15-phone-robustness.png',
         f'Data: VCTK (CC BY 4.0), {len(results)} recordings (sentences 2-6, all speakers). Simulated channels; same alignment for clean and degraded.')
    RESULTS.mkdir(exist_ok=True)
    (RESULTS / 'phone_robustness.json').write_text(json.dumps(dict(recordings=len(results), conditions=rows), indent=1))
    print(json.dumps(rows, indent=1))
