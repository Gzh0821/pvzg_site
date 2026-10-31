import { resolveEndlessDesigner } from './endless-codec.mjs';

const numbers = (keys) => keys.split(' ').map(key => ({ key, kind: 'number' }));
const curves = (keys) => keys.split(' ').map(key => ({ key, kind: 'curve', offset: /Column|^First|^StrikeStartWave/.test(key) ? 1 : 0 }));
const list = (key, kind, extra = {}) => ({ key, kind, ...extra });
const level = { key: 'LevelRange', kind: 'range' };
const grave = numbers('MinGravestoneCount BaseGravestoneCountPerLevel MaxGeneratedGravestones MinStartingGravestoneSpawnCol MaxStartingGravestoneSpawnCol MaxStartingGravestoneSpawnColOffsetPerLevel MinEndingGravestoneSpawnCol MaxEndingGravestoneSpawnCol MaxEndingGravestoneSpawnColOffsetPerLevel');
const graveEvents = numbers('WaveMinPerFlag WaveMaxPerFlagBase WaveMaxPerFlagIncrementPerLevel WaveMaxPerFlagSlope GravestonesMinPerSpawnEvent GravestonesMaxPerSpawnEventBase GravestonesMaxPerSpawnEventIncrementPerLevel GravestonesMaxPerSpawnEventSlope BeneficialGravestonesPerSpawnEventMin BeneficialGravestonesPerSpawnEventMax ChanceThatBeneficialGravestoneIsPlantfoodNotSun GravestoneSpawnColumnMax GravestoneSpawnColumnMinBase GravestoneSpawnColumnMinIncrementPerLevel GravestoneSpawnColumnMinLowerLimit GravestoneSpawnColumnMinUpperLimit').map(spec => ({ ...spec, offset: ['GravestoneSpawnColumnMinBase', 'GravestoneSpawnColumnMinLowerLimit', 'GravestoneSpawnColumnMinUpperLimit'].includes(spec.key) ? 1 : 0 }));
// These are fields read by 0.16.1, not every field present in the resource files.
const storm = numbers('BaseSandstormCount BaseSandstormCountPerLevel MinSandstormCountPerLevel MaxSandstormsPerFlagWave BaseSandstormZombiesCount BaseSandstormZombiesCountPerLevel MaxSandstormZombies MinStartingSandstormSpawnCol MaxStartingSandstormSpawnCol MaxStartingSandstormSpawnColOffsetPerLevel MinEndingSandstormSpawnCol MaxEndingSandstormSpawnCol MaxEndingSandstormSpawnColOffsetPerLevel');
const rain = [...numbers('BaseSpiderRainCount MaxSpiderRainCount BaseSpiderRainCountPerLevel BaseSpiderRainZombieCount MaxSpiderRainZombies BaseSpiderRainZombiesCountPerLevel'), { key: 'BaseSpiderRainStartWave', kind: 'number', offset: 1 }, list('ZombiesToBringWith', 'zombies')];
export const ENDLESS_RULE_FIELDS = {
  DangerRoomGravestoneGenerator: [...grave, list('Type', 'grid'), list('Types', 'grids')],
  DangerRoomKongfuRackGenerator: [...grave, list('Type', 'grid'), list('Types', 'grids')],
  DangerRoomGravestoneEventGenerator: [...graveEvents, list('Types', 'grids')],
  DangerRoomKongfuRackEventGenerator: [...graveEvents, list('Types', 'grids')],
  DangerRoomNecromancyEventGenerator: [...numbers('WaveMinPerFlag WaveMaxPerFlagBase WaveMaxPerFlagIncrementPerLevel WaveMaxPerFlagSlope ZombieMinPerNecromancy ZombieMaxPerNecromancyBase ZombieMaxPerNecromancyIncrementPerLevel ZombieMaxPerNecromancySlope'), list('SpawnZombieType', 'zombie')],
  DangerRoomSandstormDesigner: storm,
  DangerRoomSnowstormDesigner: storm,
  DangerRoomRaidingPartyDesigner: [...numbers('BasePartyCount BasePartyCountPerLevel BasePartyZombiesCount BasePartyZombiesCountPerLevel MaxPartyZombies MaxPartyCount TimeBetweenGroups'), { key: 'BasePartyStartWave', kind: 'number', offset: 1 }, list('ZombieType', 'zombieRef'), list('WaveStartMessage', 'text')],
  DangerRoomSpiderRainDesigner: rain,
  DangerRoomParachuteRainDesigner: rain,
  DangerRoomParachuteVeteranRainDesigner: rain,
  DangerRoomPlankDesigner: [list('PlankLayouts', 'laneLayouts')],
  DangerRoomRailcartDesigner: [...numbers('BaseRailcartCount BaseRailcartCountPerLevel MaxGeneratedRailcarts'), list('Layouts', 'railLayouts')],
  DangerRoomPowerTileDesigner: [...numbers('BaseTileSetCount BaseTileSetCountPerLevel MaxTileSetCount ColumnCount'), list('TileSetLayouts', 'tileLayouts')],
  DangerRoomSliderTileDesigner: [list('SliderTileLayouts', 'sliderLayouts')],
  GridItemPatternPlacer: [list('GridItemSpawnerPatterns', 'patterns')],
  DangerRoomConveyorDesignerProperties: [list('InitialPlantList', 'conveyor')],
  DangerRoomFreezingWindDesigner: [level, ...curves('LaneCountMin LaneCountMax WavePercent DoubleBlastPercent')],
  DangerRoomLightningDesigner: [level, ...curves('LinkedPlantCountMin LinkedPlantCountMax ThunderCountMin ThunderCountMax WaveLightningChance')],
  DangerRoomDropShipDesigner: [level, ...curves('ImpColumnMin ImpColumnMax ImpCountMin ImpCountMax WaveDropShipChance')],
  DangerRoomIceBlockDesigner: [level, ...curves('PlantColumnMin PlantColumnMax ZombieColumnMin ZombieColumnMax BlocksMin BlocksMax'), list('PctGoodBlocks', 'range'), list('PlantTypeNames', 'plants'), list('ZombieTypeNames', 'zombies')],
  DangerRoomJamDesigner: [...numbers('LevelToIntroduceMetalJam'), level, ...curves('JamTypesMin JamTypesMax FirstJamWavesMin FirstJamWavesMax NextJamWavesMin NextJamWavesMax'), list('ZombieAddLevelRange', 'range'), ...curves('JamZombiesToReplaceMin JamZombiesToReplaceMax')],
  DangerRoomQigongStrikeDesigner: [level, ...curves('StrikeCountMin StrikeCountMax StrikeStartWaveMin StrikeStartWaveMax StrikeIntervalWaveMin StrikeIntervalWaveMax ZombieCountMin ZombieCountMax MinColumn MaxColumn'), list('ZombieType', 'zombie'), list('WaveStartMessage', 'text')],
  DangerRoomPortalDesigner: [level, ...curves('PortalTypesMin PortalTypesMax FirstPortalWavesMin FirstPortalWavesMax NextPortalWavesMin NextPortalWavesMax PortalCountInWaveMin PortalCountInWaveMax ColumnToSpawnMin ColumnToSpawnMax ZombiesToSpawnMin ZombiesToSpawnMax'), list('PortalOptions', 'portals')],
  DangerRoomDinoDesigner: [level, ...curves('DinoTypesMin DinoTypesMax FirstDinoWavesMin FirstDinoWavesMax NextDinoWavesMin NextDinoWavesMax DinoCountInWaveMin DinoCountInWaveMax')],
  DangerRoomBeachTideChanger: [...'StartingTideLevel FinalTideLevel MinimumTideLevel MaximumTideLevel MinimumTideDelta MaximumTideDelta LowTideEventsPerFlagWave LowTideStartLevel LowTideRecedeAmount BasicLowTideZombiesPerLowTideEvent SpecialLowTideZombiesPerLowTideEvent'.split(' ').map(key => list(key, 'bounds')), list('BasicLowTideZombieType', 'zombie'), list('SpecialLowTideZombieTypes', 'zombies')],
  DangerRoomBeachLilypadPlacer: [...'NumberOfLilypads MinimumLilypadColumn MaximumLilypadColumn'.split(' ').map(key => list(key, 'bounds'))]
};

export function localizeEndlessRule(module, reference, objects, sharedObjects, reservedAliases = []) {
  const source = resolveEndlessDesigner(reference, objects, sharedObjects);
  if (!source || !reference.endsWith('@LevelModules)')) return reference;
  const used = new Set([...reservedAliases, ...objects.flatMap(object => object?.aliases || [])]);
  const stem = source.aliases?.[0] || 'EndlessRule';
  let alias = `${stem}Local`, suffix = 2;
  while (used.has(alias)) alias = `${stem}Local${suffix++}`;
  const object = JSON.parse(JSON.stringify(source));
  object.aliases = [alias];
  const local = `RTID(${alias}@CurrentLevel)`;
  objects.push(object);
  module.objdata.LevelDesigners = module.objdata.LevelDesigners.map(ref => ref === reference ? local : ref);
  return local;
}

// Preserve scalar representation and unknown siblings; opening a control never writes defaults.
export function setEndlessRuleNumber(data, path, input, offset = 0) {
  const keys = path.split('.');
  let target = data;
  for (const key of keys.slice(0, -1)) {
    if (input === '' && (!target[key] || typeof target[key] !== 'object')) return;
    if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) target[key] = {};
    target = target[key];
  }
  const key = keys.at(-1);
  if (input === '') {
    if (keys.length === 1 && path !== 'TimeBetweenGroups') target[key] = '';
    else delete target[key];
  }
  else {
    const value = Number(input) - offset;
    target[key] = typeof target[key] === 'string' ? String(value) : value;
  }
}

export function getEndlessBoundValue(bound, floor, maximum = Infinity, minimum = 0) {
  let lower = Number(bound?.LowerLimit?.Value), upper = Number(bound?.UpperLimit?.Value);
  if (Number.isNaN(lower) || lower < minimum) lower = minimum;
  if (Number.isNaN(upper) || upper > maximum) upper = maximum;
  let value = (Number(bound?.YIntercept) || 0) + floor * (Number(bound?.SlopeCoefficient) || 0);
  if (value > upper) value = upper;
  if (value < lower) value = lower;
  return value;
}

const numeric = value => ['number', 'string'].includes(typeof value) && String(value).trim() !== '' && Number.isFinite(Number(value));
function fieldProblems(field, data) {
  const value = data?.[field.key];
  const required = ['number', 'curve', 'range', 'conveyor', 'tileLayouts', 'sliderLayouts'].includes(field.kind) && !['TimeBetweenGroups', 'LevelToIntroduceMetalJam'].includes(field.key);
  const bad = path => [[path, path.split('.').reduce((value, key) => value?.[key], data)]];
  if (value === undefined) return required ? bad(field.key) : [];
  if (field.kind === 'number') return numeric(value) ? [] : bad(field.key);
  if (field.kind === 'curve' || field.kind === 'range') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return bad(field.key);
    const problems = ['Min', 'Max'].flatMap(key => numeric(value[key]) ? [] : bad(`${field.key}.${key}`));
    if (!problems.length && ['LevelRange', 'ZombieAddLevelRange'].includes(field.key) && Number(value.Min) === Number(value.Max)) return bad(field.key);
    if (!problems.length && /^(NextDinoWaves|NextPortalWaves|StrikeIntervalWave)/.test(field.key) && (Number(value.Min) < 1 || Number(value.Max) < 1)) return bad(field.key);
    return problems;
  }
  if (field.kind === 'bounds' || field.kind === 'conveyor') {
    const bounds = field.kind === 'bounds' ? ['LowerBound', 'UpperBound'].map(key => [key, value?.[key]])
      : Array.isArray(value) ? value.flatMap((item, index) => ['MinCount', 'MaxCount', 'Weight', 'MinWeightFactor', 'MaxWeightFactor'].map(key => [`${index}.${key}`, item?.[key]])) : null;
    if (!bounds) return bad(field.key);
    const malformedMembers = field.kind === 'conveyor' ? value.flatMap((item, index) => !item || typeof item !== 'object' || Array.isArray(item) || typeof item.PlantType !== 'string' || !item.PlantType ? bad(`${field.key}.${index}`) : []) : [];
    return [...malformedMembers, ...bounds.flatMap(([prefix, bound]) => {
      if (bound === undefined) return [];
      if (!bound || typeof bound !== 'object' || Array.isArray(bound)) return bad(`${field.key}.${prefix}`);
      return ['YIntercept', 'SlopeCoefficient', 'LowerLimit.Value', 'UpperLimit.Value'].flatMap(key => {
        const value = key.split('.').reduce((value, part) => value?.[part], bound);
        return value === undefined || numeric(value) ? [] : bad(`${field.key}.${prefix}.${key}`);
      });
    })];
  }
  if (['plants', 'zombies', 'grids', 'patterns', 'portals', 'laneLayouts', 'railLayouts', 'tileLayouts', 'sliderLayouts'].includes(field.kind)) {
    if (!Array.isArray(value)) return bad(field.key);
    if (['sliderLayouts', 'tileLayouts'].includes(field.kind) && !value.length) return bad(field.key);
    if (['laneLayouts', 'railLayouts'].includes(field.kind)) return value.flatMap((row, i) => typeof row === 'string' && (field.kind === 'laneLayouts' ? /^[01]{5}$/ : /^[0-9]{5}$/).test(row) ? [] : bad(`${field.key}.${i}`));
    if (field.kind === 'tileLayouts') return value.flatMap((layout, i) => Array.isArray(layout) && layout.length && layout.every(row => typeof row === 'string' && /^[01]+$/.test(row) && row.length === layout[0].length) && layout.length <= 5 && layout[0].length <= 9 ? [] : bad(`${field.key}.${i}`));
    if (field.kind === 'sliderLayouts') return value.flatMap((layout, i) => !Array.isArray(layout?.Layout) ? bad(`${field.key}.${i}`) : layout.Layout.flatMap((cell, j) => cell && Number.isInteger(cell.GridX) && cell.GridX >= 0 && cell.GridX <= 8 && Number.isInteger(cell.GridY) && cell.GridY >= 0 && cell.GridY <= 4 && ['slider_up', 'slider_down'].includes(cell.TypeName) ? [] : bad(`${field.key}.${i}.Layout.${j}`)));
    return value.flatMap((item, i) => typeof item === 'string' && item.length ? [] : bad(`${field.key}.${i}`));
  }
  return typeof value === 'string' ? [] : bad(field.key);
}

export function getEndlessRuleIssues(module, objects, sharedObjects, originalModule, originalObjects = []) {
  const referenced = (room, local) => [...new Set([...new Set(room?.objdata?.LevelDesigners || [])].map(ref => resolveEndlessDesigner(ref, local, sharedObjects)).filter(Boolean))];
  const problems = object => (ENDLESS_RULE_FIELDS[object.objclass] || []).flatMap(field => fieldProblems(field, object.objdata));
  const inherited = new Map();
  const signature = (object, problem) => JSON.stringify([object.objclass, ...problem]);
  for (const object of referenced(originalModule, originalObjects)) for (const problem of problems(object)) {
    const key = signature(object, problem);
    inherited.set(key, (inherited.get(key) || 0) + 1);
  }
  return referenced(module, objects).flatMap(object => problems(object).map(problem => {
    const key = signature(object, problem), count = inherited.get(key) || 0;
    if (count) inherited.set(key, count - 1);
    return { field: problem[0].split('.')[0], alias: object.aliases?.[0] || object.objclass, inherited: count > 0 };
  }));
}
