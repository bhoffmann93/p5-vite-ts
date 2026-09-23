vec3 toLinear(vec3 color) {
    return pow(color, vec3(2.2));
}

vec3 toSRGB(vec3 color) {
    return pow(color, vec3(1.0 / 2.2));
}

vec3 mixLinear(vec3 a, vec3 b, float t) {
    return pow(mix(pow(a, vec3(2.2)), pow(b, vec3(2.2)), t), vec3(1.0 / 2.2));
}

//[0.0,1.0] use to declare hsv color
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float chroma = q.x - min(q.w, q.y);
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * chroma + EPSILON)), chroma / (q.x + EPSILON), q.x);
}

float calcluminance(vec3 col) {
    return dot(col, vec3(0.2126, 0.7152, 0.0722));
}

//TONEMAP
vec3 acesTonemap(vec3 v) {
    v *= 0.6;
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((v * (a * v + b)) / (v * (c * v + d) + e), 0.0, 1.0);
}

// The MIT License
// https://www.youtube.com/c/InigoQuilez
// https://iquilezles.org/
//https://www.shadertoy.com/view/ll2GD3
// oscillation 0.5, 1.0, 2.0, … will ensure wrapping
vec3 palette(float t, vec3 brightness, vec3 contrast, vec3 oscillation, vec3 phase) {
    return brightness + contrast * cos(2.0 * PI * (oscillation * t + phase));
}

vec3 paletteEarthy(float t) {
    return palette(t, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.10, 0.20));
}

vec3 levels(vec3 color, float minIn, float maxIn) {
    return clamp((color - minIn) / (maxIn - minIn), 0.0, 1.0);
}

vec3 saturation(vec3 col, float saturation) {
    float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
    return mix(vec3(luma), col, saturation);
}

vec3 brightnessContrast(vec3 col, float brightness, float contrast) {
    return 0.5 * brightness + (col - 0.5) * contrast;
}

vec3 contrast(vec3 col, float contrast) {
    return 0.5 + (col - 0.5) * contrast;
}

float contrast(float channel, float contrast) {
    return 0.5 + (channel - 0.5) * contrast;
}

vec3 rgb(int r, int g, int b) {
    return vec3(float(r) / 255., float(g) / 255., float(b) / 255.);
}

vec3 rgb(int rgb) {
    return vec3(float(rgb) / 255.);
}

//eg 0x4E0105
vec3 hexToRgb(int color) {
    float rValue = float(color / 256 / 256);
    float gValue = float(color / 256 - int(rValue * 256.0));
    float bValue = float(color - int(rValue * 256.0 * 256.0) - int(gValue * 256.0));
    return vec3(rValue / 255.0, gValue / 255.0, bValue / 255.0);
}

vec3 invertColor(vec3 color) {
    return vec3(1.0 - color);
}

//dHue [0, TAU]
vec3 hueShift(vec3 color, float dhue) {
    float s = sin(dhue);
    float c = cos(dhue);
    return (color * c) + (color * s) * mat3(vec3(0.167444, 0.329213, -0.496657), vec3(-0.327948, 0.035669, 0.292279), vec3(1.250268, -1.047561, -0.202707)) + dot(vec3(0.299, 0.587, 0.114), color) * (1.0 - c);
}
