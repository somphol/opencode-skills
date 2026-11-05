# Roadmap

## Deliberately shipped in 1.2.0

Fifty synth lullabies across seven collections, 32 public-domain archive performances across four
collections, a first-listen archive queue, a cinematic now-playing card with source links, three
ambient beds, eleven category pages and search, four themes, three text sizes, a smoothstep timer,
coin/free-play, favourites, export, bilingual UI, 77 checks and a reproducible handoff. That is the product; the list
below is optional.

## Next, in rough order

1. **Quality toggle.** Disable bloom and reduce bubble count on low-end GPUs, remembered in settings.
2. **More archive curation.** Add verified public-domain recordings; extend the H–K archive pages with a documented slot plan. Only `license: "Public domain"` entries are accepted.
3. **Wake-safe resume.** Remember the last position and offer “continue where you left off” rather
   than restarting the loop.
4. **Timer memory.** Restore the last timer as armed-but-paused, with a visible “will start on play”
   state (today the preference is shown but only starts with playback).
5. **Custom manifest URL.** A settings field for a user-hosted playlist, with the same validator and a
   clear CORS warning.
6. **More languages.** The dictionary shape is ready; Thai and English are the only handwritten sets.
7. **Reduced-data mode.** Poster frame + synth-only on metered connections.
8. **Visual themes.** A “dawn” cabinet variant (same geometry, different palette) if it does not
   compromise the night design.

## Not planned

- Accounts, cloud sync, social features or a backend.
- A bundler or framework migration.
- Redistribution of copyrighted recordings.
- A mobile native wrapper; the web app is the product.
- Medical or sleep-tracking claims.

## How to propose

Open a feature request with the layer it touches (3D, audio, UI), the user problem, and whether it
preserves the zero-build/no-backend constraints. Small, testable increments are preferred.
