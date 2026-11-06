# Multiplayer scaffold — operations

## Roles

| Role | Runs engine | Sees all hands | Sends |
| --- | --- | --- | --- |
| Host (seat 0) | yes | yes | lobby, start, state, closed |
| Guest (seat 1–3) | no | own only | hello, action, leave |
| Bot | host-side | host-side | — |

## Lobby

1. Solo / Host / Join.
2. Host generates `LEAB-XXX-XXX`; guest enters code + handle.
3. Start needs two connected humans.
4. Empty seats become `Bot n`.

## Seats

- Four seats because the game's equipment says so.
- Host is always 0; guests in join order.
- A disconnected seat is never deleted or reseated; it becomes a bot.

## Privacy

- Other hands and unrevealed plays are ghost ids.
- Captures are public.
- Host knows all; guests can inspect their own client.
- No authentication or anti-cheat.

## Network

- PeerJS public broker for signalling; STUN for NAT; no TURN.
- Host must keep the tab open.
- Room reload is not resumable.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| Room not found | recheck code; host tab open |
| Connecting… forever | broker blocked/CSP |
| Start disabled | need a second human |
| Guest blank table | Three.js CDN blocked |
| Guest cannot play | not their turn / wrong count |
| Disconnect not detected | wait for ICE timeout; close the tab |

## Test

`node scripts/net-check.mjs` — two browsers, real broker, 12 checks.
