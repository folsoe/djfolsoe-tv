
(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector(".site-header");
  const navLinks = [...document.querySelectorAll("nav a[href^='#']")];
  const sections = [...document.querySelectorAll("main > section[id]")];
  const revealTargets = [
    ...document.querySelectorAll(
      ".section-heading,.homepage-heading,.homepage-module,.show-card," +
      ".interactiveBroadcast__card,.websiteCms__news,.websiteCms__side," +
      ".audienceIdentity__card,.seratoDeck,.seratoPanel," +
      ".musicChartTV__numberOne,.musicChartTV__movement,.homepage-number-one," +
      ".feature-list,.community"
    )
  ];

  function performanceProfile() {
    const cores = Number(navigator.hardwareConcurrency || 8);
    const memory = Number(navigator.deviceMemory || 8);
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    let profile = "cinematic";
    if (reduced) profile = "reduced";
    else if (cores <= 4 || memory <= 4) profile = "efficient";
    else if (cores <= 6 || memory <= 6) profile = "balanced";

    root.dataset.v189Profile = profile;
    return profile;
  }

  function normalizeTheme(value) {
    const raw = String(value || "morning").toLowerCase().trim();
    const aliases = {
      goodmorning: "morning",
      "good-morning": "morning",
      friday: "fredagsbar",
      fredagsbar: "fredagsbar",
      chart: "top20",
      top: "top20",
      danish: "danske"
    };
    return aliases[raw] || raw;
  }

  function syncTheme() {
    const candidates = [
      root.dataset.djfTheme,
      body.dataset.djfTheme,
      body.dataset.theme,
      root.dataset.theme,
      document.querySelector("[data-theme]")?.dataset.theme
    ];
    const theme = normalizeTheme(candidates.find(Boolean));
    root.dataset.djfTheme = theme;
    body.dataset.djfTheme = theme;
  }

  function updateHeader() {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  function updateActiveNavigation() {
    const line = window.scrollY + Math.min(window.innerHeight * 0.32, 300);
    let current = sections[0]?.id || "live";

    sections.forEach((section) => {
      if (section.offsetTop <= line) current = section.id;
    });

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
    });
  }

  function prepareReveal() {
    revealTargets.forEach((node, index) => {
      node.setAttribute("data-v189-reveal", "");
      node.setAttribute("data-v189-reveal-delay", String(index % 4));
    });

    if (!("IntersectionObserver" in window) || root.dataset.v189Profile === "reduced") {
      revealTargets.forEach((node) => node.classList.add("is-visible"));
      return null;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -55px 0px"
    });

    revealTargets.forEach((node) => observer.observe(node));
    return observer;
  }

  function addCardDepth() {
    const cards = document.querySelectorAll(
      ".show-card,.homepage-module,.interactiveBroadcast__card," +
      ".audienceIdentity__card,.musicChartTV__movement"
    );

    if (root.dataset.v189Profile === "efficient" || matchMedia("(pointer: coarse)").matches) return;

    cards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const box = card.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        card.style.setProperty("--v189-pointer-x", `${x * 100}%`);
        card.style.setProperty("--v189-pointer-y", `${y * 100}%`);
      }, { passive: true });

      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--v189-pointer-x");
        card.style.removeProperty("--v189-pointer-y");
      }, { passive: true });
    });
  }

  function observeDynamicTheme() {
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-djf-theme", "data-theme"]
    });
    observer.observe(body, {
      attributes: true,
      attributeFilter: ["data-djf-theme", "data-theme"]
    });
    return observer;
  }

  function status() {
    return {
      build: "V18900",
      theme: root.dataset.djfTheme,
      profile: root.dataset.v189Profile,
      modules: revealTargets.length,
      activeNavigation: document.querySelector("nav a.is-active")?.textContent?.trim() || ""
    };
  }

  performanceProfile();
  syncTheme();
  updateHeader();
  updateActiveNavigation();

  const revealObserver = prepareReveal();
  const themeObserver = observeDynamicTheme();
  addCardDepth();

  let scrollQueued = false;
  window.addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      updateHeader();
      updateActiveNavigation();
      scrollQueued = false;
    });
  }, { passive: true });

  window.addEventListener("resize", updateActiveNavigation, { passive: true });

  window.addEventListener("beforeunload", () => {
    revealObserver?.disconnect();
    themeObserver.disconnect();
  }, { once: true });

  window.DJF_WEBSITE_V18900 = Object.freeze({
    status,
    refresh: () => {
      performanceProfile();
      syncTheme();
      updateHeader();
      updateActiveNavigation();
    }
  });

  console.info("DJ FOLSOE Website V18900 ready", status());
})();
