# Testing multiplayer

## Layers

| Layer | Runs offline | What it proves |
| --- | --- | --- |
| Solos | yes | the original app still works |
| Pure protocol | yes | serialization, projection, codes, passcodes, caps |
| Static guard | yes | files, versions, docs, secrets, CSP |
| Loopback/BroadcastChannel | yes | message flow without NAT |
| Two real clients | network | WebRTC/WebSocket handshake, approval, state |
| Media | network + fake device | voice mesh, mute, deafen |
| Manual | browser + phone | permission prompts, audio, touch layout |

Do not let a loopback test stand in for a real transport test.

## Pure tests

- Serialization: live object → wire → live object round-trip.
- Projection: own private data exists; other private data does not; placeholders are stable.
- Protocol: envelope version, unknown type ignored, revision monotonic.
- Room code: alphabet, normalization, formatted length.
- Passcode: policy, generator classes, deny-list, hash.
- Caps: oversized envelope, too many tiles, chat length/rate.
- Reconnect token/epoch if implemented.

## Static guard

`scripts/check.mjs`-style:

- required files and local links;
- app version matches README/CHANGELOG/state;
- CSP allows only expected origins;
- no secrets/tokens/private keys;
- the projection function exists; the transport module has caps;
- the passcode module hashes and never stores plaintext;
- i18n dictionaries have equal keys;
- the self-test count is honest.

## Two-client harness

Use Chrome DevTools Protocol (Node's built-in `WebSocket`/`fetch`), no npm dependencies.

```text
1. launch Chrome headless with a temp profile and a random debugging port
2. host page: /?host=1&name=Host
3. read room code from window.__mp
4. guest page: /json/new?<encoded /?room=CODE&name=Guest&passcode=...>
5. assert host pending queue; approve; wait for guest welcome
6. assert guest private state vs public state
7. send one action from each side; assert revision/state on the other
8. send chat; assert both lists
9. join voice with synthetic stream; assert remote audio
10. mute/deafen; assert track.enabled / audio.muted
11. close guest page (Page.close, not just the socket); assert host slot converts
12. fail on any console exception on either page
```

### Details that matter

- **Encode the whole URL** for `/json/new`; otherwise `&name=` is swallowed.
- **Close the page** with `Page.close`; closing only the CDP socket leaves it alive.
- Wait for conditions, not arbitrary sleeps.
- Do not assert a fixed leader/owner when the app randomly assigns one.
- Read private state from the guest's own JS, not from a rendered label.
- The host page may legitimately show public state only.
- Keep network tests out of offline CI; run them before release.

## Fake media

Headless Chrome may hang on `getUserMedia`. For the mesh test, inject a synthetic stream:

```js
const ctx = new AudioContext();
const osc = ctx.createOscillator();
const gain = ctx.createGain();
const dest = ctx.createMediaStreamDestination();
gain.gain.value = 0; // silent: do not beep the developer
osc.connect(gain);
gain.connect(dest);
osc.start();
window.__fakeVoice = dest.stream;
```

Then attach it through the same media path. This proves calls, remote `<audio>`, mute and deafen
without a microphone. Test the real permission path manually in Chrome/Safari/Firefox.

> A non-zero gain in this test plays a continuous tone through remote audio. Use zero gain.

## Failure injection

- Wrong passcode.
- Denied approval.
- Pending timeout.
- Full room.
- Join after start.
- Malformed envelope, oversized envelope.
- Message flood (expect close).
- Guest close mid-turn (expect bot/placeholder).
- Host close (expect closed panel, no fake resume).
- Voice call from an unknown peer id (expect close).

## Load

- 2, 4, 8 clients where supported.
- Snapshot size × recipients × frequency.
- Slow client: does the host queue unbounded messages? Coalesce.
- Long room: history caps, pending timers, audio elements cleaned.

## Mobile

- 390×844: lobby, pending, passcode, chat, voice controls.
- Primary canvas/interaction not covered.
- Touch targets >= ~40 px where possible.
- Soft keyboard does not hide the join button.

## Manual checklist

- [ ] Host/join/approve/deny.
- [ ] Generated passcode and wrong passcode.
- [ ] Copy invite vs Copy room info.
- [ ] Two clients see the same public state.
- [ ] Private state differs correctly.
- [ ] Disconnect keeps slot.
- [ ] Host close is clear.
- [ ] Chat arrives both ways; XSS text renders literally.
- [ ] Voice permission, remote audio, mic mute, deafen.
- [ ] No console errors.
