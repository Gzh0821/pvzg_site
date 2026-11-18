import assert from 'node:assert/strict';
import test from 'node:test';
import { getSpawnEditedImportedLevel, preserveWaveReferences } from './imported-wave-edits.mjs';

test('editing an imported group changes just the referenced native spawn list', () => {
  const aliases = ['Spawn', 'Alternate'];
  const ext = 'RTID(Shared@External)';
  const entry = { Type: 'RTID(mummy@ZombieTypes)', Row: 2, Future: ['x'] };
  const wave = { id: 1, zombieActionAlias: 'Alternate', zombies: [{ code: 'mummy', row: '2', count: 1, entries: [entry] }] };
  const original = { name: 'Test', waves: [wave], waveSystemDirty: false, hasWaveManager: true,
    preserveGeneratorWaves: false, preserveCustomWaveManager: false, conveyor: { enabled: true } };
  const source = { version: 1, objects: [
    { objclass: 'LevelDefinition', objdata: { Name: 'Test' } },
    { objclass: 'WaveManagerProperties', objdata: { Waves: [[ext, 'RTID(Alternate@CurrentLevel)']] } },
    { aliases, objclass: 'SpawnZombiesJitteredWaveActionProps', unknown: 3, objdata: { Zombies: [entry], Style: '' } },
    { objclass: 'ModifyConveyorWaveActionProps', objdata: { Remove: [] } }
  ] };
  const snapshot = { source, draftFingerprint: JSON.stringify(original) };
  const draft = structuredClone(original);
  draft.name = 'Edited';
  draft.waveSystemDirty = true;
  Object.assign(draft.waves[0].zombies[0], { row: '4', rowDirty: true });
  const expected = structuredClone(source);
  expected.objects[0].objdata.Name = 'Edited';
  expected.objects[2].objdata.Zombies[0].Row = '4';
  assert.deepEqual(getSpawnEditedImportedLevel(snapshot, draft), expected);
  assert.equal(source.objects[2].objdata.Zombies[0].Row, 2);
  draft.conveyor.enabled = false;
  assert.equal(getSpawnEditedImportedLevel(snapshot, draft), null);
});

test('wave reordering, deletion and insertion retain unrepresented references and scalar shapes', () => {
  const a = 'RTID(A@CurrentLevel)', b = 'RTID(B@CurrentLevel)', x = 'RTID(X@External)';
  const order = [{ alias: 'A' }, { alias: 'B' }];
  assert.deepEqual(preserveWaveReferences([a, x, b], order, [b, a]), [b, x, a]);
  assert.deepEqual(preserveWaveReferences([a, x, b], order, [b]), [x, b]);
  assert.deepEqual(preserveWaveReferences([a, x, b], order, [a, b, 'new']), [a, x, b, 'new']);
  assert.equal(preserveWaveReferences(x, [], []), x);
  assert.equal(preserveWaveReferences(a, [order[0]], [a]), a);
});
