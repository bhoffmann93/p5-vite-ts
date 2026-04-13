import { derivativeApprox, derivativeAngle, derivativeAngle01 } from './math.utils';

export type Wave = (t: number) => number;

export const waveAlgorithms: Record<string, Wave> = {
  sin: (t: number) => Math.sin(t),
  sinSquared: (t: number) => Math.sin(t) * Math.sin(t),
  sinCubed: (t: number) => Math.sin(t) * Math.sin(t) * Math.sin(t),
  sinAbs: (t: number) => Math.abs(Math.sin(t)),
  sinAbsSquared: (t: number) => Math.abs(Math.sin(t)) * Math.abs(Math.sin(t)),
  sinAbsCubed: (t: number) => Math.abs(Math.sin(t)) * Math.abs(Math.sin(t)) * Math.abs(Math.sin(t)),
  sinAbsQuartic: (t: number) =>
    Math.abs(Math.sin(t)) * Math.abs(Math.sin(t)) * Math.abs(Math.sin(t)) * Math.abs(Math.sin(t)),
  sinAbsQuintic: (t: number) =>
    Math.abs(Math.sin(t)) *
    Math.abs(Math.sin(t)) *
    Math.abs(Math.sin(t)) *
    Math.abs(Math.sin(t)) *
    Math.abs(Math.sin(t)),
  sinAbsSextic: (t: number) => Math.abs(Math.sin(t)) * Math.abs(Math.sin(t)),
  powSinCubed: (t: number) => Math.pow(Math.sin(t), 3),
  sinTimesSinScaled: (t: number) => Math.sin(t) * Math.sin(t * 1.5),
  absCosTimesSin: (t: number) => Math.abs(Math.cos(t * 2) * Math.sin(t * 4)),
  sinOfTanOfCos: (t: number) => Math.sin(Math.tan(Math.cos(t) * 1.2)),
  cosDividedBySinTimesSin: (t: number) => (Math.cos(t) / Math.sin(t * 2)) * Math.sin(t * 2),
  sinOfPow: (t: number) => Math.sin(Math.pow(8, Math.sin(t))),
  sinMinusPiTimesTan: (t: number) => Math.sin(t - Math.PI * Math.tan(t) * 0.01),
  powSinTimesPi: (t: number) => Math.pow(Math.sin(t * Math.PI), 12),
  cosTimesSinTimesTan: (t: number) => Math.cos((Math.sin(t) * Math.tan(t * Math.PI) * Math.PI) / 8),
  cosOfSum: (t: number) => Math.cos(Math.sin(t * 3) + t * 3),
  powAbsSinTimesSin: (t: number) => Math.pow(Math.abs(Math.sin(t * 2)) * 0.6, Math.sin(t * 2)) * 0.6,
  cos: (t: number) => Math.cos(t),
  cosSquared: (t: number) => Math.pow(Math.cos(t), 2),
  cosSquaredAbs: (t: number) => Math.abs(Math.pow(Math.cos(t), 2)),
  saw: (t: number) => t - Math.floor(t),
  sawtooth: (t: number) => (t % 1) - 0.5,
  triangle: (t: number) => 1 - 4 * Math.abs(Math.round(t) - t),
  square: (t: number) => Math.sign(Math.sin(t)),
  noise: (t: number) => 2 * Math.random() - 1,

  // Derivative (central finite differences)
  // slope of sin = cos, but computed numerically — useful as base for other f(t)
  derivativeSin: (t: number) => derivativeApprox((x) => Math.sin(x), t),
  // atan of slope → [-PI/2, PI/2] — angle of tangent along a sin wave
  derivativeAngleSin: (t: number) => derivativeAngle((x) => Math.sin(x), t),
  // normalized tangent angle [0, 1]
  derivativeAngle01Sin: (t: number) => derivativeAngle01((x) => Math.sin(x), t),
  // tangent angle of abs-sin — useful for wave-normal orientation
  derivativeAngle01AbsSin: (t: number) => derivativeAngle01((x) => Math.abs(Math.sin(x)), t),
};
