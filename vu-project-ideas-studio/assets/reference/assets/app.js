/* VU Project Ideas — catalog controller.
   No dependencies. Data comes from data/projects.js (window.VU_DATA). */
(() => {
  "use strict";

  const DATA = window.VU_DATA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const fmt = new Intl.NumberFormat("en-US");
  const FAV_KEY = "vu.favorites.v1";
  const THEME_KEY = "vu.theme.v1";

  if (!DATA || !Array.isArray(DATA.projects)) {
    const grid = $("#grid");
    if (grid) grid.innerHTML = "<p style='padding:40px;color:var(--muted)'>Could not load <code>data/projects.js</code>. Serve this folder over HTTP.</p>";
    return;
  }

  const projects = DATA.projects;
  const tracks = DATA.tracks;
  const trackById = Object.fromEntries(tracks.map((t) => [t.id, t]));
  const baseTitle = document.title;

  const state = {
    q: "",
    track: "all",
    stack: "all",
    liveOnly: false,
    starredOnly: false,
    sort: "curated",
    favs: loadFavs(),
  };

  let filtered = projects.slice();
  let current = null;
  let lastFocus = null;
  let toastTimer = 0;

  const grid = $("#grid");
  const empty = $("#empty");
  const resultCount = $("#result-count");
  const search = $("#search");
  const stackFilter = $("#stack-filter");
  const liveOnly = $("#live-only");
  const starredOnly = $("#starred-only");
  const sortSelect = $("#sort");
  const starCount = $("#star-count");
  const detail = $("#detail");
  const toastEl = $("#toast");

  const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));

  const fullPrompt = (p) => DATA.prefix.replace(/\{\{TITLE\}\}/g, p.title).trimEnd() + "\n\n" + p.task;
  const prefixWords = DATA.prefix.replace(/\{\{TITLE\}\}/g, "Project").split(/\s+/).filter(Boolean).length;
  const deepLink = (p) => location.href.split("#")[0] + "#p/" + p.id;

  /* ---------- storage ---------- */

  function loadFavs() {
    try {
      const raw = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
      return new Set(Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : []);
    } catch {
      return new Set();
    }
  }

  function saveFavs() {
    try { localStorage.setItem(FAV_KEY, JSON.stringify([...state.favs])); } catch { /* private mode */ }
  }

  function initialTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch { /* ignore */ }
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const btn = $("#theme-toggle");
    if (!btn) return;
    const dark = theme === "dark";
    btn.setAttribute("aria-pressed", String(dark));
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }

  function setTheme(theme) {
    applyTheme(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  }

  /* ---------- toast + clipboard ---------- */

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 3600);
  }

  async function copyText(text, message) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        ta.remove();
      } catch {
        ok = false;
      }
    }
    toast(ok ? message : "Copy failed — select the prompt and copy it manually.");
    return ok;
  }

  /* ---------- filters ---------- */

  function trackCount(id) {
    return id === "all" ? projects.length : projects.filter((p) => p.track === id).length;
  }

  function renderTrackFilters() {
    const wrap = $("#track-filters");
    wrap.textContent = "";
    const all = document.createElement("button");
    all.type = "button";
    all.className = "track-chip" + (state.track === "all" ? " is-active" : "");
    all.dataset.track = "all";
    all.setAttribute("aria-pressed", String(state.track === "all"));
    all.innerHTML = `<span class="dot"></span>All tracks <span class="count">${projects.length}</span>`;
    wrap.appendChild(all);

    for (const t of tracks) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "track-chip" + (state.track === t.id ? " is-active" : "");
      b.dataset.track = t.id;
      b.dataset.accent = t.id;
      b.setAttribute("aria-pressed", String(state.track === t.id));
      b.innerHTML = `<span class="dot"></span>${esc(t.name)} <span class="count">${trackCount(t.id)}</span>`;
      wrap.appendChild(b);
    }
  }

  function renderStackOptions() {
    const labels = [...new Set(projects.flatMap((p) => p.stack))].sort((a, b) => a.localeCompare(b));
    for (const label of labels) {
      const opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      stackFilter.appendChild(opt);
    }
  }

  function applyFilters() {
    const tokens = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    filtered = projects.filter((p) => {
      if (state.track !== "all" && p.track !== state.track) return false;
      if (state.stack !== "all" && !p.stack.includes(state.stack)) return false;
      if (state.liveOnly && !p.live) return false;
      if (state.starredOnly && !state.favs.has(p.id)) return false;
      if (!tokens.length) return true;
      const hay = [p.title, p.tagline, p.trackName, p.sourceTitle, ...p.stack, ...p.features, p.task]
        .join(" ").toLowerCase();
      return tokens.every((tok) => hay.includes(tok));
    });

    if (state.sort === "az") filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (state.sort === "quick") filtered.sort((a, b) => a.words - b.words || a.title.localeCompare(b.title));
    else if (state.sort === "deep") filtered.sort((a, b) => b.words - a.words || a.title.localeCompare(b.title));
    else filtered.sort((a, b) => a.n - b.n);

    render();
  }

  function render() {
    grid.textContent = "";
    const frag = document.createDocumentFragment();

    for (const p of filtered) {
      const starred = state.favs.has(p.id);
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.id = p.id;
      card.dataset.track = p.track;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `${p.title}. ${p.tagline} Open the brief.`);

      const chips = p.stack.slice(0, 4).map((s) => `<span class="chip">${esc(s)}</span>`);
      if (p.stack.length > 4) chips.push(`<span class="chip">+${p.stack.length - 4}</span>`);

      card.innerHTML = `
        <div class="card-top">
          <span class="card-index">${String(p.n).padStart(2, "0")}</span>
          <span class="track-pill">${esc(p.trackName)}</span>
          ${p.live ? '<span class="card-live">Live</span>' : ""}
          <button class="star-btn${starred ? " is-starred" : ""}" type="button" data-star="${esc(p.id)}" aria-label="${starred ? "Remove from" : "Add to"} shortlist" aria-pressed="${starred}">${starred ? "★" : "☆"}</button>
        </div>
        <h3>${esc(p.title)}</h3>
        <p class="card-tagline">${esc(p.tagline)}</p>
        <div class="chip-row">${chips.join("")}</div>
        <div class="card-foot">
          <span class="brief-meta">${p.size} · ${fmt.format(p.words)} words</span>
          <button class="card-copy" type="button" data-copy="${esc(p.id)}" aria-label="Copy the prompt for ${esc(p.title)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy
          </button>
        </div>`;
      frag.appendChild(card);
    }

    grid.appendChild(frag);
    grid.hidden = filtered.length === 0;
    empty.hidden = filtered.length !== 0;

    const trackName = state.track === "all" ? "" : ` in <strong>${esc(trackById[state.track]?.name || state.track)}</strong>`;
    resultCount.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${projects.length}</strong> briefs${trackName}`;
    starCount.textContent = String(state.favs.size);
    document.body.dataset.projects = String(projects.length);
    document.body.dataset.visible = String(filtered.length);
  }

  function setToggle(input, value) {
    input.checked = value;
    input.closest(".toggle")?.classList.toggle("is-on", value);
  }

  function resetFilters() {
    state.q = "";
    state.track = "all";
    state.stack = "all";
    state.liveOnly = false;
    state.starredOnly = false;
    state.sort = "curated";
    search.value = "";
    stackFilter.value = "all";
    sortSelect.value = "curated";
    setToggle(liveOnly, false);
    setToggle(starredOnly, false);
    renderTrackFilters();
    applyFilters();
  }

  function toggleFavorite(id, button) {
    if (state.favs.has(id)) state.favs.delete(id);
    else state.favs.add(id);
    saveFavs();
    const starred = state.favs.has(id);
    if (button) {
      button.classList.toggle("is-starred", starred);
      button.textContent = starred ? "★" : "☆";
      button.setAttribute("aria-pressed", String(starred));
      button.setAttribute("aria-label", `${starred ? "Remove from" : "Add to"} shortlist`);
    }
    starCount.textContent = String(state.favs.size);
    if (current && current.id === id) updateDetailStar();
    if (state.starredOnly) applyFilters();
    toast(starred ? "Added to your shortlist." : "Removed from your shortlist.");
  }

  /* ---------- detail dialog ---------- */

  function setTab(name) {
    $$(".tab", detail).forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    $("#panel-prompt").hidden = name !== "prompt";
    $("#panel-inside").hidden = name !== "inside";
  }

  function updateDetailStar() {
    const btn = $("#detail-star");
    const starred = current ? state.favs.has(current.id) : false;
    btn.classList.toggle("is-starred", starred);
    btn.textContent = starred ? "★" : "☆";
    btn.setAttribute("aria-pressed", String(starred));
    btn.setAttribute("aria-label", `${starred ? "Remove from" : "Add to"} shortlist`);
  }

  function openDetail(p) {
    if (!p) return;
    current = p;
    lastFocus = document.activeElement;

    detail.dataset.track = p.track;
    $("#detail-dot").dataset.track = p.track;
    $("#detail-track").textContent = p.trackName;
    $("#detail-index").textContent = `Brief ${String(p.n).padStart(2, "0")} of ${projects.length}`;
    $("#detail-title").textContent = p.title;
    $("#detail-tagline").textContent = p.tagline;

    const chips = [
      `<span class="chip accent">${esc(p.trackName)}</span>`,
      `<span class="chip">${p.size} brief</span>`,
      `<span class="chip">${fmt.format(p.words)} words</span>`,
      ...p.stack.map((s) => `<span class="chip">${esc(s)}</span>`),
    ];
    $("#detail-chips").innerHTML = chips.join("");

    const live = $("#detail-live");
    live.hidden = !p.live;
    if (p.live) live.href = p.live;

    const prompt = fullPrompt(p);
    $("#detail-prompt").textContent = prompt;
    $("#prompt-stats").textContent = `${fmt.format(p.words)} words · ${fmt.format(prompt.length)} chars · ~${p.readMinutes} min read`;

    $("#glance-summary").textContent = p.tagline;
    $("#glance-track").textContent = p.trackName;
    $("#glance-size").textContent = `${p.size} · ${p.words < 380 ? "focused" : p.words <= 650 ? "standard" : "deep"}`;
    $("#glance-words").textContent = fmt.format(p.words);
    $("#glance-read").textContent = `~${p.readMinutes} min`;
    $("#glance-stack").innerHTML = p.stack.length
      ? p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join("")
      : '<span class="chip">Vanilla JS</span>';
    $("#glance-features").innerHTML = p.features.length
      ? p.features.map((s) => `<span class="chip">${esc(s)}</span>`).join("")
      : '<span class="chip">Static site</span>';
    $("#glance-source").textContent = p.sourceTitle;
    $("#glance-aliases").textContent = p.aliases.length ? p.aliases.join(" · ") : "—";
    $("#glance-md").href = `prompts/${p.promptFile}`;
    $("#glance-link").href = deepLink(p);

    $("#anatomy-prefix").textContent = `${prefixWords} words · shared`;
    $("#anatomy-task").textContent = `${fmt.format(p.words)} words · unique`;
    $("#anatomy-total").textContent = `${fmt.format(prefixWords + p.words)} words · ${fmt.format(prompt.length)} chars`;

    updateDetailStar();
    setTab("prompt");

    if (!detail.open) {
      detail.showModal();
      document.body.classList.add("modal-open");
    }
    history.replaceState(null, "", "#p/" + p.id);
    document.title = `${p.title} — VU Project Ideas`;
    $(".detail-scroll", detail).scrollTop = 0;
  }

  function closeDetail() {
    if (detail.open) detail.close();
  }

  detail.addEventListener("close", () => {
    const focusTarget = lastFocus;
    current = null;
    document.body.classList.remove("modal-open");
    document.title = baseTitle;
    history.replaceState(null, "", location.pathname + location.search);
    if (focusTarget && focusTarget.isConnected) focusTarget.focus();
  });

  detail.addEventListener("click", (event) => {
    if (event.target === detail || event.target.closest?.("[data-close-detail]")) closeDetail();
  });

  $$(".tab", detail).forEach((tab) => {
    tab.addEventListener("click", () => setTab(tab.dataset.tab));
  });

  $("#detail-star").addEventListener("click", () => {
    if (current) toggleFavorite(current.id, $("#detail-star"));
  });

  $("#copy-full").addEventListener("click", () => {
    if (current) copyText(fullPrompt(current), `Full prompt copied — ${fmt.format(current.words)} words. Paste it into your agent.`);
  });
  $("#copy-full-2").addEventListener("click", () => $("#copy-full").click());

  $("#copy-task").addEventListener("click", () => {
    if (current) copyText(current.task, "Brief-only copied — add your own request prefix.");
  });

  $("#download-md").addEventListener("click", () => {
    if (!current) return;
    const p = current;
    const md = `# ${p.title}\n\n> ${p.tagline}\n\n**Track:** ${p.trackName} · **Words:** ${p.words}\n\n\`\`\`\`text\n${fullPrompt(p)}\n\`\`\`\`\n`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.id}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Downloading ${p.id}.md`);
  });

  /* ---------- events ---------- */

  $("#track-filters").addEventListener("click", (event) => {
    const chip = event.target.closest(".track-chip");
    if (!chip) return;
    state.track = chip.dataset.track;
    renderTrackFilters();
    applyFilters();
  });

  search.addEventListener("input", () => {
    state.q = search.value.trim();
    applyFilters();
  });
  search.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      search.value = "";
      state.q = "";
      applyFilters();
    }
  });

  stackFilter.addEventListener("change", () => {
    state.stack = stackFilter.value;
    applyFilters();
  });

  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    applyFilters();
  });

  liveOnly.addEventListener("change", () => {
    state.liveOnly = liveOnly.checked;
    applyFilters();
  });

  starredOnly.addEventListener("change", () => {
    state.starredOnly = starredOnly.checked;
    applyFilters();
  });

  $("#reset-filters").addEventListener("click", resetFilters);
  $("#empty-reset").addEventListener("click", resetFilters);

  $("#shuffle").addEventListener("click", () => {
    const pool = filtered.length ? filtered : projects;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    openDetail(pick);
  });

  grid.addEventListener("click", (event) => {
    const copy = event.target.closest("[data-copy]");
    if (copy) {
      event.stopPropagation();
      const p = projects.find((x) => x.id === copy.dataset.copy);
      if (p) copyText(fullPrompt(p), `Full prompt copied — ${fmt.format(p.words)} words.`);
      return;
    }
    const star = event.target.closest("[data-star]");
    if (star) {
      event.stopPropagation();
      toggleFavorite(star.dataset.star, star);
      return;
    }
    const card = event.target.closest(".card");
    if (card) {
      const p = projects.find((x) => x.id === card.dataset.id);
      if (p) openDetail(p);
    }
  });

  grid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".card");
    if (!card || event.target !== card) return;
    event.preventDefault();
    const p = projects.find((x) => x.id === card.dataset.id);
    if (p) openDetail(p);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    if (detail.open) return;
    const target = event.target;
    if (target instanceof HTMLElement && target.matches("input, textarea, select, [contenteditable='true']")) return;
    event.preventDefault();
    search.focus();
    search.select();
  });

  $("#theme-toggle").addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });

  $$("[data-copy-prefix]").forEach((btn) => {
    btn.addEventListener("click", () => {
      copyText(DATA.prefix, "Prefix copied. Replace {{TITLE}} with your project name.");
    });
  });

  window.addEventListener("hashchange", () => {
    const id = decodeURIComponent(location.hash.slice(1)).replace(/^p\//, "");
    if (!id) {
      if (detail.open) detail.close();
      return;
    }
    const p = projects.find((x) => x.id === id);
    if (p && (!detail.open || current?.id !== id)) openDetail(p);
  });

  /* ---------- boot ---------- */

  renderTrackFilters();
  renderStackOptions();
  const themeParam = new URLSearchParams(location.search).get("theme");
  applyTheme(themeParam === "light" || themeParam === "dark" ? themeParam : initialTheme());
  applyFilters();
  $("#prefix-preview").textContent = DATA.prefix.replace(/\{\{TITLE\}\}/g, "[Your project name]");

  fetch("state.json", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((s) => {
      if (!s) return;
      const bits = [];
      if (s.session?.elapsed) bits.push(s.session.elapsed);
      if (s.usage?.totalTokens) bits.push(`${(s.usage.totalTokens / 1e6).toFixed(1)}M tokens`);
      if (bits.length) $("#credit-session").textContent = bits.join(" · ");
    })
    .catch(() => { /* file:// or offline: the static credit stays */ });

  const initial = decodeURIComponent(location.hash.slice(1)).replace(/^p\//, "");
  if (initial) {
    const p = projects.find((x) => x.id === initial);
    if (p) openDetail(p);
  }

  window.__vu = {
    data: DATA,
    state,
    projects,
    open: openDetail,
    close: closeDetail,
    applyFilters,
    fullPrompt,
    resetFilters,
    count: projects.length,
  };
  window.__vuReady = true;
  document.dispatchEvent(new CustomEvent("vu:ready", { detail: { count: projects.length } }));
})();
