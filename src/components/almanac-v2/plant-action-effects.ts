import type { EffectCue } from './plant-effect-cues';

// The phases share the plant's action clock. A sustained beam ends when the
// short almanac version of FoodLoop/Fooding moves on to FoodEnd.
type EffectPlacement = Omit<EffectCue, 'frame' | 'clip' | 'frames'>;
function sustained(effect: EffectPlacement, start: number, idle: number, end: number, firstClip = 'Start', lastClip = 'End'): EffectCue[] {
  return [
    { ...effect, frame: start, clip: firstClip },
    { ...effect, frame: idle, clip: 'Idle', frames: end - idle },
    { ...effect, frame: end, clip: lastClip },
  ];
}

const fume = { x: 156.296, y: -64.422, scale: 1.2, clip: 'Play' };
const seeds = { armature: 'shoot_throw', clip: 'Play', bone: 'hair_threw', x: 0, y: 0, scale: 1 };
const stinger = { armature: 'Ray', x: 7.212, y: -57.914, scale: 1.4 };
const prism = { x: 39.826, y: -80.52, scale: 1 };
const darkRay = { armature: 'Ray', x: 0, y: -77.658, scale: 1 };
const mirrorShield = { armature: 'ShieldLight', x: 0, y: 0, scale: 1 };

// Asparagus fires in three sweeps. Keep the game's lane order and event
// frames, with one blue tracer per tile inside the preview.
const asparagusShot = { clip: 'Play', bone: 'shooter', x: 0, y: 0, scale: 1 };
const asparagusFood = [
  { start: 6, lane: -1 }, { start: 61, lane: 1 }, { start: 116, lane: 0 },
].flatMap(({ start, lane }) => Array.from({ length: 8 }, (_, i) => {
  const distance = 95 + 20 * (lane === 1 ? 7 - i : i);
  const dy = lane * 60;
  return {
    ...asparagusShot, frame: start + i * 5, armature: 'ShootB',
    scaleX: Math.hypot(distance, dy) / 200, angle: Math.atan2(dy, distance) * 180 / Math.PI,
  };
}));

export const plantActionEffects = {
  garlic: { Food: [{ frame: 36, pack: 'garlic-fart', armature: 'FartParticle', clip: 'Play', x: 60, y: 0, scale: 1 }] },
  fumeshroom: {
    Shoot: [{ ...fume, frame: 13, armature: 'AttackParticle' }],
    // The original bubbles travel more than 3,000 units in eight frames.
    Food: [{ ...fume, frame: 31, armature: 'FoodParticle', scale: 0.22 }],
  },
  dandelion: {
    Shoot: [{ ...seeds, frame: 31 }],
    Food: [53, 72, 93].map(frame => ({ ...seeds, frame })),
  },
  laser_bean: { Shoot: [{ frame: 0, armature: 'shoot', clip: 'Play', bone: 'eyeL', x: 0, y: 0, scale: 1.2 }] },
  citron: { Food: [{ frame: 0, armature: 'FoodLightning', clip: 'Play', x: 0, y: 0, scale: 1 }] },
  redstinger: { Food: [
    { ...stinger, frame: 50, clip: 'Idle', frames: 70 },
    { ...stinger, frame: 120, clip: 'Die' },
  ] },
  magnifyinggrass: { Food: [
    ...sustained({ ...prism, armature: 'FoodFromPar' }, 0, 20, 55),
    // With no target the game aims across empty tiles.
    ...sustained({ ...prism, armature: 'FoodRayPar', angle: -22 }, 0, 6, 55),
  ] },
  darkmatterdragonfruit: { Food: sustained(darkRay, 36, 44, 90, 'Spawn', 'Die') },
  asparagus: {
    Shoot: [6, 11, 16, 21].map(frame => ({ ...asparagusShot, frame, armature: 'ShootY' })),
    Food: asparagusFood,
  },
  mirrornut: { Food: sustained(mirrorShield, 35, 51, 81, 'Spawn', 'Die') },
  // Food also strikes empty lawn tiles. Bring three of them into the preview.
  anthurium: { Food: [-106, 62, 170].map(x => ({ frame: 17, armature: 'FoodLightning', clip: 'Play', x, y: 0, scale: 0.65 })) },
} satisfies Record<string, Partial<Record<'Shoot' | 'Food', EffectCue[]>>>;
