#!/usr/bin/env node
/**
 * Verify every Unsplash asset referenced by the atlas resolves.
 *
 *   npm run verify:images
 *
 * This is a network check and is deliberately separate from `npm run verify`,
 * so the release check can run offline. It parses data.js plus the static
 * hero/editorial URLs in index.html and HEADs every unique photo.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataSource = readFileSync(resolve(root, 'data.js'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(dataSource, sandbox);
const data = sandbox.window.WANDERLUST_DATA;

const urls = new Set();
const add = (url) => {
  if (url && url.startsWith('https://images.unsplash.com/')) urls.add(url.split('?')[0]);
};

data.regions.forEach((region) => add(region.image));
data.destinations.forEach((destination) => {
  add(destination.image);
  destination.gallery.forEach((shot) => add(shot.image));
});
data.routes.forEach((route) => add(route.image));
for (const match of html.matchAll(/https:\/\/images\.unsplash\.com\/photo-[^"?&\s]+/g)) add(match[0]);

const list = [...urls];
console.log(`Checking ${list.length} unique Unsplash images…\n`);

const results = [];
const concurrency = 4;
let cursor = 0;

async function request(url, attempt = 1) {
  const target = `${url}?auto=format&fit=crop&w=240&q=55`;
  try {
    const response = await fetch(target, { method: 'HEAD', redirect: 'follow' });
    const type = response.headers.get('content-type') || '';
    if (response.status !== 200 || !type.startsWith('image/')) {
      if (attempt < 2) return request(url, attempt + 1);
      return { url, status: response.status, type, ok: false };
    }
    return { url, status: response.status, type, ok: true };
  } catch (error) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 500));
      return request(url, attempt + 1);
    }
    return { url, status: 'ERR', type: '', ok: false, error: error.message };
  }
}

async function worker() {
  while (cursor < list.length) {
    const index = cursor++;
    const url = list[index];
    const result = await request(url);
    results.push(result);
    console.log(`${result.ok ? '✓' : '✗'} ${result.status} ${url.split('photo-')[1]}`);
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} images reachable.`);
if (failed.length) {
  console.error('\nFailures:');
  failed.forEach((result) => console.error(`- ${result.status} ${result.url} (${result.type || result.error})`));
  process.exit(1);
}
console.log('All image URLs resolved.');
