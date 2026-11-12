---
name: Multiplayerization
description: Add real-time multiplayer to an existing app — choose the authority and transport, design rooms and a versioned protocol, gate access with approval and passcodes, project private state per participant, add chat/voice, recover reloads and stale clients, test with two clients and release without a backend (or with one).
version: 1.2.0
---

# Multiplayerization

Turn a single-user app into a **multi-user room** without turning it into a distributed-systems
research project. The method is transport-agnostic: the same contracts work for a Three.js game, a
whiteboard, a quiz, a dashboard, a watch party or a small editor.

The worked example is **Leab-Tui 3D** (<https://github.com/somphol/leab-tui-3d>), but read it for the
mechanism, not as a template to reskin.

## When to use

- Two to eight people need to share a live session.
- The app is static or mostly static and you want to avoid a backend.
- The interaction is turn-based, host-led, or small enough for a host or a CRDT.
- You can accept a room code, a lobby, and explicit access control.

**Not for:** matchmaking at scale, ranked competition, financial transactions, or anything that needs
an authoritative server you do not control. If the answer must survive the host closing the tab, you
need a server, not P2P.

## The first decision: authority

Do not start with a transport. Start with **who owns the truth**.

| Model | Use when | Cost |
| --- | --- | --- |
| **Host-authoritative** | Turn-based games, quizzes, small editors, shared dashboards | Host tab is a single point of failure; host can cheat |
| **Server-authoritative** | Money, ranking, anti-cheat, regulated data | Backend, auth, deployment, cost |
| **CRDT / peer-equal** | Collaborative text, whiteboards, offline-first notes | Conflict semantics, larger payloads, harder access control |
| **Lockstep / deterministic** | RTS, physics, replay-driven apps | Determinism bugs, rollback, cheating |

For a first multiplayer release, **host-authoritative** is usually the shortest correct path: one
client already has the whole state and the rules. You add a lobby, a protocol and per-recipient
projection; you do not rewrite the app into a distributed system.

## The five contracts before code

Write these down before touching UI:

1. **State ownership** — who may write each field? What is an intent, and what is derived?
2. **Serialization boundary** — one function converts live objects to wire-safe data (and back).
3. **Room identity** — room code, host id, participant id, display name, role/seat.
4. **Protocol** — envelope version, message types, sequence, errors, close reasons.
5. **Privacy** — what is public, what is per-participant, what must never leave the owner.

If you cannot answer these in one page, your multiplayer is not ready to code.

## Workflow

### 0. Stabilize the solo app

The single-user path must pass its tests before you add a second client. A network layer amplifies
every race, leak and serialization bug.

- [ ] Solo tests pass.
- [ ] State can be saved/loaded without live objects.
- [ ] The UI can render from a plain snapshot.
- [ ] No rule or state mutation lives only in a DOM event handler.

### 1. Pick the smallest multiplayer slice

Ship one of these first:

- **Spectator** — host broadcasts public state; guests cannot act.
- **Turn hand-off** — one active participant, everyone else waits.
- **Two-user collaboration** — one shared document/board with last-writer-wins or a simple lock.

Do not ship chat, voice, presence, approval and reconnection in the same first slice unless they are
the product.

### 2. Define the shared state

Write the schema:

```text
room      { code, hostId, createdAt, phase }
participants [{ id, name, role, connected, voice }]
state     { revision, phase, public, privateByParticipant }
```

Keep one **revision/sequence** counter. Every authoritative update increments it. Clients ignore
older revisions. Snapshots are replaceable; intents are not.

### 3. Abstract transport

Do not call `peer.send` from UI code. Define a tiny interface:

```js
transport.send(participantId, message)
transport.broadcast(message, except)
transport.onMessage(handler)
transport.onJoin(handler)
transport.onLeave(handler)
transport.close()
```

Adapters:

- **PeerJS/WebRTC** for static hosting with direct data channels.
- **WebSocket** for a small relay/server.
- **BroadcastChannel** for same-browser tabs (excellent for tests).
- **Loopback** for in-page protocol tests.

The app should not know which adapter is active. A two-tab `BroadcastChannel` demo can validate the
protocol before you debug NAT.

### 4. Version the envelope

```json
{ "__mp": 1, "type": "state", "rev": 17, "payload": {} }
```

- Unknown types are ignored.
- Add fields freely; bump the version for removals/renames.
- Reject wrong-version peers with a readable reason.
- Cap envelope size at the transport boundary.

### 5. Make the host authoritative

- Hosts run the real app logic, timers, AI and validation.
- Guests send **intent**, never derived state or a claimed result:

```json
{ "type": "action", "action": "move", "payload": { "from": 3, "to": 5 } }
```

- The host re-validates every intent against the same code path as local input.
- The host broadcasts a new snapshot/revision after each accepted change.
- Guests never run the authoritative reducer. If you need optimistic UI, render a local overlay and
  roll it back on the next snapshot.

### 6. Project state per recipient

One snapshot for everyone is the classic privacy bug. Build a `projectFor(state, participantId)`
function:

| Data | Public | Owner only |
| --- | --- | --- |
| Scores, board, cursor, turn | yes | — |
| Private hand, draft answer, notes | — | yes |
| Hidden opponent pieces | placeholder id | real id to owner |
| Admin controls | role-gated | — |

Rules:

- The projector is the only privacy boundary. Run it per recipient.
- Stable placeholder ids (`hidden-<participant>-<index>`) prevent cards/items from visibly shuffling.
- Strip server-only maps, undo stacks and local selections.
- Never send the same mutable object to two recipients.

### 7. Lobby and identity

- Mode overlay on load: **Solo / Host / Join** (and **Resume** if a local save exists).
- Require a display name before hosting/joining; trim and escape it.
- Host creates a short room code; guests enter it.
- Optional **host approval**: a guest request is queued, not seated. Only Approve assigns a role and
  sends the welcome/state.
- **Passcode**: if used, generate it automatically (20 chars, four classes); **New PIN** rotates it. Store only a digest in memory. Never put it in the invite URL. Policy details belong behind an ⓘ, not a wall of text.
- **Copy invite link** sends the URL only; **Copy room info** may include the passcode, with a warning.
- Show a roster, pending requests, connection status and a way to leave.
- **Late join:** while a session runs, the host may deny, approve into a bot seat (keeping its hand and
  score) or approve as a redacted viewer, or pause joins for 30 minutes. Never displace a live human.

Assume the code and policy are public. A passcode is a brute-force cost, not authentication. Approval
is the access-control decision.

### 8. Resilience: assume a stale view, not lost commands

A host-authoritative room does not diverge when a guest message is dropped — the play simply never
happened. The failure you will actually debug is a **stale view**: a guest showing "Bot is thinking"
for a bot that moved a minute ago. Repair the view; do not replay the log.

- **Self-sufficient snapshots:** any snapshot plus the render path must produce a correct screen. Then
  catch-up is one snapshot, and "latest revision wins" is idempotent.
- **Catch-up ladder:** host sends a full redacted snapshot on every accepted change and every ~4 s
  during live play; on idle/summary screens it sends a cheap `pulse {rev}`. A guest behind sends
  `resync` (rate-limited); the host answers with a snapshot tagged `resync: true`. A snapshot tagged
  as a repair is accepted even at an older revision.
- **Idempotent intents:** every action carries `actionId`; the host stores the last id + ack per
  participant and never applies one twice. `action-ack {actionId, ok, reason, rev}`. No ack in ~3.5 s
  means "refresh and confirm", never "silently play again".
- **Liveness:** any inbound message refreshes `lastSeen`; a participant is offline after ~20 s. A
  guest watchdogs ~15 s without traffic and reconnects with its token. If a human's active turn has
  run ~30 s, the host converts the slot to a bot/placeholder **keeping its state and token**, sends a
  `seat-timeout`, and closes the stale connection. Keep watchdog < turn timeout, or you convert a
  seat that was about to heal itself.
- **Disconnect:** keep the participant's slot, hand/score and identity; mark offline or replace with a
  placeholder. Never renumber live roles.
- **Reconnect:** a per-seat bearer token (16 random bytes) delivered in `welcome`, stored in
  `sessionStorage` plus an optional name-bound, TTL'd `localStorage` card, and checked **before** the
  passcode/approval gate. Never in the roster, state, URL or export. A rejoin reclaims a slot; it
  never mints a new one.
- **Host reload is not host loss:** persist `{code, state, roster with tokens, chat, queue}` to
  `sessionStorage` on `pagehide`, close the peer to free the room code, reopen the same code on boot,
  hydrate, rotate the PIN, and let guests retry/rejoin. A closed tab or another device still ends the
  room — say so plainly instead of implying migration.
- **Late join:** approve into a free or placeholder slot; mid-turn, reserve the slot, seat the guest as
  a redacted **viewer immediately**, and promote at the next turn boundary. Hold the reservation for a
  few minutes so a reload can reattach. Never displace a live human.
- **Audience is public:** if watching is possible, carry the viewer list in every state/welcome/lobby
  and show a watcher count to every human, not just the host.
- **Timeouts:** pending approvals, idle turns, action acks, media calls.
- **Persistence:** room state usually memory-only. Do not persist secrets or private state.
- **Stale views:** re-render on panel close if snapshots were skipped while it was open; re-apply a
  snapshot that arrived meanwhile.

Numbers, envelopes, failure tests and the symptom→cause table:
`references/resilience-and-rejoin.md`.

### 9. Chat

- Route text through the host (or server) so it is ordered and attributed.
- Cap length (e.g. 200 chars), rate-limit per sender, escape HTML.
- Keep a small in-memory history; include the last N entries in the welcome.
- A collapsible glass panel is enough. Do not cover the primary interaction on phones.
- No HTML chat, no link previews, no file uploads unless you add moderation and storage.

### 10. Voice

Voice is a separate media path, not a data-channel message.

- Request `getUserMedia` only after a **Join voice** click; HTTPS/localhost required.
- Full mesh for small rooms (N×(N−1)/2 paths); a server mixer/SFU for larger rooms.
- Attach remote streams to hidden `<audio autoplay playsinline>` elements.
- **Mute mic:** `localStream.getAudioTracks()[0].enabled = false`; keep the call.
- **Deafen:** `.muted = true` on every remote audio element; leave the local mic unchanged.
- Accept media calls only from participants already in the approved roster.
- A per-stream analyser can drive a speaking pulse; do not connect the analyser to `destination`.
- No recording, transcription or moderation unless explicitly designed.
- Public STUN works for many home networks; symmetric NAT needs TURN.

### 11. Security and abuse

- Host caps: connections, pending requests, messages/second, envelope size, chat rate, intents.
- Validate and bound every field: names, ids, arrays, text, numbers.
- Close rejected/oversized/rate-limited connections; do not leave sockets parked.
- Escape all peer text. Never `innerHTML` it.
- Add CSP; pin CDN versions; no remote fonts/analytics just because you added multiplayer.
- Document trust: host sees all state; guests can inspect their own client; no anti-cheat or MFA.
- Open source means the protocol is known. Rely on approval, entropy, caps and allowlists, not secrecy.

### 12. Test with two real clients

At minimum:

1. **Pure tests** — serialization, projection/privacy, protocol envelope, room codes, passcode policy.
2. **Static guard** — files, version, i18n, no secrets, caps present, CSP.
3. **Two-client browser test** — host page + guest page, real transport; assert join, approval, state,
   private projection, one action in each direction, disconnect handling.
4. **Failure tests** — wrong passcode, full room, denied request, host close, malformed/oversized
   message, rate limit.
5. **Media test** — synthetic oscillator stream for the mesh; real mic manual checklist.
6. **Mobile** — 390 px roster/lobby/chat, controls not covering the primary canvas.

Keep network-dependent tests separate from offline CI. A loopback test is not a WebRTC test.

### 13. Release

- Version bump + changelog + save-format version.
- README, AGENTS.md, protocol, operations, security, privacy, testing, deployment, FAQ, roadmap,
  release checklist and gallery.
- Screenshots: mode overlay, host lobby/security, guest view, chat/voice, phone.
- State file: duration, token counts, harness, model, session id, credits.
- Publish static build and the skill mirror.

## Definition of done

- [ ] Solo still passes; no visual regression.
- [ ] Host/join/approve/deny/leave all work.
- [ ] A room code and optional passcode are not treated as authentication.
- [ ] Guests cannot write authoritative state or read another participant's private data.
- [ ] Placeholder ids are stable; no visible reshuffle.
- [ ] Disconnect/host-close behavior is explicit and tested.
- [ ] A dropped snapshot, a reloaded guest and a stalled turn all recover without a manual reload.
- [ ] An action retried with the same id is applied once; a stale guest can resync on demand.
- [ ] Chat is escaped and rate-limited; voice is opt-in and allowlisted.
- [ ] Caps exist for connections, messages, payloads and intents.
- [ ] Two real clients pass the end-to-end test; offline CI does not need the network.
- [ ] Late join, viewer redaction and host reload are implemented or explicitly declared unsupported.
- [ ] Docs and state file are current; credits name the harness and model.

## Critical traps

| Trap | Symptom | Fix |
| --- | --- | --- |
| Transport calls in UI | untestable, adapter lock-in | one transport interface |
| One snapshot for all | private data leaks | `projectFor(state, participant)` |
| Client-derived result | desync/cheat | intent + host validation |
| Index-based placeholder ids | items reshuffle | stable ids assigned at creation |
| Passcode in invite URL | leaked in history/referrer | URL only; passcode separate |
| Passcode stored plaintext | leak via memory/logs | SHA-256 digest in memory |
| Chat rendered as HTML | XSS | textContent/escapeHTML |
| No envelope cap | one message freezes host | size/rate/type bounds |
| Voice call from any peer | resource abuse | approved-roster allowlist |
| Mic mute stops track | call dies | `track.enabled = false` |
| Deafen changes mic | confusing state | only remote `<audio>.muted` |
| Assuming P2P is DDoS-proof | outage | caps + server if needed |
| Panel skips snapshot rendering | returning player sees an old board | re-render on overlay close |
| Reload treated as host loss | room dies on every deploy | `sessionStorage` recovery + fresh PIN |
| Late join takes a live seat | a human loses hand/score | replace bots only; else viewer |
| Resync checked after approval | returning guest never gets in | token check before passcode/approval |
| Retry without an action id | the same play happens twice | `actionId` + stored ack |
| Watchdog longer than turn timeout | converts a healthy seat to a bot | watchdog < turn timeout |
| Stale peer holds the room code | host reload gets "room not found" | close the old peer before reopening |
| Queue seated with no feedback | guest thinks the join failed | viewer welcome now, promote at boundary |
| Watcher list host-only | guests cannot see the audience | `viewers` in every state/welcome/lobby |

More in `references/`.

## Files in this skill

- `references/decision-guide.md` — authority/transport selection.
- `references/protocol-design.md` — envelopes, revisions, intents, projection, reconnect.
- `references/resilience-and-rejoin.md` — catch-up ladder, acks, liveness timers, seat tokens,
  queued late join, host reload, failure tests.
- `references/access-and-security.md` — approval, passcodes, caps, threat model.
- `references/chat-and-voice.md` — text relay, voice mesh, mute/deafen, speaking meter.
- `references/hosting-and-auto.md` — lifecycle, passcode policy, late join, reload recovery, live updates.
- `references/testing.md` — pure, static, two-client, failure and media tests.
- `references/app-patterns.md` — games, editors, quizzes, dashboards, watch parties.
- `references/release.md` — docs, screenshots, state, publishing.
- `templates/AGENTS.md` — repository handoff.
- `templates/PROTOCOL.md` — wire contract.
- `templates/SECURITY.md` — threat model and controls.
- `templates/two-client-check.mjs` — adaptable CDP harness.
- `ATTRIBUTION.md`.

## Provenance

Original skill by Somphol Boonjing, distilled from the Leab-Tui 3D 1.6.0 multiplayer build and
extended with the 1.9.18 late-join, viewer, host-reload and live-update lessons, then the 1.10.x
reliability pass (sequence catch-up, action acks, liveness timers, seat tokens, queued joins,
watchers). Generalized to non-game apps. PeerJS and Three.js are MIT. No brand marks, credentials or
private data are included.
See `ATTRIBUTION.md`.
