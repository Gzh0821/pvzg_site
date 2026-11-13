"""Execute publisher shell blocks with an isolated fake gh; no network or publication."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

WORKFLOW = Path(__file__).resolve().parents[1] / '.github/workflows/publish-release-from-r2.yml'


def shell_block(name):
    lines = WORKFLOW.read_text().splitlines()
    start = lines.index('      - name: ' + name)
    while lines[start] != '        run: |':
        start += 1
    result = []
    for line in lines[start + 1:]:
        if line and not line.startswith('          '):
            break
        result.append(line[10:] if line else '')
    return '\n'.join(result)


FAKE_GH = r'''#!/usr/bin/env python3
import hashlib, json, os, pathlib, re, sys
args = sys.argv[1:]
root = pathlib.Path(os.environ['MOCK_ROOT'])
with (root / 'calls.jsonl').open('a') as log:
    log.write(json.dumps(args) + '\n')
state_file = root / 'state.json'
state = json.loads(state_file.read_text())
if args[:2] == ['release', 'view']:
    print(22)
elif args[:2] == ['release', 'upload']:
    package = pathlib.Path(args[3])
    digest = 'sha256:' + hashlib.sha256(package.read_bytes()).hexdigest()
    if os.environ.get('BAD_UPLOAD') and package.name.endswith('.AppImage'):
        digest = 'sha256:' + '0' * 64
    state['assets'].append(dict(id=max([a['id'] for a in state['assets']] + [0]) + 1,
        name=package.name, size=package.stat().st_size, digest=digest))
elif args[:2] == ['release', 'edit']:
    state['notes'] = pathlib.Path(args[args.index('--notes-file') + 1]).read_text()
elif args[0] == 'api':
    endpoint = next(a for a in args if a.startswith('repos/'))
    query = args[args.index('--jq') + 1] if '--jq' in args else ''
    method = args[args.index('--method') + 1] if '--method' in args else 'GET'
    if method in ('DELETE', 'PATCH'):
        identity = int(endpoint.rsplit('/', 1)[1])
        if method == 'DELETE':
            state['assets'] = [asset for asset in state['assets'] if asset['id'] != identity]
        else:
            next(a for a in state['assets'] if a['id'] == identity)['name'] = args[args.index('-f') + 1].split('=', 1)[1]
    elif '/releases?' in endpoint:
        if os.environ.get('MOCK_EXISTING'):
            print(json.dumps(dict(tag_name='0.16.26', name='0.16.26', draft=False)))
    elif endpoint.endswith('/assets?per_page=100'):
        name = re.search(r'select\(\.name == "(.*?)"\)', query).group(1)
        for asset in state['assets']:
            if asset['name'] == name:
                print(asset['id'])
    elif '/releases/assets/' in endpoint:
        asset = next(a for a in state['assets'] if a['id'] == int(endpoint.rsplit('/', 1)[1]))
        print(asset[query[1:]])
    elif endpoint.endswith('/releases/22'):
        print('0.16.26')
    else:
        raise SystemExit('Unexpected API endpoint: ' + endpoint)
else:
    raise SystemExit('Unexpected gh command')
state_file.write_text(json.dumps(state))
'''


class PublisherShellTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'gh').write_text(FAKE_GH)
        (self.root / 'gh').chmod(0o700)
        (self.root / 'state.json').write_text(json.dumps({'assets': []}))
        self.env = dict(os.environ, PATH=str(self.root) + os.pathsep + os.environ['PATH'],
                        MOCK_ROOT=str(self.root), VERSION='0.16.26', LINUX_RUN_ID='', RELEASE_NOTES_INPUT='',
                        RELEASE_REPOSITORY='test/fixture', RUNNER_TEMP=str(self.root),
                        GITHUB_ENV=str(self.root / 'github-env'), GITHUB_RUN_ID='123', GITHUB_RUN_ATTEMPT='1')

    def run_block(self, name, **extra):
        return subprocess.run(['/bin/bash', '-e', '-c', shell_block(name)], cwd=self.root,
                              env=dict(self.env, **extra), text=True, capture_output=True)

    def test_default_notes_for_new_and_existing_releases(self):
        for existing in ('', 'yes'):
            result = self.run_block('Validate version and Release identity', MOCK_EXISTING=existing)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual((self.root / 'release-notes.md').read_text(),
                             '- Bug fixes.\n---\nMore info see [here](https://pvzge.com/en/download/)\n')

    def test_feature_notes_preserve_literal_shell_characters(self):
        notes = 'Feature release\n`literal code` and $(touch SHOULD_NOT_EXIST)\n'
        result = self.run_block('Validate version and Release identity', RELEASE_NOTES_INPUT=notes)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual((self.root / 'release-notes.md').read_text(), notes + '\n')
        self.assertFalse((self.root / 'SHOULD_NOT_EXIST').exists())

    def test_invalid_identity_is_rejected_before_github(self):
        result = self.run_block('Validate version and Release identity', VERSION='../wrong')
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((self.root / 'calls.jsonl').exists())

    def replace(self, bad=False):
        names = ['pvzge-lite_0.16.26_amd64.deb', 'pvzge-lite_0.16.26_amd64.AppImage']
        manifest = []
        for name in names:
            data = ('fixture ' + name).encode()
            (self.root / name).write_bytes(data)
            manifest.append(f'{name}|{len(data)}|{hashlib.sha256(data).hexdigest()}\n')
        (self.root / 'metadata').write_text(''.join(manifest))
        (self.root / 'notes').write_text('- Bug fixes.\n')
        (self.root / 'state.json').write_text(json.dumps({'assets': [
            dict(id=i + 1, name=name, size=1, digest='old') for i, name in enumerate(names)]}))
        result = self.run_block('Safely replace all Release assets', ASSET_METADATA=str(self.root / 'metadata'),
                                RELEASE_NOTES_FILE=str(self.root / 'notes'), RELEASE_WAS_DRAFT='false',
                                BAD_UPLOAD='yes' if bad else '')
        return result, json.loads((self.root / 'state.json').read_text()), names

    def test_replacement_handles_deb_and_appimage_names_and_notes(self):
        result, state, names = self.replace()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual({a['name'] for a in state['assets']}, set(names))
        self.assertTrue(all(a['digest'] != 'old' for a in state['assets']))
        self.assertEqual(state['notes'], '- Bug fixes.\n')

    def test_digest_failure_keeps_all_formal_assets_and_removes_own_temporary_assets(self):
        result, state, names = self.replace(bad=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual({a['name'] for a in state['assets']}, set(names))
        self.assertTrue(all(a['digest'] == 'old' for a in state['assets']))
        self.assertNotIn('notes', state)


if __name__ == '__main__':
    unittest.main()
