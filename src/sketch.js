// START HERE.
//
// This is where your sketch lives, controls included (addControls() at the
// bottom). Nothing in this project is off limits.
//
// Two things to know:
//   setup()  runs once, at the start.
//   draw()   runs about 60 times a second, forever. Animation lives here.
//
// Circles at even spacing along each letter's outlines, travelling round
// them over time. The font tools live in src/lib/font/.
//
// Note: this is p5 version 2. If you find a tutorial that uses `preload()`,
// it is written for p5 version 1 and will not work here. See the README.

import p5 from 'p5';
import { createGUI } from './lib/gui.js';
import { Easings } from './lib/easings.js';
import { applyFont, defaultFont, textToLetterContours, placeAlongOutline } from './lib/font/index.js';
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
  outlineShapeSize: 80,
  outlineShapeSpacing: 20,
  outlineShapeSpeed: 80,
};

// Values the panel does not change. Tweak them here.

let loopSeconds = 2;

// How closely the outline follows the letter. Higher is smoother but slower.
let outlineSampleFactor = 0.3;

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

  //letters > outlines > points, see textToLetterContours() in src/lib/font/
  const letters = textToLetterContours(currentFont, uiParams.text, 0, 0, {
    sampleFactor: outlineSampleFactor,
  });

  //how far the circles have travelled round the outline, in pixels
  const travelledDistance = timeInSeconds * uiParams.outlineShapeSpeed;

  noFill();
  stroke(uiParams.foregroundColor.r, uiParams.foregroundColor.g, uiParams.foregroundColor.b);
  strokeWeight(1);

  for (let letterIndex = 0; letterIndex < letters.length; letterIndex++) {
    const letter = letters[letterIndex];
    const normalizedLetterIndex = letterIndex / letters.length; //0.0-1.0 like percentage

    //a letter can have several outlines, e.g. the outside of an "A" and its counter
    for (let outlineIndex = 0; outlineIndex < letter.length; outlineIndex++) {
      const outline = letter[outlineIndex];
      const positionsOnCurve = placeAlongOutline(outline, uiParams.outlineShapeSpacing, travelledDistance);

      for (let circleIndex = 0; circleIndex < positionsOnCurve.length; circleIndex++) {
        const positionOnCurve = positionsOnCurve[circleIndex];
        const normalizedCircleIndex = circleIndex / positionsOnCurve.length; //0.0-1.0 like percentage

        //a p5 vector, so you can add(), mult() or rotate() the position
        let circlePosition = createVector(positionOnCurve.x, positionOnCurve.y);
        let circleDiameter = uiParams.outlineShapeSize;
        circle(circlePosition.x, circlePosition.y, circleDiameter);
      }
    }
  }
};

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

// This template's controls, added below the shared ones from src/lib/gui.js.
function addControls(gui) {
  gui.add(uiParams, 'animate');
  gui.add(uiParams, 'outlineShapeSize', 2, 100, 1).name('outline shape size');
  gui.add(uiParams, 'outlineShapeSpacing', 20, 300, 1).name('outline shape spacing');
  gui.add(uiParams, 'outlineShapeSpeed', 0, 400, 1).name('outline shape speed');
}

// Builds the control panel, then starts p5. p5 looks for the setup() and
// draw() you defined above and runs them.
createGUI({ params: uiParams, onFontChange: changeFont, addControls });
new p5();
