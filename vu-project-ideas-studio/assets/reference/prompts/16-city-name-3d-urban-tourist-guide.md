---
id: city-name-3d-urban-tourist-guide
title: "[CITY_NAME] 3D: Urban Tourist Guide"
track: Cities & Travel
order: 16
words: 437
live: null
---

# [CITY_NAME] 3D: Urban Tourist Guide

> A city-agnostic 3D tourist guide template with three camera modes.

**Track:** Cities & Travel · **Brief size:** M · **Words:** 437 · **Read:** ~2 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this [CITY_NAME] 3D: Urban Tourist Guide project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application named "[CITY_NAME] 3D: Interactive Urban Tourist Guide & Explorer Studio" using vanilla HTML5, CSS3, ES6 JavaScript, and Three.js (via CDN with OrbitControls, PointerLockControls, and Web Audio API).

The application must serve as a 3D interactive tourist guide for [CITY_NAME]. It must feature an interactive 3D city map with 5 key tourist landmarks, dual navigation modes (Drone City Flyover vs. First-Person Street Walkthrough), an automated Transit Tour loop, a bilingual (EN / Local Language) interactive information drawer, dynamic lighting presets (Day / Golden Hour / Night), spatial Web Audio ambience, and local JSON bookmark exports.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. 3D CITY LANDSCAPE & PROCEDURAL LANDMARKS ENGINE:
----------------------------------------------------------------------
- 3D Urban Grid & Environment:
  * Render a low-poly 3D terrain grid representing [CITY_NAME]'s central geographical axis (e.g., river, coastline, or main avenue).
  * Generate procedurally shaded building blocks, street layouts, trees, ambient traffic particles, and decorative water surfaces.
- 5 Key Landmark Nodes:
  * Place 5 distinct, culturally accurate 3D landmark meshes at their relative geographic positions.
  * Each landmark features a floating, bobbing 3D icon marker that opens an educational guide modal when hovered or clicked.

----------------------------------------------------------------------
2. DUAL NAVIGATION & TRANSIT TOUR MODES:
----------------------------------------------------------------------
Provide 3 switchable camera perspectives via top-bar HUD buttons:
- MODE 1: Drone City Flyover (OrbitControls for 360° pan, tilt, and zoom across the full city skyline).
- MODE 2: First-Person Street Explorer (WASD walking controls with PointerLockControls, ground collision detection, and landmark hotspots).
- MODE 3: Automated Transit Tour (Smooth spline camera animation following the city's transit route—e.g., Skytrain, Tram, or River Boat—stopping automatically at each landmark node).

----------------------------------------------------------------------
3. BILINGUAL HUD, AUDIO & TIME-OF-DAY ENGINE:
----------------------------------------------------------------------
- Language Switcher (EN ⇄ Local Language Toggle in Header):
  * Instantly translates all UI headers, landmark history cards, travel tips (entry fees, dress codes, transit stations), and audio prompts.
- Time-of-Day Lighting Presets:
  * Dynamic skybox and sunlight color transitions: Bright Midday, Sunset / Golden Hour, and Glowing Neon Night.
- Spatial Web Audio API Synthesizer:
  * Synthesizes ambient city background noise (e.g., river lap waves, distant traffic rumble, temple/street chimes) and footstep sounds synchronized with walking speed.

----------------------------------------------------------------------
4. DATA PERSISTENCE & FILE EXPORT:
----------------------------------------------------------------------
- LocalStorage & JSON Export:
  * Saves visited landmarks, custom trip itineraries, and user notes.
  * "💾 Save City Itinerary": Downloads '[city_name]_3d_tour.json'.
  * "📂 Load City Itinerary": Restores saved progress across devices.

----------------------------------------------------------------------
OUTPUT FORMAT REQUIREMENT:
----------------------------------------------------------------------
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `[CITY_NAME] 3D: Interactive Urban Tourist Guide & Explorer Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/city-name-3d-urban-tourist-guide>
