import {
  buildAllAlmanacData,
  validateAlmanacData,
} from '../src/.vuepress/lib/almanac-data.mjs';

const allData = buildAllAlmanacData();
const result = validateAlmanacData(allData);

const perLocale = allData.map(({ locale, plants, zombies, directories, unresolvedRelations }) => ({
  locale: locale.lang,
  officialPlants: directories.plants.length,
  officialZombies: directories.zombies.length,
  plantPages: plants.length,
  zombiePages: zombies.length,
  derivedPages: [...plants, ...zombies].filter((entity) => entity.catalogRole === 'derived').length,
  incompletePages: [...plants, ...zombies].filter((entity) => !entity.hasAlmanac).length,
  withoutStats: [...plants, ...zombies].filter((entity) => entity.stats.length === 0).length,
  unresolvedReferences: unresolvedRelations.length,
}));

console.log('Almanac data is valid.');
console.table(perLocale);
if (allData[0]?.unresolvedRelations.length) {
  console.log('Unresolved child references (pages intentionally not generated):');
  console.table(allData[0].unresolvedRelations);
}
console.log(result);
