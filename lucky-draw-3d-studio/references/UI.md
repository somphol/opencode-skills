# UI, state and persistence

## Required IDs

```
stage stage-canvas stage-count draws-count
spin-btn spin-label spin-sub
slot-1 slot-2 slot-3 slot-4 bulk-roster roster-chips roster-count
tab-roster tab-history panel-roster panel-history
history-list history-empty clear-history export-json export-csv
lang-en lang-th sound-toggle sound-switch
settings-toggle settings-drawer settings-close settings-reset
duration-range duration-value turns-range turns-value auto-remove
winner-modal winner-name winner-meta winner-remove winner-keep winner-close confetti
toast loading selftest-panel selftest-summary selftest-list
sidebar sidebar-toggle sidebar-close drawer-scrim
```

The static test asserts no duplicate IDs and that every `$('id')` in the script exists in the HTML.

## State

```js
const state = {
  prefs: { lang: 'en', sound: true, autoRemove: false, duration: 5.5, turns: 6 },
  roster: [], history: [], spinning: false, pending: null, lastWinner: null, tab: 'roster',
};
const DEFAULTS = { lang: 'en', sound: true, autoRemove: false, duration: 5.5, turns: 6 };
const DEFAULT_ROSTER = ['Maya Chen', 'Liam Okafor', 'Sofia Rossi', 'Noah Kim'];
```

The controller owns state and persistence. The studio is a renderer with `setRoster`, `startSpin`,
`refreshLabels` and a spin loop.

## Roster flow

Normalise → replace array → `studio.setRoster` → sync inputs/chips → counters/spin state → persist.

- Quick slots: gather all four values; do not rewrite slot values on this path (caret jumps).
- Bulk textarea: debounce 220 ms; rewriting is fine because the user is in the textarea (but skip the
  textarea itself).
- Chips remove one name and resync everything.
- Duplicates and overflow surface through a toast.
- Empty roster is valid; the spin button disables and the sub-label says “Add 2+ names”.

## Spin flow

```
guard → audio.unlock → pick index → pending → spinning=true → studio.startSpin
      → onDone completeDraw → record → persist → refreshLabels → autoRemove? → dialog
      → fanfare + confetti
```

Record shape:

```js
{ id, draw, at, winner, rosterSize, durationMs, removed }
```

`draw` comes from `history[0].draw + 1`, not the array position. History is newest first, capped 200.

## Winner dialog

- Remove: if not already removed, splice the name, rebuild wheel, set `record.removed = true`,
  re-render history *and* chips, persist, close.
- Keep: close only.
- Auto-remove: set `record.removed` before opening; hide the “Keep” button; primary label becomes
  “Continue”.
- Close button/scrim behaves like Keep.
- Focus the primary action on open; return to spin on close.

## Persistence

| Key | Value |
| --- | --- |
| `ld3.prefs.v1` | `{lang, sound, autoRemove, duration, turns}` |
| `ld3.roster.v1` | `string[]` |
| `ld3.history.v1` | record array |

Read defensively: try/catch JSON, filter history shape, clamp preferences. If the roster key is
absent, load the sample four; if it is `[]`, stay empty.

## i18n

- Two objects, identical keys, between `/* I18N:START */` and `/* I18N:END */`.
- ≥80 keys; static test and self-test both assert parity.
- Apply via `[data-i18n]` and `[data-i18n-placeholder]`, toggle language buttons, set
  `document.documentElement.lang`.
- Re-render history/chips and re-apply dynamic strings after switching (spin label, winner meta,
  tags, clear-log armed label).
- Thai copy should be written in Thai, not transliterated. No webfont.

## Audio

Lazy `AudioContext` on the first spin/sound toggle. Tick: triangle 45 ms + quiet overtone, throttle
24 ms, pitch rises with peg rate. Fanfare: C5 E5 G5 C6 every 105 ms + C3 bed + shimmer. Whoosh: one
filtered noise buffer. Mute state persists and syncs the top bar button and drawer switch.

## Accessibility

- Space/L/S/Esc; ignore while typing or when a button is focused.
- Winner dialog `role=dialog`, `aria-modal`, labelled by name, described by meta; focus management.
- Tabs, `aria-selected`, panels labelled by tabs.
- Toast `role=status`; counters `aria-live=polite`.
- `aria-pressed` on language and sound.
- Visible focus ring; never remove outline without a replacement.
- Reduced motion: CSS animations off, 1.1 s spin, no confetti.

## Responsive contract

- >1180 px: stage + 392 px sidebar.
- 980–1180: sidebar 350 px, smaller CTA, fair chip hidden.
- ≤980: stage fills `calc(100dvh − 86px)`, sidebar becomes a right drawer + scrim, floating “Roster”
  button, hint hidden.
- ≤560: stage `calc(100dvh − 78px)`, one-column slots, 118 px CTA, meta pill hidden.
- The body does not scroll on desktop; it may scroll on mobile if content exceeds the viewport.
