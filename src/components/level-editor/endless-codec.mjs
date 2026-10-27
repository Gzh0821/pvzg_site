export const ENDLESS_MODULE_CLASSES = ['DangerRoomModuleProperties', 'DangerRoomMiniGameModuleProperties'];
// Only the class names consumed by 0.16.1 readDangerroomDesigners.
export const ENDLESS_DESIGNER_CLASSES = [
  'DangerRoomJitteredWaveGenerator', 'DangerRoomKongfuRackGenerator', 'DangerRoomGravestoneGenerator',
  'DangerRoomKongfuRackEventGenerator', 'DangerRoomGravestoneEventGenerator', 'DangerRoomNecromancyEventGenerator',
  'DangerRoomSandstormDesigner', 'DangerRoomSnowstormDesigner', 'DangerRoomPlankDesigner', 'DangerRoomRaidingPartyDesigner',
  'DangerRoomRailcartDesigner', 'DangerRoomSpiderRainDesigner', 'DangerRoomParachuteRainDesigner', 'DangerRoomParachuteVeteranRainDesigner',
  'DangerRoomPowerTileDesigner', 'DangerRoomBeachTideChanger', 'DangerRoomBeachLilypadPlacer', 'DangerRoomSliderTileDesigner',
  'GridItemPatternPlacer', 'DangerRoomConveyorDesignerProperties', 'DangerRoomFreezingWindDesigner', 'DangerRoomLightningDesigner',
  'DangerRoomDropShipDesigner', 'DangerRoomIceBlockDesigner', 'DangerRoomJamDesigner', 'DangerRoomQigongStrikeDesigner',
  'DangerRoomPortalDesigner', 'DangerRoomDinoDesigner'
];

export function createEndlessLevel(template, name, description) {
  const level = JSON.parse(JSON.stringify(template));
  const definition = level.objects.find((object) => object.objclass === 'LevelDefinition').objdata;
  definition.Name = name;
  definition.Description = description;
  return level;
}

export function getEndlessModule(objects, definition) {
  const cls = definition.IsDangerRoomMiniGame ? ENDLESS_MODULE_CLASSES[1] : definition.IsDangerRoom ? ENDLESS_MODULE_CLASSES[0] : null;
  const matches = cls ? objects.filter((object) => object?.objclass === cls) : [];
  return matches[matches.length - 1] || null;
}

export function getEndlessWaveLimit(data, floor, mini = false) {
  const maximum = Number(data?.MaxFlagWave) > 0 ? Number(data.MaxFlagWave) : mini ? 2 : 4;
  return 10 * Math.ceil(Math.min(maximum, Math.max(1, Math.floor(Number(floor) || 1)) / 4));
}

export function getEndlessWaveBudget(data, floor, index) {
  const values = [data?.StartingPoints, data?.BasePointIncrementPerWave, data?.BasePointIncrementPerLevel];
  if (values.some((value) => value == null || value === '' || !Number.isFinite(Number(value)))) return null;
  const suppliedCap = Number(data.MaxPointPerWave);
  const cap = Number.isNaN(suppliedCap) ? Infinity : suppliedCap;
  const growth = data.BasePointIncrementPerWave + data.BasePointIncrementPerLevel * floor;
  const points = Math.min(cap, data.StartingPoints + growth * index);
  return (index + 1) % 10 === 0 ? points * 2.5 : points;
}

export function resolveEndlessDesigner(reference, objects, sharedObjects) {
  const match = /^RTID\((.+)@(CurrentLevel|LevelModules)\)$/.exec(String(reference));
  if (!match) return null;
  return (match[2] === 'CurrentLevel' ? objects : sharedObjects).find((object) => object?.aliases?.includes(match[1])) || null;
}

export function getEndlessIssues(objects, definition, originalObjects = [], originalDefinition = {}) {
  const mode = definition.IsDangerRoomMiniGame || definition.IsDangerRoom;
  if (!mode) return [];
  const module = getEndlessModule(objects, definition), original = getEndlessModule(originalObjects, originalDefinition);
  if (!module) return [{ field: 'module', inherited: !!(originalDefinition.IsDangerRoomMiniGame || originalDefinition.IsDangerRoom) && !original }];
  const data = module.objdata || {}, invalid = [];
  if (!data.WorldSpecificProperties || typeof data.WorldSpecificProperties !== 'string') invalid.push('WorldSpecificProperties');
  if (!Array.isArray(data.LevelDesigners) || !data.LevelDesigners.length) invalid.push('LevelDesigners');
  if (data.MaxFlagWave != null && (!Number.isFinite(Number(data.MaxFlagWave)) || Number(data.MaxFlagWave) <= 0)) invalid.push('MaxFlagWave');
  for (const field of ['InitialPlants', 'ExcludePlants']) {
    if (data[field] != null && !Array.isArray(data[field])) invalid.push(field);
  }
  return invalid.map((field) => ({ field, inherited: !!original && JSON.stringify(original.objdata?.[field]) === JSON.stringify(data[field]) }));
}
