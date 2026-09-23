float flicker(float time, float speed, float threshold) {
    return step(threshold, hash11(floor(time * speed)));
}

vec3 filmGrain(vec3 color, float strength, float time) {
    float noise = hash13(vec3(gl_FragCoord.xy, time)) - 0.5;
    // float noise = hash12(gl_FragCoord.xy + fract(time)) - 0.5;
    return blendScreen(color, vec3(noise) * strength);
}

vec3 filmGrainWeighted(vec3 color, float strength, float seed) {
    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));

    float noise = hash13(vec3(gl_FragCoord.xy, seed)) - 0.5;
    // return blendScreen(color, vec3(noise) * strength);
    return color + (noise * luminance);
}

//threejs post fx film grain
vec3 shimmerGrain(vec3 base, vec2 uv, float time, float intensity) {
    float noise = hash12(fract(uv + time));
    //more visible in highlights and lift
    vec3 noisyColor = base + base * clamp(0.1 + noise, 0.0, 1.0);
    return mix(base, noisyColor, intensity);
}

vec3 vignette(vec3 color, vec2 uv, float radius, float softness, float intensity) {
    float dist = length(uv - 0.5);
    float vignette = smoothstep(radius - softness / 2.0, radius + softness / 2.0, dist);
    return mix(color, vec3(0.0), clamp(vignette * intensity, 0.0, 1.0));
}

vec3 vignette(vec3 color, vec2 uv, float intensity) {
    float softness = 0.4;
    float radius = 0.6;
    return vignette(color, uv, softness, radius, intensity);
}

vec2 kaleidoscope(vec2 uv, float segments) {
    uv = uv * 2.0 - 1.0;
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    float slice = TAU / segments;
    angle = mod(angle, slice);
    angle = abs(angle - slice * 0.5);
    uv = vec2(cos(angle), sin(angle)) * radius;
    return uv * 0.5 + 0.5;
}

//https://www.shadertoy.com/view/3dd3Wr
//  smartDeNoise - parameters
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//  sampler2D tex     - sampler image / texture
//  vec2 uv           - actual fragment coord
//  float sigma  >  0 - sigma Standard Deviation
//  float kSigma >= 0 - sigma coefficient
//      kSigma * sigma  -->  radius of the circular kernel
//  float threshold   - edge sharpening threshold
vec4 smartDeNoise(sampler2D tex, vec2 uv, float sigma, float kSigma, float threshold) {
    float radius = round(kSigma * sigma);
    float radQ = radius * radius;

    float invSigmaQx2 = .5 / (sigma * sigma); // 1.0 / (sigma^2 * 2.0)
    float invSigmaQx2PI = INV_PI * invSigmaQx2; // 1.0 / (sqrt(PI) * sigma)

    float invThresholdSqx2 = .5 / (threshold * threshold); // 1.0 / (sigma^2 * 2.0)
    float invThresholdSqrt2PI = INV_SQRT_OF_2PI / threshold; // 1.0 / (sqrt(2*PI) * sigma)

    vec4 centrPx = texture(tex, uv);

    float zBuff = 0.0;
    vec4 aBuff = vec4(0.0);
    vec2 size = vec2(textureSize(tex, 0));

    for (float x = -radius; x <= radius; x++) {
        float pt = sqrt(radQ - x * x); // pt = yRadius: have circular trend
        for (float y = -pt; y <= pt; y++) {
            vec2 d = vec2(x, y);

            float blurFactor = exp(-dot(d, d) * invSigmaQx2) * invSigmaQx2PI;

            vec4 walkPx = texture(tex, uv + d / size);

            vec4 dC = walkPx - centrPx;
            float deltaFactor = exp(-dot(dC, dC) * invThresholdSqx2) * invThresholdSqrt2PI * blurFactor;

            zBuff += deltaFactor;
            aBuff += deltaFactor * walkPx;
        }
    }
    return aBuff / zBuff;
}

float smartDeNoiseFloat(sampler2D tex, vec2 uv, float sigma, float kSigma, float threshold) {
    float radius = round(kSigma * sigma);
    float radQ = radius * radius;

    float invSigmaQx2 = 0.5 / (sigma * sigma);
    float invSigmaQx2PI = INV_PI * invSigmaQx2;

    float invThresholdSqx2 = 0.5 / (threshold * threshold);
    float invThresholdSqrt2PI = INV_SQRT_OF_2PI / threshold;

    // Wir lesen nur den gewünschten Kanal (hier .a für Fog)
    float centrVal = texture(tex, uv).a;

    float zBuff = 0.0;
    float aBuff = 0.0;
    vec2 size = vec2(textureSize(tex, 0));

    for (float x = -radius; x <= radius; x++) {
        float pt = sqrt(radQ - x * x);
        for (float y = -pt; y <= pt; y++) {
            vec2 d = vec2(x, y);

            float blurFactor = exp(-dot(d, d) * invSigmaQx2) * invSigmaQx2PI;

            float walkVal = texture(tex, uv + d / size).a;

            // Die Differenzberechnung erfolgt nun nur zwischen Floats
            float dC = walkVal - centrVal;
            float deltaFactor = exp(-(dC * dC) * invThresholdSqx2) * invThresholdSqrt2PI * blurFactor;

            zBuff += deltaFactor;
            aBuff += deltaFactor * walkVal;
        }
    }

    return (zBuff > 0.0) ? (aBuff / zBuff) : centrVal;
}

//note: input [0;1]
vec3 spectrum_offset_rgb(float t) {
    //note: optimisation from https://twitter.com/Stubbesaurus/status/818847844790575104
    //t = 3.0 * t - 0.5;
    //vec3 ret = clamp( vec3(1.0-t, 1.0-abs(t-1.0), t-1.0), 0.0, 1.0);
    float t0 = 3.0 * t - 1.5;
    vec3 ret = clamp(vec3(-t0, 1.0 - abs(t0), t0), 0.0, 1.0);

    //note: old crappy code
    //vec3 ret;
    //float lo = step(t,0.5);
    //float hi = 1.0-lo;
    //float w = linterp( remap( t, 1.0/6.0, 5.0/6.0 ) );
    //ret = vec3(lo,1.0,hi) * vec3(1.0-w, w, 1.0-w);

    //ret = pow( ret, vec3(1.0/2.2) );
    //ret = smoothstep( vec3(0.0), vec3(1.0), ret );
    return ret;
}

//note: from https://www.shadertoy.com/view/XslGz8
vec2 radialdistort(vec2 coord, vec2 amt) {
    vec2 cc = coord - 0.5;
    return coord + 2.0 * cc * amt;
}

// Given a vec2 in [-1,+1], generate a texture coord in [0,+1]
vec2 barrelDistortion(vec2 p, vec2 amt) {
    p = 2.0 * p - 1.0;

    /*
                                        const float maxBarrelPower = 5.0;
                                    	//note: http://glsl.heroku.com/e#3290.7 , copied from Little Grasshopper
                                        float theta  = atan(p.y, p.x);
                                        vec2 radius = vec2( length(p) );
                                        radius = pow(radius, 1.0 + maxBarrelPower * amt);
                                        p.x = radius.x * cos(theta);
                                        p.y = radius.y * sin(theta);

                                    	/*/
    // much faster version
    //const float maxBarrelPower = 5.0;
    //float radius = length(p);
    float maxBarrelPower = sqrt(5.0);
    float radius = dot(p, p); //faster but doesn't match above accurately
    p *= pow(vec2(radius), maxBarrelPower * amt);
    /* */

    return p * 0.5 + 0.5;
}

//note: from https://www.shadertoy.com/view/MlSXR3
vec2 brownConradyDistortion(vec2 uv, float dist) {
    uv = uv * 2.0 - 1.0;

    // positive values of K1 give barrel distortion, negative give pincushion
    float barrelDistortion1 = 0.1 * dist; // K1 in text books
    float barrelDistortion2 = -0.025 * dist; // K2 in text books

    float r2 = dot(uv, uv);
    uv *= 1.0 + barrelDistortion1 * r2 + barrelDistortion2 * r2 * r2;
    //uv *= 1.0 + barrelDistortion1 * r2;

    // tangential distortion (due to off center lens elements)
    // is not modeled in this function, but if it was, the terms would go here
    return uv * 0.5 + 0.5;
}

vec2 distort(vec2 uv, float t, vec2 min_distort, vec2 max_distort) {
    vec2 dist = mix(min_distort, max_distort, t);
    //return radialdistort( uv, 2.0 * dist );
    //return barrelDistortion( uv, 1.75 * dist ); //distortion at center
    return brownConradyDistortion(uv, 75.0 * dist.x);
}

//INSIDE
//https://www.shadertoy.com/view/XssGz8
vec3 chromaticAberration(sampler2D tex, vec2 uv, vec2 resolution, float intensity) {
    const float MAX_DIST_PX = 15.0; // Max spread in pixels
    float max_distort_px = MAX_DIST_PX * intensity;

    vec2 max_distort = vec2(max_distort_px) / resolution;
    vec2 min_distort = 0.5 * max_distort; //0-1 small value more spread effect

    // Calculate overshoot to scale up image slightly (prevents black borders)
    vec2 oversiz = distort(vec2(1.0), 1.0, min_distort, max_distort);
    vec2 uvC = inverseLerpClamped(1.0 - oversiz, oversiz, uv);

    //radial blur + spectral offset
    const int num_iter = 6;
    const float stepsiz = 1.0 / (float(num_iter) - 1.0);

    // Random jitter (dither) to avoid banding bands
    // We use gl_FragCoord for noise seed, assuming uTime is global
    float rnd = hash12(gl_FragCoord.xy + uTime);
    float t = rnd * stepsiz;

    vec3 sumcol = vec3(0.0);
    vec3 sumw = vec3(0.0);

    for (int i = 0; i < num_iter; ++i) {
        vec3 w = spectrum_offset_rgb(t);
        sumw += w;
        vec2 uvd = distort(uvC, t, min_distort, max_distort);
        sumcol += w * texture(tex, uvd).rgb;
        t += stepsiz;
    }

    return sumcol / sumw;
}
