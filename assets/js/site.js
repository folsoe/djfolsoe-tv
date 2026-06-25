let DATA, currentProgram, ticker=0, LANG="da";
const $ = id => document.getElementById(id);
const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

async function boot(){
  LANG = localStorage.getItem("djf_lang") || "da";
  const res = await fetch("assets/data/cms.json?cb=" + Date.now());
  DATA = await res.json();
  currentProgram = findCurrentOrNext();
  setupLanguageButtons();
  translatePage();
  applyProgram(currentProgram.program, currentProgram.isLive);
  renderPrograms();
  renderRequests();
  renderChart();
  renderNews();
  setupRequestForm();
  setInterval(updateTicker, 3500);
}

function tr(key){ return DATA.ui?.[LANG]?.[key] || DATA.ui?.da?.[key] || key; }
function ptxt(p,key){ return p.i18n?.[LANG]?.[key] || p.i18n?.da?.[key] || p[key] || ""; }
function stxt(key){ return DATA.station?.i18n?.[LANG]?.[key] || DATA.station?.i18n?.da?.[key] || DATA.station?.[key] || ""; }

function setupLanguageButtons(){
  document.querySelectorAll("[data-lang]").forEach(btn => {
    btn.addEventListener("click", () => {
      LANG = btn.dataset.lang;
      localStorage.setItem("djf_lang", LANG);
      translatePage();
      applyProgram(currentProgram.program, currentProgram.isLive);
      renderPrograms();
      renderRequests();
      renderNews();
    });
  });
}

function translatePage(){
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = tr(el.dataset.i18n));
  $("reqName").placeholder = tr("namePlaceholder");
  $("reqSong").placeholder = tr("songPlaceholder");
  document.querySelectorAll("[data-lang]").forEach(btn => btn.classList.toggle("active", btn.dataset.lang === LANG));
}

function rgb(hex){
  hex = String(hex || "#ffd166").replace("#","");
  const n = parseInt(hex,16);
  return `${(n>>16)&255},${(n>>8)&255},${n&255}`;
}

function nextDateFor(day,time){
  const now = new Date();
  const target = days.indexOf(day);
  let d = new Date(now);
  d.setDate(now.getDate() + ((target - now.getDay() + 7) % 7));
  const [h,m] = String(time || "20:00").split(":").map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  if(d < now) d.setDate(d.getDate()+7);
  return d;
}

function findCurrentOrNext(){
  const now = new Date();
  for(const p of DATA.programs || []){
    const start = nextDateFor(p.day,p.time);
    if(start > now) start.setDate(start.getDate()-7);
    const end = new Date(start.getTime() + (p.duration || 120) * 60000);
    if(now >= start && now <= end) return {program:p,isLive:true,nextDate:start};
  }
  return (DATA.programs || []).map(p => ({program:p,isLive:false,nextDate:nextDateFor(p.day,p.time)})).sort((a,b)=>a.nextDate-b.nextDate)[0] || {program:{},isLive:false,nextDate:new Date()};
}

function applyProgram(p,isLive){
  document.documentElement.style.setProperty("--a", p.colorA || "#ffd166");
  document.documentElement.style.setProperty("--b", p.colorB || "#00d4ff");
  document.documentElement.style.setProperty("--rgb", rgb(p.colorA || "#ffd166"));
  $("heroTitle").textContent = isLive ? `${tr("liveNow")} · ${ptxt(p,"title")}` : `${tr("next")} · ${ptxt(p,"title")}`;
  $("heroDesc").textContent = stxt("description");
  $("liveStatus").textContent = isLive ? tr("liveNow") : tr("offline");
  $("viewers").textContent = DATA.station?.viewers ?? 0;
  $("nowNext").textContent = isLive ? tr("liveNow") : tr("next");
  $("programIcon").textContent = p.icon || "📺";
  $("programTitle").textContent = ptxt(p,"title");
  $("programDesc").textContent = ptxt(p,"description");
  $("tickerBadge").textContent = ptxt(p,"type").toUpperCase();
  $("nextTitle").textContent = ptxt(p,"title");
  $("nextTime").textContent = currentProgram.nextDate.toLocaleString(LANG==="da"?"da-DK":LANG==="de"?"de-DE":"en-US",{weekday:"long",day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
  $("nextType").textContent = ptxt(p,"type");
  $("nextFocus").textContent = ptxt(p,"musicFocus");
  $("nextDescription").textContent = ptxt(p,"description");
}

function renderPrograms(){
  $("programGrid").innerHTML = (DATA.programs || []).map(p => `<article class="programCard" style="--pa:${p.colorA};--pb:${p.colorB}"><div style="font-size:34px">${p.icon||"📺"}</div><b>${ptxt(p,"title")}</b><p>${p.day} · ${p.time}</p><p>${ptxt(p,"description")}</p><small>${ptxt(p,"musicFocus")}</small></article>`).join("");
  $("reqShow").innerHTML = (DATA.programs || []).map(p => `<option value="${ptxt(p,"title")}">${ptxt(p,"title")}</option>`).join("");
}

function renderChart(){
  $("chartList").innerHTML = (DATA.chart || []).map(t => `<div class="chartRow"><div class="pos">${t.pos}</div><div><b>${t.artist} - ${t.title}</b><br><small>${t.status||""}</small></div><div>${t.genre||""}</div></div>`).join("");
}

function newsLines(){
  const key = currentProgram.program.id;
  return DATA.newsI18n?.[key]?.[LANG] || DATA.newsI18n?.[key]?.da || [];
}

function renderNews(){
  const arr = newsLines();
  $("newsGrid").innerHTML = arr.map((n,i) => `<article class="newsItem"><b>${i ? "PROGRAM RADAR" : "TOP STORY"}</b><p>${n}</p></article>`).join("");
}

function updateTicker(){
  const arr = newsLines();
  $("tickerText").textContent = (arr.length ? arr : ["DJ FOLSOE TV · Music Television From Denmark"])[ticker++ % (arr.length || 1)];
}

function setupRequestForm(){
  $("requestForm").addEventListener("submit", e => {
    e.preventDefault();
    const item = {name:$("reqName").value||"Viewer", song:$("reqSong").value||"Artist - Song", show:$("reqShow").value, when:$("reqWhen").value||tr("next"), lang:LANG};
    const all = JSON.parse(localStorage.getItem("djf_requests") || "[]");
    all.unshift(item);
    localStorage.setItem("djf_requests", JSON.stringify(all.slice(0,30)));
    e.target.reset();
    translatePage();
    renderRequests();
  });
}

function renderRequests(){
  const all = JSON.parse(localStorage.getItem("djf_requests") || "[]");
  $("requestOutput").innerHTML = all.length ? all.map(r => `<div class="requestItem"><b>${r.song}</b><br><small>${r.name} · ${r.show} · ${r.when}</small></div>`).join("") : `<p class="muted">${tr("noRequests")}</p>`;
}

document.addEventListener("DOMContentLoaded", boot);
