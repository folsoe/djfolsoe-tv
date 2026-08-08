(()=>{"use strict";
const V="V28200";

function section(){
 const p=(location.pathname||"/").toLowerCase().replace(/\/+/g,"/");
 if(p==="/"||/\/index\.html$/.test(p)) return "home";
 if(p.startsWith("/watch-live")) return "live";
 if(p==="/shows/"||p==="/shows") return "shows";
 if(p.startsWith("/music")) return "music";
 if(p.includes("/shows/fredagsbar")) return "fredagsbar";
 if(p.includes("/shows/trance-tuesday")) return "trance";
 if(p.includes("/shows/eurodance")) return "eurodance";
 if(p.includes("/shows/retro-hits")) return "retro";
 if(p.includes("/shows/good-morning-twitch")) return "morning";
 if(p.includes("/shows/pop-up")) return "popup";
 if(p.includes("/shows/weekend")) return "weekend";
 if(p.includes("/shows/nu-disco")) return "nudisco";
 if(p.startsWith("/community")) return "community";
 if(p.startsWith("/guides")) return "guides";
 if(p.startsWith("/about-dj-folsoe")) return "about";
 if(p.startsWith("/archive")) return "archive";
 return "site";
}
function first(selectors){for(const s of selectors){const e=document.querySelector(s);if(e)return e}return null}
function markHeader(sec){
 const h=first([".fbTop",".trIHeader",".trTop",".edHeader",".rhHeader",".pHead",".wHead",".nHead",".suHeader",".premiereNav","body > header"]);
 if(!h)return;
 h.classList.add("djf-unified-header");
 const b=h.querySelector(".fbBrand,.trILogo,.trBrand,.edBrand,.rhBrand,.pBrand,.wBrand,.nBrand,.suBrand,.premiereBrand")||h.querySelector("a");
 if(b)b.classList.add("djf-unified-brand");
 const n=h.querySelector(".fbNav,.trNav,.premiereNavigation,nav");
 if(n){
   n.classList.add("djf-unified-nav");
   [...n.querySelectorAll("a")].forEach(a=>{
     const href=(a.getAttribute("href")||"").toLowerCase();
     if((sec==="shows"||["fredagsbar","trance","eurodance","retro","morning","popup","weekend","nudisco"].includes(sec)) && /^\/shows\/?$/.test(href)) a.setAttribute("aria-current","page");
     if(sec==="music"&&/^\/music\/?$/.test(href)) a.setAttribute("aria-current","page");
     if(sec==="live"&&href.includes("watch-live")) a.setAttribute("aria-current","page");
   });
 }
}
function markFooter(){
 const f=first([".fbFooter",".trIFooter",".trFooter",".edFooter",".rhFooter",".pFooter",".wFooter",".nFooter",".suFooter",".premiereFooter","body > footer"]);
 if(f)f.classList.add("djf-unified-footer");
}
function markSections(sec){
 if(sec==="home")return;
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
 let i=0;
 for(const s of (map[sec]||[])){
   document.querySelectorAll(s).forEach(el=>{
     el.classList.add("djf-unified-section");
     if(i++%2===0)el.dataset.djfEdge="1";
   });
 }
}
function boot(){
 const sec=section();
 document.documentElement.dataset.djfSection=sec;
 document.documentElement.classList.add("djf-unified");
 if(sec!=="home"){markHeader(sec);markFooter();markSections(sec)}
 window.DJF_UNIFIED_SITE={version:V,section:sec,safeMode:true};
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();