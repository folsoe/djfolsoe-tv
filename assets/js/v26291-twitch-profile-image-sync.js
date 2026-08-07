/* DJ FOLSOE V26291 — Twitch Profile Image Sync
   Uses the existing DJ FOLSOE API only. No new Worker code required.
*/
(() => {
  "use strict";

  const API_BASE = "https://djfolsoe-tv-api.sunefolsoe.workers.dev";
  const avatar = document.getElementById("siteProfileImage");
  const photo = document.getElementById("siteProfileImagePhoto");

  if (!avatar || !photo) return;

  const endpoints = [
    `${API_BASE}/api/twitch-profile`,
    `${API_BASE}/api/twitch`,
    `${API_BASE}/api/homepage`
  ];

  const clean = value =>
    typeof value === "string" && /^https?:\/\//i.test(value.trim())
      ? value.trim()
      : "";

  function findImage(payload) {
    if (!payload || typeof payload !== "object") return "";

    const direct = [
      payload.profileImageUrl,
      payload.profileImageURL,
      payload.profile_image_url,
      payload.profileImage,
      payload.profile_image,
      payload.avatarUrl,
      payload.avatarURL,
      payload.avatar,
      payload.image,
      payload.logo,
      payload.picture
    ];

    for (const item of direct) {
      const found = clean(item);
      if (found) return found;
    }

    const likelyParents = [
      payload.data,
      payload.profile,
      payload.twitch,
      payload.user,
      payload.channel,
      payload.broadcaster,
      payload.homepage,
      payload.hero
    ];

    for (const parent of likelyParents) {
      if (!parent) continue;

      if (Array.isArray(parent)) {
        for (const item of parent) {
          const found = findImage(item);
          if (found) return found;
        }
      } else if (typeof parent === "object") {
        const found = findImage(parent);
        if (found) return found;
      }
    }

    // Last-resort recursive scan, restricted to image/avatar/profile-like keys.
    for (const [key, value] of Object.entries(payload)) {
      if (
        typeof value === "string" &&
        /(profile.*image|image.*profile|avatar|logo|picture)/i.test(key)
      ) {
        const found = clean(value);
        if (found) return found;
      }
    }

    return "";
  }

  function applyImage(url) {
    return new Promise((resolve, reject) => {
      const tester = new Image();
      tester.onload = () => {
        photo.onload = () => {
          avatar.classList.add("profile-ready");
          avatar.classList.remove("profile-error");
          resolve(true);
        };
        photo.onerror = reject;
        photo.src = url;
      };
      tester.onerror = reject;
      tester.referrerPolicy = "no-referrer";
      tester.src = url;
    });
  }

  async function requestJson(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
        signal: controller.signal,
        headers: { "Accept": "application/json" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async function syncProfileImage() {
    avatar.classList.remove("profile-error");

    // If another existing DJ FOLSOE script has already injected an image, use it.
    const existingCandidates = [
      avatar.dataset.profileImage,
      avatar.dataset.image,
      avatar.getAttribute("data-avatar"),
      window.DJF_TWITCH_PROFILE?.profile_image_url,
      window.DJF_TWITCH_PROFILE?.profileImageUrl,
      window.DJF_TWITCH?.profile_image_url,
      window.DJF_TWITCH?.profileImageUrl
    ];

    for (const candidate of existingCandidates) {
      const url = clean(candidate);
      if (!url) continue;
      try {
        await applyImage(url);
        return;
      } catch (_) {}
    }

    for (const endpoint of endpoints) {
      try {
        const payload = await requestJson(endpoint);
        const url = findImage(payload);
        if (!url) continue;
        await applyImage(url);
        avatar.dataset.profileSource = endpoint;
        return;
      } catch (error) {
        console.debug("[V26291] profile source failed:", endpoint, error?.message || error);
      }
    }

    avatar.classList.add("profile-error");
    console.warn("[V26291] Twitch profile image could not be resolved; DJ fallback retained.");
  }

  syncProfileImage();

  // Refresh occasionally in case Twitch profile data changes while the page is open.
  setInterval(syncProfileImage, 15 * 60 * 1000);
})();
