const API_BASE="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
const THEMES={
  fredagsbar:"🍺 FREDAGSBAR",
  popup:"⚡ POPUP",
  trance:"💙 TRANCE TUESDAY",
  retro:"🕹️ RETRO HITS",
  eurodance:"💛 EURODANCE",
  morning:"☀️ GOOD MORNING TWITCH",
  summer:"🌴 SUMMER BEATS",
  weekend:"🎉 WEEKEND VIBES"
};
let current=null, topItems=[], bottomItems=[];

document.addEventListener("DOMContentLoaded",()=>{
  const t=document.getElementById("token");
  if(t) t.value=localStorage.getItem("DJF_ADMIN_TOKEN")||"";
  renderThemeButtons();
  loadAll();
});

function token(){return localStorage.getItem("DJF_ADMIN_TOKEN") || document.getElementById("token")?.value || "";}
function saveToken(){localStorage.setItem("DJF_ADMIN_TOKEN",document.getElementById("token").value.trim()); alert("ADMIN_TOKEN gemt");}
function openApi(path){window.open(API_BASE+path,"_blank");}

async function api(path,opt={}){
  opt.headers=Object.assign({"content-type":"application/json","x-admin-token":token()},opt.headers||{});
  const r=await fetch(API_BASE+path,opt);
  const txt=await r.text();
  let j; try{j=JSON.parse(txt)}catch(e){j={raw:txt}}
  if(!r.ok) throw new Error(txt);
  return j;
}

function renderThemeButtons(){
  document.getElementById("themeButtons").innerHTML=Object.entries(THEMES).map(([key,label])=>`<button id="theme_${key}" onclick="setTheme('${key}')">${label}</button>`).join("");
}

function markActive(theme){
  Object.keys(THEMES).forEach(k=>{const b=document.getElementById("theme_"+k); if(b) b.style.outline = k===theme ? "4px solid #00f5ff" : "0";});
}

async function loadAll(){
  try{
    current=await api("/api/site");
    const active=current.theme?.activeTheme || current.theme?.theme?.key || "ukendt";
    document.getElementById("themeStatus").textContent="Aktivt tema: "+active+"\nOverlay endpoint: /api/overlay/v170-state";
    markActive(active);
    const top=await api("/api/theme-ticker-top"); topItems=top.items||[];
    const bottom=await api("/api/bottom-ticker"); bottomItems=bottom.items||[];
    renderEditors();
  }catch(e){
    document.getElementById("themeStatus").textContent="FEJL: "+e.message+"\nTjek ADMIN_TOKEN og Cloudflare worker deploy.";
  }
}

async function setTheme(key){
  if(!token()){alert("Indsæt og gem ADMIN_TOKEN først");return;}
  try{
    document.getElementById("themeStatus").textContent="Skifter tema til "+key+"...";
    const res=await api("/api/theme",{method:"POST",body:JSON.stringify({theme:key})});
    document.getElementById("themeStatus").textContent="✅ Tema gemt: "+res.activeTheme+"\nOverlayet bør skifte efter næste refresh/fetch.";
    markActive(res.activeTheme || key);
    setTimeout(loadAll,800);
  }catch(e){
    alert("Kunne ikke skifte tema: "+e.message);
    document.getElementById("themeStatus").textContent="FEJL ved tema-skift: "+e.message;
  }
}

async function setLanguage(l){
  try{await api("/api/settings",{method:"POST",body:JSON.stringify({language:l})}); alert("Sprog sat til "+l); loadAll();}
  catch(e){alert(e.message)}
}

function row(item,i,type){
  return `<div class="row">
    <div><label>Active</label><select data-type="${type}" data-i="${i}" data-f="active"><option value="true" ${item.active!==false?'selected':''}>Yes</option><option value="false" ${item.active===false?'selected':''}>No</option></select></div>
    <div><label>Theme</label><input data-type="${type}" data-i="${i}" data-f="theme" value="${item.theme||'all'}"></div>
    <div><label>Text</label><input data-type="${type}" data-i="${i}" data-f="text" value="${String(item.text||'').replaceAll('"','&quot;')}"></div>
    <div><label>Priority</label><input data-type="${type}" data-i="${i}" data-f="priority" value="${item.priority||99}"></div>
    <button onclick="delTicker('${type}',${i})">Slet</button>
  </div>`;
}

function renderEditors(){
  document.getElementById("topEditor").innerHTML=topItems.map((x,i)=>row(x,i,"top")).join("") || "<p>Ingen top ticker endnu.</p>";
  document.getElementById("bottomEditor").innerHTML=bottomItems.map((x,i)=>row(x,i,"bottom")).join("") || "<p>Ingen bund ticker endnu.</p>";
}

function collect(){
  document.querySelectorAll("[data-type][data-i][data-f]").forEach(inp=>{
    const arr=inp.dataset.type==="top"?topItems:bottomItems;
    const i=Number(inp.dataset.i), f=inp.dataset.f;
    let v=inp.value;
    if(f==="active") v=v==="true";
    if(f==="priority") v=Number(v||99);
    arr[i][f]=v;
  });
}

function addTicker(type){
  const arr=type==="top"?topItems:bottomItems;
  arr.push({id:type+Date.now(),active:true,theme:type==="top"?"morning":"all",text:"",priority:arr.length+1});
  renderEditors();
}

function delTicker(type,i){(type==="top"?topItems:bottomItems).splice(i,1); renderEditors();}

async function saveTicker(type){
  collect();
  try{
    await api(type==="top"?"/api/theme-ticker-top":"/api/bottom-ticker",{method:"POST",body:JSON.stringify({items:type==="top"?topItems:bottomItems})});
    alert((type==="top"?"Top":"Bund")+" ticker gemt");
    loadAll();
  }catch(e){alert(e.message)}
}

async function runFullTest(){
  const out=document.getElementById("testOutput");
  out.textContent="Tester...";
  try{
    const theme=await api("/api/theme");
    const overlay=await api("/api/overlay/v170-state");
    out.textContent=JSON.stringify({theme, overlayTheme:overlay.theme, topbarNews:overlay.topbarNews, footerTicker:overlay.footerTicker},null,2);
  }catch(e){out.textContent="FEJL: "+e.message;}
}
