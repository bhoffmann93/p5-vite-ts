// START HERE.
//
// This is where your sketch lives, controls included (addControls() at the
// bottom). Nothing in this project is off limits.
//
// Two things to know:
//   setup()  runs once, at the start.
//   draw()   runs about 60 times a second, forever. Animation lives here.
//
// The text is turned into points along each letter's outlines. The points
// wobble, and can be drawn as dots or as a filled letter.
// The font tools live in src/lib/font/.
//
// Note: this is p5 version 2. If you find a tutorial that uses `preload()`,
// it is written for p5 version 1 and will not work here. See the README.

import p5 from 'p5';
import { createGUI } from './lib/gui.js';
import { Easings } from './lib/easings.js';
import { applyFont, defaultFont, textToLetterContours } from './lib/font/index.js';
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
  sampleFactor: 0.1,
  pointWobble: 10,
};

// Values the panel does not change. Tweak them here.

let loopSeconds = 2;

// How far apart two points must be before they wobble differently. Smaller
// means neighbouring points move more alike.
let noiseScale = 0.01;

// Reading the noise a long way further along for y, so a point does not
// always move along the diagonal.
let noiseOffsetForY = 100;

let pointSize = 6;
let redPointColor = { r: 255, g: 60, b: 60 };
let bluePointColor = { r: 60, g: 120, b: 255 };

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
    const loopTime = (timeInSeconds / loopSeconds) % 1;
    //0 to 1 and back to 0
    const backAndForthTime = 1 - abs(loopTime * 2 - 1);

    //still 0 to 1, but speeding up and slowing down
    //try bounceOut or elasticOut instead of backInOut
    const easedTime = Easings.backInOut(backAndForthTime);
    scale(lerp(0.5, 1, easedTime));
  }

  //text() only until the font has loaded
  if (!currentFont) {
    fill(uiParams.foregroundColor.r, uiParams.foregroundColor.g, uiParams.foregroundColor.b);
    text(uiParams.text, 0, 0);
    return;
  }

  //letters > outlines > points, see textToLetterContours() in src/lib/font/
  const letters = textToLetterContours(currentFont, uiParams.text, 0, 0, {
    sampleFactor: uiParams.sampleFactor,
  });
  wobblePoints(letters, timeInSeconds);

  if (uiParams.fillLetters) {
    drawFilledLetters(letters);
  } else {
    drawPoints(letters);
  }
};

// Moves every point a little, each in its own direction, following noise().
function wobblePoints(letters, timeInSeconds) {
  for (let letterIndex = 0; letterIndex < letters.length; letterIndex++) {
    const letter = letters[letterIndex];

    //a letter can have several outlines, e.g. the outside of an "A" and its counter
    for (let outlineIndex = 0; outlineIndex < letter.length; outlineIndex++) {
      const outline = letter[outlineIndex];

      for (let pointIndex = 0; pointIndex < outline.length; pointIndex++) {
        const textPoint = outline[pointIndex];

        //where in the noise this point reads, so each point gets its own value
        const noiseInputX = textPoint.x * noiseScale;
        const noiseInputY = textPoint.y * noiseScale;

        //noise() gives 0 to 1, map() turns that into -pointWobble to +pointWobble
        let driftX = map(noise(noiseInputX, noiseInputY, timeInSeconds), 0, 1, -uiParams.pointWobble, uiParams.pointWobble);
        let driftY = map(noise(noiseInputX, noiseInputY, timeInSeconds + noiseOffsetForY), 0, 1, -uiParams.pointWobble, uiParams.pointWobble);

        textPoint.x += driftX;
        textPoint.y += driftY;
      }
    }
  }
}

function drawPoints(letters) {
  noStroke();

  for (let letterIndex = 0; letterIndex < letters.length; letterIndex++) {
    const letter = letters[letterIndex];

    for (let outlineIndex = 0; outlineIndex < letter.length; outlineIndex++) {
      const outline = letter[outlineIndex];

      //outlines alternate red and blue to show how p5 grouped them
      let pointColor = redPointColor;
      if (outlineIndex % 2 === 1) {
        pointColor = bluePointColor;
      }
      fill(pointColor.r, pointColor.g, pointColor.b);

      for (let pointIndex = 0; pointIndex < outline.length; pointIndex++) {
        const textPoint = outline[pointIndex];
        circle(textPoint.x, textPoint.y, pointSize);
      }
    }
  }
}

function drawFilledLetters(letters) {
  fill(uiParams.foregroundColor.r, uiParams.foregroundColor.g, uiParams.foregroundColor.b);
  noStroke();

  //one shape with a contour per outline cuts out the counters
  beginShape();
  for (let letterIndex = 0; letterIndex < letters.length; letterIndex++) {
    const letter = letters[letterIndex];

    for (let outlineIndex = 0; outlineIndex < letter.length; outlineIndex++) {
      const outline = letter[outlineIndex];

      beginContour();
      for (let pointIndex = 0; pointIndex < outline.length; pointIndex++) {
        const textPoint = outline[pointIndex];
        vertex(textPoint.x, textPoint.y);
      }
      endContour(CLOSE);
    }
  }
  endShape();
}

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

// This template's controls, added below the shared ones from src/lib/gui.js.
function addControls(gui) {
  gui.add(uiParams, 'animate');
  gui.add(uiParams, 'fillLetters').name('fill');
  gui.add(uiParams, 'sampleFactor', 0.02, 0.1, 0.01).name('sample factor');
  gui.add(uiParams, 'pointWobble', 0, 100, 1).name('point wobble');
}

// Builds the control panel, then starts p5. p5 looks for the setup() and
// draw() you defined above and runs them.
createGUI({ params: uiParams, onFontChange: changeFont, addControls });
new p5();
