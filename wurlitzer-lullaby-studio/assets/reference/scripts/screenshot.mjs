// Regenerates the README and Open Graph images from the running app.
//
//   node scripts/screenshot.mjs
//
// One Chrome instance, mock keychain, local static server. Writes to assets/.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../tests/lib/fixtures.mjs';
import { connect, launchBrowser, startServer } from '../tests/lib/harness.mjs';

const OUT = join(ROOT, 'assets');
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const server = await startServer(ROOT);
const browser = await launchBrowser({ width: 1600, height: 1000 });
const target = await (
  await fetch(`http://127.0.0.1:${browser.port}/json/new?about:blank`, { method: 'PUT' })
).json();
const cdp = await connect(target.webSocketDebuggerUrl);

const evaluate = async (expression) => {
  const { result } = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result.value;
};

const shot = async (name, clip) => {
  const { data } = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
    ...(clip ? { clip: { ...clip, scale: 1 } } : {}),
  });
  writeFileSync(join(OUT, name), Buffer.from(data, 'base64'));
  console.log(`wrote assets/${name}`);
};

const navigate = async (query) => {
  await cdp.send('Page.navigate', { url: `${server.url}/${query}` });
  await cdp.waitFor('document.body && document.body.dataset.ready === "true"', { timeout: 30000 });
  await sleep(1400);
};

try {
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false,
  });
  await navigate('?shot=1');

  // Idle hero with the cabinet lit.
  await shot('studio.png');

  // Playing a lullaby — record, arm and bubbles in motion.
  await evaluate(`document.querySelector('[data-slot="A-1"] .strip-open').click(); true`);
  await sleep(1600);
  await shot('playing.png');

  // Central stage, cropped between the side panels.
  const stageBox = await evaluate(`(() => {
    const r = document.getElementById('stage').getBoundingClientRect();
    return { x: 340, y: 72, width: 920, height: 850 };
  })()`);
  await shot('stage.png', stageBox);

  // Thai interface, after the language toast has cleared.
  await evaluate(`document.querySelector('.lang-btn[data-lang="th"]').click(); true`);
  await sleep(3300);
  await shot('thai.png');
  await evaluate(`document.querySelector('.lang-btn[data-lang="en"]').click(); true`);
  await sleep(400);

  // Amber Lounge with large text, showing the display controls.
  await evaluate(`(() => {
    document.querySelector('.theme-swatch[data-theme="amber"]').click();
    document.querySelector('#font-size-group button[data-size="large"]').click();
    return true;
  })()`);
  await sleep(900);
  await shot('amber.png');
  await evaluate(`(() => {
    document.querySelector('.theme-swatch[data-theme="midnight"]').click();
    document.querySelector('#font-size-group button[data-size="normal"]').click();
    return true;
  })()`);
  await sleep(500);

  // Clean stage-only frame for the social card.
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1200, height: 630, deviceScaleFactor: 1, mobile: false,
  });
  await navigate('?shot=1&og=1');
  await sleep(900);
  await shot('stage-hero.png');

  // Compose the Open Graph card from the clean stage shot.
  await cdp.send('Page.navigate', { url: `${server.url}/assets/og.html?v=${Date.now()}` });
  await sleep(900);
  await shot('og-card.png');

  // Mobile with the song rack sheet open.
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
  });
  await navigate('?shot=1');
  await evaluate(`document.getElementById('tab-songs').click(); true`);
  await sleep(900);
  await shot('mobile.png');

  console.log('screenshots complete');
} finally {
  cdp.close();
  browser.proc.kill('SIGKILL');
  await server.close();
}
