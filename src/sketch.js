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
const params = {
  text: startingText,
  font: defaultFont,
  textSize: 300,
  foregroundColor,
  backgroundColor,
  animate: true,
};

const LOOP_SECONDS = 2;

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

  if (params.animate) {
    //counts 0 to 1 over LOOP_SECONDS, then starts again at 0
    const timeLoop01 = (timeInSeconds / LOOP_SECONDS) % 1;
    const timePingPong = 1 - abs(timeLoop01 * 2 - 1);

    //try bounceOut or elasticOut instead of backInOut
    const timeEased = Easings.backInOut(timePingPong);
    scale(lerp(0.5, 1, timeEased));
  }

  fill(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
  noStroke();
  textSize(params.textSize);
  text(params.text, 0, 0);
};

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

// This template's controls, added below the shared ones from src/lib/gui.js.
function addControls(gui) {
  gui.add(params, 'animate');
}

// Builds the control panel, then starts p5. p5 looks for the setup() and
// draw() you defined above and runs them.
createGUI({ params, onFontChange: changeFont, addControls });
new p5();
