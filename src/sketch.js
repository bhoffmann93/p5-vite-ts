// START HERE.
//
// This is where your sketch lives. You will also end up in src/lib/gui.js,
// because that is where the controls are built, and every tool needs
// controls. Nothing in this project is off limits.
//
// Two things to know:
//   setup()  runs once, at the start.
//   draw()   runs about 60 times a second, forever. Animation lives here.
//
// Note: this is p5 version 2. If you find a tutorial that uses `preload()`,
// it is written for p5 version 1 and will not work here. See the README.

import p5 from 'p5';
import { createGUI } from './lib/gui.js';
import { applyFont, defaultFont } from './lib/font/fonts.js';
import { Easings } from './lib/easings.js';
import { textToCurves, drawCurves } from './lib/font/curves.js';
import { startingText, backgroundColor, foregroundColor } from './config.js';

// The values the control panel changes. Add your own here, then add a line
// in src/lib/gui.js to give it a slider or a checkbox.
//
// The colors start at whatever you set in src/config.js, and are { r, g, b }
// objects, each channel a number from 0 to 255.
const params = {
  text: startingText,
  font: defaultFont,
  textSize: 500,
  foregroundColor,
  backgroundColor,
  animate: false,
  showCurves: true,
  showHandles: true,
  anchorWobble: 0,
  handleWobble: 0,
  points: 'none',
  sampleFactor: 0.1,
};

// The font currently in use. Taking letters apart needs the font itself, not
// just its name, so we keep hold of it here.
let currentFont = null;

async function changeFont(url) {
  currentFont = await applyFont(url);
}

window.setup = async function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  //loading a font takes a moment, so we wait for it before drawing
  await changeFont(params.font);
};

window.draw = function draw() {
  background(params.backgroundColor.r, params.backgroundColor.g, params.backgroundColor.b);

  fill(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
  noStroke();

  // An easing in use. Delete this block if you want the letter to hold still.
  const timeInSeconds = millis() / 1000;

  const biggestTextSize = params.textSize;
  const smallestTextSize = params.textSize * 0.5;

  //counts 0 to 1 over two seconds, then starts again at 0
  const LOOP_SECONDS = 2;
  const timeLoop01 = (timeInSeconds / LOOP_SECONDS) % 1;

  const timePingPong = 1 - abs(timeLoop01 * 2 - 1);

  //the easing decides how the size travels between smallest and biggest
  const timeEased = Easings.backInOut(timePingPong);

  //try swapping cubicInOut above for bounceOut or elasticOut
  const sizeText = lerp(smallestTextSize, biggestTextSize, timeEased);

  //with animation off the letter holds still at the size from the panel
  textSize(params.animate ? sizeText : params.textSize);

  if (params.showCurves && currentFont) {
    drawLetterCurves();
  } else {
    text(params.text, width / 2, height / 2);
  }

  if (params.points !== 'none' && currentFont) {
    drawPoints();
  }
};

// A way to see the curves the letters are built from: only the line around
// every edge, in the type color, with nothing filled in.
function drawLetterCurves() {
  const contours = textToCurves(currentFont, params.text, width / 2, height / 2);

  //every anchor and handle is a plain { x, y }, so it can be moved before
  //drawing. The wobble sliders say how far, in pixels.
  const timeInSeconds = millis() / 1000;

  //anchors first. Like in Illustrator, an anchor's handles travel with it,
  //so the curve stays smooth. Each anchor is the end (`to`) of one curve and
  //the start of the next, so moving every curve's end moves every anchor once.
  for (const contour of contours) {
    contour.forEach((curve, curveIndex) => {
      const nextCurve = contour[(curveIndex + 1) % contour.length];
      const drift = noiseDrift(curve.to, params.anchorWobble, timeInSeconds);

      const handleBefore = curve.controls[curve.controls.length - 1];
      const handleAfter = nextCurve.controls[0];
      for (const movingPoint of [curve.to, handleBefore, handleAfter]) {
        if (!movingPoint) continue;
        movingPoint.x += drift.x;
        movingPoint.y += drift.y;
      }
    });
  }

  //then the handles on their own
  for (const contour of contours) {
    for (const curve of contour) {
      for (const handle of curve.controls) {
        const drift = noiseDrift(handle, params.handleWobble, timeInSeconds + NOISE_OFFSET_FOR_HANDLES);
        handle.x += drift.x;
        handle.y += drift.y;
      }
    }
  }

  noFill();
  stroke(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
  strokeWeight(1);
  drawCurves(contours, { showHandles: params.showHandles });
}

// How far apart two points must be before they drift differently. Smaller
// means neighbouring points move more alike.
const NOISE_SCALE = 0.01;

// Reading the noise a long way further along for y, so a point does not
// always move along the diagonal, and again for handles, so they do not
// drift in step with the anchors.
const NOISE_OFFSET_FOR_Y = 100;
const NOISE_OFFSET_FOR_HANDLES = 1000;

// How far a point drifts this frame: a smooth noise() value for x and for y,
// each mapped to between -amount and +amount pixels.
function noiseDrift(position, amount, time) {
  const noiseX = position.x * NOISE_SCALE;
  const noiseY = position.y * NOISE_SCALE;
  const driftX = noise(noiseX, noiseY, time);
  const driftY = noise(noiseX, noiseY, time + NOISE_OFFSET_FOR_Y);
  return {
    x: map(driftX, 0, 1, -amount, amount),
    y: map(driftY, 0, 1, -amount, amount),
  };
}

// Two ways p5 can place points along the edge of your letters.
//
// Most letters are drawn from more than one closed outline. An "A" has two:
// the outside edge, and the edge of the triangular hole (the counter). Each
// closed outline is called a contour. "B" has three, "L" has one.
//
// textToPoints() gives you all the points in one pile. You cannot tell which
// outline a point belongs to, so every point here is red.
//
// textToContours() gives you the same points, but sorted: one group per
// outline. To show the groups, the outlines take turns being red and blue.
// On an "A" the outside is red and the counter is blue. The blue is our
// choice, not p5's; it only makes the groups visible.
//
// Use textToContours() when it matters which outline a point is on, for
// example to color the counters differently or move something round the
// outside only.
//
// The loops say `textPoint`, not `point`, because point() is a p5 function.
const POINT_SIZE = 6;
const redPointColor = { r: 255, g: 60, b: 60 };
const bluePointColor = { r: 60, g: 120, b: 255 };

function drawPoints() {
  const options = { sampleFactor: params.sampleFactor };
  noStroke();

  if (params.points === 'textToPoints') {
    const textPoints = currentFont.textToPoints(params.text, width / 2, height / 2, options);
    fill(redPointColor.r, redPointColor.g, redPointColor.b);
    for (const textPoint of textPoints) {
      circle(textPoint.x, textPoint.y, POINT_SIZE);
    }
  }

  if (params.points === 'textToContours') {
    const contours = currentFont.textToContours(params.text, width / 2, height / 2, options);
    contours.forEach((contour, contourIndex) => {
      const pointColor = contourIndex % 2 === 0 ? redPointColor : bluePointColor;
      fill(pointColor.r, pointColor.g, pointColor.b);
      for (const textPoint of contour) {
        circle(textPoint.x, textPoint.y, POINT_SIZE);
      }
    });
  }
}

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

// Builds the control panel, then starts p5. p5 looks for the setup() and
// draw() you defined above and runs them.
createGUI({ params, onFontChange: changeFont });
new p5();
