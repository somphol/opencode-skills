#!/usr/bin/env node
/**
 * Generic two-client CDP harness.
 *
 *   APP_URL=http://127.0.0.1:8123 node templates/two-client-check.mjs
 *
 * The app must expose a small test surface on window.__mp:
 *
 *   getState() -> { role: "host"|"guest", code, id, revision, public, private }
 *   pending() -> [{ id, name }]
 *   approve(id) / deny(id)
 *   sendIntent(action, payload)
 *   chat { send(text), messages() }
 *   voice { joinWithStream(stream), state() }
 *
 * Adapt the query strings and assertions to your app. Keep this harness
 * separate from offline CI: it needs the real signalling server/broker.
 */

import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.APP_URL || "http://127.0.0.1:8123/";
const HOST_PATH = process.env.HOST_PATH || "?host=1&name=Host";
const guestPath = (code, name = "Guest", passcode = "") =>
  `?room=${encodeURIComponent(code)}&name=${encodeURIComponent(name)}${passcode ? `&passcode=${encodeURIComponent(passcode)}` : ""}`;
const port = Number(process.env.CDP_PORT || 9560);
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profile = mkdtempSync(join(tmpdir(), "mp-check-"));
const failures = [];
const passes = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function pass(label, detail = "") { passes.push(label); console.log(`PASS ${label}${detail ? ` — ${detail}` : ""}`); }
function fail(label, detail = "") { failures.push(`${label}: ${detail}`); console.error(`FAIL ${label} — ${detail}`); }

const chrome = spawn(chromePath, [
  "--headless=new",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-background-networking",
  "--disable-component-update",
  "--disable-sync",
  "--hide-scrollbars",
  "--window-size=1440,900",
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${port}`,
  "--autoplay-policy=no-user-gesture-required",
  "--use-fake-device-for-media-stream",
  "--use-fake-ui-for-media-stream",
  "about:blank"
], { stdio: ["ignore", "ignore", "pipe"] });

let chromeErr = "";
chrome.stderr.on("data", (chunk) => { chromeErr += chunk.toString(); });

async function endpoint() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* not ready */ }
    await sleep(150);
  }
  throw new Error("Chrome DevTools endpoint did not start");
}

class Session {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.pending.has(data.id)) {
        const entry = this.pending.get(data.id);
        this.pending.delete(data.id);
        if (data.error) entry.reject(new Error(data.error.message));
        else entry.resolve(data.result);
      } else if (data.method === "Runtime.exceptionThrown") {
        this.events.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);
      }
    });
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });
    const session = new Session(ws);
    await session.send("Runtime.enable");
    await session.send("Page.enable");
    return session;
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 45000);
    });
  }

  async goto(url) { await this.send("Page.navigate", { url }); await sleep(2500); }

  async eval(expression) {
    const result = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result?.value;
  }

  async waitFor(expression, label, timeout = 25000) {
    const started = Date.now();
    let last = null;
    while (Date.now() - started < timeout) {
      try {
        last = await this.eval(expression);
        if (last) return last;
      } catch (error) { last = error.message; }
      await sleep(400);
    }
    throw new Error(`timed out waiting for ${label}; last=${JSON.stringify(last)}`);
  }

  async closePage() { try { await this.send("Page.close"); } catch { /* gone */ } try { this.ws.close(); } catch { /* ignore */ } }
}

async function newTarget(url) {
  const response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  if (!response.ok) throw new Error(`could not create target: ${response.status}`);
  return (await response.json()).webSocketDebuggerUrl;
}

async function main() {
  const host = await Session.connect(await endpoint());
  await host.goto(`${BASE}${HOST_PATH}`);
  const hostState = JSON.parse(await host.waitFor("window.__mp?.getState?.() ? JSON.stringify(window.__mp.getState()) : ''", "host room", 30000));
  const code = hostState.code;
  if (code) pass("host opened a room", code); else fail("host opened a room", JSON.stringify(hostState));

  const guest = await Session.connect(await newTarget(`${BASE}${guestPath(code)}`));
  await sleep(2500);
  const pending = JSON.parse(await host.waitFor("window.__mp?.pending?.().length ? JSON.stringify(window.__mp.pending()) : ''", "pending request", 20000));
  if (pending.length) pass("guest is held for approval", pending[0].name); else fail("guest is held for approval", JSON.stringify(pending));

  await host.eval(`window.__mp.approve(${JSON.stringify(pending[0].id)}); true`);
  const guestState = JSON.parse(await guest.waitFor("window.__mp?.getState?.()?.role === 'guest' ? JSON.stringify(window.__mp.getState()) : ''", "guest welcome", 30000));
  if (guestState.id) pass("guest received a participant id", guestState.id); else fail("guest received a participant id", JSON.stringify(guestState));

  const projection = JSON.parse(await guest.eval("JSON.stringify({ public: window.__mp.getState().public, private: window.__mp.getState().private })"));
  if (projection.public && projection.private) pass("guest state has public + private projections"); else fail("guest projection", JSON.stringify(projection));

  const before = Number(guestState.revision || 0);
  await guest.eval("window.__mp.sendIntent('test', { value: 1 }); true");
  await host.waitFor(`window.__mp.getState().revision > ${before} ? 'yes' : ''`, "guest intent applied", 20000);
  pass("guest intent reached the host");

  await guest.eval("window.__mp.chat.send('hello from guest'); true");
  await sleep(700);
  const messages = JSON.parse(await host.eval("JSON.stringify(window.__mp.chat.messages())"));
  if (messages.some((m) => m.text === "hello from guest")) pass("chat reached the host"); else fail("chat reached the host", JSON.stringify(messages));

  const synth = `(async () => {
    const ctx = new AudioContext(); await ctx.resume();
    const osc = ctx.createOscillator(); const gain = ctx.createGain(); const dest = ctx.createMediaStreamDestination();
    gain.gain.value = 0; osc.connect(gain); gain.connect(dest); osc.start();
    window.__fakeVoice = dest.stream; return dest.stream.getAudioTracks().length;
  })()`;
  await host.eval(synth);
  await guest.eval(synth);
  await host.eval("window.__mp.voice.joinWithStream(window.__fakeVoice)");
  await guest.eval("window.__mp.voice.joinWithStream(window.__fakeVoice)");
  const voice = JSON.parse(await guest.waitFor("window.__mp.voice.state()?.remotes > 0 ? JSON.stringify(window.__mp.voice.state()) : ''", "voice stream", 20000));
  if (voice.remotes > 0) pass("voice stream attached", `${voice.remotes} remote`); else fail("voice stream attached", JSON.stringify(voice));

  await guest.closePage();
  await host.waitFor("window.__mp.getState().participants.every((p) => p.id !== 'guest' || p.connected === false) ? 'yes' : ''", "disconnect handled", 20000);
  pass("guest close handled by the host");

  if (host.events.length) fail("host console clean", host.events.join(" | ").slice(0, 500)); else pass("host console clean");
  if (guest.events.length) fail("guest console clean", guest.events.join(" | ").slice(0, 500)); else pass("guest console clean");
}

main()
  .catch((error) => { console.error("TWO-CLIENT CHECK FAILED:", error.message); process.exitCode = 1; })
  .finally(() => {
    chrome.kill("SIGTERM");
    if (process.env.DEBUG_CHROME && chromeErr) console.error(chromeErr.slice(-2000));
  });
