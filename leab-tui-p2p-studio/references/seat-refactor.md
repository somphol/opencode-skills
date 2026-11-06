# The seat refactor

A solo game casually assumes the local player is seat 0. Every one of those assumptions is a guest
bug. Do this refactor before writing the lobby.

## Globals

```js
let MY_SEAT = 0;
let SEAT_PROFILES = null; // [{ seat, name, kind, connected, connId }]
let net = null;

function isNetworked() { return Boolean(net && SEAT_PROFILES); }
function isHost() { return net?.role === "host"; }
function isClient() { return net?.role === "client"; }
function isBotSeat(seat) {
  if (seat === MY_SEAT) return false;
  if (SEAT_PROFILES) {
    const kind = SEAT_PROFILES[seat]?.kind;
    return kind !== "host" && kind !== "human";
  }
  return seat !== 0; // historical solo rule
}
function isLocalSeat(seat) { return seat === MY_SEAT; }
```

## Search list

| Pattern | Replace with |
| --- | --- |
| `turn === 0` | `turn === MY_SEAT` |
| `turn !== 0` | `turn !== MY_SEAT` |
| `state.hands[0]` | `state.hands[MY_SEAT]` |
| `state.captures[0]` | `state.captures[MY_SEAT]` |
| `points[0]` | `points[MY_SEAT]` |
| `seat.id === 0` | `seat.id === MY_SEAT` |
| `winner === 0` | `winner === MY_SEAT` |
| `leadTrick(0, …)` | `leadTrick(MY_SEAT, …)` |
| `scheduleAI()` when any non-zero seat | only when `isBotSeat(turn)` |
| `hands[0]` in the scene | `hands[localSeat]` |
| `seat === 0 ? up : down` in placement | `seat === localSeat` |
| pointer checks `hands[0]` | `hands[localSeat]` |

## Human seat vs bot seat

- Human seat: local host, local guest, or a connected remote guest. Wait for input.
- Bot seat: solo AI or a filled/disconnected seat. `scheduleAI`.
- Client browser: never schedules AI at all. It receives states.

```js
function scheduleAI(delay) {
  clearTimeout(actionTimer);
  if (!state || !isBotSeat(state.turn)) return;
  if (!["lead", "follow"].includes(state.phase)) return;
  // ... setTimeout → aiLead/aiFollow
}
```

## Public API

If external tests or tools call `LeabTui.lead()`, route it through the same network branch:

```js
lead: (ids) => isClient()
  ? sendNetAction("lead", ids, false)
  : leadTrick(MY_SEAT, ids),
```

Otherwise a guest API call mutates only the local state and desyncs.

## Scene

`placementMap` and pointer handlers must use the live seat, not seat 0:

```js
const localSeat = gameState.mySeat ?? MY_SEAT ?? 0;
const ordered = seat === localSeat ? sort(hand) : hand;
const up = seat === localSeat;
```

## Profile names

```js
function seatName(seat) {
  const profile = SEAT_PROFILES?.[seat];
  if (profile?.name) return profile.name;
  return SEAT_LABELS[seat][LANG]; // solo names
}
```

This makes scoreboard, coach, log, summary, labels and turn chip follow handles automatically.

## Round-end stats

For the host, `stats` still belongs to the host's seat:

```js
const localPoints = points[MY_SEAT];
```

Do not update lifetime stats on a guest unless you deliberately add a client-side stats path; a guest
state is partial.

## Sanity checklist

- [ ] A solo game still behaves exactly as before.
- [ ] As a guest in seat 1, clicking your hand selects your tiles.
- [ ] Your seat's fan is face-up and at the bottom.
- [ ] The turn chip says your handle on your turn.
- [ ] The round summary hero is your points.
- [ ] The host's hand is never visible in your DOM state.
