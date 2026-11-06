/* Cute3D — Procedural Code-Only Animal Studio
 * ---------------------------------------------------------------------------
 * Everything you can see is generated at runtime: seven animal characters,
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
  const ANIMALS = ['bear', 'bunny', 'penguin', 'shiba', 'koala', 'conure', 'fold'];
  const EXPRESSIONS = ['happy', 'sleepy', 'curious', 'wiggle'];
  const ACCESSORIES = ['bowtie', 'partyHat', 'glasses'];
  const COLOR_KEYS = ['main', 'belly', 'blush'];
  const PRESET_LIMIT = 10;
  const COAT_LEVELS = ['off', 'soft', 'plush', 'vfx'];
  const DEFAULT_COAT = 'soft';
  const LIGHTING_PRESETS = ['studio', 'sky', 'desk'];
  const DEFAULT_LIGHTING = 'studio';
  const DEFAULT_FUR = { length: 1, density: 0.7, curl: 0.35, clump: 0.4, breeze: 0.3 };

  const DEFAULT_COLORS = {
    bear: { main: '#c9977a', belly: '#fff0e5', blush: '#ffb3c6' },
    bunny: { main: '#f7ddd0', belly: '#fff8f2', blush: '#ffb3c9' },
    penguin: { main: '#55688a', belly: '#fffaf4', blush: '#ffb6c4' },
    shiba: { main: '#e8ad6d', belly: '#fff7e9', blush: '#ffae9d' },
    koala: { main: '#a7adb5', belly: '#fbf6ee', blush: '#f0b1b8' },
    conure: { main: '#f8cf5c', belly: '#ffa63d', blush: '#ff8f68' },
    fold: { main: '#c3bab2', belly: '#fbf3ea', blush: '#eda9b3' },
  };

  const PALETTES = [
    { id: 'mochi', main: '#c9977a', belly: '#fff0e5', blush: '#ffb3c6' },
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

  const sanitizeCoat = (value) => (COAT_LEVELS.includes(value) ? value : DEFAULT_COAT);
  const sanitizeLighting = (value) => (LIGHTING_PRESETS.includes(value) ? value : DEFAULT_LIGHTING);
  const sanitizeFur = (raw) => {
    const source = raw && typeof raw === 'object' ? raw : {};
    const number = (value, fallback, min, max) =>
      clamp(Number.isFinite(Number(value)) ? Number(value) : fallback, min, max);
    return {
      length: number(source.length, DEFAULT_FUR.length, 0.4, 1.8),
      density: number(source.density, DEFAULT_FUR.density, 0.1, 1),
      curl: number(source.curl, DEFAULT_FUR.curl, 0, 1),
      clump: number(source.clump, DEFAULT_FUR.clump, 0, 1),
      breeze: number(source.breeze, DEFAULT_FUR.breeze, 0, 1),
    };
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
    const coat = sanitizeCoat(raw.coat);
    const lighting = sanitizeLighting(raw.lighting);
    const fur = sanitizeFur(raw.fur);
    let name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 42) : '';
    if (!name) name = `${animal} preset`;
    let id = typeof raw.id === 'string' ? raw.id : '';
    if (!/^[a-z0-9-]{6,48}$/.test(id)) {
      id = `p-${hashString(`${animal}|${name}|${JSON.stringify(colors)}`).toString(36)}`;
    }
    const createdAt = Number.isFinite(raw.createdAt) ? Math.max(0, raw.createdAt) : 0;
    return { id, name, animal, colors, accessories, expression, coat, lighting, fur, createdAt };
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
    params.set('f', sanitizeCoat(state.coat));
    params.set('g', sanitizeLighting(state.lighting));
    const fur = sanitizeFur(state.fur);
    params.set('u', [fur.length, fur.density, fur.curl, fur.clump, fur.breeze].join('-'));
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
    const coat = sanitizeCoat(params.get('f'));
    const lighting = sanitizeLighting(params.get('g'));
    const furParts = (params.get('u') || '').split('-').map(Number);
    const fur = sanitizeFur({
      length: furParts[0], density: furParts[1], curl: furParts[2], clump: furParts[3], breeze: furParts[4],
    });
    return { animal, expression, colors, accessories, lang, coat, lighting, fur, valid: Boolean(animal) };
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
    COAT_LEVELS,
    DEFAULT_COAT,
    LIGHTING_PRESETS,
    DEFAULT_LIGHTING,
    DEFAULT_FUR,
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
    sanitizeCoat,
    sanitizeLighting,
    sanitizeFur,
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
    'stage.hint': 'Drag to orbit · Scroll to zoom · Click the pet · Drag the fan',
    'stage.meshes': 'meshes',
    'stage.react': 'React',
    'panel.open': 'Customize',
    'panel.title': 'Studio',
    'panel.sub': 'Seven friends, zero model files.',
    'section.animals': 'Characters',
    'section.animalsNote': '7 originals',
    'section.expression': 'Expression',
    'section.expressionNote': 'Tap to try',
    'section.colors': 'Colours',
    'section.accessories': 'Accessories',
    'section.accessoriesNote': 'Code-built',
    'section.fur': 'Fur studio',
    'section.scene': 'Scene',
    'section.sceneNote': 'Lighting mood',
    'section.studio': 'Studio tools',
    'animal.bear': 'Chibi Bear',
    'animal.bearTrait': 'Huggable',
    'animal.bunny': 'Bunny',
    'animal.bunnyTrait': 'Bouncy',
    'animal.penguin': 'Penguin',
    'animal.penguinTrait': 'Waddly',
    'animal.shiba': 'Shiba',
    'animal.shibaTrait': 'Cheerful',
    'animal.koala': 'Koala',
    'animal.koalaTrait': 'Dreamy',
    'animal.conure': 'Sun Conure',
    'animal.conureTrait': 'Radiant',
    'animal.fold': 'Scottish Fold',
    'animal.foldTrait': 'Plush',
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
    'coat.off': 'Smooth',
    'coat.soft': 'Soft',
    'coat.plush': 'Plush',
    'coat.vfx': 'VFX',
    'coat.hint': 'Soft shells plus thousands of GPU strands that move with the breeze.',
    'coat.strands': '{n} strands',
    'fur.length': 'Length',
    'fur.density': 'Density',
    'fur.curl': 'Curl',
    'fur.clump': 'Clumping',
    'fur.breeze': 'Wind',
    'scene.studio': 'Studio',
    'scene.sky': 'Cloud Sky',
    'scene.desk': 'Cozy Desk',
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
    'pet.koala.name': 'Kumo the Koala',
    'pet.koala.tagline': 'Fluffy ears, slow blinks, endless tree dreams.',
    'pet.conure.name': 'Sol the Sun Conure',
    'pet.conure.tagline': 'A pocket of sunshine with emerald wings.',
    'pet.fold.name': 'Biscuit the Scottish Fold',
    'pet.fold.tagline': 'Folded ears, round eyes, the softest biscuit.',
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
    'a11y.coat': 'Choose fur or feather detail',
    'a11y.furLength': 'Fur length',
    'a11y.furDensity': 'Fur density',
    'a11y.furCurl': 'Fur curl',
    'a11y.furClump': 'Fur clumping',
    'a11y.furBreeze': 'Breeze strength',
    'a11y.scene': 'Choose a lighting preset',
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
    'toast.coat': 'Coat: {name}',
    'toast.lighting': 'Lighting: {name}',
    'toast.webgl': 'WebGL could not start in this browser.',
    'preset.auto': '{name} look',
    'preset.meta': '{animal} · {accessories}',
    'preset.none': 'no accessories',
    'meta.title': 'Cute3D — Procedural Code-Only Animal Studio',
    'meta.desc': 'A zero-asset 3D animal studio with seven original code-built pets, bilingual English/ไทย UI, procedural audio and transparent PNG snapshots.',
  },
  th: {
    'brand.sub': 'สตูดิโอสัตว์ 3D จากโค้ด',
    'status.live': 'สร้างสดด้วยโค้ด',
    'status.loading': 'กำลังปลุกเหล่าน้อง ๆ…',
    'common.sound': 'เสียง',
    'common.reset': 'รีเซ็ต',
    'stage.hint': 'ลากเพื่อหมุน · เลื่อนเพื่อซูม · คลิกที่สัตว์ · ลากพัดลม',
    'stage.meshes': 'ชิ้นโมเดล',
    'stage.react': 'เล่นด้วย',
    'panel.open': 'แต่งตัว',
    'panel.title': 'สตูดิโอ',
    'panel.sub': 'เจ็ดเพื่อนน้อย ไม่มีไฟล์โมเดล',
    'section.animals': 'ตัวละคร',
    'section.animalsNote': 'เจ็ดต้นฉบับ',
    'section.expression': 'อารมณ์',
    'section.expressionNote': 'ลองกดดู',
    'section.colors': 'สีสัน',
    'section.accessories': 'เครื่องประดับ',
    'section.accessoriesNote': 'สร้างจากโค้ด',
    'section.fur': 'สตูดิโอขน',
    'section.scene': 'ฉาก',
    'section.sceneNote': 'โทนแสง',
    'section.studio': 'เครื่องมือ',
    'animal.bear': 'หมีจิบิ',
    'animal.bearTrait': 'กอดนุ่ม',
    'animal.bunny': 'กระต่าย',
    'animal.bunnyTrait': 'กระโดดเก่ง',
    'animal.penguin': 'เพนกวิน',
    'animal.penguinTrait': 'เดินเป๋',
    'animal.shiba': 'ชิบะ',
    'animal.shibaTrait': 'ร่าเริง',
    'animal.koala': 'โคอาล่า',
    'animal.koalaTrait': 'ขี้ฝัน',
    'animal.conure': 'ซันคอนัวร์',
    'animal.conureTrait': 'สดใส',
    'animal.fold': 'สก็อตติชโฟลด์',
    'animal.foldTrait': 'นุ่มฟู',
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
    'coat.off': 'เรียบ',
    'coat.soft': 'นุ่ม',
    'coat.plush': 'ฟูหนา',
    'coat.vfx': 'VFX',
    'coat.hint': 'เปลือกขนนุ่ม ๆ พร้อมเส้นขนหลายพันเส้นขยับตามลม',
    'coat.strands': '{n} เส้น',
    'fur.length': 'ความยาว',
    'fur.density': 'ความหนา',
    'fur.curl': 'ความหยิก',
    'fur.clump': 'การเกาะกลุ่ม',
    'fur.breeze': 'ลม',
    'scene.studio': 'สตูดิโอ',
    'scene.sky': 'ท้องฟ้าพาสเทล',
    'scene.desk': 'โต๊ะอุ่น ๆ',
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
    'pet.koala.name': 'คูโมะ โคอาล่า',
    'pet.koala.tagline': 'หูฟู ตาช้า ฝันถึงต้นไม้ทั้งวัน',
    'pet.conure.name': 'โซล ซันคอนัวร์',
    'pet.conure.tagline': 'แสงแดดก้อนน้อยพร้อมปีกมรกต',
    'pet.fold.name': 'บิสกิต สก็อตติชโฟลด์',
    'pet.fold.tagline': 'หูพับ ตากลม นุ่มเหมือนบิสกิต',
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
    'a11y.coat': 'เลือกความละเอียดของขนหรือขนนก',
    'a11y.furLength': 'ความยาวขน',
    'a11y.furDensity': 'ความหนาแน่นขน',
    'a11y.furCurl': 'ความหยิกของขน',
    'a11y.furClump': 'การเกาะกลุ่มของขน',
    'a11y.furBreeze': 'ความแรงลม',
    'a11y.scene': 'เลือกโทนแสง',
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
    'toast.coat': 'ขน: {name}',
    'toast.lighting': 'โทนแสง: {name}',
    'toast.webgl': 'เบราว์เซอร์นี้ไม่สามารถเปิด WebGL ได้',
    'preset.auto': 'ลุคของ{name}',
    'preset.meta': '{animal} · {accessories}',
    'preset.none': 'ไม่ใส่เครื่องประดับ',
    'meta.title': 'Cute3D — สตูดิโอสัตว์ 3D จากโค้ด',
    'meta.desc': 'สตูดิโอสัตว์ 3D ที่ไม่ใช้ไฟล์โมเดลเลย เจ็ดตัวละครต้นฉบับสร้างจากโค้ด รองรับสองภาษา เสียงสังเคราะห์ และภาพ PNG พื้นหลังโปร่งใส',
  },
};
/* I18N:END */

/* APP:START */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ENGINE = createStudioEngine();
const {
  ANIMALS, EXPRESSIONS, ACCESSORIES, COLOR_KEYS, PRESET_LIMIT,
  DEFAULT_COLORS, PALETTES, COAT_LEVELS, DEFAULT_COAT, LIGHTING_PRESETS, DEFAULT_LIGHTING, DEFAULT_FUR,
  clamp, damp, lerp, smoothstep, easeOutCubic, normalizeHex, mixHex, shade, blinkScale, expressionPose,
  sanitizeColors, sanitizeCoat, sanitizeLighting, sanitizeFur,
  sanitizePresets, snapshotFilename, encodeShareState, decodeShareState,
  soundPattern, clampSnapshotSize, formatMeshLabel,
} = ENGINE;

const STORE = {
  state: 'cute3d:state:v1',
  presets: 'cute3d:presets:v1',
  lang: 'cute3d:lang:v1',
};

const ANIMAL_EMOJI = { bear: '🧸', bunny: '🐰', penguin: '🐧', shiba: '🐕', koala: '🐨', conure: '🦜', fold: '🐱' };

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
  coat: DEFAULT_COAT,
  lighting: DEFAULT_LIGHTING,
  fanAngle: 0.6,
  fur: { ...DEFAULT_FUR },
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
  state.coat = sanitizeCoat(stored.coat);
  state.lighting = sanitizeLighting(stored.lighting);
  state.fur = sanitizeFur(stored.fur);
  state.fanAngle = Number.isFinite(stored.fanAngle) ? stored.fanAngle : 0.6;
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

const cloudGroup = new THREE.Group();
cloudGroup.name = 'clouds';
{
  const cloudGeo = new THREE.SphereGeometry(1, 12, 9);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xfbfdff, roughness: 1, metalness: 0, transparent: true, opacity: 0.82, depthWrite: false,
  });
  const clusters = [
    { pos: [-2.8, 3.2, -3.8], scale: 0.85 },
    { pos: [1.1, 4.0, -4.4], scale: 0.65 },
    { pos: [3.1, 2.55, -3.6], scale: 0.55 },
    { pos: [-4.2, 2.2, -4.8], scale: 0.45 },
  ];
  for (const [index, cluster] of clusters.entries()) {
    const group = new THREE.Group();
    group.position.set(...cluster.pos);
    group.scale.setScalar(cluster.scale);
    const puffs = [
      [0, 0, 0, 0.42], [0.42, -0.05, 0.06, 0.3], [-0.4, -0.08, 0.04, 0.28],
      [0.18, 0.18, -0.04, 0.26], [-0.14, -0.16, 0.08, 0.24],
    ];
    for (const [x, y, z, scale] of puffs) {
      const puff = new THREE.Mesh(cloudGeo, cloudMat);
      puff.position.set(x, y + Math.sin(index + x) * 0.06, z);
      puff.scale.set(scale * 1.2, scale * 0.78, scale);
      puff.castShadow = false;
      puff.receiveShadow = false;
      group.add(puff);
    }
    group.userData.baseX = cluster.pos[0];
    group.userData.baseY = cluster.pos[1];
    cloudGroup.add(group);
  }
  cloudGroup.visible = false;
  scene.add(cloudGroup);
}


const perchGroup = new THREE.Group();
perchGroup.name = 'conure-perch';
{
  const wood = new THREE.MeshStandardMaterial({ color: 0xb98a62, roughness: 0.82 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x6fa87c, roughness: 0.8 });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 3.1, 14), wood);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 0.03, 0.2);
  bar.castShadow = true;
  bar.receiveShadow = true;
  perchGroup.add(bar);
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.2, 12), wood);
    post.position.set(side * 1.3, 0.02, 0.2);
    post.castShadow = true;
    perchGroup.add(post);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), leafMat);
    leaf.scale.set(0.55, 1.5, 0.35);
    leaf.position.set(side * 1.5, 0.2, 0.2);
    leaf.rotation.z = side * 0.7;
    leaf.castShadow = true;
    perchGroup.add(leaf);
  }
  perchGroup.visible = false;
  scene.add(perchGroup);
}

const deskGroup = new THREE.Group();
deskGroup.name = 'cozy-desk';
{
  const wood = new THREE.MeshStandardMaterial({ color: 0xd9ae83, roughness: 0.78 });
  const woodDark = new THREE.MeshStandardMaterial({ color: 0xb98961, roughness: 0.82 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xfff7ee, roughness: 0.65 });
  const coffee = new THREE.MeshStandardMaterial({ color: 0x6f4433, roughness: 0.5 });
  const terracotta = new THREE.MeshStandardMaterial({ color: 0xd9816a, roughness: 0.85 });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x6fa87c, roughness: 0.8 });
  const bookA = new THREE.MeshStandardMaterial({ color: 0xf4a9a0, roughness: 0.8 });
  const bookB = new THREE.MeshStandardMaterial({ color: 0xb9a5e8, roughness: 0.8 });
  const bookC = new THREE.MeshStandardMaterial({ color: 0x8fd3bf, roughness: 0.8 });

  const top = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.78, 0.18, 72), wood);
  top.position.y = -0.09;
  top.receiveShadow = true;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.74, 0.035, 10, 96), woodDark);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.005;
  deskGroup.add(top, rim);

  const mug = new THREE.Group();
  mug.position.set(1.55, 0.17, 0.52);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.3, 24), cream);
  cup.castShadow = true;
  const drink = new THREE.Mesh(new THREE.CircleGeometry(0.165, 24), coffee);
  drink.rotation.x = -Math.PI / 2;
  drink.position.y = 0.151;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.028, 8, 18, Math.PI * 1.4), cream);
  handle.position.set(0.2, 0.02, 0);
  handle.rotation.z = Math.PI / 2;
  mug.add(cup, drink, handle);
  deskGroup.add(mug);

  const plant = new THREE.Group();
  plant.position.set(-1.55, 0.16, 0.55);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.28, 20), terracotta);
  pot.castShadow = true;
  plant.add(pot);
  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2;
    const leafMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), leaf);
    leafMesh.scale.set(0.7, 1.5, 0.38);
    leafMesh.position.set(Math.cos(angle) * 0.12, 0.32 + (i % 2) * 0.06, Math.sin(angle) * 0.1);
    leafMesh.rotation.z = Math.cos(angle) * 0.5;
    leafMesh.castShadow = true;
    plant.add(leafMesh);
  }
  deskGroup.add(plant);

  const books = new THREE.Group();
  books.position.set(-1.45, 0, -0.75);
  [[0.95, 0.12, 0.66, 0.06, bookA], [0.82, 0.1, 0.58, 0.19, bookB], [0.72, 0.09, 0.5, 0.3, bookC]]
    .forEach(([w, h, d, y, mat], index) => {
      const book = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      book.position.set(index * 0.03, y, 0);
      book.rotation.y = index * 0.08;
      book.castShadow = true;
      book.receiveShadow = true;
      books.add(book);
    });
  deskGroup.add(books);

  deskGroup.visible = false;
  scene.add(deskGroup);
}


const fanGroup = new THREE.Group();
fanGroup.name = 'wind-fan';
let fanBlades = null;
let fanHead = null;
{
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xf2a7b8, roughness: 0.6 });
  const standMat = new THREE.MeshStandardMaterial({ color: 0xfff4ee, roughness: 0.7 });
  const cageMat = new THREE.MeshStandardMaterial({ color: 0xb9a5e8, roughness: 0.5, metalness: 0.15 });
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x9fd8c7, roughness: 0.55, side: THREE.DoubleSide });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.08, 28), baseMat);
  base.position.y = 0.04;
  base.receiveShadow = true;
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.85, 12), standMat);
  stand.position.y = 0.47;
  stand.castShadow = true;
  fanGroup.add(base, stand);

  fanHead = new THREE.Group();
  fanHead.position.set(0, 1.02, 0);
  const cage = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 10, 40), cageMat);
  cage.castShadow = true;
  const cageBack = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.02, 8, 36), cageMat);
  cageBack.position.z = -0.04;
  fanHead.add(cage, cageBack);

  fanBlades = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const blade = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20, 0, Math.PI * 0.7), bladeMat);
    blade.position.z = 0.02;
    blade.rotation.z = (i / 4) * Math.PI * 2;
    blade.scale.set(0.9, 0.55, 1);
    fanBlades.add(blade);
  }
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), baseMat);
  hub.position.z = 0.05;
  fanBlades.add(hub);
  fanHead.add(fanBlades);
  fanGroup.add(fanHead);
  fanGroup.scale.setScalar(1.25);
  scene.add(fanGroup);
}

const fanWind = { direction: new THREE.Vector3(-1, 0.2, -1).normalize(), head: new THREE.Vector3() };
const FAN_RADIUS = 2.05;

const updateFanPose = (angle, { persist = false } = {}) => {
  const a = Number(angle);
  if (!Number.isFinite(a)) return;
  state.fanAngle = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  fanGroup.position.set(Math.cos(state.fanAngle) * FAN_RADIUS, 0.02, Math.sin(state.fanAngle) * FAN_RADIUS);
  const dir = new THREE.Vector3(0, 1.3, 0).sub(fanGroup.position);
  fanWind.direction.set(dir.x, 0, dir.z).normalize();
  fanHead.rotation.y = Math.atan2(-fanGroup.position.x, -fanGroup.position.z);
  if (persist) persistState();
};


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

  const haunchL = sphere(materials, 'main', { pos: [-0.56, 0.32, -0.2], scale: [0.3, 0.34, 0.36], name: 'haunch-left' });
  const haunchR = sphere(materials, 'main', { pos: [0.56, 0.32, -0.2], scale: [0.3, 0.34, 0.36], name: 'haunch-right' });
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

  group.add(body, belly, legL, legR, pawL, pawR, haunchL, haunchR, armL, armR, tailPivot, head, neck);

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

/* ------------------------------------------------------- feathers & coats */

const featherGeoCache = new Map();

const featherGeometry = (baseHex, tipHex) => {
  const key = `${baseHex}|${tipHex}`;
  if (featherGeoCache.has(key)) return featherGeoCache.get(key);
  const base = new THREE.Color(baseHex).convertSRGBToLinear();
  const tip = new THREE.Color(tipHex).convertSRGBToLinear();
  const rows = 10;
  const positions = [];
  const colors = [];
  const indices = [];
  for (let row = 0; row <= rows; row += 1) {
    const t = row / rows;
    const width = 0.015 + 0.28 * Math.pow(Math.sin(Math.PI * t), 0.72) * (1 - t * 0.18);
    const z = 0.02 + 0.13 * t * t + 0.045 * Math.sin(Math.PI * t);
    const edge = base.clone().lerp(tip, t).multiplyScalar(0.78);
    const centre = base.clone().lerp(tip, t).lerp(new THREE.Color('#ffffff'), 0.18);
    positions.push(-width, t, z, 0, t, z + 0.018, width, t, z);
    colors.push(edge.r, edge.g, edge.b, centre.r, centre.g, centre.b, edge.r, edge.g, edge.b);
    if (row < rows) {
      const a = row * 3;
      const b = a + 3;
      indices.push(a, b, a + 1, b, b + 1, a + 1, a + 1, b + 1, a + 2, b + 1, b + 2, a + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.userData.shared = true;
  featherGeoCache.set(key, geo);
  return geo;
};


const featherMaterial = () => new THREE.MeshStandardMaterial({
  color: 0xffffff,
  vertexColors: true,
  side: THREE.DoubleSide,
  roughness: 0.76,
  metalness: 0,
});

const featherMesh = (geometry, material, { pos, rot, scale, name = '' }) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (name) mesh.name = name;
  mesh.userData.baseScale = mesh.scale.clone();
  return mesh;
};

const buildConureWing = (side) => {
  const group = new THREE.Group();
  group.position.set(side * 0.69, 1.36, 0.02);
  group.rotation.set(0.02, side * 0.42, side * 0.1);
  const green = featherGeometry('#5cbf72', '#2f8a50');
  const lime = featherGeometry('#b7cf48', '#e0d95b');
  const material = featherMaterial();
  for (let i = 0; i < 6; i += 1) {
    const t = i / 5;
    const feather = featherMesh(green, material, {
      pos: [side * (0.01 + t * 0.025), -0.02 - t * 0.13, -0.02 + t * 0.1],
      rot: [0.14 * t, side * 0.16, Math.PI + side * (0.16 + t * 0.2)],
      scale: [0.78 + t * 0.2, 0.62 + t * 0.22, 1],
      name: `wing-feather-${side > 0 ? 'right' : 'left'}-${i}`,
    });
    feather.castShadow = false;
    group.add(feather);
  }
  for (let i = 0; i < 4; i += 1) {
    const t = i / 3;
    const covert = featherMesh(lime, material, {
      pos: [side * (0.01 + t * 0.02), 0.16 - t * 0.09, 0.1 - t * 0.02],
      rot: [0.1, side * 0.2, Math.PI + side * (0.34 - t * 0.18)],
      scale: [0.55 + t * 0.1, 0.3 + t * 0.1, 1],
      name: 'wing-covert',
    });
    covert.castShadow = false;
    group.add(covert);
  }
  const wingGreen = new THREE.MeshStandardMaterial({ color: new THREE.Color('#4fae63'), roughness: 0.88 });
  const coverA = new THREE.Mesh(SHARED_GEO.sphere, wingGreen);
  coverA.scale.set(0.26, 0.46, 0.12);
  coverA.position.set(side * 0.02, -0.12, 0.03);
  coverA.castShadow = false;
  coverA.receiveShadow = true;
  const coverB = new THREE.Mesh(SHARED_GEO.sphere, wingGreen);
  coverB.scale.set(0.2, 0.3, 0.1);
  coverB.position.set(side * 0.05, 0.06, 0.05);
  coverB.castShadow = false;
  coverB.receiveShadow = true;
  group.add(coverA, coverB);
  group.traverse((node) => {
    if (node.isMesh) node.receiveShadow = true;
  });
  return group;
};

const buildKoala = (materials) => {
  const group = new THREE.Group();
  const body = sphere(materials, 'main', { pos: [0, 1.0, 0], scale: [0.92, 1.0, 0.82], name: 'body' });
  const belly = sphere(materials, 'belly', { pos: [0, 0.98, 0.56], scale: [0.58, 0.66, 0.3], name: 'belly' });
  const legL = sphere(materials, 'main', { pos: [-0.37, 0.28, 0.06], scale: [0.31, 0.27, 0.31], name: 'leg-left' });
  const legR = sphere(materials, 'main', { pos: [0.37, 0.28, 0.06], scale: [0.31, 0.27, 0.31], name: 'leg-right' });
  const padL = sphere(materials, 'blush', { pos: [-0.37, 0.26, 0.32], scale: [0.14, 0.1, 0.04], name: 'pad-left' });
  const padR = sphere(materials, 'blush', { pos: [0.37, 0.26, 0.32], scale: [0.14, 0.1, 0.04], name: 'pad-right' });
  const armL = capsule(0.16, 0.44, materials, 'main', { pos: [-0.95, 1.12, 0.1], rot: [0.1, 0, 0.68], name: 'arm-left' });
  const armR = capsule(0.16, 0.44, materials, 'main', { pos: [0.95, 1.12, 0.1], rot: [0.1, 0, -0.68], name: 'arm-right' });
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.72, -0.7);
  tailPivot.add(sphere(materials, 'main', { pos: [0, 0, -0.06], scale: [0.19, 0.19, 0.18], name: 'tail' }));

  const head = new THREE.Group();
  head.position.set(0, 2.06, 0.02);
  head.name = 'head';
  head.add(sphere(materials, 'main', { scale: [0.84, 0.78, 0.76], name: 'head-mesh' }));

  const makeEar = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.7, 0.34, -0.02);
    pivot.rotation.z = side * 0.18;
    const outer = sphere(materials, 'main', { pos: [0, 0.26, 0], scale: [0.34, 0.4, 0.18], name: `ear-${side < 0 ? 'left' : 'right'}` });
    const inner = sphere(materials, 'belly', { pos: [0, 0.26, 0.12], scale: [0.22, 0.28, 0.06], name: 'inner-ear' });
    pivot.add(outer, inner);
    return pivot;
  };
  const earL = makeEar(-1);
  const earR = makeEar(1);
  const eyeL = sphere(materials, 'eye', { pos: [-0.29, 0.07, 0.66], scale: [0.085, 0.095, 0.07], name: 'eye-left' });
  const eyeR = sphere(materials, 'eye', { pos: [0.29, 0.07, 0.66], scale: [0.085, 0.095, 0.07], name: 'eye-right' });
  const glintL = sphere(materials, 'glint', { pos: [-0.31, 0.11, 0.72], scale: [0.028, 0.028, 0.02], name: 'glint-left' });
  const glintR = sphere(materials, 'glint', { pos: [0.26, 0.11, 0.72], scale: [0.028, 0.028, 0.02], name: 'glint-right' });
  const muzzle = sphere(materials, 'belly', { pos: [0, -0.1, 0.56], scale: [0.42, 0.3, 0.3], name: 'muzzle' });
  const nose = sphere(materials, 'nose', { pos: [0, 0.01, 0.8], scale: [0.24, 0.18, 0.14], name: 'nose' });
  const mouth = torusArc(0.08, 0.016, Math.PI, null, null, {
    pos: [0, -0.22, 0.8], rot: [0, 0, Math.PI], material: materials.nose, name: 'mouth',
  });
  const cheekL = sphere(materials, 'blush', { pos: [-0.5, -0.08, 0.54], scale: [0.15, 0.12, 0.05], name: 'cheek-left' });
  const cheekR = sphere(materials, 'blush', { pos: [0.5, -0.08, 0.54], scale: [0.15, 0.12, 0.05], name: 'cheek-right' });

  head.add(earL, earR, eyeL, eyeR, glintL, glintR, muzzle, nose, mouth, cheekL, cheekR);

  const neck = anchor(group, [0, 1.42, 0.8], 'anchor-neck');
  const hat = anchor(head, [0, 0.58, 0.12], 'anchor-hat');
  const glasses = anchor(head, [0, 0.07, 0.72], 'anchor-glasses');

  group.add(body, belly, legL, legR, padL, padR, armL, armR, tailPivot, head, neck);

  return {
    id: 'koala', group, head, body, belly, ears: [earL, earR], eyes: [eyeL, eyeR],
    glints: [glintL, glintR], tail: tailPivot, feet: [legL, legR], arms: [armL, armR],
    cheeks: [cheekL, cheekR], mouth, anchors: { neck, hat, glasses }, materials,
    base: { belly: belly.scale.clone(), headRotX: 0, headRotZ: 0, tailRot: 0 },
    seed: 13, accessories: {}, blinkSeed: 15, fluffSeed: 23,
  };
};

const buildConure = (materials) => {
  const group = new THREE.Group();
  const green = mat('fixed', '#2f8a50', { roughness: 0.8 });
  const greenDark = mat('fixed', '#1c5c3a', { roughness: 0.85 });
  const blue = mat('fixed', '#2f6fb2', { roughness: 0.8 });
  const beakDark = mat('fixed', '#2b2629', { roughness: 0.45 });
  const body = sphere(materials, 'main', { pos: [0, 1.0, 0], scale: [0.8, 1.0, 0.72], name: 'body' });
  const belly = sphere(materials, 'belly', { pos: [0, 0.98, 0.5], scale: [0.6, 0.74, 0.28], name: 'belly' });
  const mantle = sphere(materials, 'fixed', { pos: [0, 1.18, -0.22], scale: [0.72, 0.8, 0.5], name: 'mantle', material: green });
  const footL = sphere(materials, 'foot', { pos: [-0.28, 0.1, 0.18], scale: [0.2, 0.09, 0.3], name: 'foot-left' });
  const footR = sphere(materials, 'foot', { pos: [0.28, 0.1, 0.18], scale: [0.2, 0.09, 0.3], name: 'foot-right' });

  const head = new THREE.Group();
  head.position.set(0, 2.02, 0.02);
  head.name = 'head';
  head.add(sphere(materials, 'main', { scale: [0.66, 0.62, 0.62], name: 'head-mesh' }));
  const patchL = sphere(materials, 'cream', { pos: [-0.27, 0.06, 0.54], scale: [0.2, 0.17, 0.07], name: 'eye-patch-left' });
  const patchR = sphere(materials, 'cream', { pos: [0.27, 0.06, 0.54], scale: [0.2, 0.17, 0.07], name: 'eye-patch-right' });
  const eyeL = sphere(materials, 'eye', { pos: [-0.27, 0.06, 0.62], scale: [0.075, 0.085, 0.06], name: 'eye-left' });
  const eyeR = sphere(materials, 'eye', { pos: [0.27, 0.06, 0.62], scale: [0.075, 0.085, 0.06], name: 'eye-right' });
  const glintL = sphere(materials, 'glint', { pos: [-0.29, 0.1, 0.68], scale: [0.024, 0.024, 0.018], name: 'glint-left' });
  const glintR = sphere(materials, 'glint', { pos: [0.24, 0.1, 0.68], scale: [0.024, 0.024, 0.018], name: 'glint-right' });
  const cheekL = sphere(materials, 'blush', { pos: [-0.4, -0.1, 0.46], scale: [0.13, 0.11, 0.05], name: 'cheek-left' });
  const cheekR = sphere(materials, 'blush', { pos: [0.4, -0.1, 0.46], scale: [0.13, 0.11, 0.05], name: 'cheek-right' });
  const beak = mesh(SHARED_GEO.cone, beakDark, {
    pos: [0, -0.12, 0.7], rot: [0.15, 0, Math.PI], scale: [0.14, 0.3, 0.13], name: 'beak',
  });
  const mouth = new THREE.Group();

  head.add(patchL, patchR, eyeL, eyeR, glintL, glintR, cheekL, cheekR, beak, mouth);

  const wingL = buildConureWing(-1);
  const wingR = buildConureWing(1);
  group.add(wingL, wingR);

  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.72, -0.32);
  tailPivot.rotation.x = -2.72;
  const tailMat = featherMaterial();
  for (let i = 0; i < 6; i += 1) {
    const t = (i - 2.5) / 2.5;
    const feather = featherMesh(featherGeometry('#2f8a50', '#3b74c8'), tailMat, {
      pos: [t * 0.07, 0.02, -0.02 + Math.abs(t) * 0.02],
      rot: [0, 0, t * 0.16],
      scale: [0.8, 1.5 + (1 - Math.abs(t)) * 0.4, 1],
      name: `tail-feather-${i}`,
    });
    tailPivot.add(feather);
  }
  const tailCovert = featherMesh(featherGeometry('#9cbf3c', '#2f8a50'), tailMat, {
    pos: [0, 0.02, 0.05], rot: [0, 0, 0], scale: [0.7, 0.62, 1], name: 'tail-covert',
  });
  tailPivot.add(tailCovert);
  group.add(tailPivot);
  const tailLow = new THREE.Group();
  tailLow.position.set(0, 0.32, -0.18);
  tailLow.rotation.x = -2.96;
  const tailLowMat = featherMaterial();
  for (let i = 0; i < 3; i += 1) {
    const t = i - 1;
    const tip = featherMesh(featherGeometry('#2f8a50', '#3b74c8'), tailLowMat, {
      pos: [t * 0.07, 0, -0.02 + Math.abs(t) * 0.02],
      rot: [0, 0, t * 0.18],
      scale: [0.55, 0.85 + (1 - Math.abs(t)) * 0.2, 1],
      name: `tail-tip-${i}`,
    });
    tailLow.add(tip);
  }
  group.add(tailLow);
  const rump = sphere(materials, 'fixed', { pos: [0, 0.72, -0.42], scale: [0.3, 0.26, 0.2], name: 'rump', material: blue });
  group.add(rump);

  const neck = anchor(group, [0, 1.5, 0.72], 'anchor-neck');
  const hat = anchor(head, [0, 0.54, 0.08], 'anchor-hat');
  const glasses = anchor(head, [0, 0.06, 0.68], 'anchor-glasses');

  group.add(body, belly, mantle, footL, footR, head, neck);

  return {
    id: 'conure', group, head, body, belly, ears: [wingL, wingR], eyes: [eyeL, eyeR],
    glints: [glintL, glintR], tail: tailPivot, feet: [footL, footR], arms: [wingL, wingR],
    cheeks: [cheekL, cheekR], mouth, anchors: { neck, hat, glasses }, materials,
    base: { belly: belly.scale.clone(), headRotX: 0, headRotZ: 0, tailRot: -2.72 },
    seed: 17, accessories: {}, blinkSeed: 19, fluffSeed: 29, fixedMaterials: { green, greenDark, blue },
  };
};

const buildFold = (materials) => {
  const group = new THREE.Group();
  const body = sphere(materials, 'main', { pos: [0, 0.99, 0], scale: [0.86, 0.94, 0.82], name: 'body' });
  const belly = sphere(materials, 'belly', { pos: [0, 0.97, 0.58], scale: [0.55, 0.62, 0.26], name: 'belly' });
  const legL = capsule(0.13, 0.22, materials, 'main', { pos: [-0.34, 0.22, 0.02], rot: [0.08, 0, 0], name: 'leg-left' });
  const legR = capsule(0.13, 0.22, materials, 'main', { pos: [0.34, 0.22, 0.02], rot: [0.08, 0, 0], name: 'leg-right' });
  const pawL = sphere(materials, 'belly', { pos: [-0.34, 0.11, 0.13], scale: [0.15, 0.1, 0.17], name: 'paw-left' });
  const pawR = sphere(materials, 'belly', { pos: [0.34, 0.11, 0.13], scale: [0.15, 0.1, 0.17], name: 'paw-right' });
  const armL = capsule(0.12, 0.32, materials, 'main', { pos: [-0.84, 1.0, 0.12], rot: [0.2, 0, 0.5], name: 'arm-left' });
  const armR = capsule(0.12, 0.32, materials, 'main', { pos: [0.84, 1.0, 0.12], rot: [0.2, 0, -0.5], name: 'arm-right' });

  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 1.14, -0.6);
  tailPivot.rotation.z = -0.25;
  const tailCurl = torusArc(0.26, 0.1, Math.PI * 1.4, materials, 'main', {
    pos: [0, 0, -0.06], rot: [0.2, Math.PI / 2, 0], name: 'tail',
  });
  const tailTip = sphere(materials, 'belly', { pos: [0.08, 0.2, -0.12], scale: [0.1, 0.1, 0.1], name: 'tail-tip' });
  tailPivot.add(tailCurl, tailTip);

  const head = new THREE.Group();
  head.position.set(0, 2.0, 0.02);
  head.name = 'head';
  head.add(sphere(materials, 'main', { scale: [0.82, 0.74, 0.72], name: 'head-mesh' }));

  const makeEar = (side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.44, 0.52, 0.5);
    pivot.rotation.set(-0.32, 0, side * 0.14);
    const outer = sphere(materials, 'main', { pos: [0, 0, 0], scale: [0.27, 0.2, 0.09], name: `ear-${side < 0 ? 'left' : 'right'}` });
    const inner = sphere(materials, 'inner', { pos: [0, 0, 0.07], scale: [0.18, 0.13, 0.045], name: 'inner-ear' });
    pivot.add(outer, inner);
    return pivot;
  };
  const earL = makeEar(-1);
  const earR = makeEar(1);

  const eyeL = sphere(materials, 'eye', { pos: [-0.28, 0.08, 0.63], scale: [0.1, 0.105, 0.08], name: 'eye-left' });
  const eyeR = sphere(materials, 'eye', { pos: [0.28, 0.08, 0.63], scale: [0.1, 0.105, 0.08], name: 'eye-right' });
  const glintL = sphere(materials, 'glint', { pos: [-0.31, 0.12, 0.7], scale: [0.03, 0.03, 0.02], name: 'glint-left' });
  const glintR = sphere(materials, 'glint', { pos: [0.25, 0.12, 0.7], scale: [0.03, 0.03, 0.02], name: 'glint-right' });
  const muzzle = sphere(materials, 'belly', { pos: [0, -0.13, 0.57], scale: [0.33, 0.24, 0.28], name: 'muzzle' });
  const nose = sphere(materials, 'accent', { pos: [0, -0.03, 0.81], scale: [0.09, 0.065, 0.06], name: 'nose' });
  const mouth = torusArc(0.075, 0.014, Math.PI, null, null, {
    pos: [0, -0.2, 0.82], rot: [0, 0, Math.PI], material: materials.nose, name: 'mouth',
  });
  const cheekL = sphere(materials, 'blush', { pos: [-0.49, -0.08, 0.54], scale: [0.15, 0.11, 0.05], name: 'cheek-left' });
  const cheekR = sphere(materials, 'blush', { pos: [0.49, -0.08, 0.54], scale: [0.15, 0.11, 0.05], name: 'cheek-right' });
  const whiskers = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i += 1) {
      const whisker = mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.44, 5), materials.cream, {
        pos: [side * 0.44, -0.13 - i * 0.035, 0.66],
        rot: [0, side * (-0.3 + i * 0.16), Math.PI / 2 - side * 0.12],
        name: 'whisker',
      });
      whiskers.push(whisker);
    }
  }

  head.add(earL, earR, eyeL, eyeR, glintL, glintR, muzzle, nose, mouth, cheekL, cheekR, ...whiskers);

  const neck = anchor(group, [0, 1.43, 0.76], 'anchor-neck');
  const hat = anchor(head, [0, 0.56, 0.1], 'anchor-hat');
  const glasses = anchor(head, [0, 0.08, 0.7], 'anchor-glasses');

  group.add(body, belly, legL, legR, pawL, pawR, armL, armR, tailPivot, head, neck);

  return {
    id: 'fold', group, head, body, belly, ears: [earL, earR], eyes: [eyeL, eyeR],
    glints: [glintL, glintR], tail: tailPivot, feet: [legL, legR], arms: [armL, armR],
    cheeks: [cheekL, cheekR], mouth, anchors: { neck, hat, glasses }, materials,
    base: { belly: belly.scale.clone(), headRotX: 0, headRotZ: 0, tailRot: 0 },
    seed: 21, accessories: {}, blinkSeed: 23, fluffSeed: 31,
  };
};



const applyPosture = (instance) => {
  const { id, group, body, belly, head, feet, arms, tail } = instance;
  const shift = (dy) => {
    body.position.y += dy;
    belly.position.y += dy;
    head.position.y += dy;
    instance.anchors.neck.position.y += dy;
  };
  const move = (name, x, y, z) => {
    const node = group.getObjectByName(name);
    if (node) node.position.set(x, y, z);
  };
  const base = instance.base;
  base.headRotX = 0;
  base.headRotZ = 0;

  if (id === 'bear') {
    shift(-0.1);
    feet[0].position.set(-0.42, 0.2, 0.36);
    feet[1].position.set(0.42, 0.2, 0.36);
    move('pad-left', -0.42, 0.19, 0.56);
    move('pad-right', 0.42, 0.19, 0.56);
    arms[0].position.set(-0.62, 0.78, 0.42);
    arms[0].rotation.set(1.15, 0, 0.24);
    arms[1].position.set(0.62, 0.78, 0.42);
    arms[1].rotation.set(1.15, 0, -0.24);
    tail.position.y -= 0.08;
    body.rotation.x = -0.03;
    base.headRotX = 0.06;
    base.headRotZ = 0.03;
  } else if (id === 'bunny') {
    group.position.y = 0;
    shift(0.03);
    feet[0].position.set(-0.28, 0.12, 0.1);
    feet[1].position.set(0.28, 0.12, 0.1);
    arms[0].position.set(-0.56, 1.02, 0.3);
    arms[0].rotation.set(0.55, 0, 0.18);
    arms[1].position.set(0.56, 1.02, 0.3);
    arms[1].rotation.set(0.55, 0, -0.18);
    instance.ears.forEach((ear) => { ear.rotation.x = -0.22; });
    base.headRotX = 0.04;
  } else if (id === 'penguin') {
    group.rotation.x = 0.06;
    feet[0].position.set(-0.38, 0.09, 0.22);
    feet[1].position.set(0.38, 0.09, 0.22);
    arms[0].position.z = -0.08;
    arms[1].position.z = -0.08;
    arms[0].rotation.z = 0.34;
    arms[1].rotation.z = -0.34;
    body.rotation.x = 0.03;
    base.headRotX = -0.04;
  } else if (id === 'shiba') {
    shift(-0.11);
    feet[0].position.set(-0.34, 0.2, 0.2);
    feet[1].position.set(0.34, 0.2, 0.2);
    move('paw-left', -0.34, 0.09, 0.34);
    move('paw-right', 0.34, 0.09, 0.34);
    arms[0].position.set(-0.72, 0.72, 0.3);
    arms[0].rotation.set(0.8, 0, 0.3);
    arms[1].position.set(0.72, 0.72, 0.3);
    arms[1].rotation.set(0.8, 0, -0.3);
    body.rotation.x = -0.05;
    base.headRotX = -0.02;
    base.headRotZ = 0.04;
  } else if (id === 'koala') {
    shift(0.01);
    arms[0].position.set(-0.76, 1.44, 0.28);
    arms[0].rotation.set(0.2, 0, 0.78);
    arms[1].position.set(0.76, 1.44, 0.28);
    arms[1].rotation.set(0.2, 0, -0.78);
    feet[0].position.set(-0.42, 0.28, 0.08);
    feet[1].position.set(0.42, 0.28, 0.08);
    move('pad-left', -0.42, 0.26, 0.3);
    move('pad-right', 0.42, 0.26, 0.3);
    body.rotation.z = 0.04;
    base.headRotX = 0.03;
    base.headRotZ = 0.06;
  } else if (id === 'conure') {
    feet[0].position.set(-0.18, 0.1, 0.2);
    feet[1].position.set(0.18, 0.1, 0.2);
    instance.base.liftY = 0;
    group.rotation.x = 0.05;
    tail.rotation.x = -2.95;
    instance.ears[0].rotation.z = 0.1;
    instance.ears[1].rotation.z = -0.1;
    base.headRotX = 0.03;
    base.headRotZ = 0.02;
  } else if (id === 'fold') {
    shift(-0.12);
    feet[0].position.set(-0.3, 0.11, 0.1);
    feet[1].position.set(0.3, 0.11, 0.1);
    feet[0].scale.set(1, 0.55, 1);
    feet[1].scale.set(1, 0.55, 1);
    move('paw-left', -0.28, 0.06, 0.34);
    move('paw-right', 0.28, 0.06, 0.34);
    arms[0].position.set(-0.7, 0.82, 0.12);
    arms[0].rotation.set(0.9, 0, 0.55);
    arms[1].position.set(0.7, 0.82, 0.12);
    arms[1].rotation.set(0.9, 0, -0.55);
    tail.position.set(0.12, 0.95, -0.5);
    body.rotation.x = -0.02;
    base.headRotX = 0.08;
  }
  instance.earBaseX = instance.ears.map((ear) => ear.rotation.x);
};

const applyCutePass = (instance) => {
  instance.head.scale.multiplyScalar(1.08);
  instance.body.scale.x *= 1.03;
  instance.body.scale.z *= 1.03;
  instance.body.userData.baseScale.copy(instance.body.scale);
  for (const eye of instance.eyes) {
    eye.userData.baseScale.multiplyScalar(1.12);
    eye.scale.copy(eye.userData.baseScale);
    const extra = sphere(instance.materials, 'glint', {
      pos: [
        eye.position.x - Math.sign(eye.position.x || 1) * 0.018,
        eye.position.y + 0.03,
        eye.position.z + 0.05,
      ],
      scale: [0.018, 0.018, 0.012],
      name: 'glint-sparkle',
    });
    eye.parent.add(extra);
    instance.glints.push(extra);
  }
  for (const glint of instance.glints) glint.scale.multiplyScalar(1.08);
  for (const cheek of instance.cheeks) {
    cheek.userData.baseScale.multiplyScalar(1.12);
    cheek.scale.copy(cheek.userData.baseScale);
  }
};

const BUILDERS = { bear: buildBear, bunny: buildBunny, penguin: buildPenguin, shiba: buildShiba, koala: buildKoala, conure: buildConure, fold: buildFold };


/* ------------------------------------------------------------ coat system */

const COAT_SCALE = {
  off: { count: 0, length: 0, radius: 0 },
  soft: { count: 0.55, length: 0.82, radius: 0.9 },
  plush: { count: 1, length: 1.12, radius: 1.12 },
  vfx: { count: 1, length: 1.2, radius: 1.05 },
};

const COAT_CONFIG = {
  bear: {
    kind: 'fur',
    zones: [
      { mesh: 'body', role: 'main', count: 460, len: [0.05, 0.11], radius: [0.006, 0.012], minY: -0.45, droop: 0.3, tilt: 0.5 },
      { mesh: 'belly', role: 'belly', count: 150, len: [0.035, 0.08], radius: [0.005, 0.009], minZ: 0.15, droop: 0.15, tilt: 0.4 },
      { mesh: 'head-mesh', role: 'main', count: 230, len: [0.04, 0.09], radius: [0.005, 0.01], minY: -0.05, maxZ: 0.52, droop: 0.12, tilt: 0.5 },
      { mesh: 'ear-left', role: 'main', count: 70, len: [0.04, 0.09], radius: [0.005, 0.01], droop: 0.1, tilt: 0.7 },
      { mesh: 'ear-right', role: 'main', count: 70, len: [0.04, 0.09], radius: [0.005, 0.01], droop: 0.1, tilt: 0.7 },
      { mesh: 'tail', role: 'main', count: 55, len: [0.04, 0.1], radius: [0.005, 0.01], droop: 0.2, tilt: 0.7 },
    ],
  },
  bunny: {
    kind: 'fur',
    zones: [
      { mesh: 'body', role: 'main', count: 420, len: [0.045, 0.1], radius: [0.005, 0.011], minY: -0.4, droop: 0.28, tilt: 0.5 },
      { mesh: 'belly', role: 'belly', count: 140, len: [0.03, 0.07], radius: [0.004, 0.008], minZ: 0.1, droop: 0.12, tilt: 0.4 },
      { mesh: 'head-mesh', role: 'main', count: 200, len: [0.035, 0.08], radius: [0.005, 0.009], minY: -0.05, maxZ: 0.55, droop: 0.1, tilt: 0.5 },
      { mesh: 'ear-left', role: 'main', count: 110, len: [0.08, 0.18], radius: [0.005, 0.01], droop: 0.05, tilt: 0.6, stretch: [1.0, 1.09, 1.0] },
      { mesh: 'ear-right', role: 'main', count: 110, len: [0.08, 0.18], radius: [0.005, 0.01], droop: 0.05, tilt: 0.6, stretch: [1.0, 1.09, 1.0] },
      { mesh: 'tail', role: 'belly', count: 80, len: [0.05, 0.12], radius: [0.006, 0.012], droop: 0.2, tilt: 0.8 },
    ],
  },
  penguin: {
    kind: 'feather',
    zones: [
      { mesh: 'body', role: 'main', count: 300, len: [0.04, 0.09], radius: [0.006, 0.012], minY: -0.35, droop: 0.3, tilt: 0.5 },
      { mesh: 'belly', role: 'belly', count: 200, len: [0.03, 0.07], radius: [0.005, 0.01], minZ: 0.1, droop: 0.15, tilt: 0.4 },
      { mesh: 'head-mesh', role: 'main', count: 160, len: [0.03, 0.07], radius: [0.005, 0.01], minY: 0, maxZ: 0.35, droop: 0.1, tilt: 0.5 },
      { mesh: 'tail', role: 'main', count: 60, len: [0.03, 0.08], radius: [0.005, 0.01], droop: 0.2, tilt: 0.6 },
    ],
  },
  shiba: {
    kind: 'fur',
    zones: [
      { mesh: 'body', role: 'main', count: 520, len: [0.05, 0.12], radius: [0.006, 0.012], minY: -0.4, droop: 0.32, tilt: 0.5 },
      { mesh: 'belly', role: 'belly', count: 160, len: [0.03, 0.08], radius: [0.005, 0.009], minZ: 0.1, droop: 0.15, tilt: 0.4 },
      { mesh: 'head-mesh', role: 'main', count: 250, len: [0.04, 0.1], radius: [0.005, 0.01], minY: -0.02, maxZ: 0.5, droop: 0.12, tilt: 0.5 },
      { mesh: 'cheek-left', role: 'blush', count: 50, len: [0.03, 0.08], radius: [0.004, 0.008], droop: 0.1, tilt: 0.5 },
      { mesh: 'cheek-right', role: 'blush', count: 50, len: [0.03, 0.08], radius: [0.004, 0.008], droop: 0.1, tilt: 0.5 },
      { mesh: 'tail', role: 'main', count: 150, len: [0.05, 0.14], radius: [0.006, 0.012], droop: 0.18, tilt: 0.8 },
    ],
  },
  koala: {
    kind: 'fur',
    zones: [
      { mesh: 'body', role: 'main', count: 1700, len: [0.028, 0.052], radius: [0.004, 0.008], minY: -0.45, droop: 0.35, tilt: 0.55 },
      { mesh: 'belly', role: 'belly', count: 420, len: [0.015, 0.03], radius: [0.0035, 0.007], minZ: 0.1, droop: 0.18, tilt: 0.45 },
      { mesh: 'head-mesh', role: 'main', count: 1000, len: [0.024, 0.045], radius: [0.0045, 0.009], minY: -0.02, maxZ: 0.5, droop: 0.15, tilt: 0.55 },
      { mesh: 'ear-left', role: 'main', count: 320, len: [0.03, 0.055], radius: [0.004, 0.008], maxZ: 0.25, droop: 0.05, tilt: 0.8, stretch: [1.02, 1.12, 1.02] },
      { mesh: 'ear-right', role: 'main', count: 320, len: [0.03, 0.055], radius: [0.004, 0.008], maxZ: 0.25, droop: 0.05, tilt: 0.8, stretch: [1.02, 1.12, 1.02] },
      { mesh: 'tail', role: 'main', count: 140, len: [0.02, 0.04], radius: [0.0035, 0.007], droop: 0.2, tilt: 0.8 },
    ],
  },
  conure: {
    kind: 'feather',
    zones: [
      { mesh: 'body', role: 'main', count: 280, len: [0.05, 0.11], radius: [0.008, 0.015], minY: -0.35, maxZ: 0.2, droop: 0.25, tilt: 0.45 },
      { mesh: 'belly', role: 'belly', count: 240, len: [0.04, 0.09], radius: [0.007, 0.014], minZ: 0.1, droop: 0.16, tilt: 0.4 },
      { mesh: 'head-mesh', role: 'main', count: 200, len: [0.035, 0.08], radius: [0.006, 0.012], minY: 0, maxZ: 0.45, droop: 0.1, tilt: 0.45 },
    ],
  },
  fold: {
    kind: 'fur',
    zones: [
      { mesh: 'body', role: 'main', count: 620, len: [0.07, 0.16], radius: [0.006, 0.014], minY: -0.4, droop: 0.3, tilt: 0.5 },
      { mesh: 'belly', role: 'belly', count: 220, len: [0.04, 0.1], radius: [0.005, 0.011], minZ: 0.1, droop: 0.16, tilt: 0.4 },
      { mesh: 'head-mesh', role: 'main', count: 380, len: [0.06, 0.14], radius: [0.006, 0.012], minY: 0, maxZ: 0.48, droop: 0.12, tilt: 0.55 },
      { mesh: 'cheek-left', role: 'belly', count: 120, len: [0.08, 0.16], radius: [0.005, 0.011], droop: 0.08, tilt: 0.6 },
      { mesh: 'cheek-right', role: 'belly', count: 120, len: [0.08, 0.16], radius: [0.005, 0.011], droop: 0.08, tilt: 0.6 },
      { mesh: 'tail', role: 'main', count: 120, len: [0.05, 0.13], radius: [0.006, 0.012], droop: 0.15, tilt: 0.8 },
    ],
  },
};

const mulberry32 = (seed) => {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const makeShellAlphaTexture = (kind, seed) => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  let value = seed;
  const rand = () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
  const drawFibre = (x, y, length, lean, width, alpha) => {
    const gradient = ctx.createLinearGradient(x, y, x + lean, y - length);
    gradient.addColorStop(0, `rgba(255,255,255,${alpha * 0.35})`);
    gradient.addColorStop(0.3, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(0.86, `rgba(255,255,255,${alpha * 0.72})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + lean * 0.45, y - length * 0.62, x + lean, y - length);
    ctx.stroke();
  };
  if (kind === 'feather') {
    for (let row = 0; row < 22; row += 1) {
      for (let col = 0; col < 18; col += 1) {
        const x = col * 29 + (row % 2) * 14 + rand() * 6;
        const y = row * 24 + rand() * 6;
        ctx.strokeStyle = `rgba(255,255,255,${0.45 + rand() * 0.45})`;
        ctx.lineWidth = 1.4 + rand() * 1.1;
        ctx.beginPath();
        ctx.arc(x, y, 10 + rand() * 5, Math.PI * 0.12, Math.PI * 0.88);
        ctx.stroke();
      }
    }
  } else {
    const long = kind === 'fur-long';
    for (let i = 0; i < 36000; i += 1) {
      const x = rand() * size;
      const y = rand() * size;
      const length = long ? 3 + rand() * 7 : 2 + rand() * 5;
      const lean = (rand() - 0.5) * (long ? 5 : 3);
      drawFibre(x, y, length, lean, 0.35 + rand() * 0.55, 0.24 + rand() * 0.4);
    }
    for (let i = 0; i < 2400; i += 1) {
      const x = rand() * size;
      const y = rand() * size;
      const length = long ? 10 + rand() * 14 : 7 + rand() * 10;
      const lean = (rand() - 0.5) * 8;
      drawFibre(x, y, length, lean, 0.5 + rand() * 0.45, 0.55 + rand() * 0.4);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
};
const makeBumpTexture = (kind, seed) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);
  let value = seed;
  const rand = () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
  if (kind === 'fur-long') {
    for (let i = 0; i < 1900; i += 1) {
      const x = rand() * 256;
      const y = rand() * 256;
      const length = 14 + rand() * 26;
      const slant = (rand() - 0.5) * 0.7;
      const gradient = ctx.createLinearGradient(x, y, x + slant * length, y - length);
      gradient.addColorStop(0, 'rgba(255,255,255,0.25)');
      gradient.addColorStop(0.3, `rgba(255,255,255,${0.65 + rand() * 0.35})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0.04)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 0.9 + rand() * 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + slant * length * 0.5, y - length * 0.6, x + slant * length, y - length);
      ctx.stroke();
    }
  } else if (kind === 'feather') {
    for (let row = 0; row < 26; row += 1) {
      for (let col = 0; col < 20; col += 1) {
        ctx.strokeStyle = rand() > 0.5 ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(col * 13 + (row % 2) * 6, row * 10, 5, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      }
    }
  } else {
    for (let i = 0; i < 2200; i += 1) {
      const x = rand() * 256;
      const y = rand() * 256;
      const length = 6 + rand() * 10;
      ctx.strokeStyle = rand() > 0.5 ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rand() - 0.5) * 4, y - length);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
};

const BUMP_TEX = { fur: makeBumpTexture('fur', 11), feather: makeBumpTexture('feather', 29) };

const makeCoatPattern = (kind, seed) => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#d6d6d6';
  ctx.fillRect(0, 0, size, size);
  let value = seed;
  const rand = () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
  if (kind === 'feather') {
    for (let row = 0; row < 52; row += 1) {
      for (let col = 0; col < 42; col += 1) {
        const light = rand() > 0.4;
        ctx.strokeStyle = light ? `rgba(255,255,255,${0.08 + rand() * 0.14})` : `rgba(20,20,30,${0.04 + rand() * 0.08})`;
        ctx.lineWidth = 1 + rand() * 1.2;
        ctx.beginPath();
        ctx.arc(col * 12 + (row % 2) * 6, row * 10, 5 + rand() * 3, Math.PI * 0.12, Math.PI * 0.88);
        ctx.stroke();
      }
    }
  } else {
    // Fine directional grain. The shells already carry the silhouette; this
    // map is what makes the front read as fibre instead of velvet.
    for (let i = 0; i < 42000; i += 1) {
      const x = rand() * size;
      const y = rand() * size;
      const length = 2 + rand() * 6;
      const lean = (rand() - 0.5) * 2.4;
      const light = rand() > 0.46;
      ctx.strokeStyle = light
        ? `rgba(255,255,255,${0.06 + rand() * 0.15})`
        : `rgba(10,12,18,${0.03 + rand() * 0.09})`;
      ctx.lineWidth = 0.45 + rand() * 0.65;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + lean * 0.5, y - length * 0.6, x + lean, y - length);
      ctx.stroke();
    }
    for (let i = 0; i < 3800; i += 1) {
      const x = rand() * size;
      const y = rand() * size;
      const length = 8 + rand() * 12;
      const lean = (rand() - 0.5) * 6;
      const light = rand() > 0.5;
      ctx.strokeStyle = light
        ? `rgba(255,255,255,${0.08 + rand() * 0.16})`
        : `rgba(10,12,18,${0.04 + rand() * 0.08})`;
      ctx.lineWidth = 0.6 + rand() * 0.65;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + lean * 0.5, y - length * 0.6, x + lean, y - length);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};
const COAT_PATTERN = { fur: makeCoatPattern('fur', 7), feather: makeCoatPattern('feather', 13) };

const KOALA_HAIR_TEX = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);
  let seed = 4241;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < 14000; i += 1) {
    const x = rand() * 512;
    const y = rand() * 512;
    const length = 9 + rand() * 22;
    const lean = (rand() - 0.5) * 8;
    ctx.strokeStyle = `rgba(255,255,255,${0.45 + rand() * 0.55})`;
    ctx.lineWidth = 0.6 + rand() * 1.1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + lean * 0.5, y - length * 0.6, x + lean, y - length);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
})();

const makeFeatherAlphaTexture = (seed) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);
  let value = seed;
  const rand = () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
  for (let row = 0; row < 18; row += 1) {
    for (let col = 0; col < 14; col += 1) {
      const x = col * 19 + (row % 2) * 9 + rand() * 4;
      const y = row * 15 + rand() * 4;
      ctx.strokeStyle = `rgba(255,255,255,${0.5 + rand() * 0.5})`;
      ctx.lineWidth = 1.4 + rand() * 1.2;
      ctx.beginPath();
      ctx.arc(x, y, 5 + rand() * 5, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
};

const SHELL_TEX = {
  fur: [makeShellAlphaTexture('fur', 17), makeShellAlphaTexture('fur', 43), makeShellAlphaTexture('fur', 79)],
  feather: [makeFeatherAlphaTexture(31), makeFeatherAlphaTexture(67)],
  furLong: [makeShellAlphaTexture('fur-long', 101), makeShellAlphaTexture('fur-long', 137)],
};

const updateShellWind = (instance = rig) => {
  if (!instance?.coatZones?.length || !fanHead) return;
  const head = new THREE.Vector3();
  fanHead.getWorldPosition(head);
  const dir = new THREE.Vector3(0, 1.3, 0).sub(head).normalize();
  const q = new THREE.Quaternion();
  const touch = WIND.touch.value;
  for (const zone of instance.coatZones) {
    zone.mesh.getWorldQuaternion(q);
    q.invert();
    zone.windLocal.value.copy(dir).applyQuaternion(q).normalize();
    if (WIND.touch.value.x < 900) {
      zone.touchLocal.value.copy(zone.mesh.worldToLocal(touch.clone()));
    } else {
      zone.touchLocal.value.set(999, 999, 999);
    }
  }
};

const disposeCoat = (instance) => {
  if (!instance?.fluff) return;
  for (const mesh of instance.fluff) {
    if (mesh.parent) mesh.parent.remove(mesh);
    if (mesh.material) {
      if (mesh.material.userData.fluff && mesh.material.alphaMap) mesh.material.alphaMap.dispose();
      mesh.material.dispose();
    }
    if (mesh.geometry && !mesh.geometry.userData.shared) mesh.geometry.dispose();
    mesh.dispose?.();
  }
  instance.fluff = [];
  instance.fluffCount = 0;
  instance.fluffMaterials = new Map();
};

const strandRoleColor = (instance, role) => {
  const materials = instance.materials;
  const map = {
    main: materials.main,
    belly: materials.belly,
    blush: materials.blush,
    inner: materials.inner,
    accent: materials.accent,
    cream: materials.cream,
  };
  return map[role]?.color ?? materials.main.color;
};

const WIND = {
  time: { value: 0 },
  speed: { value: state.fur.breeze },
  touch: { value: new THREE.Vector3(999, 999, 999) },
};

const coatMaterial = (kind, color, layer, shells, cutCode, texture, windLocal, touchLocal) => {
  const common = {
    color: new THREE.Color(color),
    alphaMap: texture,
    bumpMap: BUMP_TEX[kind],
    metalness: 0,
    side: THREE.FrontSide,
  };
  const material = kind === 'feather'
    ? new THREE.MeshStandardMaterial({
      ...common,
      bumpScale: 0.008,
      alphaTest: 0.42 + (layer / Math.max(1, shells - 1)) * 0.12,
      roughness: 0.82,
    })
    : new THREE.MeshPhysicalMaterial({
      ...common,
      map: COAT_PATTERN.fur,
      bumpScale: 0.09,
      alphaTest: 0.34 + (layer / Math.max(1, shells - 1)) * 0.2,
      roughness: 0.94,
      sheen: 0.6,
      sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.45),
      sheenRoughness: 0.8,
    });
  material.userData.fluff = true;
  material.userData.layer = layer;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = WIND.time;
    shader.uniforms.uWindSpeed = WIND.speed;
    shader.uniforms.uWindLocal = windLocal;
    shader.uniforms.uTouchLocal = touchLocal;
    shader.uniforms.uFurLayer = { value: layer / Math.max(1, shells - 1) };
    const windGain = kind === 'feather' ? 0.008 : 0.025;
    shader.vertexShader = `uniform float uWindTime;
uniform float uWindSpeed;
uniform float uFurLayer;
uniform vec3 uWindLocal;
uniform vec3 uTouchLocal;
varying vec3 vFurPos;
${shader.vertexShader}`.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      vFurPos = position;
      float furH = uFurLayer;
      float gust = 0.6 + 0.4 * sin(uWindTime * 2.1 + position.y * 4.0 + position.x * 3.0);
      transformed += uWindLocal * uWindSpeed * pow(furH, 1.6) * ${windGain.toFixed(4)} * gust;
      float bend = uWindSpeed * pow(furH, 1.6) * ${windGain.toFixed(4)};
      transformed -= normal * bend * bend * 0.8;
      vec3 toTouch = transformed - uTouchLocal;
      float touchDist = length(toTouch);
      transformed += normalize(toTouch + vec3(0.0001)) * smoothstep(0.4, 0.03, touchDist) * 0.16 * furH * furH;
      `,
    );
    if (cutCode) {
      shader.fragmentShader = `varying vec3 vFurPos;
${shader.fragmentShader.replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>\n${cutCode}`,
      )}`;
    } else {
      shader.fragmentShader = `varying vec3 vFurPos;
${shader.fragmentShader}`;
    }
  };
  material.customProgramCacheKey = () => `fur-shell-${kind}-${cutCode ? cutCode.length : 0}-${layer}`;
  return material;
};

const addCoatZone = (instance, zone, level, rand) => {
  if (instance.id === 'koala' && level === 'vfx') return 0;
  const mesh = instance.group.getObjectByName(zone.mesh);
  if (!mesh || !mesh.isMesh) return 0;
  const config = COAT_CONFIG[instance.id];
  const usesFeather = config?.kind === 'feather';
  const plush = level === 'plush';
  const koala = instance.id === 'koala';
  const shells = plush ? (koala ? 12 : usesFeather ? 8 : 10) : (koala ? 6 : usesFeather ? 4 : 5);
  const thickness = (zone.thickness || (usesFeather ? 0.045 : koala ? 0.08 : 0.09)) * (plush ? 1 : 0.58);
  const textureSet = SHELL_TEX[usesFeather ? 'feather' : 'fur'];
  const cutCode = zone.mesh === 'head-mesh' ? 'if (vFurPos.z > 0.58) discard;' :
    zone.mesh === 'body' ? 'if (vFurPos.z > 0.2 && length(vec2(vFurPos.x / 0.78, (vFurPos.y + 0.05) / 0.8)) < 1.0) discard;' :
    zone.mesh.startsWith('ear-') ? 'if (vFurPos.z > 0.35) discard;' : '';
  const baseColor = strandRoleColor(instance, zone.role);
  const windLocal = { value: new THREE.Vector3(-1, 0.2, -0.5).normalize() };
  const touchLocal = { value: new THREE.Vector3(999, 999, 999) };
  instance.coatZones.push({ mesh, windLocal, touchLocal });
  for (let layer = 0; layer < shells; layer += 1) {
    const texture = textureSet[layer % textureSet.length].clone();
    if (koala) {
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
    }
    texture.needsUpdate = true;
    texture.offset.set(rand() * 0.6, rand() * 0.6);
    texture.rotation = rand() * Math.PI * 2;
    texture.center.set(0.5, 0.5);
    texture.repeat.set(usesFeather ? 1 : 1.3, usesFeather ? 1 : 1.3);
    const material = coatMaterial(usesFeather ? 'feather' : 'fur', baseColor, layer, shells, cutCode, texture, windLocal, touchLocal);
    material.userData.role = zone.role;
    const shell = new THREE.Mesh(mesh.geometry, material);
    shell.position.copy(mesh.position);
    shell.quaternion.copy(mesh.quaternion);
    const scale = 1.004 + ((layer + 1) / shells) * thickness;
    shell.scale.copy(mesh.scale).multiplyScalar(scale);
    if (zone.stretch) shell.scale.multiply(new THREE.Vector3(zone.stretch[0], zone.stretch[1], zone.stretch[2]));
    shell.name = `coat-${zone.mesh}-${layer}`;
    shell.userData.shellLayer = layer;
    shell.userData.shellCount = shells;
    shell.castShadow = false;
    shell.receiveShadow = false;
    shell.renderOrder = 1;
    mesh.parent.add(shell);
    instance.fluff.push(shell);
    const roleMaterials = instance.fluffMaterials.get(zone.role) || [];
    roleMaterials.push(material);
    instance.fluffMaterials.set(zone.role, roleMaterials);
  }
  return shells * 180;
};


/* ---------------------------------------------------------- strand fur pass */

const STRAND_UNIFORMS = {
  uTime: { value: 0 },
  uBreeze: { value: state.fur.breeze },
  uLength: { value: state.fur.length },
  uCurl: { value: state.fur.curl },
  uClump: { value: state.fur.clump },
  uCursor: { value: new THREE.Vector3(999, 999, 999) },
};

const makeStrandGeometry = () => {
  const rows = 6;
  const positions = [];
  const colors = [];
  const indices = [];
  for (let row = 0; row < rows; row += 1) {
    const t = row / (rows - 1);
    const width = (1 - t) ** 0.72 * 0.5 + 0.012;
    const z = t * t * 0.2 + Math.sin(t * Math.PI) * 0.035;
    // Dark root, bright middle, slightly warm tip. The gradient is the fibre's
    // own occlusion; it reads as depth even when the body behind it is smooth.
    const shadeValue = 0.5 + t * 0.42 + Math.sin(t * Math.PI) * 0.08;
    positions.push(-width, t, z, width, t, z);
    colors.push(shadeValue, shadeValue, shadeValue, shadeValue, shadeValue, shadeValue);
    if (row < rows - 1) {
      const a = row * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.userData.shared = true;
  return geo;
};

const STRAND_GEO = makeStrandGeometry();

const TUFT_GEO = (() => {
  const geo = new THREE.ConeGeometry(0.5, 1, 4, 3, true);
  geo.translate(0, 0.5, 0);
  const position = geo.attributes.position;
  const colors = [];
  for (let i = 0; i < position.count; i += 1) {
    const y = position.getY(i);
    const value = 0.55 + y * 0.7;
    colors.push(value, value, value);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.userData.shared = true;
  return geo;
})();

const strandMaterial = (color, opaque = false) => {
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    vertexColors: true,
    side: THREE.DoubleSide,
    transparent: false,
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, STRAND_UNIFORMS);
    shader.vertexShader = `uniform float uTime;
uniform float uBreeze;
uniform float uLength;
uniform float uCurl;
uniform float uClump;
uniform vec3 uCursor;
${shader.vertexShader}`.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      float strandH = clamp(transformed.y, 0.0, 1.0);
      vec3 strandRoot = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      float strandPhase = strandRoot.x * 8.0 + strandRoot.z * 6.0 + strandRoot.y * 4.0;
      transformed.y *= uLength;
      float wind = sin(uTime * 1.4 + strandPhase * 0.55) * 0.68 + sin(uTime * 0.63 + strandPhase * 0.27 + 1.7) * 0.32;
      transformed.x += wind * uBreeze * strandH * strandH * 0.052;
      transformed.z += cos(uTime * 1.05 + strandPhase * 0.5) * uBreeze * strandH * strandH * 0.028;
      transformed.x += sin(strandH * 5.2 + strandPhase) * uCurl * strandH * 0.018;
      transformed.z += cos(strandH * 5.2 + strandPhase * 0.8) * uCurl * strandH * 0.012;
      transformed.x += sin(strandPhase * 0.45) * uClump * strandH * strandH * 0.014;
      vec2 cursorDelta = strandRoot.xz - uCursor.xz;
      float cursorPush = smoothstep(1.35, 0.0, length(cursorDelta)) * 0.09;
      transformed.xz += normalize(cursorDelta + vec2(0.00001)) * cursorPush * strandH * strandH;
      `,
    );
  };
  material.customProgramCacheKey = () => 'strand-fur-basic-wind';
  return material;
};


/* ---------------------------------------------------------- VFX strand groom */

const makeVfxStrandGeometry = () => {
  const rows = 7;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let row = 0; row < rows; row += 1) {
    const t = row / (rows - 1);
    const width = (1 - t) ** 0.68 * 0.5 + 0.01;
    const z = t * t * 0.18 + Math.sin(t * Math.PI) * 0.04;
    positions.push(-width, t, z, width, t, z);
    uvs.push(0, t, 1, t);
    if (row < rows - 1) {
      const a = row * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.userData.shared = true;
  return geometry;
};

const VFX_STRAND_GEO = makeVfxStrandGeometry();

const vfxStrandMaterial = (color, bellyColor = color) => new THREE.ShaderMaterial({
  uniforms: {
    uTime: STRAND_UNIFORMS.uTime,
    uBreeze: STRAND_UNIFORMS.uBreeze,
    uLength: STRAND_UNIFORMS.uLength,
    uCurl: STRAND_UNIFORMS.uCurl,
    uClump: STRAND_UNIFORMS.uClump,
    uCursor: STRAND_UNIFORMS.uCursor,
    uColor: { value: new THREE.Color(color) },
    uBelly: { value: new THREE.Color(bellyColor) },
    uBellyTip: { value: new THREE.Color(bellyColor).lerp(new THREE.Color('#ffffff'), 0.08) },
    uTip: { value: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.1) },
    uKey: { value: new THREE.Vector3(3.4, 6.4, 4.6).normalize() },
    uFill: { value: new THREE.Vector3(-4.5, 3, 2).normalize() },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uBreeze;
    uniform float uLength;
    uniform float uCurl;
    uniform float uClump;
    uniform vec3 uCursor;
    attribute vec3 aNormal;
    attribute float aSeed;
    attribute float aTint;
    attribute float aRole;
    varying vec3 vWorld;
    varying vec3 vTangent;
    varying vec3 vNormalW;
    varying vec2 vUv;
    varying float vTint;
    varying float vRole;
    void main() {
      vec3 transformed = position;
      float h = clamp(uv.y, 0.0, 1.0);
      transformed.y *= uLength;
      float phase = aSeed * 6.2831853;
      float gust = sin(uTime * 1.35 + phase * 1.7) * 0.62 + sin(uTime * 0.61 + phase * 0.83 + 1.7) * 0.38;
      transformed.x += gust * uBreeze * h * h * 0.042;
      transformed.z += cos(uTime * 0.94 + phase) * uBreeze * h * h * 0.022;
      transformed.x += sin(h * 5.4 + phase) * uCurl * h * 0.013;
      transformed.z += cos(h * 5.4 + phase * 0.8) * uCurl * h * 0.009;
      transformed.x += sin(aSeed * 21.0) * uClump * h * h * 0.012;
      vec4 local = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        local = instanceMatrix * local;
      #endif
      vec4 world = modelMatrix * local;
      vWorld = world.xyz;
      mat3 im = mat3(instanceMatrix);
      vTangent = normalize(mat3(modelMatrix) * im * vec3(0.0, 1.0, 0.0));
      vNormalW = normalize(mat3(modelMatrix) * im * aNormal);
      vUv = uv;
      vTint = aTint;
      vRole = aRole;
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uBelly;
    uniform vec3 uBellyTip;
    uniform vec3 uTip;
    uniform vec3 uKey;
    uniform vec3 uFill;
    varying vec3 vWorld;
    varying vec3 vTangent;
    varying vec3 vNormalW;
    varying vec2 vUv;
    varying float vTint;
    varying float vRole;
    void main() {
      vec3 T = normalize(vTangent);
      vec3 N = normalize(vNormalW);
      vec3 V = normalize(cameraPosition - vWorld);
      vec3 L = normalize(uKey);
      vec3 H = normalize(L + V);
      float TH = clamp(dot(T, H), -1.0, 1.0);
      float sinTH = sqrt(max(0.0, 1.0 - TH * TH));
      // Kajiya-Kay: two shifted specular lobes along the fibre.
      float spec = pow(sinTH, 86.0) * 0.72 + pow(sinTH, 15.0) * 0.16;
      float diff = 0.28 + 0.72 * max(dot(N, L), 0.0);
      float fill = max(dot(N, normalize(uFill)), 0.0) * 0.22;
      vec3 tipColor = mix(uTip, uBellyTip, vRole);
      vec3 base = mix(mix(uColor, uBelly, vRole), tipColor, smoothstep(0.0, 0.86, vUv.y));
      base *= 0.72 + 0.42 * vTint;
      float ao = mix(0.28, 1.0, pow(vUv.y, 0.55));
      float rim = pow(1.0 - max(dot(N, V), 0.0), 2.2) * 0.07;
      vec3 col = base * (diff + fill) * ao + vec3(1.0, 0.94, 0.84) * spec + rim * base;
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
  side: THREE.DoubleSide,
  transparent: false,
  depthWrite: true,
  depthTest: true,
  toneMapped: true,
});

const sampleVfxRoots = (mesh, zone, target, rand) => {
  const points = [];
  const normals = [];
  const attempts = Math.ceil(target * 24);
  let i = 0;
  while (i < attempts && points.length < target) {
    i += 1;
    const u = rand() * 2 - 1;
    const radius = Math.sqrt(Math.max(0, 1 - u * u));
    const theta = rand() * Math.PI * 2;
    const dir = new THREE.Vector3(radius * Math.cos(theta), u, radius * Math.sin(theta));
    if (zone.minY !== undefined && dir.y < zone.minY) continue;
    if (zone.maxY !== undefined && dir.y > zone.maxY) continue;
    if (zone.minZ !== undefined && dir.z < zone.minZ) continue;
    if (zone.maxZ !== undefined && dir.z > zone.maxZ) continue;
    if (zone.skipBelly && dir.z > 0.4 && (dir.x / 0.6) ** 2 + ((dir.y + 0.03) / 0.6) ** 2 < 1) continue;
    if (zone.skipFace && dir.z > 0.56 && Math.abs(dir.x) < 0.42 && dir.y > -0.32 && dir.y < 0.24) continue;
    const point = new THREE.Vector3(
      dir.x * mesh.scale.x * 1.2,
      dir.y * mesh.scale.y * 1.2,
      dir.z * mesh.scale.z * 1.2,
    ).applyQuaternion(mesh.quaternion).add(mesh.position);
    const normal = new THREE.Vector3(
      dir.x / Math.max(0.001, mesh.scale.x ** 2),
      dir.y / Math.max(0.001, mesh.scale.y ** 2),
      dir.z / Math.max(0.001, mesh.scale.z ** 2),
    ).applyQuaternion(mesh.quaternion).normalize();
    points.push(point.addScaledVector(normal, 0.006));
    normals.push(normal);
  }
  return { points, normals };
};

const buildVfxKoala = (instance, level) => {
  disposeStrands(instance);
  const budget = level === 'vfx' ? (window.innerWidth < 800 ? 80000 : 190000) : 90000;
  const zones = [
    { mesh: 'body', role: 'main', weight: 48, len: [0.04, 0.08], radius: [0.004, 0.007], minY: -0.45, skipBelly: true },
    { mesh: 'belly', role: 'belly', weight: 12, len: [0.028, 0.052], radius: [0.0038, 0.0065], minZ: 0.1 },
    { mesh: 'head-mesh', role: 'main', weight: 21, len: [0.035, 0.07], radius: [0.0032, 0.006], skipFace: true },
    { mesh: 'ear-left', role: 'main', weight: 6, len: [0.055, 0.11], radius: [0.0038, 0.0068], maxZ: 0.25 },
    { mesh: 'ear-right', role: 'main', weight: 6, len: [0.055, 0.11], radius: [0.0038, 0.0068], maxZ: 0.25 },
    { mesh: 'tail', role: 'main', weight: 2, len: [0.018, 0.035], radius: [0.003, 0.0052] },
  ];
  const totalWeight = zones.reduce((sum, zone) => sum + zone.weight, 0);
  const rand = mulberry32((instance.fluffSeed || 23) * 503);
  instance.strandMeshes = [];
  instance.strandMaterials = new Map();
  instance.vfxUndercoat = [];
  let total = 0;
  for (const zone of zones) {
    const mesh = instance.group.getObjectByName(zone.mesh);
    if (!mesh || !mesh.isMesh) continue;
    const underColor = strandRoleColor(instance, zone.role).clone().multiplyScalar(zone.role === 'belly' ? 0.96 : 0.62);
    const under = new THREE.Mesh(
      mesh.geometry,
      new THREE.MeshStandardMaterial({ color: underColor, roughness: 1, metalness: 0 }),
    );
    under.name = `vfx-undercoat-${zone.mesh}`;
    under.position.copy(mesh.position);
    under.quaternion.copy(mesh.quaternion);
    under.scale.copy(mesh.scale).multiplyScalar(1.004);
    under.castShadow = false;
    under.receiveShadow = false;
    under.userData.shellLayer = 0;
    under.userData.shellCount = 1;
    mesh.parent.add(under);
    instance.fluff.push(under);
    instance.vfxUndercoat.push(under);
    const underMats = instance.fluffMaterials.get(zone.role) || [];
    underMats.push(under.material);
    instance.fluffMaterials.set(zone.role, underMats);
    const target = Math.max(1, Math.round((budget * zone.weight) / totalWeight));
    const { points, normals } = sampleVfxRoots(mesh, zone, target, rand);
    if (!points.length) continue;
    const baseColor = strandRoleColor(instance, zone.role);
    const material = vfxStrandMaterial(baseColor, strandRoleColor(instance, 'belly'));
    const geometry = VFX_STRAND_GEO.clone();
    geometry.userData.shared = false;
    const normalsAttr = new THREE.InstancedBufferAttribute(new Float32Array(points.length * 3), 3);
    const seedsAttr = new THREE.InstancedBufferAttribute(new Float32Array(points.length), 1);
    const tintsAttr = new THREE.InstancedBufferAttribute(new Float32Array(points.length), 1);
    const rolesAttr = new THREE.InstancedBufferAttribute(new Float32Array(points.length), 1);
    const inst = new THREE.InstancedMesh(geometry, material, points.length);
    inst.name = `vfx-${zone.mesh}`;
    inst.frustumCulled = false;
    inst.castShadow = false;
    inst.receiveShadow = false;
    inst.renderOrder = 4;
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    for (let i = 0; i < points.length; i += 1) {
      const n = normals[i];
      normalsAttr.setXYZ(i, n.x, n.y, n.z);
      seedsAttr.setX(i, rand());
      tintsAttr.setX(i, rand());
      const p = points[i];
      const nx = (p.x - mesh.position.x) / mesh.scale.x;
      const ny = (p.y - mesh.position.y) / mesh.scale.y;
      const nz = (p.z - mesh.position.z) / mesh.scale.z;
      const belly = zone.role === 'belly';
      rolesAttr.setX(i, belly ? 1 : 0);
      const tangent = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
      tangent.addScaledVector(n, -tangent.dot(n));
      if (tangent.lengthSq() < 1e-6) tangent.set(1, 0, 0);
      tangent.normalize();
      const flow = new THREE.Vector3(
        Math.sin(points[i].y * 2.6 + points[i].z * 3.1) * 0.26,
        -1,
        Math.cos(points[i].x * 2.3 + points[i].z * 2.7) * 0.2,
      );
      flow.addScaledVector(n, -flow.dot(n));
      if (flow.lengthSq() < 1e-6) flow.set(0, -1, 0);
      flow.normalize();
      const out = n.clone().multiplyScalar(0.3)
        .addScaledVector(flow, 0.68)
        .addScaledVector(tangent, 0.12 + (rand() - 0.5) * 0.08)
        .normalize();
      const sideAxis = new THREE.Vector3().crossVectors(n, out);
      if (sideAxis.lengthSq() < 1e-5) sideAxis.set(1, 0, 0).cross(out);
      sideAxis.normalize();
      const faceAxis = new THREE.Vector3().crossVectors(sideAxis, out).normalize();
      quat.setFromRotationMatrix(new THREE.Matrix4().makeBasis(sideAxis, out, faceAxis));
      quat.multiply(new THREE.Quaternion().setFromAxisAngle(out, (rand() - 0.5) * 0.2));
      const length = zone.len[0] + rand() * (zone.len[1] - zone.len[0]);
      const width = zone.radius[0] + rand() * (zone.radius[1] - zone.radius[0]);
      matrix.compose(points[i], quat, new THREE.Vector3(width * 2.4, length, width * 2.4));
      inst.setMatrixAt(i, matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    geometry.setAttribute('aNormal', normalsAttr);
    geometry.setAttribute('aSeed', seedsAttr);
    geometry.setAttribute('aTint', tintsAttr);
    geometry.setAttribute('aRole', rolesAttr);
    inst.userData.baseCount = points.length;
    mesh.parent.add(inst);
    instance.strandMeshes.push(inst);
    const materials = instance.strandMaterials.get(zone.role) || [];
    materials.push(material);
    instance.strandMaterials.set(zone.role, materials);
    total += points.length;
  }
  instance.strandCount = total;
  applyStrandDensity(instance);
  updateFurUniforms();
  return total;
};

const disposeStrands = (instance) => {
  if (instance?.vfxUndercoat) {
    for (const mesh of instance.vfxUndercoat) {
      if (mesh.parent) mesh.parent.remove(mesh);
      mesh.material?.dispose();
    }
    instance.vfxUndercoat = [];
  }
  if (!instance?.strandMeshes) return;
  for (const mesh of instance.strandMeshes) {
    if (mesh.parent) mesh.parent.remove(mesh);
    mesh.material?.dispose();
    if (mesh.geometry && !mesh.geometry.userData.shared) mesh.geometry.dispose();
    mesh.dispose?.();
  }
  instance.strandMeshes = [];
  instance.strandCount = 0;
  instance.strandMaterials = new Map();
};

const sampleStrandRoots = (mesh, zone, target, rand, skipBelly = false) => {
  const surfaceScale = 1.28;
  const points = [];
  const normals = [];
  let attempts = 0;
  while (points.length < target && attempts < target * 35) {
    attempts += 1;
    const u = rand() * 2 - 1;
    const theta = rand() * Math.PI * 2;
    const radius = Math.sqrt(Math.max(0, 1 - u * u));
    const dir = new THREE.Vector3(radius * Math.cos(theta), u, radius * Math.sin(theta));
    if (zone.minY !== undefined && dir.y < zone.minY) continue;
    if (zone.maxY !== undefined && dir.y > zone.maxY) continue;
    if (zone.minZ !== undefined && dir.z < zone.minZ) continue;
    if (zone.maxZ !== undefined && dir.z > zone.maxZ) continue;
    if (skipBelly && dir.z > 0.35 && Math.abs(dir.x) < 0.6 && dir.y > -0.35) continue;
    const point = new THREE.Vector3(dir.x * mesh.scale.x * surfaceScale, dir.y * mesh.scale.y * surfaceScale, dir.z * mesh.scale.z * surfaceScale)
      .applyQuaternion(mesh.quaternion)
      .add(mesh.position);
    const normal = new THREE.Vector3(
      dir.x / Math.max(0.001, mesh.scale.x ** 2),
      dir.y / Math.max(0.001, mesh.scale.y ** 2),
      dir.z / Math.max(0.001, mesh.scale.z ** 2),
    ).applyQuaternion(mesh.quaternion).normalize();
    points.push(point.addScaledVector(normal, 0.012));
    normals.push(normal);
  }
  return { points, normals };
};

const buildStrands = (instance, level) => {
  if (!instance || instance.id !== 'koala') return 0;
  if (level === 'vfx') return buildVfxKoala(instance, level);
  if (level === 'off') {
    disposeStrands(instance);
    return 0;
  }
  const config = COAT_CONFIG[instance.id];
  if (!config) return 0;
  disposeStrands(instance);
  const koala = instance.id === 'koala';
  const maxStrands = level === 'plush' ? (instance.id === 'koala' ? 100000 : 60000) : 45000;
  const totalWeight = config.zones.reduce((sum, zone) => sum + zone.count, 0) || 1;
  const rand = mulberry32((instance.fluffSeed || 11) * 131 + 7);
  instance.strandMeshes = [];
  instance.strandMaterials = new Map();
  let total = 0;
  for (const zone of config.zones) {
    const mesh = instance.group.getObjectByName(zone.mesh);
    if (!mesh || !mesh.isMesh) continue;
    const target = Math.max(1, Math.round((maxStrands * zone.count) / totalWeight));
    const { points, normals } = sampleStrandRoots(
      mesh, zone, target, rand,
      zone.mesh === 'body',
    );
    if (!points.length) continue;
    const material = strandMaterial(
      koala
        ? strandRoleColor(instance, zone.role).clone().lerp(new THREE.Color('#ffffff'), 0.05)
        : strandRoleColor(instance, zone.role).clone().lerp(new THREE.Color('#ffffff'), 0.16),
      true,
    );
    const geometry = STRAND_GEO.clone();
    geometry.userData.shared = false;
    const inst = new THREE.InstancedMesh(geometry, material, points.length);
    inst.name = `strands-${zone.mesh}`;
    inst.castShadow = false;
    inst.receiveShadow = false;
    inst.frustumCulled = false;
    inst.renderOrder = 3;
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    for (let i = 0; i < points.length; i += 1) {
      const n = normals[i];
      const tangent = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
      tangent.addScaledVector(n, -tangent.dot(n));
      if (tangent.lengthSq() < 1e-6) tangent.set(1, 0, 0);
      tangent.normalize();
      // A groomed coat flows down and slightly out, with a gentle swirl.
      // Random tangential hair reads as static fuzz; a shared flow reads as fur.
      const flow = new THREE.Vector3(
        Math.sin(points[i].y * 2.3 + points[i].z * 2.8) * 0.24,
        -1,
        Math.cos(points[i].x * 2.1 + points[i].z * 3.2) * 0.18,
      );
      // Keep the flow tangent to the body. A world-space down vector with a
      // swirl can point into the torso on the front, burying every strand.
      flow.addScaledVector(n, -flow.dot(n));
      if (flow.lengthSq() < 1e-6) flow.set(0, -1, 0);
      flow.normalize();
      const out = n.clone().multiplyScalar(0.3)
        .addScaledVector(flow, 0.7)
        .addScaledVector(tangent, 0.1 + (rand() - 0.5) * 0.06)
        .normalize();
      const sideAxis = new THREE.Vector3().crossVectors(n, out);
      if (sideAxis.lengthSq() < 1e-5) sideAxis.set(1, 0, 0).cross(out);
      sideAxis.normalize();
      const faceAxis = new THREE.Vector3().crossVectors(sideAxis, out).normalize();
      quat.setFromRotationMatrix(new THREE.Matrix4().makeBasis(sideAxis, out, faceAxis));
      quat.multiply(new THREE.Quaternion().setFromAxisAngle(out, (rand() - 0.5) * 0.18));
      const length = (zone.len[0] + rand() * (zone.len[1] - zone.len[0])) * (koala ? 1 : 0.45);
      const width = zone.radius[0] + rand() * (zone.radius[1] - zone.radius[0]);
      const widthScale = koala ? 2 : 1.6;
      matrix.compose(points[i], quat, new THREE.Vector3(width * widthScale, length, width * widthScale));
      inst.setMatrixAt(i, matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.userData.baseCount = points.length;
    mesh.parent.add(inst);
    instance.strandMeshes.push(inst);
    const materials = instance.strandMaterials.get(zone.role) || [];
    materials.push(material);
    instance.strandMaterials.set(zone.role, materials);
    total += points.length;
  }
  instance.strandCount = total;
  applyStrandDensity(instance);
  updateFurUniforms();
  return total;
};

const applyStrandDensity = (instance = rig) => {
  if (!instance) return;
  if (instance.fluff) {
    for (const shell of instance.fluff) {
      const layer = shell.userData.shellLayer;
      const shells = shell.userData.shellCount;
      if (layer === undefined || !shells) continue;
      const visibleLayers = Math.max(2, Math.round(shells * (0.55 + 0.45 * state.fur.density)));
      shell.visible = layer < visibleLayers;
    }
  }
  if (!instance.strandMeshes) return;
  let total = 0;
  for (const mesh of instance.strandMeshes) {
    const base = mesh.userData.baseCount || 0;
    const count = Math.max(1, Math.round(base * state.fur.density));
    mesh.count = count;
    total += count;
  }
  instance.strandCount = total;
  applySpriteDensity(instance);
  if (instance === rig) syncCoatButtons();
};

const updateFurUniforms = () => {
  STRAND_UNIFORMS.uBreeze.value = state.fur.breeze;
  STRAND_UNIFORMS.uLength.value = state.fur.length;
  STRAND_UNIFORMS.uCurl.value = state.fur.curl;
  STRAND_UNIFORMS.uClump.value = state.fur.clump;
  WIND.speed.value = state.fur.breeze;
  if (rig?.spriteMaterials) {
    for (const material of rig.spriteMaterials) material.size = 0.12 * state.fur.length;
  }
};

const refreshStrandColors = (instance) => {
  if (!instance?.strandMaterials) return;
  for (const [role, materials] of instance.strandMaterials.entries()) {
    const color = strandRoleColor(instance, role).clone().lerp(new THREE.Color('#ffffff'), 0.32);
    for (const material of materials) {
      if (material.uniforms?.uColor) {
        material.uniforms.uColor.value.copy(strandRoleColor(instance, role));
        material.uniforms.uTip.value.copy(strandRoleColor(instance, role)).lerp(new THREE.Color('#ffffff'), 0.12);
        if (material.uniforms.uBelly) material.uniforms.uBelly.value.copy(strandRoleColor(instance, 'belly'));
      } else {
        material.color.copy(color);
      }
    }
  }
};

const addKoalaTufts = (instance, level) => {
  if (instance.id !== 'koala') return 0;
  const zones = [
    { mesh: 'ear-left', count: 90, len: [0.18, 0.32], radius: [0.006, 0.011] },
    { mesh: 'ear-right', count: 90, len: [0.18, 0.32], radius: [0.006, 0.011] },
    { mesh: 'head-mesh', count: 100, len: [0.12, 0.24], radius: [0.006, 0.011], minY: 0.05, maxZ: 0.45 },
    { mesh: 'body', count: 130, len: [0.12, 0.26], radius: [0.006, 0.012], minY: -0.2, skipBelly: true },
  ];
  const rand = mulberry32((instance.fluffSeed || 23) * 211);
  let total = 0;
  for (const zone of zones) {
    const mesh = instance.group.getObjectByName(zone.mesh);
    if (!mesh || !mesh.isMesh) continue;
    const target = Math.round(zone.count * (level === 'plush' ? 1 : 0.5));
    const { points, normals } = sampleStrandRoots(mesh, zone, target, rand, Boolean(zone.skipBelly));
    if (!points.length) continue;
    const material = new THREE.MeshStandardMaterial({
      color: strandRoleColor(instance, 'main').clone().lerp(new THREE.Color('#ffffff'), 0.18),
      vertexColors: true,
      roughness: 0.95,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    material.userData.fluff = true;
    const inst = new THREE.InstancedMesh(TUFT_GEO, material, points.length);
    inst.name = `tuft-${zone.mesh}`;
    inst.frustumCulled = false;
    inst.renderOrder = 3;
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < points.length; i += 1) {
      const n = normals[i];
      const tangent = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
      tangent.addScaledVector(n, -tangent.dot(n));
      if (tangent.lengthSq() < 1e-6) tangent.set(1, 0, 0);
      tangent.normalize();
      const out = n.clone().multiplyScalar(0.9).addScaledVector(tangent, 0.28).addScaledVector(new THREE.Vector3(0, -1, 0), 0.08 + rand() * 0.2).normalize();
      quat.setFromUnitVectors(up, out);
      const length = zone.len[0] + rand() * (zone.len[1] - zone.len[0]);
      const radius = zone.radius[0] + rand() * (zone.radius[1] - zone.radius[0]);
      matrix.compose(points[i], quat, new THREE.Vector3(radius, length, radius));
      inst.setMatrixAt(i, matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    mesh.parent.add(inst);
    instance.fluff.push(inst);
    const materials = instance.fluffMaterials.get('main') || [];
    materials.push(material);
    instance.fluffMaterials.set('main', materials);
    total += points.length;
  }
  return total;
};


/* ------------------------------------------------------- koala fur sprites */

const makeHairSpriteTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  let seed = 7123;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < 5; i += 1) {
    const x = 28 + i * 16 + rand() * 4;
    const lean = (rand() - 0.5) * 18;
    const top = 6 + rand() * 12;
    const gradient = ctx.createLinearGradient(0, 128, 0, top);
    gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(0.15, 'rgba(255,255,255,0.95)');
    gradient.addColorStop(0.8, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3.5 + rand() * 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, 126);
    ctx.quadraticCurveTo(x + lean * 0.4, 72, x + lean, top);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const HAIR_SPRITE_TEX = makeHairSpriteTexture();

const disposeSpriteFur = (instance) => {
  if (!instance?.spriteClouds) return;
  for (const points of instance.spriteClouds) {
    if (points.parent) points.parent.remove(points);
    points.material?.dispose();
    points.geometry?.dispose();
  }
  instance.spriteClouds = [];
  instance.spriteMaterials = [];
};

const buildKoalaSprites = (instance, level) => {
  if (instance.id !== 'koala') return 0;
  disposeSpriteFur(instance);
  if (level === 'off') return 0;
  const countScale = level === 'plush' ? 1 : 0.5;
  const zones = [
    { mesh: 'body', role: 'main', count: 7000, len: [0.1, 0.24], radius: [0.005, 0.01], minY: -0.35 },
    { mesh: 'belly', role: 'belly', count: 2600, len: [0.07, 0.16], radius: [0.004, 0.008], minZ: 0.1 },
    { mesh: 'head-mesh', role: 'main', count: 4200, len: [0.08, 0.2], radius: [0.005, 0.01], minY: 0.02, maxZ: 0.55 },
    { mesh: 'ear-left', role: 'main', count: 1800, len: [0.14, 0.3], radius: [0.005, 0.01] },
    { mesh: 'ear-right', role: 'main', count: 1800, len: [0.14, 0.3], radius: [0.005, 0.01] },
    { mesh: 'tail', role: 'main', count: 500, len: [0.06, 0.14], radius: [0.004, 0.008] },
  ];
  const rand = mulberry32((instance.fluffSeed || 23) * 307);
  instance.spriteClouds = [];
  instance.spriteMaterials = [];
  let total = 0;
  for (const zone of zones) {
    const mesh = instance.group.getObjectByName(zone.mesh);
    if (!mesh || !mesh.isMesh) continue;
    const target = Math.max(1, Math.round(zone.count * countScale));
    const { points } = sampleStrandRoots(mesh, zone, target, rand, false);
    if (!points.length) continue;
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);
    const baseColor = strandRoleColor(instance, zone.role);
    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
      const c = baseColor.clone().offsetHSL(0, 0, (rand() - 0.5) * 0.12);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 0.12,
      map: HAIR_SPRITE_TEX,
      transparent: true,
      alphaTest: 0.12,
      depthWrite: false,
      vertexColors: true,
      sizeAttenuation: true,
    });
    material.userData.spriteFur = true;
    const cloud = new THREE.Points(geometry, material);
    cloud.name = `sprite-${zone.mesh}`;
    cloud.frustumCulled = false;
    mesh.parent.add(cloud);
    instance.spriteClouds.push(cloud);
    instance.spriteMaterials.push(material);
    total += points.length;
  }
  return total;
};

const applySpriteDensity = (instance = rig) => {
  if (!instance?.spriteClouds) return;
  for (const cloud of instance.spriteClouds) {
    const base = cloud.geometry.getAttribute('position').count;
    const count = Math.max(1, Math.round(base * state.fur.density));
    cloud.geometry.setDrawRange(0, count);
  }
};


const applyCoat = (instance, level) => {
  if (!instance) return 0;
  const next = sanitizeCoat(level);
  const effective = next === 'vfx' && instance.id !== 'koala' ? 'plush' : next;
  if (instance.coatLevel === effective && instance.fluff?.length) return instance.fluffCount;
  disposeCoat(instance);
  disposeSpriteFur(instance);
  instance.coatLevel = effective;
  if (effective === 'off') {
    instance.fluffCount = 0;
    instance.strandCount = 0;
    disposeStrands(instance);
    disposeSpriteFur(instance);
    return 0;
  }
  const config = COAT_CONFIG[instance.id];
  if (!config) return 0;
  const rand = mulberry32((instance.fluffSeed || 11) * 97);
  let count = 0;
  for (const zone of config.zones) count += addCoatZone(instance, zone, effective, rand);
  instance.fluffCount = count;
  buildStrands(instance, effective);
  return count;
};

const refreshCoatColors = (instance) => {
  if (!instance?.fluffMaterials) return;
  const white = new THREE.Color('#ffffff');
  for (const [role, materials] of instance.fluffMaterials.entries()) {
    const color = strandRoleColor(instance, role);
    for (const material of materials) {
      const layer = material.userData.layer || 0;
      if (instance.id === 'koala') {
        material.color.copy(color).multiplyScalar(0.62 + layer * 0.026).lerp(white, Math.min(0.08, layer * 0.006));
      } else {
        material.color.copy(color).multiplyScalar(0.94 + layer * 0.007).lerp(white, Math.min(0.04, layer * 0.004));
      }
    }
  }
};

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
      if (material.userData.fluff && material.alphaMap) material.alphaMap.dispose();
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
  applyCutePass(instance);
  applyPosture(instance);
  instance.earBases = instance.ears.map((ear) => ear.rotation.z);
  instance.fluff = [];
  instance.coatZones = [];
  instance.fluffMaterials = new Map();
  instance.strandMeshes = [];
  instance.strandMaterials = new Map();
  instance.strandCount = 0;
  instance.feet.forEach((foot) => { foot.userData.baseY = foot.position.y; });
  applyCoat(instance, sanitizeCoat(state.coat));
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
  refreshCoatColors(instance);
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
  const emoji = ANIMAL_EMOJI[state.animal];
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
  syncCoatButtons();
  syncFurSliders();
  syncLightingButtons();
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
  const select = $('#animal-select');
  if (select) select.value = state.animal;
  const emoji = $('#select-emoji');
  if (emoji) emoji.textContent = ANIMAL_EMOJI[state.animal];
};

const syncExpressionButtons = () => {
  for (const button of $$('[data-expr]')) {
    const active = button.dataset.expr === state.expression;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  }
};

const LIGHTING_CONFIG = {
  studio: {
    hemiSky: '#fff4ea', hemiGround: '#cabfe8', hemi: 2.35,
    key: '#fff0df', keyIntensity: 3.1, fill: '#ded4ff', fillIntensity: 1.15,
    rim: '#ffffff', rimIntensity: 1.35, exposure: 1.04,
    pedestal: '#f2e4e8', pedestalVisible: true, desk: false, clouds: false,
  },
  sky: {
    hemiSky: '#eaf7ff', hemiGround: '#d7d0ff', hemi: 2.7,
    key: '#fff8ec', keyIntensity: 2.8, fill: '#cfe6ff', fillIntensity: 1.5,
    rim: '#ffffff', rimIntensity: 1.5, exposure: 1.08,
    pedestal: '#e9f4ff', pedestalVisible: true, desk: false, clouds: true,
  },
  desk: {
    hemiSky: '#fff1d9', hemiGround: '#c9a98e', hemi: 2.1,
    key: '#ffe2b8', keyIntensity: 3.5, fill: '#ffd6bd', fillIntensity: 1.0,
    rim: '#fff6e6', rimIntensity: 1.15, exposure: 1.06,
    pedestal: '#f2e4e8', pedestalVisible: false, desk: true, clouds: false,
  },
};

let currentLighting = 'studio';

const applyLighting = (name) => {
  const config = LIGHTING_CONFIG[sanitizeLighting(name)];
  currentLighting = sanitizeLighting(name);
  hemi.color.set(config.hemiSky);
  hemi.groundColor.set(config.hemiGround);
  hemi.intensity = config.hemi;
  keyLight.color.set(config.key);
  keyLight.intensity = config.keyIntensity;
  fillLight.color.set(config.fill);
  fillLight.intensity = config.fillIntensity;
  rimLight.color.set(config.rim);
  rimLight.intensity = config.rimIntensity;
  renderer.toneMappingExposure = config.exposure;
  pedestal.material.color.set(config.pedestal);
  pedestal.visible = config.pedestalVisible;
  pedestalRim.visible = config.pedestalVisible;
  deskGroup.visible = config.desk;
  cloudGroup.visible = config.clouds;
  document.body.dataset.lighting = currentLighting;
};

const syncLightingButtons = () => {
  for (const button of $$('[data-lighting]')) {
    const active = button.dataset.lighting === state.lighting;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  }
};

const furValueText = (key, value) => {
  if (key === 'length') return `${Number(value).toFixed(2)}×`;
  return `${Math.round(Number(value) * 100)}%`;
};

const syncFurSliders = () => {
  for (const input of $$('[data-fur]')) {
    const key = input.dataset.fur;
    const value = state.fur[key];
    input.value = String(value);
    const output = $(`#fur-${key}-value`);
    if (output) output.textContent = furValueText(key, value);
  }
};

const setFur = (key, value, { quiet = true } = {}) => {
  if (!(key in state.fur)) return;
  const next = sanitizeFur({ ...state.fur, [key]: value });
  state.fur = next;
  syncFurSliders();
  if (typeof updateFurUniforms === 'function') updateFurUniforms();
  if (key === 'density' && typeof applyStrandDensity === 'function') applyStrandDensity();
  persistState();
  if (!quiet) audio.play('pop');
};

const setLighting = (name, { quiet = false } = {}) => {
  if (!LIGHTING_PRESETS.includes(name)) return;
  state.lighting = name;
  applyLighting(name);
  syncLightingButtons();
  persistState();
  audio.play('chime');
  if (!quiet) toast(t('toast.lighting', { name: t(`scene.${name}`) }), '💡');
};

const syncCoatButtons = () => {
  for (const button of $$('[data-coat]')) {
    const active = button.dataset.coat === state.coat;
    const koalaOnly = button.dataset.coat === 'vfx';
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
    button.disabled = koalaOnly && state.animal !== 'koala';
    if (koalaOnly) button.title = state.animal === 'koala' ? 'High-density VFX groom' : 'VFX groom is koala-only';
  }
  const count = $('#coat-strand-count');
  if (count) {
    const n = ((rig?.fluffCount || 0) + (rig?.strandCount || 0)).toLocaleString(state.lang === 'th' ? 'th-TH' : 'en-US');
    count.textContent = t('coat.strands', { n });
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
  perchGroup.visible = id === 'conure';
  syncColorInputs(colors);
  syncAnimalButtons();
  syncCoatButtons();
  updatePetCard();
  updateMeshCount();
  if (window.__cute3d) window.__cute3d.rig = rig;
  updateShellWind(rig);
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

const setCoat = (level, { quiet = false } = {}) => {
  if (!COAT_LEVELS.includes(level) || !rig) return;
  if (level === 'vfx' && state.animal !== 'koala') return;
  state.coat = level;
  applyCoat(rig, level);
  applyColors(rig, state.colors[state.animal]);
  syncCoatButtons();
  persistState();
  audio.play('pop');
  if (!quiet) toast(t('toast.coat', { name: t(`coat.${level}`) }), '🧶');
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
const cursorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const cursorPoint = new THREE.Vector3();
const fanPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.04);
const fanPoint = new THREE.Vector3();
let pointerDown = null;
let draggingFan = false;

const pointerNdc = (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
};

renderer.domElement.addEventListener('pointermove', (event) => {
  pointerNdc(event);
  if (draggingFan) {
    if (raycaster.ray.intersectPlane(fanPlane, fanPoint)) {
      const radius = Math.min(2.2, Math.max(1.5, Math.hypot(fanPoint.x, fanPoint.z)));
      const angle = Math.atan2(fanPoint.z, fanPoint.x);
      fanGroup.position.set(Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius);
      updateFanPose(angle, { persist: true });
      updateShellWind();
    }
    return;
  }
  if (raycaster.ray.intersectPlane(cursorPlane, cursorPoint)) {
    STRAND_UNIFORMS.uCursor.value.copy(cursorPoint);
  }
});

renderer.domElement.addEventListener('pointerleave', () => {
  STRAND_UNIFORMS.uCursor.value.set(999, 999, 999);
});

renderer.domElement.addEventListener('pointerdown', (event) => {
  pointerNdc(event);
  if (raycaster.intersectObject(fanGroup, true).length) {
    draggingFan = true;
    controls.enabled = false;
    pointerDown = null;
    renderer.domElement.setPointerCapture?.(event.pointerId);
    return;
  }
  pointerDown = { x: event.clientX, y: event.clientY, at: performance.now() };
});

renderer.domElement.addEventListener('pointerup', (event) => {
  if (draggingFan) {
    draggingFan = false;
    controls.enabled = true;
    pointerDown = null;
    renderer.domElement.releasePointerCapture?.(event.pointerId);
    return;
  }
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
    coat: state.coat,
    lighting: state.lighting,
    fur: { ...state.fur },
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
  state.coat = sanitizeCoat(preset.coat);
  state.lighting = sanitizeLighting(preset.lighting);
  state.fur = sanitizeFur(preset.fur);
  setAnimal(preset.animal, { quiet: true });
  applyLighting(state.lighting);
  updateFanPose(state.fanAngle);
  syncLightingButtons();
  syncFurSliders();
  applyCoat(rig, state.coat);
  syncCoatButtons();
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
  const studioProps = [pedestal, pedestalRim, propGroup, sparkles, cloudGroup, deskGroup, perchGroup, fanGroup];
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
    coat: state.coat,
    lighting: state.lighting,
    fur: state.fur,
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
$('#animal-select')?.addEventListener('change', (event) => setAnimal(event.target.value));
on('[data-expr]', 'click', (event) => setExpression(event.currentTarget.dataset.expr));
on('[data-coat]', 'click', (event) => setCoat(event.currentTarget.dataset.coat));
on('[data-lighting]', 'click', (event) => setLighting(event.currentTarget.dataset.lighting));
for (const input of $$('[data-fur]')) {
  input.addEventListener('input', (event) => setFur(event.target.dataset.fur, Number(event.target.value)));
  input.addEventListener('change', () => {
    persistState();
    audio.play('pop');
  });
}
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
  if (event.key.toLowerCase() === 'c') {
    const index = COAT_LEVELS.indexOf(state.coat);
    setCoat(COAT_LEVELS[(index + 1) % COAT_LEVELS.length]);
  }
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

  STRAND_UNIFORMS.uTime.value = elapsed;
  WIND.time.value = elapsed;
  if (rig?.coatZones?.length) updateShellWind(rig);

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

    rig.group.position.y = (rig.base.liftY || 0) + bob + jump;
    rig.feet.forEach((foot) => {
      foot.position.y = foot.userData.baseY - (react.active ? 0 : bob);
    });
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
    rig.head.rotation.z = (rig.base.headRotZ || 0) + pose.headTilt + tiltWave;
    rig.head.rotation.x = (rig.base.headRotX || 0) + pose.headNod + Math.sin(elapsed * 0.9) * 0.012;

    rig.ears.forEach((ear, index) => {
      const dir = index === 0 ? -1 : 1;
      const base = rig.earBases?.[index] ?? (index === 0 ? -0.16 : 0.16);
      const wiggle = Math.sin(elapsed * (2.3 + pose.tailSpeed * 0.18) + index * 1.4) * pose.earAmp;
      ear.rotation.z = base + dir * wiggle + (index === 0 ? pose.earLift * 0.5 : -pose.earLift * 0.5);
      ear.rotation.x = (rig.earBaseX?.[index] ?? -0.04) + Math.sin(elapsed * 1.7 + index) * 0.02;
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
  if (fanBlades) fanBlades.rotation.z += dt * (2 + state.fur.breeze * 26);
  if (cloudGroup.visible) {
    cloudGroup.children.forEach((cluster, index) => {
      const baseX = cluster.userData.baseX ?? 0;
      const baseY = cluster.userData.baseY ?? 0;
      cluster.position.x = baseX + Math.sin(elapsed * 0.12 + index * 1.7) * 0.18;
      cluster.position.y = baseY + Math.sin(elapsed * 0.18 + index) * 0.07;
    });
  }

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
  await check('All seven animal builders', () =>
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
      animal: 'shiba', expression: 'curious', lang: 'th', coat: 'plush',
      colors: { main: '#112233', belly: '#445566', blush: '#778899' },
      accessories: { bowtie: true, partyHat: false, glasses: true },
    });
    const decoded = decodeShareState(encoded);
    return decoded.animal === 'shiba' && decoded.expression === 'curious' && decoded.lang === 'th' &&
      decoded.coat === 'plush' && decoded.colors.main === '#112233' &&
      decoded.accessories.bowtie && decoded.accessories.glasses;
  });
  await check('Snapshot filename is safe', () => /^cute3d-[a-z]+-\d{4}-\d{2}-\d{2}\.png$/.test(snapshotFilename('bear', new Date('2026-11-04T12:00:00Z'))));
  await check('Coat builds shells, koala strands, and smooth clears both', () => {
    const bear = buildAnimal('bear', DEFAULT_COLORS.bear);
    const plush = applyCoat(bear, 'plush');
    const shells = bear.fluff.length > 2 && plush > 300 && bear.strandMeshes.length === 0;
    applyCoat(bear, 'off');
    const cleared = bear.fluff.length === 0 && bear.fluffCount === 0 && bear.strandMeshes.length === 0;
    disposeRig(bear);
    const koala = buildAnimal('koala', DEFAULT_COLORS.koala);
    applyCoat(koala, 'plush');
    const strands = koala.strandMeshes.length > 2 && koala.strandCount > 10000;
    applyCoat(koala, 'vfx');
    const vfx = koala.strandMeshes.length >= 4 && koala.strandCount > 50000;
    disposeRig(koala);
    return shells && cleared && strands && vfx;
  });
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
  state.coat = shared.coat;
  state.lighting = shared.lighting;
  state.fur = shared.fur;
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
  perchGroup.visible = state.animal === 'conure';
  syncColorInputs(state.colors[state.animal]);
  syncAnimalButtons();
  syncExpressionButtons();
  syncAccessoryButtons();
  syncCoatButtons();
  syncFurSliders();
  applyLighting(state.lighting);
  updateFanPose(state.fanAngle);
  syncLightingButtons();
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
    version: '1.5.1',
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
    setCoat: (level) => setCoat(level, { quiet: true }),
    setFanAngle: (angle) => updateFanPose(angle, { persist: true }),
    fanPosition: () => fanGroup.position.toArray(),
    setFur: (key, value) => setFur(key, value),
    setLighting: (name) => setLighting(name, { quiet: true }),
    strandCount: () => (rig ? (rig.fluffCount || 0) + (rig.strandCount || 0) : 0),
    furStrands: () => rig?.strandCount || 0,
    furUniforms: () => ({
      breeze: STRAND_UNIFORMS.uBreeze.value,
      cursor: STRAND_UNIFORMS.uCursor.value.toArray(),
    }),
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
