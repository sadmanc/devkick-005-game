"""Range-download a declared VCTK subset from the official Edinburgh ZIP."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
from remotezip import RemoteZip

URL = 'https://datashare.ed.ac.uk/server/api/core/bitstreams/535f4286-e54c-4038-838c-a02285e32cb2/content'
# Southern English only; US regions remain heterogeneous, not a claim of General American.
SELECTED = ['p225', 'p226', 'p228', 'p232', 'p243', 'p254',
            'p234', 'p237', 'p241', 'p246', 'p249', 'p262',
            'p294', 'p297', 'p299', 'p300', 'p311', 'p334',
            'p302', 'p303', 'p307', 'p312', 'p316', 'p317',
            'p248', 'p251', 'p376']


def speaker(root, sid, n):
    output = root / 'vctk'
    with RemoteZip(URL) as z:
        names = set(z.namelist())
        manifest = []
        for i in range(1, n + 1):
            for name in [f'txt/{sid}/{sid}_{i:03d}.txt',
                         f'wav48_silence_trimmed/{sid}/{sid}_{i:03d}_mic1.flac']:
                if name not in names:
                    continue
                dest = output / name
                dest.parent.mkdir(parents=True, exist_ok=True)
                if not dest.exists():
                    dest.write_bytes(z.read(name))
                manifest.append(dict(path=name, sha256=hashlib.sha256(dest.read_bytes()).hexdigest()))
        print(sid, len(manifest), flush=True)
        return manifest


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--data', type=Path, default=Path('/home/ubuntu/accent-data'))
    p.add_argument('--sentences', type=int, default=12)
    args = p.parse_args()
    root = args.data / 'vctk'
    root.mkdir(parents=True, exist_ok=True)
    with RemoteZip(URL) as z:
        (root / 'speaker-info.txt').write_bytes(z.read('speaker-info.txt'))
    with ThreadPoolExecutor(4) as pool:
        rows = sum(pool.map(lambda s: speaker(args.data, s, args.sentences), SELECTED), [])
    (args.data / 'vctk-downloads.json').write_text(json.dumps(dict(url=URL, files=rows), indent=2))
