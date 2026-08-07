(() => {
"use strict";

const VERSION="V28000";
const CSS="/assets/css/site-foundation.css?v=28000";

function sectionFromPath(){
  const p=(location.pathname||"/").toLowerCase().replace(/\/+/g,"/");
  if(p==="/" || /\/index\.html$/.test(p)) return "home";
  if(p.startsWith("/watch-live")) return "live";
  if(p==="/shows/" || p==="/shows") return "shows";
  if(p.startsWith("/music")) return "music";
  if(p.includes("/shows/fredagsbar")) return "fredagsbar";
  if(p.includes("/shows/trance-tuesday")) return "trance";
  if(p.includes("/shows/eurodance")) return "eurodance";
  if(p.includes("/shows/retro-hits")) return "retro";
  if(p.includes("/shows/good-morning-twitch")) return "morning";
  if(p.includes("/shows/pop-up")) return "popup";
  if(p.includes("/shows/weekend")) return "weekend";
  if(p.includes("/shows/nu-disco")) return "nudisco";
  return "site";
}

function ensureCSS(){
  if(document.querySelector('link[data-djf-foundation]')) return;
  const link=document.createElement("link");
  link.rel="stylesheet";
  link.href=CSS;
  link.dataset.djfFoundation=VERSION;
  document.head.appendChild(link);
}

function markHeader(){
  const selectors=[
    ".fbTop",".trIHeader",".trTop",".edHeader",".rhHeader",
    ".pHead",".wHead",".nHead",".suHeader",
    ".premiereNav","body > header"
  ];
  const header=selectors.map(s=>document.querySelector(s)).find(Boolean);
  if(!header) return;

  header.classList.add("djf-foundation-header");

  const brand =
    header.querySelector(".fbBrand,.trILogo,.trBrand,.edBrand,.rhBrand,.pBrand,.wBrand,.nBrand,.suBrand,.premiereBrand") ||
    header.querySelector("a");
  if(brand) brand.classList.add("djf-foundation-brand");

  const nav =
    header.querySelector(".fbNav,.trNav,.premiereNavigation,nav") ||
    null;
  if(nav){
    nav.classList.add("djf-foundation-nav");

    // Mark the obvious current page without changing destinations.
    const section=document.documentElement.dataset.djfSection;
    [...nav.querySelectorAll("a")].forEach(a=>{
      const href=(a.getAttribute("href")||"").toLowerCase();
      if(
        (section==="shows" && /^\/shows\/?$/.test(href)) ||
        (["fredagsbar","trance","eurodance","retro","morning","popup","weekend","nudisco"].includes(section) && /^\/shows\/?$/.test(href)) ||
        (section==="music" && /^\/music\/?$/.test(href)) ||
        (section==="live" && href.includes("watch-live"))
      ){
        a.setAttribute("aria-current","page");
      }
    });
  }
}

function markFooter(){
  const selectors=[
    ".fbFooter",".trIFooter",".trFooter",".edFooter",".rhFooter",
    ".pFooter",".wFooter",".nFooter",".suFooter",".premiereFooter",
    "body > footer"
  ];
  const footer=selectors.map(s=>document.querySelector(s)).find(Boolean);
  if(footer) footer.classList.add("djf-foundation-footer");
}

function markSections(){
  const section=document.documentElement.dataset.djfSection;
  if(section==="home") return;

  // Exact known major sections first. No structure is changed.
  const map={
    fredagsbar:[".fbManifesto",".fbWide",".fbSchedule",".fbFinal"],
    trance:[".trFlowSection",".trPortal",".trWaveSection",".trClassic",".trSpectrumImmersive",".trInfoImmersive",".trFinalImmersive"],
    eurodance:[".edIntro",".edDNA",".edTimeline",".edEurope",".edVoices",".edRequests",".edInfo",".edFinal"],
    retro:[".rhIntro",".rhSunday",".rhDecades",".rhChartDNA",".rhYearDive",".rhMedia",".rhStories",".rhInfo",".rhFinal"],
    popup:[".pText",".pWarning",".pFinal"],
    weekend:[".wText",".wChart",".wRadar",".wFinal"],
    nudisco:[".nText",".nThenNow",".nEdit",".nNight",".nFinal"],
    shows:[".suSection",".suScheduleMap",".suTop20",".suMatrix",".suFinal"]
  };

  const sels=map[section]||[];
  let count=0;
  sels.forEach(sel=>{
    document.querySelectorAll(sel).forEach(el=>{
      el.classList.add("djf-foundation-section");
      if(count++ % 2===0) el.dataset.djfEdge="1";
    });
  });
}

function boot(){
  const section=sectionFromPath();
  document.documentElement.dataset.djfSection=section;

  // Homepage is already the visual master; don't restyle it.
  if(section==="home"){
    document.documentElement.classList.add("djf-foundation-master");
    return;
  }

  ensureCSS();
  document.documentElement.classList.add("djf-foundation-loaded");
  markHeader();
  markFooter();
  markSections();

  window.DJF_SITE_FOUNDATION={
    version:VERSION,
    section,
    safeMode:true
  };
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",boot,{once:true});
}else{
  boot();
}
})();