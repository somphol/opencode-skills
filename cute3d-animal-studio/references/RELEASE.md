# Release

## Documentation set

```
README.md  AGENTS.md  CHANGELOG.md  CONTRIBUTING.md  CODE_OF_CONDUCT.md
SECURITY.md  SUPPORT.md  LICENSE  THIRD_PARTY_NOTICES.md  state.json
docs/README.md  ARCHITECTURE.md  REPRODUCTION.md  DESIGN.md  ANIMATION.md
docs/AUDIO.md  TESTING.md  DEPLOYMENT.md  DECISIONS.md  ACCESSIBILITY.md
docs/PERFORMANCE.md  PRIVACY.md  FAQ.md  ROADMAP.md  CREDITS.md
robots.txt  sitemap.xml  manifest.webmanifest  404.html  .nojekyll
```

`AGENTS.md` must cover: what it is, commands, architecture, decisions/constraints, known issues and
continuity. It must be updated in the same push as the release.

## state.json

Record project, release, session id, started/captured time, elapsed seconds, model id/provider,
input/output/reasoning/cache-read/cache-write tokens, total, cost, source files, line counts,
supporting files, test counts, screenshots and skill location. The static suite validates the sum and
the line counts.

## Screenshots

```bash
node scripts/screenshot.mjs
```

Produces: studio, bunny, penguin, shiba, Thai, mobile, transparent snapshot and a 1200×630 OG card
drawn in a canvas with the live pet snapshot.

## GitHub Pages

1. Create the repository (API or web) without auto-init, or merge the initial licence commit.
2. Push `main`.
3. Enable Pages: `POST /repos/{owner}/{repo}/pages` with
   `{"source":{"branch":"main","path":"/"}}`.
4. Wait for the Pages build, then run the live browser suite.
5. Add `.nojekyll`, canonical/OG URLs and a sitemap that match the final URL.

## Skill mirror

```bash
# local skill
~/.config/opencode/skills/<skill-id>/

# catalog repository
cd ~/Projects/opencode-skills
# add { name, source: "~/.config/opencode/skills/<skill-id>", description, license } to skills.json
node sync.mjs <skill-id>
node sync.mjs --check
git add -A && git commit -m "feat: add <skill-id> skill" && git push
```

The catalog publishes through GitHub Pages; `index.json` is what OpenCode reads when the catalog URL
is added as a skill source.

## Final checklist

- [ ] 19 engine / 80 repository / 24 browser / 20 in-page
- [ ] Live suite 24/24
- [ ] zero console errors
- [ ] assets regenerated from the app
- [ ] `state.json` line counts and token totals current
- [ ] README counts match reality
- [ ] `AGENTS.md` current
- [ ] Pages URL in canonical, OG and sitemap
- [ ] skill copied to the catalog and `--check` passes
