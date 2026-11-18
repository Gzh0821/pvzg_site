import { stageOptions } from '../../stage-registry.mjs';

import { getAuthoredContentEditedLevel } from '../../authored-content-codec.mjs';

import { appendPreservedLevelObjects, buildLevelDocument, buildSeedPresetPlants, getImportedObjectsByClass, getLevelRootExtra, getUnchangedImportedLevel, getDefinitionEditedImportedLevel, preserveUneditedDefinitionFields, isImportedDomainUnchanged, normalizePlantCodes, normalizeSeedPlants, normalizeSeedSlots, reconcileLevelObjects } from '../../level-codec.mjs';

import { collectPreservedStaticWaveObjects, collectWaveReferenceGraph, isDetachedZombieSpawnAction, resolveWaveManagerContext, serializeZombieGroups, supportsDynamicZombieEditing } from '../../wave-codec.mjs';
import { parseBoardRuleSystem, serializeBoardRuleSystem, updateBoardRuleModuleRefs } from '../../board-rule-codec.mjs';

import { preserveWaveReferences, getSpawnEditedImportedLevel } from './imported-wave-edits.mjs';
import { parseObjectiveSystem, serializeObjectiveSystem, updateObjectiveModuleRefs } from '../../objective-codec.mjs';

import type { AssetOption, LevelDraft, WaveActionDraft, WaveDraft, ConveyorDraft, ObjectiveSystemDraft, BoardRuleSystemDraft, BoardItem, ConveyorWaveModification, ConveyorPlantEntry, WaveActionOrderEntry, PreservedConveyorWaveAction, WaveZombie, StageReferenceScope } from '../../core/types';
import type { Ref, ComputedRef } from 'vue';
type Bindings = {
  parseConveyorDraft: (object: any, alias: string, originals: any[], modifications: ConveyorWaveModification[]) => ConveyorDraft;
  nextWaveId: Ref<number>;
  MAX_SEED_PLANTS: number;
  getZombieDisplayName: (code: string, fallback: string) => string;
  getPlantDisplayName: (code: string) => string;
  getObjectDisplayName: (code: string) => string;
  nextItemId: Ref<number>;
  getObjectOption: (code: string) => AssetOption | undefined;
  createRawWaveAction: (alias: string, objclass: string, data: Record<string, any>, original?: any) => WaveActionDraft;
  parseConveyorWaveModifications: (data: any, index: number, alias?: string) => ConveyorWaveModification[];
  parseWaveZombieGroups: (entries: any[]) => WaveZombie[];
  omitKeys: (value: any, keys: string[]) => Record<string, any>;
  normalizeWaveRefs: (references: any) => string[];
  createEmptyWave: (index: number, id?: number) => WaveDraft;
  cloneJson: <T>(value: T) => T;
  parseActionObjdata: (action: WaveActionDraft) => Record<string, any>;
  draft: Ref<LevelDraft>;
  NEW_WAVES_REF: string;
  mowerOptions: { value: string; label: string; }[];
  STAGE_DEFAULT_MOWER: string;
  NO_MODULE: string;
  sunDropperOptions: { value: string; label: string; }[];
  seedPlantLimit: ComputedRef<number>;
  activePointGenerator: ComputedRef<any>;
  parseOptionalArrayText: (text: string) => any;
  getEffectiveWaveActionOrder: (wave: WaveDraft, index: number) => WaveActionOrderEntry[];
  getReachableWaveSupportObjects: (actions: WaveActionDraft[]) => WaveActionDraft[];
  normalizeFlagWaveIntervalMagnitude: (value: unknown, fallback?: number) => number;
  getImportedLevelSnapshot: () => any;
};

export function createDocumentCodec(bindings: Bindings) {
  const {
    createEmptyWave, normalizeWaveRefs, omitKeys, parseWaveZombieGroups,
    parseConveyorWaveModifications, createRawWaveAction, getObjectOption, nextItemId,
    getObjectDisplayName, getPlantDisplayName, getZombieDisplayName, MAX_SEED_PLANTS, nextWaveId,
    parseConveyorDraft, cloneJson, parseActionObjdata, draft, NEW_WAVES_REF, mowerOptions,
    STAGE_DEFAULT_MOWER, NO_MODULE, sunDropperOptions, seedPlantLimit, activePointGenerator,
    parseOptionalArrayText, getEffectiveWaveActionOrder, getReachableWaveSupportObjects,
    normalizeFlagWaveIntervalMagnitude, getImportedLevelSnapshot
  } = bindings;

  function parseLevel(raw: any): LevelDraft {
    const objects = Array.isArray(raw?.objects) ? raw.objects : [];
    const level = objects.find((object: any) => object?.objclass === 'LevelDefinition')?.objdata || {};
    const seedObject = objects.find((object: any) => object?.objclass === 'SeedBankProperties');
    const conveyorObject = objects.find((object: any) => object?.objclass === 'ConveyorSeedBankProperties');
    const seed = seedObject?.objdata || {};
    const waveManagerContext = resolveWaveManagerContext(objects);
    const waveManagerModule = waveManagerContext.moduleObject;
    const waveManagerObject = waveManagerContext.managerObject;
    const waveProps = waveManagerObject?.objdata || {};
    const importedFlagWaveInterval = Math.trunc(Number(waveProps.FlagWaveInterval ?? 5));
    const flagWaveInterval = normalizeFlagWaveIntervalMagnitude(importedFlagWaveInterval, 5);
    const levelModules = Array.isArray(level.Modules) ? level.Modules.map(String) : [];
    const stageReference = parseStageReference(level.StageModule);
    const stage = stageReference.alias || 'EgyptStage';
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
    const editableWaveActionAliases = new Set<string>();
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
          editableWaveActionAliases.add(alias);
          const action = createRawWaveAction(
            alias,
            String(waveObject.objclass || 'WaveActionProps'),
            waveObject.objdata || {},
            waveObject
          );
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

    const objectives = parseObjectiveSystem(raw) as ObjectiveSystemDraft;
    const boardRules = parseBoardRuleSystem(raw) as BoardRuleSystemDraft;
    const managedObjectIndexes = new Set([...objectives.ownedObjectIndexes, ...boardRules.ownedObjectIndexes]);
    const waveReferenceGraph = collectWaveReferenceGraph(objects, waveActionAliases);
    const editableWaveReferenceGraph = collectWaveReferenceGraph(objects, editableWaveActionAliases);
    const editableWaveVisitedAliases = new Set<string>(editableWaveReferenceGraph.visitedAliases);
    const waveGraphObjectIndexes = new Set<number>(waveReferenceGraph.objectIndexes);
    const rootWaveObjectIndexes = new Set<number>();
    waveActionAliases.forEach((alias) => {
      const matches = waveReferenceGraph.aliasMatches.get(alias) || [];
      const selectedMatch = matches[matches.length - 1];
      if (selectedMatch) rootWaveObjectIndexes.add(selectedMatch.objectIndex);
    });
    const waveSupportCandidates = editableWaveReferenceGraph.objectIndexes
      .map((objectIndex: number) => {
        const object = objects[objectIndex];
        const aliases = Array.isArray(object?.aliases) ? object.aliases.map(String) : [];
        const hasUniqueIncomingAlias = aliases.some(
          (item: string) => editableWaveVisitedAliases.has(item) && waveReferenceGraph.aliasMatches.get(item)?.length === 1
        );
        return { objectIndex, object, aliases, alias: aliases[0], hasUniqueIncomingAlias };
      })
      .filter(
        ({ aliases, alias, hasUniqueIncomingAlias }: any) =>
          alias && hasUniqueIncomingAlias && !aliases.some((item: string) => waveActionAliases.has(item))
      );
    const waveSupportObjectIndexes = new Set<number>(waveSupportCandidates.map(({ objectIndex }: any) => objectIndex));
    const editableWaveGraphObjectIndexes = new Set<number>([...rootWaveObjectIndexes, ...waveSupportObjectIndexes]);
    const waveSupportObjects = waveSupportCandidates
      .map(({ object, alias }: any) =>
        createRawWaveAction(String(alias), String(object.objclass || 'WaveActionProps'), object.objdata || {}, object)
      );
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
      (object: any, objectIndex: number) => {
        if (managedObjectIndexes.has(objectIndex)) return false;
        if (waveGraphObjectIndexes.has(objectIndex)) return !editableWaveGraphObjectIndexes.has(objectIndex);
        return (
          isDetachedZombieSpawnAction(object, waveActionAliases) ||
          (!supportedClasses.has(object?.objclass) && !(object?.aliases || []).some((alias: string) => waveActionAliases.has(alias)))
        );
      }
    );
    const seedPresetPlants = Array.isArray(seed.PresetPlantList) ? seed.PresetPlantList.map((item: any) => item.PlantType) : [];
    const seedPresetEntries = Array.isArray(seed.PresetPlantList) ? seed.PresetPlantList.map((item: any) => cloneJson(item)) : [];
    const seedSlots = normalizeSeedSlots(seed.OverrideSeedSlotsCount ?? MAX_SEED_PLANTS, seedPresetPlants.length);
    const preserveCustomWaveManager = !!waveManagerObject && !Array.isArray(waveProps.Waves) && !waveManagerModule;
    const preservedStaticWaveObjects = Array.isArray(waveProps.Waves)
      ? collectPreservedStaticWaveObjects(objects, waveManagerModule, waveManagerObject, waveActionAliases)
      : [];
    nextWaveId.value = waves.length + 1;

    return {
      name: String(level.Name || raw?.['#comment'] || 'custom_level_1'),
      author: String(level.WrittenBy || level.WritenBy || raw?.Information?.Author || ''),
      description: String(level.Description || ''),
      stage,
      stageSource: stageReference.scope,
      mower: importedMower ? (importedMower === stageDefaultMower ? STAGE_DEFAULT_MOWER : importedMower) : NO_MODULE,
      sunDropper: importedSunDropper || NO_MODULE,
      startingSun: Number(level.StartingSun ?? 50),
      seedMode: seed.SelectionMethod === 'preset' ? 'preset' : 'chooser',
      overrideSeedSlots: Number(seed.OverrideSeedSlotsCount) > 0,
      seedSlots,
      seedPresetEntries,
      seedPlants: normalizeSeedPlants(seedPresetPlants, seedSlots, true),
      includePlants: normalizePlantCodes(Array.isArray(seed.PlantIncludeList) ? seed.PlantIncludeList : []),
      excludePlants: normalizePlantCodes(Array.isArray(seed.PlantExcludeList) ? seed.PlantExcludeList : []),
      unlockAll: seed.UnlockAll === true,
      hasSeedBank: !!seedObject,
      seedBankExtra: omitKeys(seed, ['SelectionMethod', 'UnlockAll', 'OverrideSeedSlotsCount', 'PresetPlantList', 'PlantIncludeList', 'PlantExcludeList']),
      conveyor: parseConveyorDraft(conveyorObject, conveyorAlias, conveyorActionObjects, conveyorWaveModifications),
      objectives,
      boardRules,
      boardItems,
      waves: waves.length ? waves : [],
      waveSupportObjects,
      flagWaveInterval,
      flagWaveIntervalOriginal: Number.isFinite(importedFlagWaveInterval) && importedFlagWaveInterval !== 0 ? importedFlagWaveInterval : undefined,
      flagWaveIntervalDirty: false,
      firstWaveCountdown: Number(waveProps.ZombieCountdownFirstWaveSecs ?? -1),
      suppressFlagZombie: waveProps.SuppressFlagZombie === true,
      waveSpendingPointIncrement: Number(waveProps.WaveSpendingPointIncrement ?? 10),
      waveSpendingPoints: Number(waveProps.WaveSpendingPoints ?? 100),
      minNextWaveHealthPercentage: Number(waveProps.MinNextWaveHealthPercentage ?? 0.5),
      maxNextWaveHealthPercentage: Number(waveProps.MaxNextWaveHealthPercentage ?? 0.65),
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
      waveManagerAlias:
        waveManagerContext.managerAlias || String(waveManagerObject?.aliases?.[0] || 'WaveManagerProps'),
      waveManagerReferenceOnModule: waveManagerContext.referenceOwner === waveManagerModule,
      supportsDynamicZombies: supportsDynamicZombieEditing(objects, waveManagerModule),
      hasWaveManager: !!waveManagerObject,
      preserveGeneratorWaves: !Array.isArray(waveProps.Waves) && !!waveManagerModule,
      preservedWaveManagerModule: !Array.isArray(waveProps.Waves) && waveManagerModule ? cloneJson(waveManagerModule) : undefined,
      preserveCustomWaveManager,
      preservedWaveManagerObject: preserveCustomWaveManager ? cloneJson(waveManagerObject) : undefined,
      preservedStaticWaveObjects,
      waveSystemDirty: false,
      rootExtra: getLevelRootExtra(raw),
      levelExtra: omitKeys(level, ['Name', 'Description', 'StageModule', 'Modules', 'StartingSun', 'WrittenBy', 'WritenBy']),
      preserveBoardModules: preservedPlacementObjects.length > 0,
      preservedPlacementObjects,
      unsupportedObjects: unsupportedRawObjects.length,
      unsupportedRawObjects,
      moduleRefs: [...levelModules]
    };
  }

  function parseCurrentLevelAlias(value: string) {
    return /^RTID\((.+)@CurrentLevel\)$/.exec(value || '')?.[1] || '';
  }

  function parseLevelModuleAlias(value: string) {
    return /^RTID\((.+)@LevelModules\)$/.exec(value || '')?.[1] || '';
  }

  function parseStageReference(value: string): { alias: string; scope: StageReferenceScope; } {
    const match = /^RTID\((.+)@(LevelModules|CurrentLevel)\)$/.exec(value || '');
    return {
      alias: match?.[1] || '',
      scope: match?.[2] === 'CurrentLevel' ? 'CurrentLevel' : 'LevelModules'
    };
  }

  function parseTypeAlias(value: string) {
    return /^RTID\((.+)@(?:ZombieTypes|PlantTypes)\)$/.exec(value || '')?.[1] || '';
  }

  function parsePlantReference(value: unknown) {
    const text = String(value || '');
    return parseTypeAlias(text) || text;
  }

  function toPlantTypeRef(code: string) {
    if (/^RTID\(.+@CurrentLevel\)$/.test(code)) return code;
    const local = draft.value.unsupportedRawObjects.some((object: any) => object.objclass === 'PlantType' && object.aliases?.includes(code));
    return `RTID(${code}@${local ? 'CurrentLevel' : 'PlantTypes'})`;
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
    return serializeZombieGroups(wave.zombies);
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

  function serializeWaveActionObject(action: WaveActionDraft, alias: string, objdata = parseActionObjdata(action)) {
    const original = cloneJson(action.originalObject || {});
    const originalPrimaryAlias = action.originalObject?.aliases?.[0];
    return {
      ...original,
      aliases: [
        alias,
        ...(Array.isArray(original.aliases)
          ? original.aliases.filter((item: string) => item !== alias && item !== originalPrimaryAlias)
          : [])
      ],
      objclass: action.objclass,
      objdata: cloneJson(objdata || {})
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
    const current = refs.filter((ref) => group.has(ref));
    if (current.length && current.every((ref) => ref === selectedRef)) return [...refs];
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
    return result;
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
    shouldEmitConveyor: boolean,
    waveModuleRef = NEW_WAVES_REF,
    seedBankRef = 'RTID(SeedBank@CurrentLevel)'
  ) {
    const mowerRefs = new Set(
      mowerOptions
        .filter((option) => option.value !== STAGE_DEFAULT_MOWER && option.value !== NO_MODULE)
        .map((option) => `RTID(${option.value}@LevelModules)`)
    );
    const sunDropperRefs = new Set(
      sunDropperOptions.filter((option) => option.value !== NO_MODULE).map((option) => `RTID(${option.value}@LevelModules)`)
    );
    const baseline = getImportedLevelSnapshot()?.draftFingerprint ? JSON.parse(getImportedLevelSnapshot().draftFingerprint) : null;
    let refs = [...draft.value.moduleRefs];
    if (!baseline || baseline.sunDropper !== draft.value.sunDropper) {
      refs = replaceModuleGroup(refs, sunDropperRefs, sunDropperModule !== NO_MODULE ? `RTID(${sunDropperModule}@LevelModules)` : null);
    }
    if (!baseline || (['mower', 'stage', 'stageSource'] as const).some((key) => baseline[key] !== draft.value[key])) {
      refs = replaceModuleGroup(refs, mowerRefs, mowerModule !== NO_MODULE ? `RTID(${mowerModule}@LevelModules)` : null);
    }
    refs = setModuleRef(refs, waveModuleRef, shouldReferenceWaveManager);
    if (!isImportedDomainUnchanged(getImportedLevelSnapshot(), draft.value, 'seed') ||
      baseline?.conveyor.enabled !== draft.value.conveyor.enabled || baseline?.conveyor.alias !== draft.value.conveyor.alias) {
      refs = setModuleRef(refs, seedBankRef, shouldEmitSeedBank && !shouldEmitConveyor);
      refs = replaceModuleGroup(
        refs,
        new Set(['RTID(Conveyor@CurrentLevel)', 'RTID(ConveyorBelt@CurrentLevel)', `RTID(${draft.value.conveyor.alias || 'ConveyorBelt'}@CurrentLevel)`]),
        shouldEmitConveyor ? `RTID(${draft.value.conveyor.alias || 'ConveyorBelt'}@CurrentLevel)` : null
      );
    }
    refs = updateObjectiveModuleRefs(refs, draft.value.objectives);
    refs = updateBoardRuleModuleRefs(refs, draft.value.boardRules);

    if (!draft.value.preserveBoardModules && !isImportedDomainUnchanged(getImportedLevelSnapshot(), draft.value, 'placements')) {
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

    return refs;
  }

  function serializeLevel() {
    const unchangedImportedLevel = getUnchangedImportedLevel(getImportedLevelSnapshot(), draft.value);
    if (unchangedImportedLevel) return unchangedImportedLevel;
    const metadataEditedLevel = getDefinitionEditedImportedLevel(getImportedLevelSnapshot(), draft.value);
    if (metadataEditedLevel) return metadataEditedLevel;
    const spawnEditedLevel = getSpawnEditedImportedLevel(getImportedLevelSnapshot(), draft.value);
    if (spawnEditedLevel) return spawnEditedLevel;
    const authoredContentEditedLevel = getAuthoredContentEditedLevel(getImportedLevelSnapshot(), draft.value);
    if (authoredContentEditedLevel) return authoredContentEditedLevel;

    const importedWaveModule = getImportedObjectsByClass(getImportedLevelSnapshot(), 'WaveManagerModuleProperties')[0];
    const waveModuleAliases = importedWaveModule?.aliases?.length ? importedWaveModule.aliases : ['NewWaves'];
    const waveModuleRef = `RTID(${waveModuleAliases[0]}@CurrentLevel)`;
    const importedSeedBankObjects = getImportedObjectsByClass(getImportedLevelSnapshot(), 'SeedBankProperties');
    const seedBankAliases = importedSeedBankObjects[0]?.aliases?.length ? importedSeedBankObjects[0].aliases : ['SeedBank'];
    const seedBankRef = `RTID(${seedBankAliases[0]}@CurrentLevel)`;
    const stage = stageOptions.find((item) => item.value === draft.value.stage) || stageOptions[2];
    const mowerModule = draft.value.mower === STAGE_DEFAULT_MOWER ? stage.mower : draft.value.mower;
    const sunDropperModule = draft.value.sunDropper;
    const seedSlots = normalizeSeedSlots(seedPlantLimit.value, draft.value.seedPlants.length);
    const normalizedSeedPlants = normalizeSeedPlants(draft.value.seedPlants, seedSlots, draft.value.seedMode === 'preset');
    const preserveGeneratorWaveSystem = draft.value.preserveGeneratorWaves && !draft.value.waves.length && draft.value.preservedWaveManagerModule;
    const preserveCustomWaveManager =
      draft.value.preserveCustomWaveManager && !draft.value.waves.length && draft.value.preservedWaveManagerObject && !draft.value.waveSystemDirty;
    const preserveStaticWaveSystem =
      draft.value.preservedStaticWaveObjects.length > 0 && !draft.value.waveSystemDirty && !draft.value.conveyor.dirty;
    const shouldEmitConveyor = draft.value.conveyor.enabled;
    const shouldPreserveConveyor = shouldEmitConveyor && draft.value.conveyor.preserveOriginal && !draft.value.conveyor.dirty && draft.value.conveyor.originalObject;
    const shouldEmitWaveManager =
      !!preserveGeneratorWaveSystem || !!preserveCustomWaveManager || draft.value.hasWaveManager || draft.value.waves.length > 0;
    const hasPointGenerator = !!activePointGenerator.value;
    const shouldReferenceWaveManager = draft.value.moduleRefs.includes(waveModuleRef) || (!hasPointGenerator && draft.value.waveSystemDirty && draft.value.waves.length > 0);
    const shouldEmitSeedBank =
      !shouldEmitConveyor &&
      (draft.value.hasSeedBank ||
        normalizedSeedPlants.length > 0 ||
        draft.value.includePlants.length > 0 ||
        draft.value.excludePlants.length > 0 ||
        draft.value.unlockAll ||
        draft.value.seedMode === 'preset' ||
        draft.value.overrideSeedSlots ||
        Object.keys(draft.value.seedBankExtra || {}).length > 0);
    const shouldPreserveImportedSeedBank =
      shouldEmitSeedBank &&
      importedSeedBankObjects.length > 0 &&
      isImportedDomainUnchanged(getImportedLevelSnapshot(), draft.value, 'seed');
    const usedActionAliases = new Set<string>([
      ...seedBankAliases,
      'Conveyor',
      'ConveyorBelt',
      draft.value.conveyor.alias || 'ConveyorBelt',
      ...waveModuleAliases,
      draft.value.waveManagerAlias,
      'InitialGridItems',
      'Gravestones',
      'FrozenPlantPlacement',
      'FrozenZombiePlacement',
      ...draft.value.preservedPlacementObjects.flatMap((object) => object?.aliases || []),
      ...draft.value.unsupportedRawObjects.flatMap((object) => object?.aliases || []),
      ...draft.value.waveSupportObjects.flatMap((action) =>
        Array.isArray(action.originalObject?.aliases) ? action.originalObject.aliases.map(String) : [action.alias]
      )
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
    const snapshot = getImportedLevelSnapshot();
    const originalManager = snapshot && resolveWaveManagerContext(snapshot.source.objects).managerObject;
    const originalWaves = originalManager?.objdata?.Waves;
    const baseline = snapshot ? JSON.parse(snapshot.draftFingerprint) : null;
    const originalWaveIndexes = new Map<number, number>(baseline?.waves.map((wave: WaveDraft, index: number) => [wave.id, index]));
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
        waveObjects.push(serializeWaveActionObject(action, alias));
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
      const originalIndex = originalWaveIndexes.get(wave.id);
      return originalIndex === undefined || !Array.isArray(originalWaves) ? refs
        : preserveWaveReferences(originalWaves[originalIndex], baseline.waves[originalIndex].actionOrder, refs);
    });
    getReachableWaveSupportObjects(draft.value.waves.flatMap((wave) => wave.rawActions)).forEach((action) => {
      waveObjects.push(serializeWaveActionObject(action, action.alias));
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
      ...(draft.value.overrideSeedSlots && seedSlots > 0 ? { OverrideSeedSlotsCount: seedSlots } : {}),
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

    if (originalManager && baseline) {
      for (const [field, key] of [
        ['MinNextWaveHealthPercentage', 'minNextWaveHealthPercentage'], ['MaxNextWaveHealthPercentage', 'maxNextWaveHealthPercentage'],
        ['WaveSpendingPointIncrement', 'waveSpendingPointIncrement'], ['WaveSpendingPoints', 'waveSpendingPoints'],
        ['FlagWaveInterval', 'flagWaveInterval'], ['SuppressFlagZombie', 'suppressFlagZombie'], ['ZombieCountdownFirstWaveSecs', 'firstWaveCountdown']
      ] as const) {
        if (baseline[key] !== draft.value[key] || (key === 'flagWaveInterval' && draft.value.flagWaveIntervalDirty)) continue;
        if (Object.hasOwn(originalManager.objdata, field)) waveManagerData[field] = originalManager.objdata[field];
        else delete waveManagerData[field];
      }
      if (baseline.waves.length === draft.value.waves.length) {
        if (Object.hasOwn(originalManager.objdata, 'WaveCount')) waveManagerData.WaveCount = originalManager.objdata.WaveCount;
        else delete waveManagerData.WaveCount;
      }
    }

    const objects: any[] = [
      {
        objclass: 'LevelDefinition',
        objdata: {
          ...draft.value.levelExtra,
          Name: draft.value.name,
          Description: draft.value.description,
          StartingSun: Number(draft.value.startingSun) || 0,
          StageModule: `RTID(${draft.value.stage}@${draft.value.stageSource})`,
          Modules: buildModuleRefs(
            mowerModule,
            sunDropperModule,
            shouldReferenceWaveManager,
            generatedBoardRefs,
            shouldEmitSeedBank,
            shouldEmitConveyor,
            waveModuleRef,
            seedBankRef
          ),
          ...(draft.value.author.trim() ? { WrittenBy: draft.value.author.trim() } : {})
        }
      }
    ];

    objects.push(...serializeObjectiveSystem(draft.value.objectives));
    objects.push(...serializeBoardRuleSystem(draft.value.boardRules));

    if (shouldEmitSeedBank) {
      objects.push(
        shouldPreserveImportedSeedBank
          ? importedSeedBankObjects[0]
          : {
            ...cloneJson(importedSeedBankObjects[0] || {}),
            aliases: seedBankAliases,
            objclass: 'SeedBankProperties',
            objdata: seedBankData
          },
        ...importedSeedBankObjects.slice(1)
      );
    } else if (shouldEmitConveyor && importedSeedBankObjects.length) {
      objects.push(...importedSeedBankObjects);
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
    } else if (preserveStaticWaveSystem) {
      objects.push(...draft.value.preservedStaticWaveObjects.map((object) => cloneJson(object)));
    } else if (shouldEmitWaveManager) {
      objects.push(
        {
          ...cloneJson(importedWaveModule || {}),
          aliases: waveModuleAliases,
          objclass: 'WaveManagerModuleProperties',
          objdata: {
            ...draft.value.waveManagerModuleExtra,
            ...(draft.value.waveManagerReferenceOnModule
              ? { WaveManagerProps: `RTID(${draft.value.waveManagerAlias}@CurrentLevel)` }
              : {})
          }
        },
        {
          aliases: originalManager?.aliases?.includes(draft.value.waveManagerAlias) ? originalManager.aliases : [draft.value.waveManagerAlias],
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

    appendPreservedLevelObjects(objects, draft.value.unsupportedRawObjects, getImportedLevelSnapshot()?.source.objects);

    const definition = objects.find((object) => object.objclass === 'LevelDefinition');
    if (definition) definition.objdata = preserveUneditedDefinitionFields(getImportedLevelSnapshot(), draft.value, definition.objdata);
    const reconciledObjects = reconcileLevelObjects(getImportedLevelSnapshot()?.source?.objects, objects);
    const result = buildLevelDocument(draft.value.rootExtra, draft.value.name, reconciledObjects);
    if (getImportedLevelSnapshot()) {
      if (Object.hasOwn(getImportedLevelSnapshot().source, '#comment')) result['#comment'] = cloneJson(getImportedLevelSnapshot().source['#comment']);
      else delete result['#comment'];
    }
    return result;
  }

  function uniqueRefs(refs: string[]) {
    return [...new Set(refs.filter(Boolean))];
  }

  function getKnownCurrentLevelAliases() {
    const aliases = new Set<string>();
    const collect = (object: any) => (object?.aliases || []).forEach((alias: string) => aliases.add(String(alias)));
    (getImportedLevelSnapshot()?.source?.objects || []).forEach(collect);
    draft.value.waves.forEach((wave) => {
      if (wave.zombieActionAlias) aliases.add(wave.zombieActionAlias);
      wave.rawActions.forEach((action) => aliases.add(action.alias));
    });
    draft.value.waveSupportObjects.forEach((action) => aliases.add(action.alias));
    draft.value.unsupportedRawObjects.forEach(collect);
    draft.value.preservedPlacementObjects.forEach(collect);
    aliases.add('WaveManager');
    aliases.add('WaveManagerModule');
    if (draft.value.hasSeedBank) aliases.add('SeedBank');
    if (draft.value.conveyor.enabled) aliases.add(draft.value.conveyor.alias || 'ConveyorBelt');
    return aliases;
  }
  return { parseLevel, parseCurrentLevelAlias, parseLevelModuleAlias, parseStageReference, parseTypeAlias, parsePlantReference, toPlantTypeRef, getPlacementExtra, serializeBoardPlacement, serializeWaveZombies, compactUndefinedValues, serializeConveyorPlantEntry, serializeConveyorWaveEntry, buildConveyorWaveObjdata, serializeWaveActionObject, serializeConveyorData, replaceModuleGroup, setModuleRef, buildModuleRefs, serializeLevel, uniqueRefs, getKnownCurrentLevelAliases };
}
