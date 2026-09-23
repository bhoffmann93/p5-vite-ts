// [-PI, PI]
float getangle(vec2 v) {
    return atan(v.y, v.x);
}

// [0, 1]
float getangleN(vec2 v) {
    return atan(v.y, v.x) / TAU + 0.5;
}

// https://www.shadertoy.com/view/Nt2yzd
// https://math.stackexchange.com/questions/3020095/signed-angle-in-plane:
// "the ratio of the cross product and scalar product is the tangent of the angle"
// From [1]: "The tangent of the signed angle between a and b is det([ab]) / dot(ab)"
float signedAngle(vec2 a, vec2 b) {
    // atan(y, x) returns the angle whose arctangent is y / x. Value in [-pi, pi]
    return atan(a.x * b.y - a.y * b.x, dot(a, b));
}

//vec from angle
vec2 directionVec(float angle) {
    return vec2(cos(angle), sin(angle));
}

vec2 angleDir(float angle) {
    return vec2(cos(angle), sin(angle));
}

vec2 angleNormal(float angle) {
    return vec2(-sin(angle), cos(angle));
}

vec2 angleNormalInward(float angle) {
    return vec2(sin(angle), -cos(angle));
}

//eg axis vec3(0, 0, 1) or normalize(vec3(1, -1, 0))
vec3 perpVec(vec3 vec, vec3 axis) {
    return normalize(cross(vec, axis));
}

vec3 perp2Vec(vec3 vec, vec3 axis) {
    return -perpVec(vec, axis);
}
