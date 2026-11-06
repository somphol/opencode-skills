# Protocol and authority

Every message is JSON with `__leab: 1` and `type`. PeerJS uses its JSON serialisation; the channel is
reliable and ordered. Unknown types are ignored.

## Envelopes

### host → guest

| Type | Fields | When |
| --- | --- | --- |
| `welcome` | `roomCode, protocol, seat, hostName, players, canStart` | after a valid hello |
| `lobby` | `roomCode, hostName, players, canStart, started` | roster change |
| `start` | `roomCode, seat, players, hostName` | immediately before the first state |
| `state` | `roomCode, seq, seat, players, hostName, state` | every host action (throttled) |
| `rejected` | `reason: full \| in-progress \| illegal` | refused join/action |
| `closed` | `reason: host-left` | intentional host leave |
| `pong` | `at` | ping response |

### guest → host

| Type | Fields | When |
| --- | --- | --- |
| `hello` | `name, protocol` | data channel opens |
| `action` | `kind: lead \| follow, tiles: string[], reveal: boolean` | the guest's turn |
| `ping` | — | optional probe |
| `leave` | — | graceful close |

## Roster entry

```json
{ "seat": 1, "name": "Bea", "kind": "human", "connected": true, "bot": false }
```

`kind` is `host`, `human` or `bot`. `connected` is informational; `kind` drives the engine. Empty
seats become `bot` before the match starts.

## Redaction table

| Payload field | Own seat | Every other seat |
| --- | --- | --- |
| `hands[s]` | real IDs | `ghost-<s>-<i>` |
| `center` unrevealed | real IDs + combo | ghost IDs, `combo: null` |
| `center` revealed | real | real |
| `captures` | real | real (public) |
| `log` hidden | real combo | `combo: null` |
| `lastTrick` hidden entry | real combo | `combo: null` |
| `lastTrick.human*` | recomputed | recomputed |
| `hiddenTags` | stripped | stripped |
| `snapshot` | stripped | stripped |
| `selected` | cleared | cleared |
| `fast` | stripped | stripped |

`sanitizeForSeat` is the only function allowed to do this. `serializableState` runs first so the
result is already ID-based.

## Client hydration

```js
function hydrateRemoteState(raw) {
  const game = { ...raw };
  game.hands = raw.hands.map(h => h.map(id => TILE_BY_ID[id] || makeGhostTile(id)));
  game.captures = raw.captures.map(p => p.map(id => TILE_BY_ID[id] || makeGhostTile(id)));
  game.center = raw.center.map(e => ({
    ...e,
    tiles: e.tiles.map(id => TILE_BY_ID[id] || makeGhostTile(id)),
    combo: e.combo || null
  }));
  game.selected = [];
  game.snapshot = null;
  game.fast = false;
  return game;
}
```

`makeGhostTile` returns `{ id, hidden: true, rank:"soldier", power:1, color:"b", hanzi:"?" }`. Do not
run `detectCombo` on ghosts; only the guest's real hand is ever selected.

## Authority invariants

- Only the host writes `hands`, `captures`, `center`, `scores` and `phase`.
- Guests never call `dealRound`, `leadTrick`, `submitPlay`, `resolveTrick`, `endRound` or `scheduleAI`.
- `publishState` returns unless `net.started` is true.
- Host actions are throttled (~40 ms) and one payload is built per guest.
- `saveMatch` is a no-op on a guest.
- A disconnected seat becomes a bot; the seat index never changes mid-match.
- `beginMatch` resets the engine but not the roster.
- Version is 1. Add fields freely; bump for removals.

## Redaction of `lastTrick`

Do not send the host's `lastTrick.humanCombo` to everyone. Rebuild it:

```js
const entries = raw.lastTrick.entries.map(e =>
  e.revealed || e.seat === seat ? e : { ...e, combo: null }
);
const local = entries.find(e => e.seat === seat);
raw.lastTrick = {
  ...raw.lastTrick,
  entries,
  humanSeat: seat,
  humanWon: raw.lastTrick.winner === seat,
  humanRevealed: Boolean(local?.revealed),
  humanCombo: local?.combo || null,
  humanTiles: []
};
```

## Security honesty

Redaction protects the wire. The host still knows every hand. A guest can inspect its own client. There
is no authentication, collusion detection or replay protection. Document this in the README and in the
lobby privacy note. Do not call it anti-cheat.
