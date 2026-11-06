# Verification

Three layers. The third is the one that finds real multiplayer bugs.

## 1. Pure in-page checks

Add to the existing self-test:

- room code length/alphabet, normalization, formatting, peer-id stability;
- `sanitizeForSeat(state, otherSeat)` → every hand id is `ghost-*`;
- `sanitizeForSeat(state, ownSeat)` → own hand ids resolve to real tiles;
- no `hiddenTags` or `snapshot` in the payload;
- `ghost-2-3` hydrates and round-trips;
- loopback envelope arrives with `__leab`.

Count them. The Leab-Tui release went from 25 to 35 checks.

## 2. Static guard

`scripts/check.mjs` should assert:

- `peer-manager.js`, `docs/MULTIPLAYER.md`, `docs/PROTOCOL.md`, `scripts/net-check.mjs` exist;
- index contains the lobby markup, the room chip and the broker in `connect-src`;
- `peer-manager.js` contains the pinned PeerJS version, the secure broker and a STUN server;
- `script.js` contains `sanitizeForSeat`, `hydrateRemoteState`, `convertSeatToBot`, `sendNetAction`;
- `delete base.hiddenTags` and `if (!net.started) return;`;
- both modules pass `node --check`.

## 3. Two real browsers

`scripts/net-check.mjs`, Node 22+, Chrome, outbound `0.peerjs.com`.

```text
launch Chrome headless with a temp profile and a random CDP port
host page:  ?mode=host&name=Host
   wait net.getState().role === "host"
guest page: /json/new?<encoded ?room=CODE&name=Guest>
   wait net.getState().role === "client"
assert lobby humans === 2
host click #lobbyStartBtn
   wait guest phase ∈ {lead, follow}
assert guest own hand: 8 ids, none ghost
assert other hands: 24 ids, all ghost
assert exactly two profiles kind === "bot"
drive both human seats until a trick resolves
   for each 700ms:
     if phase lead and turn == host/guest → hint + lead
     if phase follow and turn == host/guest → hint + follow
     else wait for bots
close guest page (Page.close, not just the CDP socket)
   wait host roster[1].kind === "bot"
fail on any console exception on either page
```

### Details that matter

- **Create the second page** with `PUT /json/new?<url>`; encode the full URL or Chrome drops `&name=`.
- **Close the page** with `Page.close`. Closing only the WebSocket leaves the page alive, so no
  disconnect occurs.
- **Wait for conditions**, not fixed sleeps, except small animation waits.
- **Do not assert a fixed leader.** The red General can be in any hand; drive whoever's turn it is.
- **Console exceptions** are collected through `Runtime.exceptionThrown`.
- **The test is network-dependent.** Keep it out of the offline CI; run it before a multiplayer release.
- **Capture a guest screenshot** from the guest CDP session to verify view rotation and ghost backs.

## Manual checklist

- [ ] Launch overlay: solo, host, join.
- [ ] Host code, roster, copy link, Start disabled with one human.
- [ ] Guest join; waiting roster matches.
- [ ] Start: two humans + bots; both screens deal.
- [ ] Guest own hand face-up at the bottom; other hands face-down.
- [ ] Guest action on host and other guests.
- [ ] Guest close → bot takes over; play continues.
- [ ] Host close → guests see Table closed.
- [ ] Solo (`?mode=solo`) never shows the overlay and resumes normally.
- [ ] Blocked PeerJS CDN leaves solo unaffected.
- [ ] EN/TH switch updates lobby copy.

## Evidence to keep

```text
PASS host opened a branded room — LEAB-ABC-234
PASS guest joined a seat — seat 1
PASS lobby sees two humans
PASS guest received authoritative state — lead
PASS guest sees its own eight real tiles
PASS other hands are ghosted on the wire
PASS two empty seats filled with bots
PASS human actions crossed the data channel — 11 action(s)
PASS a trick resolved and state advanced
PASS disconnected guest converted to a bot — Bot 3
PASS host console clean
PASS guest console clean
ALL 12 MULTIPLAYER CHECKS PASSED
```
