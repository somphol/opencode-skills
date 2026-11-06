---
id: us-map-jigsaw-3d
title: "US Map Jigsaw 3D"
track: Puzzles & Strategy
order: 47
words: 453
live: https://somphol.github.io/us-map-jigsaw-3d/
---

# US Map Jigsaw 3D

> A dual-layer US map and capitals jigsaw with 3D snapping.

**Track:** Puzzles & Strategy · **Brief size:** M · **Words:** 453 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this US Map Jigsaw 3D project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

Build a complete, production-ready, interactive 3D United States Map & Capitals Dual-Layer Jigsaw Puzzle game in a single self-contained HTML file using HTML5, CSS3, vanilla JavaScript, and Three.js (imported via CDN).

Requirements:

1. 3D Scene Setup & Tabletop Aesthetics:
   - Engine: Three.js with OrbitControls enabled (left-click drag to rotate scene view, right-click to pan, scroll wheel to zoom).
   - Environment: Set up a rich mahogany or felt studio tabletop scene with soft ambient light and a directional overhead spotlight casting soft shadows.
   - Map Baseplate: Render a central recessed, semi-transparent base plate of the United States displaying thin state border outlines and labeled target slots.

2. Dual-Layer 3D Jigsaw Mechanics:
   - Layer 1 (Extruded State Blocks): Render key extruded 3D state meshes (or poly-block regions like Texas, California, Florida, New York, Illinois, etc.) with distinct color hues. Each state block features a small recessed socket node at its capital's relative coordinate.
   - Layer 2 (3D Capital Pins): Render 3D marker pins/domes floating on a side tray, each clearly labeled with a state capital name (e.g., "Austin", "Sacramento", "Tallahassee", "Albany").

3. Interaction & Raycasting Engine:
   - Drag-and-Drop: Use Three.js Raycaster so players can click and drag state blocks or capital pins across the 3D tabletop plane.
   - 3D Rotation: Pressing the 'R' key or double-clicking while dragging a piece rotates it by 45 degrees along the Y-axis.
   - Dual-Snap System:
     * State Snap: When a state block is dragged within a snap distance of its slot on the US map baseplate, automatically snap it into position with a drop animation.
     * Capital Pin Snap: Capital pins can ONLY be snapped onto a state block that has ALREADY been placed. Snapping the WRONG capital to a state rejects the pin with a quick red flash and shake animation.
   - Audio Synthesis: Use the browser's native Web Audio API to generate realistic mechanical click/snap sounds upon correct placements and a buzz sound for incorrect capital matches.

4. UI Overlay, HUD & Educational Pop-ups:
   - Floating HUD: Include a sleek glassmorphism top panel showing progress counters ("States Placed: X / Total", "Capitals Placed: Y / Total"), a live game timer, and a 'Scramble / Reset' button.
   - State Fact Cards: When a state AND its corresponding capital pin are both placed, pop up a floating educational card displaying quick trivia (State Capital, Estimated Population, and Order of Statehood).

5. Victory Event:
   - When all states and capitals are correctly assembled, trigger a 360-degree victory camera rotation around the glowing, fully assembled 3D US map with particle light effects.

Ensure the output is 100% self-contained in a single code block starting with <!DOCTYPE html> and ending with </html> so it can be saved directly as an .html file.
````

---

Source label in the supplied list: `US Map Jigsaw 3D`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/us-map-jigsaw-3d>
