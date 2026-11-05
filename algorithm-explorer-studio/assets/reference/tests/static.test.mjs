import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read } from './lib/fixtures.mjs';

const exists = (file) => existsSync(join(ROOT, file));
const text = (file) => read(file);
const json = (file) => JSON.parse(text(file));

test('source files exist', () => {
  for (const file of ['index.html', 'css/style.css', 'js/data.js', 'js/algorithms.js', 'js/scene.js', 'js/app.js', 'assets/favicon.svg']) {
    assert.ok(exists(file), file);
    assert.ok(statSync(join(ROOT, file)).size > 100, file);
  }
});

test('release documents and community files exist', () => {
  const files = [
    'README.md', 'AGENTS.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md', 'SUPPORT.md',
    'LICENSE', 'THIRD_PARTY_NOTICES.md', 'state.json', 'package.json', '.gitignore', '.editorconfig', '.nojekyll',
    'robots.txt', 'sitemap.xml', '.github/workflows/ci.yml', '.github/ISSUE_TEMPLATE/bug_report.yml',
    '.github/ISSUE_TEMPLATE/feature_request.yml', '.github/pull_request_template.md',
    'docs/README.md', 'docs/ARCHITECTURE.md', 'docs/REPRODUCTION.md', 'docs/CURRICULUM.md', 'docs/DESIGN.md',
    'docs/TESTING.md', 'docs/DEPLOYMENT.md', 'docs/DECISIONS.md', 'docs/ACCESSIBILITY.md', 'docs/PERFORMANCE.md',
    'docs/PRIVACY.md', 'docs/FAQ.md', 'docs/ROADMAP.md'
  ];
  for (const file of files) assert.ok(exists(file), file);
});

test('HTML shell is complete and semantic', () => {
  const html = text('index.html');
  assert.match(html, /^<!DOCTYPE html>/);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /id="stage"/);
  assert.match(html, /role="tablist"/);
  assert.equal((html.match(/data-tab="/g) || []).length, 3);
  assert.ok((html.match(/role="tabpanel"/g) || []).length >= 3);
  assert.match(html, /id="panel-visualizer"/);
  assert.match(html, /id="panel-quiz"/);
  assert.match(html, /id="panel-practice"/);
  assert.match(html, /id="help-dialog"/);
  assert.match(html, /id="about-dialog"/);
});

test('script order is fixed and no inline handlers exist', () => {
  const html = text('index.html');
  const order = ['three.min.js', 'OrbitControls.js', 'js/data.js', 'js/algorithms.js', 'js/scene.js', 'js/app.js'];
  let cursor = -1;
  for (const needle of order) {
    const index = html.indexOf(needle);
    assert.ok(index > cursor, `${needle} order`);
    cursor = index;
  }
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
  const inlineScripts = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.equal(inlineScripts.length, 0);
});

test('three tabs and the transport expose the expected controls', () => {
  const html = text('index.html');
  for (const id of ['prev-step', 'play-toggle', 'next-step', 'reset-steps', 'step-slider', 'speed-slider', 'custom-input', 'apply-input', 'code-view', 'copy-code']) {
    assert.match(html, new RegExp(`id="${id}"`), id);
  }
  assert.match(html, /data-lang="python"/);
  assert.match(html, /data-lang="javascript"/);
  assert.match(html, /data-lang="cpp"/);
});

test('CSS defines the design system and responsive rules', () => {
  const css = text('css/style.css');
  assert.match(css, /:root\s*\{/);
  assert.match(css, /--bg:/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media \(max-width: 860px\)/);
  assert.match(css, /@media \(max-width: 560px\)/);
  assert.ok(css.length > 20000, 'stylesheet should carry the full surface');
});

test('runtime JavaScript parses', () => {
  for (const file of ['js/data.js', 'js/algorithms.js', 'js/scene.js', 'js/app.js']) {
    assert.doesNotThrow(() => new Function(text(file)), file);
  }
});

test('runtime files do not ship debug noise', () => {
  for (const file of ['js/data.js', 'js/algorithms.js', 'js/scene.js', 'js/app.js']) {
    const source = text(file);
    assert.doesNotMatch(source, /console\.(log|error|warn|debug)/, file);
    assert.doesNotMatch(source, /\bdebugger\b/, file);
    assert.doesNotMatch(source, /\b(TODO|FIXME)\b/, file);
    assert.doesNotMatch(source, /\beval\s*\(/, file);
  }
});

test('dataset contract and canonical counts', () => {
  const data = new Function(`${text('js/data.js')}; return ALGO_DATA;`)();
  assert.equal(data.patterns.length, 15);
  assert.equal(data.quiz.length, 30);
  assert.equal(data.meta.problems, 61);
  assert.equal(new Set(data.patterns.map((p) => p.id)).size, 15);
  assert.deepEqual(data.patterns.map((p) => p.index), Array.from({ length: 15 }, (_, i) => i + 1));
  for (const pattern of data.patterns) {
    assert.ok(pattern.problems.length >= 4, pattern.id);
    assert.ok(pattern.code.python.length >= 6 && pattern.code.javascript.length >= 6 && pattern.code.cpp.length >= 6, pattern.id);
  }
});

test('quiz questions are well formed', () => {
  const data = new Function(`${text('js/data.js')}; return ALGO_DATA;`)();
  const ids = new Set(data.patterns.map((p) => p.id));
  for (const question of data.quiz) {
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(question.answer >= 0 && question.answer < 4);
    assert.ok(question.explain.length > 30);
    assert.ok(ids.has(question.pattern));
  }
  assert.equal(new Set(data.quiz.map((q) => q.pattern)).size, 15);
});

test('state.json records the build', () => {
  const state = json('state.json');
  assert.equal(state.project, 'Algorithm Explorer: Top 15 SWE Interview Patterns');
  assert.equal(state.release, '1.0.0');
  assert.ok(state.session.id.startsWith('ses_'));
  assert.ok(state.session.elapsedSeconds > 0);
  assert.equal(state.model.name, 'DeepSeek V4.1 Flash');
  assert.equal(state.model.provider, 'opencode-go');
  for (const key of ['inputTokens', 'outputTokens', 'reasoningTokens', 'cacheReadTokens', 'cacheWriteTokens', 'totalTokens']) {
    assert.ok(Number.isFinite(state.usage[key]), key);
  }
  assert.ok(state.artifacts.sourceFiles.length >= 6);
  assert.ok(state.verification.totalChecks >= 100);
  assert.equal(state.credits.tool, 'OpenCode');
});

test('search and hosting metadata are present', () => {
  assert.match(text('sitemap.xml'), /https:\/\/somphol\.github\.io\/algorithm-explorer\//);
  assert.match(text('robots.txt'), /Sitemap:/);
  assert.match(text('robots.txt'), /Allow: \//);
  assert.equal(text('.nojekyll'), '');
  const html = text('index.html');
  assert.match(html, /og:title/);
  assert.match(html, /og:image/);
  assert.match(html, /theme-color/);
});

test('README and AGENTS links resolve', () => {
  for (const file of ['README.md', 'AGENTS.md', 'docs/README.md']) {
    const source = text(file);
    const links = [...source.matchAll(/\]\(([^)#]+)(?:#[^)]+)?\)/g)].map((m) => m[1]);
    for (const link of links) {
      if (/^(https?:|mailto:)/.test(link)) continue;
      const resolved = join(file.startsWith('docs/') ? 'docs' : '', link);
      assert.ok(exists(resolvePath(file, link)), `${file} -> ${link}`);
    }
  }
  function resolvePath(fromFile, link) {
    const base = fromFile.includes('/') ? fromFile.slice(0, fromFile.lastIndexOf('/')) : '';
    return join(base, link);
  }
});

test('AGENTS.md has the handoff sections', () => {
  const source = text('AGENTS.md');
  for (const heading of ['What it is', 'Commands', 'Architecture', 'Decisions and constraints', 'Known issues', 'Continuity']) {
    assert.match(source, new RegExp(`## \\d\\. ${heading}`), heading);
  }
  assert.match(source, /REPRODUCTION\.md/);
  assert.match(source, /state\.json/);
});

test('no secrets, keys or personal paths in tracked text', () => {
  const files = [
    'index.html', 'css/style.css', 'js/data.js', 'js/algorithms.js', 'js/scene.js', 'js/app.js',
    'README.md', 'AGENTS.md', 'state.json', 'docs/REPRODUCTION.md', 'docs/DEPLOYMENT.md'
  ];
  const patterns = [
    /gh[pousr]_[A-Za-z0-9]{20,}/,
    /github_pat_[A-Za-z0-9_]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /sk-[A-Za-z0-9]{20,}/,
    /\/Users\/somphol\//,
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
  ];
  for (const file of files) {
    for (const pattern of patterns) assert.doesNotMatch(text(file), pattern, `${file} matched ${pattern}`);
  }
});

test('package scripts match the documented gates', () => {
  const pkg = json('package.json');
  assert.match(pkg.scripts.test, /tests\/engine\.test\.mjs/);
  assert.match(pkg.scripts.test, /tests\/static\.test\.mjs/);
  assert.match(pkg.scripts['test:browser'], /tests\/browser\.test\.mjs/);
  assert.match(pkg.scripts.verify, /npm test/);
  assert.match(pkg.scripts.start, /http\.server/);
});

test('source files are substantial and UTF-8 clean', () => {
  const minimum = { 'index.html': 9000, 'css/style.css': 20000, 'js/data.js': 45000, 'js/algorithms.js': 30000, 'js/scene.js': 45000, 'js/app.js': 25000 };
  for (const [file, size] of Object.entries(minimum)) {
    const source = text(file);
    assert.ok(source.length >= size, `${file} ${source.length} < ${size}`);
    assert.ok(!source.includes('\uFFFD'), `${file} has a replacement character`);
  }
});

test('licence and third-party notices match the product', () => {
  const licence = text('LICENSE');
  assert.match(licence, /MIT License/);
  assert.match(licence, /2026 Somphol Boonjing/);
  const notices = text('THIRD_PARTY_NOTICES.md');
  assert.match(notices, /Three\.js/);
  assert.match(notices, /OrbitControls/);
  assert.match(notices, /LeetCode/);
  assert.match(notices, /not affiliated/i);
});

test('documentation screenshots and social card exist', () => {
  for (const file of ['assets/studio.png', 'assets/tree.png', 'assets/quiz.png', 'assets/practice.png', 'assets/mobile.png', 'assets/og-card.png', 'assets/og.html']) {
    assert.ok(exists(file), file);
    assert.ok(statSync(join(ROOT, file)).size > 1000, file);
  }
});

test('runtime has no hidden network, analytics or tracking calls', () => {
  for (const file of ['js/data.js', 'js/algorithms.js', 'js/scene.js', 'js/app.js']) {
    const source = text(file);
    assert.doesNotMatch(source, /\bfetch\s*\(/, file);
    assert.doesNotMatch(source, /XMLHttpRequest|sendBeacon|navigator\.geolocation/, file);
    assert.doesNotMatch(source, /google-analytics|googletagmanager|plausible|posthog|mixpanel/i, file);
  }
});
