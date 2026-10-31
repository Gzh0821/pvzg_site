import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ENDLESS_DESIGNER_CLASSES, getEndlessModule, resolveEndlessDesigner } from './endless-codec.mjs';
import { ENDLESS_RULE_FIELDS, localizeEndlessRule, setEndlessRuleNumber, getEndlessBoundValue, getEndlessRuleIssues } from './endless-rule-codec.mjs';
import { createLevelImportSnapshot } from './level-codec.mjs';
import { getAuthoredContentEditedLevel } from './authored-content-codec.mjs';
const read = relative => JSON.parse(readFileSync(new URL(relative, import.meta.url), 'utf8'));
const shared = read('../game-data/raw/Objects/LevelModules.json').objects;
const worlds = ['egypt', 'pirate', 'cowboy', 'future', 'dark', 'beach', 'iceage', 'lostcity', 'eighties', 'dino', 'modern', 'kongfu', 'sky'];
const templates = worlds.map(world => read(`../game-data/raw/Levels/endless/${world}.json`));

test('every non-wave native designer has a parameter editor, without controls for ignored resource fields', () => {
  assert.deepEqual(Object.keys(ENDLESS_RULE_FIELDS).sort(), ENDLESS_DESIGNER_CLASSES.filter(cls => cls !== 'DangerRoomJitteredWaveGenerator').sort());
  assert(!ENDLESS_RULE_FIELDS.DangerRoomDinoDesigner.some(field => field.key === 'DinoTypePool'));
  assert(!ENDLESS_RULE_FIELDS.DangerRoomSandstormDesigner.some(field => ['UseBandedSandstormSpawnColumns', 'BaseSandstormStartWave', 'MinSandstormZombiesCountPerLevel'].includes(field.key)));
  assert.deepEqual(ENDLESS_RULE_FIELDS.GridItemPatternPlacer.map(field => field.key), ['GridItemSpawnerPatterns']);
});

test('shared rule copies preserve opaque fields, replace only exact references and avoid aliases in every editor domain', () => {
  const source = { aliases: ['Rule', 'Other'], objclass: 'DangerRoomPlankDesigner', envelope: 7, objdata: { PlankLayouts: ['10101'], Extra: { keep: true } } };
  const objects = [{ aliases: ['RuleLocal'], objclass: 'Unknown' }];
  const module = { objdata: { LevelDesigners: ['RTID(Rule@LevelModules)', 'RTID(Other@LevelModules)', 'RTID(Rule@LevelModules)'] } };
  const before = structuredClone(source);
  const ref = localizeEndlessRule(module, module.objdata.LevelDesigners[0], objects, [source], ['RuleLocal2']);
  assert.equal(ref, 'RTID(RuleLocal3@CurrentLevel)');
  assert.deepEqual(module.objdata.LevelDesigners, [ref, 'RTID(Other@LevelModules)', ref]);
  assert.deepEqual(objects.at(-1), { ...source, aliases: ['RuleLocal3'] });
  objects.at(-1).objdata.PlankLayouts[0] = '00000';
  assert.deepEqual(source, before);
});

test('numeric edits preserve scalar representation, descending curve endpoints and unknown bound metadata', () => {
  const data = { Count: '4', LevelRange: { Min: 1, Max: 30, X: 9 }, Curve: { Min: 7, Max: 1 }, Bound: { LowerLimit: { Value: '2', Tag: 'keep' } } };
  setEndlessRuleNumber(data, 'Count', '8');
  setEndlessRuleNumber(data, 'Curve.Min', '6', 1);
  setEndlessRuleNumber(data, 'Bound.LowerLimit.Value', '4');
  assert.equal(data.Count, '8'); assert.equal(data.Curve.Min, 5);
  assert.deepEqual(data.LevelRange, { Min: 1, Max: 30, X: 9 });
  assert.deepEqual(data.Bound.LowerLimit, { Value: '4', Tag: 'keep' });
  setEndlessRuleNumber(data, 'Bound.LowerLimit.Value', '');
  assert.deepEqual(data.Bound.LowerLimit, { Tag: 'keep' });
  setEndlessRuleNumber(data, 'Count', '');
  assert.equal(data.Count, '');
});

test('linear bounds follow native defaults, coercion, clamping order and floor arithmetic', () => {
  assert.equal(getEndlessBoundValue(undefined, 10), 0);
  assert.equal(getEndlessBoundValue({ YIntercept: 7, SlopeCoefficient: -.5, LowerLimit: { Value: '2' }, UpperLimit: { Value: '6' } }, 1), 6);
  assert.equal(getEndlessBoundValue({ YIntercept: 7, SlopeCoefficient: -.5, LowerLimit: { Value: '2' }, UpperLimit: { Value: '6' } }, 100), 2);
  assert.equal(getEndlessBoundValue({ LowerLimit: { Value: '8' }, UpperLimit: { Value: '4' } }, 1), 8);
  assert.equal(getEndlessBoundValue({ YIntercept: 25 }, 1, 9), 9);
});

test('curve validation allows falling values and distinguishes inherited anomalies from new invalid edits', () => {
  const module = { objdata: { LevelDesigners: ['RTID(Rule@CurrentLevel)'] } };
  const objects = [{ aliases: ['Rule'], objclass: 'DangerRoomDropShipDesigner', objdata: { LevelRange: { Min: 3, Max: 15 }, ImpColumnMin: { Min: 3, Max: 0 }, ImpColumnMax: { Min: 2, Max: 2 }, ImpCountMin: { Min: 1, Max: 2 }, ImpCountMax: { Min: 2, Max: 3 }, WaveDropShipChance: { Min: 3, Max: 10 } } }];
  const original = structuredClone(objects);
  assert.deepEqual(getEndlessRuleIssues(module, objects, [], module, original), []);
  objects[0].objdata.LevelRange.Max = 3;
  assert.equal(getEndlessRuleIssues(module, objects, [], module, original)[0].inherited, false);
  assert.equal(getEndlessRuleIssues(module, objects, [], module, objects)[0].inherited, true);
});

test('editing each available native local rule changes only the target object through the authored fast path', () => {
  let count = 0;
  for (const template of [...templates, { objects: [templates[0].objects.find(object => object.objclass === 'LevelDefinition'), ...shared.filter(object => ENDLESS_RULE_FIELDS[object.objclass])] }]) for (const source of template.objects) {
    const fields = ENDLESS_RULE_FIELDS[source.objclass];
    if (!fields) continue;
    const spec = fields.find(field => field.kind === 'number' || field.kind === 'curve');
    if (!spec) continue;
    const raw = structuredClone(template);
    raw.extension = { keep: 7 };
    const target = raw.objects.find(object => object.aliases?.includes(source.aliases[0]));
    target.extra = 'keep'; target.objdata.Unknown = { keep: [1, 2] };
    const draft = { moduleRefs: [], levelExtra: {}, unsupportedRawObjects: structuredClone(raw.objects.filter(object => object.objclass !== 'LevelDefinition')) };
    const snapshot = createLevelImportSnapshot(raw, draft);
    const edited = draft.unsupportedRawObjects.find(object => object.aliases?.includes(source.aliases[0]));
    const path = spec.key + (spec.kind === 'curve' ? '.Min' : '');
    setEndlessRuleNumber(edited.objdata, path, '13');
    const expected = structuredClone(raw);
    setEndlessRuleNumber(expected.objects.find(object => object.aliases?.includes(source.aliases[0])).objdata, path, '13');
    assert.deepEqual(getAuthoredContentEditedLevel(snapshot, draft), expected);
    count++;
  }
  assert.equal(count, 59);
});

test('shared rule localization is serialized as one new object and a precise designer reference update', () => {
  const raw = structuredClone(templates[0]), definition = raw.objects.find(object => object.objclass === 'LevelDefinition').objdata;
  const draft = { moduleRefs: structuredClone(definition.Modules), levelExtra: {}, unsupportedRawObjects: structuredClone(raw.objects.filter(object => object.objclass !== 'LevelDefinition')) };
  const snapshot = createLevelImportSnapshot(raw, draft), module = getEndlessModule(draft.unsupportedRawObjects, definition);
  const reference = module.objdata.LevelDesigners.find(ref => ref.endsWith('@LevelModules)'));
  const next = localizeEndlessRule(module, reference, draft.unsupportedRawObjects, shared);
  const copy = resolveEndlessDesigner(next, draft.unsupportedRawObjects, shared);
  copy.objdata.FutureKey = 12;
  const result = getAuthoredContentEditedLevel(snapshot, draft);
  const expected = structuredClone(raw);
  getEndlessModule(expected.objects, definition).objdata.LevelDesigners = module.objdata.LevelDesigners;
  expected.objects.push(copy);
  assert.deepEqual(result, expected);
});


test('obsolete sandstorm library entries report missing native parameters without blocking unchanged imports', () => {
  const object = shared.find(object => object.aliases?.includes('LevelGenSandstorm_1Wave'));
  const module = { objdata: { LevelDesigners: ['RTID(LevelGenSandstorm_1Wave@LevelModules)'] } };
  const issues = getEndlessRuleIssues(module, [], shared, module, []);
  assert.equal(issues.length, 6);
  assert(issues.every(issue => issue.inherited));
  assert(getEndlessRuleIssues(module, [], shared, null).every(issue => !issue.inherited));
});

test('an extra invalid copy cannot borrow an inherited anomaly twice', () => {
  const module = { objdata: { LevelDesigners: ['RTID(A@CurrentLevel)'] } };
  const original = [{ aliases: ['A'], objclass: 'DangerRoomPlankDesigner', objdata: { PlankLayouts: ['bad'] } }];
  const objects = [...structuredClone(original), { ...structuredClone(original[0]), aliases: ['B'] }];
  const next = { objdata: { LevelDesigners: [...module.objdata.LevelDesigners, 'RTID(B@CurrentLevel)'] } };
  const issues = getEndlessRuleIssues(next, objects, [], module, original);
  assert.deepEqual(issues.map(issue => issue.inherited), [true, false]);
});

test('empty native slider layouts and zero-step portal generation are errors', () => {
  const object = structuredClone(shared.find(object => object.objclass === 'DangerRoomPortalDesigner'));
  object.aliases = ['Portal'];
  const original = structuredClone(object);
  object.objdata.NextPortalWavesMin = { Min: 0, Max: 0 };
  const module = { objdata: { LevelDesigners: ['RTID(Portal@CurrentLevel)'] } };
  assert(getEndlessRuleIssues(module, [object], [], module, [original]).some(issue => !issue.inherited && issue.field === 'NextPortalWavesMin'));
  const slider = { aliases: ['Slider'], objclass: 'DangerRoomSliderTileDesigner', objdata: { SliderTileLayouts: [] } };
  assert.equal(getEndlessRuleIssues({ objdata: { LevelDesigners: ['RTID(Slider@CurrentLevel)'] } }, [slider], [], null)[0].inherited, false);
});
