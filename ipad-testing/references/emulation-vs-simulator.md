# Emulation vs Simulator vs device

Three tiers, three different answers. Use the cheapest one that can show the bug, then confirm on the
engine that will ship.

## Tier 1 — headless Chrome + CDP

What it actually emulates, via `Emulation.*`:

- viewport in CSS pixels, plus `screenOrientation`
- `devicePixelRatio`
- touch points and the `pointer: coarse` / `hover: none` media features
- a Safari iPad user agent

What it does not change: the rendering engine, the browser chrome, safe-area insets, scroll bounce,
Web Inspector, GPU timing, or Safari's form controls. A layout that depends on `env(safe-area-inset-*)`
reads 0 in Chrome, so it cannot prove safe-area correctness.

Use it for: every iteration, both orientations, CSS media queries, overflow, tap targets, JS state and
screenshots in CI.

```bash
node ipad-check.mjs --url "$URL" --device ipad --orientation portrait \
  --eval "JSON.stringify({scroll:document.documentElement.scrollHeight, inner:innerHeight})"
```

If a Mac has no Chrome, set `CHROME_PATH`, or use any Chromium build (Edge, Brave, Chromium).

## Tier 2 — Xcode iPad Simulator

Real WebKit, real Safari chrome and real safe areas.

```bash
xcrun simctl list devices available | grep -i ipad
xcrun simctl boot "iPad Pro 11-inch (M5)"
open -a Simulator
xcrun simctl openurl booted "http://127.0.0.1:8123/"
xcrun simctl io booted screenshot /tmp/ipad-sim.png
```

Notes:

- `127.0.0.1` inside the simulator is the Mac's loopback; no port forwarding needed.
- Boot by name or UDID; `xcrun simctl shutdown all` cleans up.
- Rotate with **Device › Rotate Left/Right**. To script it, target the Simulator window with System
  Events and send ⌘← or ⌘→ (Accessibility permission required).
- Enable **Settings › Safari › Advanced › Show features for web developers** inside the simulator, then
  attach from the Mac's **Develop** menu (enable **Safari › Settings › Advanced › Show Develop menu**).
- Record a short flow: `xcrun simctl io booted recordVideo /tmp/flow.mov`, then stop with Ctrl-C.
- Simulators are per-runtime; installing a new iOS runtime changes the device list. Pin a device name
  in scripts and print the available list when it is missing.

What it still misses: hardware GPU and memory pressure, real network transitions, camera/mic
behaviour (partly shimmed), App Store, and thermal throttling.

## Tier 3 — physical iPad

Reserve for the things only hardware shows:

- Safari toolbar collapse/expand and the resulting dynamic viewport
- safe-area insets around the home indicator and rounded corners
- double-tap zoom, pinch, and scroll-bounce feel
- actual frame pacing on a heavy canvas
- installed (Add to Home Screen) full-screen mode

Keep a manual script for these: open, scroll, rotate, background/foreground, add to home screen,
rotate again. Emulation cannot close this gap, so say so in a handoff.

## Choosing in practice

| Question | Tier |
| --- | --- |
| "Does the CSS query match in landscape?" | 1 |
| "Is the dock covered by the toolbar?" | 2 or 3 |
| "Does a modal fit after rotation?" | 1, then 2 |
| "Is it janky at 60 fps?" | 3 |
| "Does the page scroll at all?" | 1 (`scrollHeight`), confirm 3 |
| "Does the home indicator overlap the CTA?" | 3 |

## CI

Tier 1 runs anywhere Chrome runs: start the app server, run the harness, save the screenshot as an
artifact. Do not put the Simulator in CI unless the runner is macOS with Xcode installed; booting a
simulator costs minutes and adds flakiness for a check the emulator can usually answer.
