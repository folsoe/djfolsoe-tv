
(() => {
  "use strict";

  const root = document.documentElement;
  const experience = document.querySelector(".v19000-tv-experience");
  if (!experience) return;

  const $ = id => document.getElementById(id);
  const FOLLOWER_FLOOR = 874;
  const STARTING_SOON_MINUTES = 15;

  let model = {
    source: "local-cache",
    state: "offline",
    isLive: false,
    followers: FOLLOWER_FLOOR,
    viewers: 0,
    theme: root.dataset.djfTheme || "morning",
    currentTitle: "DJ FOLSOE MUSIC TV",
    nextTitle: "Next DJ FOLSOE Broadcast",
    nextTimeText: "Announced soon",
    nextDate: null,
    requests: "OPEN",
    updatedAt: Date.now()
  };

  let lastState = "";
  let minuteTimer = 0;

  function safe(value) {
    return value && typeof value === "object" ? value : {};
  }

  function count(...values) {
    for (const value of values) {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) return Math.floor(n);
    }
    return 0;
  }

  function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function minutesUntil(date) {
    if (!date) return null;
    return Math.floor((date.getTime() - Date.now()) / 60000);
  }

  function deriveState(isLive, nextDate) {
    if (isLive) return "live";
    const minutes = minutesUntil(nextDate);
    if (minutes !== null && minutes >= 0 && minutes <= STARTING_SOON_MINUTES) {
      return "starting";
    }
    return "offline";
  }

  function modelFromPayload(payload) {
    const data = safe(payload?.core || payload?.data || payload?.broadcastCore || payload);
    const twitch = safe(data.twitch || data.live);
    const next = safe(data.nextShow || data.schedule?.next);
    const current = safe(data.show || data.currentShow);

    const isLive = Boolean(twitch.isLive ?? twitch.live ?? data.isLive);
    const nextDate = parseDate(next.start || next.startAt || next.date || next.datetime);
    const followers = Math.max(
      FOLLOWER_FLOOR,
      count(twitch.followers, twitch.followerCount, data.followers, data.community?.followers)
    );
    const viewers = count(twitch.viewers, data.viewers);
    const nextTitle = next.title || next.name || "Next DJ FOLSOE Broadcast";
    const nextTimeText =
      next.displayTime || next.dateText || next.start || "Announced soon";
    const currentTitle = isLive
      ? (twitch.title || current.title || data.showTitle || "DJ FOLSOE LIVE")
      : nextTitle;

    return {
      source: "broadcast-core",
      state: deriveState(isLive, nextDate),
      isLive,
      followers,
      viewers,
      theme: root.dataset.djfTheme || "morning",
      currentTitle,
      nextTitle,
      nextTimeText,
      nextDate,
      requests: data.requestsOpen === false ? "CLOSED" : "OPEN",
      updatedAt: Date.now()
    };
  }

  function applyState(nextModel, force = false) {
    const stateChanged = nextModel.state !== model.state;
    model = { ...model, ...nextModel };

    root.dataset.channelState = model.state;

    const networkItem = $("v19200NetworkState")?.closest(".v19200-control-item");
    const transitionItem = $("v19200NextTransition")?.closest(".v19200-control-item");
    const syncItem = $("v19200DataSync")?.closest(".v19200-control-item");

    if (networkItem) networkItem.dataset.state = model.state;
    if (transitionItem) transitionItem.dataset.state = model.state;
    if (syncItem) syncItem.dataset.state = "synced";

    $("v19200NetworkState").textContent =
      model.state === "live" ? "LIVE ON AIR" :
      model.state === "starting" ? "STARTING SOON" :
      "OFFLINE · NEXT SHOW READY";

    $("v19200NextTransition").textContent =
      model.state === "live"
        ? `LIVE · ${model.currentTitle}`
        : `${model.nextTitle} · ${model.nextTimeText}`;

    $("v19200DataSync").textContent =
      model.source === "broadcast-core" ? "BROADCAST CORE SYNCED" : "LOCAL CACHE";

    $("v19200ChannelMessage").textContent =
      model.state === "live"
        ? `${model.currentTitle} · ${model.viewers.toLocaleString("en-GB")} VIEWERS`
        : `${model.nextTitle} · ${model.followers.toLocaleString("en-GB")} FOLLOWERS`;

    synchronizeVisibleFields();
    markSchedule();

    if (stateChanged || force) {
      experience.classList.remove("v19200-state-take");
      void experience.offsetWidth;
      experience.classList.add("v19200-state-take");
      setTimeout(() => experience.classList.remove("v19200-state-take"), 760);
    }
  }

  function synchronizeVisibleFields() {
    const textMap = {
      v19000TopFollowers: model.followers.toLocaleString("en-GB"),
      v19000Followers: model.followers.toLocaleString("en-GB"),
      v19000CenterFollowers: `${model.followers.toLocaleString("en-GB")} FOLLOWERS`,
      v19000TopViewers: model.viewers.toLocaleString("en-GB"),
      v19000Viewers: model.viewers.toLocaleString("en-GB"),
      v19000StatusShow: model.currentTitle,
      v19000TopShowTitle: model.currentTitle,
      v19000Theme: model.theme.replace(/(^|\s)\S/g, m => m.toUpperCase()),
      v19000Requests: model.requests
    };

    Object.entries(textMap).forEach(([id, value]) => {
      const node = $(id);
      if (node) node.textContent = value;
    });

    const topStatus = document.querySelector(".v19000-top-status");
    topStatus?.classList.toggle("is-live", model.state === "live");

    const onlineState = $("v19000OnlineState");
    if (onlineState) {
      onlineState.textContent =
        model.state === "live" ? "LIVE NOW" :
        model.state === "starting" ? "STARTING SOON" :
        "OFFLINE";
    }
  }

  function markSchedule() {
    const cards = [...document.querySelectorAll(".v19000-schedule-card")];
    cards.forEach(card => {
      const title = card.querySelector("strong")?.textContent?.trim().toLowerCase() || "";
      card.dataset.osNext = String(
        model.state !== "live" && title === model.nextTitle.trim().toLowerCase()
      );
      card.dataset.osCurrent = String(
        model.state === "live" && title === model.currentTitle.trim().toLowerCase()
      );
    });
  }

  function pulseData() {
    experience.classList.remove("v19200-data-pulse");
    void experience.offsetWidth;
    experience.classList.add("v19200-data-pulse");
    setTimeout(() => experience.classList.remove("v19200-data-pulse"), 950);
  }

  function refreshMinuteState() {
    const nextState = deriveState(model.isLive, model.nextDate);
    if (nextState !== model.state) {
      applyState({ state: nextState }, true);
    } else {
      applyState({}, false);
    }
  }

  window.addEventListener("djf:broadcast-core", event => {
    const nextModel = modelFromPayload(event.detail || {});
    applyState(nextModel, nextModel.state !== lastState);
    lastState = nextModel.state;
    pulseData();
  }, { passive: true });

  const themeObserver = new MutationObserver(() => {
    model.theme = root.dataset.djfTheme || "morning";
    applyState({}, false);
  });

  themeObserver.observe(root, {
    attributes: true,
    attributeFilter: ["data-djf-theme"]
  });

  // Initial fallback uses existing V19000 values already on the page.
  applyState({
    followers: Math.max(
      FOLLOWER_FLOOR,
      count($("v19000Followers")?.textContent, $("v19000TopFollowers")?.textContent)
    ),
    viewers: count($("v19000Viewers")?.textContent, $("v19000TopViewers")?.textContent),
    currentTitle:
      $("v19000TopShowTitle")?.textContent?.trim() || model.currentTitle,
    nextTitle:
      $("v19000HeroNextTitle")?.textContent?.trim() || model.nextTitle,
    nextTimeText:
      $("v19000HeroNextTime")?.textContent?.trim() || model.nextTimeText
  }, true);

  minuteTimer = setInterval(refreshMinuteState, 30000);

  window.addEventListener("beforeunload", () => {
    clearInterval(minuteTimer);
    themeObserver.disconnect();
  }, { once: true });

  window.DJF_WEBSITE_V19200 = Object.freeze({
    status: () => ({ build: "V19200", ...model }),
    refresh: refreshMinuteState,
    pulse: pulseData
  });
})();
