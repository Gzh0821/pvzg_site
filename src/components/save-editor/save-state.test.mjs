import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateSave, gardenIssues, canPlant, makeGardenPlant, maturePlant, diffSave, fullGrowthTime } from './save-state.mjs';
const layout = JSON.parse(readFileSync(new URL('./garden-layout.json', import.meta.url))).slots;
const features = { pea: { ZENGARDEN: { PlantPlace: 'dirt' } }, lily: { ZENGARDEN: { PlantPlace: 'float' } } };
const save = () => ({ name: 'Test', version: '0.15.0', coin: 0, plantProps: {}, worldProps: {}, levelProps: {}, zengarden: {} });

test('rejects non-save containers and malformed values without mutating input', () => {
    for (const input of [null, [], {}, { format: 'gardenest-backup' }]) assert.ok(validateSave(input).length);
    const input = save(); input.coin = -1; input.levelProps.test = { progress: 5 }; input.zengarden.plantsInMain = {};
    const original = JSON.stringify(input);
    assert.deepEqual(validateSave(input), ['coin', 'levelProps.test', 'zengarden.plantsInMain']);
    assert.equal(JSON.stringify(input), original);
    input.coin = 1.5; assert.ok(validateSave(input).includes('coin'));
    input.coin = Number.MAX_SAFE_INTEGER + 1; assert.ok(validateSave(input).includes('coin'));
});
test('garden positions must exist, be unique and be unlocked', () => {
    const plant = makeGardenPlant('pea', 0, 0, 100);
    const zen = { plantsInMain: [plant] };
    assert.deepEqual(gardenIssues(zen, layout, features), []);
    zen.plantsInMain.push({ ...plant }); assert.match(gardenIssues(zen, layout, features).join(), /position/);
    zen.plantsInMain = [{ ...plant, pos: 4 }]; assert.match(gardenIssues(zen, layout, features).join(), /locked/);
    zen.slotsInMain = Array.from({ length: 5 }, () => ({ unlocked: true }));
    assert.deepEqual(gardenIssues(zen, layout, features), []);
    zen.plantsInMain[0].pos = 48; assert.match(gardenIssues(zen, layout, features).join(), /position/);
});
test('placement restrictions follow slot ground type and retain unknown mod plants', () => {
    assert.equal(canPlant(features.lily, { groundType: 0 }), true);
    assert.equal(canPlant(features.lily, { groundType: 1 }), false);
    assert.equal(canPlant({ ZENGARDEN: { PlantPlace: 'solid' } }, { groundType: 2 }), true);
    assert.equal(canPlant({ ZENGARDEN: { PlantPlace: 'none' } }, { groundType: 0 }), false);
    const zen = { plantsInMain: [{ ...makeGardenPlant('mod-plant', 0, 0), custom: { untouched: true } }] };
    const original = JSON.stringify(zen);
    assert.deepEqual(gardenIssues(zen, layout, features), []);
    assert.equal(JSON.stringify(zen), original);
});
test('maturity resets timing and care state while preserving custom fields', () => {
    const plant = { ...makeGardenPlant('pea', 0, 0, 100), waterCD: 500, custom: { value: 42 } };
    maturePlant(plant, 200);
    assert.equal(plant.grownTime, fullGrowthTime + 1); assert.equal(plant.oldTime, 200);
    assert.equal(plant.stuck, false); assert.equal(plant.waterCD, 0);
    assert.deepEqual(plant.custom, { value: 42 });
});
test('export diff reports additions, deletions and array changes, preserving inputs', () => {
    const before = { coin: 1, plant: { custom: 42 }, garden: [] };
    const after = { coin: 2, plant: { custom: 42 }, garden: ['pea'], newField: true };
    assert.deepEqual(diffSave(before, after).map(change => change.path), ['coin', 'garden', 'newField']);
    assert.deepEqual(diffSave({ remove: true }, {}), [{ path: 'remove', before: true, after: undefined }]);
    assert.equal(before.coin, 1);
    assert.deepEqual(diffSave(before, structuredClone(before)), []);
});

test('validates cart care state and daily reward values', () => {
    const data = save(); data.arcade_plant_decoding = { gem_today: -1 };
    assert.ok(validateSave(data).includes('arcade_plant_decoding.gem_today'));
    data.zengarden.plantInCart = { ...makeGardenPlant('pea', 0, 0), grownTime: -1 };
    assert.match(gardenIssues(data.zengarden, layout, features).join(), /plantInCart: grownTime/);
});
