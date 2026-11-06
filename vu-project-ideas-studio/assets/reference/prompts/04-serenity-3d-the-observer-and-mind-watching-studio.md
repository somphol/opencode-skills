---
id: serenity-3d-the-observer-and-mind-watching-studio
title: "Serenity 3D: The Observer & Mind-Watching Studio"
track: Calm & Focus
order: 4
words: 2008
live: null
---

# Serenity 3D: The Observer & Mind-Watching Studio

> Twenty guided observer scripts across sky, stream and orb worlds.

**Track:** Calm & Focus · **Brief size:** L · **Words:** 2,008 · **Read:** ~10 min

Copy the block below into your coding agent. It is the current request prefix plus the
original build brief, verbatim.

````text
Can you create new project in ~/Projects to host this Serenity 3D: The Observer & Mind-Watching Studio project

Please also upload this as a project to github.

You should also try NOT to trigger repeated Keychain prompts.

At the end also add the state file to the project to show how long it takes for you do create the entire game and how many tokens consumption in total.  We should also credit the OpenCode and the model we are using too.

Please make sure you document everything that other AI agent needs to know to re-produce the project here in the project because otherwise the information will be lost after this session is terminated.

Please also populate the project with docs that is normally needed to look like professional release.

After everything is done, please also turn what you have done here into a skill so that other user who try to do the same thing can learn from you.  Please also publish the backup copy of the skill to GitHub

Please try to minimize token consumption without  compromising on the  coding / outcome quality.

===========

TASK: Build a complete, production-ready, interactive 3D web application
named "Serenity 3D: The Observer & Mind-Watching Studio" using vanilla HTML5,
CSS3, ES6 JavaScript, and Three.js (loaded via CDN).

======================================================================
PROJECT BACKGROUND & CORE PHILOSOPHY:
======================================================================
This application is part of an open-source visual web app series. Its core
focus is "Cognitive Defusion" and "Self-as-Context" (mind-watching / observing
the self). Rather than attempting to control or stop thoughts, it trains the
user to step back into the stance of "The Observer"—witnessing thoughts,
worries, and memories as temporary mental events passing through awareness like
clouds floating across a wide sky.

======================================================================
1. COMPLETE BILINGUAL GUIDED SCRIPT DATASET (ALL 20 DETAILED SCRIPTS)
======================================================================
- Pre-loaded Script Dataset: The application MUST embed the full, detailed
  narration script arrays for all 20 mindfulness observer practices. Each
  script object contains timed cues, English text (`text_en`), and Thai text
  (`text_th`) for Web Speech API TTS rendering:

  MODULE 1: THE SKY & THE CLOUDS (EXPANDING AWARENESS)
  ----------------------------------------------------
  1. The Vast Blue Sky:
     [
       { time: 0, text_en: "Sit comfortably, resting your hands gently in your lap. Close your eyes or soften your gaze.", text_th: "นั่งในท่าที่สบาย ปล่อยมือวางบนตักเบาๆ หลับตาลงหรือทอดสายตาลงต่ำ" },
       { time: 10, text_en: "Take a slow, deep breath in... and release it fully. Let your shoulders drop.", text_th: "หายใจเข้าลึกๆ ช้าๆ... แล้วถอนหายใจออกมาให้หมด ปล่อยหัวไหล่ให้ผ่อนคลาย" },
       { time: 25, text_en: "Bring awareness to your mind. Picture it as a vast, clear blue sky stretching infinitely.", text_th: "น้อมจิตมารู้สึกถึงใจ จินตนาการว่าใจของคุณเป็นท้องฟ้าสีฟ้าอันกว้างใหญ่ไร้ขอบเขต" },
       { time: 45, text_en: "Your thoughts, plans, and worries are simply clouds passing through this open space.", text_th: "ความคิด ความวางแผน และความกังวล เป็นเพียงเมฆที่ลอยผ่านเข้ามาในอวกาศนี้" },
       { time: 65, text_en: "Some clouds are light, some are dark. Do not push them away or chase them. Simply watch them drift.", text_th: "เมฆบางก้อนสว่าง บางก้อนมืดครึ้ม ไม่ต้องผลักไสหรือวิ่งตาม เพียงแค่มองดูมันลอยไป" },
       { time: 85, text_en: "Remember: You are not the clouds. You are the vast, untouched sky in which they appear.", text_th: "จำไว้ว่า: คุณไม่ใช่เมฆก้อนนั้น คุณคือท้องฟ้าอันกว้างใหญ่ที่คงเดิมเสมอ" }
     ]

  2. The High-Altitude View:
     [
       { time: 0, text_en: "Imagine sitting at the peak of a high mountain, looking down at a distant valley.", text_th: "จินตนาการว่าคุณกำลังนั่งอยู่บนยอดเขาสูง มองลงไปที่หุบเขาเบื้องล่าง" },
       { time: 20, text_en: "Down below, mental traffic moves along the road—thoughts coming and going.", text_th: "เบื้องล่าง มีการจราจรทางความคิดกำลังเคลื่อนไปตามถนน ความคิดวิ่งเข้าและออก" },
       { time: 45, text_en: "Stay up on your quiet peak. Observe the traffic without stepping onto the road.", text_th: "คงอยู่บนยอดเขาอันเงียบสงบ สังเกตการจราจรนั้นโดยไม่ต้องก้าวลงไปบนถนน" },
       { time: 70, text_en: "Notice how every car eventually drives out of sight.", text_th: "สังเกตดูว่ารถทุกคัน ในที่สุดก็ขับลับสายตาไป" }
     ]

  3. Clearing the Horizon:
     [
       { time: 0, text_en: "A heavy thought may enter your awareness. Allow it space to exist on the horizon.", text_th: "ความคิดที่หนักอึ้งอาจลอยเข้ามา ให้พื้นที่มันดำรงอยู่ตรงเส้นขอบฟ้า" },
       { time: 25, text_en: "Do not struggle with the weather. Watch the wind slowly carry the storm past.", text_th: "ไม่ต้องต่อสู้กับสภาพอากาศ มองดูสายลมค่อยๆ พัดพายุนั้นผ่านพ้นไป" },
       { time: 55, text_en: "Notice the clear blue horizon returning on its own.", text_th: "สังเกตเห็นเส้นขอบฟ้าที่สดใสกลับคืนมาด้วยตัวมันเอง" }
     ]

  4. Sunlight Through the Mist:
     [
       { time: 0, text_en: "When the mind feels foggy or confused, do not try to force clarity.", text_th: "เมื่อใจรู้สึกสับสนหรือมีหมอกปกคลุม ไม่ต้องพยายามบังคับให้มันกระจ่าง" },
       { time: 30, text_en: "Rest as the warm sunlight of awareness. Sunlight doesn't fight the mist; it simply shines.", text_th: "พักอยู่ในแสงแดดอันอบอุ่นของความรู้ตัว แสงแดดไม่ได้ต่อสู้กับหมอก เพียงแค่ส่องสว่าง" },
       { time: 60, text_en: "Watch the mist dissolve gradually in the light of steady presence.", text_th: "มองดูหมอกค่อยๆ สลายตัวไปในแสงแห่งความรู้ตัวที่มั่นคง" }
     ]

  5. The Unscratched Mirror:
     [
       { time: 0, text_en: "Visualize your awareness as a pristine, polished mirror.", text_th: "จินตนาการถึงความรู้ตัวของคุณเหมือนกระจกเงาที่ใสสะอาด" },
       { time: 30, text_en: "Images, emotions, and thoughts reflect upon its surface constantly.", text_th: "ภาพ อารมณ์ และความคิด สะท้อนอยู่บนผิวกระจกตลอดเวลา" },
       { time: 60, text_en: "No matter how dark the image, the mirror itself remains unstained and unscratched.", text_th: "ไม่ว่าภาพจะมืดมนเพียงใด ตัวกระจกเองก็ไม่เคยหมองมัวหรือเกิดรอยขีดข่วน" }
     ]

  MODULE 2: LEAVES ON A STREAM (NON-ATTACHMENT)
  ---------------------------------------------
  6. The Forest Brook:
     [
       { time: 0, text_en: "Imagine sitting on the bank of a quiet forest stream, watching leaves float by.", text_th: "จินตนาการว่าคุณกำลังนั่งอยู่ริมลำธารในป่าอันเงียบสงบ มองดูใบไม้ลอยผ่านไป" },
       { time: 20, text_en: "As a thought arises, place it gently on a leaf and let it drop into the water.", text_th: "เมื่อมีความคิดเกิดขึ้น วางมันลงบนใบไม้เบาๆ แล้วปล่อยให้มันตกลงสู่ผิวน้ำ" },
       { time: 45, text_en: "Watch the stream carry the leaf around the bend and out of view.", text_th: "มองดูลำธารพัดพาใบไม้นั้นคุ้งน้ำไปจนลับสายตา" },
       { time: 70, text_en: "If your mind hooks onto a thought, notice the hook, uncurl your fingers, and return to the bank.", text_th: "หากใจไปยึดติดกับความคิด ให้รู้ทัน ละความยึดติด แล้วกลับมานั่งบนฝั่งตามเดิม" }
     ]

  7. Letting Go of the Anchor:
     [
       { time: 0, text_en: "Notice if you are holding tightly to a story or grievance right now.", text_th: "สังเกตดูว่าคุณกำลังยึดถือเรื่องราวหรือความขุ่นเคืองใดไว้ในใจหรือไม่" },
       { time: 25, text_en: "Feel the tension of holding on. Soften your hands. Place the story on a leaf.", text_th: "ตระหนักถึงความตึงเครียดของการยึดติด ผ่อนคลายมือ ผ่อนคลายใจ วางเรื่องราวนั้นลงบนใบไม้" },
       { time: 55, text_en: "Watch it float away down the current. Breathe in freedom.", text_th: "มองมันลอยห่างออกไปตามกระแสน้ำ สูดหายใจรับความอิสระ" }
     ]

  8. Rapid Rapids vs. Gentle Pools:
     [
       { time: 0, text_en: "Sometimes thoughts rush past like white-water rapids.", text_th: "บางครั้งความคิดก็โหมกระหน่ำเหมือนสายน้ำเชี่ยว" },
       { time: 30, text_en: "Do not jump into the rushing water to stop it. Stand securely on the shore.", text_th: "อย่ากระโดดลงไปในน้ำเชี่ยวเพื่อหยุดมัน ยืนบนฝั่งอย่างมั่นคง" },
       { time: 60, text_en: "Observe the wild water until it naturally widens into a serene pool.", text_th: "เฝ้ามองสายน้ำที่เกรี้ยวกราด จนกว่ามันจะขยายออกเป็นสระน้ำที่สงบเอียบเย็นด้วยตัวมันเอง" }
     ]

  9. Choosing Which Leaf to Watch:
     [
       { time: 0, text_en: "When many thoughts compete for attention, pick just one prominent thought.", text_th: "เมื่อมีความคิดมากมายแย่งชิงความสนใจ เลือกความคิดที่เด่นชัดที่สุดมาเพียงหนึ่งเดียว" },
       { time: 30, text_en: "Place that single thought on a leaf and track it all the way down the river.", text_th: "วางความคิดเดียวนั้นลงบนใบไม้ แล้วเฝ้ามองมันลอยไปตามลำธารจนสุดสายตา" },
       { time: 60, text_en: "Let all other chatter drift past in the background.", text_th: "ปล่อยให้เสียงรบกวนอื่นๆ ลอยผ่านไปในภูมิหลัง" }
     ]

  10. The Empty Riverbank:
      [
        { time: 0, text_en: "Rest your attention on the quiet stream between passing leaves.", text_th: "พักความใส่ใจไว้ที่ลำธารอันเงียบสงบ ในช่วงเวลาที่ไม่มีใบไม้ลอยผ่าน" },
        { time: 30, text_en: "Enjoy the stillness of the empty riverbank.", text_th: "เพลิดเพลินกับความสงบเงียบของริมฝั่งน้ำที่ว่างเปล่า" },
        { time: 60, text_en: "The water continues to flow, but your peace remains undisturbed.", text_th: "สายน้ำยังคงไหลไป แต่ความสงบของคุณยังคงไม่ถูกรบกวน" }
      ]

  MODULE 3: THE THEATER SCREEN (IMPARTIAL WITNESS)
  ------------------------------------------------
  11. Front Row Seat:
      [
        { time: 0, text_en: "Step inside a quiet cinema and take a seat in the middle row.", text_th: "ก้าวเข้าไปในโรงภาพยนตร์ที่เงียบสงบ แล้วนั่งลงที่แถวกลาง" },
        { time: 25, text_en: "Look up at the blank screen ahead. You are the audience, not the movie.", text_th: "มองขึ้นไปที่หน้าจอที่ว่างเปล่า คุณคือผู้ชม ไม่ใช่ตัวภาพยนตร์" },
        { time: 55, text_en: "Whatever drama plays on screen, observe it safely from your chair.", text_th: "ไม่ว่าเรื่องราวใดจะฉายอยู่บนจอ ให้เฝ้าดูมันอย่างปลอดภัยจากเก้าอี้ของคุณ" }
      ]

  12. Turning Down the Volume:
      [
        { time: 0, text_en: "Notice a loud or self-critical thought playing in your mind.", text_th: "สังเกตเห็นความคิดที่ดังรบกวน หรือความคิดที่ตัดสินตัวเองกำลังเล่นอยู่ในใจ" },
        { time: 30, text_en: "Locate the volume dial in your mind. Slowly turn it counter-clockwise.", text_th: "มองหาปุ่มปรับเสียงในใจ ค่อยๆ หมุนมันทวนเข็มนาฬิกา" },
        { time: 60, text_en: "Listen as the harsh words drop into a soft, quiet whisper.", text_th: "ฟังเสียงคำพูดที่รุนแรงนั้น ค่อยๆ เบาลงกลายเป็นเสียงกระซิบที่แผ่วเบา" }
      ]

  13. Switching Genres:
      [
        { time: 0, text_en: "Notice if your mind is playing a horror film or catastrophizing story.", text_th: "สังเกตว่าใจของคุณกำลังฉายหนังสยองขวัญ หรือเรื่องราวคาดการณ์ในแง่ร้ายอยู่หรือไม่" },
        { time: 30, text_en: "Step back into the projection booth. View the story as a neutral documentary.", text_th: "ถอยกลับเข้าไปในห้องฉายหนัง มองเรื่องราวนั้นเป็นเพียงสารคดีที่เป็นกลาง" },
        { time: 60, text_en: "It is just data on a screen, not a current reality.", text_th: "มันเป็นเพียงข้อมูลบนหน้าจอ ไม่ใช่ความจริงในปัจจุบัน" }
      ]

  14. The Intermission:
      [
        { time: 0, text_en: "Pause the internal movie for a brief intermission.", text_th: "หยุดพักภาพยนตร์ภายในใจชั่วคราว" },
        { time: 30, text_en: "The lights soften. The screen goes black. Rest in pure silence.", text_th: "ไฟค่อยๆ หรี่ลง หน้าจอกลับเป็นสีดำ พักผ่อนในความเงียบสงบอันบริสุทธิ์" },
        { time: 60, text_en: "Nothing to solve, nothing to review.", text_th: "ไม่มีสิ่งใดต้องแก้ไข ไม่มีสิ่งใดต้องทบทวน" }
      ]

  15. Stepping Behind the Projector:
      [
        { time: 0, text_en: "Move your awareness behind the beam of light in the theater.", text_th: "เลื่อนความรู้ตัวของคุณไปอยู่หลังลำแสงของเครื่องฉาย" },
        { time: 30, text_en: "Realize that you are the light of awareness making the images visible.", text_th: "ตระหนักว่าคุณคือแสงแห่งความรู้ตัว ที่ทำให้ภาพเหล่านั้นปรากฏขึ้น" },
        { time: 60, text_en: "The images fade, but the light of awareness remains.", text_th: "ภาพเหล่านั้นเลือนหายไป แต่แสงแห่งความรู้ตัวยังคงอยู่" }
      ]

  MODULE 4: EVERYDAY DEFUSION & NOTING
  -----------------------------------
  16. The Labeling Habit:
      [
        { time: 0, text_en: "As you sit, notice the instant a thought appears.", text_th: "ขณะที่คุณนั่งอยู่ ให้รู้ทันทันทีที่ความคิดปรากฏขึ้น" },
        { time: 25, text_en: "Apply a soft, neutral one-word label: 'Planning', 'Remembering', or 'Judging'.", text_th: "ติดป้ายกำกับเบาๆ ด้วยคำเดียวที่เป็นกลาง: 'วางแผน', 'ทรงจำ', หรือ 'ตัดสิน'" },
        { time: 55, text_en: "Label it cleanly, like cataloging a specimen, and return to the breath.", text_th: "ติดป้ายอย่างชัดเจน เหมือนการจำแนกตัวอย่าง แล้วกลับมาอยู่กับลมหายใจ" }
      ]

  17. "I Notice..." Reframing:
      [
        { time: 0, text_en: "When a difficult thought arises, reframe it in your mind.", text_th: "เมื่อมีความคิดที่ยากลำบากเกิดขึ้น ให้ปรับกรอบความคิดนั้นใหม่ในใจ" },
        { time: 30, text_en: "Add the prefix: 'I notice the thought that...' before the statement.", text_th: "เติมคำนำหน้า: 'ฉันรู้ทันความคิดที่ว่า...' ก่อนข้อความนั้น" },
        { time: 60, text_en: "Feel the immediate space created between you and the thought.", text_th: "สัมผัสถึงช่องว่างที่เกิดขึ้นทันที ระหว่างตัวคุณกับความคิดนั้น" }
      ]

  18. Physical Sensation of Thought:
      [
        { time: 0, text_en: "Drop out of the verbal story in your head.", text_th: "ถอนตัวออกมาจากเรื่องราวคำพูดในหัว" },
        { time: 30, text_en: "Locate where this thought vibrates as physical sensation in your body.", text_th: "ค้นหาว่าความคิดนี้สั่นสะเทือนเป็นความรู้สึกทางกายตรงไหนในร่างกาย" },
        { time: 60, text_en: "Breathe into the chest, throat, or belly, releasing the mental narrative.", text_th: "หายใจเข้าไปยังหน้าอก ลำคอ หรือท้อง ปล่อยวางเรื่องราวในความคิด" }
      ]

  19. Welcoming the Unwelcome:
      [
        { time: 0, text_en: "If a uncomfortable thought or emotion enters, stop resisting it.", text_th: "หากมีความคิดหรืออารมณ์ที่ไม่สบายใจเข้ามา ให้หยุดต่อสู้กับมัน" },
        { time: 30, text_en: "Mentally say: 'Welcome, you are allowed to be here for a moment'.", text_th: "พูดในใจว่า: 'ยินดีต้อนรับ คุณสามารถอยู่ที่นี่ได้ชั่วคราว'" },
        { time: 60, text_en: "Watch how non-resistance disarms its intensity.", text_th: "มองดูว่าการไม่ต่อสู้ ช่วยลดความรุนแรงของมันลงได้อย่างไร" }
      ]

  20. The Flash in the Dark:
      [
        { time: 0, text_en: "Treat thoughts like sudden flashes of lightning in a dark night sky.", text_th: "ปฏิบัติกับความคิดเหมือนสายฟ้าที่สว่างขึ้นทันทีในท้องฟ้าคืนมืด" },
        { time: 30, text_en: "It flashes brilliantly, lights up the scene, and vanishes completely.", text_th: "มันแลบสว่างไสว ส่องสว่างทั่วบริเวณ แล้วเลือนหายไปโดยสมบูรณ์" },
        { time: 60, text_en: "Rest in the quiet dark that follows.", text_th: "พักผ่อนในความมืดอันสงบเงียบที่ตามมา" }
      ]

- Dynamic Timing Interval Algorithm:
  * The JavaScript engine MUST calculate relative cue timestamps based on user-selected
    session length (Ttotal in seconds):

cue_timei=timei90Ttotal

======================================================================
2. 3D VISUALIZATION METAPHORS (THREE.JS SCENE SWITCHER)
======================================================================
- Mode A: "Clouds in the Sky" ☁️
  * Render an expansive 3D sky environment with dynamic light scattering.
  * Floating 3D clouds generated procedurally. Typing a short label (e.g., "Work stress")
    attaches it to a cloud that gently drifts past and dissolves out of sight.
- Mode B: "Leaves on a Stream" 🍂
  * Render a tranquil 3D river environment with flowing water shaders.
  * Floating 3D leaves carry user-entered mental labels downstream.
- Mode C: "Breathing Orb & Sanctuary" 🪐
  * Render a meditative sanctuary with a central glowing 3D orb that pulses in
    sync with selected breathing timers (Box Breathing, 4-7-8, Calming).

======================================================================
3. COGNITIVE DEFUSION & THOUGHT-LABELING ENGINE
======================================================================
- Interactive "Noting & Defusion" Input Bar:
  * Input field allowing users to log thoughts during sessions.
  * Automatic Reframing: Automatically prefixes entries with *"I notice the thought that..."*
    or *"A planning thought is here..."* to reinforce psychological distance.
  * Quick Category Buttons: [Thought / Wandering], [Emotion / Feeling], [Body Sensation].

======================================================================
4. WEB SPEECH API (TTS), ADJUSTABLE GONG & SOUNDSCAPES
======================================================================
- Web Speech API Narration:
  * Synchronized TTS (`window.speechSynthesis`) reading guided script cues with rate,
    pitch, voice dropdown (EN & TH), and mute controls.
- Adjustable Procedural Gong (Web Audio API):
  * FM synthesis brass bell with sliders for Pitch (100Hz - 440Hz), Decay (1s - 10s),
    and Strike Volume, auto-triggering at start/end of sessions.
- Ambient Soundscapes:
  * Binaural tone generator (Alpha/Theta) + pink noise layers ([Gentle Rain], [Forest Wind]).

======================================================================
5. SESSION TIMERS, BILINGUAL HUD & LOCAL DATA PERSISTENCE
======================================================================
- Adjustable Session Duration:
  * Quick Preset Buttons ([2 Min Primer], [5 Min Mindful Pause], [10 Min Standard],
    [15 Min Deep Dive], [30 Min]) plus a custom minute slider (1–60 mins).
- Bilingual Support (EN ⇄ TH Toggle):
  * Instantly translates all UI controls, metaphor explanations, all 20 detailed scripts,
    and defusion prompts between English and Thai (ภาษาไทย).
- Local Data Persistence:
  * Auto-saves observer practice streaks, logged thought categories, and preferences to
    browser localStorage with an "💾 Export Mind-Watching Log JSON" button.

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

Source label in the supplied list: `Serenity 3D: The Observer & Mind-Watching Studio`.  
Catalog: <https://somphol.github.io/vu_project_ideas/#p/serenity-3d-the-observer-and-mind-watching-studio>
