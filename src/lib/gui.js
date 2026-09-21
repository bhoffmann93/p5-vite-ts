// The control panel, built with lil-gui.
// https://lil-gui.georgealways.com/
//
// To add your own control, add a value to `params` in src/sketch.js and then
// add one line here. A few examples:
//
//   gui.add(params, 'speed', 0, 10, 0.1);        // slider: min, max, step
//   gui.add(params, 'showGrid');                 // checkbox
//   gui.add(params, 'easing', easingNames);      // dropdown
//   gui.addColor(params, 'accent', 255);         // colour picker
//
// You should not need to change anything else in this file.

import GUI from 'lil-gui';
import { fontOptions } from './fonts.js';
import { savePNG } from './export.js';

/**
 * Build the control panel.
 *
 * @param {object}   opts.params        the values the sketch draws with
 * @param {Function} opts.onFontChange  called with the new font when it changes
 */
export function createGUI({ params, onFontChange }) {
  const gui = new GUI({ title: 'Controls' });

  gui.add(params, 'text').name('text');

  gui.add(params, 'font', fontOptions).name('font').onChange(onFontChange);

  gui.add(params, 'textSize', 8, 400, 1).name('size');

  //the 255 tells lil-gui our { r, g, b } channels run 0-255, not 0-1
  gui.addColor(params, 'foregroundColor', 255).name('type colour');

  gui.addColor(params, 'backgroundColor', 255).name('background');

  //lil-gui turns a function on an object into a button
  gui.add({ exportPNG: () => savePNG() }, 'exportPNG').name('Export PNG');

  //'g' hides the panel, so you can screenshot or record the canvas alone
  let visible = true;
  const toggle = () => {
    visible = !visible;
    gui.show(visible);
  };

  window.addEventListener('keydown', (event) => {
    //don't fire hotkeys while someone is typing into the text field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    if (event.key === 'g') toggle();
    if (event.key === 's') savePNG();
  });

  return gui;
}
