// START HERE.
//
// This is where your sketch lives, controls included (addControls() at the
// bottom). Nothing in this project is off limits.
//
// Two things to know:
//   setup()  runs once, at the start.
//   draw()   runs about 60 times a second, forever. Animation lives here.
//
// The text is turned into the font's own Bézier curves: anchors and handles,
// as in Illustrator. Both wobble, and you can show the handles to see what
// moves. The font tools live in src/lib/font/.
//
// Note: this is p5 version 2. If you find a tutorial that uses `preload()`,
// it is written for p5 version 1 and will not work here. See the README.

import p5 from 'p5';
import { createGUI } from './lib/gui.js';
import { Easings } from './lib/easings.js';
import { applyFont, defaultFont, textToCurves, drawCurves, moveAnchor } from './lib/font/index.js';
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
  fillLetters: false,
  showHandles: true,
  anchorWobble: 0,
  handleWobble: 30,
};

// Values the panel does not change. Tweak them here.

let loopSeconds = 2;

// How far apart two points must be before they wobble differently. Smaller
// means neighbouring anchors and handles move more alike.
let noiseScale = 0.01;

// Reading the noise a long way further along for y, so a point does not
// always move along the diagonal.
let noiseOffsetForY = 100;

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

  //letters > contours > curves, see textToCurves() in src/lib/font/
  const letters = textToCurves(currentFont, uiParams.text, 0, 0);

  //anchors first; their handles move with them, as in Illustrator
  for (const contour of letters.flat()) {
    contour.forEach((curve, curveIndex) => {
      const drift = noiseDrift(curve.to, uiParams.anchorWobble, timeInSeconds);
      moveAnchor(contour, curveIndex, drift);
    });
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
};

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

// How far a point moves, between -amount and +amount, following noise().
function noiseDrift(position, amount, timeInSeconds) {
  const noiseX = position.x * noiseScale;
  const noiseY = position.y * noiseScale;

  //noise() gives 0 to 1, map() turns that into -amount to +amount
  let driftX = map(noise(noiseX, noiseY, timeInSeconds), 0, 1, -amount, amount);
  let driftY = map(noise(noiseX, noiseY, timeInSeconds + noiseOffsetForY), 0, 1, -amount, amount);

  return { x: driftX, y: driftY };
}

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

// This template's controls, added below the shared ones from src/lib/gui.js.
function addControls(gui) {
  gui.add(uiParams, 'animate');
  gui.add(uiParams, 'fillLetters').name('fill');
  gui.add(uiParams, 'showHandles').name('curve handles');
  gui.add(uiParams, 'anchorWobble', 0, 100, 1).name('anchor wobble');
  gui.add(uiParams, 'handleWobble', 0, 100, 1).name('handle wobble');
}

// Builds the control panel, then starts p5. p5 looks for the setup() and
// draw() you defined above and runs them.
createGUI({ params: uiParams, onFontChange: changeFont, addControls });
new p5();
