---
name: Calibre Scroll Studio
description: Build a release-grade, zero-asset Three.js luxury watch that disassembles over scroll — procedural case, dial and movement, normalized scroll timeline, two-stage explosion, callouts, mobile layout, a 24-check headless gate, docs and GitHub Pages.
version: 1.0.0
---

# Calibre Scroll Studio

Turn “a luxury watch disassembles as you scroll” into a finished static product: a procedural
mechanical watch, an editorial single-page shell, a scroll timeline that explodes and reassembles it,
and a release gate that makes the whole thing defensible.

The reference is **Aurelis Calibre 07 — Anatomy of a Second** — 24/24 headless checks, 103 draw calls,
131k triangles, zero external runtime requests. It was built in one OpenCode session with DeepSeek
V4.1 Flash from a 17-word brief. The complete working site is in
[`assets/aurelis-calibre-07/`](assets/aurelis-calibre-07/).

- Live: <https://somphol.github.io/aurelis-calibre-07/>
- Catalog: <https://somphol.github.io/opencode-skills/>

## When to use

Use this skill when the user wants:

- a single-page 3D product story driven by scroll, not a game or a dashboard;
- a procedural object that can be taken apart and put back together;
- a luxury, editorial or museum-grade presentation with a defined art direction;
- a static, backend-free site that must work offline after load;
- a release-grade repo with a headless gate, screenshots, docs, a session ledger and Pages.

Do **not** use it for a real e-commerce configurator, an accurate watch/movement simulator, a
multiplayer product, a data-heavy dashboard or a mobile game. The template is opinionated: a single
fixed stage, one scroll timeline, a fictional brand.

## What “done” means

| Gate | Command | Expected |
| --- | --- | --- |
| Release | `npm run verify` | 24/24, zero console errors, 8 screenshots |
| Offline | gate check #3 | no external runtime requests |
| Reassembly | gate check #10 | every part within 0.05 of base at `t=1` |
| Budget | gate check #18 | < 400 draw calls, < 600k triangles at `.75` |
| Mobile | checks #19–22 | 390 × 844, no overflow, heading below the watch |
| Reduced motion | check #23 | timeline still usable; no smooth scroll |
| Ledger | `npm run state` | `STATE.md` + `state.json` from the OpenCode DB |
| Docs | README, AGENTS, docs/, community files | links resolve, no personal data |
| Deploy | Pages `main` / root | 200 for `/` and assets |
| Handoff | AGENTS.md in the same push | current |

## Scaffold

```sh
node scripts/new-project.mjs --out ~/Projects/my-watch
cd ~/Projects/my-watch
npm install
npm run verify          # 24 checks + screenshots
python3 -m http.server 4173
```

`npm run verify` needs Chrome; set `CHROME_PATH` if it is not found. `npm run state` is
OpenCode-specific: it reads the current session database read-only and writes the ledger. It is safe
to delete both if the project is not built inside OpenCode.

The template is a complete working site. **Change the brand, dialect and palette before touching the
timeline.** The composition at `t=.5` and `t=.75` is the visual contract.

## Module map

```
index.html                  shell, five chapters, rail, callouts, two dialogs, import map
styles.css                  tokens, fixed stage, scrims, callouts, responsive, dialogs
src/main.js                 renderer, environment, camera/timeline, labels, UI, dialogs
src/watch.js                procedural watch and part choreography
src/environment.js          PMREM studio + material palette
scripts/verify.mjs          self-contained server + 24-check Chrome gate
scripts/state.mjs           OpenCode ledger → STATE.md / state.json
scripts/shoot.mjs           ad-hoc ?t= frames
vendor/three.module.min.js  pinned Three.js r170
fonts/                      self-hosted Bodoni Moda (OFL)
assets/aurelis-calibre-07/  the reference project
references/                 the knowledge that is expensive to rediscover
```

## The hard recipes

### 1. One normalized timeline

Do not drive the 3D from raw scroll. Measure the chapter centres and normalize:

```js
anchor[i] = chapter[i].offsetTop + chapter[i].offsetHeight / 2 - innerHeight / 2;
t = clamp((scrollY - anchor[0]) / (anchor[4] - anchor[0]), 0, 1);
progress += (target - progress) * (1 - Math.exp(-dt * 5.6)); // damp
```

Chapter centres become `t = 0, .25, .5, .75, 1`. Every camera key, part window, label window and copy
opacity uses that same `t`. `?t=` must set manual mode **and** scroll the page to the matching anchor,
or the copy and the 3D state disagree in screenshots.

### 2. Fixed stage, not sticky

A sticky canvas consumes a viewport of document flow and pushes the first chapter below the fold. Use:

```css
.stage { position: fixed; inset: 0; z-index: 0; }
.chapter { position: relative; z-index: 2; }
```

### 3. Two-stage parts

Each top-level part carries a base transform, a first window/delta and an optional second
window/delta, then a retraction:

```js
first   = smoothstep(window[0], window[1], t);
second  = lateWindow ? smoothstep(lateWindow[0], lateWindow[1], t) : 0;
hold    = 1 - smoothstep(.815 + delay, .955 + delay, t);
pos     = base + delta * first * hold + late * second * hold;
```

At `t = 1` every part must be at base. This is the most important invariant.

### 4. The case leaves as a shell

Keep caseband, bezel, crystal, lugs and crown on one delta/window (`t ≈ .55–.75`). The movement then
keeps a frame while the dial is already removed. Caseback + rotor share a delta so the rotor stays in
the exhibition back.

### 5. Hands ride the dial

When the dial lifts, the hour/minute/second pivots must use the same late position and rotation as the
dial (within 0.05). Hands floating alone read as a bug, not an exploded view.

### 6. Dial on a flat circle

A cylinder cap's UVs are not screen-aligned; the artwork will be rotated 90°. Use a flat
`CircleGeometry` face over a thin cylinder body.

### 7. Labels

Project each 3D anchor every frame; fade by window; flip near the right edge; test a ~182 × 36 box
against previously placed labels and nudge vertically. Hide callouts below 1200 px. Measure the text
element, not the zero-size container.

### 8. Mobile

Below 900 px: hide rail/callouts/facts, anchor copy to the bottom, place the watch in the upper half,
lift and shrink the group during exposure, and lift/shrink again at the finale. Check 390 × 844.

### 9. Environment without files

Bake a small emissive panel scene with `PMREMGenerator.fromScene`; it gives polished metal long
highlights without an HDR. Keep no shadow maps; the budget is better spent on geometry.

## Failure boundaries

- **No external runtime requests.** No CDN, no Google Fonts, no Unsplash, no HDR. Vendor Three.js and
  fonts; the gate fails on external URLs.
- **No build step.** Plain ES modules and an import map. Do not introduce a bundler.
- **No photographic or GLB assets.** The no-asset constraint is the design.
- **Do not use a 70° side view for the explosion.** The depth stack collapses into a line. Stay near
  40° and fan the parts laterally.
- **Do not separate big discs vertically by their diameter.** They clip or force a distant camera. Group
  the case, fan the movement, keep the dial upper-right.
- **Do not hand-edit the session ledger.** Generate it with `npm run state`.
- **Do not claim Safari/Firefox support** unless you actually test it.
- **The brand is fictional.** Do not use third-party watch marks, photography or trade dress.

## References

- [`references/source-brief.md`](references/source-brief.md) — the one-sentence experiment and what to
  preserve in the docs.
- [`references/method.md`](references/method.md) — construction order, invariants, customization.
- [`references/geometry.md`](references/geometry.md) — unit system, watch parts, dial, materials, bugs.
- [`references/timeline.md`](references/timeline.md) — windows, camera keys, reassembly, mobile.
- [`references/verification.md`](references/verification.md) — the 24 checks and how to repair failures.
- [`references/lessons.md`](references/lessons.md) — regressions and dead ends.
- [`references/release.md`](references/release.md) — docs, ledger, Pages, catalog publishing.
- [`references/build-log.md`](references/build-log.md) — the honest chronology.

## Attribution

Original study and template: **Aurelis Calibre 07 — Anatomy of a Second**, built with OpenCode 2.2.6
and DeepSeek V4.1 Flash from a one-sentence prompt. Three.js r170 (MIT), Bodoni Moda (OFL 1.1).
Concept reference: <https://www.youtube.com/watch?v=jTFGF4tCKTM>. No footage or third-party brand
marks are included. See [`ATTRIBUTION.md`](ATTRIBUTION.md).
