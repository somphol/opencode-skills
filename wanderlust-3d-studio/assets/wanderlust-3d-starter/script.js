/* ==========================================================================
   Wanderlust 3D — application
   --------------------------------------------------------------------------
   Vanilla ES6, no framework, no build. The module owns four things:
     1. catalogue rendering + filtering
     2. the destination modal and deep links
     3. the persistent trip planner (localStorage)
     4. progressive UI polish (hero slider, reveals, toasts, focus traps)
   ========================================================================== */

(function () {
  'use strict';

  const DATA = window.WANDERLUST_DATA;
  if (!DATA) {
    console.error('Wanderlust 3D: data.js did not load.');
    return;
  }

  /* ------------------------------- Constants ------------------------------- */
  const STORAGE_KEY = 'wanderlust.trip.v1';
  const MAX_NIGHTS = 30;
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const TAG_ORDER = ['Culture', 'History', 'Foodie', 'Nature', 'Beaches', 'Mountains', 'Adventure', 'Wildlife', 'City', 'Wellness', 'Romance', 'Nightlife'];
  const AVATAR_GRADIENTS = {
    japan: 'linear-gradient(135deg, #c34f5c, #6f2530)',
    italy: 'linear-gradient(135deg, #b8653f, #6f3a24)',
    'costa-rica': 'linear-gradient(135deg, #1f8a63, #0d4b37)'
  };

  /* -------------------------------- Helpers -------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const esc = (value) =>
    String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const icon = (name, className = '') =>
    `<svg${className ? ` class="${className}"` : ''} viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  const photo = (url, width, quality = 80) =>
    `${url}?auto=format&fit=crop&w=${width}&q=${quality}`;

  const srcset = (url, widths = [480, 800, 1200], quality = 78) =>
    widths.map((w) => `${photo(url, w, quality)} ${w}w`).join(', ');

  const money = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(Math.round(value));

  const destById = new Map(DATA.destinations.map((d) => [d.id, d]));
  const regionById = new Map(DATA.regions.map((r) => [r.id, r]));
  const regionName = (id) => (regionById.get(id) || {}).name || '';

  function destsForRegion(regionId) {
    return DATA.destinations.filter((d) => d.regionId === regionId);
  }

  function maxOrder() {
    return Object.values(state.trip).reduce((max, item) => Math.max(max, item.order || 0), 0);
  }

  /* --------------------------------- State --------------------------------- */
  const state = {
    region: 'all',
    query: '',
    tags: new Set(),
    budget: 'all',
    sort: 'curated',
    trip: {}
  };

  let currentList = [];
  let storageAvailable = true;

  function loadTrip() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const items = parsed && parsed.items ? parsed.items : parsed;
      if (!items || typeof items !== 'object') return;

      Object.keys(items).forEach((id, index) => {
        const dest = destById.get(id);
        if (!dest) return;
        const source = items[id] || {};
        state.trip[id] = {
          nights: clamp(Number(source.nights) || dest.idealNights, 1, MAX_NIGHTS),
          order: Number.isFinite(Number(source.order)) ? Number(source.order) : index + 1,
          addedAt: Number(source.addedAt) || Date.now()
        };
      });
    } catch (error) {
      storageAvailable = false;
      console.warn('Wanderlust 3D: localStorage is unavailable; the trip will last for this session only.', error);
    }
  }

  function saveTrip() {
    if (!storageAvailable) return false;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, savedAt: new Date().toISOString(), items: state.trip })
      );
      return true;
    } catch (error) {
      storageAvailable = false;
      showToast('This browser won’t let the trip be saved. It will last for this session only.');
      return false;
    }
  }

  function tripEntries() {
    return Object.entries(state.trip)
      .map(([id, item]) => ({ id, ...item, dest: destById.get(id) }))
      .filter((item) => item.dest)
      .sort((a, b) => a.order - b.order);
  }

  function tripTotals() {
    return tripEntries().reduce(
      (acc, item) => {
        acc.places += 1;
        acc.nights += item.nights;
        acc.cost += item.nights * item.dest.dailyBudget;
        return acc;
      },
      { places: 0, nights: 0, cost: 0 }
    );
  }

  function addToTrip(id, nights, options = {}) {
    const dest = destById.get(id);
    if (!dest) return false;

    if (state.trip[id]) {
      if (!options.silent) showToast(`${dest.name} is already in your trip.`, 'View trip', openTrip);
      return false;
    }

    state.trip[id] = {
      nights: clamp(Number(nights) || dest.idealNights, 1, MAX_NIGHTS),
      order: maxOrder() + 1,
      addedAt: Date.now()
    };
    saveTrip();
    syncAddButtons();
    syncRouteButtons();
    updateTripBadge();
    if (drawerOpen) renderTrip();
    if (!options.silent) {
      showToast(
        `${dest.name} added for ${state.trip[id].nights} night${state.trip[id].nights === 1 ? '' : 's'}.`,
        'View trip',
        openTrip
      );
    }
    return true;
  }

  function removeFromTrip(id, options = {}) {
    if (!state.trip[id]) return;
    delete state.trip[id];
    saveTrip();
    syncAddButtons();
    syncRouteButtons();
    updateTripBadge();
    if (drawerOpen) renderTrip();
    if (!options.silent) {
      const dest = destById.get(id);
      showToast(`${dest ? dest.name : 'Destination'} removed from your trip.`);
    }
  }

  /* ------------------------------- Rendering ------------------------------- */
  const els = {};

  function cacheElements() {
    els.heroSlides = $$('.hero-slide');
    els.heroDots = $$('.hero-dot');
    els.heroProgress = $('#heroProgress');
    els.regionTabs = $('#regionTabs');
    els.regionBrief = $('#regionBrief');
    els.tagFilters = $('#tagFilters');
    els.searchInput = $('#searchInput');
    els.heroSearchInput = $('#heroSearchInput');
    els.searchClear = $('#searchClear');
    els.budgetFilter = $('#budgetFilter');
    els.sortFilter = $('#sortFilter');
    els.resultCount = $('#resultCount');
    els.grid = $('#destinationGrid');
    els.emptyState = $('#emptyState');
    els.tripList = $('#tripList');
    els.tripEmpty = $('#tripEmpty');
    els.tripFooter = $('#tripFooter');
    els.tripCount = $('#tripCount');
    els.toast = $('#toast');
    els.toastMessage = $('#toastMessage');
    els.toastAction = $('#toastAction');
    els.tripDrawer = $('#tripDrawer');
    els.drawerBackdrop = $('#drawerBackdrop');
    els.modal = $('#destinationModal');
    els.modalContent = $('#modalContent');
    els.modalPanel = $('.modal-panel');
    els.mobileNav = $('#mobileNav');
    els.menuBtn = $('#menuBtn');
    els.header = $('#siteHeader');
    els.backToTop = $('#backToTop');
  }

  function renderRegionTabs() {
    const allTab = `
      <button class="region-tab is-all${state.region === 'all' ? ' is-active' : ''}"
              type="button" role="tab" aria-selected="${state.region === 'all'}"
              tabindex="${state.region === 'all' ? '0' : '-1'}"
              data-region-tab="all" style="--tab-accent: #0d3b2e">
        <span class="region-tab-thumb">${icon('compass')}</span>
        <span class="region-tab-copy">
          <strong>All regions</strong>
          <span>The whole atlas</span>
        </span>
        <span class="region-tab-count">${DATA.destinations.length}</span>
      </button>`;

    const regionTabs = DATA.regions
      .map((region) => {
        const count = destsForRegion(region.id).length;
        const active = state.region === region.id;
        return `
          <button class="region-tab${active ? ' is-active' : ''}"
                  type="button" role="tab" aria-selected="${active}"
                  tabindex="${active ? '0' : '-1'}"
                  data-region-tab="${esc(region.id)}" style="--tab-accent: ${esc(region.accent)}">
            <img class="region-tab-thumb" src="${esc(photo(region.image, 160))}"
                 srcset="${esc(srcset(region.image, [120, 240]))}" sizes="58px"
                 alt="" loading="lazy" decoding="async">
            <span class="region-tab-copy">
              <strong>${esc(region.name)}</strong>
              <span>${esc(region.tabNote || region.tagline)}</span>
            </span>
            <span class="region-tab-count">${count}</span>
          </button>`;
      })
      .join('');

    els.regionTabs.innerHTML = allTab + regionTabs;
  }

  function updateRegionTabs() {
    $$('[data-region-tab]', els.regionTabs).forEach((tab) => {
      const active = tab.dataset.regionTab === state.region;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
  }

  function applyAccent() {
    const region = state.region === 'all' ? null : regionById.get(state.region);
    const root = document.documentElement;
    root.style.setProperty('--accent', region ? region.accent : '#0d3b2e');
    root.style.setProperty('--accent-soft', region ? region.accentSoft : '#dfece5');
    root.style.setProperty('--accent-ink', '#ffffff');
    document.body.dataset.region = region ? region.id : 'all';
  }

  function renderRegionBrief() {
    const region = state.region === 'all' ? null : regionById.get(state.region);
    if (!region) {
      const avg = Math.round(
        DATA.destinations.reduce((sum, d) => sum + d.dailyBudget, 0) / DATA.destinations.length
      );
      els.regionBrief.innerHTML = `
        <div class="region-brief-text">
          <strong>The whole atlas.</strong>
          <span>Fifteen places chosen for the way they feel, not just what they tick off. Filter by region, interest or budget — or search for a taste.</span>
        </div>
        <dl class="region-brief-stats">
          <div><dt>Regions</dt><dd>3</dd></div>
          <div><dt>Destinations</dt><dd>15</dd></div>
          <div><dt>Avg. daily</dt><dd>${money(avg)}</dd></div>
        </dl>`;
      return;
    }

    els.regionBrief.innerHTML = `
      <div class="region-brief-text">
        <strong>${esc(region.name)} · ${esc(region.localName)}.</strong>
        <span>${esc(region.description)}</span>
      </div>
      <dl class="region-brief-stats">
        ${region.stats
          .map((stat) => `<div><dt>${esc(stat.label)}</dt><dd>${esc(stat.value)}</dd></div>`)
          .join('')}
      </dl>`;
  }

  function renderTagFilters() {
    const available = new Set();
    DATA.destinations.forEach((d) => d.vibes.forEach((v) => available.add(v)));
    const tags = TAG_ORDER.filter((tag) => available.has(tag));

    els.tagFilters.innerHTML = tags
      .map(
        (tag) => `
          <button class="chip${state.tags.has(tag) ? ' is-active' : ''}" type="button"
                  data-tag="${esc(tag)}" aria-pressed="${state.tags.has(tag)}">${esc(tag)}</button>`
      )
      .join('');
  }

  function updateTagFilters() {
    $$('[data-tag]', els.tagFilters).forEach((chip) => {
      const active = state.tags.has(chip.dataset.tag);
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
  }

  function matches(dest) {
    if (state.region !== 'all' && dest.regionId !== state.region) return false;
    if (state.budget !== 'all' && dest.budgetLevel !== state.budget) return false;
    if (state.tags.size) {
      const hasTag = dest.vibes.some((tag) => state.tags.has(tag));
      if (!hasTag) return false;
    }
    if (state.query) {
      const haystack = [
        dest.name,
        dest.country,
        dest.tagline,
        dest.overview,
        dest.bestTime,
        dest.language,
        regionName(dest.regionId),
        dest.vibes.join(' '),
        dest.attractions.map((a) => `${a.name} ${a.type} ${a.description}`).join(' '),
        dest.cuisine.map((c) => `${c.name} ${c.note}`).join(' '),
        dest.audiences.join(' ')
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(state.query)) return false;
    }
    return true;
  }

  function filteredDestinations() {
    const list = DATA.destinations.filter(matches);
    switch (state.sort) {
      case 'budget':
        list.sort((a, b) => a.dailyBudget - b.dailyBudget || a.name.localeCompare(b.name));
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nights':
        list.sort((a, b) => a.idealNights - b.idealNights || a.dailyBudget - b.dailyBudget);
        break;
      default:
        break;
    }
    return list;
  }

  function renderGrid(list) {
    if (!list.length) {
      els.grid.innerHTML = '';
      els.emptyState.hidden = false;
      return;
    }
    els.emptyState.hidden = true;

    els.grid.innerHTML = list
      .map((dest, index) => {
        const region = regionById.get(dest.regionId);
        const badges = dest.vibes.slice(0, 3);
        return `
          <article class="dest-card" data-region="${esc(dest.regionId)}" style="--badge-accent:${esc(region.accent)}">
            <a class="dest-card-link" href="#/destination/${esc(dest.id)}" data-open-dest="${esc(dest.id)}"
               aria-label="Explore ${esc(dest.name)}, ${esc(dest.country)}">
              <div class="dest-media">
                <img src="${esc(photo(dest.image, 900))}"
                     srcset="${esc(srcset(dest.image, [480, 800, 1200]))}"
                     sizes="(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 33vw"
                     alt="${esc(dest.imageAlt)}" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async">
                <span class="dest-badge">${esc(region.name)}</span>
                <span class="dest-budget">${money(dest.dailyBudget)}/day</span>
              </div>
              <div class="dest-body">
                <span class="dest-region">${esc(dest.country)} · ${dest.idealNights} suggested nights</span>
                <h3 class="dest-name">${esc(dest.name)}</h3>
                <p class="dest-tagline">${esc(dest.tagline)}</p>
                <div class="dest-tags">
                  ${badges.map((tag) => `<span class="dest-tag">${esc(tag)}</span>`).join('')}
                </div>
                <div class="dest-foot">
                  <div class="dest-meta">
                    <span>${icon('calendar')} ${esc(dest.bestTime.split('·')[0].trim())}</span>
                    <span>${icon('clock')} ${dest.idealNights} nights</span>
                  </div>
                </div>
              </div>
            </a>
            <button class="card-add" type="button" data-add="${esc(dest.id)}"
                    aria-label="Add ${esc(dest.name)} to your trip" aria-pressed="false">
              ${icon('plus')}<span>Add to trip</span>
            </button>
          </article>`;
      })
      .join('');

    syncAddButtons();
  }

  function updateResultCount(list) {
    const total = list.length;
    let label = `${total} destination${total === 1 ? '' : 's'}`;
    if (state.region !== 'all') {
      label += total === 0 ? '' : ` in ${regionName(state.region)}`;
    } else if (total === DATA.destinations.length) {
      label += ' across 3 regions';
    }
    if (state.tags.size || state.budget !== 'all' || state.query) {
      label += total === 0 ? ' matched' : ' filtered';
    }
    els.resultCount.textContent = label;
    els.searchClear.hidden = !state.query;
  }

  function render() {
    updateRegionTabs();
    applyAccent();
    renderRegionBrief();
    updateTagFilters();

    const list = filteredDestinations();
    currentList = list.map((d) => d.id);
    renderGrid(list);
    updateResultCount(list);
    syncRouteButtons();
    updateTripBadge();
  }

  /* ------------------------------- Trip UI -------------------------------- */
  function syncAddButtons() {
    $$('[data-add]').forEach((button) => {
      const id = button.dataset.add;
      const added = Boolean(state.trip[id]);
      const dest = destById.get(id);
      const name = dest ? dest.name : 'this destination';

      button.classList.toggle('is-added', added);
      button.setAttribute('aria-pressed', String(added));

      if (button.classList.contains('card-add')) {
        button.setAttribute('aria-label', added ? `${name} is in your trip — open itinerary` : `Add ${name} to your trip`);
        const span = $('span', button);
        const use = $('use', button);
        if (span) span.textContent = added ? 'In trip' : 'Add to trip';
        if (use) use.setAttribute('href', added ? '#i-check' : '#i-plus');
      }

      if (button.classList.contains('aside-add')) {
        button.innerHTML = added
          ? `${icon('check')} In your itinerary`
          : `${icon('plus')} Add to itinerary`;
        button.setAttribute('aria-label', added ? `${name} is in your trip — open itinerary` : `Add ${name} to your trip`);
      }
    });
  }

  function syncRouteButtons() {
    DATA.routes.forEach((route) => {
      const button = $(`[data-route="${route.id}"]`);
      if (!button) return;
      const added = route.destinationIds.every((id) => state.trip[id]);
      button.classList.toggle('is-added', added);
      const span = $('span', button);
      if (span) span.textContent = added ? 'Route in trip' : 'Add route';
      button.setAttribute('aria-pressed', String(added));
    });
  }

  function updateTripBadge() {
    const count = Object.keys(state.trip).length;
    if (!els.tripCount) return;
    els.tripCount.textContent = String(count);
    els.tripCount.classList.toggle('is-empty', count === 0);
    const trigger = $('.trip-trigger');
    if (trigger) {
      trigger.setAttribute(
        'aria-label',
        count === 0 ? 'Open your dream itinerary, currently empty' : `Open your dream itinerary, ${count} place${count === 1 ? '' : 's'}`
      );
    }
  }

  function tripItemHTML(item) {
    const dest = item.dest;
    const region = regionById.get(dest.regionId);
    return `
      <div class="trip-item" data-trip-item="${esc(dest.id)}">
        <img src="${esc(photo(dest.image, 220))}" alt="" loading="lazy" decoding="async"
             style="background:${AVATAR_GRADIENTS[dest.regionId] || '#dfece5'}">
        <div class="trip-item-body">
          <span class="trip-item-region">${esc(region.name)}</span>
          <h3 class="trip-item-name">${esc(dest.name)}</h3>
          <span class="trip-item-cost">${money(dest.dailyBudget)}/day · ${money(dest.dailyBudget * item.nights)} total</span>
          <div class="night-stepper" aria-label="Nights in ${esc(dest.name)}">
            <button type="button" data-trip-dec="${esc(dest.id)}" aria-label="One fewer night in ${esc(dest.name)}">−</button>
            <span>${item.nights} night${item.nights === 1 ? '' : 's'}</span>
            <button type="button" data-trip-inc="${esc(dest.id)}" aria-label="One more night in ${esc(dest.name)}">+</button>
          </div>
        </div>
        <div class="trip-item-actions">
          <button type="button" class="trip-remove" data-trip-remove="${esc(dest.id)}"
                  aria-label="Remove ${esc(dest.name)} from your trip">${icon('trash')}</button>
        </div>
      </div>`;
  }

  function renderTrip() {
    const items = tripEntries();
    const totals = tripTotals();

    els.tripList.innerHTML = items.map(tripItemHTML).join('');
    els.tripEmpty.hidden = items.length > 0;
    els.tripFooter.hidden = items.length === 0;

    $('#tripPlaces').textContent = String(totals.places);
    $('#tripNights').textContent = String(totals.nights);
    $('#tripCost').textContent = money(totals.cost);

    const clearButton = $('#clearTrip');
    clearButton.classList.remove('is-confirming');
    clearButton.innerHTML = `${icon('trash')} Clear itinerary`;
  }

  function openTrip() {
    if (!els.tripDrawer) return;
    renderTrip();
    lastDrawerFocus = document.activeElement;
    els.tripDrawer.hidden = false;
    els.drawerBackdrop.hidden = false;
    // Force a frame so the transform transition runs.
    void els.tripDrawer.offsetWidth;
    els.tripDrawer.classList.add('is-open');
    els.drawerBackdrop.classList.add('is-open');
    drawerOpen = true;
    syncScrollLock();
    const focusTarget = $('[data-close-trip]', els.tripDrawer);
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }

  function closeTrip() {
    if (!drawerOpen) return;
    drawerOpen = false;
    els.tripDrawer.classList.remove('is-open');
    els.drawerBackdrop.classList.remove('is-open');
    syncScrollLock();
    if (lastDrawerFocus && lastDrawerFocus.isConnected) {
      lastDrawerFocus.focus({ preventScroll: true });
    }
    window.setTimeout(() => {
      if (!drawerOpen) {
        els.tripDrawer.hidden = true;
        els.drawerBackdrop.hidden = true;
      }
    }, REDUCED_MOTION ? 0 : 420);
  }

  function buildItineraryText() {
    const items = tripEntries();
    const totals = tripTotals();
    const lines = [];
    lines.push('WANDERLUST 3D — MY DREAM ITINERARY');
    lines.push('='.repeat(42));
    lines.push('');
    lines.push(`${totals.places} place${totals.places === 1 ? '' : 's'} · ${totals.nights} nights · est. ${money(totals.cost)}`);
    lines.push('Indicative mid-range budget, per person. Flights not included.');
    lines.push('');
    items.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.dest.name}, ${item.dest.country}`);
      lines.push(`   ${item.nights} night${item.nights === 1 ? '' : 's'} · ${money(item.dest.dailyBudget)}/day · ${money(item.dest.dailyBudget * item.nights)}`);
      lines.push(`   ${item.dest.tagline}`);
      lines.push(`   Best time: ${item.dest.bestTime}`);
      lines.push('');
    });
    lines.push('-'.repeat(42));
    lines.push('Generated by Wanderlust 3D — https://somphol.github.io/wanderlust-3d/');
    return lines.join('\n');
  }

  async function copyItinerary() {
    const text = buildItineraryText();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      showToast('Itinerary copied to your clipboard.');
    } catch (error) {
      showToast('Copy failed — try downloading the itinerary instead.');
    }
  }

  function downloadItinerary() {
    const blob = new Blob([buildItineraryText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wanderlust-itinerary.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast('Itinerary downloaded as a text file.');
  }

  /* -------------------------------- Routes -------------------------------- */
  function renderRoutes() {
    const grid = $('#routeGrid');
    if (!grid) return;
    grid.innerHTML = DATA.routes
      .map((route) => {
        const region = regionById.get(route.regionId);
        const stops = route.destinationIds
          .map((id) => destById.get(id))
          .filter(Boolean)
          .map((d) => `<span>${esc(d.name)}</span>`)
          .join('');
        return `
          <article class="route-card">
            <img src="${esc(photo(route.image, 900))}"
                 srcset="${esc(srcset(route.image, [480, 800, 1200]))}"
                 sizes="(max-width: 760px) 100vw, 33vw" alt="${esc(route.imageAlt)}"
                 loading="lazy" decoding="async">
            <div class="route-content">
              <div class="route-meta">
                <span class="route-pill">${esc(region.name)}</span>
                <span class="route-pill">${route.days} days</span>
                <span class="route-pill">${esc(route.pace)} pace</span>
              </div>
              <h3>${esc(route.name)}</h3>
              <p>${esc(route.summary)}</p>
              <div class="route-stops">${stops}</div>
              <div class="route-footer">
                <span class="route-price">From<strong>${money(route.budgetFrom)}<span style="font-family:var(--font-body);font-size:.62rem;font-weight:600;color:rgba(255,253,248,.6)"> / person</span></strong></span>
                <button type="button" class="route-load" data-route="${esc(route.id)}" aria-pressed="false">
                  ${icon('route')}<span>Add route</span>
                </button>
              </div>
            </div>
          </article>`;
      })
      .join('');
    syncRouteButtons();
  }

  function addRoute(routeId) {
    const route = DATA.routes.find((r) => r.id === routeId);
    if (!route) return;
    let added = 0;
    route.destinationIds.forEach((id) => {
      if (!state.trip[id]) {
        addToTrip(id, destById.get(id).idealNights, { silent: true });
        added += 1;
      }
    });
    syncAddButtons();
    syncRouteButtons();
    updateTripBadge();
    if (!added) {
      showToast('That route is already in your trip.', 'View trip', openTrip);
    } else {
      showToast(
        `${route.name} added — ${added} new place${added === 1 ? '' : 's'}.`,
        'View trip',
        openTrip
      );
    }
  }

  /* -------------------------------- Modal --------------------------------- */
  let modalOpen = false;
  let lastModalFocus = null;
  let lastDrawerFocus = null;
  let drawerOpen = false;
  let modalList = [];

  function monthStripHTML(dest) {
    return MONTHS.map((month) => {
      const best = dest.bestMonths.includes(month);
      return `<span class="${best ? 'is-best' : ''}" title="${month}${best ? ' — recommended' : ''}">${month}</span>`;
    }).join('');
  }

  function budgetCardHTML(dest) {
    const total = dest.dailyBudget;
    const parts = [
      ['Comfortable stay', dest.budgetBreakdown.stay],
      ['Food & drink', dest.budgetBreakdown.food],
      ['Local transport', dest.budgetBreakdown.transport],
      ['Activities', dest.budgetBreakdown.activities]
    ];
    return `
      <div class="aside-card">
        <h3>${icon('wallet')} Where the money goes</h3>
        <div class="budget-lines">
          ${parts
            .map(
              ([label, value]) => `
                <div class="budget-line">
                  <span>${esc(label)}</span><strong>${money(value)}</strong>
                  <div class="budget-bar"><i style="width:${Math.round((value / total) * 100)}%"></i></div>
                </div>`
            )
            .join('')}
        </div>
        <div class="budget-total"><span>Indicative daily total</span><strong>${money(total)}</strong></div>
      </div>`;
  }

  function modalHTML(dest) {
    const region = regionById.get(dest.regionId);
    const index = currentList.indexOf(dest.id);
    const list = currentList.length ? currentList : DATA.destinations.map((d) => d.id);
    const safeIndex = Math.max(0, list.indexOf(dest.id));
    const prev = destById.get(list[(safeIndex - 1 + list.length) % list.length]);
    const next = destById.get(list[(safeIndex + 1) % list.length]);
    const added = Boolean(state.trip[dest.id]);

    return `
      <div class="modal-hero">
        <img id="modalMainImage" src="${esc(photo(dest.image, 1600))}"
             srcset="${esc(srcset(dest.image, [800, 1200, 1600], 80))}"
             sizes="(max-width: 760px) 100vw, 1120px" alt="${esc(dest.imageAlt)}">
        <div class="modal-hero-content">
          <span class="modal-region-pill">${esc(region.name)} · ${esc(dest.vibes[0])}</span>
          <h2 id="modalTitle">${esc(dest.name)}</h2>
          <p>${esc(dest.tagline)}</p>
          <span class="modal-country">${esc(dest.country)} · ${dest.lat.toFixed(2)}°N, ${Math.abs(dest.lng).toFixed(2)}°${dest.lng >= 0 ? 'E' : 'W'}</span>
        </div>
        <div class="modal-gallery" aria-label="Destination photo gallery">
          ${dest.gallery
            .map(
              (shot, i) => `
                <button type="button" class="modal-thumb${i === 0 ? ' is-active' : ''}"
                        data-gallery-index="${i}" aria-label="Show photo ${i + 1} of ${dest.gallery.length}">
                  <img src="${esc(photo(shot.image, 160))}" alt="" loading="lazy" decoding="async">
                </button>`
            )
            .join('')}
        </div>
      </div>

      <div class="modal-body">
        <div class="modal-main">
          <section class="modal-section">
            <h3>${icon('compass')} The feeling</h3>
            <p class="modal-overview">${esc(dest.overview)}</p>
          </section>

          <section class="modal-section">
            <h3>${icon('pin')} Three things worth your time</h3>
            <div class="attraction-list">
              ${dest.attractions
                .map(
                  (attraction, i) => `
                    <article class="attraction">
                      <span class="attraction-num">0${i + 1}</span>
                      <div>
                        <h4>${esc(attraction.name)} <span class="attraction-type">${esc(attraction.type)}</span></h4>
                        <p>${esc(attraction.description)}</p>
                      </div>
                    </article>`
                )
                .join('')}
            </div>
          </section>

          <section class="modal-section">
            <h3>${icon('utensils')} Eat like a local</h3>
            <div class="cuisine-grid">
              ${dest.cuisine
                .map(
                  (dish) => `
                    <div class="cuisine-item">
                      <strong>${esc(dish.name)}</strong>
                      <span>${esc(dish.note)}</span>
                    </div>`
                )
                .join('')}
            </div>
          </section>

          <section class="modal-section modal-notes">
            <div class="note-card">
              <h4>${icon('info')} Cultural notes</h4>
              <p>${esc(dest.culture)}</p>
            </div>
            <div class="note-card season">
              <h4>${icon('sun')} Weather & seasons</h4>
              <p>${esc(dest.seasonNote)}</p>
            </div>
          </section>

          <section class="modal-section">
            <h3>${icon('route')} How to spend your days</h3>
            <p class="modal-tip">${esc(dest.itineraryTip)}</p>
          </section>
        </div>

        <aside class="modal-aside">
          <div class="aside-sticky">
            <div class="aside-card">
              <dl class="aside-stats">
                <div class="aside-stat"><dt>${icon('calendar')} Best time</dt><dd>${esc(dest.bestTime)}</dd></div>
                <div class="aside-stat"><dt>${icon('wallet')} Daily budget</dt><dd>${money(dest.dailyBudget)}</dd></div>
                <div class="aside-stat"><dt>${icon('clock')} Suggested stay</dt><dd>${dest.idealNights} nights</dd></div>
                <div class="aside-stat"><dt>${icon('language')} Language</dt><dd>${esc(dest.language)}</dd></div>
              </dl>
              <div class="aside-tags">
                ${dest.vibes.map((tag) => `<span>${esc(tag)}</span>`).join('')}
              </div>
              <button type="button" class="aside-add${added ? ' is-added' : ''}" data-add="${esc(dest.id)}"
                      aria-pressed="${added}">
                ${added ? `${icon('check')} In your itinerary` : `${icon('plus')} Add to itinerary`}
              </button>
              <p class="aside-add-note">${added ? 'Adjust nights in your trip drawer.' : `Starts with ${dest.idealNights} suggested nights.`}</p>
            </div>

            ${budgetCardHTML(dest)}

            <div class="aside-card">
              <h3>${icon('sun')} Best months</h3>
              <div class="month-strip">${monthStripHTML(dest)}</div>
              <p class="month-legend">Green months are the recommended window. Shoulder seasons can be excellent value.</p>
            </div>
          </div>
        </aside>
      </div>

      <div class="modal-nav">
        <button type="button" data-modal-nav="prev" aria-label="Previous destination: ${esc(prev.name)}">
          ${icon('arrow-left')}<span>${esc(prev.name)}</span>
        </button>
        <button type="button" class="next" data-modal-nav="next" aria-label="Next destination: ${esc(next.name)}">
          <span>${esc(next.name)}</span>${icon('arrow-right')}
        </button>
      </div>`;
  }

  function openDestination(id, options = {}) {
    const dest = destById.get(id);
    if (!dest) return;
    modalList = options.list || currentList;
    if (!modalList.includes(id)) modalList = DATA.destinations.map((d) => d.id);

    els.modalContent.innerHTML = modalHTML(dest);
    els.modalContent.scrollTop = 0;
    if (!modalOpen) {
      lastModalFocus = document.activeElement;
      els.modal.hidden = false;
      modalOpen = true;
      syncScrollLock();
    }
    els.modalPanel.scrollTop = 0;
    const closeButton = $('.modal-close', els.modal);
    if (closeButton && !options.keepFocus) closeButton.focus({ preventScroll: true });

    if (options.updateHash !== false) {
      const target = `#/destination/${dest.id}`;
      if (location.hash !== target) {
        history.replaceState({ destination: dest.id }, '', target);
      }
    }
  }

  function closeDestination() {
    if (!modalOpen) return;
    modalOpen = false;
    els.modal.hidden = true;
    els.modalContent.innerHTML = '';
    syncScrollLock();
    if (location.hash.startsWith('#/destination/')) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    if (lastModalFocus && lastModalFocus.isConnected) {
      lastModalFocus.focus({ preventScroll: true });
    }
  }

  function navigateModal(direction) {
    const list = modalList.length ? modalList : currentList;
    if (!list.length) return;
    const currentId = location.hash.startsWith('#/destination/') ? location.hash.split('/').pop() : null;
    const currentIndex = Math.max(0, list.indexOf(currentId));
    const nextIndex = (currentIndex + direction + list.length) % list.length;
    openDestination(list[nextIndex], { list, keepFocus: true, updateHash: true });
    const closeButton = $('.modal-close', els.modal);
    if (closeButton) closeButton.focus({ preventScroll: true });
  }

  function swapGalleryImage(index) {
    const id = location.hash.startsWith('#/destination/') ? location.hash.split('/').pop() : null;
    const dest = destById.get(id) || { gallery: [] };
    const shot = dest.gallery[index];
    if (!shot) return;
    const image = $('#modalMainImage');
    if (image) {
      image.src = photo(shot.image, 1600);
      image.srcset = srcset(shot.image, [800, 1200, 1600], 80);
      image.alt = shot.alt;
    }
    $$('.modal-thumb', els.modal).forEach((thumb, i) => thumb.classList.toggle('is-active', i === index));
  }

  /* -------------------------------- Toast --------------------------------- */
  let toastTimer = null;

  function showToast(message, actionLabel, actionFn) {
    if (!els.toast) return;
    els.toastMessage.textContent = message;
    els.toast.hidden = false;

    if (actionLabel && actionFn) {
      els.toastAction.hidden = false;
      els.toastAction.textContent = actionLabel;
      els.toastAction.onclick = () => {
        actionFn();
        hideToast();
      };
    } else {
      els.toastAction.hidden = true;
      els.toastAction.onclick = null;
    }

    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(hideToast, 4600);
  }

  function hideToast() {
    if (!els.toast) return;
    els.toast.hidden = true;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = null;
  }

  /* ------------------------------ Hero slider ----------------------------- */
  let heroIndex = 0;
  let heroTimer = null;

  function restartHeroProgress() {
    if (!els.heroProgress) return;
    els.heroProgress.classList.remove('is-running');
    void els.heroProgress.offsetWidth;
    if (!REDUCED_MOTION) els.heroProgress.classList.add('is-running');
  }

  function setHeroSlide(index, restart = true) {
    heroIndex = (index + els.heroSlides.length) % els.heroSlides.length;
    els.heroSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === heroIndex));
    els.heroDots.forEach((dot, i) => {
      const active = i === heroIndex;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
    });
    restartHeroProgress();
    if (restart) startHeroAutoplay();
  }

  function startHeroAutoplay() {
    stopHeroAutoplay();
    if (REDUCED_MOTION) return;
    heroTimer = window.setInterval(() => setHeroSlide(heroIndex + 1, false), 8000);
  }

  function stopHeroAutoplay() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
      heroTimer = null;
    }
  }

  /* -------------------------------- Filters ------------------------------- */
  let searchDebounce = null;

  function setQuery(value) {
    state.query = value.trim().toLowerCase();
    els.searchInput.value = value;
    els.heroSearchInput.value = value;
    render();
  }

  function toggleTag(tag) {
    if (state.tags.has(tag)) state.tags.delete(tag);
    else state.tags.add(tag);
    render();
  }

  function resetFilters() {
    state.region = 'all';
    state.query = '';
    state.tags.clear();
    state.budget = 'all';
    state.sort = 'curated';
    els.searchInput.value = '';
    els.heroSearchInput.value = '';
    els.budgetFilter.value = 'all';
    els.sortFilter.value = 'curated';
    render();
    showToast('Filters cleared. The whole atlas is back.');
  }

  function scrollToExplore() {
    const target = $('#explore');
    if (target) target.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'start' });
  }

  function commitSearch(value) {
    state.region = 'all';
    setQuery(value);
    scrollToExplore();
  }

  /* ----------------------------- Focus + scroll --------------------------- */
  function syncScrollLock() {
    document.body.classList.toggle('no-scroll', modalOpen || drawerOpen);
  }

  function focusableElements(container) {
    return $$(
      'a[href], button:not([disabled]):not([hidden]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  function trapTab(event, container) {
    const items = focusableElements(container);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ------------------------------- Menu ----------------------------------- */
  function toggleMenu(force) {
    const open = typeof force === 'boolean' ? force : els.mobileNav.hidden;
    els.mobileNav.hidden = !open;
    els.menuBtn.setAttribute('aria-expanded', String(open));
    els.menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    const use = $('use', els.menuBtn);
    if (use) use.setAttribute('href', open ? '#i-close' : '#i-menu');
  }

  /* ------------------------------- Events --------------------------------- */
  function bindEvents() {
    // Global delegated clicks
    document.addEventListener('click', (event) => {
      const openDest = event.target.closest('[data-open-dest]');
      if (openDest) {
        event.preventDefault();
        openDestination(openDest.dataset.openDest, { list: currentList });
        return;
      }

      const closeModalBtn = event.target.closest('[data-close-modal]');
      if (closeModalBtn) {
        closeDestination();
        return;
      }

      const addBtn = event.target.closest('[data-add]');
      if (addBtn) {
        event.preventDefault();
        const id = addBtn.dataset.add;
        if (state.trip[id]) {
          closeDestination();
          openTrip();
          showToast(`${destById.get(id).name} is already in your trip.`);
        } else {
          addToTrip(id, destById.get(id).idealNights);
          syncAddButtons();
        }
        return;
      }

      const openTripBtn = event.target.closest('[data-open-trip]');
      if (openTripBtn) {
        event.preventDefault();
        toggleMenu(false);
        openTrip();
        return;
      }

      const closeTripBtn = event.target.closest('[data-close-trip]');
      if (closeTripBtn) {
        closeTrip();
        return;
      }

      const regionBtn = event.target.closest('[data-region-tab]');
      if (regionBtn) {
        state.region = regionBtn.dataset.regionTab;
        render();
        return;
      }

      const regionJump = event.target.closest('[data-region-jump]');
      if (regionJump) {
        state.region = regionJump.dataset.regionJump;
        render();
        toggleMenu(false);
        return;
      }

      const tagChip = event.target.closest('[data-tag]');
      if (tagChip) {
        toggleTag(tagChip.dataset.tag);
        return;
      }

      const quick = event.target.closest('[data-quick-search]');
      if (quick) {
        event.preventDefault();
        commitSearch(quick.dataset.quickSearch);
        return;
      }

      const thumb = event.target.closest('[data-gallery-index]');
      if (thumb) {
        swapGalleryImage(Number(thumb.dataset.galleryIndex));
        return;
      }

      const nav = event.target.closest('[data-modal-nav]');
      if (nav) {
        navigateModal(nav.dataset.modalNav === 'next' ? 1 : -1);
        return;
      }

      const routeBtn = event.target.closest('[data-route]');
      if (routeBtn) {
        addRoute(routeBtn.dataset.route);
        return;
      }

      const inc = event.target.closest('[data-trip-inc]');
      if (inc) {
        const id = inc.dataset.tripInc;
        if (state.trip[id]) {
          state.trip[id].nights = clamp(state.trip[id].nights + 1, 1, MAX_NIGHTS);
          saveTrip();
          renderTrip();
          $(`[data-trip-inc="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
        }
        return;
      }

      const dec = event.target.closest('[data-trip-dec]');
      if (dec) {
        const id = dec.dataset.tripDec;
        if (state.trip[id]) {
          state.trip[id].nights = clamp(state.trip[id].nights - 1, 1, MAX_NIGHTS);
          saveTrip();
          renderTrip();
          $(`[data-trip-dec="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
        }
        return;
      }

      const remove = event.target.closest('[data-trip-remove]');
      if (remove) {
        removeFromTrip(remove.dataset.tripRemove);
        return;
      }

      // Clicking the dimmed area outside the drawer closes it.
      if (drawerOpen && event.target === els.drawerBackdrop) {
        closeTrip();
        return;
      }

      if (!els.mobileNav.hidden && !event.target.closest('.mobile-nav') && !event.target.closest('#menuBtn')) {
        toggleMenu(false);
      }
    });

    // Hero controls
    $('#heroNext')?.addEventListener('click', () => setHeroSlide(heroIndex + 1));
    $('#heroPrev')?.addEventListener('click', () => setHeroSlide(heroIndex - 1));
    els.heroDots.forEach((dot) =>
      dot.addEventListener('click', () => setHeroSlide(Number(dot.dataset.slide)))
    );

    // Hero search
    $('#heroSearch')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = els.heroSearchInput.value.trim();
      if (!value) {
        scrollToExplore();
        return;
      }
      commitSearch(value);
    });

    // The hero field commits on submit so the page does not jump while typing.

    // Explorer search
    els.searchInput?.addEventListener('input', () => {
      const value = els.searchInput.value;
      els.searchClear.hidden = !value;
      window.clearTimeout(searchDebounce);
      searchDebounce = window.setTimeout(() => {
        state.query = value.trim().toLowerCase();
        els.heroSearchInput.value = value;
        render();
      }, 140);
    });

    els.searchClear?.addEventListener('click', () => {
      state.query = '';
      els.searchInput.value = '';
      els.heroSearchInput.value = '';
      els.searchClear.hidden = true;
      els.searchInput.focus();
      render();
    });

    els.budgetFilter?.addEventListener('change', () => {
      state.budget = els.budgetFilter.value;
      render();
    });
    els.sortFilter?.addEventListener('change', () => {
      state.sort = els.sortFilter.value;
      render();
    });
    $('#resetFilters')?.addEventListener('click', resetFilters);
    $('#emptyReset')?.addEventListener('click', resetFilters);

    // Trip actions
    $('#copyTrip')?.addEventListener('click', copyItinerary);
    $('#downloadTrip')?.addEventListener('click', downloadItinerary);
    $('#clearTrip')?.addEventListener('click', () => {
      const button = $('#clearTrip');
      if (!button.classList.contains('is-confirming')) {
        button.classList.add('is-confirming');
        button.innerHTML = `${icon('trash')} Tap again to clear everything`;
        window.setTimeout(() => {
          if (button.classList.contains('is-confirming')) {
            button.classList.remove('is-confirming');
            button.innerHTML = `${icon('trash')} Clear itinerary`;
          }
        }, 4000);
        return;
      }
      state.trip = {};
      saveTrip();
      syncAddButtons();
      syncRouteButtons();
      updateTripBadge();
      renderTrip();
      showToast('Itinerary cleared. A blank map is a good place to start.');
    });

    $('#toastClose')?.addEventListener('click', hideToast);

    // Mobile menu
    els.menuBtn?.addEventListener('click', () => toggleMenu());
    $$('a', els.mobileNav).forEach((link) => link.addEventListener('click', () => toggleMenu(false)));

    // Header scroll + back to top
    let scrollTick = false;
    window.addEventListener(
      'scroll',
      () => {
        if (scrollTick) return;
        scrollTick = true;
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          els.header.classList.toggle('is-scrolled', y > 36);
          els.backToTop.hidden = y < 900;
          scrollTick = false;
        });
      },
      { passive: true }
    );

    els.backToTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    });

    // Global keyboard
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (modalOpen) {
          closeDestination();
        } else if (drawerOpen) {
          closeTrip();
        } else if (!els.mobileNav.hidden) {
          toggleMenu(false);
          els.menuBtn.focus();
        }
        return;
      }

      if (event.key === 'Tab') {
        if (modalOpen) trapTab(event, els.modalPanel);
        else if (drawerOpen) trapTab(event, els.tripDrawer);
      }

      // Arrow keys move between region tabs when one has focus.
      if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && document.activeElement?.matches('[data-region-tab]')) {
        const tabs = $$('[data-region-tab]', els.regionTabs);
        const index = tabs.indexOf(document.activeElement);
        const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
        tabs[next].focus();
        tabs[next].click();
      }
    });

    // Deep links and browser back/forward.
    window.addEventListener('popstate', () => {
      const match = location.hash.match(/^#\/destination\/([\w-]+)$/);
      if (match && destById.has(match[1])) openDestination(match[1], { updateHash: false });
      else if (modalOpen) closeDestination();
    });

    // Pause hero rotation when the tab is hidden.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopHeroAutoplay();
      else startHeroAutoplay();
    });

    // Close the mobile menu on resize to desktop.
    window.addEventListener('resize', () => {
      if (window.innerWidth > 940 && !els.mobileNav.hidden) toggleMenu(false);
    });

    // Image fallbacks: a failed CDN image should never break the layout.
    document.addEventListener(
      'error',
      (event) => {
        const target = event.target;
        if (target instanceof HTMLImageElement) {
          target.classList.add('img-fallback');
          target.style.visibility = 'hidden';
        }
      },
      true
    );
  }

  /* -------------------------------- Reveal -------------------------------- */
  function setupReveals() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window) || REDUCED_MOTION) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    items.forEach((el) => observer.observe(el));
  }

  /* --------------------------------- Init --------------------------------- */
  function init() {
    cacheElements();
    loadTrip();
    renderRegionTabs();
    renderTagFilters();
    renderRoutes();
    render();
    updateTripBadge();
    bindEvents();
    setupReveals();

    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());

    // Initial hero state + autoplay.
    setHeroSlide(0, false);
    startHeroAutoplay();

    // Deep link support: #/destination/kyoto
    const match = location.hash.match(/^#\/destination\/([\w-]+)$/);
    if (match && destById.has(match[1])) {
      window.setTimeout(() => openDestination(match[1], { updateHash: false }), 120);
    }

    // If storage was unavailable, tell the user once, without blocking.
    if (!storageAvailable) {
      window.setTimeout(() => {
        showToast('Private browsing detected: your trip will last for this session only.');
      }, 1200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
