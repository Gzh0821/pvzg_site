<template>
  <a-config-provider
    :theme="{
      token: { colorPrimary: '#5f9f3f', borderRadius: 8 },
      algorithm: $isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
    }"
  >
    <section class="level-editor-shell">
      <header class="editor-topbar">
        <div class="title-block">
          <a-typography-title :level="2" class="editor-title">{{ t('title') }}</a-typography-title>
          <a-typography-text type="secondary">{{ t('subtitle') }}</a-typography-text>
        </div>
        <div class="top-actions">
          <div class="top-action-row action-row-primary">
            <a-tag class="validation-summary-tag" :color="validationSummaryColor">
              {{ t('errors', { count: validationSummary.errors }) }} / {{ t('warnings', { count: validationSummary.warnings }) }}
            </a-tag>
            <a-upload :before-upload="handleUpload" accept=".json,.json5" :show-upload-list="false">
              <a-button>
                <template #icon><upload-outlined /></template>
                {{ t('importLevel') }}
              </a-button>
            </a-upload>
            <a-button @click="resetDraft">
              <template #icon><file-add-outlined /></template>
              {{ t('newLevel') }}
            </a-button>
          </div>
          <div class="top-action-row action-row-export">
            <a-button @click="openPreview">
              <template #icon><eye-outlined /></template>
              {{ t('previewJson') }}
            </a-button>
            <a-button type="primary" @click="exportLevel">
              <template #icon><download-outlined /></template>
              {{ t('exportLevel') }}
            </a-button>
          </div>
        </div>
      </header>

      <a-alert class="mobile-helper" :message="t('mobileHint')" type="info" show-icon />

      <div class="desktop-layout">
        <AssetLibrary class="panel library-panel" />
        <main class="board-panel">
          <BasicForm />
          <BoardEditor />
        </main>
        <PropertyPanel class="panel property-panel" />
      </div>

      <div class="mobile-layout">
        <a-tabs v-model:active-key="mobileTab" centered>
          <a-tab-pane key="board" :tab="t('board')">
            <BasicForm />
            <BoardEditor />
          </a-tab-pane>
          <a-tab-pane key="assets" :tab="t('chooseAsset')">
            <AssetLibrary />
          </a-tab-pane>
          <a-tab-pane key="waves" :tab="t('waves')">
            <WaveTimeline />
          </a-tab-pane>
          <a-tab-pane key="settings" :tab="t('settings')">
            <PropertyPanel />
          </a-tab-pane>
          <a-tab-pane key="validation" :tab="t('validation')">
            <ValidationPanel />
          </a-tab-pane>
        </a-tabs>
      </div>

      <div class="desktop-bottom">
        <PropertyPanel class="panel seedbank-fallback-panel" />
        <WaveTimeline />
        <ValidationPanel compact />
      </div>

      <a-modal v-model:open="previewOpen" :title="`${draft.name || 'custom_level'}.json`" width="min(920px, 96vw)" :footer="null">
        <div class="preview-actions">
          <a-button size="small" @click="copyPreview">
            <template #icon><copy-outlined /></template>
            {{ t('copyJson') }}
          </a-button>
        </div>
        <pre class="json-preview">{{ previewJson }}</pre>
      </a-modal>
    </section>
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, inject, ref } from 'vue';
import JSON5 from 'json5';
import { message, theme as antdTheme } from 'ant-design-vue';
import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileAddOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons-vue';
import plantFeatures from '../plantsAlmanac/jsons/PlantFeatures.json';
import zombieFeatures from '../zombiesAlmanac/jsons/ZombieFeatures.json';
import localeMessages from './i18n.json';

type LocaleKey = 'zh' | 'en' | 'es' | 'ru';
type AssetKind = 'plant' | 'zombie' | 'object';
type SeedMode = 'chooser' | 'preset';
type PlantListKey = 'seedPlants' | 'includePlants' | 'excludePlants';

const MAX_SEED_PLANTS = 8;
const STAGE_DEFAULT_MOWER = '__stageDefault';
const NO_MODULE = 'none';
const NEW_WAVES_REF = 'RTID(NewWaves@CurrentLevel)';
const DEFAULT_MODULE_REFS = [
  'RTID(StandardIntro@LevelModules)',
  'RTID(DefaultSunDropper@LevelModules)',
  'RTID(ZombiesDeadWinCon@LevelModules)',
  'RTID(EgyptMowers@LevelModules)',
  'RTID(SeedBank@CurrentLevel)',
  'RTID(DefaultZombieWinCondition@LevelModules)',
  NEW_WAVES_REF
];

interface NamedFeature {
  CODENAME: string;
  NAME?: Record<string, string>;
  OBTAINWORLD?: string;
  _CARDSPRITENAME?: string;
}

interface AssetOption {
  kind: AssetKind;
  code: string;
  name: string;
  world?: string;
  image?: string;
}

interface BoardItem {
  id: number;
  kind: AssetKind;
  code: string;
  label: string;
  row: number;
  col: number;
  extra?: Record<string, any>;
}

interface WaveZombie {
  id: number;
  code: string;
  label: string;
  count: number;
  entries?: Record<string, any>[];
}

interface WaveActionDraft {
  id: number;
  alias: string;
  objclass: string;
  objdata: Record<string, any>;
  jsonText: string;
  managed?: boolean;
}

interface WaveDraft {
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
}

interface LevelDraft {
  name: string;
  author: string;
  description: string;
  stage: string;
  mower: string;
  sunDropper: string;
  startingSun: number;
  seedMode: SeedMode;
  seedSlots: number;
  seedPlants: string[];
  seedPresetEntries: Record<string, any>[];
  includePlants: string[];
  excludePlants: string[];
  unlockAll: boolean;
  seedBankExtra: Record<string, any>;
  boardItems: BoardItem[];
  waves: WaveDraft[];
  flagWaveInterval: number;
  firstWaveCountdown: number;
  suppressFlagZombie: boolean;
  waveSpendingPointIncrement: number;
  waveSpendingPoints: number;
  minNextWaveHealthPercentage: number;
  maxNextWaveHealthPercentage: number;
  waveManagerModuleExtra: Record<string, any>;
  waveManagerExtra: Record<string, any>;
  hasWaveManager: boolean;
  preserveGeneratorWaves: boolean;
  preservedWaveManagerModule?: any;
  preserveCustomWaveManager: boolean;
  preservedWaveManagerObject?: any;
  waveSystemDirty: boolean;
  levelExtra: Record<string, any>;
  preserveBoardModules: boolean;
  preservedPlacementObjects: any[];
  unsupportedObjects: number;
  unsupportedRawObjects: any[];
  moduleRefs: string[];
}

interface ValidationItem {
  type: 'error' | 'warning';
  text: string;
}

const messages = localeMessages as Record<string, Record<LocaleKey, string>>;
const providedLanguage = inject<string>('i18nLanguage', 'zh');
const mobileTab = ref('board');
const previewOpen = ref(false);
const assetTab = ref<AssetKind>('plant');
const assetSearch = ref('');
const selectedAsset = ref<AssetOption | null>(null);
const selectedCell = ref<{ row: number; col: number } | null>(null);
const selectedWaveId = ref(1);
const nextItemId = ref(1);
const nextWaveId = ref(2);
const nextZombieId = ref(1);
const nextWaveActionId = ref(1);

const stageOptions = [
  { value: 'TutorialStage', label: 'Tutorial Stage', mower: 'TutorialMowers' },
  { value: 'FrontLawnStage', label: 'Front Lawn', mower: 'FrontLawnMowers' },
  { value: 'EgyptStage', label: 'Ancient Egypt', mower: 'EgyptMowers' },
  { value: 'EgyptNightStage', label: 'Ancient Egypt Night', mower: 'EgyptMowers' },
  { value: 'PirateStage', label: 'Pirate Seas', mower: 'PirateMowers' },
  { value: 'WestStage', label: 'Wild West', mower: 'WestMowers' },
  { value: 'KongfuStage', label: 'Kongfu World', mower: 'KongfuMowers' },
  { value: 'KongfuVeteranStage', label: 'Kongfu Veteran', mower: 'KongfuMowers' },
  { value: 'FutureStage', label: 'Far Future', mower: 'FutureMowers' },
  { value: 'DarkTutorialStage', label: 'Dark Ages Tutorial', mower: 'DarkMowers' },
  { value: 'DarkStage', label: 'Dark Ages', mower: 'DarkMowers' },
  { value: 'BeachTutorialStage', label: 'Big Wave Beach Tutorial', mower: 'BeachMowers' },
  { value: 'BeachStage', label: 'Big Wave Beach', mower: 'BeachMowers' },
  { value: 'IceageTutorialStage', label: 'Frostbite Caves Tutorial', mower: 'IceageMowers' },
  { value: 'IceageVeteranStage', label: 'Frostbite Caves Veteran', mower: 'IceageMowers' },
  { value: 'LostCityStage', label: 'Lost City', mower: 'LostCityMowers' },
  { value: 'LostCityTutorialStage', label: 'Lost City Tutorial', mower: 'LostCityMowers' },
  { value: 'LostCityNightStage', label: 'Lost City Night', mower: 'LostCityMowers' },
  { value: 'IceageStage', label: 'Frostbite Caves', mower: 'IceageMowers' },
  { value: 'EightiesStage', label: 'Neon Mixtape Tour', mower: 'EightiesMowers' },
  { value: 'EightiesTutorialStage', label: 'Neon Mixtape Tutorial', mower: 'EightiesMowers' },
  { value: 'DinoStage', label: 'Jurassic Marsh', mower: 'DinoMowers' },
  { value: 'DinoTutorialStage', label: 'Jurassic Marsh Tutorial', mower: 'DinoMowers' },
  { value: 'ModernStage', label: 'Modern Day', mower: 'ModernMowers' },
  { value: 'ModernNightStage', label: 'Modern Day Night', mower: 'ModernMowers' },
  { value: 'SkyStage', label: 'Sky City', mower: NO_MODULE },
  { value: 'LunarStage', label: 'Lunar Zoo', mower: NO_MODULE },
  { value: 'PaddysStage', label: "St. Paddy's", mower: NO_MODULE },
  { value: 'SummerNightsStage', label: 'Summer Nights', mower: NO_MODULE },
  { value: 'FarmStage', label: 'Farm', mower: NO_MODULE },
  { value: 'HalloweenStage', label: 'Halloween', mower: NO_MODULE },
  { value: 'HeroesStage', label: 'Heroes', mower: NO_MODULE },
  { value: 'FallsStage', label: 'Falls', mower: NO_MODULE },
  { value: 'CircusStage', label: 'Circus', mower: NO_MODULE },
  { value: 'ArenaStage', label: 'Arena', mower: NO_MODULE },
  { value: 'PersuitStage', label: 'Pursuit', mower: NO_MODULE }
];

const mowerOptions = [
  { value: STAGE_DEFAULT_MOWER, label: 'Stage default' },
  { value: NO_MODULE, label: 'None' },
  { value: 'JoustDarkMowers', label: 'Joust Dark Mowers' },
  { value: 'TutorialMowers', label: 'Tutorial Mowers' },
  { value: 'EgyptTutorialMowers', label: 'Egypt Tutorial Mowers' },
  { value: 'EgyptMowers', label: 'Egypt Mowers' },
  { value: 'PirateMowers', label: 'Pirate Mowers' },
  { value: 'WestMowers', label: 'West Mowers' },
  { value: 'KongfuMowers', label: 'Kongfu Mowers' },
  { value: 'FutureMowers', label: 'Future Mowers' },
  { value: 'DarkMowers', label: 'Dark Mowers' },
  { value: 'BeachMowers', label: 'Beach Mowers' },
  { value: 'LostCityMowers', label: 'Lost City Mowers' },
  { value: 'IceageMowers', label: 'Iceage Mowers' },
  { value: 'IceageZombossMowers', label: 'Iceage Zomboss Mowers' },
  { value: 'EightiesMowers', label: 'Eighties Mowers' },
  { value: 'EightiesZombossMowers', label: 'Eighties Zomboss Mowers' },
  { value: 'DinoMowers', label: 'Dino Mowers' },
  { value: 'ModernMowers', label: 'Modern Mowers' },
  { value: 'FrontLawnMowers', label: 'Front Lawn Mowers' }
];

const sunDropperOptions = [
  { value: NO_MODULE, label: 'None' },
  { value: 'RevertedSunDropper', label: 'Reverted Sun Dropper' },
  { value: 'VerySlowSunDropper', label: 'Very Slow Sun Dropper' },
  { value: 'SlowSunDropper', label: 'Slow Sun Dropper' },
  { value: 'DefaultSunDropper', label: 'Default Sun Dropper' },
  { value: 'FastSunDropper', label: 'Fast Sun Dropper' },
  { value: 'VeryFastSunDropper', label: 'Very Fast Sun Dropper' }
];

const objectOptions: AssetOption[] = [
  { kind: 'object', code: 'gravestone', name: 'Gravestone' },
  { kind: 'object', code: 'potholepuddle', name: 'Puddle' },
  { kind: 'object', code: 'slider_up', name: 'Slider Up' },
  { kind: 'object', code: 'slider_down', name: 'Slider Down' },
  { kind: 'object', code: 'kongfu_rack_torch', name: 'Kongfu Torch Rack' },
  { kind: 'object', code: 'kongfu_rack_blade', name: 'Kongfu Blade Rack' }
];

const draft = ref<LevelDraft>(createDefaultDraft());

const language = computed<LocaleKey>(() => {
  if (providedLanguage.startsWith('es')) return 'es';
  if (providedLanguage.startsWith('ru')) return 'ru';
  if (providedLanguage.startsWith('en')) return 'en';
  return 'zh';
});

const plantOptions = computed<AssetOption[]>(() =>
  ((plantFeatures as { PLANTS: NamedFeature[] }).PLANTS || []).map((plant) => ({
    kind: 'plant',
    code: plant.CODENAME,
    name: localName(plant),
    world: plant.OBTAINWORLD,
    image: `/assets/image/plants/plants_${plant.CODENAME}_c.webp`
  }))
);

const zombieOptions = computed<AssetOption[]>(() =>
  ((zombieFeatures as { ZOMBIES: NamedFeature[] }).ZOMBIES || []).map((zombie) => ({
    kind: 'zombie',
    code: zombie.CODENAME,
    name: localName(zombie),
    world: zombie.OBTAINWORLD,
    image: `/assets/image/zombies/Zombie_${zombie._CARDSPRITENAME || zombie.CODENAME}_0.webp`
  }))
);

const currentAssetOptions = computed(() => {
  const source =
    assetTab.value === 'plant'
      ? plantOptions.value
      : assetTab.value === 'zombie'
        ? zombieOptions.value
        : objectOptions;
  const query = assetSearch.value.trim().toLowerCase();
  return source
    .filter((item) => !query || item.code.toLowerCase().includes(query) || item.name.toLowerCase().includes(query))
    .slice(0, 80);
});

const selectedWave = computed(() => draft.value.waves.find((wave) => wave.id === selectedWaveId.value) || draft.value.waves[0]);
const selectedCellItems = computed(() => (selectedCell.value ? itemsAt(selectedCell.value.row, selectedCell.value.col) : []));
const selectedPlantAsset = computed(() => (selectedAsset.value?.kind === 'plant' ? selectedAsset.value : null));
const selectedZombieAsset = computed(() => (selectedAsset.value?.kind === 'zombie' ? selectedAsset.value : null));
const seedPlantAlreadyAdded = computed(() => !!selectedPlantAsset.value && draft.value.seedPlants.includes(selectedPlantAsset.value.code));
const canAddSelectedSeedPlant = computed(
  () => !!selectedPlantAsset.value && !seedPlantAlreadyAdded.value && draft.value.seedPlants.length < draft.value.seedSlots
);
const canAddSelectedZombie = computed(() => !!selectedZombieAsset.value && !!selectedWave.value);
const seedActionHint = ref('');
const zombieActionHint = ref('');

const validationItems = computed<ValidationItem[]>(() => {
  const items: ValidationItem[] = [];
  if (!draft.value.name.trim()) {
    items.push({ type: 'error', text: language.value === 'zh' ? '关卡名不能为空。' : 'Level name is required.' });
  }
  const expectsWaveSystem =
    (draft.value.hasWaveManager && !draft.value.preserveCustomWaveManager) ||
    draft.value.preserveGeneratorWaves ||
    draft.value.moduleRefs.includes(NEW_WAVES_REF);
  if (!draft.value.waves.length && expectsWaveSystem && !draft.value.preserveGeneratorWaves) {
    items.push({ type: 'error', text: language.value === 'zh' ? '至少需要 1 个波次。' : 'At least one wave is required.' });
  }
  draft.value.waves.forEach((wave, index) => {
    if (!wave.zombies.length && !wave.rawActions.length) {
      items.push({
        type: 'warning',
        text: language.value === 'zh' ? `第 ${index + 1} 波没有僵尸。` : `Wave ${index + 1} has no zombies.`
      });
    }
    if (wave.dynamicPlantfood.trim() && !Array.isArray(parseOptionalArrayText(wave.dynamicPlantfood))) {
      items.push({
        type: 'error',
        text:
          language.value === 'zh'
            ? `第 ${index + 1} 波的动态叶绿素需要是数组 JSON。`
            : `Wave ${index + 1} dynamic plant food must be a JSON array.`
      });
    }
    wave.rawActions.forEach((action) => {
      try {
        JSON5.parse(action.jsonText || '{}');
      } catch {
        items.push({
          type: 'error',
          text:
            language.value === 'zh'
              ? `第 ${index + 1} 波的 ${action.objclass} JSON 无法解析。`
              : `Wave ${index + 1} ${action.objclass} JSON cannot be parsed.`
        });
      }
    });
  });
  if (draft.value.seedMode === 'preset' && !draft.value.seedPlants.length) {
    items.push({
      type: 'warning',
      text: language.value === 'zh' ? '固定卡组模式下还没有选择植物。' : 'Preset seed bank has no plants.'
    });
  }
  if (draft.value.unsupportedObjects > 0) {
    items.push({
      type: 'warning',
      text:
        language.value === 'zh'
          ? `导入文件中有 ${draft.value.unsupportedObjects} 个对象已保留，但尚不能在面板中编辑。`
          : `${draft.value.unsupportedObjects} imported objects are preserved but not editable in the panels.`
    });
  }
  return items;
});

const validationSummary = computed(() => ({
  errors: validationItems.value.filter((item) => item.type === 'error').length,
  warnings: validationItems.value.filter((item) => item.type === 'warning').length
}));

const validationSummaryColor = computed(() => {
  if (validationSummary.value.errors) return 'error';
  if (validationSummary.value.warnings) return 'warning';
  return 'success';
});

const previewJson = computed(() => JSON.stringify(serializeLevel(), null, 2));

function t(key: string, vars: Record<string, string | number> = {}) {
  const template = messages[key]?.[language.value] || messages[key]?.en || key;
  return Object.entries(vars).reduce((text, [name, value]) => text.replace(`{${name}}`, String(value)), template);
}

function localName(item: NamedFeature) {
  return item.NAME?.[language.value] || item.NAME?.en || item.NAME?.zh || item.CODENAME;
}

function cloneJson<T>(value: T): T {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function omitKeys(source: Record<string, any> = {}, keys: string[]) {
  return Object.fromEntries(Object.entries(source).filter(([key]) => !keys.includes(key)));
}

function stringifyObjdata(value: Record<string, any>) {
  return JSON.stringify(value || {}, null, 2);
}

function parseActionObjdata(action: WaveActionDraft) {
  try {
    return JSON5.parse(action.jsonText || '{}');
  } catch {
    return cloneJson(action.objdata || {});
  }
}

function parseOptionalArrayText(text: string) {
  if (!text.trim()) return undefined;
  try {
    const parsed = JSON5.parse(text);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function createEmptyWave(index: number, id = nextWaveId.value++): WaveDraft {
  return {
    id,
    name: `Wave ${index}`,
    flag: false,
    zombies: [],
    additionalPlantfood: 0,
    dynamicPlantfood: '',
    spawnStyle: '',
    mustKillAllToNextWave: false,
    rawActions: []
  };
}

function createRawWaveAction(alias: string, objclass: string, objdata: Record<string, any>): WaveActionDraft {
  const data = cloneJson(objdata || {});
  return {
    id: nextWaveActionId.value++,
    alias,
    objclass,
    objdata: data,
    jsonText: stringifyObjdata(data)
  };
}

function createDefaultDraft(): LevelDraft {
  return {
    name: 'custom_level_1',
    author: '',
    description: 'Custom Level',
    stage: 'EgyptStage',
    mower: STAGE_DEFAULT_MOWER,
    sunDropper: 'DefaultSunDropper',
    startingSun: 50,
    seedMode: 'chooser',
    seedSlots: MAX_SEED_PLANTS,
    seedPlants: ['peashooter', 'sunflower', 'wallnut', 'potatomine'],
    seedPresetEntries: [],
    includePlants: [],
    excludePlants: [],
    unlockAll: false,
    seedBankExtra: {},
    boardItems: [],
    waves: [
      {
        id: 1,
        name: 'Wave 1',
        flag: false,
        zombies: [{ id: 1, code: 'mummy', label: 'mummy', count: 3 }],
        additionalPlantfood: 0,
        dynamicPlantfood: '',
        spawnStyle: '',
        mustKillAllToNextWave: false,
        rawActions: []
      }
    ],
    flagWaveInterval: 5,
    firstWaveCountdown: -1,
    suppressFlagZombie: false,
    waveSpendingPointIncrement: 30,
    waveSpendingPoints: 100,
    minNextWaveHealthPercentage: 0.55,
    maxNextWaveHealthPercentage: 0.7,
    waveManagerModuleExtra: {},
    waveManagerExtra: {},
    hasWaveManager: true,
    preserveGeneratorWaves: false,
    preserveCustomWaveManager: false,
    waveSystemDirty: false,
    levelExtra: {
      LevelNumber: 1,
      Loot: 'RTID(NoLoot@LevelModules)'
    },
    preserveBoardModules: false,
    preservedPlacementObjects: [],
    unsupportedObjects: 0,
    unsupportedRawObjects: [],
    moduleRefs: [...DEFAULT_MODULE_REFS]
  };
}

function resetDraft() {
  draft.value = createDefaultDraft();
  selectedWaveId.value = 1;
  selectedCell.value = null;
  selectedAsset.value = null;
  nextItemId.value = 1;
  nextWaveId.value = 2;
  nextZombieId.value = 2;
  nextWaveActionId.value = 1;
}

function chooseAsset(asset: AssetOption) {
  selectedAsset.value = asset;
  assetTab.value = asset.kind;
  if (asset.kind === 'plant') seedActionHint.value = '';
  if (asset.kind === 'zombie') zombieActionHint.value = '';
}

function placeAsset(row: number, col: number) {
  selectedCell.value = { row, col };
  if (!selectedAsset.value) return;
  draft.value.preserveBoardModules = false;
  const existingIndex = draft.value.boardItems.findIndex(
    (item) => item.row === row && item.col === col && item.kind === selectedAsset.value?.kind
  );
  const item: BoardItem = {
    id: nextItemId.value++,
    kind: selectedAsset.value.kind,
    code: selectedAsset.value.code,
    label: selectedAsset.value.name,
    row,
    col
  };
  if (existingIndex >= 0) draft.value.boardItems.splice(existingIndex, 1, item);
  else draft.value.boardItems.push(item);
}

function clearSelectedCell() {
  if (!selectedCell.value) return;
  draft.value.preserveBoardModules = false;
  draft.value.boardItems = draft.value.boardItems.filter(
    (item) => item.row !== selectedCell.value?.row || item.col !== selectedCell.value?.col
  );
}

function clearBoardItems() {
  draft.value.preserveBoardModules = false;
  draft.value.boardItems = [];
}

function itemsAt(row: number, col: number) {
  const layerOrder: Record<AssetKind, number> = { object: 0, plant: 1, zombie: 2 };
  return draft.value.boardItems
    .filter((item) => item.row === row && item.col === col)
    .sort((a, b) => layerOrder[a.kind] - layerOrder[b.kind]);
}

function addSeedPlant(code: string) {
  const plantCode = code;
  if (!plantCode || draft.value.seedPlants.includes(plantCode)) return;
  if (draft.value.seedPlants.length >= draft.value.seedSlots) {
    message.warning(t('seedLimit', { count: draft.value.seedSlots }));
    return;
  }
  draft.value.seedPlants.push(plantCode);
}

function addSelectedSeedPlant() {
  if (!selectedPlantAsset.value) {
    seedActionHint.value = 'selectPlantFirst';
    return;
  }
  if (seedPlantAlreadyAdded.value) {
    seedActionHint.value = 'plantAlreadyAdded';
    return;
  }
  seedActionHint.value = '';
  addSeedPlant(selectedPlantAsset.value.code);
}

function addSelectedPlantToList(listKey: PlantListKey) {
  if (!selectedPlantAsset.value) {
    seedActionHint.value = 'selectPlantFirst';
    return;
  }
  const list = draft.value[listKey];
  if (list.includes(selectedPlantAsset.value.code)) {
    seedActionHint.value = 'plantAlreadyAdded';
    return;
  }
  if (listKey === 'seedPlants' && list.length >= draft.value.seedSlots) {
    message.warning(t('seedLimit', { count: draft.value.seedSlots }));
    return;
  }
  seedActionHint.value = '';
  list.push(selectedPlantAsset.value.code);
}

function removePlantFromList(listKey: PlantListKey, code: string) {
  draft.value[listKey] = draft.value[listKey].filter((item) => item !== code);
}

function markWaveSystemEdited() {
  draft.value.hasWaveManager = true;
  draft.value.preserveGeneratorWaves = false;
  draft.value.preserveCustomWaveManager = false;
  draft.value.waveSystemDirty = true;
}

function addWave() {
  markWaveSystemEdited();
  const wave = createEmptyWave(draft.value.waves.length + 1);
  draft.value.waves.push(wave);
  selectedWaveId.value = wave.id;
}

function removeWave(id: number) {
  if (draft.value.waves.length <= 1) return;
  markWaveSystemEdited();
  draft.value.waves = draft.value.waves.filter((wave) => wave.id !== id);
  selectedWaveId.value = draft.value.waves[0].id;
}

function setWaveFlag(index: number, checked: boolean) {
  const wave = draft.value.waves[index];
  if (!wave) return;
  markWaveSystemEdited();
  wave.flag = checked;
  if (checked) {
    draft.value.flagWaveInterval = index + 1;
  }
}

function addZombieToWave(code: string) {
  if (!selectedWave.value) return;
  markWaveSystemEdited();
  const zombie = zombieOptions.value.find((item) => item.code === code);
  if (!zombie) return;
  selectedWave.value.zombies.push({ id: nextZombieId.value++, code: zombie.code, label: zombie.name, count: 1 });
}

function addSelectedZombieToWave() {
  if (!selectedZombieAsset.value) {
    zombieActionHint.value = 'selectZombieFirst';
    return;
  }
  zombieActionHint.value = '';
  addZombieToWave(selectedZombieAsset.value.code);
}

function getZombieDisplayName(code: string, fallback: string) {
  return zombieOptions.value.find((item) => item.code === code)?.name || fallback || code;
}

function getPlantDisplayName(code: string) {
  return plantOptions.value.find((item) => item.code === code)?.name || code;
}

function getObjectDisplayName(code: string) {
  return objectOptions.find((item) => item.code === code)?.name || code;
}

function getBoardItemImage(item: BoardItem) {
  if (item.kind === 'plant') return plantOptions.value.find((plant) => plant.code === item.code)?.image || '';
  if (item.kind === 'zombie') return zombieOptions.value.find((zombie) => zombie.code === item.code)?.image || '';
  return '';
}

function getBoardItemKindLabel(kind: AssetKind) {
  if (kind === 'plant') return t('cellKindPlant');
  if (kind === 'zombie') return t('cellKindZombie');
  return t('cellKindObject');
}

function normalizePlantCodes(plants: string[]) {
  return Array.from(new Set(plants.filter(Boolean)));
}

function normalizeSeedSlots(value: unknown, minimum = 0) {
  const numericValue = Number(value);
  const fallback = Math.max(MAX_SEED_PLANTS, minimum);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(MAX_SEED_PLANTS, Math.max(minimum, Math.round(numericValue)));
}

function normalizeSeedPlants(plants: string[], limit = MAX_SEED_PLANTS) {
  return normalizePlantCodes(plants).slice(0, Math.max(0, limit));
}

function buildSeedPresetPlants(plants: string[], importedEntries: Record<string, any>[]) {
  const used = new Set<number>();
  return plants.map((code) => {
    const importedIndex = importedEntries.findIndex((entry, index) => !used.has(index) && entry?.PlantType === code);
    if (importedIndex >= 0) {
      used.add(importedIndex);
      return {
        ...cloneJson(importedEntries[importedIndex]),
        PlantType: code
      };
    }
    return { PlantType: code, Level: -1 };
  });
}

function normalizeWaveRefs(entry: unknown) {
  return Array.isArray(entry) ? entry.filter(Boolean).map(String) : entry ? [String(entry)] : [];
}

function parseWaveZombieGroups(zombieEntries: any[]) {
  const groups: WaveZombie[] = [];
  zombieEntries.forEach((zombie: any) => {
    const code = parseTypeAlias(zombie?.Type) || 'mummy';
    const option = zombieOptions.value.find((item) => item.code === code);
    const normalizedEntry = cloneJson(zombie || { Type: `RTID(${code}@ZombieTypes)` });
    const existing = groups.find((item) => item.code === code);
    if (existing) {
      existing.count += 1;
      existing.entries = [...(existing.entries || []), normalizedEntry];
    } else {
      groups.push({
        id: nextZombieId.value++,
        code,
        label: option?.name || code,
        count: 1,
        entries: [normalizedEntry]
      });
    }
  });
  return groups;
}

function removeZombieFromWave(id: number) {
  if (!selectedWave.value) return;
  markWaveSystemEdited();
  selectedWave.value.zombies = selectedWave.value.zombies.filter((zombie) => zombie.id !== id);
}

function createUniqueWaveActionAlias(base: string) {
  const used = new Set<string>();
  draft.value.waves.forEach((item) => {
    if (item.zombieActionAlias) used.add(item.zombieActionAlias);
    item.rawActions.forEach((action) => used.add(action.alias));
  });
  if (!used.has(base)) return base;
  let index = 1;
  while (used.has(`${base}_${index}`)) index++;
  return `${base}_${index}`;
}

function addWaveAction(kind: 'tide' | 'dino' | 'storm' | 'ground') {
  const wave = selectedWave.value;
  if (!wave) return;
  markWaveSystemEdited();
  const waveIndex = draft.value.waves.findIndex((item) => item.id === wave.id) + 1;
  const templates = {
    tide: {
      alias: `Wave${waveIndex}TidalChangeEvent0`,
      objclass: 'TidalChangeWaveActionProps',
      objdata: { TidalChange: { ChangeAmount: 3, ChangeType: 'absolute' } }
    },
    dino: {
      alias: `Wave${waveIndex}DinoTimeEvent0`,
      objclass: 'DinoWaveActionProps',
      objdata: { DinoRow: 2, DinoType: 'raptor', DinoWaveDuration: 0 }
    },
    storm: {
      alias: `Wave${waveIndex}StormEvent0`,
      objclass: 'StormZombieSpawnerProps',
      objdata: {
        ColumnStart: 4,
        ColumnEnd: 8,
        GroupSize: 2,
        TimeBetweenGroups: 2,
        Type: 'sandstorm',
        Zombies: [{ Type: 'RTID(mummy@ZombieTypes)' }, { Type: 'RTID(mummy@ZombieTypes)' }]
      }
    },
    ground: {
      alias: `Wave${waveIndex}GroundSpawnEvent0`,
      objclass: 'SpawnZombiesFromGroundSpawnerProps',
      objdata: {
        ColumnStart: 4,
        ColumnEnd: 8,
        RowStart: 0,
        RowEnd: 4,
        Zombies: [{ Type: 'RTID(mummy@ZombieTypes)' }, { Type: 'RTID(mummy@ZombieTypes)' }]
      }
    }
  }[kind];
  wave.rawActions.push(createRawWaveAction(createUniqueWaveActionAlias(templates.alias), templates.objclass, templates.objdata));
}

function removeWaveAction(wave: WaveDraft, id: number) {
  markWaveSystemEdited();
  wave.rawActions = wave.rawActions.filter((action) => action.id !== id);
}

function updateWaveActionJson(action: WaveActionDraft, value: string) {
  markWaveSystemEdited();
  action.jsonText = value;
  try {
    action.objdata = JSON5.parse(value || '{}');
  } catch {
    // Validation reports invalid action JSON; keep the last valid object for preview stability.
  }
}

function handleUpload(file: File) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON5.parse(String(reader.result || '{}'));
      nextItemId.value = 1;
      nextWaveId.value = 1;
      nextZombieId.value = 1;
      nextWaveActionId.value = 1;
      draft.value = parseLevel(parsed);
      selectedWaveId.value = draft.value.waves[0]?.id || 1;
      selectedCell.value = null;
      message.success(t('imported'));
    } catch (error) {
      message.error(t('importFailed'));
    }
  };
  reader.readAsText(file);
  return false;
}

function parseLevel(raw: any): LevelDraft {
  const objects = Array.isArray(raw?.objects) ? raw.objects : [];
  const level = objects.find((object: any) => object?.objclass === 'LevelDefinition')?.objdata || {};
  const seed = objects.find((object: any) => object?.objclass === 'SeedBankProperties')?.objdata || {};
  const waveManagerModule = objects.find((object: any) => object?.objclass === 'WaveManagerModuleProperties');
  const waveManagerObject = objects.find((object: any) => object?.objclass === 'WaveManagerProperties');
  const waveProps = waveManagerObject?.objdata || {};
  const levelModules = Array.isArray(level.Modules) ? level.Modules.map(String) : [];
  const stage = parseLevelModuleAlias(level.StageModule) || 'EgyptStage';
  const stageDefaultMower = stageOptions.find((item) => item.value === stage)?.mower || NO_MODULE;
  const importedMower = mowerOptions
    .filter((option) => option.value !== STAGE_DEFAULT_MOWER && option.value !== NO_MODULE)
    .find((option) => levelModules.includes(`RTID(${option.value}@LevelModules)`))?.value;
  const importedSunDropper = sunDropperOptions
    .filter((option) => option.value !== NO_MODULE)
    .find((option) => levelModules.includes(`RTID(${option.value}@LevelModules)`))?.value;
  const aliasMap = new Map<string, any>();
  objects.forEach((object: any) => {
    (object?.aliases || []).forEach((alias: string) => aliasMap.set(alias, object));
  });

  const waveActionAliases = new Set<string>();
  const waves: WaveDraft[] = (Array.isArray(waveProps.Waves) ? waveProps.Waves : []).map((entryRefs: unknown, index: number) => {
    const wave = createEmptyWave(index + 1, index + 1);
    wave.flag = (index + 1) % Number(waveProps.FlagWaveInterval || 10) === 0;
    normalizeWaveRefs(entryRefs).forEach((entry) => {
      const alias = parseCurrentLevelAlias(entry);
      const waveObject = alias ? aliasMap.get(alias) : null;
      if (!waveObject) return;
      waveActionAliases.add(alias);
      if (waveObject.objclass === 'SpawnZombiesJitteredWaveActionProps' && !wave.zombieActionAlias) {
        const objdata = waveObject.objdata || {};
        wave.zombieActionAlias = alias;
        wave.zombieActionExtra = omitKeys(objdata, ['Zombies', 'AdditionalPlantfood', 'DynamicPlantfood', 'Style', 'MustKillAllToNextWave']);
        wave.additionalPlantfood = Math.max(0, Number(objdata.AdditionalPlantfood || 0));
        wave.dynamicPlantfood = Array.isArray(objdata.DynamicPlantfood) ? JSON.stringify(objdata.DynamicPlantfood) : '';
        wave.spawnStyle = String(objdata.Style || '');
        wave.mustKillAllToNextWave = objdata.MustKillAllToNextWave === true;
        wave.zombies = parseWaveZombieGroups(Array.isArray(objdata.Zombies) ? objdata.Zombies : []);
      } else {
        wave.rawActions.push(createRawWaveAction(alias, String(waveObject.objclass || 'WaveActionProps'), waveObject.objdata || {}));
      }
    });
    return wave;
  });

  const boardItems: BoardItem[] = [];
  objects
    .filter((object: any) => object?.objclass === 'GravestoneProperties')
    .forEach((object: any) => {
      (object?.objdata?.ForceSpawnData || []).forEach((entry: any) => {
        boardItems.push({
          id: nextItemId.value++,
          kind: 'object',
          code: entry.TypeName || 'gravestone',
          label: entry.TypeName || 'gravestone',
          row: Number(entry.GridY || 0),
          col: Number(entry.GridX || 0)
        });
      });
    });
  objects
    .filter((object: any) => object?.objclass === 'InitialGridItemProperties')
    .forEach((object: any) => {
      (object?.objdata?.InitialGridItemPlacements || []).forEach((entry: any) => {
        boardItems.push({
          id: nextItemId.value++,
          kind: 'object',
          code: entry.TypeName,
          label: getObjectDisplayName(entry.TypeName),
          row: Number(entry.GridY || 0),
          col: Number(entry.GridX || 0),
          extra: getPlacementExtra(entry)
        });
      });
      (object?.objdata?.InitialGridItemMatrixes || []).forEach((matrix: any) => {
        (matrix.GridMatrix || []).forEach((line: string, row: number) => {
          line.split('').forEach((cell, col) => {
            if (cell === '1') {
              boardItems.push({
                id: nextItemId.value++,
                kind: 'object',
                code: matrix.TypeName,
                label: getObjectDisplayName(matrix.TypeName),
                row,
                col
              });
            }
          });
        });
      });
    });
  objects
    .filter((object: any) => object?.objclass === 'InitialPlantProperties')
    .forEach((object: any) => {
      (object?.objdata?.InitialPlantPlacements || []).forEach((entry: any) => {
        boardItems.push({
          id: nextItemId.value++,
          kind: 'plant',
          code: entry.TypeName,
          label: getPlantDisplayName(entry.TypeName),
          row: Number(entry.GridY || 0),
          col: Number(entry.GridX || 0),
          extra: getPlacementExtra(entry)
        });
      });
    });
  objects
    .filter((object: any) => object?.objclass === 'InitialZombieProperties')
    .forEach((object: any) => {
      (object?.objdata?.InitialZombiePlacements || []).forEach((entry: any) => {
        boardItems.push({
          id: nextItemId.value++,
          kind: 'zombie',
          code: entry.TypeName,
          label: getZombieDisplayName(entry.TypeName, entry.TypeName),
          row: Number(entry.GridY || 0),
          col: Number(entry.GridX || 0),
          extra: getPlacementExtra(entry)
        });
      });
    });

  const placementClasses = new Set(['InitialGridItemProperties', 'InitialPlantProperties', 'InitialZombieProperties', 'GravestoneProperties']);
  const preservedPlacementObjects = objects.filter((object: any) => placementClasses.has(object?.objclass)).map((object: any) => cloneJson(object));
  const supportedClasses = new Set([
    'LevelDefinition',
    'SeedBankProperties',
    'WaveManagerModuleProperties',
    'WaveManagerProperties',
    'SpawnZombiesJitteredWaveActionProps',
    'InitialGridItemProperties',
    'InitialPlantProperties',
    'InitialZombieProperties',
    'GravestoneProperties'
  ]);
  const unsupportedRawObjects = objects.filter(
    (object: any) => !supportedClasses.has(object?.objclass) && !(object?.aliases || []).some((alias: string) => waveActionAliases.has(alias))
  );
  const seedPresetPlants = Array.isArray(seed.PresetPlantList) ? seed.PresetPlantList.map((item: any) => item.PlantType) : [];
  const seedPresetEntries = Array.isArray(seed.PresetPlantList) ? seed.PresetPlantList.map((item: any) => cloneJson(item)) : [];
  const seedSlots = normalizeSeedSlots(seed.OverrideSeedSlotsCount ?? MAX_SEED_PLANTS, seedPresetPlants.length);
  const preserveCustomWaveManager = !!waveManagerObject && !Array.isArray(waveProps.Waves) && !waveManagerModule;
  nextWaveId.value = waves.length + 1;

  return {
    name: String(level.Name || raw?.['#comment'] || 'custom_level_1'),
    author: String(level.WritenBy || raw?.Information?.Author || ''),
    description: String(level.Description || ''),
    stage,
    mower: importedMower ? (importedMower === stageDefaultMower ? STAGE_DEFAULT_MOWER : importedMower) : NO_MODULE,
    sunDropper: importedSunDropper || NO_MODULE,
    startingSun: Number(level.StartingSun ?? 50),
    seedMode: seed.SelectionMethod === 'preset' ? 'preset' : 'chooser',
    seedSlots,
    seedPresetEntries,
    seedPlants: normalizeSeedPlants(seedPresetPlants, seedSlots),
    includePlants: normalizePlantCodes(Array.isArray(seed.PlantIncludeList) ? seed.PlantIncludeList : []),
    excludePlants: normalizePlantCodes(Array.isArray(seed.PlantExcludeList) ? seed.PlantExcludeList : []),
    unlockAll: seed.UnlockAll === true,
    seedBankExtra: omitKeys(seed, ['SelectionMethod', 'UnlockAll', 'OverrideSeedSlotsCount', 'PresetPlantList', 'PlantIncludeList', 'PlantExcludeList']),
    boardItems,
    waves: waves.length ? waves : [],
    flagWaveInterval: Math.max(1, Number(waveProps.FlagWaveInterval || 5)),
    firstWaveCountdown: Number(waveProps.ZombieCountdownFirstWaveSecs ?? -1),
    suppressFlagZombie: waveProps.SuppressFlagZombie === true,
    waveSpendingPointIncrement: Number(waveProps.WaveSpendingPointIncrement ?? 30),
    waveSpendingPoints: Number(waveProps.WaveSpendingPoints ?? 100),
    minNextWaveHealthPercentage: Number(waveProps.MinNextWaveHealthPercentage ?? 0.55),
    maxNextWaveHealthPercentage: Number(waveProps.MaxNextWaveHealthPercentage ?? 0.7),
    waveManagerModuleExtra: omitKeys(waveManagerModule?.objdata || {}, ['WaveManagerProps']),
    waveManagerExtra: omitKeys(waveProps, [
      'FlagWaveInterval',
      'WaveCount',
      'WaveSpendingPointIncrement',
      'WaveSpendingPoints',
      'Waves',
      'SuppressFlagZombie',
      'ZombieCountdownFirstWaveSecs',
      'MinNextWaveHealthPercentage',
      'MaxNextWaveHealthPercentage'
    ]),
    hasWaveManager: !!waveManagerObject,
    preserveGeneratorWaves: !Array.isArray(waveProps.Waves) && !!waveManagerModule,
    preservedWaveManagerModule: !Array.isArray(waveProps.Waves) && waveManagerModule ? cloneJson(waveManagerModule) : undefined,
    preserveCustomWaveManager,
    preservedWaveManagerObject: preserveCustomWaveManager ? cloneJson(waveManagerObject) : undefined,
    waveSystemDirty: false,
    levelExtra: omitKeys(level, ['Name', 'Description', 'StageModule', 'Modules', 'StartingSun', 'WritenBy']),
    preserveBoardModules: preservedPlacementObjects.length > 0,
    preservedPlacementObjects,
    unsupportedObjects: unsupportedRawObjects.length,
    unsupportedRawObjects,
    moduleRefs: uniqueRefs(levelModules)
  };
}

function parseCurrentLevelAlias(value: string) {
  return /^RTID\((.+)@CurrentLevel\)$/.exec(value || '')?.[1] || '';
}

function parseLevelModuleAlias(value: string) {
  return /^RTID\((.+)@LevelModules\)$/.exec(value || '')?.[1] || '';
}

function parseTypeAlias(value: string) {
  return /^RTID\((.+)@(?:ZombieTypes|PlantTypes)\)$/.exec(value || '')?.[1] || '';
}

function getPlacementExtra(entry: any) {
  const { GridX, GridY, TypeName, ...extra } = entry || {};
  return Object.keys(extra).length ? extra : undefined;
}

function serializeBoardPlacement(item: BoardItem) {
  return {
    ...(item.extra || {}),
    GridX: item.col,
    GridY: item.row,
    TypeName: item.code
  };
}

function serializeWaveZombies(wave: WaveDraft) {
  return wave.zombies.flatMap((zombie) => {
    const templates = zombie.entries?.length ? zombie.entries : [{ Type: `RTID(${zombie.code}@ZombieTypes)` }];
    return Array.from({ length: Math.max(1, Number(zombie.count) || 1) }, (_, index) => {
      const template = cloneJson(templates[Math.min(index, templates.length - 1)] || {});
      return {
        ...template,
        Type: `RTID(${zombie.code}@ZombieTypes)`
      };
    });
  });
}

function replaceModuleGroup(refs: string[], group: Set<string>, selectedRef: string | null) {
  const result: string[] = [];
  let inserted = false;
  let foundGroup = false;
  refs.forEach((ref) => {
    if (!group.has(ref)) {
      result.push(ref);
      return;
    }
    foundGroup = true;
    if (selectedRef && !inserted) {
      result.push(selectedRef);
      inserted = true;
    }
  });
  if (!foundGroup && selectedRef) result.push(selectedRef);
  return uniqueRefs(result);
}

function setModuleRef(refs: string[], ref: string, enabled: boolean) {
  if (!enabled) return refs.filter((item) => item !== ref);
  return refs.includes(ref) ? refs : [...refs, ref];
}

function buildModuleRefs(
  mowerModule: string,
  sunDropperModule: string,
  shouldReferenceWaveManager: boolean,
  generatedBoardRefs: string[]
) {
  const mowerRefs = new Set(
    mowerOptions
      .filter((option) => option.value !== STAGE_DEFAULT_MOWER && option.value !== NO_MODULE)
      .map((option) => `RTID(${option.value}@LevelModules)`)
  );
  const sunDropperRefs = new Set(
    sunDropperOptions.filter((option) => option.value !== NO_MODULE).map((option) => `RTID(${option.value}@LevelModules)`)
  );
  let refs = [...draft.value.moduleRefs];
  refs = replaceModuleGroup(refs, sunDropperRefs, sunDropperModule !== NO_MODULE ? `RTID(${sunDropperModule}@LevelModules)` : null);
  refs = replaceModuleGroup(refs, mowerRefs, mowerModule !== NO_MODULE ? `RTID(${mowerModule}@LevelModules)` : null);
  refs = setModuleRef(refs, NEW_WAVES_REF, shouldReferenceWaveManager);

  if (!draft.value.preserveBoardModules) {
    const boardRefs = new Set([
      'RTID(InitialGridItems@CurrentLevel)',
      'RTID(FrozenPlantPlacement@CurrentLevel)',
      'RTID(FrozenZombiePlacement@CurrentLevel)',
      ...draft.value.preservedPlacementObjects.flatMap((object) => (object?.aliases || []).map((alias: string) => `RTID(${alias}@CurrentLevel)`))
    ]);
    refs = refs.filter((ref) => !boardRefs.has(ref));
    refs.push(...generatedBoardRefs);
  }

  return uniqueRefs(refs);
}

function serializeLevel() {
  const stage = stageOptions.find((item) => item.value === draft.value.stage) || stageOptions[2];
  const mowerModule = draft.value.mower === STAGE_DEFAULT_MOWER ? stage.mower : draft.value.mower;
  const sunDropperModule = draft.value.sunDropper;
  const seedSlots = normalizeSeedSlots(draft.value.seedSlots, draft.value.seedPlants.length);
  const normalizedSeedPlants = normalizeSeedPlants(draft.value.seedPlants, seedSlots);
  const preserveGeneratorWaveSystem = draft.value.preserveGeneratorWaves && !draft.value.waves.length && draft.value.preservedWaveManagerModule;
  const preserveCustomWaveManager =
    draft.value.preserveCustomWaveManager && !draft.value.waves.length && draft.value.preservedWaveManagerObject && !draft.value.waveSystemDirty;
  const shouldEmitWaveManager =
    !!preserveGeneratorWaveSystem || !!preserveCustomWaveManager || draft.value.hasWaveManager || draft.value.waves.length > 0;
  const shouldReferenceWaveManager = draft.value.moduleRefs.includes(NEW_WAVES_REF) || (draft.value.waveSystemDirty && draft.value.waves.length > 0);
  const usedActionAliases = new Set<string>([
    'SeedBank',
    'NewWaves',
    'WaveManagerProps',
    'InitialGridItems',
    'FrozenPlantPlacement',
    'FrozenZombiePlacement',
    ...draft.value.preservedPlacementObjects.flatMap((object) => object?.aliases || []),
    ...draft.value.unsupportedRawObjects.flatMap((object) => object?.aliases || [])
  ]);
  const uniqueActionAlias = (preferred: string) => {
    let alias = preferred || 'WaveAction';
    if (!usedActionAliases.has(alias)) {
      usedActionAliases.add(alias);
      return alias;
    }
    let index = 1;
    while (usedActionAliases.has(`${alias}_${index}`)) index++;
    alias = `${alias}_${index}`;
    usedActionAliases.add(alias);
    return alias;
  };
  const waveObjects: any[] = [];
  const waveRefs = draft.value.waves.map((wave, index) => {
    const refs: string[] = [];
    if (wave.zombies.length || wave.zombieActionAlias) {
      const alias = uniqueActionAlias(wave.zombieActionAlias || `Wave${index + 1}`);
      const dynamicPlantfood = parseOptionalArrayText(wave.dynamicPlantfood);
      const objdata: Record<string, any> = {
        ...(wave.zombieActionExtra || {}),
        ...(wave.additionalPlantfood > 0 ? { AdditionalPlantfood: Math.max(0, Number(wave.additionalPlantfood) || 0) } : {}),
        ...(Array.isArray(dynamicPlantfood) ? { DynamicPlantfood: dynamicPlantfood } : {}),
        ...(wave.spawnStyle ? { Style: wave.spawnStyle } : {}),
        ...(wave.mustKillAllToNextWave ? { MustKillAllToNextWave: true } : {}),
        Zombies: serializeWaveZombies(wave)
      };
      waveObjects.push({
        aliases: [alias],
        objclass: 'SpawnZombiesJitteredWaveActionProps',
        objdata
      });
      refs.push(`RTID(${alias}@CurrentLevel)`);
    }
    wave.rawActions.forEach((action, actionIndex) => {
      const alias = uniqueActionAlias(action.alias || `Wave${index + 1}Action${actionIndex}`);
      waveObjects.push({
        aliases: [alias],
        objclass: action.objclass,
        objdata: parseActionObjdata(action)
      });
      refs.push(`RTID(${alias}@CurrentLevel)`);
    });
    return refs;
  });

  const gridItems = draft.value.boardItems.filter((item) => item.kind === 'object').map(serializeBoardPlacement);
  const initialPlants = draft.value.boardItems.filter((item) => item.kind === 'plant').map(serializeBoardPlacement);
  const initialZombies = draft.value.boardItems.filter((item) => item.kind === 'zombie').map(serializeBoardPlacement);
  const generatedBoardRefs = [
    ...(!draft.value.preserveBoardModules && gridItems.length ? ['RTID(InitialGridItems@CurrentLevel)'] : []),
    ...(!draft.value.preserveBoardModules && initialPlants.length ? ['RTID(FrozenPlantPlacement@CurrentLevel)'] : []),
    ...(!draft.value.preserveBoardModules && initialZombies.length ? ['RTID(FrozenZombiePlacement@CurrentLevel)'] : [])
  ];
  const seedPresetPlants = buildSeedPresetPlants(normalizedSeedPlants, draft.value.seedPresetEntries);
  const seedBankData: Record<string, any> = {
    ...draft.value.seedBankExtra,
    SelectionMethod: draft.value.seedMode,
    ...(draft.value.unlockAll ? { UnlockAll: true } : {}),
    ...(seedSlots > 0 ? { OverrideSeedSlotsCount: seedSlots } : {}),
    ...(seedPresetPlants.length || draft.value.seedMode === 'preset' ? { PresetPlantList: seedPresetPlants } : {}),
    ...(draft.value.includePlants.length ? { PlantIncludeList: normalizePlantCodes(draft.value.includePlants) } : {}),
    ...(draft.value.excludePlants.length ? { PlantExcludeList: normalizePlantCodes(draft.value.excludePlants) } : {})
  };
  const waveManagerData: Record<string, any> = {
    ...draft.value.waveManagerExtra,
    MinNextWaveHealthPercentage: Number(draft.value.minNextWaveHealthPercentage),
    MaxNextWaveHealthPercentage: Number(draft.value.maxNextWaveHealthPercentage),
    FlagWaveInterval: Math.max(1, Number(draft.value.flagWaveInterval) || 5),
    WaveCount: draft.value.waves.length,
    WaveSpendingPointIncrement: Number(draft.value.waveSpendingPointIncrement),
    WaveSpendingPoints: Number(draft.value.waveSpendingPoints),
    Waves: waveRefs,
    ...(draft.value.suppressFlagZombie ? { SuppressFlagZombie: true } : {})
  };
  if (Number(draft.value.firstWaveCountdown) >= 0) {
    waveManagerData.ZombieCountdownFirstWaveSecs = Number(draft.value.firstWaveCountdown) === 0 ? 0.1 : Number(draft.value.firstWaveCountdown);
  }

  const objects: any[] = [
    {
      objclass: 'LevelDefinition',
      objdata: {
        ...draft.value.levelExtra,
        Name: draft.value.name,
        Description: draft.value.description,
        StartingSun: Number(draft.value.startingSun) || 0,
        StageModule: `RTID(${draft.value.stage}@LevelModules)`,
        Modules: buildModuleRefs(mowerModule, sunDropperModule, shouldReferenceWaveManager, generatedBoardRefs),
        ...(draft.value.author.trim() ? { WritenBy: draft.value.author.trim() } : {})
      }
    },
    {
      aliases: ['SeedBank'],
      objclass: 'SeedBankProperties',
      objdata: seedBankData
    }
  ];

  if (preserveGeneratorWaveSystem) {
    objects.push(cloneJson(draft.value.preservedWaveManagerModule));
  } else if (preserveCustomWaveManager) {
    objects.push(cloneJson(draft.value.preservedWaveManagerObject));
  } else if (shouldEmitWaveManager) {
    objects.push(
      {
        aliases: ['NewWaves'],
        objclass: 'WaveManagerModuleProperties',
        objdata: { ...draft.value.waveManagerModuleExtra, WaveManagerProps: 'RTID(WaveManagerProps@CurrentLevel)' }
      },
      {
        aliases: ['WaveManagerProps'],
        objclass: 'WaveManagerProperties',
        objdata: waveManagerData
      },
      ...waveObjects
    );
  }

  if (draft.value.preserveBoardModules) {
    objects.push(...draft.value.preservedPlacementObjects.map((object) => cloneJson(object)));
  } else if (gridItems.length) {
    objects.push({
      aliases: ['InitialGridItems'],
      objclass: 'InitialGridItemProperties',
      objdata: { InitialGridItemPlacements: gridItems }
    });
  }

  if (!draft.value.preserveBoardModules && initialPlants.length) {
    objects.push({
      aliases: ['FrozenPlantPlacement'],
      objclass: 'InitialPlantProperties',
      objdata: { InitialPlantPlacements: initialPlants }
    });
  }

  if (!draft.value.preserveBoardModules && initialZombies.length) {
    objects.push({
      aliases: ['FrozenZombiePlacement'],
      objclass: 'InitialZombieProperties',
      objdata: { InitialZombiePlacements: initialZombies }
    });
  }

  objects.push(...draft.value.unsupportedRawObjects);

  return {
    '#comment': draft.value.name,
    version: 1,
    objects
  };
}

function uniqueRefs(refs: string[]) {
  return [...new Set(refs.filter(Boolean))];
}

function exportLevel() {
  if (validationSummary.value.errors > 0) {
    message.warning(t('exportBlocked'));
    return;
  }
  const text = JSON.stringify(serializeLevel(), null, 2);
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${draft.value.name || 'custom_level'}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function openPreview() {
  previewOpen.value = true;
}

async function copyPreview() {
  try {
    await navigator.clipboard.writeText(previewJson.value);
    message.success(t('copied'));
  } catch {
    message.warning(t('copyFailed'));
  }
}

const BasicForm = defineComponent({
  setup() {
    return () =>
      h('div', { class: 'basic-form' }, [
        h('div', { class: 'field-row name-field' }, [
          h('label', t('levelName')),
          h('input', {
            value: draft.value.name,
            onInput: (event: Event) => {
              draft.value.name = (event.target as HTMLInputElement).value;
            }
          })
        ]),
        h('div', { class: 'field-row wide' }, [
          h('label', t('description')),
          h('input', {
            value: draft.value.description,
            onInput: (event: Event) => {
              draft.value.description = (event.target as HTMLInputElement).value;
            }
          })
        ]),
        h('div', { class: 'field-row' }, [
          h('label', t('stage')),
          h(
            'select',
            {
              value: draft.value.stage,
              onChange: (event: Event) => {
                draft.value.stage = (event.target as HTMLSelectElement).value;
              }
            },
            stageOptions.map((stage) => h('option', { value: stage.value }, stage.label))
          )
        ]),
        h('div', { class: 'field-row compact' }, [
          h('label', t('startingSun')),
          h('input', {
            type: 'number',
            min: 0,
            value: draft.value.startingSun,
            onInput: (event: Event) => {
              draft.value.startingSun = Number((event.target as HTMLInputElement).value);
            }
          })
        ]),
        h('details', { class: 'advanced-details wide' }, [
          h('summary', t('advancedLevel')),
          h('div', { class: 'advanced-grid' }, [
            h('div', { class: 'field-row' }, [
              h('label', t('author')),
              h('input', {
                value: draft.value.author,
                onInput: (event: Event) => {
                  draft.value.author = (event.target as HTMLInputElement).value;
                }
              })
            ]),
            h('div', { class: 'field-row' }, [
              h('label', t('mower')),
              h(
                'select',
                {
                  value: draft.value.mower,
                  onChange: (event: Event) => {
                    draft.value.mower = (event.target as HTMLSelectElement).value;
                  }
                },
                mowerOptions.map((option) => h('option', { value: option.value }, option.value === STAGE_DEFAULT_MOWER ? t('stageDefault') : option.label))
              )
            ]),
            h('div', { class: 'field-row' }, [
              h('label', t('sunDropper')),
              h(
                'select',
                {
                  value: draft.value.sunDropper,
                  onChange: (event: Event) => {
                    draft.value.sunDropper = (event.target as HTMLSelectElement).value;
                  }
                },
                sunDropperOptions.map((option) => h('option', { value: option.value }, option.value === NO_MODULE ? t('none') : option.label))
              )
            ])
          ])
        ])
      ]);
  }
});

const AssetLibrary = defineComponent({
  setup() {
    return () =>
      h('aside', { class: 'asset-library' }, [
        h('div', { class: 'panel-title' }, t('chooseAsset')),
        h('div', { class: 'segmented' }, [
          h('button', { class: assetTab.value === 'plant' ? 'active' : '', onClick: () => (assetTab.value = 'plant') }, t('plants')),
          h('button', { class: assetTab.value === 'zombie' ? 'active' : '', onClick: () => (assetTab.value = 'zombie') }, t('zombies')),
          h('button', { class: assetTab.value === 'object' ? 'active' : '', onClick: () => (assetTab.value = 'object') }, t('objects'))
        ]),
        h('input', {
          class: 'asset-search',
          placeholder: t('search'),
          value: assetSearch.value,
          onInput: (event: Event) => {
            assetSearch.value = (event.target as HTMLInputElement).value;
          }
        }),
        h(
          'div',
          { class: 'asset-list' },
          currentAssetOptions.value.map((asset) =>
            h(
              'button',
              {
                class: ['asset-row', selectedAsset.value?.kind === asset.kind && selectedAsset.value?.code === asset.code ? 'active' : ''],
                onClick: () => chooseAsset(asset)
              },
              [
                asset.image ? h('img', { src: asset.image, alt: asset.name, loading: 'lazy' }) : h('span', { class: 'object-dot' }),
                h('span', { class: 'asset-copy' }, [h('strong', asset.name), h('small', asset.code)])
              ]
            )
          )
        )
      ]);
  }
});

const BoardEditor = defineComponent({
  setup() {
    return () =>
      h('section', { class: 'board-editor' }, [
        h('div', { class: 'board-header' }, [
          h('div', [h('strong', t('board')), h('span', selectedAsset.value ? `${t('selected')}: ${selectedAsset.value.name}` : t('emptyCell'))]),
          h('div', { class: 'board-actions' }, [
            selectedCell.value
              ? h('button', { class: 'text-button', onClick: clearSelectedCell }, [h(DeleteOutlined), t('clearCell')])
              : null,
            h('button', { class: 'text-button danger', disabled: !draft.value.boardItems.length, onClick: clearBoardItems }, [
              h(DeleteOutlined),
              t('clearBoard')
            ])
          ])
        ]),
        h(
          'div',
          { class: `lawn-grid stage-${draft.value.stage.toLowerCase()}` },
          Array.from({ length: 5 }, (_, row) =>
            Array.from({ length: 9 }, (_, col) => {
              const items = itemsAt(row, col);
              return h(
                'button',
                {
                  class: [
                    'lawn-cell',
                    items.length ? 'has-items' : '',
                    selectedCell.value?.row === row && selectedCell.value?.col === col ? 'selected' : ''
                  ],
                  onClick: () => placeAsset(row, col)
                },
                items.length
                  ? h(
                      'span',
                      { class: 'cell-stack' },
                      items.map((item) =>
                        h(
                          'span',
                          {
                            class: `cell-marker ${item.kind}`,
                            title: `${getBoardItemKindLabel(item.kind)}: ${item.label}`
                          },
                          getBoardItemImage(item)
                            ? h('img', { src: getBoardItemImage(item), alt: item.label, loading: 'lazy' })
                            : h('span', { class: `cell-chip ${item.kind}` }, item.kind === 'plant' ? 'P' : item.kind === 'zombie' ? 'Z' : 'O')
                        )
                      )
                    )
                  : h('span', { class: 'cell-coord' }, `${col + 1},${row + 1}`)
              );
            })
          ).flat()
        ),
        h('div', { class: 'cell-detail-panel' }, [
          h(
            'div',
            { class: 'cell-detail-title' },
            selectedCell.value ? t('selectedCellTitle', { col: selectedCell.value.col + 1, row: selectedCell.value.row + 1 }) : t('selectedCellNone')
          ),
          selectedCell.value
            ? selectedCellItems.value.length
              ? h(
                  'div',
                  { class: 'cell-detail-list' },
                  selectedCellItems.value.map((item) =>
                    h('span', { class: `cell-detail-pill ${item.kind}` }, [
                      getBoardItemImage(item)
                        ? h('img', { src: getBoardItemImage(item), alt: item.label, loading: 'lazy' })
                        : h('span', { class: `cell-chip ${item.kind}` }, item.kind === 'plant' ? 'P' : item.kind === 'zombie' ? 'Z' : 'O'),
                      h('span', { class: 'cell-detail-copy' }, [h('strong', item.label), h('small', getBoardItemKindLabel(item.kind))])
                    ])
                  )
                )
              : h('div', { class: 'cell-detail-empty' }, t('selectedCellEmpty'))
            : h('div', { class: 'cell-detail-empty' }, t('selectedCellHint'))
        ])
      ]);
  }
});

function renderPlantPills(listKey: PlantListKey) {
  const list = draft.value[listKey];
  return h(
    'div',
    { class: 'seed-list' },
    list.length
      ? list.map((code) => {
          const plant = plantOptions.value.find((item) => item.code === code);
          return h('span', { class: 'seed-pill' }, [
            plant?.image ? h('img', { src: plant.image, alt: plant.name, loading: 'lazy' }) : null,
            h('span', plant?.name || code),
            h('button', { onClick: () => removePlantFromList(listKey, code) }, 'x')
          ]);
        })
      : h('small', { class: 'seed-mode-hint' }, t('emptyList'))
  );
}

const PropertyPanel = defineComponent({
  setup() {
    return () =>
      h('aside', { class: 'property-panel-inner' }, [
        h('div', { class: 'panel-title' }, t('propertyPanel')),
        h('div', { class: 'property-section' }, [
          h('strong', `${t('seedBank')} ${draft.value.seedPlants.length}/${draft.value.seedSlots}`),
          h('div', { class: 'segmented stacked' }, [
            h('button', { class: draft.value.seedMode === 'chooser' ? 'active' : '', onClick: () => (draft.value.seedMode = 'chooser') }, t('seedChooser')),
            h('button', { class: draft.value.seedMode === 'preset' ? 'active' : '', onClick: () => (draft.value.seedMode = 'preset') }, t('seedPreset'))
          ]),
          h('small', { class: 'seed-mode-hint' }, t(draft.value.seedMode === 'chooser' ? 'seedChooserHint' : 'seedPresetHint')),
          renderPlantPills('seedPlants'),
          h('div', { class: 'action-row' }, [
            h(
              'button',
              {
                class: ['add-button', !canAddSelectedSeedPlant.value ? 'is-disabled' : ''],
                'aria-disabled': !canAddSelectedSeedPlant.value ? 'true' : 'false',
                onClick: addSelectedSeedPlant
              },
              [h(PlusOutlined), t('plants')]
            ),
            seedActionHint.value ? h('small', { class: 'action-hint' }, t(seedActionHint.value)) : null
          ]),
          h('details', { class: 'advanced-details' }, [
            h('summary', t('advancedSeedBank')),
            h('div', { class: 'advanced-grid single' }, [
              h('div', { class: 'field-row compact' }, [
                h('label', t('seedSlots')),
                h('input', {
                  type: 'number',
                  min: 0,
                  max: MAX_SEED_PLANTS,
                  value: draft.value.seedSlots,
                  onInput: (event: Event) => {
                    draft.value.seedSlots = normalizeSeedSlots((event.target as HTMLInputElement).value, draft.value.seedPlants.length);
                    draft.value.seedPlants = normalizeSeedPlants(draft.value.seedPlants, draft.value.seedSlots);
                  }
                })
              ]),
              h('label', { class: 'check-row' }, [
                h('input', {
                  type: 'checkbox',
                  checked: draft.value.unlockAll,
                  onChange: (event: Event) => {
                    draft.value.unlockAll = (event.target as HTMLInputElement).checked;
                  }
                }),
                t('unlockAll')
              ]),
              h('div', { class: 'plant-list-block' }, [
                h('strong', t('includePlants')),
                renderPlantPills('includePlants'),
                h('button', { class: 'add-button small', onClick: () => addSelectedPlantToList('includePlants') }, [h(PlusOutlined), t('addSelectedPlant')])
              ]),
              h('div', { class: 'plant-list-block' }, [
                h('strong', t('excludePlants')),
                renderPlantPills('excludePlants'),
                h('button', { class: 'add-button small', onClick: () => addSelectedPlantToList('excludePlants') }, [h(PlusOutlined), t('addSelectedPlant')])
              ])
            ])
          ])
        ])
      ]);
  }
});

function renderWaveAdvancedEditor(wave: WaveDraft) {
  return h('details', { class: 'advanced-details' }, [
    h('summary', t('advancedCurrentWave')),
    h('div', { class: 'wave-advanced-body' }, [
      h('div', { class: 'advanced-grid' }, [
        h('div', { class: 'field-row compact' }, [
          h('label', t('additionalPlantfood')),
          h('input', {
            type: 'number',
            min: 0,
            value: wave.additionalPlantfood,
            onInput: (event: Event) => {
              markWaveSystemEdited();
              wave.additionalPlantfood = Math.max(0, Number((event.target as HTMLInputElement).value) || 0);
            }
          })
        ]),
        h('div', { class: 'field-row compact' }, [
          h('label', t('spawnStyle')),
          h(
            'select',
            {
              value: wave.spawnStyle,
              onChange: (event: Event) => {
                markWaveSystemEdited();
                wave.spawnStyle = (event.target as HTMLSelectElement).value;
              }
            },
            [
              h('option', { value: '' }, t('styleDefault')),
              h('option', { value: 'appear' }, 'appear'),
              h('option', { value: 'sandstorm' }, 'sandstorm'),
              h('option', { value: 'snowstorm' }, 'snowstorm')
            ]
          )
        ]),
        h('div', { class: 'field-row compact' }, [
          h('label', t('dynamicPlantfood')),
          h('input', {
            value: wave.dynamicPlantfood,
            placeholder: '[1,1,1,0,0]',
            onInput: (event: Event) => {
              markWaveSystemEdited();
              wave.dynamicPlantfood = (event.target as HTMLInputElement).value;
            }
          })
        ]),
        h('label', { class: 'check-row advanced-check' }, [
          h('input', {
            type: 'checkbox',
            checked: wave.mustKillAllToNextWave,
            onChange: (event: Event) => {
              markWaveSystemEdited();
              wave.mustKillAllToNextWave = (event.target as HTMLInputElement).checked;
            }
          }),
          t('mustKillAllToNextWave')
        ])
      ]),
      h('div', { class: 'special-action-buttons' }, [
        h('span', t('addSpecialAction')),
        h('button', { class: 'add-button small', onClick: () => addWaveAction('tide') }, t('addTideAction')),
        h('button', { class: 'add-button small', onClick: () => addWaveAction('dino') }, t('addDinoAction')),
        h('button', { class: 'add-button small', onClick: () => addWaveAction('storm') }, t('addStormAction')),
        h('button', { class: 'add-button small', onClick: () => addWaveAction('ground') }, t('addGroundSpawnAction'))
      ]),
      wave.rawActions.length
        ? h(
            'div',
            { class: 'raw-action-list' },
            wave.rawActions.map((action) =>
              h('div', { class: 'raw-action-card' }, [
                h('div', { class: 'raw-action-title' }, [
                  h('span', [h('strong', action.objclass), h('small', action.alias)]),
                  h('button', { class: 'text-button danger', onClick: () => removeWaveAction(wave, action.id) }, t('remove'))
                ]),
                h('textarea', {
                  value: action.jsonText,
                  spellcheck: 'false',
                  onInput: (event: Event) => updateWaveActionJson(action, (event.target as HTMLTextAreaElement).value)
                })
              ])
            )
          )
        : h('small', { class: 'seed-mode-hint' }, t('noSpecialActions'))
    ])
  ]);
}

const WaveTimeline = defineComponent({
  setup() {
    return () =>
      h('section', { class: 'wave-panel' }, [
        h('div', { class: 'panel-title row-title' }, [
          h('span', t('waves')),
          h('button', { class: 'add-button small', onClick: addWave }, [h(PlusOutlined), t('addWave')])
        ]),
        h(
          'div',
          { class: 'wave-strip' },
          draft.value.waves.map((wave, index) => {
            const zombieCount = wave.zombies.reduce((sum, zombie) => sum + zombie.count, 0);
            const actionCount = wave.rawActions.length;
            return h(
              'button',
              {
                class: ['wave-card', selectedWaveId.value === wave.id ? 'active' : '', wave.flag ? 'flag' : ''],
                onClick: () => (selectedWaveId.value = wave.id)
              },
              [h('strong', `#${index + 1}`), h('span', actionCount ? `${zombieCount} Z + ${actionCount} A` : `${zombieCount} Z`)]
            );
          })
        ),
        h('details', { class: 'advanced-details' }, [
          h('summary', t('advancedWaveSettings')),
          h('div', { class: 'advanced-grid' }, [
            h('div', { class: 'field-row compact' }, [
              h('label', t('flagWaveInterval')),
              h('input', {
                type: 'number',
                min: 1,
                value: draft.value.flagWaveInterval,
                onInput: (event: Event) => {
                  markWaveSystemEdited();
                  draft.value.flagWaveInterval = Math.max(1, Number((event.target as HTMLInputElement).value) || 1);
                }
              })
            ]),
            h('div', { class: 'field-row compact' }, [
              h('label', t('firstWaveCountdown')),
              h('input', {
                type: 'number',
                min: -1,
                value: draft.value.firstWaveCountdown,
                onInput: (event: Event) => {
                  markWaveSystemEdited();
                  draft.value.firstWaveCountdown = Number((event.target as HTMLInputElement).value);
                }
              })
            ]),
            h('label', { class: 'check-row advanced-check' }, [
              h('input', {
                type: 'checkbox',
                checked: draft.value.suppressFlagZombie,
                onChange: (event: Event) => {
                  markWaveSystemEdited();
                  draft.value.suppressFlagZombie = (event.target as HTMLInputElement).checked;
                }
              }),
              t('suppressFlagZombie')
            ])
          ])
        ]),
        selectedWave.value
          ? h('div', { class: 'wave-detail' }, [
              h('label', { class: 'check-row' }, [
                h('input', {
                  type: 'checkbox',
                  checked: selectedWave.value.flag,
                  onChange: (event: Event) => {
                    setWaveFlag(
                      draft.value.waves.findIndex((wave) => wave.id === selectedWave.value.id),
                      (event.target as HTMLInputElement).checked
                    );
                  }
                }),
                t('flagWave')
              ]),
              h(
                'div',
                { class: 'zombie-list' },
                selectedWave.value.zombies.map((zombie) =>
                  h('div', { class: 'zombie-row' }, [
                    h('span', [h('strong', getZombieDisplayName(zombie.code, zombie.label)), h('small', zombie.code)]),
                    h('input', {
                      type: 'number',
                      min: 1,
                      value: zombie.count,
                      onInput: (event: Event) => {
                        markWaveSystemEdited();
                        zombie.count = Math.max(1, Number((event.target as HTMLInputElement).value) || 1);
                      }
                    }),
                    h('button', { onClick: () => removeZombieFromWave(zombie.id) }, h(DeleteOutlined))
                  ])
                )
              ),
              h('div', { class: 'wave-actions' }, [
                h(
                  'button',
                  {
                    class: ['add-button', !canAddSelectedZombie.value ? 'is-disabled' : ''],
                    'aria-disabled': !canAddSelectedZombie.value ? 'true' : 'false',
                    onClick: addSelectedZombieToWave
                  },
                  [h(PlusOutlined), t('addZombie')]
                ),
                zombieActionHint.value ? h('small', { class: 'action-hint' }, t(zombieActionHint.value)) : null,
                draft.value.waves.length > 1
                  ? h('button', { class: 'text-button danger', onClick: () => removeWave(selectedWave.value.id) }, t('remove'))
                  : null
              ]),
              renderWaveAdvancedEditor(selectedWave.value)
            ])
          : null
      ]);
  }
});

const ValidationPanel = defineComponent({
  props: { compact: Boolean },
  setup(props) {
    return () =>
      h('section', { class: ['validation-panel', props.compact ? 'compact' : ''] }, [
        h('div', { class: 'panel-title' }, t('validation')),
        validationItems.value.length
          ? h(
              'div',
              { class: 'issue-list' },
              validationItems.value.map((item) => h('div', { class: ['issue', item.type] }, item.text))
            )
          : h('div', { class: 'issue ok' }, t('noIssues')),
        draft.value.unsupportedObjects
          ? h('div', { class: 'unsupported-note' }, `${t('unsupported')}: ${draft.value.unsupportedObjects}`)
          : null
      ]);
  }
});
</script>

<style>
html:has(.level-editor-shell),
body:has(.level-editor-shell) {
  overflow-x: hidden;
}

.level-editor-shell {
  --editor-bg: color-mix(in srgb, var(--vp-c-bg) 94%, #5f9f3f 6%);
  --editor-panel: color-mix(in srgb, var(--vp-c-bg) 90%, var(--vp-c-bg-soft) 10%);
  --editor-border: color-mix(in srgb, var(--vp-c-text) 14%, transparent);
  --editor-text: var(--vp-c-text);
  --editor-muted: var(--vp-c-text-mute);
  --editor-accent: #5f9f3f;
  --editor-accent-strong: #3f7f2f;
  width: min(1080px, calc(100vw - 360px));
  max-width: calc(100vw - 2rem);
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-left: calc((100% - min(1080px, calc(100vw - 360px))) / 2);
  color: var(--editor-text);
  overflow-x: hidden;
}

.editor-topbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(17rem, 24rem);
  gap: 1rem 1.5rem;
  align-items: flex-start;
  justify-content: space-between;
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--editor-panel);
}

.editor-title {
  margin: 0 0 0.25rem !important;
}

.title-block {
  min-width: 0;
  max-width: 34rem;
}

.top-actions {
  display: grid;
  gap: 0.5rem;
  justify-items: end;
  min-width: 0;
  width: 100%;
}

.top-action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  width: 100%;
}

.validation-summary-tag {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  margin-inline-end: 0;
  white-space: nowrap;
}

.top-actions .ant-upload {
  display: inline-flex;
  max-width: 100%;
}

.mobile-helper,
.mobile-layout {
  display: none;
}

.desktop-layout {
  display: grid;
  grid-template-columns: minmax(220px, 0.72fr) minmax(470px, 1.5fr) minmax(250px, 0.82fr);
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.panel,
.board-panel,
.desktop-bottom {
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--editor-panel);
}

.board-panel {
  padding: 0.85rem;
  min-width: 0;
  overflow: hidden;
}

.asset-library,
.property-panel-inner,
.wave-panel,
.validation-panel {
  padding: 0.85rem;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
  font-weight: 700;
}

.basic-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin-bottom: 0.85rem;
  min-width: 0;
}

.field-row {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.field-row.name-field,
.field-row.wide {
  grid-column: 1 / -1;
}

.advanced-details.wide {
  grid-column: 1 / -1;
}

.field-row label {
  font-size: 0.78rem;
  color: var(--editor-muted);
}

.field-row input,
.field-row select,
.asset-search {
  box-sizing: border-box;
  width: 100%;
  min-height: 2.35rem;
  min-width: 0;
  padding: 0.35rem 0.55rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--editor-text);
}

.segmented {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--editor-bg);
}

.segmented.stacked {
  grid-template-columns: 1fr 1fr;
}

.segmented button,
.asset-row,
.lawn-cell,
.wave-card,
.add-button,
.text-button {
  cursor: pointer;
}

.segmented button {
  min-height: 2rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--editor-muted);
}

.segmented button.active {
  background: var(--editor-accent);
  color: #fff;
}

.advanced-details {
  min-width: 0;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-bg) 90%, var(--editor-accent) 5%);
}

.advanced-details summary {
  cursor: pointer;
  padding: 0.55rem 0.65rem;
  font-weight: 700;
}

.advanced-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  padding: 0 0.65rem 0.65rem;
}

.advanced-grid.single {
  grid-template-columns: 1fr;
}

.advanced-check {
  align-self: end;
  min-height: 2.35rem;
}

.wave-advanced-body {
  display: grid;
  gap: 0.65rem;
  padding-bottom: 0.65rem;
}

.special-action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
  padding: 0 0.65rem;
}

.special-action-buttons > span {
  color: var(--editor-muted);
  font-size: 0.82rem;
}

.raw-action-list {
  display: grid;
  gap: 0.55rem;
  padding: 0 0.65rem;
}

.raw-action-card {
  display: grid;
  gap: 0.45rem;
  min-width: 0;
  padding: 0.55rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.raw-action-title {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.raw-action-title span {
  display: grid;
  min-width: 0;
}

.raw-action-title small {
  overflow: hidden;
  color: var(--editor-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.raw-action-card textarea {
  width: 100%;
  min-height: 8rem;
  resize: vertical;
  padding: 0.5rem;
  border: 1px solid var(--editor-border);
  border-radius: 6px;
  background: var(--vp-c-bg-alt);
  color: var(--editor-text);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.78rem;
  line-height: 1.45;
}

.plant-list-block {
  display: grid;
  gap: 0.4rem;
  min-width: 0;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.6rem;
}

.json-preview {
  max-height: min(68vh, 720px);
  overflow: auto;
  padding: 0.75rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  line-height: 1.45;
  white-space: pre;
}

.asset-search {
  margin: 0.6rem 0;
}

.asset-list {
  display: grid;
  gap: 0.35rem;
  max-height: min(31rem, calc(100vh - 20rem));
  overflow: auto;
  padding-right: 0.15rem;
}

.asset-row {
  display: grid;
  grid-template-columns: 2.4rem minmax(0, 1fr);
  gap: 0.55rem;
  align-items: center;
  min-height: 3rem;
  padding: 0.35rem;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--editor-text);
  text-align: left;
}

.asset-row.active,
.asset-row:hover {
  border-color: color-mix(in srgb, var(--editor-accent) 55%, transparent);
  background: color-mix(in srgb, var(--editor-accent) 10%, transparent);
}

.asset-row img {
  width: 2.35rem;
  height: 2.35rem;
  object-fit: contain;
}

.asset-copy {
  display: grid;
  min-width: 0;
}

.asset-copy strong,
.cell-label,
.zombie-row strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-copy small,
.zombie-row small {
  color: var(--editor-muted);
}

.object-dot {
  width: 1.4rem;
  height: 1.4rem;
  margin: auto;
  border-radius: 4px;
  background: #a88755;
}

.board-header {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
  min-width: 0;
}

.board-header span {
  display: block;
  color: var(--editor-muted);
  font-size: 0.85rem;
}

.board-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.4rem;
}

.lawn-grid {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  min-width: 0;
  gap: 0.16rem;
  padding: 0.42rem;
  aspect-ratio: 9 / 5;
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.14), transparent),
    #5f9f3f;
}

.lawn-cell {
  position: relative;
  display: grid;
  align-content: center;
  min-height: 0;
  padding: 0.25rem;
  border: 1px solid rgba(23, 63, 20, 0.32);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.14);
  color: #12320f;
  overflow: hidden;
}

.lawn-cell.has-items {
  padding: 0.08rem;
}

.lawn-cell:nth-child(odd) {
  background: rgba(255, 255, 255, 0.22);
}

.lawn-cell.selected {
  outline: 2px solid #f8d66d;
  outline-offset: -2px;
}

.cell-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.03rem;
  align-content: center;
  justify-content: center;
  min-width: 0;
}

.cell-marker {
  display: grid;
  place-items: center;
  width: clamp(0.72rem, 31%, 1.35rem);
  aspect-ratio: 1;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  overflow: visible;
}

.cell-marker img,
.cell-detail-pill img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cell-marker .cell-chip {
  display: inline-flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.44rem, 1vw, 0.56rem);
  line-height: 1;
}

.cell-chip {
  width: 1rem;
  height: 1rem;
  margin: 0;
  border-radius: 999px;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 700;
  line-height: 1rem;
  text-align: center;
}

.cell-chip.plant {
  background: #438b38;
}

.cell-chip.zombie {
  background: #6f6256;
}

.cell-chip.object {
  background: #a46e35;
}

.cell-label {
  display: block;
  min-width: 0;
  font-size: 0.62rem;
  font-weight: 700;
}

.cell-coord {
  color: rgba(18, 50, 15, 0.48);
  font-size: 0.72rem;
}

.cell-detail-panel {
  display: grid;
  gap: 0.45rem;
  min-height: 5.4rem;
  margin-top: 0.65rem;
  padding: 0.65rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-bg) 78%, var(--editor-accent) 8%);
}

.cell-detail-title {
  font-size: 0.82rem;
  font-weight: 700;
}

.cell-detail-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.cell-detail-pill {
  display: grid;
  grid-template-columns: 1.9rem minmax(0, 1fr);
  gap: 0.45rem;
  align-items: center;
  max-width: 100%;
  min-height: 2.35rem;
  padding: 0.25rem 0.55rem 0.25rem 0.3rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.cell-detail-pill > img,
.cell-detail-pill > .cell-chip {
  width: 1.9rem;
  height: 1.9rem;
}

.cell-detail-pill > .cell-chip {
  line-height: 1.9rem;
}

.cell-detail-copy {
  display: grid;
  min-width: 0;
}

.cell-detail-copy strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.82rem;
}

.cell-detail-copy small,
.cell-detail-empty {
  color: var(--editor-muted);
  font-size: 0.78rem;
}

.property-section {
  display: grid;
  gap: 0.65rem;
}

.seed-mode-hint {
  color: var(--editor-muted);
  line-height: 1.45;
}

.seed-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.seed-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  max-width: 100%;
  padding: 0.25rem 0.35rem;
  border: 1px solid var(--editor-border);
  border-radius: 999px;
  background: var(--vp-c-bg);
  font-size: 0.78rem;
}

.seed-pill img {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
}

.seed-pill button,
.zombie-row button {
  border: 0;
  background: transparent;
  color: var(--editor-muted);
}

.desktop-bottom {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(260px, 0.8fr);
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.seedbank-fallback-panel {
  display: none;
}

.wave-strip {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.wave-card {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 0.1rem;
  min-width: 4rem;
  min-height: 3.1rem;
  padding: 0.35rem 0.45rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--editor-text);
  line-height: 1.05;
}

.wave-card.active {
  border-color: var(--editor-accent);
  background: color-mix(in srgb, var(--editor-accent) 12%, var(--vp-c-bg));
}

.wave-card strong {
  font-size: 1rem;
}

.wave-card span {
  color: var(--editor-muted);
  font-size: 0.72rem;
}

.wave-card.flag::after {
  content: "FLAG";
  color: #c98b00;
  font-size: 0.62rem;
}

.wave-detail {
  display: grid;
  gap: 0.55rem;
  margin-top: 0.75rem;
}

.check-row {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
}

.zombie-list {
  display: grid;
  gap: 0.35rem;
}

.zombie-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 4.5rem 2rem;
  gap: 0.4rem;
  align-items: center;
}

.zombie-row span {
  display: grid;
  min-width: 0;
}

.zombie-row input {
  min-width: 0;
  padding: 0.25rem;
  border: 1px solid var(--editor-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--editor-text);
}

.wave-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.action-hint {
  color: var(--editor-muted);
  font-size: 0.78rem;
}

.add-button,
.text-button {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  justify-content: center;
  min-height: 2.1rem;
  padding: 0.25rem 0.65rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--editor-text);
}

.add-button {
  border-color: color-mix(in srgb, var(--editor-accent) 45%, var(--editor-border));
}

.add-button:disabled,
.text-button:disabled,
.add-button.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.add-button.small {
  min-height: 1.9rem;
  font-size: 0.8rem;
}

.text-button.danger {
  color: #c34040;
}

.issue-list {
  display: grid;
  gap: 0.4rem;
}

.issue,
.unsupported-note {
  padding: 0.55rem;
  border-radius: 8px;
  background: var(--editor-bg);
  font-size: 0.88rem;
}

.issue.error {
  border-left: 3px solid #d94f4f;
}

.issue.warning {
  border-left: 3px solid #d7a100;
}

.issue.ok {
  border-left: 3px solid var(--editor-accent);
}

@media (max-width: 1320px) {
  .level-editor-shell {
    width: min(1040px, calc(100vw - 320px));
    margin-left: calc((100% - min(1040px, calc(100vw - 320px))) / 2);
  }

  .desktop-layout {
    grid-template-columns: minmax(200px, 0.62fr) minmax(0, 1.38fr);
  }

  .property-panel {
    display: none;
  }

  .seedbank-fallback-panel {
    display: block;
  }

  .desktop-bottom {
    grid-template-columns: 1fr;
  }

  .basic-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1040px) and (min-width: 761px) {
  .level-editor-shell {
    width: min(760px, calc(100vw - 300px));
    margin-left: calc((100% - min(760px, calc(100vw - 300px))) / 2);
  }

  .desktop-layout {
    grid-template-columns: 1fr;
  }

  .asset-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-height: 14rem;
  }
}

@media (max-width: 900px) {
  .editor-topbar {
    grid-template-columns: 1fr;
  }

  .top-actions {
    justify-items: start;
  }

  .top-action-row {
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .level-editor-shell {
    width: 100%;
    max-width: 100%;
    margin-left: 0;
  }

  .editor-topbar {
    grid-template-columns: 1fr;
  }

  .top-actions {
    justify-items: start;
  }

  .mobile-helper,
  .mobile-layout {
    display: block;
    margin-top: 0.75rem;
  }

  .desktop-layout,
  .desktop-bottom {
    display: none;
  }

  .basic-form {
    grid-template-columns: 1fr;
  }

  .advanced-grid {
    grid-template-columns: 1fr;
  }

  .lawn-grid {
    grid-template-columns: repeat(9, minmax(2rem, 1fr));
    gap: 0.12rem;
    padding: 0.28rem;
  }

  .lawn-cell {
    min-height: 3.15rem;
  }

  .cell-label {
    font-size: 0.62rem;
  }

  .asset-list {
    max-height: 24rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>
