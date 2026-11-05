# Vintage Wurlitzer 3D Lullaby Jukebox & Sleep Studio

**A glowing 1940s Wurlitzer 1015 “Bubbler”, rebuilt as a browser-based sleep instrument.**
Insert a quarter, pick a paper title strip, and let eight procedurally synthesized music-box
lullabies — or four vintage 78 RPM archive recordings — play you to sleep under rain, waves and
crickets.

[**Open the live jukebox →**](https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/)

[![Release](https://img.shields.io/badge/release-1.0.0-e6c07b)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-e6c07b)](LICENSE)
[![Three.js](https://img.shields.io/badge/Three.js-0.169.0-e6c07b)](https://threejs.org/)
[![No build step](https://img.shields.io/badge/build-none-e6c07b)](#quick-start)
[![Bilingual](https://img.shields.io/badge/UI-EN%20%2F%20%E0%B8%97%E0%B8%B5%E0%B8%97%E0%B8%B1%E0%B8%A2-e6c07b)](#bilingual-interface)

![The Wurlitzer Lullaby Studio at night](assets/studio.png)

---

## What it is

A complete, static, client-side 3D web application. There is no backend, account system, build
step, package manager or analytics. The deployed artifact is this repository served from GitHub
Pages.

The cabinet is modelled procedurally in Three.js: walnut grain, chrome trim, a lit arch, rising
bubble tubes, a spinning 45 RPM record, a moving tone arm, a paper title rack and a mechanical
A–D / 1–8 keypad.

**New to the repository?** Start with [AGENTS.md](AGENTS.md) for the fast handoff, then
[docs/REPRODUCTION.md](docs/REPRODUCTION.md) for a from-zero rebuild. Audio is generated live with the Web Audio API, or streamed from a validated JSON
manifest of CORS-enabled, public-domain archive recordings.

| | |
| --- | --- |
| **Live** | <https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/> |
| **Source** | <https://github.com/somphol/vintage-wurlitzer-lullaby-jukebox> |
| **Stack** | Vanilla HTML5, CSS3, ES2022 modules, Three.js 0.169.0 (CDN import map) |
| **Audio** | Web Audio API — oscillators, convolution reverb, noise generators, EQ |
| **Persistence** | `localStorage`, plus JSON export |
| **Tests** | 10 engine checks, 12 repository checks, 23 in-page checks, 22 headless-browser checks |
| **License** | MIT (code); recordings keep their own licences — see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) |

---

## Screenshots

| Playing a lullaby | ภาษาไทย |
| --- | --- |
| ![Playing](assets/playing.png) | ![Thai interface](assets/thai.png) |

| Mobile | Social card |
| --- | --- |
| ![Mobile](assets/mobile.png) | ![Open Graph card](assets/og-card.png) |

---

## Features

### The cabinet

- **Wurlitzer 1015 silhouette** — extruded walnut arch, chrome pilasters, brass inlays, arched glass.
- **Liquid bubble tubes** — 44 translucent bubbles travel Catmull-Rom curves up both sides of the
  arch, shifting hue while the music plays.
- **30 warm marquee bulbs** around the arch that pulse with the audio envelope.
- **Visible 45 RPM mechanism** — platter, grooved vinyl, red label, spindle and animated tone arm.
- **Paper title strips** rendered as real textures in the 3D rack (A-1 … B-4), plus a 16-strip DOM
  rack that also lists the four archive streams.
- **Mechanical A–D / 1–8 keypad** with 3D key travel, synthesized clack, arm/play animation and
  authentic “empty slot” rejection.
- **Coin slot** — a quarter physically drops into the chrome slot; Free Play is the default.
- **Orbit camera** with constrained angles, cinematic intro and a reduced-motion path.

### Dual-engine audio

- **Engine 1 — procedural music box.** A look-ahead step sequencer with triangle/sine oscillators,
  per-note gain envelopes, octave sparkle harmonics and convolution reverb. Eight public-domain
  lullabies, no network required.
- **Engine 2 — archive stream loader.** `data/playlist.json` is validated (https only, C-1…D-4,
  unique slots, duration, licence, credit) and played through a `MediaElementAudioSourceNode`.
  Four public-domain / freely licensed 78 RPM recordings from Wikimedia Commons.
- **Ambient mixer** — three independent noise generators:
  - soft rainfall (filtered white noise + random droplets),
  - gentle ocean waves (brown noise + slow surf LFO),
  - night crickets (band-passed noise bed + chirp bursts).
- **Master chain** — music bus → low-shelf EQ → high-shelf EQ → compressor → master → sleep-timer
  gain → analyser → destination.
- **Sleep timer** — 15 / 30 / 60 minutes; smoothstep fade across the final two minutes, then the
  cabinet lights dim and all sources stop.

### Interface

- **Bilingual EN ⇄ TH** — every static label, title strip, artist, status message, help step and
  timer string updates instantly; the 3D paper textures are redrawn too.
- **Art-deco HUD** — walnut-and-brass palette, four rotary knobs, live progress, transport,
  favourites filter, credits counter and keyboard shortcuts.
- **Persistence** — language, free-play mode, credits, favourites, volumes, EQ, ambient mix,
  timer preference and last record survive reloads.
- **Export** — `💾 Export settings JSON` downloads the full settings and track manifest.
- **Accessibility** — semantic buttons, ARIA slider knobs, visible focus rings, skip link, reduced
  motion, keyboard operation and a screen-reader live status.
- **Diagnostics** — open `?selftest` for 23 in-page checks rendered as a pass/fail list.

---

## Quick start

No install, no build.

```bash
# Any static server works; fetch() needs http(s), not file://
python3 -m http.server 8000
# open http://localhost:8000/
```

The page loads Three.js from jsDelivr, so the first visit needs network access. After that the
browser cache usually serves the module. The procedural lullabies themselves use zero bandwidth.

```bash
# Tests
node --test tests/engine.test.mjs tests/static.test.mjs
node tests/browser.test.mjs                 # headless Chrome, mock keychain
TEST_URL=https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/ \
  node tests/browser.test.mjs               # live suite

# Diagnostics
open http://localhost:8000/?selftest
```

See [docs/TESTING.md](docs/TESTING.md) for the harness, expected counts and troubleshooting.

---

## Controls

| Action | Mouse / touch | Keyboard |
| --- | --- | --- |
| Play a record | Click a title strip, or a 3D strip | `Enter` / `Space` on a strip, or `Space` to play |
| Mechanical select | Press `A`–`D`, then `1`–`8` | Same keys on the on-screen keypad |
| Play / pause | Gold transport button | `Space` |
| Previous / next | Transport arrows | `←` / `→` |
| Stop | Square button | — |
| Language | EN / ไทย switch | `L` |
| Timer | Off / 15 / 30 / 60 | `T` cycles |
| Mute | Speaker icon | `M` |
| Free Play | Top-bar chip | `F` |
| Knobs | Drag vertically or scroll | Focus, then arrows / `Home` / `End` |
| Orbit | Drag the stage; scroll to zoom | — |
| Help | `?` icon | `Esc` closes |

**Coin mode:** turn Free Play off, then press **Insert quarter**. Each selection costs one credit.
The 3D coin drop is only cosmetic; credits are persisted.

---

## Track catalogue

| Slot | Title | Artist | Engine | Length |
| --- | --- | --- | --- | --- |
| A-1 | Brahms' Lullaby | Johannes Brahms | Synth | 1:27 |
| A-2 | Twinkle, Twinkle, Little Star | Traditional | Synth | 0:40 |
| A-3 | Mozart's Cradle Song | W. A. Mozart (attr.) | Synth | 1:05 |
| A-4 | Schubert's Lullaby | Franz Schubert | Synth | 0:54 |
| B-1 | Rock-a-bye Baby | Traditional | Synth | 0:50 |
| B-2 | Hush, Little Baby | Traditional | Synth | 0:39 |
| B-3 | Frère Jacques (Sleep) | Traditional French | Synth | 1:11 |
| B-4 | Golden Slumbers | Traditional English | Synth | 0:50 |
| C-1 | Wiegenlied (Berceuse), 1915 | Schumann-Heink | 78 RPM | 1:50 |
| C-2 | Guten Abend, gut' Nacht | Archive | 78 RPM | 2:34 |
| C-3 | Schlafe, mein Prinzchen | Flies · Ukrainian | 78 RPM | 2:00 |
| C-4 | Lullaby Wound-Up Clock | Mechanical | 78 RPM | 0:46 |

The procedural arrangements are original, simplified settings of public-domain melodies. Durations
are computed from each note array at load time; the table reflects the shipped tempos.

---

## Architecture

```
index.html          shell, HUD, import map (Three 0.169.0), JSON-LD, modals
style.css           art-deco design system, responsive drawers, reduced motion
script.js           I18N → pure engine → tracks → audio → Three.js → app/self-test
data/playlist.json  validated external archive manifest (C-1…C-4)
tests/              engine + static (Node) and browser (CDP) suites
scripts/            screenshot and social-card generation
docs/               architecture, reproduction, audio, design, ops and policy
```

Inside `script.js`:

1. **`/* I18N:START */`** — EN/TH dictionaries, kept symmetrical by tests.
2. **`/* ENGINE:START */`** — pure functions: note maths, sequence parsing, fade curve, slots,
   rack building, settings normalisation, manifest validation, export payload. No DOM, no network,
   no `Date`, no Three.js, loadable in Node.
3. **Track catalogue** — eight note arrays, parsed once into MIDI/frequency/beats.
4. **`JukeboxAudio`** — graph builder, look-ahead synth scheduler, stream element, ambient
   generators, timer loop, analyser level.
5. **`WurlitzerScene`** — renderer, PMREM environment, procedural textures, cabinet assembly,
   bubble animation, raycasting, bloom composer.
6. **`WurlitzerApp`** — UI bindings, persistence, language, coins, favourites, timer, diagnostics.

Deep dives: [ARCHITECTURE](docs/ARCHITECTURE.md) · [AUDIO](docs/AUDIO.md) ·
[DESIGN](docs/DESIGN.md) · [DECISIONS](docs/DECISIONS.md).

---

## Verification

```bash
node --test tests/engine.test.mjs tests/static.test.mjs   # 22 checks
node tests/browser.test.mjs                              # 22 checks + 23 in-page
```

The browser suite launches **one** headless Chrome with `--use-mock-keychain` and a temporary
profile. That flag is deliberate: it prevents repeated macOS Keychain prompts. It serves the
repository on an ephemeral port; no credentials or accounts are touched. Set `CHROME` if Chrome is
not at the macOS default path.

The live suite is the same command with `TEST_URL`. The 1.0.0 release passed 10 engine, 12 static,
23 in-page and 22 browser checks with **zero console errors**.

---

## Deployment

```bash
git push origin main
```

GitHub Pages serves `main` / root at
<https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/>. `.nojekyll` keeps underscore paths
intact. No environment variables, secrets or build artefacts are required. See
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the API recipe, cache notes and rollback.

---

## Privacy, accessibility & performance

- **Privacy:** no analytics, cookies, accounts, uploads or third-party scripts beyond the Three.js
  CDN. Settings live only in `localStorage`. Archive audio is fetched directly from Wikimedia.
- **Accessibility:** keyboard-complete, ARIA-labelled controls, visible focus, skip link, reduced
  motion, contrast-checked palette and a live status region.
- **Performance:** capped DPR (2), half-resolution bloom, 30-frame-friendly geometry, a single
  visible cabinet and a paused render loop is avoided only when the tab is hidden by the browser.
  Mobile opens the song rack and studio as bottom sheets.

Details: [ACCESSIBILITY](docs/ACCESSIBILITY.md) · [PERFORMANCE](docs/PERFORMANCE.md) ·
[PRIVACY](docs/PRIVACY.md).

---

## Credits

Built in a single **OpenCode** session with **DeepSeek V4.1 Flash** (`opencode-go/deepseek-v4.1-flash`).
Three.js 0.169.0 (MIT). The eight melodies are public domain; the four archive recordings are
public-domain or freely licensed and individually credited in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The build-session record, including elapsed time
and token usage, is in [state.json](state.json). Full credits: [docs/CREDITS.md](docs/CREDITS.md).

---

## License & disclaimer

Code and original assets: **MIT** — see [LICENSE](LICENSE). Recordings retain their source licences.
This is a fan-made visual tribute, not affiliated with Wurlitzer, Gibson or any rights holder.
It is a relaxation toy, not a medical device; do not use it to diagnose or treat sleep disorders.
