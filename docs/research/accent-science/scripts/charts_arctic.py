"""Charts from CMU ARCTIC: 7 speakers reading the same sentences (US, Scottish, Canadian, Indian)."""
import json
import numpy as np
import pandas as pd
import parselmouth
from matplotlib.patches import Ellipse
from style import plt, save, DATA, RESULTS, COLOR, LABEL
from features import load
from download_arctic import SPEAKERS

SRC = 'Data: CMU ARCTIC (festvox.org/cmu_arctic), 1 speaker per accent except US (4). Phone boundaries: ARCTIC automatic labels.'
VOICELESS = set('p t k f th s sh ch hh'.split())
v = pd.read_csv(DATA / 'arctic_vowels.csv')
for col in ['f1', 'f2']:
    v[col + '_z'] = v.groupby('speaker')[col].transform(lambda x: (x - x.mean()) / x.std())
    for s in ['_onset', '_offset']:
        g = v.groupby('speaker')[col]
        v[col + s + '_z'] = (v[col + s] - g.transform('mean')) / g.transform('std')
out = {}


def ellipse(ax, x, y, color, ls='-'):
    if len(x) < 5:
        return
    cov = np.cov(x, y)
    vals, vecs = np.linalg.eigh(cov)
    angle = np.degrees(np.arctan2(*vecs[:, 1][::-1]))
    ax.add_patch(Ellipse((np.mean(x), np.mean(y)), 2 * np.sqrt(vals[1]), 2 * np.sqrt(vals[0]),
                         angle=angle, fill=False, color=color, ls=ls, lw=1.3))


# 1. Vowel space per accent (male speakers, Lobanov), monophthongs at midpoint.
MONO = ['FLEECE', 'KIT', 'DRESS', 'TRAP', 'LOT', 'THOUGHT', 'STRUT', 'FOOT', 'GOOSE', 'NURSE']
males = ['awb', 'jmk', 'ksp', 'bdl', 'rms']
fig, axes = plt.subplots(1, 2, figsize=(13, 5.6))
ax = axes[0]
means = v[v.lexical.isin(MONO)].groupby(['speaker', 'lexical'])[['f1_z', 'f2_z']].mean().reset_index()
for spk in males:
    acc = SPEAKERS[spk][0]
    m = means[means.speaker == spk].set_index('lexical').reindex(MONO)
    ax.scatter(m.f2_z, m.f1_z, color=COLOR[acc], s=25, label=f'{LABEL[acc]} ({spk})',
               marker='o' if spk != 'rms' else 's')
    for lex, r in m.iterrows():
        ax.annotate(lex, (r.f2_z, r.f1_z), fontsize=6.5, color=COLOR[acc], xytext=(2, 2), textcoords='offset points')
ax.invert_xaxis(); ax.invert_yaxis()
ax.set(xlabel='F2 (Lobanov z)  <- front ... back ->', ylabel='F1 (Lobanov z)  <- close ... open ->',
       title='Vowel space: mean of each vowel, per speaker')
ax.legend(fontsize=7, loc='lower left')
ax = axes[1]
for spk in males:
    acc = SPEAKERS[spk][0]
    for lex, ls in [('FOOT', '--'), ('GOOSE', '-')]:
        d = v[(v.speaker == spk) & (v.lexical == lex)]
        ellipse(ax, d.f2_z, d.f1_z, COLOR[acc], ls)
        ax.annotate(f'{lex}', (d.f2_z.mean(), d.f1_z.mean()), color=COLOR[acc], fontsize=7, ha='center')
ax.set_xlim(1.2, -2.0); ax.set_ylim(1.2, -2.2)
ax.set(xlabel='F2 (Lobanov z)', ylabel='F1 (Lobanov z)',
       title='FOOT (dashed) vs GOOSE (solid), 1-SD ellipses')
handles = [plt.Line2D([], [], color=COLOR[SPEAKERS[s][0]], label=f'{LABEL[SPEAKERS[s][0]]} ({s})') for s in males]
ax.legend(handles=handles, fontsize=7, loc='lower left')
save(fig, '01-vowel-space-arctic.png', SRC)
fg = v[v.lexical.isin(['FOOT', 'GOOSE'])].groupby(['speaker', 'lexical'])[['f1_z', 'f2_z']].mean().unstack()
out['foot_goose_f2_gap_z'] = {s: round(float(fg.loc[s, ('f2_z', 'GOOSE')] - fg.loc[s, ('f2_z', 'FOOT')]), 2) for s in fg.index}
out['vowel_tokens_per_speaker'] = v.groupby('speaker').size().to_dict()

# 2. Why normalise: US male (bdl) vs US female (slt), raw Hz vs Lobanov.
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
for ax, (fx, fy, unit) in zip(axes, [('f2', 'f1', 'Hz'), ('f2_z', 'f1_z', 'Lobanov z')]):
    for spk, c, lab in [('bdl', '#0072B2', 'US man (bdl)'), ('slt', '#D55E00', 'US woman (slt)')]:
        m = v[(v.speaker == spk) & v.lexical.isin(MONO)].groupby('lexical')[[fx, fy]].mean().reindex(MONO)
        ax.scatter(m[fx], m[fy], color=c, label=lab)
        for lex, r in m.iterrows():
            ax.annotate(lex, (r[fx], r[fy]), fontsize=6.5, color=c, xytext=(2, 2), textcoords='offset points')
    ax.invert_xaxis(); ax.invert_yaxis()
    ax.set(xlabel=f'F2 ({unit})', ylabel=f'F1 ({unit})')
    ax.legend(fontsize=8)
axes[0].set_title('Raw formants: same accent, voices look different')
axes[1].set_title('Lobanov-normalised: the two vowel systems line up')
save(fig, '02-normalisation-raw-vs-lobanov.png', SRC)

# 3. Diphthongs: onset -> offset arrows for FACE, GOAT, PRICE, MOUTH.
fig, axes = plt.subplots(1, 4, figsize=(16, 4.4), sharex=True, sharey=True)
diph = {}
for ax, lex in zip(axes, ['FACE', 'GOAT', 'PRICE', 'MOUTH']):
    for spk in males:
        acc = SPEAKERS[spk][0]
        d = v[(v.speaker == spk) & (v.lexical == lex)][['f1_onset_z', 'f2_onset_z', 'f1_offset_z', 'f2_offset_z']].mean()
        ls = ':' if spk == 'rms' else '-'
        ax.annotate('', xy=(d.f2_offset_z, d.f1_offset_z), xytext=(d.f2_onset_z, d.f1_onset_z),
                    arrowprops=dict(arrowstyle='->', color=COLOR[acc], lw=2, ls=ls))
        ax.plot([], [], color=COLOR[acc], ls=ls, label=f'{LABEL[acc]} ({spk})')
        diph.setdefault(lex, {})[spk] = round(float(np.hypot(d.f1_offset_z - d.f1_onset_z, d.f2_offset_z - d.f2_onset_z)), 2)
    ax.set_title(lex); ax.set_xlabel('F2 (z)')
axes[0].set_ylabel('F1 (z)'); axes[0].invert_xaxis(); axes[0].invert_yaxis()
axes[0].set_xlim(2, -1.6); axes[0].set_ylim(2.2, -1.6)
axes[-1].legend(fontsize=7)
fig.suptitle('Diphthongs: how far the vowel glides (arrow = 20% -> 80% of the vowel). Short arrow = monophthong.', y=1.02)
save(fig, '03-diphthong-glides.png', SRC)
out['diphthong_glide_length_z'] = diph

# 4. Canadian raising: PRICE / MOUTH onset F1 before voiceless vs voiced consonants.
cr = v[v.lexical.isin(['PRICE', 'MOUTH']) & ~v.following.isin(['pau', 'sil'])].copy()
cr['context'] = np.where(cr.following.isin(VOICELESS), 'before voiceless (e.g. "about", "right")', 'before voiced / vowel (e.g. "loud", "ride")')
fig, axes = plt.subplots(1, 2, figsize=(12, 4.6), sharey=True)
craise = {}
order = ['jmk', 'bdl', 'rms', 'awb', 'ksp']
for ax, lex in zip(axes, ['PRICE', 'MOUTH']):
    for j, ctx in enumerate(sorted(cr.context.unique())):
        vals = [cr[(cr.speaker == s) & (cr.lexical == lex) & (cr.context == ctx)].f1_onset_z for s in order]
        pos = np.arange(len(order)) + (j - .5) * .35
        bp = ax.boxplot(vals, positions=pos, widths=.3, patch_artist=True, showfliers=False)
        for b in bp['boxes']:
            b.set(facecolor='#999' if j else '#fff', alpha=.7)
        for s, vv in zip(order, vals):
            craise.setdefault(lex, {}).setdefault(s, {})['voiceless' if 'voiceless' in ctx else 'voiced'] = [round(float(vv.mean()), 2), int(len(vv))]
    ax.set_xticks(range(len(order)), [f'{LABEL[SPEAKERS[s][0]]}\n({s})' for s in order], fontsize=7)
    ax.set_title(f'{lex}: onset F1 (lower = raised)')
axes[0].set_ylabel('F1 at 20% of vowel (Lobanov z)')
axes[0].legend([plt.Rectangle((0, 0), 1, 1, fc='#fff', ec='k'), plt.Rectangle((0, 0), 1, 1, fc='#999', ec='k')],
               ['before voiced / vowel', 'before voiceless'], fontsize=7)
save(fig, '04-canadian-raising.png', SRC)
out['canadian_raising_onset_f1_z_mean_n'] = craise

# 5. Rhoticity: F3 minimum near post-vocalic /r/ ("car", "hard"); low F3 = strong r colouring.
r = pd.read_csv(DATA / 'arctic_rhotics.csv')
spk_order = ['bdl', 'rms', 'slt', 'clb', 'jmk', 'awb', 'ksp']
fig, ax = plt.subplots(figsize=(9, 4.4))
vals = [r[r.speaker == s].f3_min for s in spk_order]
bp = ax.boxplot(vals, patch_artist=True, showfliers=False)
for b, s in zip(bp['boxes'], spk_order):
    b.set(facecolor=COLOR[SPEAKERS[s][0]], alpha=.75)
ax.set_xticks(range(1, len(spk_order) + 1), [f'{LABEL[SPEAKERS[s][0]]}\n{s} ({SPEAKERS[s][1]})' for s in spk_order], fontsize=7)
ax.set(ylabel='Lowest F3 in the /r/ region (Hz)', title='Rhoticity: how strongly the R after a vowel colours the sound (lower F3 = stronger R)')
save(fig, '05-rhoticity-f3.png', SRC + ' Women have higher formants overall; compare like with like.')
out['rhotic_f3_min_median_hz'] = {s: [int(r[r.speaker == s].f3_min.median()), int((r.speaker == s).sum())] for s in spk_order}

# 6. F0 contours of the same sentences, semitones re each speaker's median, time-aligned phone by phone
# to the US speaker bdl using the ARCTIC labels (so the same word sits at the same x position).
from scipy.signal import medfilt
from features import labels
texts = {}
for line in (DATA / 'cmu_us_bdl_arctic/etc/txt.done.data').read_text().splitlines():
    parts = line.strip('() ').split(' ', 1)
    texts[parts[0]] = parts[1].strip().strip('"')


def boundaries(spk, uid):
    ph = [p for p in labels(DATA / f'cmu_us_{spk}_arctic/lab/{uid}.lab') if p[2] not in ('pau', 'sil')]
    return ph


def st_contour(spk, uid):
    y = load(DATA / f'cmu_us_{spk}_arctic/wav/{uid}.wav')
    floor, ceil = (60, 300) if SPEAKERS[spk][1] == 'M' else (100, 450)
    p = parselmouth.Sound(y, 16000).to_pitch_ac(time_step=.01, pitch_floor=floor, pitch_ceiling=ceil)
    f0 = p.selected_array['frequency']
    t = p.xs()
    st = np.full(len(f0), np.nan)
    ok = f0 > 0
    st[ok] = 12 * np.log2(f0[ok] / np.median(f0[ok]))
    st[ok] = medfilt(st[ok], 5)
    st[np.abs(st) > 9] = np.nan
    return t, st


fig, axes = plt.subplots(3, 1, figsize=(11, 9))
for ax, uid in zip(axes, ['arctic_a0005', 'arctic_a0012', 'arctic_a0024']):
    ref = boundaries('bdl', uid)
    for spk in ['awb', 'jmk', 'ksp', 'bdl', 'slt']:
        acc = SPEAKERS[spk][0]
        t, st = st_contour(spk, uid)
        ph = boundaries(spk, uid)
        if len(ph) == len(ref):
            src = np.ravel([[a, b] for a, b, _ in ph]); dst = np.ravel([[a, b] for a, b, _ in ref])
            x = np.interp(t, src, dst, left=np.nan, right=np.nan)
        else:
            x = (t - ph[0][0]) / (ph[-1][1] - ph[0][0]) * (ref[-1][1] - ref[0][0]) + ref[0][0]
        ax.plot(x, st, color=COLOR[acc], lw=1.8, ls=':' if spk == 'slt' else '-',
                label=f'{LABEL[acc]} ({spk}, {SPEAKERS[spk][1]})')
    ax.axhline(0, color='#bbb', lw=.6)
    ax.set_xlim(ref[0][0], ref[-1][1]); ax.set_ylim(-9, 9)
    ax.set_ylabel('semitones vs\nspeaker median')
    ax.set_title(f'"{texts[uid]}"', fontsize=9, fontweight='normal')
axes[0].legend(fontsize=7, ncol=3)
axes[-1].set_xlabel("time, warped phone-by-phone onto the US speaker bdl's timing (s)")
fig.suptitle('Melody of the same sentence across accents (pitch in semitones, so men and women are comparable)', y=1.0)
fig.tight_layout()
save(fig, '06-f0-contours-arctic.png', SRC)

(RESULTS / 'arctic_results.json').write_text(json.dumps(out, indent=1))
