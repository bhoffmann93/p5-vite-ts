// Saving images.
//
// Files are named after `screenshotName` in src/config.js, plus the date and
// time, so two exports never overwrite each other.
//
// You should not need to edit this file.

import { screenshotName } from '../config.js';

// e.g. '260921-1408' -> 21 Sept 2026, 14:08
export const timestamp = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');

  //getMonth() counts from zero, so January is 0
  const year = String(now.getFullYear()).slice(-2);
  const date = `${year}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}`;

  return `${date}-${time}`;
};

/** Save the current canvas as a PNG into your Downloads folder. */
export function savePNG(sketch) {
  sketch.saveCanvas(`${screenshotName}-${timestamp()}`, 'png');
}
