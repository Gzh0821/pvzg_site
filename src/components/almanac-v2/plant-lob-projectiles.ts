import type { EffectCue } from './plant-effect-cues';

type Round = {
  armature: string;
  impact: string;
  scale: number;
  clip?: string;
  impactClip?: string;
  airburst?: boolean;
};
type Target = readonly [rightEdgeFraction: number, y: number];
const ahead: Target[] = [[0.93, -12]];
const spread: Target[] = [[0.64, -12], [0.8, -40], [0.95, -8]];

// Start at the shipped prefab's cabbageSpawnPoint and use its release event.
// Resolve flight and impact against the same far landing spot for this throw.
function lob(frame: number, height: number, round: Round, targets = ahead, x = 0): EffectCue[] {
  return targets.flatMap(([rightEdgeFraction, toY]) => {
    const toX = { rightEdgeFraction };
    const frames = 19 + Math.round(rightEdgeFraction * 10);
    const burstY = round.airburst ? toY - 92 : toY;
    return [
      { frame, armature: round.armature, clip: round.clip ?? 'Idle', x, y: -height,
        toX, toY: burstY, arc: 92, scale: round.scale, frames, projectile: true },
      { frame: frame + frames, armature: round.impact, clip: round.impactClip ?? 'Play',
        x: toX, y: burstY, scale: round.scale, projectile: true },
      ...(round.airburst ? [
        { frame: frame + frames, armature: 'Shoot', clip: 'Play0', x: toX, y: toY, scale: 0.24, projectile: true },
        { frame: frame + frames, armature: 'Splash', clip: 'Play', x: toX, y: toY, scale: 0.5, projectile: true },
      ] : []),
    ];
  });
}

const cabbage: Round = { armature: 'Projectile1', impact: 'Particle1', impactClip: 'Pop', scale: 0.85 };
const corn: Round = { armature: 'Projectile0', impact: 'Particle0', scale: 0.9 };
const butter: Round = { armature: 'ProjectileButter0', impact: 'ParticleButter0', scale: 0.85 };
const melon: Round = { armature: 'Projectile0', impact: 'Particle0', scale: 0.65 };
const pepper: Round = { armature: 'Prj0', impact: 'Par0', scale: 0.6 };
const pepperFood: Round = { armature: 'PrjFood', impact: 'ParFood', scale: 0.55 };
const akee: Round = { armature: 'Prj', clip: 'idle', impact: 'Par', impactClip: 'Play0', scale: 0.85 };
const apple: Round = { armature: 'Prj0', impact: 'Par0', scale: 0.7 };
const turkey: Round = { armature: '_chicken', clip: 'idle', impact: 'Par', impactClip: 'Pop', scale: 0.7 };

function melonVolley(impact: string, airburst = false) {
  const mega = { armature: 'ProjectileMega', impact, scale: 0.62, airburst };
  // MelonPult fires four waves, stepping from the far columns to the near ones.
  return {
    Lob: lob(20, 137.112, { ...melon, airburst }),
    Food: [
      ...lob(25, 137.112, mega, [[0.96, -32], [0.9, 0]]),
      ...lob(41, 137.112, mega, [[0.87, -22], [0.81, 0]]),
      ...lob(53, 137.112, mega, [[0.78, -21], [0.71, 0]]),
      ...lob(65, 137.112, mega, [[0.67, -22], [0.58, 0]]),
    ],
  };
}

export const lobProjectiles = {
  cabbagepult: {
    Lob: lob(15, 155.324, cabbage),
    Food: lob(9, 155.324, { ...cabbage, armature: 'ProjectileMega', impact: 'ParticleMega', scale: 0.63 }, spread),
  },
  kernelpult: {
    Lob: lob(20, 172.478, corn),
    Lob_Butter: lob(20, 172.478, butter),
    Food: lob(10, 172.478, { ...butter, armature: 'ProjectileButter2', scale: 0.68 }, spread),
  },
  melonpult: melonVolley('ParticleMega'),
  wintermelon: melonVolley('ParticleMega'),
  cantaloupe: melonVolley('Particle2', true),
  pepperpult: {
    Lob: lob(10, 152.342, pepper),
    Food: [
      ...lob(32, 152.342, pepperFood, [spread[0]]),
      ...lob(49, 152.342, pepperFood, [spread[2]]),
      ...lob(66, 152.342, pepperFood, [spread[1]]),
    ],
  },
  akee: {
    Lob: lob(12, 149.914, akee),
    Food: lob(51, 149.914, { ...akee, armature: 'PrjFood', impact: 'ParFood' }, spread),
  },
  applemortar: {
    Lob: lob(24, 161.946, apple, [[0.86, -64], [0.94, -16], [0.86, 20]], 8.514),
    Food: lob(52, 161.946, { ...apple, armature: 'PrjFood', impact: 'ParFood' }, spread, 8.514),
  },
  turkeypult: {
    Lob: lob(18, 155.324, turkey),
    Food: lob(23, 155.324, { ...turkey, armature: '_chicken_big', scale: 0.61 }, spread),
  },
};
