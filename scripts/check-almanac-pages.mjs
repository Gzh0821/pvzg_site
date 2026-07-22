import {
  buildAllAlmanacData,
  validateAlmanacData,
} from '../src/.vuepress/lib/almanac-data.mjs';

const allData = buildAllAlmanacData();
const result = validateAlmanacData(allData);

const perLocale = allData.map(({ locale, plants, zombies }) => ({
  locale: locale.lang,
  plants: plants.length,
  zombies: zombies.length,
  withoutStats: [...plants, ...zombies].filter((entity) => entity.stats.length === 0).length,
}));

console.log('Almanac data is valid.');
console.table(perLocale);
console.log(result);
