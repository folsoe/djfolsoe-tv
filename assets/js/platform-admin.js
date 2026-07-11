const API_BASE='https://djfolsoe-tv-api.sunefolsoe.workers.dev';
const $=id=>document.getElementById(id);
const token=()=>$('adminToken').value.trim();
function headers(){return {'Content-Type':'application/json','X-Admin-Token':token()}}
function out(d){$('output').textContent=typeof d==='string'?d:JSON.stringify(d,null,2)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function api(path,options={}){const r=await fetch(API_BASE+path,{cache:'no-store',...options,headers:{...headers(),...(options.headers||{})}});return r.json()}
function render(state){
 $('platformOrb').textContent=state.ok?'LIVE':'SETUP';$('platformOrb').classList.toggle('live',!!state.ok);
 $('moduleCount').textContent=(state.modules||[]).filter(m=>m.enabled!==false).length;
 $('activityCount').textContent=state.activity?.count||0;
 $('viewerCount').textContent=state.leaderboard?.count||0;
 $('requestCount').textContent=state.requests?.length||0;
 $('moduleGrid').innerHTML=(state.modules||[]).map(m=>`<article class="module"><header><b>${esc(m.name)}</b><span>${esc(m.status||'online')}</span></header><small>${esc(m.source||'platform')}</small><button data-module="${esc(m.id)}" data-enabled="${m.enabled!==false}">${m.enabled!==false?'Disable':'Enable'}</button></article>`).join('');
 $('hallGrid').innerHTML=(state.leaderboard?.viewers||[]).slice(0,10).map((v,i)=>`<article class="hallCard"><img src="${esc(v.profile_image||'')}" alt=""><h3>#${i+1} ${esc(v.display_name||v.login)}</h3><small>Level ${v.score?.level||1} · ${v.score?.xp||0} XP</small></article>`).join('');
 $('requestList').innerHTML=(state.requests||[]).slice(0,20).map(r=>`<article><b>${esc(r.display_name||r.login)}</b><span>${esc(r.song)}</span><time>${new Date(r.timestamp).toLocaleString()}</time></article>`).join('')||'<p>No requests yet.</p>';
 document.querySelectorAll('[data-module]').forEach(btn=>btn.onclick=()=>toggleModule(btn.dataset.module,btn.dataset.enabled!=='true'));
}
async function refresh(){if(!token())return out('ADMIN_TOKEN is required');const d=await api('/api/platform/admin/state');out(d);if(d.ok)render(d)}
async function toggleModule(id,enabled){const d=await api('/api/platform/admin/module',{method:'POST',body:JSON.stringify({id,enabled})});out(d);refresh()}
async function rebuild(){if(!token())return out('ADMIN_TOKEN is required');out(await api('/api/platform/admin/rebuild',{method:'POST',body:'{}'}));refresh()}
async function repair(){if(!token())return out('ADMIN_TOKEN is required');out(await api('/api/core/admin/repair',{method:'POST',body:'{}'}));refresh()}
$('refreshPlatform').onclick=refresh;$('rebuildPlatform').onclick=rebuild;$('repairCore').onclick=repair;
