---
id: golden-gate-fog-3d-atmospheric-flight
title: "Golden Gate Fog 3D: Atmospheric Flight"
track: Simulation & Vehicles
order: 26
words: 475
live: null
---

# Golden Gate Fog 3D: Atmospheric Flight

> Glide through Karl the Fog and the Golden Gate waypoint rings.

**Track:** Simulation & Vehicles · **Brief size:** M · **Words:** 475 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Golden Gate Fog 3D: Atmospheric Flight project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application named "Golden Gate Fog 3D: Atmospheric Flight & Bridge Simulator" using vanilla HTML5, CSS3, ES6 JavaScript, Three.js (via CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js with OrbitControls), and Cannon.js physics engine (via CDN: https://cdnjs.cloudflare.com/api/libs/cannon.js/0.6.2/cannon.min.js).

The application must render an interactive 3D San Francisco Bay environment featuring the Golden Gate Bridge suspension towers, Alcatraz Island, and Marin Headlands terrain, custom volumetric fog shaders simulating "Karl the Fog" rolling through the bay, flight glider aerodynamics physics, ring waypoint navigation challenges, synthesized bay foghorns and wind audio, and local flight log JSON export/import.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. 3D GRAPHICS & VOLUMETRIC FOG SHADER ENGINE:
----------------------------------------------------------------------
- San Francisco Bay & Landmark Architecture:
  * Construct a 3D environment modeling the Golden Gate Bridge (international orange suspension towers, main cables, roadway plane), Alcatraz Island mesh, and Marin Headlands coastal terrain.
  * Water Plane: Reflective bay water shader reacting to atmospheric sunlight.
- Custom Volumetric Fog Shader ("Karl the Fog"):
  * Implement custom GLSL fragment/vertex shaders or procedural particle noise volumes simulating dynamic rolling fog banks over the bay.
  * Fog density layers that obscure bridge towers and dissipate as altitude increases or sun position changes.
- Glider Flight Aerodynamics Physics:
  * Controllable glider/light aircraft mesh responding to pitch, roll, and yaw controls (WASD / Arrow keys or mouse yoke).
  * Physics math: Aerodynamic lift force (L=12v2SCL), wing drag, gravity descent, stall speed mechanics, and thermal updraft vectors rising off the Marin Headlands.

----------------------------------------------------------------------
2. ATMOSPHERIC FLIGHT & WAYPOINT NAVIGATION LOOP:
----------------------------------------------------------------------
- Bridge Arch & Ring Waypoint Challenge:
  * Fly through glowing holographic waypoint rings suspended under the bridge deck, through fog banks, and around island waypoints.
  * Cockpit / Third-Person View Toggle: Press 'C' to switch between first-person pilot cockpit camera and third-person trailing camera.
- Weather & Microclimate Presets:
  * Presets: "🌉 Heavy Morning Fog (Karl's Blanket)", "☀️ Sunny Clear Bay", and "🌅 Sunset Golden Hour Over Pacific".
- Web Audio API Sound Synthesizer:
  * Synthesize wind rushing past the airframe, deep dual-tone Golden Gate foghorn blasts, plane engine thruster/glider wind hum, and waypoint chime alerts.

----------------------------------------------------------------------
3. DATA PERSISTENCE & FILE EXPORT/IMPORT:
----------------------------------------------------------------------
- Browser Storage: Save total flight hours, completed flight ring challenges, highest altitude reached, and pilot rating badges in browser localStorage.
- Local File Export/Import Sync:
  * "💾 Save Flight Logbook": Downloads 'goldengate_flight_save.json'.
  * "📂 Load Logbook File": Restores pilot records and achievements across any device.

----------------------------------------------------------------------
4. UI / UX DESIGN SYSTEM:
----------------------------------------------------------------------
- Theme: San Francisco Aviation UI (International Orange & Deep Pacific Cyan glassmorphic telemetry HUD displaying Speed in Knots, Altitude in Feet, Pitch/Roll Artificial Horizon, and Fog Density %).

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `Golden Gate Fog 3D: Atmospheric Flight & Bridge Simulator`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/golden-gate-fog-3d-atmospheric-flight>
