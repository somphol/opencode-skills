---
id: full-3d-15-puzzle-studio-and-auto-solver
title: "Full 3D 15-Puzzle Studio & Auto-Solver"
track: Puzzles & Strategy
order: 8
words: 535
live: null
---

# Full 3D 15-Puzzle Studio & Auto-Solver

> A tactile 4x4 sliding puzzle with a parity-safe shuffle and A* solver.

**Track:** Puzzles & Strategy · **Brief size:** M · **Words:** 535 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Full 3D 15-Puzzle Studio & Auto-Solver project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D 15-Puzzle web
application named "Full 3D 15-Puzzle Studio & Auto-Solver" using vanilla
HTML5, CSS3, ES6 JavaScript, and Three.js (loaded via CDN).

======================================================================
PROJECT BACKGROUND & PEDIGREE:
======================================================================
This application is part of an open-source digital educational game series
modeled after interactive 3D puzzle sandboxes and solver studios. Its
purpose is to combine smooth 3D tactile tile mechanics with an algorithm
visualizer (A* Search with Manhattan Distance heuristic) that can solve
any solvable puzzle state step-by-step. It runs entirely client-side
with zero external framework dependencies or backend requirements and is
optimized for GitHub Pages deployment.

======================================================================
1. 3D RENDERER, CAMERA & TILES (THREE.JS)
======================================================================
- Scene & Camera Setup:
  * Initialize a Three.js WebGLRenderer with soft shadows enabled,
    adaptive window resizing, and a dark studio gradient background.
  * Implement OrbitControls allowing users to rotate, pan, and zoom around
    the 3D puzzle frame (with angle bounds preventing camera flipping).
- 3D Board & Tiles:
  * Render a 4x4 recessed wooden or metallic tray casing.
  * Render 15 individual 3D bevel-edged tiles (numbered 1 through 15) and
    1 empty slot space.
  * Tile Aesthetics: Sleek tactile bevels, clean surface numbers, and drop
    shadows into the frame base.
  * Custom Image Skins: Provide a dropdown selector to switch tile faces
    between [Classic Numbers], [Wood Grain], [Marble], and an option to
    [Upload Custom Image] sliced dynamically across the 4x4 grid texture.

======================================================================
2. TILE MECHANICS & SOLVABILITY ENGINE
======================================================================
- Interaction & Motion:
  * Click/Tap or Raycast on any tile adjacent to the empty slot to trigger
    a smooth linear interpolation (Lerp) sliding animation into the gap.
  * Keyboard Controls: Arrow keys move the adjacent tile into the gap.
- Solvability Guard:
  * Implement a random shuffle feature that GUARANTEES solvability by
    checking the inversion count rule for 4x4 grid sizes (checking row index
    of the empty slot relative to total inversion parity).

======================================================================
3. INTEGRATED A* AUTO-SOLVER & HEURISTIC VISUALIZER
======================================================================
- Auto-Solver Engine:
  * Implement an A* (A-Star) search algorithm using Manhattan Distance
    + Linear Conflicts heuristic to compute the optimal shortest solution path.
- Solver Controls HUD:
  * "🤖 Auto-Solve" button: Executes the solution path automatically with a
    speed control slider (Slow 1x to Fast 5x).
  * "⏯️ Step-by-Step Hint": Highlights the exact next tile to click and
    displays an overlay arrow pointing toward the empty slot.
- Heuristic Visualizer:
  * Displays real-time statistics: Current Manhattan Distance cost (h),
    Moves Elapsed (g), and Total Solution Steps Remaining.

======================================================================
4. BILINGUAL HUD, AUDIO & LOCAL DATA PERSISTENCE
======================================================================
- Sound Effects:
  * Synthesized Web Audio API sound effects for tile sliding clicks,
    tray thuds, and victory fanfares (zero external audio dependencies).
- Move Counter & Timer:
  * Live HUD showing total moves made and elapsed solving time.
- Language Switcher (EN ⇄ TH Toggle):
  * Instantly translates all UI buttons, solver status messages, and
    instructions between English and Thai (ภาษาไทย).
- Local Storage & Export Engine:
  * Auto-saves best time records and move streaks to browser localStorage.
  * "💾 Export Game JSON" downloads puzzle state and solution history.

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

Source label in the supplied list: `Full 3D 15-Puzzle Studio & Auto-Solver`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/full-3d-15-puzzle-studio-and-auto-solver>
