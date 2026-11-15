"""Download original ARCTIC archives; retain data outside the git repository."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import tarfile
import requests

SPEAKERS = {
    'awb': ('Scottish', 'M'), 'jmk': ('Canadian', 'M'),
    'ksp': ('Indian', 'M'), 'bdl': ('American', 'M'),
    'rms': ('American', 'M'), 'slt': ('American', 'F'), 'clb': ('American', 'F'),
}


def download(root, speaker):
    name = f'cmu_us_{speaker}_arctic'
    url = f'http://festvox.org/cmu_arctic/cmu_arctic/packed/{name}-0.95-release.tar.bz2'
    archive = root / (name + '-0.95-release.tar.bz2')
    if not archive.exists():
        response = requests.get(url, stream=True, timeout=120)
        response.raise_for_status()
        partial = archive.with_suffix('.partial')
        with partial.open('wb') as out:
            for chunk in response.iter_content(1024 * 1024):
                out.write(chunk)
        partial.rename(archive)
    target = root / name
    marker = root / (name + '.complete')
    if not marker.exists():
        if target.exists():
            for path in target.rglob('*'):
                path.chmod(path.stat().st_mode | 0o200)
        with tarfile.open(archive) as tar:
            for member in tar.getmembers():
                path = (root / member.name).resolve()
                if not path.is_relative_to(root.resolve()) or member.issym() or member.islnk():
                    raise ValueError('Unsafe archive member')
            tar.extractall(root)
        marker.touch()
    print(speaker, archive.stat().st_size, flush=True)
    return dict(speaker=speaker, url=url,
                sha256=hashlib.sha256(archive.read_bytes()).hexdigest())


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=Path, default=Path('/home/ubuntu/accent-data'))
    args = parser.parse_args()
    args.data.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        manifest = list(pool.map(lambda s: download(args.data, s), SPEAKERS))
    (args.data / 'arctic-downloads.json').write_text(json.dumps(manifest, indent=2))
