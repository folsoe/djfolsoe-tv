
/* DJ FOLSOE V26432 — Legacy Admin Compatibility + Unified Chart Admin */
(() => {
"use strict";
const API=(window.DJF_API_BASE||"https://djfolsoe-tv-api.sunefolsoe.workers.dev").replace(/\/$/,"");
const $=id=>document.getElementById(id);
const THEME_MAP=[
 ["weekend","Weekend"],["morning","Good Morning Twitch"],["trance","Trance Tuesday"],["eurodance","Eurodance"],
 ["fredagsbar","Fredagsbar"],["retro","Retro Hits"],["popup","Pop Up"],["summer","Summer"],["danske","Danish Hits"],["top20","Top 20"]
];
let chartData=null, chartSha="";

function adminToken(){return ($("adminToken")?.value||sessionStorage.getItem("djf-admin-token")||"").trim()}
function headers(extra={}){const token=adminToken();return {"Content-Type":"application/json",...(token?{"x-admin-token":token,Authorization:`Bearer ${token}`}:{ }),...extra}}
async function req(path,opt={}){const r=await fetch(API+path,{cache:"no-store",...opt,headers:headers(opt.headers||{})});const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw new Error(d.message||d.error||`HTTP ${r.status}`);return d}
function coreFrom(p){return p?.core||p?.data||p?.broadcast?.core||p?.broadcast?.data||p||{}}

function showCms(){
 const loading=$("loadingState"), screens=$("cmsScreens"), panel=$("connectionPanel");
 if(loading)loading.hidden=true;if(screens)screens.hidden=false;if(panel)panel.hidden=true;
 const dot=$("connectionDot"),txt=$("connectionText");if(dot)dot.classList.add("online");if(txt)txt.textContent="Connected";
}
function setConnection(ok,detail="Broadcast Core"){
 const txt=$("connectionText");if(txt)txt.textContent=ok?"Connected":"Connection issue";
 const dot=$("connectionDot");if(dot){dot.style.background=ok?"#39e6a3":"#ff5d73";dot.style.boxShadow=ok?"0 0 14px #39e6a3":"none"}
 const sw=$("statusWorker");if(sw)sw.textContent=ok?"Online":"Unavailable";
 const sv=$("statusWorkerVersion");if(sv)sv.textContent=detail;
}
async function connectCore(){
 const token=$("adminToken")?.value.trim();if(token)sessionStorage.setItem("djf-admin-token",token);
 try{
  const [health,broadcast]=await Promise.all([req("/api/health?v="+Date.now()),req("/api/broadcast?v="+Date.now())]);
  showCms();setConnection(true,health.version||health.build||"Broadcast Core");
  syncThemeUI(coreFrom(broadcast));
  return broadcast;
 }catch(e){
  /* Broadcast may be public while health/token policy differs. */
  try{const broadcast=await req("/api/broadcast?v="+Date.now());showCms();setConnection(true,"Broadcast Core");syncThemeUI(coreFrom(broadcast));return broadcast}
  catch(_){setConnection(false);throw e}
 }
}
function themeId(c){return c?.theme?.id||c?.themeId||c?.activeTheme||""}
function syncThemeUI(c){
 const id=themeId(c);
 document.documentElement.dataset.djfTheme=id||document.documentElement.dataset.djfTheme||"morning";
 document.querySelectorAll("#themePicker [data-theme],#themePicker button").forEach(b=>{
  const bid=b.dataset.theme||b.dataset.id||b.getAttribute("value")||"";
  b.classList.toggle("v26432-live-theme",bid===id);
 });
}
async function setTheme(id){
 if(!id)return;
 await req("/api/set-theme",{method:"POST",body:JSON.stringify({theme:id})});
 const b=await req("/api/broadcast?v="+Date.now());syncThemeUI(coreFrom(b));
 toast(`Theme changed to ${id}`);
}
function renderThemePicker(){
 const box=$("themePicker");if(!box)return;
 box.innerHTML=THEME_MAP.map(([id,label])=>`<button type="button" class="themeChoice" data-theme="${id}"><strong>${label}</strong><span>${id}</span></button>`).join("");
 box.querySelectorAll("[data-theme]").forEach(b=>b.addEventListener("click",async e=>{e.preventDefault();e.stopImmediatePropagation();try{await setTheme(b.dataset.theme)}catch(err){alert("Theme switch failed: "+err.message)}}));
}
function toast(s){
 const t=$("toast");if(!t)return;t.textContent=s;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)
}

/* Charts */
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
function chartRow(s,retro=false){
 const status=s.status||"";
 return `<div class="v26432ChartRow ${retro?"retro":""}" data-rank="${s.rank}">
 <b>${String(s.rank).padStart(2,"0")}</b>
 <input data-f="artist" value="${esc(s.artist||"")}" placeholder="Artist">
 <input data-f="title" value="${esc(s.title||"")}" placeholder="Title">
 ${retro?`<input data-f="year" value="${esc(s.year||"")}" placeholder="Year">`:""}
 <input data-f="last_week" type="number" value="${s.last_week??""}" placeholder="Last">
 <input data-f="peak" type="number" value="${s.peak??s.rank}" placeholder="Peak">
 <input data-f="weeks" type="number" value="${s.weeks??1}" placeholder="Weeks">
 <select data-f="status"><option value="" ${status===""?"selected":""}>Normal</option><option value="new" ${status==="new"?"selected":""}>NEW</option><option value="re-entry" ${status==="re-entry"?"selected":""}>RE</option></select>
 </div>`;
}
function playlistRow(p,i){return `<div class="v26432PlaylistRow" data-playlist="${i}"><input data-f="title" value="${esc(p.title||"")}" placeholder="Playlist title"><input data-f="description" value="${esc(p.description||"")}" placeholder="Description"><input data-f="url" value="${esc(p.url||"")}" placeholder="TIDAL URL"></div>`}
function renderCharts(){
 if(!chartData)return;
 $("v26432Week").value=chartData.chart_week||"";$("v26432Date").value=chartData.published_date||"";
 $("v26432Top20").innerHTML=(chartData.top20||[]).map(x=>chartRow(x,false)).join("");
 $("v26432Retro10").innerHTML=(chartData.retro_top10||[]).map(x=>chartRow(x,true)).join("");
 $("v26432Playlists").innerHTML=`<div class="v26432PlaylistGrid">${(chartData.tidal_playlists||[]).map(playlistRow).join("")}</div>`;
}
function msg(s,bad=false){const x=$("v26432ChartMsg");if(x){x.textContent=s;x.style.borderColor=bad?"rgba(255,93,115,.45)":"rgba(24,220,255,.18)"}}
async function loadPublic(){
 msg("Loading website chart data …");
 const r=await fetch("/data/charts.json?t="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);chartData=await r.json();renderCharts();msg("Current website chart data loaded.");
}
function ghCfg(){return {owner:$("v26432Owner").value.trim(),repo:$("v26432Repo").value.trim(),branch:$("v26432Branch").value.trim()||"main",token:$("v26432GithubToken").value.trim()}}
function decode64(s){return new TextDecoder().decode(Uint8Array.from(atob(String(s||"").replace(/\n/g,"")),c=>c.charCodeAt(0)))}
function encode64(s){const b=new TextEncoder().encode(s);let x="";b.forEach(n=>x+=String.fromCharCode(n));return btoa(x)}
async function loadGithub(){
 const c=ghCfg();if(!c.token)throw new Error("Enter a GitHub token with Contents: read/write.");
 sessionStorage.setItem("djf-github-owner",c.owner);sessionStorage.setItem("djf-github-repo",c.repo);sessionStorage.setItem("djf-github-branch",c.branch);
 const u=`https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/data/charts.json?ref=${encodeURIComponent(c.branch)}`;
 const r=await fetch(u,{headers:{Authorization:`Bearer ${c.token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}});
 const d=await r.json();if(!r.ok)throw new Error(d.message||`GitHub HTTP ${r.status}`);chartSha=d.sha;chartData=JSON.parse(decode64(d.content));renderCharts();msg("charts.json loaded directly from GitHub.");
}
function collectRows(box,retro){
 return [...box.querySelectorAll("[data-rank]")].map(r=>{
  const rank=Number(r.dataset.rank), v=f=>r.querySelector(`[data-f="${f}"]`)?.value??"";
  const old=(retro?chartData.retro_top10:chartData.top20)?.find(x=>Number(x.rank)===rank)||{};
  const last=v("last_week");
  return {...old,rank,artist:v("artist"),title:v("title"),...(retro?{year:v("year")}:{ }),
   last_week:last===""?null:Number(last),peak:Number(v("peak")||rank),weeks:Number(v("weeks")||1),status:v("status")};
 });
}
function collect(){
 chartData=chartData||{};chartData.chart_week=$("v26432Week").value.trim();chartData.published_date=$("v26432Date").value;
 chartData.top20=collectRows($("v26432Top20"),false);chartData.retro_top10=collectRows($("v26432Retro10"),true);
 chartData.tidal_playlists=[...$("v26432Playlists").querySelectorAll("[data-playlist]")].map((r,i)=>{
  const v=f=>r.querySelector(`[data-f="${f}"]`)?.value||"", old=chartData.tidal_playlists?.[i]||{};
  return {...old,title:v("title"),description:v("description"),url:v("url")};
 });return chartData;
}
async function saveGithub(){
 const c=ghCfg();if(!c.token)throw new Error("Enter a GitHub token with Contents: read/write.");
 if(!chartSha)await loadGithub();collect();
 const u=`https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/data/charts.json`;
 const body={message:`Update DJ FOLSOE charts ${chartData.chart_week||""}`.trim(),content:encode64(JSON.stringify(chartData,null,2)+"\n"),sha:chartSha,branch:c.branch};
 const r=await fetch(u,{method:"PUT",headers:{Authorization:`Bearer ${c.token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json"},body:JSON.stringify(body)});
 const d=await r.json();if(!r.ok)throw new Error(d.message||`GitHub HTTP ${r.status}`);chartSha=d.content?.sha||chartSha;msg("Saved. GitHub Pages will deploy the updated chart data shortly.");
}

/* Take control after legacy scripts have registered. */
window.addEventListener("load",()=>{
 renderThemePicker();
 const load=$("loadCms");if(load){const clone=load.cloneNode(true);load.replaceWith(clone);clone.addEventListener("click",async()=>{try{await connectCore();await loadPublic()}catch(e){alert("Admin connection failed: "+e.message)}})}
 const retry=$("retryConnection");if(retry){const clone=retry.cloneNode(true);retry.replaceWith(clone);clone.addEventListener("click",()=>connectCore().catch(e=>alert(e.message)))}
 $("v26432LoadPublic")?.addEventListener("click",()=>loadPublic().catch(e=>msg(e.message,true)));
 $("v26432LoadGithub")?.addEventListener("click",()=>loadGithub().catch(e=>msg(e.message,true)));
 $("v26432SaveGithub")?.addEventListener("click",()=>saveGithub().catch(e=>msg(e.message,true)));
 $("v26432Owner").value=sessionStorage.getItem("djf-github-owner")||$("v26432Owner").value;
 $("v26432Repo").value=sessionStorage.getItem("djf-github-repo")||$("v26432Repo").value;
 $("v26432Branch").value=sessionStorage.getItem("djf-github-branch")||$("v26432Branch").value;
 connectCore().then(loadPublic).catch(()=>{});
});
})();
