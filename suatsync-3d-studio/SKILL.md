---
name: SuatSync 3D Studio
description: Build a bilingual, static 3D chanting and karaoke studio around a sacred or traditional text — synchronized lines, a calibratable timeline, YouTube/local/timer audio, streaks, a procedural mandala, headless verification and a GitHub Pages release.
version: 1.0.0
---

# SuatSync 3D Studio

Use this skill when someone wants a **chant-along / karaoke web app for a long devotional text**:
large lines that follow playback, translations, repetition tracking, a calm 3D backdrop, and a release
that can be handed to another maintainer. It is the method behind
[SuatSync 3D](https://somphol.github.io/suatsync-3d/), a Chinabunchorn 9-recitation studio.

The deliverables are one offline-capable static app (three files), a private-by-default persistence
layer, a line-level timing model that can be calibrated to any recording, and a verification harness
that proves the timeline and content rather than trusting screenshots.

## When to use

- A long text is chanted repeatedly (9 rounds, 108 beads, 7 days, a liturgy) and a video/audio
  recording exists without chapter data.
- The audience is bilingual or reads a transliteration rather than the original script.
- The client wants a meditative visual, not a generic video player.
- The result must run from GitHub Pages with no backend.

Do **not** use this skill to re-host copyrighted audio/video, to claim an authoritative edition, or to
build word-by-word karaoke for a language whose word boundaries you cannot verify.

## Read before building

1. [references/reproduction.md](references/reproduction.md) — the rebuild book: data contract, timeline
   maths, audio adapter, progress algorithm, 3D recipe, verification, pitfalls.
2. [references/content-and-timing.md](references/content-and-timing.md) — edition policy, translation
   policy, marker estimation and calibration.
3. [references/release.md](references/release.md) — docs set, GitHub Pages, catalog publishing.

The bundled `assets/template/` is a working implementation of the pattern. Copy it, then replace the
content and branding. It is a **reference implementation**, not a theme to reskin blindly.

## Workflow

### 1. Freeze the text and the recording

- Identify an authoritative edition and record its URL, retrieval date and licence. Traditional text
  may be public domain, but a transcription page can still carry CC BY-SA.
- Measure the recording. For YouTube, fetch the watch page and read `"lengthSeconds"`. Do not trust the
  title or a thumbnail.
- Decide the repetition unit (a verse set, a round) and the closing dedication. Write down what is
  intentionally omitted.

### 2. Model the timeline before writing UI

Use **eleven section markers**: intro, every repetition, closing. Inside a section, allocate each line
a share proportional to its text length. Never hardcode per-line seconds unless you actually measured
them. This keeps one dataset usable with a different recording length.

If the recording has no chapters, say so in the UI and provide calibration. That honesty is part of
the product, not a disclaimer to hide.

### 3. Scaffold

```bash
node ~/.config/opencode/skills/suatsync-3d-studio/scripts/scaffold.mjs ~/Projects/my-chant-studio
cd ~/Projects/my-chant-studio
node scripts/check.mjs
node scripts/verify-browser.mjs
```

The scaffold writes a working three-file app, a content check and a headless verifier. Create `docs/`
if it does not exist (the scaffold does this).

### 4. Replace content

Edit only the dataset (`INTRO`, `VERSES`, `OUTRO`) and the constants:

- `VIDEO_ID`, `NOMINAL_DURATION`, `STORAGE_KEY`, version.
- Section labels in the i18n tables (e.g. “Round {n}” → your unit).
- Brand strings, title, meta description, favicon, credits.
- `defaultMarkers()` proportions; keep 11 entries.

Every line needs `pali` (or source script), `roman` (if applicable), `th`, `en` and a unique `id`.
`weight` is optional and only for obvious pacing corrections.

### 5. Adapt the audio

Keep the three-source adapter:

- **Video** — consent-gated IFrame API, created only on a click, with `origin` on http(s).
- **Local file** — object URL + `<audio>`, analyser for the visual pulse.
- **Timer** — a media clock; silent except a completion chime.

If the recording is a direct MP3 you own, make file mode the default and keep the timer as fallback.
Do not attempt to analyse cross-origin video audio; use a synthetic envelope and document it.

### 6. Keep completion honest

A round counts only when enough of it actually played and the playhead reached the end. The reference
implementation credits at most 4 seconds per tick and requires ≥50% coverage. Seeking to the end must
not count. This protects the streak from becoming a click counter.

### 7. Design the room

- Dark, warm, one accent; no large flat gold surfaces.
- The active line is the interface: colour, wash and a thin progress rule, not reflowing scale.
- A single procedural 3D motif tied to the content (lotus petals = rounds, inner petals = verses).
- Thai/Pali line-height 1.6–1.7; test at 320 px.
- Fixed footer reserves bottom padding; global `[hidden] { display:none !important; }`.
- `prefers-reduced-motion` stops the rotation.

### 8. Make it bilingual by construction

Two complete string tables, `data-i18n` attributes, and a self-test that fails when a key is missing in
either language. Do not leave English literals in render functions.

### 9. Verify, then screenshot

```bash
node scripts/check.mjs
node scripts/verify-browser.mjs
node scripts/verify-browser.mjs --screenshots
```

The verifier must cover the timeline boundary at the **end** of the recording, not only the middle.
This exact bug (looping to 10 instead of 11 markers) hides the dedication highlight.

### 10. Release like a project

Write `README.md`, `AGENTS.md`, `docs/{ARCHITECTURE,REPRODUCTION,TESTING,DEPLOYMENT,CONTENT,DESIGN}.md`,
`LICENSE`, `ATTRIBUTION.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`,
`robots.txt`, `sitemap.xml`, `.nojekyll`, and `state.json` (time, tokens, verification, credits).

Publish with the exact commands in [references/release.md](references/release.md). Enable Pages and
check the live boot, not only the local server.

## Contracts to preserve

| Contract | Why |
| --- | --- |
| 11 markers, strictly increasing | One shape for every repetition; calibration and jumps depend on it |
| Proportional line timing | Survives new recordings, tempo changes and edits |
| Round completion = coverage + end | Streaks mean something |
| Versioned, normalising storage | No crash from old/malformed local data |
| Consent-gated embed | No third-party cookie before a gesture; required for privacy claims |
| Local file never uploaded | The privacy promise is technical, not copy |
| Both languages complete | The test fails otherwise, and partial UI is a release defect |
| `state.json` at the end | The next agent needs build cost and verification, not guesswork |

## Pitfalls

- `sectionAt` must iterate **all** markers, including the last.
- API indices are 0-based; visible labels are 1-based. Test the off-by-one.
- `localStorage.clear()` then reload does not reset screenshots: `beforeunload` persists again.
- Wait >2.8 s (or remove `.show`) before capturing — toasts land on the chant.
- YouTube can start from its own controls, bypassing the fade-in; restore volume on state change.
- `display:flex` beats the `hidden` attribute unless you add a global `[hidden]` rule.
- Thai tone marks and vowels need more leading than Latin; a desktop-perfect line can collide on mobile.
- A fully suspended background tab stops `setInterval`; ordinary throttling does not. State this.
- Do not use screenshot-only verification for the chant text: assert counts and field completeness.

## Adaptation recipes

**Different chant, same app.** Replace `INTRO`, `VERSES`, `OUTRO`, keep 15 verses or update the checks,
change `defaultMarkers()`, and rewrite the section labels. Keep one round = the full verse set.

**Different video length.** Set `NOMINAL_DURATION` to the new length. Default markers scale
automatically; calibrated markers stay absolute. Re-measure rather than scaling a calibration.

**New language.** Duplicate the English table, translate every key, add it to the language toggle and
the self-test. Do not machine-translate the chant without review.

**No video at all.** Default to timer, remove the YouTube tab and consent block, keep the local file
option. The timeline is unchanged.

**Want real per-line timestamps.** Add optional `start`/`end` to the line schema and branch in
`lineAt`; keep proportional timing as the fallback for uncalibrated sections.

## Evidence

Reference release: <https://github.com/somphol/suatsync-3d> · demo:
<https://somphol.github.io/suatsync-3d/>. It passed 27 self-tests, 8 DOM checks, 9 interaction checks
and a live boot check on 2026-11-04. The build record is in `state.json` in that repository.
