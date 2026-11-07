#!/usr/bin/env node
// Copy the working Aurelis template into a new project.
//
//   node scripts/new-project.mjs --out ~/Projects/my-watch
//   node scripts/new-project.mjs --out /tmp/try --force
//
// The template is a complete static site. npm install is only for the
// dev-time Puppeteer release gate.

import { cpSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(HERE, '..', 'assets', 'aurelis-calibre-07');

const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 ? argv[index + 1] : fallback;
};

const out = arg('out');
const force = argv.includes('--force');
const help = argv.includes('--help') || argv.includes('-h');

if (help || !out) {
  console.log('Usage: node scripts/new-project.mjs --out <directory> [--force]');
  process.exit(help ? 0 : 1);
}

if (!existsSync(TEMPLATE)) {
  console.error(`Template missing: ${TEMPLATE}`);
  process.exit(1);
}

const destination = resolve(out.replace(/^~(?=$|\/)/, process.env.HOME || '~'));

if (existsSync(destination)) {
  const entries = readdirSync(destination).filter((entry) => entry !== '.DS_Store');
  if (entries.length && !force) {
    console.error(`Destination is not empty: ${destination}\nUse --force to overwrite files.`);
    process.exit(1);
  }
  if (force && entries.length) {
    for (const entry of entries) {
      if (entry === '.git') continue;
      rmSync(join(destination, entry), { recursive: true, force: true });
    }
  }
}

cpSync(TEMPLATE, destination, {
  recursive: true,
  filter: (source) => {
    const name = source.split('/').pop();
    if (name === '.git' || name === '.DS_Store' || name === 'node_modules') return false;
    if (statSync(source).isFile() && statSync(source).size > 8_000_000) return false;
    return true;
  },
});

console.log(`Scaffolded Calibre Scroll Studio -> ${destination}`);
console.log('');
console.log('Next:');
console.log(`  cd ${destination}`);
console.log('  npm install                 # dev-only: puppeteer-core');
console.log('  npm run verify              # 24 checks + screenshots');
console.log('  npm run state               # OpenCode ledger (inside OpenCode)');
console.log('  python3 -m http.server 4173');
console.log('');
console.log('Make it yours, in this order:');
console.log('  1. Brand, chapter copy and specs in index.html.');
console.log('  2. Dial/bridge/rotor strings in src/watch.js.');
console.log('  3. Palette and type tokens in styles.css; materials in src/environment.js.');
console.log('  4. canonical/og:url/og:image, robots.txt, sitemap.xml, 404.html, colophon links.');
console.log('  5. README, AGENTS, CREDITS, docs and the live URL.');
console.log('');
console.log('Keep the normalized timeline, the two-stage part registry and the 24 checks.');
