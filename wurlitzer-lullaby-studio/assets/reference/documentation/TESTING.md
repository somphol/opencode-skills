# Testing

Four layers, no test framework dependency, no npm install.

## 1. Engine — 11 checks

```bash
node --test tests/engine.test.mjs
```

`tests/lib/fixtures.mjs` slices the `/* ENGINE:START */ … /* ENGINE:END */` block and the
`/* TRACKS:START */ … /* TRACKS:END */` block out of `script.js`, then runs them with `new Function`.
Covered: note maths, sequence parsing, all fifty lullabies (length, slot, bilingual metadata),
smoothstep endpoints/monotonicity, clock formatting, slot/rack agreement, manifest validation,
settings normalisation (including theme/text size), wrap-around stepping, export schema.

## 2. Repository — 12 checks

```bash
node --test tests/static.test.mjs
```

Checks file presence and size, HTML shell/meta/JSON-LD/import map pinning, duplicate ids, every
literal `$('…')` reference, EN/TH symmetry and static-key coverage, engine purity (no DOM/window/
THREE/fetch/Date), manifest validity and Wikimedia provenance, the documentation set and README links,
`state.json` fields, secret/home-path/IP patterns, and CSS tokens/breakpoints.

## 3. In-page — 27 checks

Open <http://localhost:8000/?selftest>. The overlay lists every check and sets
`body.dataset.selftest` to `passed/total`. It is also callable:

```js
await window.__wurlitzer.runSelfTest(true)
```

Covers WebGL, cabinet assembly, 44 bubbles, 30 bulbs, record/tone arm, fifty tracks, 32 archive performances, sequence
validity, unique slots, dictionary symmetry, 11 category tabs, 88 slots, 19 keys, manifest response, H–K mapping,
fade curve, clock, normalisation, audio graph, synth start/pause, timer fade, empty-slot rejection,
export payload, language switch, scene energy/dim, theme switch, text-size switch, first-listen queue, archive source link.

## 4. Headless browser — 27 checks

```bash
node tests/browser.test.mjs
TEST_URL=https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/ node tests/browser.test.mjs
```

The harness (`tests/lib/harness.mjs`) starts a static server on an ephemeral port and one headless
Chrome with:

```
--headless=new --no-sandbox --enable-unsafe-swiftshader
--use-mock-keychain --password-store=basic
--no-first-run --no-default-browser-check --disable-background-networking
--mute-audio --user-data-dir=<temp>
```

`--use-mock-keychain` and `--password-store=basic` are deliberate: without them macOS can prompt for
Keychain access repeatedly. The profile is temporary and deleted with the process. No credentials are
read.

The suite drives the page over the DevTools Protocol (`Runtime.evaluate`, `Page.captureScreenshot`,
`Emulation.setDeviceMetricsOverride`, `Emulation.setEmulatedMedia`) and asserts:

- boot: ready, WebGL, canvas, cabinet children, 8 active strips, 19 keys, manifest
- self-test 27/27 and dataset
- selecting A-2, now-playing/caption/status
- pause/resume, next/previous
- coin mode consumes a credit; free-play bypass
- empty D-8 rejection; keypad A-3 selection
- Thai switch updates `<html lang>`, rack, title; back to EN
- first-listen prompt starts the archive queue with a big title card and source link
- category tabs switch pages and rebuild the 3D rack
- title search finds a record in another collection
- theme switch reaches the scene; A++ text size updates the document
- favourite star + filter
- master knob keyboard change + aria value
- ambient rain slider and toggle
- timer 15 → debug 60 s gain ≈ 0.5 → 0 s end + dim → Off
- reload restores master/lang/favourites
- export button captures a JSON download
- help modal open/close
- mobile tabs open the rack and studio sheets
- reduced-motion emulation sets `body[data-motion="reduced"]`
- zero console errors / uncaught exceptions

## Expected results

| Layer | Checks |
| --- | --- |
| Engine | 11 |
| Repository | 12 |
| In-page | 27 |
| Browser | 27 |
| **Total** | **77** |

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Chrome not found` | `CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node tests/browser.test.mjs` |
| WebGL context fails | keep `--enable-unsafe-swiftshader`; try a non-headless Chrome |
| Manifest check fails | network blocked; Wikimedia is required for H-1…K-8 |
| CDN import fails | jsDelivr blocked; the app and browser suite need it |
| Timer assertion fails | check `fadeGain` still returns exactly 0.5 at 60 s |
| Keychain prompts | do not remove the mock-keychain flags |
| Static test lists missing docs | create the file or remove the entry from the test and README |

## Adding a test

- Pure rule → engine test, keep it inside the marker block.
- Shell/markup/docs rule → static test.
- A check a user can see → add it to `runSelfTest` and keep the count in `state.json`/README.
- A workflow → browser test, using `evaluate` and `waitFor`; never run a second Chrome instance.
