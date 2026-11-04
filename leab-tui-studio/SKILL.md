---
name: Leab-Tui Studio
description: Build a bilingual, static 3D trick-taking studio for a traditional tile or card game — research and freeze the rules, write a pure engine, add a 3D table, heuristic AI, coach, persistence, headless verification and a release-grade handoff.
version: 1.0.0
---

# Leab-Tui Studio

Turn a traditional trick-taking game into one static, bilingual 3D teaching table: 32 carved tiles,
four seats, a pure rules engine, a live coach, undo-and-learn, synthesised audio, autosave, JSON export
and a verified GitHub Pages release.

The worked example is **Leab-Tui 3D** — <https://github.com/somphol/leab-tui-3d> —
live at <https://somphol.github.io/leab-tui-3d/>. Read it for the mechanism, not as a reskin target.

## The rule: rules contract first, code second

**Do not start with the table.** A beautiful 3D scene with a guessed ruleset is a reskin. The game is
the product: hierarchy, combination shapes, comparison order, tie-breaks and scoring. Research the
game in its own language, write the contract, mark every ambiguity, then implement it.

For Leab-Tui the source is a 2016 Thai article. It leaves two things ambiguous (the five-tile straight
and the colour rule for the six-tile straight). The project documents its interpretation in
`docs/RULES.md` and tests it. Do the same for your game: **decide, write, test, disclose**.

## When to use

- A traditional trick-taking, climbing, matching or set-collection game that uses physical tiles or
  cards and deserves a playable 3D teaching table.
- A Xiangqi / Mahjong / Thai tile game adaptation where the pieces are the visual identity.
- A static GitHub Pages release with bilingual copy, a beginner coach and no backend.

**Not for:** gambling or betting products, online multiplayer with matchmaking, tournament rule
authorities, or a game whose rules you have not sourced.

## Workflow

1. **Research and freeze the rules.** Use [references/rules-research.md](references/rules-research.md)
   and copy [templates/RULES.md](templates/RULES.md). Record the source URL, the equipment counts, the
   hierarchy, every call/combination, the comparison keys, the trick loop and the scoring table.
2. **Write the pure engine.** Data → `detectCombo` → `compare`/`beats` → `allCombos` → AI → scoring.
   No DOM, no Three.js. Add a `simulateRound(seed)` that conserves every tile. See
   [references/architecture.md](references/architecture.md).
3. **Write the state machine.** `deal → lead → follow ×3 → resolve → next trick / round end`. Snapshot
   before every trick. Make face-down a real choice: unrevealed sets never win.
4. **Build the 3D view as a projection of state.** One `scene.sync(state)` maps tiles to hand, centre
   and capture positions. The scene never decides a winner. Use `root → lift → tilt` groups.
5. **Add the studio layer.** Coach, inspector, Hint, Undo & Learn, rules drawer, scoreboard, log,
   bilingual copy, audio, autosave and export. The coach calls the same `detectCombo` as the engine.
6. **Verify without dependencies.** A 25-check in-page suite, a Node static check, and a Chrome
   DevTools Protocol harness that also plays a full round. See
   [references/verification.md](references/verification.md).
7. **Release.** README, AGENTS, rules, architecture, testing, deployment, reproduction, data format,
   controls, accessibility, performance, design, FAQ, roadmap, checklist, handoff, gallery, glossary,
   licence, changelog, contribution/security/privacy/support, citation, notices and templates.
8. **Measure and credit.** Record wall-clock time and token counts from the OpenCode session DB in
   `state.json` and `STATE.md`; credit OpenCode and the model in the README, About modal and footer.
9. **Publish.** Repository, Pages, then the skill mirror. See
   [references/publishing.md](references/publishing.md) and [references/build-log.md](references/build-log.md).

## Architecture in one screen

```text
index.html   document, import map, static HUD, modals
style.css    tokens, layout, responsive dock, modal system
script.js    data → rules → AI → state → flow → 3D → audio → UI → persistence
             └─ selfTest() + window.<App> test surface
```

- **Import map** pins `three@0.160.0` and `three/addons/` from jsDelivr.
- **Rules** are pure and callable from Node-like self-tests.
- **State** is one mutable object; `serializableState` is the only object→ID boundary.
- **3D scene** is created with a dynamic import so a CDN failure leaves the panels usable.
- **Audio** is synthesised; the context is unlocked by the first gesture.
- **Persistence** stores match, prefs and stats separately; export is versioned.

## Critical traps

| Trap | Symptom | Fix |
| --- | --- | --- |
| Canvas at app level | table renders behind the sidebar | put `#scene` inside `.stage-wrap` |
| Live tile objects in snapshots | undo empties every hand; reload validation fails | convert to IDs in `serializableState`; map back with `TILE_BY_ID` |
| Audio before a gesture | Chrome autoplay warning | `play()` no-op until `pointerdown`/`keydown` unlocks |
| Desktop dock on phone | hand hidden behind the dock | compact dock, stage `calc(100dvh - 86px)`, portrait camera |
| `>= 0` comparison | identical sets overtake | strict `> 0`; equal rank+colour keeps the earlier play |
| Auto-reveal | bluff/conservation disappears | always allow face-down; only revealed sets compete |
| Restarting tweens on every render | tiles jitter or never arrive | skip a target within ~0.004 units |
| Modal screenshot too early | card looks transparent | wait 800–900 ms for the entry animation |

## Definition of done

- [ ] `docs/RULES.md` exists, cites the source, and lists every interpretation choice.
- [ ] Deck counts, hierarchy and comparison keys are asserted in the self-test.
- [ ] A simulated round conserves every tile; points sum to zero.
- [ ] Face-down play works and never wins.
- [ ] A full round, undo, next round, match end and reload-resume are verified.
- [ ] EN/TH dictionaries have the same keys; every visible control switches.
- [ ] The 3D hand is visible on desktop and 390×844; the dock does not cover it.
- [ ] No console exceptions, no autoplay warnings, no remote assets except the pinned CDN.
- [ ] README, AGENTS, STATE, state.json and the full docs set are current.
- [ ] Screenshots exist for desktop EN, desktop TH, rules and phone.
- [ ] The live page passes the self-test.
- [ ] Token/time accounting credits OpenCode and the model.

## Verification

```bash
python3 -m http.server 8123 &
node --check script.js
node scripts/check.mjs
node scripts/verify.mjs
# or the harness directly
node scripts/browser-check.mjs --url "http://127.0.0.1:8123/?selftest=1"
```

`?selftest=1` must print `SELFTEST PASS 25/25` (or your own count). `?demo=1` sets up a screenshot
state. `?seed=123` makes the shuffle reproducible.

## Files in this skill

- [references/rules-research.md](references/rules-research.md) — how to source and freeze a traditional game.
- [references/architecture.md](references/architecture.md) — engine, state, serialization, scene, AI, i18n.
- [references/verification.md](references/verification.md) — dependency-free Chrome harness and flow tests.
- [references/publishing.md](references/publishing.md) — keychain-safe GitHub, Pages, docs set, catalog.
- [references/build-log.md](references/build-log.md) — the Leab-Tui case study, bugs and timings.
- [templates/RULES.md](templates/RULES.md) — a rules contract scaffold.
- [templates/AGENTS.md](templates/AGENTS.md) — a repository handoff scaffold.
- [scripts/browser-check.mjs](scripts/browser-check.mjs) — reusable CDP harness (Node 22+, Chrome).

## Failure boundaries

- The geometry and camera are interpretive; they are not a measured reconstruction of a physical table.
- The AI is heuristic. It conserves strong sets and challenges probabilistically; it does not model
  hidden hands or play at engine strength.
- Mobile is verified under Chrome device emulation unless you have physical devices.
- Three.js is a CDN dependency by design. A fully offline build needs a vendored copy and a different
  CSP; say so if you change it.
- A rule interpretation is not a rules authority. Cite the source and label the choices.

## Provenance

Original skill by Somphol Boonjing, built from the Leab-Tui 3D release. The rules reference is Navee
Angsuputiphant's 2016 Thai article; Three.js is MIT. No third-party brand marks are redistributed. See
[ATTRIBUTION.md](ATTRIBUTION.md).
