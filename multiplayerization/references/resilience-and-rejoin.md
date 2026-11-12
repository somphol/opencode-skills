# Resilience, catch-up and rejoin

Everything here was learned by shipping a host-authoritative WebRTC table (Leab-Tui 1.10.x) where
players are on iPads, tabs get backgrounded, and a deploy happens mid-match. The numbers are proven
defaults, not laws: copy the ladder, re-measure the timings.

## The mental model that prevents the hard bugs

With a host-authoritative design, a **lost guest message is harmless**. The guest sends intent, the
host validates and broadcasts the result; if the message never arrived, the play never happened. The
only real failure is a **stale view** — a guest showing "Bot 2 is thinking" for a bot that moved 40
seconds ago.

So build two independent repairs:

1. **Snapshots must be self-sufficient.** Any snapshot + the app's render path must produce a correct
   screen, with no prior history. Then catch-up is "send a fresh snapshot", not "replay the log".
2. **The view must know it is stale.** A monotonic `seq` plus a heartbeat is what turns "frozen" into
   "refresh now".

A design that replays deltas needs sequencing, gap detection and a replay buffer. Full redacted
snapshots need none of that: **latest seq wins**, idempotently. For rooms under a dozen people the
bandwidth is trivial — take the simpler contract.

## The catch-up ladder

```text
every accepted change   host → state {seq, ...}         full redacted snapshot for that recipient
every 4 s (live play)   host → state {seq, ...}         unconditional refresh
every 4 s (summary/idle) host → pulse {seq}             cheap "nothing changed, here is the counter"
guest seq < host seq    guest → resync                  rate-limited (e.g. 1 per 2 s per guest)
                        host  → state {seq, resync:true}
no traffic for 15 s     guest watchdog → reconnect to the same seat with the stored token
```

Implementation notes that cost a cycle each if missed:

- `seq` is **per room**, monotonic, and lives beside the state — not inside a message counter that
  resets when the host reloads. After a host reload, start above the recovered value.
- A guest ignores `seq <= lastSeq`, but **accepts `resync: true` at any seq** (it is explicitly a
  repair).
- `pulse` exists so idle rooms do not resend full state forever; it carries only what a guest needs
  to notice drift. If the guest's app can be affected by idle-time drift (scores, clocks, presence),
  include those fields in the pulse instead of a bare counter.
- Rate-limit `resync` on the host. A room of eight guests whose laptops wake together must not
  produce a thundering herd of full snapshots.
- Never let the guest re-run the reducer to "catch up". A repairing client re-renders from the
  snapshot; it does not replay intents.

## Idempotent intents

Any message that changes state needs an id and an ack.

```text
guest → action  {actionId, action, payload}
host  → action-ack {actionId, ok, reason, seq}
```

- The host stores **the last actionId per seat** with its ack. A retry with the same id returns the
  stored ack and does **not** execute twice.
- No ack after ~3.5 s: the guest treats the action as unconfirmed and **refreshes**, showing a
  "still confirming" state — it does not silently play again. On a turn-based board, a duplicate
  play is a rules violation, not just a visual glitch.
- An `ok:false, reason:"illegal"` ack clears the pending intent and triggers one silent resync. That
  is how a guest that drifted out of turn order recovers without a reload.
- A user-facing **Refresh table** button and a `visibilitychange` handler call the same resync path.
  Users should not have to reload to fix a stale board.

## Liveness: the host must be able to give up on a seat

A turn-based room that waits forever on one backgrounded iPad is the most common "broken game" report.

```text
guest pings every 5 s (and any message counts)
host  marks a seat offline after 20 s of silence
host  forces a bot after 30 s of a human's active turn (lead/follow/showdown/bid/draft)
guest watchdog reconnects after 15 s with no state, pulse or pong
```

Rules:

- **Any** inbound message refreshes `lastSeen`; do not require a dedicated heartbeat type to prove
  life, or chatty guests get marked offline.
- The turn timeout must be **longer than the client watchdog**, or the host converts a seat that was
  about to heal itself. Watchdog 15 s < turn timeout 30 s is the safe ordering; document both.
- Before converting, send `seat-timeout` so the guest can explain itself on return, then close the
  stale connection and keep the rejoin token.
- Convert to a **bot/placeholder that preserves hand, captures and score** — never delete the seat.
  The returning human should land exactly where the bot left off.
- Start the AI only if it is that seat's turn; otherwise the row is updated and play continues.
- Show it: an offline seat marker plus "took over after 30 s" beats a silent roster change.

## Rejoin credentials

The cheapest reliable rejoin is a **per-seat bearer token**.

```text
acceptParticipant → 16 random bytes → welcome {rejoinToken, seat, rejoin:false}
guest stores {code, seat, token, name, expiresAt}: sessionStorage + a TTL'd localStorage card
hello on boot → {rejoinToken}  (no passcode, no approval)
host checks token BEFORE the passcode/approval gate → reattach(same seat) → welcome {rejoin:true, state}
```

- The token identifies a **seat**, not a room, and not a person. It is a bearer credential: anyone
  holding it can claim that seat, so never put it in the roster, URL, state, chat, logs, export or
  host recovery blob.
- Check it **before** the passcode and approval gates, or a returning player is asked for credentials
  they were never shown.
- While reconnecting, show "Reconnecting to your seat…", not the join form. On failure show the form
  **prefilled** with code and name plus the real error.
- Name-bind the long-lived localStorage card: use it only when the invite name matches or no name is
  supplied. Otherwise a shared iPad silently hands one player another's hand.
- Bind to the seat only — never let a rejoin mint a new seat. If the seat is now a bot, the bot stops
  and the human resumes with the bot's hand, captures and score.
- Clear both copies on intentional Leave or a denied/bad-passcode rejection. Expire the card (7 days
  is a sane default).
- The token must survive disconnect-to-bot and the start-of-match bot fill, or the mechanism is
  useless in exactly the cases it exists for.
- If a `welcome` is lost, resend `hello` a bounded number of times (3) and stop on
  `welcome`/ack. Unbounded retry loops show up as duplicate lobby entries.

## Host reload is not host loss

A deploy or a refresh must not end the table; a closed tab may.

```text
pagehide  → save recovery blob to sessionStorage, close the host peer (frees the room code)
boot      → detect blob → reopen the SAME code with retry → hydrate → resume phase/timers → new PIN
guest     → "The host is restarting…" → retry join/rejoin with its seat token
```

- Recovery state: `{code, state, profiles with rejoinTokens, chat, queued, suppressUntil}`.
  `sessionStorage` only — same tab, same origin, no cross-device promise.
- Rotate the PIN on recovery and keep the plain copy only for the Copy-room-info UI.
- **Close the old peer before reopening**: the room code is derived from the room, and a lingering
  peer holds it, producing "room not found" on the host's own reload.
- Guests recover automatically only because they hold seat tokens. Say that in the UI: an update
  banner that promises "your table survives" is honest; "the room survives anything" is not.
- A closed tab (or a different device) still ends the room. Do not claim migration. If the product
  needs it, implement an explicit epoch handoff, not a hopeful snapshot.

## Late join without stealing a seat

Approving a mid-match guest must never displace a live human, and it must feel instant.

```text
request → host approves:
  free/bot seat + between turns → seat now, welcome with state
  bot seat + mid-turn          → reserve seat, viewer welcome NOW, promote at the next boundary
  no seat / host chooses       → viewer (seat -1) for the rest of the match
```

Details that made it feel correct:

- The queued guest **enter immediately as an audience viewer** (`seat: -1`, all hands ghosted, dock,
  chat and voice hidden) with a banner: "Approved — watching until this trick/set ends". Waiting on a
  "waiting for host" screen is indistinguishable from a failed join.
- Promote at a **defined boundary** (start of a trick/turn/set), not on a timer. Promote by sending a
  normal welcome for the reserved seat; the dock returns.
- Hold the reservation for ~5 minutes if the queued guest drops, so a reload can reattach; the bot
  keeps playing and the host can cancel the reservation from the invite sheet.
- Carry the bot's hand and score to the human. Replacing a bot is a transfer, not a reset.
- Viewers are **not seats**: no rejoin token, re-approved after reload, never able to act, and their
  projection hides every hand and every unrevealed play.
- If the host previously paused joins, rejoin tokens must bypass the pause or returning players are
  locked out by their own host.

## Watchers must be visible to everyone

If a room can be watched, every human needs a watcher indicator (`👁 n`) listing names, with queued
audience members marked "waiting for seat". Carry the viewer list in **every** state, welcome, lobby
and start message. A host-only audience list means one lagging guest hides the audience from the
others, and players cannot tell whether they are being observed.

## Timers table

| Timer | Value | Consequence of getting it wrong |
| --- | --- | --- |
| Snapshot heartbeat (live) | 4 s | stale board on a dropped snapshot |
| Pulse interval (idle) | 4 s | idle rooms burn bandwidth, or guests never notice drift |
| Guest ping | 5 s | false offline markers |
| Seat considered offline | 20 s | roster lies about presence |
| Guest watchdog reconnect | 15 s | frozen "Bot is thinking" |
| Turn timeout → bot | 30 s | table waits forever on one device |
| Action ack wait | 3.5 s | blind duplicate plays |
| Resync rate limit | ~1 / 2 s / guest | snapshot storm after a network blip |
| Queued-seat reservation | 5 min | queue lost on a reload |
| Join suppression | 30 min | host cannot pause requests |
| Seat card TTL | 7 days | shared-device seat theft, or constant re-approval |

## Test the failure, not the happy path

Add these to the two-client harness (see `testing.md`); each one caught a real bug:

- Guest reload → **auto-rejoins the same seat** without a prompt, and the board is current.
- Host reload (same tab) → room reopens on the same code, guest reconnects, PIN rotated.
- Disconnect a guest mid-match → seat becomes a bot, token kept; reconnect restores hand and score.
- Approve a guest mid-turn → viewer banner appears immediately; promotion happens at the boundary.
- Withhold a snapshot (or stall the channel) → the guest watchdog reconnects within ~15 s.
- Double-send one `actionId` → applied once, ack returned twice.
- Open a full-screen panel, let state change, close it → board is current, not the pre-panel frame.
- Viewer projection: every hand and unrevealed set is a placeholder, and the viewer has no dock.

## Symptom → cause

| Symptom | Real cause | Fix |
| --- | --- | --- |
| Guest stuck on "Bot is thinking" forever | no heartbeat/watchdog; guest missed the update | seq + 4 s snapshot + 15 s watchdog |
| "Play is invalid" on every tap after a while | guest's view drifted out of turn | resync on illegal ack + Refresh button |
| Host sees no request from a returning guest | rejoin checked after the approval gate | check token first, then passcode/approval |
| Board is several moves old after closing a panel | render suppressed while the panel was open | re-render from current state + re-apply pending snapshot |
| Update banner kills the room | reload treated as host loss | sessionStorage recovery + same code + new PIN |
| Guest approves, then sees nothing | seated only at the next boundary with no feedback | audience welcome immediately, promote later |
| Host waits minutes on one player | no turn timeout | 30 s → bot, keep token, notify |
| Two identical plays from one tap | retry without an action id | actionId + stored ack |
| Someone's hand appears on a shared iPad | seat card not name-bound | bind card to the invite name |
| Audience invisible to guests | viewers only in host UI | `viewers` in every state/welcome/lobby |
