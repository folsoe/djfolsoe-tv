(() => {
  "use strict";

  const hero = document.getElementById("live");
  if (!hero || hero.dataset.djfLiveEngineReady === "true") return;
  hero.dataset.djfLiveEngineReady = "true";

  const livePill = document.getElementById("livePill");
  const navState = document.getElementById("navState");
  const currentShow = document.getElementById("currentShow");
  const viewers = document.getElementById("metricViewers");
  const followers = document.getElementById("metricFollowers");
  const onAirCard = hero.querySelector(".premiereOnAirCard");
  const nextSection = document.getElementById("next");

  function clean(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }

  function numeric(value) {
    const result = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(result) ? result : 0;
  }

  function detectLive() {
    const values = [
      clean(livePill?.textContent),
      clean(navState?.textContent),
      document.body.className,
      hero.className
    ].join(" ").toLowerCase();

    return (
      /\bon air\b|\blive now\b|\blive\b/.test(values) &&
      !/\boffline\b|\bnot live\b/.test(values)
    );
  }

  function addAtmosphere() {
    if (!hero.querySelector(".djfHeroLiveAtmosphere")) {
      const atmosphere = document.createElement("div");
      atmosphere.className = "djfHeroLiveAtmosphere";
      atmosphere.setAttribute("aria-hidden", "true");
      hero.prepend(atmosphere);
    }

    if (!hero.querySelector(".djfHeroBroadcastMeta")) {
      const meta = document.createElement("div");
      meta.className = "djfHeroBroadcastMeta";
      meta.setAttribute("aria-hidden", "true");
      meta.innerHTML = `
        <span>DJF 01</span>
        <span>Live from Denmark</span>
        <span>HD</span>
        <span>Stereo</span>
        <span>Digital broadcast</span>
      `;
      hero.appendChild(meta);
    }
  }

  function improveOnAirCard() {
    if (!onAirCard || onAirCard.querySelector(".djfHeroNowStatus")) return;

    const status = document.createElement("div");
    status.className = "djfHeroNowStatus";
    status.innerHTML = `<i></i><span>Broadcast status</span>`;
    onAirCard.prepend(status);
  }

  function animateNumber(element, nextValue) {
    if (!element) return;

    const start = numeric(element.textContent);
    const end = numeric(nextValue);
    if (start === end) return;

    const duration = 650;
    const started = performance.now();

    element.classList.remove("djfMetricChanged");
    void element.offsetWidth;
    element.classList.add("djfMetricChanged");

    function frame(now) {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(start + (end - start) * eased);
      element.textContent = value.toLocaleString("en-US");

      if (progress < 1) requestAnimationFrame(frame);
      else setTimeout(() => element.classList.remove("djfMetricChanged"), 450);
    }

    requestAnimationFrame(frame);
  }

  function observeMetric(element) {
    if (!element) return;

    let last = numeric(element.textContent);
    const observer = new MutationObserver(() => {
      const next = numeric(element.textContent);
      if (next === last) return;
      const captured = next;
      element.textContent = last.toLocaleString("en-US");
      animateNumber(element, captured);
      last = captured;
    });

    observer.observe(element, {
      childList: true,
      characterData: true,
      subtree: true
    });
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

  function setupCountdown() {
    const copy = hero.querySelector(".premiereHeroCopy");
    if (!copy || copy.querySelector(".djfHeroCountdown")) return;

    const countdown = document.createElement("div");
    countdown.className = "djfHeroCountdown";
    countdown.hidden = true;
    countdown.innerHTML = `<span>Next broadcast</span><b>Scheduled soon</b>`;
    copy.appendChild(countdown);

    function update() {
      const isLive = detectLive();
      countdown.hidden = isLive;
      if (isLive) return;

      const target = findNextTime();
      const output = countdown.querySelector("b");
      if (!target || !output) {
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

    update();
    setInterval(update, 30000);
  }

  function applyLiveState() {
    const isLive = detectLive();
    hero.dataset.djfLive = String(isLive);

    if (livePill) {
      livePill.textContent = isLive ? "LIVE" : "OFFLINE";
    }

    const statusLabel = onAirCard?.querySelector(".djfHeroNowStatus span");
    if (statusLabel) {
      statusLabel.textContent = isLive ? "Live broadcast" : "Next broadcast";
    }

    if (onAirCard) {
      const title = onAirCard.querySelector("strong");
      const show = clean(currentShow?.textContent);
      if (title && show && isLive) title.textContent = show;
    }
  }

  function observeLiveState() {
    const targets = [livePill, navState, currentShow, document.body].filter(Boolean);
    let timer = 0;

    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(applyLiveState, 40);
    });

    for (const target of targets) {
      observer.observe(target, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  }

  addAtmosphere();
  improveOnAirCard();
  setupCountdown();
  applyLiveState();
  observeLiveState();
  observeMetric(viewers);
  observeMetric(followers);

  setTimeout(applyLiveState, 500);
  setTimeout(applyLiveState, 1800);
})();
