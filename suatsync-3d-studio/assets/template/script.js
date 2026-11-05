/* =============================================================================
   SuatSync 3D — Chinabunchorn 9 Recitations Chanting & Karaoke Studio
   Version 1.0.0 · MIT · built with OpenCode + DeepSeek V4.1 Flash

   A single strict-mode IIFE. Sections:
     1. Chant dataset        2. I18N
     3. Utilities            4. Persistence and state
     5. Timeline engine      6. Audio engine (YouTube / file / timer)
     7. Karaoke rendering    8. Progress and sessions
     9. Three.js mandala    10. Dialogs
    11. Events              12. Self-tests and boot
   ========================================================================== */

(function () {
  "use strict";

  var VERSION = "1.0.0";
  var STORAGE_KEY = "suatsync3d.v1";
  var VIDEO_ID = "LAo569-mflM";
  var NOMINAL_DURATION = 5837; // 1:37:17 — measured from the source video
  var THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

  /* ---------------------------------------------------------------- 1. DATA */

  var INTRO = [
    {
      id: "namo",
      weight: 1.5,
      pali: "นะโม ตัสสะ ภะคะวะโต อะระหะโต สัมมาสัมพุทธัสสะ (3 จบ)",
      roman: "Namo tassa bhagavato arahato sammāsambuddhassa. (3×)",
      th: "ขอนอบน้อมแด่พระผู้มีพระภาคเจ้าพระองค์นั้น ผู้เป็นพระอรหันต์ ตรัสรู้ชอบได้โดยพระองค์เอง (ว่า 3 ครั้ง)",
      en: "Homage to the Blessed One, the arahant, the perfectly self-enlightened Buddha. (Recite three times.)"
    },
    {
      id: "homage-1",
      pali: "ปุตตะกาโม ละเภ ปุตตัง ธะนะกาโม ละเภ ธะนัง อัตถิกาเย กายะญายะ เทวานัง ปิยะตัง สุตะวา",
      roman: "Puttakāmo labhe puttaṃ, dhanakāmo labhe dhanaṃ; atthikāye kāyañāya, devānaṃ piyataṃ sutavā.",
      th: "ผู้ปรารถนาบุตรย่อมได้บุตร ผู้ปรารถนาโภคทรัพย์ย่อมได้โภคทรัพย์ ผู้มีกิจย่อมสำเร็จกิจ เหล่าเทวดาย่อมรักใคร่ผู้ฟังธรรม",
      en: "Those who wish for children receive children; those who wish for wealth receive wealth; their purposes are fulfilled, and the gods hold the listener dear."
    },
    {
      id: "homage-2",
      pali: "อิติปิโส ภะคะวา ยะมะราชาโน ท้าวเวสสุวัณโณ มะระณัง สุขัง อะระหัง สุคะโต นะโมพุทธายะ",
      roman: "Itipi so bhagavā, yamarājāno, Vessuvaṇṇo; maraṇaṃ sukhaṃ, arahaṃ sugato, namo buddhāya.",
      th: "พระผู้มีพระภาคเจ้าพระองค์นั้นเป็นพระอรหันต์ เป็นพระสุคต ขอนอบน้อมแด่พระพุทธเจ้า ผู้ทรงเป็นที่พึ่งแห่งเหล่าท้าวยมราชและท้าวเวสสุวรรณ",
      en: "The Blessed One is an arahant, the Sugata, a refuge for the lords of death and the guardian of wealth. Homage to the Buddha."
    }
  ];

  var VERSES = [
    {
      id: "v1",
      pali: "ชะยาสะนากะตา พุทธา เชตะวา มารัง สะวาหะนัง จะตุสัจจาสะภัง ระสัง เยปิวิงสุ นะราสะภา",
      roman: "Jayāsanāgatā buddhā, chetvā māraṃ savāhinaṃ; catu-saccāsabhaṃ rasaṃ, ye piviṃsu narāsabhā.",
      th: "พระพุทธเจ้าทั้งหลายผู้ประทับบนชัยบัลลังก์ ทรงพิชิตมารพร้อมกองทัพ ทรงดื่มรสแห่งอริยสัจสี่อันประเสริฐ เหล่านราสภะผู้เป็นใหญ่ในหมู่มนุษย์",
      en: "The Buddhas who reached the seat of victory, defeating Māra and his host, who drank the noble taste of the Four Truths — the peerless leaders of men."
    },
    {
      id: "v2",
      pali: "ตัณหังกะราทะโย พุทธา อัฏฐะวีสะติ นายะกา สัพเพ ปะติฏฐิตา มัยหัง มัตถะเถเต มุนิสสะรา",
      roman: "Taṇhaṅkarādayo buddhā, aṭṭhavīsati nāyakā; sabbe patiṭṭhitā mayhaṃ, matthake te munisvarā.",
      th: "พระพุทธเจ้าผู้เป็นนายก 28 พระองค์ มีพระตัณหังกรเป็นต้น ล้วนเป็นมุนีผู้ประเสริฐ ได้ประดิษฐานอยู่บนเศียรเกล้าของข้าพเจ้า",
      en: "The twenty-eight Buddhas, beginning with Taṇhaṅkara, all peerless sages, are established upon my head."
    },
    {
      id: "v3",
      pali: "สีเส ปะติฏฐิโต มัยหัง พุทโธ ธัมโม ทะวิโลจะเน สังโฆ ปะติฏฐิโต มัยหัง อุเร สัพพะคุณากะโร",
      roman: "Sīse patiṭṭhito mayhaṃ, buddho dhammo dvilocane; saṅgho patiṭṭhito mayhaṃ, ure sabbaguṇākaro.",
      th: "พระพุทธเจ้าประดิษฐานอยู่ที่เศียรเกล้าของข้าพเจ้า พระธรรมอยู่ที่ดวงตาทั้งสอง พระสังฆเจ้าผู้เป็นบ่อเกิดแห่งคุณทั้งปวงประดิษฐานอยู่ที่อุระ",
      en: "The Buddha rests on my head, the Dhamma at my two eyes, and the Sangha — source of every quality — within my breast."
    },
    {
      id: "v4",
      pali: "หะทะเย เม อะนุรุทโธ สารีปุตโต จะ ทักขิเณ โกณฑัญโญ ปิฏฐิภาคัสมิง โมคคัลลาโน จะวามะเก",
      roman: "Hadaye me anuruddho, sāriputto ca dakkhiṇe; koṇḍañño piṭṭhibhāgasmiṃ, moggallāno ca vāmake.",
      th: "พระอนุรุทธะอยู่ที่หทัยของข้าพเจ้า พระสารีบุตรอยู่เบื้องขวา พระโกณฑัญญะอยู่เบื้องหลัง พระโมคคัลลานะอยู่เบื้องซ้าย",
      en: "Anuruddha in my heart, Sāriputta at my right, Koṇḍañña behind me, Moggallāna at my left."
    },
    {
      id: "v5",
      pali: "ทักขิเณ สะวะเน มัยหัง อาสุง อานันทะ ราหุโล กัสสะโป จะ มะหานาโม อุภาสุง วามะโสตะเก",
      roman: "Dakkhiṇe savane mayhaṃ, āsuṃ ānanda-rāhulā; kassapo ca mahānāmo, ubhāsuṃ vāmasotake.",
      th: "พระอานนท์และพระราหุลอยู่ที่หูขวา พระกัสสปะและพระมหานามะอยู่ที่หูซ้ายของข้าพเจ้า",
      en: "Ānanda and Rāhula at my right ear; Kassapa and Mahānāma at my left."
    },
    {
      id: "v6",
      pali: "เกสันเต ปิฏฐิภาคัสมิง สุริโย วะ ปะภังกะโร นิสินโน สิริสัมปันโน โสภิโต มุนิปุงคะโว",
      roman: "Kesante piṭṭhibhāgasmiṃ, suriyo va pabhāṅkaro; nisinno sirisampanno, sobhito munipuṅgavo.",
      th: "พระโสภิตะผู้เรืองยศ บริบูรณ์ด้วยสิริ ประทับนั่งอยู่ที่ปลายผมเบื้องหลัง ดุจดวงอาทิตย์ผู้ส่องแสง",
      en: "Sobhita, endowed with glory and fortune, sits behind me at the crown of my hair, radiant as the sun."
    },
    {
      id: "v7",
      pali: "กุมาระกัสสะโป เถโร มะเหสี จิตตะวาทะโก โส มัยหัง วะทะเน นิจจัง ปะติฏฐาสิ คุณากะโร",
      roman: "Kumārakassapo thero, mahesī cittavādako; so mayhaṃ vadane niccaṃ, patiṭṭhāsi guṇākaro.",
      th: "พระกุมารกัสสปะ เถระผู้ยิ่งใหญ่และเป็นนักโต้วาทะอันวิจิตร ท่านผู้เกิดแต่คุณงามความดี ได้ประดิษฐานอยู่ที่ปากของข้าพเจ้าเป็นนิตย์",
      en: "The elder Kumārakassapa, a great sage and brilliant speaker, ever stands at my mouth, a mine of virtue."
    },
    {
      id: "v8",
      pali: "ปุณโณ อังคุลิมาโล จะ อุปาลี นันทะ สีวะลี เถรา ปัญจะ อิเม ชาตา นะลาเฏ ติละกา มะมะ",
      roman: "Puṇṇo aṅgulimālo ca, upāli nandasīvalī; therā pañca ime jātā, nalāṭe tilakā mama.",
      th: "พระปุณณะ พระอังคุลิมาล พระอุบาลี พระนันทะ และพระสีวลี เถระทั้งห้าองค์นี้ ได้เกิดเป็นดวงมงคลบนหน้าผากของข้าพเจ้า",
      en: "Puṇṇa, Aṅgulimāla, Upāli, Nanda and Sīvalī — these five elders are marks of blessing on my brow."
    },
    {
      id: "v9",
      weight: 1.5,
      pali: "เสสาสีติ มะหาเถรา วิชิตา ชินะสาวะกา เอเตสีติ มะหาเถรา ชิตะวันโต ชิโนระสา ชะลันตา สีละเตเชนะ อังคะมังเคสุ สัณฐิตา",
      roman: "Sesāsīti mahātherā, vijitā jinasāvakā; etesīti mahātherā, jitavanto jinorasā; jalantā sīlatejena, aṅgamaṅgesu saṇṭhitā.",
      th: "พระมหาเถระที่เหลืออีก 80 องค์ ผู้เป็นสาวกของพระชินเจ้า ผู้ชนะแล้วด้วยใจองอาจ ทรงเพียบพร้อมด้วยเดชแห่งศีล ประดิษฐานอยู่ทุกส่วนน้อยใหญ่แห่งร่างกาย",
      en: "The remaining eighty great elders, victorious disciples of the Jinas, blazing with the power of virtue, stand throughout every part of my body."
    },
    {
      id: "v10",
      pali: "ระตะนัง ปุระโต อาสิ ทักขิเณ เมตตะสุตตะกัง ธะชัคคัง ปัจฉะโต อาสิ วาเม อังคุลิมาละกัง",
      roman: "Rataṇaṃ purato āsi, dakkhiṇe mettasuttakaṃ; dhajaggaṃ pacchato āsi, vāme aṅgulimālakaṃ.",
      th: "พระรัตนสูตรอยู่เบื้องหน้า พระเมตตสูตรอยู่เบื้องขวา พระธชัคคสูตรอยู่เบื้องหลัง พระอังคุลิมาลสูตรอยู่เบื้องซ้าย",
      en: "The Ratanasutta before me, the Mettasutta at my right, the Dhajaggasutta behind me, the Aṅgulimālasutta at my left."
    },
    {
      id: "v11",
      pali: "ขันธะโมระปะริตตัญจะ อาฏานาฏิยะสุตตะกัง อากาเส ฉะทะนัง อาสิ เสสา ปาการะสัณฐิตา",
      roman: "Khandhamoraparittañca, āṭānāṭiyasuttakaṃ; ākāse chadanaṃ āsi, sesā pākārasaṇṭhitā.",
      th: "ขันธปริตร โมรปริตร และอาฏานาฏิยสูตร เป็นเครื่องปกคลุมในอากาศ ส่วนสูตรที่เหลือเป็นปราการล้อมรอบ",
      en: "The Khandha and Mora parittas and the Āṭānāṭiya Sutta roof the sky; the rest form my surrounding ramparts."
    },
    {
      id: "v12",
      pali: "ชินาณาวะระสังยุตตา สัตตะปาการะลังกะตา วาตะปิตตาทิสัญชาตา พาหิรัชฌัตตุปัททะวา",
      roman: "Jināṇāvarasaṃyuttā, sattapākāralaṅkatā; vātapittādisañjātā, bāhirājjhattupaddavā.",
      th: "ข้าพเจ้าผู้ประดับด้วยเจ็ดปราการอันประกอบด้วยอานุภาพแห่งพระชินเจ้า ขอภัยที่เกิดจากลม ดี เสมหะ และอุปัทวะภายนอกภายใน จงถูกป้องกัน",
      en: "Adorned with seven ramparts bound to the Jinas' power, may every danger born of wind, bile and the like, outside and within, be warded off."
    },
    {
      id: "v13",
      pali: "อาสิเสสา วินะยัง ยันตุ อะนันตะชินะเตชะสา วะสะ โต เม สะกิจเจนะ สะทา สัมพุทธะปัญชะเร",
      roman: "Āsīsesā vinaṃ yantu, anantajinatejasā; vasa to me sakicchena, sadā sambuddhapañjare.",
      th: "ด้วยเดชานุภาพแห่งพระชินเจ้าอันไม่มีที่สิ้นสุด ขอความวิบัติทั้งปวงจงดับไป ขอข้าพเจ้าจงสำเร็จในกิจทุกเมื่อในชินบัญชรของพระสัมพุทธเจ้า",
      en: "By the boundless power of the Jinas may every misfortune end; may I always succeed in my undertakings within the Buddha's Jinapañjara."
    },
    {
      id: "v14",
      pali: "ชินะปัญชะระมัชฌัมหิ วิหะรันตัง มะฮีตะเล สะทา ปาเลนตุ มัง สัพเพเต มะหาปุริสาสะภา",
      roman: "Jinapañjaramajjhamhi, viharantaṃ mahītale; sadā pālentu maṃ sabbe, te mahāpurisāsabhā.",
      th: "ขอเหล่ามหาบุรุษผู้ประเสริฐทั้งปวง ผู้สถิตอยู่ในท่ามกลางชินบัญชรบนพื้นแผ่นดินนี้ จงคุ้มครองข้าพเจ้าเป็นนิตย์",
      en: "May all those peerless great beings dwelling in the midst of the Jinapañjara on this earth ever protect me."
    },
    {
      id: "v15",
      weight: 1.7,
      pali: "อิจเจวะมันโต สุคุตโต สุรักโข ชินานุภาเวนะ ชิตุปัททะโว ธัมมานุภาเวนะ ชิตาริสังโฆ สังฆานุภาเวนะ ชิตันตะราโย สัทธัมมานุภาวะปาลิโต จะรามิ ชินะปัญชะเรติ",
      roman: "Icchevamanto sugutto surakkho, jinānubhāvena jitupaddavo; dhammānubhāvena jitārisaṅgho, saṅghānubhāvena jitantarāyo; saddhammānubhāvapālito, carāmi jinapañjareti.",
      th: "ข้าพเจ้าผู้มีคาถานี้เป็นเครื่องป้องกันตัวดีแล้ว อาศัยอานุภาพแห่งพระชินเจ้าชนะอุปัทวะ อาศัยอานุภาพแห่งพระธรรมชนะข้าศึก อาศัยอานุภาพแห่งพระสังฆะชนะอันตรายทั้งปวง ได้รับการคุ้มครองด้วยอานุภาพแห่งพระสัทธรรม ข้าพเจ้าจึงเที่ยวอยู่ในชินบัญชร",
      en: "Guarded well by this mantra, safe through the Jinas' power, victorious over misfortune through the Dhamma's power, victorious over foes through the Sangha's power, protected by the true Dhamma's power, I walk within the Jinapañjara."
    }
  ];

  var OUTRO = [
    {
      id: "metta",
      weight: 1.2,
      pali: "สัพเพ สัตตา อะเวรา โหนตุ อัพยาปัชฌา โหนตุ อนีฆา โหนตุ สุขี อัตตานัง ปะริหะรันตุ",
      roman: "Sabbe sattā averā hontu, abyāpajjhā hontu, anīghā hontu, sukhī attānaṃ pariharantu.",
      th: "ขอสัตว์ทั้งปวงจงเป็นผู้ไม่มีเวร ไม่มีความเบียดเบียน ไม่มีความทุกข์ จงรักษาตนให้เป็นสุขเถิด",
      en: "May all beings be free of enmity, free of harm, free of suffering; may they keep themselves well."
    },
    {
      id: "dedication",
      weight: 0.8,
      pali: "อิทัง เม ญาตีนัง โหตุ สุขิตา โหนตุ ญาตะโย",
      roman: "Idaṃ me ñātīnaṃ hotu, sukhitā hontu ñātayo.",
      th: "ขออุทิศส่วนกุศลนี้แก่ญาติทั้งหลาย ขอญาติทั้งหลายจงมีความสุข",
      en: "May this merit go to my relatives; may my relatives be happy."
    }
  ];

  /* ---------------------------------------------------------------- 2. I18N */

  var I18N = {
    en: {
      brandSub: "Chinabunchorn 9 Recitations",
      scriptLabel: "Pali",
      langLabel: "Language",
      aboutAria: "About SuatSync 3D",
      skip: "Skip to player controls",
      eyebrow: "A quiet room for nine recitations",
      title: "Chant the Chinabunchorn,<br><em>one luminous line at a time.</em>",
      lede: "Synchronized Pali, Thai meaning and English gloss, wrapped around a slow golden mandala. One video, nine rounds, no account; practice history stays on your device.",
      statRounds: "rounds",
      statVerses: "verses",
      statStreak: "day streak",
      statMinutes: "minutes chanted",
      pathTitle: "The nine rounds",
      pathCopy: "Each ring is a full recitation. Listen, chant, and the mandala remembers.",
      jumpTitle: "Jump to a section",
      jumpHint: "Verse timings come from the measured timing sheet.",
      streakTitle: "Your practice",
      streakEmpty: "Finish all nine rounds to begin a streak.",
      historyBtn: "Session history",
      karaokeTitle: "Karaoke chant",
      statusReady: "Ready when you are",
      statusPlaying: "Chanting",
      statusPaused: "Paused",
      statusEnded: "Complete",
      nowLabel: "Now chanting",
      translationLabel: "Meaning",
      lookaheadTitle: "This recitation",
      seekCurrent: "Seek to this line",
      playerTitle: "Sound",
      sourceYouTube: "YouTube",
      sourceFile: "My audio",
      sourceTimer: "Timer",
      tabYouTube: "YouTube",
      tabFile: "My audio",
      tabTimer: "Timer",
      videoConsent: "The chant video loads from YouTube when the page opens.",
      videoErrorPlaceholder: "YouTube could not load here. Check your connection, reconnect, or use the timer.",
      connect: "Reconnect video",
      videoCredit: "Chant video: Joao Felix · LAo569-mflM",
      videoLive: "Live video",
      hideVideo: "Hide video",
      showVideo: "Show video",
      openYouTube: "Open on YouTube",
      chooseFile: "Choose an audio file",
      fileNote: "MP3, M4A or OGG stays in this tab only. Nothing is uploaded.",
      fileReady: "Loaded: {name}",
      fileError: "That file could not be played in this browser.",
      timerNote: "A silent, guide-paced timer with a soft bell at each completed round. Use it when the video is unavailable.",
      playAria: "Play",
      pauseAria: "Pause",
      restartAria: "Restart",
      muteAria: "Mute",
      unmuteAria: "Unmute",
      volumeLabel: "Volume",
      tempoLabel: "Tempo",
      tempoHint: "Slower or faster without changing pitch.",
      fadeLabel: "Soft fade",
      fadeHint: "Ease the volume in and out",
      appearanceTitle: "Appearance",
      appearanceCopy: "Theme and reading size",
      themeAria: "Colour theme",
      textSize: "Text size",
      themeMidnight: "Midnight",
      themeEmerald: "Emerald",
      themeSaffron: "Saffron",
      themeRosewood: "Rosewood",
      themeParchment: "Parchment",
      themeDaylight: "Daylight",
      themeSandalwood: "Sandalwood",
      atmosphereLabel: "Background",
      atmoNight: "Night",
      atmoClouds: "Clouds",
      atmoOcean: "Ocean",
      atmoForest: "Forest",
      sessionTitle: "This sitting",
      sessionEmpty: "No rounds completed yet. The chant will remember as you go.",
      sessionSome: "{n} of 9 rounds complete.",
      sessionFull: "All nine rounds complete. A full sitting.",
      resetSession: "Reset this sitting",
      backAria: "Back 15 seconds",
      fwdAria: "Forward 15 seconds",
      focusAria: "Focus mode",
      playWide: "Play",
      pauseWide: "Pause",
      keyHint: "Space play · ← → seek",
      closeAria: "Close",
      aboutEyebrow: "About this studio",
      aboutTitle: "Made for a daily chant",
      aboutP1: "SuatSync 3D pairs the Chinabunchorn Chant with a calm, line-by-line reading surface. It is a practice aid, not a teacher: the Pali follows the traditional Thai recension, and the meanings are plain-language glosses.",
      aboutP2: "Nothing is uploaded. Preferences, rounds and streaks live in this browser's localStorage. The YouTube player loads when the page opens, and Three.js is loaded from a CDN.",
      creditChant: "Chant text",
      creditChantValue: "Thai Pali recension (public domain); Thai and English glosses by the project.",
      creditVideo: "Video",
      creditBuilt: "Built with",
      creditLicense: "Code licence",
      close: "Close",
      print: "Print the chant",
      summaryEyebrow: "Nine rounds complete",
      summaryTitle: "Sadhu. A full sitting.",
      summaryRounds: "rounds",
      summaryMinutes: "minutes",
      summaryStreak: "day streak",
      summaryCopy: "The mandala keeps a petal for every round you finish. Come back tomorrow and the streak grows.",
      keepChanting: "Keep chanting",
      historyEyebrow: "On this device",
      historyTitle: "Session history",
      exportBtn: "Export JSON",
      clearHistory: "Clear history",
      historyEmpty: "No completed sittings yet.",
      historyRounds: "{n} rounds",
      historyMinutes: "{n} min",
      confirmReset: "Reset the nine rounds for this sitting? Completed history is kept.",
      confirmClear: "Clear all sessions, streaks and lifetime totals on this device? This cannot be undone.",
      resetDone: "A fresh sitting. The history is untouched.",
      cleared: "History cleared.",
      exported: "Your practice file was downloaded.",
      secIntro: "Intro",
      secRound: "Round {n}",
      secOutro: "Dedication",
      usingTimer: "Using the guided timer — no video needed.",
      connectFirst: "The video is still loading, or press Reconnect.",
      videoLoading: "Connecting to YouTube…",
      videoReady: "Video ready. Press play when you are.",
      videoError: "YouTube could not load here. Use My audio or Timer instead.",
      videoPrivate: "YouTube is blocked or offline. The guided timer still works.",
      fileFirst: "Choose an audio file first.",
      roundDone: "Round {n} complete.",
      sessionDone: "Nine rounds complete. Sadhu.",
      jumpTo: "Jumped to {section}.",
      seekHint: "Seek within the current line.",
      fullscreenUnavailable: "Focus mode is already on.",
      lineSeek: "Line {n}",
      introShort: "Intro",
      today: "Today",
      yesterday: "Yesterday",
      daysAgo: "{n} days ago",
      livePetal: "Petal {n}",
      storageOff: "This browser is blocking local storage. Practice still works, but it will not be remembered."
    },
    th: {
      brandSub: "ชินบัญชร 9 จบ",
      scriptLabel: "บาลี",
      langLabel: "ภาษา",
      aboutAria: "เกี่ยวกับ SuatSync 3D",
      skip: "ข้ามไปที่ปุ่มควบคุม",
      eyebrow: "พื้นที่เงียบสงบสำหรับการสวดเก้าจบ",
      title: "สวดชินบัญชร<br><em>ทีละบท ทีละลมหายใจ</em>",
      lede: "บาลี คำแปลไทย และคำอธิบายภาษาอังกฤษที่ซิงก์กัน พร้อมมณฑลทองคำหมุนช้า ๆ วิดีโอเดียว เก้าจบ ไม่ต้องสมัครสมาชิก ประวัติการปฏิบัติอยู่ในเครื่องของคุณ",
      statRounds: "รอบ",
      statVerses: "คาถา",
      statStreak: "วันติดต่อกัน",
      statMinutes: "นาทีที่สวด",
      pathTitle: "เก้ารอบแห่งการสวด",
      pathCopy: "แต่ละวงคือการสวดเต็มหนึ่งรอบ ฟัง สวดตาม แล้วมณฑลจะจดจำ",
      jumpTitle: "กระโดดไปยังช่วงต่าง ๆ",
      jumpHint: "เวลาของแต่ละบทมาจากตารางเวลาที่วัดไว้",
      streakTitle: "การปฏิบัติของคุณ",
      streakEmpty: "สวดครบทั้งเก้าจบเพื่อเริ่มสถิติต่อเนื่อง",
      historyBtn: "ประวัติการสวด",
      karaokeTitle: "บทสวดคาราโอเกะ",
      statusReady: "พร้อมเมื่อคุณพร้อม",
      statusPlaying: "กำลังสวด",
      statusPaused: "หยุดชั่วคราว",
      statusEnded: "ครบแล้ว",
      nowLabel: "กำลังสวด",
      translationLabel: "คำแปล",
      lookaheadTitle: "บทสวดรอบนี้",
      seekCurrent: "ไปยังบทนี้",
      playerTitle: "เสียง",
      sourceYouTube: "ยูทูบ",
      sourceFile: "ไฟล์เสียง",
      sourceTimer: "ตัวจับเวลา",
      tabYouTube: "ยูทูบ",
      tabFile: "ไฟล์เสียง",
      tabTimer: "ตัวจับเวลา",
      videoConsent: "วิดีโอบทสวดจะโหลดจากยูทูบเมื่อเปิดหน้า",
      videoErrorPlaceholder: "ยูทูบโหลดไม่ได้ในที่นี้ ตรวจสอบการเชื่อมต่อแล้วลองใหม่ หรือใช้ตัวจับเวลา",
      connect: "เชื่อมต่อวิดีโอใหม่",
      videoCredit: "วิดีโอบทสวด: Joao Felix · LAo569-mflM",
      videoLive: "วิดีโอ",
      hideVideo: "ซ่อนวิดีโอ",
      showVideo: "แสดงวิดีโอ",
      openYouTube: "เปิดในยูทูบ",
      chooseFile: "เลือกไฟล์เสียง",
      fileNote: "MP3, M4A หรือ OGG อยู่ในแท็บนี้เท่านั้น ไม่มีการอัปโหลด",
      fileReady: "โหลดแล้ว: {name}",
      fileError: "เบราว์เซอร์นี้ไม่สามารถเล่นไฟล์ดังกล่าวได้",
      timerNote: "ตัวจับเวลาแบบเงียบพร้อมระฆังเบาเมื่อจบแต่ละรอบ ใช้เมื่อวิดีโอไม่พร้อม",
      playAria: "เล่น",
      pauseAria: "หยุด",
      restartAria: "เริ่มใหม่",
      muteAria: "ปิดเสียง",
      unmuteAria: "เปิดเสียง",
      volumeLabel: "ระดับเสียง",
      tempoLabel: "ความเร็ว",
      tempoHint: "ช้าลงหรือเร็วขึ้นโดยไม่เปลี่ยนระดับเสียง",
      fadeLabel: "เฟดเสียงนุ่มนวล",
      fadeHint: "ค่อย ๆ เพิ่มและลดเสียง",
      appearanceTitle: "รูปลักษณ์",
      appearanceCopy: "ธีมและขนาดตัวอักษร",
      themeAria: "ธีมสี",
      textSize: "ขนาดตัวอักษร",
      themeMidnight: "เที่ยงคืน",
      themeEmerald: "มรกต",
      themeSaffron: "หญ้าฝรั่น",
      themeRosewood: "ไม้กุหลาบ",
      themeParchment: "กระดาษเก่า",
      themeDaylight: "แสงวัน",
      themeSandalwood: "จันทน์",
      atmosphereLabel: "ฉากหลัง",
      atmoNight: "กลางคืน",
      atmoClouds: "เมฆ",
      atmoOcean: "ทะเล",
      atmoForest: "ป่า",
      sessionTitle: "การสวดครั้งนี้",
      sessionEmpty: "ยังไม่ได้จบรอบใดเลย มณฑลจะจดจำเมื่อคุณสวดไปเรื่อย ๆ",
      sessionSome: "จบแล้ว {n} จาก 9 รอบ",
      sessionFull: "ครบทั้งเก้ารอบแล้ว การสวดเต็มหนึ่งครั้ง",
      resetSession: "เริ่มการสวดครั้งนี้ใหม่",
      backAria: "ย้อนกลับ 15 วินาที",
      fwdAria: "ไปข้างหน้า 15 วินาที",
      focusAria: "โหมดโฟกัส",
      playWide: "เล่น",
      pauseWide: "หยุด",
      keyHint: "Space เล่น · ← → เลื่อน",
      closeAria: "ปิด",
      aboutEyebrow: "เกี่ยวกับสตูดิโอนี้",
      aboutTitle: "สร้างมาเพื่อการสวดทุกวัน",
      aboutP1: "SuatSync 3D จับคู่พระคาถาชินบัญชรกับพื้นที่อ่านทีละบทที่สงบนิ่ง เป็นเครื่องมือช่วยฝึก ไม่ใช่ครูผู้สอน บาลีใช้ฉบับสวดแบบไทยดั้งเดิม และคำแปลเป็นภาษาง่ายเพื่อทำความเข้าใจ",
      aboutP2: "ไม่มีการอัปโหลดข้อมูล การตั้งค่า รอบ และสถิติ เก็บใน localStorage ของเบราว์เซอร์นี้ วิดีโอยูทูบจะโหลดเมื่อเปิดหน้า และ Three.js โหลดจาก CDN",
      creditChant: "บทสวด",
      creditChantValue: "ฉบับบาลีไทย (สาธารณสมบัติ) คำแปลไทยและอังกฤษจัดทำโดยโครงการ",
      creditVideo: "วิดีโอ",
      creditBuilt: "สร้างด้วย",
      creditLicense: "สัญญาอนุญาตโค้ด",
      close: "ปิด",
      print: "พิมพ์บทสวด",
      summaryEyebrow: "ครบเก้ารอบ",
      summaryTitle: "สาธุ การสวดเต็มหนึ่งครั้ง",
      summaryRounds: "รอบ",
      summaryMinutes: "นาที",
      summaryStreak: "วันติดต่อกัน",
      summaryCopy: "มณฑลเก็บกลีบดอกไว้หนึ่งกลีบต่อหนึ่งรอบที่คุณทำสำเร็จ กลับมาพรุ่งนี้เพื่อต่อสถิติ",
      keepChanting: "สวดต่อ",
      historyEyebrow: "ในเครื่องนี้",
      historyTitle: "ประวัติการสวด",
      exportBtn: "ส่งออก JSON",
      clearHistory: "ล้างประวัติ",
      historyEmpty: "ยังไม่มีการสวดที่สำเร็จ",
      historyRounds: "{n} รอบ",
      historyMinutes: "{n} นาที",
      confirmReset: "เริ่มเก้ารอบของการสวดครั้งนี้ใหม่หรือไม่? ประวัติที่สำเร็จแล้วจะยังอยู่",
      confirmClear: "ล้างการสวด สถิติต่อเนื่อง และยอดสะสมทั้งหมดในเครื่องนี้หรือไม่? ไม่สามารถย้อนกลับได้",
      resetDone: "เริ่มครั้งใหม่แล้ว ประวัติยังอยู่ครบ",
      cleared: "ล้างประวัติแล้ว",
      exported: "ดาวน์โหลดไฟล์การปฏิบัติแล้ว",
      secIntro: "บทนำ",
      secRound: "รอบที่ {n}",
      secOutro: "แผ่เมตตา",
      usingTimer: "ใช้ตัวจับเวลาแบบมีไกด์ ไม่ต้องใช้ วิดีโอ",
      connectFirst: "เชื่อมต่อวิดีโอก่อน หรือเปลี่ยนไปใช้ตัวจับเวลา",
      videoLoading: "กำลังเชื่อมต่อยูทูบ…",
      videoReady: "วิดีโอพร้อมแล้ว กดเล่นเมื่อคุณพร้อม",
      videoError: "ยูทูบโหลดไม่ได้ในที่นี้ ใช้ไฟล์เสียงหรือตัวจับเวลาแทน",
      videoPrivate: "ยูทูบถูกบล็อกหรือออฟไลน์ ตัวจับเวลายังใช้งานได้",
      fileFirst: "เลือกไฟล์เสียงก่อน",
      roundDone: "จบรอบที่ {n} แล้ว",
      sessionDone: "ครบเก้ารอบ สาธุ",
      jumpTo: "ไปยัง {section}",
      seekHint: "เลื่อนภายในบทปัจจุบัน",
      fullscreenUnavailable: "เปิดโหมดโฟกัสอยู่แล้ว",
      lineSeek: "บทที่ {n}",
      introShort: "บทนำ",
      today: "วันนี้",
      yesterday: "เมื่อวาน",
      daysAgo: "{n} วันที่แล้ว",
      livePetal: "กลีบที่ {n}",
      storageOff: "เบราว์เซอร์นี้ปิดกั้น localStorage การสวดยังใช้ได้ แต่จะไม่ถูกจดจำ"
    }
  };

  /* ------------------------------------------------------------- 3. UTILS */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
  function pad2(n) { return n < 10 ? "0" + n : String(n); }
  function isFiniteNumber(n) { return typeof n === "number" && isFinite(n); }

  function formatTime(seconds) {
    var s = Math.max(0, Math.floor(isFiniteNumber(seconds) ? seconds : 0));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    return h > 0 ? h + ":" + pad2(m) + ":" + pad2(sec) : m + ":" + pad2(sec);
  }

  function dateKey(date) {
    var d = date || new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function addDays(key, delta) {
    var parts = key.split("-").map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + delta);
    return dateKey(d);
  }

  function dayDiff(a, b) {
    var pa = a.split("-").map(Number);
    var pb = b.split("-").map(Number);
    return Math.round((new Date(pb[0], pb[1] - 1, pb[2]) - new Date(pa[0], pa[1] - 1, pa[2])) / 86400000);
  }

  function computeStreak(sessions, today) {
    var days = {};
    (sessions || []).forEach(function (s) {
      if (s && s.rounds >= 9 && s.date) days[s.date] = true;
    });
    var cursor = today || dateKey();
    if (!days[cursor]) cursor = addDays(cursor, -1);
    var streak = 0;
    while (days[cursor] && streak < 5000) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  function detectLang() {
    var nav = (navigator.language || "en").toLowerCase();
    return nav.indexOf("th") === 0 ? "th" : "en";
  }

  function lineWeight(line) {
    var base = Math.max(30, line.pali.replace(/\s+/g, "").length);
    var multiplier = isFiniteNumber(line.weight) && line.weight > 0 ? line.weight : 1;
    return base * multiplier;
  }

  function weightedTotal(lines) {
    return lines.reduce(function (sum, line) { return sum + lineWeight(line); }, 0);
  }

  /* -------------------------------------------------------- 4. PERSISTENCE */

  var DEFAULT_SETTINGS = {
    lang: detectLang(),
    script: "thai",
    volume: 70,
    rate: 1,
    fade: true,
    showVideo: true,
    source: "youtube",
    theme: "midnight",
    fontSize: "medium",
    atmosphere: "night"
  };

  function defaultMarkers() {
    var intro = 218;   // round 1 verse 1 at 3:38, measured from the source video
    var outro = 2594;  // 43:14, inferred from the 4:24 round spacing
    var out = [0];
    for (var r = 0; r < 9; r++) out.push(intro + ((outro - intro) * r) / 9);
    out.push(outro);
    return out;
  }

  function normalizeStore(raw) {
    var src = raw && typeof raw === "object" ? raw : {};
    var s = src.settings && typeof src.settings === "object" ? src.settings : {};
    var settings = {
      lang: s.lang === "th" || s.lang === "en" ? s.lang : DEFAULT_SETTINGS.lang,
      script: s.script === "roman" ? "roman" : "thai",
      volume: clamp(isFiniteNumber(s.volume) ? s.volume : 70, 0, 100),
      rate: clamp(isFiniteNumber(s.rate) ? s.rate : 1, 0.75, 1.25),
      fade: s.fade !== false,
      showVideo: s.showVideo !== false,
      source: s.source === "file" || s.source === "timer" ? s.source : "youtube",
      theme: ["midnight", "emerald", "saffron", "rosewood", "parchment", "daylight", "sandalwood"].indexOf(s.theme) >= 0 ? s.theme : "midnight",
      fontSize: ["small", "medium", "large"].indexOf(s.fontSize) >= 0 ? s.fontSize : "medium",
      atmosphere: ["night", "clouds", "ocean", "forest"].indexOf(s.atmosphere) >= 0 ? s.atmosphere : "night"
    };

    var sess = src.session && typeof src.session === "object" ? src.session : {};
    var accum = Array.isArray(sess.accum) && sess.accum.length === 9
      ? sess.accum.map(function (v) { return clamp(Number(v) || 0, 0, 7200); })
      : [0, 0, 0, 0, 0, 0, 0, 0, 0];
    var done = Array.isArray(sess.done) && sess.done.length === 9
      ? sess.done.map(function (v) { return v === true; })
      : [false, false, false, false, false, false, false, false, false];
    var session = {
      startedAt: typeof sess.startedAt === "string" ? sess.startedAt : new Date().toISOString(),
      savedAt: typeof sess.savedAt === "string" ? sess.savedAt : "",
      accum: accum,
      done: done,
      completedAt: typeof sess.completedAt === "string" ? sess.completedAt : null
    };

    var st = src.stats && typeof src.stats === "object" ? src.stats : {};
    var sessions = Array.isArray(st.sessions) ? st.sessions.slice(0, 300).map(function (item) {
      return {
        date: typeof item.date === "string" ? item.date : dateKey(),
        rounds: clamp(Number(item.rounds) || 0, 0, 9),
        seconds: clamp(Number(item.seconds) || 0, 0, 86400),
        completedAt: typeof item.completedAt === "string" ? item.completedAt : ""
      };
    }) : [];
    var stats = {
      roundsTotal: Math.max(0, Math.round(Number(st.roundsTotal) || 0)),
      totalSeconds: Math.max(0, Math.round(Number(st.totalSeconds) || 0)),
      sessions: sessions
    };

    return { settings: settings, session: session, stats: stats, savedAt: typeof src.savedAt === "string" ? src.savedAt : "" };
  }

  var state = normalizeStore(null);
  var storageOK = true;
  var ui = {
    lang: state.settings.lang,
    script: state.settings.script,
    draggingSeek: false,
    lastLineKey: "",
    lineSection: -1,
    lastTickAt: 0,
    lastUiAt: 0,
    lastPersistAt: 0,
    lastPosition: null,
    activeSection: 0,
    sessionOpen: false,
    userScrollAt: 0
  };

  function readStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      storageOK = false;
      return null;
    }
  }

  function persist() {
    state.session.savedAt = new Date().toISOString();
    state.savedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      storageOK = false;
    }
  }

  function t(key) {
    var table = I18N[ui.lang] || I18N.en;
    var value = table[key];
    if (value == null) value = I18N.en[key];
    if (value == null) return key;
    var vars = arguments[1] || {};
    return String(value).replace(/\{(\w+)\}/g, function (m, name) {
      return vars[name] != null ? String(vars[name]) : m;
    });
  }

  /* ------------------------------------------------------------ 5. TIMELINE */

  var Timeline = {
    duration: function () { return audio.duration(); },

    markers: function () {
      var dur = Timeline.duration();
      var scale = dur / NOMINAL_DURATION;
      return defaultMarkers().map(function (v) { return clamp(v * scale, 0, dur); });
    },

    sectionCount: function () { return 11; },

    sectionStart: function (section) { return Timeline.markers()[section] || 0; },

    sectionEnd: function (section) {
      var m = Timeline.markers();
      return section < 10 ? m[section + 1] : Timeline.duration();
    },

    sectionDuration: function (section) {
      return Math.max(1, Timeline.sectionEnd(section) - Timeline.sectionStart(section));
    },

    linesFor: function (section) {
      if (section === 0) return INTRO;
      if (section === 10) return OUTRO;
      return VERSES;
    },

    sectionAt: function (time) {
      var m = Timeline.markers();
      var s = 0;
      for (var i = 0; i < 11; i++) if (time >= m[i]) s = i;
      return s;
    },

    explicitStarts: function (section) {
      if (section < 1 || section > 9) return null;
      var data = window.SUAT_TIMINGS;
      if (!data || !data.rounds) return null;
      var starts = data.rounds[String(section)];
      if (!Array.isArray(starts) || starts.length !== 15) return null;
      return starts;
    },

    lineStart: function (section, index) {
      var start = Timeline.sectionStart(section);
      var end = Timeline.sectionEnd(section);
      var lines = Timeline.linesFor(section);
      var safe = clamp(index, 0, lines.length - 1);
      var explicit = Timeline.explicitStarts(section);
      if (explicit) return clamp(explicit[safe], start, end);
      var total = weightedTotal(lines);
      var offset = 0;
      for (var i = 0; i < safe; i++) offset += lineWeight(lines[i]);
      return start + (offset / total) * (end - start);
    },

    lineEnd: function (section, index) {
      var start = Timeline.sectionStart(section);
      var end = Timeline.sectionEnd(section);
      var lines = Timeline.linesFor(section);
      var safe = clamp(index, 0, lines.length - 1);
      var explicit = Timeline.explicitStarts(section);
      if (explicit) {
        return safe + 1 < explicit.length ? clamp(explicit[safe + 1], start, end) : end;
      }
      var total = weightedTotal(lines);
      var offset = 0;
      for (var i = 0; i < safe; i++) offset += lineWeight(lines[i]);
      return start + ((offset + lineWeight(lines[safe])) / total) * (end - start);
    },

    lineAt: function (time) {
      var dur = Timeline.duration();
      var t = clamp(isFiniteNumber(time) ? time : 0, 0, dur);
      var section = Timeline.sectionAt(t);
      var start = Timeline.sectionStart(section);
      var end = Timeline.sectionEnd(section);
      var lines = Timeline.linesFor(section);
      var index = lines.length - 1;
      var explicit = Timeline.explicitStarts(section);

      if (explicit) {
        index = 0;
        for (var e = 0; e < explicit.length; e++) {
          if (t >= explicit[e]) index = e;
        }
      } else {
        var total = weightedTotal(lines);
        var span = Math.max(1, end - start);
        var local = clamp(t - start, 0, span);
        var acc = 0;
        for (var i = 0; i < lines.length; i++) {
          var lineSpan = (lineWeight(lines[i]) / total) * span;
          if (local < acc + lineSpan || i === lines.length - 1) {
            index = i;
            break;
          }
          acc += lineSpan;
        }
      }

      var lineStart = Timeline.lineStart(section, index);
      var lineEnd = Timeline.lineEnd(section, index);
      if (lineEnd <= lineStart) lineEnd = Math.min(end, lineStart + 0.5);
      return {
        section: section,
        index: index,
        line: lines[index],
        total: lines.length,
        sectionStart: start,
        sectionEnd: end,
        lineStart: lineStart,
        lineEnd: lineEnd,
        progress: clamp((t - lineStart) / Math.max(0.001, lineEnd - lineStart), 0, 1)
      };
    },

    label: function (section) {
      if (section === 0) return t("secIntro");
      if (section === 10) return t("secOutro");
      return t("secRound", { n: section });
    }
  };

  /* --------------------------------------------------------- 6. AUDIO ENGINE */

  var ytWaiters = [];
  var ytScriptLoading = false;

  var audio = {
    source: state.settings.source,
    yt: null,
    ytReady: false,
    ytLoading: false,
    ytError: false,
    fileEl: null,
    fileGraph: false,
    fileURL: null,
    fileName: "",
    playing: false,
    pendingPause: false,
    pendingPlay: false,
    volume: state.settings.volume / 100,
    muted: false,
    rate: state.settings.rate,
    volCurrent: 0,
    volTarget: state.settings.volume / 100,
    timerPos: 0,
    timerLast: 0,
    carry: null,
    startAt: null,
    ctx: null,
    master: null,
    analyser: null,
    freq: null,
    level: 0.3
  };

  audio.duration = function () {
    if (audio.source === "youtube" && audio.ytReady && audio.yt && audio.yt.getDuration) {
      var d = audio.yt.getDuration();
      if (isFiniteNumber(d) && d > 10) return d;
    }
    if (audio.source === "file" && audio.fileEl) {
      var f = audio.fileEl.duration;
      if (isFiniteNumber(f) && f > 1) return f;
    }
    return NOMINAL_DURATION;
  };

  audio.position = function () {
    if (audio.source === "youtube") {
      if (audio.ytReady && audio.yt && audio.yt.getCurrentTime) {
        var y = audio.yt.getCurrentTime();
        return isFiniteNumber(y) ? y : 0;
      }
      return audio.startAt != null ? audio.startAt : 0;
    }
    if (audio.source === "file") {
      return audio.fileEl && isFiniteNumber(audio.fileEl.currentTime) ? audio.fileEl.currentTime : 0;
    }
    if (audio.playing) {
      return audio.timerPos + ((performance.now() - audio.timerLast) / 1000) * audio.rate;
    }
    return audio.timerPos;
  };

  function ensureAudioCtx() {
    if (audio.ctx) return audio.ctx;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    try {
      audio.ctx = new Ctx();
      audio.master = audio.ctx.createGain();
      audio.master.gain.value = audio.volCurrent;
      audio.master.connect(audio.ctx.destination);
      audio.analyser = audio.ctx.createAnalyser();
      audio.analyser.fftSize = 128;
      audio.analyser.smoothingTimeConstant = 0.82;
      audio.freq = new Uint8Array(audio.analyser.frequencyBinCount);
      audio.analyser.connect(audio.master);
    } catch (err) {
      audio.ctx = null;
    }
    return audio.ctx;
  }

  function resumeCtx() {
    if (audio.ctx && audio.ctx.state === "suspended") audio.ctx.resume().catch(function () {});
  }

  function applyVolume() {
    var v = clamp(audio.volCurrent, 0, 1);
    if (audio.source === "youtube" && audio.ytReady && audio.yt && audio.yt.setVolume) {
      audio.yt.setVolume(Math.round(v * 100));
    }
    if (audio.fileEl) {
      if (audio.master) audio.master.gain.value = v;
      else audio.fileEl.volume = v;
    }
  }

  function setAudioVolume(value) {
    audio.volume = clamp(value / 100, 0, 1);
    state.settings.volume = Math.round(audio.volume * 100);
    if (!audio.muted) audio.volTarget = audio.volume;
    if (!state.settings.fade) audio.volCurrent = audio.volTarget;
    applyVolume();
    persist();
  }

  function toggleMute() {
    audio.muted = !audio.muted;
    audio.volTarget = audio.muted ? 0 : audio.volume;
    if (!state.settings.fade) audio.volCurrent = audio.volTarget;
    applyVolume();
    renderPlayState();
    updateRangeFills();
  }

  function playAudio() {
    if (audio.source === "youtube" && !audio.ytReady) {
      if (audio.ytLoading) {
        audio.pendingPlay = true;
        return;
      }
      toast(t(audio.ytError ? "videoError" : "connectFirst"));
      if (!audio.ytLoading) connectYouTube();
      audio.pendingPlay = true;
      return;
    }
    if (audio.source === "file" && !audio.fileEl) {
      toast(t("fileFirst"));
      if (el.fileInput) el.fileInput.click();
      return;
    }
    resumeCtx();
    audio.volCurrent = state.settings.fade ? 0 : (audio.muted ? 0 : audio.volume);
    audio.volTarget = audio.muted ? 0 : audio.volume;
    if (audio.source === "youtube" && audio.yt && audio.yt.playVideo) {
      audio.yt.playVideo();
    } else if (audio.source === "file" && audio.fileEl) {
      var p = audio.fileEl.play();
      if (p && p.catch) p.catch(function () { toast(t("fileError")); });
    } else {
      if (audio.timerPos >= audio.duration() - 1) audio.timerPos = 0;
      audio.timerLast = performance.now();
    }
    audio.playing = true;
    audio.pendingPause = false;
    ui.lastPosition = null;
    applyVolume();
    renderPlayState();
    renderNow(true);
    persist();
  }

  function doPause() {
    if (audio.source === "timer") audio.timerPos = clamp(audio.position(), 0, audio.duration());
    if (audio.source === "youtube" && audio.ytReady && audio.yt && audio.yt.pauseVideo) audio.yt.pauseVideo();
    if (audio.source === "file" && audio.fileEl) audio.fileEl.pause();
    audio.playing = false;
    audio.pendingPause = false;
    audio.volCurrent = 0;
    audio.volTarget = audio.muted ? 0 : audio.volume;
    applyVolume();
    ui.lastPosition = null;
    renderPlayState();
    renderNow(true);
    persist();
  }

  function pauseAudio() {
    if (!audio.playing) return;
    if (!state.settings.fade || audio.source === "timer") {
      doPause();
      return;
    }
    audio.pendingPause = true;
    audio.volTarget = 0;
  }

  function togglePlay() {
    if (audio.playing) pauseAudio();
    else playAudio();
  }

  function seekTo(position, silent) {
    var target = clamp(isFiniteNumber(position) ? position : 0, 0, audio.duration());
    if (audio.source === "youtube" && audio.ytReady && audio.yt && audio.yt.seekTo) {
      audio.yt.seekTo(target, true);
    } else if (audio.source === "youtube" && !audio.ytReady) {
      audio.startAt = target;
    } else if (audio.source === "file" && audio.fileEl) {
      try { audio.fileEl.currentTime = target; } catch (err) { /* metadata not ready */ }
    } else {
      audio.timerPos = target;
      audio.timerLast = performance.now();
    }
    ui.lastPosition = null;
    updateTransport(target);
    if (!silent) renderNow(true);
  }

  function restartAudio() {
    seekTo(0, true);
    renderNow(true);
  }

  function applyRate() {
    var wasPlaying = audio.playing && audio.source === "timer";
    var positionBeforeRate = wasPlaying ? audio.position() : 0;
    audio.rate = clamp(state.settings.rate, 0.75, 1.25);
    if (audio.source === "youtube" && audio.ytReady && audio.yt && audio.yt.setPlaybackRate) {
      try { audio.yt.setPlaybackRate(audio.rate); } catch (err) { /* older players */ }
    }
    if (audio.source === "file" && audio.fileEl) {
      try { audio.fileEl.playbackRate = audio.rate; } catch (err) { /* ignore */ }
    }
    if (wasPlaying) {
      audio.timerPos = positionBeforeRate;
      audio.timerLast = performance.now();
    }
  }

  function ensureFileEl() {
    if (audio.fileEl) return audio.fileEl;
    var node = document.createElement("audio");
    node.id = "localAudio";
    node.preload = "metadata";
    node.className = "sr-only";
    node.addEventListener("ended", function () {
      audio.playing = false;
      renderPlayState();
      renderNow(true);
    });
    node.addEventListener("error", function () {
      if (audio.fileURL) toast(t("fileError"));
    });
    document.body.appendChild(node);
    audio.fileEl = node;
    return node;
  }

  function attachFileGraph() {
    if (audio.fileGraph) return;
    var ctx = ensureAudioCtx();
    if (!ctx || !audio.analyser || !audio.fileEl) return;
    try {
      var source = ctx.createMediaElementSource(audio.fileEl);
      source.connect(audio.analyser);
      audio.fileGraph = true;
    } catch (err) {
      audio.fileGraph = false;
    }
  }

  function loadFile(file) {
    if (!file) return;
    var node = ensureFileEl();
    if (audio.fileURL) URL.revokeObjectURL(audio.fileURL);
    audio.fileURL = URL.createObjectURL(file);
    audio.fileName = file.name || "audio";
    node.src = audio.fileURL;
    node.load();
    node.onloadedmetadata = function () {
      var target = audio.carry != null ? audio.carry : (audio.startAt != null ? audio.startAt : 0);
      audio.startAt = null;
      try { node.currentTime = clamp(target, 0, Math.max(0, (node.duration || 1) - 0.2)); } catch (err) { /* ignore */ }
      attachFileGraph();
      applyVolume();
      updateDurationUI();
      renderSource();
      renderNow(true);
      toast(t("fileReady", { name: audio.fileName }));
    };
    setSource("file", true);
    persist();
  }

  function ensureYT(ok, fail) {
    if (window.YT && window.YT.Player) { ok(); return; }
    ytWaiters.push({ ok: ok, fail: fail });
    if (ytScriptLoading) return;
    ytScriptLoading = true;
    var script = document.createElement("script");
    script.id = "yt-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = function () {
      ytScriptLoading = false;
      var queue = ytWaiters.splice(0);
      queue.forEach(function (w) { if (w.fail) w.fail(); });
    };
    document.head.appendChild(script);
  }

  window.onYouTubeIframeAPIReady = function () {
    ytScriptLoading = false;
    var queue = ytWaiters.splice(0);
    queue.forEach(function (w) { if (w.ok) w.ok(); });
  };

  function failYouTube() {
    audio.ytLoading = false;
    audio.ytError = true;
    audio.pendingPlay = false;
    if (el.videoPlaceholder) el.videoPlaceholder.hidden = false;
    if (el.videoBadge) el.videoBadge.hidden = true;
    renderSource();
    toast(t("videoError"));
  }

  function connectYouTube(silent) {
    if (audio.ytReady) {
      if (audio.yt && audio.yt.playVideo) audio.yt.playVideo();
      return;
    }
    if (audio.ytLoading) return;
    audio.ytLoading = true;
    audio.ytError = false;
    if (el.sourceNote) el.sourceNote.textContent = t("videoLoading");
    renderSource();
    if (!silent) toast(t("videoLoading"));

    var guard = window.setTimeout(function () {
      if (!audio.ytReady && audio.ytLoading) failYouTube();
    }, 15000);

    ensureYT(
      function () {
        if (audio.ytReady) return;
        try {
          var origin = location.protocol.indexOf("http") === 0 ? location.origin : undefined;
          audio.yt = new window.YT.Player("ytMount", {
            videoId: VIDEO_ID,
            width: "100%",
            height: "100%",
            playerVars: {
              autoplay: 0,
              controls: 1,
              disablekb: 0,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              origin: origin
            },
            events: {
              onReady: function (event) {
                window.clearTimeout(guard);
                audio.ytReady = true;
                audio.ytLoading = false;
                audio.ytError = false;
                audio.carry = null;
                var start = audio.startAt;
                audio.startAt = null;
                if (start != null && audio.yt && audio.yt.seekTo) audio.yt.seekTo(start, true);
                if (el.videoPlaceholder) el.videoPlaceholder.hidden = true;
                if (el.videoBadge) el.videoBadge.hidden = false;
                audio.volCurrent = audio.muted ? 0 : audio.volume;
                applyVolume();
                applyRate();
                updateDurationUI();
                renderSource();
                renderNow(true);
                if (!silent) toast(t("videoReady"));
                if (audio.pendingPlay) {
                  audio.pendingPlay = false;
                  window.setTimeout(playAudio, 250);
                }
              },
              onStateChange: function (event) {
                if (event.data === 1 || event.data === 3) {
                  if (!audio.playing) {
                    audio.playing = true;
                    if (audio.volCurrent < 0.01) {
                      audio.volCurrent = audio.muted ? 0 : audio.volume;
                      audio.volTarget = audio.volCurrent;
                      applyVolume();
                    }
                    renderPlayState();
                  }
                } else if (event.data === 2 || event.data === 0) {
                  if (audio.playing) {
                    audio.playing = false;
                    renderPlayState();
                    renderNow(true);
                  }
                }
              },
              onError: function () {
                window.clearTimeout(guard);
                failYouTube();
              }
            }
          });
        } catch (err) {
          window.clearTimeout(guard);
          failYouTube();
        }
      },
      function () {
        window.clearTimeout(guard);
        failYouTube();
      }
    );
  }

  function setSource(source, silent) {
    var allowed = source === "file" || source === "timer" ? source : "youtube";
    if (allowed === audio.source) {
      renderSource();
      return;
    }
    var carry = audio.position();
    if (audio.playing) doPause();
    audio.source = allowed;
    audio.carry = carry;
    if (allowed === "timer") {
      audio.timerPos = clamp(carry, 0, audio.duration());
      audio.timerLast = performance.now();
    }
    if (allowed === "file" && audio.fileEl) {
      try { audio.fileEl.currentTime = clamp(carry, 0, Math.max(0, (audio.fileEl.duration || 1) - 0.2)); } catch (err) { /* ignore */ }
    }
    if (allowed === "youtube" && audio.ytReady && audio.yt && audio.yt.seekTo) {
      audio.yt.seekTo(clamp(carry, 0, audio.duration()), true);
    }
    state.settings.source = allowed;
    persist();
    renderSource();
    updateDurationUI();
    renderNow(true);
    if (allowed === "file" && !audio.fileEl && el.fileInput) el.fileInput.click();
    if (silent !== true && allowed === "timer" && audio.source === "timer") toast(t("usingTimer"));
  }

  function ensurePlayableSource() {
    if (audio.source === "youtube" && !audio.ytReady) {
      setSource("timer", true);
      toast(t("usingTimer"));
      return true;
    }
    return false;
  }

  function chime() {
    var ctx = ensureAudioCtx();
    if (!ctx || !audio.master) return;
    try {
      var now = ctx.currentTime;
      [528, 792].forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(i === 0 ? 0.13 : 0.05, now + 0.04 + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.1 + i * 0.2);
        osc.connect(gain);
        gain.connect(audio.master);
        osc.start(now + i * 0.12);
        osc.stop(now + 2.4 + i * 0.2);
      });
    } catch (err) { /* audio is optional */ }
  }

  function updateLevel() {
    var target = 0.3;
    if (audio.analyser && audio.freq && audio.source === "file") {
      audio.analyser.getByteFrequencyData(audio.freq);
      var sum = 0;
      for (var i = 1; i < 24 && i < audio.freq.length; i++) sum += audio.freq[i];
      target = clamp(sum / (23 * 255), 0, 1);
    } else if (audio.playing) {
      var now = performance.now();
      target = 0.4 + 0.1 * Math.sin(now / 2200) + 0.07 * Math.sin(now / 360);
    }
    audio.level += (target - audio.level) * 0.06;
  }

  /* -------------------------------------------------------- 7. RENDERING */

  var el = {};

  function cacheElements() {
    [
      "scene-canvas", "roundGrid", "jumpRail", "lifetimeRounds", "streakRing", "streakDays",
      "streakCopy", "heroStreak", "heroMinutes", "sectionBadge", "statusChip", "paliLine",
      "romanLine", "nowCount", "translationTh", "translationEn", "lineProgress", "lineList",
      "seekCurrentBtn", "sourceNote", "videoShell", "videoPlaceholder", "videoBadge",
      "toggleVideoBtn", "fileBlock", "fileInput", "chooseFileBtn", "fileNote", "timerBlock",
      "playBtn", "playWide", "restartBtn", "muteBtn", "miniTime", "volumeSlider",
      "volumeValue", "tempoSlider", "tempoValue", "fadeToggle", "sessionPercent",
      "sessionMeter", "sessionCopy", "resetSessionBtn", "seekBar", "timeNow", "timeTotal",
      "backBtn", "fwdBtn", "focusBtn", "aboutDialog", "summaryDialog", "summaryRounds",
      "summaryMinutes", "summaryStreak", "historyDialog", "historyList", "exportBtn",
      "clearHistoryBtn", "historyBtn", "toast", "versionLine", "printBtn", "ytMount",
      "aboutBtn", "connectBtn", "videoMessage"
    ].forEach(function (id) {
      el[id.replace(/-([a-z])/g, function (m, c) { return c.toUpperCase(); })] = document.getElementById(id);
    });
    el.videoTools = $(".video-tools");
    el.sourceTabs = $$(".source-tab");
    el.playButtons = [el.playBtn, el.playWide].filter(Boolean);
  }

  function applyI18n() {
    document.documentElement.lang = ui.lang;
    $$("[data-i18n]").forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      var value = I18N[ui.lang] && I18N[ui.lang][key];
      if (value != null) node.textContent = value;
    });
    $$("[data-i18n-html]").forEach(function (node) {
      var key = node.getAttribute("data-i18n-html");
      var value = I18N[ui.lang] && I18N[ui.lang][key];
      if (value != null) node.innerHTML = value;
    });
    $$("[data-i18n-aria]").forEach(function (node) {
      var key = node.getAttribute("data-i18n-aria");
      var value = I18N[ui.lang] && I18N[ui.lang][key];
      if (value != null) node.setAttribute("aria-label", value);
    });
  }

  function renderSegments() {
    $$("[data-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === ui.lang));
    });
    $$("[data-script]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-script") === ui.script));
    });
  }

  function renderRounds() {
    if (!el.roundGrid) return;
    if (!el.roundGrid.children.length) {
      for (var n = 1; n <= 9; n++) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "round-pill";
        button.setAttribute("role", "listitem");
        button.setAttribute("data-round", String(n));
        button.innerHTML = '<span class="num">' + n + '</span><span class="tag"></span>';
        el.roundGrid.appendChild(button);
      }
    }
    var section = Timeline.sectionAt(audio.position());
    Array.prototype.forEach.call(el.roundGrid.children, function (button, i) {
      var n = i + 1;
      var done = state.session.done[i] === true;
      var accum = state.session.accum[i] || 0;
      button.classList.toggle("done", done);
      button.classList.toggle("partial", !done && accum > 15);
      button.setAttribute("aria-current", section === n ? "true" : "false");
      button.setAttribute("aria-label", Timeline.label(n) + (done ? " ✓" : ""));
      var tag = button.querySelector(".tag");
      if (tag) tag.textContent = done ? "✓" : t("statRounds");
    });
  }

  function renderJump() {
    if (!el.jumpRail) return;
    if (!el.jumpRail.children.length) {
      for (var s = 0; s < 11; s++) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "jump-btn";
        button.setAttribute("data-section", String(s));
        el.jumpRail.appendChild(button);
      }
    }
    var section = Timeline.sectionAt(audio.position());
    var markers = Timeline.markers();
    Array.prototype.forEach.call(el.jumpRail.children, function (button, i) {
      button.textContent = i === 0 ? t("secIntro") : i === 10 ? t("secOutro") : String(i);
      button.title = Timeline.label(i) + " · " + formatTime(markers[i]);
      button.setAttribute("aria-label", Timeline.label(i) + ", " + formatTime(markers[i]));
      button.setAttribute("aria-current", section === i ? "true" : "false");
    });
  }

  function renderSource() {
    el.sourceTabs.forEach(function (tab) {
      var selected = tab.getAttribute("data-source") === audio.source;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    var isYouTube = audio.source === "youtube";
    if (el.videoShell) el.videoShell.hidden = !isYouTube || !state.settings.showVideo;
    if (el.videoTools) el.videoTools.hidden = !isYouTube;
    if (el.fileBlock) el.fileBlock.hidden = audio.source !== "file";
    if (el.timerBlock) el.timerBlock.hidden = audio.source !== "timer";
    if (el.sourceNote) {
      el.sourceNote.textContent = isYouTube
        ? (audio.ytReady ? t("sourceYouTube") : audio.ytLoading ? t("videoLoading") : t("sourceYouTube"))
        : audio.source === "file" ? t("sourceFile") : t("sourceTimer");
    }
    if (el.videoPlaceholder) el.videoPlaceholder.hidden = audio.ytReady === true;
    if (el.videoBadge) el.videoBadge.hidden = audio.ytReady !== true;
    if (el.videoMessage) {
      el.videoMessage.textContent = audio.ytError ? t("videoErrorPlaceholder") : audio.ytLoading ? t("videoLoading") : t("videoConsent");
    }
    if (el.connectBtn) {
      el.connectBtn.hidden = audio.ytLoading || audio.ytReady;
      el.connectBtn.textContent = t("connect");
    }
    if (el.toggleVideoBtn) {
      el.toggleVideoBtn.setAttribute("aria-expanded", String(state.settings.showVideo));
      el.toggleVideoBtn.textContent = state.settings.showVideo ? t("hideVideo") : t("showVideo");
    }
    if (el.fileNote) {
      el.fileNote.textContent = audio.fileName ? t("fileReady", { name: audio.fileName }) : t("fileNote");
    }
  }

  function renderLineList(section) {
    if (!el.lineList) return;
    var lines = Timeline.linesFor(section);
    el.lineList.innerHTML = "";
    lines.forEach(function (line, index) {
      var lineStart = Timeline.lineStart(section, index);
      var item = document.createElement("li");
      item.className = "line-item";
      item.setAttribute("data-index", String(index));
      var button = document.createElement("button");
      button.type = "button";
      button.className = "line-seek";
      button.setAttribute("data-index", String(index));
      button.setAttribute("aria-label", t("lineSeek", { n: index + 1 }) + " · " + formatTime(lineStart));
      var idx = document.createElement("span");
      idx.className = "line-idx";
      idx.textContent = pad2(index + 1);
      var text = document.createElement("span");
      text.className = "line-text";
      text.textContent = ui.script === "thai" ? line.pali : line.roman;
      var time = document.createElement("span");
      time.className = "line-time";
      time.textContent = formatTime(lineStart);
      button.appendChild(idx);
      button.appendChild(text);
      button.appendChild(time);
      item.appendChild(button);
      el.lineList.appendChild(item);
    });
    renderLineStates();
  }

  function renderLineStates() {
    if (!el.lineList) return;
    var info = Timeline.lineAt(audio.position());
    var items = el.lineList.children;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var index = Number(item.getAttribute("data-index"));
      item.classList.toggle("active", index === info.index);
      item.classList.toggle("done", index < info.index);
    }
    var active = el.lineList.querySelector(".line-item.active");
    if (active) {
      var top = active.offsetTop;
      var height = active.offsetHeight;
      var viewTop = el.lineList.scrollTop;
      var viewHeight = el.lineList.clientHeight;
      if (top < viewTop + 4 || top + height > viewTop + viewHeight - 4) {
        el.lineList.scrollTop = Math.max(0, top - viewHeight / 2 + height / 2);
      }
    }
  }

  function renderNow(force) {
    var pos = audio.position();
    var info = Timeline.lineAt(pos);
    var key = info.section + ":" + info.index;
    var sectionChanged = info.section !== ui.lineSection;
    ui.activeSection = info.section;

    if (force || key !== ui.lastLineKey) {
      var primary = ui.script === "thai" ? info.line.pali : info.line.roman;
      var secondary = ui.script === "thai" ? info.line.roman : "";
      el.paliLine.textContent = primary;
      el.paliLine.setAttribute("lang", ui.script === "thai" ? "th" : "pi-Latn");
      el.romanLine.textContent = secondary;
      el.romanLine.hidden = !secondary;
      el.translationTh.textContent = info.line.th;
      el.translationEn.textContent = info.line.en;
      el.translationTh.hidden = false;
      el.translationEn.hidden = ui.lang !== "en";
      el.nowCount.textContent = (info.index + 1) + " / " + info.total;
      el.sectionBadge.textContent = Timeline.label(info.section);
      ui.lastLineKey = key;
      renderLineStates();
    }

    if (sectionChanged) {
      ui.lineSection = info.section;
      renderLineList(info.section);
      renderRounds();
      renderJump();
      updatePetalStates();
    }

    if (el.lineProgress) el.lineProgress.style.width = Math.round(info.progress * 100) + "%";
    updateTransport(pos);
    updateStatus(info);
  }

  function updateStatus(info) {
    if (!el.statusChip) return;
    var key = audio.playing ? "statusPlaying" : audio.position() >= audio.duration() - 1 && audio.position() > 5 ? "statusEnded" : audio.position() > 1 ? "statusPaused" : "statusReady";
    var text = t(key);
    if (el.statusChip.textContent !== text) el.statusChip.textContent = text;
    el.statusChip.classList.toggle("live", audio.playing);
  }

  function renderSession() {
    var done = state.session.done.filter(Boolean).length;
    var pct = Math.round((done / 9) * 100);
    if (el.sessionMeter) el.sessionMeter.style.width = pct + "%";
    if (el.sessionPercent) el.sessionPercent.textContent = pct + "%";
    if (el.sessionCopy) {
      el.sessionCopy.textContent = done === 9 ? t("sessionFull") : done > 0 ? t("sessionSome", { n: done }) : t("sessionEmpty");
    }
  }

  function renderStats() {
    var streak = computeStreak(state.stats.sessions);
    var minutes = Math.round(state.stats.totalSeconds / 60);
    if (el.streakDays) el.streakDays.textContent = String(streak);
    if (el.heroStreak) el.heroStreak.textContent = String(streak);
    if (el.heroMinutes) el.heroMinutes.textContent = String(minutes);
    if (el.streakRing) el.streakRing.style.setProperty("--pct", clamp((streak / 7) * 100, 0, 100));
    if (el.streakCopy) {
      el.streakCopy.textContent = streak > 0 ? t("streakActive", { n: streak }) : t("streakEmpty");
    }
    if (el.lifetimeRounds) el.lifetimeRounds.textContent = state.stats.roundsTotal + " · " + t("statRounds");
  }

  function renderPlayState() {
    el.playButtons.forEach(function (button) {
      button.classList.toggle("playing", audio.playing);
      if (button.id === "playBtn") {
        button.setAttribute("aria-label", audio.playing ? t("pauseAria") : t("playAria"));
      }
    });
    var label = el.playWide && el.playWide.querySelector("span");
    if (label) label.textContent = audio.playing ? t("pauseWide") : t("playWide");
    if (el.playWide) el.playWide.setAttribute("aria-label", audio.playing ? t("pauseAria") : t("playAria"));
    if (el.muteBtn) {
      el.muteBtn.classList.toggle("muted", audio.muted);
      el.muteBtn.setAttribute("aria-pressed", String(audio.muted));
      el.muteBtn.setAttribute("aria-label", audio.muted ? t("unmuteAria") : t("muteAria"));
    }
    if (el.statusChip) el.statusChip.classList.toggle("live", audio.playing);
    updateStatus(null);
  }

  function updateTransport(position) {
    var pos = isFiniteNumber(position) ? position : audio.position();
    var dur = audio.duration();
    if (el.timeNow) el.timeNow.textContent = formatTime(pos);
    if (el.miniTime) el.miniTime.textContent = formatTime(pos);
    if (el.timeTotal) el.timeTotal.textContent = formatTime(dur);
    if (el.seekBar && !ui.draggingSeek) {
      if (Number(el.seekBar.max) !== Math.round(dur)) el.seekBar.max = String(Math.round(dur));
      el.seekBar.value = String(clamp(pos, 0, dur));
      setRangeFill(el.seekBar);
    }
  }

  function updateDurationUI() {
    var dur = audio.duration();
    if (el.seekBar) {
      el.seekBar.max = String(Math.round(dur));
      if (!ui.draggingSeek) el.seekBar.value = String(clamp(audio.position(), 0, dur));
    }
    if (el.timeTotal) el.timeTotal.textContent = formatTime(dur);
    if (el.seekBar) setRangeFill(el.seekBar);
  }

  function updateRangeFills() {
    if (el.seekBar) setRangeFill(el.seekBar);
    if (el.volumeSlider) setRangeFill(el.volumeSlider);
    if (el.tempoSlider) setRangeFill(el.tempoSlider);
  }

  function setRangeFill(input) {
    if (!input) return;
    var min = Number(input.min) || 0;
    var max = Number(input.max) || 100;
    var value = Number(input.value) || 0;
    var pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
    input.style.setProperty("--fill", clamp(pct, 0, 100) + "%");
  }

  function renderAll(force) {
    applyI18n();
    renderSegments();
    renderRounds();
    renderJump();
    renderSource();
    renderSession();
    renderStats();
    renderPlayState();
    updateDurationUI();
    updateRangeFills();
    if (el.volumeValue) el.volumeValue.textContent = String(state.settings.volume);
    if (el.tempoValue) el.tempoValue.textContent = state.settings.rate.toFixed(2) + "×";
    if (el.fadeToggle) el.fadeToggle.checked = state.settings.fade;
    if (el.volumeSlider) el.volumeSlider.value = String(state.settings.volume);
    if (el.tempoSlider) el.tempoSlider.value = String(state.settings.rate);
    if (el.versionLine) el.versionLine.textContent = "v" + VERSION;
    renderAppearance();
    renderNow(force !== false);
    if (el.lineList) renderLineList(Timeline.sectionAt(audio.position()));
  }

  function setLanguage(lang) {
    ui.lang = lang === "th" ? "th" : "en";
    state.settings.lang = ui.lang;
    persist();
    renderAll(true);
    renderSource();
  }

  function setScript(script) {
    ui.script = script === "roman" ? "roman" : "thai";
    state.settings.script = ui.script;
    persist();
    renderNow(true);
    renderLineList(ui.activeSection);
    renderAll(true);
  }

  function renderAppearance() {
    $$(".theme-swatch").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-theme") === state.settings.theme));
    });
    $$(".font-btn").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-font-size") === state.settings.fontSize));
    });
    $$(".atmosphere-btn").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-atmosphere") === state.settings.atmosphere));
    });
  }

  function applyAppearance() {
    document.documentElement.setAttribute("data-theme", state.settings.theme);
    document.documentElement.setAttribute("data-font-size", state.settings.fontSize);
    document.documentElement.setAttribute("data-atmosphere", state.settings.atmosphere);
    renderAppearance();
    applyWorldTheme(state.settings.theme);
    applyAtmosphere(state.settings.atmosphere);
  }

  function setTheme(name) {
    var themes = ["midnight", "emerald", "saffron", "rosewood", "parchment", "daylight", "sandalwood"];
    if (themes.indexOf(name) < 0) return;
    state.settings.theme = name;
    persist();
    applyAppearance();
  }

  function setFontSize(size) {
    var sizes = ["small", "medium", "large"];
    if (sizes.indexOf(size) < 0) return;
    state.settings.fontSize = size;
    persist();
    applyAppearance();
  }

  function setAtmosphere(name) {
    var scenes = ["night", "clouds", "ocean", "forest"];
    if (scenes.indexOf(name) < 0) return;
    state.settings.atmosphere = name;
    persist();
    applyAppearance();
  }

  function toast(message) {
    if (!el.toast) return;
    el.toast.textContent = message;
    el.toast.classList.add("show");
    if (ui.toastTimer) window.clearTimeout(ui.toastTimer);
    ui.toastTimer = window.setTimeout(function () {
      el.toast.classList.remove("show");
    }, 2800);
  }

  function seekToLine(index) {
    ensurePlayableSource();
    var section = Timeline.sectionAt(audio.position());
    var lines = Timeline.linesFor(section);
    var target = Timeline.lineAt(audio.position());
    var safeIndex = clamp(Number(index) || 0, 0, lines.length - 1);
    if (safeIndex !== target.index) {
      var lineStart = Timeline.lineStart(section, safeIndex);
      var lineEnd = Timeline.lineEnd(section, safeIndex);
      seekTo(lineStart + Math.min(0.4, (lineEnd - lineStart) * 0.05), true);
    }
    renderNow(true);
  }

  function jumpToSection(section) {
    ensurePlayableSource();
    var target = Timeline.markers()[clamp(section, 0, 10)];
    seekTo(target, true);
    renderNow(true);
    toast(t("jumpTo", { section: Timeline.label(section) }));
  }

  // Extra strings that only exist at runtime.
  I18N.en.streakActive = "{n}-day streak. Keep it alive.";
  I18N.th.streakActive = "ต่อเนื่อง {n} วัน รักษาไว้ให้ดี";
  I18N.en.days = "days";
  I18N.th.days = "วัน";

  /* ---------------------------------------------- 8. PROGRESS AND SESSIONS */

  function processPlayback(position) {
    if (ui.lastPosition == null) {
      ui.lastPosition = position;
      return;
    }
    var delta = position - ui.lastPosition;
    ui.lastPosition = position;
    if (delta <= 0 || delta > 4) return;

    var midpoint = position - delta / 2;
    var section = Timeline.sectionAt(midpoint);
    if (section >= 1 && section <= 9) {
      state.session.accum[section - 1] = (state.session.accum[section - 1] || 0) + delta;
    }

    var markers = Timeline.markers();
    for (var n = 1; n <= 9; n++) {
      if (state.session.done[n - 1]) continue;
      var start = markers[n];
      var end = markers[n + 1] != null ? markers[n + 1] : audio.duration();
      var covered = state.session.accum[n - 1] || 0;
      if (position >= end - 4 && covered >= (end - start) * 0.5) markRound(n);
    }
  }

  function markRound(n) {
    if (n < 1 || n > 9 || state.session.done[n - 1]) return;
    state.session.done[n - 1] = true;
    var start = Timeline.sectionStart(n);
    var end = Timeline.sectionEnd(n);
    var gained = clamp(state.session.accum[n - 1] || 0, 0, end - start);
    state.stats.roundsTotal += 1;
    state.stats.totalSeconds += gained;
    persist();
    renderRounds();
    renderSession();
    renderStats();
    updatePetalStates();
    chime();
    toast(t("roundDone", { n: n }));
    if (state.session.done.every(Boolean)) finishSession();
  }

  function finishSession() {
    if (state.session.completedAt) return;
    var now = new Date();
    state.session.completedAt = now.toISOString();
    var seconds = state.session.accum.reduce(function (sum, v) { return sum + (v || 0); }, 0);
    state.stats.sessions.unshift({
      date: dateKey(now),
      rounds: 9,
      seconds: Math.round(seconds),
      completedAt: now.toISOString()
    });
    state.stats.sessions = state.stats.sessions.slice(0, 300);
    persist();
    renderStats();
    renderSession();
    renderHistory();
    window.setTimeout(function () { toast(t("sessionDone")); }, 500);
    showSummary();
  }

  function resetSession(skipConfirm) {
    if (!skipConfirm && !window.confirm(t("confirmReset"))) return;
    state.session = {
      startedAt: new Date().toISOString(),
      savedAt: new Date().toISOString(),
      accum: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      done: [false, false, false, false, false, false, false, false, false],
      completedAt: null
    };
    ui.lastPosition = null;
    persist();
    renderRounds();
    renderSession();
    renderStats();
    updatePetalStates();
    toast(t("resetDone"));
  }

  function clearHistory() {
    if (!window.confirm(t("confirmClear"))) return;
    state.stats = { roundsTotal: 0, totalSeconds: 0, sessions: [] };
    refreshSessionFromStats();
    state.session = {
      startedAt: new Date().toISOString(),
      savedAt: new Date().toISOString(),
      accum: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      done: [false, false, false, false, false, false, false, false, false],
      completedAt: null
    };
    persist();
    renderAll(true);
    renderHistory();
    toast(t("cleared"));
  }

  function refreshSessionFromStats() {
    // Kept for symmetry: the sitting is independent of lifetime totals.
    renderStats();
  }

  function showSummary() {
    if (!el.summaryDialog) return;
    var seconds = state.session.accum.reduce(function (sum, v) { return sum + (v || 0); }, 0);
    if (el.summaryRounds) el.summaryRounds.textContent = "9";
    if (el.summaryMinutes) el.summaryMinutes.textContent = String(Math.max(1, Math.round(seconds / 60)));
    if (el.summaryStreak) el.summaryStreak.textContent = String(computeStreak(state.stats.sessions));
    if (typeof el.summaryDialog.showModal === "function" && !el.summaryDialog.open) el.summaryDialog.showModal();
  }

  function openHistory() {
    renderHistory();
    if (el.historyDialog && typeof el.historyDialog.showModal === "function") el.historyDialog.showModal();
  }

  function renderHistory() {
    if (!el.historyList) return;
    el.historyList.innerHTML = "";
    var sessions = state.stats.sessions || [];
    if (!sessions.length) {
      var empty = document.createElement("p");
      empty.className = "history-empty";
      empty.textContent = t("historyEmpty");
      el.historyList.appendChild(empty);
      return;
    }
    sessions.slice(0, 60).forEach(function (session) {
      var row = document.createElement("div");
      row.className = "history-row";
      var when = document.createElement("span");
      var date = new Date(session.date + "T12:00:00");
      var label;
      try {
        label = date.toLocaleDateString(ui.lang === "th" ? "th-TH" : "en-GB", { year: "numeric", month: "short", day: "numeric" });
      } catch (err) {
        label = session.date;
      }
      when.textContent = label;
      var meta = document.createElement("span");
      meta.textContent = t("historyRounds", { n: session.rounds }) + " · " + t("historyMinutes", { n: Math.max(1, Math.round(session.seconds / 60)) });
      row.appendChild(when);
      row.appendChild(meta);
      el.historyList.appendChild(row);
    });
  }

  function exportPractice() {
    var payload = {
      app: "SuatSync 3D",
      version: VERSION,
      exportedAt: new Date().toISOString(),
      settings: state.settings,
      stats: state.stats,
      session: state.session
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "suatsync-practice-" + dateKey() + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    toast(t("exported"));
  }

  function printChant() {
    var sections = [
      { title: t("secIntro"), lines: INTRO },
      { title: t("secOutro"), lines: OUTRO }
    ];
    var verseRows = VERSES.map(function (line, i) {
      return '<article><p class="num">' + (i + 1) + '</p><p class="pali">' + escapeHtml(line.pali) + '</p><p class="roman">' + escapeHtml(line.roman) + '</p><p class="th">' + escapeHtml(line.th) + '</p><p class="en">' + escapeHtml(line.en) + '</p></article>';
    }).join("");
    var introRows = sections[0].lines.map(function (line) {
      return '<p class="pali">' + escapeHtml(line.pali) + '</p><p class="roman">' + escapeHtml(line.roman) + '</p><p class="th">' + escapeHtml(line.th) + '</p>';
    }).join("");
    var outroRows = sections[1].lines.map(function (line) {
      return '<p class="pali">' + escapeHtml(line.pali) + '</p><p class="roman">' + escapeHtml(line.roman) + '</p><p class="th">' + escapeHtml(line.th) + '</p>';
    }).join("");
    var html = '<!DOCTYPE html><html lang="th"><head><meta charset="utf-8"><title>ชินบัญชร 9 จบ — SuatSync 3D</title>' +
      '<style>body{font-family:"Sarabun","Noto Sans Thai",Thonburi,sans-serif;max-width:760px;margin:32px auto;padding:0 24px;color:#1c1710;line-height:1.7}' +
      'h1{font-size:1.8rem;margin-bottom:4px}h2{font-size:1.1rem;margin:28px 0 10px;border-bottom:1px solid #d8c7a4;padding-bottom:4px}' +
      '.meta{color:#786b58;font-size:.85rem;margin-bottom:24px}.pali{font-size:1.15rem;margin:10px 0 4px}.roman{font-style:italic;color:#7a5a24;margin:0 0 4px}' +
      '.th{color:#333;margin:0 0 14px}.en{color:#666;font-size:.9rem;margin:0 0 14px}article{page-break-inside:avoid;margin-bottom:14px}.num{color:#a97427;font-size:.75rem;margin:0}' +
      '@media print{body{margin:0}}</style></head><body><h1>พระคาถาชินบัญชร 9 จบ</h1>' +
      '<p class="meta">SuatSync 3D · printed ' + new Date().toLocaleDateString() + '</p>' +
      '<h2>' + escapeHtml(sections[0].title) + '</h2>' + introRows +
      '<h2>ชินบัญชร 15 คาถา</h2>' + verseRows +
      '<h2>' + escapeHtml(sections[1].title) + '</h2>' + outroRows +
      '</body></html>';
    var win = window.open("", "_blank");
    if (!win) { window.print(); return; }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    window.setTimeout(function () { win.print(); }, 350);
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* --------------------------------------------------------- 9. 3D MANDALA */

  var THEMES = {
    midnight: {
      idle: 0xc08a3e, active: 0xd9a54e, done: 0xffd98f, emissive: 0xffb347,
      core: 0xffd88a, coreEmissive: 0xffb347, glow: 0xffd27a, particle: 0xf5c977,
      halo: 0xb77b32, warm: 0xffc46b, cool: 0x7f8cff
    },
    emerald: {
      idle: 0x3f8f6a, active: 0x63c995, done: 0xb9f7d3, emissive: 0x6effc0,
      core: 0xc9ffe2, coreEmissive: 0x6effc0, glow: 0x9effcf, particle: 0xbaffd9,
      halo: 0x2f7f62, warm: 0x8fffc4, cool: 0x4fa6ff
    },
    saffron: {
      idle: 0xc08030, active: 0xe0a24e, done: 0xffd99a, emissive: 0xffb347,
      core: 0xffe0a6, coreEmissive: 0xffb347, glow: 0xffcf7a, particle: 0xffd98f,
      halo: 0xb36a24, warm: 0xffb45e, cool: 0x8a6bff
    },
    rosewood: {
      idle: 0x9f5566, active: 0xc97b8b, done: 0xffc7d2, emissive: 0xff8fa3,
      core: 0xffd0d9, coreEmissive: 0xff8fa3, glow: 0xffb6c4, particle: 0xffcbd5,
      halo: 0x9c4f60, warm: 0xff9fae, cool: 0x7f7fff
    },
    parchment: {
      idle: 0xa8793e, active: 0xc9a15e, done: 0xe7c07a, emissive: 0xffcf7a,
      core: 0xffe3a8, coreEmissive: 0xffb347, glow: 0xffcf7a, particle: 0xd9b06a,
      halo: 0xc08a3e, warm: 0xffd49a, cool: 0x9fb7c9
    },
    daylight: {
      idle: 0x5f98ad, active: 0x7eb8cc, done: 0xb9e0ec, emissive: 0x8fe3ff,
      core: 0xd9f6ff, coreEmissive: 0x8fe3ff, glow: 0xa8e5f7, particle: 0x9ed7e8,
      halo: 0x6fb2c8, warm: 0xbfe8ff, cool: 0x7fb7ff
    },
    sandalwood: {
      idle: 0xb0674a, active: 0xcf8464, done: 0xf2bfa6, emissive: 0xffb08a,
      core: 0xffd7c2, coreEmissive: 0xffb08a, glow: 0xffbfa0, particle: 0xf0b494,
      halo: 0xc07858, warm: 0xffc09a, cool: 0xb79cff
    }
  };

  var world = {
    ready: false,
    scene: null,
    camera: null,
    renderer: null,
    root: null,
    spin: null,
    inner: null,
    center: null,
    glow: null,
    particles: null,
    halo: null,
    warm: null,
    cool: null,
    palette: null,
    atmospheres: {},
    activeAtmosphere: "night",
    petals: [],
    innerPetals: [],
    pointer: { x: 0, y: 0 },
    reduced: false,
    lastFrame: 0
  };

  function makeGlowTexture() {
    var size = 256;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    var gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255, 238, 190, 1)");
    gradient.addColorStop(0.18, "rgba(255, 208, 120, 0.9)");
    gradient.addColorStop(0.45, "rgba(233, 170, 70, 0.35)");
    gradient.addColorStop(1, "rgba(233, 170, 70, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }

  function makePetalGeometry() {
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.34, 0.26, 0.44, 0.94, 0, 1.36);
    shape.bezierCurveTo(-0.44, 0.94, -0.34, 0.26, 0, 0);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.055,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      curveSegments: 14
    });
  }

  function buildAtmosphereLayers(texture) {
    var layers = {};

    // Night: a distant, slow star field behind the mandala.
    var nightGroup = new THREE.Group();
    var starCount = 220;
    var starPositions = new Float32Array(starCount * 3);
    for (var s = 0; s < starCount; s++) {
      starPositions[s * 3] = (Math.random() - 0.5) * 18;
      starPositions[s * 3 + 1] = (Math.random() - 0.5) * 12;
      starPositions[s * 3 + 2] = -5 - Math.random() * 4;
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    var stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: 0xffe3a6, size: 0.045, map: texture, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    }));
    nightGroup.add(stars);
    layers.night = nightGroup;

    // Clouds: soft drifting sprites, two depths.
    var cloudGroup = new THREE.Group();
    cloudGroup.position.z = -3.2;
    world.cloudSprites = [];
    for (var c = 0; c < 32; c++) {
      var cloudMat = new THREE.SpriteMaterial({
        map: texture, color: 0xbcd4f0, transparent: true,
        opacity: 0.12 + Math.random() * 0.13,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      var cloud = new THREE.Sprite(cloudMat);
      var scale = 5 + Math.random() * 6;
      cloud.scale.set(scale, scale * (0.42 + Math.random() * 0.25), 1);
      cloud.position.set((Math.random() - 0.5) * 19, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 3);
      cloud.userData.baseY = cloud.position.y;
      cloud.userData.speed = 0.08 + Math.random() * 0.18;
      cloud.userData.phase = Math.random() * Math.PI * 2;
      cloudGroup.add(cloud);
      world.cloudSprites.push(cloud);
    }
    layers.clouds = cloudGroup;

    // Ocean: rising bubbles and a few light shafts.
    var oceanGroup = new THREE.Group();
    var bubbleCount = 320;
    var bubblePositions = new Float32Array(bubbleCount * 3);
    world.bubbleSpeeds = new Float32Array(bubbleCount);
    for (var b = 0; b < bubbleCount; b++) {
      bubblePositions[b * 3] = (Math.random() - 0.5) * 15;
      bubblePositions[b * 3 + 1] = (Math.random() - 0.5) * 13;
      bubblePositions[b * 3 + 2] = -3.5 - Math.random() * 3;
      world.bubbleSpeeds[b] = 0.06 + Math.random() * 0.22;
    }
    var bubbleGeo = new THREE.BufferGeometry();
    bubbleGeo.setAttribute("position", new THREE.BufferAttribute(bubblePositions, 3));
    var bubbles = new THREE.Points(bubbleGeo, new THREE.PointsMaterial({
      color: 0x8fe3ff, size: 0.16, map: texture, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    }));
    oceanGroup.add(bubbles);
    world.bubbles = bubbles;
    var oceanGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture, color: 0x3fa9d8, transparent: true, opacity: 0.24,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    oceanGlow.scale.set(11, 8, 1);
    oceanGlow.position.set(0, -0.5, -6);
    oceanGroup.add(oceanGlow);
    for (var shaft = 0; shaft < 3; shaft++) {
      var shaftSprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture, color: 0x55b8d8, transparent: true, opacity: 0.035,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      shaftSprite.scale.set(1.6 + shaft * 0.6, 9.5, 1);
      shaftSprite.position.set(-4 + shaft * 4, 1.2, -4.5);
      shaftSprite.material.rotation = 0.12 - shaft * 0.08;
      oceanGroup.add(shaftSprite);
    }
    layers.ocean = oceanGroup;

    // Forest: fireflies, mist and thin light shafts.
    var forestGroup = new THREE.Group();
    var flyCount = 200;
    var flyPositions = new Float32Array(flyCount * 3);
    world.flyData = [];
    for (var f = 0; f < flyCount; f++) {
      var fxp = (Math.random() - 0.5) * 14;
      var fyp = (Math.random() - 0.5) * 11;
      flyPositions[f * 3] = fxp;
      flyPositions[f * 3 + 1] = fyp;
      flyPositions[f * 3 + 2] = -2.8 - Math.random() * 3;
      world.flyData.push({ x: fxp, y: fyp, phase: Math.random() * Math.PI * 2 });
    }
    var flyGeo = new THREE.BufferGeometry();
    flyGeo.setAttribute("position", new THREE.BufferAttribute(flyPositions, 3));
    var flies = new THREE.Points(flyGeo, new THREE.PointsMaterial({
      color: 0xd8ff9e, size: 0.28, map: texture, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    }));
    forestGroup.add(flies);
    world.flies = flies;
    for (var mist = 0; mist < 4; mist++) {
      var mistSprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture, color: 0x8fd6a0, transparent: true, opacity: 0.055,
        blending: THREE.NormalBlending, depthWrite: false
      }));
      mistSprite.scale.set(6 + mist, 2.4, 1);
      mistSprite.position.set(-6 + mist * 4, -2 + mist * 0.7, -3.6);
      forestGroup.add(mistSprite);
    }
    for (var ray = 0; ray < 4; ray++) {
      var beam = new THREE.Mesh(
        new THREE.PlaneGeometry(0.55 + ray * 0.12, 10),
        new THREE.MeshBasicMaterial({
          color: 0xc4ffb8, transparent: true, opacity: 0.07,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
        })
      );
      beam.position.set(-4.5 + ray * 3, 1.5, -4.2);
      beam.rotation.z = 0.12 - ray * 0.06;
      forestGroup.add(beam);
    }
    layers.forest = forestGroup;

    Object.keys(layers).forEach(function (key) {
      layers[key].visible = key === "night";
      world.scene.add(layers[key]);
    });
    world.atmospheres = layers;
    world.activeAtmosphere = "night";
  }

  function applyAtmosphere(name) {
    world.activeAtmosphere = name;
    if (!world.ready) return;
    Object.keys(world.atmospheres).forEach(function (key) {
      world.atmospheres[key].visible = key === name;
    });
  }

  function updateAtmospheres(now, dt) {
    if (!world.ready) return;
    var seconds = dt / 1000;
    if (world.activeAtmosphere === "clouds" && world.cloudSprites) {
      world.cloudSprites.forEach(function (cloud) {
        cloud.position.x += cloud.userData.speed * seconds;
        if (cloud.position.x > 10.5) cloud.position.x = -10.5;
        cloud.position.y = cloud.userData.baseY + Math.sin(now / 7000 + cloud.userData.phase) * 0.16;
      });
    }
    if (world.activeAtmosphere === "ocean" && world.bubbles && world.bubbleSpeeds) {
      var positions = world.bubbles.geometry.attributes.position.array;
      for (var i = 0; i < world.bubbleSpeeds.length; i++) {
        positions[i * 3 + 1] += world.bubbleSpeeds[i] * seconds * 2.2;
        if (positions[i * 3 + 1] > 6.5) positions[i * 3 + 1] = -6.5;
      }
      world.bubbles.geometry.attributes.position.needsUpdate = true;
    }
    if (world.activeAtmosphere === "forest" && world.flies && world.flyData) {
      var flyPositions = world.flies.geometry.attributes.position.array;
      for (var f = 0; f < world.flyData.length; f++) {
        var data = world.flyData[f];
        flyPositions[f * 3] = data.x + Math.sin(now / 3200 + data.phase) * 0.35;
        flyPositions[f * 3 + 1] = data.y + Math.cos(now / 2600 + data.phase) * 0.25;
      }
      world.flies.geometry.attributes.position.needsUpdate = true;
      world.flies.material.opacity = 0.55 + Math.sin(now / 900) * 0.2;
    }
    if (world.activeAtmosphere === "night") {
      var night = world.atmospheres.night;
      if (night) night.rotation.z += seconds * 0.004;
    }
  }

  function initWorld() {
    if (!window.THREE) return;
    var canvas = document.getElementById("scene-canvas");
    if (!canvas) return;
    try {
      world.renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch (err) {
      return;
    }
    world.reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    world.scene = new THREE.Scene();
    world.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    world.camera.position.set(0, 0, 9.4);
    world.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    world.renderer.setSize(window.innerWidth, window.innerHeight, false);
    world.renderer.setClearColor(0x000000, 0);

    var ambient = new THREE.AmbientLight(0x8b7aa8, 0.62);
    world.scene.add(ambient);
    var warm = new THREE.PointLight(0xffc46b, 1.35, 30);
    warm.position.set(4, 4, 6);
    world.scene.add(warm);
    var cool = new THREE.PointLight(0x7f8cff, 0.7, 30);
    cool.position.set(-5, -3, 4);
    world.scene.add(cool);

    world.root = new THREE.Group();
    world.root.rotation.x = -0.12;
    world.scene.add(world.root);
    world.spin = new THREE.Group();
    world.root.add(world.spin);
    world.inner = new THREE.Group();
    world.root.add(world.inner);

    var glowTexture = makeGlowTexture();
    var petalGeometry = makePetalGeometry();
    world.warm = warm;
    world.cool = cool;

    var outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.02, 0.012, 8, 180),
      new THREE.MeshBasicMaterial({ color: 0xe9b85c, transparent: true, opacity: 0.55 })
    );
    world.spin.add(outerRing);
    var innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.54, 0.006, 8, 160),
      new THREE.MeshBasicMaterial({ color: 0xe9b85c, transparent: true, opacity: 0.28 })
    );
    world.spin.add(innerRing);
    world.rings = [outerRing, innerRing];

    for (var i = 0; i < 9; i++) {
      var angle = (i / 9) * Math.PI * 2;
      var holder = new THREE.Group();
      holder.position.set(Math.sin(angle) * 1.52, Math.cos(angle) * 1.52, 0);
      holder.rotation.z = -angle;
      var material = new THREE.MeshStandardMaterial({
        color: 0xc08a3e,
        emissive: 0xffb347,
        emissiveIntensity: 0.14,
        metalness: 0.55,
        roughness: 0.38,
        side: THREE.DoubleSide
      });
      var petal = new THREE.Mesh(petalGeometry, material);
      petal.userData.base = 0.9;
      petal.scale.set(0.9, 0.9, 0.9);
      holder.add(petal);
      world.spin.add(holder);
      world.petals.push(petal);
    }

    for (var j = 0; j < 15; j++) {
      var a = (j / 15) * Math.PI * 2 + Math.PI / 15;
      var small = new THREE.Mesh(petalGeometry, new THREE.MeshStandardMaterial({
        color: 0x9a7434,
        emissive: 0xe2a84a,
        emissiveIntensity: 0.08,
        metalness: 0.45,
        roughness: 0.46,
        side: THREE.DoubleSide
      }));
      small.position.set(Math.sin(a) * 0.86, Math.cos(a) * 0.86, 0.02);
      small.rotation.z = -a;
      small.scale.set(0.46, 0.46, 0.3);
      world.inner.add(small);
      world.innerPetals.push(small);
    }

    var core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.23, 2),
      new THREE.MeshStandardMaterial({ color: 0xffd88a, emissive: 0xffb347, emissiveIntensity: 1.7, roughness: 0.25, metalness: 0.2 })
    );
    core.position.z = 0.16;
    world.center = core;
    world.root.add(core);

    var glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffd27a,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    glow.scale.set(2.4, 2.4, 1);
    glow.position.z = 0.12;
    world.glow = glow;
    world.root.add(glow);

    var count = 460;
    var positions = new Float32Array(count * 3);
    for (var k = 0; k < count; k++) {
      var radius = 2.6 + Math.random() * 3.4;
      var theta = Math.random() * Math.PI * 2;
      positions[k * 3] = Math.cos(theta) * radius;
      positions[k * 3 + 1] = Math.sin(theta) * radius;
      positions[k * 3 + 2] = (Math.random() - 0.5) * 2.8;
    }
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var particles = new THREE.Points(geometry, new THREE.PointsMaterial({
      color: 0xf5c977,
      size: 0.055,
      map: glowTexture,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    }));
    world.particles = particles;
    world.root.add(particles);

    var halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xb77b32,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    halo.scale.set(8.5, 8.5, 1);
    halo.position.z = -1;
    world.root.add(halo);
    world.halo = halo;

    buildAtmosphereLayers(glowTexture);
    world.palette = THEMES[state.settings.theme] || THEMES.midnight;

    world.ready = true;
    updatePetalStates();
    resizeWorld();
  }

  function updatePetalStates() {
    if (!world.ready) return;
    var pal = world.palette || THEMES.midnight;
    var section = Timeline.sectionAt(audio.position());
    world.petals.forEach(function (petal, i) {
      var done = state.session.done[i] === true;
      var active = section === i + 1;
      petal.material.emissiveIntensity = done ? 1.05 : active ? 0.5 : 0.13;
      petal.material.color.setHex(done ? pal.done : active ? pal.active : pal.idle);
      petal.material.emissive.setHex(pal.emissive);
      petal.userData.target = done ? 1.04 : active ? 1.01 : 0.9;
    });
    world.innerPetals.forEach(function (petal, i) {
      var lit = (i % 9) + 1 === section;
      petal.material.emissiveIntensity = lit ? 0.45 : 0.06;
      petal.material.emissive.setHex(pal.emissive);
    });
  }

  function applyWorldTheme(name) {
    var pal = THEMES[name] || THEMES.midnight;
    world.palette = pal;
    if (!world.ready) return;
    if (world.center && world.center.material) {
      world.center.material.color.setHex(pal.core);
      world.center.material.emissive.setHex(pal.coreEmissive);
    }
    if (world.glow) world.glow.material.color.setHex(pal.glow);
    if (world.particles) world.particles.material.color.setHex(pal.particle);
    if (world.halo) world.halo.material.color.setHex(pal.halo);
    if (world.warm) world.warm.color.setHex(pal.warm);
    if (world.cool) world.cool.color.setHex(pal.cool);
    (world.rings || []).forEach(function (ring, i) {
      ring.material.color.setHex(pal.active);
      ring.material.opacity = i === 0 ? 0.55 : 0.28;
    });
    updatePetalStates();
  }

  function resizeWorld() {
    if (!world.ready) return;
    var width = window.innerWidth;
    var height = window.innerHeight;
    world.camera.aspect = width / height;
    world.camera.updateProjectionMatrix();
    world.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    world.renderer.setSize(width, height, false);
    if (width < 760) {
      world.camera.position.z = 14.5;
    } else {
      world.camera.position.z = 10.8;
    }
  }

  function updateWorld(now, dt) {
    if (!world.ready) return;
    if (!world.reduced) {
      world.spin.rotation.z += dt * 0.000045;
      world.inner.rotation.z -= dt * 0.000072;
      world.particles.rotation.z += dt * 0.000018;
    }
    var pulse = 1 + audio.level * 0.13 + Math.sin(now / 2600) * 0.012;
    world.center.scale.setScalar(pulse);
    world.center.rotation.y += dt * 0.00025;
    world.glow.scale.set(2.4 * pulse, 2.4 * pulse, 1);
    world.glow.material.opacity = 0.62 + audio.level * 0.3;
    world.petals.forEach(function (petal) {
      var target = petal.userData.target || 0.9;
      var s = petal.scale.x + (target - petal.scale.x) * 0.05;
      petal.scale.set(s, s, Math.max(0.26, s * 0.55));
    });
    var px = world.pointer.x * 0.42;
    var py = world.pointer.y * 0.24;
    world.camera.position.x += (px - world.camera.position.x) * 0.025;
    world.camera.position.y += (py - world.camera.position.y) * 0.025;
    world.camera.lookAt(0, 0, 0);
    updateAtmospheres(now, dt);
    world.renderer.render(world.scene, world.camera);
  }

  /* --------------------------------------------------------------- 10. DIALOGS */

  function toggleFocus() {
    var on = document.body.classList.toggle("focus-mode");
    if (el.focusBtn) el.focusBtn.setAttribute("aria-pressed", String(on));
    if (on) {
      var karaoke = document.querySelector(".karaoke");
      if (karaoke) karaoke.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* ------------------------------------------------------------- 11. EVENTS */

  function bindEvents() {
    $$("[data-lang]").forEach(function (button) {
      button.addEventListener("click", function () { setLanguage(button.getAttribute("data-lang")); });
    });
    $$("[data-script]").forEach(function (button) {
      button.addEventListener("click", function () { setScript(button.getAttribute("data-script")); });
    });
    $$(".theme-swatch").forEach(function (button) {
      button.addEventListener("click", function () { setTheme(button.getAttribute("data-theme")); });
    });
    $$(".font-btn").forEach(function (button) {
      button.addEventListener("click", function () { setFontSize(button.getAttribute("data-font-size")); });
    });
    $$(".atmosphere-btn").forEach(function (button) {
      button.addEventListener("click", function () { setAtmosphere(button.getAttribute("data-atmosphere")); });
    });

    if (el.aboutBtn) el.aboutBtn.addEventListener("click", function () {
      if (el.aboutDialog && typeof el.aboutDialog.showModal === "function") el.aboutDialog.showModal();
    });
    if (el.printBtn) el.printBtn.addEventListener("click", printChant);

    el.playButtons.forEach(function (button) {
      button.addEventListener("click", togglePlay);
    });
    if (el.restartBtn) el.restartBtn.addEventListener("click", restartAudio);
    if (el.muteBtn) el.muteBtn.addEventListener("click", toggleMute);

    if (el.volumeSlider) {
      el.volumeSlider.addEventListener("input", function () {
        setAudioVolume(Number(el.volumeSlider.value));
        if (el.volumeValue) el.volumeValue.textContent = String(state.settings.volume);
        setRangeFill(el.volumeSlider);
      });
    }

    if (el.tempoSlider) {
      el.tempoSlider.addEventListener("input", function () {
        state.settings.rate = clamp(Number(el.tempoSlider.value), 0.75, 1.25);
        if (el.tempoValue) el.tempoValue.textContent = state.settings.rate.toFixed(2) + "×";
        applyRate();
        setRangeFill(el.tempoSlider);
        persist();
      });
    }

    if (el.fadeToggle) {
      el.fadeToggle.addEventListener("change", function () {
        state.settings.fade = el.fadeToggle.checked;
        if (!state.settings.fade) audio.volCurrent = audio.volTarget;
        applyVolume();
        persist();
      });
    }

    el.sourceTabs.forEach(function (tab) {
      tab.addEventListener("click", function () { setSource(tab.getAttribute("data-source")); });
    });

    if (el.connectBtn) el.connectBtn.addEventListener("click", function () { connectYouTube(false); });
    if (el.toggleVideoBtn) el.toggleVideoBtn.addEventListener("click", function () {
      state.settings.showVideo = !state.settings.showVideo;
      persist();
      renderSource();
    });

    if (el.chooseFileBtn && el.fileInput) {
      el.chooseFileBtn.addEventListener("click", function () { el.fileInput.click(); });
      el.fileInput.addEventListener("change", function () {
        if (el.fileInput.files && el.fileInput.files[0]) loadFile(el.fileInput.files[0]);
      });
    }

    if (el.seekBar) {
      el.seekBar.addEventListener("pointerdown", function () { ui.draggingSeek = true; });
      el.seekBar.addEventListener("input", function () {
        seekTo(Number(el.seekBar.value), true);
        if (el.timeNow) el.timeNow.textContent = formatTime(Number(el.seekBar.value));
        setRangeFill(el.seekBar);
      });
      el.seekBar.addEventListener("change", function () {
        ui.draggingSeek = false;
        seekTo(Number(el.seekBar.value));
      });
      el.seekBar.addEventListener("pointerup", function () { ui.draggingSeek = false; });
    }

    if (el.backBtn) el.backBtn.addEventListener("click", function () { seekTo(audio.position() - 15); });
    if (el.fwdBtn) el.fwdBtn.addEventListener("click", function () { seekTo(audio.position() + 15); });
    if (el.focusBtn) el.focusBtn.addEventListener("click", toggleFocus);

    if (el.roundGrid) {
      el.roundGrid.addEventListener("click", function (event) {
        var pill = event.target.closest("[data-round]");
        if (pill) jumpToSection(Number(pill.getAttribute("data-round")));
      });
    }
    if (el.jumpRail) {
      el.jumpRail.addEventListener("click", function (event) {
        var button = event.target.closest("[data-section]");
        if (button) jumpToSection(Number(button.getAttribute("data-section")));
      });
    }
    if (el.lineList) {
      el.lineList.addEventListener("click", function (event) {
        var button = event.target.closest("[data-index]");
        if (button) seekToLine(Number(button.getAttribute("data-index")));
      });
    }
    if (el.seekCurrentBtn) {
      el.seekCurrentBtn.addEventListener("click", function () {
        seekToLine(Timeline.lineAt(audio.position()).index);
      });
    }

    if (el.resetSessionBtn) el.resetSessionBtn.addEventListener("click", function () { resetSession(false); });
    if (el.historyBtn) el.historyBtn.addEventListener("click", openHistory);
    if (el.exportBtn) el.exportBtn.addEventListener("click", exportPractice);
    if (el.clearHistoryBtn) el.clearHistoryBtn.addEventListener("click", clearHistory);

    document.addEventListener("keydown", function (event) {
      var tag = (event.target.tagName || "").toLowerCase();
      if (event.target.isContentEditable || tag === "input" || tag === "textarea" || tag === "select" || tag === "button") return;
      if (document.querySelector("dialog[open]")) return;
      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        seekTo(audio.position() - (event.shiftKey ? 30 : 5));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        seekTo(audio.position() + (event.shiftKey ? 30 : 5));
      } else if (event.key.toLowerCase() === "m") {
        toggleMute();
      } else if (event.key.toLowerCase() === "f") {
        toggleFocus();
      }
    });

    document.addEventListener("visibilitychange", function () {
      ui.lastPosition = null;
      if (document.hidden) persist();
    });

    window.addEventListener("resize", resizeWorld);
    window.addEventListener("beforeunload", persist);

    window.addEventListener("pointermove", function (event) {
      if (!world.ready) return;
      world.pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      world.pointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    var canvas = document.getElementById("scene-canvas");
    if (canvas) {
      canvas.addEventListener("webglcontextlost", function (event) { event.preventDefault(); });
    }
  }

  /* ----------------------------------------------------- 12. LOOP AND TESTS */

  function loop(now) {
    var dt = Math.min(80, now - (world.lastFrame || now));
    world.lastFrame = now;

    if ((audio.playing || audio.pendingPause) && audio.volCurrent !== audio.volTarget) {
      if (now - (ui.lastFadeAt || 0) > 70) {
        ui.lastFadeAt = now;
        audio.volCurrent += (audio.volTarget - audio.volCurrent) * (state.settings.fade ? 0.28 : 1);
        if (Math.abs(audio.volTarget - audio.volCurrent) < 0.004) audio.volCurrent = audio.volTarget;
        applyVolume();
        if (audio.pendingPause && audio.volCurrent < 0.02) doPause();
      }
    }

    if (audio.playing && audio.source === "timer" && audio.position() >= audio.duration()) {
      doPause();
      renderNow(true);
    }

    if (now - ui.lastUiAt > 110) {
      ui.lastUiAt = now;
      renderNow(false);
      if (audio.playing && now - ui.lastPersistAt > 8000) {
        ui.lastPersistAt = now;
        persist();
      }
    }

    updateLevel();
    updateWorld(now, dt);
    window.requestAnimationFrame(loop);
  }

  function backgroundTick() {
    if (!audio.playing) return;
    var position = audio.position();
    processPlayback(position);
    if (audio.source === "timer" && position >= audio.duration()) {
      doPause();
      renderNow(true);
    }
  }

  function runSelfTests(verbose) {
    var checks = [];
    function check(name, pass, detail) {
      checks.push({ name: name, pass: !!pass, detail: detail || "" });
    }
    check("15 verses in the canonical dataset", VERSES.length === 15, String(VERSES.length));
    check("intro and dedication are present", INTRO.length === 3 && OUTRO.length === 2, INTRO.length + "/" + OUTRO.length);
    check("every verse has Pali, Roman, Thai and English", VERSES.every(function (v) {
      return v.pali.length > 20 && v.roman.length > 20 && v.th.length > 10 && v.en.length > 20;
    }));
    check("verse ids are unique", new Set(VERSES.map(function (v) { return v.id; })).size === VERSES.length);
    var defaults = defaultMarkers();
    check("11 default markers", defaults.length === 11, String(defaults.length));
    check("default markers strictly increase", defaults.every(function (v, i) { return i === 0 || v > defaults[i - 1]; }));
    check("timing sheet has nine complete rounds", (function () {
      var data = window.SUAT_TIMINGS;
      if (!data || !data.rounds) return false;
      for (var r = 1; r <= 9; r++) {
        if (!Array.isArray(data.rounds[r]) || data.rounds[r].length !== 15) return false;
      }
      return true;
    })());
    check("timing sheet starts strictly increase", (function () {
      var data = window.SUAT_TIMINGS;
      if (!data || !data.rounds) return false;
      for (var r = 1; r <= 9; r++) {
        var arr = data.rounds[r];
        for (var i = 1; i < arr.length; i++) if (arr[i] <= arr[i - 1]) return false;
      }
      return true;
    })());
    check("timing sheet anchors match section markers", (function () {
      var data = window.SUAT_TIMINGS;
      if (!data || !data.rounds) return false;
      for (var r = 1; r <= 9; r++) {
        if (Math.abs(data.rounds[r][0] - Timeline.markers()[r]) > 0.2) return false;
      }
      return true;
    })());
    check("sectionAt(0) is the intro", Timeline.sectionAt(0) === 0);
    check("sectionAt(round 1 + 1s) is round 1", Timeline.sectionAt(Timeline.markers()[1] + 1) === 1);
    check("sectionAt(end - 1) is the dedication", Timeline.sectionAt(audio.duration() - 1) === 10);
    check("lineAt(0) is the first intro line", Timeline.lineAt(0).section === 0 && Timeline.lineAt(0).index === 0);
    check("lineAt at round 1 starts at verse 1", Timeline.lineAt(Timeline.markers()[1] + 0.5).section === 1 && Timeline.lineAt(Timeline.markers()[1] + 0.5).index === 0);
    check("lineAt near the end is the dedication", Timeline.lineAt(audio.duration() - 2).section === 10);
    var monotonic = true;
    var last = -1;
    for (var s = 0; s <= 1000; s++) {
      var info = Timeline.lineAt((audio.duration() * s) / 1000);
      if (info.section < last) monotonic = false;
      last = info.section;
    }
    check("sections never move backwards across the timeline", monotonic);
    check("formatTime(5837) is 1:37:17", formatTime(5837) === "1:37:17", formatTime(5837));
    check("formatTime(0) is 0:00", formatTime(0) === "0:00");
    var streak = computeStreak([
      { date: addDays(dateKey(), -2), rounds: 9 },
      { date: addDays(dateKey(), -1), rounds: 9 },
      { date: dateKey(), rounds: 9 }
    ]);
    check("streak counts three consecutive days", streak === 3, String(streak));
    check("streak ignores incomplete sittings", computeStreak([{ date: dateKey(), rounds: 4 }]) === 0);
    var blank = normalizeStore(null);
    check("normalise creates nine empty rounds", blank.session.accum.length === 9 && blank.session.done.length === 9);
    check("normalise clamps volume and tempo", (function () {
      var n = normalizeStore({ settings: { volume: 1000, rate: 20 } });
      return n.settings.volume === 100 && n.settings.rate === 1.25;
    })());
    check("all static i18n keys exist in English and Thai", (function () {
      var keys = new Set();
      $$("[data-i18n]").forEach(function (node) { keys.add(node.getAttribute("data-i18n")); });
      $$("[data-i18n-html]").forEach(function (node) { keys.add(node.getAttribute("data-i18n-html")); });
      $$("[data-i18n-aria]").forEach(function (node) { keys.add(node.getAttribute("data-i18n-aria")); });
      var missing = [];
      keys.forEach(function (key) {
        if (I18N.en[key] == null || I18N.th[key] == null) missing.push(key);
      });
      return missing.length === 0;
    })());
    check("nine round labels resolve", (function () {
      for (var n = 1; n <= 9; n++) {
        if (!Timeline.label(n) || Timeline.label(n).indexOf("{n}") >= 0) return false;
      }
      return true;
    })());
    check("round grid renders nine controls", el.roundGrid && el.roundGrid.children.length === 9);
    check("jump rail renders eleven sections", el.jumpRail && el.jumpRail.children.length === 11);
    check("storage key is versioned", STORAGE_KEY === "suatsync3d.v1");

    var failed = checks.filter(function (c) { return !c.pass; }).length;
    if (verbose) {
      checks.forEach(function (c) {
        console.log((c.pass ? "PASS " : "FAIL ") + c.name + (c.detail && !c.pass ? " — " + c.detail : ""));
      });
    }
    return { pass: failed === 0, total: checks.length, failed: failed, checks: checks };
  }

  function init() {
    cacheElements();
    var saved = readStore();
    if (saved) state = normalizeStore(saved);

    var savedAt = state.session.savedAt ? Date.parse(state.session.savedAt) : 0;
    if (savedAt && Date.now() - savedAt > 24 * 3600 * 1000) {
      state.session.accum = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      state.session.done = [false, false, false, false, false, false, false, false, false];
      state.session.completedAt = null;
      state.session.startedAt = new Date().toISOString();
    }

    ui.lang = state.settings.lang;
    ui.script = state.settings.script;
    audio.source = "youtube";
    state.settings.source = "youtube";
    audio.volume = state.settings.volume / 100;
    audio.volTarget = audio.volume;
    audio.rate = state.settings.rate;
    audio.muted = false;
    audio.startAt = defaultMarkers()[1];
    audio.timerPos = audio.startAt;

    bindEvents();
    initWorld();
    applyAppearance();
    renderAll(true);
    if (el.fadeToggle) el.fadeToggle.checked = state.settings.fade;
    if (el.volumeSlider) el.volumeSlider.value = String(state.settings.volume);
    if (el.tempoSlider) el.tempoSlider.value = String(state.settings.rate);
    setRangeFill(el.volumeSlider);
    setRangeFill(el.tempoSlider);
    renderHistory();
    persist();

    if (!storageOK) window.setTimeout(function () { toast(t("storageOff")); }, 1200);
    if (!world.ready) document.body.classList.add("no-webgl");

    var noAuto = /(?:[?&])noauto=1(?:&|$)/.test(location.search);
    if (!noAuto) window.setTimeout(function () { connectYouTube(true); }, 250);

    window.requestAnimationFrame(loop);
    window.setInterval(backgroundTick, 1000);

    window.SuatSync = {
      version: VERSION,
      storageKey: STORAGE_KEY,
      chant: { intro: INTRO, verses: VERSES, outro: OUTRO },
      state: state,
      audio: audio,
      timeline: Timeline,
      world: world,
      t: t,
      lineAt: Timeline.lineAt,
      markers: Timeline.markers,
      setLanguage: setLanguage,
      setScript: setScript,
      setTheme: setTheme,
      setFontSize: setFontSize,
      setAtmosphere: setAtmosphere,
      jumpToSection: jumpToSection,
      seekToLine: seekToLine,
      seekTo: seekTo,
      play: playAudio,
      pause: pauseAudio,
      markRound: markRound,
      resetSession: resetSession,
      processPlayback: processPlayback,
      render: renderAll,
      runSelfTests: runSelfTests,
      renderHistory: renderHistory,
      computeStreak: computeStreak,
      defaultMarkers: defaultMarkers,
      setSource: setSource
    };
    document.documentElement.setAttribute("data-suat-sync", "ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
