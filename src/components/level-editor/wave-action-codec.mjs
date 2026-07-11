const ACTION_DEFINITIONS = {
  tide: {
    objclass: 'TidalChangeWaveActionProps',
    labelKey: 'actionTide',
    alias: (wave) => `Wave${wave}TidalChangeEvent0`,
    defaults: { TidalChange: { ChangeAmount: 3, ChangeType: 'absolute' } }
  },
  dino: {
    objclass: 'DinoWaveActionProps',
    labelKey: 'actionDino',
    alias: (wave) => `Wave${wave}DinoTimeEvent0`,
    defaults: { DinoRow: 2, DinoType: 'raptor', DinoWaveDuration: 0 }
  },
  storm: {
    objclass: 'StormZombieSpawnerProps',
    labelKey: 'actionStorm',
    alias: (wave) => `Wave${wave}StormEvent0`,
    defaults: {
      ColumnStart: 4,
      ColumnEnd: 8,
      GroupSize: 2,
      TimeBetweenGroups: 2,
      Type: 'sandstorm',
      Zombies: [{ Type: 'RTID(mummy@ZombieTypes)' }, { Type: 'RTID(mummy@ZombieTypes)' }]
    }
  },
  ground: {
    objclass: 'SpawnZombiesFromGroundSpawnerProps',
    labelKey: 'actionGround',
    alias: (wave) => `Wave${wave}GroundSpawnEvent0`,
    defaults: {
      ColumnStart: 4,
      ColumnEnd: 8,
      RowStart: 0,
      RowEnd: 4,
      Zombies: [{ Type: 'RTID(mummy@ZombieTypes)' }, { Type: 'RTID(mummy@ZombieTypes)' }]
    }
  },
  frostWind: {
    objclass: 'FrostWindWaveActionProps',
    labelKey: 'actionFrostWind',
    alias: (wave) => `Wave${wave}FrostWindEvent0`,
    defaults: { Winds: [{ Direction: 'right', Row: 2 }] }
  },
  beachAmbush: {
    objclass: 'BeachStageEventZombieSpawnerProps',
    labelKey: 'actionBeachAmbush',
    alias: (wave) => `Wave${wave}BeachAmbushEvent0`,
    defaults: {
      ZombieName: 'beach',
      ZombieCount: 3,
      ColumnStart: 4,
      ColumnEnd: 8,
      GroupSize: 1,
      TimeBeforeFullSpawn: 0.5,
      TimeBetweenGroups: 0.25
    }
  },
  raidingParty: {
    objclass: 'RaidingPartyZombieSpawnerProps',
    labelKey: 'actionRaidingParty',
    alias: (wave) => `Wave${wave}RaidingPartyEvent0`,
    defaults: {
      ZombieType: 'RTID(pirate_swashbuckler@ZombieTypes)',
      SwashbucklerCount: 5,
      GroupSize: 1,
      TimeBetweenGroups: 1
    }
  },
  spiderRain: {
    objclass: 'SpiderRainZombieSpawnerProps',
    labelKey: 'actionSpiderRain',
    alias: (wave) => `Wave${wave}SpiderRainEvent0`,
    defaults: {
      ColumnEnd: 7,
      ColumnStart: 1,
      GroupSize: 1,
      SpiderCount: 5,
      SpiderZombieName: 'future_imp',
      TimeBeforeFullSpawn: 2,
      TimeBetweenGroups: 0.25,
      WaveStartMessage: '[WARNING_SPIDERRAIN]',
      ZombieFallTime: 1.5
    }
  },
  parachuteRain: {
    objclass: 'ParachuteRainZombieSpawnerProps',
    labelKey: 'actionParachuteRain',
    alias: (wave) => `Wave${wave}ParachuteRainEvent0`,
    defaults: {
      ColumnEnd: 8,
      ColumnStart: 4,
      GroupSize: 1,
      SpiderCount: 4,
      SpiderZombieName: 'lostcity_lostpilot',
      TimeBeforeFullSpawn: 1,
      TimeBetweenGroups: 0.25,
      WaveStartMessage: '[WARNING_PARACHUTERAIN]',
      ZombieFallTime: 1.5
    }
  },
  gravestones: {
    objclass: 'SpawnGravestonesWaveActionProps',
    labelKey: 'actionGravestones',
    alias: (wave) => `Wave${wave}GravestoneEvent0`,
    defaults: {
      GravestonePool: [{ Count: 3, Type: 'RTID(gravestone_egypt@GridItemTypes)' }],
      SpawnEffectAnimID: 'POPANIM_EFFECTS_TOMBSTONE_DARK_SPAWN_EFFECT',
      SpawnPositionsPool: Array.from({ length: 5 }, (_, row) => ({ mX: 5, mY: row })),
      SpawnSoundID: 'Play_Zomb_Egypt_TombRaiser_Grave_Rise',
      maxX: 8,
      minX: 3
    }
  },
  gridItemSpawn: {
    objclass: 'SpawnZombiesFromGridItemSpawnerProps',
    labelKey: 'actionGridItemSpawn',
    alias: (wave) => `Wave${wave}GridItemSpawnEvent0`,
    defaults: {
      AdditionalPlantfood: 0,
      GridTypes: ['RTID(gravestone_egypt@GridItemTypes)'],
      WaveStartMessage: '',
      ZombieSpawnWaitTime: 0,
      Zombies: [{ Type: 'RTID(mummy@ZombieTypes)' }]
    }
  },
  dropShip: {
    objclass: 'DropShipZombieSpawnerProps',
    labelKey: 'actionDropShip',
    alias: (wave) => `Wave${wave}DropShipEvent0`,
    defaults: {
      DropShipPosition: { mX: 4, mY: 2 },
      DropShipType: 'sky_dropship',
      DropShipShiftedProperties: {
        ImpType: 'sky_imp',
        ImpCount: { Min: 4, Max: 4 },
        TimeBeforeFirst: { Min: 1, Max: 1 },
        TimeBetween: { Min: 2, Max: 2 },
        ImpLandingColumns: [0, 1],
        ImpLandingRows: [],
        ImpFlyingDuration: { Min: 3, Max: 3.5 }
      }
    }
  },
  thunderCharge: {
    objclass: 'ThunderChargeWaveActionProps',
    labelKey: 'actionThunderCharge',
    alias: (wave) => `Wave${wave}ThunderChargeEvent0`,
    defaults: {
      TimeBeforeFirst: { Min: 3, Max: 3 },
      TimeBetween: { Min: 3, Max: 3 },
      WaveStartMessage: '[WARNING_THUNDER_STRIKE]',
      Thunders: [
        { Sign: 1, LinkedPlantCount: 5 },
        { Sign: -1, LinkedPlantCount: 5 }
      ]
    }
  },
  qigongStrike: {
    objclass: 'QigongStrikeWaveActionProps',
    labelKey: 'actionQigongStrike',
    alias: (wave) => `Wave${wave}QigongStrikeEvent0`,
    defaults: {
      WaveStartMessage: '[WARNING_QIGONG_STRIKE]',
      Zombies: [{ Type: 'abbot_imp', Rows: [2], Columns: [5], Delay: 1 }]
    }
  },
  chiHole: {
    objclass: 'KongfuChiHoleProps',
    labelKey: 'actionChiHole',
    alias: (wave) => `Wave${wave}KongfuChiHoleEvent0`,
    defaults: {
      Direction: 1,
      LanesToAffect: [0, 1, 2, 3, 4],
      WaveStartMessage: '[WARNING_QIGONG_HOLE]',
      PlantMovingTimeBetweenSquares: 1,
      LifeSpan: 1.5,
      TimeBeforeAbsorbing: 1.5,
      Column: 8,
      SuppressesNextWave: true,
      SuppressObjectiveTip: false
    }
  },
  missileLocate: {
    objclass: 'MissileLocateWaveActionProps',
    labelKey: 'actionMissileLocate',
    alias: (wave) => `Wave${wave}MissileEvent0`,
    defaults: {
      ColumnEnd: 0,
      ColumnStart: 0,
      MissileCount: 1,
      MissileFallCountdown: 4,
      WaveStartMessage: '[WARNING_MISSILE]'
    }
  },
  waveWarning: {
    objclass: 'WaveWarningProps',
    labelKey: 'actionWaveWarning',
    alias: (wave) => `Wave${wave}Warning0`,
    defaults: {
      LabelR: 255,
      LabelG: 100,
      LabelB: 0,
      LabelAInit: 4,
      OutLineR: 0,
      OutLineG: 0,
      OutLineB: 0,
      String: 'WATCH OUT!',
      StringMultiLanguage: { en: 'WATCH OUT!', zh: '小心！' },
      Sound: 'HugeWave',
      LabelTargetScale: 0.5,
      LabelInitScale: 4,
      Duration: 3,
      InitTime: 0.33
    }
  }
};

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export const ADDABLE_WAVE_ACTIONS = Object.entries(ACTION_DEFINITIONS).map(([kind, definition]) => ({
  kind,
  objclass: definition.objclass,
  labelKey: definition.labelKey
}));

export const VISUAL_WAVE_ACTION_CLASSES = new Set([
  'SpawnZombiesJitteredWaveActionProps',
  'ModifyConveyorWaveActionProps',
  ...Object.values(ACTION_DEFINITIONS).map((definition) => definition.objclass)
]);

export function createWaveActionTemplate(kind, waveIndex) {
  const definition = ACTION_DEFINITIONS[kind];
  if (!definition) return null;
  return {
    alias: definition.alias(Math.max(1, Number(waveIndex) || 1)),
    objclass: definition.objclass,
    objdata: clone(definition.defaults)
  };
}

export function getWaveActionDefinitionByClass(objclass) {
  const match = Object.entries(ACTION_DEFINITIONS).find(([, definition]) => definition.objclass === objclass);
  return match ? { kind: match[0], ...match[1] } : null;
}

export function getFrostWindCount(objdata, row, direction) {
  return (Array.isArray(objdata?.Winds) ? objdata.Winds : []).filter(
    (wind) => Number(wind?.Row) === row && String(wind?.Direction || 'right') === direction
  ).length;
}

export function setFrostWindCount(objdata, row, direction, count) {
  const winds = Array.isArray(objdata?.Winds) ? objdata.Winds : [];
  const desired = Math.max(0, Math.round(Number(count) || 0));
  let retained = 0;
  const next = winds.filter((wind) => {
    if (Number(wind?.Row) !== row || String(wind?.Direction || 'right') !== direction) return true;
    retained += 1;
    return retained <= desired;
  });
  while (retained < desired) {
    next.push({ Direction: direction, Row: row });
    retained += 1;
  }
  objdata.Winds = next;
}

export function getFrostWindSummary(objdata) {
  const winds = Array.isArray(objdata?.Winds) ? objdata.Winds : [];
  return {
    count: winds.length,
    lanes: new Set(winds.map((wind) => Number(wind?.Row)).filter((row) => Number.isInteger(row) && row >= 0 && row <= 4)).size
  };
}

export function parseZombieTypeReference(value) {
  return /^RTID\((.+)@ZombieTypes\)$/.exec(String(value || ''))?.[1] || String(value || '');
}

export function getAirDropSummary(objdata) {
  return {
    zombie: String(objdata?.SpiderZombieName || ''),
    count: Math.max(0, Number(objdata?.SpiderCount) || 0),
    start: objdata?.ColumnStart ?? '-',
    end: objdata?.ColumnEnd ?? '-',
    companions: Array.isArray(objdata?.ZombiesToBringWith) ? objdata.ZombiesToBringWith.length : 0
  };
}

export function getAirDropCompanions(objdata) {
  return Array.isArray(objdata?.ZombiesToBringWith) ? objdata.ZombiesToBringWith : [];
}

export function addAirDropCompanion(objdata, type = 'mummy') {
  objdata.ZombiesToBringWith = [
    ...getAirDropCompanions(objdata),
    { mX: 4, mY: 2, Type: type }
  ];
}

export function updateAirDropCompanion(objdata, index, patch) {
  const companions = [...getAirDropCompanions(objdata)];
  if (!companions[index]) return;
  companions[index] = { ...companions[index], ...patch };
  objdata.ZombiesToBringWith = companions;
}

export function removeAirDropCompanion(objdata, index) {
  const companions = getAirDropCompanions(objdata).filter((_, itemIndex) => itemIndex !== index);
  if (companions.length) objdata.ZombiesToBringWith = companions;
  else delete objdata.ZombiesToBringWith;
}

export function parseGridItemTypeReference(value) {
  return /^RTID\((.+)@GridItemTypes\)$/.exec(String(value || ''))?.[1] || String(value || '');
}

export function toGridItemTypeReference(code) {
  return code ? `RTID(${code}@GridItemTypes)` : '';
}

export function getGravestonePool(objdata) {
  return Array.isArray(objdata?.GravestonePool) ? objdata.GravestonePool : [];
}

export function setGravestonePoolCount(objdata, index, count) {
  const pool = [...getGravestonePool(objdata)];
  if (!pool[index]) return;
  const nextCount = Math.max(0, Math.round(Number(count) || 0));
  pool[index] = { ...pool[index], Count: nextCount };
  objdata.GravestonePool = pool;
  if (Object.hasOwn(objdata, pool[index].Type)) objdata[pool[index].Type] = nextCount;
}

export function updateGravestonePoolType(objdata, index, code) {
  const pool = [...getGravestonePool(objdata)];
  if (!pool[index] || !code) return;
  const previousType = pool[index].Type;
  const nextType = toGridItemTypeReference(code);
  const hadMirror = Object.hasOwn(objdata, previousType);
  pool[index] = { ...pool[index], Type: nextType };
  objdata.GravestonePool = pool;
  if (hadMirror) {
    delete objdata[previousType];
    objdata[nextType] = pool[index].Count;
  }
}

export function addGravestonePoolEntry(objdata, code) {
  if (!code) return;
  const type = toGridItemTypeReference(code);
  const pool = getGravestonePool(objdata);
  const existingIndex = pool.findIndex((entry) => entry?.Type === type);
  if (existingIndex >= 0) {
    setGravestonePoolCount(objdata, existingIndex, Number(pool[existingIndex]?.Count || 0) + 1);
    return;
  }
  objdata.GravestonePool = [...pool, { Count: 1, Type: type }];
}

export function removeGravestonePoolEntry(objdata, index) {
  const pool = getGravestonePool(objdata);
  const entry = pool[index];
  if (!entry) return;
  objdata.GravestonePool = pool.filter((_, itemIndex) => itemIndex !== index);
  if (Object.hasOwn(objdata, entry.Type)) delete objdata[entry.Type];
}

export function getGravestonePositions(objdata) {
  return Array.isArray(objdata?.SpawnPositionsPool) ? objdata.SpawnPositionsPool : [];
}

export function hasGravestonePosition(objdata, column, row) {
  return getGravestonePositions(objdata).some(
    (position) => Number(position?.mX) === column && Number(position?.mY) === row
  );
}

export function setGravestonePosition(objdata, column, row, enabled) {
  const positions = getGravestonePositions(objdata);
  const exists = hasGravestonePosition(objdata, column, row);
  if (enabled && !exists) objdata.SpawnPositionsPool = [...positions, { mX: column, mY: row }];
  else if (!enabled && exists) {
    objdata.SpawnPositionsPool = positions.filter(
      (position) => Number(position?.mX) !== column || Number(position?.mY) !== row
    );
  }
}

export function getGravestoneSummary(objdata) {
  const pool = getGravestonePool(objdata);
  return {
    count: pool.reduce((sum, entry) => sum + Math.max(0, Number(entry?.Count) || 0), 0),
    types: pool.length,
    cells: getGravestonePositions(objdata).length
  };
}

export function getGridItemSpawnTypes(objdata) {
  return Array.isArray(objdata?.GridTypes) ? objdata.GridTypes : [];
}

export function addGridItemSpawnType(objdata, code) {
  if (!code) return;
  const type = toGridItemTypeReference(code);
  const types = getGridItemSpawnTypes(objdata);
  if (!types.includes(type)) objdata.GridTypes = [...types, type];
}

export function updateGridItemSpawnType(objdata, index, code) {
  if (!code) return;
  const types = [...getGridItemSpawnTypes(objdata)];
  if (index < 0 || index >= types.length) return;
  types[index] = toGridItemTypeReference(code);
  objdata.GridTypes = [...new Set(types)];
}

export function removeGridItemSpawnType(objdata, index) {
  objdata.GridTypes = getGridItemSpawnTypes(objdata).filter((_, itemIndex) => itemIndex !== index);
}

export function getGridItemSpawnSummary(objdata) {
  return {
    zombies: Array.isArray(objdata?.Zombies) ? objdata.Zombies.length : 0,
    sources: getGridItemSpawnTypes(objdata).length,
    plantfood: Math.max(0, Number(objdata?.AdditionalPlantfood) || 0)
  };
}

export function getDropShipProperties(objdata) {
  return objdata?.DropShipShiftedProperties && typeof objdata.DropShipShiftedProperties === 'object'
    ? objdata.DropShipShiftedProperties
    : {};
}

export function setDropShipRange(objdata, key, bound, value) {
  const properties = { ...getDropShipProperties(objdata) };
  properties[key] = {
    ...(properties[key] && typeof properties[key] === 'object' ? properties[key] : {}),
    [bound]: Math.max(0, Number(value) || 0)
  };
  objdata.DropShipShiftedProperties = properties;
}

export function getDropShipLandingValues(objdata, key) {
  const value = getDropShipProperties(objdata)?.[key];
  return Array.isArray(value) ? value : [];
}

export function setDropShipLandingValue(objdata, key, value, enabled) {
  const properties = { ...getDropShipProperties(objdata) };
  const values = getDropShipLandingValues(objdata, key);
  if (enabled && !values.includes(value)) properties[key] = [...values, value].sort((left, right) => left - right);
  else if (!enabled) properties[key] = values.filter((item) => item !== value);
  objdata.DropShipShiftedProperties = properties;
}

export function getDropShipSummary(objdata) {
  const properties = getDropShipProperties(objdata);
  return {
    zombie: String(properties.ImpType || ''),
    min: Math.max(0, Number(properties.ImpCount?.Min) || 0),
    max: Math.max(0, Number(properties.ImpCount?.Max) || 0),
    column: Number(objdata?.DropShipPosition?.mX || 0) + 1,
    row: Number(objdata?.DropShipPosition?.mY || 0) + 1
  };
}

export function getThunderCharges(objdata) {
  return Array.isArray(objdata?.Thunders) ? objdata.Thunders : [];
}

export function addThunderCharge(objdata, sign = 1) {
  objdata.Thunders = [...getThunderCharges(objdata), { Sign: sign < 0 ? -1 : 1, LinkedPlantCount: 5 }];
}

export function updateThunderCharge(objdata, index, patch) {
  const charges = [...getThunderCharges(objdata)];
  if (!charges[index]) return;
  charges[index] = { ...charges[index], ...patch };
  objdata.Thunders = charges;
}

export function removeThunderCharge(objdata, index) {
  objdata.Thunders = getThunderCharges(objdata).filter((_, itemIndex) => itemIndex !== index);
}

export function getThunderSummary(objdata) {
  const charges = getThunderCharges(objdata);
  return {
    count: charges.length,
    positive: charges.filter((charge) => Number(charge?.Sign) >= 0).length,
    negative: charges.filter((charge) => Number(charge?.Sign) < 0).length
  };
}

export function getQigongStrikes(objdata) {
  return Array.isArray(objdata?.Zombies) ? objdata.Zombies : [];
}

export function addQigongStrike(objdata, type = 'abbot_imp') {
  objdata.Zombies = [...getQigongStrikes(objdata), { Type: type, Rows: [2], Columns: [5], Delay: 1 }];
}

export function updateQigongStrike(objdata, index, patch) {
  const strikes = [...getQigongStrikes(objdata)];
  if (!strikes[index]) return;
  strikes[index] = { ...strikes[index], ...patch };
  objdata.Zombies = strikes;
}

export function removeQigongStrike(objdata, index) {
  objdata.Zombies = getQigongStrikes(objdata).filter((_, itemIndex) => itemIndex !== index);
}

export function getQigongSummary(objdata) {
  return { count: getQigongStrikes(objdata).length };
}

export function getChiHoleLanes(objdata) {
  return Array.isArray(objdata?.LanesToAffect) ? objdata.LanesToAffect : [];
}

export function setChiHoleLane(objdata, lane, enabled) {
  const lanes = getChiHoleLanes(objdata);
  if (enabled && !lanes.includes(lane)) objdata.LanesToAffect = [...lanes, lane].sort((left, right) => left - right);
  else if (!enabled) objdata.LanesToAffect = lanes.filter((value) => value !== lane);
}

export function getChiHoleSummary(objdata) {
  return {
    column: Number(objdata?.Column || 0) + 1,
    lanes: getChiHoleLanes(objdata).length,
    direction: Number(objdata?.Direction || 0)
  };
}

export function getMissileLocateSummary(objdata) {
  return {
    count: Math.max(0, Number(objdata?.MissileCount) || 0),
    start: Number(objdata?.ColumnStart || 0) + 1,
    end: Number(objdata?.ColumnEnd || 0) + 1,
    countdown: Math.max(0, Number(objdata?.MissileFallCountdown) || 0)
  };
}

export function getWaveWarningSummary(objdata) {
  const localized = objdata?.StringMultiLanguage && typeof objdata.StringMultiLanguage === 'object'
    ? objdata.StringMultiLanguage
    : {};
  return {
    message: String(localized.zh || localized.en || objdata?.String || ''),
    duration: Math.max(0, Number(objdata?.Duration) || 0)
  };
}

export function setWaveWarningMessage(objdata, language, value) {
  const messages = objdata?.StringMultiLanguage && typeof objdata.StringMultiLanguage === 'object'
    ? { ...objdata.StringMultiLanguage }
    : {};
  messages[language] = String(value || '');
  objdata.StringMultiLanguage = messages;
}
