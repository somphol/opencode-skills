# Attribution

## Origin

The reference implementation in `assets/cube-lab/` is **CubeLab**, an interactive 3D
Rubik's Cube studio by Somphol Boonjing:

- Source: <https://github.com/somphol/rubiks-cube>
- Live: <https://somphol.github.io/rubiks-cube/>
- Licence: MIT, © 2026 Somphol Boonjing

The reference was used with the author's permission as part of this skill. It is included
as a mechanism reference, not as a template to reskin.

## Reused

- The CubeLab source, build script, documentation set, and self-test.
- The camera director, layer glow, Step gate, and cinematic controls as implemented in the
  reference.
- The release-documentation structure (AGENTS.md, docs set, reproduction blueprint,
  decision log, CI build check).
- The CubeLab visual tokens and UI copy as examples of the design system.

## New in this skill

- The distilled method and invariants for adding a cinematic presentation layer and Step
  playback to a static 3D app.
- The regression list, verification matrix, release-docs guide, hosting guide, and build
  log.
- The scaffold (`scripts/new-project.mjs`, `scripts/new-project.sh`) and the static
  verification script (`scripts/verify.mjs`).
- The skill packaging, attribution, and catalog layout.

## Third-party software

The reference asset contains:

- **Three.js r128** — MIT, <https://threejs.org/>. Loaded from jsDelivr at runtime.
- **OrbitControls** and **RoundedBoxGeometry** — Three.js examples, MIT.
- **cube.js 1.3.2** — MIT, <https://github.com/ldez/cubejs>.
- **Kociemba two-phase solver** — bundled with cube.js, MIT.

See `assets/cube-lab/THIRD_PARTY_NOTICES.md` and `assets/cube-lab/LICENSE` for the full
notices.

No third-party brand marks, logos, fonts, or images are redistributed. The CubeLab name and
UI are part of the author's MIT-licensed reference.

## Licence status

The skill content is MIT. The CubeLab reference asset is MIT. The third-party libraries are
MIT. If you adapt the reference to another subject, keep the attribution and the third-party
notices, and replace the CubeLab-specific copy and branding.
