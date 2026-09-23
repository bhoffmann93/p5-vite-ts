// Placing things along the outline of a letter.
//
// An outline is one closed loop of { x, y } points: one contour from p5's
// textToContours(), or from textToLetterContours() in letters.js.
//
//   placeAlongOutline(outline, spacing, offset)
//     spots every `spacing` pixels round the outline, starting `offset`
//     pixels along. Each spot is { x, y, angle }, so you can draw anything
//     there:
//
//       for (const spot of placeAlongOutline(outline, 40)) {
//         circle(spot.x, spot.y, 10);
//       }
//
//     Raise the offset over time and the shapes travel round the outline.
//     `angle` is the direction of the outline at that spot. Use it with
//     translate(spot.x, spot.y) and rotate(spot.angle), inside push() and
//     pop(), to turn a shape with the outline.
//
//   placeAtDistance(outline, distance)
//     one spot, `distance` pixels along the outline.
//
//   getOutlineLength(outline)
//     how long the outline is all the way round, in pixels.
//
// Distances are measured on the points as they are now, so if you moved them
// (with a wave, say) the spacing stays even on the moved outline.

export function placeAlongOutline(outline, spacing, offset = 0) {
  const distances = measureOutline(outline);
  const outlineLength = distances[distances.length - 1];

  //as many as fit at this spacing. The gap is then stretched a little, so
  //the last spot is as far from the first as all the others are apart.
  const count = floor(outlineLength / spacing);
  if (count === 0) return [];
  const gap = outlineLength / count;

  const spots = [];
  for (let index = 0; index < count; index++) {
    spots.push(spotAt(outline, distances, index * gap + offset));
  }
  return spots;
}

export function placeAtDistance(outline, distance) {
  return spotAt(outline, measureOutline(outline), distance);
}

export function getOutlineLength(outline) {
  const distances = measureOutline(outline);
  return distances[distances.length - 1];
}

// How far along the outline each point is, in pixels, starting at 0 for the
// first point. The last number is the distance all the way round and back to
// the start, which is the length of the outline.
function measureOutline(outline) {
  const distances = [0];
  for (let index = 1; index <= outline.length; index++) {
    const previous = outline[index - 1];
    const current = outline[index % outline.length];
    distances.push(distances[index - 1] + dist(previous.x, previous.y, current.x, current.y));
  }
  return distances;
}

// The spot `distance` pixels along the outline. It finds the two points the
// spot lies between, and lerp() finds the spot between them.
function spotAt(outline, distances, distance) {
  //going round and round: 1.5 times the length lands halfway round, and a
  //negative distance counts backwards from the start
  const outlineLength = distances[distances.length - 1];
  const distanceOnLoop = ((distance % outlineLength) + outlineLength) % outlineLength;

  let index = 0;
  while (distances[index + 1] < distanceOnLoop) index++;

  const current = outline[index];
  const next = outline[(index + 1) % outline.length];
  const stepLength = distances[index + 1] - distances[index];
  const between = stepLength > 0 ? (distanceOnLoop - distances[index]) / stepLength : 0;

  return {
    x: lerp(current.x, next.x, between),
    y: lerp(current.y, next.y, between),
    angle: atan2(next.y - current.y, next.x - current.x),
  };
}
