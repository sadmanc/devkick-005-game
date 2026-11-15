"""Prepare 16 kHz VCTK WAV/TXT pairs for MFA (external working directory)."""
import argparse
from pathlib import Path
import shutil
import soundfile as sf
from features import load

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--data', type=Path, default=Path('/home/ubuntu/accent-data'))
    a = p.parse_args()
    for txt in sorted((a.data / 'vctk/txt').glob('*/*.txt')):
        sid, uid = txt.parent.name, txt.stem
        audio = a.data / 'vctk/wav48_silence_trimmed' / sid / (uid + '_mic1.flac')
        if not audio.exists():
            continue
        out = a.data / 'vctk-align-input' / sid
        out.mkdir(parents=True, exist_ok=True)
        sf.write(out / (uid + '.wav'), load(audio), 16000, subtype='PCM_16')
        shutil.copyfile(txt, out / txt.name)
    print('Prepared', len(list((a.data / 'vctk-align-input').glob('*/*.wav'))), 'WAV/TXT pairs')
