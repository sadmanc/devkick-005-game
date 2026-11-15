"""Check game_score.py against the real src/voice/pitch.js on real clips (needs node)."""
import json
import subprocess
from pathlib import Path
import numpy as np
from features import load
from game_score import contour, compare, semitones, resample

DATA = Path('/home/ubuntu/accent-data')
REPO = Path(__file__).resolve().parents[4]
pairs = [('awb', 'bdl', 'arctic_a0005'), ('ksp', 'jmk', 'arctic_a0012'), ('slt', 'rms', 'arctic_a0024')]
for a, b, uid in pairs:
    ya = load(DATA / f'cmu_us_{a}_arctic/wav/{uid}.wav').astype(np.float32)
    yb = load(DATA / f'cmu_us_{b}_arctic/wav/{uid}.wav').astype(np.float32)
    ya.tofile('/tmp/a.f32'); yb.tofile('/tmp/b.f32')
    js = f"""import fs from 'fs'; import {{ accent }} from '{REPO}/src/voice/pitch.js';
const r = (p) => new Float32Array(fs.readFileSync(p).buffer.slice(0));
const o = accent(r('/tmp/a.f32'), r('/tmp/b.f32'), 16000); console.log(JSON.stringify(o.accentScore));"""
    jsscore = float(subprocess.run(['node', '--input-type=module', '-e', js], capture_output=True, text=True, check=True).stdout)
    py = compare(contour(ya.astype(np.float64)), contour(yb.astype(np.float64)))['score']
    print(f'{a} vs {b} {uid}: JS {jsscore:.4f}  Python {py:.4f}  diff {abs(jsscore - py):.2e}')
