// START HERE.
//
// From a lerp to a cubic Bézier, one step at a time. Drag the points and the
// t slider. Change the step with the arrows under the title or the ← and →
// keys; space plays t.
//
// Two things to know:
//   setup()  runs once, at the start.
//   draw()   runs about 60 times a second, forever. Animation lives here.
//
// Note: this is p5 version 2. If you find a tutorial that uses `preload()`,
// it is written for p5 version 1 and will not work here. See the README.

import p5 from 'p5';
import { createGUI } from './lib/gui.js';
import { findPointAt } from './lib/drag.js';
import { applyFont, defaultFont, fontOptions, textToCurves } from './lib/font/index.js';
import { startingText, backgroundColor, foregroundColor } from './config.js';

// The values the control panel changes. The text and font are for the last
// step, the letter.
const params = {
  text: startingText,
  font: defaultFont,
  textSize: 500,
  foregroundColor,
  backgroundColor,
};

const STEPS = [
  { title: 'lerp | mix', pointCount: 2, lerpRounds: 1 },
  { title: 'Two lerps', pointCount: 3, lerpRounds: 1 },
  { title: 'Connect the lerps', pointCount: 3, lerpRounds: 2 },
  { title: 'Quadratic Bézier', pointCount: 3, lerpRounds: 2, showCurve: true },
  { title: 'Cubic Bézier', pointCount: 4, lerpRounds: 3, showCurve: true },
  { title: "p5's bezier()", pointCount: 4, lerpRounds: 3, showBezier: true },
  { title: 'A letter is made of Béziers', showLetter: true },
];

const POINT_NAMES = ['A', 'B', 'C', 'D'];

// the title, arrows, labels and play button, whatever font the letter uses
const UI_FONT = 'Inter-Medium';

const anchorColor = { r: 255, g: 160, b: 0 };
const controlPointColor = { r: 0, g: 200, b: 255 };
const lineColor = { r: 110, g: 110, b: 110 };

// one color per round of lerps: AB, then ABC, then ABCD
const roundColors = [
  { r: 120, g: 220, b: 120 },
  { r: 255, g: 90, b: 160 },
  { r: 255, g: 220, b: 60 },
];

const POINT_SIZE = 14;
const LETTER_POINT_SIZE = 7;
const GRAB_RADIUS = 20;
const TITLE_Y = 60;
const TITLE_SIZE = 40;
const NAVIGATION_Y = 105;
const LABEL_SIZE = 16;
const CODE_SIZE = 15;
const CODE_LINE_HEIGHT = 22;
const CODE_X = 40;
const CODE_Y = 170;
const LEGEND_Y = 130;
const SLIDER_BOTTOM = 70;
const KNOB_SIZE = 26;

// how far the ← and → under the title sit from the middle, in pixels
const ARROW_INNER = 30;
const ARROW_OUTER = 90;

// where the play button sits, measured left from the slider's start
const PLAY_INNER = 20;
const PLAY_OUTER = 90;

// how many straight pieces a curve is drawn with
const CURVE_RESOLUTION = 100;

// how long t takes from 0 to 1 when playing
const PLAY_SECONDS = 4;

let controlPoints = [];
let stepIndex = 0;
let t = 0.5;
let playing = false;
let draggedPoint = null;
let draggingSlider = false;
let currentFont = null;
let uiFont = null;

async function changeFont(url) {
  currentFont = await applyFont(url);
}

window.setup = async function setup() {
  createCanvas(windowWidth, windowHeight);

  //A, B, C and D, measured from the middle of the canvas
  controlPoints = [createVector(-300, 150), createVector(-150, -150), createVector(150, -150), createVector(300, 150)];

  //loading a font takes a moment, so we wait for it before drawing
  await changeFont(params.font);

  //falls back to the letter's font if Inter-Medium is not in the fonts folder
  const uiFontUrl = fontOptions[UI_FONT] || params.font;
  uiFont = await loadFont(uiFontUrl);
};

window.draw = function draw() {
  background(params.backgroundColor.r, params.backgroundColor.g, params.backgroundColor.b);
  if (playing) t = (t + deltaTime / 1000 / PLAY_SECONDS) % 1;

  const step = STEPS[stepIndex];

  push();
  translate(width / 2, height / 2);
  if (step.showLetter) {
    drawLetterStep();
  } else {
    drawLerpStep(step);
  }
  pop();

  drawTitle(step);
  drawLegend(step);
  drawCode(codeLines(step));
  drawSlider();
  updateCursor();
};

function drawLerpStep(step) {
  const points = controlPoints.slice(0, step.pointCount);
  const rounds = lerpRounds(points, t, step.lerpRounds);
  const names = roundNames(step.pointCount, step.lerpRounds);

  //the lines each round of lerps slides along
  for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex++) {
    const lineStroke = roundIndex === 0 ? lineColor : roundColors[roundIndex - 1];
    drawLines(rounds[roundIndex], lineStroke);
  }

  if (step.showCurve) {
    drawCurveUpTo(points, t, roundColors[step.lerpRounds - 1]);
  }

  if (step.showBezier) {
    const [A, B, C, D] = points;
    noFill();
    stroke(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
    strokeWeight(3);
    bezier(A.x, A.y, B.x, B.y, C.x, C.y, D.x, D.y);
  }

  points.forEach((position, index) => {
    const isAnchor = index === 0 || index === points.length - 1;
    drawDot(position, isAnchor ? anchorColor : controlPointColor, names[0][index]);
  });

  for (let roundIndex = 1; roundIndex < rounds.length; roundIndex++) {
    rounds[roundIndex].forEach((position, index) => {
      drawDot(position, roundColors[roundIndex - 1], names[roundIndex][index]);
    });
  }
}

// Every round of lerps, from the points down to fewer points:
// [[A, B, C, D], [AB, BC, CD], [ABC, BCD], [ABCD]]
function lerpRounds(points, amount, roundCount) {
  const rounds = [points];
  for (let roundIndex = 1; roundIndex <= roundCount; roundIndex++) {
    const previous = rounds[roundIndex - 1];
    const next = [];
    for (let index = 0; index < previous.length - 1; index++) {
      next.push(p5.Vector.lerp(previous[index], previous[index + 1], amount));
    }
    rounds.push(next);
  }
  return rounds;
}

// The names that go with lerpRounds(): [['A', 'B', 'C'], ['AB', 'BC'], ['ABC']]
function roundNames(pointCount, roundCount) {
  const names = [POINT_NAMES.slice(0, pointCount)];
  for (let roundIndex = 1; roundIndex <= roundCount; roundIndex++) {
    const previous = names[roundIndex - 1];
    const next = [];
    for (let index = 0; index < previous.length - 1; index++) {
      next.push(previous[index] + previous[index + 1].slice(-1));
    }
    names.push(next);
  }
  return names;
}

// Lerps until one point is left: the point on the curve at `amount`.
function pointOnCurve(points, amount) {
  const rounds = lerpRounds(points, amount, points.length - 1);
  return rounds[rounds.length - 1][0];
}

function drawCurveUpTo(points, endAmount, curveColor) {
  noFill();
  stroke(curveColor.r, curveColor.g, curveColor.b);
  strokeWeight(3);
  beginShape();
  for (let index = 0; index <= CURVE_RESOLUTION; index++) {
    const position = pointOnCurve(points, (index / CURVE_RESOLUTION) * endAmount);
    vertex(position.x, position.y);
  }
  endShape();
}

function drawLines(points, lineStroke, lineWeight = 2) {
  stroke(lineStroke.r, lineStroke.g, lineStroke.b);
  strokeWeight(lineWeight);
  for (let index = 0; index < points.length - 1; index++) {
    line(points[index].x, points[index].y, points[index + 1].x, points[index + 1].y);
  }
}

function drawDot(position, dotColor, label, dotSize = POINT_SIZE) {
  noStroke();
  fill(dotColor.r, dotColor.g, dotColor.b);
  circle(position.x, position.y, dotSize);
  if (!label) return;

  if (uiFont) textFont(uiFont);
  textAlign(LEFT, BOTTOM);
  textSize(LABEL_SIZE);
  text(label, position.x + POINT_SIZE, position.y - POINT_SIZE / 2);
}

function drawLetterStep() {
  if (!currentFont) return;

  textFont(currentFont);
  textAlign(CENTER, CENTER);
  textSize(params.textSize);
  const letters = textToCurves(currentFont, params.text, 0, 0);

  //every curve drawn like A, B, C and D in the steps before, only smaller:
  //its points, its lerps at t, and the curve up to t
  for (const curve of letters.flat(2)) {
    const points = [curve.from, ...curve.controls, curve.to].map((position) => createVector(position.x, position.y));
    const rounds = lerpRounds(points, t, points.length - 1);

    for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex++) {
      const lineStroke = roundIndex === 0 ? lineColor : roundColors[roundIndex - 1];
      drawLines(rounds[roundIndex], lineStroke, 1);
    }

    drawCurveUpTo(points, t, params.foregroundColor);

    points.forEach((position, index) => {
      const isAnchor = index === 0 || index === points.length - 1;
      drawDot(position, isAnchor ? anchorColor : controlPointColor, '', LETTER_POINT_SIZE);
    });

    for (let roundIndex = 1; roundIndex < rounds.length; roundIndex++) {
      for (const position of rounds[roundIndex]) {
        drawDot(position, roundColors[roundIndex - 1], '', LETTER_POINT_SIZE);
      }
    }
  }
}

function codeLines(step) {
  const lines = [{ code: `let t = ${nf(t, 1, 2)};`, color: params.foregroundColor, comment: ` // ${round(t * 100)}%` }];

  //the letter step shows no code, only which kind of curves the font uses
  if (step.showLetter) {
    return [{ code: curveCountLine(), color: lineColor }];
  }

  if (step.showBezier) {
    lines.push({ code: 'bezier(A.x, A.y, B.x, B.y,', color: params.foregroundColor });
    lines.push({ code: '       C.x, C.y, D.x, D.y);', color: params.foregroundColor });
    lines.push({ code: '// the same curve: p5 does the lerps for you', color: lineColor });
    return lines;
  }

  const names = roundNames(step.pointCount, step.lerpRounds);
  for (let roundIndex = 1; roundIndex < names.length; roundIndex++) {
    names[roundIndex].forEach((name, index) => {
      const from = names[roundIndex - 1][index];
      const to = names[roundIndex - 1][index + 1];
      lines.push({ code: `let ${name} = p5.Vector.lerp(${from}, ${to}, t);`, color: roundColors[roundIndex - 1] });
    });
  }
  return lines;
}

// How many of the letter's curves are straight, quadratic or cubic, going by
// their number of handles. TrueType fonts (.ttf) only have quadratic curves.
function curveCountLine() {
  if (!currentFont) return '';

  const counts = { straight: 0, quadratic: 0, cubic: 0 };
  const kinds = ['straight', 'quadratic', 'cubic'];
  for (const curve of textToCurves(currentFont, params.text, 0, 0).flat(2)) {
    counts[kinds[curve.controls.length]]++;
  }

  const fontName = Object.keys(fontOptions).find((name) => fontOptions[name] === params.font);
  return `${fontName}: ${counts.cubic} cubic, ${counts.quadratic} quadratic, ${counts.straight} straight`;
}

// Which dot is which, above the code. The curve starts and ends on anchor
// points; control points pull it towards them without it touching them.
function drawLegend(step) {
  const hasControlPoints = step.showLetter || step.pointCount > 2;
  const entries = [{ label: 'anchor point', dotColor: anchorColor }];
  if (hasControlPoints) entries.push({ label: 'control point', dotColor: controlPointColor });

  if (uiFont) textFont(uiFont);
  textSize(LABEL_SIZE);
  textAlign(LEFT, CENTER);

  let x = CODE_X;
  for (const entry of entries) {
    drawDot(createVector(x + POINT_SIZE / 2, LEGEND_Y), entry.dotColor, '');
    fill(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
    text(entry.label, x + POINT_SIZE * 1.5, LEGEND_Y);
    x += POINT_SIZE * 1.5 + textWidth(entry.label) + POINT_SIZE * 2;
  }
}

function drawCode(lines) {
  noStroke();
  textFont('monospace');
  textAlign(LEFT, TOP);
  textSize(CODE_SIZE);
  lines.forEach((codeLine, index) => {
    const y = CODE_Y + index * CODE_LINE_HEIGHT;
    fill(codeLine.color.r, codeLine.color.g, codeLine.color.b);
    text(codeLine.code, CODE_X, y);

    //a comment at the end of a line is grey, like the comment lines
    if (codeLine.comment) {
      fill(lineColor.r, lineColor.g, lineColor.b);
      text(codeLine.comment, CODE_X + textWidth(codeLine.code), y);
    }
  });
}

function drawTitle(step) {
  noStroke();
  fill(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
  if (uiFont) textFont(uiFont);
  textAlign(CENTER, CENTER);

  textSize(TITLE_SIZE);
  text(step.title, width / 2, TITLE_Y);

  textSize(LABEL_SIZE);
  text(`←     ${stepIndex + 1} / ${STEPS.length}     →`, width / 2, NAVIGATION_Y);
}

function isOverPrevious(x, y) {
  return abs(y - NAVIGATION_Y) < GRAB_RADIUS && x > width / 2 - ARROW_OUTER && x < width / 2 - ARROW_INNER;
}

function isOverNext(x, y) {
  return abs(y - NAVIGATION_Y) < GRAB_RADIUS && x > width / 2 + ARROW_INNER && x < width / 2 + ARROW_OUTER;
}

//a finished curve (t = 1) starts again at 0 in the next step, so it draws
//from the beginning; any other t stays, to compare the steps at the same t
function changeStep(direction) {
  const nextIndex = constrain(stepIndex + direction, 0, STEPS.length - 1);
  if (nextIndex === stepIndex) return;
  stepIndex = nextIndex;
  if (t === 1) t = 0;
}

//half the slider's length: 225 pixels, or less on a narrow window
function sliderHalfLength() {
  return min(225, width * 0.225);
}

function sliderLeft() {
  return width / 2 - sliderHalfLength();
}

function sliderRight() {
  return width / 2 + sliderHalfLength();
}

function sliderY() {
  return height - SLIDER_BOTTOM;
}

function drawSlider() {
  stroke(lineColor.r, lineColor.g, lineColor.b);
  strokeWeight(4);
  line(sliderLeft(), sliderY(), sliderRight(), sliderY());

  //the knob sits at t between the two ends: a lerp too
  const knobX = lerp(sliderLeft(), sliderRight(), t);
  noStroke();
  fill(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
  circle(knobX, sliderY(), KNOB_SIZE);

  if (uiFont) textFont(uiFont);
  textSize(LABEL_SIZE);
  textAlign(CENTER, BOTTOM);
  text(`t = ${nf(t, 1, 2)}`, knobX, sliderY() - KNOB_SIZE);

  textAlign(RIGHT, CENTER);
  text(playing ? 'pause' : 'play', sliderLeft() - PLAY_INNER, sliderY());
}

function isOverSlider(x, y) {
  return abs(y - sliderY()) < GRAB_RADIUS && x > sliderLeft() - GRAB_RADIUS && x < sliderRight() + GRAB_RADIUS;
}

function isOverPlay(x, y) {
  return abs(y - sliderY()) < GRAB_RADIUS && x > sliderLeft() - PLAY_OUTER && x < sliderLeft() - PLAY_INNER;
}

function setTFromMouse() {
  t = constrain(map(mouseX, sliderLeft(), sliderRight(), 0, 1), 0, 1);
}

// The point under the mouse, measured from the middle like the points are.
function controlPointUnderMouse() {
  const step = STEPS[stepIndex];
  if (step.showLetter) return null;
  const points = controlPoints.slice(0, step.pointCount);
  return findPointAt(points, mouseX - width / 2, mouseY - height / 2, GRAB_RADIUS);
}

window.mousePressed = function mousePressed(event) {
  //the control panel sits on top of the canvas, so clicks on it are ignored
  if (event.target.tagName !== 'CANVAS') return;

  if (isOverPrevious(mouseX, mouseY)) return changeStep(-1);
  if (isOverNext(mouseX, mouseY)) return changeStep(1);

  if (isOverPlay(mouseX, mouseY)) {
    playing = !playing;
    return;
  }

  if (isOverSlider(mouseX, mouseY)) {
    draggingSlider = true;
    playing = false;
    setTFromMouse();
    return;
  }

  draggedPoint = controlPointUnderMouse();
};

window.mouseDragged = function mouseDragged() {
  if (draggingSlider) setTFromMouse();
  if (draggedPoint) draggedPoint.set(mouseX - width / 2, mouseY - height / 2);
};

window.mouseReleased = function mouseReleased() {
  draggingSlider = false;
  draggedPoint = null;
};

function updateCursor() {
  const overSomething =
    draggedPoint ||
    draggingSlider ||
    controlPointUnderMouse() ||
    isOverSlider(mouseX, mouseY) ||
    isOverPlay(mouseX, mouseY) ||
    isOverPrevious(mouseX, mouseY) ||
    isOverNext(mouseX, mouseY);
  cursor(overSomething ? HAND : ARROW);
}

window.keyPressed = function keyPressed(event) {
  //typing in the panel's text field should not change the step
  if (event.target.tagName === 'INPUT') return;

  if (keyCode === LEFT_ARROW) changeStep(-1);
  if (keyCode === RIGHT_ARROW) changeStep(1);
  if (key === ' ') playing = !playing;
};

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

// Builds the control panel, then starts p5. p5 looks for the setup() and
// draw() you defined above and runs them.
createGUI({ params, onFontChange: changeFont });
new p5();
