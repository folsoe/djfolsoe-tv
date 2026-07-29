
(() => {
  "use strict";

  const API = "https://djfolsoe-tv-api.sunefolsoe.workers.dev";
  const CACHE_KEY = "djf-website-v18910-cache";
  const FOLLOWER_FLOOR = 874;
  const $ = id => document.getElementById(id);
  const safe = value => value && typeof value === "object" ? value : {};
  const arr = value => Array.isArray(value) ? value : [];
  const count = (...values) => {
    for (const value of values) {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) return Math.floor(n);
    }
    return 0;
  };
  const text = (id, value) => {
    const el = $(id);
    if (el && value !== undefined && value !== null && String(value).trim()) {
      el.textContent = String(value);
    }
  };
  const formatted = value => new Intl.NumberFormat("en-GB").format(Number(value) || 0);
  const unwrap = payload => safe(payload?.core || payload?.data || payload?.broadcastCore || payload);

  function fetchJson(path, timeout = 4200) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    return fetch(API + path, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal
    }).then(response => {
      if (!response.ok) throw new Error(`${path} ${response.status}`);
      return response.json();
    }).finally(() => clearTimeout(timer));
  }

  function mergePayloads(results) {
    const merged = {};
    results.forEach(result => {
      if (result.status !== "fulfilled") return;
      Object.assign(merged, unwrap(result.value));
    });
    return merged;
  }

  function normalizeTheme(value) {
    const raw = String(value || "morning").toLowerCase().trim();
    const aliases = {
      "good morning twitch":"morning","good morning":"morning",
      "trance tuesday":"trance","friday bar":"fredagsbar",
      "retro hits":"retro","pop up live":"popup",
      "danish hits":"danske","folsoe top 20":"top20"
    };
    return aliases[raw] || raw.replace(/\s+/g,"");
  }

  function themeIcon(theme) {
    return {
      morning:"☀",trance:"◇",eurodance:"✦",retro:"◉",
      fredagsbar:"◆",summer:"☼",weekend:"★",popup:"●",
      danske:"DK",top20:"20"
    }[theme] || "DJ";
  }

  function renderShows(shows) {
    const grid = $("featuredShowsGrid");
    if (!grid || !shows.length) return;
    const classes = ["morning","trance","eurodance","friday","retro","popup"];
    grid.innerHTML = shows.slice(0,6).map((show,index) => `
      <article class="show-card ${classes[index % classes.length]}">
        <small>${String(show.time || show.day || show.label || "SHOW")}</small>
        <h3>${String(show.title || show.name || "DJ FOLSOE LIVE")}</h3>
        <p>${String(show.description || show.text || "Live music television from Denmark.")}</p>
      </article>
    `).join("");
  }

  function render(data) {
    const twitch = safe(data.twitch || data.live);
    const show = safe(data.show || data.currentShow);
    const next = safe(data.nextShow || data.schedule?.next);
    const themeData = safe(data.theme);
    const theme = normalizeTheme(themeData.id || themeData.title || data.activeTheme || "morning");
    const isLive = Boolean(twitch.isLive ?? twitch.live ?? data.isLive);
    const viewers = count(twitch.viewers, data.viewers);
    const followers = Math.max(FOLLOWER_FLOOR, count(
      twitch.followers,twitch.followerCount,data.followers,data.community?.followers
    ));
    const showTitle = show.title || data.showTitle || (isLive ? "DJ FOLSOE LIVE" : "LIVE FROM DENMARK");
    const streamTitle = twitch.title || data.streamTitle || show.description || "Music, requests and good company";
    const nextTitle = next.title || next.name || "Next DJ FOLSOE Broadcast";
    const nextTime = next.displayTime || next.dateText || next.start || next.description || "Announced soon";

    document.documentElement.dataset.djfTheme = theme;
    text("liveState", isLive ? "LIVE NOW" : "TWITCH CHANNEL");
    $("liveDot")?.classList.toggle("is-live", isLive);
    $("liveStatePill")?.classList.toggle("is-live", isLive);
    text("viewerCount", formatted(viewers));
    text("bottomViewerCount", formatted(viewers));
    text("followerCount", formatted(followers));
    text("homepageFollowerGoalText", formatted(followers));
    text("activeTheme", themeData.title || theme.toUpperCase());
    text("bottomThemeName", themeData.title || theme.toUpperCase());
    text("showTitle", showTitle);
    text("streamTitle", streamTitle);
    text("screenShowTitle", showTitle);
    text("screenShowBody", streamTitle);
    text("heroDescription", data.hero?.description || data.homepage?.hero?.description || twitch.description);
    text("nextShow", nextTitle);
    text("nextShowTime", nextTime);
    text("channelCurrentTitle", showTitle);
    text("channelCurrentBody", streamTitle);
    text("channelNextTitle", nextTitle);
    text("channelNextBody", next.description || "The schedule updates automatically.");
    text("channelNextTime", nextTime);
    text("channelFollowerValue", `${formatted(followers)} FOLLOWERS`);
    text("channelStatusBadge", isLive ? "LIVE CHANNEL" : "CHANNEL CONNECTED");
    text("showThemeIcon", themeIcon(theme));

    const profile = $("websiteProfileImage");
    const image = twitch.profileImage || twitch.profileImageUrl || twitch.profile_image_url || data.profileImage;
    if (profile && image) {
      profile.style.backgroundImage = `url("${String(image).replace(/"/g,"%22")}")`;
      profile.classList.add("has-image");
    }

    renderShows(arr(data.featuredShows || data.homepage?.featuredShows));
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at:Date.now(), data })); } catch {}
    window.dispatchEvent(new CustomEvent("djf:broadcast-core",{ detail:data }));
  }

  function renderCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      if (cached.data) render(cached.data);
    } catch {}
  }

  async function load() {
    const results = await Promise.allSettled([
      fetchJson("/api/broadcast"),
      fetchJson("/api/twitch"),
      fetchJson("/api/homepage")
    ]);
    const data = mergePayloads(results);
    if (Object.keys(data).length) render(data);
  }

  renderCache();
  load();
  let timer = setInterval(() => { if (!document.hidden) load(); }, 30000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) load();
  }, { passive:true });
  window.addEventListener("beforeunload", () => clearInterval(timer), { once:true });
})();
