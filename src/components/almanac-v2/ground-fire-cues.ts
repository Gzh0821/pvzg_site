import type { EffectCue } from './plant-effect-cues';

// groundFireYellowPAR grows for nine frames, burns, then fades for eleven.
export function groundFireTile(frame: number, frames: number, x: number, y: number, scale: number, scaleY = scale): EffectCue[] {
  const tile = { pack: 'ground-fire', armature: 'fire', x, y, scale, scaleY } as const;
  return [
    { ...tile, frame, clip: 'Spawn' },
    { ...tile, frame: frame + 9, clip: 'Idle', frames: frames - 9 },
    { ...tile, frame: frame + frames, clip: 'Fade' },
  ];
}

// playFooding lights the next tile and spreads right at 18 tiles per second.
// Show the two nearest tiles for the duration of the almanac's Food loop.
export const firePeashooterFood = [
  ...groundFireTile(20, 60, 136, 16, 0.48, 0.24),
  ...groundFireTile(22, 60, 272, 16, 0.48, 0.24),
];

// Pyre Vine ignites the tile ahead on "fire" and its own tile on "fireFood".
// The latter spreads both ways at nine tiles per second.
export const pyreVineEffects = {
  Attack: [
    ...groundFireTile(11, 64, 136, 16, 0.48, 0.144),
    ...groundFireTile(14, 64, 272, 16, 0.48, 0.144),
  ],
  Food: [-2, -1, 0, 1, 2].flatMap(tile =>
    groundFireTile(12 + Math.round(Math.abs(tile) * 30 / 9), 90, tile * 136, 16, 0.48, 0.24)),
};
