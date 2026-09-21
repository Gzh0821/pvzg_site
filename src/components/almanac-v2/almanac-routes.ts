import { plantFeaturesJson } from '../game-data/plants';
import { zombieFeaturesJson } from '../game-data/zombies';

export type AlmanacEntityKind = 'plant' | 'zombie';

type AlmanacFeature = {
  CODENAME: string;
  SubPlantList?: string[];
  SubZombieList?: string[];
};

const buildPublishedCodenames = (
  features: AlmanacFeature[],
  officialOrder: string[],
  subListKey: 'SubPlantList' | 'SubZombieList'
) => {
  const featureMap = new Map(features.map((feature) => [feature.CODENAME, feature]));
  const published = new Set(officialOrder.filter((codename) => featureMap.has(codename)));

  for (const parentCodename of officialOrder) {
    for (const childCodename of featureMap.get(parentCodename)?.[subListKey] ?? []) {
      if (featureMap.has(childCodename)) published.add(childCodename);
    }
  }

  return published;
};

const publishedCodenames: Record<AlmanacEntityKind, Set<string>> = {
  plant: buildPublishedCodenames(
    plantFeaturesJson.PLANTS,
    plantFeaturesJson.SEEDCHOOSERDEFAULTORDER,
    'SubPlantList'
  ),
  zombie: buildPublishedCodenames(
    zombieFeaturesJson.ZOMBIES,
    zombieFeaturesJson.ALMANAC,
    'SubZombieList'
  )
};

const getLocalePrefix = (locale: string) => (
  String(locale).toLowerCase().startsWith('zh') ? '' : '/en'
);

export const getAlmanacEntityPath = (
  kind: AlmanacEntityKind,
  codename: string,
  locale: string
) => {
  const normalizedCodename = String(codename || '').trim();
  if (!publishedCodenames[kind].has(normalizedCodename)) return null;

  const directory = kind === 'plant' ? 'plants' : 'zombies';
  return `${getLocalePrefix(locale)}/almanac/${directory}/${normalizedCodename}.html`;
};
