# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-11-05

### Added

- **50 synthesized lullabies across eight collection pages** (Lullabies, Music Box, Classical,
  Folk & World, Dreams I/II, Bonus, 78s), up from eight.
- **Category tabs and title/artist search** over a 64-slot rack (A-1…H-8); the 3D paper rack mirrors
  the active page.
- **A–H / 1–8 mechanical keypad**, extending the physical selection codes to all 64 slots.
- **Four themes** — Midnight, Amber Lounge, Emerald Club, Rose Salon — applied to both the CSS HUD
  and the 3D background, bulbs and point lights.
- **Three text sizes** (A / A+ / A++) with persisted preference.
- The archive manifest now ships **only public-domain recordings** (Brahms 1915, mechanical clock,
  Fauré *Berceuse*, Cappelen *Berceuse*), moved to H-1…H-4.
- New `docs/TRACKS.md` slot-by-slot catalogue and licensing note.
- Tests expanded to **11 engine, 12 repository, 25 in-page and 25 browser checks** (73 total).

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
