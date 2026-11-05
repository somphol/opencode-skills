/* Cute3D — Procedural Code-Only Animal Studio
 * ---------------------------------------------------------------------------
 * Everything you can see is generated at runtime: four animal characters,
 * their accessories, the studio props and every sound. No model files, no
 * texture files, no audio files. The only remote dependency is Three.js from a CDN.
 *
 * The file is split into three marked regions:
 *   [ENGINE]  pure, DOM-free helpers — Node tests slice this block out.
 *   [I18N]    the complete EN/TH dictionary — also sliced out by tests.
 *   [APP]     Three.js scene, rigs, animation, audio and UI.
 * ------------------------------------------------------------------------- */

/* ENGINE:START */
const createStudioEngine = () => {
  const ANIMALS = ['bear', 'bunny', 'penguin', 'shiba'];
  const EXPRESSIONS = ['happy', 'sleepy', 'curious', 'wiggle'];
  const ACCESSORIES = ['bowtie', 'partyHat', 'glasses'];
  const COLOR_KEYS = ['main', 'belly', 'blush'];
  const PRESET_LIMIT = 10;

  const DEFAULT_COLORS = {
    bear: { main: '#c08a6d', belly: '#ffe9df', blush: '#ff9db6' },
    bunny: { main: '#f0d3c2', belly: '#fff6ef', blush: '#ffa8bf' },
    penguin: { main: '#4a5774', belly: '#fdf8f0', blush: '#ffa9b8' },
    shiba: { main: '#dfa163', belly: '#fff4e4', blush: '#ff9f8f' },
  };

  const PALETTES = [
    { id: 'mochi', main: '#c08a6d', belly: '#ffe9df', blush: '#ff9db6' },
    { id: 'mint', main: '#7fc7b1', belly: '#f4fffb', blush: '#ff9fb2' },
    { id: 'lilac', main: '#a795d6', belly: '#fbf6ff', blush: '#ffb3cf' },
    { id: 'sunset', main: '#e8996b', belly: '#fff3e6', blush: '#ff8f8f' },
    { id: 'midnight', main: '#5f6b8c', belly: '#e9eef7', blush: '#c7a6ff' },
  ];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (current, target, lambda, dt) => lerp(current, target, 1 - Math.exp(-lambda * dt));
  const smoothstep = (edge0, edge1, x) => {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeOutBack = (t) => {
    const c = 1.70158;
    const x = clamp(t, 0, 1);
    return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
  };

  const normalizeHex = (value, fallback = '#c08a6d') => {
    if (typeof value !== 'string') return fallback;
    let hex = value.trim().toLowerCase();
    if (!hex.startsWith('#')) hex = `#${hex}`;
    if (/^#[0-9a-f]{3}$/.test(hex)) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    return /^#[0-9a-f]{6}$/.test(hex) ? hex : fallback;
  };

  const hexToRgb = (hex) => {
    const clean = normalizeHex(hex).slice(1);
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  };

  const rgbToHex = (r, g, b) => {
    const to = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
    return `#${to(r)}${to(g)}${to(b)}`;
  };

  const mixHex = (a, b, t) => {
    const x = hexToRgb(a);
    const y = hexToRgb(b);
    return rgbToHex(lerp(x.r, y.r, t), lerp(x.g, y.g, t), lerp(x.b, y.b, t));
  };

  const shade = (hex, amount) => {
    if (amount < 0) {
      const { r, g, b } = hexToRgb(hex);
      const k = 1 + amount;
      return rgbToHex(r * k, g * k, b * k);
    }
    return mixHex(hex, '#ffffff', amount);
  };

  const paletteById = (id) => PALETTES.find((p) => p.id === id) || PALETTES[0];

  /* Blink envelope: 1 = wide open, near 0 = closed. Deterministic per seed. */
  const blinkScale = (time, seed = 0) => {
    const period = 3.4 + (Math.abs(seed) % 5) * 0.37;
    const offset = Math.abs(seed) * 1.713;
    const phase = ((time + offset) % period + period) % period;
    const close = 0.17;
    const closed = 0.035;
    const dip = (start) => {
      const local = phase - start;
      if (local <= 0 || local >= close) return 1;
      const half = close / 2;
      const k = local < half ? local / half : (close - local) / half;
      return lerp(1, closed, smoothstep(0, 1, k));
    };
    let scale = dip(0);
    const cycle = Math.floor((time + offset) / period);
    if (cycle % 6 === 3) scale = Math.min(scale, dip(0.34));
    return scale;
  };

  const EXPRESSION_POSES = {
    happy: {
      eyeOpen: 1, eyeScale: 1, headTilt: 0, headNod: 0, earAmp: 0.11,
      tailAmp: 0.26, tailSpeed: 2.6, floatAmp: 1, cheek: 1, earLift: 0,
    },
    sleepy: {
      eyeOpen: 0.12, eyeScale: 1, headTilt: 0.2, headNod: 0.12, earAmp: 0.025,
      tailAmp: 0.05, tailSpeed: 1, floatAmp: 0.45, cheek: 0.7, earLift: -0.12,
    },
    curious: {
      eyeOpen: 1.12, eyeScale: 1.06, headTilt: -0.3, headNod: -0.06, earAmp: 0.16,
      tailAmp: 0.16, tailSpeed: 3.2, floatAmp: 1.1, cheek: 0.85, earLift: 0.22,
    },
    wiggle: {
      eyeOpen: 1, eyeScale: 1.05, headTilt: 0.07, headNod: 0, earAmp: 0.3,
      tailAmp: 0.62, tailSpeed: 6.2, floatAmp: 1.5, cheek: 1.15, earLift: 0,
    },
  };

  const expressionPose = (expression) => {
    const pose = EXPRESSION_POSES[expression] || EXPRESSION_POSES.happy;
    return { ...pose };
  };

  const sanitizeColors = (raw, animal = 'bear') => {
    const fallback = DEFAULT_COLORS[animal] || DEFAULT_COLORS.bear;
    const source = raw && typeof raw === 'object' ? raw : {};
    const colors = {};
    for (const key of COLOR_KEYS) colors[key] = normalizeHex(source[key], fallback[key]);
    return colors;
  };

  const hashString = (text) => {
    let hash = 2166136261;
    const value = String(text);
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash);
  };

  const sanitizeAccessories = (raw) => {
    const source = raw && typeof raw === 'object' ? raw : {};
    const accessories = {};
    for (const key of ACCESSORIES) accessories[key] = Boolean(source[key]);
    return accessories;
  };

  const sanitizePreset = (raw) => {
    if (!raw || typeof raw !== 'object') return null;
    if (!ANIMALS.includes(raw.animal)) return null;
    const animal = raw.animal;
    const colors = sanitizeColors(raw.colors, animal);
    const accessories = sanitizeAccessories(raw.accessories);
    const expression = EXPRESSIONS.includes(raw.expression) ? raw.expression : 'happy';
    let name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 42) : '';
    if (!name) name = `${animal} preset`;
    let id = typeof raw.id === 'string' ? raw.id : '';
    if (!/^[a-z0-9-]{6,48}$/.test(id)) {
      id = `p-${hashString(`${animal}|${name}|${JSON.stringify(colors)}`).toString(36)}`;
    }
    const createdAt = Number.isFinite(raw.createdAt) ? Math.max(0, raw.createdAt) : 0;
    return { id, name, animal, colors, accessories, expression, createdAt };
  };

  const sanitizePresets = (raw) => {
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    const out = [];
    for (const item of raw) {
      const preset = sanitizePreset(item);
      if (!preset || seen.has(preset.id)) continue;
      seen.add(preset.id);
      out.push(preset);
      if (out.length >= PRESET_LIMIT) break;
    }
    return out;
  };

  const snapshotFilename = (animal, date = new Date()) => {
    const id = ANIMALS.includes(animal) ? animal : 'pet';
    const day = date instanceof Date ? date.toISOString().slice(0, 10) : String(date).slice(0, 10);
    return `cute3d-${id}-${day}.png`;
  };

  const encodeShareState = (state = {}) => {
    const params = new URLSearchParams();
    const animal = ANIMALS.includes(state.animal) ? state.animal : 'bear';
    const colors = sanitizeColors(state.colors, animal);
    params.set('a', animal);
    params.set('c', COLOR_KEYS.map((key) => colors[key].slice(1)).join('-'));
    params.set('x', EXPRESSIONS.includes(state.expression) ? state.expression : 'happy');
    const worn = ACCESSORIES.filter((key) => state.accessories && state.accessories[key]);
    params.set('o', worn.join(','));
    params.set('l', state.lang === 'th' ? 'th' : 'en');
    return params.toString();
  };

  const decodeShareState = (input) => {
    let params;
    if (input instanceof URLSearchParams) params = input;
    else if (typeof input === 'string') {
      const query = input.includes('?') ? input.slice(input.indexOf('?') + 1) : input;
      params = new URLSearchParams(query);
    } else if (input && typeof input === 'object') {
      params = new URLSearchParams(input);
    } else {
      params = new URLSearchParams();
    }

    const animal = ANIMALS.includes(params.get('a')) ? params.get('a') : null;
    const fallbackAnimal = animal || 'bear';
    const colorParts = (params.get('c') || '').split('-');
    const colors = sanitizeColors(
      {
        main: colorParts[0] ? `#${colorParts[0]}` : undefined,
        belly: colorParts[1] ? `#${colorParts[1]}` : undefined,
        blush: colorParts[2] ? `#${colorParts[2]}` : undefined,
      },
      fallbackAnimal,
    );
    const expression = EXPRESSIONS.includes(params.get('x')) ? params.get('x') : 'happy';
    const accessories = sanitizeAccessories(
      Object.fromEntries(
        (params.get('o') || '')
          .split(',')
          .filter((key) => ACCESSORIES.includes(key))
          .map((key) => [key, true]),
      ),
    );
    const lang = params.get('l') === 'th' ? 'th' : 'en';
    return { animal, expression, colors, accessories, lang, valid: Boolean(animal) };
  };

  const soundPattern = (kind) => {
    const patterns = {
      boing: {
        gain: 0.2,
        notes: [
          { type: 'sine', from: 170, to: 520, at: 0, dur: 0.13 },
          { type: 'triangle', from: 520, to: 280, at: 0.11, dur: 0.4 },
          { type: 'sine', from: 1400, to: 900, at: 0.02, dur: 0.08 },
        ],
      },
      chime: {
        gain: 0.14,
        notes: [
          { type: 'triangle', from: 880, to: 880, at: 0, dur: 0.22 },
          { type: 'triangle', from: 1174.7, to: 1174.7, at: 0.07, dur: 0.24 },
          { type: 'sine', from: 1568, to: 1568, at: 0.14, dur: 0.42 },
        ],
      },
      blink: {
        gain: 0.05,
        notes: [{ type: 'sine', from: 1500, to: 700, at: 0, dur: 0.07 }],
      },
      pop: {
        gain: 0.1,
        notes: [{ type: 'triangle', from: 420, to: 780, at: 0, dur: 0.11 }],
      },
      wiggle: {
        gain: 0.11,
        notes: [
          { type: 'sine', from: 660, to: 990, at: 0, dur: 0.1 },
          { type: 'sine', from: 990, to: 1320, at: 0.09, dur: 0.12 },
        ],
      },
      swoosh: {
        gain: 0.06,
        notes: [{ type: 'sawtooth', from: 220, to: 90, at: 0, dur: 0.3 }],
      },
    };
    return patterns[kind] ? JSON.parse(JSON.stringify(patterns[kind])) : null;
  };

  const clampSnapshotSize = (value) => {
    const size = Number(value);
    if (!Number.isFinite(size)) return 2048;
    return clamp(Math.round(size / 64) * 64, 512, 4096);
  };

  const formatMeshLabel = (count) => `${Math.max(0, Math.round(Number(count) || 0))}`;

  return {
    ANIMALS,
    EXPRESSIONS,
    ACCESSORIES,
    COLOR_KEYS,
    PRESET_LIMIT,
    DEFAULT_COLORS,
    PALETTES,
    clamp,
    lerp,
    damp,
    smoothstep,
    easeOutCubic,
    easeOutBack,
    normalizeHex,
    hexToRgb,
    rgbToHex,
    mixHex,
    shade,
    paletteById,
    blinkScale,
    expressionPose,
    sanitizeColors,
    sanitizeAccessories,
    sanitizePreset,
    sanitizePresets,
    snapshotFilename,
    encodeShareState,
    decodeShareState,
    soundPattern,
    clampSnapshotSize,
    formatMeshLabel,
    hashString,
  };
};
/* ENGINE:END */

/* I18N:START */
const I18N = {
  en: {
    'brand.sub': 'Procedural Animal Studio',
    'status.live': 'Live procedural',
    'status.loading': 'Waking up the pets…',
    'common.sound': 'Sound',
    'common.reset': 'Reset',
    'stage.hint': 'Drag to orbit · Scroll to zoom · Click the pet',
    'stage.meshes': 'meshes',
    'stage.react': 'React',
    'panel.open': 'Customize',
    'panel.title': 'Studio',
    'panel.sub': 'Four friends, zero model files.',
    'section.animals': 'Characters',
    'section.animalsNote': '4 originals',
    'section.expression': 'Expression',
    'section.expressionNote': 'Tap to try',
    'section.colors': 'Colours',
    'section.accessories': 'Accessories',
    'section.accessoriesNote': 'Code-built',
    'section.studio': 'Studio tools',
    'animal.bear': 'Chibi Bear',
    'animal.bearTrait': 'Huggable',
    'animal.bunny': 'Bunny',
    'animal.bunnyTrait': 'Bouncy',
    'animal.penguin': 'Penguin',
    'animal.penguinTrait': 'Waddly',
    'animal.shiba': 'Shiba',
    'animal.shibaTrait': 'Cheerful',
    'expr.happy': 'Happy',
    'expr.sleepy': 'Sleepy',
    'expr.curious': 'Curious',
    'expr.wiggle': 'Wiggle',
    'color.main': 'Fur',
    'color.belly': 'Belly',
    'color.blush': 'Blush',
    'acc.bowtie': 'Bowtie',
    'acc.bowtieNote': 'Smart casual',
    'acc.hat': 'Party Hat',
    'acc.hatNote': 'Instant celebration',
    'acc.glasses': 'Glasses',
    'acc.glassesNote': 'Very studious',
    'tool.snapshot': 'Take Snapshot PNG',
    'tool.save': 'Save preset',
    'tool.share': 'Copy link',
    'tool.sound': 'Sound effects',
    'preset.title': 'Saved presets',
    'preset.clear': 'Clear',
    'preset.empty': 'No presets yet — style a pet and save it.',
    'foot.built': 'Built with',
    'foot.and': 'and',
    'foot.dim': 'No models, no textures, no audio files.',
    'pet.bear.name': 'Mochi the Chibi Bear',
    'pet.bear.tagline': 'Soft, round, and always ready for a hug.',
    'pet.bunny.name': 'Pip the Bunny',
    'pet.bunny.tagline': 'Two floppy ears, one very bouncy mood.',
    'pet.penguin.name': 'Pebble the Penguin',
    'pet.penguin.tagline': 'A tiny waddler with a big, warm heart.',
    'pet.shiba.name': 'Sunny the Shiba',
    'pet.shiba.tagline': 'Curled tail, bright eyes, endless good cheer.',
    'a11y.skip': 'Skip to controls',
    'a11y.sound': 'Toggle sound effects',
    'a11y.lang': 'Switch between English and Thai',
    'a11y.stage': 'Interactive 3D animal studio. Drag to orbit, scroll to zoom, click the pet to make it react.',
    'a11y.react': 'Make the pet react',
    'a11y.panel': 'Studio customizer',
    'a11y.close': 'Close the customizer',
    'a11y.animals': 'Choose a character',
    'a11y.expressions': 'Choose an expression',
    'a11y.mainColor': 'Main fur colour',
    'a11y.bellyColor': 'Belly colour',
    'a11y.blushColor': 'Blush colour',
    'a11y.palettes': 'Colour presets',
    'a11y.accessories': 'Toggle accessories',
    'toast.animal': 'Say hello to {name}!',
    'toast.expression': 'Expression: {name}',
    'toast.snapshot': 'Snapshot saved — {file}',
    'toast.snapshotFail': 'Could not save the snapshot.',
    'toast.presetSaved': 'Preset “{name}” saved.',
    'toast.presetLimit': 'Preset limit reached ({n}). Delete one first.',
    'toast.presetApplied': 'Applied “{name}”.',
    'toast.presetDeleted': 'Preset deleted.',
    'toast.presetsCleared': 'All presets cleared.',
    'toast.linkCopied': 'Share link copied to clipboard.',
    'toast.linkFallback': 'Share link is in the address bar.',
    'toast.soundOn': 'Sound effects on.',
    'toast.soundOff': 'Sound effects muted.',
    'toast.lang': 'Language set to English.',
    'toast.colorsReset': 'Colours reset.',
    'toast.webgl': 'WebGL could not start in this browser.',
    'preset.auto': '{name} look',
    'preset.meta': '{animal} · {accessories}',
    'preset.none': 'no accessories',
    'meta.title': 'Cute3D — Procedural Code-Only Animal Studio',
    'meta.desc': 'A zero-asset 3D animal studio with four original code-built pets, bilingual English/ไทย UI, procedural audio and transparent PNG snapshots.',
  },
  th: {
    'brand.sub': 'สตูดิโอสัตว์ 3D จากโค้ด',
    'status.live': 'สร้างสดด้วยโค้ด',
    'status.loading': 'กำลังปลุกเหล่าน้อง ๆ…',
    'common.sound': 'เสียง',
    'common.reset': 'รีเซ็ต',
    'stage.hint': 'ลากเพื่อหมุน · เลื่อนเพื่อซูม · คลิกที่สัตว์',
    'stage.meshes': 'ชิ้นโมเดล',
    'stage.react': 'เล่นด้วย',
    'panel.open': 'แต่งตัว',
    'panel.title': 'สตูดิโอ',
    'panel.sub': 'สี่เพื่อนน้อย ไม่มีไฟล์โมเดล',
    'section.animals': 'ตัวละคร',
    'section.animalsNote': 'สี่ต้นฉบับ',
    'section.expression': 'อารมณ์',
    'section.expressionNote': 'ลองกดดู',
    'section.colors': 'สีสัน',
    'section.accessories': 'เครื่องประดับ',
    'section.accessoriesNote': 'สร้างจากโค้ด',
    'section.studio': 'เครื่องมือ',
    'animal.bear': 'หมีจิบิ',
    'animal.bearTrait': 'กอดนุ่ม',
    'animal.bunny': 'กระต่าย',
    'animal.bunnyTrait': 'กระโดดเก่ง',
    'animal.penguin': 'เพนกวิน',
    'animal.penguinTrait': 'เดินเป๋',
    'animal.shiba': 'ชิบะ',
    'animal.shibaTrait': 'ร่าเริง',
    'expr.happy': 'มีความสุข',
    'expr.sleepy': 'ง่วงนอน',
    'expr.curious': 'สงสัย',
    'expr.wiggle': 'กระดิก',
    'color.main': 'ขน',
    'color.belly': 'ท้อง',
    'color.blush': 'แก้ม',
    'acc.bowtie': 'หูกระต่าย',
    'acc.bowtieNote': 'ดูดีมีสไตล์',
    'acc.hat': 'หมวกปาร์ตี้',
    'acc.hatNote': 'ฉลองได้ทุกวัน',
    'acc.glasses': 'แว่นตา',
    'acc.glassesNote': 'ขยันเรียนมาก',
    'tool.snapshot': 'บันทึกภาพ PNG',
    'tool.save': 'บันทึกพรีเซ็ต',
    'tool.share': 'คัดลอกลิงก์',
    'tool.sound': 'เสียงประกอบ',
    'preset.title': 'พรีเซ็ตที่บันทึกไว้',
    'preset.clear': 'ล้าง',
    'preset.empty': 'ยังไม่มีพรีเซ็ต — แต่งน้องแล้วบันทึกเลย',
    'foot.built': 'สร้างด้วย',
    'foot.and': 'และ',
    'foot.dim': 'ไม่มีโมเดล ไม่มีพื้นผิว ไม่มีไฟล์เสียง',
    'pet.bear.name': 'โมจิ หมีจิบิ',
    'pet.bear.tagline': 'นุ่มกลม พร้อมกอดทุกเมื่อ',
    'pet.bunny.name': 'พิพ กระต่ายน้อย',
    'pet.bunny.tagline': 'หูยาวสองข้าง อารมณ์เด้งตลอดเวลา',
    'pet.penguin.name': 'เพ็บเบิล เพนกวิน',
    'pet.penguin.tagline': 'ตัวเล็กเดินเป๋ แต่หัวใจอบอุ่นมาก',
    'pet.shiba.name': 'ซันนี่ ชิบะ',
    'pet.shiba.tagline': 'หางม้วน ตาใส ร่าเริงไม่หยุด',
    'a11y.skip': 'ข้ามไปที่แผงควบคุม',
    'a11y.sound': 'เปิดหรือปิดเสียงประกอบ',
    'a11y.lang': 'สลับภาษาอังกฤษและภาษาไทย',
    'a11y.stage': 'สตูดิโอสัตว์ 3D แบบโต้ตอบ ลากเพื่อหมุน เลื่อนเพื่อซูม คลิกที่สัตว์เพื่อให้แสดงท่า',
    'a11y.react': 'ให้สัตว์แสดงท่าทาง',
    'a11y.panel': 'แผงแต่งตัวสตูดิโอ',
    'a11y.close': 'ปิดแผงแต่งตัว',
    'a11y.animals': 'เลือกตัวละคร',
    'a11y.expressions': 'เลือกอารมณ์',
    'a11y.mainColor': 'สีขนหลัก',
    'a11y.bellyColor': 'สีท้อง',
    'a11y.blushColor': 'สีแก้ม',
    'a11y.palettes': 'ชุดสีสำเร็จรูป',
    'a11y.accessories': 'เปิดปิดเครื่องประดับ',
    'toast.animal': 'ทักทาย {name} กันหน่อย!',
    'toast.expression': 'อารมณ์: {name}',
    'toast.snapshot': 'บันทึกภาพแล้ว — {file}',
    'toast.snapshotFail': 'บันทึกภาพไม่สำเร็จ',
    'toast.presetSaved': 'บันทึกพรีเซ็ต “{name}” แล้ว',
    'toast.presetLimit': 'พรีเซ็ตเต็มแล้ว ({n}) ลบอันเก่าก่อนนะ',
    'toast.presetApplied': 'ใช้พรีเซ็ต “{name}” แล้ว',
    'toast.presetDeleted': 'ลบพรีเซ็ตแล้ว',
    'toast.presetsCleared': 'ล้างพรีเซ็ตทั้งหมดแล้ว',
    'toast.linkCopied': 'คัดลอกลิงก์แชร์แล้ว',
    'toast.linkFallback': 'ลิงก์แชร์อยู่ในแถบที่อยู่',
    'toast.soundOn': 'เปิดเสียงประกอบแล้ว',
    'toast.soundOff': 'ปิดเสียงประกอบแล้ว',
    'toast.lang': 'เปลี่ยนภาษาเป็นภาษาไทยแล้ว',
    'toast.colorsReset': 'รีเซ็ตสีแล้ว',
    'toast.webgl': 'เบราว์เซอร์นี้ไม่สามารถเปิด WebGL ได้',
    'preset.auto': 'ลุคของ{name}',
    'preset.meta': '{animal} · {accessories}',
    'preset.none': 'ไม่ใส่เครื่องประดับ',
    'meta.title': 'Cute3D — สตูดิโอสัตว์ 3D จากโค้ด',
    'meta.desc': 'สตูดิโอสัตว์ 3D ที่ไม่ใช้ไฟล์โมเดลเลย สี่ตัวละครต้นฉบับสร้างจากโค้ด รองรับสองภาษา เสียงสังเคราะห์ และภาพ PNG พื้นหลังโปร่งใส',
  },
};
/* I18N:END */

/* APP:START */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ENGINE = createStudioEngine();
const {
  ANIMALS, EXPRESSIONS, ACCESSORIES, COLOR_KEYS, PRESET_LIMIT,
  DEFAULT_COLORS, PALETTES, clamp, damp, lerp, smoothstep, easeOutCubic,
  normalizeHex, mixHex, shade, blinkScale, expressionPose, sanitizeColors,
  sanitizePresets, snapshotFilename, encodeShareState, decodeShareState,
  soundPattern, clampSnapshotSize, formatMeshLabel,
} = ENGINE;

const STORE = {
  state: 'cute3d:state:v1',
  presets: 'cute3d:presets:v1',
  lang: 'cute3d:lang:v1',
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const stageEl = $('#stage');
const toastStack = $('#toast-stack');

/* ------------------------------------------------------------------ state */

const defaultState = () => ({
  animal: 'bear',
  expression: 'happy',
  lang: 'en',
  sound: true,
  colors: Object.fromEntries(ANIMALS.map((id) => [id, { ...DEFAULT_COLORS[id] }])),
  accessories: { bowtie: false, partyHat: false, glasses: false },
});

const readJSON = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota — the studio still works, it just forgets. */
  }
};

const state = defaultState();
const stored = readJSON(STORE.state, null);
if (stored && typeof stored === 'object') {
  if (ANIMALS.includes(stored.animal)) state.animal = stored.animal;
  if (EXPRESSIONS.includes(stored.expression)) state.expression = stored.expression;
  if (stored.lang === 'th' || stored.lang === 'en') state.lang = stored.lang;
  if (typeof stored.sound === 'boolean') state.sound = stored.sound;
  for (const id of ANIMALS) state.colors[id] = sanitizeColors(stored.colors?.[id], id);
  if (stored.accessories && typeof stored.accessories === 'object') {
    for (const key of ACCESSORIES) state.accessories[key] = Boolean(stored.accessories[key]);
  }
}
const savedLang = window.localStorage.getItem(STORE.lang);
if (savedLang === 'th' || savedLang === 'en') state.lang = savedLang;

let presets = sanitizePresets(readJSON(STORE.presets, []));

const persistState = () => writeJSON(STORE.state, state);
const persistPresets = () => writeJSON(STORE.presets, presets);

const t = (key, vars = {}) => {
  const dict = I18N[state.lang] || I18N.en;
  const template = dict[key] ?? I18N.en[key] ?? key;
  return String(template).replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? `{${name}}`));
};

const animalName = (id) => t(`animal.${id}`);

/* ------------------------------------------------------------------ toasts */

let toastTimer = 0;
const toast = (message, icon = '✦') => {
  if (!toastStack) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon}</span><span></span>`;
  el.lastElementChild.textContent = message;
  toastStack.appendChild(el);
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    el.classList.add('is-leaving');
    window.setTimeout(() => el.remove(), 320);
  }, 2800);
  while (toastStack.children.length > 2) toastStack.firstElementChild.remove();
};

/* ------------------------------------------------------------------ audio */

class StudioAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = !state.sound;
  }

  ensure() {
    if (this.muted) return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.62;
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 18;
      comp.ratio.value = 5;
      this.master.connect(comp);
      comp.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  play(kind) {
    const pattern = soundPattern(kind);
    const ctx = this.ensure();
    if (!ctx || !pattern) return;
    const now = ctx.currentTime + 0.01;
    for (const note of pattern.notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = note.type;
      osc.frequency.setValueAtTime(note.from, now + note.at);
      if (note.to !== note.from) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(30, note.to), now + note.at + note.dur);
      }
      gain.gain.setValueAtTime(0.0001, now + note.at);
      gain.gain.exponentialRampToValueAtTime(pattern.gain, now + note.at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.dur);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now + note.at);
      osc.stop(now + note.at + note.dur + 0.03);
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.62;
  }
}

const audio = new StudioAudio();

/* --------------------------------------------------------------- three.js */

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
camera.position.set(0, 2.55, 7.6);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
} catch {
  renderer = null;
}

if (!renderer) {
  const loading = $('#stage-loading');
  if (loading) loading.innerHTML = `<p>${t('toast.webgl')}</p>`;
  throw new Error('WebGL unavailable');
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.04;
stageEl.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.48, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 4.1;
controls.maxDistance = 11.5;
controls.minPolarAngle = 0.55;
controls.maxPolarAngle = 1.74;
controls.rotateSpeed = 0.72;
controls.zoomSpeed = 0.8;
controls.update();

const hemi = new THREE.HemisphereLight(0xfff4ea, 0xcabfe8, 2.35);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xfff0df, 3.1);
keyLight.position.set(3.4, 6.4, 4.6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -4.5;
keyLight.shadow.camera.right = 4.5;
keyLight.shadow.camera.top = 5.5;
keyLight.shadow.camera.bottom = -1.5;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 22;
keyLight.shadow.bias = -0.0006;
keyLight.shadow.normalBias = 0.025;
keyLight.shadow.radius = 4;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xded4ff, 1.15);
fillLight.position.set(-4.5, 3, 2);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 1.35);
rimLight.position.set(-1, 4.5, -5);
scene.add(rimLight);

/* pedestal + shadow catcher */
const pedestalMat = new THREE.MeshStandardMaterial({ color: 0xf2e4e8, roughness: 0.95 });
const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.4, 0.16, 72), pedestalMat);
pedestal.position.y = -0.085;
pedestal.receiveShadow = true;
pedestal.castShadow = false;
scene.add(pedestal);

const rimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, transparent: true, opacity: 0.55 });
const pedestalRim = new THREE.Mesh(new THREE.TorusGeometry(2.28, 0.02, 8, 96), rimMat);
pedestalRim.rotation.x = Math.PI / 2;
pedestalRim.position.y = 0.005;
scene.add(pedestalRim);

const shadowMat = new THREE.ShadowMaterial({ color: 0x6b4d5c, opacity: 0.2 });
const shadowDisc = new THREE.Mesh(new THREE.CircleGeometry(1.7, 48), shadowMat);
shadowDisc.rotation.x = -Math.PI / 2;
shadowDisc.position.y = 0.002;
shadowDisc.receiveShadow = true;
scene.add(shadowDisc);

/* small drifting studio props, purely decorative */
const propGroup = new THREE.Group();
const propMats = [0xffc9d8, 0xc9b7f2, 0xa9dfd1].map(
  (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, transparent: true, opacity: 0.75 }),
);
const propGeo = new THREE.TorusGeometry(0.18, 0.05, 10, 24);
for (let i = 0; i < 3; i += 1) {
  const prop = new THREE.Mesh(propGeo, propMats[i]);
  prop.position.set(-2.4 + i * 2.4, 1.6 + i * 0.55, -2.6 - i * 0.25);
  prop.rotation.set(0.4 + i * 0.3, 0.2 * i, 0.2);
  prop.scale.setScalar(0.8 + i * 0.25);
  propGroup.add(prop);
}
scene.add(propGroup);

/* ------------------------------------------------------------- materials */

const SHARED_GEO = {
  sphere: new THREE.SphereGeometry(1, 26, 20),
  circle: new THREE.CircleGeometry(1, 28),
  cone: new THREE.ConeGeometry(1, 1, 28),
};
SHARED_GEO.sphere.userData.shared = true;
SHARED_GEO.circle.userData.shared = true;
SHARED_GEO.cone.userData.shared = true;

const mat = (role, color, options = {}) => {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: options.roughness ?? 0.82,
    metalness: options.metalness ?? 0,
    flatShading: Boolean(options.flat),
  });
  material.userData.role = role;
  return material;
};

const makeMaterials = (colors) => ({
  main: mat('main', colors.main),
  mainDark: mat('mainDark', shade(colors.main, -0.13)),
  belly: mat('belly', colors.belly),
  blush: mat('blush', colors.blush),
  inner: mat('inner', mixHex(colors.blush, '#ffffff', 0.28)),
  eye: mat('eye', '#33252b', { roughness: 0.22 }),
  glint: mat('glint', '#ffffff', { roughness: 0.1 }),
  nose: mat('nose', '#4a3138', { roughness: 0.35 }),
  beak: mat('beak', '#f6a54b', { roughness: 0.55 }),
  foot: mat('foot', '#f0a35a', { roughness: 0.7 }),
  cream: mat('cream', '#fffaf3', { roughness: 0.9 }),
  accent: mat('accent', shade(colors.blush, -0.18), { roughness: 0.5 }),
});

const mesh = (geometry, material, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1], name = '', cast = true, receive = true } = {}) => {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(pos[0], pos[1], pos[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.scale.set(scale[0], scale[1], scale[2]);
  m.castShadow = cast;
  m.receiveShadow = receive;
  if (name) m.name = name;
  m.userData.baseScale = m.scale.clone();
  return m;
};

const sphere = (materials, role, { pos, scale = [1, 1, 1], name = '', material } = {}) =>
  mesh(SHARED_GEO.sphere, material || materials[role], { pos, scale, name });

const capsule = (radius, length, materials, role, { pos, rot = [0, 0, 0], scale = [1, 1, 1], name = '', material } = {}) => {
  const geometry = new THREE.CapsuleGeometry(radius, length, 8, 18);
  return mesh(geometry, material || materials[role], { pos, rot, scale, name });
};

const torusArc = (radius, tube, arc, materials, role, { pos, rot = [0, 0, 0], name = '', material } = {}) => {
  const geometry = new THREE.TorusGeometry(radius, tube, 10, 30, arc);
  return mesh(geometry, material || materials[role], { pos, rot, name });
};

const anchor = (parent, pos, name) => {
  const node = new THREE.Object3D();
  node.position.set(pos[0], pos[1], pos[2]);
  node.name = name;
  parent.add(node);
  return node;
};

/* ------------------------------------------------------------ accessories */

const accessoryMats = {
  rose: new THREE.MeshStandardMaterial({ color: 0xff8fae, roughness: 0.55 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xffd37e, roughness: 0.45 }),
  violet: new THREE.MeshStandardMaterial({ color: 0xb49ce8, roughness: 0.55 }),
  mint: new THREE.MeshStandardMaterial({ color: 0x8fd3bf, roughness: 0.5 }),
  ink: new THREE.MeshStandardMaterial({ color: 0x453740, roughness: 0.35, metalness: 0.15 }),
};
for (const material of Object.values(accessoryMats)) material.userData.shared = true;

const buildBowtie = () => {
  const group = new THREE.Group();
  group.name = 'accessory-bowtie';
  const wingGeo = new THREE.ConeGeometry(0.17, 0.32, 4);
  wingGeo.userData.shared = false;
  const left = mesh(wingGeo, accessoryMats.rose, { pos: [-0.16, 0, 0], rot: [0, 0, -Math.PI / 2], scale: [1, 1, 0.62] });
  const right = mesh(wingGeo, accessoryMats.rose, { pos: [0.16, 0, 0], rot: [0, 0, Math.PI / 2], scale: [1, 1, 0.62] });
  const knot = mesh(SHARED_GEO.sphere, accessoryMats.gold, { pos: [0, 0, 0.03], scale: [0.085, 0.085, 0.085] });
  group.add(left, right, knot);
  group.position.set(0, 0.02, 0.1);
  group.scale.setScalar(1.1);
  return group;
};

const buildPartyHat = () => {
  const group = new THREE.Group();
  group.name = 'accessory-hat';
  const coneGeo = new THREE.ConeGeometry(0.3, 0.78, 26);
  const hat = mesh(coneGeo, accessoryMats.violet, { pos: [0, 0.4, 0] });
  const trim = torusArc(0.285, 0.035, Math.PI * 2, null, null, {
    pos: [0, 0.03, 0], rot: [Math.PI / 2, 0, 0], material: accessoryMats.gold,
  });
  const pom = mesh(SHARED_GEO.sphere, accessoryMats.mint, { pos: [0, 0.8, 0], scale: [0.12, 0.12, 0.12] });
  group.add(hat, trim, pom);
  group.rotation.set(-0.12, 0, 0.16);
  return group;
};

const buildGlasses = () => {
  const group = new THREE.Group();
  group.name = 'accessory-glasses';
  const ringGeo = new THREE.TorusGeometry(0.155, 0.022, 10, 28);
  const left = new THREE.Mesh(ringGeo, accessoryMats.ink);
  const right = new THREE.Mesh(ringGeo, accessoryMats.ink);
  left.position.set(-0.29, 0, 0);
  right.position.set(0.29, 0, 0);
  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 8), accessoryMats.ink);
  bridge.rotation.z = Math.PI / 2;
  bridge.position.set(0, 0.02, 0);
  const armGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.5, 8);
  const armL = new THREE.Mesh(armGeo, accessoryMats.ink);
  const armR = new THREE.Mesh(armGeo, accessoryMats.ink);
  armL.position.set(-0.44, 0.01, -0.24);
  armR.position.set(0.44, 0.01, -0.24);
  armL.rotation.x = armR.rotation.x = Math.PI / 2;
  group.add(left, right, bridge, armL, armR);
  return group;
};

const ACCESSORY_BUILDERS = {
  bowtie: buildBowtie,
  partyHat: buildPartyHat,
  glasses: buildGlasses,
};

/* ---------------------------------------------------------------- animals */

const buildBear = (materials) => {
  const group = new THREE.Group();
  const body = sphere(materials, 'main', { pos: [0, 0.98, 0], scale: [0.92, 0.9, 0.8], name: 'body' });
  const belly = sphere(materials, 'belly', { pos: [0, 0.92, 0.56], scale: [0.58, 0.54, 0.32], name: 'belly' });

  const legL = sphere(materials, 'main', { pos: [-0.37, 0.26, 0.06], scale: [0.3, 0.27, 0.3], name: 'leg-left' });
  const legR = sphere(materials, 'main', { pos: [0.37, 0.26, 0.06], scale: [0.3, 0.27, 0.3], name: 'leg-right' });
  const padL = sphere(materials, 'blush', { pos: [-0.37, 0.25, 0.31], scale: [0.14, 0.11, 0.04], name: 'pad-left' });
  const padR = sphere(materials, 'blush', { pos: [0.37, 0.25, 0.31], scale: [0.14, 0.11, 0.04], name: 'pad-right' });

  const armL = capsule(0.16, 0.42, materials, 'main', { pos: [-0.95, 1.08, 0.1], rot: [0.1, 0, 0.72], name: 'arm-left' });
  const armR = capsule(0.16, 0.42, materials, 'main', { pos: [0.95, 1.08, 0.1], rot: [0.1, 0, -0.72], name: 'arm-right' });

  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.78, -0.62);
  tailPivot.add(sphere(materials, 'main', { pos: [0, 0, -0.1], scale: [0.18, 0.18, 0.18], name: 'tail' }));

  const head = new THREE.Group();
  head.position.set(0, 2.02, 0.02);
  head.name = 'head';
  head.add(sphere(materials, 'main', { scale: [0.84, 0.78, 0.76], name: 'head-mesh' }));

  const earL = new THREE.Group();
  earL.position.set(-0.58, 0.36, -0.02);
  earL.rotation.z = -0.16;
  const earLMesh = sphere(materials, 'main', { pos: [0, 0.2, 0], scale: [0.27, 0.27, 0.16], name: 'ear-left' });
  const earLInner = sphere(materials, 'inner', { pos: [0, 0.2, 0.1], scale: [0.16, 0.16, 0.05], name: 'ear-inner-left' });
  earL.add(earLMesh, earLInner);

  const earR = new THREE.Group();
  earR.position.set(0.58, 0.36, -0.02);
  earR.rotation.z = 0.16;
  earR.add(
    sphere(materials, 'main', { pos: [0, 0.2, 0], scale: [0.27, 0.27, 0.16], name: 'ear-right' }),
    sphere(materials, 'inner', { pos: [0, 0.2, 0.1], scale: [0.16, 0.16, 0.05], name: 'ear-inner-right' }),
  );

  const patchL = sphere(materials, 'mainDark', { pos: [-0.32, 0.06, 0.62], scale: [0.25, 0.23, 0.07], name: 'patch-left' });
  const patchR = sphere(materials, 'mainDark', { pos: [0.32, 0.06, 0.62], scale: [0.25, 0.23, 0.07], name: 'patch-right' });
  const eyeL = sphere(materials, 'eye', { pos: [-0.31, 0.08, 0.7], scale: [0.105, 0.105, 0.08], name: 'eye-left' });
  const eyeR = sphere(materials, 'eye', { pos: [0.31, 0.08, 0.7], scale: [0.105, 0.105, 0.08], name: 'eye-right' });
  const glintL = sphere(materials, 'glint', { pos: [-0.34, 0.12, 0.77], scale: [0.034, 0.034, 0.02], name: 'glint-left' });
  const glintR = sphere(materials, 'glint', { pos: [0.28, 0.12, 0.77], scale: [0.034, 0.034, 0.02], name: 'glint-right' });

  const muzzle = sphere(materials, 'belly', { pos: [0, -0.13, 0.58], scale: [0.36, 0.28, 0.28], name: 'muzzle' });
  const nose = sphere(materials, 'nose', { pos: [0, -0.03, 0.84], scale: [0.13, 0.095, 0.09], name: 'nose' });
  const mouth = torusArc(0.09, 0.018, Math.PI, null, null, {
    pos: [0, -0.2, 0.86], rot: [0, 0, Math.PI], material: materials.nose, name: 'mouth',
  });
  const cheekL = sphere(materials, 'blush', { pos: [-0.52, -0.07, 0.55], scale: [0.16, 0.13, 0.06], name: 'cheek-left' });
  const cheekR = sphere(materials, 'blush', { pos: [0.52, -0.07, 0.55], scale: [0.16, 0.13, 0.06], name: 'cheek-right' });

  head.add(earL, earR, patchL, patchR, eyeL, eyeR, glintL, glintR, muzzle, nose, mouth, cheekL, cheekR);

  const neck = anchor(group, [0, 1.4, 0.8], 'anchor-neck');
  const hat = anchor(head, [0, 0.62, 0.12], 'anchor-hat');
  const glasses = anchor(head, [0, 0.08, 0.74], 'anchor-glasses');

  group.add(body, belly, legL, legR, padL, padR, armL, armR, tailPivot, head, neck);

  return {
    id: 'bear',
    group,
    head,
    body,
    belly,
    ears: [earL, earR],
    eyes: [eyeL, eyeR],
    glints: [glintL, glintR],
    tail: tailPivot,
    feet: [legL, legR],
    arms: [armL, armR],
    cheeks: [cheekL, cheekR],
    mouth,
    anchors: { neck, hat, glasses },
    materials,
    base: { belly: belly.scale.clone(), headRotX: 0, headRotZ: 0, tailRot: 0 },
    seed: 0,
    accessories: {},
    blinkSeed: 2,
  };
};

const buildBunny = (materials) => {
  const group = new THREE.Group();
  const body = sphere(materials, 'main', { pos: [0, 0.94, 0], scale: [0.82, 0.94, 0.74], name: 'body' });
  const belly = sphere(materials, 'belly', { pos: [0, 0.88, 0.5], scale: [0.54, 0.6, 0.28], name: 'belly' });

  const footL = capsule(0.14, 0.2, materials, 'main', { pos: [-0.33, 0.16, 0.22], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.9], name: 'foot-left' });
  const footR = capsule(0.14, 0.2, materials, 'main', { pos: [0.33, 0.16, 0.22], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.9], name: 'foot-right' });
  const padL = sphere(materials, 'blush', { pos: [-0.33, 0.24, 0.36], scale: [0.1, 0.03, 0.07], name: 'pad-left' });
  const padR = sphere(materials, 'blush', { pos: [0.33, 0.24, 0.36], scale: [0.1, 0.03, 0.07], name: 'pad-right' });

  const armL = capsule(0.13, 0.36, materials, 'main', { pos: [-0.86, 1.0, 0.12], rot: [0.15, 0, 0.5], name: 'arm-left' });
  const armR = capsule(0.13, 0.36, materials, 'main', { pos: [0.86, 1.0, 0.12], rot: [0.15, 0, -0.5], name: 'arm-right' });

  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.74, -0.58);
  tailPivot.add(
    sphere(materials, 'belly', { pos: [0, 0, -0.06], scale: [0.2, 0.2, 0.18], name: 'tail' }),
    sphere(materials, 'belly', { pos: [-0.1, 0.06, 0.02], scale: [0.11, 0.11, 0.11] }),
    sphere(materials, 'belly', { pos: [0.11, 0.02, 0.02], scale: [0.12, 0.12, 0.12] }),
  );

  const head = new THREE.Group();
  head.position.set(0, 1.96, 0.01);
  head.name = 'head';
  head.add(sphere(materials, 'main', { scale: [0.76, 0.7, 0.7], name: 'head-mesh' }));

  const makeEar = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.34, 0.48, -0.02);
    pivot.rotation.z = side * 0.13;
    pivot.rotation.x = -0.08;
    const outer = capsule(0.18, 0.72, materials, 'main', { pos: [0, 0.54, 0], name: `ear-${side < 0 ? 'left' : 'right'}` });
    const inner = capsule(0.1, 0.56, materials, 'inner', { pos: [0, 0.55, 0.075], scale: [1, 1, 0.5], name: 'inner-ear' });
    pivot.add(outer, inner);
    return pivot;
  };
  const earL = makeEar(-1);
  const earR = makeEar(1);

  const eyeL = sphere(materials, 'eye', { pos: [-0.26, 0.1, 0.62], scale: [0.095, 0.1, 0.08], name: 'eye-left' });
  const eyeR = sphere(materials, 'eye', { pos: [0.26, 0.1, 0.62], scale: [0.095, 0.1, 0.08], name: 'eye-right' });
  const glintL = sphere(materials, 'glint', { pos: [-0.29, 0.14, 0.69], scale: [0.03, 0.03, 0.02], name: 'glint-left' });
  const glintR = sphere(materials, 'glint', { pos: [0.23, 0.14, 0.69], scale: [0.03, 0.03, 0.02], name: 'glint-right' });

  const muzzle = sphere(materials, 'belly', { pos: [0, -0.12, 0.54], scale: [0.28, 0.22, 0.24], name: 'muzzle' });
  const nose = sphere(materials, 'accent', { pos: [0, -0.03, 0.77], scale: [0.072, 0.056, 0.05], name: 'nose' });
  const mouth = torusArc(0.075, 0.014, Math.PI, null, null, {
    pos: [0, -0.17, 0.78], rot: [0, 0, Math.PI], material: materials.nose, name: 'mouth',
  });
  const toothL = sphere(materials, 'glint', { pos: [-0.035, -0.18, 0.77], scale: [0.028, 0.05, 0.02], name: 'tooth-left' });
  const toothR = sphere(materials, 'glint', { pos: [0.035, -0.18, 0.77], scale: [0.028, 0.05, 0.02], name: 'tooth-right' });
  const cheekL = sphere(materials, 'blush', { pos: [-0.47, -0.06, 0.52], scale: [0.15, 0.12, 0.05], name: 'cheek-left' });
  const cheekR = sphere(materials, 'blush', { pos: [0.47, -0.06, 0.52], scale: [0.15, 0.12, 0.05], name: 'cheek-right' });

  head.add(earL, earR, eyeL, eyeR, glintL, glintR, muzzle, nose, mouth, toothL, toothR, cheekL, cheekR);

  const neck = anchor(group, [0, 1.33, 0.74], 'anchor-neck');
  const hat = anchor(head, [0, 0.58, 0.14], 'anchor-hat');
  const glasses = anchor(head, [0, 0.1, 0.66], 'anchor-glasses');

  group.add(body, belly, footL, footR, padL, padR, armL, armR, tailPivot, head, neck);

  return {
    id: 'bunny',
    group,
    head,
    body,
    belly,
    ears: [earL, earR],
    eyes: [eyeL, eyeR],
    glints: [glintL, glintR],
    tail: tailPivot,
    feet: [footL, footR],
    arms: [armL, armR],
    cheeks: [cheekL, cheekR],
    mouth,
    anchors: { neck, hat, glasses },
    materials,
    base: { belly: belly.scale.clone(), headRotX: 0, headRotZ: 0, tailRot: 0 },
    seed: 1,
    accessories: {},
    blinkSeed: 5,
  };
};

const buildPenguin = (materials) => {
  const group = new THREE.Group();
  const body = sphere(materials, 'main', { pos: [0, 1.02, 0], scale: [0.88, 0.98, 0.84], name: 'body' });
  const belly = sphere(materials, 'belly', { pos: [0, 0.98, 0.6], scale: [0.68, 0.8, 0.3], name: 'belly' });

  const footL = sphere(materials, 'foot', { pos: [-0.31, 0.09, 0.2], scale: [0.28, 0.09, 0.36], name: 'foot-left' });
  const footR = sphere(materials, 'foot', { pos: [0.31, 0.09, 0.2], scale: [0.28, 0.09, 0.36], name: 'foot-right' });

  const armL = capsule(0.14, 0.44, materials, 'main', { pos: [-0.92, 1.18, 0], rot: [0, 0, 0.28], scale: [1, 1, 0.55], name: 'arm-left' });
  const armR = capsule(0.14, 0.44, materials, 'main', { pos: [0.92, 1.18, 0], rot: [0, 0, -0.28], scale: [1, 1, 0.55], name: 'arm-right' });

  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.55, -0.7);
  tailPivot.add(mesh(SHARED_GEO.cone, materials.main, { pos: [0, 0, 0], rot: [-1.1, 0, 0], scale: [0.2, 0.34, 0.2], name: 'tail' }));

  const head = new THREE.Group();
  head.position.set(0, 2.06, 0.01);
  head.name = 'head';
  head.add(sphere(materials, 'main', { scale: [0.64, 0.6, 0.6], name: 'head-mesh' }));
  const face = sphere(materials, 'belly', { pos: [0, -0.02, 0.45], scale: [0.46, 0.4, 0.26], name: 'face-patch' });

  const eyeL = sphere(materials, 'eye', { pos: [-0.21, 0.06, 0.72], scale: [0.088, 0.095, 0.07], name: 'eye-left' });
  const eyeR = sphere(materials, 'eye', { pos: [0.21, 0.06, 0.72], scale: [0.088, 0.095, 0.07], name: 'eye-right' });
  const glintL = sphere(materials, 'glint', { pos: [-0.24, 0.1, 0.79], scale: [0.028, 0.028, 0.02], name: 'glint-left' });
  const glintR = sphere(materials, 'glint', { pos: [0.18, 0.1, 0.79], scale: [0.028, 0.028, 0.02], name: 'glint-right' });

  const beak = mesh(SHARED_GEO.cone, materials.beak, { pos: [0, -0.13, 0.67], rot: [Math.PI / 2 + 0.22, 0, 0], scale: [0.16, 0.34, 0.12], name: 'beak' });
  const mouth = new THREE.Group();
  const cheekL = sphere(materials, 'blush', { pos: [-0.37, -0.12, 0.64], scale: [0.12, 0.1, 0.05], name: 'cheek-left' });
  const cheekR = sphere(materials, 'blush', { pos: [0.37, -0.12, 0.64], scale: [0.12, 0.1, 0.05], name: 'cheek-right' });
  const tuftA = sphere(materials, 'main', { pos: [0, 0.57, -0.02], scale: [0.1, 0.16, 0.1], name: 'tuft' });
  const tuftB = sphere(materials, 'main', { pos: [-0.11, 0.52, -0.04], scale: [0.08, 0.12, 0.08], name: 'tuft' });
  const tuftC = sphere(materials, 'main', { pos: [0.11, 0.52, -0.04], scale: [0.08, 0.12, 0.08], name: 'tuft' });

  head.add(face, eyeL, eyeR, glintL, glintR, beak, mouth, cheekL, cheekR, tuftA, tuftB, tuftC);

  const neck = anchor(group, [0, 1.52, 0.8], 'anchor-neck');
  const hat = anchor(head, [0, 0.52, 0.1], 'anchor-hat');
  const glasses = anchor(head, [0, 0.06, 0.6], 'anchor-glasses');

  group.add(body, belly, footL, footR, armL, armR, tailPivot, head, neck);

  return {
    id: 'penguin',
    group,
    head,
    body,
    belly,
    ears: [armL, armR],
    eyes: [eyeL, eyeR],
    glints: [glintL, glintR],
    tail: tailPivot,
    feet: [footL, footR],
    arms: [armL, armR],
    cheeks: [cheekL, cheekR],
    mouth,
    anchors: { neck, hat, glasses },
    materials,
    base: { belly: belly.scale.clone(), headRotX: 0, headRotZ: 0, tailRot: 0 },
    seed: 3,
    accessories: {},
    blinkSeed: 8,
    waddle: true,
  };
};

const buildShiba = (materials) => {
  const group = new THREE.Group();
  const body = sphere(materials, 'main', { pos: [0, 0.96, 0], scale: [0.86, 0.86, 0.8], name: 'body' });
  const belly = sphere(materials, 'belly', { pos: [0, 0.92, 0.58], scale: [0.58, 0.6, 0.26], name: 'belly' });

  const legL = capsule(0.13, 0.24, materials, 'main', { pos: [-0.35, 0.22, 0.02], rot: [0.08, 0, 0], name: 'leg-left' });
  const legR = capsule(0.13, 0.24, materials, 'main', { pos: [0.35, 0.22, 0.02], rot: [0.08, 0, 0], name: 'leg-right' });
  const pawL = sphere(materials, 'belly', { pos: [-0.35, 0.11, 0.12], scale: [0.15, 0.1, 0.17], name: 'paw-left' });
  const pawR = sphere(materials, 'belly', { pos: [0.35, 0.11, 0.12], scale: [0.15, 0.1, 0.17], name: 'paw-right' });

  const armL = capsule(0.12, 0.3, materials, 'main', { pos: [-0.84, 1.0, 0.12], rot: [0.2, 0, 0.55], name: 'arm-left' });
  const armR = capsule(0.12, 0.3, materials, 'main', { pos: [0.84, 1.0, 0.12], rot: [0.2, 0, -0.55], name: 'arm-right' });

  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 1.32, -0.55);
  const curl = torusArc(0.25, 0.11, Math.PI * 1.45, materials, 'main', {
    pos: [0, 0, -0.12], rot: [0.2, Math.PI / 2, 0], name: 'tail',
  });
  const curlTip = sphere(materials, 'belly', { pos: [0.1, 0.23, -0.18], scale: [0.11, 0.11, 0.11], name: 'tail-tip' });
  tailPivot.add(curl, curlTip);

  const head = new THREE.Group();
  head.position.set(0, 2.0, 0.01);
  head.name = 'head';
  head.add(sphere(materials, 'main', { scale: [0.8, 0.72, 0.72], name: 'head-mesh' }));

  const makeEar = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.44, 0.48, -0.02);
    pivot.rotation.z = side * 0.16;
    const outer = mesh(SHARED_GEO.cone, materials.main, {
      pos: [0, 0.22, 0], rot: [0, Math.PI / 4, 0], scale: [0.26, 0.5, 0.2], name: `ear-${side < 0 ? 'left' : 'right'}`,
    });
    const inner = mesh(SHARED_GEO.cone, materials.inner, {
      pos: [0, 0.2, 0.09], rot: [0, Math.PI / 4, 0], scale: [0.15, 0.32, 0.08], name: 'inner-ear',
    });
    pivot.add(outer, inner);
    return pivot;
  };
  const earL = makeEar(-1);
  const earR = makeEar(1);

  const eyeL = sphere(materials, 'eye', { pos: [-0.27, 0.11, 0.62], scale: [0.09, 0.095, 0.07], name: 'eye-left' });
  const eyeR = sphere(materials, 'eye', { pos: [0.27, 0.11, 0.62], scale: [0.09, 0.095, 0.07], name: 'eye-right' });
  const glintL = sphere(materials, 'glint', { pos: [-0.3, 0.15, 0.68], scale: [0.028, 0.028, 0.02], name: 'glint-left' });
  const glintR = sphere(materials, 'glint', { pos: [0.24, 0.15, 0.68], scale: [0.028, 0.028, 0.02], name: 'glint-right' });
  const browL = sphere(materials, 'belly', { pos: [-0.28, 0.28, 0.6], scale: [0.06, 0.045, 0.03], name: 'brow-left' });
  const browR = sphere(materials, 'belly', { pos: [0.28, 0.28, 0.6], scale: [0.06, 0.045, 0.03], name: 'brow-right' });

  const muzzle = sphere(materials, 'belly', { pos: [0, -0.14, 0.56], scale: [0.33, 0.24, 0.28], name: 'muzzle' });
  const nose = sphere(materials, 'nose', { pos: [0, -0.05, 0.8], scale: [0.1, 0.08, 0.07], name: 'nose' });
  const mouth = torusArc(0.08, 0.015, Math.PI, null, null, {
    pos: [0, -0.2, 0.81], rot: [0, 0, Math.PI], material: materials.nose, name: 'mouth',
  });
  const cheekL = sphere(materials, 'blush', { pos: [-0.49, -0.09, 0.52], scale: [0.14, 0.1, 0.05], name: 'cheek-left' });
  const cheekR = sphere(materials, 'blush', { pos: [0.49, -0.09, 0.52], scale: [0.14, 0.1, 0.05], name: 'cheek-right' });

  head.add(earL, earR, eyeL, eyeR, glintL, glintR, browL, browR, muzzle, nose, mouth, cheekL, cheekR);

  const neck = anchor(group, [0, 1.43, 0.75], 'anchor-neck');
  const hat = anchor(head, [0, 0.58, 0.1], 'anchor-hat');
  const glasses = anchor(head, [0, 0.11, 0.68], 'anchor-glasses');

  group.add(body, belly, legL, legR, pawL, pawR, armL, armR, tailPivot, head, neck);

  return {
    id: 'shiba',
    group,
    head,
    body,
    belly,
    ears: [earL, earR],
    eyes: [eyeL, eyeR],
    glints: [glintL, glintR],
    tail: tailPivot,
    feet: [legL, legR],
    arms: [armL, armR],
    cheeks: [cheekL, cheekR],
    mouth,
    anchors: { neck, hat, glasses },
    materials,
    base: { belly: belly.scale.clone(), headRotX: 0, headRotZ: 0, tailRot: 0 },
    seed: 7,
    accessories: {},
    blinkSeed: 11,
  };
};

const BUILDERS = { bear: buildBear, bunny: buildBunny, penguin: buildPenguin, shiba: buildShiba };

/* --------------------------------------------------------------- rig setup */

let rig = null;
let react = { active: false, time: 0, duration: 0.92, dir: 1, landed: false };
const pose = { ...expressionPose(state.expression) };

const disposeRig = (instance) => {
  if (!instance) return;
  const seenMaterials = new Set();
  instance.group.traverse((node) => {
    if (!node.isMesh) return;
    if (node.geometry && !node.geometry.userData.shared) node.geometry.dispose();
    const disposeMaterial = (material) => {
      if (!material || material.userData.shared || seenMaterials.has(material)) return;
      seenMaterials.add(material);
      material.dispose();
    };
    if (Array.isArray(node.material)) node.material.forEach(disposeMaterial);
    else disposeMaterial(node.material);
  });
  if (instance.group.parent) instance.group.parent.remove(instance.group);
};

const buildAnimal = (id, colors) => {
  const materials = makeMaterials(colors);
  const instance = BUILDERS[id](materials);
  instance.group.userData.animalId = id;
  instance.earBases = instance.ears.map((ear) => ear.rotation.z);
  for (const key of ACCESSORIES) {
    const accessory = ACCESSORY_BUILDERS[key]();
    accessory.visible = false;
    const parent = key === 'bowtie' ? instance.anchors.neck : key === 'partyHat' ? instance.anchors.hat : instance.anchors.glasses;
    parent.add(accessory);
    instance.accessories[key] = accessory;
    accessory.traverse((node) => {
      if (!node.isMesh) return;
      if (node.geometry && !node.geometry.userData.shared) node.geometry.userData.disposable = true;
    });
  }
  return instance;
};

const applyColors = (instance, colors) => {
  const mats = instance.materials;
  mats.main.color.set(colors.main);
  mats.mainDark.color.set(shade(colors.main, -0.13));
  mats.belly.color.set(colors.belly);
  mats.blush.color.set(colors.blush);
  mats.inner.color.set(mixHex(colors.blush, '#ffffff', 0.28));
  mats.accent.color.set(shade(colors.blush, -0.18));
  mats.cream.color.set(mixHex(colors.belly, '#ffffff', 0.35));
};

const applyAccessories = () => {
  if (!rig) return;
  for (const key of ACCESSORIES) {
    const accessory = rig.accessories[key];
    if (accessory) accessory.visible = Boolean(state.accessories[key]);
  }
};

const countMeshes = (root) => {
  let count = 0;
  root.traverse((node) => {
    if (node.isMesh) count += 1;
  });
  return count;
};

/* ------------------------------------------------------------------ camera */

const resize = () => {
  if (!renderer) return;
  const rect = stageEl.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  const aspect = width / height;
  renderer.setSize(width, height, false);
  camera.aspect = aspect;
  const portrait = aspect < 0.85;
  camera.position.set(0, portrait ? 2.4 : 2.55, portrait ? 9.8 : 8.1);
  camera.updateProjectionMatrix();
  controls.update();
};

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(stageEl);
window.addEventListener('orientationchange', () => window.setTimeout(resize, 120));

/* ------------------------------------------------------------- background */

const onVisibility = () => {
  if (!document.hidden) clock.getDelta();
};
document.addEventListener('visibilitychange', onVisibility);

/* --------------------------------------------------------------- pet card */

const updatePetCard = () => {
  const name = t(`pet.${state.animal}.name`);
  const tagline = t(`pet.${state.animal}.tagline`);
  const emoji = { bear: '🧸', bunny: '🐰', penguin: '🐧', shiba: '🐕' }[state.animal];
  $('#pet-name').textContent = name;
  $('#pet-tagline').textContent = tagline;
  $('#pet-emoji').textContent = emoji;
};

const updateMeshCount = () => {
  if (!rig) return;
  $('#mesh-count').textContent = formatMeshLabel(countMeshes(rig.group));
};

/* ---------------------------------------------------------------- i18n UI */

const applyI18n = () => {
  const lang = state.lang;
  document.documentElement.lang = lang === 'th' ? 'th' : 'en';
  document.body.dataset.lang = lang;
  for (const node of $$('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  for (const node of $$('[data-i18n-aria]')) node.setAttribute('aria-label', t(node.dataset.i18nAria));
  for (const node of $$('[data-i18n-placeholder]')) node.setAttribute('placeholder', t(node.dataset.i18nPlaceholder));
  for (const node of $$('[data-lang-opt]')) node.classList.toggle('is-active', node.dataset.langOpt === lang);
  document.title = t('meta.title');
  const desc = $('meta[name="description"]');
  if (desc) desc.setAttribute('content', t('meta.desc'));
  updatePetCard();
  renderPresets();
};

/* --------------------------------------------------------------- controls */

const syncColorInputs = (colors) => {
  for (const key of COLOR_KEYS) {
    const input = $(`#color-${key}`);
    const hex = $(`#hex-${key}`);
    if (input) input.value = colors[key];
    if (hex) hex.textContent = colors[key].toUpperCase();
  }
  for (const swatch of $$('.swatch')) {
    const palette = PALETTES.find((p) => p.id === swatch.dataset.palette);
    const active = palette && palette.main === colors.main && palette.belly === colors.belly && palette.blush === colors.blush;
    swatch.classList.toggle('is-active', Boolean(active));
  }
};

const syncAccessoryButtons = () => {
  for (const button of $$('[data-accessory]')) {
    const key = button.dataset.accessory;
    button.setAttribute('aria-pressed', String(Boolean(state.accessories[key])));
  }
};

const syncAnimalButtons = () => {
  for (const button of $$('[data-animal]')) {
    const active = button.dataset.animal === state.animal;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  }
};

const syncExpressionButtons = () => {
  for (const button of $$('[data-expr]')) {
    const active = button.dataset.expr === state.expression;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  }
};

const syncSoundButtons = () => {
  for (const id of ['#sound-toggle', '#sound-toggle-panel']) {
    const button = $(id);
    if (button) button.setAttribute('aria-pressed', String(state.sound));
  }
  const icon = $('.sound-icon');
  if (icon) icon.dataset.soundState = state.sound ? 'on' : 'off';
  audio.setMuted(!state.sound);
};

const setExpression = (expression, { quiet = false } = {}) => {
  if (!EXPRESSIONS.includes(expression)) return;
  state.expression = expression;
  syncExpressionButtons();
  persistState();
  audio.play(expression === 'wiggle' ? 'wiggle' : 'pop');
  if (!quiet) toast(t('toast.expression', { name: t(`expr.${expression}`) }), '✨');
};

const setAnimal = (id, { quiet = false } = {}) => {
  if (!ANIMALS.includes(id) || !rig) return;
  if (id === state.animal && rig.id === id) {
    updatePetCard();
    return;
  }
  disposeRig(rig);
  state.animal = id;
  const colors = state.colors[id];
  rig = buildAnimal(id, colors);
  scene.add(rig.group);
  applyColors(rig, colors);
  applyAccessories();
  syncColorInputs(colors);
  syncAnimalButtons();
  updatePetCard();
  updateMeshCount();
  if (window.__cute3d) window.__cute3d.rig = rig;
  pose.headTilt = 0;
  pose.headNod = 0;
  react = { active: false, time: 0, duration: 0.92, dir: 1, landed: false };
  persistState();
  if (!quiet) {
    audio.play('chime');
    toast(t('toast.animal', { name: t(`pet.${id}.name`) }), '🐾');
  }
};

const setLang = (lang, { quiet = false } = {}) => {
  state.lang = lang === 'th' ? 'th' : 'en';
  window.localStorage.setItem(STORE.lang, state.lang);
  persistState();
  applyI18n();
  audio.play('pop');
  if (!quiet) toast(t('toast.lang'), '🌐');
};

const setSound = (on, { quiet = false } = {}) => {
  state.sound = Boolean(on);
  syncSoundButtons();
  persistState();
  if (state.sound) audio.play('chime');
  if (!quiet) toast(t(state.sound ? 'toast.soundOn' : 'toast.soundOff'), state.sound ? '🔔' : '🔕');
};

const setAccessory = (key, value, { quiet = false } = {}) => {
  if (!ACCESSORIES.includes(key)) return;
  state.accessories[key] = Boolean(value);
  applyAccessories();
  syncAccessoryButtons();
  persistState();
  audio.play('pop');
  if (!quiet) {
    const names = { bowtie: 'acc.bowtie', partyHat: 'acc.hat', glasses: 'acc.glasses' };
    toast(`${t(names[key])} ${state.accessories[key] ? '✓' : '—'}`, '🎀');
  }
};

const setColors = (colors, { source = null, quiet = false } = {}) => {
  const clean = sanitizeColors(colors, state.animal);
  state.colors[state.animal] = clean;
  applyColors(rig, clean);
  syncColorInputs(clean);
  persistState();
  if (!quiet) audio.play('pop');
};

/* --------------------------------------------------------------- reactions */

const sparkleCount = 22;
const sparkleGeometry = new THREE.BufferGeometry();
const sparklePositions = new Float32Array(sparkleCount * 3);
const sparkleColors = new Float32Array(sparkleCount * 3);
const sparkleVelocities = [];
const sparklePalette = [
  new THREE.Color('#ffd1e0'), new THREE.Color('#ffe7ad'), new THREE.Color('#d5c8ff'), new THREE.Color('#b8ecdf'),
];
for (let i = 0; i < sparkleCount; i += 1) {
  sparklePositions[i * 3 + 1] = -99;
  const color = sparklePalette[i % sparklePalette.length];
  sparkleColors[i * 3] = color.r;
  sparkleColors[i * 3 + 1] = color.g;
  sparkleColors[i * 3 + 2] = color.b;
  sparkleVelocities.push({ x: 0, y: 0, z: 0, life: 0 });
}
sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
sparkleGeometry.setAttribute('color', new THREE.BufferAttribute(sparkleColors, 3));
const sparkleMaterial = new THREE.PointsMaterial({
  size: 0.075,
  vertexColors: true,
  transparent: true,
  opacity: 0.95,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true,
});
const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
sparkles.frustumCulled = false;
sparkles.visible = false;
scene.add(sparkles);

const spawnSparkles = () => {
  const y = 1.5;
  for (let i = 0; i < sparkleCount; i += 1) {
    const angle = (i / sparkleCount) * Math.PI * 2 + Math.random() * 0.4;
    const radius = 0.35 + Math.random() * 0.45;
    sparklePositions[i * 3] = Math.cos(angle) * radius * 0.6;
    sparklePositions[i * 3 + 1] = y + (Math.random() - 0.2) * 0.7;
    sparklePositions[i * 3 + 2] = Math.sin(angle) * radius * 0.4;
    const speed = 1.1 + Math.random() * 1.4;
    sparkleVelocities[i] = {
      x: Math.cos(angle) * speed * 0.55,
      y: 0.7 + Math.random() * 1.4,
      z: Math.sin(angle) * speed * 0.4,
      life: 0.7 + Math.random() * 0.4,
    };
  }
  sparkleGeometry.attributes.position.needsUpdate = true;
  sparkles.visible = !reducedMotion;
};

const reactPet = () => {
  if (!rig || react.active) return;
  react = { active: true, time: 0, duration: 0.92, dir: Math.random() > 0.5 ? 1 : -1, landed: false };
  spawnSparkles();
  audio.play('boing');
  const hint = $('#hint-chip');
  if (hint && !hint.classList.contains('is-hidden')) hint.classList.add('is-hidden');
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDown = null;

renderer.domElement.addEventListener('pointerdown', (event) => {
  pointerDown = { x: event.clientX, y: event.clientY, at: performance.now() };
});

renderer.domElement.addEventListener('pointerup', (event) => {
  if (!pointerDown) return;
  const dx = event.clientX - pointerDown.x;
  const dy = event.clientY - pointerDown.y;
  const elapsed = performance.now() - pointerDown.at;
  pointerDown = null;
  if (Math.hypot(dx, dy) > 8 || elapsed > 650) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = rig ? raycaster.intersectObject(rig.group, true) : [];
  if (hits.length) reactPet();
});

/* ------------------------------------------------------------------ presets */

const presetMeta = (preset) => {
  const worn = ACCESSORIES.filter((key) => preset.accessories[key]).map((key) =>
    ({ bowtie: 'acc.bowtie', partyHat: 'acc.hat', glasses: 'acc.glasses' }[key]),
  );
  return t('preset.meta', {
    animal: animalName(preset.animal),
    accessories: worn.length ? worn.map((key) => t(key)).join(', ') : t('preset.none'),
  });
};

const renderPresets = () => {
  const list = $('#preset-list');
  const empty = $('#preset-empty');
  if (!list || !empty) return;
  list.innerHTML = '';
  empty.hidden = presets.length > 0;
  for (const preset of presets) {
    const item = document.createElement('li');
    item.className = 'preset-item';
    item.dataset.presetId = preset.id;
    const chip = document.createElement('span');
    chip.className = 'preset-chip';
    chip.style.setProperty('--a', preset.colors.main);
    chip.style.setProperty('--b', preset.colors.belly);
    chip.style.setProperty('--c', preset.colors.blush);
    chip.setAttribute('aria-hidden', 'true');

    const apply = document.createElement('button');
    apply.type = 'button';
    apply.className = 'preset-apply';
    apply.dataset.action = 'apply';
    apply.dataset.presetId = preset.id;
    apply.title = t('toast.presetApplied', { name: preset.name });
    const label = document.createElement('span');
    label.textContent = preset.name;
    const meta = document.createElement('small');
    meta.textContent = presetMeta(preset);
    apply.append(label, meta);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'preset-delete';
    remove.dataset.action = 'delete';
    remove.dataset.presetId = preset.id;
    remove.setAttribute('aria-label', `${preset.name} — delete`);
    remove.textContent = '✕';

    item.append(chip, apply, remove);
    list.append(item);
  }
};

const savePreset = () => {
  if (presets.length >= PRESET_LIMIT) {
    toast(t('toast.presetLimit', { n: PRESET_LIMIT }), '⚠️');
    return;
  }
  const name = t('preset.auto', { name: animalName(state.animal) });
  const preset = {
    id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    animal: state.animal,
    colors: { ...state.colors[state.animal] },
    accessories: { ...state.accessories },
    expression: state.expression,
    createdAt: Date.now(),
  };
  presets = sanitizePresets([preset, ...presets]);
  persistPresets();
  renderPresets();
  audio.play('chime');
  toast(t('toast.presetSaved', { name }), '💾');
};

const applyPreset = (id) => {
  const preset = presets.find((item) => item.id === id);
  if (!preset) return;
  state.colors[preset.animal] = { ...preset.colors };
  state.accessories = { ...preset.accessories };
  state.expression = preset.expression;
  setAnimal(preset.animal, { quiet: true });
  applyColors(rig, preset.colors);
  syncColorInputs(preset.colors);
  syncAccessoryButtons();
  applyAccessories();
  syncExpressionButtons();
  persistState();
  audio.play('chime');
  toast(t('toast.presetApplied', { name: preset.name }), '🎨');
};

const deletePreset = (id) => {
  presets = presets.filter((item) => item.id !== id);
  persistPresets();
  renderPresets();
  audio.play('pop');
  toast(t('toast.presetDeleted'), '🗑️');
};

/* ---------------------------------------------------------------- snapshot */

const snapshotCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
snapshotCamera.position.set(0, 2.15, 7.15);
snapshotCamera.lookAt(0, 1.55, 0);

const captureSnapshot = (size = 2048) => {
  const pixels = clampSnapshotSize(size);
  const previousSize = renderer.getSize(new THREE.Vector2());
  const previousPixelRatio = renderer.getPixelRatio();
  const previousBackground = scene.background;
  const previousClear = new THREE.Color();
  renderer.getClearColor(previousClear);
  const previousAlpha = renderer.getClearAlpha();
  const studioProps = [pedestal, pedestalRim, propGroup, sparkles];
  const previousVisibility = studioProps.map((node) => node.visible);

  scene.background = null;
  renderer.setPixelRatio(1);
  renderer.setSize(pixels, pixels, false);
  renderer.setClearColor(0x000000, 0);
  for (const node of studioProps) node.visible = false;
  renderer.render(scene, snapshotCamera);
  const dataUrl = renderer.domElement.toDataURL('image/png');

  studioProps.forEach((node, index) => { node.visible = previousVisibility[index]; });
  scene.background = previousBackground;
  renderer.setPixelRatio(previousPixelRatio);
  renderer.setSize(previousSize.x, previousSize.y, false);
  renderer.setClearColor(previousClear, previousAlpha);
  return dataUrl;
};

const downloadSnapshot = () => {
  try {
    const dataUrl = captureSnapshot(2048);
    const filename = snapshotFilename(state.animal);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    audio.play('chime');
    toast(t('toast.snapshot', { file: filename }), '📷');
    return filename;
  } catch {
    toast(t('toast.snapshotFail'), '⚠️');
    return null;
  }
};

/* ------------------------------------------------------------------- share */

const buildShareUrl = () => {
  const url = new URL(window.location.href);
  url.search = encodeShareState({
    animal: state.animal,
    colors: state.colors[state.animal],
    expression: state.expression,
    accessories: state.accessories,
    lang: state.lang,
  });
  url.hash = '';
  return url.toString();
};

const copyShareLink = async () => {
  const url = buildShareUrl();
  try {
    await navigator.clipboard.writeText(url);
    toast(t('toast.linkCopied'), '🔗');
  } catch {
    window.history.replaceState(null, '', url);
    toast(t('toast.linkFallback'), '🔗');
  }
  audio.play('pop');
  return url;
};

/* ------------------------------------------------------------------ events */

const on = (selector, event, handler) => {
  for (const node of $$(selector)) node.addEventListener(event, handler);
};

on('[data-animal]', 'click', (event) => setAnimal(event.currentTarget.dataset.animal));
on('[data-expr]', 'click', (event) => setExpression(event.currentTarget.dataset.expr));
on('[data-accessory]', 'click', (event) => {
  const key = event.currentTarget.dataset.accessory;
  setAccessory(key, !state.accessories[key]);
});
on('[data-palette]', 'click', (event) => {
  const palette = PALETTES.find((item) => item.id === event.currentTarget.dataset.palette);
  if (!palette) return;
  setColors({ main: palette.main, belly: palette.belly, blush: palette.blush });
  toast(`${palette.id} ✓`, '🎨');
});

for (const key of COLOR_KEYS) {
  const input = $(`#color-${key}`);
  if (!input) continue;
  input.addEventListener('input', (event) => {
    const colors = { ...state.colors[state.animal], [key]: normalizeHex(event.target.value) };
    state.colors[state.animal] = colors;
    applyColors(rig, colors);
    const hex = $(`#hex-${key}`);
    if (hex) hex.textContent = colors[key].toUpperCase();
    for (const swatch of $$('.swatch')) swatch.classList.remove('is-active');
  });
  input.addEventListener('change', () => {
    persistState();
    audio.play('pop');
  });
}

$('#reset-colors')?.addEventListener('click', () => {
  setColors({ ...DEFAULT_COLORS[state.animal] }, { quiet: true });
  toast(t('toast.colorsReset'), '↺');
  audio.play('pop');
});

$('#sound-toggle')?.addEventListener('click', () => setSound(!state.sound));
$('#sound-toggle-panel')?.addEventListener('click', () => setSound(!state.sound));
$('#lang-toggle')?.addEventListener('click', () => setLang(state.lang === 'en' ? 'th' : 'en'));
$('#pet-action')?.addEventListener('click', reactPet);
$('#snapshot-btn')?.addEventListener('click', downloadSnapshot);
$('#save-preset')?.addEventListener('click', savePreset);
$('#share-btn')?.addEventListener('click', copyShareLink);
$('#clear-presets')?.addEventListener('click', () => {
  presets = [];
  persistPresets();
  renderPresets();
  toast(t('toast.presetsCleared'), '🧹');
});

$('#preset-list')?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.dataset.presetId;
  if (button.dataset.action === 'delete') deletePreset(id);
  else if (button.dataset.action === 'apply') applyPreset(id);
});

const panel = $('#panel');
const panelToggle = $('#panel-toggle');
const setPanel = (open) => {
  if (!panel) return;
  panel.classList.toggle('is-open', open);
  if (panelToggle) panelToggle.setAttribute('aria-expanded', String(open));
};
panelToggle?.addEventListener('click', () => setPanel(!panel.classList.contains('is-open')));
$('#panel-close')?.addEventListener('click', () => setPanel(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setPanel(false);
    const overlay = $('#selftest-overlay');
    if (overlay) overlay.hidden = true;
  }
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
  if (event.target.closest?.('button, a, select, [role="button"]')) return;
  const index = Number(event.key);
  if (index >= 1 && index <= ANIMALS.length) setAnimal(ANIMALS[index - 1]);
  if (event.code === 'Space') {
    event.preventDefault();
    reactPet();
  }
  if (event.key.toLowerCase() === 's') downloadSnapshot();
  if (event.key.toLowerCase() === 'l') setLang(state.lang === 'en' ? 'th' : 'en');
});

stageEl.addEventListener('pointerdown', () => {
  const hint = $('#hint-chip');
  if (hint) hint.classList.add('is-hidden');
}, { once: true });

/* -------------------------------------------------------------- animation */

const clock = new THREE.Clock();
let elapsed = 0;
let lastBlink = 1;
let blinkSoundCooldown = 0;

const animate = () => {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  const target = expressionPose(state.expression);
  const lambda = reducedMotion ? 12 : 6;
  for (const key of Object.keys(target)) {
    pose[key] = damp(pose[key] ?? target[key], target[key], lambda, dt);
  }

  if (rig) {
    const bob = Math.sin(elapsed * 1.45 + rig.seed) * 0.045 * pose.floatAmp * (reducedMotion ? 0.3 : 1);
    let jump = 0;
    let spin = 0;
    let squash = 1;

    if (react.active) {
      react.time += dt;
      const k = Math.min(1, react.time / react.duration);
      jump = Math.sin(k * Math.PI) * 0.82;
      spin = easeOutCubic(k) * Math.PI * 2 * react.dir;
      squash = 1 + Math.sin(k * Math.PI * 3) * 0.035 * (1 - k);
      if (k >= 1) {
        react.active = false;
        react.time = 0;
        react.landed = true;
      }
    }

    rig.group.position.y = bob + jump;
    rig.group.rotation.y = spin;
    rig.group.rotation.z = Math.sin(elapsed * 1.1) * 0.012 * pose.floatAmp;
    rig.group.scale.set(squash, 2 - squash, squash);

    rig.body.scale.set(
      rig.body.userData.baseScale.x * (1 + Math.sin(elapsed * 1.9) * 0.012),
      rig.body.userData.baseScale.y * (1 + Math.sin(elapsed * 1.9 + 0.4) * 0.014),
      rig.body.userData.baseScale.z,
    );
    rig.belly.scale.set(
      rig.base.belly.x * (1 + Math.sin(elapsed * 2.1) * 0.025),
      rig.base.belly.y * (1 + Math.sin(elapsed * 2.1 - 0.3) * 0.028),
      rig.base.belly.z,
    );

    const blink = blinkScale(elapsed, rig.blinkSeed);
    if (blink < 0.25 && lastBlink >= 0.25 && blinkSoundCooldown <= 0 && !reducedMotion) {
      audio.play('blink');
      blinkSoundCooldown = 2.4;
    }
    lastBlink = blink;
    blinkSoundCooldown = Math.max(0, blinkSoundCooldown - dt);

    for (const eye of rig.eyes) {
      const base = eye.userData.baseScale;
      eye.scale.y = base.y * blink * pose.eyeOpen;
      eye.scale.x = base.x * pose.eyeScale;
    }
    for (const glint of rig.glints) glint.visible = blink > 0.55;

    const tiltWave = Math.sin(elapsed * 1.25) * 0.035 * pose.floatAmp;
    rig.head.rotation.z = pose.headTilt + tiltWave;
    rig.head.rotation.x = pose.headNod + Math.sin(elapsed * 0.9) * 0.012;

    rig.ears.forEach((ear, index) => {
      const dir = index === 0 ? -1 : 1;
      const base = rig.earBases?.[index] ?? (index === 0 ? -0.16 : 0.16);
      const wiggle = Math.sin(elapsed * (2.3 + pose.tailSpeed * 0.18) + index * 1.4) * pose.earAmp;
      ear.rotation.z = base + dir * wiggle + (index === 0 ? pose.earLift * 0.5 : -pose.earLift * 0.5);
      ear.rotation.x = -0.04 + Math.sin(elapsed * 1.7 + index) * 0.02;
    });

    rig.tail.rotation.z = Math.sin(elapsed * pose.tailSpeed) * pose.tailAmp;
    rig.tail.rotation.y = Math.sin(elapsed * pose.tailSpeed * 0.6) * pose.tailAmp * 0.4;

    for (const cheek of rig.cheeks) {
      const base = cheek.userData.baseScale;
      cheek.scale.set(base.x * clamp(pose.cheek, 0.4, 1.4), base.y * clamp(pose.cheek, 0.4, 1.4), base.z);
    }

    if (rig.mouth) {
      const smile = clamp(pose.cheek, 0.4, 1.25);
      rig.mouth.scale.set(smile, smile, smile);
      rig.mouth.rotation.z = Math.PI + (state.expression === 'sleepy' ? 0.25 : 0);
    }

    if (rig.waddle) {
      rig.group.rotation.z += Math.sin(elapsed * 4.2) * 0.045;
      rig.feet.forEach((foot, index) => {
        foot.rotation.x = Math.sin(elapsed * 4.2 + index * Math.PI) * 0.12;
      });
    }
  }

  if (sparkles.visible) {
    let alive = false;
    for (let i = 0; i < sparkleCount; i += 1) {
      const v = sparkleVelocities[i];
      if (v.life <= 0) continue;
      v.life -= dt;
      sparklePositions[i * 3] += v.x * dt;
      sparklePositions[i * 3 + 1] += v.y * dt;
      sparklePositions[i * 3 + 2] += v.z * dt;
      v.y -= 1.6 * dt;
      if (v.life <= 0) sparklePositions[i * 3 + 1] = -99;
      else alive = true;
    }
    sparkleGeometry.attributes.position.needsUpdate = true;
    sparkles.visible = alive;
  }

  propGroup.rotation.y = elapsed * 0.06;
  propGroup.children.forEach((prop, index) => {
    prop.rotation.z += dt * (0.2 + index * 0.1);
    if (prop.userData.baseY === undefined) prop.userData.baseY = prop.position.y;
    prop.position.y = prop.userData.baseY + Math.sin(elapsed * 0.8 + index) * 0.06;
  });

  pedestalRim.rotation.z = elapsed * 0.05;

  controls.update();
  renderer.render(scene, camera);
};

/* ----------------------------------------------------------------- selftest */

const runSelfTest = async () => {
  const results = [];
  const check = async (name, fn) => {
    try {
      const detail = await fn();
      results.push({ name, ok: detail !== false, detail: detail === false ? 'failed' : detail });
    } catch (error) {
      results.push({ name, ok: false, detail: error?.message || String(error) });
    }
  };

  const flatten = (object, prefix = '') =>
    Object.entries(object).flatMap(([key, value]) => {
      const next = prefix ? `${prefix}.${key}` : key;
      return value && typeof value === 'object' ? flatten(value, next) : [[next, value]];
    });

  await check('WebGL renderer initialised', () => Boolean(renderer.getContext()));
  await check('Shadows enabled (PCFSoft)', () => renderer.shadowMap.enabled && renderer.shadowMap.type === THREE.PCFSoftShadowMap);
  await check('Canvas uses alpha', () => renderer.getContext().getContextAttributes().alpha === true);
  await check('OrbitControls damping on', () => controls.enableDamping === true);
  await check('All four animal builders', () =>
    ANIMALS.every((id) => typeof BUILDERS[id] === 'function' && countMeshes(BUILDERS[id](makeMaterials(DEFAULT_COLORS[id])).group) > 18),
  );
  await check('Rigs expose eyes, ears, tail, belly', () => {
    return ANIMALS.every((id) => {
      const instance = BUILDERS[id](makeMaterials(DEFAULT_COLORS[id]));
      const ok = instance.eyes.length === 2 && instance.ears.length === 2 && Boolean(instance.tail) && Boolean(instance.belly);
      disposeRig(instance);
      return ok;
    });
  });
  await check('Every animal has a distinct mesh count', () => {
    const counts = ANIMALS.map((id) => countMeshes(BUILDERS[id](makeMaterials(DEFAULT_COLORS[id])).group));
    return new Set(counts).size === ANIMALS.length;
  });
  await check('Palette recolour changes material', () => {
    const instance = BUILDERS.bear(makeMaterials(DEFAULT_COLORS.bear));
    applyColors(instance, { main: '#123456', belly: '#abcdef', blush: '#fedcba' });
    const hex = `#${instance.materials.main.color.getHexString()}`;
    disposeRig(instance);
    return hex === '#123456';
  });
  await check('Expression poses are distinct', () => {
    const poses = EXPRESSIONS.map((expr) => JSON.stringify(expressionPose(expr)));
    return new Set(poses).size === EXPRESSIONS.length;
  });
  await check('Blink cycle opens and closes', () => {
    let min = 1;
    let max = 0;
    for (let t = 0; t < 12; t += 0.01) {
      const value = blinkScale(t, 5);
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
    return min < 0.1 && max > 0.99;
  });
  await check('EN/TH dictionary parity', () => {
    const en = flatten(I18N.en).length;
    const th = flatten(I18N.th).length;
    const enKeys = new Set(flatten(I18N.en).map(([key]) => key));
    const thKeys = new Set(flatten(I18N.th).map(([key]) => key));
    return en === th && [...enKeys].every((key) => thKeys.has(key));
  });
  await check('Preset sanitiser rejects bad data', () =>
    sanitizePresets([{ animal: 'unicorn', colors: {} }, null, { animal: 'bear', colors: { main: 'tomato' }, name: 'ok' }]).length === 1,
  );
  await check('Share state round-trips', () => {
    const encoded = encodeShareState({
      animal: 'shiba', expression: 'curious', lang: 'th',
      colors: { main: '#112233', belly: '#445566', blush: '#778899' },
      accessories: { bowtie: true, partyHat: false, glasses: true },
    });
    const decoded = decodeShareState(encoded);
    return decoded.animal === 'shiba' && decoded.expression === 'curious' && decoded.lang === 'th' &&
      decoded.colors.main === '#112233' && decoded.accessories.bowtie && decoded.accessories.glasses;
  });
  await check('Snapshot filename is safe', () => /^cute3d-[a-z]+-\d{4}-\d{2}-\d{2}\.png$/.test(snapshotFilename('bear', new Date('2026-11-04T12:00:00Z'))));
  await check('Three accessories are built', () =>
    ACCESSORIES.every((key) => {
      const node = ACCESSORY_BUILDERS[key]();
      const ok = node.children.length > 0;
      node.traverse((child) => {
        if (child.isMesh && child.geometry && !child.geometry.userData.shared) child.geometry.dispose();
      });
      return ok;
    }),
  );
  await check('Mesh counter matches the live rig', () => {
    return Number($('#mesh-count').textContent) === countMeshes(rig.group);
  });
  await check('Bilingual DOM is wired', () =>
    $$('[data-i18n]').length >= 40 && document.documentElement.lang === state.lang,
  );
  await check('Presets survive sanitisation', () => {
    const storedPresets = sanitizePresets([{ id: 'p-test-1', name: 'Test', animal: 'bunny', colors: state.colors.bunny, accessories: { bowtie: true } }]);
    return storedPresets.length === 1 && storedPresets[0].name === 'Test';
  });
  await check('Transparent snapshot renders', () => {
    const url = captureSnapshot(512);
    return /^data:image\/png;base64,/.test(url) && url.length > 2000;
  });

  const passed = results.filter((item) => item.ok).length;
  const report = { passed, total: results.length, results, at: new Date().toISOString() };
  window.__selftest = report;

  const overlay = $('#selftest-overlay');
  const list = $('#selftest-list');
  if (overlay && list) {
    list.innerHTML = '';
    for (const item of report.results) {
      const li = document.createElement('li');
      li.className = item.ok ? 'is-pass' : 'is-fail';
      const badge = document.createElement('b');
      badge.textContent = item.ok ? '✓' : '✕';
      const text = document.createElement('span');
      text.textContent = item.name;
      li.append(badge, text);
      list.append(li);
    }
    $('#selftest-summary').textContent = `${passed} / ${results.length} checks passed`;
    overlay.hidden = false;
  }
  return report;
};

$('#selftest-close')?.addEventListener('click', () => {
  $('#selftest-overlay').hidden = true;
});

/* ------------------------------------------------------------------- boot */

const applyShareFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('a') && !params.has('c')) return false;
  const shared = decodeShareState(params);
  if (!shared.valid) return false;
  state.animal = shared.animal;
  state.expression = shared.expression;
  state.lang = shared.lang;
  state.colors[shared.animal] = shared.colors;
  state.accessories = shared.accessories;
  return true;
};

const boot = () => {
  const fromShare = applyShareFromUrl();

  if (state.lang !== 'en' && state.lang !== 'th') state.lang = 'en';
  document.documentElement.lang = state.lang;
  document.body.dataset.lang = state.lang;

  rig = buildAnimal(state.animal, state.colors[state.animal]);
  scene.add(rig.group);
  applyColors(rig, state.colors[state.animal]);
  applyAccessories();
  syncColorInputs(state.colors[state.animal]);
  syncAnimalButtons();
  syncExpressionButtons();
  syncAccessoryButtons();
  syncSoundButtons();
  updatePetCard();
  updateMeshCount();
  applyI18n();
  resize();

  const loading = $('#stage-loading');
  if (loading) {
    window.setTimeout(() => loading.classList.add('is-hidden'), 220);
  }
  if (fromShare) {
    window.setTimeout(() => toast(t('toast.animal', { name: t(`pet.${state.animal}.name`) }), '🔗'), 600);
    persistState();
  }

  animate();

  window.__cute3d = {
    ready: true,
    version: '1.0.0',
    engine: ENGINE,
    state,
    scene,
    camera,
    renderer,
    controls,
    rig,
    animals: [...ANIMALS],
    expressions: [...EXPRESSIONS],
    accessories: [...ACCESSORIES],
    i18n: I18N,
    builders: BUILDERS,
    setAnimal: (id) => setAnimal(id, { quiet: true }),
    setExpression: (expression) => setExpression(expression, { quiet: true }),
    setAccessory: (key, value) => setAccessory(key, value, { quiet: true }),
    setColors: (colors) => setColors(colors, { quiet: true }),
    setLang: (lang) => setLang(lang, { quiet: true }),
    setSound: (on) => setSound(on, { quiet: true }),
    react: reactPet,
    reaction: () => ({ ...react }),
    getRig: () => rig,
    meshCount: () => (rig ? countMeshes(rig.group) : 0),
    snapshot: () => captureSnapshot(2048),
    snapshotDataUrl: () => captureSnapshot(1024),
    downloadSnapshot,
    shareUrl: buildShareUrl,
    copyShareLink,
    savePreset,
    presets: () => presets,
    runSelfTest,
    captureSnapshot,
    audio,
  };

  if (new URLSearchParams(window.location.search).has('selftest')) {
    window.setTimeout(() => runSelfTest(), 500);
  }
};

boot();
/* APP:END */
