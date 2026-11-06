---
id: bts-sukhumvit-line-3d-bangkok-driver-simulator
title: "BTS Sukhumvit Line 3D: Bangkok Driver Simulator"
track: Cities & Travel
order: 18
words: 555
live: null
---

# BTS Sukhumvit Line 3D: Bangkok Driver Simulator

> Bangkok's Sukhumvit Line as a four-view driver simulator.

**Track:** Cities & Travel · **Brief size:** M · **Words:** 555 · **Read:** ~3 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this BTS Sukhumvit Line 3D: Bangkok Driver Simulator project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web simulation named "BTS Sukhumvit Line 3D: Authentic Bangkok City & Driver Simulator" using vanilla HTML5, CSS3, ES6 JavaScript, and Three.js (via CDN with OrbitControls).

The agent should review https://github.com/somphol/tramtracker-2088 for design and functional inspiration—specifically its approach to real-time transit telemetry, station progress tracking, retro/cyberpunk transit HUD aesthetics, and arrival prediction loops. The agent MUST fully adapt these concepts to its own context: Bangkok's elevated BTS Skytrain (Sukhumvit Line: Khu Khot N24 ↔ Kheha E23, 47 stations), replacing streetcar tram mechanics with elevated rail kinematics, third-rail power aesthetics, and Bangkok urban scenery.

Provide the complete source code organized into three distinct modular code blocks: index.html, style.css, and script.js.

----------------------------------------------------------------------
1. DESIGN & INSPIRATION ADAPTATION (tramtracker-2088 Inspiration):
----------------------------------------------------------------------
- Transit Telemetry & Tracking HUD:
  * Adapt the telemetry and station display architecture of 'tramtracker-2088' into a Bangkok BTS Skytrain HUD.
  * Display real-time train speed (km/h), distance to next station (meters), estimated time of arrival (ETA in seconds), upcoming interchange connections (e.g., MRT Blue Line at Asok, ARL at Phaya Thai), and active station zone status.
  * Style the HUD with a crisp, modern transit overlay featuring Bangkok BTS color accents (Light Green #00A651, Dark Green #005A36, and Gold accents).

----------------------------------------------------------------------
2. DEEP URBAN LANDSCAPE & GEOGRAPHIC ACCURACY ENGINE:
----------------------------------------------------------------------
The procedural city generator MUST adjust density, building heights, color palettes, and vegetation based on the active station zone:

- ZONE A: Northern Suburbs (Khu Khot N24 to Ha Yaek Lat Phrao N9)
  * Low-to-medium density 3-4 story shop houses, open skies, wide suburban highways below, and dense tree clusters near Chatuchak Park (N8).
- ZONE B: Central Commercial Core (Mo Chit N8 to Ploenchit E2)
  * Ultra-dense skyscraper canyons (80m-200m building heights), corporate glass towers, multi-tier elevated skywalks underneath the track at Siam (CEN), billboard screens, and the Victory Monument roundabout obelisk (N3).
- ZONE C: Sukhumvit Lifestyle Corridor (Asok E4 to Ekkamai E7)
  * High-rise residential condos, hotels, vibrant neon night signs along Soi side streets, Terminal 21 facade mesh (E4), and Benchasiri Park green oasis (E5).
- ZONE D: Southern Industrial & Coastal Delta (Phra Khanong E8 to Kheha E23)
  * Transition from mid-rise residential to industrial warehouses, factories, flat open coastal plain horizons near Samut Prakan, and the Erawan Elephant statue silhouette (E17).

----------------------------------------------------------------------
3. MULTI-PERSPECTIVE CAMERA CONTROLLER:
----------------------------------------------------------------------
Switchable via HUD buttons or hotkeys (Keys 1, 2, 3, 4):
- VIEW 1 (Driver Cab View): First-person view inside the lead driver cabin looking down the viaduct, displaying windshield wipers, speed dials, signal lights, and incoming station platforms.
- VIEW 2 (Passenger Scenic Window View): Side-window view looking out across the Bangkok city skyline, street traffic, and surrounding skyscrapers.
- VIEW 3 (Free Orbit Camera): 360-degree external camera following the 4-car train.
- VIEW 4 (Station Platform Arrival Cam): Fixed camera positioned on station platforms looking down the track as the train arrives.

----------------------------------------------------------------------
4. TRAIN KINEMATICS, BILINGUAL HUD & AUDIO:
----------------------------------------------------------------------
- Controls: Throttle slider (0–80 km/h), Service Brakes, Emergency Brake, Auto-Pilot, and Door Open/Close buttons.
- Bilingual HUD (EN ⇄ TH Switcher):
  * Live station display (e.g., "Next Station: Siam (CEN) / สถานีต่อไป: สยาม"), distance to next stop in meters, current zone description, and nearby landmark callouts.
- Web Audio API Sound Synthesizer:
  * Variable-pitch electric motor hum, track joint thuds, door chime
````

---

Source label in the supplied list: `BTS Sukhumvit Line 3D: Authentic Bangkok City & Driver Simulator`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/bts-sukhumvit-line-3d-bangkok-driver-simulator>
