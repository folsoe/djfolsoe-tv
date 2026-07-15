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
