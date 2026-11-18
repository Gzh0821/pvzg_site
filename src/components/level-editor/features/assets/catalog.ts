import { plantAlmanacJson, plantPropsJson, plantTypesJson as plantTypes } from '../../../game-data/plants';
import { zombieAlmanacJson, zombiePropsJson, zombieTypesJson as zombieTypes } from '../../../game-data/zombies';
import { localAlias, getLocalAssetDefinitions } from './local-assets-codec.mjs';
import type { AssetOption } from '../../core/types';
const catalogs = { plant: { types: plantTypes.objects, properties: plantPropsJson.objects, almanac: plantAlmanacJson.objects }, zombie: { types: zombieTypes.objects, properties: zombiePropsJson.objects, almanac: zombieAlmanacJson.objects } };
export function resolveAssetData(asset: AssetOption | null, objects: any[] = []) {
  if (!asset || asset.kind === 'object') return null;
  const catalog = catalogs[asset.kind];
  const alias = localAlias(asset.code) || asset.code;
  const local = getLocalAssetDefinitions(objects).find((entry) => entry.kind === asset.kind && entry.object.aliases.includes(alias));
  const type = local?.object || catalog.types.find((entry) => entry.aliases.includes(alias));
  const propertyReference = type?.objdata?.Properties || '';
  const propertyAlias = /^RTID\((.+)@.+\)$/.exec(propertyReference)?.[1];
  const properties = localAlias(propertyReference) ? objects.find((entry) => entry.aliases?.includes(propertyAlias)) : catalog.properties.find((entry) => entry.aliases.includes(propertyAlias));
  const base = local?.base || alias;
  const almanac = catalog.almanac.find((entry) => entry.aliases.includes(base));
  return { type, properties, almanac, local, base };
}

export const assetPropertyFields = [
  ['Toughness', 'workbenchToughness'], ['WalkSPS', 'workbenchSpeed'], ['WavePointCost', 'workbenchWaveCost'],
  ['SunCost', 'workbenchSunCost'], ['Cooldown', 'workbenchCooldown']
] as const;

export function almanacText(value: string | Record<string, string> | undefined, language: string) {
  return typeof value === 'string' ? value : value?.[language] || value?.en || value?.zh || '';
}
