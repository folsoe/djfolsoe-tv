/* DJ FOLSOE V26410 — Living Chart & Retro History Engine */
(() => {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function movement(song){
    const status=(song.status||"").toLowerCase();
    if(status==="new") return {label:"NEW", cls:"v26410-new"};
    if(status==="re-entry" || status==="reentry") return {label:"RE", cls:"v26410-re"};
    const last=Number(song.last_week);
    const now=Number(song.rank);
    if(!Number.isFinite(last) || !Number.isFinite(now)) return {label:"—", cls:"v26410-same"};
    if(last>now) return {label:`↑ ${last-now}`, cls:"v26410-up"};
    if(last<now) return {label:`↓ ${now-last}`, cls:"v26410-down"};
    return {label:"●", cls:"v26410-same"};
  }

  function row(song, retro=false){
    const mv=movement(song);
    const year=retro && song.year ? ` · ${esc(song.year)}` : "";
    const title = `${esc(song.artist)} — ${esc(song.title)}`;
    const clickable = song.tidal_url
      ? `<a href="${esc(song.tidal_url)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">${title}</a>`
      : title;
    return `<div class="v26410-row">
      <div class="v26410-rank">${String(song.rank).padStart(2,"0")}</div>
      <div class="v26410-song"><strong>${clickable}</strong><small>${year || "DJ FOLSOE chart"}</small></div>
      <div class="v26410-move ${mv.cls}"><span class="v26410-status">${mv.label}</span></div>
      <div class="v26410-stat peak"><small>PEAK</small><b>${song.peak ?? "—"}</b></div>
      <div class="v26410-stat weeks"><small>WEEKS</small><b>${song.weeks ?? "—"}</b></div>
    </div>`;
  }

  async function loadJson(url){
    const r=await fetch(url,{cache:"no-store"});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  async function init(){
    try{
      const data=await loadJson("/data/charts.json");
      const top=document.getElementById("top20");
      const retro=document.getElementById("retro10");
      if(top) top.innerHTML=(data.top20||[]).map(x=>row(x,false)).join("");
      if(retro) retro.innerHTML=(data.retro_top10||[]).map(x=>row(x,true)).join("");

      document.querySelectorAll("[data-chart-week]").forEach(x=>x.textContent=data.chart_week||"CURRENT WEEK");
      document.querySelectorAll("[data-chart-date]").forEach(x=>x.textContent=data.published_date||"");

      const p=document.getElementById("tidalPlaylists");
      if(p){
        p.innerHTML=(data.tidal_playlists||[]).map(v=>v.url
          ? `<a class="v26400-playlist" href="${esc(v.url)}" target="_blank" rel="noopener"><strong>${esc(v.title)}</strong><small>${esc(v.description)} · OPEN IN TIDAL ↗</small></a>`
          : `<div class="v26400-playlist" data-empty="true"><strong>${esc(v.title)}</strong><small>${esc(v.description)}</small></div>`
        ).join("");
      }
    }catch(e){
      document.querySelectorAll("#top20,#retro10").forEach(x=>x.innerHTML='<div class="v26410-empty">Chart data is temporarily unavailable.</div>');
    }

    try{
      const archive=await loadJson("/data/chart-archive/index.json");
      const box=document.getElementById("chartArchiveList");
      if(box){
        box.innerHTML=(archive.weeks||[]).map(w=>`<a class="v26410-archiveLink" href="/charts/archive/?week=${encodeURIComponent(w.week)}"><div><strong>${esc(w.label)}</strong><span>${esc(w.date)}</span></div><b>OPEN →</b></a>`).join("");
      }
    }catch(_){}
  }
  init();
})();
