import { createEventEditors } from './event-editors';

import { getAirDropSummary, getChiHoleSummary, getDropShipSummary, getFrostWindSummary, getGridItemSpawnSummary, getGravestoneSummary, getMissileLocateSummary, getQigongSummary, getThunderSummary, getWaveWarningSummary, getWaveActionDefinitionByClass, parseZombieTypeReference } from '../../wave-action-codec.mjs';
import { defineComponent, h, type Ref } from 'vue';
import WaveEventPicker from './WaveEventPicker.vue';
import WorkbenchIcon from '../../ui/WorkbenchIcon';
import { CopyOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue';

import { getGeneratorObjects, getGeneratorWaveBudget } from '../../authored-content-codec.mjs';
import { getEndlessWaveLimit, getEndlessWaveBudget } from '../../endless-codec.mjs';
import GeneratorPanel from '../../generator-panel';
import { Modal } from 'ant-design-vue';
import type { WaveActionDraft, WaveDraft, WaveZombie, WaveActionOrderEntry, DynamicZombieNumberField } from '../../core/types';
import type { LevelEditorRuntime } from '../../app/use-level-editor';
import type { createFieldRenderers } from '../../ui/field-renderers.ts';

type Bindings = {
  activePane: LevelEditorRuntime['activePane'];
  inspectorTab: LevelEditorRuntime['inspectorTab'];
  t: LevelEditorRuntime['t'];
  parseActionObjdata: LevelEditorRuntime['parseActionObjdata'];
  getZombieDisplayName: LevelEditorRuntime['getZombieDisplayName'];
  parseCurrentLevelAlias: LevelEditorRuntime['parseCurrentLevelAlias'];
  getWaveSupportObject: LevelEditorRuntime['getWaveSupportObject'];
  getKnownCurrentLevelAliases: LevelEditorRuntime['getKnownCurrentLevelAliases'];
  updateWaveActionData: LevelEditorRuntime['updateWaveActionData'];
  draft: LevelEditorRuntime['draft'];
  selectedWaveId: LevelEditorRuntime['selectedWaveId'];
  markWaveSystemEdited: LevelEditorRuntime['markWaveSystemEdited'];
  createRawWaveAction: LevelEditorRuntime['createRawWaveAction'];
  createUniqueWaveActionAlias: LevelEditorRuntime['createUniqueWaveActionAlias'];
  selectedSchedulerChildAliases: LevelEditorRuntime['selectedSchedulerChildAliases'];
  pruneWaveSupportObjects: LevelEditorRuntime['pruneWaveSupportObjects'];
  expertMode: LevelEditorRuntime['expertMode'];
  updateWaveActionJson: LevelEditorRuntime['updateWaveActionJson'];
  renderActionRangeField: ReturnType<typeof createFieldRenderers>['renderActionRangeField'];
  renderActionNumberField: ReturnType<typeof createFieldRenderers>['renderActionNumberField'];
  newSchedulerChildKind: LevelEditorRuntime['newSchedulerChildKind'];
  zombieOptions: LevelEditorRuntime['zombieOptions'];
  objectOptions: LevelEditorRuntime['objectOptions'];
  selectedAsset: LevelEditorRuntime['selectedAsset'];
  newGravestoneType: LevelEditorRuntime['newGravestoneType'];
  newGridItemSpawnType: LevelEditorRuntime['newGridItemSpawnType'];
  isZombiePoolEvent: LevelEditorRuntime['isZombiePoolEvent'];
  getEventZombieGroups: LevelEditorRuntime['getEventZombieGroups'];
  setEventZombieCount: LevelEditorRuntime['setEventZombieCount'];
  removeEventZombieGroup: LevelEditorRuntime['removeEventZombieGroup'];
  addSelectedZombieToEvent: LevelEditorRuntime['addSelectedZombieToEvent'];
  eventZombieActionHint: LevelEditorRuntime['eventZombieActionHint'];
  selectedSpawnRow: LevelEditorRuntime['selectedSpawnRow'];
  setWaveZombieRow: LevelEditorRuntime['setWaveZombieRow'];
  removeZombieFromWave: LevelEditorRuntime['removeZombieFromWave'];
  selectedZombieAsset: LevelEditorRuntime['selectedZombieAsset'];
  addZombieToWave: LevelEditorRuntime['addZombieToWave'];
  getPlantDisplayName: LevelEditorRuntime['getPlantDisplayName'];
  openConveyorEditor: LevelEditorRuntime['openConveyorEditor'];
  removeConveyorWaveModification: LevelEditorRuntime['removeConveyorWaveModification'];
  removeWaveAction: LevelEditorRuntime['removeWaveAction'];
  getEffectiveWaveActionOrder: LevelEditorRuntime['getEffectiveWaveActionOrder'];
  expandedWaveActionKey: LevelEditorRuntime['expandedWaveActionKey'];
  getWaveActionKey: LevelEditorRuntime['getWaveActionKey'];
  toggleWaveAction: LevelEditorRuntime['toggleWaveAction'];
  moveWaveAction: LevelEditorRuntime['moveWaveAction'];
  eventPickerOpen: LevelEditorRuntime['eventPickerOpen'];
  addWaveAction: LevelEditorRuntime['addWaveAction'];
  getDynamicNumberPlaceholder: LevelEditorRuntime['getDynamicNumberPlaceholder'];
  getDynamicNumberInputValue: LevelEditorRuntime['getDynamicNumberInputValue'];
  updateDynamicZombieNumber: LevelEditorRuntime['updateDynamicZombieNumber'];
  getDynamicZombiePoolGroups: LevelEditorRuntime['getDynamicZombiePoolGroups'];
  setDynamicZombiePoolCount: LevelEditorRuntime['setDynamicZombiePoolCount'];
  removeDynamicZombiePoolGroup: LevelEditorRuntime['removeDynamicZombiePoolGroup'];
  addSelectedZombieToDynamicPool: LevelEditorRuntime['addSelectedZombieToDynamicPool'];
  dynamicZombieActionHint: LevelEditorRuntime['dynamicZombieActionHint'];
  selectedDynamicDifficulty: LevelEditorRuntime['selectedDynamicDifficulty'];
  isDynamicZombieSlotConfigured: LevelEditorRuntime['isDynamicZombieSlotConfigured'];
  selectDynamicDifficulty: LevelEditorRuntime['selectDynamicDifficulty'];
  handleDynamicDifficultyKeydown: LevelEditorRuntime['handleDynamicDifficultyKeydown'];
  clearDynamicZombieSlot: LevelEditorRuntime['clearDynamicZombieSlot'];
  configureDynamicZombieSlot: LevelEditorRuntime['configureDynamicZombieSlot'];
  getDynamicZombieSlot: LevelEditorRuntime['getDynamicZombieSlot'];
  activeEndlessModule: LevelEditorRuntime['activeEndlessModule'];
  selectedGeneratorAlias: LevelEditorRuntime['selectedGeneratorAlias'];
  endlessPreviewFloor: LevelEditorRuntime['endlessPreviewFloor'];
  activePointGenerator: LevelEditorRuntime['activePointGenerator'];
  isEndlessMode: LevelEditorRuntime['isEndlessMode'];
  generatorEditorOpen: LevelEditorRuntime['generatorEditorOpen'];
  toggleGeneratorEditor: LevelEditorRuntime['toggleGeneratorEditor'];
  endlessCatalogLoading: LevelEditorRuntime['endlessCatalogLoading'];
  openEndlessSettings: LevelEditorRuntime['openEndlessSettings'];
  setFlagWaveInterval: LevelEditorRuntime['setFlagWaveInterval'];
  addWave: LevelEditorRuntime['addWave'];
  generatorPoolTarget: LevelEditorRuntime['generatorPoolTarget'];
  createPointGenerator: LevelEditorRuntime['createPointGenerator'];
  removeWave: LevelEditorRuntime['removeWave'];
  createEmptyWave: LevelEditorRuntime['createEmptyWave'];
  syncWaveFlags: LevelEditorRuntime['syncWaveFlags'];
  selectWave: LevelEditorRuntime['selectWave'];
  selectedWave: LevelEditorRuntime['selectedWave'];
  moveWave: LevelEditorRuntime['moveWave'];
  duplicateWave: LevelEditorRuntime['duplicateWave'];
  insertWaveAfter: LevelEditorRuntime['insertWaveAfter'];
};

export function createWaveView(bindings: Bindings, expandedEvent: Ref<boolean>) {
  const {
    activePane, inspectorTab, t, parseActionObjdata, getZombieDisplayName, draft, selectedWaveId,
    markWaveSystemEdited, expertMode, updateWaveActionJson, renderActionNumberField,
    zombieOptions, isZombiePoolEvent, getEventZombieGroups, setEventZombieCount,
    removeEventZombieGroup, addSelectedZombieToEvent, eventZombieActionHint, selectedSpawnRow,
    setWaveZombieRow, removeZombieFromWave, selectedZombieAsset, addZombieToWave,
    getPlantDisplayName, openConveyorEditor, removeConveyorWaveModification, removeWaveAction,
    getEffectiveWaveActionOrder, expandedWaveActionKey, getWaveActionKey, toggleWaveAction,
    moveWaveAction, eventPickerOpen, getDynamicNumberPlaceholder, getDynamicNumberInputValue,
    updateDynamicZombieNumber, getDynamicZombiePoolGroups, setDynamicZombiePoolCount,
    removeDynamicZombiePoolGroup, addSelectedZombieToDynamicPool, dynamicZombieActionHint,
    selectedDynamicDifficulty, isDynamicZombieSlotConfigured, selectDynamicDifficulty,
    handleDynamicDifficultyKeydown, clearDynamicZombieSlot, configureDynamicZombieSlot,
    getDynamicZombieSlot, activeEndlessModule, selectedGeneratorAlias, endlessPreviewFloor,
    activePointGenerator, isEndlessMode, generatorEditorOpen, toggleGeneratorEditor,
    endlessCatalogLoading, openEndlessSettings, setFlagWaveInterval, addWave,
    generatorPoolTarget, createPointGenerator, removeWave, createEmptyWave, syncWaveFlags,
    selectWave, selectedWave, moveWave, duplicateWave, insertWaveAfter
  } = bindings;

  function getRawWaveActionLabel(action: WaveActionDraft) {
    const definition = getWaveActionDefinitionByClass(action.objclass);
    return definition ? t(definition.labelKey) : action.objclass;
  }

  function getRawWaveActionSummary(action: WaveActionDraft) {
    const data = parseActionObjdata(action);
    if (action.objclass === 'WaveSchedulerProps') {
      return t('actionSchedulerSummary', {
        delay: data?.TimeBeforeFirst?.Min ?? '-',
        repeat: data?.Repeat?.Max ?? '-',
        count: Array.isArray(data?.Events) ? data.Events.length : 0
      });
    }
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
    if (action.objclass === 'FrostWindWaveActionProps') {
      const summary = getFrostWindSummary(data);
      return t('actionFrostWindSummary', summary);
    }
    if (action.objclass === 'BeachStageEventZombieSpawnerProps') {
      return t('actionBeachAmbushSummary', {
        zombie: getZombieDisplayName(String(data.ZombieName || ''), String(data.ZombieName || '-')),
        count: Number(data.ZombieCount || 0),
        start: data.ColumnStart ?? '-',
        end: data.ColumnEnd ?? '-'
      });
    }
    if (action.objclass === 'RaidingPartyZombieSpawnerProps') {
      const code = parseZombieTypeReference(data.ZombieType);
      return t('actionRaidingPartySummary', {
        zombie: code ? getZombieDisplayName(code, code) : t('stageDefault'),
        count: Number(data.SwashbucklerCount || 0),
        groups: Number(data.GroupSize || 0)
      });
    }
    if (action.objclass === 'SpiderRainZombieSpawnerProps' || action.objclass === 'ParachuteRainZombieSpawnerProps') {
      const summary = getAirDropSummary(data);
      return t('actionAirDropSummary', {
        zombie: getZombieDisplayName(summary.zombie, summary.zombie || '-'),
        count: summary.count,
        start: summary.start,
        end: summary.end,
        companions: summary.companions
      });
    }
    if (action.objclass === 'SpawnGravestonesWaveActionProps') {
      return t('actionGravestonesSummary', getGravestoneSummary(data));
    }
    if (action.objclass === 'SpawnZombiesFromGridItemSpawnerProps') {
      return t('actionGridItemSpawnSummary', getGridItemSpawnSummary(data));
    }
    if (action.objclass === 'DropShipZombieSpawnerProps') {
      const summary = getDropShipSummary(data);
      return t('actionDropShipSummary', {
        zombie: getZombieDisplayName(summary.zombie, summary.zombie || '-'),
        min: summary.min,
        max: summary.max,
        column: summary.column,
        row: summary.row
      });
    }
    if (action.objclass === 'ThunderChargeWaveActionProps') {
      return t('actionThunderChargeSummary', getThunderSummary(data));
    }
    if (action.objclass === 'QigongStrikeWaveActionProps') {
      return t('actionQigongStrikeSummary', getQigongSummary(data));
    }
    if (action.objclass === 'KongfuChiHoleProps') {
      return t('actionChiHoleSummary', getChiHoleSummary(data));
    }
    if (action.objclass === 'MissileLocateWaveActionProps') {
      return t('actionMissileLocateSummary', getMissileLocateSummary(data));
    }
    if (action.objclass === 'WaveWarningProps') {
      return t('actionWaveWarningSummary', getWaveWarningSummary(data));
    }
    return action.alias || t('actionUnknown');
  }

  const { renderKnownWaveActionFields } = createEventEditors({ ...bindings, renderEventZombiePoolEditor, getRawWaveActionLabel, getRawWaveActionSummary });

  function renderEventZombiePoolEditor(action: WaveActionDraft) {
    if (!isZombiePoolEvent(action)) return null;
    const groups = getEventZombieGroups(action);
    return h('div', { class: 'event-zombie-pool' }, [
      h('strong', { class: 'pool-editor-title' }, t('eventZombiePool')),
      h('div', { class: 'zombie-list' }, renderZombieGroupList(groups, {
        onCount: (_zombie, value, index) => setEventZombieCount(action, index, value),
        onRemove: (_zombie, index) => removeEventZombieGroup(action, index)
      })),
      h('div', { class: 'wave-actions' }, [
        h('button', { type: 'button', class: 'add-button', onClick: () => addSelectedZombieToEvent(action) }, [
          h(PlusOutlined),
          t('addZombie')
        ]),
        eventZombieActionHint.value ? h('small', { class: 'action-hint' }, t(eventZombieActionHint.value)) : null
      ])
    ]);
  }

  function renderLanePreview(wave: WaveDraft) {
    const rows = ['1', '2', '3', '4', '5', ''];
    const extraRows = [...new Set(wave.zombies.map((zombie) => zombie.row).filter((row) => !rows.includes(row)))];
    return h('div', { class: 'lane-preview direct-wave-board', 'aria-label': t('lanePreview') },
      [...rows, ...extraRows].map((row) => {
        const label = row ? t('rowNumber', { row }) : t('randomRow');
        return h('div', {
          class: ['lane-preview-row', expandedWaveActionKey.value === 'zombies' && selectedSpawnRow.value === row ? 'selected-lane' : ''],
          onDragover: (event: DragEvent) => { if (event.dataTransfer?.types.includes('application/x-pvzge-zombie')) event.preventDefault(); },
          onDrop: (event: DragEvent) => {
            const id = Number(event.dataTransfer?.getData('application/x-pvzge-zombie'));
            const zombie = wave.zombies.find((item) => item.id === id);
            if (zombie) { event.preventDefault(); setWaveZombieRow(zombie, row); selectedSpawnRow.value = row; }
          }
        }, [
          h('button', {
            type: 'button', class: 'lane-number', title: label, 'aria-label': label,
            'aria-pressed': expandedWaveActionKey.value === 'zombies' && selectedSpawnRow.value === row, onClick: () => { selectedSpawnRow.value = row; expandedWaveActionKey.value = 'zombies'; inspectorTab.value = 'edit'; eventPickerOpen.value = false; }
          }, row || t('randomRowShort')),
          h('div', { class: 'lane-zombies' }, wave.zombies.filter((zombie) => zombie.row === row).map((zombie) => {
            const asset = zombieOptions.value.find((item) => item.code === zombie.code);
            const name = getZombieDisplayName(zombie.code, zombie.label);
            return h('div', {
              key: zombie.id, class: 'wave-zombie-token', draggable: true,
              onDragstart: (event: DragEvent) => event.dataTransfer?.setData('application/x-pvzge-zombie', String(zombie.id))
            }, [
              asset?.image ? h('img', { src: asset.image, alt: '', draggable: false }) : null,
              h('strong', { title: name }, name),
              h('input', {
                type: 'number', min: 1, value: zombie.count, 'aria-label': t('zombieCount', { name }),
                onInput: (event: Event) => { markWaveSystemEdited(); zombie.count = Math.max(1, Math.round(Number((event.target as HTMLInputElement).value)) || 1); }
              }),
              h('select', {
                value: row, title: t('zombieRow', { name }), 'aria-label': t('zombieRow', { name }),
                onChange: (event: Event) => setWaveZombieRow(zombie, (event.target as HTMLSelectElement).value)
              }, [...rows, ...extraRows].map((value) => h('option', { value }, value || t('randomRowShort')))),
              h('button', { type: 'button', class: 'remove-token', 'aria-label': t('removeZombie', { name }), onClick: () => removeZombieFromWave(zombie.id) }, h(DeleteOutlined))
            ]);
          })),
          h('button', {
            type: 'button', class: 'lane-add', disabled: !selectedZombieAsset.value,
            title: t('addToLane', { row: label }), 'aria-label': t('addToLane', { row: label }),
            onClick: () => { selectedSpawnRow.value = row; if (selectedZombieAsset.value) addZombieToWave(selectedZombieAsset.value.code, row); }
          }, h(PlusOutlined))
        ]);
      })
    );
  }

  function renderWaveSpawnAdvancedFields(wave: WaveDraft) {
    return h('section', { class: 'wave-spawn-options' }, [
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
              h('option', { value: 'appear' }, t('styleAppear')),
              h('option', { value: 'sandstorm' }, t('styleSandstorm')),
              h('option', { value: 'snowstorm' }, t('styleSnowstorm'))
            ]
          )
        ]),
        expertMode.value ? h('div', { class: 'field-row compact' }, [
          h('label', t('dynamicPlantfood')),
          h('input', {
            value: wave.dynamicPlantfood,
            placeholder: '[1,1,1,0,0]',
            onInput: (event: Event) => {
              markWaveSystemEdited();
              wave.dynamicPlantfood = (event.target as HTMLInputElement).value;
            }
          })
        ]) : null,
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

  function renderZombieGroupList(
    zombies: WaveZombie[],
    options: {
      showRows?: boolean;
      countLabelKey?: string;
      onRow?: (zombie: WaveZombie, value: string, index: number) => void;
      onCount: (zombie: WaveZombie, value: number, index: number) => void;
      onRemove: (zombie: WaveZombie, index: number) => void;
    }
  ) {
    if (!zombies.length) return h('small', { class: 'seed-mode-hint' }, t('emptyList'));
    return zombies.map((zombie, index) => {
      const name = getZombieDisplayName(zombie.code, zombie.label);
      const standardRows = ['', '1', '2', '3', '4', '5'];
      const rowOptions = standardRows.includes(zombie.row) ? standardRows : [...standardRows, zombie.row];
      return h('div', { class: 'zombie-row' }, [
        h('span', { class: 'zombie-identity' }, [h('strong', name), h('small', zombie.code)]),
        h('div', { class: 'zombie-row-controls' }, [
          options.showRows
            ? h(
              'select',
              {
                'aria-label': t('zombieRow', { name }),
                value: zombie.row,
                onChange: (event: Event) => options.onRow?.(zombie, (event.target as HTMLSelectElement).value, index)
              },
              rowOptions.map((row) =>
                h(
                  'option',
                  { value: row },
                  row === '' ? t('randomRow') : ['1', '2', '3', '4', '5'].includes(row) ? t('rowNumber', { row }) : row
                )
              )
            )
            : null,
          h('input', {
            type: 'number',
            min: 1,
            'aria-label': t(options.countLabelKey || 'zombieCount', { name }),
            value: zombie.count,
            onInput: (event: Event) => options.onCount(zombie, Number((event.target as HTMLInputElement).value), index)
          }),
          h(
            'button',
            {
              type: 'button',
              title: t('removeZombie', { name }),
              'aria-label': t('removeZombie', { name }),
              onClick: () => options.onRemove(zombie, index)
            },
            h(DeleteOutlined)
          )
        ])
      ]);
    });
  }

  function renderZombieSpawnEditor(wave: WaveDraft) {
    return renderWaveSpawnAdvancedFields(wave);
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
    const eventZombiePool = renderEventZombiePoolEditor(action);
    return h('div', { class: 'wave-action-editor-body' }, [
      knownFields,
      eventZombiePool,
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
        expertMode.value ? h('code', action.alias) : null,
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
    return h('div', { class: 'wave-event-list', role: 'list', 'aria-label': t('waveEventType') }, order.map((entry, index) => {
      const selected = expandedWaveActionKey.value === getWaveActionKey(entry);
      return h('div', { class: ['wave-event-row', selected ? 'selected' : ''], role: 'listitem' }, [
        h('button', { type: 'button', class: 'wave-event-select', 'aria-pressed': selected, onClick: () => toggleWaveAction(entry) }, [
          h('span', { class: 'wave-action-index' }, String(index + 1)),
          h('span', [h('strong', getWaveActionEntryLabel(wave, entry)), h('small', getWaveActionEntrySummary(wave, waveIndex, entry))])
        ]),
        h('button', { type: 'button', disabled: index === 0, 'aria-label': t('moveEarlier'), onClick: () => moveWaveAction(wave, index, -1) }, '↑'),
        h('button', { type: 'button', disabled: index === order.length - 1, 'aria-label': t('moveLater'), onClick: () => moveWaveAction(wave, index, 1) }, '↓')
      ]);
    }));
  }

  function renderWaveAddMenu(waveIndex: number) {
    return h(WaveEventPicker, {
      open: eventPickerOpen.value, translate: t, wave: waveIndex,
      'onUpdate:open': (open: boolean) => { eventPickerOpen.value = open; },
      onChoose: (kind) => {
        bindings.addWaveAction(kind);
        inspectorTab.value = 'edit';
        activePane.value = 'properties';
      }
    });
  }

  function renderWaveInspector(wave: WaveDraft, waveIndex: number) {
    const order = getEffectiveWaveActionOrder(wave, waveIndex);
    const entry = order.find((item) => getWaveActionKey(item) === expandedWaveActionKey.value);
    const difficulty = expandedWaveActionKey.value === 'difficulty';
    return h('aside', { class: 'wave-inspector' }, [
      h('div', { class: 'wave-inspector-heading' }, [h('h3', difficulty ? t('dynamicDifficulty') : expandedWaveActionKey.value === 'settings' ? t('waveSettings')
        : `${t('selectedWaveNumber', { wave: waveIndex })} · ${entry ? getWaveActionEntryLabel(wave, entry) : t('waveSpawnAction')}`),
        entry?.kind === 'raw' ? h('button', {
          type: 'button', class: 'text-button wave-expand-control', 'aria-expanded': expandedEvent.value,
          onClick: () => { activePane.value = 'properties'; expandedEvent.value = !expandedEvent.value; }
        }, [h(WorkbenchIcon, { name: expandedEvent.value ? 'unfocus' : 'focus' }), t(expandedEvent.value ? 'collapseEvent' : 'expandEvent')]) : null
      ]),
      difficulty ? renderDynamicDifficultyEditor()
        : expandedWaveActionKey.value === 'settings' ? h('div', { class: 'inspector-fields' }, [
          renderActionNumberField('firstWaveCountdown', draft.value.firstWaveCountdown, (value) => { markWaveSystemEdited(); draft.value.firstWaveCountdown = value; }),
          h('label', { class: 'check-row' }, [h('input', {
            type: 'checkbox', checked: draft.value.suppressFlagZombie,
            onChange: (event: Event) => { markWaveSystemEdited(); draft.value.suppressFlagZombie = (event.target as HTMLInputElement).checked; }
          }), t('suppressFlagZombie')])
        ]) : entry ? renderWaveActionEditor(wave, waveIndex, entry) : expandedWaveActionKey.value === 'zombies' ? renderZombieSpawnEditor(wave) : null
    ]);
  }

  function renderDynamicNumberField(field: DynamicZombieNumberField, labelKey: string) {
    const placeholder = getDynamicNumberPlaceholder(field);
    return h('div', { class: ['field-row', 'compact', placeholder ? 'has-preserved-value' : ''] }, [
      h('label', [t(labelKey), placeholder ? h('code', { title: placeholder }, placeholder) : null]),
      h('input', {
        type: 'number',
        ...(field === 'StartingWave' ? { min: 1, step: 1 } : {}),
        value: getDynamicNumberInputValue(field),
        placeholder,
        'aria-label': t(labelKey),
        onInput: (event: Event) => updateDynamicZombieNumber(field, (event.target as HTMLInputElement).value)
      })
    ]);
  }

  function renderDynamicZombiePoolEditor() {
    const groups = getDynamicZombiePoolGroups().map((group, index) => ({
      id: index + 1,
      code: group.code,
      label: getZombieDisplayName(group.code, group.code),
      count: group.rawValues.length,
      row: ''
    }));
    return h('div', { class: 'dynamic-zombie-pool' }, [
      h('strong', { class: 'pool-editor-title' }, t('dynamicZombiePool')),
      h('div', { class: 'zombie-list' }, renderZombieGroupList(groups, {
        countLabelKey: 'zombiePoolCopies',
        onCount: (_zombie, value, index) => setDynamicZombiePoolCount(index, value),
        onRemove: (_zombie, index) => removeDynamicZombiePoolGroup(index)
      })),
      h('div', { class: 'wave-actions' }, [
        h('button', { type: 'button', class: 'add-button', onClick: addSelectedZombieToDynamicPool }, [
          h(PlusOutlined),
          t('addZombie')
        ]),
        dynamicZombieActionHint.value ? h('small', { class: 'action-hint' }, t(dynamicZombieActionHint.value)) : null
      ])
    ]);
  }

  function renderDynamicDifficultyEditor() {
    if (!draft.value.supportsDynamicZombies) return null;
    const selectedLevel = selectedDynamicDifficulty.value;
    const configured = isDynamicZombieSlotConfigured(selectedLevel);
    return h('section', { class: 'dynamic-difficulty' }, [
      h('div', { class: 'dynamic-difficulty-bar' }, [
        h(
          'div',
          { class: 'dynamic-difficulty-tabs', role: 'tablist', 'aria-label': t('dynamicDifficulty') },
          Array.from({ length: 7 }, (_, index) => {
            const level = index + 1;
            const slotConfigured = isDynamicZombieSlotConfigured(level);
            const selected = selectedLevel === level;
            return h(
              'button',
              {
                type: 'button',
                role: 'tab',
                class: [selected ? 'active' : '', slotConfigured ? 'configured' : ''],
                'aria-selected': selected,
                'aria-controls': 'dynamic-difficulty-panel',
                'aria-label': `${t('difficultyLevel', { level })} · ${t(slotConfigured ? 'difficultyConfigured' : 'difficultyNoExtraZombies')}`,
                tabindex: selected ? 0 : -1,
                'data-difficulty-level': level,
                onClick: () => selectDynamicDifficulty(level),
                onKeydown: (event: KeyboardEvent) => handleDynamicDifficultyKeydown(event, level)
              },
              [String(level), slotConfigured ? h('span', { class: 'difficulty-status-dot', 'aria-hidden': 'true' }) : null]
            );
          })
        )
      ]),
      h(
        'div',
        {
          id: 'dynamic-difficulty-panel',
          class: 'dynamic-difficulty-panel',
          role: 'tabpanel',
          'aria-label': t('difficultyLevel', { level: selectedLevel })
        },
        configured
          ? [
            h('div', { class: 'dynamic-difficulty-panel-heading' }, [
              h('span', [h('strong', t('difficultyLevel', { level: selectedLevel })), h('small', t('difficultyConfigured'))]),
              h(
                'button',
                { type: 'button', class: 'text-button danger', onClick: () => clearDynamicZombieSlot(selectedLevel) },
                t('clearDifficulty', { level: selectedLevel })
              )
            ]),
            h('div', { class: 'dynamic-difficulty-fields' }, [
              renderDynamicNumberField('StartingWave', 'dynamicStartsOnWave'),
              renderDynamicNumberField('StartingPoints', 'dynamicStartingPoints'),
              renderDynamicNumberField('PointIncrementPerWave', 'dynamicPointChangePerWave')
            ]),
            renderDynamicZombiePoolEditor()
          ]
          : [
            h('div', { class: 'dynamic-difficulty-empty' }, [
              h('span', t('difficultyNoExtraZombies')),
              h(
                'button',
                { type: 'button', class: 'add-button small', onClick: () => configureDynamicZombieSlot(selectedLevel) },
                t('configureDifficulty', { level: selectedLevel })
              )
            ])
          ]
      )

    ]);
  }

  function renderDynamicPoolWavePreview(waveIndex: number) {
    if (!draft.value.supportsDynamicZombies) return null;
    const slot = getDynamicZombieSlot();
    const requiredNumbers = [slot.StartingWave, slot.StartingPoints, slot.PointIncrementPerWave];
    if (requiredNumbers.some((value) => value === '' || value === undefined || Number.isNaN(Number(value)))) return null;
    const startingWave = Number(slot.StartingWave) + 1;
    if (waveIndex < startingWave) return null;
    const groups = getDynamicZombiePoolGroups();
    if (!groups.length) return null;
    return h('div', { class: 'dynamic-wave-preview' }, [
      h('span', { class: 'dynamic-wave-preview-label' }, [
        h('strong', t('dynamicPoolPreview', { level: selectedDynamicDifficulty.value })),
        h('small', t('startsOnWave', { wave: startingWave }))
      ]),
      h(
        'div',
        { class: 'dynamic-wave-preview-pool' },
        groups.map((group) =>
          h('span', { class: 'lane-zombie-chip', title: getZombieDisplayName(group.code, group.code) }, [
            h('span', { class: 'lane-zombie-dot', 'aria-hidden': 'true' }),
            getZombieDisplayName(group.code, group.code),
            group.rawValues.length > 1 ? h('strong', `×${group.rawValues.length}`) : null
          ])
        )
      )
    ]);
  }

  function renderEndlessPreview() {
    const module = activeEndlessModule.value;
    if (!module) return null;
    const generator = getGeneratorObjects(draft.value.unsupportedRawObjects).find((object: any) => object.aliases?.includes(selectedGeneratorAlias.value));
    const count = getEndlessWaveLimit(module.objdata, endlessPreviewFloor.value, !!draft.value.levelExtra.IsDangerRoomMiniGame);
    const indices = [0, 9, count - 1].filter((index, position, all) => all.indexOf(index) === position);
    return h('section', { class: 'endless-preview' }, [
      h('label', { class: 'field-row' }, [h('span', t('endlessPreviewFloor')), h('input', {
        type: 'number', min: 1, step: 1, value: endlessPreviewFloor.value,
        onInput: (event: Event) => { endlessPreviewFloor.value = Math.max(1, Math.floor(Number((event.target as HTMLInputElement).value)) || 1); }
      })]),
      h('span', t('endlessWaveLimit', { count })),
      generator?.objclass === 'DangerRoomJitteredWaveGenerator' ? h('div', { class: 'endless-budget-list' }, indices.map((index) => {
        const points = getEndlessWaveBudget(generator.objdata, endlessPreviewFloor.value, index);
        return points == null ? null : h('span', t('endlessWaveBudget', { wave: index + 1, points }));
      })) : null
    ]);
  }

  const WaveTimeline = defineComponent({
    setup() {
      const pointBudget = (index: number) => {
        const generator = activePointGenerator.value;
        return generator ? getGeneratorWaveBudget(generator.objdata, index, Math.min(draft.value.waves.length, draft.value.flagWaveInterval)) : null;
      };
      return () => h('section', { class: 'wave-panel', id: 'editor-waves' }, [
        h('div', { class: 'panel-title row-title' }, [
          h('span', t('waves')),
          h('div', { class: 'wave-header-actions' }, [
            !isEndlessMode.value ? h('button', { type: 'button', class: 'text-button', 'aria-pressed': generatorEditorOpen.value, onClick: toggleGeneratorEditor }, t(generatorEditorOpen.value ? 'generatorBackToWaves' : 'waveGenerators')) : null,
            activeEndlessModule.value ? h('button', { type: 'button', class: 'text-button', disabled: endlessCatalogLoading.value, onClick: openEndlessSettings }, t('endlessSettings')) : null,
            !isEndlessMode.value ? h('label', { class: 'flag-interval-control' }, [h('span', t('flagWaveInterval')),
            h('input', {
              type: 'number', min: 1, value: draft.value.flagWaveInterval,
              disabled: draft.value.preserveGeneratorWaves || draft.value.preserveCustomWaveManager,
              onInput: (event: Event) => setFlagWaveInterval((event.target as HTMLInputElement).value)
            })]) : null,
            !isEndlessMode.value && !generatorEditorOpen.value && draft.value.supportsDynamicZombies ? h('button', {
              type: 'button', class: 'text-button',
              onClick: () => { expandedWaveActionKey.value = 'difficulty'; eventPickerOpen.value = false; activePane.value = 'properties'; inspectorTab.value = 'edit'; }
            }, t('dynamicDifficulty')) : null,
            !isEndlessMode.value && !generatorEditorOpen.value ? h('button', {
              type: 'button', class: 'text-button',
              onClick: () => { expandedWaveActionKey.value = 'settings'; eventPickerOpen.value = false; activePane.value = 'properties'; inspectorTab.value = 'edit'; }
            }, t('waveSettings')) : null,
            !isEndlessMode.value && !generatorEditorOpen.value ? h('button', { type: 'button', class: 'add-button small', onClick: addWave }, [h(PlusOutlined), t('addWave')]) : null
          ])
        ]),
        generatorEditorOpen.value || isEndlessMode.value ? h('div', [
          h(GeneratorPanel, {
            objects: draft.value.unsupportedRawObjects, selectedAlias: selectedGeneratorAlias.value,
            poolTarget: generatorPoolTarget.value, zombieOptions: zombieOptions.value, translate: t, allowCreate: !isEndlessMode.value,
            onSelect: (alias: string) => { selectedGeneratorAlias.value = alias; generatorPoolTarget.value = 'ZombiePool'; },
            onPoolTarget: (key: string) => { generatorPoolTarget.value = key; }, onCreate: createPointGenerator
          }),
          !isEndlessMode.value && draft.value.waves.length ? h('label', { class: 'field-row generator-wave-count' }, [h('span', t('generatorWaveCount')),
          h('input', {
            type: 'number', min: 1, max: 200, value: draft.value.waves.length, 'aria-label': t('generatorWaveCount'),
            onChange: (event: Event) => {
              const count = Math.max(1, Math.min(200, Math.round(Number((event.target as HTMLInputElement).value)) || 1));
              if (count < draft.value.waves.length) {
                Modal.confirm({
                  wrapClassName: 'level-editor-modal-root', title: t('generatorRemoveWaves', { count: draft.value.waves.length - count }),
                  okText: t('remove'), cancelText: t('cancel'), onOk: () => {
                    while (draft.value.waves.length > count) removeWave(draft.value.waves[draft.value.waves.length - 1].id);
                  }
                });
                return;
              }
              markWaveSystemEdited();
              while (draft.value.waves.length < count) draft.value.waves.push(createEmptyWave(draft.value.waves.length + 1));
              syncWaveFlags();
            }
          })]) : null
        ]) : null,
        !isEndlessMode.value ? h('div', { class: 'wave-strip' }, draft.value.waves.map((wave, index) => h('button', {
          type: 'button', class: ['wave-card', selectedWaveId.value === wave.id ? 'active' : '', wave.flag ? 'flag' : ''],
          'aria-label': `${t('selectedWaveNumber', { wave: index + 1 })}: ${wave.zombies.map((zombie) => `${getZombieDisplayName(zombie.code, zombie.label)} ×${zombie.count}`).join(', ')}`,
          'aria-pressed': selectedWaveId.value === wave.id, onClick: () => selectWave(wave.id)
        }, [h('strong', `#${index + 1}`), h('div', { class: 'wave-overview-zombies' }, wave.zombies.map((zombie) => { const asset = zombieOptions.value.find((item) => item.code === zombie.code); return h('span', { title: getZombieDisplayName(zombie.code, zombie.label) }, [asset?.image ? h('img', { src: asset.image, alt: '' }) : h('span', zombie.label || zombie.code), h('span', `×${zombie.count}`)]); })), h('span', pointBudget(index) == null ? t('waveZombieTotal', { count: wave.zombies.reduce((sum, zombie) => sum + zombie.count, 0) }) : t('generatorPointBudget', { count: pointBudget(index) })),
        wave.flag ? h('span', { class: 'wave-flag-badge' }, t('flagWave')) : null]))) : null,
        isEndlessMode.value ? renderEndlessPreview() : null,
        !isEndlessMode.value && !generatorEditorOpen.value && selectedWave.value ? (() => {
          const wave = selectedWave.value;
          const index = draft.value.waves.findIndex((item) => item.id === wave.id);
          return h('div', { class: 'wave-composition' }, [
            h('div', { class: 'wave-canvas' }, [
              h('div', { class: 'selected-wave-toolbar' }, [h('h3', t('selectedWaveNumber', { wave: index + 1 })),
              h('div', { class: 'selected-wave-actions' }, [
                h('button', { type: 'button', disabled: index === 0, 'aria-label': t('moveWaveEarlier'), onClick: () => moveWave(wave.id, -1) }, '←'),
                h('button', { type: 'button', disabled: index === draft.value.waves.length - 1, 'aria-label': t('moveWaveLater'), onClick: () => moveWave(wave.id, 1) }, '→'),
                h('button', { type: 'button', onClick: () => duplicateWave(wave.id) }, [h(CopyOutlined), t('duplicate')]),
                h('button', { type: 'button', onClick: () => insertWaveAfter(wave.id) }, [h(PlusOutlined), t('insert')]),
                draft.value.waves.length > 1 ? h('button', { type: 'button', class: 'danger', onClick: () => removeWave(wave.id) }, [h(DeleteOutlined), t('remove')]) : null
              ])]),
              h('div', { class: 'event-list-heading' }, [h('h3', t('waveSequence')), renderWaveAddMenu(index + 1)]),
              renderWaveActionSequence(wave, index + 1),
              h('h3', { class: 'lane-heading' }, t('waveSpawnAction')),
              renderLanePreview(wave),
              renderDynamicPoolWavePreview(index + 1)
            ]),
            null
          ]);
        })() : null
      ]);
    }
  });

  const WaveInspector = defineComponent({ setup: () => () => selectedWave.value ? renderWaveInspector(selectedWave.value, draft.value.waves.indexOf(selectedWave.value) + 1) : null });

  return { WaveTimeline, WaveInspector };
}
