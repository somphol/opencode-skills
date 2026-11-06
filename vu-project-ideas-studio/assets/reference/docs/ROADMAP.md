# Roadmap

The catalog is intentionally small and static. Everything below is optional; nothing here is promised.

## Now (1.0)

- 54 curated briefs, 9 tracks, full-text client search.
- Copy full prompt / brief only, Markdown download, deep links.
- Shortlist and theme in `localStorage`.
- Static gate + 31 browser checks + screenshots.
- Docs, provenance, state, Pages release, skill backup.

## Next

- **Per-brief pages** generated as static HTML (`/p/<slug>/`) for shareable SEO-friendly URLs, while
  keeping the hash fallback for `file://`.
- **Copy history** in `localStorage`: the last five prompts copied, with a small “recent” filter.
- **Keyboard navigation in the grid**: arrow keys move between cards; `Enter` opens.
- **Tag overhaul**: separate “stack” (technology) from “features” (behaviour) in the filter UI, not
  just in the drawer.
- **Link checker** in the static gate for the two live demos (HEAD request, opt-in so CI works offline).

## Later

- **Contribution flow**: an issue template that asks for a brief, a title, a tagline and a track, plus
  a maintainer script that appends to `source.json` and `metadata.json`.
- **Printable booklet**: a print stylesheet that lays out one brief per page with its prompt.
- **Bilingual UI**: EN/TH for the catalog chrome (the briefs already contain Thai where relevant).
- **Collections**: curated shortlists such as “start here”, “one weekend”, “physics-heavy”.
- **Search index**: a small inverted index if the catalog grows past a few hundred briefs.

## Non-goals

- A backend, accounts, sync or a database.
- Running the briefs (no code execution sandbox or judge).
- Ranking briefs by “difficulty” without evidence.
- Rewriting the task bodies to fit a house style.
- Third-party analytics, ads or tracking.
- Re-adding the duplicate Nexus 2035 entry.

## How to choose the next thing

Prefer work that makes a brief easier to find, read or copy. A new visual effect is lower value than a
broken deep link. If a change alters counts, tracks or the prefix, update the docs, tests and
`state.json` in the same commit.
