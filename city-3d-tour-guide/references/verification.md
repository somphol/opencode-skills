# Verification

## What must be true

A release is not “the page loads”. It must prove construction, bilingual parity, every control, state
round-trips, release metadata and a live deployment.

## 1. Static scaffold check

```sh
node scripts/check.mjs --project ~/Projects/my-city
```

The skill ships a dependency-free check that verifies:

- required runtime files (`index.html`, `style.css`, `script.js`, README, licence, notices, screenshots)
- JavaScript syntax via `node --check`
- pinned Three.js r128 and OrbitControls CDN tags
- absence of PointerLockControls and presence of drag-look/pad/focus/marker-only code
- car component instancing and hip-roof usage
- five landmark ids, state key, export filename, 24-check self-test marker
- versioned `style.css?v=`/`script.js?v=` matching `APP.version`
- reference screenshots exist

Run it from a **fresh scaffold**, not only the source tree. The skill is not reusable until that copy
passes.

## 2. In-page self-test

```sh
python3 -m http.server 8000
open 'http://127.0.0.1:8000/?selftest=1'
```

Expected at this writing: **24 / 24**, zero runtime errors. It covers:

1. scene is built
2. five landmark groups
3. five 3D markers
4. five pick volumes
5. five labels
6. bilingual UI key parity
7. bilingual landmark parity
8. five ordered tour stops
9. three lighting presets
10. three camera modes
11. walk drag-look + zoom
12. walk collision field
13. traffic instances
14. river shader/time uniform
15. local state round-trip
16. export payload shape
17. export filename
18. note sanitisation
19. minimap canvas
20. audio synthesis class
21. no captured runtime errors
22. WebGL context
23. mode switching callable
24. language switching

A new city should add checks for its own landmark count, route order and language key parity rather
than lowering this count. Update this document and state metadata if the count changes.

## 3. Real browser flows

Use a hardware-accelerated Chrome/Safari/Firefox and test:

- loading → title → Enter; audio starts only after gesture
- drone: drag, wheel zoom, right-drag pan, recenter, fly-to
- walk: drag look (left drag → right side), pad, arrow keys, WASD, Shift, scroll zoom, collision,
  guide close/focus, marker-only click
- tour: start, first five seconds, stops 1–5, pause, next, replay, wheel zoom
- EN/TH with open drawer; no clipped Thai text at 430 px
- all three lighting presets, night car lights and temple floodlights
- visited/route/notes: reload and confirm; export file name; import on a clean profile
- mobile 430×900: mode switch, trail button, pad, drawer scroll
- no console errors

The documented defect history in [lessons.md](lessons.md) is the smoke-test list; re-run the specific
regressions after any control change.

## 4. Headless/automation notes

Headless Chrome with SwiftShader proves logic at a few FPS, not performance. It may report the page
hidden, pause `requestAnimationFrame` and blur the tab after synthetic key events. For walk tests:

- call `Emulation.setFocusEmulationEnabled({enabled:true})`;
- or use a headful Chrome with a fresh profile;
- inspect `window.Bangkok3D.getWalk()` (`keys`, position, blocked) and `getControls()`;
- dispatch real `Input.dispatchKeyEvent` or use the on-screen pad coordinates from
  `getBoundingClientRect()`.

A useful automation sequence:

1. navigate `?reset=1&autostart=1&mode=walk`;
2. wait for `window.Bangkok3D` and the loading layer to disappear;
3. dispatch a press/hold on `.pad-up` or `ArrowUp`;
4. confirm `camera.position` changes and `drawerOpen` is false;
5. click a blank scene point and confirm no guide opens;
6. project a marker anchor with `.project(camera)` and click it; the guide should open.

## 5. Screenshots

Use 1600×1000 desktop and 430×900 mobile. Capture after the loader is gone with a reset state:

```text
?reset=1&autostart=1
?reset=1&autostart=1&preset=golden
?reset=1&autostart=1&preset=night
?reset=1&autostart=1&mode=walk
?reset=1&autostart=1&mode=tour
?reset=1&autostart=1&drawer=wat-pho
?reset=1&autostart=1&lang=th&drawer=grand-palace
```

Compress to JPEG; do not commit raw PNG captures or browser profiles. Review composition: five
landmarks legible, labels not behind the topbar/panel, walk pad not overlapping the hint, drawer text not
cut off.

## 6. Release/live verification

- `node scripts/check.mjs --project .`
- in-page self-test on the live Pages URL
- `/`, `/style.css`, `/script.js`, `/state.json`, screenshots return 200
- Pages build reports **built**
- CI static workflow succeeds
- old cache cannot serve a stale pair: `style.css?v=`/`script.js?v=` match the version

## 7. Failure boundaries

- Software WebGL is slow; do not use it for FPS.
- Audio cannot be heard headlessly; only graph/class/no-exception is verified.
- Speech voices depend on the OS.
- The scene is stylised; screenshot review cannot prove geographic accuracy.
- A green suite can still ship a reskin. Re-author and review the city-specific content.
