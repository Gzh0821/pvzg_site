import { getLocalAssetDefinitions } from '../assets/local-assets-codec.mjs';

import { computed } from 'vue';

import { getCardDeckIssues } from '../../card-deck-codec.mjs';

import { getGeneratorObjects, getGeneratorIssues } from '../../authored-content-codec.mjs';
import { SPECIAL_MODE_CLASSES, getSpecialModeIssues } from '../../special-mode-codec.mjs';
import { specialModeOptions } from '../../../game-data/special-modes';
import { getEndlessModule, getEndlessIssues, ENDLESS_MODULE_CLASSES, ENDLESS_DESIGNER_CLASSES } from '../../endless-codec.mjs';
import { getEndlessRuleIssues } from '../../endless-rule-codec.mjs';
import { getNarrativeWarnings } from '../../narrative-codec.mjs';
import { getImportedObjectsByClass } from '../../level-codec.mjs';
import JSON5 from 'json5';
import { collectCurrentLevelReferences } from '../../wave-codec.mjs';
import { POWER_TILE_GROUPS, getRulePowerTiles, getRuleRailcarts, getRuleRails } from '../../board-rule-codec.mjs';

import type { ValidationItem } from '../../core/types';

import type { LevelEditorRuntime } from '../../app/use-level-editor';
type Bindings = {
  draft: LevelEditorRuntime['draft'];
  activeEndlessModule: LevelEditorRuntime['activeEndlessModule'];
  endlessSharedObjects: LevelEditorRuntime['endlessSharedObjects'];
  sharedNarrativeCatalog: LevelEditorRuntime['sharedNarrativeCatalog'];
  specialKinds: LevelEditorRuntime['specialKinds'];
  activePointGenerator: LevelEditorRuntime['activePointGenerator'];
  getKnownCurrentLevelAliases: LevelEditorRuntime['getKnownCurrentLevelAliases'];
  parseActionObjdata: LevelEditorRuntime['parseActionObjdata'];
  parseOptionalArrayText: LevelEditorRuntime['parseOptionalArrayText'];
  t: LevelEditorRuntime['t'];
  NEW_WAVES_REF: LevelEditorRuntime['NEW_WAVES_REF'];
  getImportedLevelSnapshot: () => any;
};
export function useValidation(bindings: Bindings): { opaqueRawObjects: import('vue').ComputedRef<any[]>; validationItems: import('vue').ComputedRef<ValidationItem[]>; validationSummary: import('vue').ComputedRef<{ errors: number; warnings: number; }>; validationState: import('vue').ComputedRef<'error' | 'warning' | 'success'>; } {
  const {
    draft, activeEndlessModule, endlessSharedObjects, sharedNarrativeCatalog, specialKinds,
    activePointGenerator, getKnownCurrentLevelAliases, parseActionObjdata,
    parseOptionalArrayText, t, NEW_WAVES_REF, getImportedLevelSnapshot
  } = bindings;
  const opaqueRawObjects = computed(() => {
    const ownedAssets = new Set(getLocalAssetDefinitions(draft.value.unsupportedRawObjects).flatMap((asset) => asset.properties ? [asset.object, asset.properties] : []));
    return draft.value.unsupportedRawObjects.filter((object: any) => !ownedAssets.has(object) &&
      !['NarrativeProperties', 'DangerRoomLevelIntroProperties'].includes(object?.objclass) && !getGeneratorObjects([object]).length && !ENDLESS_MODULE_CLASSES.includes(object?.objclass) && !ENDLESS_DESIGNER_CLASSES.includes(object?.objclass) && !Object.values(SPECIAL_MODE_CLASSES).includes(object?.objclass));
  });

  const validationItems = computed<ValidationItem[]>(() => {
    const items: ValidationItem[] = [];
    const originalDefinition = getImportedLevelSnapshot()?.source.objects.find((object: any) => object.objclass === 'LevelDefinition')?.objdata || {};
    getSpecialModeIssues(draft.value, getImportedLevelSnapshot()?.source.objects || [], specialModeOptions).forEach((issue) => {
      items.push({ type: issue.inherited ? 'warning' : 'error', text: t('specialInvalidField', { mode: t(`specialKind_${issue.kind}`), field: t(`specialField_${issue.field}`) }) });
    });
    getEndlessIssues(draft.value.unsupportedRawObjects, draft.value.levelExtra, getImportedLevelSnapshot()?.source.objects || [], originalDefinition).forEach((issue) => {
      items.push({ type: issue.inherited ? 'warning' : 'error', text: t('endlessInvalidField', { field: t(`endlessField_${issue.field}`) }) });
    });
    getEndlessRuleIssues(activeEndlessModule.value, draft.value.unsupportedRawObjects, endlessSharedObjects.value,
      getEndlessModule(getImportedLevelSnapshot()?.source.objects || [], originalDefinition), getImportedLevelSnapshot()?.source.objects || []).forEach((issue) => {
        items.push({ type: issue.inherited ? 'warning' : 'error', text: t('endlessRuleInvalid', { alias: issue.alias, field: t(`endlessRuleField_${issue.field}`) }) });
      });
    getGeneratorIssues(draft.value.unsupportedRawObjects, getImportedLevelSnapshot()?.source.objects || []).forEach((issue) => {
      items.push({
        type: issue.inherited ? 'warning' : 'error', text: t('generatorInvalidField', {
          alias: issue.alias, field: t(`generatorField_${issue.field}`)
        })
      });
    });
    getNarrativeWarnings(draft.value.unsupportedRawObjects, draft.value.levelExtra, sharedNarrativeCatalog.value).forEach((issue) => {
      items.push({
        type: 'warning', text: t(`narrativeWarning_${issue.reason}`, {
          slot: t(`narrativeSlot_${issue.slot}`), index: (issue.index ?? 0) + 1
        })
      });
    });
    const originalSeed = getImportedObjectsByClass(getImportedLevelSnapshot(), 'SeedBankProperties')[0]?.objdata;
    if (!draft.value.conveyor.enabled && draft.value.seedMode === 'chooser') getCardDeckIssues(draft.value.seedBankExtra, originalSeed).forEach((issue) => {
      items.push({
        type: issue.inherited ? 'warning' : 'error', text: t(issue.reason === 'empty' ? 'deckEmptyError' : 'deckLeaderError', {
          kind: t(issue.kind === 'Recommended' ? 'recommendedDecks' : 'challengingDecks'), index: issue.index + 1
        })
      });
    });
    if (!draft.value.name.trim()) {
      items.push({ type: 'error', text: t('validationNameRequired') });
    }
    const expectsWaveSystem =
      (draft.value.hasWaveManager && !draft.value.preserveCustomWaveManager) ||
      draft.value.preserveGeneratorWaves ||
      draft.value.moduleRefs.includes(NEW_WAVES_REF);
    if (!draft.value.waves.length && expectsWaveSystem && !draft.value.preserveGeneratorWaves && !specialKinds.value.includes('boss')) {
      items.push({ type: 'error', text: t('validationWaveRequired') });
    }
    draft.value.waves.forEach((wave, index) => {
      const hasConveyorWaveMod =
        draft.value.conveyor.enabled && draft.value.conveyor.waveModifications.some((modification) => modification.waveIndex === index + 1);
      if (!wave.zombies.length && !wave.rawActions.length && !hasConveyorWaveMod && !activePointGenerator.value) {
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
    draft.value.waveSupportObjects.forEach((action) => {
      try {
        JSON5.parse(action.jsonText || '{}');
      } catch {
        items.push({
          type: 'error',
          text: t('validationSupportActionJson', { action: action.objclass })
        });
      }
    });
    const knownCurrentLevelAliases = getKnownCurrentLevelAliases();
    const missingWaveReferences = new Set<string>();
    [...draft.value.waves.flatMap((wave) => wave.rawActions), ...draft.value.waveSupportObjects].forEach((action) => {
      collectCurrentLevelReferences(parseActionObjdata(action)).forEach((alias: string) => {
        if (!knownCurrentLevelAliases.has(alias)) missingWaveReferences.add(alias);
      });
    });
    missingWaveReferences.forEach((alias) => {
      items.push({ type: 'warning', text: t('validationWaveReferenceMissing', { alias }) });
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
    draft.value.boardRules.modules.forEach((rule, ruleIndex) => {
      if (rule.kind === 'railcart') {
        getRuleRails(rule).forEach((rail: any, entryIndex: number) => {
          const col = Number(rail.Column);
          const rowStart = Number(rail.RowStart);
          const rowEnd = Number(rail.RowEnd);
          if (
            !Number.isInteger(col) ||
            !Number.isInteger(rowStart) ||
            !Number.isInteger(rowEnd) ||
            col < 0 || col > 8 || rowStart < 0 || rowStart > 4 || rowEnd < 0 || rowEnd > 4 || rowStart > rowEnd
          ) {
            items.push({ type: 'error', text: t('validationRail', { rule: ruleIndex + 1, index: entryIndex + 1 }) });
          }
        });
        getRuleRailcarts(rule).forEach((cart: any, entryIndex: number) => {
          const col = Number(cart.Column);
          const row = Number(cart.Row);
          if (!Number.isInteger(col) || !Number.isInteger(row) || col < 0 || col > 8 || row < 0 || row > 4) {
            items.push({ type: 'error', text: t('validationRailcart', { rule: ruleIndex + 1, index: entryIndex + 1 }) });
          }
        });
      } else if (rule.kind === 'tide') {
        const column = Number(rule.objdata?.StartingWaveLocation);
        if (!Number.isInteger(column) || column < 0 || column > 9) {
          items.push({ type: 'error', text: t('validationTide', { rule: ruleIndex + 1 }) });
        }
      } else if (rule.kind === 'planks') {
        const rows = Array.isArray(rule.objdata?.PlankRows) ? rule.objdata.PlankRows : [];
        if (rows.some((row: any) => !Number.isInteger(Number(row)) || Number(row) < 0 || Number(row) > 4)) {
          items.push({ type: 'error', text: t('validationPlanks', { rule: ruleIndex + 1 }) });
        }
      } else if (rule.kind === 'powerTiles') {
        getRulePowerTiles(rule).forEach((tile: any, entryIndex: number) => {
          const col = Number(tile?.Location?.mX);
          const row = Number(tile?.Location?.mY);
          const delay = Number(tile?.PropagationDelay);
          if (
            !POWER_TILE_GROUPS.includes(String(tile?.Group)) ||
            !Number.isInteger(col) || col < 0 || col > 8 ||
            !Number.isInteger(row) || row < 0 || row > 4 ||
            !Number.isFinite(delay) || delay < 0
          ) {
            items.push({ type: 'error', text: t('validationPowerTile', { rule: ruleIndex + 1, index: entryIndex + 1 }) });
          }
        });
      }
    });
    const protectObjective = draft.value.objectives.protect;
    if (protectObjective) {
      const protectedPlants = Array.isArray(protectObjective.objdata?.Plants) ? protectObjective.objdata.Plants : [];
      if (Number(protectObjective.objdata?.MustProtectCount || 0) > protectedPlants.length) {
        items.push({ type: 'warning', text: t('validationProtectCount') });
      }
      protectedPlants.forEach((plant: any, index: number) => {
        const col = Number(plant.GridX);
        const row = Number(plant.GridY);
        if (!plant.PlantType || !Number.isInteger(col) || !Number.isInteger(row) || col < 0 || col > 8 || row < 0 || row > 4) {
          items.push({ type: 'error', text: t('validationProtectedPlant', { index: index + 1 }) });
        }
      });
    }
    if (opaqueRawObjects.value.length > 0) {
      items.push({
        type: 'warning',
        text: t('validationUnsupported', { count: opaqueRawObjects.value.length })
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

  return { opaqueRawObjects, validationItems, validationSummary, validationState };
}
