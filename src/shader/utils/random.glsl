/*
** HASHES
*/

// https://www.shadertoy.com/view/4djSRW
// Can produce Stripes when using uv: use gl_FragCoordinates.xy or scale uv up
// Temporal Noise -> use frame not time hash13(coords.xy, frame)

//hashes in out
float hash11(float p) {
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

//----------------------------------------------------------------------------------------
//  1 out, 2 in...
float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

//----------------------------------------------------------------------------------------
//  1 out, 3 in...
float hash13(vec3 p3) {
    p3 = fract(p3 * .1031);
    p3 += dot(p3, p3.zyx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
//----------------------------------------------------------------------------------------
// 1 out 4 in...
float hash14(vec4 p4) {
    p4 = fract(p4 * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy + 33.33);
    return fract((p4.x + p4.y) * (p4.z + p4.w));
}

//----------------------------------------------------------------------------------------
//  2 out, 1 in...
vec2 hash21(float p) {
    float n = fract(p * 0.1031);
    n *= n + 33.33;
    n *= n + n;
    return fract(vec2(n, n * 1.7));
}

//----------------------------------------------------------------------------------------
///  2 out, 2 in...
vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

//good for noise blurs
//----------------------------------------------------------------------------------------
///  2 out, 3 in...
vec2 hash23(vec3 p3) {
    p3 = fract(p3 * vec3(443.897, 441.423, .0973));
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.xx + p3.yz) * p3.zy);
}

//----------------------------------------------------------------------------------------
//  3 out, 1 in...
vec3 hash31(float p) {
    vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xxy + p3.yzz) * p3.zyx);
}

//----------------------------------------------------------------------------------------
///  3 out, 2 in...
vec3 hash32(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yzz) * p3.zyx);
}

//----------------------------------------------------------------------------------------
///  3 out, 3 in...
vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yxx) * p3.zyx);
}

//----------------------------------------------------------------------------------------
// 4 out, 1 in...
vec4 hash41(float p) {
    vec4 p4 = fract(vec4(p) * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy + 33.33);
    return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}

//----------------------------------------------------------------------------------------
// 4 out, 2 in...
vec4 hash42(vec2 p) {
    vec4 p4 = fract(vec4(p.xyxy) * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy + 33.33);
    return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}

//----------------------------------------------------------------------------------------
// 4 out, 3 in...
vec4 hash43(vec3 p) {
    vec4 p4 = fract(vec4(p.xyzx) * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy + 33.33);
    return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}

//----------------------------------------------------------------------------------------
// 4 out, 4 in...
vec4 hash44(vec4 p4) {
    p4 = fract(p4 * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy + 33.33);
    return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}

//Sin Hashes
float shash11(float n) {
    return fract(sin(n) * 43758.5453);
}

float shash12(vec2 coord) {
    return fract(sin(dot(coord.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 shash22(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

// [0, steps]
float rndInt11(float seed, float steps) {
    return floor(hash11(seed) * (steps + 1.0));
}

/**
 * Returns 1.0 if the tile index matches the target index, else 0.0.
 * Useful for isolating a specific cell in a grid. Stepping through random indices
 *  getRandomIndexMask(rndInt11(counter, amt - 1.0), i)
 */
float getRandomIndexMask(float rndIndex, float index) {
    return step(index - 0.0001, rndIndex) * step(rndIndex, index + 0.0001);
}

// one random index
float randomIndexMask(float seed, float index, float count) {
    return getRandomIndexMask(rndInt11(seed, count - 1.0), index);
}

/**
*  Multiple indexes
 * Returns a binary 1.0 or 0.0 based on a probability threshold.
 * Default threshold is 0.5. Step through multiple indices
 */

float getRandomIndicesMask(vec2 index, vec2 seed, float threshold) {
    return step(hash12(index + seed), threshold);
}

float getRandomIndicesMask(vec2 index, float seed, float threshold) {
    return step(hash12(index + seed), threshold);
}

/*
** MURMUR HASHES
*/

// https://www.shadertoy.com/view/ttc3zr
//
// murmurHashNM() takes M unsigned integers and returns N hash values.
// The returned values are unsigned integers between 0 and 2^32 - 1.
//
// mhashNM() takes M floating point numbers and returns N hash values.
// The returned values are floating point numbers between 0.0 and 1.0.

//------------------------------------------------------------------------------

uint murmurHash11(uint src) {
    const uint M = 0x5bd1e995u;
    uint h = 1190494759u;
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 1 output, 1 input
float mhash11(float src) {
    uint h = murmurHash11(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uint murmurHash12(uvec2 src) {
    const uint M = 0x5bd1e995u;
    uint h = 1190494759u;
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src.x;
    h *= M;
    h ^= src.y;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 1 output, 2 inputs
float mhash12(vec2 src) {
    uint h = murmurHash12(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uint murmurHash13(uvec3 src) {
    const uint M = 0x5bd1e995u;
    uint h = 1190494759u;
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src.x;
    h *= M;
    h ^= src.y;
    h *= M;
    h ^= src.z;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 1 output, 3 inputs
float mhash13(vec3 src) {
    uint h = murmurHash13(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uint murmurHash14(uvec4 src) {
    const uint M = 0x5bd1e995u;
    uint h = 1190494759u;
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src.x;
    h *= M;
    h ^= src.y;
    h *= M;
    h ^= src.z;
    h *= M;
    h ^= src.w;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 1 output, 4 inputs
float mhash14(vec4 src) {
    uint h = murmurHash14(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uvec2 murmurHash21(uint src) {
    const uint M = 0x5bd1e995u;
    uvec2 h = uvec2(1190494759u, 2147483647u);
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 2 outputs, 1 input
vec2 mhash21(float src) {
    uvec2 h = murmurHash21(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uvec2 murmurHash22(uvec2 src) {
    const uint M = 0x5bd1e995u;
    uvec2 h = uvec2(1190494759u, 2147483647u);
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src.x;
    h *= M;
    h ^= src.y;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 2 outputs, 2 inputs
vec2 mhash22(vec2 src) {
    uvec2 h = murmurHash22(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uvec2 murmurHash23(uvec3 src) {
    const uint M = 0x5bd1e995u;
    uvec2 h = uvec2(1190494759u, 2147483647u);
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src.x;
    h *= M;
    h ^= src.y;
    h *= M;
    h ^= src.z;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 2 outputs, 3 inputs
vec2 mhash23(vec3 src) {
    uvec2 h = murmurHash23(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uvec2 murmurHash24(uvec4 src) {
    const uint M = 0x5bd1e995u;
    uvec2 h = uvec2(1190494759u, 2147483647u);
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src.x;
    h *= M;
    h ^= src.y;
    h *= M;
    h ^= src.z;
    h *= M;
    h ^= src.w;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 2 outputs, 4 inputs
vec2 mhash24(vec4 src) {
    uvec2 h = murmurHash24(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uvec3 murmurHash31(uint src) {
    const uint M = 0x5bd1e995u;
    uvec3 h = uvec3(1190494759u, 2147483647u, 3559788179u);
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 3 outputs, 1 input
vec3 mhash31(float src) {
    uvec3 h = murmurHash31(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uvec3 murmurHash32(uvec2 src) {
    const uint M = 0x5bd1e995u;
    uvec3 h = uvec3(1190494759u, 2147483647u, 3559788179u);
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src.x;
    h *= M;
    h ^= src.y;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 3 outputs, 2 inputs
vec3 mhash32(vec2 src) {
    uvec3 h = murmurHash32(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uvec3 murmurHash33(uvec3 src) {
    const uint M = 0x5bd1e995u;
    uvec3 h = uvec3(1190494759u, 2147483647u, 3559788179u);
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src.x;
    h *= M;
    h ^= src.y;
    h *= M;
    h ^= src.z;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 3 outputs, 3 inputs
vec3 mhash33(vec3 src) {
    uvec3 h = murmurHash33(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uvec3 murmurHash34(uvec4 src) {
    const uint M = 0x5bd1e995u;
    uvec3 h = uvec3(1190494759u, 2147483647u, 3559788179u);
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src.x;
    h *= M;
    h ^= src.y;
    h *= M;
    h ^= src.z;
    h *= M;
    h ^= src.w;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 3 outputs, 4 inputs
vec3 mhash34(vec4 src) {
    uvec3 h = murmurHash34(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uvec4 murmurHash41(uint src) {
    const uint M = 0x5bd1e995u;
    uvec4 h = uvec4(1190494759u, 2147483647u, 3559788179u, 179424673u);
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 4 outputs, 1 input
vec4 mhash41(float src) {
    uvec4 h = murmurHash41(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uvec4 murmurHash42(uvec2 src) {
    const uint M = 0x5bd1e995u;
    uvec4 h = uvec4(1190494759u, 2147483647u, 3559788179u, 179424673u);
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src.x;
    h *= M;
    h ^= src.y;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 4 outputs, 2 inputs
vec4 mhash42(vec2 src) {
    uvec4 h = murmurHash42(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uvec4 murmurHash43(uvec3 src) {
    const uint M = 0x5bd1e995u;
    uvec4 h = uvec4(1190494759u, 2147483647u, 3559788179u, 179424673u);
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src.x;
    h *= M;
    h ^= src.y;
    h *= M;
    h ^= src.z;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 4 outputs, 3 inputs
vec4 mhash43(vec3 src) {
    uvec4 h = murmurHash43(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

//------------------------------------------------------------------------------

uvec4 murmurHash44(uvec4 src) {
    const uint M = 0x5bd1e995u;
    uvec4 h = uvec4(1190494759u, 2147483647u, 3559788179u, 179424673u);
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src.x;
    h *= M;
    h ^= src.y;
    h *= M;
    h ^= src.z;
    h *= M;
    h ^= src.w;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

// 4 outputs, 4 inputs
vec4 mhash44(vec4 src) {
    uvec4 h = murmurHash44(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}
