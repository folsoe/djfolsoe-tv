/* DJ FOLSOE V26300 — Mobile Broadcast Experience */
(() => {
  "use strict";

  const liveTarget = document.getElementById("v26300RibbonLive");
  const showTarget = document.getElementById("v26300RibbonShow");

  function firstText(selectors){
    for(const selector of selectors){
      const el = document.querySelector(selector);
      const text = el?.textContent?.trim();
      if(text) return text;
    }
    return "";
  }

  function syncRibbon(){
    if(liveTarget){
      const liveText = firstText([
        "#siteStatusText",
        "#channelStatus",
        ".broadcastStatus strong"
      ]);
      if(liveText){
        liveTarget.textContent = /live/i.test(liveText) && !/off/i.test(liveText)
          ? "LIVE NOW"
          : "OFF AIR";
      }
    }

    if(showTarget){
      const show = firstText([
        "#siteOnAirShow",
        "#nextShowTitle",
        ".broadcastOnAir strong"
      ]);
      if(show) showTarget.textContent = show.slice(0,24);
    }
  }

  syncRibbon();
  setInterval(syncRibbon, 15000);
})();
