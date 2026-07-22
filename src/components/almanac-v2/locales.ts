import type { AlmanacKind, AlmanacLocale } from './types';

const text = {
  zh: {
    siteLabel: 'Gardendless 在线图鉴',
    plantTitle: '植物图鉴',
    zombieTitle: '僵尸图鉴',
    plantDescription: '浏览植物卡包，查看属性、能力和角色资料。',
    zombieDescription: '浏览僵尸档案，查看强度、速度和角色资料。',
    plants: '植物',
    zombies: '僵尸',
    search: '搜索',
    searchPlaceholder: '搜索名称、英文名、代号或编号',
    family: '家族',
    world: '世界',
    allFamilies: '全部家族',
    allWorlds: '全部世界',
    resultCount: (count: number) => `${count} 项`,
    noResults: '没有找到符合条件的条目。',
    back: '返回图鉴',
    previous: '上一项',
    next: '下一项',
    attributes: '图鉴属性',
    codename: 'CODENAME',
    introduction: '图鉴介绍',
    specials: '特性',
    chat: '角色趣闻',
    derivedEntities: '衍生实体',
    originEntities: '来源实体',
    siblingEntities: '同组形态',
    noAlmanac: '该实体暂无独立的图鉴介绍，页面仅展示游戏数据中可确认的资料。',
    nearby: '继续浏览',
  },
  en: {
    siteLabel: 'Gardendless Almanac',
    plantTitle: 'Plants Almanac',
    zombieTitle: 'Zombies Almanac',
    plantDescription: 'Browse plant packets and read their attributes, abilities, and character notes.',
    zombieDescription: 'Browse zombie records and read their toughness, speed, and character notes.',
    plants: 'Plants',
    zombies: 'Zombies',
    search: 'Search',
    searchPlaceholder: 'Search name, codename, or numeric ID',
    family: 'Family',
    world: 'World',
    allFamilies: 'All families',
    allWorlds: 'All worlds',
    resultCount: (count: number) => `${count} entries`,
    noResults: 'No entries match these filters.',
    back: 'Back to almanac',
    previous: 'Previous',
    next: 'Next',
    attributes: 'Almanac attributes',
    codename: 'Codename',
    introduction: 'Introduction',
    specials: 'Traits',
    chat: 'Character notes',
    derivedEntities: 'Derived entities',
    originEntities: 'Origin entities',
    siblingEntities: 'Related forms',
    noAlmanac: 'This entity has no standalone Almanac text. This page only shows data confirmed by the game files.',
    nearby: 'Keep browsing',
  },
};

const worlds: Record<AlmanacLocale, Record<string, string>> = {
  zh: {
    frontyard: '前院',
    egypt: '埃及',
    pirate: '海盗',
    cowboy: '西部',
    future: '未来',
    dark: '黑暗',
    beach: '海滩',
    ice: '冰窟',
    lostcity: '古城',
    eighties: '炫光魔音',
    dino: '侏罗纪',
    modern: '现代',
    kongfu: '武林',
    sky: '云端',
    water: '水域',
    epic: '史诗关卡',
    market: '商店',
    mint: '薄荷',
  },
  en: {
    frontyard: 'Front Yard',
    egypt: 'Egypt',
    pirate: 'Pirate Seas',
    cowboy: 'Wild West',
    future: 'Far Future',
    dark: 'Dark Ages',
    beach: 'Big Wave Beach',
    ice: 'Frostbite Caves',
    lostcity: 'Lost City',
    eighties: 'Neon Mixtape',
    dino: 'Jurassic Marsh',
    modern: 'Modern Day',
    kongfu: 'Kongfu',
    sky: 'Aerial Fortress',
    water: 'Water',
    epic: 'Epic Quests',
    market: 'Market',
    mint: 'Power Mints',
  },
};

export const getAlmanacText = (locale: AlmanacLocale) => text[locale];

export const getKindTitle = (kind: AlmanacKind, locale: AlmanacLocale) => (
  kind === 'plant' ? text[locale].plantTitle : text[locale].zombieTitle
);

export const getKindDescription = (kind: AlmanacKind, locale: AlmanacLocale) => (
  kind === 'plant' ? text[locale].plantDescription : text[locale].zombieDescription
);

export const getWorldLabel = (world: string, locale: AlmanacLocale) => worlds[locale][world] ?? world;
