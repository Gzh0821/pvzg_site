const STAR_DEFINITIONS = {
  beat: {
    objclass: 'StarChallengeBeatTheLevelProps',
    alias: 'BeatTheLevel',
    defaults: {}
  },
  zombieDistance: {
    objclass: 'StarChallengeZombieDistanceProps',
    alias: 'ZombieDistance',
    defaults: { TargetDistance: 3 }
  },
  simultaneousPlants: {
    objclass: 'StarChallengeSimultaneousPlantsProps',
    alias: 'SimultaneousPlants',
    defaults: { MaximumPlants: 10 }
  },
  sunProduced: {
    objclass: 'StarChallengeSunProducedProps',
    alias: 'SunProduced',
    defaults: { TargetSun: 1000 }
  },
  sunUsed: {
    objclass: 'StarChallengeSunUsedProps',
    alias: 'SunUsed',
    defaults: { MaximumSun: 1000 }
  },
  plantsLost: {
    objclass: 'StarChallengePlantsLostProps',
    alias: 'PlantsLost',
    defaults: { MaximumPlantsLost: 5 }
  },
  killInTime: {
    objclass: 'StarChallengeKillZombiesInTimeProps',
    alias: 'KillZombies',
    defaults: { Time: 5, ZombiesToKill: 10 }
  },
  sunHoldout: {
    objclass: 'StarChallengeSpendSunHoldoutProps',
    alias: 'SunHoldout',
    defaults: { HoldoutSeconds: 60 }
  },
  mold: {
    objclass: 'MoldColonyChallengeProps',
    alias: 'DoNotPlantBeforeLine',
    defaults: { MoldedSquares: [] }
  }
};

const STAR_KIND_BY_CLASS = Object.fromEntries(
  Object.entries(STAR_DEFINITIONS).map(([kind, definition]) => [definition.objclass, kind])
);

export const STAR_OBJECTIVE_KINDS = Object.keys(STAR_DEFINITIONS);

function normalizeSquare(square) {
  const col = Number(square?.GridX);
  const row = Number(square?.GridY);
  if (!Number.isInteger(col) || !Number.isInteger(row) || col < 0 || col > 8 || row < 0 || row > 4) return null;
  return { GridX: col, GridY: row };
}

function addSquares(target, squares) {
  for (const square of squares || []) {
    const normalized = normalizeSquare(square);
    if (normalized) target.set(`${normalized.GridY}:${normalized.GridX}`, normalized);
  }
}

function squaresFromMatrix(matrix) {
  if (!Array.isArray(matrix)) return [];
  const result = [];
  matrix.slice(0, 5).forEach((row, rowIndex) => {
    String(row || '')
      .slice(0, 9)
      .split('')
      .forEach((value, colIndex) => {
        if (value === '1') result.push({ GridX: colIndex, GridY: rowIndex });
      });
  });
  return result;
}

export function getMoldedSquares(objdata, resolveLocations) {
  const result = new Map();
  addSquares(result, objdata?.MoldedSquares);
  addSquares(result, squaresFromMatrix(objdata?.MoldMatrix));
  addSquares(result, squaresFromMatrix(objdata?._MoldMatrix));
  if (objdata?.Locations && typeof resolveLocations === 'function') {
    addSquares(result, resolveLocations(objdata.Locations));
  }
  return [...result.values()].sort((left, right) => left.GridY - right.GridY || left.GridX - right.GridX);
}

export function setMoldedSquares(objdata, squares) {
  delete objdata.Locations;
  delete objdata.MoldMatrix;
  delete objdata._MoldMatrix;
  objdata.MoldedSquares = getMoldedSquares({ MoldedSquares: squares });
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function parseCurrentLevelAlias(value) {
  return /^RTID\((.+)@CurrentLevel\)$/.exec(String(value || ''))?.[1] || '';
}

function firstAlias(object, fallback) {
  return String(object?.aliases?.[0] || fallback || '');
}

function uniqueAlias(preferred, usedAliases) {
  if (!usedAliases.has(preferred)) return preferred;
  let index = 2;
  while (usedAliases.has(`${preferred}${index}`)) index += 1;
  return `${preferred}${index}`;
}

function getAliasIndex(objects) {
  const index = new Map();
  objects.forEach((object, objectIndex) => {
    (object?.aliases || []).forEach((alias) => {
      if (!index.has(alias)) index.set(alias, { object, objectIndex });
    });
  });
  return index;
}

function getReferencedObject(modules, aliasIndex, objclass) {
  for (const reference of modules) {
    const alias = parseCurrentLevelAlias(reference);
    const match = alias ? aliasIndex.get(alias) : null;
    if (match?.object?.objclass === objclass) return { ...match, alias, reference };
  }
  return null;
}

export function createEmptyObjectiveSystem() {
  return {
    dirty: false,
    starDirty: false,
    protectDirty: false,
    ownedObjectIndexes: [],
    originalObjects: [],
    originalStarObjects: [],
    originalProtectObjects: [],
    originalModuleRefs: { star: null, protect: null },
    starModule: null,
    starGroups: [],
    starObjectives: [],
    originalSupportedAliases: [],
    opaqueStarObjects: [],
    protect: null
  };
}

export function parseObjectiveSystem(raw) {
  const objects = Array.isArray(raw?.objects) ? raw.objects : [];
  const level = objects.find((object) => object?.objclass === 'LevelDefinition')?.objdata || {};
  const modules = Array.isArray(level.Modules) ? level.Modules.map(String) : [];
  const aliasIndex = getAliasIndex(objects);
  const result = createEmptyObjectiveSystem();
  const ownedIndexes = new Set();

  const starMatch = getReferencedObject(modules, aliasIndex, 'StarChallengeModuleProperties');
  if (starMatch) {
    ownedIndexes.add(starMatch.objectIndex);
    const groups = Array.isArray(starMatch.object?.objdata?.Challenges)
      ? starMatch.object.objdata.Challenges.map((group) => (Array.isArray(group) ? group.map(String) : []))
      : [];
    const objectiveByAlias = new Map();
    const opaqueIndexes = new Set();

    groups.forEach((group, groupIndex) => {
      group.forEach((reference, referenceIndex) => {
        const alias = parseCurrentLevelAlias(reference);
        if (!alias || objectiveByAlias.has(alias)) return;
        const match = aliasIndex.get(alias);
        const kind = match ? STAR_KIND_BY_CLASS[match.object?.objclass] : alias === 'BeatTheLevel' ? 'beat' : '';
        if (kind) {
          if (match) ownedIndexes.add(match.objectIndex);
          const objective = {
            id: `star:${groupIndex}:${referenceIndex}:${alias}`,
            kind,
            alias,
            originalAlias: alias,
            objclass: match?.object?.objclass || STAR_DEFINITIONS[kind].objclass,
            objdata: clone(match?.object?.objdata || {}),
            originalObject: match ? clone(match.object) : null,
            implicit: !match,
            groupIndex
          };
          objectiveByAlias.set(alias, objective);
          result.starObjectives.push(objective);
          return;
        }
        if (match) opaqueIndexes.add(match.objectIndex);
      });
    });

    opaqueIndexes.forEach((index) => ownedIndexes.add(index));
    result.starModule = {
      alias: starMatch.alias,
      originalObject: clone(starMatch.object),
      extra: Object.fromEntries(
        Object.entries(starMatch.object?.objdata || {}).filter(([key]) => key !== 'Challenges')
      )
    };
    result.starGroups = clone(groups);
    result.originalSupportedAliases = [...objectiveByAlias.keys()];
    result.opaqueStarObjects = [...opaqueIndexes].sort((left, right) => left - right).map((index) => clone(objects[index]));
    result.originalModuleRefs.star = starMatch.reference;
    const starIndexes = new Set([starMatch.objectIndex, ...objectiveByAlias.values()].flatMap((entry) =>
      typeof entry === 'number'
        ? [entry]
        : entry.originalObject
          ? [aliasIndex.get(entry.originalAlias)?.objectIndex].filter(Number.isInteger)
          : []
    ));
    opaqueIndexes.forEach((index) => starIndexes.add(index));
    result.originalStarObjects = [...starIndexes].sort((left, right) => left - right).map((index) => clone(objects[index]));
  }

  const protectMatch = getReferencedObject(modules, aliasIndex, 'ProtectThePlantChallengeProperties');
  if (protectMatch) {
    ownedIndexes.add(protectMatch.objectIndex);
    result.protect = {
      id: 'protect',
      alias: protectMatch.alias,
      originalAlias: protectMatch.alias,
      objdata: clone(protectMatch.object?.objdata || {}),
      originalObject: clone(protectMatch.object)
    };
    result.originalModuleRefs.protect = protectMatch.reference;
    result.originalProtectObjects = [clone(protectMatch.object)];
  }

  result.ownedObjectIndexes = [...ownedIndexes].sort((left, right) => left - right);
  result.originalObjects = result.ownedObjectIndexes.map((index) => clone(objects[index]));
  return result;
}

function serializeObjectEnvelope(originalObject, alias, objclass, objdata) {
  const envelope = clone(originalObject || {});
  return {
    ...envelope,
    aliases: [alias, ...(envelope.aliases || []).filter((item) => item !== alias && item !== originalObject?.aliases?.[0])],
    objclass,
    objdata: clone(objdata || {})
  };
}

function buildStarGroups(system) {
  const currentByOriginalAlias = new Map(
    system.starObjectives.filter((objective) => objective.originalAlias).map((objective) => [objective.originalAlias, objective])
  );
  const originalSupportedAliases = new Set(system.originalSupportedAliases || []);
  const groups = (system.starGroups || []).map((group) =>
    group.flatMap((reference) => {
      const alias = parseCurrentLevelAlias(reference);
      if (!alias || !originalSupportedAliases.has(alias)) return [reference];
      const objective = currentByOriginalAlias.get(alias);
      return objective ? [`RTID(${objective.alias}@CurrentLevel)`] : [];
    })
  );
  const newObjectives = system.starObjectives.filter((objective) => !objective.originalAlias);
  if (newObjectives.length && !groups.length) groups.push([]);
  newObjectives.forEach((objective) => {
    const groupIndex = Math.min(Math.max(0, Number(objective.groupIndex) || 0), groups.length - 1);
    groups[groupIndex].push(`RTID(${objective.alias}@CurrentLevel)`);
  });
  return groups;
}

export function hasStarObjectiveModule(system) {
  if (!system?.starDirty) return Boolean(system?.starModule);
  return buildStarGroups(system).some((group) => group.length > 0);
}

export function serializeObjectiveSystem(system) {
  if (!system?.dirty) return clone(system?.originalObjects || []);
  const objects = [];

  if (!system.starDirty) {
    objects.push(...clone(system.originalStarObjects || []));
  } else {
    const groups = buildStarGroups(system);
    if (groups.some((group) => group.length > 0)) {
      const moduleAlias = system.starModule?.alias || 'ChallengeModule';
      objects.push(
        serializeObjectEnvelope(
          system.starModule?.originalObject,
          moduleAlias,
          'StarChallengeModuleProperties',
          {
            ...(system.starModule?.extra || { ChallengesAlwaysAvailable: true }),
            Challenges: groups
          }
        )
      );
      system.starObjectives.forEach((objective) => {
        if (objective.implicit && objective.originalAlias) return;
        objects.push(serializeObjectEnvelope(objective.originalObject, objective.alias, objective.objclass, objective.objdata));
      });
      objects.push(...clone(system.opaqueStarObjects || []));
    }
  }

  if (!system.protectDirty) {
    objects.push(...clone(system.originalProtectObjects || []));
  } else if (system.protect) {
    objects.push(
      serializeObjectEnvelope(
        system.protect.originalObject,
        system.protect.alias || 'ProtectThePlant',
        'ProtectThePlantChallengeProperties',
        system.protect.objdata
      )
    );
  }

  return objects;
}

function desiredObjectiveRefs(system) {
  return {
    star: hasStarObjectiveModule(system)
      ? `RTID(${system.starModule?.alias || 'ChallengeModule'}@CurrentLevel)`
      : null,
    protect: system.protect ? `RTID(${system.protect.alias || 'ProtectThePlant'}@CurrentLevel)` : null
  };
}

export function updateObjectiveModuleRefs(refs, system) {
  if (!system?.dirty) return [...(refs || [])];
  const original = system?.originalModuleRefs || {};
  const desired = desiredObjectiveRefs(system || createEmptyObjectiveSystem());
  const replacements = new Map([
    [original.star, desired.star],
    [original.protect, desired.protect]
  ].filter(([reference]) => Boolean(reference)));
  const result = [];
  const inserted = new Set();

  (refs || []).forEach((reference) => {
    if (!replacements.has(reference)) {
      result.push(reference);
      return;
    }
    const replacement = replacements.get(reference);
    if (replacement && !inserted.has(replacement)) {
      result.push(replacement);
      inserted.add(replacement);
    }
  });

  ['star', 'protect'].forEach((kind) => {
    const reference = desired[kind];
    if (reference && !result.includes(reference)) result.push(reference);
  });
  return result;
}

export function createStarObjective(system, kind) {
  const definition = STAR_DEFINITIONS[kind];
  if (!definition) return null;
  const usedAliases = new Set([
    ...(system.starObjectives || []).map((objective) => objective.alias),
    ...(system.opaqueStarObjects || []).flatMap((object) => object?.aliases || []),
    system.protect?.alias
  ].filter(Boolean));
  const alias = uniqueAlias(definition.alias, usedAliases);
  return {
    id: `star:new:${alias}`,
    kind,
    alias,
    originalAlias: null,
    objclass: definition.objclass,
    objdata: clone(definition.defaults),
    originalObject: null,
    implicit: false,
    groupIndex: 0
  };
}

export function createProtectObjective(system) {
  const usedAliases = new Set([
    ...(system.starObjectives || []).map((objective) => objective.alias),
    ...(system.opaqueStarObjects || []).flatMap((object) => object?.aliases || [])
  ]);
  const alias = uniqueAlias('ProtectThePlant', usedAliases);
  return {
    id: 'protect',
    alias,
    originalAlias: null,
    objdata: { MustProtectCount: 1, Plants: [] },
    originalObject: null
  };
}
