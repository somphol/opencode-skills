# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-11-05

### Added

- Procedural Three.js Wurlitzer 1015 cabinet: walnut extrusions, chrome trim, brass inlays, arched
  glass, 30 marquee bulbs and two animated bubble-tube curves with 44 hue-shifting bubbles.
- Visible 45 RPM deck with grooved vinyl, label, spindle, platter and a tone arm that moves on play.
- 3D paper title rack (A-1…B-4) with canvas textures, plus a 16-slot DOM rack that lists four archive
  streams.
- Mechanical A–D / 1–8 keypad with 3D travel, clack synthesis, empty-slot rejection and a coin slot
  with a physical quarter drop.
- Web Audio music-box sequencer with eight public-domain lullaby arrangements, look-ahead
  scheduling, gain envelopes, octave sparkle and convolution reverb.
- Validated JSON manifest loader for four CORS-enabled Wikimedia Commons 78 RPM recordings.
- Three independent ambient generators: rainfall, ocean surf and crickets, with per-layer volume and
  a master ambient mix knob.
- Sleep timer (15/30/60 min) with a smoothstep fade over the final two minutes, light dimming and a
  live countdown.
- Bilingual EN/TH interface covering static labels, title strips, artists, status messages, help and
  the 3D paper textures.
- Favourites filter, credits, free-play/coin mode, four rotary knobs, progress/seek, mute and
  `localStorage` persistence with a JSON export.
- 10 engine tests, 12 repository tests, 23 in-page self-tests and 22 headless-browser tests.
- Release documentation, GitHub Actions CI, issue templates, privacy/accessibility/performance notes
  and a reproducible build-session record in `state.json`.
- Published OpenCode skill: `wurlitzer-lullaby-studio`.

### Notes

- Three.js is pinned to `0.169.0` through an import map.
- The first visit needs network access for the CDN; the synth engine is zero-bandwidth thereafter.
- Archive recordings retain their source licences; see `THIRD_PARTY_NOTICES.md`.

[1.0.0]: https://github.com/somphol/vintage-wurlitzer-lullaby-jukebox/releases/tag/v1.0.0
