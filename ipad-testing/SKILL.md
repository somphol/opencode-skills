---
name: iPad Testing
description: Debug and test web apps on iPad — pick Chrome CDP device emulation for fast loops, the Xcode iPad Simulator for real Safari, or a physical iPad for safe-area and performance truth; drive both orientations, capture screenshots, measure layout, and run the tablet checklist.
version: 1.0.0
---

# iPad Testing

An iPad is not a big phone and not a small desktop. Most "broken on iPad" reports are one of five
things: a width-only media query, `100vh` instead of `100dvh`, the Safari toolbar eating the viewport,
touch gestures the page never cancelled, or a layout that was only ever checked in portrait.

This skill gives you a loop an agent can run without a human holding the device.

## Pick the fidelity you need

| Tier | Tool | Gives you | Misses |
| --- | --- | --- | --- |
| **Fast loop** | Headless Chrome + CDP device emulation | CSS viewport, DPR, touch/coarse pointer, UA, JS eval, screenshots, CI | Safari toolbar, safe-area insets, real GPU/timing, Web Inspector |
| **Safari truth** | Xcode iPad Simulator + Safari | Real WebKit layout, Safari chrome, safe areas, gestures | GPU/perf of hardware, some media, no App Store |
| **Ground truth** | Physical iPad + Safari | Everything | Not automatable; slow |

Start at tier 1 for every change, finish at tier 2 for anything that touches layout, and keep a tier-3
manual checklist for releases. Never claim "works on iPad" from emulation alone when the risk is
toolbar, safe area or gesture behaviour.

## Fast loop: headless Chrome

Use the bundled harness (`templates/ipad-check.mjs`) — dependency-free CDP, no npm install.

```bash
# one page, iPad portrait, screenshot + JS result
node ipad-check.mjs --url "http://127.0.0.1:8123/" \
  --device ipad --orientation portrait --wait 5000 \
  --eval "JSON.stringify({scrollW:document.documentElement.scrollWidth, innerW:innerWidth})" \
  --out /tmp/ipad-portrait.png

# landscape is a different layout, not a rotation of the same screenshot
node ipad-check.mjs --url "http://127.0.0.1:8123/" \
  --device ipad --orientation landscape --wait 5000 --out /tmp/ipad-landscape.png

# click, wait, then measure
node ipad-check.mjs --url "http://127.0.0.1:8123/" --device ipad \
  --click "#someButton" --wait 2000 --eval "document.querySelector('#panel').hidden"
```

Profiles use CSS pixels: iPad 820×1180, iPad mini 744×1133, iPad Pro 11 834×1194, Pro 13 1024×1366,
all DPR 2. `--device` is a shim for `Emulation.setDeviceMetricsOverride` plus a Safari UA and
`Emulation.setTouchEmulationEnabled`; it does not switch the engine.

Always measure instead of eyeballing:

```js
JSON.stringify({
  viewport: [innerWidth, innerHeight],
  visual: [visualViewport.width, visualViewport.height],
  scroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
  coarse: matchMedia("(pointer: coarse)").matches,
  hover: matchMedia("(hover: hover)").matches,
  dpr: devicePixelRatio
})
```

A page that scrolls vertically on iPad is already a bug for a full-screen app: assert
`scrollHeight <= innerHeight + 1`.

## Safari truth: Xcode Simulator

```bash
xcrun simctl list devices available | grep -i ipad
xcrun simctl boot "iPad Pro 11-inch (M5)"        # or the UDID
open -a Simulator
xcrun simctl openurl booted "http://127.0.0.1:8123/"
xcrun simctl io booted screenshot /tmp/ipad-sim.png
```

- The simulator shares the Mac network, so `127.0.0.1` works.
- Rotate with the Simulator's **Device › Rotate** menu (⌘←/⌘→ via System Events if scripting).
- Enable **Safari › Settings › Advanced › Show features for web developers** on the simulator, then
  use the Mac's **Develop** menu to attach Web Inspector.
- Boot and shut down devices by name; keep one iPad profile to avoid state drift.

Details, scripting and limits: `references/emulation-vs-simulator.md`.

## Workflow

1. **Reproduce with a URL and a hook.** Prefer a deterministic entry (`?seed=`, `?demo=`, `?mode=`,
   fixture route) over clicking through a game or form. If there is no hook, add one before fixing.
2. **Capture both orientations before changing anything.** Portrait and landscape are different
   layouts; a fix that only passes portrait is half a fix.
3. **Measure the failure**, not the symptom: scroll size, element rectangles, media-query matches,
   computed styles, `getBoundingClientRect()` of dock/header/CTAs.
4. **Fix one cause.** Width-only queries, `vh`, missing `touch-action`, duplicate handlers — each has
   its own repair; bundling them makes the next report ambiguous.
5. **Re-run the same capture** and diff the numbers. A screenshot with no measurement cannot show
   whether the dock still clips.
6. **Record the pair** in the repo (`screenshots/ipad-{portrait,landscape}.png`) when the change is
   layout-visible.

## The iPad contract

- `html, body { overflow: hidden }` for app-like layouts; a fixed stage at `100dvh`, not `100vh`.
- One media query for tablet vs desktop: `(max-width: 1024px), (pointer: coarse)` — the same string in
  CSS and in JS listeners. iPad landscape is 1180 px wide but coarse: width alone misclassifies it.
- Safe areas: pad with `env(safe-area-inset-*)`; `viewport-fit=cover` in the meta tag.
- Touch: `touch-action: manipulation` on controls, `touch-action: none` on a canvas you own, 16 px
  minimum font on inputs, and cancel non-canvas double-tap zoom in `touchend`.
- Target size: 40×40 px minimum for anything tappable; hover-only affordances need a tap path.
- Overlays: modals must fit `100dvh` minus the safe areas and scroll internally when they do not.
- Orientation: re-fit cameras/canvas after `orientationchange`; do not cache the aspect ratio.
- Text: check at the largest in-app text size and with Safari's page zoom, not just default.

Full check list: `references/ipad-checklist.md`.

## Pitfalls that cost real cycles

| Symptom | Cause | Fix |
| --- | --- | --- |
| Page scrolls, hand/CTA hides under the toolbar | `100vh` includes Safari chrome | `100dvh` + `overflow: hidden` |
| Rail/nav disappears in landscape | JS checks width only (1180 px) | add `(pointer: coarse)` to the query |
| Second tap opens a white sheet or zooms | double-tap zoom not cancelled | `touchend` preventDefault on non-canvas |
| Controls look 30% smaller | DPR/zoom confusion | verify `devicePixelRatio` and CSS px, not screenshot px |
| Canvas crops or drifts after rotating | camera fitted once to old aspect | re-fit on resize/orientationchange |
| Board renders stale after closing a panel | render skipped while panel open | re-render from state on close |
| Modal submit is unreachable | dialog taller than viewport, page can't scroll | cap height, internal scroll, sticky actions |
| Touch targets feel broken | hover-only reveal or < 40 px | tap-visible state, larger hit area |
| Bottom UI under the home indicator | no safe-area padding | `env(safe-area-inset-bottom)` |
| Scripted tap does nothing | a modal/overlay covers the target | check `document.elementFromPoint(x, y)` before tapping |

## Verification

```bash
node --check ipad-check.mjs
node ipad-check.mjs --url "$URL" --device ipad --orientation portrait  --eval "$PROBE"
node ipad-check.mjs --url "$URL" --device ipad --orientation landscape --eval "$PROBE"
```

Assert numbers, not vibes: no vertical scroll, dock/header rects inside the viewport, tap targets
≥ 40 px, media queries agreeing with JS, and at least one interaction driven by touch emulation.

## Files in this skill

- `references/emulation-vs-simulator.md` — CDP vs Simulator setup, scripting, limits.
- `references/ipad-checklist.md` — the release checklist for layout, touch and Safari chrome.
- `templates/ipad-check.mjs` — dependency-free CDP harness with iPad profiles.

## Provenance

Distilled from debugging Leab-Tui 3D on iPad Safari: layout invariants, CDP harness flags and the
failure list come from that build. The harness uses the Chrome DevTools Protocol only; no third-party
code is bundled.
