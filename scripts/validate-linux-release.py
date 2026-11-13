"""Validate trusted Linux build artifacts before adding them to a public Release."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import struct
import subprocess


def validate_artifact(directory, version, build_commit):
    manifest = json.loads((directory / 'manifest.json').read_text())
    arch, variant = manifest.get('arch'), manifest.get('variant')
    if arch not in ('x64', 'arm64') or variant not in ('standard', 'lite'):
        raise ValueError('Invalid Linux architecture or variant')
    if manifest.get('version') != version or manifest.get('buildCommit') != build_commit:
        raise ValueError('Artifact version or source commit mismatch')
    if not re.fullmatch(r'[0-9a-f]{40}', manifest.get('gameCommit', '')):
        raise ValueError('Missing game body commit')
    if directory.name != f'linux-{variant}-{arch}-{version}':
        raise ValueError('Artifact name does not match its manifest')
    stem = 'pvzge-lite' if variant == 'lite' else 'pvzge'
    deb_arch = 'amd64' if arch == 'x64' else 'arm64'
    app_arch = 'amd64' if arch == 'x64' else 'aarch64'
    expected = {f'{stem}_{version}_{deb_arch}.deb', f'{stem}_{version}_{app_arch}.AppImage'}
    assets = manifest.get('assets', [])
    if len(assets) != 2 or {asset.get('name') for asset in assets} != expected:
        raise ValueError('Expected exactly the Debian and AppImage packages')
    if {entry.name for entry in directory.iterdir()} != expected | {'manifest.json'}:
        raise ValueError('Unexpected artifact files')
    for asset in assets:
        package = directory / asset['name']
        if package.is_symlink() or not package.is_file():
            raise ValueError('Package must be a regular file')
        size = package.stat().st_size
        if not 0 < size < 2**31 or size != asset.get('size'):
            raise ValueError('Package size mismatch')
        with package.open('rb') as source:
            digest = hashlib.sha256()
            for chunk in iter(lambda: source.read(1024 * 1024), b''):
                digest.update(chunk)
        if digest.hexdigest() != asset.get('sha256'):
            raise ValueError('Package SHA-256 mismatch')
        if package.suffix == '.deb':
            for field, expected_value in [('Package', stem), ('Version', version), ('Architecture', deb_arch)]:
                actual = subprocess.check_output(['dpkg-deb', '-f', str(package), field], text=True).strip()
                if actual != expected_value:
                    raise ValueError(f'Debian {field} mismatch')
        else:
            with package.open('rb') as source:
                header = source.read(20)
            if (len(header) < 20 or header[:6] != b'\x7fELF\x02\x01' or header[8:11] != b'AI\x02'
                    or struct.unpack_from('<H', header, 18)[0] != (62 if arch == 'x64' else 183)):
                raise ValueError('AppImage type or architecture mismatch')
    return manifest


def collect_artifacts(root, version, build_commit, destination, metadata):
    directories = list(root.iterdir())
    if not 1 <= len(directories) <= 2:
        raise ValueError('Expected one or two Linux architecture artifacts')
    manifests = [(directory, validate_artifact(directory, version, build_commit)) for directory in directories]
    if len({manifest['arch'] for _, manifest in manifests}) != len(manifests):
        raise ValueError('Duplicate architecture')
    if len({(manifest['variant'], manifest['gameCommit']) for _, manifest in manifests}) != 1:
        raise ValueError('Linux artifacts must share a variant and game commit')
    # Check every artifact before copying any package into the upload directory.
    with metadata.open('a') as output:
        for directory, manifest in manifests:
            for asset in manifest['assets']:
                target = destination / asset['name']
                if target.exists():
                    raise ValueError('Duplicate release asset')
                shutil.copyfile(directory / asset['name'], target)
                output.write(f"{asset['name']}|{asset['size']}|{asset['sha256']}\n")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    for name in ('root', 'version', 'build-commit', 'metadata'):
        parser.add_argument(f'--{name}', required=True)
    args = parser.parse_args()
    collect_artifacts(Path(args.root), args.version, args.build_commit, Path.cwd(), Path(args.metadata))
