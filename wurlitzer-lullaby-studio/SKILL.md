---
name: Wurlitzer Lullaby Studio
description: Build a bilingual, static 3D Wurlitzer-style lullaby jukebox and sleep studio with procedural Web Audio lullabies, an archive stream manifest, ambient beds, a smoothstep sleep timer, headless verification and a GitHub Pages release.
version: 1.0.0
---

# Wurlitzer Lullaby Studio

Turn “make me a vintage jukebox for sleep” into a shipped product: a procedural 1940s bubbler in
Three.js, eight synthesized music-box lullabies, four licensed archive streams, rain/ocean/crickets,
a physical coin slot, a bilingual EN/TH HUD, a fade-to-silence timer, four test layers and a live
Pages URL.

This skill is written from a completed release: **Vintage Wurlitzer 3D Lullaby Jukebox & Sleep
Studio** — 10 engine checks, 12 repository checks, 23 in-page checks, 22 headless browser checks, zero
console errors. The reference source is in `assets/reference/`; the product is at
<https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/>.

## When to use

Use it when the user wants:

- a 3D jukebox, music box, radio cabinet or mid-century audio object, especially a Wurlitzer 1015
  “Bubbler”;
- a sleep or relaxation app with lullabies, ambient beds and a timer that fades out;
- a zero-bandwidth audio toy that still supports optional external streams;
- a bilingual, backend-free static page with local settings and JSON export;
- a release-grade repository with tests, screenshots, docs and GitHub Pages.

Do **not** use it for:

- a DAW, sequencer or sample library (the synth is a fixed step sequencer, not a general instrument);
- a licensed replica or a product that needs the Wurlitzer trademark, real cabinet scans or
  copyrighted recordings;
- an app that must autoplay audio before a gesture (browsers forbid it);
- a server-backed library with accounts, favourites sync or streaming rights management.

## What “done” means

Do not stop at “the cabinet renders”. A release has all of these:

| Gate | Command | Expected |
| --- | --- | --- |
| Engine | `node --test tests/engine.test.mjs` | 10/10 |
| Repository | `node --test tests/static.test.mjs` | 12/12 |
| In-page | `/?selftest` | 23/23 |
| Local browser | `node tests/browser.test.mjs` | 22/22, zero console errors |
| Live browser | `TEST_URL=https://… node tests/browser.test.mjs` | 22/22 |
| Visuals | `node scripts/screenshot.mjs` | 7 fresh assets |
| Docs | README, AGENTS, 13 docs, community files | links resolve |
| Metadata | `state.json`, licence, sitemap, social card | shape valid |
| Handoff | `AGENTS.md` and `state.json` in the same push | current |

If a number is lower, fix the cause; never edit the claim.

## Non-negotiables

1. **Create the `AudioContext` on a gesture.** `ensure()` is called by play, knobs, ambient and the
   self-test. Creating it at boot yields a suspended context and a silent product on some browsers.
2. **The sleep timer fades `timerGain`, not `masterGain`.** Use smoothstep over the final 120 s:
   `x = remaining/120; x*x*(3-2x)`. At 60 s remaining the gain must be exactly 0.5.
3. **Archive streams must be CORS-enabled.** Route them through one reusable
   `<audio crossOrigin="anonymous">` + `MediaElementAudioSourceNode`. Wikimedia transcode URLs work;
   a random CDN usually does not.
4. **Validate the manifest.** https only, slots C-1…D-4, unique, non-empty title, length caps. Render
   manifest text with `textContent`, never as HTML.
5. **Pin Three.js to one exact version** in the import map (`0.169.0` in the reference). No `latest`,
   no caret, no unpkg, no bundler.
6. **Keep the pure engine pure.** It lives between `/* ENGINE:START */` and `/* ENGINE:END */`; no
   `document`, `window`, `THREE`, `localStorage`, `fetch` or `new Date()`. Tests slice it into Node
   with `new Function`.
7. **Keep EN/TH dictionaries symmetrical.** A static test compares sorted keys; every new string needs
   both languages. Handwrite Thai, do not machine-translate a sleep product.
8. **Paper strips use unlit materials.** A lit `MeshStandardMaterial` blows the paper to white under
   the cabinet spot. Use `MeshBasicMaterial` with a warm tint.
9. **Restrain the bloom.** Reference values: exposure 0.82, bloom strength 0.30, threshold 0.90,
   chrome envMapIntensity 0.82. The first build at 1.08/0.62 blew out walnut, paper and bubbles.
10. **Use a two-context split for UI sounds.** A tiny `MechanicalSounds` context for clacks, coin and
    thunk is separate from the music graph; it works before the main context exists and does not
    pollute the analyser.
11. **Use `--use-mock-keychain` and `--password-store=basic` in headless Chrome.** They prevent
    repeated macOS Keychain prompts. Do not remove them.
12. **Ship the handoff with the code.** `AGENTS.md`, `state.json` and docs in the same push as the
    release. A stale handoff is a defect.
13. **Do not redistribute recordings.** The manifest contains URLs, not audio. Keep licence, credit
    and source per track.
14. **Reduced motion keeps the product complete.** Skip the intro and CSS animation, but keep audio,
    timer and interactions fully working.

## Workflow

### Phase 0 — scaffold and scope (10 min)

```sh
node scripts/scaffold.mjs ~/Projects/my-lullaby-jukebox
cd ~/Projects/my-lullaby-jukebox
python3 -m http.server 8000
```

The scaffold copies the full reference: three source files, `data/playlist.json`, tests, docs,
community files and `state.json`. Decide the product name, the eight melody slots, the archive
count, languages and whether coin mode is on by default. The reference uses Free Play as default.

### Phase 1 — pure engine and tracks

Build the marker blocks before the visuals:

- `I18N` — at least 100 keys, identical in EN and TH.
- `ENGINE` — note maths, sequence parsing, `fadeGain`, `formatClock`, slots, `buildRack`,
  `normalizeSettings`, `validateManifest`, `nextTrackId`, `exportPayload`.
- `TRACKS` — eight objects with `slot` A-1…B-4, `bpm`, `wave`, `gain`, `accent`, bilingual
  title/artist and a `notes` string (`G4:2 B4:1`).

Run `node --test tests/engine.test.mjs`. Do not start the cabinet until the engine is green.

### Phase 2 — audio graph

Build `JukeboxAudio` in this order:

1. lazy `ensure()`;
2. music bus, ambient bus, low/high shelf, compressor, master, timer gain, analyser;
3. generated stereo impulse for reverb;
4. synth scheduler (35 ms interval, 0.28 s look-ahead, octave shimmer);
5. stream element and error/ended hooks;
6. ambient rain/ocean/crickets;
7. pause/resume/seek/stop;
8. timer deadline + 250 ms tick;
9. `getTimerState()` and `debugSetRemaining()` for tests.

Verify with a short manual pass: play/pause, switch to a C track, move every knob, set 15 min, then
`debugSetRemaining(60)` from the console and confirm the gain is 0.5.

### Phase 3 — cabinet

Build `WurlitzerScene` procedurally. The reference geometry is in `references/SCENE.md`:

- body/plinth boxes, extruded arch, chrome/brass tubes, pilasters;
- two bubble-tube curves with 22 bubbles each;
- record deck, tone arm, 8 paper planes;
- 12 key groups, coin plate + falling quarter;
- grille, sign, 30 bulbs;
- wall/floor/rug/dust and five lights;
- PMREM `RoomEnvironment`, ACES tone mapping, restrained bloom.

Capture a screenshot **immediately** after the first build. Tune exposure and bloom before adding
more detail; overexposure hides every material decision.

### Phase 4 — app shell and UI

- DOM rack: 16 strips, two columns, star buttons, empty D slots.
- Four rotary knobs with pointer drag, wheel and keyboard; `role="slider"` and `aria-valuenow`.
- Coin/free-play gate; credits persist.
- Timer dial, progress/seek, mute, help, mobile tabs.
- Language application must redraw the 3D paper textures and the DOM rack.
- Favourites filter, export JSON, reset double-press.
- Self-test with 23 checks and `body.dataset.selftest`.

### Phase 5 — verify locally

```sh
node --test tests/engine.test.mjs tests/static.test.mjs
node tests/browser.test.mjs
```

The browser harness uses one headless Chrome, mock keychain, a temporary profile and a local server
on an ephemeral port. Fix every console error; do not filter them away.

### Phase 6 — screenshots and docs

```sh
node scripts/screenshot.mjs
```

Produces `studio.png`, `playing.png`, `stage.png`, `thai.png`, `stage-hero.png`, `og-card.png`,
`mobile.png`. Then write README, AGENTS, CHANGELOG, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT,
LICENSE, THIRD_PARTY_NOTICES and `docs/*`. The reference docs are a full example; adapt, do not leave
the Wurlitzer facts in a different product.

### Phase 7 — publish

Read the token from the git credential helper into a variable; never print it. Create the repository
through the API, set the remote, push, enable Pages on `main` / root, then run the live suite with
`TEST_URL`. Full recipe: `references/RELEASE.md`.

### Phase 8 — state and skill

Capture elapsed time and token counters from the OpenCode session database into `state.json`, update
the deployment and skill fields, commit and push. Then package this skill and publish its backup via
the `skill-publish` workflow.

## Module map

| Area | Where | Notes |
| --- | --- | --- |
| Dictionaries | `script.js` `I18N` block | 100+ keys, symmetrical |
| Pure logic | `script.js` `ENGINE` block | Node-loadable, no DOM |
| Lullabies | `script.js` `TRACKS` block | 8 note arrays |
| Audio | `JukeboxAudio` | graph, scheduler, stream, ambient, timer |
| 3D | `WurlitzerScene` | renderer, geometry, textures, raycasting |
| App | `WurlitzerApp` | bindings, state, language, coins, self-test |
| Manifest | `data/playlist.json` | C-1…C-4, https, licence/source |
| Tests | `tests/` | engine, static, browser, harness |
| Docs | `docs/` | architecture/reproduction/audio/design/testing/release |

## Recipes

### Add a synth lullaby

1. Add an object to `BUILTIN_TRACKS` with an unused A/B slot and bilingual title/artist.
2. Write `notes` as `NameOctave:beats` tokens (`C4:2 D4:1`); use only public-domain melodies.
3. Choose bpm 54–72, `triangle` or `sine`, gain 0.46–0.50.
4. Run the engine test; update the catalogue table in README and the duration in docs.
5. Open the app and confirm the paper strip and now-playing text update.

### Add an archive stream

1. Find a CORS-enabled public-domain/free recording. Wikimedia `upload.wikimedia.org` transcode MP3s
   return `Access-Control-Allow-Origin: *`; check headers with `curl -sI`.
2. Add a `data/playlist.json` entry in C-1…D-4 with `url`, `duration`, `license`, `credit`, `source`.
3. Run the static + engine tests. Play it in a real browser and confirm audio, seek and ended→next.

### Add an ambient bed

1. In `buildAmbient`, create a looping noise buffer, a filter and a gain into `ambientBus`.
2. If using an LFO, put it on a separate swell gain; a zero layer must be silent.
3. Add a slider/toggle in `index.html`, a dictionary key in both languages, and a field in
   `normalizeSettings` and `DEFAULT_SETTINGS`.
4. Persist and test it (browser suite: slider 30 → layer started → toggle 0).

### Tune a blown-out scene

1. Lower `toneMappingExposure` to 0.82.
2. Bloom strength 0.30, threshold 0.90.
3. Chrome `envMapIntensity` 0.82, roughness 0.19.
4. Spot 26, top 10, points 9/7, hemisphere 0.42.
5. Paper → unlit `MeshBasicMaterial`, tint `0xd8ccb8`.
6. Re-screenshot; do not compensate by making the UI brighter.

### Implement the timer correctly

```js
tickTimer() {
  const remaining = Math.max(0, (this.timer.endsAt - Date.now()) / 1000);
  this.timer.fade = fadeGain(remaining);           // smoothstep, not linear
  this.graph.timerGain.gain.setTargetAtTime(this.timer.fade, this.ctx.currentTime, 0.12);
  if (remaining <= 0) this.finish();                // stop sources, dim lights, clear preference
}
```

Expose `debugSetRemaining(seconds)` so a browser test can prove 0.5 at 60 s without waiting.

### Bilingual pass

1. Add the key to both dictionaries.
2. Add `data-i18n` (or call `t()` in JS).
3. `applyLanguage()` updates static nodes, free-play label, mute/play ARIA, rack, now-playing,
   timer and the 3D paper textures.
4. Run the static test (key symmetry) and the browser Thai check.

## Failure boundaries

| Symptom | Cause | Fix |
| --- | --- | --- |
| White cabinet/paper | exposure/bloom too high; lit paper | values above |
| Silent product | context created before a gesture | `ensure()` on click |
| Silent C tracks | CORS or missing `crossOrigin` | Wikimedia + anonymous |
| Timer cuts abruptly | fading master or linear fade | fade `timerGain`, smoothstep |
| Strips unreadable | 16 textures in 3D | show 8 A/B strips; C/D in DOM |
| Thai 3D text boxes | no Thai system font | keep DOM correct; document the limit |
| Browser suite prompts Keychain | flags removed | restore mock keychain |
| `fetch` fails locally | `file://` | static server |
| Static test fails after docs | missing link/file | update docs and test together |

## Reference

- Live: <https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/>
- Source: <https://github.com/somphol/vintage-wurlitzer-lullaby-jukebox>
- Template: `assets/reference/`
- Depth: `references/SCENE.md`, `AUDIO.md`, `UI.md`, `VERIFY.md`, `RELEASE.md`, `BUILD-LOG.md`
- Scaffold: `node scripts/scaffold.mjs <target>`
