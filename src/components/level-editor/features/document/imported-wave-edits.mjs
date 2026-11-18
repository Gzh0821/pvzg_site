import { getDefinitionEditedImportedLevel } from '../../level-codec.mjs';
import { serializeZombieGroups } from '../../wave-codec.mjs';

// Editing an existing spawn list does not change the manager, its references or the conveyor.
export function getSpawnEditedImportedLevel(snapshot, draft) {
  if (!snapshot || !draft.waveSystemDirty) return null;
  const original = JSON.parse(snapshot.draftFingerprint);
  if (!original.waves.length || original.waves.length !== draft.waves.length) return null;

  const changes = [];
  const waves = draft.waves.map((wave, index) => {
    const before = original.waves[index];
    if (JSON.stringify(wave.zombies) !== JSON.stringify(before.zombies)) changes.push(wave);
    return { ...wave, zombies: before.zombies };
  });
  if (!changes.length) return null;
  const source = getDefinitionEditedImportedLevel(snapshot, {
    ...draft, waves, waveSystemDirty: original.waveSystemDirty,
    hasWaveManager: original.hasWaveManager, preserveGeneratorWaves: original.preserveGeneratorWaves,
    preserveCustomWaveManager: original.preserveCustomWaveManager,
  });
  if (!source) return null;

  for (const wave of changes) {
    const alias = wave.zombieActionAlias;
    if (!alias || draft.waves.some(other => other !== wave && other.zombieActionAlias === alias)) return null;
    const action = source.objects.findLast(object => object?.aliases?.includes(alias));
    if (action?.objclass !== 'SpawnZombiesJitteredWaveActionProps') return null;
    action.objdata.Zombies = serializeZombieGroups(wave.zombies);
  }
  return source;
}

// Keep slots the editor did not resolve when adding, removing or moving known events.
export function preserveWaveReferences(original, order, refs) {
  const known = new Map();
  for (const { alias } of order) {
    const ref = `RTID(${alias}@CurrentLevel)`;
    known.set(ref, (known.get(ref) || 0) + 1);
  }
  const surviving = new Set(refs.filter(ref => known.has(ref)));
  let next = 0;
  const result = [];
  for (const ref of Array.isArray(original) ? original : [original]) {
    if (!known.get(ref)) {
      result.push(ref);
      continue;
    }
    known.set(ref, known.get(ref) - 1);
    if (!surviving.has(ref)) continue;
    while (next < refs.length && !surviving.has(refs[next])) result.push(refs[next++]);
    if (next < refs.length) result.push(refs[next++]);
  }
  result.push(...refs.slice(next));
  return !Array.isArray(original) && result.length === 1 ? result[0] : result;
}
