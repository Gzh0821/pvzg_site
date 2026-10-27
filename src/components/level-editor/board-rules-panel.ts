import { defineComponent, h, type PropType } from 'vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import {
  POWER_TILE_GROUPS,
  createBoardRule,
  getRulePowerTiles,
  getRuleRailcarts,
  getRuleRails,
  normalizeBoardCoordinate
} from './board-rule-codec.mjs';

import { getBoardToolKind } from './board-editing.mjs';
const railcartTypeOptions = [
  'railcart_cowboy',
  'railcart_egypt',
  'railcart_tutorial',
  'railcart_tutorial_above',
  'railcart_beach',
  'railcart_future',
  'railcart_pirate',
  'railcart_dark',
  'railcart_dark_above',
  'railcart_kongfu',
  'railcart'
];

export default defineComponent({
  name: 'BoardRulesPanel',
  props: {
    system: { type: Object as PropType<any>, required: true },
    expertMode: Boolean,
    tool: { type: String, required: true },
    selectedId: { type: String, default: '' },
    powerGroup: { type: String, default: 'alpha' },
    powerDelay: { type: Number, default: 0.25 },
    reservedAliases: { type: Array as PropType<string[]>, default: () => [] },
    translate: { type: Function as PropType<(key: string, params?: Record<string, unknown>) => string>, required: true }
  },
  emits: ['select', 'power-group', 'power-delay'],
  setup(props, { emit }) {
    function t(key: string, params?: Record<string, unknown>) {
      return props.translate(key, params);
    }

    function markBoardRuleEdited(rule: any) {
      rule.dirty = true;
      props.system.dirty = true;
    }

    function addBoardRule() {
      const rule = createBoardRule(props.system, getBoardToolKind(props.tool), props.reservedAliases);
      if (!rule) return;
      props.system.modules.push(rule);
      props.system.dirty = true;
      emit('select', rule.id);
    }

    function removeBoardRule(rule: any) {
      props.system.modules = props.system.modules.filter((entry: any) => entry.id !== rule.id);
      props.system.dirty = true;
      emit('select', props.system.modules.find((entry: any) => entry.kind === rule.kind)?.id || '');
    }

    function removeRailEntry(rule: any, listKey: 'Rails' | 'Railcarts', index: number) {
      const list = listKey === 'Rails' ? getRuleRails(rule) : getRuleRailcarts(rule);
      rule.objdata[listKey] = list.filter((_: any, entryIndex: number) => entryIndex !== index);
      markBoardRuleEdited(rule);
    }

    function renderBoardCoordinateField(label: string, value: unknown, maximum: number, onValue: (value: number) => void) {
      return h('label', { class: 'board-coordinate-field' }, [
        h('span', label),
        h('input', {
          type: 'number',
          min: 1,
          max: maximum + 1,
          value: Number(value) + 1,
          onInput: (event: Event) => onValue(normalizeBoardCoordinate(Number((event.target as HTMLInputElement).value) - 1, maximum))
        })
      ]);
    }

    function renderRailcartRule(rule: any) {
      const railType = String(rule.objdata?.RailcartType || '');
      const types = railType && !railcartTypeOptions.includes(railType) ? [railType, ...railcartTypeOptions] : railcartTypeOptions;
      const rails = getRuleRails(rule);
      const carts = getRuleRailcarts(rule);
      return h('div', { class: 'board-rule-inspector-body' }, [
        h('div', { class: 'field-row compact board-rule-type' }, [
          h('label', { for: 'board-railcart-type' }, t('boardRuleRailcartType')),
          h(
            'select',
            {
              id: 'board-railcart-type', value: railType,
              onChange: (event: Event) => {
                rule.objdata.RailcartType = (event.target as HTMLSelectElement).value;
                markBoardRuleEdited(rule);
              }
            },
            [h('option', { value: '' }, t('stageDefault')), ...types.map((type) => h('option', { value: type }, type))]
          )
        ]),
        props.tool === 'rails' ? h('div', { class: 'board-rule-subsection' }, [
          h('div', { class: 'board-rule-subheading' }, [
            h('strong', t('boardRuleRails'))
          ]),
          rails.length
            ? h(
                'div',
                { class: 'board-rule-entry-list' },
                rails.map((rail: any, index: number) =>
                  h('div', { class: 'board-rule-entry-row rail-entry' }, [
                    renderBoardCoordinateField(t('columnShort'), rail.Column, 8, (value) => {
                      rail.Column = value;
                      markBoardRuleEdited(rule);
                    }),
                    renderBoardCoordinateField(t('boardRuleRowStart'), rail.RowStart, 4, (value) => {
                      rail.RowStart = value;
                      markBoardRuleEdited(rule);
                    }),
                    renderBoardCoordinateField(t('boardRuleRowEnd'), rail.RowEnd, 4, (value) => {
                      rail.RowEnd = value;
                      markBoardRuleEdited(rule);
                    }),
                    h(
                      'button',
                      { type: 'button', class: 'text-button danger', 'aria-label': t('remove'), onClick: () => removeRailEntry(rule, 'Rails', index) },
                      h(DeleteOutlined)
                    )
                  ])
                )
              )
            : h('small', { class: 'seed-mode-hint' }, t('boardRuleNoRails'))
        ]) : null,
        props.tool === 'railcarts' ? h('div', { class: 'board-rule-subsection' }, [
          h('div', { class: 'board-rule-subheading' }, [
            h('strong', t('boardRuleRailcarts'))
          ]),
          carts.length
            ? h(
                'div',
                { class: 'board-rule-entry-list' },
                carts.map((cart: any, index: number) =>
                  h('div', { class: 'board-rule-entry-row cart-entry' }, [
                    renderBoardCoordinateField(t('columnShort'), cart.Column, 8, (value) => {
                      cart.Column = value;
                      markBoardRuleEdited(rule);
                    }),
                    renderBoardCoordinateField(t('rowShort'), cart.Row, 4, (value) => {
                      cart.Row = value;
                      markBoardRuleEdited(rule);
                    }),
                    h(
                      'button',
                      { type: 'button', class: 'text-button danger', 'aria-label': t('remove'), onClick: () => removeRailEntry(rule, 'Railcarts', index) },
                      h(DeleteOutlined)
                    )
                  ])
                )
              )
            : h('small', { class: 'seed-mode-hint' }, t('boardRuleNoRailcarts'))
        ]) : null,
        props.expertMode && Array.isArray(rule.objdata?.DynamicRailCarts)
          ? h('small', { class: 'seed-mode-hint' }, t('boardRuleDynamicRailPreserved'))
          : null
      ]);
    }

    function renderTideRule(rule: any) {
      return h('div', { class: 'board-rule-inspector-body' }, [
        h('div', { class: 'field-row compact' }, [
          h('label', { for: 'board-starting-tide' }, t('boardRuleStartingTide')),
          h('input', {
            type: 'number',
            min: 0,
            max: 9, id: 'board-starting-tide',
            value: rule.objdata?.StartingWaveLocation ?? 5,
            onInput: (event: Event) => {
              rule.objdata.StartingWaveLocation = normalizeBoardCoordinate((event.target as HTMLInputElement).value, 9);
              markBoardRuleEdited(rule);
            }
          })
        ])
      ]);
    }

    function renderPlankRule(rule: any) {
      const rows = new Set<number>((Array.isArray(rule.objdata?.PlankRows) ? rule.objdata.PlankRows : []).map(Number));
      return h('div', { class: 'board-rule-inspector-body' }, [
        h(
          'div',
          { class: 'plank-row-toggles', role: 'group', 'aria-label': t('boardRulePlankRows') },
          Array.from({ length: 5 }, (_, row) =>
            h(
              'button',
              {
                type: 'button',
                class: rows.has(row) ? 'active' : '',
                'aria-pressed': rows.has(row),
                onClick: () => {
                  if (rows.has(row)) rows.delete(row);
                  else rows.add(row);
                  rule.objdata.PlankRows = [...rows].sort((left, right) => left - right);
                  markBoardRuleEdited(rule);
                }
              },
              t('rowNumber', { row: row + 1 })
            )
          )
        )
      ]);
    }

    function setPowerTileDelay(rule: any, group: string, value: unknown) {
      const numericValue = Math.max(0, Number(value) || 0);
      emit('power-delay', numericValue);
      if (!rule) return;
      let changed = false;
      rule.objdata.LinkedTiles = getRulePowerTiles(rule).map((tile: any) => {
        if (tile.Group !== group) return tile;
        changed = true;
        return { ...tile, PropagationDelay: numericValue };
      });
      if (changed) markBoardRuleEdited(rule);
    }

    function renderPowerTileRule(rule: any) {
      return h('div', { class: 'board-rule-inspector-body power-tile-editor' }, [
        h(
          'div',
          { class: 'power-tile-groups', role: 'group', 'aria-label': t('boardRulePowerTileGroup') },
          POWER_TILE_GROUPS.map((group) =>
            h(
              'button',
              {
                type: 'button',
                class: props.powerGroup === group ? `power-group-${group} active` : `power-group-${group}`,
                'aria-pressed': props.powerGroup === group,
                onClick: () => emit('power-group', group)
              },
              [
                h('img', { src: `/assets/image/objects/object_powertile_${group}.png`, alt: '', loading: 'lazy' }),
                h('span', t(`boardRulePowerGroup_${group}`))
              ]
            )
          )
        ),
        h('div', { class: 'power-tile-control-strip' }, [
          h('label', { class: 'board-coordinate-field power-delay-field' }, [
            h('span', t('boardRulePowerDelay')),
            h('input', {
              type: 'number',
              min: 0,
              step: 0.05,
              value: props.powerDelay,
              onInput: (event: Event) =>
                setPowerTileDelay(rule, props.powerGroup, (event.target as HTMLInputElement).value)
            })
          ])
        ])
      ]);
    }

    return () => {
      const kind = getBoardToolKind(props.tool);
      const entries = (props.system.modules || []).filter((rule: any) => rule.kind === kind);
      const selected = entries.find((rule: any) => rule.id === props.selectedId) || entries[0];
      return h('section', { class: 'board-rules-panel direct-board-rules' }, [
        h('div', { class: 'board-rules-header' }, [
          entries.length > 1 ? h('select', { value: selected?.id, 'aria-label': t('boardRuleEditTarget'),
            onChange: (event: Event) => emit('select', (event.target as HTMLSelectElement).value)
          }, entries.map((rule: any, index: number) => h('option', { value: rule.id }, `${t(`boardRuleKind_${rule.kind}`)} #${index + 1}`))) : null,
          props.expertMode && selected ? h('code', selected.alias) : null,
          h('button', { type: 'button', class: 'add-button small', onClick: addBoardRule }, [h(PlusOutlined), t('boardRuleNewGroup')]),
          selected ? h('button', { type: 'button', class: 'text-button danger', onClick: () => removeBoardRule(selected) }, [h(DeleteOutlined), t('boardRuleRemoveGroup')]) : null
        ]),
        selected ? selected.kind === 'railcart' ? renderRailcartRule(selected)
          : selected.kind === 'tide' ? renderTideRule(selected)
            : selected.kind === 'powerTiles' ? renderPowerTileRule(selected) : renderPlankRule(selected)
          : h('div', [kind === 'powerTiles' ? renderPowerTileRule(null) : null, h('p', { class: 'editor-empty-action' }, t(kind === 'tide' ? 'boardToolTideHint' : 'boardToolClickToAdd'))])
      ]);
    };
  }
});
