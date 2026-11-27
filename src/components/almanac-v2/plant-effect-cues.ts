export interface EffectCue {
  frame: number;
  armature: string;
  clip: string;
  x: number;
  y: number;
  scale: number;
  frames?: number;
  toX?: number;
  toY?: number;
  arc?: number;
  hidePlant?: boolean;
}

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
export const duskBud: EffectCue = { frame: 12, armature: 'Prj0', clip: 'idle', x: -41, y: -131, toX: 190, toY: -15, arc: 52, scale: 0.75, frames: 23 };
export const shadowPea: EffectCue = { frame: 14, armature: 'Prj0', clip: 'i', x: 80, y: -88, toX: 240, scale: 0.55, frames: 10 };
export const darkMatter: EffectCue = { frame: 37, armature: 'Prj', clip: 'idle', x: 67, y: -79, toX: 220, scale: 0.28, frames: 17 };
export const anthuriumBolt: EffectCue = { frame: 17, armature: 'Prj0', clip: 'i', x: 0, y: -80, toX: 225, scale: 0.7, frames: 14 };
