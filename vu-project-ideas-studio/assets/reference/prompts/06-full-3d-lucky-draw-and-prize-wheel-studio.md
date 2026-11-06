---
id: full-3d-lucky-draw-and-prize-wheel-studio
title: "Full 3D Lucky Draw & Prize Wheel Studio"
track: Games & Arcade
order: 6
words: 557
live: null
---

# Full 3D Lucky Draw & Prize Wheel Studio

> A fair 3D prize wheel with spin physics, confetti and a winner log.

**Track:** Games & Arcade · **Brief size:** M · **Words:** 557 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Full 3D Lucky Draw & Prize Wheel Studio project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application
named "Full 3D Lucky Draw & Prize Wheel Studio" using vanilla HTML5,
CSS3, ES6 JavaScript, and Three.js (loaded via CDN).

======================================================================
PROJECT BACKGROUND & PEDIGREE:
======================================================================
This application is part of an open-source visual web app series. Its
purpose is to provide a fully immersive, customizable 3D Lucky Draw wheel
suitable for events, live streams, and team draws. It runs entirely client-side
with zero external framework dependencies or backend requirements, optimized
for GitHub Pages deployment.

======================================================================
1. 3D RENDERER, SCENE & WHEEL GEOMETRY (THREE.JS)
======================================================================
- Scene & Camera Setup:
  * Initialize a Three.js WebGLRenderer with soft shadows enabled, adaptive
    window resizing, and an atmospheric dark studio studio background.
  * Camera Controls: Implement OrbitControls allowing smooth 360-degree rotation,
    panning, and zoom around the 3D spinning wheel frame.
- 3D Wheel & Pointer Mesh:
  * Render a thick, bevel-edged 3D wheel mesh mounted vertically on a metallic stand base.
  * Outer Rim: Chrome/gold metallic pegs protruding from the perimeter between slices.
  * Dynamic Slices: Slice angles and segment colors adjust dynamically based on
    the active entry count (supporting 3–4 entries up to large rosters).
  * 3D Canvas Textures: Render high-legibility participant names onto segment face textures.
  * Pointer Needle: Metallic 3D pointer mounted at the top or side that subtly
    vibrates/clicks as outer pegs pass by during rotation.

======================================================================
2. PARTICIPANT ENTRY & ROSTER MANAGEMENT (3–4 NAMES OR BULK LIST)
======================================================================
- Flexible Roster Input Panel:
  * Quick-Add Slot Controls: Dedicated quick-input fields allowing immediate
    typing of 3 or 4 names (e.g., Slot 1, Slot 2, Slot 3, Slot 4).
  * Bulk Roster Textarea: Multi-line paste area for larger rosters (1 name per line).
  * Sample Preset Selector: One-click buttons to load preset lists (e.g., "Quick 3 Players",
    "Quick 4 Players", "Team Alpha").
  * Instant Re-texture: Modifying or swapping the roster instantly recalculates
    wheel slice angles and updates the 3D texture maps in real time.

======================================================================
3. PHYSICS SPIN DYNAMICS & CELEBRATION EFFECTS
======================================================================
- Spin Acceleration & Friction Deceleration:
  * Clicking "SPIN WHEEL" applies realistic angular velocity acceleration,
    followed by a smooth friction deceleration curve (cubic easing).
  * Target stopping angle is randomly pre-determined at start of spin to ensure
    fair mathematical probability.
- Winner Celebration Modal & Particle Canvas:
  * Stopping at the winning segment triggers a sleek 3D winner popup overlay.
  * Confetti Burst: Full-screen 3D/2D particle confetti animation celebrating the draw.
  * Winner Options: "Remove Winner from Roster" (auto-rebuilds 3D wheel) or "Keep in Roster".
- History Log Panel:
  * Timestamped winner record sidebar log with a "Clear Log" option.

======================================================================
4. BILINGUAL HUD, AUDIO & LOCAL DATA PERSISTENCE
======================================================================
- Web Audio API Sound Effects (Zero External Files):
  * Synthesized metallic ticking/clicking audio when pegs collide with the pointer
    (pitch/frequency scales dynamically with rotational speed).
  * Escalating triumph fanfare sting upon wheel stop and winner popup reveal.
- Language Switcher (EN ⇄ TH Toggle):
  * Instantly translates all UI buttons, drawer settings, winner banners, and
    controls between English and Thai (ภาษาไทย).
- Local Storage & Export Engine:
  * Auto-saves active roster, custom settings, and winner history to browser localStorage.
  * "💾 Export Draw Log JSON / CSV" downloads complete draw records.

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

Source label in the supplied list: `Full 3D Lucky Draw & Prize Wheel Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/full-3d-lucky-draw-and-prize-wheel-studio>
