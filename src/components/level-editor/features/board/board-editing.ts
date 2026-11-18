import { localAlias } from '../assets/local-assets-codec.mjs';

import type { useEditorSelection } from '../../core/use-editor-selection';

import { getRulePowerTiles } from '../../board-rule-codec.mjs';

import { message } from 'ant-design-vue';
import { applyBoardTool, getBoardToolTarget } from '../../board-editing.mjs';
import { resolveBoardGridMapSquares } from '../../../game-data/board-grid-maps';

import type { WorkspaceId, AssetOption, LevelDraft, BoardLayer, BoardItem } from '../../core/types';

import type { Ref, ComputedRef } from 'vue';
type Bindings = Pick<ReturnType<typeof useEditorSelection>, 'selectedCell' | 'boardTool' | 'selectedBoardTargetId' | 'boardPowerGroup' | 'boardPowerDelay' | 'assetTab' | 'selectedAsset' | 'activePane' | 'inspectorTab'> & {
  draft: Ref<LevelDraft>;
  selectedCellItems: ComputedRef<BoardItem[]>;
  selectedPlantAsset: ComputedRef<AssetOption | null>;
  boardReservedAliases: ComputedRef<string[]>;
  nextItemId: Ref<number>;
  switchWorkspace: (id: WorkspaceId) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  runEdit: <T>(id: string, operation: () => T) => T;
};
export function createBoardEditing(bindings: Bindings) {
  const {
    selectedCell, boardTool, selectedBoardTargetId, boardPowerGroup, boardPowerDelay, assetTab,
    selectedAsset, activePane, inspectorTab, draft, selectedPlantAsset, boardReservedAliases, nextItemId,
    switchWorkspace, t, runEdit
  } = bindings;
  function resetBoardTools() {
    boardTool.value = 'place';
    selectedBoardTargetId.value = '';
    boardPowerGroup.value = 'alpha';
    boardPowerDelay.value = 0.25;
  }

  function selectBoardTool(tool: string, id = '') {
    boardTool.value = tool;
    inspectorTab.value = 'edit';
    if (tool === 'place' && !selectedAsset.value) activePane.value = 'library';
    const target = getBoardToolTarget(draft.value, tool, id);
    selectedBoardTargetId.value = target?.id || '';
    if (tool === 'powerTiles') selectBoardPowerGroup(boardPowerGroup.value);
    if (tool === 'protect') assetTab.value = 'plant';
  }

  function selectBoardPowerGroup(group: string) {
    boardPowerGroup.value = group;
    const target = getBoardToolTarget(draft.value, 'powerTiles', selectedBoardTargetId.value);
    const delay = Number(getRulePowerTiles(target).find((tile: any) => tile.Group === group)?.PropagationDelay);
    boardPowerDelay.value = Number.isFinite(delay) ? delay : 0.25;
  }

  function editObjectiveOnBoard(target: { tool: string; id: string; }) {
    selectBoardTool(target.tool, target.id);
    switchWorkspace('board');
  }

  function selectObjectiveCell(cell: { row: number; col: number; }) {
    selectedCell.value = cell;
  }

  function boardToolLabel(tool: string) {
    const labels: Record<string, string> = {
      select: 'boardSelectTool', place: 'boardPlaceTool', rails: 'boardRuleRails', railcarts: 'boardRuleRailcarts',
      powerTiles: 'boardRuleKind_powerTiles', tide: 'boardRuleKind_tide', planks: 'boardRuleKind_planks',
      mold: 'objectiveKind_mold', protect: 'objectiveKind_protect'
    };
    return t(labels[tool]);
  }

  function mutate_editBoardCell(row: number, col: number) {
    selectedCell.value = { row, col };
    inspectorTab.value = 'edit';
    if (boardTool.value === 'select' || (boardTool.value === 'place' && !selectedAsset.value)) { activePane.value = 'properties'; return; }
    if (boardTool.value === 'place') { placeAsset(row, col); return; }
    const result = applyBoardTool(draft.value, boardTool.value, selectedBoardTargetId.value, row, col, {
      powerGroup: boardPowerGroup.value, powerDelay: boardPowerDelay.value, plantCode: selectedPlantAsset.value?.code,
      reservedAliases: boardReservedAliases.value, resolveMoldLocations: resolveBoardGridMapSquares
    });
    if (result.targetId) selectedBoardTargetId.value = result.targetId;
    if (result.error === 'plant') message.warning(t('objectiveSelectCellPlant'));
  }

  function getAssetLayer(asset: AssetOption): BoardLayer {
    if (asset.kind === 'plant') return 'plant';
    if (asset.kind === 'zombie') return 'zombie';
    return asset.category === 'tile' ? 'tile' : 'obstacle';
  }

  function getBoardItemLayer(item: BoardItem): BoardLayer {
    if (item.kind === 'plant') return 'plant';
    if (item.kind === 'zombie') return 'zombie';
    return item.category === 'tile' ? 'tile' : 'obstacle';
  }

  function mutate_placeAsset(row: number, col: number) {
    selectedCell.value = { row, col };
    if (!selectedAsset.value) return;
    const selectedLayer = getAssetLayer(selectedAsset.value);
    const existingIndex = draft.value.boardItems.findIndex(
      (item) => item.row === row && item.col === col && getBoardItemLayer(item) === selectedLayer
    );
    const code = localAlias(selectedAsset.value.code) || selectedAsset.value.code;
    if (existingIndex >= 0 && draft.value.boardItems[existingIndex].code === code) return;
    draft.value.preserveBoardModules = false;
    const item: BoardItem = {
      id: nextItemId.value++,
      kind: selectedAsset.value.kind,
      code,
      label: selectedAsset.value.name,
      row,
      col,
      category: selectedAsset.value.category,
      exportClass: selectedAsset.value.exportClass,
      props: selectedAsset.value.props,
      res: selectedAsset.value.res,
      source: selectedAsset.value.source,
      advanced: selectedAsset.value.advanced
    };
    if (existingIndex >= 0) draft.value.boardItems.splice(existingIndex, 1, item);
    else draft.value.boardItems.push(item);
  }

  function mutate_clearSelectedCell() {
    if (!selectedCell.value) return;
    draft.value.preserveBoardModules = false;
    draft.value.boardItems = draft.value.boardItems.filter(
      (item) => item.row !== selectedCell.value?.row || item.col !== selectedCell.value?.col
    );
  }

  function mutate_removeBoardItem(id: number) {
    draft.value.preserveBoardModules = false;
    draft.value.boardItems = draft.value.boardItems.filter((item) => item.id !== id);
  }

  function mutate_clearBoardItems() {
    draft.value.preserveBoardModules = false;
    draft.value.boardItems = [];
  }

  function itemsAt(row: number, col: number) {
    const layerOrder: Record<BoardLayer, number> = { tile: 0, obstacle: 1, plant: 2, zombie: 3 };
    return draft.value.boardItems
      .filter((item) => item.row === row && item.col === col)
      .sort((a, b) => layerOrder[getBoardItemLayer(a)] - layerOrder[getBoardItemLayer(b)]);
  }

  function setBoardItemExtra(item: BoardItem, key: string, value: any) {
    draft.value.preserveBoardModules = false;
    const extra = { ...(item.extra || {}) };
    if (value === undefined) delete extra[key];
    else extra[key] = value;
    item.extra = Object.keys(extra).length ? extra : undefined;
  }

  function setBoardItemIcecubed(item: BoardItem, checked: boolean) {
    setBoardItemExtra(item, 'Condition', checked ? 'icecubed' : undefined);
  }

  function setBoardItemPlantfood(item: BoardItem, checked: boolean) {
    setBoardItemExtra(item, 'Plantfood', checked ? true : undefined);
  }

  function editablePlacementExtraKeys(item: BoardItem) {
    if (item.kind === 'plant') return new Set(['Condition', 'Plantfood']);
    if (item.kind === 'zombie') return new Set(['Condition']);
    return new Set<string>();
  }

  function preservedPlacementExtraEntries(item: BoardItem) {
    const editableKeys = editablePlacementExtraKeys(item);
    return Object.entries(item.extra || {}).filter(([key]) => !editableKeys.has(key));
  }

  function formatPlacementExtraValue(value: unknown) {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value == null) return String(value);
    return JSON.stringify(value);
  }

  function editBoardCell(...args: Parameters<typeof mutate_editBoardCell>) { return runEdit('editBoardCell', () => mutate_editBoardCell(...args)); }

  function placeAsset(...args: Parameters<typeof mutate_placeAsset>) { return runEdit('placeAsset', () => mutate_placeAsset(...args)); }

  function clearSelectedCell(...args: Parameters<typeof mutate_clearSelectedCell>) { return runEdit('clearSelectedCell', () => mutate_clearSelectedCell(...args)); }

  function removeBoardItem(...args: Parameters<typeof mutate_removeBoardItem>) { return runEdit('removeBoardItem', () => mutate_removeBoardItem(...args)); }

  function clearBoardItems(...args: Parameters<typeof mutate_clearBoardItems>) { return runEdit('clearBoardItems', () => mutate_clearBoardItems(...args)); }
  return { resetBoardTools, selectBoardTool, selectBoardPowerGroup, editObjectiveOnBoard, selectObjectiveCell, boardToolLabel, getAssetLayer, getBoardItemLayer, itemsAt, setBoardItemExtra, setBoardItemIcecubed, setBoardItemPlantfood, editablePlacementExtraKeys, preservedPlacementExtraEntries, formatPlacementExtraValue, editBoardCell, placeAsset, clearSelectedCell, removeBoardItem, clearBoardItems };
}
