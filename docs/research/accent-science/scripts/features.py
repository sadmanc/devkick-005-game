"""Praat acoustic measurements; original ARCTIC phone boundaries (no relabelling)."""
from pathlib import Path
import numpy as np
import librosa
import parselmouth
import soundfile as sf
from scipy.signal import resample_poly
from game_score import contour

VOWELS = set('aa ae ah ao aw ax axr ay eh er ey ih ix iy ow oy uh uw ux'.split())
SILENCE = {'pau', 'sil', 'h#', '#'}
LEXICAL = dict(iy='FLEECE', ih='KIT', eh='DRESS', ae='TRAP', aa='LOT',
               ao='THOUGHT', uh='FOOT', uw='GOOSE', ey='FACE', ow='GOAT',
               ay='PRICE', aw='MOUTH', er='NURSE', ah='STRUT')


def load(path):
    y, sr = sf.read(path)
    if y.ndim > 1:
        y = y.mean(axis=1)
    if sr != 16000:
        from math import gcd
        g = gcd(sr, 16000)
        y = resample_poly(y, 16000 // g, sr // g)
    return np.asarray(y, dtype=np.float64)


def labels(path):
    if not Path(path).exists():
        return []
    rows, start = [], 0.
    for line in Path(path).read_text().splitlines():
        fields = line.split()
        if len(fields) < 3:
            continue
        try:
            end = float(fields[0])
        except ValueError:
            continue
        phone = fields[2].lower().rstrip('012')
        rows.append((start, end, phone))
        start = end
    return rows


def rhythm(phones):
    intervals = []
    for start, end, phone in phones:
        if phone in SILENCE:
            intervals.append(('S', end - start))
            continue
        kind = 'V' if phone in VOWELS else 'C'
        if intervals and intervals[-1][0] == kind:
            intervals[-1] = (kind, intervals[-1][1] + end - start)
        else:
            intervals.append((kind, end - start))
    v = np.array([d for k, d in intervals if k == 'V']) * 1000
    c = np.array([d for k, d in intervals if k == 'C']) * 1000
    if min(len(v), len(c)) < 2:
        return {k: np.nan for k in ['percent_v', 'delta_c', 'npvi_v', 'rpvi_c', 'varco_v', 'rate']}
    duration = (v.sum() + c.sum()) / 1000
    return dict(percent_v=100 * v.sum() / (v.sum() + c.sum()), delta_c=c.std(ddof=1),
                npvi_v=100 * np.mean(abs(np.diff(v)) / ((v[1:] + v[:-1]) / 2)),
                rpvi_c=np.mean(abs(np.diff(c))), varco_v=100 * v.std(ddof=1) / v.mean(),
                rate=len(v) / duration)


def extract(y, phones=()):
    sound = parselmouth.Sound(y, 16000)
    pitch = sound.to_pitch_ac(time_step=.01, pitch_floor=70, pitch_ceiling=500)
    f0 = pitch.selected_array['frequency']
    voiced = f0[f0 > 0]
    st = 12 * np.log2(voiced / np.median(voiced)) if len(voiced) else np.array([np.nan])
    f = dict(f0_median=np.median(voiced) if len(voiced) else np.nan,
             pitch_range=np.nanpercentile(st, 95) - np.nanpercentile(st, 5),
             pitch_sd=np.nanstd(st), voiced_fraction=np.mean(f0 > 0))
    mfcc = librosa.feature.mfcc(y=y.astype(np.float32), sr=16000, n_mfcc=13,
                               n_fft=400, hop_length=160)
    f.update({f'mfcc_{i}': value for i, value in enumerate(mfcc.mean(axis=1))})
    f.update(rhythm(phones))
    formants = sound.to_formant_burg(time_step=.01, max_number_of_formants=5,
                                     maximum_formant=5500, window_length=.025)
    vowels, rhotics = [], []
    for i, (start, end, phone) in enumerate(phones):
        if phone in VOWELS and end - start >= .04:
            row = dict(phone=phone, lexical=LEXICAL.get(phone, phone), start=start,
                       duration=end-start, following=phones[i+1][2] if i+1 < len(phones) else '')
            for fraction, suffix in [(.2, '_onset'), (.5, ''), (.8, '_offset')]:
                time = start + fraction * (end - start)
                for k in [1, 2]:
                    row[f'f{k}{suffix}'] = formants.get_value_at_time(k, time)
            if 150 < row['f1'] < 1300 and 500 < row['f2'] < 3500:
                vowels.append(row)
        if phone == 'r' and i and phones[i-1][2] in VOWELS:
            # A pre-consonantal or phrase-final /r/, not an intervocalic onset.
            following = phones[i+1][2] if i+1 < len(phones) else 'pau'
            if following not in VOWELS:
                times = np.linspace(max(0, start - .03), end, 10)
                values = [formants.get_value_at_time(3, t) for t in times]
                valid = [v for v in values if 1300 < v < 4500]
                if valid:
                    rhotics.append(dict(start=start, f3_min=min(valid)))
    for k in [1, 2]:
        values = [row[f'f{k}'] for row in vowels]
        f[f'f{k}_mean'] = np.mean(values) if values else np.nan
        f[f'f{k}_sd'] = np.std(values) if values else np.nan
    return f, vowels, rhotics, f0
