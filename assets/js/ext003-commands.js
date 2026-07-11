const API_BASE='https://djfolsoe-tv-api.sunefolsoe.workers.dev';
let allCommands=[];
const $=s=>document.querySelector(s);
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function render(){
 const q=$('#search').value.toLowerCase();
 const category=$('#category').value;
 const list=allCommands.filter(c=>(!q||[c.command,c.title,c.description,c.category].join(' ').toLowerCase().includes(q))&&(!category||c.category===category));
 const groups={};
 list.forEach(c=>(groups[c.category]??=[]).push(c));
 $('#commandGroups').innerHTML=Object.entries(groups).map(([name,items])=>`<section class="group"><p class="eyebrow">${esc(name)}</p><h2>${esc(name)}</h2><div class="grid">${items.map(c=>`<article class="card"><div class="command">${esc(c.command)}</div><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p><p class="usage">${esc(c.usage)}</p><span class="badge">${esc(c.show==='all'?'All shows':c.show)}</span></article>`).join('')}</div></section>`).join('')||'<section class="group">No commands found.</section>';
 $('#summary').innerHTML=`<div><strong>${list.length}</strong><br><span>Active commands</span></div><div><strong>${Object.keys(groups).length}</strong><br><span>Categories</span></div>`;
}
async function load(){
 const d=await(await fetch(API_BASE+'/api/ext003/commands',{cache:'no-store'})).json();
 allCommands=d.commands||[];
 const cats=[...new Set(allCommands.map(c=>c.category))];
 $('#category').innerHTML='<option value="">All categories</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join('');
 render();
}
$('#search').addEventListener('input',render);$('#category').addEventListener('change',render);$('#refresh').addEventListener('click',load);load();
