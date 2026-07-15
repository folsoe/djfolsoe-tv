(() => {
  "use strict";

  function text(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function detectState(card, index) {
    const content = text(card.textContent);
    if (/on air|live now|currently live|live/.test(content)) return "live";
    if (/up next|next show|coming next/.test(content)) return "next";
    if (/weekly|every week|tuesday|friday|sunday|monday|wednesday|thursday|saturday/.test(content)) {
      return "weekly";
    }
    return index === 0 ? "next" : "weekly";
  }

  function buildRail() {
    const section = document.getElementById("shows");
    const cards = section?.querySelector(".premiereShowCards");
    if (!section || !cards || cards.dataset.djfRailReady === "true") return;

    cards.dataset.djfRailReady = "true";

    const shell = document.createElement("div");
    shell.className = "djfShowRailShell";
    cards.parentNode.insertBefore(shell, cards);
    shell.appendChild(cards);

    const controls = document.createElement("div");
    controls.className = "djfShowRailControls";
    controls.innerHTML = `
      <button type="button" data-direction="-1" aria-label="Previous shows">←</button>
      <button type="button" data-direction="1" aria-label="Next shows">→</button>
    `;
    shell.insertBefore(controls, cards);

    const showCards = [...cards.children];
    showCards.forEach((card, index) => {
      card.dataset.djfShowState = detectState(card, index);

      if (!card.querySelector(".djfShowShine")) {
        const shine = document.createElement("i");
        shine.className = "djfShowShine";
        shine.setAttribute("aria-hidden", "true");
        card.appendChild(shine);
      }
    });

    function cardStep() {
      const card = cards.querySelector(":scope > *");
      if (!card) return Math.max(260, cards.clientWidth * .8);
      const gap = parseFloat(getComputedStyle(cards).gap || "12");
      return card.getBoundingClientRect().width + gap;
    }

    controls.addEventListener("click", event => {
      const button = event.target.closest("button[data-direction]");
      if (!button) return;
      const direction = Number(button.dataset.direction);
      cards.scrollBy({ left: direction * cardStep(), behavior: "smooth" });
    });

    let paused = false;
    let activeIndex = 0;

    function setActive(index) {
      if (!showCards.length) return;
      activeIndex = (index + showCards.length) % showCards.length;
      showCards.forEach((card, cardIndex) => {
        card.classList.toggle("djfShowActive", cardIndex === activeIndex);
      });
    }

    setActive(0);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };

    cards.addEventListener("pointerenter", pause);
    cards.addEventListener("pointerleave", resume);
    cards.addEventListener("touchstart", pause, { passive:true });
    cards.addEventListener("touchend", () => setTimeout(resume, 1800), { passive:true });
    cards.addEventListener("focusin", pause);
    cards.addEventListener("focusout", resume);

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

    window.setInterval(() => {
      if (
        paused ||
        reduceMotion.matches ||
        document.hidden ||
        window.innerWidth > 1050 ||
        showCards.length < 2
      ) return;

      setActive(activeIndex + 1);
      cards.scrollTo({
        left: activeIndex * cardStep(),
        behavior: "smooth"
      });
    }, 7000);
  }

  function start() {
    buildRail();

    const section = document.getElementById("shows");
    if (!section) return;

    let timer = 0;
    new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(buildRail, 80);
    }).observe(section, { childList:true, subtree:true });

    setTimeout(buildRail, 600);
    setTimeout(buildRail, 1800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
