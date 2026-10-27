import { createBoardRule, getPowerTileAt, getRulePowerTiles, getRuleRailcarts, getRuleRails } from './board-rule-codec.mjs';
import { createProtectObjective, createStarObjective, getMoldedSquares, setMoldedSquares } from './objective-codec.mjs';

export const BOARD_TOOLS = ['select', 'place', 'rails', 'railcarts', 'powerTiles', 'tide', 'planks', 'mold', 'protect'];
export function getBoardToolKind(tool) {
  return tool === 'rails' || tool === 'railcarts' ? 'railcart' : ['powerTiles', 'tide', 'planks'].includes(tool) ? tool : null;
}
export function getBoardToolTarget(draft, tool, targetId) {
  const kind = getBoardToolKind(tool);
  const entries = kind ? draft.boardRules.modules.filter((rule) => rule.kind === kind)
    : tool === 'mold' ? draft.objectives.starObjectives.filter((objective) => objective.kind === 'mold')
      : tool === 'protect' && draft.objectives.protect ? [draft.objectives.protect] : [];
  return entries.find((entry) => entry.id === targetId) || entries[0] || null;
}

// A canvas click changes only the selected native module and the clicked coordinate.
export function applyBoardTool(draft, tool, targetId, row, col, options = {}) {
  if (!BOARD_TOOLS.includes(tool) || tool === 'select' || tool === 'place') return { changed: false };
  let target = getBoardToolTarget(draft, tool, targetId);
  const plant = draft.boardItems.find((item) => item.kind === 'plant' && item.row === row && item.col === col);
  const plants = target?.objdata?.Plants || [];
  const existingPlant = tool === 'protect' && plants.find((entry) => Number(entry.GridX) === col && Number(entry.GridY) === row);
  if (tool === 'protect' && !existingPlant && !plant && !options.plantCode) return { changed: false, error: 'plant' };
  const created = !target;
  if (!target) {
    const kind = getBoardToolKind(tool);
    target = kind ? createBoardRule(draft.boardRules, kind, options.reservedAliases) : tool === 'mold'
      ? createStarObjective(draft.objectives, 'mold', options.reservedAliases) : createProtectObjective(draft.objectives, options.reservedAliases);
    if (kind) draft.boardRules.modules.push(target);
    else if (tool === 'mold') draft.objectives.starObjectives.push(target);
    else draft.objectives.protect = target;
  }
  const data = target.objdata;
  if (tool === 'rails') {
    const rails = getRuleRails(target);
    const existing = rails.find((rail) => Number(rail.Column) === col && row >= Math.min(Number(rail.RowStart ?? 0), Number(rail.RowEnd ?? 4)) && row <= Math.max(Number(rail.RowStart ?? 0), Number(rail.RowEnd ?? 4)));
    data.Rails = existing ? rails.filter((rail) => rail !== existing) : [...rails, { Column: col, RowStart: 0, RowEnd: 4 }];
  } else if (tool === 'railcarts') {
    const carts = getRuleRailcarts(target);
    const existing = carts.find((cart) => Number(cart.Column) === col && Number(cart.Row) === row);
    data.Railcarts = existing ? carts.filter((cart) => cart !== existing) : [...carts, { Column: col, Row: row }];
  } else if (tool === 'powerTiles') {
    const tiles = getRulePowerTiles(target), existing = getPowerTileAt(target, row, col);
    const group = options.powerGroup || 'alpha';
    if (existing?.Group === group) data.LinkedTiles = tiles.filter((tile) => tile !== existing);
    else {
      const tile = { ...existing, Group: group, Location: { ...existing?.Location, mX: col, mY: row },
        PropagationDelay: options.powerDelay ?? tiles.find((tile) => tile.Group === group)?.PropagationDelay ?? 0.25 };
      data.LinkedTiles = existing ? tiles.map((entry) => entry === existing ? tile : entry) : [...tiles, tile];
    }
  } else if (tool === 'planks') {
    const rows = Array.isArray(data.PlankRows) ? data.PlankRows : [];
    data.PlankRows = rows.some((value) => Number(value) === row) ? rows.filter((value) => Number(value) !== row) : [...rows, row].sort((a, b) => Number(a) - Number(b));
  } else if (tool === 'tide') {
    if (!created && data.StartingWaveLocation === 9 - col) return { changed: false, targetId: target.id };
    data.StartingWaveLocation = 9 - col;
  } else if (tool === 'mold') {
    const squares = getMoldedSquares(data, options.resolveMoldLocations);
    const existing = squares.find((square) => square.GridX === col && square.GridY === row);
    setMoldedSquares(data, existing ? squares.filter((square) => square !== existing) : [...squares, { GridX: col, GridY: row }]);
  } else if (tool === 'protect') {
    const previousCount = plants.length;
    data.Plants = existingPlant ? plants.filter((entry) => entry !== existingPlant)
      : [...plants, { GridX: col, GridY: row, PlantType: plant?.code || options.plantCode }];
    if (!previousCount || Number(data.MustProtectCount ?? previousCount) === previousCount) data.MustProtectCount = data.Plants.length;
  }
  if (getBoardToolKind(tool)) {
    target.dirty = true;
    draft.boardRules.dirty = true;
  } else {
    draft.objectives.dirty = true;
    draft.objectives[tool === 'mold' ? 'starDirty' : 'protectDirty'] = true;
  }
  return { changed: true, targetId: target.id };
}
