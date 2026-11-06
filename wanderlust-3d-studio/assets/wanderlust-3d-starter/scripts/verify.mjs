#!/usr/bin/env node
/**
 * Headless release check for Wanderlust 3D.
 *
 *   npm install
 *   npm run verify
 *
 * Uses the locally installed Chrome (or CHROME_PATH) through puppeteer-core.
 * It starts its own static server, exercises the real UI, and fails on any
 * uncaught page error, console error, broken persistence or layout overflow.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { startServer } from './lib/static-server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean);

const chromePath = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
if (!chromePath) {
  console.error('Chrome/Chromium not found. Set CHROME_PATH to a Chrome executable.');
  process.exit(2);
}

const results = [];
let failures = 0;

function check(name, ok, detail = '') {
  results.push({ name, ok: Boolean(ok), detail });
  if (!ok) failures += 1;
}

function equal(name, actual, expected) {
  check(name, actual === expected, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function includes(name, haystack, needle) {
  check(name, String(haystack).includes(needle), `${JSON.stringify(haystack)} does not include ${JSON.stringify(needle)}`);
}

async function visibleText(page, selector) {
  return page.$eval(selector, (el) => el.textContent.replace(/\s+/g, ' ').trim()).catch(() => '');
}

async function count(page, selector) {
  return page.$$eval(selector, (els) => els.length).catch(() => 0);
}

async function waitForCards(page, expected, timeout = 3000) {
  await page.waitForFunction(
    (n) => document.querySelectorAll('.dest-card').length === n,
    { timeout },
    expected
  ).catch(() => {});
  return count(page, '.dest-card');
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

const startedAt = Date.now();
const server = await startServer(root, 0);
const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
});

const page = await browser.newPage();
const consoleErrors = [];
const pageErrors = [];
const consoleWarnings = [];
page.on('console', (message) => {
  const text = message.text();
  if (message.type() === 'error') consoleErrors.push(text);
  if (message.type() === 'warning' && !text.includes('cdn.tailwindcss.com')) consoleWarnings.push(text);
});
page.on('pageerror', (error) => pageErrors.push(error.message));

try {
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.goto(server.url, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(400);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(700);

  /* ------------------------------ Static + SEO ----------------------------- */
  equal('document title', await page.title(), 'Wanderlust 3D — Global Destination Explorer');
  equal('exactly one h1', await count(page, 'h1'), 1);
  check('meta description present', Boolean(await page.$('meta[name="description"]')));
  check('Open Graph image present', Boolean(await page.$('meta[property="og:image"]')));
  check('skip link present', Boolean(await page.$('.skip-link')));
  check('JSON-LD parses', await page.evaluate(() => {
    const node = document.querySelector('script[type="application/ld+json"]');
    if (!node) return false;
    try { return JSON.parse(node.textContent)['@type'] === 'WebApplication'; } catch { return false; }
  }));

  const data = await page.evaluate(() => window.WANDERLUST_DATA);
  equal('dataset regions', data.regions.length, 3);
  equal('dataset destinations', data.destinations.length, 15);
  equal('each region has five destinations', data.regions.every((r) => data.destinations.filter((d) => d.regionId === r.id).length === 5), true);
  equal('destination ids are unique', new Set(data.destinations.map((d) => d.id)).size, 15);
  check('every destination has three gallery images', data.destinations.every((d) => d.gallery.length === 3));
  check('budget breakdowns sum to daily budget', data.destinations.every((d) => {
    const sum = Object.values(d.budgetBreakdown).reduce((a, b) => a + b, 0);
    return Math.abs(sum - d.dailyBudget) <= 1;
  }));
  check('all images use the Unsplash CDN', data.destinations.every((d) => d.image.startsWith('https://images.unsplash.com/')));

  /* ------------------------------- Catalogue ------------------------------- */
  equal('initial card count', await count(page, '.dest-card'), 15);
  equal('region tab count', await count(page, '.region-tab'), 4);
  equal('interest chip count', await count(page, '.chip'), new Set(data.destinations.flatMap((d) => d.vibes)).size - 0 > 12 ? 12 : new Set(data.destinations.flatMap((d) => d.vibes)).size);
  includes('default result count', await visibleText(page, '#resultCount'), '15 destinations');

  await page.click('[data-region-tab="japan"]');
  equal('Japan tab filters to five', await waitForCards(page, 5), 5);
  includes('Japan result count', await visibleText(page, '#resultCount'), 'in Japan');
  equal('Japan first card is Kyoto', await visibleText(page, '.dest-card .dest-name'), 'Kyoto');

  await page.click('[data-region-tab="italy"]');
  equal('Italy tab filters to five', await waitForCards(page, 5), 5);
  equal('Italy first card is Rome', await visibleText(page, '.dest-card .dest-name'), 'Rome');

  await page.click('[data-region-tab="costa-rica"]');
  equal('Costa Rica tab filters to five', await waitForCards(page, 5), 5);
  equal('Costa Rica first card is Monteverde', await visibleText(page, '.dest-card .dest-name'), 'Monteverde');

  await page.click('[data-region-tab="all"]');
  equal('All regions restores fifteen', await waitForCards(page, 15), 15);

  /* --------------------------------- Search -------------------------------- */
  await page.type('#searchInput', 'kyoto');
  await sleep(400);
  const kyotoMatches = await count(page, '.dest-card');
  check('search finds Kyoto', kyotoMatches >= 1, `found ${kyotoMatches}`);
  equal('search ranks Kyoto first', await visibleText(page, '.dest-card .dest-name'), 'Kyoto');
  check('search clear button is visible', await page.$eval('#searchClear', (el) => !el.hidden));
  await page.click('#searchClear');
  await sleep(250);
  equal('clearing search restores fifteen', await waitForCards(page, 15), 15);

  await page.type('#searchInput', 'turtle');
  await sleep(400);
  const turtleCount = await count(page, '.dest-card');
  check('semantic search finds turtle destinations', turtleCount >= 2, `found ${turtleCount}`);
  await page.click('#resetFilters');
  await sleep(250);
  equal('reset restores fifteen', await waitForCards(page, 15), 15);

  /* --------------------------------- Tags ---------------------------------- */
  const beachCount = data.destinations.filter((d) => d.vibes.includes('Beaches')).length;
  await page.click('[data-tag="Beaches"]');
  await sleep(250);
  equal('Beaches chip applies OR filter', await count(page, '.dest-card'), beachCount);
  check('Beaches chip is pressed', await page.$eval('[data-tag="Beaches"]', (el) => el.getAttribute('aria-pressed') === 'true'));
  await page.click('[data-tag="Beaches"]');
  await sleep(250);
  equal('Beaches chip toggles off', await count(page, '.dest-card'), 15);

  /* -------------------------------- Budget --------------------------------- */
  await page.select('#budgetFilter', 'luxury');
  await sleep(250);
  equal('luxury budget filter', await count(page, '.dest-card'), data.destinations.filter((d) => d.budgetLevel === 'luxury').length);
  await page.select('#budgetFilter', 'all');
  await sleep(200);

  await page.select('#sortFilter', 'budget');
  await sleep(250);
  equal('budget sort starts with Tortuguero', await visibleText(page, '.dest-card .dest-name'), 'Tortuguero');
  await page.select('#sortFilter', 'curated');
  await sleep(200);

  /* ---------------------------- Modal + gallery ---------------------------- */
  await page.click('.dest-card-link');
  await page.waitForFunction(() => document.querySelector('#modalTitle')?.textContent === 'Kyoto', { timeout: 3000 });
  equal('modal opens Kyoto', await visibleText(page, '#modalTitle'), 'Kyoto');
  equal('modal has three gallery thumbs', await count(page, '.modal-thumb'), 3);
  equal('modal has three attractions', await count(page, '.attraction'), 3);
  equal('modal has four cuisine cards', await count(page, '.cuisine-item'), 4);

  const secondGalleryId = data.destinations.find((d) => d.id === 'kyoto').gallery[1].image.split('photo-')[1];
  await page.click('[data-gallery-index="1"]');
  await sleep(200);
  const mainImage = await page.$eval('#modalMainImage', (el) => el.currentSrc || el.src);
  includes('gallery thumbnail swaps main image', mainImage, secondGalleryId);

  await page.click('.aside-add');
  await sleep(300);
  equal('trip badge after add', await visibleText(page, '#tripCount'), '1');
  const storedAfterAdd = await page.evaluate(() => JSON.parse(localStorage.getItem('wanderlust.trip.v1')));
  equal('localStorage stores Kyoto', storedAfterAdd.items.kyoto.nights, 3);
  check('modal add button reflects state', await page.$eval('.aside-add', (el) => el.classList.contains('is-added')));

  await page.keyboard.press('Escape');
  await sleep(300);
  equal('Escape closes modal', await page.$eval('#destinationModal', (el) => el.hidden), true);
  check('focus returns to the page after modal', await page.evaluate(() => document.activeElement !== document.body));

  /* ------------------------------- Trip drawer ----------------------------- */
  await page.click('.trip-trigger');
  await sleep(600);
  equal('drawer opens', await page.$eval('#tripDrawer', (el) => el.classList.contains('is-open')), true);
  equal('drawer has one item', await count(page, '.trip-item'), 1);
  equal('drawer nights total', await visibleText(page, '#tripNights'), '3');
  equal('drawer cost total', await visibleText(page, '#tripCost'), '$480');

  await page.click('[data-trip-inc="kyoto"]');
  await sleep(250);
  equal('night stepper increments', await visibleText(page, '#tripNights'), '4');
  equal('night stepper updates cost', await visibleText(page, '#tripCost'), '$640');
  await page.click('[data-trip-dec="kyoto"]');
  await sleep(200);
  equal('night stepper decrements', await visibleText(page, '#tripNights'), '3');

  await page.click('[data-trip-remove="kyoto"]');
  await sleep(300);
  equal('remove empties the drawer', await count(page, '.trip-item'), 0);
  check('empty trip state is visible', await page.$eval('#tripEmpty', (el) => !el.hidden));
  equal('trip badge after remove', await visibleText(page, '#tripCount'), '0');

  await page.keyboard.press('Escape');
  await sleep(500);

  /* -------------------------------- Routes --------------------------------- */
  await page.click('[data-route="japan-classic"]');
  await sleep(500);
  equal('route adds four places', await visibleText(page, '#tripCount'), '4');
  const storedAfterRoute = await page.evaluate(() => JSON.parse(localStorage.getItem('wanderlust.trip.v1')));
  equal('route persisted four items', Object.keys(storedAfterRoute.items).length, 4);

  await page.click('.trip-trigger');
  await sleep(600);
  equal('drawer shows route items', await count(page, '.trip-item'), 4);
  equal('route nights total', await visibleText(page, '#tripNights'), '11');
  equal('route cost total', await visibleText(page, '#tripCost'), '$1,930');
  await page.keyboard.press('Escape');
  await sleep(500);

  /* ------------------------------- Persistence ----------------------------- */
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(600);
  equal('trip survives reload', await visibleText(page, '#tripCount'), '4');
  const storedAfterReload = await page.evaluate(() => JSON.parse(localStorage.getItem('wanderlust.trip.v1')));
  equal('localStorage survives reload', Object.keys(storedAfterReload.items).length, 4);

  await page.click('.trip-trigger');
  await sleep(500);
  await page.click('#clearTrip');
  await sleep(120);
  includes('clear asks for confirmation', await visibleText(page, '#clearTrip'), 'Tap again');
  await page.click('#clearTrip');
  await sleep(400);
  equal('clear empties the trip', await visibleText(page, '#tripCount'), '0');
  await page.keyboard.press('Escape');
  await sleep(450);

  /* -------------------------------- Deep link ------------------------------ */
  await page.goto(`${server.url}/#/destination/venice`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction(() => document.querySelector('#modalTitle')?.textContent === 'Venice', { timeout: 4000 }).catch(() => {});
  equal('deep link opens Venice', await visibleText(page, '#modalTitle'), 'Venice');
  await page.click('.modal-close');
  await sleep(250);
  equal('closing deep link clears the hash', await page.evaluate(() => location.hash), '');

  /* --------------------------------- Mobile -------------------------------- */
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(server.url, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(500);
  const mobileOverflow = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    body: document.body.scrollWidth
  }));
  check('no horizontal overflow at 390px', mobileOverflow.doc <= mobileOverflow.viewport && mobileOverflow.body <= mobileOverflow.viewport, JSON.stringify(mobileOverflow));
  equal('back-to-top hidden on mobile', await page.$eval('#backToTop', (el) => getComputedStyle(el).display), 'none');

  await page.click('#menuBtn');
  await sleep(200);
  equal('mobile menu opens', await page.$eval('#mobileNav', (el) => !el.hidden), true);
  await page.click('#mobileNav a[href="#routes"]');
  await sleep(300);
  equal('mobile menu closes after navigation', await page.$eval('#mobileNav', (el) => el.hidden), true);

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelector('#explore').scrollIntoView({ block: 'start' });
  });
  await sleep(300);
  await page.click('.dest-card-link');
  await page.waitForFunction(() => Boolean(document.querySelector('#modalTitle')), { timeout: 3000 });
  const modalWidth = await page.$eval('.modal-panel', (el) => el.getBoundingClientRect().width);
  check('modal fits 390px viewport', modalWidth <= 390, `${modalWidth}px`);
  await page.click('.aside-add');
  await sleep(250);
  await page.click('.modal-close');
  await sleep(300);
  await page.click('.trip-trigger');
  await sleep(550);
  const drawerWidth = await page.$eval('#tripDrawer', (el) => el.getBoundingClientRect().width);
  check('drawer fits 390px viewport', drawerWidth <= 390, `${drawerWidth}px`);
  equal('mobile drawer has one item', await count(page, '.trip-item'), 1);
  await page.keyboard.press('Escape');
  await sleep(300);

  /* -------------------------------- Tablet --------------------------------- */
  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 1 });
  await page.goto(server.url, { waitUntil: 'networkidle2' });
  await sleep(400);
  const tabletOverflow = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  check('no horizontal overflow at 768px', tabletOverflow.doc <= tabletOverflow.viewport, JSON.stringify(tabletOverflow));
  equal('tablet uses two-column cards', await page.$eval('#destinationGrid', (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length), 2);

  /* ------------------------------ Accessibility ---------------------------- */
  const a11y = await page.evaluate(() => {
    const imagesWithoutAlt = Array.from(document.querySelectorAll('img')).filter((img) => !img.hasAttribute('alt')).length;
    const unnamedButtons = Array.from(document.querySelectorAll('button')).filter((button) => {
      if (button.offsetParent === null) return false;
      const label = (button.getAttribute('aria-label') || button.textContent || '').trim();
      return !label;
    }).length;
    const unnamedLinks = Array.from(document.querySelectorAll('a')).filter((link) => {
      if (link.offsetParent === null) return false;
      const label = (link.getAttribute('aria-label') || link.textContent || '').trim();
      return !label;
    }).length;
    return { imagesWithoutAlt, unnamedButtons, unnamedLinks };
  });
  equal('every image has an alt attribute', a11y.imagesWithoutAlt, 0);
  equal('every visible button has a name', a11y.unnamedButtons, 0);
  equal('every visible link has a name', a11y.unnamedLinks, 0);

  /* -------------------------------- Console -------------------------------- */
  equal('no page errors', pageErrors.length, 0);
  equal('no console errors', consoleErrors.length, 0);

  if (pageErrors.length) console.error('\nPage errors:\n' + pageErrors.join('\n'));
  if (consoleErrors.length) console.error('\nConsole errors:\n' + consoleErrors.join('\n'));
  if (consoleWarnings.length) console.warn('\nWarnings observed (non-fatal):\n' + consoleWarnings.slice(0, 5).join('\n'));
} catch (error) {
  failures += 1;
  console.error('\nVerification crashed:', error.stack || error);
} finally {
  await browser.close();
  await server.close();
}

const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
const passed = results.length - failures;
console.log('\nWanderlust 3D — headless verification');
console.log('─'.repeat(52));
for (const result of results) {
  console.log(`${result.ok ? '✓' : '✗'} ${result.name}${result.ok ? '' : `\n    ${result.detail}`}`);
}
console.log('─'.repeat(52));
console.log(`${passed}/${results.length} checks passed in ${elapsed}s`);
if (failures) {
  console.error(`${failures} failing check${failures === 1 ? '' : 's'}.`);
  process.exit(1);
}
console.log('Release checks passed.');
