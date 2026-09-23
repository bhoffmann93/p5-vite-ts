// Knowing which outline belongs to which letter.
//
// p5's textToPaths() and textToContours() hand back every outline of the
// text in one list, without saying which letter it belongs to. The outlines
// do come in reading order, one for every closed loop, so they can be handed
// out one letter at a time.

// p5's textToContours(), with the outlines sorted into letters: an array of
// letters, each an array of outlines, each an array of { x, y } points.
// `options` is passed on to p5, for example { sampleFactor: 0.1 }.
export function textToLetterContours(font, str, x, y, options) {
  return groupByLetter(font, str, font.textToContours(str, x, y, options));
}

// Sorts a list of contours, in reading order, into letters. Works for the
// curves from textToCurves() and for the points from p5's textToContours().
// Each letter gets as many contours as it has when drawn on its own: 2 for
// "A", 1 for "L", 0 for a space. Spaces are left out.
export function groupByLetter(font, str, contours) {
  const letters = [];
  let nextContour = 0;
  for (const character of str) {
    const count = countContours(font, character);
    letters.push(contours.slice(nextContour, nextContour + count));
    nextContour += count;
  }

  //a font can melt two letters into one shape (a ligature, like "fi"), and
  //then the counts no longer add up. Rather than hand out the wrong outlines,
  //the whole text is then treated as one letter.
  if (nextContour !== contours.length) return [contours];

  return letters.filter((letter) => letter.length > 0);
}

// The middle of a group of { x, y } positions: the center of the box around
// them, as a p5.Vector.
export function getCenter(positions) {
  const allX = positions.map((position) => position.x);
  const allY = positions.map((position) => position.y);
  return createVector((min(allX) + max(allX)) / 2, (min(allY) + max(allY)) / 2);
}

// How many closed outlines one character has on its own.
function countContours(font, character) {
  const commands = font.textToPaths(character, 0, 0);
  return commands.filter(([type]) => type === 'M').length;
}
