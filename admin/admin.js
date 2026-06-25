async function boot(){const r=await fetch("../assets/data/site.json");const data=await r.json();document.getElementById("json").value=JSON.stringify(data,null,2);renderReq();}
function renderReq(){const all=JSON.parse(localStorage.getItem("djf_requests")||"[]");document.getElementById("req").innerHTML=all.length?all.map(x=>`<div class="requestItem"><b>${x.song}</b><br><small>${x.name} · ${x.show} · ${x.when}</small></div>`).join(""):"<p>Ingen lokale requests.</p>";}
document.getElementById("format").onclick=()=>{const el=document.getElementById("json");el.value=JSON.stringify(JSON.parse(el.value),null,2)}
document.getElementById("copy").onclick=async()=>{await navigator.clipboard.writeText(document.getElementById("json").value);alert("JSON kopieret");}
document.getElementById("clear").onclick=()=>{localStorage.removeItem("djf_requests");renderReq();}
boot();