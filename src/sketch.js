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
import { groupByLetter, getCenter } from './lib/font/letters.js';
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
  fill: false,
  showHandles: true,
  waveAmplitude: 0,
  waveFrequency: 3,
  handleWobble: 0,
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

  //the letters are rebuilt from the font's outlines, so they can be moved
  //before drawing. text() is only the fallback for the moment before the font
  //has loaded.
  if (!currentFont) {
    text(params.text, width / 2, height / 2);
    return;
  }

  if (params.sampleFrom === 'curves') drawFromCurves();
  if (params.sampleFrom === 'textToContours') drawFromContours();
  if (params.sampleFrom === 'textToPoints') drawFromPoints();
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

// The wave: how far to move a point this frame. It moves along the arrow from
// `center` out to the point, further out and back in. sin() makes that a
// wave, which travels round the letter over time.
//
//   waveAmplitude  how far a point is pushed out or pulled in, in pixels
//   waveFrequency  how many waves fit on one full turn around the letter.
//                  Whole numbers only, so the last wave meets the first.
function waveOutwards(position, center, timeInSeconds) {
  const outwards = p5.Vector.sub(createVector(position.x, position.y), center);
  const wave = sin(outwards.heading() * params.waveFrequency + timeInSeconds * WAVE_SPEED);
  return outwards.setMag(wave * params.waveAmplitude);
}

// How fast the wave travels round the letter, in radians per second.
const WAVE_SPEED = 2;

// Fill on: the letters are filled in with the type color, counters cut out.
// Fill off: only the line around every edge, to study how they are built.
function setLetterStyle() {
  if (params.fill) {
    fill(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
    noStroke();
  } else {
    noFill();
    stroke(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
  }
  strokeWeight(1);
}

function drawFromCurves() {
  const letters = textToCurves(currentFont, params.text, width / 2, height / 2);
  const timeInSeconds = millis() / 1000;

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

function drawFromContours() {
  const contours = currentFont.textToContours(params.text, width / 2, height / 2, {
    sampleFactor: params.sampleFactor,
  });
  const letters = groupByLetter(currentFont, params.text, contours);
  const timeInSeconds = millis() / 1000;

  for (const letter of letters) {
    const center = getCenter(letter.flat());
    for (const contour of letter) {
      for (const textPoint of contour) {
        const move = waveOutwards(textPoint, center, timeInSeconds);
        textPoint.x += move.x;
        textPoint.y += move.y;
      }
    }
  }

  //fill on: every outline goes into one shape as a contour, which is what
  //cuts the counters out, the same way drawCurves() does it
  if (params.fill) {
    setLetterStyle();
    beginShape();
    for (const contour of letters.flat()) {
      beginContour();
      for (const textPoint of contour) {
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
  noStroke();
  letters.flat().forEach((contour, contourIndex) => {
    const pointColor = contourIndex % 2 === 0 ? redPointColor : bluePointColor;
    fill(pointColor.r, pointColor.g, pointColor.b);
    for (const textPoint of contour) {
      circle(textPoint.x, textPoint.y, POINT_SIZE);
    }
  });
}

function drawFromPoints() {
  const textPoints = currentFont.textToPoints(params.text, width / 2, height / 2, {
    sampleFactor: params.sampleFactor,
  });
  const timeInSeconds = millis() / 1000;

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

// How big the points are drawn, in pixels, and their colors. The loops say
// `textPoint`, not `point`, because point() is a p5 function.
const POINT_SIZE = 6;
const redPointColor = { r: 255, g: 60, b: 60 };
const bluePointColor = { r: 60, g: 120, b: 255 };

// How far apart two handles must be before they drift differently. Smaller
// means neighbouring handles move more alike.
const NOISE_SCALE = 0.01;

// Reading the noise a long way further along for y, so a handle does not
// always move along the diagonal.
const NOISE_OFFSET_FOR_Y = 100;

// How far a handle drifts this frame: a smooth noise() value for x and for y,
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

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

// Builds the control panel, then starts p5. p5 looks for the setup() and
// draw() you defined above and runs them.
createGUI({ params, onFontChange: changeFont });
new p5();
