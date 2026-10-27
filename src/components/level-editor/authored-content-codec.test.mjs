import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeLevelCapabilities, createLevelImportSnapshot } from './level-codec.mjs';
import { getAuthoredContentEditedLevel, getGeneratorWaveBudget, getGeneratorIssues } from './authored-content-codec.mjs';
import { createLocalNarrative, getNarrativeWarnings, getNarrativeActions } from './narrative-codec.mjs';

function fixture() {
  const story = { aliases: ['Intro'], objclass: 'NarrativeProperties', extra: 'keep', objdata: { Unknown: [1], Flow: [
    { Character: 'crazydave', Action: 'NPC_ENTER' },
    { Character: 'crazydave', Action: 'SAY', Lines: { zh: '原文', en: 'Original' }, Extension: 5 }
  ] } };
  const generator = { aliases: ['PointGen'], objclass: 'LevelOfTheDayModuleProperties', extra: 3,
    objdata: { StartingPoints: 100, PointIncrementPerWave: 20, WavesPerFlag: 5, ZombiePool: ['mummy'], Unknown: { keep: true } } };
  const raw = { '#comment': 'unrelated', version: 7, Unknown: [3], objects: [
    { objclass: 'LevelDefinition', objdata: { Name: 'Test', FirstIntroNarrative: 'Intro', StageModule: 'RTID(EgyptStage@LevelModules)' } },
    story, { aliases: ['Unrelated'], objclass: 'UnknownModule', objdata: { keep: 'exact' } }, generator
  ] };
  const draft = { name: 'Test', levelExtra: { FirstIntroNarrative: 'Intro' }, unsupportedRawObjects: structuredClone(raw.objects.slice(1)), moduleRefs: [] };
  return { raw, draft, snapshot: createLevelImportSnapshot(raw, draft) };
}

test('one dialogue translation changes without reconstructing other fields or objects', () => {
  const { raw, draft, snapshot } = fixture();
  draft.unsupportedRawObjects[0].objdata.Flow[1].Lines.zh = '修改';
  const expected = structuredClone(raw);
  expected.objects[1].objdata.Flow[1].Lines.zh = '修改';
  assert.deepEqual(getAuthoredContentEditedLevel(snapshot, draft), expected);
});

test('shared stories become independent local copies, with a collision-free alias', () => {
  const { raw, draft, snapshot } = fixture();
  const original = structuredClone(raw.objects[1]);
  const local = createLocalNarrative(draft.unsupportedRawObjects, draft.levelExtra, 'FirstIntroNarrative', original, 'zh');
  local.objdata.Flow[1].Lines.zh = '本关台词';
  const second = createLocalNarrative(draft.unsupportedRawObjects, draft.levelExtra, 'ReplayIntroNarrative', original, 'zh');
  assert.notEqual(local.aliases[0], second.aliases[0]);
  assert.deepEqual(original, raw.objects[1]);
  const result = getAuthoredContentEditedLevel(snapshot, draft);
  assert.deepEqual(result.objects[1], raw.objects[1]);
  assert.equal(result.objects[0].objdata.FirstIntroNarrative, local.aliases[0]);
  assert.equal(result.objects.at(-1).objdata.Flow[1].Lines.en, 'Original');
});

test('clearing a story reference keeps its object and every unrelated definition field', () => {
  const { raw, draft, snapshot } = fixture();
  delete draft.levelExtra.FirstIntroNarrative;
  const expected = structuredClone(raw);
  delete expected.objects[0].objdata.FirstIntroNarrative;
  assert.deepEqual(getAuthoredContentEditedLevel(snapshot, draft), expected);
});

test('native generator property edits retain opaque data and outer envelopes', () => {
  const { raw, draft, snapshot } = fixture();
  draft.unsupportedRawObjects[2].objdata.StartingPoints = 220;
  const expected = structuredClone(raw);
  expected.objects[3].objdata.StartingPoints = 220;
  assert.deepEqual(getAuthoredContentEditedLevel(snapshot, draft), expected);
  draft.unsupportedRawObjects[1].objdata.keep = 'changed';
  assert.equal(getAuthoredContentEditedLevel(snapshot, draft), null);
});

test('story warnings detect missing entry actions, unknown actions and missing sources without discarding them', () => {
  const { draft } = fixture();
  draft.unsupportedRawObjects[0].objdata.Flow.shift();
  assert.equal(getNarrativeWarnings(draft.unsupportedRawObjects, draft.levelExtra, [])[0].reason, 'enter');
  draft.unsupportedRawObjects[0].objdata.Flow[0].Action = 'UnknownFutureAction';
  assert(getNarrativeWarnings(draft.unsupportedRawObjects, draft.levelExtra, []).some((issue) => issue.reason === 'action'));
  draft.levelExtra.FirstIntroNarrative = 'missing';
  assert.equal(getNarrativeWarnings(draft.unsupportedRawObjects, draft.levelExtra, [])[0].reason, 'missing');
  assert.deepEqual(getNarrativeWarnings(draft.unsupportedRawObjects, draft.levelExtra, null), []);
  assert(!getNarrativeActions('zombossicon').includes('TIRED'));
});

test('point preview follows native zero-based growth and the 2.5 flag multiplier', () => {
  const data = { StartingPoints: 100, PointIncrementPerWave: 30, WavesPerFlag: 5 };
  assert.equal(getGeneratorWaveBudget(data, 0), 100);
  assert.equal(getGeneratorWaveBudget(data, 4), 550);
  assert.equal(getGeneratorWaveBudget(data, 5), 250);
  assert.equal(getGeneratorWaveBudget(data, 1, 2), 325);
});

test('a local story alias cannot collide with an imported core or wave object', () => {
  const objects = [];
  const story = createLocalNarrative(objects, {}, 'FirstIntroNarrative', null, 'zh', ['EditorFirstIntroNarrative']);
  assert.equal(story.aliases[0], 'EditorFirstIntroNarrative1');
});

test('an empty pool newly introduced by editing is an error, while unchanged imported invalid data is inherited', () => {
  const { raw, draft } = fixture();
  draft.unsupportedRawObjects[2].objdata.ZombiePool = [];
  assert.equal(getGeneratorIssues(draft.unsupportedRawObjects, raw.objects)[0].inherited, false);
  const original = structuredClone(draft.unsupportedRawObjects);
  assert.equal(getGeneratorIssues(draft.unsupportedRawObjects, original)[0].inherited, true);
  delete draft.unsupportedRawObjects[2].objdata.StartingPoints;
  assert(getGeneratorIssues(draft.unsupportedRawObjects, original).some((issue) => issue.field === 'StartingPoints' && !issue.inherited));
});

test('the import summary recognizes story and native generators as editable sections', () => {
  const result = analyzeLevelCapabilities(fixture().raw);
  assert(result.visualSections.includes('narrative'));
  assert(result.visualSections.includes('waves'));
  assert.equal(result.waveMode, 'generator');
  assert.equal(result.preservedObjects, 1);
  const { raw } = fixture();
  raw.objects.push({ objclass: 'WaveManagerProperties', objdata: { Waves: [[], []] } });
  assert.equal(analyzeLevelCapabilities(raw).waveMode, 'generator');
});

test('unreadable story steps remain intact and become warnings', () => {
  const { draft } = fixture();
  draft.unsupportedRawObjects[0].objdata.Flow = [null, 'future step'];
  assert.equal(getNarrativeWarnings(draft.unsupportedRawObjects, draft.levelExtra, []).length, 2);
  assert.deepEqual(draft.unsupportedRawObjects[0].objdata.Flow, [null, 'future step']);
});
