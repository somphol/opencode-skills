# Editable chant timings

`data/timings.csv` is the human-editable source of truth for **when each verse starts**.
`timings.js` is generated from it and loaded by the app.

## What to edit

Change only the `start_seconds` column. It accepts either decimal seconds or a clock time:

- `272.4`
- `4:32.4`
- `1:22:28.5`

Leave every other column alone. `start_time`, `pali`, `roman` and `notes` are for human context and
are ignored once `start_seconds` is filled (if `start_seconds` is blank, the build will read
`start_time` as a fallback).

| Column | Meaning |
| --- | --- |
| `round` | 1–9 |
| `verse` | 1–15 |
| `start_seconds` | **Edit this.** Decimal seconds or `m:ss.s` |
| `start_time` | Human-readable reference; used only if `start_seconds` is blank |
| `pali` | Full Thai Pali text, for identification |
| `roman` | Full Roman transliteration |
| `notes` | Free text, ignored by the build |

Do not delete rows or renumber verses. The file contains 9 rounds × 15 verses = 135 rows. Any rounds
with an incomplete set are rejected by the build.

## Find a timestamp

1. Open the video and the studio side by side.
2. Pause the video on the first syllable of the verse.
3. Read the video's current time, for example `5:42.4` → write `5:42.4` (or `342.4`).
4. Or use the studio's own time display/seek bar (the timer also works).
5. Put the value in `start_seconds` and save the CSV as UTF-8.

The end of a verse is the next verse's start. The last verse of a round ends at the next round's
first verse. You do not need an end column.

## Apply the edits

```bash
node scripts/build-timings.mjs
# or
npm run timings
```

This validates and rewrites `timings.js`. Then reload the studio.

The build rejects:

- a round with fewer or more than 15 verses;
- a duplicate round/verse pair;
- a timestamp outside 0–5837;
- timestamps that do not increase from verse to verse and round to round.

## How the app chooses a timing

1. **This sheet**, when the current round has 15 complete rows. It gives exact per-line starts.
2. **Proportional fallback**, using Pali length, for the intro, dedication, or any round not present
   or without a complete set.

There is no in-app calibration screen. The sheet is committed to the repository, so corrected timings
ship with the app. It is not stored in the browser.

## Current values

Round 1 is measured; rounds 2 and 3 start at 8:02 and 12:26. The spacing is exactly 4:24, so the same
relative verse pattern is reused for all nine rounds:

- Round 1 verse 1 starts at 3:38;
- each round is 4:24, with the chant pattern occupying the first 3:51;
- round anchors: 3:38, 8:02, 12:26, 16:50, 21:14, 25:38, 30:02, 34:26, 38:50;
- dedication at 43:14.

The first three anchors are measured; the rest are inferred from the 4:24 spacing. They are a usable
first pass, not chapter data from the video. Replace any row or anchor you measure.

## Accuracy tips

- Set the **round 1 verse 1** start first; every later value should be later than it.
- Use the same playback speed (1.00×) while measuring.
- Write down the first syllable, not the end of the previous verse.
- If the video has announcements or pauses between rounds, put the gap before the next round's first
  verse; the app simply waits on the previous line until the next start.
- Check a few values by clicking the line in the app: it should seek to that timestamp.
