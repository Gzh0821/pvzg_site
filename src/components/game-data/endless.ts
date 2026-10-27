import egypt from './raw/Levels/endless/egypt.json';
import pirate from './raw/Levels/endless/pirate.json';
import cowboy from './raw/Levels/endless/cowboy.json';
import future from './raw/Levels/endless/future.json';
import dark from './raw/Levels/endless/dark.json';
import beach from './raw/Levels/endless/beach.json';
import iceage from './raw/Levels/endless/iceage.json';
import lostcity from './raw/Levels/endless/lostcity.json';
import eighties from './raw/Levels/endless/eighties.json';
import dino from './raw/Levels/endless/dino.json';
import modern from './raw/Levels/endless/modern.json';
import kongfu from './raw/Levels/endless/kongfu.json';
import sky from './raw/Levels/endless/sky.json';
import modules from './raw/Objects/LevelModules.json';
import sheets from './raw/Objects/PropertySheets.json';

export const endlessTemplates = Object.entries({ egypt, pirate, cowboy, future, dark, beach, iceage, lostcity, eighties, dino, modern, kongfu, sky }).map(([world, level]) => ({ world, level }));
export const endlessSharedObjects = modules.objects;
const canonicalProgressRefs = new Set(endlessTemplates.map(({ level }) =>
  level.objects.find((object) => object.objclass === 'DangerRoomModuleProperties')?.objdata.WorldSpecificProperties));
export const endlessProgressOptions = (sheets.objects as any[]).filter((object) =>
  (object.objclass === 'WorldSpecificDangerRoomProperties' && object.aliases.some((alias: string) => canonicalProgressRefs.has(`RTID(${alias}@PropertySheets)`))) ||
  (object.objclass === 'WorldSpecificDangerRoomMiniGameProperties' && object.objdata?.WorldProp)
).map((object) => ({ reference: `RTID(${object.aliases[0]}@PropertySheets)`, world: object.objdata.WorldProp, mini: object.objclass === 'WorldSpecificDangerRoomMiniGameProperties' }));
