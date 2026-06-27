const API_BASE="https://djfolsoe-tv-api.sunefolsoe.workers.dev";
let core=null, topItems=[], bottomItems=[];
document.getElementById("token").value=localStorage.getItem("DJF_ADMIN_TOKEN")||"";
function token(){return localStorage.getItem("DJF_ADMIN_TOKEN")||document.getElementById("token").value||"";}
function saveToken(){localStorage.setItem("DJF_ADMIN_TOKEN",document.getElementById("token").value);alert("Token gemt");}
async function api(path,opt={}){opt.headers=Object.assign({"content-type":"application/json","x-admin-token":token()},opt.headers||{});const r=await fetch(API_BASE+path,opt);if(!r.ok)throw new Error(await r.text());return r.json();}
async function load(){core=await api("/api/site"); renderThemes(); const t=await api("/api/theme-ticker-top"); topItems=t.items||[]; const b=await api("/api/bottom-ticker"); bottomItems=b.items||[]; renderEditors();}
function renderThemes(){const themes=core.core?.themes||{};document.getElementById("themeButtons").innerHTML=Object.entries(themes).map(([k,v])=>`<button onclick="setTheme('${k}')">${v.emoji||""} ${(v.title&&v.title.da)||k}</button>`).join("");document.getElementById("themeStatus").textContent="Aktivt tema: "+(core.theme?.activeTheme||"");}
async function setTheme(k){await api("/api/theme",{method:"POST",body:JSON.stringify({theme:k})});await load();alert("Tema skiftet til "+k+" - overlayet opdaterer automatisk");}
async function setLanguage(l){await api("/api/settings",{method:"POST",body:JSON.stringify({language:l})});await load();alert("Sprog sat til "+l);}
function row(item,i,type){return `<div class="row"><div><label>Active</label><select data-type="${type}" data-i="${i}" data-f="active"><option value="true" ${item.active!==false?'selected':''}>Yes</option><option value="false" ${item.active===false?'selected':''}>No</option></select></div><div><label>Theme</label><input data-type="${type}" data-i="${i}" data-f="theme" value="${item.theme||'all'}"></div><div><label>Text</label><input data-type="${type}" data-i="${i}" data-f="text" value="${item.text||''}"></div><div><label>Priority</label><input data-type="${type}" data-i="${i}" data-f="priority" value="${item.priority||99}"></div><button onclick="delTicker('${type}',${i})">Slet</button></div>`}
function renderEditors(){document.getElementById("topEditor").innerHTML=topItems.map((x,i)=>row(x,i,"top")).join("");document.getElementById("bottomEditor").innerHTML=bottomItems.map((x,i)=>row(x,i,"bottom")).join("");}
function collect(){document.querySelectorAll("[data-type][data-i][data-f]").forEach(inp=>{const arr=inp.dataset.type==="top"?topItems:bottomItems;const i=Number(inp.dataset.i),f=inp.dataset.f;let v=inp.value;if(f==="active")v=v==="true";if(f==="priority")v=Number(v||99);arr[i][f]=v;});}
function addTicker(type){const arr=type==="top"?topItems:bottomItems;arr.push({id:type+Date.now(),active:true,theme:type==="top"?"morning":"all",text:"",priority:arr.length+1});renderEditors();}
function delTicker(type,i){(type==="top"?topItems:bottomItems).splice(i,1);renderEditors();}
async function saveTicker(type){collect();await api(type==="top"?"/api/theme-ticker-top":"/api/bottom-ticker",{method:"POST",body:JSON.stringify({items:type==="top"?topItems:bottomItems})});alert("Gemt");}
load().catch(e=>alert(e.message));
