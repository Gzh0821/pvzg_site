import { parseObjectiveSystem } from './objective-codec.mjs';
import { parseBoardRuleSystem } from './board-rule-codec.mjs';
import { VISUAL_WAVE_ACTION_CLASSES } from './wave-action-codec.mjs';

const CORE_OBJECT_CLASSES = new Set([
  'LevelDefinition',
  'SeedBankProperties',
  'ConveyorSeedBankProperties',
  'WaveManagerModuleProperties',
  'WaveManagerProperties',
  'SpawnZombiesJitteredWaveActionProps',
  'InitialGridItemProperties',
  'InitialPlantProperties',
  'InitialZombieProperties',
  'GravestoneProperties'
]);

const DOMAIN_SELECTORS = {
  seed(draft) {
    return {
      seedMode: draft.seedMode,
      seedSlots: draft.seedSlots,
      seedPlants: draft.seedPlants,
      seedPresetEntries: draft.seedPresetEntries,
      includePlants: draft.includePlants,
      excludePlants: draft.excludePlants,
      unlockAll: draft.unlockAll,
      hasSeedBank: draft.hasSeedBank,
      seedBankExtra: draft.seedBankExtra
    };
  },
  board(draft) {
    return {
      boardItems: draft.boardItems,
      preserveBoardModules: draft.preserveBoardModules,
      preservedPlacementObjects: draft.preservedPlacementObjects,
      boardRules: draft.boardRules
    };
  },
  waves(draft) {
    return {
      waves: draft.waves,
      flagWaveInterval: draft.flagWaveInterval,
      firstWaveCountdown: draft.firstWaveCountdown,
      suppressFlagZombie: draft.suppressFlagZombie,
      waveSpendingPointIncrement: draft.waveSpendingPointIncrement,
      waveSpendingPoints: draft.waveSpendingPoints,
      minNextWaveHealthPercentage: draft.minNextWaveHealthPercentage,
      maxNextWaveHealthPercentage: draft.maxNextWaveHealthPercentage,
      waveManagerModuleExtra: draft.waveManagerModuleExtra,
      waveManagerExtra: draft.waveManagerExtra,
      conveyor: draft.conveyor
    };
  },
  objectives(draft) {
    return draft.objectives;
  }
};

export function cloneLevelValue(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function fingerprint(value) {
  return JSON.stringify(value);
}

function normalizeWaveReferences(value) {
  return (Array.isArray(value) ? value.flat() : value ? [value] : []).filter(Boolean).map(String);
}

function parseCurrentLevelAlias(value) {
  return /^RTID\((.+)@CurrentLevel\)$/.exec(String(value || ''))?.[1] || '';
}

export function validateLevelDocument(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.objects)) return false;
  const definitions = raw.objects.filter((object) => object?.objclass === 'LevelDefinition');
  if (definitions.length !== 1) return false;
  const level = definitions[0]?.objdata;
  if (!level || !String(level.Name || raw['#comment'] || '').trim() || !Array.isArray(level.Modules)) return false;
  const stageReference = /^RTID\((.+)@(LevelModules|CurrentLevel)\)$/.exec(String(level.StageModule || ''));
  if (!stageReference) return false;
  if (stageReference[2] === 'CurrentLevel') {
    return raw.objects.some((object) => (object?.aliases || []).includes(stageReference[1]));
  }
  return true;
}

export function createLevelImportSnapshot(raw, draft) {
  const source = cloneLevelValue(raw);
  return {
    source,
    draftFingerprint: fingerprint(draft),
    domainFingerprints: Object.fromEntries(
      Object.entries(DOMAIN_SELECTORS).map(([name, select]) => [name, fingerprint(select(draft))])
    )
  };
}

export function getUnchangedImportedLevel(snapshot, draft) {
  if (!snapshot || snapshot.draftFingerprint !== fingerprint(draft)) return null;
  return cloneLevelValue(snapshot.source);
}

export function isImportedDomainUnchanged(snapshot, draft, domain) {
  const select = DOMAIN_SELECTORS[domain];
  if (!snapshot || !select) return false;
  return snapshot.domainFingerprints?.[domain] === fingerprint(select(draft));
}

export function getImportedObjectsByClass(snapshot, objclass) {
  const objects = Array.isArray(snapshot?.source?.objects) ? snapshot.source.objects : [];
  return objects.filter((object) => object?.objclass === objclass).map((object) => cloneLevelValue(object));
}

export function normalizePlantCodes(plants = []) {
  return Array.from(new Set(plants.filter(Boolean)));
}

export function normalizeSeedSlots(value, minimum = 0, maximum = 8) {
  const numericValue = Number(value);
  const fallback = Math.max(maximum, minimum);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.round(numericValue)));
}

export function normalizeSeedPlants(plants = [], limit = 8, preserveDuplicates = false) {
  const filtered = plants.filter(Boolean);
  return (preserveDuplicates ? filtered : normalizePlantCodes(filtered)).slice(0, Math.max(0, limit));
}

export function buildSeedPresetPlants(plants = [], importedEntries = []) {
  const used = new Set();
  return plants.map((code) => {
    const importedIndex = importedEntries.findIndex((entry, index) => !used.has(index) && entry?.PlantType === code);
    if (importedIndex >= 0) {
      used.add(importedIndex);
      return {
        ...cloneLevelValue(importedEntries[importedIndex]),
        PlantType: code
      };
    }
    return { PlantType: code, Level: -1 };
  });
}

export function analyzeLevelCapabilities(raw) {
  const objects = Array.isArray(raw?.objects) ? raw.objects : [];
  const objectiveSystem = parseObjectiveSystem(raw);
  const boardRuleSystem = parseBoardRuleSystem(raw);
  const managedObjectIndexes = new Set([
    ...objectiveSystem.ownedObjectIndexes,
    ...boardRuleSystem.ownedObjectIndexes
  ]);
  const aliasMap = new Map();
  objects.forEach((object) => {
    (object?.aliases || []).forEach((alias) => {
      if (!aliasMap.has(alias)) aliasMap.set(alias, object);
    });
  });

  const manager = objects.find((object) => object?.objclass === 'WaveManagerProperties');
  const waves = manager?.objdata?.Waves;
  const referencedWaveObjects = new Set();
  if (Array.isArray(waves)) {
    waves.flatMap(normalizeWaveReferences).forEach((reference) => {
      const object = aliasMap.get(parseCurrentLevelAlias(reference));
      if (object) referencedWaveObjects.add(object);
    });
  }

  const visualSections = ['basic'];
  if (objects.some((object) => object?.objclass === 'SeedBankProperties' || object?.objclass === 'ConveyorSeedBankProperties')) {
    visualSections.push('seed');
  }
  if (
    boardRuleSystem.modules.length ||
    objects.some((object) =>
      ['InitialGridItemProperties', 'InitialPlantProperties', 'InitialZombieProperties', 'GravestoneProperties'].includes(
        object?.objclass
      )
    )
  ) {
    visualSections.push('board');
  }
  if (Array.isArray(waves)) visualSections.push('waves');
  if (objectiveSystem.starModule || objectiveSystem.protect) visualSections.push('objectives');

  const advancedActions = [...referencedWaveObjects].filter(
    (object) => !VISUAL_WAVE_ACTION_CLASSES.has(object?.objclass)
  ).length;
  const preservedObjects = objects.filter((object, objectIndex) => {
    if (managedObjectIndexes.has(objectIndex)) return false;
    if (object?.objclass === 'SpawnZombiesJitteredWaveActionProps' && !referencedWaveObjects.has(object)) return true;
    return !CORE_OBJECT_CLASSES.has(object?.objclass) && !referencedWaveObjects.has(object);
  });

  return {
    visualSections,
    advancedActions,
    preservedObjects: preservedObjects.length,
    preservedClasses: [...new Set(preservedObjects.map((object) => object?.objclass || 'Unknown'))],
    waveMode: Array.isArray(waves)
      ? 'static'
      : objects.some((object) => object?.objclass === 'WaveManagerModuleProperties')
        ? 'generator'
        : 'none'
  };
}
