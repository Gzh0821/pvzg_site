<template>
  <a-config-provider
    :theme="{
      token: { colorPrimary: '#5f9f3f', borderRadius: 12, controlHeight: 40 },
      algorithm: $isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
    }"
  >
    <section class="level-editor-shell">
      <header class="editor-topbar">
        <div class="title-block">
          <div class="title-row">
            <span class="title-sun" aria-hidden="true"></span>
            <a-typography-title :level="2" class="editor-title">{{ t('title') }}</a-typography-title>
          </div>
          <div class="workspace-meta">
            <span>{{ t('summaryWaves', { count: draft.waves.length }) }}</span>
            <span>{{ t('summaryPlacements', { count: draft.boardItems.length }) }}</span>
          </div>
        </div>
        <div class="top-actions">
          <div class="top-action-row action-row-primary">
            <button
              type="button"
              class="validation-summary-control"
              :class="validationState"
              @click="openValidation"
            >
              <span class="validation-status-dot" aria-hidden="true"></span>
              {{ t('errors', { count: validationSummary.errors }) }} / {{ t('warnings', { count: validationSummary.warnings }) }}
            </button>
            <label class="expert-mode-toggle">
              <input v-model="expertMode" type="checkbox" :aria-label="t('expertMode')" />
              <span class="expert-mode-switch" aria-hidden="true"></span>
              <span class="expert-mode-label">{{ t('expertMode') }}</span>
            </label>
            <a-upload :before-upload="handleUpload" accept=".json,.json5" :show-upload-list="false">
              <a-button>
                <template #icon><upload-outlined /></template>
                {{ t('importLevel') }}
              </a-button>
            </a-upload>
            <a-button @click="confirmResetDraft">
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

      <div v-if="!isMobileViewport" class="desktop-layout">
        <AssetLibrary class="panel library-panel" />
        <main class="board-panel">
          <BasicForm />
          <BoardEditor />
        </main>
        <PropertyPanel class="panel property-panel" />
      </div>

      <div v-else class="mobile-layout">
        <section class="mobile-section-stack">
          <BasicForm />
          <BoardEditor />
        </section>
        <section class="mobile-section-stack">
          <AssetLibrary />
        </section>
        <section class="mobile-section-stack">
          <WaveTimeline />
        </section>
        <section class="mobile-section-stack">
          <PropertyPanel />
        </section>
        <section class="mobile-section-stack">
          <ValidationPanel />
        </section>
      </div>

      <div v-if="!isMobileViewport" class="desktop-bottom">
        <PropertyPanel class="panel seedbank-fallback-panel" />
        <WaveTimeline />
        <ValidationPanel compact />
      </div>

      <a-modal
        v-model:open="previewOpen"
        :title="`${draft.name || 'custom_level'}.json`"
        width="min(920px, 96vw)"
        root-class-name="level-editor-modal-root"
        :footer="null"
      >
        <div class="preview-actions">
          <a-button size="small" @click="copyPreview">
            <template #icon><copy-outlined /></template>
            {{ t('copyJson') }}
          </a-button>
        </div>
        <pre class="json-preview">{{ previewJson }}</pre>
      </a-modal>

      <a-drawer
        :open="conveyorEditorOpen"
        :title="conveyorEditorTitle"
        placement="right"
        width="min(720px, 96vw)"
        root-class-name="level-editor-drawer-root"
        :body-style="{ padding: 0 }"
        @close="closeConveyorEditor"
      >
        <ConveyorEditorPanel />
      </a-drawer>
    </section>
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import JSON5 from 'json5';
import { message, Modal, theme as antdTheme } from 'ant-design-vue';
import {
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FileAddOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons-vue';
import { boardObjectData } from '../game-data/board-objects';
import { plantFeaturesJson as plantFeatures } from '../game-data/plants';
import { zombieFeaturesJson as zombieFeatures } from '../game-data/zombies';
import localeMessages from './i18n.json';

type LocaleKey = 'zh' | 'en' | 'es' | 'ru';
type AssetKind = 'plant' | 'zombie' | 'object';
type ObjectCategory = 'tile' | 'obstacle' | 'tombstone';
type ObjectCategoryFilter = 'all' | ObjectCategory;
type ObjectExportClass = 'InitialGridItemProperties' | 'GravestoneProperties';
type BoardLayer = 'tile' | 'obstacle' | 'plant' | 'zombie';
type SeedMode = 'chooser' | 'preset';
type PlantListKey = 'seedPlants' | 'includePlants' | 'excludePlants';
type ConveyorWaveMode = 'Add' | 'Remove';
type ConveyorAdvancedTab = 'plants' | 'rules' | 'waves';
type ConveyorEditorTarget =
  | { kind: 'initialPlant'; index: number }
  | { kind: 'dropCondition'; index: number }
  | { kind: 'speedCondition'; index: number }
  | { kind: 'waveModification'; index: number };

const MAX_SEED_PLANTS = 8;
const ASSET_PAGE_SIZE = 120;
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
  category?: ObjectCategory;
  exportClass?: ObjectExportClass;
  props?: string;
  res?: string;
  source?: string;
  advanced?: boolean;
}

interface BoardItem {
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

interface WaveZombie {
  id: number;
  code: string;
  label: string;
  count: number;
  row: string;
  rowDirty?: boolean;
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

interface WaveActionOrderEntry {
  kind: 'zombies' | 'raw' | 'conveyor';
  actionId?: number;
  alias?: string;
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
  actionOrder: WaveActionOrderEntry[];
}

interface ConveyorPlantEntry {
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

interface ConveyorDropDelayCondition {
  MaxPackets: number;
  Delay: number;
  [key: string]: any;
}

interface ConveyorSpeedCondition {
  MaxPackets: number;
  Speed: number;
  [key: string]: any;
}

interface ConveyorWaveModification {
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

interface PreservedConveyorWaveAction {
  alias: string;
  waveIndex: number;
  objclass: string;
  objdata: Record<string, any>;
}

interface ConveyorDraft {
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
  hasSeedBank: boolean;
  seedBankExtra: Record<string, any>;
  conveyor: ConveyorDraft;
  boardItems: BoardItem[];
  waves: WaveDraft[];
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
const previewOpen = ref(false);
const isMobileViewport = ref(false);
let mobileViewportQuery: MediaQueryList | null = null;
const EXPERT_MODE_STORAGE_KEY = 'pvzg-level-editor-expert-mode';
const expertMode = ref(false);
const assetTab = ref<AssetKind>('plant');
const objectCategory = ref<ObjectCategoryFilter>('all');
const assetSearch = ref('');
const assetVisibleLimit = ref(ASSET_PAGE_SIZE);
const selectedAsset = ref<AssetOption | null>(null);
const selectedCell = ref<{ row: number; col: number } | null>(null);
const selectedWaveId = ref(1);
const expandedWaveActionKey = ref('zombies');
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

const objectOptions: AssetOption[] = (boardObjectData as AssetOption[]).map((item) => ({ ...item, kind: 'object' }));

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
    .filter((item) => expertMode.value || !item.advanced)
    .filter((item) => assetTab.value !== 'object' || objectCategory.value === 'all' || item.category === objectCategory.value)
    .filter((item) => {
      if (!query) return true;
      return [item.code, item.name, item.res || '', item.source || '', item.exportClass || ''].some((value) => value.toLowerCase().includes(query));
    });
});
const visibleAssetOptions = computed(() => currentAssetOptions.value.slice(0, assetVisibleLimit.value));

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
const conveyorActionHint = ref('');
const conveyorAdvancedTab = ref<ConveyorAdvancedTab>('plants');
const conveyorEditorOpen = ref(false);
const conveyorEditorTarget = ref<ConveyorEditorTarget | null>(null);
const conveyorEditorReturnFocus = ref<HTMLElement | null>(null);

const validationItems = computed<ValidationItem[]>(() => {
  const items: ValidationItem[] = [];
  if (!draft.value.name.trim()) {
    items.push({ type: 'error', text: t('validationNameRequired') });
  }
  const expectsWaveSystem =
    (draft.value.hasWaveManager && !draft.value.preserveCustomWaveManager) ||
    draft.value.preserveGeneratorWaves ||
    draft.value.moduleRefs.includes(NEW_WAVES_REF);
  if (!draft.value.waves.length && expectsWaveSystem && !draft.value.preserveGeneratorWaves) {
    items.push({ type: 'error', text: t('validationWaveRequired') });
  }
  draft.value.waves.forEach((wave, index) => {
    const hasConveyorWaveMod =
      draft.value.conveyor.enabled && draft.value.conveyor.waveModifications.some((modification) => modification.waveIndex === index + 1);
    if (!wave.zombies.length && !wave.rawActions.length && !hasConveyorWaveMod) {
      items.push({
        type: 'warning',
        text: t('validationWaveEmpty', { wave: index + 1 })
      });
    }
    if (wave.dynamicPlantfood.trim() && !Array.isArray(parseOptionalArrayText(wave.dynamicPlantfood))) {
      items.push({
        type: 'error',
        text: t('validationDynamicPlantfood', { wave: index + 1 })
      });
    }
    wave.rawActions.forEach((action) => {
      try {
        JSON5.parse(action.jsonText || '{}');
      } catch {
        items.push({
          type: 'error',
          text: t('validationActionJson', { wave: index + 1, action: action.objclass })
        });
      }
    });
  });
  if (!draft.value.conveyor.enabled && draft.value.seedMode === 'preset' && !draft.value.seedPlants.length) {
    items.push({
      type: 'warning',
      text: t('validationPresetEmpty')
    });
  }
  if (draft.value.conveyor.enabled) {
    if (!draft.value.conveyor.initialPlants.length && !draft.value.conveyor.waveModifications.length) {
      items.push({
        type: 'warning',
        text: t('validationConveyorEmpty')
      });
    }
    draft.value.conveyor.waveModifications.forEach((modification) => {
      if (modification.waveIndex < 1 || modification.waveIndex > draft.value.waves.length) {
        items.push({
          type: 'error',
          text: t('validationConveyorWaveMissing', { wave: modification.waveIndex })
        });
      }
    });
  }
  if (draft.value.unsupportedObjects > 0) {
    items.push({
      type: 'warning',
      text: t('validationUnsupported', { count: draft.value.unsupportedObjects })
    });
  }
  return items;
});

const validationSummary = computed(() => ({
  errors: validationItems.value.filter((item) => item.type === 'error').length,
  warnings: validationItems.value.filter((item) => item.type === 'warning').length
}));

const validationState = computed(() => {
  if (validationSummary.value.errors) return 'error';
  if (validationSummary.value.warnings) return 'warning';
  return 'success';
});

const previewJson = computed(() => JSON.stringify(serializeLevel(), null, 2));

function clearSelectedAsset() {
  selectedAsset.value = null;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || previewOpen.value || !selectedAsset.value) return;
  clearSelectedAsset();
}

function updateMobileViewport(event: MediaQueryListEvent | MediaQueryList) {
  isMobileViewport.value = event.matches;
}

onMounted(() => {
  expertMode.value = window.localStorage.getItem(EXPERT_MODE_STORAGE_KEY) === '1';
  window.addEventListener('keydown', handleKeydown);
  mobileViewportQuery = window.matchMedia('(max-width: 760px)');
  updateMobileViewport(mobileViewportQuery);
  mobileViewportQuery.addEventListener('change', updateMobileViewport);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (mobileViewportQuery) {
    mobileViewportQuery.removeEventListener('change', updateMobileViewport);
  }
});

watch(expertMode, (enabled) => {
  if (typeof window === 'undefined') return;
  if (!enabled && selectedAsset.value?.advanced) clearSelectedAsset();
  window.localStorage.setItem(EXPERT_MODE_STORAGE_KEY, enabled ? '1' : '0');
});

watch([assetTab, objectCategory, assetSearch, expertMode], () => {
  assetVisibleLimit.value = ASSET_PAGE_SIZE;
});

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
    rawActions: [],
    actionOrder: []
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

function createDefaultConveyorDraft(): ConveyorDraft {
  return {
    enabled: false,
    alias: 'ConveyorBelt',
    preserveOriginal: false,
    dirty: false,
    originalActionObjects: [],
    initialPlants: [],
    dropDelayConditions: [{ MaxPackets: 0, Delay: 5 }],
    speedConditions: [{ MaxPackets: 0, Speed: 100 }],
    waveModifications: [],
    extra: {}
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
    hasSeedBank: true,
    seedBankExtra: {},
    conveyor: createDefaultConveyorDraft(),
    boardItems: [],
    waves: [
      {
        id: 1,
        name: 'Wave 1',
        flag: false,
        zombies: [{ id: 1, code: 'mummy', label: 'mummy', count: 3, row: '' }],
        additionalPlantfood: 0,
        dynamicPlantfood: '',
        spawnStyle: '',
        mustKillAllToNextWave: false,
        rawActions: [],
        actionOrder: [{ kind: 'zombies' }]
      }
    ],
    flagWaveInterval: 5,
    flagWaveIntervalDirty: true,
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
  closeConveyorEditor();
  draft.value = createDefaultDraft();
  selectedWaveId.value = 1;
  expandedWaveActionKey.value = 'zombies';
  selectedCell.value = null;
  selectedAsset.value = null;
  nextItemId.value = 1;
  nextWaveId.value = 2;
  nextZombieId.value = 2;
  nextWaveActionId.value = 1;
}

function confirmResetDraft() {
  Modal.confirm({
    title: t('confirmNewTitle'),
    content: t('confirmNewDescription'),
    okText: t('confirmNewAction'),
    cancelText: t('cancel'),
    okType: 'danger',
    centered: true,
    onOk: resetDraft
  });
}

async function openValidation() {
  const isMobile = window.matchMedia('(max-width: 760px)').matches;
  await nextTick();
  const selector = isMobile ? '.mobile-layout .validation-panel' : '.desktop-bottom .validation-panel';
  document.querySelector(selector)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'center'
  });
}

function chooseAsset(asset: AssetOption) {
  if (selectedAsset.value?.kind === asset.kind && selectedAsset.value?.code === asset.code) {
    clearSelectedAsset();
    return;
  }
  selectedAsset.value = asset;
  assetTab.value = asset.kind;
  if (asset.kind === 'object') objectCategory.value = asset.category || 'all';
  if (asset.kind === 'plant') {
    seedActionHint.value = '';
    conveyorActionHint.value = '';
  }
  if (asset.kind === 'zombie') zombieActionHint.value = '';
}

function showMoreAssets() {
  assetVisibleLimit.value = Math.min(currentAssetOptions.value.length, assetVisibleLimit.value + ASSET_PAGE_SIZE);
}

function getObjectOption(code: string) {
  return objectOptions.find((item) => item.code === code);
}

function getAssetLayer(asset: AssetOption): BoardLayer {
  if (asset.kind === 'plant') return 'plant';
  if (asset.kind === 'zombie') return 'zombie';
  return asset.category === 'tile' ? 'tile' : 'obstacle';
}

function getBoardItemLayer(item: BoardItem): BoardLayer {
  if (item.kind === 'plant') return 'plant';
  if (item.kind === 'zombie') return 'zombie';
  return item.category === 'tile' ? 'tile' : 'obstacle';
}

function placeAsset(row: number, col: number) {
  selectedCell.value = { row, col };
  if (!selectedAsset.value) return;
  draft.value.preserveBoardModules = false;
  const selectedLayer = getAssetLayer(selectedAsset.value);
  const existingIndex = draft.value.boardItems.findIndex(
    (item) => item.row === row && item.col === col && getBoardItemLayer(item) === selectedLayer
  );
  const item: BoardItem = {
    id: nextItemId.value++,
    kind: selectedAsset.value.kind,
    code: selectedAsset.value.code,
    label: selectedAsset.value.name,
    row,
    col,
    category: selectedAsset.value.category,
    exportClass: selectedAsset.value.exportClass,
    props: selectedAsset.value.props,
    res: selectedAsset.value.res,
    source: selectedAsset.value.source,
    advanced: selectedAsset.value.advanced
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

function removeBoardItem(id: number) {
  draft.value.preserveBoardModules = false;
  draft.value.boardItems = draft.value.boardItems.filter((item) => item.id !== id);
}

function clearBoardItems() {
  draft.value.preserveBoardModules = false;
  draft.value.boardItems = [];
}

function itemsAt(row: number, col: number) {
  const layerOrder: Record<BoardLayer, number> = { tile: 0, obstacle: 1, plant: 2, zombie: 3 };
  return draft.value.boardItems
    .filter((item) => item.row === row && item.col === col)
    .sort((a, b) => layerOrder[getBoardItemLayer(a)] - layerOrder[getBoardItemLayer(b)]);
}

function setBoardItemExtra(item: BoardItem, key: string, value: any) {
  draft.value.preserveBoardModules = false;
  const extra = { ...(item.extra || {}) };
  if (value === undefined) delete extra[key];
  else extra[key] = value;
  item.extra = Object.keys(extra).length ? extra : undefined;
}

function setBoardItemIcecubed(item: BoardItem, checked: boolean) {
  setBoardItemExtra(item, 'Condition', checked ? 'icecubed' : undefined);
}

function setBoardItemPlantfood(item: BoardItem, checked: boolean) {
  setBoardItemExtra(item, 'Plantfood', checked ? true : undefined);
}

function editablePlacementExtraKeys(item: BoardItem) {
  if (item.kind === 'plant') return new Set(['Condition', 'Plantfood']);
  if (item.kind === 'zombie') return new Set(['Condition']);
  return new Set<string>();
}

function preservedPlacementExtraEntries(item: BoardItem) {
  const editableKeys = editablePlacementExtraKeys(item);
  return Object.entries(item.extra || {}).filter(([key]) => !editableKeys.has(key));
}

function formatPlacementExtraValue(value: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value == null) return String(value);
  return JSON.stringify(value);
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

function markConveyorEdited() {
  draft.value.conveyor.enabled = true;
  draft.value.conveyor.preserveOriginal = false;
  draft.value.conveyor.dirty = true;
}

function setConveyorEnabled(checked: boolean) {
  draft.value.conveyor.enabled = checked;
  draft.value.conveyor.dirty = true;
  draft.value.hasSeedBank = !checked;
  if (checked) {
    if (!draft.value.conveyor.alias.trim()) draft.value.conveyor.alias = 'ConveyorBelt';
    if (!draft.value.conveyor.speedConditions.length) draft.value.conveyor.speedConditions.push({ MaxPackets: 0, Speed: 100 });
  }
}

function setSeedSupplyMode(mode: 'seedBank' | 'conveyor') {
  if (mode === 'conveyor') {
    setConveyorEnabled(true);
    return;
  }
  setConveyorEnabled(false);
  draft.value.hasSeedBank = true;
}

function setOptionalNumber(target: Record<string, any>, key: string, value: string, min = Number.NEGATIVE_INFINITY) {
  if (!value.trim()) {
    delete target[key];
    return;
  }
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    delete target[key];
    return;
  }
  target[key] = Math.max(min, numericValue);
}

function setRequiredNumber(target: Record<string, any>, key: string, value: string, fallback: number, min = Number.NEGATIVE_INFINITY) {
  const numericValue = value.trim() ? Number(value) : fallback;
  target[key] = Math.max(min, Number.isFinite(numericValue) ? numericValue : fallback);
}

function addSelectedConveyorPlant() {
  if (!selectedPlantAsset.value) {
    conveyorActionHint.value = 'selectPlantFirst';
    return;
  }
  conveyorActionHint.value = '';
  markConveyorEdited();
  draft.value.conveyor.initialPlants.push({
    PlantType: selectedPlantAsset.value.code,
    Weight: 15
  });
}

function removeConveyorPlant(index: number) {
  markConveyorEdited();
  draft.value.conveyor.initialPlants.splice(index, 1);
  normalizeConveyorEditorAfterRemoval('initialPlant', index);
}

function addConveyorCondition(kind: 'drop' | 'speed') {
  markConveyorEdited();
  if (kind === 'drop') {
    draft.value.conveyor.dropDelayConditions.push({ MaxPackets: 5, Delay: 3 });
    return;
  }
  draft.value.conveyor.speedConditions.push({ MaxPackets: 5, Speed: 100 });
}

function removeConveyorCondition(kind: 'drop' | 'speed', index: number) {
  markConveyorEdited();
  if (kind === 'drop') draft.value.conveyor.dropDelayConditions.splice(index, 1);
  else draft.value.conveyor.speedConditions.splice(index, 1);
  normalizeConveyorEditorAfterRemoval(kind === 'drop' ? 'dropCondition' : 'speedCondition', index);
}

function addConveyorWaveModification(mode: ConveyorWaveMode) {
  if (!selectedPlantAsset.value) {
    conveyorActionHint.value = 'selectPlantFirst';
    return;
  }
  conveyorActionHint.value = '';
  markConveyorEdited();
  const waveIndex = Math.max(1, draft.value.waves.findIndex((wave) => wave.id === selectedWaveId.value) + 1 || 1);
  const wave = draft.value.waves[waveIndex - 1];
  if (wave && !wave.actionOrder.some((entry) => entry.kind === 'conveyor')) {
    wave.actionOrder.push({ kind: 'conveyor' });
  }
  draft.value.conveyor.waveModifications.push({
    waveIndex,
    mode,
    PlantType: selectedPlantAsset.value.code,
    ...(mode === 'Add' ? { Weight: 40 } : {})
  });
  expandedWaveActionKey.value = 'conveyor';
}

function setConveyorWaveMode(entry: ConveyorWaveModification, mode: ConveyorWaveMode) {
  markConveyorEdited();
  entry.mode = mode;
  if (entry.mode === 'Remove') {
    delete entry.Weight;
    delete entry.MaxCount;
    delete entry.MaxWeightFactor;
    delete entry.MinCount;
    delete entry.MinWeightFactor;
    delete entry.CooldownSeconds;
    delete entry.MaxCountCooldownSeconds;
    delete entry.MinCountCooldownSeconds;
    delete entry.MaxDelivered;
    delete entry.ForceBoosted;
  } else if (entry.Weight === undefined) {
    entry.Weight = 40;
  }
}

function removeConveyorWaveModification(index: number) {
  markConveyorEdited();
  draft.value.conveyor.waveModifications.splice(index, 1);
  normalizeConveyorEditorAfterRemoval('waveModification', index);
}

function openConveyorEditor(target: ConveyorEditorTarget, event?: MouseEvent) {
  conveyorEditorTarget.value = target;
  conveyorEditorOpen.value = true;
  conveyorEditorReturnFocus.value = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
}

function closeConveyorEditor() {
  conveyorEditorOpen.value = false;
  conveyorEditorTarget.value = null;
  const returnFocus = conveyorEditorReturnFocus.value;
  conveyorEditorReturnFocus.value = null;
  if (returnFocus) nextTick(() => returnFocus.focus());
}

function normalizeConveyorEditorAfterRemoval(kind: ConveyorEditorTarget['kind'], removedIndex: number) {
  const target = conveyorEditorTarget.value;
  if (!target || target.kind !== kind) return;
  if (target.index === removedIndex) {
    closeConveyorEditor();
    return;
  }
  if (target.index > removedIndex) target.index -= 1;
}

function getConveyorEditorEntry(target = conveyorEditorTarget.value) {
  if (!target) return null;
  if (target.kind === 'initialPlant') return draft.value.conveyor.initialPlants[target.index] || null;
  if (target.kind === 'dropCondition') return draft.value.conveyor.dropDelayConditions[target.index] || null;
  if (target.kind === 'speedCondition') return draft.value.conveyor.speedConditions[target.index] || null;
  return draft.value.conveyor.waveModifications[target.index] || null;
}

function getPlantOption(code: string) {
  return plantOptions.value.find((plant) => plant.code === code);
}

function getPlantDisplayImage(code: string) {
  return getPlantOption(code)?.image || '';
}

const conveyorEditorTitle = computed(() => {
  const target = conveyorEditorTarget.value;
  const entry = getConveyorEditorEntry(target);
  if (!target || !entry) return t('advancedConveyor');
  if (target.kind === 'initialPlant') return t('conveyorEditPlantTitle', { plant: getPlantDisplayName((entry as ConveyorPlantEntry).PlantType) });
  if (target.kind === 'waveModification') {
    const modification = entry as ConveyorWaveModification;
    return t('conveyorEditWaveTitle', { wave: modification.waveIndex, plant: getPlantDisplayName(modification.PlantType) });
  }
  return target.kind === 'dropCondition' ? t('conveyorEditDropTitle') : t('conveyorEditSpeedTitle');
});

function markWaveSystemEdited() {
  draft.value.hasWaveManager = true;
  draft.value.preserveGeneratorWaves = false;
  draft.value.preserveCustomWaveManager = false;
  draft.value.waveSystemDirty = true;
  if (draft.value.conveyor.enabled && draft.value.conveyor.originalActionObjects.length) {
    draft.value.conveyor.preserveOriginal = false;
    draft.value.conveyor.dirty = true;
  }
}

function syncWaveFlags() {
  const interval = normalizeFlagWaveIntervalMagnitude(draft.value.flagWaveInterval, 1);
  draft.value.waves.forEach((wave, index) => {
    wave.flag = (index + 1) % interval === 0;
  });
}

function setFlagWaveInterval(value: string) {
  markWaveSystemEdited();
  draft.value.flagWaveInterval = normalizeFlagWaveIntervalMagnitude(value, 1);
  draft.value.flagWaveIntervalDirty = true;
  syncWaveFlags();
}

function normalizeFlagWaveIntervalMagnitude(value: unknown, fallback = 5) {
  const numericValue = Math.trunc(Number(value));
  return Number.isFinite(numericValue) && numericValue !== 0 ? Math.abs(numericValue) : fallback;
}

function addWave() {
  markWaveSystemEdited();
  const wave = createEmptyWave(draft.value.waves.length + 1);
  draft.value.waves.push(wave);
  syncWaveFlags();
  selectedWaveId.value = wave.id;
  expandedWaveActionKey.value = 'zombies';
}

function normalizeWaveNames() {
  draft.value.waves.forEach((wave, index) => {
    wave.name = `Wave ${index + 1}`;
  });
}

function insertWaveAfter(id: number) {
  const index = draft.value.waves.findIndex((wave) => wave.id === id);
  if (index < 0) return;
  markWaveSystemEdited();
  const insertedWaveNumber = index + 2;
  draft.value.conveyor.waveModifications.forEach((modification) => {
    if (modification.waveIndex >= insertedWaveNumber) modification.waveIndex += 1;
  });
  const wave = createEmptyWave(insertedWaveNumber);
  draft.value.waves.splice(index + 1, 0, wave);
  normalizeWaveNames();
  syncWaveFlags();
  selectedWaveId.value = wave.id;
  expandedWaveActionKey.value = 'zombies';
}

function duplicateWave(id: number) {
  const index = draft.value.waves.findIndex((wave) => wave.id === id);
  if (index < 0) return;
  const source = draft.value.waves[index];
  const sourceWaveNumber = index + 1;
  const insertedWaveNumber = sourceWaveNumber + 1;
  const sourceConveyorModifications = draft.value.conveyor.waveModifications
    .filter((modification) => modification.waveIndex === sourceWaveNumber)
    .map((modification) => cloneJson(modification));
  markWaveSystemEdited();

  const rawActionIdMap = new Map<number, number>();
  const rawActions = source.rawActions.map((action, actionIndex) => {
    const clonedAction = createRawWaveAction(
      createUniqueWaveActionAlias(`${action.alias || `Wave${sourceWaveNumber}Action${actionIndex}`}Copy${actionIndex + 1}`),
      action.objclass,
      parseActionObjdata(action)
    );
    rawActionIdMap.set(action.id, clonedAction.id);
    return clonedAction;
  });
  const actionOrder: WaveActionOrderEntry[] = [];
  let conveyorAdded = false;
  getEffectiveWaveActionOrder(source, sourceWaveNumber).forEach((entry) => {
    if (entry.kind === 'raw') {
      const actionId = entry.actionId ? rawActionIdMap.get(entry.actionId) : undefined;
      const action = rawActions.find((item) => item.id === actionId);
      if (actionId) actionOrder.push({ kind: 'raw', actionId, alias: action?.alias });
    } else if (entry.kind === 'conveyor') {
      if (!conveyorAdded && sourceConveyorModifications.length) {
        conveyorAdded = true;
        actionOrder.push({ kind: 'conveyor' });
      }
    } else {
      actionOrder.push({ kind: 'zombies' });
    }
  });

  const clone: WaveDraft = {
    ...cloneJson(source),
    id: nextWaveId.value++,
    name: `Wave ${insertedWaveNumber}`,
    zombies: source.zombies.map((zombie) => ({ ...cloneJson(zombie), id: nextZombieId.value++ })),
    zombieActionAlias: source.zombieActionAlias
      ? createUniqueWaveActionAlias(`${source.zombieActionAlias}Copy`)
      : undefined,
    rawActions,
    actionOrder
  };

  draft.value.conveyor.waveModifications.forEach((modification) => {
    if (modification.waveIndex >= insertedWaveNumber) modification.waveIndex += 1;
  });
  draft.value.conveyor.waveModifications.push(
    ...sourceConveyorModifications.map((modification) => ({ ...modification, waveIndex: insertedWaveNumber, alias: undefined }))
  );
  draft.value.waves.splice(index + 1, 0, clone);
  normalizeWaveNames();
  syncWaveFlags();
  selectedWaveId.value = clone.id;
  expandedWaveActionKey.value = clone.actionOrder.some((entry) => entry.kind === 'zombies') ? 'zombies' : '';
}

function moveWave(id: number, direction: -1 | 1) {
  const fromIndex = draft.value.waves.findIndex((wave) => wave.id === id);
  const toIndex = fromIndex + direction;
  if (fromIndex < 0 || toIndex < 0 || toIndex >= draft.value.waves.length) return;
  markWaveSystemEdited();
  const fromWaveNumber = fromIndex + 1;
  const toWaveNumber = toIndex + 1;
  draft.value.conveyor.waveModifications.forEach((modification) => {
    if (modification.waveIndex === fromWaveNumber) modification.waveIndex = toWaveNumber;
    else if (modification.waveIndex === toWaveNumber) modification.waveIndex = fromWaveNumber;
  });
  [draft.value.waves[fromIndex], draft.value.waves[toIndex]] = [draft.value.waves[toIndex], draft.value.waves[fromIndex]];
  normalizeWaveNames();
  syncWaveFlags();
}

function removeWave(id: number) {
  if (draft.value.waves.length <= 1) return;
  const removedIndex = draft.value.waves.findIndex((wave) => wave.id === id);
  if (removedIndex < 0) return;
  markWaveSystemEdited();
  draft.value.waves = draft.value.waves.filter((wave) => wave.id !== id);
  const removedWaveNumber = removedIndex + 1;
  draft.value.conveyor.waveModifications = draft.value.conveyor.waveModifications
    .filter((modification) => modification.waveIndex !== removedWaveNumber)
    .map((modification) => ({
      ...modification,
      waveIndex: modification.waveIndex > removedWaveNumber ? modification.waveIndex - 1 : modification.waveIndex
    }));
  syncWaveFlags();
  normalizeWaveNames();
  selectedWaveId.value = draft.value.waves[Math.min(removedIndex, draft.value.waves.length - 1)].id;
  expandedWaveActionKey.value = 'zombies';
}

function addZombieToWave(code: string) {
  if (!selectedWave.value) return;
  markWaveSystemEdited();
  const zombie = zombieOptions.value.find((item) => item.code === code);
  if (!zombie) return;
  if (!selectedWave.value.actionOrder.some((entry) => entry.kind === 'zombies')) {
    selectedWave.value.actionOrder.push({ kind: 'zombies' });
  }
  selectedWave.value.zombies.push({ id: nextZombieId.value++, code: zombie.code, label: zombie.name, count: 1, row: '' });
  expandedWaveActionKey.value = 'zombies';
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
  return getObjectOption(code)?.name || code;
}

function getBoardItemImage(item: BoardItem) {
  if (item.kind === 'plant') return plantOptions.value.find((plant) => plant.code === item.code)?.image || '';
  if (item.kind === 'zombie') return zombieOptions.value.find((zombie) => zombie.code === item.code)?.image || '';
  return getObjectOption(item.code)?.image || '';
}

function getBoardItemKindLabel(kind: AssetKind) {
  if (kind === 'plant') return t('cellKindPlant');
  if (kind === 'zombie') return t('cellKindZombie');
  return t('cellKindObject');
}

function getObjectCategoryLabel(category?: ObjectCategory) {
  if (category === 'tile') return t('objectCategoryTile');
  if (category === 'tombstone') return t('objectCategoryTombstone');
  if (category === 'obstacle') return t('objectCategoryObstacle');
  return t('objects');
}

function getBoardItemTypeLabel(item: BoardItem) {
  if (item.kind !== 'object') return getBoardItemKindLabel(item.kind);
  return getObjectCategoryLabel(item.category);
}

function getCellAriaLabel(row: number, col: number, items: BoardItem[]) {
  const content = items.length ? items.map((item) => item.label).join(', ') : t('selectedCellEmpty');
  return t('cellAria', { col: col + 1, row: row + 1, content });
}

function getBoardItemChip(item: BoardItem) {
  if (item.kind === 'plant') return 'P';
  if (item.kind === 'zombie') return 'Z';
  if (item.category === 'tile') return 'T';
  if (item.category === 'tombstone') return 'G';
  return 'O';
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
    const row = zombie?.Row === undefined || zombie?.Row === null ? '' : String(zombie.Row);
    const option = zombieOptions.value.find((item) => item.code === code);
    const normalizedEntry = cloneJson(zombie || { Type: `RTID(${code}@ZombieTypes)` });
    const existing = groups.find((item) => item.code === code && item.row === row);
    if (existing) {
      existing.count += 1;
      existing.entries = [...(existing.entries || []), normalizedEntry];
    } else {
      groups.push({
        id: nextZombieId.value++,
        code,
        label: option?.name || code,
        count: 1,
        row,
        entries: [normalizedEntry]
      });
    }
  });
  return groups;
}

function parseConveyorPlantEntry(entry: any): ConveyorPlantEntry {
  const { PlantType, Type, ToolType, ...extra } = entry || {};
  return {
    ...cloneJson(extra),
    PlantType: parsePlantReference(PlantType || Type || ToolType)
  };
}

function parseConveyorWaveModifications(objdata: Record<string, any>, waveIndex: number, alias: string) {
  const modifications: ConveyorWaveModification[] = [];
  (Array.isArray(objdata.Add) ? objdata.Add : []).forEach((entry: any) => {
    const { Type, ToolType, PlantType, ...extra } = entry || {};
    modifications.push({
      ...cloneJson(extra),
      alias,
      waveIndex,
      mode: 'Add',
      PlantType: parsePlantReference(Type || ToolType || PlantType)
    });
  });
  (Array.isArray(objdata.Remove) ? objdata.Remove : []).forEach((entry: any) => {
    const { Type, ToolType, PlantType, ...extra } = entry || {};
    modifications.push({
      ...cloneJson(extra),
      alias,
      waveIndex,
      mode: 'Remove',
      PlantType: parsePlantReference(Type || ToolType || PlantType)
    });
  });
  return modifications;
}

function parseConveyorDraft(
  conveyorObject: any,
  conveyorAlias: string,
  originalActionObjects: PreservedConveyorWaveAction[],
  waveModifications: ConveyorWaveModification[]
): ConveyorDraft {
  if (!conveyorObject) return createDefaultConveyorDraft();
  const objdata = conveyorObject.objdata || {};
  return {
    enabled: true,
    alias: conveyorAlias || 'ConveyorBelt',
    preserveOriginal: true,
    dirty: false,
    originalObject: cloneJson(conveyorObject),
    originalActionObjects,
    initialPlants: Array.isArray(objdata.InitialPlantList) ? objdata.InitialPlantList.map(parseConveyorPlantEntry) : [],
    dropDelayConditions: Array.isArray(objdata.DropDelayConditions)
      ? objdata.DropDelayConditions.map((entry: any) => cloneJson(entry))
      : [],
    speedConditions: Array.isArray(objdata.SpeedConditions) ? objdata.SpeedConditions.map((entry: any) => cloneJson(entry)) : [],
    waveModifications,
    extra: omitKeys(objdata, ['InitialPlantList', 'DropDelayConditions', 'SpeedConditions'])
  };
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

function isPreservingConveyorActions() {
  return Boolean(
    draft.value.conveyor.enabled &&
      draft.value.conveyor.preserveOriginal &&
      !draft.value.conveyor.dirty &&
      draft.value.conveyor.originalObject
  );
}

function getWaveConveyorOrderEntries(waveIndex: number): WaveActionOrderEntry[] {
  if (!draft.value.conveyor.enabled) return [];
  if (isPreservingConveyorActions()) {
    return draft.value.conveyor.originalActionObjects
      .filter((action) => action.waveIndex === waveIndex)
      .map((action) => ({ kind: 'conveyor', alias: action.alias }));
  }
  return draft.value.conveyor.waveModifications.some((modification) => modification.waveIndex === waveIndex)
    ? [{ kind: 'conveyor' }]
    : [];
}

function getEffectiveWaveActionOrder(wave: WaveDraft, waveIndex: number) {
  const result: WaveActionOrderEntry[] = [];
  const rawIds = new Set(wave.rawActions.map((action) => action.id));
  const conveyorEntries = getWaveConveyorOrderEntries(waveIndex);
  const preservingConveyor = isPreservingConveyorActions();
  const conveyorAliases = new Set(conveyorEntries.map((entry) => entry.alias).filter(Boolean));
  let hasZombies = false;
  let hasGeneratedConveyor = false;
  const rawOrderIds = new Set<number>();
  const preservedConveyorAliases = new Set<string>();

  const append = (entry: WaveActionOrderEntry) => {
    if (entry.kind === 'zombies') {
      if (hasZombies || (!wave.zombies.length && !wave.zombieActionAlias)) return;
      hasZombies = true;
      result.push({ kind: 'zombies', alias: wave.zombieActionAlias || entry.alias });
      return;
    }
    if (entry.kind === 'raw') {
      if (!entry.actionId || !rawIds.has(entry.actionId) || rawOrderIds.has(entry.actionId)) return;
      rawOrderIds.add(entry.actionId);
      result.push({ kind: 'raw', actionId: entry.actionId, alias: entry.alias });
      return;
    }
    if (preservingConveyor) {
      if (!entry.alias || !conveyorAliases.has(entry.alias) || preservedConveyorAliases.has(entry.alias)) return;
      preservedConveyorAliases.add(entry.alias);
      result.push({ kind: 'conveyor', alias: entry.alias });
      return;
    }
    if (!conveyorEntries.length || hasGeneratedConveyor) return;
    hasGeneratedConveyor = true;
    result.push({ kind: 'conveyor' });
  };

  wave.actionOrder.forEach(append);
  append({ kind: 'zombies' });
  wave.rawActions.forEach((action) => append({ kind: 'raw', actionId: action.id, alias: action.alias }));
  conveyorEntries.forEach(append);
  return result;
}

function markWaveOrderEdited() {
  draft.value.hasWaveManager = true;
  draft.value.preserveGeneratorWaves = false;
  draft.value.preserveCustomWaveManager = false;
  draft.value.waveSystemDirty = true;
}

function moveWaveAction(wave: WaveDraft, entryIndex: number, direction: -1 | 1) {
  const waveIndex = draft.value.waves.findIndex((item) => item.id === wave.id) + 1;
  const order = getEffectiveWaveActionOrder(wave, waveIndex);
  const targetIndex = entryIndex + direction;
  if (targetIndex < 0 || targetIndex >= order.length) return;
  markWaveOrderEdited();
  [order[entryIndex], order[targetIndex]] = [order[targetIndex], order[entryIndex]];
  wave.actionOrder = order;
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
  const action = createRawWaveAction(createUniqueWaveActionAlias(templates.alias), templates.objclass, templates.objdata);
  wave.rawActions.push(action);
  wave.actionOrder.push({ kind: 'raw', actionId: action.id, alias: action.alias });
  expandedWaveActionKey.value = `raw:${action.id}`;
}

function removeWaveAction(wave: WaveDraft, id: number) {
  markWaveSystemEdited();
  wave.rawActions = wave.rawActions.filter((action) => action.id !== id);
  wave.actionOrder = wave.actionOrder.filter((entry) => !(entry.kind === 'raw' && entry.actionId === id));
  if (expandedWaveActionKey.value === `raw:${id}`) expandedWaveActionKey.value = 'zombies';
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

function updateWaveActionData(action: WaveActionDraft, updater: (objdata: Record<string, any>) => void) {
  markWaveSystemEdited();
  const objdata = cloneJson(action.objdata || {});
  updater(objdata);
  action.objdata = objdata;
  action.jsonText = stringifyObjdata(objdata);
}

function setWaveZombieRow(zombie: WaveZombie, value: string) {
  markWaveSystemEdited();
  zombie.row = value;
  zombie.rowDirty = true;
}

function getWaveActionKey(entry: WaveActionOrderEntry) {
  if (entry.kind === 'raw') return `raw:${entry.actionId}`;
  return entry.kind;
}

function selectWave(id: number) {
  selectedWaveId.value = id;
  const index = draft.value.waves.findIndex((wave) => wave.id === id);
  const wave = draft.value.waves[index];
  const firstEntry = wave ? getEffectiveWaveActionOrder(wave, index + 1)[0] : undefined;
  expandedWaveActionKey.value = firstEntry ? getWaveActionKey(firstEntry) : '';
}

function toggleWaveAction(entry: WaveActionOrderEntry) {
  const key = getWaveActionKey(entry);
  expandedWaveActionKey.value = expandedWaveActionKey.value === key ? '' : key;
}

function handleUpload(file: File) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON5.parse(String(reader.result || '{}'));
      const levelDefinitions = Array.isArray(parsed?.objects)
        ? parsed.objects.filter((object: any) => object?.objclass === 'LevelDefinition')
        : [];
      const levelData = levelDefinitions[0]?.objdata;
      if (
        levelDefinitions.length !== 1 ||
        !levelData ||
        !String(levelData.Name || parsed?.['#comment'] || '').trim() ||
        !String(levelData.StageModule || '').trim() ||
        !Array.isArray(levelData.Modules)
      ) {
        message.error(t('importInvalidStructure'));
        return;
      }
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
  const seedObject = objects.find((object: any) => object?.objclass === 'SeedBankProperties');
  const conveyorObject = objects.find((object: any) => object?.objclass === 'ConveyorSeedBankProperties');
  const seed = seedObject?.objdata || {};
  const waveManagerModule = objects.find((object: any) => object?.objclass === 'WaveManagerModuleProperties');
  const waveManagerObject = objects.find((object: any) => object?.objclass === 'WaveManagerProperties');
  const waveProps = waveManagerObject?.objdata || {};
  const importedFlagWaveInterval = Math.trunc(Number(waveProps.FlagWaveInterval ?? 5));
  const flagWaveInterval = normalizeFlagWaveIntervalMagnitude(importedFlagWaveInterval, 5);
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
  const conveyorAliases = Array.isArray(conveyorObject?.aliases) ? conveyorObject.aliases.map(String) : [];
  const conveyorAlias =
    conveyorAliases.find((alias) => levelModules.includes(`RTID(${alias}@CurrentLevel)`)) ||
    conveyorAliases[0] ||
    levelModules.map(parseCurrentLevelAlias).find((alias) => /^Conveyor(Belt)?$/i.test(alias)) ||
    'ConveyorBelt';

  const waveActionAliases = new Set<string>();
  const conveyorActionObjects: PreservedConveyorWaveAction[] = [];
  const conveyorWaveModifications: ConveyorWaveModification[] = [];
  const waves: WaveDraft[] = (Array.isArray(waveProps.Waves) ? waveProps.Waves : []).map((entryRefs: unknown, index: number) => {
    const wave = createEmptyWave(index + 1, index + 1);
    wave.flag = (index + 1) % flagWaveInterval === 0;
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
        wave.actionOrder.push({ kind: 'zombies', alias });
      } else if (waveObject.objclass === 'ModifyConveyorWaveActionProps') {
        const objdata = cloneJson(waveObject.objdata || {});
        conveyorActionObjects.push({
          alias,
          waveIndex: index + 1,
          objclass: 'ModifyConveyorWaveActionProps',
          objdata
        });
        conveyorWaveModifications.push(...parseConveyorWaveModifications(objdata, index + 1, alias));
        wave.actionOrder.push({ kind: 'conveyor', alias });
      } else {
        const action = createRawWaveAction(alias, String(waveObject.objclass || 'WaveActionProps'), waveObject.objdata || {});
        wave.rawActions.push(action);
        wave.actionOrder.push({ kind: 'raw', actionId: action.id, alias });
      }
    });
    return wave;
  });

  const boardItems: BoardItem[] = [];
  objects
    .filter((object: any) => object?.objclass === 'GravestoneProperties')
    .forEach((object: any) => {
      (object?.objdata?.ForceSpawnData || []).forEach((entry: any) => {
        const code = entry.TypeName || 'gravestone';
        const option = getObjectOption(code);
        boardItems.push({
          id: nextItemId.value++,
          kind: 'object',
          code,
          label: option?.name || code,
          row: Number(entry.GridY || 0),
          col: Number(entry.GridX || 0),
          category: option?.category || 'tombstone',
          exportClass: 'GravestoneProperties',
          props: option?.props,
          res: option?.res,
          source: option?.source,
          advanced: option?.advanced,
          extra: getPlacementExtra(entry)
        });
      });
    });
  objects
    .filter((object: any) => object?.objclass === 'InitialGridItemProperties')
    .forEach((object: any) => {
      (object?.objdata?.InitialGridItemPlacements || []).forEach((entry: any) => {
        const option = getObjectOption(entry.TypeName);
        boardItems.push({
          id: nextItemId.value++,
          kind: 'object',
          code: entry.TypeName,
          label: option?.name || getObjectDisplayName(entry.TypeName),
          row: Number(entry.GridY || 0),
          col: Number(entry.GridX || 0),
          category: option?.category || 'tile',
          exportClass: 'InitialGridItemProperties',
          props: option?.props,
          res: option?.res,
          source: option?.source,
          advanced: option?.advanced,
          extra: getPlacementExtra(entry)
        });
      });
      (object?.objdata?.InitialGridItemMatrixes || []).forEach((matrix: any) => {
        (matrix.GridMatrix || []).forEach((line: string, row: number) => {
          line.split('').forEach((cell, col) => {
            if (cell === '1') {
              const option = getObjectOption(matrix.TypeName);
              boardItems.push({
                id: nextItemId.value++,
                kind: 'object',
                code: matrix.TypeName,
                label: option?.name || getObjectDisplayName(matrix.TypeName),
                row,
                col,
                category: option?.category || 'tile',
                exportClass: 'InitialGridItemProperties',
                props: option?.props,
                res: option?.res,
                source: option?.source,
                advanced: option?.advanced
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
    'ConveyorSeedBankProperties',
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
    author: String(level.WrittenBy || level.WritenBy || raw?.Information?.Author || ''),
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
    hasSeedBank: !!seedObject,
    seedBankExtra: omitKeys(seed, ['SelectionMethod', 'UnlockAll', 'OverrideSeedSlotsCount', 'PresetPlantList', 'PlantIncludeList', 'PlantExcludeList']),
    conveyor: parseConveyorDraft(conveyorObject, conveyorAlias, conveyorActionObjects, conveyorWaveModifications),
    boardItems,
    waves: waves.length ? waves : [],
    flagWaveInterval,
    flagWaveIntervalOriginal: Number.isFinite(importedFlagWaveInterval) && importedFlagWaveInterval !== 0 ? importedFlagWaveInterval : undefined,
    flagWaveIntervalDirty: false,
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
    levelExtra: omitKeys(level, ['Name', 'Description', 'StageModule', 'Modules', 'StartingSun', 'WrittenBy', 'WritenBy']),
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

function parsePlantReference(value: unknown) {
  const text = String(value || '');
  return parseTypeAlias(text) || text;
}

function toPlantTypeRef(code: string) {
  return `RTID(${code}@PlantTypes)`;
}

function getPlacementExtra(entry: any) {
  const { GridX, GridY, TypeName, ...extra } = entry || {};
  return Object.keys(extra).length ? extra : undefined;
}

function serializeBoardPlacement(item: BoardItem) {
  const placement: Record<string, any> = {
    ...(item.extra || {}),
    GridX: item.col,
    GridY: item.row
  };
  if (!(item.exportClass === 'GravestoneProperties' && item.code === 'gravestone')) {
    placement.TypeName = item.code;
  }
  return placement;
}

function serializeWaveZombies(wave: WaveDraft) {
  return wave.zombies.flatMap((zombie) => {
    const templates = zombie.entries?.length ? zombie.entries : [{ Type: `RTID(${zombie.code}@ZombieTypes)` }];
    return Array.from({ length: Math.max(1, Number(zombie.count) || 1) }, (_, index) => {
      const template = cloneJson(templates[Math.min(index, templates.length - 1)] || {});
      const importedRow = template.Row;
      delete template.Row;
      return {
        ...template,
        Type: `RTID(${zombie.code}@ZombieTypes)`,
        ...(zombie.row
          ? { Row: !zombie.rowDirty && importedRow !== undefined && String(importedRow) === zombie.row ? importedRow : zombie.row }
          : {})
      };
    });
  });
}

function compactUndefinedValues(source: Record<string, any>) {
  return Object.fromEntries(Object.entries(source).filter(([, value]) => value !== undefined));
}

function serializeConveyorPlantEntry(entry: ConveyorPlantEntry) {
  const { PlantType, ...extra } = entry;
  return compactUndefinedValues({
    ...cloneJson(extra),
    PlantType: PlantType || 'peashooter'
  });
}

function serializeConveyorWaveEntry(entry: ConveyorWaveModification) {
  const { waveIndex, mode, alias, PlantType, ...extra } = entry;
  return compactUndefinedValues({
    ...cloneJson(extra),
    Type: toPlantTypeRef(PlantType || 'peashooter')
  });
}

function buildConveyorWaveObjdata(modifications: ConveyorWaveModification[]) {
  const add = modifications.filter((item) => item.mode === 'Add').map(serializeConveyorWaveEntry);
  const remove = modifications.filter((item) => item.mode === 'Remove').map(serializeConveyorWaveEntry);
  return {
    ...(add.length ? { Add: add } : {}),
    ...(remove.length ? { Remove: remove } : {})
  };
}

function serializeConveyorData() {
  return compactUndefinedValues({
    ...draft.value.conveyor.extra,
    ...(draft.value.conveyor.dropDelayConditions.length
      ? { DropDelayConditions: draft.value.conveyor.dropDelayConditions.map((entry) => compactUndefinedValues(cloneJson(entry))) }
      : {}),
    InitialPlantList: draft.value.conveyor.initialPlants.map(serializeConveyorPlantEntry),
    ...(draft.value.conveyor.speedConditions.length
      ? { SpeedConditions: draft.value.conveyor.speedConditions.map((entry) => compactUndefinedValues(cloneJson(entry))) }
      : {})
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
  generatedBoardRefs: string[],
  shouldEmitSeedBank: boolean,
  shouldEmitConveyor: boolean
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
  refs = setModuleRef(refs, 'RTID(SeedBank@CurrentLevel)', shouldEmitSeedBank && !shouldEmitConveyor);
  refs = replaceModuleGroup(
    refs,
    new Set([
      'RTID(Conveyor@CurrentLevel)',
      'RTID(ConveyorBelt@CurrentLevel)',
      `RTID(${draft.value.conveyor.alias || 'ConveyorBelt'}@CurrentLevel)`
    ]),
    shouldEmitConveyor ? `RTID(${draft.value.conveyor.alias || 'ConveyorBelt'}@CurrentLevel)` : null
  );

  if (!draft.value.preserveBoardModules) {
    const boardRefs = new Set([
      'RTID(InitialGridItems@CurrentLevel)',
      'RTID(Gravestones@CurrentLevel)',
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
  const shouldEmitConveyor = draft.value.conveyor.enabled;
  const shouldPreserveConveyor = shouldEmitConveyor && draft.value.conveyor.preserveOriginal && !draft.value.conveyor.dirty && draft.value.conveyor.originalObject;
  const shouldEmitWaveManager =
    !!preserveGeneratorWaveSystem || !!preserveCustomWaveManager || draft.value.hasWaveManager || draft.value.waves.length > 0;
  const shouldReferenceWaveManager = draft.value.moduleRefs.includes(NEW_WAVES_REF) || (draft.value.waveSystemDirty && draft.value.waves.length > 0);
  const shouldEmitSeedBank =
    !shouldEmitConveyor &&
    (draft.value.hasSeedBank ||
      draft.value.moduleRefs.includes('RTID(SeedBank@CurrentLevel)') ||
      normalizedSeedPlants.length > 0 ||
      draft.value.includePlants.length > 0 ||
      draft.value.excludePlants.length > 0 ||
      draft.value.unlockAll ||
      draft.value.seedMode === 'preset' ||
      seedSlots !== MAX_SEED_PLANTS ||
      Object.keys(draft.value.seedBankExtra || {}).length > 0);
  const usedActionAliases = new Set<string>([
    'SeedBank',
    'Conveyor',
    'ConveyorBelt',
    draft.value.conveyor.alias || 'ConveyorBelt',
    'NewWaves',
    'WaveManagerProps',
    'InitialGridItems',
    'Gravestones',
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
  const emittedRawActionAliases = new Map<string, string>();
  const emittedConveyorActionAliases = new Set<string>();
  const waveRefs = draft.value.waves.map((wave, index) => {
    const refs: string[] = [];
    let zombiesEmitted = false;
    let generatedConveyorEmitted = false;

    const appendZombies = () => {
      if (zombiesEmitted || (!wave.zombies.length && !wave.zombieActionAlias)) return;
      zombiesEmitted = true;
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
    };

    const appendRawAction = (action: WaveActionDraft) => {
      const rawActionKey = action.alias || '';
      const existingAlias = rawActionKey ? emittedRawActionAliases.get(rawActionKey) : undefined;
      if (existingAlias) {
        refs.push(`RTID(${existingAlias}@CurrentLevel)`);
        return;
      }
      const actionIndex = wave.rawActions.findIndex((item) => item.id === action.id);
      const alias = uniqueActionAlias(action.alias || `Wave${index + 1}Action${actionIndex}`);
      waveObjects.push({
        aliases: [alias],
        objclass: action.objclass,
        objdata: parseActionObjdata(action)
      });
      refs.push(`RTID(${alias}@CurrentLevel)`);
      if (rawActionKey) emittedRawActionAliases.set(rawActionKey, alias);
    };

    const appendConveyorAction = (entry: WaveActionOrderEntry) => {
      if (shouldPreserveConveyor) {
        const action = draft.value.conveyor.originalActionObjects.find(
          (item) => item.waveIndex === index + 1 && item.alias === entry.alias
        );
        if (!action) return;
        if (!emittedConveyorActionAliases.has(action.alias)) {
          emittedConveyorActionAliases.add(action.alias);
          usedActionAliases.add(action.alias);
          waveObjects.push({
            aliases: [action.alias],
            objclass: action.objclass,
            objdata: cloneJson(action.objdata)
          });
        }
        refs.push(`RTID(${action.alias}@CurrentLevel)`);
        return;
      }
      if (!shouldEmitConveyor || generatedConveyorEmitted) return;
      const conveyorModifications = draft.value.conveyor.waveModifications.filter((modification) => modification.waveIndex === index + 1);
      if (conveyorModifications.length) {
        generatedConveyorEmitted = true;
        const alias = uniqueActionAlias(`Wave${index + 1}ModConveyor0`);
        waveObjects.push({
          aliases: [alias],
          objclass: 'ModifyConveyorWaveActionProps',
          objdata: buildConveyorWaveObjdata(conveyorModifications)
        });
        refs.push(`RTID(${alias}@CurrentLevel)`);
      }
    };

    getEffectiveWaveActionOrder(wave, index + 1).forEach((entry) => {
      if (entry.kind === 'zombies') appendZombies();
      else if (entry.kind === 'raw') {
        const action = wave.rawActions.find((item) => item.id === entry.actionId);
        if (action) appendRawAction(action);
      } else appendConveyorAction(entry);
    });
    return refs;
  });

  const gridItems = draft.value.boardItems
    .filter((item) => item.kind === 'object' && (item.exportClass || 'InitialGridItemProperties') === 'InitialGridItemProperties')
    .map(serializeBoardPlacement);
  const gravestoneItems = draft.value.boardItems
    .filter((item) => item.kind === 'object' && item.exportClass === 'GravestoneProperties')
    .map(serializeBoardPlacement);
  const initialPlants = draft.value.boardItems.filter((item) => item.kind === 'plant').map(serializeBoardPlacement);
  const initialZombies = draft.value.boardItems.filter((item) => item.kind === 'zombie').map(serializeBoardPlacement);
  const generatedBoardRefs = [
    ...(!draft.value.preserveBoardModules && gridItems.length ? ['RTID(InitialGridItems@CurrentLevel)'] : []),
    ...(!draft.value.preserveBoardModules && gravestoneItems.length ? ['RTID(Gravestones@CurrentLevel)'] : []),
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
    FlagWaveInterval:
      !draft.value.flagWaveIntervalDirty && draft.value.flagWaveIntervalOriginal !== undefined
        ? draft.value.flagWaveIntervalOriginal
        : normalizeFlagWaveIntervalMagnitude(draft.value.flagWaveInterval, 5),
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
        Modules: buildModuleRefs(
          mowerModule,
          sunDropperModule,
          shouldReferenceWaveManager,
          generatedBoardRefs,
          shouldEmitSeedBank,
          shouldEmitConveyor
        ),
        ...(draft.value.author.trim() ? { WrittenBy: draft.value.author.trim() } : {})
      }
    }
  ];

  if (shouldEmitSeedBank) {
    objects.push({
      aliases: ['SeedBank'],
      objclass: 'SeedBankProperties',
      objdata: seedBankData
    });
  }

  if (shouldEmitConveyor) {
    objects.push(
      shouldPreserveConveyor
        ? cloneJson(draft.value.conveyor.originalObject)
        : {
            aliases: [draft.value.conveyor.alias || 'ConveyorBelt'],
            objclass: 'ConveyorSeedBankProperties',
            objdata: serializeConveyorData()
          }
    );
  }

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

  if (!draft.value.preserveBoardModules && gravestoneItems.length) {
    objects.push({
      aliases: ['Gravestones'],
      objclass: 'GravestoneProperties',
      objdata: { ForceSpawnData: gravestoneItems }
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
            'aria-label': t('levelName'),
            value: draft.value.name,
            onInput: (event: Event) => {
              draft.value.name = (event.target as HTMLInputElement).value;
            }
          })
        ]),
        h('div', { class: 'field-row wide' }, [
          h('label', t('description')),
          h('input', {
            'aria-label': t('description'),
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
              'aria-label': t('stage'),
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
            'aria-label': t('startingSun'),
            value: draft.value.startingSun,
            onInput: (event: Event) => {
              draft.value.startingSun = Number((event.target as HTMLInputElement).value);
            }
          })
        ]),
        expertMode.value
          ? h('details', { class: 'advanced-details wide' }, [
              h('summary', t('advancedLevel')),
              h('div', { class: 'advanced-grid' }, [
                h('div', { class: 'field-row' }, [
                  h('label', t('author')),
                  h('input', {
                    'aria-label': t('author'),
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
                      'aria-label': t('mower'),
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
                      'aria-label': t('sunDropper'),
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
          : null
      ]);
  }
});

const AssetLibrary = defineComponent({
  setup() {
    return () =>
        h('aside', { class: 'asset-library' }, [
        h('div', { class: 'panel-title' }, t('chooseAsset')),
        h('div', { class: 'segmented', role: 'group', 'aria-label': t('assetType') }, [
          h('button', { type: 'button', class: assetTab.value === 'plant' ? 'active' : '', 'aria-pressed': assetTab.value === 'plant', onClick: () => (assetTab.value = 'plant') }, t('plants')),
          h('button', { type: 'button', class: assetTab.value === 'zombie' ? 'active' : '', 'aria-pressed': assetTab.value === 'zombie', onClick: () => (assetTab.value = 'zombie') }, t('zombies')),
          h('button', { type: 'button', class: assetTab.value === 'object' ? 'active' : '', 'aria-pressed': assetTab.value === 'object', onClick: () => (assetTab.value = 'object') }, t('objects'))
        ]),
        assetTab.value === 'object'
          ? h('div', { class: 'object-category-tabs', role: 'group', 'aria-label': t('objectCategory') }, [
              h('button', { type: 'button', class: objectCategory.value === 'all' ? 'active' : '', 'aria-pressed': objectCategory.value === 'all', onClick: () => (objectCategory.value = 'all') }, t('objectCategoryAll')),
              h('button', { type: 'button', class: objectCategory.value === 'tile' ? 'active' : '', 'aria-pressed': objectCategory.value === 'tile', onClick: () => (objectCategory.value = 'tile') }, t('objectCategoryTile')),
              h(
                'button',
                { type: 'button', class: objectCategory.value === 'obstacle' ? 'active' : '', 'aria-pressed': objectCategory.value === 'obstacle', onClick: () => (objectCategory.value = 'obstacle') },
                t('objectCategoryObstacle')
              ),
              h(
                'button',
                { type: 'button', class: objectCategory.value === 'tombstone' ? 'active' : '', 'aria-pressed': objectCategory.value === 'tombstone', onClick: () => (objectCategory.value = 'tombstone') },
                t('objectCategoryTombstone')
              )
            ])
          : null,
        h('input', {
          class: 'asset-search',
          placeholder: t('search'),
          'aria-label': t('search'),
          value: assetSearch.value,
          onInput: (event: Event) => {
            assetSearch.value = (event.target as HTMLInputElement).value;
          }
        }),
        h('div', { class: 'asset-result-summary', 'aria-live': 'polite' }, t('assetResults', { count: currentAssetOptions.value.length })),
        h(
          'div',
          { class: 'asset-list' },
          currentAssetOptions.value.length
            ? visibleAssetOptions.value.map((asset) =>
                h(
                  'button',
                  {
                    type: 'button',
                    class: ['asset-row', selectedAsset.value?.kind === asset.kind && selectedAsset.value?.code === asset.code ? 'active' : ''],
                    'aria-pressed': selectedAsset.value?.kind === asset.kind && selectedAsset.value?.code === asset.code,
                    onClick: () => chooseAsset(asset)
                  },
                  [
                    asset.image
                      ? h('img', { src: asset.image, alt: '', loading: 'lazy' })
                      : h('span', { class: ['object-dot', asset.kind === 'object' ? asset.category || 'object' : ''], 'aria-hidden': 'true' }),
                    h('span', { class: 'asset-copy' }, [
                      h('strong', asset.name),
                      h('small', asset.code),
                      asset.kind === 'object'
                        ? h('span', { class: 'asset-meta-row' }, [
                            h('span', { class: `asset-badge ${asset.category || 'object'}` }, getObjectCategoryLabel(asset.category)),
                            asset.advanced ? h('span', { class: 'asset-badge advanced' }, t('advancedObject')) : null
                          ])
                        : null
                    ])
                  ]
                )
              )
            : h('div', { class: 'asset-empty' }, t('noAssetResults'))
        ),
        visibleAssetOptions.value.length < currentAssetOptions.value.length
          ? h(
              'button',
              { type: 'button', class: 'asset-load-more add-button', onClick: showMoreAssets },
              t('showMoreAssets', { count: Math.min(ASSET_PAGE_SIZE, currentAssetOptions.value.length - visibleAssetOptions.value.length) })
            )
          : null
      ]);
  }
});

function getBoardItemExportTarget(item: BoardItem) {
  if (item.kind === 'plant') return 'InitialPlantProperties';
  if (item.kind === 'zombie') return 'InitialZombieProperties';
  return item.exportClass || 'InitialGridItemProperties';
}

function renderCellDetailAdvanced(item: BoardItem) {
  if (!expertMode.value) return null;

  const preservedEntries = preservedPlacementExtraEntries(item);
  const hasEditableControls = item.kind === 'plant' || item.kind === 'zombie';
  const exportTarget = getBoardItemExportTarget(item);
  const metaEntries = [
    [t('exportTarget'), exportTarget],
    ...(item.source ? [[t('sourceField'), item.source]] : []),
    ...(item.props ? [[t('propsField'), item.props]] : []),
    ...(item.res ? [[t('resField'), item.res]] : [])
  ];

  return h('details', { class: 'cell-detail-advanced' }, [
    h('summary', t('advancedPlacementInfo')),
    hasEditableControls
      ? h('div', { class: 'placement-control-row' }, [
          h('label', { class: 'check-row' }, [
            h('input', {
              type: 'checkbox',
              checked: item.extra?.Condition === 'icecubed',
              onChange: (event: Event) => setBoardItemIcecubed(item, (event.target as HTMLInputElement).checked)
            }),
            t('icecubedCondition')
          ]),
          item.kind === 'plant'
            ? h('label', { class: 'check-row' }, [
                h('input', {
                  type: 'checkbox',
                  checked: item.extra?.Plantfood === true,
                  onChange: (event: Event) => setBoardItemPlantfood(item, (event.target as HTMLInputElement).checked)
                }),
                t('startPlantfood')
          ])
          : null
        ])
      : null,
    h(
      'div',
      { class: 'placement-extra-list' },
      metaEntries.map(([key, value]) => h('code', { class: 'placement-extra-chip' }, `${key}: ${value}`))
    ),
    preservedEntries.length
      ? h('div', { class: 'placement-extra-list' }, [
          h('small', { class: 'placement-extra-title' }, t('preservedPlacementFields')),
          ...preservedEntries.map(([key, value]) =>
            h('code', { class: 'placement-extra-chip' }, `${key}: ${formatPlacementExtraValue(value)}`)
          )
        ])
      : null
  ]);
}

function renderCellDetailItem(item: BoardItem) {
  return h('div', { class: `cell-detail-pill ${item.kind}` }, [
    h(
      'button',
      {
        class: 'cell-detail-remove',
        type: 'button',
        title: t('removeCellItem', { name: item.label }),
        'aria-label': t('removeCellItem', { name: item.label }),
        onClick: () => removeBoardItem(item.id)
      },
      h(CloseOutlined, { 'aria-hidden': 'true' })
    ),
    h('div', { class: 'cell-detail-main' }, [
      getBoardItemImage(item)
        ? h('img', { src: getBoardItemImage(item), alt: item.label, loading: 'lazy' })
        : h('span', { class: `cell-chip ${item.kind} ${getBoardItemLayer(item)} ${item.category || ''}` }, getBoardItemChip(item)),
      h('span', { class: 'cell-detail-copy' }, [
        h('strong', item.label),
        h('small', getBoardItemTypeLabel(item)),
        h('small', { class: 'cell-detail-code' }, item.code)
      ])
    ]),
    renderCellDetailAdvanced(item)
  ]);
}

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
          { class: `lawn-grid stage-${draft.value.stage.toLowerCase()}`, 'aria-label': t('board') },
          Array.from({ length: 5 }, (_, row) =>
            Array.from({ length: 9 }, (_, col) => {
              const items = itemsAt(row, col);
              return h(
                'button',
                {
                  type: 'button',
                  'aria-label': getCellAriaLabel(row, col, items),
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
                            class: `cell-marker ${item.kind} ${getBoardItemLayer(item)} ${item.category || ''}`,
                            title: `${getBoardItemTypeLabel(item)}: ${item.label}`
                          },
                          getBoardItemImage(item)
                            ? h('img', { src: getBoardItemImage(item), alt: item.label, loading: 'lazy' })
                            : h('span', { class: `cell-chip ${item.kind} ${getBoardItemLayer(item)} ${item.category || ''}` }, getBoardItemChip(item))
                        )
                      )
                    )
                  : h('span', { class: 'cell-coord' }, `${col + 1},${row + 1}`)
              );
            })
          ).flat()
        ),
        selectedCell.value
          ? h('div', { class: 'cell-detail-panel' }, [
              h('div', { class: 'cell-detail-title' }, t('selectedCellTitle', { col: selectedCell.value.col + 1, row: selectedCell.value.row + 1 })),
              selectedCellItems.value.length
                ? h(
                    'div',
                    { class: 'cell-detail-list' },
                    selectedCellItems.value.map((item) => renderCellDetailItem(item))
                  )
                : h('div', { class: 'cell-detail-empty' }, t('selectedCellEmpty'))
            ])
          : null
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
            h('button', { 'aria-label': t('remove'), onClick: () => removePlantFromList(listKey, code) }, 'x')
          ]);
        })
      : h('small', { class: 'seed-mode-hint' }, t('emptyList'))
  );
}

function renderConveyorPlantPills() {
  return h(
    'div',
    { class: 'seed-list' },
    draft.value.conveyor.initialPlants.length
      ? draft.value.conveyor.initialPlants.map((entry, index) => {
          const plant = plantOptions.value.find((item) => item.code === entry.PlantType);
          return h('span', { class: 'seed-pill' }, [
            plant?.image ? h('img', { src: plant.image, alt: plant.name, loading: 'lazy' }) : null,
            h('span', plant?.name || entry.PlantType),
            h('button', { 'aria-label': t('remove'), onClick: () => removeConveyorPlant(index) }, 'x')
          ]);
        })
      : h('small', { class: 'seed-mode-hint' }, t('emptyList'))
  );
}

function renderPlantSelect(value: string, onChange: (code: string) => void) {
  const knownPlant = plantOptions.value.some((plant) => plant.code === value);
  return h(
    'select',
    {
      value,
      onChange: (event: Event) => onChange((event.target as HTMLSelectElement).value)
    },
    [
      !knownPlant && value ? h('option', { value }, value) : null,
      ...plantOptions.value.map((plant) => h('option', { value: plant.code }, `${plant.name} (${plant.code})`))
    ].filter(Boolean)
  );
}

function renderConveyorNumberField(
  labelKey: string,
  value: number | undefined,
  onInput: (value: string) => void,
  min = 0,
  step: string | number = 'any'
) {
  return h('div', { class: 'field-row compact' }, [
    h('label', t(labelKey)),
    h('input', {
      type: 'number',
      min,
      step,
      value: value ?? '',
      onInput: (event: Event) => onInput((event.target as HTMLInputElement).value)
    })
  ]);
}

function renderConveyorChipList(chips: string[]) {
  return chips.length
    ? h('div', { class: 'conveyor-chip-list' }, chips.map((chip) => h('span', { class: 'conveyor-chip' }, chip)))
    : h('small', { class: 'conveyor-muted' }, t('conveyorNoExtraParams'));
}

function getConveyorPlantSummaryChips(entry: ConveyorPlantEntry | ConveyorWaveModification) {
  const chips: string[] = [];
  if (entry.Weight !== undefined) chips.push(`${t('conveyorWeight')} ${entry.Weight}`);
  if (entry.MinCount !== undefined) chips.push(`${t('conveyorMinCount')} ${entry.MinCount}`);
  if (entry.MaxCount !== undefined) chips.push(`${t('conveyorMaxCount')} ${entry.MaxCount}`);
  if (entry.MaxDelivered !== undefined) chips.push(`${t('conveyorMaxDelivered')} ${entry.MaxDelivered}`);
  if (entry.MinWeightFactor !== undefined) chips.push(`${t('conveyorMinWeightFactor')} ${entry.MinWeightFactor}`);
  if (entry.MaxWeightFactor !== undefined) chips.push(`${t('conveyorMaxWeightFactor')} ${entry.MaxWeightFactor}`);
  if (entry.CooldownSeconds !== undefined) chips.push(`${t('conveyorCooldownSeconds')} ${entry.CooldownSeconds}`);
  if (entry.MinCountCooldownSeconds !== undefined) chips.push(`${t('conveyorMinCountCooldownSeconds')} ${entry.MinCountCooldownSeconds}`);
  if (entry.MaxCountCooldownSeconds !== undefined) chips.push(`${t('conveyorMaxCountCooldownSeconds')} ${entry.MaxCountCooldownSeconds}`);
  if (entry.ForceBoosted === true) chips.push(t('conveyorForceBoosted'));
  return chips;
}

function renderConveyorPlantIdentity(code: string) {
  const image = getPlantDisplayImage(code);
  return h('div', { class: 'conveyor-row-media' }, [
    image ? h('img', { src: image, alt: getPlantDisplayName(code), loading: 'lazy' }) : h('span', { class: 'conveyor-plant-placeholder' }, code.slice(0, 2)),
    h('span', { class: 'conveyor-row-copy' }, [h('strong', getPlantDisplayName(code)), h('small', code)])
  ]);
}

function renderConveyorRowActions(editLabel: string, editTarget: ConveyorEditorTarget, removeLabel: string, onRemove: () => void) {
  return h('div', { class: 'conveyor-row-actions' }, [
    h(
      'button',
      {
        class: 'text-button icon-button',
        onClick: (event: MouseEvent) => openConveyorEditor(editTarget, event),
        'aria-label': editLabel
      },
      h(EditOutlined)
    ),
    h('button', { class: 'text-button danger icon-button', onClick: onRemove, 'aria-label': removeLabel }, h(DeleteOutlined))
  ]);
}

function renderConveyorPlantRows() {
  if (!draft.value.conveyor.initialPlants.length) return h('small', { class: 'seed-mode-hint' }, t('emptyList'));
  return h(
    'div',
    { class: 'conveyor-list compact' },
    draft.value.conveyor.initialPlants.map((entry, index) =>
      h('div', { class: 'conveyor-compact-row' }, [
        h('div', { class: 'conveyor-row-main' }, [renderConveyorPlantIdentity(entry.PlantType), renderConveyorChipList(getConveyorPlantSummaryChips(entry))]),
        renderConveyorRowActions(
          t('conveyorEditPlantAria', { plant: getPlantDisplayName(entry.PlantType) }),
          { kind: 'initialPlant', index },
          t('remove'),
          () => removeConveyorPlant(index)
        )
      ])
    )
  );
}

function renderConveyorConditions(kind: 'drop' | 'speed') {
  const list = kind === 'drop' ? draft.value.conveyor.dropDelayConditions : draft.value.conveyor.speedConditions;
  const valueKey = kind === 'drop' ? 'Delay' : 'Speed';
  return h('div', { class: 'conveyor-subsection' }, [
    h('div', { class: 'conveyor-subtitle' }, [
      h('strong', t(kind === 'drop' ? 'conveyorDropDelayConditions' : 'conveyorSpeedConditions')),
      h('button', { class: 'add-button small', onClick: () => addConveyorCondition(kind) }, [h(PlusOutlined), t('add')])
    ]),
    list.length
      ? h(
          'div',
          { class: 'conveyor-list compact' },
          list.map((entry, index) =>
            h('div', { class: 'conveyor-compact-row' }, [
              h('div', { class: 'conveyor-row-main' }, [
                h('div', { class: 'conveyor-rule-title' }, [
                  h('strong', t(kind === 'drop' ? 'conveyorRuleDrop' : 'conveyorRuleSpeed')),
                  h('small', `${t('conveyorMaxPackets')} ${entry.MaxPackets}`)
                ]),
                renderConveyorChipList([`${t(kind === 'drop' ? 'conveyorDelay' : 'conveyorSpeed')} ${entry[valueKey]}`])
              ]),
              renderConveyorRowActions(
                t(kind === 'drop' ? 'conveyorEditDropTitle' : 'conveyorEditSpeedTitle'),
                { kind: kind === 'drop' ? 'dropCondition' : 'speedCondition', index },
                t('remove'),
                () => removeConveyorCondition(kind, index)
              )
            ])
          )
        )
      : h('small', { class: 'seed-mode-hint' }, t('emptyList'))
  ]);
}

function renderConveyorWaveModifications() {
  return h('div', { class: 'conveyor-subsection' }, [
    h('div', { class: 'conveyor-subtitle' }, [
      h('strong', t('conveyorWaveModifications')),
      h('span', { class: 'conveyor-action-buttons' }, [
        h(
          'button',
          {
            class: ['add-button small', !selectedPlantAsset.value ? 'is-disabled' : ''],
            'aria-disabled': !selectedPlantAsset.value ? 'true' : 'false',
            onClick: () => addConveyorWaveModification('Add')
          },
          [h(PlusOutlined), t('conveyorAddPlant')]
        ),
        h(
          'button',
          {
            class: ['add-button small', !selectedPlantAsset.value ? 'is-disabled' : ''],
            'aria-disabled': !selectedPlantAsset.value ? 'true' : 'false',
            onClick: () => addConveyorWaveModification('Remove')
          },
          [h(PlusOutlined), t('conveyorRemovePlant')]
        )
      ])
    ]),
    conveyorActionHint.value ? h('small', { class: 'action-hint' }, t(conveyorActionHint.value)) : null,
    draft.value.conveyor.waveModifications.length
      ? h(
          'div',
          { class: 'conveyor-list compact' },
          draft.value.conveyor.waveModifications.map((entry, index) =>
            h('div', { class: 'conveyor-compact-row' }, [
              h('div', { class: 'conveyor-row-main' }, [
                h('div', { class: 'conveyor-wave-heading' }, [
                  h('span', { class: ['conveyor-mode-chip', entry.mode === 'Remove' ? 'remove' : 'add'] }, t(entry.mode === 'Add' ? 'conveyorAddPlant' : 'conveyorRemovePlant')),
                  h('span', { class: 'conveyor-wave-index' }, t('conveyorWaveNumber', { wave: entry.waveIndex }))
                ]),
                renderConveyorPlantIdentity(entry.PlantType),
                entry.mode === 'Add' ? renderConveyorChipList(getConveyorPlantSummaryChips(entry)) : null
              ]),
              renderConveyorRowActions(
                t('conveyorEditWaveAria', { wave: entry.waveIndex, plant: getPlantDisplayName(entry.PlantType) }),
                { kind: 'waveModification', index },
                t('remove'),
                () => removeConveyorWaveModification(index)
              )
            ])
          )
        )
      : h('small', { class: 'seed-mode-hint' }, t('emptyList'))
  ]);
}

function renderConveyorSummary() {
  const rulesCount = draft.value.conveyor.dropDelayConditions.length + draft.value.conveyor.speedConditions.length;
  return h('div', { class: 'conveyor-summary-grid' }, [
    h('div', { class: 'conveyor-summary-card' }, [h('strong', String(draft.value.conveyor.initialPlants.length)), h('span', t('conveyorSummaryPlants'))]),
    h('div', { class: 'conveyor-summary-card' }, [h('strong', String(rulesCount)), h('span', t('conveyorSummaryRules'))]),
    h('div', { class: 'conveyor-summary-card' }, [
      h('strong', String(draft.value.conveyor.waveModifications.length)),
      h('span', t('conveyorSummaryWaveMods'))
    ])
  ]);
}

function renderConveyorAdvancedTabs() {
  const tabs: Array<{ key: ConveyorAdvancedTab; label: string }> = [
    { key: 'plants', label: t('conveyorTabPlants') },
    { key: 'rules', label: t('conveyorTabRules') },
    { key: 'waves', label: t('conveyorTabWaves') }
  ];
  return h(
    'div',
    { class: 'segmented conveyor-tabs', role: 'tablist' },
    tabs.map((tab) =>
      h(
        'button',
        {
          class: conveyorAdvancedTab.value === tab.key ? 'active' : '',
          role: 'tab',
          'aria-selected': conveyorAdvancedTab.value === tab.key ? 'true' : 'false',
          onClick: () => (conveyorAdvancedTab.value = tab.key)
        },
        tab.label
      )
    )
  );
}

function renderConveyorAdvancedTabPanel() {
  if (conveyorAdvancedTab.value === 'rules') {
    return h('div', { class: 'conveyor-tab-panel' }, [renderConveyorConditions('drop'), renderConveyorConditions('speed')]);
  }
  if (conveyorAdvancedTab.value === 'waves') return h('div', { class: 'conveyor-tab-panel' }, [renderConveyorWaveModifications()]);
  return h('div', { class: 'conveyor-tab-panel' }, [
    h('div', { class: 'conveyor-subsection' }, [
      h('div', { class: 'conveyor-subtitle' }, [
        h('strong', t('conveyorInitialPlants')),
        h(
          'button',
          {
            class: ['add-button small', !selectedPlantAsset.value ? 'is-disabled' : ''],
            'aria-disabled': !selectedPlantAsset.value ? 'true' : 'false',
            onClick: addSelectedConveyorPlant
          },
          [h(PlusOutlined), t('addSelectedPlant')]
        )
      ]),
      renderConveyorPlantRows()
    ])
  ]);
}

function renderConveyorControls() {
  const children = [
    h('strong', `${t('conveyor')} ${draft.value.conveyor.initialPlants.length}`),
    renderConveyorPlantPills(),
    h('div', { class: 'action-row' }, [
      h(
        'button',
        {
          class: ['add-button', !selectedPlantAsset.value ? 'is-disabled' : ''],
          'aria-disabled': !selectedPlantAsset.value ? 'true' : 'false',
          onClick: addSelectedConveyorPlant
        },
        [h(PlusOutlined), t('addSelectedPlant')]
      ),
      conveyorActionHint.value ? h('small', { class: 'action-hint' }, t(conveyorActionHint.value)) : null
    ])
  ];
  if (!expertMode.value) return children;
  const enabledChildren = [
    h('small', { class: 'seed-mode-hint' }, t('conveyorSeedBankNotice')),
    draft.value.conveyor.originalObject
      ? h('div', { class: 'advanced-grid single' }, [
          h('label', { class: 'check-row advanced-check' }, [
            h('input', {
              type: 'checkbox',
              checked: draft.value.conveyor.preserveOriginal && !draft.value.conveyor.dirty,
              onChange: (event: Event) => {
                draft.value.conveyor.preserveOriginal = (event.target as HTMLInputElement).checked;
                draft.value.conveyor.dirty = !(event.target as HTMLInputElement).checked;
              }
            }),
            t('conveyorPreserveOriginal')
          ])
        ])
      : null,
    renderConveyorSummary(),
    renderConveyorAdvancedTabs(),
    renderConveyorAdvancedTabPanel()
  ];
  children.push(h('details', { class: 'advanced-details conveyor-details' }, [
    h('summary', t('advancedConveyor')),
    h('div', { class: 'conveyor-body' }, enabledChildren)
  ]));
  return children;
}

function renderSeedSupplyModeSelector() {
  return h('div', { class: 'segmented stacked supply-mode-selector' }, [
    h(
      'button',
      {
        class: !draft.value.conveyor.enabled ? 'active' : '',
        'aria-pressed': !draft.value.conveyor.enabled ? 'true' : 'false',
        onClick: () => setSeedSupplyMode('seedBank')
      },
      t('seedBank')
    ),
    h(
      'button',
      {
        class: draft.value.conveyor.enabled ? 'active' : '',
        'aria-pressed': draft.value.conveyor.enabled ? 'true' : 'false',
        onClick: () => setSeedSupplyMode('conveyor')
      },
      t('conveyor')
    )
  ]);
}

function renderSeedBankControls() {
  return [
    h('strong', `${t('seedBank')} ${draft.value.seedPlants.length}/${draft.value.seedSlots}`),
    h('div', { class: 'segmented stacked' }, [
      h(
        'button',
        {
          class: draft.value.seedMode === 'chooser' ? 'active' : '',
          'aria-pressed': draft.value.seedMode === 'chooser' ? 'true' : 'false',
          onClick: () => (draft.value.seedMode = 'chooser')
        },
        t('seedChooser')
      ),
      h(
        'button',
        {
          class: draft.value.seedMode === 'preset' ? 'active' : '',
          'aria-pressed': draft.value.seedMode === 'preset' ? 'true' : 'false',
          onClick: () => (draft.value.seedMode = 'preset')
        },
        t('seedPreset')
      )
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
        [h(PlusOutlined), t('addSelectedPlant')]
      ),
      seedActionHint.value ? h('small', { class: 'action-hint' }, t(seedActionHint.value)) : null
    ]),
    expertMode.value
      ? h('details', { class: 'advanced-details' }, [
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
              h('button', { class: 'add-button small', onClick: () => addSelectedPlantToList('includePlants') }, [
                h(PlusOutlined),
                t('addSelectedPlant')
              ])
            ]),
            h('div', { class: 'plant-list-block' }, [
              h('strong', t('excludePlants')),
              renderPlantPills('excludePlants'),
              h('button', { class: 'add-button small', onClick: () => addSelectedPlantToList('excludePlants') }, [
                h(PlusOutlined),
                t('addSelectedPlant')
              ])
            ])
          ])
        ])
      : null
  ];
}

function renderConveyorEditorGroup(titleKey: string, children: Array<ReturnType<typeof h> | null>) {
  return h('section', { class: 'conveyor-editor-group' }, [
    h('h3', t(titleKey)),
    h('div', { class: 'conveyor-editor-grid' }, children.filter(Boolean))
  ]);
}

function renderConveyorPlantSelectField(entry: ConveyorPlantEntry | ConveyorWaveModification) {
  return h('div', { class: 'field-row compact' }, [
    h('label', t('plants')),
    renderPlantSelect(entry.PlantType, (code) => {
      markConveyorEdited();
      entry.PlantType = code;
    })
  ]);
}

function renderConveyorForceBoostedField(entry: ConveyorPlantEntry | ConveyorWaveModification) {
  return h('label', { class: 'check-row advanced-check' }, [
    h('input', {
      type: 'checkbox',
      checked: entry.ForceBoosted === true,
      onChange: (event: Event) => {
        markConveyorEdited();
        if ((event.target as HTMLInputElement).checked) entry.ForceBoosted = true;
        else delete entry.ForceBoosted;
      }
    }),
    t('conveyorForceBoosted')
  ]);
}

function renderConveyorPlantEditorGroups(entry: ConveyorPlantEntry | ConveyorWaveModification) {
  return [
    renderConveyorEditorGroup('conveyorBaseParams', [
      renderConveyorPlantSelectField(entry),
      renderConveyorNumberField('conveyorWeight', entry.Weight, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'Weight', value, 0);
      }),
      renderConveyorForceBoostedField(entry)
    ]),
    renderConveyorEditorGroup('conveyorCountLimits', [
      renderConveyorNumberField('conveyorMinCount', entry.MinCount, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MinCount', value, -1);
      }, -1),
      renderConveyorNumberField('conveyorMaxCount', entry.MaxCount, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MaxCount', value, 0);
      }),
      renderConveyorNumberField('conveyorMaxDelivered', entry.MaxDelivered, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MaxDelivered', value, 0);
      })
    ]),
    renderConveyorEditorGroup('conveyorWeightFactors', [
      renderConveyorNumberField('conveyorMinWeightFactor', entry.MinWeightFactor, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MinWeightFactor', value, 0);
      }),
      renderConveyorNumberField('conveyorMaxWeightFactor', entry.MaxWeightFactor, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MaxWeightFactor', value, 0);
      })
    ]),
    renderConveyorEditorGroup('conveyorCooldowns', [
      renderConveyorNumberField('conveyorCooldownSeconds', entry.CooldownSeconds, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'CooldownSeconds', value, 0);
      }),
      renderConveyorNumberField('conveyorMinCountCooldownSeconds', entry.MinCountCooldownSeconds, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MinCountCooldownSeconds', value, 0);
      }),
      renderConveyorNumberField('conveyorMaxCountCooldownSeconds', entry.MaxCountCooldownSeconds, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MaxCountCooldownSeconds', value, 0);
      })
    ])
  ];
}

function renderConveyorConditionEditor(target: Extract<ConveyorEditorTarget, { kind: 'dropCondition' | 'speedCondition' }>, entry: ConveyorDropDelayCondition | ConveyorSpeedCondition) {
  const valueKey = target.kind === 'dropCondition' ? 'Delay' : 'Speed';
  return [
    renderConveyorEditorGroup(target.kind === 'dropCondition' ? 'conveyorRuleDrop' : 'conveyorRuleSpeed', [
      renderConveyorNumberField('conveyorMaxPackets', entry.MaxPackets, (value) => {
        markConveyorEdited();
        setRequiredNumber(entry, 'MaxPackets', value, 0, 0);
      }),
      renderConveyorNumberField(target.kind === 'dropCondition' ? 'conveyorDelay' : 'conveyorSpeed', entry[valueKey], (value) => {
        markConveyorEdited();
        setRequiredNumber(entry, valueKey, value, target.kind === 'dropCondition' ? 3 : 100, 0);
      })
    ])
  ];
}

function renderConveyorWaveEditor(entry: ConveyorWaveModification) {
  const baseFields = [
    h('div', { class: 'field-row compact' }, [
      h('label', t('conveyorAction')),
      h(
        'select',
        {
          value: entry.mode,
          onChange: (event: Event) => setConveyorWaveMode(entry, (event.target as HTMLSelectElement).value as ConveyorWaveMode)
        },
        [h('option', { value: 'Add' }, t('conveyorAddPlant')), h('option', { value: 'Remove' }, t('conveyorRemovePlant'))]
      )
    ]),
    h('div', { class: 'field-row compact' }, [
      h('label', t('conveyorWave')),
      h(
        'select',
        {
          value: entry.waveIndex,
          onChange: (event: Event) => {
            markConveyorEdited();
            entry.waveIndex = Math.max(1, Number((event.target as HTMLSelectElement).value) || 1);
          }
        },
        draft.value.waves.map((wave, waveIndex) => h('option', { value: waveIndex + 1 }, `#${waveIndex + 1}`))
      )
    ]),
    renderConveyorPlantSelectField(entry)
  ];

  if (entry.mode === 'Remove') {
    return [
      renderConveyorEditorGroup('conveyorBaseParams', baseFields),
      h('p', { class: 'conveyor-editor-note' }, t('conveyorRemoveModeHint'))
    ];
  }

  return [
    renderConveyorEditorGroup('conveyorBaseParams', [
      ...baseFields,
      renderConveyorNumberField('conveyorWeight', entry.Weight, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'Weight', value, 0);
      }),
      renderConveyorForceBoostedField(entry)
    ]),
    renderConveyorEditorGroup('conveyorCountLimits', [
      renderConveyorNumberField('conveyorMinCount', entry.MinCount, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MinCount', value, -1);
      }, -1),
      renderConveyorNumberField('conveyorMaxCount', entry.MaxCount, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MaxCount', value, 0);
      }),
      renderConveyorNumberField('conveyorMaxDelivered', entry.MaxDelivered, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MaxDelivered', value, 0);
      })
    ]),
    renderConveyorEditorGroup('conveyorWeightFactors', [
      renderConveyorNumberField('conveyorMinWeightFactor', entry.MinWeightFactor, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MinWeightFactor', value, 0);
      }),
      renderConveyorNumberField('conveyorMaxWeightFactor', entry.MaxWeightFactor, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MaxWeightFactor', value, 0);
      })
    ]),
    renderConveyorEditorGroup('conveyorCooldowns', [
      renderConveyorNumberField('conveyorCooldownSeconds', entry.CooldownSeconds, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'CooldownSeconds', value, 0);
      }),
      renderConveyorNumberField('conveyorMinCountCooldownSeconds', entry.MinCountCooldownSeconds, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MinCountCooldownSeconds', value, 0);
      }),
      renderConveyorNumberField('conveyorMaxCountCooldownSeconds', entry.MaxCountCooldownSeconds, (value) => {
        markConveyorEdited();
        setOptionalNumber(entry, 'MaxCountCooldownSeconds', value, 0);
      })
    ])
  ];
}

const ConveyorEditorPanel = defineComponent({
  name: 'ConveyorEditorPanel',
  setup() {
    return () => {
      const target = conveyorEditorTarget.value;
      const entry = getConveyorEditorEntry();
      if (!target || !entry) return h('div', { class: 'conveyor-editor-empty' }, t('emptyList'));

      let body: Array<ReturnType<typeof h> | null> = [];
      if (target.kind === 'initialPlant') body = renderConveyorPlantEditorGroups(entry as ConveyorPlantEntry);
      else if (target.kind === 'waveModification') body = renderConveyorWaveEditor(entry as ConveyorWaveModification);
      else body = renderConveyorConditionEditor(target, entry as ConveyorDropDelayCondition | ConveyorSpeedCondition);

      return h('div', { class: 'conveyor-editor-panel' }, body);
    };
  }
});

function renderUnsupportedObjectsSummary() {
  if (!expertMode.value || !draft.value.unsupportedRawObjects.length) return null;

  return h('details', { class: 'unsupported-summary' }, [
    h('summary', `${t('unsupported')}: ${draft.value.unsupportedObjects}`),
    h(
      'div',
      { class: 'unsupported-object-list' },
      draft.value.unsupportedRawObjects.map((object: any, index) => {
        const aliases = Array.isArray(object?.aliases) ? object.aliases.join(', ') : '';
        return h('div', { class: 'unsupported-object-card' }, [
          h('strong', object?.objclass || t('unknownObjclass')),
          h('small', aliases ? `${t('unsupportedAlias')}: ${aliases}` : t('unsupportedNoAlias')),
          h('code', `#${index + 1}`)
        ]);
      })
    )
  ]);
}

const PropertyPanel = defineComponent({
  setup() {
    return () =>
      h('aside', { class: 'property-panel-inner' }, [
        h('div', { class: 'panel-title' }, t('propertyPanel')),
        h('div', { class: 'property-section' }, [
          h('strong', t('seedSupply')),
          renderSeedSupplyModeSelector(),
          ...(draft.value.conveyor.enabled ? renderConveyorControls() : renderSeedBankControls())
        ])
      ]);
  }
});

function getRawWaveActionLabel(action: WaveActionDraft) {
  const labels: Record<string, string> = {
    TidalChangeWaveActionProps: 'actionTide',
    DinoWaveActionProps: 'actionDino',
    StormZombieSpawnerProps: 'actionStorm',
    SpawnZombiesFromGroundSpawnerProps: 'actionGround'
  };
  return labels[action.objclass] ? t(labels[action.objclass]) : action.objclass;
}

function getRawWaveActionSummary(action: WaveActionDraft) {
  const data = parseActionObjdata(action);
  if (action.objclass === 'TidalChangeWaveActionProps') {
    return t('actionTideSummary', { column: data?.TidalChange?.ChangeAmount ?? '-' });
  }
  if (action.objclass === 'DinoWaveActionProps') {
    return t('actionDinoSummary', { type: data.DinoType || '-', row: Number(data.DinoRow || 0) + 1 });
  }
  if (action.objclass === 'StormZombieSpawnerProps') {
    return t('actionStormSummary', {
      type: data.Type || '-',
      start: data.ColumnStart ?? '-',
      end: data.ColumnEnd ?? '-',
      count: Array.isArray(data.Zombies) ? data.Zombies.length : 0
    });
  }
  if (action.objclass === 'SpawnZombiesFromGroundSpawnerProps') {
    return t('actionGroundSummary', {
      start: data.ColumnStart ?? '-',
      end: data.ColumnEnd ?? '-',
      count: Array.isArray(data.Zombies) ? data.Zombies.length : 0
    });
  }
  return action.alias || t('actionUnknown');
}

function renderActionNumberField(
  labelKey: string,
  value: unknown,
  onInput: (value: number) => void,
  min = 0,
  max?: number
) {
  return h('div', { class: 'field-row compact' }, [
    h('label', t(labelKey)),
    h('input', {
      type: 'number',
      min,
      ...(max === undefined ? {} : { max }),
      value: value ?? '',
      onInput: (event: Event) => {
        const number = Number((event.target as HTMLInputElement).value);
        onInput(Number.isFinite(number) ? number : min);
      }
    })
  ]);
}

function renderKnownWaveActionFields(action: WaveActionDraft) {
  const data = action.objdata || {};
  if (action.objclass === 'TidalChangeWaveActionProps') {
    return h('div', { class: 'wave-action-field-grid' }, [
      renderActionNumberField('tideColumn', data?.TidalChange?.ChangeAmount, (value) => {
        updateWaveActionData(action, (objdata) => {
          objdata.TidalChange = { ...(objdata.TidalChange || {}), ChangeAmount: value, ChangeType: 'absolute' };
        });
      }, 0, 9)
    ]);
  }
  if (action.objclass === 'DinoWaveActionProps') {
    return h('div', { class: 'wave-action-field-grid' }, [
      h('div', { class: 'field-row compact' }, [
        h('label', t('dinoType')),
        h(
          'select',
          {
            value: data.DinoType || 'raptor',
            onChange: (event: Event) => {
              updateWaveActionData(action, (objdata) => {
                objdata.DinoType = (event.target as HTMLSelectElement).value;
              });
            }
          },
          ['raptor', 'tyranno', 'ankylo', 'ptero', 'stego'].map((value) => h('option', { value }, value))
        )
      ]),
      h('div', { class: 'field-row compact' }, [
        h('label', t('rowAssignment')),
        h(
          'select',
          {
            value: String(Number(data.DinoRow || 0)),
            onChange: (event: Event) => {
              updateWaveActionData(action, (objdata) => {
                objdata.DinoRow = Number((event.target as HTMLSelectElement).value);
              });
            }
          },
          Array.from({ length: 5 }, (_, index) => h('option', { value: String(index) }, t('rowNumber', { row: index + 1 })))
        )
      ]),
      renderActionNumberField('duration', data.DinoWaveDuration, (value) => {
        updateWaveActionData(action, (objdata) => {
          objdata.DinoWaveDuration = value;
        });
      })
    ]);
  }
  if (action.objclass === 'StormZombieSpawnerProps') {
    return h('div', { class: 'wave-action-field-grid' }, [
      h('div', { class: 'field-row compact' }, [
        h('label', t('eventType')),
        h(
          'select',
          {
            value: data.Type || 'sandstorm',
            onChange: (event: Event) => {
              updateWaveActionData(action, (objdata) => {
                objdata.Type = (event.target as HTMLSelectElement).value;
              });
            }
          },
          [h('option', { value: 'sandstorm' }, 'sandstorm'), h('option', { value: 'snowstorm' }, 'snowstorm')]
        )
      ]),
      renderActionNumberField('columnStart', data.ColumnStart, (value) => {
        updateWaveActionData(action, (objdata) => {
          objdata.ColumnStart = value;
        });
      }, 0, 9),
      renderActionNumberField('columnEnd', data.ColumnEnd, (value) => {
        updateWaveActionData(action, (objdata) => {
          objdata.ColumnEnd = value;
        });
      }, 0, 9),
      renderActionNumberField('groupSize', data.GroupSize, (value) => {
        updateWaveActionData(action, (objdata) => {
          objdata.GroupSize = Math.max(1, value);
        });
      }, 1),
      renderActionNumberField('timeBetweenGroups', data.TimeBetweenGroups, (value) => {
        updateWaveActionData(action, (objdata) => {
          objdata.TimeBetweenGroups = value;
        });
      }),
      renderActionNumberField('eventWaves', data.Waves, (value) => {
        updateWaveActionData(action, (objdata) => {
          objdata.Waves = Math.max(1, value);
        });
      }, 1)
    ]);
  }
  if (action.objclass === 'SpawnZombiesFromGroundSpawnerProps') {
    return h('div', { class: 'wave-action-field-grid' }, [
      renderActionNumberField('columnStart', data.ColumnStart, (value) => {
        updateWaveActionData(action, (objdata) => {
          objdata.ColumnStart = value;
        });
      }, 0, 9),
      renderActionNumberField('columnEnd', data.ColumnEnd, (value) => {
        updateWaveActionData(action, (objdata) => {
          objdata.ColumnEnd = value;
        });
      }, 0, 9)
    ]);
  }
  return null;
}

function renderLanePreview(wave: WaveDraft) {
  const rows = [1, 2, 3, 4, 5].map((row) => ({
    row: String(row),
    zombies: wave.zombies.filter((zombie) => zombie.row === String(row))
  }));
  const random = wave.zombies.filter((zombie) => zombie.row === '');
  const special = wave.zombies.filter((zombie) => zombie.row !== '' && !['1', '2', '3', '4', '5'].includes(zombie.row));
  return h('div', { class: 'lane-preview', 'aria-label': t('lanePreview') }, [
    ...rows.map((lane) =>
      h('div', { class: 'lane-preview-row' }, [
        h('span', { class: 'lane-number' }, lane.row),
        h(
          'div',
          { class: 'lane-zombies' },
          lane.zombies.length
            ? lane.zombies.map((zombie) =>
                h('span', { class: 'lane-zombie-chip', title: getZombieDisplayName(zombie.code, zombie.label) }, [
                  h('span', { class: 'lane-zombie-dot', 'aria-hidden': 'true' }),
                  getZombieDisplayName(zombie.code, zombie.label),
                  h('strong', `×${zombie.count}`)
                ])
              )
            : h('span', { class: 'lane-empty' }, '—')
        )
      ])
    ),
    random.length
      ? h('div', { class: 'lane-preview-row random' }, [
          h('span', { class: 'lane-number' }, t('randomRowShort')),
          h(
            'div',
            { class: 'lane-zombies' },
            random.map((zombie) =>
              h('span', { class: 'lane-zombie-chip', title: getZombieDisplayName(zombie.code, zombie.label) }, [
                h('span', { class: 'lane-zombie-dot', 'aria-hidden': 'true' }),
                getZombieDisplayName(zombie.code, zombie.label),
                h('strong', `×${zombie.count}`)
              ])
            )
          )
        ])
      : null,
    special.length
      ? h('div', { class: 'lane-preview-row random' }, [
          h('span', { class: 'lane-number' }, t('specialRowShort')),
          h(
            'div',
            { class: 'lane-zombies' },
            special.map((zombie) =>
              h('span', { class: 'lane-zombie-chip', title: `${getZombieDisplayName(zombie.code, zombie.label)} · ${zombie.row}` }, [
                h('span', { class: 'lane-zombie-dot', 'aria-hidden': 'true' }),
                getZombieDisplayName(zombie.code, zombie.label),
                h('strong', `×${zombie.count} · ${zombie.row}`)
              ])
            )
          )
        ])
      : null
  ]);
}

function renderWaveSpawnAdvancedFields(wave: WaveDraft) {
  if (!expertMode.value) return null;
  return h('details', { class: 'advanced-details wave-spawn-advanced' }, [
    h('summary', t('advancedCurrentWave')),
    h('div', { class: 'advanced-grid' }, [
      renderActionNumberField('additionalPlantfood', wave.additionalPlantfood, (value) => {
        markWaveSystemEdited();
        wave.additionalPlantfood = Math.max(0, value);
      }),
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
    ])
  ]);
}

function renderZombieSpawnEditor(wave: WaveDraft) {
  return h('div', { class: 'wave-action-editor-body' }, [
    wave.zombies.length ? renderLanePreview(wave) : null,
    h(
      'div',
      { class: 'zombie-list' },
      wave.zombies.length
        ? wave.zombies.map((zombie) => {
            const standardRows = ['', '1', '2', '3', '4', '5'];
            const rowOptions = standardRows.includes(zombie.row) ? standardRows : [...standardRows, zombie.row];
            return h('div', { class: 'zombie-row' }, [
              h('span', { class: 'zombie-identity' }, [
                h('strong', getZombieDisplayName(zombie.code, zombie.label)),
                h('small', zombie.code)
              ]),
              h('div', { class: 'zombie-row-controls' }, [
                h(
                  'select',
                  {
                    'aria-label': t('zombieRow', { name: getZombieDisplayName(zombie.code, zombie.label) }),
                    value: zombie.row,
                    onChange: (event: Event) => setWaveZombieRow(zombie, (event.target as HTMLSelectElement).value)
                  },
                  rowOptions.map((row) =>
                    h(
                      'option',
                      { value: row },
                      row === '' ? t('randomRow') : ['1', '2', '3', '4', '5'].includes(row) ? t('rowNumber', { row }) : row
                    )
                  )
                ),
                h('input', {
                  type: 'number',
                  min: 1,
                  'aria-label': t('zombieCount', { name: getZombieDisplayName(zombie.code, zombie.label) }),
                  value: zombie.count,
                  onInput: (event: Event) => {
                    markWaveSystemEdited();
                    zombie.count = Math.max(1, Number((event.target as HTMLInputElement).value) || 1);
                  }
                }),
                h(
                  'button',
                  {
                    title: t('removeZombie', { name: getZombieDisplayName(zombie.code, zombie.label) }),
                    'aria-label': t('removeZombie', { name: getZombieDisplayName(zombie.code, zombie.label) }),
                    onClick: () => removeZombieFromWave(zombie.id)
                  },
                  h(DeleteOutlined)
                )
              ])
            ]);
          })
        : h('small', { class: 'seed-mode-hint' }, t('emptyList'))
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
      zombieActionHint.value ? h('small', { class: 'action-hint' }, t(zombieActionHint.value)) : null
    ]),
    renderWaveSpawnAdvancedFields(wave)
  ]);
}

function renderConveyorWaveActionEditor(waveIndex: number, entry: WaveActionOrderEntry) {
  const modifications = draft.value.conveyor.waveModifications
    .map((modification, index) => ({ modification, index }))
    .filter(
      ({ modification }) =>
        modification.waveIndex === waveIndex && (!entry.alias || !modification.alias || modification.alias === entry.alias)
    );
  return h('div', { class: 'wave-action-editor-body conveyor-wave-action-editor' }, [
    modifications.length
      ? h(
          'div',
          { class: 'conveyor-wave-action-list' },
          modifications.map(({ modification, index }) =>
            h('div', { class: 'conveyor-wave-action-row' }, [
              h('span', [
                h('strong', getPlantDisplayName(modification.PlantType)),
                h('small', modification.mode === 'Add' ? t('conveyorAddPlant') : t('conveyorRemovePlant'))
              ]),
              h('div', { class: 'conveyor-row-actions' }, [
                h(
                  'button',
                  {
                    class: 'icon-button',
                    title: t('edit'),
                    'aria-label': t('conveyorEditWaveAria', {
                      wave: modification.waveIndex,
                      plant: getPlantDisplayName(modification.PlantType)
                    }),
                    onClick: (event: MouseEvent) => openConveyorEditor({ kind: 'waveModification', index }, event)
                  },
                  h(EditOutlined)
                ),
                h(
                  'button',
                  {
                    class: 'icon-button danger',
                    title: t('remove'),
                    'aria-label': t('remove'),
                    onClick: () => removeConveyorWaveModification(index)
                  },
                  h(DeleteOutlined)
                )
              ])
            ])
          )
        )
      : h('small', { class: 'seed-mode-hint' }, t('emptyList'))
  ]);
}

function getWaveActionEntryLabel(wave: WaveDraft, entry: WaveActionOrderEntry) {
  if (entry.kind === 'zombies') return t('waveSpawnAction');
  if (entry.kind === 'conveyor') return t('conveyorWaveAction');
  const action = wave.rawActions.find((item) => item.id === entry.actionId);
  return action ? getRawWaveActionLabel(action) : t('actionUnknown');
}

function getWaveActionEntrySummary(wave: WaveDraft, waveIndex: number, entry: WaveActionOrderEntry) {
  if (entry.kind === 'zombies') {
    const count = wave.zombies.reduce((sum, zombie) => sum + zombie.count, 0);
    const lanes = new Set(wave.zombies.map((zombie) => zombie.row).filter((row) => ['1', '2', '3', '4', '5'].includes(row))).size;
    return t('waveSpawnSummary', { count, lanes });
  }
  if (entry.kind === 'conveyor') {
    const count = draft.value.conveyor.waveModifications.filter(
      (modification) => modification.waveIndex === waveIndex && (!entry.alias || !modification.alias || modification.alias === entry.alias)
    ).length;
    return t('conveyorWaveSummary', { count });
  }
  const action = wave.rawActions.find((item) => item.id === entry.actionId);
  return action ? getRawWaveActionSummary(action) : '';
}

function renderRawWaveActionEditor(wave: WaveDraft, action: WaveActionDraft) {
  const knownFields = renderKnownWaveActionFields(action);
  return h('div', { class: 'wave-action-editor-body' }, [
    knownFields,
    expertMode.value
      ? h('label', { class: 'raw-json-field' }, [
          h('span', t('rawJson')),
          h('textarea', {
            value: action.jsonText,
            spellcheck: 'false',
            onInput: (event: Event) => updateWaveActionJson(action, (event.target as HTMLTextAreaElement).value)
          })
        ])
      : null,
    h('div', { class: 'wave-action-editor-footer' }, [
      h('code', action.alias),
      h('button', { class: 'text-button danger', onClick: () => removeWaveAction(wave, action.id) }, [
        h(DeleteOutlined),
        t('remove')
      ])
    ])
  ]);
}

function renderWaveActionEditor(wave: WaveDraft, waveIndex: number, entry: WaveActionOrderEntry) {
  if (entry.kind === 'zombies') return renderZombieSpawnEditor(wave);
  if (entry.kind === 'conveyor') return renderConveyorWaveActionEditor(waveIndex, entry);
  const action = wave.rawActions.find((item) => item.id === entry.actionId);
  return action ? renderRawWaveActionEditor(wave, action) : null;
}

function renderWaveActionSequence(wave: WaveDraft, waveIndex: number) {
  const order = getEffectiveWaveActionOrder(wave, waveIndex);
  return h(
    'div',
    { class: 'wave-action-sequence' },
    order.map((entry, entryIndex) => {
      const key = getWaveActionKey(entry);
      const expanded = expandedWaveActionKey.value === key;
      return h('div', { class: ['wave-action-entry', expanded ? 'expanded' : ''] }, [
        h('div', { class: 'wave-action-entry-header' }, [
          h('button', { class: 'wave-action-entry-main', 'aria-expanded': expanded, onClick: () => toggleWaveAction(entry) }, [
            h('span', { class: ['wave-action-index', entry.kind] }, String(entryIndex + 1)),
            h('span', { class: 'wave-action-entry-copy' }, [
              h('strong', getWaveActionEntryLabel(wave, entry)),
              h('small', getWaveActionEntrySummary(wave, waveIndex, entry))
            ]),
            h('span', { class: 'wave-action-chevron', 'aria-hidden': 'true' }, '›')
          ]),
          h('div', { class: 'wave-action-order-controls' }, [
            h(
              'button',
              {
                type: 'button',
                disabled: entryIndex === 0,
                title: t('moveEarlier'),
                'aria-label': t('moveEarlier'),
                onClick: () => moveWaveAction(wave, entryIndex, -1)
              },
              '↑'
            ),
            h(
              'button',
              {
                type: 'button',
                disabled: entryIndex === order.length - 1,
                title: t('moveLater'),
                'aria-label': t('moveLater'),
                onClick: () => moveWaveAction(wave, entryIndex, 1)
              },
              '↓'
            )
          ])
        ]),
        expanded ? renderWaveActionEditor(wave, waveIndex, entry) : null
      ]);
    })
  );
}

function renderWaveAddMenu() {
  return h('details', { class: 'wave-add-menu' }, [
    h('summary', [h(PlusOutlined), t('addSpecialAction')]),
    h('div', { class: 'wave-add-menu-grid' }, [
      h('button', { class: 'add-button small', onClick: addSelectedZombieToWave }, t('addZombie')),
      h('button', { class: 'add-button small', onClick: () => addWaveAction('tide') }, t('addTideAction')),
      h('button', { class: 'add-button small', onClick: () => addWaveAction('dino') }, t('addDinoAction')),
      h('button', { class: 'add-button small', onClick: () => addWaveAction('storm') }, t('addStormAction')),
      h('button', { class: 'add-button small', onClick: () => addWaveAction('ground') }, t('addGroundSpawnAction'))
    ])
  ]);
}

const WaveTimeline = defineComponent({
  setup() {
    return () =>
      h('section', { class: 'wave-panel' }, [
        h('div', { class: 'panel-title row-title' }, [
          h('span', t('waves')),
          h('div', { class: 'wave-header-actions' }, [
            h('label', { class: 'flag-interval-control' }, [
              h('span', t('flagWaveInterval')),
              h('input', {
                type: 'number',
                min: 1,
                value: draft.value.flagWaveInterval,
                onInput: (event: Event) => setFlagWaveInterval((event.target as HTMLInputElement).value)
              })
            ]),
            h('button', { class: 'add-button small', onClick: addWave }, [h(PlusOutlined), t('addWave')])
          ])
        ]),
        h(
          'div',
          { class: 'wave-strip' },
          draft.value.waves.map((wave, index) => {
            const zombieCount = wave.zombies.reduce((sum, zombie) => sum + zombie.count, 0);
            const actionCount = getEffectiveWaveActionOrder(wave, index + 1).filter((entry) => entry.kind !== 'zombies').length;
            return h(
              'button',
              {
                class: ['wave-card', selectedWaveId.value === wave.id ? 'active' : '', wave.flag ? 'flag' : ''],
                'aria-pressed': selectedWaveId.value === wave.id,
                onClick: () => selectWave(wave.id)
              },
              [
                h('strong', `#${index + 1}`),
                h('span', actionCount ? `${zombieCount} Z + ${actionCount} A` : `${zombieCount} Z`),
                wave.flag ? h('span', { class: 'wave-flag-badge' }, t('flagWave')) : null
              ]
            );
          })
        ),
        expertMode.value
          ? h('details', { class: 'advanced-details' }, [
              h('summary', t('advancedWaveSettings')),
              h('div', { class: 'advanced-grid' }, [
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
            ])
          : null,
        selectedWave.value
          ? (() => {
              const wave = selectedWave.value;
              const waveIndex = draft.value.waves.findIndex((item) => item.id === wave.id);
              return h('div', { class: 'wave-detail' }, [
                h('div', { class: 'selected-wave-toolbar' }, [
                  h('strong', t('selectedWaveNumber', { wave: waveIndex + 1 })),
                  h('div', { class: 'selected-wave-actions' }, [
                    h(
                      'button',
                      {
                        type: 'button',
                        disabled: waveIndex === 0,
                        title: t('moveWaveEarlier'),
                        onClick: () => moveWave(wave.id, -1)
                      },
                      ['←', t('moveEarlier')]
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        disabled: waveIndex === draft.value.waves.length - 1,
                        title: t('moveWaveLater'),
                        onClick: () => moveWave(wave.id, 1)
                      },
                      [t('moveLater'), '→']
                    ),
                    h('button', { type: 'button', title: t('duplicateWave'), onClick: () => duplicateWave(wave.id) }, [
                      h(CopyOutlined),
                      t('duplicate')
                    ]),
                    h('button', { type: 'button', title: t('insertWaveAfter'), onClick: () => insertWaveAfter(wave.id) }, [
                      h(PlusOutlined),
                      t('insert')
                    ]),
                    draft.value.waves.length > 1
                      ? h('button', { type: 'button', class: 'danger', onClick: () => removeWave(wave.id) }, [
                          h(DeleteOutlined),
                          t('remove')
                        ])
                      : null
                  ])
                ]),
                renderWaveActionSequence(wave, waveIndex + 1),
                renderWaveAddMenu()
              ]);
            })()
          : null
      ]);
  }
});

const ValidationPanel = defineComponent({
  props: { compact: Boolean },
  setup(props) {
    return () =>
      h('section', { class: ['validation-panel', props.compact ? 'compact' : ''], 'aria-live': 'polite' }, [
        h('div', { class: 'panel-title' }, t('validation')),
        validationItems.value.length
          ? h(
              'div',
              { class: 'issue-list' },
              validationItems.value.map((item) => h('div', { class: ['issue', item.type] }, item.text))
            )
          : h('div', { class: 'issue ok' }, t('noIssues')),
        renderUnsupportedObjectsSummary()
      ]);
  }
});
</script>

<style>
html:has(.level-editor-shell),
body:has(.level-editor-shell) {
  overflow-x: hidden;
}

.level-editor-shell,
.level-editor-shell *,
.level-editor-shell *::before,
.level-editor-shell *::after {
  box-sizing: border-box;
}

.level-editor-shell {
  --editor-bg: color-mix(in srgb, var(--vp-c-bg) 95%, #5f9f3f 5%);
  --editor-panel: color-mix(in srgb, var(--vp-c-bg) 92%, var(--vp-c-bg-soft) 8%);
  --editor-panel-raised: color-mix(in srgb, var(--vp-c-bg) 96%, #fff 4%);
  --editor-border: color-mix(in srgb, var(--vp-c-text) 14%, transparent);
  --editor-text: var(--vp-c-text);
  --editor-muted: var(--vp-c-text-mute);
  --editor-accent: #5f9f3f;
  --editor-accent-strong: #3f7f2f;
  --editor-sun: #f4c84a;
  --editor-soil: #8b6442;
  --editor-shell-width: min(1440px, calc(100vw - 3rem));
  width: var(--editor-shell-width);
  max-width: none;
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-left: calc((100% - var(--editor-shell-width)) / 2);
  color: var(--editor-text);
  font-size: 0.95rem;
  line-height: 1.45;
  overflow-x: clip;
  overflow-anchor: none;
}

.dark .level-editor-shell {
  --editor-bg: color-mix(in srgb, var(--vp-c-bg) 88%, #5f9f3f 8%);
  --editor-panel: color-mix(in srgb, var(--vp-c-bg) 86%, var(--vp-c-bg-soft) 14%);
  --editor-panel-raised: color-mix(in srgb, var(--vp-c-bg) 91%, #fff 3%);
  --editor-border: color-mix(in srgb, var(--vp-c-text) 20%, transparent);
}

.editor-topbar {
  position: sticky;
  top: calc(var(--navbar-height, 3.75rem) + 0.5rem);
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(19rem, auto);
  gap: 0.85rem 1.2rem;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  padding: 1.05rem 1.15rem;
  border: 1px solid var(--editor-border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--editor-panel-raised) 92%, transparent);
  box-shadow: 0 12px 34px color-mix(in srgb, #172912 10%, transparent);
  backdrop-filter: blur(18px) saturate(1.15);
}

.title-row {
  display: flex;
  gap: 0.65rem;
  align-items: center;
  min-width: 0;
}

.title-sun {
  flex: 0 0 auto;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--editor-sun);
  box-shadow: 0 0 0 0.28rem color-mix(in srgb, var(--editor-sun) 22%, transparent);
}

.editor-title {
  margin: 0 0 0.25rem !important;
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif !important;
  line-height: 1.2 !important;
}

.title-block {
  min-width: 0;
  max-width: 34rem;
}

.workspace-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.65rem;
}

.workspace-meta span {
  display: inline-flex;
  align-items: center;
  min-height: 1.55rem;
  padding: 0.1rem 0.48rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-accent) 9%, transparent);
  color: var(--editor-muted);
  font-size: 0.74rem;
  font-weight: 700;
}

.top-actions {
  display: grid;
  gap: 0.55rem;
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

.validation-summary-control {
  display: inline-flex;
  gap: 0.42rem;
  align-items: center;
  min-height: 2.35rem;
  padding: 0.28rem 0.62rem;
  border: 1px solid var(--editor-border);
  border-radius: 10px;
  background: var(--vp-c-bg);
  color: var(--editor-text);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.validation-status-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--editor-accent);
}

.validation-summary-control.warning .validation-status-dot {
  background: #d7a100;
}

.validation-summary-control.error .validation-status-dot {
  background: #d94f4f;
}

.top-actions .ant-upload {
  display: inline-flex;
  max-width: 100%;
}

.expert-mode-toggle {
  position: relative;
  display: inline-grid;
  grid-template-columns: auto minmax(0, auto);
  gap: 0.45rem;
  align-items: center;
  min-width: 0;
  max-width: 11rem;
  min-height: 2.35rem;
  padding: 0.28rem 0.6rem 0.28rem 0.42rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--editor-text);
  cursor: pointer;
  user-select: none;
}

.expert-mode-toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.expert-mode-switch {
  position: relative;
  width: 2.1rem;
  height: 1.18rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-muted) 32%, transparent);
  transition:
    background-color 160ms ease,
    box-shadow 160ms ease;
}

.expert-mode-switch::after {
  content: "";
  position: absolute;
  top: 0.16rem;
  left: 0.18rem;
  width: 0.86rem;
  height: 0.86rem;
  border-radius: 50%;
  background: var(--vp-c-bg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.24);
  transition: transform 160ms ease;
}

.expert-mode-toggle input:checked + .expert-mode-switch {
  background: var(--editor-accent);
}

.expert-mode-toggle input:checked + .expert-mode-switch::after {
  transform: translateX(0.9rem);
}

.expert-mode-toggle input:focus-visible + .expert-mode-switch {
  outline: 2px solid color-mix(in srgb, var(--editor-accent) 70%, #fff);
  outline-offset: 2px;
}

.expert-mode-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.1;
}

.level-editor-shell button:focus-visible,
.level-editor-shell input:focus-visible,
.level-editor-shell select:focus-visible,
.level-editor-shell textarea:focus-visible,
.level-editor-shell summary:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--editor-accent) 70%, #fff);
  outline-offset: 2px;
}

.mobile-layout {
  display: none;
}

.desktop-layout {
  display: grid;
  grid-template-columns: minmax(240px, 0.72fr) minmax(520px, 1.7fr) minmax(270px, 0.82fr);
  gap: 0.9rem;
  margin-top: 0.9rem;
}

.panel,
.board-panel,
.desktop-bottom {
  min-width: 0;
  border: 1px solid var(--editor-border);
  border-radius: 14px;
  background: var(--editor-panel);
}

.board-panel {
  padding: 1rem;
  min-width: 0;
  overflow: hidden;
}

.panel,
.board-panel,
.desktop-bottom {
  box-shadow: 0 8px 24px color-mix(in srgb, #172912 7%, transparent);
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
  font: inherit;
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
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
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

.plant-list-block {
  display: grid;
  gap: 0.4rem;
  min-width: 0;
}

.conveyor-details {
  margin-top: 0;
}

.supply-mode-selector {
  margin-bottom: 0.05rem;
}

.conveyor-body {
  display: grid;
  gap: 0.65rem;
  min-width: 0;
  padding: 0 0.65rem 0.65rem;
}

.conveyor-subsection,
.conveyor-list {
  display: grid;
  gap: 0.55rem;
  min-width: 0;
}

.conveyor-subtitle {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.conveyor-subtitle strong {
  min-width: 0;
  font-size: 0.86rem;
}

.conveyor-action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  min-width: 0;
}

.conveyor-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.4rem;
  min-width: 0;
}

.conveyor-summary-card {
  display: grid;
  gap: 0.08rem;
  min-width: 0;
  padding: 0.45rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.conveyor-summary-card strong {
  font-size: 1rem;
  line-height: 1;
}

.conveyor-summary-card span {
  overflow: hidden;
  color: var(--editor-muted);
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conveyor-tabs {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.conveyor-tab-panel {
  display: grid;
  gap: 0.65rem;
  min-width: 0;
}

.conveyor-compact-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.45rem;
  align-items: start;
  min-width: 0;
  padding: 0.55rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.conveyor-row-main {
  display: grid;
  gap: 0.42rem;
  min-width: 0;
}

.conveyor-row-media {
  display: grid;
  grid-template-columns: 1.85rem minmax(0, 1fr);
  gap: 0.45rem;
  align-items: center;
  min-width: 0;
}

.conveyor-row-media img,
.conveyor-plant-placeholder {
  width: 1.85rem;
  height: 1.85rem;
}

.conveyor-row-media img {
  object-fit: contain;
}

.conveyor-plant-placeholder {
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: color-mix(in srgb, var(--editor-accent) 16%, transparent);
  color: var(--editor-accent-strong);
  font-size: 0.68rem;
  font-weight: 700;
}

.conveyor-row-copy {
  display: grid;
  gap: 0.08rem;
  min-width: 0;
}

.conveyor-row-copy strong,
.conveyor-rule-title strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conveyor-row-copy small,
.conveyor-rule-title small,
.conveyor-muted {
  color: var(--editor-muted);
  font-size: 0.78rem;
  line-height: 1.2;
}

.conveyor-rule-title {
  display: grid;
  gap: 0.08rem;
  min-width: 0;
}

.conveyor-chip-list,
.conveyor-wave-heading {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  min-width: 0;
}

.conveyor-chip,
.conveyor-mode-chip,
.conveyor-wave-index {
  display: inline-flex;
  align-items: center;
  min-height: 1.28rem;
  max-width: 100%;
  padding: 0.12rem 0.35rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-accent) 10%, transparent);
  color: var(--editor-muted);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.15;
}

.conveyor-mode-chip.add {
  background: color-mix(in srgb, var(--editor-accent) 16%, transparent);
  color: var(--editor-accent-strong);
}

.conveyor-mode-chip.remove {
  background: color-mix(in srgb, #d14d4d 12%, transparent);
  color: #b94040;
}

.dark .conveyor-mode-chip.remove {
  color: #ff9a9a;
}

.conveyor-row-actions {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  justify-content: flex-end;
}

.icon-button {
  width: 2.1rem;
  min-width: 2.1rem;
  padding: 0;
}

.level-editor-drawer-root {
  --editor-bg: color-mix(in srgb, var(--vp-c-bg) 94%, #5f9f3f 6%);
  --editor-panel: color-mix(in srgb, var(--vp-c-bg) 90%, var(--vp-c-bg-soft) 10%);
  --editor-border: color-mix(in srgb, var(--vp-c-text) 14%, transparent);
  --editor-text: var(--vp-c-text);
  --editor-muted: var(--vp-c-text-mute);
  --editor-accent: #5f9f3f;
  --editor-accent-strong: #3f7f2f;
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  max-width: 100vw;
  overflow: hidden;
}

.dark .level-editor-drawer-root {
  --editor-bg: color-mix(in srgb, var(--vp-c-bg) 88%, #5f9f3f 8%);
  --editor-panel: color-mix(in srgb, var(--vp-c-bg) 86%, var(--vp-c-bg-soft) 14%);
  --editor-border: color-mix(in srgb, var(--vp-c-text) 20%, transparent);
}

.level-editor-drawer-root .ant-drawer-title {
  color: var(--editor-text);
}

.level-editor-drawer-root .ant-drawer-content-wrapper {
  right: 0 !important;
  left: auto !important;
  max-width: min(720px, 96vw);
}

.level-editor-drawer-root .ant-drawer-body {
  background: var(--editor-panel);
  color: var(--editor-text);
}

.conveyor-editor-panel {
  display: grid;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.85rem;
}

.conveyor-editor-group {
  display: grid;
  gap: 0.65rem;
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.conveyor-editor-group h3 {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.2;
}

.conveyor-editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  min-width: 0;
}

.conveyor-editor-note,
.conveyor-editor-empty {
  margin: 0;
  padding: 0.75rem;
  color: var(--editor-muted);
  line-height: 1.45;
}

.level-editor-drawer-root button:focus-visible,
.level-editor-drawer-root input:focus-visible,
.level-editor-drawer-root select:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--editor-accent) 70%, #fff);
  outline-offset: 2px;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.6rem;
}

.level-editor-modal-root {
  --editor-border: color-mix(in srgb, var(--vp-c-text) 14%, transparent);
  --editor-text: var(--vp-c-text);
  --editor-muted: var(--vp-c-text-mute);
  --editor-accent: #5f9f3f;
}

.dark .level-editor-modal-root {
  --editor-border: color-mix(in srgb, var(--vp-c-text) 20%, transparent);
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
  margin: 0.6rem 0 0.25rem;
}

.asset-result-summary {
  margin-bottom: 0.5rem;
  color: var(--editor-muted);
  font-size: 0.74rem;
  font-variant-numeric: tabular-nums;
}

.object-category-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem;
  margin-top: 0.55rem;
}

.object-category-tabs button {
  min-width: 0;
  padding: 0.38rem 0.42rem;
  border: 1px solid var(--editor-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--editor-muted);
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.15;
  cursor: pointer;
}

.object-category-tabs button.active {
  border-color: color-mix(in srgb, var(--editor-accent) 48%, transparent);
  background: color-mix(in srgb, var(--editor-accent) 10%, transparent);
  color: var(--editor-text);
}

@media (hover: hover) and (pointer: fine) {
  .object-category-tabs button:hover {
    border-color: color-mix(in srgb, var(--editor-accent) 48%, transparent);
    background: color-mix(in srgb, var(--editor-accent) 10%, transparent);
    color: var(--editor-text);
  }
}

.asset-list {
  display: grid;
  gap: 0.35rem;
  max-height: min(31rem, calc(100vh - 20rem));
  overflow: auto;
  padding-right: 0.15rem;
}

.asset-empty {
  padding: 1.25rem 0.75rem;
  border: 1px dashed var(--editor-border);
  border-radius: 10px;
  color: var(--editor-muted);
  text-align: center;
}

.asset-load-more {
  width: 100%;
  margin-top: 0.55rem;
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
  font: inherit;
  text-align: left;
}

.asset-row.active {
  border-color: color-mix(in srgb, var(--editor-accent) 55%, transparent);
  background: color-mix(in srgb, var(--editor-accent) 10%, transparent);
}

@media (hover: hover) and (pointer: fine) {
  .asset-row:hover {
    border-color: color-mix(in srgb, var(--editor-accent) 55%, transparent);
    background: color-mix(in srgb, var(--editor-accent) 10%, transparent);
  }
}

.asset-row img {
  width: 2.35rem;
  height: 2.35rem;
  object-fit: contain;
}

.asset-copy {
  display: grid;
  min-width: 0;
  gap: 0.08rem;
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
  line-height: 1.25;
}

.asset-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.22rem;
  min-width: 0;
}

.asset-badge {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-height: 1rem;
  padding: 0 0.3rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--editor-accent) 10%, transparent);
  color: var(--editor-muted);
  font-size: 0.66rem;
  font-weight: 700;
  line-height: 1rem;
}

.asset-badge.tile {
  background: rgba(66, 128, 203, 0.14);
  color: #3c78bd;
}

.asset-badge.tombstone {
  background: rgba(116, 100, 83, 0.16);
  color: #796450;
}

.asset-badge.obstacle,
.asset-badge.advanced {
  background: rgba(178, 109, 44, 0.14);
  color: #a96328;
}

.dark .asset-badge.tile {
  color: #8bbcf0;
}

.dark .asset-badge.tombstone {
  color: #d5c6b7;
}

.dark .asset-badge.obstacle,
.dark .asset-badge.advanced {
  color: #f1b77a;
}

.object-dot {
  width: 1.4rem;
  height: 1.4rem;
  margin: auto;
  border-radius: 4px;
  background: #a88755;
}

.object-dot.tile {
  border-radius: 5px;
  background: linear-gradient(135deg, #6c9ed6 0 49%, #4f7eaf 50% 100%);
}

.object-dot.tombstone {
  border-radius: 50% 50% 5px 5px;
  background: linear-gradient(180deg, #9a9186, #6d6258);
}

.object-dot.obstacle {
  border-radius: 5px;
  background: linear-gradient(135deg, #bc8350, #805537);
}

.board-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
  min-width: 0;
}

.board-header > div:first-child {
  min-width: min(14rem, 100%);
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

.cell-chip.tile {
  background: #477fb5;
}

.cell-chip.obstacle {
  background: #9b6634;
}

.cell-chip.tombstone {
  background: #746858;
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
  display: grid;
  gap: 0.45rem;
}

.cell-detail-pill {
  position: relative;
  display: grid;
  gap: 0.45rem;
  max-width: 100%;
  padding: 0.45rem 2.35rem 0.45rem 0.55rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.cell-detail-remove {
  position: absolute;
  top: 0.42rem;
  right: 0.42rem;
  display: grid;
  place-items: center;
  width: 1.55rem;
  height: 1.55rem;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--editor-muted);
  cursor: pointer;
  font: inherit;
  line-height: 1;
  transition:
    color 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.cell-detail-remove:hover {
  border-color: color-mix(in srgb, #d14d4d 34%, var(--editor-border));
  background: color-mix(in srgb, #d14d4d 12%, transparent);
  color: #b73535;
}

.cell-detail-remove:focus-visible {
  outline: 2px solid color-mix(in srgb, #d14d4d 62%, var(--editor-accent));
  outline-offset: 2px;
}

.dark .cell-detail-remove:hover {
  background: color-mix(in srgb, #ff7a7a 16%, transparent);
  color: #ff9a9a;
}

.cell-detail-main {
  display: grid;
  grid-template-columns: 1.9rem minmax(0, 1fr);
  gap: 0.45rem;
  align-items: center;
  min-width: 0;
}

.cell-detail-main > img,
.cell-detail-main > .cell-chip {
  width: 1.9rem;
  height: 1.9rem;
}

.cell-detail-main > .cell-chip {
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

.cell-detail-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.cell-detail-advanced {
  display: grid;
  gap: 0.4rem;
}

.cell-detail-advanced summary {
  color: var(--editor-muted);
  cursor: pointer;
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.35;
}

.cell-detail-advanced summary::marker {
  color: color-mix(in srgb, var(--editor-muted) 80%, transparent);
}

.cell-detail-advanced .check-row {
  min-height: 1.8rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--editor-border);
  border-radius: 7px;
  background: color-mix(in srgb, var(--vp-c-bg) 92%, var(--editor-accent) 4%);
  color: var(--editor-text);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.25;
  transition:
    border-color 160ms ease,
    background-color 160ms ease;
}

.cell-detail-advanced .check-row:hover {
  border-color: color-mix(in srgb, var(--editor-accent) 45%, var(--editor-border));
  background: color-mix(in srgb, var(--vp-c-bg) 86%, var(--editor-accent) 8%);
}

.cell-detail-advanced .check-row input {
  width: 0.88rem;
  height: 0.88rem;
  margin: 0;
  accent-color: var(--editor-accent);
}

.placement-control-row,
.placement-extra-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
}

.placement-extra-list {
  gap: 0.35rem;
}

.placement-extra-title,
.unsupported-object-card small {
  color: var(--editor-muted);
  font-size: 0.76rem;
}

.unsupported-object-card strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placement-extra-chip {
  max-width: 100%;
  padding: 0.2rem 0.35rem;
  border-radius: 6px;
  background: var(--editor-bg);
  overflow-wrap: anywhere;
  font-size: 0.74rem;
  line-height: 1.35;
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
  cursor: pointer;
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

.wave-header-actions,
.flag-interval-control {
  display: flex;
  gap: 0.45rem;
  align-items: center;
}

.flag-interval-control {
  color: var(--editor-muted);
  font-size: 0.76rem;
  font-weight: 600;
}

.flag-interval-control input {
  width: 3.5rem;
  min-height: 2.1rem;
  padding: 0.2rem 0.4rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--editor-text);
  font: inherit;
  font-variant-numeric: tabular-nums;
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

.wave-flag-badge {
  display: inline-flex;
  align-items: center;
  min-height: 1rem;
  padding: 0 0.28rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-sun) 18%, transparent);
  color: #c98b00;
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1;
}

.wave-detail {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.selected-wave-toolbar,
.selected-wave-actions,
.wave-action-entry-header,
.wave-action-order-controls,
.zombie-row-controls,
.wave-action-editor-footer {
  display: flex;
  align-items: center;
}

.selected-wave-toolbar {
  gap: 0.75rem;
  justify-content: space-between;
  min-width: 0;
}

.selected-wave-toolbar > strong {
  flex: 0 0 auto;
  font-family: 'pvzgeFontEN', 'pvzgFont', 'Noto Sans SC', sans-serif;
  font-size: 1.05rem;
}

.selected-wave-actions {
  flex-wrap: wrap;
  gap: 0.3rem;
  justify-content: flex-end;
}

.selected-wave-actions button,
.wave-action-order-controls button {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
  padding: 0.2rem 0.5rem;
  border: 0;
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 82%, transparent);
  color: var(--editor-muted);
  font: inherit;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.selected-wave-actions button:not(:disabled):hover,
.wave-action-order-controls button:not(:disabled):hover {
  background: color-mix(in srgb, var(--editor-accent) 11%, var(--vp-c-bg));
  color: var(--editor-accent-strong);
}

.selected-wave-actions button.danger {
  color: #c74747;
}

.selected-wave-actions button:disabled,
.wave-action-order-controls button:disabled {
  opacity: 0.35;
  cursor: default;
}

.wave-action-sequence {
  overflow: hidden;
  border-top: 1px solid var(--editor-border);
  border-bottom: 1px solid var(--editor-border);
}

.wave-action-entry + .wave-action-entry {
  border-top: 1px solid color-mix(in srgb, var(--editor-border) 70%, transparent);
}

.wave-action-entry-header {
  min-width: 0;
}

.wave-action-entry-main {
  display: grid;
  flex: 1 1 auto;
  grid-template-columns: 1.8rem minmax(0, 1fr) 1.2rem;
  gap: 0.6rem;
  align-items: center;
  min-width: 0;
  min-height: 3.45rem;
  padding: 0.55rem 0.4rem;
  border: 0;
  background: transparent;
  color: var(--editor-text);
  text-align: left;
  cursor: pointer;
}

.wave-action-entry-main:hover {
  background: color-mix(in srgb, var(--editor-accent) 5%, transparent);
}

.wave-action-index {
  display: grid;
  width: 1.55rem;
  height: 1.55rem;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-accent) 11%, var(--vp-c-bg));
  color: var(--editor-accent-strong);
  font-size: 0.72rem;
  font-weight: 850;
}

.wave-action-index.raw {
  background: color-mix(in srgb, var(--editor-sun) 18%, var(--vp-c-bg));
  color: #9b7000;
}

.wave-action-index.conveyor {
  background: color-mix(in srgb, var(--editor-soil) 15%, var(--vp-c-bg));
  color: var(--editor-soil);
}

.wave-action-entry-copy {
  display: grid;
  min-width: 0;
}

.wave-action-entry-copy strong,
.wave-action-entry-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wave-action-entry-copy small {
  color: var(--editor-muted);
  font-size: 0.74rem;
}

.wave-action-chevron {
  color: var(--editor-muted);
  font-size: 1.25rem;
  transition: transform 0.18s ease;
}

.wave-action-entry.expanded .wave-action-chevron {
  transform: rotate(90deg);
}

.wave-action-order-controls {
  flex: 0 0 auto;
  gap: 0.15rem;
  padding-right: 0.25rem;
}

.wave-action-order-controls button {
  width: 2rem;
  min-width: 2rem;
  padding: 0;
}

.wave-action-editor-body {
  display: grid;
  gap: 0.65rem;
  padding: 0.75rem 0.5rem 0.9rem 2.8rem;
  background: color-mix(in srgb, var(--editor-accent) 3.5%, transparent);
}

.wave-action-field-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
}

.wave-action-editor-footer {
  gap: 0.6rem;
  justify-content: space-between;
}

.wave-action-editor-footer code {
  overflow: hidden;
  color: var(--editor-muted);
  font-size: 0.7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.raw-json-field {
  display: grid;
  gap: 0.35rem;
  color: var(--editor-muted);
  font-size: 0.76rem;
  font-weight: 700;
}

.raw-json-field textarea {
  min-height: 8rem;
  padding: 0.65rem;
  border: 1px solid var(--editor-border);
  border-radius: 10px;
  background: var(--vp-c-bg);
  color: var(--editor-text);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.76rem;
  resize: vertical;
}

.lane-preview {
  overflow: hidden;
  border-radius: 10px;
  background: color-mix(in srgb, var(--editor-accent) 5%, var(--vp-c-bg));
}

.lane-preview-row {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  min-height: 2rem;
}

.lane-preview-row + .lane-preview-row {
  border-top: 1px solid color-mix(in srgb, var(--editor-border) 65%, transparent);
}

.lane-number {
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--editor-accent) 8%, transparent);
  color: var(--editor-accent-strong);
  font-size: 0.7rem;
  font-weight: 850;
}

.lane-preview-row.random .lane-number {
  color: var(--editor-muted);
  font-size: 0.62rem;
}

.lane-zombies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
  padding: 0.3rem 0.45rem;
}

.lane-zombie-chip {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
  min-width: 0;
  color: var(--editor-text);
  font-size: 0.72rem;
}

.lane-zombie-dot {
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: var(--editor-soil);
}

.lane-zombie-chip strong {
  color: var(--editor-muted);
}

.lane-empty {
  color: var(--editor-muted);
  opacity: 0.45;
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
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.6rem;
  align-items: center;
  min-height: 2.9rem;
  padding: 0.35rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border) 58%, transparent);
}

.zombie-identity {
  display: grid;
  min-width: 0;
}

.zombie-row-controls {
  gap: 0.35rem;
}

.zombie-row input,
.zombie-row select {
  min-width: 0;
  min-height: 2.2rem;
  padding: 0.25rem;
  border: 1px solid var(--editor-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--editor-text);
  font: inherit;
}

.zombie-row select {
  width: 6.5rem;
}

.zombie-row input {
  width: 4.5rem;
}

.zombie-row-controls > button {
  width: 2.2rem;
  min-width: 2.2rem;
  min-height: 2.2rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #c74747;
}

.conveyor-wave-action-list {
  display: grid;
  gap: 0.25rem;
}

.conveyor-wave-action-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.5rem;
  align-items: center;
  min-height: 2.75rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border) 58%, transparent);
}

.conveyor-wave-action-row > span {
  display: grid;
}

.conveyor-wave-action-row small {
  color: var(--editor-muted);
}

.wave-add-menu {
  justify-self: start;
}

.wave-add-menu > summary {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  min-height: 2.25rem;
  padding: 0.3rem 0.65rem;
  border-radius: 9px;
  background: color-mix(in srgb, var(--editor-accent) 10%, var(--vp-c-bg));
  color: var(--editor-accent-strong);
  font-size: 0.8rem;
  font-weight: 750;
  cursor: pointer;
  list-style: none;
}

.wave-add-menu > summary::-webkit-details-marker {
  display: none;
}

.wave-add-menu-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
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
  font: inherit;
  font-weight: 600;
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

.dark .text-button.danger {
  color: #ff8a8a;
}

.issue-list {
  display: grid;
  gap: 0.4rem;
}

.issue,
.unsupported-summary {
  padding: 0.55rem;
  border-radius: 8px;
  background: var(--editor-bg);
  font-size: 0.88rem;
}

.unsupported-summary summary {
  cursor: pointer;
  font-weight: 700;
}

.unsupported-object-list {
  display: grid;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.unsupported-object-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.2rem 0.5rem;
  align-items: center;
  padding: 0.45rem;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.unsupported-object-card small {
  grid-column: 1 / -1;
  overflow-wrap: anywhere;
}

.unsupported-object-card code {
  color: var(--editor-muted);
  font-size: 0.74rem;
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
    --editor-shell-width: calc(100vw - 2rem);
  }

  .desktop-layout {
    grid-template-columns: minmax(220px, 0.68fr) minmax(460px, 1.6fr) minmax(250px, 0.78fr);
  }
}

@media (max-width: 1120px) and (min-width: 761px) {
  .level-editor-shell {
    --editor-shell-width: calc(100vw - 2rem);
  }

  .desktop-layout {
    grid-template-columns: minmax(220px, 0.7fr) minmax(0, 1.5fr);
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
}

@media (max-width: 920px) and (min-width: 761px) {
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

  .expert-mode-toggle {
    flex: 1 1 13rem;
    max-width: 100%;
  }
}

@media (max-width: 760px) {
  .level-editor-shell {
    --editor-shell-width: calc(100vw - 1rem);
    width: var(--editor-shell-width);
    max-width: none;
    margin-top: 0.75rem;
    margin-bottom: 0;
    margin-left: calc((100% - var(--editor-shell-width)) / 2);
    padding-bottom: calc(1rem + env(safe-area-inset-bottom));
    overflow-x: visible;
  }

  .editor-topbar {
    position: relative;
    top: auto;
    grid-template-columns: 1fr;
    padding: 0.9rem;
    border-radius: 14px;
    box-shadow: 0 8px 24px color-mix(in srgb, #172912 8%, transparent);
  }

  .top-actions {
    width: 100%;
    justify-items: stretch;
  }

  .top-action-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .top-action-row > .ant-btn,
  .top-action-row .ant-upload,
  .top-action-row .ant-upload .ant-btn,
  .expert-mode-toggle,
  .validation-summary-control {
    width: 100%;
    max-width: none;
    min-height: 2.75rem;
  }

  .validation-summary-control {
    grid-column: 1 / -1;
    justify-content: center;
    white-space: normal;
  }

  .action-row-primary .expert-mode-toggle {
    grid-column: 1 / -1;
  }

  .mobile-layout {
    display: grid;
    gap: 0.9rem;
    margin-top: 0.9rem;
  }

  .mobile-section-stack {
    display: grid;
    gap: 0.9rem;
    min-width: 0;
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
    grid-template-columns: repeat(9, minmax(2.75rem, 1fr));
    gap: 0.12rem;
    padding: 0.28rem;
    aspect-ratio: auto;
    overflow-x: auto;
    overscroll-behavior-x: contain;
  }

  .lawn-cell {
    min-height: 2.75rem;
  }

  .cell-label {
    font-size: 0.62rem;
  }

  .asset-list {
    max-height: 58vh;
  }

  .zombie-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.35rem;
  }

  .zombie-row-controls {
    width: 100%;
  }

  .zombie-row select {
    flex: 1 1 auto;
    width: auto;
  }

  .selected-wave-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .selected-wave-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .selected-wave-actions button,
  .wave-action-order-controls button {
    min-height: 2.75rem;
  }

  .wave-action-editor-body {
    padding: 0.75rem 0.35rem 0.9rem;
  }

  .wave-action-field-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .unsupported-object-card {
    grid-template-columns: minmax(0, 1fr);
  }

  .conveyor-compact-row,
  .conveyor-editor-grid {
    grid-template-columns: 1fr;
  }

  .icon-button {
    min-width: 2.75rem;
    min-height: 2.75rem;
    width: 100%;
  }

  .conveyor-row-actions .icon-button {
    width: 2.75rem;
  }

  .cell-detail-pill {
    padding-right: 3.35rem;
  }

  .cell-detail-remove,
  .seed-pill button {
    width: 2.75rem;
    min-width: 2.75rem;
    height: 2.75rem;
  }

  .segmented button,
  .object-category-tabs button,
  .add-button,
  .text-button,
  .zombie-row button {
    min-height: 2.75rem;
  }

  .wave-header-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

@media (max-width: 420px) {
  .board-actions,
  .wave-actions,
  .action-row {
    width: 100%;
  }

  .board-actions .text-button,
  .wave-actions .add-button,
  .wave-actions .text-button,
  .action-row .add-button {
    flex: 1 1 9rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .level-editor-shell *,
  .level-editor-shell *::before,
  .level-editor-shell *::after,
  .level-editor-drawer-root *,
  .level-editor-modal-root * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>
