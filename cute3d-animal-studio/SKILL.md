---
name: Cute3D Animal Studio
description: Build a release-grade, zero-asset 3D animal character studio with seven original procedural Three.js pets, layered fur and feather coats with a movable wind fan and wind-driven shell physics, species postures, idle and click animations, live colours and accessories, synthesized Web Audio, a bilingual EN/TH UI, local presets, transparent PNG export, four test layers and a GitHub Pages release.
version: 1.3.0
---

# Cute3D Animal Studio

Turn "make me a cute 3D animal studio" into a shipped product: seven original characters built only
from Three.js primitives, a layered fur/feather coat plus GPU strand and fan-wind system, a pastel soft-shadow studio,
breathing/blinking/jumping life, a bilingual customizer, local presets, transparent PNG export, real
tests and a live URL.

This skill is written from a completed build: **Cute3D: Procedural Code-Only Animal Studio** —
19 engine, 82 repository, 25 browser and 20 in-page checks, zero console errors. The shipped reference
source is in `assets/reference/`; the live product is at
<https://somphol.github.io/cute3d-animal-studio/>.

## When to use

Use it when the user wants:

- a 3D or 2.5D character viewer, pet studio, dress-up toy or mascot showcase;
- characters built entirely from code, with no downloaded models or textures;
- a static, backend-free page with a bilingual UI and local persistence;
- transparent PNG character export, share links and presets;
- a release-grade repository with tests, docs, screenshots and GitHub Pages.

Do **not** use it for rigged animation pipelines, glTF viewers, multiplayer worlds, AR, or anything
that needs accounts, a server or third-party licensed characters. Those need different constraints.

## What "done" means

Do not stop at "it renders". A release has all of these:

| Gate | Command | Expected |
| --- | --- | --- |
| Engine | `node --test tests/engine.test.mjs` | 19/19 |
| Repository | `node --test tests/static.test.mjs` | 82/82 |
| Browser | `node tests/browser.test.mjs` | 25/25, zero console errors |
| In-page | `/?selftest` | 20/20 |
| Live copy | `TEST_URL=https://… node tests/browser.test.mjs` | 25/25 |
| Visuals | `node scripts/screenshot.mjs` | 14 fresh assets |
| Docs | README, AGENTS, 14 docs, community files | links resolve |
| Metadata | `state.json`, licence, sitemap, OG card | shape valid |
| Handoff | `AGENTS.md` in the **same push** | current |

If a number is lower, fix the cause; never edit the claim.

## Non-negotiables

1. **No external art.** No `.glb/.gltf/.obj`, textures, HDRIs, audio files or icon fonts. Everything is
   spheres, capsules, cones, torus arcs, procedural fur shells and oscillators. Canvas-generated fur
   textures are allowed; downloaded ones are not. The only runtime dependency is Three.js, pinned in an
   import map.
2. **Original characters only.** Button eyes, blush and rounded muzzles are fine; third-party mascots,
   palettes, names and silhouettes are not. Run the repository test's trademark guard. Seven species
   ship: bear, bunny, penguin, shiba, koala, sun conure and Scottish Fold.
3. **Keep the engine pure.** Maths and validation live between `/* ENGINE:START */` and
   `/* ENGINE:END */` with no DOM, `window`, `THREE`, `localStorage` or imports. Node slices it with
   `new Function`.
4. **Sanitize every persisted or shared value.** Presets and URL state go through the engine
   sanitizers; render names with `textContent`, never `innerHTML`.
5. **Use a dedicated snapshot camera.** Hide pedestal/props, clear alpha to 0, render 2048², restore.
   Never resize or reuse the main camera.
6. **Attach accessories to head/neck anchors.** Never re-add a head-parented anchor to the animal group.
7. **Test the look, not just the DOM.** Assert transparency, accessory visibility, eye scale, line
   counts, i18n parity and zero console errors.
8. **Coat is shell-based.** Do not replace it with solid strands, particles or small cards: they read as
   wire, dust and paper. See `references/RIGS.md` and `references/SCENE.md`.
9. **Ship the handoff.** `AGENTS.md` with commands, architecture, decisions, known issues and continuity
   must be in the same push as the release.

## Build sequence

1. **Scaffold** with `scripts/scaffold.mjs` (or copy `assets/reference/`), then serve over HTTP.
2. **Engine first:** constants, palettes, colour math, blink envelope, expression poses, preset/share
   sanitizers, sound patterns. Write the engine tests before the scene.
3. **Scene:** renderer (alpha, PCFSoft, ACES), camera 34°, OrbitControls, hemisphere + key/fill/rim,
   pedestal, shadow disc, decorative props, CSS backdrop.
4. **Materials and helpers:** shared unit sphere/cone/circle, capsule/torus helpers, role-tagged
   materials, `baseScale` on every mesh.
5. **Seven rigs:** bear 25, bunny 27, penguin 19, shiba 26, koala 23, conure 50, fold 32 base meshes.
   Follow the rig contract in `references/RIGS.md`; keep belly patches forward and counts distinct.
6. **Coat:** layered shells (4 soft / 8 plush), canvas strand alpha + bump, shader masks for face/ears/
   belly, plus up to 60k GPU ribbons with wind/curl/clump/cursor physics. Add a `COAT_CONFIG` entry per
   animal; never hard-code fur into a builder.
7. **Posture and moods:** apply species posture before coats; implement Studio / Cloud Sky / Cozy Desk
   lighting presets and the five fur sliders.
8. **Accessories:** bowtie, party hat, glasses; parent to `anchors.neck/hat/glasses`.
9. **Animation:** damped expression blend, float, breath, deterministic blink, ear/tail, reaction.
10. **UI:** character, expression, fur, scene, colours, accessories, tools, presets, language, toasts,
   mobile sheet, keyboard shortcuts.
11. **Snapshot/share:** dedicated square camera, transparent 2048² PNG, query-string look incl. `f=`.
12. **Tests:** engine, repository, browser, in-page self-test. Add a screenshot generator.
13. **Docs and release:** README, AGENTS, docs set, OG card, Pages, live suite, skill mirror.

## Rig contract

Every builder returns `{ id, group, head, body, belly, ears[2], eyes[2], glints[2], tail, feet, arms,
cheeks, mouth, anchors{neck,hat,glasses}, materials, base, seed, blinkSeed }`. `buildAnimal()` adds
accessories and captures `earBases`. Recolour through `rig.materials` roles (`main`, `mainDark`,
`belly`, `blush`, `inner`, `accent`). Full tables are in `references/RIGS.md`.

## Known pitfalls (all hit during the original build)

| Symptom | Cause | Fix |
| --- | --- | --- |
| Hat/glasses float at the waist | head anchors re-parented to the group | do not add hat/glasses to `group.add` |
| Belly patch invisible | centre too far back | z ≈ 0.5–0.6 |
| Penguin eyeless | face patch covers z 0.56 | eyes z 0.72, brows removed |
| Cheeks become giant | `scale.setScalar(1)` | multiply `userData.baseScale` |
| Accessories lose material | shared material disposed | mark `userData.shared` |
| Snapshot resets orbit | main camera + `resize()` | dedicated snapshot camera |
| Selftest accessories fail | builders don't create accessories | test `ACCESSORY_BUILDERS` |
| Static suite fails | `state.json` line counts stale | regenerate after source edits |
| Fur invisible | strands buried inside shells | sample roots at `mesh.scale * 1.16` |
| Fur looks dusty | opaque thin strands | semi-transparent strands + shells, keep opacity ~0.6 |
| Feet float | whole group bobs | counter-translate feet by the idle bob |
| Pose hidden by fur | posture applied after coat | pose before `applyCoat` |

## Verification and release

See `references/VERIFY.md` for the exact commands and assertions, and `references/RELEASE.md` for the
docs set, Pages setup and catalog publishing. Reproduce the screenshot pipeline so the README and OG
card always come from the real render.

## Files

- `assets/reference/` — the complete shipped source (HTML, CSS, JS, manifest, favicon).
- `assets/preview.png` and `assets/og-card.png` — visual reference.
- `references/SCENE.md`, `RIGS.md`, `UI.md`, `VERIFY.md`, `RELEASE.md` — build detail.
- `scripts/scaffold.mjs` — copy the reference into a new project folder.
