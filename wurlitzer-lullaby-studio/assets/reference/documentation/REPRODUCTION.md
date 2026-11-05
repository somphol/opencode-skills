# Reproduction guide

A from-zero rebuild that another agent can follow without this session. Work in
`~/Projects/vintage-wurlitzer-lullaby-jukebox`.

## 1. Create the static skeleton

```bash
mkdir -p ~/Projects/vintage-wurlitzer-lullaby-jukebox/{assets,data,tests/lib,scripts,docs,.github/workflows,.github/ISSUE_TEMPLATE}
cd ~/Projects/vintage-wurlitzer-lullaby-jukebox
git init -b main
```

Create `index.html`, `style.css`, `script.js`, `data/playlist.json`. There is **no package.json** and
no install step; Node is only for tests.

## 2. HTML shell

Order matters:

1. `<meta charset>`, viewport, title, description, theme colour, Open Graph/Twitter.
2. favicon and stylesheet.
3. JSON-LD `WebApplication` block.
4. Import map pinning exactly:
   `three` → `https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js`,
   `three/addons/` → `.../examples/jsm/`.
5. Body with `#stage` + `#stage-canvas`, `.app-shell` (topbar, `.layout` with `#rack-panel`,
   `#stage-caption`, `#studio-panel`, status bar), mobile tabs, toast, loading, help modal,
   self-test overlay, and `<script type="module" src="script.js">`.

Keep every id referenced by `$('…')` present; `tests/static.test.mjs` cross-checks them.

## 3. CSS design system

Tokenise the palette (`--ink`, `--gold`, `--cream`, `--rose`, `--teal`), serif/sans/mono stacks, the
topbar/status heights, radii and easing. Build the stage background, glass panels, paper strips,
chrome keys, rotary knobs, seek/slider skins, timer dial, toast, modal, loading arch, mobile bottom
sheets, reduced-motion block. Important layout rules:

- `.layout` is a 3-column grid on desktop: rack / open stage / studio.
- At `max-width: 1000px` the panels become fixed bottom sheets toggled by `#tab-songs`/`#tab-studio`;
  the stage caption hides when a sheet is open.
- The rack is a two-column, row-flow grid. A category page shows eight strips as 4 rows × 2 columns,
  matching the 3D rack; All shows all 64 slots in the same two-column flow.
- `.strip` is a 3-column grid: open button spans the first two columns, star sits in the third.

## 4. I18N and pure engine

In `script.js`, create the marker blocks first:

```
/* I18N:START */ const I18N = { en: {...}, th: {...} }; /* I18N:END */
/* ENGINE:START */ ... /* ENGINE:END */
/* TRACKS:START */ ... /* TRACKS:END */
```

The engine must export (by name, because tests re-import them): `noteToMidi`, `midiToFreq`,
`parseSequence`, `sequenceBeats`, `sequenceSeconds`, `noteAtBeat`, `fadeGain`, `formatClock`,
`slotOf`, `slotParts`, `slotOrder`, `buildRack`, `normalizeSettings`, `validateManifest`,
`nextTrackId`, `exportPayload`, `DEFAULT_SETTINGS`. No DOM/window/THREE/fetch/Date.

`fadeGain` must be smoothstep: `x = remaining / 120; x*x*(3-2x)`, returning 1 at ≥120 s and 0 at ≤0.
`formatClock` is `m:ss`. `buildRack` returns 64 rows A-1…H-8 with `{slot, track|null}`.

## 5. Eight lullabies

Each track: `id`, `slot` A-1…G-2, `engine: 'synth'`, `collection`, `bpm`, `wave` (`triangle`/`sine`), `gain`,
`accent`, EN/TH `title`/`artist`, and `notes`. Note format is `C4:2 D4:1` (name + octave : beats).
After the array, parse each sequence and compute `duration = sequenceBeats * 60 / bpm`.

Use public-domain melodies or original compositions. Shipped tempos produce 39–87 s loops; the
sequencer loops seamlessly. The reference ships 50 tracks across eight collections.

## 6. Audio engine

`JukeboxAudio` must:

- create the `AudioContext` lazily in `ensure()`;
- build music/ambient buses, low/high shelf EQ, compressor, master, timer gain, analyser, generated
  stereo impulse reverb;
- schedule synth notes 0.28 s ahead with a 35 ms interval, per-note gain envelope and a quiet octave
  shimmer;
- play streams through one reusable `<audio crossOrigin="anonymous">` + `MediaElementSourceNode`,
  with `ended`/`error` hooks;
- generate rainfall (white/highpass + droplets), ocean (brown/lowpass + 0.085 Hz swell), crickets
  (pink/bandpass + chirp bursts), each with an independent gain;
- implement pause/resume (music bus 0/1, keep scheduler position), seek, stop and timer;
- expose `getTimerState()` and `debugSetRemaining(seconds)` for tests.

## 7. Three.js cabinet

`WurlitzerScene` builds everything procedurally. The minimum viable geometry set:

- plinth/body boxes, extruded arch shape, chrome tubes for trim, pilasters;
- two Catmull-Rom bubble-tube curves with glass TubeGeometry, emissive core, 22 spheres each;
- deck with platter/vinyl/label/spindle + tone arm group;
- 8 paper strip planes with canvas textures (redraw on language change);
- 16 key groups (A–H, 1–8) with circle caps + canvas labels;
- coin plate + animated quarter;
- sign canvas, grille canvas, 30 bulbs;
- wall gradient, floor speckle, rug, dust, five lights.

Use `PMREMGenerator.fromScene(new RoomEnvironment())`, ACES tone mapping and a light bloom. Keep the
chrome env intensity below 1 and exposure around 0.82; higher values blow out the paper and wood
(the first build did exactly that).

Raycasting: push strip meshes, key groups and the coin group into `this.interactive`, set
`userData.type`, and walk parents in `findData`. Suppress clicks after a >7 px drag so orbiting never
selects a strip.

## 8. App wiring

`WurlitzerApp` owns settings, current track, pending keypad letter/number, favourites filter,
manifest state and the reset double-press. It binds DOM, creates four knobs (pointer drag, wheel,
arrow keys), applies language to `[data-i18n]` and redraws the 3D paper, syncs now-playing/progress,
handles coin/credit/free-play, timer, mute, ambient sliders, export, mobile tabs, help and keyboard
shortcuts.

Add the category tabs, title search, four theme swatches and three text-size buttons. `getRackRows()`
is the single filter path for collection/search/favourites; `refreshSceneRack()` feeds exactly eight
`{slot, track}` rows to the 3D rack. `setTheme()` must call `scene.setTheme()` as well as writing
`body.dataset.theme`; `setFontSize()` writes `body.dataset.font` and uses targeted CSS overrides, not
browser zoom.

The self-test must run in-page and return `{total, passed, checks}`; set
`body.dataset.selftest`. Boot sets `body.dataset.ready = 'true'` only after the manifest attempt and
the loading-screen minimum.

## 9. Manifest

`data/playlist.json`:

```json
{ "version": 1, "tracks": [
  { "id": "...", "slot": "H-1", "title": "...", "artist": "...",
    "url": "https://upload.wikimedia.org/...mp3", "duration": 110,
    "license": "...", "credit": "Wikimedia Commons", "source": "https://commons.wikimedia.org/wiki/File:..." }
] }
```

Requirements: slot C-1…H-8, unique, https URL, non-empty title, `license: "Public domain"`.
Wikimedia transcode URLs add
`Access-Control-Allow-Origin: *`, which Web Audio needs. Do not use SoundHelix or other hosts without
checking CORS.

## 10. Tests

Copy/adapt `tests/lib/harness.mjs` (static server + Chrome DevTools Protocol, `--use-mock-keychain`).
Write:

- `tests/engine.test.mjs` — 10 checks on the pure block and extracted tracks.
- `tests/static.test.mjs` — 12 checks on files, HTML, pinning, ids, i18n, engine purity, manifest,
  docs, state, secrets, CSS.
- `tests/browser.test.mjs` — 25 checks: boot, self-test, selection, transport, coin, empty slot,
  keypad, language, favourites, knobs, ambient, timer, persistence, export, help, mobile, reduced
  motion, console errors.
- `scripts/screenshot.mjs` — desktop/playing/Thai/mobile/OG captures.

Expected first run: engine 11/11, static 12/12, browser 25/25, in-page 25/25, zero console errors.
If the manifest check fails, confirm Wikimedia is reachable; if WebGL fails, pass
`--enable-unsafe-swiftshader` (already in the harness).

## 11. Docs and release

Add README, AGENTS, CHANGELOG, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT, LICENSE,
THIRD_PARTY_NOTICES, `docs/*`, CI, issue templates, `.nojekyll`, robots, sitemap, favicon, screenshots
and `state.json`. Then:

```bash
git add -A && git commit -m "Wurlitzer Lullaby Studio 1.0.0: ..."
git push origin main
```

Create the repository via the GitHub API with the token from the git credential helper (never print
it), configure the remote, push, and enable Pages on `main` / root. Verify the live URL with
`TEST_URL=... node tests/browser.test.mjs`.

## 12. Common failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| White/blown 3D | exposure or bloom too high | exposure 0.82, bloom 0.30, chrome env < 1 |
| Blank paper strips | lit MeshStandard paper | use MeshBasicMaterial with a slight tint |
| Silent streams | CORS or missing `crossOrigin` | use Wikimedia transcode URLs and anonymous CORS |
| No audio at all | context created before a gesture | create it in `ensure()` on click |
| Timer never fades | clock uses a different node | fade `timerGain`, not `masterGain` |
| Thai text missing in 3D | no Thai font on the machine | DOM remains correct; install a Thai system font |
| Browser tests hang | Chrome path or Keychain prompt | set `CHROME`, keep mock-keychain flags |
| `fetch` fails locally | opened via `file://` | serve with `python3 -m http.server` |
