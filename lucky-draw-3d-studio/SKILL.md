---
name: Lucky Draw 3D Studio
description: Build a release-grade 3D lucky-draw prize-wheel studio with a cryptographically fair pick, spin physics, bilingual UI, synthesized audio, local history, headless verification and a GitHub Pages release.
version: 1.0.0
---

# Lucky Draw 3D Studio

Turn “make me a 3D prize wheel” into a shipped product: a real Three.js wheel on a metal stand, a
fair draw chosen before the animation, a winner reveal with confetti, a bilingual HUD, local history,
JSON/CSV export, four test layers, full documentation and a live Pages URL.

This skill is written from a completed build: **Full 3D Lucky Draw & Prize Wheel Studio** — 13 engine
checks, 22 repository checks, 18 in-page checks, 18 headless browser checks, zero console errors. The
shipped reference source is in `assets/reference/`; the live product is at
<https://somphol.github.io/full-3d-lucky-draw-studio/>.

## When to use

Use it when the user wants:

- a 3D or 2.5D lucky draw, prize wheel, raffle wheel or “spin to win” stage;
- a fair random pick with an auditable rule, not “whatever the animation stops on”;
- an event tool with 3–4 quick names or a pasted roster of up to a few dozen;
- a bilingual, backend-free static page with local history and exports;
- a release-grade repository with tests, docs, screenshots and GitHub Pages.

Do **not** use it for slot reels, gacha banners, physics sandboxes, or any draw that needs a server,
accounts, weighted odds or real-money compliance. Those need a different fairness and legal story.

## What “done” means

Do not stop at “it renders”. A release has all of these:

| Gate | Command | Expected |
| --- | --- | --- |
| Engine | `node --test tests/engine.test.mjs` | 13/13 |
| Repository | `node --test tests/static.test.mjs` | 22/22 |
| In-page | `/?selftest` | 18/18 |
| Real browser | `node tests/browser.test.mjs` | 18/18, zero console errors |
| Live copy | `TEST_URL=https://… node tests/browser.test.mjs` | 18/18 |
| Visuals | `node scripts/screenshot.mjs` | 6 fresh assets |
| Docs | README, AGENTS, 13 docs, community files | links resolve |
| Metadata | `state.json`, licence, sitemap, social card | shape valid |
| Handoff | `AGENTS.md` in the **same push** | current |

If a number is lower, fix the cause; never edit the claim.

## Non-negotiables

1. **Pick the winner before the animation.** `crypto.getRandomValues` + rejection sampling, then
   compute a target rotation. If the result is derived from where the wheel stops, the fairness claim
   is false and the product has no reason to exist.
2. **Prove the landing.** `resolveIndex(targetRotation(i, n, turns, from).rotation, n) === i` for
   every `i`, `n` in 2–32, and for arbitrary start angles. Put this in the engine test, the self-test
   and the browser test.
3. **Keep the engine pure.** One factory between `/* ENGINE:START */` and `/* ENGINE:END */`. No
   `document`, `window`, `THREE` or module imports. Node slices the block with `new Function`.
4. **Keep the coordinate contract.** Canvas angle `θ` appears at world `r − θ`; pointer at `π/2`;
   landing `r = π/2 + mid`; resolve `floor(mod(r − π/2, 2π) / step)`. Do not “simplify” the signs.
5. **Texture a `CircleGeometry`, not the cylinder cap.** Cap UVs plus `flipY` are a debugging trap.
6. **No rim boxes.** Tangential boxes sized to the chord protrude outside the circle for 3–5 slices.
   Use per-slice open-ended cylinder bands.
7. **Confetti inside the winner dialog.** Put the canvas between the scrim and the card; a page-level
   canvas is destroyed by the scrim's blur and darkness.
8. **Pin Three.js to one exact version** in the import map. No `latest`, no caret, no unpkg.
9. **No backend, no bundler, no framework, no tracking.** Three source files plus tests and docs.
10. **Reduced motion must keep the draw fair and complete.** Shorten the spin and skip confetti; do
    not skip the result.
11. **Use `--use-mock-keychain` in headless Chrome.** It prevents repeated macOS Keychain prompts and
    is an operational requirement, not a nicety.
12. **The handoff ships with the code.** `AGENTS.md` + `state.json` in the same commit as the release.

## Workflow

### Phase 0 — scope and scaffold (15 min)

- Decide the roster limits (this build: 2–32, names 28 chars), languages, and whether the wheel is
  vertical (recommended) or flat.
- Create `index.html`, `style.css`, `script.js`, `assets/`, `docs/`, `tests/lib/`, `scripts/`.
- Pin Three.js `0.169.0` in the import map now. Use an import map, not a bundler.
- Write the README headline and the AGENTS.md skeleton immediately; both get checked at the end.

### Phase 1 — engine first (highest leverage)

Build the rules with no pixels. Full math in [references/FAIRNESS.md](references/FAIRNESS.md).

1. `normalizeRoster` — trim, collapse whitespace, strip control chars, 28-char cap, case-insensitive
   dedupe, 32-entry cap, report duplicates/overflow.
2. `sliceLayout(n)`, `rotationForIndex`, `targetRotation`, `resolveIndex`.
3. `pickIndex(n, randomInt?)` — crypto + rejection sampling, injectable RNG for tests.
4. `smoothstep(t) = t²(3−2t)`.
5. `toCSV` / `toJSON` with a stable schema.
6. Markers around the factory; a Node fixture that slices and evaluates it.

**Gate:** engine suite. Prove round trips, forward-only turns, uniformity over 40 000 seeded picks.

### Phase 2 — shell and controller contract (30 min)

- Build the top bar, stage, sidebar tabs, winner dialog, settings drawer, toast, self-test overlay.
- Keep the IDs listed in [references/UI.md](references/UI.md). Tests and the script share them.
- Static copy uses `data-i18n`; placeholders use `data-i18n-placeholder`.
- State shape: `prefs`, `roster`, `history`, `spinning`, `pending`, `lastWinner`, `tab`.
- Roster pipeline: normalise → set state → repaint wheel → sync inputs/chips → counters → persist.
- Spin pipeline: guard → unlock audio → pick → `spinning` → `startSpin` → `completeDraw`.
- Persist `ld3.prefs.v1`, `ld3.roster.v1`, `ld3.history.v1`. A saved empty roster must stay empty;
  the sample default applies only when the key is absent.

### Phase 3 — the 3D wheel (60–90 min)

Follow [references/SCENE.md](references/SCENE.md) for constants, materials and pitfalls.

- Renderer: antialias, DPR ≤2, PCFSoft shadows, ACES, sRGB, `RoomEnvironment` PMREM.
- Stand: base, rings, column, axle, cheeks. Wheel centre `y=3.35`, `R=3.05`.
- Body cylinder + separate face circle at `z=THICK/2+0.004`.
- Per-slice arc bands for the rim; gold ball + chrome pin per boundary.
- Hub, gold rings, painted canvas with 8 colours and auto-fitted labels.
- Pointer above the rim on a damped spring; kick on every peg crossing.
- Camera `(0.9, 4.65, 14)`, target `(0, 3.35, 0)`, FOV 36/42/50 by aspect, bounded OrbitControls.

**Gate:** a real screenshot with four names, a readable top label, no geometry outside the rim.

### Phase 4 — spin, reveal, persistence (45 min)

- Duration 3–10 s, turns 2–14, defaults 5.5 s / 6.
- Render loop: `from + delta * smoothstep(t)`, count peg crossings, tick audio, kick pointer, snap the
  exact end and resolve.
- Winner dialog: remove or keep; optional auto-remove (mutate record before showing, hide “Keep”,
  relabel the primary action to “Continue”).
- History newest first, cap 200, record `draw`, `at`, `winner`, `rosterSize`, `durationMs`, `removed`.
- Two-step clear log. Export JSON/CSV; add a BOM only at download time for CSV.
- Reflect tag changes immediately when a winner is removed (re-render the history list, not just the
  chips).

**Gate:** browser check: spin, winner index equals resolved index, remove, keep, auto-remove.

### Phase 5 — language, audio, accessibility (30 min)

- Two dictionaries with identical keys; ≥80 keys. Apply by walking `[data-i18n]` and placeholders.
- Re-apply dynamic strings after switching: spin label, winner meta, history tags, toasts.
- Audio: lazy `AudioContext`, triangle ticks with speed-scaled pitch, 4-note fanfare, whoosh. Never
  create the context at boot.
- Keyboard: Space spin/close, L language, S sound, Esc close. Ignore while typing or on buttons.
- Reduced motion: 1.1 s / one turn, no confetti, CSS animations off; result unchanged.
- Focus: dialog focus to primary action and back; visible teal outline; `aria-modal`, tabs,
  `role=status` toast, `aria-pressed` language.

### Phase 6 — verification (45 min)

Follow [references/VERIFY.md](references/VERIFY.md).

- 13 engine checks, 22 static checks, 18 in-page checks, 18 browser checks.
- Static checks: ids, i18n symmetry, marker purity, pinned import map, docs set, relative links,
  state.json shape/line counts, assets, CI, no secrets, no `innerHTML`.
- Browser checks: boot, self-test, quick/bulk roster, duplicates, presets, spin resolution, remove,
  keep, Thai, exports, settings, auto-remove, reload restore, clear-log arming, mobile drawer,
  reduced motion, zero console errors.
- Assert observable state through `window.__luckyDraw`, not screenshots. Handshake:
  `body.dataset.ready`, `body.dataset.selftest`.

### Phase 7 — release (45 min)

Follow [references/RELEASE.md](references/RELEASE.md).

- Screenshots: studio, stage crop, winner with confetti mid-flight, Thai, mobile 390×844, OG card.
- README with product tour, fairness summary, verification table, credits.
- `AGENTS.md`: what, commands, architecture, decisions, known issues, continuity.
- 13 docs: index, architecture, reproduction, design, physics, testing, deployment, decisions,
  accessibility, performance, privacy, FAQ, roadmap.
- Community files, MIT licence, third-party notices, changelog, CI, issue templates, `.nojekyll`,
  robots, sitemap.
- `state.json`: session elapsed time, token counters read from the live OpenCode database, model and
  credits, line counts, verification counts, deployment, skill.
- Push, enable Pages, verify the live URL with the browser suite.

## Debugging playbook

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Pointer lands on the neighbour | Sign error in the coordinate contract | Re-derive `r = π/2 + mid`; assert resolve in a test |
| Labels mirrored or upside down | Textured the cylinder cap, or flipped from canvas angle instead of resting rotation | Use `CircleGeometry`; flip from `restRotation − mid` |
| Rim planks stick out | Tangential boxes sized to the chord | Use per-slice arc bands |
| Confetti invisible | Canvas sits below the modal scrim | Move it inside the modal, z between scrim and card |
| Winner tag still “Kept” after removal | History list not re-rendered | Call `renderHistory()` after mutating the record |
| Spin button loses its gold colour | Disabled mid-spin | Guard in code, `pointer-events: none` while spinning |
| Audio warning at load | AudioContext created at boot | Create it lazily on a gesture |
| Reduced-motion test sees a 300×150 canvas | Default canvas size | Initialise the confetti canvas to 0×0 |
| Mobile stage leaves a large empty page | Fixed `dvh` stage plus drawer | Use `calc(100dvh − topbar)` for the stage |
| Keychain prompt storm | Chrome launched with the real profile/keychain | `--use-mock-keychain --password-store=basic` + temp profile |

## Reference implementation

`assets/reference/` is the shipped v1.0.0 source: `index.html`, `style.css`, `script.js`, plus the
favicon and OG card. Read it for exact geometry, copy and test hooks. Scaffold a new project with:

```sh
node scripts/scaffold.mjs ~/Projects/my-lucky-draw
cd ~/Projects/my-lucky-draw
python3 -m http.server 8000
```

The scaffold copies the working three-file app; then change the product name, palette, presets and
docs. Do not ship the sample names or the reference branding unchanged.

## References

- [references/FAIRNESS.md](references/FAIRNESS.md) — uniform pick, landing math, easing, ticks.
- [references/SCENE.md](references/SCENE.md) — geometry constants, materials, label rules, pitfalls.
- [references/UI.md](references/UI.md) — IDs, state, data flow, i18n, persistence, accessibility.
- [references/VERIFY.md](references/VERIFY.md) — four test layers, harness flags, checklist.
- [references/RELEASE.md](references/RELEASE.md) — docs set, state.json, publishing and live checks.

## Licence and credit

MIT. Built with [OpenCode](https://opencode.ai) and **DeepSeek V4.1 Flash**; 3D by
[Three.js](https://threejs.org) `0.169.0` (MIT). See `ATTRIBUTION.md` before republishing.
