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

//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//

vec2 _g_mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec3 _g_permute(vec3 x) {
  return _g_mod289(((x * 34.0) + 10.0) * x);
}
vec3 _g_mod7(vec3 x) {
  return x - floor(x * (1.0 / 7.0)) * 7.0;
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = _g_mod289(i); // Avoid truncation effects in permutation
  vec3 p = _g_permute( _g_permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Cellular noise ("Worley noise") in 2D in GLSL.
// Copyright (c) Stefan Gustavson 2011-04-19. All rights reserved.
// This code is released under the conditions of the MIT license.
// See LICENSE file for details.
// https://github.com/stegu/webgl-noise

// Cellular noise, returning F1 and F2 in a vec2.
// Standard 3x3 search window for good F1 and F2 values
vec2 cellular(vec2 P) {
	const float K = 0.142857142857; // 1/7
	const float Ko = 0.428571428571; // 3/7
	const float jitter = 1.0; // Less gives more regular pattern
	vec2 Pi = _g_mod289(floor(P));
 	vec2 Pf = fract(P);
	vec3 oi = vec3(-1.0, 0.0, 1.0);
	vec3 of = vec3(-0.5, 0.5, 1.5);
	vec3 px = _g_permute(Pi.x + oi);
	vec3 p = _g_permute(px.x + Pi.y + oi); // p11, p12, p13
	vec3 ox = fract(p*K) - Ko;
	vec3 oy = _g_mod7(floor(p*K))*K - Ko;
	vec3 dx = Pf.x + 0.5 + jitter*ox;
	vec3 dy = Pf.y - of + jitter*oy;
	vec3 d1 = dx * dx + dy * dy; // d11, d12 and d13, squared
	p = _g_permute(px.y + Pi.y + oi); // p21, p22, p23
	ox = fract(p*K) - Ko;
	oy = _g_mod7(floor(p*K))*K - Ko;
	dx = Pf.x - 0.5 + jitter*ox;
	dy = Pf.y - of + jitter*oy;
	vec3 d2 = dx * dx + dy * dy; // d21, d22 and d23, squared
	p = _g_permute(px.z + Pi.y + oi); // p31, p32, p33
	ox = fract(p*K) - Ko;
	oy = _g_mod7(floor(p*K))*K - Ko;
	dx = Pf.x - 1.5 + jitter*ox;
	dy = Pf.y - of + jitter*oy;
	vec3 d3 = dx * dx + dy * dy; // d31, d32 and d33, squared
	// Sort out the two smallest distances (F1, F2)
	vec3 d1a = min(d1, d2);
	d2 = max(d1, d2); // Swap to keep candidates for F2
	d2 = min(d2, d3); // neither F1 nor F2 are now in d3
	d1 = min(d1a, d2); // F1 is now in d1
	d2 = max(d1a, d2); // Swap to keep candidates for F2
	d1.xy = (d1.x < d1.y) ? d1.xy : d1.yx; // Swap if smaller
	d1.xz = (d1.x < d1.z) ? d1.xz : d1.zx; // F1 is in d1.x
	d1.yz = min(d1.yz, d2.yz); // F2 is now not in d2.yz
	d1.y = min(d1.y, d1.z); // nor in  d1.z
	d1.y = min(d1.y, d2.x); // F2 is in d1.y, we're done.
	return sqrt(d1.xy);
}

//ported from Godot shader (shader_type canvas_item), gradient value noise + fbm
//gradient needs [-1,1] vectors, shash22 (random.frag) returns [0,1) so remap inline

float gradientNoise2d(vec2 uv) {
  vec2 iuv = floor(uv);
  vec2 fuv = fract(uv);
  vec2 blur = smoothstep(0.0, 1.0, fuv);
  return mix(mix(dot(2.0 * shash22(iuv + vec2(0.0, 0.0)) - 1.0, fuv - vec2(0.0, 0.0)),
                 dot(2.0 * shash22(iuv + vec2(1.0, 0.0)) - 1.0, fuv - vec2(1.0, 0.0)), blur.x),
             mix(dot(2.0 * shash22(iuv + vec2(0.0, 1.0)) - 1.0, fuv - vec2(0.0, 1.0)),
                 dot(2.0 * shash22(iuv + vec2(1.0, 1.0)) - 1.0, fuv - vec2(1.0, 1.0)), blur.x), blur.y) + 0.5;
}

float fbm2d(vec2 uv, int octaves, float ampStart, float ampCoeff, float freqCoeff) {
  float value = 0.0;
  float amplitude = ampStart;
  for (int i = 0; i < octaves; i++) {
    value += amplitude * gradientNoise2d(uv);
    uv *= freqCoeff;
    amplitude *= ampCoeff;
  }
  return value;
}

float fbm2d(vec2 uv, int octaves) {
  return fbm2d(uv, octaves, 0.5, 0.5, 2.0);
}
