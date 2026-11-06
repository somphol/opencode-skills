---
id: bondi-surf-3d-hydrodynamic-wave-simulator
title: "Bondi Surf 3D: Hydrodynamic Wave Simulator"
track: Simulation & Vehicles
order: 29
words: 448
live: null
---

# Bondi Surf 3D: Hydrodynamic Wave Simulator

> Gerstner waves, barrel rides and trick scoring at Bondi.

**Track:** Simulation & Vehicles · **Brief size:** M · **Words:** 448 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Bondi Surf 3D: Hydrodynamic Wave Simulator project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application named "Bondi Surf 3D: Hydrodynamic Wave & Ocean Simulator" using vanilla HTML5, CSS3, ES6 JavaScript, Three.js (via CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js with OrbitControls), and Cannon.js physics engine (via CDN: https://cdnjs.cloudflare.com/ajax/libs/cannon.js/0.6.2/cannon.min.js).

The application must render an interactive 3D coastal environment modeling Sydney's iconic Bondi Beach and Icebergs ocean pool, a procedural breaking wave shader system using Gerstner wave equations, dynamic surfboard rail carving physics, a trick scoring minigame, coastal Web Audio API sound synthesis, and local progress JSON export/import.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. 3D GRAPHICS & GERSTNER WAVE HYDRODYNAMICS ENGINE:
----------------------------------------------------------------------
- Coastal Environment & Bondi Landmarks:
  * Construct a 3D coastal environment featuring golden sand dunes, the iconic Bondi Icebergs pool structure, headland cliffs, and a skybox with dynamic sunlight.
- Procedural Breaking Wave Shader:
  * Render swelling and curling ocean waves using vertex shaders driven by Gerstner wave superposition equations.
  * Particle emitters for wave crest foam spray, water droplets, and shore break white water.
- Surfboard Rail Physics & Hydrodynamic Lift:
  * Controllable surfboard mesh responding to user input (WASD / Arrow keys for carving left/right, leaning back for speed, and trimming down the wave face).
  * Physics math: Dynamic buoyancy calculation sampling wave height at the board's tail and nose, acceleration based on wave slope steepness, and rail friction during sharp turns.

----------------------------------------------------------------------
2. SURFING GAMEPLAY & TRICK SCORING LOOP:
----------------------------------------------------------------------
- Wave Riding & Barrel Tube Mechanics:
  * "In the Tube" Zone: Reward bonus multiplier points when riding deep inside the curling wave barrel.
  * Aerial Launch & Landings: Speed off the lip of the wave to launch into mid-air, timing board rotation for clean landings.
- Weather & Swell Preset Toggles:
  * Presets: "☀️ Sunny Bondi 3-Foot Glassy", "🌊 Stormy 8-Foot South Swell", and "🌅 Golden Hour Sunset Chill".
- Web Audio API Sound Synthesizer:
  * Synthesize ocean swell crashes, water spray hiss, board carving slicing sounds, coastal wind, and gull calls.

----------------------------------------------------------------------
3. DATA PERSISTENCE & FILE EXPORT/IMPORT:
----------------------------------------------------------------------
- Browser Storage: Store longest wave ride duration, top trick scores, total distance surfed, and unlocked surfboard designs in browser localStorage.
- Local File Export/Import Sync:
  * "💾 Save Surf Session": Downloads 'bondi_surf_save.json'.
  * "📂 Load Session File": Restores career statistics and unlocked gear across any device.

----------------------------------------------------------------------
4. UI / UX DESIGN SYSTEM:
----------------------------------------------------------------------
- Theme: Coastal Bondi Aquamarine & Gold UI (translucent glassmorphic telemetry overlay for Wave Height, Speed in Knots, Lean Angle, and live Trick Multiplier).

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `Bondi Surf 3D: Hydrodynamic Wave & Ocean Simulator`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/bondi-surf-3d-hydrodynamic-wave-simulator>
