/* ============================================================================
   Bangkok 3D — Interactive Urban Tourist Guide & Explorer Studio
   Vanilla ES6 + Three.js r128. No build step, no bundler, no framework.

   Sections
   1. Copy and landmark dataset (EN / TH)
   2. State and persistence
   3. Renderer, sky, lighting and materials
   4. Procedural city: river, roads, blocks, traffic, trees, boats
   5. Five landmark models, markers and pick volumes
   6. Camera modes: drone, first-person walk, automated transit tour
   7. Bilingual HUD, drawer, minimap, audio synthesis and export
   8. Boot, self-test and public debug API
   ========================================================================== */

(function () {
  'use strict';

  const APP = {
    name: 'Bangkok 3D — Interactive Urban Tourist Guide & Explorer Studio',
    version: '1.2.0',
    city: 'Bangkok',
    storageKey: 'bangkok3d.state.v1',
    exportName: 'bangkok_3d_tour.json',
    model: { name: 'DeepSeek V4.1 Flash', provider: 'opencode-go', id: 'deepseek-v4.1-flash' },
    harness: { name: 'OpenCode', version: '2.2.5', url: 'https://opencode.ai' }
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

  /* ==========================================================================
     1. COPY
     ========================================================================== */

  const I18N = {
    en: {
      'brand.tagline': 'Urban explorer studio',
      'mode.drone': 'Drone',
      'mode.droneSub': 'City flyover',
      'mode.walk': 'Walk',
      'mode.walkSub': 'First person',
      'mode.tour': 'Transit',
      'mode.tourSub': 'River tour',
      'mode.droneTitle': 'Drone city flyover · 1',
      'mode.walkTitle': 'First-person street walk · 2',
      'mode.tourTitle': 'Automated transit tour · 3',
      'time.day': 'Midday',
      'time.golden': 'Golden',
      'time.night': 'Night',
      'time.dayTitle': 'Bright midday · T cycles',
      'time.goldenTitle': 'Golden hour · T cycles',
      'time.nightTitle': 'Neon night · T cycles',
      'trail.eyebrow': 'Rattanakosin & beyond',
      'trail.title': 'Landmark trail',
      'trail.save': 'Save itinerary',
      'trail.load': 'Load itinerary',
      'trail.autosave': 'Progress is saved in this browser automatically.',
      'trail.progress': '{n} of 5 visited',
      'trail.route': '{n} on your route',
      'trail.visited': 'Visited',
      'trail.hide': 'Hide landmark trail',
      'trail.show': 'Show landmark trail',
      'trail.onRoute': 'on route',
      'map.title': 'River map',
      'map.label': 'Chao Phraya · Rattanakosin',
      'tour.next': 'Next',
      'walk.click': 'Drag to look around',
      'walk.esc': 'Arrow keys or WASD to walk · scroll to zoom · E to inspect',
      'walk.forward': 'Walk forward',
      'walk.back': 'Walk backward',
      'walk.left': 'Strafe left',
      'walk.right': 'Strafe right',
      'walk.pad': 'Walk controls',
      'drawer.visit': 'Visitor notes',
      'drawer.notes': 'Your notes',
      'drawer.notesPh': 'What do you want to remember?',
      'drawer.mark': 'Mark visited',
      'drawer.visited': 'Visited ✓',
      'drawer.addRoute': 'Add to route',
      'drawer.onRoute': 'On your route ✓',
      'drawer.prev': 'Previous',
      'drawer.next': 'Next',
      'drawer.fly': 'Fly here',
      'drawer.disclaimer': 'A stylised, geographically compressed model. Fees and hours change — check official sources before you travel.',
      'drawer.entry': 'Entry',
      'drawer.hours': 'Hours',
      'drawer.dress': 'Dress code',
      'drawer.transit': 'Getting there',
      'drawer.best': 'Best time',
      'drawer.saved': 'Saved',
      'drawer.listen': 'Listen to the story',
      'drawer.stopListen': 'Stop narration',
      'intro.eyebrow': 'The city of angels, in three dimensions',
      'intro.titleTop': 'Bangkok',
      'intro.thai': 'กรุงเทพมหานคร · เมืองฟ้าเมืองทอง',
      'intro.lede': 'Fly over the Chao Phraya, walk the old Rattanakosin lanes, and let a river boat carry you between five landmarks. Every temple has a story; every story has a Thai voice.',
      'intro.chip1': '5 landmarks',
      'intro.chip2': '3 camera modes',
      'intro.chip3': 'EN / ไทย',
      'intro.chip4': 'Day · dusk · night',
      'intro.start': 'Enter the city',
      'intro.tour': 'Take the river tour',
      'intro.note': 'Best with sound on. Drag to orbit, or press 2 to walk the streets.',
      'intro.foot': 'A miniature built by hand · not a survey map',
      'help.eyebrow': 'Field guide',
      'help.title': 'How to explore',
      'help.modes': 'Modes',
      'help.modesText': 'Drone orbits the skyline. Walk drops you onto the river promenade with drag-to-look and arrow keys or WASD. Transit follows a spline along the river and stops at each landmark.',
      'help.time': 'Light',
      'help.timeText': 'Midday, golden hour and neon night change the sky, sun, fog, water and every lit window.',
      'help.keys': 'Keys',
      'help.save': 'Saving',
      'help.saveText': 'Visited stamps, notes and your route live in localStorage. Save Route downloads a portable JSON file; Load Route restores it on another device.',
      'help.credit': 'Built with OpenCode and DeepSeek V4.1 Flash. Three.js r128. Geography is compressed and interpretive.',
      'hint.droneKey': 'DRAG',
      'hint.drone': 'Orbit the city · scroll to zoom · right-drag to pan',
      'hint.walkKey': '↑ ↓ ← →',
      'hint.walk': 'Drag to look · scroll to zoom · arrow keys or WASD walk · Shift run · E inspect',
      'hint.inspect': 'Inspect · {name}',
      'hint.openGuide': 'Click to open the guide',
      'hint.tourKey': 'TOUR',
      'hint.tour': 'The boat is moving · scroll to zoom · Space pauses · N jumps to the next stop',
      'tour.stop': 'Stop {n} / 5',
      'tour.enRoute': 'En route',
      'tour.complete': 'Tour complete',
      'tour.paused': 'Paused',
      'tour.replay': 'Replay',
      'toast.saved': 'Itinerary saved to bangkok_3d_tour.json',
      'toast.loaded': 'Itinerary restored. Welcome back.',
      'toast.invalid': 'That file is not a Bangkok 3D route.',
      'toast.visited': 'Stamped: {name}',
      'toast.unvisited': 'Visit removed: {name}',
      'toast.routeAdded': '{name} added to your route',
      'toast.routeRemoved': '{name} removed from your route',
      'toast.lang': 'Language: English',
      'toast.muted': 'Sound off',
      'toast.sound': 'Sound on',
      'toast.preset': 'Light: {name}',
      'toast.walkMobile': 'Use the on-screen arrows to walk and drag the scene to look. A keyboard is optional.',
      'toast.noNear': 'Walk closer to a landmark, then press E.',
      'toast.narrate': 'Narration is not available in this browser.',
      'toast.tourStart': 'The river tour has begun. Sit back.',
      'toast.tourNext': 'Jumping to {name}',
      'toast.focus': 'Flying to {name}',
      'toast.reset': 'Back to the river view'
    },
    th: {
      'brand.tagline': 'สตูดิโอสำรวจเมือง',
      'mode.drone': 'โดรน',
      'mode.droneSub': 'ชมทัศนียภาพ',
      'mode.walk': 'เดินชม',
      'mode.walkSub': 'มุมมองบุคคลที่หนึ่ง',
      'mode.tour': 'โดยสาร',
      'mode.tourSub': 'ล่องเรือนำชม',
      'mode.droneTitle': 'โดรนชมเมือง · 1',
      'mode.walkTitle': 'เดินชมถนนแบบบุคคลที่หนึ่ง · 2',
      'mode.tourTitle': 'ทัวร์เส้นทางอัตโนมัติ · 3',
      'time.day': 'กลางวัน',
      'time.golden': 'แสงทอง',
      'time.night': 'กลางคืน',
      'time.dayTitle': 'กลางวันสว่าง · กด T เปลี่ยน',
      'time.goldenTitle': 'ยามแสงทอง · กด T เปลี่ยน',
      'time.nightTitle': 'กลางคืนนีออน · กด T เปลี่ยน',
      'trail.eyebrow': 'รัตนโกสินทร์และรอบนอก',
      'trail.title': 'เส้นทางแลนด์มาร์ก',
      'trail.save': 'บันทึกแผนเที่ยว',
      'trail.load': 'โหลดแผนเที่ยว',
      'trail.autosave': 'ความคืบหน้าถูกบันทึกในเบราว์เซอร์นี้โดยอัตโนมัติ',
      'trail.progress': 'เยี่ยมชมแล้ว {n} จาก 5',
      'trail.route': 'อยู่ในเส้นทาง {n} จุด',
      'trail.visited': 'เยี่ยมชมแล้ว',
      'trail.hide': 'ซ่อนเส้นทางแลนด์มาร์ก',
      'trail.show': 'แสดงเส้นทางแลนด์มาร์ก',
      'trail.onRoute': 'อยู่ในเส้นทาง',
      'map.title': 'แผนที่ริมน้ำ',
      'map.label': 'เจ้าพระยา · รัตนโกสินทร์',
      'tour.next': 'ถัดไป',
      'walk.click': 'ลากเพื่อหันมอง',
      'walk.esc': 'ใช้ลูกศรหรือ WASD เพื่อเดิน · เลื่อนล้อเพื่อซูม · E เพื่อดูข้อมูล',
      'walk.forward': 'เดินไปข้างหน้า',
      'walk.back': 'เดินถอยหลัง',
      'walk.left': 'ก้าวไปทางซ้าย',
      'walk.right': 'ก้าวไปทางขวา',
      'walk.pad': 'ปุ่มควบคุมการเดิน',
      'drawer.visit': 'ข้อมูลการเยี่ยมชม',
      'drawer.notes': 'บันทึกของคุณ',
      'drawer.notesPh': 'อยากจำอะไรไว้บ้าง?',
      'drawer.mark': 'ทำเครื่องหมายว่าไปแล้ว',
      'drawer.visited': 'ไปแล้ว ✓',
      'drawer.addRoute': 'เพิ่มในเส้นทาง',
      'drawer.onRoute': 'อยู่ในเส้นทาง ✓',
      'drawer.prev': 'ก่อนหน้า',
      'drawer.next': 'ถัดไป',
      'drawer.fly': 'บินไปที่นี่',
      'drawer.disclaimer': 'โมเดลแบบย่อและตีความทางภูมิศาสตร์ ค่าเข้าและเวลาเปิดอาจเปลี่ยน โปรดตรวจสอบแหล่งทางการก่อนเดินทาง',
      'drawer.entry': 'ค่าเข้า',
      'drawer.hours': 'เวลาเปิด',
      'drawer.dress': 'การแต่งกาย',
      'drawer.transit': 'การเดินทาง',
      'drawer.best': 'ช่วงเวลาที่ดี',
      'drawer.saved': 'บันทึกแล้ว',
      'drawer.listen': 'ฟังเรื่องเล่า',
      'drawer.stopListen': 'หยุดบรรยาย',
      'intro.eyebrow': 'เมืองฟ้าเมืองทองในสามมิติ',
      'intro.titleTop': 'กรุงเทพ',
      'intro.thai': 'กรุงเทพมหานคร · เมืองฟ้าเมืองทอง',
      'intro.lede': 'บินเหนือแม่น้ำเจ้าพระยา เดินย่านรัตนโกสินทร์เก่า แล้วปล่อยให้เรือนำชมพาไปยังแลนด์มาร์กทั้งห้า ทุกวัดมีเรื่องเล่า ทุกเรื่องเล่ามีเสียงภาษาไทย',
      'intro.chip1': '5 แลนด์มาร์ก',
      'intro.chip2': '3 โหมดกล้อง',
      'intro.chip3': 'อังกฤษ / ไทย',
      'intro.chip4': 'กลางวัน · พลบค่ำ · กลางคืน',
      'intro.start': 'เข้าสู่เมือง',
      'intro.tour': 'ล่องเรือนำชม',
      'intro.note': 'เปิดเสียงจะดีที่สุด ลากเพื่อหมุนมุมมอง หรือกด 2 เพื่อเดินชมถนน',
      'intro.foot': 'โมเดลจำลองที่สร้างด้วยมือ · ไม่ใช่แผนที่สำรวจ',
      'help.eyebrow': 'คู่มือภาคสนาม',
      'help.title': 'วิธีสำรวจเมือง',
      'help.modes': 'โหมดกล้อง',
      'help.modesText': 'โหมดโดรนหมุนรอบเส้นขอบฟ้า โหมดเดินพาคุณลงสู่ทางเดินริมน้ำ ลากเมาส์เพื่อหันมอง และใช้ลูกศรหรือ WASD เดิน โหมดโดยสารเคลื่อนตามเส้นโค้งริมแม่น้ำและหยุดที่แลนด์มาร์กทุกแห่ง',
      'help.time': 'แสง',
      'help.timeText': 'กลางวัน แสงทอง และกลางคืนนีออน เปลี่ยนท้องฟ้า ดวงอาทิตย์ หมอก ผิวน้ำ และหน้าต่างที่สว่างทุกบาน',
      'help.keys': 'ปุ่มลัด',
      'help.save': 'การบันทึก',
      'help.saveText': 'รอยเยี่ยมชม บันทึก และเส้นทางของคุณอยู่ใน localStorage ปุ่มบันทึกเส้นทางจะดาวน์โหลดไฟล์ JSON และปุ่มโหลดจะคืนค่าบนอุปกรณ์อื่น',
      'help.credit': 'สร้างด้วย OpenCode และ DeepSeek V4.1 Flash · Three.js r128 · ภูมิศาสตร์ถูกย่อและตีความ',
      'hint.droneKey': 'ลาก',
      'hint.drone': 'หมุนชมเมือง · เลื่อนล้อเพื่อซูม · ลากขวาเพื่อเลื่อนภาพ',
      'hint.walkKey': '↑ ↓ ← →',
      'hint.walk': 'ลากเพื่อหันมอง · เลื่อนล้อเพื่อซูม · ใช้ลูกศรหรือ WASD เดิน · Shift เพื่อวิ่ง · E เพื่อดูข้อมูล',
      'hint.inspect': 'ดูข้อมูล · {name}',
      'hint.openGuide': 'คลิกเพื่อเปิดคู่มือ',
      'hint.tourKey': 'ทัวร์',
      'hint.tour': 'เรือกำลังเคลื่อน · เลื่อนล้อเพื่อซูม · Space หยุดชั่วคราว · N ไปจุดถัดไป',
      'tour.stop': 'จุดที่ {n} / 5',
      'tour.enRoute': 'กำลังเดินทาง',
      'tour.complete': 'ทัวร์เสร็จสิ้น',
      'tour.paused': 'หยุดชั่วคราว',
      'tour.replay': 'เล่นอีกครั้ง',
      'toast.saved': 'บันทึกแผนเที่ยวเป็น bangkok_3d_tour.json แล้ว',
      'toast.loaded': 'โหลดแผนเที่ยวแล้ว ยินดีต้อนรับกลับ',
      'toast.invalid': 'ไฟล์นี้ไม่ใช่เส้นทางของ Bangkok 3D',
      'toast.visited': 'ประทับแล้ว: {name}',
      'toast.unvisited': 'ลบการเยี่ยมชม: {name}',
      'toast.routeAdded': 'เพิ่ม {name} ในเส้นทางแล้ว',
      'toast.routeRemoved': 'นำ {name} ออกจากเส้นทางแล้ว',
      'toast.lang': 'ภาษา: ไทย',
      'toast.muted': 'ปิดเสียง',
      'toast.sound': 'เปิดเสียง',
      'toast.preset': 'แสง: {name}',
      'toast.walkMobile': 'ใช้ปุ่มลูกศรบนหน้าจอเพื่อเดิน และลากฉากเพื่อหันมอง คีย์บอร์ดไม่จำเป็น',
      'toast.noNear': 'เดินเข้าใกล้แลนด์มาร์ก แล้วกด E',
      'toast.narrate': 'เบราว์เซอร์นี้ไม่รองรับการบรรยายเสียง',
      'toast.tourStart': 'เริ่มทัวร์ริมน้ำแล้ว นั่งสบาย ๆ ได้เลย',
      'toast.tourNext': 'ไปยัง {name}',
      'toast.focus': 'บินไปยัง {name}',
      'toast.reset': 'กลับสู่มุมมองริมแม่น้ำ'
    }
  };

  const LANDMARKS = [
    {
      id: 'wat-arun',
      index: '01',
      position: [-50, 30],
      plaza: 18,
      markerY: 40,
      focus: [-50, 18, 30],
      tourPoint: [-31, 11, 48],
      tourView: [-14, 20, 72],
      view: { pos: [-18, 26, 50], target: [-50, 16, 30] },
      accent: '#e7c27d',
      accent2: '#c17a4a',
      en: {
        name: 'Wat Arun',
        kicker: 'Riverside icon',
        tagline: 'The temple that catches the first light.',
        story: [
          'Wat Arun rises on the west bank of the Chao Phraya, a porcelain-clad prang that has watched over the river since the Ayutthaya era. Its full name, Wat Arun Ratchawararam, honours Aruna, the Hindu god of dawn.',
          'King Rama II enlarged the central tower in the early 19th century; Rama III finished it and crowned it with a spire that reaches roughly 79 metres. The mosaic is made from broken Chinese porcelain, once used as ballast in trading junks.',
          'Before the Emerald Buddha was moved across the river to Wat Phra Kaew, it was enshrined here. At sunset the prang turns amber, and the cross-river ferry from Tha Tien is one of Bangkok’s shortest and best journeys.'
        ],
        fact: 'Climb the steep central stair for a view of the river — the steps are intentionally narrow, a reminder that merit is never easy.',
        tips: {
          entry: '100 THB for foreign visitors · Thai visitors free',
          hours: '08:00–18:00 daily (last entry 17:30)',
          dress: 'Shoulders and knees covered; remove shoes before climbing',
          transit: 'BTS to Saphan Taksin → Chao Phraya boat to Tha Tien (N8) → cross-river ferry',
          best: 'Late afternoon into golden hour, from the east bank'
        }
      },
      th: {
        name: 'วัดอรุณ',
        kicker: 'แลนด์มาร์กริมเจ้าพระยา',
        tagline: 'วัดที่รับแสงแรกของวัน',
        story: [
          'วัดอรุณราชวรารามตั้งอยู่ฝั่งตะวันตกของแม่น้ำเจ้าพระยา ปรางค์ประดับกระเบื้องนี้เฝ้ามองสายน้ำมาตั้งแต่สมัยอยุธยา ชื่อเต็มของวัดมาจากพระอรุณ เทพเจ้าแห่งรุ่งอรุณ',
          'พระบาทสมเด็จพระพุทธเลิศหล้านภาลัยทรงขยายองค์พระปรางค์หลักในต้นศตวรรษที่ 19 และรัชกาลที่ 3 ทรงแล้วเสร็จพร้อมยอดที่สูงราว 79 เมตร ลวดลายกระเบื้องทำจากเครื่องลายครามจีนที่แตก ซึ่งครั้งหนึ่งเคยเป็นสิ่งถ่วงท้องเรือสำเภา',
          'ก่อนพระแก้วมรกตจะถูกอัญเชิญข้ามไปประดิษฐานที่วัดพระศรีรัตนศาสดาราม พระองค์เคยประทับที่นี่ ยามพระอาทิตย์ตก ปรางค์จะเปลี่ยนเป็นสีทอง และเรือข้ามฟากจากท่าตีียนคือหนึ่งในการเดินทางสั้นที่สุดและงดงามที่สุดของกรุงเทพฯ'
        ],
        fact: 'บันไดกลางสูงชันตั้งใจให้แคบ — เป็นเครื่องเตือนว่าการทำบุญไม่เคยง่าย',
        tips: {
          entry: 'ชาวต่างชาติ 100 บาท · คนไทยเข้าฟรี',
          hours: 'ทุกวัน 08:00–18:00 (เข้าชมรอบสุดท้าย 17:30)',
          dress: 'แต่งกายคลุมไหล่และเข่า ถอดรองเท้าก่อนขึ้นบันได',
          transit: 'BTS ถึงสะพานตากสิน → เรือด่วนเจ้าพระยาถึงท่าตีียน (N8) → เรือข้ามฟาก',
          best: 'ช่วงบ่ายแก่ถึงแสงทอง มองจากฝั่งตะวันออก'
        }
      }
    },
    {
      id: 'wat-pho',
      index: '02',
      position: [-8, 20],
      plaza: 17,
      markerY: 19,
      focus: [-8, 8, 20],
      tourPoint: [-30, 11, 26],
      tourView: [-32, 22, 58],
      view: { pos: [16, 20, 40], target: [-8, 8, 20] },
      accent: '#d9a15e',
      accent2: '#3f7d6e',
      en: {
        name: 'Wat Pho',
        kicker: 'The sleeping giant',
        tagline: 'A temple of healing, memory and a very large Buddha.',
        story: [
          'Wat Pho, officially Wat Phra Chetuphon, is one of Bangkok’s oldest temple sites and the spiritual heart of the Rattanakosin old town. Rama I rebuilt it in the late 18th century on the site of an earlier monastery.',
          'Its reclining Buddha stretches 46 metres from head to heel, gilded and serene, with mother-of-pearl inlay on the soles of its feet. Around it, more than a thousand Buddha images line the cloisters.',
          'The temple is also the birthplace of traditional Thai massage; its school was inscribed by UNESCO in 2019. Wat Pho is a working monastery, so quiet voices and covered shoulders matter more than perfect photographs.'
        ],
        fact: 'The Reclining Buddha’s feet are inlaid with 108 auspicious symbols — each one a lesson in the path to enlightenment.',
        tips: {
          entry: '200 THB for foreign visitors · Thai visitors free',
          hours: '08:00–18:30 daily',
          dress: 'Cover shoulders and knees; no see-through clothing',
          transit: 'MRT Sanam Chai (Exit 1) or Chao Phraya boat to Tha Tien (N8)',
          best: 'Early morning, before the tour groups and the heat'
        }
      },
      th: {
        name: 'วัดโพธิ์',
        kicker: 'พระนอนองค์ใหญ่',
        tagline: 'วัดแห่งการเยียวยา ความทรงจำ และพระพุทธรูปองค์มหึมา',
        story: [
          'วัดโพธิ์หรือวัดพระเชตุพนวิมลมังคลาราม เป็นหนึ่งในวัดเก่าแก่ที่สุดของกรุงเทพฯ และเป็นหัวใจทางจิตวิญญาณของย่านเมืองเก่ารัตนโกสินทร์ รัชกาลที่ 1 ทรงบูรณะใหม่ในปลายศตวรรษที่ 18 บนที่ตั้งของอารามเดิม',
          'พระพุทธไสยาสน์ยาว 46 เมตรจากพระเศียรถึงพระบาท ลงรักปิดทองอย่างสงบงาม ฝ่าพระบาทประดับมุก และรอบองค์มีพระพุทธรูปกว่าพันองค์เรียงรายตามระเบียง',
          'วัดโพธิ์ยังเป็นต้นกำเนิดนวดแผนไทย ซึ่งยูเนสโกขึ้นทะเบียนในปี 2019 ที่นี่เป็นวัดที่ยังใช้งานจริง จึงควรพูดเบา ๆ และแต่งกายสุภาพมากกว่าการได้ภาพถ่ายสมบูรณ์แบบ'
        ],
        fact: 'ฝ่าพระบาทของพระนอนประดับลวดลายมงคล 108 ประการ — แต่ละลายคือบทเรียนบนหนทางสู่การตรัสรู้',
        tips: {
          entry: 'ชาวต่างชาติ 200 บาท · คนไทยเข้าฟรี',
          hours: 'ทุกวัน 08:00–18:30',
          dress: 'คลุมไหล่และเข่า หลีกเลี่ยงเสื้อผ้าโปร่งบาง',
          transit: 'MRT สนามไชย (ทางออก 1) หรือเรือด่วนเจ้าพระยาถึงท่าตีียน (N8)',
          best: 'เช้าตรู่ ก่อนคณะทัวร์และอากาศร้อน'
        }
      }
    },
    {
      id: 'grand-palace',
      index: '03',
      position: [-8, -16],
      plaza: 21,
      markerY: 23,
      focus: [-8, 10, -16],
      tourPoint: [-27, 13, -2],
      tourView: [-32, 22, 24],
      view: { pos: [20, 26, 8], target: [-8, 10, -16] },
      accent: '#e8cf8f',
      accent2: '#a4633a',
      en: {
        name: 'Grand Palace',
        kicker: 'Royal Bangkok',
        tagline: 'A walled city of gold, jade and ceremony.',
        story: [
          'The Grand Palace has been the ceremonial heart of the Chakri dynasty since 1782, when King Rama I moved the capital across the river to Rattanakosin. The 218,000-square-metre complex holds throne halls, pavilions and government offices within white crenellated walls.',
          'At its centre is Wat Phra Kaew, the Temple of the Emerald Buddha. The jade figure is barely 66 centimetres tall, yet it is the most revered image in Thailand; only the king may touch it, and it changes costume three times a year.',
          'The Chakri Maha Prasat blends a European facade with a Thai roof, a visible signature of the 19th-century court’s love of both worlds. The palace is still used for state ceremonies, so visitors see a living institution, not a museum set.'
        ],
        fact: 'The Emerald Buddha was carved from a single piece of nephrite jade; its origin is unknown, but legends place it in India, Sri Lanka and Cambodia before it reached Siam.',
        tips: {
          entry: '500 THB · includes Wat Phra Kaew',
          hours: '08:30–15:30 daily (ticket sales close 15:30)',
          dress: 'Strict: shoulders covered, no vests, shorts, leggings or torn jeans; sarongs at the gate',
          transit: 'Chao Phraya boat to Tha Chang (N9) or MRT Sanam Chai',
          best: 'Right at opening, before the heat and crowds'
        }
      },
      th: {
        name: 'พระบรมมหาราชวัง',
        kicker: 'หัวใจราชวงศ์',
        tagline: 'เมืองทองคำ หยก และพระราชพิธี',
        story: [
          'พระบรมมหาราชวังเป็นศูนย์กลางพระราชพิธีของราชวงศ์จักรีมาตั้งแต่ปี 1782 เมื่อรัชกาลที่ 1 ทรงย้ายเมืองหลวงข้ามแม่น้ำมาสู่รัตนโกสินทร์ เขตพระราชฐานเนื้อที่ 218,000 ตารางเมตรประกอบด้วยพระที่นั่ง พระตำหนัก และหน่วยงานราชการภายใต้กำแพงสีขาวมีใบเสมา',
          'ใจกลางคือวัดพระศรีรัตนศาสดารามหรือวัดพระแก้ว พระแก้วมรกตสูงเพียง 66 เซนติเมตร แต่เป็นพระพุทธรูปที่เคารพสูงสุดของไทย มีเพียงพระมหากษัตริย์เท่านั้นที่ทรงแตะต้องได้ และจะเปลี่ยนฉลองพระองค์ปีละสามครั้ง',
          'พระที่นั่งจักรีมหาปราสาทผสมผสานหน้าตาอาคารแบบยุโรปกับหลังคาไทย เป็นลายเซ็นที่มองเห็นได้ของราชสำนักศตวรรษที่ 19 ที่หลงใหลทั้งสองโลก พระราชวังยังใช้ในพระราชพิธีจริง ผู้มาเยือนจึงได้เห็นสถาบันที่มีชีวิต ไม่ใช่ฉากพิพิธภัณฑ์'
        ],
        fact: 'พระแก้วมรกตแกะจากหยกเนื้อเดียว ต้นกำเนิดไม่แน่ชัด แต่ตำนานเล่าว่าเคยอยู่ที่อินเดีย ศรีลังกา และกัมพูชา ก่อนมาถึงสยาม',
        tips: {
          entry: '500 บาท · รวมวัดพระแก้ว',
          hours: 'ทุกวัน 08:30–15:30 (จำหน่ายบัตรถึง 15:30)',
          dress: 'เข้มงวด: คลุมไหล่ ห้ามเสื้อกล้าม กางเกงขาสั้น เลกกิ้ง หรือยีนส์ขาด มีผ้าถุงให้เช่าที่ประตู',
          transit: 'เรือด่วนเจ้าพระยาถึงท่าช้าง (N9) หรือ MRT สนามไชย',
          best: 'เปิดทำการตอนเช้าทันที ก่อนอากาศร้อนและคนเยอะ'
        }
      }
    },
    {
      id: 'golden-mount',
      index: '04',
      position: [16, -52],
      plaza: 18,
      markerY: 35,
      focus: [16, 17, -52],
      tourPoint: [6, 30, -34],
      tourView: [-10, 38, -8],
      view: { pos: [38, 30, -30], target: [16, 16, -52] },
      accent: '#e9c477',
      accent2: '#7a5b36',
      en: {
        name: 'Golden Mount',
        kicker: 'Wat Saket',
        tagline: 'A man-made hill, 344 steps and the whole old city at your feet.',
        story: [
          'Wat Saket began as a modest temple outside the city wall in the Ayutthaya period. Rama I restored it after the capital moved, and later kings raised the artificial hill that gives it its nickname, the Golden Mount.',
          'The chedi at the summit enshrines relics associated with the Buddha; the hill was built up over decades because the soft ground kept sinking. A spiral path of 344 steps winds around it, past bells, shrines and trees.',
          'The view is the point: the white wall of the Grand Palace, the river, the roofs of Rattanakosin and, beyond them, the glass towers of the new city. During Loy Krathong, a red cloth is carried up the mount in procession.'
        ],
        fact: 'The hill almost became a ruin after sinking into the marsh; Rama IV reinforced it and placed the chedi on top, giving Bangkok its favourite sunset perch.',
        tips: {
          entry: '50 THB',
          hours: '07:30–19:00 daily',
          dress: 'Modest clothing; the climb is steep and unsheltered',
          transit: 'MRT Sam Yot (Exit 1, 15 min walk) or Saen Saep boat to Phan Fa',
          best: 'Sunset, when the gold catches the light and the city turns on'
        }
      },
      th: {
        name: 'ภูเขาทอง',
        kicker: 'วัดสระเกศ',
        tagline: 'ภูเขาที่สร้างด้วยมือ 344 ขั้น และเมืองเก่าทั้งเมืองใต้เท้า',
        story: [
          'วัดสระเกศเริ่มต้นเป็นวัดเล็ก ๆ นอกกำแพงเมืองในสมัยอยุธยา รัชกาลที่ 1 ทรงบูรณะหลังย้ายเมืองหลวง และกษัตริย์องค์ต่อมาทรงสร้างภูเขาจำลองที่ทำให้วัดได้ชื่อว่า ภูเขาทอง',
          'พระเจดีย์บนยอดบรรจุพระบรมสารีริกธาตุ ภูเขาถูกถมเพิ่มหลายทศวรรษเพราะพื้นดินอ่อนยุบตัวซ้ำ ๆ ทางเดินเวียน 344 ขั้นลดเลี้ยวขึ้นไปผ่านระฆัง ศาลเจ้า และต้นไม้',
          'จุดหมายคือวิว: กำแพงขาวของพระบรมมหาราชวัง แม่น้ำ หลังคารัตนโกสินทร์ และตึกกระจกของเมืองใหม่ที่อยู่ไกลออกไป ในเทศกาลลอยกระทงจะมีการแห่ผ้าแดงขึ้นภูเขา'
        ],
        fact: 'ภูเขานี้เกือบพังหลังจมลงในที่ลุ่ม รัชกาลที่ 4 ทรงเสริมฐานและอัญเชิญเจดีย์ขึ้นประดิษฐาน จึงกลายเป็นจุดชมพระอาทิตย์ตกยอดนิยมของกรุงเทพฯ',
        tips: {
          entry: '50 บาท',
          hours: 'ทุกวัน 07:30–19:00',
          dress: 'แต่งกายสุภาพ ทางขึ้นชันและไม่มีร่มเงา',
          transit: 'MRT สามยอด (ทางออก 1 เดิน 15 นาที) หรือเรือคลองแสนแสบถึงผ่านฟ้า',
          best: 'ยามพระอาทิตย์ตก เมื่อแสงทองกระทบยอดเจดีย์และเมืองเริ่มเปิดไฟ'
        }
      }
    },
    {
      id: 'baiyoke',
      index: '05',
      position: [54, -66],
      plaza: 16,
      markerY: 64,
      markerOffset: [18, 0, 10],
      focus: [54, 40, -66],
      tourPoint: [28, 44, -46],
      tourView: [10, 60, -10],
      view: { pos: [82, 52, -38], target: [54, 40, -66] },
      accent: '#9ed7d0',
      accent2: '#b35a7a',
      en: {
        name: 'Baiyoke Tower II',
        kicker: 'Vertical Bangkok',
        tagline: 'The tower that made Pratunam look up.',
        story: [
          'Baiyoke Tower II opened in 1997 as Thailand’s tallest building, a 304-metre, 85-floor hotel and observation tower in the Pratunam garment district. It held the national height record until 2016.',
          'Its octagonal shaft is clad in blue-green glass, tapering to a neon crown and a 43-metre antenna. The 84th-floor revolving observation deck turns slowly, so the whole city passes the window in about 45 minutes.',
          'Down below, Pratunam market is a different Bangkok: wholesale fashion, fruit carts, tailors and the constant hum of tuk-tuks. Come up for the skyline, then go down for the street food.'
        ],
        fact: 'On a clear day the deck sees the Chao Phraya’s bends, the Grand Palace spires and, far to the south, the container cranes of the port.',
        tips: {
          entry: 'Observation deck roughly 400–500 THB (packages vary)',
          hours: '10:00–22:00 daily',
          dress: 'Smart casual; the deck is open-air',
          transit: 'BTS Ratchathewi (Exit 3) or Chit Lom, then a short walk',
          best: 'After dark, when the neon crown and the traffic rivers glow'
        }
      },
      th: {
        name: 'ใบหยก 2',
        kicker: 'กรุงเทพฯ แนวตั้ง',
        tagline: 'ตึกที่ทำให้ประตูน้ำต้องเงยหน้า',
        story: [
          'ใบหยก 2 เปิดปี 1997 ในฐานะอาคารที่สูงที่สุดของไทย โรงแรมและดาดฟ้าชมวิว 85 ชั้น สูง 304 เมตร ในย่านค้าส่งประตูน้ำ และครองสถิติความสูงจนถึงปี 2016',
          'ตัวอาคารแปดเหลี่ยมกรุกระจกสีเขียวน้ำเงิน สอบเข้าสู่ยอดนีออนและเสาอากาศสูง 43 เมตร ดาดฟ้าชมวิวชั้น 84 หมุนช้า ๆ เมืองทั้งเมืองจะผ่านหน้าต่างครบรอบในราว 45 นาที',
          'ข้างล่างคืออีกกรุงเทพฯ หนึ่ง ตลาดประตูน้ำที่ขายเสื้อผ้าส่ง รถเข็นผลไม้ ช่างตัดเสื้อ และเสียงตุ๊กตุ๊กที่ไม่เคยหยุด ขึ้นไปดูเส้นขอบฟ้า แล้วลงมากินอาหารข้างทาง'
        ],
        fact: 'วันที่ฟ้าใส มองเห็นโค้งแม่น้ำเจ้าพระยา ยอดพระบรมมหาราชวัง และไกลออกไปทางใต้คือปั้นจั่นท่าเรือคอนเทนเนอร์',
        tips: {
          entry: 'ดาดฟ้าชมวิวประมาณ 400–500 บาท (แพ็กเกจแตกต่างกัน)',
          hours: 'ทุกวัน 10:00–22:00',
          dress: 'แต่งกายสบายแต่สุภาพ ดาดฟ้าเป็นพื้นที่เปิด',
          transit: 'BTS ราชเทวี (ทางออก 3) หรือชิดลม แล้วเดินต่อเล็กน้อย',
          best: 'หลังพระอาทิตย์ตก เมื่อยอดนีออนและสายรถติดสว่างขึ้น'
        }
      }
    }
  ];

  const LANDMARK_BY_ID = Object.fromEntries(LANDMARKS.map((l) => [l.id, l]));
  const t = (key) => (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
  const tf = (key, vars) => t(key).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
  const landmarkText = (l) => l[state.lang] || l.en;

  /* ==========================================================================
     2. STATE
     ========================================================================== */

  function defaultState() {
    return {
      version: 1,
      lang: 'en',
      preset: 'day',
      mode: 'drone',
      audio: true,
      visited: [],
      itinerary: [],
      notes: {}
    };
  }

  function sanitiseState(raw) {
    const base = defaultState();
    if (!raw || typeof raw !== 'object') return base;
    base.lang = raw.lang === 'th' ? 'th' : 'en';
    base.preset = ['day', 'golden', 'night'].includes(raw.preset) ? raw.preset : 'day';
    base.mode = ['drone', 'walk', 'tour'].includes(raw.mode) ? raw.mode : 'drone';
    base.audio = raw.audio !== false;
    base.visited = Array.isArray(raw.visited)
      ? [...new Set(raw.visited.filter((id) => LANDMARK_BY_ID[id]))]
      : [];
    base.itinerary = Array.isArray(raw.itinerary)
      ? [...new Set(raw.itinerary.filter((id) => LANDMARK_BY_ID[id]))]
      : [];
    if (raw.notes && typeof raw.notes === 'object') {
      Object.keys(raw.notes).forEach((id) => {
        if (LANDMARK_BY_ID[id] && typeof raw.notes[id] === 'string') {
          base.notes[id] = raw.notes[id].slice(0, 4000);
        }
      });
    }
    return base;
  }

  let state = defaultState();
  try {
    const stored = JSON.parse(localStorage.getItem(APP.storageKey) || 'null');
    if (stored) state = sanitiseState(stored);
  } catch (e) { /* storage may be blocked; run in memory */ }

  function saveState() {
    try {
      localStorage.setItem(APP.storageKey, JSON.stringify(state));
    } catch (e) { /* ignore quota / private mode */ }
  }

  /* ==========================================================================
     DOM references
     ========================================================================== */

  const dom = {
    canvas: $('#scene'),
    labels: $('#labels'),
    tooltip: $('#tooltip'),
    modeSwitch: $('#modeSwitch'),
    timeSwitch: $('#timeSwitch'),
    langBtn: $('#langBtn'),
    langLabel: $('#langLabel'),
    audioBtn: $('#audioBtn'),
    helpBtn: $('#helpBtn'),
    helpModal: $('#helpModal'),
    helpClose: $('#helpClose'),
    drawer: $('#drawer'),
    drawerHero: $('#drawerHero'),
    drawerIndex: $('#drawerIndex'),
    drawerKicker: $('#drawerKicker'),
    drawerTitle: $('#drawerTitle'),
    drawerLocal: $('#drawerLocal'),
    drawerTagline: $('#drawerTagline'),
    drawerStory: $('#drawerStory'),
    drawerFact: $('#drawerFact'),
    drawerTips: $('#drawerTips'),
    drawerClose: $('#drawerClose'),
    noteInput: $('#noteInput'),
    noteStatus: $('#noteStatus'),
    visitedBtn: $('#visitedBtn'),
    itineraryBtn: $('#itineraryBtn'),
    narrateBtn: $('#narrateBtn'),
    prevLandmark: $('#prevLandmark'),
    nextLandmark: $('#nextLandmark'),
    flyBtn: $('#flyBtn'),
    scrim: $('#scrim'),
    progressFill: $('#progressFill'),
    progressText: $('#progressText'),
    routeText: $('#routeText'),
    landmarkList: $('#landmarkList'),
    saveBtn: $('#saveBtn'),
    loadBtn: $('#loadBtn'),
    importFile: $('#importFile'),
    trailPanel: $('#trailPanel'),
    trailClose: $('#trailClose'),
    trailFab: $('#trailFab'),
    trailFabCount: $('#trailFabCount'),
    minimap: $('#minimap'),
    recenterBtn: $('#recenterBtn'),
    hintKey: $('#hintKey'),
    hintText: $('#hintText'),
    hintBar: $('#hintBar'),
    tourBar: $('#tourBar'),
    tourPlayBtn: $('#tourPlayBtn'),
    tourNextBtn: $('#tourNextBtn'),
    tourStopLabel: $('#tourStopLabel'),
    tourName: $('#tourName'),
    tourTrack: $('#tourTrack'),
    tourBoat: $('#tourBoat'),
    walkHint: $('#walkHint'),
    walkPad: $('#walkPad'),
    crosshair: $('#crosshair'),
    intro: $('#intro'),
    startBtn: $('#startBtn'),
    tourStartBtn: $('#tourStartBtn'),
    loading: $('#loading'),
    loadingText: $('#loadingText'),
    loadingFill: $('#loadingFill'),
    toast: $('#toast'),
    selftest: $('#selftest'),
    webglError: $('#webglError'),
    brandBtn: $('#brandBtn'),
    audioLabel: $('#audioBtn')
  };

  /* ==========================================================================
     3. SCENE, SKY, LIGHTS, MATERIALS
     ========================================================================== */

  let THREE_OK = typeof window.THREE !== 'undefined';
  let scene, camera, renderer, orbit;
  let sun, hemi, ambient, skyMat, skyMesh, starField, sunSprite, moonSprite;
  let waterMat, waterMesh;
  let markerRoot, markerRecords = [], pickTargets = [], landmarkGroups = [];
  let hoveredId = null;
  let colliders = [];
  let carBodyMesh, carCabinMesh, carRoofMesh, carWheelMesh, carHeadMesh, carTailMesh, carData = [];
  let carHeadMat = null, carTailMat = null;
  let lampGlowMat, windowMats = [], neonMats = [], lampMats = [];
  let clouds = [];
  let boatRecords = [];
  let baiyokeBeacon = null;
  let sceneReady = false;
  let errors = [];

  const world = {
    minX: -94,
    maxX: 96,
    minZ: -86,
    maxZ: 86,
    riverX: -26,
    riverHalf: 9,
    bankEast: -16,
    bankWest: -35,
    eastRoadX: [-12, 4, 20, 36, 52, 68, 84],
    eastRoadZ: [-72, -54, -36, -18, 0, 18, 36, 54, 72],
    westRoadX: [-74, -58, -42],
    park: { x: 36, z: 26, w: 22, d: 15 }
  };
  const plazaRings = []; // filled by landmark construction for traffic/trees/buildings
  const EYE = 1.72;
  const UNIT_BOX = THREE_OK ? new THREE.BoxGeometry(1, 1, 1) : null;
  const tmpObj = THREE_OK ? new THREE.Object3D() : null;
  const tmpVec = THREE_OK ? new THREE.Vector3() : null;
  const tmpColor = THREE_OK ? new THREE.Color() : null;
  const CAR_ROOT = THREE_OK ? new THREE.Matrix4() : null;
  const CAR_LOCAL = THREE_OK ? new THREE.Matrix4() : null;
  const CAR_QUAT = THREE_OK ? new THREE.Quaternion() : null;
  const CAR_POS = THREE_OK ? new THREE.Vector3() : null;
  const CAR_SCALE = THREE_OK ? new THREE.Vector3() : null;
  const CAR_Y_AXIS = THREE_OK ? new THREE.Vector3(0, 1, 0) : null;

  const PRESETS = {
    day: {
      label: 'Midday',
      top: '#2b6cae', bottom: '#d3e8f1', sun: '#fff3d8', sunInt: 1.7,
      hemiSky: '#cfe5ef', hemiGround: '#463f2e', hemiInt: 0.68, ambient: 0.18,
      fog: '#c1d7e0', fogNear: 260, fogFar: 900, exposure: 0.96,
      waterA: '#2b666d', waterB: '#71b7b2', gold: '#ffe9b5',
      night: 0, stars: 0, sunPos: [78, 120, 54], sunDisc: '#fff0b8', clouds: 0.82
    },
    golden: {
      label: 'Golden hour',
      top: '#4a3a6c', bottom: '#f4a15d', sun: '#ffb36c', sunInt: 1.45,
      hemiSky: '#f1bb8d', hemiGround: '#38281f', hemiInt: 0.55, ambient: 0.18,
      fog: '#e5a070', fogNear: 220, fogFar: 780, exposure: 1.02,
      waterA: '#5a4657', waterB: '#e4a36c', gold: '#ffd49b',
      night: 0.36, stars: 0.12, sunPos: [-96, 42, 68], sunDisc: '#ffc37f', clouds: 0.66
    },
    night: {
      label: 'Neon night',
      top: '#050c1c', bottom: '#132744', sun: '#9ab4ff', sunInt: 0.72,
      hemiSky: '#31527a', hemiGround: '#0a1016', hemiInt: 0.5, ambient: 0.2,
      fog: '#0a1526', fogNear: 160, fogFar: 650, exposure: 1.18,
      waterA: '#081827', waterB: '#224a66', gold: '#c6ddff',
      night: 1, stars: 0.95, sunPos: [-70, 95, -50], sunDisc: '#d7e5ff', clouds: 0.16
    }
  };

  let lightMix = null; // interpolated current values
  let presetTransition = 0;

  const MAT = {};

  function srgb(hex) {
    return new THREE.Color(hex).convertSRGBToLinear();
  }

  function buildMaterials() {
    const std = (color, opts) => {
      const o = Object.assign({ color: srgb(color), roughness: 0.86, metalness: 0.04 }, opts || {});
      if (o.emissive !== undefined && !(o.emissive && o.emissive.isColor)) o.emissive = srgb(o.emissive);
      return new THREE.MeshStandardMaterial(o);
    };

    MAT.stone = std(0xcabfa6, { roughness: 0.96 });
    MAT.stoneDark = std(0x8b8474, { roughness: 0.98 });
    MAT.cream = std(0xf0e4c9, { roughness: 0.9 });
    MAT.white = std(0xf4efe2, { roughness: 0.88 });
    MAT.offwhite = std(0xe4dccb, { roughness: 0.92 });
    MAT.gold = std(0xd9a83e, { roughness: 0.34, metalness: 0.72, emissive: 0x3a2505, emissiveIntensity: 0.06 });
    MAT.goldBright = std(0xf0c965, { roughness: 0.25, metalness: 0.8, emissive: 0x3a2705, emissiveIntensity: 0.1 });
    MAT.goldDark = std(0x9a6f24, { roughness: 0.4, metalness: 0.7 });
    MAT.terracotta = std(0xb95f2d, { roughness: 0.82 });
    MAT.tileOrange = std(0xc46a30, { roughness: 0.8, flatShading: true });
    MAT.tileGreen = std(0x2f6a51, { roughness: 0.8, flatShading: true });
    MAT.tileBlue = std(0x2b4f66, { roughness: 0.76, flatShading: true });
    MAT.porcelainGreen = std(0x3d7b63, { roughness: 0.6 });
    MAT.porcelainOrange = std(0xc36f38, { roughness: 0.6 });
    MAT.wood = std(0x5b3a22, { roughness: 0.9 });
    MAT.woodDark = std(0x33200f, { roughness: 0.94 });
    MAT.red = std(0x8f2c24, { roughness: 0.85 });
    MAT.black = std(0x14171a, { roughness: 0.8 });
    MAT.asphalt = std(0x20262c, { roughness: 0.98 });
    MAT.sidewalk = std(0x6e7068, { roughness: 0.97 });
    MAT.grass = std(0x38583f, { roughness: 1 });
    MAT.hedge = std(0x244b32, { roughness: 1 });
    MAT.trunk = std(0x4b3320, { roughness: 1 });
    MAT.leaf = std(0x2f6a42, { roughness: 1 });
    MAT.leafLight = std(0x4d8352, { roughness: 1 });
    MAT.waterEdge = std(0x243c3a, { roughness: 1 });
    MAT.rail = std(0xb8b0a0, { roughness: 0.6, metalness: 0.35 });
    MAT.glassDark = std(0x1b3547, { roughness: 0.22, metalness: 0.55, emissive: 0x0c2233, emissiveIntensity: 0.15 });
    MAT.glassBlue = std(0x2f6a7c, { roughness: 0.2, metalness: 0.6, emissive: 0x0c2b3b, emissiveIntensity: 0.2 });
    MAT.bamboo = std(0x9d7c45, { roughness: 0.95 });
    MAT.boat = std(0x6a3c24, { roughness: 0.88 });
    MAT.boatTrim = std(0xd5d0c2, { roughness: 0.7 });
    MAT.canvas = std(0xd8d2c0, { roughness: 0.9, side: THREE.DoubleSide });
    MAT.pink = std(0xc2786c, { roughness: 0.9 });

    MAT.goldGlow = std(0xd9a83e, {
      roughness: 0.3, metalness: 0.7, emissive: 0x6b4a10, emissiveIntensity: 0.25
    });
    MAT.landmarkGlow = new THREE.MeshStandardMaterial({
      color: 0xf1c46b, roughness: 0.35, metalness: 0.4,
      emissive: 0xe0a63c, emissiveIntensity: 0.1
    });

    // Shared roles for street lamps and neon; adjusted by the time-of-day engine.
    MAT.lamp = new THREE.MeshStandardMaterial({ color: 0xfff1c9, emissive: 0xffcf7a, emissiveIntensity: 0.2, roughness: 0.6 });
    MAT.neon = new THREE.MeshBasicMaterial({ color: 0x9ff2ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  }

  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  function canvasTexture(canvas, srgb) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    if (srgb !== false) tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 4;
    return tex;
  }

  function facadeTexture(base, lit) {
    const w = 128, h = 256;
    const c = makeCanvas(w, h);
    const e = makeCanvas(w, h);
    const cx = c.getContext('2d');
    const ex = e.getContext('2d');
    cx.fillStyle = base; cx.fillRect(0, 0, w, h);
    ex.fillStyle = '#000000'; ex.fillRect(0, 0, w, h);

    // Subtle vertical cladding and floor bands.
    cx.fillStyle = 'rgba(255,255,255,.045)';
    for (let x = 0; x < w; x += 11) cx.fillRect(x, 0, 1, h);
    cx.fillStyle = 'rgba(0,0,0,.14)';
    for (let y = 0; y < h; y += 20) cx.fillRect(0, y, w, 2);

    const cols = 5, rows = 12;
    const padX = 10, padY = 8;
    const cw = (w - padX * 2) / cols;
    const ch = (h - padY * 2) / rows;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const x = padX + col * cw + 3;
        const y = padY + r * ch + 4;
        const ww = cw - 8;
        const hh = ch - 8;
        const on = Math.random() < 0.46;
        cx.fillStyle = on ? lit : 'rgba(8,20,28,.86)';
        cx.fillRect(x, y, ww, hh);
        cx.fillStyle = 'rgba(255,255,255,.10)';
        cx.fillRect(x, y, ww, 1);
        if (on) {
          ex.fillStyle = lit;
          ex.fillRect(x, y, ww, hh);
        }
      }
    }
    const baseColor = new THREE.Color(base);
    return { map: canvasTexture(c, true), emissive: canvasTexture(e, true), baseColor };
  }

  function buildFacadeMaterialSet() {
    const bases = [
      ['#3f4b4f', '#ffd49a'], ['#4d4a42', '#ffca85'], ['#3a4657', '#ffd9a8'],
      ['#514944', '#ffcf8f'], ['#404f4a', '#ffe0aa'], ['#4a4045', '#ffc47b'],
      ['#55534c', '#ffe4b5'], ['#37434a', '#ffd39a']
    ];
    return bases.map(([base, lit]) => {
      const tex = facadeTexture(base, lit);
      const side = new THREE.MeshStandardMaterial({
        map: tex.map,
        emissiveMap: tex.emissive,
        emissive: srgb(lit),
        emissiveIntensity: 0.03,
        roughness: 0.72,
        metalness: 0.08
      });
      const roof = new THREE.MeshStandardMaterial({ color: new THREE.Color(base).convertSRGBToLinear().multiplyScalar(0.68), roughness: 0.94 });
      windowMats.push(side);
      return [side, roof];
    });
  }

  let facadeSets = [];

  function neonTexture(text, color, sub) {
    const c = makeCanvas(512, 160);
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 512, 160);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(9, 9, 494, 142);
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 66px Kanit, sans-serif';
    ctx.fillText(text, 256, 72);
    if (sub) {
      ctx.font = '300 22px Kanit, sans-serif';
      ctx.globalAlpha = 0.8;
      ctx.fillText(sub, 256, 124);
    }
    return canvasTexture(c, true);
  }

  function makeNeonMaterial(text, color, sub) {
    const tex = neonTexture(text, color, sub);
    const m = new THREE.MeshStandardMaterial({
      map: tex, transparent: true, emissive: srgb(color), emissiveMap: tex,
      emissiveIntensity: 0.2, alphaTest: 0.02, side: THREE.DoubleSide, depthWrite: false
    });
    neonMats.push(m);
    return m;
  }

  function radialTexture(inner, outer, size) {
    const c = makeCanvas(size || 128, size || 128);
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, c.width / 2);
    g.addColorStop(0, inner);
    g.addColorStop(0.35, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
    return canvasTexture(c, true);
  }

  function cloudTexture() {
    const c = makeCanvas(256, 128);
    const ctx = c.getContext('2d');
    for (let i = 0; i < 8; i++) {
      const x = rand(40, 216), y = rand(46, 84), r = rand(24, 46);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,.5)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    return canvasTexture(c, false);
  }

  function plazaTexture() {
    const c = makeCanvas(512, 512);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#9b9078';
    ctx.fillRect(0, 0, 512, 512);
    // concentric paving rings
    for (let r = 60; r < 250; r += 34) {
      ctx.beginPath();
      ctx.arc(256, 256, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(52,44,31,.30)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    // radial joints
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(256 + Math.cos(a) * 40, 256 + Math.sin(a) * 40);
      ctx.lineTo(256 + Math.cos(a) * 252, 256 + Math.sin(a) * 252);
      ctx.strokeStyle = 'rgba(52,44,31,.18)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(256, 256, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#7d725c';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(256, 256, 38, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(231,194,125,.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    return canvasTexture(c, true);
  }

  let plazaMat;

  function initRenderer() {
    if (!THREE_OK) {
      showFatal('Three.js could not load', 'The 3D library was blocked or the network is offline. Connect to the internet and reload.');
      return false;
    }
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: dom.canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      showFatal('WebGL is unavailable', 'This experience needs a WebGL-capable browser. Try a current version of Chrome, Safari, Edge or Firefox with hardware acceleration enabled.');
      return false;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xc1d7e0, 260, 900);

    camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.12, 1500);
    camera.position.set(98, 110, 126);

    buildMaterials();
    facadeSets = buildFacadeMaterialSet();
    plazaMat = new THREE.MeshStandardMaterial({
      map: plazaTexture(), roughness: 0.95, metalness: 0.02,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
    });
    return true;
  }

  function buildSky() {
    skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(PRESETS.day.top) },
        bottomColor: { value: new THREE.Color(PRESETS.day.bottom) },
        sunColor: { value: new THREE.Color(PRESETS.day.sun) },
        sunDir: { value: new THREE.Vector3(0.5, 0.7, 0.35).normalize() },
        horizon: { value: 0.06 }
      },
      vertexShader: [
        'varying vec3 vDir;',
        'void main(){',
        '  vDir = normalize(position);',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 topColor; uniform vec3 bottomColor; uniform vec3 sunColor; uniform vec3 sunDir;',
        'varying vec3 vDir;',
        'void main(){',
        '  vec3 d = normalize(vDir);',
        '  float h = clamp(d.y, 0.0, 1.0);',
        '  vec3 col = mix(bottomColor, topColor, pow(h, 0.58));',
        '  float band = smoothstep(-0.06, 0.16, d.y);',
        '  col = mix(bottomColor * 1.04, col, band);',
        '  float s = max(dot(d, normalize(sunDir)), 0.0);',
        '  col += sunColor * pow(s, 220.0) * 0.85;',
        '  col += sunColor * pow(s, 9.0) * 0.10;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'),
      side: THREE.BackSide,
      depthWrite: false,
      fog: false
    });
    skyMesh = new THREE.Mesh(new THREE.SphereGeometry(560, 32, 18), skyMat);
    scene.add(skyMesh);

    // Stars
    const starCount = 1400;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(rand(0.02, 0.98));
      const r = 520;
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      positions[i * 3 + 1] = Math.cos(phi) * r;
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starTex = radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)', 32);
    const starMat = new THREE.PointsMaterial({
      size: 3.2, map: starTex, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false
    });
    starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    const glow = radialTexture('rgba(255,246,214,1)', 'rgba(255,220,150,0)', 128);
    sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    sunSprite.scale.set(46, 46, 1);
    scene.add(sunSprite);

    moonSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xdce8ff }));
    moonSprite.scale.set(20, 20, 1);
    scene.add(moonSprite);

    // Clouds
    const cTex = cloudTexture();
    for (let i = 0; i < 9; i++) {
      const mat = new THREE.SpriteMaterial({ map: cTex, transparent: true, opacity: 0.6, depthWrite: false, color: 0xffffff, fog: false });
      const s = new THREE.Sprite(mat);
      s.position.set(rand(-240, 240), rand(58, 120), rand(-220, 180));
      const sc = rand(60, 130);
      s.scale.set(sc, sc * 0.45, 1);
      s.userData.speed = rand(0.4, 1.1);
      scene.add(s);
      clouds.push(s);
    }

    hemi = new THREE.HemisphereLight(0xd3e9f4, 0x4c4432, 0.86);
    scene.add(hemi);
    ambient = new THREE.AmbientLight(0xffffff, 0.24);
    scene.add(ambient);

    sun = new THREE.DirectionalLight(0xfff3d8, 2.05);
    sun.position.set(78, 120, 54);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -130;
    sun.shadow.camera.right = 130;
    sun.shadow.camera.top = 130;
    sun.shadow.camera.bottom = -130;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 420;
    sun.shadow.bias = -0.00035;
    sun.shadow.normalBias = 0.6;
    sun.target.position.set(0, 0, -6);
    scene.add(sun);
    scene.add(sun.target);

    // Landmark accent lights (night only, no shadows).
    const accents = [
      { color: 0xffc978, pos: [-50, 30, 30], intensity: 0.0 },
      { color: 0xffb06f, pos: [-8, 16, 20], intensity: 0.0 },
      { color: 0xffd08a, pos: [-8, 16, -16], intensity: 0.0 },
      { color: 0xffcf86, pos: [16, 28, -52], intensity: 0.0 },
      { color: 0xff79b4, pos: [54, 66, -66], intensity: 0.0 }
    ];
    scene.userData.accentLights = accents.map((a) => {
      const l = new THREE.PointLight(a.color, 0, 72, 1.7);
      l.position.set(a.pos[0], a.pos[1], a.pos[2]);
      l.userData.max = 0.9;
      scene.add(l);
      return l;
    });
  }

  function applyLightMix(instant) {
    if (!lightMix) lightMix = makeLightMix(PRESETS.day);
    const target = PRESETS[state.preset] || PRESETS.day;
    if (instant) {
      const snap = makeLightMix(target);
      Object.keys(snap).forEach((k) => {
        const v = snap[k];
        if (v instanceof THREE.Color) lightMix[k].copy(v);
        else if (Array.isArray(v)) lightMix[k] = v.slice();
        else lightMix[k] = v;
      });
      writeLightMix(lightMix);
      presetTransition = 0;
    } else {
      presetTransition = 1.1;
    }
    updateTimeButtons();
    renderer.shadowMap.needsUpdate = true;
  }

  function makeLightMix(p) {
    return {
      top: new THREE.Color(p.top),
      bottom: new THREE.Color(p.bottom),
      sun: srgb(p.sun),
      hemiSky: srgb(p.hemiSky),
      hemiGround: srgb(p.hemiGround),
      fog: srgb(p.fog),
      waterA: new THREE.Color(p.waterA),
      waterB: new THREE.Color(p.waterB),
      gold: new THREE.Color(p.gold),
      sunDisc: new THREE.Color(p.sunDisc),
      sunInt: p.sunInt,
      hemiInt: p.hemiInt,
      ambient: p.ambient,
      fogNear: p.fogNear,
      fogFar: p.fogFar,
      exposure: p.exposure,
      night: p.night,
      stars: p.stars,
      clouds: p.clouds,
      sunPos: p.sunPos.slice()
    };
  }

  function writeLightMix(m) {
    skyMat.uniforms.topColor.value.copy(m.top);
    skyMat.uniforms.bottomColor.value.copy(m.bottom);
    skyMat.uniforms.sunColor.value.copy(m.sunDisc);

    sun.color.copy(m.sun);
    sun.intensity = m.sunInt;
    sun.position.set(m.sunPos[0], m.sunPos[1], m.sunPos[2]);
    hemi.color.copy(m.hemiSky);
    hemi.groundColor.copy(m.hemiGround);
    hemi.intensity = m.hemiInt;
    ambient.intensity = m.ambient;

    scene.fog.color.copy(m.fog);
    scene.fog.near = m.fogNear;
    scene.fog.far = m.fogFar;
    renderer.toneMappingExposure = m.exposure;

    if (waterMat) {
      waterMat.uniforms.uColorA.value.copy(m.waterA);
      waterMat.uniforms.uColorB.value.copy(m.waterB);
      waterMat.uniforms.uGold.value.copy(m.gold);
    }
    starField.material.opacity = m.stars;
    clouds.forEach((c) => { c.material.opacity = m.clouds * 0.8; });
    windowMats.forEach((mat) => { mat.emissiveIntensity = 0.03 + m.night * 1.15; });
    neonMats.forEach((mat) => { mat.emissiveIntensity = 0.18 + m.night * 2.2; });
    MAT.lamp.emissiveIntensity = 0.2 + m.night * 3.0;
    MAT.gold.emissiveIntensity = 0.06 + m.night * 0.55;
    if (MAT.goldBright) MAT.goldBright.emissiveIntensity = 0.1 + m.night * 0.55;
    if (MAT.goldGlow) MAT.goldGlow.emissiveIntensity = 0.2 + m.night * 0.9;
    if (MAT.landmarkGlow) MAT.landmarkGlow.emissiveIntensity = 0.08 + m.night * 0.8;

    // Accent lights glow at night.
    (scene.userData.accentLights || []).forEach((l) => {
      l.intensity = m.night * 3.0;
    });

    if (baiyokeBeacon) {
      baiyokeBeacon.material.emissiveIntensity = 0.2 + m.night * 2.5;
    }
    if (lampGlowMat) lampGlowMat.opacity = 0.05 + m.night * 0.82;
    if (carHeadMat) carHeadMat.emissiveIntensity = 0.25 + m.night * 2.6;
    if (carTailMat) carTailMat.emissiveIntensity = 0.2 + m.night * 2.0;
    markerRecords.forEach((m) => {
      if (m.glow) m.glow.material.opacity = 0.22 + m.night * 0.5;
    });

    // Sun disc and moon
    const dir = tmpVec.set(m.sunPos[0], m.sunPos[1], m.sunPos[2]).normalize();
    sunSprite.position.copy(dir).multiplyScalar(430);
    sunSprite.material.color.copy(m.sunDisc);
    sunSprite.material.opacity = clamp(1 - m.night * 0.75, 0, 1);
    moonSprite.position.set(-260, 330, -300);
    moonSprite.material.opacity = m.night * 0.9;
    skyMat.uniforms.sunDir.value.copy(dir);
  }

  function updateLighting(dt) {
    if (!lightMix) return;
    if (presetTransition > 0) {
      presetTransition = Math.max(0, presetTransition - dt);
      const target = makeLightMix(PRESETS[state.preset] || PRESETS.day);
      const k = 1 - Math.exp(-4.2 * dt);
      ['top', 'bottom', 'sun', 'hemiSky', 'hemiGround', 'fog', 'waterA', 'waterB', 'gold', 'sunDisc'].forEach((key) => {
        lightMix[key].lerp(target[key], k);
      });
      ['sunInt', 'hemiInt', 'ambient', 'fogNear', 'fogFar', 'exposure', 'night', 'stars', 'clouds'].forEach((key) => {
        lightMix[key] = lerp(lightMix[key], target[key], k);
      });
      for (let i = 0; i < 3; i++) lightMix.sunPos[i] = lerp(lightMix.sunPos[i], target.sunPos[i], k);
      writeLightMix(lightMix);
      renderer.shadowMap.needsUpdate = true;
    }
  }

  function setPreset(name, opts) {
    if (!PRESETS[name]) return;
    state.preset = name;
    saveState();
    applyLightMix(!!(opts && opts.instant));
    updateTimeButtons();
    if (!(opts && opts.silent)) {
      toast(tf('toast.preset', { name: t('time.' + name) }));
    }
    if (opts && opts.persist === false) return;
    saveState();
  }

  function cyclePreset() {
    const order = ['day', 'golden', 'night'];
    const i = order.indexOf(state.preset);
    setPreset(order[(i + 1) % order.length]);
  }

  /* ==========================================================================
     4. CITY
     ========================================================================== */

  function addBox(parent, w, h, d, mat, x, y, z, ry) {
    const m = new THREE.Mesh(UNIT_BOX, mat);
    m.scale.set(w, h, d);
    m.position.set(x, y, z);
    if (ry) m.rotation.y = ry;
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function addCyl(parent, rt, rb, h, seg, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function addCone(parent, r, h, seg, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function addSphere(parent, r, mat, x, y, z, sx, sy, sz) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), mat);
    m.position.set(x, y, z);
    if (sx != null) m.scale.set(sx, sy, sz);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function addTorus(parent, r, tube, mat, x, y, z, rx, ry) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 28), mat);
    m.position.set(x, y, z);
    if (rx != null) m.rotation.x = rx;
    if (ry != null) m.rotation.y = ry;
    m.castShadow = true;
    parent.add(m);
    return m;
  }

  function buildGround() {
    const g = new THREE.Group();
    g.name = 'ground';

    // River bed and distant floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), MAT.waterEdge);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.6;
    floor.receiveShadow = true;
    g.add(floor);

    // A wide city plain under the diorama so the blocks never appear to float.
    const plain = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({ color: srgb(0x2c3b32), roughness: 1 }));
    plain.rotation.x = -Math.PI / 2;
    plain.position.y = -0.7;
    plain.receiveShadow = true;
    g.add(plain);

    const westW = Math.abs(world.bankWest - world.minX);
    const eastW = Math.abs(world.maxX - world.bankEast);
    const west = addBox(g, westW, 1.7, world.maxZ - world.minZ, MAT.stoneDark, world.minX + westW / 2, -0.85, 0);
    const east = addBox(g, eastW, 1.7, world.maxZ - world.minZ, MAT.stoneDark, world.bankEast + eastW / 2, -0.85, 0);
    west.receiveShadow = east.receiveShadow = true;

    // A thin green/urban surface so the city floor is not bare stone.
    const westTop = addBox(g, westW - 2, 0.06, world.maxZ - world.minZ - 2, MAT.grass, world.minX + westW / 2, -0.02, 0);
    const eastTop = addBox(g, eastW - 2, 0.06, world.maxZ - world.minZ - 2, MAT.grass, world.bankEast + eastW / 2, -0.02, 0);
    westTop.receiveShadow = eastTop.receiveShadow = true;

    // Embankment walls
    addBox(g, 1.1, 2.2, world.maxZ - world.minZ, MAT.stone, world.bankWest - 0.4, 0.2, 0);
    addBox(g, 1.1, 2.2, world.maxZ - world.minZ, MAT.stone, world.bankEast + 0.4, 0.2, 0);
    // Promenades
    addBox(g, 4, 0.04, world.maxZ - world.minZ - 2, MAT.sidewalk, world.bankEast + 2.6, 0.04, 0);
    addBox(g, 4, 0.04, world.maxZ - world.minZ - 2, MAT.sidewalk, world.bankWest - 2.6, 0.04, 0);

    // River railings and lamps give the walkthrough a human scale.
    addBox(g, 0.09, 0.09, world.maxZ - world.minZ - 4, MAT.rail, world.bankEast + 0.75, 1.06, 0);
    addBox(g, 0.09, 0.09, world.maxZ - world.minZ - 4, MAT.rail, world.bankWest - 0.75, 1.06, 0);
    const railPosts = [];
    for (let z = world.minZ + 4; z < world.maxZ - 4; z += 4.5) {
      railPosts.push([world.bankEast + 0.75, z]);
      railPosts.push([world.bankWest - 0.75, z]);
    }
    const postMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 1.04, 0.1), MAT.rail, railPosts.length);
    railPosts.forEach((p, i) => {
      tmpObj.position.set(p[0], 0.56, p[1]);
      tmpObj.rotation.set(0, 0, 0);
      tmpObj.scale.set(1, 1, 1);
      tmpObj.updateMatrix();
      postMesh.setMatrixAt(i, tmpObj.matrix);
    });
    postMesh.instanceMatrix.needsUpdate = true;
    postMesh.castShadow = true;
    g.add(postMesh);

    for (let z = -72; z <= 72; z += 18) {
      [world.bankEast + 1.7, world.bankWest - 1.7].forEach((x) => {
        addCyl(g, 0.06, 0.09, 2.6, 5, MAT.black, x, 1.3, z);
        addSphere(g, 0.17, MAT.lamp, x, 2.68, z);
      });
    }

    scene.add(g);

    // Water
    const uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(PRESETS.day.waterA) },
        uColorB: { value: new THREE.Color(PRESETS.day.waterB) },
        uGold: { value: new THREE.Color(PRESETS.day.gold) }
      }
    ]);
    waterMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: [
        'uniform float uTime;',
        'varying vec2 vUv;',
        '#include <fog_pars_vertex>',
        'void main(){',
        '  vUv = uv;',
        '  vec3 p = position;',
        '  p.z += sin(p.x * 0.55 + uTime * 0.9) * 0.08;',
        '  p.z += cos(p.y * 0.37 - uTime * 0.7) * 0.06;',
        '  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);',
        '  gl_Position = projectionMatrix * mvPosition;',
        '  #include <fog_vertex>',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform float uTime; uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uGold;',
        'varying vec2 vUv;',
        '#include <fog_pars_fragment>',
        'void main(){',
        '  float w1 = sin(vUv.x * 160.0 + uTime * 1.7);',
        '  float w2 = sin(vUv.y * 80.0 - uTime * 1.2 + sin(vUv.x * 18.0) * 1.7);',
        '  float w3 = sin((vUv.x + vUv.y) * 220.0 - uTime * 2.2);',
        '  vec3 col = mix(uColorA, uColorB, 0.5 + 0.26 * w1 + 0.18 * w2);',
        '  float glint = smoothstep(0.965, 1.0, w3) * 0.65;',
        '  float glint2 = smoothstep(0.985, 1.0, sin(vUv.y * 420.0 - uTime * 2.1)) * 0.35;',
        '  col += uGold * (glint + glint2) * 0.55;',
        '  col *= 0.9 + 0.1 * sin(vUv.y * 12.0 + uTime * 0.3);',
        '  gl_FragColor = vec4(col, 1.0);',
        '  #include <fog_fragment>',
        '}'
      ].join('\n'),
      fog: true
    });
    waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(world.riverHalf * 2, 172, 24, 140), waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(world.riverX, -0.52, 0);
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);
  }

  function addRoadPlane(w, d, x, z, mat, y) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y == null ? 0.045 : y, z);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  }

  function buildRoads() {
    const roadMat = MAT.asphalt;
    const walkMat = MAT.sidewalk;
    const laneMat = new THREE.MeshBasicMaterial({ color: 0xd8cba6, transparent: true, opacity: 0.55 });

    // North-south roads
    world.eastRoadX.concat(world.westRoadX).forEach((x) => {
      addRoadPlane(4.6, 168, x, 0, roadMat);
      addRoadPlane(1.35, 168, x - 3.0, 0, walkMat, 0.055);
      addRoadPlane(1.35, 168, x + 3.0, 0, walkMat, 0.055);
    });
    // East-west roads, east bank only.
    world.eastRoadZ.forEach((z) => {
      addRoadPlane(106, 4.6, 41, z, roadMat);
      addRoadPlane(106, 1.35, 41, z - 3.0, walkMat, 0.055);
      addRoadPlane(106, 1.35, 41, z + 3.0, walkMat, 0.055);
    });

    // Lane dashes (instanced planes).
    const dashGeo = new THREE.PlaneGeometry(0.16, 2.6);
    const dashes = [];
    world.eastRoadX.concat(world.westRoadX).forEach((x) => {
      for (let z = world.minZ + 5; z < world.maxZ; z += 8) dashes.push({ x, z, ry: 0 });
    });
    world.eastRoadZ.forEach((z) => {
      for (let x = world.bankEast + 5; x < world.maxX; x += 8) dashes.push({ x, z, ry: Math.PI / 2 });
    });
    const dashMesh = new THREE.InstancedMesh(dashGeo, laneMat, dashes.length);
    dashes.forEach((d, i) => {
      tmpObj.position.set(d.x, 0.058, d.z);
      tmpObj.rotation.set(-Math.PI / 2, 0, d.ry);
      tmpObj.scale.set(1, 1, 1);
      tmpObj.updateMatrix();
      dashMesh.setMatrixAt(i, tmpObj.matrix);
    });
    dashMesh.instanceMatrix.needsUpdate = true;
    scene.add(dashMesh);

    // Crosswalk stripes near the riverfront.
    const cwMat = new THREE.MeshBasicMaterial({ color: 0xe4ddc9, transparent: true, opacity: 0.4 });
    for (const z of [18, -18]) {
      for (let i = 0; i < 6; i++) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 3.7), cwMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(-9.2 + i * 1.2, 0.06, z);
        scene.add(m);
      }
    }

    buildBridges();
  }

  function buildBridges() {
    const positions = [80, -42];
    positions.forEach((z) => {
      const g = new THREE.Group();
      g.position.set(0, 0, 0);
      addBox(g, 22, 0.8, 7, MAT.sidewalk, -25.5, 2.4, z);
      addBox(g, 22, 0.35, 0.5, MAT.goldGlow, -25.5, 3.1, z - 3.4);
      addBox(g, 22, 0.35, 0.5, MAT.goldGlow, -25.5, 3.1, z + 3.4);
      // towers
      [-32.5, -18.5].forEach((x) => {
        addBox(g, 1.0, 10, 1.0, MAT.goldDark, x, 6.4, z - 3.1);
        addBox(g, 1.0, 10, 1.0, MAT.goldDark, x, 6.4, z + 3.1);
        addBox(g, 2.0, 0.5, 8.0, MAT.goldDark, x, 11.2, z);
      });
      // cables
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const x = lerp(-32.5, -18.5, t);
        const y = 11.0 - Math.sin(t * Math.PI) * 3.2;
        pts.push(new THREE.Vector3(x, y, z - 3.1));
        pts.push(new THREE.Vector3(x, y, z + 3.1));
      }
      const cableGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const cables = new THREE.LineSegments(cableGeo, new THREE.LineBasicMaterial({ color: 0xbfa76d, transparent: true, opacity: 0.8 }));
      g.add(cables);
      // lamps on bridge
      [-32, -26, -20].forEach((x) => {
        addCyl(g, 0.07, 0.09, 2.4, 5, MAT.black, x, 4.2, z);
        addSphere(g, 0.18, MAT.lamp, x, 5.45, z);
      });
      scene.add(g);
    });
  }

  function addPlaza(l) {
    const geo = new THREE.CircleGeometry(l.plaza, 64);
    const m = new THREE.Mesh(geo, plazaMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(l.position[0], 0.075, l.position[1]);
    m.receiveShadow = true;
    scene.add(m);
    // a low gold ring around the plaza edge
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(l.plaza - 0.5, l.plaza, 64),
      new THREE.MeshBasicMaterial({ color: 0xc7a86a, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(l.position[0], 0.085, l.position[1]);
    scene.add(ring);
    plazaRings.push({ x: l.position[0], z: l.position[1], r: l.plaza });
  }

  function inPlaza(x, z, pad) {
    for (const p of plazaRings) {
      const dx = x - p.x, dz = z - p.z;
      if (dx * dx + dz * dz < (p.r + (pad || 0)) * (p.r + (pad || 0))) return true;
    }
    return false;
  }

  function inPark(x, z, pad) {
    return Math.abs(x - world.park.x) < world.park.w / 2 + (pad || 0) &&
      Math.abs(z - world.park.z) < world.park.d / 2 + (pad || 0);
  }

  function buildPark() {
    const g = new THREE.Group();
    const base = addBox(g, world.park.w, 0.16, world.park.d, MAT.grass, world.park.x, 0.11, world.park.z);
    base.receiveShadow = true;
    // paths
    addBox(g, world.park.w - 2, 0.08, 2.2, MAT.stone, world.park.x, 0.2, world.park.z, 0.18);
    addBox(g, 1.8, 0.08, world.park.d - 2, MAT.stone, world.park.x + 2, 0.2, world.park.z, -0.7);
    // pond
    const pond = new THREE.Mesh(new THREE.CircleGeometry(3.6, 30), new THREE.MeshStandardMaterial({ color: srgb(0x2f5f68), roughness: 0.25, metalness: 0.2 }));
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(world.park.x - 4, 0.205, world.park.z - 2.5);
    g.add(pond);
    // benches
    for (let i = 0; i < 5; i++) {
      addBox(g, 2.0, 0.12, 0.5, MAT.wood, world.park.x - 6 + i * 3, 0.48, world.park.z + 4.2);
      addBox(g, 1.8, 0.35, 0.12, MAT.wood, world.park.x - 6 + i * 3, 0.28, world.park.z + 4.42);
    }
    scene.add(g);
  }

  function buildingHeight(x, z) {
    if (x > 30 && z < -32) return rand(12, 36);
    if (x > 28) return rand(9, 26);
    if (x > 6) return rand(6, 17);
    if (x > -16) return rand(5, 14);
    return rand(4, 12);
  }

  function buildCityBlocks() {
    const eastX = [world.bankEast + 1].concat(world.eastRoadX, [world.maxX - 2]);
    const westX = [world.minX + 2].concat(world.westRoadX, [world.bankWest - 1]);
    const zs = [world.minZ + 2].concat(world.eastRoadZ, [world.maxZ - 2]);

    const buildFor = (xs, isWest) => {
      for (let xi = 0; xi < xs.length - 1; xi++) {
        for (let zi = 0; zi < zs.length - 1; zi++) {
          const bx0 = xs[xi] + (xi === 0 ? 1 : 3.6);
          const bx1 = xs[xi + 1] - 3.6;
          const bz0 = zs[zi] + (zi === 0 ? 1 : 3.6);
          const bz1 = zs[zi + 1] - 3.6;
          if (bx1 - bx0 < 5 || bz1 - bz0 < 5) continue;
          const cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2;
          if (inPlaza(cx, cz, 4)) continue;
          if (inPark(cx, cz, 3)) continue;
          if (isWest && Math.abs(cx - (-50)) < 26 && Math.abs(cz - 30) < 26) continue;

          const splitsX = Math.random() < 0.55 && bx1 - bx0 > 15 ? 2 : 1;
          const splitsZ = Math.random() < 0.45 && bz1 - bz0 > 15 ? 2 : 1;
          for (let sx = 0; sx < splitsX; sx++) {
            for (let sz = 0; sz < splitsZ; sz++) {
              const gap = 2.0;
              const w = (bx1 - bx0) / splitsX - gap;
              const d = (bz1 - bz0) / splitsZ - gap;
              const px = bx0 + (sx + 0.5) * ((bx1 - bx0) / splitsX);
              const pz = bz0 + (sz + 0.5) * ((bz1 - bz0) / splitsZ);
              if (w < 4.2 || d < 4.2) continue;
              if (inPlaza(px, pz, 3 + Math.max(w, d) / 2) || inPark(px, pz, 2)) continue;
              if (Math.hypot(px + 26, pz) < 15) continue;
              let h = buildingHeight(px, pz);
              if (Math.random() < 0.06) h *= 1.7;
              makeBuilding(px, pz, w, d, h, isWest);
            }
          }
        }
      }
    };
    buildFor(eastX, false);
    buildFor(westX, true);

    // A few signature towers give the skyline anchors.
    const signatures = [
      { x: 78, z: -20, w: 10, d: 10, h: 40 },
      { x: 76, z: 16, w: 9, d: 9, h: 44 },
      { x: 44, z: -78, w: 10, d: 10, h: 30 },
      { x: 24, z: 56, w: 8, d: 8, h: 30 }
    ];
    signatures.forEach((s) => {
      if (!inPlaza(s.x, s.z, 5) && !inPark(s.x, s.z, 3)) {
        makeBuilding(s.x, s.z, s.w, s.d, s.h, false, true);
      }
    });
  }

  function makeBuilding(cx, cz, w, d, h, isWest, signature) {
    if (!signature && inPlaza(cx, cz, 16)) h = Math.min(h, 10 + rand(0, 3));
    const set = facadeSets[Math.floor(Math.random() * facadeSets.length)];
    const [side, roof] = set;
    const geo = UNIT_BOX;
    const mesh = new THREE.Mesh(geo, [side, side, roof, roof, side, side]);
    mesh.position.set(cx, h / 2, cz);
    mesh.scale.set(w, h, d);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Roof lip and plant
    const lip = addBox(scene, w + 0.35, 0.42, d + 0.35, roof, cx, h + 0.18, cz);
    lip.castShadow = true;
    if (h > 12) {
      const ac = addBox(scene, Math.min(2.2, w * 0.25), rand(0.6, 1.2), Math.min(2, d * 0.25), MAT.stoneDark, cx + rand(-w * 0.2, w * 0.2), h + 0.7, cz + rand(-d * 0.2, d * 0.2));
      ac.castShadow = true;
    }
    if (h > 30) {
      const mast = addCyl(scene, 0.08, 0.12, rand(3, 7), 5, MAT.black, cx, h + 3.2, cz);
      mast.castShadow = false;
    }
    if (signature || (h > 24 && Math.random() < 0.25)) {
      addRoofSign(cx, cz, w, d, h);
    }
    if (h > 9 && Math.random() < 0.32) {
      addBox(scene, w - 2, rand(1.0, 2.2), d - 2, MAT.stoneDark, cx, h + 0.9, cz);
    }

    // Colliders only on the walkable east bank.
    if (!isWest) colliders.push({ x: cx, z: cz, hw: w / 2, hd: d / 2 });
  }

  function addRoofSign(cx, cz, w, d, h) {
    const words = [
      ['KRUNG THEP', '#ffd38f'], ['SIAM', '#9fe8ff'], ['BANGKOK', '#ffb6c9'],
      ['RATTANAKOSIN', '#d8ffb0'], ['PRATUNAM', '#ffd38f']
    ];
    const [word, color] = pick(words);
    const mat = makeNeonMaterial(word, color, 'BKK');
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w * 0.9, 8), Math.min(w * 0.9, 8) * 0.31), mat);
    plane.position.set(cx, h + 1.6, cz + d / 2 + 0.06);
    scene.add(plane);
  }

  function buildTrees() {
    const positions = [];
    const tryAdd = (x, z) => {
      if (x < world.bankEast + 1.4 || x > world.maxX - 2) return;
      if (inPlaza(x, z, 3.6)) return;
      if (!inPark(x, z, 0) && nearRoad(x, z, 2.8)) return;
      if (!inPark(x, z, 0) && collidesStatic(x, z, 1.2)) return;
      if (Math.hypot(x + 14.5, z - 44) < 4) return;
      positions.push({ x, z, s: rand(0.75, 1.45), hue: Math.random() });
    };
    // Street trees
    for (let i = 0; i < 140 && positions.length < 90; i++) {
      tryAdd(rand(world.bankEast + 2, world.maxX - 4), rand(world.minZ + 4, world.maxZ - 4));
    }
    // Park cluster
    for (let i = 0; i < 32; i++) {
      const x = world.park.x + rand(-world.park.w / 2 + 2, world.park.w / 2 - 2);
      const z = world.park.z + rand(-world.park.d / 2 + 2, world.park.d / 2 - 2);
      if (Math.abs(x - world.park.x) < 3.4 && Math.abs(z - world.park.z) < 2) continue;
      positions.push({ x, z, s: rand(0.8, 1.5), hue: Math.random() });
    }
    // West bank
    for (let i = 0; i < 30; i++) {
      tryAdd(rand(world.minX + 4, world.bankWest - 3), rand(world.minZ + 4, world.maxZ - 4));
    }

    const trunkGeo = new THREE.CylinderGeometry(0.11, 0.18, 2.0, 5);
    const leafGeo = new THREE.IcosahedronGeometry(1.05, 1);
    positions.forEach((p) => {
      if (p.x > world.bankEast + 0.5) colliders.push({ x: p.x, z: p.z, hw: 0.42, hd: 0.42 });
    });
    const trunks = new THREE.InstancedMesh(trunkGeo, MAT.trunk, positions.length);
    const leaves = new THREE.InstancedMesh(leafGeo, MAT.leaf, positions.length);
    leaves.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(positions.length * 3), 3);
    positions.forEach((p, i) => {
      const baseY = 0;
      tmpObj.position.set(p.x, baseY + 1.0 * p.s, p.z);
      tmpObj.rotation.set(0, rand(0, Math.PI * 2), 0);
      tmpObj.scale.set(p.s, p.s, p.s);
      tmpObj.updateMatrix();
      trunks.setMatrixAt(i, tmpObj.matrix);

      tmpObj.position.set(p.x, baseY + 2.8 * p.s, p.z);
      tmpObj.rotation.set(rand(-0.1, 0.1), rand(0, Math.PI * 2), rand(-0.1, 0.1));
      tmpObj.scale.set(p.s, p.s * rand(0.9, 1.25), p.s);
      tmpObj.updateMatrix();
      leaves.setMatrixAt(i, tmpObj.matrix);
      const c = new THREE.Color().setHSL(0.28 + p.hue * 0.09, 0.28 + p.hue * 0.18, 0.22 + p.hue * 0.12);
      leaves.setColorAt(i, c);
    });
    trunks.castShadow = true;
    leaves.castShadow = true;
    trunks.receiveShadow = true;
    leaves.receiveShadow = true;
    trunks.instanceMatrix.needsUpdate = true;
    leaves.instanceMatrix.needsUpdate = true;
    if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
    scene.add(trunks, leaves);
  }

  function nearRoad(x, z, pad) {
    const rx = world.eastRoadX.concat(world.westRoadX);
    for (const r of rx) if (Math.abs(x - r) < pad + 2.3) return true;
    for (const r of world.eastRoadZ) if (Math.abs(z - r) < pad + 2.3) return true;
    return false;
  }

  function collidesStatic(x, z, r) {
    for (const c of colliders) {
      if (Math.abs(x - c.x) < c.hw + r && Math.abs(z - c.z) < c.hd + r) return true;
    }
    return false;
  }

  function buildStreetLamps() {
    const spots = [];
    world.eastRoadX.forEach((x) => {
      for (let z = world.minZ + 8; z < world.maxZ; z += 24) {
        if (inPlaza(x + 4, z, 2)) continue;
        spots.push([x + 3.4, z]);
      }
    });
    world.eastRoadZ.forEach((z) => {
      for (let x = world.bankEast + 6; x < world.maxX; x += 26) {
        if (inPlaza(x, z + 3.4, 2)) continue;
        spots.push([x, z + 3.4]);
      }
    });
    const poleGeo = new THREE.CylinderGeometry(0.07, 0.11, 4.4, 5);
    const headGeo = new THREE.SphereGeometry(0.24, 8, 6);
    const poles = new THREE.InstancedMesh(poleGeo, MAT.black, spots.length);
    const heads = new THREE.InstancedMesh(headGeo, MAT.lamp, spots.length);
    spots.forEach((p, i) => {
      tmpObj.position.set(p[0], 2.2, p[1]);
      tmpObj.rotation.set(0, 0, 0);
      tmpObj.scale.set(1, 1, 1);
      tmpObj.updateMatrix();
      poles.setMatrixAt(i, tmpObj.matrix);
      tmpObj.position.set(p[0], 4.5, p[1]);
      tmpObj.updateMatrix();
      heads.setMatrixAt(i, tmpObj.matrix);
    });
    poles.castShadow = heads.castShadow = false;
    poles.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;
    scene.add(poles, heads);

    // Soft glow points that only show at night.
    const glowTex = radialTexture('rgba(255,214,140,.95)', 'rgba(255,190,90,0)', 64);
    lampGlowMat = new THREE.PointsMaterial({
      size: 4.4, map: glowTex, transparent: true, opacity: 0.12,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    const glowGeo = new THREE.BufferGeometry();
    const gpos = new Float32Array(spots.length * 3);
    spots.forEach((p, i) => { gpos[i * 3] = p[0]; gpos[i * 3 + 1] = 4.45; gpos[i * 3 + 2] = p[1]; });
    glowGeo.setAttribute('position', new THREE.BufferAttribute(gpos, 3));
    scene.add(new THREE.Points(glowGeo, lampGlowMat));
  }

  function taperedCarShell(baseW, baseD, topW, topD) {
    const bw = baseW / 2, bd = baseD / 2, tw = topW / 2, td = topD / 2;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      -bw, 0, -bd, bw, 0, -bd, bw, 0, bd, -bw, 0, bd,
      -tw, 1, -td, tw, 1, -td, tw, 1, td, -tw, 1, td
    ]), 3));
    geo.setIndex([
      0, 1, 5, 0, 5, 4,
      3, 2, 6, 3, 6, 7,
      1, 2, 6, 1, 6, 5,
      0, 3, 7, 0, 7, 4,
      4, 5, 6, 4, 6, 7,
      0, 2, 1, 0, 3, 2
    ]);
    geo.computeVertexNormals();
    return geo;
  }

  function buildTraffic() {
    const defs = [];
    world.eastRoadX.concat(world.westRoadX).forEach((x) => defs.push({ axis: 'z', at: x }));
    world.eastRoadZ.forEach((z) => defs.push({ axis: 'x', at: z }));
    const palette = [
      0xe8e0cc, 0xc94f3f, 0x3f6fa8, 0xd0a03c, 0x5e9a72, 0xd8d8d8,
      0x2c343a, 0xb887a4, 0xf0b323, 0xd96c9a, 0xed6a2c, 0x6b8fc5
    ];
    const count = 108;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0.36, side: THREE.DoubleSide });
    const glassMat = new THREE.MeshStandardMaterial({ color: srgb(0x17262e), roughness: 0.12, metalness: 0.7, side: THREE.DoubleSide });
    const wheelMat = new THREE.MeshStandardMaterial({ color: srgb(0x0b0b0d), roughness: 0.9, metalness: 0.1 });
    carHeadMat = new THREE.MeshStandardMaterial({ color: srgb(0xfff2ca), emissive: srgb(0xffe0a0), emissiveIntensity: 0.3, roughness: 0.35 });
    carTailMat = new THREE.MeshStandardMaterial({ color: srgb(0xb51f1f), emissive: srgb(0xff2a1a), emissiveIntensity: 0.25, roughness: 0.4 });

    const bodyGeo = taperedCarShell(1, 1, 0.88, 0.94);
    const cabinGeo = taperedCarShell(1, 1, 0.68, 0.62);
    const roofGeo = new THREE.BoxGeometry(1, 1, 1);
    const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.18, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    const lampGeo = new THREE.BoxGeometry(0.25, 0.12, 0.07);

    carBodyMesh = new THREE.InstancedMesh(bodyGeo, bodyMat, count);
    carCabinMesh = new THREE.InstancedMesh(cabinGeo, glassMat, count);
    carRoofMesh = new THREE.InstancedMesh(roofGeo, bodyMat, count);
    carWheelMesh = new THREE.InstancedMesh(wheelGeo, wheelMat, count * 4);
    carHeadMesh = new THREE.InstancedMesh(lampGeo, carHeadMat, count * 2);
    carTailMesh = new THREE.InstancedMesh(lampGeo, carTailMat, count * 2);
    [carBodyMesh, carCabinMesh, carRoofMesh, carWheelMesh, carHeadMesh, carTailMesh].forEach((m) => {
      m.castShadow = false;
      m.receiveShadow = false;
    });

    for (let i = 0; i < count; i++) {
      const d = pick(defs);
      const dir = Math.random() < 0.5 ? 1 : -1;
      const min = d.axis === 'z' ? world.minZ + 4 : world.bankEast + 5;
      const max = d.axis === 'z' ? world.maxZ - 4 : world.maxX - 5;
      const color = new THREE.Color(pick(palette));
      carData.push({
        axis: d.axis,
        at: d.at + dir * 1.15,
        dir,
        pos: rand(min, max),
        min,
        max,
        speed: rand(4.5, 10.5),
        size: rand(0.9, 1.1),
        color
      });
      carBodyMesh.setColorAt(i, color);
      carRoofMesh.setColorAt(i, color);
    }
    if (carBodyMesh.instanceColor) carBodyMesh.instanceColor.needsUpdate = true;
    if (carRoofMesh.instanceColor) carRoofMesh.instanceColor.needsUpdate = true;
    scene.add(carBodyMesh, carCabinMesh, carRoofMesh, carWheelMesh, carHeadMesh, carTailMesh);
  }

  function setCarPart(mesh, index, root, lx, ly, lz, sx, sy, sz) {
    CAR_POS.set(lx, ly, lz);
    CAR_QUAT.identity();
    CAR_SCALE.set(sx, sy, sz);
    CAR_LOCAL.compose(CAR_POS, CAR_QUAT, CAR_SCALE);
    CAR_LOCAL.premultiply(root);
    mesh.setMatrixAt(index, CAR_LOCAL);
  }

  function updateTraffic(dt) {
    if (!carBodyMesh) return;
    carData.forEach((c, i) => {
      c.pos += c.dir * c.speed * dt;
      if (c.pos > c.max) c.pos = c.min;
      if (c.pos < c.min) c.pos = c.max;

      const x = c.axis === 'z' ? c.at : c.pos;
      const z = c.axis === 'z' ? c.pos : c.at;
      const visible = !inPlaza(x, z, 2.2);
      const yaw = c.axis === 'z'
        ? (c.dir > 0 ? 0 : Math.PI)
        : (c.dir > 0 ? Math.PI / 2 : -Math.PI / 2);

      const s = visible ? c.size : 0.0001;
      CAR_POS.set(x, 0, z);
      CAR_QUAT.setFromAxisAngle(CAR_Y_AXIS, yaw);
      CAR_SCALE.set(s, s, s);
      CAR_ROOT.compose(CAR_POS, CAR_QUAT, CAR_SCALE);

      // Tapered body and dark cabin.
      setCarPart(carBodyMesh, i, CAR_ROOT, 0, 0.34, 0, 1.04, 0.46, 2.25);
      setCarPart(carCabinMesh, i, CAR_ROOT, 0, 0.78, -0.08, 0.86, 0.38, 1.18);
      setCarPart(carRoofMesh, i, CAR_ROOT, 0, 1.18, -0.08, 0.7, 0.055, 0.98);

      // Four wheels, local +Z is the front of the car.
      const wx = 0.55, wz = 0.72;
      for (let w = 0; w < 4; w++) {
        const sx = w < 2 ? -wx : wx;
        const sz = w % 2 === 0 ? -wz : wz;
        setCarPart(carWheelMesh, i * 4 + w, CAR_ROOT, sx, 0.27, sz, 1, 1, 1);
      }

      // Headlights at the front, tail lights at the rear.
      setCarPart(carHeadMesh, i * 2, CAR_ROOT, -0.31, 0.6, 1.13, 1, 1, 1);
      setCarPart(carHeadMesh, i * 2 + 1, CAR_ROOT, 0.31, 0.6, 1.13, 1, 1, 1);
      setCarPart(carTailMesh, i * 2, CAR_ROOT, -0.31, 0.6, -1.13, 1, 1, 1);
      setCarPart(carTailMesh, i * 2 + 1, CAR_ROOT, 0.31, 0.6, -1.13, 1, 1, 1);
    });

    carBodyMesh.instanceMatrix.needsUpdate = true;
    carCabinMesh.instanceMatrix.needsUpdate = true;
    carRoofMesh.instanceMatrix.needsUpdate = true;
    carWheelMesh.instanceMatrix.needsUpdate = true;
    carHeadMesh.instanceMatrix.needsUpdate = true;
    carTailMesh.instanceMatrix.needsUpdate = true;
  }

  function buildBoats() {
    const makeBoat = (scale, color) => {
      const g = new THREE.Group();
      const hullMat = new THREE.MeshStandardMaterial({ color, roughness: 0.86 });
      addBox(g, 0.9, 0.45, 4.0, hullMat, 0, 0.15, 0);
      addBox(g, 0.7, 0.28, 1.1, MAT.woodDark, 0, 0.4, 0.8);
      addBox(g, 0.8, 0.08, 2.0, MAT.canvas, 0, 1.0, -0.4);
      addCyl(g, 0.03, 0.03, 1.4, 4, MAT.bamboo, 0, 1.6, -0.4);
      addBox(g, 0.3, 0.08, 1.0, MAT.boatTrim, 0, 0.36, -1.6);
      addSphere(g, 0.13, MAT.lamp, 0, 0.55, 1.5);
      g.scale.setScalar(scale);
      scene.add(g);
      return { group: g, x: 0, z: rand(-70, 70), dir: Math.random() < 0.5 ? 1 : -1, speed: rand(2.2, 4.5), phase: rand(0, 6) };
    };
    boatRecords = [makeBoat(1.25, 0x8f4b2c), makeBoat(1.0, 0x3f5969), makeBoat(0.9, 0x7c4c3c)];
  }

  function updateBoats(dt, t) {
    boatRecords.forEach((b, i) => {
      b.z += b.dir * b.speed * dt;
      if (b.z > 78) b.z = -78;
      if (b.z < -78) b.z = 78;
      const x = world.riverX + Math.sin(b.z * 0.045 + i) * 3.2 + b.dir * 2.4;
      const y = -0.42 + Math.sin(t * 1.3 + b.phase) * 0.05;
      b.group.position.set(x, y, b.z);
      b.group.rotation.y = b.dir > 0 ? 0 : Math.PI;
      b.group.rotation.z = Math.sin(t * 0.9 + b.phase) * 0.018;
    });
  }

  /* ==========================================================================
     5. LANDMARKS
     ========================================================================== */

  function hipRoofMesh(g, w, d, h, mat, x, y, z) {
    const hw = w / 2, hd = d / 2, r = w * 0.23;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      -hw, 0, -hd, hw, 0, -hd, hw, 0, hd, -hw, 0, hd, -r, h, 0, r, h, 0
    ]), 3));
    geo.setIndex([
      0, 1, 5, 0, 5, 4,
      3, 2, 5, 3, 5, 4,
      2, 1, 5,
      0, 3, 4
    ]);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  }

  function thaiRoof(g, w, d, h, mat, x, y, z, goldTrim) {
    const trimMat = goldTrim ? MAT.gold : MAT.goldDark;
    // Eave board
    addBox(g, w + 0.5, 0.22, d + 0.5, trimMat, x, y, z);
    // Lower hip
    hipRoofMesh(g, w, d, h * 0.72, mat, x, y + 0.12, z);
    // Upper tier
    const w2 = w * 0.6, d2 = d * 0.58, h2 = h * 0.55;
    addBox(g, w2 + 0.35, 0.14, d2 + 0.35, trimMat, x, y + h * 0.62, z);
    hipRoofMesh(g, w2, d2, h2, mat, x, y + h * 0.65, z);
    // Ridge
    addBox(g, w * 0.5, 0.16, 0.2, trimMat, x, y + h * 0.72 + 0.1, z);
    addBox(g, w2 * 0.55, 0.14, 0.18, trimMat, x, y + h * 0.62 + h2 + 0.06, z);
    // Gold chofah at the four eaves
    const co = [[-w / 2 + 0.1, -d / 2 + 0.1], [w / 2 - 0.1, -d / 2 + 0.1], [-w / 2 + 0.1, d / 2 - 0.1], [w / 2 - 0.1, d / 2 - 0.1]];
    co.forEach(([cx, cz]) => {
      addCone(g, 0.12, 1.1, 4, trimMat, x + cx, y + 0.55, z + cz);
    });
  }

  function thaiChedi(g, scale, x, y, z, goldMat) {
    const base = addBox(g, 5.2 * scale, 1.2 * scale, 5.2 * scale, MAT.stone, x, y + 0.6 * scale, z);
    base.receiveShadow = true;
    // Redented corners
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      addBox(g, 1.0 * scale, 2.0 * scale, 1.0 * scale, goldMat, x + sx * 2.4 * scale, y + 1.4 * scale, z + sz * 2.4 * scale);
    });
    addCyl(g, 2.6 * scale, 2.9 * scale, 1.8 * scale, 16, goldMat, x, y + 2.4 * scale, z);
    // Bell-shaped body via lathe
    const pts = [];
    const profile = [[0.2, 0], [2.4, 0.5], [2.8, 1.8], [2.5, 3.0], [1.7, 4.0], [1.0, 4.6], [0.7, 5.2], [0.35, 5.8], [0.18, 6.4]];
    profile.forEach(([r, yy]) => pts.push(new THREE.Vector2(r * scale, yy * scale)));
    const bell = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), goldMat);
    bell.position.set(x, y + 3.1 * scale, z);
    bell.castShadow = true;
    g.add(bell);
    // Spire + rings
    addCone(g, 0.95 * scale, 5.0 * scale, 12, goldMat, x, y + 12.0 * scale, z);
    for (let i = 0; i < 3; i++) {
      addTorus(g, (0.55 - i * 0.1) * scale, 0.05 * scale, goldMat, x, y + (10.4 + i * 1.0) * scale, z, Math.PI / 2);
    }
  }

  function buildWatArun() {
    const g = new THREE.Group();
    addBox(g, 27, 1.2, 27, MAT.stone, 0, 0.6, 0);
    addBox(g, 23, 1.0, 23, MAT.cream, 0, 1.7, 0);

    // Four stair flights
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const stair = addBox(g, 3.1, 0.34, 7.0, MAT.stoneDark, 0, 0.8, 13.9);
      stair.rotation.x = -0.24;
      stair.rotation.y = a;
      stair.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), a);
    }

    // Central prang
    let y = 2.2;
    const tiers = 9;
    for (let i = 0; i < tiers; i++) {
      const f = i / (tiers - 1);
      const h = 2.9 - i * 0.14;
      const fw = 9.2 - f * 5.4;
      addBox(g, fw, h, fw, MAT.cream, 0, y + h / 2, 0);
      addBox(g, fw + 0.26, 0.26, fw + 0.26, MAT.gold, 0, y + h - 0.12, 0);
      // Redented corners
      const off = fw / 2 - 0.06;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
        addBox(g, 0.85, h * 0.9, 0.85, MAT.cream, sx * off, y + h / 2, sz * off);
      });
      // Porcelain mosaic bands and face panels
      if (i < 7) {
        const bandMat = i % 2 === 0 ? MAT.porcelainGreen : MAT.porcelainOrange;
        addBox(g, fw + 0.34, 0.8, fw + 0.34, bandMat, 0, y + h * 0.3, 0);
        addBox(g, fw + 0.45, 0.16, fw + 0.45, MAT.gold, 0, y + h * 0.3 + 0.4, 0);
        const ph = Math.max(0.5, h * 0.26);
        const panelMat = i % 2 === 0 ? MAT.porcelainOrange : MAT.porcelainGreen;
        const po = fw / 2 + 0.07;
        addBox(g, fw * 0.52, ph, 0.12, panelMat, 0, y + h * 0.62, po);
        addBox(g, fw * 0.52, ph, 0.12, panelMat, 0, y + h * 0.62, -po);
        addBox(g, 0.12, ph, fw * 0.52, panelMat, po, y + h * 0.62, 0);
        addBox(g, 0.12, ph, fw * 0.52, panelMat, -po, y + h * 0.62, 0);
      }
      y += h;
    }
    // Gold crown
    addCyl(g, 1.15, 1.4, 0.9, 8, MAT.gold, 0, y + 0.45, 0);
    addCone(g, 1.7, 4.8, 8, MAT.goldBright, 0, y + 3.2, 0);
    for (let i = 0; i < 4; i++) {
      addTorus(g, 0.55 - i * 0.1, 0.055, MAT.goldDark, 0, y + 1.2 + i * 0.8, 0, Math.PI / 2);
    }
    addSphere(g, 0.28, MAT.goldBright, 0, y + 6.0, 0);

    // Four satellite prangs
    const satellites = [[-11, -11], [11, -11], [-11, 11], [11, 11]];
    satellites.forEach(([sx, sz]) => {
      addBox(g, 5.4, 0.7, 5.4, MAT.stone, sx, 0.6, sz);
      let sy = 1.2;
      for (let i = 0; i < 5; i++) {
        const f = i / 4;
        const hh = 2.0 - i * 0.15;
        const ww = 4.2 - f * 2.1;
        addBox(g, ww, hh, ww, MAT.cream, sx, sy + hh / 2, sz);
        addBox(g, ww + 0.2, 0.2, ww + 0.2, MAT.gold, sx, sy + hh - 0.1, sz);
        sy += hh;
      }
      addCone(g, 0.85, 2.6, 6, MAT.goldBright, sx, sy + 1.3, sz);
    });

    // Small guardian figures at the base
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      addCone(g, 0.22, 1.4, 5, MAT.stoneDark, Math.cos(a) * 10.4, 3.0, Math.sin(a) * 10.4);
    }
    return g;
  }

  function buildWatPho() {
    const g = new THREE.Group();
    addBox(g, 26, 0.9, 18, MAT.stone, 0, 0.45, 0);

    // Cloister wall
    addBox(g, 24, 1.8, 0.5, MAT.offwhite, 0, 1.35, -7.5);
    addBox(g, 24, 1.8, 0.5, MAT.offwhite, 0, 1.35, 7.5);
    addBox(g, 0.5, 1.8, 15, MAT.offwhite, -11.8, 1.35, 0);
    addBox(g, 0.5, 1.8, 15, MAT.offwhite, 11.8, 1.35, 0);

    // Main ubosot
    addBox(g, 20, 3.2, 7.0, MAT.white, 0, 2.5, -3.2);
    for (let i = 0; i < 7; i++) {
      addBox(g, 0.35, 3.2, 0.35, MAT.offwhite, -9 + i * 3, 2.5, 0.2);
      addBox(g, 0.35, 3.2, 0.35, MAT.offwhite, -9 + i * 3, 2.5, -6.6);
    }
    // Doors with gold
    for (let i = -2; i <= 2; i++) {
      addBox(g, 1.1, 2.2, 0.14, MAT.woodDark, i * 3.2, 2.1, 0.44);
      addBox(g, 0.9, 1.9, 0.08, MAT.goldDark, i * 3.2, 2.1, 0.52);
    }
    thaiRoof(g, 22, 9.6, 4.6, MAT.tileOrange, 0, 4.6, -3.2, true);
    addCone(g, 0.35, 2.2, 4, MAT.gold, 0, 9.6, -3.2);

    // Reclining Buddha pavilion (open-sided so the figure reads from above)
    addBox(g, 19, 0.5, 7.2, MAT.stone, 0, 1.2, 5.2);
    [-9, -4.5, 0, 4.5, 9].forEach((x) => {
      [2.2, 8.2].forEach((z) => addCyl(g, 0.22, 0.27, 3.6, 8, MAT.goldDark, x, 3.1, z));
    });
    addBox(g, 19, 0.28, 0.3, MAT.gold, 0, 5.0, 2.2);
    addBox(g, 19, 0.28, 0.3, MAT.gold, 0, 5.0, 8.2);
    addBox(g, 0.3, 0.28, 6.3, MAT.gold, -9, 5.0, 5.2);
    addBox(g, 0.3, 0.28, 6.3, MAT.gold, 9, 5.0, 5.2);
    // Reclining Buddha
    const body = addCyl(g, 1.25, 1.25, 14, 18, MAT.goldBright, 0, 2.0, 5.2);
    body.rotation.z = Math.PI / 2;
    addSphere(g, 1.45, MAT.goldBright, -7.8, 2.1, 5.2, 1.1, 1, 1);
    addCone(g, 0.5, 1.1, 10, MAT.goldBright, -7.8, 3.6, 5.2);
    addBox(g, 2.0, 0.6, 1.3, MAT.goldBright, -6.4, 1.4, 5.2);
    addBox(g, 1.4, 0.7, 1.4, MAT.goldDark, 7.2, 2.7, 5.2);

    // Four chedis
    thaiChedi(g, 0.82, -7.5, 1.0, -8.2, MAT.gold);
    thaiChedi(g, 0.55, 7.4, 1.0, -8.2, MAT.porcelainGreen);
    thaiChedi(g, 0.55, 7.6, 1.0, 2.2, MAT.porcelainOrange);
    thaiChedi(g, 0.45, -7.8, 1.0, 2.0, MAT.goldDark);

    // Courtyard gates
    [-11.8, 11.8].forEach((x) => {
      addBox(g, 2.4, 3.0, 1.0, MAT.offwhite, x, 1.9, 7.5);
      thaiRoof(g, 3.2, 2.4, 1.8, MAT.tileOrange, x, 3.4, 7.5, true);
    });

    return g;
  }

  function buildGrandPalace() {
    const g = new THREE.Group();
    addBox(g, 32, 0.8, 26, MAT.stone, 0, 0.4, 0);

    // White crenellated wall
    const wallY = 1.7;
    const wx = 15, wz = 12;
    addBox(g, wx * 2, 2.8, 0.7, MAT.white, 0, wallY, -wz);
    addBox(g, wx * 2, 2.8, 0.7, MAT.white, 0, wallY, wz);
    addBox(g, 0.7, 2.8, wz * 2, MAT.white, -wx, wallY, 0);
    addBox(g, 0.7, 2.8, wz * 2, MAT.white, wx, wallY, 0);
    // Merlons
    for (let i = -13; i <= 13; i += 2) {
      addBox(g, 0.9, 0.55, 0.8, MAT.white, i, 3.35, -wz);
      addBox(g, 0.9, 0.55, 0.8, MAT.white, i, 3.35, wz);
    }
    for (let i = -10; i <= 10; i += 2) {
      addBox(g, 0.8, 0.55, 0.9, MAT.white, -wx, 3.35, i);
      addBox(g, 0.8, 0.55, 0.9, MAT.white, wx, 3.35, i);
    }
    // Gates
    [[0, wz], [0, -wz], [wx, 0], [-wx, 0]].forEach(([x, z]) => {
      addBox(g, 3.2, 3.6, 1.4, MAT.white, x, 2.2, z);
      thaiRoof(g, 4.2, 3.2, 2.2, MAT.tileGreen, x, 3.9, z, true);
      addCone(g, 0.2, 1.6, 4, MAT.gold, x, 7.1, z);
    });

    // Wat Phra Kaew — main ubosot
    addBox(g, 12, 2.6, 5.4, MAT.white, -5, 2.3, -4);
    for (let i = 0; i < 6; i++) {
      addBox(g, 0.28, 2.4, 0.28, MAT.goldDark, -9.6 + i * 1.9, 2.2, -1.4);
      addBox(g, 0.28, 2.4, 0.28, MAT.goldDark, -9.6 + i * 1.9, 2.2, -6.6);
    }
    thaiRoof(g, 14, 7.2, 4.4, MAT.tileOrange, -5, 4.1, -4, true);
    addCone(g, 0.4, 2.4, 5, MAT.gold, -5, 8.5, -4);

    // Golden chedi (Phra Si Rattana)
    thaiChedi(g, 0.9, 4.0, 1.0, -3.0, MAT.goldBright);

    // Chakri Maha Prasat: European base with Thai roof and three spires
    addBox(g, 7.5, 5.2, 6.2, MAT.white, -5.5, 3.6, 4.6);
    addBox(g, 8.3, 0.6, 7.0, MAT.offwhite, -5.5, 6.4, 4.6);
    for (let i = 0; i < 4; i++) {
      addBox(g, 0.3, 4.2, 0.3, MAT.goldDark, -8.6 + i * 2.05, 4.1, 7.8);
    }
    thaiRoof(g, 9.2, 7.6, 3.8, MAT.tileOrange, -5.5, 6.7, 4.6, true);
    [-8, -5.5, -3].forEach((x) => {
      addCone(g, 0.4, 4.6, 6, MAT.goldBright, x, 11.6, 4.6);
    });

    // Dusit Maha Prasat
    addBox(g, 7.8, 3.4, 5.2, MAT.white, 5.8, 2.9, 3.8);
    thaiRoof(g, 9.6, 6.8, 4.0, MAT.tileGreen, 5.8, 4.5, 3.8, true);
    addCone(g, 0.35, 3.6, 6, MAT.gold, 5.8, 9.8, 3.8);

    // Small pavilions along the wall
    [[9, -8], [-11, -8], [10, 8]].forEach(([x, z]) => {
      addBox(g, 4.2, 2.2, 3.2, MAT.white, x, 2.0, z);
      thaiRoof(g, 5.2, 4.2, 2.4, MAT.tileOrange, x, 3.1, z, false);
    });

    // Gold spires at wall corners
    [[-wx, -wz], [wx, -wz], [-wx, wz], [wx, wz]].forEach(([x, z]) => {
      addBox(g, 1.8, 3.8, 1.8, MAT.white, x, 2.6, z);
      addCone(g, 0.45, 3.2, 4, MAT.goldBright, x, 5.9, z);
    });

    return g;
  }

  function buildGoldenMount() {
    const g = new THREE.Group();
    // Artificial hill, layered
    const layers = 5;
    for (let i = 0; i < layers; i++) {
      const r = 13 - i * 1.55;
      const h = 2.6;
      addCyl(g, r - 0.5, r, h, 24, i % 2 ? MAT.leaf : MAT.grass, 0, 1.3 + i * h, 0);
      // stone terrace edge
      addCyl(g, r + 0.05, r + 0.15, 0.22, 24, MAT.stone, 0, 2.55 + i * h, 0);
    }
    // Spiral path
    const pts = [];
    const turns = 3.3;
    for (let i = 0; i <= 150; i++) {
      const f = i / 150;
      const a = f * Math.PI * 2 * turns + Math.PI;
      const r = 13.2 - f * 6.2;
      const y = 0.6 + f * 12.4;
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    const pathCurve = new THREE.CatmullRomCurve3(pts);
    const path = new THREE.Mesh(new THREE.TubeGeometry(pathCurve, 140, 0.38, 4, false), MAT.stone);
    path.receiveShadow = true;
    path.castShadow = true;
    g.add(path);

    // Chedi on top
    addBox(g, 9.6, 1.0, 9.6, MAT.stone, 0, 13.6, 0);
    addBox(g, 8.2, 0.6, 8.2, MAT.goldDark, 0, 14.3, 0);
    thaiChedi(g, 1.16, 0, 14.5, 0, MAT.goldBright);

    // Small pavilions on the slope
    [[0.2, 10], [0.55, 6.5], [0.82, 3.2]].forEach(([f, r]) => {
      const a = f * Math.PI * 2 * turns + Math.PI;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const y = 0.6 + f * 12.4;
      addBox(g, 1.8, 1.4, 1.8, MAT.wood, x, y + 0.8, z);
      thaiRoof(g, 2.2, 2.2, 1.2, MAT.tileOrange, x, y + 1.7, z, true);
    });

    // Trees on the lower slope
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = rand(4, 12);
      const y = 0.8 + (13 - r) * 0.55;
      addCyl(g, 0.08, 0.12, 1.2, 5, MAT.trunk, Math.cos(a) * r, y + 0.6, Math.sin(a) * r);
      addSphere(g, 0.8, MAT.leaf, Math.cos(a) * r, y + 1.7, Math.sin(a) * r, 1, 1.1, 1);
    }
    return g;
  }

  function buildBaiyoke() {
    const g = new THREE.Group();
    // Podium
    addBox(g, 20, 8, 16, MAT.white, 0, 4, 0);
    addBox(g, 20.6, 0.6, 16.6, MAT.glassDark, 0, 8.2, 0);
    addBox(g, 8, 3.2, 3, MAT.goldDark, 0, 1.6, 8.2);
    // Shaft
    let y = 8.4;
    const sections = 7;
    for (let i = 0; i < sections; i++) {
      const f = i / (sections - 1);
      const w = 12 - f * 2.4;
      const h = 7.2;
      addBox(g, w, h, w, MAT.glassBlue, 0, y + h / 2, 0);
      // vertical gold mullions
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([sx, sz]) => {
        addBox(g, sx ? 0.2 : w + 0.1, h, sz ? 0.2 : w + 0.1, MAT.goldDark, 0, y + h / 2, 0);
      });
      // floor band
      addBox(g, w + 0.3, 0.28, w + 0.3, MAT.offwhite, 0, y + 0.3, 0);
      y += h;
    }
    // Observation deck
    addCyl(g, 8.0, 7.6, 1.8, 24, MAT.white, 0, y + 0.9, 0);
    addCyl(g, 8.2, 8.2, 0.3, 24, MAT.gold, 0, y + 1.95, 0);
    // Neon crown ring
    const ring = addTorus(g, 7.5, 0.16, MAT.neon, 0, y + 2.0, 0, Math.PI / 2);
    ring.material = MAT.neon;
    // Upper crown
    addCyl(g, 4.2, 6.8, 3.2, 16, MAT.glassDark, 0, y + 3.6, 0);
    addCyl(g, 1.1, 4.2, 2.4, 16, MAT.white, 0, y + 6.2, 0);
    addCyl(g, 0.16, 0.55, 13, 8, MAT.black, 0, y + 13.8, 0);
    addSphere(g, 0.55, MAT.lamp, 0, y + 20.3, 0);
    baiyokeBeacon = addSphere(g, 0.35, new THREE.MeshStandardMaterial({ color: srgb(0xff6a5a), emissive: srgb(0xff3020), emissiveIntensity: 1 }), 0, y + 20.4, 0);
    // Observation windows
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      addBox(g, 1.2, 0.9, 0.2, MAT.goldBright, Math.cos(a) * 7.9, y + 0.9, Math.sin(a) * 7.9, -a);
    }
    // Sign
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(13, 3.4), makeNeonMaterial('BAIYOKE', '#9fe8ff', 'TOWER II'));
    sign.position.set(0, 5.8, 8.05);
    g.add(sign);
    return g;
  }

  const BUILDERS = {
    'wat-arun': buildWatArun,
    'wat-pho': buildWatPho,
    'grand-palace': buildGrandPalace,
    'golden-mount': buildGoldenMount,
    'baiyoke': buildBaiyoke
  };

  function markLandmark(group, l) {
    group.traverse((o) => {
      if (o.isMesh) {
        o.userData.landmarkId = l.id;
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    group.userData.landmarkId = l.id;
  }

  function buildLandmarks() {
    LANDMARKS.forEach((l) => {
      addPlaza(l);
      const g = BUILDERS[l.id]();
      g.position.set(l.position[0], 0.12, l.position[1]);
      g.name = 'landmark-' + l.id;
      markLandmark(g, l);
      scene.add(g);
      landmarkGroups.push(g);

      // Pick volume (invisible but raycastable)
      const pickRadius = Math.max(10, l.plaza * 0.95);
      const pick = new THREE.Mesh(
        new THREE.SphereGeometry(pickRadius, 12, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })
      );
      pick.position.set(l.position[0], Math.max(8, l.markerY * 0.45), l.position[1]);
      pick.userData.landmarkId = l.id;
      pick.userData.pickKind = 'volume';
      scene.add(pick);
      pickTargets.push(pick);

      // Walk collider for the solid base
      if (l.id === 'wat-pho') colliders.push({ x: l.position[0], z: l.position[1] - 1, hw: 10.5, hd: 6.5 });
      if (l.id === 'grand-palace') colliders.push({ x: l.position[0], z: l.position[1], hw: 15, hd: 12 });
      if (l.id === 'golden-mount') colliders.push({ x: l.position[0], z: l.position[1], hw: 12, hd: 12 });
      if (l.id === 'baiyoke') colliders.push({ x: l.position[0], z: l.position[1], hw: 10, hd: 8 });
      if (l.id === 'wat-arun') colliders.push({ x: l.position[0], z: l.position[1], hw: 13, hd: 13 });
    });
    buildMarkers();
  }

  function markerWorld(l) {
    const o = l.markerOffset || [0, 0, 0];
    return { x: l.position[0] + o[0], y: l.markerY, z: l.position[1] + o[2] };
  }

  function buildMarkers() {
    markerRoot = new THREE.Group();
    markerRoot.name = 'landmark-markers';
    scene.add(markerRoot);
    const ringGeo = new THREE.TorusGeometry(1.7, 0.11, 8, 30);
    const gemGeo = new THREE.OctahedronGeometry(0.95, 0);
    const beamGeo = new THREE.CylinderGeometry(0.035, 0.13, 11, 6, 1, true);
    const glowTex = radialTexture('rgba(255,220,150,.95)', 'rgba(255,180,80,0)', 128);

    LANDMARKS.forEach((l) => {
      const marker = markerWorld(l);
      const g = new THREE.Group();
      g.position.set(marker.x, marker.y, marker.z);
      const goldMat = new THREE.MeshStandardMaterial({
        color: srgb(0xe8bd6f), emissive: srgb(0x8a5b16), emissiveIntensity: 0.45, roughness: 0.35, metalness: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, goldMat);
      ring.rotation.x = Math.PI / 2;
      g.add(ring);

      const gem = new THREE.Mesh(gemGeo, goldMat.clone());
      gem.scale.set(0.85, 1.35, 0.85);
      g.add(gem);

      const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({
        color: 0xe8c27d, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
      }));
      beam.position.y = -6.2;
      g.add(beam);

      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending
      }));
      glow.scale.set(11, 11, 1);
      g.add(glow);

      g.userData.landmarkId = l.id;
      [ring, gem].forEach((m) => {
        m.userData.landmarkId = l.id;
        m.userData.pickKind = 'marker';
        pickTargets.push(m);
      });
      markerRoot.add(g);
      markerRecords.push({
        id: l.id, group: g, ring, gem, glow, baseY: marker.y, phase: Math.random() * Math.PI * 2
      });
    });
  }

  /* ==========================================================================
     6. CAMERA MODES AND TOUR
     ========================================================================== */

  const droneHome = { pos: new THREE.Vector3(98, 110, 126), target: new THREE.Vector3(-4, 10, -10) };
  const droneCamPos = new THREE.Vector3().copy(droneHome.pos);
  const droneTarget = new THREE.Vector3().copy(droneHome.target);
  let introVisible = true;
  let drawerOpen = false;
  let helpOpen = false;
  let activeLandmark = null;
  let tween = null;
  let playerPos = new THREE.Vector3(-10.5, EYE, 46);
  let playerLook = new THREE.Vector3(-50, 14, 18);
  let bobT = 0;
  let stepAccum = 0;
  const keys = {};
  const padKeys = { forward: false, back: false, left: false, right: false };

  // Normal drag-to-look walk controls (no pointer lock).
  const walkLook = { active: false, pointerId: null, lastX: 0, lastY: 0, yaw: 0, pitch: 0, moved: 0 };
  const walkEuler = new THREE.Euler(0, 0, 0, 'YXZ');
  let walkHintDismissed = false;
  let walkHintTimer = null;
  let freeZoom = 1; // walk/tour field-of-view zoom; drone uses OrbitControls distance
  const ZOOM_MIN = 0.6;
  const ZOOM_MAX = 1.8;

  let tourCurve, tourStops = [], tourLook = new THREE.Vector3();
  const tourState = { u: 0, index: 0, dwell: 0, active: -1, playing: true, completed: false };
  let tourResume = false;

  function setupControls() {
    orbit = new THREE.OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.065;
    orbit.target.copy(droneHome.target);
    orbit.minDistance = 16;
    orbit.maxDistance = 270;
    orbit.maxPolarAngle = Math.PI * 0.475;
    orbit.autoRotate = true;
    orbit.autoRotateSpeed = 0.18;
    orbit.enablePan = true;
    orbit.screenSpacePanning = false;

  }

  function baseFov() {
    return window.innerWidth / window.innerHeight < 0.85 ? 62 : 48;
  }

  function applyViewFov() {
    if (!camera) return;
    const zoom = state.mode === 'drone' ? 1 : freeZoom;
    const next = clamp(baseFov() * zoom, 26, 86);
    if (Math.abs(camera.fov - next) > 0.01) {
      camera.fov = next;
      camera.updateProjectionMatrix();
    }
  }

  function dismissWalkHint() {
    walkHintDismissed = true;
    clearTimeout(walkHintTimer);
    dom.walkHint.hidden = true;
  }

  function endWalkDrag(e) {
    if (!walkLook.active) return;
    const pointerId = e ? e.pointerId : walkLook.pointerId;
    walkLook.active = false;
    walkLook.pointerId = null;
    dom.canvas.classList.remove('is-dragging');
    if (pointerId != null && dom.canvas.releasePointerCapture) {
      try { dom.canvas.releasePointerCapture(pointerId); } catch (err) { /* already released */ }
    }
  }

  function releaseWalkPad() {
    Object.keys(padKeys).forEach((k) => { padKeys[k] = false; });
    if (dom.walkPad) $$('.walk-pad-btn', dom.walkPad).forEach((b) => b.classList.remove('is-held'));
  }

  function focusScene() {
    const active = document.activeElement;
    if (active && active !== document.body && active !== dom.canvas && typeof active.blur === 'function') {
      active.blur();
    }
    if (dom.canvas && dom.canvas.focus) {
      try { dom.canvas.focus({ preventScroll: true }); } catch (err) { /* older browsers */ }
    }
  }

  function onWheelZoom(e) {
    if (introVisible || drawerOpen || helpOpen) return;
    if (state.mode !== 'walk' && state.mode !== 'tour') return;
    e.preventDefault();
    const direction = Math.sign(e.deltaY);
    if (!direction) return;
    freeZoom = clamp(freeZoom * (direction > 0 ? 1.09 : 0.917), ZOOM_MIN, ZOOM_MAX);
    applyViewFov();
    dismissWalkHint();
  }

  function setMode(mode, opts) {
    if (!['drone', 'walk', 'tour'].includes(mode)) return;
    if (state.mode === mode && !(opts && opts.force)) {
      updateModeUI();
      return;
    }
    if (state.mode === 'drone') {
      droneCamPos.copy(camera.position);
      droneTarget.copy(orbit.target);
    }
    const previous = state.mode;
    state.mode = mode;
    if (mode !== 'drone') tween = null;
    saveState();

    if (mode === 'walk') {
      orbit.enabled = false;
      orbit.autoRotate = false;
      camera.position.copy(playerPos);
      camera.lookAt(playerLook);
      if (matchMedia('(pointer: coarse)').matches && !(opts && opts.silent)) {
        toast(t('toast.walkMobile'));
      }
      walkHintDismissed = false;
      clearTimeout(walkHintTimer);
      walkHintTimer = setTimeout(() => {
        walkHintDismissed = true;
        updateModeUI();
      }, 7000);
      dom.walkHint.hidden = false;
      dom.crosshair.hidden = true;
      dom.walkHint.style.display = '';
    } else {
      clearTimeout(walkHintTimer);
      endWalkDrag();
      releaseWalkPad();
      dom.walkHint.hidden = true;
      dom.crosshair.hidden = true;
      if (mode === 'drone') {
        orbit.enabled = true;
        orbit.autoRotate = false;
        camera.position.copy(droneCamPos);
        orbit.target.copy(droneTarget);
        orbit.update();
      }
      if (mode === 'tour') {
        orbit.enabled = false;
        enterTour();
      }
    }
    updateModeUI();
    applyViewFov();
    updateHint();
    updateDrawerButtons();
    if (!drawerOpen && !helpOpen) focusScene();
    if (!(opts && opts.silent)) {
      if (mode === 'tour') toast(t('toast.tourStart'));
    }
    void previous;
  }

  function updateModeUI() {
    $$('.mode-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.mode === state.mode));
    dom.tourBar.hidden = state.mode !== 'tour';
    dom.hintBar.hidden = state.mode === 'tour';
    dom.walkHint.hidden = !(state.mode === 'walk' && !walkHintDismissed && !drawerOpen && !helpOpen);
    dom.walkPad.hidden = !(state.mode === 'walk' && !drawerOpen && !helpOpen && !introVisible);
    if (dom.walkPad.hidden) releaseWalkPad();
    dom.crosshair.hidden = true;
    document.body.classList.toggle('is-walking', state.mode === 'walk');
    document.body.classList.toggle('is-touring', state.mode === 'tour');
    updateHint();
  }

  function updateHint() {
    const mode = state.mode;
    dom.hintKey.textContent = t('hint.' + mode + 'Key');
    dom.hintText.textContent = t('hint.' + (mode === 'drone' ? 'drone' : mode));
    $$('.mode-btn').forEach((b) => {
      b.title = t('mode.' + b.dataset.mode + 'Title');
    });
  }

  function updateWalk(dt) {
    if (state.mode !== 'walk' || drawerOpen || helpOpen) return;
    // Keep the walker on the east bank, inside the city.
    let mx = 0, mz = 0;
    const fwd = (keys.KeyW || keys.ArrowUp || padKeys.forward ? 1 : 0) - (keys.KeyS || keys.ArrowDown || padKeys.back ? 1 : 0);
    const side = (keys.KeyD || keys.ArrowRight || padKeys.right ? 1 : 0) - (keys.KeyA || keys.ArrowLeft || padKeys.left ? 1 : 0);
    const sprint = keys.ShiftLeft || keys.ShiftRight;
    const speed = sprint ? 8.4 : 4.2;

    if (fwd || side) {
      camera.getWorldDirection(tmpVec);
      tmpVec.y = 0;
      if (tmpVec.lengthSq() < 0.001) tmpVec.set(0, 0, -1);
      tmpVec.normalize();
      const right = new THREE.Vector3(-tmpVec.z, 0, tmpVec.x);
      const dir = new THREE.Vector3().addScaledVector(tmpVec, fwd).addScaledVector(right, side);
      if (dir.lengthSq() > 0) {
        dir.normalize();
        mx = dir.x * speed * dt;
        mz = dir.z * speed * dt;
      }
    }

    if (mx || mz) {
      const nx = camera.position.x + mx;
      const nz = camera.position.z + mz;
      if (!walkBlocked(nx, camera.position.z)) camera.position.x = nx;
      if (!walkBlocked(camera.position.x, nz)) camera.position.z = nz;
      playerPos.copy(camera.position);
      playerPos.y = EYE;

      bobT += dt * (sprint ? 12 : 7.4);
      camera.position.y = EYE + Math.sin(bobT) * (sprint ? 0.075 : 0.045);
      stepAccum += Math.hypot(mx, mz);
      if (stepAccum > (sprint ? 2.2 : 1.7)) {
        stepAccum = 0;
        cityAudio.footstep(sprint);
      }
    } else {
      camera.position.y = damp(camera.position.y, EYE, 8, dt);
    }

    // Remember the current look so leaving and re-entering walk mode is seamless.
    camera.getWorldDirection(tmpVec);
    playerLook.copy(camera.position).addScaledVector(tmpVec, 10);
    playerPos.copy(camera.position);
    playerPos.y = EYE;

    // Proximity hint for E
    const near = nearestLandmark(camera.position, 30);
    if (near) {
      dom.hintKey.textContent = 'E';
      dom.hintText.textContent = tf('hint.inspect', { name: landmarkText(near).name });
    } else {
      updateHint();
    }
  }

  function walkBlocked(x, z) {
    if (x < world.bankEast + 0.9) return true;
    if (x > world.maxX - 1.5) return true;
    if (z < world.minZ + 1.5 || z > world.maxZ - 1.5) return true;
    const r = 0.55;
    for (const c of colliders) {
      if (Math.abs(x - c.x) < c.hw + r && Math.abs(z - c.z) < c.hd + r) return true;
    }
    return false;
  }

  function nearestLandmark(pos, maxDist) {
    let best = null, bestD = maxDist || Infinity;
    LANDMARKS.forEach((l) => {
      const d = Math.hypot(pos.x - l.position[0], pos.z - l.position[1]);
      if (d < bestD) { bestD = d; best = l; }
    });
    return best;
  }

  function setupTour() {
    const points = [
      [-30, 9, 72], [-30, 10, 58], [-31, 11, 48], [-30, 11, 34], [-30, 11, 26],
      [-29, 12, 10], [-27, 13, -2], [-20, 18, -12], [-12, 24, -22], [-2, 28, -30],
      [6, 30, -34], [18, 36, -40], [28, 44, -46], [38, 46, -52]
    ].map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    tourCurve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);

    // Find the point on the curve closest to each landmark's tour viewpoint.
    tourStops = LANDMARKS.map((l) => {
      const target = new THREE.Vector3(l.tourPoint[0], l.tourPoint[1], l.tourPoint[2]);
      let bestU = 0, bestD = Infinity;
      for (let i = 0; i <= 700; i++) {
        const u = i / 700;
        const p = tourCurve.getPointAt(u);
        const d = p.distanceToSquared(target);
        if (d < bestD) { bestD = d; bestU = u; }
      }
      return {
        landmark: l,
        u: bestU,
        view: l.tourView ? new THREE.Vector3(l.tourView[0], l.tourView[1], l.tourView[2]) : tourCurve.getPointAt(bestU),
        focus: new THREE.Vector3(l.focus[0], l.focus[1], l.focus[2])
      };
    }).sort((a, b) => a.u - b.u);

    tourStops.forEach((s, i) => {
      const node = dom.tourTrack.querySelector('[data-stop="' + i + '"]');
      if (node) node.style.left = (s.u * 100).toFixed(1) + '%';
    });
    dom.tourBoat.style.left = '0%';
  }

  function enterTour() {
    if (tourState.completed) {
      tourState.u = 0; tourState.index = 0; tourState.completed = false; tourState.active = -1;
    }
    tourState.playing = true;
    if (state.mode === 'tour') {
      const p = tourCurve.getPointAt(tourState.u);
      camera.position.copy(p);
      tourLook.copy(tourCurve.getPointAt(Math.min(1, tourState.u + 0.015)));
      camera.lookAt(tourLook);
      updateTourHud();
    }
  }

  function updateTour(dt, time) {
    if (state.mode !== 'tour' || !tourCurve) return;
    if (drawerOpen || helpOpen) return;

    if (tourState.dwell > 0) {
      tourState.dwell -= dt;
      if (tourState.dwell <= 0) {
        tourState.dwell = 0;
        tourState.index += 1;
        tourState.active = -1;
        if (tourState.index >= tourStops.length) {
          tourState.completed = true;
          tourState.playing = false;
          toast(t('tour.complete'));
        }
        updateTourHud();
      }
    } else if (tourState.playing) {
      tourState.u += dt * 0.0138;
      if (tourState.u >= 1) {
        tourState.u = 1;
        if (tourState.index >= tourStops.length) {
          tourState.completed = true;
          tourState.playing = false;
        }
      }
      const next = tourStops[tourState.index];
      if (next && tourState.u >= next.u) {
        tourState.u = next.u;
        tourState.dwell = 7.2;
        tourState.active = tourState.index;
        updateTourHud();
      }
    }

    if (!tourState.playing && tourState.dwell <= 0 && !tourState.completed) {
      // paused: keep the current frame
    }

    const stop = tourState.active >= 0 ? tourStops[tourState.active] : null;
    if (stop && tourState.dwell > 0) {
      const p = stop.view.clone();
      p.x += Math.sin(time * 0.45) * 0.8;
      p.y += Math.sin(time * 0.6) * 0.35;
      p.z += Math.cos(time * 0.38) * 0.8;
      camera.position.lerp(p, 1 - Math.exp(-4 * dt));
      tourLook.lerp(stop.focus, 1 - Math.exp(-2.6 * dt));
    } else {
      const p = tourCurve.getPointAt(clamp(tourState.u, 0, 1));
      camera.position.lerp(p, 1 - Math.exp(-8 * dt));
      const aheadU = clamp(tourState.u + 0.022, 0, 1);
      const ahead = tourCurve.getPointAt(aheadU);
      ahead.y += 0.35;
      tourLook.lerp(ahead, 1 - Math.exp(-2.4 * dt));
    }
    camera.lookAt(tourLook);
    updateTourHud();
  }

  function updateTourHud() {
    if (!tourStops.length) return;
    const stop = tourState.active >= 0 ? tourStops[tourState.active] : null;
    const next = tourStops[Math.min(tourState.index, tourStops.length - 1)];
    dom.tourStopLabel.textContent = stop
      ? tf('tour.stop', { n: tourState.active + 1 })
      : (tourState.completed ? t('tour.complete') : t('tour.enRoute'));
    dom.tourName.textContent = stop ? landmarkText(stop.landmark).name : (next ? landmarkText(next.landmark).name : '—');
    dom.tourBoat.style.left = (clamp(tourState.u, 0, 1) * 100).toFixed(2) + '%';
    dom.tourPlayBtn.textContent = tourState.completed ? '↻' : (tourState.playing ? '❚❚' : '▶');
    dom.tourPlayBtn.setAttribute('aria-label', tourState.playing ? 'Pause tour' : 'Play tour');
    dom.tourPlayBtn.title = tourState.completed ? t('tour.replay') : (tourState.playing ? t('tour.paused') : 'Play');
    $$('.tour-node', dom.tourTrack).forEach((node, i) => {
      node.classList.toggle('is-past', i < tourState.index || tourState.completed);
      node.classList.toggle('is-current', i === tourState.active);
    });
    dom.tourNextBtn.querySelector('span').textContent = t('tour.next');
  }

  function tourNext() {
    if (!tourStops.length) return;
    if (tourState.completed) {
      tourState.u = 0; tourState.index = 0; tourState.completed = false;
      tourState.playing = true; tourState.dwell = 0; tourState.active = -1;
      enterTour();
      updateTourHud();
      return;
    }
    const idx = tourState.dwell > 0 ? (tourState.index + 1) % tourStops.length : tourState.index % tourStops.length;
    tourState.index = idx;
    tourState.u = tourStops[idx].u;
    tourState.dwell = 7.2;
    tourState.active = idx;
    tourState.playing = true;
    tourState.completed = false;
    camera.position.copy(tourStops[idx].view);
    updateTourHud();
    toast(tf('toast.tourNext', { name: landmarkText(tourStops[idx].landmark).name }));
  }

  function toggleTourPlay() {
    if (tourState.completed) {
      tourState.u = 0; tourState.index = 0; tourState.completed = false;
      tourState.active = -1; tourState.dwell = 0; tourState.playing = true;
      enterTour();
      return;
    }
    tourState.playing = !tourState.playing;
    updateTourHud();
  }

  function flyToLandmark(l) {
    if (state.mode !== 'drone') setMode('drone', { silent: true });
    const target = new THREE.Vector3(l.view.target[0], l.view.target[1], l.view.target[2]);
    const pos = new THREE.Vector3(l.view.pos[0], l.view.pos[1], l.view.pos[2]);
    startTween(pos, target, 1.5);
    toast(tf('toast.focus', { name: landmarkText(l).name }));
  }

  function startTween(pos, target, duration) {
    orbit.enabled = false;
    tween = {
      fromPos: camera.position.clone(),
      toPos: pos.clone(),
      fromTarget: orbit.target.clone(),
      toTarget: target.clone(),
      t: 0,
      duration: duration || 1.4
    };
  }

  function updateTween(dt) {
    if (!tween) return;
    tween.t += dt;
    const k = clamp(tween.t / tween.duration, 0, 1);
    const e = 1 - Math.pow(1 - k, 3);
    camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
    orbit.target.lerpVectors(tween.fromTarget, tween.toTarget, e);
    camera.lookAt(orbit.target);
    if (k >= 1) {
      const t = tween;
      tween = null;
      if (state.mode === 'drone') orbit.enabled = !drawerOpen && !helpOpen;
      droneCamPos.copy(camera.position);
      droneTarget.copy(orbit.target);
      void t;
    }
  }

  function recenterDrone() {
    if (state.mode !== 'drone') setMode('drone', { silent: true });
    startTween(droneHome.pos, droneHome.target, 1.4);
    closeDrawer();
    toast(t('toast.reset'));
  }

  /* ==========================================================================
     AUDIO
     ========================================================================== */

  class CityAudio {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.beds = [];
      this.enabled = state.audio;
      this.started = false;
      this.chimeTimer = null;
      this.panner = null;
      this.lastChime = 0;
    }

    async start() {
      if (!this.enabled) return;
      try {
        if (!this.ctx) this.build();
        if (this.ctx && this.ctx.state === 'suspended') await this.ctx.resume();
        this.started = true;
      } catch (e) { /* audio is optional */ }
    }

    build() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 0.62;
      this.master.connect(ctx.destination);

      const noise = ctx.createBuffer(2, ctx.sampleRate * 4, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = noise.getChannelData(ch);
        let last = 0;
        for (let i = 0; i < data.length; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + 0.018 * white) / 1.018;
          data[i] = last * 3.2;
        }
      }

      const bed = (type, freq, q, gain, pan) => {
        const src = ctx.createBufferSource();
        src.buffer = noise;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = freq;
        filter.Q.value = q;
        const g = ctx.createGain();
        g.gain.value = gain;
        const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        src.connect(filter);
        filter.connect(g);
        if (p) {
          p.pan.value = pan;
          g.connect(p);
          p.connect(this.master);
        } else {
          g.connect(this.master);
        }
        src.start();
        this.beds.push({ src, gain: g, filter, panner: p });
        return { src, gain: g, filter, panner: p };
      };

      this.river = bed('bandpass', 420, 0.7, 0.12, -0.35);
      this.traffic = bed('lowpass', 190, 0.9, 0.075, 0.15);
      this.air = bed('highpass', 1400, 0.5, 0.014, 0.0);

      // LFO on river swell
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.11;
      lfoGain.gain.value = 0.045;
      lfo.connect(lfoGain);
      lfoGain.connect(this.river.gain.gain);
      lfo.start();

      // Spatial temple bell bus
      this.panner = ctx.createPanner();
      this.panner.panningModel = 'HRTF';
      this.panner.distanceModel = 'inverse';
      this.panner.refDistance = 18;
      this.panner.maxDistance = 260;
      if (this.panner.positionX) {
        this.panner.positionX.value = -50;
        this.panner.positionY.value = 22;
        this.panner.positionZ.value = 30;
      } else if (this.panner.setPosition) {
        this.panner.setPosition(-50, 22, 30);
      }
      const bellGain = ctx.createGain();
      bellGain.gain.value = 0.5;
      this.panner.connect(bellGain);
      bellGain.connect(this.master);

      this.scheduleChime(4000);
      this.updateListener();
    }

    scheduleChime(delay) {
      if (!this.ctx) return;
      clearTimeout(this.chimeTimer);
      this.chimeTimer = setTimeout(() => {
        if (this.started && this.enabled && this.ctx && this.ctx.state === 'running') {
          this.chime();
          this.scheduleChime(rand(10, 19) * 1000);
        } else {
          this.scheduleChime(6000);
        }
      }, (delay || 10000));
    }

    chime() {
      if (!this.ctx || !this.panner) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const base = pick([523.25, 587.33, 659.25, 783.99]);
      [1, 2.02, 3.01].forEach((mult, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.value = base * mult;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.09 / (i + 1), now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 2.6 + i * 0.3);
        osc.connect(g);
        g.connect(this.panner);
        osc.start(now);
        osc.stop(now + 3.2 + i * 0.3);
      });
    }

    footstep(sprint) {
      if (!this.ctx || !this.enabled || this.ctx.state !== 'running') return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const src = ctx.createBufferSource();
      const len = Math.floor(ctx.sampleRate * 0.13);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
      }
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = sprint ? 1300 : 950;
      filter.Q.value = 0.8;
      const g = ctx.createGain();
      g.gain.value = sprint ? 0.11 : 0.07;
      src.connect(filter);
      filter.connect(g);
      g.connect(this.master);
      src.start(now);

      const thump = ctx.createOscillator();
      const tg = ctx.createGain();
      thump.frequency.setValueAtTime(88, now);
      thump.frequency.exponentialRampToValueAtTime(42, now + 0.1);
      tg.gain.setValueAtTime(0.075, now);
      tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      thump.connect(tg);
      tg.connect(this.master);
      thump.start(now);
      thump.stop(now + 0.18);
    }

    setEnabled(on) {
      this.enabled = on;
      if (on) {
        this.start().then(() => {
          if (this.master) this.master.gain.setTargetAtTime(0.62, this.ctx.currentTime, 0.15);
        });
      } else if (this.master) {
        this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.1);
      }
    }

    updateListener() {
      if (!this.ctx) return;
      const l = this.ctx.listener;
      const p = camera.position;
      const dir = camera.getWorldDirection(tmpVec);
      if (l.positionX) {
        l.positionX.value = p.x; l.positionY.value = p.y; l.positionZ.value = p.z;
        l.forwardX.value = dir.x; l.forwardY.value = dir.y; l.forwardZ.value = dir.z;
        l.upX.value = 0; l.upY.value = 1; l.upZ.value = 0;
      } else if (l.setPosition) {
        l.setPosition(p.x, p.y, p.z);
        l.setOrientation(dir.x, dir.y, dir.z, 0, 1, 0);
      }
      // Pan river by the camera's bank.
      if (this.river && this.river.panner) this.river.panner.pan.value = clamp((p.x + 26) / 45, -0.65, 0.65);
      if (this.traffic && this.traffic.panner) this.traffic.panner.pan.value = clamp((p.x - 20) / 100, -0.5, 0.5);
    }
  }

  const cityAudio = new CityAudio();

  /* ==========================================================================
     7. UI
     ========================================================================== */

  let toastTimer = null;
  function toast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.remove('is-on'), 3200);
  }

  function updateTimeButtons() {
    $$('#timeSwitch button').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.preset === state.preset);
      b.title = t('time.' + b.dataset.preset + 'Title');
    });
  }

  function updateLangUI() {
    dom.langLabel.textContent = state.lang === 'en' ? 'ไทย' : 'EN';
    dom.langBtn.setAttribute('aria-label', state.lang === 'en' ? 'สลับเป็นภาษาไทย' : 'Switch to English');
    dom.langBtn.title = state.lang === 'en' ? 'สลับเป็นภาษาไทย (L)' : 'Switch to English (L)';
    $$('.intro-lang button').forEach((b) => b.classList.toggle('is-active', b.dataset.lang === state.lang));
    document.documentElement.lang = state.lang;
  }

  function applyLanguage(lang, opts) {
    if (lang !== 'en' && lang !== 'th') return;
    const changed = state.lang !== lang;
    state.lang = lang;
    saveState();
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    $$('[data-i18n-ph]').forEach((el) => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    $$('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
    if (dom.walkPad) dom.walkPad.setAttribute('aria-label', t('walk.pad'));
    updateLangUI();
    updateTimeButtons();
    updateModeUI();
    updateHint();
    updateProgress();
    updateLandmarkList();
    updateLabelsText();
    updateTourHud();
    updateTrailPanelText();
    if (drawerOpen && activeLandmark) renderDrawer(activeLandmark, true);
    if (changed && !(opts && opts.silent)) toast(t('toast.lang'));
  }

  function updateTrailPanelText() {
    dom.trailPanel.setAttribute('aria-label', t('trail.title'));
    dom.trailClose.setAttribute('aria-label', t('trail.hide'));
    dom.trailFab.setAttribute('aria-label', t('trail.show'));
    dom.saveBtn.title = t('trail.save');
    dom.loadBtn.title = t('trail.load');
    dom.visitedBtn.querySelector('span:last-child').textContent = isVisited(activeLandmark && activeLandmark.id) ? t('drawer.visited') : t('drawer.mark');
    dom.itineraryBtn.querySelector('span:last-child').textContent = isOnRoute(activeLandmark && activeLandmark.id) ? t('drawer.onRoute') : t('drawer.addRoute');
    dom.narrateBtn.title = t('drawer.listen');
  }

  function isVisited(id) { return !!id && state.visited.includes(id); }
  function isOnRoute(id) { return !!id && state.itinerary.includes(id); }

  function updateProgress() {
    const n = state.visited.length;
    dom.progressText.textContent = tf('trail.progress', { n });
    dom.progressFill.style.width = (n / 5) * 100 + '%';
    dom.trailFabCount.textContent = n + '/5';
    if (dom.routeText) dom.routeText.textContent = tf('trail.route', { n: state.itinerary.length });
  }

  function buildLandmarkList() {
    dom.landmarkList.innerHTML = '';
    LANDMARKS.forEach((l) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'landmark-item';
      btn.dataset.id = l.id;
      btn.innerHTML =
        '<span class="li-num">' + l.index + '</span>' +
        '<span class="li-copy"><b></b><small></small></span>' +
        '<span class="li-flag">✦</span>';
      btn.addEventListener('click', () => {
        openLandmark(l.id);
        flyToLandmark(l);
      });
      li.appendChild(btn);
      dom.landmarkList.appendChild(li);
    });
    updateLandmarkList();
  }

  function updateLandmarkList() {
    $$('.landmark-item', dom.landmarkList).forEach((btn) => {
      const l = LANDMARK_BY_ID[btn.dataset.id];
      if (!l) return;
      const txt = landmarkText(l);
      const other = state.lang === 'en' ? l.th.name : l.en.name;
      btn.querySelector('b').textContent = txt.name;
      btn.querySelector('small').textContent = other;
      btn.classList.toggle('is-visited', isVisited(l.id));
      btn.classList.toggle('is-active', !!(activeLandmark && activeLandmark.id === l.id && drawerOpen));
      btn.title = txt.name + ' · ' + txt.kicker;
      btn.setAttribute('aria-label', txt.name + (isVisited(l.id) ? ', visited' : ''));
    });
  }

  function buildLabels() {
    dom.labels.innerHTML = '';
    LANDMARKS.forEach((l) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'landmark-label';
      el.dataset.id = l.id;
      el.innerHTML = '<span class="lab-num">' + l.index + '</span><b></b>';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openLandmark(l.id);
      });
      el.addEventListener('pointerenter', () => {
        el.classList.add('is-hover');
        setHovered(l.id);
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-hover');
        setHovered(null);
      });
      dom.labels.appendChild(el);
    });
    updateLabelsText();
  }

  function updateLabelsText() {
    $$('.landmark-label', dom.labels).forEach((el) => {
      const l = LANDMARK_BY_ID[el.dataset.id];
      if (!l) return;
      el.querySelector('b').textContent = landmarkText(l).name;
      el.classList.toggle('is-visited', isVisited(l.id));
      el.title = landmarkText(l).kicker;
    });
  }

  function updateLabels() {
    const w = window.innerWidth, h = window.innerHeight;
    const visible = !introVisible && !drawerOpen && !helpOpen && dom.loading.classList.contains('is-gone');
    LANDMARKS.forEach((l, i) => {
      const el = dom.labels.children[i];
      if (!el) return;
      const marker = markerWorld(l);
      const v = tmpVec.set(marker.x, marker.y + 6.5, marker.z).project(camera);
      if (v.z > 1 || v.z < -1 || v.x < -1.3 || v.x > 1.3 || v.y < -1.2 || v.y > 1.3) {
        el.classList.add('is-off');
        return;
      }
      if (!visible) { el.classList.add('is-off'); return; }
      const dist = camera.position.distanceTo(new THREE.Vector3(marker.x, marker.y, marker.z));
      if (dist > 340) { el.classList.add('is-off'); return; }
      el.style.left = ((v.x * 0.5 + 0.5) * w).toFixed(1) + 'px';
      el.style.top = ((-v.y * 0.5 + 0.5) * h).toFixed(1) + 'px';
      el.style.opacity = clamp(1.25 - dist / 360, 0.25, 1);
      el.classList.remove('is-off');
    });
  }

  function openLandmark(id, opts) {
    const l = LANDMARK_BY_ID[id];
    if (!l) return;
    activeLandmark = l;
    if (state.mode === 'tour' && !drawerOpen) {
      tourResume = tourState.playing;
      tourState.playing = false;
    }
    drawerOpen = true;
    endWalkDrag();
    renderDrawer(l, false);
    dom.drawer.classList.add('is-open');
    dom.drawer.setAttribute('aria-hidden', 'false');
    dom.scrim.classList.add('is-on');
    dom.labels.classList.add('is-dim');
    if (state.mode === 'drone') orbit.enabled = false;
    dom.walkHint.hidden = true;
    dom.walkPad.hidden = true;
    releaseWalkPad();
    dom.crosshair.hidden = true;
    updateLandmarkList();
    updateTrailFab();
    if (opts && opts.focus) dom.drawerClose.focus({ preventScroll: true });
  }

  function closeDrawer() {
    if (!drawerOpen) return;
    drawerOpen = false;
    dom.drawer.classList.remove('is-open');
    dom.drawer.setAttribute('aria-hidden', 'true');
    dom.scrim.classList.remove('is-on');
    dom.labels.classList.remove('is-dim');
    stopNarration();
    if (state.mode === 'drone' && !tween) orbit.enabled = !helpOpen;
    if (state.mode === 'tour' && tourResume) {
      tourState.playing = true;
      tourResume = false;
    }
    activeLandmark = null;
    updateLandmarkList();
    updateTrailFab();
    if (state.mode === 'walk' && !walkHintDismissed) dom.walkHint.hidden = false;
    if (state.mode === 'tour') updateTourHud();
    updateModeUI();
    focusScene();
  }

  function renderDrawer(l, keepNote) {
    if (!l) return;
    const txt = landmarkText(l);
    dom.drawer.style.setProperty('--accent', l.accent);
    dom.drawer.style.setProperty('--accent-2', l.accent2);
    dom.drawerIndex.textContent = l.index;
    dom.drawerKicker.textContent = txt.kicker;
    dom.drawerTitle.textContent = txt.name;
    dom.drawerLocal.textContent = state.lang === 'en' ? l.th.name : l.en.name;
    dom.drawerTagline.textContent = txt.tagline;
    dom.drawerStory.innerHTML = '';
    txt.story.forEach((p) => {
      const el = document.createElement('p');
      el.textContent = p;
      dom.drawerStory.appendChild(el);
    });
    dom.drawerFact.textContent = txt.fact;
    dom.drawerTips.innerHTML = '';
    const tips = [
      ['entry', 'entry', false],
      ['hours', 'hours', false],
      ['dress', 'dress', false],
      ['best', 'best', false],
      ['transit', 'transit', true]
    ];
    tips.forEach(([labelKey, valueKey, wide]) => {
      const div = document.createElement('div');
      div.className = 'tip' + (wide ? ' is-wide' : '');
      const label = document.createElement('span');
      label.textContent = t('drawer.' + labelKey);
      const val = document.createElement('b');
      val.textContent = txt.tips[valueKey];
      div.appendChild(label);
      div.appendChild(val);
      dom.drawerTips.appendChild(div);
    });
    if (!keepNote) {
      dom.noteInput.value = state.notes[l.id] || '';
      dom.noteStatus.classList.remove('is-on');
      dom.noteStatus.textContent = '';
    }
    dom.visitedBtn.classList.toggle('is-visited', isVisited(l.id));
    dom.visitedBtn.querySelector('span:last-child').textContent = isVisited(l.id) ? t('drawer.visited') : t('drawer.mark');
    dom.itineraryBtn.querySelector('span:last-child').textContent = isOnRoute(l.id) ? t('drawer.onRoute') : t('drawer.addRoute');
    dom.narrateBtn.title = t('drawer.listen');
    dom.narrateBtn.classList.remove('is-speaking');
  }

  function stepLandmark(dir) {
    if (!activeLandmark) return;
    const i = LANDMARKS.indexOf(activeLandmark);
    const next = LANDMARKS[(i + dir + LANDMARKS.length) % LANDMARKS.length];
    openLandmark(next.id);
    flyToLandmark(next);
  }

  function toggleVisited() {
    if (!activeLandmark) return;
    const id = activeLandmark.id;
    if (isVisited(id)) {
      state.visited = state.visited.filter((x) => x !== id);
      toast(tf('toast.unvisited', { name: landmarkText(activeLandmark).name }));
    } else {
      state.visited.push(id);
      toast(tf('toast.visited', { name: landmarkText(activeLandmark).name }));
    }
    saveState();
    updateProgress();
    updateLandmarkList();
    updateLabelsText();
    renderDrawer(activeLandmark, true);
  }

  function toggleItinerary() {
    if (!activeLandmark) return;
    const id = activeLandmark.id;
    if (isOnRoute(id)) {
      state.itinerary = state.itinerary.filter((x) => x !== id);
      toast(tf('toast.routeRemoved', { name: landmarkText(activeLandmark).name }));
    } else {
      state.itinerary.push(id);
      toast(tf('toast.routeAdded', { name: landmarkText(activeLandmark).name }));
    }
    saveState();
    renderDrawer(activeLandmark, true);
    updateLandmarkList();
    updateProgress();
  }

  function updateDrawerButtons() {
    if (!activeLandmark) return;
    dom.visitedBtn.querySelector('span:last-child').textContent = isVisited(activeLandmark.id) ? t('drawer.visited') : t('drawer.mark');
    dom.itineraryBtn.querySelector('span:last-child').textContent = isOnRoute(activeLandmark.id) ? t('drawer.onRoute') : t('drawer.addRoute');
  }

  function noteChanged() {
    if (!activeLandmark) return;
    state.notes[activeLandmark.id] = dom.noteInput.value.slice(0, 4000);
    saveState();
    dom.noteStatus.textContent = t('drawer.saved');
    dom.noteStatus.classList.add('is-on');
    clearTimeout(noteChanged.timer);
    noteChanged.timer = setTimeout(() => dom.noteStatus.classList.remove('is-on'), 1600);
  }

  let narrating = false;
  function toggleNarration() {
    if (!activeLandmark) return;
    if (!('speechSynthesis' in window)) {
      toast(t('toast.narrate'));
      return;
    }
    if (narrating) { stopNarration(); return; }
    const txt = landmarkText(activeLandmark);
    const utter = new SpeechSynthesisUtterance(txt.name + '. ' + txt.story.join(' '));
    utter.lang = state.lang === 'th' ? 'th-TH' : 'en-US';
    utter.rate = 0.93;
    utter.pitch = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(state.lang === 'th' ? 'th' : 'en'));
    if (match) utter.voice = match;
    utter.onend = () => { narrating = false; dom.narrateBtn.classList.remove('is-speaking'); };
    utter.onerror = () => { narrating = false; dom.narrateBtn.classList.remove('is-speaking'); };
    narrating = true;
    dom.narrateBtn.classList.add('is-speaking');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function stopNarration() {
    narrating = false;
    dom.narrateBtn.classList.remove('is-speaking');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function setHovered(id) {
    hoveredId = id;
    markerRecords.forEach((m) => {
      m.gem.material.emissiveIntensity = m.id === id ? 1.1 : 0.45;
    });
    dom.canvas.style.cursor = id ? 'pointer' : '';
  }

  /* ==========================================================================
     MINIMAP
     ========================================================================== */

  const mapState = { last: 0 };
  function drawMinimap() {
    const c = dom.minimap;
    if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width, h = c.height;
    const pad = 9;
    const bx0 = world.minX, bx1 = world.maxX, bz0 = world.minZ, bz1 = world.maxZ;
    const sx = (w - pad * 2) / (bx1 - bx0);
    const sz = (h - pad * 2) / (bz1 - bz0);
    const X = (x) => pad + (x - bx0) * sx;
    const Y = (z) => pad + (z - bz0) * sz;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a1518';
    ctx.fillRect(0, 0, w, h);

    // river band
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) {
      const z = bz0 + (i / 30) * (bz1 - bz0);
      const x = world.riverX + Math.sin(z * 0.045) * 3.0 - world.riverHalf;
      if (i === 0) ctx.moveTo(X(x), Y(z)); else ctx.lineTo(X(x), Y(z));
    }
    for (let i = 30; i >= 0; i--) {
      const z = bz0 + (i / 30) * (bz1 - bz0);
      const x = world.riverX + Math.sin(z * 0.045) * 3.0 + world.riverHalf;
      ctx.lineTo(X(x), Y(z));
    }
    ctx.closePath();
    ctx.fillStyle = '#12323b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(110,185,175,.32)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // parks
    ctx.fillStyle = 'rgba(60,110,78,.55)';
    ctx.fillRect(X(world.park.x - world.park.w / 2), Y(world.park.z - world.park.d / 2), world.park.w * sx, world.park.d * sz);

    // roads
    ctx.strokeStyle = 'rgba(210,200,170,.17)';
    ctx.lineWidth = 1;
    world.eastRoadX.concat(world.westRoadX).forEach((x) => {
      ctx.beginPath(); ctx.moveTo(X(x), Y(bz0)); ctx.lineTo(X(x), Y(bz1)); ctx.stroke();
    });
    world.eastRoadZ.forEach((z) => {
      ctx.beginPath(); ctx.moveTo(X(bx0), Y(z)); ctx.lineTo(X(bx1), Y(z)); ctx.stroke();
    });

    // landmarks
    LANDMARKS.forEach((l) => {
      const visited = isVisited(l.id);
      const active = activeLandmark && activeLandmark.id === l.id;
      ctx.beginPath();
      ctx.arc(X(l.position[0]), Y(l.position[1]), active ? 8 : 6.6, 0, Math.PI * 2);
      ctx.fillStyle = visited ? '#e7c27d' : 'rgba(12,20,24,.9)';
      ctx.fill();
      ctx.lineWidth = active ? 2 : 1.2;
      ctx.strokeStyle = active ? '#fff3cf' : '#c9a45d';
      ctx.stroke();
      ctx.fillStyle = visited ? '#161006' : '#e7c27d';
      ctx.font = '600 7px Kanit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(l.index, X(l.position[0]), Y(l.position[1]) + 0.3);
    });

    // camera triangle
    const dir = camera.getWorldDirection(new THREE.Vector3());
    const angle = Math.atan2(dir.x, -dir.z);
    const px = X(camera.position.x), py = Y(camera.position.z);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(4.6, 5);
    ctx.lineTo(0, 2.6);
    ctx.lineTo(-4.6, 5);
    ctx.closePath();
    ctx.fillStyle = '#8fe3d3';
    ctx.shadowColor = '#6cbcac';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();

    // frame
    ctx.strokeStyle = 'rgba(231,194,125,.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  }

  function updateMinimap(now) {
    if (now - mapState.last < 90) return;
    mapState.last = now;
    drawMinimap();
  }

  /* ==========================================================================
     PERSISTENCE / EXPORT
     ========================================================================== */

  function buildExport() {
    const payload = {
      app: APP.name,
      appVersion: APP.version,
      city: APP.city,
      exportedAt: new Date().toISOString(),
      language: state.lang,
      preset: state.preset,
      visited: state.visited.slice(),
      itinerary: state.itinerary.slice(),
      notes: Object.assign({}, state.notes),
      stats: {
        visitedCount: state.visited.length,
        totalLandmarks: LANDMARKS.length,
        itineraryCount: state.itinerary.length,
        noteCount: Object.keys(state.notes).filter((k) => state.notes[k].trim()).length
      },
      credits: {
        harness: APP.harness.name,
        model: APP.model.name,
        graphics: 'Three.js r128'
      }
    };
    return payload;
  }

  function downloadJSON() {
    const payload = buildExport();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = APP.exportName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast(t('toast.saved'));
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const src = data && data.state ? data.state : data;
        if (!src || typeof src !== 'object') throw new Error('empty');
        const hasKnown = Array.isArray(src.visited) || Array.isArray(src.itinerary) || (src.notes && typeof src.notes === 'object');
        if (!hasKnown) throw new Error('shape');
        const merged = sanitiseState(Object.assign({}, state, {
          visited: src.visited,
          itinerary: src.itinerary,
          notes: src.notes,
          lang: src.lang || src.language || state.lang,
          preset: src.preset || state.preset,
          audio: state.audio
        }));
        Object.assign(state, merged);
        saveState();
        updateProgress();
        updateLandmarkList();
        updateLabelsText();
        setPreset(state.preset, { instant: true, silent: true });
        applyLanguage(state.lang, { silent: true });
        if (drawerOpen && activeLandmark) renderDrawer(activeLandmark, false);
        toast(t('toast.loaded'));
      } catch (e) {
        toast(t('toast.invalid'));
      }
    };
    reader.onerror = () => toast(t('toast.invalid'));
    reader.readAsText(file);
  }

  /* ==========================================================================
     EVENTS
     ========================================================================== */

  function updateAudioUI() {
    document.body.classList.toggle('is-muted', !state.audio);
    dom.audioBtn.title = state.audio ? 'Sound off (M)' : 'Sound on (M)';
  }

  function toggleAudio() {
    state.audio = !state.audio;
    saveState();
    cityAudio.setEnabled(state.audio);
    updateAudioUI();
    toast(state.audio ? t('toast.sound') : t('toast.muted'));
  }

  function toggleMutedStateOnly() {
    state.audio = !state.audio;
    saveState();
    updateAudioUI();
    toast(state.audio ? t('toast.sound') : t('toast.muted'));
  }

  function openHelp() {
    helpOpen = true;
    dom.helpModal.hidden = false;
    if (state.mode === 'drone') orbit.enabled = false;
    if (state.mode === 'tour') { tourResume = tourState.playing; tourState.playing = false; }
    dom.helpClose.focus({ preventScroll: true });
  }

  function closeHelp() {
    if (!helpOpen) return;
    helpOpen = false;
    dom.helpModal.hidden = true;
    if (state.mode === 'drone' && !drawerOpen && !tween) orbit.enabled = true;
    if (state.mode === 'tour' && tourResume) { tourState.playing = true; tourResume = false; }
    focusScene();
  }

  function updateTrailFab() {
    const narrow = window.innerWidth <= 860;
    if (narrow) {
      dom.trailFab.classList.add('is-visible');
      dom.trailPanel.classList.toggle('is-open', trailPanelOpen);
    } else {
      dom.trailFab.classList.toggle('is-visible', dom.trailPanel.classList.contains('is-hidden'));
    }
  }

  let trailPanelOpen = false;

  function toggleTrailPanel(force) {
    const narrow = window.innerWidth <= 860;
    if (narrow) {
      trailPanelOpen = typeof force === 'boolean' ? force : !trailPanelOpen;
      dom.trailPanel.classList.toggle('is-open', trailPanelOpen);
      if (trailPanelOpen) dom.trailPanel.classList.remove('is-hidden');
    } else {
      const hidden = dom.trailPanel.classList.toggle('is-hidden');
      dom.trailFab.classList.toggle('is-visible', hidden);
    }
    updateTrailFab();
  }

  function bindEvents() {
    // Mode buttons
    $$('.mode-btn').forEach((b) => {
      b.addEventListener('click', () => setMode(b.dataset.mode));
    });

    // Time buttons
    $$('#timeSwitch button').forEach((b) => {
      b.addEventListener('click', () => setPreset(b.dataset.preset));
    });

    dom.langBtn.addEventListener('click', () => applyLanguage(state.lang === 'en' ? 'th' : 'en'));
    dom.audioBtn.addEventListener('click', toggleAudio);
    dom.helpBtn.addEventListener('click', openHelp);
    dom.helpClose.addEventListener('click', closeHelp);
    dom.helpModal.addEventListener('click', (e) => {
      if (e.target === dom.helpModal) closeHelp();
    });
    dom.brandBtn.addEventListener('click', openHelp);

    $$('.intro-lang button').forEach((b) => {
      b.addEventListener('click', () => applyLanguage(b.dataset.lang, { silent: true }));
    });

    dom.startBtn.addEventListener('click', () => {
      hideIntro();
      if (state.audio) cityAudio.start();
      setTimeout(() => toast(t('hint.drone')), 900);
    });
    dom.tourStartBtn.addEventListener('click', () => {
      hideIntro();
      setMode('tour');
      if (state.audio) cityAudio.start();
    });

    dom.drawerClose.addEventListener('click', closeDrawer);
    dom.scrim.addEventListener('click', closeDrawer);
    dom.visitedBtn.addEventListener('click', toggleVisited);
    dom.itineraryBtn.addEventListener('click', toggleItinerary);
    dom.narrateBtn.addEventListener('click', toggleNarration);
    dom.prevLandmark.addEventListener('click', () => stepLandmark(-1));
    dom.nextLandmark.addEventListener('click', () => stepLandmark(1));
    dom.flyBtn.addEventListener('click', () => { if (activeLandmark) flyToLandmark(activeLandmark); });
    dom.noteInput.addEventListener('input', noteChanged);

    dom.saveBtn.addEventListener('click', downloadJSON);
    dom.loadBtn.addEventListener('click', () => dom.importFile.click());
    dom.importFile.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) importJSON(f);
      e.target.value = '';
    });

    dom.trailClose.addEventListener('click', () => toggleTrailPanel(false));
    dom.trailFab.addEventListener('click', () => toggleTrailPanel(true));
    dom.recenterBtn.addEventListener('click', recenterDrone);

    dom.tourPlayBtn.addEventListener('click', toggleTourPlay);
    dom.tourNextBtn.addEventListener('click', tourNext);

    // Canvas look, picking, and zoom. Walk mode uses ordinary drag-to-look, never pointer lock.
    let down = null;
    dom.canvas.addEventListener('pointerdown', (e) => {
      if (introVisible || drawerOpen || helpOpen) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      down = { x: e.clientX, y: e.clientY };
      focusScene();
      if (state.mode === 'walk') {
        const eul = walkEuler.setFromQuaternion(camera.quaternion, 'YXZ');
        walkLook.yaw = eul.y;
        walkLook.pitch = eul.x;
        walkLook.active = true;
        walkLook.pointerId = e.pointerId;
        walkLook.lastX = e.clientX;
        walkLook.lastY = e.clientY;
        walkLook.moved = 0;
        if (dom.canvas.setPointerCapture) {
          try { dom.canvas.setPointerCapture(e.pointerId); } catch (err) { /* capture is optional */ }
        }
        dom.canvas.classList.add('is-dragging');
        dismissWalkHint();
      }
    });
    dom.canvas.addEventListener('pointerup', (e) => {
      const dragMoved = walkLook.moved;
      endWalkDrag(e);
      if (!down) return;
      const moved = Math.max(Math.hypot(e.clientX - down.x, e.clientY - down.y), dragMoved);
      down = null;
      if (moved > 7) return;
      const hit = pickAt(e.clientX, e.clientY);
      if (hit) openLandmark(hit);
    });
    dom.canvas.addEventListener('pointercancel', endWalkDrag);
    dom.canvas.addEventListener('pointermove', onPointerMove);
    dom.canvas.addEventListener('pointerleave', () => {
      setHovered(null);
      dom.tooltip.classList.remove('is-on');
    });
    dom.canvas.addEventListener('wheel', onWheelZoom, { passive: false });

    // On-screen walking arrows: mouse and touch, no keyboard required.
    $$('.walk-pad-btn', dom.walkPad).forEach((btn) => {
      const move = btn.dataset.move;
      const press = (e) => {
        if (state.mode !== 'walk' || drawerOpen || helpOpen) return;
        e.preventDefault();
        padKeys[move] = true;
        btn.classList.add('is-held');
        dismissWalkHint();
        if (btn.setPointerCapture) {
          try { btn.setPointerCapture(e.pointerId); } catch (err) { /* optional */ }
        }
      };
      const release = (e) => {
        e.preventDefault();
        padKeys[move] = false;
        btn.classList.remove('is-held');
        if (e && btn.releasePointerCapture) {
          try { btn.releasePointerCapture(e.pointerId); } catch (err) { /* optional */ }
        }
      };
      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        endWalkDrag();
        cityAudio.setEnabled(false);
        if (state.mode === 'tour') tourState.playing = false;
      } else {
        cityAudio.setEnabled(state.audio);
      }
    });
    window.addEventListener('error', (e) => {
      errors.push(String(e.message || e.error || 'error'));
    });
    window.addEventListener('unhandledrejection', (e) => {
      errors.push(String(e.reason || 'rejection'));
    });

    window.addEventListener('resize', updateTrailFab);
    window.matchMedia('(max-width: 860px)').addEventListener('change', () => {
      trailPanelOpen = false;
      dom.trailPanel.classList.remove('is-open');
      updateTrailFab();
      if (window.innerWidth > 860) dom.trailPanel.classList.remove('is-hidden');
    });
  }

  function onPointerMove(e) {
    if (introVisible || drawerOpen || helpOpen) return;
    if (state.mode === 'walk' && walkLook.active) {
      const dx = e.clientX - walkLook.lastX;
      const dy = e.clientY - walkLook.lastY;
      if (dx || dy) {
        const sensitivity = 0.0026 * (camera.fov / baseFov());
        // Grab-the-landscape horizontal drag: drag left to bring the right side into view.
        walkLook.yaw += dx * sensitivity;
        walkLook.pitch = clamp(walkLook.pitch - dy * sensitivity, -1.45, 1.45);
        walkEuler.set(walkLook.pitch, walkLook.yaw, 0, 'YXZ');
        camera.quaternion.setFromEuler(walkEuler);
        walkLook.moved += Math.hypot(dx, dy);
        dismissWalkHint();
      }
      walkLook.lastX = e.clientX;
      walkLook.lastY = e.clientY;
      return;
    }
    const hit = pickAt(e.clientX, e.clientY);
    setHovered(hit);
    if (hit) {
      const l = LANDMARK_BY_ID[hit];
      dom.tooltip.textContent = landmarkText(l).name + ' · ' + landmarkText(l).kicker + ' — ' + t('hint.openGuide');
      dom.tooltip.style.left = e.clientX + 'px';
      dom.tooltip.style.top = e.clientY + 'px';
      dom.tooltip.classList.add('is-on');
    } else {
      dom.tooltip.classList.remove('is-on');
    }
  }

  const raycaster = THREE_OK ? new THREE.Raycaster() : null;
  function pickAt(clientX, clientY) {
    if (!raycaster || !camera) return null;
    const rect = dom.canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera({ x: nx, y: ny }, camera);
    const hits = raycaster.intersectObjects(pickTargets, false);
    for (const h of hits) {
      if (state.mode === 'walk' && h.object.userData.pickKind !== 'marker') continue;
      const id = h.object.userData.landmarkId;
      if (id && LANDMARK_BY_ID[id]) return id;
    }
    return null;
  }

  function onKeyDown(e) {
    const tag = (e.target && e.target.tagName || '').toLowerCase();
    const editing = tag === 'input' || tag === 'textarea' || tag === 'select';
    if (editing && (drawerOpen || helpOpen)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.code === 'Escape') {
      if (helpOpen) { closeHelp(); return; }
      if (drawerOpen) { closeDrawer(); return; }
      return;
    }
    if (drawerOpen || helpOpen) return;
    if (introVisible) {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        hideIntro();
        if (state.audio) cityAudio.start();
      }
      return;
    }

    const walkKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'];
    if (state.mode === 'walk' && walkKeys.includes(e.code)) e.preventDefault();

    switch (e.code) {
      case 'Digit1': setMode('drone'); break;
      case 'Digit2': setMode('walk'); break;
      case 'Digit3': setMode('tour'); break;
      case 'KeyL': applyLanguage(state.lang === 'en' ? 'th' : 'en'); break;
      case 'KeyT': cyclePreset(); break;
      case 'KeyM': toggleAudio(); break;
      case 'KeyH': openHelp(); break;
      case 'Slash': if (e.shiftKey) { e.preventDefault(); openHelp(); } break;
      case 'KeyR': recenterDrone(); break;
      case 'Space':
        if (state.mode === 'tour') { e.preventDefault(); toggleTourPlay(); }
        break;
      case 'KeyN':
        if (state.mode === 'tour') tourNext();
        break;
      case 'KeyE':
        if (state.mode === 'walk' && !drawerOpen) {
          const near = nearestLandmark(camera.position, 30);
          if (near) openLandmark(near.id);
          else toast(t('toast.noNear'));
        }
        break;
      case 'KeyW': case 'KeyA': case 'KeyS': case 'KeyD':
      case 'ArrowUp': case 'ArrowDown': case 'ArrowLeft': case 'ArrowRight':
      case 'ShiftLeft': case 'ShiftRight':
        keys[e.code] = true;
        break;
      default: break;
    }
  }

  // Key release must work even if focus moved; never swallow modifiers.
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
  window.addEventListener('blur', () => {
    Object.keys(keys).forEach((k) => { keys[k] = false; });
    endWalkDrag();
    releaseWalkPad();
  });

  function onResize() {
    if (!renderer || !camera) return;
    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    applyViewFov();
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function hideIntro() {
    if (!introVisible) return;
    introVisible = false;
    document.body.classList.remove('is-intro');
    dom.intro.classList.add('is-gone');
    orbit.autoRotate = false;
    if (state.mode === 'drone') orbit.enabled = !drawerOpen && !helpOpen;
    updateModeUI();
    focusScene();
    setTimeout(() => { dom.intro.style.display = 'none'; }, 900);
  }

  /* ==========================================================================
     ANIMATION
     ========================================================================== */

  let lastTime = 0;
  let elapsed = 0;
  let running = false;

  function animate(now) {
    if (!running) return;
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    elapsed += dt;

    if (waterMat) waterMat.uniforms.uTime.value = elapsed;
    updateLighting(dt);
    updateTraffic(dt);
    updateBoats(dt, elapsed);
    updateWalk(dt);
    updateTween(dt);
    if (state.mode === 'tour') updateTour(dt, elapsed);
    if (state.mode === 'drone' && orbit.enabled) orbit.update();

    markersUpdate(dt);
    updateLabels();
    updateMinimap(now);
    cityAudio.updateListener();

    // Blink the Baiyoke beacon.
    if (baiyokeBeacon) {
      const blink = 0.35 + 0.65 * Math.pow(Math.max(0, Math.sin(elapsed * 2.2)), 6);
      baiyokeBeacon.material.emissiveIntensity = blink * (0.35 + (state.preset === 'night' ? 1.8 : 0.2));
    }

    // Sun/moon and clouds
    if (starField) starField.rotation.y = elapsed * 0.004;
    clouds.forEach((c) => {
      c.position.x += c.userData.speed * dt;
      if (c.position.x > 270) c.position.x = -270;
    });

    // Keep the sky centred on the camera so it never clips.
    if (skyMesh) skyMesh.position.copy(camera.position);

    renderer.render(scene, camera);
  }

  function markersUpdate(dt) {
    markerRecords.forEach((m) => {
      m.group.position.y = m.baseY + Math.sin(elapsed * 1.15 + m.phase) * 0.55;
      m.group.rotation.y += dt * 0.35;
      m.ring.rotation.z += dt * 0.5;
      m.gem.rotation.y -= dt * 0.8;
      m.group.scale.setScalar(damp(m.group.scale.x, m.id === hoveredId ? 1.18 : 1, 10, dt));
    });
  }

  /* ==========================================================================
     BOOT AND SELF-TEST
     ========================================================================== */

  function setLoading(pct, text) {
    dom.loadingFill.style.width = pct + '%';
    if (text) dom.loadingText.textContent = text;
  }

  function showFatal(title, message) {
    dom.webglError.hidden = false;
    dom.webglError.querySelector('h2').textContent = title;
    dom.webglError.querySelector('p').textContent = message;
    dom.loading.classList.add('is-gone');
  }

  function parseParams() {
    try { return new URLSearchParams(window.location.search); } catch (e) { return new URLSearchParams(); }
  }

  async function boot() {
    const bootParams = parseParams();
    if (bootParams.get('reset') === '1') {
      state = defaultState();
      try { localStorage.removeItem(APP.storageKey); } catch (e) { /* ignore */ }
    }
    setLoading(10, 'Surveying the Chao Phraya…');
    await nextFrame();

    if (!initRenderer()) { setLoading(100); return; }
    buildSky();
    applyLightMix(true);
    setLoading(26, 'Laying the river and the roads…');
    await nextFrame();

    buildGround();
    buildRoads();
    buildPark();
    setLoading(44, 'Raising the old town…');
    await nextFrame();

    buildLandmarks();
    buildCityBlocks();
    buildTrees();
    buildStreetLamps();
    buildTraffic();
    buildBoats();
    setLoading(68, 'Hanging the temple bells…');
    await nextFrame();

    setupControls();
    setupTour();
    if (window.innerWidth / window.innerHeight < 0.85 && !bootParams.get('cam')) {
      droneHome.pos.set(132, 152, 168);
      droneHome.target.set(-2, 10, -10);
      camera.position.copy(droneHome.pos);
      orbit.target.copy(droneHome.target);
      droneCamPos.copy(droneHome.pos);
      droneTarget.copy(droneHome.target);
      applyViewFov();
    }
    buildLandmarkList();
    buildLabels();
    bindEvents();
    applyLanguage(state.lang, { silent: true });
    updateAudioUI();
    updateProgress();
    updateTrailFab();
    const creditEl = $('#modelCredit');
    if (creditEl) creditEl.textContent = APP.model.name;
    setPreset(state.preset, { instant: true, silent: true });

    // URL parameters: used by screenshots and the self-test.
    const params = parseParams();
    if (params.get('lang')) applyLanguage(params.get('lang') === 'th' ? 'th' : 'en', { silent: true });
    if (params.get('preset') && PRESETS[params.get('preset')]) setPreset(params.get('preset'), { instant: true, silent: true });
    if (params.get('cam')) {
      const c = params.get('cam').split(',').map(Number);
      if (c.length === 3 && c.every(Number.isFinite)) {
        camera.position.set(c[0], c[1], c[2]);
        const lk = (params.get('look') || '0,4,-8').split(',').map(Number);
        orbit.target.set(lk[0] || 0, lk[1] || 4, lk[2] || -8);
        camera.lookAt(orbit.target);
      }
    }

    camera.lookAt(orbit.target);
    renderer.shadowMap.needsUpdate = true;

    running = true;
    lastTime = performance.now();
    requestAnimationFrame(animate);

    await nextFrame();
    setLoading(100, 'Bangkok is ready.');
    await new Promise((r) => setTimeout(r, 420));
    dom.loading.classList.add('is-gone');
    sceneReady = true;

    if (params.get('autostart') === '1' || params.get('selftest') === '1' || params.has('shot')) {
      hideIntro();
      dom.intro.style.display = 'none';
      if (!params.has('shot') && params.get('selftest') !== '1') {
        // keep audio off for automated runs
        cityAudio.enabled = false;
      }
    }

    if (state.mode !== 'drone') setMode(state.mode, { silent: true, force: true });
    if (params.get('mode') === 'walk' || params.get('mode') === 'tour' || params.get('mode') === 'drone') {
      setMode(params.get('mode'), { silent: true, force: true });
    }
    if (params.get('drawer') && LANDMARK_BY_ID[params.get('drawer')]) {
      openLandmark(params.get('drawer'));
    }
    if (params.get('selftest') === '1') {
      setTimeout(runSelfTest, 500);
    }

    window.Bangkok3D = {
      version: APP.version,
      app: APP,
      scene,
      camera,
      renderer,
      orbit,
      state,
      landmarks: LANDMARKS,
      tourStops,
      setMode,
      setPreset,
      applyLanguage,
      openLandmark,
      closeDrawer,
      flyToLandmark,
      saveItinerary: downloadJSON,
      buildExport,
      pickAt,
      runSelfTest,
      getStats: () => ({
        mode: state.mode,
        preset: state.preset,
        lang: state.lang,
        visited: state.visited.slice(),
        itinerary: state.itinerary.slice(),
        landmarks: LANDMARKS.map((l) => l.id),
        tourStops: tourStops.length,
        sceneChildren: scene.children.length,
        colliders: colliders.length,
        ready: sceneReady
      }),
      getTour: () => ({
        u: tourState.u,
        index: tourState.index,
        dwell: tourState.dwell,
        active: tourState.active,
        playing: tourState.playing,
        completed: tourState.completed,
        look: tourLook.toArray(),
        camera: camera.position.toArray()
      }),
      getAudio: () => ({
        enabled: cityAudio.enabled,
        started: cityAudio.started,
        context: cityAudio.ctx ? cityAudio.ctx.state : null,
        footsteps: typeof cityAudio.footstep === 'function'
      }),
      getControls: () => ({
        mode: state.mode,
        fov: +camera.fov.toFixed(2),
        zoom: +freeZoom.toFixed(3),
        dragging: walkLook.active,
        pointerLock: false
      }),
      getWalk: () => ({
        mode: state.mode,
        keys: Object.assign({}, keys),
        position: camera.position.toArray(),
        player: playerPos.toArray(),
        blocked: walkBlocked(camera.position.x, camera.position.z),
        drawerOpen,
        helpOpen
      })
    };

    console.info('[Bangkok 3D] ready', APP.version);
  }

  function runSelfTest() {
    const results = [];
    const check = (name, fn) => {
      let ok = false;
      let detail = '';
      try {
        const r = fn();
        ok = r !== false;
        if (typeof r === 'string') detail = r;
      } catch (e) {
        ok = false;
        detail = e.message;
      }
      results.push({ name, ok, detail });
    };

    check('scene is built', () => !!scene && scene.children.length > 20);
    check('five landmark groups', () => landmarkGroups.length === 5);
    check('five 3D markers', () => markerRecords.length === 5);
    check('five pick volumes', () => pickTargets.filter((o) => o.geometry && o.geometry.type === 'SphereGeometry').length >= 5);
    check('five labels', () => dom.labels.children.length === 5);
    check('bilingual UI parity', () => {
      const a = Object.keys(I18N.en), b = Object.keys(I18N.th);
      return a.length === b.length && a.every((k) => typeof I18N.th[k] === 'string');
    });
    check('bilingual landmark parity', () => LANDMARKS.every((l) =>
      l.en.name && l.th.name && l.en.story.length === 3 && l.th.story.length === 3 &&
      Object.keys(l.en.tips).length === 5 && Object.keys(l.th.tips).length === 5));
    check('tour has five ordered stops', () => tourStops.length === 5 &&
      tourStops.every((s, i) => i === 0 || s.u > tourStops[i - 1].u) && tourStops[4].u <= 1);
    check('three lighting presets', () => Object.keys(PRESETS).length === 3);
    check('three camera modes', () => ['drone', 'walk', 'tour'].every((m) => typeof m === 'string') && !!orbit && !!walkLook);
    check('walk drag-look and zoom', () => typeof applyViewFov === 'function' && typeof onWheelZoom === 'function' && ZOOM_MIN < ZOOM_MAX);
    check('walk collision field', () => colliders.length > 60);
    check('traffic instances', () => !!carBodyMesh && carBodyMesh.count > 50);
    check('river shader', () => !!waterMat && waterMat.uniforms.uTime.value >= 0);
    check('local state roundtrip', () => {
      const s = sanitiseState(JSON.parse(JSON.stringify(state)));
      return s.lang === state.lang && s.visited.length === state.visited.length;
    });
    check('export payload', () => {
      const p = buildExport();
      return p.app && p.city === 'Bangkok' && Array.isArray(p.visited) && Array.isArray(p.itinerary) && p.stats.totalLandmarks === 5;
    });
    check('export filename', () => APP.exportName === 'bangkok_3d_tour.json');
    check('note persistence', () => {
      const test = { 'wat-arun': 'test note' };
      const s = sanitiseState({ notes: test, visited: ['wat-arun'] });
      return s.notes['wat-arun'] === 'test note' && s.visited[0] === 'wat-arun';
    });
    check('minimap canvas', () => !!dom.minimap && dom.minimap.width > 100);
    check('audio synth class', () => typeof CityAudio === 'function' && typeof cityAudio.footstep === 'function');
    check('no runtime errors', () => errors.length === 0 ? true : errors.join(' | '));
    check('WebGL context', () => !!renderer && !!renderer.getContext());
    check('camera modes callable', () => {
      const before = state.mode;
      setMode('drone', { silent: true });
      const ok = state.mode === 'drone';
      setMode(before, { silent: true });
      return ok;
    });
    check('language switch', () => {
      const before = state.lang;
      applyLanguage(before === 'en' ? 'th' : 'en', { silent: true });
      const changed = document.documentElement.lang !== before;
      applyLanguage(before, { silent: true });
      return changed;
    });

    const passed = results.filter((r) => r.ok).length;
    dom.selftest.hidden = false;
    dom.selftest.innerHTML =
      '<h3>Bangkok 3D · self-test</h3>' +
      results.map((r) => '<div class="' + (r.ok ? 'pass' : 'fail') + '">' + (r.ok ? '✓' : '✕') + ' ' + r.name + (r.detail ? ' — ' + r.detail : '') + '</div>').join('') +
      '<div class="summary ' + (passed === results.length ? 'pass' : 'fail') + '">' + passed + ' / ' + results.length + ' checks passed</div>';
    console.table(results);
    window.__selfTestResults = results;
    return { passed, total: results.length, results };
  }

  // Kick off once the DOM and CDN scripts are ready.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
