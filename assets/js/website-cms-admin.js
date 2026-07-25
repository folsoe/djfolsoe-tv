
(function(){
"use strict";
const state={news:[],highlights:[],loaded:null};
const $=id=>document.getElementById(id);
const val=id=>String($(id)?.value||"").trim();
function build(){
  return {
    news:state.news.slice(0,20),
    highlights:state.highlights.slice(0,20),
    updatedAt:new Date().toISOString()
  };
}
function render(){
  const box=$("websiteCmsItems");
  if(box){
    const items=[
      ...state.news.map((x,i)=>({...x,_kind:"news",_index:i})),
      ...state.highlights.map((x,i)=>({...x,_kind:"highlight",_index:i}))
    ];
    box.innerHTML=items.map(item=>`
      <article class="websiteCmsAdmin__item">
        <div class="websiteCmsAdmin__itemHead">
          <strong>${item.title||"Untitled"}</strong>
          <button type="button" data-cms-remove="${item._kind}:${item._index}">Remove</button>
        </div>
        <p>${item.body||""}</p>
        <small>${item.type||item._kind} · ${item.dateLabel||""}</small>
      </article>`).join("")||"<div>No CMS items yet.</div>";
    box.querySelectorAll("[data-cms-remove]").forEach(btn=>btn.addEventListener("click",()=>{
      const [kind,index]=btn.dataset.cmsRemove.split(":");
      if(kind==="news")state.news.splice(Number(index),1);else state.highlights.splice(Number(index),1);
      render();
    }));
  }
  $("websiteCmsDiagnostics").textContent=JSON.stringify(build(),null,2);
}
function add(){
  const item={
    id:`cms-${Date.now()}`,
    type:val("websiteCmsType"),
    dateLabel:val("websiteCmsDate")||"NOW",
    title:val("websiteCmsTitle"),
    body:val("websiteCmsBody"),
    url:val("websiteCmsUrl"),
    createdAt:new Date().toISOString()
  };
  if(!item.title)return;
  if(item.type==="news")state.news.unshift(item);else state.highlights.unshift(item);
  clearForm();render();
}
function clearForm(){
  ["websiteCmsTitle","websiteCmsBody","websiteCmsUrl"].forEach(id=>{if($(id))$(id).value=""});
  if($("websiteCmsDate"))$("websiteCmsDate").value="TODAY";
}
function hydrate(core){
  const cms=core?.websiteCms||{};
  state.news=Array.isArray(cms.news)?cms.news.slice():[];
  state.highlights=Array.isArray(cms.highlights)?cms.highlights.slice():[];
  state.loaded=core;
  render();
}
async function publish(){
  if(typeof window.djfOneClick!=="function")return false;
  $("websiteCmsDiagnostics").textContent="Publishing website CMS…";
  try{
    await window.djfOneClick();
    $("websiteCmsDiagnostics").textContent=JSON.stringify({published:true,cms:build()},null,2);
    return true;
  }catch(error){
    $("websiteCmsDiagnostics").textContent=JSON.stringify({published:false,error:String(error?.message||error)},null,2);
    return false;
  }
}
document.addEventListener("DOMContentLoaded",()=>{
  const original=window.buildPayload;
  if(typeof original==="function"){
    window.buildPayload=function(){
      const payload=original();
      payload.websiteCms=build();
      return payload;
    };
  }
  $("websiteCmsAddBtn")?.addEventListener("click",add);
  $("websiteCmsClearBtn")?.addEventListener("click",clearForm);
  $("websiteCmsLoadBtn")?.addEventListener("click",()=>hydrate(window.__DJF_ADMIN_CORE__||state.loaded||{}));
  $("websiteCmsPublishBtn")?.addEventListener("click",publish);
  window.addEventListener("djf:admin-core-loaded",e=>hydrate(e.detail||{}));
  clearForm();render();
});
window.DJF_WEBSITE_CMS_ADMIN=Object.freeze({version:"V19800",build,render,hydrate,publish});
})();
