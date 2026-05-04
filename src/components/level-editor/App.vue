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
          <a-tag :color="validationSummary.errors ? 'error' : 'success'">
            {{ t('errors', { count: validationSummary.errors }) }}
          </a-tag>
          <a-tag :color="validationSummary.warnings ? 'warning' : 'default'">
            {{ t('warnings', { count: validationSummary.warnings }) }}
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
          <a-button type="primary" @click="exportLevel">
            <template #icon><download-outlined /></template>
            {{ t('exportLevel') }}
          </a-button>
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
    </section>
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, inject, ref } from 'vue';
import JSON5 from 'json5';
import { message, theme as antdTheme } from 'ant-design-vue';
import {
  DeleteOutlined,
  DownloadOutlined,
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

const MAX_SEED_PLANTS = 8;

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
}

interface WaveDraft {
  id: number;
  name: string;
  flag: boolean;
  zombies: WaveZombie[];
}

interface LevelDraft {
  name: string;
  description: string;
  stage: string;
  startingSun: number;
  seedMode: SeedMode;
  seedPlants: string[];
  boardItems: BoardItem[];
  waves: WaveDraft[];
  unsupportedObjects: number;
  unsupportedRawObjects: any[];
  extraModuleRefs: string[];
}

interface ValidationItem {
  type: 'error' | 'warning';
  text: string;
}

const messages = localeMessages as Record<string, Record<LocaleKey, string>>;
const providedLanguage = inject<string>('i18nLanguage', 'zh');
const mobileTab = ref('board');
const assetTab = ref<AssetKind>('plant');
const assetSearch = ref('');
const selectedAsset = ref<AssetOption | null>(null);
const selectedCell = ref<{ row: number; col: number } | null>(null);
const selectedWaveId = ref(1);
const nextItemId = ref(1);
const nextWaveId = ref(2);
const nextZombieId = ref(1);

const stageOptions = [
  { value: 'TutorialStage', label: 'Tutorial Stage', mower: 'TutorialMowers' },
  { value: 'FrontLawnStage', label: 'Front Lawn', mower: 'FrontLawnMowers' },
  { value: 'EgyptStage', label: 'Ancient Egypt', mower: 'EgyptMowers' },
  { value: 'PirateStage', label: 'Pirate Seas', mower: 'PirateMowers' },
  { value: 'WestStage', label: 'Wild West', mower: 'WestMowers' },
  { value: 'KongfuStage', label: 'Kongfu World', mower: 'KongfuMowers' },
  { value: 'FutureStage', label: 'Far Future', mower: 'FutureMowers' },
  { value: 'DarkStage', label: 'Dark Ages', mower: 'DarkMowers' },
  { value: 'BeachStage', label: 'Big Wave Beach', mower: 'BeachMowers' },
  { value: 'LostCityStage', label: 'Lost City', mower: 'LostCityMowers' },
  { value: 'IceageStage', label: 'Frostbite Caves', mower: 'IceageMowers' },
  { value: 'EightiesStage', label: 'Neon Mixtape Tour', mower: 'EightiesMowers' },
  { value: 'DinoStage', label: 'Jurassic Marsh', mower: 'DinoMowers' },
  { value: 'ModernStage', label: 'Modern Day', mower: 'ModernMowers' }
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

const validationItems = computed<ValidationItem[]>(() => {
  const items: ValidationItem[] = [];
  if (!draft.value.name.trim()) {
    items.push({ type: 'error', text: language.value === 'zh' ? '关卡名不能为空。' : 'Level name is required.' });
  }
  if (!draft.value.waves.length) {
    items.push({ type: 'error', text: language.value === 'zh' ? '至少需要 1 个波次。' : 'At least one wave is required.' });
  }
  draft.value.waves.forEach((wave, index) => {
    if (!wave.zombies.length) {
      items.push({
        type: 'warning',
        text: language.value === 'zh' ? `第 ${index + 1} 波没有僵尸。` : `Wave ${index + 1} has no zombies.`
      });
    }
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

function t(key: string, vars: Record<string, string | number> = {}) {
  const template = messages[key]?.[language.value] || messages[key]?.en || key;
  return Object.entries(vars).reduce((text, [name, value]) => text.replace(`{${name}}`, String(value)), template);
}

function localName(item: NamedFeature) {
  return item.NAME?.[language.value] || item.NAME?.en || item.NAME?.zh || item.CODENAME;
}

function createDefaultDraft(): LevelDraft {
  return {
    name: 'custom_level_1',
    description: 'Custom Level',
    stage: 'EgyptStage',
    startingSun: 50,
    seedMode: 'chooser',
    seedPlants: ['peashooter', 'sunflower', 'wallnut', 'potatomine'],
    boardItems: [],
    waves: [
      {
        id: 1,
        name: 'Wave 1',
        flag: false,
        zombies: [{ id: 1, code: 'mummy', label: 'mummy', count: 3 }]
      }
    ],
    unsupportedObjects: 0,
    unsupportedRawObjects: [],
    extraModuleRefs: []
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
}

function chooseAsset(asset: AssetOption) {
  selectedAsset.value = asset;
  assetTab.value = asset.kind;
}

function placeAsset(row: number, col: number) {
  selectedCell.value = { row, col };
  if (!selectedAsset.value) return;
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
  draft.value.boardItems = draft.value.boardItems.filter(
    (item) => item.row !== selectedCell.value?.row || item.col !== selectedCell.value?.col
  );
}

function clearBoardItems() {
  draft.value.boardItems = [];
}

function itemsAt(row: number, col: number) {
  const layerOrder: Record<AssetKind, number> = { object: 0, plant: 1, zombie: 2 };
  return draft.value.boardItems
    .filter((item) => item.row === row && item.col === col)
    .sort((a, b) => layerOrder[a.kind] - layerOrder[b.kind]);
}

function addSeedPlant(code?: string) {
  const plantCode = code || plantOptions.value[0]?.code;
  if (!plantCode || draft.value.seedPlants.includes(plantCode)) return;
  if (draft.value.seedPlants.length >= MAX_SEED_PLANTS) {
    message.warning(t('seedLimit', { count: MAX_SEED_PLANTS }));
    return;
  }
  draft.value.seedPlants.push(plantCode);
}

function removeSeedPlant(code: string) {
  draft.value.seedPlants = draft.value.seedPlants.filter((item) => item !== code);
}

function addWave() {
  const id = nextWaveId.value++;
  draft.value.waves.push({ id, name: `Wave ${draft.value.waves.length + 1}`, flag: false, zombies: [] });
  selectedWaveId.value = id;
}

function removeWave(id: number) {
  if (draft.value.waves.length <= 1) return;
  draft.value.waves = draft.value.waves.filter((wave) => wave.id !== id);
  selectedWaveId.value = draft.value.waves[0].id;
}

function addZombieToWave(code?: string) {
  if (!selectedWave.value) return;
  const zombie = zombieOptions.value.find((item) => item.code === code) || zombieOptions.value[0];
  if (!zombie) return;
  selectedWave.value.zombies.push({ id: nextZombieId.value++, code: zombie.code, label: zombie.name, count: 1 });
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

function normalizeSeedPlants(plants: string[]) {
  return Array.from(new Set(plants.filter(Boolean))).slice(0, MAX_SEED_PLANTS);
}

function toPresetPlantList(plants: string[]) {
  return normalizeSeedPlants(plants).map((code) => ({ PlantType: code, Level: -1 }));
}

function removeZombieFromWave(id: number) {
  if (!selectedWave.value) return;
  selectedWave.value.zombies = selectedWave.value.zombies.filter((zombie) => zombie.id !== id);
}

function handleUpload(file: File) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON5.parse(String(reader.result || '{}'));
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
  const waveProps = objects.find((object: any) => object?.objclass === 'WaveManagerProperties')?.objdata || {};
  const aliasMap = new Map<string, any>();
  objects.forEach((object: any) => {
    (object?.aliases || []).forEach((alias: string) => aliasMap.set(alias, object));
  });

  const waves: WaveDraft[] = (Array.isArray(waveProps.Waves) ? waveProps.Waves : []).map((entries: string[], index: number) => {
    const zombies: WaveZombie[] = [];
    entries.forEach((entry) => {
      const alias = parseCurrentLevelAlias(entry);
      const waveObject = alias ? aliasMap.get(alias) : null;
      const zombieEntries = waveObject?.objdata?.Zombies || [];
      zombieEntries.forEach((zombie: any) => {
        const code = parseTypeAlias(zombie?.Type) || 'mummy';
        const option = zombieOptions.value.find((item) => item.code === code);
        const existing = zombies.find((item) => item.code === code);
        if (existing) existing.count += 1;
        else zombies.push({ id: nextZombieId.value++, code, label: option?.name || code, count: 1 });
      });
    });
    return { id: index + 1, name: `Wave ${index + 1}`, flag: (index + 1) % Number(waveProps.FlagWaveInterval || 10) === 0, zombies };
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
  const supportedCurrentLevelRefs = objects
    .filter((object: any) => supportedClasses.has(object?.objclass))
    .flatMap((object: any) => (object?.aliases || []).map((alias: string) => `RTID(${alias}@CurrentLevel)`));
  const generatedModuleRefs = new Set([
    'RTID(StandardIntro@LevelModules)',
    'RTID(DefaultSunDropper@LevelModules)',
    'RTID(ZombiesDeadWinCon@LevelModules)',
    'RTID(SeedBank@CurrentLevel)',
    'RTID(DefaultZombieWinCondition@LevelModules)',
    'RTID(NewWaves@CurrentLevel)',
    'RTID(InitialGridItems@CurrentLevel)',
    'RTID(FrozenPlantPlacement@CurrentLevel)',
    'RTID(FrozenZombiePlacement@CurrentLevel)',
    ...stageOptions.map((stage) => `RTID(${stage.mower}@LevelModules)`),
    ...supportedCurrentLevelRefs
  ]);
  const unsupportedRawObjects = objects.filter((object: any) => !supportedClasses.has(object?.objclass));

  return {
    name: String(level.Name || raw?.['#comment'] || 'custom_level_1'),
    description: String(level.Description || ''),
    stage: parseLevelModuleAlias(level.StageModule) || 'EgyptStage',
    startingSun: Number(level.StartingSun ?? 50),
    seedMode: seed.SelectionMethod === 'preset' ? 'preset' : 'chooser',
    seedPlants: normalizeSeedPlants(
      Array.isArray(seed.PresetPlantList)
        ? seed.PresetPlantList.map((item: any) => item.PlantType)
        : []
    ),
    boardItems,
    waves: waves.length ? waves : createDefaultDraft().waves,
    unsupportedObjects: unsupportedRawObjects.length,
    unsupportedRawObjects,
    extraModuleRefs: Array.isArray(level.Modules) ? level.Modules.filter((ref: string) => !generatedModuleRefs.has(ref)) : []
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

function serializeLevel() {
  const stage = stageOptions.find((item) => item.value === draft.value.stage) || stageOptions[2];
  const waveObjects = draft.value.waves.map((wave, index) => ({
    aliases: [`Wave${index + 1}`],
    objclass: 'SpawnZombiesJitteredWaveActionProps',
    objdata: {
      Zombies: wave.zombies.flatMap((zombie) =>
        Array.from({ length: Math.max(1, Number(zombie.count) || 1) }, () => ({
          Type: `RTID(${zombie.code}@ZombieTypes)`
        }))
      )
    }
  }));

  const gridItems = draft.value.boardItems.filter((item) => item.kind === 'object').map(serializeBoardPlacement);
  const initialPlants = draft.value.boardItems.filter((item) => item.kind === 'plant').map(serializeBoardPlacement);
  const initialZombies = draft.value.boardItems.filter((item) => item.kind === 'zombie').map(serializeBoardPlacement);
  const seedPresetPlants = toPresetPlantList(draft.value.seedPlants);

  const objects: any[] = [
    {
      objclass: 'LevelDefinition',
      objdata: {
        Name: draft.value.name,
        Description: draft.value.description,
        LevelNumber: 1,
        StartingSun: Number(draft.value.startingSun) || 0,
        Loot: 'RTID(NoLoot@LevelModules)',
        StageModule: `RTID(${draft.value.stage}@LevelModules)`,
        Modules: uniqueRefs([
          'RTID(StandardIntro@LevelModules)',
          'RTID(DefaultSunDropper@LevelModules)',
          'RTID(ZombiesDeadWinCon@LevelModules)',
          `RTID(${stage.mower}@LevelModules)`,
          'RTID(SeedBank@CurrentLevel)',
          'RTID(DefaultZombieWinCondition@LevelModules)',
          'RTID(NewWaves@CurrentLevel)',
          ...(gridItems.length ? ['RTID(InitialGridItems@CurrentLevel)'] : []),
          ...(initialPlants.length ? ['RTID(FrozenPlantPlacement@CurrentLevel)'] : []),
          ...(initialZombies.length ? ['RTID(FrozenZombiePlacement@CurrentLevel)'] : []),
          ...draft.value.extraModuleRefs
        ])
      }
    },
    {
      aliases: ['SeedBank'],
      objclass: 'SeedBankProperties',
      objdata:
        draft.value.seedMode === 'preset'
          ? {
              SelectionMethod: 'preset',
              PresetPlantList: seedPresetPlants
            }
          : {
              SelectionMethod: 'chooser',
              OverrideSeedSlotsCount: MAX_SEED_PLANTS,
              ...(seedPresetPlants.length ? { PresetPlantList: seedPresetPlants } : {})
            }
    },
    {
      aliases: ['NewWaves'],
      objclass: 'WaveManagerModuleProperties',
      objdata: { WaveManagerProps: 'RTID(WaveManagerProps@CurrentLevel)' }
    },
    {
      aliases: ['WaveManagerProps'],
      objclass: 'WaveManagerProperties',
      objdata: {
        MinNextWaveHealthPercentage: 0.55,
        MaxNextWaveHealthPercentage: 0.7,
        FlagWaveInterval: Math.max(1, draft.value.waves.findIndex((wave) => wave.flag) + 1 || 10),
        WaveCount: draft.value.waves.length,
        WaveSpendingPointIncrement: 30,
        WaveSpendingPoints: 100,
        Waves: draft.value.waves.map((_, index) => [`RTID(Wave${index + 1}@CurrentLevel)`])
      }
    },
    ...waveObjects,
    ...draft.value.unsupportedRawObjects
  ];

  if (gridItems.length) {
    objects.push({
      aliases: ['InitialGridItems'],
      objclass: 'InitialGridItemProperties',
      objdata: { InitialGridItemPlacements: gridItems }
    });
  }

  if (initialPlants.length) {
    objects.push({
      aliases: ['FrozenPlantPlacement'],
      objclass: 'InitialPlantProperties',
      objdata: { InitialPlantPlacements: initialPlants }
    });
  }

  if (initialZombies.length) {
    objects.push({
      aliases: ['FrozenZombiePlacement'],
      objclass: 'InitialZombieProperties',
      objdata: { InitialZombiePlacements: initialZombies }
    });
  }

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

const PropertyPanel = defineComponent({
  setup() {
    return () =>
      h('aside', { class: 'property-panel-inner' }, [
        h('div', { class: 'panel-title' }, t('propertyPanel')),
        h('div', { class: 'property-section' }, [
          h('strong', `${t('seedBank')} ${draft.value.seedPlants.length}/${MAX_SEED_PLANTS}`),
          h('div', { class: 'segmented stacked' }, [
            h('button', { class: draft.value.seedMode === 'chooser' ? 'active' : '', onClick: () => (draft.value.seedMode = 'chooser') }, t('seedChooser')),
            h('button', { class: draft.value.seedMode === 'preset' ? 'active' : '', onClick: () => (draft.value.seedMode = 'preset') }, t('seedPreset'))
          ]),
          h('small', { class: 'seed-mode-hint' }, t(draft.value.seedMode === 'chooser' ? 'seedChooserHint' : 'seedPresetHint')),
          h(
            'div',
            { class: 'seed-list' },
            draft.value.seedPlants.map((code) => {
              const plant = plantOptions.value.find((item) => item.code === code);
              return h('span', { class: 'seed-pill' }, [
                plant?.image ? h('img', { src: plant.image, alt: plant.name, loading: 'lazy' }) : null,
                h('span', plant?.name || code),
                h('button', { onClick: () => removeSeedPlant(code) }, 'x')
              ]);
            })
          ),
        h('button', {
          class: 'add-button',
          disabled: draft.value.seedPlants.length >= MAX_SEED_PLANTS,
          onClick: () => addSeedPlant(selectedAsset.value?.kind === 'plant' ? selectedAsset.value.code : undefined)
        }, [
            h(PlusOutlined),
            t('plants')
          ])
        ])
      ]);
  }
});

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
            return h(
              'button',
              {
                class: ['wave-card', selectedWaveId.value === wave.id ? 'active' : '', wave.flag ? 'flag' : ''],
                onClick: () => (selectedWaveId.value = wave.id)
              },
              [h('strong', `#${index + 1}`), h('span', `${zombieCount} Z`)]
            );
          })
        ),
        selectedWave.value
          ? h('div', { class: 'wave-detail' }, [
              h('label', { class: 'check-row' }, [
                h('input', {
                  type: 'checkbox',
                  checked: selectedWave.value.flag,
                  onChange: (event: Event) => {
                    selectedWave.value.flag = (event.target as HTMLInputElement).checked;
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
                        zombie.count = Math.max(1, Number((event.target as HTMLInputElement).value) || 1);
                      }
                    }),
                    h('button', { onClick: () => removeZombieFromWave(zombie.id) }, h(DeleteOutlined))
                  ])
                )
              ),
              h('div', { class: 'wave-actions' }, [
                h('button', { class: 'add-button', onClick: () => addZombieToWave(selectedAsset.value?.kind === 'zombie' ? selectedAsset.value.code : undefined) }, [
                  h(PlusOutlined),
                  t('addZombie')
                ]),
                draft.value.waves.length > 1
                  ? h('button', { class: 'text-button danger', onClick: () => removeWave(selectedWave.value.id) }, t('remove'))
                  : null
              ])
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
  display: flex;
  gap: 1rem;
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
  min-width: 18rem;
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
  gap: 0.5rem;
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
.text-button:disabled {
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

@media (max-width: 760px) {
  .level-editor-shell {
    width: 100%;
    max-width: 100%;
    margin-left: 0;
  }

  .editor-topbar {
    display: grid;
  }

  .top-actions {
    justify-content: flex-start;
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
