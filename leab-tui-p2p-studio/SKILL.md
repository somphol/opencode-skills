---
name: Leab-Tui P2P Studio
description: Add serverless, host-authoritative WebRTC multiplayer to a static Three.js table game — room lobby, two-human start, bot fill, per-seat redaction, ghost meshes, disconnect-to-bot, a two-browser test harness and a release-grade handoff.
version: 1.0.0
---

# Leab-Tui P2P Studio

Add a real **peer-to-peer multiplayer table** to an existing static browser game without a game
server, account system or database. The host browser stays authoritative; guests receive redacted
state over a WebRTC data channel and send only intent.

Worked example: **Leab-Tui 3D 1.4.0** — <https://github.com/somphol/leab-tui-3d> —
live at <https://somphol.github.io/leab-tui-3d/>. Read it for the mechanism, not as a reskin target.

## When to use

- A static, single-page game already runs locally and you need two to four humans on different
  networks.
- The table is small (a handful of seats, a few dozen pieces) and the host can reasonably own all
  rules and AI.
- You can accept host authority, no accounts, no anti-cheat, no host migration and a public
  signalling broker.

**Not for:** matchmaking, ranked play, tournaments, money, anti-cheat, or a game whose rules you have
not frozen. If the game needs six seats, change the rules contract first; do not bolt on two extra
seats and call it the same game.

## The non-negotiable order

1. **Finish solo first.** A network layer magnifies a wobbly engine. The solo self-test must pass.
2. **Generalise the local seat.** Replace hard-coded player 0 with `MY_SEAT` everywhere: hand list,
   coach, pointer picking, scoreboards, summaries, public API, scene hands. Add `SEAT_PROFILES = null`
   for solo so the old behaviour is untouched.
3. **Separate transport from rules.** One module for room codes, PeerJS, host/client endpoints and a
   loopback pair. No `detectCombo`, no scoring, no DOM in that module.
4. **Lobby and seats before the game.** Host creates a code, guests join seats 1–3, start needs two
   humans, empty seats become bots.
5. **Host authority.** Guests send `{type:"action", kind, tiles, reveal}`; the host re-validates with
   the same engine that validates local play and broadcasts.
6. **Redact per recipient.** Other hands and unrevealed centre/log/last-trick plays become stable
   ghost ids. Strip the host-only tag map, undo snapshot and local selection.
7. **Ghost meshes + seat-relative view.** Guests draw back-only meshes for ghost ids and rotate the
   table world so their seat is at the bottom.
8. **Disconnect to bot.** Keep the seat, hand and score; swap the profile to a bot and schedule AI if
   it is their turn.
9. **Test with two real browsers.** A loopback unit test is not enough. Drive host and guest pages
   through CDP, assert privacy from the guest state, play in both directions and close the guest tab.
10. **Document and publish.** Protocol, redaction table, NAT limits, no-host-migration, token/time
    record, skill mirror.

## Architecture in one screen

```text
host browser                              guest browser
┌───────────────────────────────┐         ┌───────────────────────────────┐
│ lobby: host + humans + bots   │         │ lobby: roster + waiting       │
│ engine: deal / AI / score     │         │ no engine                     │
│ sanitizeForSeat(state, seat)  │──state─►│ hydrateRemoteState(raw)       │
│ publishState(per guest)       │         │ scene.sync(state)             │
│ handleRemoteAction(seat)      │◄action──│ humanLead / humanFollow       │
└───────────────────────────────┘         └───────────────────────────────┘
        PeerJS broker: first handshake only; game traffic is direct WebRTC
```

- `MY_SEAT` — the seat this browser controls. Solo 0; guest 1–3.
- `SEAT_PROFILES` — `host | human | bot` + handle. `null` in solo.
- `isBotSeat(seat)` — the only AI-scheduling predicate.
- `sanitizeForSeat` — the only privacy boundary.
- `hydrateRemoteState` — the only wire→live-object boundary.
- `saveMatch` — the host's publish point; guests never save.

## Room codes and broker

Use six characters from an unambiguous alphabet: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no `0 O 1 I`).
Display `LEAB-ABC-234`; peer id `leabtui-v1-abc234`; accept a full invite URL; retry on
`unavailable-id`. 32⁶ ≈ 1.07 billion, which is enough for a hobby table.

PeerJS 1.5.4, pinned, loaded lazily only when a room opens:

```js
{
  host: "0.peerjs.com",
  port: 443,
  secure: true,
  path: "/",
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" }
    ],
    iceCandidatePoolSize: 4
  }
}
```

No TURN means symmetric NAT can fail. Say so. A self-hosted broker is a config change plus a CSP
change; host and guest must use the same one.

## The seat refactor (the part people skip)

Grep the whole app for `=== 0`, `!== 0`, `hands[0]`, `seat 0`, `player 0`. Every hit is a guest bug.
The minimum surface:

| Area | Before | After |
| --- | --- | --- |
| AI scheduling | `if (turn !== 0) scheduleAI()` | `if (isBotSeat(turn)) scheduleAI()` |
| Local hand | `hands[0]` | `hands[MY_SEAT]` |
| Turn check | `turn === 0` | `turn === MY_SEAT` |
| Public action | `leadTrick(0, …)` | `leadTrick(MY_SEAT, …)` or `sendNetAction` |
| Scoreboard highlight | `seat.id === 0` | `seat.id === MY_SEAT` |
| Summary hero | `points[0]` | `points[MY_SEAT]` |
| Scene hand face-up | `seat === 0` | `seat === localSeat` |
| Scene pointer | `hands[0]` | `hands[localSeat]` |
| Match-end winner | `winner === 0` | `winner === MY_SEAT` |

Keep `SEAT_PROFILES = null` in solo and make `isBotSeat` fall back to `seat !== 0`. That is the
cheapest way to preserve a tested solo mode.

## Redaction: the only privacy boundary

```js
function sanitizeForSeat(source, seat) {
  ensureHiddenTags(source);
  const raw = serializableState(source);       // IDs, no snapshot, no hiddenTags
  raw.hands = raw.hands.map((hand, handSeat) =>
    handSeat === seat ? hand : hand.map(id => hiddenTag(handSeat, id, source))
  );
  raw.center = raw.center.map(entry =>
    entry.revealed || entry.seat === seat
      ? entry
      : { ...entry, tiles: entry.tiles.map(id => hiddenTag(entry.seat, id, source)), combo: null }
  );
  raw.log = raw.log.map(entry =>
    entry.kind === "hidden" && entry.seat !== seat ? { ...entry, combo: null } : entry
  );
  // rebuild lastTrick from the recipient's perspective, null other hidden combos
  raw.selected = [];
  return raw;
}
```

Rules:

1. Own hand real; every other hand `ghost-<seat>-<index>`.
2. Face-down centre from another seat: ghost ids, `combo: null`.
3. Hidden log / last-trick entries from another seat: `combo: null`.
4. Captures are public; keep real ids.
5. `hiddenTags`, `snapshot`, `selected`, `fast` never leave the host.
6. `lastTrick.human*` is rewritten for the recipient.
7. Build one payload per guest. Never send the same object to two seats.

**Tag stability matters.** Assign tags at deal, store `state.hiddenTags[seat][tileId]`, and restore
them from the undo snapshot. If you derive a tag from the current hand index, playing a card makes the
remaining cards appear to reshuffle. Deriving from the real tile id (even a hash) leaks identity.

## Ghost meshes and seat-relative view

- Create a pool of `ghost-0-0 … ghost-3-7` back-only meshes. Reuse the side/back/edge materials so a
  theme change recolours them.
- A guest's state already contains those ids; `tileObjects.get(id)` must find them.
- Put the table, tiles, seat rings and labels in a `world` group. Rotate by `-SEATS[MY_SEAT].angle`;
  keep camera, lights and floor fixed. Do not rotate the camera.
- Hand fan: the local seat is sorted and face-up; other seats are face-down.

## Lobby and bot fill

- Three modes: Play solo / Host a table / Join a table.
- Host: `LEAB-XXX-XXX`, four-seat roster, Start disabled until **two connected humans**, copy-invite.
- Guest: code + handle → waiting lobby; the first `state` closes it.
- Start: keep connected humans, replace every empty seat with `{ kind:"bot", name:"Bot n" }`.
- A guest who leaves mid-game: keep seat/hand/score, swap profile to bot, publish, schedule AI if it
  is their turn. Do not reseat.
- Host leaves: send `closed`, guests show "Table closed" + Play solo. No host migration.

## Wire protocol (minimum)

| Direction | Type | Purpose |
| --- | --- | --- |
| guest → host | `hello` | `{name, protocol}` |
| host → guest | `welcome` | seat, roster, room code |
| host → guest | `lobby` | roster/canStart update |
| host → guest | `start` | match begins |
| host → guest | `state` | redacted snapshot + `seq` |
| host → guest | `rejected` | full / in-progress / illegal |
| host → guest | `closed` | host intentionally left |
| guest → host | `action` | lead/follow intent, never a combo |
| both | `ping` / `pong` | optional clock probe |
| guest → host | `leave` | graceful disconnect |

Stamp every envelope with `__leab: PROTOCOL_VERSION`. Ignore unknown types; add fields freely; bump
the version for removals. See `references/protocol.md`.

## Launch, identity and exit

- **Ask before dealing.** A normal load should show the mode overlay before creating a game. If you deal in the background, a first-time visitor can later see a phantom “Resume match” for a game they never chose. Skip the overlay only for explicit `?mode=solo`, `?selftest=1`, `?demo=1`, host/join deep links or tests.
- **Resume is a real choice.** When a solo save exists, add a Resume card showing round, trick and score. Starting solo again should create a fresh match.
- **Require a name.** Every host and guest confirms their own handle before connecting. Store it locally, trim to ~18 chars, keep the menu and join fields in sync, and refuse with a clear message when empty.
- **Invite links carry a room, not an identity.** `?room=CODE` pre-fills the join panel and asks for a name. Only `?room=CODE&name=Bea` may auto-join (for tests/automation). Never silently reuse the last player's name from a shared browser.
- **Leave is destructive for the host.** Put a visible **Leave room** action in the normal Actions panel, not only inside the lobby. Confirm first and explain the consequence: host closes the room for everyone; guest becomes a bot. Hide it in solo. Keep it below the table on phones so it never covers the hand.
- **Do not offer Start after kickoff.** Once `net.started`, hide/disable Start and show “Match in progress”. A rematch goes through the normal New match flow.

## Room security (assume public source)

Treat the room code as an identifier, not a secret. Add three gates:

1. **Host approval on by default.** `hello` → PIN check → pending queue. Only an explicit host **Approve** assigns a seat and sends `welcome`. Deny, wrong PIN, expiry (120 s), busy and in-progress close the connection. Cap pending requests (~6).
2. **Optional strong PIN.** Policy: 15–64 chars, upper + lower + digit + symbol, no whitespace, reject common passwords, sequences, repeats, the room code and host name. Hash with SHA-256 and keep **only the digest in memory**. Show the plain PIN once for sharing; never put it in state, roster, URL, export or localStorage.
3. **Caps and allowlists.** Live connections (~16), per-connection messages (~80/10 s), inbound envelope (~16 KB), chat (200 chars / 350 ms), action tiles (6), voice calls only from approved roster peer IDs. Add a wrong-PIN lockout (~8 attempts / 60 s).

UI: **Generate** makes a 20-char grouped PIN; **Copy room info** copies code + optional PIN + link; **Copy invite link** never includes the PIN. Warn that Copy room info puts the PIN in the clipboard. The host's plain PIN should live only in a temporary reveal element, not in app state.

Say plainly in the README, SECURITY.md and lobby: the PIN is a brute-force cost, not authentication. Approval is the access-control decision. No anti-cheat, MFA or DDoS guarantee.

## Text chat and voice

Keep the two paths separate.

**Chat** is host-routed over the data channel:

- Guest sends `{type:"chat", text}`; host finds the sender profile, rate-limits (~350 ms), normalises/caps at 200 chars, appends once and broadcasts `{type:"chat", entry}` to every guest.
- Include the last 20–30 entries in `welcome`.
- Escape text; never render HTML. Keep it memory-only; clear on room close.
- A collapsible glass panel in the sidebar is enough; it must not cover the hand dock on phones.

**Voice** is a full mesh of PeerJS media calls, not a data-channel payload:

- Install one `peer.on("call")` handler. Only voice-active peers are called.
- The lexicographically larger peer id initiates, so both sides agree on one call per pair.
- `getUserMedia({audio:{echoCancellation,noiseSuppression,autoGainControl}})` only after a **Join voice** gesture; HTTPS/localhost is required.
- Attach remote streams to hidden `<audio class="remote-player-audio" autoplay playsinline>` elements.
- **Mute mic**: `localStream.getAudioTracks()[0].enabled = false`. Do not stop the track or close the call.
- **Mute others**: set `.muted` on every remote audio element. It must be independent of the mic.
- Speaking pulse: one `AnalyserNode` per stream at ~120 ms, RMS threshold, never connected to `destination`. Apply `.speaking` to the avatar and scoreboard row; keep a text status line.
- Relay `voice-state` through the host. Put `peerId` and `voice` flags in the roster so every client can build the mesh.
- Full mesh means N×(N−1)/2 paths; with four seats that is six. No TURN means some NATs fail.
- Test with a synthetic oscillator stream (`joinWithStream`) in headless Chrome; the production path still needs a real microphone.

## Verification that actually catches leaks

1. **In-page self-test** (pure): room code shape/normalization, peer-id stability, redaction hides
   another hand, keeps the recipient hand, strips host maps, ghost hydration, loopback envelope.
2. **Static check**: index has the lobby and CSP; `peer-manager.js` contains the broker and STUN;
   `sanitizeForSeat` exists; `hiddenTags` is deleted from saves; `publishState` guards `net.started`.
3. **Two-browser CDP** (`scripts/net-check.mjs`):
   - host page `?mode=host`, read code;
   - guest page via `/json/new` `?room=CODE&name=Guest`;
   - assert two humans, start, two bot seats;
   - guest own hand 8 real ids, all other hands 24 ghost ids;
   - drive both human seats until a trick resolves;
   - close the guest target and assert seat 1 becomes a bot;
   - fail on any console exception.
4. **Screenshot** the guest table (`GUEST_SHOT=...`) to prove the view rotation and ghost backs.

Do not put the two-browser test in the default offline CI. It needs the public broker.

## Critical traps

| Trap | Symptom | Fix |
| --- | --- | --- |
| Seat 0 still hard-coded | guest sees host hand or cannot act | `MY_SEAT` everywhere |
| Sending host state raw | guest reads all hands | sanitize per recipient |
| Index-derived ghost ids | cards reshuffle on play | stable tags at deal + undo restore |
| Publishing in lobby | guest gets host's solo game | `if (!net.started) return` |
| AI schedules remote humans | guest turn auto-played | `isBotSeat` only |
| Guest calls engine | silent desync | public API routes to `sendNetAction` |
| Rotating camera | lighting/controls break | rotate a world group |
| `&name=` lost by `/json/new` | both players named Host | encode the full URL or set the name in the panel |
| Closing only the CDP socket | disconnect not simulated | `Page.close`, then wait for bot roster |
| Six-seat poker assumption | rules no longer the game | keep four winds / 32 tiles |
| Public broker in CI | flaky builds | separate net-check |

More in `references/pitfalls.md`.

## Definition of done

- [ ] Solo still passes its full suite; no visual regression.
- [ ] Launch lobby, host, join, copy link and room chip work in EN and TH.
- [ ] A normal load asks before dealing; a saved solo game offers Resume match.
- [ ] Host and guest must confirm a name; invite links do not reuse a stale identity.
- [ ] A visible Leave room action confirms, hides in solo, and stays out of the phone hand dock.
- [ ] Host approval holds every guest; only Approve assigns a seat.
- [ ] PIN is 15+ chars with four classes, generated on demand, stored as a digest only, and absent from URL/state/export.
- [ ] Connection, message, payload, chat and voice-call caps are enforced.
- [ ] Chat is escaped, capped, rate-limited and echoed through the host.
- [ ] Voice joins only on a gesture, attaches remote audio, and mutes mic/deafen independently.
- [ ] Two humans can start; empty seats become bots; four humans fit.
- [ ] Each guest sees own hand real, others ghosted; the wire payload is asserted.
- [ ] Guest seat is at the bottom; table world rotates, not camera.
- [ ] Both humans can lead and follow through the data channel.
- [ ] Guest disconnect converts to a bot; score/hand preserved.
- [ ] Host disconnect shows Table closed on guests.
- [ ] No host migration, TURN or anti-cheat is claimed.
- [ ] Protocol, multiplayer, security, privacy, deployment, testing and AGENTS are current.
- [ ] `state.json`/`STATE.md` record duration, tokens, OpenCode and the model.
- [ ] Skill mirror published.

## Files in this skill

- `references/protocol.md` — envelopes, redaction table, authority invariants.
- `references/seat-refactor.md` — every place the local seat hides in a solo codebase.
- `references/transport.md` — room codes, PeerJS host/client, broker, retries, loopback.
- `references/verification.md` — three test layers and the two-browser harness.
- `references/pitfalls.md` — the bugs that actually happened.
- `references/release.md` — docs set, screenshots, GitHub Pages, skill mirror.
- `templates/AGENTS-P2P.md` — handoff scaffold.
- `templates/MULTIPLAYER.md` — operations doc scaffold.
- `templates/PROTOCOL.md` — wire contract scaffold.

## Attribution

Original skill by Somphol Boonjing, derived from the Leab-Tui 3D 1.4.0 release. PeerJS and Three.js
are MIT. The traditional game and its rules source are cited in the project. No brand marks, assets or
private data are included. See `ATTRIBUTION.md`.
