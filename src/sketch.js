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
import { applyFont, defaultFont } from './lib/font/index.js';
import { startingText, backgroundColor, foregroundColor } from './config.js';

// The values the control panel changes. Add your own here, then add a line
// in addControls() at the bottom of this file to give it a slider or a checkbox.
//
// The colors start at whatever you set in src/config.js, and are { r, g, b }
// objects, each channel a number from 0 to 255.
const uiParams = {
  text: startingText,
  font: defaultFont,
  textSize: 300,
  foregroundColor,
  backgroundColor,
  animate: true,
};

let loopSeconds = 2;

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

  fill(uiParams.foregroundColor.r, uiParams.foregroundColor.g, uiParams.foregroundColor.b);
  noStroke();
  textSize(uiParams.textSize);
  text(uiParams.text, 0, 0);
};

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

// This template's controls, added below the shared ones from src/lib/gui.js.
function addControls(gui) {
  gui.add(uiParams, 'animate');
}

// Builds the control panel, then starts p5. p5 looks for the setup() and
// draw() you defined above and runs them.
createGUI({ params: uiParams, onFontChange: changeFont, addControls });
new p5();
