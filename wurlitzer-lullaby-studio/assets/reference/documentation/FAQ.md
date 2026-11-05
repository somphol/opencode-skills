# FAQ

**Why is there no sound?**
Browsers require a click before audio. Press the gold play button or a title strip. Check the mute
icon, the master knob, and the system volume. If `?selftest` passes the audio-graph check but you hear
nothing, try a different browser; some Safari versions suspend media-element sources.

**Why do H-1…H-4 not play?**
They stream from Wikimedia Commons. The host must be reachable and must allow CORS; the shipped URLs
do. If it fails, the app shows an error and synth tracks still work. All four archive recordings are
public domain.

**Can it run offline?**
After the Three.js modules are cached, the synth engine, ambient beds, timer and UI work offline. The
first visit needs jsDelivr; archive streams need Wikimedia.

**Why is the 3D cabinet not an exact Wurlitzer?**
It is a procedural tribute built from geometry and canvas textures, not a licensed model. The
silhouette, bubble tubes, chrome and paper rack are evocations.

**Why are only eight records in the 3D rack?**
The physical rack is a curated eight-record page. The DOM rack lists all 64 slots across eight
category pages; the 3D paper strips mirror the active page or the current record's collection.

**What do the empty slots do?**
G-3…G-8 and H-5…H-8 are reserved. They reject the selection with a clack and “No record in that
slot,” like a real jukebox with an empty title strip.

**How do I add my own music?**
Edit `data/playlist.json` with a C-1…H-8 slot, an https URL that allows CORS, title, artist, duration,
licence, credit and source. Run the tests. Do not commit the audio itself.

**Can I change the lullabies?**
Yes. Add a track object to `BUILTIN_TRACKS` with a note string (`C4:2 D4:1`), bilingual metadata and
an unused A/B slot. Tempo and duration are computed. Keep the melody public domain.

**Why does the timer go quiet before it reaches zero?**
The last two minutes fade smoothly (smoothstep), so the final minute is already very soft. That is
intentional for sleep.

**How do I reset everything?**
Press **Reset** twice within 2.6 s. This restores factory settings but keeps the current language.

**Where is my data?**
Only in this browser's `localStorage`. Export settings to keep a copy. Clearing site data removes it.

**Why did the browser ask for a Keychain password during tests?**
It should not: the harness passes `--use-mock-keychain` and `--password-store=basic`. If you see a
prompt, a different Chrome launch or a removed flag is the cause.

**Can I use this commercially?**
The code is MIT. The archive recordings are not redistributed but keep their source licences; verify
each one. The Wurlitzer name is a trademark of its owner; this is an unaffiliated tribute.

**Is it a medical device?**
No. It is a relaxation toy. Do not use it to diagnose or treat insomnia or any other condition.
