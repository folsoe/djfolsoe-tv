
/* V26432 relevant-page Chart Spotlight */
(()=>{"use strict";
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
function mv(x){const s=(x.status||"").toLowerCase();if(s==="new")return"NEW";if(s.includes("re"))return"RE";const a=Number(x.last_week),b=Number(x.rank);if(!a)return"—";return a>b?`↑ ${a-b}`:a<b?`↓ ${b-a}`:"●"}
async function init(){const boxes=[...document.querySelectorAll("[data-v26432-chart]")];if(!boxes.length)return;let d;try{d=await fetch("/data/charts.json?t="+Date.now(),{cache:"no-store"}).then(r=>r.json())}catch(e){return}
boxes.forEach(box=>{const type=box.dataset.v26432Chart, arr=(type==="retro"?d.retro_top10:d.top20)||[], limit=Number(box.dataset.limit||5);
box.querySelector(".v26432ChartMini").innerHTML=arr.slice(0,limit).map(x=>`<div class="v26432ChartMini__row"><b>${String(x.rank).padStart(2,"0")}</b><div class="v26432ChartMini__song"><strong>${esc(x.artist)} — ${esc(x.title)}</strong><small>${type==="retro"?esc(x.year||""):"DJ FOLSOE TOP 20"}</small></div><div class="v26432ChartMini__move">${mv(x)}</div></div>`).join("")})}
init()})()
