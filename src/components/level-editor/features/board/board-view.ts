import { getMoldedSquares, setMoldedSquares } from '../../objective-codec.mjs';
import { resolveBoardGridMapSquares } from '../../../game-data/board-grid-maps';
import { computed, defineComponent, h } from 'vue';
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { getPowerTileAt, getRulePowerTiles, getRuleRailcarts, getRuleRails, normalizeBoardCoordinate } from '../../board-rule-codec.mjs';
import { BOARD_TOOLS, getBoardToolKind } from '../../board-editing.mjs';
import BoardRulesPanel from '../../board-rules-panel';
import ObjectivesPanel from '../../objectives-panel';
import type { BoardItem, BoardRuleModuleDraft, StarObjectiveDraft, CellEffectEntry } from '../../core/types';
import type { LevelEditorRuntime } from '../../app/use-level-editor';

type Bindings = {
  getBossAtCell: LevelEditorRuntime['getBossAtCell'];
  t: LevelEditorRuntime['t'];
  draft: LevelEditorRuntime['draft'];
  expertMode: LevelEditorRuntime['expertMode'];
  preservedPlacementExtraEntries: LevelEditorRuntime['preservedPlacementExtraEntries'];
  setBoardItemIcecubed: LevelEditorRuntime['setBoardItemIcecubed'];
  setBoardItemPlantfood: LevelEditorRuntime['setBoardItemPlantfood'];
  formatPlacementExtraValue: LevelEditorRuntime['formatPlacementExtraValue'];
  removeBoardItem: LevelEditorRuntime['removeBoardItem'];
  getBoardItemImage: LevelEditorRuntime['getBoardItemImage'];
  getBoardItemLayer: LevelEditorRuntime['getBoardItemLayer'];
  getBoardItemChip: LevelEditorRuntime['getBoardItemChip'];
  getBoardItemTypeLabel: LevelEditorRuntime['getBoardItemTypeLabel'];
  getPlantDisplayName: LevelEditorRuntime['getPlantDisplayName'];
  selectedCell: LevelEditorRuntime['selectedCell'];
  selectedAsset: LevelEditorRuntime['selectedAsset'];
  boardTool: LevelEditorRuntime['boardTool'];
  selectedCellItems: LevelEditorRuntime['selectedCellItems'];
  clearSelectedCell: LevelEditorRuntime['clearSelectedCell'];
  clearBoardItems: LevelEditorRuntime['clearBoardItems'];
  selectBoardTool: LevelEditorRuntime['selectBoardTool'];
  boardToolLabel: LevelEditorRuntime['boardToolLabel'];
  itemsAt: LevelEditorRuntime['itemsAt'];
  editBoardCell: LevelEditorRuntime['editBoardCell'];
  selectedBoardTargetId: LevelEditorRuntime['selectedBoardTargetId'];
  boardPowerGroup: LevelEditorRuntime['boardPowerGroup'];
  boardPowerDelay: LevelEditorRuntime['boardPowerDelay'];
  boardReservedAliases: LevelEditorRuntime['boardReservedAliases'];
  selectBoardPowerGroup: LevelEditorRuntime['selectBoardPowerGroup'];
  plantOptions: LevelEditorRuntime['plantOptions'];
  selectObjectiveCell: LevelEditorRuntime['selectObjectiveCell'];
};

export function createBoardView(bindings: Bindings) {
  const {
    getBossAtCell, t, draft, expertMode, preservedPlacementExtraEntries, setBoardItemIcecubed,
    setBoardItemPlantfood, formatPlacementExtraValue, removeBoardItem, getBoardItemImage,
    getBoardItemLayer, getBoardItemChip, getBoardItemTypeLabel, getPlantDisplayName,
    selectedCell, selectedAsset, boardTool, selectedCellItems, clearSelectedCell,
    clearBoardItems, selectBoardTool, boardToolLabel, itemsAt, editBoardCell,
    selectedBoardTargetId, boardPowerGroup, boardPowerDelay, boardReservedAliases,
    selectBoardPowerGroup, plantOptions, selectObjectiveCell
  } = bindings;

  function getCellAriaLabel(row: number, col: number, items: BoardItem[]) {
    const labels = [...items.map((item) => item.label), ...getCellEffects(row, col).map((effect) => effect.label)];
    const boss = getBossAtCell(row, col);
    if (boss) labels.push(boss.asset?.name || t('specialBossMarker'));
    const content = labels.length ? labels.join(', ') : t('selectedCellEmpty');
    return t('cellAria', { col: col + 1, row: row + 1, content });
  }

  function getProtectPlants() {
    const plants = draft.value.objectives.protect?.objdata?.Plants;
    return Array.isArray(plants) ? plants : [];
  }

  function getProtectedTarget(row: number, col: number) {
    return getProtectPlants().find((entry: any) => Number(entry.GridX) === col && Number(entry.GridY) === row);
  }

  function getMoldedTarget(row: number, col: number) {
    return draft.value.objectives.starObjectives
      .filter((objective) => objective.kind === 'mold')
      .find((objective) =>
        getMoldedSquares(objective.objdata, resolveBoardGridMapSquares).some(
          (square: any) => square.GridX === col && square.GridY === row
        )
      );
  }

  function getBoardItemExportTarget(item: BoardItem) {
    if (item.kind === 'plant') return 'InitialPlantProperties';
    if (item.kind === 'zombie') return 'InitialZombieProperties';
    return item.exportClass || 'InitialGridItemProperties';
  }

  function renderCellDetailAdvanced(item: BoardItem) {
    if (!expertMode.value) return null;

    const preservedEntries = preservedPlacementExtraEntries(item);
    const hasEditableControls = item.kind === 'plant' || item.kind === 'zombie';
    const exportTarget = getBoardItemExportTarget(item);
    const metaEntries = [
      [t('exportTarget'), exportTarget],
      ...(item.source ? [[t('sourceField'), item.source]] : []),
      ...(item.props ? [[t('propsField'), item.props]] : []),
      ...(item.res ? [[t('resField'), item.res]] : [])
    ];

    return h('details', { class: 'cell-detail-advanced' }, [
      h('summary', t('advancedPlacementInfo')),
      hasEditableControls
        ? h('div', { class: 'placement-control-row' }, [
          h('label', { class: 'check-row' }, [
            h('input', {
              type: 'checkbox',
              checked: item.extra?.Condition === 'icecubed',
              onChange: (event: Event) => setBoardItemIcecubed(item, (event.target as HTMLInputElement).checked)
            }),
            t('icecubedCondition')
          ]),
          item.kind === 'plant'
            ? h('label', { class: 'check-row' }, [
              h('input', {
                type: 'checkbox',
                checked: item.extra?.Plantfood === true,
                onChange: (event: Event) => setBoardItemPlantfood(item, (event.target as HTMLInputElement).checked)
              }),
              t('startPlantfood')
            ])
            : null
        ])
        : null,
      h(
        'div',
        { class: 'placement-extra-list' },
        metaEntries.map(([key, value]) => h('code', { class: 'placement-extra-chip' }, `${key}: ${value}`))
      ),
      preservedEntries.length
        ? h('div', { class: 'placement-extra-list' }, [
          h('small', { class: 'placement-extra-title' }, t('preservedPlacementFields')),
          ...preservedEntries.map(([key, value]) =>
            h('code', { class: 'placement-extra-chip' }, `${key}: ${formatPlacementExtraValue(value)}`)
          )
        ])
        : null
    ]);
  }

  function renderCellDetailItem(item: BoardItem) {
    return h('div', { class: `cell-detail-pill ${item.kind}` }, [
      h(
        'button',
        {
          class: 'cell-detail-remove',
          type: 'button',
          title: t('removeCellItem', { name: item.label }),
          'aria-label': t('removeCellItem', { name: item.label }),
          onClick: () => removeBoardItem(item.id)
        },
        h(CloseOutlined, { 'aria-hidden': 'true' })
      ),
      h('div', { class: 'cell-detail-main' }, [
        getBoardItemImage(item)
          ? h('img', { src: getBoardItemImage(item), alt: item.label, loading: 'lazy' })
          : h('span', { class: `cell-chip ${item.kind} ${getBoardItemLayer(item)} ${item.category || ''}` }, getBoardItemChip(item)),
        h('span', { class: 'cell-detail-copy' }, [
          h('strong', item.label),
          h('small', getBoardItemTypeLabel(item)),
          h('small', { class: 'cell-detail-code' }, item.code)
        ])
      ]),
      renderCellDetailAdvanced(item)
    ]);
  }

  const boardRuleEntries = computed(() => draft.value.boardRules.modules);

  function cellHasRailTrack(row: number, col: number) {
    return boardRuleEntries.value
      .filter((rule) => rule.kind === 'railcart')
      .some((rule) =>
        getRuleRails(rule).some(
          (rail: any) =>
            Number(rail.Column) === col &&
            row >= Math.min(Number(rail.RowStart ?? 0), Number(rail.RowEnd ?? 4)) &&
            row <= Math.max(Number(rail.RowStart ?? 0), Number(rail.RowEnd ?? 4))
        )
      );
  }

  function cellHasRailcart(row: number, col: number) {
    return boardRuleEntries.value
      .filter((rule) => rule.kind === 'railcart')
      .some((rule) => getRuleRailcarts(rule).some((cart: any) => Number(cart.Column) === col && Number(cart.Row) === row));
  }

  function isPiratePlankRow(row: number) {
    return boardRuleEntries.value
      .filter((rule) => rule.kind === 'planks')
      .some((rule) => (Array.isArray(rule.objdata?.PlankRows) ? rule.objdata.PlankRows : []).map(Number).includes(row));
  }

  function getStartingTideLocation() {
    const tide = boardRuleEntries.value.find((rule) => rule.kind === 'tide');
    return tide ? 9 - normalizeBoardCoordinate(tide.objdata?.StartingWaveLocation, 9) : null;
  }

  function getPowerTileAtCell(row: number, col: number) {
    for (const rule of boardRuleEntries.value.filter((entry) => entry.kind === 'powerTiles')) {
      const tile = getPowerTileAt(rule, row, col);
      if (tile) return tile;
    }
    return null;
  }

  function markBoardRuleEdited(rule: BoardRuleModuleDraft) {
    rule.dirty = true;
    draft.value.boardRules.dirty = true;
  }

  function removeProtectedTarget(row: number, col: number) {
    const protect = draft.value.objectives.protect;
    if (!protect) return;
    const plants = getProtectPlants();
    const previousLength = plants.length;
    protect.objdata.Plants = plants.filter(
      (entry: any) => Number(entry.GridX) !== col || Number(entry.GridY) !== row
    );
    if (protect.objdata.Plants.length === previousLength) return;
    if (Number(protect.objdata.MustProtectCount ?? previousLength) === previousLength) {
      protect.objdata.MustProtectCount = Math.max(0, previousLength - 1);
    }
    draft.value.objectives.dirty = true;
    draft.value.objectives.protectDirty = true;
  }

  function removeMoldedTarget(objective: StarObjectiveDraft, row: number, col: number) {
    const squares = getMoldedSquares(objective.objdata, resolveBoardGridMapSquares);
    const nextSquares = squares.filter((square: any) => square.GridX !== col || square.GridY !== row);
    if (nextSquares.length === squares.length) return;
    setMoldedSquares(objective.objdata, nextSquares);
    draft.value.objectives.dirty = true;
    draft.value.objectives.starDirty = true;
  }

  function removePowerTile(rule: BoardRuleModuleDraft, row: number, col: number) {
    const tiles = getRulePowerTiles(rule);
    const nextTiles = tiles.filter(
      (tile: any) => Number(tile?.Location?.mX) !== col || Number(tile?.Location?.mY) !== row
    );
    if (nextTiles.length === tiles.length) return;
    rule.objdata.LinkedTiles = nextTiles;
    markBoardRuleEdited(rule);
  }

  function getCellEffects(row: number, col: number): CellEffectEntry[] {
    const effects: CellEffectEntry[] = [];
    const protectedTarget = getProtectedTarget(row, col);
    if (protectedTarget) {
      effects.push({
        id: 'protect',
        label: t('objectiveProtectedCell'),
        detail: getPlantDisplayName(String(protectedTarget.PlantType || '')),
        tone: 'protect',
        remove: () => removeProtectedTarget(row, col)
      });
    }

    const moldedTarget = getMoldedTarget(row, col);
    if (moldedTarget) {
      effects.push({
        id: `mold:${moldedTarget.id}`,
        label: t('objectiveMoldCell'),
        tone: 'mold',
        remove: () => removeMoldedTarget(moldedTarget, row, col)
      });
    }

    for (const rule of boardRuleEntries.value.filter((entry) => entry.kind === 'powerTiles')) {
      const tile = getPowerTileAt(rule, row, col);
      if (!tile) continue;
      effects.push({
        id: `power:${rule.id}`,
        label: t('boardRulePowerTileCell'),
        detail: t(`boardRulePowerGroup_${tile.Group}`),
        tone: 'power',
        remove: () => removePowerTile(rule, row, col)
      });
    }

    if (cellHasRailTrack(row, col)) {
      effects.push({ id: 'rail', label: t('boardRuleRails'), tone: 'rail' });
    }
    if (cellHasRailcart(row, col)) {
      effects.push({ id: 'railcart', label: t('boardRuleRailcart'), tone: 'rail' });
    }
    if (isPiratePlankRow(row)) {
      effects.push({ id: 'plank', label: t('boardRulePlankRow'), tone: 'plank' });
    }
    return effects;
  }

  const selectedCellEffects = computed(() =>
    selectedCell.value ? getCellEffects(selectedCell.value.row, selectedCell.value.col) : []
  );

  function renderCellEffect(effect: CellEffectEntry) {
    return h('span', { class: ['cell-effect-pill', `cell-effect-${effect.tone}`] }, [
      h('span', { class: 'cell-effect-dot', 'aria-hidden': 'true' }),
      h('span', { class: 'cell-effect-copy' }, [
        h('strong', effect.label),
        effect.detail ? h('small', effect.detail) : null
      ]),
      effect.remove
        ? h(
          'button',
          {
            type: 'button',
            title: t('remove'),
            'aria-label': `${t('remove')} ${effect.label}`,
            onClick: effect.remove
          },
          h(CloseOutlined, { 'aria-hidden': 'true' })
        )
        : null
    ]);
  }

  const BoardInspector = defineComponent({
    setup: () => () => h('div', { class: 'board-tool-properties' }, [
      getBoardToolKind(boardTool.value) ? h(BoardRulesPanel, {
        system: draft.value.boardRules, tool: boardTool.value, selectedId: selectedBoardTargetId.value,
        powerGroup: boardPowerGroup.value, powerDelay: boardPowerDelay.value, reservedAliases: boardReservedAliases.value,
        expertMode: expertMode.value, translate: t,
        onSelect: (id: string) => selectBoardTool(boardTool.value, id),
        onPowerGroup: selectBoardPowerGroup, onPowerDelay: (value: number) => { boardPowerDelay.value = value; }
      }) : boardTool.value === 'mold' || boardTool.value === 'protect' ? h(ObjectivesPanel, {
        system: draft.value.objectives, plantOptions: plantOptions.value, context: 'board', tool: boardTool.value,
        selectedId: selectedBoardTargetId.value, resolveMoldLocations: resolveBoardGridMapSquares,
        expertMode: expertMode.value, translate: t, reservedAliases: boardReservedAliases.value,
        onSelect: (id: string) => { selectedBoardTargetId.value = id; }, onSelectCell: selectObjectiveCell
      }) : null,
      selectedCell.value
        ? h('div', { class: 'cell-detail-panel' }, [
          h('div', { class: 'cell-detail-title' }, t('selectedCellTitle', { col: selectedCell.value.col + 1, row: selectedCell.value.row + 1 })),
          selectedCellEffects.value.length
            ? h(
              'div',
              { class: 'cell-effect-list' },
              selectedCellEffects.value.map(renderCellEffect)
            )
            : null,
          selectedCellItems.value.length
            ? h(
              'div',
              { class: 'cell-detail-list' },
              selectedCellItems.value.map((item) => renderCellDetailItem(item))
            )
            : selectedCellEffects.value.length
              ? null
              : h('div', { class: 'cell-detail-empty' }, t('selectedCellEmpty'))
        ])
        : null
    ])
  });

  const BoardEditor = defineComponent({
    setup() {
      return () =>
        h('section', { class: 'board-editor', id: 'editor-board' }, [
          h('div', { class: 'board-header' }, [
            h('div', [h('strong', t('board')), selectedAsset.value && (boardTool.value === 'place' || boardTool.value === 'protect') ? h('span', `${t('selected')}: ${selectedAsset.value.name}`) : null]),
            h('div', { class: 'board-actions' }, [
              selectedCell.value && selectedCellItems.value.length
                ? h('button', { class: 'text-button', onClick: clearSelectedCell }, [h(DeleteOutlined), t('clearCell')])
                : null,
              h('button', { class: 'text-button danger', disabled: !draft.value.boardItems.length, onClick: clearBoardItems }, [
                h(DeleteOutlined),
                t('clearBoard')
              ])
            ])
          ]),
          h('div', { class: 'board-tool-strip', role: 'group', 'aria-label': t('boardTools') }, BOARD_TOOLS.map((tool) => h('button', {
            type: 'button', 'aria-pressed': boardTool.value === tool, onClick: () => selectBoardTool(tool)
          }, boardToolLabel(tool)))),
          h('div', { class: 'board-canvas-layout' }, [
            h('div', { class: 'board-canvas-scroller' }, [h('div', { class: 'board-coordinate-frame' }, [
              h('div', { class: 'board-column-axis', 'aria-hidden': 'true' }, Array.from({ length: 9 }, (_, col) => h('span', String(col + 1)))),
              h('div', { class: 'board-row-axis', 'aria-hidden': 'true' }, Array.from({ length: 5 }, (_, row) => h('span', String(row + 1)))),
              h(
                'div',
                { class: `lawn-grid stage-${draft.value.stage.toLowerCase()}`, 'aria-label': t('board') },
                Array.from({ length: 5 }, (_, row) =>
                  Array.from({ length: 9 }, (_, col) => {
                    const items = itemsAt(row, col);
                    const boss = getBossAtCell(row, col);
                    const protectedTarget = getProtectedTarget(row, col);
                    const moldedTarget = getMoldedTarget(row, col);
                    const powerTile = getPowerTileAtCell(row, col);
                    const railTrack = cellHasRailTrack(row, col);
                    const railcart = cellHasRailcart(row, col);
                    const plankRow = isPiratePlankRow(row);
                    return h(
                      'button',
                      {
                        type: 'button',
                        'aria-label': getCellAriaLabel(row, col, items),
                        class: [
                          'lawn-cell',
                          items.length ? 'has-items' : '',
                          protectedTarget ? 'protected-target' : '',
                          moldedTarget ? 'molded-target' : '',
                          powerTile ? `power-tile power-tile-${powerTile.Group}` : '',
                          railTrack ? 'rail-track' : '',
                          railcart ? 'has-railcart' : '',
                          plankRow ? 'pirate-plank-row' : '',
                          selectedCell.value?.row === row && selectedCell.value?.col === col ? 'selected' : ''
                        ],
                        onClick: () => editBoardCell(row, col)
                      },
                      [
                        powerTile
                          ? h(
                            'span',
                            { class: `power-tile-overlay power-group-${powerTile.Group}`, title: t('boardRulePowerTileCell') },
                            powerTile.Group === 'alpha'
                              ? '+'
                              : powerTile.Group === 'beta'
                                ? '×'
                                : powerTile.Group === 'gamma'
                                  ? '□'
                                  : powerTile.Group === 'delta'
                                    ? '△'
                                    : '○'
                          )
                          : null,
                        items.length
                          ? h(
                            'span',
                            { class: 'cell-stack' },
                            items.map((item) =>
                              h(
                                'span',
                                {
                                  class: `cell-marker ${item.kind} ${getBoardItemLayer(item)} ${item.category || ''}`,
                                  title: `${getBoardItemTypeLabel(item)}: ${item.label}`
                                },
                                getBoardItemImage(item)
                                  ? h('img', { src: getBoardItemImage(item), alt: item.label, loading: 'lazy' })
                                  : h('span', { class: `cell-chip ${item.kind} ${getBoardItemLayer(item)} ${item.category || ''}` }, getBoardItemChip(item))
                              )
                            )
                          )
                          : null,
                        protectedTarget
                          ? h('span', { class: 'protected-target-badge', title: t('objectiveProtectedCell') }, '◆')
                          : null,
                        moldedTarget
                          ? h('span', { class: 'mold-target-badge', title: t('objectiveMoldCell') }, '✕')
                          : null,
                        boss ? h('span', { class: 'boss-spawn-marker', 'aria-hidden': 'true', title: boss.asset?.name || t('specialBossMarker') },
                          boss.asset?.image ? h('img', { src: boss.asset.image, alt: '' }) : t('specialBossMarker')) : null,
                        railcart ? h('span', { class: 'railcart-badge', title: t('boardRuleRailcart') }, '▣') : null,
                        plankRow && col === 0 ? h('span', { class: 'plank-row-badge', title: t('boardRulePlankRow') }, '≋') : null
                      ]
                    );
                  })
                ).flat().concat(
                  getStartingTideLocation() !== null
                    ? [
                      h('span', {
                        class: 'tide-start-line',
                        title: t('boardRuleTideLine'),
                        style: { left: `${(Number(getStartingTideLocation()) / 9) * 100}%` }
                      })
                    ]
                    : []
                )
              )])]),
            null
          ])
        ]);
    }
  });

  return { BoardEditor, BoardInspector };
}
