/* DJ FOLSOE V26292 — mobile layout guard */
(() => {
  "use strict";

  const mq = window.matchMedia("(max-width: 760px)");

  function normalizeMobileLayout() {
    const dock = document.getElementById("mobileBroadcastDock");
    if (!dock) return;

    if (mq.matches) {
      dock.style.position = "relative";
      dock.style.bottom = "auto";
      dock.style.left = "auto";
      dock.style.right = "auto";
      dock.style.transform = "none";
      document.documentElement.style.setProperty("--mobile-dock-overlay-height", "0px");
      document.body.classList.add("v26292-mobile-safe");
    } else {
      dock.removeAttribute("style");
      document.body.classList.remove("v26292-mobile-safe");
    }
  }

  normalizeMobileLayout();
  if (mq.addEventListener) mq.addEventListener("change", normalizeMobileLayout);
  else mq.addListener(normalizeMobileLayout);

  window.addEventListener("orientationchange", () => {
    setTimeout(normalizeMobileLayout, 120);
  });
})();
