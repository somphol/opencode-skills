---
id: brickstep-3d-pro-250-piece-assembly-studio
title: "BrickStep 3D Pro: 250-Piece Assembly Studio"
track: Creative Studios
order: 42
words: 357
live: null
---

# BrickStep 3D Pro: 250-Piece Assembly Studio

> A 250-piece brick assembly studio with ghost previews and snapping.

**Track:** Creative Studios · **Brief size:** S · **Words:** 357 · **Read:** ~2 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this BrickStep 3D Pro: 250-Piece Assembly Studio project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive web application named "BrickStep 3D Pro: 250-Piece Lego Assembly Studio" using vanilla HTML5, CSS3, ES6 JavaScript, and Three.js (via CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js with OrbitControls).

The application must support high-performance 250+ piece 3D Lego models using Three.js InstancedMesh / procedural geometry, featuring step-by-step instruction manuals, ghost target previews, snap controls, sub-assembly modules, and local progress JSON export/import.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. HIGH-PERFORMANCE 3D ENGINE (250+ BRICKS @ 60 FPS):
----------------------------------------------------------------------
- Instanced Rendering & Materials: Utilize InstancedMesh or shared geometries/materials to render up to 250 bricks smoothly.
- Stud & Tube Geometry: Create realistic top studs and bottom anti-stud receiving tubes for 2x4, 2x2, 1x4, 1x2 bricks and plates.
- Interactive Viewport: Three.js OrbitControls with shadow mapping, ambient lighting, and baseplate grid alignment.

----------------------------------------------------------------------
2. 250-STEP ASSEMBLY ENGINE & SUB-ASSEMBLY MODULES:
----------------------------------------------------------------------
- Sub-Assembly Navigation: Divide 250-piece builds into manageable sub-assembly modules (e.g., Module 1: Foundation, Module 2: Walls, Module 3: Roof).
- Step Instruction HUD:
  * Progress Bar: Displays "Step X of 250" and active module status.
  * Required Brick Bay: Shows brick type and color required for the current step.
- Interactive Target Guides & Snapping:
  * Glowing semi-transparent ghost preview showing target position/rotation.
  * Raycasted snapping with snap sound effect upon clicking or dragging onto the target studs.
  * Keyboard / UI rotation controls ('R' key) to rotate bricks in 90-degree steps.
- Explode View & Authoring Studio:
  * "💥 Explode View" slider to pull all 250 bricks apart vertically along the Y-axis.
  * "✏️ Authoring Mode": Allows users to build custom 250-piece structures and automatically export the step sequence to JSON.

----------------------------------------------------------------------
3. DATA PERSISTENCE & FILE EXPORT/IMPORT:
----------------------------------------------------------------------
- Browser Memory: Persists current model ID, active step number (1 to 250), and placed brick matrix in localStorage.
- File Export/Import:
  * "💾 Save Progress File": Downloads 'brickstep_pro_250.json'.
  * "📂 Load Progress File": Restores 250-step models and custom builds on any device.

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `BrickStep 3D Pro`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/brickstep-3d-pro-250-piece-assembly-studio>
