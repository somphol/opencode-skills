# Testing

## Gate

```bash
npm test           # static, no browser
npm run test:browser
npm run verify     # both
```

`npm test` runs `scripts/verify.mjs`. It reads the generated payload in a Node VM, so there is no DOM
or browser dependency. It fails on the first category only in the summary; every failed check is
printed.

### Static checks

- `window.VU_DATA` parses, 54 projects, unique ids and titles, sequential numbering.
- 9 tracks and every track is used.
- One `{{TITLE}}` placeholder; current prefix wording and divider intact.
- Required metadata on every project; task > 200 chars; no request prefix inside a task.
- Word counts match the task body; live URLs are HTTPS.
- Stack and feature chips are non-empty.
- 54 prompt files exist, match the composed full prompt, and contain no unsubstituted placeholder.
- `catalog.json` counts match and omit task bodies.
- The HTML shell has the grid, dialog and prefix block; data loads before the app.
- No external scripts or fonts; no inline event handlers; no `javascript:` links.
- Clipboard fallback, deep-link support and both storage keys are present.
- Release files exist, `state.json` adds up, the Pages target is correct.
- README/AGENTS/sitemap/prompt index/catalog table are coherent.
- Credential scan over shipped files.

### Browser checks (31)

`tests/browser.test.mjs` starts a local static server, launches Chrome with a temporary profile and
`--use-mock-keychain`, then drives it over the DevTools Protocol.

| Area | Checks |
| --- | --- |
| Boot | page ready, 54 cards, 54 projects exposed, 10 track chips |
| Search | narrows to one, finds “Snooker”, result count updates |
| Track | Games shows 11 |
| Stack | Cannon.js filter returns briefs |
| Shortlist | favorite persists, counter updates, filter shows one |
| Drawer | opens, title matches, current prefix present once, task verbatim, hash written |
| Glance | tab opens, stack chips and source label present |
| Close button | closes the dialog, clears the hash |
| Deep link | `#p/…` opens the right brief |
| Theme | toggles to dark |
| Mobile 390 px | no page overflow, no drawer overflow, prompt fits |
| Console | zero console errors, no missing same-origin files |

Screenshots are rewritten on every run: `assets/studio.png`, `studio-dark.png`, `library.png`,
`detail.png`, `mobile.png`, `mobile-detail.png`, `og-card.png`.

## Running against the live site

```bash
TEST_URL=https://somphol.github.io/vu_project_ideas/ node tests/browser.test.mjs --no-shots
```

`--no-shots` skips screenshot writes, so the live run does not dirty the working tree. The suite still
starts a temporary Chrome profile.

## Chrome discovery

Order: `$CHROME`, the standard macOS app path, `google-chrome`, `chromium`, `chromium-browser`.
Override explicitly if needed:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run test:browser
```

## Why the harness uses CDP

Chrome headless clamps `--window-size` to roughly 500 CSS px. A `--screenshot` at 390 px is a **500 px
layout cropped to 390**, which hides real overflow. The harness calls
`Emulation.setDeviceMetricsOverride` with `width: 390, height: 844, mobile: true` and then asserts:

- `documentElement.scrollWidth - clientWidth <= 0`
- `.detail-scroll.scrollWidth - clientWidth <= 0`
- the prompt's `getBoundingClientRect().right <= innerWidth`

This is also why top-level `const` declarations are wrapped in IIFEs: `Runtime.evaluate` shares the
global lexical scope between calls.

## Manual pass

Automated checks do not judge taste. Before a release, also:

1. Open the live site on a phone-sized window and a desktop window.
2. Copy from a card, from the drawer, and from the prefix card; paste into a plain editor.
3. Confirm a copied prompt has one prefix, then `===========`, then the task.
4. Toggle dark mode, reload, confirm it persists.
5. Star two briefs, reload, confirm the shortlist count and filter.
6. Open a deep link in a new tab; confirm the drawer and the correct title.
7. Download a `.md`, open it on GitHub or in an editor.
8. Check that “Live” cards open their demos in a new tab.

## Known limitations

- The browser suite runs Chrome only; Safari and Firefox are checked manually.
- There is no visual-regression diff; screenshots are inspected by a human.
- The static gate cannot prove every task is semantically complete, only that it is present, long
  enough and free of the request prefix.
- No Lighthouse score is claimed; the site has no network content, but a lab score depends on the host
  and device.
