import { createHash } from 'node:crypto';
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
    featureSource: 'Features/PlantFeatures.json:PLANTS',
    propsSource: 'Objects/PlantProps.json:objects',
    almanacSource: 'Objects/PlantAlmanac.json:objects',
    subListKey: 'SubPlantList',
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
    featureSource: 'Features/ZombieFeatures.json:ZOMBIES',
    propsSource: 'Objects/ZombieProps.json:objects',
    almanacSource: 'Objects/ZombieAlmanac.json:objects',
    subListKey: 'SubZombieList',
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

const buildRelationIndex = (dataset) => {
  const parentToChildren = new Map();
  const childToParents = new Map();
  const unresolved = [];

  for (const parentCodename of dataset.order) {
    const parentFeature = dataset.featureMap.get(parentCodename);
    const childCodenames = [...new Set(parentFeature?.[dataset.subListKey] ?? [])];

    for (const childCodename of childCodenames) {
      if (!dataset.featureMap.has(childCodename)) {
        unresolved.push({
          parentCodename,
          childCodename,
          reason: 'missing feature',
        });
        continue;
      }

      const children = parentToChildren.get(parentCodename) ?? [];
      children.push(childCodename);
      parentToChildren.set(parentCodename, children);

      const parents = childToParents.get(childCodename) ?? [];
      if (!parents.includes(parentCodename)) parents.push(parentCodename);
      childToParents.set(childCodename, parents);
    }
  }

  return {
    parentToChildren,
    childToParents,
    childOrder: [...childToParents.keys()],
    unresolved,
  };
};

for (const dataset of Object.values(DATASETS)) {
  dataset.relations = buildRelationIndex(dataset);
}

const parseRtid = (value, expectedGroup) => {
  if (typeof value !== 'string') return null;
  const match = value.match(/^RTID\((.+)@(.+)\)$/u);
  if (!match || match[2] !== expectedGroup) return null;
  return match[1];
};

const resolveRawReference = ({ codename, rtid, group, source, aliasMap }) => {
  const requestedAlias = parseRtid(rtid, group);
  const resolvedAlias = requestedAlias && aliasMap.has(requestedAlias)
    ? requestedAlias
    : aliasMap.has(codename) ? codename : null;

  return {
    source,
    rtid: typeof rtid === 'string' ? rtid : null,
    requestedAlias,
    resolvedAlias,
    resolvedPath: resolvedAlias ? `${source}[alias=${resolvedAlias}]` : null,
    value: resolvedAlias ? aliasMap.get(resolvedAlias) : null,
  };
};

const buildUnversionedDeveloperPayload = (kind, codename, catalogRole) => {
  const dataset = DATASETS[kind];
  const feature = dataset.featureMap.get(codename);
  if (!feature) throw new Error(`Missing ${kind} feature for developer payload: ${codename}`);

  const props = resolveRawReference({
    codename,
    rtid: feature.PROPS,
    group: dataset.propsGroup,
    source: dataset.propsSource,
    aliasMap: dataset.propsMap,
  });
  const almanac = resolveRawReference({
    codename,
    rtid: feature.ALMANAC,
    group: dataset.almanacGroup,
    source: dataset.almanacSource,
    aliasMap: dataset.almanacMap,
  });
  const warnings = [];

  if (feature.PROPS && !props.requestedAlias) warnings.push(`Invalid Props RTID: ${feature.PROPS}`);
  if (feature.PROPS && !props.value) warnings.push(`Unresolved Props reference: ${feature.PROPS}`);
  if (feature.ALMANAC && !almanac.requestedAlias) warnings.push(`Invalid Almanac RTID: ${feature.ALMANAC}`);
  if (feature.ALMANAC && !almanac.value) warnings.push(`Unresolved Almanac reference: ${feature.ALMANAC}`);
  if (!feature.PROPS) warnings.push('Feature has no Props reference');
  if (!feature.ALMANAC) warnings.push('Feature has no Almanac reference');

  return {
    schemaVersion: 1,
    kind,
    codename,
    catalogRole,
    availability: {
      feature: true,
      props: Boolean(props.value),
      almanac: Boolean(almanac.value),
    },
    references: {
      feature: {
        source: dataset.featureSource,
        resolvedPath: `${dataset.featureSource}[CODENAME=${codename}]`,
      },
      props: {
        source: props.source,
        rtid: props.rtid,
        requestedAlias: props.requestedAlias,
        resolvedAlias: props.resolvedAlias,
        resolvedPath: props.resolvedPath,
      },
      almanac: {
        source: almanac.source,
        rtid: almanac.rtid,
        requestedAlias: almanac.requestedAlias,
        resolvedAlias: almanac.resolvedAlias,
        resolvedPath: almanac.resolvedPath,
      },
    },
    warnings,
    feature,
    props: props.value,
    almanac: almanac.value,
  };
};

const getGeneratedEntityDescriptors = () => Object.entries(DATASETS).flatMap(([kind, dataset]) => {
  const officialSet = new Set(dataset.order);
  return [
    ...dataset.order.map((codename) => ({ kind, codename, catalogRole: 'official' })),
    ...dataset.relations.childOrder
      .filter((codename) => !officialSet.has(codename))
      .map((codename) => ({ kind, codename, catalogRole: 'derived' })),
  ];
});

const createDeveloperPayloadCatalog = () => {
  const unversioned = getGeneratedEntityDescriptors()
    .map(({ kind, codename, catalogRole }) => (
      buildUnversionedDeveloperPayload(kind, codename, catalogRole)
    ))
    .sort((left, right) => left.kind.localeCompare(right.kind)
      || left.codename.localeCompare(right.codename));
  const dataVersion = createHash('sha256')
    .update(JSON.stringify(unversioned))
    .digest('hex')
    .slice(0, 12);
  const entries = unversioned.map((payload) => {
    const serialized = JSON.stringify({ dataVersion, ...payload });
    const relativePath = `assets/almanac-data/${dataVersion}/${payload.kind}/${payload.codename}.json`;
    return {
      kind: payload.kind,
      codename: payload.codename,
      url: `/${relativePath}`,
      relativePath,
      serialized,
      byteLength: Buffer.byteLength(serialized),
      payload: JSON.parse(serialized),
    };
  });

  return {
    dataVersion,
    entries,
    entryMap: new Map(entries.map((entry) => [`${entry.kind}:${entry.codename}`, entry])),
  };
};

const DEVELOPER_PAYLOAD_CATALOG = createDeveloperPayloadCatalog();

export const buildAlmanacDeveloperPayloads = () => DEVELOPER_PAYLOAD_CATALOG;

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

const resolveBaseEntity = (kind, codename, locale, catalogRole = 'official') => {
  const dataset = DATASETS[kind];
  const feature = dataset.featureMap.get(codename);
  if (!feature) throw new Error(`Missing ${kind} feature: ${codename}`);
  const developerPayload = DEVELOPER_PAYLOAD_CATALOG.entryMap.get(`${kind}:${codename}`);
  if (!developerPayload) throw new Error(`Missing ${kind} developer payload: ${codename}`);

  const propsAlias = parseRtid(feature.PROPS, dataset.propsGroup);
  const almanacAlias = parseRtid(feature.ALMANAC, dataset.almanacGroup);
  if (catalogRole === 'official' && !propsAlias) throw new Error(`Invalid ${kind} Props RTID: ${codename}`);
  if (catalogRole === 'official' && !almanacAlias) throw new Error(`Invalid ${kind} Almanac RTID: ${codename}`);

  const propsEntry = (propsAlias ? dataset.propsMap.get(propsAlias) : null) ?? dataset.propsMap.get(codename);
  const almanacEntry = (almanacAlias ? dataset.almanacMap.get(almanacAlias) : null) ?? dataset.almanacMap.get(codename);
  if (catalogRole === 'official' && !propsEntry) {
    throw new Error(`Missing ${kind} Props: ${codename} -> ${propsAlias}`);
  }
  if (catalogRole === 'official' && !almanacEntry) {
    throw new Error(`Missing ${kind} Almanac: ${codename} -> ${almanacAlias}`);
  }

  const propsUpper = upperCaseKeys(propsEntry?.objdata);
  const almanacData = almanacEntry?.objdata ?? {};
  const name = localize(feature.NAME, locale.lang);
  const englishName = feature.NAME?.en ?? name;
  const image = getImagePath(kind, feature);
  const familyCode = kind === 'plant' ? propsUpper.FAMILY : null;
  const familyName = familyCode
    ? localize(dataset.familyLabels?.[familyCode], locale.lang) || familyCode
    : '';
  const familyIconName = familyCode ? dataset.familyLabels?.[familyCode]?.en : '';

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

  const similarity = {
    family: familyCode === 'Nope' ? '' : familyCode,
    world: feature.OBTAINWORLD ?? '',
    types: (feature.TYPE ?? []).filter((type) => type !== kind),
    stats: [...new Set(stats.map((stat) => stat.type))],
    specials: [...new Set((almanacData.Special ?? [])
      .map((special) => special.NAME?.en ?? special.NAME?.zh)
      .filter(Boolean))],
  };

  return {
    kind,
    locale: locale.lang,
    codename,
    numericId: kind === 'plant' ? feature.ID ?? null : null,
    catalogRole,
    developerPayloadUrl: developerPayload.url,
    hasAlmanac: Boolean(almanacEntry),
    hasProps: Boolean(propsEntry),
    name,
    englishName,
    image,
    world: feature.OBTAINWORLD ?? '',
    family: familyCode ? {
      code: familyCode,
      name: familyName,
      icon: `/assets/wikicon/${familyIconName || 'None'}_familyicon.webp`,
    } : null,
    summary: localize(almanacData.BriefIntroduction, locale.lang),
    description: localize(almanacData.Introduction, locale.lang),
    chat: localize(almanacData.Chat, locale.lang),
    stats,
    specials,
    similarity,
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

const countShared = (left, right) => {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value)).length;
};

const getSimilarityScore = (entity, candidate) => {
  let score = 0;

  if (entity.similarity.family && entity.similarity.family === candidate.similarity.family) score += 12;
  if (entity.similarity.world && entity.similarity.world === candidate.similarity.world) score += 4;
  score += countShared(entity.similarity.types, candidate.similarity.types) * 3;
  score += Math.min(countShared(entity.similarity.stats, candidate.similarity.stats), 4);
  score += Math.min(countShared(entity.similarity.specials, candidate.similarity.specials), 3);

  return score;
};

const getRelationScore = (dataset, entity, candidate) => {
  const entityChildren = dataset.relations.parentToChildren.get(entity.codename) ?? [];
  const candidateChildren = dataset.relations.parentToChildren.get(candidate.codename) ?? [];
  const entityParents = dataset.relations.childToParents.get(entity.codename) ?? [];
  const candidateParents = dataset.relations.childToParents.get(candidate.codename) ?? [];

  if (entityChildren.includes(candidate.codename) || candidateChildren.includes(entity.codename)) return 24;
  if (countShared(entityParents, candidateParents)) return 18;
  return 0;
};

const getSimilarNeighbors = (entities, currentIndex, dataset) => {
  const current = entities[currentIndex];
  const count = entities.length;

  return entities
    .map((candidate, candidateIndex) => {
      const directDistance = Math.abs(currentIndex - candidateIndex);
      return {
        candidate,
        candidateIndex,
        score: getSimilarityScore(current, candidate) + getRelationScore(dataset, current, candidate),
        distance: Math.min(directDistance, count - directDistance),
      };
    })
    .filter(({ candidateIndex }) => candidateIndex !== currentIndex)
    .sort((left, right) => right.score - left.score
      || left.distance - right.distance
      || left.candidate.codename.localeCompare(right.candidate.codename))
    .slice(0, 5)
    .map(({ candidate }) => toNeighbor(candidate));
};

const resolveRelationNeighbors = (codenames, entityMap) => codenames
  .map((codename) => entityMap.get(codename))
  .filter(Boolean)
  .map((entity) => toNeighbor(entity));

const buildAlmanacKindData = (kind, locale) => {
  const dataset = DATASETS[kind];
  const officialSet = new Set(dataset.order);
  const officialEntities = dataset.order.map((codename) => (
    resolveBaseEntity(kind, codename, locale, 'official')
  ));
  const derivedEntities = dataset.relations.childOrder
    .filter((codename) => !officialSet.has(codename))
    .map((codename) => resolveBaseEntity(kind, codename, locale, 'derived'));
  const baseEntities = [...officialEntities, ...derivedEntities];
  const entityMap = new Map(baseEntities.map((entity) => [entity.codename, entity]));
  const officialCount = officialEntities.length;

  const entities = baseEntities.map((entity, index) => {
    const parentCodenames = dataset.relations.childToParents.get(entity.codename) ?? [];
    const childCodenames = dataset.relations.parentToChildren.get(entity.codename) ?? [];
    const siblingCodenames = [...new Set(parentCodenames.flatMap((parentCodename) => (
      dataset.relations.parentToChildren.get(parentCodename) ?? []
    )))].filter((codename) => codename !== entity.codename);
    const officialIndex = officialSet.has(entity.codename)
      ? dataset.order.indexOf(entity.codename)
      : -1;

    return {
      ...entity,
      parents: resolveRelationNeighbors(parentCodenames, entityMap),
      children: resolveRelationNeighbors(childCodenames, entityMap),
      siblings: resolveRelationNeighbors(siblingCodenames, entityMap),
      previous: officialIndex === -1
        ? null
        : toNeighbor(officialEntities[(officialIndex - 1 + officialCount) % officialCount]),
      next: officialIndex === -1
        ? null
        : toNeighbor(officialEntities[(officialIndex + 1) % officialCount]),
      neighbors: getSimilarNeighbors(baseEntities, index, dataset),
    };
  });

  const enrichedMap = new Map(entities.map((entity) => [entity.codename, entity]));

  return {
    entities,
    official: dataset.order.map((codename) => enrichedMap.get(codename)),
    unresolvedRelations: dataset.relations.unresolved.map((relation) => ({ kind, ...relation })),
  };
};

export const buildAlmanacCatalog = (kind, locale) => buildAlmanacKindData(kind, locale).entities;

export const buildAllAlmanacData = () => ALMANAC_LOCALES.map((locale) => {
  const plantData = buildAlmanacKindData('plant', locale);
  const zombieData = buildAlmanacKindData('zombie', locale);
  return {
    locale,
    plants: plantData.entities,
    zombies: zombieData.entities,
    directories: {
      plants: plantData.official.map(toDirectoryEntity),
      zombies: zombieData.official.map(toDirectoryEntity),
    },
    unresolvedRelations: [...plantData.unresolvedRelations, ...zombieData.unresolvedRelations],
  };
});

export const validateAlmanacData = (allData = buildAllAlmanacData()) => {
  const errors = [];
  const seenPaths = new Set();
  const unresolvedReferences = new Set();
  const referencedPayloads = new Set();
  const payloads = buildAlmanacDeveloperPayloads();
  const payloadKeys = new Set();

  if (!/^[a-f0-9]{12}$/u.test(payloads.dataVersion)) {
    errors.push(`invalid developer payload data version: ${payloads.dataVersion}`);
  }
  for (const entry of payloads.entries) {
    const key = `${entry.kind}:${entry.codename}`;
    if (payloadKeys.has(key)) errors.push(`${key}: duplicate developer payload`);
    payloadKeys.add(key);
    if (!/^[A-Za-z0-9_-]+$/u.test(entry.codename)) {
      errors.push(`${key}: codename cannot be used as a static payload filename`);
    }
    if (entry.byteLength > 128 * 1024) {
      errors.push(`${key}: developer payload exceeds 128 KiB (${entry.byteLength} bytes)`);
    }
    if (entry.payload.dataVersion !== payloads.dataVersion) {
      errors.push(`${key}: developer payload uses a stale data version`);
    }
    if (entry.payload.feature?.PLANTS || entry.payload.feature?.ZOMBIES
      || entry.payload.props?.objects || entry.payload.almanac?.objects) {
      errors.push(`${key}: developer payload contains an entire source database`);
    }
    if (JSON.stringify(entry.payload) !== entry.serialized) {
      errors.push(`${key}: developer payload serialization is not deterministic`);
    }
  }

  for (const localeData of allData) {
    for (const [kind, directoryKey] of [['plant', 'plants'], ['zombie', 'zombies']]) {
      const actualOrder = localeData.directories[directoryKey].map((entity) => entity.codename);
      const expectedOrder = DATASETS[kind].order;
      if (actualOrder.length !== expectedOrder.length
        || actualOrder.some((codename, index) => codename !== expectedOrder[index])) {
        errors.push(`${localeData.locale.lang}: ${kind} directory order differs from the official order`);
      }
    }

    const officialDirectoryCodenames = {
      plant: new Set(localeData.directories.plants.map((entity) => entity.codename)),
      zombie: new Set(localeData.directories.zombies.map((entity) => entity.codename)),
    };
    const entityMaps = {
      plant: new Map(localeData.plants.map((entity) => [entity.codename, entity])),
      zombie: new Map(localeData.zombies.map((entity) => [entity.codename, entity])),
    };

    for (const relation of localeData.unresolvedRelations) {
      unresolvedReferences.add(`${relation.kind}:${relation.parentCodename}:${relation.childCodename}`);
      if (DATASETS[relation.kind].featureMap.has(relation.childCodename)) {
        errors.push(`${relation.kind}:${relation.childCodename}: relation incorrectly marked unresolved`);
      }
    }

    for (const entity of [...localeData.plants, ...localeData.zombies]) {
      const payloadKey = `${entity.kind}:${entity.codename}`;
      const payloadEntry = payloads.entryMap.get(payloadKey);
      if (!entity.name) errors.push(`${entity.path}: missing localized name`);
      if (!entity.englishName) errors.push(`${entity.path}: missing English name`);
      if (entity.catalogRole === 'official' && !entity.description) {
        errors.push(`${entity.path}: official entity is missing introduction`);
      }
      if (entity.catalogRole === 'derived' && officialDirectoryCodenames[entity.kind].has(entity.codename)) {
        errors.push(`${entity.path}: derived entity leaked into the official directory`);
      }
      if (!entity.hasAlmanac && (entity.description || entity.chat || entity.stats.length || entity.specials.length)) {
        errors.push(`${entity.path}: entity without Almanac data contains inherited Almanac content`);
      }
      if (!entity.imageExists) errors.push(`${entity.path}: missing image ${entity.image}`);
      if (!payloadEntry) {
        errors.push(`${entity.path}: missing developer payload`);
      } else if (entity.developerPayloadUrl !== payloadEntry.url) {
        errors.push(`${entity.path}: developer payload URL is stale`);
      } else {
        referencedPayloads.add(payloadKey);
      }
      if (entity.catalogRole === 'official' && (!entity.previous || !entity.next)) {
        errors.push(`${entity.path}: official entity is missing sequence navigation`);
      }
      if (entity.catalogRole === 'derived' && (entity.previous || entity.next)) {
        errors.push(`${entity.path}: derived entity should not use the official sequence navigation`);
      }
      if (entity.neighbors.length !== 5) errors.push(`${entity.path}: expected 5 similar entities`);
      if (entity.neighbors.some((neighbor) => neighbor.codename === entity.codename)) {
        errors.push(`${entity.path}: similar entities include the current entity`);
      }
      if (new Set(entity.neighbors.map((neighbor) => neighbor.codename)).size !== entity.neighbors.length) {
        errors.push(`${entity.path}: duplicate similar entities`);
      }
      for (const relationKey of ['parents', 'children', 'siblings']) {
        const relations = entity[relationKey];
        if (relations.some((relation) => relation.codename === entity.codename)) {
          errors.push(`${entity.path}: ${relationKey} include the current entity`);
        }
        if (new Set(relations.map((relation) => relation.codename)).size !== relations.length) {
          errors.push(`${entity.path}: duplicate ${relationKey}`);
        }
        for (const relation of relations) {
          if (!entityMaps[entity.kind].has(relation.codename)) {
            errors.push(`${entity.path}: ${relationKey} target is not generated: ${relation.codename}`);
          }
        }
      }
      for (const child of entity.children) {
        const childEntity = entityMaps[entity.kind].get(child.codename);
        if (!childEntity?.parents.some((parent) => parent.codename === entity.codename)) {
          errors.push(`${entity.path}: child relation is not bidirectional: ${child.codename}`);
        }
      }
      for (const parent of entity.parents) {
        const parentEntity = entityMaps[entity.kind].get(parent.codename);
        if (!parentEntity?.children.some((child) => child.codename === entity.codename)) {
          errors.push(`${entity.path}: parent relation is not bidirectional: ${parent.codename}`);
        }
      }
      if (seenPaths.has(entity.path)) errors.push(`${entity.path}: duplicate route`);
      seenPaths.add(entity.path);
    }
  }

  if (referencedPayloads.size !== payloads.entries.length) {
    errors.push(`developer payload coverage differs from generated entities (${referencedPayloads.size}/${payloads.entries.length})`);
  }

  if (errors.length) {
    throw new Error(`Almanac validation failed (${errors.length}):\n${errors.join('\n')}`);
  }

  return {
    locales: allData.length,
    officialPlantPages: allData.reduce((total, item) => total + item.directories.plants.length, 0),
    officialZombiePages: allData.reduce((total, item) => total + item.directories.zombies.length, 0),
    plantPages: allData.reduce((total, item) => total + item.plants.length, 0),
    zombiePages: allData.reduce((total, item) => total + item.zombies.length, 0),
    derivedPages: allData.reduce((total, item) => total
      + [...item.plants, ...item.zombies].filter((entity) => entity.catalogRole === 'derived').length, 0),
    incompletePages: allData.reduce((total, item) => total
      + [...item.plants, ...item.zombies].filter((entity) => !entity.hasAlmanac).length, 0),
    unresolvedReferences: unresolvedReferences.size,
    detailPages: seenPaths.size,
    developerPayloads: payloads.entries.length,
    developerDataVersion: payloads.dataVersion,
  };
};
