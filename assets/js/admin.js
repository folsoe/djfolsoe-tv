
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


const DJF_WORKER_FALLBACK="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
function DJF_apiBases(){
  const saved=(localStorage.getItem("DJF_API_BASE")||localStorage.getItem("djf_api_base")||"").trim().replace(/\/$/,"");
  const win=(window.DJF_API_BASE||"").trim().replace(/\/$/,"");
  const origin=(location.protocol.startsWith("http")?location.origin:"").replace(/\/$/,"");
  const bases=[];
  [saved,win,origin,DJF_WORKER_FALLBACK].forEach(b=>{ if(b && !bases.includes(b)) bases.push(b); });
  return bases;
}
let API_BASE=DJF_apiBases()[0] || DJF_WORKER_FALLBACK;
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
  const bases=DJF_apiBases();
  let lastError=null;
  for(const base of bases){
    try{
      const requestOpt=Object.assign({},opt);
      requestOpt.headers=Object.assign({"content-type":"application/json"},opt.headers||{});
      if(t){
        requestOpt.headers["x-admin-token"]=t;
        requestOpt.headers["authorization"]="Bearer "+t;
      }
      const r=await fetch(base+path,Object.assign({cache:"no-store"},requestOpt));
      const txt=await r.text();
      let j; try{j=JSON.parse(txt);}catch(e){j={raw:txt};}
      if(!r.ok){
        const detail = j?.error ? JSON.stringify(j,null,2) : txt;
        throw new Error(detail || ("HTTP "+r.status));
      }
      API_BASE=base;
      localStorage.setItem("DJF_API_BASE",base);
      return j;
    }catch(e){ lastError=e; }
  }
  throw lastError || new Error("API could not be reached");
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

/* DJ FOLSOE NETWORK V908 · Website 2.0 Music TV Portal */
const V908_DEFAULT_HOMEPAGE = {
  version:'V908 Website 2.0',
  hero:{eyebrow:'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK',title:'DJ FOLSOE',subtitle:'Dive into my Twitch world',text:'Live DJ shows, song requests, Top 20 countdowns and community energy from Denmark.',background:'themes/weekend.png'},
  ticker:['LIVE DJ SHOWS FROM DENMARK','REQUEST A SONG IN TWITCH CHAT','FOLSOE TOP 20 · WEEKLY MUSIC CHART','TRANCE · EURODANCE · RETRO · FREDAGSBAR · POPUP'],
  nextShow:{title:'Next DJ FOLSOE Broadcast',datetime:'',timeLabel:'Announced soon',theme:'Music TV',description:'The next show is controlled from admin and appears here automatically.'},
  sectionTitles:{nextKicker:'NEXT SHOW',nextTitle:'Next DJ FOLSOE Broadcast',showsKicker:'FEATURED SHOWS',showsTitle:'Your favorite show',aboutKicker:'DISCOVER DJ FOLSOE',aboutTitle:'Music TV, Twitch and Danish DJ energy'},
  featuredShows:[
    {title:'Good Morning Twitch',time:'Morning',description:'Bright morning mood, coffee, chat and fresh music.',theme:'morning',color:'#ffd66b'},
    {title:'Trance Tuesday',time:'Tuesday',description:'Melodic trance, energy and emotional peak-time sound.',theme:'trance',color:'#69e7ff'},
    {title:'Eurodance',time:'Special',description:'90s and 00s dance classics with full Music TV nostalgia.',theme:'eurodance',color:'#ff4fd8'},
    {title:'Fredagsbar',time:'Friday',description:'Weekend mode, party classics and Danish Friday energy.',theme:'fredagsbar',color:'#65ffb4'},
    {title:'Retro Hits',time:'Sunday',description:'70s, 80s and 90s memories with viewer favourites.',theme:'retro',color:'#ffd66b'},
    {title:'Pop Up Live',time:'Surprise',description:'The stream that appears when you least expect it.',theme:'popup',color:'#ffffff'}
  ],
  aboutText:'DJ FOLSOE is a Danish Twitch DJ and Music TV project built around live shows, requests, moderators, community and a broadcast look made for TV, mobile and desktop.',
  infoCards:[
    {kicker:'STUDIO',title:'Broadcast setup',text:'OBS, StreamElements, admin control and theme engine working as one system.'},
    {kicker:'MUSIC',title:'Many show moods',text:'Trance, Eurodance, Retro, EDM, Fredagsbar, Morning and Pop Up shows.'},
    {kicker:'CHAT',title:'Viewer participation',text:'Requests, shoutouts, channel points, goals and community moments.'},
    {kicker:'NETWORK',title:'Danish DJ culture',text:'A modern Music TV portal connected to Twitch and future DJ network features.'}
  ],
  top20:[
    {rank:1,artist:'DJ FOLSOE',title:"This Week's Number One",status:'ADMIN CONTROLLED'},
    {rank:2,artist:'Viewer Pick',title:'Request of the Week',status:'COMMUNITY'},
    {rank:3,artist:'Future Hit',title:'Discovery Track',status:'NEW'}
  ]
};
const V908_DEFAULT_COMMUNITY = {version:'V908 Community Portal',followers:0,subs:0,subGoal:100,text:'Join the Twitch chat, request music and be part of the DJ FOLSOE broadcast community.',wall:[{kicker:'FOLLOWERS',title:'Follower journey',text:'Follower goals can be updated from admin.'},{kicker:'SUBS',title:'Sub journey',text:'Subs help develop the technical setup and new broadcast features.'},{kicker:'REQUESTS',title:'Song requests',text:'Use !request Artist - Title in Twitch chat.'},{kicker:'CHAT',title:'Twitch chat',text:'Overlay box 4 stays locked to Twitch chat.'}]};
function v908PortalStatus(msg){const el=document.getElementById('v908PortalStatus'); if(el) el.textContent=msg;}
async function v908FetchJson(url, fallback){try{const r=await fetch(url,{cache:'no-store'}); if(r.ok)return await r.json();}catch(e){} return fallback;}
async function v908LoadWebsitePortal(){
  const base=(window.DJF_API_BASE||'').replace(/\/$/,'');
  let pkg = base ? await v908FetchJson(base+'/api/website-portal', null) : null;
  if(!pkg) pkg = {homepage: await v908FetchJson('data/homepage.json', V908_DEFAULT_HOMEPAGE), community: await v908FetchJson('data/community.json', V908_DEFAULT_COMMUNITY)};
  const h = pkg.homepage || V908_DEFAULT_HOMEPAGE, c = pkg.community || V908_DEFAULT_COMMUNITY;
  document.getElementById('v908HeroEyebrow').value = h.hero?.eyebrow || '';
  document.getElementById('v908HeroTitle').value = h.hero?.title || '';
  document.getElementById('v908HeroSubtitle').value = h.hero?.subtitle || '';
  document.getElementById('v908HeroBackground').value = h.hero?.background || '';
  document.getElementById('v908HeroText').value = h.hero?.text || '';
  document.getElementById('v908NextTitle').value = h.nextShow?.title || '';
  document.getElementById('v908NextTimeLabel').value = h.nextShow?.timeLabel || '';
  document.getElementById('v908NextDatetime').value = h.nextShow?.datetime || '';
  document.getElementById('v908NextTheme').value = h.nextShow?.theme || '';
  document.getElementById('v908NextDescription').value = h.nextShow?.description || '';
  const st = h.sectionTitles || {};
  if(document.getElementById('v908NextKicker')) document.getElementById('v908NextKicker').value = st.nextKicker || 'NEXT SHOW';
  if(document.getElementById('v908ShowsKicker')) document.getElementById('v908ShowsKicker').value = st.showsKicker || 'FEATURED SHOWS';
  if(document.getElementById('v908ShowsTitle')) document.getElementById('v908ShowsTitle').value = st.showsTitle || 'Your favorite show';
  if(document.getElementById('v908AboutKicker')) document.getElementById('v908AboutKicker').value = st.aboutKicker || 'DISCOVER DJ FOLSOE';
  if(document.getElementById('v908AboutTitle')) document.getElementById('v908AboutTitle').value = st.aboutTitle || 'Music TV, Twitch and Danish DJ energy';
  if(document.getElementById('v908AboutText')) document.getElementById('v908AboutText').value = h.aboutText || '';
  document.getElementById('v908Ticker').value = (h.ticker||[]).join('\n');
  document.getElementById('v908Followers').value = c.followers || 0;
  document.getElementById('v908Subs').value = c.subs || 0;
  document.getElementById('v908SubGoal').value = c.subGoal || 100;
  document.getElementById('v908CommunityText').value = c.text || '';
  v908PortalStatus('V908 Website Portal loaded. Edit and press PUBLISH WEBSITE 2.0.');
}
function v908CollectWebsitePortal(){
  const homepage = JSON.parse(JSON.stringify(V908_DEFAULT_HOMEPAGE));
  homepage.hero.eyebrow = document.getElementById('v908HeroEyebrow').value || homepage.hero.eyebrow;
  homepage.hero.title = document.getElementById('v908HeroTitle').value || homepage.hero.title;
  homepage.hero.subtitle = document.getElementById('v908HeroSubtitle').value || homepage.hero.subtitle;
  homepage.hero.background = document.getElementById('v908HeroBackground').value || homepage.hero.background;
  homepage.hero.text = document.getElementById('v908HeroText').value || homepage.hero.text;
  homepage.nextShow.title = document.getElementById('v908NextTitle').value || homepage.nextShow.title;
  homepage.nextShow.timeLabel = document.getElementById('v908NextTimeLabel').value || homepage.nextShow.timeLabel;
  homepage.nextShow.datetime = document.getElementById('v908NextDatetime').value || '';
  homepage.nextShow.theme = document.getElementById('v908NextTheme').value || homepage.nextShow.theme;
  homepage.nextShow.description = document.getElementById('v908NextDescription').value || homepage.nextShow.description;
  homepage.sectionTitles = {
    nextKicker: document.getElementById('v908NextKicker')?.value || 'NEXT SHOW',
    nextTitle: document.getElementById('v908NextTitle')?.value || 'Next DJ FOLSOE Broadcast',
    showsKicker: document.getElementById('v908ShowsKicker')?.value || 'FEATURED SHOWS',
    showsTitle: document.getElementById('v908ShowsTitle')?.value || 'Your favorite show',
    aboutKicker: document.getElementById('v908AboutKicker')?.value || 'DISCOVER DJ FOLSOE',
    aboutTitle: document.getElementById('v908AboutTitle')?.value || 'Music TV, Twitch and Danish DJ energy'
  };
  homepage.aboutText = document.getElementById('v908AboutText')?.value || homepage.aboutText;
  homepage.ticker = (document.getElementById('v908Ticker').value || '').split('\n').map(x=>x.trim()).filter(Boolean);
  const community = JSON.parse(JSON.stringify(V908_DEFAULT_COMMUNITY));
  community.followers = Number(document.getElementById('v908Followers').value || 0);
  community.subs = Number(document.getElementById('v908Subs').value || 0);
  community.subGoal = Number(document.getElementById('v908SubGoal').value || 100);
  community.text = document.getElementById('v908CommunityText').value || community.text;
  const website = {version:'V908 Website 2.0',title:'DJ FOLSOE TV',description:homepage.hero.text,primaryLanguage:'en',sections:['hero','nextShow','featuredShows','about','top20','community','requests'],locked:{overlayGraphics:'unchanged',box4:'twitch-chat'}};
  return {version:'V908 Website 2.0',homepage,website,community,updatedAt:new Date().toISOString()};
}
async function v908PublishWebsitePortal(){
  const pkg = v908CollectWebsitePortal();
  localStorage.setItem('djf_v908_website_portal', JSON.stringify(pkg));
  const base=(window.DJF_API_BASE||'').replace(/\/$/,'');
  if(base){
    try{
      const r=await fetch(base+'/api/website-portal',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(pkg)});
      if(!r.ok) throw new Error('Cloudflare rejected website portal update');
      v908PortalStatus('V908 Website 2.0 published to Cloudflare KV. Homepage + admin are now using the same portal package. Overlay graphics unchanged. Box 4 locked.');
      return;
    }catch(e){v908PortalStatus('Local save done, but cloud publish failed: '+e.message);return;}
  }
  v908PortalStatus('V908 Website 2.0 saved locally. Configure DJF_API_BASE for Cloudflare publishing.');
}
function v908PresetPortal(mode){
  const presets={
    live:{title:'DJ FOLSOE LIVE',subtitle:'Live now on Twitch',eyebrow:'ON AIR · MUSIC TV FROM DENMARK',ticker:['LIVE NOW ON TWITCH','REQUEST A SONG IN CHAT','FOLLOW DJ FOLSOE FOR THE NEXT SHOW']},
    next:{title:'NEXT DJ FOLSOE BROADCAST',subtitle:'The next show is getting ready',eyebrow:'COMING UP NEXT',ticker:['NEXT SHOW ANNOUNCED SOON','FOLLOW THE CHANNEL','JOIN THE MUSIC TV COMMUNITY']},
    community:{title:'DJ FOLSOE COMMUNITY',subtitle:'Chat, requests, subs and follower journey',eyebrow:'COMMUNITY BROADCAST',ticker:['BE ACTIVE IN CHAT','REQUEST MUSIC','SUBS HELP BUILD THE TECHNICAL SETUP']},
    top20:{title:'FOLSOE TOP 20',subtitle:'Weekly music chart countdown',eyebrow:'CHART SHOW MODE',ticker:['FOLSOE TOP 20','NEW ENTRIES','HIGHEST CLIMBER','VIEWER PICK OF THE WEEK']}
  }[mode];
  if(!presets) return;
  document.getElementById('v908HeroTitle').value=presets.title;
  document.getElementById('v908HeroSubtitle').value=presets.subtitle;
  document.getElementById('v908HeroEyebrow').value=presets.eyebrow;
  document.getElementById('v908Ticker').value=presets.ticker.join('\n');
  v908PortalStatus('Preset applied: '+mode+'. Press PUBLISH WEBSITE 2.0 to send it live.');
}
setTimeout(()=>{ if(document.getElementById('v908WebsitePortal')) v908LoadWebsitePortal(); }, 800);


/* DJ FOLSOE NETWORK V909 · Overlay Hub */
const V909_DEFAULT_OVERLAY_HUB = {
  version:'V909 Overlay Hub',
  state:'LIVE',
  activeShow:'DJ FOLSOE LIVE',
  activeTheme:'weekend',
  ticker:'LIVE NOW · REQUESTS OPEN · FOLLOW DJ FOLSOE · FOLSOETV.DK',
  overlayContent:{
    box1:[{active:true,label:'BROADCAST STATUS',headline:'LIVE NOW',body:'DJ FOLSOE is live from Denmark',icon:'📡',priority:1}],
    box2:[{active:true,label:'ON AIR',headline:'DJ FOLSOE LIVE',body:'Modern Music TV on Twitch',icon:'📺',priority:1}],
    box3:[{active:true,label:'REQUESTS',headline:'Requests open',body:'Use !request Artist - Title in Twitch chat',icon:'🎧',priority:1}],
    box4:{locked:'twitch-chat'}
  }
};
function v909Status(msg){const el=document.getElementById('v909Status'); if(el) el.textContent=msg;}
function v909Set(id,val){const el=document.getElementById(id); if(el) el.value=val||'';}
function v909Get(id){const el=document.getElementById(id); return el?String(el.value||'').trim():'';}
function v909First(box, fallback){
  const arr=(overlayContent&&Array.isArray(overlayContent[box]))?overlayContent[box]:[];
  return Object.assign({}, fallback||{}, arr[0]||{});
}
function v909FillForm(pkg){
  pkg=pkg||{};
  const oc=pkg.overlayContent||overlayContent||V909_DEFAULT_OVERLAY_HUB.overlayContent;
  const b1=(oc.box1||[])[0]||V909_DEFAULT_OVERLAY_HUB.overlayContent.box1[0];
  const b2=(oc.box2||[])[0]||V909_DEFAULT_OVERLAY_HUB.overlayContent.box2[0];
  const b3=(oc.box3||[])[0]||V909_DEFAULT_OVERLAY_HUB.overlayContent.box3[0];
  v909Set('v909State', pkg.state||core?.broadcast?.broadcastState||'LIVE');
  v909Set('v909ActiveShow', pkg.activeShow||core?.broadcast?.activeShow||b2.headline||'DJ FOLSOE LIVE');
  v909Set('v909ActiveTheme', pkg.activeTheme||activeTheme||'weekend');
  v909Set('v909Ticker', pkg.ticker||((bottomItems||[])[0]?.text)||V909_DEFAULT_OVERLAY_HUB.ticker);
  [['Box1',b1],['Box2',b2],['Box3',b3]].forEach(([name,b])=>{
    v909Set('v909'+name+'Label',b.label);
    v909Set('v909'+name+'Headline',b.headline);
    v909Set('v909'+name+'Body',b.body);
    v909Set('v909'+name+'Icon',b.icon);
  });
}
function v909CollectOverlayHub(){
  const box=(n)=>[{active:true,label:v909Get(`v909Box${n}Label`),headline:v909Get(`v909Box${n}Headline`),body:v909Get(`v909Box${n}Body`),icon:v909Get(`v909Box${n}Icon`)||'📺',priority:1}];
  const payload={
    version:'V909 Overlay Hub',
    state:v909Get('v909State')||'LIVE',
    activeShow:v909Get('v909ActiveShow')||'DJ FOLSOE LIVE',
    activeTheme:v909Get('v909ActiveTheme')||activeTheme||'weekend',
    ticker:v909Get('v909Ticker')||V909_DEFAULT_OVERLAY_HUB.ticker,
    overlayContent:{box1:box(1),box2:box(2),box3:box(3),box4:{locked:'twitch-chat'}},
    updatedAt:new Date().toISOString()
  };
  return payload;
}
async function v909LoadOverlayHub(){
  try{
    let pkg=null;
    try{ pkg=await api('/api/overlay-hub'); }catch(e){ pkg=null; }
    const data=pkg?.overlayHub||pkg||{};
    if(data.overlayContent) overlayContent=data.overlayContent;
    v909FillForm(data);
    renderOverlayContent();
    v909Status('✅ V909 Overlay Hub loaded. Box 4 remains locked to Twitch chat.');
  }catch(e){
    v909FillForm(V909_DEFAULT_OVERLAY_HUB);
    v909Status('⚠️ Loaded local defaults because cloud data was not available: '+e.message);
  }
}
function v909Preset(mode){
  const presets={
    live:{state:'LIVE',theme:activeTheme||'weekend',show:'DJ FOLSOE LIVE',ticker:'LIVE NOW · REQUESTS OPEN · FOLLOW DJ FOLSOE · FOLSOETV.DK',b1:['BROADCAST STATUS','LIVE NOW','DJ FOLSOE is live from Denmark','📡'],b2:['ON AIR','DJ FOLSOE LIVE','Modern Music TV on Twitch','📺'],b3:['REQUESTS','Requests open','Use !request Artist - Title in Twitch chat','🎧']},
    break:{state:'BREAK',theme:activeTheme||'weekend',show:'SHORT BREAK',ticker:'SHORT BREAK · BACK IN A FEW MINUTES · STAY IN CHAT',b1:['BROADCAST STATUS','SHORT BREAK','Back in a few minutes','☕'],b2:['ON AIR','Break mode','Music returns shortly','📺'],b3:['CHAT','Stay in chat','Requests are still welcome','💬']},
    ending:{state:'ENDING SOON',theme:activeTheme||'weekend',show:'ENDING SOON',ticker:'ENDING SOON · THANKS FOR WATCHING · FOLLOW FOR THE NEXT SHOW',b1:['BROADCAST STATUS','ENDING SOON','Thanks for watching DJ FOLSOE','🏁'],b2:['NEXT','Next broadcast soon','Follow so you never miss a show','⏭️'],b3:['COMMUNITY','Thank you','Love to chat, subs, followers and raiders','❤️']},
    offline:{state:'OFFLINE',theme:activeTheme||'weekend',show:'OFFLINE',ticker:'OFFLINE · NEXT SHOW COMING SOON · FOLLOW DJ FOLSOE',b1:['BROADCAST STATUS','OFFLINE','Next show coming soon','⚫'],b2:['NEXT SHOW','Announced soon','Watch folsoetv.dk for updates','📅'],b3:['FOLLOW','Follow DJ FOLSOE','Never miss the next broadcast','❤️']},
    goals:{state:'LIVE',theme:activeTheme||'weekend',show:'FOLLOWER JOURNEY',ticker:'FOLLOWER JOURNEY · SUB GOAL · HELP BUILD THE BROADCAST',b1:['FOLLOW JOURNEY','870/1000 followers','Help DJ FOLSOE reach the next goal','📈'],b2:['SUB JOURNEY','Subs support the setup','Every sub helps develop the technical broadcast','⭐'],b3:['COMMUNITY','Be part of it','Follow, chat, request and share the stream','❤️']},
    requests:{state:'LIVE',theme:activeTheme||'weekend',show:'REQUEST MODE',ticker:'REQUESTS OPEN · USE !REQUEST ARTIST - TITLE · CHAT CONTROLS THE MUSIC',b1:['REQUEST MODE','Requests open','Chat helps shape the music','🎧'],b2:['HOW TO REQUEST','!request Artist - Title','Write your music wish in Twitch chat','⌨️'],b3:['NOW PLAYING','Viewer energy','Your request can be next','🎵']},
    top20:{state:'LIVE',theme:'chart',show:'FOLSOE TOP 20',ticker:'FOLSOE TOP 20 · WEEKLY CHART · VIEWER PICK · NEW ENTRIES',b1:['CHART SHOW','FOLSOE TOP 20','Weekly Music TV countdown','🏆'],b2:['COUNTDOWN','Top 20 is running','Biggest tracks, Danish picks and new discoveries','📊'],b3:['VIEWER PICK','Chat decides energy','Vote, request and react live','🎧']},
    community:{state:'LIVE',theme:activeTheme||'weekend',show:'COMMUNITY MODE',ticker:'COMMUNITY MODE · SHOUTOUTS · LOVE TO CHAT · FOLLOW DJ FOLSOE',b1:['COMMUNITY','Chat is the show','Be active and send love','❤️'],b2:['SHOUTOUTS','Danish DJ Network','Support the people who support the music','📣'],b3:['THANK YOU','Followers · Subs · Raids','You build this Music TV channel','🙏']}
  };
  const p=presets[mode]||presets.live;
  v909Set('v909State',p.state); v909Set('v909ActiveShow',p.show); v909Set('v909ActiveTheme',p.theme); v909Set('v909Ticker',p.ticker);
  [p.b1,p.b2,p.b3].forEach((b,i)=>{const n=i+1; v909Set(`v909Box${n}Label`,b[0]); v909Set(`v909Box${n}Headline`,b[1]); v909Set(`v909Box${n}Body`,b[2]); v909Set(`v909Box${n}Icon`,b[3]);});
  v909Status('Preset applied: '+mode+'. Press PUBLISH OVERLAY HUB to update overlay + central data.');
}
async function v909PublishOverlayHub(){
  const payload=v909CollectOverlayHub();
  overlayContent=payload.overlayContent;
  activeTheme=payload.activeTheme;
  markTheme(activeTheme);
  bottomItems=bottomItems||[];
  bottomItems[0]={id:'v909-overlay-hub-ticker',active:true,theme:'all',text:payload.ticker,priority:1};
  renderOverlayContent(); renderEditors();
  try{
    await api('/api/overlay-hub',{method:'POST',body:JSON.stringify(payload)});
    v909Status('✅ V909 Overlay Hub published. Box 1-3 updated, ticker synced, Box 4 locked to Twitch chat.');
    setStatus('✅ V909 Overlay Hub published to Broadcast Cloud.');
  }catch(e){
    v909Status('❌ Publish failed: '+e.message);
    setStatus('❌ V909 publish failed: '+e.message);
  }
}
const V909_originalLoadAll = loadAll;
loadAll = async function(){
  await V909_originalLoadAll();
  if(document.getElementById('v909OverlayHub')) v909FillForm({overlayContent,activeTheme,state:core?.broadcast?.broadcastState,activeShow:core?.broadcast?.activeShow,ticker:(bottomItems||[])[0]?.text});
};
setTimeout(()=>{ if(document.getElementById('v909OverlayHub')) v909LoadOverlayHub(); }, 1200);


/* DJ FOLSOE NETWORK V910 · Music TV Broadcast System */
const V910_PRESETS={
  live:{mode:'LIVE SHOW',show:'DJ FOLSOE LIVE',theme:'weekend',badge:'LIVE FROM DENMARK',hero:'Live Music TV from Denmark',msg:'DJ FOLSOE is live with modern Music TV energy, requests, community and the best tracks on Twitch.',lower:'DJ FOLSOE LIVE · Requests open · Follow the channel',ticker:'LIVE NOW · REQUESTS OPEN · FOLLOW DJ FOLSOE · FOLSOETV.DK',intro:'Welcome to DJ FOLSOE LIVE — modern Music TV from Denmark. Turn up the volume, join the chat and be part of the broadcast.',outro:'Thanks for watching DJ FOLSOE LIVE. Follow the channel and come back for the next broadcast.',social:'DJ FOLSOE is live now on Twitch. Join the music, chat and requests.',boxes:[['BROADCAST','LIVE SHOW','DJ FOLSOE is live from Denmark'],['ON AIR','DJ FOLSOE LIVE','Modern Music TV on Twitch'],['REQUESTS','Requests open','Use !request Artist - Title in Twitch chat']]},
  starting:{mode:'STARTING SOON',show:'STARTING SOON',theme:'weekend',badge:'BROADCAST STARTING',hero:'The broadcast starts soon',msg:'DJ FOLSOE is preparing the next Music TV show. Stay ready and join the chat before we go live.',lower:'STARTING SOON · Get ready · DJ FOLSOE LIVE',ticker:'STARTING SOON · MUSIC TV FROM DENMARK · CHAT IS OPEN',intro:'The broadcast is starting soon. Welcome to DJ FOLSOE NETWORK.',outro:'Stay ready — we are going live soon.',social:'DJ FOLSOE starts soon. Get ready for the next live show.',boxes:[['STATUS','STARTING SOON','The broadcast begins shortly'],['NEXT','DJ FOLSOE LIVE','Get ready for Music TV from Denmark'],['CHAT','Chat is open','Say hello before the show starts']]},
  countdown:{mode:'COUNTDOWN',show:'COUNTDOWN MODE',theme:'chart',badge:'COUNTDOWN',hero:'Countdown to the next broadcast',msg:'The next DJ FOLSOE show is getting closer. Follow the countdown and get ready for the music.',lower:'COUNTDOWN · NEXT SHOW INCOMING · FOLLOW DJ FOLSOE',ticker:'COUNTDOWN · NEXT BROADCAST · FOLSOETV.DK',intro:'Countdown mode is active. The next DJ FOLSOE broadcast is on the way.',outro:'Countdown complete — the show is about to begin.',social:'Countdown is running for the next DJ FOLSOE broadcast.',boxes:[['COUNTDOWN','NEXT SHOW','The next broadcast is incoming'],['SCHEDULE','Stay tuned','Showtime is getting closer'],['FOLLOW','Never miss it','Follow DJ FOLSOE for alerts']]},
  break:{mode:'BREAK',show:'SHORT BREAK',theme:'weekend',badge:'SHORT BREAK',hero:'Short break — music returns soon',msg:'The broadcast is taking a short break. Stay in chat and keep the energy alive.',lower:'SHORT BREAK · BACK IN A FEW MINUTES',ticker:'SHORT BREAK · STAY IN CHAT · BACK SOON',intro:'Short break. Stay with us — DJ FOLSOE returns in a few minutes.',outro:'Break is over. Back to the music.',social:'DJ FOLSOE is on a short break and returns soon.',boxes:[['STATUS','SHORT BREAK','Back in a few minutes'],['ON AIR','Break mode','Music returns shortly'],['CHAT','Stay in chat','Requests are still welcome']]},
  special:{mode:'SPECIAL EVENT',show:'SPECIAL EVENT',theme:'popup',badge:'SPECIAL EVENT',hero:'Special event live now',msg:'A special DJ FOLSOE broadcast is active with extra energy, surprises and community moments.',lower:'SPECIAL EVENT · EXTRA ENERGY · LIVE NOW',ticker:'SPECIAL EVENT · LIVE NOW · CHAT DECIDES THE ENERGY',intro:'Welcome to a special DJ FOLSOE event. Expect surprises, music and full broadcast energy.',outro:'Thanks for being part of this special event.',social:'Special event live now with DJ FOLSOE.',boxes:[['EVENT','SPECIAL EVENT','Extra energy live on Twitch'],['ON AIR','One night only','Music, surprises and community'],['COMMUNITY','Be part of it','Chat drives the broadcast']]},
  afterparty:{mode:'AFTER PARTY',show:'AFTER PARTY',theme:'fredagsbar',badge:'AFTER PARTY',hero:'After Party mode is live',msg:'The main show continues into after party mode. More music, more chat and no rush to leave.',lower:'AFTER PARTY · MORE MUSIC · STAY WITH US',ticker:'AFTER PARTY · MORE MUSIC · CHAT STAYS ALIVE',intro:'After Party is live. The official show is over, but the music keeps going.',outro:'After Party complete. Thanks for staying late with DJ FOLSOE.',social:'After Party mode is live on DJ FOLSOE.',boxes:[['MODE','AFTER PARTY','The music continues'],['VIBE','Late show energy','More tracks and relaxed chat'],['COMMUNITY','Stay with us','The best people are still here']]},
  ending:{mode:'ENDING',show:'ENDING SOON',theme:'weekend',badge:'ENDING SOON',hero:'Thanks for watching',msg:'The broadcast is ending soon. Thank you for being part of DJ FOLSOE NETWORK.',lower:'ENDING SOON · THANKS FOR WATCHING · FOLLOW FOR NEXT SHOW',ticker:'ENDING SOON · THANKS FOR WATCHING · FOLLOW DJ FOLSOE',intro:'We are heading into the final part of today’s broadcast.',outro:'Thanks for today. Follow DJ FOLSOE and see you at the next show.',social:'DJ FOLSOE is ending soon. Thanks for joining the broadcast.',boxes:[['STATUS','ENDING SOON','Thanks for watching DJ FOLSOE'],['NEXT','Next broadcast soon','Follow so you never miss a show'],['THANK YOU','Community love','Followers, subs, raids and chat — thank you']]},
  offline:{mode:'OFFLINE',show:'OFFLINE',theme:'weekend',badge:'OFFLINE',hero:'DJ FOLSOE is offline',msg:'The channel is offline right now. Check the next broadcast and follow on Twitch so you never miss the next show.',lower:'OFFLINE · NEXT SHOW COMING SOON · FOLLOW DJ FOLSOE',ticker:'OFFLINE · NEXT SHOW SOON · FOLSOETV.DK',intro:'DJ FOLSOE NETWORK is currently offline.',outro:'See you at the next DJ FOLSOE broadcast.',social:'DJ FOLSOE is offline. Next show coming soon.',boxes:[['STATUS','OFFLINE','Next show coming soon'],['NEXT SHOW','Announced soon','Watch folsoetv.dk for updates'],['FOLLOW','Follow DJ FOLSOE','Never miss the next broadcast']]}
};
function v910Set(id,v){const el=document.getElementById(id);if(el)el.value=v||'';} function v910Get(id){const el=document.getElementById(id);return el?String(el.value||'').trim():'';} function v910Status(msg){const el=document.getElementById('v910Status');if(el)el.textContent=msg;}
function v910Mode(key){const p=V910_PRESETS[key]||V910_PRESETS.live;v910Set('v910Mode',p.mode);v910Set('v910ActiveShow',p.show);v910Set('v910ActiveTheme',p.theme||activeTheme||'weekend');v910Set('v910Badge',p.badge);v910Set('v910HeroHeadline',p.hero);v910Set('v910HeroMessage',p.msg);v910Set('v910LowerThird',p.lower);v910Set('v910Ticker',p.ticker);v910Set('v910Intro',p.intro);v910Set('v910Outro',p.outro);v910Set('v910Social',p.social);(p.boxes||[]).forEach((b,i)=>{let n=i+1;v910Set(`v910Box${n}Label`,b[0]);v910Set(`v910Box${n}Headline`,b[1]);v910Set(`v910Box${n}Body`,b[2]);});v910Status('Preset applied: '+p.mode+'. Press PUBLISH BROADCAST MODE to sync website + overlay.');}
function v910Collect(){const box=(n,icon)=>[{active:true,label:v910Get(`v910Box${n}Label`),headline:v910Get(`v910Box${n}Headline`),body:v910Get(`v910Box${n}Body`),icon:icon,priority:1}];return{version:'V910 Music TV Broadcast System',mode:v910Get('v910Mode')||'LIVE SHOW',activeShow:v910Get('v910ActiveShow')||'DJ FOLSOE LIVE',activeTheme:v910Get('v910ActiveTheme')||activeTheme||'weekend',badge:v910Get('v910Badge')||'LIVE FROM DENMARK',hero:{headline:v910Get('v910HeroHeadline'),message:v910Get('v910HeroMessage')},lowerThird:v910Get('v910LowerThird'),ticker:v910Get('v910Ticker'),introText:v910Get('v910Intro'),outroText:v910Get('v910Outro'),socialText:v910Get('v910Social'),overlayContent:{box1:box(1,'📡'),box2:box(2,'📺'),box3:box(3,'🎧'),box4:{locked:'twitch-chat'}},updatedAt:new Date().toISOString()};}
function v910Fill(data){data=data||{};const p=data.broadcastSystem||data;v910Set('v910Mode',p.mode||core?.broadcast?.mode||'LIVE SHOW');v910Set('v910ActiveShow',p.activeShow||core?.broadcast?.activeShow||'DJ FOLSOE LIVE');v910Set('v910ActiveTheme',p.activeTheme||activeTheme||'weekend');v910Set('v910Badge',p.badge||'LIVE FROM DENMARK');v910Set('v910HeroHeadline',p.hero?.headline||core?.homepage?.heroHeadline||'Live Music TV from Denmark');v910Set('v910HeroMessage',p.hero?.message||core?.homepage?.heroMessage||'Modern Music TV on Twitch.');v910Set('v910LowerThird',p.lowerThird||'DJ FOLSOE LIVE · Requests open · Follow the channel');v910Set('v910Ticker',p.ticker||((bottomItems||[])[0]?.text)||'LIVE NOW · REQUESTS OPEN');v910Set('v910Intro',p.introText||'Welcome to DJ FOLSOE LIVE.');v910Set('v910Outro',p.outroText||'Thanks for watching DJ FOLSOE LIVE.');v910Set('v910Social',p.socialText||'DJ FOLSOE is live now on Twitch.');const oc=p.overlayContent||overlayContent||{};['box1','box2','box3'].forEach((k,i)=>{const b=(oc[k]||[])[0]||{};const n=i+1;v910Set(`v910Box${n}Label`,b.label||['BROADCAST','ON AIR','COMMUNITY'][i]);v910Set(`v910Box${n}Headline`,b.headline||['LIVE SHOW','DJ FOLSOE LIVE','Requests open'][i]);v910Set(`v910Box${n}Body`,b.body||'');});}
async function v910LoadBroadcastSystem(){try{const r=await api('/api/broadcast-system');v910Fill(r.broadcastSystem||r);v910Status('✅ V910 Broadcast System loaded.');}catch(e){v910Mode('live');v910Status('⚠️ Cloud data not available. Local LIVE SHOW preset loaded: '+e.message);}}
async function v910PublishBroadcastSystem(){const payload=v910Collect();activeTheme=payload.activeTheme;markTheme(activeTheme);overlayContent=payload.overlayContent;bottomItems=bottomItems||[];bottomItems[0]={id:'v910-broadcast-ticker',active:true,theme:'all',text:payload.ticker,priority:1};core=core||{};core.broadcast=Object.assign({},core.broadcast||{},{mode:payload.mode,broadcastState:payload.mode,activeShow:payload.activeShow,activeTheme:payload.activeTheme,lowerThird:payload.lowerThird,badge:payload.badge});core.homepage=Object.assign({},core.homepage||{},{heroHeadline:payload.hero.headline,heroMessage:payload.hero.message,activeShow:payload.activeShow,broadcastMode:payload.mode});renderOverlayContent();renderEditors();try{await api('/api/broadcast-system',{method:'POST',body:JSON.stringify(payload)});v910Status('✅ V910 published. Broadcast mode, website hero, ticker and overlay box 1-3 are synced.');setStatus('✅ V910 Broadcast System published.');}catch(e){v910Status('❌ V910 publish failed: '+e.message);setStatus('❌ V910 publish failed: '+e.message);}}
const V910_originalLoadAll=loadAll;loadAll=async function(){await V910_originalLoadAll();if(document.getElementById('v910BroadcastSystem')) v910Fill({});};setTimeout(()=>{if(document.getElementById('v910BroadcastSystem')) v910LoadBroadcastSystem();},1500);


/* DJ FOLSOE NETWORK V911 · Daily Control Room */
function v911Text(id,value){const el=document.getElementById(id);if(el)el.textContent=value||'';}
function v911Set(id,value){const el=document.getElementById(id);if(el)el.value=value||'';}
function v911Get(id){const el=document.getElementById(id);return el?String(el.value||'').trim():'';}
function v911Status(msg){const el=document.getElementById('v911Status');if(el)el.textContent=msg;}
function v911FirstOverlayHeadline(box, fallback){try{return ((overlayContent||{})[box]||[])[0]?.headline || fallback;}catch(e){return fallback;}}
function v911RefreshDaily(){
  const mode=(core&&core.broadcast&&(core.broadcast.broadcastState||core.broadcast.mode)) || v910Get?.('v910Mode') || 'LIVE SHOW';
  const show=(core&&core.broadcast&&core.broadcast.activeShow) || v910Get?.('v910ActiveShow') || 'DJ FOLSOE LIVE';
  const theme=(activeTheme || (core&&core.broadcast&&core.broadcast.activeTheme) || 'weekend');
  v911Text('v911LiveStatus', mode);
  v911Text('v911ActiveShow', show);
  v911Text('v911ActiveTheme', theme);
  v911Text('v911LastPublish', localStorage.getItem('DJF_V911_LAST_PUBLISH') || 'Not published yet');
  v911Set('v911NowOnAir', show);
  v911Set('v911HeroHeadline', (core&&core.homepage&&core.homepage.heroHeadline) || v910Get?.('v910HeroHeadline') || 'Live Music TV from Denmark');
  v911Set('v911HeroMessage', (core&&core.homepage&&core.homepage.heroMessage) || v910Get?.('v910HeroMessage') || 'Modern Music TV on Twitch.');
  v911Set('v911Box1', v911FirstOverlayHeadline('box1','LIVE SHOW'));
  v911Set('v911Box2', v911FirstOverlayHeadline('box2','DJ FOLSOE LIVE'));
  v911Set('v911Box3', v911FirstOverlayHeadline('box3','Requests open'));
  v911Set('v911Ticker', ((bottomItems||[])[0]?.text) || v910Get?.('v910Ticker') || 'LIVE NOW · REQUESTS OPEN · FOLLOW DJ FOLSOE');
  v911Status('✅ Daily Control Room refreshed.');
}
function v911ApplyQuickEdit(){
  const show=v911Get('v911NowOnAir')||'DJ FOLSOE LIVE';
  const hero=v911Get('v911HeroHeadline')||'Live Music TV from Denmark';
  const message=v911Get('v911HeroMessage')||'Modern Music TV on Twitch.';
  const ticker=v911Get('v911Ticker')||'LIVE NOW · REQUESTS OPEN · FOLLOW DJ FOLSOE';
  core=core||{}; core.broadcast=Object.assign({},core.broadcast||{},{activeShow:show}); core.homepage=Object.assign({},core.homepage||{},{heroHeadline:hero,heroMessage:message,activeShow:show});
  if(typeof v910Set==='function'){
    v910Set('v910ActiveShow',show); v910Set('v910HeroHeadline',hero); v910Set('v910HeroMessage',message); v910Set('v910Ticker',ticker);
    v910Set('v910Box1Headline',v911Get('v911Box1')||'LIVE SHOW'); v910Set('v910Box2Headline',v911Get('v911Box2')||show); v910Set('v910Box3Headline',v911Get('v911Box3')||'Requests open');
  }
  overlayContent=overlayContent||{};
  ['box1','box2','box3'].forEach((box,i)=>{overlayContent[box]=overlayContent[box]||[{active:true,label:['BROADCAST','ON AIR','COMMUNITY'][i],headline:'',body:'',icon:['📡','📺','🎧'][i],priority:1}]; overlayContent[box][0].headline=v911Get('v911Box'+(i+1))||overlayContent[box][0].headline;});
  bottomItems=bottomItems||[]; bottomItems[0]=Object.assign({},bottomItems[0]||{id:'v911-daily-ticker',active:true,theme:'all',priority:1},{text:ticker});
  if(typeof renderOverlayContent==='function') renderOverlayContent();
  if(typeof renderEditors==='function') renderEditors();
  v911RefreshDaily(); v911Status('✅ Quick edit applied locally. Press ONE TAP · PUBLISH NOW to send it live.');
}
function v911OneTap(mode){
  if(typeof v910Mode==='function') v910Mode(mode);
  v911RefreshDaily();
  v911Status('✅ '+String(mode).toUpperCase()+' preset loaded. Press ONE TAP · PUBLISH NOW when ready.');
}
async function v911PublishNow(){
  v911ApplyQuickEdit();
  try{
    if(typeof v910PublishBroadcastSystem==='function') await v910PublishBroadcastSystem();
    else if(typeof publishEverything==='function') await publishEverything();
    const stamp=new Date().toLocaleString(); localStorage.setItem('DJF_V911_LAST_PUBLISH',stamp); v911Text('v911LastPublish',stamp);
    v911Status('✅ V911 one tap publish complete. Website, ticker and overlay box 1-3 are synced.');
    if(typeof setStatus==='function') setStatus('✅ V911 Daily Control Room published.');
  }catch(e){v911Status('❌ V911 publish failed: '+e.message); if(typeof setStatus==='function') setStatus('❌ V911 publish failed: '+e.message);}
}
const V911_originalLoadAll=loadAll;loadAll=async function(){await V911_originalLoadAll();setTimeout(v911RefreshDaily,250);};
setTimeout(()=>{if(document.getElementById('v911DailyControl')) v911RefreshDaily();},1800);


/* =========================
   V912 CONTENT STUDIO
   ========================= */
let v912ContentStudio = null;
function v912Status(msg){const el=document.getElementById('v912Status'); if(el) el.textContent=msg;}
function v912Set(id,v){const el=document.getElementById(id); if(el) el.value=v||'';}
function v912Get(id){const el=document.getElementById(id); return el?String(el.value||'').trim():'';}
function v912DefaultStudio(){
  return {
    version:'V912 Content Studio',
    hero:{headline:'Live Music TV from Denmark',message:'DJ FOLSOE brings Twitch, music requests, Top 20 and community together in one live broadcast universe.',nextBroadcast:'Next broadcast announced soon'},
    goals:{followers:'870 / 1000 followers',subs:'0 / 25 subs',requests:'Requests open · !request'},
    ticker:{top:'DJ FOLSOE NETWORK · MUSIC TV FROM DENMARK',bottom:'LIVE NOW · REQUESTS OPEN · FOLLOW DJ FOLSOE · JOIN THE CHAT'},
    news:[
      {type:'Broadcast update',title:'DJ FOLSOE LIVE is ready',body:'Follow the channel and join the chat for the next show.'},
      {type:'Community',title:'Requests are part of the show',body:'Use !request in chat when requests are open.'}
    ],
    shows:[
      {title:'Good Morning Twitch',time:'Morning',body:'Coffee, good vibes and fresh music.'},
      {title:'Trance Tuesday',time:'Tuesday',body:'Uplifting trance and big melodies.'},
      {title:'Fredagsbar',time:'Friday',body:'Weekend energy and party tracks.'}
    ],
    top20: (typeof top20Items!=='undefined' && top20Items && top20Items.length ? top20Items : TOP20_SEED || []).slice(0,20),
    overlay:{
      box1:{headline:'LIVE SHOW',body:'Broadcast Cloud online'},
      box2:{headline:'DJ FOLSOE LIVE',body:'Active show and theme'},
      box3:{headline:'Requests open',body:'!request in chat'}
    },
    updatedAt:new Date().toISOString()
  };
}
function v912RenderList(kind,items){
  const host=document.getElementById(kind==='news'?'v912NewsEditor':'v912ShowsEditor'); if(!host)return;
  host.innerHTML=(items||[]).map((it,i)=>`<div class="v912EditRow">
    <div><input data-v912="${kind}-${i}-title" value="${DJF_escapeHtml(it.title||'')}" placeholder="Title"><input data-v912="${kind}-${i}-meta" value="${DJF_escapeHtml(it.type||it.time||'')}" placeholder="Type / time"></div>
    <textarea rows="3" data-v912="${kind}-${i}-body" placeholder="Body">${DJF_escapeHtml(it.body||'')}</textarea>
    <button onclick="v912RemoveItem('${kind}',${i})">×</button>
  </div>`).join('');
}
function v912ReadList(kind){
  const arr=(v912ContentStudio?.[kind]||[]).map((old,i)=>{
    const title=document.querySelector(`[data-v912="${kind}-${i}-title"]`)?.value||'';
    const meta=document.querySelector(`[data-v912="${kind}-${i}-meta"]`)?.value||'';
    const body=document.querySelector(`[data-v912="${kind}-${i}-body"]`)?.value||'';
    return kind==='news'?{active:true,type:meta||'News',title,body,theme:'all',priority:i+1}:{key:(title||'show').toLowerCase().replace(/[^a-z0-9]+/g,'-'),title,time:meta,body,active:true,priority:i+1};
  }).filter(x=>x.title||x.body);
  return arr;
}
function v912Top20ToText(items){return (items||[]).map((x,i)=>`${x.rank||i+1}; ${x.artist||''}; ${x.title||''}; ${x.genre||''}; ${x.points||''}`).join('\n');}
function v912ParseTop20(txt){return String(txt||'').split(/\n+/).map((line,i)=>{
  const p=line.split(';').map(s=>s.trim()); if(!p[1]&&!p[2])return null;
  return {rank:Number(p[0])||i+1,artist:p[1]||'',title:p[2]||'',genre:p[3]||'Music',points:Number(p[4])||Math.max(100-i,1)};
}).filter(Boolean).slice(0,20);}
function v912FillForm(data){
  v912ContentStudio=data||v912DefaultStudio(); const d=v912ContentStudio;
  v912Set('v912HeroHeadline',d.hero?.headline); v912Set('v912HeroMessage',d.hero?.message); v912Set('v912NextBroadcast',d.hero?.nextBroadcast);
  v912Set('v912FollowerGoal',d.goals?.followers); v912Set('v912SubGoal',d.goals?.subs); v912Set('v912RequestMessage',d.goals?.requests);
  v912Set('v912TopTicker',d.ticker?.top); v912Set('v912BottomTicker',d.ticker?.bottom);
  v912Set('v912Top20Text',v912Top20ToText(d.top20));
  v912Set('v912Box1Headline',d.overlay?.box1?.headline); v912Set('v912Box1Body',d.overlay?.box1?.body);
  v912Set('v912Box2Headline',d.overlay?.box2?.headline); v912Set('v912Box2Body',d.overlay?.box2?.body);
  v912Set('v912Box3Headline',d.overlay?.box3?.headline); v912Set('v912Box3Body',d.overlay?.box3?.body);
  v912RenderList('news',d.news||[]); v912RenderList('shows',d.shows||[]);
}
function v912ReadForm(){
  if(!v912ContentStudio)v912ContentStudio=v912DefaultStudio();
  v912ContentStudio.hero={headline:v912Get('v912HeroHeadline'),message:v912Get('v912HeroMessage'),nextBroadcast:v912Get('v912NextBroadcast')};
  v912ContentStudio.goals={followers:v912Get('v912FollowerGoal'),subs:v912Get('v912SubGoal'),requests:v912Get('v912RequestMessage')};
  v912ContentStudio.ticker={top:v912Get('v912TopTicker'),bottom:v912Get('v912BottomTicker')};
  v912ContentStudio.news=v912ReadList('news'); v912ContentStudio.shows=v912ReadList('shows');
  v912ContentStudio.top20=v912ParseTop20(v912Get('v912Top20Text'));
  v912ContentStudio.overlay={box1:{headline:v912Get('v912Box1Headline'),body:v912Get('v912Box1Body')},box2:{headline:v912Get('v912Box2Headline'),body:v912Get('v912Box2Body')},box3:{headline:v912Get('v912Box3Headline'),body:v912Get('v912Box3Body')}};
  v912ContentStudio.updatedAt=new Date().toISOString();
  return v912ContentStudio;
}
async function v912LoadStudio(){
  try{const r=await api('/api/content-studio'); v912FillForm(r.contentStudio||v912DefaultStudio()); v912Status('✅ Content Studio loaded.');}
  catch(e){v912FillForm(v912DefaultStudio()); v912Status('⚠️ Loaded local defaults: '+e.message);}
}
function v912SaveDraft(){const d=v912ReadForm(); localStorage.setItem('DJF_V912_CONTENT_DRAFT',JSON.stringify(d)); v912Status('✅ Draft saved in this browser.');}
function v912LoadDraft(){try{const d=JSON.parse(localStorage.getItem('DJF_V912_CONTENT_DRAFT')||'null'); if(d){v912FillForm(d); v912Status('✅ Draft loaded.');}else v912Status('No draft saved yet.');}catch(e){v912Status('❌ Draft could not be loaded.');}}
function v912AddNews(){if(!v912ContentStudio)v912ContentStudio=v912DefaultStudio();v912ContentStudio.news=v912ReadList('news');v912ContentStudio.news.push({type:'News',title:'New update',body:'Write the update here.'});v912RenderList('news',v912ContentStudio.news);}
function v912AddShow(){if(!v912ContentStudio)v912ContentStudio=v912DefaultStudio();v912ContentStudio.shows=v912ReadList('shows');v912ContentStudio.shows.push({title:'New show',time:'Time',body:'Show description.'});v912RenderList('shows',v912ContentStudio.shows);}
function v912RemoveItem(kind,i){if(!v912ContentStudio)v912ContentStudio=v912DefaultStudio();v912ContentStudio[kind]=v912ReadList(kind);v912ContentStudio[kind].splice(i,1);v912RenderList(kind,v912ContentStudio[kind]);}
function v912ApplyLocally(){
  const d=v912ReadForm();
  if(typeof DJF_value==='function'){DJF_value('quickHeadline',d.hero.headline);DJF_value('quickMessage',d.hero.message);DJF_value('v911HeroHeadline',d.hero.headline);DJF_value('v911HeroMessage',d.hero.message);DJF_value('v911Ticker',d.ticker.bottom);}
  if(typeof topItems!=='undefined') topItems=[{id:'v912-top-ticker',active:true,theme:'all',text:d.ticker.top,priority:1}];
  if(typeof bottomItems!=='undefined') bottomItems=[{id:'v912-bottom-ticker',active:true,theme:'all',text:d.ticker.bottom,priority:1}];
  if(typeof newsItems!=='undefined') newsItems=d.news;
  if(typeof showsItems!=='undefined') showsItems=d.shows;
  if(typeof top20Items!=='undefined') top20Items=d.top20;
  if(typeof overlayContent!=='undefined'){
    overlayContent=overlayContent||{};
    overlayContent.box1=[{active:true,label:'BROADCAST',headline:d.overlay.box1.headline,body:d.overlay.box1.body,icon:'📡',priority:1}];
    overlayContent.box2=[{active:true,label:'ON AIR',headline:d.overlay.box2.headline,body:d.overlay.box2.body,icon:'📺',priority:1}];
    overlayContent.box3=[{active:true,label:'COMMUNITY',headline:d.overlay.box3.headline,body:d.overlay.box3.body,icon:'🎧',priority:1}];
    overlayContent.box4={locked:'twitch-chat'};
  }
  v912Status('✅ Applied locally. Use Publish Live to send it to website and overlay.');
}
async function v912PublishLive(){
  try{
    v912ApplyLocally(); const d=v912ReadForm();
    const r=await api('/api/content-studio',{method:'POST',body:JSON.stringify(d)});
    if(typeof loadAll==='function') await loadAll();
    v912Status('✅ V912 published live. Website, news, Top 20, goals, ticker and overlay messages are synced.');
  }catch(e){v912Status('❌ V912 publish failed: '+e.message);}
}
const V912_originalLoadAll=loadAll;loadAll=async function(){await V912_originalLoadAll();setTimeout(()=>{if(document.getElementById('v912ContentStudio')&&!v912ContentStudio)v912LoadStudio();},400);};
setTimeout(()=>{if(document.getElementById('v912ContentStudio'))v912LoadStudio();},2000);


/* ===== V913 Asset & Theme Upload Manager ===== */
let v913Assets = null;
let v913Selected = "weekend";
function v913DefaultAssets(){
  const keys = Object.keys(typeof THEMES !== 'undefined' ? THEMES : {weekend:'Weekend'});
  const themeAssets = {};
  keys.forEach(k=>{
    themeAssets[k]={key:k,title:String((THEMES&&THEMES[k])||k).replace(/^[^A-Z0-9]+/i,'').trim()||k.toUpperCase(),background:`themes/${k}.png`,heroImage:`themes/${k}-hero.png`,overlayBackground:`themes/${k}.png`,logo:'assets/img/dj-folsoe-logo.png',note:'Managed by V913 Asset Manager'};
  });
  return {version:'V913 Asset & Theme Upload Manager',activeTheme:(typeof activeTheme!=='undefined'?activeTheme:'weekend'),themeAssets,globalAssets:{logo:'assets/img/dj-folsoe-logo.png',ogImage:'assets/og-dj-folsoe.jpg'},updatedAt:new Date().toISOString()};
}
function v913Set(id,val){const el=document.getElementById(id); if(el)el.value=val||'';}
function v913Text(id,val){const el=document.getElementById(id); if(el)el.textContent=val||'';}
function v913Status(msg){v913Text('v913Status',msg);}
function v913SanitizePath(path){return String(path||'').trim().replace(/^\.\//,'').replace(/\\/g,'/');}
function v913MissingPath(path){const p=v913SanitizePath(path);return !p || p.includes(' ') || (!p.includes('/') && !p.includes('.'));}
function v913RenderSelect(){
  const sel=document.getElementById('v913ThemeSelect'); if(!sel)return;
  const assets=v913Assets||v913DefaultAssets();
  const keys=Object.keys(assets.themeAssets||{});
  sel.innerHTML=keys.map(k=>`<option value="${k}">${(assets.themeAssets[k]?.title||k).toUpperCase()}</option>`).join('');
  sel.value=v913Selected||assets.activeTheme||keys[0]||'weekend';
}
function v913RenderCards(){
  const host=document.getElementById('v913ThemeCards'); if(!host)return;
  const assets=v913Assets||v913DefaultAssets();
  host.innerHTML=Object.keys(assets.themeAssets||{}).map(k=>{
    const a=assets.themeAssets[k]||{}; const miss=[a.background,a.heroImage,a.overlayBackground,a.logo].some(v913MissingPath);
    return `<div class="v913ThemeCard ${k===v913Selected?'active':''}" onclick="v913SelectTheme('${k}')"><b>${a.title||k}</b><small>${a.background||'Missing background'}</small><small>${a.overlayBackground||'Missing overlay background'}</small><small class="${miss?'v913Missing':'v913Ok'}">${miss?'Missing/invalid path':'Paths ready'}</small></div>`;
  }).join('');
}
function v913FillForm(){
  const assets=v913Assets||v913DefaultAssets();
  const a=(assets.themeAssets||{})[v913Selected]||{};
  v913Text('v913ActiveTheme',assets.activeTheme||'weekend'); v913Text('v913SelectedTheme',v913Selected); v913Text('v913LastPublish',assets.updatedAt||'Not published');
  v913Set('v913ThemeTitle',a.title||v913Selected.toUpperCase()); v913Set('v913Background',a.background||`themes/${v913Selected}.png`); v913Set('v913HeroImage',a.heroImage||`themes/${v913Selected}-hero.png`); v913Set('v913OverlayBackground',a.overlayBackground||a.background||`themes/${v913Selected}.png`); v913Set('v913Logo',a.logo||'assets/img/dj-folsoe-logo.png'); v913Set('v913AssetNote',a.note||'');
  v913CheckAssets(false); v913RenderCards();
}
function v913ReadForm(){
  if(!v913Assets)v913Assets=v913DefaultAssets();
  v913Assets.themeAssets=v913Assets.themeAssets||{};
  v913Assets.themeAssets[v913Selected]={key:v913Selected,title:DJF_get('v913ThemeTitle')||v913Selected.toUpperCase(),background:v913SanitizePath(DJF_get('v913Background')),heroImage:v913SanitizePath(DJF_get('v913HeroImage')),overlayBackground:v913SanitizePath(DJF_get('v913OverlayBackground')),logo:v913SanitizePath(DJF_get('v913Logo')),note:DJF_get('v913AssetNote')};
  v913Assets.activeTheme=v913Selected; v913Assets.updatedAt=new Date().toISOString();
  return v913Assets;
}
function v913SelectTheme(key){v913ReadForm(); v913Selected=key||'weekend'; v913RenderSelect(); v913FillForm();}
async function v913LoadAssets(){
  try{const r=await api('/api/asset-manager'); v913Assets=r.assets||v913DefaultAssets(); v913Selected=v913Assets.activeTheme||v913Selected||'weekend'; v913RenderSelect(); v913FillForm(); v913Status('✅ V913 assets loaded.');}
  catch(e){v913Assets=v913DefaultAssets(); v913RenderSelect(); v913FillForm(); v913Status('⚠️ Loaded local defaults: '+e.message);}
}
function v913UseStandardPaths(){
  const k=v913Selected||'weekend'; v913Set('v913Background',`themes/${k}.png`); v913Set('v913HeroImage',`themes/${k}-hero.png`); v913Set('v913OverlayBackground',`themes/${k}.png`); v913Set('v913Logo','assets/img/dj-folsoe-logo.png'); v913Status('✅ Standard paths inserted. Upload these files to GitHub, then publish.'); v913ReadForm(); v913RenderCards();
}
function v913CheckAssets(show=true){
  const paths=[DJF_get('v913Background'),DJF_get('v913HeroImage'),DJF_get('v913OverlayBackground'),DJF_get('v913Logo')];
  const missing=paths.filter(v913MissingPath); v913Text('v913AssetCheck',missing.length?`${missing.length} path issue(s)`:'Paths ready');
  if(show)v913Status(missing.length?'⚠️ Check paths: '+missing.join(', '):'✅ All asset paths look valid.');
  return missing.length===0;
}
function v913ApplyToThemeManager(){
  const a=v913ReadForm().themeAssets[v913Selected];
  if(typeof DJF_value==='function'){DJF_value('v907ThemeBg',a.background);DJF_value('v907WebsiteHero',a.heroImage);DJF_value('v907OverlayBg',a.overlayBackground);DJF_value('v907ThemeTitle',a.title);}
  if(typeof activeTheme!=='undefined')activeTheme=v913Selected;
  v913Status('✅ Applied to Theme Manager fields. Publish assets to sync website + overlay.');
}
function v913ExportAssetMap(){v913ReadForm(); v913Status(JSON.stringify(v913Assets,null,2));}
async function v913PublishAssets(){
  try{
    const payload=v913ReadForm();
    const r=await api('/api/asset-manager',{method:'POST',body:JSON.stringify(payload)});
    if(typeof loadAll==='function') await loadAll();
    v913Assets=r.assets||payload; v913FillForm();
    v913Status('✅ V913 assets published. Theme paths are now centralized for website + overlay.');
  }catch(e){v913Status('❌ V913 publish failed: '+e.message);}
}
const V913_originalLoadAll=loadAll;loadAll=async function(){await V913_originalLoadAll();setTimeout(()=>{if(document.getElementById('v913AssetManager')&&!v913Assets)v913LoadAssets();},500);};
setTimeout(()=>{if(document.getElementById('v913AssetManager'))v913LoadAssets();},2200);


/* ===== V914 LIVE PREVIEW ===== */
function v914Pick(){
  const g=(id)=>DJF_get(id)||'';
  const t=(id)=>{const el=DJF_el(id);return el?el.textContent:''};
  const activeTheme=(g('v913ThemeSelect')||g('themeSelect')||t('v911ActiveTheme')||'weekend').trim();
  const heroTitle=g('v912HeroTitle')||g('quickHeadline')||g('heroTitle')||t('v906SelectedTitle')||'DJ FOLSOE LIVE';
  const heroText=g('v912HeroText')||g('quickMessage')||g('heroText')||'Live Music TV from Denmark';
  const nowOnAir=g('quickOnAir')||t('v911ActiveShow')||t('v906SelectedTitle')||'ON AIR';
  const nextShow=g('v912NextBroadcast')||g('quickNextShow')||'Next broadcast coming up';
  const goal=g('v912GoalPrimary')||g('quickFollowerGoal')||'Community goal active';
  const ticker=g('v912TickerMessage')||g('tickerMessage')||g('quickRequestLine')||'Welcome to DJ FOLSOE NETWORK · Music TV live from Denmark';
  const box1Title=g('v909Box1Title')||g('overlayBox1Title')||'STATUS';
  const box1Body=g('v912Box1Body')||g('v909Box1Body')||g('overlayBox1Body')||'Broadcast cloud online';
  const box2Title=g('v909Box2Title')||g('overlayBox2Title')||'SHOW INFO';
  const box2Body=g('v912Box2Body')||g('v909Box2Body')||g('overlayBox2Body')||nextShow;
  const box3Title=g('v909Box3Title')||g('overlayBox3Title')||'COMMUNITY';
  const box3Body=g('v912Box3Body')||g('v909Box3Body')||g('overlayBox3Body')||goal;
  const bg=g('v913Background')||g('v907ThemeBg')||`themes/${activeTheme}.png`;
  return {activeTheme,heroTitle,heroText,nowOnAir,nextShow,goal,ticker,box1Title,box1Body,box2Title,box2Body,box3Title,box3Body,bg};
}
function v914Text(id,value){const el=DJF_el(id);if(el)el.textContent=value||'';}
function v914RefreshPreview(){
  const p=v914Pick();
  v914Text('v914ThemeBadge',(p.activeTheme||'theme').toUpperCase()+' · MUSIC TV PREVIEW');
  v914Text('v914HeroTitle',p.heroTitle);
  v914Text('v914HeroText',p.heroText);
  v914Text('v914NowOnAir',p.nowOnAir);
  v914Text('v914NextShow',p.nextShow);
  v914Text('v914Goal',p.goal);
  v914Text('v914AssetPath','Background: '+p.bg);
  v914Text('v914Box1Title',p.box1Title);v914Text('v914Box1Body',p.box1Body);
  v914Text('v914Box2Title',p.box2Title);v914Text('v914Box2Body',p.box2Body);
  v914Text('v914Box3Title',p.box3Title);v914Text('v914Box3Body',p.box3Body);
  v914Text('v914TickerText',p.ticker);
  const preview=DJF_el('v914LivePreview');
  if(preview && p.bg){preview.style.setProperty('--v914-bg',`url('${p.bg}')`);}
  v914Text('v914Status','✅ Preview refreshed. Nothing is published until you press Publish. Box 4 remains locked to Twitch chat.');
  return p;
}
['input','change','keyup'].forEach(evt=>document.addEventListener(evt,function(e){
  if(e.target && e.target.id && /^(v912|v913|v909|quick|overlay|ticker|hero|theme)/.test(e.target.id)){
    clearTimeout(window.__v914Timer); window.__v914Timer=setTimeout(v914RefreshPreview,180);
  }
}));
const V914_originalLoadAll=loadAll;loadAll=async function(){await V914_originalLoadAll();setTimeout(v914RefreshPreview,750);};
setTimeout(v914RefreshPreview,2600);

/* ===== V915 PUBLISH SAFETY & BACKUP SYSTEM ===== */
let v915Dirty=false;
const V915_DRAFT_KEY='DJF_V915_ADMIN_DRAFT';
function v915SetStatus(msg){DJF_text('v915Status',msg);}
function v915MarkDirty(){v915Dirty=true;document.body.classList.add('v915Dirty');DJF_text('v915DraftState','Unsaved changes');}
function v915MarkClean(){v915Dirty=false;document.body.classList.remove('v915Dirty');DJF_text('v915DraftState','Clean');}
function v915Snapshot(){
  let preview={};
  try{preview=typeof v914Pick==='function'?v914Pick():{};}catch(e){}
  return {
    version:'V915 Publish Safety snapshot',
    activeTheme: typeof activeTheme!=='undefined'?activeTheme:'weekend',
    preview,
    core: typeof core!=='undefined'?core:null,
    homepage: typeof home!=='undefined'?home:null,
    overlayContent: typeof overlayContent!=='undefined'?overlayContent:null,
    topTickerItems: typeof topItems!=='undefined'?topItems:[],
    bottomTickerItems: typeof bottomItems!=='undefined'?bottomItems:[],
    createdAt:new Date().toISOString()
  };
}
function v915RenderSnapshot(snapshot){
  DJF_text('v915SnapshotPreview',JSON.stringify(snapshot||v915Snapshot(),null,2).slice(0,9000));
}
function v915SaveDraft(){
  const snap=v915Snapshot();
  localStorage.setItem(V915_DRAFT_KEY,JSON.stringify(snap));
  v915RenderSnapshot(snap);v915MarkClean();
  v915SetStatus('✅ Draft saved locally. Nothing has been published yet.');
}
function v915ResetDraft(){
  localStorage.removeItem(V915_DRAFT_KEY);v915MarkClean();v915RenderSnapshot(v915Snapshot());
  v915SetStatus('✅ Draft reset. Current loaded data is still untouched.');
}
async function v915LoadSafety(){
  try{
    const r=await api('/api/publish-safety');
    const backups=r.backups||[];
    DJF_text('v915BackupCount',String(backups.length));
    DJF_text('v915LastBackup',backups[0]?.createdAt||'No backup yet');
    v915RenderSnapshot(r.lastSnapshot||backups[0]||v915Snapshot());
    v915SetStatus('✅ Publish safety loaded.');
  }catch(e){
    const local=localStorage.getItem(V915_DRAFT_KEY);
    if(local){try{v915RenderSnapshot(JSON.parse(local));}catch(_){}}
    v915SetStatus('⚠️ Could not load worker safety state: '+e.message);
  }
}
async function v915BackupCurrent(){
  try{
    const snap=v915Snapshot();
    const r=await api('/api/publish-safety',{method:'POST',body:JSON.stringify({action:'backup',snapshot:snap})});
    DJF_text('v915BackupCount',String((r.backups||[]).length));
    DJF_text('v915LastBackup',r.backups?.[0]?.createdAt||snap.createdAt);
    v915RenderSnapshot(snap);
    v915SetStatus('✅ Backup created before publish.');
    return true;
  }catch(e){v915SetStatus('❌ Backup failed: '+e.message);return false;}
}
async function v915RestoreLast(){
  if(!confirm('Restore last published backup into the live data engine?')) return;
  try{
    const r=await api('/api/publish-safety',{method:'POST',body:JSON.stringify({action:'restore-last'})});
    v915RenderSnapshot(r.restored||r.lastSnapshot||{});
    v915MarkClean();
    if(typeof loadAll==='function') await loadAll();
    v915SetStatus('✅ Last backup restored. Check website/overlay preview before publishing again.');
  }catch(e){v915SetStatus('❌ Restore failed: '+e.message);}
}
async function v915SafePublish(){
  if(v915Dirty && !confirm('You have unsaved changes. Save draft and continue with safe publish?')) return;
  v915SaveDraft();
  const ok=await v915BackupCurrent();
  if(!ok && !confirm('Backup failed. Publish anyway?')) return;
  if(!confirm('Publish live now to website + overlay? Box 4 stays locked to Twitch chat.')) return;
  if(typeof V915_originalPublishEverything==='function') await V915_originalPublishEverything();
  v915MarkClean();
  v915SetStatus('✅ Safe publish complete. Backup was created before publish.');
  setTimeout(v915LoadSafety,900);
}
['input','change','keyup'].forEach(evt=>document.addEventListener(evt,function(e){
  if(e.target && e.target.matches('input,textarea,select')) v915MarkDirty();
}));
window.addEventListener('beforeunload',function(e){if(v915Dirty){e.preventDefault();e.returnValue='Unsaved admin changes';}});
const V915_originalPublishEverything=publishEverything;
publishEverything=async function(){
  if(!confirm('Publish everything live now? V915 recommends Safe Publish when editing important content.')) return;
  await V915_originalPublishEverything();
  v915MarkClean();
};
const V915_originalLoadAll=loadAll;loadAll=async function(){await V915_originalLoadAll();setTimeout(v915LoadSafety,700);};
setTimeout(()=>{if(document.getElementById('v915PublishSafety')){v915RenderSnapshot(v915Snapshot());v915LoadSafety();}},3200);


/* ===== V916 ADMIN STATUS & HEALTH CHECK ===== */
function v916Set(id, value){DJF_text(id, value == null ? '' : String(value));}
function v916Class(id, state){const el=document.getElementById(id); if(!el) return; el.classList.remove('ok','warn','bad'); el.classList.add(state||'warn');}
function v916SetCard(card,statusId,detailId,state,label,detail){v916Class(card,state);v916Set(statusId,label);v916Set(detailId,detail);}
function v916Warnings(list){const ul=document.getElementById('v916Warnings'); if(!ul) return; ul.innerHTML=''; (list&&list.length?list:['No warnings. System looks ready.']).forEach(w=>{const li=document.createElement('li'); li.textContent=w; ul.appendChild(li);});}
function v916LocalHealth(){
  const warnings=[];
  const data={ok:true,source:'local-admin',checks:{}};
  const theme=(typeof activeTheme!=='undefined'?activeTheme:(typeof core!=='undefined'?core.activeTheme:'weekend'))||'weekend';
  const overlay=(typeof overlayContent!=='undefined'?overlayContent:(typeof core!=='undefined'?core.overlayContent:null))||{};
  const homepage=(typeof home!=='undefined'?home:(typeof core!=='undefined'?core.homepage:null))||{};
  const hasBox1=!!(overlay.box1?.headline||overlay.box1?.title||document.getElementById('v911Box1')?.value||document.getElementById('v912Box1Headline')?.value);
  const hasBox2=!!(overlay.box2?.headline||overlay.box2?.title||document.getElementById('v911Box2')?.value||document.getElementById('v912Box2Headline')?.value);
  const hasBox3=!!(overlay.box3?.headline||overlay.box3?.title||document.getElementById('v911Box3')?.value||document.getElementById('v912Box3Headline')?.value);
  const ticker=String(document.getElementById('v911Ticker')?.value||document.getElementById('v912TopTicker')?.value||'').trim();
  if(!hasBox1) warnings.push('Overlay box 1 has no visible headline.');
  if(!hasBox2) warnings.push('Overlay box 2 has no visible headline.');
  if(!hasBox3) warnings.push('Overlay box 3 has no visible headline.');
  if(!ticker) warnings.push('Ticker text is empty in quick edit / Content Studio.');
  if(!theme) warnings.push('No active theme selected.');
  if(!String(homepage.heroHeadline||document.getElementById('v911HeroHeadline')?.value||document.getElementById('v912HeroHeadline')?.value||'').trim()) warnings.push('Website hero headline is empty.');
  data.checks={api:{state:'warn',label:'LOCAL',detail:'Worker endpoint not reached yet'},website:{state:warnings.some(x=>x.includes('Website'))?'warn':'ok',label:warnings.some(x=>x.includes('Website'))?'WARNING':'OK',detail:'Website hero/homepage data scanned locally'},overlay:{state:(!hasBox1||!hasBox2||!hasBox3)?'warn':'ok',label:(!hasBox1||!hasBox2||!hasBox3)?'WARNING':'OK',detail:'Overlay box 1-3 scanned. Box 4 locked to Twitch chat'},theme:{state:theme?'ok':'warn',label:theme?'OK':'WARNING',detail:'Active theme: '+theme},publish:{state:'warn',label:'CHECK',detail:'Run worker check for latest published timestamp'},locks:{state:'ok',label:'PROTECTED',detail:'Locked areas preserved'}};
  data.ready=warnings.length===0; data.warnings=warnings; return data;
}
function v916RenderHealth(r){
  const checks=(r&&r.checks)||{}; const warnings=(r&&r.warnings)||[]; const ready=!!(r&&r.ready&&warnings.length===0);
  v916SetCard('v916CardApi','v916ApiStatus','v916ApiDetail',checks.api?.state||'warn',checks.api?.label||'CHECK',checks.api?.detail||'API status unknown');
  v916SetCard('v916CardWebsite','v916WebsiteStatus','v916WebsiteDetail',checks.website?.state||'warn',checks.website?.label||'CHECK',checks.website?.detail||'Website status unknown');
  v916SetCard('v916CardOverlay','v916OverlayStatus','v916OverlayDetail',checks.overlay?.state||'warn',checks.overlay?.label||'CHECK',checks.overlay?.detail||'Overlay status unknown');
  v916SetCard('v916CardTheme','v916ThemeStatus','v916ThemeDetail',checks.theme?.state||'warn',checks.theme?.label||'CHECK',checks.theme?.detail||'Theme status unknown');
  v916SetCard('v916CardPublish','v916PublishStatus','v916PublishDetail',checks.publish?.state||'warn',checks.publish?.label||'CHECK',checks.publish?.detail||'Publish status unknown');
  v916Warnings(warnings);
  const banner=document.getElementById('v916ReadyBanner'); if(banner){banner.classList.remove('ok','warn','bad'); banner.classList.add(ready?'ok':(warnings.length?'warn':'ok'));}
  v916Set('v916ReadyText',ready?'READY TO GO LIVE':'CHECK BEFORE GOING LIVE');
  v916Set('v916ReadySub',ready?'Website, overlay, theme and API checks look OK.':'Warnings found: '+(warnings.length||'API check needed'));
  v916Set('v916Status',JSON.stringify({ready,warnings,checkedAt:r?.checkedAt||new Date().toISOString(),source:r?.source||'admin'},null,2));
}
async function v916RunHealthCheck(showReady){
  const local=v916LocalHealth();
  v916RenderHealth(local);
  try{
    let r=null;
    try{ r=await api('/api/health-check'); }
    catch(firstErr){
      try{ r=await api('/api/health'); }
      catch(secondErr){ throw new Error(firstErr.message || secondErr.message || 'Failed to fetch'); }
    }
    const merged=Object.assign({},local,r,{warnings:[...(r.warnings||[]),...(local.warnings||[])]});
    merged.ready=!!(r.ready && local.ready && merged.warnings.length===0);
    if(merged.checks&&merged.checks.api){ merged.checks.api.detail=(merged.checks.api.detail||'Worker online')+' · '+API_BASE; }
    v916RenderHealth(merged);
    if(showReady) setStatus(merged.ready?'✅ V916 Ready to go live.':'⚠️ V916 found warnings before going live.');
  }catch(e){
    local.checks.api={state:'bad',label:'ERROR',detail:'Could not reach API. Check Cloudflare Worker redeploy and route: '+(DJF_apiBases().join(' → '))+' · '+e.message};
    local.ready=false;
    local.warnings.unshift('Worker/API health endpoint could not be reached. Redeploy cloudflare-worker/worker.js and check that /api/health-check opens.');
    v916RenderHealth(local);
  }
}
const V916_originalLoadAll=loadAll;loadAll=async function(){await V916_originalLoadAll();setTimeout(()=>{if(document.getElementById('v916HealthCheck'))v916RunHealthCheck();},900);};
setTimeout(()=>{if(document.getElementById('v916HealthCheck'))v916RunHealthCheck();},3600);


/* ===== V917 LAUNCH CHECKLIST & GO LIVE ASSISTANT ===== */
function v917Text(id,v){DJF_text(id, v == null ? '' : String(v));}
function v917SetStatus(msg){v917Text('v917Status',msg);}
function v917ThemeOptions(){
  const sel=document.getElementById('v917ThemeSelect'); if(!sel) return;
  const current=String((typeof activeTheme!=='undefined'&&activeTheme)||'weekend');
  sel.innerHTML=Object.entries(THEMES||{}).map(([k,l])=>`<option value="${k}" ${k===current?'selected':''}>${l}</option>`).join('');
}
function v917CheckData(){
  const theme=String((typeof activeTheme!=='undefined'&&activeTheme)||document.getElementById('v917ThemeSelect')?.value||'').trim();
  const hero=String(document.getElementById('v911HeroHeadline')?.value||document.getElementById('v912HeroHeadline')?.value||document.getElementById('v910HeroHeadline')?.value||'').trim();
  const ticker=String(document.getElementById('v911Ticker')?.value||document.getElementById('v912BottomTicker')?.value||document.getElementById('v910Ticker')?.value||'').trim();
  const box1=String(document.getElementById('v911Box1')?.value||document.getElementById('v912Box1Headline')?.value||document.getElementById('v910Box1Headline')?.value||'').trim();
  const box2=String(document.getElementById('v911Box2')?.value||document.getElementById('v912Box2Headline')?.value||document.getElementById('v910Box2Headline')?.value||'').trim();
  const box3=String(document.getElementById('v911Box3')?.value||document.getElementById('v912Box3Headline')?.value||document.getElementById('v910Box3Headline')?.value||'').trim();
  const lastBackup=String(document.getElementById('v915LastBackup')?.textContent||'').trim();
  const apiStatus=String(document.getElementById('v916ApiStatus')?.textContent||'').trim().toUpperCase();
  const healthReady=String(document.getElementById('v916ReadyText')?.textContent||'').toUpperCase().includes('READY');
  return [
    {key:'show',label:'Show selected',ok:!!(document.getElementById('v917ShowSelect')?.value||document.getElementById('v910ActiveShow')?.value||document.getElementById('v911NowOnAir')?.value),detail:'One Click Show Control / Broadcast mode has a selected show.'},
    {key:'theme',label:'Theme selected',ok:!!theme,detail:theme?('Active theme: '+theme):'Choose a theme before going live.'},
    {key:'website',label:'Website ready',ok:!!hero,detail:hero?('Hero: '+hero):'Website hero headline is empty.'},
    {key:'overlay',label:'Overlay ready',ok:!!(box1&&box2&&box3),detail:(box1&&box2&&box3)?'Overlay box 1-3 have visible headlines. Box 4 is locked to Twitch chat.':'Overlay box 1-3 need headlines.'},
    {key:'ticker',label:'Ticker ready',ok:!!ticker,detail:ticker?('Ticker: '+ticker.slice(0,90)):'Ticker text is empty.'},
    {key:'preview',label:'Preview checked',ok:!!localStorage.getItem('DJF_V917_PREVIEW_SEEN'),detail:localStorage.getItem('DJF_V917_PREVIEW_SEEN')?'Preview has been opened in this browser session.':'Open Live Preview before publish.'},
    {key:'backup',label:'Backup exists',ok:!!(lastBackup && !/no backup|waiting/i.test(lastBackup)),detail:lastBackup||'Create a backup before publish.'},
    {key:'health',label:'Health check',ok:!!(healthReady||apiStatus==='OK'),detail:healthReady?'Health check says ready.':'Run V916 health check before going live.'}
  ];
}
function v917RenderChecklist(items){
  const host=document.getElementById('v917Checklist'); if(!host) return;
  host.innerHTML=(items||[]).map(x=>`<div class="v917CheckItem ${x.ok?'ok':'warn'}"><i>${x.ok?'✅':'⚠️'}</i><div><b>${x.label}</b><small>${x.detail}</small></div></div>`).join('');
  const ready=(items||[]).every(x=>x.ok);
  const banner=document.getElementById('v917LaunchBanner'); if(banner){banner.classList.remove('ok','warn','bad'); banner.classList.add(ready?'ok':'warn');}
  v917Text('v917LaunchText',ready?'READY TO GO LIVE':'CHECK BEFORE LAUNCH');
  v917Text('v917LaunchSub',ready?'All launch checklist items are ready.':'Missing items: '+(items||[]).filter(x=>!x.ok).map(x=>x.label).join(', '));
  v917SetStatus(JSON.stringify({ready,checkedAt:new Date().toISOString(),missing:(items||[]).filter(x=>!x.ok).map(x=>x.label)},null,2));
}
function v917RefreshAssistant(){v917ThemeOptions();v917RenderChecklist(v917CheckData());}
function v917ApplyShowPreset(){
  const mode=document.getElementById('v917ShowSelect')?.value||'live';
  if(typeof v911OneTap==='function') v911OneTap(mode); else if(typeof v910Mode==='function') v910Mode(mode);
  localStorage.setItem('DJF_V917_SELECTED_SHOW',mode);
  setTimeout(v917RefreshAssistant,250);
  v917SetStatus('✅ Show preset applied: '+mode+'. Continue with preview, backup and publish.');
}
function v917ApplyThemeChoice(){
  const t=document.getElementById('v917ThemeSelect')?.value||'weekend';
  activeTheme=t; if(typeof markTheme==='function') markTheme(t);
  if(typeof v910Set==='function') v910Set('v910ActiveTheme',t);
  localStorage.setItem('DJF_V917_SELECTED_THEME',t);
  setTimeout(v917RefreshAssistant,250);
  v917SetStatus('✅ Theme selected locally: '+t+'. Publish to send it live.');
}
async function v917StartBroadcastSetup(){
  v917ApplyShowPreset();
  v917ApplyThemeChoice();
  if(typeof v914RefreshPreview==='function'){v914RefreshPreview();localStorage.setItem('DJF_V917_PREVIEW_SEEN','yes');}
  if(typeof v916RunHealthCheck==='function') await v916RunHealthCheck(true);
  setTimeout(v917RefreshAssistant,500);
}
async function v917PublishLaunch(){
  v917RefreshAssistant();
  const checks=v917CheckData();
  const missing=checks.filter(x=>!x.ok).map(x=>x.label);
  if(missing.length && !confirm('Checklist has warnings: '+missing.join(', ')+'. Publish anyway?')) return;
  try{
    if(typeof v915BackupCurrent==='function') await v915BackupCurrent();
    if(typeof v915SafePublish==='function') await v915SafePublish();
    else if(typeof v911PublishNow==='function') await v911PublishNow();
    else if(typeof publishEverything==='function') await publishEverything();
    v917SetStatus('✅ V917 launch publish complete. Website + overlay output are synced. Open Twitch when ready.');
    setTimeout(v917RefreshAssistant,600);
  }catch(e){v917SetStatus('❌ V917 publish failed: '+e.message);}
}
const V917_originalJump=jump;jump=function(id){if(id==='v914LivePreview')localStorage.setItem('DJF_V917_PREVIEW_SEEN','yes');return V917_originalJump(id);};
const V917_originalLoadAll=loadAll;loadAll=async function(){await V917_originalLoadAll();setTimeout(v917RefreshAssistant,1200);};
setTimeout(()=>{if(document.getElementById('v917GoLiveAssistant'))v917RefreshAssistant();},4200);


/* V918 Unified Control Center */
const V918_API = (window.DJF_API_BASE || localStorage.getItem('DJF_API_BASE') || API_BASE || '').replace(/\/$/, '');
const v918$ = (id)=>document.getElementById(id);
let v918Twitch = {};
function v918Token(){ return (localStorage.getItem('DJF_ADMIN_TOKEN') || localStorage.getItem('adminToken') || v918$('token')?.value || '').trim(); }
async function v918Json(url, opts={}){
  const headers = Object.assign({'content-type':'application/json'}, opts.headers||{});
  const token = v918Token(); if(token) headers['x-admin-token']=token;
  const r = await fetch(V918_API + url, Object.assign({cache:'no-store', headers}, opts));
  const text = await r.text(); let data={}; try{data=JSON.parse(text)}catch(e){data={raw:text}};
  if(!r.ok) throw new Error(data.error || data.message || r.statusText || 'Request failed');
  return data;
}
function v918NextDateTime(){ const d=v918$('v918NextDate')?.value||''; const t=v918$('v918NextTime')?.value||''; return d && t ? `${d}T${t}` : ''; }
function v918BuildPayload(){
  const title=v918$('v918HeroTitle')?.value || 'DJ FOLSOE';
  const subtitle=v918$('v918HeroSubtitle')?.value || 'Dive into my Twitch world';
  const text=v918$('v918HeroText')?.value || '';
  const ticker=v918$('v918Ticker')?.value || '';
  const currentShow=v918$('v918CurrentShow')?.value || 'DJ FOLSOE';
  const activeTheme=v918$('v918Theme')?.value || 'weekend';
  const mode=v918$('v918Mode')?.value || 'OFFLINE';
  const nextDt=v918NextDateTime();
  const nextShow={title:v918$('v918NextTitle')?.value || 'Next DJ FOLSOE Broadcast',show:v918$('v918NextTitle')?.value || 'Next DJ FOLSOE Broadcast',datetime:nextDt,dateTime:nextDt,timeLabel:nextDt ? new Date(nextDt).toLocaleString('en-GB',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : 'Announced soon',theme:v918$('v918NextTheme')?.value || activeTheme,description:v918$('v918NextDescription')?.value || ''};
  const community={followers:v918Twitch.followers, subs:Number(v918$('v918SubsManual')?.value || v918Twitch.subs || 0), subGoal:Number(v918$('v918SubGoal')?.value || 100), followerGoal:Number(v918$('v918FollowerGoal')?.value || 1000), text:v918$('v918CommunityMessage')?.value || '', requestText:v918$('v918RequestText')?.value || '', specialEvent:v918$('v918SpecialEvent')?.value || ''};
  return {activeTheme,nextShow,homepage:{version:'V918 Unified Control Center',hero:{eyebrow:'DJ FOLSOE TWITCH · MUSIC STREAMER FROM DENMARK',title,subtitle,text,background:`themes/${activeTheme}.png`},ticker:[ticker],nextShow,sectionTitles:{nextKicker:'NEXT SHOW',nextTitle:'Next DJ FOLSOE Broadcast',showsKicker:'FEATURED SHOWS',showsTitle:'Your favorite show'}},website:{title:'DJ FOLSOE',description:text,primaryLanguage:'en'},broadcast:{version:'V918 Unified Control Center',broadcastState:mode,mode,activeShow:currentShow,activeTheme,streamTitle:`${currentShow} · DJ FOLSOE Twitch music streamer from Denmark`,viewers:Number(v918Twitch.viewers||0),live:mode==='LIVE',updatedAt:new Date().toISOString()},overlayHub:{version:'V918 Unified Control Center',state:mode,activeShow:currentShow,activeTheme,ticker,controlPanel:{title:currentShow,status:mode,viewers:Number(v918Twitch.viewers||0),followers:v918Twitch.followers,subs:community.subs,subGoal:community.subGoal,nextShow,infoLine:ticker,requestText:community.requestText,specialEvent:community.specialEvent},updatedAt:new Date().toISOString()},community,bottomTickerItems:[{id:'v918-unified-ticker',active:true,theme:'all',text:ticker,priority:1}],language:'en'};
}
function v918ApplyToFields(data){
  const h=data?.homepage?.hero||{}; const b=data?.broadcast||{}; const c=data?.community||{}; const n=data?.nextShow || data?.homepage?.nextShow || {};
  if(v918$('v918HeroTitle')) v918$('v918HeroTitle').value=h.title||'DJ FOLSOE';
  if(v918$('v918HeroSubtitle')) v918$('v918HeroSubtitle').value=h.subtitle||'Dive into my Twitch world';
  if(v918$('v918HeroText')) v918$('v918HeroText').value=h.text||data?.website?.description||'';
  if(v918$('v918Ticker')) v918$('v918Ticker').value=(data?.homepage?.ticker||data?.bottomTickerItems?.map(x=>x.text)||[])[0]||'';
  if(v918$('v918CurrentShow')) v918$('v918CurrentShow').value=b.activeShow||'DJ FOLSOE';
  if(v918$('v918Theme')) v918$('v918Theme').value=data?.activeTheme||b.activeTheme||'weekend';
  if(v918$('v918Mode')) v918$('v918Mode').value=b.broadcastState||b.mode||'OFFLINE';
  if(v918$('v918NextTitle')) v918$('v918NextTitle').value=n.title||n.show||'Next DJ FOLSOE Broadcast';
  const dt=n.datetime||n.dateTime||''; if(dt){ const [d,t='']=dt.split('T'); if(v918$('v918NextDate')) v918$('v918NextDate').value=d||''; if(v918$('v918NextTime')) v918$('v918NextTime').value=t.slice(0,5)||''; }
  if(v918$('v918NextTheme')) v918$('v918NextTheme').value=n.theme||data?.activeTheme||'weekend';
  if(v918$('v918NextDescription')) v918$('v918NextDescription').value=n.description||'';
  if(v918$('v918SubGoal')) v918$('v918SubGoal').value=c.subGoal||100; if(v918$('v918SubsManual')) v918$('v918SubsManual').value=c.subs||0; if(v918$('v918FollowerGoal')) v918$('v918FollowerGoal').value=c.followerGoal||1000;
  if(v918$('v918CommunityMessage')) v918$('v918CommunityMessage').value=c.text||''; if(v918$('v918RequestText')) v918$('v918RequestText').value=c.requestText||'Use !request in Twitch chat'; if(v918$('v918SpecialEvent')) v918$('v918SpecialEvent').value=c.specialEvent||'';
}
async function v918RefreshAll(){
  try{
    const [hub,tw]=await Promise.all([v918Json('/api/broadcast-hub'), v918Json('/api/twitch-profile?live=1&t='+Date.now()).catch(()=>({ok:false}))]);
    v918Twitch=tw||{}; v918ApplyToFields(hub.core||{}); v918RenderTwitch(); v918PreviewAll();
    v918$('v918Status').textContent='✅ Refreshed Twitch + Admin central data.';
  }catch(e){ if(v918$('v918Status')) v918$('v918Status').textContent='⚠️ Refresh failed: '+e.message; }
}
function v918RenderTwitch(){
  if(v918$('v918TwitchState')) v918$('v918TwitchState').textContent=v918Twitch.isLive?'LIVE':'OFFLINE';
  if(v918$('v918TwitchDetails')) v918$('v918TwitchDetails').textContent=v918Twitch.liveTitle || 'twitch.tv/djfolsoe';
  if(v918$('v918Viewers')) v918$('v918Viewers').textContent=v918Twitch.viewers ?? '0';
  if(v918$('v918Followers')) v918$('v918Followers').textContent=v918Twitch.followers ?? '—';
  if(v918$('v918Subs')) v918$('v918Subs').textContent=v918Twitch.subs ?? v918$('v918SubsManual')?.value ?? '—';
}
function v918PreviewAll(){ const p=v918BuildPayload(); if(v918$('v918PreviewTitle')) v918$('v918PreviewTitle').textContent=p.homepage.hero.title; if(v918$('v918PreviewSub')) v918$('v918PreviewSub').textContent=p.homepage.hero.subtitle; if(v918$('v918PreviewNext')) v918$('v918PreviewNext').textContent=`${p.nextShow.title} · ${p.nextShow.timeLabel}`; if(v918$('v918OverlayTitle')) v918$('v918OverlayTitle').textContent=`${p.broadcast.activeShow} · ${p.broadcast.mode}`; if(v918$('v918OverlayLine')) v918$('v918OverlayLine').textContent=`Viewers ${p.broadcast.viewers||0} · Followers ${p.community.followers ?? '—'} · Subs ${p.community.subs||0}/${p.community.subGoal||100}`; if(v918$('v918OverlayTicker')) v918$('v918OverlayTicker').textContent=p.overlayHub.ticker; if(v918$('v918Status')) v918$('v918Status').textContent='👁️ Preview updated. Same data will feed website + overlay.'; }
function v918QuickMode(mode){ if(v918$('v918Mode')) v918$('v918Mode').value=mode; v918PreviewAll(); }
function v918SaveDraft(){ const p=v918BuildPayload(); localStorage.setItem('DJF_V918_DRAFT', JSON.stringify(p)); if(v918$('v918Status')) v918$('v918Status').textContent='✅ Draft saved locally in this browser.'; }
async function v918PublishEverything(){
  const p=v918BuildPayload();
  if(!confirm('Publish this to website + overlay from the Unified Control Center?')) return;
  try{
    await v918Json('/api/unified-control',{method:'POST',body:JSON.stringify(p)}).catch(async()=>await v918Json('/api/broadcast-hub',{method:'POST',body:JSON.stringify({core:p})}));
    localStorage.setItem('DJF_V918_LAST_PUBLISH', new Date().toISOString());
    if(v918$('v918Status')) v918$('v918Status').textContent='✅ Published. Website and overlay now use the same central data.';
  }catch(e){ if(v918$('v918Status')) v918$('v918Status').textContent='❌ Publish failed: '+e.message; }
}
document.addEventListener('DOMContentLoaded',()=>{ if(document.getElementById('v918UnifiedControl')){ setTimeout(v918RefreshAll,500); ['v918CurrentShow','v918Theme','v918Mode','v918HeroTitle','v918HeroSubtitle','v918HeroText','v918Ticker','v918NextTitle','v918NextDate','v918NextTime','v918NextTheme','v918NextDescription','v918SubsManual','v918SubGoal','v918FollowerGoal','v918CommunityMessage','v918RequestText','v918SpecialEvent'].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('input',v918PreviewAll); }); }});
