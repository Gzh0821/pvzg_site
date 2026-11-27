const WORLD_BACKGROUND_FILES: Record<string, string> = {
  frontyard: 'frontyard',
  egypt: 'egypt',
  pirate: 'pirate',
  cowboy: 'cowboy',
  future: 'future',
  dark: 'dark',
  beach: 'beach',
  ice: 'iceage',
  lostcity: 'lostcity',
  eighties: 'eighties',
  dino: 'dino',
  modern: 'modern',
  kongfu: 'kongfu',
  sky: 'sky',
  water: 'beach_watered',
  epic: 'epic',
  market: 'market',
  mint: 'mint',
  boost: 'boost',
  lod: 'lod',
  default: 'default',
};

export const almanacBackgrounds = Object.keys(WORLD_BACKGROUND_FILES);

export const getAlmanacWorldBackground = (world: string) => {
  const file = WORLD_BACKGROUND_FILES[world] ?? 'default';
  return `/assets/image/almanac/backgrounds/${file}.webp`;
};
