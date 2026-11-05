# Reproduction book — SuatSync 3D

This is the rebuild guide. It assumes you have the repository but not the session that produced it.
Follow it in order; each step states what to produce and how to know it is correct. The canonical
implementation is `index.html`, `style.css`, `script.js`; this document explains the decisions behind
it, not a second copy of the code.

## 0. Outcome and constraints

Build one static page that:

1. Plays the Chinabunchorn Chant nine times from the YouTube video `LAo569-mflM`, a local audio file,
   or a silent timer.
2. Shows large Pali lines (Thai script or Roman), Thai meaning and English gloss, synchronized to the
   current playback position, with click-to-seek.
3. Offers intro, nine round jumps and a dedication jump, 0.75×–1.25× tempo, and a fade-aware volume
   mixer.
4. Tracks nine round completions, sittings and day streaks locally.
5. Draws a slow gold lotus mandala with Three.js and lights a petal per completed round.
6. Works on desktop and mobile, in Thai and English, with keyboard access and reduced motion.
7. Has no build step, no backend, no account, no analytics.

Non-goals: offline installation, audio/video redistribution, automatic beat detection, user accounts,
multi-device sync, or an authoritative liturgical edition.

## 1. Prerequisites

- Node 22+ (only for verification; the app itself needs no Node runtime).
- Python 3 for `http.server`, or any static server.
- Chrome/Chromium for headless verification.
- Network access for Three.js (cdnjs) and, when the user presses Connect, YouTube.
- A working knowledge of vanilla DOM, Web Audio, and Three.js r128's global `THREE`.

Measure the source duration before writing any timing code:

```bash
curl -sL -A "Mozilla/5.0" "https://www.youtube.com/watch?v=LAo569-mflM" \
  | grep -o '"lengthSeconds":"[0-9]*"' | head -1
# "lengthSeconds":"5837"
```

5,837 seconds = 1:37:17. The description has no chapter list, so every section marker is an estimate
and must be calibratable. Say so in the UI; do not imply the video supplies chapters.

## 2. Freeze the content

### 2.1 Chant edition

Use the traditional Thai Pali recension. The source used here is Thai Wikisource
(`พระคาถาชินบัญชร`, retrieved 2026-11-04), which is CC BY-SA 4.0; the underlying chant is public
domain. Record the edition and retrieval date in [CONTENT.md](CONTENT.md) and
[../ATTRIBUTION.md](../ATTRIBUTION.md).

The dataset has 20 display lines:

- `INTRO` — Namo (3×), homage line 1, homage line 2.
- `VERSES` — 15 Chinabunchorn verses.
- `OUTRO` — loving-kindness (metta) and dedication.

### 2.2 Line schema

Every line is an object:

```js
{
  id: "v1",                 // stable, unique
  pali: "ชะยาสะนากะตา ...",     // Thai Pali, the canonical display
  roman: "Jayāsanāgatā ...", // pronunciation guide, not a critical edition
  th: "พระพุทธเจ้า...",         // plain-language Thai meaning
  en: "The Buddhas who...",  // plain-language English gloss
  weight: 1.5                // optional relative duration multiplier
}
```

Rules:

- Do not translate word-for-word if it produces unusable Thai. Summarise the sense of the verse.
- Keep Roman diacritics consistent (`ā`, `ī`, `ū`, `ṃ`, `ṇ`, `ṭ`, `ñ`, `ṅ`).
- `weight` defaults to `max(30, pali.length without spaces)`. Use it only to correct obvious pacing
  (long verses, repeated Namo). Do not hand-tune every line.
- Thai script is shown by default; Roman is a toggle. The other script appears as a secondary line
  when Thai is selected.

### 2.3 Translation licensing

Original glosses are CC BY-SA 4.0 so they can travel with the text. Code and interface are MIT. Keep
this split explicit in `LICENSE` and `ATTRIBUTION.md`.

## 3. Choose the timing model

### 3.1 Eleven markers

`markers = [introStart, round1Start, …, round9Start, outroStart]` (11 values). The end of each section
is the next marker; the dedication ends at the media duration.

Default values on a 5,837-second video:

- intro: 0–218 s (Round 1 verse 1 begins at 3:38)
- nine rounds: 264 s each (4:24), from 218 s to 2,594 s
- dedication: 2,594 s–end (the remainder of the video)

These are guesses chosen to match the video's shape. The UI states that they are estimates until the
user calibrates.

### 3.2 Duration scaling

If the media duration differs from 5,837 s, scale the default section markers by
`duration / NOMINAL_DURATION`. The explicit cue sheet is absolute for the source video; for a
different recording, rebuild the sheet rather than relying on scaling.

### 3.3 Line timing inside a section

If no explicit cue sheet exists, for section `s` with start `a`, end `b`, and
lines `L`:

```text
weight(line) = max(30, pali length without spaces) × (line.weight || 1)
total = Σ weight(line)
local = clamp(t - a, 0, b - a)
lineStart(i) = a + (Σ weight before i / total) · (b - a)
lineEnd(i)   = a + (Σ weight through i / total) · (b - a)
```

`weight` is a **multiplier**, never an absolute weight. The reference dataset uses 1.5× for verse 9
and 1.7× for verse 15. A bug that treated those as absolute values gave both verses under one second;
if you reimplement this, add a test or inspect the computed starts.

`lineAt(t)` returns the section, index, line, section bounds, line bounds and progress. This makes the
dataset portable and survives tempo changes because the media clock is the source of truth.

### 3.4 Explicit verse cues

For real per-verse sync, `data/timings.csv` holds 135 rows (9 rounds × 15 verses) with a
`start_seconds` column. `scripts/build-timings.mjs` validates it and writes `timings.js` as
`window.SUAT_TIMINGS = { rounds: { "1": [start, …] } }`, loaded before `script.js`.

Precedence:

1. Explicit cue sheet for a complete round — exact line starts, next start = line end.
2. Proportional fallback for the intro, dedication, or an incomplete round.

The CSV is the master; `timings.js` is generated and must not be hand-edited. Rounds with fewer than
15 rows are rejected. The sheet is versioned with the app, so corrections ship to every visitor. See
`data/README.md`. There is no in-app calibration screen.

### 3.5 Starting point

On boot the app forces the YouTube source, creates the player paused, and seeks to Round 1 verse 1
(3:38). The intro and dedication remain reachable from the jump rail. `?noauto=1` disables the player
creation for automated tests and screenshots.

## 4. Build the page

### 4.1 HTML order

1. `#stage` with `#scene-canvas` and a vignette. It is `position: fixed`, behind everything, and
   `pointer-events: none`.
2. Skip link, then `.topbar` with brand and toggles.
3. `.hero` with title, lede and four stats.
4. `.studio` — three columns: path panel, karaoke, player panel.
5. Fixed `.transport` at the bottom with seek, play, seek ±15 and focus.
6. Three `<dialog>` elements: About, Summary, History.
7. Toast, noscript, Three.js CDN, `timings.js`, `script.js`.

Use `data-i18n`, `data-i18n-html`, `data-i18n-aria` attributes rather than embedding English in JS.
The title uses `data-i18n-html` because it contains `<br><em>`.

### 4.2 Required IDs and contracts

The renderer caches these IDs (kebab → camelCase): `roundGrid`, `jumpRail`, `paliLine`, `romanLine`,
`translationTh`, `translationEn`, `sectionBadge`, `statusChip`, `nowCount`, `lineList`,
`lineProgress`, `seekBar`, `timeNow`, `timeTotal`, `playBtn`, `playWide`, `volumeSlider`,
`tempoSlider`, `fadeToggle`, `historyDialog`, `historyList`, `toast`,
`versionLine`, and the rest listed in `cacheElements()`. If you rename one, update the list.

### 4.3 CSS

- Tokens at `:root`: near-black indigo background, warm gold accent, cream ink, muted stone, panel
  glass, serif display and Thai-capable sans stack.
- Three-column grid at ≥1120 px, two columns at 840–1120, one column below 840. The player panel
  becomes a two-column sub-grid at the middle breakpoint.
- The karaoke line uses `clamp()` and a 1.62 line-height so Thai ascenders/descenders do not collide.
- Active line: gold wash, brighter text, no layout shift.
- `[hidden] { display: none !important; }` — required because several components set `display:flex`.
- `@media (prefers-reduced-motion: reduce)` neutralises animation; `@media print` hides chrome.
- Fixed footer: add `padding-bottom` on `body` at least the footer height plus safe area.

## 5. Implement the JavaScript, in boot order

### 5.1 State and persistence

```js
state = {
  settings: { lang, script, volume, rate, fade, showVideo, source, theme, fontSize, atmosphere },
  session: { startedAt, savedAt, accum[9], done[9], completedAt },
  stats: { roundsTotal, totalSeconds, sessions: [{ date, rounds, seconds, completedAt }] },
  savedAt
};
```

`normalizeStore(raw)` must never throw: validate every enum, clamp volume 0–100 and rate 0.75–1.25,
coerce arrays to length 9, drop malformed sessions, and fall back to default markers. Key:
`suatsync3d.v1`. On boot, if the saved session is older than 24 h, clear the current sitting but keep
lifetime stats. On `beforeunload`, persist.

### 5.2 Audio adapter

One `audio` object exposes `duration()`, `position()`, `playAudio()`, `pauseAudio()`, `seekTo()`,
`applyRate()`, `applyVolume()`, `chime()`. The source is one of:

- **YouTube** — `YT.Player`, created on boot (or via the reconnect button). `?noauto=1` disables it for
  tests. Player vars: `autoplay:0`, `controls:1`, `modestbranding:1`, `rel:0`, `playsinline:1`, plus
  `origin` only on http(s). On ready: hide placeholder, set volume/rate, seek to Round 1 verse 1,
  update duration. On state change 1/3 mark playing, 2/0 mark paused. On error: show a reconnect
  button and keep the timer available.
- **File** — hidden `<audio>`, object URL, `preload=metadata`; on metadata set currentTime and attach a
  `MediaElementSource → Analyser → Gain → destination` graph. Revoke the previous object URL on change.
- **Timer** — `timerPos` plus `(performance.now() - timerLast)/1000 * rate` while playing. Duration is
  the nominal video duration. A soft 528/792 Hz chime plays when a round completes.

Fade logic: `volCurrent` approaches `volTarget` at ~70 ms intervals. Pause sets a target of 0 and a
`pendingPause` flag; when the current volume is below 0.02, the source actually pauses. Play starts
`volCurrent` at 0, sets the target to the user volume and ramps. If `fade` is off, jump directly.
This prevents clicks and avoids pausing before the fade finishes.

Important: only create the YouTube API script and player after a user gesture. `ensureYT` queues
callbacks behind the global `onYouTubeIframeAPIReady`; a 15-second guard fails cleanly offline.

### 5.3 Rendering cadence

- `requestAnimationFrame` runs the volume fade, 3D and a UI update at ~9 fps (`110 ms`).
- A 1-second `setInterval` calls `processPlayback` so progress survives background throttling.
- `renderNow` only rewrites the line DOM when the section/index changes, unless `force` is true.
- `renderLineList` rebuilds the current section's list; `renderLineStates` updates active/done classes
  and scrolls the active row to the middle without moving the page.
- `updateTransport` writes `seekBar.value` only while the user is not dragging.

### 5.4 Progress algorithm

`processPlayback(position)`:

```text
delta = position - lastPosition
lastPosition = position
if delta <= 0 or delta > 4: return        # seek or suspension
section = sectionAt(position - delta/2)
if 1 <= section <= 9: accum[section-1] += delta
for each round n not done:
  if position >= end(n) - 4 and accum[n] >= 0.5 * (end(n) - start(n)):
     markRound(n)
```

`markRound` sets `done`, adds one to `roundsTotal`, adds the covered seconds to `totalSeconds`, saves,
re-renders, lights the petal and chimes. When all nine are done, `finishSession` records one entry with
today's local date, opens the summary and updates the streak. This deliberately does **not** count a
seek to the end.

Streak: unique local dates with `rounds >= 9`, walking backwards from today (or yesterday if today has
no sitting) until a gap.

### 5.5 3D scene

Use one transparent WebGLRenderer, a perspective camera, ambient + warm point + cool point lights.
Build a group with:

- nine outer extruded lotus petals at radius 1.52, one per round;
- fifteen smaller inner petals at radius 0.86, one per verse;
- two thin torus rings at radius 3.02 and 2.54;
- an emissive icosahedron core and a radial-gradient sprite glow;
- 460 additive points in a disc shell;
- a large faint halo sprite.

Petal material is `MeshStandardMaterial` (gold colour, warm emissive, moderate metalness). Use one
geometry and clone materials so each petal can light independently. `updatePetalStates` maps done →
1.05 emissive, active → 0.5, idle → 0.13 and sets a scale target. `updateWorld` rotates rings, applies
an audio-level pulse, lerps petals and camera parallax, then renders. On mobile, push the camera back
so the mandala does not dominate the text. On resize, update aspect, DPR (cap 2) and distance.

**Themes and atmosphere.** Define seven palettes (midnight, emerald, saffron, rosewood, parchment,
daylight, sandalwood) with idle, active, done, emissive, core, glow, particle, halo, warm and cool
colours. The light palettes also need light surface tokens (`--surface-soft`, `--surface-deep`,
`--surface-solid`, `--surface-video`, `--surface-toast`, `--transport-rgb`, `--line-soft`,
`--on-gold`) or the cards and transport remain dark. `applyWorldTheme` applies
the palette to every material and light; `updatePetalStates` reads it for per-petal state. The CSS
themes mirror the same accents for panels, lines and buttons.

Build four backdrop layers once, behind the mandala: a star field; drifting cloud sprites; rising
ocean bubbles with light shafts; forest fireflies, mist and thin beams. `applyAtmosphere` toggles one
layer at a time and `html[data-atmosphere]` drives a slow CSS wash. Texture generation is shared with
the glow sprite. Add `data-theme`, `data-font-size` and `data-atmosphere` to `<html>` from persisted
settings, and use `--font-scale` in every reading-text `font-size`.

### 5.6 i18n

Two complete string tables. `t(key, vars)` falls back to English, then to the key. `applyI18n` sets
`textContent`, `innerHTML` or `aria-label` depending on the attribute. Dynamic labels (section badge,
status, source note, session copy, streak) are set by render functions after `applyI18n`. The
self-test collects every static key and fails if either language is missing one.

### 5.7 Dialogs and extras

- Dialogs are native `<form method="dialog">`; all action buttons must be `type="button"` unless they
  intentionally submit/close.
- Summary opens only when a full sitting finishes.
- History lists up to 60 sittings and offers JSON export and a destructive clear with confirmation.
- Print builds a new document with the intro, all 15 verses and the dedication, then calls `print()`.
- Keyboard shortcuts must ignore events from inputs, buttons, textareas and open dialogs.

## 6. Verification

```bash
node scripts/check.mjs
node scripts/verify-browser.mjs
node scripts/verify-browser.mjs --screenshots
```

The static check enforces files, local links, script syntax, pinned Three.js, 15 verse ids, 20 complete
line records, the 5,837 s duration, rate clamp, auto-loading YouTube, timer fallback, self-test
exposure, timing-sheet loading, no TODOs/eval/secrets/personal paths, package metadata and at least
three screenshots.

The browser check starts a static server and Chrome with SwiftShader, then:

1. waits for `window.SuatSync`;
2. runs 27 self-tests (dataset, markers, line mapping, streak, normalisation, i18n, DOM wiring);
3. checks 8 DOM facts (9 pills, 11 jumps, WebGL, canvas size, video panel, tabs, dialogs,
   intro line);
4. runs 9 interactions (Roman render, round jump, 15 lines, seek-to-line, timer play, timer pause,
   round tracking, reset, Thai return);
5. checks the timing sheet anchors against the section markers;
6. scans for uncaught exceptions and console errors;
7. optionally writes the four screenshots.

Expected tail:

```text
PASS 27/27 in-app self-tests
PASS 8/8 DOM checks
PASS 9/9 interaction checks
PASS no uncaught runtime errors
OK browser verification complete
```

## 7. Release

1. `node scripts/check.mjs` and `node scripts/verify-browser.mjs --screenshots`.
2. Update `CHANGELOG.md`, `docs/TESTING.md`, `docs/BUILD-STATE.md`, `state.json`.
3. Commit, push `main`, confirm Pages.
4. Fetch the live URL, run the self-tests with `?selftest=1` if you expose a query hook (this build
   exposes `window.SuatSync.runSelfTests()` in DevTools instead), and check the console for errors.

## 8. Pitfalls found while building

- **`sectionAt` loop bound.** Iterate all 11 markers, not 10, or the dedication never highlights. The
  first build hid this because the self-test only checked the middle; add a near-end assertion.
- **`seekToLine` indexing.** The API is 0-based (`data-index`); UI labels are 1-based. Keep the
  distinction explicit or seek by one line.
- **`localStorage.clear()` plus reload does not reset screenshots.** The `beforeunload` handler
  persists state again. Set state through the public API or clear after load.
- **Screenshots catch toasts.** Wait >2.8 s after a jump or remove `.show` before capture.
- **Fixed footer overlap.** Reserve more bottom padding than the footer's visual height, including
  the safe area.
- **`[hidden]` versus `display:flex`.** Add a global `[hidden]` rule.
- **YouTube autoplay.** Embedded controls can start playback without a fade-in. On state change, if
  `volCurrent` is near zero, restore the user volume.
- **CORS and the analyser.** Do not attempt to analyse YouTube audio; use a synthetic envelope and say
  so.
- **Thai line height.** Thai vowels and tone marks need more leading than Latin; test at 320 px.
- **YouTube on start.** The product now loads the IFrame API on boot, which can set YouTube cookies.
  Keep the disclosure in About/SECURITY accurate, and keep `?noauto=1` for tests. Do not add audible
  autoplay; playback still needs a gesture.

## 9. Definition of done

- [ ] Three source files run from a static server with no console errors.
- [ ] 20 line records, all four fields, 15 verse ids, no duplicates.
- [ ] Intro, nine rounds and dedication reachable; the dedication highlights near the end.
- [ ] YouTube loads only after Connect; timer and local file work without YouTube.
- [ ] Volume fade, mute, tempo, restart and ±15 s behave.
- [ ] Clicking a line seeks to that line; the active row follows playback.
- [ ] A full timer sitting marks nine rounds, records a session, updates the streak.
- [ ] Timing sheet loads 9 × 15 starts and the first round shows 3:38/3:54.
- [ ] Thai/English and Thai/Roman toggles preserve position and progress.
- [ ] Mobile 390×844 is usable; no horizontal scroll; footer does not cover the active line at rest.
- [ ] `check.mjs` and `verify-browser.mjs` pass; screenshots refreshed.
- [ ] `AGENTS.md`, `state.json`, docs and attribution are current.
