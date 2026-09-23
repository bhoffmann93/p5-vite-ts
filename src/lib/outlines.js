// Splits text into its outlines, using the font's own curves.
//
//   contour   one closed outline. An "o" has two: the outside and the hole.
//   segment   one piece of a contour: a line, or a curve with one or two
//             control points. Shaped { from, controls: [...], to }.
//
// This is p5 version 2. Code online that reads `font.font` and
// `glyph.getPath()` is for p5 version 1 and will not work here.

// Reads the outlines of `str` as it would be drawn by text(str, x, y), using
// whatever textSize() and textAlign() are set right now.
export function getContours(font, str, x, y) {
  const commands = font.textToPaths(str, x, y);

  const contours = [];
  let contour = [];
  let start = null;
  let pen = null;

  for (const [type, ...numbers] of commands) {
    if (type === 'M') {
      //a move means the previous outline is finished and a new one begins
      if (contour.length > 0) contours.push(contour);
      contour = [];
      start = { x: numbers[0], y: numbers[1] };
      pen = start;
    } else if (type === 'Z') {
      //closing draws the last stretch back to the start, if there is one
      if (dist(pen.x, pen.y, start.x, start.y) > 0) {
        contour.push({ from: pen, controls: [], to: start });
      }
      contours.push(contour);
      contour = [];
      pen = start;
    } else {
      //the last two numbers are always where the pen ends up; any before
      //them are control points, in pairs
      const points = [];
      for (let index = 0; index < numbers.length; index += 2) {
        points.push({ x: numbers[index], y: numbers[index + 1] });
      }
      const to = points.pop();
      contour.push({ from: pen, controls: points, to });
      pen = to;
    }
  }

  if (contour.length > 0) contours.push(contour);
  return contours;
}

// Draws the whole text with the current fill() and stroke(). Every outline
// goes into one shape as a contour, which is what cuts the holes out of
// letters like "o" and "A" when there is a fill.
export function drawContours(contours) {
  beginShape();
  for (const contour of contours) {
    if (contour.length === 0) continue;

    beginContour();
    vertex(contour[0].from.x, contour[0].from.y);
    for (const segment of contour) {
      addSegmentVertices(segment);
    }
    endContour(CLOSE);
  }
  endShape();
}

// Draws one piece of an outline as an open line with the current stroke().
export function drawSegment(segment) {
  beginShape();
  vertex(segment.from.x, segment.from.y);
  addSegmentVertices(segment);
  endShape();
}

// Continues a shape that is already open. In p5 version 2 a curve is a run of
// bezierVertex() calls, and bezierOrder() says how many make up one curve:
// 2 for a quadratic curve, 3 for a cubic one.
function addSegmentVertices(segment) {
  if (segment.controls.length === 0) {
    vertex(segment.to.x, segment.to.y);
    return;
  }

  bezierOrder(segment.controls.length + 1);
  for (const control of segment.controls) {
    bezierVertex(control.x, control.y);
  }
  bezierVertex(segment.to.x, segment.to.y);
}
