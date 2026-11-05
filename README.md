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
| [`session-export`](session-export/SKILL.md) | Export OpenCode sessions to Markdown with a maintained TOC and JSON index, sanitized. Local master, optional private mirror. |
| [`session-to-skill`](session-to-skill/SKILL.md) | Turn a finished session or project into a reusable skill: extract the template, write the instructions, prove it by scaffolding. |
| [`skill-publish`](skill-publish/SKILL.md) | Publish a skill to GitHub: validate, lay out `skills/<id>/`, write handoff and attribution notes, serve an HTTP catalog via Pages. |
| [`khan-trig-studio`](khan-trig-studio/SKILL.md) | Build a bilingual, offline trigonometry studio with three canvas modules, exact math, practice persistence, headless checks and a Pages release. |
| [`leab-tui-studio`](leab-tui-studio/SKILL.md) — [Leab-Tui 3D](https://somphol.github.io/leab-tui-3d/) | Build a bilingual, static 3D **trick-taking studio** for a traditional tile game: rules contract, pure engine, heuristic AI, coach, undo, persistence, headless verification and a release handoff. |
| [`cinematic-3d-release`](cinematic-3d-release/SKILL.md) | Turn a static Three.js app into a release-grade product: cinematic camera director, Step playback, release docs, reproduction blueprint and a build check. |
| [`3d-puzzle-solver-studio`](3d-puzzle-solver-studio/SKILL.md) — [15-puzzle studio](https://somphol.github.io/full-3d-15-puzzle-studio/) | Build a tactile 3D sliding-puzzle studio: parity-safe shuffle, A* (Manhattan + linear conflicts) in a Web Worker, hints, bilingual UI, records, headless checks and a Pages release. Includes a runnable reference and scaffold script. |
| [`wurlitzer-lullaby-studio`](wurlitzer-lullaby-studio/SKILL.md) — [Lullaby Jukebox](https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/) | Build a bilingual, static 3D Wurlitzer 1015 bubbler and sleep studio: procedural music-box lullabies, CORS-safe archive streams, rain/ocean/crickets, coin slot, smoothstep sleep timer, four test layers and a Pages release. Includes the working reference and a scaffold. |
| [`cute3d-animal-studio`](cute3d-animal-studio/SKILL.md) — [Cute3D Studio](https://somphol.github.io/cute3d-animal-studio/) | Build a release-grade, zero-asset 3D animal character studio: seven original procedural pets, layered fur/feather coat shells, idle/click animation, live colours and accessories, synthesized audio, EN/TH UI, presets, transparent PNG export, four test layers and a Pages release. Includes the working reference and scaffold. |
| [`lucky-draw-3d-studio`](lucky-draw-3d-studio/SKILL.md) — [Lucky Draw Studio](https://somphol.github.io/full-3d-lucky-draw-studio/) | Build a release-grade 3D lucky-draw prize wheel: cryptographically fair pick before the spin, textured 3D wheel, roster/presets, confetti, bilingual UI, local history, JSON/CSV export, four test layers and a Pages release. Includes a runnable reference and scaffold script. |

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
