/*
** AA
*/

float aastep(float edge, float value) {
    float afwidth = fwidth(value);
    return smoothstep(edge - afwidth, edge + afwidth, value);
}

//rotation independant, varying treshold more costly
float aastepHQ(float edge, float value) {
    float d = value - edge;
    vec2 grad = vec2(dFdx(d), dFdy(d));
    return smoothstep(-1.0, 1.0, d / max(length(grad), 0.00001));
}

// AA fract/floor/mod using screen-space derivatives
// https://www.shadertoy.com/view/clB3zc
// Permission granted to use in MIT licensed app by Fabrice Neyret
float aafract(float x) {
    return min(fract(x) / (1.0 - fwidth(x)), fract(-x) / fwidth(x));
}

vec2 aafract(vec2 x) {
    return vec2(aafract(x.x), aafract(x.y));
}

float aafloor(float x) {
    return max(floor(x), x - aafract(x));
}

float aachecker(vec2 uv, vec2 tiles) {
    vec2 p = uv * tiles;
    vec2 w = fwidth(p);
    vec2 i = (abs(fract((p - 0.5) * 0.5) - 0.5) - abs(fract((p + w - 0.5) * 0.5) - 0.5)) / w;
    return step(0.0, i.x * i.y);
}

// delta is how much of a tile one screen pixel covers, which is how wide the soft edge should be.
// Pass it in when uv can jump, fwidth of a coordinate that cuts between parts reports a pixel
// covering many tiles and washes the pattern out to flat grey along the seam.
float checkerboardAA(vec2 uv, vec2 tiles, vec2 delta) {
    vec2 line = fract(uv * tiles * 0.5 + 0.25);
    vec2 edge = smoothstep(0.25 - delta, 0.25 + delta, abs(line - 0.5));
    return edge.x + edge.y - 2.0 * edge.x * edge.y;
}

float checkerboardAA(vec2 uv, vec2 tiles) {
    return checkerboardAA(uv, tiles, fwidth(uv * tiles));
}
