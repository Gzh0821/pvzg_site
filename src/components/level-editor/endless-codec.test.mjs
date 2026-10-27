import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createEndlessLevel, getEndlessModule, getEndlessWaveLimit, getEndlessWaveBudget, resolveEndlessDesigner, getEndlessIssues, ENDLESS_DESIGNER_CLASSES } from './endless-codec.mjs';
import { createLevelImportSnapshot } from './level-codec.mjs';
import { getAuthoredContentEditedLevel } from './authored-content-codec.mjs';
const read = (relative) => JSON.parse(readFileSync(new URL(relative, import.meta.url), 'utf8'));
const worlds = ['egypt', 'pirate', 'cowboy', 'future', 'dark', 'beach', 'iceage', 'lostcity', 'eighties', 'dino', 'modern', 'kongfu', 'sky'];
const templates = worlds.map(world => read(`../game-data/raw/Levels/endless/${world}.json`));

test('all 13 native templates create independent full levels with only the requested metadata changed', () => {
  const shared = read('../game-data/raw/Objects/LevelModules.json').objects;
  for (const template of templates) {
    const before = structuredClone(template), expected = structuredClone(template);
    const definition = expected.objects.find(object => object.objclass === 'LevelDefinition').objdata;
    definition.Name = 'custom_endless'; definition.Description = 'Test';
    const created = createEndlessLevel(template, 'custom_endless', 'Test');
    assert.deepEqual(created, expected);
    assert.deepEqual(template, before);
    assert.equal(definition.IsDangerRoom, true);
    const module = getEndlessModule(created.objects, definition);
    assert(module);
    for (const ref of module.objdata.LevelDesigners) {
      const object = resolveEndlessDesigner(ref, created.objects, shared);
      assert(object, ref);
      assert(ENDLESS_DESIGNER_CLASSES.includes(object.objclass), object.objclass);
    }
    assert.equal(resolveEndlessDesigner(module.objdata.LevelDesigners[0], created.objects, shared).objclass, 'DangerRoomJitteredWaveGenerator');
    assert.deepEqual(getEndlessIssues(created.objects, definition), []);
  }
});

test('template freshness is explicit and follows the maintained game version', () => {
  assert.equal(read('../game-data/raw/Levels/endless/version.json').gameVersion, read('../version.json').gameVersion);
});

test('endless wave limits follow native floor growth, ten-wave flags and normal or minigame caps', () => {
  assert.equal(getEndlessWaveLimit({}, 1), 10);
  assert.equal(getEndlessWaveLimit({}, 4), 10);
  assert.equal(getEndlessWaveLimit({}, 5), 20);
  assert.equal(getEndlessWaveLimit({}, 100), 40);
  assert.equal(getEndlessWaveLimit({}, 100, true), 20);
  assert.equal(getEndlessWaveLimit({ MaxFlagWave: 3 }, 100), 30);
});

test('native point caps apply before the flag multiplier and floor growth starts at the current floor', () => {
  const generator = { StartingPoints: 100, BasePointIncrementPerWave: 30, BasePointIncrementPerLevel: 5 };
  assert.equal(getEndlessWaveBudget(generator, 1, 0), 100);
  assert.equal(getEndlessWaveBudget(generator, 1, 9), 1037.5);
  assert.equal(getEndlessWaveBudget(generator, 10, 9), 2050);
  assert.equal(getEndlessWaveBudget({ ...generator, MaxPointPerWave: 300 }, 10, 9), 750);
});

test('preview preserves native numeric coercion and distinguishes missing caps from explicit zero or null', () => {
  const generator = { StartingPoints: 100, BasePointIncrementPerWave: 30, BasePointIncrementPerLevel: 5 };
  assert.equal(getEndlessWaveBudget({ ...generator, MaxPointPerWave: null }, 1, 9), 0);
  assert.equal(getEndlessWaveBudget({ ...generator, StartingPoints: '100' }, 1, 1), 10035);
  assert.equal(getEndlessWaveBudget({ ...generator, StartingPoints: undefined }, 1, 1), null);
});

test('mode selection matches native last-module precedence and minigame priority', () => {
  const objects = [
    { objclass: 'DangerRoomModuleProperties', aliases: ['First'] },
    { objclass: 'DangerRoomMiniGameModuleProperties', aliases: ['Mini'] },
    { objclass: 'DangerRoomModuleProperties', aliases: ['Last'] }
  ];
  assert.equal(getEndlessModule(objects, { IsDangerRoom: true }).aliases[0], 'Last');
  assert.equal(getEndlessModule(objects, { IsDangerRoom: true, IsDangerRoomMiniGame: true }).aliases[0], 'Mini');
  assert.equal(getEndlessModule(objects, {}), null);
});

test('designer references retain namespace ownership instead of guessing by alias', () => {
  const local = [{ aliases: ['Same'], objclass: 'Local' }], shared = [{ aliases: ['Same'], objclass: 'Shared' }];
  assert.equal(resolveEndlessDesigner('RTID(Same@CurrentLevel)', local, shared).objclass, 'Local');
  assert.equal(resolveEndlessDesigner('RTID(Same@LevelModules)', local, shared).objclass, 'Shared');
  assert.equal(resolveEndlessDesigner('RTID(Same@PropertySheets)', local, shared), null);
});

test('new invalid settings are errors while pre-existing invalid data stays inherited', () => {
  const raw = templates[0], definition = raw.objects.find(object => object.objclass === 'LevelDefinition').objdata;
  const objects = structuredClone(raw.objects), module = getEndlessModule(objects, definition);
  module.objdata.MaxFlagWave = 0;
  assert.equal(getEndlessIssues(objects, definition, raw.objects, definition)[0].inherited, false);
  assert.equal(getEndlessIssues(objects, definition, objects, definition)[0].inherited, true);
  const noModule = objects.filter(object => object !== module);
  assert.equal(getEndlessIssues(noModule, definition, raw.objects, definition)[0].field, 'module');
});

test('editing each native endless room setting changes only its object, including unknown envelopes', () => {
  for (const template of templates) {
    const raw = structuredClone(template);
    const definition = raw.objects.find(object => object.objclass === 'LevelDefinition').objdata;
    const module = getEndlessModule(raw.objects, definition);
    module.OuterExtension = 7; module.objdata.FutureExtension = { keep: true };
    const draft = { name: 'Test', levelExtra: structuredClone(definition), unsupportedRawObjects: structuredClone(raw.objects.filter(object => object.objclass !== 'LevelDefinition')) };
    const snapshot = createLevelImportSnapshot(raw, draft);
    const edited = getEndlessModule(draft.unsupportedRawObjects, draft.levelExtra);
    edited.objdata.MaxFlagWave = 2;
    const expected = structuredClone(raw);
    getEndlessModule(expected.objects, definition).objdata.MaxFlagWave = 2;
    assert.deepEqual(getAuthoredContentEditedLevel(snapshot, draft), expected);
  }
});
