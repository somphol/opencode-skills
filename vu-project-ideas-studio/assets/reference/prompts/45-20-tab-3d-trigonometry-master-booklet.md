---
id: 20-tab-3d-trigonometry-master-booklet
title: "20-Tab 3D Trigonometry Master Booklet"
track: STEM & Algorithms
order: 45
words: 631
live: null
---

# 20-Tab 3D Trigonometry Master Booklet

> Twenty 3D trig modules, real-world simulators and spaced review.

**Track:** STEM & Algorithms · **Brief size:** M · **Words:** 631 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this 20-Tab 3D Trigonometry Master Booklet project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive web application named "20-Tab 3D Trigonometry Master Booklet & SRS Learning Studio" using vanilla HTML5, CSS3, ES6 JavaScript, and Three.js (via CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js with OrbitControls).

The application must feature static read-only compatibility (for GitHub Pages), 20 interactive 3D WebGL modules interwoven with real-world engineering simulators, generative exercises, and a Spaced Repetition System (SRS) tracking timestamps, review counts, and file-based progress export/import.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. SPACED REPETITION ENGINE & FILE EXPORT/IMPORT SYSTEM:
----------------------------------------------------------------------
- Track Metadata Per Tab (Tabs 01 - 20):
  * `status`: "New" (default), "Practicing", or "Mastered".
  * `lastReviewed`: ISO timestamp string automatically recorded upon completing an exercise or review.
  * `reviewCount`: Integer tracking how many times the user has revisited and completed exercises for that topic.
  * `nextReviewDue`: Target ISO timestamp calculated via expanding SRS intervals:
    - Level 1 (New / 1st review): +1 day
    - Level 2 (Practicing / 2nd-3rd review): +3 days
    - Level 3 (Reinforcing / 4th-5th review): +7 days
    - Level 4 (Mastered / 6+ reviews): +30 days
- Smart Review Filter ("Due Today 🔔"): Top filter button that highlights tabs whose `nextReviewDue` timestamp is less than or equal to the current system date.
- File Export/Import Controls:
  * "💾 Save Progress File": Serializes state object (tab statuses, timestamps, review counts, total score) and downloads 'trig_srs_progress.json'.
  * "📂 Load Progress File": HTML file input that parses uploaded JSON files, instantly restoring user progress and timestamps in browser localStorage across any device.

----------------------------------------------------------------------
2. 20 INTERWOVEN MODULE SPECIFICATIONS:
----------------------------------------------------------------------
Each tab MUST contain a responsive split layout:
- Left View: Interactive Three.js 3D Viewport with OrbitControls (cyan for cosine, magenta for sine, yellow for tangent/vectors).
- Right View: Live HUD readouts + Real-World Simulator Controls + Generative Interactive Exercise with instant feedback, solution breakdown, and review count tracker.

Tab Curriculum Map:
- TAB 01: Angles & Rotations ➔ Robotic Arm Pick-and-Place Simulator
- TAB 02: Radians vs. Degrees ➔ Vehicle Speedometer & Tire RPM Calculator
- TAB 03: SOH CAH TOA Basics ➔ Skyscraper Clinometer Height Estimator
- TAB 04: Reciprocal Ratios ➔ Optical Refraction & Lens Design (Snell's Law)
- TAB 05: Inverse Trig Functions ➔ Wheelchair Ramp Incline Safety Inspector
- TAB 06: 3D Unit Circle ➔ Video Game Character Joystick Motion Engine
- TAB 07: ASTC Quadrants ➔ Air Traffic Control Radar Target Finder
- TAB 08: Special Right Triangles ➔ Roof Truss Timber Construction Calculator
- TAB 09: Unrolling Sine ➔ AC Electrical Generator Voltage Simulator
- TAB 10: Unrolling Cosine ➔ Clock Pendulum Horizontal Motion Tracker
- TAB 11: Tangent & Asymptotes ➔ Lighthouse Shoreline Beam Projection
- TAB 12: Wave Amplitude & Period ➔ Radio Station Signal Tuner (AM/FM)
- TAB 13: Phase Shift ➔ Active Noise Cancellation (ANC) Sound Wave Eliminator
- TAB 14: Law of Sines ➔ River Width Land Surveying Triangulator
- TAB 15: Ambiguous Case (SSA) ➔ Coast Guard Ship Interception Simulator
- TAB 16: Law of Cosines ➔ Aviation Distance & Wind Drift Calculator
- TAB 17: Pythagorean Identity ➔ 3D Graphics Shader & Surface Lighting Normalizer
- TAB 18: Double Angle Formulas ➔ Projectile Cannon Trajectory Maximizer
- TAB 19: 3D Vectors & Cross Products ➔ Solar Panel Sun-Tracking Alignment Engine
- TAB 20: Spherical Coordinates ➔ GPS Satellite & Flight Path Global Navigator

----------------------------------------------------------------------
3. UI / UX DESIGN SYSTEM:
----------------------------------------------------------------------
- Theme: High-tech STEM Laboratory Dark UI (navy/slate background, glassmorphism card overlays, glowing neon 3D meshes).
- Navigation Header: Scrollable 20-tab bar with live completion badges (🟢 Mastered, 🟡 Review Due, 🔴 New) and global SRS progress summary.

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `3D Trigonometry Master Booklet`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/20-tab-3d-trigonometry-master-booklet>
