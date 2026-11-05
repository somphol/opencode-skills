// Headless browser suite over the Chrome DevTools Protocol.
//
//   node tests/browser.test.mjs
//   TEST_URL=https://somphol.github.io/algorithm-explorer/ node tests/browser.test.mjs
//
// One Chrome instance, mock keychain (no macOS prompts), temporary profile.

import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { connect, launchBrowser, startServer } from './lib/harness.mjs';
import { ROOT } from './lib/fixtures.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const LIVE = process.env.TEST_URL || null;
const results = [];
let server = null;

const record = async (name, fn) => {
  try {
    const detail = await fn();
    results.push({ name, ok: detail !== false, detail });
    console.log(`${detail === false ? '✖' : '✓'} ${name}`);
  } catch (error) {
    results.push({ name, ok: false, detail: error?.message || String(error) });
    console.log(`✖ ${name}\n    ${error?.message || error}`);
  }
};

const base = LIVE || (server = await startServer(ROOT)).url;
const browser = await launchBrowser({ width: 1600, height: 1000 });
const target = await (
  await fetch(`http://127.0.0.1:${browser.port}/json/new?about:blank`, { method: 'PUT' })
).json();
const cdp = await connect(target.webSocketDebuggerUrl);
const consoleErrors = [];

const evaluate = async (expression) => {
  const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
  return result?.value;
};
const waitFor = (expression, timeout = 15000) => cdp.waitFor(expression, { timeout, interval: 100 });
const navigate = async (query = '') => {
  await cdp.send('Page.navigate', { url: `${base}/${query}` });
  await waitFor('document.body && document.body.dataset.ready === "true"', 30000);
  await sleep(450);
};
const click = (selector) => evaluate(`(() => { const node = document.querySelector(${JSON.stringify(selector)}); if (!node) throw new Error('missing ${selector}'); node.click(); return true; })()`);

try {
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  cdp.on('Runtime.consoleAPICalled', (params) => {
    if (params.type === 'error') consoleErrors.push(params.args.map((arg) => arg.value || arg.description).join(' '));
  });
  cdp.on('Runtime.exceptionThrown', (params) => {
    consoleErrors.push(params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'uncaught exception');
  });
  cdp.on('Log.entryAdded', (params) => {
    if (params.entry.level === 'error') consoleErrors.push(params.entry.text);
  });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate('?test=1');

  await record('Boots the WebGL studio and default Two Pointers trace', async () => {
    const info = await evaluate(`(() => ({
      ready: document.body.dataset.ready,
      webgl: document.body.dataset.webgl,
      canvas: !!document.querySelector('#stage canvas'),
      loadingHidden: document.getElementById('stage-loading').classList.contains('is-hidden'),
      title: document.getElementById('pattern-title').textContent,
      steps: document.getElementById('step-counter').textContent,
      rail: document.querySelectorAll('.rail-item').length,
      code: document.querySelectorAll('.code-line').length,
      active: document.querySelectorAll('.code-line.is-active').length,
      practice: window.__algo.data.meta.problems
    }))()`);
    assert.equal(info.ready, 'true');
    assert.equal(info.webgl, 'true');
    assert.equal(info.canvas, true);
    assert.equal(info.loadingHidden, true);
    assert.equal(info.title, 'Two Pointers');
    assert.match(info.steps, /^Step 1 \/ \d+$/);
    assert.equal(info.rail, 15);
    assert.ok(info.code >= 8);
    assert.ok(info.active >= 1);
    assert.equal(info.practice, 61);
    return true;
  });

  await record('In-page self-test passes 24/24', async () => {
    const report = JSON.parse(await evaluate('JSON.stringify(window.__algo.runSelfTest())'));
    assert.equal(report.total, 24, JSON.stringify(report));
    assert.equal(report.passed, report.total, JSON.stringify(report.checks.filter((c) => !c.ok)));
    assert.equal(await evaluate('document.body.dataset.selftest'), '24/24');
    return true;
  });

  const patternIds = await evaluate('window.__algo.data.patterns.map(p => p.id)');
  for (const id of patternIds) {
    await record(`Pattern scene: ${id}`, async () => {
      await click(`.rail-item[data-pattern="${id}"]`);
      await sleep(220);
      const info = await evaluate(`(() => ({
        id: window.__algo.state.patternId,
        scene: window.__algo.scene.pattern,
        frames: window.__algo.state.result.frames.length,
        title: document.getElementById('pattern-title').textContent,
        code: document.getElementById('code-caption').textContent,
        active: document.querySelectorAll('.code-line.is-active').length,
        input: document.getElementById('custom-input').value,
        canvas: !!document.querySelector('#stage canvas')
      }))()`);
      assert.equal(info.id, id);
      assert.equal(info.scene, id);
      assert.ok(info.frames >= 4);
      assert.ok(info.title.length > 3);
      assert.ok(info.code.includes('·'));
      assert.ok(info.active >= 1);
      assert.ok(info.input.length > 0);
      assert.equal(info.canvas, true);
      await evaluate(`window.__algo.applyFrame(window.__algo.state.result.frames.length - 1); true`);
      await sleep(80);
      return true;
    });
  }

  await evaluate(`window.__algo.selectPattern('two-pointers'); true`);
  await sleep(250);

  await record('Transport moves forward and backward', async () => {
    const start = await evaluate('window.__algo.state.frameIndex');
    await click('#next-step');
    await sleep(90);
    const next = await evaluate(`({ index: window.__algo.state.frameIndex, step: document.getElementById('step-counter').textContent, active: document.querySelectorAll('.code-line.is-active').length })`);
    assert.equal(next.index, start + 1);
    assert.match(next.step, /^Step 2 \/ \d+$/);
    assert.ok(next.active >= 1);
    await click('#prev-step');
    await sleep(90);
    assert.equal(await evaluate('window.__algo.state.frameIndex'), start);
    return true;
  });

  await record('Slider jumps to any frame', async () => {
    const last = await evaluate('window.__algo.state.result.frames.length - 1');
    await evaluate(`(() => { const slider = document.getElementById('step-slider'); slider.value = '${last}'; slider.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
    await sleep(90);
    assert.equal(await evaluate('window.__algo.state.frameIndex'), last);
    assert.equal(await evaluate('document.getElementById("answer-chip").hidden'), false);
    return true;
  });

  await record('Play advances and pause stops the timer', async () => {
    await evaluate(`window.__algo.applyFrame(0); true`);
    const before = await evaluate('window.__algo.state.frameIndex');
    await click('#play-toggle');
    await sleep(1400);
    const during = await evaluate('window.__algo.state.frameIndex');
    assert.ok(during > before);
    await click('#play-toggle');
    await sleep(1300);
    const after = await evaluate('window.__algo.state.frameIndex');
    assert.equal(after, during);
    assert.equal(await evaluate('window.__algo.state.playing'), false);
    return true;
  });

  await record('Custom sorted-array input rebuilds a valid trace', async () => {
    await evaluate(`(() => { const input = document.getElementById('custom-input'); input.value = '1, 3, 4, 7, 9 | 10'; return true; })()`);
    await click('#apply-input');
    await sleep(250);
    const info = await evaluate(`({ answer: window.__algo.state.result.answer, steps: window.__algo.state.result.frames.length, error: document.getElementById('input-error').hidden })`);
    assert.deepEqual(info.answer, [0, 4]);
    assert.ok(info.steps >= 3);
    assert.equal(info.error, true);
    return true;
  });

  await record('Malformed input is rejected without destroying the trace', async () => {
    const before = await evaluate('window.__algo.state.result.frames.length');
    await evaluate(`(() => { document.getElementById('custom-input').value = 'not a pair'; return true; })()`);
    await click('#apply-input');
    await sleep(120);
    const info = await evaluate(`({ error: document.getElementById('input-error').hidden, message: document.getElementById('input-error').textContent, steps: window.__algo.state.result.frames.length })`);
    assert.equal(info.error, false);
    assert.ok(info.message.length > 5);
    assert.equal(info.steps, before);
    await click('#reset-input');
    await sleep(200);
    return true;
  });

  await record('Language tabs swap Python, JavaScript and C++', async () => {
    for (const language of ['javascript', 'cpp', 'python']) {
      await click(`.lang[data-lang="${language}"]`);
      await sleep(80);
      const info = await evaluate(`({ lang: window.__algo.state.language, caption: document.getElementById('code-caption').textContent, active: document.querySelectorAll('.code-line.is-active').length })`);
      assert.equal(info.lang, language);
      assert.ok(info.caption.length > 6);
      assert.ok(info.active >= 1);
    }
    return true;
  });

  await record('Canonical LeetCode links are present', async () => {
    const links = await evaluate(`[...document.querySelectorAll('#pattern-problems a')].map(a => ({ href: a.href, target: a.target }))`);
    assert.ok(links.length >= 4);
    assert.ok(links.every((link) => link.href.includes('leetcode.com/problems/')));
    assert.ok(links.every((link) => link.target === '_blank'));
    return true;
  });

  await record('Quiz tab renders the pattern-recognition question', async () => {
    await click('.tab[data-tab="quiz"]');
    await sleep(150);
    const info = await evaluate(`({ hidden: document.getElementById('panel-quiz').hidden, options: document.querySelectorAll('.quiz-option').length, count: document.getElementById('quiz-count').textContent, dots: document.querySelectorAll('.quiz-dot').length })`);
    assert.equal(info.hidden, false);
    assert.equal(info.options, 4);
    assert.match(info.count, /Question 1 of 30/);
    assert.equal(info.dots, 30);
    return true;
  });

  await record('Quiz gives immediate correct feedback', async () => {
    const answer = await evaluate(`(() => { const q = window.__algo.data.quiz[window.__algo.state.quiz.order[window.__algo.state.quiz.index]]; return q.answer; })()`);
    await click(`.quiz-option[data-option="${answer}"]`);
    await sleep(100);
    const info = await evaluate(`({ feedback: document.getElementById('quiz-feedback').hidden, verdict: document.getElementById('quiz-verdict').textContent, correct: document.querySelectorAll('.quiz-option.is-correct').length, next: document.getElementById('quiz-next').hidden })`);
    assert.equal(info.feedback, false);
    assert.match(info.verdict, /Correct/);
    assert.equal(info.correct, 1);
    assert.equal(info.next, false);
    return true;
  });

  await record('Quiz advances and marks a wrong answer', async () => {
    await click('#quiz-next');
    await sleep(120);
    const answer = await evaluate(`(() => { const q = window.__algo.data.quiz[window.__algo.state.quiz.order[window.__algo.state.quiz.index]]; return q.answer; })()`);
    const wrong = (answer + 1) % 4;
    await click(`.quiz-option[data-option="${wrong}"]`);
    await sleep(100);
    const info = await evaluate(`({ bad: document.getElementById('quiz-feedback').classList.contains('bad'), wrong: document.querySelectorAll('.quiz-option.is-wrong').length, score: document.getElementById('quiz-score').textContent, streak: document.getElementById('quiz-streak').textContent })`);
    assert.equal(info.bad, true);
    assert.equal(info.wrong, 1);
    assert.equal(info.score, '1');
    assert.equal(info.streak, '0');
    return true;
  });

  await record('A full quiz round records a 100% personal best', async () => {
    await evaluate('window.__algo.startQuizRound(false); true');
    await sleep(150);
    for (let i = 0; i < 30; i++) {
      const answer = await evaluate(`(() => { const q = window.__algo.data.quiz[window.__algo.state.quiz.order[window.__algo.state.quiz.index]]; return q.answer; })()`);
      await click(`.quiz-option[data-option="${answer}"]`);
      await click('#quiz-next');
      await sleep(18);
    }
    await sleep(150);
    const info = await evaluate(`({ best: document.getElementById('quiz-best').textContent, text: document.getElementById('quiz-question').textContent, finished: window.__algo.state.quiz.finished, stored: JSON.parse(localStorage.getItem('algoExplorer.quiz.v1')).best, results: document.querySelectorAll('.quiz-results div').length })`);
    assert.equal(info.best, '100%');
    assert.match(info.text, /100%/);
    assert.equal(info.finished, true);
    assert.equal(info.stored, 100);
    assert.equal(info.results, 4);
    return true;
  });

  await record('Practice tab lists all 61 canonical problems', async () => {
    await click('.tab[data-tab="practice"]');
    await sleep(150);
    const info = await evaluate(`({ hidden: document.getElementById('panel-practice').hidden, rows: document.querySelectorAll('.problem-row').length, groups: document.querySelectorAll('.practice-group').length, count: document.getElementById('practice-count').textContent })`);
    assert.equal(info.hidden, false);
    assert.equal(info.rows, 61);
    assert.equal(info.groups, 15);
    assert.match(info.count, /^0 \/ 61$/);
    return true;
  });

  await record('Difficulty and search filters narrow the list', async () => {
    await click('.filter[data-difficulty="Easy"]');
    await sleep(100);
    const easy = await evaluate(`({ rows: document.querySelectorAll('.problem-row').length, allEasy: [...document.querySelectorAll('.difficulty')].every(d => d.textContent === 'Easy') })`);
    assert.ok(easy.rows > 0 && easy.rows < 61);
    assert.equal(easy.allEasy, true);
    await click('.filter[data-difficulty="all"]');
    await evaluate(`(() => { const input = document.getElementById('practice-search'); input.value = 'islands'; input.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
    await sleep(120);
    const search = await evaluate(`({ rows: document.querySelectorAll('.problem-row').length, text: document.getElementById('practice-list').textContent })`);
    assert.ok(search.rows >= 1 && search.rows < 10);
    assert.match(search.text, /Number of Islands/);
    await evaluate(`(() => { const input = document.getElementById('practice-search'); input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
    return true;
  });

  await record('Checkbox progress persists to localStorage and after reload', async () => {
    await click('.problem-check input');
    await sleep(120);
    const stored = await evaluate(`JSON.parse(localStorage.getItem('algoExplorer.progress.v1')).done`);
    const keys = Object.keys(stored).filter((key) => stored[key]);
    assert.equal(keys.length, 1);
    await navigate('?test=1');
    await click('.tab[data-tab="practice"]');
    await sleep(200);
    const after = await evaluate(`({ checked: document.querySelectorAll('.problem-check input:checked').length, count: document.getElementById('practice-count').textContent })`);
    assert.equal(after.checked, 1);
    assert.match(after.count, /^1 \/ 61$/);
    await click('#clear-progress');
    await sleep(150);
    assert.equal(await evaluate('document.querySelectorAll(".problem-check input:checked").length'), 0);
    return true;
  });

  await record('Help and About dialogs open and close', async () => {
    await click('#help-btn');
    await sleep(100);
    assert.equal(await evaluate('document.getElementById("help-dialog").open'), true);
    await click('#help-dialog [data-close]');
    await sleep(80);
    assert.equal(await evaluate('document.getElementById("help-dialog").open'), false);
    await click('#about-btn');
    await sleep(100);
    assert.equal(await evaluate('document.getElementById("about-dialog").open'), true);
    const stats = await evaluate('document.getElementById("about-stats").textContent');
    assert.match(stats, /15/);
    assert.match(stats, /61/);
    await click('#about-dialog [data-close]');
    return true;
  });

  await record('Keyboard shortcuts step, switch pattern and language', async () => {
    await click('.tab[data-tab="visualizer"]');
    await sleep(120);
    await evaluate('document.querySelector(".rail-item[data-pattern=\\"two-pointers\\"]").click(); true');
    await sleep(200);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    await sleep(100);
    assert.equal(await evaluate('window.__algo.state.frameIndex'), 1);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: ']', code: 'BracketRight', windowsVirtualKeyCode: 221 });
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ']', code: 'BracketRight', windowsVirtualKeyCode: 221 });
    await sleep(220);
    assert.equal(await evaluate('window.__algo.state.patternId'), 'sliding-window');
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: '3', code: 'Digit3', windowsVirtualKeyCode: 51 });
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: '3', code: 'Digit3', windowsVirtualKeyCode: 51 });
    await sleep(120);
    assert.equal(await evaluate('window.__algo.state.language'), 'cpp');
    return true;
  });

  await record('Mobile viewport keeps the studio usable with no horizontal overflow', async () => {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await navigate('?test=1');
    await sleep(400);
    const info = await evaluate(`(() => ({
      width: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      canvas: !!document.querySelector('#stage canvas'),
      tabs: [...document.querySelectorAll('.tab')].every(t => t.getBoundingClientRect().width > 40),
      rail: document.querySelectorAll('.rail-item').length,
      stageHeight: document.getElementById('stage').getBoundingClientRect().height
    }))()`);
    assert.ok(info.scroll <= info.width + 1, `scroll ${info.scroll} > ${info.width}`);
    assert.equal(info.canvas, true);
    assert.equal(info.tabs, true);
    assert.equal(info.rail, 15);
    assert.ok(info.stageHeight > 300);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync('/tmp/algo-mobile-test.png', Buffer.from(shot.data, 'base64'));
    return true;
  });

  await record('No console errors or uncaught exceptions', async () => {
    const relevant = consoleErrors.filter((error) => !/favicon|net::ERR|Failed to load resource/i.test(error));
    assert.deepEqual(relevant, []);
    return true;
  });
} finally {
  cdp.close();
  browser.proc.kill('SIGKILL');
  if (server) await server.close();
}

const passed = results.filter((item) => item.ok).length;
console.log(`\n${passed}/${results.length} browser checks passed`);
if (passed !== results.length) {
  for (const item of results.filter((entry) => !entry.ok)) console.log(`  FAIL ${item.name}: ${item.detail}`);
  process.exitCode = 1;
}
