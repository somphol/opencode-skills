# Protocol scaffold

Envelope: `{ "__leab": 1, "type": "...", ... }`.

## host → guest

| type | fields |
| --- | --- |
| `welcome` | `roomCode, protocol, seat, hostName, players, canStart` |
| `lobby` | `roomCode, hostName, players, canStart, started` |
| `start` | `roomCode, seat, players, hostName` |
| `state` | `roomCode, seq, seat, players, hostName, state` |
| `rejected` | `reason` |
| `closed` | `reason` |
| `pong` | `at` |

## guest → host

| type | fields |
| --- | --- |
| `hello` | `name, protocol` |
| `action` | `kind, tiles, reveal` |
| `ping` | — |
| `leave` | — |

## Redaction

| field | own | other |
| --- | --- | --- |
| hands | real | `ghost-<seat>-<i>` |
| unrevealed centre | real + combo | ghost, `combo: null` |
| revealed centre | real | real |
| captures | real | real |
| hidden log/lastTrick | real combo | `combo: null` |
| hiddenTags/snapshot/selected/fast | stripped | stripped |

## Invariants

1. Host is the only writer of game state.
2. Guests send intent; host re-validates.
3. One payload per guest.
4. `publishState` only after `net.started`.
5. Stable ghost tags for a round.
6. Version bump on removals.
