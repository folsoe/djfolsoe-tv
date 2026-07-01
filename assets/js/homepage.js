
/* V816.20.1.9 - Website English primary guard */
function englishSiteText(s){
  return String(s||"")
    .replace(/WHO IS DJ FOLSOE\?/gi,"WHO IS DJ FOLSOE?")
    .replace(/NEXT SHOW/gi,"NEXT SHOW")
    .replace(/KLASSIKERE DER ALDRIG DØR/gi,"CLASSICS THAT NEVER DIE")
    .replace(/REQUESTS/gi,"REQUESTS")
    .replace(/FOLLOW PÅ TWITCH/gi,"FOLLOW ON TWITCH")
    .replace(/WATCH ON TWITCH/gi,"WATCH ON TWITCH")
    .replace(/SEE FULL CHART/gi,"SEE FULL CHART")
    .replace(/SEE FULL TOP 20/gi,"SEE FULL TOP 20");
}

const API_BASE="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
let state=null;
let lang="en";

const I18N={en:{ready:"Ready",showDefault:"Live music show",hero:{live:"DJ FOLSOE is live now.",offline:"DJ FOLSOE is offline right now."}}};

function t(key){
  const parts=String(key).split(".");
  let cur=(I18N[lang]||I18N.en||{});
  for(const p of parts){ cur=cur&&cur[p]; }
  return cur || key;
}
function q(id){return document.getElementById(id);}
function djfSafeHtml(id, html){
  const el = document.getElementById(id);
  if(!el) { console.warn("Missing element:", id); return false; }
  el.innerHTML = html;
  return true;
}
function djfSafeText(id, text){
  const el = document.getElementById(id);
  if(!el) { console.warn("Missing element:", id); return false; }
  el.textContent = text ?? "";
  return true;
}
function formatNum(n){n=Number(n||0);if(n>=1000000)return(n/1000000).toFixed(1)+"M";if(n>=1000)return(n/1000).toFixed(1)+"K";return String(n);}
function timeLabel(v){if(!v)return t("ready"); const d=new Date(v); if(isNaN(d))return String(v); return d.toLocaleTimeString(lang==="de"?"de-DE":lang==="en"?"en-GB":"da-DK",{hour:"2-digit",minute:"2-digit"});}
function setText(id,v){const el=q(id); if(el)el.textContent=v??"";}
function applyStaticLanguage(){
  document.documentElement.lang=lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>{el.textContent=t(el.dataset.i18n);});
  document.querySelectorAll("[data-lang]").forEach(btn=>btn.classList.toggle("active",btn.dataset.lang===lang));
}

function applyBroadcastTheme(){
  const key = String(state?.activeTheme || state?.theme?.activeTheme || state?.theme?.theme?.key || "weekend").toLowerCase();
  document.body.className = (document.body.className||"").replace(/\btheme-[a-z0-9_-]+\b/g,"").trim();
  document.body.classList.add("theme-"+key);
  const bg = state?.theme?.theme?.bgImage || ("https://folsoetv.dk/themes/"+key+".png");
  document.documentElement.style.setProperty("--theme-bg", `url("${bg}")`);
}

async function loadHome(){
  try{
    const r=await fetch(API_BASE+"/api/homepage?lang="+lang+"&ts="+Date.now(),{cache:"no-store"});
    state=await r.json();
  }catch(e){
    state={twitch:{displayName:"DJ FOLSOE",description:"DJ FOLSOE is a Danish music streamer on Twitch.",isLive:false,viewers:0,followers:870,viewCount:0,liveTitle:"DJ FOLSOE LIVE",category:"Music"},profile:{mods:[]},shows:[],newsCards:[],top20:[],requests:[]};
  }
  applyBroadcastTheme();
  render();
  applySEO();
}

function render(){
  ensureCommunityDom();
  applyStaticLanguage();
  const tw=state.twitch||state.hero||{};
  const live=!!tw.isLive;
  document.body.classList.toggle("isOffline",!live);

  const img=q("twitchAvatar"), fb=q("avatarFallback");
  if(tw.avatar){img.src=tw.avatar;img.style.display="block";fb.style.display="none";}else{img.style.display="none";fb.style.display="grid";}

  const banner=q("heroBanner");
  if(tw.banner) banner.style.backgroundImage=`linear-gradient(135deg,rgba(5,7,18,.72),rgba(5,7,18,.88)), url('${tw.banner}')`;

  setText("heroLivePill", live ? t("live").toUpperCase() : t("offline").toUpperCase());
  setText("heroStatusMini", live ? t("hero.live") : t("hero.offline"));
  setText("navLive", live ? "LIVE" : t("offline").toUpperCase());
  setText("twitchDescription", tw.description || state.profile?.description || "DJ FOLSOE");
  setText("streamTitle", tw.liveTitle || "DJ FOLSOE LIVE");
  setText("streamCategory", tw.category || tw.game || "Music");

  setText("sideStatus", live ? t("live") : t("offline"));
  setText("sideViewers", formatNum(tw.viewers||0));
  setText("sideFollowers", formatNum(tw.followers||870));
  setText("sideCategory", tw.category||tw.game||"Music");
  setText("sideTitle", tw.liveTitle||"DJ FOLSOE LIVE");

  setText("statFollowers", formatNum(tw.followers||870));
  setText("statOnline", formatNum(tw.viewers||0));
  setText("statViews", formatNum(tw.viewCount||0));
  setText("statLive", live ? t("live") : t("offline"));
  setText("statCategory", tw.category||tw.game||"Music");

  setText("aboutText", t("about.main"));
  setText("aboutMusic", t("about.music"));
  setText("aboutShows", t("about.shows"));
  setText("aboutRequests", t("about.requests"));
  setText("aboutCommunity", t("about.community"));

  const showLink=document.querySelector("#shows .panelHead a"); if(showLink) showLink.textContent=t("shows.link");
  const reqLink=document.querySelector("#requests .panelHead a"); if(reqLink) reqLink.textContent=t("requests.link");
  const newsLink=document.querySelector("#news .panelHead a"); if(newsLink) newsLink.textContent=t("news.link");
  const topLink=document.querySelector("#top20 .panelHead a"); if(topLink) topLink.textContent=t("top20.link");

  renderShows(state.shows||[]);
  renderRequests(state.requests||[]);
  renderNews(state.newsCards||[], tw);
  renderChart(state.top20||state.chart?.items||[]);
  renderDiscovery(state.discoveryPicks||[]);
  renderMods(state.mods||state.profile?.mods||[]);
  renderCommunityWall(state.communityWall||[]);
  renderNextShow(state.nextShow||{});
  applyShowIdentityTheme();
}

function showKey(title){
  const s=String(title||"").toLowerCase();
  if(s.includes("trance")) return "trance";
  if(s.includes("top")) return "top20";
  if(s.includes("fredagsbar")) return "fredagsbar";
  if(s.includes("retro")) return "retro";
  if(s.includes("morning")) return "morning";
  if(s.includes("popup")) return "popup";
  if(s.includes("weekend")) return "weekend";
  return "default";
}
function showDefault(title){
  const key=showKey(title);
  const da={
    trance:{time:"Tuesday 18:30",body:"Store melodier, lys, energi og trance-fællesskab."},
    top20:{time:"Thursday 18:30",body:"The biggest tracks of the week i FOLSOE countdown."},
    fredagsbar:{time:"Fredag 20:00",body:"Fest, grin, requests og weekendstemning."},
    retro:{time:"Søndag 20:00",body:"Classics, nostalgia and timeless hits med nyt liv."},
    morning:{time:"07:00",body:"Kaffe, god energi og den bedste start på dagen."},
    popup:{time:"Surprise",body:"Når du mindst venter det — så går vi live."},
    weekend:{time:"Weekend",body:"Eurodance, summer, community og maksimal energi."}
  };
  const en={
    trance:{time:"Tuesday 18:30",body:"Big melodies, lights, energy and trance community."},
    top20:{time:"Thursday 18:30",body:"The biggest tracks of the week in the FOLSOE countdown."},
    fredagsbar:{time:"Friday 20:00",body:"Party, laughs, requests and weekend vibes."},
    retro:{time:"Sunday 20:00",body:"Classics, nostalgia and old hits brought back to life."},
    morning:{time:"07:00",body:"Coffee, good energy and the best start of the day."},
    popup:{time:"Surprise",body:"When you least expect it — we go live."},
    weekend:{time:"Weekend",body:"Eurodance, summer, community and maximum energy."}
  };
  const de={
    trance:{time:"Dienstag 18:30",body:"Große Melodien, Licht, Energie und Trance-Community."},
    top20:{time:"Donnerstag 18:30",body:"Die größten Tracks der Woche im FOLSOE Countdown."},
    fredagsbar:{time:"Freitag 20:00",body:"Party, Lachen, Wünsche und Wochenendstimmung."},
    retro:{time:"Sonntag 20:00",body:"Klassiker, Nostalgie und alte Hits mit neuem Leben."},
    morning:{time:"07:00",body:"Kaffee, gute Energie und der beste Start in den Tag."},
    popup:{time:"Überraschung",body:"Wenn du es am wenigsten erwartest — gehen wir live."},
    weekend:{time:"Wochenende",body:"Eurodance, Summer, Community und maximale Energie."}
  };
  return (lang==="de"?de:lang==="en"?en:da)[key] || {time:"",body:t("showDefault")};
}
function renderShows(items){
  const wanted=["Trance Tuesday","FOLSOE Top 20","Fredagsbar","Retro Hits","Good Morning Twitch","PopUp","Weekend"];
  let all=[...items];
  wanted.forEach(title=>{if(!all.some(x=>String(x.title||"").toLowerCase()===title.toLowerCase())) all.push({title});});
  const visuals=state.showVisuals||{};
  q("showsGrid").innerHTML=all.slice(0,7).map(x=>{
    const key=showKey(x.title);
    const def=showDefault(x.title);
    const visual=visuals[key]||{};
    const title=String(x.title||"SHOW");
    const poster=visual.posterText||title;
    const style=visual.gradient?` style="--poster:${visual.gradient}"`:"";
    return `<article class="showCard show-${key}"${style}><div class="showPoster"><small>${visual.icon||""} ${visual.tag||""}</small><span>${poster.replace(" ","<br>")}</span></div><div class="showBody"><b>${title}</b><p>${x.time||def.time}</p><p>${x.body||def.body}</p></div></article>`;
  }).join("");
}

function renderRequests(items){
  const fallback=[
    {user:"Chat",song:"Use !request Artist - Title",time:t("ready"),language:lang,show:"DJ FOLSOE LIVE"},
    {user:"Chat",song:"!request Artist - Title",time:t("ready"),language:"en",show:"DJ FOLSOE LIVE"},
    {user:"Chat",song:"!Wunsch Künstler - Title",time:t("ready"),language:"de",show:"DJ FOLSOE LIVE"}
  ];
  const used=(items&&items.length?items:fallback).slice(0,3);
  djfSafeHtml("requestsGrid", used.map(x=>`<article class="requestCard"><span>${timeLabel(x.time)} · ${(x.language||"").toUpperCase()}</span><b>${x.song||x.text||""}</b><p>${x.user||"Twitch chat"} · ${x.show||"DJ FOLSOE LIVE"}</p>${x.pinned?'<small>PINNED</small>':''}</article>`).join(""));
  renderRequestStats(state.requestStats||{});
}
function renderRequestStats(stats){
  const el=q("requestStatsGrid"); if(!el)return;
  const cards=[
    {label:"Today",value:stats.today||0},
    {label:"Total",value:stats.total||0},
    {label:"Top artist",value:stats.topArtist?.name||"-"},
    {label:"Top requester",value:stats.topRequester?.name||"-"}
  ];
  el.innerHTML=cards.map(c=>`<article class="requestStatCard"><span>${c.label}</span><b>${c.value}</b></article>`).join("");
}

function renderNews(items,tw){
  const base=[
    {type:"Latest show",title:tw.liveTitle||"DJ FOLSOE Broadcast Cloud",body:tw.isLive?t("hero.live"):t("hero.offline")},
    {type:"Top20 update",title:"FOLSOE Top 20",body:"See the weekly chart."},
    {type:"Requests",title:"Song requests are open",body:"!request"},
    {type:"Community",title:"Chat is the heart",body:"Emotes, mods and good vibes."},
    {type:"Twitch",title:"Twitch updates",body:tw.category||"Music"}
  ];
  const merged=[...base,...items].slice(0,6);
  const icons=["📺","🏆","🎵","💜","💬","📡"];
  q("newsGrid").innerHTML=merged.map((n,i)=>`<article class="newsCard"><div class="newsIcon">${icons[i%icons.length]}</div><span>${n.type||"News"}</span><b>${n.title||""}</b><p>${n.body||""}</p></article>`).join("");
}

function renderChart(items){
  q("chartGrid").innerHTML=(items||[]).slice(0,20).map(x=>`<article class="chartItem"><div class="rank">${String(x.rank||"").padStart(2,"0")}</div><div class="cover"></div><div><b>${x.artist||""}</b><p>${x.title||""}</p></div></article>`).join("");
}

function renderDiscovery(items){
  const el=q("discoveryGrid");
  if(!el)return;
  const fallback=[
    {artist:"New artist",title:"New track",genre:"Discovery",note:"New music discoveries."},
    {artist:"Upcoming",title:"Fresh sound",genre:"New Music",note:"Could become part of the next chart."},
    {artist:"FOLSOE Pick",title:"Lyt med",genre:"Broadcast",note:"A track that deserves extra love."}
  ];
  el.innerHTML=(items&&items.length?items:fallback).slice(0,3).map((x,i)=>`<article class="discoveryCard"><span>DISCOVERY ${i+1}</span><b>${x.artist||""}</b><h3>${x.title||""}</h3><p>${x.genre||""}</p><small>${x.note||"New music discoveries."}</small></article>`).join("");
}


function renderMods(items){
  djfSafeHtml("modsGrid", (items||[]).slice(0,8).map(m=>`<article class="modCard modTwitchCard">${m.avatar?`<img class="modTwitchAvatar" src="${m.avatar}" alt="${m.displayName||m.name||m.login}">`:`<div class="modAvatar"></div>`}<b>${m.displayName||m.name||m.login||""}</b><p>${m.role||""}</p><small>${m.description||""}</small><span class="${m.isLive?"modLive":"modOffline"}">${m.isLive?"● Live":"○ Offline"}</span></article>`).join(""));
}

function toggleChart(){q("chartGrid").classList.toggle("open");}
document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem("djf_home_lang",lang);render();loadHome();});
loadHome(); setInterval(loadHome,30000);

function communityIcon(type){
  const map={follower:"💜",sub:"⭐",raid:"🚀",topRequester:"🎵",memberOfMonth:"🏆"};
  return map[type]||"❤️";
}
function renderCommunityWall(items){
  const el=q("communityWallGrid"); if(!el)return;
  const twitchCommunity = state?.twitchCommunity || {};
  const manual = (items && items.length ? items : []).filter(x=>x && x.active !== false);

  function manualBy(key, fallbackLabel, fallbackValue){
    return manual.find(x => String(x.key||x.type||"").toLowerCase() === String(key).toLowerCase()) || {label:fallbackLabel,value:fallbackValue,active:true};
  }

  const follower = twitchCommunity.latestFollower || {};
  const sub = twitchCommunity.latestSub || {};
  const raid = twitchCommunity.latestRaid || {};

  const used=[
    {
      type:"latestFollower",
      label:"Latest follower",
      displayName:follower.displayName || follower.userName || manualBy("latestFollower","Latest follower","Twitch community").value || "Twitch community",
      value:follower.followedAt ? ("Followed " + new Date(follower.followedAt).toLocaleDateString("da-DK")) : "Loaded from Twitch when token/scope allows it",
      avatar:follower.avatar || "",
      isLive:false
    },
    {
      type:"latestSub",
      label:"Latest sub",
      displayName:sub.displayName || sub.userName || manualBy("latestSub","Latest sub","Thanks for the support").value || "Thanks for the support",
      value:sub.tier ? ("Tier " + sub.tier) : "Loaded from Twitch when token/scope allows it",
      avatar:sub.avatar || "",
      isLive:false
    },
    {
      type:"latestRaid",
      label:"Latest raid",
      displayName:raid.displayName || raid.userName || manualBy("latestRaid","Latest raid","DJ Network love").value || "DJ Network love",
      value:raid.viewers ? (raid.viewers + " viewers") : "Raid is shown via Twitch/EventSub or manually",
      avatar:raid.avatar || "",
      isLive:false
    },
    {
      ...manualBy("topRequester","Top requester","Chatten bestemmer"),
      type:"topRequester",
      displayName:manualBy("topRequester","Top requester","Chatten bestemmer").user || manualBy("topRequester","Top requester","Chatten bestemmer").value || "Chatten bestemmer"
    },
    {
      ...manualBy("memberOfMonth","Community member of the month","Good vibes only"),
      type:"memberOfMonth",
      displayName:manualBy("memberOfMonth","Community member of the month","Good vibes only").user || manualBy("memberOfMonth","Community member of the month","Good vibes only").value || "Good vibes only"
    }
  ];

  el.innerHTML=used.slice(0,5).map(x=>`<article class="communityLoveCard richCommunityCard">${x.avatar?`<img class="communityAvatar" src="${x.avatar}" alt="${x.displayName||x.user||""}">`:`<div class="communityIcon">${communityIcon(x.type)}</div>`}<span>${x.label||""}</span><b>${x.displayName||x.user||""}</b><p>${x.value||""}</p>${x.pinned?'<small>PINNED</small>':''}${x.isLive?'<em>● Live</em>':'<em class="offline">○ Offline</em>'}</article>`).join("");
  renderCommunityStats(state.communityStats||{});
}
function renderCommunityStats(stats){
  const el=q("communityStatsGrid"); if(!el)return;
  const cards=[
    ["Followers",stats.followers||0],
    ["Requests",stats.requests||0],
    ["Raids",stats.raids||0],
    ["Subs",stats.subs||0],
    ["Community",stats.members||0]
  ];
  el.innerHTML=cards.map(c=>`<article class="communityStatCard"><span>${c[0]}</span><b>${c[1]}</b></article>`).join("");
}

function formatShowDateLine(item){
  const date = item?.date || (item?.dateTime ? String(item.dateTime).slice(0,10) : "");
  const start = item?.start || (item?.dateTime ? String(item.dateTime).slice(11,16) : "");
  const end = item?.end || "";
  if(!date) return start ? ("Kl. " + start + (end ? " - " + end : "")) : "";
  const dt = new Date(date + "T" + (start || "00:00"));
  const dateText = isNaN(dt) ? date : dt.toLocaleDateString("da-DK",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
  return `${dateText}${start ? " · kl. " + start : ""}${end ? " - " + end : ""}`;
}
function countdownText(item){
  const raw = item?.dateTime || (item?.date && (item?.start || item?.time) ? item.date + "T" + (item.start || item.time) : "");
  const dt = raw ? new Date(raw) : null;
  if(!dt || isNaN(dt)) return "Date ikke sat endnu";
  const diff = dt - new Date();
  if(diff <= 0) return "Showet er i gang eller har været sendt";
  const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000), m = Math.floor((diff%3600000)/60000);
  return `${d} dage · ${h} timer · ${m} min`;
}
function currentUpcomingShows(){
  const shows = Array.isArray(state?.upcomingShows) && state.upcomingShows.length ? state.upcomingShows : [state?.nextShow || {}];
  const now = new Date();
  return shows.filter(x=>{
    const raw = x?.dateTime || (x?.date && (x?.start || x?.time) ? x.date + "T" + (x.start || x.time) : "");
    const dt = raw ? new Date(raw) : null;
    return !dt || isNaN(dt) || dt >= now;
  }).slice(0,10);
}
let nextShowScrollTimer = null;

function renderNextShow(item){
  const el=q("nextShowCard"); if(!el)return;
  const shows = currentUpcomingShows();
  let index = 0;

  function draw(){
    const show = shows[index] || item || {};
    el.innerHTML = `<div>
      <span>NEXT SHOW ${shows.length > 1 ? "· " + (index+1) + "/" + shows.length : ""}</span>
      <h3>${show.title || "DJ FOLSOE LIVE"}</h3>
      <p class="nextShowDate">${formatShowDateLine(show)}</p>
      <p>${show.description || ""}</p>
    </div>
    <strong>${countdownText(show)}</strong>`;
    index = (index + 1) % Math.max(1, shows.length);
  }

  draw();
  if(nextShowScrollTimer) clearInterval(nextShowScrollTimer);
  if(shows.length > 1) nextShowScrollTimer = setInterval(draw, 7000);
}

function upsertMeta(selector, attr, value){
  if(!value)return;
  let el=document.querySelector(selector);
  if(!el){ el=document.createElement("meta"); const n=selector.match(/name="([^"]+)"/); const p=selector.match(/property="([^"]+)"/); if(n)el.setAttribute("name",n[1]); if(p)el.setAttribute("property",p[1]); document.head.appendChild(el); }
  el.setAttribute(attr,value);
}
function applySEO(){
  const seo=state&&state.seo; if(!seo)return;
  if(seo.title) document.title=seo.title;
  upsertMeta('meta[name="description"]',"content",seo.description);
  upsertMeta('meta[name="keywords"]',"content",(seo.keywords||[]).join(", "));
  upsertMeta('meta[property="og:title"]',"content",seo.title);
  upsertMeta('meta[property="og:description"]',"content",seo.description);
  upsertMeta('meta[property="og:image"]',"content",seo.image);
  upsertMeta('meta[name="twitter:title"]',"content",seo.title);
  upsertMeta('meta[name="twitter:description"]',"content",seo.description);
  upsertMeta('meta[name="twitter:image"]',"content",seo.image);
  const schema=document.getElementById("seoSchema"); if(schema&&seo.schema) schema.textContent=JSON.stringify(seo.schema);
}


function ensureCommunityDom(){
  if(!document.getElementById("communityWallGrid")){
    const section = document.getElementById("communityWall") || document.querySelector(".communityWallPanel") || document.querySelector("main");
    if(section){
      const div=document.createElement("div");
      div.id="communityWallGrid";
      div.className="communityWallGrid";
      section.appendChild(div);
    }
  }
  if(!document.getElementById("communityStatsGrid")){
    const section = document.getElementById("communityWall") || document.querySelector(".communityWallPanel") || document.querySelector("main");
    if(section){
      const div=document.createElement("div");
      div.id="communityStatsGrid";
      div.className="communityStatsGrid";
      section.appendChild(div);
    }
  }
  if(!document.getElementById("requestStatsGrid") && document.getElementById("requests")){
    const div=document.createElement("div");
    div.id="requestStatsGrid";
    div.className="requestStatsGrid";
    document.getElementById("requests").appendChild(div);
  }
}


/* V816.20.1.6 - Show Identity Skin Bridge */
function djfShowThemeKeyFromText(txt){
  const s=String(txt||"").toLowerCase();
  if(s.includes("trance")) return "trance";
  if(s.includes("retro")) return "retro";
  if(s.includes("eurodance")) return "eurodance";
  if(s.includes("fredagsbar")) return "fredagsbar";
  if(s.includes("morning")||s.includes("morgen")) return "morning";
  if(s.includes("summer")||s.includes("sommer")) return "summer";
  if(s.includes("popup")||s.includes("pop up")) return "popup";
  if(s.includes("weekend")) return "weekend";
  return "weekend";
}
function applyShowIdentityTheme(){
  try{
    const next = state?.nextShow || {};
    const key = state?.theme?.activeTheme || state?.activeTheme || next.theme || djfShowThemeKeyFromText((next.title||"")+" "+(next.show||"")+" "+(next.description||""));
    document.body.classList.remove("theme-fredagsbar","theme-popup","theme-trance","theme-retro","theme-eurodance","theme-morning","theme-summer","theme-weekend");
    document.body.classList.add("theme-"+String(key||"weekend").toLowerCase());
    /* V816.20.1.7 homepage background variable */
    document.documentElement.style.setProperty("--theme-bg", `url("https://folsoetv.dk/themes/${String(key||"weekend").toLowerCase()}.png")`);
  }catch(e){}
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(applyShowIdentityTheme,1400));


/* V817 GLOBAL EDITION - English only */
localStorage.setItem("DJF_LANG","en");
document.documentElement.lang="en";
