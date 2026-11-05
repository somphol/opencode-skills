# Audio reference

## Graph

```
synth / reverb send / stream ──→ musicBus ──┐
ambient layers ───────────────→ ambientBus ──┤
                                             ├→ lowshelf 240 Hz → highshelf 4.2 kHz
                                             │  → compressor (−20 dB, 3.5:1)
                                             │  → master → timerGain → analyser → destination
```

- Music bus is muted to 0 on pause instead of suspending the context, so ambient and the timer keep
  running.
- Timer gain is the only node the sleep timer touches.
- Analyser: FFT 256, smoothing 0.82; RMS × 4 feeds bulbs and bubbles.

## Synth

The reference ships 50 synth tracks across seven collections and 32 archive performances across four archive collections. Only one sequence plays at a time, so the
count does not affect CPU. All synth tracks are original arrangements of public-domain melodies or
original compositions (`rights: public-domain | original`). Archive slots are H-1…K-8 and must be public-domain recordings with a source URL.

```js
const now = ctx.currentTime + 0.06;
state = { index: 0, nextTime: now, startedAt: now, timer: setInterval(schedule, 35) };
```

- Schedule while `nextTime < ctx.currentTime + 0.28`.
- Each note: osc at track wave + sine octave (15% gain), envelope 8 ms attack → `track.gain`,
  decay to 35% by 120 ms, release at 92% of duration.
- Route to `musicBus` and `reverbSend`.
- Loop index modulo sequence length.
- Pause stores `pausedAt = position()`, stops the interval, mutes music bus.
- Resume finds `noteAtBeat(sequence, beat % totalBeats)`, restarts, sets
  `startedAt = ctx.currentTime - position`.
- Seek does the same at `fraction * duration`.

## Note format

`NameOctave:beats`, e.g. `G4:2 B4:1`. `NAME → midi = (octave+1)*12 + pitchClass`; frequency
`440 * 2^((midi-69)/12)`. Accept `#` and `b`. Reject beat ≤ 0.

## Ambient

- Rain: white noise, 4 s stereo buffer, highpass 900 Hz, Q 0.6; droplet sine 1200–3600 Hz every ~420 ms
  with a 90 ms exponential decay.
- Ocean: brown noise, lowpass 420 Hz, Q 0.7; a 0.085 Hz LFO (±0.28) on a **separate swell gain**, so
  layer gain 0 is silent.
- Crickets: pink noise, bandpass 4200 Hz, Q 2.4; 2–4 chirps of 4.2–4.5 kHz every ~640 ms.
- Each layer gain target `(value/100) * 0.55`; the mix knob drives `ambientBus` from
  `0.08 + mix*0.72`.
- `startAmbient(name)` starts the loop once; `stopAmbient` ramps gain to 0 but keeps the source.

## Streams

```js
const audio = new Audio();
audio.crossOrigin = 'anonymous';
audio.preload = 'auto';
const source = ctx.createMediaElementSource(audio);
source.connect(graph.musicBus);
audio.src = track.url;
audio.play().catch(...);
```

One element is reused. The `ended` hook advances to the next record; the `error` hook sets status
`error`, shows a toast and leaves synth tracks available. Do not silently swap to a different track.

CORS check:

```sh
curl -sI 'https://upload.wikimedia.org/...mp3' | grep -i 'access-control-allow-origin'
# access-control-allow-origin: *
```

## Timer

```js
setTimer(minutes) {
  this.timer.active = minutes > 0;
  this.timer.endsAt = Date.now() + minutes * 60000;
  this._timerInterval = setInterval(() => this.tickTimer(), 250);
}
tickTimer() {
  const remaining = Math.max(0, (this.timer.endsAt - Date.now()) / 1000);
  this.timer.fade = fadeGain(remaining);
  this.graph.timerGain.gain.setTargetAtTime(this.timer.fade, this.ctx.currentTime, 0.12);
  if (remaining <= 0) this.finish();   // stop sources, dim lights, clear preference
}
```

`smoothstep`: 1 above 120 s, 0.5 at 60 s, 0 at 0 s, monotonic. `debugSetRemaining()` changes the
deadline for tests.

## UI sounds

`MechanicalSounds` has its own `AudioContext` and volume 0.16. `clack` = band-passed noise + a 190→80 Hz
square blip; `coin` = three sine pings (1568/2093/2637 Hz); `thunk` = low filtered noise. Guard
`navigator.vibrate` with `navigator.userActivation?.isActive !== false`; otherwise Chrome logs a
console error in headless tests.

## Mixing

Voice gain 0.46–0.50, compressor threshold −20 dB, master default 82. Ambient sits below music.
If it is too quiet, raise master first, then voice gain; do not remove the compressor.
