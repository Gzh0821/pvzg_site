const WORLD_BACKGROUND_FILES: Record<string, string> = {
  beach: 'beach',
  boost: 'boost',
  cowboy: 'cowboy',
  dark: 'dark',
  dino: 'dino',
  egypt: 'egypt',
  eighties: 'eighties',
  epic: 'epic',
  frontyard: 'frontyard',
  future: 'future',
  ice: 'iceage',
  kongfu: 'kongfu',
  lod: 'lod',
  lostcity: 'lostcity',
  market: 'market',
  mint: 'mint',
  modern: 'modern',
  pirate: 'pirate',
  sky: 'sky',
  water: 'beach_watered',
};

export const getAlmanacWorldBackground = (world: string) => {
  const file = WORLD_BACKGROUND_FILES[world] ?? 'default';
  return `/assets/image/almanac/backgrounds/${file}.webp`;
};
