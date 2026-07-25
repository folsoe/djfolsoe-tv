(() => {
  "use strict";

  const API = "https://djfolsoe-tv-api.sunefolsoe.workers.dev";
  const $ = (id) => document.getElementById(id);
  const text = (id, value) => {
    const el = $(id);
    if (el && value !== undefined && value !== null && String(value).trim()) {
      el.textContent = String(value);
    }
  };
  const number = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? new Intl.NumberFormat("en").format(n) : "0";
  };

  async function fetchJson(path) {
    const response = await fetch(API + path, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(path + " returned " + response.status);
    return response.json();
  }

  function unwrap(payload) {
    if (!payload || typeof payload !== "object") return {};
    return payload.core || payload.data || payload.broadcastCore || payload;
  }

  function applyBroadcast(payload) {
    const data = unwrap(payload);
    const twitch = data.twitch || data.live || payload.twitch || {};
    const theme = data.theme || {};
    const show = data.show || data.currentShow || {};
    const next = data.nextShow || data.schedule?.next || {};

    const isLive = Boolean(
      twitch.isLive ?? twitch.live ?? data.isLive ?? payload.isLive
    );

    text("liveState", isLive ? "LIVE NOW ON TWITCH" : "TWITCH CHANNEL");
    $("liveDot")?.classList.toggle("is-live", isLive);

    text("viewerCount", number(twitch.viewers ?? data.viewers ?? 0));
    text("followerCount", number(twitch.followers ?? data.followers ?? "—"));
    text("activeTheme", theme.title || theme.id || data.activeTheme || "MUSIC TV");

    text("showTitle", show.title || data.showTitle || (isLive ? "DJ FOLSOE LIVE" : "LIVE FROM DENMARK"));
    text("streamTitle", twitch.title || data.streamTitle || show.description);
    text("heroDescription", data.hero?.description || data.homepage?.hero?.description || twitch.description);

    text("nextShow", next.title || next.name);
    text("nextShowTime", next.displayTime || next.dateText || next.start || next.description);
  }

  async function load() {
    const endpoints = ["/api/broadcast", "/api/homepage", "/api/twitch"];
    for (const endpoint of endpoints) {
      try {
        const payload = await fetchJson(endpoint);
        applyBroadcast(payload);
        return;
      } catch (error) {
        console.warn("DJ FOLSOE restore:", error.message);
      }
    }
  }

  load();
  setInterval(load, 60000);
})();
