# Source brief

## The entire prompt

> “Build an immersive single-page 3D website showcasing a luxury mechancal wristwatch that
> disassembles as the user scrolls.”

17 words, typo included. The second line of the original message was a credit link to
<https://www.youtube.com/watch?v=jTFGF4tCKTM>. No other requirements were supplied.

## Why this matters

The source video uses a much longer prompt. This study deliberately used a much smaller one to see
what DeepSeek V4.1 Flash could infer inside OpenCode. The unfamiliarity is the experiment; do not
rewrite the project history as if a full specification existed.

What the model inferred:

- a five-chapter editorial narrative (whole, dial, movement, case, return);
- a 41 mm dress watch in 904L steel with grand-feu enamel, blued hands and an automatic movement;
- a two-stage explosion, with the dial and hands lifted and the case shell separated;
- an ink-black studio, champagne gold, Bodoni Moda, micro-caps and hairlines;
- zero assets: procedural geometry, canvas printing and a PMREM studio;
- a real browser release gate, mobile layout, reduced-motion path and GitHub Pages.

What it invented because the brief did not specify it: the maison **Aurelis**, the model
**Calibre 07**, the exhibition title **Anatomy of a Second**, the CHF 24,800 price, the 31 jewels, the
72-hour reserve, the 60-piece production and the private-viewing fiction.

## Rules for a reproduction

1. Keep the exact brief in the README/colophon/credits. It is the most interesting constraint.
2. Keep the larger video prompt out of the build inputs; compare it only in the study notes.
3. Record what was inferred as a decision, not as a requirement.
4. Keep the fiction explicit: “A fictional maison”, no real orders, no real price.
5. Record the model, harness, elapsed time and token ledger in `STATE.md` / `state.json`.

## Definition of done

The one sentence is not a free pass. The reference gate is the definition:

- 24/24 headless checks;
- scroll-driven disassembly **and** reassembly;
- no external runtime requests;
- a mobile layout with the watch above the copy;
- a release with docs, licence, credits, screenshots and Pages.

A small prompt is a starting constraint, not an excuse for an unfinished artifact.
