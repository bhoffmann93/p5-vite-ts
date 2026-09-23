float noise1d(float v) {
  return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}

float noise(in vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  float n = i.x + i.y * 57.0;
  return mix(mix(shash11(n + 0.0), shash11(n + 1.0), f.x), mix(shash11(n + 57.0), shash11(n + 58.0), f.x), f.y);
}

// Simplex 3D noise — Ian McEwan, Ashima Arts (MIT License)
// https://github.com/ashima/webgl-noise

vec3 _g_mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 _g_mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 _g_permute(vec4 x) {
  return _g_mod289(((x * 34.0) + 10.0) * x);
}
vec4 _g_taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = _g_mod289(i);
  vec4 p = _g_permute(_g_permute(_g_permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
          i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
        i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = _g_taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// The curl of a slice of simplex noise, as a flow field to push coordinates along.
//
// Curl is divergence free, so the field has no sources or sinks and nothing it carries piles up or
// drains away. Feeding a feedback loop with a plain noise offset drifts everything toward wherever
// the noise happens to point, this swirls instead, which is what makes it read as smoke rather than
// as a smear.
//
// Sampled by central difference rather than analytically, so it costs four noise evaluations.
vec2 curlNoise2(vec2 position, float time, float epsilon) {
  float above = snoise(vec3(position.x, position.y + epsilon, time));
  float below = snoise(vec3(position.x, position.y - epsilon, time));
  float right = snoise(vec3(position.x + epsilon, position.y, time));
  float left = snoise(vec3(position.x - epsilon, position.y, time));

  float gradientY = (above - below) / (2.0 * epsilon);
  float gradientX = (right - left) / (2.0 * epsilon);

  //the gradient turned a quarter turn, which is the curl of a field with only this component
  return vec2(gradientY, -gradientX);
}
