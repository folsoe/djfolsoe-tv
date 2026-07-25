
/* DJ FOLSOE V19500 · MUSIC CHART WEBSITE */
(function(){
"use strict";

const state={chart:[],week:"",errors:[]};
const $=id=>document.getElementById(id);
const clean=v=>String(v??"").trim();
const escapeHtml=v=>clean(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

function normalize(items){
  return (Array.isArray(items)?items:[]).filter(Boolean).map((item,index)=>{
    const rank=Number(item.rank||index+1);
    const previous=item.previousRank===null||item.previousRank===undefined||item.previousRank===""
      ? null:Number(item.previousRank);
    const movement=item.movement || (
      item.isNew || previous===null ? "new" :
      previous>rank ? "up" :
      previous<rank ? "down" : "same"
    );
    return {
      rank,
      previousRank:previous,
      movement,
      artist:clean(item.artist||"Unknown Artist"),
      title:clean(item.title||item.name||"Unknown Title"),
      weeks:Number(item.weeks||item.weeksOnChart||1),
      change:previous===null?null:previous-rank,
      status:clean(item.status||"")
    };
  }).sort((a,b)=>a.rank-b.rank).slice(0,20);
}

function label(item){
  if(item.movement==="new")return "NEW";
  if(item.movement==="up")return `▲ ${Math.abs(item.change||1)}`;
  if(item.movement==="down")return `▼ ${Math.abs(item.change||1)}`;
  return "—";
}

function trackName(item){return `${item.artist} — ${item.title}`}

function render(raw){
  const chart=normalize(raw?.top20||raw?.chart?.top20||raw?.homepage?.top20||[]);
  state.chart=chart;
  state.week=clean(raw?.chart?.week||raw?.top20Week||raw?.updatedAt?.slice?.(0,10)||"CURRENT WEEK");
  if(!$("musicChartList"))return;
  $("musicChartWeek").textContent=state.week||"CURRENT WEEK";

  if(!chart.length){
    $("musicChartList").innerHTML='<div class="musicChartTV__row"><strong class="musicChartTV__rank">—</strong><div class="musicChartTV__track"><strong>Chart data appears automatically</strong><span>Update Top 20 from admin</span></div><div class="musicChartTV__change">—</div></div>';
    return;
  }

  const first=chart[0];
  $("musicChartNumberOne").textContent=first.title;
  $("musicChartNumberOneArtist").textContent=first.artist;
  $("musicChartNumberOneChange").textContent=label(first);
  $("musicChartNumberOneWeeks").textContent=`${first.weeks} ${first.weeks===1?"week":"weeks"}`;

  const highestNew=chart.filter(i=>i.movement==="new").sort((a,b)=>a.rank-b.rank)[0];
  const climber=chart.filter(i=>i.change>0).sort((a,b)=>b.change-a.change)[0];
  const fall=chart.filter(i=>i.change<0).sort((a,b)=>a.change-b.change)[0];

  $("musicChartHighestNew").textContent=highestNew?trackName(highestNew):"No new entry";
  $("musicChartHighestNewMeta").textContent=highestNew?`New at number ${highestNew.rank}`:"No new entries this week";
  $("musicChartClimber").textContent=climber?trackName(climber):"No climber";
  $("musicChartClimberMeta").textContent=climber?`Up ${climber.change} places to number ${climber.rank}`:"No upward movement";
  $("musicChartFall").textContent=fall?trackName(fall):"No fall";
  $("musicChartFallMeta").textContent=fall?`Down ${Math.abs(fall.change)} places to number ${fall.rank}`:"No downward movement";

  $("musicChartList").innerHTML=chart.map(item=>`
    <article class="musicChartTV__row">
      <strong class="musicChartTV__rank">#${item.rank}</strong>
      <div class="musicChartTV__track">
        <strong>${escapeHtml(item.artist)} — ${escapeHtml(item.title)}</strong>
        <span>${item.previousRank===null?"New entry":`Last week #${item.previousRank}`}</span>
      </div>
      <div class="musicChartTV__change" data-change="${escapeHtml(item.movement)}">${label(item)}</div>
      <div class="musicChartTV__weeks">${item.weeks} ${item.weeks===1?"week":"weeks"}</div>
    </article>
  `).join("");
}

window.addEventListener("djf:broadcast-core",event=>render(event.detail||{}));
document.addEventListener("DOMContentLoaded",()=>{
  if(window.__DJF_CORE__)render(window.__DJF_CORE__);
});

window.DJF_MUSIC_CHART_SITE=Object.freeze({
  version:"V19500",render,
  getStatus:()=>({chart:state.chart.slice(),week:state.week,errors:state.errors.slice()})
});
})();
