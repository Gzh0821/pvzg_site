import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parseCatalog, rawLevelUrl, githubLevelLink, localizedText, levelReferences, verifyLevelBytes } from './catalog.mjs';

const entry = { path: '中文 #one/Level One.JSON', sha: 'a'.repeat(40), size: 20 };
test('catalog admits unique bounded level files and safely encodes game/download links', () => {
  assert.equal(parseCatalog({ version: 1, tree: 'b'.repeat(40), levels: [entry] }).length, 1);
  assert.equal(new URL(githubLevelLink(entry)).searchParams.get('path'), entry.path);
  assert.match(rawLevelUrl(entry.path), /%23one\/Level%20One.JSON$/);
  for (const path of ['../level.json', '/level.json', 'one\\level.json', 'one//level.json']) {
    assert.throws(() => parseCatalog({ version: 1, tree: 'b'.repeat(40), levels: [{ ...entry, path }] }));
  }
  assert.throws(() => parseCatalog({ version: 1, tree: 'b'.repeat(40), levels: [entry, entry] }));
  assert.equal(localizedText({ zh: '中文', default: 'Default' }, 'ru'), 'Default');
});
test('detail bytes must match the listed file, and references do not resolve arbitrary strings', async () => {
  const raw = { objects: [{ objclass: 'PlantType', aliases: ['custom'], objdata: { PlantBasedOn: 'RTID(sunflower@PlantTypes)' } }, { objclass: 'InitialPlantProperties', objdata: { Plants: [{ TypeName: 'torchwood' }] } }], seed: { PlantType: 'peashooter' }, text: ['RTID(conehead@ZombieTypes)', 'RTID(custom@CurrentLevel)', 'RTID(nope@CurrentLevel)', 'RTID(not-a-zombie@Objects)'] };
  const bytes = new TextEncoder().encode(JSON.stringify(raw));
  const sha = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  assert.deepEqual(await verifyLevelBytes(bytes, { size: bytes.length, sha }), raw);
  await assert.rejects(verifyLevelBytes(bytes, { size: bytes.length, sha: '0'.repeat(40) }), /changed/);
  assert.deepEqual(levelReferences(raw), { plants: ['custom', 'peashooter', 'sunflower', 'torchwood'], zombies: ['conehead'] });
});
