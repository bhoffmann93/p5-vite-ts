vec3 filmGrain(vec3 color, float strength, float time) {
    float noise = hash13(vec3(gl_FragCoord.xy, time)) - 0.5;
    return blendScreen(color, vec3(noise) * strength);
}

vec3 vignette(vec3 color, vec2 uv, float radius, float softness, float intensity) {
    float dist = length(uv - 0.5);
    float vignette = smoothstep(radius - softness / 2.0, radius + softness / 2.0, dist);
    return mix(color, vec3(0.0), clamp(vignette * intensity, 0.0, 1.0));
}
