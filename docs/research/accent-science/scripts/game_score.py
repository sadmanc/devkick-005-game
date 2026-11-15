"""Numerical port of src/voice/pitch.js (not a general accent recognizer)."""
import numpy as np
from numba import njit


@njit(cache=True)
def detect_pitch(buf, sr):
    maximum = min(int(sr / 70), (len(buf) >> 1) - 1)
    minimum = max(2, int(sr / 500))
    n = len(buf) - maximum - 1
    d = np.zeros(maximum + 2)
    total = 0.0
    for lag in range(1, maximum + 2):
        value = 0.0
        for i in range(n):
            value += (buf[i] - buf[i + lag]) ** 2
        total += value
        d[lag] = value * lag / total if total else 1
    lag = minimum
    while lag <= maximum:
        if d[lag] < .15:
            while lag < maximum and d[lag + 1] < d[lag]:
                lag += 1
            a, b, c = d[lag - 1:lag + 2]
            den = a - 2 * b + c
            return sr / (lag + ((a - c) / (2 * den) if den else 0))
        lag += 1
    return 0.0


def contour(samples, sr=16000):
    hop = int(sr * .01 + .5)
    win = int(np.ceil(2 * sr / 70)) + 4
    frames = [samples[i:i + win] for i in range(0, len(samples) - win + 1, hop)]
    rms = np.array([np.sqrt(np.mean(f * f)) for f in frames])
    hz = np.array([detect_pitch(f, sr) for f in frames])
    if len(rms):
        hz[rms <= max(.002, .1 * rms.max())] = 0
    return hz, rms


def semitones(hz):
    v = np.asarray(hz)[np.asarray(hz) > 0]
    if not len(v):
        return v
    median = np.sort(v)[len(v) >> 1]
    s = 12 * np.log2(v / median)
    return np.clip(np.where(abs(s) > 9, s - 12 * np.sign(s), s), -12, 12)


def resample(a, n=60):
    a = np.asarray(a)
    return np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a) if len(a) else a


def dtw(you, ref):
    previous = None
    for r in ref:
        current = np.full(len(you), np.inf)
        for i, y in enumerate(you):
            best = (min(previous[max(0, i - 2):i + 1]) if previous is not None
                    else (0 if i == 0 else np.inf))
            current[i] = best + abs(y - r)
        previous = current
    return previous[-1] / len(ref)


def envelope(rms):
    if not len(rms):
        return rms
    peak = max(rms) or 1
    loud = np.flatnonzero(rms > .1 * peak)
    return resample(rms[loud[0]:loud[-1] + 1] / peak) if len(loud) else np.array([])


def compare(y, r):
    ys, rs = semitones(y[0]), semitones(r[0])
    if min(len(ys), len(rs)) < 10:
        return None
    yp, rp = resample(ys), resample(rs)
    distance = dtw(yp, rp) / max(1, np.mean(abs(rp)))
    melody = np.clip((1.1 - distance) / .6, 0, 1)
    rhythm_distance = np.mean(abs(envelope(y[1]) - envelope(r[1])))
    rhythm = np.clip((.45 - rhythm_distance) / .3, 0, 1)
    return dict(distance=float(distance), envelope_distance=float(rhythm_distance),
                score=float(.7 * melody + .3 * rhythm))
