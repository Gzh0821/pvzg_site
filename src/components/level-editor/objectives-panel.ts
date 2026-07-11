import { computed, defineComponent, h, type PropType, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import {
  STAR_OBJECTIVE_KINDS,
  createProtectObjective,
  createStarObjective,
  getMoldedSquares,
  setMoldedSquares
} from './objective-codec.mjs';

const objectiveKindOptions = [
  ...STAR_OBJECTIVE_KINDS.map((kind) => ({ value: kind, labelKey: `objectiveKind_${kind}` })),
  { value: 'protect', labelKey: 'objectiveKind_protect' }
];

const objectiveFieldDefinitions: Record<string, Array<{ key: string; labelKey: string; min: number }>> = {
  zombieDistance: [{ key: 'TargetDistance', labelKey: 'objectiveDistance', min: 1 }],
  simultaneousPlants: [{ key: 'MaximumPlants', labelKey: 'objectiveMaximumPlants', min: 1 }],
  sunProduced: [{ key: 'TargetSun', labelKey: 'objectiveTargetSun', min: 0 }],
  sunUsed: [{ key: 'MaximumSun', labelKey: 'objectiveMaximumSun', min: 0 }],
  plantsLost: [{ key: 'MaximumPlantsLost', labelKey: 'objectiveMaximumPlantsLost', min: 0 }],
  killInTime: [
    { key: 'Time', labelKey: 'objectiveTime', min: 1 },
    { key: 'ZombiesToKill', labelKey: 'objectiveZombiesToKill', min: 1 }
  ],
  sunHoldout: [{ key: 'HoldoutSeconds', labelKey: 'objectiveHoldoutSeconds', min: 1 }]
};

export default defineComponent({
  name: 'ObjectivesPanel',
  props: {
    system: { type: Object as PropType<any>, required: true },
    plantOptions: { type: Array as PropType<any[]>, default: () => [] },
    selectedCell: { type: Object as PropType<{ row: number; col: number } | null>, default: null },
    selectedCellItems: { type: Array as PropType<any[]>, default: () => [] },
    selectedPlantCode: { type: String, default: '' },
    resolveMoldLocations: {
      type: Function as PropType<(reference: unknown) => Array<{ GridX: number; GridY: number }>>,
      default: () => []
    },
    expertMode: Boolean,
    translate: { type: Function as PropType<(key: string, params?: Record<string, unknown>) => string>, required: true }
  },
  emits: ['select-cell'],
  setup(props, { emit }) {
    const selectedObjectiveId = ref('');
    const newObjectiveKind = ref('beat');
    const entries = computed(() => [
      ...(props.system.starObjectives || []).map((objective: any) => ({ id: objective.id, type: 'star' as const, objective })),
      ...(props.system.protect ? [{ id: 'protect', type: 'protect' as const, objective: props.system.protect }] : [])
    ]);

    watch(
      () => props.system,
      () => {
        selectedObjectiveId.value = props.system.starObjectives?.[0]?.id || (props.system.protect ? 'protect' : '');
        newObjectiveKind.value = 'beat';
      },
      { immediate: true }
    );

    function t(key: string, params?: Record<string, unknown>) {
      return props.translate(key, params);
    }

    function markStarObjectivesEdited() {
      props.system.dirty = true;
      props.system.starDirty = true;
    }

    function markProtectObjectiveEdited() {
      props.system.dirty = true;
      props.system.protectDirty = true;
    }

    function getObjectiveSummary(entry: any) {
      if (entry.type === 'protect') {
        const plants = Array.isArray(entry.objective.objdata?.Plants) ? entry.objective.objdata.Plants : [];
        return t('objectiveProtectCount', { count: plants.length });
      }
      if (entry.objective.kind === 'mold') {
        return t('objectiveMoldCount', { count: getMoldedSquares(entry.objective.objdata, props.resolveMoldLocations).length });
      }
      return (objectiveFieldDefinitions[entry.objective.kind] || [])
        .map((field) => `${t(field.labelKey)} ${entry.objective.objdata?.[field.key] ?? '—'}`)
        .join(' · ');
    }

    function addObjective() {
      if (newObjectiveKind.value === 'protect') {
        if (!props.system.protect) {
          props.system.protect = createProtectObjective(props.system);
          markProtectObjectiveEdited();
        }
        selectedObjectiveId.value = 'protect';
        return;
      }
      const objective = createStarObjective(props.system, newObjectiveKind.value);
      if (!objective) return;
      props.system.starObjectives.push(objective);
      markStarObjectivesEdited();
      selectedObjectiveId.value = objective.id;
    }

    function removeObjective(entry: any) {
      if (entry.type === 'protect') {
        props.system.protect = null;
        markProtectObjectiveEdited();
      } else {
        props.system.starObjectives = props.system.starObjectives.filter((objective: any) => objective.id !== entry.objective.id);
        markStarObjectivesEdited();
      }
      selectedObjectiveId.value = entries.value.find((item) => item.id !== entry.id)?.id || '';
    }

    function getProtectPlants() {
      const plants = props.system.protect?.objdata?.Plants;
      return Array.isArray(plants) ? plants : [];
    }

    function addSelectedCellToProtection() {
      const protect = props.system.protect;
      if (!protect || !props.selectedCell) {
        message.warning(t('objectiveSelectCellPlant'));
        return;
      }
      const cellPlant = props.selectedCellItems.find((item) => item.kind === 'plant');
      const plantCode = cellPlant?.code || props.selectedPlantCode;
      if (!plantCode) {
        message.warning(t('objectiveSelectCellPlant'));
        return;
      }
      const plants = getProtectPlants();
      const existing = plants.find(
        (entry: any) => Number(entry.GridX) === props.selectedCell?.col && Number(entry.GridY) === props.selectedCell?.row
      );
      if (existing) {
        existing.PlantType = plantCode;
        markProtectObjectiveEdited();
        return;
      }
      const previousLength = plants.length;
      protect.objdata.Plants = [
        ...plants,
        { GridX: props.selectedCell.col, GridY: props.selectedCell.row, PlantType: plantCode }
      ];
      if (Number(protect.objdata.MustProtectCount ?? previousLength) === previousLength) {
        protect.objdata.MustProtectCount = previousLength + 1;
      }
      markProtectObjectiveEdited();
    }

    function removeProtectedPlant(index: number) {
      const protect = props.system.protect;
      if (!protect) return;
      const plants = getProtectPlants();
      const previousLength = plants.length;
      protect.objdata.Plants = plants.filter((_: any, plantIndex: number) => plantIndex !== index);
      if (Number(protect.objdata.MustProtectCount ?? previousLength) === previousLength) {
        protect.objdata.MustProtectCount = Math.max(0, previousLength - 1);
      }
      markProtectObjectiveEdited();
    }

    function renderPlantSelect(value: string, onChange: (code: string) => void) {
      const knownPlant = props.plantOptions.some((plant) => plant.code === value);
      return h(
        'select',
        { value, onChange: (event: Event) => onChange((event.target as HTMLSelectElement).value) },
        [
          !knownPlant && value ? h('option', { value }, value) : null,
          ...props.plantOptions.map((plant) => h('option', { value: plant.code }, `${plant.name} (${plant.code})`))
        ].filter(Boolean)
      );
    }

    function renderStarObjectiveInspector(entry: any) {
      const objective = entry.objective;
      if (objective.kind === 'mold') return renderMoldObjectiveInspector(objective);
      const fields = objectiveFieldDefinitions[objective.kind] || [];
      return h('div', { class: 'objective-inspector-body' }, [
        fields.length
          ? h(
              'div',
              { class: 'objective-field-grid' },
              fields.map((field) =>
                h('div', { class: 'field-row compact' }, [
                  h('label', t(field.labelKey)),
                  h('input', {
                    type: 'number',
                    min: field.min,
                    value: objective.objdata?.[field.key] ?? field.min,
                    onInput: (event: Event) => {
                      const value = Number((event.target as HTMLInputElement).value);
                      objective.objdata[field.key] = Math.max(field.min, Number.isFinite(value) ? value : field.min);
                      markStarObjectivesEdited();
                    }
                  })
                ])
              )
            )
          : h('span', { class: 'objective-complete-mark' }, t('objectiveBeatReady')),
        props.expertMode ? h('code', { class: 'objective-alias' }, objective.alias) : null
      ]);
    }

    function renderMoldObjectiveInspector(objective: any) {
      const squares = getMoldedSquares(objective.objdata, props.resolveMoldLocations);
      const selectedSquare = props.selectedCell
        ? squares.find((square: any) => square.GridX === props.selectedCell?.col && square.GridY === props.selectedCell?.row)
        : null;

      function updateSelectedCell() {
        if (!props.selectedCell) {
          message.warning(t('objectiveMoldSelectCell'));
          return;
        }
        const nextSquares = selectedSquare
          ? squares.filter((square: any) => square !== selectedSquare)
          : [...squares, { GridX: props.selectedCell.col, GridY: props.selectedCell.row }];
        setMoldedSquares(objective.objdata, nextSquares);
        markStarObjectivesEdited();
      }

      return h('div', { class: 'objective-inspector-body mold-objective-body' }, [
        h('div', { class: 'mold-control-strip' }, [
          h('div', { class: 'mold-selection-status' }, [
            h('span', { class: 'mold-status-dot', 'aria-hidden': 'true' }),
            h(
              'span',
              props.selectedCell
                ? t(selectedSquare ? 'objectiveMoldSelectedBlocked' : 'objectiveMoldSelectedOpen', {
                    col: props.selectedCell.col + 1,
                    row: props.selectedCell.row + 1
                  })
                : t('objectiveMoldSelectCell')
            )
          ]),
          h('div', { class: 'mold-actions' }, [
            h(
              'button',
              {
                type: 'button',
                class: selectedSquare ? 'text-button danger' : 'add-button small',
                onClick: updateSelectedCell
              },
              [h(selectedSquare ? DeleteOutlined : PlusOutlined), t(selectedSquare ? 'objectiveMoldRemoveSelected' : 'objectiveMoldAddSelected')]
            ),
            h(
              'button',
              {
                type: 'button',
                class: 'text-button danger',
                disabled: !squares.length,
                onClick: () => {
                  setMoldedSquares(objective.objdata, []);
                  markStarObjectivesEdited();
                }
              },
              t('objectiveMoldClear')
            )
          ])
        ]),
        props.expertMode ? h('code', { class: 'objective-alias' }, objective.alias) : null
      ]);
    }

    function renderProtectObjectiveInspector(entry: any) {
      const protect = entry.objective;
      const plants = getProtectPlants();
      return h('div', { class: 'objective-inspector-body protect-objective-body' }, [
        h('div', { class: 'objective-field-grid protect-count-grid' }, [
          h('div', { class: 'field-row compact' }, [
            h('label', t('objectiveMustProtectCount')),
            h('input', {
              type: 'number',
              min: 0,
              value: protect.objdata?.MustProtectCount ?? plants.length,
              onInput: (event: Event) => {
                protect.objdata.MustProtectCount = Math.max(0, Number((event.target as HTMLInputElement).value) || 0);
                markProtectObjectiveEdited();
              }
            })
          ]),
          h('button', { type: 'button', class: 'add-button', onClick: addSelectedCellToProtection }, [
            h(PlusOutlined),
            t('objectiveProtectSelectedCell')
          ])
        ]),
        plants.length
          ? h(
              'div',
              { class: 'protected-plant-list' },
              plants.map((plant: any, index: number) =>
                h('div', { class: 'protected-plant-row' }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'protected-cell-link',
                      onClick: () => emit('select-cell', { row: Number(plant.GridY), col: Number(plant.GridX) })
                    },
                    `${t('columnShort')}${Number(plant.GridX) + 1} · ${t('rowShort')}${Number(plant.GridY) + 1}`
                  ),
                  renderPlantSelect(String(plant.PlantType || ''), (code) => {
                    plant.PlantType = code;
                    markProtectObjectiveEdited();
                  }),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'text-button danger',
                      'aria-label': t('objectiveRemoveProtectedPlant'),
                      onClick: () => removeProtectedPlant(index)
                    },
                    h(DeleteOutlined)
                  )
                ])
              )
            )
          : h('small', { class: 'seed-mode-hint' }, t('objectiveNoProtectedPlants')),
        props.expertMode ? h('code', { class: 'objective-alias' }, protect.alias) : null
      ]);
    }

    return () => {
      const selected = entries.value.find((entry) => entry.id === selectedObjectiveId.value) || entries.value[0];
      return h('section', { class: 'objectives-panel' }, [
        h('div', { class: 'objectives-header' }, [
          h('div', { class: 'objectives-title' }, [
            h('strong', t('objectives')),
            h('span', t('objectiveCount', { count: entries.value.length }))
          ]),
          h('div', { class: 'objective-add-controls' }, [
            h(
              'select',
              {
                'aria-label': t('objectiveAddType'),
                value: newObjectiveKind.value,
                onChange: (event: Event) => (newObjectiveKind.value = (event.target as HTMLSelectElement).value)
              },
              objectiveKindOptions.map((option) =>
                h('option', { value: option.value, disabled: option.value === 'protect' && !!props.system.protect }, t(option.labelKey))
              )
            ),
            h('button', { type: 'button', class: 'add-button small', onClick: addObjective }, [h(PlusOutlined), t('add')])
          ])
        ]),
        entries.value.length
          ? h(
              'div',
              { class: 'objective-tabs', role: 'tablist' },
              entries.value.map((entry) =>
                h(
                  'button',
                  {
                    type: 'button',
                    role: 'tab',
                    class: selected?.id === entry.id ? 'active' : '',
                    'aria-selected': selected?.id === entry.id,
                    onClick: () => (selectedObjectiveId.value = entry.id)
                  },
                  [
                    h('strong', entry.type === 'protect' ? t('objectiveKind_protect') : t(`objectiveKind_${entry.objective.kind}`)),
                    getObjectiveSummary(entry) ? h('small', getObjectiveSummary(entry)) : null
                  ]
                )
              )
            )
          : h('small', { class: 'objective-empty' }, t('objectiveEmpty')),
        selected
          ? h('div', { class: 'objective-inspector' }, [
              h('div', { class: 'objective-inspector-header' }, [
                h('strong', selected.type === 'protect' ? t('objectiveKind_protect') : t(`objectiveKind_${selected.objective.kind}`)),
                h('button', { type: 'button', class: 'text-button danger', onClick: () => removeObjective(selected) }, [
                  h(DeleteOutlined),
                  t('remove')
                ])
              ]),
              selected.type === 'protect' ? renderProtectObjectiveInspector(selected) : renderStarObjectiveInspector(selected)
            ])
          : null
      ]);
    };
  }
});
