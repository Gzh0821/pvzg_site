export const PROJECT_KIND = 'pvzge-level-editor';
export const DRAFT_STORAGE_KEY = 'pvzge-level-editor-project';

export function createProjectState(draft, importedLevelSnapshot, editor) {
  return {
    kind: PROJECT_KIND,
    version: 1,
    savedAt: new Date().toISOString(),
    draft: JSON.parse(JSON.stringify(draft)),
    importedLevelSnapshot: importedLevelSnapshot == null ? null : JSON.parse(JSON.stringify(importedLevelSnapshot)),
    editor: { ...editor }
  };
}

export function readProjectState(value) {
  const project = typeof value === 'string' ? JSON.parse(value) : value;
  if (project?.kind !== PROJECT_KIND || project.version !== 1 || !project.draft || !project.editor) {
    throw new Error('Invalid editor project');
  }
  const draft = project.draft;
  for (const key of ['name', 'description', 'stage']) {
    if (typeof draft[key] !== 'string') throw new Error(`Invalid project ${key}`);
  }
  for (const key of ['boardItems', 'waves', 'waveSupportObjects', 'seedPlants', 'seedPresetEntries',
    'includePlants', 'excludePlants', 'moduleRefs', 'unsupportedRawObjects', 'preservedPlacementObjects', 'preservedStaticWaveObjects']) {
    if (!Array.isArray(draft[key])) throw new Error(`Invalid project ${key}`);
  }
  if (!draft.conveyor || !draft.objectives || !draft.boardRules) throw new Error('Invalid project modules');
  for (const [module, keys] of [
    [draft.conveyor, ['initialPlants', 'dropDelayConditions', 'speedConditions', 'waveModifications', 'originalActionObjects']],
    [draft.objectives, ['starObjectives', 'starGroups', 'originalObjects', 'originalStarObjects', 'originalProtectObjects', 'originalSupportedAliases', 'opaqueStarObjects']],
    [draft.boardRules, ['modules', 'originalObjects', 'ownedObjectIndexes']]
  ]) {
    if (keys.some((key) => !Array.isArray(module[key]))) throw new Error('Invalid project module data');
  }
  for (const wave of draft.waves) {
    if (!Number.isInteger(wave.id) || !Array.isArray(wave.zombies) || !Array.isArray(wave.rawActions) || !Array.isArray(wave.actionOrder)) {
      throw new Error('Invalid project wave');
    }
  }
  if (project.importedLevelSnapshot != null) {
    const snapshot = project.importedLevelSnapshot;
    if (!Array.isArray(snapshot.source?.objects) || typeof snapshot.draftFingerprint !== 'string' ||
      !snapshot.domainFingerprints || typeof JSON.parse(snapshot.draftFingerprint)?.name !== 'string') {
      throw new Error('Invalid imported level snapshot');
    }
  }
  if (draft.preserveGeneratorWaves && !draft.preservedWaveManagerModule) throw new Error('Missing generator snapshot');
  if (draft.preserveCustomWaveManager && !draft.preservedWaveManagerObject) throw new Error('Missing wave manager snapshot');
  const result = JSON.parse(JSON.stringify(project));
  if (!result.importedLevelSnapshot) {
    const seen = new Set();
    let next = getNextProjectIds(result.draft).zombie;
    for (const zombie of result.draft.waves.flatMap((wave) => wave.zombies)) {
      if (seen.has(zombie.id)) zombie.id = next++;
      seen.add(zombie.id);
    }
  }
  return result;
}

export function getNextProjectIds(draft) {
  const next = (items) => Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
  return {
    item: next(draft.boardItems),
    wave: next(draft.waves),
    zombie: next(draft.waves.flatMap((wave) => wave.zombies)),
    action: next([...draft.waveSupportObjects, ...draft.waves.flatMap((wave) => wave.rawActions)])
  };
}
