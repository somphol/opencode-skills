---
id: vintage-wurlitzer-3d-lullaby-jukebox
title: "Vintage Wurlitzer 3D Lullaby Jukebox"
track: Calm & Focus
order: 5
words: 511
live: null
---

# Vintage Wurlitzer 3D Lullaby Jukebox

> A 1940s bubbler jukebox with 50 procedural lullabies and archive performances.

**Track:** Calm & Focus · **Brief size:** M · **Words:** 511 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Vintage Wurlitzer 3D Lullaby Jukebox project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application
named "Vintage Wurlitzer 3D Lullaby Jukebox & Sleep Studio" using vanilla HTML5,
CSS3, ES6 JavaScript, and Three.js (loaded via CDN).

======================================================================
PROJECT BACKGROUND & PEDIGREE:
======================================================================
This application is part of an open-source visual web app series designed for
sleep therapy and relaxing audio experiences. It models an iconic 1940s-style
Wurlitzer "Bubbler" jukebox in full 3D, combining procedural Web Audio API note
synthesis (for unlimited, zero-bandwidth lullabies) with an external JSON-driven
royalty-free audio stream loader. It runs entirely client-side on GitHub Pages.

======================================================================
1. 3D RENDERER & CLASSIC WURLITZER BUBBLER UI (THREE.JS + CANVAS)
======================================================================
- Vintage 3D Jukebox Cabinet:
  * Render an iconic arched Wurlitzer 1015-style cabinet with polished
    walnut wood textures, chrome metallic trim, and glowing arch lights.
  * Animated Liquid Bubble Tubes: Multi-colored glass tubes along the arched
    casing featuring rising translucent particle bubbles and rotating color
    cylinders that shift hues dynamically during audio playback.
  * Visible 3D Record Mechanism: Glass display window showing a spinning 45-RPM
    vinyl record, tone arm, and mechanical turntable assembly.
- Retro Title Strip Selection Rack:
  * Physical-style song selector panel with dual-column paper title strips
    showing track numbers (e.g., A-1, A-2, B-1), song titles, and artist credits.
  * Mechanical push-buttons (A–D, 1–8) that depress with 3D tactile motion
    and clack audio feedback when a track is chosen.

======================================================================
2. DUAL-ENGINE AUDIO ARCHITECTURE (HYBRID PLAYBACK)
======================================================================
- Engine 1: Procedural Web Audio API Music Box Synthesizer
  * Built-in JavaScript step-sequencer using sine/triangle wave oscillators with
    smooth gain decay envelopes to play public domain lullabies directly in code:
    - Brahms' Lullaby (Wiegenlied)
    - Twinkle, Twinkle, Little Star
    - Mozart's Cradle Song (Schlafe, mein Prinzchen)
    - Schubert's Lullaby
    - Rock-a-bye Baby
    - Hush, Little Baby
    - Frère Jacques (Sleep Variant)
    - Golden Slumbers
  * Instant, zero-bandwidth playback capable of scaling to 50+ procedural note arrays.
- Engine 2: External Royalty-Free Audio Stream Loader (JSON Manifest)
  * Playlist loader reading an external JSON manifest to stream high-quality,
    royalty-free instrumental MP3s (e.g., harp, acoustic guitar, piano, ambient synth).
- Dual-Layer Ambient Sound Mixer:
  * Embedded noise generator layers for background sleep ambience: [Soft Rainfall],
    [Gentle Ocean Waves], and [Night Crickets] with independent volume knobs.

======================================================================
3. RETRO JUKEYBOX CONTROLS, SLEEP TIMER & BILINGUAL HUD
======================================================================
- Mechanical Jukebox Controls:
  * Physical 3D coin slot animation ("Insert Quarter to Play" or "Free Play Mode").
  * Knobs for Master Volume, Bass/Treble EQ, and Ambient Mix Ratio.
- Gradual Sleep Timer:
  * Selector dial for 15, 30, and 60 minutes. Automatically fades overall audio
    volume smoothly to zero over the final 2 minutes before powering down lights.
- Bilingual Support (EN ⇄ TH Toggle):
  * Instantly translates all title strips, UI buttons, timer labels, and jukebox
    instructions between English and Thai (ภาษาไทย).
- Local Data Persistence:
  * Auto-saves favorite track picks, custom volume mixes, and timer defaults to
    browser localStorage with an "💾 Export Jukebox Settings JSON" button.

======================================================================
OUTPUT FORMAT REQUIREMENT
======================================================================
Provide the complete source code clearly divided into three code
blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `Vintage Wurlitzer 3D Lullaby Jukebox & Sleep Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/vintage-wurlitzer-3d-lullaby-jukebox>
