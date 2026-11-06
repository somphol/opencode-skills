---
id: rubiks-cube-3d-solver-and-simulator
title: "Rubik's Cube 3D Solver & Simulator"
track: Puzzles & Strategy
order: 50
words: 498
live: null
---

# Rubik's Cube 3D Solver & Simulator

> A glossy 3D cube with slice turns and an animated solver.

**Track:** Puzzles & Strategy · **Brief size:** M · **Words:** 498 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Rubik's Cube 3D Solver & Simulator project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

Build a complete, production-ready, fully interactive 3D Rubik's Cube game and automated solver in a single self-contained HTML file using HTML5, CSS3, vanilla JavaScript, and Three.js (imported via CDN).

Requirements:

3D Scene Setup & Visual Quality:

Engine: Use Three.js with an interactive OrbitControls camera setup so the user can click and drag in empty space to rotate the view 360 degrees, and scroll to zoom in/out.

Cube Geometry: Construct a 333 matrix of 26 individual sub-cubes (cubelets) separated by clean dark bevel gaps/borders.

Official Palette: Render standard Rubik’s Cube face colors using vibrant materials:

Top: White

Bottom: Yellow

Left: Orange

Right: Red

Front: Green

Back: Blue

Lighting & Atmosphere: Add ambient lighting coupled with two soft directional spotlights to cast subtle specular highlights on the glossy cube surfaces, rendered against a modern dark slate gradient background.

Core Mechanics & Slice Rotations:

Exact Face Turning: Implement accurate math logic to rotate any of the 6 faces (F,B,L,R,U,D) both clockwise and counter-clockwise by 90 degrees.

Smooth Animation: When a turn is triggered, smoothly animate the rotation of the selected 9-cubelet layer over 300 milliseconds using quadratic or cubic easing before re-parenting the cubelets back to the main scene with updated spatial coordinates.

Move History Tracking: Record every executed move in an internal history stack (e.g., ["R", "U'", "F2", "L"]) for undo capabilities and solver step tracking.

User Controls & Interaction Modes:

Click & Drag Face Rotation (Raycasting): Use Three.js Raycaster to allow users to click directly on a cube face and drag in a direction to perform intuitive face turns.

On-Screen Control Dock: Provide a clean glassmorphism UI toolbar with buttons for all standard turns (U,U',D,D',L,L',R,R',F,F',B,B') so users without mouse-drag precision can play effortlessly.

Keyboard Shortcuts: Map standard notation keys (U,D,L,R,F,B) with Shift-key modifiers for prime (counter-clockwise) turns.

Automated Scramble & Solver Engine:

Scramble Function: Include a 'Scramble' button that generates a sequence of 20 randomized, non-redundant standard moves, executing them with rapid, smooth animations while updating the move count.

Step-by-Step AI/Algorithmic Solver:

Include a 'Solve Cube' button that computes the solution sequence from the current state (using a layer-by-layer solver algorithm or BFS/Kociemba-style reduction).

When solved, trigger an animated playback mode that automatically executes the solution step-by-step with adjustable speed controls (Slow, Medium, Fast).

Display the live step notation banner (e.g., 'Executing Step 4 of 14: R U R' U').

Reset Button: Instantly snap the cube back to its pristine solved state.

UI/UX & Sound Enhancements:

Stats & Timer: Include a live HUD showing total moves made, move history log, elapsed timer (starts on first move), and solve status.

Audio Feedback: Synthesize realistic mechanical click sounds during slice rotations using the browser's native Web Audio API (no external audio assets).

Victory Celebration: Trigger a celebratory particle explosion or celebratory camera rotation around the cube when the solved state is achieved!

Ensure the output is entirely self-contained inside one single HTML block with standard <style> and <script> tags so it can be double-clicked and executed immediately in any web browser.
````

---

Source label in the supplied list: `Rubik Cube`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/rubiks-cube-3d-solver-and-simulator>
