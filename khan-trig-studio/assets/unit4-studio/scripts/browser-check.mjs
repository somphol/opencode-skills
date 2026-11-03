#!/usr/bin/env node
/**
 * Headless browser acceptance check for the Unit 4 studio.
 *
 *   node scripts/browser-check.mjs
 *   CHROME_BIN="/path/to/Chrome" node scripts/browser-check.mjs
 *
 * Requires Node 22+ (global WebSocket) and a local Chrome/Chromium.
 * It launches a temporary profile, drives the app over the DevTools Protocol,
 * prints PASS/FAIL lines, and exits 1 if anything fails.
 *
 * This is intentionally dependency-free and is not run in CI; CI only runs the
 * static checks. Run it before a release or after changing canvas/quiz logic.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

const chromeCandidates = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean);
const chrome = chromeCandidates.find((candidate) => existsSync(candidate));

if (!chrome) {
  console.error('Chrome/Chromium not found. Set CHROME_BIN to the executable path.');
  process.exit(1);
}
if (typeof WebSocket === 'undefined') {
  console.error('This check needs Node 22+ (global WebSocket).');
  process.exit(1);
}

const port = 9600 + Math.floor(Math.random() * 300);
const profile = await mkdtemp(join(tmpdir(), 'khan-trig-u4-'));
const browser = spawn(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${port}`,
  '--remote-allow-origins=*',
  'about:blank'
], { stdio: 'ignore' });

const results = [];
function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function targetUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await response.json();
      const page = list.find((entry) => entry.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch (_) { /* not up yet */ }
    await sleep(150);
  }
  throw new Error('Chrome did not expose a page target');
}

let ws;
try {
  ws = new WebSocket(await targetUrl());
  await new Promise((resolveWs, rejectWs) => {
    ws.onopen = resolveWs;
    ws.onerror = rejectWs;
  });

  let nextId = 0;
  const pending = new Map();
  const exceptions = [];
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const handlers = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) handlers.reject(new Error(JSON.stringify(message.error)));
      else handlers.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') {
      exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    }
  };

  const send = (method, params = {}) => new Promise((resolveSend, rejectSend) => {
    const id = ++nextId;
    pending.set(id, { resolve: resolveSend, reject: rejectSend });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    }
    return result.result.value;
  };
  const waitForApp = async () => {
    for (let i = 0; i < 60; i++) {
      const ready = await evaluate("!!document.getElementById('panel-inverse')").catch(() => false);
      if (ready) return;
      await sleep(150);
    }
    throw new Error('app did not load');
  };
  const click = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)})?.click()`);

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false
  });
  await send('Page.navigate', {
    url: `${pathToFileURL(join(root, 'index.html')).href}?browser-check=${Date.now()}`
  });
  await waitForApp();
  await sleep(700);

  /* ---------------------------- inverse module ---------------------------- */
  await click('#tab-inverse');
  await sleep(400);

  const inverseDefault = await evaluate(`({
    equation: document.getElementById('resultEquation').textContent,
    exact: document.getElementById('resExact').textContent,
    domain: document.getElementById('domainBadge').textContent
  })`);
  record(
    'arcsin(0.5) returns π/6',
    /arcsin\(0\.50\) = π\/6/.test(inverseDefault.equation) && inverseDefault.exact === 'π/6' && inverseDefault.domain.toLowerCase() === 'valid',
    inverseDefault.equation
  );

  await evaluate("(() => { const s = document.getElementById('invInput'); s.value = '1.5'; s.dispatchEvent(new Event('input', { bubbles: true })); })()");
  await sleep(250);
  const outOfRange = await evaluate(`({
    badge: document.getElementById('inputBadge').textContent,
    equation: document.getElementById('resultEquation').textContent
  })`);
  record(
    'arcsin(1.5) is undefined',
    /outside range/i.test(outOfRange.badge) && outOfRange.equation.includes('—'),
    outOfRange.badge
  );

  await evaluate("(() => { const s = document.getElementById('invInput'); s.value = '0.5'; s.dispatchEvent(new Event('input', { bubbles: true })); })()");
  await evaluate("(() => { const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }; set('domMin', '-12'); set('domMax', '12'); })()");
  await sleep(300);
  const badDomain = await evaluate(`({
    badge: document.getElementById('domainBadge').textContent,
    equation: document.getElementById('resultEquation').textContent
  })`);
  record(
    'domain [−π, π] is rejected',
    /not one-to-one/i.test(badDomain.badge) && badDomain.equation.includes('—'),
    badDomain.badge
  );
  await evaluate("(() => { const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }; set('domMin', '-6'); set('domMax', '6'); })()");

  /* ---------------------------- identity module --------------------------- */
  await click('#tab-identity');
  await sleep(400);
  await evaluate("[...document.querySelectorAll('.expr-chip')].find(b => b.textContent.includes('sec²θ − tan²θ'))?.click()");
  await sleep(300);
  await evaluate("document.querySelectorAll('#choiceGrid .choice-btn')[0]?.click()");
  await sleep(800);
  const stepOne = await evaluate(`({
    expr: document.getElementById('currentExpr').textContent.trim(),
    feedback: document.getElementById('identityFeedback').textContent
  })`);
  record('identity step 1 advances', stepOne.expr.includes('1 + tan²θ'), stepOne.expr);

  await evaluate("document.querySelectorAll('#choiceGrid .choice-btn')[0]?.click()");
  await sleep(900);
  const identityDone = await evaluate(`({
    expr: document.getElementById('currentExpr').textContent.trim(),
    prompt: document.getElementById('stepPrompt').textContent
  })`);
  record('sec²θ − tan²θ simplifies to 1', identityDone.expr === '1' && /completely|ครบแล้ว/i.test(identityDone.prompt), identityDone.prompt);

  /* ---------------------------- equation solver --------------------------- */
  await click('#tab-solver');
  await sleep(300);
  const basicMap = {
    '2sinθ − 1 = 0': 'π/6, 5π/6',
    '2cosθ + 1 = 0': '2π/3, 4π/3',
    '√3 tanθ − 3 = 0': 'π/3, 4π/3',
    '√2 cosθ − 1 = 0': 'π/4, 7π/4',
    '2sinθ + √3 = 0': '4π/3, 5π/3',
    'tanθ + 1 = 0': '3π/4, 7π/4',
    'sinθ = 1': 'π/2',
    'cosθ = −1': 'π'
  };
  const basicResult = await evaluate(`(() => {
    const map = ${JSON.stringify(basicMap)};
    const eq = document.getElementById('problemEquation').textContent.trim();
    const answer = map[eq];
    if (!answer) return { ok: false, eq };
    const input = document.getElementById('answerInput');
    input.value = answer;
    document.getElementById('answerForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return { ok: true, eq, answer, good: document.getElementById('feedback').classList.contains('is-good') };
  })()`);
  record('basic equation answer accepted', Boolean(basicResult.ok && basicResult.good), basicResult.eq || 'unknown equation');

  await click('#stepsBtn');
  await sleep(2300);
  const stepCount = await evaluate("document.querySelectorAll('#stepsList li').length");
  record('basic solution reveals steps', stepCount === 4, `${stepCount} steps`);

  await click('#newProblemBtn');
  await sleep(250);
  await click('.mode-btn[data-qmode="quadratic"]');
  await sleep(350);
  const quadraticMap = {
    '2cos²θ − cosθ − 1 = 0': '0, 2π/3, 4π/3',
    '2sin²θ − sinθ − 1 = 0': 'π/2, 7π/6, 11π/6',
    '2cos²θ + cosθ − 1 = 0': 'π/3, π, 5π/3',
    '2sin²θ + sinθ − 1 = 0': 'π/6, 5π/6, 3π/2',
    '4sin²θ − 1 = 0': 'π/6, 5π/6, 7π/6, 11π/6',
    'cos²θ − 1 = 0': '0, π'
  };
  const quadraticResult = await evaluate(`(() => {
    const map = ${JSON.stringify(quadraticMap)};
    const eq = document.getElementById('problemEquation').textContent.trim();
    const answer = map[eq];
    if (!answer) return { ok: false, eq };
    const input = document.getElementById('answerInput');
    input.value = answer;
    document.getElementById('answerForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return { ok: true, eq, good: document.getElementById('feedback').classList.contains('is-good') };
  })()`);
  record('quadratic equation answer accepted', Boolean(quadraticResult.ok && quadraticResult.good), quadraticResult.eq || 'unknown equation');

  await click('#newProblemBtn');
  await sleep(250);
  await click('.mode-btn[data-qmode="identity"]');
  await sleep(400);
  const identityMap = {
    'sin²θ + cos²θ': '1',
    'sec²θ − tan²θ': '1',
    'csc²θ − cot²θ': '1',
    'sin³θ + sinθcos²θ': 'sinθ',
    '(1 − cos²θ) / sinθ': 'sinθ',
    'tanθ · cosθ': 'sinθ',
    '(sec²θ − 1) / tan²θ': '1'
  };
  const identityPractice = await evaluate(`(() => {
    const map = ${JSON.stringify(identityMap)};
    const expr = document.getElementById('problemEquation').textContent.trim();
    const answer = map[expr];
    const button = [...document.querySelectorAll('#optionsGrid .option-btn')].find(b => b.textContent.trim() === answer);
    if (!button) return { ok: false, expr };
    button.click();
    return {
      ok: true,
      expr,
      good: document.getElementById('feedback').classList.contains('is-good'),
      disabled: [...document.querySelectorAll('#optionsGrid .option-btn')].every(b => b.disabled),
      steps: document.querySelectorAll('#stepsList li').length
    };
  })()`);
  record('identity proof option accepted', Boolean(identityPractice.ok && identityPractice.good && identityPractice.disabled), identityPractice.expr || 'unknown expression');
  record('identity proof shows explanation', identityPractice.steps >= 2, `${identityPractice.steps} steps`);

  /* ------------------------------- i18n/reload ---------------------------- */
  await click('#langToggle');
  await sleep(400);
  const thai = await evaluate(`({
    lang: document.documentElement.lang,
    title: document.querySelector('.brand h1').textContent,
    tag: document.getElementById('problemTag').textContent
  })`);
  record('Thai language switch works', thai.lang === 'th' && thai.title.includes('คู่มือ'), thai.title);

  await click('#tab-inverse');
  await sleep(250);
  await send('Page.reload', { ignoreCache: false });
  await waitForApp();
  await sleep(700);
  const reloaded = await evaluate(`({
    lang: document.documentElement.lang,
    correct: Number(document.getElementById('quizCorrect').textContent),
    done: [...document.querySelectorAll('.tab')].filter(t => t.classList.contains('is-done')).length
  })`);
  record('reload restores language and progress', reloaded.lang === 'th' && reloaded.correct >= 3 && reloaded.done === 3, `${reloaded.correct} correct, ${reloaded.done} tabs`);

  /* --------------------------------- export ------------------------------- */
  const exportShape = await evaluate(`(() => {
    let captured = null;
    const original = URL.createObjectURL;
    URL.createObjectURL = (blob) => { captured = blob; return original.call(URL, blob); };
    document.getElementById('exportBtn').click();
    URL.createObjectURL = original;
    return { type: captured && captured.type, size: captured && captured.size };
  })()`);
  record('progress export is JSON', exportShape.type === 'application/json' && exportShape.size > 100, `${exportShape.size} bytes`);

  /* --------------------------------- mobile ------------------------------- */
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(400);
  await click('#tab-inverse');
  await sleep(400);
  const mobileInverse = await evaluate("document.documentElement.scrollWidth - window.innerWidth");
  await click('#tab-identity');
  await sleep(400);
  const mobileIdentity = await evaluate("document.documentElement.scrollWidth - window.innerWidth");
  record('mobile layout has no horizontal overflow', mobileInverse <= 0 && mobileIdentity <= 0, `${mobileInverse}/${mobileIdentity}px`);

  record('no uncaught exceptions', exceptions.length === 0, exceptions.join('; '));

  const failed = results.filter((item) => !item.passed);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length) process.exitCode = 1;
} catch (error) {
  console.error(`Browser check failed to run: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (ws) {
    try { ws.close(); } catch (_) { /* ignore */ }
  }
  browser.kill('SIGTERM');
  await sleep(250);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
