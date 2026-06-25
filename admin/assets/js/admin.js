let DATA;
const $ = id => document.getElementById(id);
const DEFAULT_WORKER_URL = "https://djfolsoe-cms-save.sunefolsoe.workers.dev";

async function boot(){
  const r = await fetch("../assets/data/cms.json?cb=" + Date.now());
  DATA = await r.json();
  loadSettings();
  renderDashboard();
  renderPrograms();
  renderChart();
  renderRequests();
  buildJson();
  saveStatus("Klar. Klik først Hent fra GitHub, derefter Gem direkte til GitHub.");
}
function saveStatus(msg,type=""){const el=$("saveStatus"); if(el){el.className="statusBox "+type; el.textContent=msg;}}
function renderDashboard(){
  $("adminLive").textContent=DATA.station?.live?"LIVE":"OFFLINE";
  $("adminViewers").textContent=DATA.station?.viewers ?? 0;
  $("adminFollowers").textContent=DATA.station?.followers ?? 0;
  $("adminProgram").textContent=DATA.station?.activeProgram || "-";
}
function renderPrograms(){
  $("programEditor").innerHTML=(DATA.programs||[]).map((p,i)=>`<div class="editorCard"><h3>${p.icon||"📺"} ${p.title||"Program"}</h3><input data-p="${i}" data-k="title" value="${esc(p.title)}"><input data-p="${i}" data-k="day" value="${esc(p.day)}"><input data-p="${i}" data-k="time" value="${esc(p.time)}"><textarea data-p="${i}" data-k="description">${esc(p.description)}</textarea><input data-p="${i}" data-k="musicFocus" value="${esc(p.musicFocus)}"></div>`).join("");
  document.querySelectorAll("[data-p]").forEach(el=>el.addEventListener("input",e=>{DATA.programs[e.target.dataset.p][e.target.dataset.k]=e.target.value;buildJson();}));
}
function renderChart(){
  $("chartEditor").innerHTML=(DATA.chart||[]).map((t,i)=>`<div class="chartEditRow"><b>${t.pos||i+1}</b><input data-c="${i}" data-k="artist" value="${esc(t.artist)}"><input data-c="${i}" data-k="title" value="${esc(t.title)}"><input data-c="${i}" data-k="genre" value="${esc(t.genre)}"></div>`).join("");
  document.querySelectorAll("[data-c]").forEach(el=>el.addEventListener("input",e=>{DATA.chart[e.target.dataset.c][e.target.dataset.k]=e.target.value;buildJson();}));
}
function renderRequests(){
  const all=JSON.parse(localStorage.getItem("djf_requests")||"[]");
  $("adminRequests").innerHTML=all.length?all.map((r,i)=>`<div class="requestItem"><button onclick="markPlayed(${i})">Played</button><b>${esc(r.song)}</b><br><small>${esc(r.name)} · ${esc(r.show)} · ${esc(r.when)}</small></div>`).join(""):"<p class='muted'>Ingen lokale requests.</p>";
}
function markPlayed(i){const all=JSON.parse(localStorage.getItem("djf_requests")||"[]");all.splice(i,1);localStorage.setItem("djf_requests",JSON.stringify(all));renderRequests();}
function buildJson(){DATA.version="V601-FINAL";$("jsonOutput").value=JSON.stringify(DATA,null,2);}
function getSettings(){return{workerUrl:($("workerUrl").value.trim()||DEFAULT_WORKER_URL),password:$("adminPassword").value,path:$("repoPath").value.trim()||"assets/data/cms.json",branch:$("branch").value.trim()||"main"};}
function loadSettings(){const s=JSON.parse(localStorage.getItem("djf_cms_save_settings")||"{}");$("workerUrl").value=s.workerUrl||DEFAULT_WORKER_URL;$("repoPath").value=s.path||"assets/data/cms.json";$("branch").value=s.branch||"main";}
function saveSettings(){const s=getSettings();localStorage.setItem("djf_cms_save_settings",JSON.stringify({workerUrl:s.workerUrl,path:s.path,branch:s.branch}));saveStatus("Indstillinger gemt lokalt. Password gemmes ikke.","ok");}
async function loadFromGithub(){
  const s=getSettings(); if(!s.workerUrl||!s.password)return saveStatus("Mangler Worker URL eller password.","error");
  saveStatus("Henter fra GitHub...");
  try{const url=new URL(s.workerUrl);url.searchParams.set("path",s.path);url.searchParams.set("branch",s.branch);const res=await fetch(url.toString(),{headers:{"x-cms-password":s.password}});const json=await res.json();if(!res.ok)throw new Error(json.error||"Kunne ikke hente data");DATA=json.content;renderDashboard();renderPrograms();renderChart();renderRequests();buildJson();saveStatus("OK: Data hentet fra GitHub.","ok");}
  catch(e){saveStatus("Fejl ved Hent fra GitHub: "+e.message,"error");}
}
async function saveToGithub(){
  const s=getSettings(); if(!s.workerUrl||!s.password)return saveStatus("Mangler Worker URL eller password.","error");
  buildJson(); saveStatus("Gemmer direkte til GitHub...");
  try{const res=await fetch(s.workerUrl,{method:"POST",headers:{"content-type":"application/json","x-cms-password":s.password},body:JSON.stringify({path:s.path,branch:s.branch,content:DATA,message:"CMS update from DJ FOLSOE Broadcast CMS V601 FINAL"})});const json=await res.json();if(!res.ok)throw new Error(json.error||"Gemning fejlede");saveStatus("GEMT: GitHub er opdateret. Commit: "+(json.commitSha||"OK")+". Vent 30-90 sek.","ok");}
  catch(e){saveStatus("Fejl ved Gem direkte til GitHub: "+e.message,"error");}
}
function esc(v){return String(v??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[s]||s));}
$("clearRequests").onclick=()=>{localStorage.removeItem("djf_requests");renderRequests();};
$("buildJson").onclick=buildJson;
$("copyJson").onclick=async()=>{await navigator.clipboard.writeText($("jsonOutput").value);alert("JSON kopieret");};
$("saveSettings").onclick=saveSettings;
$("loadFromGithub").onclick=loadFromGithub;
$("saveToGithub").onclick=saveToGithub;
document.addEventListener("DOMContentLoaded",boot);
