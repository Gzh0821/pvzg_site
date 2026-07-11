const RULE_DEFINITIONS = {
  railcart: {
    objclass: 'RailcartProperties',
    alias: 'Rails',
    defaults: { RailcartType: 'railcart_cowboy', Railcarts: [], Rails: [] }
  },
  tide: {
    objclass: 'TideProperties',
    alias: 'Tide',
    defaults: { StartingWaveLocation: 5 }
  },
  planks: {
    objclass: 'PiratePlankProperties',
    alias: 'PiratePlanks',
    defaults: { PlankRows: [] }
  },
  powerTiles: {
    objclass: 'PowerTileProperties',
    alias: 'FutureLinkedTileGroups',
    defaults: { LinkedTiles: [] }
  }
};

const RULE_KIND_BY_CLASS = Object.fromEntries(
  Object.entries(RULE_DEFINITIONS).map(([kind, definition]) => [definition.objclass, kind])
);

export const BOARD_RULE_KINDS = Object.keys(RULE_DEFINITIONS);
export const POWER_TILE_GROUPS = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];

export function normalizeBoardCoordinate(value, maximum) {
  return Math.min(maximum, Math.max(0, Math.round(Number(value) || 0)));
}

export function getRuleRails(rule) {
  return Array.isArray(rule?.objdata?.Rails) ? rule.objdata.Rails : [];
}

export function getRuleRailcarts(rule) {
  return Array.isArray(rule?.objdata?.Railcarts) ? rule.objdata.Railcarts : [];
}

export function getRulePowerTiles(rule) {
  return Array.isArray(rule?.objdata?.LinkedTiles) ? rule.objdata.LinkedTiles : [];
}

export function getPowerTileAt(rule, row, col) {
  return getRulePowerTiles(rule).find(
    (tile) => Number(tile?.Location?.mX) === col && Number(tile?.Location?.mY) === row
  );
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function parseCurrentLevelAlias(value) {
  return /^RTID\((.+)@CurrentLevel\)$/.exec(String(value || ''))?.[1] || '';
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

function uniqueAlias(preferred, usedAliases) {
  if (!usedAliases.has(preferred)) return preferred;
  let index = 2;
  while (usedAliases.has(`${preferred}${index}`)) index += 1;
  return `${preferred}${index}`;
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

export function createEmptyBoardRuleSystem() {
  return {
    dirty: false,
    ownedObjectIndexes: [],
    originalObjects: [],
    modules: []
  };
}

export function parseBoardRuleSystem(raw) {
  const objects = Array.isArray(raw?.objects) ? raw.objects : [];
  const level = objects.find((object) => object?.objclass === 'LevelDefinition')?.objdata || {};
  const refs = Array.isArray(level.Modules) ? level.Modules.map(String) : [];
  const aliasIndex = getAliasIndex(objects);
  const system = createEmptyBoardRuleSystem();

  refs.forEach((reference, refIndex) => {
    const alias = parseCurrentLevelAlias(reference);
    const match = alias ? aliasIndex.get(alias) : null;
    const kind = match ? RULE_KIND_BY_CLASS[match.object?.objclass] : '';
    if (!kind) return;
    system.ownedObjectIndexes.push(match.objectIndex);
    system.modules.push({
      id: `board-rule:${refIndex}:${alias}`,
      kind,
      alias,
      originalAlias: alias,
      originalRef: reference,
      objclass: match.object.objclass,
      objdata: clone(match.object.objdata || {}),
      originalObject: clone(match.object),
      dirty: false
    });
  });

  system.ownedObjectIndexes = [...new Set(system.ownedObjectIndexes)].sort((left, right) => left - right);
  system.originalObjects = system.ownedObjectIndexes.map((index) => clone(objects[index]));
  return system;
}

export function serializeBoardRuleSystem(system) {
  if (!system?.dirty) return clone(system?.originalObjects || []);
  return (system.modules || []).map((module) =>
    module.dirty || !module.originalObject
      ? serializeObjectEnvelope(module.originalObject, module.alias, module.objclass, module.objdata)
      : clone(module.originalObject)
  );
}

export function updateBoardRuleModuleRefs(refs, system) {
  if (!system?.dirty) return [...(refs || [])];
  const currentByOriginalRef = new Map(
    (system.modules || []).filter((module) => module.originalRef).map((module) => [module.originalRef, module])
  );
  const originalRefs = new Set(
    (system.modules || []).map((module) => module.originalRef).filter(Boolean)
  );
  for (const object of system.originalObjects || []) {
    for (const alias of object?.aliases || []) originalRefs.add(`RTID(${alias}@CurrentLevel)`);
  }
  const result = [];

  (refs || []).forEach((reference) => {
    if (!originalRefs.has(reference)) {
      result.push(reference);
      return;
    }
    const module = currentByOriginalRef.get(reference);
    if (module) result.push(`RTID(${module.alias}@CurrentLevel)`);
  });

  (system.modules || [])
    .filter((module) => !module.originalRef)
    .forEach((module) => result.push(`RTID(${module.alias}@CurrentLevel)`));
  return result;
}

export function createBoardRule(system, kind) {
  const definition = RULE_DEFINITIONS[kind];
  if (!definition) return null;
  const usedAliases = new Set((system.modules || []).map((module) => module.alias));
  const alias = uniqueAlias(definition.alias, usedAliases);
  return {
    id: `board-rule:new:${alias}`,
    kind,
    alias,
    originalAlias: null,
    originalRef: null,
    objclass: definition.objclass,
    objdata: clone(definition.defaults),
    originalObject: null,
    dirty: true
  };
}
