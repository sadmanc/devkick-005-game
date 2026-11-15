"""Charts and classifiers from the VCTK subset (same 24 sentences, 5 accent groups, many speakers)."""
import json
import numpy as np
import pandas as pd
from matplotlib.patches import Ellipse
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import LeaveOneGroupOut, cross_val_predict
from sklearn.metrics import balanced_accuracy_score, confusion_matrix, roc_auc_score
from sklearn.manifold import TSNE
from scipy.spatial.distance import pdist, squareform
from style import plt, save, DATA, RESULTS, COLOR, LABEL, ACCENTS

SRC = 'Data: VCTK corpus (CSTR, University of Edinburgh, CC BY 4.0), mic1, same prompts for every speaker. Alignment: Montreal Forced Aligner.'
f = pd.read_csv(DATA / 'vctk_features.csv')
v = pd.read_csv(DATA / 'vctk_vowels.csv')
rh = pd.read_csv(DATA / 'vctk_rhotics.csv')
f = f[f.accent.isin(ACCENTS)].reset_index(drop=True)
spk = f.groupby('speaker').agg(accent=('accent', 'first'), sex=('sex', 'first'), n=('utterance', 'size'))
out = dict(speakers_per_accent={a: int((spk.accent == a).sum()) for a in ACCENTS},
           women_per_accent={a: int(((spk.accent == a) & (spk.sex == 'F')).sum()) for a in ACCENTS},
           utterances_per_accent=f.accent.value_counts().to_dict())
print(out)

# Speaker-normalised vowels (Lobanov) and lexical sets, incl. BATH words picked by spelling.
BATH = {'ask', 'after', 'path', 'last', 'fast', 'class', 'glass', 'grass', 'answer', 'can\'t', 'half', 'rather', 'pass', 'past', 'chance', 'plant', 'bath'}
v['lexical'] = np.where(v.word.isin(BATH) & (v.phone == 'ae'), 'BATH', v.lexical)
for col in ['f1', 'f2', 'f1_onset', 'f2_onset', 'f1_offset', 'f2_offset']:
    base = col[:2]
    g = v.groupby('speaker')[base]
    v[col + '_z'] = (v[col] - g.transform('mean')) / g.transform('std')
v = v[v.accent.isin(ACCENTS)]
LEX = ['FLEECE', 'KIT', 'DRESS', 'TRAP', 'BATH', 'LOT', 'THOUGHT', 'STRUT', 'FOOT', 'GOOSE', 'NURSE', 'FACE', 'GOAT', 'PRICE', 'MOUTH']
SM = v.groupby(['speaker', 'accent', 'lexical'])[['f1_z', 'f2_z']].mean().reset_index()


def ellipse(ax, x, y, color, ls='-', lw=1.3):
    if len(x) < 3:
        return
    vals, vecs = np.linalg.eigh(np.cov(x, y))
    angle = np.degrees(np.arctan2(*vecs[:, 1][::-1]))
    ax.add_patch(Ellipse((np.mean(x), np.mean(y)), 2 * np.sqrt(vals[1]), 2 * np.sqrt(vals[0]),
                         angle=angle, fill=False, color=color, ls=ls, lw=lw))


# 7. Vowel space by accent: accent means of speaker means + ellipses over speakers for 4 key vowels.
fig, axes = plt.subplots(1, 2, figsize=(14, 6))
ax = axes[0]
MONO = ['FLEECE', 'KIT', 'DRESS', 'TRAP', 'BATH', 'LOT', 'THOUGHT', 'STRUT', 'FOOT', 'GOOSE', 'NURSE']
am = SM.groupby(['accent', 'lexical'])[['f1_z', 'f2_z']].mean().reset_index()
for acc in ACCENTS:
    m = am[(am.accent == acc) & am.lexical.isin(MONO)]
    ax.scatter(m.f2_z, m.f1_z, color=COLOR[acc], s=28, label=f'{LABEL[acc]} ({out["speakers_per_accent"][acc]} speakers)')
    for _, r in m.iterrows():
        ax.annotate(r.lexical, (r.f2_z, r.f1_z), fontsize=6.5, color=COLOR[acc], xytext=(2, 2), textcoords='offset points')
ax.invert_xaxis(); ax.invert_yaxis()
ax.set(xlabel='F2 (Lobanov z)  <- front ... back ->', ylabel='F1 (Lobanov z)  <- close ... open ->', title='Vowel space: accent averages')
ax.legend(fontsize=7, loc='lower left')
ax = axes[1]
for lex, ls in [('GOOSE', '-'), ('FOOT', '--'), ('TRAP', '-'), ('BATH', ':'), ('LOT', '-.')]:
    for acc in ACCENTS:
        d = SM[(SM.accent == acc) & (SM.lexical == lex)]
        ellipse(ax, d.f2_z, d.f1_z, COLOR[acc], ls)
        if len(d):
            ax.annotate(lex, (d.f2_z.mean(), d.f1_z.mean()), fontsize=6.5, color=COLOR[acc], ha='center')
ax.set_xlim(2.2, -2.2); ax.set_ylim(2.4, -2.4)
ax.set(xlabel='F2 (Lobanov z)', ylabel='F1 (Lobanov z)', title='Spread across speakers (1-SD ellipses of speaker means)')
ax.legend(handles=[plt.Line2D([], [], color='k', ls=ls, label=l) for l, ls in [('GOOSE', '-'), ('FOOT', '--'), ('TRAP', '-'), ('BATH', ':'), ('LOT', '-.')]] +
          [plt.Line2D([], [], color=COLOR[a], label=LABEL[a]) for a in ACCENTS], fontsize=7, loc='lower left', ncol=2)
save(fig, '07-vowel-space-vctk.png', SRC)
piv = SM.pivot_table(index=['speaker', 'accent'], columns='lexical', values='f2_z').reset_index()
out['foot_goose_f2_gap_by_accent'] = piv.assign(gap=piv.GOOSE - piv.FOOT).groupby('accent').gap.agg(['mean', 'std', 'count']).round(2).to_dict('index')
pf = SM.pivot_table(index=['speaker', 'accent'], columns='lexical', values=['f1_z', 'f2_z']).reset_index()
if ('f2_z', 'BATH') in pf.columns:
    pf['bath_trap_f2'] = pf[('f2_z', 'BATH')] - pf[('f2_z', 'TRAP')]
    out['bath_minus_trap_f2_by_accent'] = pf.groupby('accent').bath_trap_f2.agg(['mean', 'std', 'count']).round(2).to_dict('index')
    out['bath_tokens'] = int((v.lexical == 'BATH').sum())

# 8. Rhythm: %V vs deltaC and nPVI-V vs rPVI-C, speaker means.
sm = f.groupby(['speaker', 'accent', 'sex'])[['percent_v', 'delta_c', 'npvi_v', 'rpvi_c', 'varco_v', 'rate', 'pitch_range', 'pitch_sd', 'f0_median']].mean().reset_index()
fig, axes = plt.subplots(1, 3, figsize=(16, 4.8))
for ax, (x, y, xl, yl) in zip(axes, [('percent_v', 'delta_c', '%V (share of time in vowels)', 'deltaC (ms, consonant variability)'),
                                     ('npvi_v', 'rpvi_c', 'nPVI-V (vowel length contrast)', 'rPVI-C (ms)'),
                                     ('rate', 'varco_v', 'speech rate (vowels per second)', 'VarcoV')]):
    for acc in ACCENTS:
        d = sm[sm.accent == acc]
        ax.scatter(d[x], d[y], color=COLOR[acc], label=LABEL[acc], s=30, alpha=.85, edgecolor='k', lw=.3)
        ax.scatter(d[x].mean(), d[y].mean(), color=COLOR[acc], s=160, marker='X', edgecolor='k')
    ax.set(xlabel=xl, ylabel=yl)
axes[0].legend(fontsize=7)
fig.suptitle('Rhythm metrics per speaker (dots) and accent average (X)', y=1.02)
save(fig, '08-rhythm-metrics.png', SRC)
out['rhythm_means_by_accent'] = sm.groupby('accent')[['percent_v', 'delta_c', 'npvi_v', 'rpvi_c', 'varco_v', 'rate']].mean().round(2).to_dict('index')

# 9. Pitch range per speaker and rhoticity by accent.
fig, axes = plt.subplots(1, 2, figsize=(13, 4.6))
ax = axes[0]
for i, acc in enumerate(ACCENTS):
    for j, sx in enumerate(['M', 'F']):
        d = sm[(sm.accent == acc) & (sm.sex == sx)].pitch_range
        ax.scatter(np.full(len(d), i + (j - .5) * .25), d, color=COLOR[acc], marker='o' if sx == 'F' else '^', s=30, edgecolor='k', lw=.3)
ax.set_xticks(range(len(ACCENTS)), [LABEL[a] for a in ACCENTS], fontsize=8)
ax.set(ylabel='pitch range, 5th-95th percentile (semitones)', title='Pitch range per speaker (circle = woman, triangle = man)')
ax = axes[1]
rh = rh[rh.accent.isin(ACCENTS)]
rs = rh.groupby(['speaker', 'accent', 'sex']).f3_min.median().reset_index()
for i, acc in enumerate(ACCENTS):
    for j, sx in enumerate(['M', 'F']):
        d = rs[(rs.accent == acc) & (rs.sex == sx)].f3_min
        ax.scatter(np.full(len(d), i + (j - .5) * .25), d, color=COLOR[acc], marker='o' if sx == 'F' else '^', s=30, edgecolor='k', lw=.3)
ax.set_xticks(range(len(ACCENTS)), [LABEL[a] for a in ACCENTS], fontsize=8)
ax.set(ylabel='median lowest F3 near post-vocalic r (Hz)', title='Rhoticity per speaker (lower = stronger R)')
save(fig, '09-pitch-range-and-rhoticity-vctk.png', SRC)
out['pitch_range_st_by_accent'] = sm.groupby('accent').pitch_range.agg(['mean', 'std']).round(2).to_dict('index')
out['rhotic_f3_by_accent_sex'] = rs.groupby(['accent', 'sex']).f3_min.mean().round(0).unstack().to_dict('index')

# Feature sets for classifiers (utterance level).
lex_vec = v[v.lexical.isin(LEX)].groupby(['utterance', 'lexical'])[['f1_z', 'f2_z']].mean().unstack()
lex_vec.columns = [f'{a}_{b}' for a, b in lex_vec.columns]
f = f.merge(lex_vec.reset_index(), on='utterance', how='left')
FORM = list(lex_vec.columns)
f[FORM] = f[FORM].fillna(0)
r_utt = rh.groupby('utterance').f3_min.median().rename('f3_r')
f = f.merge(r_utt.reset_index(), on='utterance', how='left')
f['f3_r'] = f.f3_r.fillna(f.groupby('speaker').f3_r.transform('mean')).fillna(f.f3_r.mean())
f['f3_r_z'] = f.groupby('sex').f3_r.transform(lambda x: (x - x.mean()) / x.std())
PITCH = ['pitch_range', 'pitch_sd']
RHY = ['percent_v', 'delta_c', 'npvi_v', 'rpvi_c', 'varco_v', 'rate']
MFCC = [f'mfcc_{i}' for i in range(13)]


def load_ssl(model, layer=None):
    arr = np.stack([np.load(DATA / 'ssl' / model / 'vctk' / f'{u}_mic1.npy' if (DATA / 'ssl' / model / 'vctk' / f'{u}_mic1.npy').exists()
                            else DATA / 'ssl' / model / 'vctk' / f'{u}.npy') for u in f.utterance])
    return arr if layer is None else arr[:, layer]


ssl_all = {m: load_ssl(m) for m in ['wavlm', 'wav2vec2'] if (DATA / 'ssl' / m / 'vctk').exists()}
y = f.accent.values
groups = f.speaker.values
logo = LeaveOneGroupOut()


def evaluate(X, C=1.0):
    clf = make_pipeline(StandardScaler(), LogisticRegression(C=C, max_iter=3000, class_weight='balanced'))
    pred = cross_val_predict(clf, X, y, groups=groups, cv=logo, n_jobs=6)
    return balanced_accuracy_score(y, pred), pred


sets = {'Sex only (confound check)': (f.sex == 'F').astype(float).values[:, None],
        'Pitch range/variability': f[PITCH].values,
        'Rhythm metrics': f[RHY].values,
        'Rhoticity (F3)': f[['f3_r_z']].values,
        'Vowel formants (Lobanov)': f[FORM].values,
        'Pitch + rhythm + vowels + R': f[PITCH + RHY + FORM + ['f3_r_z']].values,
        'MFCC means': f[MFCC].values}
layer_acc = {}
for m, arr in ssl_all.items():
    layer_acc[m] = [evaluate(arr[:, L], C=.1)[0] for L in range(arr.shape[1])]
    best = int(np.argmax(layer_acc[m]))
    sets[f'{m} layer {best} (self-supervised)'] = arr[:, best]
res, preds = {}, {}
for name, X in sets.items():
    res[name], preds[name] = evaluate(X, C=.1 if X.shape[1] > 50 else 1.0)
    print(name, round(res[name], 3))
out['balanced_accuracy_leave_one_speaker_out'] = {k: round(float(x), 3) for k, x in res.items()}
out['ssl_layer_accuracy'] = {m: [round(float(x), 3) for x in a] for m, a in layer_acc.items()}
# Speaker-level vote for the best set.
best_name = max((k for k in res if 'Sex' not in k), key=res.get)
vote = pd.DataFrame(dict(s=groups, p=preds[best_name], y=y)).groupby('s').agg(p=('p', lambda x: x.mode()[0]), y=('y', 'first'))
out['best_feature_set'] = best_name
out['best_speaker_level_vote_accuracy'] = round(float((vote.p == vote.y).mean()), 3)

# 10. Classifier accuracy chart + confusion matrix.
fig, axes = plt.subplots(1, 2, figsize=(15, 5), gridspec_kw=dict(width_ratios=[1.4, 1]))
ax = axes[0]
names = list(res)
ax.barh(names, [res[n] for n in names], color=['#bbb'] + ['#0072B2'] * (len(names) - 1))
for i, n in enumerate(names):
    ax.text(res[n] + .01, i, f'{res[n]:.0%}', va='center', fontsize=8)
ax.axvline(1 / len(ACCENTS), color='#D55E00', ls='--')
ax.text(1 / len(ACCENTS) + .01, len(names) - .5, 'chance (20%)', color='#D55E00', fontsize=8)
ax.invert_yaxis(); ax.set_xlim(0, 1)
ax.set(xlabel='balanced accuracy, 5 accents, tested on speakers never seen in training', title='Which features identify the accent? (one utterance at a time)')
ax = axes[1]
cm = confusion_matrix(y, preds[best_name], labels=ACCENTS, normalize='true')
ax.imshow(cm, cmap='Blues', vmin=0, vmax=1)
for i in range(len(ACCENTS)):
    for j in range(len(ACCENTS)):
        ax.text(j, i, f'{cm[i, j]:.0%}', ha='center', va='center', fontsize=8, color='w' if cm[i, j] > .5 else 'k')
ax.set_xticks(range(5), [LABEL[a] for a in ACCENTS], rotation=30, fontsize=7, ha='right')
ax.set_yticks(range(5), [LABEL[a] for a in ACCENTS], fontsize=7)
ax.set(xlabel='predicted', ylabel='true', title=f'Confusions: {best_name}')
save(fig, '10-accent-classifier-accuracy.png', SRC + ' Leave-one-speaker-out logistic regression.')
out['confusion_best'] = {a: dict(zip(ACCENTS, np.round(cm[i], 2).tolist())) for i, a in enumerate(ACCENTS)}

# 11. Layer-wise accuracy.
if layer_acc:
    fig, ax = plt.subplots(figsize=(8, 4))
    for m, a in layer_acc.items():
        ax.plot(range(len(a)), a, marker='o', label=m)
    ax.axhline(.2, color='#D55E00', ls='--', label='chance')
    ax.set(xlabel='layer (0 = CNN features, 12 = last transformer layer)', ylabel='balanced accuracy', ylim=(0, 1),
           title='Where in a self-supervised speech model the accent information lives')
    ax.legend()
    save(fig, '11-ssl-layer-accuracy.png', SRC)

# 12. Embedding map (t-SNE) for MFCC means vs best SSL layer.
fig, axes = plt.subplots(1, 2, figsize=(14, 6))
for ax, name in zip(axes, ['MFCC means', [k for k in sets if 'self-supervised' in k][0] if ssl_all else 'Pitch + rhythm + vowels + R']):
    X = StandardScaler().fit_transform(sets[name])
    emb = TSNE(n_components=2, perplexity=30, random_state=0, init='pca').fit_transform(X)
    for acc in ACCENTS:
        for sx, mk in [('F', 'o'), ('M', '^')]:
            sel = (y == acc) & (f.sex.values == sx)
            ax.scatter(emb[sel, 0], emb[sel, 1], color=COLOR[acc], marker=mk, s=12, alpha=.75,
                       label=LABEL[acc] if sx == 'F' else None)
    ax.set_title(f't-SNE map of {name}'); ax.set_xticks([]); ax.set_yticks([])
axes[0].legend(fontsize=7, markerscale=2)
save(fig, '12-embedding-map-tsne.png', SRC + ' One dot = one utterance; circle = woman, triangle = man.')

# 13. Within- vs between-accent distances between speakers, per feature set.
fig, ax = plt.subplots(figsize=(11, 4.8))
wb = {}
chosen = [n for n in sets if 'Sex' not in n]
for i, name in enumerate(chosen):
    X = StandardScaler().fit_transform(sets[name])
    S = pd.DataFrame(X).groupby(groups).mean()
    acc = spk.loc[S.index, 'accent'].values
    D = squareform(pdist(S.values))
    iu = np.triu_indices(len(S), 1)
    same = acc[iu[0]] == acc[iu[1]]
    d = D[iu] / np.median(D[iu])
    ax.boxplot([d[same], d[~same]], positions=[i * 3, i * 3 + 1], widths=.8, patch_artist=True, showfliers=False,
               boxprops=dict(facecolor='#56B4E9'), medianprops=dict(color='k'))
    wb[name] = dict(within=round(float(np.median(d[same])), 3), between=round(float(np.median(d[~same])), 3),
                    auc=round(float(roc_auc_score(~same, D[iu])), 3))
ax.set_xticks([i * 3 + .5 for i in range(len(chosen))], [f'{n}\nAUC {wb[n]["auc"]:.2f}' for n in chosen], fontsize=7)
ax.set(ylabel='distance between two speakers (relative)', title='Same-accent pairs (left box) vs different-accent pairs (right box). AUC 0.5 = no separation, 1 = perfect')
save(fig, '13-within-vs-between-accent.png', SRC + ' Speaker averages over 24 sentences.')
out['within_between_speaker_distance'] = wb
(RESULTS / 'vctk_results.json').write_text(json.dumps(out, indent=1, default=float))
f.to_csv(RESULTS / 'vctk_utterance_features.csv', index=False, float_format='%.4f',
         columns=['speaker', 'accent', 'sex', 'utterance'] + PITCH + RHY + ['f3_r'])
