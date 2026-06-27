const API_BASE="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
let state=null;
let lang=localStorage.getItem("djf_home_lang")||"da";

function q(id){return document.getElementById(id);}
function formatNum(n){n=Number(n||0);if(n>=1000000)return(n/1000000).toFixed(1)+"M";if(n>=1000)return(n/1000).toFixed(1)+"K";return String(n);}
function timeLabel(t){if(!t)return "klar"; const d=new Date(t); if(isNaN(d))return String(t); return d.toLocaleTimeString("da-DK",{hour:"2-digit",minute:"2-digit"});}
function setText(id,v){const el=q(id); if(el)el.textContent=v??"";}

async function loadHome(){
  try{
    const r=await fetch(API_BASE+"/api/homepage?ts="+Date.now(),{cache:"no-store"});
    state=await r.json();
  }catch(e){
    state={twitch:{displayName:"DJ FOLSOE",description:"DJ FOLSOE er en dansk musikstreamer på Twitch.",isLive:false,viewers:0,followers:870,viewCount:0,liveTitle:"DJ FOLSOE LIVE",category:"Music"},profile:{mods:[]},shows:[],newsCards:[],top20:[],requests:[]};
  }
  render();
}

function render(){
  const tw=state.twitch||state.hero||{};
  const live=!!tw.isLive;
  document.body.classList.toggle("isOffline",!live);

  const img=q("twitchAvatar"), fb=q("avatarFallback");
  if(tw.avatar){img.src=tw.avatar;img.style.display="block";fb.style.display="none";}else{img.style.display="none";fb.style.display="grid";}

  const banner=q("heroBanner");
  if(tw.banner) banner.style.backgroundImage=`linear-gradient(135deg,rgba(5,7,18,.72),rgba(5,7,18,.88)), url('${tw.banner}')`;

  setText("heroLivePill", live ? "LIVE" : "OFFLINE");
  setText("heroStatusMini", live ? "Live på Twitch" : "Offline lige nu");
  setText("navLive", live ? "LIVE" : "OFFLINE");
  setText("twitchDescription", tw.description || state.profile?.description || "DJ FOLSOE");
  setText("streamTitle", tw.liveTitle || "DJ FOLSOE LIVE");
  setText("streamCategory", tw.category || tw.game || "Music");

  setText("sideStatus", live ? "Live" : "Offline");
  setText("sideViewers", formatNum(tw.viewers||0));
  setText("sideFollowers", formatNum(tw.followers||870));
  setText("sideCategory", tw.category||tw.game||"Music");
  setText("sideTitle", tw.liveTitle||"DJ FOLSOE LIVE");

  setText("statFollowers", formatNum(tw.followers||870));
  setText("statOnline", formatNum(tw.viewers||0));
  setText("statViews", formatNum(tw.viewCount||0));
  setText("statLive", live ? "Live" : "Offline");
  setText("statCategory", tw.category||tw.game||"Music");

  setText("aboutText", state.about?.community || "DJ FOLSOE samler musik, chat, requests og dansk DJ-kultur i et levende broadcast-univers.");
  setText("aboutMusic", state.about?.music || "Trance, Eurodance, Retro, EDM, Pop, Nu-Disco");
  setText("aboutShows", state.about?.shows || "Live DJ-shows, chart countdowns og temastreams.");
  setText("aboutRequests", state.about?.requests || "!ønske / !request / !Wunsch");
  setText("aboutCommunity", state.about?.community || "Chat, mods, emotes og dansk DJ-kultur.");

  renderShows(state.shows||[]);
  renderRequests(state.requests||[]);
  renderNews(state.newsCards||[], tw);
  renderChart(state.top20||state.chart?.items||[]);
  renderMods(state.mods||state.profile?.mods||[]);
}

function renderShows(items){
  const wanted=["Trance Tuesday","FOLSOE Top 20","Fredagsbar","Retro Hits","Good Morning Twitch","PopUp","Weekend"];
  let all=[...items];
  wanted.forEach(title=>{if(!all.some(x=>String(x.title||"").toLowerCase()===title.toLowerCase())) all.push({title, time:"", body:"Broadcast Cloud show"});});
  q("showsGrid").innerHTML=all.slice(0,7).map(x=>`<article class="showCard"><div class="showPoster">${String(x.title||"SHOW").replace(" ","<br>")}</div><div class="showBody"><b>${x.title||""}</b><p>${x.time||""}</p><p>${x.body||""}</p></div></article>`).join("");
}

function renderRequests(items){
  const fallback=[
    {user:"Chat",song:"Skriv !ønske Kunstner - Titel",time:"klar"},
    {user:"Chat",song:"Use !request Artist - Title",time:"ready"},
    {user:"Chat",song:"Nutze !Wunsch Künstler - Titel",time:"bereit"}
  ];
  q("requestsGrid").innerHTML=(items.length?items:fallback).slice(0,3).map(x=>`<article class="requestCard"><span>${timeLabel(x.time)}</span><b>${x.song||x.text||""}</b><p>${x.user||"Twitch chat"}</p></article>`).join("");
}

function renderNews(items,tw){
  const base=[
    {type:"Seneste show",title:"Seneste show",body:tw.liveTitle||"DJ FOLSOE Broadcast Cloud"},
    {type:"Top20 nyt",title:"FOLSOE Top 20",body:"Se ugens chart og countdown."},
    {type:"Requests",title:"Musikønsker er åbne",body:"Brug !ønske / !request / !Wunsch."},
    {type:"Community",title:"Chatten er hjertet",body:"Emotes, mods og god stemning."},
    {type:"DJ Network",title:"Danske DJ streams",body:"Community, raids og support."},
    {type:"Twitch updates",title:tw.isLive?"Live nu":"Twitch status",body:tw.category||"Music"}
  ];
  const merged=[...base,...items].slice(0,6);
  const icons=["📺","🏆","🎵","💜","👥","💬"];
  q("newsGrid").innerHTML=merged.map((n,i)=>`<article class="newsCard"><div class="newsIcon">${icons[i%icons.length]}</div><span>${n.type||"News"}</span><b>${n.title||""}</b><p>${n.body||""}</p></article>`).join("");
}

function renderChart(items){
  q("chartGrid").innerHTML=(items||[]).slice(0,20).map(x=>`<article class="chartItem"><div class="rank">${String(x.rank||"").padStart(2,"0")}</div><div class="cover"></div><div><b>${x.artist||""}</b><p>${x.title||""}</p></div></article>`).join("");
}

function renderMods(items){
  q("modsGrid").innerHTML=(items||[]).slice(0,8).map(m=>`<article class="modCard"><div class="modAvatar"></div><b>${m.name||""}</b><p>${m.role||""}</p></article>`).join("");
}

function toggleChart(){q("chartGrid").classList.toggle("open");}
document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem("djf_home_lang",lang);loadHome();});
loadHome(); setInterval(loadHome,30000);
