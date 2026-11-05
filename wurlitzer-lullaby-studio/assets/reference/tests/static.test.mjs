import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { loadEngine, loadI18n, loadManifest, read, ROOT } from './lib/fixtures.mjs';

const html = read('index.html');
const css = read('style.css');
const js = read('script.js');
const state = JSON.parse(read('state.json'));
const engine = loadEngine();
const i18n = loadI18n();
const htmlIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);

test('source files exist and are substantial', () => {
  for (const file of ['index.html', 'style.css', 'script.js']) {
    assert.ok(existsSync(join(ROOT, file)), `${file} missing`);
    assert.ok(statSync(join(ROOT, file)).size > 5000, `${file} suspiciously small`);
  }
  assert.ok(js.length > 90000, 'script.js should contain the full app');
});

test('HTML shell is complete and product-specific', () => {
  assert.match(html, /^<!DOCTYPE html>/i);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<meta name="viewport"[^>]*width=device-width/);
  assert.match(html, /<meta name="description" content="[^"]{80,}"/);
  assert.match(html, /<meta name="theme-color" content="#05070d">/);
  assert.match(html, /<title>Vintage Wurlitzer 3D Lullaby Jukebox &amp; Sleep Studio<\/title>/);
  assert.match(html, /<meta property="og:image" content="assets\/og-card\.png">/);
  assert.match(html, /<script type="module" src="script\.js"><\/script>/);
  assert.match(html, /<link rel="stylesheet" href="style\.css">/);
  assert.match(html, /<script type="application\/ld\+json">/);
  assert.match(html, /id="stage-canvas"/);
  assert.match(html, /id="rack-grid"/);
  assert.match(html, /id="stage-caption"/);
});

test('Three.js is pinned to one exact CDN version', () => {
  assert.match(html, /<script type="importmap">/);
  assert.match(html, /three@0\.169\.0\/build\/three\.module\.js/);
  assert.match(html, /three@0\.169\.0\/examples\/jsm\//);
  assert.doesNotMatch(html, /three@latest|three@\^|unpkg\.com/);
  assert.doesNotMatch(js, /from ['"]https:\/\//);
});

test('no duplicate ids and every literal DOM reference exists', () => {
  const duplicates = htmlIds.filter((id, index) => htmlIds.indexOf(id) !== index);
  assert.deepEqual(duplicates, [], `duplicate ids: ${duplicates.join(', ')}`);
  const referenced = [...js.matchAll(/\$\('([^']+)'\)/g)].map((match) => match[1]);
  const missing = [...new Set(referenced)].filter((id) => !htmlIds.includes(id));
  assert.deepEqual(missing, [], `script references missing ids: ${missing.join(', ')}`);
});

test('English and Thai dictionaries are symmetrical and complete', () => {
  const en = Object.keys(i18n.en).sort();
  const th = Object.keys(i18n.th).sort();
  assert.deepEqual(th, en);
  assert.ok(en.length >= 100, `only ${en.length} keys`);
  for (const key of en) {
    assert.equal(typeof i18n.en[key], 'string');
    assert.equal(typeof i18n.th[key], 'string');
    assert.ok(i18n.en[key].length > 0 && i18n.th[key].length > 0, `empty translation: ${key}`);
  }
});

test('every static translation key is defined in both languages', () => {
  const keys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(keys.length >= 45, `only ${keys.length} static keys`);
  const missing = [...new Set(keys)].filter((key) => !(key in i18n.en) || !(key in i18n.th));
  assert.deepEqual(missing, [], `missing translations: ${missing.join(', ')}`);
});

test('pure engine block is DOM-free, network-free and date-free', () => {
  const start = js.indexOf('/* ENGINE:START */');
  const end = js.indexOf('/* ENGINE:END */');
  assert.ok(start > 0 && end > start);
  const block = js.slice(start, end);
  for (const forbidden of ['document.', 'window.', 'THREE', 'localStorage', 'new Date(', 'fetch(']) {
    assert.equal(block.includes(forbidden), false, `engine block contains ${forbidden}`);
  }
  assert.ok(engine.fadeGain(60) === 0.5);
});

test('archive manifest is valid and CORS-friendly', () => {
  const manifest = loadManifest();
  const result = engine.validateManifest(manifest);
  assert.equal(result.ok, true);
  assert.equal(result.tracks.length, manifest.tracks.length);
  for (const track of manifest.tracks) {
    assert.match(track.url, /^https:\/\/upload\.wikimedia\.org\//);
    assert.equal(track.license, 'Public domain');
    assert.ok(track.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
    assert.ok(track.license);
  }
});

test('documentation set is present and linked', () => {
  const docs = [
    'README.md', 'AGENTS.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md',
    'SECURITY.md', 'SUPPORT.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'state.json',
    'docs/README.md', 'docs/ARCHITECTURE.md', 'docs/REPRODUCTION.md', 'docs/DESIGN.md',
    'docs/AUDIO.md', 'docs/TRACKS.md', 'docs/TESTING.md', 'docs/DEPLOYMENT.md', 'docs/DECISIONS.md',
    'docs/ACCESSIBILITY.md', 'docs/PERFORMANCE.md', 'docs/PRIVACY.md', 'docs/FAQ.md',
    'docs/ROADMAP.md', 'docs/CREDITS.md',
    '.github/workflows/ci.yml', '.github/pull_request_template.md',
    '.github/ISSUE_TEMPLATE/bug_report.yml', '.github/ISSUE_TEMPLATE/feature_request.yml',
    'tests/browser.test.mjs', 'tests/engine.test.mjs', 'tests/static.test.mjs',
    'scripts/screenshot.mjs', 'assets/favicon.svg',
  ];
  const missing = docs.filter((file) => !existsSync(join(ROOT, file)));
  assert.deepEqual(missing, [], `missing files: ${missing.join(', ')}`);
  const readme = read('README.md');
  for (const target of ['docs/ARCHITECTURE.md', 'docs/REPRODUCTION.md', 'docs/TESTING.md', 'docs/DEPLOYMENT.md', 'AGENTS.md', 'state.json']) {
    assert.ok(readme.includes(target), `README does not link ${target}`);
  }
  for (const file of docs.filter((f) => f.startsWith('docs/') && f !== 'docs/README.md')) {
    assert.ok(existsSync(join(ROOT, file)), `${file} missing`);
    assert.ok(readFileSync(join(ROOT, file), 'utf8').length > 300, `${file} too thin`);
  }
});

test('state record names the model, the tool and the verification', () => {
  assert.equal(state.project, 'Vintage Wurlitzer 3D Lullaby Jukebox & Sleep Studio');
  assert.equal(state.release, "1.1.0");
  assert.equal(state.model.name, 'DeepSeek V4.1 Flash');
  assert.equal(state.model.id, 'deepseek-v4.1-flash');
  assert.equal(state.credits.tool, 'OpenCode');
  assert.ok(state.session.elapsedSeconds > 0);
  assert.ok(state.session.elapsed);
  assert.ok(state.usage.totalTokens > 0);
  assert.ok(state.verification.totalChecks >= 70);
  assert.equal(state.verification.consoleErrors, 0);
  assert.ok(state.deployment.repository.includes('github.com'));
  assert.ok(state.deployment.pages.includes('github.io'));
  assert.equal(state.skill.status, 'published');
});

test('no credentials, tokens or personal paths leak into the release', () => {
  const files = [
    'index.html', 'style.css', 'script.js', 'README.md', 'AGENTS.md', 'state.json',
    'data/playlist.json', 'docs/REPRODUCTION.md', 'docs/DEPLOYMENT.md',
  ];
  const patterns = [
    /gh[pousr]_[A-Za-z0-9]{20,}/,
    /github_pat_[A-Za-z0-9_]{20,}/,
    /sk-[A-Za-z0-9]{24,}/,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\/Users\/[A-Za-z]/,
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
  ];
  for (const file of files) {
    const text = read(file);
    for (const pattern of patterns) {
      assert.doesNotMatch(text, pattern, `${file} contains ${pattern}`);
    }
  }
});

test('CSS carries the art-deco system and responsive breakpoints', () => {
  for (const token of ['--gold:', '--cream:', '--serif:', 'prefers-reduced-motion', '@media (max-width: 1000px)', 'grid-auto-flow: row']) {
    assert.ok(css.includes(token), `CSS missing ${token}`);
  }
  assert.ok((css.match(/\{/g) || []).length > 250, 'CSS is unexpectedly small');
});
