#!/usr/bin/env node
/**
 * Regenerate the README screenshots from the real app.
 *
 *   npm run screenshots
 *
 * Outputs optimized JPEGs to screenshots/. The script adds a Japan route to
 * the trip drawer so the itinerary view has useful content.
 */
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { startServer } from './lib/static-server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'screenshots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chromePath = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].filter(Boolean).find((candidate) => existsSync(candidate));

if (!chromePath) {
  console.error('Chrome/Chromium not found. Set CHROME_PATH to a Chrome executable.');
  process.exit(2);
}

mkdirSync(output, { recursive: true });

const server = await startServer(root, 0);
const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu']
});

const page = await browser.newPage();
const waitForImages = async () => {
  await page.evaluate(async () => {
    const all = Promise.all(
      Array.from(document.images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolveImage) => {
          img.addEventListener('load', resolveImage, { once: true });
          img.addEventListener('error', resolveImage, { once: true });
        });
      })
    );
    const timeout = new Promise((resolveTimeout) => setTimeout(resolveTimeout, 1600));
    await Promise.race([all, timeout]);
  });
};
const shot = async (name, options = {}) => {
  await waitForImages();
  await sleep(450);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const toast = document.querySelector('#toast');
    if (toast) toast.hidden = true;
  });
  await page.screenshot({ path: resolve(output, name), type: 'jpeg', quality: 86, ...options });
  console.log(`saved screenshots/${name}`);
};

try {
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.goto(server.url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(900);
  await shot('desktop-hero.jpg');

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, document.querySelector('#explore').offsetTop + 10);
  });
  await sleep(500);
  await shot('desktop-explorer.jpg');

  await page.evaluate(() => window.scrollTo(0, document.querySelector('#routes').offsetTop - 70));
  await sleep(500);
  await shot('desktop-routes.jpg');

  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await page.evaluate(() => document.querySelector('.dest-card-link').click());
  await page.waitForFunction(() => Boolean(document.querySelector('#modalTitle')), { timeout: 3000 });
  await sleep(500);
  await shot('desktop-modal.jpg');
  await page.keyboard.press('Escape');
  await sleep(350);

  await page.evaluate(() => document.querySelector('[data-route="japan-classic"]').click());
  await sleep(500);
  await page.evaluate(() => document.querySelector('.trip-trigger').click());
  await sleep(700);
  await shot('desktop-itinerary.jpg');
  await page.keyboard.press('Escape');
  await sleep(300);

  // A dedicated 1200×630 social card. This is the image referenced by the
  // Open Graph and Twitter meta tags.
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(
    `<!doctype html>
    <html>
      <head>
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
          body { font-family: "Avenir Next", "Segoe UI", system-ui, sans-serif; background: #0b241c; }
          .card { position: relative; width: 1200px; height: 630px; color: #fffdf8; overflow: hidden; }
          .card > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 44%; }
          .scrim { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(7,24,18,.86) 0%, rgba(7,24,18,.62) 42%, rgba(7,24,18,.16) 100%), linear-gradient(0deg, rgba(7,24,18,.72), rgba(7,24,18,.06) 55%); }
          .content { position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 56px 72px; }
          .brand { display: flex; align-items: center; gap: 14px; }
          .mark { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid rgba(255,255,255,.65); border-radius: 50%; }
          .mark svg { width: 24px; height: 24px; fill: none; stroke: #fffdf8; stroke-width: 1.5; }
          .brand strong { font-family: Georgia, "Times New Roman", serif; font-size: 25px; font-weight: 600; letter-spacing: -.02em; }
          .brand span { display: block; margin-top: 5px; font-size: 9px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; opacity: .7; }
          .middle { margin-top: 22px; }
          .kicker { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; font-size: 10px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; color: rgba(255,253,248,.78); }
          .kicker i { display: block; width: 38px; height: 1px; background: #e8794f; }
          h1 { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: 86px; line-height: .89; letter-spacing: -.045em; font-weight: 400; max-width: 820px; }
          h1 em { color: #f3c7a4; font-weight: 400; }
          .bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; border-top: 1px solid rgba(255,255,255,.22); padding-top: 18px; }
          .stats { display: flex; gap: 40px; }
          .stats b { display: block; font-family: Georgia, serif; font-size: 25px; font-weight: 400; line-height: 1; }
          .stats span { display: block; margin-top: 5px; font-size: 9px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; color: rgba(255,253,248,.55); }
          .url { font-size: 11px; font-weight: 700; letter-spacing: .08em; color: rgba(255,253,248,.62); }
        </style>
      </head>
      <body>
        <div class="card">
          <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=86" alt="">
          <div class="scrim"></div>
          <div class="content">
            <div class="brand">
              <span class="mark"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="m15.5 8.5-2 5-5 2 2-5z"></path></svg></span>
              <div><strong>Wanderlust</strong><span>3D · Global Explorer</span></div>
            </div>
            <div class="middle">
              <div class="kicker"><i></i> Three regions · Fifteen destinations</div>
              <h1>Go where the world<br>feels <em>wider.</em></h1>
            </div>
            <div class="bottom">
              <div class="stats">
                <div><b>03</b><span>Regions</span></div>
                <div><b>15</b><span>Destinations</span></div>
                <div><b>01</b><span>Dream itinerary</span></div>
              </div>
              <div class="url">somphol.github.io/wanderlust-3d</div>
            </div>
          </div>
        </div>
      </body>
    </html>`,
    { waitUntil: 'load', timeout: 60000 }
  );
  await page.evaluate(() => document.images[0]?.decode().catch(() => {}));
  await sleep(350);
  await page.screenshot({ path: resolve(output, 'og-cover.jpg'), type: 'jpeg', quality: 90 });
  console.log('saved screenshots/og-cover.jpg');

  // Mobile set, freshly reset.
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(server.url, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(900);
  await shot('mobile-hero.jpg');

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, document.querySelector('#explore').offsetTop + 10);
  });
  await sleep(500);
  await shot('mobile-explorer.jpg');

  await page.evaluate(() => document.querySelector('.dest-card-link').click());
  await page.waitForFunction(() => Boolean(document.querySelector('#modalTitle')), { timeout: 3000 });
  await sleep(600);
  await shot('mobile-modal.jpg');
} catch (error) {
  console.error(error.stack || error);
  process.exitCode = 1;
} finally {
  await browser.close();
  await server.close();
}
