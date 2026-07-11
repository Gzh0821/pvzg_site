import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import JSON5 from 'json5';
import {
  collectPreservedStaticWaveObjects,
  groupZombieEntries,
  groupZombiePoolReferences,
  isDetachedZombieSpawnAction,
  resizeZombiePoolGroup,
  serializeZombieGroups,
  serializeZombiePoolGroups,
  setDynamicZombiesOnModuleObject,
  supportsDynamicZombieEditing
} from '../src/components/level-editor/wave-codec.mjs';

const siteRoot = fileURLToPath(new URL('../', import.meta.url));
const levelsDirectory = process.env.PVZGE_LEVELS_DIR
  ? path.resolve(process.env.PVZGE_LEVELS_DIR)
  : path.resolve(siteRoot, '../pvzge_build/docs/game-json-files/levels');

const levelFiles = (await readdir(levelsDirectory))
  .filter((name) => /\.json$/i.test(name))
  .sort((left, right) => left.localeCompare(right));

const stats = {
  levels: levelFiles.length,
  staticLevels: 0,
  generatorLevels: 0,
  normalActions: 0,
  stormActions: 0,
  groundActions: 0,
  dynamicLevels: 0,
  dynamicSevenSlots: 0,
  dynamicEmptySlots: 0,
  dynamicOtherLengths: 0,
  sentinelValues: 0,
  plainPoolReferences: 0,
  unresolvedWaveReferences: 0,
  duplicateAliasReferences: 0,
  detachedSpawnActions: 0,
  modulesWithoutManagerReference: 0,
  dynamicWithoutManagerReference: 0
};

let editableDynamicFixture;

function parseCurrentLevelAlias(value) {
  return /^RTID\((.+)@CurrentLevel\)$/.exec(String(value || ''))?.[1] || '';
}

function normalizeWaveRefs(value) {
  return (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean).map(String);
}

function withoutDynamicZombies(objdata) {
  const { DynamicZombies: _dynamicZombies, ...rest } = objdata || {};
  return rest;
}

for (const fileName of levelFiles) {
  const filePath = path.join(levelsDirectory, fileName);
  const level = JSON5.parse(await readFile(filePath, 'utf8'));
  const objects = Array.isArray(level?.objects) ? level.objects : [];
  const moduleObject = objects.find((object) => object?.objclass === 'WaveManagerModuleProperties');
  const managerObject = objects.find((object) => object?.objclass === 'WaveManagerProperties');
  const waves = managerObject?.objdata?.Waves;
  const supportsDynamic = supportsDynamicZombieEditing(moduleObject);
  if (moduleObject && !supportsDynamic) stats.modulesWithoutManagerReference += 1;

  if (Array.isArray(waves)) {
    stats.staticLevels += 1;
    const aliases = new Map();
    objects.forEach((object) => {
      (object?.aliases || []).forEach((alias) => {
        const matches = aliases.get(alias) || [];
        matches.push(object);
        aliases.set(alias, matches);
      });
    });
    const referencedAliases = new Set();
    waves.flatMap(normalizeWaveRefs).forEach((reference) => {
      const alias = parseCurrentLevelAlias(reference);
      if (!alias) return;
      referencedAliases.add(alias);
      const matches = aliases.get(alias) || [];
      if (!matches.length) stats.unresolvedWaveReferences += 1;
      else if (matches.length > 1) stats.duplicateAliasReferences += 1;
    });

    const snapshot = collectPreservedStaticWaveObjects(objects, moduleObject, managerObject, referencedAliases);
    const expected = objects.filter(
      (object) =>
        object === moduleObject ||
        object === managerObject ||
        (object?.aliases || []).some((alias) => referencedAliases.has(alias))
    );
    assert.deepStrictEqual(snapshot, expected, `${fileName}: static wave snapshot changed data`);
    stats.detachedSpawnActions += objects.filter((object) => isDetachedZombieSpawnAction(object, referencedAliases)).length;
  } else {
    stats.generatorLevels += 1;
  }

  for (const object of objects) {
    const actionClass = object?.objclass;
    if (
      actionClass === 'SpawnZombiesJitteredWaveActionProps' ||
      actionClass === 'StormZombieSpawnerProps' ||
      actionClass === 'SpawnZombiesFromGroundSpawnerProps'
    ) {
      const zombies = Array.isArray(object?.objdata?.Zombies) ? object.objdata.Zombies : [];
      assert.deepStrictEqual(
        serializeZombieGroups(groupZombieEntries(zombies)),
        zombies,
        `${fileName}: ${actionClass} zombie order or values changed`
      );
      if (actionClass === 'SpawnZombiesJitteredWaveActionProps') stats.normalActions += 1;
      else if (actionClass === 'StormZombieSpawnerProps') stats.stormActions += 1;
      else stats.groundActions += 1;
    }
  }

  if (Object.prototype.hasOwnProperty.call(moduleObject?.objdata || {}, 'DynamicZombies')) {
    stats.dynamicLevels += 1;
    if (!supportsDynamic) stats.dynamicWithoutManagerReference += 1;
    const dynamicZombies = moduleObject.objdata.DynamicZombies;
    assert.ok(Array.isArray(dynamicZombies), `${fileName}: DynamicZombies must be an array`);
    if (dynamicZombies.length === 7) stats.dynamicSevenSlots += 1;
    else if (dynamicZombies.length === 0) stats.dynamicEmptySlots += 1;
    else stats.dynamicOtherLengths += 1;

    const moduleBefore = structuredClone(moduleObject);
    const updatedModule = setDynamicZombiesOnModuleObject(moduleObject, dynamicZombies);
    assert.deepStrictEqual(updatedModule.objdata.DynamicZombies, dynamicZombies, `${fileName}: DynamicZombies changed on module write`);
    assert.deepStrictEqual(
      withoutDynamicZombies(updatedModule.objdata),
      withoutDynamicZombies(moduleObject.objdata),
      `${fileName}: module fields outside DynamicZombies changed`
    );
    assert.deepStrictEqual(moduleObject, moduleBefore, `${fileName}: module write mutated the imported object`);

    dynamicZombies.forEach((slot) => {
      ['StartingWave', 'StartingPoints', 'PointIncrementPerWave'].forEach((field) => {
        if (slot?.[field] === 'RTID(0)') stats.sentinelValues += 1;
      });
      const pool = Array.isArray(slot?.ZombiePool) ? slot.ZombiePool : [];
      stats.plainPoolReferences += pool.filter((value) => !/^RTID\(.+@ZombieTypes\)$/.test(String(value))).length;
      const groups = groupZombiePoolReferences(pool);
      assert.deepStrictEqual(serializeZombiePoolGroups(groups), pool, `${fileName}: dynamic zombie pool changed without edits`);
      groups.forEach((group, groupIndex) => {
        assert.deepStrictEqual(
          serializeZombiePoolGroups(resizeZombiePoolGroup(groups, groupIndex, group.rawValues.length)),
          pool,
          `${fileName}: dynamic zombie pool changed when keeping the same count`
        );
      });
    });

    if (!editableDynamicFixture && dynamicZombies.length === 7 && dynamicZombies.some((slot) => Object.keys(slot || {}).length)) {
      editableDynamicFixture = structuredClone(dynamicZombies);
    }
  }
}

assert.ok(editableDynamicFixture, 'No editable DynamicZombies fixture was found');
const editedSlots = structuredClone(editableDynamicFixture);
const editedIndex = editedSlots.findIndex((slot) => Object.keys(slot || {}).length);
const originalOtherSlots = editableDynamicFixture.filter((_, index) => index !== editedIndex);
editedSlots[editedIndex] = { ...editedSlots[editedIndex], StartingPoints: Number(editedSlots[editedIndex].StartingPoints || 0) + 1 };
assert.deepStrictEqual(
  editedSlots.filter((_, index) => index !== editedIndex),
  originalOtherSlots,
  'Editing one difficulty slot changed another slot'
);

const generatorModule = {
  aliases: ['GeneratedWaves'],
  objclass: 'WaveManagerModuleProperties',
  objdata: {
    GenerationData: { Waves: 12 },
    WaveManagerProps: 'RTID(GeneratedWaveManager@CurrentLevel)',
    DynamicZombies: []
  }
};
const generatorUpdated = setDynamicZombiesOnModuleObject(generatorModule, editedSlots);
assert.deepStrictEqual(generatorUpdated.objdata.GenerationData, generatorModule.objdata.GenerationData);
assert.equal(generatorUpdated.objdata.WaveManagerProps, generatorModule.objdata.WaveManagerProps);
assert.ok(!Object.prototype.hasOwnProperty.call(generatorUpdated.objdata, 'Waves'));
assert.deepStrictEqual(generatorModule.objdata.DynamicZombies, []);
assert.equal(supportsDynamicZombieEditing(generatorModule), true);
assert.equal(supportsDynamicZombieEditing({ objclass: 'WaveManagerModuleProperties', objdata: { DynamicZombies: editedSlots } }), false);

console.log(`Checked ${stats.levels} levels: ${stats.staticLevels} static, ${stats.generatorLevels} generator.`);
console.log(
  `Wave pools round-trip exactly: ${stats.normalActions} normal, ${stats.stormActions} storm, ${stats.groundActions} ground.`
);
console.log(
  `DynamicZombies: ${stats.dynamicLevels} levels (${stats.dynamicSevenSlots} seven-slot, ${stats.dynamicEmptySlots} empty, ${stats.dynamicOtherLengths} other); ${stats.sentinelValues} RTID(0) sentinels and ${stats.plainPoolReferences} plain references preserved.`
);
console.log(
  `Opaque wave refs retained by static snapshots: ${stats.unresolvedWaveReferences} unresolved, ${stats.duplicateAliasReferences} duplicate-alias references.`
);
console.log(
  `Detached spawn actions preserved as opaque objects: ${stats.detachedSpawnActions}; dynamic editing disabled for ${stats.modulesWithoutManagerReference} modules without WaveManagerProps (${stats.dynamicWithoutManagerReference} contain DynamicZombies).`
);
