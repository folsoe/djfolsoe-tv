const STORAGE_KEY = "DJF_V818_SITE_DATA";

async function loadData(){
  const local = localStorage.getItem(STORAGE_KEY);
  if(local){ try{return JSON.parse(local)}catch(e){} }
  const res = await fetch("assets/data/site-data.json?v=8180",{cache:"no-store"});
  return await res.json();
}
function saveData(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function resetData(){ localStorage.removeItem(STORAGE_KEY); location.reload(); }
function el(id){ return document.getElementById(id); }
function html(id, value){ const n=el(id); if(n) n.innerHTML=value || ""; }
function card(x){return `<article class="card"><div class="icon">${x.icon||"✦"}</div><span>${x.tag||x.category||x.role||x.label||""}</span><h3>${x.title||x.name||x.value||""}</h3><p>${x.text||x.note||""}</p></article>`}
function pct(c,t){return Math.max(0,Math.min(100,Math.round(Number(c||0)/Number(t||1)*100)))}
function dateLabel(x){return [x.date,[x.start,x.end].filter(Boolean).join("–")].filter(Boolean).join(" · ")}

function render(data){
  const shows = (data.nextShows||[]).filter(x=>x.active!==false).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
  const next = shows[0] || {};
  const hero = data.hero || {};
  const subtitle = el("heroSubtitle"); if(subtitle) subtitle.textContent = hero.subtitle || subtitle.textContent;

  html("nextShowContent", `<article class="nextCard"><div><span>NÆSTE SHOW</span><h3>${next.title||"DJ FOLSOE LIVE"}</h3><p><b>${next.show||""}</b> · ${dateLabel(next)}</p><p>${next.description||"Hold øje med folsoetv.dk og Twitch."}</p></div><aside class="badgeList"><b>${next.theme||"MUSIC TV"}</b><b>${next.featured?"FEATURED":"COMING UP"}</b><b>folsoetv.dk</b></aside></article>`);
  html("aboutText", data.about?.body || "");
  html("aboutCards", (data.about?.cards||[]).map(card).join(""));
  html("modsGrid", (data.mods||[]).filter(x=>x.active!==false).map(card).join(""));
  html("showsGrid", (data.shows||[]).map(card).join(""));
  html("top20Grid", (data.top20||[]).map(x=>`<article class="chartItem"><div class="rank">#${x.rank}</div><div><h3>${x.artist}</h3><p>${x.title}</p></div><span>${x.genre||""}</span></article>`).join(""));
  html("discoveryGrid", (data.discovery||[]).map(card).join(""));
  html("requestsGrid", (data.requests||[]).map(x=>card({tag:x.lang,title:x.title,text:x.text,icon:"🎧"})).join(""));
  html("communityGrid", (data.community||[]).map(x=>card({label:x.label,title:x.value,text:x.text,icon:"💜"})).join(""));
  html("journeyGrid", (data.journey||[]).map(x=>`<article class="card"><span>${x.label}</span><h3>${x.current} / ${x.target}</h3><div class="bar"><i style="width:${pct(x.current,x.target)}%"></i></div><p>${x.text}</p></article>`).join(""));
  html("hofGrid", (data.hallOfFame||[]).map(card).join(""));
  html("networkGrid", (data.djNetwork||[]).map(card).join(""));
  html("comingGrid", shows.slice(1,4).map(x=>card({tag:x.date,title:x.title,text:`${x.start}–${x.end} · ${x.description}`,icon:"📺"})).join(""));
}

document.addEventListener("DOMContentLoaded", async()=>{ render(await loadData()); });
window.DJF = {loadData, saveData, resetData, render, STORAGE_KEY};

// ===== V818.1 Language Pack =====
const DJF_LANG_KEY="DJF_V818_LANG";
const DJF_TRANSLATIONS={
 da:{next:"Næste show",about:"Hvem er DJ FOLSOE?",mods:"Mod-teamet",shows:"Shows",top20:"FOLSOE Top 20",discovery:"Music Discovery Universe",requests:"Live Request Wall",community:"Community Love",journey:"Viewer Journey",hof:"Hall Of Fame",network:"DJ Network",coming:"Coming Up"},
 en:{next:"Next Show",about:"Who is DJ FOLSOE?",mods:"Mod Team",shows:"Shows",top20:"FOLSOE Top 20",discovery:"Music Discovery Universe",requests:"Live Request Wall",community:"Community Love",journey:"Viewer Journey",hof:"Hall Of Fame",network:"DJ Network",coming:"Coming Up"},
 de:{next:"Nächste Show",about:"Wer ist DJ FOLSOE?",mods:"Mod-Team",shows:"Shows",top20:"FOLSOE Top 20",discovery:"Music Discovery Universe",requests:"Live Request Wall",community:"Community Love",journey:"Viewer Journey",hof:"Hall Of Fame",network:"DJ Network",coming:"Demnächst"}
};
function applyLanguage(lang){const t=DJF_TRANSLATIONS[lang]||DJF_TRANSLATIONS.da;document.documentElement.lang=lang;document.querySelectorAll("[data-i18n]").forEach(e=>{const k=e.dataset.i18n;if(t[k])e.textContent=t[k]});document.querySelectorAll(".langs button").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang))}
function setLanguage(lang){localStorage.setItem(DJF_LANG_KEY,lang);applyLanguage(lang)}
document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(".langs button").forEach(b=>b.addEventListener("click",()=>setLanguage(b.dataset.lang||"da")));applyLanguage(localStorage.getItem(DJF_LANG_KEY)||"da")});
