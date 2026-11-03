#!/usr/bin/env node
// Dependency-free static check for a City 3D Tour Guide project.
//
//   node scripts/check.mjs                          # checks the bundled reference
//   node scripts/check.mjs --project ~/Projects/my-city
//
// This does not launch a browser. Use ?selftest=1 for the 24 runtime checks.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skill = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const pIndex = argv.indexOf('--project');
const project = resolve((pIndex >= 0 ? argv[pIndex + 1] : join(skill, 'assets', 'bangkok-3d-tour-guide')).replace(/^~/, process.env.HOME ?? '~'));
const read = (f) => readFileSync(join(project, f), 'utf8');
const has = (f) => existsSync(join(project, f));
const pass = [];
const fail = [];

function check(name, fn) {
  try {
    const r = fn();
    if (r === false || (typeof r === 'string' && r.length)) fail.push(`${name}${r ? ` — ${r}` : ''}`);
    else pass.push(name);
  } catch (e) {
    fail.push(`${name} — ${e.message}`);
  }
}

const required = [
  'index.html', 'style.css', 'script.js', 'README.md', 'LICENSE',
  'THIRD_PARTY_NOTICES.md',
  'screenshots/drone-day.jpg', 'screenshots/drone-night.jpg',
  'screenshots/walk.jpg', 'screenshots/guide.jpg', 'screenshots/thai-guide.jpg'
];

check('required project files exist', () => {
  const missing = required.filter((f) => !has(f));
  return missing.length ? `missing ${missing.join(', ')}` : true;
});

check('script.js parses', () => {
  const r = spawnSync(process.execPath, ['--check', join(project, 'script.js')], { encoding: 'utf8' });
  return r.status === 0 || (r.stderr || '').trim();
});

const index = read('index.html');
const script = read('script.js');
const appVersion = (script.match(/version:\s*'([0-9]+\.[0-9]+\.[0-9]+)'/) || [])[1];

check('APP version is semver', () => /^\d+\.\d+\.\d+$/.test(appVersion || ''));
check('Three.js r128 CDN pinned', () => index.includes('three.js/r128/three.min.js') || 'missing Three.js');
check('OrbitControls r128 CDN pinned', () => index.includes('three@0.128.0/examples/js/controls/OrbitControls.js') || 'missing OrbitControls');
check('PointerLockControls absent', () => !index.includes('PointerLockControls') && !script.includes('PointerLockControls') || 'pointer lock still referenced');
check('drag-look hint present', () => index.includes('Drag to look around') || 'missing drag hint');
check('on-screen walk pad wired', () => index.includes('id="walkPad"') && script.includes('padKeys') || 'missing walk pad');
check('horizontal drag inversion present', () => script.includes('walkLook.yaw += dx * sensitivity') || 'drag inversion missing');
check('focus restoration present', () => script.includes('function focusScene') && script.includes('dom.canvas.focus') || 'focusScene missing');
check('walk mode marker-only picking', () => script.includes("pickKind !== 'marker'") && script.includes("pickKind = 'marker'") || 'marker-only picking missing');
check('layered car rendering present', () => ['carBodyMesh', 'carCabinMesh', 'carWheelMesh', 'carHeadMesh', 'carTailMesh'].every((x) => script.includes(x)) || 'car meshes missing');
check('hip roof geometry present', () => script.includes('function hipRoofMesh') || 'hipRoofMesh missing');
check('five landmark ids present', () => ['wat-arun', 'wat-pho', 'grand-palace', 'golden-mount', 'baiyoke'].every((id) => script.includes(`'${id}'`)) || 'landmark ids missing');
check('storage + export contracts present', () => script.includes("storageKey: 'bangkok3d.state.v1'") && script.includes("exportName: 'bangkok_3d_tour.json'") || 'state/export contract missing');
check('cache-busting matches APP version', () => index.includes(`style.css?v=${appVersion}`) && index.includes(`script.js?v=${appVersion}`) || 'asset query strings stale');

check('reference screenshots present', () => {
  const count = readdirSync(join(project, 'screenshots')).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)).length;
  return count >= 5 || `only ${count} screenshots`;
});

console.log(`City 3D Tour Guide static check — ${project}`);
for (const name of pass) console.log(`✓ ${name}`);
for (const name of fail) console.error(`✕ ${name}`);
console.log(`\n${pass.length} / ${pass.length + fail.length} checks passed`);
process.exit(fail.length ? 1 : 0);
