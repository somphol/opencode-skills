# Lessons — what regressed and why

These are the expensive discoveries from the reference build. Read before changing the engine, scene
or release pipeline.

## 1. The backtracking tree crashed because the root key was `'0'`

The builder generated bit keys with:

```js
j.toString(2).padStart(d, '0')
```

For `d = 0`, `padStart(0)` returns `'0'`, not `''`. The depth-0 node was stored under `'0'`, then
overwritten by the depth-1 left child; the first edge's parent lookup was `undefined` and threw
`Cannot read properties of undefined (reading 'position')`.

Fix: `const bits = d === 0 ? [] : j.toString(2).padStart(d, '0').split('').map(Number);` and use `''`
as the root key, matching the engine's `bits` array.

Symptom: scene shows two stray spheres, platform missing, code panel keeps the previous pattern's
source while the caption says the new pattern. The latter is the next lesson.

## 2. A scene builder exception leaves a half-built stage and stale UI

`buildCurrent` does metadata → `scene.setPattern()` → `renderCode()`. If a builder throws, the
metadata/title/caption already changed but the code panel and step panel still show the previous
pattern. The half-built `dynamicRoot` remains. The browser probe reported “no console errors” because
it used `Runtime.evaluate` on a direct API call and ignored `exceptionDetails`.

Fix: wrap `scene.setPattern` in try/catch in the app (show a toast/fallback, still render code). In
tests, make the `evaluate` helper throw on `exceptionDetails`; capture `Runtime.exceptionThrown` too.

## 3. Shared label textures were disposed with the scene

`disposeObject()` originally disposed every material map. Label textures are cached by
`text|colour|bg|border|size` and reused across all scenes. Disposing one scene's labels broke every
subsequent label (black/empty sprites).

Fix: set `texture.userData = { key, shared: true }` and skip shared textures in disposal. Mesh
materials are still per-object and disposable.

## 4. Mark coverage is a three-language contract

The engine emitted `check` for Binary Search on Answer, but the JavaScript and C++ listings only had
`move`; the engine emitted `emit` for backtracking but C++ only had `check`. The test caught both.
When adding a mark to an engine, add it to all three listings. This is why frame marks are semantic,
not line numbers.

## 5. Label size was unreadable before the canvas change

The first label canvas was 512×192 with a 54 px font. On a distant tree, the label sprite was ~0.3
units tall, so the text was 3–4 px. The fix was both structural and local:

- canvas 512×160 with a 68 px default font, text baseline at 84;
- sprite height factor `0.3125` of width instead of `0.375`;
- larger scene-specific scales for tree nodes (1.55), backtracking nodes (1.15–1.35) and linked-list
  nodes (1.12);
- tree camera closer (`[0,6.6,15.5]`).

If labels look like dark boxes with a faint smudge, the font-to-sprite ratio is wrong, not the camera.

## 6. Counts drift faster than code

The first docs claimed 86 checks (27 + 35 + 24) while the actual static suite had 20 tests. The real
total is 106 (27 engine + 20 static + 35 browser + 24 in-page). Update every occurrence — README
badge/table, AGENTS, TESTING total, docs/README, REPRODUCTION gate, ROADMAP and state — in the same
change. The static test asserts state total ≥ 100, not a stale number.

## 7. Test expectations can be wrong, not the engine

The custom-input browser test expected `[1,3]` for `1,3,4,7,9 | 10`; the correct pair is `[0,4]`
(`1 + 9`). The engine was right. Verify the expected value by hand before “fixing” code. Similarly,
`1,2,3 | 5` has no root-to-leaf path (the paths sum to 3 and 4); use target 4 or a deeper tree.

## 8. The loading overlay did not hide on success

`scene.init()` appends the canvas under the loading overlay. The app only hid the overlay in the
failure path, so the first release would show “Building the 3D stage…” forever despite a live canvas.
Hide it immediately after `sceneReady` is true. The browser suite now checks
`#stage-loading.is-hidden`.

## 9. `role="tab"` also counts language tabs

The static test expected 3 role=tab elements but the HTML has 3 top-level tabs + 3 language tabs = 6.
Assert `data-tab="..."` count = 3 instead, or scope the selector to the main tab bar.

## 10. GitHub git auth is Basic, not Bearer

The REST API accepted `Authorization: Bearer <token>`, but `git push` over HTTPS rejected it (“invalid
credentials”). Use:

```sh
AUTH=$(printf 'x-access-token:%s' "$TOKEN" | base64)
git -c http.extraheader="Authorization: Basic $AUTH" push -u origin main
```

Do not put the token in the remote URL or print it. Read it once from the login Keychain into a
`chmod 600` temp file, use it for the repo + Pages + skill pushes, then delete. This keeps the macOS
Keychain prompt count to one.

## 11. Pages needs the branch before the Pages API

`POST /repos/:owner/:repo/pages` returned `422 The main branch must exist` because it ran before the
first push. Order is: create repo → push `main` → create Pages. Poll `GET /pages` until
`status: built`; the first build took ~90 s. Then run the live browser suite.

## 12. The social card cropped the product screenshot

The OG frame was 600×470 (ratio 1.28) showing a 1600×1000 screenshot (1.6); `object-fit: cover` cut
off the brand and rail. Set the frame to 600×375 (1.6) so the screenshot fits without side crop.
Regenerate the card after any hero screenshot change.

## 13. Deterministic tests need `?test=1`

The quiz shuffles only on a user-triggered “fresh round”. `?test=1` disables shuffling so the browser
suite can look up the correct answer by `state.quiz.order[index]`. Do not make the initial round
random; it makes the suite flaky for no product benefit.

## 14. Do not report placeholder state as final

`state.json` starts as a placeholder so static tests can run. Replace it after the skill is published:
query `session_v2` for the real token counters/elapsed time, record the live verification count,
artifact list and line counts, then commit. A placeholder that ships is a false build record.

## 15. Browser harness flags matter

`--use-mock-keychain --password-store=basic` prevents macOS Keychain prompts during Chrome launch.
The harness uses a temp profile and its own static server. Without these flags, repeated runs can
trigger credential dialogs and hang CI.
