import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const server = http.createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(req.url.split('?')[0]);
    const file = normalize(join(root, path === '/' ? 'index.html' : path));
    if (!file.startsWith(root)) throw new Error('outside root');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

await new Promise((resolve) => server.listen(4173, '127.0.0.1', resolve));

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--hide-scrollbars', '--enable-unsafe-swiftshader', '--use-angle=metal'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
page.on('console', (message) => {
  if (message.type() === 'error') console.log('CONSOLE:', message.text());
});
page.on('pageerror', (error) => console.log('PAGEERROR:', error.message));

const stops = (process.argv[2] || '0,0.25,0.5,0.75,1').split(',').map(Number);
const width = Number(process.env.W || 1600);
const height = Number(process.env.H || 1000);

await page.setViewport({ width, height, deviceScaleFactor: 1 });

for (const t of stops) {
  await page.goto(`http://127.0.0.1:4173/?t=${t}&still`, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.AURELIS && window.AURELIS.ready === true', { timeout: 30000 });
  await new Promise((resolve) => setTimeout(resolve, 700));
  const name = `shot-${String(t).replace('.', '_')}-${width}.png`;
  await page.screenshot({ path: join(root, 'screenshots', name) });
  console.log('saved', name);
}

await browser.close();
server.close();
