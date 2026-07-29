
(() => {
  "use strict";

  const root = document.documentElement;
  const experience = document.querySelector(".v19000-tv-experience");
  const $ = id => document.getElementById(id);

  if (!experience) return;

  const STARTING_SOON_SECONDS = 15 * 60;
  const STARTING_WINDOW_SECONDS = 90;
  const CACHE_KEY = "djf-v19300-next-show";

  let nextShow = null;
  let isLive = false;
  let timer = 0;
  let lastState = "";

  function safe(value) {
    return value && typeof value === "object" ? value : {};
  }

  function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function titleCaseTheme(value) {
    return String(value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, m => m.toUpperCase());
  }

  function showDateLabel(date) {
    if (!date) return "Schedule time not available";
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const sameDay = date.toDateString() === now.toDateString();
    const nextDay = date.toDateString() === tomorrow.toDateString();
    const time = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);

    if (sameDay) return `Today ${time}`;
    if (nextDay) return `Tomorrow ${time}`;

    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function chooseNextShow(data) {
    const direct = safe(data.nextShow || data.schedule?.next);
    const directDate = parseDate(
      direct.start || direct.startAt || direct.datetime || direct.date
    );

    if (directDate && directDate.getTime() > Date.now() - STARTING_WINDOW_SECONDS * 1000) {
      return {
        title: direct.title || direct.name || "Next DJ FOLSOE Broadcast",
        description: direct.description || direct.text || "Live music television from Denmark.",
        date: directDate,
        theme: direct.theme || direct.id || direct.title || "morning"
      };
    }

    const candidates = Array.isArray(data.schedule?.items)
      ? data.schedule.items
      : Array.isArray(data.schedule)
        ? data.schedule
        : Array.isArray(data.shows)
          ? data.shows
          : Array.isArray(data.featuredShows)
            ? data.featuredShows
            : [];

    const future = candidates
      .map(item => ({
        item,
        date: parseDate(item.start || item.startAt || item.datetime || item.date)
      }))
      .filter(entry => entry.date && entry.date.getTime() > Date.now() - STARTING_WINDOW_SECONDS * 1000)
      .sort((a, b) => a.date - b.date)[0];

    if (!future) return null;

    return {
      title: future.item.title || future.item.name || "Next DJ FOLSOE Broadcast",
      description: future.item.description || future.item.text || "Live music television from Denmark.",
      date: future.date,
      theme: future.item.theme || future.item.id || future.item.title || "morning"
    };
  }

  function deriveFromPayload(payload) {
    const data = safe(payload?.core || payload?.data || payload?.broadcastCore || payload);
    const twitch = safe(data.twitch || data.live);
    isLive = Boolean(twitch.isLive ?? twitch.live ?? data.isLive);

    const candidate = chooseNextShow(data);
    if (candidate) {
      nextShow = candidate;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          title: candidate.title,
          description: candidate.description,
          date: candidate.date.toISOString(),
          theme: candidate.theme
        }));
      } catch {}
    }

    render(true);
  }

  function loadCachedShow() {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      const date = parseDate(cached.date);
      if (date && date.getTime() > Date.now() - STARTING_WINDOW_SECONDS * 1000) {
        nextShow = {
          title: cached.title || "Next DJ FOLSOE Broadcast",
          description: cached.description || "Live music television from Denmark.",
          date,
          theme: cached.theme || "morning"
        };
      }
    } catch {}
  }

  function stateFor(remainingSeconds) {
    if (isLive) return "live";
    if (remainingSeconds <= 0 && remainingSeconds >= -STARTING_WINDOW_SECONDS) return "starting";
    if (remainingSeconds > 0 && remainingSeconds <= STARTING_SOON_SECONDS) return "starting-soon";
    return "offline";
  }

  function updateText(id, value) {
    const node = $(id);
    if (node) node.textContent = value;
  }

  function triggerTake(state) {
    if (state === lastState) return;
    lastState = state;
    experience.classList.remove("v19300-countdown-take");
    void experience.offsetWidth;
    experience.classList.add("v19300-countdown-take");
    setTimeout(() => experience.classList.remove("v19300-countdown-take"), 560);
  }

  function render(force = false) {
    let state = "offline";
    let h = 0;
    let m = 0;
    let s = 0;
    let remainingSeconds = 0;

    if (isLive) {
      state = "live";
    } else if (nextShow?.date) {
      remainingSeconds = Math.floor((nextShow.date.getTime() - Date.now()) / 1000);
      state = stateFor(remainingSeconds);

      const positive = Math.max(0, remainingSeconds);
      h = Math.floor(positive / 3600);
      m = Math.floor((positive % 3600) / 60);
      s = positive % 60;
    }

    root.dataset.countdownState = state;
    triggerTake(state);

    if (state === "live") {
      updateText("v19000OnlineState", "LIVE NOW");
      updateText("v19000CountdownHours", "00");
      updateText("v19000CountdownMinutes", "00");
      updateText("v19000CountdownSeconds", "00");
      const startsIn = document.querySelector(".v19000-countdown>span");
      if (startsIn) startsIn.textContent = "LIVE NOW";
      updateText("v19300NextDateLabel", "The channel is live on Twitch");
      return;
    }

    if (nextShow) {
      updateText("v19000StatusShow", nextShow.title);
      updateText("v19000TopShowTitle", nextShow.title);
      updateText("v19000TopShowDescription", nextShow.description);
      updateText("v19000HeroNextTitle", nextShow.title);
      updateText("v19000HeroNextTime", showDateLabel(nextShow.date));
      updateText("v19300NextDateLabel", showDateLabel(nextShow.date));

      const theme = String(nextShow.theme || "morning").toLowerCase().replace(/\s+/g, "");
      if (theme) root.dataset.djfTheme = theme;
    }

    const startsIn = document.querySelector(".v19000-countdown>span");
    if (startsIn) {
      startsIn.textContent = state === "starting" ? "STARTING…" : "Starts in";
    }

    updateText("v19000OnlineState",
      state === "starting" ? "STARTING" :
      state === "starting-soon" ? "STARTING SOON" :
      "OFFLINE"
    );

    updateText("v19000CountdownHours", String(h).padStart(2, "0"));
    updateText("v19000CountdownMinutes", String(m).padStart(2, "0"));
    updateText("v19000CountdownSeconds", String(s).padStart(2, "0"));

    if (state === "starting") {
      updateText("v19000CenterCountdown", "STARTING…");
    } else {
      updateText("v19000CenterCountdown", `Starts in ${h}h ${m}m ${s}s`);
    }

    if (force && !nextShow) {
      updateText("v19300NextDateLabel", "Waiting for the next scheduled show");
    }
  }

  window.addEventListener("djf:broadcast-core", event => {
    deriveFromPayload(event.detail || {});
  }, { passive: true });

  loadCachedShow();
  render(true);

  timer = setInterval(() => render(false), 1000);

  window.addEventListener("beforeunload", () => {
    clearInterval(timer);
  }, { once: true });

  window.DJF_WEBSITE_V19300 = Object.freeze({
    status: () => ({
      build: "V19300",
      isLive,
      nextShow,
      countdownState: root.dataset.countdownState || "offline"
    }),
    refresh: () => render(true)
  });
})();
