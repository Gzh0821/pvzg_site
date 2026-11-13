"""Local-only fixtures; never contact GitHub or R2."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import struct
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('linux_release', Path(__file__).with_name('validate-linux-release.py'))
release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(release)
VERSION = '0.16.26'
BUILD = 'a' * 40


def deb_field(arguments, **_):
    return {'Package': 'pvzge-lite', 'Version': VERSION,
            'Architecture': 'arm64' if 'arm64.deb' in arguments[2] else 'amd64'}[arguments[-1]] + '\n'


class LinuxReleaseTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def fixture(self, arch='x64'):
        directory = self.root / f'linux-lite-{arch}-{VERSION}'
        directory.mkdir()
        deb_arch, app_arch, machine = ('amd64', 'amd64', 62) if arch == 'x64' else ('arm64', 'aarch64', 183)
        header = bytearray(20)
        header[:6] = b'\x7fELF\x02\x01'
        header[8:11] = b'AI\x02'
        struct.pack_into('<H', header, 18, machine)
        packages = [(f'pvzge-lite_{VERSION}_{deb_arch}.deb', b'debian-fixture'),
                    (f'pvzge-lite_{VERSION}_{app_arch}.AppImage', header)]
        manifest = dict(version=VERSION, variant='lite', arch=arch, buildCommit=BUILD, gameCommit='b' * 40, assets=[])
        for name, contents in packages:
            (directory / name).write_bytes(contents)
            manifest['assets'].append(dict(name=name, size=len(contents), sha256=hashlib.sha256(contents).hexdigest()))
        (directory / 'manifest.json').write_text(json.dumps(manifest))
        return directory, manifest


    def save(self, directory, manifest):
        (directory / 'manifest.json').write_text(json.dumps(manifest))

    @patch.object(release.subprocess, 'check_output', side_effect=deb_field)
    def test_both_native_architectures(self, _):
        for arch in ('x64', 'arm64'):
            directory, manifest = self.fixture(arch)
            self.assertEqual(release.validate_artifact(directory, VERSION, BUILD), manifest)

    def test_identity_and_filename_rejections(self):
        directory, manifest = self.fixture()
        for field, value in [('version', '0.16.24'), ('buildCommit', 'c' * 40), ('gameCommit', 'invalid'), ('arch', 'x86')]:
            wrong = copy.deepcopy(manifest)
            wrong[field] = value
            self.save(directory, wrong)
            with self.assertRaises(ValueError):
                release.validate_artifact(directory, VERSION, BUILD)
        manifest['assets'][0]['name'] = '../outside.deb'
        self.save(directory, manifest)
        with self.assertRaises(ValueError):
            release.validate_artifact(directory, VERSION, BUILD)

    def test_hash_mismatch_before_any_upload_files_are_copied(self):
        directory, manifest = self.fixture()
        (directory / manifest['assets'][0]['name']).write_bytes(b'corrupt-fixture')
        destination = self.root.parent / (self.root.name + '-out')
        destination.mkdir()
        self.addCleanup(destination.rmdir)
        with self.assertRaises(ValueError):
            release.collect_artifacts(self.root, VERSION, BUILD, destination, self.root / 'metadata')
        self.assertEqual(list(destination.iterdir()), [])

    @patch.object(release.subprocess, 'check_output', side_effect=deb_field)
    def test_wrong_elf_architecture_even_with_matching_hash(self, _):
        directory, manifest = self.fixture()
        asset = manifest['assets'][1]
        package = directory / asset['name']
        header = bytearray(package.read_bytes())
        struct.pack_into('<H', header, 18, 183)
        package.write_bytes(header)
        asset['sha256'] = hashlib.sha256(header).hexdigest()
        self.save(directory, manifest)
        with self.assertRaisesRegex(ValueError, 'AppImage'):
            release.validate_artifact(directory, VERSION, BUILD)

    @patch.object(release.subprocess, 'check_output', return_value='wrong-package\n')
    def test_debian_metadata_rejection(self, _):
        directory, _ = self.fixture()
        with self.assertRaisesRegex(ValueError, 'Debian Package'):
            release.validate_artifact(directory, VERSION, BUILD)

    def test_symlink_rejection(self):
        directory, manifest = self.fixture()
        package = directory / manifest['assets'][0]['name']
        package.unlink()
        package.symlink_to(directory / manifest['assets'][1]['name'])
        with self.assertRaisesRegex(ValueError, 'regular file'):
            release.validate_artifact(directory, VERSION, BUILD)

    @patch.object(release.subprocess, 'check_output', side_effect=deb_field)
    def test_collects_both_architectures_and_rejects_mixed_body_commits(self, _):
        self.fixture('x64')
        directory, manifest = self.fixture('arm64')
        with tempfile.TemporaryDirectory() as output:
            destination = Path(output)
            metadata = destination / 'metadata'
            manifest['gameCommit'] = 'c' * 40
            self.save(directory, manifest)
            with self.assertRaisesRegex(ValueError, 'share a variant and game commit'):
                release.collect_artifacts(self.root, VERSION, BUILD, destination, metadata)
            self.assertEqual(list(destination.iterdir()), [])
            manifest['gameCommit'] = 'b' * 40
            self.save(directory, manifest)
            release.collect_artifacts(self.root, VERSION, BUILD, destination, metadata)
            self.assertEqual(len(metadata.read_text().splitlines()), 4)
            self.assertEqual(len(list(destination.glob('*.deb'))), 2)
            self.assertEqual(len(list(destination.glob('*.AppImage'))), 2)


if __name__ == '__main__':
    unittest.main()
