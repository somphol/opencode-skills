# Verification

Three layers, all dependency-free: pure engine tests, repository/static checks, and a real browser
suite. Plus an in-page self-test and generated screenshots.

The goal is not “some tests”. It is that every claim in the README is backed by a check that fails
when the claim becomes false.

## Layer 1 — engine

Slice the engine out of `script.js` (markers), evaluate it in Node, never import Three.js:

```js
export function loadEngine() {
  const source = readFileSync('script.js', 'utf8');
  const slice = source.split('/* ENGINE:START */')[1].split('/* ENGINE:END */')[0];
  return new Function(`${slice}\nreturn createPuzzle15Engine();`)();
}
```

Must include:

- goal, parity, known swapped pair, inversions
- Manhattan and linear-conflict values on hand-computed boards
- admissibility (`h ≤ BFS optimum`) on sampled boards
- legal-move degree at **every** blank cell + reversibility + illegal rejection
- 40 shuffles: permutation, solvable, never the goal
- 15 random boards: path valid
- **A* length equals BFS optimum at depths 1–7** (the key test)
- solved start, unsolvable, malformed
- no repeated state in a path
- heap ordering
- 72-step solve under a generous time budget

Use a local seeded RNG (`mulberry32`) so failures reproduce.

## Layer 2 — static / repository

Parse the real files:

- required files exist and are non-trivial
- HTML: doctype, `lang`, viewport, description, title, import map, module script
- exact pinned Three.js version; no `latest`/caret/unpkg
- every `$('id')` in the script exists; no duplicate ids
- EN/TH key sets identical; every `data-i18n`/`data-i18n-attr` key exists
- engine markers present and the slice has no import/export
- worker is built from `createPuzzle15Engine.toString()`, with a main-thread fallback
- CSS tokens, breakpoints, reduced-motion, no external `@import`
- docs/community files; relative Markdown links resolve
- `state.json` shape and line counts match the tree
- PNG assets are real PNGs; sitemap/robots/OG metadata
- CI runs the suites
- no tokens, private keys, emails or `/Users/…` paths
- no external `fetch`, `XMLHttpRequest`, analytics SDK

## Layer 3 — browser

Two helpers: a static server on an **ephemeral port** and one Chrome instance.

```js
// server
const server = createServer((req, res) => { /* serve ROOT with mime types */ });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
```

Why port 0: developer machines already have several servers running; a fixed port silently serves
the wrong project and produces impossible bugs (we hit this).

### Chrome flags

```text
--headless=new
--no-sandbox
--disable-dev-shm-usage
--enable-unsafe-swiftshader      # WebGL without a GPU
--use-mock-keychain              # no macOS Keychain prompts
--password-store=basic
--no-first-run --no-default-browser-check
--disable-background-networking --disable-component-update --disable-sync
--mute-audio
--user-data-dir=<temp>
--remote-debugging-port=<free port>
--window-size=1600,1000
```

One instance for the whole run. Launching Chrome repeatedly is slower and can prompt for Keychain
access each time.

### CDP client

Use Node’s built-in `WebSocket`; no puppeteer. Implement `send`, `on`, `once`, `waitFor` and collect
`Runtime.exceptionThrown`, `Runtime.consoleAPICalled` (type error) and `Log.entryAdded` (level error).

Navigation race: after `Page.navigate`, wait for `Page.loadEventFired`, then a short beat, then
`document.body.dataset.ready === "true"`. Evaluating too early hits the old execution context and
returns the previous page’s state.

### The checks that matter

- **Projected raycast click.** Project the tile’s world position, dispatch
  `mousePressed/mouseReleased`, assert `state.moves` incremented. This catches camera/rect offsets
  that DOM-only tests cannot.
- **Keyboard**: arrow key slides a neighbour.
- **Hint**: arrow SVG exists, assisted badge visible, solution length > 0.
- **Auto-solve**: reaches the goal, modal opens, streak untouched.
- **Language**: `<html lang>`, a button, a HUD label, a select option, and back to English.
- **Skins**: wood/marble change the texture uuid; custom upload from a generated canvas File.
- **Persistence**: reload restores board and moves.
- **Mobile**: 390×844, `scrollWidth - innerWidth ≤ 2`, stage height > 300, canvas rendered.
- **Errors**: zero console errors/exceptions.

Wait for `!state.animating` before clicking solver controls; `moves` increments before the slide
finishes.

### In-page self-test

`?selftest` runs ~17 checks (textures, WebGL size, i18n symmetry, ids, worker source parse, export
shape, storage round-trip, Three.js pinning) and mirrors the result to
`document.body.dataset.selftest`. The browser suite reads that instead of scraping the panel.

It complements, never replaces, the Node suites.

### Screenshots

One Chrome session, real interactions:

1. Load, shuffle, wait for drop-in, request a hint.
2. EN screenshot 1600×1000.
3. TH screenshot.
4. Capture the stage element by `getBoundingClientRect` (integer CSS px) as `stage.png`.
5. Social card page 1200×630 that embeds `stage.png`.
6. Mobile 390×844 after a reload and a shuffle; wait out the toast.

`Page.captureScreenshot` clip values must be integers inside the viewport. If you get “Invalid
parameters”, you are probably passing the whole CDP result object instead of its `result.value`.

## Acceptance numbers

| Layer | Count |
| --- | --- |
| Engine | 14 |
| Static | 17 |
| Node total | 31 |
| In-page | 17 |
| Browser | 46 |
| Console errors | 0 |

If a number changes, update README, TESTING, AGENTS and `state.json` together.

## Local + live

```bash
node --test tests/engine.test.mjs tests/static.test.mjs
node tests/browser.test.mjs
TEST_URL=https://<user>.github.io/<repo> node tests/browser.test.mjs
```

`TEST_URL` skips the local server and points the same 46 checks at the deployment. A local pass is not
a deployment check: CDN paths, relative assets and Pages caching only fail in the real host.

## Manual pass

1. Shuffle ten times: always solvable, never already solved.
2. Solve by hand: modal, best time, streak.
3. Solve with a hint: no record, Assisted badge.
4. Auto-solve 5×, stop mid-run, resume.
5. Thai on a 390px viewport: no clipped controls.
6. Reload mid-game: board and moves restored, clock paused.
7. Upload a portrait photo: slices correct, numbers legible.
8. Tab through: focus visible, Escape closes dialogs.

## What not to do

- Do not assert on animation timing; assert on state after a bounded wait.
- Do not use a fixed port.
- Do not launch a browser per check.
- Do not hand-edit screenshots.
- Do not weaken a test to make a release pass; fix the product or change the claim.
