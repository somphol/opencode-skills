/* ==========================================================================
   Vintage Wurlitzer 3D Lullaby Jukebox & Sleep Studio
   Vanilla ES module. Three.js is pinned through the import map in index.html.

   Sections
   1. I18N dictionary (marker-delimited; extracted by the Node tests)
   2. Pure engine (marker-delimited; no DOM, window, THREE or Date)
   3. Track catalogue (8 procedural lullabies)
   4. Audio graph (synth sequencer, archive stream, ambient generators, timer)
   5. Three.js cabinet, bubble tubes, record deck and post-processing
   6. UI wiring, persistence, self-test and bootstrap
   ========================================================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* I18N:START */
const I18N = {
  en: {
    skipToSongs: 'Skip to the song rack',
    brandKicker: 'Est. 1946 · Dream Division',
    appSubtitle: '3D Sleep Studio · Model 1015 Bubbler',
    rackEyebrow: 'Paper title strips',
    rackTitle: 'The Song Rack',
    favoritesOnly: 'Favorites',
    insertQuarter: 'Insert quarter',
    credits: 'Credits',
    keypadHint: 'Press a letter A–K, then a number — just like the real thing.',
    nowPlaying: 'Now playing',
    dragHint: 'Drag to orbit · scroll to zoom · click a strip to play',
    studioEyebrow: 'Late-night controls',
    studioTitle: 'Sleep Studio',
    engineReady: 'Engine',
    masterVolume: 'Master',
    bass: 'Bass',
    treble: 'Treble',
    ambientMix: 'Mix',
    ambientTitle: 'Ambient layers',
    ambientNote: 'Independent generators',
    ambientRain: 'Soft rainfall',
    ambientOcean: 'Gentle waves',
    ambientCrickets: 'Night crickets',
    sleepTimer: 'Sleep timer',
    timerIdle: 'Off',
    timerOff: 'Off',
    timerNote: 'Fades to silence over the final two minutes, then dims the lights.',
    exportSettings: 'Export settings JSON',
    resetSettings: 'Reset',
    footerCredit: 'Vanilla JS · Three.js · Web Audio',
    songsTab: 'Songs',
    studioTab: 'Studio',
    helpEyebrow: 'The nickel tour',
    helpTitle: 'How to play the bubbler',
    helpStep1Title: 'Pick a strip.',
    helpStep1Body: 'Click any paper title strip in the rack, or press a letter A–K then a number on the chrome keypad. A-1 through G-2 are synthesized music-box lullabies. H-1 through K-8 are real, public-domain archive performances across four collections.',
    helpStep2Title: 'Feed the machine.',
    helpStep2Body: 'Free Play is on by default. Turn it off and the jukebox needs a quarter for each selection; the coin drops into the slot in 3D.',
    helpStep3Title: 'Shape the night.',
    helpStep3Body: 'Turn the four chrome knobs for master volume, bass, treble and ambient mix. Blend rain, waves and crickets underneath the music.',
    helpStep4Title: 'Set the timer.',
    helpStep4Body: 'Choose 15, 30 or 60 minutes. The last two minutes fade smoothly to silence, then the cabinet lights go dark.',
    helpKeyPlay: 'play / pause',
    helpKeyTrack: 'previous / next',
    helpKeyLang: 'EN / ไทย',
    helpKeyTimer: 'cycle timer',
    helpFoot: 'Everything runs in your browser. Settings stay in localStorage; nothing is uploaded.',
    close: 'Close',
    freePlay: 'Free Play',
    coinMode: 'Coin Mode',
    mute: 'Mute',
    unmute: 'Unmute',
    play: 'Play',
    pause: 'Pause',
    prev: 'Previous track',
    next: 'Next track',
    stop: 'Stop',
    statusReady: 'Ready when you are.',
    statusLoading: 'Warming the tubes…',
    statusPlaying: 'Playing',
    statusPaused: 'Paused',
    statusStopped: 'Stopped. The cabinet is still glowing.',
    statusTimerEnded: 'Sleep timer complete. Goodnight.',
    statusStreamError: 'That archive stream could not be reached. Try a synth track.',
    statusManifestError: 'The archive manifest was unavailable. Synth tracks still work.',
    statusNoCredits: 'The coin slot is empty. Insert a quarter or switch to Free Play.',
    statusCoin: 'Quarter inserted. Pick a record.',
    statusEmptySlot: 'That slot is empty. Try another letter and number.',
    statusFavAdded: 'Saved to favorites.',
    statusFavRemoved: 'Removed from favorites.',
    statusExported: 'Settings exported as JSON.',
    statusReset: 'Settings reset to factory defaults.',
    statusBlocked: 'The browser blocked audio until you tap or click.',
    timerRemaining: 'Sleep in',
    timerEnded: 'Lights down',
    favorites: 'Favorites',
    allTracks: 'All records',
    noFavorites: 'No favorites yet. Tap a star on any title strip.',
    emptySlot: 'EMPTY',
    reserved: 'Reserved',
    engineSynth: 'SYNTH',
    engineStream: '78 RPM',
    trackUnavailable: 'Unavailable',
    toastFavOn: 'Star added.',
    toastFavOff: 'Star removed.',
    toastQuarter: 'Clink. One credit added.',
    toastNoCredits: 'Insert a quarter first.',
    toastEmpty: 'No record in that slot.',
    toastStreamError: 'Archive stream unavailable — try a synth lullaby.',
    toastManifest: 'Archive manifest offline. The eight synth lullabies still play.',
    toastReset: 'Factory settings restored.',
    toastExported: 'Jukebox settings saved to your downloads.',
    toastTimer: 'Sleep timer set for {n} minutes.',
    toastTimerOff: 'Sleep timer cancelled.',
    toastSleep: 'Sweet dreams. The jukebox is cooling down.',
    toastResume: 'Restored your saved jukebox settings.',
    toastMuted: 'Sound muted.',
    toastUnmuted: 'Sound restored.',
    loadingWarm: 'Warming the tubes…',
    loadingLights: 'Polishing the chrome…',
    loadingRecords: 'Dropping the needle…',
    loadingReady: 'Ready for a quarter.',
    ariaPlay: 'Play',
    ariaPause: 'Pause',
    ariaClose: 'Close',
    selftestTitle: 'In-page self-test',
    selftestRunning: 'Running diagnostics…',
    selftestDone: 'checks passed',
    favoriteAdd: 'Add to favorites',
    favoriteRemove: 'Remove from favorites',
    language: 'Language',
    collectionLabel: 'Collection',
    searchLabel: 'Search',
    searchPlaceholder: 'Search titles or artists',
    allRecords: 'All',
    recordsCount: '{n} records',
    resultsCount: '{n} results',
    noResults: 'No records match that search.',
    synthTracks: 'synth lullabies',
    archiveTracks: 'archive streams',
    collectionAll: 'Every record',
    themeLabel: 'Theme',
    textSizeLabel: 'Text size',
    themeMidnight: 'Midnight',
    themeAmber: 'Amber Lounge',
    themeEmerald: 'Emerald Club',
    themeRose: 'Rose Salon',
    startPlaylist: 'Start the first-listen playlist',
    firstListen: 'First-listen',
    sourceLink: 'Source',
    sourceCommons: 'Wikimedia Commons',
    licensePublicDomain: 'Public domain',
    licenseOriginal: 'Original composition',
    licenseMelody: 'Public-domain melody',
    textNormal: 'Normal text',
    textLarge: 'Large text',
    textXLarge: 'Extra-large text',
    manifestCredit: 'Archive audio',
    statusLoadingTrack: 'Fetching the archive stream…',
  },
  th: {
    skipToSongs: 'ข้ามไปที่ชั้นเพลง',
    brandKicker: 'ก่อตั้งปี 1946 · แผนกความฝัน',
    appSubtitle: 'สตูดิโอหลับ 3 มิติ · รุ่น 1015 บับเบิล',
    rackEyebrow: 'แถบชื่อเพลงกระดาษ',
    rackTitle: 'ชั้นเพลง',
    favoritesOnly: 'รายการโปรด',
    insertQuarter: 'หยอดเหรียญ 25 เซนต์',
    credits: 'เครดิต',
    keypadHint: 'กดตัวอักษร A–K แล้วกดตัวเลข — เหมือนเครื่องจริง',
    nowPlaying: 'กำลังเล่น',
    dragHint: 'ลากเพื่อหมุน · เลื่อนเพื่อซูม · คลิกแถบเพลงเพื่อเล่น',
    studioEyebrow: 'ปุ่มควบคุมยามดึก',
    studioTitle: 'สตูดิโอหลับ',
    engineReady: 'เอนจิน',
    masterVolume: 'เสียงหลัก',
    bass: 'เบส',
    treble: 'แหลม',
    ambientMix: 'ผสมเสียง',
    ambientTitle: 'เสียงบรรยากาศ',
    ambientNote: 'ตัวสร้างเสียงแยกอิสระ',
    ambientRain: 'ฝนโปรยเบา ๆ',
    ambientOcean: 'คลื่นทะเลแผ่ว',
    ambientCrickets: 'จิ้งหรีดกลางคืน',
    sleepTimer: 'ตัวจับเวลาเข้านอน',
    timerIdle: 'ปิด',
    timerOff: 'ปิด',
    timerNote: 'ค่อย ๆ เบาลงจนเงียบในสองนาทีสุดท้าย แล้วหรี่ไฟตู้เพลง',
    exportSettings: 'ส่งออกการตั้งค่า JSON',
    resetSettings: 'รีเซ็ต',
    footerCredit: 'วานิลลา JS · Three.js · Web Audio',
    songsTab: 'เพลง',
    studioTab: 'สตูดิโอ',
    helpEyebrow: 'ทัวร์สั้น ๆ',
    helpTitle: 'วิธีเล่นตู้เพลงบับเบิล',
    helpStep1Title: 'เลือกแถบเพลง',
    helpStep1Body: 'คลิกแถบชื่อเพลงในชั้น หรือกดตัวอักษร A–K แล้วตัวเลขบนแป้นโครเมียม A-1 ถึง G-2 เป็นเพลงกล่อมสังเคราะห์ ส่วน H-1 ถึง K-8 เป็นการแสดงจริงจากคลังที่เป็นสาธารณสมบัติ',
    helpStep2Title: 'หยอดเหรียญ',
    helpStep2Body: 'โหมดเล่นฟรีเปิดอยู่โดยค่าเริ่มต้น ถ้าปิด จะต้องหยอดเหรียญทุกครั้งที่เลือกเพลง และเหรียญจะร่วงลงช่องในฉาก 3 มิติ',
    helpStep3Title: 'ปรับบรรยากาศ',
    helpStep3Body: 'หมุนปุ่มโครเมียมสี่ปุ่มสำหรับเสียงหลัก เบส แหลม และสัดส่วนเสียงบรรยากาศ ผสมฝน คลื่น และจิ้งหรีดใต้เสียงเพลง',
    helpStep4Title: 'ตั้งเวลาหลับ',
    helpStep4Body: 'เลือก 15, 30 หรือ 60 นาที สองนาทีสุดท้ายจะค่อย ๆ เบาลงจนเงียบ แล้วไฟตู้จะดับ',
    helpKeyPlay: 'เล่น / หยุด',
    helpKeyTrack: 'เพลงก่อนหน้า / ถัดไป',
    helpKeyLang: 'EN / ไทย',
    helpKeyTimer: 'สลับตัวจับเวลา',
    helpFoot: 'ทุกอย่างทำงานในเบราว์เซอร์ของคุณ การตั้งค่าเก็บใน localStorage ไม่มีการอัปโหลด',
    close: 'ปิด',
    freePlay: 'เล่นฟรี',
    coinMode: 'โหมดเหรียญ',
    mute: 'ปิดเสียง',
    unmute: 'เปิดเสียง',
    play: 'เล่น',
    pause: 'หยุดชั่วคราว',
    prev: 'เพลงก่อนหน้า',
    next: 'เพลงถัดไป',
    stop: 'หยุด',
    statusReady: 'พร้อมเมื่อคุณพร้อม',
    statusLoading: 'กำลังอุ่นหลอดไฟ…',
    statusPlaying: 'กำลังเล่น',
    statusPaused: 'หยุดชั่วคราว',
    statusStopped: 'หยุดแล้ว ตู้ยังเปล่งแสงอยู่',
    statusTimerEnded: 'หมดเวลาเข้านอน ราตรีสวัสดิ์',
    statusStreamError: 'เข้าถึงเสียงคลังเก่าไม่ได้ ลองเพลงสังเคราะห์',
    statusManifestError: 'ไม่พบรายการเสียงคลังเก่า เพลงสังเคราะห์ยังเล่นได้',
    statusNoCredits: 'ช่องเหรียญว่าง หยอดเหรียญหรือเปิดโหมดเล่นฟรี',
    statusCoin: 'หยอดเหรียญแล้ว เลือกแผ่นเสียงได้',
    statusEmptySlot: 'ช่องนี้ว่าง ลองตัวอักษรและตัวเลขอื่น',
    statusFavAdded: 'บันทึกในรายการโปรดแล้ว',
    statusFavRemoved: 'นำออกจากรายการโปรดแล้ว',
    statusExported: 'ส่งออกการตั้งค่าเป็น JSON แล้ว',
    statusReset: 'คืนค่าจากโรงงานแล้ว',
    statusBlocked: 'เบราว์เซอร์บล็อกเสียงจนกว่าจะแตะหรือคลิก',
    timerRemaining: 'หลับในอีก',
    timerEnded: 'หรี่ไฟ',
    favorites: 'รายการโปรด',
    allTracks: 'แผ่นเสียงทั้งหมด',
    noFavorites: 'ยังไม่มีรายการโปรด แตะดาวบนแถบเพลง',
    emptySlot: 'ว่าง',
    reserved: 'สงวนไว้',
    engineSynth: 'สังเคราะห์',
    engineStream: '78 RPM',
    trackUnavailable: 'ใช้ไม่ได้',
    toastFavOn: 'เพิ่มดาวแล้ว',
    toastFavOff: 'เอาดาวออกแล้ว',
    toastQuarter: 'กริ๊ง! เพิ่มหนึ่งเครดิต',
    toastNoCredits: 'กรุณาหยอดเหรียญก่อน',
    toastEmpty: 'ไม่มีแผ่นเสียงในช่องนี้',
    toastStreamError: 'เสียงคลังเก่าใช้ไม่ได้ — ลองเพลงสังเคราะห์',
    toastManifest: 'รายการคลังเก่าออฟไลน์ เพลงสังเคราะห์ทั้งแปดยังเล่นได้',
    toastReset: 'คืนค่าจากโรงงานแล้ว',
    toastExported: 'บันทึกการตั้งค่าตู้เพลงลงเครื่องแล้ว',
    toastTimer: 'ตั้งเวลาหลับ {n} นาทีแล้ว',
    toastTimerOff: 'ยกเลิกเวลาหลับแล้ว',
    toastSleep: 'ฝันดีนะ ตู้เพลงกำลังcool down',
    toastResume: 'คืนค่าการตั้งค่าที่บันทึกไว้แล้ว',
    toastMuted: 'ปิดเสียงแล้ว',
    toastUnmuted: 'เปิดเสียงแล้ว',
    loadingWarm: 'กำลังอุ่นหลอดไฟ…',
    loadingLights: 'กำลังขัดโครเมียม…',
    loadingRecords: 'กำลังวางเข็ม…',
    loadingReady: 'พร้อมรับเหรียญ',
    ariaPlay: 'เล่น',
    ariaPause: 'หยุดชั่วคราว',
    ariaClose: 'ปิด',
    selftestTitle: 'ทดสอบในหน้า',
    selftestRunning: 'กำลังทดสอบ…',
    selftestDone: 'รายการผ่าน',
    favoriteAdd: 'เพิ่มในรายการโปรด',
    favoriteRemove: 'นำออกจากรายการโปรด',
    language: 'ภาษา',
    collectionLabel: 'คอลเลกชัน',
    searchLabel: 'ค้นหา',
    searchPlaceholder: 'ค้นหาชื่อเพลงหรือศิลปิน',
    allRecords: 'ทั้งหมด',
    recordsCount: '{n} แผ่น',
    resultsCount: '{n} ผลลัพธ์',
    noResults: 'ไม่พบแผ่นเสียงที่ตรงกัน',
    synthTracks: 'เพลงสังเคราะห์',
    archiveTracks: 'เสียงจากคลัง',
    collectionAll: 'ทุกคอลเลกชัน',
    themeLabel: 'ธีม',
    textSizeLabel: 'ขนาดตัวอักษร',
    themeMidnight: 'เที่ยงคืน',
    themeAmber: 'เลานจ์อำพัน',
    themeEmerald: 'คลับมรกต',
    themeRose: 'ซาลอนกุหลาบ',
    startPlaylist: 'เริ่มเพลย์ลิสต์ฟังแรก',
    firstListen: 'ฟังแรก',
    sourceLink: 'แหล่งที่มา',
    sourceCommons: 'วิกิมีเดียคอมมอนส์',
    licensePublicDomain: 'สาธารณสมบัติ',
    licenseOriginal: 'ผลงานต้นฉบับ',
    licenseMelody: 'ทำนองสาธารณสมบัติ',
    textNormal: 'ขนาดปกติ',
    textLarge: 'ขนาดใหญ่',
    textXLarge: 'ขนาดใหญ่มาก',
    manifestCredit: 'เสียงจากคลัง',
    statusLoadingTrack: 'กำลังโหลดเสียงจากคลัง…',
  },
};
/* I18N:END */

/* ENGINE:START */
const NOTE_INDEX = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)));

function noteToMidi(name) {
  const match = /^([A-G](?:#|b)?)(-?\d)$/.exec(String(name).trim());
  if (!match) throw new Error(`bad note: ${name}`);
  return (Number(match[2]) + 1) * 12 + NOTE_INDEX[match[1]];
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function parseSequence(text) {
  return String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const [name, beats] = token.split(':');
      const midi = noteToMidi(name);
      const length = Number(beats);
      if (!Number.isFinite(length) || length <= 0) throw new Error(`bad beat: ${token}`);
      return { name, midi, freq: midiToFreq(midi), beats: length };
    });
}

function sequenceBeats(sequence) {
  return sequence.reduce((sum, note) => sum + note.beats, 0);
}

function sequenceSeconds(sequence, bpm) {
  return (sequenceBeats(sequence) * 60) / bpm;
}

function noteAtBeat(sequence, beat) {
  let cursor = 0;
  for (let i = 0; i < sequence.length; i++) {
    cursor += sequence[i].beats;
    if (cursor > beat) return i;
  }
  return sequence.length - 1;
}

/** Smooth 1 → 0 fade across the final `fade` seconds of a timer. */
function fadeGain(remainingSeconds, fade = 120) {
  if (!Number.isFinite(remainingSeconds)) return 1;
  if (remainingSeconds >= fade) return 1;
  if (remainingSeconds <= 0) return 0;
  const x = remainingSeconds / fade;
  return x * x * (3 - 2 * x);
}

function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const SLOT_ORDER = [
  ...['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].flatMap((letter) => [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `${letter}-${n}`)),
];

function slotOf(letter, number) {
  const L = String(letter).toUpperCase();
  const N = Number(number);
  if (!/^[A-K]$/.test(L) || !Number.isInteger(N) || N < 1 || N > 8) return null;
  return `${L}-${N}`;
}

function slotParts(slot) {
  const match = /^([A-K])-([1-8])$/.exec(String(slot));
  return match ? { letter: match[1], number: Number(match[2]) } : null;
}

function slotOrder(slot) {
  const parts = slotParts(slot);
  if (!parts) return 999;
  return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].indexOf(parts.letter) * 8 + (parts.number - 1);
}

function buildRack(builtins = [], externals = []) {
  const bySlot = new Map();
  for (const track of [...builtins, ...externals]) {
    if (track && track.slot) bySlot.set(track.slot, track);
  }
  return SLOT_ORDER.map((slot) => ({ slot, track: bySlot.get(slot) || null }));
}

const DEFAULT_SETTINGS = Object.freeze({
  version: 1,
  lang: 'en',
  freePlay: true,
  credits: 5,
  master: 82,
  bass: 2,
  treble: 1,
  mix: 45,
  ambient: Object.freeze({ rain: 0, ocean: 0, crickets: 0 }),
  timer: 0,
  lastTrack: 'brahms',
  favorites: Object.freeze([]),
  muted: false,
  theme: 'midnight',
  fontSize: 'normal',
});

function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const ambient = source.ambient && typeof source.ambient === 'object' ? source.ambient : {};
  const favorites = Array.isArray(source.favorites)
    ? [...new Set(source.favorites.filter((id) => typeof id === 'string' && id.length <= 64))]
    : [];
  return {
    version: 1,
    lang: source.lang === 'th' ? 'th' : 'en',
    freePlay: source.freePlay !== false,
    credits: Math.round(clamp(source.credits ?? 5, 0, 99)),
    master: Math.round(clamp(source.master ?? 82, 0, 100)),
    bass: Math.round(clamp(source.bass ?? 2, -10, 10)),
    treble: Math.round(clamp(source.treble ?? 1, -10, 10)),
    mix: Math.round(clamp(source.mix ?? 45, 0, 100)),
    ambient: {
      rain: Math.round(clamp(ambient.rain ?? 0, 0, 100)),
      ocean: Math.round(clamp(ambient.ocean ?? 0, 0, 100)),
      crickets: Math.round(clamp(ambient.crickets ?? 0, 0, 100)),
    },
    timer: [0, 15, 30, 60].includes(Number(source.timer)) ? Number(source.timer) : 0,
    lastTrack: typeof source.lastTrack === 'string' ? source.lastTrack.slice(0, 64) : 'brahms',
    favorites,
    muted: source.muted === true,
    theme: ['midnight', 'amber', 'emerald', 'rose'].includes(source.theme) ? source.theme : 'midnight',
    fontSize: ['normal', 'large', 'xlarge'].includes(source.fontSize) ? source.fontSize : 'normal',
  };
}

function validateManifest(data) {
  const errors = [];
  if (!data || typeof data !== 'object' || !Array.isArray(data.tracks)) {
    return { ok: false, tracks: [], errors: ['manifest.tracks must be an array'] };
  }
  const seen = new Set();
  const tracks = [];
  for (const [index, raw] of data.tracks.entries()) {
    if (!raw || typeof raw !== 'object') { errors.push(`track ${index} is not an object`); continue; }
    const slot = String(raw.slot || '').toUpperCase();
    if (!/^[C-K]-[1-8]$/.test(slot)) { errors.push(`track ${index} has an invalid slot`); continue; }
    if (seen.has(slot)) { errors.push(`duplicate slot ${slot}`); continue; }
    if (typeof raw.url !== 'string' || !/^https:\/\//.test(raw.url)) { errors.push(`track ${slot} needs an https URL`); continue; }
    if (typeof raw.title !== 'string' || !raw.title.trim()) { errors.push(`track ${slot} needs a title`); continue; }
    seen.add(slot);
    tracks.push({
      id: String(raw.id || `stream-${slot.toLowerCase()}`).slice(0, 64),
      slot,
      engine: 'stream',
      collection: slot[0],
      title: { en: raw.title.trim().slice(0, 80), th: String(raw.titleTh || raw.title).trim().slice(0, 80) },
      artist: { en: String(raw.artist || 'Archive recording').slice(0, 80), th: String(raw.artistTh || raw.artist || 'บันทึกจากคลัง').slice(0, 80) },
      url: raw.url,
      duration: Number(raw.duration) || 0,
      license: String(raw.license || '').slice(0, 120),
      credit: String(raw.credit || '').slice(0, 80),
      source: typeof raw.source === 'string' ? raw.source : '',
      accent: /^#[0-9a-f]{6}$/i.test(raw.accent || '') ? raw.accent : '#d9a441',
    });
  }
  tracks.sort((a, b) => slotOrder(a.slot) - slotOrder(b.slot));
  return { ok: tracks.length > 0, tracks, errors };
}

function nextTrackId(tracks, currentId, direction = 1) {
  if (!tracks.length) return null;
  const index = tracks.findIndex((track) => track.id === currentId);
  const start = index < 0 ? (direction > 0 ? -1 : 0) : index;
  return tracks[(start + direction + tracks.length * 4) % tracks.length].id;
}

function exportPayload(settings, tracks, isoTimestamp) {
  return {
    app: 'Vintage Wurlitzer 3D Lullaby Jukebox & Sleep Studio',
    schema: 1,
    exportedAt: String(isoTimestamp || ''),
    settings,
    tracks: tracks.map((track) => ({
      id: track.id, slot: track.slot, engine: track.engine, title: track.title.en,
      rights: track.rights || '', license: track.license || '', source: track.source || '',
    })),
  };
}
/* ENGINE:END */

/* ------------------------------------------------------------------ */
/* Track catalogue                                                     */
/* ------------------------------------------------------------------ */

/* TRACKS:START */
const COLLECTIONS = [
  { letter: 'A', en: 'Lullabies', th: 'เพลงกล่อม' },
  { letter: 'B', en: 'Music Box', th: 'กล่องดนตรี' },
  { letter: 'C', en: 'Classical', th: 'คลาสสิก' },
  { letter: 'D', en: 'Folk & World', th: 'พื้นบ้าน' },
  { letter: 'E', en: 'Dreams I', th: 'ฝัน I' },
  { letter: 'F', en: 'Dreams II', th: 'ฝัน II' },
  { letter: 'G', en: 'Bonus', th: 'โบนัส' },
  { letter: 'H', en: 'Piano', th: 'เปียโน' },
  { letter: 'I', en: 'Nocturnes', th: 'น็อกเทิร์น' },
  { letter: 'J', en: 'Romantic', th: 'โรแมนติก' },
  { letter: 'K', en: '78s', th: '78 รอบ' },
];

const THEMES = [
  { id: 'midnight', en: 'Midnight', th: 'เที่ยงคืน', bg: 0x05070d, fog: 0x05070d, bulb: 0xffa83e, rose: 0xe0748f, teal: 0x5ec9c0 },
  { id: 'amber', en: 'Amber Lounge', th: 'เลานจ์อำพัน', bg: 0x0a0704, fog: 0x0a0704, bulb: 0xffb35c, rose: 0xe09a6a, teal: 0xd8b06a },
  { id: 'emerald', en: 'Emerald Club', th: 'คลับมรกต', bg: 0x030a08, fog: 0x030a08, bulb: 0xd8c987, rose: 0x7fd3a8, teal: 0x4fc9a8 },
  { id: 'rose', en: 'Rose Salon', th: 'ซาลอนกุหลาบ', bg: 0x0b0508, fog: 0x0b0508, bulb: 0xffc3a8, rose: 0xe88fa1, teal: 0xd8a6c7 },
];

const FIRST_RUN_KEY = 'wurlitzer-lullaby-studio:visited';
const DEFAULT_QUEUE = [
  'archive-h3', 'archive-h4',
  ...['h1', 'h2', 'h5', 'h6', 'h7', 'h8'].map((slot) => `archive-${slot}`),
  ...['i', 'j', 'k'].flatMap((letter) => [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `archive-${letter}${n}`)),
];

const T = (id, slot, en, th, artist, artistTh, bpm, wave, notes, accent = '#e6c07b') => ({
  id, slot, engine: 'synth', collection: slot[0], bpm, wave, gain: 0.48, accent,
  rights: artist === 'Wurlitzer Dream Division' ? 'original' : 'public-domain',
  title: { en, th }, artist: { en: artist, th: artistTh }, notes,
});

const BUILTIN_TRACKS = [
  // A — Classic Lullabies
  T('brahms', 'A-1', "Brahms' Lullaby", 'เพลงกล่อมของบราห์มส์', 'Johannes Brahms', 'โยฮันเนส บราห์มส์', 66, 'triangle', 'G4:2 G4:1 B4:3 G4:2 G4:1 B4:3 G4:2 B4:1 E5:3 D5:2 C5:1 B4:3 A4:2 A4:1 C5:3 A4:2 A4:1 C5:3 A4:2 C5:1 F5:3 E5:2 D5:1 C5:3 G4:2 G4:1 B4:3 G4:2 G4:1 B4:3 G4:2 B4:1 E5:3 D5:2 C5:1 B4:3 A4:2 A4:1 C5:3 A4:2 A4:1 C5:3 A4:2 C5:1 F5:3 E5:2 D5:1 C5:3', '#e6c07b'),
  T('twinkle', 'A-2', 'Twinkle, Twinkle, Little Star', 'ดาวน้อยดวงน้อย', 'Traditional', 'เพลงพื้นบ้าน', 72, 'sine', 'C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2', '#9ac8e8'),
  T('mozart', 'A-3', "Mozart's Cradle Song", 'เพลงกล่อมของโมสาร์ท', 'Wolfgang A. Mozart (attr.)', 'โวล์ฟกัง อมาเดอุส โมสาร์ท', 64, 'triangle', 'F4:2 F4:1 A4:3 C5:2 C5:1 A4:3 G4:2 Bb4:1 D5:3 C5:2 Bb4:1 A4:3 G4:2 F4:1 G4:3 A4:2 Bb4:1 C5:3 F4:2 F4:1 A4:3 C5:2 C5:1 A4:3 G4:2 Bb4:1 D5:3 C5:2 Bb4:1 A4:3 G4:2 F4:1 E4:3 F4:3', '#d8a6c7'),
  T('schubert', 'A-4', "Schubert's Lullaby", 'เพลงกล่อมของชูเบิร์ต', 'Franz Schubert', 'ฟรันทซ์ ชูเบิร์ต', 60, 'sine', 'Eb4:2 G4:2 Bb4:2 G4:2 Eb4:2 F4:1 G4:1 Ab4:4 G4:2 Eb4:2 C4:2 Eb4:2 F4:2 G4:1 Ab4:1 Bb4:4 Eb4:2 G4:2 Bb4:2 G4:2 Eb4:2 F4:1 G4:1 Ab4:2 G4:2 F4:2 Eb4:4', '#b6c99a'),
  T('rockabye', 'A-5', 'Rock-a-bye Baby', 'หลับตานะหนูน้อย', 'Traditional', 'เพลงพื้นบ้าน', 58, 'triangle', 'G4:2 E4:2 E4:2 G4:2 E4:2 E4:2 D4:2 E4:1 F4:3 D4:2 C4:4 G4:2 E4:2 E4:2 G4:2 E4:2 E4:2 D4:2 E4:1 F4:3 D4:2 C4:4', '#e0a184'),
  T('hush', 'A-6', 'Hush, Little Baby', 'เงียบเถอะที่รัก', 'Traditional', 'เพลงพื้นบ้าน', 68, 'triangle', 'G4:2 G4:1 E4:3 G4:2 G4:1 E4:3 D4:2 D4:1 E4:2 D4:1 C4:2 A3:2 G4:2 G4:1 E4:3 G4:2 G4:1 E4:3 D4:2 E4:1 G4:2 E4:1 D4:2 C4:2', '#c7a6d8'),
  T('frere', 'A-7', 'Frère Jacques (Sleep)', 'ฟแอร์ฌัก (ฉบับกล่อม)', 'Traditional French', 'เพลงพื้นบ้านฝรั่งเศส', 54, 'sine', 'C4:2 D4:2 E4:2 C4:2 C4:2 D4:2 E4:2 C4:2 E4:2 F4:2 G4:4 E4:2 F4:2 G4:4 G4:1 A4:1 G4:1 F4:1 E4:2 C4:2 G4:1 A4:1 G4:1 F4:1 E4:2 C4:2 C4:2 G3:2 C4:4 C4:2 G3:2 C4:4', '#8fd0c8'),
  T('golden', 'A-8', 'Golden Slumbers', 'ราตรีทอง', 'Traditional English', 'เพลงพื้นบ้านอังกฤษ', 62, 'triangle', 'C4:2 C4:1 E4:3 G4:2 E4:1 C4:3 D4:2 E4:1 F4:3 D4:2 B3:2 C4:4 E4:2 G4:1 A4:3 G4:2 E4:1 D4:3 C4:2 D4:1 E4:3 D4:2 C4:2 C4:4', '#e6c07b'),

  // B — Music Box Sessions
  T('all-through', 'B-1', 'All Through the Night', 'ตลอดทั้งคืน', 'Welsh Traditional', 'เพลงพื้นบ้านเวลส์', 60, 'triangle', 'G4:2 G4:1 A4:1 Bb4:2 G4:2 Eb4:2 G4:2 F4:1 Eb4:1 D4:2 C4:2 D4:2 Eb4:2 F4:2 G4:2 A4:2 Bb4:3 G4:1 Bb4:2 A4:2 G4:2 F4:2 Eb4:2 D4:2 C4:2 C4:4', '#8fb8d8'),
  T('au-clair', 'B-2', 'Au Clair de la Lune', 'แสงจันทร์', 'French Traditional', 'เพลงพื้นบ้านฝรั่งเศส', 66, 'sine', 'C4:2 C4:2 C4:2 D4:2 E4:4 D4:4 C4:2 C4:2 C4:2 D4:2 E4:4 D4:4 E4:2 F4:2 G4:2 G4:2 F4:2 E4:2 D4:4 C4:2 C4:2 C4:2 D4:2 E4:4 D4:4', '#d8c48f'),
  T('sleep-baby', 'B-3', 'Sleep, Baby, Sleep', 'หลับเถอะหนูน้อย', 'German Traditional', 'เพลงพื้นบ้านเยอรมัน', 58, 'triangle', 'F4:2 F4:2 Ab4:3 F4:1 C4:2 C4:2 Db4:2 C4:2 Bb3:3 F4:1 Eb4:2 F4:2 G4:2 Ab4:2 Bb4:2 G4:2 F4:4', '#c9a6d8'),
  T('bye-bunting', 'B-4', 'Bye, Baby Bunting', 'บายเบบี้บันติ้ง', 'English Traditional', 'เพลงพื้นบ้านอังกฤษ', 64, 'triangle', 'G4:2 E4:2 G4:2 A4:2 G4:2 E4:2 D4:4 E4:2 G4:2 A4:2 B4:2 A4:2 G4:2 E4:4 D4:2 E4:2 G4:2 E4:2 D4:2 C4:2 C4:4', '#e0b48f'),
  T('pretty-horses', 'B-5', 'All the Pretty Little Horses', 'ม้าขาวน้อย', 'American Traditional', 'เพลงพื้นบ้านอเมริกัน', 60, 'sine', 'E4:2 E4:1 G4:1 A4:2 G4:1 E4:1 D4:2 E4:2 G4:2 A4:2 G4:4 E4:2 E4:1 G4:1 A4:2 G4:1 E4:1 D4:2 E4:2 G4:2 E4:2 D4:4 C4:4', '#a6c9a1'),
  T('sweet-low', 'B-6', 'Sweet and Low', 'ไพเราะและแผ่วเบา', 'Joseph Barnby', 'โจเซฟ บาร์นบี', 62, 'triangle', 'G4:2 A4:2 B4:2 A4:2 G4:2 E4:2 D4:4 G4:2 A4:2 B4:2 C5:2 B4:2 A4:2 G4:4 E4:2 G4:2 A4:2 G4:2 E4:2 D4:2 C4:4', '#e6c07b'),
  T('grieg-cradle', 'B-7', 'Cradle Song', 'เพลงกล่อมของกรีก', 'Edvard Grieg', 'เอ็ดเวิร์ด กรีก', 60, 'sine', 'A4:2 A4:2 C5:3 B4:1 A4:2 G4:2 E4:4 F4:2 G4:2 A4:2 G4:2 F4:2 E4:2 D4:4 A4:2 A4:2 C5:3 B4:1 A4:2 G4:2 E4:4 D4:2 E4:2 F4:2 G4:2 A4:2 G4:2 A4:4', '#a1c9c2'),
  T('schlummerlied', 'B-8', 'Schlummerlied', 'เพลงกล่อมแห่งความฝัน', 'Robert Schumann', 'โรเบิร์ต ชูมันน์', 58, 'triangle', 'E4:2 G4:2 B4:3 A4:1 G4:2 E4:2 D4:4 E4:2 G4:2 B4:2 C5:2 B4:2 A4:2 G4:4 F4:2 E4:2 D4:2 E4:2 F4:2 G4:2 E4:4', '#d8b48f'),

  // C — Classical Evening
  T('ode-joy', 'C-1', 'Ode to Joy', 'บทเพลงแห่งความยินดี', 'Ludwig van Beethoven', 'ลุดวิจ ฟาน เบโทเฟน', 64, 'triangle', 'E4:2 E4:2 F4:2 G4:2 G4:2 F4:2 E4:2 D4:2 C4:2 C4:2 D4:2 E4:2 E4:3 D4:1 D4:4 E4:2 E4:2 F4:2 G4:2 G4:2 F4:2 E4:2 D4:2 C4:2 C4:2 D4:2 E4:2 D4:3 C4:1 C4:4', '#e6c07b'),
  T('fur-elise', 'C-2', 'Für Elise', 'เฟือร์เอลีเซ', 'Ludwig van Beethoven', 'ลุดวิจ ฟาน เบโทเฟน', 58, 'sine', 'E5:1 D#5:1 E5:1 D#5:1 E5:1 B4:1 D5:1 C5:1 A4:3 C4:1 E4:1 A4:1 B4:3 E4:1 G#4:1 B4:1 C5:3 E4:1 E5:1 D#5:1 E5:1 D#5:1 E5:1 B4:1 D5:1 C5:1 A4:3', '#c9a6d8'),
  T('moonlight', 'C-3', 'Moonlight Sonata', 'ซอนาตาแสงจันทร์', 'Ludwig van Beethoven', 'ลุดวิจ ฟาน เบโทเฟน', 52, 'sine', 'C#4:1 G#4:1 C#5:1 E5:1 C#5:1 G#4:1 C#4:1 G#4:1 C#5:1 E5:1 C#5:1 G#4:1 A4:1 E4:1 A4:1 C#5:1 A4:1 E4:1 A4:1 C#5:1 A4:1 E4:1 A4:1 C#5:1 D4:1 A4:1 D5:1 F#5:1 D5:1 A4:1 D4:1 A4:1 D5:1 F#5:1 D5:1 A4:1 G#4:1 E4:1 G#4:1 B4:1 G#4:1 E4:1 G#4:1 B4:1 G#4:1 E4:1 G#4:1 B4:1', '#8f9fd8'),
  T('kleine-nacht', 'C-4', 'Eine kleine Nachtmusik', 'เซเรนาเดน้อย', 'Wolfgang A. Mozart', 'โวล์ฟกัง อมาเดอุส โมสาร์ท', 62, 'triangle', 'C5:2 D5:2 E5:2 G5:2 E5:2 D5:2 C5:4 A4:2 C5:2 F5:2 E5:2 D5:2 C5:2 B4:4 C5:2 D5:2 E5:2 G5:2 E5:2 D5:2 C5:4', '#e0c48f'),
  T('canon-d', 'C-5', 'Canon in D', 'แคนอนในบันไดเสียง D', 'Johann Pachelbel', 'โยฮันน์ พาเชลเบล', 56, 'sine', 'F#5:2 E5:2 D5:2 C#5:2 B4:2 A4:2 B4:2 C#5:2 D5:2 C#5:2 B4:2 A4:2 G4:2 F#4:2 E4:2 D4:2 F#5:2 E5:2 D5:2 C#5:2 B4:2 A4:2 B4:2 C#5:2 D5:2 C#5:2 B4:2 A4:2 G4:2 F#4:2 E4:4', '#a6c9a1'),
  T('air-g', 'C-6', 'Air on the G String', 'อาเรียบนสาย G', 'J.S. Bach', 'โยฮันน์ เซบาสเตียน บาค', 52, 'triangle', 'C5:3 B4:1 A4:3 G4:1 F4:2 E4:2 D4:2 C4:2 D4:2 E4:2 F4:2 G4:2 A4:2 B4:2 C5:2 A4:4 G4:3 F4:1 E4:3 D4:1 C4:2 D4:2 E4:2 F4:2 G4:2 A4:2 G4:2 F4:2 E4:2 D4:2 C4:4', '#9ac8e8'),
  T('clair-de-lune', 'C-7', 'Clair de Lune', 'แสงจันทร์', 'Claude Debussy', 'โคลด เดอบุสซี', 54, 'sine', 'F#5:2 G#5:2 A5:2 C#6:2 B5:2 A5:2 G#5:2 F#5:2 E5:2 F#5:2 G#5:2 A5:2 B5:2 C#6:2 B5:2 A5:4', '#b6a6d8'),
  T('gymnopedie', 'C-8', 'Gymnopédie No. 1', 'ยิมโนเปดี หมายเลข 1', 'Erik Satie', 'เอริก ซาตี', 50, 'sine', 'G3:2 B3:2 D4:2 F#4:2 A4:4 G4:2 F#4:2 D4:2 B3:2 C4:2 E4:2 G4:2 B4:2 A4:4 G4:2 F#4:2 D4:2 B3:2 G3:4', '#c9b8a1'),

  // D — Folk & World
  T('sakura', 'D-1', 'Sakura Sakura', 'ซากุระ ซากุระ', 'Japanese Traditional', 'เพลงพื้นบ้านญี่ปุ่น', 62, 'sine', 'A4:2 A4:2 B4:2 A4:2 A4:2 B4:2 A4:4 B4:2 A4:2 B4:2 C5:2 B4:2 A4:2 B4:4 A4:2 A4:2 B4:2 A4:2 A4:2 B4:2 A4:4', '#e0a6b8'),
  T('arirang', 'D-2', 'Arirang', 'อารีรัง', 'Korean Traditional', 'เพลงพื้นบ้านเกาหลี', 58, 'triangle', 'G4:3 A4:1 G4:2 E4:2 G4:2 A4:2 G4:2 E4:2 D4:2 E4:2 G4:2 A4:2 C5:2 A4:2 G4:4 E4:2 G4:2 A4:2 G4:2 E4:2 D4:2 E4:2 G4:2 E4:2 D4:2 C4:4', '#a6c9d8'),
  T('mo-li-hua', 'D-3', 'Mo Li Hua', 'ดอกไม้หอม', 'Chinese Traditional', 'เพลงพื้นบ้านจีน', 60, 'sine', 'E4:2 E4:2 G4:2 A4:2 C5:2 A4:2 G4:4 E4:2 G4:2 A4:2 C5:2 D5:2 C5:2 A4:4 G4:2 A4:2 C5:2 A4:2 G4:2 E4:2 D4:4 C4:4', '#e6c9a1'),
  T('greensleeves', 'D-4', 'Greensleeves', 'กรีนสลีฟส์', 'English Traditional', 'เพลงพื้นบ้านอังกฤษ', 56, 'triangle', 'A4:2 C5:2 D5:2 E5:3 F5:1 E5:2 D5:2 B4:2 G4:2 A4:2 B4:2 C5:2 A4:2 A4:4 G4:2 A4:2 B4:2 C5:2 D5:2 E5:2 F5:2 E5:4 D5:2 B4:2 G4:2 A4:2 B4:2 C5:2 A4:4', '#a1c9a6'),
  T('scarborough', 'D-5', 'Scarborough Fair', 'สการ์เบอโรแฟร์', 'English Traditional', 'เพลงพื้นบ้านอังกฤษ', 58, 'sine', 'A4:2 A4:2 E5:2 E5:2 B4:2 C5:2 B4:2 A4:2 G4:2 A4:2 B4:2 C5:2 A4:2 A4:2 G4:4 A4:2 A4:2 E5:2 E5:2 B4:2 C5:2 B4:2 A4:2 G4:2 A4:2 B4:2 C5:2 A4:2 G4:2 A4:4', '#c9b8a1'),
  T('danny-boy', 'D-6', 'Danny Boy', 'แดนนีบอย', 'Irish Traditional', 'เพลงพื้นบ้านไอริช', 54, 'triangle', 'F4:2 G4:2 A4:2 Bb4:2 C5:2 D5:2 C5:2 Bb4:2 A4:2 G4:2 F4:2 G4:2 A4:4 G4:2 F4:2 E4:2 F4:2 G4:2 A4:2 Bb4:4 A4:2 G4:2 F4:2 E4:2 D4:2 D4:4', '#b6c99a'),
  T('loch-lomond', 'D-7', 'Loch Lomond', 'ล็อกโลมอนด์', 'Scottish Traditional', 'เพลงพื้นบ้านสก็อต', 60, 'triangle', 'C4:2 C4:2 C4:2 E4:2 G4:2 G4:2 A4:2 G4:2 E4:2 C4:2 D4:2 E4:2 G4:4 E4:2 D4:2 C4:2 D4:2 E4:2 G4:2 A4:2 G4:2 E4:2 D4:2 C4:2 D4:2 C4:4', '#8fb8d8'),
  T('skye-boat', 'D-8', 'The Skye Boat Song', 'เพลงเรือสกาย', 'Scottish Traditional', 'เพลงพื้นบ้านสก็อต', 56, 'sine', 'G4:2 G4:2 A4:2 B4:2 D5:2 B4:2 A4:2 G4:2 E4:2 G4:2 A4:2 B4:2 A4:2 G4:2 E4:4 D4:2 E4:2 G4:2 A4:2 B4:2 D5:2 B4:4 A4:2 G4:2 E4:2 D4:2 E4:2 G4:2 E4:4', '#a6c9d8'),

  // E — Dream Originals I
  T('velvet-moon', 'E-1', 'Velvet Moon', 'ดวงจันทร์กำมะหยี่', 'Wurlitzer Dream Division', 'แผนกความฝัน', 62, 'triangle', 'C5:2 Eb5:2 G5:2 F5:2 Eb5:2 C5:2 Bb4:4 C5:2 Eb5:2 F5:2 G5:2 F5:2 Eb5:2 C5:4 Ab4:2 C5:2 Eb5:2 F5:2 Eb5:2 C5:2 Bb4:4', '#d8a6c7'),
  T('paper-lanterns', 'E-2', 'Paper Lanterns', 'โคมกระดาษ', 'Wurlitzer Dream Division', 'แผนกความฝัน', 66, 'sine', 'D5:2 F5:2 A5:2 G5:2 F5:2 D5:2 C5:4 D5:2 F5:2 G5:2 A5:2 G5:2 F5:2 D5:4 C5:2 D5:2 F5:2 G5:2 F5:2 D5:2 C5:4', '#e6c07b'),
  T('cloud-atlas', 'E-3', 'Cloud Atlas', 'แผนที่เมฆ', 'Wurlitzer Dream Division', 'แผนกความฝัน', 58, 'triangle', 'G4:2 B4:2 D5:2 F#5:2 E5:2 D5:2 B4:4 A4:2 C5:2 E5:2 G5:2 F#5:2 E5:2 D5:4 G4:2 B4:2 D5:2 E5:2 D5:2 B4:2 G4:4', '#8fb8d8'),
  T('amber-tide', 'E-4', 'Amber Tide', 'น้ำขึ้นสีอำพัน', 'Wurlitzer Dream Division', 'แผนกความฝัน', 60, 'sine', 'A4:2 C5:2 E5:2 D5:2 C5:2 A4:2 G4:4 A4:2 C5:2 D5:2 E5:2 D5:2 C5:2 A4:4 G4:2 A4:2 C5:2 E5:2 D5:2 C5:2 A4:4', '#e0a184'),
  T('starlit-waltz', 'E-5', 'Starlit Waltz', 'วอลซ์ใต้ดาว', 'Wurlitzer Dream Division', 'แผนกความฝัน', 64, 'triangle', 'F4:2 A4:2 C5:2 D5:2 C5:2 A4:2 F4:4 G4:2 Bb4:2 D5:2 F5:2 E5:2 D5:2 C5:4 F4:2 A4:2 C5:2 D5:2 C5:2 A4:2 F4:4', '#c9a6d8'),
  T('lavender-dusk', 'E-6', 'Lavender Dusk', 'พลบค่ำลาเวนเดอร์', 'Wurlitzer Dream Division', 'แผนกความฝัน', 58, 'sine', 'E4:2 G4:2 B4:2 D5:2 B4:2 G4:2 E4:4 F4:2 A4:2 C5:2 E5:2 D5:2 C5:2 A4:4 E4:2 G4:2 B4:2 D5:2 B4:2 G4:2 E4:4', '#b6a6d8'),
  T('little-comet', 'E-7', 'Little Comet', 'ดาวหางดวงน้อย', 'Wurlitzer Dream Division', 'แผนกความฝัน', 72, 'triangle', 'C5:1 E5:1 G5:1 E5:1 C5:1 E5:1 G5:1 E5:1 D5:1 F5:1 A5:1 F5:1 D5:1 F5:1 A5:1 F5:1 E5:1 G5:1 B5:1 G5:1 E5:1 G5:1 B5:1 G5:1 C5:1 E5:1 G5:1 E5:1 C5:2 G4:2', '#9ac8e8'),
  T('midnight-tea', 'E-8', 'Midnight Tea', 'ชามิดไนต์', 'Wurlitzer Dream Division', 'แผนกความฝัน', 60, 'sine', 'G4:2 C5:2 E5:2 G5:2 F5:2 E5:2 C5:4 D5:2 F5:2 A5:2 G5:2 F5:2 D5:2 B4:4 C5:2 E5:2 G5:2 F5:2 E5:2 C5:2 G4:4', '#e6c9a1'),

  // F — Dream Originals II
  T('snowfall', 'F-1', 'Snowfall Adagio', 'อาดาจโชหิมะ', 'Wurlitzer Dream Division', 'แผนกความฝัน', 52, 'sine', 'D4:2 F4:2 A4:2 C5:2 Bb4:2 A4:2 F4:4 G4:2 Bb4:2 D5:2 F5:2 E5:2 D5:2 C5:4 D4:2 F4:2 A4:2 C5:2 Bb4:2 A4:2 D4:4', '#a6c9d8'),
  T('willow', 'F-2', 'Willow Lullaby', 'เพลงกล่อมต้นหลิว', 'Wurlitzer Dream Division', 'แผนกความฝัน', 56, 'triangle', 'A3:2 C4:2 E4:2 G4:2 F4:2 E4:2 C4:4 D4:2 F4:2 A4:2 C5:2 B4:2 A4:2 G4:4 A3:2 C4:2 E4:2 G4:2 F4:2 E4:2 C4:4', '#a1c9a6'),
  T('harbor', 'F-3', 'Harbor Lights', 'แสงท่าเรือ', 'Wurlitzer Dream Division', 'แผนกความฝัน', 58, 'sine', 'F4:2 A4:2 C5:2 E5:2 D5:2 C5:2 A4:4 Bb4:2 D5:2 F5:2 A5:2 G5:2 F5:2 E5:4 F4:2 A4:2 C5:2 E5:2 D5:2 C5:2 F4:4', '#e0c48f'),
  T('satin-sky', 'F-4', 'Satin Sky', 'ท้องฟ้าซาติน', 'Wurlitzer Dream Division', 'แผนกความฝัน', 60, 'triangle', 'Bb4:2 D5:2 F5:2 Eb5:2 D5:2 Bb4:2 G4:4 A4:2 C5:2 Eb5:2 G5:2 F5:2 Eb5:2 C5:4 Bb4:2 D5:2 F5:2 Eb5:2 D5:2 Bb4:2 F4:4', '#d8a6c7'),
  T('carousel', 'F-5', 'Quiet Carousel', 'ม้าหมุนเงียบ', 'Wurlitzer Dream Division', 'แผนกความฝัน', 66, 'triangle', 'C5:2 D5:2 E5:2 G5:2 E5:2 D5:2 C5:4 A4:2 B4:2 C5:2 E5:2 D5:2 C5:2 B4:4 C5:2 D5:2 E5:2 G5:2 E5:2 D5:2 C5:4', '#8fb8d8'),
  T('glass-garden', 'F-6', 'Glass Garden', 'สวนแก้ว', 'Wurlitzer Dream Division', 'แผนกความฝัน', 62, 'sine', 'E5:2 G5:2 B5:2 A5:2 G5:2 E5:2 D5:4 C5:2 E5:2 G5:2 B5:2 A5:2 G5:2 E5:4 D5:2 F#5:2 A5:2 G5:2 F#5:2 D5:2 B4:4', '#9ac8e8'),
  T('sleepwalking', 'F-7', 'Sleepwalking', 'เดินละเมอ', 'Wurlitzer Dream Division', 'แผนกความฝัน', 54, 'sine', 'D4:2 A4:2 D5:2 F5:2 E5:2 D5:2 A4:4 C5:2 E5:2 G5:2 F5:2 E5:2 C5:2 A4:4 D4:2 A4:2 D5:2 F5:2 E5:2 D5:2 D4:4', '#b6a6d8'),
  T('first-light', 'F-8', 'First Light', 'แสงแรก', 'Wurlitzer Dream Division', 'แผนกความฝัน', 60, 'triangle', 'G4:2 B4:2 D5:2 G5:2 F#5:2 D5:2 B4:4 C5:2 E5:2 G5:2 B5:2 A5:2 G5:2 E5:4 D5:2 B4:2 G4:4 D5:2 B4:2 G4:4', '#e6c07b'),

  // G — Bonus
  T('amazing-grace', 'G-1', 'Amazing Grace', 'อเมซิ่งเกรซ', 'John Newton', 'จอห์น นิวตัน', 58, 'sine', 'G4:2 C5:1 E5:2 D5:1 C5:2 E5:2 G5:4 E5:2 C5:2 D5:2 E5:2 C5:2 A4:4 G4:2 C5:1 E5:2 D5:1 C5:2 E5:2 G5:4 E5:2 G5:2 F5:2 E5:2 D5:2 C5:4', '#a1c9c2'),
  T('salley-gardens', 'G-2', 'Down by the Salley Gardens', 'ใต้ต้นหลิวที่ซอลลีย์', 'Irish Traditional', 'เพลงพื้นบ้านไอริช', 56, 'triangle', 'D4:2 F4:2 A4:2 G4:2 F4:2 E4:2 D4:4 F4:2 A4:2 C5:2 Bb4:2 A4:2 G4:2 F4:4 E4:2 G4:2 A4:2 G4:2 F4:2 E4:2 D4:4', '#b6c99a'),
];

for (const track of BUILTIN_TRACKS) {
  track.sequence = parseSequence(track.notes);
  track.duration = sequenceSeconds(track.sequence, track.bpm);
}
/* TRACKS:END */

/* ------------------------------------------------------------------ */
/* Small DOM / storage helpers                                         */
/* ------------------------------------------------------------------ */

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'wurlitzer-lullaby-studio:v1';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function loadSettings(tracks) {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    const settings = normalizeSettings(raw);
    if (raw && !('favorites' in raw)) settings.favorites = tracks.slice(0, 1).map((t) => t.id);
    return settings;
  } catch {
    return normalizeSettings(null);
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

function showToast(message, tone = 'info') {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle('is-warn', tone === 'warn');
  toast.classList.add('is-visible');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

function setStatus(message, tone = 'idle') {
  const text = $('status-text');
  const led = $('status-led');
  if (text) text.textContent = message;
  if (led) {
    led.classList.toggle('is-live', tone === 'live');
    led.classList.toggle('is-warn', tone === 'warn');
  }
}

function safeVibrate(pattern) {
  // Chrome logs a console error when vibrate is called without user activation.
  if (!navigator.vibrate || navigator.userActivation?.isActive === false) return;
  try { navigator.vibrate(pattern); } catch { /* ignore */ }
}

/* ------------------------------------------------------------------ */
/* Keyboard / clack / coin synthesis (tiny UI sounds, separate context) */
/* ------------------------------------------------------------------ */

class MechanicalSounds {
  constructor() {
    this.ctx = null;
    this.volume = 0.16;
  }

  ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  noise(duration = 0.03, freq = 2400) {
    const ctx = this.ensure();
    if (!ctx) return;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 1.4;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
  }

  clack() {
    this.noise(0.035, 2600);
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(190, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.045);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.45, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  thunk() {
    this.noise(0.09, 700);
  }

  coin() {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    [1568, 2093, 2637].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now + i * 0.035);
      gain.gain.exponentialRampToValueAtTime(this.volume * 0.55, now + i * 0.035 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.035 + 0.24);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.035);
      osc.stop(now + i * 0.035 + 0.26);
    });
  }
}

/* ------------------------------------------------------------------ */
/* Audio engine                                                        */
/* ------------------------------------------------------------------ */

class JukeboxAudio {
  constructor(store, hooks = {}) {
    this.store = store;
    this.hooks = hooks;
    this.ctx = null;
    this.graph = null;
    this.tracks = [];
    this.current = null;
    this.status = 'idle';
    this.timer = { minutes: 0, endsAt: 0, active: false, fade: 1, ended: false };
    this.ambientState = { rain: 0, ocean: 0, crickets: 0 };
    this.ambientStarted = new Set();
    this.synth = null;
    this.stream = null;
    this.analyser = null;
    this.level = 0;
    this._timerInterval = null;
    this._clockInterval = null;
  }

  setTracks(tracks) { this.tracks = tracks; }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return this.ctx;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    this.ctx = new Ctx({ latencyHint: 'interactive' });
    this.buildGraph();
    return this.ctx;
  }

  buildGraph() {
    const ctx = this.ctx;
    const master = ctx.createGain();
    const timerGain = ctx.createGain();
    const bass = ctx.createBiquadFilter();
    const treble = ctx.createBiquadFilter();
    const compressor = ctx.createDynamicsCompressor();
    const analyser = ctx.createAnalyser();

    master.gain.value = this.store.master / 100;
    timerGain.gain.value = 1;
    bass.type = 'lowshelf';
    bass.frequency.value = 240;
    bass.gain.value = this.store.bass;
    treble.type = 'highshelf';
    treble.frequency.value = 4200;
    treble.gain.value = this.store.treble;
    compressor.threshold.value = -20;
    compressor.knee.value = 24;
    compressor.ratio.value = 3.5;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.3;
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;

    const musicBus = ctx.createGain();
    musicBus.gain.value = this.store.muted ? 0 : 1;
    const ambientBus = ctx.createGain();
    ambientBus.gain.value = this.store.muted ? 0 : 0.08 + (this.store.mix / 100) * 0.72;

    const reverb = ctx.createConvolver();
    reverb.buffer = this.makeImpulse(2.9, 2.6);
    const reverbSend = ctx.createGain();
    reverbSend.gain.value = 0.22;

    musicBus.connect(bass);
    reverbSend.connect(reverb).connect(bass);
    ambientBus.connect(bass);
    bass.connect(treble).connect(compressor).connect(master).connect(timerGain).connect(analyser);
    analyser.connect(ctx.destination);

    this.graph = { master, timerGain, bass, treble, compressor, analyser, musicBus, ambientBus, reverb, reverbSend };
    this.analyser = analyser;
    this.buildAmbient();
  }

  makeImpulse(seconds, decay) {
    const ctx = this.ctx;
    const rate = ctx.sampleRate;
    const length = Math.max(1, Math.floor(rate * seconds));
    const buffer = ctx.createBuffer(2, length, rate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  }

  noiseBuffer(color = 'white', seconds = 3) {
    const ctx = this.ctx;
    const rate = ctx.sampleRate;
    const buffer = ctx.createBuffer(2, Math.floor(rate * seconds), rate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        if (color === 'brown') {
          last = (last + 0.02 * white) / 1.02;
          data[i] = last * 3.2;
        } else if (color === 'pink') {
          last = 0.985 * last + 0.015 * white;
          data[i] = last * 2.4 + white * 0.35;
        } else {
          data[i] = white;
        }
      }
    }
    return buffer;
  }

  buildAmbient() {
    const ctx = this.ctx;
    const graph = this.graph;
    const layers = {};

    const makeLayer = (name, color, filterType, frequency, q, initialGain) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer(color, 4);
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.value = frequency;
      filter.Q.value = q;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      src.connect(filter).connect(gain).connect(graph.ambientBus);
      layers[name] = { src, filter, gain, started: false, target: initialGain };
    };

    makeLayer('rain', 'white', 'highpass', 900, 0.6, 0);
    makeLayer('ocean', 'brown', 'lowpass', 420, 0.7, 0);
    makeLayer('crickets', 'pink', 'bandpass', 4200, 2.4, 0);

    // Slow surf swell on the ocean bed. The LFO lives on a separate swell
    // stage so a zero layer gain is truly silent.
    const oceanSwell = ctx.createGain();
    oceanSwell.gain.value = 1;
    layers.ocean.gain.disconnect();
    layers.ocean.gain.connect(oceanSwell).connect(graph.ambientBus);
    const oceanLfo = ctx.createOscillator();
    oceanLfo.frequency.value = 0.085;
    const oceanDepth = ctx.createGain();
    oceanDepth.gain.value = 0.28;
    oceanLfo.connect(oceanDepth).connect(oceanSwell.gain);
    oceanLfo.start();

    // Rain droplets: tiny filtered pings scheduled at random.
    const droplet = () => {
      if (this.ambientState.rain <= 0) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 1200 + Math.random() * 2400;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.014 * (this.ambientState.rain / 100), now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      osc.connect(gain).connect(graph.ambientBus);
      osc.start(now);
      osc.stop(now + 0.1);
    };
    this._dropletInterval = setInterval(() => {
      if (this.ambientState.rain > 0) {
        droplet();
        if (Math.random() > 0.5) setTimeout(droplet, 60 + Math.random() * 180);
      }
    }, 420);

    // Crickets: short chirp bursts with a tremolo feel.
    this._cricketInterval = setInterval(() => {
      if (this.ambientState.crickets <= 0 || !this.ctx) return;
      const now = this.ctx.currentTime;
      const chirps = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < chirps; i++) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 4200 + Math.random() * 260;
        const gain = this.ctx.createGain();
        const at = now + i * 0.045;
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(0.006 * (this.ambientState.crickets / 100), at + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.032);
        osc.connect(gain).connect(graph.ambientBus);
        osc.start(at);
        osc.stop(at + 0.04);
      }
    }, 640);

    this.ambient = layers;
  }

  setAmbient(name, value) {
    const v = Math.round(clamp(value, 0, 100));
    this.ambientState[name] = v;
    this.store.ambient[name] = v;
    if (v > 0) {
      this.ensure();
      this.startAmbient(name);
    }
    const layer = this.ambient?.[name];
    if (layer && this.ctx) {
      layer.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      layer.gain.gain.setTargetAtTime((v / 100) * 0.55, this.ctx.currentTime, 0.35);
      layer.target = v / 100;
    }
    if (v === 0) this.stopAmbient(name);
  }

  startAmbient(name) {
    const layer = this.ambient?.[name];
    if (!layer || layer.started) return;
    try {
      layer.src.start();
      layer.started = true;
      this.ambientStarted.add(name);
    } catch { /* already started */ }
  }

  stopAmbient(name) {
    const layer = this.ambient?.[name];
    if (!layer || !this.ctx) return;
    layer.gain.gain.cancelScheduledValues(this.ctx.currentTime);
    layer.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
  }

  setMaster(value) {
    this.store.master = Math.round(clamp(value, 0, 100));
    if (this.graph) {
      const muted = this.store.muted ? 0 : 1;
      this.graph.master.gain.setTargetAtTime((this.store.master / 100) * muted, this.ctx.currentTime, 0.06);
    }
  }

  setMuted(muted) {
    this.store.muted = Boolean(muted);
    this.setMaster(this.store.master);
  }

  setEQ(kind, value) {
    const v = Math.round(clamp(value, -10, 10));
    this.store[kind] = v;
    if (this.graph && this.ctx) {
      const node = kind === 'bass' ? this.graph.bass : this.graph.treble;
      node.gain.setTargetAtTime(v, this.ctx.currentTime, 0.04);
    }
  }

  setMix(value) {
    this.store.mix = Math.round(clamp(value, 0, 100));
    if (this.graph && this.ctx) {
      const target = this.store.muted ? 0 : 0.08 + (this.store.mix / 100) * 0.72;
      this.graph.ambientBus.gain.setTargetAtTime(target, this.ctx.currentTime, 0.12);
    }
  }

  play(track) {
    const ctx = this.ensure();
    if (!ctx) {
      this.hooks.onBlocked?.();
      return false;
    }
    if (!track) return false;
    this.stopAllSources();
    this.current = track;
    this.timer.ended = false;
    if (this.graph) this.graph.timerGain.gain.setTargetAtTime(this.timer.active ? this.timer.fade : 1, ctx.currentTime, 0.1);
    if (track.engine === 'stream' && track.url) {
      this.playStream(track);
    } else {
      this.playSynth(track);
    }
    return true;
  }

  playSynth(track) {
    const ctx = this.ctx;
    const now = ctx.currentTime + 0.06;
    const state = {
      track,
      index: 0,
      nextTime: now,
      startedAt: now,
      pausedAt: 0,
      timer: null,
      playing: true,
    };
    this.synth = state;
    this.stream = null;
    this.status = 'playing';
    const schedule = () => {
      if (!this.synth || !this.synth.playing || this.ctx.state !== 'running') return;
      const lookahead = 0.28;
      while (this.synth.nextTime < this.ctx.currentTime + lookahead) {
        const note = track.sequence[this.synth.index % track.sequence.length];
        this.scheduleNote(note, this.synth.nextTime, track);
        this.synth.nextTime += (note.beats * 60) / track.bpm;
        this.synth.index = (this.synth.index + 1) % track.sequence.length;
      }
    };
    state.timer = setInterval(schedule, 35);
    schedule();
    this.startClock();
  }

  scheduleNote(note, at, track) {
    const ctx = this.ctx;
    const graph = this.graph;
    const duration = (note.beats * 60) / track.bpm;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(track.gain, at + 0.008);
    env.gain.exponentialRampToValueAtTime(track.gain * 0.35, at + Math.min(0.12, duration * 0.3));
    env.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(0.15, duration * 0.92));

    const osc = ctx.createOscillator();
    osc.type = track.wave;
    osc.frequency.value = note.freq;
    osc.connect(env);

    // Music-box sparkle: a quiet octave harmonic with a short pluck.
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = note.freq * 2;
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.setValueAtTime(0.0001, at);
    shimmerGain.gain.exponentialRampToValueAtTime(track.gain * 0.15, at + 0.006);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, at + Math.min(0.6, duration));
    shimmer.connect(shimmerGain).connect(env);

    env.connect(graph.musicBus);
    env.connect(graph.reverbSend);
    osc.start(at);
    osc.stop(at + duration + 0.1);
    shimmer.start(at);
    shimmer.stop(at + Math.min(0.7, duration) + 0.05);
  }

  playStream(track) {
    this.ensure();
    if (!this.stream) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      audio.addEventListener('ended', () => this.hooks.onEnded?.());
      audio.addEventListener('error', () => this.hooks.onStreamError?.(track));
      try {
        const source = this.ctx.createMediaElementSource(audio);
        source.connect(this.graph.musicBus);
        this.stream = { audio, source, track: null };
      } catch {
        this.stream = { audio, source: null, track: null };
      }
      this.buildAmbientIfNeeded();
    }
    this.synth = null;
    this.stream.track = track;
    this.stream.audio.src = track.url;
    this.status = 'loading';
    this.stream.audio.play().then(() => {
      this.status = 'playing';
      this.startClock();
      this.hooks.onState?.();
    }).catch(() => {
      this.status = 'error';
      this.hooks.onStreamError?.(track);
    });
  }

  buildAmbientIfNeeded() { /* ambient nodes are built with the graph */ }

  togglePause() {
    if (this.status === 'playing' || this.status === 'loading') {
      this.pause();
      return 'paused';
    }
    this.resume();
    return 'playing';
  }

  pause() {
    if (!this.ctx) return;
    if (this.synth) {
      this.synth.pausedAt = this.position();
      this.synth.playing = false;
      clearInterval(this.synth.timer);
    }
    if (this.stream) this.stream.audio.pause();
    if (this.graph) this.graph.musicBus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    this.status = 'paused';
    this.stopClock();
  }

  resume() {
    if (!this.current) return false;
    this.ensure();
    if (this.graph) this.graph.musicBus.gain.setTargetAtTime(1, this.ctx.currentTime, 0.08);
    if (this.current.engine === 'stream' && this.stream) {
      this.stream.audio.play().then(() => { this.status = 'playing'; this.startClock(); this.hooks.onState?.(); }).catch(() => {});
      return true;
    }
    if (this.current.engine === 'synth') {
      const track = this.current;
      const position = this.synth?.pausedAt || 0;
      const beat = Math.max(0, position) * (track.bpm / 60);
      this.playSynth(track);
      const state = this.synth;
      state.index = noteAtBeat(track.sequence, beat % sequenceBeats(track.sequence));
      state.startedAt = this.ctx.currentTime - position;
      state.nextTime = this.ctx.currentTime + 0.05;
      this.status = 'playing';
    }
    return true;
  }

  stop() {
    this.stopAllSources();
    this.status = 'stopped';
    this.stopClock();
  }

  stopAllSources() {
    if (this.synth) {
      clearInterval(this.synth.timer);
      this.synth = null;
    }
    if (this.stream) {
      try { this.stream.audio.pause(); } catch { /* ignore */ }
      this.stream.track = null;
    }
    if (this.graph && this.ctx) this.graph.musicBus.gain.setTargetAtTime(1, this.ctx.currentTime, 0.05);
  }

  position() {
    if (this.current?.engine === 'stream' && this.stream) return this.stream.audio.currentTime || 0;
    if (this.synth) {
      if (this.status === 'paused') return this.synth.pausedAt || 0;
      const elapsed = Math.max(0, this.ctx.currentTime - this.synth.startedAt);
      return elapsed;
    }
    return 0;
  }

  duration() {
    if (!this.current) return 0;
    if (this.current.engine === 'stream') return this.stream?.audio?.duration || this.current.duration || 0;
    return this.current.duration;
  }

  seek(fraction) {
    if (!this.current) return;
    const target = clamp(fraction, 0, 1) * this.duration();
    if (this.current.engine === 'stream' && this.stream) {
      try { this.stream.audio.currentTime = target; } catch { /* ignore */ }
      return;
    }
    const track = this.current;
    const beat = target * (track.bpm / 60);
    this.playSynth(track);
    this.synth.index = noteAtBeat(track.sequence, beat % sequenceBeats(track.sequence));
    this.synth.startedAt = this.ctx.currentTime - target;
    this.synth.nextTime = this.ctx.currentTime + 0.05;
    this.status = 'playing';
  }

  startClock() {
    this.stopClock();
    this._clockInterval = setInterval(() => {
      this.sampleLevel();
      this.hooks.onTick?.();
    }, 180);
  }

  stopClock() {
    clearInterval(this._clockInterval);
    this._clockInterval = null;
    this.hooks.onTick?.();
  }

  sampleLevel() {
    if (!this.analyser) return;
    const data = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    this.level += (Math.min(1, rms * 4) - this.level) * 0.25;
  }

  setTimer(minutes) {
    this.timer.minutes = [0, 15, 30, 60].includes(Number(minutes)) ? Number(minutes) : 0;
    this.store.timer = this.timer.minutes;
    this.timer.ended = false;
    if (this.timer.minutes === 0) {
      this.timer.active = false;
      this.timer.endsAt = 0;
      this.timer.fade = 1;
      if (this.graph && this.ctx) this.graph.timerGain.gain.setTargetAtTime(1, this.ctx.currentTime, 0.3);
      this.stopTimerLoop();
      this.hooks.onTimer?.();
      return;
    }
    this.ensure();
    this.timer.active = true;
    this.timer.endsAt = Date.now() + this.timer.minutes * 60000;
    this.timer.fade = 1;
    this.startTimerLoop();
    this.hooks.onTimer?.();
  }

  startTimerLoop() {
    this.stopTimerLoop();
    this._timerInterval = setInterval(() => this.tickTimer(), 250);
    this.tickTimer();
  }

  stopTimerLoop() {
    clearInterval(this._timerInterval);
    this._timerInterval = null;
  }

  tickTimer() {
    if (!this.timer.active) return;
    const remaining = Math.max(0, (this.timer.endsAt - Date.now()) / 1000);
    this.timer.fade = fadeGain(remaining);
    if (this.graph && this.ctx) {
      this.graph.timerGain.gain.setTargetAtTime(this.timer.fade, this.ctx.currentTime, 0.12);
    }
    if (remaining <= 0) {
      this.timer.active = false;
      this.timer.ended = true;
      this.stopAllSources();
      if (this.graph && this.ctx) this.graph.musicBus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
      this.status = 'stopped';
      this.stopTimerLoop();
      this.hooks.onTimerEnd?.();
    }
    this.hooks.onTimer?.();
  }

  getTimerState() {
    return {
      minutes: this.timer.minutes,
      active: this.timer.active,
      ended: this.timer.ended,
      remaining: this.timer.active ? Math.max(0, (this.timer.endsAt - Date.now()) / 1000) : 0,
      gain: this.timer.fade,
    };
  }

  /** Test/debug hook: move the timer clock without waiting. */
  debugSetRemaining(seconds) {
    this.ensure();
    this.timer.active = true;
    this.timer.ended = false;
    this.timer.endsAt = Date.now() + Math.max(0, seconds) * 1000;
    this.tickTimer();
    return this.getTimerState();
  }
}

/* ------------------------------------------------------------------ */
/* Three.js scene                                                      */
/* ------------------------------------------------------------------ */

class WurlitzerScene {
  constructor(container, hooks = {}) {
    this.container = container;
    this.hooks = hooks;
    this.clock = new THREE.Clock();
    this.playing = false;
    this.energy = 0;
    this.dim = 0;
    this.dimTarget = 0;
    this.coinAnim = null;
    this.trackBySlot = new Map();
    this.lang = 'en';
    this.reduced = reduceMotion.matches;
    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.interactive = [];
    this.bubbles = [];
    this.bulbs = [];
    this.colorTubes = [];
    this.pressed = new Map();
    this.pointerStart = null;
    this.hovered = null;
    this.intro = null;
    this.time = 0;

    this.initRenderer();
    this.initScene();
    this.buildEnvironment();
    this.buildCabinet();
    this.bindEvents();
    this.resize();
    this.animate();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.82;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05070d);
    this.scene.fog = new THREE.FogExp2(0x05070d, 0.021);
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 80);
    this.camera.position.set(0, 4.3, 15.5);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 2.55, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.055;
    this.controls.enablePan = false;
    this.controls.minDistance = 6.2;
    this.controls.maxDistance = 15;
    this.controls.minPolarAngle = 1.02;
    this.controls.maxPolarAngle = 1.62;
    this.controls.minAzimuthAngle = -0.62;
    this.controls.maxAzimuthAngle = 0.62;
    this.controls.rotateSpeed = 0.62;
    this.controls.zoomSpeed = 0.7;
    this.controls.addEventListener('start', () => { this.intro = null; });

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envMap;
    pmrem.dispose();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 0.58, 0.9);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    if (!this.reduced) {
      const mobile = window.innerWidth < 720;
      this.intro = {
        t: 0,
        from: new THREE.Vector3(0.2, 4.6, mobile ? 17.5 : 15.8),
        to: new THREE.Vector3(0, 3.3, mobile ? 13.4 : 10.6),
      };
      this.camera.position.copy(this.intro.from);
    } else {
      this.camera.position.set(0, 3.3, 10.6);
    }
  }

  /* ---------- textures ---------- */

  makeWoodTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, '#3a2015');
    grad.addColorStop(0.28, '#5a3220');
    grad.addColorStop(0.52, '#432517');
    grad.addColorStop(0.76, '#633823');
    grad.addColorStop(1, '#391f14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 130; i++) {
      const x = Math.random() * 512;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${Math.random() > 0.5 ? '20,10,6' : '120,72,44'},${0.04 + Math.random() * 0.11})`;
      ctx.lineWidth = 0.5 + Math.random() * 2.4;
      ctx.moveTo(x, 0);
      for (let y = 0; y <= 512; y += 24) {
        const sway = Math.sin((y / 512) * Math.PI * (1.5 + Math.random())) * 7 + (Math.random() - 0.5) * 4;
        ctx.lineTo(x + sway, y);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 7; i++) {
      const x = 40 + Math.random() * 432;
      const y = 40 + Math.random() * 432;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);
      for (let r = 2; r < 15; r += 2.2) {
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.8, r * 0.55, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(22,11,6,${0.14 - r * 0.006})`;
        ctx.stroke();
      }
      ctx.restore();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  makeBackdropTexture() {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0a101c');
    grad.addColorStop(0.48, '#101320');
    grad.addColorStop(0.78, '#171221');
    grad.addColorStop(1, '#070a10');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Art-deco sunburst behind the cabinet.
    ctx.save();
    ctx.translate(512, 330);
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 800, Math.sin(angle) * 800);
      ctx.strokeStyle = `rgba(230,192,123,${i % 3 === 0 ? 0.045 : 0.018})`;
      ctx.lineWidth = i % 3 === 0 ? 2 : 1;
      ctx.stroke();
    }
    ctx.restore();

    for (let i = 0; i < 90; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 320;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1.4 + 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,210,180,${0.05 + Math.random() * 0.18})`;
      ctx.fill();
    }
    for (let i = 0; i < 14; i++) {
      const x = Math.random() * 1024;
      ctx.beginPath();
      ctx.moveTo(x, 380);
      ctx.lineTo(x, 512);
      ctx.strokeStyle = 'rgba(230,192,123,0.035)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  makeSignTexture() {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 1024, 256);
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, 'rgba(20,15,12,0.96)');
    grad.addColorStop(0.5, 'rgba(34,22,15,0.96)');
    grad.addColorStop(1, 'rgba(14,10,8,0.96)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = 'rgba(230,192,123,0.75)';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 1004, 236);
    ctx.strokeStyle = 'rgba(230,192,123,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, 980, 212);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f3d89b';
    ctx.font = '600 82px "Iowan Old Style", Palatino, Georgia, serif';
    ctx.fillText('WURLITZER', 512, 122);
    ctx.fillStyle = 'rgba(230,192,123,0.8)';
    ctx.font = '600 25px "Avenir Next", system-ui, sans-serif';
    ctx.fillText('L U L L A B Y   S T U D I O', 512, 178);
    ctx.fillStyle = 'rgba(230,192,123,0.5)';
    ctx.font = '16px "Avenir Next", system-ui, sans-serif';
    ctx.fillText('MODEL 1015 · BUBBLER · 45 RPM', 512, 214);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  makePaperTexture(track, slot, lang) {
    const c = document.createElement('canvas');
    c.width = 600; c.height = 110;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 110);
    grad.addColorStop(0, '#f0e3ca');
    grad.addColorStop(0.55, '#e8d7b8');
    grad.addColorStop(1, '#d9c39f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 110);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(90,64,36,${Math.random() * 0.03})`;
      ctx.fillRect(0, Math.random() * 110, 600, 1);
    }
    ctx.strokeStyle = 'rgba(88,60,32,0.22)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 598, 108);

    ctx.strokeStyle = 'rgba(88,60,32,0.28)';
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(94, 12);
    ctx.lineTo(94, 98);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#8e3b22';
    ctx.font = '700 30px "SFMono-Regular", Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(slot, 47, 52);
    ctx.fillStyle = 'rgba(80,52,28,0.55)';
    ctx.font = '700 9px "Avenir Next", system-ui, sans-serif';
    ctx.fillText(track ? (track.engine === 'stream' ? 'ARCHIVE' : 'SYNTH') : 'EMPTY', 47, 72);

    ctx.textAlign = 'left';
    if (track) {
      const title = track.title[lang] || track.title.en;
      const artist = track.artist[lang] || track.artist.en;
      ctx.fillStyle = '#322417';
      ctx.font = `${lang === 'th' ? '600 22px "Noto Sans Thai", "Thonburi", sans-serif' : '700 23px "Iowan Old Style", Palatino, Georgia, serif'}`;
      ctx.fillText(title.length > 34 ? `${title.slice(0, 32)}…` : title, 112, 46);
      ctx.fillStyle = 'rgba(66,46,27,0.7)';
      ctx.font = `${lang === 'th' ? '11px "Noto Sans Thai", sans-serif' : '11px "Avenir Next", system-ui, sans-serif'}`;
      ctx.fillText(artist.length > 54 ? `${artist.slice(0, 52)}…` : artist, 112, 70);
      ctx.fillStyle = 'rgba(142,59,34,0.85)';
      ctx.font = '700 10px "SFMono-Regular", Menlo, monospace';
      ctx.fillText('★ ' + (track.engine === 'stream' ? 'VINTAGE 78' : 'MUSIC BOX'), 112, 90);
    } else {
      ctx.fillStyle = 'rgba(66,46,27,0.45)';
      ctx.font = 'italic 20px "Iowan Old Style", Palatino, Georgia, serif';
      ctx.fillText(lang === 'th' ? 'ช่องว่าง · สงวนไว้' : 'Empty slot · reserved', 112, 54);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  makeGrilleTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 96;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#140f0c';
    ctx.fillRect(0, 0, 512, 96);
    for (let x = 0; x < 512; x += 9) {
      const g = ctx.createLinearGradient(x, 0, x + 6, 0);
      g.addColorStop(0, 'rgba(255,220,160,0.08)');
      g.addColorStop(0.45, 'rgba(255,220,160,0.45)');
      g.addColorStop(0.55, 'rgba(120,70,30,0.2)');
      g.addColorStop(1, 'rgba(0,0,0,0.2)');
      ctx.fillStyle = g;
      ctx.fillRect(x, 4, 5, 88);
    }
    ctx.strokeStyle = 'rgba(230,192,123,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 508, 92);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  makeKeyTexture(label) {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);
    const grad = ctx.createRadialGradient(48, 40, 4, 64, 64, 66);
    grad.addColorStop(0, '#f7ead0');
    grad.addColorStop(0.35, '#c9a76c');
    grad.addColorStop(0.72, '#6e5636');
    grad.addColorStop(1, '#241a10');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,14,8,0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#1b120a';
    ctx.font = '700 54px "Avenir Next", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 64, 68);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ---------- environment ---------- */

  buildEnvironment() {
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(38, 18),
      new THREE.MeshBasicMaterial({ map: this.makeBackdropTexture(), fog: false })
    );
    wall.position.set(0, 5.2, -5.2);
    this.scene.add(wall);

    const floorTex = (() => {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#090a0f';
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 2600; i++) {
        ctx.fillStyle = `rgba(255,235,205,${Math.random() * 0.025})`;
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
      }
      for (let i = 0; i < 22; i++) {
        ctx.strokeStyle = `rgba(230,192,123,${Math.random() * 0.025})`;
        ctx.beginPath();
        ctx.moveTo(0, Math.random() * 512);
        ctx.lineTo(512, Math.random() * 512);
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
      return tex;
    })();

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(42, 30),
      new THREE.MeshStandardMaterial({ map: floorTex, color: 0x2a2730, roughness: 0.62, metalness: 0.38, envMapIntensity: 0.45 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 1.5);
    floor.receiveShadow = true;
    this.scene.add(floor);

    const rugTex = (() => {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      ctx.translate(256, 256);
      const grad = ctx.createRadialGradient(0, 0, 30, 0, 0, 250);
      grad.addColorStop(0, 'rgba(74,38,36,0.95)');
      grad.addColorStop(0.55, 'rgba(46,24,30,0.9)');
      grad.addColorStop(0.72, 'rgba(30,18,24,0.55)');
      grad.addColorStop(1, 'rgba(20,12,16,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 250, 0, Math.PI * 2);
      ctx.fill();
      for (let r = 40; r < 240; r += 26) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(230,192,123,${0.05 - r * 0.00012})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    })();
    const rug = new THREE.Mesh(
      new THREE.CircleGeometry(3.9, 64),
      new THREE.MeshStandardMaterial({ map: rugTex, transparent: true, roughness: 0.85, metalness: 0.05, depthWrite: false })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.012, 0.6);
    rug.receiveShadow = true;
    this.scene.add(rug);

    // Ambient room lighting.
    this.hemi = new THREE.HemisphereLight(0x8fa4d6, 0x1a0f0b, 0.42);
    this.scene.add(this.hemi);

    const warm = new THREE.SpotLight(0xffd3a0, 26, 24, 0.62, 0.55, 1.25);
    warm.position.set(2.6, 7.6, 5.4);
    warm.target.position.set(0, 2.2, 0);
    warm.castShadow = true;
    warm.shadow.mapSize.set(1024, 1024);
    warm.shadow.bias = -0.0006;
    this.scene.add(warm, warm.target);
    this.warmLight = warm;

    const rose = new THREE.PointLight(0xe0748f, 9, 16, 1.7);
    rose.position.set(-5.4, 3.1, 2.2);
    this.scene.add(rose);
    this.roseLight = rose;

    const teal = new THREE.PointLight(0x5ec9c0, 7, 15, 1.8);
    teal.position.set(5.2, 2.2, 0.4);
    this.scene.add(teal);
    this.tealLight = teal;

    const top = new THREE.PointLight(0xffc97a, 10, 10, 1.8);
    top.position.set(0, 4.9, 1.3);
    this.scene.add(top);
    this.topLight = top;

    // Floating dust.
    const dustGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(260 * 3);
    for (let i = 0; i < 260; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = Math.random() * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: 0xf0d4a0, size: 0.017, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    this.scene.add(this.dust);

    // Two vertical neon strips on the back wall.
    const neonMatA = new THREE.MeshBasicMaterial({ color: 0xe58aa0, transparent: true, opacity: 0.28 });
    const neonMatB = new THREE.MeshBasicMaterial({ color: 0x72d3c6, transparent: true, opacity: 0.24 });
    for (const [x, mat] of [[-7.2, neonMatA], [7.2, neonMatB]]) {
      const neon = new THREE.Mesh(new THREE.BoxGeometry(0.05, 4.4, 0.05), mat);
      neon.position.set(x, 3.2, -4.9);
      this.scene.add(neon);
    }
  }

  /* ---------- cabinet ---------- */

  buildCabinet() {
    const cabinet = new THREE.Group();
    this.cabinet = cabinet;
    this.materials = {
      wood: new THREE.MeshStandardMaterial({ map: this.makeWoodTexture(), color: 0xffffff, roughness: 0.46, metalness: 0.07, envMapIntensity: 0.55 }),
      woodDark: new THREE.MeshStandardMaterial({ map: this.makeWoodTexture(), color: 0x9a7a60, roughness: 0.55, metalness: 0.05, envMapIntensity: 0.4 }),
      chrome: new THREE.MeshStandardMaterial({ color: 0xb9c2d0, metalness: 0.96, roughness: 0.19, envMapIntensity: 0.82 }),
      brass: new THREE.MeshStandardMaterial({ color: 0xc9a15c, metalness: 1, roughness: 0.27, envMapIntensity: 1.1 }),
      black: new THREE.MeshStandardMaterial({ color: 0x090a0d, metalness: 0.55, roughness: 0.34 }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0x9cc9d0, metalness: 0.08, roughness: 0.16, transparent: true, opacity: 0.07, envMapIntensity: 0.5, side: THREE.DoubleSide, depthWrite: false }),
      amber: new THREE.MeshBasicMaterial({ color: 0xffb45e }),
    };

    const add = (geo, mat, x, y, z, parent = cabinet) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // Plinth and feet.
    add(new THREE.BoxGeometry(3.6, 0.42, 1.66), this.materials.woodDark, 0, 0.21, 0);
    add(new THREE.BoxGeometry(3.5, 0.06, 1.6), this.materials.chrome, 0, 0.44, 0);
    for (const x of [-1.62, 1.62]) {
      for (const z of [-0.55, 0.55]) {
        const foot = add(new THREE.SphereGeometry(0.11, 18, 12), this.materials.chrome, x, 0.05, z);
        foot.scale.y = 0.5;
      }
    }

    // Main body.
    add(new THREE.BoxGeometry(3.4, 2.0, 1.5), this.materials.wood, 0, 1.36, 0);
    add(new THREE.BoxGeometry(3.48, 0.07, 1.56), this.materials.chrome, 0, 2.34, 0);
    add(new THREE.BoxGeometry(3.48, 0.07, 1.56), this.materials.chrome, 0, 0.48, 0);

    // Arched top: extruded silhouette.
    const archShape = new THREE.Shape();
    archShape.moveTo(-1.7, 0);
    archShape.lineTo(-1.7, 0.18);
    archShape.absarc(0, 0.18, 1.7, Math.PI, 0, true);
    archShape.lineTo(1.7, 0);
    archShape.closePath();
    const archGeo = new THREE.ExtrudeGeometry(archShape, { depth: 1.5, bevelEnabled: true, bevelSize: 0.055, bevelThickness: 0.055, bevelSegments: 3, curveSegments: 48 });
    const arch = add(archGeo, this.materials.wood, 0, 2.36, -0.75);
    arch.castShadow = true;

    // Front panel and inlays.
    add(new THREE.BoxGeometry(3.16, 1.86, 0.07), this.materials.woodDark, 0, 1.35, 0.755);
    add(new THREE.BoxGeometry(3.23, 0.045, 0.09), this.materials.chrome, 0, 2.26, 0.78);
    add(new THREE.BoxGeometry(3.23, 0.045, 0.09), this.materials.chrome, 0, 0.5, 0.78);
    add(new THREE.BoxGeometry(0.05, 1.86, 0.09), this.materials.chrome, -1.6, 1.35, 0.78);
    add(new THREE.BoxGeometry(0.05, 1.86, 0.09), this.materials.chrome, 1.6, 1.35, 0.78);

    // Side pilasters.
    for (const x of [-1.7, 1.7]) {
      const pilaster = add(new THREE.CylinderGeometry(0.058, 0.058, 2.3, 20), this.materials.chrome, x, 1.35, 0.72);
      pilaster.castShadow = true;
      for (let i = 0; i < 5; i++) {
        add(new THREE.TorusGeometry(0.06, 0.012, 8, 20), this.materials.brass, x, 0.55 + i * 0.42, 0.72).rotation.x = Math.PI / 2;
      }
      add(new THREE.SphereGeometry(0.1, 20, 14), this.materials.chrome, x, 2.42, 0.72);
    }

    // Arch chrome trim (outer).
    const archCurve = new THREE.CatmullRomCurve3(
      Array.from({ length: 33 }, (_, i) => {
        const a = Math.PI - (i / 32) * Math.PI;
        return new THREE.Vector3(Math.cos(a) * 1.745, 2.55 + Math.sin(a) * 1.745, 0.78);
      })
    );
    const trim = new THREE.Mesh(new THREE.TubeGeometry(archCurve, 96, 0.038, 10, false), this.materials.chrome);
    trim.castShadow = true;
    cabinet.add(trim);

    // Inner glass arch.
    const glassShape = new THREE.Shape();
    glassShape.moveTo(-1.34, 0);
    glassShape.lineTo(-1.34, 0.05);
    glassShape.absarc(0, 0.05, 1.34, Math.PI, 0, true);
    glassShape.lineTo(1.34, 0);
    glassShape.closePath();
    const glass = new THREE.Mesh(new THREE.ShapeGeometry(glassShape, 40), this.materials.glass);
    glass.position.set(0, 2.55, 0.795);
    cabinet.add(glass);

    const innerCurve = new THREE.CatmullRomCurve3(
      Array.from({ length: 33 }, (_, i) => {
        const a = Math.PI - (i / 32) * Math.PI;
        return new THREE.Vector3(Math.cos(a) * 1.37, 2.6 + Math.sin(a) * 1.37, 0.815);
      })
    );
    cabinet.add(new THREE.Mesh(new THREE.TubeGeometry(innerCurve, 96, 0.018, 8, false), this.materials.brass));

    this.buildBubbleTubes(cabinet);
    this.buildRecordDeck(cabinet);
    this.buildRack(cabinet);
    this.buildKeypad(cabinet);
    this.buildCoinSlot(cabinet);
    this.buildSpeakerGrille(cabinet);
    this.buildSign(cabinet);

    // Marquee bulbs around the arch.
    const bulbGeo = new THREE.SphereGeometry(0.03, 12, 8);
    for (let i = 0; i < 30; i++) {
      const a = Math.PI - (i / 29) * Math.PI;
      const mat = new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffa83e, emissiveIntensity: 0.55 });
      const bulb = new THREE.Mesh(bulbGeo, mat);
      bulb.position.set(Math.cos(a) * 1.83, 2.55 + Math.sin(a) * 1.83, 0.73);
      cabinet.add(bulb);
      this.bulbs.push(mat);
    }

    this.scene.add(cabinet);
  }

  buildBubbleTubes(cabinet) {
    const bubbleGeo = new THREE.SphereGeometry(0.038, 10, 8);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xa9dbe4, metalness: 0.05, roughness: 0.04, transparent: true, opacity: 0.18,
      envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false,
    });

    for (const side of [-1, 1]) {
      const points = [];
      const push = (x, y) => points.push(new THREE.Vector3(x, y, 0.815));
      push(side * 1.535, 0.78);
      push(side * 1.535, 1.5);
      push(side * 1.535, 2.25);
      push(side * 1.47, 2.85);
      push(side * 1.26, 3.42);
      push(side * 0.82, 3.86);
      push(side * 0.28, 4.04);
      push(0, 4.06);
      const curve = new THREE.CatmullRomCurve3(points);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.105, 12, false), glassMat);
      cabinet.add(tube);

      const colorMat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(side > 0 ? 0.51 : 0.92, 0.7, 0.5), transparent: true, opacity: 0.55, toneMapped: false });
      const core = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.05, 8, false), colorMat);
      cabinet.add(core);
      this.colorTubes.push(colorMat);

      for (let i = 0; i < 22; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL((i / 22) * 0.9, 0.72, 0.62), transparent: true, opacity: 0.72, toneMapped: false });
        const bubble = new THREE.Mesh(bubbleGeo, mat);
        const scale = 0.8 + Math.random() * 1.35;
        bubble.scale.setScalar(scale);
        cabinet.add(bubble);
        this.bubbles.push({ mesh: bubble, curve, offset: i / 22 + Math.random() * 0.02, speed: 0.035 + Math.random() * 0.04, mat, side });
      }
    }
  }

  buildRecordDeck(cabinet) {
    const deck = new THREE.Group();
    deck.position.set(0, 3.05, 0.82);
    cabinet.add(deck);

    const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.73, 0.73, 0.055, 64), this.materials.chrome);
    platter.rotation.x = Math.PI / 2;
    platter.position.z = 0.03;
    platter.castShadow = true;
    deck.add(platter);

    const mat = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.022, 64), new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.55, metalness: 0.25 }));
    mat.rotation.x = Math.PI / 2;
    mat.position.z = 0.067;
    deck.add(mat);

    const record = new THREE.Group();
    record.position.z = 0.09;
    deck.add(record);
    this.record = record;

    const vinyl = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.018, 64), new THREE.MeshStandardMaterial({ color: 0x08080a, roughness: 0.26, metalness: 0.55, envMapIntensity: 1.1 }));
    vinyl.rotation.x = Math.PI / 2;
    record.add(vinyl);
    for (const [radius, opacity] of [[0.56, 0.18], [0.47, 0.14], [0.38, 0.12], [0.3, 0.1]]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.0025, 6, 64),
        new THREE.MeshBasicMaterial({ color: 0xbfc5cc, transparent: true, opacity })
      );
      ring.position.z = 0.012;
      record.add(ring);
    }
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.012, 48), new THREE.MeshStandardMaterial({ color: 0xa64b34, roughness: 0.5, metalness: 0.2 }));
    label.rotation.x = Math.PI / 2;
    label.position.z = 0.014;
    record.add(label);
    const labelRing = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.004, 6, 48), this.materials.brass);
    labelRing.position.z = 0.021;
    record.add(labelRing);
    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.09, 12), this.materials.chrome);
    spindle.rotation.x = Math.PI / 2;
    spindle.position.z = 0.045;
    record.add(spindle);

    const arm = new THREE.Group();
    arm.position.set(0.74, 0.02, 0.19);
    arm.rotation.z = 0.36;
    deck.add(arm);
    this.toneArm = arm;
    const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.082, 0.08, 24), this.materials.chrome);
    pivot.rotation.x = Math.PI / 2;
    arm.add(pivot);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.72, 12), this.materials.chrome);
    rod.position.set(-0.12, -0.34, 0.02);
    rod.rotation.z = 0.3;
    arm.add(rod);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.055, 0.07), this.materials.chrome);
    head.position.set(-0.22, -0.68, 0.02);
    head.rotation.z = 0.3;
    arm.add(head);

    // Small brass plaque under the deck.
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.12), new THREE.MeshBasicMaterial({ map: (() => {
      const c = document.createElement('canvas'); c.width = 512; c.height = 88;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#2a1c10'; ctx.fillRect(0, 0, 512, 88);
      ctx.strokeStyle = 'rgba(230,192,123,0.8)'; ctx.lineWidth = 3; ctx.strokeRect(4, 4, 504, 80);
      ctx.fillStyle = '#e6c07b'; ctx.font = '600 28px Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillText('45 RPM · HIGH FIDELITY', 256, 54);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
    })() }));
    plaque.position.set(0, -0.82, 0.12);
    deck.add(plaque);
  }

  buildRack(cabinet) {
    const rack = new THREE.Group();
    rack.position.set(0, 0, 0);
    cabinet.add(rack);
    this.rackGroup = rack;

    const backing = new THREE.Mesh(new THREE.BoxGeometry(2.66, 0.98, 0.06), this.materials.woodDark);
    backing.position.set(0, 1.76, 0.79);
    backing.castShadow = true;
    rack.add(backing);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(2.74, 0.05, 0.08), this.materials.chrome);
    trim.position.set(0, 2.27, 0.82);
    rack.add(trim);
    const trim2 = trim.clone();
    trim2.position.y = 1.25;
    rack.add(trim2);

    this.stripGroup = new THREE.Group();
    rack.add(this.stripGroup);
  }

  refreshRack(entries, lang) {
    this.lang = lang || 'en';
    while (this.stripGroup.children.length) {
      const child = this.stripGroup.children.pop();
      if (child.material?.map) child.material.map.dispose();
      child.material?.dispose();
      child.geometry?.dispose();
    }
    this.interactive = this.interactive.filter((item) => item.userData?.type !== 'strip');
    const rows = Array.from({ length: 8 }, (_, i) => entries[i] || { slot: '', track: null });
    rows.forEach((entry, index) => {
      const col = index < 4 ? 0 : 1;
      const row = index % 4;
      const x = col === 0 ? -0.64 : 0.64;
      const y = 2.04 - row * 0.215;
      const slot = entry.slot || '—';
      const tex = this.makePaperTexture(entry.track, slot, this.lang);
      const mat = new THREE.MeshBasicMaterial({ map: tex, color: 0xd8ccb8, toneMapped: true });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.2), mat);
      mesh.position.set(x, y, 0.833);
      mesh.userData = { type: 'strip', track: entry.track, slot: entry.slot || '' };
      this.stripGroup.add(mesh);
      this.interactive.push(mesh);
    });
  }

  buildKeypad(cabinet) {
    this.keyMeshes = new Map();
    const keyGeo = new THREE.CircleGeometry(0.072, 28);
    const keyMat = new THREE.MeshStandardMaterial({ color: 0xcfd8e6, metalness: 1, roughness: 0.16, envMapIntensity: 1.2 });
    const makeKey = (label, x, y, type) => {
      const group = new THREE.Group();
      group.position.set(x, y, 0.84);
      group.userData = { type: 'key', key: label };
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.076, 0.011, 8, 24), this.materials.brass);
      group.add(rim);
      const cap = new THREE.Mesh(keyGeo, keyMat);
      cap.position.z = 0.012;
      group.add(cap);
      const face = new THREE.Mesh(new THREE.CircleGeometry(0.068, 24), new THREE.MeshBasicMaterial({ map: this.makeKeyTexture(label), transparent: true, toneMapped: false }));
      face.position.z = 0.016;
      group.add(face);
      cabinet.add(group);
      this.keyMeshes.set(label, group);
      this.interactive.push(group);
      return group;
    };
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].forEach((letter, i) => makeKey(letter, -0.9 + i * 0.18, 1.02, 'letter'));
    for (let i = 0; i < 8; i++) makeKey(String(i + 1), -0.84 + i * 0.24, 0.82, 'number');

    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.11), new THREE.MeshBasicMaterial({ map: (() => {
      const c = document.createElement('canvas'); c.width = 700; c.height = 76;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#1a120b'; ctx.fillRect(0, 0, 700, 76);
      ctx.fillStyle = '#d9b77c'; ctx.font = '600 25px Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillText('A – K    1 – 8    ·    SELECT YOUR RECORD', 350, 48);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
    })() }));
    plaque.position.set(0, 1.18, 0.842);
    cabinet.add(plaque);
  }

  buildCoinSlot(cabinet) {
    const group = new THREE.Group();
    group.position.set(1.5, 1.55, 0.82);
    group.userData = { type: 'coin' };
    cabinet.add(group);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.055), this.materials.brass);
    plate.castShadow = true;
    group.add(plate);
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.2, 0.02), this.materials.black);
    slit.position.set(0, 0.02, 0.035);
    group.add(slit);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.012, 8, 28), this.materials.chrome);
    ring.position.z = 0.032;
    group.add(ring);
    const text = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.07), new THREE.MeshBasicMaterial({ map: (() => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 64;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0, 0, 256, 64);
      ctx.fillStyle = '#f0d59c'; ctx.font = '700 24px monospace'; ctx.textAlign = 'center';
      ctx.fillText('25¢', 128, 42);
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
    })() }));
    text.position.set(0, -0.16, 0.034);
    group.add(text);
    this.interactive.push(group);

    const coin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.062, 0.062, 0.012, 24),
      new THREE.MeshStandardMaterial({ color: 0xd9b05e, metalness: 1, roughness: 0.2, envMapIntensity: 1.4 })
    );
    coin.rotation.x = Math.PI / 2;
    coin.position.set(1.5, 2.28, 0.96);
    coin.visible = false;
    cabinet.add(coin);
    this.coin = coin;
  }

  buildSpeakerGrille(cabinet) {
    const grille = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 0.3),
      new THREE.MeshStandardMaterial({ map: this.makeGrilleTexture(), roughness: 0.55, metalness: 0.65, emissive: 0x3a1d08, emissiveIntensity: 0.35 })
    );
    grille.position.set(0, 0.55, 0.793);
    cabinet.add(grille);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.36, 0.04), this.materials.chrome);
    frame.position.set(0, 0.55, 0.775);
    cabinet.add(frame);
  }

  buildSign(cabinet) {
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.9, 0.72),
      new THREE.MeshBasicMaterial({ map: this.makeSignTexture(), transparent: true, toneMapped: false, opacity: 0.9 })
    );
    sign.position.set(0, 4.5, 0.5);
    sign.rotation.x = -0.06;
    cabinet.add(sign);
    this.sign = sign;
  }

  /* ---------- interaction ---------- */

  bindEvents() {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', (event) => {
      this.pointerStart = { x: event.clientX, y: event.clientY };
      this.setPointer(event);
    });
    el.addEventListener('pointerup', (event) => {
      if (!this.pointerStart) return;
      const dx = Math.abs(event.clientX - this.pointerStart.x);
      const dy = Math.abs(event.clientY - this.pointerStart.y);
      this.pointerStart = null;
      if (dx + dy > 7) return;
      this.setPointer(event);
      const hit = this.pick();
      if (!hit) return;
      const data = this.findData(hit.object);
      if (!data) return;
      if (data.type === 'strip') this.hooks.onStrip?.(data.track, data.slot);
      if (data.type === 'key') this.hooks.onKey?.(data.key);
      if (data.type === 'coin') this.hooks.onCoin?.();
    });
    el.addEventListener('pointermove', (event) => {
      this.setPointer(event);
      const hit = this.pick();
      const data = hit ? this.findData(hit.object) : null;
      el.style.cursor = data ? 'pointer' : 'grab';
      if (this.hovered && this.hovered !== hit?.object) {
        if (this.hovered.userData?.type === 'strip') this.hovered.material.emissive?.setHex(0x000000);
        this.hovered = null;
      }
      if (hit?.object?.userData?.type === 'strip') {
        hit.object.material.emissive?.setHex(0x2a1a08);
        this.hovered = hit.object;
      }
    });
    el.addEventListener('pointerleave', () => {
      if (this.hovered?.material?.emissive) this.hovered.material.emissive.setHex(0x000000);
      this.hovered = null;
    });
    window.addEventListener('resize', () => this.resize());
    reduceMotion.addEventListener?.('change', (event) => { this.reduced = event.matches; });
  }

  setPointer(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  pick() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.interactive, true);
    return hits[0] || null;
  }

  findData(object) {
    let node = object;
    while (node) {
      if (node.userData && node.userData.type) return node.userData;
      node = node.parent;
    }
    return null;
  }

  pressKey(key) {
    const group = this.keyMeshes.get(key);
    if (!group) return;
    group.position.z = 0.815;
    clearTimeout(this.pressed.get(key));
    this.pressed.set(key, setTimeout(() => { group.position.z = 0.84; }, 110));
  }

  flashStrip(slot, ms = 650) {
    const mesh = this.interactive.find((item) => item.userData?.type === 'strip' && item.userData.slot === slot);
    if (!mesh) return;
    mesh.material.emissive?.setHex(0x7a4a12);
    setTimeout(() => mesh.material.emissive?.setHex(0x000000), ms);
  }

  dropCoin() {
    if (!this.coin) return;
    this.coin.visible = true;
    this.coin.position.set(1.5, 2.28, 0.96);
    this.coin.rotation.set(Math.PI / 2, 0, 0);
    this.coinAnim = { t: 0, from: 2.28, to: 1.58 };
  }

  setTheme(theme) {
    if (!theme) return;
    this.theme = theme;
    if (this.scene) {
      this.scene.background.setHex(theme.bg);
      this.scene.fog.color.setHex(theme.fog);
    }
    if (this.roseLight) this.roseLight.color.setHex(theme.rose);
    if (this.tealLight) this.tealLight.color.setHex(theme.teal);
    if (this.topLight) this.topLight.color.setHex(theme.bulb);
    for (const mat of this.bulbs) {
      mat.color.setHex(theme.bulb);
      mat.emissive.setHex(theme.bulb);
    }
  }

  setPlaying(playing) {
    this.playing = Boolean(playing);
  }

  setDim(dim) {
    this.dimTarget = clamp(dim, 0, 1);
  }

  setEnergy(value) {
    this.energy += (clamp(value, 0, 1) - this.energy) * 0.18;
  }

  resetView() {
    this.controls.target.set(0, 2.55, 0);
    this.camera.position.set(0, 3.3, window.innerWidth < 720 ? 13.4 : 10.6);
    this.controls.update();
  }

  resize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / Math.max(1, height);
    this.camera.aspect = aspect;
    if (width < 720) {
      this.camera.fov = 45;
      if (this.camera.position.z < 12.2 && !this.intro) this.camera.position.set(0, 3.2, 12.5);
    } else {
      this.camera.fov = 36;
    }
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.bloom.resolution.set(width, height);
  }

  animate() {
    this.renderer.setAnimationLoop(() => this.frame());
  }

  frame() {
    const dt = Math.min(0.05, this.clock.getDelta());
    this.time += dt;
    const t = this.time;

    if (this.intro) {
      this.intro.t = Math.min(1, this.intro.t + dt * 0.42);
      const p = 1 - Math.pow(1 - this.intro.t, 3);
      this.camera.position.lerpVectors(this.intro.from, this.intro.to, p);
      if (this.intro.t >= 1) this.intro = null;
    }
    this.controls.update();

    if (this.record) this.record.rotation.z -= dt * (this.playing ? 3.6 : 0.08);
    if (this.toneArm) {
      const target = this.playing ? -0.62 : 0.36;
      this.toneArm.rotation.z += (target - this.toneArm.rotation.z) * Math.min(1, dt * 4);
    }

    for (const bubble of this.bubbles) {
      bubble.offset = (bubble.offset + dt * bubble.speed * (this.playing ? 2.2 : 0.7)) % 1;
      const point = bubble.curve.getPointAt(bubble.offset);
      bubble.mesh.position.copy(point);
      bubble.mesh.position.x += Math.sin(t * 2 + bubble.offset * 30) * 0.012;
      const hue = (t * 0.035 + bubble.offset * 1.2 + (bubble.side > 0 ? 0.42 : 0)) % 1;
      bubble.mat.color.setHSL(hue, 0.72, 0.62);
      bubble.mat.opacity = 0.62 + Math.sin(t * 3 + bubble.offset * 20) * 0.22;
    }
    this.colorTubes.forEach((mat, i) => {
      mat.color.setHSL((t * 0.028 + i * 0.23) % 1, 0.72, 0.52);
    });
    this.bulbs.forEach((mat, i) => {
      mat.emissiveIntensity = 0.4 + this.energy * 1.2 + Math.sin(t * 2.2 + i * 0.42) * 0.1;
    });

    this.dim += (this.dimTarget - this.dim) * Math.min(1, dt * 2.2);
    const lamp = 1 - this.dim * 0.86;
    if (this.warmLight) this.warmLight.intensity = 26 * lamp;
    if (this.roseLight) this.roseLight.intensity = 9 * lamp;
    if (this.tealLight) this.tealLight.intensity = 7 * lamp;
    if (this.topLight) this.topLight.intensity = (10 + this.energy * 9) * lamp;
    if (this.hemi) this.hemi.intensity = 0.42 * lamp;
    if (this.bloom) this.bloom.strength = (0.3 + this.energy * 0.2) * lamp;
    if (this.sign) this.sign.material.opacity = 0.62 + lamp * 0.28;

    if (this.dust) {
      this.dust.rotation.y += dt * 0.008;
      this.dust.position.y = Math.sin(t * 0.12) * 0.12;
    }

    if (this.coinAnim) {
      this.coinAnim.t = Math.min(1, this.coinAnim.t + dt * 1.9);
      const p = this.coinAnim.t;
      this.coin.position.y = this.coinAnim.from + (this.coinAnim.to - this.coinAnim.from) * p * p;
      this.coin.rotation.z += dt * 14;
      this.coin.scale.setScalar(1 - Math.max(0, p - 0.82) * 4);
      if (p >= 1) {
        this.coin.visible = false;
        this.coin.scale.setScalar(1);
        this.coinAnim = null;
      }
    }

    this.composer.render();
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.controls.dispose();
    this.renderer.dispose();
  }
}

/* ------------------------------------------------------------------ */
/* Application shell                                                   */
/* ------------------------------------------------------------------ */

class WurlitzerApp {
  constructor() {
    this.lang = 'en';
    this.tracks = [];
    this.builtins = BUILTIN_TRACKS.slice();
    this.externals = [];
    this.trackBySlot = new Map();
    this.current = null;
    this.favoritesOnly = false;
    this.pending = { letter: null, number: null };
    this.seeking = false;
    this.manifestOk = false;
    this.manifestError = '';
    this.ambientLast = { rain: 38, ocean: 42, crickets: 32 };
    this.resetArmed = false;
    this.sfx = new MechanicalSounds();
    this.settings = loadSettings(this.builtins);
    this.lang = this.settings.lang;
    document.body.dataset.motion = reduceMotion.matches ? 'reduced' : 'full';
    this.tracks = this.builtins.slice();
    this.rebuildTrackMap();
    this.current = this.tracks.find((track) => track.id === this.settings.lastTrack) || this.builtins[0];
    this.collection = this.current?.collection || 'A';
    this.query = '';
    this._sceneKey = '';
    this.firstRun = !localStorage.getItem(FIRST_RUN_KEY);
    this.queueMode = false;
    this.startedOnce = false;
    this._overlayTimer = null;
    this._overlayTrack = null;
    this._overlayDismissed = false;
    this._firstGesture = null;

    this.audio = new JukeboxAudio(this.settings, {
      onTick: () => this.onAudioTick(),
      onState: () => this.syncNowPlaying(),
      onEnded: () => this.onStreamEnded(),
      onStreamError: (track) => this.onStreamError(track),
      onTimer: () => this.renderTimer(),
      onTimerEnd: () => this.onTimerEnd(),
      onBlocked: () => {
        setStatus(this.t('statusBlocked'), 'warn');
        showToast(this.t('statusBlocked'), 'warn');
      },
    });
    this.audio.setTracks(this.tracks);

    try {
      this.scene = new WurlitzerScene($('stage-canvas'), {
        onStrip: (track, slot) => this.onSceneStrip(track, slot),
        onKey: (key) => this.handleKey(key),
        onCoin: () => this.insertCoin(),
      });
      document.body.dataset.webgl = 'true';
    } catch (error) {
      console.error(error);
      document.body.dataset.webgl = 'false';
      this.scene = null;
    }

    this.bind();
    this.applyLanguage(false);
    this.applySettings();
    this.syncNowPlaying();
    this.renderTimer();
    this.boot();
  }

  t(key, vars = {}) {
    const dict = I18N[this.lang] || I18N.en;
    let value = dict[key] ?? I18N.en[key] ?? key;
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
    return value;
  }

  rebuildTrackMap() {
    this.trackBySlot = new Map();
    for (const track of this.tracks) this.trackBySlot.set(track.slot, track);
  }

  mergeTracks(externals) {
    this.externals = externals;
    const seenSlots = new Set();
    const merged = [];
    for (const track of [...this.builtins, ...externals]) {
      if (!track || seenSlots.has(track.slot)) continue;
      seenSlots.add(track.slot);
      merged.push(track);
    }
    merged.sort((a, b) => slotOrder(a.slot) - slotOrder(b.slot));
    this.tracks = merged;
    this.rebuildTrackMap();
    this.audio.setTracks(this.tracks);
    if (!this.trackBySlot.has(this.current?.slot)) {
      this.current = this.trackBySlot.get('A-1') || merged[0];
    }
    if (this.firstRun) {
      const queue = this.queueTracks();
      if (queue.length) {
        this.current = queue[0];
        this.collection = queue[0].collection;
        this.queueMode = true;
      }
    } else {
      const remembered = this.tracks.find((track) => track.id === this.settings.lastTrack);
      if (remembered) {
        this.current = remembered;
        this.collection = remembered.collection;
        this.queueMode = DEFAULT_QUEUE.includes(remembered.id);
      }
    }
    this.renderCollectionTabs();
    this.renderRack();
    this.syncNowPlaying();
  }

  async boot() {
    const step = $('loading-step');
    if (step) step.textContent = this.t('loadingWarm');
    const started = performance.now();

    let manifestPromise;
    try {
      manifestPromise = this.loadManifest();
    } catch {
      manifestPromise = Promise.resolve();
    }
    await Promise.race([manifestPromise, new Promise((resolve) => setTimeout(resolve, 3200))]);

    if (step) step.textContent = this.t('loadingLights');
    await new Promise((resolve) => setTimeout(resolve, 220));
    if (this.scene) {
      if (location.search.includes('shot=1')) {
        this.scene.intro = null;
        this.scene.camera.position.set(0, 3.5, location.search.includes('og=1') ? 8.4 : 10.4);
        this.scene.controls.update();
      }
    }
    this.renderRack();
    this.syncNowPlaying();
    if (location.search.includes('og=1')) document.body.classList.add('og-mode');

    if (step) step.textContent = this.t('loadingRecords');
    const wait = Math.max(0, 900 - (performance.now() - started));
    await new Promise((resolve) => setTimeout(resolve, wait));
    if (step) step.textContent = this.t('loadingReady');
    await new Promise((resolve) => setTimeout(resolve, 160));

    $('loading')?.classList.add('is-done');
    document.body.dataset.ready = 'true';
    setStatus(this.t('statusReady'));
    if (this.firstRun) this.showStartPrompt();
    this.armFirstGesture();
    if (this.settings.favorites.length) {
      // A quiet reminder, not a modal.
      setTimeout(() => showToast(this.t('toastResume')), 1200);
    }
    if (location.search.includes('selftest')) {
      setTimeout(() => this.runSelfTest(true), 500);
    }
  }

  async loadManifest() {
    let timeout;
    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 4200);
      const response = await fetch('data/playlist.json', { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const result = validateManifest(data);
      if (!result.ok) throw new Error(result.errors.join('; ') || 'no valid tracks');
      this.manifestOk = true;
      this.manifestError = '';
      document.body.dataset.manifest = 'ok';
      this.mergeTracks(result.tracks);
    } catch (error) {
      this.manifestOk = false;
      this.manifestError = error?.message || 'manifest unavailable';
      document.body.dataset.manifest = 'error';
      this.mergeTracks([]);
      setStatus(this.t('statusManifestError'), 'warn');
    } finally {
      clearTimeout(timeout);
    }
  }

  /* ---------- bindings ---------- */

  bind() {
    const on = (id, event, fn) => $(id)?.addEventListener(event, fn);
    on('play-btn', 'click', () => this.togglePlay());
    on('start-playlist', 'click', () => this.startDefaultPlaylist());
    on('stage-caption', 'click', () => this.showNowOverlay(true));
    on('stage-caption', 'keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.showNowOverlay(true); }
    });
    on('now-overlay-close', 'click', () => this.hideNowOverlay());
    on('prev-btn', 'click', () => this.stepTrack(-1));
    on('next-btn', 'click', () => this.stepTrack(1));
    on('stop-btn', 'click', () => this.stop());
    on('freeplay-toggle', 'click', () => this.setFreePlay(!this.settings.freePlay));
    on('mute-btn', 'click', () => this.toggleMute());
    on('help-btn', 'click', () => this.openHelp());
    on('help-close', 'click', () => this.closeHelp());
    on('help-done', 'click', () => this.closeHelp());
    on('coin-insert', 'click', () => this.insertCoin());
    on('favorite-btn', 'click', () => this.toggleFavorite(this.current));
    on('fav-filter', 'click', () => this.toggleFavoritesFilter());
    on('export-btn', 'click', () => this.exportSettings());
    on('reset-btn', 'click', () => this.resetSettings());
    on('timer-readout', 'click', () => this.setTimer(0));
    on('seek', 'input', (event) => {
      this.seeking = true;
      const value = Number(event.target.value) / 1000;
      $('elapsed').textContent = formatClock(value * this.audio.duration());
      this.setRangeFill(event.target);
    });
    on('seek', 'change', (event) => {
      this.audio.seek(Number(event.target.value) / 1000);
      this.seeking = false;
    });
    on('seek', 'pointerup', () => { this.seeking = false; });

    for (const button of document.querySelectorAll('.lang-btn')) {
      button.addEventListener('click', () => this.setLanguage(button.dataset.lang));
    }
    for (const button of document.querySelectorAll('.timer-btn')) {
      button.addEventListener('click', () => this.setTimer(Number(button.dataset.minutes)));
    }
    for (const button of document.querySelectorAll('.key')) {
      button.addEventListener('click', () => this.handleKey(button.dataset.key));
    }
    for (const toggle of document.querySelectorAll('.amb-toggle')) {
      toggle.addEventListener('click', () => this.toggleAmbient(toggle.closest('.ambient-row')?.dataset.ambient));
    }
    for (const slider of document.querySelectorAll('.amb-slider')) {
      slider.addEventListener('input', () => this.onAmbientSlider(slider));
      this.setRangeFill(slider);
    }

    on('rack-search', 'input', (event) => {
      this.query = event.target.value;
      this.renderRack();
    });
    on('rack-search', 'keydown', (event) => {
      if (event.key === 'Escape') {
        event.target.value = '';
        this.query = '';
        this.renderRack();
      }
    });
    $('theme-swatches')?.addEventListener('click', (event) => {
      const swatch = event.target.closest('.theme-swatch');
      if (swatch) this.setTheme(swatch.dataset.theme);
    });
    $('font-size-group')?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-size]');
      if (button) this.setFontSize(button.dataset.size);
    });

    $('collection-tabs')?.addEventListener('click', (event) => {
      const tab = event.target.closest('.collection-tab');
      if (!tab) return;
      this.collection = tab.dataset.collection || 'ALL';
      this.query = '';
      const search = $('rack-search');
      if (search) search.value = '';
      this.renderCollectionTabs();
      this.renderRack();
      this.sfx.clack();
    });

    $('rack-grid')?.addEventListener('click', (event) => {
      const star = event.target.closest('.strip-star');
      if (star) {
        const track = this.trackBySlot.get(star.closest('.strip')?.dataset.slot);
        if (track) this.toggleFavorite(track);
        return;
      }
      const open = event.target.closest('.strip-open');
      if (open) {
        const slot = open.closest('.strip')?.dataset.slot;
        if (slot) this.selectSlot(slot);
      }
    });

    // Tabs and drawers on narrow screens.
    on('tab-songs', 'click', () => this.openMobilePanel('songs'));
    on('tab-studio', 'click', () => this.openMobilePanel('studio'));
    window.matchMedia('(min-width: 1001px)').addEventListener('change', () => {
      $('rack-panel')?.classList.remove('is-open');
      $('studio-panel')?.classList.remove('is-open');
      $('stage-caption')?.classList.remove('is-hidden');
    });

    document.addEventListener('keydown', (event) => this.onKeydown(event));
    on('help-modal', 'click', (event) => { if (event.target.id === 'help-modal') this.closeHelp(); });
    on('selftest-close', 'click', () => { $('selftest').hidden = true; });

    this.initKnob('master', { min: 0, max: 100, value: this.settings.master, format: (v) => String(v) });
    this.initKnob('bass', { min: -10, max: 10, value: this.settings.bass, format: (v) => (v > 0 ? `+${v}` : String(v)) });
    this.initKnob('treble', { min: -10, max: 10, value: this.settings.treble, format: (v) => (v > 0 ? `+${v}` : String(v)) });
    this.initKnob('mix', { min: 0, max: 100, value: this.settings.mix, format: (v) => String(v) });

    window.addEventListener('error', () => {
      if (document.body.dataset.ready === 'true') setStatus(this.t('statusBlocked'), 'warn');
    });
  }

  onKeydown(event) {
    const tag = event.target?.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target?.isContentEditable;
    if (event.key === 'Escape') {
      this.closeHelp();
      $('selftest').hidden = true;
      return;
    }
    if (typing) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || event.code === 'Space') {
      event.preventDefault();
      this.togglePlay();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.stepTrack(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.stepTrack(-1);
    } else if (key === 'l') {
      this.setLanguage(this.lang === 'en' ? 'th' : 'en');
    } else if (key === 'm') {
      this.toggleMute();
    } else if (key === 't') {
      const order = [0, 15, 30, 60];
      const next = order[(order.indexOf(this.settings.timer) + 1) % order.length];
      this.setTimer(next);
    } else if (key === 'f') {
      this.setFreePlay(!this.settings.freePlay);
    }
  }

  /* ---------- language ---------- */

  applyLanguage(persist = true) {
    document.documentElement.lang = this.lang;
    document.body.dataset.lang = this.lang;
    for (const node of document.querySelectorAll('[data-i18n]')) {
      const key = node.dataset.i18n;
      node.textContent = this.t(key);
    }
    for (const button of document.querySelectorAll('.lang-btn')) {
      const active = button.dataset.lang === this.lang;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    }
    const freeLabel = $('freeplay-label');
    if (freeLabel) freeLabel.textContent = this.t(this.settings.freePlay ? 'freePlay' : 'coinMode');
    const mute = $('mute-btn');
    if (mute) {
      mute.setAttribute('aria-label', this.t(this.settings.muted ? 'unmute' : 'mute'));
      mute.setAttribute('aria-pressed', String(this.settings.muted));
      const wave = $('mute-wave');
      const slash = $('mute-slash');
      if (wave) wave.style.opacity = this.settings.muted ? '0' : '1';
      if (slash) slash.style.opacity = this.settings.muted ? '1' : '0';
    }
    const help = $('help-btn');
    if (help) help.setAttribute('aria-label', this.t('helpTitle'));
    this.renderCollectionTabs();
    this.renderDisplayControls();
    this.renderRack();
    this.syncNowPlaying();
    this.renderKeypadState();
    this.renderTimer();
    this.updateRangeLabels();
    if (persist) {
      this.settings.lang = this.lang;
      saveSettings(this.settings);
    }
  }

  setLanguage(lang) {
    if (!I18N[lang] || lang === this.lang) return;
    this.lang = lang;
    this.settings.lang = lang;
    this.applyLanguage();
    const label = lang === 'en' ? 'English' : 'ภาษาไทย';
    showToast(label);
    saveSettings(this.settings);
  }

  /* ---------- first-listen playlist and now-playing card ---------- */

  queueTracks() {
    return DEFAULT_QUEUE.map((id) => this.tracks.find((track) => track.id === id)).filter(Boolean);
  }

  showStartPrompt() {
    const button = $('start-playlist');
    if (!button) return;
    button.hidden = false;
    setStatus(this.t('startPlaylist'));
  }

  hideStartPrompt() {
    const button = $('start-playlist');
    if (button) button.hidden = true;
  }

  markVisited() {
    if (!this.firstRun) return;
    this.firstRun = false;
    try { localStorage.setItem(FIRST_RUN_KEY, '1'); } catch { /* private mode */ }
    this.hideStartPrompt();
    this.removeFirstGesture();
  }

  armFirstGesture() {
    this.removeFirstGesture();
    this._firstGesture = (event) => {
      if (!this.firstRun) return;
      const target = event.target;
      if (target?.closest('button, input, select, a, .knob, .strip')) return;
      this.startDefaultPlaylist();
    };
    document.addEventListener('pointerdown', this._firstGesture, true);
  }

  removeFirstGesture() {
    if (this._firstGesture) {
      document.removeEventListener('pointerdown', this._firstGesture, true);
      this._firstGesture = null;
    }
  }

  startDefaultPlaylist() {
    const queue = this.queueTracks();
    if (!queue.length) {
      this.markVisited();
      return false;
    }
    this.queueMode = true;
    this.markVisited();
    return this.chooseTrack(queue[0], { free: true });
  }

  currentCollectionLabel(track) {
    const collection = COLLECTIONS.find((item) => item.letter === track.collection);
    return collection ? (collection[this.lang] || collection.en) : '';
  }

  updateNowDetails(track, playing) {
    if (!track) return;
    const archive = track.engine === 'stream';
    const source = track.source || '';
    const collection = this.currentCollectionLabel(track);
    const duration = formatClock(this.audio.duration() || track.duration || 0);
    const license = archive
      ? this.t('licensePublicDomain')
      : (track.rights === 'original' ? this.t('licenseOriginal') : this.t('licenseMelody'));

    const nowSource = $('now-source');
    if (nowSource) {
      nowSource.hidden = !source;
      nowSource.href = source || '#';
      nowSource.textContent = `${this.t('sourceLink')} ↗`;
      nowSource.setAttribute('aria-label', `${this.t('sourceLink')}: ${track.title[this.lang] || track.title.en}`);
    }

    const sourceEl = $('overlay-source');
    if (sourceEl) {
      sourceEl.hidden = !source;
      sourceEl.href = source || '#';
      sourceEl.textContent = `${this.t('sourceCommons')} ↗`;
    }
    if ($('overlay-title')) $('overlay-title').textContent = track.title[this.lang] || track.title.en;
    if ($('overlay-artist')) $('overlay-artist').textContent = track.artist[this.lang] || track.artist.en;
    if ($('overlay-slot')) $('overlay-slot').textContent = track.slot;
    if ($('overlay-collection')) $('overlay-collection').textContent = collection;
    if ($('overlay-engine')) $('overlay-engine').textContent = this.t(archive ? 'engineStream' : 'engineSynth');
    if ($('overlay-duration')) $('overlay-duration').textContent = duration;
    if ($('overlay-license')) $('overlay-license').textContent = archive ? license : `${license} · MIT`;

    const queue = this.queueTracks();
    const index = queue.findIndex((item) => item.id === track.id);
    const queueEl = $('overlay-queue');
    if (queueEl) {
      const showQueue = this.queueMode && index >= 0;
      queueEl.hidden = !showQueue;
      queueEl.textContent = showQueue ? `${this.t('firstListen')} · ${index + 1}/${queue.length}` : '';
    }

    const overlay = $('now-overlay');
    const visible = overlay?.classList.contains('is-visible');
    const changed = this._overlayTrack !== track.id;
    if (changed) this._overlayDismissed = false;
    if (this.startedOnce && !visible && (changed || (playing && !this._overlayDismissed))) {
      this.showNowOverlay();
    }
    this._overlayTrack = track.id;
  }

  showNowOverlay() {
    const overlay = $('now-overlay');
    if (!overlay || !this.current) return;
    this._overlayDismissed = false;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
  }

  hideNowOverlay() {
    const overlay = $('now-overlay');
    this._overlayDismissed = true;
    clearTimeout(this._overlayTimer);
    this._overlayTimer = null;
    if (!overlay) return;
    overlay.classList.remove('is-visible');
    setTimeout(() => {
      if (!overlay.classList.contains('is-visible')) overlay.hidden = true;
    }, 460);
  }

  /* ---------- settings & UI state ---------- */

  applySettings() {
    this.setFreePlayUI();
    this.updateCredits();
    this.updateMuteUI();
    this.applyKnobValues();
    for (const [name, value] of Object.entries(this.settings.ambient)) {
      const slider = $(`amb-${name}-vol`);
      const output = $(`amb-${name}-value`);
      const toggle = $(`amb-${name}-toggle`);
      if (slider) { slider.value = value; this.setRangeFill(slider); }
      if (output) output.value = value;
      if (toggle) toggle.setAttribute('aria-pressed', String(value > 0));
      toggle?.closest('.ambient-row')?.classList.toggle('is-on', value > 0);
    }
    this.updateTimerButtons(this.settings.timer);
    this.updateFavoriteButton();
    this.setTheme(this.settings.theme, false);
    this.setFontSize(this.settings.fontSize, false);
  }

  save() {
    this.settings.lang = this.lang;
    saveSettings(this.settings);
  }

  setFreePlayUI() {
    const button = $('freeplay-toggle');
    const label = $('freeplay-label');
    if (button) button.setAttribute('aria-pressed', String(this.settings.freePlay));
    if (label) label.textContent = this.t(this.settings.freePlay ? 'freePlay' : 'coinMode');
  }

  setFreePlay(value) {
    this.settings.freePlay = Boolean(value);
    this.setFreePlayUI();
    this.save();
    if (this.settings.freePlay) {
      setStatus(this.t('statusCoin'), 'live');
      showToast(this.t('freePlay'));
    } else {
      showToast(this.t('coinMode'));
      setStatus(this.t('statusNoCredits'), this.settings.credits > 0 ? 'idle' : 'warn');
    }
  }

  updateCredits() {
    const count = $('credit-count');
    if (count) count.textContent = String(this.settings.credits);
  }

  updateMuteUI() {
    const button = $('mute-btn');
    if (!button) return;
    button.setAttribute('aria-pressed', String(this.settings.muted));
    button.setAttribute('aria-label', this.t(this.settings.muted ? 'unmute' : 'mute'));
    const wave = $('mute-wave');
    const slash = $('mute-slash');
    if (wave) wave.style.opacity = this.settings.muted ? '0' : '1';
    if (slash) slash.style.opacity = this.settings.muted ? '1' : '0';
  }

  toggleMute() {
    this.settings.muted = !this.settings.muted;
    if (this.audio.ctx) this.audio.setMuted(this.settings.muted);
    this.updateMuteUI();
    this.save();
    showToast(this.t(this.settings.muted ? 'toastMuted' : 'toastUnmuted'));
  }

  /* ---------- rack ---------- */

  getRackRows() {
    const rack = buildRack(this.builtins, this.externals);
    const query = this.query.trim().toLowerCase();
    let rows = rack;
    if (query) {
      rows = rows.filter(({ track }) => track && this.matchesQuery(track, query));
    } else if (this.collection !== 'ALL') {
      rows = rows.filter(({ slot }) => slot.startsWith(`${this.collection}-`));
    }
    if (this.favoritesOnly) {
      rows = rows.filter(({ track }) => track && this.settings.favorites.includes(track.id));
    }
    return rows;
  }

  matchesQuery(track, query) {
    const haystack = [
      track.title.en, track.title.th, track.artist.en, track.artist.th, track.slot, track.id,
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  }

  refreshSceneRack(rows) {
    if (!this.scene) return;
    let entries;
    if (this.query.trim() || this.favoritesOnly) {
      entries = rows.slice(0, 8);
    } else if (this.collection !== 'ALL') {
      entries = rows;
    } else {
      const letter = this.current?.collection || 'A';
      entries = buildRack(this.builtins, this.externals).filter(({ slot }) => slot.startsWith(`${letter}-`));
    }
    entries = entries.slice(0, 8);
    while (entries.length < 8) entries.push({ slot: '', track: null });
    const key = entries.map((entry) => `${entry.slot}:${entry.track?.id || ''}`).join('|') + `:${this.lang}`;
    if (key === this._sceneKey) return;
    this._sceneKey = key;
    this.scene.refreshRack(entries, this.lang);
  }

  renderRack() {
    const grid = $('rack-grid');
    if (!grid) return;
    const rows = this.getRackRows();
    const count = rows.filter(({ track }) => track).length;
    const counter = $('rack-count');
    if (counter) counter.textContent = this.t(this.query.trim() ? 'resultsCount' : 'recordsCount', { n: count });
    grid.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'rack-empty';
      empty.textContent = this.t(this.query.trim() ? 'noResults' : 'noFavorites');
      grid.appendChild(empty);
      this.refreshSceneRack(rows);
      return;
    }
    for (const entry of rows) grid.appendChild(this.stripNode(entry));
    this.refreshSceneRack(rows);
  }

  syncRackPlaying() {
    for (const strip of document.querySelectorAll('#rack-grid .strip')) {
      strip.classList.toggle('is-playing', Boolean(this.current && strip.dataset.slot === this.current.slot));
    }
  }

  renderCollectionTabs() {
    const container = $('collection-tabs');
    if (!container) return;
    container.replaceChildren();
    const add = (value, label, letter) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'collection-tab';
      button.dataset.collection = value;
      button.setAttribute('aria-pressed', String(this.collection === value));
      button.classList.toggle('is-active', this.collection === value);
      if (letter) {
        const badge = document.createElement('span');
        badge.className = 'tab-letter';
        badge.textContent = letter;
        button.appendChild(badge);
      }
      const text = document.createElement('span');
      text.textContent = label;
      button.appendChild(text);
      container.appendChild(button);
    };
    add('ALL', this.t('allRecords'), '');
    for (const collection of COLLECTIONS) {
      add(collection.letter, collection[this.lang] || collection.en, collection.letter);
    }
  }

  stripNode({ slot, track }) {
    const strip = document.createElement('div');
    strip.className = 'strip';
    strip.dataset.slot = slot;
    strip.setAttribute('role', 'listitem');
    if (!track) strip.classList.add('is-empty');
    if (track && this.current?.id === track.id) strip.classList.add('is-playing');

    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'strip-open';
    open.dataset.action = 'play';
    open.setAttribute('aria-label', track
      ? `${slot} ${track.title[this.lang] || track.title.en} — ${track.artist[this.lang] || track.artist.en}`
      : `${slot} ${this.t('emptySlot')}`);

    const num = document.createElement('span');
    num.className = 'strip-num';
    num.textContent = slot;
    open.appendChild(num);

    const main = document.createElement('span');
    main.className = 'strip-main';
    const title = document.createElement('span');
    title.className = 'strip-title';
    title.textContent = track ? (track.title[this.lang] || track.title.en) : this.t(track ? 'trackUnavailable' : 'emptySlot');
    main.appendChild(title);
    const artist = document.createElement('span');
    artist.className = 'strip-artist';
    artist.textContent = track ? (track.artist[this.lang] || track.artist.en) : this.t('reserved');
    main.appendChild(artist);

    if (track) {
      const meta = document.createElement('span');
      meta.className = 'strip-meta';
      const dot = document.createElement('span');
      dot.className = `engine-dot ${track.engine === 'stream' ? 'stream' : ''}`;
      meta.appendChild(dot);
      const label = document.createElement('span');
      label.textContent = track.engine === 'stream' ? this.t('engineStream') : this.t('engineSynth');
      meta.appendChild(label);
      main.appendChild(meta);
    }
    open.appendChild(main);
    strip.appendChild(open);

    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'strip-star';
    star.dataset.action = 'favorite';
    const isFav = track && this.settings.favorites.includes(track.id);
    star.classList.toggle('is-on', Boolean(isFav));
    star.textContent = '★';
    star.setAttribute('aria-pressed', String(Boolean(isFav)));
    star.setAttribute('aria-label', this.t(isFav ? 'favoriteRemove' : 'favoriteAdd'));
    if (!track) star.hidden = true;
    strip.appendChild(star);
    return strip;
  }

  toggleFavoritesFilter() {
    this.favoritesOnly = !this.favoritesOnly;
    $('fav-filter')?.setAttribute('aria-pressed', String(this.favoritesOnly));
    this.renderRack();
    showToast(this.t(this.favoritesOnly ? 'favorites' : 'allTracks'));
  }

  toggleFavorite(track) {
    if (!track) return;
    const set = new Set(this.settings.favorites);
    if (set.has(track.id)) {
      set.delete(track.id);
      showToast(this.t('toastFavOff'));
    } else {
      set.add(track.id);
      showToast(this.t('toastFavOn'));
    }
    this.settings.favorites = [...set];
    this.save();
    this.updateFavoriteButton();
    this.renderRack();
  }

  updateFavoriteButton() {
    const button = $('favorite-btn');
    if (!button) return;
    const on = Boolean(this.current && this.settings.favorites.includes(this.current.id));
    button.classList.toggle('is-on', on);
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', this.t(on ? 'favoriteRemove' : 'favoriteAdd'));
  }

  /* ---------- selection ---------- */

  renderKeypadState() {
    for (const button of document.querySelectorAll('.key')) {
      const key = button.dataset.key;
      const armed = /^[A-K]$/.test(key) ? this.pending.letter === key : this.pending.number === key;
      button.classList.toggle('is-armed', armed);
    }
  }

  handleKey(key) {
    this.sfx.clack();
    safeVibrate(8);
    if (this.scene) this.scene.pressKey(key);
    if (/^[A-K]$/.test(key)) {
      this.pending.letter = this.pending.letter === key ? null : key;
    } else {
      this.pending.number = this.pending.number === key ? null : key;
    }
    this.renderKeypadState();
    if (this.pending.letter && this.pending.number) {
      const slot = slotOf(this.pending.letter, this.pending.number);
      this.pending = { letter: null, number: null };
      this.renderKeypadState();
      if (slot) this.selectSlot(slot);
    }
  }

  selectSlot(slot) {
    const track = this.trackBySlot.get(slot);
    if (!track) {
      this.sfx.thunk();
      setStatus(this.t('statusEmptySlot'), 'warn');
      showToast(this.t('toastEmpty'), 'warn');
      return false;
    }
    return this.chooseTrack(track);
  }

  chooseTrack(track, { free = false } = {}) {
    if (!track) return false;
    if (!this.settings.freePlay && !free) {
      if (this.settings.credits <= 0) {
        this.sfx.thunk();
        setStatus(this.t('statusNoCredits'), 'warn');
        showToast(this.t('toastNoCredits'), 'warn');
        return false;
      }
      this.settings.credits -= 1;
      this.updateCredits();
    }
    if (this.firstRun) this.markVisited();
    this.current = track;
    this.settings.lastTrack = track.id;
    this.queueMode = DEFAULT_QUEUE.includes(track.id);
    let pageChanged = false;
    if (this.query) {
      this.query = '';
      const search = $('rack-search');
      if (search) search.value = '';
      pageChanged = true;
    }
    if (this.collection !== 'ALL' && track.collection && track.collection !== this.collection) {
      this.collection = track.collection;
      this.renderCollectionTabs();
      pageChanged = true;
    }
    this.save();
    this.sfx.clack();
    if (this.scene) this.scene.flashStrip(track.slot);
    const started = this.audio.play(track);
    if (started) {
      if (this.scene) { this.scene.setPlaying(true); this.scene.setDim(0); }
      if (!this.audio.timer.active && this.settings.timer > 0) this.audio.setTimer(this.settings.timer);
      setStatus(`${this.t('statusPlaying')} · ${track.title[this.lang] || track.title.en}`, 'live');
      safeVibrate([8, 30, 8]);
    }
    this.startedOnce = true;
    this.syncNowPlaying();
    if (pageChanged) this.renderRack();
    else {
      this.refreshSceneRack(this.getRackRows());
      this.syncRackPlaying();
    }
    return started;
  }

  togglePlay() {
    if (this.firstRun) {
      this.startDefaultPlaylist();
      return;
    }
    this._overlayDismissed = false;
    if (!this.current) {
      this.current = this.trackBySlot.get('A-1') || this.tracks[0];
    }
    if (this.audio.status === 'playing' || this.audio.status === 'loading') {
      this.audio.pause();
      this.scene?.setPlaying(false);
      setStatus(this.t('statusPaused'));
      this.sfx.thunk();
    } else if (this.audio.status === 'paused') {
      this.audio.resume();
      this.scene?.setPlaying(true);
      this.scene?.setDim(0);
      setStatus(this.t('statusPlaying'), 'live');
      this.sfx.clack();
    } else {
      this.chooseTrack(this.current, { free: true });
    }
    this.syncNowPlaying();
  }

  stepTrack(direction) {
    const queue = this.queueTracks();
    const available = this.queueMode && queue.length
      ? queue
      : this.tracks.filter((track) => track.engine === 'synth' || track.url);
    if (!available.length) return;
    const nextId = nextTrackId(available, this.current?.id, direction);
    const track = available.find((item) => item.id === nextId);
    if (track) this.chooseTrack(track, { free: true });
  }

  stop() {
    this.audio.stop();
    this.scene?.setPlaying(false);
    this.scene?.setDim(0);
    setStatus(this.t('statusStopped'));
    this.hideNowOverlay();
    this.syncNowPlaying();
  }

  onSceneStrip(track, slot) {
    if (track) this.chooseTrack(track);
    else this.selectSlot(slot);
  }

  onStreamEnded() {
    this.stepTrack(1);
  }

  onStreamError(track) {
    this.audio.status = 'error';
    this.scene?.setPlaying(false);
    setStatus(this.t('statusStreamError'), 'warn');
    showToast(this.t('toastStreamError'), 'warn');
    this.syncNowPlaying();
    void track;
  }

  /* ---------- coins ---------- */

  insertCoin() {
    this.sfx.coin();
    this.scene?.dropCoin();
    this.settings.credits = Math.min(99, this.settings.credits + 1);
    this.updateCredits();
    this.save();
    setStatus(this.t('statusCoin'), 'live');
    showToast(this.t('toastQuarter'));
  }

  /* ---------- ambient ---------- */

  toggleAmbient(name) {
    if (!name) return;
    const current = this.settings.ambient[name] || 0;
    const next = current > 0 ? 0 : (this.ambientLast[name] || 35);
    if (current > 0) this.ambientLast[name] = current;
    const slider = $(`amb-${name}-vol`);
    if (slider) { slider.value = next; this.setRangeFill(slider); }
    this.setAmbient(name, next);
    this.sfx.clack();
  }

  onAmbientSlider(slider) {
    const name = slider.closest('.ambient-row')?.dataset.ambient;
    if (!name) return;
    this.setRangeFill(slider);
    this.setAmbient(name, Number(slider.value));
  }

  setAmbient(name, value) {
    const v = Math.round(clamp(value, 0, 100));
    this.settings.ambient[name] = v;
    this.audio.setAmbient(name, v);
    const output = $(`amb-${name}-value`);
    if (output) output.value = v;
    const toggle = $(`amb-${name}-toggle`);
    if (toggle) toggle.setAttribute('aria-pressed', String(v > 0));
    toggle?.closest('.ambient-row')?.classList.toggle('is-on', v > 0);
    if (v > 0) this.ambientLast[name] = v;
    this.save();
  }

  /* ---------- theme and text size ---------- */

  renderDisplayControls() {
    for (const swatch of document.querySelectorAll('.theme-swatch')) {
      const theme = THEMES.find((item) => item.id === swatch.dataset.theme);
      const active = this.settings.theme === swatch.dataset.theme;
      swatch.classList.toggle('is-active', active);
      swatch.setAttribute('aria-pressed', String(active));
      const label = theme ? (theme[this.lang] || theme.en) : swatch.dataset.theme;
      swatch.setAttribute('aria-label', `${this.t('themeLabel')}: ${label}`);
      swatch.title = label;
    }
    for (const button of document.querySelectorAll('#font-size-group button')) {
      const active = this.settings.fontSize === button.dataset.size;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      const labels = { normal: 'textNormal', large: 'textLarge', xlarge: 'textXLarge' };
      button.setAttribute('aria-label', this.t(labels[button.dataset.size] || 'textNormal'));
    }
  }

  setTheme(id, persist = true) {
    const theme = THEMES.find((item) => item.id === id) || THEMES[0];
    this.settings.theme = theme.id;
    document.body.dataset.theme = theme.id;
    if (this.scene) this.scene.setTheme(theme);
    this.renderDisplayControls();
    if (persist) {
      this.save();
      showToast(`${this.t('themeLabel')}: ${theme[this.lang] || theme.en}`);
    }
  }

  setFontSize(size, persist = true) {
    const value = ['normal', 'large', 'xlarge'].includes(size) ? size : 'normal';
    this.settings.fontSize = value;
    document.body.dataset.font = value;
    this.renderDisplayControls();
    if (persist) {
      this.save();
      const labels = { normal: 'textNormal', large: 'textLarge', xlarge: 'textXLarge' };
      showToast(this.t(labels[value]));
    }
  }

  /* ---------- knobs ---------- */

  initKnob(key, { min, max, value, format }) {
    const el = $(`${key}-knob`);
    if (!el) return;
    const knob = { el, key, min, max, value: clamp(value, min, max), format };
    this.knobs = this.knobs || {};
    this.knobs[key] = knob;
    this.renderKnob(knob);
    const commit = (next) => {
      knob.value = Math.round(clamp(next, min, max));
      this.renderKnob(knob);
      if (key === 'master') this.audio.setMaster(knob.value);
      else if (key === 'bass' || key === 'treble') this.audio.setEQ(key, knob.value);
      else if (key === 'mix') this.audio.setMix(knob.value);
      this.save();
    };
    let drag = null;
    el.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      el.setPointerCapture?.(event.pointerId);
      drag = { y: event.clientY, value: knob.value };
      el.classList.add('is-dragging');
    });
    el.addEventListener('pointermove', (event) => {
      if (!drag) return;
      const span = (max - min) / 160;
      commit(drag.value + (drag.y - event.clientY) * span);
    });
    const end = () => { drag = null; el.classList.remove('is-dragging'); };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('wheel', (event) => {
      event.preventDefault();
      commit(knob.value + (event.deltaY > 0 ? -1 : 1));
    }, { passive: false });
    el.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 5 : 1;
      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') { event.preventDefault(); commit(knob.value + step); }
      if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') { event.preventDefault(); commit(knob.value - step); }
      if (event.key === 'Home') { event.preventDefault(); commit(min); }
      if (event.key === 'End') { event.preventDefault(); commit(max); }
    });
  }

  renderKnob(knob) {
    const span = knob.max - knob.min;
    const pct = (knob.value - knob.min) / span;
    const rot = -135 + pct * 270;
    knob.el.style.setProperty('--rot', `${rot}deg`);
    knob.el.style.setProperty('--arc', `${pct * 270}deg`);
    knob.el.setAttribute('aria-valuenow', String(knob.value));
    knob.el.setAttribute('aria-valuetext', knob.format(knob.value));
    const out = $(`${knob.key}-value`);
    if (out) out.textContent = knob.format(knob.value);
  }

  applyKnobValues() {
    if (!this.knobs) return;
    for (const [key, value] of [['master', this.settings.master], ['bass', this.settings.bass], ['treble', this.settings.treble], ['mix', this.settings.mix]]) {
      const knob = this.knobs[key];
      if (!knob) continue;
      knob.value = clamp(value, knob.min, knob.max);
      this.renderKnob(knob);
    }
  }

  /* ---------- timer ---------- */

  setTimer(minutes) {
    this.audio.setTimer(minutes);
    this.updateTimerButtons(minutes);
    this.scene?.setDim(0);
    this.save();
    if (minutes === 0) {
      showToast(this.t('toastTimerOff'));
      setStatus(this.t('statusStopped'));
    } else {
      showToast(this.t('toastTimer', { n: minutes }));
      setStatus(`${this.t('timerRemaining')} ${minutes} min`);
    }
    this.renderTimer();
  }

  updateTimerButtons(minutes) {
    for (const button of document.querySelectorAll('.timer-btn')) {
      const active = Number(button.dataset.minutes) === Number(minutes);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }

  renderTimer() {
    const state = this.audio.getTimerState();
    const readout = $('timer-readout');
    const chip = $('timer-chip');
    const activeButtons = document.querySelectorAll('.timer-btn.is-active');
    if (state.active) {
      const text = `${formatClock(state.remaining)}`;
      if (readout) readout.textContent = text;
      if (chip) { chip.hidden = false; chip.textContent = `${this.t('timerRemaining')} ${text}`; }
      if (state.remaining <= 120) {
        chip?.classList.add('is-fading');
        this.scene?.setDim(1 - state.gain);
      }
    } else {
      if (chip) { chip.hidden = true; chip.classList.remove('is-fading'); }
      if (readout) {
        if (state.ended) readout.textContent = this.t('timerEnded');
        else if (this.settings.timer > 0) readout.textContent = formatClock(this.settings.timer * 60);
        else readout.textContent = this.t('timerIdle');
      }
      if (state.ended) this.updateTimerButtons(0);
    }
  }

  onTimerEnd() {
    this.settings.timer = 0;
    this.save();
    this.scene?.setPlaying(false);
    this.scene?.setDim(1);
    this.updateTimerButtons(0);
    setStatus(this.t('statusTimerEnded'), 'warn');
    showToast(this.t('toastSleep'));
    this.syncNowPlaying();
    this.renderTimer();
  }

  /* ---------- progress ---------- */

  onAudioTick() {
    if (!this.scene) return;
    this.scene.setEnergy(this.audio.level);
    this.scene.setPlaying(this.audio.status === 'playing');
    if (this.audio.status === 'playing') {
      const chipState = this.audio.getTimerState();
      if (chipState.active && chipState.remaining <= 120) this.scene.setDim(1 - chipState.gain);
    }
    this.updateProgress();
  }

  updateProgress() {
    const position = this.audio.position();
    const duration = this.audio.duration();
    const elapsed = $('elapsed');
    const total = $('duration');
    if (elapsed) elapsed.textContent = formatClock(position);
    if (total) total.textContent = formatClock(duration);
    const seek = $('seek');
    if (seek && !this.seeking && duration > 0) {
      const value = Math.min(1000, Math.round((position / duration) * 1000));
      seek.value = String(value);
      this.setRangeFill(seek);
    }
  }

  syncNowPlaying() {
    const track = this.current;
    if (!track) return;
    const title = track.title[this.lang] || track.title.en;
    const artist = track.artist[this.lang] || track.artist.en;
    const playing = this.audio.status === 'playing' || this.audio.status === 'loading';
    if ($('now-title')) $('now-title').textContent = title;
    if ($('now-artist')) $('now-artist').textContent = artist;
    if ($('now-slot')) $('now-slot').textContent = track.slot;
    if ($('caption-title')) $('caption-title').textContent = title;
    if ($('caption-slot')) $('caption-slot').textContent = track.slot;
    const engine = $('now-engine');
    if (engine) {
      engine.textContent = track.engine === 'stream' ? this.t('engineStream') : this.t('engineSynth');
      engine.classList.toggle('is-stream', track.engine === 'stream');
    }
    document.querySelector('.now-card')?.classList.toggle('is-playing', playing);
    document.querySelector('.stage-caption')?.classList.toggle('is-playing', playing);
    const play = $('play-btn');
    if (play) {
      play.classList.toggle('is-playing', playing);
      play.setAttribute('aria-label', this.t(playing ? 'ariaPause' : 'ariaPlay'));
      const icon = $('play-icon');
      if (icon) {
        icon.innerHTML = playing
          ? '<rect x="7" y="5" width="3.4" height="14" rx="1" fill="currentColor"/><rect x="13.6" y="5" width="3.4" height="14" rx="1" fill="currentColor"/>'
          : '<path d="M8 5v14l11-7L8 5Z" fill="currentColor"/>';
      }
    }
    this.updateFavoriteButton();
    this.updateNowDetails(track, playing);
    this.updateProgress();
    document.title = `${playing ? '▶ ' : ''}${title} — Wurlitzer Lullaby`;
  }

  /* ---------- export / reset ---------- */

  exportSettings() {
    const payload = exportPayload(this.settings, this.tracks, new Date().toISOString());
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wurlitzer-lullaby-settings.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setStatus(this.t('statusExported'));
    showToast(this.t('toastExported'));
  }

  resetSettings() {
    if (!this.resetArmed) {
      this.resetArmed = true;
      showToast(`${this.t('resetSettings')}?`);
      setTimeout(() => { this.resetArmed = false; }, 2600);
      return;
    }
    this.resetArmed = false;
    const lang = this.lang;
    this.settings = normalizeSettings({ ...DEFAULT_SETTINGS, lang, favorites: [], lastTrack: 'brahms' });
    this.audio.store = this.settings;
    this.current = this.tracks.find((track) => track.id === 'brahms') || this.builtins[0];
    this.favoritesOnly = false;
    this.query = '';
    this.collection = 'A';
    if ($('rack-search')) $('rack-search').value = '';
    $('fav-filter')?.setAttribute('aria-pressed', 'false');
    this.audio.setMaster(this.settings.master);
    this.audio.setEQ('bass', this.settings.bass);
    this.audio.setEQ('treble', this.settings.treble);
    this.audio.setMix(this.settings.mix);
    for (const name of ['rain', 'ocean', 'crickets']) this.setAmbient(name, 0);
    this.audio.setTimer(0);
    this.settings.freePlay = true;
    this.setFreePlayUI();
    this.updateCredits();
    this.updateMuteUI();
    this.applyKnobValues();
    this.setTheme('midnight', false);
    this.setFontSize('normal', false);
    this.renderCollectionTabs();
    this.renderRack();
    this.syncNowPlaying();
    this.updateTimerButtons(0);
    this.save();
    setStatus(this.t('statusReset'));
    showToast(this.t('toastReset'));
  }

  /* ---------- help / mobile ---------- */

  openHelp() {
    const modal = $('help-modal');
    if (!modal) return;
    modal.hidden = false;
    $('help-close')?.focus();
  }

  closeHelp() {
    const modal = $('help-modal');
    if (modal && !modal.hidden) modal.hidden = true;
  }

  openMobilePanel(which) {
    const rack = $('rack-panel');
    const studio = $('studio-panel');
    const caption = $('stage-caption');
    const songs = which === 'songs';
    rack?.classList.toggle('is-open', songs);
    studio?.classList.toggle('is-open', !songs);
    caption?.classList.toggle('is-hidden', true);
    $('tab-songs')?.classList.toggle('is-active', songs);
    $('tab-studio')?.classList.toggle('is-active', !songs);
    if (rack && songs) rack.querySelector('button')?.focus({ preventScroll: true });
    if (studio && !songs) studio.querySelector('button')?.focus({ preventScroll: true });
  }

  /* ---------- self test ---------- */

  async runSelfTest(showOverlay = false) {
    const checks = [];
    const check = (name, fn) => {
      try {
        const value = fn();
        checks.push({ name, ok: value !== false });
      } catch (error) {
        checks.push({ name, ok: false, detail: error?.message || String(error) });
      }
    };

    check('WebGL renderer is live', () => Boolean(this.scene?.renderer?.getContext()));
    check('Cabinet has a full assembly', () => (this.scene?.cabinet.children.length || 0) >= 30);
    check('Both bubble tubes contain rising bubbles', () => (this.scene?.bubbles.length || 0) >= 40);
    check('Arch marquee bulbs are present', () => (this.scene?.bulbs.length || 0) === 30);
    check('Record deck and tone arm exist', () => Boolean(this.scene?.record && this.scene?.toneArm));
    check('Fifty procedural lullabies are registered', () => this.builtins.length === 50);
    check('Every synth sequence parses', () => this.builtins.every((track) => track.sequence.length > 12 && track.duration > 8));
    check('Slots are unique and ordered', () => new Set(this.tracks.map((track) => track.slot)).size === this.tracks.length);
    check('EN and TH dictionaries are symmetrical', () => {
      const en = Object.keys(I18N.en).sort();
      const th = Object.keys(I18N.th).sort();
      return en.length >= 90 && en.join('|') === th.join('|');
    });
    check('Eleven collection pages and 88 rack slots exist', () => COLLECTIONS.length === 11 && buildRack(this.builtins, this.externals).length === 88);
    check('Nineteen mechanical keys render', () => document.querySelectorAll('.key').length === 19);
    check('Archive manifest responded', () => this.manifestOk === true);
    check('Rack map includes archive slots', () => ['H-1', 'H-2', 'I-1', 'K-8'].every((slot) => this.trackBySlot.has(slot)));
    check('Fade curve is smooth and monotonic', () => fadeGain(120) === 1 && fadeGain(0) === 0 && fadeGain(60) > 0.49 && fadeGain(60) < 0.51);
    check('Clock formatting is exact', () => formatClock(0) === '0:00' && formatClock(65) === '1:05' && formatClock(372) === '6:12');
    check('Settings normalise outliers', () => {
      const normalized = normalizeSettings({ master: 900, bass: -90, ambient: { rain: 300 }, favorites: ['a', 'a', 3] });
      return normalized.master === 100 && normalized.bass === -10 && normalized.ambient.rain === 100 && normalized.favorites.length === 1;
    });
    check('Audio graph builds on demand', () => {
      this.audio.ensure();
      return Boolean(this.audio.graph && this.audio.graph.master && this.audio.ctx);
    });
    check('Synth sequencer starts and pauses', () => {
      const before = this.audio.status;
      this.audio.play(this.builtins[0]);
      const started = this.audio.status === 'playing';
      this.audio.pause();
      const paused = this.audio.status === 'paused';
      this.audio.stop();
      this.audio.status = before;
      return started && paused;
    });
    check('Sleep timer fades before zero', () => {
      this.audio.setTimer(15);
      const active = this.audio.getTimerState().active;
      this.audio.debugSetRemaining(60);
      const mid = this.audio.getTimerState().gain;
      this.audio.setTimer(0);
      return active && mid > 0.49 && mid < 0.51;
    });
    check('Empty G-8 slot is rejected', () => this.selectSlot('G-8') === false);
    check('Export payload is well formed', () => {
      const payload = exportPayload(this.settings, this.tracks, new Date(0).toISOString());
      return payload.schema === 1 && Array.isArray(payload.tracks) && payload.tracks.length >= 50;
    });
    check('Language switch updates the document', () => {
      const before = this.lang;
      this.setLanguage(before === 'en' ? 'th' : 'en');
      const changed = document.documentElement.lang !== before;
      this.setLanguage(before);
      return changed;
    });
    check('Scene accepts energy and dim state', () => {
      if (!this.scene) return false;
      this.scene.setEnergy(0.8);
      this.scene.setDim(0);
      return true;
    });
    check('Theme switch reaches the 3D scene', () => {
      const before = this.settings.theme;
      this.setTheme('amber', false);
      const ok = document.body.dataset.theme === 'amber' && this.scene?.theme?.id === 'amber';
      this.setTheme(before, false);
      return ok;
    });
    check('Text size switch updates the document', () => {
      const before = this.settings.fontSize;
      this.setFontSize('large', false);
      const ok = document.body.dataset.font === 'large';
      this.setFontSize(before, false);
      return ok;
    });
    check('First-listen queue is complete', () => {
      const queue = this.queueTracks();
      return queue.length === 32 && queue.every((track) => track.engine === 'stream' && track.license === 'Public domain');
    });
    check('Archive source link is exposed', () => {
      const track = this.trackBySlot.get('H-1');
      if (!track) return false;
      this.updateNowDetails(track, false);
      const source = document.getElementById('overlay-source');
      return Boolean(source && source.href.startsWith('https://commons.wikimedia.org/'));
    });

    const passed = checks.filter((item) => item.ok).length;
    const report = { total: checks.length, passed, checks };
    document.body.dataset.selftest = `${passed}/${checks.length}`;
    window.__wurlitzerReport = report;

    if (showOverlay) {
      const overlay = $('selftest');
      const summary = $('selftest-summary');
      const list = $('selftest-list');
      if (summary) summary.textContent = `${passed}/${checks.length} ${this.t('selftestDone')}`;
      if (list) {
        list.replaceChildren();
        for (const item of checks) {
          const li = document.createElement('li');
          li.className = item.ok ? 'ok' : '';
          li.textContent = `${item.ok ? 'PASS' : 'FAIL'} · ${item.name}${item.detail ? ` — ${item.detail}` : ''}`;
          list.appendChild(li);
        }
      }
      if (overlay) overlay.hidden = false;
    }
    return report;
  }

  setRangeFill(input) {
    if (!input) return;
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const pct = ((Number(input.value) - min) / (max - min)) * 100;
    input.style.setProperty('--fill', `${clamp(pct, 0, 100)}%`);
  }

  updateRangeLabels() {
    for (const input of document.querySelectorAll('input[type="range"]')) this.setRangeFill(input);
    for (const name of ['rain', 'ocean', 'crickets']) {
      const slider = $(`amb-${name}-vol`);
      const output = $(`amb-${name}-value`);
      if (slider && output) output.value = slider.value;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Bootstrap                                                           */
/* ------------------------------------------------------------------ */

function bootApp() {
  try {
    const app = new WurlitzerApp();
    window.__wurlitzer = app;
    window.__wurlitzerAudio = app.audio;
    window.__wurlitzerScene = app.scene;
  } catch (error) {
    console.error(error);
    document.body.dataset.ready = 'error';
    const step = $('loading-step');
    if (step) step.textContent = 'This browser could not start WebGL. Please try a recent Chrome, Edge, Firefox or Safari.';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp, { once: true });
} else {
  bootApp();
}
