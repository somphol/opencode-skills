# Transport

## Room codes

```js
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PREFIX = "LEAB-";
const LENGTH = 6;
const PEER_PREFIX = "leabtui-v1-";

makeRoomCode(rand)        // six chars
normalizeRoomCode(input)  // URL, LEAB prefix, spaces, dashes → six chars or null
formatRoomCode(code)      // LEAB-ABC-234
peerIdForCode(code)       // leabtui-v1-abc234
inviteUrl(code)           // current URL + ?room=ABC234
```

Why this alphabet: it is read aloud and typed on phones. `0/O` and `1/I` are removed. Case is
insensitive; the peer id is lowercase.

## Lazy PeerJS

Do not add a second global `<script>` that every solo player downloads. Inject it when a room opens:

```js
export const PEERJS_VERSION = "1.5.4";
export const PEERJS_CDN = `https://cdn.jsdelivr.net/npm/peerjs@${PEERJS_VERSION}/dist/peerjs.min.js`;

export function loadPeerJS(timeout = 15000) {
  if (window.Peer) return Promise.resolve(window.Peer);
  // create script, await load/error, timeout, cache the promise
}
```

The CSP must allow `cdn.jsdelivr.net` in `script-src` and the broker in `connect-src`.

## Host endpoint

```js
const host = new Peer(peerIdForCode(code), {
  host: "0.peerjs.com", port: 443, secure: true, path: "/",
  debug: 1,
  config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }], iceCandidatePoolSize: 4 }
});
host.on("connection", conn => {
  conn.on("open", () => onConnection({ connId: conn.peer, connection: conn }));
  conn.on("data", data => {
    if (data?.__leab === PROTOCOL_VERSION) onMessage({ connId: conn.peer, message: data });
  });
  conn.on("close", () => onClose({ connId: conn.peer }));
});
```

Keep a `Map<connId, DataConnection>` for `send`/`broadcast`. The game layer maps `connId → seat` in
`SEAT_PROFILES`.

## Guest endpoint

```js
const peer = new Peer(); // broker assigns a random id
peer.on("open", () => {
  const conn = peer.connect(hostPeerId, {
    reliable: true,
    serialization: "json",
    metadata: { name, protocol: PROTOCOL_VERSION }
  });
  conn.on("open", () => send({ type: "hello", name, protocol: PROTOCOL_VERSION }));
  conn.on("data", data => onMessage({ message: data }));
  conn.on("close", onClose);
});
```

The host must already be open. `peer-unavailable` means wrong code, closed tab or a different broker.

## Code collision retry

Two tables can pick the same six characters eventually. On `error.type === "unavailable-id"`,
destroy the peer and try another code. Bound it (4 attempts) and surface the last error.

```js
export async function openHostWithRetry(options, attempts = 4) {
  for (let i = 0; i < attempts; i += 1) {
    const host = new PeerHost({ code: makeRoomCode(), ...options });
    try { await host.open(); return host; }
    catch (error) { host.close(); if (error.type !== "unavailable-id") throw error; }
  }
  throw new Error("Could not allocate a room code");
}
```

## Timeouts

- Peer open: 15–18 s.
- Guest connect: ~22 s.
- Guest `hello` → `welcome`: show "Connected, waiting for host" and keep the lobby open.
- Data-channel close: immediate disconnect handling.

## Loopback for unit tests

Mirror the send/receive surface without WebRTC:

```js
const pair = createLoopbackPair();
pair.b.onMessage(({ message }) => { received = message; });
pair.a.send({ type: "ping", at: 1 });
pair.flush(); // synchronous delivery
```

Use it for envelope shape, room-code and redaction checks. It cannot test ICE, NAT, the broker or a real
disconnect; use two pages for that.

## NAT reality

Public STUN handles most home routers. Symmetric NAT, some corporate Wi-Fi and some mobile carriers
need TURN. If you do not configure TURN, say so in the README and the lobby error copy. A failed ICE
connection can take 10–30 s to surface; do not promise instant errors.

## CSP

```text
script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
connect-src 'self' https://cdn.jsdelivr.net https://0.peerjs.com wss://0.peerjs.com;
```

`'unsafe-inline'` is only for the inline import map. Remove it if you move the map external. Never add
remote fonts or analytics just because PeerJS is already remote.
