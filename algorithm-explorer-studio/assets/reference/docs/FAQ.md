# FAQ

### Is this a LeetCode replacement?

No. It links out to canonical problems and teaches pattern recognition. There is no judge, no hidden
tests, no code execution.

### Why only 15 patterns?

That is the product brief and the useful abstraction level for interview preparation: fifteen
structures cover the large majority of canonical problems. The 61 linked problems are the practice
surface, not a claim of completeness.

### Are the visualizations accurate?

The engines follow the standard algorithms and the default answers are asserted in tests. The scenes
are explanatory models, deliberately simplified (not to scale, labels can overlap). They teach the
mechanism; they are not a proof.

### Why do some code lines share a highlight?

Marks are semantic. A frame such as `move` may correspond to both branches of an `if/else`, so every
line with that mark glows. This is intentional and works across three languages.

### Why is Three.js loaded from a CDN?

The brief asked for CDN delivery and zero build dependencies. Pinning r128 keeps it reproducible. If
the CDN is blocked, the 3D stage falls back; the engines, code, quiz and practice still work.

### Does it work offline?

Not fully. The first load needs the CDN. Once cached, the browser may serve the scripts, but there is
no service worker and no vendored copy. The non-3D tabs are static and work from disk.

### How do I use my own input?

Read the hint under the input. Each pattern has a compact grammar; `README.md` and the input panel
list them. Invalid input is rejected inline and the previous trace is kept.

### Why did my custom tree render differently?

Input is standard level order with `null` for gaps. A missing trailing `null` can change the shape of
the last level. Count the slots, not just the visible values.

### Is my progress saved?

In this browser only, under three `localStorage` keys. Clearing site data or using a private window
removes it. There is no account and no sync.

### Can I contribute problems or a new pattern?

Yes. Read [CONTRIBUTING.md](../CONTRIBUTING.md) and [REPRODUCTION.md](REPRODUCTION.md#7-adding-a-sixteenth-pattern).
A new pattern must include an engine, three code listings, a scene, tests and docs.

### Why is the quiz not timed?

Speed is not the skill being taught. The quiz measures recognition and reasoning; the explanations
matter more than the score.

### Why English only?

The brief is English and the terminology is conventionally English. A partial translation would be
worse than a deliberate single language. See [DECISIONS.md](DECISIONS.md#adr-008--english-only-ui).

### What is `state.json`?

A build record: session id, elapsed time, token counters, artefacts, verification counts, deployment
status and credits. It is generated from the OpenCode session database; it is not runtime data.
