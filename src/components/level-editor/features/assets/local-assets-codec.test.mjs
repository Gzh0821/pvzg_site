import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalAsset, getLocalAssetDefinitions } from './local-assets-codec.mjs';
import { collectAssetReferences } from './asset-usage.mjs';
import { toZombieTypeReference, groupZombieEntries, serializeZombieGroups } from '../../wave-codec.mjs';

test('a native variant copies full envelopes and property extensions without changing the shared source', () => {
  const type = { objclass: 'ZombieType', aliases: ['mummy'], extension: 7, objdata: { ZombieBasedOn: 'mummy', Properties: 'RTID(mummy@ZombieProps)', FutureFeature: { keep: true } } };
  const props = { objclass: 'ZombieProperties', aliases: ['mummy'], objdata: { Toughness: 190, Shells: [{ Unknown: 9 }], HitRect: 'RTID(Common@RectangleProps)' } };
  const local = createLocalAsset([], type, props, ['mummy_local_1']);
  assert.equal(local[0].aliases[0], 'mummy_local_2');
  assert.equal(local[0].extension, 7);
  const [definition] = getLocalAssetDefinitions(local);
  assert.equal(definition.properties, local[1]);
  definition.properties.objdata.Toughness = 999;
  definition.properties.objdata.Shells[0].Unknown = 10;
  assert.equal(props.objdata.Toughness, 190);
  assert.equal(props.objdata.Shells[0].Unknown, 9);
  assert.equal(local[1].objdata.HitRect, props.objdata.HitRect);
  assert.deepEqual(type.objdata.FutureFeature, { keep: true });
});

test('local zombie references remain local when added and when their repeated pool entries are edited', () => {
  const reference = 'RTID(mummy_local_1@CurrentLevel)';
  assert.equal(toZombieTypeReference(reference), reference);
  assert.equal(toZombieTypeReference('mummy'), 'RTID(mummy@ZombieTypes)');
  const original = [{ Type: reference, Extension: { n: 1 } }, { Type: reference, Extension: { n: 2 } }];
  const groups = groupZombieEntries(original);
  assert.equal(groups[0].code, reference);
  assert.deepEqual(serializeZombieGroups(groups), original);
  groups[0].count++;
  const output = serializeZombieGroups(groups);
  assert.equal(output.length, 3);
  assert.ok(output.every((entry) => entry.Type === reference));
  assert.deepEqual(output.slice(0,2), original);
});

test('the level asset inventory includes generator, scheduler and local type references without treating property refs as assets', () => {
  const local = { objclass: 'ZombieType', aliases: ['hard_mummy'], objdata: { ZombieBasedOn: 'mummy', Properties: 'RTID(hard_props@CurrentLevel)' } };
  const refs = collectAssetReferences({ generator: { ZombiePool: ['RTID(mummy@ZombieTypes)', 'RTID(hard_mummy@CurrentLevel)'] }, scheduler: { Type: 'RTID(peashooter@PlantTypes)' }, props: local.objdata }, getLocalAssetDefinitions([local]));
  assert.deepEqual(refs, [ { kind: 'zombie', code: 'mummy' }, { kind: 'zombie', code: 'RTID(hard_mummy@CurrentLevel)' }, { kind: 'plant', code: 'peashooter' } ]);
});
