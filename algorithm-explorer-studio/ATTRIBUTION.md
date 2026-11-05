# Attribution

## Origin

This skill is distilled from **Algorithm Explorer: Top 15 SWE Interview Patterns**, a completed
release built by Somphol Boonjing with OpenCode + DeepSeek V4.1 Flash on 5 November 2026.

- Live: <https://somphol.github.io/algorithm-explorer/>
- Source: <https://github.com/somphol/algorithm-explorer>
- Reference copy: `assets/reference/` (MIT, same author)
- Build record: the reference project's `state.json`

## Reused

The entire reference implementation is included as a working template: `index.html`, CSS, the data /
engine / scene / controller modules, tests, screenshot script, docs, assets and `state.json`. It is
copied without dependencies or build output.

The skill itself (instructions, method, lessons, verification and release notes, scaffold and verify
scripts) is new writing that captures the build order and the bugs found during the original release.

## New in this skill

- A model-facing workflow with exact gates and non-negotiables.
- The frame/mark contract, schemas and 15 scene recipes.
- The backtracking root-key fix, label texture cache/disposal rule and scene-build exception handling.
- A dependency-free scaffold (`scripts/new-project.mjs`) and a proof harness
  (`scripts/verify.mjs`) that scaffolds into a temp directory and runs the engine + static gates.
- A release checklist with keychain-safe GitHub publishing and state capture.

## Third-party software

- **Three.js r128** — MIT, © three.js authors. Loaded from cdnjs at runtime.
- **OrbitControls 0.128.0** — MIT, © three.js authors. Loaded from jsDelivr at runtime.
- **LeetCode links** — outbound references only. No problem statements are copied. Not affiliated.
- Curriculum inspiration: Grokking the Coding Interview (Design Gurus), NeetCode 150, Blind 75. No
  paid content is reproduced.

No third-party logos, fonts, models, textures or audio are redistributed.

## Licence

MIT © 2026 Somphol Boonjing. See `assets/reference/LICENSE`.
