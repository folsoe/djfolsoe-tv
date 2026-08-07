/* DJ FOLSOE V26310 — social connect interaction */
(() => {
  "use strict";
  document.querySelectorAll(".v26310Social").forEach(link => {
    link.addEventListener("click", () => {
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "social_click",
          platform: [...link.classList].find(x =>
            ["twitch","instagram","facebook","tiktok"].includes(x)
          ) || "social",
          source: "next_show_card"
        });
      } catch (_) {}
    });
  });
})();
