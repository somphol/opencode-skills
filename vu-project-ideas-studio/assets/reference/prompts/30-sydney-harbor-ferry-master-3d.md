---
id: sydney-harbor-ferry-master-3d
title: "Sydney Harbor Ferry Master 3D"
track: Simulation & Vehicles
order: 30
words: 389
live: null
---

# Sydney Harbor Ferry Master 3D

> Dock a Sydney ferry at Circular Quay without scratching the paint.

**Track:** Simulation & Vehicles · **Brief size:** M · **Words:** 389 · **Read:** ~2 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Sydney Harbor Ferry Master 3D project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application named "Sydney Harbor Ferry Master 3D: Captain's Simulator" using vanilla HTML5, CSS3, ES6 JavaScript, Three.js (via CDN: https://cdnjs.cloudflare.com/api/libs/three.js/r128/three.min.js with OrbitControls), and Cannon.js physics engine (via CDN: https://cdnjs.cloudflare.com/api/libs/cannon.js/0.6.2/cannon.min.js).

The application must render an interactive 3D Sydney Harbour environment featuring low-poly models of the Sydney Opera House, Harbour Bridge, and Circular Quay wharves, a controllable green-and-yellow Sydney Ferry mesh with hydrodynamics physics, docking mini-games, Opal card audio synthesizers, and local score file export/import.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. 3D GRAPHICS & VESSEL HYDRODYNAMICS ENGINE:
----------------------------------------------------------------------
- Sydney Harbour & Landmark Architecture:
  * Construct a 3D environment modeling the Harbour Bridge arch, Opera House sails, Fort Denison, and Circular Quay docking terminals.
  * Animated Water Mesh: Shader-driven ocean plane with wave reflection and buoyancy displacement.
- Ferry Vessel Controls & Physics:
  * Controllable green-and-yellow Sydney Ferry mesh using keyboard controls (WASD / Arrow keys for engine thrust and rudder steering).
  * Momentum & Drift Physics: Water resistance friction, wide turning radiuses, and reverse thrust braking.
  * Deep Vessel Horn: Pressing 'H' triggers a deep synthesized ferry horn audio effect.

----------------------------------------------------------------------
2. GAMEPLAY & DOCKING CHALLENGE:
----------------------------------------------------------------------
- Passenger Commute & Docking Mini-Game:
  * Navigate from Manly Cove to Circular Quay Wharf 3.
  * Precision Docking: Align vessel parallel to wharf rubber fenders at under 2 knots speed. Successful docking triggers Opal card chime audio and awards score points.
- Weather & Water Conditions Toggles:
  * Presets: "☀️ Sunny Harbour", "🌊 Rough Sydney Heads Swell", and "🌆 Harbour Lights at Night".
- Audio Synthesizer (Web Audio API):
  * Synthesize vessel engine hum, water hull lap sound, Opal validator beep, and harbour seagull calls.

----------------------------------------------------------------------
3. DATA PERSISTENCE & FILE EXPORT/IMPORT:
----------------------------------------------------------------------
- Browser Storage: Save master captain rank, total safe dockings, and passenger counts in browser localStorage.
- Local File Export/Import Sync:
  * "💾 Save Captain Log": Downloads 'sydney_ferry_save.json'.
  * "📂 Load Career File": Restores navigation progress across devices.

----------------------------------------------------------------------
4. UI / UX DESIGN SYSTEM:
----------------------------------------------------------------------
- Theme: Nautical Sydney Green & Gold accented with glassmorphic telemetry overlays (Speed in Knots, Rudder Angle, Wind Vector, Docking Radar).

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `Sydney Harbor Ferry Master 3D: Captain's Simulator`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/sydney-harbor-ferry-master-3d>
