---
id: oceancraft-3d-deep-sea-fishing-studio
title: "OceanCraft 3D: Deep Sea Fishing Studio"
track: Simulation & Vehicles
order: 37
words: 418
live: null
---

# OceanCraft 3D: Deep Sea Fishing Studio

> Deep-sea fishing with buoyancy, tension and a catch logbook.

**Track:** Simulation & Vehicles · **Brief size:** M · **Words:** 418 · **Read:** ~2 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this OceanCraft 3D: Deep Sea Fishing Studio project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application named "OceanCraft 3D: Deep Sea Fishing & Hydrodynamics Studio" using vanilla HTML5, CSS3, ES6 JavaScript, and Three.js (via CDN: https://cdnjs.cloudflare.com/api/libs/three.js/r128/three.min.js with OrbitControls).

The application must render a dynamic 3D ocean water surface with wave physics, a floating fishing boat that responds to wave movement with realistic buoyancy, and an interactive deep-sea fishing minigame with an aquarium logbook and local JSON data sync.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. 3D OCEAN WATER & BUOYANCY PHYSICS ENGINE:
----------------------------------------------------------------------
- Animated Water Plane Mesh:
  * Render an expansive ocean surface plane using custom vertex shader or procedural displaced PlaneGeometry driven by wave functions (combining sine/cosine waves for realistic wave motion).
  * Render a realistic water material with specular highlights, sun reflection, sky color gradient, and transparency.
- Boat Hull Buoyancy Math:
  * Construct a 3D fishing boat mesh placed on the water plane.
  * Dynamically sample wave height at the boat's position to apply vertical floating motion, pitch (front-to-back tilt), and roll (side-to-side sway).
- Weather & Environment Toggles:
  * "☀️ Calm Sunset", "⛈️ Stormy Waves", and "🌌 Bioluminescent Night" lighting & wave amplitude presets.

----------------------------------------------------------------------
2. INTERACTIVE FISHING GAMEPLAY LOOP:
----------------------------------------------------------------------
- Casting Mechanism: Hold to charge casting power, releasing to throw the bobber out into the ocean with splash particle effects.
- Tension Reeling Minigame:
  * Tension meter showing line stress when a fish bites.
  * Click / Hold "REEL" button or Spacebar to pull fish in while keeping tension inside the safe zone (avoiding line snaps or fish escapes).
- Fish Logbook & Species Catalog:
  * Capture diverse fish species categorized by rarity (Common, Rare, Legendary).
  * Record weight (kg), length (cm), and catch history in an interactive UI modal panel.
- Audio Effects (Web Audio API): Procedural ocean waves, line reel clicking, water splash drops, and catch achievement chimes.

----------------------------------------------------------------------
3. DATA PERSISTENCE & FILE EXPORT/IMPORT:
----------------------------------------------------------------------
- Browser Storage: Store caught fish inventory, high score records, and unlocked boat upgrades in browser localStorage.
- Local File Sync:
  * "💾 Save Aquarium Log": Downloads 'oceancraft_save.json'.
  * "📂 Load Save File": Restores fishing progress and catch records across any device.

----------------------------------------------------------------------
4. UI / UX DESIGN SYSTEM:
----------------------------------------------------------------------
- Theme: Marine Nautical UI (slate blue glassmorphic panels, glowing gold trophy badges, responsive overlay HUD).

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `OceanCraft 3D: Deep Sea Fishing & Hydrodynamics Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/oceancraft-3d-deep-sea-fishing-studio>
