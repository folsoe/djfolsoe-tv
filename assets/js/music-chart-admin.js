
/* DJ FOLSOE V19500 · MUSIC CHART ADMIN */
(function(){
"use strict";

const state={entries:[],week:"",sourceNote:"",loadedCore:null};
const $=id=>document.getElementById(id);
const clean=v=>String(v??"").trim();
const number=v=>Number(v);

function defaultEntries(){
  return Array.from({length:20},(_,i)=>({
    rank:i+1,artist:"",title:"",previousRank:null,weeks:1,movement:"new",status:""
  }));
}

function normalize(items){
  const source=Array.isArray(items)?items:[];
  const rows=source.map((item,index)=>({
    rank:Number(item.rank||index+1),
    artist:clean(item.artist),
    title:clean(item.title||item.name),
    previousRank:item.previousRank===null||item.previousRank===undefined||item.previousRank===""?null:Number(item.previousRank),
    weeks:Number(item.weeks||item.weeksOnChart||1),
    movement:clean(item.movement||""),
    status:clean(item.status||"")
  }));
  while(rows.length<20)rows.push({rank:rows.length+1,artist:"",title:"",previousRank:null,weeks:1,movement:"new",status:""});
  return rows.slice(0,20).map((row,index)=>({...row,rank:index+1}));
}

function calculateMovement(entry){
  if(entry.previousRank===null||!Number.isFinite(entry.previousRank))return "new";
  if(entry.previousRank>entry.rank)return "up";
  if(entry.previousRank<entry.rank)return "down";
  return "same";
}

function movementLabel(entry){
  const change=entry.previousRank===null?null:entry.previousRank-entry.rank;
  if(entry.movement==="new")return "NEW";
  if(entry.movement==="up")return `▲ ${Math.abs(change||1)}`;
  if(entry.movement==="down")return `▼ ${Math.abs(change||1)}`;
  return "—";
}

function readRows(){
  state.entries=[...document.querySelectorAll("[data-chart-row]")].map(row=>{
    const rank=Number(row.dataset.chartRow);
    const previousRaw=row.querySelector("[data-chart-previous]")?.value;
    const entry={
      rank,
      artist:clean(row.querySelector("[data-chart-artist]")?.value),
      title:clean(row.querySelector("[data-chart-title]")?.value),
      previousRank:previousRaw===""?null:Number(previousRaw),
      weeks:Number(row.querySelector("[data-chart-weeks]")?.value||1),
      movement:clean(row.querySelector("[data-chart-movement]")?.value),
      status:""
    };
    entry.movement=entry.movement||calculateMovement(entry);
    return entry;
  });
  return state.entries;
}

function render(){
  const wrap=$("chartEditorList");
  if(!wrap)return;
  wrap.innerHTML=state.entries.map(entry=>`
    <div class="chartAdmin__row" data-chart-row="${entry.rank}">
      <strong>#${entry.rank}</strong>
      <input data-chart-artist placeholder="Artist" value="${entry.artist.replace(/"/g,"&quot;")}">
      <input data-chart-title placeholder="Title" value="${entry.title.replace(/"/g,"&quot;")}">
      <input data-chart-previous type="number" min="1" max="100" placeholder="LW" value="${entry.previousRank??""}">
      <input data-chart-weeks type="number" min="1" max="999" value="${entry.weeks||1}">
      <select data-chart-movement>
        <option value="new" ${entry.movement==="new"?"selected":""}>NEW</option>
        <option value="up" ${entry.movement==="up"?"selected":""}>UP</option>
        <option value="same" ${entry.movement==="same"?"selected":""}>SAME</option>
        <option value="down" ${entry.movement==="down"?"selected":""}>DOWN</option>
      </select>
      <button type="button" data-chart-clear>×</button>
    </div>
  `).join("");

  wrap.querySelectorAll("input,select").forEach(el=>el.addEventListener("input",preview));
  wrap.querySelectorAll("[data-chart-clear]").forEach(btn=>btn.addEventListener("click",()=>{
    const row=btn.closest("[data-chart-row]");
    row.querySelectorAll("input").forEach(input=>input.value=input.hasAttribute("data-chart-weeks")?"1":"");
    row.querySelector("[data-chart-movement]").value="new";
    preview();
  }));
  preview();
}

function preview(){
  readRows();
  const first=state.entries[0];
  $("chartPreviewNumberOne").textContent=first.artist||first.title?`${first.artist} — ${first.title}`:"No number one entered";
  $("chartPreviewMeta").textContent=`${movementLabel(first)} · ${first.weeks||1} ${first.weeks===1?"week":"weeks"} on chart`;
  $("chartDiagnostics").textContent=JSON.stringify(buildChart(),null,2);
}

function buildChart(){
  readRows();
  state.week=clean($("chartWeekLabel")?.value);
  state.sourceNote=clean($("chartSourceNote")?.value);
  const count=Number($("chartDisplayCount")?.value||20);
  return {
    week:state.week,
    sourceNote:state.sourceNote,
    displayCount:count,
    updatedAt:new Date().toISOString(),
    top20:state.entries.filter(e=>e.artist||e.title).slice(0,20)
  };
}

function hydrate(core){
  state.loadedCore=core||{};
  state.entries=normalize(core?.top20);
  const chart=core?.chart||{};
  $("chartWeekLabel").value=chart.week||core?.top20Week||"";
  $("chartSourceNote").value=chart.sourceNote||"Danish airplay, BBC Radio 1 and international chart signals";
  $("chartDisplayCount").value=String(chart.displayCount||20);
  render();
}

function recalculate(){
  readRows();
  state.entries=state.entries.map(entry=>({...entry,movement:calculateMovement(entry)}));
  render();
}

function previewNumberOne(){
  const chart=buildChart();
  const first=chart.top20[0];
  if(!first)return;
  window.dispatchEvent(new CustomEvent("djf:generate-graphic",{detail:{
    type:"chart",
    position:1,
    kicker:"THIS WEEK'S NUMBER ONE",
    title:`${first.artist} — ${first.title}`,
    body:`${movementLabel(first)} · ${first.weeks} ${first.weeks===1?"week":"weeks"} on chart`,
    badge:"NUMBER 1",
    icon:"★",
    duration:12000
  }}));
}

async function publish(){
  if(typeof window.djfOneClick!=="function"){
    $("chartDiagnostics").textContent="One Click Publish is unavailable.";
    return false;
  }
  $("chartDiagnostics").textContent="Publishing Top 20…";
  try{
    await window.djfOneClick();
    $("chartDiagnostics").textContent=JSON.stringify({published:true,chart:buildChart()},null,2);
    return true;
  }catch(error){
    $("chartDiagnostics").textContent=JSON.stringify({published:false,error:String(error?.message||error)},null,2);
    return false;
  }
}

document.addEventListener("DOMContentLoaded",()=>{
  state.entries=defaultEntries();
  render();

  const original=window.buildPayload;
  if(typeof original==="function"){
    window.buildPayload=function(){
      const payload=original();
      const chart=buildChart();
      payload.top20=chart.top20;
      payload.chart={
        ...(payload.chart||{}),
        week:chart.week,
        sourceNote:chart.sourceNote,
        displayCount:chart.displayCount,
        updatedAt:chart.updatedAt
      };
      return payload;
    };
  }

  $("chartLoadBtn")?.addEventListener("click",()=>hydrate(window.__DJF_ADMIN_CORE__||state.loadedCore||{}));
  $("chartRecalculateBtn")?.addEventListener("click",recalculate);
  $("chartNumberOneBtn")?.addEventListener("click",previewNumberOne);
  $("chartPublishBtn")?.addEventListener("click",publish);
  $("chartWeekLabel")?.addEventListener("input",preview);
  $("chartSourceNote")?.addEventListener("input",preview);
  $("chartDisplayCount")?.addEventListener("change",preview);
  window.addEventListener("djf:admin-core-loaded",event=>hydrate(event.detail||{}));
});

window.DJF_MUSIC_CHART_ADMIN=Object.freeze({
  version:"V19500",buildChart,hydrate,recalculate,previewNumberOne,publish,
  getStatus:()=>({version:"V19500",entries:state.entries.slice(),week:state.week})
});
})();
