// Font discovery.
//
// Every font file you drop into the `fonts/` folder shows up in the Font
// dropdown automatically. There is no list to keep up to date.
//
// p5 only loads .otf and .ttf properly. .woff2 is matched here so that a file
// isn't silently ignored, but it may fail to load — applyFont() logs that to
// the console and falls back to the system font.
//
// You should not need to edit this file.

// Vite scans the fonts/ folder at build time and hands us a { path: url } map.
// (This is why fonts/ lives at the project root and not inside static/ —
// files in static/ are copied verbatim and are invisible to this scan.)
const files = import.meta.glob('/fonts/*.{otf,ttf,woff2,OTF,TTF,WOFF2}', {
  eager: true,
  query: '?url',
  import: 'default',
});

// The fallback when fonts/ is empty, so the sketch still runs on a fresh copy.
export const SYSTEM_FONT = 'sans-serif';

// [{ label: 'Helvetica-Bold', url: '/fonts/Helvetica-Bold.otf' }, ...]
export const fontList = Object.entries(files)
  .map(([path, url]) => ({
    label: path.split('/').pop().replace(/\.(otf|ttf|woff2)$/i, ''),
    url,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

// What the Font dropdown shows: { 'Helvetica-Bold': '/fonts/...', ... }
// The system font only appears when fonts/ is empty — offering it alongside
// real fonts is just confusing, but a dropdown with nothing in it is worse.
export const fontOptions =
  fontList.length > 0
    ? Object.fromEntries(fontList.map((f) => [f.label, f.url]))
    : { [SYSTEM_FONT]: SYSTEM_FONT };

// The font selected on first load: your first real font if you have one,
// otherwise the system fallback.
export const defaultFont = fontList.length > 0 ? fontList[0].url : SYSTEM_FONT;

// Tracks the most recent request so that a slow font arriving late cannot
// overwrite a faster one the user picked afterwards.
let pending = null;

/**
 * Apply a font to the sketch. Pass a url from `fontOptions`, or SYSTEM_FONT.
 * Loading a font file is asynchronous, so this returns a promise.
 */
export async function applyFont(p, value) {
  if (value === SYSTEM_FONT) {
    pending = SYSTEM_FONT;
    p.textFont(SYSTEM_FONT);
    return;
  }

  pending = value;
  try {
    const font = await p.loadFont(value);
    // Someone picked a different font while this one was loading — drop it.
    if (pending !== value) return;
    p.textFont(font);
  } catch (err) {
    console.error(`Could not load font: ${value}`, err);
    if (pending === value) p.textFont(SYSTEM_FONT);
  }
}
