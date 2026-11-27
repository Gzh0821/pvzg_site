import { peaPodShots } from './plant-pea-projectiles';
import { darkMatter, duskBud, gloomShroomEffects, redStingerShots } from './plant-effect-cues';
import type { AnimatedPlant, PlantAction, PlantAnimationConfig } from './plant-animations';

type Form = {
  zh: string;
  en: string;
  idle?: string;
  enter?: string;
  afterAction?: Partial<Record<PlantAction, { index: number; recovery?: { seconds: number; index: number } }>>;
  scale?: number;
  powered?: boolean;
  heads?: number;
  jelly?: boolean;
  effects?: PlantAnimationConfig['effects'];
  actions?: Partial<Record<PlantAction, PlantAnimationConfig['actions'][PlantAction] | null>>;
};

const normal = { zh: '普通', en: 'Normal' };
const shadow = [{ ...normal, powered: false }, { zh: '暗影强化', en: 'Shadow-powered', powered: true }];
const ground = { zh: '地面', en: 'Ground' };
const water = { zh: '水中', en: 'Water' };
const growFood = [{ clip: 'Grow', scale: 1 }, { clip: 'Food', scale: 1 }];
const mature = { Food: { index: 0 } };
const cannonRest = { index: 1, recovery: { seconds: 1.5, index: 0 } };
const mine = [
  { zh: '已出土', en: 'Armed', enter: 'Grow' },
  { zh: '幼体', en: 'Unarmed', afterAction: mature, idle: 'Idle_Baby', enter: 'Spawn_Baby', actions: { Attack: null, Water: null } },
];

const forms: Partial<Record<AnimatedPlant, Form[]>> = {
  gloomshroom: [shadow[0], { ...shadow[1], effects: gloomShroomEffects('PlayDark') }],
  moonflower: shadow,
  dusklobber: [shadow[0], { ...shadow[1], effects: {
    Lob: [-63, -15, 33].map(toY => ({ ...duskBud, toY })),
  } }],
  shadowpeashooter: [shadow[0], { ...shadow[1], effects: {
    Shoot: [{ frame: 12, armature: 'Ray0', clip: 'Play', x: 80, y: -88, scale: 0.55 }],
  } }],
  darkmatterdragonfruit: [shadow[0], { ...shadow[1], effects: {
    Shoot: [{ ...darkMatter, armature: 'PrjShadow', clip: 'i' }],
  } }],
  murkadamia: [{ ...shadow[0], jelly: false }, { ...shadow[1], jelly: true }],
  sunshroom: [
    { zh: '大型', en: 'Large', enter: 'Grow' },
    { zh: '小型', en: 'Small', afterAction: mature, idle: 'Idle_Small', scale: 0.6, actions: { Produce: 'Produce_Small', Food: growFood } },
    { zh: '中型', en: 'Medium', afterAction: mature, idle: 'Idle_Mid', scale: 0.8, enter: 'Grow', actions: { Produce: 'Produce_Mid', Food: growFood } },
  ],
  potatomine: mine,
  primalpotatomine: mine,
  peapod: [1, 2, 3, 4, 5].map(heads => ({ zh: `${heads} 个头`, en: `${heads} ${heads === 1 ? 'head' : 'heads'}`, heads, effects: { Shoot: peaPodShots(heads) } })),
  redstinger: [
    { zh: '展开', en: 'Open' },
    { zh: '半收拢', en: 'Partly closed', idle: 'Idle_Scared', effects: { Shoot: redStingerShots(true) }, actions: { Shoot: 'Shoot_Scared', Water: null } },
    { zh: '收拢', en: 'Closed', idle: 'Idle_Hide_0', actions: { Shoot: null, Water: null } },
  ],
  cactus: [
    { ...ground, enter: 'Recover_Hidden' },
    { zh: '地下', en: 'Underground', idle: 'Idle_Hidden', enter: 'Hide', actions: { Shoot: null, Attack: 'Attack_Hidden', Water: null } },
  ],
  skyshooter: [
    { ...ground, enter: 'Land' },
    { zh: '浮空', en: 'Airborne', idle: 'Idle_Sky', enter: 'Fly', actions: { Shoot: 'Shoot_Sky', Food: { clip: 'Food_Sky', seconds: 2 }, Water: null } },
  ],
  seashooter: [
    { ...water, enter: 'Trans_H' },
    { ...ground, idle: 'Idle_H', enter: 'Trans', actions: { Shoot: 'Shoot_H', Water: 'Water_H' } },
  ],
  seashroom: [water, { ...ground, idle: 'Idle_Sad', actions: { Shoot: 'Shoot_Sad' } }],
  scaredyshroom: [
    { ...normal, enter: 'HideEnd' },
    { zh: '躲藏', en: 'Hiding', idle: 'Hiding', enter: 'HideStartR', actions: { Shoot: null, Water: null } },
  ],
  dandelion: [
    { ...normal, enter: 'Recover' },
    { zh: '已吹散', en: 'Dispersed', afterAction: { Food: { index: 0 } }, idle: 'Idle_Blew', enter: 'Blow', actions: { Shoot: null, Water: null } },
  ],
  coconutcannon: [
    { zh: '就绪', en: 'Ready', afterAction: { Shoot: cannonRest, Food: cannonRest }, enter: 'Wake' },
    { zh: '休整', en: 'Resting', afterAction: { Food: cannonRest }, idle: 'Sleep', actions: { Shoot: null, Water: null } },
  ],
};

export const plantForms = (code: AnimatedPlant) => forms[code] ?? [];

export function formActions(config: PlantAnimationConfig, form?: Form) {
  return { ...config.actions, ...form?.actions };
}
