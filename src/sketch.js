// START HERE.
//
// This is where your sketch lives, controls included (addControls() at the
// bottom). Nothing in this project is off limits.
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
  moveAnchor,
  textToLetterContours,
  getCenter,
  placeAlongOutline,
} from './lib/font/index.js';
import { startingText, backgroundColor, foregroundColor } from './config.js';

// The values the control panel changes. Add your own here, then add a line
// in addControls() at the bottom of this file to give it a slider or a checkbox.
//
// The colors start at whatever you set in src/config.js, and are { r, g, b }
// objects, each channel a number from 0 to 255.
const uiParams = {
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

let loopSeconds = 2;

// radians per second
let waveSpeed = 2;

// How far apart two handles must be before they drift differently. Smaller
// means neighbouring handles move more alike.
let noiseScale = 0.01;

// Reading the noise a long way further along for y, so a handle does not
// always move along the diagonal.
let noiseOffsetForY = 100;

let pointSize = 6;
let redPointColor = { r: 255, g: 60, b: 60 };
let bluePointColor = { r: 60, g: 120, b: 255 };

let outlineShapeSampleFactor = 0.3;

let currentFont = null;

async function changeFont(url) {
  currentFont = await applyFont(url);
}

window.setup = async function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  //loading a font takes a moment, so we wait for it before drawing
  await changeFont(uiParams.font);
};

window.draw = function draw() {
  background(uiParams.backgroundColor.r, uiParams.backgroundColor.g, uiParams.backgroundColor.b);
  let timeInSeconds = millis() / 1000;

  translate(width / 2, height / 2);
  textSize(uiParams.textSize);

  if (uiParams.animate) {
    //counts 0 to 1 over loopSeconds, then starts again at 0
    const timeLoop01 = (timeInSeconds / loopSeconds) % 1;
    const timePingPong = 1 - abs(timeLoop01 * 2 - 1);

    //try bounceOut or elasticOut instead of backInOut
    const timeEased = Easings.backInOut(timePingPong);
    scale(lerp(0.5, 1, timeEased));
  }

  //text() only until the font has loaded
  if (!currentFont) {
    fill(uiParams.foregroundColor.r, uiParams.foregroundColor.g, uiParams.foregroundColor.b);
    text(uiParams.text, 0, 0);
    return;
  }

  if (uiParams.sampleFrom === 'curves') drawFromCurves(timeInSeconds);
  if (uiParams.sampleFrom === 'textToContours') drawFromContours(timeInSeconds);
  if (uiParams.sampleFrom === 'textToPoints') drawFromPoints(timeInSeconds);

  if (uiParams.showOutlineShapes && uiParams.sampleFrom !== 'textToPoints') {
    drawOutlineShapes(timeInSeconds);
  }
};

// THREE WAYS TO SAMPLE A LETTER
//
//   curves          the font's Bézier curves, with anchors and handles
//   textToContours  points along each outline, grouped by outline, so fillable
//   textToPoints    the same points in one list, so only drawable as points

function drawFromCurves(timeInSeconds) {
  const letters = textToCurves(currentFont, uiParams.text, 0, 0);

  //anchors first; their handles move with them, as in Illustrator
  for (const letter of letters) {
    //measured before anything moves, so the middle stays put
    const center = getCenter(letter.flat().map((curve) => curve.from));

    for (const contour of letter) {
      contour.forEach((curve, curveIndex) => {
        const move = waveOutwards(curve.to, center, timeInSeconds);
        moveAnchor(contour, curveIndex, move);
      });
    }
  }

  //then the handles on their own, every curve of every letter
  for (const curve of letters.flat(2)) {
    for (const handle of curve.controls) {
      const drift = noiseDrift(handle, uiParams.handleWobble, timeInSeconds);
      handle.x += drift.x;
      handle.y += drift.y;
    }
  }

  setLetterStyle();
  drawCurves(letters, { showHandles: uiParams.showHandles });
}

function drawFromContours(timeInSeconds) {
  const letters = textToLetterContours(currentFont, uiParams.text, 0, 0, {
    sampleFactor: uiParams.sampleFactor,
  });
  waveLetters(letters, timeInSeconds);

  //one shape with a contour per outline cuts out the counters
  if (uiParams.fillLetters) {
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
      circle(textPoint.x, textPoint.y, pointSize);
    }
  });
}

function drawFromPoints(timeInSeconds) {
  const textPoints = currentFont.textToPoints(uiParams.text, 0, 0, {
    sampleFactor: uiParams.sampleFactor,
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
    circle(textPoint.x, textPoint.y, pointSize);
  }
}

// Filled letters, or just their outline, in the type color.
function setLetterStyle() {
  if (uiParams.fillLetters) {
    fill(uiParams.foregroundColor.r, uiParams.foregroundColor.g, uiParams.foregroundColor.b);
    noStroke();
  } else {
    noFill();
    stroke(uiParams.foregroundColor.r, uiParams.foregroundColor.g, uiParams.foregroundColor.b);
  }
  strokeWeight(1);
}

// THE WAVE
//
// Pushes a point out from `center` and back in, as a sine wave travelling
// round the letter. waveFrequency is waves per turn, so whole numbers only.
function waveOutwards(position, center, timeInSeconds) {
  const outwards = p5.Vector.sub(createVector(position.x, position.y), center);
  const wave = sin(outwards.heading() * uiParams.waveFrequency + timeInSeconds * waveSpeed);
  return outwards.setMag(wave * uiParams.waveAmplitude);
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
  const noiseX = position.x * noiseScale;
  const noiseY = position.y * noiseScale;
  const driftX = noise(noiseX, noiseY, timeInSeconds);
  const driftY = noise(noiseX, noiseY, timeInSeconds + noiseOffsetForY);
  return {
    x: map(driftX, 0, 1, -amount, amount),
    y: map(driftY, 0, 1, -amount, amount),
  };
}

function drawOutlineShapes(timeInSeconds) {
  const sampleFactor = uiParams.sampleFrom === 'curves' ? outlineShapeSampleFactor : uiParams.sampleFactor;
  const letters = textToLetterContours(currentFont, uiParams.text, 0, 0, { sampleFactor });
  waveLetters(letters, timeInSeconds);

  const offset = timeInSeconds * uiParams.outlineShapeSpeed;

  noFill();
  stroke(uiParams.foregroundColor.r, uiParams.foregroundColor.g, uiParams.foregroundColor.b);
  strokeWeight(1);

  for (const outline of letters.flat()) {
    for (const spot of placeAlongOutline(outline, uiParams.outlineShapeSpacing, offset)) {
      circle(spot.x, spot.y, uiParams.outlineShapeSize);
    }
  }
}

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

// This template's controls, added below the shared ones from src/lib/gui.js.
function addControls(gui) {
  gui.add(uiParams, 'animate');

  const sampleFromControl = gui
    .add(uiParams, 'sampleFrom', ['curves', 'textToContours', 'textToPoints'])
    .name('sample from');

  const fillControl = gui.add(uiParams, 'fillLetters').name('fill');

  const sampleFactorControl = gui.add(uiParams, 'sampleFactor', 0.02, 0.1, 0.01).name('sample factor');

  gui.add(uiParams, 'waveAmplitude', 0, 100, 1).name('wave amplitude');

  gui.add(uiParams, 'waveFrequency', 1, 12, 1).name('wave frequency');

  const handlesControl = gui.add(uiParams, 'showHandles').name('curve handles');

  const handleWobbleControl = gui.add(uiParams, 'handleWobble', 0, 100, 1).name('handle wobble');

  const outlineShapesControl = gui.add(uiParams, 'showOutlineShapes').name('outline shapes');

  const outlineShapeSizeControl = gui.add(uiParams, 'outlineShapeSize', 2, 100, 1).name('outline shape size');

  const outlineShapeSpacingControl = gui.add(uiParams, 'outlineShapeSpacing', 20, 300, 1).name('outline shape spacing');

  const outlineShapeSpeedControl = gui.add(uiParams, 'outlineShapeSpeed', 0, 400, 1).name('outline shape speed');

  const greyOutUnusedControls = (sampleFrom) => {
    fillControl.enable(sampleFrom !== 'textToPoints');
    sampleFactorControl.enable(sampleFrom !== 'curves');
    handlesControl.enable(sampleFrom === 'curves');
    handleWobbleControl.enable(sampleFrom === 'curves');
    outlineShapesControl.enable(sampleFrom !== 'textToPoints');
    outlineShapeSizeControl.enable(sampleFrom !== 'textToPoints');
    outlineShapeSpacingControl.enable(sampleFrom !== 'textToPoints');
    outlineShapeSpeedControl.enable(sampleFrom !== 'textToPoints');
  };
  sampleFromControl.onChange(greyOutUnusedControls);
  greyOutUnusedControls(uiParams.sampleFrom);
}

// Builds the control panel, then starts p5. p5 looks for the setup() and
// draw() you defined above and runs them.
createGUI({ params: uiParams, onFontChange: changeFont, addControls });
new p5();
