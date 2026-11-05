# UI, state and export

## Panel sections (in order)

1. **Characters** — 2×2 cards, `data-animal`, `aria-pressed`.
2. **Expression** — four chips, `data-expr`.
3. **Colours** — main/belly/blush native `<input type="color">`, hex readouts, five palette swatches,
   reset.
4. **Accessories** — three toggle rows, `data-accessory`, `aria-pressed`, sliding pill.
5. **Studio tools** — snapshot (primary), save preset, copy link, sound; preset list below.
6. **Saved presets** — up to 10, apply/delete, empty state.

The footer credits Three.js and OpenCode. The topbar has brand, live pill, sound and EN/TH.

## State

```js
{
  animal: 'bear', expression: 'happy', lang: 'en', sound: true,
  colors: { bear: {main,belly,blush}, bunny: {…}, penguin: {…}, shiba: {…} },
  accessories: { bowtie: false, partyHat: false, glasses: false }
}
```

Keys: `cute3d:state:v1`, `cute3d:presets:v1`, `cute3d:lang:v1`. Presets hold
`{id,name,animal,colors,accessories,expression,createdAt}` and are always sanitized.

Hydration: defaults → state key → language key → URL share (share wins for the current session).

## Share format

```
?a=bear&c=c08a6d-ffe9df-ff9db6&x=happy&o=bowtie,glasses&l=en
```

Colours: six hex digits without `#`, joined by `-`. Accessories: comma list. Decode validates every
field and returns `valid: false` for an unknown animal. Use `history.replaceState` as the clipboard
fallback.

## Snapshot

Button → 2048² transparent PNG, filename `cute3d-<animal>-<YYYY-MM-DD>.png`. Hide pedestal, rim,
props and sparkles; use the dedicated square camera. The corner alpha must be 0 and the centre opaque.

## Translation rules

- Put `data-i18n="key"` on the **text span**, not the button (emoji must survive).
- Use `data-i18n-aria` for labels and `data-i18n-placeholder` for inputs.
- Both dictionaries must have identical keys; the engine test enforces parity.
- Update `<html lang>`, `document.title` and the meta description on switch.
- Thai needs `body[data-lang="th"]` with Noto Sans Thai / Sukhumvit Set / Thonburi.

## Mobile

≤860 px: panel becomes a fixed bottom sheet (`78dvh`, 26 px top radius), opened by a floating
**Customize** button, closed by the ✕ or Escape. `aria-expanded` and `aria-controls` are set. Move the
hint chip up 78 px so it does not sit under the button.

## Accessibility

Skip link, `:focus-visible`, `aria-pressed` on toggles, live toasts, reduced motion, forced-colours
borders, keyboard `1`–`4`, `Space`, `S`, `L`, `Esc`. Suppress shortcuts when a button/link/input has
focus so native activation still works.

## Coat controls

Section order: characters → expression → **coat detail** → colours → accessories → studio tools.
Three buttons with `data-coat="off|soft|plush"`, `aria-pressed`, and a live `#coat-strand-count`.
State key `coat`, share parameter `f`, presets include it. Smooth removes every shell; Soft and Plush
rebuild them. Keyboard `C` cycles the levels.

## Fur and scene controls

- `[data-fur]` range inputs: length 0.4–1.8, density 0.1–1, curl/clump/breeze 0–1. Outputs update live.
- `[data-lighting]` buttons: studio/sky/desk, aria-pressed, persisted.
- State: `fur:{...}`, `lighting`; presets include both; share `u=length-density-curl-clump-breeze`, `g=`.
- Snapshot hides pedestal, clouds, desk and perch; strands/shells remain.
