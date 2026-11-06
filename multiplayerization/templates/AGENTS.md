# AGENTS.md — multiplayer handoff

## 1. What this is

A static/app multiplayer room built on [transport]. The host is authoritative; guests send intent and
render projected state. It is not a game server, account system, tournament service or anti-cheat
product. Release **X.Y.Z**.

Live: <https://…> · Local master: `~/Projects/…`

## 2. Commands

```bash
# run
python3 -m http.server 8123   # or the app's normal dev command

# static
node --check app.js
node scripts/check.mjs

# browser
node scripts/verify.mjs

# two-client (needs the real broker/server)
node scripts/two-client-check.mjs

# modes
/?host=1&name=Host
/?room=ABC234&name=Guest
/?approval=0              # test-only; never a normal user path
```

`?selftest=1` prints `SELFTEST PASS N/N`.

## 3. Architecture

- `app.js` — app logic; host authority and projection.
- `transport.js` — room codes, transport adapter, loopback.
- `security.js` — passcode policy, generator, digest.
- `chat.js` / `voice.js` — optional communication paths.
- `scripts/check.mjs` — static guard.
- `scripts/two-client-check.mjs` — real two-client test.

Boot: config → local state → UI → transport (only when hosting/joining) → room → state.

Key globals:

```text
roomCode, hostId, selfId, role, participants
revision, phase, pendingRequests, passcodeDigest
```

## 4. Decisions and constraints

- Authority: host-authoritative.
- Projection: `projectFor(state, participant)` is the only privacy boundary.
- Intents: guests never write authoritative state; host re-validates.
- Room code is an identifier, not a secret.
- Passcode: 15–64 chars, four classes, deny-list, SHA-256 digest only; never URL/state/export.
- Approval: on by default; pending expires; rejects close.
- Caps: connections, pending, rate, payload, chat, action, media allowlist.
- No host migration unless an epoch/election exists.
- No build step / pinned CDN versions (if static).

## 5. Known issues

- Host loss ends the room unless documented otherwise.
- Symmetric NAT may need TURN; no TURN is configured.
- No authentication, anti-cheat, moderation or DDoS guarantee.
- Host sees all state; guests can inspect their own client.
- Mobile verified in emulation, not physical devices.

## 6. Continuity

- Deployed: Pages/server URL.
- Local master: `~/Projects/…`.
- State: `STATE.md`, `state.json`.
- Protocol: `docs/PROTOCOL.md`; operations: `docs/MULTIPLAYER.md`.
- Skill mirror: `…`.
