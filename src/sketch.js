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

let sketch;

createGUI({
  params,
  onFontChange: (value) => applyFont(sketch, value),
  getSketch: () => sketch,
});

new p5((p) => {
  sketch = p;

  p.setup = async () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.textAlign(p.CENTER, p.CENTER);

    //loading a font takes a moment, so we wait for it before drawing
    await applyFont(p, params.font);
  };

  p.draw = () => {
    const background = params.backgroundColor;
    p.background(background.r, background.g, background.b);

    const foreground = params.foregroundColor;
    p.fill(foreground.r, foreground.g, foreground.b);
    p.noStroke();

    p.textSize(params.textSize);
    p.text(params.text, p.width / 2, p.height / 2);
  };

  //keeps the canvas filling the window when you resize it
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
