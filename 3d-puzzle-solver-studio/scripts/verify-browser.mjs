#!/usr/bin/env node
// Generic boot + self-test smoke check for a static Three.js puzzle page.
//
//   node scripts/verify-browser.mjs http://localhost:8000/
//   node scripts/verify-browser.mjs https://user.github.io/repo/ --shot shot.png
//
// Launches one headless Chrome with a throwaway profile and --use-mock-keychain
// (no macOS Keychain prompts), reads console errors, and verifies:
//   - the page loads and either body[data-ready] or a canvas exists
//   - __puzzle15 reports 15 meshes (when present)
//   - ?selftest reaches a pass/fail result (when the app supports it)
//   - no console errors or uncaught exceptions
//
// Exit codes: 0 pass, 1 failure, 2 usage.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const shotIndex = args.indexOf('--shot');
const shotPath = shotIndex >= 0 ? args[shotIndex + 1] : null;
if (!url) {
  console.error('usage: node scripts/verify-browser.mjs <url> [--shot file.png]');
  process.exit(2);
}

const CHROME_CANDIDATES = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);
const chromePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chromePath) {
  console.error('Chrome not found; set CHROME to the executable path');
  process.exit(2);
}

const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });

const errors = [];
const checks = [];
const check = (name, ok, detail = '') => {
  checks.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let proc;
let ws;
try {
  const port = await freePort();
  const profile = mkdtempSync(join(tmpdir(), 'puzzle-verify-'));
  proc = spawn(
    chromePath,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--enable-unsafe-swiftshader',
      '--use-mock-keychain',
      '--password-store=basic',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-sync',
      '--mute-audio',
      `--user-data-dir=${profile}`,
      `--remote-debugging-port=${port}`,
      '--window-size=1600,1000',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );

  let browserWs = null;
  for (let i = 0; i < 120; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) { browserWs = (await res.json()).webSocketDebuggerUrl; break; }
    } catch { /* retry */ }
    await sleep(100);
  }
  if (!browserWs) throw new Error('Chrome DevTools endpoint did not start');

  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

  let seq = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
      return;
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      errors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      if (!msg.params.entry.url?.includes('favicon')) errors.push(msg.params.entry.text);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return result.result?.value;
  };
  const waitFor = async (expression, timeout = 25000) => {
    const start = Date.now();
    for (;;) {
      const value = await evaluate(expression);
      if (value) return value;
      if (Date.now() - start > timeout) throw new Error(`timeout: ${expression}`);
      await sleep(150);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });

  const loadEvent = () => new Promise((resolve) => {
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Page.loadEventFired') {
        ws.removeEventListener('message', handler);
        resolve();
      }
    };
    ws.addEventListener('message', handler);
  });

  await send('Page.navigate', { url });
  await loadEvent();
  await sleep(1400);

  const boot = await evaluate(`({
    ready: document.body?.dataset?.ready || null,
    canvas: Boolean(document.querySelector('canvas')),
    canvasSize: (() => { const c = document.querySelector('canvas'); return c ? [c.width, c.height] : [0, 0]; })(),
    meshes: window.__puzzle15?.meshes?.size ?? null,
    title: document.title
  })`);
  check('page loaded', Boolean(boot?.title), boot?.title || '');
  check('canvas present and sized', boot.canvas && boot.canvasSize[0] > 300 && boot.canvasSize[1] > 200, boot.canvasSize.join('×'));
  check('boot marker set', boot.ready === 'true' || !('ready' in boot), String(boot.ready));
  if (boot.meshes !== null) check('15 tile meshes', boot.meshes === 15, String(boot.meshes));
  else console.log('SKIP  15 tile meshes (no __puzzle15 debug API)');

  // Self-test, if the app has one.
  const selftestUrl = `${url}${url.includes('?') ? '&' : '?'}selftest`;
  await send('Page.navigate', { url: selftestUrl });
  await sleep(6500);
  const selftest = await evaluate('document.body?.dataset?.selftest || ""');
  if (selftest) {
    const total = await evaluate('document.body?.dataset?.selftestTotal || ""');
    check('in-page self-test', selftest === 'pass', `${total || '?'} checks, result ${selftest}`);
    if (selftest !== 'pass') {
      const rows = await evaluate(`[...document.querySelectorAll('#selftest-list li.is-fail')].map((li) => li.textContent).join(' | ')`);
      if (rows) console.log('      failures: ' + rows);
    }
  } else {
    console.log('SKIP  in-page self-test (no ?selftest result)');
  }

  if (shotPath) {
    const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    writeFileSync(shotPath, Buffer.from(data, 'base64'));
    console.log('wrote ' + shotPath);
  }

  check('no console errors', errors.length === 0, errors.slice(0, 2).join(' | '));

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
  process.exitCode = failed.length ? 1 : 0;
} catch (error) {
  console.error('verify-browser failed:', error.stack || error);
  process.exitCode = 1;
} finally {
  try { ws?.close(); } catch { /* ignore */ }
  try { proc?.kill('SIGKILL'); } catch { /* ignore */ }
}
