// How one colour meets another. Named so a shader says which it is doing rather than spelling out
// an arithmetic that could be any of them.
//
// Every one takes the existing colour first and what is being laid over it second, so they read in
// the order the operation happens.

vec3 blendMix(vec3 base, vec3 over, float amount) {
    return mix(base, over, amount);
}

vec3 blendMax(vec3 base, vec3 over, float amount) {
    return max(base, over * amount);
}

/**
 * Fades a colour out toward black by how lit the surface under it was.
 *
 * For anything that maps a value to a colour, a palette or a gradient or a ramp. Such a map has an
 * answer for zero as much as for anything else, so it paints the empty parts of the frame in
 * whatever its darkest entry happens to be. This holds black at black and lets the colour arrive
 * only where there was something to colour.
 *
 * blackPoint is how bright the surface has to be to take the colour whole. Small is close to a hard
 * cut, larger fades it in across the darks.
 */
vec3 blendLit(vec3 over, float luminance, float blackPoint) {
    return over * smoothstep(0.0, max(blackPoint, EPSILON), luminance);
}

// the guard closes at the end of the file, everything below it is inside it too

// https://github.com/stackgl/glslify
/*
** BLENDING MODES
*/

vec3 blendAdd(vec3 base, vec3 blend) {
    return min(base + blend, vec3(1.0));
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
    return (blendAdd(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendAverage(vec3 base, vec3 blend) {
    return (base + blend) / 2.0;
}

vec3 blendAverage(vec3 base, vec3 blend, float opacity) {
    return (blendAverage(base, blend) * opacity + base * (1.0 - opacity));
}

float blendColorBurn(float base, float blend) {
    return (blend == 0.0) ? blend : max((1.0 - ((1.0 - base) / blend)), 0.0);
}

vec3 blendColorBurn(vec3 base, vec3 blend) {
    return vec3(blendColorBurn(base.r, blend.r), blendColorBurn(base.g, blend.g), blendColorBurn(base.b, blend.b));
}

vec3 blendColorBurn(vec3 base, vec3 blend, float opacity) {
    return (blendColorBurn(base, blend) * opacity + base * (1.0 - opacity));
}

float blendColorDodge(float base, float blend) {
    return (blend == 1.0) ? blend : min(base / (1.0 - blend), 1.0);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
    return vec3(blendColorDodge(base.r, blend.r), blendColorDodge(base.g, blend.g), blendColorDodge(base.b, blend.b));
}

vec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {
    return (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));
}

float blendDarken(float base, float blend) {
    return min(base, blend);
}

vec3 blendDarken(vec3 base, vec3 blend) {
    return min(base, blend);
}

vec3 blendDarken(vec3 base, vec3 blend, float opacity) {
    return (blendDarken(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendDifference(vec3 base, vec3 blend) {
    return abs(base - blend);
}

vec3 blendDifference(vec3 base, vec3 blend, float opacity) {
    return (blendDifference(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendExclusion(vec3 base, vec3 blend) {
    return base + blend - 2.0 * base * blend;
}

vec3 blendExclusion(vec3 base, vec3 blend, float opacity) {
    return (blendExclusion(base, blend) * opacity + base * (1.0 - opacity));
}

float blendLighten(float base, float blend) {
    return max(base, blend);
}

vec3 blendLighten(vec3 base, vec3 blend) {
    return max(base, blend);
}

vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
    return (blendLighten(base, blend) * opacity + base * (1.0 - opacity));
}

float blendLinearBurn(float base, float blend) {
    return max(base + blend - 1.0, 0.0);
}

vec3 blendLinearBurn(vec3 base, vec3 blend) {
    return max(base + blend - vec3(1.0), vec3(0.0));
}

vec3 blendLinearBurn(vec3 base, vec3 blend, float opacity) {
    return (blendLinearBurn(base, blend) * opacity + base * (1.0 - opacity));
}

float blendLinearDodge(float base, float blend) {
    return min(base + blend, 1.0);
}

vec3 blendLinearDodge(vec3 base, vec3 blend) {
    return min(base + blend, vec3(1.0));
}

vec3 blendLinearDodge(vec3 base, vec3 blend, float opacity) {
    return (blendLinearDodge(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendMultiply(vec3 base, vec3 blend) {
    return base * blend;
}

vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
    return (blendMultiply(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendNegation(vec3 base, vec3 blend) {
    return vec3(1.0) - abs(vec3(1.0) - base - blend);
}

vec3 blendNegation(vec3 base, vec3 blend, float opacity) {
    return (blendNegation(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendNormal(vec3 base, vec3 blend) {
    return blend;
}

vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
    return (blendNormal(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    return mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
    return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendPhoenix(vec3 base, vec3 blend) {
    return min(base, blend) - max(base, blend) + vec3(1.0);
}

vec3 blendPhoenix(vec3 base, vec3 blend, float opacity) {
    return (blendPhoenix(base, blend) * opacity + base * (1.0 - opacity));
}

float blendReflect(float base, float blend) {
    return (blend == 1.0) ? blend : min(base * base / (1.0 - blend), 1.0);
}

vec3 blendReflect(vec3 base, vec3 blend) {
    return vec3(blendReflect(base.r, blend.r), blendReflect(base.g, blend.g), blendReflect(base.b, blend.b));
}

vec3 blendReflect(vec3 base, vec3 blend, float opacity) {
    return (blendReflect(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendScreen(vec3 base, vec3 blend) {
    return 1.0 - (1.0 - base.rgb) * (1.0 - blend.rgb);
}

vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
    return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
}

float blendSoftLight(float base, float blend) {
    return (blend < 0.5) ? (2.0 * base * blend + base * base * (1.0 - 2.0 * blend)) : (sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend));
}

vec3 blendSoftLight(vec3 base, vec3 blend) {
    return vec3(blendSoftLight(base.r, blend.r), blendSoftLight(base.g, blend.g), blendSoftLight(base.b, blend.b));
}

vec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {
    return (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendSubtract(vec3 base, vec3 blend) {
    return max(base + blend - vec3(1.0), vec3(0.0));
}

vec3 blendSubtract(vec3 base, vec3 blend, float opacity) {
    return (blendSubtract(base, blend) * opacity + base * (1.0 - opacity));
}

// depends on blendColorBurn, blendColorDodge
float blendVividLight(float base, float blend) {
    return (blend < 0.5) ? blendColorBurn(base, 2.0 * blend) : blendColorDodge(base, 2.0 * (blend - 0.5));
}

vec3 blendVividLight(vec3 base, vec3 blend) {
    return vec3(blendVividLight(base.r, blend.r), blendVividLight(base.g, blend.g), blendVividLight(base.b, blend.b));
}

vec3 blendVividLight(vec3 base, vec3 blend, float opacity) {
    return (blendVividLight(base, blend) * opacity + base * (1.0 - opacity));
}

// depends on blendReflect
vec3 blendGlow(vec3 base, vec3 blend) {
    return blendReflect(blend, base);
}

vec3 blendGlow(vec3 base, vec3 blend, float opacity) {
    return (blendGlow(base, blend) * opacity + base * (1.0 - opacity));
}

// depends on blendOverlay
vec3 blendHardLight(vec3 base, vec3 blend) {
    return blendOverlay(blend, base);
}

vec3 blendHardLight(vec3 base, vec3 blend, float opacity) {
    return (blendHardLight(base, blend) * opacity + base * (1.0 - opacity));
}

// depends on blendVividLight
float blendHardMix(float base, float blend) {
    return (blendVividLight(base, blend) < 0.5) ? 0.0 : 1.0;
}

vec3 blendHardMix(vec3 base, vec3 blend) {
    return vec3(blendHardMix(base.r, blend.r), blendHardMix(base.g, blend.g), blendHardMix(base.b, blend.b));
}

vec3 blendHardMix(vec3 base, vec3 blend, float opacity) {
    return (blendHardMix(base, blend) * opacity + base * (1.0 - opacity));
}

// depends on blendLinearBurn, blendLinearDodge
float blendLinearLight(float base, float blend) {
    return (blend < 0.5) ? blendLinearBurn(base, 2.0 * blend) : blendLinearDodge(base, 2.0 * (blend - 0.5));
}

vec3 blendLinearLight(vec3 base, vec3 blend) {
    return vec3(blendLinearLight(base.r, blend.r), blendLinearLight(base.g, blend.g), blendLinearLight(base.b, blend.b));
}

vec3 blendLinearLight(vec3 base, vec3 blend, float opacity) {
    return (blendLinearLight(base, blend) * opacity + base * (1.0 - opacity));
}

// depends on blendDarken, blendLighten
float blendPinLight(float base, float blend) {
    return (blend < 0.5) ? blendDarken(base, 2.0 * blend) : blendLighten(base, 2.0 * (blend - 0.5));
}

vec3 blendPinLight(vec3 base, vec3 blend) {
    return vec3(blendPinLight(base.r, blend.r), blendPinLight(base.g, blend.g), blendPinLight(base.b, blend.b));
}

vec3 blendPinLight(vec3 base, vec3 blend, float opacity) {
    return (blendPinLight(base, blend) * opacity + base * (1.0 - opacity));
}
