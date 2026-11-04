# AGENTS.md — <PROJECT>

## 1. What this is

<One paragraph: the game, the stack, what it produces, what it is not. Include the release version and
the live URL.>

Live: <URL> · Local master: `<path>`

## 2. Commands

```bash
cd <path>

# run
python3 -m http.server 8123
# open http://127.0.0.1:8123/
# an HTTP server is required: script.js is an ES module

# verify
node --check script.js
node scripts/check.mjs
node scripts/verify.mjs        # Chrome + local server

# screenshot state
node scripts/browser-check.mjs --url "http://127.0.0.1:8123/?demo=1" --wait 16000 --out screenshots/hero.png

# deploy
git push origin main
```

`?selftest=1` runs the in-page checks; `?demo=1` sets a screenshot state; `?seed=123` makes the shuffle
reproducible.

## 3. Architecture

Load order: `index.html` → `style.css` → `script.js` (module; import map pins `three@<version>`).

Layers inside `script.js`:

1. **Data** — ranks, colours, seats, deck, constants.
2. **Rules** — pure deck/detect/compare/enumerate/score functions.
3. **AI** — lead/follow heuristics, deterministic mode, round simulation.
4. **State** — one mutable object + prefs + stats; `serializableState` is the only object→ID boundary.
5. **Flow** — deal → lead → submit → resolve → round/match; undo snapshot.
6. **3D** — `createScene` dynamic import; `scene.sync(state)` is a projection, not a second model.
7. **Audio** — synthesised, gesture-unlocked.
8. **UI** — `renderAll`, coach, inspector, log, rules, summaries; `applyLanguage`.
9. **Persistence** — save/load/export.
10. **Self-test** — pure checks + simulation.

Boot order: `<...>`.

Key constants:

```text
<...>
```

Storage keys: `<...>`. Export: `<...>`.

Test surface: `window.<App>` exposes `<...>`.

## 4. Decisions and constraints

- **Rules contract.** Source: `<...>`. Interpretation: `<...>`. Update `docs/RULES.md`, `detectCombo`,
  the self-test and the rules modal together.
- **Comparison.** `<...>`; `beats` is strict.
- **Face-down.** `<...>`; never auto-reveal.
- **Serialization.** ID-based only; never store live tile objects.
- **Canvas.** Inside `.stage-wrap`; an app-level canvas renders behind the sidebar.
- **Camera.** `<desktop>` and `<portrait>`; the mobile dock must stay under ~110 px.
- **Audio.** No context before the first gesture.
- **CDN.** Pinned; do not float the version.
- **No build step.** Keep three runtime files.

## 5. Known issues

- <...>
- <...>

## 6. Continuity

- Deployed copy: <URL>, branch `main`, root.
- Local master: `<path>`.
- Build record: `STATE.md` / `state.json`.
- Skill: `<id>` local + catalog mirror.
- Rule source: `<URL>`.
- Verification: `docs/TESTING.md`; run `node scripts/check.mjs` before every push.
