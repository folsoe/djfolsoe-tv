const API_BASE="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
let state=null;
let lang=localStorage.getItem("djf_home_lang")||"da";

const I18N={
  da:{
    "nav.home":"Forside","nav.about":"Om mig","nav.shows":"Shows","nav.requests":"Requests","nav.news":"Nyheder","nav.top20":"Top 20",
    "hero.subtitle":"Music TV fra Danmark","hero.cta.twitch":"Se mig live på Twitch","hero.cta.requests":"Musikønsker","hero.liveData":"Live data",
    "hero.streamTitle":"Stream title","hero.category":"Kategori","hero.live":"Live på Twitch","hero.offline":"Offline lige nu",
    "stats.followers":"Followers","stats.viewers":"Viewers","stats.views":"Views","stats.stream":"Stream",
    "about.title":"Hvem er DJ FOLSOE?","about.musicTitle":"Musik","about.showsTitle":"Shows","about.requestsTitle":"Requests","about.communityTitle":"Community",
    "about.main":"DJ FOLSOE samler musik, chat, requests og dansk DJ-kultur i et levende broadcast-univers.",
    "about.music":"Trance, Eurodance, Retro, EDM, Pop og Nu-Disco.",
    "about.shows":"Live DJ med masse af sjov og ballade.",
    "about.requests":"Du er medbestemmende — musikønsker via !ønske.",
    "about.community":"Vi har det hylende morsomt og et godt fællesskab.",
    "shows.title":"Shows","shows.link":"Trance · Top20 · Fredagsbar · Retro · Morning · Popup · Weekend",
    "requests.title":"Seneste musikønsker","requests.link":"Gemmer de sidste 3 fra !ønske",
    "news.title":"Nyheder & opdateringer","news.link":"Seneste show · Top20 · Requests · Community · Twitch",
    "top20.title":"FOLSOE Top 20","top20.link":"Se hele listen →","top20.button":"Se hele Top 20",
    "mods.title":"Mod-teamet","mods.body":"Mods holder chatten god, hjælper nye seere og skaber den trygge stemning omkring streamen.",
    "openTwitch":"Åbn Twitch","status":"Status","viewers":"Viewers","followers":"Followers","category":"Kategori","title":"Titel",
    "offline":"Offline","live":"Live","ready":"klar","showDefault":"Broadcast Cloud show"
  },
  en:{
    "nav.home":"Home","nav.about":"About me","nav.shows":"Shows","nav.requests":"Requests","nav.news":"News","nav.top20":"Top 20",
    "hero.subtitle":"Music TV from Denmark","hero.cta.twitch":"Watch me live on Twitch","hero.cta.requests":"Song requests","hero.liveData":"Live data",
    "hero.streamTitle":"Stream title","hero.category":"Category","hero.live":"Live on Twitch","hero.offline":"Offline right now",
    "stats.followers":"Followers","stats.viewers":"Viewers","stats.views":"Views","stats.stream":"Stream",
    "about.title":"Who is DJ FOLSOE?","about.musicTitle":"Music","about.showsTitle":"Shows","about.requestsTitle":"Requests","about.communityTitle":"Community",
    "about.main":"DJ FOLSOE brings music, chat, requests and Danish DJ culture into a living broadcast universe.",
    "about.music":"Trance, Eurodance, Retro, EDM, Pop and Nu-Disco.",
    "about.shows":"Live DJ sets with lots of fun, energy and good chaos.",
    "about.requests":"You help shape the show — song requests via !request.",
    "about.community":"We have a hilarious time and a strong community.",
    "shows.title":"Shows","shows.link":"Trance · Top20 · Friday Bar · Retro · Morning · Popup · Weekend",
    "requests.title":"Latest song requests","requests.link":"Stores the latest 3 requests from !ønske",
    "news.title":"News & updates","news.link":"Latest show · Top20 · Requests · Community · Twitch",
    "top20.title":"FOLSOE Top 20","top20.link":"See full list →","top20.button":"See full Top 20",
    "mods.title":"Mod team","mods.body":"Mods keep the chat friendly, help new viewers and protect the good vibe around the stream.",
    "openTwitch":"Open Twitch","status":"Status","viewers":"Viewers","followers":"Followers","category":"Category","title":"Title",
    "offline":"Offline","live":"Live","ready":"ready","showDefault":"Broadcast Cloud show"
  },
  de:{
    "nav.home":"Startseite","nav.about":"Über mich","nav.shows":"Shows","nav.requests":"Wünsche","nav.news":"News","nav.top20":"Top 20",
    "hero.subtitle":"Music TV aus Dänemark","hero.cta.twitch":"Live auf Twitch ansehen","hero.cta.requests":"Musikwünsche","hero.liveData":"Live-Daten",
    "hero.streamTitle":"Stream-Titel","hero.category":"Kategorie","hero.live":"Live auf Twitch","hero.offline":"Gerade offline",
    "stats.followers":"Follower","stats.viewers":"Zuschauer","stats.views":"Aufrufe","stats.stream":"Stream",
    "about.title":"Wer ist DJ FOLSOE?","about.musicTitle":"Musik","about.showsTitle":"Shows","about.requestsTitle":"Wünsche","about.communityTitle":"Community",
    "about.main":"DJ FOLSOE verbindet Musik, Chat, Musikwünsche und dänische DJ-Kultur in einem lebendigen Broadcast-Universum.",
    "about.music":"Trance, Eurodance, Retro, EDM, Pop und Nu-Disco.",
    "about.shows":"Live-DJ-Sets mit viel Spaß, Energie und guter Laune.",
    "about.requests":"Du bestimmst mit — Musikwünsche über !Wunsch.",
    "about.community":"Wir haben riesigen Spaß und eine starke Gemeinschaft.",
    "shows.title":"Shows","shows.link":"Trance · Top20 · Fredagsbar · Retro · Morning · Popup · Weekend",
    "requests.title":"Neueste Musikwünsche","requests.link":"Speichert die letzten 3 Wünsche von !ønske",
    "news.title":"News & Updates","news.link":"Letzte Show · Top20 · Wünsche · Community · Twitch",
    "top20.title":"FOLSOE Top 20","top20.link":"Ganze Liste ansehen →","top20.button":"Ganze Top 20 ansehen",
    "mods.title":"Mod-Team","mods.body":"Mods halten den Chat freundlich, helfen neuen Zuschauern und schützen die gute Stimmung im Stream.",
    "openTwitch":"Twitch öffnen","status":"Status","viewers":"Zuschauer","followers":"Follower","category":"Kategorie","title":"Titel",
    "offline":"Offline","live":"Live","ready":"bereit","showDefault":"Broadcast Cloud Show"
  }
};

function t(key){return (I18N[lang]&&I18N[lang][key])||I18N.da[key]||key;}
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

async function loadHome(){
  try{
    const r=await fetch(API_BASE+"/api/homepage?lang="+lang+"&ts="+Date.now(),{cache:"no-store"});
    state=await r.json();
  }catch(e){
    state={twitch:{displayName:"DJ FOLSOE",description:"DJ FOLSOE er en dansk musikstreamer på Twitch.",isLive:false,viewers:0,followers:870,viewCount:0,liveTitle:"DJ FOLSOE LIVE",category:"Music"},profile:{mods:[]},shows:[],newsCards:[],top20:[],requests:[]};
  }
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
    trance:{time:"Tirsdag 18:30",body:"Store melodier, lys, energi og trance-fællesskab."},
    top20:{time:"Torsdag 18:30",body:"Ugens største tracks i FOLSOE countdown."},
    fredagsbar:{time:"Fredag 20:00",body:"Fest, grin, requests og weekendstemning."},
    retro:{time:"Søndag 20:00",body:"Klassikere, nostalgi og gamle hits med nyt liv."},
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
    {user:"Chat",song:lang==="de"?"Schreibe !Wunsch Künstler - Titel":lang==="en"?"Use !request Artist - Title":"Skriv !ønske Kunstner - Titel",time:t("ready"),language:lang,show:"DJ FOLSOE LIVE"},
    {user:"Chat",song:"!request Artist - Title",time:t("ready"),language:"en",show:"DJ FOLSOE LIVE"},
    {user:"Chat",song:"!Wunsch Künstler - Titel",time:t("ready"),language:"de",show:"DJ FOLSOE LIVE"}
  ];
  const used=(items&&items.length?items:fallback).slice(0,3);
  djfSafeHtml("requestsGrid", used.map(x=>`<article class="requestCard"><span>${timeLabel(x.time)} · ${(x.language||"").toUpperCase()}</span><b>${x.song||x.text||""}</b><p>${x.user||"Twitch chat"} · ${x.show||"DJ FOLSOE LIVE"}</p>${x.pinned?'<small>PINNED</small>':''}</article>`).join(""));
  renderRequestStats(state.requestStats||{});
}
function renderRequestStats(stats){
  const el=q("requestStatsGrid"); if(!el)return;
  const cards=[
    {label:lang==="de"?"Heute":lang==="en"?"Today":"I dag",value:stats.today||0},
    {label:lang==="de"?"Gesamt":lang==="en"?"Total":"I alt",value:stats.total||0},
    {label:lang==="de"?"Top Künstler":lang==="en"?"Top artist":"Top artist",value:stats.topArtist?.name||"-"},
    {label:lang==="de"?"Top Wunsch":lang==="en"?"Top requester":"Top requester",value:stats.topRequester?.name||"-"}
  ];
  el.innerHTML=cards.map(c=>`<article class="requestStatCard"><span>${c.label}</span><b>${c.value}</b></article>`).join("");
}

function renderNews(items,tw){
  const base=[
    {type:lang==="de"?"Letzte Show":lang==="en"?"Latest show":"Seneste show",title:tw.liveTitle||"DJ FOLSOE Broadcast Cloud",body:tw.isLive?t("hero.live"):t("hero.offline")},
    {type:lang==="de"?"Top20 neu":lang==="en"?"Top20 update":"Top20 nyt",title:"FOLSOE Top 20",body:lang==="de"?"Sieh die wöchentlichen Charts.":lang==="en"?"See the weekly chart.":"Se ugens chart og countdown."},
    {type:"Requests",title:lang==="de"?"Musikwünsche sind offen":lang==="en"?"Song requests are open":"Musikønsker er åbne",body:"!ønske / !request / !Wunsch"},
    {type:"Community",title:lang==="de"?"Der Chat ist das Herz":lang==="en"?"Chat is the heart":"Chatten er hjertet",body:lang==="de"?"Emotes, Mods und gute Stimmung.":lang==="en"?"Emotes, mods and good vibes.":"Emotes, mods og god stemning."},
    {type:"Twitch",title:lang==="de"?"Twitch-Updates":lang==="en"?"Twitch updates":"Twitch updates",body:tw.category||"Music"}
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
    {artist:"Ny artist",title:"Ny sang",genre:"Discovery",note:"Dem her har jeg lige opdaget."},
    {artist:"Upcoming",title:"Frisk lyd",genre:"New Music",note:"Kan blive en del af næste chart."},
    {artist:"FOLSOE Pick",title:"Lyt med",genre:"Broadcast",note:"Et track der fortjener ekstra kærlighed."}
  ];
  el.innerHTML=(items&&items.length?items:fallback).slice(0,3).map((x,i)=>`<article class="discoveryCard"><span>DISCOVERY ${i+1}</span><b>${x.artist||""}</b><h3>${x.title||""}</h3><p>${x.genre||""}</p><small>${x.note||"Dem her har jeg lige opdaget."}</small></article>`).join("");
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
      label:"Seneste follower",
      displayName:follower.displayName || follower.userName || manualBy("latestFollower","Seneste follower","Twitch community").value || "Twitch community",
      value:follower.followedAt ? ("Fulgte " + new Date(follower.followedAt).toLocaleDateString("da-DK")) : "Hentes fra Twitch når token/scope tillader det",
      avatar:follower.avatar || "",
      isLive:false
    },
    {
      type:"latestSub",
      label:"Seneste sub",
      displayName:sub.displayName || sub.userName || manualBy("latestSub","Seneste sub","Tak for støtten").value || "Tak for støtten",
      value:sub.tier ? ("Tier " + sub.tier) : "Hentes fra Twitch når token/scope tillader det",
      avatar:sub.avatar || "",
      isLive:false
    },
    {
      type:"latestRaid",
      label:"Seneste raid",
      displayName:raid.displayName || raid.userName || manualBy("latestRaid","Seneste raid","DJ Network love").value || "DJ Network love",
      value:raid.viewers ? (raid.viewers + " viewers") : "Raid udfyldes via Twitch/EventSub eller manuelt",
      avatar:raid.avatar || "",
      isLive:false
    },
    {
      ...manualBy("topRequester","Top requester","Chatten bestemmer"),
      type:"topRequester",
      displayName:manualBy("topRequester","Top requester","Chatten bestemmer").user || manualBy("topRequester","Top requester","Chatten bestemmer").value || "Chatten bestemmer"
    },
    {
      ...manualBy("memberOfMonth","Månedens community medlem","Good vibes only"),
      type:"memberOfMonth",
      displayName:manualBy("memberOfMonth","Månedens community medlem","Good vibes only").user || manualBy("memberOfMonth","Månedens community medlem","Good vibes only").value || "Good vibes only"
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
function renderNextShow(item){
  const el=q("nextShowCard"); if(!el)return;
  item=item||{};
  const dt=item.dateTime?new Date(item.dateTime):null;
  let countdown="Dato ikke sat endnu";
  if(dt && !isNaN(dt)){
    const diff=dt-new Date();
    if(diff>0){
      const d=Math.floor(diff/86400000), h=Math.floor((diff%86400000)/3600000), m=Math.floor((diff%3600000)/60000);
      countdown=`${d} dage · ${h} timer · ${m} min`;
    } else countdown="Showet er i gang eller har været sendt";
  }
  el.innerHTML=`<div><span>NÆSTE SHOW</span><h3>${item.title||"DJ FOLSOE LIVE"}</h3><p>${item.description||""}</p></div><strong>${countdown}</strong>`;
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
