# Verification

Four layers. The counts below are the reference build; keep claims in sync with reality.

## 1. Engine — 13 checks

```sh
node --test tests/engine.test.mjs
```

Fixture:

```js
const block = source.slice(
  source.indexOf('/* ENGINE:START */') + '/* ENGINE:START */'.length,
  source.indexOf('/* ENGINE:END */')
);
const factory = new Function(`${block}; return createDrawEngine;`)();
```

Cover: contract, slice partition, pointer round trips, forward-only targets (1 000), normalised rotation,
seeded uniformity (40 000 picks), injected pick edge cases, roster normalisation, arrays/control
chars/cap, smoothstep, CSV escaping, JSON schema, full simulated draws.

## 2. Repository — 22 checks

```sh
node --test tests/static.test.mjs
```

Checks: source files, HTML shell, pinned import map, ids/references, i18n parity, static keys, engine
markers/purity, remote resources, docs set, relative links, community files, state session/credits,
state line counts, listed artifacts, screenshots/OG/favicon, deployment metadata, CI, templates, CSS
responsive/reduced motion, secrets, no `innerHTML`, storage/export contract.

## 3. In-page — 18 checks

Open `/?selftest`. The overlay reports and `document.body.dataset.selftest` becomes `"18/18"`.

Covers the real canvas/scene: slice coverage, resolution, forward turns, seeded uniformity,
normalisation, control chars, CSV, JSON, dictionary parity, DOM translation coverage, pinned version,
unique ids, wheel geometry, texture repaint, storage round trip, history shape, spin button state.

## 4. Browser — 18 checks

```sh
node tests/browser.test.mjs
TEST_URL=https://somphol.github.io/full-3d-lucky-draw-studio/ node tests/browser.test.mjs
```

Harness: a dependency-free static server plus a raw CDP WebSocket client. Launch Chrome with:

```
--headless=new --no-sandbox --disable-dev-shm-usage --enable-unsafe-swiftshader
--use-mock-keychain --password-store=basic --no-first-run --no-default-browser-check
--disable-background-networking --disable-component-update --disable-sync --mute-audio
--user-data-dir=<temp> --remote-debugging-port=<free> --window-size=1600,1000
```

`--use-mock-keychain` is mandatory on macOS: it prevents repeated Keychain prompts. Create a new page
with `PUT /json/new?about:blank`.

Checks: boot/WebGL, self-test, quick slots, bulk, duplicates, preset, spin resolution, remove, keep,
Thai, exports, settings, auto-remove, reload restore, clear-log arming, mobile drawer, reduced motion,
zero console errors.

## Handshakes

- `body.dataset.ready === "true"` after two frames.
- `body.dataset.webgl` true/false.
- `body.dataset.selftest` `"passed/total"`.
- `window.__luckyDraw` exposes engine, state, studio, setters, spin, exports, selftest.

## Test-writing rules

- Assert state and engine results, not pixel positions.
- Always assert `resolved === winnerIndex` after a spin.
- Reset or isolate storage per suite run; the temp Chrome profile gives a clean slate.
- Use `download: false` when testing exports to avoid OS download dialogs.
- For reduced motion, emulate the media feature and assert the confetti canvas stays 0×0.
- Keep console error capture on `Runtime.consoleAPICalled`, `Runtime.exceptionThrown` and
  `Log.entryAdded`.

## Release gate

```sh
cp script.js /tmp/script.mjs && node --check /tmp/script.mjs
node --test tests/engine.test.mjs tests/static.test.mjs
node tests/browser.test.mjs
node scripts/screenshot.mjs
```

Then the live suite. If any count changes, update README, AGENTS, docs/TESTING and `state.json`.
