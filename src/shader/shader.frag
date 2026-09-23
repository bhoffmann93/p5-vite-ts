#version 300 es
precision highp float;

uniform sampler2D uSketchTexture;
uniform vec2 uResolution;
uniform float uTime;
uniform float uFrame;

in vec2 vTexCoord;
out vec4 fragColor;

const float GRAIN_STRENGTH = 0.1;

const float VIGNETTE_INTENSITY = 0.75;
const float VIGNETTE_SOFTNESS = 0.4;
const float VIGNETTE_RADIUS = 0.6;

#include ./utils.glsl

void main() {
  vec2 uv = vTexCoord;

  vec2 tiles = vec2(50.0);
  vec2 index = floor(uv * tiles.xy);
  vec2 indexN = index.xy / tiles.xy; //[0.0,<1.0]

  vec2 offsetAmplitude = vec2(0.02, 0.005);
  vec2 waveFreq = vec2(10.0);

  vec2 gridUv = fract(uv * tiles.xy);
  vec2 textureUv = uv;
  textureUv.x -= sin(indexN.y * PI * waveFreq.x - uTime) * offsetAmplitude.x;
  textureUv.y -= sin(indexN.x * PI * waveFreq.y - uTime) * offsetAmplitude.y;
  vec2 noise = (hash22(gl_FragCoord.xy) - 0.5);
  textureUv -= noise * 0.01;

  vec3 color = texture(uSketchTexture, textureUv).rgb;

  color = filmGrain(color, GRAIN_STRENGTH, uFrame);
  color = vignette(color, uv, VIGNETTE_RADIUS, VIGNETTE_SOFTNESS, VIGNETTE_INTENSITY);

  //log value
  vec2 printUv = aspect01(vec2(uv.x, 1.0 - uv.y), uResolution);
  color = mix(color, vec3(1.0), printValueBottomLeft(printUv, uTime));

  fragColor = vec4(color, 1.0);
}
