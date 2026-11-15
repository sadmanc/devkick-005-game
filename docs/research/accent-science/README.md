# Accent science: how to reproduce the charts

The findings are in [REPORT.md](REPORT.md). This page explains how to rebuild every number and chart
from the original recordings. No audio is stored in this repo: the scripts download it to a working
folder outside git (default `/home/ubuntu/accent-data`; change with `--data` or `DATA=`).

## What is here

| Path | What it is |
|---|---|
| `REPORT.md` | The report (plain-English summary first, then detail). |
| `sources.json` | Every study and dataset cited, with link, access date and what it measured. |
| `charts/` | PNG charts made from real recordings by the scripts below. |
| `results/` | JSON/CSV numbers behind the charts (small, text). |
| `scripts/` | The pipeline. |
| `requirements.txt` | Python package versions used. |

## Data (re-download, never commit)

| Corpus | Licence | Used for | Script |
|---|---|---|---|
| CMU ARCTIC 0.95 (speakers awb, jmk, ksp, bdl, rms, slt, clb) | CMU permissive licence (see `COPYING` in each archive): free use incl. commercial, keep the copyright notice | Same 200 sentences from Scottish, Canadian, Indian and US speakers, with phone labels | `download_arctic.py` |
| VCTK 0.92 (subset: 49 speakers in 5 accent groups, first 12-24 prompts each) | CC BY 4.0 (Edinburgh DataShare) | More speakers per accent, same prompts | `download_vctk.py` (range-reads only the needed files from the official 11 GB ZIP) |

## Steps

```bash
python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt
cd scripts
python download_arctic.py            # ~1.2 GB
python download_vctk.py              # ~200 MB, partial ZIP reads
python extract_arctic.py             # Praat pitch/formants on ARCTIC phone labels
python charts_arctic.py              # charts 01-06
python prepare_alignment.py          # 16 kHz WAV + transcripts for the aligner
bash align_vctk.sh                   # Montreal Forced Aligner 3.4.3, english_us_arpa models
python extract_vctk.py
python embeddings.py --corpus vctk --model wavlm
python embeddings.py --corpus vctk --model wav2vec2
python analyze_vctk.py               # charts 07-13
python parity_check.py               # Python port of src/voice/pitch.js == the JS (needs node)
python game_score_compare.py         # chart 14
python phone_robustness.py           # chart 15 (needs ffmpeg with libopus)
```

MFA needs its own conda/mamba environment (`montreal-forced-aligner` from conda-forge). If the model
download hits GitHub's anonymous rate limit, pass `--github_token`.

## Honesty notes

- Speaker counts are small (VCTK has only 3 Indian and 8 Canadian speakers in total). Results show
  what is measurable, not population averages.
- The two corpora differ in microphone and room; never compare a raw number across corpora.
- `game_score.py` is a line-by-line port of the live game's scorer; `parity_check.py` shows it gives
  the same numbers as `src/voice/pitch.js` on real recordings.
