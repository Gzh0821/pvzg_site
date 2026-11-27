import type { EffectCue } from './plant-effect-cues';

type Shot = Pick<EffectCue, 'armature'> & Partial<EffectCue>;
const pea: Shot = { pack: 'pea-projectiles', armature: 'pea0' };
const giant: Shot = { ...pea, armature: 'pea_g' };
const yellow: Shot = { ...pea, armature: 'YellowPeaPrj' };
const blue: Shot = { ...pea, armature: 'BluePeaPrj' };
const ice: Shot = { armature: 'prj0' };
const peanut: Shot = { armature: 'pea0' };

// The projectile prefabs and the plant prefabs both use 0.5 world scale.
function shot(frame: number, data: Shot = pea): EffectCue {
  return { x: 66.538, y: -79.306, toX: 390, frames: 11, scale: 1, clip: 'Idle', projectile: true, ...data, frame };
}

// Peashooter.foodShooting spends its pea count evenly over two seconds.
// Sample the game's height and velocity spread reproducibly in the card.
function volley(count: number, start: number, data: Shot, duration = 60): EffectCue[] {
  return Array.from({ length: count }, (_, i) => {
    const height = (i * 17 % 43) - 21;
    const y = (data.y ?? -79.306) + height;
    return shot(start + (i + 1) * duration / count, { ...data, y, toY: y, frames: 10 + i % 4 });
  });
}

const back: Shot = { ...pea, x: -73.042, y: -78.764, toX: -390 };
const front: Shot = { ...pea, x: 75.194, y: -69.026 };
const vine: Shot = { ...pea, x: 47.442, y: -15.508 };
const electric: Shot = { armature: 'Projectile0', x: 68.186, y: -79.306, frames: 28 };
const primal: Shot = { armature: 'prj0' };

const podFrames = [20, 14, 23, 18, 16];
export function peaPodShots(heads: number): EffectCue[] {
  return podFrames.slice(0, heads).map((frame, i) => shot(frame, {
    ...pea, bone: i ? 'mouthHole' + i : 'mouthHole', x: 0, y: 0, toX: 330,
  }));
}

const threeSpawn: Shot = { ...pea, x: 18.538, y: -79.306 };
function threepeaterFood(): EffectCue[] {
  return Array.from({ length: 30 }, (_, i) => {
    const angle = Math.PI * Math.min(i, 30 - i) / 30;
    const frame = i * 2 + 1;
    const x = 18.538 + 350 * Math.cos(angle);
    const y = 350 * Math.sin(angle);
    return [shot(frame, threeSpawn), ...[-1, 1].map(sign =>
      shot(frame, { ...threeSpawn, toX: x, toY: -79.306 + sign * y }))];
  }).flat();
}

function gatlingFood(): EffectCue[] {
  const types = [pea, yellow, blue];
  return Array.from({ length: 60 }, (_, i) => {
    const frame = 20 + i;
    const data = types[i % types.length];
    const y = -79.306 + (i * 17 % 43) - 21;
    return [
      shot(frame, { ...data, y }),
      ...[-1, 1].map(sign => shot(frame, { ...data, x: 1.624, y, toY: y + sign * 110, arc: -sign * 18 })),
    ];
  }).flat();
}

export const peaProjectiles = {
  peashooter: { Shoot: [shot(15)], Food: volley(60, 0, pea) },
  repeater: { Shoot: [shot(15), shot(18)], Food: [...volley(90, 0, pea), shot(98, giant)] },
  pvine: { Shoot: [shot(18, vine)], Food: volley(60, 0, vine) },
  threepeater: {
    Shoot: [-1, 0, 1].map(sign => shot(18, { ...threeSpawn, toY: -79.306 + sign * 110, arc: -sign * 18 })),
    Food: threepeaterFood(),
  },
  splitpea: {
    Shoot: [shot(15, front), shot(20, back), shot(24, back)],
    Food: [...volley(60, 0, front), ...volley(90, 0, back), shot(75, { ...back, armature: giant.armature })],
  },
  peapod: {
    Shoot: peaPodShots(1),
    Food: [0, 1, 2, 3, 4].map(i => shot(46 + 16 + i * 32, { ...giant, bone: 'mouthHoleBig', x: 0, y: 0, toX: 330 })),
  },
  electricpeashooter: {
    Shoot: [shot(35, electric)],
    Food: [-0.45, -0.23, 0, 0.23, 0.45].map(slope => shot(35, {
      ...electric, armature: 'ProjectileBig', toY: -79.306 + 322 * slope, frames: 10,
    })),
  },
  peanut: {
    Shoot: [shot(11, { ...peanut, bone: 'mouthHoleU', x: 0, y: 0 }), shot(29, { ...peanut, bone: 'mouthHoleD', x: 0, y: 0 })],
    Food: volley(60, 18, { ...peanut, x: 26.28, y: -89.23 }, 45),
  },
  poisonpeashooter: {
    Shoot: [shot(11, { armature: 'Prj0', clip: 'i', x: 90, y: -69.46 })],
    Food: [
      shot(15, { armature: 'PrjFood', clip: 'spawn', x: 247, y: 0, toX: 247, frames: 15 }),
      shot(30, { armature: 'PrjFood', clip: 'idle', x: 247, y: 0, toX: 450, frames: 26 }),
    ],
  },
  firepeashooter: { Shoot: [shot(15, yellow)] },
  gatling: { Shoot: [16, 20, 24, 28].map(frame => shot(frame)), Food: gatlingFood() },
  snowpea: { Shoot: [shot(15, ice)], Food: volley(60, 31, ice) },
  primalpeashooter: { Shoot: [shot(15, primal)], Food: [8, 19, 30, 41, 52].map(frame => shot(frame, primal)) },
  megagatling: { Shoot: [15, 16, 17, 18].map(frame => shot(frame)), Food: volley(150, 0, pea) },
};
