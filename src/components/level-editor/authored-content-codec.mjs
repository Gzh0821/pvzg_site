import { reconcileLevelObjects } from './level-codec.mjs';
import { NARRATIVE_SLOTS } from './narrative-codec.mjs';

export const GENERATOR_CLASSES = ['LevelOfTheDayModuleProperties', 'DangerRoomJitteredWaveGenerator'];
const EDITABLE_CLASSES = new Set(['NarrativeProperties', ...GENERATOR_CLASSES]);
const fingerprint = (value) => JSON.stringify(value);
const clone = (value) => JSON.parse(JSON.stringify(value));

// A story or generator property edit must not reconstruct unrelated game modules.
export function getAuthoredContentEditedLevel(snapshot, draft) {
  if (!snapshot?.draftFingerprint) return null;
  const baseline = JSON.parse(snapshot.draftFingerprint);
  const normalized = { ...draft, levelExtra: baseline.levelExtra, unsupportedRawObjects: baseline.unsupportedRawObjects };
  if (fingerprint(normalized) !== snapshot.draftFingerprint) return null;
  const withoutStory = (extra) => Object.fromEntries(Object.entries(extra || {}).filter(([key]) => !NARRATIVE_SLOTS.includes(key)));
  if (fingerprint(withoutStory(draft.levelExtra)) !== fingerprint(withoutStory(baseline.levelExtra))) return null;
  const opaque = (objects) => (objects || []).filter((object) => !EDITABLE_CLASSES.has(object?.objclass));
  if (fingerprint(opaque(draft.unsupportedRawObjects)) !== fingerprint(opaque(baseline.unsupportedRawObjects))) return null;
  const source = clone(snapshot.source);
  const definition = source.objects.find((object) => object.objclass === 'LevelDefinition').objdata;
  for (const key of NARRATIVE_SLOTS) {
    if (fingerprint(draft.levelExtra?.[key]) === fingerprint(baseline.levelExtra?.[key])) continue;
    if (Object.hasOwn(draft.levelExtra, key)) definition[key] = clone(draft.levelExtra[key]);
    else delete definition[key];
  }
  source.objects = reconcileLevelObjects(source.objects, [
    ...source.objects.filter((object) => !EDITABLE_CLASSES.has(object?.objclass)),
    ...draft.unsupportedRawObjects.filter((object) => EDITABLE_CLASSES.has(object?.objclass))
  ]);
  return source;
}

export function getGeneratorObjects(objects) {
  return objects.filter((object) => GENERATOR_CLASSES.includes(object?.objclass));
}

export function getGeneratorIssues(objects, originalObjects = []) {
  return getGeneratorObjects(objects).flatMap((object) => {
    const original = getGeneratorObjects(originalObjects).find((item) => item.objclass === object.objclass &&
      item.aliases?.some((alias) => object.aliases?.includes(alias)));
    const data = object.objdata || {};
    const endless = object.objclass === 'DangerRoomJitteredWaveGenerator';
    const requiredNumbers = endless ? ['StartingPoints', 'BasePointIncrementPerWave', 'BasePointIncrementPerLevel']
      : ['StartingPoints', 'PointIncrementPerWave'];
    const invalid = requiredNumbers.filter((field) => data[field] == null || data[field] === '' || !Number.isFinite(Number(data[field])));
    if (!Array.isArray(data.ZombiePool) || !data.ZombiePool.length) invalid.push('ZombiePool');
    if (endless && !Array.isArray(data.MustContainZombie)) invalid.push('MustContainZombie');
    return invalid.map((field) => ({ field, alias: object.aliases?.[0] || object.objclass,
      inherited: !!original && fingerprint(original.objdata?.[field]) === fingerprint(data[field]) }));
  });
}

export function getGeneratorWaveBudget(data, index, flagInterval = data?.WavesPerFlag) {
  if (!Number.isFinite(data?.StartingPoints) || !Number.isFinite(data?.PointIncrementPerWave)) return null;
  const points = data.StartingPoints + data.PointIncrementPerWave * index;
  return (index + 1) % flagInterval === 0 ? points * 2.5 : points;
}
