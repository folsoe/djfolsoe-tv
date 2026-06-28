
/* ==========================================================
   V816.19.2 ADMIN NULL FIX
   Safe DOM helpers. Prevents:
   Cannot set properties of null (setting 'innerHTML')
   ========================================================== */
function djfEl(id){ return document.getElementById(id); }
function djfHTML(id, html){
  const el = djfEl(id);
  if(!el){ console.warn("[DJF ADMIN] Missing HTML element:", id); return; }
  el.innerHTML = html || "";
}
function djfText(id, text){
  const el = djfEl(id);
  if(!el){ console.warn("[DJF ADMIN] Missing text element:", id); return; }
  el.textContent = text || "";
}
function djfValue(id, value){
  const el = djfEl(id);
  if(!el){ console.warn("[DJF ADMIN] Missing value element:", id); return; }
  el.value = value || "";
}
function djfGet(id){
  const el = djfEl(id);
  return el ? el.value : "";
}

const TOP20_STABLE_SEED=[{"rank": 1, "artist": "Axwell & Bonn", "title": "Whatever Turns You On", "genre": "Dance", "points": 92}, {"rank": 2, "artist": "Hugel, David Guetta", "title": "Shine", "genre": "Dance", "points": 90}, {"rank": 3, "artist": "Calvin Harris", "title": "Satisfy", "genre": "Dance", "points": 88}, {"rank": 4, "artist": "Rune Rask, Hampenberg, The Minds of 99", "title": "Under Din Sne", "genre": "Bootleg Remix", "points": 87}, {"rank": 5, "artist": "Svenstrup & Vendelboe x DJ Encore", "title": "Udødelige", "genre": "Dance", "points": 86}, {"rank": 6, "artist": "Armin Van Buuren", "title": "Dream A Little Dream", "genre": "Trance", "points": 85}, {"rank": 7, "artist": "Lost Frequencies", "title": "Live It All", "genre": "Dance Pop", "points": 84}, {"rank": 8, "artist": "David Guetta, Alok", "title": "Run Run River", "genre": "Progressive EDM", "points": 83}, {"rank": 9, "artist": "Anyma", "title": "Bad Angel", "genre": "Melodic Techno", "points": 82}, {"rank": 10, "artist": "Bebe Rexha", "title": "New Religion", "genre": "Pop Dance", "points": 81}, {"rank": 11, "artist": "RAYE", "title": "Where Is My Husband!", "genre": "Pop", "points": 80}, {"rank": 12, "artist": "Tiësto", "title": "Lethal Industry 2026", "genre": "Trance", "points": 79}, {"rank": 13, "artist": "Purple Disco Machine", "title": "Beat Fantasy", "genre": "Nu-Disco", "points": 78}, {"rank": 14, "artist": "Meduza", "title": "Another World", "genre": "House", "points": 77}, {"rank": 15, "artist": "Dua Lipa", "title": "Physical Reloaded", "genre": "Pop Dance", "points": 76}, {"rank": 16, "artist": "Topic", "title": "Tonight", "genre": "Dance", "points": 75}, {"rank": 17, "artist": "Robin Schulz", "title": "Only Way Is Up", "genre": "Dance Pop", "points": 74}, {"rank": 18, "artist": "Jax Jones", "title": "Never Be Lonely", "genre": "House", "points": 73}, {"rank": 19, "artist": "Ofenbach", "title": "Overdrive", "genre": "Dance", "points": 72}, {"rank": 20, "artist": "Swedish House Mafia", "title": "Ray Of Solar", "genre": "EDM", "points": 71}];
const DISCOVERY_STABLE_SEED=[{"artist": "Mau P", "title": "The Less I Know The Better", "genre": "Dance", "note": "Ny energi til chart-showet", "priority": 1}, {"artist": "Peggy Gou", "title": "Find The Way", "genre": "House", "note": "Lige opdaget og testet i mix", "priority": 2}, {"artist": "Anyma", "title": "Hypnotized", "genre": "Melodic Techno", "note": "Kunne blive en stærk bobler", "priority": 3}];

/* V816.18.1.2 HARD PATCH */
async function loadShowVisuals(){
  try{
    if (typeof api === "function") {
      const r = await api('/api/show-visuals');
      window.showVisualsItems = (r && r.items) || window.showVisualsItems || {};
    }
  }catch(e){
    console.warn("loadShowVisuals safe fallback:", e);
  }
  if (typeof renderShowVisuals === "function") {
    try { renderShowVisuals(); } catch(e) { console.warn("renderShowVisuals fallback:", e); }
  }
}
function renderShowVisuals(){
  const el = document.getElementById("showVisualsEditor");
  if(!el) return;
  const items = window.showVisualsItems || {};
  const keys = Object.keys(items);
  if(!keys.length){
    el.innerHTML = '<div class="previewCard"><b>Show grafik</b><p>Data hentes fra /api/show-visuals. Denne fallback stopper admin fra at crashe.</p></div>';
    return;
  }
  el.innerHTML = keys.map(key=>{
    const v = items[key] || {};
    return `<div class="row visual">
      <div><label>Key</label><input value="${key}" disabled></div>
      <div><label>Icon</label><input data-sv="${key}" data-f="icon" value="${v.icon||''}"></div>
      <div><label>Tag</label><input data-sv="${key}" data-f="tag" value="${v.tag||''}"></div>
      <div><label>Poster tekst</label><input data-sv="${key}" data-f="posterText" value="${v.posterText||''}"></div>
      <div><label>Gradient</label><input data-sv="${key}" data-f="gradient" value="${v.gradient||''}"></div>
    </div>`;
  }).join('');
}
function collectShowVisuals(){
  if(!window.showVisualsItems) window.showVisualsItems = {};
  document.querySelectorAll('[data-sv][data-f]').forEach(inp=>{
    const k = inp.dataset.sv, f = inp.dataset.f;
    if(!window.showVisualsItems[k]) window.showVisualsItems[k] = {};
    window.showVisualsItems[k][f] = inp.value;
  });
}
async function saveShowVisuals(){
  collectShowVisuals();
  try{
    if(typeof api === "function") await api('/api/show-visuals',{method:'POST',body:JSON.stringify({items:window.showVisualsItems||{}})});
    if(typeof setStatus === "function") setStatus('✅ Show grafik gemt');
  }catch(e){
    if(typeof setStatus === "function") setStatus('❌ Show grafik fejl: '+e.message);
  }
}
function resetShowVisuals(){
  window.showVisualsItems = window.SHOW_VISUALS_SEED || {};
  renderShowVisuals();
}
window.loadShowVisuals = loadShowVisuals;
window.renderShowVisuals = renderShowVisuals;
window.saveShowVisuals = saveShowVisuals;
window.resetShowVisuals = resetShowVisuals;




const SHOWS_SEED=[{"key": "trance", "title": "Trance Tuesday", "time": "Tirsdag 18:30", "body": "Store melodier, lys, energi og trance-fællesskab.", "active": true, "priority": 1}, {"key": "top20", "title": "FOLSOE Top 20", "time": "Torsdag 18:30", "body": "Ugens største tracks i FOLSOE countdown.", "active": true, "priority": 2}, {"key": "fredagsbar", "title": "Fredagsbar", "time": "Fredag 20:00", "body": "Live DJ med masse af sjov og ballade.", "active": true, "priority": 3}, {"key": "retro", "title": "Retro Hits", "time": "Søndag 20:00", "body": "Klassikere, nostalgi og gamle hits med nyt liv.", "active": true, "priority": 4}, {"key": "morning", "title": "Good Morning Twitch", "time": "07:00", "body": "Kaffe, god energi og den bedste start på dagen.", "active": true, "priority": 5}, {"key": "popup", "title": "PopUp", "time": "Surprise", "body": "Når du mindst venter det — så går vi live.", "active": true, "priority": 6}, {"key": "weekend", "title": "Weekend", "time": "Weekend", "body": "Eurodance, summer, community og maksimal energi.", "active": true, "priority": 7}];
const SHOW_VISUALS_SEED={"trance": {"gradient": "linear-gradient(135deg,#160a5c,#6417ff,#00d4ff)", "icon": "💙", "tag": "TRANCE", "posterText": "TRANCE TUESDAY"}, "top20": {"gradient": "linear-gradient(135deg,#31004f,#ec4899,#f59e0b)", "icon": "🏆", "tag": "CHART", "posterText": "FOLSOE TOP 20"}, "fredagsbar": {"gradient": "linear-gradient(135deg,#431407,#f97316,#facc15)", "icon": "🍺", "tag": "FRIDAY", "posterText": "FREDAGSBAR"}, "retro": {"gradient": "linear-gradient(135deg,#111827,#7c3aed,#ec4899)", "icon": "🕹️", "tag": "RETRO", "posterText": "RETRO HITS"}, "morning": {"gradient": "linear-gradient(135deg,#7c2d12,#f59e0b,#fde68a)", "icon": "☀️", "tag": "MORNING", "posterText": "GOOD MORNING TWITCH"}, "popup": {"gradient": "linear-gradient(135deg,#052e2b,#00f5d4,#16a34a)", "icon": "⚡", "tag": "POPUP", "posterText": "POPUP"}, "weekend": {"gradient": "linear-gradient(135deg,#0f172a,#2563eb,#ec4899,#facc15)", "icon": "🎉", "tag": "WEEKEND", "posterText": "WEEKEND"}};

const API_BASE="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
const THEMES={"fredagsbar": "🍺 FREDAGSBAR", "popup": "⚡ POPUP", "trance": "💙 TRANCE TUESDAY", "retro": "🕹️ RETRO HITS", "eurodance": "💛 EURODANCE", "morning": "☀️ GOOD MORNING TWITCH", "summer": "🌴 SUMMER BEATS", "weekend": "🎉 WEEKEND VIBES"};
const TOP20_SEED=[{"rank": 1, "artist": "Axwell & Bonn", "title": "Whatever Turns You On", "genre": "Dance", "points": 92}, {"rank": 2, "artist": "Hugel, David Guetta", "title": "Shine", "genre": "Dance", "points": 90}, {"rank": 3, "artist": "Calvin Harris", "title": "Satisfy", "genre": "Dance", "points": 88}, {"rank": 4, "artist": "Rune Rask, Hampenberg, The Minds of 99", "title": "Under Din Sne", "genre": "Bootleg Remix", "points": 87}, {"rank": 5, "artist": "Svenstrup & Vendelboe x DJ Encore", "title": "Udødelige", "genre": "Dance", "points": 86}, {"rank": 6, "artist": "Armin Van Buuren", "title": "Dream A Little Dream", "genre": "Trance", "points": 85}, {"rank": 7, "artist": "Lost Frequencies", "title": "Live It All", "genre": "Dance Pop", "points": 84}, {"rank": 8, "artist": "David Guetta, Alok", "title": "Run Run River", "genre": "Progressive EDM", "points": 83}, {"rank": 9, "artist": "Anyma", "title": "Bad Angel", "genre": "Melodic Techno", "points": 82}, {"rank": 10, "artist": "Bebe Rexha", "title": "New Religion", "genre": "Pop Dance", "points": 81}, {"rank": 11, "artist": "RAYE", "title": "Where Is My Husband!", "genre": "Pop", "points": 80}, {"rank": 12, "artist": "Tiësto", "title": "Lethal Industry 2026", "genre": "Trance", "points": 79}, {"rank": 13, "artist": "Purple Disco Machine", "title": "Beat Fantasy", "genre": "Nu-Disco", "points": 78}, {"rank": 14, "artist": "Meduza", "title": "Another World", "genre": "House", "points": 77}, {"rank": 15, "artist": "Dua Lipa", "title": "Physical Reloaded", "genre": "Pop Dance", "points": 76}, {"rank": 16, "artist": "Topic", "title": "Tonight", "genre": "Dance", "points": 75}, {"rank": 17, "artist": "Robin Schulz", "title": "Only Way Is Up", "genre": "Dance Pop", "points": 74}, {"rank": 18, "artist": "Jax Jones", "title": "Never Be Lonely", "genre": "House", "points": 73}, {"rank": 19, "artist": "Ofenbach", "title": "Overdrive", "genre": "Dance", "points": 72}, {"rank": 20, "artist": "Swedish House Mafia", "title": "Ray Of Solar", "genre": "EDM", "points": 71}];
let core=null, home=null, activeTheme="weekend";
let showVisualsItems=JSON.parse(JSON.stringify(SHOW_VISUALS_SEED));
let topItems=[],bottomItems=[],newsItems=[],showsItems=[],top20Items=[],discoveryItems=[],requestItems=[];

document.addEventListener("DOMContentLoaded",()=>{
  djfValue("token", localStorage.getItem("DJF_ADMIN_TOKEN")||"");
  renderThemes();
  loadAll();
});

function jump(id){document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});}
function token(){return localStorage.getItem("DJF_ADMIN_TOKEN")||djfGet("token")||"";}
function saveToken(){localStorage.setItem("DJF_ADMIN_TOKEN",djfGet("token").trim());setStatus("✅ Token gemt");loadAll();}
function openApi(path){window.open(API_BASE+path,"_blank");}
function setStatus(v){djfText("statusBox", v);}

async function api(path,opt={}){
  opt.headers=Object.assign({"content-type":"application/json","x-admin-token":token()},opt.headers||{});
  const r=await fetch(API_BASE+path,opt);
  const txt=await r.text();
  let j; try{j=JSON.parse(txt);}catch(e){j={raw:txt};}
  if(!r.ok) throw new Error(txt);
  return j;
}

function renderThemes(){
  djfHTML("themeGrid", Object.entries(THEMES).map(([k,l])=>`<button id="theme_${k}" onclick="setTheme('${k}')">${l}</button>`).join(""));
}
function markTheme(k){
  activeTheme=k||activeTheme;
  Object.keys(THEMES).forEach(x=>document.getElementById("theme_"+x)?.classList.toggle("activeThemeBtn",x===activeTheme));
  djfText("activeTheme", "Aktivt tema: "+activeTheme);
}
async function setTheme(k){
  try{
    const r=await api("/api/theme",{method:"POST",body:JSON.stringify({theme:k})});
    markTheme(r.activeTheme||k);
    setStatus("✅ Tema skiftet til "+(r.activeTheme||k));
  }catch(e){setStatus("❌ Tema-fejl: "+e.message);}
}

async function loadAll(){
  try{
    const results=await Promise.allSettled([
      api("/api/core"), api("/api/homepage"), api("/api/theme"), api("/api/theme-ticker-top"),
      api("/api/bottom-ticker"), api("/api/homepage-news"), api("/api/shows"), api("/api/top20"), api("/api/discovery-picks"), api("/api/requests")
    ]);
    core=results[0].value||{};
    home=results[1].value||{};
    if(results[2].value) markTheme(results[2].value.activeTheme);
    topItems=results[3].value?.items||[];
    bottomItems=results[4].value?.items||[];
    newsItems=results[5].value?.items||home.newsCards||[];
    showsItems=results[6].value?.items||home.shows||[]; if(!showsItems.length) showsItems=JSON.parse(JSON.stringify(SHOWS_SEED));
    top20Items=results[7].value?.items||home.top20||[];
    top20Items=(top20Items&&top20Items.length?top20Items:TOP20_SEED);
    discoveryItems=results[8].value?.items||home.discoveryPicks||[];
    requestItems=results[9].value?.items||home.requests||[];
    fillProfile();
    renderEditors();
    loadDiscoveryStable();
    if (typeof window.loadShowVisuals === 'function') loadShowVisuals();
    renderRequests();
    renderTwitch();
    loadDiscovery();
    loadContentManager();
    setStatus("✅ Data hentet fra Broadcast Cloud\n"+new Date().toLocaleString("da-DK"));
  }catch(e){setStatus("❌ Load-fejl: "+e.message);}
}

function fillProfile(){
  djfValue("profileName", core.profile?.name||home.profile?.name||"DJ FOLSOE");
  djfValue("twitchChannel", core.twitchChannel||home.twitch?.login||"djfolsoe");
  djfValue("profileDescription", core.profile?.description||home.twitch?.description||"");
  djfValue("profileGenres", (core.profile?.genres||home.profile?.genres||[]).join(", "));
}

async function saveProfile(){
  try{
    const profile=Object.assign({},core.profile||{}, {
      name:djfGet("profileName").trim()||"DJ FOLSOE",
      description:djfGet("profileDescription").trim(),
      genres:djfGet("profileGenres").split(",").map(x=>x.trim()).filter(Boolean)
    });
    const twitchChannel=djfGet("twitchChannel").trim().toLowerCase()||"djfolsoe";
    await api("/api/core",{method:"POST",body:JSON.stringify({profile,twitchChannel})});
    setStatus("✅ Profil/forside fallback gemt");
    loadAll();
  }catch(e){setStatus("❌ Profil-fejl: "+e.message);}
}

function arr(type){return type==="top"?topItems:type==="bottom"?bottomItems:type==="news"?newsItems:type==="shows"?showsItems:type==="top20"?top20Items:type==="discovery"?discoveryItems:requestItems;}
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");}

function row(type,item,i){
  if(type==="shows") return `<div class="row shows"><div><label>Key</label><input data-t="${type}" data-i="${i}" data-f="key" value="${esc(item.key||'')}"/></div><div><label>Title</label><input data-t="${type}" data-i="${i}" data-f="title" value="${esc(item.title||'')}"/></div><div><label>Time</label><input data-t="${type}" data-i="${i}" data-f="time" value="${esc(item.time||'')}"/></div><div><label>Body</label><input data-t="${type}" data-i="${i}" data-f="body" value="${esc(item.body||'')}"/></div><button onclick="delRow('${type}',${i})">Slet</button></div>`;
  if(type==="top20") return `<div class="row top20"><div><label>Rank</label><input data-t="${type}" data-i="${i}" data-f="rank" value="${item.rank||i+1}"/></div><div><label>Artist</label><input data-t="${type}" data-i="${i}" data-f="artist" value="${esc(item.artist||'')}"/></div><div><label>Title</label><input data-t="${type}" data-i="${i}" data-f="title" value="${esc(item.title||'')}"/></div><div><label>Genre</label><input data-t="${type}" data-i="${i}" data-f="genre" value="${esc(item.genre||'')}"/></div><div><label>Points</label><input data-t="${type}" data-i="${i}" data-f="points" value="${item.points||0}"/></div><button onclick="delRow('${type}',${i})">Slet</button></div>`;
  if(type==="discovery") return `<div class="row top20"><div><label>Artist</label><input data-t="${type}" data-i="${i}" data-f="artist" value="${esc(item.artist||'')}"/></div><div><label>Title</label><input data-t="${type}" data-i="${i}" data-f="title" value="${esc(item.title||'')}"/></div><div><label>Genre</label><input data-t="${type}" data-i="${i}" data-f="genre" value="${esc(item.genre||'')}"/></div><div><label>Note</label><input data-t="${type}" data-i="${i}" data-f="note" value="${esc(item.note||'')}"/></div><div><label></label></div><button onclick="delRow('${type}',${i})">Slet</button></div>`;
  if(type==="news") return `<div class="row news"><div><label>Active</label><select data-t="${type}" data-i="${i}" data-f="active"><option value="true" ${item.active!==false?'selected':''}>Yes</option><option value="false" ${item.active===false?'selected':''}>No</option></select></div><div><label>Type</label><input data-t="${type}" data-i="${i}" data-f="type" value="${esc(item.type||'News')}"/></div><div><label>Title</label><input data-t="${type}" data-i="${i}" data-f="title" value="${esc(item.title||'')}"/></div><div><label>Body</label><input data-t="${type}" data-i="${i}" data-f="body" value="${esc(item.body||'')}"/></div><div><label>Priority</label><input data-t="${type}" data-i="${i}" data-f="priority" value="${item.priority||99}"/></div><button onclick="delRow('${type}',${i})">Slet</button></div>`;
  return `<div class="row"><div><label>Active</label><select data-t="${type}" data-i="${i}" data-f="active"><option value="true" ${item.active!==false?'selected':''}>Yes</option><option value="false" ${item.active===false?'selected':''}>No</option></select></div><div><label>Theme</label><input data-t="${type}" data-i="${i}" data-f="theme" value="${esc(item.theme||'all')}"/></div><div><label>Text</label><input data-t="${type}" data-i="${i}" data-f="text" value="${esc(item.text||'')}"/></div><div><label>ID</label><input data-t="${type}" data-i="${i}" data-f="id" value="${esc(item.id||type+Date.now())}"/></div><div><label>Priority</label><input data-t="${type}" data-i="${i}" data-f="priority" value="${item.priority||99}"/></div><button onclick="delRow('${type}',${i})">Slet</button></div>`;
}

function renderEditors(){
  djfHTML("newsEditor", newsItems.map((x,i)=>row("news",x,i)).join(""));
  djfHTML("topEditor", topItems.map((x,i)=>row("top",x,i)).join(""));
  djfHTML("bottomEditor", bottomItems.map((x,i)=>row("bottom",x,i)).join(""));
  djfHTML("showsEditor", showsItems.map((x,i)=>row("shows",x,i)).join(""));
  djfHTML("top20Editor", top20Items.map((x,i)=>row("top20",x,i)).join(""));
  if(document.getElementById("discoveryEditor")) djfHTML("discoveryEditor", discoveryItems.map((x,i)=>row("discovery",x,i)).join(""));
}

function collect(){
  document.querySelectorAll("[data-t][data-i][data-f]").forEach(inp=>{
    const a=arr(inp.dataset.t),i=Number(inp.dataset.i),f=inp.dataset.f;
    let v=inp.value;
    if(f==="active") v=v==="true";
    if(["priority","rank","points"].includes(f)) v=Number(v||0);
    if(!a[i]) a[i]={};
    a[i][f]=v;
  });
}

function addRow(type){
  const a=arr(type);
  if(type==="shows") a.push({key:"new",title:"Nyt show",time:"",body:"",active:true,priority:a.length+1});
  else if(type==="top20") a.push({rank:a.length+1,artist:"",title:"",genre:"",points:0});
  else if(type==="discovery") a.push({artist:"",title:"",genre:"",note:"Dem her har jeg lige opdaget"});
  else if(type==="news") a.push({id:"news"+Date.now(),active:true,type:"News",title:"",body:"",priority:a.length+1});
  else a.push({id:type+Date.now(),active:true,theme:type==="top"?activeTheme:"all",text:"",priority:a.length+1});
  renderEditors();
}
function delRow(type,i){arr(type).splice(i,1);renderEditors();}

async function saveRows(type){
  collect();
  const endpoint=type==="top"?"/api/theme-ticker-top":type==="bottom"?"/api/bottom-ticker":type==="news"?"/api/homepage-news":type==="shows"?"/api/shows":type==="discovery"?"/api/discovery-picks":"/api/top20";
  try{
    await api(endpoint,{method:"POST",body:JSON.stringify({items:arr(type)})});
    setStatus("✅ Gemt: "+type);
    loadAll();
  }catch(e){setStatus("❌ Gem-fejl: "+e.message);}
}

function seedTop20(){top20Items=TOP20_SEED.map(x=>Object.assign({},x));renderEditors();}

async function addRequest(){
  try{
    const user=djfGet("reqUser")||"Admin";
    const text=djfGet("reqText")||"!ønske Artist - Title";
    const r=await api("/api/requests",{method:"POST",body:JSON.stringify({user,text})});
    requestItems=r.items||[];
    renderRequests();
    setStatus("✅ Request gemt");
  }catch(e){setStatus("❌ Request-fejl: "+e.message);}
}

function renderRequests(){
  djfHTML("requestsPreview", (requestItems||[]).slice(0,3).map(x=>`<div class="previewCard"><b>${esc(x.song||x.text||"")}</b><p>${esc(x.user||"Twitch chat")}</p><small>${esc(x.time||"")}</small></div>`).join(""));
}

function renderTwitch(){
  const tw=home?.twitch||{};
  djfHTML("twitchPreview", `<div class="previewCard">${tw.avatar?`<img class="twitchAvatar" src="${tw.avatar}">`:""}<h3>${esc(tw.displayName||"DJ FOLSOE")}</h3><p>${esc(tw.description||"")}</p><p><b>Status:</b> ${tw.isLive?"LIVE":"Offline"}</p><p><b>Viewers:</b> ${tw.viewers||0}</p><p><b>Followers:</b> ${tw.followers||0}</p><p><b>Category:</b> ${esc(tw.category||"Music")}</p></div>`);
}

async function testAll(){
  try{
    const r=await Promise.all([api("/api/theme"),api("/api/homepage"),api("/api/overlay/v170-state"),api("/api/requests")]);
    setStatus(JSON.stringify(r,null,2));
  }catch(e){setStatus("❌ Test-fejl: "+e.message);}
}


// ===== V816.13 Broadcast Content Manager =====
const DEFAULT_SHOW_VISUALS={"trance": {"gradient": "linear-gradient(135deg,#160a5c,#6417ff,#00d4ff)", "icon": "💙", "tag": "TRANCE", "posterText": "TRANCE TUESDAY"}, "top20": {"gradient": "linear-gradient(135deg,#31004f,#ec4899,#f59e0b)", "icon": "🏆", "tag": "CHART", "posterText": "FOLSOE TOP 20"}, "fredagsbar": {"gradient": "linear-gradient(135deg,#431407,#f97316,#facc15)", "icon": "🍺", "tag": "FRIDAY", "posterText": "FREDAGSBAR"}, "retro": {"gradient": "linear-gradient(135deg,#111827,#7c3aed,#ec4899)", "icon": "🕹️", "tag": "RETRO", "posterText": "RETRO HITS"}, "morning": {"gradient": "linear-gradient(135deg,#7c2d12,#f59e0b,#fde68a)", "icon": "☀️", "tag": "MORNING", "posterText": "GOOD MORNING TWITCH"}, "popup": {"gradient": "linear-gradient(135deg,#052e2b,#00f5d4,#16a34a)", "icon": "⚡", "tag": "POPUP", "posterText": "POPUP"}, "weekend": {"gradient": "linear-gradient(135deg,#0f172a,#2563eb,#ec4899,#facc15)", "icon": "🎉", "tag": "WEEKEND", "posterText": "WEEKEND"}};
const DEFAULT_OVERLAY_CONTENT={"box1": [{"active": true, "label": "FOLLOW JOURNEY", "headline": "870/1000 followers", "body": "Help DJ FOLSOE grow", "icon": "📡", "priority": 1}, {"active": true, "label": "LIVE STATUS", "headline": "0 viewers", "body": "Broadcast Cloud online", "icon": "👁️", "priority": 2}], "box2": [{"active": true, "label": "PROGRAM", "headline": "DJ FOLSOE LIVE", "body": "Active show and theme", "icon": "📺", "priority": 1}, {"active": true, "label": "ACTIVE THEME", "headline": "Theme Engine", "body": "Controlled from admin", "icon": "🎨", "priority": 2}], "box3": [{"active": true, "label": "TOP 20", "headline": "FOLSOE Chart", "body": "Weekly Listening Chart", "icon": "🎵", "priority": 1}, {"active": true, "label": "REQUESTS", "headline": "Requests open", "body": "!ønske / !request / !Wunsch", "icon": "🎧", "priority": 2}], "box4": {"locked": "twitch-chat"}};
let showVisuals=JSON.parse(JSON.stringify(DEFAULT_SHOW_VISUALS));
let overlayContent=JSON.parse(JSON.stringify(DEFAULT_OVERLAY_CONTENT));

async function loadContentManager(){
  try{
    const sv=await api('/api/show-visuals');
    showVisuals=sv.items||DEFAULT_SHOW_VISUALS;
  }catch(e){showVisuals=DEFAULT_SHOW_VISUALS;}
  try{
    const oc=await api('/api/overlay-content');
    overlayContent=oc.items||DEFAULT_OVERLAY_CONTENT;
  }catch(e){overlayContent=DEFAULT_OVERLAY_CONTENT;}
  renderShowVisuals();
  renderOverlayContent();
}

function renderShowVisuals_real(){
  const el=document.getElementById('showVisualsEditor'); if(!el)return;
  el.innerHTML=Object.entries(showVisuals).map(([key,v])=>`
    <div class="row visual">
      <div><label>Key</label><input data-sv="${key}" data-f="key" value="${key}" disabled></div>
      <div><label>Icon</label><input data-sv="${key}" data-f="icon" value="${esc(v.icon||'')}"></div>
      <div><label>Tag</label><input data-sv="${key}" data-f="tag" value="${esc(v.tag||'')}"></div>
      <div><label>Poster tekst</label><input data-sv="${key}" data-f="posterText" value="${esc(v.posterText||'')}"></div>
      <div><label>Gradient</label><input data-sv="${key}" data-f="gradient" value="${esc(v.gradient||'')}"></div>
      <button onclick="delete showVisuals['${key}'];renderShowVisuals()">Slet</button>
    </div>`).join('');
}

function collectShowVisuals(){
  document.querySelectorAll('[data-sv][data-f]').forEach(inp=>{
    const key=inp.dataset.sv, f=inp.dataset.f;
    if(!showVisuals[key]) showVisuals[key]={};
    showVisuals[key][f]=inp.value;
  });
}

async function saveShowVisuals_real(){
  collectShowVisuals();
  try{
    await api('/api/show-visuals',{method:'POST',body:JSON.stringify({items:showVisuals})});
    setStatus('✅ Show grafik gemt');
    loadContentManager();
  }catch(e){setStatus('❌ Show grafik fejl: '+e.message);}
}

function resetShowVisuals_real(){showVisuals=JSON.parse(JSON.stringify(DEFAULT_SHOW_VISUALS));renderShowVisuals();}

function overlayArr(box){if(!Array.isArray(overlayContent[box])) overlayContent[box]=[]; return overlayContent[box];}
function renderOverlayContent(){
  ['box1','box2','box3'].forEach(box=>{
    const el=document.getElementById(box+'Editor'); if(!el)return;
    el.innerHTML=overlayArr(box).map((v,i)=>`
      <div class="row overlayItem">
        <div><label>Active</label><select data-oc="${box}" data-i="${i}" data-f="active"><option value="true" ${v.active!==false?'selected':''}>Yes</option><option value="false" ${v.active===false?'selected':''}>No</option></select></div>
        <div><label>Icon</label><input data-oc="${box}" data-i="${i}" data-f="icon" value="${esc(v.icon||'')}"></div>
        <div><label>Label</label><input data-oc="${box}" data-i="${i}" data-f="label" value="${esc(v.label||'')}"></div>
        <div><label>Headline</label><input data-oc="${box}" data-i="${i}" data-f="headline" value="${esc(v.headline||'')}"></div>
        <div><label>Body</label><input data-oc="${box}" data-i="${i}" data-f="body" value="${esc(v.body||'')}"></div>
        <button onclick="overlayArr('${box}').splice(${i},1);renderOverlayContent()">Slet</button>
      </div>`).join('');
  });
}

function collectOverlayContent(){
  document.querySelectorAll('[data-oc][data-i][data-f]').forEach(inp=>{
    const box=inp.dataset.oc, i=Number(inp.dataset.i), f=inp.dataset.f;
    const a=overlayArr(box);
    if(!a[i]) a[i]={};
    let v=inp.value;
    if(f==='active') v=v==='true';
    a[i][f]=v;
    a[i].priority=i+1;
  });
  overlayContent.box4={locked:'twitch-chat'};
}

function addOverlayItem(box){
  overlayArr(box).push({active:true,label:'NYT INDHOLD',headline:'Overskrift',body:'Tekst',icon:'✨',priority:overlayArr(box).length+1});
  renderOverlayContent();
}

async function saveOverlayContent(){
  collectOverlayContent();
  try{
    await api('/api/overlay-content',{method:'POST',body:JSON.stringify({items:overlayContent})});
    setStatus('✅ Overlay bokse gemt');
    loadContentManager();
  }catch(e){setStatus('❌ Overlay bokse fejl: '+e.message);}
}

function resetOverlayContent(){overlayContent=JSON.parse(JSON.stringify(DEFAULT_OVERLAY_CONTENT));renderOverlayContent();}


// ===== V816.15 Discovery hard fix =====
discoveryItems = Array.isArray(discoveryItems) ? discoveryItems : [];

async function loadDiscovery(){
  try{
    const r = await api('/api/discovery-picks');
    discoveryItems = Array.isArray(r.items) ? r.items : [];
  }catch(e){
    discoveryItems = [{"artist": "Mau P", "title": "The Less I Know The Better", "genre": "Dance", "note": "Ny energi til chart-showet"}, {"artist": "Peggy Gou", "title": "Find The Way", "genre": "House", "note": "Lige opdaget og testet i mix"}, {"artist": "Anyma", "title": "Hypnotized", "genre": "Melodic Techno", "note": "Kunne blive en stærk bobler"}];
  }
  renderDiscoveryEditor();
}

function renderDiscoveryEditor(){
  const el=document.getElementById('discoveryEditor');
  if(!el)return;
  while(discoveryItems.length<3) discoveryItems.push({artist:'',title:'',genre:'',note:'Dem her har jeg lige opdaget'});
  discoveryItems = discoveryItems.slice(0,3);
  el.innerHTML = discoveryItems.map((x,i)=>`
    <div class="row top20">
      <div><label>#</label><input value="${i+1}" disabled></div>
      <div><label>Artist</label><input data-discovery-i="${i}" data-f="artist" value="${esc(x.artist||'')}"></div>
      <div><label>Title</label><input data-discovery-i="${i}" data-f="title" value="${esc(x.title||'')}"></div>
      <div><label>Genre</label><input data-discovery-i="${i}" data-f="genre" value="${esc(x.genre||'')}"></div>
      <div><label>Note</label><input data-discovery-i="${i}" data-f="note" value="${esc(x.note||'')}"></div>
      <button onclick="clearDiscovery(${i})">Ryd</button>
    </div>`).join('');
}

function collectDiscovery(){
  document.querySelectorAll('[data-discovery-i][data-f]').forEach(inp=>{
    const i=Number(inp.dataset.discoveryI), f=inp.dataset.f;
    if(!discoveryItems[i]) discoveryItems[i]={};
    discoveryItems[i][f]=inp.value;
    discoveryItems[i].priority=i+1;
  });
  discoveryItems = discoveryItems.slice(0,3);
}

function addDiscovery(){
  collectDiscovery();
  if(discoveryItems.length<3) discoveryItems.push({artist:'',title:'',genre:'',note:'Dem her har jeg lige opdaget'});
  renderDiscoveryEditor();
}

function clearDiscovery(i){
  discoveryItems[i]={artist:'',title:'',genre:'',note:'',priority:i+1};
  renderDiscoveryEditor();
}

async function saveDiscovery(){
  collectDiscovery();
  try{
    const r = await api('/api/discovery-picks',{method:'POST',body:JSON.stringify({items:discoveryItems})});
    discoveryItems = r.items || discoveryItems;
    renderDiscoveryEditor();
    setStatus('✅ Discovery picks gemt. Åbn forsiden med ?v=81615 og Ctrl+F5.');
  }catch(e){
    setStatus('❌ Discovery gem-fejl: '+e.message);
  }
}


// ===== V816.16 Mods + Community + Next Show =====
let modItems=[];
let communityItems=[];
let nextShowItem={};

async function loadEcosystem(){
  try{ modItems=(await api('/api/mod-team')).items||[]; }catch(e){ modItems=[{"login": "djcosmodk", "role": "Chat Safety", "description": "Holder styr på chatten og den gode stemning.", "active": true, "priority": 1}, {"login": "djkessedk", "role": "Community", "description": "Hjælper nye seere og bakker DJ-fællesskabet op.", "active": true, "priority": 2}, {"login": "requesthelper", "role": "Requests", "description": "Hjælper med musikønsker og chat-flow.", "active": true, "priority": 3}]; }
  try{ communityItems=(await api('/api/community-wall')).items||[]; }catch(e){ communityItems=[{"key": "latestFollower", "label": "Seneste follower", "value": "Twitch community", "active": true, "priority": 1}, {"key": "latestSub", "label": "Seneste sub", "value": "Tak for støtten", "active": true, "priority": 2}, {"key": "latestRaid", "label": "Seneste raid", "value": "DJ Network love", "active": true, "priority": 3}, {"key": "topRequester", "label": "Top requester", "value": "Chatten bestemmer", "active": true, "priority": 4}, {"key": "memberOfMonth", "label": "Månedens community medlem", "value": "Good vibes only", "active": true, "priority": 5}]; }
  try{ nextShowItem=(await api('/api/next-show')).item||{}; }catch(e){ nextShowItem={"title": "Fredagsbar", "dateTime": "", "description": "Fest, grin, requests og weekendstemning.", "active": true}; }
  renderModsEditor();
  renderCommunityEditor();
  renderNextShowEditor();
}

function renderModsEditor(){
  const el=document.getElementById('modsEditor'); if(!el)return;
  el.innerHTML=modItems.map((m,i)=>`
    <div class="row modRow">
      <div><label>Active</label><select data-mod-i="${i}" data-f="active"><option value="true" ${m.active!==false?'selected':''}>Yes</option><option value="false" ${m.active===false?'selected':''}>No</option></select></div>
      <div><label>Twitch login</label><input data-mod-i="${i}" data-f="login" value="${esc(m.login||m.name||'')}"></div>
      <div><label>Rolle</label><input data-mod-i="${i}" data-f="role" value="${esc(m.role||'')}"></div>
      <div><label>Beskrivelse</label><input data-mod-i="${i}" data-f="description" value="${esc(m.description||'')}"></div>
      <div><label>Sort</label><input data-mod-i="${i}" data-f="priority" value="${m.priority||i+1}"></div>
      <button onclick="modItems.splice(${i},1);renderModsEditor()">Slet</button>
    </div>`).join('');
}
function collectMods(){
  document.querySelectorAll('[data-mod-i][data-f]').forEach(inp=>{
    const i=Number(inp.dataset.modI), f=inp.dataset.f;
    if(!modItems[i]) modItems[i]={};
    let v=inp.value; if(f==='active')v=v==='true'; if(f==='priority')v=Number(v||99);
    modItems[i][f]=v;
  });
}
function addMod(){collectMods();modItems.push({login:'',role:'Mod',description:'',active:true,priority:modItems.length+1});renderModsEditor();}
async function saveMods(){collectMods();try{await api('/api/mod-team',{method:'POST',body:JSON.stringify({items:modItems})});setStatus('✅ Mods gemt');loadEcosystem();}catch(e){setStatus('❌ Mods fejl: '+e.message);}}

function renderCommunityEditor(){
  const el=document.getElementById('communityEditor'); if(!el)return;
  el.innerHTML=communityItems.map((m,i)=>`
    <div class="row communityRow">
      <div><label>Active</label><select data-com-i="${i}" data-f="active"><option value="true" ${m.active!==false?'selected':''}>Yes</option><option value="false" ${m.active===false?'selected':''}>No</option></select></div>
      <div><label>Label</label><input data-com-i="${i}" data-f="label" value="${esc(m.label||'')}"></div>
      <div><label>Value</label><input data-com-i="${i}" data-f="value" value="${esc(m.value||'')}"></div>
      <div><label>Sort</label><input data-com-i="${i}" data-f="priority" value="${m.priority||i+1}"></div>
      <button onclick="communityItems.splice(${i},1);renderCommunityEditor()">Slet</button>
    </div>`).join('');
}
function collectCommunity(){
  document.querySelectorAll('[data-com-i][data-f]').forEach(inp=>{
    const i=Number(inp.dataset.comI), f=inp.dataset.f;
    if(!communityItems[i]) communityItems[i]={};
    let v=inp.value; if(f==='active')v=v==='true'; if(f==='priority')v=Number(v||99);
    communityItems[i][f]=v;
  });
}
function addCommunity(){collectCommunity();communityItems.push({label:'Nyt felt',value:'',active:true,priority:communityItems.length+1});renderCommunityEditor();}
async function saveCommunity(){collectCommunity();try{await api('/api/community-wall',{method:'POST',body:JSON.stringify({items:communityItems})});setStatus('✅ Community wall gemt');loadEcosystem();}catch(e){setStatus('❌ Community fejl: '+e.message);}}

function renderNextShowEditor(){
  if(!document.getElementById('nextShowTitle'))return;
  document.getElementById('nextShowTitle').value=nextShowItem.title||'';
  document.getElementById('nextShowDescription').value=nextShowItem.description||'';
  if(nextShowItem.dateTime){
    const d=new Date(nextShowItem.dateTime);
    if(!isNaN(d)) document.getElementById('nextShowDateTime').value=d.toISOString().slice(0,16);
  }
}
async function saveNextShow(){
  const item={active:true,title:document.getElementById('nextShowTitle').value,description:document.getElementById('nextShowDescription').value,dateTime:document.getElementById('nextShowDateTime').value};
  try{await api('/api/next-show',{method:'POST',body:JSON.stringify({item})});setStatus('✅ Næste show gemt');loadEcosystem();}catch(e){setStatus('❌ Næste show fejl: '+e.message);}
}

let seoItem={"siteName": "DJ FOLSOE TV", "domain": "https://folsoetv.dk", "title": {"da": "DJ FOLSOE | Dansk Twitch DJ, Dance Music & Music Streams Denmark", "en": "DJ FOLSOE | Danish Twitch DJ, Dance Music & Music Streams Denmark", "de": "DJ FOLSOE | Dänischer Twitch DJ, Dance Music & Music Streams Denmark"}, "description": {"da": "DJ FOLSOE er en dansk Twitch DJ og musikstreamer med live DJ-shows, Top 20, Trance Tuesday, Eurodance, Retro Hits, requests og community.", "en": "DJ FOLSOE is a Danish Twitch DJ and music streamer with live DJ shows, Top 20, Trance Tuesday, Eurodance, Retro Hits, song requests and community.", "de": "DJ FOLSOE ist ein dänischer Twitch-DJ und Musikstreamer mit Live-DJ-Shows, Top 20, Trance Tuesday, Eurodance, Retro Hits, Musikwünschen und Community."}, "keywords": ["DJ FOLSOE", "DJ Folsoe Twitch", "Danish Twitch DJ", "dance music streams Denmark", "music streams Denmark", "Twitch music streamer Denmark", "Eurodance Twitch", "Trance DJ Denmark"], "sameAs": ["https://twitch.tv/djfolsoe"], "image": "https://folsoetv.dk/assets/og-dj-folsoe.jpg", "showPages": [{"slug": "trance-tuesday", "title": "Trance Tuesday", "description": "Uplifting trance music show live from Denmark with DJ FOLSOE."}, {"slug": "fredagsbar", "title": "Fredagsbar", "description": "Weekend party, dance music, requests and community live on Twitch."}, {"slug": "folsoe-top20", "title": "FOLSOE Top 20", "description": "Weekly Top 20 music chart and countdown show with DJ FOLSOE."}, {"slug": "retro-hits", "title": "Retro Hits", "description": "Classic retro hits, Eurodance, 90s and 00s music streams from Denmark."}, {"slug": "good-morning-twitch", "title": "Good Morning Twitch", "description": "Morning music, coffee and good vibes with DJ FOLSOE."}, {"slug": "popup", "title": "PopUp", "description": "Surprise live DJ streams when you least expect it."}, {"slug": "weekend", "title": "Weekend", "description": "Weekend music streams with dance, Eurodance, Trance and community."}]};
async function loadSEO(){ try{ const r=await api('/api/seo'); seoItem=r.seo||r; }catch(e){} fillSEO(); }
function fillSEO(){
  if(!document.getElementById('seoSiteName'))return;
  document.getElementById('seoSiteName').value=seoItem.siteName||'DJ FOLSOE TV';
  document.getElementById('seoDomain').value=seoItem.domain||'https://folsoetv.dk';
  document.getElementById('seoKeywords').value=(seoItem.keywords||[]).join(', ');
  document.getElementById('seoSameAs').value=(seoItem.sameAs||[]).join('\n');
  document.getElementById('seoTitleDa').value=seoItem.title?.da||'';
  document.getElementById('seoTitleEn').value=seoItem.title?.en||'';
  document.getElementById('seoTitleDe').value=seoItem.title?.de||'';
  document.getElementById('seoDescDa').value=seoItem.description?.da||'';
  document.getElementById('seoDescEn').value=seoItem.description?.en||'';
  document.getElementById('seoDescDe').value=seoItem.description?.de||'';
}
async function saveSEO(){
  const seo={...seoItem,siteName:document.getElementById('seoSiteName').value.trim(),domain:document.getElementById('seoDomain').value.trim(),keywords:document.getElementById('seoKeywords').value.split(',').map(x=>x.trim()).filter(Boolean),sameAs:document.getElementById('seoSameAs').value.split(/\n|,/).map(x=>x.trim()).filter(Boolean),title:{da:document.getElementById('seoTitleDa').value,en:document.getElementById('seoTitleEn').value,de:document.getElementById('seoTitleDe').value},description:{da:document.getElementById('seoDescDa').value,en:document.getElementById('seoDescEn').value,de:document.getElementById('seoDescDe').value}};
  try{ await api('/api/seo',{method:'POST',body:JSON.stringify(seo)}); setStatus('✅ SEO gemt'); loadSEO(); }catch(e){ setStatus('❌ SEO-fejl: '+e.message); }
}


// ===== V816.18.2 Top20 + Discovery Stable =====
let discoveryItemsStable=[];

async function loadTop20Stable(){
  try{
    const r=await api('/api/top20');
    top20Items=(r.items&&r.items.length?r.items:TOP20_STABLE_SEED).slice(0,20);
  }catch(e){ top20Items=TOP20_STABLE_SEED.slice(0,20); }
  renderEditors();
}

async function loadDiscoveryStable(){
  try{
    const r=await api('/api/discovery-picks');
    discoveryItemsStable=(r.items&&r.items.length?r.items:DISCOVERY_STABLE_SEED).slice(0,3);
  }catch(e){ discoveryItemsStable=DISCOVERY_STABLE_SEED.slice(0,3); }
  renderDiscoveryEditor();
}

function renderDiscoveryEditor(){
  const el=document.getElementById('discoveryEditor');
  if(!el)return;
  while(discoveryItemsStable.length<3) discoveryItemsStable.push({artist:'',title:'',genre:'',note:'Dem her har jeg lige opdaget',priority:discoveryItemsStable.length+1});
  discoveryItemsStable=discoveryItemsStable.slice(0,3);
  el.innerHTML=discoveryItemsStable.map((x,i)=>`
    <div class="row top20">
      <div><label>#</label><input value="${i+1}" disabled></div>
      <div><label>Artist</label><input data-discovery-i="${i}" data-f="artist" value="${esc(x.artist||'')}"></div>
      <div><label>Title</label><input data-discovery-i="${i}" data-f="title" value="${esc(x.title||'')}"></div>
      <div><label>Genre</label><input data-discovery-i="${i}" data-f="genre" value="${esc(x.genre||'')}"></div>
      <div><label>Note</label><input data-discovery-i="${i}" data-f="note" value="${esc(x.note||'')}"></div>
      <button onclick="clearDiscovery(${i})">Ryd</button>
    </div>`).join('');
}

function collectDiscovery(){
  document.querySelectorAll('[data-discovery-i][data-f]').forEach(inp=>{
    const i=Number(inp.dataset.discoveryI), f=inp.dataset.f;
    if(!discoveryItemsStable[i]) discoveryItemsStable[i]={};
    discoveryItemsStable[i][f]=inp.value;
    discoveryItemsStable[i].priority=i+1;
  });
  discoveryItemsStable=discoveryItemsStable.slice(0,3);
}

function addDiscovery(){
  collectDiscovery();
  if(discoveryItemsStable.length<3) discoveryItemsStable.push({artist:'',title:'',genre:'',note:'Dem her har jeg lige opdaget',priority:discoveryItemsStable.length+1});
  renderDiscoveryEditor();
}
function clearDiscovery(i){ discoveryItemsStable[i]={artist:'',title:'',genre:'',note:'',priority:i+1}; renderDiscoveryEditor(); }

async function saveDiscovery(){
  collectDiscovery();
  try{
    const r=await api('/api/discovery-picks',{method:'POST',body:JSON.stringify({items:discoveryItemsStable})});
    discoveryItemsStable=(r.items||discoveryItemsStable).slice(0,3);
    renderDiscoveryEditor();
    setStatus('✅ Discovery gemt');
  }catch(e){ setStatus('❌ Discovery gem-fejl: '+e.message); }
}

async function saveTop20Stable(){
  collect();
  top20Items=top20Items.slice(0,20);
  try{
    const r=await api('/api/top20',{method:'POST',body:JSON.stringify({items:top20Items})});
    top20Items=(r.items||top20Items).slice(0,20);
    renderEditors();
    setStatus('✅ Top 20 gemt');
  }catch(e){ setStatus('❌ Top20 gem-fejl: '+e.message); }
}


// ===== V816.18.4 Request Engine Stable =====
let requestManagerItems=[];
async function loadRequestManager(){
  try{const r=await api('/api/requests');requestManagerItems=r.all||r.items||[];renderRequestManager(r.stats||{});}
  catch(e){requestManagerItems=[];renderRequestManager({});if(typeof setStatus==="function")setStatus('❌ Request load-fejl: '+e.message);}
}
function renderRequestManager(stats){
  const statsEl=document.getElementById('requestStatsPreview');
  if(statsEl){const s=stats||{};statsEl.innerHTML=[['I dag',s.today||0],['I alt',s.total||0],['Top artist',s.topArtist?.name||'-'],['Top requester',s.topRequester?.name||'-']].map(x=>`<div class="previewCard"><b>${x[0]}</b><p>${x[1]}</p></div>`).join('');}
  const el=document.getElementById('requestsManager'); if(!el)return;
  el.innerHTML=(requestManagerItems||[]).map((r,i)=>`<div class="row requestRow"><div><label>Status</label><select data-req-i="${i}" data-f="status"><option value="approved" ${r.status!=='rejected'?'selected':''}>Approved</option><option value="rejected" ${r.status==='rejected'?'selected':''}>Rejected</option></select></div><div><label>Pin</label><select data-req-i="${i}" data-f="pinned"><option value="false" ${!r.pinned?'selected':''}>No</option><option value="true" ${r.pinned?'selected':''}>Yes</option></select></div><div><label>User</label><input data-req-i="${i}" data-f="user" value="${esc(r.user||r.name||'')}"></div><div><label>Song</label><input data-req-i="${i}" data-f="song" value="${esc(r.song||'')}"></div><div><label>Lang</label><input data-req-i="${i}" data-f="language" value="${esc(r.language||'da')}"></div><button onclick="requestManagerItems.splice(${i},1);renderRequestManager({})">Slet</button></div>`).join('');
}
function collectRequestManager(){document.querySelectorAll('[data-req-i][data-f]').forEach(inp=>{const i=Number(inp.dataset.reqI),f=inp.dataset.f;if(!requestManagerItems[i])requestManagerItems[i]={};let v=inp.value;if(f==='pinned')v=v==='true';requestManagerItems[i][f]=v;});}
async function addRequest(){try{const body={user:document.getElementById('reqUser')?.value||'Admin',text:document.getElementById('reqText')?.value||'!ønske Artist - Title',language:document.getElementById('reqLang')?.value||'da',show:document.getElementById('reqShow')?.value||'DJ FOLSOE LIVE'};await api('/api/requests',{method:'POST',body:JSON.stringify(body)});if(typeof setStatus==="function")setStatus('✅ Request tilføjet');await loadRequestManager();}catch(e){if(typeof setStatus==="function")setStatus('❌ Request fejl: '+e.message);}}
async function saveRequestList(){collectRequestManager();try{const r=await api('/api/requests',{method:'PUT',body:JSON.stringify({items:requestManagerItems})});requestManagerItems=r.items||requestManagerItems;renderRequestManager(r.stats||{});if(typeof setStatus==="function")setStatus('✅ Request-listen er gemt');}catch(e){if(typeof setStatus==="function")setStatus('❌ Request gem-fejl: '+e.message);}}


// ===== V816.19 Big Content Expansion Admin =====
const CE_DATA={tvGuide:[{"day": "Tirsdag", "time": "18:30", "title": "Trance Tuesday", "text": "Store melodier, energi og trance-fællesskab.", "type": "trance", "active": true, "priority": 1}, {"day": "Torsdag", "time": "18:30", "title": "FOLSOE Top 20", "text": "Ugens største tracks i countdown-format.", "type": "chart", "active": true, "priority": 2}, {"day": "Fredag", "time": "20:00", "title": "Fredagsbar", "text": "Live DJ med sjov, ballade og weekendstemning.", "type": "party", "active": true, "priority": 3}, {"day": "Søndag", "time": "20:00", "title": "Retro Hits", "text": "Klassikere, nostalgi og gamle hits med nyt liv.", "type": "retro", "active": true, "priority": 4}],viewerJourney:[{"key": "followers", "label": "Followers", "current": 870, "target": 1000, "text": "Rejsen mod 1000 followers på Twitch.", "active": true, "priority": 1}, {"key": "subs", "label": "Subs", "current": 0, "target": 100, "text": "Subs hjælper med teknik, grafik og shows.", "active": true, "priority": 2}, {"key": "community", "label": "Community", "current": 0, "target": 500, "text": "Flere aktive seere og mere fællesskab.", "active": true, "priority": 3}],hallOfFame:[{"title": "Månedens chatter", "name": "Twitch chatten", "text": "Den der holder energien oppe.", "icon": "💬", "active": true, "priority": 1}, {"title": "Top requester", "name": "Musikønsker", "text": "Den der finder de bedste tracks.", "icon": "🎧", "active": true, "priority": 2}, {"title": "Community hero", "name": "DJ FOLSOE Family", "text": "Kærlighed til dem der støtter streamen.", "icon": "💜", "active": true, "priority": 3}],liveRequestWall:[{"user": "Chat", "song": "Skriv !ønske Artist - Title", "language": "da", "time": "live", "active": true, "priority": 1}, {"user": "Chat", "song": "Use !request Artist - Title", "language": "en", "time": "live", "active": true, "priority": 2}, {"user": "Chat", "song": "Nutze !Wunsch Künstler - Titel", "language": "de", "time": "live", "active": true, "priority": 3}],musicDiscovery:[{"artist": "Mau P", "title": "The Less I Know The Better", "genre": "Dance", "note": "Ny energi til chart-showet.", "active": true, "priority": 1}, {"artist": "Peggy Gou", "title": "Find The Way", "genre": "House", "note": "Frisk house-vibe til streamen.", "active": true, "priority": 2}, {"artist": "Anyma", "title": "Hypnotized", "genre": "Melodic Techno", "note": "Kan blive en stærk bobler.", "active": true, "priority": 3}],showArchive:[{"title": "Trance Tuesday Highlights", "date": "Seneste show", "text": "Melodisk trance, energi og community moments.", "image": "", "active": true, "priority": 1}, {"title": "Fredagsbar Replay", "date": "Seneste fredag", "text": "Weekendstemning og live DJ-energi.", "image": "", "active": true, "priority": 2}, {"title": "Top 20 Countdown", "date": "Denne uge", "text": "Ugens vigtigste tracks og discoveries.", "image": "", "active": true, "priority": 3}]};
const CE_PATHS={tvGuide:"/api/tv-guide",viewerJourney:"/api/viewer-journey",hallOfFame:"/api/hall-of-fame",liveRequestWall:"/api/live-request-wall",musicDiscovery:"/api/music-discovery",showArchive:"/api/show-archive"};
function ceEsc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;")}
function renderCEAdmin(){const el=document.getElementById("ceAdmin");if(!el)return;el.innerHTML=Object.keys(CE_DATA).map(k=>`<h3>${k}</h3>`+CE_DATA[k].map((x,i)=>`<div class="row ceRow">`+Object.keys(x).map(f=>`<div><label>${f}</label><input data-ce="${k}" data-i="${i}" data-f="${f}" value="${ceEsc(x[f])}"></div>`).join("")+`</div>`).join("")+`<button onclick="CE_DATA['${k}'].push({...CE_DATA['${k}'][0],priority:CE_DATA['${k}'].length+1});renderCEAdmin()">Tilføj ${k}</button>`).join("")}
function collectCEAdmin(){document.querySelectorAll("[data-ce][data-i][data-f]").forEach(inp=>{const k=inp.dataset.ce,i=+inp.dataset.i,f=inp.dataset.f;let v=inp.value;if(["priority","current","target"].includes(f))v=+v;if(f==="active")v=(v==="true"||v===true);CE_DATA[k][i][f]=v})}
async function loadCEAdmin(){try{const r=await api("/api/content-expansion");Object.keys(CE_DATA).forEach(k=>{if(r[k])CE_DATA[k]=r[k]})}catch(e){console.warn(e)}renderCEAdmin()}
async function saveCEAdmin(){collectCEAdmin();for(const k of Object.keys(CE_DATA)){await api(CE_PATHS[k],{method:"POST",body:JSON.stringify({items:CE_DATA[k]})})}if(typeof setStatus==="function")setStatus("✅ Content Expansion gemt")}
document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{try{renderCEAdmin()}catch(e){}},500));


// ===== V816.20 TV Station Experience Admin =====
const V820_SEEDS={broadcastPlanner:[{"id": "show_001", "date": "2026-08-14", "start": "20:00", "end": "23:00", "title": "Summer Closing Party", "show": "Fredagsbar", "theme": "SUMMER", "type": "Live DJ Show", "description": "Sommerens sidste store fest med live DJ, requests og fællesskab.", "cover": "", "featured": true, "liveEvent": false, "specialEvent": true, "active": true, "priority": 1}, {"id": "show_002", "date": "2026-08-18", "start": "20:00", "end": "23:00", "title": "Trance Tuesday", "show": "Trance Tuesday", "theme": "TRANCE", "type": "Trance", "description": "Melodisk trance, energi og store følelser.", "cover": "", "featured": false, "liveEvent": false, "specialEvent": false, "active": true, "priority": 2}, {"id": "show_003", "date": "2026-08-21", "start": "20:00", "end": "23:30", "title": "Fredagsbar", "show": "Fredagsbar", "theme": "FREDAGSBAR", "type": "Party", "description": "Weekendstemning, sjov og ballade direkte fra Danmark.", "cover": "", "featured": false, "liveEvent": false, "specialEvent": false, "active": true, "priority": 3}],discoveryUniverse:[{"category": "Discovery", "artist": "Mau P", "title": "The Less I Know The Better", "note": "Ny energi til chart-showet.", "active": true, "priority": 1}, {"category": "Bubbling Under", "artist": "Peggy Gou", "title": "Find The Way", "note": "Frisk house-vibe til streamen.", "active": true, "priority": 2}, {"category": "Future Hits", "artist": "Anyma", "title": "Hypnotized", "note": "Stærk kandidat til kommende shows.", "active": true, "priority": 3}, {"category": "DJ Picks", "artist": "DJ FOLSOE", "title": "Viewer Pick", "note": "Plads til dine egne opdagelser.", "active": true, "priority": 4}],hallOfFameV820:[{"title": "Månedens chatter", "name": "Twitch chatten", "text": "Den der holder energien oppe.", "icon": "💬", "active": true, "priority": 1}, {"title": "Månedens supporter", "name": "Community Hero", "text": "Kærlighed til dem der støtter udviklingen.", "icon": "💜", "active": true, "priority": 2}, {"title": "Månedens request", "name": "Top Requester", "text": "Den der finder de bedste tracks.", "icon": "🎧", "active": true, "priority": 3}, {"title": "Månedens raid", "name": "Raid Love", "text": "Når fællesskabet vokser på tværs.", "icon": "🚀", "active": true, "priority": 4}, {"title": "Månedens discovery", "name": "Future Hit", "text": "Det nye track vi ikke kan slippe.", "icon": "🏆", "active": true, "priority": 5}]};let V820=JSON.parse(JSON.stringify(V820_SEEDS));
function v820Esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;")}
function renderV820Admin(type){const el=document.getElementById(type+"Editor");if(!el)return;el.innerHTML=(V820[type]||[]).map((x,i)=>`<div class="row v820Row">`+Object.keys(x).map(k=>`<div><label>${k}</label><input data-v820="${type}" data-i="${i}" data-f="${k}" value="${v820Esc(x[k])}"></div>`).join("")+`<button onclick="V820['${type}'].splice(${i},1);renderV820Admin('${type}')">Slet</button></div>`).join("")}
function collectV820(type){document.querySelectorAll(`[data-v820="${type}"][data-i][data-f]`).forEach(inp=>{const i=+inp.dataset.i,f=inp.dataset.f;let v=inp.value;if(["priority"].includes(f))v=+v;if(["active","featured","liveEvent","specialEvent"].includes(f))v=(v==="true"||v===true);V820[type][i][f]=v;})}
function addV820(type){collectV820(type);const seed=JSON.parse(JSON.stringify(V820_SEEDS[type][0]||{}));seed.id=type+"_"+Date.now();seed.priority=(V820[type]||[]).length+1;V820[type].push(seed);renderV820Admin(type)}
async function loadV820Admin(){try{const r=await api("/api/tv-station");V820.broadcastPlanner=r.broadcastPlanner||V820_SEEDS.broadcastPlanner;V820.discoveryUniverse=r.discoveryUniverse||V820_SEEDS.discoveryUniverse;V820.hallOfFameV820=r.hallOfFameV820||V820_SEEDS.hallOfFameV820;}catch(e){console.warn(e)}Object.keys(V820_SEEDS).forEach(renderV820Admin)}
async function saveV820(type,path){collectV820(type);try{const r=await api(path,{method:"POST",body:JSON.stringify({items:V820[type]})});V820[type]=r.items||V820[type];renderV820Admin(type);if(typeof setStatus==="function")setStatus("✅ "+type+" gemt")}catch(e){if(typeof setStatus==="function")setStatus("❌ "+type+" fejl: "+e.message)}}
document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{try{loadV820Admin()}catch(e){console.warn(e)}},800));


// ===== V816.21 Homepage Broadcast Director Admin =====
let HOMEPAGE_LAYOUT=[{"key": "hero", "label": "Hero", "selector": "#hero", "visible": true, "priority": 1, "featured": false, "breaking": false}, {"key": "nextshow", "label": "Næste show", "selector": "#nextshow", "visible": true, "priority": 2, "featured": true, "breaking": false}, {"key": "who", "label": "Hvem er DJ FOLSOE", "selector": "#about,#who,#hvem", "visible": true, "priority": 3, "featured": false, "breaking": false}, {"key": "mods", "label": "Mod Team", "selector": "#mods,#modteam,#modTeam", "visible": true, "priority": 4, "featured": false, "breaking": false}, {"key": "shows", "label": "Shows", "selector": "#shows", "visible": true, "priority": 5, "featured": false, "breaking": false}, {"key": "top20", "label": "FOLSOE Top 20", "selector": "#top20", "visible": true, "priority": 6, "featured": false, "breaking": false}, {"key": "discoveryuniverse", "label": "Music Discovery", "selector": "#discoveryuniverse,#musicdiscovery,#musicDiscovery", "visible": true, "priority": 7, "featured": false, "breaking": false}, {"key": "livewall", "label": "Live Request Wall", "selector": "#livewall,#requests", "visible": true, "priority": 8, "featured": false, "breaking": false}, {"key": "community", "label": "Community", "selector": "#community", "visible": true, "priority": 9, "featured": false, "breaking": false}, {"key": "viewerjourney", "label": "Follower Journey", "selector": "#viewerjourney,#viewerJourney", "visible": true, "priority": 10, "featured": false, "breaking": false}, {"key": "halloffame", "label": "Hall Of Fame", "selector": "#halloffame,#hallOfFame", "visible": true, "priority": 11, "featured": false, "breaking": false}, {"key": "djnetwork", "label": "DJ Network", "selector": "#djnetwork,#djNetwork", "visible": true, "priority": 12, "featured": false, "breaking": false}, {"key": "comingup", "label": "Coming Up", "selector": "#comingup", "visible": true, "priority": 13, "featured": false, "breaking": false}, {"key": "tvguide", "label": "TV Guide", "selector": "#tvguide", "visible": false, "priority": 80, "featured": false, "breaking": false}, {"key": "showarchive", "label": "Show Archive", "selector": "#showarchive", "visible": false, "priority": 90, "featured": false, "breaking": false}];
function hpdEsc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;")}
function renderHomepageDirector(){
  const el=document.getElementById("homepageDirectorEditor"); if(!el)return;
  HOMEPAGE_LAYOUT.sort((a,b)=>Number(a.priority||99)-Number(b.priority||99));
  el.innerHTML=HOMEPAGE_LAYOUT.map((x,i)=>`<div class="row hpdRow">
    <div><label>Vis</label><select data-hpd="${i}" data-f="visible"><option value="true" ${x.visible!==false?"selected":""}>Vis</option><option value="false" ${x.visible===false?"selected":""}>Skjul</option></select></div>
    <div><label>Prioritet</label><input type="number" data-hpd="${i}" data-f="priority" value="${hpdEsc(x.priority)}"></div>
    <div><label>Sektion</label><input data-hpd="${i}" data-f="label" value="${hpdEsc(x.label)}"></div>
    <div><label>Featured</label><select data-hpd="${i}" data-f="featured"><option value="false" ${!x.featured?"selected":""}>Nej</option><option value="true" ${x.featured?"selected":""}>Ja</option></select></div>
    <div><label>Breaking</label><select data-hpd="${i}" data-f="breaking"><option value="false" ${!x.breaking?"selected":""}>Nej</option><option value="true" ${x.breaking?"selected":""}>Ja</option></select></div>
    <button onclick="HOMEPAGE_LAYOUT[${i}].priority=Math.max(1,Number(HOMEPAGE_LAYOUT[${i}].priority||99)-1);renderHomepageDirector()">↑</button>
    <button onclick="HOMEPAGE_LAYOUT[${i}].priority=Number(HOMEPAGE_LAYOUT[${i}].priority||99)+1;renderHomepageDirector()">↓</button>
  </div>`).join("");
}
function collectHomepageDirector(){
  document.querySelectorAll("[data-hpd][data-f]").forEach(inp=>{
    const i=Number(inp.dataset.hpd),f=inp.dataset.f; let v=inp.value;
    if(f==="priority")v=Number(v||99);
    if(["visible","featured","breaking"].includes(f))v=(v==="true");
    HOMEPAGE_LAYOUT[i][f]=v;
  });
}
async function loadHomepageDirector(){
  try{const r=await api("/api/homepage-layout");HOMEPAGE_LAYOUT=r.items||HOMEPAGE_LAYOUT;}catch(e){console.warn(e)}
  renderHomepageDirector();
}
async function saveHomepageDirector(){
  collectHomepageDirector();
  try{const r=await api("/api/homepage-layout",{method:"POST",body:JSON.stringify({items:HOMEPAGE_LAYOUT})});HOMEPAGE_LAYOUT=r.items||HOMEPAGE_LAYOUT;renderHomepageDirector();if(typeof setStatus==="function")setStatus("✅ Forside-layout gemt")}catch(e){if(typeof setStatus==="function")setStatus("❌ Layout-fejl: "+e.message)}
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{try{loadHomepageDirector()}catch(e){console.warn(e)}},1000));
