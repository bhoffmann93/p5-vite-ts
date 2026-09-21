// FINDING YOUR FONTS
//
// Vite scans the fonts/ folder and hands back a { path: url } map, which
// becomes the dropdown. That is why fonts/ sits at the top level and not
// inside static/ — files in static/ are copied as-is and are invisible here.
//
// Use .otf or .ttf. Those are the formats p5's loadFont() reads.

const files = import.meta.glob('/fonts/*.{otf,ttf,OTF,TTF}', {
  eager: true,
  query: '?url',
  import: 'default',
});

// { 'Inter-Black': '/fonts/Inter-Black.ttf', ... }  the dropdown's labels and values
export const fontOptions = Object.fromEntries(
  Object.entries(files)
    .map(([path, url]) => [path.split('/').pop().replace(/\.[^.]+$/, ''), url])
    .sort(([firstLabel], [secondLabel]) => firstLabel.localeCompare(secondLabel)),
);

export const defaultFont = Object.values(fontOptions)[0];

// Switches the sketch to a font. Reading the file takes a moment, which is why
// this is async and why setup() says `await applyFont(...)`.
export async function applyFont(url) {
  textFont(await loadFont(url));
}
