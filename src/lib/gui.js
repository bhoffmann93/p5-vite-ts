// The control panel, built with Tweakpane.
//
// To add your own control, add a value to `params` in src/sketch.js and then
// add one line here. A few examples:
//
//   pane.addBinding(params, 'speed',   { min: 0, max: 10, step: 0.1 });
//   pane.addBinding(params, 'showGrid');                 // checkbox
//   pane.addBinding(params, 'accent');                   // colour picker
//   pane.addBinding(params, 'easing', { options: ... }); // dropdown
//
// You should not need to change anything else in this file.

import { Pane } from 'tweakpane';
import { fontOptions } from './fonts.js';
import { savePNG } from './export.js';

/**
 * Build the control panel.
 *
 * @param {object}   opts.params        the values the sketch draws with
 * @param {Function} opts.onFontChange  called with the new font when it changes
 * @param {Function} opts.getSketch     returns the p5 instance (for exporting)
 */
export function createGUI({ params, onFontChange, getSketch }) {
  const pane = new Pane({ title: 'Controls' });

  pane.addBinding(params, 'text', { label: 'text' });

  pane
    .addBinding(params, 'font', { label: 'font', options: fontOptions })
    .on('change', (event) => onFontChange(event.value));

  pane.addBinding(params, 'textSize', { label: 'size', min: 8, max: 400, step: 1 });

  //an { r, g, b } object gets a colour picker, same as a hex string would
  pane.addBinding(params, 'foregroundColor', { label: 'type colour' });

  pane.addBinding(params, 'backgroundColor', { label: 'background' });

  pane.addButton({ title: 'Export PNG' }).on('click', () => savePNG(getSketch()));

  //'g' hides the panel, so you can screenshot or record the canvas alone
  const toggle = () => {
    pane.hidden = !pane.hidden;
  };

  window.addEventListener('keydown', (event) => {
    //don't fire hotkeys while someone is typing into the text field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    if (event.key === 'g') toggle();
    if (event.key === 's') savePNG(getSketch());
  });

  return pane;
}
