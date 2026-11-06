#!/usr/bin/env node
/**
 * Validate the bundled starter without launching a browser.
 *
 *   node scripts/check-starter.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const starter = join(root, 'assets', 'wanderlust-3d-starter');
const failures = [];

function check(name, ok, detail = '') {
  if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
  console.log(`${ok ? '✓' : '✗'} ${name}${ok || !detail ? '' : ` — ${detail}`}`);
}

for (const file of [
  'index.html',
  'style.css',
  'data.js',
  'script.js',
  '404.html',
  'manifest.webmanifest',
  'assets/icon.svg',
  'scripts/verify.mjs',
  'scripts/check-images.mjs',
  'scripts/screenshots.mjs',
  'scripts/serve.mjs',
  'scripts/lib/static-server.mjs'
]) {
  check(`file: ${file}`, existsSync(join(starter, file)));
}

check('no node_modules in starter', !existsSync(join(starter, 'node_modules')));
check('no build state in starter', !existsSync(join(starter, 'state.json')));

const source = readFileSync(join(starter, 'data.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const data = sandbox.window.WANDERLUST_DATA;

check('data.js exposes WANDERLUST_DATA', Boolean(data));
if (data) {
  check('3 regions', data.regions.length === 3, `found ${data.regions.length}`);
  check('15 destinations', data.destinations.length === 15, `found ${data.destinations.length}`);
  check('unique destination ids', new Set(data.destinations.map((d) => d.id)).size === 15);
  check(
    'five destinations per region',
    data.regions.every((r) => data.destinations.filter((d) => d.regionId === r.id).length === 5)
  );
  check(
    'every destination has three gallery images',
    data.destinations.every((d) => d.gallery.length === 3)
  );
  check(
    'budget breakdowns sum to dailyBudget',
    data.destinations.every((d) => {
      const sum = Object.values(d.budgetBreakdown).reduce((a, b) => a + b, 0);
      return Math.abs(sum - d.dailyBudget) <= 1;
    })
  );
  check(
    'all primary images use the Unsplash CDN',
    data.destinations.every((d) => d.image.startsWith('https://images.unsplash.com/'))
  );
  check(
    'every destination has a valid bestMonths array',
    data.destinations.every((d) => d.bestMonths.length > 0 && d.bestMonths.every((m) => /^[A-Z][a-z]{2}$/.test(m)))
  );
  check(
    'every route references existing destinations',
    data.routes.every((route) => route.destinationIds.every((id) => data.destinations.some((d) => d.id === id)))
  );
  check(
    'every destination id is referenced by a valid region',
    data.destinations.every((d) => data.regions.some((r) => r.id === d.regionId))
  );

  const images = new Set();
  data.destinations.forEach((d) => {
    images.add(d.image);
    d.gallery.forEach((g) => images.add(g.image));
  });
  data.regions.forEach((r) => images.add(r.image));
  data.routes.forEach((r) => images.add(r.image));
  console.log(`\nUnique images in starter: ${images.size}`);
}

const html = readFileSync(join(starter, 'index.html'), 'utf8');
check('index.html loads style.css', html.includes('href="style.css"'));
check('index.html loads data.js', html.includes('src="data.js"'));
check('index.html loads script.js', html.includes('src="script.js"'));
check('index.html has a skip link', html.includes('class="skip-link"'));
check('index.html has a manifest', html.includes('rel="manifest"'));

try {
  JSON.parse(readFileSync(join(starter, 'package.json'), 'utf8'));
  check('package.json parses', true);
} catch {
  check('package.json parses', false);
}

console.log('\n' + '─'.repeat(48));
if (failures.length) {
  console.error(`${failures.length} check${failures.length === 1 ? '' : 's'} failed:`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Starter OK — 3 regions, 15 destinations, data contract valid.');
