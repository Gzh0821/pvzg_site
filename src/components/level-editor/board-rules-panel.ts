import { defineComponent, h, type PropType, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import {
  BOARD_RULE_KINDS,
  POWER_TILE_GROUPS,
  createBoardRule,
  getPowerTileAt,
  getRulePowerTiles,
  getRuleRailcarts,
  getRuleRails,
  normalizeBoardCoordinate
} from './board-rule-codec.mjs';

const boardRuleKindOptions = BOARD_RULE_KINDS.map((kind) => ({ value: kind, labelKey: `boardRuleKind_${kind}` }));
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
    selectedCell: { type: Object as PropType<{ row: number; col: number } | null>, default: null },
    expertMode: Boolean,
    translate: { type: Function as PropType<(key: string, params?: Record<string, unknown>) => string>, required: true }
  },
  setup(props) {
    const selectedBoardRuleId = ref('');
    const newBoardRuleKind = ref('railcart');
    const selectedPowerTileGroup = ref('alpha');
    const powerTileGroupDelays = ref<Record<string, number>>({});

    watch(
      () => props.system,
      () => {
        selectedBoardRuleId.value = props.system.modules?.[0]?.id || '';
        newBoardRuleKind.value = 'railcart';
        selectedPowerTileGroup.value = 'alpha';
        powerTileGroupDelays.value = {};
      },
      { immediate: true }
    );

    function t(key: string, params?: Record<string, unknown>) {
      return props.translate(key, params);
    }

    function getBoardRuleSummary(rule: any) {
      if (rule.kind === 'railcart') {
        return t('boardRuleRailSummary', { rails: getRuleRails(rule).length, carts: getRuleRailcarts(rule).length });
      }
      if (rule.kind === 'tide') return t('boardRuleTideSummary', { column: Number(rule.objdata?.StartingWaveLocation ?? 0) });
      if (rule.kind === 'powerTiles') return t('boardRulePowerTileSummary', { count: getRulePowerTiles(rule).length });
      const rows = Array.isArray(rule.objdata?.PlankRows) ? rule.objdata.PlankRows.length : 0;
      return t('boardRulePlankSummary', { count: rows });
    }

    function markBoardRuleEdited(rule: any) {
      rule.dirty = true;
      props.system.dirty = true;
    }

    function addBoardRule() {
      const rule = createBoardRule(props.system, newBoardRuleKind.value);
      if (!rule) return;
      props.system.modules.push(rule);
      props.system.dirty = true;
      selectedBoardRuleId.value = rule.id;
    }

    function removeBoardRule(rule: any) {
      props.system.modules = props.system.modules.filter((entry: any) => entry.id !== rule.id);
      props.system.dirty = true;
      selectedBoardRuleId.value = props.system.modules[0]?.id || '';
    }

    function addRailAtSelectedColumn(rule: any) {
      if (!props.selectedCell) {
        message.warning(t('boardRuleSelectCell'));
        return;
      }
      rule.objdata.Rails = [...getRuleRails(rule), { Column: props.selectedCell.col, RowStart: 0, RowEnd: 4 }];
      markBoardRuleEdited(rule);
    }

    function addRailcartAtSelectedCell(rule: any) {
      if (!props.selectedCell) {
        message.warning(t('boardRuleSelectCell'));
        return;
      }
      rule.objdata.Railcarts = [...getRuleRailcarts(rule), { Column: props.selectedCell.col, Row: props.selectedCell.row }];
      markBoardRuleEdited(rule);
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
          min: 0,
          max: maximum,
          value,
          onInput: (event: Event) => onValue(normalizeBoardCoordinate((event.target as HTMLInputElement).value, maximum))
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
          h('label', t('boardRuleRailcartType')),
          h(
            'select',
            {
              value: railType,
              onChange: (event: Event) => {
                rule.objdata.RailcartType = (event.target as HTMLSelectElement).value;
                markBoardRuleEdited(rule);
              }
            },
            [h('option', { value: '' }, t('stageDefault')), ...types.map((type) => h('option', { value: type }, type))]
          )
        ]),
        h('div', { class: 'board-rule-subsection' }, [
          h('div', { class: 'board-rule-subheading' }, [
            h('strong', t('boardRuleRails')),
            h('button', { type: 'button', class: 'add-button small', onClick: () => addRailAtSelectedColumn(rule) }, [
              h(PlusOutlined),
              t('boardRuleAddRail')
            ])
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
        ]),
        h('div', { class: 'board-rule-subsection' }, [
          h('div', { class: 'board-rule-subheading' }, [
            h('strong', t('boardRuleRailcarts')),
            h('button', { type: 'button', class: 'add-button small', onClick: () => addRailcartAtSelectedCell(rule) }, [
              h(PlusOutlined),
              t('boardRuleAddRailcart')
            ])
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
        ]),
        props.expertMode && Array.isArray(rule.objdata?.DynamicRailCarts)
          ? h('small', { class: 'seed-mode-hint' }, t('boardRuleDynamicRailPreserved'))
          : null
      ]);
    }

    function renderTideRule(rule: any) {
      return h('div', { class: 'board-rule-inspector-body' }, [
        h('div', { class: 'field-row compact' }, [
          h('label', t('boardRuleStartingTide')),
          h('input', {
            type: 'number',
            min: 0,
            max: 9,
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

    function getPowerTileDelay(rule: any, group: string) {
      const key = `${rule.id}:${group}`;
      if (Number.isFinite(powerTileGroupDelays.value[key])) return powerTileGroupDelays.value[key];
      const importedDelay = Number(getRulePowerTiles(rule).find((tile: any) => tile.Group === group)?.PropagationDelay);
      return Number.isFinite(importedDelay) ? importedDelay : 0.25;
    }

    function setPowerTileDelay(rule: any, group: string, value: unknown) {
      const numericValue = Math.max(0, Number(value) || 0);
      powerTileGroupDelays.value[`${rule.id}:${group}`] = numericValue;
      let changed = false;
      rule.objdata.LinkedTiles = getRulePowerTiles(rule).map((tile: any) => {
        if (tile.Group !== group) return tile;
        changed = true;
        return { ...tile, PropagationDelay: numericValue };
      });
      if (changed) markBoardRuleEdited(rule);
    }

    function setSelectedPowerTile(rule: any) {
      if (!props.selectedCell) {
        message.warning(t('boardRuleSelectCell'));
        return;
      }
      const tiles = getRulePowerTiles(rule);
      const existing = getPowerTileAt(rule, props.selectedCell.row, props.selectedCell.col);
      const replacement = {
        ...(existing || {}),
        Group: selectedPowerTileGroup.value,
        Location: { ...(existing?.Location || {}), mX: props.selectedCell.col, mY: props.selectedCell.row },
        PropagationDelay: getPowerTileDelay(rule, selectedPowerTileGroup.value)
      };
      rule.objdata.LinkedTiles = existing
        ? tiles.map((tile: any) => (tile === existing ? replacement : tile))
        : [...tiles, replacement];
      markBoardRuleEdited(rule);
    }

    function removeSelectedPowerTile(rule: any) {
      if (!props.selectedCell) {
        message.warning(t('boardRuleSelectCell'));
        return;
      }
      const tiles = getRulePowerTiles(rule);
      rule.objdata.LinkedTiles = tiles.filter(
        (tile: any) => Number(tile?.Location?.mX) !== props.selectedCell?.col || Number(tile?.Location?.mY) !== props.selectedCell?.row
      );
      if (rule.objdata.LinkedTiles.length !== tiles.length) markBoardRuleEdited(rule);
    }

    function renderPowerTileRule(rule: any) {
      const tiles = getRulePowerTiles(rule);
      const selectedTile = props.selectedCell ? getPowerTileAt(rule, props.selectedCell.row, props.selectedCell.col) : null;
      return h('div', { class: 'board-rule-inspector-body power-tile-editor' }, [
        h(
          'div',
          { class: 'power-tile-groups', role: 'group', 'aria-label': t('boardRulePowerTileGroup') },
          POWER_TILE_GROUPS.map((group) =>
            h(
              'button',
              {
                type: 'button',
                class: selectedPowerTileGroup.value === group ? `power-group-${group} active` : `power-group-${group}`,
                'aria-pressed': selectedPowerTileGroup.value === group,
                onClick: () => (selectedPowerTileGroup.value = group)
              },
              [
                h('img', { src: `/assets/image/objects/object_powertile_${group}.png`, alt: '', loading: 'lazy' }),
                h('span', t(`boardRulePowerGroup_${group}`)),
                h('small', t('boardRulePowerGroupCount', { count: tiles.filter((tile: any) => tile.Group === group).length }))
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
              value: getPowerTileDelay(rule, selectedPowerTileGroup.value),
              onInput: (event: Event) =>
                setPowerTileDelay(rule, selectedPowerTileGroup.value, (event.target as HTMLInputElement).value)
            })
          ]),
          h('div', { class: 'power-selected-cell' }, [
            h('span',
              props.selectedCell
                ? t(selectedTile ? 'boardRulePowerSelectedFilled' : 'boardRulePowerSelectedEmpty', {
                    col: props.selectedCell.col + 1,
                    row: props.selectedCell.row + 1
                  })
                : t('boardRuleSelectCell')
            ),
            h('div', { class: 'power-tile-actions' }, [
              h('button', { type: 'button', class: 'add-button small', onClick: () => setSelectedPowerTile(rule) }, [
                h(PlusOutlined),
                t(selectedTile ? 'boardRulePowerUpdateSelected' : 'boardRulePowerAddSelected')
              ]),
              selectedTile
                ? h('button', { type: 'button', class: 'text-button danger', onClick: () => removeSelectedPowerTile(rule) }, [
                    h(DeleteOutlined),
                    t('remove')
                  ])
                : null
            ])
          ])
        ])
      ]);
    }

    return () => {
      const entries = props.system.modules || [];
      const selected = entries.find((rule: any) => rule.id === selectedBoardRuleId.value) || entries[0];
      return h('section', { class: 'board-rules-panel' }, [
        h('div', { class: 'board-rules-header' }, [
          h('div', { class: 'board-rules-title' }, [
            h('strong', t('boardRules')),
            h('span', t('objectiveCount', { count: entries.length }))
          ]),
          h('div', { class: 'board-rule-add-controls' }, [
            h(
              'select',
              {
                'aria-label': t('boardRuleAddType'),
                value: newBoardRuleKind.value,
                onChange: (event: Event) => (newBoardRuleKind.value = (event.target as HTMLSelectElement).value)
              },
              boardRuleKindOptions.map((option) => h('option', { value: option.value }, t(option.labelKey)))
            ),
            h('button', { type: 'button', class: 'add-button small', onClick: addBoardRule }, [h(PlusOutlined), t('add')])
          ])
        ]),
        entries.length
          ? h(
              'div',
              { class: 'board-rule-tabs', role: 'tablist' },
              entries.map((rule: any) =>
                h(
                  'button',
                  {
                    type: 'button',
                    role: 'tab',
                    class: selected?.id === rule.id ? 'active' : '',
                    'aria-selected': selected?.id === rule.id,
                    onClick: () => (selectedBoardRuleId.value = rule.id)
                  },
                  [h('strong', t(`boardRuleKind_${rule.kind}`)), h('small', getBoardRuleSummary(rule))]
                )
              )
            )
          : null,
        selected
          ? h('div', { class: 'board-rule-inspector' }, [
              h('div', { class: 'board-rule-inspector-header' }, [
                h('div', [h('strong', t(`boardRuleKind_${selected.kind}`)), props.expertMode ? h('code', selected.alias) : null]),
                h('button', { type: 'button', class: 'text-button danger', onClick: () => removeBoardRule(selected) }, [
                  h(DeleteOutlined),
                  t('remove')
                ])
              ]),
              selected.kind === 'railcart'
                ? renderRailcartRule(selected)
                : selected.kind === 'tide'
                  ? renderTideRule(selected)
                  : selected.kind === 'powerTiles'
                    ? renderPowerTileRule(selected)
                    : renderPlankRule(selected)
            ])
          : null
      ]);
    };
  }
});
