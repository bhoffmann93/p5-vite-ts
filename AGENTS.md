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
- **Keep the dependency list tiny** (`p5`, `tweakpane`, `vite`).
  A new dependency is a new thing that can fail on a student's laptop.
- Comments explain *why* in plain language. Keep that register.

## Rules

**Colours are RGB, never hex.** Write them as `{ r, g, b }` objects with each
channel 0–255 — in config, in `params`, in Tweakpane bindings and in `fill()` /
`background()` calls. No `'#ffffff'`, no `0xffffff`, no shorthand. Tweakpane
gives an `{ r, g, b }` object the same colour picker it gives a hex string, so
nothing is lost in the panel. RGB channels are what students can reason about
and animate one at a time; hex is opaque.

**No divider or banner comments, and no emoji.** No `// --- expo ---`, no
rules of dashes boxing a header in, no stars or warning signs in headings.
A comment is a sentence explaining why; decoration is noise.

**No magic numbers, but a value assigned to a well-named key is already named.**
`textSize: 250` and `{ min: 8, max: 400 }` need no constants; adding
`STARTING_TEXT_SIZE` or `MIN_TEXT_SIZE` only restates the key. A constant earns
its place when the number appears bare in an expression and its meaning cannot
be read off the line.

Arithmetic is not a magic number either: `width / 2` for a centre,
`padStart(2, '0')`, `getMonth() + 1` are idioms and stay. `const HALF = 0.5` is
the anti-pattern. If the name only restates the key or the operator, delete it.

**No abbreviated names.** `background`, not `bg`. `foreground`, not `fg`.
`value`, not `v`. The one exception is `p` for the p5 instance, which is the
convention in every p5 example and stays.

**Names say what the thing is.** `screenshotName`, not `projectName`, because
it names screenshots. `backgroundColor`, not `background`. If a name needs the
comment beside it to be understood, rename it.

## Layout

```
index.html          loads /src/sketch.js
vite.config.js      port 8080, publicDir 'static'
fonts/              student font files; scanned at build time
static/             served at / — favicon lives here, not at the root
LICENSES.md         third-party credits (eases/MIT, p5, Tweakpane, Vite)
src/
  config.js         screenshotName + starting RGB colours. Student-facing.
  sketch.js         the only file students edit
  lib/
    fonts.js        font discovery + async loading
    gui.js          Tweakpane panel and hotkeys
    export.js       timestamp() + savePNG()
    easings.js      31 easing curves from `eases`, v = ease(t)
```

Students edit `src/sketch.js` and `src/config.js`. When adding a feature,
prefer putting the *knob* in `sketch.js`'s `params` and the *wiring* in
`src/lib/`.

## Things that will bite you

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

- The **text** control is a single-line Tweakpane field. A multi-line textarea
  is wanted but deliberately deferred.
- `textToPoints()` / `textToContours()` examples are taught live during the
  week rather than shipped in the template.
