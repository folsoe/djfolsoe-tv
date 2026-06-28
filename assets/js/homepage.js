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
  renderV81619();
  renderV820();
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
function renderShows(items){
  const defaults = [{"key": "trance", "title": "Trance Tuesday", "time": "Tirsdag 18:30", "body": "Store melodier, lys, energi og trance-fællesskab.", "active": true, "priority": 1}, {"key": "top20", "title": "FOLSOE Top 20", "time": "Torsdag 18:30", "body": "Ugens største tracks i FOLSOE countdown.", "active": true, "priority": 2}, {"key": "fredagsbar", "title": "Fredagsbar", "time": "Fredag 20:00", "body": "Live DJ med masse af sjov og ballade.", "active": true, "priority": 3}, {"key": "retro", "title": "Retro Hits", "time": "Søndag 20:00", "body": "Klassikere, nostalgi og gamle hits med nyt liv.", "active": true, "priority": 4}, {"key": "morning", "title": "Good Morning Twitch", "time": "07:00", "body": "Kaffe, god energi og den bedste start på dagen.", "active": true, "priority": 5}, {"key": "popup", "title": "PopUp", "time": "Surprise", "body": "Når du mindst venter det — så går vi live.", "active": true, "priority": 6}, {"key": "weekend", "title": "Weekend", "time": "Weekend", "body": "Eurodance, summer, community og maksimal energi.", "active": true, "priority": 7}];
  let all=(items&&items.length?items:defaults).filter(x=>x.active!==false).sort((a,b)=>Number(a.priority||99)-Number(b.priority||99));
  const visuals=state.showVisuals||{"trance": {"gradient": "linear-gradient(135deg,#160a5c,#6417ff,#00d4ff)", "icon": "💙", "tag": "TRANCE", "posterText": "TRANCE TUESDAY"}, "top20": {"gradient": "linear-gradient(135deg,#31004f,#ec4899,#f59e0b)", "icon": "🏆", "tag": "CHART", "posterText": "FOLSOE TOP 20"}, "fredagsbar": {"gradient": "linear-gradient(135deg,#431407,#f97316,#facc15)", "icon": "🍺", "tag": "FRIDAY", "posterText": "FREDAGSBAR"}, "retro": {"gradient": "linear-gradient(135deg,#111827,#7c3aed,#ec4899)", "icon": "🕹️", "tag": "RETRO", "posterText": "RETRO HITS"}, "morning": {"gradient": "linear-gradient(135deg,#7c2d12,#f59e0b,#fde68a)", "icon": "☀️", "tag": "MORNING", "posterText": "GOOD MORNING TWITCH"}, "popup": {"gradient": "linear-gradient(135deg,#052e2b,#00f5d4,#16a34a)", "icon": "⚡", "tag": "POPUP", "posterText": "POPUP"}, "weekend": {"gradient": "linear-gradient(135deg,#0f172a,#2563eb,#ec4899,#facc15)", "icon": "🎉", "tag": "WEEKEND", "posterText": "WEEKEND"}};
  q("showsGrid").innerHTML=all.slice(0,7).map(x=>{
    const key=x.key||showKey(x.title);
    const visual=visuals[key]||{};
    const title=String(x.title||"SHOW");
    const poster=visual.posterText||title;
    const style=visual.gradient?` style="--poster:${visual.gradient}"`:"";
    return `<article class="showCard show-${key}"${style}><div class="showPoster"><small>${visual.icon||""} ${visual.tag||""}</small><span>${poster.replace(" ","<br>")}</span></div><div class="showBody"><b>${title}</b><p>${x.time||""}</p><p>${x.body||""}</p></div></article>`;
  }).join("");
}

function renderRequests(items){
  const fallback=[
    {user:"Chat",song:lang==="de"?"Schreibe !Wunsch Künstler - Titel":lang==="en"?"Use !request Artist - Title":"Skriv !ønske Kunstner - Titel",time:t("ready"),language:lang,show:"DJ FOLSOE LIVE"},
    {user:"Chat",song:"!request Artist - Title",time:t("ready"),language:"en",show:"DJ FOLSOE LIVE"},
    {user:"Chat",song:"!Wunsch Künstler - Titel",time:t("ready"),language:"de",show:"DJ FOLSOE LIVE"}
  ];
  const used=(items&&items.length?items:fallback).slice(0,3);
  const html=used.map(x=>`<article class="requestCard"><span>${timeLabel(x.time)} · ${(x.language||"").toUpperCase()}</span><b>${x.song||x.text||""}</b><p>${x.user||"Twitch chat"} · ${x.show||"DJ FOLSOE LIVE"}</p>${x.pinned?'<small>PINNED</small>':''}</article>`).join("");
  const el=q("requestsGrid"); if(el) el.innerHTML=html;
  renderRequestStats(state.requestStats||{});
}
function renderRequestStats(stats){
  const el=q("requestStatsGrid"); if(!el)return;
  const cards=[{label:lang==="de"?"Heute":lang==="en"?"Today":"I dag",value:stats.today||0},{label:lang==="de"?"Gesamt":lang==="en"?"Total":"I alt",value:stats.total||0},{label:lang==="de"?"Top Künstler":lang==="en"?"Top artist":"Top artist",value:stats.topArtist?.name||"-"},{label:lang==="de"?"Top Wunsch":lang==="en"?"Top requester":"Top requester",value:stats.topRequester?.name||"-"}];
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
  q("modsGrid").innerHTML=(items||[]).slice(0,8).map(m=>`<article class="modCard modTwitchCard">${m.avatar?`<img class="modTwitchAvatar" src="${m.avatar}" alt="${m.displayName||m.name||m.login}">`:`<div class="modAvatar"></div>`}<b>${m.displayName||m.name||m.login||""}</b><p>${m.role||""}</p><small>${m.description||""}</small><span class="${m.isLive?"modLive":"modOffline"}">${m.isLive?"● Live":"○ Offline"}</span></article>`).join("");
}

function toggleChart(){q("chartGrid").classList.toggle("open");}
document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem("djf_home_lang",lang);render();loadHome();});
loadHome(); setInterval(loadHome,30000);

function renderCommunityWall(items){
  const el=q("communityWallGrid"); if(!el)return;
  const fallback=[
    {label:"Seneste follower",value:"Twitch community"},
    {label:"Seneste sub",value:"Tak for støtten"},
    {label:"Seneste raid",value:"DJ Network love"},
    {label:"Top requester",value:"Chatten bestemmer"},
    {label:"Månedens community medlem",value:"Good vibes only"}
  ];
  el.innerHTML=(items&&items.length?items:fallback).filter(x=>x.active!==false).slice(0,6).map(x=>`<article class="communityLoveCard"><span>${x.label||""}</span><b>${x.value||""}</b></article>`).join("");
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


// ===== V816.19 Big Content Expansion =====
function cePct(c,t){c=Number(c||0);t=Number(t||1);return Math.max(0,Math.min(100,Math.round(c/t*100)));}
function renderV81619(){
 const s=window.state||state||{};
 const fill=(id,html)=>{const el=document.getElementById(id); if(el) el.innerHTML=html;};
 const tv=[{"day": "Tirsdag", "time": "18:30", "title": "Trance Tuesday", "text": "Store melodier, energi og trance-fællesskab.", "type": "trance", "active": true, "priority": 1}, {"day": "Torsdag", "time": "18:30", "title": "FOLSOE Top 20", "text": "Ugens største tracks i countdown-format.", "type": "chart", "active": true, "priority": 2}, {"day": "Fredag", "time": "20:00", "title": "Fredagsbar", "text": "Live DJ med sjov, ballade og weekendstemning.", "type": "party", "active": true, "priority": 3}, {"day": "Søndag", "time": "20:00", "title": "Retro Hits", "text": "Klassikere, nostalgi og gamle hits med nyt liv.", "type": "retro", "active": true, "priority": 4}], journey=[{"key": "followers", "label": "Followers", "current": 870, "target": 1000, "text": "Rejsen mod 1000 followers på Twitch.", "active": true, "priority": 1}, {"key": "subs", "label": "Subs", "current": 0, "target": 100, "text": "Subs hjælper med teknik, grafik og shows.", "active": true, "priority": 2}, {"key": "community", "label": "Community", "current": 0, "target": 500, "text": "Flere aktive seere og mere fællesskab.", "active": true, "priority": 3}], hof=[{"title": "Månedens chatter", "name": "Twitch chatten", "text": "Den der holder energien oppe.", "icon": "💬", "active": true, "priority": 1}, {"title": "Top requester", "name": "Musikønsker", "text": "Den der finder de bedste tracks.", "icon": "🎧", "active": true, "priority": 2}, {"title": "Community hero", "name": "DJ FOLSOE Family", "text": "Kærlighed til dem der støtter streamen.", "icon": "💜", "active": true, "priority": 3}], req=[{"user": "Chat", "song": "Skriv !ønske Artist - Title", "language": "da", "time": "live", "active": true, "priority": 1}, {"user": "Chat", "song": "Use !request Artist - Title", "language": "en", "time": "live", "active": true, "priority": 2}, {"user": "Chat", "song": "Nutze !Wunsch Künstler - Titel", "language": "de", "time": "live", "active": true, "priority": 3}], disc=[{"artist": "Mau P", "title": "The Less I Know The Better", "genre": "Dance", "note": "Ny energi til chart-showet.", "active": true, "priority": 1}, {"artist": "Peggy Gou", "title": "Find The Way", "genre": "House", "note": "Frisk house-vibe til streamen.", "active": true, "priority": 2}, {"artist": "Anyma", "title": "Hypnotized", "genre": "Melodic Techno", "note": "Kan blive en stærk bobler.", "active": true, "priority": 3}], arch=[{"title": "Trance Tuesday Highlights", "date": "Seneste show", "text": "Melodisk trance, energi og community moments.", "image": "", "active": true, "priority": 1}, {"title": "Fredagsbar Replay", "date": "Seneste fredag", "text": "Weekendstemning og live DJ-energi.", "image": "", "active": true, "priority": 2}, {"title": "Top 20 Countdown", "date": "Denne uge", "text": "Ugens vigtigste tracks og discoveries.", "image": "", "active": true, "priority": 3}];
 fill("tvGuideGrid",(s.tvGuide?.length?s.tvGuide:tv).map(x=>`<article class="tvGuideCard"><span>${x.day||""} · ${x.time||""}</span><h3>${x.title||""}</h3><p>${x.text||""}</p></article>`).join(""));
 fill("viewerJourneyGrid",(s.viewerJourney?.length?s.viewerJourney:journey).map(x=>{const p=cePct(x.current,x.target);return `<article class="journeyCard"><span>${x.label||""}</span><h3>${x.current||0} / ${x.target||0}</h3><div class="journeyBar"><i style="width:${p}%"></i></div><p>${x.text||""}</p></article>`}).join(""));
 fill("hallOfFameGrid",(s.hallOfFame?.length?s.hallOfFame:hof).map(x=>`<article class="hofCard"><b>${x.icon||"⭐"}</b><span>${x.title||""}</span><h3>${x.name||""}</h3><p>${x.text||""}</p></article>`).join(""));
 fill("liveRequestWallGrid",(s.liveRequestWall?.length?s.liveRequestWall:(s.requests?.length?s.requests:req)).slice(0,10).map(x=>`<article class="liveReqCard"><span>${x.time||"live"} · ${(x.language||"").toUpperCase()}</span><h3>${x.song||x.text||""}</h3><p>${x.user||"Chat"}</p></article>`).join(""));
 fill("musicDiscoveryGrid",(s.musicDiscovery?.length?s.musicDiscovery:(s.discoveryPicks?.length?s.discoveryPicks:disc)).map((x,i)=>`<article class="musicDiscoveryCard"><span>DISCOVERY ${i+1}</span><h3>${x.artist||""}</h3><b>${x.title||""}</b><p>${x.genre||""} · ${x.note||""}</p></article>`).join(""));
 fill("showArchiveGrid",(s.showArchive?.length?s.showArchive:arch).map(x=>`<article class="archiveCard">${x.image?`<img src="${x.image}" alt="">`:""}<span>${x.date||""}</span><h3>${x.title||""}</h3><p>${x.text||""}</p></article>`).join(""));
}


// ===== V816.20 TV Station Experience =====
function renderV820(){
  const s=window.state||state||{}, planner=s.broadcastPlanner||[{"id": "show_001", "date": "2026-08-14", "start": "20:00", "end": "23:00", "title": "Summer Closing Party", "show": "Fredagsbar", "theme": "SUMMER", "type": "Live DJ Show", "description": "Sommerens sidste store fest med live DJ, requests og fællesskab.", "cover": "", "featured": true, "liveEvent": false, "specialEvent": true, "active": true, "priority": 1}, {"id": "show_002", "date": "2026-08-18", "start": "20:00", "end": "23:00", "title": "Trance Tuesday", "show": "Trance Tuesday", "theme": "TRANCE", "type": "Trance", "description": "Melodisk trance, energi og store følelser.", "cover": "", "featured": false, "liveEvent": false, "specialEvent": false, "active": true, "priority": 2}, {"id": "show_003", "date": "2026-08-21", "start": "20:00", "end": "23:30", "title": "Fredagsbar", "show": "Fredagsbar", "theme": "FREDAGSBAR", "type": "Party", "description": "Weekendstemning, sjov og ballade direkte fra Danmark.", "cover": "", "featured": false, "liveEvent": false, "specialEvent": false, "active": true, "priority": 3}], next=s.nextShow||planner[0]||null, coming=s.comingUp||planner.slice(1,5), discovery=s.discoveryUniverse||[{"category": "Discovery", "artist": "Mau P", "title": "The Less I Know The Better", "note": "Ny energi til chart-showet.", "active": true, "priority": 1}, {"category": "Bubbling Under", "artist": "Peggy Gou", "title": "Find The Way", "note": "Frisk house-vibe til streamen.", "active": true, "priority": 2}, {"category": "Future Hits", "artist": "Anyma", "title": "Hypnotized", "note": "Stærk kandidat til kommende shows.", "active": true, "priority": 3}, {"category": "DJ Picks", "artist": "DJ FOLSOE", "title": "Viewer Pick", "note": "Plads til dine egne opdagelser.", "active": true, "priority": 4}], hof=s.hallOfFameV820||s.hallOfFame||[{"title": "Månedens chatter", "name": "Twitch chatten", "text": "Den der holder energien oppe.", "icon": "💬", "active": true, "priority": 1}, {"title": "Månedens supporter", "name": "Community Hero", "text": "Kærlighed til dem der støtter udviklingen.", "icon": "💜", "active": true, "priority": 2}, {"title": "Månedens request", "name": "Top Requester", "text": "Den der finder de bedste tracks.", "icon": "🎧", "active": true, "priority": 3}, {"title": "Månedens raid", "name": "Raid Love", "text": "Når fællesskabet vokser på tværs.", "icon": "🚀", "active": true, "priority": 4}, {"title": "Månedens discovery", "name": "Future Hit", "text": "Det nye track vi ikke kan slippe.", "icon": "🏆", "active": true, "priority": 5}];
  const fill=(id,html)=>{const el=document.getElementById(id);if(el)el.innerHTML=html;};
  const dt=x=>x?[x.date,[x.start,x.end].filter(Boolean).join("–")].filter(Boolean).join(" "):"";
  fill("nextShowGrid",next?`<article class="nextShowHero"><div><span>NEXT SHOW</span><h3>${next.title||next.show||""}</h3><p>${dt(next)}</p><p>${next.description||""}</p></div><aside><b>${next.show||""}</b><em>${next.theme||""}</em><strong>${next.featured?"FEATURED":"COMING UP"}</strong></aside></article>`:"");
  fill("comingUpGrid",(coming||[]).slice(0,4).map(x=>`<article class="comingUpCard"><span>${x.date||""} · ${x.start||""}</span><h3>${x.title||x.show||""}</h3><p>${x.type||""} · ${x.theme||""}</p></article>`).join(""));
  fill("discoveryUniverseGrid",(discovery||[]).slice(0,8).map(x=>`<article class="discoveryUniverseCard"><span>${x.category||"Discovery"}</span><h3>${x.artist||""}</h3><b>${x.title||""}</b><p>${x.note||""}</p></article>`).join(""));
  const hofEl=document.getElementById("hallOfFameGrid"); if(hofEl&&hof&&hof.length) hofEl.innerHTML=hof.slice(0,8).map(x=>`<article class="hofCard"><b>${x.icon||"🏆"}</b><span>${x.title||""}</span><h3>${x.name||""}</h3><p>${x.text||""}</p></article>`).join("");
}


// ===== V816.22 Frontpage Lock =====
// No API ordering, no admin ordering, no JS reordering.
// Section order is physically locked in index.html.
// This tiny guard only removes accidental duplicate legacy sections if old cache appears.
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const seen = new Set();
    const map = {
      nextshow: ["nextshow","nextShow"],
      about: ["about","who","hvem"],
      mods: ["mods","modteam","modTeam"],
      shows: ["shows"],
      top20: ["top20"],
      discovery: ["discoveryuniverse","musicdiscovery","musicDiscovery","discovery"],
      requests: ["livewall","requests"],
      community: ["community","communityWall"],
      journey: ["viewerjourney","viewerJourney"],
      hof: ["halloffame","hallOfFame"],
      djnetwork: ["djnetwork","djNetwork","network"],
      comingup: ["comingup","comingUp"]
    };
    Object.keys(map).forEach(key => {
      map[key].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (seen.has(key)) {
          el.style.display = "none";
          el.setAttribute("hidden", "hidden");
        } else {
          seen.add(key);
          el.style.display = "";
          el.removeAttribute("hidden");
        }
      });
    });
    ["tvguide","showarchive","homepageDirector"].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.display = "none"; el.setAttribute("hidden","hidden"); }
    });
  }, 1300);
});
