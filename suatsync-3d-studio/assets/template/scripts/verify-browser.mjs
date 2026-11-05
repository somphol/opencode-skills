#!/usr/bin/env node
/**
 * SuatSync 3D — headless browser verification (no npm dependencies).
 *
 *   node scripts/verify-browser.mjs
 *   node scripts/verify-browser.mjs --screenshots
 *   CHROME_PATH="/path/to/Chrome" node scripts/verify-browser.mjs
 *
 * Starts a static server, launches Chrome with SwiftShader, runs the in-app
 * self-tests, checks the rendered DOM, exercises the timer transport and the
 * Sync Lab, and fails on any uncaught runtime error. Requires Node 22+.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wantShots = process.argv.includes("--screenshots");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
  });
}

function chromePath() {
  return [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ].filter(Boolean).find((candidate) => fs.existsSync(candidate));
}

async function waitFor(url, timeoutMs) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (err) { /* server not ready */ }
    await sleep(200);
  }
  throw new Error("Timed out waiting for " + url);
}

async function main() {
  const chrome = chromePath();
  if (!chrome) {
    console.error("SKIP: Chrome/Chromium not found. Set CHROME_PATH to run browser verification.");
    process.exit(2);
  }

  const port = await freePort();
  const remote = await freePort();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "suatsync-chrome-"));
  const server = spawn("python3", ["-m", "http.server", String(port)], { cwd: root, stdio: "ignore" });
  let browser;
  let ws;
  let failures = 0;

  try {
    await waitFor("http://127.0.0.1:" + port + "/index.html", 5000);
    browser = spawn(chrome, [
      "--headless=new", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
      "--disable-extensions", "--no-first-run", "--no-default-browser-check", "--hide-scrollbars",
      "--remote-debugging-port=" + remote, "--user-data-dir=" + profile,
      "--window-size=1440,900", "about:blank"
    ], { stdio: "ignore" });

    await waitFor("http://127.0.0.1:" + remote + "/json/version", 15000);
    const target = await (await fetch("http://127.0.0.1:" + remote + "/json/new?about:blank", { method: "PUT" })).json();
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

    let seq = 0;
    const pending = new Map();
    const errors = [];
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        const call = pending.get(message.id);
        pending.delete(message.id);
        message.error ? call.reject(new Error(JSON.stringify(message.error))) : call.resolve(message.result);
      }
      if (message.method === "Runtime.exceptionThrown") {
        errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      }
      if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
        const text = message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" ");
        if (!/GPU stall|WebGL context was lost|Autoplay|play\(\) failed/i.test(text)) errors.push(text);
      }
    });

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (pending.has(id)) { pending.delete(id); reject(new Error("CDP timeout: " + method)); }
      }, 30000);
    });

    const evaluate = async (expression) => {
      const out = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (out.exceptionDetails) throw new Error(out.exceptionDetails.exception?.description || out.exceptionDetails.text);
      return out.result.value;
    };

    const capture = async (file) => {
      const shot = await send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(path.join(root, file), Buffer.from(shot.data, "base64"));
      console.log("WROTE " + file);
    };

    const setViewport = async (width, height, mobile = false) => {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
    };

    await send("Runtime.enable");
    await send("Page.enable");
    await setViewport(1440, 900);
    await send("Page.navigate", { url: "http://127.0.0.1:" + port + "/" });

    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      if (await evaluate("!!window.SuatSync")) break;
      await sleep(250);
    }

    const tests = await evaluate("window.SuatSync ? window.SuatSync.runSelfTests(false) : null");
    console.log(tests ? (tests.pass ? "PASS" : "FAIL") + " " + (tests.total - tests.failed) + "/" + tests.total + " in-app self-tests" : "FAIL no app");
    if (!tests || !tests.pass) {
      if (tests) tests.checks.filter((c) => !c.pass).forEach((c) => console.error("  ✗ " + c.name + " " + c.detail));
      failures++;
    }

    const dom = await evaluate(`({
      rounds: document.querySelectorAll('.round-pill').length,
      jumps: document.querySelectorAll('.jump-btn').length,
      canvasReady: !!(window.SuatSync && window.SuatSync.world.ready),
      canvas: [document.querySelector('#scene-canvas').width, document.querySelector('#scene-canvas').height],
      placeholder: !document.querySelector('#videoPlaceholder').hidden,
      sourceTabs: document.querySelectorAll('.source-tab').length,
      dialogs: document.querySelectorAll('dialog').length,
      introLine: document.querySelector('#paliLine').textContent.length
    })`);
    const domChecks = [
      ["9 round pills", dom.rounds === 9],
      ["11 section jumps", dom.jumps === 11],
      ["WebGL mandala ready", dom.canvasReady],
      ["canvas at viewport size", dom.canvas[0] === 1440 && dom.canvas[1] === 900],
      ["YouTube consent placeholder visible", dom.placeholder],
      ["three source tabs", dom.sourceTabs === 3],
      ["four dialogs", dom.dialogs === 4],
      ["intro line rendered", dom.introLine > 10]
    ];
    domChecks.forEach(([name, pass]) => { if (!pass) { failures++; console.error("  ✗ " + name); } });
    console.log((domChecks.every(([, pass]) => pass) ? "PASS" : "FAIL") + " " + domChecks.filter(([, pass]) => pass).length + "/" + domChecks.length + " DOM checks");

    const interaction = await evaluate(`(async () => {
      const S = window.SuatSync;
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      S.setLanguage('en');
      S.setScript('roman');
      S.setSource('timer');
      S.jumpToSection(1);
      await wait(250);
      const roman = document.querySelector('#paliLine').textContent;
      const section = document.querySelector('#sectionBadge').textContent;
      const lines = document.querySelectorAll('#lineList .line-item').length;
      S.seekToLine(3);
      await wait(150);
      const activeIndex = document.querySelector('#lineList .line-item.active .line-idx');
      S.play();
      await wait(900);
      const playing = S.audio.playing;
      const moving = S.audio.position() > S.timeline.markers()[1];
      S.pause();
      await wait(900);
      const paused = !S.audio.playing;
      S.markRound(1);
      const done = S.state.session.done[0] === true;
      const pillDone = document.querySelectorAll('.round-pill.done').length === 1;
      const stats = S.state.stats.roundsTotal >= 1;
      S.resetSession(true);
      S.setLanguage('th');
      S.setScript('thai');
      return {
        roman: /[A-Za-z]/.test(roman),
        section,
        lines,
        activeIndex: activeIndex ? activeIndex.textContent : '',
        playing,
        moving,
        paused,
        done,
        pillDone,
        stats,
        reset: S.state.session.done.every((v) => v === false),
        thai: document.querySelector('#paliLine').textContent.length > 10
      };
    })()`);

    const interactionChecks = [
      ["Roman transliteration renders", interaction.roman],
      ["jump lands on Round 1", interaction.section === "Round 1"],
      ["15 verses render in a round", interaction.lines === 15],
      ["seek-to-line selects line 04", interaction.activeIndex === "04"],
      ["timer transport plays", interaction.playing && interaction.moving],
      ["timer transport pauses", interaction.paused],
      ["round completion is tracked", interaction.done && interaction.pillDone && interaction.stats],
      ["session reset clears the sitting", interaction.reset],
      ["Thai script returns", interaction.thai]
    ];
    interactionChecks.forEach(([name, pass]) => { if (!pass) { failures++; console.error("  ✗ " + name + " " + JSON.stringify(interaction)); } });
    console.log((interactionChecks.every(([, pass]) => pass) ? "PASS" : "FAIL") + " " + interactionChecks.filter(([, pass]) => pass).length + "/" + interactionChecks.length + " interaction checks");

    const sync = await evaluate(`(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      document.querySelector('#syncBtn').click();
      await wait(200);
      const open = document.querySelector('#syncDialog').open;
      const rows = document.querySelectorAll('#syncRows tr').length;
      const inputs = document.querySelectorAll('#syncRows input[data-marker]').length;
      document.querySelector('#syncCancel').click();
      return { open, rows, inputs };
    })()`);
    const syncOK = sync.open && sync.rows === 11 && sync.inputs === 11;
    if (!syncOK) { failures++; console.error("  ✗ Sync Lab", sync); }
    console.log((syncOK ? "PASS" : "FAIL") + " Sync Lab opens with 11 markers");

    if (wantShots) {
      await setViewport(1440, 900);
      await evaluate(`(async () => {
        const S = window.SuatSync;
        S.setLanguage('th');
        S.setScript('thai');
        S.setSource('youtube', true);
        S.render(true);
        window.scrollTo(0, 0);
      })()`);
      await sleep(1600);
      await evaluate("document.querySelector('#toast').classList.remove('show')");
      await capture("docs/screenshot-landing.png");

      await evaluate(`(async () => {
        const S = window.SuatSync;
        S.setSource('timer');
        S.jumpToSection(1);
        S.seekTo(S.timeline.markers()[1] + 150, true);
        S.pause();
        S.render(true);
        window.scrollTo(0, document.querySelector('.studio').offsetTop - 14);
      })()`);
      await sleep(3300);
      await evaluate("document.querySelector('#toast').classList.remove('show')");
      await capture("docs/screenshot-karaoke.png");

      await evaluate(`(async () => {
        const S = window.SuatSync;
        S.setLanguage('en');
        S.setScript('roman');
        S.setSource('timer');
        S.jumpToSection(5);
        S.seekTo(S.timeline.markers()[5] + 90, true);
        S.render(true);
        window.scrollTo(0, document.querySelector('.studio').offsetTop - 14);
      })()`);
      await sleep(3400);
      await evaluate("document.querySelector('#toast').classList.remove('show')");
      await capture("docs/screenshot-roman.png");

      await evaluate("document.querySelector('#syncBtn').click()");
      await sleep(500);
      await capture("docs/screenshot-sync.png");
      await evaluate("document.querySelector('#syncCancel').click()");
      await sleep(300);

      await setViewport(390, 844, true);
      await evaluate(`(async () => {
        const S = window.SuatSync;
        S.setLanguage('th');
        S.setScript('thai');
        S.jumpToSection(3);
        S.seekTo(S.timeline.markers()[3] + 100, true);
        S.render(true);
        window.scrollTo(0, document.querySelector('.studio').offsetTop - 20);
      })()`);
      await sleep(3400);
      await evaluate("document.querySelector('#toast').classList.remove('show')");
      await capture("docs/screenshot-mobile.png");
    }

    if (errors.length) {
      failures++;
      console.error("FAIL console/runtime errors:");
      errors.slice(0, 10).forEach((error) => console.error("  ✗ " + error));
    } else {
      console.log("PASS no uncaught runtime errors");
    }

    if (failures) {
      console.error("FAIL " + failures + " browser verification group(s)");
      process.exitCode = 1;
    } else {
      console.log("OK browser verification complete");
    }
  } finally {
    try { ws && ws.close(); } catch (err) { /* ignore */ }
    try { browser && browser.kill("SIGKILL"); } catch (err) { /* ignore */ }
    try { server.kill("SIGKILL"); } catch (err) { /* ignore */ }
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch (err) { /* Chrome may still release files */ }
  }
}

main().catch((error) => {
  console.error("FAIL " + error.message);
  process.exit(1);
});
