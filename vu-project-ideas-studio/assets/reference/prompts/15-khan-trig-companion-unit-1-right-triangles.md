---
id: khan-trig-companion-unit-1-right-triangles
title: "Khan Trig Companion: Unit 1 Right Triangles"
track: STEM & Algorithms
order: 15
words: 726
live: null
---

# Khan Trig Companion: Unit 1 Right Triangles

> SOH-CAH-TOA, special triangles and reciprocal ratios.

**Track:** STEM & Algorithms · **Brief size:** L · **Words:** 726 · **Read:** ~4 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Khan Trig Companion: Unit 1 Right Triangles project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive educational web application named "Khan Trig Companion: Unit 1 Right Triangle Studio" using vanilla HTML5, CSS3, ES6 JavaScript, and HTML5 Canvas.

======================================================================
PROJECT BACKGROUND & PEDIGREE:
======================================================================
This application is part of an open-source digital math booklet series modeled strictly after the Khan Academy Trigonometry curriculum (Unit 1: Right Triangles & Trigonometry). Its purpose is to serve as an active visual companion where students manipulate shapes, test ratios, and build deep intuitive recall rather than passively reading equations. It runs entirely client-side with zero external frameworks and is optimized for GitHub Pages deployment.

======================================================================
1. PEDAGOGICAL & VISUAL DUAL-CODING SYSTEM
======================================================================
- Synchronized Color-Coding Matrix:
  * Hypotenuse (c): Neon Cyan (#00E5FF)
  * Opposite (a): Vivid Coral (#FF5722)
  * Adjacent (b): Electric Emerald (#00E676)
  * Angle (θ): Golden Yellow (#FFD600)
- Typography & Formulas:
  * All mathematical expressions must use clean, crisp LaTeX-style visual formatting with dynamic numerical replacements that update in real time as the student interacts with the canvas.

======================================================================
2. MODULE ARCHITECTURE (4 CORE INTERACTIVE PLAYGROUNDS)
======================================================================

Provide a top navigation tab bar allowing seamless switching between 4 distinct learning modules:

----------------------------------------------------------------------
MODULE 1: SOH-CAH-TOA & RATIO CONSTANCY EXPLORER
----------------------------------------------------------------------
- Pedagogical Goal: Prove to students that sine, cosine, and tangent depend ONLY on the angle θ, regardless of how large or small the triangle is scaled.
- Canvas Components:
  * Interactive Right Triangle with draggable vertices (Vertex A at top, Vertex B at right angle, Vertex C with angle θ).
  * Dual Control Sliders:
    1. Angle Slider (θ: 5° to 85°, default 30°).
    2. Scale/Zoom Slider (Multiplier: 0.5× to 2.5×).
- Real-Time Live Readout Panel:
  * Displays Side Lengths (a, b, c).
  * Displays Ratio Equations side-by-side with exact calculated decimals (4 decimal places):
    - sin(θ) = Opp / Hyp = a / c
    - cos(θ) = Adj / Hyp = b / c
    - tan(θ) = Opp / Adj = a / b
  * Visual Highlight Box: When the user moves the Scale Slider, show a prominent visual badge stating: "Triangle size changed, but ratios remain 100% CONSTANT!"

----------------------------------------------------------------------
MODULE 2: SPECIAL RIGHT TRIANGLES (30°-60°-90° & 45°-45°-90°)
----------------------------------------------------------------------
- Pedagogical Goal: Help students master exact radical side relationships without relying on calculators.
- Controls & Canvas:
  * Radio Button Selector: Switch between [45°-45°-90° Isosceles] and [30°-60°-90° Scalene].
  * Base Variable Slider (x: 1 to 20).
- Dynamic Canvas Labels:
  * For 45°-45°-90°: Label sides as x, x, and x√2. Display exact calculated value alongside radical form.
  * For 30°-60°-90°: Label short leg as x, long leg as x√3, and hypotenuse as 2x.

----------------------------------------------------------------------
MODULE 3: RECIPROCAL RATIOS & DUALITY INSPECTOR
----------------------------------------------------------------------
- Pedagogical Goal: Demystify cosecant (csc), secant (sec), and cotangent (cot) by linking them directly to their primary counterparts.
- Display Layout:
  * 3 Side-by-Side Comparison Cards:
    Card 1: sin(θ) ↔ csc(θ) = 1/sin(θ) = Hyp/Opp
    Card 2: cos(θ) ↔ sec(θ) = 1/cos(θ) = Hyp/Adj
    Card 3: tan(θ) ↔ cot(θ) = 1/tan(θ) = Adj/Opp
  * Dragging the central angle slider updates all 6 ratios simultaneously with visual warning badges if tangent or cotangent hits undefined states.

----------------------------------------------------------------------
MODULE 4: KHAN PRACTICE SANDBOX & STEP-BY-STEP SOLVER
----------------------------------------------------------------------
- Pedagogical Goal: Leverage the testing effect for active memory retrieval.
- Problem Generator Modes:
  1. "Find the Ratio" (e.g., given side lengths, find sin/cos/tan).
  2. "Solve for Missing Side" (e.g., given angle and hypotenuse, solve for opposite).
  3. "Real-World Story Problem" (e.g., ladder angle, building shadow height).
- Interactive Features:
  * Input field for student answer with "Check Answer" button.
  * "💡 Show Step-by-Step Visual Solution" button: Animates the algebraic step-by-step substitution on screen.
  * Score Streak Counter & Mastery Badge System.

======================================================================
3. BILINGUAL HUD, ACCESSIBILITY & LOCAL DATA PERSISTENCE
======================================================================
- Language Switcher (Header Button: EN ⇄ TH):
  * Toggles all UI text, instructions, formula labels, and story problems seamlessly between English and Thai (ภาษาไทย).
  * Phonetic Thai Math Terminology:
    - Sine → ไซน์ (sin)
    - Cosine → โคไซน์ (cos)
    - Tangent → แทนเจนต์ (tan)
    - Hypotenuse → ด้านตรงข้ามมุมฉาก
    - Opposite → ด้านข้าม
    - Adjacent → ด้านชิด
- Local Storage & Export Engine:
  * Saves streak records, completed practice modules, and student settings to browser localStorage.
  * "💾 Export Progress JSON" downloads khan_trig_unit1_progress.json.

======================================================================
OUTPUT FORMAT REQUIREMENT
======================================================================
Provide the complete source code clearly divided into three code blocks labeled:
- index.html
- style.css
- script.js
````

---

Source label in the supplied list: `Khan Trig Companion: Unit 1 Right Triangle Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/khan-trig-companion-unit-1-right-triangles>
