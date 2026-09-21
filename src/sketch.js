// THIS IS YOUR FILE.
//
// Everything you make happens here. The files in src/lib/ are plumbing:
// they build the control panel, find your fonts and save your images.
//
// Two things to know:
//   setup()  runs once, at the start.
//   draw()   runs about 60 times a second, forever. Animation lives here.
//
// Note: this is p5 version 2. If you find a tutorial that uses `preload()`,
// it is written for p5 version 1 and will not work here. See the README.

import p5 from 'p5';
import { createGUI } from './lib/gui.js';
import { applyFont, defaultFont } from './lib/fonts.js';
import { backgroundColor, foregroundColor } from './config.js';

// The values the control panel changes. Add your own here, then add a line
// in src/lib/gui.js to give it a slider or a checkbox.
//
// The colours start at whatever you set in src/config.js, and are { r, g, b }
// objects, each channel a number from 0 to 255.
const params = {
  text: 'A',
  font: defaultFont,
  textSize: 300,
  foregroundColor,
  backgroundColor,
};

window.setup = async function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  //loading a font takes a moment, so we wait for it before drawing
  await applyFont(params.font);
};

window.draw = function draw() {
  background(params.backgroundColor.r, params.backgroundColor.g, params.backgroundColor.b);

  fill(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
  noStroke();

  textSize(params.textSize);
  text(params.text, width / 2, height / 2);
};

//keeps the canvas filling the window when you resize it
window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

// Below is the wiring that starts everything. You can ignore it.
createGUI({ params, onFontChange: applyFont });
new p5();
