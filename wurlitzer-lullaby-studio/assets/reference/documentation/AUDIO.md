# Audio

## Two engines, one master chain

The jukebox can play two kinds of record:

1. **Synth (A-1…B-4).** A Web Audio step sequencer turns a note array into a music-box performance.
   Zero bandwidth, instant, loops forever.
2. **Archive (H-1…K-8).** A validated JSON manifest points at CORS-enabled MP3s. A single reusable
   `<audio>` element is routed through `MediaElementAudioSourceNode` into the same master chain, so
   EQ, volume and the sleep timer apply equally.

Both share `musicBus → bass shelf → treble shelf → compressor → master → timerGain → analyser`. The
ambient generators join at `ambientBus` before the EQ.

## The synth sequencer

- **Look-ahead:** every 35 ms, schedule any note whose start is within the next 0.28 s. This survives
  main-thread jank without drifting.
- **Voice:** one oscillator at `track.wave` + a sine an octave above at 15% gain for sparkle.
- **Envelope:** 8 ms attack to `track.gain`, decay to 35% by 120 ms, exponential release at 92% of the
  note's duration. This is what makes a sustained triangle sound plucked and box-like.
- **Routing:** each voice goes to `musicBus` and to a convolution send. The reverb impulse is generated
  at runtime (2.9 s, exponential decay 2.6) so there is no IR file.
- **Loop:** when the note index wraps, scheduling continues seamlessly; the displayed duration is one
  pass of the array, so the progress bar restarts at the loop point.
- **Pause/resume:** pause stores the current position in seconds, stops the scheduler and mutes the
  music bus. Resume finds the note index at that beat, restarts scheduling and offsets `startedAt` so
  the progress bar continues where it stopped.

### Note format

```
G4:2 G4:1 B4:3 ...
```

`NameOctave:beats`; names accept `#` and `b` (`C#4`, `Bb3`). `noteToMidi` uses
`(octave + 1) * 12 + pitchClass`, so `C4 = 60`, `A4 = 69`, and `midiToFreq` is the standard
`440 * 2^((m-69)/12)`.

### The first page and the full catalogue

| Slot | Melody | Tempo | Duration |
| --- | --- | --- | --- |
| A-1 | Brahms' *Wiegenlied* | 66 | 1:27 |
| A-2 | *Twinkle, Twinkle, Little Star* | 72 | 0:40 |
| A-3 | *Schlafe, mein Prinzchen* (attr. Flies/Mozart) | 64 | 1:05 |
| A-4 | Schubert's *Wiegenlied* | 60 | 0:54 |
| A-5 | *Rock-a-bye Baby* | 58 | 0:50 |
| A-6 | *Hush, Little Baby* | 68 | 0:39 |
| A-7 | *Frère Jacques* (sleep variant) | 54 | 1:11 |
| A-8 | *Golden Slumbers* | 62 | 0:50 |

These are simplified, mood-first settings of public-domain melodies, not transcriptions. Change tempo
and the duration recalculates at load. The full fifty-track catalogue is in [TRACKS](TRACKS.md). The A page is shown here:
a further 42 arrangements cover Music Box, Classical, Folk & World, original Dreams and Bonus pages.
Every synth track is either a public-domain melody or an original composition; every archive track is
public domain. The first-listen queue is archive-only and auto-advances.

## Ambient generators

All three are synthesized; no loop files are shipped.

- **Rain** — stereo white-noise buffer → 900 Hz highpass → gain. A random droplet pinger (`sine`
  1200–3600 Hz, 90 ms exponential decay) fires every ~420 ms while the layer is above zero.
- **Ocean** — brown-noise buffer → 420 Hz lowpass → layer gain → a separate swell gain modulated by a
  0.085 Hz LFO (±0.28). The swell stage exists so a zero layer gain is silent instead of leaking the
  LFO offset.
- **Crickets** — pink-noise bed → 4200 Hz bandpass (Q 2.4) → gain, plus 2–4 short 4.2–4.5 kHz chirps
  every ~640 ms.

Each layer has a persisted 0–100 volume and a toggle. The Mix knob drives `ambientBus` from
`0.08 + mix * 0.72`, so the beds never fully disappear unless mix is 0.

## Streams and CORS

Web Audio mutes a cross-origin media element unless the response allows CORS. The manifest therefore
uses Wikimedia `upload.wikimedia.org` transcode URLs, which return `Access-Control-Allow-Origin: *`.
The element sets `crossOrigin = 'anonymous'` **before** `src`. If playback fails, the app sets
`audio.status = 'error'`, shows “Archive stream unavailable — try a synth lullaby” and keeps the UI
usable. It does not silently swap tracks.

## Autoplay policy

No `AudioContext` is created until a click/keypress. `ensure()` creates and resumes it, builds the
graph and starts ambient buffers. In a headless test where evaluate-driven clicks are not user
activation, the context can remain `suspended`; status and visual state still change, and a real user
gesture resumes it.

## Sleep timer

`setTimer(minutes)` stores an absolute `Date.now()` deadline and starts a 250 ms interval.
`fadeGain(remaining)` is smoothstep over the final 120 s:

```
remaining >= 120 → 1
remaining <= 0   → 0
otherwise        → x*x*(3-2x), x = remaining/120
```

The value drives `timerGain`; at zero the app stops all sources, sets `dim = 1` (lights down), clears
the timer preference and shows “Sweet dreams.” Choosing Off at any point restores `timerGain` to 1 and
the lights to full. `debugSetRemaining(seconds)` moves the deadline for tests without waiting.

## Mixing advice

The synth voices peak around 0.46–0.50 gain each; the compressor (threshold −20 dB, ratio 3.5) keeps
overlapping notes soft. For a louder master, raise `master` first, then the voice gain, and check the
bulb energy does not clip the analyser. Ambient beds sit at 55% of their slider inside the bus, which
is intentionally below the music.
