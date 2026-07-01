
/* ===== V816.20.1.1 ADMIN NULL SAFE PATCH =====
   Stopper: Cannot set properties of null (setting 'innerHTML')
*/
function DJF_el(id){ return document.getElementById(id); }
function DJF_html(id, value){
  const el = DJF_el(id);
  if(!el){ console.warn("[DJF admin] Missing element:", id); return; }
  el.innerHTML = value || "";
}
function DJF_text(id, value){
  const el = DJF_el(id);
  if(!el){ console.warn("[DJF admin] Missing text element:", id); return; }
  el.textContent = value || "";
}
function DJF_value(id, value){
  const el = DJF_el(id);
  if(!el){ console.warn("[DJF admin] Missing value element:", id); return; }
  el.value = value || "";
}
const DJF_val = DJF_value;

function DJF_get(id){
  const el = DJF_el(id);
  return el ? el.value : "";
}


const API_BASE="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
const THEMES={"fredagsbar": "🍺 FREDAGSBAR", "popup": "⚡ POPUP", "trance": "💙 TRANCE TUESDAY", "retro": "🕹️ RETRO HITS", "eurodance": "💛 EURODANCE", "morning": "☀️ GOOD MORNING TWITCH", "summer": "🌴 SUMMER BEATS", "weekend": "🎉 WEEKEND VIBES", "chart": "📊 THE CHART SHOW", "christmas": "🎄 CHRISTMAS MUSIC", "danske": "🇩🇰 DANISH HITS", "disco": "🪩 DISCO HITS", "handsup": "🙌 HANDS UP", "harddance": "🔥 HARD DANCE", "halloween": "🎃 HALLOWEEN HARD DANCE"};
const TOP20_SEED=[{"rank": 1, "artist": "Axwell & Bonn", "title": "Whatever Turns You On", "genre": "Dance", "points": 92}, {"rank": 2, "artist": "Hugel, David Guetta", "title": "Shine", "genre": "Dance", "points": 90}, {"rank": 3, "artist": "Calvin Harris", "title": "Satisfy", "genre": "Dance", "points": 88}, {"rank": 4, "artist": "Rune Rask, Hampenberg, The Minds of 99", "title": "Under Din Sne", "genre": "Bootleg Remix", "points": 87}, {"rank": 5, "artist": "Svenstrup & Vendelboe x DJ Encore", "title": "Udødelige", "genre": "Dance", "points": 86}, {"rank": 6, "artist": "Armin Van Buuren", "title": "Dream A Little Dream", "genre": "Trance", "points": 85}, {"rank": 7, "artist": "Lost Frequencies", "title": "Live It All", "genre": "Dance Pop", "points": 84}, {"rank": 8, "artist": "David Guetta, Alok", "title": "Run Run River", "genre": "Progressive EDM", "points": 83}, {"rank": 9, "artist": "Anyma", "title": "Bad Angel", "genre": "Melodic Techno", "points": 82}, {"rank": 10, "artist": "Bebe Rexha", "title": "New Religion", "genre": "Pop Dance", "points": 81}, {"rank": 11, "artist": "RAYE", "title": "Where Is My Husband!", "genre": "Pop", "points": 80}, {"rank": 12, "artist": "Tiësto", "title": "Lethal Industry 2026", "genre": "Trance", "points": 79}, {"rank": 13, "artist": "Purple Disco Machine", "title": "Beat Fantasy", "genre": "Nu-Disco", "points": 78}, {"rank": 14, "artist": "Meduza", "title": "Another World", "genre": "House", "points": 77}, {"rank": 15, "artist": "Dua Lipa", "title": "Physical Reloaded", "genre": "Pop Dance", "points": 76}, {"rank": 16, "artist": "Topic", "title": "Tonight", "genre": "Dance", "points": 75}, {"rank": 17, "artist": "Robin Schulz", "title": "Only Way Is Up", "genre": "Dance Pop", "points": 74}, {"rank": 18, "artist": "Jax Jones", "title": "Never Be Lonely", "genre": "House", "points": 73}, {"rank": 19, "artist": "Ofenbach", "title": "Overdrive", "genre": "Dance", "points": 72}, {"rank": 20, "artist": "Swedish House Mafia", "title": "Ray Of Solar", "genre": "EDM", "points": 71}];
let core=null, home=null, activeTheme="weekend";
let topItems=[],bottomItems=[],newsItems=[],showsItems=[],top20Items=[],discoveryItems=[],requestItems=[];

document.addEventListener("DOMContentLoaded",()=>{
  ensureAdminPatchDom();
  syncTokenFields(localStorage.getItem("DJF_ADMIN_TOKEN")||localStorage.getItem("djf_admin_token")||"");
  renderThemes();
  loadAll();
});

function jump(id){document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});}
function token(){
  const ids=["token","adminToken","quickAdminToken","admin_token","ADMIN_TOKEN"];
  for(const id of ids){
    const el=document.getElementById(id);
    if(el && String(el.value||"").trim()){
      const v=String(el.value||"").trim();
      localStorage.setItem("DJF_ADMIN_TOKEN",v);
      localStorage.setItem("djf_admin_token",v);
      return v;
    }
  }
  return localStorage.getItem("DJF_ADMIN_TOKEN") || localStorage.getItem("djf_admin_token") || "";
}
function syncTokenFields(v){
  v=String(v||localStorage.getItem("DJF_ADMIN_TOKEN")||localStorage.getItem("djf_admin_token")||"").trim();
  ["token","adminToken","quickAdminToken","admin_token","ADMIN_TOKEN"].forEach(id=>{
    const el=document.getElementById(id);
    if(el && v) el.value=v;
  });
  if(v){
    localStorage.setItem("DJF_ADMIN_TOKEN",v);
    localStorage.setItem("djf_admin_token",v);
  }
}
function saveToken(){
  const v=token();
  syncTokenFields(v);
  setStatus(v ? "✅ Token saved and synchronized" : "❌ Token missing");
  loadAll();
}
function openApi(path){window.open(API_BASE+path,"_blank");}
function setStatus(v){DJF_text("statusBox", v);}

async function api(path,opt={}){
  const t=token();
  opt.headers=Object.assign({"content-type":"application/json"},opt.headers||{});
  if(t){
    opt.headers["x-admin-token"]=t;
    opt.headers["authorization"]="Bearer "+t;
  }
  const r=await fetch(API_BASE+path,opt);
  const txt=await r.text();
  let j; try{j=JSON.parse(txt);}catch(e){j={raw:txt};}
  if(!r.ok){
    const detail = j?.error ? JSON.stringify(j,null,2) : txt;
    throw new Error(detail || ("HTTP "+r.status));
  }
  return j;
}

function renderThemes(){
  DJF_html("themeGrid", Object.entries(THEMES).map(([k,l])=>`<button id="theme_${k}" onclick="setThemeSafe('${k}')">${l}</button>`).join(""));
}
function markTheme(k){
  activeTheme=k||activeTheme;
  Object.keys(THEMES).forEach(x=>document.getElementById("theme_"+x)?.classList.toggle("activeThemeBtn",x===activeTheme));
  DJF_text("activeTheme", "Active theme: "+activeTheme);
}
async function setTheme(k){
  try{
    const r=await api("/api/theme",{method:"POST",body:JSON.stringify({theme:k})});
    markTheme(r.activeTheme||k);
    setStatus("✅ Theme changed to "+(r.activeTheme||k));
  }catch(e){setStatus("❌ Theme error: "+e.message);}
}

async function loadAll(){
  ensureAdminPatchDom();
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
    showsItems=results[6].value?.items||home.shows||[];
    top20Items=results[7].value?.items||home.top20||[];
    top20Items=(top20Items&&top20Items.length?top20Items:TOP20_SEED);
    discoveryItems=results[8].value?.items||home.discoveryPicks||[];
    requestItems=results[9].value?.items||home.requests||[];
    fillProfile();
    renderEditors();
    renderRequests();
    renderTwitch();
    loadDiscovery();
    loadContentManager();
    setStatus("✅ Data loaded from Broadcast Cloud\n"+new Date().toLocaleString("en-GB"));
  }catch(e){setStatus("❌ Load-fejl: "+e.message);}
}

function fillProfile(){
  DJF_value("profileName", core.profile?.name||home.profile?.name||"DJ FOLSOE");
  DJF_value("twitchChannel", core.twitchChannel||home.twitch?.login||"djfolsoe");
  DJF_value("profileDescription", core.profile?.description||home.twitch?.description||"");
  DJF_value("profileGenres", (core.profile?.genres||home.profile?.genres||[]).join(", "));
}

async function saveProfile(){
  try{
    const profile=Object.assign({},core.profile||{}, {
      name:DJF_get("profileName").trim()||"DJ FOLSOE",
      description:DJF_get("profileDescription").trim(),
      genres:DJF_get("profileGenres").split(",").map(x=>x.trim()).filter(Boolean)
    });
    const twitchChannel=DJF_get("twitchChannel").trim().toLowerCase()||"djfolsoe";
    await api("/api/core",{method:"POST",body:JSON.stringify({profile,twitchChannel})});
    setStatus("✅ Profile and front page fallback saved");
    loadAll();
  }catch(e){setStatus("❌ Profil-fejl: "+e.message);}
}

function arr(type){return type==="top"?topItems:type==="bottom"?bottomItems:type==="news"?newsItems:type==="shows"?showsItems:type==="top20"?top20Items:type==="discovery"?discoveryItems:requestItems;}
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");}

function row(type,item,i){
  if(type==="shows") return `<div class="row shows"><div><label>Key</label><input data-t="${type}" data-i="${i}" data-f="key" value="${esc(item.key||'')}"/></div><div><label>Title</label><input data-t="${type}" data-i="${i}" data-f="title" value="${esc(item.title||'')}"/></div><div><label>Time</label><input data-t="${type}" data-i="${i}" data-f="time" value="${esc(item.time||'')}"/></div><div><label>Body</label><input data-t="${type}" data-i="${i}" data-f="body" value="${esc(item.body||'')}"/></div><button onclick="delRow('${type}',${i})">Delete</button></div>`;
  if(type==="top20") return `<div class="row top20"><div><label>Rank</label><input data-t="${type}" data-i="${i}" data-f="rank" value="${item.rank||i+1}"/></div><div><label>Artist</label><input data-t="${type}" data-i="${i}" data-f="artist" value="${esc(item.artist||'')}"/></div><div><label>Title</label><input data-t="${type}" data-i="${i}" data-f="title" value="${esc(item.title||'')}"/></div><div><label>Genre</label><input data-t="${type}" data-i="${i}" data-f="genre" value="${esc(item.genre||'')}"/></div><div><label>Points</label><input data-t="${type}" data-i="${i}" data-f="points" value="${item.points||0}"/></div><button onclick="delRow('${type}',${i})">Delete</button></div>`;
  if(type==="discovery") return `<div class="row top20"><div><label>Artist</label><input data-t="${type}" data-i="${i}" data-f="artist" value="${esc(item.artist||'')}"/></div><div><label>Title</label><input data-t="${type}" data-i="${i}" data-f="title" value="${esc(item.title||'')}"/></div><div><label>Genre</label><input data-t="${type}" data-i="${i}" data-f="genre" value="${esc(item.genre||'')}"/></div><div><label>Note</label><input data-t="${type}" data-i="${i}" data-f="note" value="${esc(item.note||'')}"/></div><div><label></label></div><button onclick="delRow('${type}',${i})">Delete</button></div>`;
  if(type==="news") return `<div class="row news"><div><label>Active</label><select data-t="${type}" data-i="${i}" data-f="active"><option value="true" ${item.active!==false?'selected':''}>Yes</option><option value="false" ${item.active===false?'selected':''}>No</option></select></div><div><label>Type</label><input data-t="${type}" data-i="${i}" data-f="type" value="${esc(item.type||'News')}"/></div><div><label>Title</label><input data-t="${type}" data-i="${i}" data-f="title" value="${esc(item.title||'')}"/></div><div><label>Body</label><input data-t="${type}" data-i="${i}" data-f="body" value="${esc(item.body||'')}"/></div><div><label>Priority</label><input data-t="${type}" data-i="${i}" data-f="priority" value="${item.priority||99}"/></div><button onclick="delRow('${type}',${i})">Delete</button></div>`;
  return `<div class="row"><div><label>Active</label><select data-t="${type}" data-i="${i}" data-f="active"><option value="true" ${item.active!==false?'selected':''}>Yes</option><option value="false" ${item.active===false?'selected':''}>No</option></select></div><div><label>Theme</label><input data-t="${type}" data-i="${i}" data-f="theme" value="${esc(item.theme||'all')}"/></div><div><label>Text</label><input data-t="${type}" data-i="${i}" data-f="text" value="${esc(item.text||'')}"/></div><div><label>ID</label><input data-t="${type}" data-i="${i}" data-f="id" value="${esc(item.id||type+Date.now())}"/></div><div><label>Priority</label><input data-t="${type}" data-i="${i}" data-f="priority" value="${item.priority||99}"/></div><button onclick="delRow('${type}',${i})">Delete</button></div>`;
}

function renderEditors(){
  DJF_html("newsEditor", newsItems.map((x,i)=>row("news",x,i)).join(""));
  DJF_html("topEditor", topItems.map((x,i)=>row("top",x,i)).join(""));
  DJF_html("bottomEditor", bottomItems.map((x,i)=>row("bottom",x,i)).join(""));
  DJF_html("showsEditor", showsItems.map((x,i)=>row("shows",x,i)).join(""));
  DJF_html("top20Editor", top20Items.map((x,i)=>row("top20",x,i)).join(""));
  if(document.getElementById("discoveryEditor")) DJF_html("discoveryEditor", discoveryItems.map((x,i)=>row("discovery",x,i)).join(""));
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
  if(type==="shows") a.push({key:"new",title:"Nyt show",time:"",body:""});
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
    setStatus("✅ Savet: "+type);
    loadAll();
  }catch(e){setStatus("❌ Save-fejl: "+e.message);}
}

function seedTop20(){top20Items=TOP20_SEED.map(x=>Object.assign({},x));renderEditors();}



function renderRequests(){
  DJF_html("requestsPreview", (requestItems||[]).slice(0,3).map(x=>`<div class="previewCard"><b>${esc(x.song||x.text||"")}</b><p>${esc(x.user||"Twitch chat")}</p><small>${esc(x.time||"")}</small></div>`).join(""));
}

function renderTwitch(){
  const tw=home?.twitch||{};
  DJF_html("twitchPreview", `<div class="previewCard">${tw.avatar?`<img class="twitchAvatar" src="${tw.avatar}">`:""}<h3>${esc(tw.displayName||"DJ FOLSOE")}</h3><p>${esc(tw.description||"")}</p><p><b>Status:</b> ${tw.isLive?"LIVE":"Offline"}</p><p><b>Viewers:</b> ${tw.viewers||0}</p><p><b>Followers:</b> ${tw.followers||0}</p><p><b>Category:</b> ${esc(tw.category||"Music")}</p></div>`);
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

function renderShowVisuals(){
  const el=document.getElementById('showVisualsEditor'); if(!el)return;
  el.innerHTML=Object.entries(showVisuals).map(([key,v])=>`
    <div class="row visual">
      <div><label>Key</label><input data-sv="${key}" data-f="key" value="${key}" disabled></div>
      <div><label>Icon</label><input data-sv="${key}" data-f="icon" value="${esc(v.icon||'')}"></div>
      <div><label>Tag</label><input data-sv="${key}" data-f="tag" value="${esc(v.tag||'')}"></div>
      <div><label>Poster tekst</label><input data-sv="${key}" data-f="posterText" value="${esc(v.posterText||'')}"></div>
      <div><label>Gradient</label><input data-sv="${key}" data-f="gradient" value="${esc(v.gradient||'')}"></div>
      <button onclick="delete showVisuals['${key}'];renderShowVisuals()">Delete</button>
    </div>`).join('');
}

function collectShowVisuals(){
  document.querySelectorAll('[data-sv][data-f]').forEach(inp=>{
    const key=inp.dataset.sv, f=inp.dataset.f;
    if(!showVisuals[key]) showVisuals[key]={};
    showVisuals[key][f]=inp.value;
  });
}

async function saveShowVisuals(){
  collectShowVisuals();
  try{
    await api('/api/show-visuals',{method:'POST',body:JSON.stringify({items:showVisuals})});
    setStatus('✅ Show grafik gemt');
    loadContentManager();
  }catch(e){setStatus('❌ Show grafik fejl: '+e.message);}
}

function resetShowVisuals(){showVisuals=JSON.parse(JSON.stringify(DEFAULT_SHOW_VISUALS));renderShowVisuals();}

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
        <button onclick="overlayArr('${box}').splice(${i},1);renderOverlayContent()">Delete</button>
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
    setStatus('✅ Overlay boxe gemt');
    loadContentManager();
  }catch(e){setStatus('❌ Overlay boxe fejl: '+e.message);}
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
  try{ modItems=(await api('/api/mod-team')).items||[]; }catch(e){ modItems=[{"login": "djcosmodk", "role": "Chat Safety", "description": "Holder styr på chatten og den gode stemning.", "active": true, "priority": 1}, {"login": "djkessedk", "role": "Community", "description": "Hjælper nye seere og bakker DJ-fællesskabet op.", "active": true, "priority": 2}, {"login": "requesthelper", "role": "Requests", "description": "Helps with song requests and chat flow.", "active": true, "priority": 3}]; }
  try{ communityItems=(await api('/api/community-wall')).items||[]; }catch(e){ communityItems=[{"key": "latestFollower", "label": "Latest follower", "value": "Twitch community", "active": true, "priority": 1}, {"key": "latestSub", "label": "Latest sub", "value": "Tak for støtten", "active": true, "priority": 2}, {"key": "latestRaid", "label": "Latest raid", "value": "DJ Network love", "active": true, "priority": 3}, {"key": "topRequester", "label": "Top requester", "value": "Chatten bestemmer", "active": true, "priority": 4}, {"key": "memberOfMonth", "label": "Community member of the month", "value": "Good vibes only", "active": true, "priority": 5}]; }
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
      <button onclick="modItems.splice(${i},1);renderModsEditor()">Delete</button>
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
      <button onclick="communityItems.splice(${i},1);renderCommunityEditor()">Delete</button>
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
  DJF_value("nextShowTitle", nextShowItem.title||'');
  DJF_value("nextShowDescription", nextShowItem.description||'');
  if(nextShowItem.dateTime){
    const d=new Date(nextShowItem.dateTime);
    if(!isNaN(d)) DJF_value("nextShowDateTime", d.toISOString().slice(0,16));
  }
}
async function saveNextShow(){
  const item={active:true,title:DJF_get("nextShowTitle"),description:DJF_get("nextShowDescription"),dateTime:DJF_get("nextShowDateTime")};
  try{await api('/api/next-show',{method:'POST',body:JSON.stringify({item})});setStatus('✅ Next show gemt');loadEcosystem();}catch(e){setStatus('❌ Next show fejl: '+e.message);}
}

let seoItem={"siteName": "DJ FOLSOE TV", "domain": "https://folsoetv.dk", "title": "DJ FOLSOE TV | Music TV From Denmark", "description_old": {"da": "DJ FOLSOE er en Danish Twitch DJ og musikstreamer med live DJ-shows, Top 20, Trance Tuesday, Eurodance, Retro Hits, requests og community.", "en": "DJ FOLSOE is a Danish Twitch DJ and music streamer with live DJ shows, Top 20, Trance Tuesday, Eurodance, Retro Hits, song requests and community.", "de": "DJ FOLSOE ist ein dänischer Twitch-DJ und Musicstreamer mit Live-DJ-Shows, Top 20, Trance Tuesday, Eurodance, Retro Hits, Musicwünschen und Community."}, "keywords": ["DJ FOLSOE", "DJ Folsoe Twitch", "Danish Twitch DJ", "dance music streams Denmark", "music streams Denmark", "Twitch music streamer Denmark", "Eurodance Twitch", "Trance DJ Denmark"], "sameAs": ["https://twitch.tv/djfolsoe"], "image": "https://folsoetv.dk/assets/og-dj-folsoe.jpg", "showPages": [{"slug": "trance-tuesday", "title": "Trance Tuesday", "description": "Uplifting trance music show live from Denmark with DJ FOLSOE."}, {"slug": "fredagsbar", "title": "Fredagsbar", "description": "Weekend party, dance music, requests and community live on Twitch."}, {"slug": "folsoe-top20", "title": "FOLSOE Top 20", "description": "Weekly Top 20 music chart and countdown show with DJ FOLSOE."}, {"slug": "retro-hits", "title": "Retro Hits", "description": "Classic retro hits, Eurodance, 90s and 00s music streams from Denmark."}, {"slug": "good-morning-twitch", "title": "Good Morning Twitch", "description": "Morning music, coffee and good vibes with DJ FOLSOE."}, {"slug": "popup", "title": "PopUp", "description": "Surprise live DJ streams when you least expect it."}, {"slug": "weekend", "title": "Weekend", "description": "Weekend music streams with dance, Eurodance, Trance and community."}]};
async function loadSEO(){ try{ const r=await api('/api/seo'); seoItem=r.seo||r; }catch(e){} fillSEO(); }
function fillSEO(){
  if(!document.getElementById('seoSiteName'))return;
  DJF_value("seoSiteName", seoItem.siteName||'DJ FOLSOE TV');
  DJF_value("seoDomain", seoItem.domain||'https://folsoetv.dk');
  DJF_value("seoKeywords", (seoItem.keywords||[]).join(', '));
  DJF_value("seoSameAs", (seoItem.sameAs||[]).join('\n'));
  DJF_value("seoTitleDa", seoItem.title?.da||'');
  DJF_value("seoTitleEn", seoItem.title?.en||'');
  DJF_value("seoTitleDe", seoItem.title?.de||'');
  DJF_value("seoDescDa", seoItem.description?.da||'');
  DJF_value("seoDescEn", seoItem.description?.en||'');
  DJF_value("seoDescDe", seoItem.description?.de||'');
}
async function saveSEO(){
  const seo={...seoItem,siteName:DJF_get("seoSiteName").trim(),domain:DJF_get("seoDomain").trim(),keywords:DJF_get("seoKeywords").split(',').map(x=>x.trim()).filter(Boolean),sameAs:DJF_get("seoSameAs").split(/\n|,/).map(x=>x.trim()).filter(Boolean),title:{da:DJF_get("seoTitleDa"),en:DJF_get("seoTitleEn"),de:DJF_get("seoTitleDe")},description:{da:DJF_get("seoDescDa"),en:DJF_get("seoDescEn"),de:DJF_get("seoDescDe")}};
  try{ await api('/api/seo',{method:'POST',body:JSON.stringify(seo)}); setStatus('✅ SEO gemt'); loadSEO(); }catch(e){ setStatus('❌ SEO-fejl: '+e.message); }
}


// ===== V816.19 Request Ecosystem =====
let requestManagerItems=[];
let requestManagerStats={};

async function loadRequestManager(){
  try{
    const r=await api('/api/requests');
    requestManagerItems=r.all||r.items||[];
    requestManagerStats=r.stats||{};
  }catch(e){
    requestManagerItems=[];
    requestManagerStats={};
  }
  renderRequestManager();
}

function renderRequestManager(){
  const statsEl=document.getElementById('requestStatsPreview');
  if(statsEl){
    const s=requestManagerStats||{};
    statsEl.innerHTML=[
      ['I dag',s.today||0],
      ['I alt',s.total||0],
      ['Top artist',s.topArtist?.name||'-'],
      ['Top requester',s.topRequester?.name||'-']
    ].map(x=>`<div class="previewCard"><b>${x[0]}</b><p>${x[1]}</p></div>`).join('');
  }
  const el=document.getElementById('requestsManager');
  if(!el)return;
  el.innerHTML=(requestManagerItems||[]).map((r,i)=>`
    <div class="row requestRow">
      <div><label>Status</label><select data-req-i="${i}" data-f="status"><option value="approved" ${r.status!=='rejected'?'selected':''}>Approved</option><option value="rejected" ${r.status==='rejected'?'selected':''}>Rejected</option></select></div>
      <div><label>Pin</label><select data-req-i="${i}" data-f="pinned"><option value="false" ${!r.pinned?'selected':''}>No</option><option value="true" ${r.pinned?'selected':''}>Yes</option></select></div>
      <div><label>User</label><input data-req-i="${i}" data-f="user" value="${esc(r.user||'')}"></div>
      <div><label>Song</label><input data-req-i="${i}" data-f="song" value="${esc(r.song||'')}"></div>
      <div><label>Lang</label><input data-req-i="${i}" data-f="language" value="${esc(r.language||'da')}"></div>
      <button onclick="requestManagerItems.splice(${i},1);renderRequestManager()">Delete</button>
    </div>`).join('');
}

function collectRequestManager(){
  document.querySelectorAll('[data-req-i][data-f]').forEach(inp=>{
    const i=Number(inp.dataset.reqI), f=inp.dataset.f;
    if(!requestManagerItems[i])requestManagerItems[i]={};
    let v=inp.value;
    if(f==='pinned')v=v==='true';
    requestManagerItems[i][f]=v;
  });
}

async function addRequest(){
  try{
    const body={
      user:DJF_get("reqUser")||'Admin',
      text:DJF_get("reqText")||'!ønske Artist - Title',
      language:document.getElementById('reqLang')?.value||'da',
      show:document.getElementById('reqShow')?.value||'DJ FOLSOE LIVE'
    };
    await api('/api/requests',{method:'POST',body:JSON.stringify(body)});
    setStatus('✅ Request tilføjet');
    loadRequestManager();
  }catch(e){setStatus('❌ Request fejl: '+e.message);}
}

async function saveRequestList(){
  collectRequestManager();
  try{
    const r=await api('/api/requests',{method:'PUT',body:JSON.stringify({items:requestManagerItems})});
    requestManagerItems=r.items||requestManagerItems;
    requestManagerStats=r.stats||{};
    renderRequestManager();
    setStatus('✅ Request-listen er gemt');
  }catch(e){setStatus('❌ Request gem-fejl: '+e.message);}
}


// ===== V816.20 Community Wall Manager override =====
let communityStatsItem={};

async function loadCommunityV20(){
  try{
    const r=await api('/api/community-wall');
    communityItems=r.items||[];
    communityStatsItem=r.stats||{};
  }catch(e){}
  renderCommunityEditor();
}
function renderCommunityEditor(){
  const el=document.getElementById('communityEditor'); if(!el)return;
  el.innerHTML=(communityItems||[]).map((m,i)=>`
    <div class="row communityRow v20CommunityRow">
      <div><label>Active</label><select data-com-i="${i}" data-f="active"><option value="true" ${m.active!==false?'selected':''}>Yes</option><option value="false" ${m.active===false?'selected':''}>No</option></select></div>
      <div><label>Type</label><input data-com-i="${i}" data-f="type" value="${esc(m.type||'follower')}"></div>
      <div><label>Label</label><input data-com-i="${i}" data-f="label" value="${esc(m.label||'')}"></div>
      <div><label>User/Login</label><input data-com-i="${i}" data-f="user" value="${esc(m.user||m.login||'')}"></div>
      <div><label>Value</label><input data-com-i="${i}" data-f="value" value="${esc(m.value||'')}"></div>
      <div><label>Pin</label><select data-com-i="${i}" data-f="pinned"><option value="false" ${!m.pinned?'selected':''}>No</option><option value="true" ${m.pinned?'selected':''}>Yes</option></select></div>
      <div><label>Sort</label><input data-com-i="${i}" data-f="priority" value="${m.priority||i+1}"></div>
      <button onclick="communityItems.splice(${i},1);renderCommunityEditor()">Delete</button>
    </div>`).join('');
  if(document.getElementById('communityRaids')){
    DJF_value("communityRaids", communityStatsItem.raids||0);
    DJF_value("communityMembers", communityStatsItem.members||0);
    DJF_value("communitySubs", communityStatsItem.subs||0);
    DJF_value("communityFollowers", communityStatsItem.followers||870);
  }
}
function collectCommunity(){
  document.querySelectorAll('[data-com-i][data-f]').forEach(inp=>{
    const i=Number(inp.dataset.comI), f=inp.dataset.f;
    if(!communityItems[i]) communityItems[i]={};
    let v=inp.value; 
    if(f==='active'||f==='pinned')v=v==='true'; 
    if(f==='priority')v=Number(v||99);
    communityItems[i][f]=v;
  });
}
function addCommunity(){
  collectCommunity();
  communityItems.push({type:'follower',label:'Nyt felt',user:'',value:'',active:true,pinned:false,priority:communityItems.length+1});
  renderCommunityEditor();
}
async function saveCommunity(){
  collectCommunity();
  try{
    await api('/api/community-wall',{method:'POST',body:JSON.stringify({items:communityItems})});
    const stats={
      raids:Number(document.getElementById('communityRaids')?.value||0),
      members:Number(document.getElementById('communityMembers')?.value||0),
      subs:Number(document.getElementById('communitySubs')?.value||0),
      followers:Number(document.getElementById('communityFollowers')?.value||870)
    };
    await api('/api/community-stats',{method:'POST',body:JSON.stringify({item:stats})});
    setStatus('✅ Community Wall gemt');
    loadCommunityV20();
  }catch(e){setStatus('❌ Community fejl: '+e.message);}
}


function ensureAdminPatchDom(){
  const main = document.querySelector("main") || document.body;
  if(!document.getElementById("communityEditor")){
    const sec=document.createElement("section");
    sec.id="communityManager";
    sec.className="panel";
    sec.innerHTML='<div class="panelHead"><h2>❤️ Community Wall Manager</h2><button onclick="addCommunity()">Add community felt</button></div><div id="communityEditor"></div><button onclick="saveCommunity()">Save community wall</button>';
    main.appendChild(sec);
  }
  if(!document.getElementById("communityRaids")){
    const sec=document.getElementById("communityManager");
    if(sec){
      const box=document.createElement("div");
      box.className="formGrid";
      box.innerHTML='<div><label>Raids</label><input id="communityRaids" type="number"></div><div><label>Members</label><input id="communityMembers" type="number"></div><div><label>Subs fallback</label><input id="communitySubs" type="number"></div><div><label>Followers fallback</label><input id="communityFollowers" type="number"></div>';
      sec.appendChild(box);
    }
  }
}


/* ===== V816.20.1.6.1 ADMIN THEME FIX ===== */
function djfNormalizeThemeKey(k){
  k=String(k||"").toLowerCase().trim();
  k=k.replace(/[^\wæøå -]/g,"");
  if(k.includes("fredag")) return "fredagsbar";
  if(k.includes("pop")) return "popup";
  if(k.includes("trance")) return "trance";
  if(k.includes("retro")) return "retro";
  if(k.includes("euro")) return "eurodance";
  if(k.includes("morgen")||k.includes("morning")) return "morning";
  if(k.includes("summer")||k.includes("sommer")) return "summer";
  
  if(k.includes("chart")||k.includes("top20")||k.includes("top 20")) return "chart";
  if(k.includes("christmas")||k.includes("jul")) return "christmas";
  if(k.includes("danish")||k.includes("danske")) return "danske";
  if(k.includes("disco")) return "disco";
  if(k.includes("hands")) return "handsup";
  if(k.includes("harddance")||k.includes("hard dance")||k.includes("hardstyle")) return "harddance";
  if(k.includes("halloween")) return "halloween";
  if(k.includes("weekend")) return "weekend";
  return k || "weekend";
}
async function setThemeSafe(k){
  k=djfNormalizeThemeKey(k);
  try{
    syncTokenFields();
    const r=await api("/api/theme",{method:"POST",body:JSON.stringify({theme:k,activeTheme:k})});
    markTheme(r.activeTheme||r.theme?.activeTheme||k);
    setStatus("✅ Theme changed to "+(r.activeTheme||r.theme?.activeTheme||k));
  }catch(e){
    let msg=String(e.message||e);
    if(msg.includes("Unauthorized") || msg.includes("401")){
      const fresh=prompt("Cloudflare Worker afviser token. Indsæt den RIGTIGE ADMIN_TOKEN fra Cloudflare Worker settings:");
      if(fresh){
        syncTokenFields(fresh);
        try{
          const r=await api("/api/theme",{method:"POST",body:JSON.stringify({theme:k,activeTheme:k})});
          markTheme(r.activeTheme||r.theme?.activeTheme||k);
          setStatus("✅ Theme changed to "+(r.activeTheme||r.theme?.activeTheme||k));
          return;
        }catch(e2){ msg=String(e2.message||e2); }
      }else{
        msg="Admin token mangler eller matcher ikke Cloudflare Worker ADMIN_TOKEN.";
      }
    }
    if(msg.includes("Unknown theme")) msg="Unknown theme key. Brug: fredagsbar, popup, trance, retro, eurodance, morning, summer, weekend.";
    setStatus("❌ Theme error: "+msg);
    console.error("Theme error",e);
  }
}

async function testThemeToken(){
  try{
    syncTokenFields();
    const before=await api("/api/theme");
    setStatus("✅ Theme API GET OK\nActive theme: "+(before.activeTheme||before.theme?.activeTheme||"ukendt")+"\nToken bruges kun ved skift/gem.");
  }catch(e){
    setStatus("❌ Theme API test-fejl: "+e.message);
  }
}


/* V817 GLOBAL EDITION - English only */
localStorage.setItem("DJF_LANG","en");
document.documentElement.lang="en";

async function publishEverything(){
  try{
    readEditors();
    readOverlayContent();
    const profile={
      name:DJF_get("profileName").trim()||"DJ FOLSOE",
      description:DJF_get("profileDescription").trim(),
      genres:DJF_get("profileGenres").split(",").map(x=>x.trim()).filter(Boolean)
    };
    const payload={
      language:"en",
      theme:activeTheme||"weekend",
      profile,
      twitchChannel:DJF_get("twitchChannel").trim().toLowerCase()||"djfolsoe",
      homepageNews:newsItems,
      shows:showsItems,
      top20:top20Items,
      discoveryPicks:discoveryItems,
      overlayContent,
      topTickerItems:topItems,
      bottomTickerItems:bottomItems
    };
    const res=await api("/api/sync-all",{method:"POST",body:JSON.stringify(payload)});
    markTheme(res.activeTheme||payload.theme);
    setStatus("✅ Everything published from Admin Hub\nWebsite + overlay now use theme: "+(res.activeTheme||payload.theme));
    loadAll();
  }catch(e){setStatus("❌ Publish error: "+e.message);}
}

function readEditors(){
  document.querySelectorAll('[data-t]').forEach(input=>{
    const type=input.dataset.t, i=Number(input.dataset.i), f=input.dataset.f;
    if(!arr(type)[i]) arr(type)[i]={};
    let v=input.value; if(f==='rank'||f==='points'||f==='priority') v=Number(v||0);
    arr(type)[i][f]=v;
  });
}

function readOverlayContent(){
  ['box1','box2','box3'].forEach(box=>{
    document.querySelectorAll(`[data-ob="${box}"]`).forEach(input=>{
      const i=Number(input.dataset.i), f=input.dataset.f;
      if(!overlayContent[box]) overlayContent[box]=[];
      if(!overlayContent[box][i]) overlayContent[box][i]={};
      let v=input.type==='checkbox'?input.checked:input.value;
      if(f==='priority') v=Number(v||99);
      overlayContent[box][i][f]=v;
    });
  });
  overlayContent.box4={locked:'twitch-chat'};
}


/* ===== V904 ONE BUTTON CONTROL ===== */
const V904_PRESETS={
  morning:{theme:'morning',onAir:'GOOD MORNING TWITCH',next:'Fresh morning vibes · coffee and music',headline:'Good Morning Twitch is on air',message:'Start the day with fresh music, chat energy and live DJ vibes from Denmark.',goal:'870/1000 followers',request:'Requests open · !request'},
  trance:{theme:'trance',onAir:'TRANCE TUESDAY',next:'Uplifting trance and emotional melodies',headline:'Trance Tuesday live from Denmark',message:'Blue lasers, big melodies and pure uplifting energy on DJ FOLSOE TV.',goal:'870/1000 followers',request:'Requests open · trance requests welcome'},
  chart:{theme:'chart',onAir:'FOLSOE TOP 20',next:'Weekly chart countdown show',headline:'FOLSOE Top 20 is live',message:'The weekly countdown with hit radar, new entries and community favourites.',goal:'870/1000 followers',request:'Vote, request and follow the chart'},
  fredagsbar:{theme:'fredagsbar',onAir:'FREDAGSBAR',next:'Weekend starts here',headline:'Fredagsbar is open',message:'Weekend energy, party tracks and community love from DJ FOLSOE TV.',goal:'870/1000 followers',request:'Requests open · party tracks welcome'},
  retro:{theme:'retro',onAir:'RETRO HITS',next:'Classics that refuse to retire',headline:'Retro Hits on DJ FOLSOE TV',message:'Back to the classics with nostalgic hits, singalong moments and big memories.',goal:'870/1000 followers',request:'Requests open · retro favourites welcome'},
  eurodance:{theme:'eurodance',onAir:'EURODANCE',next:'90s and 00s dance energy',headline:'Eurodance live on DJ FOLSOE TV',message:'Big beats, big hooks and maximum 90s/00s dance energy.',goal:'870/1000 followers',request:'Requests open · Eurodance anthems welcome'},
  popup:{theme:'popup',onAir:'POP UP LIVE',next:'Surprise stream activated',headline:'Pop Up stream is live',message:'The stream that appears when you least expect it. Say hi in chat and join the moment.',goal:'870/1000 followers',request:'Requests open · surprise me'},
  weekend:{theme:'weekend',onAir:'WEEKEND VIBES',next:'Maximum music and community',headline:'Weekend Vibes on DJ FOLSOE TV',message:'High-energy music TV feeling with chat, requests, community and live DJ power.',goal:'870/1000 followers',request:'Requests open · weekend bangers welcome'}
};

function toggleAdvanced(){
  document.querySelectorAll('.advancedPanel').forEach(x=>x.classList.toggle('showAdvanced'));
}
function setQuickStatus(msg){ const el=document.getElementById('oneClickStatus'); if(el) el.textContent=msg; }
function quickShow(key){
  const p=V904_PRESETS[key]||V904_PRESETS.weekend;
  activeTheme=p.theme;
  markTheme(p.theme);
  DJF_val('quickOnAir',p.onAir);
  DJF_val('quickNextShow',p.next);
  DJF_val('quickFollowerGoal',p.goal);
  DJF_val('quickRequestLine',p.request);
  DJF_val('quickHeadline',p.headline);
  DJF_val('quickMessage',p.message);
  document.querySelectorAll('.quickGrid button').forEach(btn=>btn.classList.remove('oneClickActive'));
  const btn=[...document.querySelectorAll('.quickGrid button')].find(b=>b.textContent.toLowerCase().includes(key==='fredagsbar'?'fredagsbar':key));
  if(btn) btn.classList.add('oneClickActive');
  setQuickStatus('Preset loaded: '+p.onAir+' · theme '+p.theme+'. Press Apply + publish now.');
}
function applyQuickFields(){
  const onAir=DJF_get('quickOnAir').trim()||'DJ FOLSOE LIVE';
  const next=DJF_get('quickNextShow').trim()||'Next show loading';
  const goal=DJF_get('quickFollowerGoal').trim()||'870/1000 followers';
  const req=DJF_get('quickRequestLine').trim()||'Requests open · !request';
  const headline=DJF_get('quickHeadline').trim()||onAir;
  const message=DJF_get('quickMessage').trim()||'Live music TV from Denmark.';
  newsItems = newsItems && newsItems.length ? newsItems : [];
  newsItems[0]={id:'news-live-now',active:true,type:'Live now',title:headline,body:message,theme:'all',priority:1};
  topItems = topItems && topItems.length ? topItems : [];
  topItems[0]={id:'top-live-now',active:true,theme:activeTheme||'weekend',text:'📺 '+onAir+' · '+message,priority:1};
  bottomItems = bottomItems && bottomItems.length ? bottomItems : [];
  bottomItems[0]={id:'bottom-live-now',active:true,theme:'all',text:'FOLLOW DJ FOLSOE · '+goal+' · '+req+' · FOLSOETV.DK',priority:1};
  overlayContent = overlayContent || JSON.parse(JSON.stringify(DEFAULT_OVERLAY_CONTENT));
  overlayContent.box1=[{active:true,label:'FOLLOW JOURNEY',headline:goal,body:'Help DJ FOLSOE grow',icon:'📡',priority:1}];
  overlayContent.box2=[{active:true,label:'ON AIR',headline:onAir,body:next,icon:'📺',priority:1}];
  overlayContent.box3=[{active:true,label:'REQUESTS',headline:req,body:'Chat controls the music',icon:'🎧',priority:1}];
  overlayContent.box4={locked:'twitch-chat'};
  renderEditors(); renderOverlayContent();
  setQuickStatus('Quick fields applied locally. Press Publish Everything to update website + overlay.');
  setStatus('✅ Quick fields applied. Ready to publish.');
}

const V904_originalLoadAll = loadAll;
loadAll = async function(){
  await V904_originalLoadAll();
  const firstNews=(newsItems||[])[0]||{};
  DJF_val('quickOnAir', ((overlayContent?.box2||[])[0]?.headline)||'DJ FOLSOE LIVE');
  DJF_val('quickNextShow', ((overlayContent?.box2||[])[0]?.body)||'Next show loading');
  DJF_val('quickFollowerGoal', ((overlayContent?.box1||[])[0]?.headline)||'870/1000 followers');
  DJF_val('quickRequestLine', ((overlayContent?.box3||[])[0]?.headline)||'Requests open · !request');
  DJF_val('quickHeadline', firstNews.title||'Live Music TV from Denmark');
  DJF_val('quickMessage', firstNews.body||'Website and overlay controlled from this admin hub.');
  setQuickStatus('Current data loaded. Active theme: '+(activeTheme||'weekend'));
};


/* ===== V905 CENTRAL DATA ENGINE ===== */
async function loadCentralEngine(){
  try{
    const hub = await api('/api/broadcast-hub');
    const c = hub.core || {};
    const websiteCount = (c.homepageNews||[]).length + (c.shows||[]).length + (c.top20||[]).length + (c.discoveryPicks||[]).length;
    const overlayCount = ((c.overlayContent?.box1||[]).length)+((c.overlayContent?.box2||[]).length)+((c.overlayContent?.box3||[]).length);
    DJF_text('engineWebsite', websiteCount + ' items');
    DJF_text('engineOverlay', overlayCount + ' box items');
    DJF_text('engineTheme', c.activeTheme || activeTheme || 'weekend');
    DJF_text('engineStatus', hub.ok ? 'Online' : 'Check');
    DJF_text('centralEngineOutput', JSON.stringify({
      version: hub.version,
      sourceOfTruth: hub.sourceOfTruth,
      activeTheme: c.activeTheme,
      language: c.language,
      twitchChannel: c.twitchChannel,
      websiteModules: hub.modules?.website,
      overlayModules: hub.modules?.overlay,
      locked: hub.locked
    }, null, 2));
    setStatus('✅ Central Data Engine loaded. Website + overlay use the same Broadcast Cloud state.');
  }catch(e){
    DJF_text('engineStatus','Error');
    DJF_text('centralEngineOutput','Central engine error: '+e.message);
    setStatus('❌ Central engine error: '+e.message);
  }
}

const V905_originalPublishEverything = publishEverything;
publishEverything = async function(){
  await V905_originalPublishEverything();
  loadCentralEngine().catch(()=>{});
};

const V905_originalLoadAll = loadAll;
loadAll = async function(){
  await V905_originalLoadAll();
  loadCentralEngine().catch(()=>{});
};


/* ===== V906 ONE CLICK SHOW CONTROL ===== */
const V906_SHOWS={
  morning:{theme:'morning',state:'LIVE',title:'GOOD MORNING TWITCH',desc:'Coffee, fresh music and a bright start from Denmark.',next:'Morning music flow · chat and requests',goal:'870/1000 followers',request:'Requests open · !request',ticker:'☀️ GOOD MORNING TWITCH · Coffee · music · positive energy',social:'DJ FOLSOE is live with Good Morning Twitch — coffee, music and good vibes from Denmark.',twitch:'GOOD MORNING TWITCH ☀️ Live DJ Set · Requests · Denmark'},
  trance:{theme:'trance',state:'LIVE',title:'TRANCE TUESDAY',desc:'Uplifting trance, emotional melodies and blue laser energy.',next:'Uplifting trance journey',goal:'870/1000 followers',request:'Trance requests welcome',ticker:'💙 TRANCE TUESDAY · Uplifting energy · goosebumps may occur',social:'Trance Tuesday is live on DJ FOLSOE TV — uplifting trance and big melodies.',twitch:'TRANCE TUESDAY 💙 Uplifting Trance · Live from Denmark'},
  eurodance:{theme:'eurodance',state:'LIVE',title:'EURODANCE',desc:'90s and 00s dance energy with big hooks and maximum nostalgia.',next:'Eurodance anthems and requests',goal:'870/1000 followers',request:'Eurodance requests welcome',ticker:'💛 EURODANCE · 90s/00s anthems · big beats · big hooks',social:'Eurodance is live on DJ FOLSOE TV — 90s and 00s energy all the way.',twitch:'EURODANCE 💛 90s/00s Dance Anthems · Live DJ Set'},
  fredagsbar:{theme:'fredagsbar',state:'LIVE',title:'FREDAGSBAR',desc:'The weekend starts here with party tracks and community love.',next:'Weekend party mode',goal:'870/1000 followers',request:'Party requests open',ticker:'🍺 FREDAGSBAR · Weekend starts here · party tracks and chat energy',social:'Fredagsbar is open on DJ FOLSOE TV — weekend energy and party tracks.',twitch:'FREDAGSBAR 🍺 Weekend Party · Requests · DJ FOLSOE'},
  retro:{theme:'retro',state:'LIVE',title:'RETRO HITS',desc:'Classics that refuse to retire — nostalgia, memories and singalong moments.',next:'Retro classics and forgotten gems',goal:'870/1000 followers',request:'Retro requests welcome',ticker:'🕹️ RETRO HITS · Classics that refuse to retire',social:'Retro Hits is live — classic tracks, memories and big singalong energy.',twitch:'RETRO HITS 🕹️ Classics · Requests · Live from Denmark'},
  chart:{theme:'chart',state:'LIVE',title:'FOLSOE TOP 20',desc:'Weekly countdown, hit radar, new entries and community favourites.',next:'Top 20 countdown',goal:'870/1000 followers',request:'Vote and request your favourites',ticker:'🏆 FOLSOE TOP 20 · Countdown · new entries · hit radar',social:'FOLSOE Top 20 is live — this week’s countdown and hit radar.',twitch:'FOLSOE TOP 20 🏆 Weekly Chart Countdown'},
  popup:{theme:'popup',state:'LIVE',title:'POP UP LIVE',desc:'The surprise stream that appears when you least expect it.',next:'Surprise music flow',goal:'870/1000 followers',request:'Requests open · surprise me',ticker:'⚡ POP UP LIVE · Surprise stream activated',social:'Pop Up Live is on — DJ FOLSOE is suddenly live from Denmark.',twitch:'POP UP LIVE ⚡ Surprise DJ Stream · Denmark'},
  weekend:{theme:'weekend',state:'LIVE',title:'WEEKEND VIBES',desc:'Maximum music TV feeling with chat, requests and live DJ power.',next:'Weekend music and community',goal:'870/1000 followers',request:'Weekend bangers welcome',ticker:'🎉 WEEKEND VIBES · Maximum music and community energy',social:'Weekend Vibes is live on DJ FOLSOE TV — music, chat and community.',twitch:'WEEKEND VIBES 🎉 Live DJ Set · Requests · Denmark'}
};
let v906SelectedShow='weekend';

function v906Status(msg){ DJF_text('v906Status', msg); }
function v906RenderShowControl(){
  const wrap=document.getElementById('v906ShowButtons');
  if(wrap){
    wrap.innerHTML=Object.entries(V906_SHOWS).map(([key,p])=>`<button class="${key===v906SelectedShow?'activeThemeBtn':''}" onclick="v906SelectShow('${key}')"><b>${p.title}</b><span>${p.theme}</span></button>`).join('');
  }
  v906SelectShow(v906SelectedShow, true);
}
function v906SelectShow(key, silent){
  const p=V906_SHOWS[key]||V906_SHOWS.weekend;
  v906SelectedShow=key;
  DJF_text('v906SelectedTitle', p.title);
  DJF_text('v906SelectedDesc', p.desc);
  DJF_text('v906SelectedMeta', `Theme: ${p.theme} · State: ${p.state} · Next: ${p.next}`);
  DJF_value('v906BroadcastState', p.state);
  DJF_value('v906Theme', p.theme);
  DJF_value('v906TwitchTitle', p.twitch);
  DJF_value('v906SocialText', p.social);
  document.querySelectorAll('#v906ShowButtons button').forEach(btn=>btn.classList.toggle('activeThemeBtn', btn.textContent.toLowerCase().includes(p.title.toLowerCase())));
  if(!silent) v906Status('Selected '+p.title+'. Press Apply + publish now.');
}
function v906ApplyPresetToData(p){
  activeTheme=p.theme;
  markTheme(p.theme);
  DJF_value('quickOnAir',p.title);
  DJF_value('quickNextShow',p.next);
  DJF_value('quickFollowerGoal',p.goal);
  DJF_value('quickRequestLine',p.request);
  DJF_value('quickHeadline',p.title+' is on air');
  DJF_value('quickMessage',p.desc);
  newsItems = newsItems && newsItems.length ? newsItems : [];
  newsItems[0]={id:'v906-live-now',active:true,type:'Live now',title:p.title+' is live',body:p.desc,theme:'all',priority:1};
  newsItems[1]={id:'v906-social',active:true,type:'Announcement',title:'Broadcast announcement',body:DJF_get('v906SocialText')||p.social,theme:'all',priority:2};
  topItems = topItems && topItems.length ? topItems : [];
  topItems[0]={id:'v906-top-active-show',active:true,theme:p.theme,text:p.ticker,priority:1};
  bottomItems = bottomItems && bottomItems.length ? bottomItems : [];
  bottomItems[0]={id:'v906-bottom-active-show',active:true,theme:'all',text:`${p.title} · ${p.goal} · ${p.request} · FOLSOETV.DK`,priority:1};
  overlayContent = overlayContent || JSON.parse(JSON.stringify(DEFAULT_OVERLAY_CONTENT));
  overlayContent.box1=[{active:true,label:'BROADCAST STATUS',headline:DJF_get('v906BroadcastState')||p.state,body:p.title,icon:'📡',priority:1},{active:true,label:'FOLLOW JOURNEY',headline:p.goal,body:'Help the channel grow',icon:'❤️',priority:2}];
  overlayContent.box2=[{active:true,label:'ON AIR',headline:p.title,body:p.next,icon:'📺',priority:1},{active:true,label:'THEME',headline:p.theme.toUpperCase(),body:p.desc,icon:'🎨',priority:2}];
  overlayContent.box3=[{active:true,label:'REQUESTS',headline:p.request,body:'Chat controls the music',icon:'🎧',priority:1},{active:true,label:'NEXT',headline:p.next,body:'Stay with the broadcast',icon:'⏭️',priority:2}];
  overlayContent.box4={locked:'twitch-chat'};
  renderEditors();
  renderOverlayContent();
}
async function v906ActivateSelectedShow(doPublish){
  const p=V906_SHOWS[v906SelectedShow]||V906_SHOWS.weekend;
  v906ApplyPresetToData(p);
  v906Status('Applied '+p.title+' locally. '+(doPublish?'Publishing now...':'Ready to publish.'));
  setStatus('✅ V906 applied '+p.title+' to website + overlay fields.');
  if(doPublish){
    await publishEverything();
    v906Status('✅ '+p.title+' activated and published to the central data engine.');
  }
}
function v906QuickAction(mode){
  const map={
    live:{state:'LIVE',label:'NOW LIVE',suffix:'We are live now'},
    break:{state:'BREAK',label:'SHORT BREAK',suffix:'Back in a few minutes'},
    afterparty:{state:'AFTER PARTY',label:'AFTER PARTY',suffix:'Extra tracks and community vibes'},
    ending:{state:'ENDING SOON',label:'ENDING SOON',suffix:'Thanks for watching'},
    offline:{state:'OFFLINE',label:'OFFLINE',suffix:'Next show coming soon'}
  };
  const a=map[mode]||map.live;
  DJF_value('v906BroadcastState', a.state);
  const p=Object.assign({}, V906_SHOWS[v906SelectedShow]||V906_SHOWS.weekend, {state:a.state, next:a.suffix});
  v906ApplyPresetToData(p);
  v906Status('Quick action applied: '+a.label+'. Publish when ready.');
}

const V906_originalLoadAll = loadAll;
loadAll = async function(){
  await V906_originalLoadAll();
  v906RenderShowControl();
};


/* ===== V907 THEME MANAGER 1.0 ===== */
const V907_THEME_LIBRARY={
  morning:{emoji:'☀️',title:'GOOD MORNING TWITCH',desc:'Bright morning mood, coffee energy and clean daylight broadcast look.',bg:'themes/morning.png',primary:'#ffb000',secondary:'#ff5a00',hero:'Good Morning Twitch is live from Denmark',ticker:'☀️ GOOD MORNING TWITCH · Coffee · music · positive energy'},
  trance:{emoji:'💙',title:'TRANCE TUESDAY',desc:'Blue lasers, uplifting trance and high-emotion music TV energy.',bg:'themes/trance.png',primary:'#00e5ff',secondary:'#7b2fff',hero:'Trance Tuesday live on DJ FOLSOE TV',ticker:'💙 TRANCE TUESDAY · Uplifting energy · goosebumps may occur'},
  eurodance:{emoji:'💛',title:'EURODANCE',desc:'90s and 00s dance energy with bright stage power.',bg:'themes/eurodance.png',primary:'#00f0ff',secondary:'#005dff',hero:'Eurodance live on DJ FOLSOE TV',ticker:'💛 EURODANCE · 90s/00s anthems · big beats · big hooks'},
  fredagsbar:{emoji:'🍺',title:'FREDAGSBAR',desc:'Weekend bar mood, party tracks and community love.',bg:'themes/fredagsbar.png',primary:'#ffb000',secondary:'#ff2f78',hero:'Fredagsbar is open',ticker:'🍺 FREDAGSBAR · Weekend starts here · party tracks and chat energy'},
  retro:{emoji:'🕹️',title:'RETRO HITS',desc:'Nostalgia, classics and retro music TV colours.',bg:'themes/retro.png',primary:'#ff2bd6',secondary:'#7b2fff',hero:'Retro Hits on DJ FOLSOE TV',ticker:'🕹️ RETRO HITS · Classics that refuse to retire'},
  chart:{emoji:'🏆',title:'FOLSOE TOP 20',desc:'Countdown show, hit radar and weekly chart energy.',bg:'themes/chart.png',primary:'#00f5ff',secondary:'#ff2bd6',hero:'FOLSOE Top 20 is live',ticker:'🏆 FOLSOE TOP 20 · Countdown · new entries · hit radar'},
  popup:{emoji:'⚡',title:'POP UP LIVE',desc:'Fast surprise-stream signal with electric motion.',bg:'themes/popup.png',primary:'#00d4ff',secondary:'#ff00ea',hero:'Pop Up stream is live',ticker:'⚡ POP UP LIVE · Surprise stream activated'},
  summer:{emoji:'🌴',title:'SUMMER BEATS',desc:'Sunshine, warm air and bright summer broadcast mood.',bg:'themes/summer.png',primary:'#00f5d4',secondary:'#ffb703',hero:'Summer Beats live from Denmark',ticker:'🌴 SUMMER BEATS · Sunshine · requests · summer energy'},
  weekend:{emoji:'🎉',title:'WEEKEND VIBES',desc:'Maximum music and community energy for weekend streams.',bg:'themes/weekend.png',primary:'#ffd166',secondary:'#ff4d6d',hero:'Weekend Vibes on DJ FOLSOE TV',ticker:'🎉 WEEKEND VIBES · Maximum music and community energy'},
  danske:{emoji:'🇩🇰',title:'DANISH HITS',desc:'Danish hits and local music TV feeling.',bg:'themes/danske.png',primary:'#ff2b2b',secondary:'#ffffff',hero:'Danish Hits on DJ FOLSOE TV',ticker:'🇩🇰 DANISH HITS · Danish music · live from Denmark'},
  disco:{emoji:'🪩',title:'DISCO HITS',desc:'Mirrorballs, nu-disco and dancefloor glow.',bg:'themes/disco.png',primary:'#ff2bd6',secondary:'#ffd166',hero:'Disco Hits live on DJ FOLSOE TV',ticker:'🪩 DISCO HITS · Mirrorball energy · dancefloor classics'},
  handsup:{emoji:'🙌',title:'HANDS UP',desc:'High-energy hands up, hard dance and peak-time power.',bg:'themes/handsup.png',primary:'#00e5ff',secondary:'#ff2bd6',hero:'Hands Up live on DJ FOLSOE TV',ticker:'🙌 HANDS UP · High energy · big drops · requests open'}
};
let v907SelectedTheme=activeTheme||'weekend';
function v907ThemeStatus(msg){DJF_text('v907ThemeStatus',msg);}
function v907RenderThemeManager(){
  const wrap=DJF_el('v907ThemeCards'); if(!wrap) return;
  const coreThemes=(core&&core.themes)||{};
  wrap.innerHTML=Object.entries(V907_THEME_LIBRARY).map(([key,t])=>{
    const merged=Object.assign({},t,coreThemes[key]||{});
    const bg=merged.bgImage||merged.background||merged.bg;
    return `<button class="${key===v907SelectedTheme?'activeThemeBtn':''}" onclick="v907SelectTheme('${key}')"><b>${t.emoji} ${merged.title||t.title}</b><span>${key}</span><small>${bg||'themes/'+key+'.png'}</small></button>`;
  }).join('');
  v907SelectTheme(v907SelectedTheme,false);
}
function v907SelectTheme(key,announce=true){
  v907SelectedTheme=key||'weekend';
  const base=V907_THEME_LIBRARY[v907SelectedTheme]||V907_THEME_LIBRARY.weekend;
  const merged=Object.assign({},base,(core&&core.themes&&core.themes[v907SelectedTheme])||{});
  const bg=merged.bgImage||merged.background||merged.bg||('themes/'+v907SelectedTheme+'.png');
  DJF_text('v907ThemeTitle',(merged.emoji||base.emoji)+' '+(merged.title||base.title));
  DJF_text('v907ThemeDesc',merged.desc||base.desc);
  DJF_text('v907ThemePath','Background path: '+bg);
  DJF_value('v907ThemeKey',v907SelectedTheme);
  DJF_value('v907ThemeBg',bg);
  DJF_value('v907ThemePrimary',merged.primary||base.primary);
  DJF_value('v907ThemeSecondary',merged.secondary||base.secondary);
  DJF_value('v907HeroLine',merged.hero||base.hero);
  DJF_value('v907TickerLine',merged.ticker||base.ticker);
  document.querySelectorAll('.v907ThemeCards button').forEach(b=>b.classList.remove('activeThemeBtn'));
  const btn=[...document.querySelectorAll('.v907ThemeCards button')].find(b=>b.textContent.toLowerCase().includes(v907SelectedTheme));
  if(btn) btn.classList.add('activeThemeBtn');
  if(announce) v907ThemeStatus('Selected '+v907SelectedTheme+'. Press Apply + publish now.');
}
async function v907ApplyTheme(publish){
  const key=(DJF_get('v907ThemeKey')||v907SelectedTheme||activeTheme||'weekend').toLowerCase();
  const base=V907_THEME_LIBRARY[key]||V907_THEME_LIBRARY.weekend;
  const bg=DJF_get('v907ThemeBg')||base.bg;
  const primary=DJF_get('v907ThemePrimary')||base.primary;
  const secondary=DJF_get('v907ThemeSecondary')||base.secondary;
  const hero=DJF_get('v907HeroLine')||base.hero;
  const ticker=DJF_get('v907TickerLine')||base.ticker;
  activeTheme=key; v907SelectedTheme=key; markTheme(key);
  core=core||{}; core.themes=core.themes||{};
  core.themes[key]=Object.assign({},core.themes[key]||{},base,{bgImage:bg,background:bg,primary,secondary,hero,ticker});
  newsItems=newsItems&&newsItems.length?newsItems:[];
  newsItems[0]=Object.assign({id:'v907-theme-hero',active:true,type:'Active theme',priority:1,theme:'all'},newsItems[0]||{},{title:hero,body:(base.desc||'Theme controlled from admin')});
  topItems=topItems&&topItems.length?topItems:[];
  topItems[0]={id:'v907-theme-top',active:true,theme:key,text:ticker,priority:1};
  overlayContent=overlayContent||JSON.parse(JSON.stringify(DEFAULT_OVERLAY_CONTENT));
  overlayContent.box2=[{active:true,label:'ON AIR THEME',headline:(base.title||key).toUpperCase(),body:'Background: '+bg,icon:base.emoji||'🎨',priority:1}].concat((overlayContent.box2||[]).slice(1));
  renderEditors(); renderOverlayContent(); v907RenderThemeManager();
  v907ThemeStatus('Theme '+key+' applied locally. Background path: '+bg);
  try{
    await api('/api/theme-manager',{method:'POST',body:JSON.stringify({key,theme:core.themes[key]})});
  }catch(e){ console.warn('Theme manager save skipped:',e.message); }
  if(publish){
    await publishEverything();
    v907ThemeStatus('✅ Theme '+key+' published to website + overlay. Background: '+bg);
  }
}
function v907OpenThemeFolderGuide(){
  v907ThemeStatus('Theme folder guide:\n\n/themes/weekend.png\n/themes/morning.png\n/themes/trance.png\n/themes/eurodance.png\n/themes/fredagsbar.png\n/themes/retro.png\n/themes/chart.png\n/themes/popup.png\n/themes/summer.png\n\nUpload the image once to GitHub in /themes, then activate it here from admin.');
}

const V907_originalLoadAll = loadAll;
loadAll = async function(){
  await V907_originalLoadAll();
  v907SelectedTheme=activeTheme||v907SelectedTheme||'weekend';
  v907RenderThemeManager();
};

const V907_originalPublishEverything = publishEverything;
publishEverything = async function(){
  await V907_originalPublishEverything();
  v907RenderThemeManager();
};
