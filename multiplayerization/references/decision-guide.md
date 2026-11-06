# Decision guide: authority and transport

## Start with the product constraint

Ask these five questions before choosing a library:

1. **Who must own the truth?** One host, one server, or every peer?
2. **What happens if the host closes the tab?** End, reconnect, or migrate?
3. **How private is the state?** Public board, private hand, private draft, admin data?
4. **How many participants?** 2, 4, 8, 50, 500?
5. **What is the deployment?** Static GitHub Pages, a small VPS, a managed backend?

## Authority matrix

| Model | Best fit | Avoid when |
| --- | --- | --- |
| Host-authoritative | Turn-based games, quizzes, shared dashboard, small editor | Money, ranked play, host must be replaceable |
| Server-authoritative | Anti-cheat, payments, regulated data, large rooms | You cannot run/deploy a backend |
| CRDT / peer-equal | Collaborative text, whiteboards, offline-first notes | You need a single canonical game rule or strict privacy |
| Lockstep/deterministic | RTS, physics, replays | Nondeterminism, hidden information, cheating matters |

**Default recommendation:** host-authoritative for the first release. It reuses the existing app logic
instead of rewriting it as a distributed reducer.

## Transport matrix

| Transport | Static hosting | Latency | NAT | Server needed | Good for |
| --- | --- | --- | --- | --- | --- |
| PeerJS/WebRTC data | yes | direct | STUN; TURN for strict NAT | signalling only | 2–8 peers, games, small tools |
| WebSocket relay | needs a server | relay | no P2P NAT issue | yes | rooms, chat, moderation, reconnect |
| SSE + POST | needs a server | relay | no | yes | read-heavy dashboards, notifications |
| BroadcastChannel | same browser only | local | none | no | tests, multi-tab demos |
| Local loopback | in-page | local | none | no | protocol tests |

WebRTC data channels are reliable and ordered by default. They are not a magic backend: the signalling
broker is still a service, the host is still a peer, and TURN may be required.

## Data volume

| Shape | Recommendation |
| --- | --- |
| Small snapshot (< 20 KB) | send full projected snapshots on each revision |
| Medium state | snapshot + intents; throttle to animation frames |
| Large document | CRDT ops or patches, periodic snapshot |
| High-frequency input | send input events, not state; interpolate locally |

For a first release, full snapshots at 10–25 Hz are simpler and usually enough. Measure before
optimizing.

## Presence and seats

- **Participant** = a connection with an id, name, role and connected flag.
- **Seat/role** = a stable slot (player 1, editor, viewer). Do not renumber live seats.
- **Bot/placeholder** = host-controlled replacement that preserves the slot.
- **Spectator** = read-only participant with the public projection.

If the app's rules or UI have a fixed number of seats, keep that number. Do not add seats just because
a template or SDK supports them.

## Failure boundaries

- Host-authoritative P2P has **no availability guarantee**. Say so.
- A signalling broker sees connection metadata, not your data channel.
- STUN sees public IPs. TURN relays media and sees traffic metadata.
- A passcode is a gate, not identity. Approval is the access decision.
- A public repository means the protocol is known. Design for that.

## Decision record template

```text
Authority: host-authoritative | server | CRDT
Transport: PeerJS/WebRTC | WebSocket | BroadcastChannel
Max participants: N
Host loss: room ends | reconnect grace | migration
Private state: none | per-participant projection
Persistence: memory only | local save | server
Moderation: none | host approval | block list
Voice: none | mesh | SFU
```
