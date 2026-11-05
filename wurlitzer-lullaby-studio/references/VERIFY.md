# Verification reference

## The four layers

| Layer | File | Count | What it catches |
| --- | --- | --- | --- |
| Engine | `tests/engine.test.mjs` | 10 | note maths, tracks, fade, slots, manifest, settings, stepping, export |
| Repository | `tests/static.test.mjs` | 12 | files, shell, pinning, ids, i18n, engine purity, docs, state, secrets, CSS |
| In-page | `?selftest` / `runSelfTest()` | 23 | WebGL, scene, audio graph, timer, empty slot, language, scene state |
| Browser | `tests/browser.test.mjs` | 22 | real DOM, interactions, reload, mobile, reduced motion, console |

Expected total: 67.

## Harness

`tests/lib/harness.mjs` is dependency-free:

- `startServer(root)` — static server, correct MIME, no-store, 404s outside root;
- `launchBrowser()` — one headless Chrome, `--headless=new --no-sandbox
  --enable-unsafe-swiftshader --use-mock-keychain --password-store=basic --mute-audio`, temporary
  profile, free debugging port;
- `connect(wsUrl)` — minimal CDP client with `send`, `on`, `waitFor`, `once`.

Why mock keychain: on macOS, Chromium otherwise asks the Keychain for encryption keys on every
launch. That blocks automation and is noisy. The temporary profile means no user data is touched.

## Fixtures

`tests/lib/fixtures.mjs` slices marker blocks:

```js
const engineBlock = () => slice(read('script.js'), '/* ENGINE:START */', '/* ENGINE:END */');
const tracksBlock = () => slice(read('script.js'), '/* TRACKS:START */', '/* TRACKS:END */');
export const loadEngine = () => new Function(`${engineBlock()}; return { ... };`)();
export const loadTracks = () => new Function(`${engineBlock()}\n${tracksBlock()}; return BUILTIN_TRACKS;`)();
```

Never move DOM or Three code into those blocks. The static test checks forbidden identifiers.

## Boot contract

The app sets:

| Dataset | Meaning |
| --- | --- |
| `body.dataset.ready = "true"` | manifest attempted, loading complete |
| `body.dataset.webgl = "true"` | scene constructed |
| `body.dataset.manifest = "ok" \| "error"` | archive fetch result |
| `body.dataset.lang` | `en` / `th` |
| `body.dataset.motion` | `full` / `reduced` |
| `body.dataset.selftest` | `passed/total` after the in-page suite |

Browser tests wait for `ready` and `manifest !== undefined` before asserting.

## Browser test pattern

```js
const navigate = async (q) => {
  await cdp.send('Page.navigate', { url: `${base}/${q}` });
  await cdp.waitFor('document.body.dataset.ready === "true"');
  await cdp.waitFor('document.body.dataset.manifest !== undefined');
  await sleep(500);
};
```

Use `evaluate` for DOM state, real `.click()` calls for behavior, and `waitFor` for async effects.
For a promise-returning check, evaluate `fn().then(r => JSON.stringify(r))`; `JSON.stringify(promise)`
is `{}` and is the classic false pass.

## In-page checks

23 checks:

1. WebGL context
2. cabinet children ≥ 30
3. bubbles ≥ 40
4. 30 bulbs
5. record + tone arm
6. 8 built-in tracks
7. every sequence > 12 notes, duration > 8 s
8. unique slots
9. dictionary symmetry and ≥ 90 keys
10. 16 strips
11. 12 keys
12. manifest responded
13. C slots mapped
14. fade 120/60/0
15. clock formatting
16. settings normalisation
17. audio graph
18. synth start/pause
19. timer 15 → 60 s gain 0.5
20. D-8 rejected
21. export payload
22. language switch
23. scene energy/dim

## Console errors

Collect `Runtime.exceptionThrown`, `Runtime.consoleAPICalled` with type `error`, and `Log.entryAdded`
with level `error`. The final check asserts an empty array. Do not ignore known errors; fix them
(for example, guard `navigator.vibrate` behind user activation).

## Live suite

```sh
TEST_URL=https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/ node tests/browser.test.mjs
```

Pages CDN can serve a stale commit for ~30–90 s; verify the live HTML contains the expected title.
Run the live suite after the Pages build says `built`, not immediately after the push.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Chrome not found` | set `CHROME`; on macOS the default path is in `findChrome` |
| timeout waiting for ready | check `?selftest`; module import failed or WebGL unavailable |
| manifest error | network blocked; Wikimedia required for C tracks |
| timer test fails | `fadeGain` changed; it must be 0.5 at 60 s |
| reload test fails | localStorage key or `normalizeSettings` changed |
| keychain prompt | mock-keychain flags removed |
| browser check 22 fails | a real console error; read the collected text |
