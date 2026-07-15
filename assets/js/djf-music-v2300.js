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
