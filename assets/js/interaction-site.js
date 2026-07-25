
/* DJ FOLSOE V19400 · WEBSITE INTERACTION */
(function(){
"use strict";

const API_BASE="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
const state={active:null,lastCore:null,voted:new Set(),errors:[]};
const $=id=>document.getElementById(id);
const clean=v=>String(v??"").trim();
const escapeHtml=v=>clean(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

function normalize(raw){
  const active=raw?.interactive?.active||raw?.active||null;
  if(!active||active.enabled===false||active.state==="inactive")return null;
  const options=Array.isArray(active.options)?active.options:[];
  return {
    id:clean(active.id||"interaction"),
    type:clean(active.type||"poll").toLowerCase(),
    state:clean(active.state||"open").toLowerCase(),
    question:clean(active.question||active.title||"Join the show"),
    description:clean(active.description||active.body||"Vote now"),
    options:options.map((o,i)=>({
      id:clean(o.id||String.fromCharCode(65+i)),
      label:clean(o.label||o.title||o.text||`Option ${i+1}`),
      votes:Number(o.votes||0)
    })),
    totalVotes:Number(active.totalVotes||options.reduce((s,o)=>s+Number(o.votes||0),0)),
    result:active.result||null,
    updatedAt:active.updatedAt||raw?.updatedAt||null
  };
}

function resultText(active){
  if(active.result?.label)return active.result.label;
  const sorted=[...active.options].sort((a,b)=>b.votes-a.votes);
  if(!sorted.length)return "Results update automatically.";
  if(!active.totalVotes)return "Be the first to vote.";
  return `${sorted[0].label} is currently leading`;
}

function render(raw){
  state.lastCore=raw;
  const active=normalize(raw);
  state.active=active;
  const section=$("interactive");
  if(!section)return;

  if(!active){
    section.dataset.interactiveState="inactive";
    $("interactiveStatus").textContent="WAITING FOR NEXT MODULE";
    $("interactiveTypeLabel").textContent="COMMUNITY";
    $("interactiveQuestion").textContent="The next interactive module appears here.";
    $("interactiveDescription").textContent="Vote, rate, play and help shape the live show.";
    $("interactiveOptions").innerHTML='<div class="interactiveBroadcast__empty">No active poll, quiz or battle.</div>';
    $("interactiveVoteCount").textContent="0 votes";
    $("interactiveResultText").textContent="Results update automatically.";
    return;
  }

  section.dataset.interactiveState=active.state;
  $("interactiveStatus").textContent=active.state==="closed"?"RESULT":"VOTING OPEN";
  $("interactiveTypeLabel").textContent=active.type.toUpperCase();
  $("interactiveQuestion").textContent=active.question;
  $("interactiveDescription").textContent=active.description;
  $("interactiveVoteCount").textContent=`${active.totalVotes} ${active.totalVotes===1?"vote":"votes"}`;
  $("interactiveResultText").textContent=resultText(active);

  const hasVoted=localStorage.getItem(`djf-vote-${active.id}`)==="1";
  $("interactiveOptions").innerHTML=active.options.map((option,index)=>{
    const pct=active.totalVotes?Math.round((option.votes/active.totalVotes)*100):0;
    return `<button class="interactiveBroadcast__option" data-vote-option="${escapeHtml(option.id)}"
      style="--vote-width:${pct}%" ${hasVoted||active.state!=="open"?"disabled":""}>
      <b>${String.fromCharCode(65+index)}</b>
      <strong>${escapeHtml(option.label)}</strong>
      <small>${option.votes} · ${pct}%</small>
    </button>`;
  }).join("");

  document.querySelectorAll("[data-vote-option]").forEach(button=>{
    button.addEventListener("click",()=>vote(button.dataset.voteOption));
  });
}

async function vote(optionId){
  if(!state.active||state.active.state!=="open")return;
  const key=`djf-vote-${state.active.id}`;
  if(localStorage.getItem(key)==="1")return;

  try{
    const response=await fetch(`${API_BASE}/api/interaction/vote`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({interactionId:state.active.id,optionId})
    });
    const data=await response.json();
    if(!response.ok||data.ok===false)throw new Error(data.error||`Vote failed ${response.status}`);
    localStorage.setItem(key,"1");
    render(data.core||data.data||data);
  }catch(error){
    state.errors.push(String(error?.message||error));
    $("interactiveResultText").textContent="Vote could not be registered. Please try again.";
  }
}

async function refresh(){
  try{
    const response=await fetch(`${API_BASE}/api/broadcast?_=${Date.now()}`,{cache:"no-store"});
    if(!response.ok)throw new Error(`Broadcast ${response.status}`);
    const raw=await response.json();
    render(raw.core||raw.data||raw);
  }catch(error){
    state.errors.push(String(error?.message||error));
  }
}

window.addEventListener("djf:broadcast-core",event=>render(event.detail||{}));
document.addEventListener("DOMContentLoaded",()=>{
  refresh();
  setInterval(refresh,12000);
});

window.DJF_INTERACTION_SITE=Object.freeze({
  version:"V19400",refresh,render,vote,
  getStatus:()=>({active:state.active,errors:state.errors.slice()})
});
})();
