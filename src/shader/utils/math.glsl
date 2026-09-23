float saturate(float x) {
    return clamp(x, 0.0, 1.0);
}

vec2 saturate(vec2 x) {
    return clamp(x, vec2(0.0), vec2(1.0));
}

vec3 saturate(vec3 x) {
    return clamp(x, vec3(0.0), vec3(1.0));
}

//[-infinity, infinty]
//Quantizes value into discrete steps, with the last step being less than 1.0
float quantize(float value, float steps) {
    return floor(value * steps) / steps; //last step is < 1.0
}

//[-infinity, infinty]
// Quantizes value into discrete steps, with the last step being less than 1.0
vec2 quantize(vec2 value, vec2 steps) {
    return floor(value * steps) / steps;
}

//[-infinity, infinty]
// Quantizes value into discrete steps, with the last step being  1.0
float quantizeCeil(float value, float steps) {
    return floor(value * steps) / (steps - 1.0);
}

//[-infinity, infinty]
// Quantizes value into discrete steps, with the last step being  1.0
vec3 quantizeCeil(vec3 value, float steps) {
    return floor(value * steps) / (steps - 1.0);
}

float inverseLerp(float a, float b, float v) {
    return (v - a) / (b - a);
}

vec2 inverseLerp(vec2 a, vec2 b, vec2 v) {
    return (v - a) / (b - a);
}

float inverseLerpClamped(float a, float b, float v) {
    return clamp((v - a) / (b - a), 0.0, 1.0);
}

vec2 inverseLerpClamped(vec2 a, vec2 b, vec2 v) {
    return clamp((v - a) / (b - a), 0.0, 1.0);
}

float linearstep(float a, float b, float value) {
    return clamp((value - a) / (b - a), 0.0, 1.0);
}

float remap(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec2 remap(vec2 value, vec2 min1, vec2 max1, vec2 min2, vec2 max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

//like fract(uv) but mirrors the edges call after transformations unaspect
float fractmirror(float x) {
    x = fract(x * 0.5) * 2.0;
    return x < 1.0 ? x : 2.0 - x;
}

vec2 fractmirror(vec2 uv) {
    uv = fract(uv * 0.5) * 2.0;
    return mix(uv, 2.0 - uv, greaterThan(uv, vec2(1.0)));
}

// https://iquilezles.org/articles/functions/
float gain(float x, float k) {
    float a = 0.5 * pow(2.0 * ((x < 0.5) ? x : 1.0 - x), k);
    return (x < 0.5) ? a : 1.0 - a;
}

float parabola(float x, float k) {
    return pow(4.0 * x * (1.0 - x), k);
}

float parabola(float x) {
    return parabola(x, 2.0);
}

// useful as a cubic pulse with spring easing
//like impulse 0-1-0 with sin wave bouncing k = pulse width
float sinc(float x, float k) {
    float a = PI * (k * x - 1.0);
    return sin(a) / a;
}

// Smoothly accelerates from rest to constant speed, then stays at constant.
// Returns the integral of smoothstep(0, duration, t) — useful for time-driven offsets.
float smoothstepIntegral(float time, float duration) {
    if (time >= duration) return time - 0.5 * duration;
    float f = time / duration;
    return f * f * f * (duration - time * 0.5);
}

// Smooth absolute value — avoids the cusp at x = 0.
float smoothAbs(float x, float n) {
    return sqrt(x * x + n * n);
}

// Leaves x alone past w and lands the run below it at e with no slope, taking the point out of a
// length or an abs. Wants e no greater than two thirds of w, or the curve dips before it rejoins.
float almostIdentity(float x, float w, float e) {
    if (x > w) return x;
    float a = 2.0 * e - w;
    float b = 2.0 * w - 3.0 * e;
    float t = x / w;
    return (a * t + b) * t * t + e;
}

//SMINS
//https://iquilezles.org/articles/smin/
//distorts everywhere
float sminExponential(float a, float b, float k) {
    float res = exp2(-k * a) + exp2(-k * b);
    return -log2(res) / k;
}

// quadratic polynomial
float sminQuadPoly(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

//recommended for sdf blending
float sminCubicPoly(float a, float b, float k) {
    k *= 6.0;
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0 / 6.0);
}

float smin(float a, float b, float k) {
    return sminExponential(a, b, k);
}

// not visible at x 0.0 an 1.0
// x = 0.5 bell at center
// [0.0, 1.0]
// call like:
// float w = 0.2;
// float x = mix(-w, 1.0 + w, fract(uTime));
// col = vec3(cubicPulse(x, w, vUv.x));
float cubicPulse(float center, float w, float x) {
    x = abs(x - center);
    if (x > w)
        return 0.0;
    x /= w;
    return 1.0 - x * x * (3.0 - 2.0 * x);
}

float cubicPulseWrap(float center, float w, float x) {
    float d = abs(x - center);
    x = min(d, 1.0 - d);
    if (x > w)
        return 0.0;
    x /= w;
    return 1.0 - x * x * (3.0 - 2.0 * x);
}
