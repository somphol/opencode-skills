#!/usr/bin/env node
/**
 * Headless Chrome checks for the VU Project Ideas catalog.
 *
 * Starts a local static server, drives Chrome over the DevTools Protocol,
 * verifies rendering/filtering/favorites/dialog/deep-link behaviour, checks
 * that the layout does not overflow at 390 px, and refreshes the screenshots
 * in assets/.
 *
 * Usage:
 *   node tests/browser.test.mjs
 *   TEST_URL=https://somphol.github.io/vu_project_ideas/ node tests/browser.test.mjs --no-shots
 */
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { tmpdir } from "node:os";

const ROOT = resolve(import.meta.dirname, "..");
const SHOTS = !process.argv.includes("--no-shots");
const EXTERNAL = process.env.TEST_URL || "";
const CHROME = process.env.CHROME || [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].find((p) => existsSync(p));

if (!CHROME) {
  console.error("Chrome not found. Set CHROME=/path/to/chrome.");
  process.exit(2);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

let server;
let baseURL = EXTERNAL;
let chrome;
let ws;
let seq = 0;
const pending = new Map();
const results = [];
const consoleErrors = [];
const notFound = [];

function check(name, pass, detail = "") {
  results.push({ name, pass: !!pass, detail });
  console.log(`${pass ? "  ✓" : "  ✗"} ${name}${detail ? ` — ${detail}` : ""}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function startServer() {
  if (EXTERNAL) return;
  server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://local");
      let path = decodeURIComponent(url.pathname);
      if (path === "/") path = "/index.html";
      const file = normalize(join(ROOT, path));
      if (!file.startsWith(ROOT)) throw new Error("outside root");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
      res.end(body);
    } catch {
      notFound.push(req.url);
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found");
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  baseURL = `http://127.0.0.1:${server.address().port}`;
}

async function launchChrome() {
  const port = 9300 + Math.floor(Math.random() * 400);
  const profile = join(tmpdir(), `vu-catalog-chrome-${process.pid}`);
  chrome = spawn(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--use-mock-keychain",
    "--disable-background-networking",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ], { stdio: "ignore" });

  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const pages = await res.json();
      const page = pages.find((p) => p.type === "page");
      if (page) {
        ws = new WebSocket(page.webSocketDebuggerUrl);
        await new Promise((resolveOpen, rejectOpen) => {
          ws.onopen = resolveOpen;
          ws.onerror = rejectOpen;
        });
        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id && pending.has(msg.id)) {
            const { resolve: done, reject } = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) reject(new Error(msg.error.message));
            else done(msg.result);
            return;
          }
          if (msg.method === "Runtime.exceptionThrown") {
            consoleErrors.push(msg.params.exceptionDetails.text || "exception");
          }
          if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
            consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(" "));
          }
          if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
            consoleErrors.push(msg.params.entry.text);
          }
        };
        await send("Page.enable");
        await send("Runtime.enable");
        await send("Log.enable");
        return { port, profile };
      }
    } catch {
      // Chrome is still starting.
    }
    await sleep(150);
  }
  throw new Error("Chrome did not expose a debugging target");
}

function send(method, params = {}) {
  const id = ++seq;
  return new Promise((resolveSend, reject) => {
    pending.set(id, { resolve: resolveSend, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const res = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
  return res.result.value;
}

async function waitFor(expression, timeout = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      if (await evaluate(expression)) return true;
    } catch {
      // navigation in progress
    }
    await sleep(80);
  }
  return false;
}

async function navigate(url, waitExpression = "window.__vuReady === true") {
  await send("Page.navigate", { url });
  await waitFor(waitExpression);
  await sleep(250);
}

async function metrics(width, height, mobile = false) {
  await send("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 1, mobile,
    screenWidth: width, screenHeight: height,
  });
  await sleep(120);
}

async function screenshot(path, { width = 1440, height = 1100, mobile = false, scroll = 0, full = false } = {}) {
  if (!SHOTS) return;
  await metrics(width, height, mobile);
  await evaluate(`window.scrollTo(0, ${scroll})`);
  await sleep(220);
  let clip;
  if (full) {
    const layout = await send("Page.getLayoutMetrics");
    clip = { x: 0, y: 0, width, height: Math.min(layout.cssContentSize.height, 7000), scale: 1 };
  }
  const res = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: !!full,
    ...(clip ? { clip } : {}),
  });
  await mkdir(resolve(ROOT, "assets"), { recursive: true });
  await writeFile(resolve(ROOT, path), Buffer.from(res.data, "base64"));
  console.log(`  · screenshot ${path}`);
}

async function main() {
  console.log(`VU catalog browser checks — ${baseURL || "local"}`);
  await startServer();
  const { profile } = await launchChrome();
  const page = baseURL + "/";

  try {
    await metrics(1440, 1100);
    await navigate(page + "?theme=light");

    check("page boots", await evaluate("window.__vuReady === true"));
    check("54 cards render", (await evaluate("document.querySelectorAll('.card').length")) === 54);
    check("54 projects exposed", (await evaluate("window.__vu.count")) === 54);
    check("all tracks present", (await evaluate("document.querySelectorAll('#track-filters .track-chip').length")) === 10);

    // Search
    await evaluate("(()=>{const el=document.querySelector('#search'); el.value='snooker'; el.dispatchEvent(new Event('input',{bubbles:true}));})()");
    await sleep(120);
    check("search narrows to one", (await evaluate("document.querySelectorAll('.card').length")) === 1);
    check("search finds Snooker", (await evaluate("document.querySelector('.card h3').textContent")).includes("Snooker"));
    check("search state is announced", (await evaluate("document.querySelector('#result-count').textContent")).includes("1"));

    // Reset, then track filter
    await evaluate("document.querySelector('#reset-filters').click()");
    await evaluate("document.querySelector('.track-chip[data-track=\"game\"]').click()");
    await sleep(120);
    check("Games track shows 11", (await evaluate("document.querySelectorAll('.card').length")) === 11);

    // Stack filter
    await evaluate("(()=>{const el=document.querySelector('#stack-filter'); el.value='Cannon.js'; el.dispatchEvent(new Event('change',{bubbles:true}));})()");
    await sleep(120);
    const cannon = await evaluate("document.querySelectorAll('.card').length");
    check("Cannon.js stack filter works", cannon > 0, `${cannon} briefs`);

    // Favorites
    await evaluate("document.querySelector('#reset-filters').click()");
    await evaluate("document.querySelector('.card .star-btn').click()");
    await sleep(120);
    check("favorite persists", (await evaluate("JSON.parse(localStorage.getItem('vu.favorites.v1')||'[]').length")) === 1);
    check("shortlist counter updates", (await evaluate("document.querySelector('#star-count').textContent")) === "1");
    await evaluate("(()=>{const el=document.querySelector('#starred-only'); el.checked=true; el.dispatchEvent(new Event('change',{bubbles:true}));})()");
    await sleep(120);
    check("shortlist filter shows one", (await evaluate("document.querySelectorAll('.card').length")) === 1);
    await evaluate("window.__vu.state.favs.clear(); localStorage.removeItem('vu.favorites.v1'); window.__vu.resetFilters();");

    // Detail dialog
    await evaluate("document.querySelector('.card').click()");
    await waitFor("document.querySelector('#detail').open === true");
    check("dialog opens", await evaluate("document.querySelector('#detail').open"));
    check("dialog title matches card", (await evaluate("document.querySelector('#detail-title').textContent")).includes("Cute3D"));
    const prompt = await evaluate("document.querySelector('#detail-prompt').textContent");
    check("prompt has current prefix", prompt.startsWith("Can you create new project in ~/Projects to host this Cute3D"));
    check("prompt has verbatim task", prompt.includes("TASK: Build a complete, production-ready"));
    check("prefix appears exactly once", prompt.split("Can you create new project").length - 1 === 1);
    check("deep link written", (await evaluate("location.hash")).includes("#p/cute3d"));

    await evaluate("document.querySelector('[data-tab=\"inside\"]').click()");
    check("glance tab opens", await evaluate("document.querySelector('#panel-inside').hidden === false"));
    check("glance has stack chips", (await evaluate("document.querySelectorAll('#glance-stack .chip').length")) > 0);
    check("glance has source label", (await evaluate("document.querySelector('#glance-source').textContent")).length > 3);

    await screenshot("assets/detail.png", { width: 1440, height: 1100 });
    await evaluate("document.querySelector('#detail').close()");
    await sleep(150);
    check("dialog closes", !(await evaluate("document.querySelector('#detail').open")));
    check("hash cleared", (await evaluate("location.hash")) === "");

    // Deep link
    await navigate(page + "?theme=light#p/algorithm-explorer-top-15-swe-interview-patterns");
    check("deep link opens brief", await evaluate("document.querySelector('#detail').open === true"));
    check("deep link title correct", (await evaluate("document.querySelector('#detail-title').textContent")).includes("Algorithm Explorer"));
    await evaluate("document.querySelector('#detail').close()");

    // Theme
    await navigate(page + "?theme=light");
    await evaluate("document.querySelector('#theme-toggle').click()");
    await sleep(120);
    check("theme toggles to dark", (await evaluate("document.documentElement.dataset.theme")) === "dark");

    // Desktop screenshots
    await evaluate("localStorage.removeItem('vu.favorites.v1')");
    await navigate(page + "?theme=light");
    await screenshot("assets/studio.png", { width: 1440, height: 1100 });
    await screenshot("assets/library.png", { width: 1440, height: 1100, scroll: 720 });
    await navigate(page + "?theme=dark");
    await screenshot("assets/studio-dark.png", { width: 1440, height: 1100 });
    await navigate(page + "?theme=light");
    await screenshot("assets/og-card.png", { width: 1200, height: 630 });

    // Mobile: real 390 px via device metrics, check horizontal overflow.
    await navigate(page + "?theme=dark");
    await metrics(390, 844, true);
    await evaluate("window.scrollTo(0,0)");
    await sleep(200);
    const overflow = await evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth");
    const offenders = overflow > 0 ? await evaluate(`(()=>{
      const rect = el => { const r = el.getBoundingClientRect(); return {t:el.tagName,c:el.className&&String(el.className).slice(0,40),l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width),sw:el.scrollWidth,cw:el.clientWidth}; };
      const wide = [...document.querySelectorAll('body *')].filter(el=>el.scrollWidth>el.clientWidth+1).map(rect).slice(0,10);
      return {doc:[document.documentElement.scrollWidth,document.documentElement.clientWidth],body:[document.body.scrollWidth,document.body.clientWidth],wide};
    })()`) : null;
    check("mobile page has no horizontal overflow", overflow <= 0, `overflow ${overflow}px${offenders ? " · " + JSON.stringify(offenders) : ""}`);
    await screenshot("assets/mobile.png", { width: 390, height: 844, mobile: true });

    await evaluate("document.querySelector('.card').click()");
    await waitFor("document.querySelector('#detail').open === true");
    await sleep(150);
    const dialogOverflow = await evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth");
    const dialogScroll = await evaluate("(()=>{const d=document.querySelector('.detail-scroll');return d.scrollWidth-d.clientWidth})()");
    check("mobile dialog has no horizontal overflow", dialogOverflow <= 0 && dialogScroll <= 0, `page ${dialogOverflow}px, dialog ${dialogScroll}px`);
    const promptFit = await evaluate("(()=>{const r=document.querySelector('#detail-prompt').getBoundingClientRect();return {w:r.width,right:r.right,inner:innerWidth}})()");
    check("mobile prompt fits viewport", promptFit.w <= 390 && promptFit.right <= promptFit.inner, `${Math.round(promptFit.w)}px`);
    await screenshot("assets/mobile-detail.png", { width: 390, height: 844, mobile: true });
    await evaluate("document.querySelector('#detail').close()");

    check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
    check("no missing same-origin files", notFound.length === 0, notFound.slice(0, 5).join(" | "));

    const failed = results.filter((r) => !r.pass);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    if (failed.length) {
      console.error("Failed:", failed.map((r) => r.name).join(", "));
      process.exitCode = 1;
    }
  } finally {
    try { ws?.close(); } catch { /* ignore */ }
    chrome?.kill("SIGTERM");
    server?.close();
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
