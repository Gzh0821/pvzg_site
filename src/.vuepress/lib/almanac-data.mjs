import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const readJson = (relativePath) => JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8'));

const plantFeatures = readJson('../../components/game-data/raw/Features/PlantFeatures.json');
const zombieFeatures = readJson('../../components/game-data/raw/Features/ZombieFeatures.json');
const plantAlmanac = readJson('../../components/game-data/raw/Objects/PlantAlmanac.json');
const zombieAlmanac = readJson('../../components/game-data/raw/Objects/ZombieAlmanac.json');
const plantProps = readJson('../../components/game-data/raw/Objects/PlantProps.json');
const zombieProps = readJson('../../components/game-data/raw/Objects/ZombieProps.json');
const plantI18n = readJson('../../components/plantsAlmanac/i18n.json');
const zombieI18n = readJson('../../components/zombiesAlmanac/i18n.json');

export const ALMANAC_LOCALES = Object.freeze([
  { lang: 'zh', pathPrefix: '', htmlLang: 'zh-CN' },
  { lang: 'en', pathPrefix: '/en', htmlLang: 'en-US' },
]);

const DATASETS = {
  plant: {
    features: plantFeatures.PLANTS,
    order: plantFeatures.SEEDCHOOSERDEFAULTORDER,
    almanac: plantAlmanac.objects,
    props: plantProps.objects,
    statLabels: plantI18n.Almanac,
    familyLabels: plantI18n.PlantFamily,
    propsGroup: 'PlantProps',
    almanacGroup: 'PlantAlmanac',
  },
  zombie: {
    features: zombieFeatures.ZOMBIES,
    order: zombieFeatures.ALMANAC,
    almanac: zombieAlmanac.objects,
    props: zombieProps.objects,
    statLabels: zombieI18n.Almanac,
    familyLabels: zombieI18n.PlantFamily,
    propsGroup: 'ZombieProps',
    almanacGroup: 'ZombieAlmanac',
  },
};

const createAliasMap = (objects) => new Map(
  objects.flatMap((entry) => (entry.aliases ?? []).map((alias) => [alias, entry])),
);

for (const dataset of Object.values(DATASETS)) {
  dataset.featureMap = new Map(dataset.features.map((feature) => [feature.CODENAME, feature]));
  dataset.almanacMap = createAliasMap(dataset.almanac);
  dataset.propsMap = createAliasMap(dataset.props);
}

const parseRtid = (value, expectedGroup) => {
  if (typeof value !== 'string') return null;
  const match = value.match(/^RTID\((.+)@(.+)\)$/u);
  if (!match || match[2] !== expectedGroup) return null;
  return match[1];
};

const upperCaseKeys = (record) => Object.fromEntries(
  Object.entries(record ?? {}).map(([key, value]) => [key.toUpperCase(), value]),
);

const localize = (value, lang) => value?.[lang] ?? value?.en ?? value?.zh ?? '';

const normalizeDisplayValue = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return JSON.stringify(value);
};

const getImagePath = (kind, feature) => kind === 'plant'
  ? `/assets/image/plants/plants_${feature.CODENAME}_c.webp`
  : `/assets/image/zombies/Zombie_${feature._CARDSPRITENAME}_0.webp`;

const getImageFile = (imagePath) => fileURLToPath(
  new URL(`../public${imagePath}`, import.meta.url),
);

export const getAlmanacDirectoryPath = (kind, pathPrefix = '') => (
  `${pathPrefix}/almanac/${kind === 'plant' ? 'plants' : 'zombies'}.html`
);

export const getAlmanacDetailPath = (kind, codename, pathPrefix = '') => (
  `${pathPrefix}/almanac/${kind === 'plant' ? 'plants' : 'zombies'}/${codename}.html`
);

const resolveStatValue = ({ element, propsUpper, dataset, lang }) => {
  const { TYPE: type, SORT: sort, VALUE: value } = element;

  if (sort && localize(sort, lang)) return localize(sort, lang);
  if (value !== undefined) return normalizeDisplayValue(value);
  if (type === 'RECHARGE') return normalizeDisplayValue(propsUpper.COOLDOWN);
  if (type === 'FAMILY') {
    const familyCode = propsUpper.FAMILY;
    return localize(dataset.familyLabels?.[familyCode], lang) || normalizeDisplayValue(familyCode);
  }
  return normalizeDisplayValue(propsUpper[type]);
};

const resolveBaseEntity = (kind, codename, locale) => {
  const dataset = DATASETS[kind];
  const feature = dataset.featureMap.get(codename);
  if (!feature) throw new Error(`Missing ${kind} feature: ${codename}`);

  const propsAlias = parseRtid(feature.PROPS, dataset.propsGroup);
  const almanacAlias = parseRtid(feature.ALMANAC, dataset.almanacGroup);
  if (!propsAlias) throw new Error(`Invalid ${kind} Props RTID: ${codename}`);
  if (!almanacAlias) throw new Error(`Invalid ${kind} Almanac RTID: ${codename}`);

  const propsEntry = dataset.propsMap.get(propsAlias) ?? dataset.propsMap.get(codename);
  const almanacEntry = dataset.almanacMap.get(almanacAlias) ?? dataset.almanacMap.get(codename);
  if (!propsEntry) throw new Error(`Missing ${kind} Props: ${codename} -> ${propsAlias}`);
  if (!almanacEntry) throw new Error(`Missing ${kind} Almanac: ${codename} -> ${almanacAlias}`);

  const propsUpper = upperCaseKeys(propsEntry.objdata);
  const almanacData = almanacEntry.objdata ?? {};
  const name = localize(feature.NAME, locale.lang);
  const englishName = feature.NAME?.en ?? name;
  const image = getImagePath(kind, feature);
  const familyCode = kind === 'plant' ? propsUpper.FAMILY : null;
  const familyName = familyCode
    ? localize(dataset.familyLabels?.[familyCode], locale.lang) || familyCode
    : '';

  const stats = (almanacData.Elements ?? []).flatMap((element) => {
    const type = element.TYPE;
    const value = resolveStatValue({ element, propsUpper, dataset, lang: locale.lang });
    if (!type || value === null) return [];
    const labelEntry = dataset.statLabels?.[type];
    return [{
      type,
      label: localize(labelEntry, locale.lang) || type,
      icon: labelEntry?.icon ?? '',
      value,
    }];
  });

  const specials = (almanacData.Special ?? []).flatMap((special) => {
    const specialName = localize(special.NAME, locale.lang);
    const description = localize(special.DESCRIPTION, locale.lang);
    return specialName || description ? [{ name: specialName, description }] : [];
  });

  return {
    kind,
    locale: locale.lang,
    codename,
    numericId: kind === 'plant' ? feature.ID : null,
    name,
    englishName,
    image,
    world: feature.OBTAINWORLD ?? '',
    family: familyCode ? { code: familyCode, name: familyName } : null,
    summary: localize(almanacData.BriefIntroduction, locale.lang),
    description: localize(almanacData.Introduction, locale.lang),
    chat: localize(almanacData.Chat, locale.lang),
    stats,
    specials,
    path: getAlmanacDetailPath(kind, codename, locale.pathPrefix),
    directoryPath: getAlmanacDirectoryPath(kind, locale.pathPrefix),
    imageExists: existsSync(getImageFile(image)),
  };
};

const toDirectoryEntity = (entity) => ({
  kind: entity.kind,
  codename: entity.codename,
  numericId: entity.numericId,
  name: entity.name,
  englishName: entity.englishName,
  image: entity.image,
  world: entity.world,
  family: entity.family,
  summary: entity.summary,
  path: entity.path,
});

const toNeighbor = (entity, current = false) => ({
  codename: entity.codename,
  name: entity.name,
  englishName: entity.englishName,
  image: entity.image,
  path: entity.path,
  current,
});

export const buildAlmanacCatalog = (kind, locale) => {
  const dataset = DATASETS[kind];
  const entities = dataset.order.map((codename) => resolveBaseEntity(kind, codename, locale));
  const count = entities.length;

  return entities.map((entity, index) => {
    const neighborIndexes = [-2, -1, 0, 1, 2].map((offset) => (index + offset + count) % count);
    return {
      ...entity,
      previous: toNeighbor(entities[(index - 1 + count) % count]),
      next: toNeighbor(entities[(index + 1) % count]),
      neighbors: neighborIndexes.map((neighborIndex) => toNeighbor(
        entities[neighborIndex],
        neighborIndex === index,
      )),
    };
  });
};

export const buildAllAlmanacData = () => ALMANAC_LOCALES.map((locale) => {
  const plants = buildAlmanacCatalog('plant', locale);
  const zombies = buildAlmanacCatalog('zombie', locale);
  return {
    locale,
    plants,
    zombies,
    directories: {
      plants: plants.map(toDirectoryEntity),
      zombies: zombies.map(toDirectoryEntity),
    },
  };
});

export const validateAlmanacData = (allData = buildAllAlmanacData()) => {
  const errors = [];
  const seenPaths = new Set();

  for (const localeData of allData) {
    for (const entity of [...localeData.plants, ...localeData.zombies]) {
      if (!entity.name) errors.push(`${entity.path}: missing localized name`);
      if (!entity.englishName) errors.push(`${entity.path}: missing English name`);
      if (!entity.description) errors.push(`${entity.path}: missing introduction`);
      if (!entity.imageExists) errors.push(`${entity.path}: missing image ${entity.image}`);
      if (seenPaths.has(entity.path)) errors.push(`${entity.path}: duplicate route`);
      seenPaths.add(entity.path);
    }
  }

  if (errors.length) {
    throw new Error(`Almanac validation failed (${errors.length}):\n${errors.join('\n')}`);
  }

  return {
    locales: allData.length,
    plantPages: allData.reduce((total, item) => total + item.plants.length, 0),
    zombiePages: allData.reduce((total, item) => total + item.zombies.length, 0),
    detailPages: seenPaths.size,
  };
};
