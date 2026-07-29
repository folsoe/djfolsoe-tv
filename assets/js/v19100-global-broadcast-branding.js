
(() => {
  "use strict";

  const root = document.documentElement;
  const experience = document.querySelector(".v19000-tv-experience");
  const ident = document.getElementById("v19100ChannelIdent");

  if (!experience || !ident) return;

  let lastTheme = root.dataset.djfTheme || "morning";
  let identTimer = 0;
  let pulseTimer = 0;
  let identHideTimer = 0;

  function showIdent() {
    if (document.hidden) return;
    ident.classList.remove("is-visible");
    void ident.offsetWidth;
    ident.classList.add("is-visible");

    clearTimeout(identHideTimer);
    identHideTimer = setTimeout(() => {
      ident.classList.remove("is-visible");
    }, 2900);
  }

  function brandPulse() {
    if (document.hidden) return;
    experience.classList.remove("v19100-brand-pulse");
    void experience.offsetWidth;
    experience.classList.add("v19100-brand-pulse");
    setTimeout(() => experience.classList.remove("v19100-brand-pulse"), 1600);
  }

  function themeTake() {
    const theme = root.dataset.djfTheme || "morning";
    if (theme === lastTheme) return;

    lastTheme = theme;
    experience.classList.remove("v19100-theme-take");
    void experience.offsetWidth;
    experience.classList.add("v19100-theme-take");

    setTimeout(() => {
      experience.classList.remove("v19100-theme-take");
    }, 950);
  }

  function scheduleIdent() {
    clearInterval(identTimer);
    identTimer = setInterval(showIdent, 8 * 60 * 1000);
  }

  function schedulePulse() {
    clearInterval(pulseTimer);
    pulseTimer = setInterval(brandPulse, 4 * 60 * 1000);
  }

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.attributeName === "data-djf-theme") themeTake();
    }
  });

  observer.observe(root, {
    attributes: true,
    attributeFilter: ["data-djf-theme"]
  });

  window.addEventListener("djf:broadcast-core", () => {
    brandPulse();
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      lastTheme = root.dataset.djfTheme || "morning";
    }
  }, { passive: true });

  scheduleIdent();
  schedulePulse();

  window.addEventListener("beforeunload", () => {
    observer.disconnect();
    clearInterval(identTimer);
    clearInterval(pulseTimer);
    clearTimeout(identHideTimer);
  }, { once: true });

  window.DJF_WEBSITE_V19100 = Object.freeze({
    ident: showIdent,
    pulse: brandPulse,
    status: () => ({
      build: "V19100",
      theme: root.dataset.djfTheme || "morning",
      identScheduled: true,
      pulseScheduled: true
    })
  });
})();
