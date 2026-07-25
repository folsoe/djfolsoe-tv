
(function(){
"use strict";
const API="https://djfolsoe-tv-api.sunefolsoe.workers.dev", $=id=>document.getElementById(id);
const tok=()=>localStorage.getItem("djf_admin_token")||localStorage.getItem("ADMIN_TOKEN")||"";
const txt=(id,v)=>{const e=$(id);if(e)e.textContent=v??"—"};
const role=p=>p.isBroadcaster?"BROADCASTER":p.isDj?"DJ NETWORK":p.isMod?"MOD":p.isVip?"VIP":p.isSubscriber?"SUB":Number(p.visits||0)>=10?"REGULAR":"VIEWER";
const score=p=>Number(p.visits||0)*10+Number(p.requests||0)*5+(p.isSubscriber?50:0)+(p.isVip?75:0)+(p.isMod?100:0)+(p.isDj?125:0);
function render(raw){
  const a=raw?.audience||raw||{}, ps=Array.isArray(a.profiles)?a.profiles:Array.isArray(a.featuredProfiles)?a.featuredProfiles:[];
  txt("audienceProfileCount",a.profileCount||ps.length);txt("audienceRegularCount",ps.filter(p=>Number(p.visits||0)>=Number($("audienceMinimumVisits")?.value||10)).length);
  txt("audienceRequestCount",ps.reduce((s,p)=>s+Number(p.requests||0),0));txt("audienceRecognitionCount",Number(a.recognitionCount||0));
  const s=a.settings||{};if($("audienceRecognitionCooldown"))$("audienceRecognitionCooldown").value=s.cooldownMinutes||30;if($("audienceMinimumVisits"))$("audienceMinimumVisits").value=s.regularVisits||10;if($("audienceRecognitionMode"))$("audienceRecognitionMode").value=s.mode||"balanced";
  const list=$("audienceProfileList");if(list)list.innerHTML=ps.slice().sort((a,b)=>score(b)-score(a)).slice(0,100).map(p=>`<article class="audienceAdmin__profile"><div class="audienceAdmin__avatar">${String(p.displayName||p.login||"?").slice(0,2).toUpperCase()}</div><div><strong>${p.displayName||p.login||"Viewer"}</strong><small>${Number(p.visits||0)} visits · ${Number(p.requests||0)} requests</small></div><div class="audienceAdmin__role">${role(p)}</div><div class="audienceAdmin__score">${score(p)} pts</div></article>`).join("")||"<div>No profiles recorded yet.</div>";
  $("audienceDiagnostics").textContent=JSON.stringify({profileCount:a.profileCount||ps.length,latestRecognition:a.latestRecognition||null,settings:a.settings||{}},null,2);
}
async function post(path,body={}){
  const r=await fetch(API+path,{method:"POST",headers:{"Content-Type":"application/json",...(tok()?{"X-Admin-Token":tok()}:{})},body:JSON.stringify(body)}),d=await r.json();
  if(!r.ok||d.ok===false)throw new Error(d.error||`Audience ${r.status}`);render(d.audience||d.core?.audience||d);return d;
}
async function refresh(){try{const r=await fetch(API+"/api/audience",{cache:"no-store"}),d=await r.json();if(!r.ok)throw new Error(d.error||`Audience ${r.status}`);render(d.audience||d)}catch(e){$("audienceDiagnostics").textContent=String(e?.message||e)}}
const settings=()=>post("/api/audience/settings",{cooldownMinutes:Number($("audienceRecognitionCooldown")?.value||30),regularVisits:Number($("audienceMinimumVisits")?.value||10),mode:$("audienceRecognitionMode")?.value||"balanced"});
const test=vip=>post("/api/audience/event",{login:vip?"test_vip":"test_first",displayName:vip?"Test VIP Viewer":"New Test Viewer",eventType:"chat",isVip:vip,firstVisit:!vip,forceRecognition:true});
document.addEventListener("DOMContentLoaded",()=>{$("audienceRefreshBtn")?.addEventListener("click",refresh);$("audienceTestFirstBtn")?.addEventListener("click",()=>test(false));$("audienceTestVipBtn")?.addEventListener("click",()=>test(true));$("audienceClearRecognitionBtn")?.addEventListener("click",()=>post("/api/audience/recognition/clear"));["audienceRecognitionCooldown","audienceMinimumVisits","audienceRecognitionMode"].forEach(id=>$(id)?.addEventListener("change",settings));window.addEventListener("djf:admin-core-loaded",e=>render(e.detail?.audience||{}));setTimeout(refresh,500)});
window.DJF_AUDIENCE_IDENTITY_ADMIN=Object.freeze({version:"V19700",refresh,render});
})();
