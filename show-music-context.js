(() => {
"use strict";

const DATA_URL = "/assets/data/show-music-context.json";
const POLL_MS = 2500;
let feed = null;
let lastId = "";
let timer = null;

const norm = v => String(v || "")
  .toLowerCase()
  .replace(/&/g,"and")
  .replace(/[_–—-]+/g," ")
  .replace(/\s+/g," ")
  .trim();

function text(id){
  const el=document.getElementById(id);
  return el ? (el.textContent || "").trim() : "";
}

function visibleCurrentSignal(){
  return [
    text("currentShow"),
    text("uxThemeName"),
    text("premiereHeroTheme"),
    text("streamTitle"),
    document.body?.className || "",
    document.documentElement?.dataset?.theme || ""
  ].filter(Boolean).join(" | ");
}

function findShow(signal){
  if(!feed) return null;
  const n=norm(signal);
  const shows=Object.values(feed.shows || {});
  // Exact / strong aliases first.
  for(const s of shows){
    for(const a of (s.aliases || [])){
      const na=norm(a);
      if(na && n.includes(na)) return s;
    }
  }
  return feed.shows?.[feed.defaultShow] || shows[0] || null;
}

function replaceText(el, value){
  if(!el || !value) return;
  el.textContent=value;
}

function replaceHref(el, value){
  if(!el || !value) return;
  el.setAttribute("href",value);
}

function updateHomepage(show){
  if(!show) return;

  // Existing "Selected for the current sound" section.
  replaceText(document.getElementById("musicNewsTitle"), `${show.showTitle} · music stories`);
  replaceText(document.getElementById("musicNewsTheme"), show.newsTheme || show.musicTitle);

  // Existing hero facts/sound labels: text only, no structural change.
  const nextTheme=document.getElementById("nextTheme");
  if(nextTheme && /music tv|checking|theme/i.test(nextTheme.textContent || "")){
    replaceText(nextTheme, show.musicTitle);
  }

  // Public homepage has an "ON THE CHANNEL / The sound and story behind the show" section.
  // Locate by heading text instead of depending on a specific version of index.html.
  const headings=[...document.querySelectorAll("h1,h2,h3")];
  const soundHeading=headings.find(h=>/sound and story behind the show/i.test(h.textContent || ""));
  if(soundHeading){
    replaceText(soundHeading, `${show.showTitle} · the sound behind the show`);
    const section=soundHeading.closest("section") || soundHeading.parentElement?.parentElement;
    if(section){
      const p=[...section.querySelectorAll("p")].find(x=>x !== soundHeading);
      if(p) replaceText(p, show.story);
      const a=section.querySelector("a[href]");
      if(a){
        replaceHref(a, show.musicUrl);
        if(/watch the channel|open music|explore/i.test(a.textContent || "")){
          replaceText(a, `EXPLORE ${show.musicTitle.toUpperCase()} →`);
        }
      }
    }
  }

  // Existing Music Guide: mark the matching existing genre card as current by text only.
  // No classes/CSS/layout are added.
  const musicLinks=[...document.querySelectorAll('a[href*="/music/"]')];
  musicLinks.forEach(a=>{
    const href=(a.getAttribute("href") || "").replace(location.origin,"");
    const isCurrent = show.musicUrl !== "/music/" &&
      (href === show.musicUrl || href.startsWith(show.musicUrl));
    if(isCurrent){
      a.setAttribute("aria-current","true");
      a.setAttribute("title",`Current show sound: ${show.short}`);
    }else{
      a.removeAttribute("aria-current");
    }
  });

  document.documentElement.dataset.currentMusicShow=show.id;
  window.DJF_CURRENT_MUSIC_CONTEXT=show;

  window.dispatchEvent(new CustomEvent("djf:music-context",{
    detail:{show}
  }));
}

function updateMusicPage(){
  if(!feed) return;

  // Keep layout exactly as-is. We only refresh descriptions and metadata
  // inside links/cards that already exist.
  const map=[
    ["eurodance","/music/eurodance/"],
    ["trance","/music/trance/"],
    ["retro","/music/retro/"],
    ["nudisco","/music/nu-disco/"]
  ];

  for(const [id,href] of map){
    const s=feed.shows[id];
    if(!s) continue;
    const links=[...document.querySelectorAll("a[href]")].filter(a=>{
      const h=(a.getAttribute("href")||"").replace(location.origin,"");
      return h===href || h===href.replace(/\/$/,"") || h.startsWith(href);
    });

    links.forEach(a=>{
      a.setAttribute("title",s.story);
      a.dataset.showMusicId=id;

      // Replace an existing descriptive <p>/<small>, never create a new element.
      const desc=a.querySelector("p,small");
      if(desc && desc.textContent.trim().length > 10){
        replaceText(desc,s.short);
      }
    });
  }

  window.DJF_SHOW_MUSIC_FEED=feed;
}

function tick(){
  if(!feed) return;
  const path=location.pathname.replace(/\/+$/,"/");

  if(path==="/music/"){
    updateMusicPage();
    return;
  }

  if(path==="/" || /index\.html$/i.test(path)){
    const show=findShow(visibleCurrentSignal());
    if(show && show.id!==lastId){
      lastId=show.id;
      updateHomepage(show);
    }
  }
}

async function boot(){
  try{
    const r=await fetch(`${DATA_URL}?v=27000`,{cache:"no-store"});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    feed=await r.json();
    window.DJF_SHOW_MUSIC_FEED=feed;
    tick();

    // The current show is filled by existing homepage scripts after page load.
    // Watch for that change without touching their code.
    const obs=new MutationObserver(()=>tick());
    obs.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class","data-theme"]});

    timer=setInterval(tick,POLL_MS);
  }catch(err){
    console.warn("[DJF Music Context] feed unavailable",err);
  }
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",boot,{once:true});
}else{
  boot();
}
})();