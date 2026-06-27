
const API_BASE="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
const THEMES={"fredagsbar": "🍺 FREDAGSBAR", "popup": "⚡ POPUP", "trance": "💙 TRANCE TUESDAY", "retro": "🕹️ RETRO HITS", "eurodance": "💛 EURODANCE", "morning": "☀️ GOOD MORNING TWITCH", "summer": "🌴 SUMMER BEATS", "weekend": "🎉 WEEKEND VIBES"};
const TOP20_SEED=[{"rank": 1, "artist": "Axwell & Bonn", "title": "Whatever Turns You On", "genre": "Dance", "points": 92}, {"rank": 2, "artist": "Hugel, David Guetta", "title": "Shine", "genre": "Dance", "points": 90}, {"rank": 3, "artist": "Calvin Harris", "title": "Satisfy", "genre": "Dance", "points": 88}, {"rank": 4, "artist": "Rune Rask, Hampenberg, The Minds of 99", "title": "Under Din Sne", "genre": "Bootleg Remix", "points": 87}, {"rank": 5, "artist": "Svenstrup & Vendelboe x DJ Encore", "title": "Udødelige", "genre": "Dance", "points": 86}, {"rank": 6, "artist": "Armin Van Buuren", "title": "Dream A Little Dream", "genre": "Trance", "points": 85}, {"rank": 7, "artist": "Lost Frequencies", "title": "Live It All", "genre": "Dance Pop", "points": 84}, {"rank": 8, "artist": "David Guetta, Alok", "title": "Run Run River", "genre": "Progressive EDM", "points": 83}, {"rank": 9, "artist": "Anyma", "title": "Bad Angel", "genre": "Melodic Techno", "points": 82}, {"rank": 10, "artist": "Bebe Rexha", "title": "New Religion", "genre": "Pop Dance", "points": 81}];
let core=null, home=null, activeTheme="weekend";
let topItems=[],bottomItems=[],newsItems=[],showsItems=[],top20Items=[],requestItems=[];

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
      api("/api/bottom-ticker"), api("/api/homepage-news"), api("/api/shows"), api("/api/top20"), api("/api/requests")
    ]);
    core=results[0].value||{};
    home=results[1].value||{};
    if(results[2].value) markTheme(results[2].value.activeTheme);
    topItems=results[3].value?.items||[];
    bottomItems=results[4].value?.items||[];
    newsItems=results[5].value?.items||home.newsCards||[];
    showsItems=results[6].value?.items||home.shows||[];
    top20Items=results[7].value?.items||home.top20||[];
    requestItems=results[8].value?.items||home.requests||[];
    fillProfile();
    renderEditors();
    renderRequests();
    renderTwitch();
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

function arr(type){return type==="top"?topItems:type==="bottom"?bottomItems:type==="news"?newsItems:type==="shows"?showsItems:type==="top20"?top20Items:requestItems;}
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");}

function row(type,item,i){
  if(type==="shows") return `<div class="row shows"><div><label>Key</label><input data-t="${type}" data-i="${i}" data-f="key" value="${esc(item.key||'')}"/></div><div><label>Title</label><input data-t="${type}" data-i="${i}" data-f="title" value="${esc(item.title||'')}"/></div><div><label>Time</label><input data-t="${type}" data-i="${i}" data-f="time" value="${esc(item.time||'')}"/></div><div><label>Body</label><input data-t="${type}" data-i="${i}" data-f="body" value="${esc(item.body||'')}"/></div><button onclick="delRow('${type}',${i})">Slet</button></div>`;
  if(type==="top20") return `<div class="row top20"><div><label>Rank</label><input data-t="${type}" data-i="${i}" data-f="rank" value="${item.rank||i+1}"/></div><div><label>Artist</label><input data-t="${type}" data-i="${i}" data-f="artist" value="${esc(item.artist||'')}"/></div><div><label>Title</label><input data-t="${type}" data-i="${i}" data-f="title" value="${esc(item.title||'')}"/></div><div><label>Genre</label><input data-t="${type}" data-i="${i}" data-f="genre" value="${esc(item.genre||'')}"/></div><div><label>Points</label><input data-t="${type}" data-i="${i}" data-f="points" value="${item.points||0}"/></div><button onclick="delRow('${type}',${i})">Slet</button></div>`;
  if(type==="news") return `<div class="row news"><div><label>Active</label><select data-t="${type}" data-i="${i}" data-f="active"><option value="true" ${item.active!==false?'selected':''}>Yes</option><option value="false" ${item.active===false?'selected':''}>No</option></select></div><div><label>Type</label><input data-t="${type}" data-i="${i}" data-f="type" value="${esc(item.type||'News')}"/></div><div><label>Title</label><input data-t="${type}" data-i="${i}" data-f="title" value="${esc(item.title||'')}"/></div><div><label>Body</label><input data-t="${type}" data-i="${i}" data-f="body" value="${esc(item.body||'')}"/></div><div><label>Priority</label><input data-t="${type}" data-i="${i}" data-f="priority" value="${item.priority||99}"/></div><button onclick="delRow('${type}',${i})">Slet</button></div>`;
  return `<div class="row"><div><label>Active</label><select data-t="${type}" data-i="${i}" data-f="active"><option value="true" ${item.active!==false?'selected':''}>Yes</option><option value="false" ${item.active===false?'selected':''}>No</option></select></div><div><label>Theme</label><input data-t="${type}" data-i="${i}" data-f="theme" value="${esc(item.theme||'all')}"/></div><div><label>Text</label><input data-t="${type}" data-i="${i}" data-f="text" value="${esc(item.text||'')}"/></div><div><label>ID</label><input data-t="${type}" data-i="${i}" data-f="id" value="${esc(item.id||type+Date.now())}"/></div><div><label>Priority</label><input data-t="${type}" data-i="${i}" data-f="priority" value="${item.priority||99}"/></div><button onclick="delRow('${type}',${i})">Slet</button></div>`;
}

function renderEditors(){
  document.getElementById("newsEditor").innerHTML=newsItems.map((x,i)=>row("news",x,i)).join("");
  document.getElementById("topEditor").innerHTML=topItems.map((x,i)=>row("top",x,i)).join("");
  document.getElementById("bottomEditor").innerHTML=bottomItems.map((x,i)=>row("bottom",x,i)).join("");
  document.getElementById("showsEditor").innerHTML=showsItems.map((x,i)=>row("shows",x,i)).join("");
  document.getElementById("top20Editor").innerHTML=top20Items.map((x,i)=>row("top20",x,i)).join("");
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
  else if(type==="news") a.push({id:"news"+Date.now(),active:true,type:"News",title:"",body:"",priority:a.length+1});
  else a.push({id:type+Date.now(),active:true,theme:type==="top"?activeTheme:"all",text:"",priority:a.length+1});
  renderEditors();
}
function delRow(type,i){arr(type).splice(i,1);renderEditors();}

async function saveRows(type){
  collect();
  const endpoint=type==="top"?"/api/theme-ticker-top":type==="bottom"?"/api/bottom-ticker":type==="news"?"/api/homepage-news":type==="shows"?"/api/shows":"/api/top20";
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
