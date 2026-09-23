// Robert Penner GLSL Easing Functions
// https://easings.net/

float quadraticIn(float t) {
    return t * t;
}

float quadraticOut(float t) {
    return -t * (t - 2.0);
}

float quadraticInOut(float t) {
    return t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t;
}

float cubicIn(float t) {
    return t * t * t;
}

float cubicOut(float t) {
    float f = t - 1.0;
    return f * f * f + 1.0;
}

float cubicInOut(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 0.5 * (pow(2.0 * t - 2.0, 3.0) + 2.0);
}

float quarticIn(float t) {
    return t * t * t * t;
}

float quarticOut(float t) {
    float f = t - 1.0;
    return 1.0 - f * f * f * f;
}

float quarticInOut(float t) {
    return t < 0.5 ? 8.0 * t * t * t * t : 1.0 - 8.0 * pow(t - 1.0, 4.0);
}

float quinticIn(float t) {
    return t * t * t * t * t;
}

float quinticOut(float t) {
    float f = t - 1.0;
    return f * f * f * f * f + 1.0;
}

float quinticInOut(float t) {
    return t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 + 16.0 * pow(t - 1.0, 5.0);
}

float sineIn(float t) {
    return 1.0 - cos(t * HALF_PI);
}

float sineOut(float t) {
    return sin(t * HALF_PI);
}

float sineInOut(float t) {
    return -0.5 * (cos(PI * t) - 1.0);
}

float circularIn(float t) {
    return 1.0 - sqrt(1.0 - t * t);
}

float circularOut(float t) {
    return sqrt((2.0 - t) * t);
}

float circularInOut(float t) {
    return t < 0.5 ? 0.5 * (1.0 - sqrt(1.0 - 4.0 * t * t)) : 0.5 * (sqrt(-((2.0 * t - 3.0) * (2.0 * t - 1.0))) + 1.0);
}

float exponentialIn(float t) {
    return t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));
}

float exponentialOut(float t) {
    return t == 1.0 ? t : 1.0 - pow(2.0, -10.0 * t);
}

float exponentialInOut(float t) {
    if (t == 0.0 || t == 1.0)
        return t;
    if (t < 0.5)
        return 0.5 * pow(2.0, (20.0 * t) - 10.0);
    return 0.5 * (2.0 - pow(2.0, -10.0 * (2.0 * t - 1.0)));
}

float backIn(float t) {
    const float s = 1.70158;
    return t * t * ((s + 1.0) * t - s);
}

float backOut(float t) {
    const float s = 1.70158;
    float f = t - 1.0;
    return f * f * ((s + 1.0) * f + s) + 1.0;
}

float backInOut(float t) {
    const float s = 1.70158 * 1.525;
    if (t < 0.5) {
        float f = 2.0 * t;
        return 0.5 * (f * f * ((s + 1.0) * f - s));
    } else {
        float f = 2.0 * t - 2.0;
        return 0.5 * (f * f * ((s + 1.0) * f + s) + 2.0);
    }
}

float elasticIn(float t) {
    return sin(13.0 * HALF_PI * t) * pow(2.0, 10.0 * (t - 1.0));
}

float elasticOut(float t) {
    return sin(-13.0 * HALF_PI * (t + 1.0)) * pow(2.0, -10.0 * t) + 1.0;
}

float elasticInOut(float t) {
    return t < 0.5 ? 0.5 * sin(13.0 * HALF_PI * (2.0 * t)) * pow(2.0, 10.0 * (2.0 * t - 1.0)) : 0.5 * (sin(-13.0 * HALF_PI * ((2.0 * t - 1.0) + 1.0)) * pow(2.0, -10.0 * (2.0 * t - 1.0)) + 2.0);
}

float bounceOut(float t) {
    const float a = 4.0 / 11.0;
    const float b = 8.0 / 11.0;
    const float c = 9.0 / 10.0;
    const float ca = 4356.0 / 361.0;
    const float cb = 35442.0 / 1805.0;
    const float cc = 16061.0 / 1805.0;

    if (t < a)
        return 7.5625 * t * t;
    if (t < b)
        return 9.075 * t * t - 9.9 * t + 3.4;
    if (t < c)
        return ca * t * t - cb * t + cc;
    return 10.8 * t * t - 20.52 * t + 10.72;
}

float bounceIn(float t) {
    return 1.0 - bounceOut(1.0 - t);
}

float bounceInOut(float t) {
    return t < 0.5 ? 0.5 * (1.0 - bounceOut(1.0 - 2.0 * t)) : 0.5 * bounceOut(2.0 * t - 1.0) + 0.5;
}
