#!/usr/bin/env node
/**
 * Static release checks for the Unit 4 studio. No dependencies, no network.
 *
 *   node scripts/check.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const passes = [];

function check(name, fn) {
  try {
    const detail = fn();
    passes.push(detail ? `${name} (${detail})` : name);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
  }
}

const read = (rel) => readFileSync(join(root, rel), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const REQUIRED = [
  'index.html', 'style.css', 'script.js',
  'README.md', 'AGENTS.md', 'LICENSE', 'CHANGELOG.md',
  'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md',
  'SUPPORT.md', 'ROADMAP.md', 'CITATION.cff',
  'state.json', '.nojekyll', '.editorconfig',
  'assets/hero.jpg',
  '.github/PULL_REQUEST_TEMPLATE.md', '.github/CODEOWNERS',
  '.github/ISSUE_TEMPLATE/bug_report.yml',
  '.github/ISSUE_TEMPLATE/feature_request.yml',
  '.github/ISSUE_TEMPLATE/config.yml',
  '.github/workflows/ci.yml',
  'docs/ARCHITECTURE.md', 'docs/DESIGN.md', 'docs/TESTING.md',
  'docs/DEPLOYMENT.md', 'docs/ACCESSIBILITY.md', 'docs/RELEASE.md',
  'docs/REPRODUCTION.md', 'docs/CONTENT.md', 'docs/SESSION_LOG.md',
  'scripts/check.mjs', 'scripts/browser-check.mjs'
];

check('required files', () => {
  const missing = REQUIRED.filter((file) => !existsSync(join(root, file)));
  assert(missing.length === 0, `missing ${missing.join(', ')}`);
  return `${REQUIRED.length} present`;
});

check('script.js syntax', () => {
  execFileSync(process.execPath, ['--check', join(root, 'script.js')], { stdio: 'pipe' });
  return 'node --check';
});

check('browser-check.mjs syntax', () => {
  execFileSync(process.execPath, ['--check', join(root, 'scripts/browser-check.mjs')], { stdio: 'pipe' });
  return 'node --check';
});

const html = read('index.html');
const js = read('script.js');
const css = read('style.css');

check('HTML head', () => {
  assert(/<meta name="viewport"/.test(html), 'missing viewport meta');
  assert(/<meta name="description"/.test(html), 'missing description meta');
  assert(/<html lang="en"/.test(html), 'missing lang attribute');
  assert(/<title>[^<]{10,}<\/title>/.test(html), 'missing or short title');
  return 'lang, viewport, description, title';
});

check('HTML ids unique', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert(duplicates.length === 0, `duplicate ids: ${[...new Set(duplicates)].join(', ')}`);
  assert(ids.length > 40, 'suspiciously few ids');
  return `${ids.length} ids`;
});

check('tab/panel consistency', () => {
  const tabs = [...html.matchAll(/data-module="([^"]+)"/g)].map((m) => m[1]);
  const panels = [...html.matchAll(/id="panel-([^"]+)"/g)].map((m) => m[1]);
  assert(tabs.length === 3, `expected 3 tabs, found ${tabs.length}`);
  assert(panels.length === 3, `expected 3 panels, found ${panels.length}`);
  assert(tabs.every((id) => panels.includes(id)), 'tab without panel');
  const controls = [...html.matchAll(/aria-controls="([^"]+)"/g)].map((m) => m[1]);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const missing = controls.filter((id) => !ids.has(id));
  assert(missing.length === 0, `aria-controls missing: ${missing.join(', ')}`);
  return `3 tabs, ${controls.length} aria-controls`;
});

check('JS id references resolve', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const refs = [...js.matchAll(/\$\('([^']+)'\)/g)].map((m) => m[1]);
  const missing = [...new Set(refs)].filter((id) => !ids.has(id));
  assert(missing.length === 0, `missing in HTML: ${missing.join(', ')}`);
  return `${new Set(refs).size} referenced`;
});

check('local asset paths', () => {
  const paths = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1])
    .filter((p) => !/^(#|data:|https?:|mailto:)/.test(p));
  const missing = paths.filter((p) => !existsSync(join(root, p.split('?')[0])));
  assert(missing.length === 0, `missing: ${missing.join(', ')}`);
  return `${paths.length} local`;
});

check('no runtime external resources', () => {
  const remote = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  assert(remote.length === 0, `external runtime resource: ${remote.join(', ')}`);
  return 'offline-safe';
});

const i18nStart = js.indexOf('const I18N = {');
const i18nEnd = js.indexOf('const t = (key)');
check('i18n dictionary parses', () => {
  assert(i18nStart >= 0 && i18nEnd > i18nStart, 'cannot locate I18N literal');
  return 'found';
});

let I18N = null;
if (i18nStart >= 0 && i18nEnd > i18nStart) {
  const literal = js.slice(i18nStart + 'const I18N = '.length, i18nEnd).trim().replace(/;\s*$/, '');
  I18N = new Function(`return (${literal});`)();
}

check('i18n EN/TH parity', () => {
  assert(I18N, 'dictionary unavailable');
  const en = Object.keys(I18N.en).sort();
  const th = Object.keys(I18N.th).sort();
  const onlyEn = en.filter((k) => !th.includes(k));
  const onlyTh = th.filter((k) => !en.includes(k));
  assert(onlyEn.length === 0, `only in EN: ${onlyEn.join(', ')}`);
  assert(onlyTh.length === 0, `only in TH: ${onlyTh.join(', ')}`);
  return `${en.length} keys each`;
});

check('i18n usage coverage', () => {
  assert(I18N, 'dictionary unavailable');
  const attrKeys = [...html.matchAll(/data-i18n(?:-placeholder|-title)?="([^"]+)"/g)].map((m) => m[1]);
  const callKeys = [...js.matchAll(/\bt\('([^']+)'\)/g)].map((m) => m[1]);
  const badgeKeys = [...js.matchAll(/\bkey: '([^']+)'/g)].map((m) => m[1]);
  const used = [...new Set([...attrKeys, ...callKeys, ...badgeKeys])];
  const missing = used.filter((k) => !(k in I18N.en) || !(k in I18N.th));
  assert(missing.length === 0, `unknown keys: ${missing.join(', ')}`);
  return `${used.length} used`;
});

check('semantic colour contract', () => {
  const expected = [
    ['--sin', '#ff5722'], ['--cos', '#00e5ff'],
    ['--tan', '#b388ff'], ['--one', '#00e676'], ['--theta', '#ffd600']
  ];
  for (const [name, value] of expected) {
    assert(new RegExp(`${name}:\\s*${value}`, 'i').test(css), `${name} must be ${value}`);
    assert(js.toLowerCase().includes(value), `${value} missing from script.js`);
  }
  return 'sin/cos/tan/one/theta';
});

check('runtime has no network calls', () => {
  const offenders = [...js.matchAll(/\b(fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/g)].map((m) => m[1]);
  assert(offenders.length === 0, `network API used: ${offenders.join(', ')}`);
  return 'none';
});

check('state.json shape', () => {
  const state = JSON.parse(read('state.json'));
  assert(typeof state.project === 'string' && state.project.length > 5, 'missing project name');
  assert(state.session && typeof state.session.elapsedSeconds === 'number', 'missing session timing');
  assert(state.usage && typeof state.usage.totalTokens === 'number', 'missing token usage');
  assert(state.credits && state.credits.tool === 'OpenCode', 'missing OpenCode credit');
  assert(/DeepSeek/.test(state.credits.model || ''), 'missing model credit');
  assert(state.deployment && /^https:\/\/[a-z0-9-]+\.github\.io\//.test(state.deployment.pages), 'missing Pages URL');
  return `${state.session.elapsed}, ${state.usage.totalTokens.toLocaleString('en-US')} tokens`;
});

check('Markdown relative links resolve', () => {
  const markdown = [];
  const walk = (dir) => {
    for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const rel = dir === '.' ? entry.name : `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(rel);
      else if (entry.name.endsWith('.md')) markdown.push(rel);
    }
  };
  walk('.');
  const broken = [];
  for (const file of markdown) {
    const body = read(file);
    for (const match of body.matchAll(/\]\(([^)\s]+)\)/g)) {
      const target = match[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const clean = target.split('#')[0].split('?')[0];
      if (!clean) continue;
      const resolved = resolve(dirname(join(root, file)), clean);
      if (!existsSync(resolved)) broken.push(`${file} -> ${target}`);
    }
  }
  assert(broken.length === 0, `broken: ${broken.join('; ')}`);
  return `${markdown.length} files scanned`;
});

check('LICENSE is MIT', () => {
  assert(/MIT License/.test(read('LICENSE')), 'LICENSE is not MIT');
  return 'MIT';
});

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  console.error('');
  process.exit(1);
}

console.log(`\n${passes.length} checks passed:\n`);
for (const pass of passes) console.log(`  ✓ ${pass}`);
console.log('');
