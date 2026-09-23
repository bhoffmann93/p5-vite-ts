// GLSL Number Printing - @P_Malin
// Creative Commons CC0 1.0 Universal (CC-0)
// https://www.shadertoy.com/view/4sBSWW
//
// Renders a float as digits so a shader value can be read off the screen. Returns 1.0 on a lit
// texel of a glyph and 0.0 elsewhere, so the caller decides the colour.

float digitBin(const int x) {
    return x == 0 ? 480599.0 : x == 1 ? 139810.0 : x == 2 ? 476951.0 : x == 3 ? 476999.0 : x == 4 ? 350020.0 : x == 5 ? 464711.0 : x == 6 ? 464727.0 : x == 7 ? 476228.0 : x == 8 ? 481111.0 : x == 9 ? 481095.0 : 0.0;
}

float printValue(vec2 stringCoords, float value, float maxDigits, float decimalPlaces) {
    if ((stringCoords.y < 0.0) || (stringCoords.y >= 1.0)) return 0.0;

    bool isNegative = (value < 0.0);
    value += 1e-5; //precision workaround so even numbers print
    value = abs(value);

    float log10Value = log2(abs(value)) / log2(10.0);
    float biggestIndex = max(floor(log10Value), 0.0);
    float digitIndex = maxDigits - floor(stringCoords.x);
    float charBin = 0.0;
    if (digitIndex > (-decimalPlaces - 1.01)) {
        if (digitIndex > biggestIndex) {
            if ((isNegative) && (digitIndex < (biggestIndex + 1.5))) charBin = 1792.0;
        } else {
            if (digitIndex == -1.0) {
                if (decimalPlaces > 0.0) charBin = 2.0;
            } else {
                float reducedRangeValue = value;
                if (digitIndex < 0.0) {
                    reducedRangeValue = fract(value);
                    digitIndex += 1.0;
                }
                float digitValue = (abs(reducedRangeValue / (pow(10.0, digitIndex))));
                charBin = digitBin(int(floor(mod(digitValue, 10.0))));
            }
        }
    }
    return floor(mod((charBin / pow(2.0, floor(fract(stringCoords.x) * 4.0) + (floor(stringCoords.y * 5.0) * 4.0))), 2.0));
}

//for aspect01 uv
float printValueBottomLeft(vec2 uv, float value) {
    return printValue((uv + vec2(0.01, -0.01)) * 25.0, value, 3.0, 2.0);
}

//for aspect01 uv
float printValueBottomRight(vec2 uv, float value) {
    return printValue((uv + vec2(-0.7, -0.01)) * 25.0, value, 2.0, 2.0);
}

// Stacks values up the left edge, row 0 at the bottom, so several can be read at once.
float printValueRow(vec2 uv, float value, float row) {
    return printValue((uv + vec2(0.01, -0.01 - row * 0.05)) * 25.0, value, 3.0, 2.0);
}
