# Devin brief 4: the science of accent differences (what makes accents different, and what data can show)

Repo `sadmanc/devkick-005-game`. Start from branch `sadman/overnight-context`, push to
**`sadman/accent-science`**. PR title: **"Accent science: what makes accents different, measured"**.
Docs, scripts and charts only; don't change `src/`.

Read first: `docs/devin-briefs/overnight-2026-11-15/README.md` (shared rules), `docs/prd/PRD.md` sections
1, 3 and **16 (how the accent scoring works today)** and 18 (AI, data and quality strategy), then the scoring
code in `src/voice/` so you know exactly what the game measures now (pitch and rhythm against the otter's
clip).

## Sadman's question

"Accents have patterns in the frequencies, pitches and everything else. Gather as many studies as possible
on accent differences and the patterns that make accents different, and find out whether any of it is
graphable and easily distinguishable through just data."

The product reason: our accent score should measure what really makes an accent sound local, and show the
player a picture of it (like the melody lines we already draw), so they can see and fix the difference.

## Deliverable

`docs/research/accent-science/REPORT.md`, with a plain-English one-page summary on top ("these 5-8 things
make accents different; these are the ones you can see in a chart and score reliably from a phone mic"),
then the detail. Plus `sources.json` (every paper and dataset: title, authors, year, link, what it found)
and `charts/` with real charts you made.

## What it must cover

1. **The literature, broadly**: aim for **60+ studies** (phonetics, sociophonetics, dialectology, speech
   technology, L2 pronunciation research, accent identification in machine learning). Use Google Scholar,
   arXiv, ISCA/Interspeech archives, JASA, Journal of Phonetics, Language Variation and Change, Language
   Learning, open theses. For each: what it measured, on which accents, and what separated them.
2. **The features, one section each**: what it is, how it is measured, what it looks like on a chart, how
   strongly it separates accents, and whether a phone mic in a noisy room can measure it reliably:
   - vowel quality (F1/F2 formants, vowel space charts, normalisation methods like Lobanov),
     diphthongs and vowel shifts (Canadian raising, Northern Cities Shift, Scottish vowel length rule...)
   - pitch / intonation (F0 contours, ranges, uptalk, nuclear tones, ToBI/IViE descriptions)
   - rhythm and timing (nPVI, %V, deltaC/varcoV, syllable- vs stress-timing debates, speech rate, pauses)
   - consonants (rhoticity via F3, t-flapping/glottal stops, VOT, retroflexion, th-stopping, l-vocalisation)
   - voice quality (creak, breathiness, spectral tilt), nasality
   - stress placement and reduction (schwa, weak forms)
   - higher-level ML features: MFCCs, i-vectors/x-vectors, self-supervised embeddings (wav2vec 2.0,
     HuBERT, WavLM, Whisper encoder) for accent ID and accent distance; how accurate accent classifiers are
     on which datasets.
3. **Accent distance and scoring methods**: phonetic Levenshtein distance, DTW on pitch/MFCC, Goodness of
   Pronunciation (GOP), embedding distance, perceptual "accentedness" ratings and which acoustic measures
   predict them. Which methods could replace or improve our current pitch + rhythm score, ranked by
   effort and accuracy.
4. **Datasets we could use** (with licences): e.g. Speech Accent Archive, L2-ARCTIC, Common Voice accent
   labels, CORAAL, IViE, the Atlas of North American English data, VCTK, GLOBE, EdAcc (Edinburgh
   International Accents of English), Speechocean762: find the real current list and which allow
   commercial use.
5. **Show it with data (the key part)**: download 2-4 openly licensed datasets that cover several English
   accents (e.g. Scottish, Canadian, General American, Indian English, London/Southern British), run
   Python (Praat via `parselmouth`, `librosa`, a forced aligner like Montreal Forced Aligner or `whisperx`),
   and make the charts that best show accents apart: vowel space plots per accent, F0 contour overlays for
   the same sentence, rhythm-metric scatter plots (%V vs deltaC), embedding plots (t-SNE/UMAP of
   wav2vec/WavLM embeddings coloured by accent) and a simple classifier's accuracy per feature set. Say
   honestly which features separate accents clearly and which overlap. Commit scripts and charts, not the
   datasets (note how to re-download them).
6. **What this means for Sound Local**: which 3-5 measures to score, which charts to show players
   (feedback that's understandable in two seconds on a phone), what we can do on device vs on a server,
   how much data per accent we'd need to build a target profile, and the risks (gender/age pitch
   differences need normalising, noisy mics, speakers within an accent varying more than between accents).

## How to work

Use subagents in parallel (e.g. vowels, prosody/rhythm, consonants, ML accent ID, datasets and licences,
the hands-on chart pipeline), then synthesise with a strong model. Don't claim a study says something you
haven't read; link the paper. Big downloads go in a temp folder, never in the repo.

## Done when

The report, sources and at least six real charts made from real recordings are in the PR, and the PR
description lists the measures you recommend we score and why.
