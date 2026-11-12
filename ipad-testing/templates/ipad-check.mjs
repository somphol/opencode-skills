#!/usr/bin/env node
/**
 * Dependency-free Chrome DevTools Protocol harness for iPad layout work.
 *
 *   node ipad-check.mjs --url http://127.0.0.1:8123/ --device ipad --out /tmp/p.png
 *   node ipad-check.mjs --url http://127.0.0.1:8123/ --device ipad \
 *     --orientation landscape --eval "document.documentElement.scrollHeight"
 *   node ipad-check.mjs --url http://127.0.0.1:8123/ --click "#menu" --wait 2000
 *
 * Requires Chrome at the default macOS path (override with CHROME_PATH).
 * Prints one JSON line: { evalValue, evalError, viewport, events, screenshot }.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const args = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};

const url = arg("--url", "http://127.0.0.1:8000/");
const evalExpr = arg("--eval", null);
const clickSelector = arg("--click");
const out = arg("--out");
const waitMs = Number(arg("--wait", "5000"));
const port = Number(arg("--port", String(9300 + Math.floor(Math.random() * 400))));
const timeoutMs = Number(arg("--timeout", "30000"));

const DEVICES = {
  ipad: { width: 820, height: 1180, dpr: 2, platform: "iPad" },
  "ipad-air": { width: 820, height: 1180, dpr: 2, platform: "iPad" },
  "ipad-mini": { width: 744, height: 1133, dpr: 2, platform: "iPad" },
  "ipad-pro-11": { width: 834, height: 1194, dpr: 2, platform: "iPad" },
  "ipad-pro-13": { width: 1024, height: 1366, dpr: 2, platform: "iPad" },
  iphone: { width: 390, height: 844, dpr: 3, platform: "iPhone" },
  desktop: null
};
const deviceName = arg("--device", "ipad");
const device = DEVICES[deviceName] === undefined ? DEVICES.ipad : DEVICES[deviceName];
const orientation = arg("--orientation", "portrait") === "landscape" ? "landscape" : "portrait";
const width = device ? (orientation === "landscape" ? device.height : device.width) : Number(arg("--width", "1440"));
const height = device ? (orientation === "landscape" ? device.width : device.height) : Number(arg("--height", "900"));
const UA = "Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1";

const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profile = mkdtempSync(join(tmpdir(), "ipad-cdp-"));
const chrome = spawn(chromePath, [
  "--headless=new",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-background-networking",
  "--disable-component-update",
  "--disable-sync",
  "--hide-scrollbars",
  `--window-size=${width},${height}`,
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${port}`,
  ...(device ? ["--touch-events=enabled"] : []),
  "about:blank"
], { stdio: ["ignore", "ignore", "pipe"] });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const events = [];
const finish = (payload, code = 0) => {
  try { chrome.kill("SIGKILL"); } catch { /* ignore */ }
  console.log(JSON.stringify(payload, null, 2));
  process.exit(code);
};

async function debuggerUrl() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* not ready */ }
    await sleep(125);
  }
  throw new Error("Chrome DevTools endpoint did not start");
}

let nextId = 0;
const pending = new Map();
let socket;

function send(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, method });
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }
    }, timeoutMs);
  });
}

function recordEvent(event) {
  if (event.method === "Runtime.consoleAPICalled") {
    events.push({ type: "console", level: event.params.type, text: event.params.args.map((a) => a.value ?? a.description ?? a.type).join(" ") });
  } else if (event.method === "Runtime.exceptionThrown") {
    const detail = event.params.exceptionDetails;
    events.push({ type: "exception", text: detail.exception?.description || detail.text });
  } else if (event.method === "Log.entryAdded") {
    events.push({ type: "log", level: event.params.entry.level, text: event.params.entry.text });
  }
}

async function main() {
  socket = new WebSocket(await debuggerUrl());
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (message) => {
    const data = JSON.parse(message.data);
    if (data.id && pending.has(data.id)) {
      const entry = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) entry.reject(new Error(`${entry.method}: ${data.error.message}`));
      else entry.resolve(data.result);
    } else {
      recordEvent(data);
    }
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");

  if (device) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: device.dpr,
      mobile: true,
      screenOrientation: orientation === "landscape"
        ? { type: "landscapePrimary", angle: 90 }
        : { type: "portraitPrimary", angle: 0 }
    });
    await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    await send("Emulation.setUserAgentOverride", { userAgent: UA, platform: device.platform });
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "pointer", value: "coarse" }, { name: "hover", value: "none" }]
    });
  } else {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  }

  await send("Page.navigate", { url });
  await sleep(waitMs);

  if (clickSelector) {
    const box = await send("Runtime.evaluate", {
      expression: `(() => { const el = document.querySelector(${JSON.stringify(clickSelector)}); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`,
      returnByValue: true
    });
    const point = box.result?.value;
    if (point) {
      if (device) {
        /* Touch is what the page will actually receive on iPad; a mouse pair can
           be ignored by handlers bound to touchend or by touch-only affordances. */
        await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: point.x, y: point.y }] });
        await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      } else {
        await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y });
        await send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
        await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
      }
      await sleep(350);
    } else {
      events.push({ type: "warning", text: `click target not found: ${clickSelector}` });
    }
  }

  const probe = evalExpr || `JSON.stringify({
    title: document.title,
    viewport: [innerWidth, innerHeight],
    visual: [visualViewport?.width, visualViewport?.height],
    scroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
    coarse: matchMedia("(pointer: coarse)").matches,
    hover: matchMedia("(hover: hover)").matches,
    dpr: devicePixelRatio
  })`;
  const result = await send("Runtime.evaluate", {
    expression: probe,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true
  });

  let screenshot = null;
  if (out) {
    const capture = await send("Page.captureScreenshot", { format: "png" });
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, Buffer.from(capture.data, "base64"));
    screenshot = out;
  }

  finish({
    evalValue: result.result?.value ?? null,
    evalError: result.exceptionDetails?.exception?.description || result.exceptionDetails?.text || null,
    viewport: { width, height, dpr: device?.dpr ?? 1, orientation, device: deviceName },
    events,
    screenshot
  });
}

main().catch((error) => finish({ error: String(error?.message || error) }, 1));
