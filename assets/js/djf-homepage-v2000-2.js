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
