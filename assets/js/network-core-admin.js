const API_BASE='https://djfolsoe-tv-api.sunefolsoe.workers.dev';
const $=id=>document.getElementById(id);
const token=()=>$('adminToken').value.trim();
function headers(){return {'Content-Type':'application/json','X-Admin-Token':token()}}
function out(d){$('output').textContent=typeof d==='string'?d:JSON.stringify(d,null,2)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function api(path,options={}){const r=await fetch(API_BASE+path,{cache:'no-store',...options,headers:{...headers(),...(options.headers||{})}});const d=await r.json();return d}
function renderHealth(d){
 const s=d.status||{};
 $('coreOrb').textContent=s.ok?'LIVE':'SETUP';
 $('coreOrb').classList.toggle('live',!!s.ok);
 $('twitchStatus').textContent=s.twitchConnected?'CONNECTED':'NOT READY';
 $('twitchDetail').textContent=s.hasClientSecret?'App credentials ready':'Client Secret missing';
 $('eventSubStatus').textContent=s.eventSubConnected?'CONNECTED':'NOT READY';
 $('eventSubDetail').textContent=`${s.enabledSubscriptionCount||0} enabled`;
 $('lastRepair').textContent=s.lastRepairAt?new Date(s.lastRepairAt).toLocaleTimeString():'NEVER';
 const req=d.requirements||{};
 $('requirements').innerHTML=Object.entries(req).map(([k,v])=>`<span class="${v?'ok':'bad'}">${esc(k)}: ${v?'READY':'MISSING'}</span>`).join('');
}
async function loadHealth(){const d=await api('/api/core/health');renderHealth(d);out(d);return d}
async function loadState(){const d=await api('/api/core/state');$('activityCount').textContent=d.activity?.count||0;$('activityFeed').innerHTML=(d.activity?.events||[]).slice(0,40).map(e=>`<article><b>${esc(e.type)}</b><div><strong>${esc(e.headline)}</strong><br><small>${esc(e.detail)}</small></div><time>${new Date(e.timestamp).toLocaleString()}</time></article>`).join('')||'<p>No activity yet.</p>';return d}
async function repair(){if(!token())return out('ADMIN_TOKEN is required');const d=await api('/api/core/admin/repair',{method:'POST',body:'{}'});out(d);await loadHealth();await loadState()}
async function subscriptions(){if(!token())return out('ADMIN_TOKEN is required');out(await api('/api/core/admin/subscriptions'))}
$('repairCore').onclick=repair;$('refreshCore').onclick=async()=>{await loadHealth();await loadState()};$('loadSubscriptions').onclick=subscriptions;loadHealth();loadState();setInterval(loadState,15000);
