# Agent notes — Aurelis Calibre 07 — Anatomy of a Second

## What it is

A static, zero-build single-page site: a fictional luxury mechanical watch that disassembles over
five scroll chapters in WebGL, then reassembles for the finale. Everything is procedural — Three.js
geometry, a canvas-printed dial and a PMREM-baked studio environment. It is not a shop, backend or
horological simulator, and the maison, copy, price and appointment form are fiction. No runtime
package install, no CDN, no model or image assets.

**The brief was one sentence** (17 words, typo included). The source video uses a much longer prompt;
this build is a deliberate test of what DeepSeek V4.1 Flash could infer from the small one. Do not
"upgrade" the brief in docs as if a larger spec existed. See `docs/STUDY.md`.

## Commands

```sh
npm install                 # dev-only: puppeteer-core
npm run serve               # http://localhost:4173
npm run verify              # 24 headless checks + rewrites screenshots/
npm run state               # STATE.md + state.json from the OpenCode ledger
npm run screenshots         # ad-hoc frames via ?t=<0..1>&still; W/H env vars
CHROME_PATH=... npm run verify
```

Deploy: Pages is served from **`main`, repository root** — no build. Push to `main`; Pages rebuilds
automatically. `file://` will not work: ES modules and the import map need an HTTP origin. If you
change the number of checks, update the count in README, STATE.md's generator, the colophon copy and
this file.

## Architecture

- `index.html` — semantic shell, editorial copy, five `[data-chapter]` sections, chapter rail,
  callouts, enquiry dialog, colophon dialog, import map.
- `styles.css` — design tokens, fixed stage behind the sections, chapter scrims, callouts, dialogs,
  responsive layout. The stage is `position: fixed`, not sticky: a sticky stage consumes a viewport
  of flow and pushes the first chapter below the fold.
- `src/main.js` — renderer, procedural environment, camera/watch keyframes, scroll→timeline mapping,
  label projection and collision, rail, dialogs, `window.AURELIS` test API.
- `src/watch.js` — the model. Build order: case band → bezel → crystal → dial/indices → hands →
  movement (plate, barrel, train, balance, bridges, jewels, screws) → rotor/caseback → crown → lugs.
  Each top-level part is then registered with explosion transforms.
- `src/environment.js` — four-panel studio baked with `PMREMGenerator.fromScene`, plus materials.
- `scripts/verify.mjs` — self-contained static server + Chrome suite; the release gate.
- `scripts/state.mjs` — reads the local OpenCode DB read-only and writes the session ledger.
- `vendor/three.module.min.js` — pinned Three.js r170. `fonts/` — Bodoni Moda (OFL).

The normalized timeline is the core: chapter centres are measured, and scroll is normalised between
the hero and finale centres to `t = 0, .25, .5, .75, 1`. Camera, watch rotation, copy opacity,
labels, explosion and reassembly all key off that `t`. Do not introduce a second scroll source.

## Decisions and constraints

- **No assets.** Do not add GLB models or photo textures; the dial is a 1024 px runtime canvas and
  the environment is a PMREM-baked emissive scene.
- **No build step, no CDN, no external requests.** Three.js is vendored at r170; fonts are
  self-hosted. `verify` fails on external URLs. Social metadata may point at absolute URLs; the page
  itself must not fetch them.
- **Explosion is two-stage per part.** `delta`/`window` is the first move; `late`/`lateWindow` is the
  larger second move; everything retracts from `t = .815` with small delays. Hands track the lifted
  dial. The case shell (band, bezel, crystal, lugs, crown) leaves together at `t ≈ .55–.75`.
- **Reassembly is scroll-driven**, not a reset: at `t = 1` every part must be within 0.05 units of
  its base transform. The gate asserts it.
- **The watch is 23 registered assemblies**, not the 312 parts the copy claims. The copy is brand
  fiction; the geometry is a deliberately legible abstraction.
- **Mobile:** the stage sits in the upper half, copy is bottom-anchored, callouts/rail are hidden,
  and touch scrolls rather than drags. The gate checks 390 × 844 for overflow and separation.
- **Accessibility:** inactive copy sections are `inert`; the canvas/callouts are decorative. Keep the
  native dialogs, focus order and the reduced-motion path working.
- **`?t=` is a debug contract.** `window.AURELIS.setProgress(t)`, `.parts()`, `.exploded`,
  `.scene()` and `.ready` are used by the gate; keep them working.
- **State is generated, not hand-edited.** `npm run state` uses `node:sqlite` (Node 22+) against
  OpenCode's local DB and copies only timing/token aggregates. Do not add a machine path or
  conversation text.

## Known issues

- WebGL is required; there is a text fallback but no static poster of the watch.
- Verified only in Chrome. Safari/Firefox behaviour of `backdrop-filter`, `dialog` and large `svh`
  layouts is untested.
- Copy and specifications are fictional and deliberately hyperbolic.
- On mobile the finale copy is taller than the viewport; the CTA is reached at the very end of the
  page.
- The enquiry form validates locally only; it does not send, store or persist anything.
- The dial/case proportions are aesthetic, not millimetre-accurate.

## Continuity

- Source of truth: <https://github.com/somphol/aurelis-calibre-07>
- Live: <https://somphol.github.io/aurelis-calibre-07/>
- Skill: `calibre-scroll-studio`, published in the
  [OpenCode skills catalog](https://somphol.github.io/opencode-skills/).
- Reproduction guide: `docs/REPRODUCE.md`. Release gate: `npm run verify`. Ledger: `STATE.md`.
- Prompt source: <https://www.youtube.com/watch?v=jTFGF4tCKTM>
- Do not publish the local OpenCode session database or any credential with this repository.
