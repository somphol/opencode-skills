# Provenance

## What was supplied

A single user message containing a list of project specifications. It produced **55 headers** and
**54 unique briefs**. The message also contained intro sentences, repeated request wrappers, quote
marks and one meta instruction at the end. Those are packaging, not specifications.

`data/source.json` is the parsed audit trail: original header, live URL, verbatim task, word count.
`data/metadata.json` is the curated view. `data/prefix.txt` is the single current request wrapper.

## Cleaning performed

Only packaging was changed:

- removed the repeated request prefix from every block;
- removed the `===========` divider and trailing `===============+` variants;
- removed quote wrappers (`*"…"*`, `"…"`) from Word Practice, Flappy Bird 3D, Rubik Cube, Solitaire,
  Texas Hold'em, Pong Classic and World Clock;
- removed conversational lead-ins from Flappy Bird 3D (“Yes, Flappy Bird 3D is 100% possible…”) and
  Rubik Cube (“Here is the most elaborate… master prompt…”);
- removed the final meta note (“Please note that there is almost a comment prefix…”);
- normalized whitespace when more than two blank lines appeared;
- dropped the second Nexus 2035 block (identical specification);
- replaced each block's old prefix with the single current prefix at copy/build time.

**Nothing inside a task body was rewritten, shortened or paraphrased.** The build asserts that no task
contains the request prefix and that every task is at least 200 characters.

## Anomalies in the supplied list

| Block | Observation | Resolution |
| ---: | --- | --- |
| 8 | Header is prefixed `(Master/Meta Example)` | parser accepts the prefix; catalog uses the plain title |
| 20 | Header says “Makruk 2.5D”, task body says 3D/2.5D | display title uses “Makruk 3D”; original header kept as alias |
| 34 / 42 | Nexus 2035 appears twice | first kept; second recorded as `duplicateOf: "34"` |
| 37 | Request line names “CyberDoom”, task body is OceanCraft 3D | task body authoritative; display title is OceanCraft |
| 38 | Request line names “CyberDoom”, task body is CyberType | task body authoritative; display title is CyberType |
| 43 | Short header “BrickStep 3D Pro”, full name in body | display title uses the full 250-piece name |
| 45 | Header “Snooker Game (3D)” | display title “Snooker 3D: Championship Table & Referee” |
| 46 | Header “3D Trigonometry Master Booklet” | display title includes the 20-tab SRS name from the body |
| 47 | Header “VOA Newsroom 500 Words” | display title “VOA Newsroom: 500 Words ESL Studio” |
| 49 | “Word Practice” with a quoted prompt | quotes stripped; display title names the ESL coach |
| 51–55 | Short names (`Rubik Cube`, `Solitaire`, `Texas Hold'em`, `pong_classic`, `World Clock`) | display titles normalized; originals kept as aliases |
| 55 | Header uses singular `VU - Project`, not `Projects` | parser accepts both |
| 48, 49 | Include live URLs | shown as **Live** badges and linked in the drawer |

Many blocks had the short prefix (without the docs/skill paragraphs). All are now identical: one
prefix, the current one, with the project title substituted.

## What was authored here

- the nine-track taxonomy (Games, Puzzles, STEM, Language, Cities, Simulation, Calm, Craft, Daily life);
- one-sentence taglines;
- display-title normalisation and aliases;
- stack and feature chips, derived by keyword rules from the task body;
- brief size bands (`S` < 380 words, `M` ≤ 650, `L` > 650), read time and counts;
- the catalog UI, screenshots, documentation and tests;
- the extraction, parsing and build tools.

## Attribution and rights

The briefs were supplied by the repository owner for this catalog. Code and documentation in this
repository are MIT. Product and company names mentioned inside briefs (Three.js, LeetCode, VOA,
Project Gutenberg, Wurlitzer and others) are used descriptively and remain the property of their
owners. No third-party assets, fonts, music, book text or code are redistributed here.

Two briefs link to older public builds:

- <https://somphol.github.io/us-map-jigsaw-3d/>
- <https://somphol.github.io/word-practice/>

Those builds have their own repositories and licences; this catalog only links to them.
