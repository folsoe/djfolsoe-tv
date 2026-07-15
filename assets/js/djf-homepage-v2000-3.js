(() => {
  "use strict";

  const ORDER = [
    "websiteActivityTicker",
    "live",
    "next",
    "activityPulseEngine",
    "shows",
    "contentZoneShowsAfter",
    "contentZoneFeatured",
    "musicNews",
    "contentZoneEditorial",
    "top20",
    "contentZoneChartsAfter",
    "viewerCommands",
    "contentZoneInteractive",
    "requests",
    "contentZoneArchive"
  ];

  function enforceCompleteOrder() {
    const main = document.querySelector(".premiereMain");
    if (!main) return;

    let anchor = null;

    for (const id of ORDER) {
      const element = document.getElementById(id);
      if (!element || element.parentElement !== main) continue;

      if (!anchor) {
        if (main.firstElementChild !== element) {
          main.insertBefore(element, main.firstElementChild);
        }
      } else if (anchor.nextElementSibling !== element) {
        anchor.insertAdjacentElement("afterend", element);
      }

      anchor = element;
    }

    /*
      Unknown future CMS zones are deliberately moved after all known zones.
      This prevents a new module from silently receiving order:0.
    */
    const known = new Set(ORDER);
    const unknownZones = [...main.children].filter(element =>
      element.classList.contains("contentModuleZone") &&
      element.id &&
      !known.has(element.id)
    );

    for (const zone of unknownZones) {
      main.appendChild(zone);
    }
  }

  function start() {
    enforceCompleteOrder();

    const main = document.querySelector(".premiereMain");
    if (!main) return;

    let timer = 0;
    new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(enforceCompleteOrder, 40);
    }).observe(main, {
      childList: true,
      subtree: false
    });

    setTimeout(enforceCompleteOrder, 300);
    setTimeout(enforceCompleteOrder, 1000);
    setTimeout(enforceCompleteOrder, 2500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
