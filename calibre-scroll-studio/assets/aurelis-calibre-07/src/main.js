import * as THREE from 'three';
import { createStudioEnvironment, createMaterials } from './environment.js';
import { createWatch } from './watch.js';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

const canvas = document.getElementById('scene');
const stage = document.getElementById('stage');
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderCaption = document.getElementById('loader-caption');
const calloutRoot = document.getElementById('callouts');
const hint = document.getElementById('stage-hint');
const railFill = document.getElementById('rail-fill');
const railItems = [...document.querySelectorAll('[data-chapter-link]')];
const chapters = [...document.querySelectorAll('[data-chapter]')];
const dialog = document.getElementById('enquiry');
const enquiryForm = document.getElementById('enquiry-form');
const enquirySent = document.getElementById('enquiry-sent');
const enquiryError = document.getElementById('enquiry-error');
const colophon = document.getElementById('colophon');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const params = new URLSearchParams(window.location.search);
const forcedT = params.has('t') ? clamp(Number.parseFloat(params.get('t')) || 0) : null;
const stillMode = params.has('still') || forcedT !== null;

const CHAPTER_T = [0, 0.25, 0.5, 0.75, 1];
const chapterAnchors = [];

const state = {
  ready: false,
  progress: 0,
  target: prefersReducedMotion || forcedT !== null ? 0 : 0,
  elapsed: 0,
  manual: forcedT !== null,
  portrait: false,
  pointerX: 0,
  pointerY: 0,
  pointerTargetX: 0,
  pointerTargetY: 0,
  dragX: 0,
  dragY: 0,
  dragTargetX: 0,
  dragTargetY: 0,
  dragging: false,
  lastPointerX: 0,
  lastPointerY: 0,
  baseGroupY: 0,
  baseGroupX: 0.55,
  baseScale: 0.92,
};

let renderer;
let scene;
let camera;
let watch;
let lastTime = 0;
let firstFrame = true;

const labelConfig = {
  crystal: { range: [0.115, 0.31], dy: -64, gap: 44 },
  barrel: { range: [0.35, 0.58], dy: 42, gap: 34 },
  balance: { range: [0.38, 0.62], dy: -18, gap: 40 },
  caseband: { range: [0.52, 0.78], dy: -24, gap: 44 },
  rotor: { range: [0.57, 0.84], dy: 40, gap: 44 },
};

const labels = new Map();
if (calloutRoot) {
  for (const el of calloutRoot.querySelectorAll('[data-label]')) {
    labels.set(el.dataset.label, el);
  }
}

/* ------------------------------------------------------------------ *
 * Camera choreography
 * ------------------------------------------------------------------ */

const CAMERA_KEYS = [
  { t: 0.0, az: 0.34, el: 0.06, dist: 4.8, tx: 0.06, ty: 0.0 },
  { t: 0.14, az: 0.3, el: 0.1, dist: 4.62, tx: 0.07, ty: 0.01 },
  { t: 0.25, az: 0.33, el: 0.13, dist: 4.8, tx: 0.06, ty: 0.03 },
  { t: 0.36, az: 0.42, el: 0.18, dist: 5.7, tx: 0.07, ty: 0.06 },
  { t: 0.5, az: 0.45, el: 0.22, dist: 6.1, tx: 0.08, ty: 0.1 },
  { t: 0.64, az: 0.5, el: 0.24, dist: 6.45, tx: 0.09, ty: 0.12 },
  { t: 0.75, az: 0.52, el: 0.24, dist: 6.8, tx: 0.09, ty: 0.12 },
  { t: 0.86, az: 0.42, el: 0.15, dist: 6.05, tx: 0.08, ty: 0.06 },
  { t: 0.94, az: 0.33, el: 0.08, dist: 5.2, tx: 0.06, ty: 0.02 },
  { t: 1.0, az: 0.3, el: 0.05, dist: 4.72, tx: 0.06, ty: 0.0 },
];

const WATCH_ROT_Y = [
  { t: 0.0, y: 0.06 },
  { t: 0.2, y: 0.02 },
  { t: 0.35, y: -0.1 },
  { t: 0.5, y: -0.22 },
  { t: 0.66, y: -0.22 },
  { t: 0.75, y: -0.2 },
  { t: 0.86, y: -0.1 },
  { t: 0.94, y: -0.02 },
  { t: 1.0, y: 0.06 },
];

function sampleKeyframes(keys, t, fields) {
  const p = clamp(t);
  let index = 0;
  while (index < keys.length - 2 && p > keys[index + 1].t) index += 1;
  const a = keys[index];
  const b = keys[index + 1];
  const raw = (p - a.t) / Math.max(0.0001, b.t - a.t);
  const u = smooth(0, 1, clamp(raw));
  const out = {};
  for (const field of fields) out[field] = a[field] + (b[field] - a[field]) * u;
  return out;
}

/* ------------------------------------------------------------------ *
 * Layout
 * ------------------------------------------------------------------ */

function applyLayout() {
  if (!watch) return;
  const width = stage.clientWidth || window.innerWidth;
  const height = stage.clientHeight || window.innerHeight;
  const portrait = width < 900 || width / height < 0.82;
  state.portrait = portrait;

  watch.group.position.set(portrait ? 0 : 0.55, portrait ? 0.58 : -0.02, 0);
  state.baseScale = portrait ? 0.7 : 0.92;
  watch.group.scale.setScalar(state.baseScale);
  state.baseGroupY = watch.group.position.y;
  state.baseGroupX = watch.group.position.x;
}

function measureChapters() {
  const vh = window.innerHeight;
  chapterAnchors.length = 0;
  for (const chapter of chapters) {
    chapterAnchors.push(chapter.offsetTop + chapter.offsetHeight / 2 - vh / 2);
  }
}

function scrollProgress() {
  if (chapterAnchors.length < 2) return 0;
  const first = chapterAnchors[0];
  const last = chapterAnchors[chapterAnchors.length - 1];
  return clamp((window.scrollY - first) / Math.max(1, last - first));
}

/* ------------------------------------------------------------------ *
 * Build
 * ------------------------------------------------------------------ */

function buildScene() {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  scene = new THREE.Scene();
  scene.environment = createStudioEnvironment(renderer);

  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

  const materials = createMaterials();
  watch = createWatch(materials);
  scene.add(watch.group);

  const keyLight = new THREE.DirectionalLight(0xffe0b0, 2.4);
  keyLight.position.set(-3.5, 4.5, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x9dbdff, 1.5);
  rimLight.position.set(4, -2.5, -5);
  scene.add(rimLight);

  const bounce = new THREE.DirectionalLight(0xffd9a0, 0.7);
  bounce.position.set(-2, -4, 2);
  scene.add(bounce);

  const frontFill = new THREE.DirectionalLight(0xfff4e4, 0.55);
  frontFill.position.set(1.5, 2.5, 6);
  scene.add(frontFill);

  const rotorFill = new THREE.DirectionalLight(0xffcf8a, 1.15);
  rotorFill.position.set(0, -4, 3.5);
  scene.add(rotorFill);

  scene.add(new THREE.AmbientLight(0xffffff, 0.16));

  applyLayout();
  resize();
}

function resize() {
  const width = stage.clientWidth || window.innerWidth;
  const height = stage.clientHeight || window.innerHeight;
  if (!renderer || !camera) return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(1, height);
  camera.updateProjectionMatrix();
  applyLayout();
  measureChapters();
  updateInterface(state.progress);
}

/* ------------------------------------------------------------------ *
 * Per-frame update
 * ------------------------------------------------------------------ */

function applyCamera(t, elapsed) {
  const portrait = state.portrait;
  const cam = sampleKeyframes(CAMERA_KEYS, t, ['az', 'el', 'dist', 'tx', 'ty']);
  const watchRot = sampleKeyframes(WATCH_ROT_Y, t, ['y']);

  const dist = cam.dist + (portrait ? 1.45 : 0);
  const targetY = cam.ty + (portrait ? 0.2 : 0);
  const target = new THREE.Vector3(cam.tx, targetY, 0);

  const az = cam.az + clamp(state.pointerX * 0.16, -0.08, 0.08);
  const el = clamp(cam.el + state.pointerY * 0.08, -0.03, 0.5);

  camera.position.set(
    target.x + Math.sin(az) * Math.cos(el) * dist,
    target.y + Math.sin(el) * dist,
    Math.cos(az) * Math.cos(el) * dist,
  );
  camera.lookAt(target);

  const idle = prefersReducedMotion || stillMode ? 0 : 1;
  const float = Math.sin(elapsed * 0.55) * 0.012 * idle;
  const sway = Math.sin(elapsed * 0.31) * 0.012 * idle;

  const exposure = smooth(0.18, 0.5, t) * (1 - smooth(0.84, 0.99, t));
  const finale = state.portrait ? smooth(0.88, 0.995, t) : 0;
  const lift = state.portrait ? exposure * 0.38 + finale * 0.55 : 0;
  watch.group.position.y = (state.baseGroupY ?? watch.group.position.y) + float + lift;
  watch.group.position.x = (state.baseGroupX ?? watch.group.position.x) + exposure * 0.1;
  watch.group.scale.setScalar(
    (state.baseScale || 0.92) * (1 - exposure * 0.2) * (1 - finale * 0.16),
  );
  watch.group.rotation.set(
    state.dragX + state.pointerY * 0.035,
    watchRot.y + state.dragY + state.pointerX * 0.05 + sway,
    0,
  );
}

function updateInterface(t) {
  const width = stage.clientWidth || window.innerWidth;

  // Chapters: only the closest block of copy is readable at a time.
  chapters.forEach((chapter, index) => {
    const centre = CHAPTER_T[index];
    const opacity =
      smooth(centre - 0.078, centre - 0.028, t) * (1 - smooth(centre + 0.028, centre + 0.078, t));
    const visible = opacity > 0.02;
    chapter.style.opacity = opacity.toFixed(3);
    chapter.style.transform = `translate3d(0, ${((centre - t) * 120).toFixed(1)}px, 0)`;
    chapter.style.visibility = visible ? 'visible' : 'hidden';
    chapter.classList.toggle('is-active', opacity > 0.55);
    const interactive = opacity > 0.55;
    if (interactive) chapter.removeAttribute('inert');
    else chapter.setAttribute('inert', '');
  });

  // Rail.
  const activeIndex = clamp(Math.round(t * 4), 0, 4);
  railItems.forEach((item, index) => item.classList.toggle('is-active', index === activeIndex));
  if (railFill) railFill.style.transform = `scaleY(${clamp(t).toFixed(4)})`;
  if (hint) hint.classList.toggle('is-hidden', t > 0.08);

  // Floating callouts, placed against a simple collision grid.
  const heading = new THREE.Vector3();
  const height = stage.clientHeight || window.innerHeight;
  const placed = [];
  const cardWidth = 182;
  const cardHeight = 36;

  for (const [name, el] of labels) {
    const anchor = watch.anchors[name];
    const config = labelConfig[name];
    if (!anchor || !config) continue;

    anchor.object.getWorldPosition(heading);
    heading.add(anchor.offset);
    heading.project(camera);

    const visible = heading.z < 1;
    const x = (heading.x * 0.5 + 0.5) * width;
    const y = (-heading.y * 0.5 + 0.5) * height;
    const fade =
      smooth(config.range[0], config.range[0] + 0.035, t) *
      (1 - smooth(config.range[1] - 0.035, config.range[1], t));

    if (!visible || fade < 0.015) {
      el.style.opacity = '0';
      continue;
    }

    const flip = x > width - 250;
    let placement = null;

    for (const nudge of [0, 48, -48, 96, -96]) {
      const dy = config.dy + nudge;
      const box = {
        x: flip ? x - config.gap - cardWidth : x + config.gap,
        y: y + dy - 14,
        w: cardWidth,
        h: cardHeight,
      };
      const inside = box.y > 64 && box.y + cardHeight < height - 36;
      const clashes = placed.some(
        (other) =>
          !(
            box.x + box.w < other.x - 10 ||
            box.x > other.x + other.w + 10 ||
            box.y + box.h < other.y - 10 ||
            box.y > other.y + other.h + 10
          ),
      );
      if (inside && !clashes) {
        placement = { dy, box };
        break;
      }
    }

    if (!placement) {
      placement = {
        dy: config.dy,
        box: {
          x: flip ? x - config.gap - cardWidth : x + config.gap,
          y: y + config.dy - 14,
          w: cardWidth,
          h: cardHeight,
        },
      };
    }

    placed.push(placement.box);
    el.classList.toggle('is-flipped', flip);
    const dx = flip ? -config.gap : config.gap;
    el.style.transform = `translate3d(${(x + dx).toFixed(1)}px, ${(y + placement.dy).toFixed(1)}px, 0)`;
    el.style.opacity = fade.toFixed(3);
  }
}

function applyProgress(t, elapsed) {
  if (!watch) return;
  watch.update(t, prefersReducedMotion ? 0 : elapsed);
  applyCamera(t, elapsed);
  updateInterface(t);
}

/* ------------------------------------------------------------------ *
 * Render loop
 * ------------------------------------------------------------------ */

function frame(now) {
  requestAnimationFrame(frame);
  if (!renderer) return;

  const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
  lastTime = now;
  state.elapsed += dt;

  if (!state.manual) state.target = scrollProgress();

  if (prefersReducedMotion) state.progress = state.target;
  else state.progress += (state.target - state.progress) * (1 - Math.exp(-dt * 5.6));
  if (Math.abs(state.target - state.progress) < 0.0004) state.progress = state.target;

  // Damped pointer / drag offsets.
  state.pointerX += (state.pointerTargetX - state.pointerX) * (1 - Math.exp(-dt * 3.6));
  state.pointerY += (state.pointerTargetY - state.pointerY) * (1 - Math.exp(-dt * 3.6));
  state.dragX += (state.dragTargetX - state.dragX) * (1 - Math.exp(-dt * 7));
  state.dragY += (state.dragTargetY - state.dragY) * (1 - Math.exp(-dt * 7));

  applyProgress(state.progress, state.elapsed);
  renderer.render(scene, camera);

  if (firstFrame) {
    firstFrame = false;
    finishLoading();
  }
}

function finishLoading() {
  if (state.ready) return;
  state.ready = true;
  if (loaderBar) loaderBar.style.animationPlayState = 'running';
  if (loaderCaption) loaderCaption.textContent = 'Calibre assembled';
  window.setTimeout(() => loader.classList.add('is-done'), 260);
  window.setTimeout(() => {
    loader.hidden = true;
  }, 1200);
  window.AURELIS.ready = true;
  window.dispatchEvent(new CustomEvent('aurelis:ready'));
}

/* ------------------------------------------------------------------ *
 * Pointer inspection
 * ------------------------------------------------------------------ */

function bindInspection() {
  canvas.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') return;
    state.dragging = true;
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;
    canvas.classList.add('is-dragging');
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  canvas.addEventListener('pointermove', (event) => {
    const rect = stage.getBoundingClientRect();
    state.pointerTargetX = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
    state.pointerTargetY = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);

    if (!state.dragging) return;
    const dx = event.clientX - state.lastPointerX;
    const dy = event.clientY - state.lastPointerY;
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;
    state.dragTargetY = clamp(state.dragTargetY + dx * 0.0035, -0.7, 0.7);
    state.dragTargetX = clamp(state.dragTargetX - dy * 0.0025, -0.35, 0.35);
  });

  const release = () => {
    state.dragging = false;
    canvas.classList.remove('is-dragging');
  };

  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => {
    state.pointerTargetX = 0;
    state.pointerTargetY = 0;
    if (!state.dragging) return;
    release();
  });

  window.addEventListener('blur', release);
}

/* ------------------------------------------------------------------ *
 * Navigation and dialog
 * ------------------------------------------------------------------ */

function bindNavigation() {
  document.querySelectorAll('a[href^="#chapter-"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      const index = chapters.indexOf(target);
      const top = index >= 0 ? chapterAnchors[index] : target.offsetTop;
      window.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  const wordmark = document.querySelector('.wordmark');
  if (wordmark) {
    wordmark.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }
}

function resetDialog() {
  if (!enquiryForm) return;
  enquiryForm.hidden = false;
  if (enquirySent) enquirySent.hidden = true;
  if (enquiryError) enquiryError.hidden = true;
}

function bindDialog() {
  if (colophon) {
    document.querySelectorAll('[data-open-colophon]').forEach((button) => {
      button.addEventListener('click', () => {
        if (typeof colophon.showModal === 'function') colophon.showModal();
        else colophon.setAttribute('open', '');
      });
    });

    document.querySelectorAll('[data-close-colophon]').forEach((button) => {
      button.addEventListener('click', () => colophon.close());
    });

    colophon.addEventListener('click', (event) => {
      if (event.target === colophon) colophon.close();
    });

    colophon.addEventListener('cancel', () => colophon.close());
  }

  if (!dialog) return;

  document.querySelectorAll('[data-open-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
      resetDialog();
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    });
  });

  document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('cancel', () => dialog.close());

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(enquiryForm);
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const valid = name.length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!valid) {
        enquiryError.hidden = false;
        const firstInvalid = enquiryForm.querySelector('input:invalid, input[name="name"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      enquiryForm.hidden = true;
      if (enquirySent) enquirySent.hidden = false;
      const close = enquirySent?.querySelector('[data-close-dialog]');
      if (close) close.focus();
    });

    enquiryForm.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        if (enquiryError) enquiryError.hidden = true;
      });
    });
  }
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

async function waitForFonts() {
  if (!document.fonts) return;
  const timeout = new Promise((resolve) => setTimeout(resolve, 1800));
  const fonts = Promise.allSettled([
    document.fonts.load('400 62px "Bodoni Moda"'),
    document.fonts.load('italic 400 62px "Bodoni Moda"'),
  ]);
  await Promise.race([fonts, timeout]);
}

function exposeApi() {
  window.AURELIS = {
    ready: false,
    get progress() {
      return state.progress;
    },
    get exploded() {
      if (!watch) return 0;
      return Math.max(
        ...watch.parts.map((part) => {
          const distance = part.object.position.distanceTo(part.basePosition);
          return part.delta.length() ? clamp(distance / part.delta.length()) : 0;
        }),
      );
    },
    setProgress(value) {
      state.manual = true;
      state.target = clamp(Number(value) || 0);
      state.progress = state.target;
      applyProgress(state.progress, state.elapsed);
      if (renderer) renderer.render(scene, camera);
    },
    release() {
      state.manual = false;
    },
    parts() {
      return watch
        ? watch.parts.map((part) => ({
            name: part.name,
            position: part.object.position.toArray(),
            base: part.basePosition.toArray(),
          }))
        : [];
    },
    scene: () => ({ renderer, scene, camera, watch }),
  };
}

async function boot() {
  exposeApi();
  bindInspection();
  bindNavigation();
  bindDialog();

  await waitForFonts();

  try {
    buildScene();
  } catch (error) {
    console.error('[aurelis] WebGL unavailable', error);
    loader.classList.add('is-done');
    loader.hidden = true;
    const fallback = document.getElementById('stage-fallback');
    if (fallback) fallback.hidden = false;
    document.body.classList.add('no-webgl');
    return;
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('orientationchange', () => window.setTimeout(resize, 240));

  measureChapters();
  state.target = forcedT !== null ? forcedT : scrollProgress();
  state.progress = state.target;
  updateInterface(state.progress);

  if (forcedT !== null) {
    state.manual = true;
    const first = chapterAnchors[0] ?? 0;
    const last = chapterAnchors[chapterAnchors.length - 1] ?? 0;
    window.scrollTo({
      top: Math.max(0, first + (last - first) * forcedT),
      behavior: 'instant',
    });
  }

  requestAnimationFrame(frame);
}

boot();
