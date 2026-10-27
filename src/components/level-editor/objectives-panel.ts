import { computed, defineComponent, h, type PropType, ref } from 'vue';
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
    resolveMoldLocations: {
      type: Function as PropType<(reference: unknown) => Array<{ GridX: number; GridY: number }>>,
      default: () => []
    },
    expertMode: Boolean,
    context: { type: String, default: 'basic' },
    tool: { type: String, default: '' },
    selectedId: { type: String, default: '' },
    reservedAliases: { type: Array as PropType<string[]>, default: () => [] },
    translate: { type: Function as PropType<(key: string, params?: Record<string, unknown>) => string>, required: true }
  },
  emits: ['select-cell', 'edit-board', 'select'],
  setup(props, { emit }) {
    const newObjectiveKind = ref('beat');
    const entries = computed(() => [
      ...(props.system.starObjectives || []).map((objective: any) => ({ id: objective.id, type: 'star' as const, objective })),
      ...(props.system.protect ? [{ id: 'protect', type: 'protect' as const, objective: props.system.protect }] : [])
    ]);

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
          props.system.protect = createProtectObjective(props.system, props.reservedAliases);
          markProtectObjectiveEdited();
        }
        emit('edit-board', { tool: 'protect', id: 'protect' });
        return;
      }
      const objective = createStarObjective(props.system, newObjectiveKind.value, props.reservedAliases);
      if (!objective) return;
      props.system.starObjectives.push(objective);
      markStarObjectivesEdited();
      if (objective.kind === 'mold') emit('edit-board', { tool: 'mold', id: objective.id });
    }

    function removeObjective(entry: any) {
      if (entry.type === 'protect') {
        props.system.protect = null;
        markProtectObjectiveEdited();
      } else {
        props.system.starObjectives = props.system.starObjectives.filter((objective: any) => objective.id !== entry.objective.id);
        markStarObjectivesEdited();
      }
      emit('select', entries.value.find((item) => item.id !== entry.id)?.id || '');
    }

    function getProtectPlants() {
      const plants = props.system.protect?.objdata?.Plants;
      return Array.isArray(plants) ? plants : [];
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
        { value, 'aria-label': t('objectiveProtectedPlant'), onChange: (event: Event) => onChange((event.target as HTMLSelectElement).value) },
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
                h('label', { class: 'field-row compact' }, [
                  h('span', t(field.labelKey)),
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
          : null,
        props.expertMode ? h('code', { class: 'objective-alias' }, objective.alias) : null
      ]);
    }

    function renderMoldObjectiveInspector(objective: any) {
      const squares = getMoldedSquares(objective.objdata, props.resolveMoldLocations);
      return h('div', { class: 'objective-inspector-body mold-objective-body' }, [
        h('span', t('objectiveMoldCount', { count: squares.length })),
        h('button', { type: 'button', class: 'text-button danger', disabled: !squares.length, onClick: () => {
          setMoldedSquares(objective.objdata, []);
          markStarObjectivesEdited();
        } }, t('objectiveMoldClear')),
        props.expertMode ? h('code', { class: 'objective-alias' }, objective.alias) : null
      ]);
    }

    function renderProtectObjectiveInspector(entry: any) {
      const protect = entry.objective;
      const plants = getProtectPlants();
      return h('div', { class: 'objective-inspector-body protect-objective-body' }, [
        h('div', { class: 'objective-field-grid protect-count-grid' }, [
          h('label', { class: 'field-row compact' }, [
            h('span', t('objectiveMustProtectCount')),
            h('input', {
              type: 'number',
              min: 0,
              value: protect.objdata?.MustProtectCount ?? plants.length,
              onInput: (event: Event) => {
                protect.objdata.MustProtectCount = Math.max(0, Number((event.target as HTMLInputElement).value) || 0);
                markProtectObjectiveEdited();
              }
            })
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
      if (props.context === 'board') {
        const candidates = entries.value.filter((entry) => props.tool === 'protect' ? entry.type === 'protect' : entry.objective.kind === 'mold');
        const selected = candidates.find((entry) => entry.id === props.selectedId) || candidates[0];
        return h('section', { class: 'objectives-panel direct-board-objectives' }, [
          selected ? h('div', [
            h('div', { class: 'objective-inspector-header' }, [
              candidates.length > 1 ? h('select', { value: selected.id, 'aria-label': t('objectiveEditTarget'),
                onChange: (event: Event) => emit('select', (event.target as HTMLSelectElement).value)
              }, candidates.map((entry, index) => h('option', { value: entry.id }, `${t('objectiveKind_mold')} #${index + 1}`))) : null,
              h('button', { type: 'button', class: 'text-button danger', onClick: () => removeObjective(selected) }, [h(DeleteOutlined), t('remove')])
            ]),
            selected.type === 'protect' ? renderProtectObjectiveInspector(selected) : renderMoldObjectiveInspector(selected.objective)
          ]) : h('p', { class: 'editor-empty-action' }, t('boardToolClickToAdd'))
        ]);
      }
      return h('section', { class: 'objectives-panel inline-objectives' }, [
        h('div', { class: 'objectives-header' }, [
          h('div', { class: 'objectives-title' }, [h('strong', t('objectives')), h('span', t('objectiveCount', { count: entries.value.length }))]),
          h('div', { class: 'objective-add-controls' }, [
            h('select', { 'aria-label': t('objectiveAddType'), value: newObjectiveKind.value,
              onChange: (event: Event) => (newObjectiveKind.value = (event.target as HTMLSelectElement).value)
            }, objectiveKindOptions.map((option) => h('option', { value: option.value, disabled: option.value === 'protect' && !!props.system.protect }, t(option.labelKey)))),
            h('button', { type: 'button', class: 'add-button small', onClick: addObjective }, [h(PlusOutlined), t('add')])
          ])
        ]),
        h('div', { class: 'objective-rows' }, entries.value.map((entry) => {
          const spatial = entry.type === 'protect' || entry.objective.kind === 'mold';
          const title = entry.type === 'protect' ? t('objectiveKind_protect') : t(`objectiveKind_${entry.objective.kind}`);
          return h('div', { class: 'objective-row' }, [
            h('strong', title),
            spatial ? h('div', { class: 'objective-board-link' }, [h('span', getObjectiveSummary(entry)),
              h('button', { type: 'button', class: 'text-button', onClick: () => emit('edit-board', { tool: entry.type === 'protect' ? 'protect' : 'mold', id: entry.id }) }, t('objectiveEditOnBoard'))
            ]) : renderStarObjectiveInspector(entry),
            h('button', { type: 'button', class: 'text-button danger', 'aria-label': `${t('remove')} ${title}`, onClick: () => removeObjective(entry) }, h(DeleteOutlined))
          ]);
        }))
      ]);
    };
  }
});
