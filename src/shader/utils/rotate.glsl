// angle [0, 2PI] periodic
// + angle counterclockwise, - angle clockwise
mat2 rotate(float angle) {
    return mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
}

// angle [0, 2PI] periodic
// + angle counterclockwise, - angle clockwise
// correct (glsl column-major)
vec2 rotateAnchor(vec2 p, vec2 anchor, float angle) {
    vec2 translated = p - anchor;
    mat2 rotationMatrix = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
    return rotationMatrix * translated + anchor;
}

vec2 rotateCenter(vec2 p, float angle) {
    return rotateAnchor(p, vec2(0.5), angle);
}

//for trs use unaspect
vec2 rotateCenterAspect(vec2 uv, float angle, vec2 anchor, vec2 resolution) {
    float aspect = resolution.x / resolution.y;
    uv -= anchor;
    uv.x *= aspect;
    uv = uv * rotate(angle);
    uv.x /= aspect;
    uv += anchor;
    return uv;
}

// rotate around origin — translate to origin first, then call this
// eg circPos =  uv - vec2(0.5) - vec2(x, y);
vec2 rotate(vec2 p, float angle) {
    return rotate(angle) * p;
}

/*
** ROTATE.GLSL
*/
//https://github.com/dmnsgn/glsl-rotate/blob/main/rotate.glsl
//angle [0.0, TAU] radians(360)

mat3 rotation3dX(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}

mat3 rotation3dY(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

mat3 rotation3dZ(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0);
}

//Rodrigues Formula
//axis = (0,1,0) → pure Y rotation tilt left/right
//axis = (1,0,0) → pure X rotation  tilt forward/back
//axis = normalized(1,1,0) normalized → tilts diagonally, mix of both
//axis from noise → each box gets a unique tilt direction
mat4 rotation3d(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0, oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0, oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0, 0.0, 0.0, 0.0, 1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
    return (rotation3d(axis, angle) * vec4(v, 1.0)).xyz;
}

vec3 rotateX(vec3 v, float angle) {
    return rotation3dX(angle) * v;
}

vec3 rotateY(vec3 v, float angle) {
    return rotation3dY(angle) * v;
}

vec3 rotateZ(vec3 v, float angle) {
    return rotation3dZ(angle) * v;
}

//https://mini.gmshaders.com/p/3d-rotation
vec3 rotateXD(vec3 pos, vec3 axis, float angle) {
    return mix(dot(pos, axis) * axis, pos, sin(angle)) + cos(angle) * cross(axis, pos);
}

//rotates a fixed 90 degrees with a moving axis
//https://x.com/XorDev/status/1947676805546361160?s=20
vec3 rotateFixed(vec3 pos, vec3 axis, float angle) {
    return dot(pos, axis) * axis + cross(axis, pos);
}
