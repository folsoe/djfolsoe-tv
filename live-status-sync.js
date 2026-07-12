(() => {
  "use strict";

  const API_BASE = "https://djfolsoe-tv-api.sunefolsoe.workers.dev";
  const POLL_MS = 12000;

  let lastSignature = "";

  async function readJson(path) {
    const response = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  function normalize(payload) {
    const root =
      payload?.core ||
      payload?.broadcast ||
      payload?.data?.core ||
      payload?.data ||
      payload ||
      {};

    const twitch =
      root?.twitch ||
      payload?.twitch ||
      payload?.data?.twitch ||
      {};

    const live = Boolean(
      twitch.live ??
      twitch.isLive ??
      twitch.online ??
      twitch.is_online ??
      root.live ??
      root.isLive
    );

    return {
      live,
      viewers: Number(
        twitch.viewers ??
        twitch.viewerCount ??
        twitch.viewer_count ??
        0
      ),
      followers: Number(
        twitch.followers ??
        twitch.followerCount ??
        twitch.follower_count ??
        root?.community?.followers ??
        0
      ),
      title:
        twitch.title ||
        twitch.streamTitle ||
        twitch.stream_title ||
        root?.show?.title ||
        root?.show?.current ||
        "DJ FOLSOE",
      category:
        twitch.gameName ||
        twitch.game_name ||
        twitch.category ||
        "Music",
      startedAt:
        twitch.startedAt ||
        twitch.started_at ||
        "",
      displayName:
        twitch.displayName ||
        twitch.display_name ||
        "DJ FOLSOE"
    };
  }

  function setText(selectors, value) {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(node => {
        node.textContent = String(value);
      });
    });
  }

  function setVisible(selectors, visible) {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(node => {
        node.hidden = !visible;
        node.setAttribute("aria-hidden", String(!visible));
      });
    });
  }

  function applyStatus(status) {
    const signature = JSON.stringify(status);

    if (signature === lastSignature) {
      return;
    }

    lastSignature = signature;

    document.documentElement.dataset.twitchStatus =
      status.live ? "live" : "offline";

    document.body?.classList.toggle("is-live", status.live);
    document.body?.classList.toggle("is-offline", !status.live);

    setText(
      [
        "[data-twitch-status]",
        "[data-live-status]",
        "#liveStatus",
        "#twitchStatus",
        ".live-status-text"
      ],
      status.live ? "LIVE" : "OFFLINE"
    );

    setText(
      [
        "[data-twitch-viewers]",
        "[data-viewer-count]",
        "#viewerCount",
        "#twitchViewers"
      ],
      status.viewers.toLocaleString()
    );

    setText(
      [
        "[data-twitch-followers]",
        "[data-follower-count]",
        "#followerCount",
        "#twitchFollowers"
      ],
      status.followers.toLocaleString()
    );

    setText(
      [
        "[data-twitch-title]",
        "[data-stream-title]",
        "#streamTitle",
        "#twitchTitle"
      ],
      status.title
    );

    setText(
      [
        "[data-twitch-category]",
        "#streamCategory",
        "#twitchCategory"
      ],
      status.category
    );

    setText(
      [
        "[data-twitch-display-name]",
        "#twitchDisplayName"
      ],
      status.displayName
    );

    setVisible(
      [
        "[data-show-when-live]",
        ".show-when-live"
      ],
      status.live
    );

    setVisible(
      [
        "[data-show-when-offline]",
        ".show-when-offline"
      ],
      !status.live
    );

    document.querySelectorAll(
      "[data-live-indicator], .live-indicator, .status-dot"
    ).forEach(node => {
      node.classList.toggle("live", status.live);
      node.classList.toggle("offline", !status.live);
    });

    window.dispatchEvent(
      new CustomEvent("djf:twitch-status", {
        detail: status
      })
    );

    try {
      localStorage.setItem(
        "djf_twitch_live_status",
        JSON.stringify({
          ...status,
          checkedAt: Date.now()
        })
      );
    } catch (_) {}
  }

  async function refresh() {
    const paths = [
      "/api/twitch",
      "/api/broadcast",
      "/api/cms/public/state"
    ];

    for (const path of paths) {
      try {
        const payload = await readJson(path);
        applyStatus(normalize(payload));
        return;
      } catch (error) {
        console.warn(
          `Live Status Sync could not read ${path}`,
          error
        );
      }
    }
  }

  refresh();
  window.setInterval(refresh, POLL_MS);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      refresh();
    }
  });

  window.addEventListener("online", refresh);
})();