export const plantAnimations = {
  peashooter: {
    armature: 'Peashooter', idle: 'Idle', costumes: 10,
    actions: ['Food', 'Water', 'Shoot'],
    foodLoopSeconds: 2,
  },
  wallnut: {
    armature: 'Wall-nut', idle: 'Idle1', costumes: 9,
    actions: ['Food', 'Water'],
    foodLoopSeconds: 0,
  },
  pvine: {
    armature: 'PeaVine', idle: 'Idle', costumes: 1,
    actions: ['Food', 'Water', 'Shoot'],
    foodLoopSeconds: 2,
  },
  cabbagepult: {
    armature: 'Cabbage-Pult', idle: 'Idle', costumes: 6,
    actions: ['Food', 'Water', 'Lob'],
    foodLoopSeconds: 0,
  },
  kernelpult: {
    armature: 'KernelPult', idle: 'Idle', costumes: 5,
    actions: ['Food', 'Water', 'Lob', 'Lob_Butter'],
    foodLoopSeconds: 0,
  },
  sunflower: {
    armature: 'Sunflower', idle: 'Idle', costumes: 8,
    actions: ['Food', 'Water', 'Produce'],
    foodLoopSeconds: 0.8,
  },
} as const;

export type AnimatedPlant = keyof typeof plantAnimations;

export function supportsPlantAnimation(code: string): code is AnimatedPlant {
  return Object.hasOwn(plantAnimations, code);
}
