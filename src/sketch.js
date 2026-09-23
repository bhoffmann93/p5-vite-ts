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
// src/lib/font/.
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

const LOOP_SECONDS = 2;

// radians per second
const WAVE_SPEED = 2;

// How far apart two handles must be before they drift differently. Smaller
// means neighbouring handles move more alike.
const NOISE_SCALE = 0.01;

// Reading the noise a long way further along for y, so a handle does not
// always move along the diagonal.
const NOISE_OFFSET_FOR_Y = 100;

const POINT_SIZE = 6;
const redPointColor = { r: 255, g: 60, b: 60 };
const bluePointColor = { r: 60, g: 120, b: 255 };

const OUTLINE_SHAPE_SAMPLE_FACTOR = 0.3;

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

  translate(width / 2, height / 2);
  textSize(params.textSize);

  if (params.animate) {
    //counts 0 to 1 over LOOP_SECONDS, then starts again at 0
    const timeLoop01 = (timeInSeconds / LOOP_SECONDS) % 1;
    const timePingPong = 1 - abs(timeLoop01 * 2 - 1);

    //try bounceOut or elasticOut instead of backInOut
    const timeEased = Easings.backInOut(timePingPong);
    scale(lerp(0.5, 1, timeEased));
  }

  //text() only until the font has loaded
  if (!currentFont) {
    fill(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
    text(params.text, 0, 0);
    return;
  }

  if (params.sampleFrom === 'curves') drawFromCurves(timeInSeconds);
  if (params.sampleFrom === 'textToContours') drawFromContours(timeInSeconds);
  if (params.sampleFrom === 'textToPoints') drawFromPoints(timeInSeconds);

  if (params.showOutlineShapes && params.sampleFrom !== 'textToPoints') {
    drawOutlineShapes(timeInSeconds);
  }
};

// THREE WAYS TO SAMPLE A LETTER
//
//   curves          the font's Bézier curves, with anchors and handles
//   textToContours  points along each outline, grouped by outline, so fillable
//   textToPoints    the same points in one list, so only drawable as points

function drawFromCurves(timeInSeconds) {
  const letters = textToCurves(currentFont, params.text, 0, 0);

  //anchors first; their handles move with them, as in Illustrator
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

  //then the handles on their own
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

  //one shape with a contour per outline cuts out the counters
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

  //outlines alternate red and blue to show how p5 grouped them
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

  //one list has no letters, so the wave starts from the middle of the text
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

// Filled letters, or just their outline, in the type color.
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
// Pushes a point out from `center` and back in, as a sine wave travelling
// round the letter. waveFrequency is waves per turn, so whole numbers only.
function waveOutwards(position, center, timeInSeconds) {
  const outwards = p5.Vector.sub(createVector(position.x, position.y), center);
  const wave = sin(outwards.heading() * params.waveFrequency + timeInSeconds * WAVE_SPEED);
  return outwards.setMag(wave * params.waveAmplitude);
}

// The wave on every point, each from the middle of its own letter.
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

function drawOutlineShapes(timeInSeconds) {
  const sampleFactor = params.sampleFrom === 'curves' ? OUTLINE_SHAPE_SAMPLE_FACTOR : params.sampleFactor;
  const letters = textToLetterContours(currentFont, params.text, 0, 0, { sampleFactor });
  waveLetters(letters, timeInSeconds);

  const offset = timeInSeconds * params.outlineShapeSpeed;

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
