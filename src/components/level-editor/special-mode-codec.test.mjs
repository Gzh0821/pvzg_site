import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createLevelImportSnapshot } from './level-codec.mjs';
import { getAuthoredContentEditedLevel } from './authored-content-codec.mjs';
import { SPECIAL_MODE_CLASSES, createSpecialLevel, getSpecialBindings, getSpecialTypeOptions, localizeSpecialModule, getAirMemberOrder, getSpecialModeIssues } from './special-mode-codec.mjs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const { templates, gameVersion } = read('../game-data/raw/Levels/specials/templates.json');
const options = read('../game-data/raw/Levels/specials/options.json');
const draftOf = raw => ({ moduleRefs: structuredClone(raw.objects.find(o => o.objclass === 'LevelDefinition').objdata.Modules), unsupportedRawObjects: structuredClone(raw.objects.filter(o => o.objclass !== 'LevelDefinition')) });

test('36 distinct bosses and all four air raid templates preserve full native dependencies and inputs', () => {
  assert.equal(templates.filter(t => t.kind === 'boss').length, 36);
  assert.equal(templates.filter(t => t.kind === 'airRaid').length, 4);
  assert.equal(new Set(templates.filter(t => t.kind === 'boss').map(t => t.type)).size, 36);
  assert.equal(gameVersion, read('../version.json').gameVersion);
  assert.equal(options.gameVersion, gameVersion);
  for (const template of templates) {
    const before = structuredClone(template.level), expected = structuredClone(template.level);
    Object.assign(expected.objects.find(o => o.objclass === 'LevelDefinition').objdata, { Name: 'custom', Description: 'Test' });
    assert.deepEqual(createSpecialLevel(template.level, 'custom', 'Test'), expected);
    assert.deepEqual(template.level, before);
    assert.equal(getSpecialBindings(draftOf(template.level), options.sharedObjects).some(b => b.kind === template.kind), true);
    assert.deepEqual(getSpecialModeIssues(draftOf(template.level), template.level.objects, options), [], template.id);
  }
});

test('bindings follow actual module references and namespaces without double-editing duplicated refs', () => {
  const raw = templates[0].level, draft = draftOf(raw), binding = getSpecialBindings(draft, options.sharedObjects)[0];
  draft.moduleRefs.push(binding.reference);
  draft.unsupportedRawObjects.push({ objclass: SPECIAL_MODE_CLASSES.boss, aliases: ['Detached'], objdata: {} });
  assert.equal(getSpecialBindings(draft, options.sharedObjects).length, 1);
  draft.moduleRefs = ['RTID(Detached@LevelModules)'];
  assert.equal(getSpecialBindings(draft, options.sharedObjects).length, 0);
});

test('localizing shared ship configuration is collision-safe and only replaces that precise reference', () => {
  const shared = options.sharedObjects.find(o => o.objclass === SPECIAL_MODE_CLASSES.ship);
  const reference = `RTID(${shared.aliases[0]}@LevelModules)`;
  const before = structuredClone(options.sharedObjects);
  const draft = { moduleRefs: [reference, 'RTID(Other@LevelModules)', reference], unsupportedRawObjects: [] };
  const binding = getSpecialBindings(draft, options.sharedObjects)[0];
  const local = localizeSpecialModule(draft, binding, [`${shared.aliases[0]}Local`]);
  assert.equal(local.reference, `RTID(${shared.aliases[0]}Local2@CurrentLevel)`);
  assert.deepEqual(draft.moduleRefs, [local.reference, 'RTID(Other@LevelModules)', local.reference]);
  local.object.objdata.Toughness = 25000;
  assert.deepEqual(options.sharedObjects, before);
  assert.equal(localizeSpecialModule(draft, local), local);
});

test('a shared copy and module-ref removal preserve unrelated modules, ordering and unknown envelopes', () => {
  const shared = options.sharedObjects.find(o => o.objclass === SPECIAL_MODE_CLASSES.ship);
  const reference = `RTID(${shared.aliases[0]}@LevelModules)`;
  const raw = { FutureRoot: 8, objects: [{ objclass: 'LevelDefinition', objdata: { Modules: [reference, 'RTID(Other@LevelModules)', reference], Name: 'Test' } }, { objclass: 'Opaque', aliases: ['Keep'], Outer: 7, objdata: { Future: true } }] };
  const draft = draftOf(raw), snapshot = createLevelImportSnapshot(raw, draft);
  const local = localizeSpecialModule(draft, getSpecialBindings(draft, options.sharedObjects)[0]);
  local.object.objdata.Toughness = 12345;
  const expected = structuredClone(raw);
  expected.objects[0].objdata.Modules = [...draft.moduleRefs]; expected.objects.push(structuredClone(local.object));
  assert.deepEqual(getAuthoredContentEditedLevel(snapshot, draft), expected);
  draft.moduleRefs = draft.moduleRefs.filter(ref => ref !== local.reference);
  expected.objects[0].objdata.Modules = [...draft.moduleRefs];
  assert.deepEqual(getAuthoredContentEditedLevel(snapshot, draft), expected);
});

test('local aliases take precedence over global types; unknown selected aliases can stay unchanged', () => {
  const types = getSpecialTypeOptions([{ objclass: 'PlantType', aliases: ['peashooter'], objdata: { PlantBasedOn: 'repeater' } }], options.plantTypes, 'plant');
  assert.equal(types.find(t => t.value === 'peashooter').base, 'repeater');
  assert.equal(types.filter(t => t.value === 'peashooter').length, 1);
});

test('air stage order matches native point sorting without rewriting stored member order or extension fields', () => {
  const members = [{ Type: 'final' }, { Type: 'zero', FullPoint: 0 }, { Type: 'second', FullPoint: 5000, Future: 7 }, { Type: 'first', FullPoint: 1000 }];
  const original = structuredClone(members);
  assert.deepEqual(getAirMemberOrder(members).map(entry => entry.member.Type), ['first', 'second', 'final', 'zero']);
  assert.deepEqual(members, original);
});

test('new invalid boss coordinates are errors while imported invalid values remain warnings', () => {
  const raw = templates.find(t => t.kind === 'boss').level, draft = draftOf(raw);
  const binding = getSpecialBindings(draft, options.sharedObjects)[0];
  binding.object.objdata.ZombossSpawnGridPosition.mX = 9;
  const issues = getSpecialModeIssues(draft, raw.objects, options);
  assert.equal(issues[0].field, 'ZombossSpawnGridPosition'); assert.equal(issues[0].inherited, false);
  assert.equal(getSpecialModeIssues(draft, draft.unsupportedRawObjects, options)[0].inherited, true);
});

test('air validation covers the three-team native chooser limit, resolvable plants and non-empty member chains', () => {
  const raw = templates.find(t => t.kind === 'airRaid').level, draft = draftOf(raw), binding = getSpecialBindings(draft, options.sharedObjects)[0];
  binding.object.objdata.Teams.push(structuredClone(binding.object.objdata.Teams[0]));
  assert.equal(getSpecialModeIssues(draft, raw.objects, options)[0].field, 'Teams');
  binding.object.objdata.Teams.pop(); binding.object.objdata.Teams[0].Members[0].Type = 'missing_type';
  assert.equal(getSpecialModeIssues(draft, raw.objects, options)[0].inherited, false);
  binding.object.objdata.Teams[0].Members = [];
  assert.equal(getSpecialModeIssues(draft, raw.objects, options)[0].field, 'Teams');
});

test('editing all boss and raid template configurations patches only the intended object', () => {
  for (const template of templates) {
    const draft = draftOf(template.level), snapshot = createLevelImportSnapshot(template.level, draft);
    const binding = getSpecialBindings(draft, options.sharedObjects).find(binding => binding.kind === template.kind);
    const field = template.kind === 'boss' ? 'ReservedColumnCount' : 'TargetPoint', value = template.kind === 'boss' ? 2 : 12345;
    binding.object.objdata[field] = value;
    const expected = structuredClone(template.level);
    expected.objects.find(o => o.objclass === binding.object.objclass).objdata[field] = value;
    assert.deepEqual(getAuthoredContentEditedLevel(snapshot, draft), expected, template.id);
  }
});

test('editing names or reordering teams keeps pre-existing unknown mod plants as inherited warnings', () => {
  const raw = structuredClone(templates.find(t => t.kind === 'airRaid').level);
  const original = raw.objects.find(o => o.objclass === SPECIAL_MODE_CLASSES.airRaid);
  original.objdata.Teams[1].Members[0].Type = 'future_mod_plant';
  const draft = draftOf(raw), binding = getSpecialBindings(draft, options.sharedObjects)[0];
  binding.object.objdata.Teams[0].Name.en = 'Renamed';
  binding.object.objdata.Teams.reverse();
  assert.equal(getSpecialModeIssues(draft, raw.objects, options)[0].inherited, true);
  binding.object.objdata.Teams[0].Members[0].Type = 'another_missing_type';
  assert.equal(getSpecialModeIssues(draft, raw.objects, options)[0].inherited, false);
});

test('duplicating an inherited invalid reference creates a new error instead of hiding it as inherited', () => {
  const raw = structuredClone(templates.find(t => t.kind === 'airRaid').level);
  raw.objects.find(o => o.objclass === SPECIAL_MODE_CLASSES.airRaid).objdata.Teams[0].Members[0].Type = 'future_mod_plant';
  const draft = draftOf(raw), binding = getSpecialBindings(draft, options.sharedObjects)[0];
  binding.object.objdata.Teams[0].Members.push({ Type: 'future_mod_plant' });
  assert.equal(getSpecialModeIssues(draft, raw.objects, options)[0].inherited, false);
});
