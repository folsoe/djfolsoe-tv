/* DJ FOLSOE NETWORK V2400.1 — CONSOLIDATED WEBSITE UI RUNTIME */
/* Generated from active website UI scripts. Worker/Admin/theme core are not included. */

/* ===== SOURCE: assets/js/djf-homepage-v2000-1.js ===== */

(() => {
  "use strict";

  const API_BASE =
    window.DJF_CONFIG?.API_BASE ||
    window.DJFOLSOE_CONFIG?.API_BASE ||
    "https://djfolsoe-tv-api.sunefolsoe.workers.dev";

  const ownHost = location.hostname.replace(/^www\./, "").toLowerCase();

  function text(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }

  function firstArray(...values) {
    return values.find(Array.isArray) || [];
  }

  function normalizeTrack(item, index) {
    if (!item || typeof item !== "object") return null;

    const artist = text(
      item.artist ??
      item.performer ??
      item.creator ??
      item.band ??
      item.author
    );

    const title = text(
      item.title ??
      item.song ??
      item.track ??
      item.name
    );

    if (!title && !artist) return null;

    return {
      rank: Number(item.rank ?? item.position ?? item.number ?? index + 1) || index + 1,
      artist: artist || "DJ FOLSOE",
      title: title || "Untitled",
      cover: text(item.cover ?? item.image ?? item.artwork ?? item.thumbnail ?? ""),
      movement: text(item.movement ?? item.change ?? "")
    };
  }

  function renderTrackList(container, items, limit = 20) {
    if (!container) return;

    const normalized = items
      .map(normalizeTrack)
      .filter(Boolean)
      .slice(0, limit);

    container.innerHTML = normalized.map(track => `
      <article class="djfChartRow">
        <strong class="djfChartRank">${String(track.rank).padStart(2, "0")}</strong>
        ${track.cover
          ? `<img class="djfChartCover" src="${track.cover.replace(/"/g, "&quot;")}" alt="">`
          : `<span class="djfChartCover djfChartCoverFallback">♫</span>`}
        <div class="djfChartCopy">
          <b>${track.artist.replace(/</g, "&lt;")}</b>
          <span>${track.title.replace(/</g, "&lt;")}</span>
        </div>
        <i class="djfChartWave" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></i>
      </article>
    `).join("");
  }

  function setupExpand(buttonId, listId, fullLabel) {
    const button = document.getElementById(buttonId);
    const list = document.getElementById(listId);
    if (!button || !list) return;

    button.addEventListener("click", () => {
      const expanded = list.classList.toggle("is-expanded");
      button.setAttribute("aria-expanded", String(expanded));
      const label = button.querySelector("span");
      if (label) label.textContent = expanded ? "Show first 3" : fullLabel;
    });
  }

  function watchTop20() {
    const list = document.getElementById("chartList");
    const button = document.getElementById("top20Expand");
    if (!list || !button) return;

    const update = () => {
      const count = list.children.length;
      button.hidden = count <= 3;
    };

    new MutationObserver(update).observe(list, { childList: true });
    update();
  }

  function findRetroArray(payload) {
    const direct = firstArray(
      payload?.retroFavoriteTop10,
      payload?.retroFavorites,
      payload?.retroTop10,
      payload?.charts?.retroFavoriteTop10,
      payload?.charts?.retroFavorites,
      payload?.charts?.retroTop10,
      payload?.data?.retroFavoriteTop10,
      payload?.data?.retroFavorites,
      payload?.data?.retroTop10,
      payload?.broadcast?.retroFavoriteTop10,
      payload?.broadcast?.retroFavorites,
      payload?.broadcast?.retroTop10
    );
    if (direct.length) return direct;

    const visited = new Set();
    function walk(value, key = "") {
      if (!value || typeof value !== "object" || visited.has(value)) return null;
      visited.add(value);

      if (Array.isArray(value)) {
        if (/retro.*(favorite|favourite|top.?10|chart)/i.test(key)) return value;
        return null;
      }

      for (const [childKey, child] of Object.entries(value)) {
        const result = walk(child, childKey);
        if (result?.length) return result;
      }
      return null;
    }
    return walk(payload) || [];
  }

  async function loadRetroChart() {
    const panel = document.getElementById("retroFavoritePanel");
    const list = document.getElementById("retroFavoriteList");
    const button = document.getElementById("retroExpand");
    if (!panel || !list) return;

    const endpoints = [
      `${API_BASE}/api/broadcast`,
      `${API_BASE}/api/cms/public/state`,
      `${API_BASE}/api/content/public/state`
    ];

    let retro = [];
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) continue;
        const payload = await response.json();
        retro = findRetroArray(payload);
        if (retro.length) break;
      } catch (_) {}
    }

    if (!retro.length) {
      panel.hidden = true;
      return;
    }

    renderTrackList(list, retro, 10);
    panel.hidden = false;
    if (button) button.hidden = list.children.length <= 3;
  }

  function isOwnNewsCard(card) {
    if (!card || card.matches(".contentLoading")) return false;

    const meaningful = text(card.textContent);
    if (!meaningful || meaningful.length < 8) return false;

    const explicitSource = text(
      card.dataset.source ||
      card.dataset.origin ||
      card.dataset.newsSource ||
      ""
    ).toLowerCase();

    if (/cms|dj.?folsoe|own|channel|network/.test(explicitSource)) return true;

    const links = [...card.querySelectorAll("a[href]")];
    if (!links.length) return true;

    return links.every(link => {
      try {
        const host = new URL(link.href, location.href)
          .hostname.replace(/^www\./, "")
          .toLowerCase();
        return !host || host === ownHost || host.endsWith(`.${ownHost}`);
      } catch (_) {
        return true;
      }
    });
  }

  function filterOwnNews() {
    const section = document.getElementById("musicNews");
    const featured = document.getElementById("featuredNews");
    const grid = document.getElementById("musicNewsGrid");
    if (!section || !grid) return;

    const cards = [
      ...(featured && !featured.hidden ? [featured] : []),
      ...grid.children
    ];

    let ownCount = 0;
    cards.forEach(card => {
      const own = isOwnNewsCard(card);
      card.classList.toggle("djfExternalNewsRemoved", !own);
      if (own) ownCount += 1;
    });

    section.classList.toggle("djfOwnNewsEmpty", ownCount === 0);
    section.hidden = ownCount === 0;

    if (ownCount > 0) {
      const title = document.getElementById("musicNewsTitle");
      if (title) title.textContent = "DJ FOLSOE News";
    }
  }

  function watchNews() {
    const section = document.getElementById("musicNews");
    if (!section) return;

    let timer = 0;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(filterOwnNews, 120);
    };

    new MutationObserver(schedule).observe(section, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    schedule();
    setTimeout(schedule, 800);
    setTimeout(schedule, 2500);
  }

  function normalizeTicker() {
    const track = document.getElementById("activityTickerTrack");
    if (!track) return;

    const prepare = () => {
      const items = [...track.children].filter(node => text(node.textContent));
      if (!items.length) return;

      const totalChars = items.reduce((sum, node) => sum + text(node.textContent).length, 0);
      const duration = Math.max(26, Math.min(68, totalChars * 0.24));
      track.style.setProperty("--djf-ticker-duration", `${duration}s`);

      if (track.dataset.djfLoopReady !== "true") {
        const fragment = document.createDocumentFragment();
        items.forEach(node => {
          const clone = node.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          fragment.appendChild(clone);
        });
        track.appendChild(fragment);
        track.dataset.djfLoopReady = "true";
      }
    };

    new MutationObserver(() => {
      if (track.dataset.djfLoopReady === "true") return;
      prepare();
    }).observe(track, { childList: true, subtree: true });

    prepare();
    setTimeout(prepare, 700);
    setTimeout(prepare, 2200);
  }

  function addChartRowStyles() {
    if (document.getElementById("djf-chart-row-runtime")) return;
    const style = document.createElement("style");
    style.id = "djf-chart-row-runtime";
    style.textContent = `
      .djfChartRow{
        position:relative;display:grid!important;
        grid-template-columns:46px 48px minmax(0,1fr) 58px!important;
        align-items:center!important;gap:10px!important;
        min-height:67px!important;padding:9px 11px!important;
        overflow:hidden!important;border:1px solid rgba(42,54,82,.11)!important;
        border-radius:14px!important;background:linear-gradient(145deg,#fff,#edf3f9)!important;
        box-shadow:0 8px 20px rgba(34,45,72,.08)!important;
      }
      .djfChartRow:before{
        content:"";position:absolute;left:0;top:0;bottom:0;width:4px;
        background:linear-gradient(#ff9a28,#f23996,#7d4eff);
      }
      .djfChartRank{
        color:#151b28!important;font:900 24px/1 "Barlow Condensed",Arial,sans-serif!important;
        text-align:center;
      }
      .djfChartCover{
        width:45px!important;height:45px!important;border-radius:9px!important;
        object-fit:cover!important;background:#e8eef6!important;
        box-shadow:0 6px 15px rgba(34,45,72,.13)!important;
      }
      .djfChartCoverFallback{
        display:grid!important;place-items:center!important;color:#fff!important;
        background:linear-gradient(135deg,#ff9a28,#f23996,#7d4eff)!important;
        font-size:18px!important;
      }
      .djfChartCopy{min-width:0}
      .djfChartCopy b,.djfChartCopy span{
        display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;
      }
      .djfChartCopy b{color:#151b28!important;font-size:12px!important;font-weight:900!important}
      .djfChartCopy span{margin-top:4px;color:#667187!important;font-size:10px!important;font-weight:700!important}
      .djfChartWave{display:flex;align-items:center;justify-content:flex-end;gap:3px;height:25px}
      .djfChartWave span{
        width:3px;border-radius:4px;background:linear-gradient(#f23996,#ff9a28);
        animation:djfChartBeat .75s ease-in-out infinite alternate;
      }
      .djfChartWave span:nth-child(1){height:25%;animation-delay:.05s}
      .djfChartWave span:nth-child(2){height:70%;animation-delay:.21s}
      .djfChartWave span:nth-child(3){height:42%;animation-delay:.12s}
      .djfChartWave span:nth-child(4){height:88%;animation-delay:.30s}
      .djfChartWave span:nth-child(5){height:52%;animation-delay:.17s}
      @keyframes djfChartBeat{to{height:100%}}
      @media(max-width:520px){
        .djfChartRow{grid-template-columns:38px 42px minmax(0,1fr)!important}
        .djfChartWave{display:none!important}
        .djfChartCover{width:40px!important;height:40px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function start() {
    addChartRowStyles();
    normalizeTicker();
    watchNews();
    setupExpand("top20Expand", "chartList", "View full Top 20");
    setupExpand("retroExpand", "retroFavoriteList", "View full Top 10");
    watchTop20();
    loadRetroChart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();


/* ===== SOURCE: assets/js/djf-homepage-v2000-2.js ===== */

(() => {
  "use strict";

  const API_BASE =
    window.DJF_CONFIG?.API_BASE ||
    window.DJFOLSOE_CONFIG?.API_BASE ||
    "https://djfolsoe-tv-api.sunefolsoe.workers.dev";

  const clean = value => String(value ?? "").replace(/\s+/g, " ").trim();

  function normalize(item, index) {
    if (!item || typeof item !== "object") return null;
    const artist = clean(item.artist ?? item.performer ?? item.creator ?? item.band ?? item.author);
    const title = clean(item.title ?? item.song ?? item.track ?? item.name);
    if (!artist && !title) return null;
    return {
      rank: Number(item.rank ?? item.position ?? item.number ?? index + 1) || index + 1,
      artist: artist || "DJ FOLSOE",
      title: title || "Untitled",
      cover: clean(item.cover ?? item.image ?? item.artwork ?? item.thumbnail ?? "")
    };
  }

  function findArray(payload, patterns) {
    const seen = new Set();

    function walk(value, key = "") {
      if (!value || typeof value !== "object" || seen.has(value)) return null;
      seen.add(value);

      if (Array.isArray(value)) {
        return patterns.some(pattern => pattern.test(key)) ? value : null;
      }

      for (const [childKey, child] of Object.entries(value)) {
        if (Array.isArray(child) && patterns.some(pattern => pattern.test(childKey))) {
          return child;
        }
      }

      for (const [childKey, child] of Object.entries(value)) {
        const result = walk(child, childKey);
        if (result) return result;
      }
      return null;
    }

    return walk(payload) || [];
  }

  function findTop20(payload) {
    const direct = [
      payload?.top20,
      payload?.chart?.top20,
      payload?.charts?.top20,
      payload?.data?.top20,
      payload?.broadcast?.top20,
      payload?.website?.top20,
      payload?.content?.top20
    ].find(Array.isArray);

    return direct?.length ? direct : findArray(payload, [
      /^top[-_ ]?20$/i,
      /weekly.*chart/i,
      /chart.*top[-_ ]?20/i
    ]);
  }

  function findRetro(payload) {
    const direct = [
      payload?.retroFavoriteTop10,
      payload?.retroFavorites,
      payload?.retroTop10,
      payload?.charts?.retroFavoriteTop10,
      payload?.charts?.retroFavorites,
      payload?.charts?.retroTop10,
      payload?.data?.retroFavoriteTop10,
      payload?.data?.retroFavorites,
      payload?.data?.retroTop10,
      payload?.broadcast?.retroFavoriteTop10,
      payload?.broadcast?.retroFavorites,
      payload?.broadcast?.retroTop10
    ].find(Array.isArray);

    return direct?.length ? direct : findArray(payload, [
      /retro.*favorite/i,
      /retro.*favourite/i,
      /retro.*top[-_ ]?10/i
    ]);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[char]);
  }

  function render(list, source, maximum) {
    if (!list) return 0;

    const tracks = source
      .map(normalize)
      .filter(Boolean)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, maximum);

    list.innerHTML = tracks.map(track => `
      <article class="djfChartRow">
        <strong class="djfChartRank">${String(track.rank).padStart(2, "0")}</strong>
        ${track.cover
          ? `<img class="djfChartCover" src="${escapeHtml(track.cover)}" alt="">`
          : `<span class="djfChartCover djfChartCoverFallback">♫</span>`}
        <div class="djfChartCopy">
          <b>${escapeHtml(track.artist)}</b>
          <span>${escapeHtml(track.title)}</span>
        </div>
        <i class="djfChartWave" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span>
        </i>
      </article>
    `).join("");

    return tracks.length;
  }

  async function getPayloads() {
    const routes = [
      "/api/broadcast",
      "/api/cms/public/state",
      "/api/content/public/state",
      "/api/content/state"
    ];

    const payloads = [];
    for (const route of routes) {
      try {
        const response = await fetch(API_BASE + route, { cache:"no-store" });
        if (response.ok) payloads.push(await response.json());
      } catch (_) {}
    }
    return payloads;
  }

  function connectButton(buttonId, list, total, fullLabel) {
    const original = document.getElementById(buttonId);
    if (!original || !list) return;

    original.hidden = total <= 3;
    const button = original.cloneNode(true);
    original.replaceWith(button);

    button.addEventListener("click", () => {
      const expanded = list.classList.toggle("is-expanded");
      button.setAttribute("aria-expanded", String(expanded));
      const label = button.querySelector("span");
      if (label) label.textContent = expanded ? "Show first 3" : fullLabel;
    });
  }

  function enforceOrder() {
    const main = document.querySelector(".premiereMain");
    const ticker = document.getElementById("websiteActivityTicker");
    if (!main || !ticker) return;

    const sequence = [
      "live",
      "next",
      "activityPulseEngine",
      "shows",
      "contentZoneShowsAfter"
    ];

    let anchor = ticker;
    for (const id of sequence) {
      const element = document.getElementById(id);
      if (!element) continue;
      if (anchor.nextElementSibling !== element) {
        anchor.insertAdjacentElement("afterend", element);
      }
      anchor = element;
    }
  }

  async function rebuildCharts() {
    const topList = document.getElementById("chartList");
    const retroList = document.getElementById("retroFavoriteList");
    const retroPanel = document.getElementById("retroFavoritePanel");
    if (!topList || !retroList || !retroPanel) return;

    const payloads = await getPayloads();
    let top = [];
    let retro = [];

    for (const payload of payloads) {
      const topCandidate = findTop20(payload);
      const retroCandidate = findRetro(payload);
      if (topCandidate.length > top.length) top = topCandidate;
      if (retroCandidate.length > retro.length) retro = retroCandidate;
    }

    /*
      The old page sometimes rendered only 10 rows even when 20 existed.
      Replace it whenever a longer public Top 20 is available.
    */
    if (top.length > topList.children.length) {
      render(topList, top, 20);
    }

    const topCount = topList.children.length;
    const topBadge = document.querySelector("#top20Panel .djfChartPanelHeader > b");
    if (topBadge) topBadge.textContent = String(topCount >= 20 ? 20 : topCount);
    connectButton("top20Expand", topList, topCount, "View full Top 20");

    if (retro.length) {
      const retroCount = render(retroList, retro, 10);
      retroPanel.hidden = false;
      const badge = document.querySelector("#retroFavoritePanel .djfChartPanelHeader > b");
      if (badge) badge.textContent = String(retroCount);
      connectButton("retroExpand", retroList, retroCount, "View full Top 10");
    } else if (retroList.children.length) {
      retroPanel.hidden = false;
      connectButton("retroExpand", retroList, retroList.children.length, "View full Top 10");
    }
  }

  function start() {
    enforceOrder();

    const main = document.querySelector(".premiereMain");
    if (main) {
      let timer = 0;
      new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(enforceOrder, 60);
      }).observe(main, { childList:true });
    }

    setTimeout(enforceOrder, 400);
    setTimeout(enforceOrder, 1600);
    setTimeout(rebuildCharts, 800);
    setTimeout(rebuildCharts, 2800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();


/* ===== SOURCE: assets/js/djf-homepage-v2000-3.js ===== */

(() => {
  "use strict";

  const ORDER = [
    "websiteActivityTicker",
    "live",
    "next",
    "activityPulseEngine",
    "shows",
    "contentZoneShowsAfter",
    "contentZoneFeatured",
    "musicNews",
    "contentZoneEditorial",
    "top20",
    "contentZoneChartsAfter",
    "viewerCommands",
    "contentZoneInteractive",
    "requests",
    "contentZoneArchive"
  ];

  function enforceCompleteOrder() {
    const main = document.querySelector(".premiereMain");
    if (!main) return;

    let anchor = null;

    for (const id of ORDER) {
      const element = document.getElementById(id);
      if (!element || element.parentElement !== main) continue;

      if (!anchor) {
        if (main.firstElementChild !== element) {
          main.insertBefore(element, main.firstElementChild);
        }
      } else if (anchor.nextElementSibling !== element) {
        anchor.insertAdjacentElement("afterend", element);
      }

      anchor = element;
    }

    /*
      Unknown future CMS zones are deliberately moved after all known zones.
      This prevents a new module from silently receiving order:0.
    */
    const known = new Set(ORDER);
    const unknownZones = [...main.children].filter(element =>
      element.classList.contains("contentModuleZone") &&
      element.id &&
      !known.has(element.id)
    );

    for (const zone of unknownZones) {
      main.appendChild(zone);
    }
  }

  function start() {
    enforceCompleteOrder();

    const main = document.querySelector(".premiereMain");
    if (!main) return;

    let timer = 0;
    new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(enforceCompleteOrder, 40);
    }).observe(main, {
      childList: true,
      subtree: false
    });

    setTimeout(enforceCompleteOrder, 300);
    setTimeout(enforceCompleteOrder, 1000);
    setTimeout(enforceCompleteOrder, 2500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();


/* ===== SOURCE: assets/js/djf-homepage-v2000-5.js ===== */

(() => {
  "use strict";

  function text(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function detectState(card, index) {
    const content = text(card.textContent);
    if (/on air|live now|currently live|live/.test(content)) return "live";
    if (/up next|next show|coming next/.test(content)) return "next";
    if (/weekly|every week|tuesday|friday|sunday|monday|wednesday|thursday|saturday/.test(content)) {
      return "weekly";
    }
    return index === 0 ? "next" : "weekly";
  }

  function buildRail() {
    const section = document.getElementById("shows");
    const cards = section?.querySelector(".premiereShowCards");
    if (!section || !cards || cards.dataset.djfRailReady === "true") return;

    cards.dataset.djfRailReady = "true";

    const shell = document.createElement("div");
    shell.className = "djfShowRailShell";
    cards.parentNode.insertBefore(shell, cards);
    shell.appendChild(cards);

    const controls = document.createElement("div");
    controls.className = "djfShowRailControls";
    controls.innerHTML = `
      <button type="button" data-direction="-1" aria-label="Previous shows">←</button>
      <button type="button" data-direction="1" aria-label="Next shows">→</button>
    `;
    shell.insertBefore(controls, cards);

    const showCards = [...cards.children];
    showCards.forEach((card, index) => {
      card.dataset.djfShowState = detectState(card, index);

      if (!card.querySelector(".djfShowShine")) {
        const shine = document.createElement("i");
        shine.className = "djfShowShine";
        shine.setAttribute("aria-hidden", "true");
        card.appendChild(shine);
      }
    });

    function cardStep() {
      const card = cards.querySelector(":scope > *");
      if (!card) return Math.max(260, cards.clientWidth * .8);
      const gap = parseFloat(getComputedStyle(cards).gap || "12");
      return card.getBoundingClientRect().width + gap;
    }

    controls.addEventListener("click", event => {
      const button = event.target.closest("button[data-direction]");
      if (!button) return;
      const direction = Number(button.dataset.direction);
      cards.scrollBy({ left: direction * cardStep(), behavior: "smooth" });
    });

    let paused = false;
    let activeIndex = 0;

    function setActive(index) {
      if (!showCards.length) return;
      activeIndex = (index + showCards.length) % showCards.length;
      showCards.forEach((card, cardIndex) => {
        card.classList.toggle("djfShowActive", cardIndex === activeIndex);
      });
    }

    setActive(0);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };

    cards.addEventListener("pointerenter", pause);
    cards.addEventListener("pointerleave", resume);
    cards.addEventListener("touchstart", pause, { passive:true });
    cards.addEventListener("touchend", () => setTimeout(resume, 1800), { passive:true });
    cards.addEventListener("focusin", pause);
    cards.addEventListener("focusout", resume);

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

    window.setInterval(() => {
      if (
        paused ||
        reduceMotion.matches ||
        document.hidden ||
        window.innerWidth > 1050 ||
        showCards.length < 2
      ) return;

      setActive(activeIndex + 1);
      cards.scrollTo({
        left: activeIndex * cardStep(),
        behavior: "smooth"
      });
    }, 7000);
  }

  function start() {
    buildRail();

    const section = document.getElementById("shows");
    if (!section) return;

    let timer = 0;
    new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(buildRail, 80);
    }).observe(section, { childList:true, subtree:true });

    setTimeout(buildRail, 600);
    setTimeout(buildRail, 1800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();


/* ===== SOURCE: assets/js/djf-community-v2200.js ===== */

(() => {
  "use strict";

  if (window.__DJF_COMMUNITY_V2200__) return;
  window.__DJF_COMMUNITY_V2200__ = true;

  const community =
    document.getElementById("community") ||
    document.querySelector(".premiereCommunity");

  if (!community) return;

  const clean = value => String(value ?? "").replace(/\s+/g, " ").trim();

  function pickText(selectors) {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      const value = clean(node?.textContent);
      if (value) return value;
    }
    return "";
  }

  function createRail() {
    if (community.querySelector(".djfCommunityRail")) return;

    const cards = [
      {
        icon: "♥",
        label: "Community",
        value: pickText([
          "#metricFollowers",
          "[data-community-followers]",
          ".premiereCommunityStats strong"
        ]),
        description: "People following the DJ FOLSOE channel."
      },
      {
        icon: "★",
        label: "Featured supporter",
        value: pickText([
          "#featuredSupporter",
          "[data-featured-supporter]",
          ".premiereCommunitySpotlight h3"
        ]),
        description: "Highlighted from the existing community content."
      },
      {
        icon: "↗",
        label: "Latest activity",
        value: pickText([
          "#activityTickerLead",
          "#topTicker",
          ".premiereCommunitySpotlight span"
        ]),
        description: "Latest visible channel or community update."
      },
      {
        icon: "●",
        label: "Channel status",
        value: pickText([
          "#navState",
          "#livePill"
        ]),
        description: "Current live status from the existing website state."
      }
    ].filter(card => card.value);

    if (!cards.length) return;

    const rail = document.createElement("div");
    rail.className = "djfCommunityRail";
    rail.setAttribute("aria-label", "Community highlights");
    rail.innerHTML = cards.map(card => `
      <article class="djfCommunityCard">
        <div class="djfCommunityCardIcon" aria-hidden="true">${card.icon}</div>
        <span>${card.label}</span>
        <strong>${escapeHtml(card.value)}</strong>
        <p>${card.description}</p>
      </article>
    `).join("");

    const grid =
      community.querySelector(".premiereCommunityGrid") ||
      community.lastElementChild;

    if (grid?.parentNode) grid.parentNode.insertBefore(rail, grid.nextSibling);
    else community.appendChild(rail);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#39;"
    })[char]);
  }

  function enhanceActivity() {
    const candidates = [
      ...community.querySelectorAll(
        "[data-community-activity], .communityActivity, .activityItem, .recentItem"
      )
    ];

    if (!candidates.length || community.querySelector(".djfCommunityActivityList")) return;

    const valid = candidates
      .map(node => ({
        title: clean(node.querySelector("b,strong,h3,h4")?.textContent || node.textContent),
        detail: clean(node.querySelector("p,span,small")?.textContent),
        time: clean(node.querySelector("time")?.textContent)
      }))
      .filter(item => item.title)
      .slice(0, 6);

    if (!valid.length) return;

    const list = document.createElement("div");
    list.className = "djfCommunityActivityList";
    list.setAttribute("aria-label", "Recent community activity");
    list.innerHTML = valid.map(item => `
      <article class="djfCommunityActivityItem">
        <i aria-hidden="true">✦</i>
        <div>
          <b>${escapeHtml(item.title)}</b>
          ${item.detail ? `<span>${escapeHtml(item.detail)}</span>` : ""}
        </div>
        ${item.time ? `<time>${escapeHtml(item.time)}</time>` : ""}
      </article>
    `).join("");

    community.appendChild(list);
  }

  function start() {
    createRail();
    enhanceActivity();

    let timer = 0;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        createRail();
        enhanceActivity();
      }, 120);
    });

    observer.observe(community, {
      childList: true,
      subtree: true
    });

    setTimeout(createRail, 700);
    setTimeout(enhanceActivity, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();


/* ===== SOURCE: assets/js/djf-music-v2300.js ===== */

(() => {
  "use strict";

  if (window.__DJF_MUSIC_V2300__) return;
  window.__DJF_MUSIC_V2300__ = true;

  const main = document.querySelector(".premiereMain");
  const charts = document.getElementById("top20");
  if (!main || !charts) return;

  const clean = value => String(value ?? "").replace(/\s+/g, " ").trim();

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#39;"
    })[char]);
  }

  function sectionLabel(section) {
    if (!section) return "";
    return clean(
      section.querySelector("h1,h2,h3")?.textContent ||
      section.getAttribute("aria-label") ||
      section.id
    );
  }

  function createMusicHub() {
    if (document.getElementById("djfMusicHub")) return;

    const targets = [
      { id:"shows", eyebrow:"Programme guide", fallback:"Featured Shows" },
      { id:"top20", eyebrow:"Current charts", fallback:"Top 20" },
      { id:"retroFavoritePanel", eyebrow:"Classic chart", fallback:"Retro Favorite Top 10" },
      { id:"requests", eyebrow:"Viewer interaction", fallback:"Request a Song" }
    ];

    const links = targets
      .map(target => {
        const node = document.getElementById(target.id);
        if (!node || node.hidden) return null;
        return {
          id:target.id,
          eyebrow:target.eyebrow,
          title:sectionLabel(node) || target.fallback
        };
      })
      .filter(Boolean);

    if (!links.length) return;

    const hub = document.createElement("section");
    hub.id = "djfMusicHub";
    hub.className = "djfMusicHub";
    hub.setAttribute("aria-label", "Music experience navigation");
    hub.innerHTML = `
      <header class="djfMusicHubHeader">
        <div>
          <span>DJ FOLSOE music centre</span>
          <h2>Music Experience</h2>
        </div>
        <p>Jump directly to shows, current charts, retro favorites and viewer music requests.</p>
      </header>
      <nav class="djfMusicHubRail">
        ${links.map(link => `
          <a class="djfMusicHubLink" href="#${escapeHtml(link.id)}">
            <span>${escapeHtml(link.eyebrow)}</span>
            <strong>${escapeHtml(link.title)}</strong>
            <small>Open section</small>
          </a>
        `).join("")}
      </nav>
    `;

    charts.insertAdjacentElement("beforebegin", hub);
  }

  function addMovementFromExistingData(row) {
    if (!row || row.querySelector(".djfChartMovement")) return;

    const raw = clean(
      row.dataset.movement ||
      row.dataset.change ||
      row.dataset.trend ||
      ""
    ).toLowerCase();

    if (!raw) return;

    let type = "";
    let label = "";

    if (/new|ny/.test(raw)) {
      type = "new";
      label = "NEW";
    } else if (/up|rise|\+|op/.test(raw)) {
      type = "up";
      label = "▲ UP";
    } else if (/down|fall|-|ned/.test(raw)) {
      type = "down";
      label = "▼ DOWN";
    } else if (/same|steady|unchanged|=/.test(raw)) {
      type = "same";
      label = "— SAME";
    }

    if (!type) return;

    let meta = row.querySelector(".djfChartMeta");
    if (!meta) {
      meta = document.createElement("div");
      meta.className = "djfChartMeta";
      const wave = row.querySelector(".djfChartWave");
      if (wave) row.insertBefore(meta, wave);
      else row.appendChild(meta);
    }

    const badge = document.createElement("span");
    badge.className = "djfChartMovement";
    badge.dataset.movement = type;
    badge.textContent = label;
    meta.appendChild(badge);
  }

  function addYearFromExistingData(row) {
    if (!row || row.querySelector(".djfChartYear")) return;

    const values = [
      row.dataset.year,
      row.dataset.releaseYear,
      clean(row.textContent)
    ].filter(Boolean).join(" ");

    const match = values.match(/\b(19|20)\d{2}\b/);
    if (!match) return;

    let meta = row.querySelector(".djfChartMeta");
    if (!meta) {
      meta = document.createElement("div");
      meta.className = "djfChartMeta";
      const wave = row.querySelector(".djfChartWave");
      if (wave) row.insertBefore(meta, wave);
      else row.appendChild(meta);
    }

    const year = document.createElement("span");
    year.className = "djfChartYear";
    year.textContent = match[0];
    meta.appendChild(year);
  }

  function enhanceRows() {
    const topRows = [...document.querySelectorAll("#top20Panel .djfChartRow")];
    const retroRows = [...document.querySelectorAll("#retroFavoritePanel .djfChartRow")];

    topRows.forEach(addMovementFromExistingData);
    retroRows.forEach(row => {
      addMovementFromExistingData(row);
      addYearFromExistingData(row);
    });
  }

  function start() {
    createMusicHub();
    enhanceRows();

    setTimeout(createMusicHub, 700);
    setTimeout(enhanceRows, 900);
    setTimeout(enhanceRows, 2400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
