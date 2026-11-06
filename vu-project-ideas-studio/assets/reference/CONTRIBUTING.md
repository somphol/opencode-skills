# Contributing

Thanks for helping. This repository is a catalog, so the highest-value contributions are accuracy,
accessibility and small UI fixes — not a rewrite of the briefs.

## Before you start

- Read [`AGENTS.md`](AGENTS.md) for the architecture and the one-source rule.
- For a typo or broken link, open an issue or a small pull request directly.
- For a new brief or a taxonomy change, open an issue first. Counts are contract constants and must be
  updated everywhere in one change.

## Content rules

1. **Do not rewrite a canonical task body.** They are verbatim specifications. If a brief is wrong,
   discuss it in an issue; do not silently “improve” it.
2. **One duplicate only.** The second Nexus 2035 block stays merged.
3. **Edit the source, not the output.** Change `data/source.json`, `data/metadata.json` or
   `data/prefix.txt`, then run `python3 scripts/build.py`. Never hand-edit `data/projects.js` or
   `prompts/*.md`.
4. **Metadata is curated.** A title is short and specific; a tagline is one sentence about the build;
   a track is one of the nine declared ids.
5. **No third-party assets.** No fonts, images, music, book text or code without a compatible licence
   and a provenance note.

## Code rules

- Vanilla HTML/CSS/JS. No framework, bundler or runtime dependency.
- Keep `data/projects.js` a classic script so `file://` works.
- Do not add external network requests. The only same-origin request besides the page assets is
  `state.json`.
- Keep the clipboard fallback and the `#p/<id>` deep link.
- Track colours live in CSS via `[data-track]`; do not add inline styles.
- Preserve focus visibility, reduced-motion handling and the 390 px layout.

## Workflow

```bash
cd ~/Projects/vu_project_ideas
python3 scripts/build.py
npm run verify
git add -A
git commit -m "fix: …"
```

`npm run verify` must pass. The browser suite rewrites `assets/*.png`; commit the refreshed images if
the UI changed.

## Pull requests

Include:

- what changed and why;
- the commands you ran and their result;
- a screenshot for visual changes (before/after if useful);
- any count, track or prefix update, with the matching docs.

Keep the diff focused. Do not mix a content change with a redesign.

## Reporting bugs

Use <https://github.com/somphol/vu_project_ideas/issues>. Include the brief id (if relevant), browser,
viewport, steps and expected result. Do not include credentials, tokens or personal data.

## Licence

By contributing, you agree that your code and documentation are released under the MIT licence and
that you have the right to submit them. Brief content remains subject to the provenance notes in
[`docs/PROVENANCE.md`](docs/PROVENANCE.md).
