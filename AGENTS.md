# AGENTS.md

Context for AI assistants working in this repo.

## What this is

A template handed to **graphic design students** for a one-week generative
typography module. The users are designers, not developers. Optimise every
change for readability and for not breaking; do not optimise for cleverness,
abstraction or brevity.

Practical consequences:

- **No TypeScript, no ESLint, no test framework.** These were deliberately
  removed. Do not reintroduce them or suggest doing so.
- **Keep the dependency list tiny** (`p5`, `lil-gui`, `vite`, and on the
  `shader` branch `vite-plugin-glsl`).
  A new dependency is a new thing that can fail on a student's laptop.
- Comments explain *why* in plain language. Keep that register.

## Rules

**Colors are RGB, never hex.** Write them as `{ r, g, b }` objects with each
channel 0–255 — in config, in `params`, in GUI bindings and in `fill()` /
`background()` calls. No `'#ffffff'`, no `0xffffff`, no shorthand. lil-gui
takes `addColor(params, 'name', 255)` for exactly this shape, so nothing is
lost in the panel. RGB channels are what students can reason about
and animate one at a time; hex is opaque.

**No divider or banner comments, and no emoji.** No `// --- expo ---`, no
rules of dashes boxing a header in, no stars or warning signs in headings.
A comment is a sentence explaining why; decoration is noise.

**Use p5's own function if the API has one.** `lerp()`, `map()`, `constrain()`,
`dist()`, `random()`, `noise()`, `radians()`, `saveCanvas()`, `loadFont()`,
`createGraphics()` — reach for these before writing arithmetic or DOM code that
does the same job. Do not hand-roll a canvas downloader when `saveCanvas()`
exists, and do not write `a + (b - a) * t` when `lerp(a, b, t)` exists. The
students know the p5 reference; every bespoke helper is one more thing that is
in this project only. Check https://p5js.org/reference/ before adding a
utility.

**No magic numbers, but a value assigned to a well-named key is already named.**
`textSize: 250` and `{ min: 8, max: 400 }` need no constants; adding
`STARTING_TEXT_SIZE` or `MIN_TEXT_SIZE` only restates the key. A constant earns
its place when the number appears bare in an expression and its meaning cannot
be read off the line.

Arithmetic is not a magic number either: `width / 2` for a centre,
`padStart(2, '0')`, `getMonth() + 1` are idioms and stay. `const HALF = 0.5` is
the anti-pattern. If the name only restates the key or the operator, delete it.

**No abbreviated names.** `background`, not `bg`. `foreground`, not `fg`.
`value`, not `v`. `event`, not `e`.

**Names say what the thing is.** `screenshotName`, not `projectName`, because
it names screenshots. `backgroundColor`, not `background` — which in global
mode would also shadow p5's `background()`. If a name needs the comment beside
it to be understood, rename it.

## Layout

```
index.html          loads /src/sketch.js
vite.config.js      port 8080, publicDir 'static'
fonts/              student font files; scanned at build time
static/             served at / — favicon lives here, not at the root
LICENSES.md         third-party credits (eases/MIT, p5, lil-gui, Vite)
src/
  config.js         screenshotName + starting RGB colors. Student-facing.
  sketch.js         where students start
  lib/
    gui.js          lil-gui panel and hotkeys
    export.js       timestamp() + savePNG()
    easings.js      31 easing curves from `eases`, v = ease(t)
    math.js         damp, parabola, cubicPulse, cubicPulseWrap (what p5 lacks)
    drag.js         findPointAt(): which point is under the mouse
    font/
      index.js      re-exports everything below; sketches import from here
      fonts.js      font discovery + async loading
      curves.js     textToCurves(): letters > contours > Bézier curves, drawing + handles
      letters.js    textToLetterContours(), groupByLetter(), getCenter()
      outlines.js   placeAlongOutline(), placeAtDistance(), getOutlineLength()
```

Students edit `src/sketch.js` and `src/config.js`. When adding a feature,
prefer putting the *knob* in `sketch.js`'s `params` and the *wiring* in
`src/lib/`.

## The font library

| Task | Use |
| --- | --- |
| The font's Bézier curves (anchors, handles), to draw or deform | `textToCurves(font, str, x, y)` then `drawCurves(letters, { showHandles })` |
| Move an anchor and its handles together | `moveAnchor(contour, curveIndex, { x, y })` |
| Points along the outlines, sorted by letter | `textToLetterContours(font, str, x, y, { sampleFactor })` |
| The middle of a letter, e.g. to push points away from it | `getCenter(positions)` |
| Shapes at even spacing along an outline, or moving along it | `placeAlongOutline(outline, spacing, offset)` gives `{ x, y, angle }` spots |
| All the points in one flat list, no grouping | p5's own `font.textToPoints()` |

Vocabulary, used in names and comments: a **letter** holds **contours**
(closed outlines; the hole in "A" is the **counter**). With curves, a
contour holds **curves** `{ from, controls, to }`: `from`/`to` are
**anchors**, `controls` are **handles**, as in Illustrator. With points, a
contour is a list of `{ x, y }`. Do not call curves "segments" and do not
rename p5 options (it is `sampleFactor`, not "density").

## Things that will bite you

**The build step stays.** Students run `npm install` and `npm run dev`. Do not
propose replacing this with CDN script tags, VS Code's Live Server, or the p5
web editor: the point is that they work in a modern environment they will meet
again. It is also load-bearing — `import.meta.glob` in `src/lib/font/fonts.js` is
what makes a font appear in the dropdown when it is dropped into `fonts/`, and
that is a Vite feature. Removing the bundler means hand-maintaining a list of
filenames.

**p5 runs in global mode.** `sketch.js` assigns `window.setup`, `window.draw`
and `window.windowResized`, then calls `new p5()` with no argument. Never
reintroduce instance mode: the `p.` prefix taxes every line of the trig-heavy
drawing code these students write, and breaks the match with every tutorial.
The cost is shadowing — a local named `background` or `text` hides the p5
function of that name. Do not name locals after p5 functions.

**p5 is version 2, not 1.** There is no `preload()`. `loadFont()` returns a
Promise and is awaited inside an `async setup()`. Most code found online is
p5 1.x. Check the [p5 2 reference](https://p5js.org/reference/) before
suggesting loading code.

**Pin p5 to `~2.3.2`.** Version `2.3.3` was published without its `types/`
directory. Irrelevant while this project is JavaScript, but do not widen the
range casually.

**`fonts/` must stay at the project root, not in `static/`.** Discovery uses
`import.meta.glob('/fonts/*.{otf,ttf,woff2}')`, and Vite excludes `publicDir`
from globs. Moving the folder silently empties the font dropdown.

**Never shell out at config time.** `vite.config.js` previously ran
`execSync('git rev-parse')` to name exports, which crashed for anyone who
downloaded a ZIP instead of cloning. That is what `src/config.js`'s
`screenshotName` replaced. Assume students have no git.

**Licence hygiene.** `easings.js` carries a one-line credit; full terms live in
`LICENSES.md`. The curves are Penner's (BSD). Do not copy code from
easings.net — that site is GPL-3.0 and would infect a template students
redistribute.

**The template must run before any font is added.** `fonts.js` falls back to
`SYSTEM_FONT` (`'sans-serif'`) when the folder is empty. Preserve that path.

**Canvas is responsive by design** — `windowWidth`/`windowHeight` plus
`windowResized`. Students are building an interactive tool, not exporting to a
fixed poster size. Don't add fixed dimensions to the config.

## Known follow-ups

- The **text** control is a single-line lil-gui field. A multi-line textarea
  is wanted but deliberately deferred.
- Templates live on branches made from `main` (`sampled`, `shader`). Change
  `src/lib/` on `main`, then `git merge main` into each template. Keep
  `src/lib/` free of anything specific to one template; a template's controls
  go in `addControls()` in its `sketch.js`.
