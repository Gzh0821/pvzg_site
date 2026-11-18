const clone = (value) => JSON.parse(JSON.stringify(value));
export const localAlias = (reference) => /^RTID\((.+)@CurrentLevel\)$/.exec(String(reference))?.[1] || null;
export function getLocalAssetDefinitions(objects) {
  return objects.filter((object) => ['PlantType', 'ZombieType'].includes(object?.objclass) && object.aliases?.length).map((object) => ({
    kind: object.objclass === 'PlantType' ? 'plant' : 'zombie', alias: object.aliases[0], object,
    base: object.objdata?.PlantBasedOn || object.objdata?.ZombieBasedOn,
    properties: objects.find((entry) => entry.aliases?.includes(localAlias(object.objdata?.Properties))) || null
  }));
}
export function createLocalAsset(objects, type, properties, reservedAliases = []) {
  if (!type || !properties) throw new Error('Missing native asset definition');
  const aliases = new Set([...reservedAliases, ...objects.flatMap((object) => object.aliases || [])]);
  const base = type.aliases[0];
  let index = 1;
  let alias;
  do { alias = `${base}_local_${index++}`; } while (aliases.has(alias) || aliases.has(`${alias}_props`));
  const propertyAlias = `${alias}_props`;
  return [
    { ...clone(type), aliases: [alias], objdata: { ...clone(type.objdata), Properties: `RTID(${propertyAlias}@CurrentLevel)` } },
    { ...clone(properties), aliases: [propertyAlias] }
  ];
}
