
const API_BASE="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
let state=null, lang=localStorage.getItem("djf_home_lang")||"da";
function tr(k){return (state&&state.i18n&&state.i18n[k])||k;}
function applyI18n(){document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=tr(el.dataset.i18n));}
async function loadHome(){
 try{const r=await fetch(API_BASE+"/api/homepage?ts="+Date.now(),{cache:"no-store"});state=await r.json();}catch(e){state={i18n:{"nav.home": "Forside", "nav.shows": "Shows", "nav.top20": "Top 20", "nav.news": "Nyheder", "nav.community": "Community", "nav.network": "DJ Network", "nav.about": "Om mig", "hero.subtitle": "Music TV fra Danmark", "hero.cta.twitch": "Se mig live på Twitch", "hero.cta.follow": "Følg mig", "hero.live": "Live på Twitch", "hero.offline": "Offline lige nu", "chat.title": "Live chat", "chat.open": "Åbn chat på Twitch", "about.title": "Hvem er DJ FOLSOE?", "about.body": "DJ FOLSOE samler musik, chat, requests og dansk DJ-kultur i et levende broadcast-univers. Kanalen blander radioenergi, TV-grafik og fællesskab på Twitch.", "shows.title": "Shows", "shows.all": "Se alle shows →", "news.title": "Nyheder & opdateringer", "news.all": "Se alle nyheder →", "top20.title": "FOLSOE Top 20", "top20.full": "Se hele listen →", "top20.button": "Se hele Top 20", "community.title": "Fællesskab & stats", "mods.title": "Mod-teamet", "mods.body": "Vores mods holder chatten god, hjælper nye seere og skaber den trygge stemning omkring streamen.", "cta.title": "Klar til næste show?", "cta.body": "Følg kanalen på Twitch, så du aldrig går glip af et show.", "cta.button": "Følg mig på Twitch"},twitch:{description:"DJ FOLSOE er en dansk musikstreamer på Twitch.",isLive:false,viewers:0},shows:[],newsCards:[],top20:[],mods:[]};}
 applyI18n();
 const tw=state.twitch||{}, img=document.getElementById("twitchAvatar"), fb=document.getElementById("avatarFallback");
 if(tw.avatar){img.src=tw.avatar;img.style.display="block";fb.style.display="none";}else{img.style.display="none";fb.style.display="grid";}
 document.getElementById("twitchDescription").textContent=tw.description||state.profile?.description||"DJ FOLSOE";
 document.getElementById("heroLivePill").textContent=tw.isLive?tr("hero.live"):"OFFLINE";
 document.getElementById("heroStatusMini").textContent=tw.isLive?tr("hero.live"):tr("hero.offline");
 document.getElementById("statViews").textContent=formatNum(tw.viewCount||0);
 document.getElementById("statOnline").textContent=tw.viewers||0;
 document.getElementById("statFollowers").textContent=(state.theme&&state.profile)? "870":"870";
 renderShows(state.shows||[]);renderNews(state.newsCards||[]);renderChart(state.top20||state.chart?.items||[]);renderMods(state.mods||[]);
}
function formatNum(n){n=Number(n||0);if(n>=1000000)return(n/1000000).toFixed(1)+"M";if(n>=1000)return(n/1000).toFixed(1)+"K";return String(n);}
function renderShows(items){document.getElementById("showsGrid").innerHTML=(items||[]).slice(0,6).map(x=>`<article class="showCard"><div class="showPoster">${(x.title||"SHOW").replace(" ","<br>")}</div><div class="showBody"><b>${x.title||""}</b><p>${x.time||""}</p><p>${x.body||""}</p></div></article>`).join("");}
function renderNews(items){const icons=["📺","🏆","🎵","💜","👥","💬"];document.getElementById("newsGrid").innerHTML=(items||[]).slice(0,6).map((n,i)=>`<article class="newsCard"><div class="newsIcon">${icons[i%icons.length]}</div><span>${n.type||"News"}</span><b>${n.title||""}</b><p>${n.body||""}</p></article>`).join("");}
function renderChart(items){document.getElementById("chartGrid").innerHTML=(items||[]).slice(0,10).map(x=>`<article class="chartItem"><div class="rank">${String(x.rank||"").padStart(2,"0")}</div><div class="cover"></div><div><b>${x.artist||""}</b><p>${x.title||""}</p></div></article>`).join("");}
function renderMods(items){document.getElementById("modsGrid").innerHTML=(items||[]).slice(0,5).map(m=>`<article class="modCard"><div class="modAvatar"></div><b>${m.name||""}</b><p>${m.role||""}</p></article>`).join("");}
function toggleChart(){document.getElementById("chartGrid").classList.toggle("open");}
document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem("djf_home_lang",lang);loadHome();});
loadHome();setInterval(loadHome,30000);
