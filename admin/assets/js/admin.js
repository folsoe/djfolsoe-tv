let DATA;
let EDIT_LANG = "da";
const $ = id => document.getElementById(id);
const DEFAULT_WORKER_URL = "https://djfolsoe-cms-save.sunefolsoe.workers.dev";

async function boot(){
  const r = await fetch("../assets/data/cms.json?cb=" + Date.now());
  DATA = await r.json();
  ensureDataShape();
  loadSettings();
  renderDashboard();
  renderPrograms();
  renderChart();
  renderRequests();
  buildJson();
  saveStatus("V700.2 klar. Programmer, hitliste og requests kan nu redigeres og gemmes til GitHub.", "ok");
}

function ensureDataShape(){
  DATA.version = "V700.2";
  DATA.requests = DATA.requests || [];
  DATA.programs = DATA.programs || [];
  DATA.chart = DATA.chart || [];
  DATA.station = DATA.station || {};
  for (const p of DATA.programs) {
    p.i18n = p.i18n || {};
    for (const lang of ["da","en","de"]) {
      p.i18n[lang] = p.i18n[lang] || {
        title: p.title || "Program",
        type: p.type || "Program",
        description: p.description || "",
        musicFocus: p.musicFocus || ""
      };
    }
  }
}

function saveStatus(msg, type=""){
  const el = $("saveStatus");
  if(el){ el.className = "statusBox " + type; el.textContent = msg; }
}

function esc(v){
  return String(v ?? "").replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[s]));
}

function renderDashboard(){
  $("adminLive").textContent = DATA.station.live ? "LIVE" : "OFFLINE";
  $("adminViewers").textContent = DATA.station.viewers ?? 0;
  $("adminFollowers").textContent = DATA.station.followers ?? 0;
  $("adminProgram").textContent = DATA.station.activeProgram || "-";
}

function renderPrograms(){
  const langBar = `
    <div class="adminLangBar">
      <button type="button" data-edit-lang="da" class="${EDIT_LANG==="da"?"active":""}">DA</button>
      <button type="button" data-edit-lang="en" class="${EDIT_LANG==="en"?"active":""}">EN</button>
      <button type="button" data-edit-lang="de" class="${EDIT_LANG==="de"?"active":""}">DE</button>
      <span>Rediger programtekster på valgt sprog</span>
    </div>`;
  $("programEditor").innerHTML = langBar + DATA.programs.map((p,i)=>{
    const x = p.i18n?.[EDIT_LANG] || p.i18n?.da || {};
    return `<div class="editorCard">
      <h3>${p.icon || "📺"} ${esc(x.title || "Program")}</h3>
      <label>Titel<input data-p="${i}" data-k="title" value="${esc(x.title)}"></label>
      <label>Programtype<input data-p="${i}" data-k="type" value="${esc(x.type)}"></label>
      <label>Dag<input data-pbase="${i}" data-k="day" value="${esc(p.day)}"></label>
      <label>Tid<input data-pbase="${i}" data-k="time" value="${esc(p.time)}"></label>
      <label>Varighed minutter<input data-pbase="${i}" data-k="duration" type="number" value="${esc(p.duration || 120)}"></label>
      <label>Beskrivelse<textarea data-p="${i}" data-k="description">${esc(x.description)}</textarea></label>
      <label>Musikfokus<input data-p="${i}" data-k="musicFocus" value="${esc(x.musicFocus)}"></label>
    </div>`;
  }).join("");

  document.querySelectorAll("[data-edit-lang]").forEach(btn => btn.onclick = () => {
    EDIT_LANG = btn.dataset.editLang;
    renderPrograms();
  });

  document.querySelectorAll("[data-p]").forEach(el => el.addEventListener("input", e => {
    const p = DATA.programs[e.target.dataset.p];
    p.i18n = p.i18n || {};
    p.i18n[EDIT_LANG] = p.i18n[EDIT_LANG] || {};
    p.i18n[EDIT_LANG][e.target.dataset.k] = e.target.value;
    buildJson();
  }));

  document.querySelectorAll("[data-pbase]").forEach(el => el.addEventListener("input", e => {
    const p = DATA.programs[e.target.dataset.pbase];
    let val = e.target.value;
    if(e.target.dataset.k === "duration") val = Number(val || 120);
    p[e.target.dataset.k] = val;
    buildJson();
  }));
}

function renderChart(){
  $("chartEditor").innerHTML = `
    <button type="button" id="addChartRow" class="adminBtn">Tilføj sang</button>
    <div class="chartHeader">Pos · Artist · Titel · Genre · Status</div>
    ${DATA.chart.map((t,i)=>`
      <div class="chartEditRow">
        <input data-c="${i}" data-k="pos" type="number" value="${esc(t.pos || i+1)}">
        <input data-c="${i}" data-k="artist" value="${esc(t.artist)}" placeholder="Artist">
        <input data-c="${i}" data-k="title" value="${esc(t.title)}" placeholder="Titel">
        <input data-c="${i}" data-k="genre" value="${esc(t.genre)}" placeholder="Genre">
        <input data-c="${i}" data-k="status" value="${esc(t.status)}" placeholder="Status">
        <button type="button" data-del-chart="${i}">Slet</button>
      </div>`).join("")}`;

  $("addChartRow").onclick = () => {
    DATA.chart.push({pos: DATA.chart.length+1, artist:"", title:"", genre:"", status:""});
    renderChart(); buildJson();
  };

  document.querySelectorAll("[data-c]").forEach(el => el.addEventListener("input", e => {
    const row = DATA.chart[e.target.dataset.c];
    let val = e.target.value;
    if(e.target.dataset.k === "pos") val = Number(val || 0);
    row[e.target.dataset.k] = val;
    buildJson();
  }));

  document.querySelectorAll("[data-del-chart]").forEach(btn => btn.onclick = () => {
    DATA.chart.splice(Number(btn.dataset.delChart),1);
    DATA.chart.forEach((x,i)=>x.pos=i+1);
    renderChart(); buildJson();
  });
}

function renderRequests(){
  const local = JSON.parse(localStorage.getItem("djf_requests") || "[]");
  const all = [...(DATA.requests || []), ...local];
  $("adminRequests").innerHTML = `
    <form id="manualRequestForm" class="manualRequestForm">
      <input id="manualName" placeholder="Twitch navn">
      <input id="manualSong" placeholder="Artist - Song">
      <input id="manualShow" placeholder="Show">
      <input id="manualWhen" placeholder="Hvornår">
      <button type="submit" class="adminBtn">Gem ønske i CMS</button>
    </form>
    <div class="requestTools">
      <button type="button" id="importLocalRequests" class="adminBtn">Importer lokale ønsker til CMS</button>
      <button type="button" id="clearRequests" class="adminBtn alt">Ryd lokale requests</button>
    </div>
    ${all.length ? all.map((r,i)=>`
      <div class="requestItem">
        <button type="button" data-played="${i}">Played</button>
        <b>${esc(r.song)}</b><br>
        <small>${esc(r.name)} · ${esc(r.show)} · ${esc(r.when || "Next show")}</small>
      </div>`).join("") : "<p class='muted'>Ingen requests endnu.</p>"}`;

  $("manualRequestForm").onsubmit = e => {
    e.preventDefault();
    DATA.requests.unshift({
      name: $("manualName").value || "Viewer",
      song: $("manualSong").value || "Artist - Song",
      show: $("manualShow").value || "Show",
      when: $("manualWhen").value || "Next show",
      status: "new",
      createdAt: new Date().toISOString()
    });
    renderRequests(); buildJson();
  };

  $("importLocalRequests").onclick = () => {
    const local = JSON.parse(localStorage.getItem("djf_requests") || "[]");
    DATA.requests = [...local, ...(DATA.requests || [])];
    localStorage.removeItem("djf_requests");
    renderRequests(); buildJson();
  };

  const clearBtn = $("clearRequests");
  if(clearBtn) clearBtn.onclick = () => {
    localStorage.removeItem("djf_requests");
    renderRequests();
  };

  document.querySelectorAll("[data-played]").forEach(btn => btn.onclick = () => {
    const idx = Number(btn.dataset.played);
    if(idx < (DATA.requests || []).length){
      DATA.requests.splice(idx,1);
    } else {
      const local = JSON.parse(localStorage.getItem("djf_requests") || "[]");
      local.splice(idx - (DATA.requests || []).length, 1);
      localStorage.setItem("djf_requests", JSON.stringify(local));
    }
    renderRequests(); buildJson();
  });
}

function buildJson(){
  DATA.version = "V700.2";
  $("jsonOutput").value = JSON.stringify(DATA, null, 2);
}

function getSettings(){
  return {
    workerUrl: ($("workerUrl").value.trim() || DEFAULT_WORKER_URL),
    password: $("adminPassword").value,
    path: $("repoPath").value.trim() || "assets/data/cms.json",
    branch: $("branch").value.trim() || "main"
  };
}

const DEFAULT_WORKER_URL = "https://djfolsoe-cms-save.sunefolsoe.workers.dev";

function loadSettings(){
  const s = JSON.parse(localStorage.getItem("djf_cms_save_settings") || "{}");
  $("workerUrl").value = s.workerUrl || DEFAULT_WORKER_URL;
  $("repoPath").value = s.path || "assets/data/cms.json";
  $("branch").value = s.branch || "main";
}

function saveSettings(){
  const s = getSettings();
  localStorage.setItem("djf_cms_save_settings", JSON.stringify({workerUrl:s.workerUrl,path:s.path,branch:s.branch}));
  saveStatus("Indstillinger gemt lokalt. Password gemmes ikke.", "ok");
}

async function loadFromGithub(){
  const s = getSettings();
  if(!s.workerUrl || !s.password) return saveStatus("Mangler Worker URL eller password.", "error");
  saveStatus("Henter fra GitHub...");
  try{
    const url = new URL(s.workerUrl);
    url.searchParams.set("path", s.path);
    url.searchParams.set("branch", s.branch);
    const res = await fetch(url.toString(), {headers: {"x-cms-password": s.password}});
    const json = await res.json();
    if(!res.ok) throw new Error(json.error || "Kunne ikke hente data");
    DATA = json.content;
    ensureDataShape();
    renderDashboard(); renderPrograms(); renderChart(); renderRequests(); buildJson();
    saveStatus("OK: Data hentet fra GitHub.", "ok");
  }catch(e){ saveStatus("Fejl ved Hent fra GitHub: " + e.message, "error"); }
}

async function saveToGithub(){
  const s = getSettings();
  if(!s.workerUrl || !s.password) return saveStatus("Mangler Worker URL eller password.", "error");
  buildJson();
  saveStatus("Gemmer direkte til GitHub...");
  try{
    const res = await fetch(s.workerUrl, {
      method: "POST",
      headers: {"content-type":"application/json","x-cms-password":s.password},
      body: JSON.stringify({path:s.path, branch:s.branch, content:DATA, message:"CMS update from DJ FOLSOE Broadcast CMS V700.2"})
    });
    const json = await res.json();
    if(!res.ok) throw new Error(json.error || "Gemning fejlede");
    saveStatus("GEMT: GitHub er opdateret. Commit: " + (json.commitSha || "OK") + ". Vent 30-90 sek.", "ok");
  }catch(e){ saveStatus("Fejl ved Gem direkte til GitHub: " + e.message, "error"); }
}

document.addEventListener("DOMContentLoaded", boot);
document.addEventListener("click", e => {
  if(e.target?.id === "saveSettings") saveSettings();
  if(e.target?.id === "loadFromGithub") loadFromGithub();
  if(e.target?.id === "saveToGithub") saveToGithub();
  if(e.target?.id === "buildJson") buildJson();
  if(e.target?.id === "copyJson") navigator.clipboard.writeText($("jsonOutput").value).then(()=>alert("JSON kopieret"));
});
