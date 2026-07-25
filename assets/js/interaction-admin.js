
/* DJ FOLSOE V19400 · ADMIN INTERACTION */
(function(){
"use strict";

const TEMPLATES={
  poll:{question:"Which track should play next?",description:"Vote on the website.",options:["Track A","Track B","Track C","Track D"]},
  quiz:{question:"Which year was this released?",description:"Choose the correct answer.",options:["1994","1996","1998","2000"]},
  battle:{question:"Track battle: who wins?",description:"Choose your favourite.",options:["Track A","Track B"]},
  rating:{question:"Rate the current track",description:"How many stars?",options:["1 star","2 stars","3 stars","4 stars","5 stars"]},
  wheel:{question:"What should the wheel choose?",description:"Vote before the wheel spins.",options:["Retro","Trance","Eurodance","Surprise"]},
  request:{question:"Which request should play next?",description:"Vote for a viewer request.",options:["Request A","Request B","Request C","Request D"]}
};

const state={type:"poll",loaded:null};
const $=id=>document.getElementById(id);
const val=id=>String($(id)?.value||"").trim();
const clean=v=>String(v??"").trim();

function optionsFromFields(existing=[]){
  const values=["A","B","C","D"].map((letter,index)=>{
    const previous=existing[index]||{};
    return {
      id:letter,
      label:val(`interactionOption${letter}`),
      votes:Number(previous.votes||0)
    };
  }).filter(o=>o.label);
  return values;
}

function buildInteractive(){
  const previous=state.loaded?.active||{};
  const options=optionsFromFields(previous.options||[]);
  const totalVotes=options.reduce((sum,o)=>sum+o.votes,0);
  const sorted=[...options].sort((a,b)=>b.votes-a.votes);
  return {
    active:{
      id:clean(previous.id)||`interaction-${Date.now()}`,
      type:state.type,
      enabled:val("interactionState")!=="inactive",
      state:val("interactionState")||"open",
      question:val("interactionQuestion"),
      description:val("interactionDescription"),
      duration:Number(val("interactionDuration"))||12000,
      options,
      totalVotes,
      result:sorted[0]&&totalVotes?{optionId:sorted[0].id,label:sorted[0].label,votes:sorted[0].votes}:null,
      updatedAt:new Date().toISOString()
    },
    history:Array.isArray(state.loaded?.history)?state.loaded.history:[]
  };
}

function render(){
  const interactive=buildInteractive();
  const active=interactive.active;
  $("interactionPreviewType").textContent=active.type.toUpperCase();
  $("interactionPreviewLabel").textContent=active.state==="closed"?"RESULT":active.state==="inactive"?"INACTIVE":"VOTING OPEN";
  $("interactionPreviewQuestion").textContent=active.question||"Interactive module";
  $("interactionPreviewDescription").textContent=active.description||"Audience participation";
  $("interactionPreviewOptions").innerHTML=active.options.map((o,i)=>`<div><b>${String.fromCharCode(65+i)}</b><strong>${o.label}</strong><span>${o.votes} votes</span></div>`).join("");
  $("interactionDiagnostics").textContent=JSON.stringify(interactive,null,2);
}

function applyTemplate(type){
  state.type=TEMPLATES[type]?type:"poll";
  const t=TEMPLATES[state.type];
  $("interactionQuestion").value=t.question;
  $("interactionDescription").value=t.description;
  ["A","B","C","D"].forEach((letter,index)=>{
    $("interactionOption"+letter).value=t.options[index]||"";
  });
  document.querySelectorAll("[data-interaction-template]").forEach(btn=>{
    btn.setAttribute("aria-pressed",String(btn.dataset.interactionTemplate===state.type));
  });
  render();
}

function hydrate(core){
  const interactive=core?.interactive||{};
  state.loaded=interactive;
  const active=interactive.active;
  if(!active)return;
  state.type=active.type||"poll";
  $("interactionState").value=active.state||"open";
  $("interactionDuration").value=active.duration||12000;
  $("interactionQuestion").value=active.question||"";
  $("interactionDescription").value=active.description||"";
  ["A","B","C","D"].forEach((letter,index)=>{
    $("interactionOption"+letter).value=active.options?.[index]?.label||"";
  });
  render();
}

async function publish(){
  if(typeof window.djfOneClick!=="function"){
    $("interactionDiagnostics").textContent="One Click Publish is unavailable.";
    return false;
  }
  $("interactionDiagnostics").textContent="Publishing interaction…";
  try{
    await window.djfOneClick();
    $("interactionDiagnostics").textContent=JSON.stringify({published:true,interactive:buildInteractive()},null,2);
    return true;
  }catch(error){
    $("interactionDiagnostics").textContent=JSON.stringify({published:false,error:String(error?.message||error)},null,2);
    return false;
  }
}

function resetVotes(){
  const active=buildInteractive().active;
  active.id=`interaction-${Date.now()}`;
  state.loaded={active:{...active,options:active.options.map(o=>({...o,votes:0})),totalVotes:0,result:null},history:state.loaded?.history||[]};
  hydrate({interactive:state.loaded});
  render();
}

function showResult(){
  $("interactionState").value="closed";
  render();
  publish();
}

function stop(){
  $("interactionState").value="inactive";
  render();
  publish();
}

document.addEventListener("DOMContentLoaded",()=>{
  const original=window.buildPayload;
  if(typeof original==="function"){
    window.buildPayload=function(){
      const payload=original();
      payload.interactive=buildInteractive();
      return payload;
    };
  }

  document.querySelectorAll("[data-interaction-template]").forEach(btn=>{
    btn.addEventListener("click",()=>applyTemplate(btn.dataset.interactionTemplate));
  });
  ["interactionState","interactionDuration","interactionQuestion","interactionDescription",
    "interactionOptionA","interactionOptionB","interactionOptionC","interactionOptionD"].forEach(id=>{
    $(id)?.addEventListener("input",render);
    $(id)?.addEventListener("change",render);
  });

  $("interactionPreviewBtn")?.addEventListener("click",render);
  $("interactionPublishBtn")?.addEventListener("click",publish);
  $("interactionResetVotesBtn")?.addEventListener("click",resetVotes);
  $("interactionShowResultBtn")?.addEventListener("click",showResult);
  $("interactionStopBtn")?.addEventListener("click",stop);

  window.addEventListener("djf:admin-core-loaded",event=>hydrate(event.detail||{}));
  applyTemplate("poll");
});

window.DJF_INTERACTION_ADMIN=Object.freeze({
  version:"V19400",buildInteractive,hydrate,render,publish,resetVotes,showResult,stop,
  getStatus:()=>({version:"V19400",type:state.type,interactive:buildInteractive()})
});
})();
