// Numeric positions are plant-local. Lob targets use the space available
// between the plant and the right edge of the current preview.
type EffectX = number | { rightEdgeFraction: number };

export interface EffectCue {
  frame: number;
  armature: string;
  clip: string;
  x: EffectX;
  y: number;
  scale: number;
  clipWidth?: number;
  bone?: string;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  /** Asset folder for a shared rig. Defaults to the current plant. */
  pack?: string;
  /** May keep flying after the plant finishes its action. */
  projectile?: boolean;
  frames?: number;
  toX?: EffectX;
  toY?: number;
  arc?: number;
  hidePlant?: boolean;
}

// Per-play volleys generate cues using the already loaded plant atlas.
export type LocalEffectCue = EffectCue & { pack?: never };
export interface PreviewBounds { left: number; top: number; right: number; bottom: number }
export type EffectTrack = readonly EffectCue[] | ((bounds: PreviewBounds) => readonly LocalEffectCue[]);

// Frame numbers follow the shipped armatures. Positions are in plant-local
// coordinates, with neighboring tiles brought inside the almanac viewport.
export const groundSpikes: EffectCue[] = [-150, 150].flatMap(x => [
  { frame: 0, armature: 'pfSpike', clip: 'Idle', x, y: 9, scale: 0.85, frames: 150 },
  { frame: 150, armature: 'pfSpike', clip: 'Die', x, y: 9, scale: 0.85 },
]);

export const snapdragonEffects = {
  Attack: [{ frame: 19, armature: 'AttackFire', clip: 'Play1', x: 245, y: -65, scale: 0.26 }],
  Food: [
    { frame: 46, armature: 'FoodFire', clip: 'Play', x: 237, y: 0, scale: 0.64 },
    // The FoodFire timeline emits burn at frame 24.
    { frame: 70, armature: 'BurnFire', clip: 'Play1', x: 180, y: 3, scale: 0.32 },
    { frame: 70, armature: 'BurnFire', clip: 'Play2', x: 237, y: 2, scale: 0.32 },
  ],
};

export const coldSnapdragonEffects = {
  Attack: [{ frame: 12, armature: 'AttackPar', clip: 'Play1', x: 207, y: -48, scale: 0.18 }],
  Food: [{ frame: 27, armature: 'FoodPar', clip: 'Play', x: 203, y: -30, scale: 0.19 }],
};

export function mineEffects(armature: string, explosionScale: number) {
  return {
    Attack: [{ frame: 14, armature: 'ExplosionSpudow', clip: 'Explode', x: 0, y: 0, scale: explosionScale, hidePlant: true }],
    Food: [-118, 118].flatMap(x => [
      { frame: 30, armature, clip: 'Flying', x: 0, y: 0, scale: 0.6, frames: 24, toX: x, arc: 104 },
      { frame: 54, armature, clip: 'Spawn', x, y: 0, scale: 0.6 },
    ]),
  };
}

// Attack event frames come from the plant timelines. Keep the three lane
// destinations close enough to distinguish them inside a single preview card.
export const duskBud: EffectCue = { frame: 12, armature: 'Prj0', clip: 'idle', x: -41, y: -131, toX: { rightEdgeFraction: 0.93 }, toY: -15, arc: 84, scale: 0.75, frames: 28, projectile: true };
export const shadowPea: EffectCue = { frame: 14, armature: 'Prj0', clip: 'i', x: 80, y: -88, toX: 240, scale: 0.55, frames: 10 };
export const darkMatter: EffectCue = { frame: 37, armature: 'Prj', clip: 'idle', x: 67, y: -79, toX: 220, scale: 0.28, frames: 17 };
export const anthuriumBolt: EffectCue = { frame: 17, armature: 'Prj0', clip: 'i', x: 0, y: -80, toX: 225, scale: 0.7, frames: 14 };

// The attack prefab tiles the bolt along the whole lane. End it at the single
// preview impact, measured from the plant prefab's PeaSpawnPoint.
export const lightningReedAttack: EffectCue[] = [
  { frame: 0, armature: 'AttackShoot', clip: 'Play1', x: 0, y: -76.666, scale: 0.8, clipWidth: 210 },
  { frame: 0, armature: 'Particle', clip: 'Play', x: 168, y: -76.666, scale: 0.45 },
];

// Fooding summons once on its first frame, after the 26-frame FoodStart.
export const parsnipFood: EffectCue[] = [26, 41].flatMap(frame => [
  { frame, armature: 'dirts', clip: 'Spawn', x: 0, y: 0, scale: 1 },
  { frame, armature: 'running_small', clip: 'Spawn', x: 0, y: 0, scale: 1, frames: 15, toX: 90 },
  { frame: frame + 15, armature: 'running_small', clip: 'Idle', x: 90, y: 0, scale: 1, frames: 22, toX: 300 },
]);

// The tornado prefab draws its two halves on opposite sides of carried zombies.
function tornado(frame: number): EffectCue[] {
  return ['PrjBack', 'PrjFront'].flatMap(armature => [
    { frame, armature, clip: 'Idle', x: 0, y: 0, scale: 0.55, frames: 24, toX: 162 },
    { frame: frame + 24, armature, clip: 'Death', x: 162, y: 0, scale: 0.55 },
  ]);
}
export const infernoEffects = { Attack: tornado(35), Food: tornado(48) };

export function gloomShroomEffects(clip: 'Play' | 'PlayDark') {
  const plume = (frame: number, armature: string): EffectCue => ({ frame, armature, clip, x: 0, y: -70, scale: 1 });
  return {
    Attack: [plume(26, 'AttParThere'), plume(26, 'AttParHere')],
    Food: [plume(66, 'FoodParThere'), plume(66, 'FoodParHere')],
  };
}

export function redStingerShots(weak: boolean): EffectCue[] {
  const shot = { armature: weak ? 'Prj_Weak' : 'Prj0', clip: 'Idle', x: 62.996, y: -42.384,
    toX: 320, frames: 12, scale: 1, projectile: true };
  return (weak ? [13] : [26, 30]).map(frame => ({ ...shot, frame }));
}
