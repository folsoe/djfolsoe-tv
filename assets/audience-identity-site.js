
(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function role(p){if(p.isBroadcaster)return"BROADCASTER";if(p.isDj)return"DJ NETWORK";if(p.isMod)return"MODERATOR";if(p.isVip)return"VIP";if(p.isSubscriber)return"SUBSCRIBER";if(Number(p.visits||0)>=10)return"REGULAR";if(Number(p.visits||0)<=1)return"FIRST VISIT";return"VIEWER"}
function render(raw){
  const a=raw?.audience;if(!a)return;
  const profiles=Array.isArray(a.featuredProfiles)?a.featuredProfiles:[];
  const box=$("audienceIdentityCommunity");
  if(box&&profiles.length)box.innerHTML=profiles.slice(0,6).map(p=>`<article><span class="audienceIdentity__label">${esc(role(p))}</span><strong>${esc(p.displayName||p.login||"Viewer")}</strong><p>${Number(p.visits||0)} visits · ${Number(p.requests||0)} requests</p></article>`).join("");
  const r=a.latestRecognition;
  if(r){$("audienceLatestIcon").textContent=r.icon||"★";$("audienceLatestLabel").textContent=String(r.label||"COMMUNITY").toUpperCase();$("audienceLatestName").textContent=r.displayName||r.user||"DJ FOLSOE community";$("audienceLatestMessage").textContent=r.message||"Thanks for being part of the show."}
  $("audienceIdentityStatus").textContent=`${Number(a.profileCount||profiles.length)} COMMUNITY PROFILES`;
}
window.addEventListener("djf:broadcast-core",e=>render(e.detail||{}));
document.addEventListener("DOMContentLoaded",()=>{if(window.__DJF_CORE__)render(window.__DJF_CORE__)});
window.DJF_AUDIENCE_IDENTITY_SITE=Object.freeze({version:"V19700",render});
})();
