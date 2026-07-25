
/* DJ FOLSOE V19200 · TV GRAPHICS STUDIO */
(function(){
"use strict";

const TEMPLATES={
  lower:{kicker:"NOW PLAYING",badge:"MUSIC",icon:"♫",title:"Artist — Track",body:"Live music from Denmark"},
  breaking:{kicker:"BREAKING INFORMATION",badge:"BREAKING",icon:"!",title:"Important channel update",body:"Supporting information"},
  upnext:{kicker:"UP NEXT",badge:"UP NEXT",icon:"▶",title:"Next on DJ FOLSOE",body:"Show time appears here"},
  chart:{kicker:"CHART UPDATE",badge:"CHART",icon:"★",title:"Artist — Track",body:"This week's chart position"},
  poll:{kicker:"LIVE POLL",badge:"POLL",icon:"?",title:"Which track should play next?",body:"A: Track A · B: Track B · C: Track C · D: Track D"},
  quiz:{kicker:"MUSIC QUIZ",badge:"QUIZ",icon:"?",title:"Which year was this released?",body:"A: 1994 · B: 1996 · C: 1998 · D: 2000"},
  promo:{kicker:"COMING UP",badge:"PROMO",icon:"TV",title:"DJ FOLSOE SPECIAL",body:"Live on Twitch"},
  special:{kicker:"SPECIAL EVENT",badge:"SPECIAL",icon:"◆",title:"DJ FOLSOE LIVE",body:"Music, community and interactive television"}
};

const state={template:"lower",draft:null,history:[]};

function $(id){return document.getElementById(id)}
function val(id){return String($(id)?.value||"").trim()}
function text(id,value){const el=$(id);if(el)el.textContent=value||""}

function getDraft(){
  return {
    type:state.template,
    kicker:val("gfxKicker"),
    title:val("gfxTitle"),
    body:val("gfxBody"),
    badge:val("gfxBadge"),
    icon:val("gfxIcon"),
    duration:Math.max(3200,Math.min(30000,Number(val("gfxDuration"))||9000)),
    position:Number(val("gfxPosition"))||null,
    options:[val("gfxOptionA"),val("gfxOptionB"),val("gfxOptionC"),val("gfxOptionD")].filter(Boolean)
  };
}

function render(){
  const d=getDraft();
  state.draft=d;
  text("gfxPreviewKicker",d.kicker);
  text("gfxPreviewTitle",d.title);
  text("gfxPreviewBody",d.body);
  text("gfxPreviewBadge",d.badge);
  text("gfxPreviewIcon",d.icon);
  const status=$("gfxStudioStatus");
  if(status)status.textContent=JSON.stringify(d,null,2);
}

function applyTemplate(type){
  state.template=TEMPLATES[type]?type:"lower";
  const t=TEMPLATES[state.template];
  $("gfxKicker").value=t.kicker;
  $("gfxTitle").value=t.title;
  $("gfxBody").value=t.body;
  $("gfxBadge").value=t.badge;
  $("gfxIcon").value=t.icon;
  document.querySelectorAll("[data-gfx-template]").forEach(btn=>{
    btn.setAttribute("aria-pressed",String(btn.dataset.gfxTemplate===state.template));
  });
  render();
}

function findAndSet(ids,value){
  for(const id of ids){
    const el=$(id);
    if(el){
      el.value=value;
      el.dispatchEvent(new Event("input",{bubbles:true}));
      el.dispatchEvent(new Event("change",{bubbles:true}));
      return id;
    }
  }
  return null;
}

function applyToAdmin(){
  const d=getDraft();
  const mapped={
    kicker:findAndSet(["lowerThirdKicker","graphicKicker","eventKicker","tickerLabel"],d.kicker),
    title:findAndSet(["lowerThirdTitle","graphicTitle","eventTitle","headline"],d.title),
    body:findAndSet(["lowerThirdBody","graphicBody","eventBody","description"],d.body),
    badge:findAndSet(["lowerThirdBadge","graphicBadge","eventBadge"],d.badge),
    icon:findAndSet(["lowerThirdIcon","graphicIcon","eventIcon"],d.icon)
  };
  state.history.unshift({at:new Date().toISOString(),draft:d,mapped});
  const status=$("gfxStudioStatus");
  if(status)status.textContent=JSON.stringify({applied:true,mapped,draft:d},null,2);
  return mapped;
}

function previewGraphic(){
  const d=getDraft();
  window.dispatchEvent(new CustomEvent("djf:generate-graphic",{detail:d}));
  const status=$("gfxStudioStatus");
  if(status)status.textContent=JSON.stringify({preview:true,draft:d},null,2);
}

async function publishGraphic(){
  const d=getDraft();
  applyToAdmin();
  if(typeof window.djfOneClick==="function"){
    const status=$("gfxStudioStatus");
    if(status)status.textContent="Publishing graphic through One Click Publish…";
    try{
      await window.djfOneClick();
      if(status)status.textContent=JSON.stringify({published:true,draft:d},null,2);
      return true;
    }catch(error){
      if(status)status.textContent=JSON.stringify({published:false,error:String(error?.message||error)},null,2);
      return false;
    }
  }
  previewGraphic();
  return false;
}

function reset(){
  applyTemplate(state.template);
  ["gfxOptionA","gfxOptionB","gfxOptionC","gfxOptionD"].forEach(id=>{if($(id))$(id).value=""});
  $("gfxDuration").value="9000";
  $("gfxPosition").value="";
  render();
}

document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll("[data-gfx-template]").forEach(btn=>{
    btn.addEventListener("click",()=>applyTemplate(btn.dataset.gfxTemplate));
  });
  ["gfxKicker","gfxTitle","gfxBody","gfxBadge","gfxIcon","gfxDuration","gfxPosition",
   "gfxOptionA","gfxOptionB","gfxOptionC","gfxOptionD"].forEach(id=>{
    $(id)?.addEventListener("input",render);
  });
  $("gfxApplyBtn")?.addEventListener("click",applyToAdmin);
  $("gfxPreviewBtn")?.addEventListener("click",previewGraphic);
  $("gfxPublishBtn")?.addEventListener("click",publishGraphic);
  $("gfxResetBtn")?.addEventListener("click",reset);
  applyTemplate("lower");
});

window.DJF_TV_GRAPHICS_STUDIO=Object.freeze({
  version:"V19200",templates:TEMPLATES,applyTemplate,getDraft,render,applyToAdmin,previewGraphic,publishGraphic,reset,
  getStatus:()=>({version:"V19200",template:state.template,draft:state.draft,history:state.history.slice()})
});
})();
