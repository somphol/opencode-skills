---
id: suatsync-3d-chinabunchorn-9-chanting-studio
title: "SuatSync 3D: Chinabunchorn 9 Chanting Studio"
track: Calm & Focus
order: 3
words: 433
live: null
---

# SuatSync 3D: Chinabunchorn 9 Chanting Studio

> A bilingual chanting and karaoke studio for the Chinabunchorn nine-recitation practice.

**Track:** Calm & Focus · **Brief size:** M · **Words:** 433 · **Read:** ~2 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this SuatSync 3D: Chinabunchorn 9 Chanting Studio project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application
named "SuatSync 3D: Chinabunchorn 9 Recitations Chanting & Karaoke Studio"
using vanilla HTML5, CSS3, ES6 JavaScript, and Three.js (loaded via CDN).

======================================================================
PROJECT BACKGROUND & CORE FUNCTIONALITY:
======================================================================
This application is designed specifically for practicing the Chinabunchorn
Chant 9 Times (พระคาถาชินบัญชร 9 จบ). It embeds a background YouTube / HTML5
audio engine to play the video (https://www.youtube.com/watch?v=LAo569-mflM)
or synced audio, while displaying large, high-contrast, synchronized karaoke-style
Pali text and Thai translations line-by-line so users can read and chant along ("สวดตาม").

======================================================================
1. BACKGROUND MEDIA ENGINE & AUDIO CONTROLS
======================================================================
- Background Video / Audio Player:
  * Embed background audio / YouTube player target (`LAo569-mflM`).
  * Play / Pause, Restart, and Repetition Jump Selector ([Intro], [รอบที่ 1], [รอบที่ 2], ..., [รอบที่ 9], [แผ่เมตตา]).
  * Playback Tempo / Speed Slider (0.75x to 1.25x) to adjust chanting pace without pitch distortion.
  * Audio Volume Mixer with smooth fade-in/fade-out options.

======================================================================
2. SYNCHRONIZED KARAOKE TEXT ENGINE ("สวดตาม")
======================================================================
- High-Contrast Display UI:
  * Large, highly readable Pali text (ภาษาบาลี) and Thai translation (คำแปลภาษาไทย).
  * Real-time cue highlighting: The active line scales up and glows softly as audio plays.
  * Manual Seek: Clicking any line in the chant list jumps playback to that exact timestamp.

- Embedded Chinabunchorn 15-Stanza Dataset Structure:
  [
    { "section": "เริ่มบทสวด / นโม 3 จบ", "pali": "นโม ตสฺสะ ภควโต อระหโต สมฺมาสมฺพุทฺธสฺสะ (3 จบ)", "th": "ขอนอบน้อมแด่พระผู้มีพระภาคเจ้า... (3 ครั้ง)" },
    { "section": "นึกถึงสมเด็จโต / บทบูชาพระรัตนตรัย", "pali": "ปุตฺตกโม ละเภ ปุตฺตํ ธนกโม ละเภ ธนํ...", "th": "ผู้ปรารถนาบุตรย่อมได้บุตร ผู้ปรารถนาโภคทรัพย์ย่อมได้โภคทรัพย์..." },
    { "section": "ชินบัญชร คาถาที่ 1", "pali": "ชยาสนากตา พุทฺธา เชตฺวา มารํ สะวาหนํ...", "th": "พระพุทธเจ้าผู้ประทับนั่งบนชัยบัลลังก์ ทรงพิชิตมารพร้อมทั้งกองทัพ..." },
    { "section": "ชินบัญชร คาถาที่ 2", "pali": "กณฺหงฺกโร มหาวีโร สพฺเพ พุทฺธา ปติฏฺฐิตา...", "th": "พระพุทธเจ้าทั้งหลาย มีพระตัณหังกรผู้มีความกล้าหาญเป็นต้น..." },
    { "section": "ชินบัญชร คาถาที่ 3", "pali": "มุทธาเนเต ปติฏฺฐิตา พุทฺโธ ธมฺโม วิโลจเน...", "th": "พระพุทธเจ้าประดิษฐานอยู่ที่เศียรเกล้า พระธรรมอยู่ที่ดวงตาทั้งสอง..." },
    { "section": "ชินบัญชร คาถาที่ 4-15", "pali": "...", "th": "..." },
    { "section": "บทแผ่เมตตา & แผ่ส่วนกุศล", "pali": "สพฺเพ สตฺตา อเวรา โหนฺตุ...", "th": "ขอสัตว์ทั้งหลายทั้งปวง จงเป็นสุขเป็นสุขเถิด..." }
  ]

======================================================================
3. AMBIENT THREE.JS MANDALA BACKDROP
======================================================================
- Meditative Visual Atmosphere:
  * Minimalist Three.js canvas featuring a slow-rotating 3D gold/amber Lotus Mandala
    or glowing particle aura pulsing gently in sync with audio playback frequency data.

======================================================================
4. PROGRESS TRACKER & BILINGUAL HUD
======================================================================
- Repetition Counter & Streak Tracker:
  * Auto-tracks completion of each of the 9 recitations.
  * Saves completed chanting sessions and streaks to browser `localStorage`.
- Language & Transliteration Toggle:
  * Switch between [Pali - Thai Script] and [Pali - Roman Transliteration] for global users.

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

Source label in the supplied list: `SuatSync 3D: Chinabunchorn 9 Recitations Chanting & Karaoke Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/suatsync-3d-chinabunchorn-9-chanting-studio>
