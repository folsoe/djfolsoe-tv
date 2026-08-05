(() => {
"use strict";

const JSON_URL="assets/data/followers.json";
const CACHE_KEY="djf:v25010.1:github-followers";
const POLL_MS=60000;

const state={
  ready:false,
  count:null,
  updatedAt:"",
  source:"none",
  lastError:"",
  timer:0
};

function clean(value,max=500){
  return String(value??"").replace(/[<>]/g,"").trim().slice(0,max);
}

function updateDOM(count){
  const value=Number(count);
  if(!Number.isFinite(value)||value<0)return false;
  const text=Math.floor(value).toLocaleString("en-US");

  const selectors=[
    "#heroFollowers",
    "#followers",
    "#metricFollowers",
    "#statFollowers",
    "#sideFollowers",
    "[data-community-followers]",
    "[data-followers]"
  ];

  for(const selector of selectors){
    document.querySelectorAll(selector).forEach(node=>{
      node.textContent=text;
      node.dataset.followerSource="github-twitch-helix";
    });
  }

  // Keep the active page state in sync for the current V20001 homepage.
  try{
    window.dispatchEvent(new CustomEvent("djf:website-follower-total",{
      detail:{count:Math.floor(value),updatedAt:state.updatedAt,source:state.source}
    }));
  }catch(_){}

  return true;
}

function loadCache(){
  try{
    const cached=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");
    if(Number.isFinite(Number(cached?.count))){
      state.count=Math.floor(Number(cached.count));
      state.updatedAt=clean(cached.updatedAt);
      state.source="local-cache";
      updateDOM(state.count);
    }
  }catch(_){}
}

function saveCache(){
  try{
    localStorage.setItem(CACHE_KEY,JSON.stringify({
      count:state.count,
      updatedAt:state.updatedAt,
      source:state.source
    }));
  }catch(_){}
}

async function refresh(reason="poll"){
  try{
    const response=await fetch(
      `${JSON_URL}?v=${Date.now()}`,
      {cache:"no-store",headers:{Accept:"application/json"}}
    );
    if(!response.ok)throw new Error(`followers.json ${response.status}`);

    const payload=await response.json();
    const count=Number(payload?.followers ?? payload?.count);
    if(!Number.isFinite(count)||count<0){
      throw new Error("followers.json contains no valid follower total.");
    }

    state.count=Math.floor(count);
    state.updatedAt=clean(payload.updatedAt||payload.generatedAt||new Date().toISOString());
    state.source=clean(payload.source||"github-actions-twitch-helix");
    state.lastError="";
    updateDOM(state.count);
    saveCache();
    return state.count;
  }catch(error){
    state.lastError=String(error?.message||error);
    console.warn("V25010.1 website follower sync:",error);
    return state.count;
  }
}

function start(){
  clearInterval(state.timer);
  refresh("startup");
  state.timer=setInterval(()=>refresh("interval"),POLL_MS);
  state.ready=true;
}

window.addEventListener("djf:website-follower-total",event=>{
  const count=Number(event?.detail?.count);
  if(Number.isFinite(count)&&count>=0)updateDOM(count);
});

window.DJF_GITHUB_FOLLOWERS={
  refresh,
  get:()=>({
    count:state.count,
    updatedAt:state.updatedAt,
    source:state.source
  }),
  status:()=>({
    ready:state.ready,
    count:state.count,
    updatedAt:state.updatedAt||null,
    source:state.source,
    lastError:state.lastError,
    pollingMs:POLL_MS,
    jsonUrl:JSON_URL,
    workerUsed:false
  }),
  clearCache:()=>{
    localStorage.removeItem(CACHE_KEY);
    return true;
  }
};

loadCache();
if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",start,{once:true});
}else{
  start();
}
})();