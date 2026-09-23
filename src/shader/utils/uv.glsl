//per axis stretch aspect01 applies, so a direction or a distance can be moved between the two spaces
vec2 aspect01AxisScale(vec2 resolution) {
    float aspect = resolution.x / resolution.y;
    return resolution.x > resolution.y ? vec2(aspect, 1.0) : vec2(1.0, 1.0 / aspect);
}

//one side will be 1 the other <1,>1
vec2 aspect01(vec2 uv, vec2 resolution) {
    return (uv - 0.5) * aspect01AxisScale(resolution) + 0.5;
}

bool isOutside01(vec2 uv) {
    return uv != clamp(uv, 0.0, 1.0);
}

vec2 unaspect01(vec2 uv, vec2 resolution) {
    return (uv - 0.5) / aspect01AxisScale(resolution) + 0.5;
}

//Center at 0 and one Side 1.0
vec2 aspect11(vec2 uv, vec2 resolution) {
    return (2.0 * uv * resolution - resolution) / min(resolution.x, resolution.y);
}

vec2 toPolar(vec2 uv, vec2 center) {
    vec2 localUv = uv - center;
    float radius = length(localUv);
    float angle = atan(localUv.y, localUv.x); // returns [-π, π]
    return vec2(radius, angle);
}

vec2 toPolar(vec2 uv) {
    return toPolar(uv, vec2(0.5));
}

vec2 toPolarN(vec2 uv, vec2 center) {
    vec2 localUv = uv - center;
    float radius = length(localUv) / sqrt(0.5); // 01
    float angle = atan(localUv.y, localUv.x) / TAU + 0.5; // 01
    return vec2(radius, angle);
}

vec2 toPolarN(vec2 uv) {
    return toPolarN(uv, vec2(0.5));
}

vec2 scale(vec2 p, vec2 center, float scaleFactor) {
    return (p - center) / scaleFactor + center;
}

vec2 scale(vec2 p, vec2 center, vec2 scaleFactor) {
    return (p - center) / scaleFactor + center;
}

vec2 scale(vec2 p, float scaleFactor) {
    return scale(p, vec2(0.5), scaleFactor);
}

vec2 scale(vec2 p, vec2 scaleFactor) {
    return scale(p, vec2(0.5), scaleFactor);
}

float checkerboard(vec2 uv, vec2 tiles) {
    return mod(floor(uv.x * tiles.x) + floor(uv.y * tiles.y), 2.0);
}
