// Helper: element-wise vector operations
const addV3 = (a: number[], b: number[]): number[] => {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
};

const mulV3 = (a: number[], b: number[]): number[] => {
  return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
};

const cosVec3 = (v: number[]): number[] => {
  return [Math.cos(v[0]), Math.cos(v[1]), Math.cos(v[2])];
};

//https://iquilezles.org/articles/palettes/
export const palette = (
  t: number,
  brightness: number[],
  contrast: number[],
  oscillation: number[],
  phase: number[],
): number[] => {
  const term = mulV3(oscillation, [t, t, t]);
  const sum = addV3(term, phase);
  const cosTerm = cosVec3(sum.map((x) => 2.0 * Math.PI * x));
  return addV3(brightness, mulV3(contrast, cosTerm));
};
