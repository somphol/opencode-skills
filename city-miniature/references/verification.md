# Verification

## Without a browser

```sh
node tests/run.mjs
```

Bundles four tests with Vite and runs them under Node:

- `geometry` — landmark envelopes, ten building families, finite geometry, instanced transforms,
  LOD reduction, night material emission
- `life` — vehicle and boat counts, traffic stops at red lights, camera collision envelope
- `diversity` — landmarks differ geometrically, ten archetypes differ, anchors keep their block
- `planning` — connected road graph, parcel containment, no parcel overlap, road corridor clear,
  every crossing is a declared node

These are the fast checks; run them after every geometry change.

## Deterministic browser check

```sh
node scripts/verify.mjs [dist-single/index.html]
```

Loads the built file with `?capture=1` and advances virtual time with `window.__scene.step()`, so the
result does not depend on frame rate. It asserts:

- all eight landmark flights land within 0.05 units of their anchor, with `cameraClear`
- day and night easing reach their targets
- reset returns to the home pose, and the info card closes
- zoom, orbit, pan and auto-rotate change camera state
- scene facts (landmarks, road edges, vehicles, boats)
- no console errors, no external requests
- the Chinese locale renders localized labels
- the 345×345 embed hides the header and keeps every button inside the viewport

Environment: `SHOOT_ANGLE=swiftshader|metal` picks the ANGLE backend, `CHROME_PATH` the executable.
This is the check to trust on machines without a GPU.

## The full harness

```sh
npm run shoot -- --file dist-single/index.html
```

Serves the file on `127.0.0.1` under the Lab CSP and drives Chrome: pixel-diffed interactions at
1600×900, all landmarks, the sandbox variant, three layouts, fps thresholds, deterministic capture
and reduced motion.

It needs GPU-backed headless Chrome. On macOS without a working Metal path, Chrome falls back to
SwiftShader at ~2.5 fps and the wall-clock waits expire mid-flight, producing false failures such as
`landmark-detail … transition: true`. Use `verify.mjs` there, and say so in any report.

## Cover

```sh
npm run record -- --file dist-single/index.html --out film
ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames -of json film/film.mp4
```

Expect one h264 stream, 30 fps, 360 frames, 12 s, silent. Watch the whole clip: flights must not cut
through towers, and night must arrive before the final overview.
