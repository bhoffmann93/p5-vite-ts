// The font tools in one place, so a sketch needs a single import line:
//
//   import { textToCurves, placeAlongOutline } from './lib/font/index.js';
//
//   fonts.js     loading the fonts in the fonts/ folder
//   curves.js    a letter's Bézier curves: anchors and handles, and drawing them
//   letters.js   p5's points sorted by letter, and the middle of a letter
//   outlines.js  placing shapes at even distances along an outline

export { applyFont, defaultFont, fontOptions } from './fonts.js';
export { textToCurves, drawCurves, drawCurve, drawHandles } from './curves.js';
export { textToLetterContours, groupByLetter, getCenter } from './letters.js';
export { placeAlongOutline, placeAtDistance, getOutlineLength } from './outlines.js';
