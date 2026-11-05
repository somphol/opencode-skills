# Wurlitzer Lullaby Studio — OpenCode skill

Build a bilingual, static 3D lullaby jukebox and sleep studio: a procedural Wurlitzer 1015 bubbler,
50 synthesized music-box lullabies across eight category pages, four public-domain archive streams,
rain/ocean/crickets, four themes, three text sizes, a coin slot, a smoothstep sleep timer, four test
layers and a GitHub Pages release.

## Install

Add the catalog to `opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "skills": ["https://somphol.github.io/opencode-skills/"]
}
```

Or copy the folder locally:

```sh
git clone https://github.com/somphol/opencode-skills.git /tmp/opencode-skills
cp -R /tmp/opencode-skills/wurlitzer-lullaby-studio ~/.config/opencode/skills/
```

Then ask OpenCode to use `wurlitzer-lullaby-studio`.

## Quick start

```sh
node scripts/scaffold.mjs ~/Projects/my-lullaby-jukebox
cd ~/Projects/my-lullaby-jukebox
python3 -m http.server 8000
# open http://localhost:8000/
```

The scaffold is the full reference release minus screenshots and git history. Replace the product
name, palette, track list and copy; run `node scripts/screenshot.mjs` to regenerate images; run the
suites before publishing.

## What is in the skill

| Path | Purpose |
| --- | --- |
| `SKILL.md` | model-facing workflow, gates, non-negotiables, recipes |
| `references/SCENE.md` | cabinet coordinates, materials, lighting, raycasting |
| `references/AUDIO.md` | graph, scheduler, streams, ambient, timer |
| `references/UI.md` | layout, strips, knobs, i18n, persistence, coin flow |
| `references/VERIFY.md` | four test layers, harness, boot contract, debugging |
| `references/RELEASE.md` | docs set, state.json, GitHub API, Pages, skill catalog |
| `references/BUILD-LOG.md` | construction order, dead ends, what regressed |
| `assets/reference/` | working source, tests, docs and manifest |
| `scripts/scaffold.mjs` | copies the reference into a new project |

## Verification (reference release)

```sh
node --test tests/engine.test.mjs tests/static.test.mjs   # 23
node tests/browser.test.mjs                              # 25 + 25 in-page
```

Live: <https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/>

## Licence and provenance

MIT for the skill and the reference code. Archive recordings are linked, not redistributed, and keep
their Wikimedia Commons licences. See [ATTRIBUTION.md](ATTRIBUTION.md) and the reference's
`THIRD_PARTY_NOTICES.md`.
