# Pitfalls that actually happened

These are from adding P2P to Leab-Tui 1.3.2. Each cost a debugging cycle.

## 1. The roster indexed an object

```js
// wrong: seat is the SEATS entry object
SEATS.map(seat => players[seat])
```

Output: `Bot seat [object Object]1`, and the host seat appeared as a bot. Fix: `players[seat.id]` and
`seat.id + 1` in the template.

## 2. `hidden` sections still rendered stale content

`#lobbyWaitRoster` is `hidden` but still rendered; tests that query all `.lobby-seat` saw eight rows.
That is harmless visually, but assert within the visible panel.

## 3. A guest state looked empty during `dealing`

The first host publish after `beginMatch` can be `phase: "dealing"` if the timer fires before the deal.
Wait for `lead`/`follow`, not any state, in the harness. The client handles `dealing` gracefully.

## 4. The two-browser test never disconnected

Closing the CDP WebSocket does not close the page. Use `Page.close`, then wait for the host roster to
show `kind === "bot"`. Waiting on "the roster exists" passes immediately because it existed before.

## 5. Chrome's `/json/new` dropped `&name=Guest`

`PUT /json/new?http://host/?room=X&name=Y` treats `&name` as an endpoint parameter. Encode the entire
URL: `PUT /json/new?${encodeURIComponent(url)}`. Otherwise both pages share the stored handle.

## 6. The host published the solo game during the lobby

`saveMatch` runs on every bot action. Opening a room mid-solo made `publishState` send that game to a
guest as soon as they joined. Guard: `if (!net.started) return;`.

## 7. Ghost ids derived from the hand index

If the tag is `ghost-<seat>-<handIndex>`, playing card 0 makes card 1 become tag 0; the scene shows one
card moving and another vanishing. Assign tags at deal and restore them from the undo snapshot.

## 8. `lastTrick.humanCombo` leaked the host's hidden play

`sanitizeForSeat` redacted centre entries and log entries but not the host-oriented `human*` fields.
Rebuild `lastTrick` from the recipient's perspective (seat, winner, local entry) or a guest sees the
host's face-down combination.

## 9. `net.sendAction` did not exist

The public API called a method on a plain `net` object. Define one global `sendNetAction` and use it
from both `humanLead`/`humanFollow` and `LeabTui.lead`/`follow`. Otherwise a guest API call mutates
the local state and silently desyncs.

## 10. The client scheduled AI

`beginTrick` checked `turn === 0`; every non-zero seat was AI. In a room, that auto-played human seats.
Use `isBotSeat` and nothing else. Clients never schedule AI.

## 11. The camera was rotated instead of the table

Rotating the camera breaks lights, controls and framing. Put the table, tiles, rings and labels in a
`world` group; rotate that by `-SEATS[MY_SEAT].angle`. Keep camera/lights/floor fixed.

## 12. Guest labels duplicated

Labels were created for every seat and hidden only for seat 0. On a guest, seat 0's label was visible
and their own seat label was too. `setViewSeat(seat)` should hide the local seat's label and show the
others.

## 13. The first test asserted a fixed leader

The red General holder leads. It can be the host, guest or a bot. The harness must read
`state.turn` and drive that human, not assume host seat 0.

## 14. Binary checks were too weak

"center >= 1" passed while the guest had not actually played; "guest phase" read `dealing`. Assert the
specific transition and the privacy invariant, and wait for the expected phase.

## 15. The skill and docs drifted

The README said 25 checks after the suite grew to 35; the save version said 1.1.0. Update README,
AGENTS, STATE, state.json, CHANGELOG, CITATION and the check thresholds together, then run the static
check which fails on drift.
