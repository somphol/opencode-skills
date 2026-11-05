# Architecture

## Shape of the system

```
Browser
├── index.html            static shell, import map, HUD, overlays
├── style.css             design system and responsive layout
├── script.js             one ES module, six ordered sections
│   ├── I18N              EN/TH dictionaries (marker-delimited)
│   ├── ENGINE            pure maths, slots, settings, manifest (marker-delimited)
│   ├── TRACKS            fifty note arrays in seven synth collections, parsed at load
│   ├── JukeboxAudio      graph + scheduler + stream + ambient + timer
│   ├── WurlitzerScene    renderer + geometry + textures + raycasting
│   └── WurlitzerApp      bindings, persistence, languages, coins, themes, self-test
└── data/playlist.json    validated archive manifest
```

There is no framework and no build. `script.js` is loaded as a module; Three.js is resolved through
the import map in `index.html` at one pinned version (`0.169.0`).

## Boot sequence

1. The module evaluates imports (Three.js, OrbitControls, RoomEnvironment, composer passes).
2. `WurlitzerApp` reads `localStorage`, normalises it with `normalizeSettings`, and picks the last
   track.
3. `JukeboxAudio` is constructed with the same settings object as its store. No `AudioContext` is
   created yet — browsers require a gesture.
4. `WurlitzerScene` creates the renderer, PMREM environment, composer, cabinet, textures and the
   animation loop.
5. UI bindings attach. Language and persisted settings are applied.
6. `boot()` fetches `data/playlist.json` with a 4.2 s abort, merges the validated 32 archive tracks, refreshes
   the DOM and 3D racks, then removes the loading screen and sets `body.dataset.ready`.
7. If the URL has `?selftest`, the in-page suite runs after 500 ms.

`body.dataset` is the test contract: `ready`, `webgl`, `manifest`, `lang`, `motion`, `selftest`.

## Scene graph

```
scene
├── backdrop wall (canvas gradient + sunburst)
├── floor (procedural speckle, metalness 0.38) + circular rug
├── lights: hemisphere, warm shadow spot, rose point, teal point, top point
├── dust Points (260)
├── neon strips ×2
└── cabinet Group
    ├── plinth, chrome base trim, four feet
    ├── body box, front inlay, chrome rails, pilasters, brass rings
    ├── extruded walnut arch + outer chrome TubeGeometry + inner brass trim
    ├── inner arch glass (transparent, depthWrite false)
    ├── bubble tube ×2: glass TubeGeometry + emissive core + 22 bubbles each
    ├── record deck: platter, mat, vinyl, groove rings, label, spindle, tone arm
    ├── title rack: backing, chrome rails, 8 paper planes (active collection page)
    ├── keypad: 19 chrome keys (A–K, 1–8) with canvas labels + brass rims
    ├── coin slot: brass plate, slit, ring, label + animated quarter
    ├── speaker grille texture + chrome frame
    ├── marquee sign texture
    └── 30 emissive arch bulbs
```

The camera is a perspective 36° (45° on narrow screens) at roughly `(0, 3.3, 10.6)`, with
OrbitControls constrained to a lounge-friendly arc. A 1.8 s cubic intro moves it in unless
`prefers-reduced-motion` or `?shot=1`.

Rendering uses ACES filmic tone mapping, exposure 0.82, sRGB output, PCF soft shadows, a PMREM
`RoomEnvironment` for chrome and a restrained `UnrealBloomPass` (strength 0.30, threshold 0.90).
Lighting is deliberately low to keep the walnut and paper legible.

## Audio graph

```
synth voices ─┐
reverb send ──┼─→ musicBus ──┐
stream element┘               ├─→ lowshelf → highshelf → compressor → master → timerGain → analyser → destination
ambient layers ──→ ambientBus ┘
```

- `musicBus` is muted to 0 on pause rather than suspending the whole context, so ambient and timer
  keep running.
- `timerGain` is the only node the sleep timer touches; `fadeGain()` returns 1 above 120 s, exactly
  0.5 at 60 s and 0 at 0 s.
- `analyser` (FFT 256, smoothing 0.82) feeds the RMS level used for bulb/bubble energy.
- Ambient has three independent layers plus a mix bus; the ocean layer has a 0.085 Hz surf LFO on a
  separate swell gain so a zero layer is truly silent.

See [AUDIO](AUDIO.md) for scheduling details.

## Collections, slots and search

```
DOM strip / 3D strip / keypad
  → WurlitzerApp.selectSlot(slot)
  → trackBySlot lookup (A–G synth, H archive)
  → credit gate if Free Play is off
  → current + lastTrack + save()
  → JukeboxAudio.play(track)
      synth: stop sources, start look-ahead scheduler
      stream: set <audio> src, play(), hook errors
  → scene.setPlaying(true), flashStrip(), tone arm, record spin, bubbles speed up
  → renderRack()/refreshSceneRack(), syncNowPlaying(), status, toast
```

The rack is an 88-slot surface (A-1…K-8) split into eleven collection pages. `getRackRows()` applies the
active collection, the title/artist search, and the favourites filter; the 3D rack always shows the
first eight rows of the active page. Choosing a record from another collection switches the page.
The planner uses `scene.refreshRack(entries, lang)` with exactly eight `{slot, track}` rows.
The first-listen queue (`DEFAULT_QUEUE`) holds 32 archive IDs; it is the first-run default and
auto-advances on stream `ended`. The cinematic now-playing card is a separate overlay fed by
`updateNowDetails()`.

An empty slot never reaches audio: it clacks, sets a warning status and shows “No record in that
slot.”

## Display preferences

`settings.theme` is one of `midnight`, `amber`, `emerald`, `rose`. `setTheme()` writes
`body.dataset.theme`, updates the CSS variables, and calls `scene.setTheme()` to recolor the scene
background, fog, bulbs and two point lights. `settings.fontSize` is `normal`, `large` or `xlarge`;
`setFontSize()` writes `body.dataset.font`, which drives a targeted CSS type scale (not a global
browser zoom, which would break the fixed stage). Both persist through `normalizeSettings`.

## Persistence

One key: `wurlitzer-lullaby-studio:v1`. The stored object is the normalised settings schema
(`version`, `lang`, `freePlay`, `credits`, `master`, `bass`, `treble`, `mix`, `ambient.*`, `timer`,
`lastTrack`, `favorites`, `muted`, `theme`, `fontSize`). The first-run flag lives under a separate
localStorage key, not in the export. `normalizeSettings` clamps numbers, rejects unknown languages,
deduplicates favourites and caps credit/variant ranges. Export wraps the same object in a versioned
payload with an ISO timestamp and a track list.

## Why the markers exist

`tests/lib/fixtures.mjs` slices between `/* ENGINE:START */` and `/* ENGINE:END */` and runs that
block in Node with `new Function`. The same trick loads the track arrays between `/* TRACKS:START */`
and `/* TRACKS:END */`. If you move code across a marker, the tests either fail loudly or silently
lose coverage — keep pure logic inside and DOM/Three code outside.

## Extension points

- **New synth lullaby:** add a `T(...)` row to `BUILTIN_TRACKS`, assign an unused A–G slot, add EN/TH
  title and artist, write a `notes` string in `NameOctave:beats` tokens, run the engine tests.
- **New archive stream:** add a validated entry to `data/playlist.json` in C-1…H-8 with an https URL,
  `license: "Public domain"` and a source URL, then run the manifest test.
- **New ambient bed:** create a noise layer in `buildAmbient`, add a slider/toggle in `index.html`,
  route through `ambientBus`, persist it in `normalizeSettings`.
- **New visual:** build inside `buildCabinet`/`buildRecordDeck`; push interactive meshes into
  `this.interactive` with `userData.type` and handle it in `bindEvents`.
