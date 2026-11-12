# OpenCode skills — catalog

An HTTP skill catalog for OpenCode. Add one URL and every skill here is available:

```jsonc title="opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  "skills": ["https://somphol.github.io/opencode-skills/"]
}
```

OpenCode reads `index.json` from that base URL, downloads the listed files, and registers each skill
by its folder name. Bump happens automatically: the catalog rebuilds `version` from the content hash,
so a changed skill refreshes in the client's cache.

## Skills

| Skill | What it does |
| --- | --- |
| [`city-miniature`](city-miniature/SKILL.md) — [Bangkok example](https://somphol.github.io/bangkok-miniature/) | Build an interactive 3D miniature of a city **from scratch** as one self-contained HTML file. The San Francisco diorama is a mechanism reference; the blank starter and city brief are the workflow. |
| [`city-3d-tour-guide`](city-3d-tour-guide/SKILL.md) — [Bangkok guide](https://somphol.github.io/bangkok-3d-tour-guide/) | Build a bilingual, static 3D **tourist guide** with five authored landmarks, drone/walk/transit modes, drag-look controls, lighting, audio, itinerary export and a full release handoff. Includes the working Bangkok app as a mechanism reference. |
| [`multiplayerization`](multiplayerization/SKILL.md) | Add **real-time multiplayer** to any app: authority/transport choice, rooms, versioned protocol, host approval, strong passcode generator, per-participant projection, chat/voice, abuse caps, two-client tests and release docs. |
| [`session-export`](session-export/SKILL.md) | Export OpenCode sessions to Markdown with a maintained TOC and JSON index, sanitized. Local master, optional private mirror. |
| [`session-to-skill`](session-to-skill/SKILL.md) | Turn a finished session or project into a reusable skill: extract the template, write the instructions, prove it by scaffolding. |
| [`session-to-catalog`](session-to-catalog/SKILL.md) | Share a finished session to GitHub: mine the local session DB, distil a skill, rebuild and verify the content-hashed catalog, keep transcripts private. |
| [`skill-publish`](skill-publish/SKILL.md) | Publish a skill to GitHub: validate, lay out `skills/<id>/`, write handoff and attribution notes, serve an HTTP catalog via Pages. |
| [`khan-trig-studio`](khan-trig-studio/SKILL.md) | Build a bilingual, offline trigonometry studio with three canvas modules, exact math, practice persistence, headless checks and a Pages release. |
| [`leab-tui-studio`](leab-tui-studio/SKILL.md) — [Leab-Tui 3D](https://somphol.github.io/leab-tui-3d/) | Build a bilingual, static 3D **trick-taking studio** for a traditional tile game: rules contract, pure engine, heuristic AI, coach, undo, persistence, headless verification and a release handoff. |
| [`leab-tui-p2p-studio`](leab-tui-p2p-studio/SKILL.md) — [Leab-Tui 3D](https://somphol.github.io/leab-tui-3d/) | Add **serverless WebRTC multiplayer** to a static Three.js table game: room lobby, two-human start, bot fill, per-seat redaction, ghost meshes, disconnect-to-bot and a two-browser test harness. |
| [`cinematic-3d-release`](cinematic-3d-release/SKILL.md) | Turn a static Three.js app into a release-grade product: cinematic camera director, Step playback, release docs, reproduction blueprint and a build check. |
| [`3d-puzzle-solver-studio`](3d-puzzle-solver-studio/SKILL.md) — [15-puzzle studio](https://somphol.github.io/full-3d-15-puzzle-studio/) | Build a tactile 3D sliding-puzzle studio: parity-safe shuffle, A* (Manhattan + linear conflicts) in a Web Worker, hints, bilingual UI, records, headless checks and a Pages release. Includes a runnable reference and scaffold script. |
| [`wurlitzer-lullaby-studio`](wurlitzer-lullaby-studio/SKILL.md) — [Lullaby Jukebox](https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/) | Build a bilingual, static 3D Wurlitzer 1015 bubbler and sleep studio: procedural music-box lullabies, CORS-safe archive streams, rain/ocean/crickets, coin slot, smoothstep sleep timer, four test layers and a Pages release. Includes the working reference and a scaffold. |
| [`cute3d-animal-studio`](cute3d-animal-studio/SKILL.md) — [Cute3D Studio](https://somphol.github.io/cute3d-animal-studio/) | Build a release-grade, zero-asset 3D animal character studio: seven original procedural pets, layered fur/feather coat shells, idle/click animation, live colours and accessories, synthesized audio, EN/TH UI, presets, transparent PNG export, four test layers and a Pages release. Includes the working reference and scaffold. |
| [`algorithm-explorer-studio`](algorithm-explorer-studio/SKILL.md) — [Algorithm Explorer](https://somphol.github.io/algorithm-explorer/) | Build a release-grade, zero-asset 3D algorithm-pattern explorer: 15 deterministic step engines, 15 procedural Three.js scenes, mark-synchronized Python/JS/C++ code, a 30-question quiz, local practice tracking, 106-check verification and a GitHub Pages release. |
| [`calibre-scroll-studio`](calibre-scroll-studio/SKILL.md) — [Aurelis 07](https://somphol.github.io/aurelis-calibre-07/) | Build a release-grade, zero-asset 3D luxury watch that disassembles over scroll: procedural case, dial and movement, normalized scroll timeline, two-stage explosion, callouts, mobile, a 24-check headless gate, docs, session ledger and GitHub Pages. Includes the working reference and a scaffold. |
| [`vu-project-ideas-studio`](vu-project-ideas-studio/SKILL.md) — [VU Project Ideas](https://somphol.github.io/vu_project_ideas/) | Turn a long prompt list into a release-grade, searchable project-brief catalog: parse blocks, merge duplicates, curate metadata, one request prefix, 54 copy-ready Markdown files, search/filters/deep links, 390 px verification and a Pages release. Includes the working reference and a scaffold. |
| [`lucky-draw-3d-studio`](lucky-draw-3d-studio/SKILL.md) — [Lucky Draw Studio](https://somphol.github.io/full-3d-lucky-draw-studio/) | Build a release-grade 3D lucky-draw prize wheel: cryptographically fair pick before the spin, textured 3D wheel, roster/presets, confetti, bilingual UI, local history, JSON/CSV export, four test layers and a Pages release. Includes a runnable reference and scaffold script. |

## Preview channel

Test unpublished changes without touching the stable catalog:

```sh
node sync.mjs --preview              # every skill that differs from index.json
node sync.mjs --preview <name>       # force one skill
node sync.mjs --check --preview      # verify preview/index.json is current
```

Point a test client at `https://somphol.github.io/opencode-skills/preview/`. How to tell the two
apart: stable versions are 12 hex characters, preview versions are prefixed `p-`, and
`preview/BUILD.json` records the commit, the dirty flag and the build time. Preview is a **partial**
catalog by design — only changed skills appear. Commit `preview/` for Pages to serve it, and rebuild
it after every stable sync so it never looks like a live test when it is stale.

## Local install instead

```sh
git clone https://github.com/somphol/city-miniature.git \
  ~/.config/opencode/skills/city-miniature
```

## Maintaining the catalog

`sync.mjs` copies each skill from its source repository listed in `skills.json`, then rewrites
`index.json`:

```sh
node sync.mjs             # sync everything
node sync.mjs --check     # verify the tree matches index.json (CI-friendly)
```

Never edit a skill folder here by hand — it is generated. Change the source repository, then sync and
commit.

## Licence and provenance

Each skill carries its own licence and provenance notes; see the skill's `README.md`. Skills are not
mirrored from third parties without permission — only work owned by this account is published here.
