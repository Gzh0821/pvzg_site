export type LocaleKey = 'zh' | 'en' | 'es' | 'ru';

export type AssetKind = 'plant' | 'zombie' | 'object';

export type ObjectCategory = 'tile' | 'obstacle' | 'tombstone';

export type ObjectCategoryFilter = 'all' | ObjectCategory;

export type ObjectExportClass = 'InitialGridItemProperties' | 'GravestoneProperties';

export type BoardLayer = 'tile' | 'obstacle' | 'plant' | 'zombie';

export type SeedMode = 'chooser' | 'preset';

export type PlantListKey = 'seedPlants' | 'includePlants' | 'excludePlants';

export type ConveyorWaveMode = 'Add' | 'Remove';

export type ConveyorAdvancedTab = 'plants' | 'rules' | 'waves';

export type DynamicZombieNumberField = 'StartingWave' | 'StartingPoints' | 'PointIncrementPerWave';

export type StageReferenceScope = 'LevelModules' | 'CurrentLevel';

export type AddableWaveActionKind =
  | 'tide'
  | 'dino'
  | 'storm'
  | 'ground'
  | 'frostWind'
  | 'beachAmbush'
  | 'raidingParty'
  | 'spiderRain'
  | 'parachuteRain'
  | 'gravestones'
  | 'gridItemSpawn'
  | 'dropShip'
  | 'thunderCharge'
  | 'qigongStrike'
  | 'chiHole'
  | 'missileLocate'
  | 'waveWarning'
  | 'scheduler';

export type ConveyorEditorTarget =
  | { kind: 'initialPlant'; index: number; }
  | { kind: 'dropCondition'; index: number; }
  | { kind: 'speedCondition'; index: number; }
  | { kind: 'waveModification'; index: number; };

export interface NamedFeature {
  CODENAME: string;
  NAME?: Record<string, string>;
  OBTAINWORLD?: string;
  _CARDSPRITENAME?: string;
}

export interface AssetOption {
  kind: AssetKind;
  code: string;
  name: string;
  world?: string;
  image?: string;
  category?: ObjectCategory;
  exportClass?: ObjectExportClass;
  props?: string;
  res?: string;
  source?: string;
  advanced?: boolean;
  local?: boolean;
  base?: string;
  alias?: string;
}

export interface BoardItem {
  id: number;
  kind: AssetKind;
  code: string;
  label: string;
  row: number;
  col: number;
  category?: ObjectCategory;
  exportClass?: ObjectExportClass;
  props?: string;
  res?: string;
  source?: string;
  advanced?: boolean;
  extra?: Record<string, any>;
}

export interface WaveZombie {
  id: number;
  code: string;
  label: string;
  count: number;
  row: string;
  rowDirty?: boolean;
  entries?: Record<string, any>[];
}

export interface WaveActionDraft {
  id: number;
  alias: string;
  objclass: string;
  objdata: Record<string, any>;
  jsonText: string;
  originalObject?: any;
  managed?: boolean;
}

export interface WaveActionOrderEntry {
  kind: 'zombies' | 'raw' | 'conveyor';
  actionId?: number;
  alias?: string;
}

export interface WaveDraft {
  id: number;
  name: string;
  flag: boolean;
  zombies: WaveZombie[];
  zombieActionAlias?: string;
  zombieActionExtra?: Record<string, any>;
  additionalPlantfood: number;
  dynamicPlantfood: string;
  spawnStyle: string;
  mustKillAllToNextWave: boolean;
  rawActions: WaveActionDraft[];
  actionOrder: WaveActionOrderEntry[];
}

export interface ConveyorPlantEntry {
  PlantType: string;
  Weight?: number;
  MaxCount?: number;
  MaxWeightFactor?: number;
  MinCount?: number;
  MinWeightFactor?: number;
  CooldownSeconds?: number;
  MaxCountCooldownSeconds?: number;
  MinCountCooldownSeconds?: number;
  MaxDelivered?: number;
  ForceBoosted?: boolean;
  [key: string]: any;
}

export interface ConveyorDropDelayCondition {
  MaxPackets: number;
  Delay: number;
  [key: string]: any;
}

export interface ConveyorSpeedCondition {
  MaxPackets: number;
  Speed: number;
  [key: string]: any;
}

export interface ConveyorWaveModification {
  waveIndex: number;
  mode: ConveyorWaveMode;
  PlantType: string;
  alias?: string;
  Weight?: number;
  MaxCount?: number;
  MaxWeightFactor?: number;
  MinCount?: number;
  MinWeightFactor?: number;
  CooldownSeconds?: number;
  MaxCountCooldownSeconds?: number;
  MinCountCooldownSeconds?: number;
  MaxDelivered?: number;
  ForceBoosted?: boolean;
  [key: string]: any;
}

export interface PreservedConveyorWaveAction {
  alias: string;
  waveIndex: number;
  objclass: string;
  objdata: Record<string, any>;
}

export interface ConveyorDraft {
  enabled: boolean;
  alias: string;
  preserveOriginal: boolean;
  dirty: boolean;
  originalObject?: any;
  originalActionObjects: PreservedConveyorWaveAction[];
  initialPlants: ConveyorPlantEntry[];
  dropDelayConditions: ConveyorDropDelayCondition[];
  speedConditions: ConveyorSpeedCondition[];
  waveModifications: ConveyorWaveModification[];
  extra: Record<string, any>;
}

export interface LevelDraft {
  name: string;
  author: string;
  description: string;
  stage: string;
  stageSource: StageReferenceScope;
  mower: string;
  sunDropper: string;
  startingSun: number;
  seedMode: SeedMode;
  overrideSeedSlots: boolean;
  seedSlots: number;
  seedPlants: string[];
  seedPresetEntries: Record<string, any>[];
  includePlants: string[];
  excludePlants: string[];
  unlockAll: boolean;
  hasSeedBank: boolean;
  seedBankExtra: Record<string, any>;
  conveyor: ConveyorDraft;
  objectives: ObjectiveSystemDraft;
  boardRules: BoardRuleSystemDraft;
  boardItems: BoardItem[];
  waves: WaveDraft[];
  waveSupportObjects: WaveActionDraft[];
  flagWaveInterval: number;
  flagWaveIntervalOriginal?: number;
  flagWaveIntervalDirty: boolean;
  firstWaveCountdown: number;
  suppressFlagZombie: boolean;
  waveSpendingPointIncrement: number;
  waveSpendingPoints: number;
  minNextWaveHealthPercentage: number;
  maxNextWaveHealthPercentage: number;
  waveManagerModuleExtra: Record<string, any>;
  waveManagerExtra: Record<string, any>;
  waveManagerAlias: string;
  waveManagerReferenceOnModule: boolean;
  supportsDynamicZombies: boolean;
  hasWaveManager: boolean;
  preserveGeneratorWaves: boolean;
  preservedWaveManagerModule?: any;
  preserveCustomWaveManager: boolean;
  preservedWaveManagerObject?: any;
  preservedStaticWaveObjects: any[];
  waveSystemDirty: boolean;
  rootExtra: Record<string, any>;
  levelExtra: Record<string, any>;
  preserveBoardModules: boolean;
  preservedPlacementObjects: any[];
  unsupportedObjects: number;
  unsupportedRawObjects: any[];
  moduleRefs: string[];
}

export interface ValidationItem {
  type: 'error' | 'warning';
  text: string;
}

export interface CellEffectEntry {
  id: string;
  label: string;
  detail?: string;
  tone: 'protect' | 'mold' | 'power' | 'rail' | 'plank';
  remove?: () => void;
}

export interface StarObjectiveDraft {
  id: string;
  kind: string;
  alias: string;
  originalAlias: string | null;
  objclass: string;
  objdata: Record<string, any>;
  originalObject: any;
  implicit: boolean;
  groupIndex: number;
}

export interface ProtectObjectiveDraft {
  id: 'protect';
  alias: string;
  originalAlias: string | null;
  objdata: Record<string, any>;
  originalObject: any;
}

export interface ObjectiveSystemDraft {
  dirty: boolean;
  starDirty: boolean;
  protectDirty: boolean;
  ownedObjectIndexes: number[];
  originalObjects: any[];
  originalStarObjects: any[];
  originalProtectObjects: any[];
  originalModuleRefs: { star: string | null; protect: string | null; };
  starModule: { alias: string; originalObject: any; extra: Record<string, any>; } | null;
  starGroups: string[][];
  starObjectives: StarObjectiveDraft[];
  originalSupportedAliases: string[];
  opaqueStarObjects: any[];
  protect: ProtectObjectiveDraft | null;
}

export interface BoardRuleModuleDraft {
  id: string;
  kind: 'railcart' | 'tide' | 'planks' | 'powerTiles';
  alias: string;
  originalAlias: string | null;
  originalRef: string | null;
  objclass: string;
  objdata: Record<string, any>;
  originalObject: any;
  dirty: boolean;
}

export interface BoardRuleSystemDraft {
  dirty: boolean;
  ownedObjectIndexes: number[];
  originalObjects: any[];
  modules: BoardRuleModuleDraft[];
}

export interface ImportCapabilitySummary {
  visualSections: string[];
  advancedActions: number;
  preservedObjects: number;
  waveMode: 'static' | 'generator' | 'none';
}

export type WorkspaceId = 'basic' | 'board' | 'waves' | 'seed' | 'narrative' | 'assets';
