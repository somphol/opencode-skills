/**
 * Release gate for Aurelis Calibre 07.
 *
 * Serves the static site, drives it in headless Chrome, and checks the
 * scroll timeline, the exploded watch, labels, dialog, mobile layout,
 * reduced motion and rendering budget. Screenshots are written to
 * screenshots/ for the release notes.
 */
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4175;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const OUT = join(ROOT, 'screenshots');
const CHROME =
  process.env.CHROME_PATH ||
  ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(
    existsSync,
  );

if (!CHROME) {
  console.error('Chrome not found. Set CHROME_PATH.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
};

const server = http.createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(req.url.split('?')[0]);
    const file = normalize(join(ROOT, path === '/' ? 'index.html' : path));
    if (!file.startsWith(ROOT)) throw new Error('outside root');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
await mkdir(OUT, { recursive: true });

const results = [];
const failures = [];
let checks = 0;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function check(name, fn, { optional = false } = {}) {
  checks += 1;
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail });
    console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (error) {
    if (optional) {
      console.log(`  – ${name} (optional): ${error.message}`);
      return;
    }
    failures.push({ name, error: error.message });
    console.log(`  ✗ ${name}\n      ${error.message}`);
  }
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars', '--enable-unsafe-swiftshader', '--use-angle=metal'],
});

const consoleErrors = [];
const pageErrors = [];

function watchPage(page, tag = '') {
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      consoleErrors.push(`[${tag}] ${msg.text()}`);
    }
  });
  page.on('pageerror', (error) => pageErrors.push(`[${tag}] ${error.message}`));
}

async function waitReady(page) {
  await page.waitForFunction('window.AURELIS && window.AURELIS.ready === true', { timeout: 40000 });
  await page.waitForFunction('document.getElementById("loader").hidden === true', { timeout: 6000 });
}

console.log('\nAurelis Calibre 07 — release verification\n');

/* ------------------------------------------------------------------ */
/* Desktop, actual scrolling                                           */
/* ------------------------------------------------------------------ */

const page = await browser.newPage();
watchPage(page, 'desktop');
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });

const requests = [];
page.on('request', (request) => requests.push(request.url()));

await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle0' });
await waitReady(page);

await check('document and title', async () => {
  const title = await page.title();
  assert(title.includes('Aurelis'), `unexpected title: ${title}`);
  const h1s = await page.$$eval('h1', (els) => els.length);
  assert(h1s === 1, `expected one h1, got ${h1s}`);
  return title;
});

await check('five chapters and five rail links', async () => {
  const chapters = await page.$$eval('[data-chapter]', (els) => els.map((el) => el.id));
  const links = await page.$$eval('[data-chapter-link]', (els) => els.length);
  assert(chapters.length === 5, `got ${chapters.length} chapters`);
  assert(links === 5, `got ${links} rail links`);
  return chapters.join(', ');
});

await check('no external runtime requests', async () => {
  const external = requests.filter((url) => {
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('about:')) return false;
    return !url.startsWith(ORIGIN);
  });
  assert(external.length === 0, `external requests: ${external.join(', ')}`);
  return 'all assets local';
});

await check('WebGL renderer is live', async () => {
  const info = await page.evaluate(() => {
    const canvas = document.getElementById('scene');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const size = { w: canvas.width, h: canvas.height };
    const renderer = gl?.getParameter(gl.RENDERER) || 'none';
    return { gl: Boolean(gl), size, renderer };
  });
  assert(info.gl, 'no WebGL context');
  assert(info.size.w > 0 && info.size.h > 0, 'zero canvas');
  return `${info.size.w}×${info.size.h} · ${info.renderer}`;
});

await check('hero starts assembled at scroll 0', async () => {
  const state = await page.evaluate(() => ({
    progress: window.AURELIS.progress,
    exploded: window.AURELIS.exploded,
    scrollY: window.scrollY,
    heroOpacity: getComputedStyle(document.getElementById('chapter-hero')).opacity,
  }));
  assert(state.scrollY === 0, `scrollY is ${state.scrollY}`);
  assert(state.progress < 0.01, `progress ${state.progress}`);
  assert(state.exploded < 0.01, `exploded ${state.exploded}`);
  assert(Number(state.heroOpacity) > 0.9, `hero opacity ${state.heroOpacity}`);
  return `progress ${state.progress.toFixed(3)}`;
});

// Scroll by clicking the rail: this exercises the real scroll choreography.
async function clickChapter(index) {
  await page.click(`[data-chapter-link="${index}"]`);
  await page.waitForFunction(
    (target) => Math.abs(window.AURELIS.progress - target) < 0.02,
    { timeout: 12000 },
    [0, 0.25, 0.5, 0.75, 1][index],
  );
  await new Promise((resolve) => setTimeout(resolve, 600));
}

await check('chapter 03 activates the movement copy', async () => {
  await clickChapter(2);
  const state = await page.evaluate(() => {
    const section = document.getElementById('chapter-movement');
    const rect = section.querySelector('.chapter__inner').getBoundingClientRect();
    return {
      progress: window.AURELIS.progress,
      opacity: Number(getComputedStyle(section).opacity),
      inert: section.hasAttribute('inert'),
      scrollY: window.scrollY,
      rectTop: rect.top,
      rectBottom: rect.bottom,
      active: section.classList.contains('is-active'),
    };
  });
  assert(state.progress > 0.47 && state.progress < 0.53, `progress ${state.progress}`);
  assert(state.opacity > 0.9, `movement opacity ${state.opacity}`);
  assert(!state.inert, 'movement section is inert');
  assert(state.rectTop > 100 && state.rectBottom < 900, `copy offscreen ${state.rectTop}..${state.rectBottom}`);
  return `progress ${state.progress.toFixed(3)}, scrollY ${Math.round(state.scrollY)}`;
});

await check('scrolling explodes the calibre', async () => {
  const state = await page.evaluate(() => {
    const parts = window.AURELIS.parts();
    const byName = Object.fromEntries(parts.map((part) => [part.name, part]));
    return {
      exploded: window.AURELIS.exploded,
      dialY: byName.dial.position[1],
      casebandX: byName.caseband.position[0],
      balanceZ: byName.balance.position[2],
      finite: parts.every((part) => part.position.every(Number.isFinite)),
    };
  });
  assert(state.exploded > 0.9, `exploded ${state.exploded}`);
  assert(state.dialY > 1, `dial y ${state.dialY}`);
  assert(state.balanceZ > 0.1, `balance z ${state.balanceZ}`);
  assert(state.finite, 'non-finite transforms');
  return `dial y ${state.dialY.toFixed(2)}, balance z ${state.balanceZ.toFixed(2)}`;
});

await check('hands travel with the lifted dial', async () => {
  const parts = await page.evaluate(() => window.AURELIS.parts());
  const byName = Object.fromEntries(parts.map((part) => [part.name, part]));
  const dial = byName.dial.position;
  for (const name of ['hourhand', 'minutehand', 'secondhand']) {
    const hand = byName[name].position;
    const distance = Math.hypot(hand[0] - dial[0], hand[1] - dial[1]);
    assert(distance < 0.05, `${name} is ${distance.toFixed(2)} from the dial`);
  }
  return 'three hands centred on the dial';
});

await check('full explosion at the case chapter', async () => {
  await clickChapter(3);
  const state = await page.evaluate(() => {
    const byName = Object.fromEntries(window.AURELIS.parts().map((part) => [part.name, part]));
    const labels = [...document.querySelectorAll('.callout')].map((el) => ({
      name: el.dataset.label,
      opacity: Number(getComputedStyle(el).opacity),
      rect: el.querySelector('.callout__text').getBoundingClientRect().toJSON(),
    }));
    const visible = labels.filter((label) => label.opacity > 0.1);
    const overlaps = [];
    for (let i = 0; i < visible.length; i += 1) {
      for (let j = i + 1; j < visible.length; j += 1) {
        const a = visible[i].rect;
        const b = visible[j].rect;
        const hit =
          a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        if (hit) overlaps.push(`${visible[i].name}/${visible[j].name}`);
      }
    }
    return {
      progress: window.AURELIS.progress,
      exploded: window.AURELIS.exploded,
      crystalX: byName.crystal.position[0],
      casebandX: byName.caseband.position[0],
      casebackY: byName.caseback.position[1],
      rotorY: byName.rotor.position[1],
      visibleLabels: visible.map((label) => label.name),
      overlaps,
      rotorGap: Math.abs(
        byName.caseback.position[1] -
          byName.rotor.position[1] -
          (byName.caseback.base[1] - byName.rotor.base[1]),
      ),
    };
  });
  assert(state.progress > 0.72 && state.progress < 0.78, `progress ${state.progress}`);
  assert(state.exploded > 0.95, `exploded ${state.exploded}`);
  assert(state.crystalX < -1, `crystal did not leave with the case (${state.crystalX})`);
  assert(state.casebandX < -1, `caseband did not separate (${state.casebandX})`);
  assert(state.visibleLabels.length >= 2, `only ${state.visibleLabels.length} labels`);
  assert(state.overlaps.length === 0, `labels overlap: ${state.overlaps.join(', ')}`);
  assert(state.rotorGap < 0.05, 'rotor drifted from the caseback');
  return `${state.visibleLabels.join(', ')} · no overlap`;
});

await check('finale reassembles every part', async () => {
  await clickChapter(4);
  await page.waitForFunction('window.AURELIS.progress > 0.98', { timeout: 8000 });
  await new Promise((resolve) => setTimeout(resolve, 700));
  const state = await page.evaluate(() => {
    const parts = window.AURELIS.parts();
    const drift = Math.max(
      ...parts.map((part) =>
        Math.hypot(
          part.position[0] - part.base[0],
          part.position[1] - part.base[1],
          part.position[2] - part.base[2],
        ),
      ),
    );
    return {
      exploded: window.AURELIS.exploded,
      drift,
      sumOpacity: Number(getComputedStyle(document.getElementById('chapter-sum')).opacity),
      price: document.querySelector('.purchase__price')?.textContent.trim(),
    };
  });
  assert(state.exploded < 0.03, `exploded ${state.exploded}`);
  assert(state.drift < 0.05, `part drift ${state.drift}`);
  assert(state.sumOpacity > 0.9, `finale opacity ${state.sumOpacity}`);
  assert(state.price?.includes('CHF'), 'price missing');
  return `max drift ${state.drift.toFixed(3)}`;
});

/* ------------------------------------------------------------------ */
/* Colophon and enquiry dialog                                         */
/* ------------------------------------------------------------------ */

await check('colophon records the one-sentence brief', async () => {
  await page.click('[data-open-colophon]');
  await page.waitForFunction('document.getElementById("colophon").open === true');
  const text = await page.$eval('#colophon', (el) => el.textContent.replace(/\s+/g, ' '));
  assert(text.includes('Build an immersive single-page 3D website'), 'brief missing');
  assert(text.includes('DeepSeek V4.1 Flash'), 'model credit missing');
  assert(text.includes('OpenCode'), 'OpenCode credit missing');
  assert(text.includes('much longer brief'), 'small-prompt experiment note missing');
  await page.screenshot({ path: join(OUT, 'aurelis-colophon.png') });
  await page.click('[data-close-colophon]');
  await page.waitForFunction('document.getElementById("colophon").open === false');
  return 'brief · credits · experiment note';
});

await check('dialog opens, validates and confirms', async () => {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.click('.topbar [data-open-dialog]');
  await page.waitForFunction('document.getElementById("enquiry").open === true');
  await page.click('#enquiry-form button[type="submit"]');
  const errorShown = await page.$eval('#enquiry-error', (el) => !el.hidden);
  assert(errorShown, 'empty submit did not show an error');
  await page.type('input[name="name"]', 'Ada Lovelace');
  await page.type('input[name="email"]', ['ada', 'example.com'].join('@'));
  await page.click('#enquiry-form button[type="submit"]');
  await page.waitForFunction('document.getElementById("enquiry-sent").hidden === false');
  const confirmed = await page.$eval('#enquiry-sent', (el) => el.textContent.includes('We will be in touch'));
  assert(confirmed, 'confirmation did not appear');
  await page.click('#enquiry-sent [data-close-dialog]');
  await page.waitForFunction('document.getElementById("enquiry").open === false');
  return 'validation + confirmation';
});

/* ------------------------------------------------------------------ */
/* Forced timeline states + screenshots                                */
/* ------------------------------------------------------------------ */

const shots = [
  ['hero', 0],
  ['dial', 0.25],
  ['movement', 0.5],
  ['case', 0.75],
  ['finale', 1],
];

for (const [name, t] of shots) {
  const shotPage = await browser.newPage();
  watchPage(shotPage, `shot-${name}`);
  await shotPage.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
  await shotPage.goto(`${ORIGIN}/?t=${t}&still`, { waitUntil: 'networkidle0' });
  await waitReady(shotPage);
  await new Promise((resolve) => setTimeout(resolve, 700));

  await check(`screenshot state “${name}”`, async () => {
    const state = await shotPage.evaluate(() => ({
      progress: window.AURELIS.progress,
      exploded: window.AURELIS.exploded,
      scrollY: window.scrollY,
      activeCopy: [...document.querySelectorAll('.chapter')]
        .filter((el) => Number(getComputedStyle(el).opacity) > 0.5)
        .map((el) => el.id),
      webglLost: document.getElementById('scene').getContext('webgl2')?.isContextLost(),
    }));
    assert(Math.abs(state.progress - t) < 0.02, `progress ${state.progress}`);
    assert(state.webglLost !== true, 'WebGL context lost');
    await shotPage.screenshot({ path: join(OUT, `aurelis-${name}.png`) });
    return `progress ${state.progress.toFixed(2)} · copy ${state.activeCopy.join(', ') || 'none'}`;
  });
  await shotPage.close();
}

/* ------------------------------------------------------------------ */
/* Rendering budget                                                    */
/* ------------------------------------------------------------------ */

await check('rendering budget', async () => {
  await page.evaluate(() => window.AURELIS.setProgress(0.75));
  await new Promise((resolve) => setTimeout(resolve, 400));
  const info = await page.evaluate(() => {
    const renderer = window.AURELIS.scene().renderer;
    return {
      calls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      parts: window.AURELIS.parts().length,
    };
  });
  assert(info.calls < 400, `draw calls ${info.calls}`);
  assert(info.triangles < 600000, `triangles ${info.triangles}`);
  return `${info.calls} calls · ${info.triangles.toLocaleString()} triangles · ${info.parts} parts`;
});

/* ------------------------------------------------------------------ */
/* Mobile                                                              */
/* ------------------------------------------------------------------ */

const mobile = await browser.newPage();
watchPage(mobile, 'mobile');
await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

await mobile.goto(`${ORIGIN}/`, { waitUntil: 'networkidle0' });
await waitReady(mobile);

await check('mobile: no horizontal overflow', async () => {
  const state = await mobile.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    h1: document.querySelector('h1').textContent.trim(),
    railHidden: getComputedStyle(document.querySelector('.rail')).display === 'none',
    factsHidden: getComputedStyle(document.querySelector('.facts')).display === 'none',
    calloutsHidden: getComputedStyle(document.querySelector('.callouts')).display === 'none',
  }));
  assert(state.scrollWidth <= state.innerWidth + 1, `scrollWidth ${state.scrollWidth}`);
  assert(state.railHidden, 'rail should be hidden');
  assert(state.factsHidden, 'facts should be hidden');
  assert(state.calloutsHidden, 'callouts should be hidden');
  return `${state.scrollWidth}px · ${state.h1}`;
});

await check('mobile: hero watch sits above the copy', async () => {
  const rect = await mobile.evaluate(() => {
    const inner = document.querySelector('#chapter-hero .chapter__inner').getBoundingClientRect();
    return { top: inner.top, bottom: inner.bottom, height: window.innerHeight };
  });
  assert(rect.top > 300, `hero copy starts at ${rect.top}`);
  assert(rect.bottom <= rect.height + 2, `hero copy overflows ${rect.bottom}`);
  return `copy starts at ${Math.round(rect.top)}px`;
});

for (const [name, t] of [
  ['movement', 0.5],
  ['finale', 1],
]) {
  await mobile.goto(`${ORIGIN}/?t=${t}&still`, { waitUntil: 'networkidle0' });
  await waitReady(mobile);
  await new Promise((resolve) => setTimeout(resolve, 700));
  await check(`mobile: ${name} composition`, async () => {
    const state = await mobile.evaluate(() => {
      const active = [...document.querySelectorAll('.chapter')].find(
        (el) => Number(getComputedStyle(el).opacity) > 0.5,
      );
      const heading = active?.querySelector('h1,h2')?.getBoundingClientRect();
      return {
        active: active?.id,
        headingTop: heading?.top,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      };
    });
    assert(state.active, 'no active chapter');
    assert(state.scrollWidth <= state.innerWidth + 1, 'horizontal overflow');
    assert(state.headingTop > 330, `heading overlaps the watch (${state.headingTop})`);
    await mobile.screenshot({ path: join(OUT, `aurelis-mobile-${name}.png`) });
    return `heading at ${Math.round(state.headingTop)}px`;
  });
}

/* ------------------------------------------------------------------ */
/* Reduced motion                                                      */
/* ------------------------------------------------------------------ */

const calm = await browser.newPage();
watchPage(calm, 'reduced-motion');
await calm.setViewport({ width: 1280, height: 900 });
await calm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await calm.goto(`${ORIGIN}/`, { waitUntil: 'networkidle0' });
await waitReady(calm);
await check('reduced motion remains usable', async () => {
  const state = await calm.evaluate(() => {
    window.AURELIS.setProgress(0.5);
    const section = document.getElementById('chapter-movement');
    window.scrollTo({
      top: section.offsetTop + section.offsetHeight / 2 - window.innerHeight / 2,
      behavior: 'instant',
    });
    return {
      progress: window.AURELIS.progress,
      exploded: window.AURELIS.exploded,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  });
  await new Promise((resolve) => setTimeout(resolve, 350));
  assert(state.progress === 0.5, `progress ${state.progress}`);
  assert(state.exploded > 0.9, `exploded ${state.exploded}`);
  assert(state.scrollBehavior === 'auto', `scroll-behavior ${state.scrollBehavior}`);
  return 'timeline intact, smooth scrolling off';
});

await check('no console or page errors', async () => {
  const errors = [...consoleErrors, ...pageErrors];
  assert(errors.length === 0, errors.join(' | '));
  return 'clean console';
});

/* ------------------------------------------------------------------ */

await browser.close();
server.close();

console.log(`\n${checks - failures.length}/${checks} checks passed.`);
if (failures.length) {
  console.log('\nFailures:');
  for (const failure of failures) console.log(`- ${failure.name}: ${failure.error}`);
  process.exit(1);
}
console.log(`Screenshots written to ${OUT}\n`);
