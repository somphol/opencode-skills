# Verification and release

## Test layers

### 1. Data integrity

Run inside the browser or in Node with a `window` stub:

- 3 regions, 15 destinations, exactly 5 per region
- unique destination IDs
- 3 gallery images each
- budget breakdown sums to `dailyBudget` (±1)
- every primary image is `https://images.unsplash.com/…`
- every route references existing destination IDs
- every `regionId` resolves
- every `bestMonths` value is a valid 3-letter abbreviation
- every vibe appears in `TAG_ORDER`

### 2. Headless UI

Use `puppeteer-core` with the locally installed Chrome. Start a tiny static server on port 0 so the
test is self-contained and never fights a dev server.

Recommended checks (the reference project has 81):

**Static/SEO** — title, one h1, meta description, Open Graph, skip link, JSON-LD parses.

**Catalogue** — 15 cards, 4 tabs, 12 chips, default count.

**Region** — each tab returns 5; All restores 15; first card order is correct.

**Search** — a destination query ranks the expected card first; clear works; a semantic query
(“turtle”) returns the wildlife destinations; reset restores 15.

**Tags** — a tag returns the expected OR count; `aria-pressed` toggles; off restores 15.

**Budget/sort** — luxury returns the expected count; budget sort starts with the cheapest; reset.

**Modal** — correct title, 3 thumbs, 3 attractions, 4 cuisine cards, gallery swap changes the main
image, add updates the badge and localStorage, Escape closes and restores focus.

**Drawer** — opens, one item, nights, cost, increment/decrement, remove, empty state.

**Routes** — adding the Japan route produces 4 items, 11 nights and the expected total; persisted.

**Persistence** — reload keeps the items; clear requires two clicks.

**Deep link** — `#/destination/venice` opens Venice; closing clears the hash.

**Mobile 390** — no horizontal overflow, back-to-top hidden, menu opens/closes, modal and drawer fit.

**Tablet 768** — no overflow, two-column grid.

**Accessibility** — every image has `alt`; every visible button/link has an accessible name.

**Console** — zero page errors, zero console errors.

### 3. Image reachability

Parse the data and the static `index.html` hero URLs, deduplicate, and HEAD each with a small crop
query. Expect all 200 + `image/*`. This is a network test, not part of the offline gate.

### 4. Manual review

- hero autoplay/dots/arrows
- search from hero scrolls and applies
- combined filters never crash
- modal gallery and prev/next
- add/reload/remove/clear
- copy/download
- mobile menu and full-screen modal/drawer
- reduced motion
- keyboard-only traversal
- failed image placeholder

## Reference commands

```sh
npm install
npm run verify
npm run verify:images
npm run screenshots
```

Expected:

```text
81/81 checks passed
Release checks passed.
24/24 images reachable.
```

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Chrome not found | `CHROME_PATH=/path/to/chrome npm run verify` |
| Screenshot hangs | lazy images never resolve; cap the image wait with `Promise.race` |
| Search count differs | semantic search includes mentions, e.g. Osaka mentions Kyoto |
| Mobile overflow | inspect `scrollWidth` on html/body; check figure margins and min-width |
| Drawer behind modal | close the modal before opening the drawer |
| Modal empty on deep link | open after the first render, ~120 ms |
| Tailwind warning | expected Play CDN dev warning, not an error |
| Pages 404 | Pages not enabled or source not set to GitHub Actions |

## Documentation checklist

The release is not done until another agent can operate it without this conversation.

- [ ] `README.md` — what it is, live URL, screenshots, quick start, verification, structure, docs, credits
- [ ] `AGENTS.md` — what, commands, architecture, decisions, known issues, continuity
- [ ] `docs/ARCHITECTURE.md` — render flow, state, filters, modal, storage, a11y, performance
- [ ] `docs/DATA-SCHEMA.md` — every field, budget rules, image rules, adding content
- [ ] `docs/DESIGN-SYSTEM.md` — tokens, type, components, motion, responsive
- [ ] `docs/VERIFICATION.md` — commands, results, manual checklist, troubleshooting
- [ ] `docs/DEPLOYMENT.md` — Pages, local, cache, rollback, custom domain, CSP
- [ ] `docs/REPRODUCTION.md` — prompt, environment, build order, decisions, exact steps
- [ ] `CONTRIBUTING.md`, `CHANGELOG.md`, `SECURITY.md`, `LICENSE`, `CREDITS.md`
- [ ] `state.json` and `STATE.md` with real numbers

## Deploy to GitHub Pages

1. Commit and push to `main`.
2. Create the repo first if needed. With the credential helper:

```sh
cred=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill)
user=$(printf '%s\n' "$cred" | sed -n 's/^username=//p')
pass=$(printf '%s\n' "$cred" | sed -n 's/^password=//p')
```

Never echo `pass`. Use it only inside the same shell session for API calls.

3. Enable Pages:

```sh
curl -s -X POST \
  -H "Authorization: Bearer $pass" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/<user>/<repo>/pages \
  -d '{"build_type":"workflow","source":{"branch":"main","path":"/"}}'
```

4. If Pages was enabled after the first push, dispatch the workflow:

```sh
curl -s -X POST \
  -H "Authorization: Bearer $pass" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/<user>/<repo>/actions/workflows/pages.yml/dispatches \
  -d '{"ref":"main"}'
```

5. Poll the run list until `conclusion == success`.
6. Verify the live HTML, CSS, data, social image and a headless smoke test.

## State file

Snapshot from the OpenCode database:

```sh
sqlite3 -json ~/.local/share/opencode/opencode.db \
  "select id,cost,tokens_input,tokens_output,tokens_reasoning,tokens_cache_read,tokens_cache_write,time_created,time_updated from session_v2 where id='<session-id>';"
```

Record:

- session start, build start, packaged/deployed time
- elapsed seconds and a human duration
- input, output, reasoning, cache read/write
- total = input + output + reasoning; report cache separately
- cost
- model, provider, harness version
- verification counts
- repository and live URL
- skill path and catalog URL

Note in the file that the snapshot precedes the final state commit, push and closing response.

## Publish the skill

The skill source should contain:

```text
SKILL.md
README.md
ATTRIBUTION.md
assets/<starter>/
references/
scripts/
```

Validate it:

```sh
node ~/.config/opencode/skills/skill-publish/scripts/check-skill.mjs \
  ~/.config/opencode/skills/<skill-id>
node ~/.config/opencode/skills/<skill-id>/scripts/check-starter.mjs
```

Then add it to the catalog's `skills.json`, sync, review `git status`, commit and push. Verify the
catalog `index.json` over HTTP and that a listed file is reachable.

## Release checklist

- [ ] `npm run verify` passes
- [ ] `npm run verify:images` passes
- [ ] Screenshots regenerated
- [ ] No secrets or transcripts in `git status`
- [ ] `AGENTS.md` / `docs/REPRODUCTION.md` current
- [ ] `state.json` current
- [ ] Repo pushed
- [ ] Pages workflow green
- [ ] Live URL, social image and 404 verified
- [ ] Skill check passes
- [ ] Skill catalog pushed and reachable
- [ ] Live URL recorded in both project and skill
