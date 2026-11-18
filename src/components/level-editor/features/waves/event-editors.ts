import { createFeatureRegistry } from '../../core/feature-registry.mjs';
import { ADDABLE_WAVE_ACTIONS, addAirDropCompanion, addGridItemSpawnType, addGravestonePoolEntry, addQigongStrike, addThunderCharge, createWaveActionTemplate, getAirDropCompanions, getChiHoleLanes, getDropShipLandingValues, getDropShipProperties, getFrostWindCount, getGridItemSpawnTypes, getGravestonePool, getQigongStrikes, getThunderCharges, hasGravestonePosition, parseGridItemTypeReference, parseZombieTypeReference, removeAirDropCompanion, removeGridItemSpawnType, removeGravestonePoolEntry, removeQigongStrike, removeThunderCharge, setGravestonePoolCount, setGravestonePosition, setDropShipLandingValue, setDropShipRange, setChiHoleLane, setWaveWarningMessage, updateAirDropCompanion, updateGridItemSpawnType, updateGravestonePoolType, updateQigongStrike, updateThunderCharge, setFrostWindCount } from '../../wave-action-codec.mjs';
import { h } from 'vue';
import { selectedSchedulerEvent } from './scheduler-selection.mjs';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { toZombieTypeReference } from '../../wave-codec.mjs';

import type { WaveActionDraft, AddableWaveActionKind } from '../../core/types';
import type { LevelEditorRuntime } from '../../app/use-level-editor';
import type { createFieldRenderers } from '../../ui/field-renderers.ts';
type Bindings = {
  renderEventZombiePoolEditor: (action: WaveActionDraft) => any;
  t: LevelEditorRuntime['t'];
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
  getRawWaveActionLabel: (action: WaveActionDraft) => string;
  getRawWaveActionSummary: (action: WaveActionDraft) => string;
};

export function createEventEditors(bindings: Bindings) {
  const {
    renderEventZombiePoolEditor, t, parseCurrentLevelAlias, getWaveSupportObject,
    getKnownCurrentLevelAliases, updateWaveActionData, draft, selectedWaveId,
    markWaveSystemEdited, createRawWaveAction, createUniqueWaveActionAlias,
    selectedSchedulerChildAliases, pruneWaveSupportObjects, expertMode, updateWaveActionJson,
    renderActionRangeField, renderActionNumberField, newSchedulerChildKind, zombieOptions,
    objectOptions, selectedAsset, newGravestoneType, newGridItemSpawnType, getRawWaveActionLabel,
    getRawWaveActionSummary
  } = bindings;
  function getSchedulerEvents(action: WaveActionDraft) {
    return Array.isArray(action.objdata?.Events) ? action.objdata.Events : [];
  }

  function getSchedulerEventInfo(reference: any, index: number) {
    const alias = typeof reference === 'string' ? parseCurrentLevelAlias(reference) : '';
    const child = alias ? getWaveSupportObject(alias) : undefined;
    const known = Boolean(alias && getKnownCurrentLevelAliases().has(alias));
    return { reference, index, alias, child, known };
  }

  function updateSchedulerRange(action: WaveActionDraft, key: 'TimeBeforeFirst' | 'TimeBetween' | 'Repeat', bound: 'Min' | 'Max', value: number) {
    updateWaveActionData(action, (objdata) => {
      objdata[key] = { ...(objdata[key] || {}), [bound]: Math.max(0, value) };
    });
  }

  function addSchedulerEvent(action: WaveActionDraft, kind: AddableWaveActionKind) {
    const waveIndex = Math.max(1, draft.value.waves.findIndex((wave) => wave.id === selectedWaveId.value) + 1);
    const template = createWaveActionTemplate(kind, waveIndex);
    if (!template) return;
    markWaveSystemEdited();
    const child = createRawWaveAction(createUniqueWaveActionAlias(template.alias), template.objclass, template.objdata);
    draft.value.waveSupportObjects.push(child);
    updateWaveActionData(action, (objdata) => {
      objdata.Events = [...(Array.isArray(objdata.Events) ? objdata.Events : []), `RTID(${child.alias}@CurrentLevel)`];
    });
    selectedSchedulerChildAliases.value[action.id] = child.alias;
  }

  function moveSchedulerEvent(action: WaveActionDraft, index: number, direction: -1 | 1) {
    const events = getSchedulerEvents(action);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= events.length) return;
    updateWaveActionData(action, (objdata) => {
      const next = [...events];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      objdata.Events = next;
    });
  }

  function removeSchedulerEvent(action: WaveActionDraft, index: number) {
    const removedAlias = parseCurrentLevelAlias(String(getSchedulerEvents(action)[index] || ''));
    updateWaveActionData(action, (objdata) => {
      objdata.Events = getSchedulerEvents(action).filter((_, eventIndex) => eventIndex !== index);
    });
    if (selectedSchedulerChildAliases.value[action.id] === removedAlias) {
      const nextReference = getSchedulerEvents(action)[Math.min(index, Math.max(0, getSchedulerEvents(action).length - 1))];
      selectedSchedulerChildAliases.value[action.id] = parseCurrentLevelAlias(String(nextReference || ''));
    }
    pruneWaveSupportObjects();
  }

  function renderSchedulerChildEditor(
    info: ReturnType<typeof getSchedulerEventInfo>,
    schedulerPath: Set<number>
  ) {
    if (!info.alias) {
      return h('small', { class: 'scheduler-reference-state warning' }, t('schedulerInvalidEvent'));
    }
    if (!info.child) {
      return h('small', { class: ['scheduler-reference-state', info.known ? 'preserved' : 'warning'] }, [
        h('code', info.alias),
        t(info.known ? 'schedulerExternalEvent' : 'schedulerMissingEvent')
      ]);
    }
    if (schedulerPath.has(info.child.id)) {
      return h('small', { class: 'scheduler-reference-state preserved' }, [
        h('code', info.child.alias),
        t('schedulerCircularEvent')
      ]);
    }
    const nextPath = new Set(schedulerPath).add(info.child.id);
    const knownFields = renderKnownWaveActionFields(info.child, nextPath);
    const zombiePool = renderEventZombiePoolEditor(info.child);
    return h('div', { class: 'scheduler-child-editor' }, [
      h('strong', getRawWaveActionLabel(info.child)),
      knownFields || (!expertMode.value ? h('small', { class: 'scheduler-reference-state preserved' }, t('schedulerPreservedEvent')) : null),
      zombiePool,
      expertMode.value
        ? h('label', { class: 'raw-json-field' }, [
          h('span', t('rawJson')),
          h('textarea', {
            value: info.child.jsonText,
            spellcheck: 'false',
            onInput: (event: Event) => updateWaveActionJson(info.child!, (event.target as HTMLTextAreaElement).value)
          })
        ])
        : null,
      expertMode.value ? h('code', { class: 'scheduler-child-alias' }, info.child.alias) : null
    ]);
  }

  function renderSchedulerActionFields(action: WaveActionDraft, schedulerPath = new Set<number>()) {
    const path = new Set(schedulerPath).add(action.id);
    const events = getSchedulerEvents(action);
    const infos = events.map((reference, index) => getSchedulerEventInfo(reference, index));
    const selectedInfo = infos[selectedSchedulerEvent(action, selectedSchedulerChildAliases.value, parseCurrentLevelAlias)];
    const data = action.objdata || {};
    return h('div', { class: 'scheduler-editor' }, [
      h('div', { class: 'scheduler-timing-grid' }, [
        renderActionRangeField('schedulerFirstDelay', data.TimeBeforeFirst, (bound, value) => updateSchedulerRange(action, 'TimeBeforeFirst', bound, value)),
        renderActionRangeField('schedulerInterval', data.TimeBetween, (bound, value) => updateSchedulerRange(action, 'TimeBetween', bound, value)),
        renderActionRangeField('schedulerRepeat', data.Repeat, (bound, value) => updateSchedulerRange(action, 'Repeat', bound, value))
      ]),
      h('div', { class: 'scheduler-options' }, [
        h('label', { class: 'check-row' }, [
          h('input', {
            type: 'checkbox',
            checked: Boolean(data.RewardWhenEnded),
            onChange: (event: Event) => updateWaveActionData(action, (objdata) => {
              objdata.RewardWhenEnded = (event.target as HTMLInputElement).checked;
            })
          }),
          t('schedulerRewardWhenEnded')
        ]),
        h('label', { class: 'check-row' }, [
          h('input', {
            type: 'checkbox',
            checked: Boolean(data.SuppressRewardState),
            onChange: (event: Event) => updateWaveActionData(action, (objdata) => {
              objdata.SuppressRewardState = (event.target as HTMLInputElement).checked;
            })
          }),
          t('schedulerSuppressReward')
        ]),
        Object.prototype.hasOwnProperty.call(data, 'EndingWave') || expertMode.value
          ? renderActionNumberField('schedulerEndingWave', data.EndingWave, (value) => updateWaveActionData(action, (objdata) => {
            objdata.EndingWave = Math.max(0, Math.round(value));
          }))
          : null
      ]),
      h('div', { class: 'scheduler-events' }, [
        h('div', { class: 'scheduler-events-heading' }, [
          h('strong', t('schedulerEvents')),
          h('span', events.length)
        ]),
        infos.length
          ? h('div', { class: 'scheduler-event-list' }, infos.map((info) => {
            const active = info === selectedInfo;
            const label = info.child ? getRawWaveActionLabel(info.child) : info.alias || t('schedulerInvalidEvent');
            const summary = info.child
              ? getRawWaveActionSummary(info.child)
              : t(info.known ? 'schedulerExternalEvent' : info.alias ? 'schedulerMissingEvent' : 'schedulerPreservedEvent');
            return h('div', { class: ['scheduler-event-row', active ? 'active' : '', !info.child ? 'preserved' : ''] }, [
              h('button', {
                type: 'button',
                class: 'scheduler-event-main', 'aria-pressed': active,
                onClick: () => { selectedSchedulerChildAliases.value[action.id] = info.alias; }
              }, [
                h('span', { class: 'scheduler-event-index' }, info.index + 1),
                h('span', { class: 'scheduler-event-copy' }, [h('strong', label), h('small', summary)])
              ]),
              h('div', { class: 'scheduler-event-actions' }, [
                h('button', { type: 'button', disabled: info.index === 0, title: t('moveEarlier'), 'aria-label': t('moveEarlier'), onClick: () => moveSchedulerEvent(action, info.index, -1) }, '↑'),
                h('button', { type: 'button', disabled: info.index === infos.length - 1, title: t('moveLater'), 'aria-label': t('moveLater'), onClick: () => moveSchedulerEvent(action, info.index, 1) }, '↓'),
                h('button', { type: 'button', class: 'danger', title: t('remove'), 'aria-label': t('remove'), onClick: () => removeSchedulerEvent(action, info.index) }, h(DeleteOutlined))
              ])
            ]);
          }))
          : h('small', { class: 'seed-mode-hint' }, t('schedulerEmpty')),
        h('div', { class: 'scheduler-add-controls' }, [
          h('select', {
            value: newSchedulerChildKind.value,
            'aria-label': t('waveEventType'),
            onChange: (event: Event) => { newSchedulerChildKind.value = (event.target as HTMLSelectElement).value as AddableWaveActionKind; }
          }, ADDABLE_WAVE_ACTIONS.map((definition: any) => h('option', { value: definition.kind }, t(definition.labelKey)))),
          h('button', { type: 'button', class: 'add-button small', onClick: () => addSchedulerEvent(action, newSchedulerChildKind.value) }, [
            h(PlusOutlined),
            t('schedulerAddEvent')
          ])
        ])
      ]),
      selectedInfo ? renderSchedulerChildEditor(selectedInfo, path) : null
    ]);
  }

  function renderWaveZombieTypeSelect(
    labelKey: string,
    value: string,
    onChange: (code: string) => void,
    allowDefault = false
  ) {
    const knownZombie = zombieOptions.value.some((zombie) => zombie.code === value);
    return h('div', { class: 'field-row compact wave-zombie-type-field' }, [
      h('label', t(labelKey)),
      h(
        'select',
        {
          value,
          onChange: (event: Event) => onChange((event.target as HTMLSelectElement).value)
        },
        [
          allowDefault ? h('option', { value: '' }, t('stageDefault')) : null,
          !knownZombie && value ? h('option', { value }, value) : null,
          ...zombieOptions.value.map((zombie) => h('option', { value: zombie.code }, `${zombie.name} (${zombie.code})`))
        ].filter(Boolean)
      )
    ]);
  }

  function renderWaveObjectTypeSelect(value: string, onChange: (code: string) => void) {
    const knownObject = objectOptions.some((object) => object.code === value);
    return h('div', { class: 'field-row compact wave-object-type-field' }, [
      h('label', t('objectType')),
      h(
        'select',
        {
          value,
          onChange: (event: Event) => onChange((event.target as HTMLSelectElement).value)
        },
        [
          !knownObject && value ? h('option', { value }, value) : null,
          ...objectOptions.map((object) => h('option', { value: object.code }, `${object.name} (${object.code})`))
        ].filter(Boolean)
      )
    ]);
  }

  function renderAirDropCompanions(action: WaveActionDraft) {
    const companions = getAirDropCompanions(action.objdata || {});
    return h('details', { class: 'air-drop-companions', open: companions.length > 0 }, [
      h('summary', t('fixedDropZombies', { count: companions.length })),
      h(
        'div',
        { class: 'air-drop-companion-list' },
        companions.map((companion: any, index: number) =>
          h('div', { class: 'air-drop-companion-row' }, [
            renderWaveZombieTypeSelect('zombieType', String(companion?.Type || ''), (code) => {
              updateWaveActionData(action, (objdata) => {
                updateAirDropCompanion(objdata, index, { Type: code });
              });
            }),
            renderActionNumberField('column', Number(companion?.mX || 0) + 1, (value) => {
              updateWaveActionData(action, (objdata) => {
                updateAirDropCompanion(objdata, index, { mX: Math.min(8, Math.max(0, Math.round(value) - 1)) });
              });
            }, 1, 9),
            renderActionNumberField('rowAssignment', Number(companion?.mY || 0) + 1, (value) => {
              updateWaveActionData(action, (objdata) => {
                updateAirDropCompanion(objdata, index, { mY: Math.min(4, Math.max(0, Math.round(value) - 1)) });
              });
            }, 1, 5),
            h(
              'button',
              {
                type: 'button',
                class: 'text-button danger air-drop-companion-remove',
                title: t('remove'),
                'aria-label': t('remove'),
                onClick: () => {
                  updateWaveActionData(action, (objdata) => removeAirDropCompanion(objdata, index));
                }
              },
              h(DeleteOutlined)
            )
          ])
        )
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'add-button small air-drop-companion-add',
          onClick: () => {
            updateWaveActionData(action, (objdata) => addAirDropCompanion(objdata, selectedAsset.value?.kind === 'zombie' ? selectedAsset.value.code : 'mummy'));
          }
        },
        [h(PlusOutlined), t('addFixedDropZombie')]
      )
    ]);
  }

  function renderAirDropActionFields(action: WaveActionDraft) {
    const data = action.objdata || {};
    const isParachuteRain = action.objclass === 'ParachuteRainZombieSpawnerProps';
    return h('div', { class: 'air-drop-editor' }, [
      h('div', { class: 'wave-action-field-grid' }, [
        renderWaveZombieTypeSelect('airDropZombieType', String(data.SpiderZombieName || ''), (code) => {
          updateWaveActionData(action, (objdata) => {
            objdata.SpiderZombieName = code;
          });
        }),
        renderActionNumberField('eventZombieCount', data.SpiderCount, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.SpiderCount = Math.max(0, Math.round(value));
          });
        }),
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
            objdata.GroupSize = Math.max(1, Math.round(value));
          });
        }, 1),
        renderActionNumberField('timeBeforeFullSpawn', data.TimeBeforeFullSpawn, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.TimeBeforeFullSpawn = Math.max(0, value);
          });
        }),
        renderActionNumberField('timeBetweenGroups', data.TimeBetweenGroups, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.TimeBetweenGroups = Math.max(0, value);
          });
        }),
        renderActionNumberField('zombieFallTime', data.ZombieFallTime, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.ZombieFallTime = Math.max(0, value);
          });
        })
      ]),
      isParachuteRain ? renderAirDropCompanions(action) : null
    ]);
  }

  function renderGravestonePoolEditor(action: WaveActionDraft) {
    const pool = getGravestonePool(action.objdata || {});
    return h('div', { class: 'gravestone-pool-editor' }, [
      h('strong', t('spawnObjectPool')),
      h(
        'div',
        { class: 'gravestone-pool-list' },
        pool.map((entry: any, index: number) => {
          const code = parseGridItemTypeReference(entry?.Type);
          return h('div', { class: 'gravestone-pool-row' }, [
            renderWaveObjectTypeSelect(code, (nextCode) => {
              updateWaveActionData(action, (objdata) => updateGravestonePoolType(objdata, index, nextCode));
            }),
            renderActionNumberField('spawnCount', entry?.Count, (value) => {
              updateWaveActionData(action, (objdata) => setGravestonePoolCount(objdata, index, value));
            }),
            h(
              'button',
              {
                type: 'button',
                class: 'text-button danger gravestone-pool-remove',
                title: t('remove'),
                'aria-label': t('remove'),
                onClick: () => {
                  updateWaveActionData(action, (objdata) => removeGravestonePoolEntry(objdata, index));
                }
              },
              h(DeleteOutlined)
            )
          ]);
        })
      ),
      h('div', { class: 'gravestone-pool-add' }, [
        h(
          'select',
          {
            value: newGravestoneType.value,
            'aria-label': t('objectType'),
            onChange: (event: Event) => {
              newGravestoneType.value = (event.target as HTMLSelectElement).value;
            }
          },
          objectOptions.map((object) => h('option', { value: object.code }, `${object.name} (${object.code})`))
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'add-button small',
            onClick: () => updateWaveActionData(action, (objdata) => addGravestonePoolEntry(objdata, newGravestoneType.value))
          },
          [h(PlusOutlined), t('addSpawnObject')]
        )
      ])
    ]);
  }

  function renderGravestonePositionGrid(action: WaveActionDraft) {
    const data = action.objdata || {};
    return h('div', { class: 'gravestone-position-editor' }, [
      h('strong', t('spawnCandidateCells')),
      h('div', { class: 'gravestone-position-grid', role: 'grid', 'aria-label': t('spawnCandidateCells') }, [
        h('span', { class: 'gravestone-grid-corner', 'aria-hidden': 'true' }),
        ...Array.from({ length: 9 }, (_, column) =>
          h('span', { class: 'gravestone-grid-column', 'aria-hidden': 'true' }, String(column + 1))
        ),
        ...Array.from({ length: 5 }, (_, row) => [
          h('span', { class: 'gravestone-grid-row', 'aria-hidden': 'true' }, String(row + 1)),
          ...Array.from({ length: 9 }, (_, column) => {
            const active = hasGravestonePosition(data, column, row);
            const label = t('spawnCandidateCell', { row: row + 1, column: column + 1 });
            return h(
              'button',
              {
                type: 'button',
                class: ['gravestone-grid-cell', active ? 'active' : ''],
                role: 'gridcell',
                'aria-label': label,
                'aria-pressed': active,
                title: label,
                onClick: () => {
                  updateWaveActionData(action, (objdata) => setGravestonePosition(objdata, column, row, !active));
                }
              },
              active ? '●' : ''
            );
          })
        ]).flat()
      ])
    ]);
  }

  function renderGravestoneActionFields(action: WaveActionDraft) {
    const data = action.objdata || {};
    const hasRange = data.minX !== undefined && data.maxX !== undefined;
    return h('div', { class: 'gravestone-event-editor' }, [
      renderGravestonePoolEditor(action),
      h('div', { class: 'gravestone-event-options' }, [
        h('label', { class: 'compact-checkbox' }, [
          h('input', {
            type: 'checkbox',
            checked: Boolean(data.DisplacePlants),
            onChange: (event: Event) => {
              updateWaveActionData(action, (objdata) => {
                objdata.DisplacePlants = (event.target as HTMLInputElement).checked;
              });
            }
          }),
          h('span', t('displacePlants'))
        ]),
        h('label', { class: 'compact-checkbox' }, [
          h('input', {
            type: 'checkbox',
            checked: hasRange,
            onChange: (event: Event) => {
              updateWaveActionData(action, (objdata) => {
                if ((event.target as HTMLInputElement).checked) {
                  objdata.minX = 3;
                  objdata.maxX = 8;
                } else {
                  delete objdata.minX;
                  delete objdata.maxX;
                }
              });
            }
          }),
          h('span', t('limitSpawnColumns'))
        ]),
        hasRange
          ? h('div', { class: 'gravestone-range-fields' }, [
            renderActionNumberField('columnStart', Number(data.minX || 0) + 1, (value) => {
              updateWaveActionData(action, (objdata) => {
                objdata.minX = Math.min(8, Math.max(0, Math.round(value) - 1));
              });
            }, 1, 9),
            renderActionNumberField('columnEnd', Number(data.maxX || 0) + 1, (value) => {
              updateWaveActionData(action, (objdata) => {
                objdata.maxX = Math.min(8, Math.max(0, Math.round(value) - 1));
              });
            }, 1, 9)
          ])
          : null
      ]),
      renderGravestonePositionGrid(action)
    ]);
  }

  function renderGridItemSpawnActionFields(action: WaveActionDraft) {
    const data = action.objdata || {};
    const sourceTypes = getGridItemSpawnTypes(data);
    return h('div', { class: 'grid-item-spawn-editor' }, [
      h('strong', t('gridItemSpawnSources')),
      h(
        'div',
        { class: 'grid-item-source-list' },
        sourceTypes.map((type: string, index: number) =>
          h('div', { class: 'grid-item-source-row' }, [
            renderWaveObjectTypeSelect(parseGridItemTypeReference(type), (code) => {
              updateWaveActionData(action, (objdata) => updateGridItemSpawnType(objdata, index, code));
            }),
            h(
              'button',
              {
                type: 'button',
                class: 'text-button danger grid-item-source-remove',
                title: t('remove'),
                'aria-label': t('remove'),
                onClick: () => {
                  updateWaveActionData(action, (objdata) => removeGridItemSpawnType(objdata, index));
                }
              },
              h(DeleteOutlined)
            )
          ])
        )
      ),
      h('div', { class: 'grid-item-source-add' }, [
        h(
          'select',
          {
            value: newGridItemSpawnType.value,
            'aria-label': t('objectType'),
            onChange: (event: Event) => {
              newGridItemSpawnType.value = (event.target as HTMLSelectElement).value;
            }
          },
          objectOptions.map((object) => h('option', { value: object.code }, `${object.name} (${object.code})`))
        ),
        h(
          'button',
          {
            type: 'button',
            class: 'add-button small',
            onClick: () => updateWaveActionData(action, (objdata) => addGridItemSpawnType(objdata, newGridItemSpawnType.value))
          },
          [h(PlusOutlined), t('addSpawnSource')]
        )
      ]),
      h('div', { class: 'grid-item-spawn-options' }, [
        renderActionNumberField('additionalPlantfood', data.AdditionalPlantfood, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.AdditionalPlantfood = Math.max(0, Math.round(value));
          });
        }),
        renderActionNumberField('zombieSpawnWaitTime', data.ZombieSpawnWaitTime, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.ZombieSpawnWaitTime = Math.max(0, value);
          });
        }),
        h('label', { class: 'compact-checkbox' }, [
          h('input', {
            type: 'checkbox',
            checked: Boolean(data.SuppressActionIfNoGridItemsFound),
            onChange: (event: Event) => {
              updateWaveActionData(action, (objdata) => {
                objdata.SuppressActionIfNoGridItemsFound = (event.target as HTMLInputElement).checked;
              });
            }
          }),
          h('span', t('skipWithoutSource'))
        ])
      ])
    ]);
  }

  function renderDropShipOffsetSelector(action: WaveActionDraft, key: 'ImpLandingColumns' | 'ImpLandingRows', labelKey: string) {
    const values = getDropShipLandingValues(action.objdata || {}, key);
    return h('div', { class: 'drop-ship-offset-selector' }, [
      h('span', t(labelKey)),
      h(
        'div',
        { class: 'drop-ship-offset-buttons' },
        [0, 1, 2].map((value) => {
          const active = values.includes(value);
          return h(
            'button',
            {
              type: 'button',
              class: active ? 'active' : '',
              'aria-pressed': active,
              onClick: () => {
                updateWaveActionData(action, (objdata) => setDropShipLandingValue(objdata, key, value, !active));
              }
            },
            String(value)
          );
        })
      )
    ]);
  }

  function renderDropShipActionFields(action: WaveActionDraft) {
    const data = action.objdata || {};
    const properties = getDropShipProperties(data);
    return h('div', { class: 'drop-ship-editor' }, [
      h('div', { class: 'drop-ship-basic-grid' }, [
        renderWaveZombieTypeSelect('dropShipType', String(data.DropShipType || ''), (code) => {
          updateWaveActionData(action, (objdata) => {
            objdata.DropShipType = code;
          });
        }),
        renderWaveZombieTypeSelect('dropShipImpType', String(properties.ImpType || ''), (code) => {
          updateWaveActionData(action, (objdata) => {
            objdata.DropShipShiftedProperties = { ...getDropShipProperties(objdata), ImpType: code };
          });
        }),
        renderActionNumberField('column', Number(data.DropShipPosition?.mX || 0) + 1, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.DropShipPosition = {
              ...(objdata.DropShipPosition || {}),
              mX: Math.min(8, Math.max(0, Math.round(value) - 1))
            };
          });
        }, 1, 9),
        renderActionNumberField('rowAssignment', Number(data.DropShipPosition?.mY || 0) + 1, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.DropShipPosition = {
              ...(objdata.DropShipPosition || {}),
              mY: Math.min(4, Math.max(0, Math.round(value) - 1))
            };
          });
        }, 1, 5)
      ]),
      h('div', { class: 'drop-ship-range-grid' }, [
        renderActionRangeField('dropShipImpCount', properties.ImpCount, (bound, value) => {
          updateWaveActionData(action, (objdata) => setDropShipRange(objdata, 'ImpCount', bound, value));
        }),
        renderActionRangeField('dropShipFirstDelay', properties.TimeBeforeFirst, (bound, value) => {
          updateWaveActionData(action, (objdata) => setDropShipRange(objdata, 'TimeBeforeFirst', bound, value));
        }),
        renderActionRangeField('dropShipInterval', properties.TimeBetween, (bound, value) => {
          updateWaveActionData(action, (objdata) => setDropShipRange(objdata, 'TimeBetween', bound, value));
        }),
        renderActionRangeField('dropShipFlightTime', properties.ImpFlyingDuration, (bound, value) => {
          updateWaveActionData(action, (objdata) => setDropShipRange(objdata, 'ImpFlyingDuration', bound, value));
        })
      ]),
      h('div', { class: 'drop-ship-offset-grid' }, [
        renderDropShipOffsetSelector(action, 'ImpLandingColumns', 'dropShipColumnOffsets'),
        renderDropShipOffsetSelector(action, 'ImpLandingRows', 'dropShipRowOffsets')
      ])
    ]);
  }

  function renderThunderChargeActionFields(action: WaveActionDraft) {
    const data = action.objdata || {};
    const charges = getThunderCharges(data);
    const updateRange = (key: 'TimeBeforeFirst' | 'TimeBetween', bound: 'Min' | 'Max', value: number) => {
      updateWaveActionData(action, (objdata) => {
        objdata[key] = { ...(objdata[key] || {}), [bound]: Math.max(0, value) };
      });
    };
    return h('div', { class: 'thunder-charge-editor' }, [
      h('strong', t('thunderCharges')),
      h(
        'div',
        { class: 'thunder-charge-list' },
        charges.map((charge: any, index: number) =>
          h('div', { class: 'thunder-charge-row' }, [
            h('div', { class: 'thunder-sign-buttons', role: 'group', 'aria-label': t('thunderPolarity') }, [
              ...[1, -1].map((sign) =>
                h(
                  'button',
                  {
                    type: 'button',
                    class: Number(charge?.Sign) === sign ? 'active' : '',
                    'aria-pressed': Number(charge?.Sign) === sign,
                    onClick: () => updateWaveActionData(action, (objdata) => updateThunderCharge(objdata, index, { Sign: sign }))
                  },
                  sign > 0 ? '+' : '−'
                )
              )
            ]),
            renderActionNumberField('linkedPlantCount', charge?.LinkedPlantCount, (value) => {
              updateWaveActionData(action, (objdata) => updateThunderCharge(objdata, index, {
                LinkedPlantCount: Math.max(0, Math.round(value))
              }));
            }),
            h(
              'button',
              {
                type: 'button',
                class: 'text-button danger thunder-charge-remove',
                title: t('remove'),
                'aria-label': t('remove'),
                onClick: () => updateWaveActionData(action, (objdata) => removeThunderCharge(objdata, index))
              },
              h(DeleteOutlined)
            )
          ])
        )
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'add-button small thunder-charge-add',
          onClick: () => updateWaveActionData(action, (objdata) => addThunderCharge(objdata, 1))
        },
        [h(PlusOutlined), t('addThunderCharge')]
      ),
      h('div', { class: 'thunder-timing-grid' }, [
        renderActionRangeField('thunderFirstDelay', data.TimeBeforeFirst, (bound, value) => updateRange('TimeBeforeFirst', bound, value)),
        renderActionRangeField('thunderInterval', data.TimeBetween, (bound, value) => updateRange('TimeBetween', bound, value))
      ])
    ]);
  }

  function renderQigongStrikeActionFields(action: WaveActionDraft) {
    const strikes = getQigongStrikes(action.objdata || {});
    return h('div', { class: 'qigong-strike-editor' }, [
      h('strong', t('qigongStrikeList')),
      h(
        'div',
        { class: 'qigong-strike-list' },
        strikes.map((strike: any, index: number) =>
          h('div', { class: 'qigong-strike-row' }, [
            renderWaveZombieTypeSelect('zombieType', String(strike?.Type || ''), (code) => {
              updateWaveActionData(action, (objdata) => updateQigongStrike(objdata, index, { Type: code }));
            }),
            renderActionNumberField('rowAssignment', Number(strike?.Rows?.[0] || 0) + 1, (value) => {
              updateWaveActionData(action, (objdata) => updateQigongStrike(objdata, index, {
                Rows: [Math.min(4, Math.max(0, Math.round(value) - 1))]
              }));
            }, 1, 5),
            renderActionNumberField('column', Number(strike?.Columns?.[0] || 0) + 1, (value) => {
              updateWaveActionData(action, (objdata) => updateQigongStrike(objdata, index, {
                Columns: [Math.min(8, Math.max(0, Math.round(value) - 1))]
              }));
            }, 1, 9),
            renderActionNumberField('delay', strike?.Delay, (value) => {
              updateWaveActionData(action, (objdata) => updateQigongStrike(objdata, index, { Delay: Math.max(0, value) }));
            }),
            h(
              'button',
              {
                type: 'button',
                class: 'text-button danger qigong-strike-remove',
                title: t('remove'),
                'aria-label': t('remove'),
                onClick: () => updateWaveActionData(action, (objdata) => removeQigongStrike(objdata, index))
              },
              h(DeleteOutlined)
            )
          ])
        )
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'add-button small qigong-strike-add',
          onClick: () => updateWaveActionData(action, (objdata) => addQigongStrike(
            objdata,
            selectedAsset.value?.kind === 'zombie' ? selectedAsset.value.code : 'abbot_imp'
          ))
        },
        [h(PlusOutlined), t('addQigongStrike')]
      )
    ]);
  }

  function renderChiHoleActionFields(action: WaveActionDraft) {
    const data = action.objdata || {};
    const lanes = getChiHoleLanes(data);
    return h('div', { class: 'chi-hole-editor' }, [
      h('div', { class: 'chi-hole-basic-grid' }, [
        renderActionNumberField('column', Number(data.Column || 0) + 1, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.Column = Math.min(8, Math.max(0, Math.round(value) - 1));
          });
        }, 1, 9),
        h('div', { class: 'field-row compact' }, [
          h('label', t('chiHoleDirection')),
          h(
            'select',
            {
              value: String(Number(data.Direction || 1)),
              onChange: (event: Event) => {
                updateWaveActionData(action, (objdata) => {
                  objdata.Direction = Number((event.target as HTMLSelectElement).value);
                });
              }
            },
            [1, 2, 3, 4].map((value) => h('option', { value: String(value) }, t('directionValue', { value })))
          )
        ]),
        renderActionNumberField('chiHoleLifeSpan', data.LifeSpan, (value) => {
          updateWaveActionData(action, (objdata) => { objdata.LifeSpan = Math.max(0, value); });
        }),
        renderActionNumberField('chiHoleAbsorbDelay', data.TimeBeforeAbsorbing, (value) => {
          updateWaveActionData(action, (objdata) => { objdata.TimeBeforeAbsorbing = Math.max(0, value); });
        }),
        renderActionNumberField('chiHoleMoveInterval', data.PlantMovingTimeBetweenSquares, (value) => {
          updateWaveActionData(action, (objdata) => { objdata.PlantMovingTimeBetweenSquares = Math.max(0, value); });
        })
      ]),
      h('div', { class: 'chi-hole-lanes' }, [
        h('span', t('affectedLanes')),
        h(
          'div',
          { class: 'chi-hole-lane-buttons' },
          Array.from({ length: 5 }, (_, lane) => {
            const active = lanes.includes(lane);
            return h(
              'button',
              {
                type: 'button',
                class: active ? 'active' : '',
                'aria-pressed': active,
                onClick: () => updateWaveActionData(action, (objdata) => setChiHoleLane(objdata, lane, !active))
              },
              String(lane + 1)
            );
          })
        )
      ]),
      h('div', { class: 'chi-hole-flags' }, [
        h('label', { class: 'compact-checkbox' }, [
          h('input', {
            type: 'checkbox',
            checked: Boolean(data.SuppressesNextWave),
            onChange: (event: Event) => updateWaveActionData(action, (objdata) => {
              objdata.SuppressesNextWave = (event.target as HTMLInputElement).checked;
            })
          }),
          h('span', t('suppressNextWave'))
        ]),
        h('label', { class: 'compact-checkbox' }, [
          h('input', {
            type: 'checkbox',
            checked: Boolean(data.SuppressObjectiveTip),
            onChange: (event: Event) => updateWaveActionData(action, (objdata) => {
              objdata.SuppressObjectiveTip = (event.target as HTMLInputElement).checked;
            })
          }),
          h('span', t('suppressObjectiveTip'))
        ])
      ])
    ]);
  }

  function renderMissileLocateActionFields(action: WaveActionDraft) {
    const data = action.objdata || {};
    return h('div', { class: 'wave-action-field-grid' }, [
      renderActionNumberField('missileCount', data.MissileCount, (value) => {
        updateWaveActionData(action, (objdata) => {
          objdata.MissileCount = Math.max(0, Math.round(value));
        });
      }),
      renderActionNumberField('columnStart', Number(data.ColumnStart || 0) + 1, (value) => {
        updateWaveActionData(action, (objdata) => {
          objdata.ColumnStart = Math.min(8, Math.max(0, Math.round(value) - 1));
        });
      }, 1, 9),
      renderActionNumberField('columnEnd', Number(data.ColumnEnd || 0) + 1, (value) => {
        updateWaveActionData(action, (objdata) => {
          objdata.ColumnEnd = Math.min(8, Math.max(0, Math.round(value) - 1));
        });
      }, 1, 9),
      renderActionNumberField('missileCountdown', data.MissileFallCountdown, (value) => {
        updateWaveActionData(action, (objdata) => {
          objdata.MissileFallCountdown = Math.max(0, value);
        });
      })
    ]);
  }

  function renderWaveWarningActionFields(action: WaveActionDraft) {
    const data = action.objdata || {};
    const messages = data.StringMultiLanguage && typeof data.StringMultiLanguage === 'object'
      ? data.StringMultiLanguage
      : {};
    const renderTextField = (labelKey: string, value: unknown, onInput: (value: string) => void) =>
      h('div', { class: 'field-row compact wave-warning-text-field' }, [
        h('label', t(labelKey)),
        h('input', {
          type: 'text',
          value: String(value || ''),
          onInput: (event: Event) => onInput((event.target as HTMLInputElement).value)
        })
      ]);

    return h('div', { class: 'wave-warning-editor' }, [
      h('div', { class: 'wave-warning-message-grid' }, [
        renderTextField('warningFallbackText', data.String, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.String = value;
          });
        }),
        renderTextField('warningChineseText', messages.zh, (value) => {
          updateWaveActionData(action, (objdata) => setWaveWarningMessage(objdata, 'zh', value));
        }),
        renderTextField('warningEnglishText', messages.en, (value) => {
          updateWaveActionData(action, (objdata) => setWaveWarningMessage(objdata, 'en', value));
        })
      ]),
      h('div', { class: 'wave-action-field-grid wave-warning-settings' }, [
        renderTextField('warningSound', data.Sound, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.Sound = value;
          });
        }),
        renderActionNumberField('duration', data.Duration, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.Duration = Math.max(0, value);
          });
        }),
        renderActionNumberField('warningInitTime', data.InitTime, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.InitTime = Math.max(0, value);
          });
        })
      ])
    ]);
  }

  const eventEditors = createFeatureRegistry();

  eventEditors.register({
    id: 'WaveSchedulerProps', objclass: 'WaveSchedulerProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {

      return renderSchedulerActionFields(action, schedulerPath);
    }
  });

  eventEditors.register({
    id: 'TidalChangeWaveActionProps', objclass: 'TidalChangeWaveActionProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {
      const data = action.objdata || {};
      return h('div', { class: 'wave-action-field-grid' }, [
        renderActionNumberField('tideColumn', data?.TidalChange?.ChangeAmount, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.TidalChange = { ...(objdata.TidalChange || {}), ChangeAmount: value, ChangeType: 'absolute' };
          });
        }, 0, 9)
      ]);
    }
  });

  eventEditors.register({
    id: 'DinoWaveActionProps', objclass: 'DinoWaveActionProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {
      const data = action.objdata || {};
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
  });

  eventEditors.register({
    id: 'StormZombieSpawnerProps', objclass: 'StormZombieSpawnerProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {
      const data = action.objdata || {};
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
            [h('option', { value: 'sandstorm' }, t('styleSandstorm')), h('option', { value: 'snowstorm' }, t('styleSnowstorm'))]
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
  });

  eventEditors.register({
    id: 'SpawnZombiesFromGroundSpawnerProps', objclass: 'SpawnZombiesFromGroundSpawnerProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {
      const data = action.objdata || {};
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
  });

  eventEditors.register({
    id: 'FrostWindWaveActionProps', objclass: 'FrostWindWaveActionProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {
      const data = action.objdata || {};
      return h('div', { class: 'frost-wind-editor' }, [
        h('strong', t('frostWindLanes')),
        h(
          'div',
          { class: 'frost-wind-lanes' },
          Array.from({ length: 5 }, (_, row) =>
            h('div', { class: 'frost-wind-lane' }, [
              h('span', t('rowNumber', { row: row + 1 })),
              ...(['left', 'right'] as const).map((direction) =>
                h('label', { class: `frost-wind-count ${direction}` }, [
                  h('span', direction === 'left' ? '←' : '→'),
                  h('input', {
                    type: 'number',
                    min: 0,
                    max: 9,
                    value: getFrostWindCount(data, row, direction),
                    'aria-label': t(direction === 'left' ? 'frostWindLeftCount' : 'frostWindRightCount', { row: row + 1 }),
                    onInput: (event: Event) => {
                      updateWaveActionData(action, (objdata) => {
                        setFrostWindCount(objdata, row, direction, (event.target as HTMLInputElement).value);
                      });
                    }
                  })
                ])
              )
            ])
          )
        )
      ]);
    }
  });

  eventEditors.register({
    id: 'BeachStageEventZombieSpawnerProps', objclass: 'BeachStageEventZombieSpawnerProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {
      const data = action.objdata || {};
      return h('div', { class: 'wave-action-field-grid' }, [
        renderWaveZombieTypeSelect('zombieType', String(data.ZombieName || ''), (code) => {
          updateWaveActionData(action, (objdata) => {
            objdata.ZombieName = code;
          });
        }),
        renderActionNumberField('eventZombieCount', data.ZombieCount, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.ZombieCount = Math.max(0, Math.round(value));
          });
        }),
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
            objdata.GroupSize = Math.max(1, Math.round(value));
          });
        }, 1),
        renderActionNumberField('timeBeforeFullSpawn', data.TimeBeforeFullSpawn, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.TimeBeforeFullSpawn = Math.max(0, value);
          });
        }),
        renderActionNumberField('timeBetweenGroups', data.TimeBetweenGroups, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.TimeBetweenGroups = Math.max(0, value);
          });
        })
      ]);
    }
  });

  eventEditors.register({
    id: 'RaidingPartyZombieSpawnerProps', objclass: 'RaidingPartyZombieSpawnerProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {
      const data = action.objdata || {};
      const zombieCode = parseZombieTypeReference(data.ZombieType);
      return h('div', { class: 'wave-action-field-grid' }, [
        renderWaveZombieTypeSelect('zombieType', zombieCode, (code) => {
          updateWaveActionData(action, (objdata) => {
            objdata.ZombieType = code ? toZombieTypeReference(code) : '';
          });
        }, true),
        renderActionNumberField('swashbucklerCount', data.SwashbucklerCount, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.SwashbucklerCount = Math.max(0, Math.round(value));
          });
        }),
        renderActionNumberField('groupSize', data.GroupSize, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.GroupSize = Math.max(0, Math.round(value));
          });
        }),
        renderActionNumberField('timeBetweenGroups', data.TimeBetweenGroups, (value) => {
          updateWaveActionData(action, (objdata) => {
            objdata.TimeBetweenGroups = Math.max(0, value);
          });
        })
      ]);
    }
  });

  eventEditors.register({
    id: 'SpiderRainZombieSpawnerProps', objclass: 'SpiderRainZombieSpawnerProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {

      return renderAirDropActionFields(action);
    }
  });

  eventEditors.register({
    id: 'ParachuteRainZombieSpawnerProps', objclass: 'ParachuteRainZombieSpawnerProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {

      return renderAirDropActionFields(action);
    }
  });

  eventEditors.register({
    id: 'SpawnGravestonesWaveActionProps', objclass: 'SpawnGravestonesWaveActionProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {

      return renderGravestoneActionFields(action);
    }
  });

  eventEditors.register({
    id: 'SpawnZombiesFromGridItemSpawnerProps', objclass: 'SpawnZombiesFromGridItemSpawnerProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {

      return renderGridItemSpawnActionFields(action);
    }
  });

  eventEditors.register({
    id: 'DropShipZombieSpawnerProps', objclass: 'DropShipZombieSpawnerProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {

      return renderDropShipActionFields(action);
    }
  });

  eventEditors.register({
    id: 'ThunderChargeWaveActionProps', objclass: 'ThunderChargeWaveActionProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {

      return renderThunderChargeActionFields(action);
    }
  });

  eventEditors.register({
    id: 'QigongStrikeWaveActionProps', objclass: 'QigongStrikeWaveActionProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {

      return renderQigongStrikeActionFields(action);
    }
  });

  eventEditors.register({
    id: 'KongfuChiHoleProps', objclass: 'KongfuChiHoleProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {

      return renderChiHoleActionFields(action);
    }
  });

  eventEditors.register({
    id: 'MissileLocateWaveActionProps', objclass: 'MissileLocateWaveActionProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {

      return renderMissileLocateActionFields(action);
    }
  });

  eventEditors.register({
    id: 'WaveWarningProps', objclass: 'WaveWarningProps', render: (action: WaveActionDraft, schedulerPath: Set<number>) => {

      return renderWaveWarningActionFields(action);
    }
  });

  function renderKnownWaveActionFields(action: WaveActionDraft, schedulerPath = new Set<number>()) {
    return eventEditors.getByClass(action.objclass)?.render(action, schedulerPath) ?? null;
  }
  return { renderKnownWaveActionFields };
}
