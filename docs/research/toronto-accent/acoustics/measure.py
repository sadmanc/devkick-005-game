#!/usr/bin/env python3
"""Toronto accent acoustics: F0, phrase-final contours, speech rate, pauses, rhythm and key vowels.

  pip install praat-parselmouth numpy matplotlib faster-whisper
  python3 measure.py                      # every clip in clips.json -> measurements.json + charts/
  python3 measure.py --youtube URL 0:10-1:40 mte   # also measure a YouTube section under group "mte"

Audio is downloaded to a temp dir outside the repo and deleted at the end; only numbers are kept.
Rhythm metrics are a VOICING-BASED PROXY: voiced stretches stand in for vowels and voiceless ones for
consonants (no forced alignment), so %V/deltaC/nPVI compare groups with each other, not with
published values. Vowel formants: Whisper word timestamps, then a window inside the word's longest voiced stretch,
also an approximation; see README.md in this folder.
"""
import glob, json, os, shutil, subprocess, sys, tempfile, urllib.request
import numpy as np
import parselmouth
from parselmouth.praat import call

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '../../../..'))
SAA = 'https://accent.gmu.edu/audio/{}.mp3'
SAA_PAGE = 'https://accent.gmu.edu/samples/{}/'
UA = {'User-Agent': 'Mozilla/5.0 (research; Sound Local accent study)'}

# vowel windows: fraction of the longest voiced stretch inside each word of the passage
VOWELS = {
    'bob': ('LOT', 0.30, 0.70), 'call': ('THOUGHT', 0.15, 0.45), 'frog': ('LOT/THOUGHT', 0.30, 0.60),
    'ask': ('TRAP', 0.20, 0.70), 'snack': ('TRAP', 0.35, 0.75), 'slabs': ('TRAP', 0.40, 0.70),
    'plastic': ('TRAP', 0.45, 0.80), 'bags': ('TRAP-before-g', 0.30, 0.60),
    'stella': ('DRESS', 0.10, 0.35), 'fresh': ('DRESS', 0.35, 0.75), 'red': ('DRESS', 0.35, 0.70),
    'six': ('KIT', 0.20, 0.80), 'thick': ('KIT', 0.20, 0.80),
    'five': ('PRICE (voiced, unraised)', 0.20, 0.60),
}


def get(url, path):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r, open(path, 'wb') as f:
        f.write(r.read())


def speaker_meta(sid):
    req = urllib.request.Request(SAA_PAGE.format(sid), headers=UA)
    html = urllib.request.urlopen(req, timeout=60).read().decode('utf8', 'ignore')
    import re
    text = re.sub(r'<[^>]+>', '\n', html)
    rows = [t.strip() for t in text.split('\n') if t.strip()]
    meta = {}
    for key in ['birth place', 'native language', 'other language(s)', 'age, sex', 'english residence', 'length of english residence']:
        if key in rows:
            meta[key] = rows[rows.index(key) + 1]
    return meta


def to_wav(src, dst):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-ac', '1', '-ar', '16000', dst], check=True)


def st(f, ref=100.0):
    return 12 * np.log2(np.asarray(f) / ref)


def measure(wav, sex=None):
    snd = parselmouth.Sound(wav)
    floor, ceil = (100, 500) if sex == 'female' else (75, 300) if sex == 'male' else (75, 500)
    pitch = snd.to_pitch(time_step=0.01, pitch_floor=floor, pitch_ceiling=ceil)
    f0 = pitch.selected_array['frequency']
    times = pitch.xs()
    voiced = f0 > 0
    tg = call(snd, 'To TextGrid (silences)', 100, 0.0, -25.0, 0.15, 0.1, 'sil', 'speech')
    n = call(tg, 'Get number of intervals', 1)
    ivs = [(call(tg, 'Get start time of interval', 1, i), call(tg, 'Get end time of interval', 1, i),
            call(tg, 'Get label of interval', 1, i)) for i in range(1, n + 1)]
    speech = [(a, b) for a, b, l in ivs if l == 'speech']
    pauses = [b - a for i, (a, b, l) in enumerate(ivs) if l == 'sil' and 0 < i < len(ivs) - 1]
    talk = sum(b - a for a, b in speech)

    # syllable nuclei (after de Jong & Wempe 2009): intensity peaks, voiced, >= median, 2 dB dips between
    inten = snd.to_intensity(minimum_pitch=50, time_step=0.01)
    iv, it = inten.values[0], inten.xs()
    thr = np.median(iv)
    peaks = []
    for k in range(1, len(iv) - 1):
        if iv[k] >= iv[k - 1] and iv[k] > iv[k + 1] and iv[k] > thr:
            if pitch.get_value_at_time(it[k]) == pitch.get_value_at_time(it[k]):  # voiced (not NaN)
                if not peaks or (min(iv[peaks[-1]:k + 1]) < min(iv[peaks[-1]], iv[k]) - 2):
                    peaks.append(k)
                elif iv[k] > iv[peaks[-1]]:
                    peaks[-1] = k
    syl = len(peaks)

    # voicing-based rhythm proxy inside speech stretches
    v_iv, c_iv = [], []
    for a, b in speech:
        m = (times >= a) & (times <= b)
        seq = voiced[m]
        if not len(seq):
            continue
        run, cur = 1, seq[0]
        for x in seq[1:]:
            if x == cur:
                run += 1
            else:
                (v_iv if cur else c_iv).append(run * 0.01)
                run, cur = 1, x
        (v_iv if cur else c_iv).append(run * 0.01)
    v_iv = [d for d in v_iv if d >= 0.03]
    c_iv = [d for d in c_iv if d >= 0.02]
    npvi = 100 * np.mean([abs(a - b) / ((a + b) / 2) for a, b in zip(v_iv, v_iv[1:])]) if len(v_iv) > 2 else None

    # phrase-final contour of each inter-pause unit: last 200 ms of voicing vs the 400 ms before it
    finals = []
    for a, b in speech:
        m = (times >= a) & (times <= b) & voiced
        tv, fv = times[m], f0[m]
        if len(tv) < 30:
            continue
        end = tv[-1]
        last = fv[tv > end - 0.2]
        prev = fv[(tv <= end - 0.2) & (tv > end - 0.6)]
        if len(last) >= 5 and len(prev) >= 5:
            finals.append(float(np.median(st(last)) - np.median(st(prev))))
    fv = f0[voiced]
    return {
        'duration_s': round(snd.duration, 2),
        'f0_mean_hz': round(float(np.mean(fv)), 1),
        'f0_sd_st': round(float(np.std(st(fv))), 2),
        'f0_range_st_5_95': round(float(np.percentile(st(fv), 95) - np.percentile(st(fv), 5)), 2),
        'speech_rate_syl_s': round(syl / snd.duration, 2),
        'articulation_rate_syl_s': round(syl / talk, 2) if talk else None,
        'pause_count': len(pauses),
        'pause_mean_s': round(float(np.mean(pauses)), 3) if pauses else None,
        'pause_rate_per_min': round(len(pauses) / snd.duration * 60, 1),
        'pct_v_proxy': round(100 * sum(v_iv) / (sum(v_iv) + sum(c_iv)), 1) if v_iv and c_iv else None,
        'delta_c_proxy_ms': round(1000 * float(np.std(c_iv)), 1) if c_iv else None,
        'npvi_v_proxy': round(float(npvi), 1) if npvi is not None else None,
        'phrase_finals_st': [round(x, 2) for x in finals],
        'phrase_final_rise_pct': round(100 * np.mean([x > 1 for x in finals]), 1) if finals else None,
        'phrase_final_fall_pct': round(100 * np.mean([x < -1 for x in finals]), 1) if finals else None,
    }


def vowels(wav, model, sex=None):
    snd = parselmouth.Sound(wav)
    fmt = snd.to_formant_burg(time_step=0.005, max_number_of_formants=5,
                              maximum_formant=5500 if sex == 'female' else 5000)
    pitch = snd.to_pitch(time_step=0.005, pitch_floor=75, pitch_ceiling=500)
    segs, _ = model.transcribe(wav, language='en', word_timestamps=True, beam_size=1)
    out = []
    for s in segs:
        for w in s.words:
            word = ''.join(ch for ch in w.word.lower() if ch.isalpha())
            if word not in VOWELS:
                continue
            lex, lo, hi = VOWELS[word]
            ts = np.arange(w.start - 0.03, w.end + 0.03, 0.005)
            v = [pitch.get_value_at_time(t) == pitch.get_value_at_time(t) for t in ts]  # voiced = not NaN
            best, cur = (0, 0), None
            for k, x in enumerate(v + [False]):
                if x and cur is None:
                    cur = k
                elif not x and cur is not None:
                    best = max(best, (k - cur, cur))
                    cur = None
            n, at = best
            if n < 8:  # under 40 ms of voicing: skip the token
                continue
            win = ts[at + int(lo * n):at + max(int(hi * n), int(lo * n) + 1)]
            f1 = [x for x in (fmt.get_value_at_time(1, t) for t in win) if 200 <= x <= 1100]
            f2 = [x for x in (fmt.get_value_at_time(2, t) for t in win) if 600 <= x <= 3000]
            if len(f1) >= 3 and len(f2) >= 3:
                out.append({'word': word, 'set': lex, 't': round(w.start, 2),
                            'f1': round(float(np.median(f1))), 'f2': round(float(np.median(f2)))})
    return out


def sex_of(meta):
    s = meta.get('age, sex', '')
    return 'female' if 'female' in s else 'male' if 'male' in s else None


def main():
    clips = json.load(open(os.path.join(HERE, 'clips.json')))
    extra = []
    if '--youtube' in sys.argv:
        i = sys.argv.index('--youtube')
        extra.append(tuple(sys.argv[i + 1:i + 4]))
    from faster_whisper import WhisperModel
    model = WhisperModel('base.en', device='cpu', compute_type='int8')
    tmp = tempfile.mkdtemp(prefix='toronto-acoustics-')
    results = []
    try:
        for group, ids in clips['groups'].items():
            for sid in ids:
                mp3, wav = os.path.join(tmp, sid + '.mp3'), os.path.join(tmp, sid + '.wav')
                get(SAA.format(sid), mp3)
                to_wav(mp3, wav)
                meta = speaker_meta(sid)
                row = {'group': group, 'id': sid, 'source': SAA_PAGE.format(sid), 'speaker': meta,
                       **measure(wav, sex_of(meta)), 'vowels': vowels(wav, model, sex_of(meta))}
                results.append(row)
                print(group, sid, meta.get('birth place'), row['f0_range_st_5_95'], row['speech_rate_syl_s'], len(row['vowels']))
        otter = sorted(glob.glob(os.path.join(REPO, clips['otter'])))
        if otter:
            lst = os.path.join(tmp, 'otter.txt')
            open(lst, 'w').write(''.join(f"file '{p}'\n" for p in otter))
            wav = os.path.join(tmp, 'otter.wav')
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst,
                            '-ac', '1', '-ar', '16000', wav], check=True)
            results.append({'group': 'glasgow_otter', 'id': 'otter', 'source': clips['otter'],
                            'speaker': {'note': f'game ElevenLabs lines, {len(otter)} files concatenated'},
                            **measure(wav), 'vowels': []})
        for url, section, label in extra:
            out = os.path.join(tmp, label + '.%(ext)s')
            subprocess.run(['yt-dlp', '-q', '-f', 'bestaudio', '-x', '--audio-format', 'wav',
                            '--download-sections', f'*{section}', '-o', out, url], check=True)
            wav = os.path.join(tmp, label + '.wav')
            results.append({'group': label, 'id': url, 'source': f'{url} {section}', 'speaker': {},
                            **measure(wav), 'vowels': vowels(wav, model)})
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    json.dump({'about': clips['about'], 'clips': results}, open(os.path.join(HERE, 'measurements.json'), 'w'), indent=1)
    print('wrote measurements.json; temp audio deleted')


if __name__ == '__main__':
    main()
