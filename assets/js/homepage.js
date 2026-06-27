const API_BASE="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
let lang=localStorage.getItem("djf_home_lang")||"da";
let state=null;
function tr(k){return (state&&state.i18n&&state.i18n[k])||k;}
function applyI18n(){document.querySelectorAll("[data-i18n]").forEach(el=>{el.textContent=tr(el.dataset.i18n)});}
function card(title,body,cls="card"){return `<article class="${cls}"><b>${title||""}</b><p>${body||""}</p></article>`;}
async function loadHome(){
  try{
    const r=await fetch(API_BASE+"/api/homepage?lang="+lang+"&ts="+Date.now(),{cache:"no-store"});
    state=await r.json();
  }catch(e){
    state={i18n:{},twitch:{displayName:"DJ FOLSOE",description:"Danish music streamer on Twitch with DJ shows, requests and community.",avatar:"",isLive:false},shows:[],newsCards:[],chart:{items:[]},mods:[]};
  }
  applyI18n();
  const tw=state.twitch||{};
  const img=document.getElementById("twitchAvatar"), fallback=document.getElementById("avatarFallback");
  if(tw.avatar){img.src=tw.avatar;img.style.display="block";fallback.style.display="none";} else {img.style.display="none";fallback.style.display="grid";}
  document.getElementById("twitchStatusText").textContent=tw.isLive ? `${tr("hero.status.live")} · ${tw.liveGame||"Music"} · ${tw.viewers||0} viewers` : tr("hero.status.offline");
  document.getElementById("twitchDescription").textContent=tw.description || state.profile?.about?.[lang] || tr("about.body");
  const badge=document.getElementById("liveBadge"); badge.textContent=tw.isLive ? tr("hero.status.live") : tr("hero.status.offline"); badge.classList.toggle("live",!!tw.isLive);
  document.getElementById("profileFacts").innerHTML=[
    ["Twitch", tw.displayName||"DJ FOLSOE"],["Login", tw.login||"djfolsoe"],["Status", tw.isLive?tr("hero.status.live"):tr("hero.status.offline")],["Genres",(state.profile?.genres||[]).join(" · ")]
  ].map(x=>`<div class="fact"><b>${x[0]}</b><p>${x[1]}</p></div>`).join("");
  document.getElementById("showsGrid").innerHTML=(state.shows||[]).map(s=>card(s.title,s.body,"showCard")).join("");
  document.getElementById("newsGrid").innerHTML=(state.newsCards||[]).map(n=>`<article class="newsCard"><span>${n.type||"News"}</span><b>${n.title||""}</b><p>${n.theme&&n.theme!=="all"?"Theme: "+n.theme:"DJ FOLSOE Network"}</p></article>`).join("");
  document.getElementById("chartGrid").innerHTML=(state.chart?.items||[]).map(x=>`<article class="chartItem"><div class="rank">${x.rank||""}</div><div><b>${x.artist||""}</b><p>${x.title||""}</p></div></article>`).join("");
  document.getElementById("modsGrid").innerHTML=(state.mods||[]).map(m=>card(m.name,m.role,"modCard")).join("");
}
function toggleChart(){document.getElementById("chartGrid").classList.toggle("open");}
document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem("djf_home_lang",lang);loadHome();});
loadHome(); setInterval(loadHome,30000);
