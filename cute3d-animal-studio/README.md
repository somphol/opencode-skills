# Cute3D Animal Studio — skill

A reusable playbook for building a zero-asset 3D animal character studio with Three.js, seven pets and a layered fur/feather coat system. It packages
the shipped source, the scene/rig numbers, the UI and export contract, the verification gates and the
release procedure from a completed build.

## Install

The folder lives at:

```
~/.config/opencode/skills/cute3d-animal-studio/
```

OpenCode loads it automatically when the task matches the description. The catalog mirror is
<https://github.com/somphol/opencode-skills>.

## Scaffold a new project

```bash
node ~/.config/opencode/skills/cute3d-animal-studio/scripts/scaffold.mjs ~/Projects/my-animal-studio
cd ~/Projects/my-animal-studio
python3 -m http.server 4173
```

The scaffold copies `assets/reference/` (HTML, CSS, JS, manifest, favicon) into an empty folder. It
does not copy docs, tests or screenshots; build those from the checklists in `references/`.

Add `--force` to overwrite an existing folder.

## What is inside

| Path | Purpose |
| --- | --- |
| `SKILL.md` | when to use, non-negotiables, build sequence, pitfalls |
| `references/SCENE.md` | renderer, lights, camera, props, snapshot numbers |
| `references/RIGS.md` | rig contract, per-animal geometry, palettes, accessories |
| `references/UI.md` | panel, state, share format, i18n, mobile, accessibility |
| `references/VERIFY.md` | four test layers and exact commands |
| `references/RELEASE.md` | docs set, state file, Pages, catalog publishing |
| `assets/reference/` | the complete shipped source |
| `assets/preview.png` | the live studio |
| `assets/og-card.png` | social card reference |
| `scripts/scaffold.mjs` | copy the reference into a new project |

## Non-negotiables in one line

No external art, original characters, a pure engine block, a dedicated snapshot camera, sanitized
storage/URLs, and a verified live release with an up-to-date `AGENTS.md`.

## Provenance

Built from **Cute3D: Procedural Code-Only Animal Studio**:
<https://github.com/somphol/cute3d-animal-studio> · <https://somphol.github.io/cute3d-animal-studio/>.

MIT © 2026 Somphol Boonjing. See [ATTRIBUTION.md](ATTRIBUTION.md).
