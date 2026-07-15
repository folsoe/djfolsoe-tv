(() => {
  "use strict";

  if (window.__DJF_V3000_MUSIC_TV__) return;
  window.__DJF_V3000_MUSIC_TV__ = true;

  const main = document.querySelector(".premiereMain");
  const ticker = document.getElementById("websiteActivityTicker");

  if (!main || !ticker || document.getElementById("djfV3000Guide")) return;

  const candidates = [
    ["live", "Live"],
    ["next", "Up Next"],
    ["shows", "Shows"],
    ["top20", "Charts"],
    ["community", "Community"],
    ["viewerCommands", "Commands"],
    ["requests", "Requests"]
  ];

  const available = candidates.filter(([id]) => document.getElementById(id));
  if (!available.length) return;

  const guide = document.createElement("nav");
  guide.id = "djfV3000Guide";
  guide.className = "djfV3000Guide";
  guide.setAttribute("aria-label", "DJ FOLSOE Music TV guide");

  const label = document.createElement("span");
  label.className = "djfV3000GuideLabel";
  label.textContent = "Music TV Guide";
  guide.appendChild(label);

  for (const [id, title] of available) {
    const link = document.createElement("a");
    link.href = `#${id}`;
    link.textContent = title;

    link.addEventListener("click", () => {
      for (const other of guide.querySelectorAll("a[aria-current]")) {
        other.removeAttribute("aria-current");
      }
      link.setAttribute("aria-current", "location");
    });

    guide.appendChild(link);
  }

  ticker.insertAdjacentElement("afterend", guide);
})();
