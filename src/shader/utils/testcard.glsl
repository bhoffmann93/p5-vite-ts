float sdLine(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

/** * Procedural Testcard by Bernhard Hoffmann (MIT)
 * Fully resolution-independent using screen-space derivatives (fwidth).
 * Features: Color bars, grey steps, crosshair, and circle for aspect ratio check.
 */
vec3 testCard(vec2 vUv, vec2 dimensions, float time) {
    vec2 uv = aspect01(vUv, dimensions);

    vec2 fw = fwidth(uv);
    float thicknessInPixel = 3.0;
    vec2 lineThickness = fw * thicknessInPixel * 0.5;
    float ratio = dimensions.x / dimensions.y;

    vec3 color = DARK_GREY;

    // Grid
    vec2 tileCount = vec2(12.0);
    vec2 tileSize = 1.0 / tileCount;
    vec2 gridLineThickness = tileCount * lineThickness * 0.5;
    vec2 gridUV = fract(uv * tileCount);

    float check = checkerboard(uv, tileCount);
    color = mix(color, GREY, check);

    vec2 dGrid = vec2(abs(gridUV.x - 0.5), abs(gridUV.y - 0.5));
    float fineGridLines = max((1.0 - aastep(gridLineThickness.x, dGrid.x)), (1.0 - aastep(gridLineThickness.y, dGrid.y)));
    color = mix(color, LIGHT_GREY, fineGridLines);

    float x = clamp((vUv.x - 0.25) / 0.5, 0.0, 1.0);
    float y = clamp((vUv.y - 0.25) / 0.5, 0.0, 1.0);

    // Color bars
    if (vUv.y < tileSize.y * 0.75 && vUv.x > 0.25 && vUv.x < 0.75) {
        float segment = floor(x * 8.0);

        vec3 barColor = BLACK;
        if (segment == 0.0)
            barColor = WHITE;
        else if (segment == 1.0)
            barColor = YELLOW;
        else if (segment == 2.0)
            barColor = CYAN;
        else if (segment == 3.0)
            barColor = GREEN;
        else if (segment == 4.0)
            barColor = MAGENTA;
        else if (segment == 5.0)
            barColor = RED;
        else if (segment == 6.0)
            barColor = BLUE;

        color = barColor;
    }

    // Grey gradient steps
    if (1.0 - vUv.y < tileSize.y * 0.75 && vUv.x > 0.25 && vUv.x < 0.75) {
        color = mix(BLACK, WHITE, floor(x * 8.0) / 7.0);
    }

    // Cross lines
    vec2 dCrossCenter = vec2(abs(uv.x - 0.5), abs(uv.y - 0.5));
    float crossCenterLines = (1.0 - aastep(lineThickness.x, dCrossCenter.x)) + (1.0 - aastep(lineThickness.y, dCrossCenter.y));
    color = mix(color, WHITE, crossCenterLines);

    float maxFWidthVUV = min(fwidth(vUv.x), fwidth(vUv.y));

    // Circle
    float radius = 0.425;
    float euclideanFwidth = length(vec2(fwidth(uv.x), fwidth(uv.y)));
    float dCircle = abs(length(uv - 0.5) - radius);
    float circleLine = 1.0 - aastep(euclideanFwidth * thicknessInPixel / 2.0, dCircle);
    color = mix(color, WHITE, circleLine);

    // Diagonal lines
    float dLineBLTR = sdLine(vUv, bottomLeft01, topRight01);
    float dLineTLBR = sdLine(vUv, topLeft01, bottomRight01);
    float cross = max(1.0 - aastep(maxFWidthVUV * thicknessInPixel, dLineBLTR), 1.0 - aastep(maxFWidthVUV * thicknessInPixel, dLineTLBR));
    color = mix(color, WHITE, cross);

    // Border lines
    float leftLine = 1.0 - aastep(fwidth(vUv.x) * thicknessInPixel, vUv.x);
    float rightLine = 1.0 - aastep(fwidth(vUv.x) * thicknessInPixel, 1.0 - vUv.x);
    float bottomLine = 1.0 - aastep(fwidth(vUv.y) * thicknessInPixel, vUv.y);
    float topLine = 1.0 - aastep(fwidth(vUv.y) * thicknessInPixel, 1.0 - vUv.y);

    color = mix(color, WHITE, max(leftLine, rightLine));
    color = mix(color, WHITE, max(bottomLine, topLine));

    // Grey gradient
    if (vUv.y > 0.25 && vUv.y < 0.75 && vUv.x > tileSize.x / 2.0 && vUv.x < tileSize.x * 1.5) {
        color = mix(BLACK, WHITE, y);
    }

    // RGB gradient
    if (vUv.y > 0.25 && vUv.y < 0.75 && vUv.x > 1.0 - tileSize.x * 1.5 && vUv.x < 1.0 - tileSize.x / 2.0) {
        color = 0.5 + 0.5 * cos((TAU * y - time) + vec3(0.0, 2.094, 4.188));
    }

    // Red corners
    float cornerSize = 1.0 / tileCount.y * 0.5;
    if (vUv.x < cornerSize && vUv.y < cornerSize * ratio)
        color = RED;
    if (vUv.x > 1.0 - cornerSize && vUv.y < cornerSize * ratio)
        color = RED;
    if (vUv.x < cornerSize && vUv.y > 1.0 - cornerSize * ratio)
        color = RED;
    if (vUv.x > 1.0 - cornerSize && vUv.y > 1.0 - cornerSize * ratio)
        color = RED;

    return color;
}
