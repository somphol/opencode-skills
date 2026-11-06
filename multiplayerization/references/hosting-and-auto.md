# Hosting management and automation

## Host lifecycle

```text
idle
  -> createRoom()
       allocate code (retry on collision)
       open transport
       create host profile
       generate/set optional passcode
       render lobby + code + roster
  -> requestJoin() (guest hello)
       verify passcode digest
       enqueue pending OR auto-accept (trusted mode)
  -> approve(participant) / deny()
       assign stable role/seat
       send welcome + roster
  -> startSession()
       require minimum humans
       fill empty seats with bots/placeholders
       send start + first state
  -> onGuestLeave()
       keep slot and state
       convert to bot/placeholder OR mark offline
  -> closeRoom()
       send closed to everyone
       stop voice/tracks
       close transport
       clear passcode digest and pending timers
```

Keep the room lifecycle in one module. Do not let UI buttons call transport methods directly.

## Room codes

- Use an unambiguous alphabet: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no `0 O 1 I`).
- Six characters is a good default: 32⁶ ≈ 1.07 billion.
- Normalize input: uppercase, strip spaces/dashes/prefix, accept a full invite URL.
- Derive a transport id deterministically (e.g. `app-v1-<lowercase-code>`).
- On `unavailable-id`, generate a new code and retry a bounded number of times.
- A code is an identifier, not a secret.

## Auto modes

“Auto” should be explicit and safe. Never silently disable approval or expose a passcode.

| Auto feature | Default | How |
| --- | --- | --- |
| Auto room code | on for Host | generate on click; no user input |
| Auto retry code collision | on | 3–5 attempts on `unavailable-id` |
| Auto passcode | optional | **Generate** button; off by default |
| Auto approve requests | **off** | only for trusted LAN/workshop; explicit toggle with warning |
| Auto start | **off** | explicit “start when N humans” option; never start with one |
| Auto fill empty seats | on at start | bots/placeholders for the fixed seat count |
| Auto convert disconnect | on | keep slot, convert to bot/placeholder |
| Auto expire pending | on | 60–120 s, reject and close |
| Auto reconnect | optional | token + grace window; not the same as host migration |
| Auto copy invite | **off** | explicit Copy button; do not touch the clipboard unprompted |
| Auto copy room info | **off** | includes passcode; must be explicit |

### Test-only automation

For CI, allow URL parameters or a test API rather than changing defaults:

```text
?host=1&approval=0&passcode=Test-Pass-15x
?room=ABC234&name=Guest&passcode=...
```

Gate these behind the test harness, not a normal user path. A public `?approval=0` is a security
downgrade.

## Approval queue

```js
const pending = new Map(); // connectionId -> {connectionId, name, at}

function requestJoin(connId, hello) {
  if (started) return reject(connId, "in-progress");
  if (humans >= MAX) return reject(connId, "full");
  if (pending.size >= MAX_PENDING) return reject(connId, "busy");
  if (lockedUntil > Date.now()) return reject(connId, "busy");
  if (passHash && !verify(hello.passcode, passHash)) {
    failures += 1;
    if (failures >= 8) lockedUntil = Date.now() + 60_000;
    return reject(connId, "bad-passcode");
  }
  if (requireApproval) {
    pending.set(connId, { connId, name: clean(hello.name), at: Date.now() });
    send(connId, { type: "pending" });
    scheduleExpiry(connId, 120_000);
    renderPending();
    return;
  }
  accept(connId, hello.name);
}
```

Rules:

- Never seat on `hello`.
- Never send a snapshot to a pending connection.
- Close the connection after reject/deny/expiry.
- Show name + request time; names are not identity.
- Approve one-by-one; offer **Approve all** only as a deliberate convenience.

## Passcode generator

### Policy

- 15–64 characters.
- At least one lower-case, one upper-case, one digit and one symbol.
- No whitespace.
- Reject a curated common-password list, repeated characters, obvious sequences, the room code and
  the host name.
- Hash with SHA-256; keep only the digest in memory.
- Never put the passcode in the invite URL, roster, state, export or localStorage.

### Generation

```js
const LOWER = "abcdefghjkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@$%*+";
const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

function randomInt(max) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % max;
}

export function generatePasscode() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const chars = Array.from({ length: 20 }, () => ALL[randomInt(ALL.length)]);
    chars[0] = UPPER[randomInt(UPPER.length)];
    chars[1] = LOWER[randomInt(LOWER.length)];
    chars[2] = DIGITS[randomInt(DIGITS.length)];
    chars[3] = SYMBOLS[randomInt(SYMBOLS.length)];
    // Fisher-Yates shuffle
    const groups = [];
    for (let i = 0; i < chars.length; i += 5) groups.push(chars.slice(i, i + 5).join(""));
    const pass = groups.join("-");
    if (validatePasscode(pass).ok) return pass;
  }
  throw new Error("Could not generate passcode");
}
```

### Hashing and display

```js
async function digest(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
```

- Show the generated passcode **once** in the host panel.
- Keep it in a UI-only variable, not in the room state.
- Offer **Copy passcode** and **Copy room info** (code + passcode + link) with a warning.
- **Copy invite link** must exclude the passcode.
- Clear the plain value on leave/regenerate.
- Lock after 8 wrong attempts for 60 s; rate-limit connections too.

## Start and seat filling

- Require a minimum number of humans (2 is common).
- Keep connected humans in their slots.
- Fill every empty slot with a bot/placeholder **before** the first state.
- Send `start`, then the first snapshot.
- Late joins: reject `in-progress` unless you explicitly support spectators.
- Rematch: keep the room, reset the session, reuse slots, publish a new snapshot.

## Disconnect and host loss

- Disconnect keeps the slot, state and score; mark offline or convert to bot.
- If the disconnected participant owned the turn, schedule the bot/placeholder.
- Host loss ends the room unless you implement migration with an epoch.
- On host close, send `closed` before destroying the transport.
- On guest close, remove pending requests and close media calls.
- On rejection, set a client flag so the subsequent transport close is not shown as “host left”.

## Hosting UI

Minimum:

- mode overlay: Solo / Host / Join (+ Resume local)
- name field
- room code + Copy invite
- optional passcode + Generate / Save + reveal once
- approval toggle
- pending list with Approve / Deny
- roster with roles and connection state
- Start (disabled until minimum humans)
- Leave room with confirmation
- status line that tells the truth about loading, waiting, denied and closed

On phones, keep the primary canvas/interaction visible; put hosting controls in a collapsible panel or
below the main surface.

## Hosting checklist

- [ ] Code collision retry works.
- [ ] Passcode policy, generation, hashing and one-time reveal work.
- [ ] No passcode in URL/state/export/localStorage.
- [ ] Approval defaults on; pending expires; reject closes.
- [ ] Start refuses with one human.
- [ ] Empty seats fill and stay stable.
- [ ] Disconnect keeps the slot.
- [ ] Host close notifies guests.
- [ ] Caps/rate limits enforced.
- [ ] Leave room confirms and cleans up.
