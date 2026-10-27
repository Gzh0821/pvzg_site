import test from 'node:test';
import assert from 'node:assert/strict';
import { applyBoardTool, getBoardToolTarget } from './board-editing.mjs';
import { createEmptyBoardRuleSystem, parseBoardRuleSystem, serializeBoardRuleSystem } from './board-rule-codec.mjs';
import { createEmptyObjectiveSystem, parseObjectiveSystem, serializeObjectiveSystem } from './objective-codec.mjs';
const empty = () => ({ boardRules: createEmptyBoardRuleSystem(), objectives: createEmptyObjectiveSystem(), boardItems: [] });

test('select and place tools never alter native rules; a missing plant creates no protection module', () => {
  const draft = empty(), before = structuredClone(draft);
  for (const tool of ['select', 'place', 'protect']) assert.equal(applyBoardTool(draft, tool, '', 2, 3).changed, false);
  assert.deepEqual(draft, before);
});

test('rails and carts share a native module, but clicks preserve every other coordinate and field', () => {
  const draft = empty();
  const first = applyBoardTool(draft, 'rails', '', 2, 3);
  const data = draft.boardRules.modules[0].objdata;
  data.Rails[0].Extension = 9;
  data.DynamicRailCarts = [{ preserve: true }];
  applyBoardTool(draft, 'railcarts', first.targetId, 2, 3);
  applyBoardTool(draft, 'rails', first.targetId, 4, 6);
  assert.equal(draft.boardRules.modules.length, 1);
  assert.equal(data.Rails[0].Extension, 9);
  applyBoardTool(draft, 'rails', first.targetId, 0, 6);
  assert.deepEqual(data.Rails, [{ Column: 3, RowStart: 0, RowEnd: 4, Extension: 9 }]);
  assert.deepEqual(data.Railcarts, [{ Column: 3, Row: 2 }]);
  assert.deepEqual(data.DynamicRailCarts, [{ preserve: true }]);
});

test('power tile group changes retain imported location metadata and unrelated tiles', () => {
  const draft = empty();
  applyBoardTool(draft, 'powerTiles', '', 1, 2);
  const data = draft.boardRules.modules[0].objdata;
  Object.assign(data.LinkedTiles[0], { extra: 7, Location: { mX: 2, mY: 1, extra: 8 } });
  applyBoardTool(draft, 'powerTiles', '', 1, 2, { powerGroup: 'beta', powerDelay: 0.8 });
  assert.deepEqual(data.LinkedTiles[0], { Group: 'beta', Location: { mX: 2, mY: 1, extra: 8 }, PropagationDelay: 0.8, extra: 7 });
  applyBoardTool(draft, 'powerTiles', '', 3, 6, { powerGroup: 'beta' });
  assert.equal(data.LinkedTiles[1].PropagationDelay, 0.8);
  applyBoardTool(draft, 'powerTiles', '', 1, 2, { powerGroup: 'beta' });
  assert.equal(data.LinkedTiles.length, 1);
  assert.equal(data.LinkedTiles[0].Location.mX, 6);
});

test('tide creation at the default coordinate is still serialized, and planks toggle one row', () => {
  const draft = empty();
  assert.equal(applyBoardTool(draft, 'tide', '', 1, 4).changed, true);
  assert.equal(serializeBoardRuleSystem(draft.boardRules).length, 1);
  assert.equal(applyBoardTool(draft, 'tide', '', 1, 4).changed, false);
  applyBoardTool(draft, 'tide', '', 2, 6);
  assert.equal(getBoardToolTarget(draft, 'tide').objdata.StartingWaveLocation, 3);
  applyBoardTool(draft, 'planks', '', 1, 3);
  applyBoardTool(draft, 'planks', '', 3, 7);
  applyBoardTool(draft, 'planks', '', 1, 0);
  assert.deepEqual(getBoardToolTarget(draft, 'planks').objdata.PlankRows, [3]);
});

test('protection uses the placed plant first; toggling preserves a deliberately partial target count', () => {
  const draft = empty();
  draft.boardItems.push({ kind: 'plant', row: 1, col: 2, code: 'sunflower' });
  applyBoardTool(draft, 'protect', '', 1, 2, { plantCode: 'peashooter' });
  const data = draft.objectives.protect.objdata;
  assert.equal(data.Plants[0].PlantType, 'sunflower');
  applyBoardTool(draft, 'protect', '', 2, 3, { plantCode: 'wallnut' });
  assert.equal(data.MustProtectCount, 2);
  data.MustProtectCount = 1;
  applyBoardTool(draft, 'protect', '', 3, 4, { plantCode: 'peashooter' });
  assert.equal(data.MustProtectCount, 1);
  applyBoardTool(draft, 'protect', '', 1, 2);
  assert.equal(data.MustProtectCount, 1);
  assert.equal(data.Plants.length, 2);
});

test('mold painting materializes existing shared squares and preserves local square metadata', () => {
  const draft = empty();
  applyBoardTool(draft, 'mold', '', 1, 2);
  const data = draft.objectives.starObjectives[0].objdata;
  data.MoldedSquares[0].extra = 'keep';
  data.Locations = 'RTID(Imported@GridMaps)';
  applyBoardTool(draft, 'mold', '', 3, 4, { resolveMoldLocations: () => [{ GridX: 6, GridY: 2 }] });
  assert.equal(data.MoldedSquares.find(s => s.GridX === 2).extra, 'keep');
  assert(data.MoldedSquares.some(s => s.GridX === 6 && s.GridY === 2));
  assert(!Object.hasOwn(data, 'Locations'));
  assert(draft.objectives.starDirty);
});

test('new rule and objective aliases avoid core or opaque aliases supplied by the project', () => {
  const draft = empty(), reservedAliases = ['Rails', 'DoNotPlantBeforeLine', 'ProtectThePlant', 'ChallengeModule'];
  applyBoardTool(draft, 'rails', '', 0, 0, { reservedAliases });
  applyBoardTool(draft, 'mold', '', 1, 2, { reservedAliases });
  applyBoardTool(draft, 'protect', '', 1, 2, { reservedAliases, plantCode: 'peashooter' });
  assert(!reservedAliases.includes(draft.objectives.starModule.alias));
  for (const entry of [...draft.boardRules.modules, ...draft.objectives.starObjectives, draft.objectives.protect]) assert(!reservedAliases.includes(entry.alias));
});

test('painting an imported rule edits its envelope only, leaving unselected duplicate-kind modules intact', () => {
  const raw = { objects: [{ objclass: 'LevelDefinition', objdata: { Modules: ['RTID(A@CurrentLevel)', 'RTID(B@CurrentLevel)'] } },
    ...['A', 'B'].map(alias => ({ objclass: 'PowerTileProperties', aliases: [alias], outer: alias, objdata: { Extension: alias, LinkedTiles: [] } }))] };
  const draft = { ...empty(), boardRules: parseBoardRuleSystem(raw), objectives: parseObjectiveSystem(raw) };
  const selected = draft.boardRules.modules[1];
  applyBoardTool(draft, 'powerTiles', selected.id, 2, 4);
  const output = serializeBoardRuleSystem(draft.boardRules);
  assert.deepEqual(output[0], raw.objects[1]);
  assert.equal(output[1].outer, 'B');
  assert.equal(output[1].objdata.Extension, 'B');
  assert.equal(output[1].objdata.LinkedTiles.length, 1);
  assert.deepEqual(serializeObjectiveSystem(draft.objectives), []);
});

test('duplicate references to one imported rule expose one editable module and retain both references', async () => {
  const { updateBoardRuleModuleRefs } = await import('./board-rule-codec.mjs');
  const refs = ['RTID(A@CurrentLevel)', 'RTID(Other@LevelModules)', 'RTID(A@CurrentLevel)'];
  const raw = { objects: [{ objclass: 'LevelDefinition', objdata: { Modules: refs } },
    { aliases: ['A'], objclass: 'PowerTileProperties', objdata: { LinkedTiles: [] } }] };
  const draft = { ...empty(), boardRules: parseBoardRuleSystem(raw) };
  assert.equal(draft.boardRules.modules.length, 1);
  applyBoardTool(draft, 'powerTiles', '', 2, 4);
  assert.deepEqual(updateBoardRuleModuleRefs(refs, draft.boardRules), refs);
  assert.equal(serializeBoardRuleSystem(draft.boardRules).length, 1);
});

test('overlapping preserved snapshots are emitted once, while genuine original duplicates survive', async () => {
  const { appendPreservedLevelObjects } = await import('./level-codec.mjs');
  const item = { aliases: ['Wave1'], objclass: 'UnknownAction', objdata: { extra: 3 } };
  assert.deepEqual(appendPreservedLevelObjects([structuredClone(item)], [structuredClone(item)], [item]), [item]);
  assert.deepEqual(appendPreservedLevelObjects([structuredClone(item)], [structuredClone(item)], [item, item]), [item, item]);
  const added = { ...structuredClone(item), aliases: ['NewWave'] };
  assert.deepEqual(appendPreservedLevelObjects([item], [item, added], [item]), [item, added]);
});

test('old project snapshots can recognize unchanged placements before the new domain fingerprint existed', async () => {
  const { createLevelImportSnapshot, isImportedDomainUnchanged } = await import('./level-codec.mjs');
  const draft = { ...empty(), preservedPlacementObjects: [], preserveBoardModules: false };
  const snapshot = createLevelImportSnapshot({ objects: [] }, draft);
  delete snapshot.domainFingerprints.placements;
  assert(isImportedDomainUnchanged(snapshot, draft, 'placements'));
  draft.boardItems.push({ kind: 'plant', row: 0, col: 0, code: 'sunflower' });
  assert(!isImportedDomainUnchanged(snapshot, draft, 'placements'));
});

test('editing objectives retains repeated native module references', async () => {
  const { updateObjectiveModuleRefs } = await import('./objective-codec.mjs');
  const refs = ['RTID(ChallengeModule@CurrentLevel)', 'RTID(ChallengeModule@CurrentLevel)', 'RTID(ProtectThePlant@CurrentLevel)', 'RTID(ProtectThePlant@CurrentLevel)'];
  const raw = { objects: [{ objclass: 'LevelDefinition', objdata: { Modules: refs } },
    { aliases: ['ChallengeModule'], objclass: 'StarChallengeModuleProperties', objdata: { Challenges: [['RTID(Beat@CurrentLevel)']] } },
    { aliases: ['Beat'], objclass: 'StarChallengeBeatTheLevelProps', objdata: {} },
    { aliases: ['ProtectThePlant'], objclass: 'ProtectThePlantChallengeProperties', objdata: { MustProtectCount: 1, Plants: [] } }] };
  const system = parseObjectiveSystem(raw);
  system.dirty = true;
  assert.deepEqual(updateObjectiveModuleRefs(refs, system), refs);
});
