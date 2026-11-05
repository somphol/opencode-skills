# Build log

What was built, in what order, and what regressed. This is the expensive knowledge.

## Order that worked

1. **Engine first.** Note maths, sequence parsing, smoothstep timer, slots, settings, manifest
   validation, export payload. Ten Node checks green before any pixels.
2. **Audio second.** Lazy context, graph, synth scheduler, streams, ambient, timer. Manual check of
   play/pause, C track, every knob, `debugSetRemaining(60)`.
3. **Cabinet third.** Build the silhouette and the record deck, screenshot immediately, tune exposure
   and bloom, then add bubbles, rack, keypad, coin, sign, bulbs.
4. **App shell fourth.** DOM rack, knobs, transport, language, persistence, coin/free-play, timer,
   favourites, export, mobile sheets.
5. **Tests fifth.** The browser suite exposes state-machine bugs that manual clicking misses.
6. **Docs and screenshots.** Then state, release, skill.

## Dead ends and fixes

**Blown-out cabinet.** First render used exposure 1.08, bloom 0.62, spot 110, top 38, points 34/28,
chrome envMapIntensity 1.3. The walnut, paper and bubbles were pure white. Fix: exposure 0.82, bloom
0.30/0.90, spot 26, top 10, points 9/7, chrome 0.82. This is the single most important visual lesson.

**Glowing paper strips.** Lit `MeshStandardMaterial` paper became a light panel. Fix: unlit
`MeshBasicMaterial` with `color: 0xd8ccb8`. Text became readable instantly.

**Ocean audible at zero.** The surf LFO was summed into the layer gain, so a zero layer still leaked
±0.5. Fix: a separate swell gain after the layer gain; LFO modulates only the swell. Zero layer is
zero.

**Timer picked the wrong node.** Fading `masterGain` also faded ambient and fought the volume knob.
Fix: a dedicated `timerGain` after master. Smoothstep at 60 s = 0.5, tested.

**`JSON.stringify(promise)` false pass.** The self-test returned a Promise; the browser test parsed
`{}` and read `undefined`. Fix: evaluate `runSelfTest().then(r => JSON.stringify(r))`.

**Duplicate/undefined browser assertion.** A test referenced `#credits` (which does not exist) and
asserted `null === ''`. Fix: use `#credit-count` or remove. The lesson: browser tests should assert
values read from the app, not remembered ids.

**Seek test changed the current record.** The language test expected Mozart after a seek test selected
Schubert. Fix: derive the expected Thai title from `current.title.th`, never hardcode the previous
step's state.

**Vibrate console error.** `navigator.vibrate` without user activation logs a Chrome error, failing
the zero-console-error gate. Fix: early-return when `navigator.userActivation?.isActive === false`.

**3D rack density.** Sixteen strips at cabinet scale were unreadable. Fix: 3D shows the eight A/B
records; the DOM rack is the complete 16-slot surface. This is deliberate, not a bug.

**Mobile tab overlap.** Floating tabs covered the last hint row. Fix: 58 px bottom padding on mobile
panels.

**OG card overlap.** The URL was absolutely positioned inside the copy block, so it sat behind the
bullets, and the cabinet overlapped the headline. Fix: URL as a direct child of the card; image
container starts at 22% width; smaller headline; zoom the OG camera to 8.4.

## What to do differently

- Screenshot after the first complete cabinet, before adding detail. Exposure problems compound.
- Write the smoothstep timer and its test before the UI dial.
- Build the browser suite while the state machine is small; retrofitting tests after 20 interactions
  is slower.
- Use one reusable stream element and one graph; do not create an element per track.
- Keep the 3D rack curated. Texture legibility beats slot parity.
- Do not put a Promise through `JSON.stringify`.
- Inspect generated screenshots, not just test results. A green suite can ship a white cabinet.

## Token and time tactics

- Write the large source file in three or four appended chunks with a syntax check after each; a
  single huge generation can be interrupted and lose work.
- Reuse the existing harness and fixtures pattern from a prior static Three.js release; it is
  dependency-free and already keychain-safe.
- Keep docs as a checklist, then write them in batches; do not regenerate the whole set for one line.
- Capture the session token counters once at the end, after the live suite and skill publication, so
  the state file matches the real session rather than a mid-build snapshot.
- Use `grep`/`sed` on the source for repeated refactors, but apply visual changes with a screenshot
  check.
