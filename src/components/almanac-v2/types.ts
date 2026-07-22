export type AlmanacKind = 'plant' | 'zombie';
export type AlmanacLocale = 'zh' | 'en';

export interface AlmanacFamily {
  code: string;
  name: string;
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
  directoryPath: string;
  description: string;
  chat: string;
  stats: AlmanacStat[];
  specials: AlmanacSpecial[];
  previous: AlmanacNeighbor;
  next: AlmanacNeighbor;
  neighbors: AlmanacNeighbor[];
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
