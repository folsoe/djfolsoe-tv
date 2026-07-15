(() => {
  "use strict";

  if (window.__DJF_SAFE_HERO_200061__) return;
  window.__DJF_SAFE_HERO_200061__ = true;

  const hero = document.getElementById("live");
  if (!hero) return;

  const livePill = document.getElementById("livePill");
  const navState = document.getElementById("navState");
  const currentShow = document.getElementById("currentShow");
  const viewers = document.getElementById("metricViewers");
  const followers = document.getElementById("metricFollowers");
  const onAirCard = hero.querySelector(".premiereOnAirCard");
  const nextSection = document.getElementById("next");

  const clean = value => String(value ?? "").replace(/\s+/g, " ").trim();

  function detectLive() {
    const values = [
      clean(livePill?.textContent),
      clean(navState?.textContent),
      document.body.className,
      hero.className
    ].join(" ").toLowerCase();

    if (/\boffline\b|\bnot live\b/.test(values)) return false;
    return /\bon air\b|\blive now\b|\blive\b/.test(values);
  }

  function addDecoration() {
    if (!hero.querySelector(".djfHeroSafeAtmosphere")) {
      const layer = document.createElement("div");
      layer.className = "djfHeroSafeAtmosphere";
      layer.setAttribute("aria-hidden", "true");
      hero.prepend(layer);
    }

    if (!hero.querySelector(".djfHeroSafeMeta")) {
      const meta = document.createElement("div");
      meta.className = "djfHeroSafeMeta";
      meta.setAttribute("aria-hidden", "true");
      meta.innerHTML = `
        <span>DJF 01</span>
        <span>Live from Denmark</span>
        <span>HD</span>
        <span>Stereo</span>
      `;
      hero.appendChild(meta);
    }

    if (onAirCard && !onAirCard.querySelector(".djfHeroSafeStatus")) {
      const status = document.createElement("div");
      status.className = "djfHeroSafeStatus";
      status.innerHTML = "<i></i><span>Broadcast status</span>";
      onAirCard.prepend(status);
    }
  }

  function findNextTime() {
    if (!nextSection) return null;

    const candidates = [
      nextSection.querySelector("time[datetime]")?.getAttribute("datetime"),
      nextSection.dataset.start,
      nextSection.dataset.datetime,
      nextSection.querySelector("[data-start]")?.dataset.start,
      nextSection.querySelector("[data-datetime]")?.dataset.datetime
    ].filter(Boolean);

    for (const candidate of candidates) {
      const date = new Date(candidate);
      if (!Number.isNaN(date.getTime()) && date.getTime() > Date.now()) return date;
    }
    return null;
  }

  function addCountdown() {
    const copy = hero.querySelector(".premiereHeroCopy");
    if (!copy || copy.querySelector(".djfHeroSafeCountdown")) return;

    const countdown = document.createElement("div");
    countdown.className = "djfHeroSafeCountdown";
    countdown.hidden = true;
    countdown.innerHTML = "<span>Next broadcast</span><b>Schedule updating</b>";
    copy.appendChild(countdown);
  }

  function updateCountdown(isLive) {
    const countdown = hero.querySelector(".djfHeroSafeCountdown");
    const output = countdown?.querySelector("b");
    if (!countdown || !output) return;

    countdown.hidden = isLive;
    if (isLive) return;

    const target = findNextTime();
    if (!target) {
      output.textContent = "Schedule updating";
      return;
    }

    const difference = Math.max(0, target.getTime() - Date.now());
    const days = Math.floor(difference / 86400000);
    const hours = Math.floor((difference % 86400000) / 3600000);
    const minutes = Math.floor((difference % 3600000) / 60000);

    output.textContent = days > 0
      ? `${days}d ${hours}h ${minutes}m`
      : `${hours}h ${minutes}m`;
  }

  function applyState() {
    const isLive = detectLive();

    if (hero.dataset.djfLive !== String(isLive)) {
      hero.dataset.djfLive = String(isLive);
    }

    const statusLabel = onAirCard?.querySelector(".djfHeroSafeStatus span");
    if (statusLabel) {
      const nextLabel = isLive ? "Live broadcast" : "Next broadcast";
      if (statusLabel.textContent !== nextLabel) statusLabel.textContent = nextLabel;
    }

    const title = onAirCard?.querySelector("strong");
    const showName = clean(currentShow?.textContent);
    if (isLive && title && showName && title.textContent !== showName) {
      title.textContent = showName;
    }

    updateCountdown(isLive);
  }

  function flashMetric(element) {
    if (!element) return;
    element.classList.remove("djfSafeMetricFlash");
    void element.offsetWidth;
    element.classList.add("djfSafeMetricFlash");
    setTimeout(() => element.classList.remove("djfSafeMetricFlash"), 700);
  }

  function watchMetric(element) {
    if (!element) return;

    let lastValue = clean(element.textContent);
    const observer = new MutationObserver(() => {
      const nextValue = clean(element.textContent);
      if (nextValue === lastValue) return;
      lastValue = nextValue;
      flashMetric(element);
    });

    observer.observe(element, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  function watchStateSources() {
    const targets = [livePill, navState, currentShow, document.body].filter(Boolean);
    let scheduled = false;

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        applyState();
      });
    };

    const observer = new MutationObserver(schedule);

    for (const target of targets) {
      observer.observe(target, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  }

  addDecoration();
  addCountdown();
  applyState();
  watchStateSources();
  watchMetric(viewers);
  watchMetric(followers);

  window.setInterval(() => updateCountdown(detectLive()), 30000);
  setTimeout(applyState, 500);
  setTimeout(applyState, 1800);
})();
