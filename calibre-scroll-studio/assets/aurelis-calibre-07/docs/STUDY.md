# The one-sentence brief

## The prompt

The entire working brief was:

> “Build an immersive single-page 3D website showcasing a luxury mechancal wristwatch that
> disassembles as the user scrolls.”

That is 17 words, including the typo. The second line of the original message was a credit link to
the [source video](https://www.youtube.com/watch?v=jTFGF4tCKTM), whose prompt is much longer. No
expanded specification, moodboard, wireframe, asset pack, brand book, test plan or deployment brief
was supplied.

This was intentional: the goal was to see what DeepSeek V4.1 Flash could do with a much smaller
prompt than the video's, inside OpenCode.

## What the model inferred

| Area | Inferred from the sentence |
| --- | --- |
| Narrative | Five chapters: the whole, dial, movement, case, and the return. |
| Watch | 41 mm dress watch, 904L steel, grand-feu enamel, blued hands, 31 jewels, 72 h reserve. |
| Disassembly | Dial and hands lift, movement fans open, case shell separates, caseback and rotor travel. |
| Art direction | Ink-black studio, champagne gold, Bodoni Moda, micro-caps, hairline rules. |
| Interaction | Native scroll as the only timeline; hover parallax; mouse drag; a chapter rail. |
| Constraints | Zero assets: procedural geometry, canvas printing, PMREM studio. |
| Quality | Headless Chrome gate, mobile and reduced-motion coverage, offline delivery. |
| Release | Docs, colophon, licence, state ledger, GitHub Pages, reusable skill. |

Everything else — the maison name **Aurelis**, the model name **Calibre 07**, the exhibition title
**Anatomy of a Second**, the CHF 24,800 price, the 60-piece production, the private-viewing fiction —
was invented to give the interface a coherent world.

## Why the result holds together

1. **A single timeline is a strong constraint.** Camera, copy, labels, gears and parts all read the
   same `t`, so the site cannot drift out of sync.
2. **No assets forced a language.** A procedural watch cannot rely on a photograph; it has to commit
   to silhouette, material and one strong light. That made the design decisions simpler, not harder.
3. **The watch is the navigation.** The chapters are named for its anatomy, so scrolling and
   understanding are the same act.
4. **The ending is the beginning.** Reassembly gives the scroll a story arc and avoids the common
   “explode and abandon” ending.
5. **Verification caught the embarrassing things.** The dial artwork was rotated 90°, the sticky
   stage pushed the first chapter below the fold, and the hands detached from the lifted dial. None
   of these were visible in the code review; all were caught by rendering and asserting.

## What the small prompt did not provide

- A real watch, movement architecture or service manual.
- A target audience, market or price strategy.
- Brand naming, trade dress or a legal review.
- Copywriting beyond the first tagline.
- A deployment target or a definition of done.

The project chooses fiction for all of these and documents that choice. Do not present it as a real
maison or a real product.

## Reproducing the experiment

Use the same sentence, no extra specification, and the same constraints: one page, real-time 3D,
scroll-driven disassembly, release-grade verification. The `calibre-scroll-studio` skill distils the
method and ships the working template. The project's own [`REPRODUCE.md`](REPRODUCE.md) is the
step-by-step for an agent.

A fair comparison should record the model, harness version, wall-clock time and token ledger — the
same fields in [`STATE.md`](../STATE.md).

## Outcome

- 24/24 headless checks.
- 103 draw calls, 131,468 triangles, 23 registered assemblies.
- Fully offline after load, no external runtime requests.
- ~4.5 hours of wall-clock session time, ~22M tokens processed (about 96% cache reads) at the time
  of this note. The exact final numbers are in [`state.json`](../state.json).
- One original site, one reproducible skill, one honest ledger.

The experiment is not proof that a small prompt is sufficient for every project. It is evidence that
a small prompt plus a strong, testable constraint (a watch, a timeline, a release gate) can produce a
coherent result — and that the remaining ambiguity should be made explicit rather than hidden.
