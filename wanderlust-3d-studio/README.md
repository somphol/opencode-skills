# Wanderlust 3D Studio

A reusable OpenCode skill for building and releasing a photography-led travel atlas with vanilla
HTML/CSS/JS, verified Unsplash imagery, live filtering, destination modals, a persistent itinerary,
headless verification and GitHub Pages.

## What it gives you

- A working starter: 3 regions × 5 destinations, hero slider, filters, modal, trip drawer, routes.
- A content contract that keeps budgets, galleries and IDs honest.
- A visual image-curation method that catches mismatched photography before release.
- A self-contained static server and headless verification suite.
- A release playbook: docs, state, GitHub Pages, catalog publishing.

## Install

```sh
# Copy this folder to your OpenCode skills directory, or install it from the catalog:
# ~/.config/opencode/skills/wanderlust-3d-studio
```

If you publish a catalog, add its base URL to the OpenCode `skills` array; the skill is then
discoverable by its folder name.

## Scaffold

```sh
node ~/.config/opencode/skills/wanderlust-3d-studio/scripts/scaffold.mjs ~/Projects/my-atlas
cd ~/Projects/my-atlas
npm install
npm run serve
```

Then:

1. Replace `data.js` with your regions and destinations.
2. Adjust the region accents in `data.js` and the palette in `style.css`.
3. Verify every image visually and with `npm run verify:images`.
4. Run `npm run verify` until it is green.
5. Rewrite the docs, credits and README for your project.

## Validate the starter

```sh
node ~/.config/opencode/skills/wanderlust-3d-studio/scripts/check-starter.mjs
```

It checks the data contract and required files without launching a browser.

## Contents

- `SKILL.md` — the operating instructions
- `references/content-and-images.md` — fields, copy standards, contact-sheet curation
- `references/build-playbook.md` — phase-by-phase build and common pitfalls
- `references/verification-and-release.md` — tests, deployment, state, skill publishing
- `assets/wanderlust-3d-starter/` — working starting point
- `scripts/scaffold.mjs`, `scripts/check-starter.mjs`

## Reference implementation

The skill was extracted from **Wanderlust 3D — Global Destination Explorer**:

- Live: <https://somphol.github.io/wanderlust-3d/>
- Source: <https://github.com/somphol/wanderlust-3d>

Code MIT. Photography under the Unsplash License. See `ATTRIBUTION.md`.
