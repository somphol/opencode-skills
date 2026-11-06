# AGENTS.md scaffold — P2P table

## 1. What it is

A static, bilingual 3D table game with a serverless WebRTC multiplayer mode. The host browser is
authoritative; guests render redacted state. Not a game server, account system, tournament authority
or anti-cheat product. Release **X.Y.Z**.

Live: <https://example.github.io/repo/> · Local master: `~/Projects/repo`

## 2. Commands

```bash
python3 -m http.server 8123

node --check script.js
node --check peer-manager.js
node scripts/check.mjs
node scripts/verify.mjs
node scripts/net-check.mjs      # real broker; not offline CI

# modes
/?mode=solo
/?mode=host&name=Ana
/?room=ABC234&name=Bea
/?lobby=1
```

`?selftest=1` runs N checks and sets `SELFTEST PASS N/N`.

## 3. Architecture

- `index.html` / `style.css` / `script.js` / `peer-manager.js`.
- `peer-manager.js`: room codes, lazy PeerJS, `PeerHost`, `PeerClient`, `openHostWithRetry`,
  `createLoopbackPair`. No rules.
- `script.js`: data → rules → AI → state → flow → 3D → audio → UI → persistence → network → tests.
- `MY_SEAT`, `SEAT_PROFILES`, `net`; `isBotSeat` is the only AI predicate.
- `sanitizeForSeat` is the only privacy boundary; `hydrateRemoteState` is the client boundary.
- `publishState` is host-only, throttled and refuses before `net.started`.
- `scene.setViewSeat` rotates the world group, not the camera.
- 32 real + 32 ghost meshes.

Boot: prefs → stats → language → events → load match/make state → scene → deal → optional lobby.

## 4. Decisions and constraints

- Seat count follows the game's rules, not a poker template.
- Host authority; guests never run the engine or AI.
- Redaction: ghost ids for other hands and unrevealed plays; `hiddenTags` never leaves the host.
- Stable tags assigned at deal; restored by Undo.
- Disconnect keeps seat/hand/score and becomes a bot.
- No host migration, TURN or anti-cheat.
- PeerJS 1.5.4 and Three.js r160 pinned; CSP allows jsDelivr + `0.peerjs.com`.
- No build step; four runtime files.

## 5. Known issues

- Host closes = room ends.
- Symmetric NAT can block WebRTC (STUN only).
- No turn timer; an idle guest stalls the table.
- Redaction protects the wire, not the host or the guest's own client.
- Mobile verified in emulation, not physical hardware.

## 6. Continuity

- Deployed: GitHub Pages from `main` root.
- Local master: `~/Projects/repo`.
- Build record: `STATE.md`, `state.json`.
- Protocol: `docs/PROTOCOL.md`; operations: `docs/MULTIPLAYER.md`.
- Skill: `leab-tui-p2p-studio` and its public mirror.
