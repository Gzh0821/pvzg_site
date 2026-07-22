export type AlmanacKind = 'plant' | 'zombie';
export type AlmanacLocale = 'zh' | 'en';
export type AlmanacCatalogRole = 'official' | 'derived';
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface AlmanacFamily {
  code: string;
  name: string;
  icon: string;
}

export interface AlmanacDirectoryEntity {
  kind: AlmanacKind;
  codename: string;
  numericId: number | null;
  name: string;
  englishName: string;
  image: string;
  world: string;
  family: AlmanacFamily | null;
  summary: string;
  path: string;
}

export interface AlmanacNeighbor {
  codename: string;
  name: string;
  englishName: string;
  image: string;
  path: string;
  current: boolean;
}

export interface AlmanacStat {
  type: string;
  label: string;
  icon: string;
  value: string | number | boolean;
}

export interface AlmanacSpecial {
  name: string;
  description: string;
}

export interface AlmanacEntity extends AlmanacDirectoryEntity {
  locale: AlmanacLocale;
  catalogRole: AlmanacCatalogRole;
  developerPayloadUrl: string;
  hasAlmanac: boolean;
  hasProps: boolean;
  directoryPath: string;
  description: string;
  chat: string;
  stats: AlmanacStat[];
  specials: AlmanacSpecial[];
  parents: AlmanacNeighbor[];
  children: AlmanacNeighbor[];
  siblings: AlmanacNeighbor[];
  previous: AlmanacNeighbor | null;
  next: AlmanacNeighbor | null;
  neighbors: AlmanacNeighbor[];
}

export interface AlmanacDeveloperReference {
  source: string;
  rtid?: string | null;
  requestedAlias?: string | null;
  resolvedAlias?: string | null;
  resolvedPath: string | null;
}

export interface AlmanacDeveloperPayload {
  schemaVersion: number;
  dataVersion: string;
  kind: AlmanacKind;
  codename: string;
  catalogRole: AlmanacCatalogRole;
  availability: {
    feature: boolean;
    props: boolean;
    almanac: boolean;
  };
  references: {
    feature: AlmanacDeveloperReference;
    props: AlmanacDeveloperReference;
    almanac: AlmanacDeveloperReference;
  };
  warnings: string[];
  feature: JsonValue;
  props: JsonValue | null;
  almanac: JsonValue | null;
}

export interface AlmanacDirectoryData {
  kind: AlmanacKind;
  locale: AlmanacLocale;
  entities: AlmanacDirectoryEntity[];
}

export interface AlmanacPageFrontmatter {
  almanacDirectory?: AlmanacDirectoryData;
  almanacEntity?: AlmanacEntity;
}
