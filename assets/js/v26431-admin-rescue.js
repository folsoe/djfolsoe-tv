
/* DJ FOLSOE V26431 — Critical Admin CMS Rescue */
(() => {
"use strict";
const API=(window.DJF_API_BASE||"https://djfolsoe-tv-api.sunefolsoe.workers.dev").replace(/\/$/,"");
const $=id=>document.getElementById(id);
const themes=[
 ["weekend","Weekend"],["morning","Good Morning"],["trance","Trance Tuesday"],["eurodance","Eurodance"],
 ["fredagsbar","Fredagsbar"],["retro","Retro Hits"],["popup","Pop Up"],["summer","Summer"],["danske","Danish Hits"],["top20","Top 20"]
];
let chartData=null, chartSha="";

function msg(text,bad=false){const n=$("v26431ChartMessage");if(n){n.textContent=text;n.style.borderColor=bad?"rgba(255,93,115,.45)":"rgba(24,220,255,.18)";}}
async function api(path,opt={}){const r=await fetch(API+path,{cache:"no-store",...opt,headers:{"Content-Type":"application/json",...(opt.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw new Error(d.message||d.error||`HTTP ${r.status}`);return d}
function coreFrom(p){return p?.core||p?.data||p?.broadcast?.core||p?.broadcast?.data||p||{}}

async function refreshCore(){
 try{
   const p=await api("/api/broadcast?t="+Date.now());
   const c=coreFrom(p), tw=c.twitch||p.twitch||{};
   $("v26431Status")?.classList.add("ok");
   if($("v26431Status")) $("v26431Status").querySelector("strong").textContent="CONNECTED";
   $("v26431ActiveTheme").textContent=c.theme?.title||c.theme?.id||"—";
   $("v26431CurrentShow").textContent=c.show?.title||c.show?.current||c.nextShow?.title||"—";
   $("v26431Twitch").textContent=(tw.live||tw.isLive)?"LIVE":"OFFLINE";
   document.querySelectorAll("#v26431Themes [data-theme]").forEach(b=>b.classList.toggle("active",b.dataset.theme===(c.theme?.id||"")));
 }catch(e){
   $("v26431Status")?.classList.remove("ok");
   if($("v26431Status")) $("v26431Status").querySelector("strong").textContent="OFFLINE";
 }
}
async function setTheme(id){
 const buttons=[...document.querySelectorAll("#v26431Themes button")];buttons.forEach(b=>b.disabled=true);
 try{
   await api("/api/set-theme",{method:"POST",body:JSON.stringify({theme:id})});
   await refreshCore();
 }catch(e){alert("Theme switch failed: "+e.message)}
 finally{buttons.forEach(b=>b.disabled=false)}
}
function renderThemes(){
 const box=$("v26431Themes");if(!box)return;
 box.innerHTML=themes.map(([id,label])=>`<button data-theme="${id}">${label}</button>`).join("");
 box.querySelectorAll("[data-theme]").forEach(b=>b.addEventListener("click",()=>setTheme(b.dataset.theme)));
}

function row(song,retro=false){
 const extra=retro?`<input data-f="year" value="${song.year||""}" placeholder="Year">`:"";
 return `<div class="v26431ChartRow ${retro?"retro":""}" data-rank="${song.rank}">
 <div class="v26431Rank">${String(song.rank).padStart(2,"0")}</div>
 <input data-f="artist" value="${song.artist||""}" placeholder="Artist">
 <input data-f="title" value="${song.title||""}" placeholder="Title">
 ${extra}
 <input data-f="last_week" type="number" value="${song.last_week??""}" placeholder="Last">
 <input data-f="peak" type="number" value="${song.peak??song.rank}" placeholder="Peak">
 <input data-f="weeks" type="number" value="${song.weeks??1}" placeholder="Weeks">
 </div>`;
}
function playlistRow(p,i){
 return `<div class="v26431PlaylistRow" data-playlist="${i}">
 <label>Playlist title<input data-f="title" value="${p.title||""}"></label>
 <label>Description<input data-f="description" value="${p.description||""}"></label>
 <label>TIDAL URL<input data-f="url" value="${p.url||""}" placeholder="https://tidal.com/..."></label></div>`;
}
function renderCharts(){
 if(!chartData)return;
 $("v26431Week").value=chartData.chart_week||"";
 $("v26431Date").value=chartData.published_date||"";
 $("v26431Top20").innerHTML=(chartData.top20||[]).map(x=>row(x,false)).join("");
 $("v26431Retro10").innerHTML=(chartData.retro_top10||[]).map(x=>row(x,true)).join("");
 $("v26431Playlists").innerHTML=(chartData.tidal_playlists||[]).map(playlistRow).join("");
}
async function loadPublicCharts(){
 msg("Loading /data/charts.json …");
 try{
   chartData=await fetch("/data/charts.json?t="+Date.now(),{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()});
   renderCharts();msg("Current public chart data loaded.");
 }catch(e){msg("Could not load public charts: "+e.message,true)}
}
function collect(){
 chartData=chartData||{};
 chartData.chart_week=$("v26431Week").value.trim();
 chartData.published_date=$("v26431Date").value;
 const collectRows=(box,retro)=>[...box.querySelectorAll("[data-rank]")].map(r=>{
   const old=(retro?chartData.retro_top10:chartData.top20)?.find(x=>Number(x.rank)===Number(r.dataset.rank))||{};
   const v=f=>r.querySelector(`[data-f="${f}"]`)?.value??"";
   const rank=Number(r.dataset.rank);
   const last=v("last_week");
   return {...old,rank,artist:v("artist"),title:v("title"),...(retro?{year:v("year")}:{ }),
     last_week:last===""?null:Number(last),peak:Number(v("peak")||rank),weeks:Number(v("weeks")||1)};
 });
 chartData.top20=collectRows($("v26431Top20"),false);
 chartData.retro_top10=collectRows($("v26431Retro10"),true);
 chartData.tidal_playlists=[...$("v26431Playlists").querySelectorAll("[data-playlist]")].map((r,i)=>{
   const old=chartData.tidal_playlists?.[i]||{};const v=f=>r.querySelector(`[data-f="${f}"]`)?.value||"";
   return {...old,title:v("title"),description:v("description"),url:v("url")};
 });
 return chartData;
}
function utf8b64(str){
 const bytes=new TextEncoder().encode(str);let bin="";bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin);
}
function ghConfig(){
 return {
   owner:$("v26431Owner").value.trim(),
   repo:$("v26431Repo").value.trim(),
   branch:$("v26431Branch").value.trim()||"main",
   token:$("v26431GitHubToken").value.trim()
 };
}
async function ghGet(){
 const c=ghConfig();if(!c.token)throw new Error("Enter a GitHub token first.");
 const url=`https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/data/charts.json?ref=${encodeURIComponent(c.branch)}`;
 const r=await fetch(url,{headers:{Authorization:`Bearer ${c.token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"}});
 const d=await r.json();if(!r.ok)throw new Error(d.message||`GitHub HTTP ${r.status}`);chartSha=d.sha;
 const text=new TextDecoder().decode(Uint8Array.from(atob(String(d.content||"").replace(/\n/g,"")),x=>x.charCodeAt(0)));
 chartData=JSON.parse(text);renderCharts();return d;
}
async function ghSave(){
 const c=ghConfig();if(!c.token)throw new Error("Enter a GitHub token first.");
 collect();
 if(!chartSha)await ghGet();
 collect();
 const url=`https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/data/charts.json`;
 const body={message:`Update DJ FOLSOE charts ${chartData.chart_week||""}`.trim(),content:utf8b64(JSON.stringify(chartData,null,2)+"\n"),branch:c.branch,sha:chartSha};
 const r=await fetch(url,{method:"PUT",headers:{Authorization:`Bearer ${c.token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json"},body:JSON.stringify(body)});
 const d=await r.json();if(!r.ok)throw new Error(d.message||`GitHub HTTP ${r.status}`);chartSha=d.content?.sha||chartSha;return d;
}

document.addEventListener("DOMContentLoaded",()=>{
 renderThemes();refreshCore();loadPublicCharts();
 $("v26431Refresh")?.addEventListener("click",refreshCore);
 $("v26431LoadCharts")?.addEventListener("click",async()=>{msg("Loading directly from GitHub…");try{await ghGet();msg("GitHub chart file loaded.");}catch(e){msg(e.message,true)}});
 $("v26431LoadChartData")?.addEventListener("click",loadPublicCharts);
 $("v26431SaveCharts")?.addEventListener("click",async()=>{msg("Saving data/charts.json to GitHub…");try{await ghSave();msg("Saved to GitHub. GitHub Pages will deploy the updated charts shortly.");}catch(e){msg("Save failed: "+e.message,true)}});
});
})();
