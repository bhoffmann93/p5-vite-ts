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

const vec2 WAVE_AMPLITUDE = vec2(0.02, 0.005);
const vec2 WAVE_FREQUENCY = vec2(8.0, 8.0);

#include ./utils.glsl

void main() {
  vec2 uv = vTexCoord;
  vec2 textureUv = uv;

  //wave distort
  textureUv.x -= sin(uv.y * PI * WAVE_FREQUENCY.x - uTime) * WAVE_AMPLITUDE.x;
  textureUv.y -= sin(uv.x * PI * WAVE_FREQUENCY.y - uTime) * WAVE_AMPLITUDE.y;

  //grid distort: swap it in for the wave above. The wave then steps from
  //tile to tile instead of flowing.
  // vec2 tiles = vec2(50.0);
  // vec2 tileIndexN = floor(uv * tiles) / tiles; //[0.0,<1.0]
  // textureUv.x -= sin(tileIndexN.y * PI * WAVE_FREQUENCY.x - uTime) * WAVE_AMPLITUDE.x;
  // textureUv.y -= sin(tileIndexN.x * PI * WAVE_FREQUENCY.y - uTime) * WAVE_AMPLITUDE.y;

  vec3 color = texture(uSketchTexture, textureUv).rgb;

  color = filmGrain(color, GRAIN_STRENGTH, uFrame);
  color = vignette(color, uv, VIGNETTE_RADIUS, VIGNETTE_SOFTNESS, VIGNETTE_INTENSITY);

  //shows uTime on screen; print any value to check it
  vec2 printUv = aspect01(vec2(uv.x, 1.0 - uv.y), uResolution);
  color = mix(color, vec3(1.0), printValueBottomLeft(printUv, uTime));

  fragColor = vec4(color, 1.0);
}
