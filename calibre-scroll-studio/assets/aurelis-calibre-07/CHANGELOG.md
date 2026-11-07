# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses semantic versioning.

## [1.0.0] — 2026-11-06

### Added

- Five-chapter scroll narrative: The Watch, The Dial, The Movement, The Case, The Whole.
- Fully procedural Three.js watch: lathed 904L case, domed sapphire, grand-feu dial artwork,
  applied gold indices, blued hands, barrel and mainspring, wheel train, balance and hairspring,
  skeleton bridges, jewels, screws, exhibition caseback and skeleton rotor.
- Two-stage explosion, per-part reassembly, scroll-damped camera choreography and watch rotation.
- Floating callouts with edge flipping, chapter windows and collision avoidance.
- Editorial responsive layout with a fixed stage, chapter rail and gold progress line.
- Fictional private-viewing dialog with local-only validation.
- Colophon documenting the one-sentence brief, the longer source prompt, the model, the harness and
  the session ledger.
- `STATE.md` / `state.json` generated read-only from the OpenCode session database.
- 24-check headless release gate with desktop, mobile and reduced-motion coverage, plus eight
  release screenshots.
- Offline-first delivery: vendored Three.js r170, self-hosted Bodoni Moda, no CDN or external
  requests at runtime.
- GitHub Pages release, project documentation and the `calibre-scroll-studio` skill.

### Fixed during the build

- Dial artwork rotated 90° by cylinder-cap UVs; replaced the cap with a flat circle.
- Sticky stage consumed a viewport of flow; switched to a fixed stage.
- Depth-stacked explosion read as a line from the side; redesigned as a two-stage fan.
- Hands detached from the lifted dial; now track its transform.
- Labels covered the dial logo; added collision placement and responsive hiding.
- A lower bridge hid the balance wheel; removed it.
- Caseback engraving fell inside the ring's hole; corrected the texture radius.
- Mobile explosion overlapped the copy; added lift/scale and compressed the copy.

### Verification

- 24/24 headless checks passing.
- 103 draw calls, 131,468 triangles, 23 registered assemblies.
- Chrome 156 on macOS; 1600 × 1000 desktop and 390 × 844 mobile profiles.

### Notes

- Aurelis is a fictional maison. Prices, specifications, email/appointment behaviour and the watch
  are fiction.
- WebGL is required; the page falls back to editorial copy without it.
