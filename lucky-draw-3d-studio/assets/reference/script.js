/* ==========================================================================
   Full 3D Lucky Draw & Prize Wheel Studio
   Vanilla ES modules + Three.js. Sections:
     1. Draw engine (pure, marker-delimited for the tests)
     2. Bilingual copy
     3. Platform: storage, audio, confetti, formatting
     4. Three.js studio: wheel, stand, pointer, lights, spin
     5. Controller: roster, settings, draw, history, export
     6. Self-test and boot
   ========================================================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ENGINE:START */
const createDrawEngine = () => {
  'use strict';

  const TAU = Math.PI * 2;
  // The pointer hangs at the top of the wheel (world +Y).
  const POINTER_ANGLE = Math.PI / 2;
  const MIN_ENTRIES = 2;
  const MAX_ENTRIES = 32;
  const VERSION = '1.0.0';

  const mod = (value, modulus) => ((value % modulus) + modulus) % modulus;

  const cleanName = (value) =>
    String(value ?? '')
      .replace(/[\u0000-\u001f\u007f]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 28);

  const normalizeRoster = (input) => {
    const source = Array.isArray(input) ? input : String(input ?? '').split(/\r?\n/);
    const seen = new Set();
    const entries = [];
    const duplicates = [];
    const overflow = [];

    for (const raw of source) {
      const name = cleanName(raw);
      if (!name) continue;
      const key = name.toLocaleLowerCase();
      if (seen.has(key)) {
        duplicates.push(name);
        continue;
      }
      if (entries.length >= MAX_ENTRIES) {
        overflow.push(name);
        continue;
      }
      seen.add(key);
      entries.push(name);
    }

    return { entries, duplicates, overflow, truncated: overflow.length > 0 };
  };

  // Canvas angles: 0 is +X and grows clockwise on screen. Each slice owns
  // [start, end); the centre is the fair landing target.
  const sliceLayout = (count) => {
    const total = Math.max(1, Math.floor(count));
    const step = TAU / total;
    const slices = [];
    for (let i = 0; i < total; i += 1) {
      slices.push(
        Object.freeze({
          index: i,
          start: i * step,
          end: (i + 1) * step,
          mid: (i + 0.5) * step,
          step,
        })
      );
    }
    return slices;
  };

  // A wheel rotation that puts `index` under the top pointer.
  const rotationForIndex = (index, count) => {
    const layout = sliceLayout(count);
    const safe = mod(Math.floor(index), layout.length);
    return mod(POINTER_ANGLE + layout[safe].mid, TAU);
  };

  // The landing rotation is computed before the animation starts. `delta`
  // is always positive so the wheel only ever spins forward.
  const targetRotation = (index, count, turns = 6, fromAngle = 0) => {
    const layout = sliceLayout(count);
    const safe = mod(Math.floor(index), layout.length);
    const target = mod(POINTER_ANGLE + layout[safe].mid, TAU);
    const current = mod(fromAngle, TAU);
    let delta = target - current;
    if (delta < 0) delta += TAU;
    const fullTurns = Math.max(0, Math.floor(turns));
    const spin = delta + fullTurns * TAU;
    return {
      index: safe,
      rotation: fromAngle + spin,
      delta: spin,
      targetAngle: target,
    };
  };

  const resolveIndex = (rotation, count) => {
    const layout = sliceLayout(count);
    const theta = mod(rotation - POINTER_ANGLE, TAU);
    const index = Math.floor(theta / layout[0].step);
    return Math.min(layout.length - 1, index);
  };

  // Uniform, unbiased pick. Web Crypto is rejection-sampled so no modulo
  // bias can favour early entries. A seeded function can be injected for
  // tests and for reproducible stage demos.
  const pickIndex = (count, randomInt) => {
    const total = Math.floor(count);
    if (total < 1) return -1;
    if (typeof randomInt === 'function') {
      const value = Math.floor(Number(randomInt(total)));
      if (!Number.isFinite(value)) return 0;
      return mod(value, total);
    }
    const cryptoApi = globalThis.crypto;
    if (!cryptoApi || typeof cryptoApi.getRandomValues !== 'function') {
      return Math.floor(Math.random() * total);
    }
    const buffer = new Uint32Array(1);
    const ceiling = Math.floor(0x100000000 / total) * total;
    let value = 0;
    do {
      cryptoApi.getRandomValues(buffer);
      value = buffer[0];
    } while (value >= ceiling);
    return value % total;
  };

  // Cubic Hermite easing: zero velocity at both ends, so the wheel winds up
  // smoothly and friction brings it to rest at exactly the target angle.
  const smoothstep = (value) => {
    const t = Math.min(1, Math.max(0, Number(value) || 0));
    return t * t * (3 - 2 * t);
  };

  const csvCell = (value) => {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const toCSV = (records) => {
    const rows = [['draw', 'timestamp', 'winner', 'entries', 'removed', 'spin_ms']];
    records.forEach((record, index) => {
      rows.push([
        index + 1,
        new Date(record.at).toISOString(),
        record.winner,
        record.rosterSize,
        record.removed ? 'yes' : 'no',
        Math.round(record.durationMs || 0),
      ]);
    });
    return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
  };

  const toJSON = (records, meta = {}) =>
    JSON.stringify(
      {
        schema: 'lucky-draw.export.v1',
        exportedAt: new Date().toISOString(),
        ...meta,
        draws: records.map((record) => ({
          draw: record.draw,
          at: record.at,
          winner: record.winner,
          rosterSize: record.rosterSize,
          durationMs: Math.round(record.durationMs || 0),
          removed: Boolean(record.removed),
        })),
      },
      null,
      2
    );

  return {
    TAU,
    POINTER_ANGLE,
    MIN_ENTRIES,
    MAX_ENTRIES,
    VERSION,
    mod,
    cleanName,
    normalizeRoster,
    sliceLayout,
    rotationForIndex,
    targetRotation,
    resolveIndex,
    pickIndex,
    smoothstep,
    csvCell,
    toCSV,
    toJSON,
  };
};
/* ENGINE:END */

/* I18N:START */
const I18N = {
  en: {
    'app.title': 'Lucky Draw Studio',
    'app.subtitle': 'Full 3D prize wheel',
    'stage.fair': 'Fair pick',
    'stage.live': 'Live draw',
    'stage.players': 'players',
    'stage.draws': 'Draws',
    'stage.hint': 'Drag to orbit · Scroll to zoom · Space to spin',
    'stage.foot': 'Every entry has an equal chance. The stop is chosen before the wheel moves.',
    'stage.spin': 'Spin the wheel',
    'stage.spinSub': 'Cryptographic pick',
    'stage.spinning': 'Spinning…',
    'stage.spinSubBusy': 'Choosing a winner',
    'stage.controls': 'Roster',
    'stage.addNames': 'Add 2+ names',
    'roster.title': 'Roster',
    'roster.quick': 'Quick entry',
    'roster.quickHint': 'Type three or four names and the wheel rebuilds instantly.',
    'roster.slot1': 'Player one',
    'roster.slot2': 'Player two',
    'roster.slot3': 'Player three',
    'roster.slot4': 'Player four',
    'roster.bulk': 'Bulk roster',
    'roster.bulkHint': 'One name per line',
    'roster.bulkPlaceholder': 'Ada Lovelace\nGrace Hopper\nAlan Turing',
    'roster.entries': 'entries',
    'roster.clear': 'Clear roster',
    'roster.note': 'A draw needs at least 2 entries. Duplicates are merged. Up to 32.',
    'preset.quick3': '3 players',
    'preset.quick4': '4 players',
    'preset.team': 'Team Alpha',
    'preset.party': 'Party 12',
    'history.title': 'History',
    'history.heading': 'Draw history',
    'history.sub': 'Newest first. Stored only in this browser.',
    'history.clear': 'Clear log',
    'history.clearArmed': 'Click again',
    'history.exportJson': 'Export JSON',
    'history.exportCsv': 'Export CSV',
    'history.empty': 'No draws yet. Spin the wheel to start the record.',
    'history.tagKept': 'Kept',
    'history.tagRemoved': 'Removed',
    'sidebar.local': 'Saved locally',
    'sidebar.help': 'How it works',
    'settings.title': 'Studio settings',
    'settings.sub': 'Tune the spin, sound and draw behaviour.',
    'settings.duration': 'Spin duration',
    'settings.durationHint': 'Longer spins build more suspense. The result never changes.',
    'settings.turns': 'Full turns',
    'settings.autoRemove': 'Remove winners automatically',
    'settings.autoRemoveHint': 'Each name can win once. Rebuilds the wheel after every draw.',
    'settings.sound': 'Sound effects',
    'settings.soundHint': 'Peg ticks and the winner fanfare are synthesized in the browser.',
    'settings.reset': 'Reset settings',
    'about.title': 'How the draw works',
    'about.body': 'The winning slice is chosen uniformly at random with the Web Crypto API before the wheel starts. The animation only travels to that slice, so the visual drama cannot influence the result.',
    'about.credits': 'Credits',
    'about.builtWith': 'Built with',
    'about.license': 'MIT licensed. No accounts, no tracking, no backend.',
    'about.shortcuts': 'Keyboard',
    'key.spin': 'Spin / draw again',
    'key.lang': 'Switch language',
    'key.sound': 'Toggle sound',
    'key.escape': 'Close dialog or drawer',
    'winner.kicker': 'And the winner is',
    'winner.remove': 'Remove & keep spinning',
    'winner.keep': 'Keep in roster',
    'winner.continue': 'Continue',
    'winner.foot': 'Every entry had the same chance.',
    'winner.meta': 'Draw #{n} · {time} · {size} entries',
    'loading.text': 'Preparing the studio',
    'loading.sub': 'Building the wheel and its textures',
    'selftest.title': 'Built-in self-test',
    'selftest.running': 'Running checks…',
    'selftest.pass': 'All {passed}/{total} checks passed',
    'selftest.fail': '{failed} of {total} checks failed',
    'selftest.foot': 'This page tests its own engine, textures, translations and storage. Add ?selftest to any URL to open it.',
    'toast.needTwo': 'Add at least two names before spinning.',
    'toast.dupes': 'Merged duplicate names: {names}',
    'toast.limit': 'Roster capped at {max} entries.',
    'toast.rosterCleared': 'Roster cleared.',
    'toast.removed': '{name} removed from the roster.',
    'toast.exported': '{what} export downloaded.',
    'toast.noHistory': 'There is nothing to export yet.',
    'toast.cleared': 'Draw history cleared.',
    'toast.reset': 'Settings restored to defaults.',
    'toast.soundOn': 'Sound on.',
    'toast.soundOff': 'Sound muted.',
    'webgl.error': 'WebGL is unavailable, so the 3D wheel cannot be drawn. Try a current browser with hardware acceleration enabled.',
  },
  th: {
    'app.title': 'สตูดิโอจับรางวัล',
    'app.subtitle': 'วงล้อรางวัล 3 มิติ',
    'stage.fair': 'สุ่มยุติธรรม',
    'stage.live': 'การจับรางวัล',
    'stage.players': 'รายชื่อ',
    'stage.draws': 'จำนวนครั้ง',
    'stage.hint': 'ลากเพื่อหมุนมุมมอง · สกรอลล์เพื่อซูม · กด Space เพื่อหมุน',
    'stage.foot': 'ทุกรายชื่อมีโอกาสเท่ากัน ผลลัพธ์ถูกเลือกก่อนวงล้อเริ่มหมุน',
    'stage.spin': 'หมุนวงล้อ',
    'stage.spinSub': 'สุ่มด้วยระบบเข้ารหัส',
    'stage.spinning': 'กำลังหมุน…',
    'stage.spinSubBusy': 'กำลังเลือกผู้ชนะ',
    'stage.controls': 'รายชื่อ',
    'stage.addNames': 'เพิ่มอย่างน้อย 2 ชื่อ',
    'roster.title': 'รายชื่อ',
    'roster.quick': 'กรอกด่วน',
    'roster.quickHint': 'พิมพ์ 3–4 ชื่อ แล้ววงล้อจะอัปเดตทันที',
    'roster.slot1': 'ผู้เล่นคนที่ 1',
    'roster.slot2': 'ผู้เล่นคนที่ 2',
    'roster.slot3': 'ผู้เล่นคนที่ 3',
    'roster.slot4': 'ผู้เล่นคนที่ 4',
    'roster.bulk': 'รายชื่อจำนวนมาก',
    'roster.bulkHint': 'หนึ่งชื่อต่อบรรทัด',
    'roster.bulkPlaceholder': 'สมชาย ใจดี\nสมหญิง รักเรียน\nกิตติ พร้อมเพรียง',
    'roster.entries': 'รายชื่อ',
    'roster.clear': 'ล้างรายชื่อ',
    'roster.note': 'ต้องมีอย่างน้อย 2 รายชื่อ ชื่อซ้ำจะถูกรวมกัน สูงสุด 32 รายชื่อ',
    'preset.quick3': '3 ผู้เล่น',
    'preset.quick4': '4 ผู้เล่น',
    'preset.team': 'ทีมอัลฟา',
    'preset.party': 'ปาร์ตี้ 12',
    'history.title': 'ประวัติ',
    'history.heading': 'ประวัติการจับรางวัล',
    'history.sub': 'ใหม่สุดก่อน เก็บไว้ในเบราว์เซอร์นี้เท่านั้น',
    'history.clear': 'ล้างประวัติ',
    'history.clearArmed': 'กดอีกครั้ง',
    'history.exportJson': 'ส่งออก JSON',
    'history.exportCsv': 'ส่งออก CSV',
    'history.empty': 'ยังไม่มีการจับรางวัล หมุนวงล้อเพื่อเริ่มบันทึก',
    'history.tagKept': 'คงไว้',
    'history.tagRemoved': 'นำออก',
    'sidebar.local': 'บันทึกในเครื่อง',
    'sidebar.help': 'วิธีใช้งาน',
    'settings.title': 'ตั้งค่าสตูดิโอ',
    'settings.sub': 'ปรับการหมุน เสียง และพฤติกรรมการจับรางวัล',
    'settings.duration': 'ระยะเวลาหมุน',
    'settings.durationHint': 'หมุนนานขึ้นเพิ่มความลุ้น ผลลัพธ์ไม่เปลี่ยน',
    'settings.turns': 'จำนวนรอบ',
    'settings.autoRemove': 'นำผู้ชนะออกอัตโนมัติ',
    'settings.autoRemoveHint': 'แต่ละชื่อชนะได้ครั้งเดียว วงล้อจะสร้างใหม่หลังจับรางวัล',
    'settings.sound': 'เอฟเฟกต์เสียง',
    'settings.soundHint': 'เสียงติ๊กและแฟนแฟร์สร้างจากเบราว์เซอร์',
    'settings.reset': 'คืนค่าตั้งต้น',
    'about.title': 'การจับรางวัลทำงานอย่างไร',
    'about.body': 'ผู้ชนะถูกเลือกแบบสุ่มเท่ากันด้วย Web Crypto API ก่อนวงล้อเริ่มหมุน แอนิเมชันเพียงหมุนไปยังช่องนั้น ผลลัพธ์จึงไม่ขึ้นกับการแสดงผล',
    'about.credits': 'เครดิต',
    'about.builtWith': 'สร้างด้วย',
    'about.license': 'สัญญาอนุญาต MIT ไม่มีบัญชี ไม่มีการติดตาม ไม่มีเซิร์ฟเวอร์',
    'about.shortcuts': 'แป้นพิมพ์',
    'key.spin': 'หมุน / จับใหม่',
    'key.lang': 'สลับภาษา',
    'key.sound': 'เปิด/ปิดเสียง',
    'key.escape': 'ปิดหน้าต่างหรือแผง',
    'winner.kicker': 'และผู้ชนะคือ',
    'winner.remove': 'นำออกและหมุนต่อ',
    'winner.keep': 'เก็บไว้ในรายชื่อ',
    'winner.continue': 'ดำเนินการต่อ',
    'winner.foot': 'ทุกรายชื่อมีโอกาสเท่ากัน',
    'winner.meta': 'ครั้งที่ {n} · {time} · {size} รายชื่อ',
    'loading.text': 'กำลังเตรียมสตูดิโอ',
    'loading.sub': 'กำลังสร้างวงล้อและพื้นผิว',
    'selftest.title': 'การทดสอบในตัว',
    'selftest.running': 'กำลังทดสอบ…',
    'selftest.pass': 'ผ่านทั้งหมด {passed}/{total} รายการ',
    'selftest.fail': 'ไม่ผ่าน {failed} จาก {total} รายการ',
    'selftest.foot': 'หน้านี้ทดสอบเอนจิน พื้นผิว คำแปล และที่เก็บข้อมูลของตัวเอง ใส่ ?selftest ใน URL เพื่อเปิด',
    'toast.needTwo': 'เพิ่มอย่างน้อย 2 ชื่อก่อนหมุน',
    'toast.dupes': 'รวมชื่อซ้ำ: {names}',
    'toast.limit': 'จำกัดรายชื่อที่ {max} รายชื่อ',
    'toast.rosterCleared': 'ล้างรายชื่อแล้ว',
    'toast.removed': 'นำ {name} ออกจากรายชื่อแล้ว',
    'toast.exported': 'ดาวน์โหลดไฟล์ {what} แล้ว',
    'toast.noHistory': 'ยังไม่มีข้อมูลให้ส่งออก',
    'toast.cleared': 'ล้างประวัติแล้ว',
    'toast.reset': 'คืนค่าตั้งต้นแล้ว',
    'toast.soundOn': 'เปิดเสียงแล้ว',
    'toast.soundOff': 'ปิดเสียงแล้ว',
    'webgl.error': 'เบราว์เซอร์นี้ไม่รองรับ WebGL จึงแสดงวงล้อ 3 มิติไม่ได้',
  },
};
/* I18N:END */

const engine = createDrawEngine();

/* ==========================================================================
   3. Platform
   ========================================================================== */

const $ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const TAU = engine.TAU;
const PALETTE = ['#c0392b', '#c2701c', '#b08a1e', '#2f7d54', '#1f7a74', '#2b5a9e', '#5a48b0', '#96376f'];
const STORAGE = {
  prefs: 'ld3.prefs.v1',
  roster: 'ld3.roster.v1',
  history: 'ld3.history.v1',
};
const DEFAULTS = Object.freeze({
  lang: 'en',
  sound: true,
  autoRemove: false,
  duration: 5.5,
  turns: 6,
});
const DEFAULT_ROSTER = Object.freeze(['Maya Chen', 'Liam Okafor', 'Sofia Rossi', 'Noah Kim']);

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const storage = {
  read(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  clear(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* private mode */
    }
  },
};

const createAudio = () => {
  let context = null;
  let muted = false;
  let lastTick = 0;

  const ensure = () => {
    if (!context) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      context = new AudioCtor();
    }
    if (context.state === 'suspended') context.resume().catch(() => {});
    return context;
  };

  const tone = ({ freq, type = 'sine', duration = 0.12, gain = 0.08, when = 0, glide = null }) => {
    const ac = ensure();
    if (!ac || muted) return;
    const start = ac.currentTime + when;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(30, freq), start);
    if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, glide), start + duration);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(amp).connect(ac.destination);
    osc.start(start);
    osc.stop(start + duration + 0.04);
  };

  const tick = (speed = 0) => {
    if (muted) return;
    const now = performance.now();
    if (now - lastTick < 24) return;
    lastTick = now;
    const ac = ensure();
    if (!ac) return;
    const freq = 1180 + Math.min(1900, Math.max(0, speed) * 36);
    tone({ freq, type: 'triangle', duration: 0.045, gain: 0.05 });
    tone({ freq: freq * 1.92, type: 'sine', duration: 0.022, gain: 0.022 });
  };

  const whoosh = () => {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const seconds = 0.7;
    const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * seconds), ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
    }
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(340, ac.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2600, ac.currentTime + seconds);
    const amp = ac.createGain();
    amp.gain.value = 0.05;
    source.connect(filter).connect(amp).connect(ac.destination);
    source.start();
  };

  const fanfare = () => {
    if (muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      tone({ freq, type: 'triangle', duration: 0.34, gain: 0.1, when: index * 0.105 });
      tone({ freq: freq * 2, type: 'sine', duration: 0.2, gain: 0.025, when: index * 0.105 });
    });
    tone({ freq: 130.81, type: 'sine', duration: 0.55, gain: 0.06 });
    tone({ freq: 1567.98, type: 'sine', duration: 0.9, gain: 0.05, when: 0.46 });
  };

  const setMuted = (value) => {
    muted = Boolean(value);
    if (!muted && context) tick(0);
  };

  return {
    unlock: () => ensure(),
    tick,
    whoosh,
    fanfare,
    setMuted,
    get muted() {
      return muted;
    },
    get context() {
      return context;
    },
  };
};

const createConfetti = (canvas) => {
  let frame = 0;
  let particles = [];
  let context = null;
  canvas.width = 0;
  canvas.height = 0;

  const prepare = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    context = canvas.getContext('2d');
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    particles = [];
    if (context) context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  };

  const burst = ({ colors = PALETTE, count = 170 } = {}) => {
    if (prefersReducedMotion()) return false;
    prepare();
    const width = window.innerWidth;
    const height = window.innerHeight;
    particles = Array.from({ length: count }, () => ({
      x: width / 2 + (Math.random() - 0.5) * width * 0.55,
      y: height * 0.3 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 10.5,
      vy: -Math.random() * 12 - 2.2,
      size: 4 + Math.random() * 7,
      rotation: Math.random() * TAU,
      spin: (Math.random() - 0.5) * 0.32,
      color: colors[Math.floor(Math.random() * colors.length)],
      round: Math.random() > 0.7,
      life: 0,
    }));
    const started = performance.now();
    const draw = (now) => {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      const elapsed = (now - started) / 1000;
      for (const piece of particles) {
        piece.vy += 0.28;
        piece.vx *= 0.994;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.spin;
        piece.life += 1;
        const fade = clamp(1 - Math.max(0, elapsed - 1.4) / 1.4, 0, 1);
        context.save();
        context.globalAlpha = fade;
        context.translate(piece.x, piece.y);
        context.rotate(piece.rotation);
        context.fillStyle = piece.color;
        if (piece.round) {
          context.beginPath();
          context.arc(0, 0, piece.size * 0.42, 0, TAU);
          context.fill();
        } else {
          context.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
        }
        context.restore();
      }
      if (elapsed < 2.9) {
        frame = requestAnimationFrame(draw);
      } else {
        stop();
      }
    };
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
    return true;
  };

  window.addEventListener('resize', () => {
    if (particles.length) prepare();
  });

  return { burst, stop };
};

const download = (filename, mime, content) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

const hexToRgb = (hex) => {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

const mixColor = (hex, target, amount) => {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  const channel = (x, y) => Math.round(x + (y - x) * amount).toString(16).padStart(2, '0');
  return `#${channel(a.r, b.r)}${channel(a.g, b.g)}${channel(a.b, b.b)}`;
};

/* ==========================================================================
   4. Three.js studio
   ========================================================================== */

const createStudio = (container, drawEngine) => {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060a11, 0.032);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0.9, 4.65, 14);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label', 'Interactive 3D prize wheel');
  renderer.domElement.setAttribute('role', 'img');
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 3.35, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.rotateSpeed = 0.55;
  controls.zoomSpeed = 0.7;
  controls.panSpeed = 0.55;
  controls.minDistance = 6;
  controls.maxDistance = 19;
  controls.minPolarAngle = 0.55;
  controls.maxPolarAngle = 1.78;
  controls.update();

  /* Environment: studio reflections without external HDR files. */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.05).texture;
  scene.environment = environment;
  room.dispose?.();
  pmrem.dispose();

  /* Palette + materials */
  const gold = new THREE.MeshStandardMaterial({
    color: 0xf0c46a,
    metalness: 0.95,
    roughness: 0.22,
    envMapIntensity: 1.25,
  });
  const chrome = new THREE.MeshStandardMaterial({
    color: 0xc9d4e5,
    metalness: 1,
    roughness: 0.18,
    envMapIntensity: 1.4,
  });
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x18202f,
    metalness: 0.86,
    roughness: 0.34,
    envMapIntensity: 0.9,
  });
  const bodyMetal = new THREE.MeshStandardMaterial({
    color: 0x0d1522,
    metalness: 0.72,
    roughness: 0.4,
    envMapIntensity: 0.8,
  });
  const pointerRed = new THREE.MeshStandardMaterial({
    color: 0xc0392b,
    metalness: 0.7,
    roughness: 0.28,
    emissive: 0x3a0805,
    emissiveIntensity: 0.8,
  });

  /* Floor */
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(20, 64),
    new THREE.MeshStandardMaterial({
      color: 0x070b12,
      metalness: 0.55,
      roughness: 0.48,
      envMapIntensity: 0.55,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  floor.receiveShadow = true;
  scene.add(floor);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(2.1, 2.16, 96),
    new THREE.MeshBasicMaterial({
      color: 0xf5c76b,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    })
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.005;
  scene.add(halo);

  /* Lights */
  scene.add(new THREE.HemisphereLight(0x9fb6ff, 0x05070c, 0.5));

  const keyLight = new THREE.DirectionalLight(0xffe9c8, 2.35);
  keyLight.position.set(5.2, 9.5, 7.5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.left = -7;
  keyLight.shadow.camera.right = 7;
  keyLight.shadow.camera.top = 9;
  keyLight.shadow.camera.bottom = -3;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 32;
  keyLight.shadow.bias = -0.00025;
  keyLight.shadow.radius = 4;
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x3fd6c4, 42, 22, 2);
  rimLight.position.set(-6.2, 4.2, 4.5);
  scene.add(rimLight);

  const warmFill = new THREE.PointLight(0xf5c76b, 48, 20, 2);
  warmFill.position.set(5.2, 3.4, 3.2);
  scene.add(warmFill);

  const backGlow = new THREE.PointLight(0x5b7bff, 34, 16, 2);
  backGlow.position.set(0, 4.4, -3.6);
  scene.add(backGlow);

  /* Stand */
  const stand = new THREE.Group();
  scene.add(stand);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.8, 0.2, 64), darkMetal);
  base.position.y = 0.1;
  base.castShadow = true;
  base.receiveShadow = true;
  stand.add(base);

  const baseTop = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.56, 0.1, 64), chrome);
  baseTop.position.y = 0.24;
  baseTop.castShadow = true;
  stand.add(baseTop);

  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(1.56, 0.035, 10, 96), gold);
  baseRing.rotation.x = -Math.PI / 2;
  baseRing.position.y = 0.205;
  stand.add(baseRing);

  const column = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.55, 0.46), bodyMetal);
  column.position.set(0, 1.55, -0.74);
  column.castShadow = true;
  column.receiveShadow = true;
  stand.add(column);

  const columnFace = new THREE.Mesh(new THREE.BoxGeometry(0.56, 2.35, 0.06), chrome);
  columnFace.position.set(0, 1.55, -0.99);
  stand.add(columnFace);

  const axle = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 0.72), chrome);
  axle.position.set(0, 3.35, -0.55);
  axle.castShadow = true;
  stand.add(axle);

  for (const side of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.3, 24), gold);
    cheek.rotation.x = Math.PI / 2;
    cheek.position.set(side * 0.64, 3.35, -0.24);
    cheek.castShadow = true;
    stand.add(cheek);
  }

  const baseLight = new THREE.PointLight(0xf5c76b, 14, 4.5, 2);
  baseLight.position.set(0, 0.55, 1.1);
  stand.add(baseLight);

  /* Wheel */
  const R = 3.05;
  const THICK = 0.34;
  const wheel = new THREE.Group();
  wheel.position.set(0, 3.35, 0);
  scene.add(wheel);

  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = 2048;
  faceCanvas.height = 2048;
  const faceContext = faceCanvas.getContext('2d');
  const faceTexture = new THREE.CanvasTexture(faceCanvas);
  faceTexture.colorSpace = THREE.SRGBColorSpace;
  faceTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const faceMaterial = new THREE.MeshStandardMaterial({
    map: faceTexture,
    roughness: 0.56,
    metalness: 0.06,
    envMapIntensity: 0.7,
  });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, THICK, 160, 1, false),
    [darkMetal, bodyMetal, bodyMetal]
  );
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  wheel.add(body);

  const face = new THREE.Mesh(new THREE.CircleGeometry(R - 0.015, 180), faceMaterial);
  face.position.z = THICK / 2 + 0.004;
  face.receiveShadow = true;
  wheel.add(face);

  const backPlate = new THREE.Mesh(
    new THREE.CircleGeometry(R - 0.01, 160),
    new THREE.MeshStandardMaterial({ color: 0x0a111c, metalness: 0.7, roughness: 0.45 })
  );
  backPlate.position.z = -THICK / 2 - 0.004;
  backPlate.rotation.y = Math.PI;
  wheel.add(backPlate);

  const frontTorus = new THREE.Mesh(new THREE.TorusGeometry(R + 0.015, 0.065, 14, 200), gold);
  frontTorus.position.z = THICK / 2;
  frontTorus.castShadow = true;
  wheel.add(frontTorus);

  const backTorus = new THREE.Mesh(new THREE.TorusGeometry(R + 0.005, 0.045, 10, 200), chrome);
  backTorus.position.z = -THICK / 2;
  wheel.add(backTorus);

  const bevelFront = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.035, R - 0.02, 0.08, 160), gold);
  bevelFront.rotation.x = Math.PI / 2;
  bevelFront.position.z = THICK / 2 - 0.045;
  wheel.add(bevelFront);

  const bevelBack = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.02, R + 0.02, 0.06, 160), darkMetal);
  bevelBack.rotation.x = Math.PI / 2;
  bevelBack.position.z = -THICK / 2 + 0.04;
  wheel.add(bevelBack);

  const rimGroup = new THREE.Group();
  wheel.add(rimGroup);
  const pegGroup = new THREE.Group();
  wheel.add(pegGroup);

  /* Hub */
  const hub = new THREE.Group();
  hub.position.z = THICK / 2 + 0.02;
  wheel.add(hub);

  const hubDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.12, 64), gold);
  hubDisc.rotation.x = Math.PI / 2;
  hubDisc.castShadow = true;
  hub.add(hubDisc);

  const hubInner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.34, 0.14, 64),
    new THREE.MeshStandardMaterial({ color: 0x0a101a, metalness: 0.6, roughness: 0.32 })
  );
  hubInner.rotation.x = Math.PI / 2;
  hubInner.position.z = 0.03;
  hub.add(hubInner);

  const hubRing = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.022, 10, 64), chrome);
  hubRing.position.z = 0.075;
  hub.add(hubRing);

  const hubDot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 16), gold);
  hubDot.position.z = 0.12;
  hub.add(hubDot);

  /* Pointer: pivots at the top bracket and swings when pegs pass. */
  const pointerPivot = new THREE.Group();
  pointerPivot.position.set(0, 3.35 + R + 0.72, 0.34);
  scene.add(pointerPivot);

  const pointerMount = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.16), chrome);
  pointerMount.position.set(0, 0.12, -0.3);
  pointerPivot.add(pointerMount);

  const pointerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.64, 18), chrome);
  pointerArm.position.set(0, 0.14, 0);
  pointerArm.rotation.z = 0;
  pointerPivot.add(pointerArm);

  const needle = new THREE.Mesh(new THREE.ConeGeometry(0.145, 0.62, 4), pointerRed);
  needle.rotation.z = Math.PI;
  needle.rotation.y = Math.PI / 4;
  needle.position.set(0, -0.38, 0);
  needle.castShadow = true;
  pointerPivot.add(needle);

  const needleTip = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 12), gold);
  needleTip.position.set(0, -0.69, 0);
  pointerPivot.add(needleTip);

  /* Face drawing -------------------------------------------------------- */

  const labelFont = (size) =>
    `700 ${size}px "Inter", "Noto Sans Thai", "Thonburi", "Helvetica Neue", sans-serif`;

  const drawFace = (entries, lang = 'en', restRotation = 0) => {
    const size = faceCanvas.width;
    const c = size / 2;
    const radius = (size / 2) * 0.918;
    const ctx = faceContext;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#0a111e';
    ctx.fillRect(0, 0, size, size);

    if (!entries.length) {
      const empty = 8;
      for (let i = 0; i < empty; i += 1) {
        const start = (i / empty) * TAU;
        const end = ((i + 1) / empty) * TAU;
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.arc(c, c, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? '#162033' : '#1a2740';
        ctx.fill();
        ctx.strokeStyle = 'rgba(5,9,15,.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(245,199,107,.75)';
      ctx.font = labelFont(54);
      ctx.fillText(lang === 'th' ? 'เพิ่มรายชื่อ' : 'ADD PLAYERS', c, c - 300);
      ctx.fillStyle = 'rgba(214,226,240,.5)';
      ctx.font = labelFont(30);
      ctx.fillText(lang === 'th' ? 'อย่างน้อย 2 ชื่อ' : 'at least two names', c, c - 238);
      return;
    }

    const n = entries.length;
    const step = TAU / n;

    for (let i = 0; i < n; i += 1) {
      const start = i * step;
      const end = start + step;
      const base = PALETTE[i % PALETTE.length];
      const color = i % 2 === 0 ? base : mixColor(base, '#0a111e', 0.14);
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.arc(c, c, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(6,10,17,.86)';
      ctx.lineWidth = Math.max(2, 5 - n * 0.06);
      ctx.stroke();

      // A soft highlight per slice gives the printed face some depth.
      const mid = start + step / 2;
      const gradient = ctx.createLinearGradient(
        c,
        c,
        c + Math.cos(mid) * radius,
        c + Math.sin(mid) * radius
      );
      gradient.addColorStop(0, 'rgba(255,255,255,.09)');
      gradient.addColorStop(0.55, 'rgba(255,255,255,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,.2)');
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.arc(c, c, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Labels: tangential for small, high-stakes wheels and radial for long
    // rosters where there is more room along the radius. Flips are decided
    // from the resting rotation, so labels read upright when the wheel stops.
    const tangential = n <= 8;
    const labelRadius = radius * (tangential ? 0.63 : 0.6);
    const chord = 2 * labelRadius * Math.sin(step / 2);

    for (let i = 0; i < n; i += 1) {
      const mid = i * step + step / 2;
      let font = tangential
        ? clamp(chord * 0.27, 14, 54)
        : clamp(chord * 0.42, 13, 62);
      const maxWidth = tangential ? chord * 0.9 : radius * 0.52;
      let text = entries[i];
      ctx.font = labelFont(font);
      while (ctx.measureText(text).width > maxWidth && font > 12) {
        font -= 1;
        ctx.font = labelFont(font);
      }
      if (ctx.measureText(text).width > maxWidth) {
        while (text.length > 3 && ctx.measureText(`${text}…`).width > maxWidth) {
          text = text.slice(0, -1);
        }
        text = `${text}…`;
      }

      const visualAngle = restRotation - mid;
      ctx.save();
      ctx.translate(c, c);
      if (tangential) {
        const flip = Math.cos(restRotation - mid - Math.PI / 2) < 0;
        ctx.rotate(mid + Math.PI / 2);
        ctx.translate(0, -labelRadius);
        if (flip) ctx.rotate(Math.PI);
      } else {
        const flip = Math.cos(visualAngle) < 0;
        ctx.rotate(mid);
        ctx.translate(labelRadius, 0);
        if (flip) ctx.rotate(Math.PI);
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(4,8,14,.55)';
      ctx.fillText(text, 1.5, 2.5);
      ctx.fillStyle = '#fff6e3';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(c, c, radius, 0, TAU);
    ctx.strokeStyle = 'rgba(245,199,107,.7)';
    ctx.lineWidth = 12;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(c, c, radius * 0.875, 0, TAU);
    ctx.strokeStyle = 'rgba(255,246,227,.12)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(c, c, radius * 0.145, 0, TAU);
    ctx.fillStyle = '#0a111e';
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,199,107,.65)';
    ctx.lineWidth = 6;
    ctx.stroke();
  };

  let faceVersion = 0;

  const disposeGroup = (group) => {
    for (const child of [...group.children]) {
      group.remove(child);
      child.traverse((node) => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
          if (Array.isArray(node.material)) node.material.forEach((m) => m.dispose());
          else node.material.dispose();
        }
      });
    }
  };

  const buildRim = (entries) => {
    disposeGroup(rimGroup);
    disposeGroup(pegGroup);
    const n = entries.length;
    if (!n) return;

    const step = TAU / n;

    // Coloured side bands follow each slice's arc. Cylinder theta 0 starts
    // at +X and runs toward -Y once the mesh is rotated onto the Z axis, so
    // the arc for slice i starts at PI/2 - (i + 1) * step.
    for (let i = 0; i < n; i += 1) {
      const color = PALETTE[i % PALETTE.length];
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.48,
        roughness: 0.32,
        envMapIntensity: 0.85,
        emissive: new THREE.Color(color).multiplyScalar(0.09),
        side: THREE.DoubleSide,
      });
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(
          R + 0.006,
          R + 0.006,
          THICK * 0.9,
          24,
          1,
          true,
          Math.PI / 2 - (i + 1) * step + 0.004,
          step - 0.008
        ),
        material
      );
      band.rotation.x = Math.PI / 2;
      band.castShadow = true;
      rimGroup.add(band);
    }

    const pegMaterial = gold.clone();
    const pinMaterial = chrome.clone();
    const pegRadius = R + 0.115;
    for (let i = 0; i < n; i += 1) {
      const angle = i * step;
      const x = Math.cos(angle) * pegRadius;
      const y = -Math.sin(angle) * pegRadius;

      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.072, 18, 14), pegMaterial);
      ball.position.set(x, y, THICK / 2 + 0.035);
      ball.castShadow = true;
      pegGroup.add(ball);

      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.16, 12), pinMaterial);
      pin.rotation.x = Math.PI / 2;
      pin.position.set(x, y, THICK / 2 + 0.005);
      pegGroup.add(pin);
    }
  };

  let currentEntries = [];

  const setRoster = (entries, lang = 'en') => {
    currentEntries = entries;
    drawFace(entries, lang, wheel.rotation.z);
    faceTexture.needsUpdate = true;
    faceVersion += 1;
    buildRim(entries);
    wheel.userData.count = entries.length;
  };

  const refreshLabels = (lang = 'en') => {
    drawFace(currentEntries, lang, wheel.rotation.z);
    faceTexture.needsUpdate = true;
    faceVersion += 1;
  };

  /* Spin state ---------------------------------------------------------- */

  let spin = null;
  let pointerAngle = 0;
  let pointerVelocity = 0;

  const pointerKick = (impulse = 0.2) => {
    pointerVelocity += impulse * 7.5;
  };

  const startSpin = ({ index, count, turns = 6, duration = 5500, onTick, onDone }) => {
    if (spin) return false;
    const from = wheel.rotation.z;
    const plan = drawEngine.targetRotation(index, count, turns, from);
    spin = {
      from,
      end: plan.rotation,
      delta: plan.delta,
      duration: Math.max(280, Number(duration) || 5500),
      elapsed: 0,
      step: TAU / count,
      passed: 0,
      count,
      index: plan.index,
      onTick,
      onDone,
    };
    return true;
  };

  /* Resize -------------------------------------------------------------- */

  const resize = () => {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width / height < 0.82 ? 50 : width / height < 1.15 ? 42 : 36;
    camera.updateProjectionMatrix();
  };

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  /* Render loop --------------------------------------------------------- */

  const clock = new THREE.Clock();
  let frames = 0;

  renderer.setAnimationLoop(() => {
    const dt = Math.min(0.05, clock.getDelta());

    if (spin) {
      spin.elapsed += dt * 1000;
      const t = Math.min(1, spin.elapsed / spin.duration);
      const angle = spin.from + spin.delta * drawEngine.smoothstep(t);
      wheel.rotation.z = angle;

      const passed = Math.floor((angle - spin.from) / spin.step + 1e-9);
      if (passed > spin.passed) {
        const crossings = passed - spin.passed;
        spin.passed = passed;
        const radiansPerSecond = (crossings * spin.step) / Math.max(0.001, dt);
        const perSecond = radiansPerSecond / spin.step;
        pointerKick(clamp(perSecond * 0.0022, 0.045, 0.34));
        spin.onTick?.({ perSecond, crossings, t });
      }

      if (t >= 1) {
        const finished = spin;
        spin = null;
        wheel.rotation.z = drawEngine.mod(finished.end, TAU);
        pointerKick(0.4);
        finished.onDone?.({ rotation: wheel.rotation.z, index: finished.index });
      }
    }

    // Damped spring returns the pointer to rest after a peg strike.
    pointerVelocity += (-pointerAngle * 110 - pointerVelocity * 10.5) * dt;
    pointerAngle += pointerVelocity * dt;
    pointerAngle = clamp(pointerAngle, -0.42, 0.42);
    pointerPivot.rotation.z = pointerAngle;

    controls.target.x = clamp(controls.target.x, -2.6, 2.6);
    controls.target.y = clamp(controls.target.y, 1.4, 5.4);
    controls.target.z = clamp(controls.target.z, -1.6, 1.6);
    controls.update();

    halo.material.opacity = 0.09 + Math.sin(performance.now() * 0.0009) * 0.03;
    renderer.render(scene, camera);
    frames += 1;
  });

  return {
    scene,
    camera,
    renderer,
    controls,
    wheel,
    pointerPivot,
    R,
    setRoster,
    refreshLabels,
    startSpin,
    pointerKick,
    resize,
    get spinning() {
      return Boolean(spin);
    },
    get faceVersion() {
      return faceVersion;
    },
    get frames() {
      return frames;
    },
  };
};

/* ==========================================================================
   5. Controller
   ========================================================================== */

const state = {
  prefs: { ...DEFAULTS },
  roster: [],
  history: [],
  spinning: false,
  pending: null,
  lastWinner: null,
  tab: 'roster',
};

const audio = createAudio();
const confetti = createConfetti($('confetti'));
let studio = null;
let bulkTimer = 0;
let toastTimer = 0;
let clearArmed = false;
let clearTimer = 0;
let sessionStart = Date.now();

const t = (key, vars = {}) => {
  const dictionary = I18N[state.prefs.lang] || I18N.en;
  const template = dictionary[key] ?? I18N.en[key] ?? key;
  return String(template).replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
};

const formatTime = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const locale = state.prefs.lang === 'th' ? 'th-TH' : 'en-GB';
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return date.toISOString().slice(11, 16);
  }
};

const formatSeconds = (value) => `${Number(value).toFixed(1)}s`;

const showToast = (message, tone = 'info') => {
  const node = $('toast');
  if (!node) return;
  node.textContent = message;
  node.classList.toggle('is-warn', tone === 'warn');
  node.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('is-visible'), 3200);
};

const persistPrefs = () => storage.write(STORAGE.prefs, state.prefs);
const persistRoster = () => storage.write(STORAGE.roster, state.roster);
const persistHistory = () => storage.write(STORAGE.history, state.history);

const load = () => {
  const prefs = storage.read(STORAGE.prefs, {});
  if (prefs && typeof prefs === 'object') {
    if (prefs.lang === 'th' || prefs.lang === 'en') state.prefs.lang = prefs.lang;
    if (typeof prefs.sound === 'boolean') state.prefs.sound = prefs.sound;
    if (typeof prefs.autoRemove === 'boolean') state.prefs.autoRemove = prefs.autoRemove;
    if (Number.isFinite(prefs.duration)) state.prefs.duration = clamp(prefs.duration, 3, 10);
    if (Number.isFinite(prefs.turns)) state.prefs.turns = clamp(Math.round(prefs.turns), 2, 14);
  }

  const roster = storage.read(STORAGE.roster, null);
  if (Array.isArray(roster)) {
    state.roster = engine.normalizeRoster(roster).entries;
  } else if (roster === null) {
    state.roster = engine.normalizeRoster(DEFAULT_ROSTER).entries;
  }

  const history = storage.read(STORAGE.history, null);
  if (Array.isArray(history)) {
    state.history = history
      .filter(
        (record) =>
          record &&
          typeof record.winner === 'string' &&
          typeof record.at === 'string' &&
          Number.isFinite(record.rosterSize)
      )
      .slice(0, 200)
      .map((record) => ({
        id: String(record.id || `${record.at}-${record.winner}`),
        draw: Number(record.draw) || 0,
        at: record.at,
        winner: record.winner,
        rosterSize: Number(record.rosterSize) || 0,
        durationMs: Number(record.durationMs) || 0,
        removed: Boolean(record.removed),
      }));
    if (!state.roster.length && state.history.length && !roster) {
      // The roster was cleared deliberately; do not resurrect old winners.
    }
  }
};

/* ---- roster ------------------------------------------------------------- */

const syncRosterInputs = ({ skipQuick = false, skipBulk = false } = {}) => {
  if (!skipQuick) {
    for (let i = 1; i <= 4; i += 1) {
      const input = $(`slot-${i}`);
      if (input) input.value = state.roster[i - 1] || '';
    }
  }
  if (!skipBulk) {
    const bulk = $('bulk-roster');
    if (bulk) bulk.value = state.roster.join('\n');
  }
};

const renderChips = () => {
  const wrap = $('roster-chips');
  if (!wrap) return;
  wrap.textContent = '';
  if (!state.roster.length) {
    const empty = document.createElement('span');
    empty.className = 'chip-empty';
    empty.textContent =
      state.prefs.lang === 'th' ? 'ยังไม่มีรายชื่อ' : 'No entries yet';
    wrap.appendChild(empty);
    return;
  }
  state.roster.forEach((name, index) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    const label = document.createElement('span');
    label.textContent = name;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remove ${name}`);
    remove.dataset.index = String(index);
    remove.textContent = '×';
    chip.append(label, remove);
    wrap.appendChild(chip);
  });
};

const updateCounters = () => {
  $('roster-count').textContent = String(state.roster.length);
  $('stage-count').textContent = String(state.roster.length);
  $('tab-roster-count').textContent = String(state.roster.length);
  $('tab-history-count').textContent = String(state.history.length);
  $('draws-count').textContent = String(state.history.length);
};

const updateSpinState = () => {
  const button = $('spin-btn');
  const label = $('spin-label');
  const sub = $('spin-sub');
  if (!button || !label || !sub) return;
  button.disabled = state.roster.length < engine.MIN_ENTRIES;
  button.classList.toggle('is-spinning', state.spinning);
  button.setAttribute('aria-busy', String(state.spinning));
  label.textContent = state.spinning ? t('stage.spinning') : t('stage.spin');
  sub.textContent = state.spinning
    ? t('stage.spinSubBusy')
    : state.roster.length < engine.MIN_ENTRIES
      ? t('stage.addNames')
      : t('stage.spinSub');
};

const applyRoster = (input, { source = 'ui', announce = false } = {}) => {
  if (state.spinning) {
    showToast(t('stage.spinning'), 'warn');
    return;
  }
  const result = engine.normalizeRoster(input);
  state.roster = result.entries;

  if (studio) studio.setRoster(state.roster, state.prefs.lang);
  syncRosterInputs({ skipQuick: source === 'quick', skipBulk: source === 'bulk' });
  renderChips();
  updateCounters();
  updateSpinState();
  persistRoster();

  if (announce) {
    if (result.duplicates.length) {
      showToast(t('toast.dupes', { names: result.duplicates.join(', ') }), 'warn');
    } else if (result.overflow.length) {
      showToast(t('toast.limit', { max: engine.MAX_ENTRIES }), 'warn');
    }
  }
};

const removeEntry = (index) => {
  const removed = state.roster[index];
  const next = state.roster.filter((_, i) => i !== index);
  applyRoster(next, { source: 'full' });
  if (removed) showToast(t('toast.removed', { name: removed }));
};

/* ---- history ------------------------------------------------------------ */

const renderHistory = () => {
  const list = $('history-list');
  const empty = $('history-empty');
  if (!list || !empty) return;
  list.textContent = '';
  empty.hidden = state.history.length > 0;

  state.history.forEach((record, index) => {
    const item = document.createElement('li');
    item.className = 'history-item';
    item.dataset.winner = record.winner;

    const rank = document.createElement('span');
    rank.className = 'rank';
    rank.textContent = `#${String(record.draw || state.history.length - index).padStart(2, '0')}`;

    const who = document.createElement('div');
    who.className = 'who';
    const name = document.createElement('strong');
    name.textContent = record.winner;
    const meta = document.createElement('small');
    meta.textContent = `${formatTime(record.at)} · ${(record.durationMs / 1000).toFixed(1)}s · ${record.rosterSize}`;
    who.append(name, meta);

    const tag = document.createElement('span');
    tag.className = `tag${record.removed ? ' is-removed' : ''}`;
    tag.textContent = record.removed ? t('history.tagRemoved') : t('history.tagKept');

    item.append(rank, who, tag);
    list.appendChild(item);
  });
};

const resetClearArmed = () => {
  clearArmed = false;
  clearTimeout(clearTimer);
  const button = $('clear-history');
  if (button) {
    button.classList.remove('is-armed');
    button.textContent = t('history.clear');
  }
};

const clearHistory = () => {
  if (clearArmed) {
    state.history = [];
    state.lastWinner = null;
    persistHistory();
    renderHistory();
    updateCounters();
    resetClearArmed();
    showToast(t('toast.cleared'));
    return true;
  }
  if (!state.history.length) {
    showToast(t('toast.noHistory'), 'warn');
    return false;
  }
  clearArmed = true;
  const button = $('clear-history');
  if (button) {
    button.classList.add('is-armed');
    button.textContent = t('history.clearArmed');
  }
  clearTimeout(clearTimer);
  clearTimer = setTimeout(resetClearArmed, 3200);
  return false;
};

const exportRecords = (kind = 'json', { download: shouldDownload = true } = {}) => {
  if (!state.history.length) {
    showToast(t('toast.noHistory'), 'warn');
    return null;
  }
  const stamp = new Date().toISOString().slice(0, 10);
  let content;
  let filename;
  let mime;
  if (kind === 'csv') {
    content = engine.toCSV(state.history);
    filename = `lucky-draw-${stamp}.csv`;
    mime = 'text/csv;charset=utf-8';
    if (shouldDownload) download(filename, mime, `\uFEFF${content}`);
  } else {
    content = engine.toJSON(state.history, {
      project: 'Full 3D Lucky Draw & Prize Wheel Studio',
      language: state.prefs.lang,
      roster: state.roster,
    });
    filename = `lucky-draw-${stamp}.json`;
    mime = 'application/json;charset=utf-8';
    if (shouldDownload) download(filename, mime, content);
  }
  showToast(t('toast.exported', { what: kind.toUpperCase() }));
  return content;
};

/* ---- draw --------------------------------------------------------------- */

const closeWinner = () => {
  const modal = $('winner-modal');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  if (!state.spinning) $('spin-btn')?.focus({ preventScroll: true });
};

const removeWinnerFromRoster = (record) => {
  if (!record || record.removed) return;
  const index = state.roster.indexOf(record.winner);
  if (index >= 0) state.roster.splice(index, 1);
  record.removed = true;
  if (studio) studio.setRoster(state.roster, state.prefs.lang);
  syncRosterInputs();
  renderChips();
  updateCounters();
  updateSpinState();
  persistRoster();
  persistHistory();
  renderHistory();
};

const showWinner = (record) => {
  const modal = $('winner-modal');
  if (!modal) return;
  $('winner-name').textContent = record.winner;
  $('winner-meta').textContent = t('winner.meta', {
    n: record.draw,
    time: formatTime(record.at),
    size: record.rosterSize,
  });
  const primary = $('winner-remove');
  const keep = $('winner-keep');
  primary.textContent = record.removed ? t('winner.continue') : t('winner.remove');
  keep.hidden = record.removed;
  modal.hidden = false;
  requestAnimationFrame(() => primary.focus({ preventScroll: true }));
};

const completeDraw = () => {
  const pending = state.pending;
  state.pending = null;
  state.spinning = false;
  if (!pending) {
    updateSpinState();
    return;
  }

  const at = new Date().toISOString();
  const record = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    draw: (state.history[0]?.draw || 0) + 1,
    at,
    winner: pending.winner,
    rosterSize: state.roster.length,
    durationMs: Date.now() - pending.startedAt,
    removed: false,
  };

  state.history.unshift(record);
  if (state.history.length > 200) state.history.length = 200;
  state.lastWinner = record;
  persistHistory();
  renderHistory();
  updateCounters();
  updateSpinState();
  studio?.refreshLabels(state.prefs.lang);

  if (state.prefs.autoRemove) removeWinnerFromRoster(record);

  showWinner(record);
  audio.fanfare();
  confetti.burst({ colors: PALETTE });
};

const spin = () => {
  if (state.spinning) return false;
  if (state.roster.length < engine.MIN_ENTRIES) {
    showToast(t('toast.needTwo'), 'warn');
    $('slot-1')?.focus();
    return false;
  }
  audio.unlock();

  const reduced = prefersReducedMotion();
  const count = state.roster.length;
  const index = engine.pickIndex(count);
  if (index < 0 || index >= count) return false;

  const duration = (reduced ? 1.1 : state.prefs.duration) * 1000;
  const turns = reduced ? 1 : state.prefs.turns;

  state.spinning = true;
  state.pending = {
    index,
    winner: state.roster[index],
    startedAt: Date.now(),
  };
  updateSpinState();
  audio.whoosh();

  const started = studio?.startSpin({
    index,
    count,
    turns,
    duration,
    onTick: ({ perSecond }) => audio.tick(perSecond),
    onDone: completeDraw,
  });

  if (started === false) {
    state.spinning = false;
    state.pending = null;
    updateSpinState();
    return false;
  }
  return true;
};

/* ---- language, settings, panels ---------------------------------------- */

const updateOutputs = () => {
  $('duration-value').textContent = formatSeconds(state.prefs.duration);
  $('turns-value').textContent = String(state.prefs.turns);
  $('duration-range').value = String(state.prefs.duration);
  $('turns-range').value = String(state.prefs.turns);
  $('auto-remove').checked = state.prefs.autoRemove;
  $('sound-switch').checked = state.prefs.sound;
  $('sound-toggle').setAttribute('aria-pressed', String(state.prefs.sound));
};

const applyLanguage = (lang, { silent = false } = {}) => {
  state.prefs.lang = lang === 'th' ? 'th' : 'en';
  const dictionary = I18N[state.prefs.lang];
  document.documentElement.lang = state.prefs.lang;

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const value = dictionary[node.dataset.i18n];
    if (value) node.textContent = value;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    const value = dictionary[node.dataset.i18nPlaceholder];
    if (value) node.placeholder = value;
  });
  document.querySelectorAll('.lang-btn').forEach((button) => {
    const active = button.dataset.lang === state.prefs.lang;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  resetClearArmed();
  renderHistory();
  renderChips();
  updateCounters();
  updateSpinState();
  updateOutputs();
  if (state.lastWinner && !$('winner-modal').hidden) showWinner(state.lastWinner);
  if (studio) studio.setRoster(state.roster, state.prefs.lang);
  if (!silent) persistPrefs();
};

const setSound = (enabled, { announce = false } = {}) => {
  state.prefs.sound = Boolean(enabled);
  audio.setMuted(!state.prefs.sound);
  $('sound-toggle').setAttribute('aria-pressed', String(state.prefs.sound));
  $('sound-switch').checked = state.prefs.sound;
  persistPrefs();
  if (announce) showToast(t(state.prefs.sound ? 'toast.soundOn' : 'toast.soundOff'));
};

const toggleLanguage = () => applyLanguage(state.prefs.lang === 'th' ? 'en' : 'th');

const openDrawer = () => {
  closeSidebar();
  const drawer = $('settings-drawer');
  const scrim = $('drawer-scrim');
  if (!drawer) return;
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  $('settings-toggle').setAttribute('aria-expanded', 'true');
  if (scrim) {
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add('is-open'));
  }
  $('settings-close')?.focus({ preventScroll: true });
};

const closeDrawer = () => {
  const drawer = $('settings-drawer');
  if (!drawer) return;
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  $('settings-toggle')?.setAttribute('aria-expanded', 'false');
  if (!$('sidebar')?.classList.contains('is-open')) hideScrim();
};

const openSidebar = () => {
  closeDrawer();
  $('sidebar')?.classList.add('is-open');
  $('sidebar-toggle')?.setAttribute('aria-expanded', 'true');
  const scrim = $('drawer-scrim');
  if (scrim) {
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add('is-open'));
  }
};

const closeSidebar = () => {
  $('sidebar')?.classList.remove('is-open');
  $('sidebar-toggle')?.setAttribute('aria-expanded', 'false');
  if (!$('settings-drawer')?.classList.contains('is-open')) hideScrim();
};

const hideScrim = () => {
  const scrim = $('drawer-scrim');
  if (!scrim) return;
  scrim.classList.remove('is-open');
  setTimeout(() => {
    if (!scrim.classList.contains('is-open')) scrim.hidden = true;
  }, 260);
};

const setTab = (name) => {
  state.tab = name === 'history' ? 'history' : 'roster';
  const rosterTab = $('tab-roster');
  const historyTab = $('tab-history');
  const rosterPanel = $('panel-roster');
  const historyPanel = $('panel-history');
  const isRoster = state.tab === 'roster';

  rosterTab.classList.toggle('is-active', isRoster);
  historyTab.classList.toggle('is-active', !isRoster);
  rosterTab.setAttribute('aria-selected', String(isRoster));
  historyTab.setAttribute('aria-selected', String(!isRoster));
  rosterPanel.classList.toggle('is-active', isRoster);
  historyPanel.classList.toggle('is-active', !isRoster);
  rosterPanel.hidden = !isRoster;
  historyPanel.hidden = isRoster;
};

const PRESETS = {
  quick3: ['Maya Chen', 'Liam Okafor', 'Sofia Rossi'],
  quick4: ['Maya Chen', 'Liam Okafor', 'Sofia Rossi', 'Noah Kim'],
  team: ['Team Alpha', 'Team Bravo', 'Team Charlie', 'Team Delta', 'Team Echo'],
  party: [
    'Nok',
    'Ploy',
    'Krit',
    'Fern',
    'Bank',
    'Mint',
    'Pete',
    'June',
    'Ton',
    'Belle',
    'Oat',
    'Fah',
  ],
};

/* ---- self-test ---------------------------------------------------------- */

const runSelfTest = () => {
  const checks = [];
  const check = (name, fn) => {
    try {
      const result = fn();
      checks.push({ name, ok: result !== false, detail: result });
    } catch (error) {
      checks.push({ name, ok: false, detail: error?.message || String(error) });
    }
  };

  check('Slice layout covers the circle exactly once', () => {
    for (let n = 2; n <= 32; n += 1) {
      const layout = engine.sliceLayout(n);
      if (layout.length !== n) return false;
      if (Math.abs(layout[n - 1].end - TAU) > 1e-9) return false;
      if (Math.abs(layout.reduce((sum, s) => sum + (s.end - s.start), 0) - TAU) > 1e-9) {
        return false;
      }
    }
    return true;
  });

  check('Pointer resolves every slice after a target rotation', () => {
    for (let n = 2; n <= 32; n += 1) {
      for (let i = 0; i < n; i += 1) {
        const from = i * 0.37;
        const plan = engine.targetRotation(i, n, 3, from);
        if (engine.resolveIndex(plan.rotation, n) !== i) return false;
      }
    }
    return true;
  });

  check('Rotation for a slice always lands under the pointer', () => {
    for (let n = 2; n <= 32; n += 1) {
      for (let i = 0; i < n; i += 1) {
        if (engine.resolveIndex(engine.rotationForIndex(i, n), n) !== i) return false;
      }
    }
    return true;
  });

  check('Target rotation always moves forward by the requested turns', () => {
    for (let i = 0; i < 200; i += 1) {
      const n = 2 + (i % 31);
      const index = i % n;
      const turns = 2 + (i % 7);
      const plan = engine.targetRotation(index, n, turns, i * 0.21);
      if (plan.delta < turns * TAU) return false;
      if (plan.delta > turns * TAU + TAU) return false;
      if (engine.resolveIndex(plan.rotation, n) !== index) return false;
    }
    return true;
  });

  check('Uniform pick is balanced over 24,000 seeded draws', () => {
    let seed = 0x2f6e2b1;
    const random = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
    const counts = new Array(6).fill(0);
    for (let i = 0; i < 24000; i += 1) {
      counts[engine.pickIndex(6, (n) => Math.floor(random() * n))] += 1;
    }
    const expected = 4000;
    return counts.every((count) => Math.abs(count - expected) < 280);
  });

  check('Roster normalisation trims, merges and caps', () => {
    const result = engine.normalizeRoster('  Ada  Lovelace \nada lovelace\n\nGrace');
    if (result.entries.length !== 2) return false;
    if (result.duplicates.length !== 1) return false;
    if (result.entries[0] !== 'Ada Lovelace') return false;
    const many = Array.from({ length: 40 }, (_, i) => `Entry ${i}`);
    const capped = engine.normalizeRoster(many);
    return capped.entries.length === engine.MAX_ENTRIES && capped.overflow.length === 8;
  });

  check('Names are stripped of control characters and capped at 28 chars', () => {
    const name = engine.cleanName(`A\u0000B\tC${'x'.repeat(50)}`);
    return !name.includes('\u0000') && name.length <= 28 && name.startsWith('A B C');
  });

  check('CSV escapes commas, quotes and newlines', () => {
    const csv = engine.toCSV([
      { at: '2026-11-05T00:00:00.000Z', winner: 'Ada, "Countess"', rosterSize: 4, removed: true, durationMs: 5100 },
    ]);
    return csv.includes('"Ada, ""Countess"""') && csv.includes(',yes,5100');
  });

  check('JSON export has a stable schema and draw fields', () => {
    const json = JSON.parse(
      engine.toJSON([
        { draw: 1, at: '2026-11-05T00:00:00.000Z', winner: 'Ada', rosterSize: 4, removed: false, durationMs: 5000 },
      ])
    );
    return (
      json.schema === 'lucky-draw.export.v1' &&
      Array.isArray(json.draws) &&
      json.draws[0].winner === 'Ada' &&
      typeof json.exportedAt === 'string'
    );
  });

  check('English and Thai dictionaries have identical keys', () => {
    const en = Object.keys(I18N.en).sort();
    const th = Object.keys(I18N.th).sort();
    if (en.length < 80) return false;
    return en.length === th.length && en.every((key, index) => key === th[index]);
  });

  check('Every translated DOM key exists in both dictionaries', () => {
    const keys = new Set();
    document.querySelectorAll('[data-i18n]').forEach((node) => keys.add(node.dataset.i18n));
    document
      .querySelectorAll('[data-i18n-placeholder]')
      .forEach((node) => keys.add(node.dataset.i18nPlaceholder));
    return [...keys].every((key) => key in I18N.en && key in I18N.th);
  });

  check('HTML pins one exact Three.js version', () => {
    const html = document.documentElement.outerHTML;
    return /three@0\.169\.0\/build\/three\.module\.js/.test(html) && !/three@latest/.test(html);
  });

  check('No duplicate element ids', () => {
    const ids = [...document.querySelectorAll('[id]')].map((node) => node.id);
    return new Set(ids).size === ids.length;
  });

  check('The wheel scene has a face, a hub and rim geometry', () => {
    if (!studio) return false;
    return studio.wheel.children.length >= 8 && studio.wheel.userData.count === state.roster.length;
  });

  check('Changing the roster repaints the wheel texture', () => {
    if (!studio) return false;
    const before = studio.faceVersion;
    studio.setRoster(state.roster, state.prefs.lang);
    return studio.faceVersion === before + 1;
  });

  check('localStorage survives a write/read round trip', () => {
    const key = 'ld3.selftest.v1';
    const value = { at: Date.now(), ok: true };
    if (!storage.write(key, value)) return false;
    const read = storage.read(key, null);
    storage.clear(key);
    return Boolean(read && read.ok === true);
  });

  check('History records keep the winner and roster size', () => {
    const record = state.history[0];
    if (!record) return true; // empty history is valid
    return (
      typeof record.winner === 'string' &&
      record.winner.length > 0 &&
      Number.isFinite(record.rosterSize)
    );
  });

  check('Spin button reflects the roster minimum', () => {
    const button = $('spin-btn');
    if (!button) return false;
    return state.roster.length < engine.MIN_ENTRIES ? button.disabled === true : true;
  });

  const passed = checks.filter((c) => c.ok).length;
  const total = checks.length;
  const summary = $('selftest-summary');
  const list = $('selftest-list');
  if (summary) {
    summary.textContent = t(passed === total ? 'selftest.pass' : 'selftest.fail', {
      passed,
      total,
      failed: total - passed,
    });
    summary.classList.toggle('is-pass', passed === total);
    summary.classList.toggle('is-fail', passed !== total);
  }
  if (list) {
    list.textContent = '';
    checks.forEach((entry) => {
      const item = document.createElement('li');
      item.classList.toggle('is-fail', !entry.ok);
      const label = document.createElement('span');
      label.textContent = entry.name;
      item.appendChild(label);
      list.appendChild(item);
    });
  }
  document.body.dataset.selftest = `${passed}/${total}`;
  return { passed, total, checks };
};

const openSelfTest = () => {
  const panel = $('selftest-panel');
  if (!panel) return;
  panel.hidden = false;
  runSelfTest();
};

/* ---- wiring ------------------------------------------------------------- */

const wire = () => {
  $('spin-btn').addEventListener('click', spin);
  $('lang-en').addEventListener('click', () => applyLanguage('en'));
  $('lang-th').addEventListener('click', () => applyLanguage('th'));
  $('sound-toggle').addEventListener('click', () => setSound(!state.prefs.sound, { announce: true }));
  $('sound-switch').addEventListener('change', (event) =>
    setSound(event.target.checked, { announce: true })
  );

  $('settings-toggle').addEventListener('click', () => {
    if ($('settings-drawer').classList.contains('is-open')) closeDrawer();
    else openDrawer();
  });
  $('settings-close').addEventListener('click', closeDrawer);
  $('help-toggle').addEventListener('click', openDrawer);
  $('drawer-scrim').addEventListener('click', () => {
    closeDrawer();
    closeSidebar();
  });

  $('sidebar-toggle').addEventListener('click', openSidebar);
  $('sidebar-close').addEventListener('click', closeSidebar);

  $('duration-range').addEventListener('input', (event) => {
    state.prefs.duration = clamp(Number(event.target.value) || DEFAULTS.duration, 3, 10);
    $('duration-value').textContent = formatSeconds(state.prefs.duration);
    persistPrefs();
  });
  $('turns-range').addEventListener('input', (event) => {
    state.prefs.turns = clamp(Math.round(Number(event.target.value)) || DEFAULTS.turns, 2, 14);
    $('turns-value').textContent = String(state.prefs.turns);
    persistPrefs();
  });
  $('auto-remove').addEventListener('change', (event) => {
    state.prefs.autoRemove = event.target.checked;
    persistPrefs();
  });
  $('settings-reset').addEventListener('click', () => {
    state.prefs = { ...DEFAULTS, lang: state.prefs.lang, sound: state.prefs.sound };
    setSound(state.prefs.sound);
    updateOutputs();
    persistPrefs();
    showToast(t('toast.reset'));
  });

  for (let i = 1; i <= 4; i += 1) {
    $(`slot-${i}`).addEventListener('input', () => {
      const entries = [1, 2, 3, 4].map((slot) => $(`slot-${slot}`).value);
      applyRoster(entries, { source: 'quick', announce: true });
    });
  }

  $('bulk-roster').addEventListener('input', (event) => {
    clearTimeout(bulkTimer);
    const value = event.target.value;
    bulkTimer = setTimeout(() => {
      applyRoster(value, { source: 'bulk', announce: true });
    }, 220);
  });

  document.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = PRESETS[button.dataset.preset];
      if (!preset) return;
      applyRoster(preset, { source: 'full' });
    });
  });

  $('clear-roster').addEventListener('click', () => {
    applyRoster([], { source: 'full' });
    showToast(t('toast.rosterCleared'));
  });

  $('roster-chips').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-index]');
    if (button) removeEntry(Number(button.dataset.index));
  });

  $('tab-roster').addEventListener('click', () => setTab('roster'));
  $('tab-history').addEventListener('click', () => setTab('history'));

  $('clear-history').addEventListener('click', clearHistory);
  $('export-json').addEventListener('click', () => exportRecords('json'));
  $('export-csv').addEventListener('click', () => exportRecords('csv'));

  $('winner-remove').addEventListener('click', () => {
    const record = state.lastWinner;
    if (record && !record.removed) {
      removeWinnerFromRoster(record);
      showToast(t('toast.removed', { name: record.winner }));
    }
    closeWinner();
  });
  $('winner-keep').addEventListener('click', closeWinner);
  $('winner-close').addEventListener('click', closeWinner);
  document.querySelectorAll('[data-close-modal]').forEach((node) => {
    node.addEventListener('click', closeWinner);
  });

  $('selftest-close').addEventListener('click', () => {
    $('selftest-panel').hidden = true;
  });

  document.addEventListener('keydown', (event) => {
    const tag = event.target?.tagName;
    const typing =
      tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target?.isContentEditable;

    if (event.key === 'Escape') {
      if ($('selftest-panel') && !$('selftest-panel').hidden) {
        $('selftest-panel').hidden = true;
        return;
      }
      if (!$('winner-modal').hidden) {
        closeWinner();
        return;
      }
      closeDrawer();
      closeSidebar();
      return;
    }

    if (typing || tag === 'BUTTON') return;
    if (event.code === 'Space') {
      event.preventDefault();
      if (!$('winner-modal').hidden) closeWinner();
      else spin();
    } else if (event.key.toLowerCase() === 'l') {
      toggleLanguage();
    } else if (event.key.toLowerCase() === 's') {
      setSound(!state.prefs.sound, { announce: true });
    }
  });
};

/* ==========================================================================
   6. Boot
   ========================================================================== */

const boot = async () => {
  load();
  wire();

  try {
    studio = createStudio($('stage-canvas'), engine);
    document.body.dataset.webgl = 'true';
  } catch (error) {
    document.body.dataset.webgl = 'false';
    const holder = $('stage-canvas');
    if (holder) {
      const message = document.createElement('p');
      message.className = 'panel-note';
      message.style.cssText =
        'position:absolute;inset:auto 20px 30% 20px;text-align:center;font-size:13px;';
      message.textContent = t('webgl.error');
      holder.appendChild(message);
    }
    console.error('[lucky-draw] WebGL unavailable', error);
  }

  if (studio) {
    studio.setRoster(state.roster, state.prefs.lang);
    studio.wheel.rotation.z = engine.rotationForIndex(0, Math.max(1, state.roster.length));
  }

  applyLanguage(state.prefs.lang, { silent: true });
  setSound(state.prefs.sound);
  syncRosterInputs();
  renderChips();
  renderHistory();
  updateCounters();
  updateSpinState();
  updateOutputs();
  setTab('roster');

  if (typeof document.fonts?.ready?.then === 'function') {
    document.fonts.ready.catch(() => {});
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      $('loading')?.classList.add('is-done');
      document.body.dataset.ready = 'true';
    });
  });

  const params = new URLSearchParams(window.location.search);
  if (params.has('selftest') || window.location.hash === '#selftest') {
    setTimeout(openSelfTest, 350);
  }

  window.__luckyDraw = {
    engine,
    state,
    get studio() {
      return studio;
    },
    applyRoster,
    applyLanguage,
    setLanguage: applyLanguage,
    setSound,
    spin,
    exportRecords,
    removeWinnerFromRoster,
    clearHistory,
    runSelfTest,
    openSelfTest,
    PRESETS,
    startedAt: new Date(sessionStart).toISOString(),
  };

  console.info(
    `%cLucky Draw Studio %c3D wheel ready · engine ${engine.VERSION}`,
    'color:#f5c76b;font-weight:700',
    'color:#8e9bb0'
  );
};

boot();
