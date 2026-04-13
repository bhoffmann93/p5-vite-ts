export const PI = Math.PI;
export const TAU = Math.PI * 2.0;

export const clamp = (num: number, min: number, max: number) => {
  if (max < min) {
    [min, max] = [max, min];
  }
  if (num < min) return min;
  else if (num > max) return max;
  return num;
};

export const step = (edge: number, x: number): number => {
  return x < edge ? 0.0 : 1.0;
};

// always positive, matches GLSL mod — JS % can return negative for negative x
export const mod = (x: number, y: number): number => {
  return x - y * Math.floor(x / y);
};

export const fract = (x: number): number => {
  return x - Math.floor(x);
};

// http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
export const damp = (x: number, y: number, lambda: number, deltaTime: number) => {
  return lerp(x, y, 1 - Math.exp(-lambda * deltaTime));
};

export const lerp = (min: number, max: number, amount: number) => {
  return min + amount * (max - min);
};

export const inverseLerp = (num: number, min: number, max: number) => {
  return (num - min) / (max - min);
};

export const map = (
  num: number,
  min1: number,
  max1: number,
  min2: number,
  max2: number,
  round = false,
  constrainMin = true,
  constrainMax = true,
) => {
  if (constrainMin && num < min1) return min2;
  if (constrainMax && num > max1) return max2;

  const num1 = (num - min1) / (max1 - min1);
  const num2 = num1 * (max2 - min2) + min2;
  if (round) return Math.round(num2);
  return num2;
};

//Shaping

// cubicPulse( 0.5, 0.2, x);
export const cubicPulse = (c: number, w: number, x: number) => {
  x = Math.abs(x - c);
  if (x > w) return 0.0;
  x /= w;
  return 1.0 - x * x * (3.0 - 2.0 * x);
};

// not visivle at x 0.0 an 1.0
// x = 0.5 bell at center
// [0.0, 1.0]
export const cubicPulse2 = (center: number, w: number, x: number): number => {
  const d = Math.abs(x - center);
  x = Math.min(d, 1.0 - d); // toroidal distance
  if (x > w) return 0.0;
  x /= w;
  return 1.0 - x * x * (3.0 - 2.0 * x);
};

//https://iquilezles.org/articles/functions/
//bigger k wieder parabola
export const parabola = (x: number, k: number) => {
  return Math.pow(4.0 * x * (1.0 - x), k);
};

export const nSin = (x: number): number => {
  return Math.sin(x) * 0.5 + 0.5;
};

export const nCos = (x: number): number => {
  return Math.cos(x) * 0.5 + 0.5;
};

export const nNegCos = (x: number): number => {
  return 1.0 - (Math.cos(x) * 0.5 + 0.5);
};

export const nWave = nNegCos;

//Geometry
export const length = (x: number, y: number): number => {
  return Math.hypot(x, y);
};

//same as length but less performant
export const mag = (x: number, y: number) => {
  return Math.sqrt(x * x + y * y);
};

export const dist = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.hypot(x2 - x1, y2 - y1);
};

//Shaping
export const smoothstep = (min: number, max: number, x: number): number => {
  const t = clamp((x - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
};

//Derivative
// Central finite differences — pass any f(x) as first arg
export const derivativeApprox = (f: (x: number) => number, x: number, epsilon = 0.001): number => {
  return (0.5 * (f(x + epsilon) - f(x - epsilon))) / epsilon;
};

// [-PI/2, PI/2]
export const derivativeAngle = (f: (x: number) => number, x: number): number => {
  return Math.atan(derivativeApprox(f, x));
};

// [0, 1]
export const derivativeAngle01 = (f: (x: number) => number, x: number): number => {
  return Math.atan(derivativeApprox(f, x)) / PI + 0.5;
};
