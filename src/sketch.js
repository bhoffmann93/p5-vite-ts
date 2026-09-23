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
import { applyFont, defaultFont } from './lib/fonts.js';
import { Easings } from './lib/easings.js';
import { getContours, drawContours } from './lib/outlines.js';
import { startingText, backgroundColor, foregroundColor } from './config.js';

// The values the control panel changes. Add your own here, then add a line
// in src/lib/gui.js to give it a slider or a checkbox.
//
// The colors start at whatever you set in src/config.js, and are { r, g, b }
// objects, each channel a number from 0 to 255.
const params = {
  text: startingText,
  font: defaultFont,
  textSize: 300,
  foregroundColor,
  backgroundColor,
  animate: false,
  showOutlines: true,
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

  if (params.showOutlines && currentFont) {
    drawOutlines();
  } else {
    text(params.text, width / 2, height / 2);
  }
};

// A way to see the curves the letters are built from: only the line around
// every edge, in the type color, with nothing filled in.
function drawOutlines() {
  const contours = getContours(currentFont, params.text, width / 2, height / 2);

  noFill();
  stroke(params.foregroundColor.r, params.foregroundColor.g, params.foregroundColor.b);
  strokeWeight(1);
  drawContours(contours);
}

window.windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};

// Builds the control panel, then starts p5. p5 looks for the setup() and
// draw() you defined above and runs them.
createGUI({ params, onFontChange: changeFont });
new p5();
