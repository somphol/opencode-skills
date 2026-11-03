# Verification

## City-specific targets

The verification **approach** is reusable; the expected values are not. Write new landmark camera
targets, envelopes, facts, locale checks and embed sizes for the target city. Do not copy another
city's targets or claim its green run proves the new city.

The reference reports 20/20; the Bangkok from-scratch build reports 22/22. Your count depends on the
checks you add, not on the reference.

## Without a browser

```sh
node tests/run.mjs
```

The reference bundles four tests with Vite and runs them under Node:

- `geometry` — landmark envelopes, ten building families, finite geometry, instanced transforms,
  LOD reduction, night material emission
- `life` — vehicle and boat counts, traffic stops at red lights, camera collision envelope
- `diversity` — landmarks differ geometrically, ten archetypes differ, anchors keep their block
- `planning` — connected road graph, parcel containment, no parcel overlap, road corridor clear,
  every crossing is a declared node

For a new city, write the equivalents with the target's anchors, envelopes and families. At minimum:

- every parcel is on land, clear of roads and reserved sites, and does not overlap another parcel;
- the road graph is one connected component; every bridge starts and ends on land and has a water
  midpoint;
- every landmark has finite, non-singular geometry inside its envelope;
- the ordinary building families have distinct geometry.

## Deterministic browser check

```sh
node scripts/verify.mjs [dist-single/index.html]
```

Loads the built file with `?capture=1` and advances virtual time with `window.__scene.step()`, so the
result does not depend on frame rate. A complete check asserts:

- all landmark flights land within 0.05 units of their target, with `cameraClear`;
- the chosen button, `aria-pressed` and info card agree with the selected id;
- day and night easing reach their targets;
- reset returns to the home pose, and the info card closes;
- zoom, orbit, pan and auto-rotate change camera state;
- scene facts (landmarks, road edges, vehicles, boats, buildings);
- no console errors, no external requests;
- each target locale renders localized labels;
- the 345×345 embed hides the header and keeps every button inside the viewport.

Environment: `CHROME_PATH` selects the executable; the script also checks Playwright's cached
browser. On a machine without a GPU-backed headless path, use SwiftShader. The Bangkok example runs
this check in Linux CI; the San Francisco reference is verified locally with SwiftShader. This is the
check to trust when `shoot` cannot pass.

## The full harness

```sh
npm run shoot -- --file dist-single/index.html
```

Serves the file on `127.0.0.1` under the Lab CSP and drives Chrome: pixel-diffed interactions at
1600×900, all landmarks, the sandbox variant, three layouts, fps thresholds, deterministic capture
and reduced motion.

It needs GPU-backed headless Chrome. On macOS without a working Metal path, Chrome falls back to
SwiftShader at ~2.5 fps and the wall-clock waits expire mid-flight, producing false failures such as
`landmark-detail … transition: true`. Use the virtual-time check there, and say so in any report.

## Cover

```sh
npm run record -- --file dist-single/index.html --out film
ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames -of json film/film.mp4
```

Expect one h264 stream, 30 fps, 360 frames, 12 s, silent. Watch the whole clip: flights must not cut
through towers, and night must arrive before the final overview.

## Visual review

A green suite does not prove the composition looks right. Review the day/night overview and one
image per landmark. If the overview does not read as the target city before the title, the scene is
not finished.
