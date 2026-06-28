const SHOW_SCHEDULE_API = "https://djfolsoe-tv-api.sunefolsoe.workers.dev/api/show-schedule";
let showScheduleItems = [];

function showScheduleStatus(msg){
  const s = document.getElementById("adminStatus") || document.getElementById("status");
  if(s) s.textContent = msg;
}

function showScheduleRow(item={}, i=0){
  return `<div class="scheduleRow" style="display:grid;grid-template-columns:1.2fr 1fr .8fr .7fr .7fr 1.6fr .45fr;gap:8px;margin:8px 0;align-items:start">
    <input placeholder="Titel" value="${String(item.title||"").replaceAll('"',"&quot;")}" data-schedule-field="title" data-i="${i}">
    <input placeholder="Show/tema" value="${String(item.show||"").replaceAll('"',"&quot;")}" data-schedule-field="show" data-i="${i}">
    <input type="date" value="${item.date||""}" data-schedule-field="date" data-i="${i}">
    <input type="time" value="${item.start||""}" data-schedule-field="start" data-i="${i}">
    <input type="time" value="${item.end||""}" data-schedule-field="end" data-i="${i}">
    <input placeholder="Beskrivelse" value="${String(item.description||"").replaceAll('"',"&quot;")}" data-schedule-field="description" data-i="${i}">
    <button type="button" onclick="removeShowScheduleRow(${i})">Slet</button>
  </div>`;
}

function renderShowScheduleAdmin(){
  const el = document.getElementById("showScheduleRows");
  if(!el) return;
  showScheduleItems = showScheduleItems.slice().sort((a,b)=>String((a.date||"")+(a.start||"")).localeCompare(String((b.date||"")+(b.start||""))));
  el.innerHTML = showScheduleItems.map(showScheduleRow).join("");
}

function collectShowScheduleAdmin(){
  document.querySelectorAll("[data-schedule-field]").forEach(input=>{
    const i = Number(input.dataset.i);
    const f = input.dataset.scheduleField;
    showScheduleItems[i] = showScheduleItems[i] || {};
    showScheduleItems[i][f] = input.value;
    showScheduleItems[i].active = true;
    showScheduleItems[i].priority = i + 1;
  });
}

async function loadShowScheduleAdmin(){
  try{
    const r = await fetch(SHOW_SCHEDULE_API + "?ts=" + Date.now(), {cache:"no-store"});
    const data = await r.json();
    showScheduleItems = Array.isArray(data.items) && data.items.length ? data.items : (Array.isArray(data.upcomingShows) ? data.upcomingShows : []);
    renderShowScheduleAdmin();
    showScheduleStatus("✅ Showplan hentet");
  }catch(e){
    showScheduleStatus("❌ Kunne ikke hente showplan: " + e.message);
  }
}

function addShowScheduleRow(){
  collectShowScheduleAdmin();
  showScheduleItems.push({title:"DJ FOLSOE LIVE",show:"",theme:"",date:"",start:"20:00",end:"23:00",description:"",active:true,priority:showScheduleItems.length+1});
  renderShowScheduleAdmin();
}

function removeShowScheduleRow(i){
  collectShowScheduleAdmin();
  showScheduleItems.splice(i,1);
  renderShowScheduleAdmin();
}

async function saveShowScheduleAdmin(){
  try{
    collectShowScheduleAdmin();
    const token = localStorage.getItem("DJF_ADMIN_TOKEN") || prompt("Admin token til Cloudflare Worker:");
    if(token) localStorage.setItem("DJF_ADMIN_TOKEN", token);
    const r = await fetch(SHOW_SCHEDULE_API, {
      method:"POST",
      headers:{"content-type":"application/json","x-admin-token":token||""},
      body:JSON.stringify({items:showScheduleItems})
    });
    const data = await r.json();
    if(!r.ok) throw new Error(data.error || r.status);
    showScheduleItems = data.items || showScheduleItems;
    renderShowScheduleAdmin();
    showScheduleStatus("✅ Showplan gemt");
  }catch(e){
    showScheduleStatus("❌ Kunne ikke gemme showplan: " + e.message);
  }
}

document.addEventListener("DOMContentLoaded",()=>setTimeout(loadShowScheduleAdmin,800));
