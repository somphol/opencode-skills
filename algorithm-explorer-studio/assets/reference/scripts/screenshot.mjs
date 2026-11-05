// Regenerates the README and social screenshots from the running app.
//
//   node scripts/screenshot.mjs
//
// One headless Chrome, mock keychain, local static server. Writes to assets/.

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
  const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
  return result.value;
};

const shot = async (name) => {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, name), Buffer.from(data, 'base64'));
  console.log(`wrote assets/${name}`);
};

try {
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.navigate', { url: `${server.url}/?test=1` });
  await cdp.waitFor('document.body && document.body.dataset.ready === "true"', { timeout: 30000 });
  await sleep(1200);

  await shot('studio.png');

  await evaluate(`(() => { window.__algo.selectPattern('tree-dfs'); window.__algo.applyFrame(11); return true; })()`);
  await sleep(900);
  await shot('tree.png');

  await evaluate(`document.querySelector('.tab[data-tab="quiz"]').click(); true`);
  await sleep(350);
  const answer = await evaluate(`(() => { const q = window.__algo.data.quiz[window.__algo.state.quiz.order[window.__algo.state.quiz.index]]; return q.answer; })()`);
  await evaluate(`document.querySelector('.quiz-option[data-option="${answer}"]').click(); true`);
  await sleep(350);
  await shot('quiz.png');

  await evaluate(`document.querySelector('.tab[data-tab="practice"]').click(); true`);
  await sleep(450);
  await shot('practice.png');

  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await cdp.send('Page.navigate', { url: `${server.url}/?test=1` });
  await cdp.waitFor('document.body && document.body.dataset.ready === "true"', { timeout: 30000 });
  await sleep(1100);
  await shot('mobile.png');

  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.navigate', { url: `${server.url}/assets/og.html?v=${Date.now()}` });
  await sleep(1100);
  await shot('og-card.png');

  console.log('screenshots complete');
} finally {
  cdp.close();
  browser.proc.kill('SIGKILL');
  await server.close();
}
