# Wanderlust 3D — starter

This is a working copy of the Wanderlust 3D travel atlas, included with the
`wanderlust-3d-studio` skill. Replace the content and make it yours.

## Run it

```sh
npm install
npm run serve
# open http://localhost:8080
```

No build step is required. `npm install` only installs the headless verification
tooling.

## Verify it

```sh
npm run verify
npm run verify:images
```

Expected: `81/81 checks passed`, `24/24 images reachable`.

## Make it yours

1. Read `data.js`. Replace the regions and destinations.
2. Keep exactly five destinations per region.
3. Make every `budgetBreakdown` sum to `dailyBudget`.
4. Replace the images with visually verified Unsplash photos.
5. Adjust the region accents and the `:root` palette in `style.css`.
6. Rewrite the copy in `index.html` (title, hero, about, footer) and the docs.
7. Run both checks. Regenerate screenshots with `npm run screenshots`.
8. Deploy with the included GitHub Pages workflow.

## Documentation to write before release

- `README.md` — what, live URL, screenshots, quick start, verification
- `AGENTS.md` — commands, architecture, decisions, known issues, continuity
- `docs/ARCHITECTURE.md`, `docs/DATA-SCHEMA.md`, `docs/VERIFICATION.md`
- `docs/DEPLOYMENT.md`, `docs/REPRODUCTION.md`
- `LICENSE`, `CREDITS.md`

Do not publish without a licence trail for the photography.

## Credits

Starter extracted from [Wanderlust 3D](https://github.com/somphol/wanderlust-3d).
Code MIT. Photography under the Unsplash License (hotlinked, not bundled).
Built with OpenCode and DeepSeek V4.1 Flash.
