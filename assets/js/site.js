const API_BASE="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
let siteState=null;
let currentLang=localStorage.getItem("djf_lang")||"da";
function t(key){return (siteState&&siteState.i18n&&siteState.i18n[key])||key;}
function applyI18n(){document.querySelectorAll("[data-i18n]").forEach(el=>{el.textContent=t(el.dataset.i18n)});}
async function loadSite(){
  const r=await fetch(API_BASE+"/api/site?ts="+Date.now(),{cache:"no-store"});
  siteState=await r.json();
  if(currentLang !== siteState.language){
    await fetch(API_BASE+"/api/settings",{method:"POST",headers:{"content-type":"application/json","x-admin-token":localStorage.getItem("DJF_ADMIN_TOKEN")||""},body:JSON.stringify({language:currentLang})}).catch(()=>{});
    const rr=await fetch(API_BASE+"/api/site?ts="+Date.now(),{cache:"no-store"});
    siteState=await rr.json();
  }
  const v=siteState.visual||{};
  document.documentElement.style.setProperty("--theme-a",v.primary||"#00e5ff");
  document.documentElement.style.setProperty("--theme-c",v.accent||"#ffd166");
  document.getElementById("activeTheme").textContent=(v.emoji||"")+" "+(v.title||"");
  applyI18n();
  renderCards("topTickerList",(siteState.topbarNews||[]).map(x=>({title:x,body:v.title||""})));
  renderCards("bottomTickerList",(siteState.footerTicker||[]).map(x=>({title:x,body:"Broadcast ticker"})));
  const profile=siteState.profile||{};
  document.getElementById("aboutText").textContent=(profile.about&&profile.about[currentLang])||t("about.body");
  renderCards("modsGrid",(profile.mods||[]).map(m=>({title:m.name,body:m.role})));
  renderCards("showsGrid",[{title:v.title,body:v.mood},...(siteState.core?.schedule||[]).map(s=>({title:s.show||s.title,body:`${s.day||""} ${s.time||""}`}))]);
  renderCards("chartGrid",(siteState.chart?.items||[]).slice(0,10).map(x=>({title:`#${x.rank} ${x.artist}`,body:x.title})));
}
function renderCards(id,items){const el=document.getElementById(id);if(!el)return;el.innerHTML=(items||[]).map(x=>`<div class="card"><b>${x.title||""}</b><p>${x.body||""}</p></div>`).join("");}
document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{currentLang=b.dataset.lang;localStorage.setItem("djf_lang",currentLang);loadSite();});
loadSite();setInterval(loadSite,15000);
