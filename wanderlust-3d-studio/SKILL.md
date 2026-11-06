---
name: wanderlust-3d-studio
description: Build and release a zero-build, photography-led travel atlas — 3 regions × 5 curated destinations, verified Unsplash imagery, hero slider, live search and interest/budget filters, destination modals with deep links, a localStorage itinerary, headless verification, professional docs and GitHub Pages. Use for tourism microsites and destination explorers, not booking backends or generic CRUD.
---

# Wanderlust 3D Studio

Build a complete, release-grade travel atlas as a static site: vanilla HTML5, CSS3 and ES6, no
framework, no build step, deployable to GitHub Pages. The finished product should feel like an
editorial travel magazine, not a database with photos.

## When to use this skill

Use it when the goal is:

- a curated destination explorer for 3 regions × 5 places (or a small multiple of that)
- a photography-led tourism microsite with search, filters and detail views
- a persistent wishlist / itinerary builder that works without accounts
- a static release with real verification, docs and a public URL

Do **not** use it for:

- booking engines, payments, inventory or availability
- user accounts, server-side sync or CMS-backed content
- a single destination landing page (the overhead is unnecessary)
- a data-heavy map product where geospatial search is the core

## Deliverables

A finished project should contain:

```text
index.html              semantic shell, SEO, SVG icon sprite, hero, overlays
style.css               design tokens + components + responsive rules
data.js                 regions, destinations, routes (single source of truth)
script.js               render, filters, modal, trip planner, motion
404.html                branded not-found page
manifest.webmanifest    install metadata
assets/icon.svg         app icon
scripts/                serve, verify, image audit, screenshots
screenshots/            generated release images + 1200×630 social card
docs/                   architecture, data schema, design, verify, deploy, reproduction
.github/workflows/      Pages deploy
README.md               release front page
AGENTS.md               one-minute agent handoff
state.json / STATE.md   build time, tokens, model provenance
LICENSE / CREDITS.md    code and photography licences
```

## Non-negotiables

1. **Exactly 3 regions × 5 destinations.** Unique, stable, kebab-case IDs. No duplicate IDs.
2. **Every destination has**: tagline, verified Unsplash primary, 3 gallery images, best time,
   `bestMonths`, daily budget, a breakdown that sums to it, 3 attractions, 4 dishes, cultural notes,
   season notes, an itinerary tip, suggested nights, budget tier and interest tags.
3. **No runtime build.** The deployed site is the four core files plus static assets. Dev tooling may
   use npm; the app must not.
4. **Images are visually verified**, not just HTTP 200. A mountain photo must not be labelled a
   volcano.
5. **Accessibility is part of done**: focus trap, Escape, focus restore, `aria-live` counts,
   `aria-pressed` filters, visible focus, reduced motion.
6. **Responsive at 390 px** with zero horizontal overflow; the modal and drawer must fit.
7. **A headless release gate** that exercises the real UI, not a mock. It must pass before publishing.
8. **`AGENTS.md` and `docs/REPRODUCTION.md` are written in the same push** as the release.
9. **No secrets** in the repo. Never print a token while deploying.
10. **Measure the build** in `state.json`: elapsed time, token totals, model, harness and verification.

## Workflow

### 1. Freeze the content shape

Choose three regions with distinct visual/emotional registers. Pick five destinations each that
cover different interests (culture, city, nature, food, beach/mountain). Write the data contract before
the UI. Decide the budget tiers: `budget` ≤ $125, `mid` $126–199, `luxury` ≥ $200.

Read `references/content-and-images.md` for the full field list and copy standards.

### 2. Curate images visually

Do not trust a URL list. Download 480 px thumbnails, build an HTML contact sheet, screenshot it, and
inspect the subjects. Reject mismatches. Keep 24 unique images: 15 primaries plus region heroes, route
cards and gallery support. Run a HEAD audit on the final set.

### 3. Build the data

Write `data.js` with `meta`, `regions`, `destinations`, `routes`. Deep-freeze at the end. Make every
budget breakdown sum to `dailyBudget`. Keep `bestMonths` as 3-letter abbreviations.

### 4. Build the shell

`index.html`: skip link, fixed header, three-slide static hero (so the first paint does not wait for
JS), region tabs container, filter panel, destination grid, routes, editorial section, about, CTA,
footer, drawer shell, modal shell, toast, back-to-top, inline SVG sprite, JSON-LD, Open Graph and a
manifest link.

### 5. Build the design system

`style.css`: tokens at `:root`, then reset, type, buttons, header, hero, explorer, cards, routes,
ethos, about, CTA, footer, drawer, modal, toast, responsive, reduced motion, print. Use region accents
written at runtime to `--accent` / `--accent-soft`. Prefer system fonts to avoid font requests.

### 6. Build the behaviour

`script.js` as one IIFE. Order: cache → load trip → render tabs/chips/routes → `render()` → bind
delegated events → reveal observer → hero autoplay → hash deep link. Escape all catalogue strings.
Keep filter state in memory and the trip in `localStorage`.

### 7. Verify and fix

Start with a tiny static server. Write `verify.mjs` that launches Chrome through `puppeteer-core`,
clears storage, and checks data, filters, search, modal, gallery, trip, routes, persistence, deep
links, mobile, tablet, accessibility and console errors. Fix mobile issues as they appear; they are
usually margins, min-widths, select widths and floating-button overlap.

### 8. Produce release assets

Generate screenshots from the live app at 1440 and 390 px, plus a 1200×630 social card with the
project's own type. Add 404, manifest, icon, robots, sitemap and Pages workflow.

### 9. Write the docs

README, AGENTS, architecture, data schema, design system, verification, deployment, reproduction,
contributing, changelog, security, credits, licence. The reproduction doc must contain enough context
for another agent to rebuild without this conversation.

### 10. Publish

Create the repo through the API using the stored credential (one credential read, no repeated
prompts). Push. Enable Pages with `build_type: workflow`. Rerun the workflow if Pages was enabled after
the first push. Verify the live URL and the social image.

### 11. Record state and publish the skill

Snapshot the OpenCode session tokens and elapsed time into `state.json` and `STATE.md`. Copy the skill
to the catalog, run its check, sync, commit and push. State the live URL in both the project and the
skill.

## Scaffold a new project

```sh
node ~/.config/opencode/skills/wanderlust-3d-studio/scripts/scaffold.mjs ~/Projects/my-atlas
cd ~/Projects/my-atlas
npm install
npm run serve
```

Then replace `data.js`, the region palette and the copy. Run:

```sh
npm run verify
npm run verify:images
```

Check the skill itself:

```sh
node ~/.config/opencode/skills/wanderlust-3d-studio/scripts/check-starter.mjs
```

## Data contract (minimum)

```js
{
  id, regionId, name, country, tagline,
  image, imageAlt,
  gallery: [{ image, alt }, { image, alt }, { image, alt }],
  bestTime, bestMonths: ['Mar', 'Apr', 'May'],
  dailyBudget, idealNights, budgetLevel,
  language, currency,
  vibes: ['Culture', 'History', 'Foodie'],
  lat, lng,
  overview,
  attractions: [{ name, type, description } × 3],
  cuisine: [{ name, note } × 4],
  culture, seasonNote, itineraryTip,
  audiences,
  budgetBreakdown: { stay, food, transport, activities }
}
```

The four budget parts must sum to `dailyBudget`. `budgetLevel` is derived from the total:
`budget` ≤ 125, `mid` ≤ 199, else `luxury`.

## Verification expected output

```text
81/81 checks passed
Release checks passed.
24/24 images reachable.
```

If the count differs because you added checks, update the docs rather than deleting checks.

## Failure boundaries and common pitfalls

- **Wrong photo, right URL.** HTTP 200 is not visual verification. Build the contact sheet.
- **Budget drift.** Editing one budget part breaks the sum. Re-run verify.
- **Mobile overflow.** `figure` margins, `min-width`, long select labels, and fixed back-to-top
  buttons are the usual causes.
- **Modal ordering.** On mobile, stats/add first, story second, budget/months last. `display: contents`
  plus `order` is a clean way to reflow without duplicating markup.
- **Drawer behind modal.** Close the modal before opening the drawer; otherwise the backdrop catches
  the click.
- **Hash links.** Use `replaceState`, handle `popstate`, and match IDs against the dataset.
- **Tailwind CDN warning.** If the brief mandates it, include it but keep CSS as the source of truth
  and document the warning. If not mandated, omit it.
- **GitHub Pages enable timing.** Enabling Pages after the first push means the first workflow may
  fail. Dispatch it again.
- **Token accounting.** Snapshot after deployment but before the final state commit; note that the
  live session totals will be slightly higher.
- **Skill backup.** A local skill is not a backup. Copy it into the catalog and push.

## References

- `references/content-and-images.md` — data fields, copy standards, contact-sheet workflow
- `references/build-playbook.md` — phase-by-phase build, layout, state, pitfalls
- `references/verification-and-release.md` — test plan, deploy, docs, state and skill publication
- `assets/wanderlust-3d-starter/` — working starting point
- `scripts/scaffold.mjs` — copy the starter into a new directory
- `scripts/check-starter.mjs` — validate the starter's data contract
