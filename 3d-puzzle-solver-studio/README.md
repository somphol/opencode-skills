# 3D Puzzle Solver Studio

An OpenCode skill for building and shipping a tactile 3D sliding-puzzle studio: a Three.js tray, a
parity-safe shuffle, A* with Manhattan + linear conflicts in a Web Worker, hints and auto-play, a
bilingual UI, local records, headless verification and a GitHub Pages release.

Built from the completed **Full 3D 15-Puzzle Studio & Auto-Solver** project
([source](https://github.com/somphol/full-3d-15-puzzle-studio),
[live](https://somphol.github.io/full-3d-15-puzzle-studio/)) — 31 Node checks, 17 in-page checks,
46 browser checks, zero console errors.

## Install

Copy this folder into `~/.config/opencode/skills/3d-puzzle-solver-studio`, or add the catalogue URL
that serves it to your OpenCode config:

```jsonc
{
  "skills": ["https://somphol.github.io/opencode-skills/"]
}
```

## Use

Ask for a 3D sliding puzzle, a 15-puzzle solver, or a heuristic visualiser. The skill walks through
engine-first development, the Three.js scene, the UI/data layer, three test layers, documentation,
and publishing.

Scaffold the reference implementation:

```sh
node scripts/scaffold.mjs ~/Projects/my-puzzle-studio
cd ~/Projects/my-puzzle-studio
node --test tests/engine.test.mjs
python3 -m http.server 8000
node scripts/verify-browser.mjs http://localhost:8000/
```

## Contents

| Path | Purpose |
| --- | --- |
| `SKILL.md` | The workflow, non-negotiables and pitfalls |
| `references/ENGINE.md` | Parity, heuristics, A*, budgets, Worker contract |
| `references/SCENE.md` | Tray, tiles, textures, camera, raycasting, motion |
| `references/UI.md` | State, i18n, audio, records, persistence, export |
| `references/VERIFY.md` | Engine/static/browser tests, CDP harness, screenshots |
| `references/PUBLISH.md` | GitHub repo, Pages, `state.json`, catalogue |
| `references/CHECKLIST.md` | Copy-paste release checklist |
| `assets/reference/` | Shipped v1.0.0 source snapshot + engine test + docs |
| `scripts/scaffold.mjs` | Create a runnable project from the snapshot |
| `scripts/verify-browser.mjs` | Generic boot/self-test/console smoke check |

## Provenance and licence

MIT. Created by Somphol Boonjing with OpenCode × DeepSeek V4.1 Flash on 2026-11-04. Three.js is MIT.
See [ATTRIBUTION.md](ATTRIBUTION.md).
