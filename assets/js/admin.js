
const API_BASE="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
const THEMES={"fredagsbar": "🍺 FREDAGSBAR", "popup": "⚡ POPUP", "trance": "💙 TRANCE TUESDAY", "retro": "🕹️ RETRO HITS", "eurodance": "💛 EURODANCE", "morning": "☀️ GOOD MORNING TWITCH", "summer": "🌴 SUMMER BEATS", "weekend": "🎉 WEEKEND VIBES"};
const TOP20_SEED=[{"rank": 1, "artist": "Axwell & Bonn", "title": "Whatever Turns You On", "genre": "Dance", "points": 92}, {"rank": 2, "artist": "Hugel, David Guetta", "title": "Shine", "genre": "Dance", "points": 90}, {"rank": 3, "artist": "Calvin Harris", "title": "Satisfy", "genre": "Dance", "points": 88}, {"rank": 4, "artist": "Rune Rask, Hampenberg, The Minds of 99", "title": "Under Din Sne", "genre": "Bootleg Remix", "points": 87}, {"rank": 5, "artist": "Svenstrup & Vendelboe x DJ Encore", "title": "Udødelige", "genre": "Dance", "points": 86}, {"rank": 6, "artist": "Armin Van Buuren", "title": "Dream A Little Dream", "genre": "Trance", "points": 85}, {"rank": 7, "artist": "Lost Frequencies", "title": "Live It All", "genre": "Dance Pop", "points": 84}, {"rank": 8, "artist": "David Guetta, Alok", "title": "Run Run River", "genre": "Progressive EDM", "points": 83}, {"rank": 9, "artist": "Anyma", "title": "Bad Angel", "genre": "Melodic Techno", "points": 82}, {"rank": 10, "artist": "Bebe Rexha", "title": "New Religion", "genre": "Pop Dance", "points": 81}, {"rank": 11, "artist": "RAYE", "title": "Where Is My Husband!", "genre": "Pop", "points": 80}, {"rank": 12, "artist": "Tiësto", "title": "Lethal Industry 2026", "genre": "Trance", "points": 79}, {"rank": 13, "artist": "Purple Disco Machine", "title": "Beat Fantasy", "genre": "Nu-Disco", "points": 78}, {"rank": 14, "artist": "Meduza", "title": "Another World", "genre": "House", "points": 77}, {"rank": 15, "artist": "Dua Lipa", "title": "Physical Reloaded", "genre": "Pop Dance", "points": 76}, {"rank": 16, "artist": "Topic", "title": "Tonight", "genre": "Dance", "points": 75}, {"rank": 17, "artist": "Robin Schulz", "title": "Only Way Is Up", "genre": "Dance Pop", "points": 74}, {"rank": 18, "artist": "Jax Jones", "title": "Never Be Lonely", "genre": "House", "points": 73}, {"rank": 19, "artist": "Ofenbach", "title": "Overdrive", "genre": "Dance", "points": 72}, {"rank": 20, "artist": "Swedish House Mafia", "title": "Ray Of Solar", "genre": "EDM", "points": 71}];
let core=null, home=null, activeTheme="weekend";
let topItems=[],bottomItems=[],newsItems=[],showsItems=[],top20Items=[],discoveryItems=[],requestItems=[];

document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("token").value=localStorage.getItem("DJF_ADMIN_TOKEN")||"";
  renderThemes();
  loadAll();
});

function jump(id){document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});}
function token(){return localStorage.getItem("DJF_ADMIN_TOKEN")||document.getElementById("token").value||"";}
function saveToken(){localStorage.setItem("DJF_ADMIN_TOKEN",document.getElementById("token").value.trim());setStatus("✅ Token gemt");loadAll();}
function openApi(path){window.open(API_BASE+path,"_blank");}
function setStatus(v){document.getElementById("statusBox").textContent=v;}

async function api(path,opt={}){
  opt.headers=Object.assign({"content-type":"application/json","x-admin-token":token()},opt.headers||{});
  const r=await fetch(API_BASE+path,opt);
  const txt=await r.text();
  let j; try{j=JSON.parse(txt);}catch(e){j={raw:txt};}
  if(!r.ok) throw new Error(txt);
  return j;
}

function renderThemes(){
  document.getElementById("themeGrid").innerHTML=Object.entries(THEMES).map(([k,l])=>`<button id="theme_${k}" onclick="setTheme('${k}')">${l}</button>`).join("");
}
function markTheme(k){
  activeTheme=k||activeTheme;
  Object.keys(THEMES).forEach(x=>document.getElementById("theme_"+x)?.classList.toggle("activeThemeBtn",x===activeTheme));
  document.getElementById("activeTheme").textContent="Aktivt tema: "+activeTheme;
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
    setStatus("✅ Data hentet fra Broadcast Cloud\n"+new Date().toLocaleString("da-DK"));
  }catch(e){setStatus("❌ Load-fejl: "+e.message);}
}

function fillProfile(){
  document.getElementById("profileName").value=core.profile?.name||home.profile?.name||"DJ FOLSOE";
  document.getElementById("twitchChannel").value=core.twitchChannel||home.twitch?.login||"djfolsoe";
  document.getElementById("profileDescription").value=core.profile?.description||home.twitch?.description||"";
  document.getElementById("profileGenres").value=(core.profile?.genres||home.profile?.genres||[]).join(", ");
}

async function saveProfile(){
  try{
    const profile=Object.assign({},core.profile||{}, {
      name:document.getElementById("profileName").value.trim()||"DJ FOLSOE",
      description:document.getElementById("profileDescription").value.trim(),
      genres:document.getElementById("profileGenres").value.split(",").map(x=>x.trim()).filter(Boolean)
    });
    const twitchChannel=document.getElementById("twitchChannel").value.trim().toLowerCase()||"djfolsoe";
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
  document.getElementById("newsEditor").innerHTML=newsItems.map((x,i)=>row("news",x,i)).join("");
  document.getElementById("topEditor").innerHTML=topItems.map((x,i)=>row("top",x,i)).join("");
  document.getElementById("bottomEditor").innerHTML=bottomItems.map((x,i)=>row("bottom",x,i)).join("");
  document.getElementById("showsEditor").innerHTML=showsItems.map((x,i)=>row("shows",x,i)).join("");
  document.getElementById("top20Editor").innerHTML=top20Items.map((x,i)=>row("top20",x,i)).join("");
  if(document.getElementById("discoveryEditor")) document.getElementById("discoveryEditor").innerHTML=discoveryItems.map((x,i)=>row("discovery",x,i)).join("");
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
    setStatus("✅ Gemt: "+type);
    loadAll();
  }catch(e){setStatus("❌ Gem-fejl: "+e.message);}
}

function seedTop20(){top20Items=TOP20_SEED.map(x=>Object.assign({},x));renderEditors();}

async function addRequest(){
  try{
    const user=document.getElementById("reqUser").value||"Admin";
    const text=document.getElementById("reqText").value||"!ønske Artist - Title";
    const r=await api("/api/requests",{method:"POST",body:JSON.stringify({user,text})});
    requestItems=r.items||[];
    renderRequests();
    setStatus("✅ Request gemt");
  }catch(e){setStatus("❌ Request-fejl: "+e.message);}
}

function renderRequests(){
  document.getElementById("requestsPreview").innerHTML=(requestItems||[]).slice(0,3).map(x=>`<div class="previewCard"><b>${esc(x.song||x.text||"")}</b><p>${esc(x.user||"Twitch chat")}</p><small>${esc(x.time||"")}</small></div>`).join("");
}

function renderTwitch(){
  const tw=home?.twitch||{};
  document.getElementById("twitchPreview").innerHTML=`<div class="previewCard">${tw.avatar?`<img class="twitchAvatar" src="${tw.avatar}">`:""}<h3>${esc(tw.displayName||"DJ FOLSOE")}</h3><p>${esc(tw.description||"")}</p><p><b>Status:</b> ${tw.isLive?"LIVE":"Offline"}</p><p><b>Viewers:</b> ${tw.viewers||0}</p><p><b>Followers:</b> ${tw.followers||0}</p><p><b>Category:</b> ${esc(tw.category||"Music")}</p></div>`;
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
