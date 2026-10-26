import assert from 'node:assert/strict';
import test from 'node:test';
import { createEmptyObjectiveSystem } from './objective-codec.mjs';
import { createEmptyBoardRuleSystem } from './board-rule-codec.mjs';
import { createLevelImportSnapshot, getUnchangedImportedLevel } from './level-codec.mjs';
import { createProjectState, readProjectState, getNextProjectIds } from './project-state.mjs';

function fixture() {
  return {
    name: '恢复测试', description: '', stage: 'EgyptStage',
    boardItems: [{ id: 9, extra: { unknown: { nested: true } } }],
    waves: [{ id: 8, zombies: [{ id: 12, entries: [{ Type: 'RTID(custom@CurrentLevel)', Unknown: 17 }] }],
      rawActions: [{ id: 21, jsonText: '{Unknown: 1}' }], actionOrder: [{ kind: 'raw', actionId: 21 }] }],
    waveSupportObjects: [{ id: 31 }], seedPlants: [], seedPresetEntries: [], includePlants: [], excludePlants: [],
    moduleRefs: [], unsupportedRawObjects: [], preservedPlacementObjects: [], preservedStaticWaveObjects: [],
    conveyor: { initialPlants: [], dropDelayConditions: [], speedConditions: [], waveModifications: [], originalActionObjects: [] },
    objectives: createEmptyObjectiveSystem(), boardRules: createEmptyBoardRuleSystem()
  };
}

test('project recovery retains imported envelopes, opaque fields, and exact unchanged export', () => {
  const draft = fixture();
  const source = { version: 1, extension: { keep: true }, objects: [{ objclass: 'LevelDefinition', objdata: { Name: draft.name } }] };
  const snapshot = createLevelImportSnapshot(source, draft);
  const project = readProjectState(JSON.stringify(createProjectState(draft, snapshot, { activeWorkspace: 'waves', selectedWaveId: 8 })));
  assert.deepEqual(project.draft, draft);
  assert.deepEqual(getUnchangedImportedLevel(project.importedLevelSnapshot, project.draft), source);
  assert.equal(project.editor.selectedWaveId, 8);
  project.draft.boardItems[0].extra.unknown.nested = false;
  assert.equal(draft.boardItems[0].extra.unknown.nested, true);
});

test('new IDs are above recovered IDs, including support actions and deleted history', () => {
  assert.deepEqual(getNextProjectIds(fixture()), { item: 10, wave: 9, zombie: 13, action: 32 });
});

test('older template drafts with duplicate zombie IDs recover without merging or deleting entries', () => {
  const draft = fixture();
  draft.waves[0].zombies.push({ id: 12, code: 'sun', count: 5, row: '2' });
  const project = readProjectState(createProjectState(draft, null, {}));
  assert.deepEqual(project.draft.waves[0].zombies.map((zombie) => zombie.id), [12, 13]);
  assert.equal(project.draft.waves[0].zombies[1].count, 5);
  assert.deepEqual(project.draft.waves[0].zombies[0].entries, draft.waves[0].zombies[0].entries);
  assert.equal(draft.waves[0].zombies[1].id, 12);
});

test('generator module and unknown fields survive project save and recovery', () => {
  const draft = fixture();
  draft.waves = [];
  draft.preserveGeneratorWaves = true;
  draft.preservedWaveManagerModule = { objclass: 'WaveManagerModuleProperties', objdata: { Unknown: ['RTID(0)'] } };
  assert.deepEqual(readProjectState(createProjectState(draft, null, {})).draft, draft);
});

test('invalid or incompatible projects are rejected before replacing the current draft', () => {
  for (const mutate of [
    (p) => { p.version = 2; }, (p) => { p.draft.waves = null; },
    (p) => { p.draft.waves[0].rawActions = {}; }, (p) => { p.draft.conveyor.initialPlants = null; },
    (p) => { p.importedLevelSnapshot = { source: {} }; },
    (p) => { p.draft.preserveGeneratorWaves = true; }
  ]) {
    const project = createProjectState(fixture(), null, {});
    mutate(project);
    assert.throws(() => readProjectState(project));
  }
  assert.throws(() => readProjectState('{truncated'));
});

test('metadata edits leave absent defaults, comments, references, and opaque objects untouched', async () => {
  const { getDefinitionEditedImportedLevel, preserveUneditedDefinitionFields } = await import('./level-codec.mjs');
  const draft = fixture();
  draft.startingSun = 50;
  draft.author = '';
  const source = { '#comment': 'different from level name', objects: [
    { objclass: 'LevelDefinition', objdata: { Name: draft.name, Description: 'original', Modules: ['RTID(Custom@CurrentLevel)'] } },
    { aliases: ['Custom'], objclass: 'UnknownModule', objdata: { keep: true } }
  ] };
  const snapshot = createLevelImportSnapshot(source, draft);
  const edited = { ...draft, description: 'edited' };
  const result = getDefinitionEditedImportedLevel(snapshot, edited);
  assert.equal(result['#comment'], source['#comment']);
  assert.equal(result.objects[0].objdata.Description, 'edited');
  assert.equal(Object.hasOwn(result.objects[0].objdata, 'StartingSun'), false);
  assert.deepEqual(result.objects[1], source.objects[1]);
  assert.equal(getDefinitionEditedImportedLevel(snapshot, { ...edited, stage: 'ModernStage' }), null);
  const sunEdited = getDefinitionEditedImportedLevel(snapshot, { ...draft, startingSun: 75 });
  assert.equal(sunEdited.objects[0].objdata.StartingSun, 75);
  delete sunEdited.objects[0].objdata.StartingSun;
  assert.deepEqual(sunEdited, source);
  const restored = preserveUneditedDefinitionFields(snapshot, edited, { StartingSun: 50, WrittenBy: '', Description: 'edited' });
  assert.deepEqual(restored, { Name: draft.name, Description: 'edited' });
});
