// Display armatures and framing for the validated 0.16.31 plant previews.
// idleCenter is the visual center of the uncostumed idle loop in armature coordinates.
// Bounds include the costumes and effects that extend beyond the idle pose.
export const plantAnimations = {
  peashooter: {
    armature: 'Peashooter', idle: 'Idle', costumes: 10,
    idleCenter: [27, -54],
    bounds: [-134, -201, 330, 234], actions: ['Food', 'Water', 'Shoot'],
    foodLoopSeconds: 2,
  },
  wallnut: {
    armature: 'Wall-nut', idle: 'Idle1', costumes: 9,
    idleCenter: [-1, -58],
    bounds: [-118, -194, 228, 264], actions: ['Food', 'Water'],
    foodLoopSeconds: 0,
  },
} as const;

export type AnimatedPlant = keyof typeof plantAnimations;

export function supportsPlantAnimation(code: string): code is AnimatedPlant {
  return Object.hasOwn(plantAnimations, code);
}
