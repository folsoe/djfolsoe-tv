
(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const root = document.documentElement;

  let model = {
    isLive: false,
    currentTitle: "DJ FOLSOE MUSIC TV",
    currentBody: "Live music television from Denmark.",
    nextTitle: "Next DJ FOLSOE Broadcast",
    nextBody: "Follow the channel and never miss the next live show.",
    nextTime: "Announced soon",
    schedule: []
  };

  function safe(value) {
    return value && typeof value === "object" ? value : {};
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalize(payload) {
    const data = safe(payload?.core || payload?.data || payload?.broadcastCore || payload);
    const twitch = safe(data.twitch || data.live);
    const current = safe(data.show || data.currentShow);
    const next = safe(data.nextShow || data.schedule?.next);
    const isLive = Boolean(twitch.isLive ?? twitch.live ?? data.isLive);

    const nextTitle = next.title || next.name || "Next DJ FOLSOE Broadcast";
    const nextBody = next.description || next.text || "Follow the channel and never miss the next live show.";
    const nextTime = next.displayTime || next.dateText || next.start || "Announced soon";

    const currentTitle = isLive
      ? (twitch.title || current.title || data.showTitle || "DJ FOLSOE LIVE")
      : nextTitle;

    const currentBody = isLive
      ? (twitch.description || current.description || data.streamTitle || "Live music television from Denmark.")
      : nextBody;

    const rawSchedule = arr(data.schedule?.items || data.schedule || data.shows || data.featuredShows);
    const schedule = rawSchedule.slice(0, 3).map((item) => ({
      time: item.time || item.displayTime || "TBA",
      title: item.title || item.name || "DJ FOLSOE LIVE",
      body: item.description || item.text || "Live music television"
    }));

    return {
      isLive,
      currentTitle,
      currentBody,
      nextTitle,
      nextBody,
      nextTime,
      schedule
    };
  }

  function renderSchedule() {
    const container = $("v19220DiscoverySchedule");
    if (!container) return;

    const fallback = [
      { time: "08:00", title: "Good Morning Twitch", body: "Morning show" },
      { time: "19:00", title: "Trance Tuesday", body: "Trance & Classics" },
      { time: "21:00", title: "Community Hour", body: "Requests & Chat" }
    ];

    const schedule = model.schedule.length ? model.schedule : fallback;

    container.innerHTML = schedule.map((show) => {
      const isNext = show.title.trim().toLowerCase() === model.nextTitle.trim().toLowerCase();
      return `
        <article class="${isNext ? "is-next" : ""}">
          <b>${show.time}</b>
          <strong>${show.title}</strong>
          <small>${show.body}</small>
        </article>
      `;
    }).join("");
  }

  function render() {
    const title = $("v19220DiscoveryTitle");
    const body = $("v19220DiscoveryBody");

    if (title) {
      title.textContent = model.isLive
        ? `LIVE NOW · ${model.currentTitle}`
        : `UP NEXT · ${model.nextTitle}`;
    }

    if (body) {
      body.textContent = model.isLive
        ? model.currentBody
        : `${model.nextTime} · ${model.nextBody}`;
    }

    renderSchedule();
  }

  window.addEventListener("djf:broadcast-core", (event) => {
    model = normalize(event.detail || {});
    render();
  }, { passive: true });

  // Initial fallback from the already-rendered V19000/V19200 page.
  model = {
    ...model,
    isLive: root.dataset.channelState === "live",
    currentTitle: $("v19000TopShowTitle")?.textContent?.trim() || model.currentTitle,
    currentBody: $("v19000TopShowDescription")?.textContent?.trim() || model.currentBody,
    nextTitle: $("v19000HeroNextTitle")?.textContent?.trim() || model.nextTitle,
    nextTime: $("v19000HeroNextTime")?.textContent?.trim() || model.nextTime
  };
  render();

  window.DJF_WEBSITE_V19220 = Object.freeze({
    status: () => ({ build: "V19220", ...model }),
    refresh: render
  });
})();
