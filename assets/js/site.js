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

  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const percent = (value, goal) => goal > 0 ? clamp((Number(value) / Number(goal)) * 100, 0, 100) : 0;
  const safeArray = (value) => Array.isArray(value) ? value : [];
  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  function setWidth(id, value) {
    const el = $(id);
    if (el) el.style.width = `${clamp(value, 0, 100)}%`;
  }

  function renderFeaturedShows(shows) {
    const grid = $("featuredShowsGrid");
    if (!grid || !shows.length) return;
    const classes = ["morning","trance","eurodance","friday","retro","popup"];
    grid.innerHTML = shows.slice(0, 6).map((show, index) => `
      <article class="show-card ${classes[index % classes.length]}">
        <small>${escapeHtml(show.time || show.day || show.label || "SHOW")}</small>
        <h3>${escapeHtml(show.title || show.name || "DJ FOLSOE LIVE")}</h3>
        <p>${escapeHtml(show.description || show.text || "Live music television from Denmark.")}</p>
      </article>
    `).join("");
  }

  function renderChart(items) {
    const list = safeArray(items).filter(Boolean);
    if (!list.length) return;
    const first = list[0] || {};
    text("chartNumberOneTitle", [first.artist, first.title].filter(Boolean).join(" — ") || first.name);
    text("chartNumberOneStatus", first.status || first.change || "This week's number one");

    const wrap = $("homepageChartList");
    if (wrap) {
      wrap.innerHTML = list.slice(1, 6).map((item, index) => `
        <div>
          <strong>#${item.rank || index + 2}</strong>
          <span>${escapeHtml([item.artist, item.title].filter(Boolean).join(" — ") || item.name || "Chart entry")}</span>
        </div>
      `).join("");
    }
  }

  function flattenNames(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value === "string") return value.split(/\\n|,/).map(v => v.trim()).filter(Boolean);
    return [];
  }

  function renderCrew(mods) {
    const grid = $("homepageCrewGrid");
    if (!grid || !mods || typeof mods !== "object") return;
    const groups = [
      ["HEAD MODS", mods.head || mods.headMods],
      ["COMMUNITY MODS", mods.community || mods.communityMods],
      ["MUSIC TEAM", mods.music || mods.musicTeam],
      ["VIP SUPPORTERS", mods.vip || mods.vipSupporters]
    ];
    grid.innerHTML = groups.map(([label, value]) => {
      const names = flattenNames(value);
      return `<article class="homepage-module"><span>${label}</span><strong>${escapeHtml(names.join(" · ") || "DJ FOLSOE community")}</strong></article>`;
    }).join("");
  }

  function renderHomepage2030(data, twitch, show, next, theme) {
    const music = data.music || data.nowPlaying || data.track || data.overlay?.music || {};
    const current = music.current || music;
    const artist = current.artist || current.performer || "";
    const title = current.title || current.track || "";
    const trackLabel = [artist, title].filter(Boolean).join(" — ");

    text("nowPlayingTitle", trackLabel || (show.title ? `${show.title} · LIVE MUSIC` : "DJ FOLSOE · LIVE MUSIC"));
    text("nowPlayingMeta", [
      current.album,
      current.year,
      current.genre,
      current.bpm ? `${current.bpm} BPM` : "",
      current.key
    ].filter(Boolean).join(" · ") || twitch.title || show.description);
    text("nowPlayingSource", current.source || (twitch.isLive ? "LIVE NOW" : "MUSIC TV"));
    setWidth("nowPlayingProgress", current.durationMs ? (Number(current.positionMs || 0) / Number(current.durationMs)) * 100 : 0);

    const cover = $("nowPlayingCover");
    const coverUrl = current.coverUrl || current.cover || current.artwork;
    if (cover && coverUrl) {
      cover.style.backgroundImage = `url("${String(coverUrl).replace(/"/g, "%22")}")`;
      cover.textContent = "";
    }

    text("homepageNextTitle", next.title || next.show || next.name);
    text("homepageNextDescription", next.description);
    text("homepageNextTime", next.displayTime || next.timeLabel || next.dateText || next.start || next.datetime);
    text("homepageNextTheme", next.theme || theme.title || theme.id || "DJ FOLSOE");

    const followers = Number(twitch.followers ?? data.community?.followers ?? data.followers ?? 0);
    const followerGoal = Number(data.community?.followerGoal || 1000);
    const subs = Number(twitch.subs ?? data.community?.subs ?? 0);
    const subGoal = Number(data.community?.subGoal || 100);
    text("homepageFollowerGoalText", `${number(followers)} / ${number(followerGoal)}`);
    text("homepageSubGoalText", `${number(subs)} / ${number(subGoal)}`);
    setWidth("homepageFollowerGoalBar", percent(followers, followerGoal));
    setWidth("homepageSubGoalBar", percent(subs, subGoal));
    text("homepageRequestText", data.community?.requestText || data.overlay?.requestText);

    text("channelStatusBadge", twitch.isLive ? "LIVE CHANNEL" : "CHANNEL CONNECTED");
    renderFeaturedShows(safeArray(data.featuredShows || data.homepage?.featuredShows));
    renderChart(data.top20 || data.homepage?.top20);
    renderCrew(data.mods || data.homepage?.mods);
  }

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

    renderHomepage2030(data, twitch, show, next, theme);

    window.dispatchEvent(new CustomEvent("djf:broadcast-core", {
      detail: data
    }));
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
