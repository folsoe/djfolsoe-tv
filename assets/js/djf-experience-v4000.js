(() => {
  "use strict";

  if (window.__DJF_V4000_EUROPEAN_MUSIC_TV__) return;
  window.__DJF_V4000_EUROPEAN_MUSIC_TV__ = true;

  const main = document.querySelector(".premiereMain");
  const ticker = document.getElementById("websiteActivityTicker");
  const shows = document.getElementById("shows");

  if (!main || !ticker) return;

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

  function visibleText(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      const value = clean(element?.textContent);
      if (value) return value;
    }
    return "";
  }

  function buildChannelBar() {
    if (document.getElementById("djfV4000ChannelBar")) return;

    const status = visibleText(["#navState", "#livePill"]) || "Music TV";
    const signal =
      visibleText(["#activityTickerTrack", "#currentShow", "#heroSubtitle"]) ||
      "Live music, charts, shows and community from Denmark.";

    const bar = document.createElement("section");
    bar.id = "djfV4000ChannelBar";
    bar.className = "djfV4000ChannelBar";
    bar.setAttribute("aria-label", "DJ FOLSOE European Music TV channel status");
    bar.innerHTML = `
      <div class="djfV4000ChannelIdentity">
        <div class="djfV4000ChannelBug" aria-hidden="true">DJF</div>
        <div class="djfV4000ChannelCopy">
          <span>European Music TV</span>
          <strong>DJ FOLSOE NETWORK</strong>
        </div>
      </div>
      <div class="djfV4000ChannelSignal">
        <p>${escapeHtml(signal)}</p>
      </div>
      <div class="djfV4000ChannelMeta" aria-label="Channel metadata">
        <span>${escapeHtml(status)}</span>
        <span>Denmark</span>
        <span>HD</span>
        <span>Stereo</span>
      </div>
    `;

    ticker.insertAdjacentElement("afterend", bar);
  }

  function collectShowCards() {
    if (!shows) return [];

    const cardContainer = shows.querySelector(".premiereShowCards");
    if (!cardContainer) return [];

    return [...cardContainer.children]
      .map((card, index) => {
        const title = clean(card.querySelector("h2,h3,h4,strong")?.textContent);
        const description = clean(card.querySelector("p")?.textContent);
        const state = clean(
          card.querySelector("[data-djf-show-state]")?.dataset.djfShowState ||
          card.dataset.djfShowState ||
          card.querySelector("span,small")?.textContent
        );

        if (!title) return null;

        return {
          title,
          description: description || "Open the programme section for details.",
          state: state || (index === 0 ? "Featured" : "Weekly"),
          href: "#shows"
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  }

  function fallbackGuideItems() {
    const items = [
      ["live", "On Air", "Current live channel and broadcast status."],
      ["next", "Up Next", "The next scheduled DJ FOLSOE programme."],
      ["top20", "Charts", "FOLSOE Top 20 and Retro Favorite Top 10."],
      ["community", "Community", "Viewers, mods, supporters and activity."]
    ];

    return items
      .filter(([id]) => document.getElementById(id))
      .map(([id, title, description]) => ({
        title,
        description,
        state:"Music TV",
        href:`#${id}`
      }));
  }

  function buildEuropeanGuide() {
    if (document.getElementById("djfV4000Guide")) return;

    const items = collectShowCards();
    const guideItems = items.length ? items : fallbackGuideItems();
    if (!guideItems.length) return;

    const guide = document.createElement("section");
    guide.id = "djfV4000Guide";
    guide.className = "djfV4000Guide";
    guide.setAttribute("aria-labelledby", "djfV4000GuideTitle");
    guide.innerHTML = `
      <header class="djfV4000GuideHeader">
        <div>
          <span>European Music TV</span>
          <h2 id="djfV4000GuideTitle">Programme Guide</h2>
        </div>
        <p>Explore the programmes, charts and community already available across DJ FOLSOE NETWORK.</p>
      </header>
      <div class="djfV4000GuideRail">
        ${guideItems.map(item => `
          <a class="djfV4000GuideCard" href="${escapeHtml(item.href)}">
            <span>${escapeHtml(item.state)}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.description)}</p>
            <b>Open programme</b>
          </a>
        `).join("")}
      </div>
    `;

    const channelBar = document.getElementById("djfV4000ChannelBar");
    if (channelBar) channelBar.insertAdjacentElement("afterend", guide);
    else ticker.insertAdjacentElement("afterend", guide);
  }

  function start() {
    buildChannelBar();
    buildEuropeanGuide();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
