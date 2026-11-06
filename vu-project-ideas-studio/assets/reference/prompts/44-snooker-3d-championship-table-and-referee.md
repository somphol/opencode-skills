---
id: snooker-3d-championship-table-and-referee
title: "Snooker 3D: Championship Table & Referee"
track: Games & Arcade
order: 44
words: 452
live: null
---

# Snooker 3D: Championship Table & Referee

> A full 22-ball snooker table with spin, fouls and referee scoring.

**Track:** Games & Arcade · **Brief size:** M · **Words:** 452 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Snooker 3D: Championship Table & Referee project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D Snooker Game using HTML5, CSS3, ES6 JavaScript, Three.js (3D rendering), and Cannon.js (3D physics).

The game must run smoothly in static read-only environments like GitHub Pages and feature full 22-ball snooker setup, realistic cue mechanics, spin control, referee scoring rules, and local stats file export/import.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. ARCHITECTURE & LIBRARIES (CDN IMPORT):
----------------------------------------------------------------------
- Three.js: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
- OrbitControls: https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js
- Cannon.js (Physics): https://cdnjs.cloudflare.com/ajax/libs/cannon.js/0.6.2/cannon.min.js

----------------------------------------------------------------------
2. GAMEPLAY & PHYSICS MECHANICS:
----------------------------------------------------------------------
- 22-Ball Snooker Table Setup:
  * Render a full 12ft x 6ft snooker table with green baize cloth, mahogany wood frame, brass pocket rims, and 6 pocket drop holes.
  * Rack 15 Red balls in a triangle, and position the 6 Colors (Yellow, Green, Brown on Baulk D-line; Blue in center; Pink at apex; Black on black spot).
- Cue Aiming & Orbit Controls:
  * Smooth 3D camera controls: Orbit around table OR lock behind cue ball for precision aiming.
  * Dynamic ghost aiming line projecting path of white ball and target ball.
- Cue Power & Spin Controls:
  * Cue Power Slider / Hold-to-Charge stroke meter (0 to 100%).
  * Interactive Cue Ball Tip Contact Grid: Allow players to drag a dot on a 2D cue ball cross-section to apply Topspin (Follow), Backspin (Screw), and Left/Right Sidespin (English).
- Physics Simulation:
  * Cannon.js rigid body spheres with rolling friction, cloth resistance, cushion bounce elasticity, and realistic sphere-sphere momentum transfer.
  * Pocket trigger zones that detect potted balls, play sound effects/animations, and route balls out of play.

----------------------------------------------------------------------
3. REFEREE & SCORE ENGINE:
----------------------------------------------------------------------
- Rule Checking Engine:
  * Tracks target ball sequence (Must hit Red first, then alternating Color, then clearance order when all Reds are potted).
  * Automatically detects fouls (scratching cue ball, wrong ball hit first, missing all balls) and awards penalty points (4-7 points) to opponent.
- Scoreboard HUD:
  * Player 1 vs. Player 2 / AI opponent scores.
  * Current Break counter (tracking total points scored in single turn, up to maximum 147 break).
- Local Stats Export/Import:
  * Track high breaks, total wins, and total potted balls in localStorage.
  * "💾 Export Game Data" button (downloads 'snooker_3d_stats.json') and "📂 Import Game Data" button to restore stats across devices.

----------------------------------------------------------------------
4. UI / UX DESIGN SYSTEM:
----------------------------------------------------------------------
- Theme: Elegant Snooker Club aesthetic (dark mahogany and brass accents, high-contrast HUD cards, smooth green power meters).
- Control Panels: Sleek overlay panels for aiming elevation, spin selection, power charge, and score overview.

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `Snooker Game (3D)`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/snooker-3d-championship-table-and-referee>
