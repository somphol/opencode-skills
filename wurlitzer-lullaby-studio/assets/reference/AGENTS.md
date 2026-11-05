# AGENTS.md

## What it is

A static, single-page 3D sleep instrument: a procedurally modelled Wurlitzer 1015 “Bubbler” with
bubble tubes, a spinning record, a paper title rack, a mechanical keypad and a coin slot. It has two
audio engines — a Web Audio music-box sequencer (eight public-domain lullabies, zero bandwidth) and a
validated JSON manifest of CORS-enabled archive MP3s — plus three ambient noise generators and a
fade-to-silence sleep timer. The UI is bilingual (EN/TH), persists settings in `localStorage`, and
exports JSON. No backend, build step, package manager, analytics or accounts. The deployed artifact
is the repository root on GitHub Pages.

Read [README.md](README.md) for the product tour, [docs/REPRODUCTION.md](docs/REPRODUCTION.md) for a
from-zero rebuild, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the internal map, and
[state.json](state.json) for the build-session record.

## Commands

Run from the repository root.

| Task | Command |
| --- | --- |
| Serve locally | `python3 -m http.server 8000` → <http://localhost:8000/> |
| Engine + repository tests | `node --test tests/engine.test.mjs tests/static.test.mjs` |
| Headless browser suite | `node tests/browser.test.mjs` |
| Live suite | `TEST_URL=https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/ node tests/browser.test.mjs` |
| In-page self-test | <http://localhost:8000/?selftest> |
| Regenerate screenshots | `node scripts/screenshot.mjs` |
| Deploy | `git push origin main`; Pages serves `main` / root |

The browser suite launches one headless Chrome with `--use-mock-keychain`, `--password-store=basic`
and a temporary profile. Those flags are deliberate: they prevent repeated macOS Keychain prompts.
Chrome is found at the macOS default path or via `CHROME`. The suite needs network access for the
pinned Three.js CDN; the manifest check also needs Wikimedia.

## Architecture

Three source files, no build, plus one data file:

- `index.html` — shell, HUD, help/self-test overlays, JSON-LD, import map pinning Three.js
  `0.169.0`.
- `style.css` — art-deco tokens, cabinet stage, side panels, knobs, paper strips, mobile bottom
  sheets, reduced-motion rules.
- `script.js` — the whole app in six ordered sections: I18N, pure engine, track catalogue,
  `JukeboxAudio`, `WurlitzerScene`, `WurlitzerApp` + self-test + bootstrap.
- `data/playlist.json` — external archive manifest. Slots C-1…D-4, https only, unique, licensed.

Construction order matters: settings → audio store → scene → bind UI → language → settings →
manifest fetch → first render. The scene and audio engine are independent; the app is the only
place that knows both.

Pure engine functions live between `/* ENGINE:START */` and `/* ENGINE:END */`. Tests extract that
block and run it in Node. It must never reference `document`, `window`, `THREE`, `localStorage`,
`fetch` or `new Date()`.

## Decisions and constraints

- **Three.js is pinned through an import map** to `0.169.0`. Do not switch to `latest`, unpkg or a
  bundler; the release is CDN-only and tested against that exact version.
- **The title rack shows 16 slots** (A-1…D-4) even though only A/B and C are populated. Empty slots
  are part of the instrument and must keep the “no record in that slot” path.
- **The 3D rack only has A/B strips.** Archive C tracks appear in the DOM rack. This is intentional:
  the physical 1015 rack is a curated eight-record display; the paper texture atlas stays legible.
- **Procedural note arrays are simplified public-domain settings.** They are tuned for mood, not
  transcript accuracy. Durations are computed at load; changing a tempo changes the displayed time.
- **The sleep timer uses smoothstep, not linear fade.** At 60 s remaining the gain is exactly 0.5;
  tests depend on that.
- **`--use-mock-keychain` stays in the harness.** Removing it brings back macOS Keychain prompts.
- **No new third-party runtime dependency.** Fonts are system stacks; audio is synthesized or
  streamed from the manifest; no npm install.
- **The cabinet is procedural.** There are no GLB/GLTF or texture files. Do not introduce binary
  assets for the cabinet unless the no-build constraint changes.
- **Settings schema is versioned.** `normalizeSettings` is the single gate; add fields there and in
  `state.json`/docs, not ad hoc in the UI.

## Known issues

- The Three.js modules load from jsDelivr; a fully offline first visit is not supported. The
  synth engine itself is offline after the module is cached.
- Safari/WebKit may suspend a `MediaElementAudioSourceNode` on first play; the UI reports the stream
  error and synth tracks remain available. C-1…C-4 require Wikimedia to be reachable.
- The 3D title textures render Thai with the system Thai font. On a machine without a Thai font the
  DOM rack remains correct, but the 3D paper strips may fall back to Latin glyphs.
- Bloom is deliberately restrained for legibility; on very old GPUs the composer is still the
  heaviest part of the frame. `prefers-reduced-motion` disables the intro but not bloom.
- Live-browser tests depend on the CDN and Wikimedia; offline runs will fail the manifest check by
  design.
- `state.json` token counts are a snapshot of the OpenCode session database at release time, not a
  billing statement.

## Continuity

- **Deployed copy:** <https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/>
- **Repository:** <https://github.com/somphol/vintage-wurlitzer-lullaby-jukebox>
- **Pages source:** `main` branch, repository root, `.nojekyll`.
- **Local working copy:** `~/Projects/vintage-wurlitzer-lullaby-jukebox`.
- **Reusable skill:** `~/.config/opencode/skills/wurlitzer-lullaby-studio` and the catalog at
  <https://somphol.github.io/opencode-skills/>.

When the release changes, update `README.md`, `CHANGELOG.md`, this file and `state.json` in the same
push. Do not record tokens, credentials, personal data or absolute home paths here.
