// Splits text into its outlines, using the font's own curves.
//
//   letter    one character, as a list of its contours. A space has none,
//             so spaces are left out.
//   contour   one closed outline. An "o" has two: the outside and the hole.
//   curve     one piece of a contour: a straight line, or a bend with one or
//             two control points. Shaped { from, controls: [...], to }.
//
// In Illustrator's words, `from` and `to` are anchor points and `controls`
// are the handles.
//
// Every point is a plain { x, y } you can change before drawing. A curve's
// `to` is the very same point as the next curve's `from`, so moving one end
// moves both, and the outline stays closed.
//
// textToCurves() hands back an array of letters, each an array of contours,
// each an array of curves. It is named after p5's textToPoints() and textToContours(), which give you
// points along the outline instead of the curves themselves.
//
// This is p5 version 2, which reads fonts with Typr.js. Code online that reads
// `font.font` and `glyph.getPath()` is for p5 version 1 and opentype.js, and
// will not work here.

import { groupByLetter } from './letters.js';

// How big the squares and circles of the handles are drawn, in pixels.
const HANDLE_DOT_SIZE = 6;

// The colors of the anchors and handles, so they stand out from the letter.
const anchorColor = { r: 255, g: 160, b: 0 };
const handleColor = { r: 0, g: 200, b: 255 };

// Reads the outlines of `str` as it would be drawn by text(str, x, y), using
// whatever textSize() and textAlign() are set right now.
export function textToCurves(font, str, x, y) {
  const contours = commandsToContours(font.textToPaths(str, x, y));
  return groupByLetter(font, str, contours);
}

// Turns p5's list of pen moves into contours of curves.
function commandsToContours(commands) {
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
      //closing draws the last stretch back to the start, if there is one.
      //If the pen is already there, the last curve ends on the start point
      //itself, so moving it moves both ends of the outline together.
      const lastCurve = contour[contour.length - 1];
      if (dist(pen.x, pen.y, start.x, start.y) > 0) {
        contour.push({ from: pen, controls: [], to: start });
      } else if (lastCurve) {
        lastCurve.to = start;
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

// Draws the letters from textToCurves() with the current fill() and stroke().
// Every outline goes into one shape as a contour, which is what cuts the
// holes out of letters like "o" and "A" when there is a fill.
//
// Pass { showHandles: true } to also draw the Bézier handles: a square on
// every anchor, a circle on every handle, and a line joining each handle to
// its anchor. Their colors are set at the top of this file.
export function drawCurves(letters, { showHandles = false } = {}) {
  const contours = letters.flat();

  beginShape();
  for (const contour of contours) {
    if (contour.length === 0) continue;

    beginContour();
    vertex(contour[0].from.x, contour[0].from.y);
    for (const curve of contour) {
      addCurveVertices(curve);
    }
    endContour(CLOSE);
  }
  endShape();

  if (showHandles) {
    for (const contour of contours) {
      for (const curve of contour) {
        drawHandles(curve);
      }
    }
  }
}

// Draws one piece of an outline as an open line with the current stroke().
export function drawCurve(curve, { showHandles = false } = {}) {
  beginShape();
  vertex(curve.from.x, curve.from.y);
  addCurveVertices(curve);
  endShape();

  if (showHandles) drawHandles(curve);
}

// The anchor and handles of one curve, in anchorColor and handleColor, with
// the current strokeWeight(). The start of the curve
// is pulled towards the first control point and the end towards the last,
// which is why the lines go from each end to its nearest control point.
export function drawHandles(curve) {
  push();
  noFill();
  rectMode(CENTER);

  stroke(anchorColor.r, anchorColor.g, anchorColor.b);
  square(curve.from.x, curve.from.y, HANDLE_DOT_SIZE);

  if (curve.controls.length > 0) {
    stroke(handleColor.r, handleColor.g, handleColor.b);
    const firstControl = curve.controls[0];
    const lastControl = curve.controls[curve.controls.length - 1];
    line(curve.from.x, curve.from.y, firstControl.x, firstControl.y);
    line(curve.to.x, curve.to.y, lastControl.x, lastControl.y);

    for (const control of curve.controls) {
      circle(control.x, control.y, HANDLE_DOT_SIZE);
    }
  }
  pop();
}

// Continues a shape that is already open. In p5 version 2 a bend is a run of
// bezierVertex() calls, and bezierOrder() says how many make up one bend:
// 2 for a quadratic curve, 3 for a cubic one.
function addCurveVertices(curve) {
  if (curve.controls.length === 0) {
    vertex(curve.to.x, curve.to.y);
    return;
  }

  bezierOrder(curve.controls.length + 1);
  for (const control of curve.controls) {
    bezierVertex(control.x, control.y);
  }
  bezierVertex(curve.to.x, curve.to.y);
}
