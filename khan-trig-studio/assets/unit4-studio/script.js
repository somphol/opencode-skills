/* ==========================================================================
   Khan Trig Companion · Unit 4 Equations & Identities Studio
   Vanilla ES6. No dependencies, no network, no build step.

   Colour contract:
     coral  #ff5722 -> sine / side a
     cyan   #00e5ff -> cosine / side b
     violet #b388ff -> tangent
     emerald #00e676 -> the value 1 / inverse
     yellow #ffd600 -> angles
   ========================================================================== */
(() => {
  'use strict';

  const STORAGE_KEY = 'khanTrigUnit4.v1';
  const STATE_VERSION = 1;
  const PI = Math.PI;
  const TAU = PI * 2;
  const STEP = PI / 12;
  const COLORS = { sin: '#ff5722', cos: '#00e5ff', tan: '#b388ff', one: '#00e676', theta: '#ffd600' };
  const FONT = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Thonburi", "Noto Sans Thai", sans-serif';
  const MATH = '"Iowan Old Style", Palatino, Georgia, "Times New Roman", serif';
  const $ = (id) => document.getElementById(id);
  const rad = (d) => (d * PI) / 180;
  const deg = (r) => (r * 180) / PI;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const L = (en, th) => (state.lang === 'th' ? th : en);
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------- i18n ---------------------------------- */
  const I18N = {
    en: {
      appTitle: 'Khan Trig Companion',
      unitLabel: 'Unit 4',
      appSubtitle: 'Equations & Identities Studio',
      streak: 'Streak',
      best: 'Best',
      mastery: 'Mastery',
      export: 'Export Progress JSON',
      exportTitle: 'Download your saved progress',
      exportDone: 'Progress exported as khan_trig_unit4_progress.json',
      navInverse: 'Inverse Functions',
      navIdentity: 'Identity Lab',
      navSolver: 'Equation Solver',
      footerBuilt: 'Built for active learning',
      degrees: 'Degrees',
      radians: 'Radians',
      exact: 'Exact',

      'i.title': 'Inverse Functions & Restricted Domains',
      'i.desc': 'A periodic curve is not one-to-one. Restrict the domain to a principal branch, mirror it across y = x, and a single inverse angle appears.',
      'i.goal': 'Goal: why arcsin, arccos and arctan need restrictions',
      'i.legendCurve': 'Original curve',
      'i.legendBranch': 'Restricted branch',
      'i.legendInverse': 'Inverse curve',
      'i.legendPoint': 'Active point',
      'i.hint': 'Drag the point on the branch · sliders give the same control',
      'i.domainMin': 'Domain start',
      'i.domainMax': 'Domain end',
      'i.input': 'Inverse input x',
      'i.branch': 'Principal branch',
      'i.principalDomain': 'Principal domain',
      'i.principalRange': 'Principal range',
      'i.yourDomain': 'Your domain',
      'i.result': 'Inverse result',
      'i.valid': 'valid',
      'i.invalid': 'not one-to-one',
      'i.inRange': 'in domain',
      'i.outRange': 'outside range',
      'i.outBranch': 'outside branch',
      'i.noteValid': 'One-to-one on the selected domain, so the inverse is a function.',
      'i.noteInvalid': 'This domain includes more than one monotonic piece. Narrow it to a principal branch.',
      'i.noteOutRange': 'The input is outside the range of the original function, so the inverse is undefined.',
      'i.noteOutBranch': 'The input has a valid angle, but that angle lies outside your restricted branch.',
      'i.undefined': 'undefined at this input',

      'p.title': 'Pythagorean Identities & Simplification Lab',
      'p.desc': 'Choose an expression, then build the simplification one legal substitution at a time. The area model shows why the identity is true.',
      'p.goal': "Goal: transform, don't guess",
      'p.current': 'Current expression',
      'p.reset': 'Reset expression',
      'p.why': 'Why it works',
      'p.correct': 'Correct substitution.',
      'p.wrong': 'That substitution does not follow from an identity. Try again.',
      'p.done': 'Simplified completely.',
      'p.stepOf': 'Step',

      'q.title': 'Khan Practice Sandbox & Equation Solver',
      'q.desc': 'Solve equations on [0, 2π), factor quadratic forms, and verify identities. The circle reveals every valid intersection.',
      'q.goal': 'Goal: all solutions, not just one',
      'q.modeBasic': 'Basic Equations',
      'q.modeQuadratic': 'Quadratic Form',
      'q.modeIdentity': 'Identity Proofs',
      'q.new': 'New problem',
      'q.answerLabel': 'Your answer',
      'q.placeholder': 'e.g. π/6, 5π/6',
      'q.check': 'Check Answer',
      'q.answerHint': 'Use radians: π/6, 5π/6 or decimals. Separate solutions with commas.',
      'q.showSteps': 'Show Step-by-Step Visual Solution',
      'q.hideSteps': 'Hide the visual solution',
      'q.progress': 'Your progress',
      'q.correct': 'Correct',
      'q.masteryHint': '15 correct answers unlock Unit 4 mastery.',
      'q.badges': 'Mastery badges',
      'q.circle': 'Unit circle solutions',
      'q.model': 'Identity area model',
      'q.correctMsg': 'Correct!',
      'q.wrongMsg': 'Not quite — reveal the steps or try a new problem.',
      'q.invalid': 'Enter at least one angle, e.g. π/6, 5π/6.',
      'q.badgeUnlocked': 'Badge unlocked',
      'q.tagBasic': 'BASIC EQUATION',
      'q.tagQuadratic': 'QUADRATIC FORM',
      'q.tagIdentity': 'IDENTITY PROOF',
      'q.solvePrompt': 'Solve on the interval [0, 2π).',
      'q.solveInstruction': 'Separate every solution with a comma. π or decimals are accepted.',
      'q.identityPrompt': 'Simplify the expression completely.',
      'q.identityInstruction': 'Choose the equivalent expression.',
      'q.step': 'Step',
      'q.of': 'of',
      'q.reveal': 'Press the steps button to reveal the intersections.',
      'q.solutions': 'solutions',

      'badge.first': 'First Identity',
      'badge.streak3': 'On a Roll · 3',
      'badge.streak5': 'Unstoppable · 5',
      'badge.basic3': 'Angle Hunter',
      'badge.quadratic3': 'Factor Finder',
      'badge.identity3': 'Identity Architect',
      'badge.master': 'Unit 4 Master'
    },
    th: {
      appTitle: 'คู่มือตรีโกณมิติ Khan',
      unitLabel: 'ยูนิต 4',
      appSubtitle: 'ห้องปฏิบัติการสมการและเอกลักษณ์',
      streak: 'สตรีค',
      best: 'สูงสุด',
      mastery: 'ความเชี่ยวชาญ',
      export: 'ส่งออกความคืบหน้า JSON',
      exportTitle: 'ดาวน์โหลดความคืบหน้าที่บันทึกไว้',
      exportDone: 'ส่งออกความคืบหน้าเป็น khan_trig_unit4_progress.json แล้ว',
      navInverse: 'ฟังก์ชันผกผัน',
      navIdentity: 'ห้องเอกลักษณ์',
      navSolver: 'ตัวแก้สมการ',
      footerBuilt: 'สร้างเพื่อการเรียนรู้เชิงรุก',
      degrees: 'องศา',
      radians: 'เรเดียน',
      exact: 'ค่าตรง',

      'i.title': 'ฟังก์ชันตรีโกณมิติผกผันและโดเมนจำกัด',
      'i.desc': 'กราฟคาบไม่ใช่ฟังก์ชันหนึ่งต่อหนึ่ง จำกัดโดเมนให้เป็นสาขาหลัก สะท้อนข้าม y = x แล้วจะได้มุมผกผันเพียงค่าเดียว',
      'i.goal': 'เป้าหมาย: ทำไม arcsin, arccos และ arctan ต้องจำกัดโดเมน',
      'i.legendCurve': 'กราฟเดิม',
      'i.legendBranch': 'สาขาที่จำกัด',
      'i.legendInverse': 'กราฟผกผัน',
      'i.legendPoint': 'จุดที่ใช้งาน',
      'i.hint': 'ลากจุดบนสาขา · สไลเดอร์ให้ผลเหมือนกัน',
      'i.domainMin': 'จุดเริ่มโดเมน',
      'i.domainMax': 'จุดสิ้นสุดโดเมน',
      'i.input': 'อินพุตผกผัน x',
      'i.branch': 'สาขาหลัก',
      'i.principalDomain': 'โดเมนหลัก',
      'i.principalRange': 'เรนจ์หลัก',
      'i.yourDomain': 'โดเมนของคุณ',
      'i.result': 'ผลลัพธ์ผกผัน',
      'i.valid': 'ใช้ได้',
      'i.invalid': 'ไม่หนึ่งต่อหนึ่ง',
      'i.inRange': 'อยู่ในโดเมน',
      'i.outRange': 'นอกเรนจ์',
      'i.outBranch': 'นอกสาขา',
      'i.noteValid': 'หนึ่งต่อหนึ่งบนโดเมนที่เลือก จึงมีฟังก์ชันผกผัน',
      'i.noteInvalid': 'โดเมนนี้มีช่วงโมโนโทนมากกว่าหนึ่งช่วง ควรแคบลงให้เหลือสาขาหลัก',
      'i.noteOutRange': 'อินพุตอยู่นอกเรนจ์ของฟังก์ชันเดิม ฟังก์ชันผกผันจึงไม่นิยาม',
      'i.noteOutBranch': 'อินพุตมีมุมที่ใช้ได้ แต่มุมนั้นอยู่นอกสาขาที่คุณจำกัดไว้',
      'i.undefined': 'ไม่นิยามที่อินพุตนี้',

      'p.title': 'เอกลักษณ์พิทาโกรัสและห้องลดรูป',
      'p.desc': 'เลือกนิพจน์ แล้วสร้างการลดรูปทีละขั้นด้วยการแทนที่ที่ถูกต้อง แบบจำลองพื้นที่แสดงให้เห็นว่าเอกลักษณ์เป็นจริงได้อย่างไร',
      'p.goal': 'เป้าหมาย: แปลงรูป ไม่ใช่เดา',
      'p.current': 'นิพจน์ปัจจุบัน',
      'p.reset': 'เริ่มนิพจน์ใหม่',
      'p.why': 'ทำไมจึงเป็นจริง',
      'p.correct': 'แทนที่ถูกต้อง',
      'p.wrong': 'การแทนที่นี้ไม่ตามมาจากเอกลักษณ์ ลองอีกครั้ง',
      'p.done': 'ลดรูปครบแล้ว',
      'p.stepOf': 'ขั้นที่',

      'q.title': 'ห้องฝึกซ้อม Khan และตัวแก้สมการ',
      'q.desc': 'แก้สมการบน [0, 2π) แยกตัวประกอบรูปกำลังสอง และตรวจเอกลักษณ์ วงกลมจะแสดงจุดตัดทั้งหมด',
      'q.goal': 'เป้าหมาย: คำตอบทั้งหมด ไม่ใช่แค่ค่าเดียว',
      'q.modeBasic': 'สมการพื้นฐาน',
      'q.modeQuadratic': 'รูปกำลังสอง',
      'q.modeIdentity': 'พิสูจน์เอกลักษณ์',
      'q.new': 'โจทย์ใหม่',
      'q.answerLabel': 'คำตอบของคุณ',
      'q.placeholder': 'เช่น π/6, 5π/6',
      'q.check': 'ตรวจคำตอบ',
      'q.answerHint': 'ใช้เรเดียน: π/6, 5π/6 หรือทศนิยม คั่นคำตอบด้วยเครื่องหมายจุลภาค',
      'q.showSteps': 'แสดงวิธีทำทีละขั้นแบบภาพ',
      'q.hideSteps': 'ซ่อนวิธีทำ',
      'q.progress': 'ความคืบหน้าของคุณ',
      'q.correct': 'ตอบถูก',
      'q.masteryHint': 'ตอบถูก 15 ข้อเพื่อปลดล็อกความชำนาญยูนิต 4',
      'q.badges': 'เหรียญความชำนาญ',
      'q.circle': 'คำตอบบนวงกลมหนึ่งหน่วย',
      'q.model': 'แบบจำลองพื้นที่เอกลักษณ์',
      'q.correctMsg': 'ถูกต้อง!',
      'q.wrongMsg': 'ยังไม่ถูก — ดูวิธีทำหรือลองโจทย์ใหม่',
      'q.invalid': 'กรอกอย่างน้อยหนึ่งมุม เช่น π/6, 5π/6',
      'q.badgeUnlocked': 'ปลดล็อกเหรียญ',
      'q.tagBasic': 'สมการพื้นฐาน',
      'q.tagQuadratic': 'รูปกำลังสอง',
      'q.tagIdentity': 'พิสูจน์เอกลักษณ์',
      'q.solvePrompt': 'จงแก้สมการบนช่วง [0, 2π)',
      'q.solveInstruction': 'คั่นทุกคำตอบด้วยเครื่องหมายจุลภาค รับทั้ง π และทศนิยม',
      'q.identityPrompt': 'จงลดรูปนิพจน์ให้สมบูรณ์',
      'q.identityInstruction': 'เลือกนิพจน์ที่สมมูลกัน',
      'q.step': 'ขั้นที่',
      'q.of': 'จาก',
      'q.reveal': 'กดปุ่มวิธีทำเพื่อแสดงจุดตัด',
      'q.solutions': 'คำตอบ',

      'badge.first': 'เอกลักษณ์แรก',
      'badge.streak3': 'ต่อเนื่อง 3',
      'badge.streak5': 'หยุดไม่อยู่ 5',
      'badge.basic3': 'นักล่ามุม',
      'badge.quadratic3': 'นักแยกตัวประกอบ',
      'badge.identity3': 'สถาปนิกเอกลักษณ์',
      'badge.master': 'ปรมาจารย์ยูนิต 4'
    }
  };
  const t = (key) => (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;

  /* ------------------------------- state --------------------------------- */
  const DEFAULT_STATE = {
    version: STATE_VERSION,
    lang: 'en',
    lastModule: 'inverse',
    inverse: { fn: 'sin', minK: -6, maxK: 6, input: 0.5 },
    identity: { expr: 'sec2minusTan2', step: 0, done: false },
    practice: {
      mode: 'basic',
      correct: 0,
      attempts: 0,
      streak: 0,
      best: 0,
      byMode: { basic: 0, quadratic: 0, identity: 0 },
      badges: []
    },
    completed: { inverse: false, identity: false, solver: false },
    updatedAt: null
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function mergeState(base, saved) {
    if (!saved || typeof saved !== 'object') return base;
    Object.keys(base).forEach((key) => {
      const b = base[key];
      const s = saved[key];
      if (b && typeof b === 'object' && !Array.isArray(b)) base[key] = mergeState(b, s);
      else if (s !== undefined) base[key] = s;
    });
    return base;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULT_STATE);
      const merged = mergeState(clone(DEFAULT_STATE), JSON.parse(raw));
      if (merged.lang !== 'en' && merged.lang !== 'th') merged.lang = 'en';
      if (!['inverse', 'identity', 'solver'].includes(merged.lastModule)) merged.lastModule = 'inverse';
      return merged;
    } catch (_) {
      return clone(DEFAULT_STATE);
    }
  }

  let state = loadState();
  let saveTimer = null;
  function saveState() {
    try {
      state.updatedAt = new Date().toISOString();
      state.version = STATE_VERSION;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* private mode: keep working in memory */ }
  }
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 250);
  }

  /* ------------------------------ helpers -------------------------------- */
  const fmt = (n, d = 2) => {
    if (!Number.isFinite(n)) return '—';
    const v = Math.abs(n) < 1e-10 ? 0 : n;
    return v.toFixed(d);
  };

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) { const r = a % b; a = b; b = r; }
    return a || 1;
  }

  function piFrac(n, d = 1) {
    if (!n) return '0';
    const sign = n < 0 ? '−' : '';
    let a = Math.abs(n);
    let b = d;
    const g = gcd(a, b);
    a /= g;
    b /= g;
    if (b === 1) return `${sign}${a === 1 ? 'π' : `${a}π`}`;
    return `${sign}${a === 1 ? `π/${b}` : `${a}π/${b}`}`;
  }

  function radToPi(r, den = 12) {
    const k = Math.round(r / (PI / den));
    return Math.abs(r - (k * PI) / den) < 1e-7 ? piFrac(k, den) : null;
  }

  function rgba(hex, alpha) {
    const n = parseInt(hex.replace('#', ''), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
  }

  /* ------------------------------ toast ---------------------------------- */
  let toastTimer = null;
  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  }

  /* --------------------------- canvas helpers ---------------------------- */
  function roundRect(ctx, x, y, w, h, r) {
    if (typeof ctx.roundRect === 'function') { ctx.roundRect(x, y, w, h, r); return; }
    const rr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawGrid(ctx, w, h, step = 34) {
    ctx.save();
    ctx.strokeStyle = 'rgba(148,175,220,0.055)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = step; x < w; x += step) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = step; y < h; y += step) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();
    ctx.restore();
  }

  function neonLine(ctx, x1, y1, x2, y2, color, width = 2.5, dash = null, glow = true) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    if (glow && !dash) { ctx.shadowColor = color; ctx.shadowBlur = 12; }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function chip(ctx, text, x, y, color, opts = {}) {
    ctx.save();
    ctx.font = opts.font || `600 12px ${FONT}`;
    const tw = ctx.measureText(text).width;
    const padX = 7;
    const hgt = 21;
    const wdt = tw + padX * 2;
    const bx = opts.align === 'left' ? x : opts.align === 'right' ? x - wdt : x - wdt / 2;
    const by = y - hgt / 2;
    ctx.beginPath();
    roundRect(ctx, bx, by, wdt, hgt, 7);
    ctx.fillStyle = 'rgba(5,10,20,0.86)';
    ctx.fill();
    ctx.strokeStyle = rgba(color, 0.42);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bx + wdt / 2, y + 0.5);
    ctx.restore();
  }

  function makeStage(canvas, draw) {
    const ctx = canvas.getContext('2d');
    const stage = { canvas, ctx, w: 0, h: 0, draw };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stage.w = r.width;
      stage.h = r.height;
      draw();
    };
    stage.resize = resize;
    if (typeof ResizeObserver === 'function') new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);
    requestAnimationFrame(resize);
    return stage;
  }

  /* ------------------------ module 1 · inverse --------------------------- */
  const FUNCS = {
    sin: {
      f: Math.sin, inv: Math.asin, invName: 'arcsin',
      pmin: -PI / 2, pmax: PI / 2, rangeText: '[−1, 1]', domainText: '[−π/2, π/2]',
      minK: -6, maxK: 6, input: 0.5, inputMin: -1.5, inputMax: 1.5
    },
    cos: {
      f: Math.cos, inv: Math.acos, invName: 'arccos',
      pmin: 0, pmax: PI, rangeText: '[−1, 1]', domainText: '[0, π]',
      minK: 0, maxK: 12, input: 0.5, inputMin: -1.5, inputMax: 1.5
    },
    tan: {
      f: Math.tan, inv: Math.atan, invName: 'arctan',
      pmin: -PI / 2, pmax: PI / 2, rangeText: '(−∞, ∞)', domainText: '(−π/2, π/2)',
      minK: -6, maxK: 6, input: 1, inputMin: -5, inputMax: 5
    }
  };

  function inverseDomain() {
    return {
      min: state.inverse.minK * STEP,
      max: state.inverse.maxK * STEP
    };
  }

  function inverseState() {
    const fn = FUNCS[state.inverse.fn] || FUNCS.sin;
    const { min, max } = inverseDomain();
    const validDomain = min < max && min >= fn.pmin - 1e-9 && max <= fn.pmax + 1e-9;
    const input = state.inverse.input;
    const inputValid = state.inverse.fn === 'tan' ? true : Math.abs(input) <= 1 + 1e-9;
    const theta = inputValid ? fn.inv(input) : NaN;
    const inBranch = validDomain && inputValid && theta >= min - 1e-9 && theta <= max + 1e-9;
    return { fn, min, max, validDomain, input, inputValid, theta, inBranch };
  }

  function drawInverse() {
    const { ctx, w, h } = invStage;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    drawGrid(ctx, w, h);

    const s = inverseState();
    const split = w * 0.52;
    const xMin = -TAU;
    const xMax = TAU;
    const yLimit = state.inverse.fn === 'tan' ? 4.5 : 2;
    const padL = 44;
    const padR = 20;
    const padT = 34;
    const padB = 38;
    const mapX = (x) => padL + ((x - xMin) / (xMax - xMin)) * (split - padL - padR);
    const mapY = (y) => h - padB - ((y + yLimit) / (2 * yLimit)) * (h - padT - padB);

    // Left panel: original function
    ctx.save();
    ctx.strokeStyle = 'rgba(148,175,220,0.24)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(padL, mapY(0));
    ctx.lineTo(split - padR, mapY(0));
    ctx.moveTo(mapX(0), padT);
    ctx.lineTo(mapX(0), h - padB);
    ctx.stroke();
    ctx.restore();

    // x ticks
    ctx.save();
    ctx.fillStyle = 'rgba(157,176,207,0.75)';
    ctx.font = `500 10px ${MATH}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    [['−2π', -TAU], ['−π', -PI], ['0', 0], ['π', PI], ['2π', TAU]].forEach(([label, x]) => {
      ctx.fillText(label, mapX(x), h - padB + 8);
    });
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yTicks = state.inverse.fn === 'tan' ? [-4, -2, 2, 4] : [-1, 1];
    yTicks.forEach((y) => ctx.fillText(String(y), padL - 7, mapY(y)));
    ctx.restore();

    // Restricted band
    if (s.min < s.max) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,214,0,0.05)';
      ctx.fillRect(mapX(s.min), padT, Math.max(0, mapX(s.max) - mapX(s.min)), h - padT - padB);
      ctx.restore();
    }

    const plotCurve = (from, to, color, width, alpha, glow) => {
      ctx.save();
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= 420; i++) {
        const x = from + ((to - from) * i) / 420;
        const y = s.fn.f(x);
        if (!Number.isFinite(y) || Math.abs(y) > yLimit * 1.35) { started = false; continue; }
        const px = mapX(x);
        const py = mapY(clamp(y, -yLimit, yLimit));
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      }
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 10; }
      ctx.stroke();
      ctx.restore();
    };

    plotCurve(xMin, xMax, COLORS.cos, 1.8, 0.35, false);
    if (s.min < s.max) plotCurve(s.min, s.max, COLORS.theta, 3.2, 1, true);

    // Branch endpoints
    if (s.min < s.max) {
      [s.min, s.max].forEach((x) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mapX(x), mapY(clamp(s.fn.f(x), -yLimit, yLimit)), 4.5, 0, TAU);
        ctx.fillStyle = COLORS.theta;
        ctx.fill();
        ctx.restore();
      });
    }

    // Active point on the branch
    if (s.inBranch) {
      const px = mapX(s.theta);
      const py = mapY(clamp(s.input, -yLimit, yLimit));
      neonLine(ctx, px, mapY(0), px, py, COLORS.sin, 1.4, [4, 4], false);
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, TAU);
      ctx.fillStyle = '#f8fbff';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = COLORS.sin;
      ctx.stroke();
      ctx.restore();
      chip(ctx, `θ = ${radToPi(s.theta) || fmt(s.theta, 3)}`, px + 38, py - 16, COLORS.theta);
    }

    ctx.save();
    ctx.fillStyle = 'rgba(157,176,207,0.8)';
    ctx.font = `600 11px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${state.inverse.fn} θ`, padL, 12);
    ctx.restore();

    // Divider
    neonLine(ctx, split, 20, split, h - 20, 'rgba(148,175,220,0.18)', 1, null, false);

    // Right panel: inverse
    const rx0 = split + 26;
    const rx1 = w - 30;
    const ry0 = padT;
    const ry1 = h - padB;
    const ixMin = state.inverse.fn === 'tan' ? -5 : -1.6;
    const ixMax = state.inverse.fn === 'tan' ? 5 : 1.6;
    const iyMin = -PI;
    const iyMax = PI;
    const mapIX = (x) => rx0 + ((x - ixMin) / (ixMax - ixMin)) * (rx1 - rx0);
    const mapIY = (y) => ry1 - ((y - iyMin) / (iyMax - iyMin)) * (ry1 - ry0);

    ctx.save();
    ctx.strokeStyle = 'rgba(148,175,220,0.24)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rx0, mapIY(0));
    ctx.lineTo(rx1, mapIY(0));
    ctx.moveTo(mapIX(0), ry0);
    ctx.lineTo(mapIX(0), ry1);
    ctx.stroke();
    ctx.restore();

    // Inverse ticks
    ctx.save();
    ctx.fillStyle = 'rgba(157,176,207,0.75)';
    ctx.font = `500 10px ${MATH}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xTickVals = state.inverse.fn === 'tan' ? [-4, -2, 0, 2, 4] : [-1, 0, 1];
    xTickVals.forEach((x) => ctx.fillText(String(x), mapIX(x), ry1 + 8));
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [['−π', -PI], ['−π/2', -PI / 2], ['0', 0], ['π/2', PI / 2], ['π', PI]].forEach(([label, y]) => {
      ctx.fillText(label, rx0 - 6, mapIY(y));
    });
    ctx.restore();

    if (s.validDomain) {
      ctx.save();
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= 300; i++) {
        const x = s.min + ((s.max - s.min) * i) / 300;
        const invX = s.fn.f(x);
        if (!Number.isFinite(invX)) { started = false; continue; }
        const px = mapIX(clamp(invX, ixMin, ixMax));
        const py = mapIY(x);
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = COLORS.one;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.shadowColor = COLORS.one;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
    }

    if (s.inBranch) {
      const px = mapIX(s.input);
      const py = mapIY(s.theta);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(157,176,207,0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, mapIY(0));
      ctx.moveTo(px, py);
      ctx.lineTo(mapIX(0), py);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, TAU);
      ctx.fillStyle = '#f8fbff';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = COLORS.sin;
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = 'rgba(255,92,138,0.9)';
      ctx.font = `600 12px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const msg = !s.validDomain ? t('i.noteInvalid') : !s.inputValid ? `${s.fn.invName}(${fmt(s.input, 2)}) ${t('i.undefined')}` : t('i.noteOutBranch');
      const words = msg.split(' ');
      const lines = [];
      let line = '';
      words.forEach((word) => {
        if ((line + ' ' + word).trim().length > 34) { lines.push(line.trim()); line = word; }
        else line += ` ${word}`;
      });
      if (line.trim()) lines.push(line.trim());
      lines.forEach((textLine, i) => ctx.fillText(textLine, (rx0 + rx1) / 2, h / 2 - (lines.length - 1) * 9 + i * 18));
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = 'rgba(157,176,207,0.8)';
    ctx.font = `600 11px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`${s.fn.invName} x`, rx1, 12);
    ctx.restore();
  }

  const invStage = makeStage($('invCanvas'), drawInverse);

  function renderInverse() {
    const s = inverseState();
    const fn = s.fn;
    const input = s.input;

    $('domMin').value = String(state.inverse.minK);
    $('domMax').value = String(state.inverse.maxK);
    $('domMinOut').textContent = piFrac(state.inverse.minK, 12);
    $('domMaxOut').textContent = piFrac(state.inverse.maxK, 12);

    const slider = $('invInput');
    slider.min = String(fn.inputMin);
    slider.max = String(fn.inputMax);
    slider.step = '0.01';
    slider.value = String(input);
    $('invInputOut').textContent = fmt(input, 2);
    $('inputMin').textContent = fmt(fn.inputMin, 1);
    $('inputMax').textContent = fmt(fn.inputMax, 1);

    $('principalDomain').textContent = fn.domainText;
    $('principalRange').textContent = fn.rangeText;
    $('yourDomain').textContent = `[${piFrac(state.inverse.minK, 12)}, ${piFrac(state.inverse.maxK, 12)}]`;

    const domainBadge = $('domainBadge');
    domainBadge.textContent = s.validDomain ? t('i.valid') : t('i.invalid');
    domainBadge.className = `status-badge ${s.validDomain ? 'is-good' : 'is-bad'}`;
    $('domainNote').textContent = s.validDomain ? t('i.noteValid') : t('i.noteInvalid');

    const inputBadge = $('inputBadge');
    let badgeKey = 'i.inRange';
    if (!s.validDomain) badgeKey = 'i.invalid';
    else if (!s.inputValid) badgeKey = 'i.outRange';
    else if (!s.inBranch) badgeKey = 'i.outBranch';
    inputBadge.textContent = t(badgeKey);
    inputBadge.className = `status-badge ${s.inBranch ? 'is-good' : 'is-bad'}`;

    $('inputNote').textContent = !s.validDomain
      ? t('i.noteInvalid')
      : !s.inputValid
        ? t('i.noteOutRange')
        : !s.inBranch
          ? t('i.noteOutBranch')
          : t('i.noteValid');

    if (s.inBranch) {
      const exact = radToPi(s.theta);
      $('resultEquation').textContent = `${fn.invName}(${fmt(input, 2)}) = ${exact || fmt(s.theta, 4)}`;
      $('resDegrees').textContent = `${fmt(deg(s.theta), 1)}°`;
      $('resRadians').textContent = fmt(s.theta, 4);
      $('resExact').textContent = exact || '—';
    } else {
      $('resultEquation').textContent = `${fn.invName}(${fmt(input, 2)}) = —`;
      $('resDegrees').textContent = '—';
      $('resRadians').textContent = '—';
      $('resExact').textContent = '—';
    }

    document.querySelectorAll('.fn-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.fn === state.inverse.fn);
    });
  }

  function onInverseChange() {
    renderInverse();
    drawInverse();
    completeModule('inverse');
    scheduleSave();
  }

  document.querySelectorAll('.fn-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fnKey = btn.dataset.fn;
      const fn = FUNCS[fnKey];
      state.inverse.fn = fnKey;
      state.inverse.minK = fn.minK;
      state.inverse.maxK = fn.maxK;
      state.inverse.input = fn.input;
      onInverseChange();
      saveState();
    });
  });

  $('domMin').addEventListener('input', () => {
    state.inverse.minK = Number($('domMin').value);
    onInverseChange();
  });
  $('domMax').addEventListener('input', () => {
    state.inverse.maxK = Number($('domMax').value);
    onInverseChange();
  });
  $('invInput').addEventListener('input', () => {
    state.inverse.input = Number($('invInput').value);
    onInverseChange();
  });

  let invDrag = false;
  function dragInverse(event) {
    const stage = invStage;
    if (!stage.w) return;
    const r = $('invCanvas').getBoundingClientRect();
    const x = event.clientX - r.left;
    if (x > stage.w * 0.52) return;
    const s = inverseState();
    if (s.min >= s.max) return;
    const padL = 44;
    const padR = 20;
    const split = stage.w * 0.52;
    const t0 = -TAU;
    const t1 = TAU;
    const world = t0 + ((x - padL) / (split - padL - padR)) * (t1 - t0);
    const bounded = clamp(world, s.min, s.max);
    const fn = s.fn;
    const y = fn.f(bounded);
    if (!Number.isFinite(y)) return;
    state.inverse.input = clamp(Math.round(y * 100) / 100, fn.inputMin, fn.inputMax);
    onInverseChange();
  }

  $('invCanvas').addEventListener('pointerdown', (event) => {
    invDrag = true;
    try { $('invCanvas').setPointerCapture(event.pointerId); } catch (_) { /* ignore */ }
    dragInverse(event);
    event.preventDefault();
  });
  $('invCanvas').addEventListener('pointermove', (event) => {
    if (!invDrag) return;
    dragInverse(event);
    event.preventDefault();
  });
  const endInvDrag = () => { invDrag = false; };
  $('invCanvas').addEventListener('pointerup', endInvDrag);
  $('invCanvas').addEventListener('pointercancel', endInvDrag);

  /* ------------------------ module 2 · identities ------------------------ */
  const EXPRESSIONS = [
    {
      id: 'sin2cos2',
      label: 'sin²θ + cos²θ',
      initial: 'sin²θ + cos²θ',
      final: '1',
      model: 'sin-cos',
      noteEn: 'The two leg squares exactly fill the hypotenuse square of area 1.',
      noteTh: 'กำลังสองบนด้านประกอบสองด้านรวมกันเท่ากับกำลังสองบนด้านตรงข้ามมุมฉากที่มีพื้นที่ 1',
      steps: [
        {
          promptEn: 'Which Pythagorean identity applies directly?',
          promptTh: 'เอกลักษณ์พิทาโกรัสใดใช้ได้โดยตรง',
          explainEn: 'Apply sin²θ + cos²θ = 1.',
          explainTh: 'ใช้ sin²θ + cos²θ = 1',
          choices: [
            { html: 'sin²θ + cos²θ = 1', correct: true },
            { html: '1 + tan²θ = sec²θ', correct: false },
            { html: '1 + cot²θ = csc²θ', correct: false }
          ],
          result: '1'
        }
      ]
    },
    {
      id: 'sec2minusTan2',
      label: 'sec²θ − tan²θ',
      initial: 'sec²θ − tan²θ',
      final: '1',
      model: 'tan-sec',
      noteEn: 'Divide sin²θ + cos²θ = 1 by cos²θ to obtain 1 + tan²θ = sec²θ.',
      noteTh: 'หาร sin²θ + cos²θ = 1 ด้วย cos²θ จะได้ 1 + tan²θ = sec²θ',
      steps: [
        {
          promptEn: 'Rewrite sec²θ using the Pythagorean identity.',
          promptTh: 'เขียน sec²θ ใหม่ด้วยเอกลักษณ์พิทาโกรัส',
          explainEn: 'Since 1 + tan²θ = sec²θ, replace sec²θ with 1 + tan²θ.',
          explainTh: 'เนื่องจาก 1 + tan²θ = sec²θ แทน sec²θ ด้วย 1 + tan²θ',
          choices: [
            { html: '(1 + tan²θ) − tan²θ', correct: true },
            { html: '1 − tan²θ', correct: false },
            { html: '(sec²θ + 1) − tan²θ', correct: false }
          ],
          result: '1 + tan²θ − tan²θ'
        },
        {
          promptEn: 'Cancel the matching tan²θ terms.',
          promptTh: 'ตัดพจน์ tan²θ ที่เท่ากัน',
          explainEn: 'tan²θ − tan²θ = 0, leaving 1.',
          explainTh: 'tan²θ − tan²θ = 0 เหลือ 1',
          choices: [
            { html: '1', correct: true },
            { html: '0', correct: false },
            { html: '2tan²θ', correct: false }
          ],
          result: '1'
        }
      ]
    },
    {
      id: 'csc2minusCot2',
      label: 'csc²θ − cot²θ',
      initial: 'csc²θ − cot²θ',
      final: '1',
      model: 'cot-csc',
      noteEn: 'Divide sin²θ + cos²θ = 1 by sin²θ to obtain 1 + cot²θ = csc²θ.',
      noteTh: 'หาร sin²θ + cos²θ = 1 ด้วย sin²θ จะได้ 1 + cot²θ = csc²θ',
      steps: [
        {
          promptEn: 'Rewrite csc²θ using the Pythagorean identity.',
          promptTh: 'เขียน csc²θ ใหม่ด้วยเอกลักษณ์พิทาโกรัส',
          explainEn: 'Since 1 + cot²θ = csc²θ, replace csc²θ with 1 + cot²θ.',
          explainTh: 'เนื่องจาก 1 + cot²θ = csc²θ แทน csc²θ ด้วย 1 + cot²θ',
          choices: [
            { html: '(1 + cot²θ) − cot²θ', correct: true },
            { html: '1 − cot²θ', correct: false },
            { html: '(csc²θ + 1) − cot²θ', correct: false }
          ],
          result: '1 + cot²θ − cot²θ'
        },
        {
          promptEn: 'Cancel the matching cot²θ terms.',
          promptTh: 'ตัดพจน์ cot²θ ที่เท่ากัน',
          explainEn: 'cot²θ − cot²θ = 0, leaving 1.',
          explainTh: 'cot²θ − cot²θ = 0 เหลือ 1',
          choices: [
            { html: '1', correct: true },
            { html: '0', correct: false },
            { html: '2cot²θ', correct: false }
          ],
          result: '1'
        }
      ]
    },
    {
      id: 'sin3Plus',
      label: 'sin³θ + sinθcos²θ',
      initial: 'sin³θ + sinθcos²θ',
      final: 'sinθ',
      model: 'sin-cos',
      noteEn: 'Factor sinθ, then replace the remaining sin²θ + cos²θ with 1.',
      noteTh: 'ดึงตัวร่วม sinθ แล้วแทน sin²θ + cos²θ ด้วย 1',
      steps: [
        {
          promptEn: 'Factor sinθ out of both terms.',
          promptTh: 'ดึง sinθ ออกจากทั้งสองพจน์',
          explainEn: 'Both terms share sinθ, so factor it out.',
          explainTh: 'ทั้งสองพจน์มี sinθ ร่วม จึงดึงออกมา',
          choices: [
            { html: 'sinθ(sin²θ + cos²θ)', correct: true },
            { html: 'sinθ(sinθ + cos²θ)', correct: false },
            { html: 'cosθ(sin²θ + sinθ)', correct: false }
          ],
          result: 'sinθ(sin²θ + cos²θ)'
        },
        {
          promptEn: 'Replace sin²θ + cos²θ with 1.',
          promptTh: 'แทน sin²θ + cos²θ ด้วย 1',
          explainEn: 'The Pythagorean identity leaves sinθ · 1 = sinθ.',
          explainTh: 'เอกลักษณ์พิทาโกรัสเหลือ sinθ · 1 = sinθ',
          choices: [
            { html: 'sinθ · 1 = sinθ', correct: true },
            { html: 'sinθ + 1', correct: false },
            { html: 'cosθ', correct: false }
          ],
          result: 'sinθ'
        }
      ]
    },
    {
      id: 'oneMinusCos2',
      label: '(1 − cos²θ) / sinθ',
      initial: '(1 − cos²θ) / sinθ',
      final: 'sinθ',
      model: 'sin-cos',
      noteEn: 'Rearrange sin²θ + cos²θ = 1 to get 1 − cos²θ = sin²θ.',
      noteTh: 'จัด sin²θ + cos²θ = 1 ใหม่จะได้ 1 − cos²θ = sin²θ',
      steps: [
        {
          promptEn: 'Replace 1 − cos²θ.',
          promptTh: 'แทน 1 − cos²θ',
          explainEn: 'Since 1 − cos²θ = sin²θ, the numerator becomes sin²θ.',
          explainTh: 'เนื่องจาก 1 − cos²θ = sin²θ ตัวเศษจึงเป็น sin²θ',
          choices: [
            { html: 'sin²θ / sinθ', correct: true },
            { html: 'cos²θ / sinθ', correct: false },
            { html: '1 / sinθ', correct: false }
          ],
          result: 'sin²θ / sinθ'
        },
        {
          promptEn: 'Cancel one factor of sinθ.',
          promptTh: 'ตัด sinθ หนึ่งตัว',
          explainEn: 'sin²θ / sinθ = sinθ.',
          explainTh: 'sin²θ / sinθ = sinθ',
          choices: [
            { html: 'sinθ', correct: true },
            { html: '1', correct: false },
            { html: 'cscθ', correct: false }
          ],
          result: 'sinθ'
        }
      ]
    },
    {
      id: 'tanCos',
      label: 'tanθ · cosθ',
      initial: 'tanθ · cosθ',
      final: 'sinθ',
      model: 'sin-cos',
      noteEn: 'tanθ = sinθ / cosθ, so the cosine factors cancel.',
      noteTh: 'tanθ = sinθ / cosθ ดังนั้นตัวประกอบโคไซน์ตัดกัน',
      steps: [
        {
          promptEn: 'Write tanθ as sinθ / cosθ.',
          promptTh: 'เขียน tanθ เป็น sinθ / cosθ',
          explainEn: 'The quotient identity replaces tanθ.',
          explainTh: 'เอกลักษณ์ผลหารใช้แทน tanθ',
          choices: [
            { html: '(sinθ / cosθ) · cosθ', correct: true },
            { html: 'sinθ · cos²θ', correct: false },
            { html: 'cosθ / sinθ', correct: false }
          ],
          result: '(sinθ / cosθ) · cosθ'
        },
        {
          promptEn: 'Cancel cosθ.',
          promptTh: 'ตัด cosθ',
          explainEn: 'The cosine in the denominator cancels the multiplier.',
          explainTh: 'โคไซน์ในตัวส่วนตัดกับตัวคูณ',
          choices: [
            { html: 'sinθ', correct: true },
            { html: 'cosθ', correct: false },
            { html: '1', correct: false }
          ],
          result: 'sinθ'
        }
      ]
    },
    {
      id: 'sec2minus1',
      label: '(sec²θ − 1) / tan²θ',
      initial: '(sec²θ − 1) / tan²θ',
      final: '1',
      model: 'tan-sec',
      noteEn: 'Rearrange 1 + tan²θ = sec²θ to get sec²θ − 1 = tan²θ.',
      noteTh: 'จัด 1 + tan²θ = sec²θ ใหม่จะได้ sec²θ − 1 = tan²θ',
      steps: [
        {
          promptEn: 'Replace sec²θ − 1.',
          promptTh: 'แทน sec²θ − 1',
          explainEn: 'Since sec²θ − 1 = tan²θ, the numerator becomes tan²θ.',
          explainTh: 'เนื่องจาก sec²θ − 1 = tan²θ ตัวเศษจึงเป็น tan²θ',
          choices: [
            { html: 'tan²θ / tan²θ', correct: true },
            { html: '1 / tan²θ', correct: false },
            { html: 'sec²θ / tan²θ', correct: false }
          ],
          result: 'tan²θ / tan²θ'
        },
        {
          promptEn: 'Simplify the ratio.',
          promptTh: 'ลดรูปอัตราส่วน',
          explainEn: 'Any nonzero quantity divided by itself is 1.',
          explainTh: 'ปริมาณที่ไม่เป็นศูนย์หารด้วยตัวเองเท่ากับ 1',
          choices: [
            { html: '1', correct: true },
            { html: 'tan²θ', correct: false },
            { html: '0', correct: false }
          ],
          result: '1'
        }
      ]
    }
  ];

  function expressionById(id) {
    return EXPRESSIONS.find((e) => e.id === id) || EXPRESSIONS[0];
  }

  let identityLocked = false;

  function renderIdentity() {
    const expr = expressionById(state.identity.expr);
    const step = clamp(state.identity.step, 0, expr.steps.length);
    const done = state.identity.done || step >= expr.steps.length;
    state.identity.step = step;
    state.identity.done = done;

    const chips = $('exprChips');
    chips.innerHTML = '';
    EXPRESSIONS.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `expr-chip${item.id === expr.id ? ' is-active' : ''}`;
      btn.innerHTML = item.label;
      btn.addEventListener('click', () => {
        if (item.id === state.identity.expr) return;
        state.identity.expr = item.id;
        state.identity.step = 0;
        state.identity.done = false;
        $('identityFeedback').hidden = true;
        renderIdentity();
        drawModelCanvas();
        saveState();
      });
      chips.appendChild(btn);
    });

    const current = done ? expr.final : step === 0 ? expr.initial : expr.steps[step - 1].result;
    $('currentExpr').innerHTML = current;
    $('identityNote').textContent = state.lang === 'th' ? expr.noteTh : expr.noteEn;

    const prompt = $('stepPrompt');
    const choices = $('choiceGrid');
    choices.innerHTML = '';

    if (done) {
      prompt.textContent = t('p.done');
      const finalBtn = document.createElement('div');
      finalBtn.className = 'choice-btn is-correct';
      finalBtn.innerHTML = `${expr.final}`;
      choices.appendChild(finalBtn);
      completeModule('identity');
    } else {
      const currentStep = expr.steps[step];
      prompt.textContent = `${t('p.stepOf')} ${step + 1} / ${expr.steps.length} — ${state.lang === 'th' ? currentStep.promptTh : currentStep.promptEn}`;
      currentStep.choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-btn';
        btn.innerHTML = choice.html;
        btn.addEventListener('click', () => chooseIdentity(step, index, btn));
        choices.appendChild(btn);
      });
    }

    const dots = $('progressDots');
    dots.innerHTML = '';
    expr.steps.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i < step || done) dot.className = 'is-done';
      else if (i === step && !done) dot.className = 'is-current';
      dots.appendChild(dot);
    });

    renderPracticeProgress();
  }

  function chooseIdentity(stepIndex, choiceIndex, button) {
    if (identityLocked) return;
    const expr = expressionById(state.identity.expr);
    const step = expr.steps[stepIndex];
    if (!step) return;
    const choice = step.choices[choiceIndex];
    const feedback = $('identityFeedback');
    feedback.hidden = false;

    if (choice.correct) {
      identityLocked = true;
      button.classList.add('is-correct');
      feedback.className = 'feedback is-good';
      feedback.textContent = `✅ ${t('p.correct')} ${step.result}`;
      state.identity.step = stepIndex + 1;
      state.identity.done = state.identity.step >= expr.steps.length;
      completeModule('identity');
      saveState();
      setTimeout(() => {
        identityLocked = false;
        feedback.hidden = true;
        renderIdentity();
      }, 620);
    } else {
      button.classList.add('is-wrong');
      feedback.className = 'feedback is-bad';
      feedback.textContent = `❌ ${t('p.wrong')}`;
      setTimeout(() => button.classList.remove('is-wrong'), 900);
    }
  }

  $('resetExpr').addEventListener('click', () => {
    state.identity.step = 0;
    state.identity.done = false;
    $('identityFeedback').hidden = true;
    renderIdentity();
    drawModelCanvas();
    saveState();
  });

  function drawAreaModel(ctx, w, h, expr) {
    const model = expr.model;
    const theta = rad(40);
    let A;
    let B;
    let C;
    let lblA;
    let lblB;
    let lblC;
    let sqA;
    let sqB;
    let sqC;
    let colA;
    let colB;
    let colC;
    let title;

    if (model === 'tan-sec') {
      A = 1;
      B = Math.tan(theta);
      C = 1 / Math.cos(theta);
      lblA = '1'; lblB = 'tan θ'; lblC = 'sec θ';
      sqA = '1'; sqB = 'tan²θ'; sqC = 'sec²θ';
      colA = COLORS.one; colB = COLORS.tan; colC = COLORS.cos;
      title = '1 + tan²θ = sec²θ';
    } else if (model === 'cot-csc') {
      A = 1;
      B = 1 / Math.tan(theta);
      C = 1 / Math.sin(theta);
      lblA = '1'; lblB = 'cot θ'; lblC = 'csc θ';
      sqA = '1'; sqB = 'cot²θ'; sqC = 'csc²θ';
      colA = COLORS.one; colB = COLORS.sin; colC = COLORS.tan;
      title = '1 + cot²θ = csc²θ';
    } else {
      A = Math.sin(theta);
      B = Math.cos(theta);
      C = 1;
      lblA = 'sin θ'; lblB = 'cos θ'; lblC = '1';
      sqA = 'sin²θ'; sqB = 'cos²θ'; sqC = '1';
      colA = COLORS.sin; colB = COLORS.cos; colC = COLORS.one;
      title = 'sin²θ + cos²θ = 1';
    }

    const P0 = { x: 0, y: 0 };
    const P1 = { x: A, y: 0 };
    const P2 = { x: 0, y: B };
    const n = { x: B / C, y: A / C };
    const S0 = { x: P1.x + n.x * C, y: P1.y + n.y * C };
    const S1 = { x: P2.x + n.x * C, y: P2.y + n.y * C };
    const points = [P0, P1, P2, { x: A, y: -A }, { x: 0, y: -A }, { x: -B, y: 0 }, { x: -B, y: B }, { x: 0, y: B }, S0, S1];
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const pad = 46;
    const scale = Math.min((w - pad * 2) / Math.max(maxX - minX, 0.1), (h - pad * 2) / Math.max(maxY - minY, 0.1));
    const ox = (w - (maxX - minX) * scale) / 2 - minX * scale;
    const oy = (h - (maxY - minY) * scale) / 2 + maxY * scale;
    const map = (p) => ({ x: ox + p.x * scale, y: oy - p.y * scale });

    drawGrid(ctx, w, h, 30);

    const square = (pts, color, label) => {
      const mapped = pts.map(map);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(mapped[0].x, mapped[0].y);
      mapped.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fillStyle = rgba(color, 0.08);
      ctx.fill();
      ctx.strokeStyle = rgba(color, 0.55);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
      const cxm = mapped.reduce((s, p) => s + p.x, 0) / 4;
      const cym = mapped.reduce((s, p) => s + p.y, 0) / 4;
      chip(ctx, label, cxm, cym, color, { font: `600 11px ${MATH}` });
    };

    square([P0, P1, { x: A, y: -A }, { x: 0, y: -A }], colA, sqA);
    square([P0, { x: -B, y: 0 }, { x: -B, y: B }, P2], colB, sqB);
    square([P1, P2, S1, S0], colC, sqC);

    const M0 = map(P0);
    const M1 = map(P1);
    const M2 = map(P2);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(M0.x, M0.y);
    ctx.lineTo(M1.x, M1.y);
    ctx.lineTo(M2.x, M2.y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,229,255,0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(234,242,255,0.75)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // The squares carry the labels; omitting side chips keeps the small
    // triangle from colliding with the large square captions.

    // right angle mark
    const r = 12;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,214,0,0.8)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(M0.x + r, M0.y);
    ctx.lineTo(M0.x + r, M0.y - r);
    ctx.lineTo(M0.x, M0.y - r);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(234,242,255,0.9)';
    ctx.font = `600 13px ${MATH}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, w / 2, 12);
    ctx.restore();
  }

  function drawModelCanvas() {
    const { ctx, w, h } = modelStage;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    drawAreaModel(ctx, w, h, expressionById(state.identity.expr));
  }

  const modelStage = makeStage($('modelCanvas'), drawModelCanvas);

  /* ------------------------- module 3 · practice ------------------------- */
  const BASIC_TEMPLATES = [
    { equation: '2sinθ − 1 = 0', isolate: 'sinθ = 1/2', ratio: 'sin', ref: 30, sols: [30, 150], ruleEn: 'sin is positive in QI and QII: θ = 30° and 180° − 30° = 150°.', ruleTh: 'sin เป็นบวกใน QI และ QII: θ = 30° และ 180° − 30° = 150°' },
    { equation: '2cosθ + 1 = 0', isolate: 'cosθ = −1/2', ratio: 'cos', ref: 60, sols: [120, 240], ruleEn: 'cos is negative in QII and QIII: θ = 180° − 60° = 120° and 180° + 60° = 240°.', ruleTh: 'cos เป็นลบใน QII และ QIII: θ = 180° − 60° = 120° และ 180° + 60° = 240°' },
    { equation: '√3 tanθ − 3 = 0', isolate: 'tanθ = √3', ratio: 'tan', ref: 60, sols: [60, 240], ruleEn: 'tan is positive in QI and QIII: θ = 60° and 60° + 180° = 240°.', ruleTh: 'tan เป็นบวกใน QI และ QIII: θ = 60° และ 60° + 180° = 240°' },
    { equation: '√2 cosθ − 1 = 0', isolate: 'cosθ = √2/2', ratio: 'cos', ref: 45, sols: [45, 315], ruleEn: 'cos is positive in QI and QIV: θ = 45° and 360° − 45° = 315°.', ruleTh: 'cos เป็นบวกใน QI และ QIV: θ = 45° และ 360° − 45° = 315°' },
    { equation: '2sinθ + √3 = 0', isolate: 'sinθ = −√3/2', ratio: 'sin', ref: 60, sols: [240, 300], ruleEn: 'sin is negative in QIII and QIV: θ = 180° + 60° = 240° and 360° − 60° = 300°.', ruleTh: 'sin เป็นลบใน QIII และ QIV: θ = 180° + 60° = 240° และ 360° − 60° = 300°' },
    { equation: 'tanθ + 1 = 0', isolate: 'tanθ = −1', ratio: 'tan', ref: 45, sols: [135, 315], ruleEn: 'tan is negative in QII and QIV: θ = 180° − 45° = 135° and 360° − 45° = 315°.', ruleTh: 'tan เป็นลบใน QII และ QIV: θ = 180° − 45° = 135° และ 360° − 45° = 315°' },
    { equation: 'sinθ = 1', isolate: 'sinθ = 1', ratio: 'sin', ref: 90, sols: [90], ruleEn: 'sin reaches 1 only at 90° on [0, 360°).', ruleTh: 'sin มีค่า 1 ที่ 90° เท่านั้นบน [0, 360°)' },
    { equation: 'cosθ = −1', isolate: 'cosθ = −1', ratio: 'cos', ref: 0, sols: [180], ruleEn: 'cos reaches −1 only at 180° on [0, 360°).', ruleTh: 'cos มีค่า −1 ที่ 180° เท่านั้นบน [0, 360°)' }
  ];

  const QUADRATIC_TEMPLATES = [
    {
      equation: '2cos²θ − cosθ − 1 = 0', factored: '(2cosθ + 1)(cosθ − 1) = 0',
      cases: [{ label: 'cosθ = −1/2', sols: [120, 240] }, { label: 'cosθ = 1', sols: [0] }]
    },
    {
      equation: '2sin²θ − sinθ − 1 = 0', factored: '(2sinθ + 1)(sinθ − 1) = 0',
      cases: [{ label: 'sinθ = −1/2', sols: [210, 330] }, { label: 'sinθ = 1', sols: [90] }]
    },
    {
      equation: '2cos²θ + cosθ − 1 = 0', factored: '(2cosθ − 1)(cosθ + 1) = 0',
      cases: [{ label: 'cosθ = 1/2', sols: [60, 300] }, { label: 'cosθ = −1', sols: [180] }]
    },
    {
      equation: '2sin²θ + sinθ − 1 = 0', factored: '(2sinθ − 1)(sinθ + 1) = 0',
      cases: [{ label: 'sinθ = 1/2', sols: [30, 150] }, { label: 'sinθ = −1', sols: [270] }]
    },
    {
      equation: '4sin²θ − 1 = 0', factored: '(2sinθ − 1)(2sinθ + 1) = 0',
      cases: [{ label: 'sinθ = 1/2', sols: [30, 150] }, { label: 'sinθ = −1/2', sols: [210, 330] }]
    },
    {
      equation: 'cos²θ − 1 = 0', factored: '(cosθ − 1)(cosθ + 1) = 0',
      cases: [{ label: 'cosθ = 1', sols: [0] }, { label: 'cosθ = −1', sols: [180] }]
    }
  ];

  const BADGES = [
    { id: 'first', icon: '🌟', key: 'badge.first', test: (p) => p.correct >= 1 },
    { id: 'streak3', icon: '🔥', key: 'badge.streak3', test: (p) => p.best >= 3 },
    { id: 'streak5', icon: '⚡', key: 'badge.streak5', test: (p) => p.best >= 5 },
    { id: 'basic3', icon: '🎯', key: 'badge.basic3', test: (p) => p.byMode.basic >= 3 },
    { id: 'quadratic3', icon: '🧩', key: 'badge.quadratic3', test: (p) => p.byMode.quadratic >= 3 },
    { id: 'identity3', icon: '≡', key: 'badge.identity3', test: (p) => p.byMode.identity >= 3 },
    { id: 'master', icon: '🏆', key: 'badge.master', test: (p) => p.correct >= 15 }
  ];

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let currentProblem = null;
  let answered = false;
  let lastCorrect = false;
  let stepsShown = false;
  let stepTimers = [];
  let revealedSolutions = false;
  let selectedOption = null;

  function answerTextFromDegrees(degs) {
    return degs.map((d) => piFrac(d, 180)).join(', ');
  }

  function genBasicProblem() {
    const tpl = pick(BASIC_TEMPLATES);
    const answerText = answerTextFromDegrees(tpl.sols);
    return {
      mode: 'basic',
      promptEn: 'Solve the equation on the interval [0, 2π).',
      promptTh: 'จงแก้สมการบนช่วง [0, 2π)',
      equationHtml: tpl.equation,
      instructionEn: t('q.solveInstruction'),
      instructionTh: 'คั่นทุกคำตอบด้วยเครื่องหมายจุลภาค รับทั้ง π และทศนิยม',
      answerText,
      solutions: tpl.sols.map((d) => rad(d)),
      steps: [
        { en: `Isolate the ratio: <strong>${tpl.isolate}</strong>.`, th: `แยกอัตราส่วน: <strong>${tpl.isolate}</strong>`, reveal: false },
        { en: `Reference angle: <strong>${tpl.ref}° = ${piFrac(tpl.ref, 180)}</strong>.`, th: `มุมอ้างอิง: <strong>${tpl.ref}° = ${piFrac(tpl.ref, 180)}</strong>`, reveal: false },
        { en: tpl.ruleEn, th: tpl.ruleTh, reveal: true },
        { en: `Solutions on [0, 2π): <strong>${answerText}</strong>.`, th: `คำตอบบน [0, 2π): <strong>${answerText}</strong>`, reveal: true }
      ]
    };
  }

  function genQuadraticProblem() {
    const tpl = pick(QUADRATIC_TEMPLATES);
    const sols = tpl.cases.flatMap((c) => c.sols);
    const unique = [...new Set(sols)].sort((a, b) => a - b);
    const answerText = answerTextFromDegrees(unique);
    const steps = [
      { en: `Factor: <strong>${tpl.factored}</strong>.`, th: `แยกตัวประกอบ: <strong>${tpl.factored}</strong>`, reveal: false },
      { en: 'Use the zero-product property: set each factor equal to zero.', th: 'ใช้สมบัติผลคูณเป็นศูนย์: ตั้งแต่ละตัวประกอบเท่ากับศูนย์', reveal: false }
    ];
    tpl.cases.forEach((c) => {
      steps.push({
        en: `${c.label} → θ = <strong>${answerTextFromDegrees(c.sols)}</strong>.`,
        th: `${c.label} → θ = <strong>${answerTextFromDegrees(c.sols)}</strong>`,
        reveal: true
      });
    });
    steps.push({
      en: `Combine every solution in [0, 2π): <strong>${answerText}</strong>.`,
      th: `รวมทุกคำตอบบน [0, 2π): <strong>${answerText}</strong>`,
      reveal: true
    });
    return {
      mode: 'quadratic',
      promptEn: 'Solve the quadratic-form equation on [0, 2π).',
      promptTh: 'จงแก้สมการรูปกำลังสองบน [0, 2π)',
      equationHtml: tpl.equation,
      instructionEn: t('q.solveInstruction'),
      instructionTh: 'คั่นทุกคำตอบด้วยเครื่องหมายจุลภาค รับทั้ง π และทศนิยม',
      answerText,
      solutions: unique.map((d) => rad(d)),
      steps
    };
  }

  function genIdentityProblem() {
    const expr = pick(EXPRESSIONS);
    const finalHtml = expr.final;
    const pool = ['1', '0', 'sinθ', 'cosθ', 'tanθ', 'secθ', 'cscθ'].filter((x) => x !== finalHtml);
    const options = shuffle([finalHtml, ...shuffle(pool).slice(0, 3)]);
    const steps = expr.steps.map((step) => ({
      en: `${step.explainEn} → <strong>${step.result}</strong>`,
      th: `${step.explainTh} → <strong>${step.result}</strong>`,
      reveal: false
    }));
    steps.push({
      en: `Simplified form: <strong>${finalHtml}</strong>.`,
      th: `รูปแบบที่ลดรูปแล้ว: <strong>${finalHtml}</strong>`,
      reveal: false
    });
    return {
      mode: 'identity',
      promptEn: 'Simplify the expression completely.',
      promptTh: 'จงลดรูปนิพจน์ให้สมบูรณ์',
      equationHtml: expr.initial,
      instructionEn: 'Choose the equivalent expression.',
      instructionTh: 'เลือกนิพจน์ที่สมมูลกัน',
      answer: finalHtml,
      options,
      exprId: expr.id,
      steps
    };
  }

  function renderPracticeCanvas() {
    const { ctx, w, h } = solutionStage;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    drawGrid(ctx, w, h, 30);

    if (!currentProblem) {
      ctx.save();
      ctx.fillStyle = 'rgba(157,176,207,0.7)';
      ctx.font = `600 12px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('—', w / 2, h / 2);
      ctx.restore();
      return;
    }

    if (currentProblem.mode === 'identity') {
      drawAreaModel(ctx, w, h, expressionById(currentProblem.exprId));
      return;
    }

    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.35;

    ctx.save();
    ctx.strokeStyle = 'rgba(148,175,220,0.28)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - R * 1.3, cy);
    ctx.lineTo(cx + R * 1.3, cy);
    ctx.moveTo(cx, cy - R * 1.3);
    ctx.lineTo(cx, cy + R * 1.3);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.strokeStyle = rgba(COLORS.cos, 0.5);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(157,176,207,0.8)';
    ctx.font = `600 11px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('0', cx + R + 16, cy + 14);
    ctx.fillText('π/2', cx + 16, cy - R - 10);
    ctx.fillText('π', cx - R - 14, cy + 14);
    ctx.fillText('3π/2', cx + 16, cy + R + 14);
    ctx.restore();

    if (!revealedSolutions) {
      ctx.save();
      ctx.fillStyle = 'rgba(157,176,207,0.75)';
      ctx.font = `600 11px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(t('q.reveal'), cx, cy + R + 36);
      ctx.restore();
      return;
    }

    currentProblem.solutions.forEach((a) => {
      const px = cx + R * Math.cos(a);
      const py = cy - R * Math.sin(a);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = rgba(COLORS.one, 0.35);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, TAU);
      ctx.fillStyle = '#f8fbff';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = COLORS.one;
      ctx.stroke();
      ctx.restore();
      const label = piFrac(Math.round(deg(a)), 180);
      chip(ctx, label, px + (Math.cos(a) >= 0 ? 34 : -34), py - 14, COLORS.theta);
    });
  }

  const solutionStage = makeStage($('solutionCanvas'), renderPracticeCanvas);

  function renderProblemText() {
    if (!currentProblem) return;
    $('problemText').innerHTML = state.lang === 'th' ? currentProblem.promptTh : currentProblem.promptEn;
    $('problemEquation').innerHTML = currentProblem.equationHtml;
    const instruction = t(currentProblem.mode === 'identity' ? 'q.identityInstruction' : 'q.solveInstruction');
    $('problemInstruction').innerHTML = instruction;
    $('problemTag').textContent = t(currentProblem.mode === 'basic' ? 'q.tagBasic' : currentProblem.mode === 'quadratic' ? 'q.tagQuadratic' : 'q.tagIdentity');
    $('solutionTitle').textContent = t(currentProblem.mode === 'identity' ? 'q.model' : 'q.circle');
  }

  function resetStepAnimation() {
    stepTimers.forEach((timer) => clearTimeout(timer));
    stepTimers = [];
    stepsShown = false;
    revealedSolutions = false;
    $('stepsList').innerHTML = '';
    $('stepsBtn').querySelector('span').textContent = t('q.showSteps');
  }

  function addStepItem(step, index) {
    const li = document.createElement('li');
    li.style.setProperty('--i', 0);
    li.innerHTML = `<span class="step-num">${index + 1}</span><span>${state.lang === 'th' ? step.th : step.en}</span>`;
    $('stepsList').appendChild(li);
  }

  function revealSteps() {
    if (!currentProblem) return;
    if (stepsShown) {
      resetStepAnimation();
      renderPracticeCanvas();
      return;
    }
    stepsShown = true;
    $('stepsBtn').querySelector('span').textContent = t('q.hideSteps');
    $('stepsList').innerHTML = '';
    currentProblem.steps.forEach((step, i) => {
      const timer = setTimeout(() => {
        addStepItem(step, i);
        if (step.reveal) revealedSolutions = true;
        renderPracticeCanvas();
      }, i * 680);
      stepTimers.push(timer);
    });
  }

  function renderStepsInstant() {
    if (!stepsShown || !currentProblem) return;
    $('stepsList').innerHTML = '';
    currentProblem.steps.forEach((step, i) => addStepItem(step, i));
    $('stepsBtn').querySelector('span').textContent = t('q.hideSteps');
  }

  function renderOptions() {
    const grid = $('optionsGrid');
    grid.innerHTML = '';
    if (!currentProblem || currentProblem.mode !== 'identity') return;
    currentProblem.options.forEach((html) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.innerHTML = html;
      if (answered) {
        btn.disabled = true;
        if (html === currentProblem.answer) btn.classList.add('is-correct');
        else if (html === selectedOption) btn.classList.add('is-wrong');
        else btn.classList.add('is-dim');
      } else {
        btn.addEventListener('click', () => chooseIdentityOption(html));
      }
      grid.appendChild(btn);
    });
  }

  function showFeedback() {
    const el = $('feedback');
    if (!answered) { el.hidden = true; el.textContent = ''; return; }
    el.hidden = false;
    el.className = `feedback ${lastCorrect ? 'is-good' : 'is-bad'}`;
    el.textContent = lastCorrect
      ? `✅ ${t('q.correctMsg')} ${currentProblem.mode === 'identity' ? currentProblem.answer : currentProblem.answerText}`
      : `❌ ${t('q.wrongMsg')}`;
  }

  function handleResult(correct, display) {
    answered = true;
    lastCorrect = correct;
    state.practice.attempts += 1;
    if (correct) {
      state.practice.correct += 1;
      state.practice.streak += 1;
      state.practice.best = Math.max(state.practice.best, state.practice.streak);
      state.practice.byMode[currentProblem.mode] += 1;
      state.completed.solver = true;
      revealedSolutions = true;
      const fresh = syncBadges();
      if (fresh.length) {
        const badge = BADGES.find((b) => b.id === fresh[0]);
        setTimeout(() => toast(`🏅 ${t('q.badgeUnlocked')}: ${t(badge.key)}`), 350);
      }
    } else {
      state.practice.streak = 0;
    }
    renderPracticeProgress();
    showFeedback();
    renderPracticeCanvas();
    saveState();
  }

  function chooseIdentityOption(html) {
    if (answered || !currentProblem) return;
    selectedOption = html;
    const correct = html === currentProblem.answer;
    handleResult(correct);
    renderOptions();
    renderProblemStepsInstantOnAnswer();
  }

  function renderProblemStepsInstantOnAnswer() {
    if (!currentProblem) return;
    stepsShown = true;
    $('stepsBtn').querySelector('span').textContent = t('q.hideSteps');
    renderStepsInstant();
    if (currentProblem.mode === 'identity') {
      revealedSolutions = false;
    }
    renderPracticeCanvas();
  }

  function parseAngleTerm(raw) {
    let s = String(raw).trim().toLowerCase().replace(/\s+/g, '').replace(/−/g, '-');
    if (!s) return NaN;
    if (s.endsWith('°')) {
      const v = Number(s.slice(0, -1));
      return Number.isFinite(v) ? rad(v) : NaN;
    }
    const piMatch = s.match(/^(-?\d*\.?\d*)\*?(?:π|pi)(?:\/(\d+))?$/);
    if (piMatch) {
      const c = piMatch[1] === '' || piMatch[1] === '+' ? 1 : piMatch[1] === '-' ? -1 : Number(piMatch[1]);
      const d = piMatch[2] ? Number(piMatch[2]) : 1;
      return Number.isFinite(c) && d !== 0 ? (c * PI) / d : NaN;
    }
    const v = Number(s);
    return Number.isFinite(v) ? v : NaN;
  }

  function parseSolutions(raw) {
    return String(raw)
      .split(/[,;]+/)
      .map((part) => parseAngleTerm(part))
      .filter((v) => Number.isFinite(v))
      .map((v) => ((v % TAU) + TAU) % TAU);
  }

  function sameSolutionSet(given, expected) {
    if (given.length !== expected.length) return false;
    const used = new Array(expected.length).fill(false);
    return given.every((g) => {
      const idx = expected.findIndex((e, i) => !used[i] && (Math.abs(g - e) < 0.02 || Math.abs(Math.abs(g - e) - TAU) < 0.02));
      if (idx < 0) return false;
      used[idx] = true;
      return true;
    });
  }

  function handleCheck() {
    if (!currentProblem || answered || currentProblem.mode === 'identity') return;
    const given = parseSolutions($('answerInput').value);
    if (!given.length) {
      const el = $('feedback');
      el.hidden = false;
      el.className = 'feedback is-bad';
      el.textContent = t('q.invalid');
      return;
    }
    const expected = currentProblem.solutions.map((a) => ((a % TAU) + TAU) % TAU);
    const correct = sameSolutionSet(given, expected);
    $('answerInput').disabled = true;
    $('checkBtn').disabled = true;
    handleResult(correct);
  }

  function newProblem() {
    resetStepAnimation();
    answered = false;
    lastCorrect = false;
    selectedOption = null;
    $('answerInput').disabled = false;
    $('checkBtn').disabled = false;
    $('answerInput').value = '';
    $('feedback').hidden = true;
    $('feedback').textContent = '';
    $('optionsGrid').hidden = true;
    $('answerForm').hidden = false;
    $('answerHint').hidden = false;

    const mode = state.practice.mode;
    currentProblem = mode === 'basic' ? genBasicProblem() : mode === 'quadratic' ? genQuadraticProblem() : genIdentityProblem();
    if (mode === 'identity') {
      $('answerForm').hidden = true;
      $('answerHint').hidden = true;
      $('optionsGrid').hidden = false;
    }
    renderProblemText();
    renderOptions();
    renderPracticeCanvas();
    scheduleSave();
  }

  function renderPracticeLocale() {
    if (!currentProblem) return;
    renderProblemText();
    if (answered) showFeedback();
    if (stepsShown) renderStepsInstant();
  }

  document.querySelectorAll('.mode-btn[data-qmode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.practice.mode = btn.dataset.qmode;
      document.querySelectorAll('.mode-btn[data-qmode]').forEach((b) => b.classList.toggle('is-active', b === btn));
      newProblem();
      saveState();
    });
  });

  $('newProblemBtn').addEventListener('click', newProblem);
  $('stepsBtn').addEventListener('click', revealSteps);
  $('answerForm').addEventListener('submit', (event) => {
    event.preventDefault();
    handleCheck();
  });

  /* ------------------------------ progress ------------------------------- */
  function masteryPercent() {
    return Math.min(100, Math.round((state.practice.correct / 15) * 100));
  }

  function renderBadges() {
    const grid = $('badgeGrid');
    if (!grid) return;
    grid.innerHTML = BADGES.map((b) => {
      const earned = state.practice.badges.includes(b.id);
      return `<div class="badge ${earned ? 'is-earned' : ''}" title="${escapeHtml(t(b.key))}">
        <span class="badge-icon" aria-hidden="true">${b.icon}</span>
        <span class="badge-name">${escapeHtml(t(b.key))}</span>
      </div>`;
    }).join('');
  }

  function syncBadges() {
    const before = new Set(state.practice.badges);
    const earned = BADGES.filter((b) => b.test(state.practice)).map((b) => b.id);
    state.practice.badges = Array.from(new Set([...state.practice.badges, ...earned]));
    return earned.filter((id) => !before.has(id));
  }

  function renderPracticeProgress() {
    const p = state.practice;
    const pct = masteryPercent();
    $('streakValue').textContent = String(p.streak);
    $('bestValue').textContent = String(p.best);
    $('masteryValue').textContent = `${pct}%`;
    $('quizStreak').textContent = String(p.streak);
    $('quizBest').textContent = String(p.best);
    $('quizCorrect').textContent = String(p.correct);
    $('quizMastery').textContent = `${pct}%`;
    $('masteryFill').style.width = `${pct}%`;
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.classList.toggle('is-done', Boolean(state.completed[tab.dataset.module]));
    });
    renderBadges();
  }

  /* ------------------------------ modules -------------------------------- */
  function completeModule(id) {
    if (!state.completed[id]) {
      state.completed[id] = true;
      renderPracticeProgress();
      scheduleSave();
    }
  }

  function showModule(id) {
    state.lastModule = id;
    document.querySelectorAll('.tab').forEach((tab) => {
      const active = tab.dataset.module === id;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll('.panel').forEach((panel) => {
      const active = panel.id === `panel-${id}`;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });

    if (id === 'inverse') requestAnimationFrame(() => invStage.resize());
    else if (id === 'identity') requestAnimationFrame(() => modelStage.resize());
    else if (id === 'solver') requestAnimationFrame(() => solutionStage.resize());
    scheduleSave();
  }

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => showModule(tab.dataset.module));
    tab.addEventListener('keydown', (event) => {
      const tabs = Array.from(document.querySelectorAll('.tab'));
      const index = tabs.indexOf(tab);
      let next = null;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      if (next !== null) {
        event.preventDefault();
        tabs[next].focus();
        showModule(tabs[next].dataset.module);
      }
    });
  });

  /* ------------------------------- i18n ---------------------------------- */
  function applyI18n() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const value = t(el.dataset.i18n);
      if (value) el.textContent = value;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const value = t(el.dataset.i18nPlaceholder);
      if (value) el.placeholder = value;
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const value = t(el.dataset.i18nTitle);
      if (value) el.title = value;
    });
    $('langLabel').textContent = state.lang === 'en' ? 'EN ⇄ TH' : 'TH ⇄ EN';
    $('langToggle').setAttribute('aria-label', state.lang === 'en' ? 'Switch language to Thai' : 'เปลี่ยนภาษาเป็นอังกฤษ');

    renderInverse();
    renderIdentity();
    renderPracticeLocale();
    renderPracticeProgress();
    drawInverse();
    drawModelCanvas();
    renderPracticeCanvas();
  }

  $('langToggle').addEventListener('click', () => {
    state.lang = state.lang === 'en' ? 'th' : 'en';
    applyI18n();
    saveState();
    toast(state.lang === 'th' ? 'เปลี่ยนภาษาเป็นภาษาไทยแล้ว' : 'Language switched to English');
  });

  /* ------------------------------ export --------------------------------- */
  function buildExport() {
    return {
      app: 'Khan Trig Companion — Unit 4 Equations & Identities Studio',
      stateVersion: STATE_VERSION,
      exportedAt: new Date().toISOString(),
      language: state.lang,
      lastModule: state.lastModule,
      masteryPercent: masteryPercent(),
      progress: {
        streak: state.practice.streak,
        bestStreak: state.practice.best,
        totalCorrect: state.practice.correct,
        totalAttempts: state.practice.attempts,
        correctByMode: state.practice.byMode,
        badges: state.practice.badges.map((id) => {
          const badge = BADGES.find((b) => b.id === id);
          return { id, name: badge ? t(badge.key) : id };
        }),
        modulesCompleted: state.completed
      },
      settings: {
        inverse: state.inverse,
        identity: state.identity
      },
      credits: {
        builtWith: 'OpenCode',
        model: 'DeepSeek V4.1 Flash (opencode-go/deepseek-v4.1-flash)'
      }
    };
  }

  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(buildExport(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'khan_trig_unit4_progress.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast(t('exportDone'));
  });

  /* ------------------------------- boot ---------------------------------- */
  function init() {
    if (!FUNCS[state.inverse.fn]) state.inverse.fn = 'sin';
    const fn = FUNCS[state.inverse.fn];
    state.inverse.minK = clamp(Math.round(Number(state.inverse.minK) || fn.minK), -24, 24);
    state.inverse.maxK = clamp(Math.round(Number(state.inverse.maxK) || fn.maxK), -24, 24);
    state.inverse.input = clamp(Number(state.inverse.input) || fn.input, fn.inputMin, fn.inputMax);

    if (!EXPRESSIONS.some((e) => e.id === state.identity.expr)) state.identity.expr = EXPRESSIONS[0].id;
    const expr = expressionById(state.identity.expr);
    state.identity.step = clamp(Math.round(Number(state.identity.step) || 0), 0, expr.steps.length);
    state.identity.done = Boolean(state.identity.done) || state.identity.step >= expr.steps.length;

    if (!['basic', 'quadratic', 'identity'].includes(state.practice.mode)) state.practice.mode = 'basic';
    if (!['inverse', 'identity', 'solver'].includes(state.lastModule)) state.lastModule = 'inverse';

    document.querySelectorAll('.mode-btn[data-qmode]').forEach((b) => b.classList.toggle('is-active', b.dataset.qmode === state.practice.mode));

    syncBadges();
    applyI18n();
    showModule(state.lastModule);
    newProblem();
    renderPracticeProgress();
    saveState();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        drawInverse();
        drawModelCanvas();
        renderPracticeCanvas();
      }).catch(() => {});
    }
  }

  window.addEventListener('beforeunload', saveState);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveState(); });

  init();
})();
