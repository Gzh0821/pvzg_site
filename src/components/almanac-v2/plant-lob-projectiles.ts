import type { LocalEffectCue, PreviewBounds } from './plant-effect-cues';

type Round = {
  armature: string;
  impact: string;
  scale: number;
  clip?: string;
  impactClip?: string;
  airburst?: boolean;
};
type Target = readonly [x: LocalEffectCue['x'], y: number];
const forward = (fraction: number, y: number): Target => [{ rightEdgeFraction: fraction }, y];
const ahead = [forward(0.93, -12)];

// Project cell centers into the card in plant-local coordinates. Zero is the
// actual plant origin, which can move off center with the prefab and layout.
function lawnTarget(bounds: PreviewBounds, column: number, lane: number): [number, number] {
  return [
    bounds.left + (column + 0.5) / 9 * (bounds.right - bounds.left),
    bounds.top + (lane + 0.5) / 5 * (bounds.bottom - bounds.top),
  ];
}

function draw<T>(pool: T[], count: number): T[] {
  return Array.from({ length: count }, () => pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
}

function drawCells(bounds: PreviewBounds, count: number, firstColumn = 0, lastColumn = 8): Target[] {
  const cells: Target[] = [];
  for (let column = firstColumn; column <= lastColumn; column++) {
    for (let lane = 0; lane < 5; lane++) cells.push(lawnTarget(bounds, column, lane));
  }
  return draw(cells, count);
}

// A.K.E.E. chooses one forward enemy per occupied lane. The card represents
// three occupied lanes; their targets must be to the right of the plant.
function akeeTargets(bounds: PreviewBounds): Target[] {
  const columns = Array.from({ length: 9 }, (_, i) => i).filter(i => lawnTarget(bounds, i, 0)[0] > 0);
  return draw([0, 1, 2, 3, 4], 3).map(lane =>
    lawnTarget(bounds, columns[Math.floor(Math.random() * columns.length)], lane));
}

// Start at the shipped prefab's cabbageSpawnPoint and use its release event.
// Resolve flight and impact against the same landing spot for this throw.
function lob(frame: number, height: number, round: Round, targets = ahead, x = 0, top = -Infinity): LocalEffectCue[] {
  return targets.flatMap(([toX, toY]) => {
    const frames = typeof toX === 'number' ? 28 : 19 + Math.round(toX.rightEdgeFraction * 10);
    const burstY = round.airburst ? Math.max(top + 8, toY - 92) : toY;
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
  // With no zombies in a wave's target columns, MelonPult fills all five
  // shots independently from the entire lawn. The same tile can be hit twice.
  return {
    Lob: lob(20, 137.112, { ...melon, airburst }),
    Food: (bounds: PreviewBounds) => [25, 41, 53, 65].flatMap(frame => {
      const targets = Array.from({ length: 5 }, () =>
        lawnTarget(bounds, Math.floor(Math.random() * 9), Math.floor(Math.random() * 5)));
      return lob(frame, 137.112, mega, targets, 0, bounds.top);
    }),
  };
}

export const lobProjectiles = {
  cabbagepult: {
    Lob: lob(15, 155.324, cabbage),
    Food: (bounds: PreviewBounds) => lob(9, 155.324, { ...cabbage, armature: 'ProjectileMega', impact: 'ParticleMega', scale: 0.63 }, drawCells(bounds, 3)),
  },
  kernelpult: {
    Lob: lob(20, 172.478, corn),
    Lob_Butter: lob(20, 172.478, butter),
    Food: (bounds: PreviewBounds) => lob(10, 172.478, { ...butter, armature: 'ProjectileButter2', scale: 0.68 }, drawCells(bounds, 3)),
  },
  melonpult: melonVolley('ParticleMega'),
  wintermelon: melonVolley('ParticleMega'),
  cantaloupe: melonVolley('Particle2', true),
  pepperpult: {
    Lob: lob(10, 152.342, pepper),
    Food: (bounds: PreviewBounds) => [
      ...lob(32, 152.342, pepperFood, drawCells(bounds, 3, 0, 3)),
      ...lob(49, 152.342, pepperFood, drawCells(bounds, 3, 5, 8)),
      ...lob(66, 152.342, pepperFood, drawCells(bounds, 3, 2, 6)),
    ],
  },
  akee: {
    Lob: lob(12, 149.914, akee),
    Food: (bounds: PreviewBounds) => lob(51, 149.914, { ...akee, armature: 'PrjFood', impact: 'ParFood' }, akeeTargets(bounds)),
  },
  applemortar: {
    Lob: lob(24, 161.946, apple, [forward(0.86, -64), forward(0.94, -16), forward(0.86, 20)], 8.514),
    Food: (bounds: PreviewBounds) => lob(52, 161.946, { ...apple, armature: 'PrjFood', impact: 'ParFood' }, drawCells(bounds, 3), 8.514),
  },
  turkeypult: {
    Lob: lob(18, 155.324, turkey),
    Food: (bounds: PreviewBounds) => lob(23, 155.324, { ...turkey, armature: '_chicken_big', scale: 0.61 }, drawCells(bounds, 15)),
  },
};
