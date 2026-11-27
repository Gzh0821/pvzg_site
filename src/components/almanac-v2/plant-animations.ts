import { peaProjectiles } from './plant-pea-projectiles';
import { lobProjectiles } from './plant-lob-projectiles';
import { plantActionEffects } from './plant-action-effects';
import { firePeashooterFood, pyreVineEffects } from './ground-fire-cues';
import {
  anthuriumBolt, coldSnapdragonEffects, darkMatter, duskBud, gloomShroomEffects, groundSpikes,
  infernoEffects, lightningReedAttack, mineEffects, parsnipFood, redStingerShots, shadowPea,
  snapdragonEffects, type EffectTrack,
} from './plant-effect-cues';

export type PlantAction = 'Food' | 'Water' | 'Shoot' | 'Lob' | 'Lob_Butter' | 'Produce' | 'Freeze' | 'Coin' | 'Attack' | 'Block' | 'ChargedShot';
export type ClipStep = string | {
  clip: string;
  repeats?: number;
  speed?: number;
  scale?: number;
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
  recoverAfter?: Partial<Record<PlantAction, readonly ClipStep[]>>;
  bodySlots?: readonly string[];
  framing?: 'flight';
  /** Upward preview offset as a fraction of card height. */
  previewLift?: number;
  bodyOffset?: readonly [number, number];
  foodShield?: { frame: number; positions: readonly number[]; scale: number };
  effects?: Partial<Record<PlantAction, EffectTrack>>;
  foodSlots?: Readonly<Record<string, number>> | ((slot: string) => number | undefined);
}

const shoot = { Food: 'Food', Water: 'Water', Shoot: 'Shoot' };
const lob = { Food: 'Food', Water: 'Water', Lob: 'Lob' };
const sun = { Food: 'Food', Water: 'Water', Produce: 'Produce' };
const defend = { Food: 'Food', Water: 'Water' };

// Citron shrinks after firing and finishes recharging at frame 210.
const citronRecharge = [{ clip: 'Shrink', toFrame: 32 }, { clip: 'Charge', toFrame: 210, speed: 5 }];
const armor = { ARMOR: 0 };
// Apply the upgrade at the frame where the game changes the plant's slots.
function upgradeAt(frame: number) {
  return [{ clip: 'Food', toFrame: frame }, { clip: 'Food', fromFrame: frame, foodAppearance: true }];
}
const wearArmor = { Food: upgradeAt(12), Water: 'Water' };

const loopFood = { clip: 'Food', seconds: 2 } as const;
const stagedFood = ['FoodStart', { clip: 'Fooding', seconds: 1.5 }, 'FoodEnd'] as const;
const shootLoopFood = { Food: loopFood, Water: 'Water', Shoot: 'Shoot' } as const;
const shootStartFood = { Food: ['FoodStart', loopFood], Water: 'Water', Shoot: 'Shoot' } as const;
const shootStagedFood = { Food: stagedFood, Water: 'Water', Shoot: 'Shoot' } as const;
const sunRepeatedFood = { Food: { clip: 'Food', repeats: 3 }, Water: 'Water', Produce: 'Produce' } as const;

const spikes = { Food: { clip: 'Food', seconds: 5 }, Water: 'Water', Attack: 'Attack' };
// Both wings unfold only during Plant Food, but belong in the fixed camera bounds.
const wings = ['wingL', 'wingR'];
const attack = { Food: 'Food', Water: 'Water', Attack: 'Attack' };
const mine = {
  Food: 'Food', Water: 'Water', Attack: 'Charging',
};

export const plantAnimations = {
  bonkchoy: {
    armature: 'BonkChoy', idle: 'Idle', costumes: 10,
    actions: { Food: ['FoodStart', { clip: 'Food', seconds: 2.4 }], Water: 'Water', Attack: 'Attack' },
  },
  lightningreed: {
    armature: 'LightningReed', idle: 'Idle', costumes: 5, actions: attack,
    effects: { Attack: lightningReedAttack, Food: [
      { frame: 0, armature: 'Cloud', clip: 'Spawn', x: 70, y: 0, scale: 0.75 },
      { frame: 15, armature: 'Cloud', clip: 'Fade', x: 70, y: 0, scale: 0.75 },
    ] },
  },
  phatbeet: {
    armature: 'PhatBeet', idle: 'Idle', costumes: 2, previewLift: 0.11, actions: attack,
    effects: {
      Attack: [{ frame: 14, armature: 'Wave', clip: 'Play', x: 0, y: 0, scale: 1.2 }],
      Food: [{ frame: 25, armature: 'Wave', clip: 'Play_PF', x: 0, y: 0, scale: 1.2 }],
    },
  },
  gloomshroom: {
    armature: 'GloomShroom', idle: 'Idle', costumes: 0, bodyOffset: [3.652, 0],
    actions: attack, effects: gloomShroomEffects('Play'),
  },
  inferno: { armature: 'Inferno', idle: 'Idle', costumes: 1, previewLift: 0.09, actions: attack, effects: infernoEffects },
  parsnip: {
    armature: 'Parsnip', idle: 'Idle', costumes: 2, effects: { Food: parsnipFood },
    actions: { Food: ['FoodStart', { clip: 'Fooding', repeats: 2 }, 'FoodEnd'], Water: 'Water', Attack: 'Attack' },
  },
  wasabiwhip: {
    armature: 'WasabiWhip', idle: 'Idle', costumes: 1,
    actions: { Food: ['FoodStart', { clip: 'FoodLoop', seconds: 2 }, 'FoodEnd'], Water: 'Water', Attack: 'AttackB' },
  },
  pyrevine: {
    effects: pyreVineEffects,
    armature: 'PyreVine', idle: 'Idle', costumes: 1, previewLift: 0.045, bodyOffset: [3.652, 0],
    actions: {
      Food: ['FoodStart', { clip: 'FoodLoop', seconds: 3 }, 'FoodEnd'],
      Water: 'Water', Attack: ['AttackStart', 'AttackLoop', 'AttackEnd'],
    },
  },
  spikeweed: { armature: 'Spikeweed', idle: 'Idle', costumes: 4, previewLift: 0.045, actions: spikes, effects: { Food: groundSpikes } },
  spikerock: { armature: 'Spikerock', idle: 'Idle', costumes: 3, previewLift: 0.045, actions: spikes, effects: { Food: groundSpikes } },
  iceweed: {
    armature: 'Iceweed', idle: 'Idle', costumes: 1, previewLift: 0.045,
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
  snapdragon: { armature: 'SnapDragon', idle: 'Idle', costumes: 5, bodySlots: wings, framing: 'flight', actions: attack, effects: snapdragonEffects },
  coldsnapdragon: { armature: 'ColdSnapdragon', idle: 'Idle', costumes: 2, bodySlots: wings, framing: 'flight', actions: attack, effects: coldSnapdragonEffects },
  potatomine: { armature: 'PotatoMine', idle: 'Idle', costumes: 3, previewLift: 0.075, actions: mine, effects: mineEffects('PotatoMine', 0.9) },
  primalpotatomine: { armature: 'PotatoMinePrimal', idle: 'Idle', costumes: 2, previewLift: 0.09, actions: mine, effects: mineEffects('PotatoMinePrimal', 0.4) },
  sunflower: { armature: 'Sunflower', idle: 'Idle', costumes: 8, actions: sunRepeatedFood },
  peashooter: { armature: 'Peashooter', idle: 'Idle', costumes: 10, effects: peaProjectiles.peashooter, actions: shootLoopFood },
  wallnut: { armature: 'Wall-nut', idle: 'Idle1', costumes: 9, foodSlots: armor, actions: wearArmor },
  cabbagepult: { armature: 'Cabbage-Pult', idle: 'Idle', costumes: 6, effects: lobProjectiles.cabbagepult, actions: lob },
  bloomerang: {
    armature: 'Bloomerang', idle: 'Idle', costumes: 3, bodyOffset: [3.652, 0],
    actions: { Food: loopFood, Water: 'Water', Shoot: ['Shoot', 'Catch'] },
  },
  twinsunflower: { armature: 'TwinSunflower', idle: 'Idle', costumes: 8, actions: sunRepeatedFood },
  repeater: {
    armature: 'Repeater', idle: 'Idle', costumes: 9, effects: peaProjectiles.repeater,
    actions: { Food: [loopFood, 'FoodBig'], Water: 'Water', Shoot: 'Shoot' },
  },
  snowdrop: {
    armature: 'SnowDrop', idle: 'Idle', costumes: 0,
    actions: { Food: 'Food', Water: 'Water', Lob: 'Lob', Freeze: 'Lob_Butter' },
  },
  dandelion: { armature: 'Dandelion', idle: 'Idle', costumes: 2, effects: plantActionEffects.dandelion, actions: shoot },
  pvine: { armature: 'PeaVine', idle: 'Idle', costumes: 1, effects: peaProjectiles.pvine, actions: shootLoopFood },
  kernelpult: {
    armature: 'KernelPult', idle: 'Idle', costumes: 5, effects: lobProjectiles.kernelpult, previewLift: 0.09,
    actions: { Food: 'Food', Water: 'Water', Lob: 'Lob', Lob_Butter: 'Lob_Butter' },
  },
  coconutcannon: { armature: 'CoconutCannon', idle: 'Idle', costumes: 3, actions: shoot },
  threepeater: {
    armature: 'Threepeater', idle: 'Idle', costumes: 3, effects: peaProjectiles.threepeater,
    actions: { Food: loopFood, Water: 'Water', Shoot: 'Shoot111' },
  },
  buttercup: { armature: 'Buttercup', idle: 'Idle', costumes: 1, actions: lob },
  splitpea: {
    armature: 'SplitPea', idle: 'Idle', costumes: 3, effects: peaProjectiles.splitpea,
    actions: { Food: [loopFood, { clip: 'ShootL', toFrame: 16 }], Water: 'Water', Shoot: 'ShootRL' },
  },
  tallnut: {
    armature: 'TallNut', idle: 'Idle0', costumes: 6, foodSlots: armor,
    actions: { Food: { clip: 'Idle0', seconds: 1.5, foodAppearance: true }, Water: 'Water' },
  },
  peapod: {
    armature: 'Peapod', idle: 'Idle', costumes: 2, effects: peaProjectiles.peapod,
    actions: { Food: ['FoodStart', { clip: 'FoodShoot', repeats: 5 }, 'FoodEnd'], Water: 'Water', Shoot: 'Shoot' },
  },
  melonpult: { armature: 'Melon-pult', idle: 'Idle', costumes: 4, effects: lobProjectiles.melonpult, actions: lob },
  wintermelon: { armature: 'Melon-pult', idle: 'Idle', costumes: 4, effects: lobProjectiles.wintermelon, actions: lob },
  electricpeashooter: { armature: 'ElectricPeashooter', idle: 'Idle', costumes: 1, effects: peaProjectiles.electricpeashooter, actions: shoot },
  sapfling: { armature: 'Sapfling', idle: 'Idle', costumes: 1, actions: lob },
  marigold: {
    armature: 'MariGold', idle: 'Idle', costumes: 2,
    actions: { Food: 'Attack', Water: 'Water', Coin: 'Produce' },
  },
  laser_bean: {
    armature: 'LaserBean', idle: 'Idle', costumes: 3, effects: plantActionEffects.laser_bean, previewLift: 0.17, bodyOffset: [3.652, 0],
    bodySlots: ['eyes_lit', 'eyeR_lit', 'eyeL_lit', 'teeth_U', 'teeth_D'],
    actions: { Food: ['FoodStart', 'Food', 'FoodEnd'], Water: 'Water', Shoot: 'Shoot' },
  },
  citron: {
    armature: 'Citron', idle: 'Ready', costumes: 3, effects: plantActionEffects.citron,
    actions: { Food: { clip: 'Food', toFrame: 43 }, Water: 'Water', Shoot: { clip: 'Shoot', toFrame: 34 } },
    recoverAfter: { Shoot: citronRecharge, Food: citronRecharge },
  },
  starfruit: { armature: 'StarFruit', idle: 'Idle', costumes: 2, actions: shootStagedFood },
  pinkstarfruit: {
    armature: 'PinkStarFruit', idle: 'Idle', costumes: 2,
    actions: { Food: stagedFood, Water: 'Water', Shoot: 'Shoot0' },
  },
  shootingstarfruit: { armature: 'ShootingStarfruit', idle: 'Idle', costumes: 0, actions: shoot },
  holonut: { armature: 'InfiNut', idle: 'Idle', costumes: 3, foodShield: { frame: 20, positions: [0], scale: 0.72 }, actions: defend },
  magnifyinggrass: {
    armature: 'MagnifyingGrass', idle: 'Idle', costumes: 3, effects: plantActionEffects.magnifyinggrass,
    actions: { Food: stagedFood, Water: 'Water', Shoot: 'Shoot0' },
  },
  applemortar: {
    armature: 'AppleMortar', idle: 'Idle', costumes: 1, effects: lobProjectiles.applemortar, previewLift: 0.09,
    actions: { Food: 'Food', Water: 'Water', Lob: 'Shoot' },
  },
  pumpkin: { armature: 'PumpkinHead', idle: 'Idle1', costumes: 1, previewLift: 0.11, foodSlots: armor, actions: { Food: { clip: 'Idle1', seconds: 1.5, foodAppearance: true } } },
  hollyknight: {
    armature: 'HollyKnight', idle: 'Idle', costumes: 1, previewLift: 0.09,
    actions: { Food: 'Food', Water: 'Water', Shoot: ['Ready', 'Shoot'] },
  },
  sunshroom: { armature: 'SunShroom', idle: 'Idle', costumes: 4, actions: sun },
  puffshroom: { armature: 'PuffShroom', idle: 'Idle', costumes: 2, actions: shootStagedFood },
  fumeshroom: { armature: 'FumeShroom', idle: 'Idle', costumes: 2, effects: plantActionEffects.fumeshroom, previewLift: 0.09, bodyOffset: [3.652, 0], actions: shoot },
  peanut: {
    armature: 'Peanut', idle: 'Idle0', costumes: 1, effects: peaProjectiles.peanut, foodSlots: armor,
    actions: { Food: [{ clip: 'FoodStart', foodAppearance: true }, { clip: 'FoodLoop', seconds: 1.5 }, 'FoodEnd'], Water: 'Water', Shoot: ['Shoot00', 'Shoot01'] },
  },
  poisonpeashooter: { armature: 'GooPea', idle: 'Idle', costumes: 1, effects: peaProjectiles.poisonpeashooter, actions: shoot },
  scaredyshroom: { armature: 'ScaredyShroom', idle: 'Idle', costumes: 2, actions: shootLoopFood },
  homingthistle: { armature: 'HomingThistle', idle: 'Idle', costumes: 1, actions: shootStagedFood },
  guacodile: {
    armature: 'Guacodile', idle: 'Idle', costumes: 1,
    actions: { Food: 'FoodLoop', Water: 'Water', Shoot: 'Shoot' },
  },
  seashroom: { armature: 'SeaShroom', idle: 'Idle', costumes: 0, actions: shootStagedFood },
  seashooter: { armature: 'SeaShooter', idle: 'Idle', costumes: 0, actions: shootLoopFood },
  aquavine: { armature: 'Aquavine', idle: 'Idle', costumes: 0, previewLift: 0.045, actions: shoot },
  stickybombrice: {
    armature: 'StickyBombRice', idle: 'Idle', costumes: 1,
    actions: { Food: 'Food', Water: 'Water', Lob: ['ShootR', 'ShootL'] },
  },
  lotorpedo: { armature: 'Lotus', idle: 'Idle', costumes: 1, actions: shoot },
  blastberry: {
    armature: 'BlastBerryVine', idle: 'Idle', costumes: 0, previewLift: 0.055,
    actions: { Food: 'Food', Water: 'Water', Lob: 'Shoot' },
  },
  pepperpult: { armature: 'PepperPult', idle: 'Idle', costumes: 4, effects: lobProjectiles.pepperpult, actions: lob },
  firepeashooter: { armature: 'FirePeashooter', idle: 'Idle', costumes: 2, actions: shootStartFood, effects: { ...peaProjectiles.firepeashooter, Food: firePeashooterFood } },
  xshot: { armature: 'Rotobaga', idle: 'Idle', costumes: 2, actions: shoot },
  sweetpotato: { armature: 'SweetPotato', idle: 'Idle0', costumes: 1, actions: defend },
  hotdate: { armature: 'HotDate', idle: 'Idle0', costumes: 1, previewLift: 0.09, actions: defend },
  gatling: { armature: 'GatlingPea', idle: 'Idle', costumes: 1, effects: peaProjectiles.gatling, actions: shootStartFood },
  redstinger: {
    armature: 'RedStinger', idle: 'Idle', costumes: 2, effects: { ...plantActionEffects.redstinger, Shoot: redStingerShots(false) },
    actions: { Food: ['FoodStart', { clip: 'FoodLoop', seconds: 1.5 }, 'FoodEnd'], Water: 'Water', Shoot: 'Shoot' },
  },
  akee: { armature: 'AKEE', idle: 'Idle', costumes: 2, effects: lobProjectiles.akee, actions: lob },
  endurian: {
    armature: 'Endurian', idle: 'Idle00', costumes: 2,
    foodSlots: slot => slot.endsWith('ARMOR0') ? 0 : undefined,
    actions: { Food: upgradeAt(12), Water: 'Water', Attack: ['AttackStart0', { clip: 'AttackLoop0', repeats: 3 }, 'AttackEnd0'] },
  },
  shinevine: {
    armature: 'ShineVine', idle: 'Idle', costumes: 0, bodyOffset: [3.652, 0],
    actions: { Food: 'Food', Water: 'Water', Produce: 'Produce', Attack: 'Attack' },
  },
  turkeypult: { armature: 'TurkeyPult', idle: 'Idle', costumes: 1, effects: lobProjectiles.turkeypult, actions: lob },
  snowpea: { armature: 'SnowPea', idle: 'Idle', costumes: 5, effects: peaProjectiles.snowpea, actions: shootStartFood },
  turnip: {
    armature: 'Turnip', idle: 'Idle0', costumes: 1,
    actions: { Food: 'Food', Water: 'Water', Block: ['BlockStart0', 'BlockLoop0'] },
  },
  lychee: {
    armature: 'Lychee', idle: 'Idle', costumes: 0,
    foodSlots: { SHELL0: 1, SHELL0_eyeL_shade: 1, SHELL0_eyeR_shade: 1 },
    actions: { Food: { clip: 'Idle', seconds: 1.5, foodAppearance: true }, Water: 'Water', Shoot: 'Shoot' },
  },
  cantaloupe: { armature: 'Melon-pult', idle: 'Idle', costumes: 2, effects: lobProjectiles.cantaloupe, actions: lob },
  cactus: {
    armature: 'Cactus', idle: 'Idle', costumes: 2,
    foodSlots: slot => slot.includes('stab') ? 1 : slot.includes('Light') ? 0 : undefined,
    actions: { ...shoot, Food: upgradeAt(17) },
  },
  garlic: { armature: 'Garlic', idle: 'Idle00', costumes: 2, actions: defend, effects: plantActionEffects.garlic },
  sporeshroom: { armature: 'SporeShroom', idle: 'Idle', costumes: 2, previewLift: 0.09, actions: shoot },
  bloominghearts: { armature: 'BloomingHearts', idle: 'Idle', costumes: 2, actions: lob },
  mirrornut: {
    armature: 'MirrorNut', idle: 'Idle00', costumes: 0, effects: plantActionEffects.mirrornut,
    actions: { Food: 'Food', Water: 'Water', Shoot: ['ChargeStart0', 'ChargeAttack0', 'ChargeEnd0'] },
  },
  primalpeashooter: { armature: 'PrimalPeashooter', idle: 'Idle', costumes: 2, effects: peaProjectiles.primalpeashooter, actions: shootLoopFood },
  primalwallnut: { armature: 'Wall-nut', idle: 'Idle1', costumes: 2, foodSlots: armor, actions: wearArmor },
  primalsunflower: { armature: 'PrimalSunflower', idle: 'Idle', costumes: 2, actions: sun },
  explodeonut: { armature: 'ExplodeONut', idle: 'Idle1', costumes: 1, foodSlots: armor, actions: { Food: upgradeAt(13), Water: 'Water' } },
  skyshooter: { armature: 'Skyshooter', idle: 'Idle', costumes: 1, actions: shootLoopFood },
  anthurium: {
    armature: 'Anthurium', idle: 'Idle', costumes: 1, actions: { ...shoot, ChargedShot: 'Shoot2' },
    effects: { ...plantActionEffects.anthurium, Shoot: [anthuriumBolt], ChargedShot: [{ ...anthuriumBolt, frame: 25, armature: 'Prj1' }] },
  },
  asparagus: {
    armature: 'Asparagus', idle: 'Idle', costumes: 1, effects: plantActionEffects.asparagus,
    actions: { Food: 'Food', Water: 'Water', Shoot: ['ShootM', 'Reload'] },
  },
  megagatling: { armature: 'MegaGatlingPea', idle: 'Idle', costumes: 1, effects: peaProjectiles.megagatling, actions: shootLoopFood },
  moonflower: { armature: 'Moonflower', idle: 'Idle', costumes: 1, foodShield: { frame: 49, positions: [-136, 136], scale: 0.65 }, actions: sun },
  dusklobber: { armature: 'DuskLobber', idle: 'Idle', costumes: 2, actions: lob, effects: { Lob: [duskBud] } },
  murkadamia: {
    armature: 'MurkamadiaNut', idle: 'Idle00', costumes: 0, previewLift: 0.09,
    foodSlots: { SHIELD: 0 },
    actions: { ...defend, Food: upgradeAt(14) },
  },
  shadowpeashooter: { armature: 'ShadowPeashooter', idle: 'Idle', costumes: 2, actions: shoot, effects: { Shoot: [shadowPea] } },
  slingpea: {
    armature: 'SlingPea', idle: 'Idle', costumes: 2,
    actions: {
      // At reload (48), return to frame 28 for the next volley. Finish the last recoil.
      Food: [{ clip: 'Attack', toFrame: 48 }, { clip: 'Attack', fromFrame: 28, toFrame: 48, repeats: 2 }, { clip: 'Attack', fromFrame: 28 }],
      Water: 'Water', Lob: 'Attack',
    },
  },
  darkmatterdragonfruit: {
    armature: 'Dragonfruit', idle: 'Idle', costumes: 0, effects: { ...plantActionEffects.darkmatterdragonfruit, Shoot: [darkMatter] },
    actions: { Food: ['FoodStart', { clip: 'FoodLoop', seconds: 1.5 }, 'FoodEnd'], Water: 'Water', Shoot: 'Shoot' },
  },
} as const satisfies Record<string, PlantAnimationConfig>;

export type AnimatedPlant = keyof typeof plantAnimations;

export function supportsPlantAnimation(code: string): code is AnimatedPlant {
  return Object.hasOwn(plantAnimations, code);
}
