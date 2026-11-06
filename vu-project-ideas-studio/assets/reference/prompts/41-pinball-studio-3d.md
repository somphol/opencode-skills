---
id: pinball-studio-3d
title: "Pinball Studio 3D"
track: Games & Arcade
order: 41
words: 367
live: null
---

# Pinball Studio 3D

> A classic pinball cabinet with flippers, slingshots and high scores.

**Track:** Games & Arcade · **Brief size:** S · **Words:** 367 · **Read:** ~2 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Pinball Studio 3D project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application named "Pinball Studio 3D" using vanilla HTML5, CSS3, ES6 JavaScript, Three.js (via CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js), and Cannon.js physics engine (via CDN: https://cdnjs.cloudflare.com/ajax/libs/cannon.js/0.6.2/cannon.min.js).

The application must render an interactive 3D pinball table with realistic rigid-body physics, spring-loaded plunger launching, flipper controls, score multipliers, animated neon bumpers, and local high score progress export/import.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. 3D GRAPHICS & RIGID-BODY PHYSICS ENGINE:
----------------------------------------------------------------------
- Inclined Table Geometry: Construct a glass-topped inclined pinball cabinet table using Three.js meshes synced to Cannon.js static box/plane colliders.
- Chrome Pinball Physics: A shiny metallic sphere (Cannon.js Sphere body with zero friction and high restitution bounce).
- Spring Plunger: Pull-and-release plunger mechanism using keyboard (Spacebar) or UI touch drag, applying upward linear impulse to the ball.
- Dual Flippers: Left (Z / Left Arrow) and Right (/ / Right Arrow) physics flippers rotating around revolute pivot joints with high angular speed upon keypress.

----------------------------------------------------------------------
2. TABLE PLAYFIELD & ARCADE FEATURES:
----------------------------------------------------------------------
- Neon Bumpers & Lights: 3 circular top bumpers that flash neon colors (point lights + scale pulse animation) and launch the ball outwards with impulse physics upon contact.
- Targets & Slingshots: Triangular side slingshots above flippers, drop targets, and curved wire ramps that guide ball trajectories.
- Arcade HUD & Audio Mechanics:
  * Live Score & Multiplier Display (e.g., 2x, 5x score streak).
  * Balls Remaining Counter (3 balls per game).
  * Web Audio API synthesized arcade sound effects (flipper launch, bumper hit, tilt warning, game over chime).

----------------------------------------------------------------------
3. DATA PERSISTENCE & FILE EXPORT/IMPORT:
----------------------------------------------------------------------
- High Score Storage: Automatically save top scores and high score leaderboards in browser localStorage.
- Local File Export/Import Sync:
  * "💾 Save High Score" button (downloads 'pinball_high_scores.json').
  * "📂 Load Scores" button allowing users to restore or sync game records across devices.

----------------------------------------------------------------------
4. UI / UX DESIGN SYSTEM:
----------------------------------------------------------------------
- Theme: Retro Arcade Synthwave UI (dark cabinet surround, glowing neon borders, glassmorphic HUD panel, responsive canvas sizing).

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `Pinball Studio 3D`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/pinball-studio-3d>
