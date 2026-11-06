---
id: cute3d-procedural-code-only-animal-studio
title: "Cute3D: Procedural Code-Only Animal Studio"
track: Creative Studios
order: 1
words: 1095
live: null
---

# Cute3D: Procedural Code-Only Animal Studio

> Build seven original animals from spheres and capsules, then dress them in live fur and wind.

**Track:** Creative Studios · **Brief size:** L · **Words:** 1,095 · **Read:** ~5 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Cute3D: Procedural Code-Only Animal Studio project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application
named "Cute3D: Procedural Code-Only Animal Studio" using vanilla HTML5,
CSS3, ES6 JavaScript, and Three.js (loaded via CDN).

======================================================================
PROJECT BACKGROUND, INTELLECTUAL PROPERTY & ORIGINALITY:
======================================================================
This application is a 100% code-only, zero-asset 3D character viewer.
It constructs cute, low-poly / smooth-shaded 3D animal characters entirely
out of procedural Three.js primitives (Spheres, Capsules, Cylinders, and
Extrusions)—requiring zero external 3D asset downloads (.gltf/.obj).

CRITICAL LEGAL & CREATIVE MANDATE (ORIGINALITY & COPYRIGHT COMPLIANCE):
- All character designs, geometry compositions, color palettes, naming,
  and aesthetic details MUST BE 100% ORIGINAL and generically stylized.
- DO NOT use, replicate, or resemble any trademarked or copyrighted third-party
  IP, commercial mascots, or recognizable brand characters (e.g., Sanrio/Hello
  Kitty, Pokémon, Disney, Animal Crossing, Line Friends, etc.).
- Ensure all visual proportions, facial features, and accessory meshes are
  generically designed from scratch using first-principles geometry to avoid
  any legal copyright infringement.

======================================================================
1. 3D RENDERER, LIGHTING & CAMERA SETUP (THREE.JS)
======================================================================
- Atmospheric Cute Studio Environment:
  * Soft pastel clay-like background gradient.
  * Three.js WebGLRenderer with PCFSoftShadowMap enabled, antialiasing, and
    smooth window resizing.
  * Soft Lighting Rig: Warm Directional Light casting gentle shadows, paired with
    a HemisphereLight (sky/ground colors) for a toy-like, studio-photographed feel.
- Interactive Camera:
  * OrbitControls with smooth damping (inertia) and restricted vertical angle
    to keep focus centered on the active cute character.

======================================================================
2. PROCEDURAL 3D ANIMAL CHARACTER MODELS (100% CODE-ONLY & ORIGINAL)
======================================================================
Include a character selector dropdown featuring 4 distinct, original code-built
animal models:

1. 🧸 Original Chibi Bear / Panda:
   - Rounded head and chubby body using squished Spheres / Capsules.
   - Generic button eyes (small glossy black spheres), blush cheeks (pink disks),
     curved snout, and little rounded ears.
2. 🐰 Original Cute Bunny:
   - Long, floppy procedural ears built from scaled Capsules.
   - Tiny twitching nose, fluffy tail, and pastel inner-ear accents.
3. 🐧 Original Rounded Penguin:
   - Egg-shaped body mesh with a white belly patch, tiny wing flippers,
     a small orange beak, and waddling feet.
4. 🐕 Original Shiba Inu:
   - Perky triangular ears, curled tail, white chest patch, and happy eyes.

======================================================================
3. PROCEDURAL ANIMATIONS & INTERACTIVE STATES
======================================================================
- Idle Animations (Continuous Loop):
  * Idle Breathe: Subtle scale pulsing on the chest/belly mesh.
  * Idle Float / Bounce: Gentle vertical floating motion (y=(t)).
  * Blink Cycle: Eyes briefly scale down to zero on the Y-axis every few seconds.
  * Ear Wiggle: Gentle rotational oscillation on ear meshes.
- Interactive Click / Tap Reactions:
  * Clicking/tapping the 3D character triggers a happy jump/spin animation with
    a procedural Web Audio API "boing" / chime sound effect!
- Pose / Expression Selector Panel:
  * Toggle expressions: [Happy 😊], [Sleepy 😴], [Curious 🤔], [Wiggle 🐾].

======================================================================
4. CUSTOMIZER HUD, AUDIO & BILINGUAL UI
======================================================================
- Color & Accessory Customizer:
  * Color Pickers: Change Main Fur Color, Belly Color, and Cheek Blush Color live.
  * Toggleable Original Accessories: Generic code-built Bowtie, Party Hat, or Glasses.
- Procedural Web Audio API Sound Effects:
  * Synthesize cute mechanical chimes, happy boings, and soft blinks directly
    in code—zero audio files required.
- Language Switcher (EN ⇄ TH Toggle):
  * Translates all character names, expression controls, and customizer panels
    between English and Thai (ภาษาไทย).
- Local Data Persistence & Export:
  * Save custom animal color presets to browser localStorage.
  * "📷 Take Snapshot PNG" button to download high-res transparent PNGs of
    the active 3D character.

======================================================================
OUTPUT FORMAT REQUIREMENT
======================================================================
Provide the complete source code clearly divided into three code
blocks labeled:
- index.html
- style.css
- script.js

=========

TASK: Upgrade/Build the 3D fur rendering and physics engine for the fluffy creature app
using WebGL / Three.js. Focus strictly on achieving ultra-dense volumetric fur and
physically accurate wind dynamics that react to directional vectors and turbulence.

======================================================================
1. VOLUMETRIC FUR RENDERING ENGINE (SHELL-TEXTURING TECHNIQUE)
======================================================================
Do not use a simple solid mesh or basic particle system. Implement Shell-Based
Fur Rendering (Multi-Layer Alpha Shells) to achieve dense, soft fluff:

- Layer Generation:
  * Generate 30 to 50 concentric, semi-transparent mesh shells extruded outward along
    the body surface normals.
  * Extrusion height scale: Outer shell at 100% max fur length, inner shell at 0% (skin).
- Procedural Noise Hair Strand Texture:
  * In the Fragment Shader, sample a high-frequency 2D Simplex/Perlin noise texture (or 3D noise).
  * Apply a sharp alpha threshold per shell: Shells closer to the tip (outer layers) have
    smaller, isolated dot alpha cutouts, forming individual tapering hair strands.
  * Shells closer to the base (inner layers) have wider alpha coverage, creating dense under-fur.
- Subsurface Scattering & Ambient Occlusion (AO):
  * Darken the ambient lighting color near the roots (inner shells) and brighten towards
    the strand tips to simulate self-shadowing (Fur AO).
  * Add Rim Lighting and Fresnel reflection to make the outer hair fibers catch light softly.

======================================================================
2. REAL-TIME WIND PHYSICS & STRAND DISPLACEMENT (VERTEX SHADER)
======================================================================
Implement dynamic, physically bounded fur sway in the Custom Vertex Shader:

- Wind Vector Calculation:
  * Pass uniform variables: `uWindDirection` (vec3), `uWindSpeed` (float), `uTime` (float),
    and `uWindTurbulence` (float).
  * Compute a dynamic wind force vector combining base velocity with 3D Perlin Noise
    to simulate gusts and swirling micro-breezes.
- Layer-Based Displacement (Non-Linear Quadratic Curve):
  * Calculate displacement factor `h = (current_shell_index / total_shells)^2`.
  * Root vertices (h = 0) remain pinned to the body mesh (zero displacement).
  * Strand tips (h = 1) displace maximally in the direction of the wind vector.
- Restoring Force & Stiffness Constraints (Arc Preservation):
  * To prevent fur from stretching unnaturally like rubber, apply an arc-preservation
    correction factor: as the strand tip bends downstream in the wind direction,
    pull its height slightly down toward the skin normal.
  * Calculate alignment dot product: `dot(surfaceNormal, windDirection)`. Fur on the windward
    side flattens slightly against the body, while fur on the leeward side lifts and flutters.

======================================================================
3. INTERACTIVE TOUCH / CURSOR DISTURBANCE
======================================================================
- Pass mouse/touch raycast impact coordinates `uTouchPos` (vec3) and `uTouchRadius` (float).
- Calculate distance from hair vertex to touch point. Apply a localized radial force
  pushing the fur strands away from the cursor (simulating petting or pushing through fur).

======================================================================
4. HUD PARAMETER TUNING CONTROLS
======================================================================
Expose real-time UI sliders to calibrate the physics engine:
- Shell Count (16 to 64 layers)
- Fur Length & Strand Density
- Fur Stiffness / Restoring Tension
- Wind Speed, Turbulence Noise Frequency, and Gust Strength
- Directional Wind Compass / Vector Picker

======================================================================
OUTPUT DELIVERABLE
======================================================================
Provide the complete custom Vertex Shader (`furVS`), Fragment Shader (`furFS`),
and JavaScript Three.js initialization code implementing multi-shell extrusion
and wind uniforms.
````

---

Source label in the supplied list: `Cute3D: Procedural Code-Only Animal Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/cute3d-procedural-code-only-animal-studio>
