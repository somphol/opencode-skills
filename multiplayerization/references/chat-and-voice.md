# Chat and voice

## Text chat

### Path

```text
guest -> host: { type:"chat", text }
host:
  resolve sender from connection (never trust a claimed id)
  rate-limit (350 ms)
  normalise/cap (200 chars)
  append one entry { id, participant, name, text, at }
  send { type:"chat", entry } to every guest (including sender)
```

Host messages use the same append + broadcast path. Include the last 20–30 entries in `welcome`.

### UI

- Collapsible panel; glassmorphism is optional, not a requirement.
- On phones, keep it below or beside the primary surface, never over the hand/canvas.
- Show name, time and text; own messages may be tinted.
- `aria-live="polite"` on the message list.
- No HTML, link previews or file uploads.

### Safety

- Escape text; no `innerHTML`.
- Cap name and text.
- Rate-limit per sender.
- Keep history in memory; clear on room close.
- Do not claim moderation if there is none.

## Voice

Voice is a **separate media path**, not a data-channel message.

### Mesh for small rooms

For N active speakers, a full mesh has N×(N−1)/2 media paths. Good for 2–4, acceptable for 5–6,
expensive beyond that.

```text
A <-> B
A <-> C
B <-> C
```

### Join flow

1. User clicks **Join voice** (a gesture, so `getUserMedia` and autoplay are allowed).
2. Request `getUserMedia({ audio: { echoCancellation, noiseSuppression, autoGainControl } })`.
3. Exchange presence via the data channel (`voice-state`) and the roster (`peerId`, `voice`).
4. Both sides agree who initiates. A simple rule: the lexicographically larger peer id calls the
   smaller. This avoids duplicate calls.
5. Attach incoming streams to hidden `<audio autoplay playsinline>` elements.

### Allowlist

Accept a media call only if the caller's peer id is already in the **approved roster**. The host peer
id may be deterministic from the room code, so an unknown caller can otherwise make the host allocate
media resources.

### Mute and deafen

```js
// Mic mute: stop sending, keep the call
localStream.getAudioTracks()[0].enabled = !muted;

// Deafen: silence incoming playback, keep your mic unchanged
for (const audio of document.querySelectorAll('audio.remote-player-audio')) {
  audio.muted = deafened;
}
```

Keep them independent. Do not stop tracks to mute; the call drops. Do not change the local track when
deafening.

### Speaking indicator

- One `AudioContext` analyser per local/remote stream.
- Poll RMS every ~120 ms.
- Do not connect the analyser to `destination`; playback is the `<audio>` element.
- Add a `.speaking` class to the participant card/row; keep a text status line too.
- Clear the indicator on mute, leave and disconnect.

### Failure handling

- Permission denied: chat and the app continue; show a clear status.
- No `getUserMedia`: hide/disable Join voice with an explanation.
- One call fails: remove its audio/analyser; allow rejoin.
- Host leaves/guest leaves: stop all tracks and close calls.
- NAT: public STUN often works; symmetric NAT needs TURN.
- Autoplay: joining voice is a gesture; still handle `audio.play()` rejection.

### Privacy

- Voice is DTLS-SRTP encrypted in transit.
- The signalling broker sees connection metadata, not the media.
- Do not record, transcribe or upload media unless explicitly designed and disclosed.
- The host does **not** carry voice in a host-authoritative mesh; it only relays presence/peer ids.
- Say clearly that no recording or moderation exists.

## Chat/voice checklist

- [ ] Chat escaped, capped, rate-limited, memory-only.
- [ ] History sent on welcome.
- [ ] Voice opt-in on a gesture; permission failure is non-fatal.
- [ ] Media calls allowlisted to approved roster.
- [ ] Remote audio elements hidden but playing.
- [ ] Mic mute = `track.enabled`; deafen = `<audio>.muted`.
- [ ] Speaking pulse from analyser, not destination.
- [ ] Leave room stops tracks/calls.
- [ ] TURN/privacy limits documented.
