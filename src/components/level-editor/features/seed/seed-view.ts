import { defineComponent, h } from 'vue';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { addCardDeck, getCardDecks, removeCardDeckPlant } from '../../card-deck-codec.mjs';
import { normalizeSeedPlants, normalizeSeedSlots } from '../../level-codec.mjs';
import type { PlantListKey, ConveyorPlantEntry, ConveyorWaveModification, ConveyorEditorTarget, ConveyorAdvancedTab, SeedMode, LocaleKey, ConveyorDropDelayCondition, ConveyorSpeedCondition, ConveyorWaveMode } from '../../core/types';
import type { LevelEditorRuntime } from '../../app/use-level-editor';
import type { createFieldRenderers } from '../../ui/field-renderers.ts';

type Bindings = {
  draft: LevelEditorRuntime['draft'];
  plantOptions: LevelEditorRuntime['plantOptions'];
  t: LevelEditorRuntime['t'];
  removePlantFromList: LevelEditorRuntime['removePlantFromList'];
  getPlantDisplayImage: LevelEditorRuntime['getPlantDisplayImage'];
  getPlantDisplayName: LevelEditorRuntime['getPlantDisplayName'];
  openConveyorEditor: LevelEditorRuntime['openConveyorEditor'];
  removeConveyorPlant: LevelEditorRuntime['removeConveyorPlant'];
  addConveyorCondition: LevelEditorRuntime['addConveyorCondition'];
  removeConveyorCondition: LevelEditorRuntime['removeConveyorCondition'];
  selectedPlantAsset: LevelEditorRuntime['selectedPlantAsset'];
  addConveyorWaveModification: LevelEditorRuntime['addConveyorWaveModification'];
  conveyorActionHint: LevelEditorRuntime['conveyorActionHint'];
  removeConveyorWaveModification: LevelEditorRuntime['removeConveyorWaveModification'];
  conveyorAdvancedTab: LevelEditorRuntime['conveyorAdvancedTab'];
  addSelectedConveyorPlant: LevelEditorRuntime['addSelectedConveyorPlant'];
  setSeedSupplyMode: LevelEditorRuntime['setSeedSupplyMode'];
  seedListTarget: LevelEditorRuntime['seedListTarget'];
  selectedDeckIndex: LevelEditorRuntime['selectedDeckIndex'];
  seedActionHint: LevelEditorRuntime['seedActionHint'];
  deckNameLanguage: LevelEditorRuntime['deckNameLanguage'];
  renderActionNumberField: ReturnType<typeof createFieldRenderers>['renderActionNumberField'];
  markConveyorEdited: LevelEditorRuntime['markConveyorEdited'];
  setOptionalNumber: LevelEditorRuntime['setOptionalNumber'];
  setRequiredNumber: LevelEditorRuntime['setRequiredNumber'];
  setConveyorWaveMode: LevelEditorRuntime['setConveyorWaveMode'];
  conveyorEditorTarget: LevelEditorRuntime['conveyorEditorTarget'];
  getConveyorEditorEntry: LevelEditorRuntime['getConveyorEditorEntry'];
};

export function createSeedView(bindings: Bindings) {
  const {
    draft, plantOptions, t, removePlantFromList, getPlantDisplayImage, getPlantDisplayName,
    openConveyorEditor, removeConveyorPlant, addConveyorCondition, removeConveyorCondition,
    selectedPlantAsset, addConveyorWaveModification, conveyorActionHint,
    removeConveyorWaveModification, conveyorAdvancedTab, addSelectedConveyorPlant,
    setSeedSupplyMode, seedListTarget, selectedDeckIndex, seedActionHint, deckNameLanguage,
    renderActionNumberField, markConveyorEdited, setOptionalNumber, setRequiredNumber,
    setConveyorWaveMode, conveyorEditorTarget, getConveyorEditorEntry
  } = bindings;

  function renderPlantPills(listKey: PlantListKey) {
    const list = draft.value[listKey];
    return h(
      'div',
      { class: 'seed-list' },
      list.length
        ? list.map((code, index) => {
          const plant = plantOptions.value.find((item) => item.code === code);
          return h('span', { class: 'seed-pill' }, [
            plant?.image ? h('img', { src: plant.image, alt: plant.name, loading: 'lazy' }) : null,
            h('span', plant?.name || code),
            h('button', { 'aria-label': t('remove'), onClick: () => removePlantFromList(listKey, index) }, 'x')
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

  function renderConveyorAdvancedTabs() {
    const tabs: Array<{ key: ConveyorAdvancedTab; label: string; }> = [
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
    return [
      renderConveyorAdvancedTabs(),
      renderConveyorAdvancedTabPanel()
    ];
  }

  function renderSeedSupplyModeSelector() {
    return h('select', {
      class: 'seed-supply-select', 'aria-label': t('seedSupply'),
      value: draft.value.conveyor.enabled ? 'conveyor' : draft.value.seedMode,
      onChange: (event: Event) => {
        const value = (event.target as HTMLSelectElement).value;
        if (value === 'conveyor') setSeedSupplyMode('conveyor');
        else {
          if (draft.value.conveyor.enabled) setSeedSupplyMode('seedBank');
          draft.value.hasSeedBank = true;
          draft.value.seedMode = value as SeedMode;
          seedListTarget.value = 'seedPlants';
          selectedDeckIndex.value = 0;
        }
      }
    }, [h('option', { value: 'chooser' }, t('seedChooser')), h('option', { value: 'preset' }, t('seedPreset')), h('option', { value: 'conveyor' }, t('conveyor'))]);
  }

  function selectSeedTarget(target: typeof seedListTarget.value) {
    seedListTarget.value = target;
    selectedDeckIndex.value = 0;
    seedActionHint.value = '';
  }

  function renderSeedBankControls() {
    const target = seedListTarget.value;
    const kind = target === 'Recommended' || target === 'Challenging' ? target : null;
    const decks = kind ? getCardDecks(draft.value.seedBankExtra, kind) : [];
    const deck = decks[selectedDeckIndex.value];
    const targets = [
      ['seedPlants', draft.value.seedMode === 'preset' ? 'seedPreset' : 'lockedPlants'],
      ['includePlants', 'includePlants'], ['excludePlants', 'excludePlants'],
      ['Recommended', 'recommendedDecks'], ['Challenging', 'challengingDecks']
    ] as const;
    const visibleTargets = draft.value.seedMode === 'preset' ? targets.slice(0, 1) : targets;
    const body = kind ? [
      h('div', { class: 'deck-list-toolbar' }, [
        h('select', {
          'aria-label': t('selectDeck'), value: selectedDeckIndex.value,
          onChange: (event: Event) => { selectedDeckIndex.value = Number((event.target as HTMLSelectElement).value); }
        }, decks.map((item: any, index: number) => h('option', { value: index },
          item.Name?.[deckNameLanguage.value] || item.Name?.zh || item.Name?.en || t('deckNumber', { index: index + 1 })))),
        h('button', {
          type: 'button', class: 'add-button small', 'aria-label': t('addDeck'), onClick: () => {
            selectedDeckIndex.value = addCardDeck(draft.value.seedBankExtra, kind, deckNameLanguage.value, t('newDeck'));
          }
        }, [h(PlusOutlined), t('addDeck')]),
        deck ? h('button', {
          type: 'button', class: 'text-button danger', 'aria-label': t('removeDeck'), onClick: () => {
            decks.splice(selectedDeckIndex.value, 1); selectedDeckIndex.value = Math.max(0, selectedDeckIndex.value - 1);
          }
        }, h(DeleteOutlined)) : null
      ]),
      deck ? h('div', { class: 'deck-name-row' }, [
        h('label', { class: 'field-row' }, [h('span', t('deckName')), h('input', {
          value: deck.Name?.[deckNameLanguage.value] || '', 'aria-label': t('deckName'),
          onInput: (event: Event) => { deck.Name ??= {}; deck.Name[deckNameLanguage.value] = (event.target as HTMLInputElement).value; }
        })]),
        h('select', {
          'aria-label': t('nameLanguage'), value: deckNameLanguage.value,
          onChange: (event: Event) => { deckNameLanguage.value = (event.target as HTMLSelectElement).value as LocaleKey; }
        }, [['zh', '中文'], ['en', 'English'], ['es', 'Español'], ['ru', 'Русский']].map(([value, label]) => h('option', { value }, label)))
      ]) : null,
      deck && Array.isArray(deck.Plants) ? h('div', { class: 'deck-plants' }, [
        ...deck.Plants.map((code: string, index: number) => {
          const plant = plantOptions.value.find((item) => item.code === code);
          return h('div', { class: ['deck-plant-row', Number(deck.Leader) === index ? 'leader' : ''] }, [
            plant?.image ? h('img', { src: plant.image, alt: '' }) : null,
            h('strong', plant?.name || code),
            h('button', {
              type: 'button', class: 'text-button', 'aria-pressed': Number(deck.Leader) === index,
              onClick: () => { deck.Leader = index; }
            }, t('deckLeader')),
            h('button', {
              type: 'button', class: 'text-button danger', 'aria-label': t('remove'),
              onClick: () => removeCardDeckPlant(deck, index)
            }, h(DeleteOutlined))
          ]);
        }),
        !deck.Plants.length ? h('p', { class: 'editor-empty-action' }, t('pickPlantForDeck')) : null
      ]) : !deck ? h('p', { class: 'editor-empty-action' }, t('createDeckFirst')) : null,
      kind === 'Challenging' && deck ? renderActionNumberField('hugeWaveGem', Number(deck.HugeWaveGem) || 0, (value) => { deck.HugeWaveGem = Math.max(0, value); }) : null,
      kind === 'Challenging' ? h('div', { class: 'deck-challenge-options' }, [
        ...(['ChallengingLocked', 'SuppressChallengingHugeWaveGems'] as const).map((key) => h('label', { class: 'check-row' }, [
          h('input', {
            type: 'checkbox', checked: draft.value.seedBankExtra.CardDecks?.[key] === true,
            onChange: (event: Event) => { draft.value.seedBankExtra.CardDecks ??= {}; draft.value.seedBankExtra.CardDecks[key] = (event.target as HTMLInputElement).checked; }
          }), t(key === 'ChallengingLocked' ? 'challengeLocked' : 'suppressChallengeGems')
        ]))
      ]) : null
    ] : [
      renderPlantPills(target as PlantListKey),
      !draft.value[target as PlantListKey].length ? h('p', { class: 'editor-empty-action' }, t('pickPlantForDeck')) : null,
      target === 'seedPlants' ? h('div', { class: 'seed-inline-options' }, [
        h('label', { class: 'check-row' }, [h('input', {
          type: 'checkbox', checked: draft.value.overrideSeedSlots,
          onChange: (event: Event) => { draft.value.overrideSeedSlots = (event.target as HTMLInputElement).checked; }
        }), t('overrideSeedSlots')]),
        draft.value.overrideSeedSlots ? renderActionNumberField('seedSlots', draft.value.seedSlots, (value) => {
          draft.value.seedSlots = normalizeSeedSlots(value, draft.value.seedPlants.length);
          draft.value.seedPlants = normalizeSeedPlants(draft.value.seedPlants, draft.value.seedSlots, draft.value.seedMode === 'preset');
        }) : null,
        h('label', { class: 'check-row' }, [h('input', {
          type: 'checkbox', checked: draft.value.unlockAll,
          onChange: (event: Event) => { draft.value.unlockAll = (event.target as HTMLInputElement).checked; }
        }), t('unlockAll')])
      ]) : null,
      seedActionHint.value ? h('p', { class: 'action-hint', role: 'status' }, t(seedActionHint.value)) : null
    ];
    return [h('div', { class: ['seed-target-workspace', visibleTargets.length === 1 ? 'single-target' : ''] }, [
      visibleTargets.length > 1 ? h('nav', { class: 'seed-target-list', 'aria-label': t('seedBank') }, visibleTargets.map(([key, label]) => h('button', {
        type: 'button', 'aria-pressed': target === key, onClick: () => selectSeedTarget(key)
      }, [h('span', t(label)), h('span', String(key === 'Recommended' || key === 'Challenging'
        ? getCardDecks(draft.value.seedBankExtra, key).length : draft.value[key].length))]))) : null,
      h('section', { class: 'seed-target-editor' }, [h('h3', t(targets.find(([key]) => key === target)![1])), ...body])
    ])];
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

  function renderConveyorConditionEditor(target: Extract<ConveyorEditorTarget, { kind: 'dropCondition' | 'speedCondition'; }>, entry: ConveyorDropDelayCondition | ConveyorSpeedCondition) {
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

  const PropertyPanel = defineComponent({
    setup() {
      return () =>
        h('aside', { class: 'property-panel-inner' }, [
          h('div', { class: 'property-section' }, [
            h('div', { class: 'seed-supply-header' }, [h('strong', t('seedSupply')), renderSeedSupplyModeSelector()]),
            ...(draft.value.conveyor.enabled ? renderConveyorControls() : renderSeedBankControls())
          ])
        ]);
    }
  });

  return { PropertyPanel, ConveyorEditorPanel };
}
