import { selectedWaveEvent } from '../features/waves/scheduler-selection.mjs';
import { createBoardEditing } from '../features/board/board-editing';
import { useValidation } from '../features/validation/use-validation';
import { getLocalAssetDefinitions, createLocalAsset } from '../features/assets/local-assets-codec.mjs';
import { resolveAssetData } from '../features/assets/catalog';
import { createEditHistory } from '../core/edit-history.mjs';
import { createEditCommands } from '../core/edit-commands.mjs';
import { workspaceDefinitions } from './workspace-definitions';
import { createDocumentCodec } from '../features/document/document-codec';
import { useEditorSelection } from '../core/use-editor-selection';
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import localeMessages from '../i18n.json';
import { boardObjectData } from '../../game-data/board-objects';
import { getCardDecks } from '../card-deck-codec.mjs';
import { stageOptions } from '../stage-registry.mjs';
import { plantFeaturesJson as plantFeatures } from '../../game-data/plants';
import { zombieFeaturesJson as zombieFeatures } from '../../game-data/zombies';
import { getAlmanacEntityPath } from '../../almanac-v2/almanac-routes';
import { getGeneratorObjects } from '../authored-content-codec.mjs';
import { SPECIAL_MODE_CLASSES, getSpecialBindings, localizeSpecialModule, createSpecialLevel } from '../special-mode-codec.mjs';
import { specialModeOptions } from '../../game-data/special-modes';
import { createEndlessLevel, getEndlessModule } from '../endless-codec.mjs';

import { analyzeLevelCapabilities, createLevelImportSnapshot, getImportedObjectsByClass, validateLevelDocument } from '../level-codec.mjs';
import JSON5 from 'json5';
import { collectCurrentLevelReferences, groupZombieEntries, groupZombiePoolReferences, resizeZombiePoolGroup, serializeZombieGroups, serializeZombiePoolGroups, setDynamicZombiesOnModuleObject, toZombieTypeReference } from '../wave-codec.mjs';
import { POWER_TILE_GROUPS, createEmptyBoardRuleSystem } from '../board-rule-codec.mjs';
import { createProjectState, readProjectState, getNextProjectIds, DRAFT_STORAGE_KEY, PROJECT_KIND } from '../project-state.mjs';
import { createEmptyObjectiveSystem } from '../objective-codec.mjs';
import { message, Modal } from 'ant-design-vue';
import { BOARD_TOOLS } from '../board-editing.mjs';

import { createWaveActionTemplate, getWaveActionDefinitionByClass } from '../wave-action-codec.mjs';
import { trackEvent } from '../../analytics';
import type { LocaleKey, WorkspaceId, AssetKind, AssetOption, AddableWaveActionKind, PlantListKey, ImportCapabilitySummary, LevelDraft, NamedFeature, ConveyorEditorTarget, WaveActionDraft, WaveDraft, ConveyorDraft, ObjectiveSystemDraft, BoardRuleSystemDraft, BoardItem, ConveyorWaveMode, ConveyorWaveModification, ConveyorPlantEntry, DynamicZombieNumberField, WaveActionOrderEntry, ObjectCategory, PreservedConveyorWaveAction, WaveZombie } from '../core/types';

export function useLevelEditor() {

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

  const messages = localeMessages as Record<string, Record<LocaleKey, string>>;

  const providedLanguage = inject<string>('i18nLanguage', 'zh');

  const {
    previewOpen, activeWorkspace, validationOpen, recentZombieCodes,
    selectedSpawnRow, expertMode, assetTab, objectCategory, assetSearch, assetVisibleLimit,
    selectedAsset, selectedCell, boardTool, selectedBoardTargetId, boardPowerGroup,
    boardPowerDelay, selectedWaveId, newSchedulerChildKind, selectedSchedulerChildAliases,
    newGravestoneType, newGridItemSpawnType, expandedWaveActionKey, selectedDynamicDifficulty,
    seedListTarget, selectedDeckIndex, deckNameLanguage, eventPickerOpen, generatorEditorOpen,
    selectedGeneratorAlias, generatorPoolTarget, endlessTemplateOpen, endlessSettingsOpen,
    newEndlessWorld, endlessPreviewFloor, specialModeEditorOpen, specialModeState,
    specialTemplateOpen, newSpecialKind, newSpecialTemplateId, conveyorAdvancedTab,
    conveyorEditorOpen, conveyorEditorTarget, conveyorEditorReturnFocus, activePane,
    inspectorTab, focused
  } = useEditorSelection(providedLanguage, ASSET_PAGE_SIZE);

  const EXPERT_MODE_STORAGE_KEY = 'pvzg-level-editor-expert-mode';

  const workspaceViews = workspaceDefinitions as { id: WorkspaceId; label: string; icon: string; assets: boolean; }[];

  const draftSaveError = ref(false);

  const draftRestoreError = ref(false);

  let unreadableDraft: string | null = null;

  let draftReady = false;

  let draftDirty = false;

  let draftSaveTimer: ReturnType<typeof setTimeout> | undefined;

  const sharedNarrativeCatalog = ref<any[] | null>(null);

  const endlessCatalogLoading = ref(false);

  const endlessWorldOptions = ref<string[]>([]);

  const endlessSharedObjects = ref<any[]>([]);

  const endlessProgressOptions = ref<any[]>([]);

  const specialTemplatesLoading = ref(false);

  const specialTemplates = ref<any[]>([]);

  let endlessTemplates: any[] = [];

  const nextItemId = ref(1);

  const nextWaveId = ref(2);

  const nextZombieId = ref(2);

  const nextWaveActionId = ref(1);

  let importedLevelSnapshot: any = null;

  const importCapability = ref<ImportCapabilitySummary | null>(null);

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

  const history = createEditHistory(draft.value);
  const historyRevision = ref(0);
  let restoringHistory = false;
  const canUndo = computed(() => { historyRevision.value; return history.canUndo; });
  const canRedo = computed(() => { historyRevision.value; return history.canRedo; });
  function resetHistory() { history.reset(draft.value); historyRevision.value += 1; }
  function recordHistory() { if (!restoringHistory && history.record(draft.value)) historyRevision.value += 1; }
  const editCommands = createEditCommands({
    read: () => draft.value,
    write: (value: LevelDraft) => { draft.value = value; },
    onCommitted: recordHistory
  });
  function runEdit<T>(id: string, operation: () => T): T { return editCommands.execute(id, operation); }

  async function restoreHistory(direction: number) {
    recordHistory();
    const restored = history.move(direction);
    if (!restored) return;
    restoringHistory = true;
    closeConveyorEditor();
    draft.value = restored;
    if (selectedAsset.value?.local) {
      const alias = selectedAsset.value.alias;
      selectedAsset.value = localAssetOptions.value.find(asset => asset.alias === alias) || null;
    }
    historyRevision.value += 1;
    if (draft.value.seedMode === 'preset') seedListTarget.value = 'seedPlants';
    if (seedListTarget.value === 'Recommended' || seedListTarget.value === 'Challenging') {
      selectedDeckIndex.value = Math.min(selectedDeckIndex.value, Math.max(0, getCardDecks(draft.value.seedBankExtra, seedListTarget.value).length - 1));
    }
    selectedWaveId.value = draft.value.waves.some((wave) => wave.id === selectedWaveId.value)
      ? selectedWaveId.value : draft.value.waves[0]?.id || 1;
    const wave = selectedWave.value;
    const entries = wave ? getEffectiveWaveActionOrder(wave, draft.value.waves.indexOf(wave) + 1) : [];
    const keys = entries.map(getWaveActionKey);
    if (!['settings', 'difficulty', ...keys].includes(expandedWaveActionKey.value)) expandedWaveActionKey.value = keys[0] || '';
    await nextTick();
    restoringHistory = false;
  }

  watch(draft, () => { recordHistory(); if (draftReady) draftDirty = true; scheduleDraftSave(); }, { deep: true, flush: 'post' });

  watch(selectedSchedulerChildAliases, scheduleDraftSave, { deep: true, flush: 'post' });
  watch(specialModeState, scheduleDraftSave, { deep: true, flush: 'post' });

  watch([seedListTarget, selectedDeckIndex, deckNameLanguage, expandedWaveActionKey, selectedSpawnRow,
    generatorEditorOpen, selectedGeneratorAlias, generatorPoolTarget, endlessPreviewFloor, boardTool, selectedBoardTargetId, boardPowerGroup, boardPowerDelay], scheduleDraftSave, { flush: 'post' });

  const language = computed<LocaleKey>(() => {
    if (providedLanguage.startsWith('es')) return 'es';
    if (providedLanguage.startsWith('ru')) return 'ru';
    if (providedLanguage.startsWith('en')) return 'en';
    return 'zh';
  });

  const availableStageOptions = computed(() => {
    if (stageOptions.some((stage) => stage.value === draft.value.stage)) return stageOptions;
    return [{ value: draft.value.stage, label: draft.value.stage, mower: NO_MODULE }, ...stageOptions];
  });

  const globalPlantOptions = computed<AssetOption[]>(() =>
    ((plantFeatures as { PLANTS: NamedFeature[]; }).PLANTS || []).map((plant) => ({
      kind: 'plant',
      code: plant.CODENAME,
      name: localName(plant),
      world: plant.OBTAINWORLD,
      image: `/assets/image/plants/plants_${plant.CODENAME}_c.webp`
    }))
  );

  const globalZombieOptions = computed<AssetOption[]>(() =>
    ((zombieFeatures as { ZOMBIES: NamedFeature[]; }).ZOMBIES || []).map((zombie) => ({
      kind: 'zombie',
      code: zombie.CODENAME,
      name: localName(zombie),
      world: zombie.OBTAINWORLD,
      image: `/assets/image/zombies/Zombie_${zombie._CARDSPRITENAME || zombie.CODENAME}_0.webp`
    }))
  );

  const localAssetOptions = computed<AssetOption[]>(() => getLocalAssetDefinitions(draft.value.unsupportedRawObjects).map((entry) => {
    const source = (entry.kind === 'plant' ? globalPlantOptions.value : globalZombieOptions.value).find((item) => item.code === entry.base);
    return {
      ...source, kind: entry.kind, code: entry.kind === 'zombie' ? `RTID(${entry.alias}@CurrentLevel)` : entry.alias,
      name: entry.alias, base: entry.base, alias: entry.alias, local: true
    };
  }));
  const plantOptions = computed(() => [...localAssetOptions.value.filter((asset) => asset.kind === 'plant'), ...globalPlantOptions.value]);
  const zombieOptions = computed(() => [...localAssetOptions.value.filter((asset) => asset.kind === 'zombie'), ...globalZombieOptions.value]);
  function createAssetVariant() {
    const asset = selectedAsset.value;
    if (!asset || asset.kind === 'object' || asset.local) return;
    const source = resolveAssetData(asset, draft.value.unsupportedRawObjects);
    if (!source?.type || !source.properties) return;
    const added = runEdit('assets.createVariant', () => {
      const objects = createLocalAsset(draft.value.unsupportedRawObjects, source.type, source.properties, boardReservedAliases.value);
      draft.value.unsupportedRawObjects.push(...objects);
      return objects[0].aliases[0];
    });
    selectedAsset.value = localAssetOptions.value.find((item) => item.alias === added) || null;
    activeWorkspace.value = 'assets';
    activePane.value = 'properties';
    inspectorTab.value = 'edit';
  }

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

  const selectedAssetAlmanacPath = computed(() => {
    const asset = selectedAsset.value;
    if (!asset || asset.kind === 'object') return null;
    return getAlmanacEntityPath(asset.kind, asset.base || asset.code, language.value);
  });

  const seedPlantLimit = computed(() => draft.value.overrideSeedSlots ? draft.value.seedSlots : MAX_SEED_PLANTS);

  const seedActionHint = ref('');

  const eventZombieActionHint = ref('');

  const dynamicZombieActionHint = ref('');

  const conveyorActionHint = ref('');

  const activePointGenerator = computed(() => getGeneratorObjects(draft.value.unsupportedRawObjects).find((object: any) =>
    object.objclass === 'LevelOfTheDayModuleProperties' && (object.aliases || []).some((alias: string) => draft.value.moduleRefs.includes(`RTID(${alias}@CurrentLevel)`))));

  const narrativeReservedAliases = computed(() => [draft.value.waveManagerAlias,
  ...draft.value.waves.flatMap((wave) => [wave.zombieActionAlias || '', ...wave.rawActions.map((action) => action.alias)]),
  ...(importedLevelSnapshot?.source.objects || []).flatMap((object: any) => object?.aliases || [])]);

  const boardReservedAliases = computed(() => [...narrativeReservedAliases.value,
  ...draft.value.unsupportedRawObjects.flatMap((object: any) => object?.aliases || []),
  ...draft.value.boardRules.modules.map((rule) => rule.alias),
  ...draft.value.objectives.starObjectives.map((objective) => objective.alias), draft.value.objectives.protect?.alias].filter(Boolean));

  const specialBindings = computed(() => getSpecialBindings(draft.value, specialModeOptions.sharedObjects));

  const specialKinds = computed(() => [...new Set(specialBindings.value.map((binding: any) => binding.kind))]);

  const isEndlessMode = computed(() => !!(draft.value.levelExtra.IsDangerRoom || draft.value.levelExtra.IsDangerRoomMiniGame));

  const activeEndlessModule = computed(() => getEndlessModule(draft.value.unsupportedRawObjects, draft.value.levelExtra));

  const { opaqueRawObjects, validationItems, validationSummary, validationState } = useValidation({ draft, activeEndlessModule, endlessSharedObjects, sharedNarrativeCatalog, specialKinds, activePointGenerator, getKnownCurrentLevelAliases: () => getKnownCurrentLevelAliases(), parseActionObjdata, parseOptionalArrayText, t, NEW_WAVES_REF, getImportedLevelSnapshot: () => importedLevelSnapshot });

  const previewJson = computed(() => JSON.stringify(serializeLevel(), null, 2));

  function clearSelectedAsset() {
    selectedAsset.value = null;
  }

  function handleKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (eventPickerOpen.value) return;
    if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'z' &&
      !target.closest('input, textarea, select, [contenteditable="true"]') &&
      !previewOpen.value && !conveyorEditorOpen.value) {
      event.preventDefault();
      void restoreHistory(event.shiftKey ? 1 : -1);
      return;
    }
    if (activeWorkspace.value === 'waves' && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey &&
      !target.closest('input, textarea, select, [contenteditable="true"], .ant-modal, .ant-drawer') &&
      !previewOpen.value && !validationOpen.value && !conveyorEditorOpen.value) {
      const index = '1234567890qw'.indexOf(event.key.toLowerCase());
      const code = recentZombieCodes.value[index];
      const asset = code ? zombieOptions.value.find((item) => item.code === code || item.alias === code) : null;
      if (asset) { event.preventDefault(); addZombieToTarget(asset); return; }
    }
    if (event.key !== 'Escape' || previewOpen.value || !selectedAsset.value) return;
    clearSelectedAsset();
  }

  onMounted(() => {
    try {
      expertMode.value = window.localStorage.getItem(EXPERT_MODE_STORAGE_KEY) === '1';
      const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        try { restoreProject(readProjectState(saved)); }
        catch { unreadableDraft = saved; draftRestoreError.value = true; }
      }
    } catch {
      draftSaveError.value = true;
    }
    draftReady = true;
    window.addEventListener('pagehide', saveDraftNow);
    document.addEventListener('visibilitychange', saveHiddenDraft);
    window.addEventListener('keydown', handleKeydown);
  });

  onBeforeUnmount(() => {
    saveDraftNow();
    editCommands.dispose();
    clearTimeout(draftSaveTimer);
    window.removeEventListener('pagehide', saveDraftNow);
    document.removeEventListener('visibilitychange', saveHiddenDraft);
    window.removeEventListener('keydown', handleKeydown);
  });

  watch(expertMode, (enabled) => {
    if (typeof window === 'undefined') return;
    if (!enabled && selectedAsset.value?.advanced) clearSelectedAsset();
    try { window.localStorage.setItem(EXPERT_MODE_STORAGE_KEY, enabled ? '1' : '0'); } catch { draftSaveError.value = true; }
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

  function createRawWaveAction(alias: string, objclass: string, objdata: Record<string, any>, originalObject?: any): WaveActionDraft {
    const data = cloneJson(objdata || {});
    return {
      id: nextWaveActionId.value++,
      alias,
      objclass,
      objdata: data,
      jsonText: stringifyObjdata(data),
      originalObject: originalObject ? cloneJson(originalObject) : undefined
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
      stageSource: 'LevelModules',
      mower: STAGE_DEFAULT_MOWER,
      sunDropper: 'DefaultSunDropper',
      startingSun: 50,
      seedMode: 'chooser',
      overrideSeedSlots: false,
      seedSlots: MAX_SEED_PLANTS,
      seedPlants: ['peashooter', 'sunflower', 'wallnut', 'potatomine'],
      seedPresetEntries: [],
      includePlants: [],
      excludePlants: [],
      unlockAll: false,
      hasSeedBank: true,
      seedBankExtra: {},
      conveyor: createDefaultConveyorDraft(),
      objectives: createEmptyObjectiveSystem() as ObjectiveSystemDraft,
      boardRules: createEmptyBoardRuleSystem() as BoardRuleSystemDraft,
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
      waveSupportObjects: [],
      flagWaveInterval: 5,
      flagWaveIntervalDirty: true,
      firstWaveCountdown: -1,
      suppressFlagZombie: false,
      waveSpendingPointIncrement: 10,
      waveSpendingPoints: 100,
      minNextWaveHealthPercentage: 0.5,
      maxNextWaveHealthPercentage: 0.65,
      waveManagerModuleExtra: {},
      waveManagerExtra: {},
      waveManagerAlias: 'WaveManagerProps',
      waveManagerReferenceOnModule: true,
      supportsDynamicZombies: true,
      hasWaveManager: true,
      preserveGeneratorWaves: false,
      preserveCustomWaveManager: false,
      preservedStaticWaveObjects: [],
      waveSystemDirty: false,
      rootExtra: { version: 1 },
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
    unreadableDraft = null;
    draftRestoreError.value = false;
    closeConveyorEditor();
    importedLevelSnapshot = null;
    importCapability.value = null;
    draft.value = createDefaultDraft();
    selectedWaveId.value = 1;
    newSchedulerChildKind.value = 'storm';
    selectedSchedulerChildAliases.value = {};
    newGravestoneType.value = 'gravestone_egypt';
    newGridItemSpawnType.value = 'gravestone_egypt';
    expandedWaveActionKey.value = 'zombies';
    eventPickerOpen.value = false;
    seedListTarget.value = 'seedPlants';
    selectedDeckIndex.value = 0;
    endlessSettingsOpen.value = false;
    specialModeEditorOpen.value = false;
    specialModeState.value = { kind: 'boss', reference: '', teamIndex: 0, nameLanguage: language.value };
    endlessPreviewFloor.value = 1;
    generatorEditorOpen.value = false;
    selectedGeneratorAlias.value = '';
    generatorPoolTarget.value = 'ZombiePool';
    selectedDynamicDifficulty.value = 4;
    dynamicZombieActionHint.value = '';
    eventZombieActionHint.value = '';
    resetBoardTools();
    selectedCell.value = null;
    selectedAsset.value = null;
    nextItemId.value = 1;
    nextWaveId.value = 2;
    nextZombieId.value = 2;
    nextWaveActionId.value = 1;
    resetHistory();
  }

  async function loadEndlessCatalog() {
    if (endlessTemplates.length) return true;
    if (endlessCatalogLoading.value) return false;
    endlessCatalogLoading.value = true;
    try {
      const data = await import('../../game-data/endless');
      endlessTemplates = data.endlessTemplates;
      endlessWorldOptions.value = data.endlessTemplates.map((template) => template.world);
      endlessSharedObjects.value = data.endlessSharedObjects;
      endlessProgressOptions.value = data.endlessProgressOptions;
      return true;
    } catch {
      message.error(t('endlessTemplatesFailed'));
      return false;
    } finally { endlessCatalogLoading.value = false; }
  }

  async function openEndlessTemplate() {
    if (await loadEndlessCatalog()) endlessTemplateOpen.value = true;
  }

  async function openEndlessSettings() {
    specialModeEditorOpen.value = false;
    if (await loadEndlessCatalog()) endlessSettingsOpen.value = true;
  }

  function createEndlessDraft() {
    const template = endlessTemplates.find((item) => item.world === newEndlessWorld.value);
    if (!template) return;
    loadLevelDocument(createEndlessLevel(template.level, 'custom_endless_1', t('endlessDefaultDescription')));
    switchWorkspace('waves');
    endlessTemplateOpen.value = false;
  }

  function openSpecialMode(kind: string) {
    const bindings = specialBindings.value.filter((binding: any) => binding.kind === kind);
    if (!bindings.length) return;
    endlessSettingsOpen.value = false;
    closeConveyorEditor();
    const previous = specialModeState.value;
    const reference = previous.kind === kind && bindings.some((binding: any) => binding.reference === previous.reference) ? previous.reference : bindings[0].reference;
    specialModeState.value = { ...previous, kind, reference, teamIndex: previous.kind === kind ? previous.teamIndex : 0 };
    specialModeEditorOpen.value = true;
  }

  function mutate_localizeSpecial(binding: any) {
    const local = localizeSpecialModule(draft.value, binding, boardReservedAliases.value);
    specialModeState.value.reference = local.reference;
  }

  function mutate_removeSpecialMode(binding: any) {
    draft.value.moduleRefs = draft.value.moduleRefs.filter((reference) => reference !== binding.reference);
    specialModeEditorOpen.value = false;
  }

  async function openSpecialTemplate(kind: string) {
    if (!specialTemplates.value.length) {
      specialTemplatesLoading.value = true;
      try { specialTemplates.value = (await import('../../game-data/special-templates')).specialTemplates; }
      catch { message.error(t('specialTemplatesFailed')); return; }
      finally { specialTemplatesLoading.value = false; }
    }
    newSpecialKind.value = kind;
    newSpecialTemplateId.value = specialTemplates.value.find((template) => template.kind === kind)?.id || '';
    specialTemplateOpen.value = true;
  }

  function specialTemplateLabel(template: any) {
    return template.kind === 'boss' ? `${getZombieDisplayName(template.type, template.type)} · ${template.id.replace('.json', '')}` : template.id.replace('.json', '');
  }

  function createSpecialDraft() {
    const template = specialTemplates.value.find((template) => template.kind === newSpecialKind.value && template.id === newSpecialTemplateId.value);
    if (!template) return;
    loadLevelDocument(createSpecialLevel(template.level, `custom_${template.kind === 'boss' ? 'boss' : 'airraid'}_1`, t(`specialDefault_${template.kind}`)));
    specialTemplateOpen.value = false;
    switchWorkspace(template.kind === 'boss' ? 'board' : 'waves');
    openSpecialMode(template.kind);
  }

  function confirmResetDraft() {
    Modal.confirm({
      wrapClassName: 'level-editor-modal-root',
      title: t('confirmNewTitle'),
      content: t('confirmNewDescription'),
      okText: t('confirmNewAction'),
      cancelText: t('cancel'),
      okType: 'danger',
      centered: true,
      onOk: resetDraft
    });
  }

  function openValidation() {
    validationOpen.value = true;
  }

  function switchWorkspace(id: WorkspaceId) {
    specialModeEditorOpen.value = false;
    endlessSettingsOpen.value = false;
    if (activeWorkspace.value !== id) assetSearch.value = '';
    eventPickerOpen.value = false;
    activeWorkspace.value = id;
    activePane.value = 'editor';
    inspectorTab.value = 'edit';
    if (id === 'waves') assetTab.value = 'zombie';
    if (id === 'seed') assetTab.value = 'plant';
    closeConveyorEditor();
    closeProjectMenu();
    scheduleDraftSave();
  }

  function handleWorkspaceKeydown(event: KeyboardEvent, id: WorkspaceId) {
    const index = workspaceViews.findIndex((view) => view.id === id);
    const next = event.key === 'ArrowRight' ? (index + 1) % workspaceViews.length
      : event.key === 'ArrowLeft' ? (index + workspaceViews.length - 1) % workspaceViews.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? workspaceViews.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    switchWorkspace(workspaceViews[next].id);
    nextTick(() => document.getElementById(`level-tab-${workspaceViews[next].id}`)?.focus());
  }

  function captureProject() {
    return createProjectState(draft.value, importedLevelSnapshot, {
      activeWorkspace: activeWorkspace.value, selectedWaveId: selectedWaveId.value,
      recentZombieCodes: recentZombieCodes.value, seedListTarget: seedListTarget.value,
      selectedDeckIndex: selectedDeckIndex.value, deckNameLanguage: deckNameLanguage.value,
      selectedSpawnRow: selectedSpawnRow.value, expandedWaveActionKey: expandedWaveActionKey.value,
      selectedSchedulerChildAliases: { ...selectedSchedulerChildAliases.value },
      generatorEditorOpen: generatorEditorOpen.value, selectedGeneratorAlias: selectedGeneratorAlias.value,
      generatorPoolTarget: generatorPoolTarget.value, boardTool: boardTool.value, selectedBoardTargetId: selectedBoardTargetId.value,
      boardPowerGroup: boardPowerGroup.value, boardPowerDelay: boardPowerDelay.value, endlessPreviewFloor: endlessPreviewFloor.value, specialMode: { ...specialModeState.value }
    });
  }

  function restoreProject(project: ReturnType<typeof readProjectState>) {
    unreadableDraft = null;
    draftRestoreError.value = false;
    closeConveyorEditor();
    importedLevelSnapshot = project.importedLevelSnapshot;
    draft.value = project.draft;
    importCapability.value = importedLevelSnapshot ? analyzeLevelCapabilities(importedLevelSnapshot.source) as ImportCapabilitySummary : null;
    const ids = getNextProjectIds(draft.value);
    nextItemId.value = ids.item;
    nextWaveId.value = ids.wave;
    nextZombieId.value = ids.zombie;
    nextWaveActionId.value = ids.action;
    activeWorkspace.value = workspaceViews.some((view) => view.id === project.editor.activeWorkspace) ? project.editor.activeWorkspace : 'basic';
    selectedWaveId.value = draft.value.waves.some((wave) => wave.id === project.editor.selectedWaveId)
      ? project.editor.selectedWaveId : draft.value.waves[0]?.id || 1;
    recentZombieCodes.value = Array.isArray(project.editor.recentZombieCodes)
      ? project.editor.recentZombieCodes.filter((code: unknown) => typeof code === 'string').slice(0, 12) : [];
    seedListTarget.value = draft.value.seedMode !== 'preset' && ['seedPlants', 'includePlants', 'excludePlants', 'Recommended', 'Challenging'].includes(project.editor.seedListTarget)
      ? project.editor.seedListTarget : 'seedPlants';
    selectedDeckIndex.value = Math.max(0, Number(project.editor.selectedDeckIndex) || 0);
    deckNameLanguage.value = ['zh', 'en', 'es', 'ru'].includes(project.editor.deckNameLanguage) ? project.editor.deckNameLanguage : language.value;
    selectedSpawnRow.value = typeof project.editor.selectedSpawnRow === 'string' ? project.editor.selectedSpawnRow : '';
    selectedSchedulerChildAliases.value = Object.fromEntries(
      Object.entries(project.editor.selectedSchedulerChildAliases || {}).filter(
        (entry): entry is [string, string] => /^\d+$/.test(entry[0]) && typeof entry[1] === 'string'
      )
    );
    const wave = selectedWave.value;
    const keys = wave ? getEffectiveWaveActionOrder(wave, draft.value.waves.indexOf(wave) + 1).map(getWaveActionKey) : [];
    expandedWaveActionKey.value = ['settings', 'difficulty', ...keys].includes(project.editor.expandedWaveActionKey)
      ? project.editor.expandedWaveActionKey : keys[0] || 'zombies';
    eventPickerOpen.value = false;
    const generators = getGeneratorObjects(draft.value.unsupportedRawObjects);
    selectedGeneratorAlias.value = generators.some((object: any) => object.aliases?.includes(project.editor.selectedGeneratorAlias))
      ? project.editor.selectedGeneratorAlias : generators[0]?.aliases?.[0] || '';
    generatorPoolTarget.value = project.editor.generatorPoolTarget === 'MustContainZombie' ? 'MustContainZombie' : 'ZombiePool';
    generatorEditorOpen.value = isEndlessMode.value || (project.editor.generatorEditorOpen ?? generators.length > 0);
    endlessPreviewFloor.value = Math.max(1, Math.floor(Number(project.editor.endlessPreviewFloor)) || 1);
    if (!isEndlessMode.value) endlessSettingsOpen.value = false;
    const savedSpecial = project.editor.specialMode;
    if (savedSpecial && Object.hasOwn(SPECIAL_MODE_CLASSES, savedSpecial.kind)) specialModeState.value = {
      kind: savedSpecial.kind, reference: typeof savedSpecial.reference === 'string' ? savedSpecial.reference : '',
      teamIndex: Number.isInteger(savedSpecial.teamIndex) && savedSpecial.teamIndex >= 0 ? savedSpecial.teamIndex : 0,
      nameLanguage: ['zh', 'en', 'es', 'ru'].includes(savedSpecial.nameLanguage) ? savedSpecial.nameLanguage : language.value
    };
    if (!specialBindings.value.some((binding: any) => binding.kind === specialModeState.value.kind)) specialModeEditorOpen.value = false;
    boardTool.value = BOARD_TOOLS.includes(project.editor.boardTool) ? project.editor.boardTool : 'place';
    selectedBoardTargetId.value = project.editor.selectedBoardTargetId || '';
    boardPowerGroup.value = POWER_TILE_GROUPS.includes(project.editor.boardPowerGroup) ? project.editor.boardPowerGroup : 'alpha';
    boardPowerDelay.value = Number.isFinite(project.editor.boardPowerDelay) ? project.editor.boardPowerDelay : 0.25;
    selectedCell.value = null;
    selectedAsset.value = null;
    assetTab.value = activeWorkspace.value === 'waves' ? 'zombie' : 'plant';
    resetHistory();
  }

  function saveDraftNow() {
    if (!draftReady || !draftDirty || draftRestoreError.value) return;
    clearTimeout(draftSaveTimer);
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(captureProject()));
      draftSaveError.value = false;
      draftDirty = false;
    } catch { draftSaveError.value = true; }
  }

  function saveHiddenDraft() {
    if (document.visibilityState === 'hidden') saveDraftNow();
  }

  function scheduleDraftSave() {
    if (!draftReady) return;
    draftDirty = true;
    clearTimeout(draftSaveTimer);
    draftSaveTimer = setTimeout(saveDraftNow, 350);
  }

  function exportProject() {
    const blob = new Blob([unreadableDraft || JSON.stringify(captureProject(), null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${draft.value.name || 'custom_level'}.project.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function closeProjectMenu() {
    document.querySelector('.level-editor-shell .project-menu')?.removeAttribute('open');
  }

  const selectedGenerator = computed(() => getGeneratorObjects(draft.value.unsupportedRawObjects)
    .find((object) => object.aliases?.includes(selectedGeneratorAlias.value)));

  const waveAssetTarget = computed(() => {
    if (generatorEditorOpen.value || isEndlessMode.value) {
      const generator = selectedGenerator.value;
      const key = generator?.objclass === 'DangerRoomJitteredWaveGenerator' ? generatorPoolTarget.value : 'ZombiePool';
      return { kind: 'generator' as const, label: t(`generatorField_${key}`), generator, key };
    }
    if (expandedWaveActionKey.value === 'difficulty') {
      return { kind: 'difficulty' as const, label: t('difficultyLevel', { level: selectedDynamicDifficulty.value }) };
    }
    const entry = selectedWave.value?.rawActions.find((item) => `raw:${item.id}` === expandedWaveActionKey.value);
    const action = selectedWaveEvent(entry, selectedSchedulerChildAliases.value, parseCurrentLevelAlias, getWaveSupportObject);
    if (action) {
      const labelKey = getWaveActionDefinitionByClass(action.objclass)?.labelKey;
      return { kind: isZombiePoolEvent(action) ? 'pool' as const : 'select' as const, action, label: labelKey ? t(labelKey) : action.objclass };
    }
    return { kind: 'spawn' as const, label: selectedSpawnRow.value ? t('rowNumber', { row: selectedSpawnRow.value }) : t('randomRow') };
  });

  const seedDeck = computed(() => {
    const target = seedListTarget.value;
    return target === 'Recommended' || target === 'Challenging'
      ? getCardDecks(draft.value.seedBankExtra, target)[selectedDeckIndex.value] : undefined;
  });
  const libraryTarget = computed(() => {
    if (activeWorkspace.value === 'waves') {
      const target = waveAssetTarget.value;
      if (target.kind === 'generator' || target.kind === 'difficulty') return target.label;
      const wave = t('selectedWaveNumber', { wave: draft.value.waves.indexOf(selectedWave.value!) + 1 });
      return `${wave} · ${target.label}`;
    }
    if (activeWorkspace.value !== 'seed') return '';
    if (draft.value.conveyor.enabled) return t('conveyorInitialPlants');
    const target = seedListTarget.value;
    if (target === 'Recommended' || target === 'Challenging') {
      const label = t(target === 'Recommended' ? 'recommendedDecks' : 'challengingDecks');
      return seedDeck.value ? `${label} · ${seedDeck.value.Name?.[deckNameLanguage.value] || t('deckNumber', { index: selectedDeckIndex.value + 1 })}` : t('createDeckFirst');
    }
    return t(target === 'seedPlants' ? draft.value.seedMode === 'preset' ? 'seedPreset' : 'lockedPlants' : target);
  });
  const libraryAddDisabled = computed(() => activeWorkspace.value === 'seed' && !draft.value.conveyor.enabled
    && ['Recommended', 'Challenging'].includes(seedListTarget.value) && !Array.isArray(seedDeck.value?.Plants));

  function addZombieToTarget(asset: AssetOption) {
    const target = waveAssetTarget.value;
    if (target.kind === 'generator' && !target.generator) return;
    selectedAsset.value = asset;
    inspectorTab.value = 'edit';
    if (target.kind === 'generator') {
      runEdit('generator.addZombie', () => {
        target.generator.objdata[target.key] ??= [];
        target.generator.objdata[target.key].push(toZombieTypeReference(asset.code));
      });
    } else if (target.kind === 'difficulty') addSelectedZombieToDynamicPool();
    else if (target.kind === 'pool') addSelectedZombieToEvent(target.action);
    else if (target.kind === 'spawn') addZombieToWave(asset.code);
    if (target.kind !== 'select') rememberZombie(asset.code);
    activePane.value = ['difficulty', 'pool', 'select'].includes(target.kind) ? 'properties' : 'editor';
  }

  function chooseAsset(asset: AssetOption) {
    selectedAsset.value = asset;
    inspectorTab.value = 'edit';
    activePane.value = activeWorkspace.value === 'assets' ? 'properties' : 'editor';
    if (activeWorkspace.value === 'waves' && asset.kind === 'zombie') {
      addZombieToTarget(asset);
      return;
    }
    if (activeWorkspace.value === 'seed' && asset.kind === 'plant') {
      if (draft.value.conveyor.enabled) addSelectedConveyorPlant();
      else if (seedListTarget.value === 'Recommended' || seedListTarget.value === 'Challenging') {
        if (Array.isArray(seedDeck.value?.Plants)) runEdit('deck.addPlant', () => seedDeck.value.Plants.push(asset.code));
      } else addSelectedPlantToList(seedListTarget.value);
      return;
    }
    if (activeWorkspace.value === 'board') {
      selectedCell.value = null;
      if (boardTool.value !== 'protect' || asset.kind !== 'plant') boardTool.value = 'place';
    }
    if (asset.kind === 'plant') {
      seedActionHint.value = '';
      conveyorActionHint.value = '';
    }
    if (asset.kind === 'zombie') rememberZombie(asset.code);
  }

  function showMoreAssets() {
    assetVisibleLimit.value = Math.min(currentAssetOptions.value.length, assetVisibleLimit.value + ASSET_PAGE_SIZE);
  }

  function getObjectOption(code: string) {
    return objectOptions.find((item) => item.code === code || item.alias === code);
  }

  function addSelectedPlantToList(listKey: PlantListKey) {
    if (!selectedPlantAsset.value) {
      seedActionHint.value = 'selectPlantFirst';
      return;
    }
    const list = draft.value[listKey];
    if (list.includes(selectedPlantAsset.value.code) && (listKey !== 'seedPlants' || draft.value.seedMode !== 'preset')) {
      seedActionHint.value = 'plantAlreadyAdded';
      return;
    }
    if (listKey === 'seedPlants' && list.length >= seedPlantLimit.value) {
      message.warning(t('seedLimit', { count: seedPlantLimit.value }));
      return;
    }
    seedActionHint.value = '';
    list.push(selectedPlantAsset.value.code);
  }

  function removePlantFromList(listKey: PlantListKey, index: number) {
    draft.value[listKey].splice(index, 1);
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

  function markWaveSystemEdited(conveyorOrderChanged = false) {
    draft.value.hasWaveManager = true;
    draft.value.preserveGeneratorWaves = false;
    draft.value.preserveCustomWaveManager = false;
    draft.value.waveSystemDirty = true;
    if (conveyorOrderChanged && draft.value.conveyor.enabled && draft.value.conveyor.originalActionObjects.length) {
      draft.value.conveyor.preserveOriginal = false;
      draft.value.conveyor.dirty = true;
    }
  }

  function toggleGeneratorEditor() {
    const generators = getGeneratorObjects(draft.value.unsupportedRawObjects);
    if (!generators.some((object: any) => object.aliases?.includes(selectedGeneratorAlias.value))) selectedGeneratorAlias.value = generators[0]?.aliases?.[0] || '';
    eventPickerOpen.value = false;
    inspectorTab.value = 'edit';
    generatorEditorOpen.value = !generatorEditorOpen.value;
    generatorPoolTarget.value = 'ZombiePool';
  }

  function mutate_createPointGenerator() {
    if (draft.value.levelExtra.IsDangerRoom || draft.value.levelExtra.IsDangerRoomMiniGame) {
      message.warning(t('generatorNewNormalLevel'));
      return;
    }
    Modal.confirm({
      wrapClassName: 'level-editor-modal-root', title: t('generatorCreate'), content: t('generatorReplaceDescription'),
      okText: t('generatorCreate'), cancelText: t('cancel'),
      onOk: () => {
        const oldGenerators = getGeneratorObjects(draft.value.unsupportedRawObjects).filter((object: any) => object.objclass === 'LevelOfTheDayModuleProperties');
        const aliases = [...oldGenerators.flatMap((object: any) => object.aliases || []),
        ...(getImportedObjectsByClass(importedLevelSnapshot, 'WaveManagerModuleProperties')[0]?.aliases || ['NewWaves'])];
        draft.value.moduleRefs = draft.value.moduleRefs.filter((reference) => !aliases.some((alias: string) => reference === `RTID(${alias}@CurrentLevel)`));
        draft.value.unsupportedRawObjects = draft.value.unsupportedRawObjects.filter((object) => !oldGenerators.includes(object));
        markWaveSystemEdited(true);
        draft.value.preservedStaticWaveObjects = [];
        draft.value.waveSupportObjects = [];
        draft.value.waves = Array.from({ length: 10 }, (_, index) => createEmptyWave(index + 1));
        delete draft.value.waveManagerModuleExtra.DynamicZombies;
        const alias = createUniqueWaveActionAlias('EditorPointWaveGenerator');
        draft.value.unsupportedRawObjects.push({
          aliases: [alias], objclass: 'LevelOfTheDayModuleProperties', objdata: {
            WaveManagerProps: `RTID(${draft.value.waveManagerAlias}@CurrentLevel)`, StartingPoints: 100, PointIncrementPerWave: 30,
            WavesPerFlag: draft.value.flagWaveInterval, PlantfoodToSpawnCount: 2, ZombiePool: ['RTID(mummy@ZombieTypes)']
          }
        });
        draft.value.moduleRefs.push(`RTID(${alias}@CurrentLevel)`);
        selectedGeneratorAlias.value = alias;
        generatorPoolTarget.value = 'ZombiePool';
        generatorEditorOpen.value = true;
        selectedWaveId.value = draft.value.waves[0].id;
        syncWaveFlags();
      }
    });
  }

  function getDynamicZombieSlots() {
    const slots = draft.value.waveManagerModuleExtra?.DynamicZombies;
    return Array.isArray(slots) ? slots : [];
  }

  function getDynamicZombieSlot(level = selectedDynamicDifficulty.value) {
    const slot = getDynamicZombieSlots()[level - 1];
    return slot && typeof slot === 'object' && !Array.isArray(slot) ? slot : {};
  }

  function isDynamicZombieSlotConfigured(level: number) {
    return Object.keys(getDynamicZombieSlot(level)).length > 0;
  }

  function commitDynamicZombieSlots(slots: Record<string, any>[]) {
    if (!draft.value.supportsDynamicZombies) return;
    draft.value.waveManagerModuleExtra = {
      ...draft.value.waveManagerModuleExtra,
      DynamicZombies: slots
    };

    if (draft.value.preservedStaticWaveObjects.length) {
      draft.value.preservedStaticWaveObjects = draft.value.preservedStaticWaveObjects.map((object) =>
        object?.objclass === 'WaveManagerModuleProperties'
          ? setDynamicZombiesOnModuleObject(object, slots)
          : object
      );
    }

    if (draft.value.preserveGeneratorWaves && draft.value.preservedWaveManagerModule) {
      draft.value.preservedWaveManagerModule = setDynamicZombiesOnModuleObject(draft.value.preservedWaveManagerModule, slots);
    }
  }

  function updateDynamicZombieSlots(updater: (slots: Record<string, any>[]) => void) {
    const slots = cloneJson(getDynamicZombieSlots());
    while (slots.length < 7) slots.push({});
    updater(slots);
    commitDynamicZombieSlots(slots);
  }

  function configureDynamicZombieSlot(level = selectedDynamicDifficulty.value) {
    updateDynamicZombieSlots((slots) => {
      if (Object.keys(slots[level - 1] || {}).length) return;
      slots[level - 1] = {
        StartingWave: 0,
        StartingPoints: 0,
        PointIncrementPerWave: 0,
        ZombiePool: []
      };
    });
    expandedWaveActionKey.value = 'difficulty';
  }

  function clearDynamicZombieSlot(level = selectedDynamicDifficulty.value) {
    Modal.confirm({
      wrapClassName: 'level-editor-modal-root',
      title: t('clearDifficulty', { level }),
      content: t('clearDifficultyDescription', { level }),
      okText: t('clearDifficulty', { level }),
      cancelText: t('cancel'),
      okType: 'danger',
      centered: true,
      onOk: () => {
        updateDynamicZombieSlots((slots) => {
          slots[level - 1] = {};
        });
        nextTick(() => {
          document.querySelector<HTMLElement>(`[data-difficulty-level="${level}"]`)?.focus();
        });
      }
    });
  }

  function getDynamicNumberInputValue(field: DynamicZombieNumberField) {
    const raw = getDynamicZombieSlot()[field];
    if (typeof raw !== 'number' || !Number.isFinite(raw)) return '';
    return field === 'StartingWave' ? raw + 1 : raw;
  }

  function getDynamicNumberPlaceholder(field: DynamicZombieNumberField) {
    const raw = getDynamicZombieSlot()[field];
    return raw !== undefined && (typeof raw !== 'number' || !Number.isFinite(raw)) ? String(raw) : '';
  }

  function updateDynamicZombieNumber(field: DynamicZombieNumberField, text: string) {
    updateDynamicZombieSlots((slots) => {
      const index = selectedDynamicDifficulty.value - 1;
      const slot = { ...(slots[index] || {}) };
      if (!text.trim()) delete slot[field];
      else {
        const value = Number(text);
        if (!Number.isFinite(value)) return;
        slot[field] = field === 'StartingWave' ? Math.max(1, Math.round(value)) - 1 : value;
      }
      slots[index] = slot;
    });
  }

  function getDynamicZombiePoolGroups(level = selectedDynamicDifficulty.value) {
    const pool = getDynamicZombieSlot(level).ZombiePool;
    return Array.isArray(pool) ? groupZombiePoolReferences(pool) : [];
  }

  function writeDynamicZombiePoolGroups(groups: { code: string; rawValues: any[]; }[]) {
    updateDynamicZombieSlots((slots) => {
      const index = selectedDynamicDifficulty.value - 1;
      const slot = { ...(slots[index] || {}) };
      slot.ZombiePool = serializeZombiePoolGroups(groups);
      slots[index] = slot;
    });
  }

  function mutate_setDynamicZombiePoolCount(groupIndex: number, count: number) {
    writeDynamicZombiePoolGroups(resizeZombiePoolGroup(getDynamicZombiePoolGroups(), groupIndex, count));
  }

  function removeDynamicZombiePoolGroup(groupIndex: number) {
    const groups = getDynamicZombiePoolGroups();
    groups.splice(groupIndex, 1);
    writeDynamicZombiePoolGroups(groups);
  }

  function mutate_addSelectedZombieToDynamicPool() {
    if (!selectedZombieAsset.value) {
      dynamicZombieActionHint.value = 'selectZombieFirst';
      return;
    }
    dynamicZombieActionHint.value = '';
    if (!isDynamicZombieSlotConfigured(selectedDynamicDifficulty.value)) configureDynamicZombieSlot();
    updateDynamicZombieSlots((slots) => {
      const index = selectedDynamicDifficulty.value - 1;
      const slot = { ...(slots[index] || {}) };
      const pool = Array.isArray(slot.ZombiePool) ? [...slot.ZombiePool] : [];
      pool.push(toZombieTypeReference(selectedZombieAsset.value!.code));
      slot.ZombiePool = pool;
      slots[index] = slot;
    });
  }

  function selectDynamicDifficulty(level: number, shouldOpen = true) {
    selectedDynamicDifficulty.value = Math.min(7, Math.max(1, level));
    if (shouldOpen) expandedWaveActionKey.value = 'difficulty';
  }

  function handleDynamicDifficultyKeydown(event: KeyboardEvent, level: number) {
    let nextLevel = level;
    if (event.key === 'ArrowLeft') nextLevel = level === 1 ? 7 : level - 1;
    else if (event.key === 'ArrowRight') nextLevel = level === 7 ? 1 : level + 1;
    else if (event.key === 'Home') nextLevel = 1;
    else if (event.key === 'End') nextLevel = 7;
    else return;
    event.preventDefault();
    selectDynamicDifficulty(nextLevel);
    nextTick(() => document.querySelector<HTMLElement>(`[data-difficulty-level="${nextLevel}"]`)?.focus());
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

  function mutate_addWave() {
    if (draft.value.preserveGeneratorWaves || draft.value.preserveCustomWaveManager) {
      Modal.confirm({
        wrapClassName: 'level-editor-modal-root', title: t('replaceWaveSystem'),
        content: t('replaceWaveSystemDescription'), okText: t('replaceWaveSystem'), cancelText: t('cancel'),
        onOk: () => {
          markWaveSystemEdited();
          addWave();
        }
      });
      return;
    }
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

  function mutate_insertWaveAfter(id: number) {
    const index = draft.value.waves.findIndex((wave) => wave.id === id);
    if (index < 0) return;
    markWaveSystemEdited(true);
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

  function mutate_duplicateWave(id: number) {
    const index = draft.value.waves.findIndex((wave) => wave.id === id);
    if (index < 0) return;
    const source = draft.value.waves[index];
    const sourceWaveNumber = index + 1;
    const insertedWaveNumber = sourceWaveNumber + 1;
    const sourceConveyorModifications = draft.value.conveyor.waveModifications
      .filter((modification) => modification.waveIndex === sourceWaveNumber)
      .map((modification) => cloneJson(modification));
    markWaveSystemEdited(true);

    const rawActionIdMap = new Map<number, number>();
    const rawActions = source.rawActions.map((action, actionIndex) => {
      const clonedAction = cloneRawWaveActionWithSupport(
        action,
        `${action.alias || `Wave${sourceWaveNumber}Action${actionIndex}`}Copy${actionIndex + 1}`
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

  function mutate_moveWave(id: number, direction: -1 | 1) {
    const fromIndex = draft.value.waves.findIndex((wave) => wave.id === id);
    const toIndex = fromIndex + direction;
    if (fromIndex < 0 || toIndex < 0 || toIndex >= draft.value.waves.length) return;
    markWaveSystemEdited(true);
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

  function mutate_removeWave(id: number) {
    if (draft.value.waves.length <= 1) return;
    const removedIndex = draft.value.waves.findIndex((wave) => wave.id === id);
    if (removedIndex < 0) return;
    markWaveSystemEdited(true);
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
    pruneWaveSupportObjects();
  }

  function mutate_addZombieToWave(code: string, row = selectedSpawnRow.value) {
    if (!selectedWave.value) return;
    markWaveSystemEdited();
    const zombie = zombieOptions.value.find((item) => item.code === code || item.alias === code);
    if (!zombie) return;
    if (!selectedWave.value.actionOrder.some((entry) => entry.kind === 'zombies')) {
      selectedWave.value.actionOrder.push({ kind: 'zombies' });
    }
    selectedWave.value.zombies.push({ id: nextZombieId.value++, code: zombie.code, label: zombie.name, count: 1, row });
    rememberZombie(code);
    expandedWaveActionKey.value = 'zombies';
  }

  function rememberZombie(code: string) {
    if (!recentZombieCodes.value.includes(code)) recentZombieCodes.value = [...recentZombieCodes.value, code].slice(-12);
  }

  function getZombieDisplayName(code: string, fallback: string) {
    return zombieOptions.value.find((item) => item.code === code || item.alias === code)?.name || fallback || code;
  }

  function getPlantDisplayName(code: string) {
    return plantOptions.value.find((item) => item.code === code || item.alias === code)?.name || code;
  }

  function getObjectDisplayName(code: string) {
    return getObjectOption(code)?.name || code;
  }

  function getBoardItemImage(item: BoardItem) {
    if (item.kind === 'plant') return plantOptions.value.find((plant) => plant.code === item.code)?.image || '';
    if (item.kind === 'zombie') return zombieOptions.value.find((zombie) => zombie.code === item.code || zombie.alias === item.code)?.image || '';
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

  function getBossAtCell(row: number, col: number) {
    const binding = specialBindings.value.find((binding: any) => binding.kind === 'boss' &&
      Number(binding.object.objdata?.ZombossSpawnGridPosition?.mX) === col && Number(binding.object.objdata?.ZombossSpawnGridPosition?.mY) === row);
    if (!binding) return null;
    return { binding, asset: zombieOptions.value.find((asset) => asset.code === binding.object.objdata.ZombossMechType) };
  }

  function getBoardItemChip(item: BoardItem) {
    if (item.kind === 'plant') return 'P';
    if (item.kind === 'zombie') return 'Z';
    if (item.category === 'tile') return 'T';
    if (item.category === 'tombstone') return 'G';
    return 'O';
  }

  function normalizeWaveRefs(entry: unknown) {
    return Array.isArray(entry) ? entry.filter(Boolean).map(String) : entry ? [String(entry)] : [];
  }

  function parseWaveZombieGroups(zombieEntries: any[]) {
    return groupZombieEntries(zombieEntries).map((group: any) => {
      const code = group.code || 'mummy';
      const option = zombieOptions.value.find((item) => item.code === code || item.alias === code);
      return {
        ...group,
        id: nextZombieId.value++,
        label: option?.name || code
      };
    });
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

  function mutate_removeZombieFromWave(id: number) {
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
    draft.value.waveSupportObjects.forEach((action) => {
      used.add(action.alias);
      (action.originalObject?.aliases || []).forEach((alias: string) => used.add(String(alias)));
    });
    if (!used.has(base)) return base;
    let index = 1;
    while (used.has(`${base}_${index}`)) index++;
    return `${base}_${index}`;
  }

  function getWaveSupportObject(alias: string) {
    return draft.value.waveSupportObjects.find(
      (action) => action.alias === alias || (action.originalObject?.aliases || []).includes(alias)
    );
  }

  function remapCurrentLevelReferences(value: any, aliases: Map<string, string>): any {
    if (typeof value === 'string') {
      const alias = parseCurrentLevelAlias(value);
      return alias && aliases.has(alias) ? `RTID(${aliases.get(alias)}@CurrentLevel)` : value;
    }
    if (Array.isArray(value)) return value.map((entry) => remapCurrentLevelReferences(entry, aliases));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, remapCurrentLevelReferences(entry, aliases)]));
    }
    return value;
  }

  function getReachableWaveSupportObjects(rootActions: WaveActionDraft[]) {
    const result: WaveActionDraft[] = [];
    const visited = new Set<string>();
    const pending = rootActions.flatMap((action) => [...collectCurrentLevelReferences(parseActionObjdata(action))]);
    while (pending.length) {
      const alias = pending.shift()!;
      if (!alias || visited.has(alias)) continue;
      visited.add(alias);
      const action = getWaveSupportObject(alias);
      if (!action) continue;
      result.push(action);
      collectCurrentLevelReferences(parseActionObjdata(action)).forEach((reference: string) => {
        if (!visited.has(reference)) pending.push(reference);
      });
    }
    return result;
  }

  function pruneWaveSupportObjects() {
    const roots = draft.value.waves.flatMap((wave) => wave.rawActions);
    const reachable = new Set(getReachableWaveSupportObjects(roots).map((action) => action.id));
    draft.value.waveSupportObjects = draft.value.waveSupportObjects.filter((action) => reachable.has(action.id));
    selectedSchedulerChildAliases.value = Object.fromEntries(
      Object.entries(selectedSchedulerChildAliases.value).filter(([, alias]) => Boolean(getWaveSupportObject(alias)))
    );
  }

  function cloneRawWaveActionWithSupport(action: WaveActionDraft, aliasBase: string) {
    const supportObjects = getReachableWaveSupportObjects([action]);
    const aliasMap = new Map<string, string>();
    const clones: WaveActionDraft[] = [];
    supportObjects.forEach((support, index) => {
      const alias = createUniqueWaveActionAlias(`${support.alias || `Event${index + 1}`}Copy`);
      const sourceAliases = Array.isArray(support.originalObject?.aliases)
        ? support.originalObject.aliases.map(String)
        : [support.alias];
      sourceAliases.forEach((sourceAlias: string) => aliasMap.set(sourceAlias, alias));
      const clone = createRawWaveAction(alias, support.objclass, parseActionObjdata(support));
      draft.value.waveSupportObjects.push(clone);
      clones.push(clone);
    });
    clones.forEach((clone) => {
      clone.objdata = remapCurrentLevelReferences(clone.objdata, aliasMap);
      clone.jsonText = stringifyObjdata(clone.objdata);
    });
    const clonedRoot = createRawWaveAction(
      createUniqueWaveActionAlias(aliasBase),
      action.objclass,
      remapCurrentLevelReferences(parseActionObjdata(action), aliasMap)
    );
    return clonedRoot;
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

  function mutate_moveWaveAction(wave: WaveDraft, entryIndex: number, direction: -1 | 1) {
    const waveIndex = draft.value.waves.findIndex((item) => item.id === wave.id) + 1;
    const order = getEffectiveWaveActionOrder(wave, waveIndex);
    const targetIndex = entryIndex + direction;
    if (targetIndex < 0 || targetIndex >= order.length) return;
    markWaveOrderEdited();
    [order[entryIndex], order[targetIndex]] = [order[targetIndex], order[entryIndex]];
    wave.actionOrder = order;
  }

  function mutate_addWaveAction(kind: AddableWaveActionKind) {
    const wave = selectedWave.value;
    if (!wave) return;
    markWaveSystemEdited();
    const waveIndex = draft.value.waves.findIndex((item) => item.id === wave.id) + 1;
    const template = createWaveActionTemplate(kind, waveIndex);
    if (!template) return;
    const action = createRawWaveAction(createUniqueWaveActionAlias(template.alias), template.objclass, template.objdata);
    wave.rawActions.push(action);
    wave.actionOrder.push({ kind: 'raw', actionId: action.id, alias: action.alias });
    expandedWaveActionKey.value = `raw:${action.id}`;
  }

  function mutate_removeWaveAction(wave: WaveDraft, id: number) {
    markWaveSystemEdited();
    wave.rawActions = wave.rawActions.filter((action) => action.id !== id);
    wave.actionOrder = wave.actionOrder.filter((entry) => !(entry.kind === 'raw' && entry.actionId === id));
    if (expandedWaveActionKey.value === `raw:${id}`) expandedWaveActionKey.value = 'zombies';
    pruneWaveSupportObjects();
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

  function isZombiePoolEvent(action: WaveActionDraft) {
    return (
      action.objclass === 'StormZombieSpawnerProps' ||
      action.objclass === 'SpawnZombiesFromGroundSpawnerProps' ||
      action.objclass === 'SpawnZombiesFromGridItemSpawnerProps'
    );
  }

  function getEventZombieGroups(action: WaveActionDraft): WaveZombie[] {
    const zombies = Array.isArray(action.objdata?.Zombies) ? action.objdata.Zombies : [];
    return groupZombieEntries(zombies).map((group: any, index: number) => ({
      ...group,
      id: index + 1,
      label: getZombieDisplayName(group.code, group.code)
    }));
  }

  function writeEventZombieGroups(action: WaveActionDraft, groups: WaveZombie[]) {
    updateWaveActionData(action, (objdata) => {
      objdata.Zombies = serializeZombieGroups(groups);
    });
  }

  function mutate_setEventZombieCount(action: WaveActionDraft, groupIndex: number, count: number) {
    const groups = getEventZombieGroups(action);
    if (!groups[groupIndex]) return;
    groups[groupIndex].count = Math.max(1, Math.round(count) || 1);
    writeEventZombieGroups(action, groups);
  }

  function removeEventZombieGroup(action: WaveActionDraft, groupIndex: number) {
    const groups = getEventZombieGroups(action);
    groups.splice(groupIndex, 1);
    writeEventZombieGroups(action, groups);
  }

  function mutate_addSelectedZombieToEvent(action: WaveActionDraft) {
    if (!selectedZombieAsset.value) {
      eventZombieActionHint.value = 'selectZombieFirst';
      return;
    }
    eventZombieActionHint.value = '';
    updateWaveActionData(action, (objdata) => {
      const zombies = Array.isArray(objdata.Zombies) ? [...objdata.Zombies] : [];
      zombies.push({ Type: toZombieTypeReference(selectedZombieAsset.value!.code) });
      objdata.Zombies = zombies;
    });
  }

  function mutate_setWaveZombieRow(zombie: WaveZombie, value: string) {
    markWaveSystemEdited();
    zombie.row = value;
    zombie.rowDirty = true;
  }

  function getWaveActionKey(entry: WaveActionOrderEntry) {
    if (entry.kind === 'raw') return `raw:${entry.actionId}`;
    return entry.kind;
  }

  function selectWave(id: number) {
    inspectorTab.value = 'edit';
    generatorEditorOpen.value = false;
    selectedWaveId.value = id;
    const index = draft.value.waves.findIndex((wave) => wave.id === id);
    const wave = draft.value.waves[index];
    const firstEntry = wave ? getEffectiveWaveActionOrder(wave, index + 1)[0] : undefined;
    expandedWaveActionKey.value = firstEntry ? getWaveActionKey(firstEntry) : '';
    eventPickerOpen.value = false;
  }

  function toggleWaveAction(entry: WaveActionOrderEntry) {
    inspectorTab.value = 'edit';
    activePane.value = 'properties';
    const key = getWaveActionKey(entry);
    expandedWaveActionKey.value = key;
  }

  function loadLevelDocument(parsed: any) {
    specialModeEditorOpen.value = false;
    specialModeState.value = { kind: 'boss', reference: '', teamIndex: 0, nameLanguage: language.value };
    unreadableDraft = null;
    draftRestoreError.value = false;
    closeConveyorEditor();
    endlessSettingsOpen.value = false;
    endlessPreviewFloor.value = 1;
    selectedAsset.value = null;
    nextItemId.value = 1;
    nextWaveId.value = 1;
    nextZombieId.value = 1;
    nextWaveActionId.value = 1;
    const importedDraft = parseLevel(parsed);
    draft.value = importedDraft;
    importedLevelSnapshot = createLevelImportSnapshot(parsed, importedDraft);
    importCapability.value = analyzeLevelCapabilities(parsed) as ImportCapabilitySummary;
    selectedWaveId.value = draft.value.waves[0]?.id || 1;
    selectedSchedulerChildAliases.value = {};
    expandedWaveActionKey.value = 'zombies';
    eventPickerOpen.value = false;
    seedListTarget.value = 'seedPlants';
    selectedDeckIndex.value = 0;
    const generators = getGeneratorObjects(draft.value.unsupportedRawObjects);
    selectedGeneratorAlias.value = generators[0]?.aliases?.[0] || '';
    generatorPoolTarget.value = 'ZombiePool';
    generatorEditorOpen.value = isEndlessMode.value || generators.length > 0;
    selectedDynamicDifficulty.value = 4;
    dynamicZombieActionHint.value = '';
    eventZombieActionHint.value = '';
    resetBoardTools();
    selectedCell.value = null;
    resetHistory();
    scheduleDraftSave();
  }

  function handleUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON5.parse(String(reader.result || '{}').replace(/^\uFEFF/, ''));
        if (parsed?.kind === PROJECT_KIND) {
          restoreProject(readProjectState(parsed));
          scheduleDraftSave();
          message.success(t('imported'));
          return;
        }
        if (!validateLevelDocument(parsed)) {
          message.error(t('importInvalidStructure'));
          return;
        }
        loadLevelDocument(parsed);
        message.success(t('imported'));
      } catch (error) {
        message.error(t('importFailed'));
      }
    };
    reader.readAsText(file);
    return false;
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
    trackEvent('tool_complete', {
      tool_action: 'export',
      tool_name: 'level_editor',
      warning_count: validationSummary.value.warnings
    });
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

  const {
    resetBoardTools, selectBoardTool, selectBoardPowerGroup, editObjectiveOnBoard,
    selectObjectiveCell, boardToolLabel, getAssetLayer, getBoardItemLayer, itemsAt,
    setBoardItemExtra, setBoardItemIcecubed, setBoardItemPlantfood, editablePlacementExtraKeys,
    preservedPlacementExtraEntries, formatPlacementExtraValue, editBoardCell, placeAsset,
    clearSelectedCell, removeBoardItem, clearBoardItems
  } = createBoardEditing({ selectedCell, boardTool, selectedBoardTargetId, boardPowerGroup, boardPowerDelay, assetTab, selectedAsset, activePane, inspectorTab, draft, selectedCellItems, selectedPlantAsset, boardReservedAliases, nextItemId, switchWorkspace, t, runEdit });

  const {
    parseLevel, parseCurrentLevelAlias, parseLevelModuleAlias, parseStageReference,
    parseTypeAlias, parsePlantReference, toPlantTypeRef, getPlacementExtra,
    serializeBoardPlacement, serializeWaveZombies, compactUndefinedValues,
    serializeConveyorPlantEntry, serializeConveyorWaveEntry, buildConveyorWaveObjdata,
    serializeWaveActionObject, serializeConveyorData, replaceModuleGroup, setModuleRef,
    buildModuleRefs, serializeLevel, uniqueRefs, getKnownCurrentLevelAliases
  } = createDocumentCodec({ createEmptyWave, normalizeWaveRefs, omitKeys, parseWaveZombieGroups, parseConveyorWaveModifications, createRawWaveAction, getObjectOption, nextItemId, getObjectDisplayName, getPlantDisplayName, getZombieDisplayName, MAX_SEED_PLANTS, nextWaveId, parseConveyorDraft, cloneJson, parseActionObjdata, draft, NEW_WAVES_REF, mowerOptions, STAGE_DEFAULT_MOWER, NO_MODULE, sunDropperOptions, seedPlantLimit, activePointGenerator, parseOptionalArrayText, getEffectiveWaveActionOrder, getReachableWaveSupportObjects, normalizeFlagWaveIntervalMagnitude, getImportedLevelSnapshot: () => importedLevelSnapshot });

  function addWave(...args: Parameters<typeof mutate_addWave>) { return runEdit('addWave', () => mutate_addWave(...args)); }
  function insertWaveAfter(...args: Parameters<typeof mutate_insertWaveAfter>) { return runEdit('insertWaveAfter', () => mutate_insertWaveAfter(...args)); }
  function duplicateWave(...args: Parameters<typeof mutate_duplicateWave>) { return runEdit('duplicateWave', () => mutate_duplicateWave(...args)); }
  function moveWave(...args: Parameters<typeof mutate_moveWave>) { return runEdit('moveWave', () => mutate_moveWave(...args)); }
  function removeWave(...args: Parameters<typeof mutate_removeWave>) { return runEdit('removeWave', () => mutate_removeWave(...args)); }
  function addZombieToWave(...args: Parameters<typeof mutate_addZombieToWave>) { return runEdit('addZombieToWave', () => mutate_addZombieToWave(...args)); }
  function setWaveZombieRow(...args: Parameters<typeof mutate_setWaveZombieRow>) { return runEdit('setWaveZombieRow', () => mutate_setWaveZombieRow(...args)); }
  function removeZombieFromWave(...args: Parameters<typeof mutate_removeZombieFromWave>) { return runEdit('removeZombieFromWave', () => mutate_removeZombieFromWave(...args)); }
  function addWaveAction(...args: Parameters<typeof mutate_addWaveAction>) { return runEdit('addWaveAction', () => mutate_addWaveAction(...args)); }
  function removeWaveAction(...args: Parameters<typeof mutate_removeWaveAction>) { return runEdit('removeWaveAction', () => mutate_removeWaveAction(...args)); }
  function moveWaveAction(...args: Parameters<typeof mutate_moveWaveAction>) { return runEdit('moveWaveAction', () => mutate_moveWaveAction(...args)); }
  function addSelectedZombieToEvent(...args: Parameters<typeof mutate_addSelectedZombieToEvent>) { return runEdit('addSelectedZombieToEvent', () => mutate_addSelectedZombieToEvent(...args)); }
  function addSelectedZombieToDynamicPool(...args: Parameters<typeof mutate_addSelectedZombieToDynamicPool>) { return runEdit('addSelectedZombieToDynamicPool', () => mutate_addSelectedZombieToDynamicPool(...args)); }
  function setEventZombieCount(...args: Parameters<typeof mutate_setEventZombieCount>) { return runEdit('setEventZombieCount', () => mutate_setEventZombieCount(...args)); }
  function setDynamicZombiePoolCount(...args: Parameters<typeof mutate_setDynamicZombiePoolCount>) { return runEdit('setDynamicZombiePoolCount', () => mutate_setDynamicZombiePoolCount(...args)); }
  function createPointGenerator(...args: Parameters<typeof mutate_createPointGenerator>) { return runEdit('createPointGenerator', () => mutate_createPointGenerator(...args)); }
  function localizeSpecial(...args: Parameters<typeof mutate_localizeSpecial>) { return runEdit('localizeSpecial', () => mutate_localizeSpecial(...args)); }
  function removeSpecialMode(...args: Parameters<typeof mutate_removeSpecialMode>) { return runEdit('removeSpecialMode', () => mutate_removeSpecialMode(...args)); }

  return {
    localAssetOptions, createAssetVariant, runEdit, editCommands,
    activePane, inspectorTab, focused,
    MAX_SEED_PLANTS,
    ASSET_PAGE_SIZE,
    STAGE_DEFAULT_MOWER,
    NO_MODULE,
    NEW_WAVES_REF,
    DEFAULT_MODULE_REFS,
    messages,
    providedLanguage,
    previewOpen,
    EXPERT_MODE_STORAGE_KEY,
    workspaceViews,
    activeWorkspace,
    validationOpen,
    draftSaveError,
    draftRestoreError,
    recentZombieCodes,
    selectedSpawnRow,
    expertMode,
    assetTab,
    objectCategory,
    assetSearch,
    assetVisibleLimit,
    selectedAsset,
    selectedCell,
    boardTool,
    selectedBoardTargetId,
    boardPowerGroup,
    boardPowerDelay,
    selectedWaveId,
    newSchedulerChildKind,
    selectedSchedulerChildAliases,
    newGravestoneType,
    newGridItemSpawnType,
    expandedWaveActionKey,
    selectedDynamicDifficulty,
    seedListTarget,
    selectedDeckIndex,
    deckNameLanguage,
    eventPickerOpen,
    sharedNarrativeCatalog,
    generatorEditorOpen,
    selectedGeneratorAlias,
    generatorPoolTarget,
    endlessTemplateOpen,
    endlessSettingsOpen,
    endlessCatalogLoading,
    newEndlessWorld,
    endlessWorldOptions,
    endlessSharedObjects,
    endlessProgressOptions,
    endlessPreviewFloor,
    specialModeEditorOpen,
    specialModeState,
    specialTemplateOpen,
    specialTemplatesLoading,
    specialTemplates,
    newSpecialKind,
    newSpecialTemplateId,
    nextItemId,
    nextWaveId,
    nextZombieId,
    nextWaveActionId,
    importCapability,
    mowerOptions,
    sunDropperOptions,
    objectOptions,
    draft,
    canUndo,
    canRedo,
    resetHistory,
    recordHistory,
    restoreHistory,
    language,
    availableStageOptions,
    plantOptions,
    zombieOptions,
    currentAssetOptions,
    visibleAssetOptions,
    selectedWave,
    selectedCellItems,
    selectedPlantAsset,
    selectedZombieAsset,
    selectedAssetAlmanacPath, waveAssetTarget, libraryTarget, libraryAddDisabled, selectedGenerator,
    seedPlantLimit,
    seedActionHint,
    eventZombieActionHint,
    dynamicZombieActionHint,
    conveyorActionHint,
    conveyorAdvancedTab,
    conveyorEditorOpen,
    conveyorEditorTarget,
    conveyorEditorReturnFocus,
    activePointGenerator,
    narrativeReservedAliases,
    boardReservedAliases,
    specialBindings,
    specialKinds,
    isEndlessMode,
    activeEndlessModule,
    opaqueRawObjects,
    validationItems,
    validationSummary,
    validationState,
    previewJson,
    clearSelectedAsset,
    handleKeydown,
    t,
    localName,
    cloneJson,
    omitKeys,
    stringifyObjdata,
    parseActionObjdata,
    parseOptionalArrayText,
    createEmptyWave,
    createRawWaveAction,
    createDefaultConveyorDraft,
    createDefaultDraft,
    resetDraft,
    loadEndlessCatalog,
    openEndlessTemplate,
    openEndlessSettings,
    createEndlessDraft,
    openSpecialMode,
    localizeSpecial,
    removeSpecialMode,
    openSpecialTemplate,
    specialTemplateLabel,
    createSpecialDraft,
    confirmResetDraft,
    openValidation,
    switchWorkspace,
    handleWorkspaceKeydown,
    resetBoardTools,
    selectBoardTool,
    selectBoardPowerGroup,
    editObjectiveOnBoard,
    selectObjectiveCell,
    boardToolLabel,
    editBoardCell,
    captureProject,
    restoreProject,
    saveDraftNow,
    saveHiddenDraft,
    scheduleDraftSave,
    exportProject,
    closeProjectMenu,
    addZombieToTarget,
    chooseAsset,
    showMoreAssets,
    getObjectOption,
    getAssetLayer,
    getBoardItemLayer,
    placeAsset,
    clearSelectedCell,
    removeBoardItem,
    clearBoardItems,
    itemsAt,
    setBoardItemExtra,
    setBoardItemIcecubed,
    setBoardItemPlantfood,
    editablePlacementExtraKeys,
    preservedPlacementExtraEntries,
    formatPlacementExtraValue,
    addSelectedPlantToList,
    removePlantFromList,
    markConveyorEdited,
    setConveyorEnabled,
    setSeedSupplyMode,
    setOptionalNumber,
    setRequiredNumber,
    addSelectedConveyorPlant,
    removeConveyorPlant,
    addConveyorCondition,
    removeConveyorCondition,
    addConveyorWaveModification,
    setConveyorWaveMode,
    removeConveyorWaveModification,
    openConveyorEditor,
    closeConveyorEditor,
    normalizeConveyorEditorAfterRemoval,
    getConveyorEditorEntry,
    getPlantOption,
    getPlantDisplayImage,
    conveyorEditorTitle,
    markWaveSystemEdited,
    toggleGeneratorEditor,
    createPointGenerator,
    getDynamicZombieSlots,
    getDynamicZombieSlot,
    isDynamicZombieSlotConfigured,
    commitDynamicZombieSlots,
    updateDynamicZombieSlots,
    configureDynamicZombieSlot,
    clearDynamicZombieSlot,
    getDynamicNumberInputValue,
    getDynamicNumberPlaceholder,
    updateDynamicZombieNumber,
    getDynamicZombiePoolGroups,
    writeDynamicZombiePoolGroups,
    setDynamicZombiePoolCount,
    removeDynamicZombiePoolGroup,
    addSelectedZombieToDynamicPool,
    selectDynamicDifficulty,
    handleDynamicDifficultyKeydown,
    syncWaveFlags,
    setFlagWaveInterval,
    normalizeFlagWaveIntervalMagnitude,
    addWave,
    normalizeWaveNames,
    insertWaveAfter,
    duplicateWave,
    moveWave,
    removeWave,
    addZombieToWave,
    rememberZombie,
    getZombieDisplayName,
    getPlantDisplayName,
    getObjectDisplayName,
    getBoardItemImage,
    getBoardItemKindLabel,
    getObjectCategoryLabel,
    getBoardItemTypeLabel,
    getBossAtCell,
    getBoardItemChip,
    normalizeWaveRefs,
    parseWaveZombieGroups,
    parseConveyorPlantEntry,
    parseConveyorWaveModifications,
    parseConveyorDraft,
    removeZombieFromWave,
    createUniqueWaveActionAlias,
    getWaveSupportObject,
    remapCurrentLevelReferences,
    getReachableWaveSupportObjects,
    pruneWaveSupportObjects,
    cloneRawWaveActionWithSupport,
    isPreservingConveyorActions,
    getWaveConveyorOrderEntries,
    getEffectiveWaveActionOrder,
    markWaveOrderEdited,
    moveWaveAction,
    addWaveAction,
    removeWaveAction,
    updateWaveActionJson,
    updateWaveActionData,
    isZombiePoolEvent,
    getEventZombieGroups,
    writeEventZombieGroups,
    setEventZombieCount,
    removeEventZombieGroup,
    addSelectedZombieToEvent,
    setWaveZombieRow,
    getWaveActionKey,
    selectWave,
    toggleWaveAction,
    loadLevelDocument,
    handleUpload,
    parseLevel,
    parseCurrentLevelAlias,
    parseLevelModuleAlias,
    parseStageReference,
    parseTypeAlias,
    parsePlantReference,
    toPlantTypeRef,
    getPlacementExtra,
    serializeBoardPlacement,
    serializeWaveZombies,
    compactUndefinedValues,
    serializeConveyorPlantEntry,
    serializeConveyorWaveEntry,
    buildConveyorWaveObjdata,
    serializeWaveActionObject,
    serializeConveyorData,
    replaceModuleGroup,
    setModuleRef,
    buildModuleRefs,
    serializeLevel,
    uniqueRefs,
    exportLevel,
    openPreview,
    copyPreview,
    getKnownCurrentLevelAliases,
    getImportedLevelSnapshot: () => importedLevelSnapshot
  };
}

export type LevelEditorRuntime = ReturnType<typeof useLevelEditor>;
