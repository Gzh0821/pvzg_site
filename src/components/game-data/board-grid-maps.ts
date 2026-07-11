import boardGridMapsJson from './raw/Objects/BoardGridMaps.json';

interface BoardGridMapObject {
  aliases?: string[];
  objclass?: string;
  objdata?: { Values?: unknown[][] };
}

const boardGridMapIndex = new Map<string, unknown[][]>(
  ((boardGridMapsJson as { objects?: BoardGridMapObject[] }).objects || [])
    .filter((object) => object.objclass === 'BoardGridMapProps' && Array.isArray(object.objdata?.Values))
    .flatMap((object) => (object.aliases || []).map((alias) => [alias, object.objdata!.Values!] as const))
);

function getBoardGridMapAlias(reference: unknown) {
  return /^RTID\((.+)@BoardGridMaps\)$/.exec(String(reference || ''))?.[1] || '';
}

export function resolveBoardGridMapSquares(reference: unknown) {
  const values = boardGridMapIndex.get(getBoardGridMapAlias(reference));
  if (!values) return [];
  return values.slice(0, 5).flatMap((row, rowIndex) =>
    (Array.isArray(row) ? row : []).slice(0, 9).flatMap((value, colIndex) =>
      Number(value) ? [{ GridX: colIndex, GridY: rowIndex }] : []
    )
  );
}
