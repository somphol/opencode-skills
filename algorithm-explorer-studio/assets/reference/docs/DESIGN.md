# Design system

## Intent

The interface should feel like a precision instrument in a dark lab: deep navy stages, thin cool
borders, one bright accent per pattern, and typography that stays quiet while the 3D model carries
the colour. It is a study tool, not a game lobby. No mascots, no confetti, no fake urgency.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#050912` | page base |
| `--panel` | `rgba(11,21,38,.78)` | cards |
| `--line` | `rgba(126,173,255,.16)` | borders |
| `--text` | `#e9f4ff` | primary text |
| `--muted` | `#8ea6c4` | body secondary |
| `--accent` | `#57d7ff` | active state, primary action |
| `--good` | `#7af0c7` | resolved / correct / completed |
| `--warn` | `#ffb86b` | pointers, warnings, medium difficulty |
| `--bad` | `#ff6688` | wrong answers, hard difficulty |
| `--violet` | `#c7a6ff` | intervals, BFS levels |
| `--pink` | `#ff9de2` | backtracking |

Each pattern also has its own `accent`/`accent2`, used by the 3D point light, rail active bar, lecture
chips and scene emitters. The UI shell stays cyan; the scene changes identity.

## Type

- Display/UI: `"SF Pro Display", "Inter", "Segoe UI", system-ui, -apple-system, sans-serif`.
- Code/data: `"SFMono-Regular", "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace`.
- Headings use tight tracking (`-.02em` to `-.035em`); eyebrows are 10 px, 800 weight, wide tracking,
  uppercase. Body copy is 11–13 px in panels; this is a dense studio, not an article.

## Layout

```
┌ topbar: brand ───────── tabs ───────── actions ┐
├ rail 236 ┬ stage fluid ──────────┬ inspector 316 ┤
│          │ transport             │ signal       │
│          ├ code panel (stage+inspector) ────────┤
└ footer ────────────────────────────────────────┘
```

- Desktop >= 1320 px: three columns, code spans the right two.
- 1120–1320 px: inspector drops below the stage; code spans full width.
- < 1120 px: rail stays left, inspector becomes a two-column strip.
- < 860 px: single column; rail becomes a horizontal scroller; stage 56 vh; code notes move under.
- < 560 px: one-column inspector, simplified problem rows, scoreboard stretches.

The rail is sticky on desktop and deliberately scrolls independently; the stage is the largest thing
on screen at every width.

## Motion

- Scene tweens ease at `1 - exp(-dt*11)`; step changes feel like magnetic settling, not cuts.
- Playback interval is `max(240ms, 1150ms / speed)`, speed 0.4–2.6×.
- CSS transitions are 160–350 ms; the step dot breathes at 1.8 s; ambient orbs drift at 24–34 s.
- `prefers-reduced-motion` forces all animation/transition durations to ~0 and disables smooth scroll.
- There is no autoplay. The user starts the trace.

## Content voice

- Short, declarative, no hype. “Grow right, shrink left”, not “Master this amazing trick!”.
- Every claim is about the mechanism (order, invariant, monotone stack), not about passing interviews.
- Signal keywords are the first panel; the code is a reference implementation, not the lesson.
- Results are chips, not modals. Feedback is inline and immediate.
- Problem links are outward references; never imply LeetCode affiliation.

## Component notes

- **Rail item** — number, title, one-line signal, active left accent. The number is the only decorative
  element; it anchors the curriculum order.
- **Stage** — canvas fills the panel; loading dots sit over it until the scene is ready; legend and
  drag hint are low-contrast so they never compete with the model.
- **Transport** — four controls and two sliders. Play is the only filled control; speed is secondary.
- **Inspector** — signal → current step → input → rendering mode. Inputs are monospace because they
  are data, not prose.
- **Code** — line numbers, active-line wash, left border, auto-scroll only when the active line is out
  of view. Notes explain how to read the trace, not what the code does.
- **Quiz** — one question card, four full-width options, inline verdict, explanation, review link.
  The round map is 30 small bars; no timer, because speed is not the skill being taught.
- **Practice** — grouped tables, difficulty pills, outbound link per row, checkboxes as completion.
  Progress is a ring plus a fraction; clearing is destructive and confirmed outside test mode.

## Assets

Only `assets/favicon.svg` is required. The README/social images are generated from the live app by
`scripts/screenshot.mjs`; they are documentation, not runtime dependencies. The OG card is a
standalone HTML that embeds `studio.png`.
