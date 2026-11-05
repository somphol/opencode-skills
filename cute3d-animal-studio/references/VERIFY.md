# Verification

## Four layers

| Layer | Command | Expected |
| --- | --- | --- |
| Engine | `node --test tests/engine.test.mjs` | 19/19 |
| Repository | `node --test tests/static.test.mjs` | 76/76 |
| Browser | `node tests/browser.test.mjs` | 23/23, zero console errors |
| In-page | `/?selftest` | 19/19 |
| Live | `TEST_URL=https://… node tests/browser.test.mjs` | 23/23 |

Run `npm run verify` for engine + repository + browser.

## Engine

Slices `script.js` between `ENGINE` markers and evaluates it with `new Function`. Covers lists,
palettes, hex parsing, mixing/shading, blink envelope, expression poses, preset sanitising, snapshot
filenames, share round-trip, sound patterns, size clamping and EN/TH parity.

## Repository

Checks files, the HTML shell, all `data-i18n` keys, banned asset extensions and trackers, a trademark
blocklist, engine markers, storage namespace, snapshot contract, accessibility hooks, manifest,
robots/sitemap, `state.json` shape and **source line counts**.

Keep `state.json` current or this layer fails by design.

## Browser

A dependency-free CDP harness parses `tests/lib/harness.mjs`:

- starts a static server on a random port;
- launches headless Chrome with `--use-mock-keychain --password-store=basic --mute-audio` and a
  temporary profile (no macOS Keychain prompts);
- evaluates JS, clicks elements, dispatches mouse events and downloads files.

Key assertions: canvas, four distinct rigs, eye scale changes, live material colour, accessory
visibility, Thai translation, preset persistence, reaction jump/spin, raycast tap, transparent
snapshot, downloaded filename, share round-trip, keyboard, reload persistence, mobile sheet,
reduced motion and zero console errors.

## In-page self-test

`/?selftest` builds all four rigs, renders a 512² snapshot, validates dictionary parity,
sanitisation and share encoding, then shows a 19-row overlay and sets `window.__selftest`.

## Live release gate

```bash
TEST_URL=https://somphol.github.io/your-repo/ node tests/browser.test.mjs
```

Do not announce a release until this passes 23/23. The transparency and download checks work against
Pages.

## Visual regression

`node scripts/screenshot.mjs` regenerates the eight assets from the real render, including the
1200×630 OG card composed in-page. Commit the new images with any visual change.

## Hello-world checks

```js
window.__cute3d.ready
window.__cute3d.meshCount()
window.__cute3d.getRig().accessories.partyHat.visible
window.__cute3d.snapshotDataUrl()
await window.__cute3d.runSelfTest()
```
