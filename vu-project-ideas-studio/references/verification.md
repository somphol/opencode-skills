# Verification

## Gates

```sh
python3 scripts/build.py
npm test
npm run test:browser
```

Expected for the reference: **365 static checks** and **31 browser checks**, zero console errors. A
catalog with a different number of briefs will have a different static count; update the claim rather
than the check.

## Static gate (`scripts/verify.mjs`)

No browser. Loads `data/projects.js` in a Node `vm` with `window = {}` and checks:

### Data
- `window.VU_DATA` exists.
- 54 projects, unique ids and titles, sequential numbering.
- 9 tracks, every track used.
- Exactly one `{{TITLE}}`; current prefix wording and divider.
- Required metadata on every project.
- Task > 200 chars; no request prefix inside a task.
- Word count matches the task body.
- Live URLs are HTTPS.
- Stack and features are non-empty.

### Generated prompts
- 54 files, every file exists.
- Every file contains the exact composed full prompt.
- No unsubstituted `{{TITLE}}`.

### Feed
- `catalog.json` counts match.
- Task bodies are omitted.

### Site
- Grid, dialog and prefix block exist.
- Data script loads before the app.
- No external scripts or font imports.
- No inline handlers or `javascript:` links.
- Clipboard fallback, deep links and both storage keys are present.

### Release
- Required files exist (README, AGENTS, 14 docs, scripts, tests, screenshots, sitemap).
- `state.json` has the model, OpenCode credit, a summing usage block and a Pages target.
- README/AGENTS/sitemap/prompt index/catalog table are coherent.
- Credential scan over shipped files.

## Browser gate (`tests/browser.test.mjs`)

1. Start a static server on a random port (unless `TEST_URL` is set).
2. Launch Chrome with a temp profile, `--use-mock-keychain`, remote debugging.
3. Connect over WebSocket, enable Page/Runtime/Log.
4. Navigate, wait for `window.__vuReady`.
5. Run 31 checks.
6. Write seven screenshots unless `--no-shots`.
7. Close Chrome and delete the profile.

Checks: boot; 54 cards; 54 projects; 10 track chips; search; result count; track filter; stack filter;
favorite persistence; shortlist counter and filter; drawer open/title; prefix once; task present; hash;
glance tab; stack chips; source label; close; hash cleared; deep link title; theme toggle; mobile page
overflow; mobile drawer overflow; prompt fit; console errors; missing same-origin files.

### CDP essentials

```js
await send("Emulation.setDeviceMetricsOverride", {
  width: 390, height: 844, deviceScaleFactor: 1, mobile: true,
  screenWidth: 390, screenHeight: 844,
});
```

Do not use `--window-size` for mobile. Wrap evaluate snippets in an IIFE. Collect
`Runtime.exceptionThrown`, `Runtime.consoleAPICalled` (type `error`) and `Log.entryAdded` (level
`error`). Fail on any.

### Screenshots

`assets/studio.png`, `studio-dark.png`, `library.png`, `detail.png`, `mobile.png`,
`mobile-detail.png`, `og-card.png`. The OG card is 1200×630.

### Live run

```sh
TEST_URL=https://somphol.github.io/your-repo/ node tests/browser.test.mjs --no-shots
```

The live run uses the same 31 checks and does not rewrite screenshots.

## Chrome discovery

Order: `$CHROME`, macOS app path, `google-chrome`, `chromium`, `chromium-browser`. Set `CHROME`
explicitly in CI if needed.

## Manual pass

Automated checks cannot judge:

- whether the taglines are good;
- whether the track assignment makes sense;
- whether a copied prompt reads cleanly in a real editor;
- whether the drawer feels right on a phone;
- whether dark mode is comfortable.

Do those by hand before release. Copy from a card, from the drawer and from the prefix card.

## What the gate cannot prove

- Every task is semantically complete (only length and prefix absence).
- Accessibility conformance (no axe/Lighthouse run).
- Safari/Firefox rendering (manual only).
- The linked demos still work (manual).
- The token total is current (it is a snapshot).
