// THE CONTROL PANEL
// https://lil-gui.georgealways.com/
//
// This is the second file you will work in. Every slider, dropdown and color
// picker in the corner of the screen is one line down below.
//
// Adding a control takes two steps:
//   1. add the value to `params` in src/sketch.js
//   2. add one line here
//
// lil-gui picks the kind of control from the value you give it:
//
//   gui.add(params, 'speed', 0, 10, 0.1);     a number  -> slider from 0 to 10, stepping 0.1
//   gui.add(params, 'showGrid');              true/false -> checkbox
//   gui.add(params, 'words');                 text      -> text field
//   gui.add(params, 'easing', easingNames);   a list    -> dropdown
//   gui.addColor(params, 'accent', 255);                -> color picker
//
// Add .name('Label') when the property name is not what you want to read.

import GUI from 'lil-gui';
import { fontOptions } from './font/fonts.js';
import { savePNG } from './export.js';

// `params` is the object in src/sketch.js holding every value the sketch
// draws with. `onFontChange` runs when someone picks a font from the dropdown.
export function createGUI({ params, onFontChange }) {
  const gui = new GUI({ title: 'Controls' });

  gui.add(params, 'text');

  gui.add(params, 'font', fontOptions).onChange(onFontChange);

  gui.add(params, 'textSize', 100, 500, 1).name('size');

  //the 255 says our r, g and b channels run to 255, not to 1
  gui.addColor(params, 'foregroundColor', 255).name('type color');

  gui.addColor(params, 'backgroundColor', 255).name('background');

  gui.add(params, 'animate');

  const sampleFromControl = gui
    .add(params, 'sampleFrom', ['curves', 'textToContours', 'textToPoints'])
    .name('sample from');

  const fillControl = gui.add(params, 'fillLetters').name('fill');

  const sampleFactorControl = gui.add(params, 'sampleFactor', 0.02, 0.1, 0.01).name('sample factor');

  gui.add(params, 'waveAmplitude', 0, 100, 1).name('wave amplitude');

  gui.add(params, 'waveFrequency', 1, 12, 1).name('wave frequency');

  const handlesControl = gui.add(params, 'showHandles').name('curve handles');

  const handleWobbleControl = gui.add(params, 'handleWobble', 0, 100, 1).name('handle wobble');

  const outlineShapesControl = gui.add(params, 'showOutlineShapes').name('outline shapes');

  const outlineShapeSizeControl = gui.add(params, 'outlineShapeSize', 2, 100, 1).name('outline shape size');

  const outlineShapeSpacingControl = gui.add(params, 'outlineShapeSpacing', 20, 300, 1).name('outline shape spacing');

  const outlineShapeSpeedControl = gui.add(params, 'outlineShapeSpeed', 0, 400, 1).name('outline shape speed');

  const greyOutUnusedControls = (sampleFrom) => {
    fillControl.enable(sampleFrom !== 'textToPoints');
    sampleFactorControl.enable(sampleFrom !== 'curves');
    handlesControl.enable(sampleFrom === 'curves');
    handleWobbleControl.enable(sampleFrom === 'curves');
    outlineShapesControl.enable(sampleFrom !== 'textToPoints');
    outlineShapeSizeControl.enable(sampleFrom !== 'textToPoints');
    outlineShapeSpacingControl.enable(sampleFrom !== 'textToPoints');
    outlineShapeSpeedControl.enable(sampleFrom !== 'textToPoints');
  };
  sampleFromControl.onChange(greyOutUnusedControls);
  greyOutUnusedControls(params.sampleFrom);

  //a function on an object is how lil-gui makes a button
  gui.add({ exportPNG: () => savePNG() }, 'exportPNG').name('Export PNG');

  //hiding the panel leaves a clean canvas to screenshot or record
  let visible = true;
  const toggle = () => {
    visible = !visible;
    gui.show(visible);
  };

  window.addEventListener('keydown', (event) => {
    //without this, typing an s into the text field would save a screenshot
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    if (event.key === 'g') toggle();
    if (event.key === 's') savePNG();
  });

  return gui;
}
