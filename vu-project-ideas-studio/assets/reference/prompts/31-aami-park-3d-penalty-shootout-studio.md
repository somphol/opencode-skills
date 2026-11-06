---
id: aami-park-3d-penalty-shootout-studio
title: "AAMI Park 3D: Penalty Shootout Studio"
track: Simulation & Vehicles
order: 31
words: 375
live: null
---

# AAMI Park 3D: Penalty Shootout Studio

> AAMI Park penalties with weather, curve and goalkeeper AI.

**Track:** Simulation & Vehicles · **Brief size:** S · **Words:** 375 · **Read:** ~2 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this AAMI Park 3D: Penalty Shootout Studio project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application named "AAMI Park 3D: Stadium Match Day & Penalty Shootout Studio" using vanilla HTML5, CSS3, ES6 JavaScript, Three.js (via CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js with OrbitControls), and Cannon.js physics engine (via CDN: https://cdnjs.cloudflare.com/api/libs/cannon.js/0.6.2/cannon.min.js).

The application must render an interactive 3D sports stadium featuring Melbourne's iconic AAMI Park geodesic bio-frame dome roof, realistic soccer/rugby penalty kick physics, dynamic goalkeeper AI, Melbourne weather simulation ("Four Seasons in One Day"), synthesized crowd audio, and local progress JSON export/import.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. 3D STADIUM ARCHITECTURE & ENVIRONMENT:
----------------------------------------------------------------------
- AAMI Park Geodesic Mesh Architecture:
  * Construct a 3D stadium environment featuring the distinctive bio-frame dome roof structure, surrounding spectator stands, goal posts, net geometry, and textured green pitch grass.
  * Dynamic Lighting: Stadium floodlight beams casting dramatic shadows on the pitch.
- Melbourne Weather Simulation System:
  * Dynamic weather toggles: "☀️ Sunlit Match", "🌧️ Four Seasons Rain & Wind", and "🌌 Night Game Under Floodlights".
  * Weather physics impact: Rain increases pitch sliding/friction while wind vectors curve ball trajectories in mid-air.

----------------------------------------------------------------------
2. PENALTY SHOOTOUT PHYSICS & GAMEPLAY LOOP:
----------------------------------------------------------------------
- Drag-and-Swipe / Key Kick Mechanics:
  * Aim Target: Interactive target reticle on the goal frame.
  * Curve & Power Gauge: Control strike power and apply spin (Magnus effect curve) to bypass the wall and goalkeeper.
- Goalkeeper AI State Machine:
  * Reactive goalkeeper unit that calculates shot trajectory upon strike, diving left/right/top-corner or holding center to make saves.
- Web Audio API Stadium Synthesizer:
  * Synthesize realistic crowd cheers, whistle blows, ball kick impacts, crossbar thuds, and goal celebrations.

----------------------------------------------------------------------
3. DATA PERSISTENCE & FILE EXPORT/IMPORT:
----------------------------------------------------------------------
- Browser Storage: Save high score streaks, goal conversion percentages, and stadium trophy unlocks in browser localStorage.
- Local File Sync:
  * "💾 Save Match Stats": Downloads 'aami_park_save.json'.
  * "📂 Load Match Stats": Restores career shootout records across any device.

----------------------------------------------------------------------
4. UI / UX DESIGN SYSTEM:
----------------------------------------------------------------------
- Theme: High-Energy Stadium Sports UI (stadium green and electric gold accents, glassmorphic HUD overlays, live scoreboard, responsive layout).

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `AAMI Park 3D: Stadium Match Day & Penalty Shootout Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/aami-park-3d-penalty-shootout-studio>
