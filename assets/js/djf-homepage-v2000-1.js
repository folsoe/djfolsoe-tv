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
