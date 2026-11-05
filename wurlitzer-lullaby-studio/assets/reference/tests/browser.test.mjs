// Headless browser suite over the Chrome DevTools Protocol.
//
//   node tests/browser.test.mjs
//   TEST_URL=https://somphol.github.io/vintage-wurlitzer-lullaby-jukebox/ node tests/browser.test.mjs
//
// One Chrome instance, mock keychain (no macOS prompts), temporary profile.

import assert from 'node:assert/strict';
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

const evaluate = async (expression, userGesture = false) => {
  const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture,
  });
  if (exceptionDetails) {
    throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
  }
  return result?.value;
};

const waitFor = (expression, timeout = 20000) => cdp.waitFor(expression, { timeout, interval: 120 });

const navigate = async (query = '') => {
  await cdp.send('Page.navigate', { url: `${base}/${query}` });
  await waitFor('document.body && document.body.dataset.ready === "true"', 30000);
  await waitFor('document.body.dataset.manifest !== undefined', 15000);
  await sleep(500);
};

const click = (selector, userGesture = false) => evaluate(`(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  if (!el) throw new Error('missing selector: ' + ${JSON.stringify(selector)});
  el.click();
  return true;
})()`, userGesture);

const text = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent?.trim() || ''`);

try {
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  cdp.on('Runtime.consoleAPICalled', (params) => {
    if (params.type === 'error') {
      consoleErrors.push(params.args.map((arg) => arg.value || arg.description).join(' '));
    }
  });
  cdp.on('Runtime.exceptionThrown', (params) => {
    consoleErrors.push(params.exceptionDetails?.exception?.description || 'uncaught exception');
  });
  cdp.on('Log.entryAdded', (params) => {
    if (params.entry.level === 'error') consoleErrors.push(params.entry.text);
  });

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1600,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp.send('Storage.clearDataForOrigin', {
    origin: new URL(base).origin,
    storageTypes: 'local_storage',
  });

  await navigate('?test=boot');

  await record('Boots the 3D cabinet, rack, keypad and manifest', async () => {
    const info = await evaluate(`(() => ({
      ready: document.body.dataset.ready,
      webgl: document.body.dataset.webgl,
      manifest: document.body.dataset.manifest,
      canvas: Boolean(document.querySelector('#stage-canvas canvas')),
      cabinet: window.__wurlitzer.scene?.cabinet.children.length || 0,
      strips: document.querySelectorAll('#rack-grid .strip').length,
      keys: document.querySelectorAll('.key').length,
      bubbles: window.__wurlitzer.scene?.bubbles.length || 0,
      bulbs: window.__wurlitzer.scene?.bulbs.length || 0,
      tracks: window.__wurlitzer.tracks.length
    }))()`);
    assert.equal(info.ready, 'true');
    assert.equal(info.webgl, 'true');
    assert.equal(info.manifest, 'ok');
    assert.equal(info.canvas, true);
    assert.ok(info.cabinet >= 30, `cabinet children: ${info.cabinet}`);
    assert.equal(info.strips, 8);
    assert.equal(info.keys, 19);
    assert.ok(info.bubbles >= 40);
    assert.equal(info.bulbs, 30);
    assert.equal(info.tracks, 82);
    return true;
  });

  await record('In-page self-test passes every check', async () => {
    const report = JSON.parse(await evaluate('window.__wurlitzer.runSelfTest(false).then((r) => JSON.stringify(r))'));
    assert.equal(report.total, 27);
    assert.equal(report.passed, report.total, JSON.stringify(report.checks.filter((c) => !c.ok)));
    assert.equal(await evaluate('document.body.dataset.selftest'), '27/27');
    return true;
  });

  await record('First-listen playlist starts with a real archive performance', async () => {
    const prompt = await evaluate(`(() => ({
      visible: !document.getElementById('start-playlist').hidden,
      queue: window.__wurlitzer.queueTracks().length
    }))()`);
    assert.equal(prompt.visible, true);
    assert.equal(prompt.queue, 8);
    await click('#start-playlist', true);
    await sleep(1000);
    const info = await evaluate(`(() => ({
      current: window.__wurlitzer.current.id,
      slot: window.__wurlitzer.current.slot,
      status: window.__wurlitzer.audio.status,
      overlay: !document.getElementById('now-overlay').hidden,
      title: document.getElementById('overlay-title').textContent,
      source: document.getElementById('overlay-source').href,
      queue: document.getElementById('overlay-queue').textContent
    }))()`);
    assert.equal(info.current, 'archive-h1');
    assert.equal(info.slot, 'H-1');
    assert.ok(['loading', 'playing'].includes(info.status));
    assert.equal(info.overlay, true);
    assert.match(info.title, /Berceuse/);
    assert.match(info.source, /^https:\/\/commons\.wikimedia\.org\//);
    assert.match(info.queue, /1\/8/);
    return true;
  });

  await record('Now-playing card links to the original source', async () => {
    const info = await evaluate(`(() => {
      const link = document.getElementById('now-source');
      return {
        visible: !link.hidden,
        href: link.href,
        license: document.getElementById('overlay-license').textContent
      };
    })()`);
    assert.equal(info.visible, true);
    assert.match(info.href, /^https:\/\/commons\.wikimedia\.org\//);
    assert.match(info.license, /Public domain/);
    return true;
  });

  await record('Selecting A-2 starts the synth engine', async () => {
    await click('.collection-tab[data-collection="A"]');
    await sleep(250);
    await click('[data-slot="A-2"] .strip-open');
    await sleep(600);
    const info = await evaluate(`(() => ({
      title: document.getElementById('now-title').textContent,
      caption: document.getElementById('caption-title').textContent,
      slot: document.getElementById('now-slot').textContent,
      status: window.__wurlitzer.audio.status,
      current: window.__wurlitzer.current.id,
      playing: window.__wurlitzer.scene.playing,
      recordMoved: window.__wurlitzer.scene.record.rotation.z
    }))()`);
    assert.equal(info.title, 'Twinkle, Twinkle, Little Star');
    assert.equal(info.caption, 'Twinkle, Twinkle, Little Star');
    assert.equal(info.slot, 'A-2');
    assert.equal(info.status, 'playing');
    assert.equal(info.current, 'twinkle');
    assert.equal(info.playing, true);
    assert.ok(info.recordMoved !== 0);
    return true;
  });

  await record('Pause and resume keep the transport coherent', async () => {
    await click('#play-btn');
    await sleep(250);
    assert.equal(await evaluate('window.__wurlitzer.audio.status'), 'paused');
    assert.equal(await evaluate('document.getElementById("play-btn").getAttribute("aria-label")'), 'Play');
    await click('#play-btn');
    await sleep(250);
    assert.equal(await evaluate('window.__wurlitzer.audio.status'), 'playing');
    assert.equal(await evaluate('window.__wurlitzer.scene.playing'), true);
    return true;
  });

  await record('Previous and next step through the records', async () => {
    await click('#next-btn');
    await sleep(250);
    assert.equal(await evaluate('window.__wurlitzer.current.slot'), 'A-3');
    await click('#prev-btn');
    await sleep(250);
    assert.equal(await evaluate('window.__wurlitzer.current.slot'), 'A-2');
    return true;
  });

  await record('Coin mode spends a credit, Free Play bypasses it', async () => {
    await click('#freeplay-toggle');
    assert.equal(await evaluate('window.__wurlitzer.settings.freePlay'), false);
    const before = await evaluate('window.__wurlitzer.settings.credits');
    await click('.collection-tab[data-collection="B"]');
    await sleep(250);
    await click('[data-slot="B-1"] .strip-open');
    await sleep(300);
    const after = await evaluate('window.__wurlitzer.settings.credits');
    assert.equal(after, before - 1);
    assert.equal(await evaluate('window.__wurlitzer.current.id'), 'all-through');
    await click('#freeplay-toggle');
    assert.equal(await evaluate('window.__wurlitzer.settings.freePlay'), true);
    return true;
  });

  await record('Empty G-8 is rejected without changing the record', async () => {
    const before = await evaluate('window.__wurlitzer.current.id');
    await click('.key[data-key="G"]');
    await click('.key[data-key="8"]');
    await sleep(250);
    assert.equal(await evaluate('window.__wurlitzer.current.id'), before);
    assert.match(await text('#status-text'), /empty|No record/i);
    return true;
  });

  await record('Keypad A then 3 selects the Mozart lullaby', async () => {
    await click('.key[data-key="A"]');
    await click('.key[data-key="3"]');
    await sleep(300);
    assert.equal(await evaluate('window.__wurlitzer.current.id'), 'mozart');
    assert.equal(await evaluate('window.__wurlitzer.current.slot'), 'A-3');
    return true;
  });

  await record('Seek jumps the synth playhead', async () => {
    await click('[data-slot="A-4"] .strip-open');
    await sleep(300);
    await evaluate(`(() => {
      const seek = document.getElementById('seek');
      seek.value = '600';
      seek.dispatchEvent(new Event('input', { bubbles: true }));
      seek.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
    await sleep(300);
    const position = await evaluate('window.__wurlitzer.audio.position()');
    assert.ok(position > 25 && position < 40, `position ${position}`);
    await click('#stop-btn');
    return true;
  });

  await record('Language switch translates the HUD and paper rack', async () => {
    const expectedTitle = await evaluate('window.__wurlitzer.current.title.th');
    await click('.lang-btn[data-lang="th"]');
    await sleep(500);
    const th = await evaluate(`(() => ({
      lang: document.documentElement.lang,
      rack: document.getElementById('rack-title').textContent,
      title: document.getElementById('now-title').textContent,
      keypad: window.__wurlitzer.lang
    }))()`);
    assert.equal(th.lang, 'th');
    assert.equal(th.rack, 'ชั้นเพลง');
    assert.equal(th.title, expectedTitle);
    assert.equal(th.keypad, 'th');
    await click('.lang-btn[data-lang="en"]');
    await sleep(300);
    assert.equal(await evaluate('document.documentElement.lang'), 'en');
    return true;
  });

  await record('Category tabs switch all eleven collection pages', async () => {
    await click('.collection-tab[data-collection="C"]');
    await sleep(350);
    const c = await evaluate(`(() => ({
      collection: window.__wurlitzer.collection,
      strips: document.querySelectorAll('#rack-grid .strip').length,
      first: document.querySelector('#rack-grid .strip')?.dataset.slot,
      sceneStrips: window.__wurlitzer.scene.stripGroup.children.length,
      sceneFirst: window.__wurlitzer.scene.stripGroup.children[0]?.userData?.slot
    }))()`);
    assert.equal(c.collection, 'C');
    assert.equal(c.strips, 8);
    assert.equal(c.first, 'C-1');
    assert.equal(c.sceneStrips, 8);
    assert.equal(c.sceneFirst, 'C-1');
    await click('.collection-tab[data-collection="ALL"]');
    await sleep(300);
    assert.equal(await evaluate('document.querySelectorAll("#rack-grid .strip").length'), 88);
    await click('.collection-tab[data-collection="A"]');
    await sleep(300);
    assert.equal(await evaluate('document.querySelectorAll("#rack-grid .strip").length'), 8);
    return true;
  });

  await record('Search finds a record in another collection', async () => {
    await evaluate(`(() => {
      const input = document.getElementById('rack-search');
      input.value = 'sakura';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);
    await sleep(300);
    const info = await evaluate(`(() => ({
      strips: document.querySelectorAll('#rack-grid .strip').length,
      slot: document.querySelector('#rack-grid .strip')?.dataset.slot,
      count: document.getElementById('rack-count').textContent
    }))()`);
    assert.equal(info.strips, 1);
    assert.equal(info.slot, 'D-1');
    assert.match(info.count, /1/);
    await evaluate(`(() => {
      const input = document.getElementById('rack-search');
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);
    await sleep(250);
    return true;
  });

  await record('Theme and text size switch and reach the scene', async () => {
    await click('.theme-swatch[data-theme="amber"]');
    await sleep(300);
    const theme = await evaluate(`(() => ({
      dataset: document.body.dataset.theme,
      setting: window.__wurlitzer.settings.theme,
      scene: window.__wurlitzer.scene.theme?.id,
      pressed: document.querySelector('.theme-swatch[data-theme="amber"]').getAttribute('aria-pressed')
    }))()`);
    assert.equal(theme.dataset, 'amber');
    assert.equal(theme.setting, 'amber');
    assert.equal(theme.scene, 'amber');
    assert.equal(theme.pressed, 'true');
    await click('#font-size-group button[data-size="xlarge"]');
    await sleep(200);
    assert.equal(await evaluate('document.body.dataset.font'), 'xlarge');
    assert.equal(await evaluate('window.__wurlitzer.settings.fontSize'), 'xlarge');
    return true;
  });

  await record('Favourites persist and the filter narrows the rack', async () => {
    await click('[data-slot="A-1"] .strip-star');
    await sleep(200);
    assert.deepEqual(await evaluate('window.__wurlitzer.settings.favorites'), ['brahms']);
    await click('#fav-filter');
    await sleep(200);
    assert.equal(await evaluate('document.querySelectorAll("#rack-grid .strip").length'), 1);
    assert.equal(await evaluate('document.getElementById("fav-filter").getAttribute("aria-pressed")'), 'true');
    await click('#fav-filter');
    await sleep(200);
    assert.equal(await evaluate('document.querySelectorAll("#rack-grid .strip").length'), 8);
    return true;
  });

  await record('Master knob responds to the keyboard and updates ARIA', async () => {
    const before = await evaluate('window.__wurlitzer.settings.master');
    await evaluate(`(() => {
      const knob = document.getElementById('master-knob');
      knob.focus();
      knob.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      return true;
    })()`);
    await sleep(200);
    const info = await evaluate(`(() => ({
      value: window.__wurlitzer.settings.master,
      aria: document.getElementById('master-knob').getAttribute('aria-valuenow')
    }))()`);
    assert.equal(info.value, before - 1);
    assert.equal(info.aria, String(before - 1));
    await evaluate(`(() => {
      const knob = document.getElementById('master-knob');
      knob.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      return true;
    })()`);
    return true;
  });

  await record('Ambient rain slider starts and stops a real layer', async () => {
    await evaluate(`(() => {
      const slider = document.getElementById('amb-rain-vol');
      slider.value = '30';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);
    await sleep(350);
    const on = await evaluate(`(() => ({
      setting: window.__wurlitzer.settings.ambient.rain,
      graph: Boolean(window.__wurlitzer.audio.graph),
      started: window.__wurlitzer.audio.ambient?.rain?.started === true,
      pressed: document.getElementById('amb-rain-toggle').getAttribute('aria-pressed')
    }))()`);
    assert.equal(on.setting, 30);
    assert.equal(on.graph, true);
    assert.equal(on.started, true);
    assert.equal(on.pressed, 'true');
    await click('#amb-rain-toggle');
    await sleep(200);
    assert.equal(await evaluate('window.__wurlitzer.settings.ambient.rain'), 0);
    return true;
  });

  await record('Sleep timer fades at 60 s and dims at zero', async () => {
    await click('.timer-btn[data-minutes="15"]');
    assert.equal(await evaluate('window.__wurlitzer.audio.getTimerState().active'), true);
    const mid = await evaluate('window.__wurlitzer.audio.debugSetRemaining(60).gain');
    assert.ok(mid > 0.49 && mid < 0.51, `mid gain ${mid}`);
    await evaluate('window.__wurlitzer.audio.debugSetRemaining(0)');
    await sleep(250);
    const end = await evaluate(`(() => ({
      active: window.__wurlitzer.audio.getTimerState().active,
      ended: window.__wurlitzer.audio.getTimerState().ended,
      dim: window.__wurlitzer.scene.dimTarget,
      timer: window.__wurlitzer.settings.timer
    }))()`);
    assert.equal(end.active, false);
    assert.equal(end.ended, true);
    assert.equal(end.dim, 1);
    assert.equal(end.timer, 0);
    await click('.timer-btn[data-minutes="0"]');
    return true;
  });

  await record('Reload restores language and favourites', async () => {
    await click('.lang-btn[data-lang="th"]');
    await click('.collection-tab[data-collection="B"]');
    await sleep(250);
    await click('[data-slot="B-2"] .strip-star');
    await sleep(300);
    await navigate('?test=restore');
    const info = await evaluate(`(() => ({
      lang: document.documentElement.lang,
      favorites: window.__wurlitzer.settings.favorites,
      rack: document.getElementById('rack-title').textContent,
      title: document.getElementById('now-title').textContent,
      theme: document.body.dataset.theme,
      font: document.body.dataset.font
    }))()`);
    assert.equal(info.lang, 'th');
    assert.ok(info.favorites.includes('au-clair'));
    assert.equal(info.rack, 'ชั้นเพลง');
    assert.ok(info.title.length > 0);
    assert.equal(info.theme, 'amber');
    assert.equal(info.font, 'xlarge');
    await click('.lang-btn[data-lang="en"]');
    await sleep(250);
    return true;
  });

  await record('Export writes a JSON download locally', async () => {
    const info = await evaluate(`(() => {
      let captured = null;
      const originalCreate = URL.createObjectURL;
      const originalClick = HTMLAnchorElement.prototype.click;
      URL.createObjectURL = (blob) => { captured = blob; return 'blob:test'; };
      HTMLAnchorElement.prototype.click = function () { window.__downloadName = this.download; };
      document.getElementById('export-btn').click();
      URL.createObjectURL = originalCreate;
      HTMLAnchorElement.prototype.click = originalClick;
      return { name: window.__downloadName, size: captured ? captured.size : 0, type: captured ? captured.type : '' };
    })()`);
    assert.equal(info.name, 'wurlitzer-lullaby-settings.json');
    assert.ok(info.size > 100);
    assert.equal(info.type, 'application/json');
    return true;
  });

  await record('Help dialog opens and Escape closes it', async () => {
    await click('#help-btn');
    assert.equal(await evaluate('document.getElementById("help-modal").hidden'), false);
    await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true`);
    assert.equal(await evaluate('document.getElementById("help-modal").hidden'), true);
    return true;
  });

  await record('Mobile tabs open the rack and studio sheets', async () => {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
    });
    await navigate('?test=mobile');
    assert.equal(await evaluate('getComputedStyle(document.getElementById("tab-songs")).display !== "none"'), true);
    await click('#tab-songs');
    await sleep(450);
    assert.equal(await evaluate('document.getElementById("rack-panel").classList.contains("is-open")'), true);
    await click('#tab-studio');
    await sleep(450);
    assert.equal(await evaluate('document.getElementById("studio-panel").classList.contains("is-open")'), true);
    return true;
  });

  await record('Reduced motion is honoured', async () => {
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    await navigate('?test=motion');
    const info = await evaluate(`(() => ({
      motion: document.body.dataset.motion,
      reduced: window.__wurlitzer.scene.reduced
    }))()`);
    assert.equal(info.motion, 'reduced');
    assert.equal(info.reduced, true);
    await cdp.send('Emulation.setEmulatedMedia', { features: [] });
    return true;
  });

  await record('Archive manifest exposes 32 public-domain performances', async () => {
    const info = await evaluate(`(() => {
      const c = window.__wurlitzer.trackBySlot.get('H-1');
      return { engine: c?.engine, url: c?.url, license: c?.license, source: c?.source, total: window.__wurlitzer.tracks.length };
    })()`);
    assert.equal(info.engine, 'stream');
    assert.match(info.url, /^https:\/\/upload\.wikimedia\.org\//);
    assert.equal(info.license, 'Public domain');
    assert.match(info.source, /^https:\/\/commons\.wikimedia\.org\//);
    assert.equal(info.total, 82);
    return true;
  });

  await record('Mute and Free Play toggles update state and ARIA', async () => {
    await click('#mute-btn');
    assert.equal(await evaluate('window.__wurlitzer.settings.muted'), true);
    assert.equal(await evaluate('document.getElementById("mute-btn").getAttribute("aria-pressed")'), 'true');
    await click('#mute-btn');
    assert.equal(await evaluate('window.__wurlitzer.settings.muted'), false);
    await click('#freeplay-toggle');
    assert.equal(await evaluate('window.__wurlitzer.settings.freePlay'), false);
    await click('#freeplay-toggle');
    assert.equal(await evaluate('window.__wurlitzer.settings.freePlay'), true);
    return true;
  });

  await record('The whole run produced zero console errors', async () => {
    assert.deepEqual(consoleErrors, []);
    return true;
  });
} finally {
  const failed = results.filter((item) => !item.ok);
  console.log(`\n${results.length - failed.length}/${results.length} browser checks passed`);
  if (failed.length) {
    for (const item of failed) console.log(`FAIL: ${item.name} — ${item.detail}`);
  }
  cdp.close();
  browser.proc.kill('SIGKILL');
  if (server) await server.close();
  if (failed.length) process.exitCode = 1;
}
