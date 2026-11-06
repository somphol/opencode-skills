# Protocol design

## The minimum

```json
{ "__mp": 1, "type": "state", "rev": 17, "payload": {} }
```

- `__mp` — protocol version, not app version.
- `type` — a small closed set; unknown types are ignored.
- `rev` — authoritative revision, monotonic on the host.
- `payload` — the only place message-specific fields live.

Add a `close` reason and a `reject` reason enum. Never send a raw exception or stack trace.

## Message set

| Direction | Type | Purpose |
| --- | --- | --- |
| guest → host | `hello` | name, optional passcode, client capability/version |
| host → guest | `welcome` | participant id, role/seat, roster, public config |
| host → guest | `pending` | request queued for approval |
| host → guest | `state` | projected snapshot at `rev` |
| host → guest | `lobby` | roster/capability change |
| host → guest | `start` | session begins |
| host → guest | `reject` | full, denied, bad-passcode, busy, timeout, in-progress |
| host → guest | `closed` | host intentionally ends the room |
| guest → host | `action` | intent, never a claimed result |
| guest → host | `chat` | text |
| guest → host | `voice-state` | opt in/out of the voice mesh |
| both | `ping`/`pong` | optional latency probe |

## Snapshot vs intent

**Snapshot** — authoritative, replaceable, projected. The host increments `rev` after each accepted
change and sends it to each participant. Clients replace state if `rev` is newer; drop stale.

**Intent** — a request that can fail. It carries a `clientActionId` for idempotency.

```json
{ "type": "action", "action": "move", "clientActionId": "c-42", "payload": { "from": 3, "to": 5 } }
```

The host:

1. resolves the sender from the connection (never trusts a claimed participant id);
2. deduplicates by `clientActionId`;
3. validates through the same code path as local input;
4. applies, increments `rev`, projects, broadcasts;
5. replies with `reject` only if the client needs an explanation.

## Projection and privacy

```js
function projectFor(state, participant) {
  const wire = serializable(state);
  wire.private = participant.privateState; // own only
  wire.others = state.others.map((p) => ({
    id: p.id,
    name: p.name,
    // stable placeholder, not a real secret
    hidden: p.privateState.map((_, i) => `hidden-${p.id}-${i}`)
  }));
  delete wire.hostOnlyMaps;
  delete wire.undoStack;
  delete wire.selection;
  return wire;
}
```

Rules:

- One payload per recipient. Never broadcast the same private object.
- A placeholder id must be **stable** across the session. Assign it when the item is created, not when
  the hand is rendered. Stable ids prevent visible reshuffles.
- Public information (scores, board, cursors, turn) can stay real.
- Hidden information must be removed, not just hidden with CSS.
- Host-only maps must be stripped by the serializer, not by the UI.
- Logs and undo history can leak hidden values; project them too.

## Serialization boundary

One function converts live objects to wire-safe data. One function hydrates. Do not scatter
`JSON.stringify` through the app.

```js
function serializable(state) {
  return {
    ...state,
    items: state.items.map((item) => ({ id: item.id, x: item.x, y: item.y })),
    selection: undefined,
    undoStack: undefined
  };
}
```

If the app already has a save format, reuse it. Add a `format` and `version`; reject unknown versions
with a readable message.

## Revision and ordering

- `rev` is a number owned by the host.
- The client ignores `rev <= current`.
- A reconnect gets a full snapshot, not a replay, unless you have a durable op log.
- Do not use timestamps for ordering; clocks differ.
- If you add optimistic UI, keep a local overlay and reconcile on the next snapshot.

## Reconnect and host epochs

Reconnect is optional. If you add it:

- Issue a random `clientToken` at first join; keep it in `sessionStorage`, not a URL.
- Reserve the slot for a grace window.
- On return, verify the token and send a fresh snapshot.
- If the host changed, the epoch changed; discard stale state.

Host migration is a separate feature:

```text
epoch 1: host A
A leaves -> snapshot broadcast to candidates -> election -> epoch 2: host B
clients drop all epoch-1 messages
```

Do not implement migration by silently letting two hosts publish. Without an election and an epoch,
you get split brain.

## Backpressure

- Throttle snapshots to the UI cadence (e.g. 40 ms) and coalesce changes.
- Cap inbound envelopes; close oversized senders.
- Cap arrays/strings before processing (names, chat, action payloads).
- Do not JSON-stringify an unbounded object just to measure it; bound the shape first.

## Versioning

- Version the envelope, the save format and the app separately.
- Add fields freely; clients ignore unknown fields.
- Remove/rename only with a protocol bump and a visible rejection path.
- Keep a compatibility note in `docs/PROTOCOL.md`.
