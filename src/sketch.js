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
// The font tools (curves, points by letter, shapes along an outline) live in
// src/lib/font/. Each file there starts with how to use it.
//
// Note: this is p5 version 2. If you find a tutorial that uses `preload()`,
// it is written for p5 version 1 and will not work here. See the README.

import p5 from 'p5';
import { createGUI } from './lib/gui.js';
import { Easings } from './lib/easings.js';
import {
  applyFont,
  defaultFont,
  textToCurves,
  drawCurves,
  textToLetterContours,
  getCenter,
  placeAlongOutline,
} from './lib/font/index.js';
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
  sampleFrom: 'curves',
  fillLetters: false,
  showHandles: true,
  waveAmplitude: 0,
  waveFrequency: 3,
  handleWobble: 0,
  sampleFactor: 0.1,
  showOutlineShapes: false,
  outlineShapeSize: 80,
  outlineShapeSpacing: 20,
  outlineShapeSpeed: 80,
};

// Values the panel does not change. Tweak them here.

// The animation: the letters grow and shrink over this many seconds.
const LOOP_SECONDS = 2;

// How fast the wave travels round the letter, in radians per second.
const WAVE_SPEED = 2;

// How far apart two handles must be before they drift differently. Smaller
// means neighbouring handles move more alike.
const NOISE_SCALE = 0.01;

// Reading the noise a long way further along for y, so a handle does not
// always move along the diagonal.
const NOISE_OFFSET_FOR_Y = 100;

// How big the points are drawn, in pixels, and their colors.
const POINT_SIZE = 6;
const redPointColor = { r: 255, g: 60, b: 60 };
const bluePointColor = { r: 60, g: 120, b: 255 };

// Curves have no points of their own, so for them the outline shapes sample
// the outline this finely. The p5 options share the points you see instead.
const OUTLINE_SHAPE_SAMPLE_FACTOR = 0.3;

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
  const timeInSeconds = millis() / 1000;

  //everything is drawn around the middle of the canvas: translate() moves
  //the point 0, 0 there, so the letters sit at 0, 0 from here on
  translate(width / 2, height / 2);
  textSize(params.textSize);

  //an easing in use: the letters grow and shrink. scale() zooms the whole
  //drawing around 0, 0, which is the middle of the canvas.
  if (params.animate) {
    //counts 0 to 1 over LOOP_SECONDS, then starts again at 0
    const timeLoop01 = (timeInSeconds / LOOP_SECONDS) % 1;
    const timePingPong = 1 - abs(timeLoop01 * 2 - 1);

    //the easing decides how the size travels between half and full size.
    //Try swapping backInOut for bounceOut or elasticOut.
    const timeEased = Easings.backInOut(timePingPong);
    scale(lerp(0.5, 1, timeEased));
  }

  //the letters are rebuilt from the font's outlines, so they can be moved
  //before drawing. text() is only the fallback for the moment before the font
  //has loaded.
  if (!currentFont) {
    fill(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
    text(params.text, 0, 0);
    return;
  }

  if (params.sampleFrom === 'curves') drawFromCurves(timeInSeconds);
  if (params.sampleFrom === 'textToContours') drawFromContours(timeInSeconds);
  if (params.sampleFrom === 'textToPoints') drawFromPoints(timeInSeconds);

  //textToPoints does not know where one outline ends, so no shapes can
  //travel along one
  if (params.showOutlineShapes && params.sampleFrom !== 'textToPoints') {
    drawOutlineShapes(timeInSeconds);
  }
};

// THREE WAYS TO SAMPLE A LETTER
//
// "sample from" in the panel picks where the shape of the letters comes from.
//
//   curves          the font's own Bézier curves: anchors and handles. Smooth
//                   at any size. The only one with handles to move.
//   textToContours  p5 places points along each outline, sorted by outline.
//                   Straight lines join them, so few points (a low sample
//                   factor) look faceted. Can be filled, because p5 says
//                   which points form the outside and which the counter.
//   textToPoints    the same points in one pile. p5 does not say which
//                   outline a point is on, so it cannot be filled: it would
//                   join the outside to the counter. Always drawn as points.
//
// Every one of them gets the same wave: each anchor or point is pushed out
// from the middle of its letter and pulled back in.

function drawFromCurves(timeInSeconds) {
  const letters = textToCurves(currentFont, params.text, 0, 0);

  //anchors first. Like in Illustrator, an anchor's handles travel with it,
  //so the curve stays smooth. Each anchor is the end (`to`) of one curve and
  //the start of the next, so moving every curve's end moves every anchor once.
  for (const letter of letters) {
    //measured before anything moves, so the middle stays put
    const center = getCenter(letter.flat().map((curve) => curve.from));

    for (const contour of letter) {
      contour.forEach((curve, curveIndex) => {
        const nextCurve = contour[(curveIndex + 1) % contour.length];
        const move = waveOutwards(curve.to, center, timeInSeconds);

        const handleBefore = curve.controls[curve.controls.length - 1];
        const handleAfter = nextCurve.controls[0];
        for (const movingPoint of [curve.to, handleBefore, handleAfter]) {
          if (!movingPoint) continue;
          movingPoint.x += move.x;
          movingPoint.y += move.y;
        }
      });
    }
  }

  //then the handles on their own, drifting with noise()
  for (const letter of letters) {
    for (const contour of letter) {
      for (const curve of contour) {
        for (const handle of curve.controls) {
          const drift = noiseDrift(handle, params.handleWobble, timeInSeconds);
          handle.x += drift.x;
          handle.y += drift.y;
        }
      }
    }
  }

  setLetterStyle();
  drawCurves(letters, { showHandles: params.showHandles });
}

function drawFromContours(timeInSeconds) {
  const letters = textToLetterContours(currentFont, params.text, 0, 0, {
    sampleFactor: params.sampleFactor,
  });
  waveLetters(letters, timeInSeconds);

  //fill on: every outline goes into one shape as a contour, which is what
  //cuts the counters out, the same way drawCurves() does it
  if (params.fillLetters) {
    setLetterStyle();
    beginShape();
    for (const outline of letters.flat()) {
      beginContour();
      for (const textPoint of outline) {
        vertex(textPoint.x, textPoint.y);
      }
      endContour(CLOSE);
    }
    endShape();
    return;
  }

  //fill off: the points themselves. The outlines take turns being red and
  //blue, to show how p5 sorted them. On an "A" the outside is red and the
  //counter is blue. The blue is our choice, not p5's.
  //
  //The loops say `textPoint`, not `point`, because point() is a p5 function.
  noStroke();
  letters.flat().forEach((outline, outlineIndex) => {
    const pointColor = outlineIndex % 2 === 0 ? redPointColor : bluePointColor;
    fill(pointColor.r, pointColor.g, pointColor.b);
    for (const textPoint of outline) {
      circle(textPoint.x, textPoint.y, POINT_SIZE);
    }
  });
}

function drawFromPoints(timeInSeconds) {
  const textPoints = currentFont.textToPoints(params.text, 0, 0, {
    sampleFactor: params.sampleFactor,
  });

  //one pile means we cannot tell the letters apart either, so the wave
  //pushes out from the middle of the whole text instead of each letter
  const center = getCenter(textPoints);
  for (const textPoint of textPoints) {
    const move = waveOutwards(textPoint, center, timeInSeconds);
    textPoint.x += move.x;
    textPoint.y += move.y;
  }

  noStroke();
  fill(redPointColor.r, redPointColor.g, redPointColor.b);
  for (const textPoint of textPoints) {
    circle(textPoint.x, textPoint.y, POINT_SIZE);
  }
}

// Fill on: the letters are filled in with the type color, counters cut out.
// Fill off: only the line around every edge, to study how they are built.
function setLetterStyle() {
  if (params.fillLetters) {
    fill(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
    noStroke();
  } else {
    noFill();
    stroke(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
  }
  strokeWeight(1);
}

// THE WAVE
//
// How far to move a point this frame. It moves along the arrow from `center`
// out to the point, further out and back in. sin() makes that a wave, which
// travels round the letter over time.
//
//   waveAmplitude  how far a point is pushed out or pulled in, in pixels
//   waveFrequency  how many waves fit on one full turn around the letter.
//                  Whole numbers only, so the last wave meets the first.
function waveOutwards(position, center, timeInSeconds) {
  const outwards = p5.Vector.sub(createVector(position.x, position.y), center);
  const wave = sin(outwards.heading() * params.waveFrequency + timeInSeconds * WAVE_SPEED);
  return outwards.setMag(wave * params.waveAmplitude);
}

// Moves every point of every letter by the wave, each from the middle of its
// own letter.
function waveLetters(letters, timeInSeconds) {
  for (const letter of letters) {
    //measured before anything moves, so the middle stays put
    const center = getCenter(letter.flat());
    for (const outline of letter) {
      for (const textPoint of outline) {
        const move = waveOutwards(textPoint, center, timeInSeconds);
        textPoint.x += move.x;
        textPoint.y += move.y;
      }
    }
  }
}

// How far a handle drifts this frame: a smooth noise() value for x and for y,
// each mapped to between -amount and +amount pixels.
function noiseDrift(position, amount, timeInSeconds) {
  const noiseX = position.x * NOISE_SCALE;
  const noiseY = position.y * NOISE_SCALE;
  const driftX = noise(noiseX, noiseY, timeInSeconds);
  const driftY = noise(noiseX, noiseY, timeInSeconds + NOISE_OFFSET_FOR_Y);
  return {
    x: map(driftX, 0, 1, -amount, amount),
    y: map(driftY, 0, 1, -amount, amount),
  };
}

// OUTLINE SHAPES
//
// Circles that travel along every outline, outlineShapeSpacing pixels apart,
// at outlineShapeSpeed pixels per second. They ride on the same waving
// outline you see. Counters run the other way round from the outside, so
// their circles do too. placeAlongOutline() in src/lib/font/outlines.js
// does the measuring.
function drawOutlineShapes(timeInSeconds) {
  const sampleFactor = params.sampleFrom === 'curves' ? OUTLINE_SHAPE_SAMPLE_FACTOR : params.sampleFactor;
  const letters = textToLetterContours(currentFont, params.text, 0, 0, { sampleFactor });
  waveLetters(letters, timeInSeconds);

  //how far the circles have travelled round since the sketch started
  const offset = timeInSeconds * params.outlineShapeSpeed;

  //an outline in the type color, nothing filled in
  noFill();
  stroke(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
  strokeWeight(1);

  for (const outline of letters.flat()) {
    for (const spot of placeAlongOutline(outline, params.outlineShapeSpacing, offset)) {
      circle(spot.x, spot.y, params.outlineShapeSize);
    }
  }
}

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

// Builds the control panel, then starts p5. p5 looks for the setup() and
// draw() you defined above and runs them.
createGUI({ params, onFontChange: changeFont });
new p5();
