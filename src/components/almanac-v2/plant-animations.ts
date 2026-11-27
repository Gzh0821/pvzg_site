import { coldSnapdragonEffects, groundSpikes, mineEffects, snapdragonEffects, type EffectCue } from './plant-effect-cues';

export type PlantAction = 'Food' | 'Water' | 'Shoot' | 'Lob' | 'Lob_Butter' | 'Produce' | 'Freeze' | 'Coin' | 'Attack' | 'Block' | 'Grow';
export type ClipStep = string | {
  clip: string;
  repeats?: number;
  seconds?: number;
  fromFrame?: number;
  toFrame?: number;
  foodAppearance?: boolean;
};
type ActionClips = Partial<Record<PlantAction, ClipStep | readonly ClipStep[]>>;

export interface PlantAnimationConfig {
  armature: string;
  idle: string;
  costumes: number;
  actions: ActionClips;
  bodySlots?: readonly string[];
  framing?: 'flight';
  bodyOffset?: readonly [number, number];
  hiddenSlots?: readonly string[];
  effects?: Partial<Record<PlantAction, readonly EffectCue[]>>;
  foodSlots?: Readonly<Record<string, number>>;
}

const shoot = { Food: 'Food', Water: 'Water', Shoot: 'Shoot' };
const lob = { Food: 'Food', Water: 'Water', Lob: 'Lob' };
const sun = { Food: 'Food', Water: 'Water', Produce: 'Produce' };
const defend = { Food: 'Food', Water: 'Water' };

const armor = { ARMOR: 0 };
const showArmor = { clip: 'Idle1', seconds: 1.5, foodAppearance: true };
// wearArmor is at frame 12 in both Wall-nut Food timelines.
const wearArmor = {
  Food: [{ clip: 'Food', toFrame: 12 }, { clip: 'Food', fromFrame: 12, foodAppearance: true }, showArmor],
  Water: 'Water',
};

const loopFood = { clip: 'Food', seconds: 2 } as const;
const stagedFood = ['FoodStart', { clip: 'Fooding', seconds: 1.5 }, 'FoodEnd'] as const;
const shootLoopFood = { Food: loopFood, Water: 'Water', Shoot: 'Shoot' } as const;
const shootStartFood = { Food: ['FoodStart', loopFood], Water: 'Water', Shoot: 'Shoot' } as const;
const shootStagedFood = { Food: stagedFood, Water: 'Water', Shoot: 'Shoot' } as const;
const sunRepeatedFood = { Food: { clip: 'Food', repeats: 3 }, Water: 'Water', Produce: 'Produce' } as const;

const spikes = { Food: { clip: 'Food', seconds: 5 }, Water: 'Water', Attack: 'Attack' };
// Both wings unfold only during Plant Food, but belong in the fixed camera bounds.
const wings = ['wingL', 'wingR'];
const dragon = { Food: 'Food', Water: 'Water', Attack: 'Attack' };
const mine = {
  Food: 'Food', Water: 'Water', Attack: 'Charging',
  Grow: ['Spawn_Baby', { clip: 'Idle_Baby', seconds: 0.65 }, 'Grow'],
};

export const plantAnimations = {
  spikeweed: { armature: 'Spikeweed', idle: 'Idle', costumes: 4, actions: spikes, effects: { Food: groundSpikes } },
  spikerock: { armature: 'Spikerock', idle: 'Idle', costumes: 3, actions: spikes, effects: { Food: groundSpikes } },
  iceweed: {
    armature: 'Iceweed', idle: 'Idle', costumes: 1,
    foodSlots: {
      spks_lit_S2: 1, spk_R4_S1: 1, spk_L4_S1: 1, spk_L3_S1: 1,
      spk_R3_S1: 1, spk_R0_S1: 1, spk_R1_S1: 1, spk_L1_S1: 1,
      spk_L0_S1: 1, face_S1: 1, eyeR_S1: 1, eyeheartR_S1: 1,
      eyebrowR_S1: 1, eyeL_S1: 1, eyeheartL_S1: 1, eyebrowL_S1: 1,
      spk_R2_S1: 1, spk_L2_S1: 1, mouth_S1: 1,
    },
    actions: { Food: { clip: 'Food', foodAppearance: true }, Water: 'Water', Attack: 'Attack' },
    effects: { Food: [{ frame: 29, armature: 'Saw', clip: 'Idle', x: 47, y: -14, scale: 0.33, frames: 24, toX: 240 }] },
  },
  snapdragon: { armature: 'SnapDragon', idle: 'Idle', costumes: 5, bodySlots: wings, framing: 'flight', actions: dragon, effects: snapdragonEffects },
  coldsnapdragon: { armature: 'ColdSnapdragon', idle: 'Idle', costumes: 2, bodySlots: wings, framing: 'flight', actions: dragon, effects: coldSnapdragonEffects },
  potatomine: { armature: 'PotatoMine', idle: 'Idle', costumes: 3, actions: mine, effects: mineEffects('PotatoMine', 0.9) },
  primalpotatomine: { armature: 'PotatoMinePrimal', idle: 'Idle', costumes: 2, actions: mine, effects: mineEffects('PotatoMinePrimal', 0.4) },
  sunflower: { armature: 'Sunflower', idle: 'Idle', costumes: 8, actions: sunRepeatedFood },
  peashooter: { armature: 'Peashooter', idle: 'Idle', costumes: 10, actions: shootLoopFood },
  wallnut: { armature: 'Wall-nut', idle: 'Idle1', costumes: 9, foodSlots: armor, actions: wearArmor },
  cabbagepult: { armature: 'Cabbage-Pult', idle: 'Idle', costumes: 6, actions: lob },
  bloomerang: {
    armature: 'Bloomerang', idle: 'Idle', costumes: 3, bodyOffset: [3.652, 0],
    actions: { Food: loopFood, Water: 'Water', Shoot: ['Shoot', 'Catch'] },
  },
  twinsunflower: { armature: 'TwinSunflower', idle: 'Idle', costumes: 8, actions: sunRepeatedFood },
  repeater: {
    armature: 'Repeater', idle: 'Idle', costumes: 9,
    actions: { Food: [loopFood, 'FoodBig'], Water: 'Water', Shoot: 'Shoot' },
  },
  snowdrop: {
    armature: 'SnowDrop', idle: 'Idle', costumes: 0,
    actions: { Food: 'Food', Water: 'Water', Lob: 'Lob', Freeze: 'Lob_Butter' },
  },
  dandelion: { armature: 'Dandelion', idle: 'Idle', costumes: 2, actions: shoot },
  pvine: { armature: 'PeaVine', idle: 'Idle', costumes: 1, actions: shootLoopFood },
  kernelpult: {
    armature: 'KernelPult', idle: 'Idle', costumes: 5,
    actions: { Food: 'Food', Water: 'Water', Lob: 'Lob', Lob_Butter: 'Lob_Butter' },
  },
  coconutcannon: { armature: 'CoconutCannon', idle: 'Idle', costumes: 3, actions: shoot },
  threepeater: {
    armature: 'Threepeater', idle: 'Idle', costumes: 3,
    actions: { Food: loopFood, Water: 'Water', Shoot: 'Shoot111' },
  },
  buttercup: { armature: 'Buttercup', idle: 'Idle', costumes: 1, actions: lob },
  splitpea: {
    armature: 'SplitPea', idle: 'Idle', costumes: 3,
    actions: { Food: loopFood, Water: 'Water', Shoot: 'ShootRL' },
  },
  tallnut: {
    armature: 'TallNut', idle: 'Idle0', costumes: 6, foodSlots: armor,
    actions: { Food: { clip: 'Idle0', seconds: 1.5, foodAppearance: true }, Water: 'Water' },
  },
  peapod: {
    armature: 'Peapod', idle: 'Idle', costumes: 2, hiddenSlots: ['HEAD1', 'HEAD2', 'HEAD3', 'HEAD4'],
    actions: { Food: ['FoodStart', { clip: 'FoodShoot', repeats: 5 }, 'FoodEnd'], Water: 'Water', Shoot: 'Shoot' },
  },
  melonpult: { armature: 'Melon-pult', idle: 'Idle', costumes: 4, actions: lob },
  wintermelon: { armature: 'Melon-pult', idle: 'Idle', costumes: 4, actions: lob },
  electricpeashooter: { armature: 'ElectricPeashooter', idle: 'Idle', costumes: 1, actions: shoot },
  sapfling: { armature: 'Sapfling', idle: 'Idle', costumes: 1, actions: lob },
  marigold: {
    armature: 'MariGold', idle: 'Idle', costumes: 2,
    actions: { Food: 'Attack', Water: 'Water', Coin: 'Produce' },
  },
  laser_bean: {
    armature: 'LaserBean', idle: 'Idle', costumes: 3, bodyOffset: [3.652, 0], hiddenSlots: ['foodBeam_FS', 'foodHit_FS', 'foodBeamFront_FS', 'foodHitFront_FS'],
    actions: { Food: ['FoodStart', 'Food', 'FoodEnd'], Water: 'Water', Shoot: 'Shoot' },
  },
  citron: {
    armature: 'Citron', idle: 'Idle', costumes: 3,
    actions: { Food: 'Food', Water: 'Water', Shoot: ['Ready', 'Shoot'] },
  },
  starfruit: { armature: 'StarFruit', idle: 'Idle', costumes: 2, actions: shootStagedFood },
  pinkstarfruit: {
    armature: 'PinkStarFruit', idle: 'Idle', costumes: 2,
    actions: { Food: stagedFood, Water: 'Water', Shoot: 'Shoot0' },
  },
  shootingstarfruit: { armature: 'ShootingStarfruit', idle: 'Idle', costumes: 0, actions: shoot },
  holonut: { armature: 'InfiNut', idle: 'Idle', costumes: 3, actions: defend },
  magnifyinggrass: {
    armature: 'MagnifyingGrass', idle: 'Idle', costumes: 3,
    actions: { Food: stagedFood, Water: 'Water', Shoot: 'Shoot0' },
  },
  applemortar: {
    armature: 'AppleMortar', idle: 'Idle', costumes: 1,
    actions: { Food: 'Food', Water: 'Water', Lob: 'Shoot' },
  },
  pumpkin: { armature: 'PumpkinHead', idle: 'Idle1', costumes: 1, foodSlots: armor, actions: { Food: showArmor } },
  hollyknight: {
    armature: 'HollyKnight', idle: 'Idle', costumes: 1,
    actions: { Food: 'Food', Water: 'Water', Shoot: ['Ready', 'Shoot'] },
  },
  sunshroom: { armature: 'SunShroom', idle: 'Idle', costumes: 4, actions: sun },
  puffshroom: { armature: 'PuffShroom', idle: 'Idle', costumes: 2, actions: shootStagedFood },
  fumeshroom: { armature: 'FumeShroom', idle: 'Idle', costumes: 2, bodyOffset: [3.652, 0], actions: shoot },
  peanut: {
    armature: 'Peanut', idle: 'Idle0', costumes: 1,
    actions: { Food: ['FoodStart', { clip: 'FoodLoop', seconds: 1.5 }, 'FoodEnd'], Water: 'Water', Shoot: ['Shoot00', 'Shoot01'] },
  },
  poisonpeashooter: { armature: 'GooPea', idle: 'Idle', costumes: 1, actions: shoot },
  scaredyshroom: { armature: 'ScaredyShroom', idle: 'Idle', costumes: 2, actions: shootLoopFood },
  homingthistle: { armature: 'HomingThistle', idle: 'Idle', costumes: 1, actions: shootStagedFood },
  guacodile: {
    armature: 'Guacodile', idle: 'Idle', costumes: 1,
    actions: { Food: 'FoodLoop', Water: 'Water', Shoot: 'Shoot' },
  },
  seashroom: { armature: 'SeaShroom', idle: 'Idle', costumes: 0, actions: shootStagedFood },
  seashooter: { armature: 'SeaShooter', idle: 'Idle', costumes: 0, actions: shootLoopFood },
  aquavine: { armature: 'Aquavine', idle: 'Idle', costumes: 0, actions: shoot },
  stickybombrice: {
    armature: 'StickyBombRice', idle: 'Idle', costumes: 1,
    actions: { Food: 'Food', Water: 'Water', Lob: ['ShootR', 'ShootL'] },
  },
  lotorpedo: { armature: 'Lotus', idle: 'Idle', costumes: 1, actions: shoot },
  blastberry: {
    armature: 'BlastBerryVine', idle: 'Idle', costumes: 0,
    actions: { Food: 'Food', Water: 'Water', Lob: 'Shoot' },
  },
  pepperpult: { armature: 'PepperPult', idle: 'Idle', costumes: 4, actions: lob },
  firepeashooter: { armature: 'FirePeashooter', idle: 'Idle', costumes: 2, actions: shootStartFood },
  xshot: { armature: 'Rotobaga', idle: 'Idle', costumes: 2, actions: shoot },
  sweetpotato: { armature: 'SweetPotato', idle: 'Idle0', costumes: 1, actions: defend },
  hotdate: { armature: 'HotDate', idle: 'Idle0', costumes: 1, actions: defend },
  gatling: { armature: 'GatlingPea', idle: 'Idle', costumes: 1, actions: shootStartFood },
  redstinger: {
    armature: 'RedStinger', idle: 'Idle', costumes: 2,
    actions: { Food: ['FoodStart', { clip: 'FoodLoop', seconds: 1.5 }, 'FoodEnd'], Water: 'Water', Shoot: 'Shoot' },
  },
  akee: { armature: 'AKEE', idle: 'Idle', costumes: 2, actions: lob },
  endurian: {
    armature: 'Endurian', idle: 'Idle00', costumes: 2,
    actions: { Food: 'Food', Water: 'Water', Attack: ['AttackStart0', { clip: 'AttackLoop0', repeats: 3 }, 'AttackEnd0'] },
  },
  shinevine: {
    armature: 'ShineVine', idle: 'Idle', costumes: 0, bodyOffset: [3.652, 0],
    actions: { Food: 'Food', Water: 'Water', Produce: 'Produce', Attack: 'Attack' },
  },
  turkeypult: { armature: 'TurkeyPult', idle: 'Idle', costumes: 1, actions: lob },
  snowpea: { armature: 'SnowPea', idle: 'Idle', costumes: 5, actions: shootStartFood },
  turnip: {
    armature: 'Turnip', idle: 'Idle0', costumes: 1,
    actions: { Food: 'Food', Water: 'Water', Block: ['BlockStart0', 'BlockLoop0'] },
  },
  lychee: {
    armature: 'Lychee', idle: 'Idle', costumes: 0,
    foodSlots: { SHELL0: 1, SHELL0_eyeL_shade: 1, SHELL0_eyeR_shade: 1 },
    actions: { Food: { clip: 'Idle', seconds: 1.5, foodAppearance: true }, Water: 'Water', Shoot: 'Shoot' },
  },
  cantaloupe: { armature: 'Melon-pult', idle: 'Idle', costumes: 2, actions: lob },
  cactus: { armature: 'Cactus', idle: 'Idle', costumes: 2, actions: shoot },
  garlic: { armature: 'Garlic', idle: 'Idle00', costumes: 2, actions: defend },
  sporeshroom: { armature: 'SporeShroom', idle: 'Idle', costumes: 2, actions: shoot },
  bloominghearts: { armature: 'BloomingHearts', idle: 'Idle', costumes: 2, actions: lob },
  mirrornut: {
    armature: 'MirrorNut', idle: 'Idle00', costumes: 0,
    actions: { Food: 'Food', Water: 'Water', Shoot: ['ChargeStart0', 'ChargeAttack0', 'ChargeEnd0'] },
  },
  primalpeashooter: { armature: 'PrimalPeashooter', idle: 'Idle', costumes: 2, actions: shootLoopFood },
  primalwallnut: { armature: 'Wall-nut', idle: 'Idle1', costumes: 2, foodSlots: armor, actions: wearArmor },
  primalsunflower: { armature: 'PrimalSunflower', idle: 'Idle', costumes: 2, actions: sun },
  explodeonut: { armature: 'ExplodeONut', idle: 'Idle1', costumes: 1, actions: defend },
  skyshooter: { armature: 'Skyshooter', idle: 'Idle', costumes: 1, actions: shootLoopFood },
  anthurium: { armature: 'Anthurium', idle: 'Idle', costumes: 1, actions: shoot },
  asparagus: {
    armature: 'Asparagus', idle: 'Idle', costumes: 1,
    actions: { Food: 'Food', Water: 'Water', Shoot: ['ShootM', 'Reload'] },
  },
  megagatling: { armature: 'MegaGatlingPea', idle: 'Idle', costumes: 1, actions: shootLoopFood },
  moonflower: { armature: 'Moonflower', idle: 'Idle', costumes: 1, actions: sun },
  dusklobber: { armature: 'DuskLobber', idle: 'Idle', costumes: 2, actions: lob },
  murkadamia: { armature: 'MurkamadiaNut', idle: 'Idle00', costumes: 0, actions: defend },
  shadowpeashooter: { armature: 'ShadowPeashooter', idle: 'Idle', costumes: 2, actions: shoot },
  slingpea: {
    armature: 'SlingPea', idle: 'Idle', costumes: 2,
    actions: {
      // At reload (48), return to frame 28 for the next volley. Finish the last recoil.
      Food: [{ clip: 'Attack', toFrame: 48 }, { clip: 'Attack', fromFrame: 28, toFrame: 48, repeats: 2 }, { clip: 'Attack', fromFrame: 28 }],
      Water: 'Water', Lob: 'Attack',
    },
  },
  darkmatterdragonfruit: {
    armature: 'Dragonfruit', idle: 'Idle', costumes: 0,
    actions: { Food: ['FoodStart', { clip: 'FoodLoop', seconds: 1.5 }, 'FoodEnd'], Water: 'Water', Shoot: 'Shoot' },
  },
} as const satisfies Record<string, PlantAnimationConfig>;

export type AnimatedPlant = keyof typeof plantAnimations;

export function supportsPlantAnimation(code: string): code is AnimatedPlant {
  return Object.hasOwn(plantAnimations, code);
}
